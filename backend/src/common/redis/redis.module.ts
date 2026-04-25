import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger('Redis');
        const host = config.get<string>('redis.host') ?? 'localhost';
        const port = config.get<number>('redis.port') ?? 6379;
        const useTls = config.get<boolean>('redis.tls');
        const client = new Redis({
          host,
          port,
          password: config.get<string>('redis.password') || undefined,
          tls: useTls ? { rejectUnauthorized: false } : undefined,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });

        // D2-06: structured Redis lifecycle logging via NestJS Logger.
        // Instead of one-off `console.error` we subscribe to the full event set so
        // ops can see reconnect storms, normal connect/ready, and final disconnect.
        let reconnectAttempt = 0;

        client.on('error', (err: Error) => {
          logger.error(
            `Redis: error [host=${host} attempt=${reconnectAttempt}] ${err.message}`,
          );
        });

        client.on('reconnecting', (delayMs?: number) => {
          reconnectAttempt += 1;
          logger.warn(
            `Redis: reconnecting [host=${host} attempt=${reconnectAttempt} delay=${delayMs ?? 0}ms]`,
          );
        });

        client.on('connect', () => {
          logger.log(`Redis: connect [host=${host} attempt=${reconnectAttempt}]`);
        });

        client.on('ready', () => {
          reconnectAttempt = 0;
          logger.log(`Redis: ready [host=${host}]`);
        });

        client.on('end', () => {
          logger.warn(`Redis: end [host=${host} attempt=${reconnectAttempt}]`);
        });

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
