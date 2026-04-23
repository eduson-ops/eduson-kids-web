import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import NikselIcon, { type NikselIconKind } from '../design/mascot/NikselIcon'
import { pluralize } from '../lib/plural'
import { useProgress } from '../hooks/useProgress'
import { useMascotMood } from '../hooks/useMascotMood'
import { ACHIEVEMENTS as ACH_DEFS } from '../lib/achievements'
import { hasAchievement } from '../lib/progress'
import {
  getVkUser,
  getParentLink,
  startVkLogin,
  signOutVk,
  vkConfig,
} from '../lib/vkAuth'

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

interface TimelineEvent {
  ts: number
  kind: 'lesson' | 'coin' | 'publish' | 'achievement'
  label: string
}

/**
 * Трансформация реальной активности из useProgress().dailyLast28
 * в формат, ожидаемый графиком. Если за 28 дней нет ни одной записи
 * (новый пользователь) — показываем детерминированный mock, чтобы
 * график не выглядел пустым на демо.
 */
function buildActivity(last28: ReturnType<typeof useProgress>['dailyLast28']): Activity[] {
  const anyReal = last28.some((d) => d.data.minutes > 0 || d.data.lessons > 0)
  if (!anyReal) return loadMockActivity()
  return last28.map((d, idx) => ({
    day: idx,
    minutes: d.data.minutes,
    coins: d.data.coins,
    lessonsCompleted: d.data.lessons,
  }))
}

