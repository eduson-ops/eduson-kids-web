import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  @Post('webhook/yukassa')
  @HttpCode(HttpStatus.OK)
  async yukassaWebhook(@Body() body: unknown, @Req() req: Request) {
    const hmacSecret = this.config.get<string>('yukassa.webhookHmacSecret') ?? '';
    if (hmacSecret) {
      const signature = req.headers['x-yukassa-signature'] as string;
      const expected = crypto
        .createHmac('sha256', hmacSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expected) {
        throw new BadRequestException('Invalid webhook signature');
      }
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
