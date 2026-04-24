import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { Public } from '../../common/decorators/public.decorator';
import { AnonymousAllowed } from '../../common/tenancy/tenant.guard';

@Controller('health')
@Public()
@AnonymousAllowed()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectDataSource() private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  /** Liveness probe — process is alive. No external deps checked. */
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  /** Readiness probe — DB + Redis must be reachable. */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database', { connection: this.dataSource }),
      () => this.checkRedis(),
    ]);
  }

  /** Backwards-compat alias of /health/ready for existing k8s probes. */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { connection: this.dataSource }),
      () => this.checkRedis(),
    ]);
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return { redis: { status: 'up' } };
    } catch {
      return { redis: { status: 'down' } };
    }
  }
}
