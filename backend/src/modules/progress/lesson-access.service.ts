import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LessonAccess } from './progress.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { Classroom } from '../classroom/classroom.entity';
import { TenantContext } from '../../common/tenancy/tenant.context';

export interface LessonAccessRow {
  lessonN: number;
  unlocked: boolean;
  completed: boolean;
  score: number | null;
  unlockedAt: Date;
  completedAt: Date | null;
}

export interface ClassroomProgressRow {
  studentId: string;
  studentLogin: string;
  lessons: Record<number, { unlocked: boolean; completed: boolean; score: number | null }>;
}

@Injectable()
export class LessonAccessService {
  constructor(
    @InjectRepository(LessonAccess)
    private accessRepo: Repository<LessonAccess>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Classroom)
    private classroomRepo: Repository<Classroom>,
    private readonly tenantContext: TenantContext,
  ) {}

  /**
   * Unlock a single lesson for a single student.
   * Idempotent — calling again on an already-unlocked lesson is a no-op.
   */
  async unlockLesson(
    teacherId: string,
    studentId: string,
    lessonN: number,
    classroomId: string,
  ): Promise<LessonAccess> {
    const ctx = this.tenantContext.require();
    await this.assertTeacherOwnsClassroom(teacherId, classroomId, ctx.tenantId);
    await this.assertStudentInClassroom(studentId, classroomId, ctx.tenantId);

    const existing = await this.accessRepo.findOne({
      where: { tenantId: ctx.tenantId, studentId, lessonN },
    });
    if (existing) return existing;

    const access = this.accessRepo.create({
      tenantId: ctx.tenantId,
      studentId,
      lessonN,
      classroomId,
      unlockedBy: teacherId,
    });
    return this.accessRepo.save(access);
  }

  /**
   * Bulk-unlock a lesson for multiple students (or all students in classroom).
   * Returns count of newly unlocked rows (skips already-unlocked).
   */
  async unlockBatch(
    teacherId: string,
    classroomId: string,
    lessonN: number,
    studentIds?: string[],
  ): Promise<{ unlocked: number; skipped: number }> {
    const ctx = this.tenantContext.require();
    await this.assertTeacherOwnsClassroom(teacherId, classroomId, ctx.tenantId);

    const targetIds = studentIds?.length
      ? studentIds
      : await this.getClassroomStudentIds(classroomId, ctx.tenantId);

    if (!targetIds.length) return { unlocked: 0, skipped: 0 };

    const existing = await this.accessRepo.find({
      where: { tenantId: ctx.tenantId, studentId: In(targetIds), lessonN },
      select: ['studentId'],
    });
    const alreadyUnlocked = new Set(existing.map((e) => e.studentId));
    const toUnlock = targetIds.filter((id) => !alreadyUnlocked.has(id));

    if (toUnlock.length) {
      const rows = toUnlock.map((studentId) =>
        this.accessRepo.create({
          tenantId: ctx.tenantId,
          studentId,
          lessonN,
          classroomId,
          unlockedBy: teacherId,
        }),
      );
      await this.accessRepo.save(rows, { chunk: 50 });
    }

    return { unlocked: toUnlock.length, skipped: alreadyUnlocked.size };
  }

  /**
   * Mark a lesson as completed by the student themselves.
   * Requires the lesson to already be unlocked.
   */
  async completeLesson(
    studentId: string,
    lessonN: number,
    score?: number,
  ): Promise<LessonAccess> {
    const ctx = this.tenantContext.require();

    const access = await this.accessRepo.findOne({
      where: { tenantId: ctx.tenantId, studentId, lessonN },
    });
    if (!access) {
      throw new ForbiddenException('Lesson not unlocked for this student');
    }

    access.completed = true;
    access.completedAt = access.completedAt ?? new Date();
    if (score !== undefined) {
      if (score < 0 || score > 100) throw new BadRequestException('Score must be 0-100');
      access.score = Math.max(access.score ?? 0, score);
    }
    return this.accessRepo.save(access);
  }

  /**
   * Get all unlocked/completed lessons for the current student.
   */
  async getMyAccess(studentId: string): Promise<LessonAccessRow[]> {
    const ctx = this.tenantContext.require();
    const rows = await this.accessRepo.find({
      where: { tenantId: ctx.tenantId, studentId },
      order: { lessonN: 'ASC' },
    });
    return rows.map((r) => ({
      lessonN: r.lessonN,
      unlocked: true,
      completed: r.completed,
      score: r.score,
      unlockedAt: r.unlockedAt,
      completedAt: r.completedAt,
    }));
  }

  /**
   * Get a full classroom progress matrix for the teacher dashboard.
   * Returns each student with their lesson unlock/completion status.
   */
  async getClassroomProgress(
    classroomId: string,
    teacherId: string,
  ): Promise<ClassroomProgressRow[]> {
    const ctx = this.tenantContext.require();
    await this.assertTeacherOwnsClassroom(teacherId, classroomId, ctx.tenantId);

    const students = await this.userRepo.find({
      where: { classroomId, role: UserRole.CHILD, tenantId: ctx.tenantId },
      select: ['id', 'login'],
    });

    if (!students.length) return [];

    const studentIds = students.map((s) => s.id);
    const accessRows = await this.accessRepo.find({
      where: { tenantId: ctx.tenantId, studentId: In(studentIds) },
    });

    const byStudent = new Map<string, Map<number, LessonAccess>>();
    for (const row of accessRows) {
      if (!byStudent.has(row.studentId)) byStudent.set(row.studentId, new Map());
      byStudent.get(row.studentId)!.set(row.lessonN, row);
    }

    return students.map((student) => {
      const lessonMap = byStudent.get(student.id) ?? new Map<number, LessonAccess>();
      const lessons: Record<number, { unlocked: boolean; completed: boolean; score: number | null }> = {};
      for (const [lessonN, access] of lessonMap) {
        lessons[lessonN] = {
          unlocked: true,
          completed: access.completed,
          score: access.score,
        };
      }
      return { studentId: student.id, studentLogin: student.login, lessons };
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async assertTeacherOwnsClassroom(
    teacherId: string,
    classroomId: string,
    tenantId: string,
  ): Promise<void> {
    const classroom = await this.classroomRepo.findOne({
      where: { id: classroomId, tenantId },
      select: ['teacherId'],
    });
    if (!classroom) throw new NotFoundException('Classroom not found');
    if (classroom.teacherId !== teacherId) throw new ForbiddenException('Not your classroom');
  }

  private async assertStudentInClassroom(
    studentId: string,
    classroomId: string,
    tenantId: string,
  ): Promise<void> {
    const student = await this.userRepo.findOne({
      where: { id: studentId, classroomId, tenantId, role: UserRole.CHILD },
      select: ['id'],
    });
    if (!student) throw new ForbiddenException('Student not in this classroom');
  }

  private async getClassroomStudentIds(
    classroomId: string,
    tenantId: string,
  ): Promise<string[]> {
    const students = await this.userRepo.find({
      where: { classroomId, role: UserRole.CHILD, tenantId },
      select: ['id'],
    });
    return students.map((s) => s.id);
  }
}
