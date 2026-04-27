# KubiK API — Backend (`@eduson/api`)

> NestJS 11 + TypeORM + PostgreSQL 16 + Redis 7 backend for the KubiK platform (kids' 3D coding + AI content factory + multi-tenant SaaS).

Production target: **Yandex Cloud Serverless Container** (`ru-central1`, FZ-152 compliant).
Local: Docker Compose (Postgres + Redis) + `npm run start:dev`.

---

## Architecture overview

```
src/
├── main.ts                  # Bootstrap: helmet, cookie-parser, CORS allowlist,
│                            #   global ValidationPipe (whitelist + transform),
│                            #   global prefix /api/v1, Swagger at /api/docs
├── app.module.ts            # ConfigModule + Pino logger + TypeORM + Throttler
│                            #   (Redis-backed) + Schedule + all feature modules
├── config/
│   ├── configuration.ts     # Typed config (db.*, redis.*, jwt.*, ai.*, ...)
│   ├── env.validation.ts    # class-validator schema for required env vars
│   └── data-source.ts       # Standalone DataSource for TypeORM CLI (migrations)
├── common/
│   ├── tenancy/             # TenantMiddleware + TenantContext (AsyncLocalStorage)
│   │                        #   + TenantSubscriber (auto-injects tenant_id on writes,
│   │                        #   blocks cross-tenant reads) + TenantGuard
│   ├── guards/              # JwtAuthGuard, RolesGuard
│   ├── interceptors/        # AuditInterceptor (writes audit_logs)
│   ├── filters/             # HttpExceptionFilter (sanitised errors)
│   ├── crypto/              # PII AES-256-GCM helpers
│   ├── decorators/          # @CurrentUser, @Public, @Roles
│   └── redis/               # Redis client provider (sessions + throttle + blacklist)
├── modules/
│   ├── auth/                # JWT (access 15m + refresh 30d httpOnly cookie)
│   │                        #   + VK ID OAuth (PKCE) + Сферум deep-link
│   ├── tenants/             # Tenant entity + slug resolver + TenantsService
│   ├── classroom/           # Teacher classrooms, student rosters, join codes
│   ├── progress/            # ProgressEvent firehose (lesson_solved, coins, streaks)
│   ├── projects/            # Studio projects (3D scenes) + share-links + versions
│   ├── lessons/             # Lesson entity + LessonVersion + AiPipelineService
│   │                        #   (mock | anthropic | openai | yandexgpt providers)
│   ├── admin/               # Admin endpoints — methodist review queue, tenants
│   ├── audit/               # audit_logs read API (for tenant admins)
│   ├── billing/             # Subscription state, YuKassa webhook (HMAC)
│   ├── rooms/               # LiveKit room tokens (lazy — disabled if env unset)
│   └── health/              # /health + /health/ready (terminus)
└── migrations/              # Numbered TypeORM migrations (run on boot)
```

### Auth flow

1. **Child PIN / Parent password / Teacher password** → `POST /api/v1/auth/login/{child|parent|teacher}` → returns `accessToken` (JWT, 15 min) in body **and** sets it in the `access_token` httpOnly cookie (24 h cap, `SameSite=Lax`, `Secure` in prod, `Path=/`). Also sets `refresh_token` httpOnly cookie (30 d, `SameSite=Strict`, `Secure` in prod).
2. **VK ID OAuth (PKCE)** → `GET /api/v1/auth/vk/start` → `/api/v1/auth/vk/callback` (state + verifier validated from cookie). Server exchanges code for VK profile, links or creates a user.
3. **Сферум deep-link** → `POST /api/v1/auth/sferum/link` (signed, short-lived). Sets the same JWT pair.
4. **Refresh** → `POST /api/v1/auth/refresh` (reads cookie) → rotates refresh + new access (and re-sets the `access_token` cookie). Old refresh blacklisted in Redis.
5. JWT payload: `{ sub, role, tnt (tenantId), tier, ptnt (parentTenantId), sys }`. The `sys` claim flips tenant bypass for super-admin tooling.

**F-12 — JWT delivery (XSS hardening, 2026-04-24):** the `JwtStrategy` reads the access token from either the `access_token` cookie *or* the legacy `Authorization: Bearer <jwt>` header (cookie checked first). The cookie is HttpOnly, so injected JS cannot exfiltrate it. The Bearer header path is kept for native clients (Capacitor) and any in-flight browser sessions that still hold a localStorage token. Frontend fetch wrappers must send `credentials: 'include'` so the cookie travels — this requires same-origin, or a CORS allowlist with `Access-Control-Allow-Credentials: true` (already configured for the SPA origin in `main.ts`). Set `USE_COOKIE_AUTH=false` to disable cookie issuance at the controller layer if a regression appears (header path keeps working).

### Multitenancy

Resolution priority in `TenantMiddleware`:

1. JWT claim `tnt`
2. `X-Tenant-Slug` header (only when `X-Internal-Secret` matches `INTERNAL_SERVICE_SECRET`)
3. Subdomain (`{slug}.kubik.school`)
4. `DEFAULT_TENANT_ID` (legacy fallback, audited via warn log; will be removed Q3 2026)

The resolved `tenantId` is pushed into `TenantContext` (`AsyncLocalStorage`). Then:

- `TenantSubscriber` auto-stamps `tenant_id` on insert and adds a `WHERE tenant_id = :ctx` predicate on all reads.
- `TenantGuard` rejects requests with no resolved tenant (except `@AnonymousAllowed` and `@Public`).
- Postgres **Row-Level Security** policies enforce isolation at the DB level too — TypeORM is the first guard, RLS is the belt-and-braces second.

See `src/common/tenancy/tenant.middleware.ts`, `tenant.subscriber.ts`, and migration `1714000001000-AddMultitenancy.ts`.

---

## Local development

### Prerequisites

- **Node.js ≥ 22.0.0** (engines field enforces it)
- **Docker** (for Postgres + Redis)
- **npm ≥ 10**

### Boot

```bash
# 1. Install
cd src/backend
npm install

# 2. Copy env template
cp .env.example .env
# Fill at minimum: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PII_KEY (32 bytes hex)

# 3. Start Postgres + Redis
docker compose up -d postgres redis

# 4. Run API (migrations execute on boot — see app.module.ts: migrationsRun: true)
npm run start:dev
# → http://localhost:3000
# → Swagger at http://localhost:3000/api/docs
# → Health at http://localhost:3000/health
```

### Docker Compose snippet (`docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-eduson}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-localdev}
      POSTGRES_DB: ${DB_NAME:-eduson_kids}
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]
```

`docker compose up api` additionally builds the API image from the local `Dockerfile` and runs the full stack.

---

## Migrations

TypeORM CLI is wrapped in npm scripts (data source: `src/config/data-source.ts`).

```bash
# Run pending migrations against the configured DB
npm run migration:run

