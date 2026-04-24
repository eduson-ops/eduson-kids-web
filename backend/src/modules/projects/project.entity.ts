import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProjectType {
  /** 3D-сценарий в Studio (game/world) */
  GAME = 'game',
  /** HTML-сайт через Site Editor */
  SITE = 'site',
  /** Чистый Python-скрипт (вне сцены) */
  PYTHON = 'python',
  /** Уровень-капстон (M1-M8) — связан с курикулумом */
  CAPSTONE = 'capstone',
  /** EGE-тренажёр */
  EGE = 'ege',
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  /** Доступ по share-link (текущая модель платформы) */
  UNLISTED = 'unlisted',
  /** В публичной галерее (ТОЛЬКО после премодерации) */
  PUBLIC = 'public',
  /** Шарится в рамках класса (учитель + одноклассники видят) */
  CLASSROOM = 'classroom',
}

/**
 * Project — родительская сущность для пользовательского творчества.
 * Сам контент живёт в `ProjectVersion`, чтобы поддерживать историю / undo /
 * Ctrl-Z и ограничения хранилища (rolling window).
 *
 * Tenant-scoped. Privacy enforced by RLS + WhereGuard.
 */
@Entity('projects')
@Index(['tenantId', 'ownerId', 'updatedAt'])
@Index(['tenantId', 'classroomId', 'updatedAt'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  @Index()
  ownerId!: string;

  /** Опционально — для классных заданий и share-в-класс */
  @Column({ type: 'uuid', name: 'classroom_id', nullable: true })
  classroomId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: ProjectType })
  type!: ProjectType;

  @Column({ type: 'enum', enum: ProjectVisibility, default: ProjectVisibility.PRIVATE })
  visibility!: ProjectVisibility;

  /**
   * Указатель на текущую (latest) версию. Для production-чтений мы загружаем
   * сразу версию, не Project. Это поле — оптимизация (1 join вместо ORDER BY).
   */
  @Column({ type: 'uuid', name: 'current_version_id', nullable: true })
  currentVersionId!: string | null;

  /** Кэшированный размер последней версии для быстрого расчёта квот */
  @Column({ type: 'int', name: 'current_size_bytes', default: 0 })
  currentSizeBytes!: number;

  /** Сводная статистика — кол-во сохранённых версий, downloads, plays */
  @Column({ type: 'jsonb', default: '{}' })
  stats!: Record<string, number>;

  /** Опционально — share token для unlisted-режима */
  @Column({ type: 'varchar', length: 64, name: 'share_token', nullable: true })
  shareToken!: string | null;

  /** Soft delete для recovery в течение 30 дней */
  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
