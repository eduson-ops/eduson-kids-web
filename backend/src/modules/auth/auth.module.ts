import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VkIdService } from './strategies/vk-id.service';
import { SferumLinkService } from './strategies/sferum-link.service';
import { ExternalAuthController } from './external-auth.controller';
import { User } from './entities/user.entity';
import { Classroom } from '../classroom/classroom.entity';
import { CryptoModule } from '../../common/crypto/crypto.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Classroom]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          // Default TTL for JwtModule.sign(); AuthService.issueTokens overrides per token type.
          // Configurable via JWT_ACCESS_TTL env (default 900 = 15 min). For demo use 3600 (1h).
          expiresIn: config.get<number>('jwt.accessTtlSec') ?? 900,
        },
      }),
    }),
    CryptoModule,
    RedisModule,
  ],
  controllers: [AuthController, ExternalAuthController],
  providers: [AuthService, JwtStrategy, VkIdService, SferumLinkService],
  exports: [AuthService, VkIdService, SferumLinkService, JwtModule, PassportModule],
})
export class AuthModule {}