# Revert the last applied migration
npm run migration:revert

# Generate a new migration from current entity diff
npm run migration:generate -- src/migrations/MyChange
# → creates src/migrations/<timestamp>-MyChange.ts
```

`migrationsRun: true` is set in `app.module.ts`, so on every API boot pending migrations apply automatically. **Disable that in environments where ops gates schema changes** (override via env in deploy pipeline if needed).

Existing migrations:

| File | Purpose |
|------|---------|
| `1714000000000-CreateInitialSchema.ts` | users, classrooms, progress_events, subscriptions, audit_logs |
| `1714000001000-AddMultitenancy.ts` | tenants table + tenant_id columns + RLS policies |
| `1714000002000-AddProjects.ts` | projects + project_versions (Studio scenes) |
| `1714000003000-AddUserExternalIdsAndConsent.ts` | VK / Сферум / consent log |
| `1714000004000-AddLessonsAndAdmin.ts` | lessons + lesson_versions for AI factory |
| `1714000005000-AddAuditPayload.ts` | audit_logs.payload jsonb |

---

## Tests

```bash
# Unit + integration (jest, src/**/*.spec.ts)
npm test

# Watch mode
npm run test:watch

# Coverage report → coverage/
npm run test:cov

# E2E (tests/*.spec.ts — admin, projects, student-roster, tenancy)
npm run test:e2e
```

E2E tests boot a real Nest app against the local Postgres + Redis (same env as `start:dev`). The `tenancy.spec.ts` file is the integration test of record for cross-tenant isolation — keep it green.

Load tests live under `tests/load/` (k6).

---

## API docs

- **Swagger UI**: `http://localhost:3000/api/docs` (auto-built from `@ApiTags` / `@ApiOperation` decorators).
- Disable in production by setting `DISABLE_SWAGGER=1`.
- Bearer + cookie auth schemes are pre-registered (`addBearerAuth`, `addCookieAuth('refresh_token')`).
- Global prefix is `/api/v1` (except `/health` which terminus owns).

---

## Environment variables

