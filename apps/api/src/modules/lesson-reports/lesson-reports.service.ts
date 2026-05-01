import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonReport, ReportStatus } from './lesson-report.entity';

export interface CreateReportDto {
  slotId?: string;
  studentId: string;
  conductedAt: string;
  status: ReportStatus;
  grade?: number;
  notes?: string;
  vkRecordUrl?: string;
  isSubstitute?: boolean;
  substituteTeacherId?: string;
  lessonN?: number;
}

export interface ReportDto {
  id: string;
  slotId: string | null;
  teacherId: string;
  studentId: string;
  conductedAt: string;
  status: ReportStatus;
  grade: number | null;
  notes: string | null;
  vkRecordUrl: string | null;
  isSubstitute: boolean;
  substituteTeacherId: string | null;
  lessonN: number | null;
  createdAt: string;
}

@Injectable()
export class LessonReportsService {
  constructor(
    @InjectRepository(LessonReport)
    private readonly repo: Repository<LessonReport>,
  ) {}

  async create(teacherId: string, dto: CreateReportDto): Promise<ReportDto> {
    const report = this.repo.create({
      slotId: dto.slotId ?? null,
      teacherId: dto.isSubstitute && dto.substituteTeacherId ? dto.substituteTeacherId : teacherId,
      studentId: dto.studentId,
      conductedAt: new Date(dto.conductedAt),
      status: dto.status,
      grade: dto.grade ?? null,
      notes: dto.notes ?? null,
      vkRecordUrl: dto.vkRecordUrl ?? null,
      isSubstitute: dto.isSubstitute ?? false,
      substituteTeacherId: dto.substituteTeacherId ?? null,
      lessonN: dto.lessonN ?? null,
    });
    return this.toDto(await this.repo.save(report));
  }

  async getByTeacher(teacherId: string, role: string): Promise<ReportDto[]> {
    const isAdmin = ['admin', 'platform_admin', 'school_admin', 'curator'].includes(role);
    const where = isAdmin ? {} : { teacherId };
    const reports = await this.repo.find({ where, order: { conductedAt: 'DESC' }, take: 200 });
    return reports.map(this.toDto);
  }

  async getByStudent(studentId: string, requesterId: string, requesterRole: string): Promise<ReportDto[]> {
    const isAdmin = ['admin', 'platform_admin', 'school_admin', 'curator', 'teacher'].includes(requesterRole);
    if (!isAdmin && requesterId !== studentId) {
      throw new ForbiddenException('Access denied');
    }
    const reports = await this.repo.find({
      where: { studentId },
      order: { conductedAt: 'DESC' },
    });
    return reports.map(this.toDto);
  }

  private toDto(r: LessonReport): ReportDto {
    return {
      id: r.id,
      slotId: r.slotId,
      teacherId: r.teacherId,
      studentId: r.studentId,
      conductedAt: r.conductedAt.toISOString(),
      status: r.status,
      grade: r.grade,
      notes: r.notes,
      vkRecordUrl: r.vkRecordUrl,
      isSubstitute: r.isSubstitute,
      substituteTeacherId: r.substituteTeacherId,
      lessonN: r.lessonN,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
