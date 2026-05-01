import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { GuestToken, GuestTokenType } from './guest-token.entity';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(GuestToken)
    private readonly repo: Repository<GuestToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createToken(
    type: GuestTokenType,
    metadata: Record<string, unknown> = {},
    ttlHours = 72,
  ): Promise<{ token: string; expiresAt: string }> {
    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + ttlHours * 3600_000);

    await this.repo.save(
      this.repo.create({ token, type, metadata, expiresAt }),
    );

    return { token, expiresAt: expiresAt.toISOString() };
  }

  async redeemToken(token: string): Promise<{ accessToken: string; type: GuestTokenType }> {
    const row = await this.repo.findOne({ where: { token } });

    if (!row) throw new NotFoundException('Token not found');
    if (row.used) throw new UnauthorizedException('Token already used');
    if (row.expiresAt < new Date()) throw new UnauthorizedException('Token expired');

    const payload = {
      sub: `guest:${row.id}`,
      role: 'guest',
      guestType: row.type,
      metadata: row.metadata,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: 3600,
    });

    return { accessToken, type: row.type };
  }

  async listTokens(): Promise<GuestToken[]> {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 100 });
  }
}
