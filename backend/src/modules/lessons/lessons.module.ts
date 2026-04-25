import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { LessonVersion } from './lesson-version.entity';
import { AiPipelineService } from './ai-pipeline.service';
import { LessonsController } from './lessons.controller';
import { MockAiProvider } from './providers/mock.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { TenantsModule } from '../tenants/tenants.module';
import { AuthModule } from '../auth/auth.module';
import { LessonQueueModule } from './queue/lesson-queue.module';
import { LessonJobProcessor } from './queue/lesson-job.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, LessonVersion]),
    TenantsModule,
    AuthModule,
    LessonQueueModule,
  ],
  controllers: [LessonsController],
  providers: [
    AiPipelineService,
    MockAiProvider,
    AnthropicProvider,
    LessonJobProcessor,
  ],
  exports: [AiPipelineService],
})
export class LessonsModule {}
