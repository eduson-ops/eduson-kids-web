import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  DB_HOST: string = 'localhost';

  @IsInt()
  DB_PORT: number = 5432;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  @IsOptional()
  DB_SSL: string = 'false';

  // D2-07: PG pool tuning (configurable). Defaults match configuration.ts.
  @IsInt()
  @IsOptional()
  PG_POOL_MAX: number = 50;

  @IsInt()
  @IsOptional()
  PG_IDLE_TIMEOUT_MS: number = 30000;

  @IsInt()
  @IsOptional()
  PG_CONNECTION_TIMEOUT_MS: number = 5000;

  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsInt()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string = '';

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES: string = '30d';

  @IsString()
  PII_KEY!: string;

  @IsString()
  @IsOptional()
  CORS_WHITELIST: string = 'http://localhost:5173';

  @IsString()
  @IsOptional()
  CSRF_SECRET: string = '';

  @IsString()
  @IsOptional()
  LIVEKIT_URL: string = '';

  @IsString()
  @IsOptional()
  LIVEKIT_API_KEY: string = '';

  @IsString()
  @IsOptional()
  LIVEKIT_API_SECRET: string = '';

  @IsString()
  @IsOptional()
  PUBLIC_BASE_URL: string = '';

  @IsString()
  @IsOptional()
  YUKASSA_SHOP_ID: string = '';

  @IsString()
  @IsOptional()
  YUKASSA_SECRET_KEY: string = '';

  @IsString()
  @IsOptional()
  YUKASSA_WEBHOOK_HMAC_SECRET: string = '';

  @IsString()
  @IsOptional()
  SCHOOL_CODES: string = '';

  @IsInt()
  THROTTLE_LOGIN_LIMIT: number = 5;

  @IsInt()
  THROTTLE_LOGIN_TTL: number = 900000;

  @IsInt()
  THROTTLE_GLOBAL_LIMIT: number = 100;

  @IsInt()
  THROTTLE_GLOBAL_TTL: number = 60000;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  // Cross-field validation: if LiveKit is enabled (URL set), keys must be present too.
  // Dev without LiveKit just omits all three and the rooms endpoints return 503.
  if (validatedConfig.LIVEKIT_URL) {
    if (!validatedConfig.LIVEKIT_API_KEY || !validatedConfig.LIVEKIT_API_SECRET) {
      throw new Error(
        'LIVEKIT_URL is set but LIVEKIT_API_KEY / LIVEKIT_API_SECRET are missing. ' +
          'Set both (from the LiveKit dashboard) or unset LIVEKIT_URL to disable rooms.',
      );
    }
  }

  return validatedConfig;
}
