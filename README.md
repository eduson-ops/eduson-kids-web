# Eduson Kids Platform

Образовательная игровая платформа для детей 8-14 лет — Python и Scratch через создание 3D-миров.

Полный brief, стратегия, ADR, roadmap — в parent-директории (`../`) как Obsidian vault. Вход: [../\_MOC.md](../\_MOC.md).

## Статус

**Stage 1 — B2C через Eduson Kids (MVP 0-6 мес).** См. [../STRATEGIC_AMENDMENT_01_stage1_b2c_first.md](../STRATEGIC_AMENDMENT_01_stage1_b2c_first.md).

## Монорепозиторий

```
src/
├── apps/
│   ├── web/            # React + Vite + TypeScript (main web app)
│   ├── desktop/        # Tauri 2 wrapper (Windows native)
│   └── game/           # Godot 4 project (HTML5 export target)
├── packages/
│   ├── blockly-python/ # Кастомные Blockly-блоки + экспорт в Python
│   ├── shared-types/   # Общие TS-типы (API, модели)
│   └── ui-kit/         # Переиспользуемые React-компоненты
├── services/
│   ├── api-gateway/    # Node Fastify BFF
│   ├── auth/           # Go (позже)
│   ├── content/        # Node (позже)
│   └── realtime/       # Colyseus (Stage 2+)
└── docs/               # Инженерные доки, runbook, архитектурные решения кода
```

## Префикс пакетов

Все npm-пакеты — под scope `@eduson-kids/`:
- `@eduson-kids/web`
- `@eduson-kids/desktop`
- `@eduson-kids/blockly-python`
- `@eduson-kids/shared-types`
- `@eduson-kids/ui-kit`
- `@eduson-kids/api-gateway`
- `@eduson-kids/content`

## Требования

- Node.js ≥20
- npm ≥10 (workspaces)
- Rust + Cargo (для Tauri)
- Godot 4.4+ (только для `apps/game`)
- Python 3.12+ (опц., для Pyodide dev-утилит)

## Quick start

```bash
# Из корня src/
npm install                     # ставит все workspaces deps
npm run dev:web                 # запускает web-приложение на localhost:5173

# Для desktop (Tauri, после scaffolding):
npm run dev:desktop             # собирает Tauri-окно с web внутри
```

## Ключевые архитектурные решения

- **ADR-001** — Tauri 2 + Web + Android (не Electron): см. [../architecture/adr/ADR-001-desktop-vs-web-first.md](../architecture/adr/ADR-001-desktop-vs-web-first.md)
- **ADR-002** — Godot 4 HTML5 + Pyodide + Blockly (не Unity): см. [../architecture/adr/ADR-002-game-engine.md](../architecture/adr/ADR-002-game-engine.md)
- **ADR-003** — Pre-publish UGC модерация: см. [../architecture/adr/ADR-003-ugc-moderation.md](../architecture/adr/ADR-003-ugc-moderation.md)
- **ADR-004** — Shared Postgres + RLS мультитенант: см. [../architecture/adr/ADR-004-multi-tenancy.md](../architecture/adr/ADR-004-multi-tenancy.md)
- **ADR-005** — VK ID → Сферум → ЭЖД → LECTA интеграции: см. [../architecture/adr/ADR-005-sferum-integration.md](../architecture/adr/ADR-005-sferum-integration.md)

## Sprint 0 PoC goals

См. [../roadmap/sprint_0_plan.md](../roadmap/sprint_0_plan.md).

1. Godot HTML5 → Tauri bundle ≤30 МБ.
2. Blockly + Pyodide в Web Worker — Python-код ученика исполняется в sandbox.
3. Deploy на Yandex Cloud (dev) — регистрация + простая сессия.

## Compliance

- Серверы в РФ (Yandex Cloud, VK Cloud резерв) — 152-ФЗ.
- Модерация UGC: pre-publish + AI-класс (v1.0).
- Согласие родителя для детей до 14 лет.
- План регистрации в Реестре отечественного ПО — Stage 2.
