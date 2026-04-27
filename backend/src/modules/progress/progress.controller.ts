import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
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

class SaveProgressDto {
  @IsString()
  gameId!: string;

  @IsNumber()
  coins!: number;

  @IsNumber()
  timeMs!: number;

  @IsBoolean()
  completed!: boolean;
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

  @Put()
  @Roles('child')
  @HttpCode(HttpStatus.OK)
  async saveProgress(@Body() dto: SaveProgressDto, @CurrentUser() user: JwtPayload) {
    await this.progressService.saveGameScore(user.sub, dto.gameId, dto.coins, dto.timeMs, dto.completed);
    return { ok: true };
  }
}

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly progressService: ProgressService) {}

  @Get(':gameId')
  @Public()
  getLeaderboard(@Param('gameId') gameId: string) {
    return this.progressService.getLeaderboard(gameId);
  }
}
