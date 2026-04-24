import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsObject,
  Min,
  Max,
  Length,
} from 'class-validator';
import { AiPipelineService } from './ai-pipeline.service';
import { LessonStatus, LessonUmk, LessonFocus } from './lesson.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class GenerateLessonDto {
  @IsString()
  @Length(1, 32)
  topicCode!: string;

  @IsInt()
  @Min(1)
  @Max(11)
  grade!: number;

  @IsEnum(LessonUmk)
  umk!: LessonUmk;

  @IsEnum(LessonFocus)
  focus!: LessonFocus;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  lessonMinutes?: number;
}

class ApproveLessonDto {
  @IsOptional()
  @IsString()
  @Length(1, 1024)
  note?: string;
}

class RejectLessonDto {
  @IsString()
  @Length(1, 2048)
  feedback!: string;
}

class EditLessonDto {
  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  note?: string;
}

/**
 * Methodist + admin endpoints for the AI content factory.
 *
 * Authorization: METHODIST or higher. Note that METHODIST is restricted
 * by AdminService design — they can submit/review lessons but CANNOT
 * export prompts or raw provider responses (those are server-internal).
 */
@ApiTags('admin-ai-lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/ai/lessons')
export class LessonsController {
  constructor(private readonly pipeline: AiPipelineService) {}

  @Post('generate')
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Submit a topic to the AI pipeline' })
  generate(@Body() dto: GenerateLessonDto, @CurrentUser() user: JwtPayload) {
    return this.pipeline.submit(user.sub, dto);
  }

  @Get()
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'List lessons in active tenant (optional status filter)' })
  list(@Query('status') status?: LessonStatus) {
    return this.pipeline.list({ status });
  }

  @Get(':id')
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Get lesson + latest version content' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.pipeline.get(id);
  }

  @Post(':id/approve')
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Methodist approves the current version → published' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pipeline.approve(id, user.sub, dto.note);
  }

  @Post(':id/reject')
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Methodist rejects with required feedback' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pipeline.reject(id, user.sub, dto.feedback);
  }

  @Patch(':id/version')
  @Roles('methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Methodist saves an edited version' })
  edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditLessonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pipeline.editVersion(id, user.sub, dto.payload, dto.note);
  }
}
