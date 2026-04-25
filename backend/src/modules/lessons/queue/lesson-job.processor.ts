import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Lesson, LessonStatus } from '../lesson.entity';
import { LessonVersion, LessonVersionSource } from '../lesson-version.entity';
import { TenantContext } from '../../../common/tenancy/tenant.context';
import { MockAiProvider } from '../providers/mock.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { AiProvider } from '../providers/ai-provider.interface';
import {
  LESSON_QUEUE_NAME,
  LESSON_GENERATE_JOB,
  LessonJobData,
} from './lesson-queue.constants';

/**
 * BullMQ worker that consumes 'ai-lessons' jobs.
 *
 * Concurrency cap: 2 (configurable via AI_QUEUE_CONCURRENCY).
 * Why 2: each Anthropic call burns ~30k tokens; running more than 2 in
 * parallel during demos would empty the credit pot in minutes.
 *
 * Tenant context: AsyncLocalStorage from the original HTTP request has
 * already unwound by the time the worker pulls a job, so we re-establish
 * a system-scoped context with the tenantId stored in the job payload.
 *
 * Retry policy is on the queue (3 attempts, exponential backoff). When a
 * job exhausts retries we mark Lesson.status=FAILED with the error message
 * so the methodist UI can surface it.
 */
@Processor(LESSON_QUEUE_NAME, {
  concurrency: parseInt(process.env['AI_QUEUE_CONCURRENCY'] ?? '2', 10),
})
export class LessonJobProcessor extends WorkerHost {
  private readonly logger = new Logger(LessonJobProcessor.name);

  constructor(
    @InjectRepository(Lesson) private readonly lessons: Repository<Lesson>,
    @InjectRepository(LessonVersion)
    private readonly versions: Repository<LessonVersion>,
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
    private readonly config: ConfigService,
    private readonly mockProvider: MockAiProvider,
    private readonly anthropicProvider: AnthropicProvider,
  ) {
    super();
  }

  async process(job: Job<LessonJobData>): Promise<void> {
    if (job.name !== LESSON_GENERATE_JOB) {
      this.logger.warn(`Unknown job name '${job.name}' (id=${job.id})`);
      return;
    }
    const { lessonId, requesterId, tenantId, input } = job.data;
    this.logger.log(
      `Processing lesson ${lessonId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts ?? 1})`,
    );

    await this.tenantContext.runAsSystem(
      async () => {
        await this.lessons.update(lessonId, {
          status: LessonStatus.GENERATING,
          lastMessage: null,
        });

        const provider = this.selectProvider();
        const start = Date.now();
        const out = await provider.generateLesson(input);
        const elapsedSec = (Date.now() - start) / 1000;

        await this.dataSource.transaction(async (manager) => {
          const lesson = await manager.findOne(Lesson, {
            where: { id: lessonId },
          });
          if (!lesson) {
            this.logger.warn(
              `Lesson ${lessonId} disappeared mid-generation — skipping persist`,
            );
            return;
          }

          const version = manager.create(LessonVersion, {
            tenantId: lesson.tenantId,
            lessonId,
            sequence: 1,
            payload: out.payload as Record<string, unknown>,
            source: LessonVersionSource.AI_INITIAL,
            createdBy: requesterId,
            note: null,
            providerResponseRaw: out.rawResponse ?? null,
          });
          const savedVersion = await manager.save(LessonVersion, version);

          await manager.update(Lesson, lessonId, {
            status: LessonStatus.PENDING_REVIEW,
            title: out.title,
            currentVersionId: savedVersion.id,
            aiProvider: provider.name,
            aiCostKopecks: out.costKopecks,
            generationSeconds: Math.round(elapsedSec),
            lastMessage: 'Готово к review',
          });
        });
      },
      { tenantId },
    );
  }

  /**
   * Final-failure hook: BullMQ has exhausted all retries. We persist the
   * error onto the Lesson row so the UI can show it; this is the only path
   * where status=FAILED is set under the queue flow.
   */
  @OnWorkerEvent('failed')
  async onFailed(job: Job<LessonJobData> | undefined, err: Error): Promise<void> {
    if (!job) return;
    const isFinal =
      job.attemptsMade >= (job.opts.attempts ?? 1) ||
      err.name === 'UnrecoverableError';
    this.logger.error(
      `Lesson ${job.data.lessonId} attempt ${job.attemptsMade} failed: ${err.message}`,
    );
    if (!isFinal) return;

    await this.tenantContext.runAsSystem(
      async () => {
        await this.lessons.update(job.data.lessonId, {
          status: LessonStatus.FAILED,
          lastMessage: err.message,
        });
      },
      { tenantId: job.data.tenantId },
    );
  }

  private selectProvider(): AiProvider {
    const envProvider =
      this.config.get<string>('ai.provider') ??
      process.env['AI_PROVIDER'] ??
      'mock';

    if (envProvider === 'anthropic') {
      const hasKey = !!(
        this.config.get<string>('ANTHROPIC_API_KEY') ??
        process.env['ANTHROPIC_API_KEY']
      );
      if (hasKey) return this.anthropicProvider;
      this.logger.warn(
        `AI_PROVIDER=anthropic but ANTHROPIC_API_KEY missing — using mock`,
      );
      return this.mockProvider;
    }
    return this.mockProvider;
  }
}
