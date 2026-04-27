import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ProgressEventKind {
  LESSON_SOLVED = 'lesson_solved',
  PUZZLE_SOLVED = 'puzzle_solved',
  COINS_EARNED = 'coins_earned',
  STREAK_TOUCHED = 'streak_touched',
}

@Entity('progress_events')
@Index(['userId', 'createdAt'])
@Index(['userId', 'kind'])
export class ProgressEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