function loadMockActivity(): Activity[] {
  // Детерминированный mock (fallback для новых пользователей).
  const out: Activity[] = []
  let rngSeed = 1337
  const rng = () => {
    rngSeed = (rngSeed * 1103515245 + 12345) & 0x7fffffff
    return rngSeed / 0x7fffffff
  }
  for (let d = 0; d < 28; d++) {
    const weekday = (d + 4) % 7
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
  const p = useProgress()
  const activity = useMemo(() => buildActivity(p.dailyLast28), [p.dailyLast28])
  const mood = useMascotMood('parent')

  useEffect(() => {
    setChildName(localStorage.getItem('ek_child_name') ?? 'твой ребёнок')
    setParentName(localStorage.getItem('ek_parent_name') ?? 'родитель')
  }, [])

  // KPI агрегаты
  const totalMinutes = activity.reduce((s, a) => s + a.minutes, 0)
  const totalCoins = activity.reduce((s, a) => s + a.coins, 0)
  const totalLessons = activity.reduce((s, a) => s + a.lessonsCompleted, 0)
  const earnedAch = ACH_DEFS.filter((a) => hasAchievement(a.id)).length

  // Current module / lesson computed from real progress
  const lessonsCompleted = p.completedLessons
  const currentLesson = Math.min(48, lessonsCompleted + 1)
  const currentModuleN = Math.max(1, Math.ceil(currentLesson / 6))
  const MODULE_TITLES = [
    'Первые шаги в Эдюсон Kids', 'Движение и события', 'Переменные и счёт',
    'Функции и повторы', 'Условия и логика', 'Переход в Python',
    'События и состояния', 'Публикация + авторство',
  ]
  const currentModuleTitle = MODULE_TITLES[currentModuleN - 1] ?? MODULE_TITLES[0]
  const lessonInModule = ((currentLesson - 1) % 6) + 1
  const moduleProgress = Math.round(((lessonInModule - 1) / 6) * 100)
  const moduleCompletedCount = lessonInModule - 1

  // Timeline: генерим из activity + achievements
  const timeline: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = []
    for (const a of activity) {
      const ts = Date.now() - (27 - a.day) * 24 * 3600_000
      if (a.lessonsCompleted > 0) events.push({ ts, kind: 'lesson', label: `Завершил урок (${pluralize(a.minutes, 'minute')}, ${pluralize(a.coins, 'coin')})` })
    }
    for (const a of ACH_DEFS) {
      if (hasAchievement(a.id)) events.push({ ts: Date.now() - Math.random() * 7 * 24 * 3600_000, kind: 'achievement', label: `Получил ачивку «${a.title}»` })
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
          <Niksel pose={mood} size={240} />
        </div>
      </section>

      {/* VK-подключение — отчёты о прогрессе в сообщения */}
      <VkConnectBanner />


      {/* KPI row */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>За последние 4 недели</h2>
        <div className="kb-grid-4">
          <KpiCard value={String(totalLessons)} label="Уроков завершено" iconKind="book" accent="#6B5CE7" />
          <KpiCard value={formatMinutes(totalMinutes)} label="Времени в Эдюсон Kids" iconKind="spark" accent="#5AA9FF" />
          <KpiCard value={String(totalCoins)} label="Монет собрано" iconKind="coin" accent="#FFD43C" />
          <KpiCard value={`${earnedAch} / ${ACH_DEFS.length}`} label="Достижений" iconKind="trophy" accent="#FF9454" />
        </div>
      </section>

      {/* Activity chart */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Активность по дням</h2>
          <span className="eyebrow">{pluralize(28, 'day')}</span>
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
            <div className="eyebrow">Модуль {currentModuleN} · {currentModuleTitle}</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>Урок {lessonInModule} из 6</h3>
            <div className="kb-progress kb-progress--lg">
              <div className="kb-progress-bar" style={{ width: `${moduleProgress}%`, background: 'var(--violet)' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600 }}>
              <span>✓ {moduleCompletedCount} {moduleCompletedCount === 1 ? 'урок завершён' : 'урока завершено'}</span>
              <span>🎯 осталось {6 - moduleCompletedCount}</span>
              <span>📊 всего {lessonsCompleted} / 48</span>
            </div>
          </div>
          <Link to={`/learn/lesson/${currentLesson}`} className="kb-btn kb-btn--lg">
            Открыть урок
          </Link>
        </div>
      </section>

      {/* Achievements */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Достижения</h2>
        <div className="kb-grid-4">
          {ACH_DEFS.slice(0, 8).map((a) => {
            const earned = hasAchievement(a.id)
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
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{a.description}</div>
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

function KpiCard({ value, label, iconKind, accent }: { value: string; label: string; iconKind: NikselIconKind; accent: string }) {
  return (
    <div className="kb-card kpi-card" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="kpi-emoji" style={{ background: accent + '1a' }}>
        <NikselIcon kind={iconKind} size={48} />
      </div>
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

/**
 * VkConnectBanner — карточка в родительском кабинете.
 * Без VK: приглашение подключить, чтобы получать отчёты о прогрессе в сообщениях.
 * С VK: статус подключения + имя + кнопка отключить.
 */
function VkConnectBanner() {
  const [user, setUser] = useState(getVkUser())
  const [link] = useState(getParentLink())
  const [err, setErr] = useState<string | null>(null)
  const appConfigured = vkConfig().appId.length > 0

  const onConnect = async () => {
    setErr(null)
    try {
      sessionStorage.setItem('ek_vk_next', '/parent')
      await startVkLogin('parent')
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  const onDisconnect = () => {
    signOutVk()
    setUser(null)
  }

  if (user) {
    return (
      <section style={{ marginBottom: 40 }}>
        <div className="kb-card" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', padding: 20 }}>
          <div style={{ flex: '1 1 320px' }}>
            <div className="eyebrow">VK подключён</div>
            <h3 className="h3" style={{ margin: '6px 0 4px' }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14 }}>
              {link?.reportsOptIn
                ? `Отчёты о прогрессе «${link.childName}» отправляем в VK-сообщения раз в неделю.`
                : 'Привязка к ребёнку ещё не настроена. Добавь child_code в профиле, чтобы получать отчёты.'}
            </p>
          </div>
          <button className="kb-btn kb-btn--secondary" onClick={onDisconnect}>
            Отвязать VK
          </button>
        </div>
      </section>
    )
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <div className="kb-card kb-card--feature" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: 24 }}>
        <div style={{ flex: '1 1 340px' }}>
          <div className="eyebrow">Подключение VK</div>
          <h3 className="h3" style={{ margin: '6px 0 8px' }}>
            Получай отчёты о прогрессе ребёнка в сообщениях
          </h3>
          <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.55 }}>
            Раз в неделю — короткая сводка: сколько уроков пройдено, где завис,
            какое достижение получил. Без спама, без рекламы. Отключить можно в один клик.
          </p>
          {err && <p className="err" style={{ marginTop: 10 }}>{err}</p>}
          {!appConfigured && (
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-soft)' }}>
              Интеграция временно недоступна. Скоро добавим Telegram и&nbsp;email для отчётов.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="vk-btn" onClick={onConnect} disabled={!appConfigured}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path fill="currentColor" d="M12.62 17.25c-5.51 0-9-3.81-9-9.75h2.77c0 4.13 1.85 5.95 3.34 6.32V7.5h2.64v4.01c1.5-.16 3.07-1.86 3.6-4.01h2.64c-.41 2.61-2.08 4.5-3.27 5.26 1.2.62 3.12 2.25 3.85 5.49h-2.9c-.56-1.84-2.05-3.26-3.92-3.45v3.45h-0.75z" />
            </svg>
            Подключить VK
          </button>
        </div>
      </div>
    </section>
  )
}
