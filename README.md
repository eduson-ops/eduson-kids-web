# KubiK — Kids' 3D Coding Platform

KubiK is a browser-first kids' edtech platform: a **3D Studio** with three progressive coding modes (Blockly visual blocks → mixed Blockly+Python → pure Python via Pyodide), an **AI content factory** that drafts lessons for methodist review, and a **multi-tenant SaaS** backend that serves both consumer parents and B2G school deployments (Сферум / Moya Shkola). One React 19 + Vite codebase ships to **GitHub Pages preview**, an **installable PWA**, and a **Capacitor 8** native Android shell (iOS planned). Backend is **NestJS 11 + TypeORM + Postgres 16 + Redis 7** on Yandex Cloud Serverless Containers (FZ-152 compliant, ru-central1).

Live preview: **https://eduson-ops.github.io/eduson-kids-web/**

---

## Quick start

```bash
# 1. Install (root + workspaces)
npm install

# 2. Dev server (web)
npm run dev                          # vite dev — base "/" — http://localhost:5173

# 3. Production builds (one codebase → 3 targets via VITE_TARGET)
npm run build                        # ghpages — base "/eduson-kids-web/" (default)
VITE_TARGET=pwa npm run build        # PWA — installable, with workbox service worker
VITE_TARGET=capacitor npm run build  # Capacitor — base "./" — for native Android/iOS
```

Capacitor sync after a `capacitor` build:

```bash
npx cap sync          # copies dist/ into android/ and ios/
npx cap open android  # opens Android Studio
```

Backend runs separately:

```bash
cd backend
docker compose up -d postgres redis
npm install
cp .env.example .env   # then fill JWT_*, PII_KEY, DB_*
npm run start:dev      # http://localhost:3000  · Swagger at /api/docs
```

---

## Architecture

```
src/
├── backend/                   NestJS 11 API — auth, tenancy, lessons, projects, billing
│   ├── src/modules/           auth · tenants · classroom · progress · projects · lessons · admin · billing · rooms · audit · health
│   ├── src/common/tenancy/    TenantMiddleware → TenantContext (AsyncLocalStorage) → TenantSubscriber + RLS
│   ├── src/migrations/        Numbered TypeORM migrations (apply on boot)
│   └── README.md              Backend dev guide
│
├── src/                       React 19 web app
│   ├── pages/                 Hub, Learn, Studio, Sites, Play, Me, Parent, Billing, Settings, Login, Designbook, Legal
│   ├── components/            Shared UI · 3D · mascot · chat · platform shell
│   ├── studio/                3D Studio: BuildScene, BuildTab, Palette, PropertiesPanel, ScriptTab, TestTab
│   ├── lib/                   progress, plural, curriculum, billing, audio, nikselChat, python-world-runtime
│   └── design/mascot/         Niksel SVG (19 emotion variants) + MascotMoodOverlay
│
├── public/                    Manifest, icons (npm run icons), 3D model fallbacks
├── android/                   Capacitor Android project (auto-synced)
├── ios/                       Capacitor iOS scaffold (planned)
├── infra/                     Yandex Cloud Function (Niksel proxy), Terraform stubs
├── apps/                      Reserved for additional bundles
├── packages/                  Shared libs (workspace targets)
├── services/                  Legacy Fastify gateway (being deprecated)
├── scripts/                   Build helpers (icons, deploy)
│
├── capacitor.config.ts        Bundle id, splash, plugin config
├── vite.config.ts             Target-aware base + PWA plugin
└── package.json               Workspace root
```

The web app is a single Vite SPA. Studio is a three-tab editor inside `src/studio/`: **Build** (drag 3D objects from a 500+ procedural model palette, place via @react-three/fiber), **Script** (per-object JS scripts plus a Blockly→Python pane that runs in-browser via Pyodide WASM), **Test** (play mode with Rapier physics). The same lesson runner powers Learn (curriculum) and the Hub demo. Niksel — the platform mascot — is a Kimi-vision proxy living in `infra/yc-niksel-proxy/`.

---

## Mobile

See **[MOBILE_BUILD.md](./MOBILE_BUILD.md)** for the full Capacitor 8 + PWA pipeline:

- 12 Capacitor plugins (camera, filesystem, haptics, keyboard, network, preferences, push-notifications, share, splash-screen, status-bar, app, device)
- PWA via `vite-plugin-pwa` + workbox-window — installable from any browser
- Touch-aware Studio (no drag-drop on mobile — explicit Add buttons)
- CodeMirror 6 for mobile code editing (Monaco only on desktop)
- Device tiering: low / mid / high → automatic DPR + post-processing toggle
- Audio unlock on first user gesture (Howler) — required by iOS Safari
- Brand colors: `#0C0533` bg, `#6B5CE7` accent · bundle id `com.edusonkids.app`

---

## Asset optimization

```bash
npm run optimize:images   # walks public/, generates side-by-side .webp for every .png > 100 KB (quality 80)
```

Originals are kept (some loaders / textures still resolve `.png` directly), so the script is safe to re-run — it skips up-to-date `.webp` siblings. Use it before a release build to shrink medieval-village & stylized-nature texture packs (~60–70% savings on diffuse/normal maps).

---

## Deployment

| Target | Pipeline | URL |
|--------|---------|-----|
| **GH Pages preview** | manual `npm run build` + `gh-pages` worktree push | https://eduson-ops.github.io/eduson-kids-web/ |
| **PWA** | same artifact as GH Pages with `VITE_TARGET=pwa` (workbox sw) | served from any host that serves the static `dist/` |
| **Capacitor Android** | `VITE_TARGET=capacitor npm run build && npx cap sync && npx cap open android` → Android Studio → release AAB | Play Store (planned Q2 2026) |
| **Capacitor iOS** | scaffolded; awaiting Apple Developer account | App Store (planned Q3 2026) |
| **Backend** | `.github/workflows/api-deploy.yml` → YC Container Registry → YC Serverless Container | Internal — see `backend/ARCHITECTURE.md` |

---

## Documentation map

- `backend/README.md` — backend dev guide (setup, migrations, tests, env vars, deploy)
- `backend/ARCHITECTURE.md` — layer diagram, ER model, threat model, runbooks
- `MOBILE_BUILD.md` — Capacitor + PWA build pipeline
- `../roadmap/audit_2026_04_24/ARCHITECTURE.md` — full-platform architecture (frontend + backend + AI factory + auth flows)
- `../roadmap/audit_2026_04_24/DEMO_GUIDE.md` — pitch demo flow (RU)
- `../README.md` — product brief, market context, traction

---

## License

Internal — Эдюсон Kids Platform. Legal entity registration scheduled Q2 2026.
Code: not currently distributed externally.
3D assets: 100% procedural three.js (no third-party licensing).
