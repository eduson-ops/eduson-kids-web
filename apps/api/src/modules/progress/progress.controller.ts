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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';
import { ProgressService } from './progress.service';
import { ProgressEventKind } from './progress.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class RecordEventDto {
  @IsEnum(ProgressEventKind)
  kind!: ProgressEventKind;

  @IsObject()
  payload!: Record<string, unknown>;
}

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('event')
  @Roles('child')
  @HttpCode(HttpStatus.CREATED)
  recordEvent(@Body() dto: RecordEventDto, @CurrentUser() user: JwtPayload) {
    return this.progressService.recordEvent(user.sub, dto.kind, dto.payload);
  }

  @Get('me/summary')
  @Roles('child')
  getMySummary(@CurrentUser() user: JwtPayload) {
    return this.progressService.getMySummary(user.sub);
  }

  @Get('child/:id/summary')
  @Roles('parent')
  getChildSummary(
    @Param('id', ParseUUIDPipe) childId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.progressService.getChildSummary(user.sub, childId);
  }
}
