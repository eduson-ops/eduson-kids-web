import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import * as path from 'path';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassroomModule } from './modules/classroom/classroom.module';
import { ProgressModule } from './modules/progress/progress.module';
import { BillingModule } from './modules/billing/billing.module';
import { AuditModule } from './modules/audit/audit.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
      envFilePath: path.resolve(__dirname, '../.env'),
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('isProduction') ? 'info' : 'debug',
          transport: config.get('isProduction')
            ? undefined
            : { target: 'pino-pretty', options: { colorize: true, singleLine: true } },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              '*.password',
              '*.passwordHash',
              '*.pin',
              '*.token',
              '*.secret',
              '*.piiKey',
              '*.encryptedProfile',
            ],
            censor: '[REDACTED]',
          },
          serializers: {
            req: (req: { method: string; url: string; id: string }) => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
          },
        },
      }),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('db.host'),
        port: config.get<number>('db.port'),
        username: config.get('db.user'),
        password: config.get('db.password'),
        database: config.get('db.name'),
        ssl: config.get<boolean>('db.ssl') ? { rejectUnauthorized: false } : false,
        entities: [path.resolve(__dirname, '**/*.entity.{ts,js}')],
        migrations: [path.resolve(__dirname, './migrations/*.{ts,js}')],
        migrationsRun: true,
        synchronize: false,
        logging: !config.get<boolean>('isProduction'),
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: config.get<number>('throttle.globalTtl') ?? 60000,
            limit: config.get<number>('throttle.globalLimit') ?? 100,
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('redis.host'),
          port: config.get('redis.port'),
          password: config.get('redis.password') || undefined,
          tls: config.get<boolean>('redis.tls') ? { rejectUnauthorized: false } : undefined,
        }),
      }),
    }),

    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    ClassroomModule,
    ProgressModule,
    BillingModule,
    AuditModule,
    RoomsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
