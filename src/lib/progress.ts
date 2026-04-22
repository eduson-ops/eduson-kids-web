/**
 * Progress tracker — localStorage-based.
 * Следит за: пройденными уроками, результатами квизов, стриком, разблокированными ачивками.
 */

const KEY_COMPLETED = 'ek_lesson_progress_v1'
const KEY_QUIZ = 'ek_quiz_results_v1'
const KEY_STREAK = 'ek_streak_v1'
const KEY_ACHIEVEMENTS = 'ek_achievements_v1'

const listeners = new Set<() => void>()

// ─── Completed lessons ───────────────────────────────
let completed: Set<number> = loadCompleted()

function loadCompleted(): Set<number> {
  try {
    const raw = localStorage.getItem(KEY_COMPLETED)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch { return new Set() }
}
function persistCompleted() {
  try { localStorage.setItem(KEY_COMPLETED, JSON.stringify([...completed])) } catch { /* quota */ }
}

// ─── Quiz results ────────────────────────────────────
export interface QuizResult {
  correct: number
  total: number
  attempts: number         // сколько раз проходил
  bestScore: number        // 0..1
  updatedAt: number
}

let quizResults: Record<number, QuizResult> = loadQuiz()

function loadQuiz(): Record<number, QuizResult> {
  try {
    const raw = localStorage.getItem(KEY_QUIZ)
    if (!raw) return {}
    return JSON.parse(raw) as Record<number, QuizResult>
  } catch { return {} }
}
function persistQuiz() {
  try { localStorage.setItem(KEY_QUIZ, JSON.stringify(quizResults)) } catch { /* quota */ }
}

// ─── Streak ──────────────────────────────────────────
interface StreakState {
  current: number        // дней подряд
  longest: number
  lastDay: string        // YYYY-MM-DD
}

let streak: StreakState = loadStreak()
function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY_STREAK)
    if (!raw) return { current: 0, longest: 0, lastDay: '' }
    return JSON.parse(raw) as StreakState
  } catch { return { current: 0, longest: 0, lastDay: '' } }
}
function persistStreak() {
  try { localStorage.setItem(KEY_STREAK, JSON.stringify(streak)) } catch { /* quota */ }
}
function ymd(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

// ─── Achievements ────────────────────────────────────
let achievements: Set<string> = loadAchievements()
function loadAchievements(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_ACHIEVEMENTS)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch { return new Set() }
}
function persistAchievements() {
  try { localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify([...achievements])) } catch { /* quota */ }
}

// ─── Pub-sub ─────────────────────────────────────────
function emit() { for (const l of listeners) l() }
export function subscribeProgress(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

// ─── Completed API ───────────────────────────────────
export function isLessonDone(n: number): boolean { return completed.has(n) }
export function markLessonDone(n: number) {
  if (completed.has(n)) return
  completed = new Set([...completed, n])
  persistCompleted()
  touchStreak()
  emit()
}
export function unmarkLesson(n: number) {
  if (!completed.has(n)) return
  const next = new Set(completed)
  next.delete(n)
  completed = next
  persistCompleted()
  emit()
}
export function countDone(): number { return completed.size }
export function countDoneInModule(_moduleN: number, lessonNumbers: number[]): number {
  return lessonNumbers.filter((n) => completed.has(n)).length
}
export function getCurrentLesson(all: number[]): number {
  for (const n of all) if (!completed.has(n)) return n
  return all[all.length - 1]
}

// ─── Quiz API ────────────────────────────────────────
export function getQuizResult(lessonN: number): QuizResult | undefined {
  return quizResults[lessonN]
}
export function recordQuizResult(lessonN: number, correct: number, total: number) {
  const prev = quizResults[lessonN]
  const score = total > 0 ? correct / total : 0
  quizResults = {
    ...quizResults,
    [lessonN]: {
      correct,
      total,
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, score),
      updatedAt: Date.now(),
    },
  }
  persistQuiz()
  touchStreak()
  emit()
}
export function countPerfectQuizzes(): number {
  return Object.values(quizResults).filter((r) => r.bestScore >= 1).length
}
export function averageQuizScore(): number {
  const values = Object.values(quizResults)
  if (values.length === 0) return 0
  return values.reduce((s, r) => s + r.bestScore, 0) / values.length
}

// ─── Streak API ──────────────────────────────────────
export function getStreak(): StreakState { return streak }
export function touchStreak() {
  const today = ymd()
  if (streak.lastDay === today) return
  const yesterday = ymd(new Date(Date.now() - 86400_000))
  if (streak.lastDay === yesterday) {
    streak = { ...streak, current: streak.current + 1, lastDay: today }
  } else {
    streak = { ...streak, current: 1, lastDay: today }
  }
  if (streak.current > streak.longest) streak = { ...streak, longest: streak.current }
  persistStreak()
}

// ─── Achievements API ────────────────────────────────
export function hasAchievement(id: string): boolean { return achievements.has(id) }
export function unlockAchievement(id: string): boolean {
  if (achievements.has(id)) return false
  achievements = new Set([...achievements, id])
  persistAchievements()
  emit()
  return true
}
export function getUnlockedAchievements(): Set<string> { return achievements }
export function countAchievements(): number { return achievements.size }

// ─── Reset ───────────────────────────────────────────
export function resetAllProgress() {
  completed = new Set()
  quizResults = {}
  achievements = new Set()
  streak = { current: 0, longest: 0, lastDay: '' }
  persistCompleted(); persistQuiz(); persistAchievements(); persistStreak()
  emit()
}
