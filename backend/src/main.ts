import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import * as cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import 'reflect-metadata';
import { AppModule } from './app.module';

// D-07: одноразовый build-id, генерится один раз при старте процесса.
// Раньше middleware дёргал Math.random() на каждый запрос — пустая трата CPU.
const apiBuildId = randomBytes(8).toString('hex');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const isProduction = config.get<boolean>('isProduction') ?? false;
  const port = config.get<number>('port') ?? 3000;

  // Security headers
  app.use(
    helmet({
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: isProduction,
    }),
  );

  // Gzip compression for JSON / static responses (AI lesson payloads can be large).
  // threshold=1024 skips small responses where compression overhead > savings.
  app.use(compression({ threshold: 1024 }));

  // Cookie parsing (needed for httpOnly refresh token)
  app.use(cookieParser());

  // CORS
  const corsWhitelist = config.get<string[]>('cors.whitelist') ?? [];
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || corsWhitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  // Swagger — disabled only when DISABLE_SWAGGER is set
  if (!process.env.DISABLE_SWAGGER) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('KubiK API')
      .setDescription('Eduson Kids platform — backend API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // X-API-Version: build-id один раз на boot (D-07).
  // Раньше: Math.random() на каждый запрос — pure waste.
  app.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    res.setHeader('X-API-Version', `1.0+${apiBuildId}`);
    next();
  });

  // D2-02: Graceful shutdown.
  // Включает Nest lifecycle хуки `OnModuleDestroy` / `OnApplicationShutdown`
  // на SIGTERM/SIGINT — критично для:
  //   - k8s rolling deploys (pod получает SIGTERM, должен закрыть BullMQ-воркеры,
  //     завершить активные TypeORM-транзакции, отписаться от Redis pub/sub);
  //   - `docker stop` / Cloud Run cold-stop;
  //   - локальный Ctrl+C без потери jobs из ai-lessons очереди.
  app.enableShutdownHooks();

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
