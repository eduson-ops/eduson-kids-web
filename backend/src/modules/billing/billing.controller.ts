import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@CurrentUser() user: JwtPayload) {
    const sub = await this.billingService.getActiveSubscription(user.sub);
    return sub ?? { status: 'none' };
  }

  @Public()
  // D2-12: throttle webhook to 30 req/min/IP. The endpoint is @Public + does
  // HMAC verify on every call (createHmac on stringified body) — without throttle
  // an attacker can burn CPU even though all requests fail with 401. 30/min/IP
  // is well above legitimate YuKassa retry cadence (~1/sec back-off).
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('webhook/yukassa')
  @HttpCode(HttpStatus.OK)
  async yukassaWebhook(@Body() body: unknown, @Req() req: Request) {
    const signature = (req.headers['x-yukassa-signature'] as string | undefined) ?? '';
    this.billingService.verifyYukassaHmac(body, signature);
    await this.billingService.processYukassaEvent(body);
    return { received: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cancel-auto-renew')
  @HttpCode(HttpStatus.OK)
  async cancelAutoRenew(@CurrentUser() user: JwtPayload) {
    await this.billingService.cancelAutoRenew(user.sub);
    return { autoRenew: false };
  }
}
