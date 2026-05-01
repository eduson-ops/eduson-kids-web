import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsUUID,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { LessonReportsService, CreateReportDto } from './lesson-reports.service';
import { ReportStatus } from './lesson-report.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class CreateReportBody implements CreateReportDto {
  @IsOptional()
  @IsUUID()
  slotId?: string;

  @IsUUID()
  studentId!: string;

  @IsISO8601()
  conductedAt!: string;

  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  grade?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  vkRecordUrl?: string;

  @IsOptional()
  @IsBoolean()
  isSubstitute?: boolean;

  @IsOptional()
  @IsUUID()
  substituteTeacherId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  lessonN?: number;
}

@ApiTags('lesson-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/lesson-reports')
export class LessonReportsController {
  constructor(private readonly service: LessonReportsService) {}

  @Post()
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  create(@Body() dto: CreateReportBody, @CurrentUser() user: JwtPayload) {
    return this.service.create(user.sub, dto);
  }

  @Get('my')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  getMyReports(@CurrentUser() user: JwtPayload) {
    return this.service.getByTeacher(user.sub, user.role);
  }

  @Get('student/:studentId')
  @Roles('child', 'parent', 'teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  getStudentReports(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getByStudent(studentId, user.sub, user.role);
  }
}
