import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './subscription.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private config: ConfigService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@CurrentUser() user: JwtPayload) {
    const sub = await this.subRepo.findOne({
      where: { userId: user.sub, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
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
    const hmacSecret = this.config.get<string>('yukassa.webhookHmacSecret') ?? '';
    // Fail closed: without a configured secret, we CANNOT verify — refuse to process.
    // This prevents an attacker from forging payment events in environments where the
    // secret was accidentally unset.
    if (!hmacSecret) {
      throw new ServiceUnavailableException(
        'YuKassa webhook HMAC secret is not configured on this server',
      );
    }

    const signature = (req.headers['x-yukassa-signature'] as string | undefined) ?? '';
    const expected = crypto
      .createHmac('sha256', hmacSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    const valid =
      sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    if (!valid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // TODO: process YuKassa payment event
    return { received: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cancel-auto-renew')
  @HttpCode(HttpStatus.OK)
  async cancelAutoRenew(@CurrentUser() user: JwtPayload) {
    await this.subRepo.update(
      { userId: user.sub, status: SubscriptionStatus.ACTIVE },
      { autoRenew: false },
    );
    return { autoRenew: false };
  }
}
