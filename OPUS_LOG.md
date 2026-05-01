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

## Skipped / Deferred

- VideoPlayer integration into LessonPage (no video URLs in curriculum yet)
- `hls.js` npm install (deferred until actual HLS content exists)
- Smoke test against live YC backend (requires deploy)
- Backend deployment to YC (requires `TF apply` or manual container push)

---

## Next Steps

1. Push to `main` → GH Pages CI auto-deploys frontend
2. Deploy backend to YC Serverless Container (see `OPUS_FULLDAY_PLAN.md` Block 0)
3. Create first real classroom + students via Admin UI
4. Teacher unlocks lessons 1–6 (M1) → verify student sees them in Learn.tsx
