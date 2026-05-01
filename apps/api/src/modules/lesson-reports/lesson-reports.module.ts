import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonReport } from './lesson-report.entity';
import { LessonReportsService } from './lesson-reports.service';
import { LessonReportsController } from './lesson-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LessonReport])],
  controllers: [LessonReportsController],
  providers: [LessonReportsService],
  exports: [LessonReportsService],
})
export class LessonReportsModule {}
