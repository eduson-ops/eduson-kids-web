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
    // D2-07: PG pool tuning, configurable per environment.
    // Defaults raised vs. earlier 20/30000/2000:
    //  - max=50: pilot school can do 200 simultaneous students × few queries
    //    each without saturating; previous max=20 hit ceiling fast
    //  - connectionTimeoutMs=5000: argon2-heavy bulk-create (D-03 cycle)
    //    can starve the pool briefly under cold start; 2s was too tight
    poolMax: parseInt(process.env['PG_POOL_MAX'] ?? '50', 10),
    poolIdleTimeoutMs: parseInt(process.env['PG_IDLE_TIMEOUT_MS'] ?? '30000', 10),
    poolConnectionTimeoutMs: parseInt(
      process.env['PG_CONNECTION_TIMEOUT_MS'] ?? '5000',
      10,
    ),
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
    // Numeric TTL in seconds, used by JwtModule.signOptions.expiresIn and AuthService.issueTokens.
    // Tune via JWT_ACCESS_TTL / JWT_REFRESH_TTL env. For demo recommend JWT_ACCESS_TTL=3600 (1h)
    // so a live pitch session does not get logged out mid-demo by token expiry.
    accessTtlSec: parseInt(process.env['JWT_ACCESS_TTL'] ?? '900', 10),
    refreshTtlSec: parseInt(process.env['JWT_REFRESH_TTL'] ?? '2592000', 10),
  },

  piiKey: process.env['PII_KEY'] ?? '',

  cors: {
    whitelist: [
      ...(
        process.env['CORS_WHITELIST'] ??
        'http://localhost:5173,http://localhost:4173'
      ).split(','),
      'https://eduson-ops.github.io',
    ].filter(Boolean),
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

  // D2-16: YC Object Storage archival for audit logs (152-ФЗ retention).
  // Leave bucket/credentials unset in dev — service falls back to DB-only mode.
  auditArchive: {
    bucket: process.env['AUDIT_ARCHIVE_BUCKET'] ?? '',
    endpoint: process.env['AUDIT_ARCHIVE_ENDPOINT'] ?? 'https://storage.yandexcloud.net',
    region: process.env['AUDIT_ARCHIVE_REGION'] ?? 'ru-central1',
    accessKeyId: process.env['AUDIT_ARCHIVE_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AUDIT_ARCHIVE_SECRET_ACCESS_KEY'] ?? '',
    retainDays: parseInt(process.env['AUDIT_ARCHIVE_RETAIN_DAYS'] ?? '90', 10),
  },

  throttle: {
    loginLimit: parseInt(process.env['THROTTLE_LOGIN_LIMIT'] ?? '5', 10),
    loginTtl: parseInt(process.env['THROTTLE_LOGIN_TTL'] ?? '900000', 10),
    globalLimit: parseInt(process.env['THROTTLE_GLOBAL_LIMIT'] ?? '100', 10),
    globalTtl: parseInt(process.env['THROTTLE_GLOBAL_TTL'] ?? '60000', 10),
  },
});
