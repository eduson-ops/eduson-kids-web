import { useMemo } from 'react'
import { useProgress } from './useProgress'
import { getQuizResult } from '../lib/progress'

export type MascotMood = 'idle' | 'wave' | 'celebrate' | 'think' | 'confused' | 'code'
type MascotContext = 'hub' | 'studio' | 'learn' | 'parent' | 'portfolio'

/**
 * Возвращает позу маскота, зависящую от состояния прогресса и контекста страницы.
 *
 * Логика (в порядке приоритета):
 *  - studio     → 'code'   (ребёнок в редакторе — пингвин кодит)
 *  - confused   → последний квиз провален (<50%) и проходил его 2+ раза
 *  - celebrate  → сегодня завершил хотя бы один урок
 *  - think      → после 20:00, есть стрик, сегодня ещё не занимался
 *  - wave       → первый заход за день (в любое время до 20:00), есть стрик
 *  - idle       → дефолт
 */
export function useMascotMood(ctx: MascotContext): MascotMood {
  const p = useProgress()
  return useMemo(() => {
    if (ctx === 'studio') return 'code'

    const today = new Date().toISOString().slice(0, 10)
    const todayActivity = p.dailyLast28.find((d) => d.day === today)
    const hour = new Date().getHours()

    // Confused: недавний квиз провален
    if (p.currentLesson > 1) {
      const lastQuiz = getQuizResult(p.currentLesson - 1)
      if (lastQuiz && lastQuiz.bestScore < 0.5 && lastQuiz.attempts >= 2) {
        return 'confused'
      }
    }

    // Celebrate: сегодня завершил урок
    if (todayActivity && todayActivity.data.lessons > 0) {
      return 'celebrate'
    }

    // Think: вечер, стрик в опасности
    if (hour >= 20 && p.streak > 0 && (!todayActivity || todayActivity.data.lessons === 0)) {
      return 'think'
    }

    // Wave: первый заход сегодня со стриком
    if ((!todayActivity || todayActivity.data.minutes === 0) && p.streak > 0) {
      return 'wave'
    }

    // Context hints
    if (ctx === 'parent') return 'think'

    return 'idle'
  }, [p, ctx])
}
