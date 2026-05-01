import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  CHILD = 'child',
  PARENT = 'parent',
  TEACHER = 'teacher',
}

@Entity('users')
@Index(['role', 'isActive'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  login!: string;

  @Column({ type: 'text', name: 'password_hash' })
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

  /** CRM record URL for admin tracking */
  @Column({ type: 'text', name: 'crm_url', nullable: true })
  crmUrl!: string | null;

  /** Learning track: python | scratch | vibe */
  @Column({ type: 'varchar', length: 32, nullable: true })
  track!: string | null;

  /** Parent contact for notifications */
  @Column({ type: 'varchar', length: 32, name: 'parent_phone', nullable: true })
  parentPhone!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'parent_email', nullable: true })
  parentEmail!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
