export default () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  isProduction: process.env['NODE_ENV'] === 'production',

  app: {
    publicBaseUrl: process.env['PUBLIC_BASE_URL'] ?? 'https://kubik.school',
  },

  db: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    user: process.env['DB_USER'] ?? '',
    password: process.env['DB_PASSWORD'] ?? '',
    name: process.env['DB_NAME'] ?? 'eduson_kids',
    ssl: process.env['DB_SSL'] === 'true',
  },

  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? '',
    tls: process.env['REDIS_TLS'] === 'true',
  },

  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET'] ?? '',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? '',
    accessExpires: process.env['JWT_ACCESS_EXPIRES'] ?? '15m',
    refreshExpires: process.env['JWT_REFRESH_EXPIRES'] ?? '30d',
  },

  piiKey: process.env['PII_KEY'] ?? '',

  cors: {
    whitelist: (
      process.env['CORS_WHITELIST'] ??
      'http://localhost:5173,http://localhost:4173,https://eduson-ops.github.io'
    ).split(','),
  },

  livekit: {
    // SECURITY: never hardcode LiveKit credentials. Previous fallback strings leaked briefly
    // to git history (incident 2026-04-24) and MUST be rotated in the LiveKit dashboard.
    url: process.env['LIVEKIT_URL'] ?? null,
    apiKey: process.env['LIVEKIT_API_KEY'] ?? null,
    apiSecret: process.env['LIVEKIT_API_SECRET'] ?? null,
  },

  yukassa: {
    shopId: process.env['YUKASSA_SHOP_ID'] ?? '',
    secretKey: process.env['YUKASSA_SECRET_KEY'] ?? '',
    webhookHmacSecret: process.env['YUKASSA_WEBHOOK_HMAC_SECRET'] ?? '',
  },

  schoolCodes: (process.env['SCHOOL_CODES'] ?? '').split(',').filter(Boolean),

  ai: {
    // Selects AiPipelineService provider: 'mock' (default) | 'anthropic' | 'openai' | 'yandexgpt'.
    // Anthropic only activates when AI_PROVIDER=anthropic AND ANTHROPIC_API_KEY is set;
    // otherwise the pipeline falls back to mock and logs a warning.
    provider: process.env['AI_PROVIDER'] ?? 'mock',
  },

  ANTHROPIC_API_KEY: process.env['ANTHROPIC_API_KEY'] ?? '',

  throttle: {
    loginLimit: parseInt(process.env['THROTTLE_LOGIN_LIMIT'] ?? '5', 10),
    loginTtl: parseInt(process.env['THROTTLE_LOGIN_TTL'] ?? '900000', 10),
    globalLimit: parseInt(process.env['THROTTLE_GLOBAL_LIMIT'] ?? '100', 10),
    globalTtl: parseInt(process.env['THROTTLE_GLOBAL_TTL'] ?? '60000', 10),
  },
});
