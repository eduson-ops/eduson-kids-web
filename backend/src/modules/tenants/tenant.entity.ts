import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Default tenant ID — used for backwards compat for all data
 * created before multitenancy was introduced. Hardcoded in the AddMultitenancy
 * migration so any new connection can fall back to it cleanly.
 */
export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_TENANT_SLUG = 'edusonkids';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum TenantTier {
  /** Default tenant — baseline platform */
  CORE = 'core',
  /** Free pilot for 30–90 days */
  PILOT = 'pilot',
  /** B2C subscription paying customers (single household tenant) */
  B2C = 'b2c',
  /** Single school B2G */
  SCHOOL = 'school',
  /** Municipal contract — many schools */
  MUNICIPAL = 'municipal',
  /** Regional contract — many municipalities */
  REGIONAL = 'regional',
  /** White-label partner with full brand customization */
  WHITELABEL = 'whitelabel',
}

@Entity('tenants')
@Index(['status'])
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** url-safe slug, used as subdomain ({slug}.kubik.school) and in JWT */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status!: TenantStatus;

  @Column({ type: 'enum', enum: TenantTier, default: TenantTier.B2C })
  tier!: TenantTier;

  /** Optional custom domain for white-label tenants */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'custom_domain' })
  customDomain!: string | null;

  /** Brand customization — colors, logo URL, font, etc. JSON */
  @Column({ type: 'jsonb', default: '{}' })
  branding!: Record<string, unknown>;

  /** Per-tenant feature flags */
  @Column({ type: 'jsonb', default: '{}', name: 'feature_flags' })
  featureFlags!: Record<string, boolean>;

  /** Quota limits — { maxStudents, maxStorageMb, maxClasses, ... } */
  @Column({ type: 'jsonb', default: '{}' })
  quotas!: Record<string, number>;

  /** Parent tenant — for hierarchical setups (region → municipality → school) */
  @Column({ type: 'uuid', nullable: true, name: 'parent_tenant_id' })
  parentTenantId!: string | null;

  /** Optional contact info, billing email, etc. encrypted JSON */
  @Column({ type: 'text', name: 'encrypted_contact', nullable: true })
  encryptedContact!: string | null;

  @Column({ type: 'text', name: 'contact_iv', nullable: true })
  contactIv!: string | null;

  @Column({ type: 'text', name: 'contact_auth_tag', nullable: true })
  contactAuthTag!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
