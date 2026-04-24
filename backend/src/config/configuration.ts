export default () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  isProduction: process.env['NODE_ENV'] === 'production',

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
    url: process.env['LIVEKIT_URL'] ?? 'wss://edusonlms-apk4qgt4.livekit.cloud',
    apiKey: process.env['LIVEKIT_API_KEY'] ?? 'APIsABHfKrBN9xG',
    apiSecret: process.env['LIVEKIT_API_SECRET'] ?? 'fTjEXOUcKkeeDuIUxyqfRKzQbdZFq4MXBjQbrSM66qLC',
  },

  yukassa: {
    shopId: process.env['YUKASSA_SHOP_ID'] ?? '',
    secretKey: process.env['YUKASSA_SECRET_KEY'] ?? '',
    webhookHmacSecret: process.env['YUKASSA_WEBHOOK_HMAC_SECRET'] ?? '',
  },

  schoolCodes: (process.env['SCHOOL_CODES'] ?? '').split(',').filter(Boolean),

  throttle: {
    loginLimit: parseInt(process.env['THROTTLE_LOGIN_LIMIT'] ?? '5', 10),
    loginTtl: parseInt(process.env['THROTTLE_LOGIN_TTL'] ?? '900000', 10),
    globalLimit: parseInt(process.env['THROTTLE_GLOBAL_LIMIT'] ?? '100', 10),
    globalTtl: parseInt(process.env['THROTTLE_GLOBAL_TTL'] ?? '60000', 10),
  },
});
