import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsInt,
  IsUUID,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LessonAccessService } from './lesson-access.service';
import { LessonAccess } from '../progress/progress.entity';

interface LessonAccessRow {
  lessonN: number;
  unlocked: boolean;
  completed: boolean;
  score: number | null;
  unlockedAt: string;
  completedAt: string | null;
}

function toRow(a: LessonAccess): LessonAccessRow {
  return {
    lessonN: a.lessonN,
    unlocked: true,
    completed: a.completed,
    score: a.score ?? null,
    unlockedAt: a.unlockedAt instanceof Date ? a.unlockedAt.toISOString() : String(a.unlockedAt),
    completedAt: a.completedAt
      ? (a.completedAt instanceof Date ? a.completedAt.toISOString() : String(a.completedAt))
      : null,
  };
}

class UnlockLessonDto {
  @IsUUID()
  studentId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  lessonN!: number;

  @IsUUID()
  classroomId!: string;
}

class UnlockBatchDto {
  @IsUUID()
  classroomId!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  lessonN!: number;

  /** If omitted, unlocks for ALL students in the classroom */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];
}

class CompleteLessonDto {
  @IsInt()
  @Min(1)
  @Max(999)
  lessonN!: number;

  /** Optional best-attempt score 0-100 */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;
}

@ApiTags('lesson-access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lesson-access')
export class LessonAccessController {
  constructor(private readonly service: LessonAccessService) {}

  @Post('unlock')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock a single lesson for one student' })
  async unlock(@Body() dto: UnlockLessonDto, @CurrentUser() user: JwtPayload) {
    const a = await this.service.unlockLesson(user.sub, dto.studentId, dto.lessonN, dto.classroomId);
    return toRow(a);
  }

  @Post('unlock-batch')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock a lesson for all (or selected) students in a classroom' })
  unlockBatch(@Body() dto: UnlockBatchDto, @CurrentUser() user: JwtPayload) {
    return this.service.unlockBatch(user.sub, dto.classroomId, dto.lessonN, dto.studentIds);
  }

  @Post('complete')
  @Roles('child')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student marks a lesson as completed' })
  async complete(@Body() dto: CompleteLessonDto, @CurrentUser() user: JwtPayload) {
    const a = await this.service.completeLesson(user.sub, dto.lessonN, dto.score);
    return toRow(a);
  }

  @Get('me')
  @Roles('child')
  @ApiOperation({ summary: 'Get all unlocked/completed lessons for the current student' })
  getMyAccess(@CurrentUser() user: JwtPayload) {
    return this.service.getMyAccess(user.sub);
  }

  @Get('classroom/:classroomId')
  @Roles('teacher', 'curator', 'school_admin', 'platform_admin')
  @ApiOperation({ summary: 'Get classroom-wide progress matrix (teacher view)' })
  getClassroomProgress(
    @Param('classroomId', ParseUUIDPipe) classroomId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getClassroomProgress(classroomId, user.sub);
  }
}
