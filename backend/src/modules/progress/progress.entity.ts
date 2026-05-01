import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProgressEventKind {
  LESSON_SOLVED = 'lesson_solved',
  PUZZLE_SOLVED = 'puzzle_solved',
  COINS_EARNED = 'coins_earned',
  STREAK_TOUCHED = 'streak_touched',
}

@Entity('progress_events')
@Index(['tenantId', 'userId', 'createdAt'])
@Index(['tenantId', 'userId', 'kind'])
export class ProgressEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'enum', enum: ProgressEventKind })
  kind!: ProgressEventKind;

  @Column({ type: 'jsonb', default: '{}' })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;
}

/**
 * Tracks which lessons a teacher has unlocked for a student.
 * One row per (tenant, student, lessonN) — upsert on conflict.
 * lessonN matches the global lesson number (1-96) from the curriculum.
 */
@Entity('lesson_access')
@Index(['tenantId', 'studentId'])
@Index(['tenantId', 'classroomId', 'lessonN'])
@Index(['tenantId', 'studentId', 'lessonN'], { unique: true })
export class LessonAccess {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  /** Global lesson number 1-96 from curriculum */
  @Column({ type: 'int', name: 'lesson_n' })
  lessonN!: number;

  @Column({ type: 'uuid', name: 'classroom_id' })
  classroomId!: string;

  /** Teacher (or admin) who unlocked this lesson */
  @Column({ type: 'uuid', name: 'unlocked_by' })
  unlockedBy!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  /** Best score 0-100, null until completed */
  @Column({ type: 'int', nullable: true })
  score!: number | null;

  @CreateDateColumn({ name: 'unlocked_at' })
  unlockedAt!: Date;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
