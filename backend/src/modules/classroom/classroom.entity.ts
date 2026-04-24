import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('classrooms')
@Index(['tenantId', 'teacherId'])
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'uuid', name: 'teacher_id' })
  teacherId!: string;

  @Column({ type: 'int', name: 'student_count', default: 0 })
  studentCount!: number;

  /**
   * Educational metadata used by Auto-generated logins, AI-pipeline content
   * targeting, and per-classroom analytics. JSONB for flexibility.
   * Typical keys: { grade: 5, parallel: 'А', school: 'МБОУ СОШ №42', umk: 'bosova' }
   */
  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, unknown>;

  /** Optional invite code for teacher-shared join (random 8-char alphanumeric) */
  @Column({ type: 'varchar', length: 32, name: 'invite_code', nullable: true, unique: true })
  inviteCode!: string | null;

  /** Whether the class is archived (school-year ended) — kept for historical reports */
  @Column({ type: 'boolean', name: 'is_archived', default: false })
  isArchived!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
