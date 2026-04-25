/**
 * Provider abstraction for the AI content-factory.
 *
 * Implementations live in `providers/`:
 *   - anthropic.provider.ts (Claude Opus 4.7 with prompt caching)
 *   - openai.provider.ts (GPT-5 fallback)
 *   - yandexgpt.provider.ts (sovereignty mode for B2G)
 *   - mock.provider.ts (deterministic stub for tests + overnight)
 *
 * Selection happens at runtime via tenant feature_flags or environment
 * variable AI_PROVIDER. See AiPipelineService.
 */

export interface LessonGenerationInput {
  topicCode: string; // ФГОС КЭС
  grade: number;
  umk: string;
  focus: 'blocks' | 'python' | 'web' | 'game';
  lessonMinutes?: number;
  bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'create';
  styleHints?: Record<string, unknown>;
}

export interface LessonGenerationOutput {
  title: string;
  payload: {
    plan: { steps: { title: string; durationMin: number; description: string }[] };
    teacherGuide: string;
    quiz: { question: string; options: string[]; correctIndex: number }[];
    homework: { description: string; autograder?: Record<string, unknown> };
    videoScript?: { scenes: { caption: string; voice: string; characterId: string; durationS: number }[] };
    assets?: { kind: '3d' | 'image' | 'sprite'; source: string; spec: Record<string, unknown> }[];
    meta: { provider: string; model?: string; tokensUsed?: number; costKopecks?: number };
  };
  costKopecks: number;
  generationSeconds: number;
  /**
   * Raw provider response (full JSON body) for audit + debug. Persisted on
   * `lesson_versions.provider_response_raw`. May be truncated to 64KB to
   * limit storage cost / PII leak surface — see AnthropicProvider.
   */
  rawResponse?: Record<string, unknown>;
}

export interface AiProvider {
  readonly name: string;
  generateLesson(input: LessonGenerationInput): Promise<LessonGenerationOutput>;
}
