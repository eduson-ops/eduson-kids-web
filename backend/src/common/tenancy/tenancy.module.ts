import { Module, Global, MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection, getConnection } from 'typeorm';
import { TenantContext } from './tenant.context';
import { TenantMiddleware } from './tenant.middleware';
import { TenantSubscriber } from './tenant.subscriber';
import { TenantGuard } from './tenant.guard';
import { TenantsModule } from '../../modules/tenants/tenants.module';
import { TenantsService } from '../../modules/tenants/tenants.service';

/**
 * Global tenancy module. Wires:
 * - TenantContext (AsyncLocalStorage)
 * - TenantSubscriber (TypeORM hook)
 * - TenantMiddleware (resolves tenant on every request)
 * - TenantGuard (enforces tenant scope unless @AnonymousAllowed)
 *
 * Imports TenantsModule for slug→id resolution.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        // Tenancy uses access secret because that's the token middleware sees
        // on every authenticated request. Refresh tokens never hit middleware.
        secret: cfg.get<string>('jwt.accessSecret') ?? cfg.get<string>('jwt.secret') ?? '',
      }),
    }),
    TenantsModule,
  ],
  providers: [TenantContext, TenantSubscriber, TenantGuard, TenantMiddleware],
  exports: [TenantContext, TenantGuard, TenantMiddleware],
})
export class TenancyModule implements NestModule, OnModuleInit {
  constructor(
    private readonly tenantMiddleware: TenantMiddleware,
    private readonly tenantsService: TenantsService,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }

  onModuleInit(): void {
    // Wire slug resolver — done lazily to avoid circular dep
    this.tenantMiddleware.setResolver(async (slug) => {
      const tenant = await this.tenantsService.findBySlug(slug);
      return tenant?.id;
    });
  }
}
