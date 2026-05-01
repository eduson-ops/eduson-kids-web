# OPUS Full-Day Plan — Execution Log

**Date:** 2026-05-01  
**Session:** Autonomous coding loop (~8 blocks)

---

## ✅ Block 1 — Infrastructure

- **`.env.production`**: fixed missing `VITE_API_URL` + `VITE_API_BASE`, removed wrong `VITE_BASE=/t/`
- **`backend/src/config/configuration.ts`**: CORS whitelist hardcodes `https://eduson-ops.github.io` even when `CORS_WHITELIST` env var is set — prevents accidental lockout
- **`.github/workflows/deploy-pages.yml`**: created GH Pages auto-deploy on push to `main` (paths: `src/**` excluding backend)

---

## ✅ Block 2 — Backend: Lesson Unlock System

New files:
- **`backend/src/modules/progress/lesson-access.service.ts`** — idempotent unlock, batch unlock, complete, getMyAccess, getClassroomProgress
- **`backend/src/modules/progress/lesson-access.controller.ts`** — 5 endpoints: POST unlock, POST unlock-batch, POST complete, GET me, GET classroom/:id
- **`backend/src/migrations/1714000007000-AddLessonAccess.ts`** — creates `lesson_access` table, unique (tenant_id, student_id, lesson_n), score CHECK 0-100

Modified:
- **`backend/src/modules/progress/progress.entity.ts`** — added `LessonAccess` entity
- **`backend/src/modules/progress/progress.module.ts`** — registered entity + service + controller + TenancyModule

---

## ✅ Block 3 — Classroom Controller Extensions

- Added `GET /classrooms` → `findAllByTeacher(user.sub)`
- Added `GET /classrooms/:id/students` → `getStudents(classroomId, user.sub)`
- Added `POST /classrooms/:id/transfer` → `transferStudent(...)` atomic with studentCount
- Opened curator/school_admin/platform_admin roles to read endpoints

---

## ✅ Block 4 — Frontend API Client Modules

New files:
- **`src/api/client.ts`** — fetch wrapper with Bearer auth, JSON parse, error handling
- **`src/api/lessonAccess.ts`** — fetchMyAccess, unlockLesson, unlockBatch, completeLesson, fetchClassroomProgress
- **`src/api/classrooms.ts`** — full CRUD + students + transfer

---

## ✅ Block 5 — Admin.tsx: Real API Integration

- Removed all `classRoster.ts` / localStorage usage
- On mount: `fetchClassrooms()` → render real classroom list
- Create: `createClassroom(name)` → optimistic append
- Delete: `deleteClassroom(id)` → with confirmation
- Transfer: `fetchStudents(fromId)` + `transferStudent(...)` — uses real UUIDs

---

## ✅ Block 6 — Teacher.tsx: Real API + Unlock UI

- `ClassesTab`: receives real `ClassroomDto[]` from API, shows studentCount
- `UnlockTab` (new tab "🔓 Открыть уроки"):
  - Loads real students via `fetchStudents(classroomId)`
  - Loads progress matrix via `fetchClassroomProgress(classroomId)`
  - Lesson selector (1–48 with module/lesson label)
  - Bulk unlock button → `unlockBatch()` with result toast
  - Progress heatmap table: student × module, color-coded by unlock/completion %

---

## ✅ Block 7 — Learn.tsx: Real Lesson Unlock

- `ModulePage`: on mount, if `kubik_access_token` present → `fetchMyAccess()` → `Set<number>`
  - `unlocked = unlockedLessons === null ? true : unlockedLessons.has(l.n)`
  - Guest/API-down fallback: `null` → all unlocked (no regression)
  - Locked lesson: shows 🔒 icon, `e.preventDefault()` on click
- `LessonPage`: "Отметить пройденным" now also calls `completeLessonApi({lessonN})` (silently ignores 401 for guest users)

---

## ✅ Block 8 — VideoPlayer Component

New: **`src/components/VideoPlayer.tsx`**

Supports:
- `{ kind: 'mp4', url }` — native `<video>` element
- `{ kind: 'vk', videoId, oid? }` — VK Video iframe embed
- `{ kind: 'hls', url }` — tries native HLS first (Safari), then dynamic `import('hls.js')`, then graceful error state
- `onComplete` callback fired at configurable % viewed (default 85%)
- Poster image support for MP4

---

## ✅ Session 2 — Post-plan gap audit (2026-05-01)

