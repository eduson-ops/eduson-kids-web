/**
 * BullMQ queue name for AI lesson generation.
 *
 * Used by both the producer (AiPipelineService.submit) and the consumer
 * (LessonJobProcessor). Keep in one place so a typo can't desync them.
 */
export const LESSON_QUEUE_NAME = 'ai-lessons';

export const LESSON_GENERATE_JOB = 'generate';

export interface LessonJobData {
  lessonId: string;
  requesterId: string;
  tenantId: string;
  /** Serialised LessonGenerationInput — BullMQ stores as JSON in Redis. */
  input: {
    topicCode: string;
    grade: number;
    umk: string;
    focus: 'blocks' | 'python' | 'web' | 'game';
    lessonMinutes?: number;
    bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'create';
    styleHints?: Record<string, unknown>;
  };
}
