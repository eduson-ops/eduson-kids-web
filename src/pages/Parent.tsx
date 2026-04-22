import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'

/**
 * Parent Dashboard — родительский кабинет.
 * Блоки: Hero + KPI row + 28-day activity chart + current module + achievements + timeline.
 * Данные сейчас mock из localStorage; в v1.0 — через GET /api/v1/progress.
 */

interface Activity {
  day: number          // 0..27, 0 — 4 недели назад
  minutes: number
  coins: number
  lessonsCompleted: number
}

interface Achievement {
  id: string
  title: string
  desc: string
  emoji: string
  earnedAt: number | null
  color: string
}

interface TimelineEvent {
  ts: number
  kind: 'lesson' | 'coin' | 'publish' | 'achievement'
  label: string
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', title: 'Первая игра', desc: 'Собрал свой первый Obby', emoji: '🏆', earnedAt: Date.now() - 3 * 24 * 3600_000, color: '#FFD43C' },
  { id: 'hundred', title: '100 монет', desc: 'Собрал сотню монет за курс', emoji: '💰', earnedAt: Date.now() - 1 * 24 * 3600_000, color: '#FF9454' },
  { id: 'python', title: 'Python-первопроходец', desc: 'Написал первый Python-скрипт руками', emoji: '🐍', earnedAt: null, color: '#6B5CE7' },
  { id: 'tower', title: 'Покоритель башни', desc: 'Дошёл до вершины Tower of Code', emoji: '🗼', earnedAt: null, color: '#9FE8C7' },
]

function loadMockActivity(): Activity[] {
  // Детерминированный mock: игровой ритм — сильные выходные, слабая среда
  const out: Activity[] = []
  let rngSeed = 1337
  const rng = () => {
    rngSeed = (rngSeed * 1103515245 + 12345) & 0x7fffffff
    return rngSeed / 0x7fffffff
  }
  for (let d = 0; d < 28; d++) {
    const weekday = (d + 4) % 7       // смещение чтобы "воскресенье"=пиковый
    const peak = weekday === 0 || weekday === 6
    const mid = weekday === 3
    const base = peak ? 35 : mid ? 8 : 20
    const minutes = Math.max(0, Math.floor(base + (rng() - 0.5) * 15))
    const coins = Math.floor(minutes * (0.8 + rng() * 0.4))
    const lessonsCompleted = minutes >= 30 ? 1 : 0
    out.push({ day: d, minutes, coins, lessonsCompleted })
  }
  return out
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} мин`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`
}

