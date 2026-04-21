# @eduson-kids/desktop — Tauri 2 wrapper

Нативное десктопное приложение Windows (позже macOS/Linux) — тонкая Tauri-обёртка вокруг [`@eduson-kids/web`](../web/).

> **Статус:** заглушка. Полноценная инициализация — задача Sprint 0 (см. [../../roadmap/sprint_0_plan.md](../../roadmap/sprint_0_plan.md) блок A3).

## Почему Tauri, а не Electron

См. [ADR-001](../../architecture/adr/ADR-001-desktop-vs-web-first.md). TL;DR: Tauri 30 МБ vs Electron 150+ МБ, критично для школьного железа.

## Как проинициализировать

Из корня монорепозитория:

```bash
cd apps/desktop
npx @tauri-apps/cli@latest init \
  --app-name "Eduson Kids" \
  --window-title "Eduson Kids Platform" \
  --frontend-dist "../web/dist" \
  --dev-url "http://localhost:5173" \
  --before-dev-command "npm -w @eduson-kids/web run dev" \
  --before-build-command "npm -w @eduson-kids/web run build"
```

После init:
- В `src-tauri/` появится Rust-код + `tauri.conf.json`.
- Убедитесь что в `tauri.conf.json` поле `identifier` установлено в `kids.eduson.platform`.
- Подставьте иконку в `src-tauri/icons/` (есть `tauri icon <path-to-png>`).

## Разработка

```bash
# Из корня монорепозитория:
npm run dev:desktop

# Или из этой папки:
npx @tauri-apps/cli@latest dev
```

## Сборка MSI (Windows-installer)

```bash
npx @tauri-apps/cli@latest build
# → src-tauri/target/release/bundle/msi/Eduson Kids_0.0.1_x64_en-US.msi
```

Целевой размер MSI: **≤30 МБ** (без Godot-бандла) / **≤50 МБ** (с Godot-сценой).

## Code signing (для production)

Требуется **EV Code Signing Certificate** (~400 € /год через DigiCert/Sectigo). Без него Windows Defender SmartScreen блокирует установку.

Настройка: `src-tauri/tauri.conf.json`:
```json
"bundle": {
  "windows": {
    "certificateThumbprint": "...",
    "digestAlgorithm": "sha256",
    "timestampUrl": "http://timestamp.digicert.com"
  }
}
```

## Требования к CI

- Rust toolchain (`rustup` + MSVC toolchain на Windows).
- WebView2 — предустановлено в Windows 10 1809+.
- Для старых Win10 — Tauri автоматически включает installer.

## Следующие шаги

- [ ] Sprint 0 A3: run init, verify empty window opens with web content.
- [ ] Sprint 0 A3: measure MSI size, confirm ≤30 МБ target.
- [ ] Sprint 1: auth через VK ID (deep link `eduson-kids://auth/callback`).
- [ ] Sprint 1: auto-updater (Tauri built-in).
- [ ] Stage 2: macOS + Linux targets.
