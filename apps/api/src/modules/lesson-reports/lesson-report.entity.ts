import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ReportStatus {
  CONDUCTED = 'conducted',
  CANCELLED = 'cancelled',
  TRANSFERRED = 'transferred',
}

@Entity('lesson_reports')
@Index(['teacherId', 'conductedAt'])
@Index(['studentId', 'conductedAt'])
export class LessonReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'slot_id', nullable: true })
  slotId!: string | null;

  @Column({ type: 'uuid', name: 'teacher_id' })
  @Index()
  teacherId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  @Index()
  studentId!: string;

  @Column({ type: 'timestamptz', name: 'conducted_at' })
  conductedAt!: Date;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.CONDUCTED })
  status!: ReportStatus;

  @Column({ type: 'int', nullable: true })
  grade!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', name: 'vk_record_url', nullable: true })
  vkRecordUrl!: string | null;

  @Column({ type: 'boolean', name: 'is_substitute', default: false })
  isSubstitute!: boolean;

  @Column({ type: 'uuid', name: 'substitute_teacher_id', nullable: true })
  substituteTeacherId!: string | null;

  @Column({ type: 'int', name: 'lesson_n', nullable: true })
  lessonN!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
