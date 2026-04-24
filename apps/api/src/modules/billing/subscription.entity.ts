import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionPlan {
  TRIAL = 'trial',
  INSTALLMENT_48 = 'installment-48',
  MONTHLY = 'monthly-recurring',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('subscriptions')
@Index(['userId', 'status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'enum', enum: SubscriptionPlan })
  plan!: SubscriptionPlan;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @Column({ type: 'int', name: 'lessons_total', default: 0 })
  lessonsTotal!: number;

  @Column({ type: 'int', name: 'lessons_used', default: 0 })
  lessonsUsed!: number;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'boolean', name: 'auto_renew', default: false })
  autoRenew!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
