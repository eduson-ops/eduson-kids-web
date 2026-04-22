import {
  countDone,
  countPerfectQuizzes,
  getStreak,
  getUnlockedAchievements,
  hasAchievement,
  unlockAchievement,
  subscribeProgress,
} from './progress'
import { MODULES } from './curriculum'

/**
 * Achievements — 15 бэйджей с автоматической проверкой.
 * При любом изменении прогресса вызывается `recheckAll()` — проверяет
 * условия и разблокирует новые.
 */

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  color: string           // brand hex
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  /** Условие: возвращает true если достижение должно быть разблокировано сейчас */
  check: () => boolean
}

// ─── Helpers для условий ──────────────────────────────
function countEditorStateParts(): number {
  try {
    const raw = localStorage.getItem('ek_studio_v1')
    if (!raw) return 0
    const state = JSON.parse(raw) as { parts?: unknown[] }
    return (state.parts ?? []).length
  } catch { return 0 }
}

function hasPerObjectScript(): boolean {
  try {
    const raw = localStorage.getItem('ek_studio_v1')
    if (!raw) return false
    const state = JSON.parse(raw) as { parts?: Array<{ scripts?: unknown }> }
    return (state.parts ?? []).some((p) => p.scripts !== undefined)
  } catch { return false }
}

function hasAnySite(): boolean {
  try {
    const raw = localStorage.getItem('ek_sites_v1')
    if (!raw) return false
    const state = JSON.parse(raw) as { sites?: unknown[] }
    return (state.sites ?? []).length > 0
  } catch { return false }
}

function hasWorldCustomization(): boolean {
  try {
    const raw = localStorage.getItem('ek_world_edits_v2')
    if (!raw) return false
    const state = JSON.parse(raw) as { additions?: unknown[]; removed?: Record<string, unknown[]>; recolored?: Record<string, unknown> }
    if ((state.additions ?? []).length > 0) return true
    if (state.removed && Object.keys(state.removed).length > 0) return true
    if (state.recolored && Object.keys(state.recolored).length > 0) return true
    return false
  } catch { return false }
}

function hasAnyWorldScript(): boolean {
  try {
    const raw = localStorage.getItem('ek_world_scripts_v1')
    if (!raw) return false
    const state = JSON.parse(raw) as Record<string, unknown>
    return Object.keys(state).length > 0
  } catch { return false }
}

function completedModule(moduleN: number): boolean {
  const mod = MODULES.find((m) => m.n === moduleN)
  if (!mod) return false
  // Все 6 уроков модуля отмечены пройденными
  // прокси-проверка: через прогресс-стор
  try {
    const raw = localStorage.getItem('ek_lesson_progress_v1')
    if (!raw) return false
    const done = new Set(JSON.parse(raw) as number[])
    return mod.lessons.every((l) => done.has(l.n))
  } catch { return false }
}

