import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LessonStatus {
  /** Generation requested, queued for AI provider */
  QUEUED = 'queued',
  /** AI is currently generating */
  GENERATING = 'generating',
  /** Done by AI, awaiting methodist review */
  PENDING_REVIEW = 'pending_review',
  /** Methodist approved + published */
  PUBLISHED = 'published',
  /** Methodist rejected — back in queue with feedback */
  REJECTED = 'rejected',
  /** Hard-failed during generation */
  FAILED = 'failed',
}

export enum LessonGrade {
  G1 = 1,
  G2 = 2,
  G3 = 3,
  G4 = 4,
  G5 = 5,
  G6 = 6,
  G7 = 7,
  G8 = 8,
  G9 = 9,
  G10 = 10,
  G11 = 11,
}

export enum LessonUmk {
  BOSOVA = 'bosova',
  POLYAKOV = 'polyakov',
  UGRINOVICH = 'ugrinovich',
  SEMAKIN = 'semakin',
  GENERIC = 'generic',
}

export enum LessonFocus {
  BLOCKS = 'blocks',
  PYTHON = 'python',
  WEB = 'web',
  GAME = 'game',
}

/**
 * Lesson entity — metadata for an AI-generated educational unit.
 * The actual content (plan/quiz/script/etc.) lives in lesson_versions
 * (analogous to project_versions) so methodist edits can be reverted.
 */
@Entity('lessons')
@Index(['tenantId', 'status', 'updatedAt'])
@Index(['tenantId', 'topicCode', 'grade'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  /** ФГОС/КЭС-кодификатор: «1.2.3» */
  @Column({ type: 'varchar', length: 32, name: 'topic_code' })
  topicCode!: string;

  @Column({ type: 'int' })
  grade!: number;

  @Column({ type: 'enum', enum: LessonUmk, default: LessonUmk.GENERIC })
  umk!: LessonUmk;

  @Column({ type: 'enum', enum: LessonFocus })
  focus!: LessonFocus;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'enum', enum: LessonStatus, default: LessonStatus.QUEUED })
  status!: LessonStatus;

  @Column({ type: 'uuid', name: 'current_version_id', nullable: true })
  currentVersionId!: string | null;

  /** Methodist (or another admin) responsible for review */
  @Column({ type: 'uuid', name: 'reviewer_id', nullable: true })
  reviewerId!: string | null;

  /** AI provider used: 'anthropic' | 'openai' | 'yandexgpt' | 'mock' */
  @Column({ type: 'varchar', length: 32, name: 'ai_provider', nullable: true })
  aiProvider!: string | null;

  /** Cost in kopecks (rubles*100), used for tenant AI quota tracking */
  @Column({ type: 'int', name: 'ai_cost_kopecks', default: 0 })
  aiCostKopecks!: number;

  @Column({ type: 'int', name: 'generation_seconds', default: 0 })
  generationSeconds!: number;

  /** Free-form last error / methodist feedback */
  @Column({ type: 'text', name: 'last_message', nullable: true })
  lastMessage!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