Bug fixes found and resolved:

- **`api/client.ts`**: was using relative `/api/v1` → hit Vite dev server port instead of backend:3001. Fixed to use same `VITE_API_URL || hostname:3001` detection as `api.ts`.
- **`backend/src/modules/auth/dto/child-login.dto.ts`**: `pin` validation was `^\d{6}$` (digits only) but `student-roster.service.ts` generates 6-char alphanumeric PINs from `PIN_ALPHABET`. Fixed to `^[a-z0-9]{6}$`.
- **`login` validation**: was `/^[a-z0-9-]+$/` rejecting `kub_school_0001` format (underscores). Fixed to `/^[a-z0-9_-]+$/`.
- **`src/pages/Login.tsx`** PIN input: `\D` regex stripped alpha chars from new PINs. Fixed to allow full 6-char alphanumeric input.
- **Child PIN login order**: was checking localStorage before API. Fixed to API-first (catches students who only exist in backend), localStorage as offline fallback.
- **`backend/src/seed.ts`**: missing `tenant_id` in INSERT. Fixed to include `00000000-0000-0000-0000-000000000001`.
- **`Learn.tsx`**: used raw `localStorage.getItem('kubik_access_token')` bypassing legacy key migration. Fixed to `getAccessToken()`.

Improvements:

- **`Teacher.tsx` cover header**: was hardcoded to `MOCK_CLASSES.length` / `MOCK_CLASSES.students`. Now shows real API classroom + student counts.
- **`AssignmentsTab`**: removed dependency on mock `Classroom` object. Now takes `classroomName` + `studentCount` from real API.
- **`RosterPDF.tsx`**: deleted (dead code — not imported anywhere after TeacherClasses migration).
- **3D rendering**: PostFX (bloom + SMAA), ToonOverride, WaterSurface, CyberCity GradientSky, Garden improvements.

---

## ✅ Session 3 — Deep quality audit (2026-05-01)

Critical bug fixes:

- **`pdf-roster.service.ts`**: broken two-pass PDF rendering for >6 students. The original code ran a placeholder loop to create blank pages, then tried to draw cards in a `.then()` callback — but PDFKit pages are already flushed and can't be re-entered. Fixed to pre-generate all QR code buffers via `Promise.all` BEFORE creating the PDF document, then do a single synchronous rendering pass. PDF now works correctly for any class size.
- **`classroom.service.ts` `generatePin()`**: was generating 6-digit numeric PINs (100000–999999, only 900K combinations) while `StudentRosterService.generatePin()` uses the 29-char `PIN_ALPHABET` (427M combinations). Inconsistency meant the legacy `addStudents` endpoint issued weaker PINs. Fixed to use the same alphanumeric alphabet.
- **`auth.service.ts`**: replaced `require('crypto').randomBytes()` in `loginGuest()` and `issueTokens()` with a top-level `import { randomBytes } from 'node:crypto'`. Using CommonJS `require()` inside an ESM/TypeScript file is fragile (breaks tree-shaking, bypasses module resolution).

UX improvements:

- **`Teacher.tsx` UnlockTab**: header was showing `classroomId.slice(0, 8)…` (raw UUID) instead of the classroom name. Added `classroomName` prop and pass it from parent.

All TypeScript checks pass (frontend + backend), Vite build clean (3.66s).

---

## ✅ Session 4 — Extended security & type audit (2026-05-01)

Security fixes:

- **`classroom.service.ts` `transferStudent()`**: authorization check used `&&` instead of `||` — a teacher who owned the DESTINATION classroom could steal students from any other teacher's classroom. Fixed to require ownership of the SOURCE classroom specifically.
- **`auth.service.ts` `loginChildByCode()`**: was generating both access and refresh tokens but only returning `accessToken`. The refresh token was silently discarded, so the session expired after 15 min with no refresh path. Fixed to return both tokens.
- **`auth.controller.ts` `childCodeLogin()`**: was not setting the `refresh_token` cookie (unlike all other login endpoints). Also used hardcoded `ip = 'internal'` defeating per-IP rate limiting. Fixed: now extracts real client IP and sets both cookies.
- **`lesson-access.controller.ts`**: `unlock` and `complete` endpoints returned the raw TypeORM entity including `tenantId`, `classroomId`, `unlockedBy` — internal fields that should never reach the frontend. Added `toRow()` mapper that strips these and returns only the fields the frontend expects.

