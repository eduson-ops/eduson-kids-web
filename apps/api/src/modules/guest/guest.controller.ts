import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';
import { GuestService } from './guest.service';
import { GuestTokenType } from './guest-token.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

class CreateTokenBody {
  @IsEnum(GuestTokenType)
  type!: GuestTokenType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  ttlHours?: number;
}

class RedeemTokenBody {
  token!: string;
}

@ApiTags('guest')
@Controller('api/v1/guest')
export class GuestController {
  constructor(private readonly service: GuestService) {}

  @Post('tokens')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'platform_admin', 'school_admin', 'curator', 'teacher')
  createToken(@Body() dto: CreateTokenBody) {
    return this.service.createToken(dto.type, dto.metadata ?? {}, dto.ttlHours ?? 72);
  }

  @Post('redeem')
  @Public()
  redeemToken(@Body() dto: RedeemTokenBody) {
    return this.service.redeemToken(dto.token);
  }

  @Get('tokens')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'platform_admin', 'school_admin', 'curator')
  listTokens() {
    return this.service.listTokens();
  }
}
