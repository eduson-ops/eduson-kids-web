import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LESSON_QUEUE_NAME } from './lesson-queue.constants';

/**
 * Registers the BullMQ queue used by the AI lesson pipeline.
 *
 * - Queue name: 'ai-lessons'
 * - Default job options: 3 retries, exponential backoff (2s, 8s, 32s)
 * - Connection: pulls Redis host/port/password from ConfigService (same source
 *   as common/redis/redis.module.ts) so a single .env governs both clients.
 *
 * Consumers wire this module into LessonsModule. If Redis is unreachable the
 * AiPipelineService detects it at boot and falls back to the in-process flow,
 * so the absence of Redis in dev should never break the API surface.
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useTls = config.get<boolean>('redis.tls');
        return {
          connection: {
            host: config.get<string>('redis.host') ?? 'localhost',
            port: config.get<number>('redis.port') ?? 6379,
            password: config.get<string>('redis.password') || undefined,
            tls: useTls ? { rejectUnauthorized: false } : undefined,
            // BullMQ requires this to be null for blocking commands.
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: LESSON_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600, count: 200 },
        removeOnFail: { age: 24 * 3600 },
      },
    }),
  ],
  exports: [BullModule],
})
export class LessonQueueModule implements OnModuleInit {
  private readonly logger = new Logger(LessonQueueModule.name);

  onModuleInit(): void {
    this.logger.log(
      `BullMQ queue '${LESSON_QUEUE_NAME}' registered (3 retries, exponential backoff)`,
    );
  }
}
