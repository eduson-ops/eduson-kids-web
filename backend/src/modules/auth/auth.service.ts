import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import Redis from 'ioredis';
import { User, UserRole } from './entities/user.entity';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { ChildLoginDto } from './dto/child-login.dto';
import { ParentLoginDto } from './dto/parent-login.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';

export interface AvatarData {
  bodyColor?: string;
  eyeType?: string;
  hatType?: string;
  accessory?: string;
  [key: string]: unknown;
}

const FAILED_LOGIN_KEY = (ip: string) => `failed_login:${ip}`;
const REFRESH_KEY = (userId: string, jti: string) => `refresh:${userId}:${jti}`;
const BLACKLIST_KEY = (jti: string) => `blacklist:${jti}`;
const IP_BLOCK_KEY = (ip: string) => `ip_block:${ip}`;

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthYear?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
    private piiCrypto: PiiCryptoService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async loginChild(dto: ChildLoginDto, ip: string) {
    await this.checkIpBlock(ip);
    const user = await this.findByLogin(dto.login, UserRole.CHILD);
    await this.verifyPassword(user, dto.pin, ip);
    await this.updateLastLogin(user.id);
    return this.issueTokens(user);
  }

  async loginParent(dto: ParentLoginDto, ip: string) {
    await this.checkIpBlock(ip);
    const user = await this.findByLogin(dto.email, UserRole.PARENT);
    await this.verifyPassword(user, dto.password, ip);
    await this.updateLastLogin(user.id);
    return this.issueTokens(user);
  }

  async loginGuest(): Promise<{ accessToken: string }> {
    const guestId = require('crypto').randomBytes(8).toString('hex') as string;
    const payload: JwtPayload = {
      sub: `guest-${guestId}`,
      role: 'guest' as UserRole,
      tnt: '00000000-0000-0000-0000-000000000001',
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: 3600, // 1 hour
    });
    return { accessToken };
  }

  async loginChildByCode(code: string, displayName?: string): Promise<{ accessToken: string }> {
    // code format: login:pin (e.g. "panda42:123456")
    const [login, pin] = (code ?? '').split(':')
    if (!login || !pin) throw new UnauthorizedException('Invalid code format')
    const dto: ChildLoginDto = { login, pin }
    const ip = 'internal'
    await this.checkIpBlock(ip)
    const user = await this.findByLogin(dto.login, UserRole.CHILD)
    await this.verifyPassword(user, dto.pin, ip)
    await this.updateLastLogin(user.id)
    const tokens = this.issueTokens(user)
    return { accessToken: tokens.accessToken }
  }

  async updateAvatar(userId: string, avatar: AvatarData): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user) throw new UnauthorizedException('User not found');

    let profile: UserProfile = {};
    if (user.encryptedProfile && user.profileIv && user.profileAuthTag) {
      profile = this.piiCrypto.decryptObject({
        ciphertext: user.encryptedProfile,
        iv: user.profileIv,
        authTag: user.profileAuthTag,
      }) as UserProfile;
    }

    const updatedProfile = { ...profile, avatar };
    const encrypted = this.piiCrypto.encryptObject(updatedProfile);
    await this.userRepo.update(userId, {
      encryptedProfile: encrypted.ciphertext,
      profileIv: encrypted.iv,
      profileAuthTag: encrypted.authTag,
    });
  }

  async loginTeacher(dto: TeacherLoginDto, ip: string) {
    await this.checkIpBlock(ip);
    const schoolCodes = this.config.get<string[]>('schoolCodes') ?? [];
    if (!schoolCodes.includes(dto.schoolCode)) {
      throw new ForbiddenException('Invalid school code');
    }
    const user = await this.findByLogin(dto.email, UserRole.TEACHER);
    await this.verifyPassword(user, dto.password, ip);
    await this.updateLastLogin(user.id);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload & { jti?: string };
    try {
      payload = this.jwtService.verify<JwtPayload & { jti?: string }>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const jti = payload.jti ?? '';
    const isBlacklisted = await this.redis.get(BLACKLIST_KEY(jti));
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Rotate: blacklist old refresh token
    const ttl = (payload.exp ?? 0) - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(BLACKLIST_KEY(jti), ttl, '1');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub, isActive: true } });
    if (!user) throw new UnauthorizedException('User not found');

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload & { jti?: string; exp?: number }>(refreshToken);
      const jti = payload?.jti;
      const exp = payload?.exp;
      if (jti && exp) {
        const ttl = exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.setex(BLACKLIST_KEY(jti), ttl, '1');
        }
      }
    } catch {
      // Ignore invalid token on logout
    }
  }

  async getMe(userId: string): Promise<{
    id: string;
    role: string;
    name: string;
    login: string;
    email?: string;
    classroomId?: string;
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user) throw new UnauthorizedException('User not found');

    let profile: UserProfile = {};
    if (user.encryptedProfile && user.profileIv && user.profileAuthTag) {
      profile = this.piiCrypto.decryptObject({
        ciphertext: user.encryptedProfile,
        iv: user.profileIv,
        authTag: user.profileAuthTag,
      }) as UserProfile;
    }

    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.login;
    return {
      id: user.id,
      role: user.role,
      name,
      login: user.login,
      email: profile.email,
      ...(user.classroomId ? { classroomId: user.classroomId } : {}),
    };
  }

  private async findByLogin(login: string, role: UserRole): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { login: login.toLowerCase(), role, isActive: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  private async verifyPassword(user: User, password: string, ip: string): Promise<void> {
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      await this.recordFailedLogin(ip);
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.redis.del(FAILED_LOGIN_KEY(ip));
  }

  private async recordFailedLogin(ip: string): Promise<void> {
    const key = FAILED_LOGIN_KEY(ip);
    const count = await this.redis.incr(key);
    await this.redis.expire(key, 900);

    if (count >= 10) {
      await this.redis.setex(IP_BLOCK_KEY(ip), 3600, '1');
    }
  }

  private async checkIpBlock(ip: string): Promise<void> {
    const blocked = await this.redis.get(IP_BLOCK_KEY(ip));
    if (blocked) {
      throw new ForbiddenException('Too many failed attempts. Try again in 1 hour.');
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepo.update(userId, { lastLoginAt: new Date() });
  }

  issueTokens(user: User): { accessToken: string; refreshToken: string } {
    const jti = require('crypto').randomBytes(16).toString('hex') as string;

    const accessPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
      tnt: user.tenantId,
    };
    const refreshPayload = {
      sub: user.id,
      role: user.role,
      tnt: user.tenantId,
      jti,
    };

    const accessTtl = this.config.get<number>('jwt.accessTtlSec') ?? 900;
    const refreshTtl = this.config.get<number>('jwt.refreshTtlSec') ?? 2592000;

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    return { accessToken, refreshToken };
  }
}
