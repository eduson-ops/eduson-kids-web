import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [TerminusModule, TypeOrmModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
