import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  LessonGenerationInput,
  LessonGenerationOutput,
} from './ai-provider.interface';

/**
 * Claude (Anthropic) provider implementation.
 *
 * Status: production-ready — guarded by env vars
 *   AI_PROVIDER=anthropic
 *   ANTHROPIC_API_KEY=...
 *
 * If either is missing, AiPipelineService falls back to MockAiProvider.
 *
 * Wire format: /v1/messages with prompt caching enabled on the system
 * prompt — important cost optimization since we send the same multi-thousand
 * token platform context (block API spec, ФГОС format, character library)
 * on every lesson generation.
 *
 * D2-14 hardening (this revision):
 *   - Retry up to 3 times on 429 / 5xx with exp-backoff (500ms→2000ms→8000ms)
 *     plus ±20% jitter; honors Retry-After header when present.
 *   - 4xx other than 429 is NOT retried (deterministic client error).
 *   - Total wall-clock cap via AbortController (60s default,
 *     ANTHROPIC_TIMEOUT_MS env override).
 *   - Returns full provider response under `rawResponse` (truncated to
 *     ~64KB) so AiPipelineService can persist it on the LessonVersion row
 *     for audit + reproducibility.
 *
 * Cost model (rough; will be replaced once we get real per-tenant billing):
 *   - Input  ≈ 0.5 RUB per 1K tokens (cached: 0.05 RUB)
 *   - Output ≈ 2.0 RUB per 1K tokens
 *   - 1 RUB = 100 kopecks
 */
@Injectable()
export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';

  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly apiVersion = '2023-06-01';
  private readonly model = 'claude-opus-4-7';

  /** Max attempts (initial + retries). 3 = initial + 2 retries; we use 4 = initial + 3 retries. */
  private readonly MAX_ATTEMPTS = 4;
  /** Backoff schedule in ms for retries 1..3 (jittered ±20%). */
  private readonly BACKOFF_MS = [500, 2000, 8000];
  /** Cap for raw response persistence — keeps audit row small + bounds PII risk. */
  private readonly RAW_RESPONSE_MAX_BYTES = 64 * 1024;

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

  /** Total per-call wall-clock budget. Default 60s. */
  private getTimeoutMs(): number {
    const raw =
      this.config.get<string>('ANTHROPIC_TIMEOUT_MS') ??
      process.env['ANTHROPIC_TIMEOUT_MS'];
    const parsed = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return 60_000;
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

  /**
   * Sleep helper that aborts early when the controller fires. Returns true
   * if the sleep completed, false if aborted.
   */
  private sleep(ms: number, signal: AbortSignal): Promise<boolean> {
    if (signal.aborted) return Promise.resolve(false);
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve(true);
      }, ms);
      const onAbort = () => {
        clearTimeout(t);
        signal.removeEventListener('abort', onAbort);
        resolve(false);
      };
      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  /**
   * Compute backoff delay for attempt index `i` (0-based, AFTER the attempt
   * that failed). Honors Retry-After (seconds or HTTP-date) when present.
   */
  private computeBackoffMs(attemptIdx: number, retryAfterHeader: string | null): number {
    if (retryAfterHeader) {
      const asInt = parseInt(retryAfterHeader, 10);
      if (Number.isFinite(asInt) && asInt > 0) {
        // Server-supplied delay (seconds). Cap at 30s to avoid pathological waits.
        return Math.min(asInt * 1000, 30_000);
      }
      const asDate = Date.parse(retryAfterHeader);
      if (Number.isFinite(asDate)) {
        const delta = asDate - Date.now();
        if (delta > 0) return Math.min(delta, 30_000);
      }
    }
    const base = this.BACKOFF_MS[Math.min(attemptIdx, this.BACKOFF_MS.length - 1)];
    // ±20% jitter — math.random is fine here, not security-sensitive.
    const jitter = base * 0.2 * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(base + jitter));
  }

  /**
   * Truncate raw response for audit storage. We serialize once, slice, and
   * fold back into a JSON object so downstream JSONB column gets valid JSON
   * even for oversized responses.
   */
  private truncateRawResponse(raw: unknown): Record<string, unknown> {
    let serialized: string;
    try {
      serialized = JSON.stringify(raw);
    } catch {
      return { _truncated: true, _reason: 'unserializable' };
    }
    if (serialized.length <= this.RAW_RESPONSE_MAX_BYTES) {
      return raw as Record<string, unknown>;
    }
    return {
      _truncated: true,
      _originalBytes: serialized.length,
      _maxBytes: this.RAW_RESPONSE_MAX_BYTES,
      _excerpt: serialized.slice(0, this.RAW_RESPONSE_MAX_BYTES),
    };
  }

  /**
   * Call /v1/messages with retry on 429/5xx + exp-backoff + AbortController
   * total-timeout. 4xx (other than 429) is treated as non-retryable.
   */
  private async fetchWithRetry(body: unknown, apiKey: string): Promise<Response> {
    const totalTimeoutMs = this.getTimeoutMs();
    const totalAbort = new AbortController();
    const totalTimer = setTimeout(() => totalAbort.abort(), totalTimeoutMs);

    let lastErr: Error | null = null;
    try {
      for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
        if (totalAbort.signal.aborted) break;

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
            signal: totalAbort.signal,
          });
        } catch (err) {
          // Network error / abort. Abort means total timeout — bubble up.
          const e = err as Error;
          lastErr = e;
          if (totalAbort.signal.aborted) {
            throw new Error(
              `Anthropic request aborted after ${totalTimeoutMs}ms total timeout`,
            );
          }
          // Transient network error — retry with backoff if budget remains.
          if (attempt < this.MAX_ATTEMPTS - 1) {
            const wait = this.computeBackoffMs(attempt, null);
            this.logger.warn(
              `Anthropic network error (attempt ${attempt + 1}/${this.MAX_ATTEMPTS}): ${e.message} — retrying in ${wait}ms`,
            );
            const slept = await this.sleep(wait, totalAbort.signal);
            if (!slept) break;
            continue;
          }
          throw new Error(`Anthropic network error during generateLesson: ${e.message}`);
        }

        if (response.ok) return response;

        const status = response.status;
        const isRetryable = status === 429 || (status >= 500 && status <= 599);
        if (!isRetryable || attempt === this.MAX_ATTEMPTS - 1) {
          return response; // Caller will format the error.
        }

        const retryAfter = response.headers.get('retry-after');
        const wait = this.computeBackoffMs(attempt, retryAfter);
        // Drain body so socket can be reused.
        await response.text().catch(() => undefined);
        this.logger.warn(
          `Anthropic ${status} (attempt ${attempt + 1}/${this.MAX_ATTEMPTS}) — retrying in ${wait}ms` +
            (retryAfter ? ` [retry-after=${retryAfter}]` : ''),
        );
        const slept = await this.sleep(wait, totalAbort.signal);
        if (!slept) {
          throw new Error(
            `Anthropic request aborted after ${totalTimeoutMs}ms total timeout (during backoff)`,
          );
        }
      }
    } finally {
      clearTimeout(totalTimer);
    }

    if (totalAbort.signal.aborted) {
      throw new Error(
        `Anthropic request aborted after ${totalTimeoutMs}ms total timeout`,
      );
    }
    if (lastErr) {
      throw new Error(`Anthropic network error during generateLesson: ${lastErr.message}`);
    }
    throw new Error('Anthropic retry loop exited without response');
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

    const response = await this.fetchWithRetry(body, apiKey);

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
      rawResponse: this.truncateRawResponse(data),
    };
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