export default function Parent() {
  const [childName, setChildName] = useState<string>('твой ребёнок')
  const [parentName, setParentName] = useState<string>('родитель')
  const activity = useMemo(() => loadMockActivity(), [])

  useEffect(() => {
    setChildName(localStorage.getItem('ek_child_name') ?? 'твой ребёнок')
    setParentName(localStorage.getItem('ek_parent_name') ?? 'родитель')
  }, [])

  // KPI агрегаты
  const totalMinutes = activity.reduce((s, a) => s + a.minutes, 0)
  const totalCoins = activity.reduce((s, a) => s + a.coins, 0)
  const totalLessons = activity.reduce((s, a) => s + a.lessonsCompleted, 0)
  const earnedAch = ACHIEVEMENTS.filter((a) => a.earnedAt).length

  // Timeline: генерим из activity + achievements
  const timeline: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = []
    for (const a of activity) {
      const ts = Date.now() - (27 - a.day) * 24 * 3600_000
      if (a.lessonsCompleted > 0) events.push({ ts, kind: 'lesson', label: `Завершил урок (${a.minutes} мин, ${a.coins} монет)` })
    }
    for (const a of ACHIEVEMENTS) {
      if (a.earnedAt) events.push({ ts: a.earnedAt, kind: 'achievement', label: `Получил ачивку «${a.title}»` })
    }
    events.sort((x, y) => y.ts - x.ts)
    return events.slice(0, 10)
  }, [activity])

  return (
    <PlatformShell activeKey="parent">
      {/* Hero */}
      <section className="kb-hero" style={{ marginBottom: 40 }}>
        <div>
          <span className="eyebrow">Родительский кабинет</span>
          <h1>Привет, {parentName}!</h1>
          <p>
            Здесь видно, как учится {childName}. Тихо, без крика: чему научился, где завис, куда двигается.
          </p>
          <div className="kb-hero-actions">
            <Link to="/learn" className="kb-btn kb-btn--lg kb-btn--ghost">
              Смотреть уроки
            </Link>
          </div>
        </div>
        <div className="kb-hero-mascot">
          <Niksel pose="think" size={240} />
        </div>
      </section>

      {/* KPI row */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>За последние 4 недели</h2>
        <div className="kb-grid-4">
          <KpiCard value={String(totalLessons)} label="Уроков завершено" emoji="🎓" accent="#6B5CE7" />
          <KpiCard value={formatMinutes(totalMinutes)} label="Времени в KubiK" emoji="⏱" accent="#5AA9FF" />
          <KpiCard value={String(totalCoins)} label="Монет собрано" emoji="💰" accent="#FFD43C" />
          <KpiCard value={`${earnedAch} / ${ACHIEVEMENTS.length}`} label="Достижений" emoji="🏆" accent="#FF9454" />
        </div>
      </section>

      {/* Activity chart */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Активность по дням</h2>
          <span className="eyebrow">28 дней</span>
        </div>
        <div className="kb-card kb-card--feature" style={{ padding: 24 }}>
          <ActivityChart data={activity} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
            <span>4 нед. назад</span>
            <span>сегодня</span>
          </div>
        </div>
      </section>

      {/* Current module */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Текущий модуль</h2>
        <div className="kb-card kb-card--feature" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Модуль 1 · Первые шаги в KubiK</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>Урок 4 из 6 — Переменные и счёт</h3>
            <div className="kb-progress kb-progress--lg">
              <div className="kb-progress-bar" style={{ width: '60%', background: 'var(--violet)' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600 }}>
              <span>✓ 3 урока завершено</span>
              <span>🎯 осталось 3</span>
              <span>📅 обычно 1 урок/неделю</span>
            </div>
          </div>
          <Link to="/learn/4" className="kb-btn kb-btn--lg">
            Открыть урок
          </Link>
        </div>
      </section>

      {/* Achievements */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Достижения</h2>
        <div className="kb-grid-4">
          {ACHIEVEMENTS.map((a) => {
            const earned = Boolean(a.earnedAt)
            return (
              <div
                key={a.id}
                className="kb-course"
                style={{
                  '--accent': a.color,
                  '--accent-soft': a.color + '22',
                  '--accent-ink': '#15141b',
                  opacity: earned ? 1 : 0.55,
                } as React.CSSProperties}
              >
                <div className="kb-course-top">
                  <span className="kb-course-age">{earned ? 'ПОЛУЧЕНО' : '🔒 не получено'}</span>
                </div>
                <div className="kb-course-icon" style={{ fontSize: 56 }}>{a.emoji}</div>
                <div>
                  <div className="h3" style={{ fontSize: 15 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{a.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Что было недавно</h2>
        <div className="parent-timeline">
          {timeline.length === 0 && (
            <div className="kb-card" style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)' }}>
              Пока нет активности. Начни первый урок!
            </div>
          )}
          {timeline.map((e, i) => (
            <div key={i} className="timeline-row">
              <div className={`timeline-dot kind-${e.kind}`}>{iconForKind(e.kind)}</div>
              <div className="timeline-body">
                <div className="timeline-label">{e.label}</div>
                <div className="timeline-ts">{formatRelative(e.ts)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PlatformShell>
  )
}

function KpiCard({ value, label, emoji, accent }: { value: string; label: string; emoji: string; accent: string }) {
  return (
    <div className="kb-card kpi-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="kpi-emoji">{emoji}</div>
      <div className="kpi-value" style={{ color: accent }}>{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

function ActivityChart({ data }: { data: Activity[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const parent = c.parentElement
    if (!parent) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = parent.clientWidth
      const h = 140
      c.style.width = w + 'px'
      c.style.height = h + 'px'
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      draw(ctx, w, h)
    }

    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h)
      const max = Math.max(1, ...data.map((d) => d.minutes))
      const barW = w / data.length
      const padX = 2
      for (let i = 0; i < data.length; i++) {
        const v = data[i].minutes
        const bh = (v / max) * (h - 28)
        const x = i * barW + padX
        const y = h - bh - 18
        const isWeekend = i % 7 === 0 || i % 7 === 6
        ctx.fillStyle = isWeekend ? '#6B5CE7' : '#A9D8FF'
        roundRect(ctx, x, y, barW - padX * 2, bh, 4)
        ctx.fill()
      }
      // Baseline
      ctx.strokeStyle = 'rgba(21,20,27,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h - 18)
      ctx.lineTo(w, h - 18)
      ctx.stroke()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [data])

  return <canvas ref={canvasRef} aria-label="График активности за 28 дней" />
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0 || h <= 0) return
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function iconForKind(kind: TimelineEvent['kind']): string {
  return { lesson: '📚', coin: '💰', publish: '🚀', achievement: '🏆' }[kind]
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'только что'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} мин назад`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} ч назад`
  const days = Math.floor(diff / 86400_000)
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`
  return new Date(ts).toLocaleDateString('ru-RU')
}
