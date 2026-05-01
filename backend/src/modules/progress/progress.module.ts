import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressEvent, LessonAccess } from './progress.entity';
import { ProgressController, LeaderboardController } from './progress.controller';
import { LessonAccessController } from './lesson-access.controller';
import { ProgressService } from './progress.service';
import { LessonAccessService } from './lesson-access.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Classroom } from '../classroom/classroom.entity';
import { TenancyModule } from '../../common/tenancy/tenancy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgressEvent, LessonAccess, User, Classroom]),
    AuthModule,
    TenancyModule,
  ],
  controllers: [ProgressController, LeaderboardController, LessonAccessController],
  providers: [ProgressService, LessonAccessService],
  exports: [ProgressService, LessonAccessService],
})
export class ProgressModule {}
