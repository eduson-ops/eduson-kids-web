import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsUUID, IsOptional, IsArray, Min, Max } from 'class-validator';
import { LessonAccessService } from './lesson-access.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class UnlockDto {
  @IsUUID()
  studentId!: string;

  @IsInt()
  @Min(1)
  @Max(200)
  lessonN!: number;

  @IsOptional()
  @IsUUID()
  classroomId?: string;
}

class UnlockBatchDto {
  @IsUUID()
  classroomId!: string;

  @IsInt()
  @Min(1)
  @Max(200)
  lessonN!: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];
}

class CompleteDto {
  @IsInt()
  @Min(1)
  @Max(200)
  lessonN!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;
}

@ApiTags('lesson-access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/lesson-access')
export class LessonAccessController {
  constructor(private readonly service: LessonAccessService) {}

  @Get('me')
  @Roles('child', 'teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  getMyAccess(@CurrentUser() user: JwtPayload) {
    return this.service.getMyAccess(user.sub);
  }

  @Post('unlock')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  async unlock(@Body() dto: UnlockDto, @CurrentUser() user: JwtPayload) {
    if (dto.classroomId) {
      await this.service.verifyTeacherOwnsClassroom(user.sub, dto.classroomId, user.role);
    }
    return this.service.unlock({ ...dto, teacherId: user.sub });
  }

  @Post('unlock-batch')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  async unlockBatch(@Body() dto: UnlockBatchDto, @CurrentUser() user: JwtPayload) {
    await this.service.verifyTeacherOwnsClassroom(user.sub, dto.classroomId, user.role);
    return this.service.unlockBatch({ ...dto, teacherId: user.sub });
  }

  @Post('complete')
  @Roles('child')
  complete(@Body() dto: CompleteDto, @CurrentUser() user: JwtPayload) {
    return this.service.complete(user.sub, dto.lessonN, dto.score);
  }

  @Get('classroom/:id')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  async getClassroomProgress(
    @Param('id', ParseUUIDPipe) classroomId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.service.verifyTeacherOwnsClassroom(user.sub, classroomId, user.role);
    return this.service.getClassroomProgress(classroomId);
  }
}
