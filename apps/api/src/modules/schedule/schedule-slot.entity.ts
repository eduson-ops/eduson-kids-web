import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SlotType {
  REGULAR = 'regular',
  TRIAL = 'trial',
  MAKEUP = 'makeup',
}

export enum SlotStatus {
  SCHEDULED = 'scheduled',
  CONDUCTED = 'conducted',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

@Entity('schedule_slots')
@Index(['teacherId', 'datetime'])
@Index(['studentId', 'datetime'])
export class ScheduleSlot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'teacher_id' })
  @Index()
  teacherId!: string;

  @Column({ type: 'uuid', name: 'student_id', nullable: true })
  studentId!: string | null;

  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroomId!: string | null;

  @Column({ type: 'timestamptz' })
  datetime!: Date;

  @Column({ type: 'int', name: 'duration_min', default: 60 })
  durationMin!: number;

  @Column({ type: 'enum', enum: SlotType, default: SlotType.REGULAR })
  type!: SlotType;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.SCHEDULED })
  status!: SlotStatus;

  @Column({ type: 'uuid', name: 'rescheduled_to_id', nullable: true })
  rescheduledToId!: string | null;

  @Column({ type: 'text', name: 'zoom_link', nullable: true })
  zoomLink!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
