import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Subscription, SubscriptionStatus } from './subscription.entity';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private config: ConfigService,
  ) {}

  /**
   * Returns the active subscription for a user, or null when none exists.
   */
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return this.subRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Verifies a YuKassa HMAC-SHA256 webhook signature using timing-safe comparison.
   *
   * Fail-closed: if the secret is not configured the method throws
   * ServiceUnavailableException so malformed environments cannot accept forged events.
   *
   * @param body     Parsed request body (will be stringified before hashing).
   * @param signature Hex-encoded HMAC received in x-yukassa-signature header.
   * @throws ServiceUnavailableException when the secret is not set.
   * @throws UnauthorizedException when the signature does not match.
   */
  verifyYukassaHmac(body: unknown, signature: string): void {
    const hmacSecret = this.config.get<string>('yukassa.webhookHmacSecret') ?? '';

    // Fail closed: without a configured secret we CANNOT verify — refuse to process.
    // This prevents an attacker from forging payment events in environments where the
    // secret was accidentally unset.
    if (!hmacSecret) {
      throw new ServiceUnavailableException(
        'YuKassa webhook HMAC secret is not configured on this server',
      );
    }

    const expected = crypto
      .createHmac('sha256', hmacSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');

    // timingSafeEqual prevents timing-oracle attacks even when lengths differ.
    const valid =
      sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!valid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  /**
   * Handles a verified YuKassa webhook payload.
   * Currently a stub — extend when YuKassa event schema is finalised.
   *
   * @param body Verified, parsed webhook body.
   */
  // TODO(billing): parse YuKassa event type and dispatch to
  //   handlePaymentSuccess / handlePaymentFailure once event schema is known.
  async processYukassaEvent(body: unknown): Promise<void> {
    // Placeholder — no-op until YuKassa event shape is confirmed.
    void body;
  }

  /**
   * Marks a subscription as ACTIVE after a confirmed successful payment.
   * Called once YuKassa sends a payment.succeeded event.
   *
   * @param providerPaymentId YuKassa payment id (used for reconciliation).
   */
  async handlePaymentSuccess(providerPaymentId: string): Promise<void> {
    await this.subRepo.update(
      { providerPaymentId, status: SubscriptionStatus.PENDING },
      { status: SubscriptionStatus.ACTIVE },
    );
  }

  /**
   * Marks a subscription as FAILED when YuKassa reports a payment failure.
   *
   * @param providerPaymentId YuKassa payment id.
   */
  async handlePaymentFailure(providerPaymentId: string): Promise<void> {
    await this.subRepo.update(
      { providerPaymentId, status: SubscriptionStatus.PENDING },
      { status: SubscriptionStatus.FAILED },
    );
  }

  /**
   * Disables auto-renewal for all active subscriptions of a given user.
   */
  async cancelAutoRenew(userId: string): Promise<void> {
    await this.subRepo.update(
      { userId, status: SubscriptionStatus.ACTIVE },
      { autoRenew: false },
    );
  }
}
