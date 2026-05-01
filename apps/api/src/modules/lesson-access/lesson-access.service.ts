import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LessonAccess } from './lesson-access.entity';
import { User } from '../auth/entities/user.entity';

export interface LessonAccessRow {
  lessonN: number;
  unlocked: boolean;
  completed: boolean;
  score: number | null;
  unlockedAt: string;
  completedAt: string | null;
}

export interface ClassroomProgressStudent {
  studentId: string;
  studentLogin: string;
  lessons: Record<number, { unlocked: boolean; completed: boolean; score: number | null }>;
}

export interface UnlockResult {
  unlocked: number;
  skipped: number;
}

@Injectable()
export class LessonAccessService {
  constructor(
    @InjectRepository(LessonAccess)
    private readonly repo: Repository<LessonAccess>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getMyAccess(userId: string): Promise<LessonAccessRow[]> {
    const rows = await this.repo.find({
      where: { studentId: userId, unlocked: true },
      order: { lessonN: 'ASC' },
    });
    return rows.map(this.toRow);
  }

  async unlock(payload: {
    studentId: string;
    lessonN: number;
    classroomId?: string;
    teacherId: string;
  }): Promise<LessonAccessRow> {
    let row = await this.repo.findOne({
      where: { studentId: payload.studentId, lessonN: payload.lessonN },
    });

    if (!row) {
      row = this.repo.create({
        studentId: payload.studentId,
        lessonN: payload.lessonN,
        unlocked: true,
        completed: false,
        classroomId: payload.classroomId ?? null,
      });
    } else {
      row.unlocked = true;
      if (payload.classroomId) row.classroomId = payload.classroomId;
    }

    return this.toRow(await this.repo.save(row));
  }

  async unlockBatch(payload: {
    classroomId: string;
    lessonN: number;
    studentIds?: string[];
    teacherId: string;
  }): Promise<UnlockResult> {
    const students = payload.studentIds?.length
      ? await this.userRepo.findBy({ id: In(payload.studentIds) })
      : await this.userRepo.find({ where: { classroomId: payload.classroomId, isActive: true } });

    let unlocked = 0;
    let skipped = 0;

    for (const student of students) {
      const existing = await this.repo.findOne({
        where: { studentId: student.id, lessonN: payload.lessonN, unlocked: true },
      });
      if (existing) {
        skipped++;
        continue;
      }
      let row = await this.repo.findOne({
        where: { studentId: student.id, lessonN: payload.lessonN },
      });
      if (!row) {
        row = this.repo.create({
          studentId: student.id,
          lessonN: payload.lessonN,
          classroomId: payload.classroomId,
        });
      } else {
        row.unlocked = true;
      }
      await this.repo.save(row);
      unlocked++;
    }

    return { unlocked, skipped };
  }

  async complete(userId: string, lessonN: number, score?: number): Promise<LessonAccessRow> {
    let row = await this.repo.findOne({ where: { studentId: userId, lessonN } });

    if (!row) {
      row = this.repo.create({ studentId: userId, lessonN, unlocked: true });
    }

    row.completed = true;
    row.completedAt = new Date();
    if (score !== undefined) row.score = score;

    return this.toRow(await this.repo.save(row));
  }

  async getClassroomProgress(classroomId: string): Promise<ClassroomProgressStudent[]> {
    const students = await this.userRepo.find({
      where: { classroomId, isActive: true },
      order: { login: 'ASC' },
    });

    if (students.length === 0) return [];

    const studentIds = students.map((s) => s.id);
    const rows = await this.repo.find({
      where: { studentId: In(studentIds), unlocked: true },
    });

    const byStudent = new Map<string, Record<number, { unlocked: boolean; completed: boolean; score: number | null }>>();
    for (const s of students) {
      byStudent.set(s.id, {});
    }

    for (const row of rows) {
      const map = byStudent.get(row.studentId);
      if (map) {
        map[row.lessonN] = { unlocked: row.unlocked, completed: row.completed, score: row.score };
      }
    }

    return students.map((s) => ({
      studentId: s.id,
      studentLogin: s.login,
      lessons: byStudent.get(s.id) ?? {},
    }));
  }

  async verifyTeacherOwnsClassroom(teacherId: string, classroomId: string, role: string): Promise<void> {
    if (['admin', 'platform_admin', 'school_admin', 'curator'].includes(role)) return;

    const { Classroom } = await import('../classroom/classroom.entity');
    const classroomRepo = this.repo.manager.getRepository(Classroom);
    const classroom = await classroomRepo.findOne({ where: { id: classroomId } });
    if (!classroom || classroom.teacherId !== teacherId) {
      throw new ForbiddenException('Not your classroom');
    }
  }

  private toRow(r: LessonAccess): LessonAccessRow {
    return {
      lessonN: r.lessonN,
      unlocked: r.unlocked,
      completed: r.completed,
      score: r.score,
      unlockedAt: r.unlockedAt.toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    };
  }
}
