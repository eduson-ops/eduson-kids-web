/**
 * Progress tracker — localStorage-based.
 * Следит за: пройденными уроками, результатами квизов, стриком, разблокированными ачивками.
 */

import { apiProgressEvent } from './api'

export const KEY_COMPLETED = 'ek_lesson_progress_v1'
export const KEY_QUIZ = 'ek_quiz_results_v1'
const KEY_STREAK = 'ek_streak_v1'
const KEY_ACHIEVEMENTS = 'ek_achievements_v1'
export const DAILY_GOAL_KEY = 'ek_daily_goal_minutes'

const MS_PER_DAY = 86_400_000
const MS_PER_WEEK = 604_800_000
const MAX_STREAK_FREEZES = 3
const LESSON_DEFAULT_MINUTES = 12
const LESSON_DEFAULT_COINS = 15

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
  freezes: number        // сколько «заморозок» есть в запасе
  freezeGrantedWeek: string // YYYY-WW последней выдачи недельной заморозки
}

let streak: StreakState = loadStreak()
function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY_STREAK)
    if (!raw) return { current: 0, longest: 0, lastDay: '', freezes: 0, freezeGrantedWeek: '' }
    const loaded = JSON.parse(raw) as Partial<StreakState>
    return {
      current: loaded.current ?? 0,
      longest: loaded.longest ?? 0,
      lastDay: loaded.lastDay ?? '',
      freezes: loaded.freezes ?? 0,
      freezeGrantedWeek: loaded.freezeGrantedWeek ?? '',
    }
  } catch { return { current: 0, longest: 0, lastDay: '', freezes: 0, freezeGrantedWeek: '' } }
}
function persistStreak() {
  try { localStorage.setItem(KEY_STREAK, JSON.stringify(streak)) } catch { /* quota */ }
}
function localDayKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function ymd(d: Date = new Date()): string { return localDayKey(d) }
function yearWeek(d: Date = new Date()): string {
  // ISO-8601 week — use local date components to avoid UTC midnight shift
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (t.getUTCDay() + 6) % 7
  t.setUTCDate(t.getUTCDate() - dayNum + 3)
  const firstThu = t.valueOf()
  t.setUTCMonth(0, 1)
  if (t.getUTCDay() !== 4) t.setUTCMonth(0, 1 + ((4 - t.getUTCDay()) + 7) % 7)
  const week = 1 + Math.ceil((firstThu - t.valueOf()) / MS_PER_WEEK)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/** Выдать недельную заморозку (1 шт/неделю), если ещё не выдавали на этой неделе. */
function grantWeeklyFreeze() {
  const week = yearWeek()
  if (streak.freezeGrantedWeek === week) return
  // Начислять только если юзер активный (стрик > 0) — новичку смысла нет
  if (streak.current > 0 && streak.freezes < MAX_STREAK_FREEZES) {
    streak = { ...streak, freezes: streak.freezes + 1, freezeGrantedWeek: week }
    persistStreak()
  } else if (streak.current > 0) {
    streak = { ...streak, freezeGrantedWeek: week }
    persistStreak()
  }
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
  recordActivity({ lessons: 1, minutes: LESSON_DEFAULT_MINUTES, coins: LESSON_DEFAULT_COINS })
  void apiProgressEvent('lesson_solved', { lessonN: n, coins: LESSON_DEFAULT_COINS })
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
  return all[all.length - 1]!
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
  recordActivity({ minutes: 3, coins: correct * 2 })
  void apiProgressEvent('puzzle_solved', { lessonN, correct, total, score })
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
  grantWeeklyFreeze()
  const today = ymd()
  if (streak.lastDay === today) return
  const yesterday = ymd(new Date(Date.now() - MS_PER_DAY))
  if (streak.lastDay === yesterday) {
    streak = { ...streak, current: streak.current + 1, lastDay: today }
  } else if (streak.lastDay === '') {
    // Первый заход — без учёта заморозки
    streak = { ...streak, current: 1, lastDay: today }
  } else {
    // Разрыв. Считаем сколько дней пропущено
    const last = new Date(streak.lastDay + 'T00:00:00Z').getTime()
    const nowD = new Date(today + 'T00:00:00Z').getTime()
    const daysMissed = Math.floor((nowD - last) / MS_PER_DAY) - 1
    if (daysMissed >= 1 && daysMissed <= streak.freezes) {
      // Хватает заморозок закрыть дыру — списываем и продолжаем стрик
      streak = {
        ...streak,
        current: streak.current + 1,
        lastDay: today,
        freezes: streak.freezes - daysMissed,
      }
    } else {
      // Не хватило — стрик сгорел
      streak = { ...streak, current: 1, lastDay: today }
    }
  }
  if (streak.current > streak.longest) streak = { ...streak, longest: streak.current }
  persistStreak()
  void apiProgressEvent('streak_touched', { current: streak.current, longest: streak.longest })
  emit()
}

/** Потратить монеты на заморозку (200 монет → +1 заморозка). Возвращает true при успехе. */
export function buyStreakFreeze(): boolean {
  if (streak.freezes >= 3) return false // максимум 3
  streak = { ...streak, freezes: streak.freezes + 1 }
  persistStreak()
  emit()
  return true
}

// ─── Daily activity API (persisted, for родителям) ───
const KEY_DAILY = 'ek_daily_activity_v1'

export interface DailyActivity {
  lessons: number   // завершено уроков в этот день
  minutes: number   // минут в приложении (оценка — 12 мин/урок по умолчанию)
  coins: number     // монет заработано
}

type DailyMap = Record<string, DailyActivity>

function loadDaily(): DailyMap {
  try {
    const raw = localStorage.getItem(KEY_DAILY)
    return raw ? (JSON.parse(raw) as DailyMap) : {}
  } catch {
    return {}
  }
}
function persistDaily(m: DailyMap) {
  try { localStorage.setItem(KEY_DAILY, JSON.stringify(m)) } catch { /* quota */ }
}

/** Регистрация активности за сегодня. delta — то, что добавилось только что. */
export function recordActivity(delta: Partial<DailyActivity>) {
  const today = ymd()
  const m = loadDaily()
  const prev = m[today] ?? { lessons: 0, minutes: 0, coins: 0 }
  m[today] = {
    lessons: prev.lessons + (delta.lessons ?? 0),
    minutes: prev.minutes + (delta.minutes ?? 0),
    coins: prev.coins + (delta.coins ?? 0),
  }
  persistDaily(m)
}

/** Вернуть последние N дней (по убыванию дат). Включает пустые. */
export function getDailyLastN(days: number): Array<{ day: string; data: DailyActivity }> {
  const m = loadDaily()
  const out: Array<{ day: string; data: DailyActivity }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = ymd(new Date(Date.now() - i * MS_PER_DAY))
    out.push({ day: d, data: m[d] ?? { lessons: 0, minutes: 0, coins: 0 } })
  }
  return out
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

