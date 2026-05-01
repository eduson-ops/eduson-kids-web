import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Roles cover three families:
 *   - End-users (CHILD, PARENT)
 *   - School-side (TEACHER, METHODIST, CURATOR, SCHOOL_ADMIN)
 *   - Platform / hierarchy (REGIONAL_ADMIN, PLATFORM_ADMIN)
 *
 * Role hierarchy (RBAC implication):
 *   PLATFORM_ADMIN  > REGIONAL_ADMIN > SCHOOL_ADMIN > CURATOR > TEACHER > METHODIST > PARENT > CHILD
 *
 * METHODIST is intentionally restricted: can ONLY use AI-generation endpoints
 * within their tenant, cannot export prompts/code/raw AI artifacts.
 * See `admin.guard.ts` for enforcement.
 */
export enum UserRole {
  CHILD = 'child',
  PARENT = 'parent',
  TEACHER = 'teacher',
  METHODIST = 'methodist',
  CURATOR = 'curator',
  SCHOOL_ADMIN = 'school_admin',
  REGIONAL_ADMIN = 'regional_admin',
  PLATFORM_ADMIN = 'platform_admin',
}

/**
 * External-identity links — populated when user signs up / connects through
 * an external auth provider. Stored as a JSONB blob to avoid one-column-per-
 * provider sprawl. Keys are well-known provider slugs.
 */
export interface UserExternalIds {
  vk?: string;       // VK ID (id.vk.com)
  sferum?: string;   // Сферум (Mail.ru/VK Edu)
  esia?: string;     // Госуслуги ОИД
  yandex?: string;   // Яндекс ID
  google?: string;   // Google (deprecated for prod, may exist for migrated test data)
}

@Entity('users')
@Index(['tenantId', 'role', 'isActive'])
@Index(['tenantId', 'login'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Tenant scope. Default tenant for legacy single-tenant data; populated
   * from the active TenantContext on insert via TenantSubscriber.
   */
  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255 })
  login!: string;

  @Column({ type: 'text', name: 'password_hash', select: false })
  passwordHash!: string;

  /** AES-256-GCM encrypted JSON: { firstName, lastName, email?, birthYear?, ... } */
  @Column({ type: 'text', name: 'encrypted_profile', nullable: true })
  encryptedProfile!: string | null;

  @Column({ type: 'text', name: 'profile_iv', nullable: true })
  profileIv!: string | null;

  @Column({ type: 'text', name: 'profile_auth_tag', nullable: true })
  profileAuthTag!: string | null;

  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroomId!: string | null;

  /** For parent — linked child IDs */
  @Column({ type: 'simple-array', name: 'linked_child_ids', nullable: true })
  linkedChildIds!: string[] | null;

  /**
   * External identity provider links — VK, Сферум, ЕСИА, Яндекс. Sparse JSON.
   * Indexed via partial GIN for lookups by external id (see migration).
   */
  @Column({ type: 'jsonb', name: 'external_ids', default: '{}' })
  externalIds!: UserExternalIds;

  /**
   * Parental consent under 152-ФЗ for users <14. Required to activate the
   * account. Stored as ISO timestamp of consent OR null when not given /
   * not yet collected.
   */
  @Column({ type: 'timestamptz', name: 'parental_consent_at', nullable: true })
  parentalConsentAt!: Date | null;

  /** Optional: id of the parent that gave consent — for audit + revocation */
  @Column({ type: 'uuid', name: 'parental_consent_by', nullable: true })
  parentalConsentBy!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
