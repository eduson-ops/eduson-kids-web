# @eduson-kids/api-gateway — BFF (Node + Fastify)

API Gateway / Backend-for-Frontend для `@eduson-kids/web` и `@eduson-kids/desktop`.

> **Статус:** заглушка. Реализация — Sprint 1.

## Роль

- Единая точка входа для фронта (`/api/v1/*`).
- Агрегация вызовов в микросервисы (Auth, Content, Lesson, Gradebook).
- JWT-валидация + session state.
- Rate limiting + CORS.

## Стек

- **Node.js 20+**
- **Fastify 4** (см. [ADR-002](../../architecture/adr/ADR-002-game-engine.md) контекст)
- **TypeScript** strict mode
- **Zod** для валидации входов
- **Pino** для логов (структурированные JSON)

## Endpoints MVP (Stage 1)

| Метод | Путь | Что делает |
|-------|------|-----------|
| POST | /api/v1/auth/child-code | Вход ребёнка по 6-значному коду |
| POST | /api/v1/auth/parent/magic-link | Запрос magic-link для родителя |
| POST | /api/v1/auth/parent/verify | Верификация magic-link |
| GET | /api/v1/me | Текущий пользователь |
| GET | /api/v1/projects | Проекты ребёнка |
| POST | /api/v1/projects | Создать новый проект |
| PATCH | /api/v1/projects/:id | Сохранить прогресс |
| GET | /api/v1/projects/:id/share | Получить shareable ссылку |
| GET | /api/v1/shared/:token | Публичный view (read-only) |
| GET | /api/v1/worlds | Каталог шаблонов-миров |
| GET | /api/v1/missions | Каталог мини-миссий |
| POST | /api/v1/events | Analytics events (Amplitude/Metrica) |

## Инициализация

```bash
cd services/api-gateway
npm init -y  # (уже будет сделано при scaffolding)
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie \
            zod pino pino-pretty \
            @fastify/redis @fastify/postgres

mkdir -p src/{routes,plugins,schemas,lib}
```

## Структура

```
services/api-gateway/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts           # Entry — Fastify app
│   ├── config.ts           # env config (Zod-валидированный)
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── worlds.ts
│   │   └── events.ts
│   ├── plugins/
│   │   ├── auth-jwt.ts     # JWT validation
│   │   ├── rate-limit.ts
│   │   └── cors.ts
│   ├── schemas/            # Zod схемы запросов/ответов
│   └── lib/
│       ├── db.ts           # Postgres client
│       ├── redis.ts
│       └── logger.ts
└── test/                   # Vitest
```

## Dev

```bash
npm run dev                 # Fastify с hot-reload через tsx watch
npm run test                # Vitest unit + integration
npm run typecheck
```

## Deploy

- **MVP (Sprint 1):** `tsx src/server.ts` в docker-контейнере на Yandex Cloud K8s.
- **v1.0:** autoscaling 2-10 подов, healthchecks `/health` + `/ready`.

## Безопасность

- CSP/CORS настроены строго (только наши домены).
- Rate limiting 100 req/min / IP (больше — 429).
- JWT в HttpOnly + Secure cookies (не localStorage).
- Audit-log всех запросов с `userId` (см. [ADR-004](../../architecture/adr/ADR-004-multi-tenancy.md)).
- Input validation через Zod до DB.
