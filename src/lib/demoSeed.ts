/**
 * Demo seed — pre-populates localStorage with a believable progress snapshot
 * so a fresh demo session shows non-empty state immediately (sales calls,
 * screenshots, investor pitches). Idempotent: keyed off `kubik-demo-seeded`.
 *
 * Wired into App.tsx behind `import.meta.env.VITE_DEMO_SEED === 'true'` —
 * never runs in normal user builds.
 *
 * Reuses the same storage keys as `lib/progress.ts` and `lib/achievements.ts`
 * so the rest of the app reads it transparently:
 *   - `ek_lesson_progress_v1`  (number[] of completed lesson numbers)
 *   - `ek_achievements_v1`     (string[] of unlocked achievement IDs)
 *   - `ek_streak_v1`           ({ current, longest, lastDay, ... })
 */

const SEED_FLAG_KEY = 'kubik-demo-seeded'

const KEY_COMPLETED = 'ek_lesson_progress_v1'
const KEY_ACHIEVEMENTS = 'ek_achievements_v1'
const KEY_STREAK = 'ek_streak_v1'

// L1-L6 game-track + L1-L6 web-track. Curriculum lessons are numbered
// sequentially; game-track is 1-6, web-track is 101-106 (matches courses
// generated catalog convention).
const DEMO_COMPLETED_LESSONS: number[] = [
  1, 2, 3, 4, 5, 6,            // game-track L1-L6
  101, 102, 103, 104, 105, 106, // web-track L1-L6
]

// Three achievement IDs that exist in lib/achievements.ts (verified):
//  - first-lesson  (first completed lesson)
//  - first-script  (first per-object script — proxy for "first block placed")
//  - web-author    (any published site — proxy for "first share")
const DEMO_ACHIEVEMENTS: string[] = ['first-lesson', 'first-script', 'web-author']

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function seedDemoStateIfEmpty(): void {
  try {
    if (localStorage.getItem(SEED_FLAG_KEY) === 'true') return

    // 1. Completed lessons
    localStorage.setItem(KEY_COMPLETED, JSON.stringify(DEMO_COMPLETED_LESSONS))

    // 2. Achievements
    localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(DEMO_ACHIEVEMENTS))

    // 3. 4-day streak — last 4 dates ending today
    const today = new Date()
    const lastDay = ymd(today)
    localStorage.setItem(
      KEY_STREAK,
      JSON.stringify({
        current: 4,
        longest: 4,
        lastDay,
        freezes: 1,
        freezeGrantedWeek: '',
      }),
    )

    localStorage.setItem(SEED_FLAG_KEY, 'true')
  } catch {
    /* localStorage unavailable / quota — silent no-op */
  }
}
