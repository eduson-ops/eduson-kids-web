import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './lesson.entity';
import { LessonVersion } from './lesson-version.entity';
import { AiPipelineService } from './ai-pipeline.service';
import { LessonsController } from './lessons.controller';
import { MockAiProvider } from './providers/mock.provider';
import { TenantsModule } from '../tenants/tenants.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonVersion]), TenantsModule, AuthModule],
  controllers: [LessonsController],
  providers: [AiPipelineService, MockAiProvider],
  exports: [AiPipelineService],
})
export class LessonsModule {}
