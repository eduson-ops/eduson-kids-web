import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('lesson_access')
@Index(['studentId', 'lessonN'], { unique: true })
export class LessonAccess {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  @Index()
  studentId!: string;

  @Column({ type: 'int', name: 'lesson_n' })
  lessonN!: number;

  @Column({ type: 'boolean', default: true })
  unlocked!: boolean;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({ type: 'int', nullable: true })
  score!: number | null;

  @CreateDateColumn({ name: 'unlocked_at' })
  unlockedAt!: Date;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroomId!: string | null;
}