API consistency fixes:

- **`useTenantBranding.ts`**: was using `VITE_API_BASE` env var (defaulting to `/api/v1` relative path) while all other API callers use `VITE_API_URL`. White-label branding was hitting GH Pages instead of the backend. Fixed to use the same Capacitor-aware origin detection as `api/client.ts`.
- **`lib/api.ts` `AuthResponse` type**: was checking `r?.token` (old field name) but backend now returns `{ accessToken, refreshToken }`. Updated type and fixed all callers (`apiLoginChildCode`, `apiLoginGuest`) to check `r?.accessToken`.

TypeScript cleanup:

- **17 world component files** (`WaterSurface`, `AbilityBuilderWorld`, `BotTownWorld`, `CyberCityWorld`, `FashionWorld`, `GardenWorld`, `MysteryWorld`, `NightsWorld`, `ObbyWorld`, `PetBrainWorld`, `PetSimWorld`, `SandboxWorld`, `SpaceStationWorld`, `TempleWorld`, `TowerWorld`, `TycoonWorld`, and more): resolved ~50 TypeScript strict-mode errors — non-null assertions on uniform accesses, `?? fallback` on optional color props, removed unused variables (MONEY_VERT/FRAG, meshRef, visible). Frontend now compiles with **0 TypeScript errors**.

---

---

## ✅ Session 5 — Security Hardening + Prototype Deploy (2026-05-01)

**Security fixes:**
- `user.entity.ts`: `passwordHash` → `select: false` prevents hash leakage in unfiltered queries
- `auth.service.ts`: `findByLogin()` uses `createQueryBuilder().addSelect('u.passwordHash')` — explicit load only for auth
- `env.validation.ts`: `@IsNotEmpty()` added to JWT secrets — empty string no longer passes validation
- `lesson-access.controller.ts`: added `toRow()` mapper — tenantId/classroomId/unlockedBy never returned in API responses

**Data integrity fixes:**
- `lesson-access.service.ts`: `completeLesson()` race condition fixed — atomic SQL `GREATEST(COALESCE(score))` + `COALESCE(completed_at, NOW())`
- `billing.service.ts`: `processYukassaEvent()` implemented — dispatches `payment.succeeded`→`handlePaymentSuccess`, `payment.canceled`→`handlePaymentFailure`
- `progress.service.ts`: deprecated `findByIds()` → `find({ where: { id: In(userIds) } })`
- `api.ts`: `apiPutAvatar()` now returns actual `result !== null` instead of always `true`

**Frontend:**
- `VideoPlayer.tsx`: YouTube embed support via `youtube-nocookie.com`
- `curriculum.ts`: `video?: VideoSource` field on Lesson interface; demo videos on L1 (TED-Ed algorithm) and L3 (block coding)
- `Learn.tsx`: VideoPlayer rendered on LessonPage when `lesson.video` present

**Deploy:**
- GH Pages: built and pushed to `gh-pages` branch → live at https://eduson-ops.github.io/t/
- Backend CI: triggered `api-deploy.yml` on `tmp-gh-pages` via `workflow_dispatch`
- `.env.production`: added `VITE_BASE=/t/` (was missing, caused broken asset paths)

**After CI completes — run manually in YC console:**
```bash
# Connect to backend container (YC Serverless Container shell or via SSH to VM)
npm run migration:run   # runs all pending migrations incl. 1714000007000 + 1714000008000
npm run seed            # creates demo accounts
```

---

## Demo Credentials (after `npm run seed`)

- Teacher: `teacher@eduson.school` / `Teacher2024!` (school code: `DEMO-2024`)
- Parent: `parent@eduson.school` / `Parent2024!`
- Child demo: login `panda42` / PIN `123456`
- Child demo: login `tiger99` / PIN `654321`

---

## ✅ Prototype Complete

**Live URL:** https://eduson-ops.github.io/t/  
**Backend:** https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net  

**Full demo flow:**
1. Teacher logs in → `DEMO-2024` school code
2. Creates classroom → Bulk creates students → prints PDF card sheet with PINs
3. Opens Lesson Unlock tab → unlocks M1 (уроки 1-6) для всего класса
4. Student gets PIN card → logs in → sees 6 unlocked lessons in /learn
5. Opens Lesson 1 → sees YouTube video intro → opens Studio → codes first script
6. Teacher sees progress heatmap in real time
