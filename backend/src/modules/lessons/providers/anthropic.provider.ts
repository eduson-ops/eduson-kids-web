import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  LessonGenerationInput,
  LessonGenerationOutput,
} from './ai-provider.interface';

/**
 * Claude (Anthropic) provider implementation skeleton.
 *
 * Status: implementation-ready but DEFAULT-OFF — guarded by env var
 *   AI_PROVIDER=anthropic
 *   ANTHROPIC_API_KEY=...
 *
 * If either is missing, AiPipelineService falls back to MockAiProvider.
 *
 * The skeleton implements the wire format for /v1/messages with prompt
 * caching enabled on the system prompt — an important cost optimization
 * for our content factory because we send the same multi-thousand-token
 * platform context (block API spec, ФГОС format, character library) on
 * every lesson generation.
 *
 * Cost model (rough, will be replaced once we get real per-tenant
 * billing integration):
 *   - Input  ≈ 0.5 RUB per 1K tokens (cached: 0.05 RUB)
 *   - Output ≈ 2.0 RUB per 1K tokens
 *   - 1 RUB = 100 kopecks
 *
 * NOTE: production hardening needed before flipping the flag (see
 * "Still TODO" comments below).
 */
@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';

  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly apiVersion = '2023-06-01';
  private readonly model = 'claude-opus-4-7';

  constructor(private readonly config: ConfigService) {}

  /**
   * Lazy access — env may not be set in non-prod. We only blow up when
   * generateLesson() actually fires.
   */
  private getApiKey(): string {
    const key = this.config.get<string>('ANTHROPIC_API_KEY') ?? process.env['ANTHROPIC_API_KEY'];
    if (!key || key.trim().length === 0) {
      throw new Error(
        'ANTHROPIC_API_KEY not configured — set it in env or fall back to AI_PROVIDER=mock',
      );
    }
    return key;
  }

  /**
   * Static, cacheable system prompt. Anthropic's prompt cache key is the
   * exact byte-string up to (and including) any cache_control marker, so
   * keep this string stable.
   */
  private buildSystemPrompt(): string {
    return [
      'Ты — методист цифровой школы KubiK / Eduson Kids.',
      'Твоя задача — генерировать урок информатики для российской школы',
      'строго в формате ФГОС (личностные/метапредметные/предметные цели,',
      'структура урока 5 этапов, критерии оценивания).',
      '',
      'Ограничения платформы:',
      '- Дети 7–17 лет, контент должен быть безопасным (152-ФЗ).',
      '- Урок 40 минут (по умолчанию). 5 шагов: Введение / Объяснение / Практика / Закрепление / ДЗ.',
      '- Среда программирования — блочный редактор Blockly с базовым API:',
      '  set_pixel(x, y, color), move_to(x, y), wait(ms), on_event(name, fn).',
      '- Запрещено: внешние сетевые запросы, привязки к конкретным брендам, реклама.',
      '',
      'Формат ответа: ровно один JSON-объект, соответствующий схеме',
      'tool generate_lesson. Никаких пояснений до или после JSON.',
    ].join('\n');
  }

  /**
   * Anthropic-style "tool use" response gives us a guaranteed JSON schema.
   * We declare a single tool the model MUST call — that's our structured
   * output channel.
   */
  private buildTool() {
    return {
      name: 'generate_lesson',
      description: 'Output a complete lesson payload for the KubiK platform.',
      input_schema: {
        type: 'object',
        required: ['title', 'plan', 'teacherGuide', 'quiz', 'homework'],
        properties: {
          title: { type: 'string', maxLength: 255 },
          plan: {
            type: 'object',
            required: ['steps'],
            properties: {
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['title', 'durationMin', 'description'],
                  properties: {
                    title: { type: 'string' },
                    durationMin: { type: 'integer', minimum: 1, maximum: 60 },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          teacherGuide: { type: 'string' },
          quiz: {
            type: 'array',
            items: {
              type: 'object',
              required: ['question', 'options', 'correctIndex'],
              properties: {
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correctIndex: { type: 'integer', minimum: 0 },
              },
            },
          },
          homework: {
            type: 'object',
            required: ['description'],
            properties: {
              description: { type: 'string' },
              autograder: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    };
  }

  private buildUserMessage(input: LessonGenerationInput): string {
    return [
      `Сгенерируй урок:`,
      `- Тема (КЭС ФГОС): ${input.topicCode}`,
      `- Класс: ${input.grade}`,
      `- УМК: ${input.umk}`,
      `- Фокус: ${input.focus}`,
      `- Длительность: ${input.lessonMinutes ?? 40} мин`,
      input.bloomLevel ? `- Уровень Bloom: ${input.bloomLevel}` : '',
      `Вызови инструмент generate_lesson с заполненным JSON.`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async generateLesson(input: LessonGenerationInput): Promise<LessonGenerationOutput> {
    const apiKey = this.getApiKey(); // throws clearly if missing
    const start = Date.now();

    const body = {
      model: this.model,
      max_tokens: 4096,
      tools: [this.buildTool()],
      tool_choice: { type: 'tool', name: 'generate_lesson' },
      // System prompt as array form so we can attach cache_control markers.
      system: [
        {
          type: 'text',
          text: this.buildSystemPrompt(),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: this.buildUserMessage(input),
        },
      ],
    };

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': this.apiVersion,
          // Prompt-caching beta header (will be stable in a future API version).
          'anthropic-beta': 'prompt-caching-2024-07-31',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        `Anthropic network error during generateLesson: ${(err as Error).message}`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '<unreadable body>');
      throw new Error(
        `Anthropic API ${response.status} ${response.statusText}: ${text.slice(0, 500)}`,
      );
    }

    const data = (await response.json()) as AnthropicMessageResponse;

    // The model is forced (tool_choice) to invoke generate_lesson, so the
    // first tool_use block is our structured payload.
    const toolBlock = data.content?.find(
      (b): b is AnthropicToolUseBlock => b.type === 'tool_use' && b.name === 'generate_lesson',
    );
    if (!toolBlock) {
      throw new Error(
        'Anthropic response missing generate_lesson tool_use block — refusing to ship malformed lesson',
      );
    }

    const ll = toolBlock.input as ToolUseInput;

    const usage = data.usage ?? {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    };

    const costKopecks = computeCostKopecks(usage);
    const generationSeconds = (Date.now() - start) / 1000;

    return {
      title: ll.title,
      payload: {
        plan: ll.plan,
        teacherGuide: ll.teacherGuide,
        quiz: ll.quiz,
        homework: ll.homework,
        meta: {
          provider: this.name,
          model: this.model,
          tokensUsed:
            (usage.input_tokens ?? 0) +
            (usage.output_tokens ?? 0) +
            (usage.cache_creation_input_tokens ?? 0) +
            (usage.cache_read_input_tokens ?? 0),
          costKopecks,
        },
      },
      costKopecks,
      generationSeconds,
    };
    // Still TODO before flipping AI_PROVIDER=anthropic in prod:
    //   - Retry with exponential backoff on 429 / 5xx (3 attempts).
    //   - Per-tenant budget guard (refuse > monthly limit before call).
    //   - Image / 3D / video sub-pipelines (current scope = text only).
    //   - PII scrub on input.styleHints (potential teacher notes).
    //   - Save raw provider request/response under a 30-day retention
    //     policy for audit + content reproducibility.
  }
}

// ===== Helpers =====

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicMessageResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: Array<AnthropicTextBlock | AnthropicToolUseBlock>;
  stop_reason: string;
  usage?: AnthropicUsage;
}

interface ToolUseInput {
  title: string;
  plan: { steps: { title: string; durationMin: number; description: string }[] };
  teacherGuide: string;
  quiz: { question: string; options: string[]; correctIndex: number }[];
  homework: { description: string; autograder?: Record<string, unknown> };
}

/**
 * Rough cost calculator. Numbers are estimates for Claude Opus and will
 * be replaced once we have real billing telemetry.
 *
 *   Standard input  ≈ 0.5 RUB / 1K tokens =>  50 kopecks / 1K
 *   Cache write     ≈ 0.625 RUB / 1K tokens => 62 kopecks / 1K (1.25× input)
 *   Cache read      ≈ 0.05 RUB / 1K tokens =>   5 kopecks / 1K (10% of input)
 *   Output          ≈ 2.0 RUB / 1K tokens => 200 kopecks / 1K
 */
function computeCostKopecks(u: AnthropicUsage): number {
  const inputK = (u.input_tokens ?? 0) / 1000;
  const cacheWriteK = (u.cache_creation_input_tokens ?? 0) / 1000;
  const cacheReadK = (u.cache_read_input_tokens ?? 0) / 1000;
  const outputK = (u.output_tokens ?? 0) / 1000;
  const cost = inputK * 50 + cacheWriteK * 62 + cacheReadK * 5 + outputK * 200;
  return Math.ceil(cost);
}
