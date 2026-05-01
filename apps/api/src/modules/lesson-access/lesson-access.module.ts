import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonAccess } from './lesson-access.entity';
import { LessonAccessService } from './lesson-access.service';
import { LessonAccessController } from './lesson-access.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonAccess, User])],
  controllers: [LessonAccessController],
  providers: [LessonAccessService],
  exports: [LessonAccessService],
})
export class LessonAccessModule {}
