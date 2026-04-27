import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum VersionSource {
  /** Auto-save через debounce timer */
  AUTOSAVE = 'autosave',
  /** Manual save (Ctrl-S, кнопка) */
  MANUAL = 'manual',
  /** После rollback к предыдущей версии */
  ROLLBACK = 'rollback',
  /** Импорт из share-link */
  IMPORT = 'import',
  /** Восстановление из template / capstone заготовки */
  TEMPLATE = 'template',
}

/**
 * Снимок состояния проекта. Растёт rolling window (последние N версий
 * per project — настройка в ProjectsService).
 *
 * `contentJson` — JSONB blob с полным состоянием: blocks/code/scene/site.
 * Размер ограничен tenantQuotas.maxStorageMb совокупно.
 *
 * `sizeBytes` — точный размер сериализованного контента, кэшируется
 * для быстрого quota-check без regex-парсинга JSON.
 */
@Entity('project_versions')
@Index(['tenantId', 'projectId', 'sequence'], { unique: true })
@Index(['tenantId', 'projectId', 'createdAt'])
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'project_id' })
  @Index()
  projectId!: string;

  /** Монотонно растущий номер версии в рамках проекта (1, 2, 3, ...) */
  @Column({ type: 'int' })
  sequence!: number;

  /** Полное состояние проекта */
  @Column({ type: 'jsonb', name: 'content_json' })
  contentJson!: Record<string, unknown>;

  @Column({ type: 'int', name: 'size_bytes' })
  sizeBytes!: number;

  @Column({ type: 'enum', enum: VersionSource, default: VersionSource.AUTOSAVE })
  source!: VersionSource;

  /** Опциональная подпись: «фикс багов», «после урока 5», ... */
  @Column({ type: 'varchar', length: 255, name: 'note', nullable: true })
  note!: string | null;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
