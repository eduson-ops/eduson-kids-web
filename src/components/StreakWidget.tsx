import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'
import { DAILY_GOAL_KEY } from '../lib/progress'

/**
 * StreakWidget — плавающий виджет в правом верхнем углу:
 *   🔥 streak     🎯 today/goal
 *
 * Визуал Duolingo-style: компактный, всегда на виду, клик ведёт в /me и /settings.
 * На мобилке схлопывается в одну строку.
 *
 * Daily goal читается из localStorage ek_daily_goal_minutes (ставится в /settings).
 */

function getDailyGoal(): number {
  const v = parseInt(localStorage.getItem(DAILY_GOAL_KEY) ?? '10', 10)
  return [5, 10, 15, 20].includes(v) ? v : 10
}

export default function StreakWidget() {
  const p = useProgress()
  const [goal, setGoal] = useState(getDailyGoal())

  // Подписка на смену цели в /settings
  useEffect(() => {
    const onChange = () => setGoal(getDailyGoal())
    window.addEventListener('ek:daily-goal-change', onChange)
    return () => window.removeEventListener('ek:daily-goal-change', onChange)
  }, [])

  // Сколько минут сделал сегодня — из p.dailyLast28
  const today = new Date().toISOString().slice(0, 10)
  const todayActivity = p.dailyLast28.find((d) => d.day === today)
  const minutesToday = todayActivity?.data.minutes ?? 0
  const goalPct = Math.min(100, Math.round((minutesToday / goal) * 100))

  return (
    <div className="kb-streak-widget" aria-label="Стрик и цель на день">
      <Link
        to="/me"
        className="kb-streak-chip"
        title={
          p.streak > 0
            ? `Стрик ${p.streak} дн.${p.streakFreezes > 0 ? ` · ❄ ${p.streakFreezes} заморозок` : ''}`
            : 'Начни стрик — занимайся каждый день!'
        }
      >
        <span className="kb-streak-icon" aria-hidden>🔥</span>
        <span className="kb-streak-val">{p.streak}</span>
        {p.streakFreezes > 0 && (
          <span className="kb-streak-freeze" aria-label={`${p.streakFreezes} заморозок`}>
            ❄<small>{p.streakFreezes}</small>
          </span>
        )}
      </Link>
      <Link
        to="/settings"
        className="kb-streak-chip kb-streak-chip--goal"
        title={`Сегодня ${minutesToday} из ${goal} мин`}
      >
        <span className="kb-streak-icon" aria-hidden>🎯</span>
        <span className="kb-streak-val">{minutesToday}/{goal}</span>
        <div className="kb-streak-ring" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(21,20,27,.1)" strokeWidth="2.5" />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke={goalPct >= 100 ? '#34C38A' : '#6B5CE7'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${(goalPct / 100) * 56.55} 56.55`}
              transform="rotate(-90 12 12)"
            />
          </svg>
        </div>
      </Link>
    </div>
  )
}