// ─── Реестр ──────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'Первый шаг',
    description: 'Завершил свой самый первый урок',
    emoji: '🌱', color: '#9FE8C7', rarity: 'common',
    check: () => countDone() >= 1,
  },
  {
    id: 'ten-lessons',
    title: 'Десятник',
    description: 'Прошёл 10 уроков',
    emoji: '📚', color: '#6B5CE7', rarity: 'common',
    check: () => countDone() >= 10,
  },
  {
    id: 'half-way',
    title: 'На полпути',
    description: 'Прошёл 24 из 48 уроков',
    emoji: '🧗', color: '#FFD43C', rarity: 'rare',
    check: () => countDone() >= 24,
  },
  {
    id: 'all-lessons',
    title: 'Марафонец',
    description: 'Все 48 уроков курса',
    emoji: '🏆', color: '#FFD43C', rarity: 'legendary',
    check: () => countDone() >= 48,
  },
  {
    id: 'module-1',
    title: 'Начинающий автор',
    description: 'Завершил модуль 1 «Первые шаги»',
    emoji: '🧱', color: '#6B5CE7', rarity: 'common',
    check: () => completedModule(1),
  },
  {
    id: 'module-4',
    title: 'Мастер циклов',
    description: 'Завершил модуль 4 «Повторы»',
    emoji: '🔁', color: '#FFD43C', rarity: 'rare',
    check: () => completedModule(4),
  },
  {
    id: 'module-8',
    title: 'Автор',
    description: 'Завершил финальный модуль M8',
    emoji: '✍', color: '#FFD43C', rarity: 'legendary',
    check: () => completedModule(8),
  },
  {
    id: 'quiz-champion',
    title: 'Квиз-чемпион',
    description: 'Сдал 5 квизов на 100%',
    emoji: '🧠', color: '#FFB4C8', rarity: 'rare',
    check: () => countPerfectQuizzes() >= 5,
  },
  {
    id: 'first-script',
    title: 'Первый скрипт',
    description: 'Привесил скрипт к объекту в Студии',
    emoji: '📜', color: '#FF9454', rarity: 'common',
    check: hasPerObjectScript,
  },
  {
    id: 'builder',
    title: 'Архитектор',
    description: '20+ частей в твоей сцене Студии',
    emoji: '🏛', color: '#A9D8FF', rarity: 'common',
    check: () => countEditorStateParts() >= 20,
  },
  {
    id: 'mega-builder',
    title: 'Мега-строитель',
    description: '50+ частей в сцене',
    emoji: '🌆', color: '#6B5CE7', rarity: 'epic',
    check: () => countEditorStateParts() >= 50,
  },
  {
    id: 'web-author',
    title: 'Веб-мастер',
    description: 'Создал свой первый сайт',
    emoji: '🌐', color: '#9FE8C7', rarity: 'common',
    check: hasAnySite,
  },
  {
    id: 'world-tinkerer',
    title: 'Тинкерер миров',
    description: 'Отредактировал объект на живой карте',
    emoji: '⚡', color: '#FFD43C', rarity: 'common',
    check: hasWorldCustomization,
  },
  {
    id: 'world-scripter',
    title: 'Живой режиссёр',
    description: 'Привесил скрипт к объекту Play-карты',
    emoji: '🎬', color: '#FF9454', rarity: 'rare',
    check: hasAnyWorldScript,
  },
  {
    id: 'streak-3',
    title: '3 дня подряд',
    description: 'Играл и учился 3 дня без пропуска',
    emoji: '🔥', color: '#ff5464', rarity: 'common',
    check: () => getStreak().current >= 3,
  },
  {
    id: 'streak-7',
    title: 'Неделя в ударе',
    description: 'Стрик 7 дней подряд',
    emoji: '🚀', color: '#ff5ab1', rarity: 'rare',
    check: () => getStreak().current >= 7,
  },
  {
    id: 'streak-30',
    title: 'Месяц без пропуска',
    description: 'Стрик 30 дней',
    emoji: '💎', color: '#88d4ff', rarity: 'legendary',
    check: () => getStreak().current >= 30,
  },
]

// ─── Achievement unlock notification bus ─────────────
const unlockListeners = new Set<(id: string) => void>()
export function subscribeAchievementUnlock(fn: (id: string) => void): () => void {
  unlockListeners.add(fn)
  return () => unlockListeners.delete(fn)
}

// ─── Автоматическая перепроверка ────────────────────
let recheckScheduled = false
function scheduleRecheck() {
  if (recheckScheduled) return
  recheckScheduled = true
  queueMicrotask(() => {
    recheckScheduled = false
    for (const a of ACHIEVEMENTS) {
      if (!hasAchievement(a.id) && a.check()) {
        if (unlockAchievement(a.id)) {
          for (const fn of unlockListeners) fn(a.id)
        }
      }
    }
  })
}

// Подписываемся на прогресс — запускает recheck при любом изменении.
// Вызывается один раз при импорте модуля (side-effect).
let initialized = false
export function ensureAchievementsWatcher() {
  if (initialized) return
  initialized = true
  subscribeProgress(scheduleRecheck)
  // Первичная проверка при запуске (на случай если ачивка заработала «задним числом»)
  scheduleRecheck()
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

export const RARITY_LABEL: Record<Achievement['rarity'], string> = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
}
export const RARITY_COLOR: Record<Achievement['rarity'], string> = {
  common: '#9FE8C7',
  rare: '#5AA9FF',
  epic: '#c879ff',
  legendary: '#FFD43C',
}

// Не забудем — экспорт текущего состояния для UI
export { getUnlockedAchievements }