Validation lives in `src/config/env.validation.ts` (class-validator). Required fields fail boot if missing.

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | - | `development` | `development` \| `production` \| `test` |
| `PORT` | - | `3000` | |
| `PUBLIC_BASE_URL` | - | `https://kubik.school` | Used to validate OAuth `returnTo` |
| `DB_HOST` | - | `localhost` | |
| `DB_PORT` | - | `5432` | |
| `DB_USER` | **yes** | - | |
| `DB_PASSWORD` | **yes** | - | |
| `DB_NAME` | **yes** | - | |
| `DB_SSL` | - | `false` | `true` in prod (YC MDB) |
| `REDIS_HOST` | - | `localhost` | |
| `REDIS_PORT` | - | `6379` | |
| `REDIS_PASSWORD` | - | `''` | |
| `REDIS_TLS` | - | `false` | `true` for YC MDB Redis |
| `JWT_ACCESS_SECRET` | **yes** | - | ≥ 32 random bytes |
| `JWT_REFRESH_SECRET` | **yes** | - | distinct from access |
| `JWT_ACCESS_EXPIRES` | - | `15m` | |
| `JWT_REFRESH_EXPIRES` | - | `30d` | |
| `PII_KEY` | **yes** | - | 32-byte hex; AES-256-GCM key for encrypted profile columns |
| `CORS_WHITELIST` | - | `http://localhost:5173,...` | comma-separated origins |
| `CSRF_SECRET` | - | `''` | |
| `LIVEKIT_URL` | - | `''` | If set, `LIVEKIT_API_KEY` + `_SECRET` become required |
| `LIVEKIT_API_KEY` | conditional | - | |
| `LIVEKIT_API_SECRET` | conditional | - | |
| `YUKASSA_SHOP_ID` | - | `''` | Required to enable billing |
| `YUKASSA_SECRET_KEY` | - | `''` | |
| `YUKASSA_WEBHOOK_HMAC_SECRET` | - | `''` | |
| `SCHOOL_CODES` | - | `''` | comma-separated allowed school join codes |
| `AI_PROVIDER` | - | `mock` | `mock` \| `anthropic` \| `openai` \| `yandexgpt` |
| `ANTHROPIC_API_KEY` | conditional | `''` | Required when `AI_PROVIDER=anthropic` |
| `INTERNAL_SERVICE_SECRET` | - | - | Required for `X-Tenant-Slug` header overrides |
| `THROTTLE_LOGIN_LIMIT` | - | `5` | Login attempts per window |
| `THROTTLE_LOGIN_TTL` | - | `900000` | 15 min in ms |
| `THROTTLE_GLOBAL_LIMIT` | - | `100` | |
| `THROTTLE_GLOBAL_TTL` | - | `60000` | |
| `DISABLE_SWAGGER` | - | unset | Set in production |

---

## Deploy

CI/CD lives in `.github/workflows/api-deploy.yml`.

1. **Test stage** — boots Postgres 16 + Redis 7 service containers, runs `npm test` and `npm run build`.
2. **Build & push** — Docker image to Yandex Container Registry (`cr.yandex/$YC_CR_ID/eduson-api:<sha>` + `:latest`), GHA cache.
3. **Deploy** — `yc serverless container revision deploy` with `--memory 512m --cores 1 --execution-timeout 30s`.
4. **Smoke** — `curl ${CONTAINER_URL}/health`, fails the run on non-200.

Required GitHub secrets:

- `YC_CR_ID` — Container Registry ID
- `YC_SA_KEY` — Service-account key JSON
- `YC_SA_ID` — Service-account ID for the container
- `YC_FOLDER_ID` — YC folder
- `TEST_PII_KEY` — fixed 32-byte hex for CI

Manual deploy / rollback runbook lives in `ARCHITECTURE.md` ("Runbook" section).

---

## Modules at a glance

| Module | Mount | Highlights |
|--------|-------|-----------|
| `health` | `/health`, `/health/ready` | Terminus DB + Redis pings |
| `auth` | `/api/v1/auth/*` | child / parent / teacher + VK ID + Сферум + refresh rotation |
| `tenants` | `/api/v1/tenants/*` | Self-serve org bootstrap, slug resolver |
| `classroom` | `/api/v1/classroom/*` | Teacher classes + student roster + join codes |
| `progress` | `/api/v1/progress/*` | Append-only event store + 28-day aggregations |
| `projects` | `/api/v1/projects/*` | Studio scene CRUD + share-link publish |
| `lessons` | `/api/v1/lessons/*` | AI factory: queue → generate → review → publish |
| `admin` | `/api/v1/admin/*` | Methodist review queue, per-tenant settings |
| `audit` | `/api/v1/audit/*` | Read-only audit log viewer (tenant admin) |
| `billing` | `/api/v1/billing/*` | Subscription state + YuKassa webhook |
| `rooms` | `/api/v1/rooms/*` | LiveKit token mint (503 if env unset) |

---

## Security notes

- `helmet` with HSTS preload + CSP in production.
- httpOnly + `SameSite=Strict` refresh cookie scoped to `/api/v1/auth/refresh` only.
- Throttler is Redis-backed (so it survives multi-instance scale): three named throttlers (`global`, `login`, `guest`).
- Pino logger redacts `authorization`, `cookie`, `password`, `pin`, `token`, `secret`, `piiKey`, `encryptedProfile`.
- PII columns (`encrypted_profile`, `profile_iv`, `profile_auth_tag`) are AES-256-GCM with key from env (production: YC Lockbox).
- Random `X-API-Version` response header to obscure fingerprinting.
- Swagger gated behind `DISABLE_SWAGGER` for prod.

For threat model + emergency runbooks see `ARCHITECTURE.md`.
