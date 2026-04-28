/**
 * streakReminder.ts — вечернее напоминание продлить стрик через Notifications API.
 *
 * Логика:
 *  - В /settings включается toggle ek_streak_reminder_enabled = '1'
 *  - Раз при загрузке страницы проверяем: если после 20:00 local И сегодня
 *    ещё не занимался И стрик > 0 И не показывали сегодня — показываем
 *  - Повторно в тот же день не показываем (трекается в ek_streak_reminder_shown_day)
 *  - Текст меняется в зависимости от длины стрика (0-3 / 4-7 / 8-14 / 15+)
 *
 * Ограничения браузерного способа:
 *  - Работает только пока вкладка открыта. Для системных push-уведомлений нужен
 *    Service Worker + push-endpoint (роадмап P2).
 *  - Юзер должен разрешить Notifications в браузере.
 */

import { getStreak, getDailyLastN } from './progress'

const KEY_ENABLED = 'ek_streak_reminder_enabled'
const KEY_SHOWN = 'ek_streak_reminder_shown_day'

const REMINDER_HOUR_START = 20
const REMINDER_HOUR_END = 23
const WATCHER_INTERVAL_MS = 30 * 60_000

export function isStreakReminderEnabled(): boolean {
  return localStorage.getItem(KEY_ENABLED) === '1'
}

export function setStreakReminderEnabled(v: boolean) {
  localStorage.setItem(KEY_ENABLED, v ? '1' : '0')
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

function ymdLocal(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMessage(streakDays: number): { title: string; body: string } {
  if (streakDays === 0) {
    return {
      title: '🐧 Начни свой стрик!',
      body: 'Пройди один урок в Эдюсон Kids сегодня — и завтра уже будет 2 дня подряд.',
    }
  }
  if (streakDays <= 3) {
    return {
      title: `🔥 Твой стрик: ${streakDays} ${streakDays === 1 ? 'день' : 'дня'}`,
      body: 'Не теряй импульс! Урок займёт 10–15 минут.',
    }
  }
  if (streakDays <= 7) {
    return {
      title: `🔥 ${streakDays} дней подряд!`,
      body: 'Осталась одна задача — не потерять стрик. Вперёд!',
    }
  }
  if (streakDays <= 14) {
    return {
      title: `🔥 ${streakDays} дней подряд — круто!`,
      body: 'Один короткий урок — и стрик продолжается. Загляни на 10 минут.',
    }
  }
  return {
    title: `🔥 Легенда! ${streakDays} дней`,
    body: 'Сохрани свой рекорд — короткий урок сегодня продлит его.',
  }
}

/**
 * Проверить и показать уведомление если пора. Вызывается один раз при монтировании
 * приложения (в App.tsx). Безопасно вызывать многократно — сам себя троттлит.
 */
function checkAndRemindIfDue(): void {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return
  if (!isStreakReminderEnabled()) return
  if (Notification.permission !== 'granted') return

  const now = new Date()
  const hour = now.getHours()
  if (hour < REMINDER_HOUR_START || hour >= REMINDER_HOUR_END) return // вечер 20:00–22:59

  const today = ymdLocal(now)
  if (localStorage.getItem(KEY_SHOWN) === today) return // уже показали сегодня

  const streak = getStreak()
  const daily = getDailyLastN(1)
  const todayActivity = daily[0]?.data
  const didToday = (todayActivity?.minutes ?? 0) > 0 || (todayActivity?.lessons ?? 0) > 0

  if (didToday) return // уже занимался, не беспокоим
  if (streak.current === 0 && streak.longest === 0) return // новичок, не спамим

  const { title, body } = getMessage(streak.current)
  try {
    const n = new Notification(title, {
      body,
      icon: `${location.origin}${location.pathname}favicon.svg`,
      tag: 'ek-streak-reminder',
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      location.href = `${location.origin}${location.pathname}#/learn`
      n.close()
    }
    localStorage.setItem(KEY_SHOWN, today)
  } catch {
    // silently
  }
}

/**
 * Запустить фоновую проверку раз в 30 минут.
 * Возвращает функцию отмены.
 */
export function startStreakReminderWatcher(): () => void {
  checkAndRemindIfDue()
  const id = setInterval(checkAndRemindIfDue, WATCHER_INTERVAL_MS)
  return () => clearInterval(id)
}
