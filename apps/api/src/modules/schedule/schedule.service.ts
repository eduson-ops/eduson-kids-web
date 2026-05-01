import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { ScheduleSlot, SlotStatus, SlotType } from './schedule-slot.entity';

export interface CreateSlotDto {
  teacherId: string;
  studentId?: string;
  classroomId?: string;
  datetime: string;
  durationMin?: number;
  type?: SlotType;
  zoomLink?: string;
  notes?: string;
}

export interface SlotDto {
  id: string;
  teacherId: string;
  studentId: string | null;
  classroomId: string | null;
  datetime: string;
  durationMin: number;
  type: SlotType;
  status: SlotStatus;
  zoomLink: string | null;
  notes: string | null;
  rescheduledToId: string | null;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleSlot)
    private readonly repo: Repository<ScheduleSlot>,
  ) {}

  async create(dto: CreateSlotDto): Promise<SlotDto> {
    const slot = this.repo.create({
      teacherId: dto.teacherId,
      studentId: dto.studentId ?? null,
      classroomId: dto.classroomId ?? null,
      datetime: new Date(dto.datetime),
      durationMin: dto.durationMin ?? 60,
      type: dto.type ?? SlotType.REGULAR,
      zoomLink: dto.zoomLink ?? null,
      notes: dto.notes ?? null,
    });
    return this.toDto(await this.repo.save(slot));
  }

  async getMySlots(userId: string, role: string): Promise<SlotDto[]> {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const isTeacher = ['teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin'].includes(role);

    const slots = await this.repo.find({
      where: isTeacher
        ? { teacherId: userId, datetime: MoreThanOrEqual(since) }
        : { studentId: userId, datetime: MoreThanOrEqual(since) },
      order: { datetime: 'ASC' },
    });

    return slots.map(this.toDto);
  }

  async getClassroomSlots(classroomId: string): Promise<SlotDto[]> {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const until = new Date();
    until.setDate(until.getDate() + 60);

    const slots = await this.repo.find({
      where: { classroomId, datetime: Between(since, until) },
      order: { datetime: 'ASC' },
    });
    return slots.map(this.toDto);
  }

  async getAllSlots(from?: Date, to?: Date): Promise<SlotDto[]> {
    const since = from ?? new Date(Date.now() - 7 * 86400_000);
    const until = to ?? new Date(Date.now() + 60 * 86400_000);
    const slots = await this.repo.find({
      where: { datetime: Between(since, until) },
      order: { datetime: 'ASC' },
    });
    return slots.map(this.toDto);
  }

  async updateStatus(
    slotId: string,
    actorId: string,
    actorRole: string,
    status: SlotStatus,
    rescheduledTo?: string,
  ): Promise<SlotDto> {
    const slot = await this.repo.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');

    const isAdmin = ['admin', 'platform_admin', 'school_admin', 'curator'].includes(actorRole);
    if (!isAdmin && slot.teacherId !== actorId) {
      throw new ForbiddenException('Not your slot');
    }

    slot.status = status;
    if (rescheduledTo) {
      slot.rescheduledToId = rescheduledTo;
    }

    return this.toDto(await this.repo.save(slot));
  }

  async updateSlot(
    slotId: string,
    actorId: string,
    actorRole: string,
    patch: Partial<CreateSlotDto>,
  ): Promise<SlotDto> {
    const slot = await this.repo.findOne({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot not found');

    const isAdmin = ['admin', 'platform_admin', 'school_admin', 'curator'].includes(actorRole);
    if (!isAdmin && slot.teacherId !== actorId) {
      throw new ForbiddenException('Not your slot');
    }

    if (patch.datetime) slot.datetime = new Date(patch.datetime);
    if (patch.durationMin !== undefined) slot.durationMin = patch.durationMin;
    if (patch.zoomLink !== undefined) slot.zoomLink = patch.zoomLink;
    if (patch.notes !== undefined) slot.notes = patch.notes;
    if (patch.studentId !== undefined) slot.studentId = patch.studentId;

    return this.toDto(await this.repo.save(slot));
  }

  private toDto(s: ScheduleSlot): SlotDto {
    return {
      id: s.id,
      teacherId: s.teacherId,
      studentId: s.studentId,
      classroomId: s.classroomId,
      datetime: s.datetime.toISOString(),
      durationMin: s.durationMin,
      type: s.type,
      status: s.status,
      zoomLink: s.zoomLink,
      notes: s.notes,
      rescheduledToId: s.rescheduledToId,
    };
  }
}
