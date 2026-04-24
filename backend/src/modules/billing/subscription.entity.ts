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
  /** B2C 290 ₽/мес — main monthly recurring */
  MONTHLY = 'monthly-recurring',
  /** B2C полный курс 72 000 ₽ единоразово */
  COURSE_FULL = 'course-full',
  YEARLY = 'yearly',
  /** B2G — школьная лицензия per-class */
  SCHOOL_PER_CLASS = 'school-per-class',
  /** B2G — региональная лицензия */
  REGIONAL = 'regional',
  /** B2B-WL — partner license */
  WHITELABEL = 'whitelabel',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  /** Pending payment confirmation (ЮKassa async) */
  PENDING = 'pending',
  /** Failed initial payment — retry possible */
  FAILED = 'failed',
}

@Entity('subscriptions')
@Index(['tenantId', 'userId', 'status'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

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

  /** Price in kopecks for this subscription instance (290₽ → 29000) */
  @Column({ type: 'bigint', name: 'price_kopecks', default: 0 })
  priceKopecks!: number;

  /** Payment provider id (ЮKassa payment id, etc.) for reconciliation */
  @Column({ type: 'varchar', length: 128, name: 'provider_payment_id', nullable: true })
  providerPaymentId!: string | null;

  @Column({ type: 'varchar', length: 32, name: 'provider', nullable: true })
  provider!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
