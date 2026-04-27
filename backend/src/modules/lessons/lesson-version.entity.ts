import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LessonVersionSource {
  AI_INITIAL = 'ai_initial',
  AI_REGENERATE = 'ai_regenerate',
  METHODIST_EDIT = 'methodist_edit',
  ROLLBACK = 'rollback',
}

/**
 * Snapshot of lesson content. Full payload — plan, slides, methodichka,
 * quiz, homework, video script, asset list — lives in `payload` JSONB.
 *
 * Schema of payload (informal):
 * {
 *   plan: { steps: [{ title, durationMin, description }] },
 *   slides: [{ title, body, imagePromptKey }],
 *   teacherGuide: string (markdown),
 *   quiz: [{ question, options, correctIndex }],
 *   homework: { description, autograder },
 *   videoScript: { scenes: [{ caption, voice, characterId, durationS }] },
 *   assets: [{ kind: '3d'|'image'|'sprite', source: 'meshy'|'kandinsky'|'procedural', spec }],
 *   meta: { tokensUsed, model, costKopecks }
 * }
 */
@Entity('lesson_versions')
@Index(['tenantId', 'lessonId', 'sequence'], { unique: true })
@Index(['tenantId', 'lessonId', 'createdAt'])
export class LessonVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'lesson_id' })
  @Index()
  lessonId!: string;

  @Column({ type: 'int' })
  sequence!: number;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'enum', enum: LessonVersionSource })
  source!: LessonVersionSource;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @Column({ type: 'text', name: 'note', nullable: true })
  note!: string | null;

  /**
   * Raw provider response (Anthropic /v1/messages JSON body) — captured for
   * audit + reproducibility. NULL for non-AI sources (methodist edits,
   * rollbacks). Truncated to ~64KB by the provider before persistence.
   */
  @Column({ type: 'jsonb', name: 'provider_response_raw', nullable: true })
  providerResponseRaw!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
