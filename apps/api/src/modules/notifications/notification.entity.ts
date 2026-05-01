import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type NotificationType =
  | 'lesson_reminder_24h'
  | 'lesson_reminder_1h'
  | 'lesson_cancelled'
  | 'substitution'
  | 'renewal_alert'
  | 'general';

@Entity('notifications')
@Index(['userId', 'read'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ name: 'slot_id', type: 'uuid', nullable: true })
  slotId!: string | null;

  @Column({ name: 'dedup_key', type: 'varchar', length: 128, nullable: true, unique: true })
  dedupKey!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
