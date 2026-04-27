import { useSyncExternalStore } from 'react'
import {
  subscribeProgress,
  countDone,
  countPerfectQuizzes,
  averageQuizScore,
  getStreak,
  countAchievements,
  getUnlockedAchievements,
  getDailyLastN,
  getCurrentLesson,
} from '../lib/progress'

export interface ProgressSnapshot {
  currentLesson: number
  completedLessons: number
  streak: number
  streakFreezes: number
  perfectQuizzes: number
  avgQuizScore: number
  achievements: number
  unlocked: string[]
  dailyLast28: ReturnType<typeof getDailyLastN>
}

// L1-96 lesson numbers — used for getCurrentLesson(all)
const ALL_LESSON_NUMBERS = Array.from({ length: 96 }, (_, i) => i + 1)

// Module-level cache — same reference until subscribe fires
let cached: ProgressSnapshot | null = null

function computeSnapshot(): ProgressSnapshot {
  const streakState = getStreak()
  return {
    currentLesson: getCurrentLesson(ALL_LESSON_NUMBERS),
    completedLessons: countDone(),
    streak: streakState.current,
    streakFreezes: streakState.freezes,
    perfectQuizzes: countPerfectQuizzes(),
    avgQuizScore: averageQuizScore(),
    achievements: countAchievements(),
    unlocked: [...getUnlockedAchievements()],
    dailyLast28: getDailyLastN(28),
  }
}

function getSnapshot(): ProgressSnapshot {
  if (cached === null) cached = computeSnapshot()
  return cached
}

function subscribe(cb: () => void): () => void {
  return subscribeProgress(() => {
    cached = computeSnapshot()
    cb()
  })
}

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
