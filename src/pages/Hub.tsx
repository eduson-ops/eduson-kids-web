import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import NikselIcon, { type NikselIconKind } from '../design/mascot/NikselIcon'
import { GAMES } from '../lib/games'
import { plural, pluralize } from '../lib/plural'
import { useProgress } from '../hooks/useProgress'
import { useIsMobile } from '../hooks/useIsMobile'
import { CHILD_NAME_KEY } from '../lib/auth'
import { getAccessToken } from '../lib/authStorage'
import { fetchMyAccess } from '../api/lessonAccess'

/**
 * Hub — the new front door of Eduson Kids.
 * Replaces the old Roblox-style lobby as /.
 * Old lobby moves to /play.
 *
 * Blocks:
 *  - Hero: welcome + CTA to continue lesson
 *  - Continue learning (progress strip)
 *  - Course modules preview (M1..M8)
 *  - Featured worlds to play
 *  - Build your own CTA
 */

const MODULES: Array<{ n: number; title: string; accent: string; lessons: number; icon: NikselIconKind }> = [
  { n: 1, title: 'Первые шаги в Эдюсон Kids', accent: 'violet', lessons: 6, icon: 'build' },
  { n: 2, title: 'Движение и события',         accent: 'sky',    lessons: 6, icon: 'game' },
  { n: 3, title: 'Переменные и счёт',          accent: 'mint',   lessons: 6, icon: 'coin' },
  { n: 4, title: 'Функции и повторы',          accent: 'yellow', lessons: 6, icon: 'loop' },
  { n: 5, title: 'Условия и логика',           accent: 'pink',   lessons: 6, icon: 'logic' },
  { n: 6, title: 'Переход в Python',           accent: 'orange', lessons: 6, icon: 'python' },
  { n: 7, title: 'События и состояния',        accent: 'violet', lessons: 6, icon: 'spark' },
  { n: 8, title: 'Публикация + авторство',     accent: 'yellow', lessons: 6, icon: 'trophy' },
]

const TOTAL_LESSONS = 48
const COINS_PER_LESSON = 15
const LESSONS_PER_MODULE = 6
const TOTAL_MODULES = 8
const PYODIDE_REVEAL_DELAY_MS = 2000  // show warmup indicator only if takes > 2s
const PYODIDE_FADE_DELAY_MS = 600     // fade-out duration after warmup completes
const PYODIDE_IDLE_TIMEOUT_MS = 4000  // requestIdleCallback timeout fallback

const ACCENT_MAP: Record<string, { color: string; soft: string; ink: string }> = {
  violet: { color: '#6B5CE7', soft: '#E4E0FC', ink: '#2A1F8C' },
  yellow: { color: '#FFD43C', soft: '#FFF0B0', ink: '#7A5900' },
  mint:   { color: '#9FE8C7', soft: '#E1F7EC', ink: '#0C4E2E' },
  pink:   { color: '#FFB4C8', soft: '#FFE4EC', ink: '#6A1A33' },
  sky:    { color: '#A9D8FF', soft: '#DFF0FF', ink: '#1A3A6E' },
  orange: { color: '#FF9454', soft: '#FFE2CE', ink: '#6B2A05' },
}

export default function Hub() {
  const [name, setName] = useState<string | null>(null)
  const p = useProgress()
  const currentLesson = p.currentLesson
  const coins = p.completedLessons * COINS_PER_LESSON
  const isMobile = useIsMobile()
  const [scrolled, setScrolled] = useState(false)
  const [pyWarmup, setPyWarmup] = useState<'idle' | 'visible' | 'fading'>('idle')
  // Lessons unlocked by teacher via API (null = not logged in → fallback to local progress)
  const [apiUnlockedLessons, setApiUnlockedLessons] = useState<Set<number> | null>(null)

  useEffect(() => {
    setName(localStorage.getItem(CHILD_NAME_KEY))
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return
    fetchMyAccess()
      .then((rows) => setApiUnlockedLessons(new Set(rows.filter((r) => r.unlocked).map((r) => r.lessonN))))
      .catch(() => { /* API down — local fallback */ })
  }, [])

  // Pre-warm Pyodide during idle time so that when the user opens the
  // Studio / Python IDE / Trainers, the runtime is already booted. We
  // skip this on mobile to avoid burning data on users who may never
  // touch Python features this session.
  useEffect(() => {
    if (isMobile) return
    let cancelled = false
    let revealTimer: number | null = null
    let fadeTimer: number | null = null
    let isReady = false
    const run = () => {
      if (cancelled) return
      // Reveal indicator only if warmup takes >2s
      revealTimer = window.setTimeout(() => {
        if (!cancelled && !isReady) setPyWarmup('visible')
      }, PYODIDE_REVEAL_DELAY_MS)
      import('../lib/pyodide-executor')
        .then((mod) =>
          mod.warmPyodide((step) => {
            if (cancelled) return
            if (step === 'ready') {
              isReady = true
              if (revealTimer !== null) {
                clearTimeout(revealTimer)
                revealTimer = null
              }
              setPyWarmup((prev) => (prev === 'visible' ? 'fading' : 'idle'))
              fadeTimer = window.setTimeout(() => {
                if (!cancelled) setPyWarmup('idle')
              }, PYODIDE_FADE_DELAY_MS)
            }
          }),
        )
        .catch(() => { /* silent — best-effort warmup */ })
    }
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    const w = window as IdleWindow
    let idleHandle: number | null = null
    let timeoutHandle: number | null = null
    if (typeof w.requestIdleCallback === 'function') {
      idleHandle = w.requestIdleCallback(run, { timeout: PYODIDE_IDLE_TIMEOUT_MS })
    } else {
      timeoutHandle = window.setTimeout(run, PYODIDE_REVEAL_DELAY_MS)
    }
    return () => {
      cancelled = true
      if (idleHandle !== null && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleHandle)
      }
      if (timeoutHandle !== null) clearTimeout(timeoutHandle)
      if (revealTimer !== null) clearTimeout(revealTimer)
      if (fadeTimer !== null) clearTimeout(fadeTimer)
    }
  }, [isMobile])

  // Плашки растворяются после 200px скролла — чтобы не отвлекали при чтении модулей
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Unlock modules based on local progress + teacher-unlocked API lessons
  const lessonsCompleted = p.completedLessons
  const courseComplete = lessonsCompleted >= TOTAL_LESSONS
  const safeLesson = Math.min(currentLesson, TOTAL_LESSONS)
  const localUnlockedModuleN = Math.max(1, Math.ceil((lessonsCompleted + 1) / LESSONS_PER_MODULE))
  // If teacher unlocked lessons from a later module, show that module as unlocked too
  const apiUnlockedModuleN = apiUnlockedLessons
    ? Math.max(1, ...Array.from(apiUnlockedLessons).map((n) => Math.ceil(n / LESSONS_PER_MODULE)))
    : 1
  const unlockedModuleN = Math.max(localUnlockedModuleN, apiUnlockedModuleN)
  const currentModuleN = Math.min(TOTAL_MODULES, Math.ceil(safeLesson / LESSONS_PER_MODULE))
  const currentModuleTitle = MODULES[currentModuleN - 1]?.title ?? 'Первые шаги в Эдюсон Kids'

  const featuredGames = GAMES.filter((g) => g.featured).slice(0, 3)

  return (
    <PlatformShell activeKey="hub">
      {/* Cover-style hero (Designbook pattern) */}
      <section className="kb-cover">
        <div className="kb-cover-meta">
          <span className="eyebrow">
            {lessonsCompleted === 0
              ? `Добро пожаловать${name ? `, ${name}` : ''}!`
              : `С возвращением${name ? `, ${name}` : ''}`}
          </span>
          <span className="kb-cover-meta-row">
            <span>v1.0</span>
            <span className="dot" />
            <span>2026</span>
          </span>
        </div>
        <h1 className="kb-cover-title">
          Эдюсон<br/>Kids<span className="kb-cover-accent">.</span>
        </h1>
        <p className="kb-cover-sub">
          {lessonsCompleted === 0
            ? <>Строй 3D-миры, собирай игры из блоков, пиши Python.<br/>Платформа для&nbsp;возраста 9–15&nbsp;лет&nbsp;— начни прямо сейчас.</>
            : <>Строй 3D-миры, собирай игры из блоков, пиши Python.<br/>Платформа блочного программирования для&nbsp;возраста 9–15&nbsp;лет.</>
          }
        </p>
        <div className="kb-cover-actions">
          <Link
            to={courseComplete ? '/studio' : `/learn/lesson/${safeLesson}`}
            className="kb-btn kb-btn--lg kb-btn--secondary"
          >
            {courseComplete
              ? '🏆 Курс пройден! Открыть Студию'
              : lessonsCompleted === 0
                ? '🚀 Начать урок 1'
                : `▶ Продолжить урок ${safeLesson}`}
          </Link>
          <Link to="/learn" className="kb-cover-link-lite">
            Все уроки
          </Link>
        </div>

        <div className="kb-cover-footer">
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Модуль</span>
            <strong>M{currentModuleN}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Прогресс</span>
            <strong>{lessonsCompleted} / {TOTAL_LESSONS} {plural(lessonsCompleted, 'lesson')}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Стрик</span>
            <strong>{p.streak > 0 ? `🔥 ${pluralize(p.streak, 'day')}` : '—'}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Монет</span>
            <strong>{pluralize(coins, 'coin')}</strong>
          </div>
        </div>

        {/* Plashki встают РЯДОМ в верхний ряд над title. */}
        <div className={`kb-cover-deco kb-cover-deco--top-row${scrolled ? ' is-scrolled' : ''}`} aria-hidden>
          <div className="kb-cover-deco-block b-logic" style={{ transform: 'rotate(-4deg)' }}>Если</div>
          <div className="kb-cover-deco-block b-data" style={{ transform: 'rotate(3deg)' }}>Повтори</div>
          <div className="kb-cover-deco-block b-event" style={{ transform: 'rotate(-2deg)' }}>Клик</div>
        </div>
      </section>

      {/* Тонкий progress-strip, без дублирующего CTA — он уже в cover-hero */}
      <section style={{ marginBottom: 32 }}>
        <div className="kb-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, alignItems: 'center', padding: '14px 20px' }}>
          <div className="eyebrow" style={{ whiteSpace: 'nowrap' }}>М{currentModuleN} · {currentModuleTitle}</div>
          <div className="kb-progress" style={{ height: 10 }}>
            <div className="kb-progress-bar" style={{ width: `${(lessonsCompleted / TOTAL_LESSONS) * 100}%`, background: 'var(--violet)' }} />
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            {lessonsCompleted} / {TOTAL_LESSONS} · {pluralize(coins, 'coin')}
          </div>
        </div>
      </section>

      {/* Course modules */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2 className="h2">8 модулей · 48 уроков</h2>
          <span className="eyebrow">полная программа</span>
        </div>
        <div className="kb-grid-4">
          {MODULES.map((m) => {
            const a = ACCENT_MAP[m.accent]!
            const unlocked = m.n <= unlockedModuleN
            const isActive = m.n === currentModuleN
            const moduleLessonsStart = (m.n - 1) * m.lessons + 1
            const doneinModule = Math.min(m.lessons, Math.max(0, lessonsCompleted - (moduleLessonsStart - 1)))
            const modulePct = (doneinModule / m.lessons) * 100
            return (
              <Link
                key={m.n}
                to={unlocked ? `/learn/module/${m.n}` : '#'}
                className={`kb-course${isActive ? ' kb-course--active' : ''}`}
                title={unlocked ? undefined : 'Пройди предыдущие модули, чтобы разблокировать'}
                aria-disabled={!unlocked}
                style={{
                  '--accent': a.color,
                  '--accent-soft': a.soft,
                  '--accent-ink': a.ink,
                  opacity: unlocked ? 1 : 0.45,
                  pointerEvents: unlocked ? 'auto' : 'none',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                } as React.CSSProperties}
              >
                <div className="kb-course-top">
                  <span className="kb-course-age">M{m.n}</span>
                  <span className="kb-course-level">{pluralize(m.lessons, 'lesson')}</span>
                </div>
                <div className="kb-course-icon kb-course-icon--niksel">
                  <NikselIcon kind={m.icon} size={84} />
                </div>
                <div>
                  <div className="h3" style={{ fontSize: 16 }}>{m.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(21,20,27,.06)' }}>
                  <div className="kb-progress" style={{ flex: 1 }}>
                    <div className="kb-progress-bar" style={{ width: `${modulePct}%`, background: a.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
                    {!unlocked ? '🔒' : doneinModule === m.lessons ? '✅' : isActive ? 'В пути' : `${doneinModule}/${m.lessons}`}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured worlds */}
      {featuredGames.length > 0 && (
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2 className="h2">Сыграй в популярные миры</h2>
          <Link to="/play" className="kb-shell-nav-link">Все миры →</Link>
        </div>
        <div className="kb-grid-3">
          {featuredGames.map((g) => (
            <Link key={g.id} to={`/play/${g.id}`} className="kb-course">
              <div className="kb-course-top">
                <span className="kb-course-age">{g.category}</span>
                <span className="kb-course-level">👥 {g.playersOnline}</span>
              </div>
              <div className="kb-course-icon" style={{ fontSize: 72 }}>{g.emoji}</div>
              <div>
                <div className="h3" style={{ fontSize: 18 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>@{g.author}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Y2 teaser — только когда Y1 завершён или почти (42+ уроков пройдено) */}
      {lessonsCompleted >= 42 && (
        <section style={{ marginBottom: 40 }}>
          <div
            className="kb-card kb-card--feature"
            style={{
              background: 'linear-gradient(135deg, var(--orange) 0%, var(--violet) 140%)',
              color: 'var(--paper)',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div style={{ fontSize: 72, flexShrink: 0 }}>🔬</div>
            <div style={{ flex: 1 }}>
              <span className="eyebrow" style={{ color: 'rgba(255,251,243,.7)' }}>Год 2 · Алгоритмический стек</span>
              <h2 className="h2" style={{ color: 'var(--paper)', margin: '8px 0 10px' }}>Готов к Year 2?</h2>
              <p style={{ color: 'rgba(255,251,243,.85)', fontSize: 15, marginBottom: 16, maxWidth: 480 }}>
                Алгоритмы, структуры данных, рекурсия, свои библиотеки — 48 новых уроков. Ты почти завершил Y1!
              </p>
              <Link to="/learn/course/kubik-y2" className="kb-btn kb-btn--secondary">
                Открыть Year 2 →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Two tracks CTA — Games + Sites */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          <div
            className="kb-card kb-card--feature"
            style={{
              background: 'linear-gradient(135deg, var(--violet), var(--violet-deep))',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: 'var(--yellow)', fontWeight: 700 }}>ТРЕК 1 · ИГРЫ</span>
              <h2 className="h2" style={{ color: 'var(--paper)', marginTop: 8 }}>Построй свой 3D-мир</h2>
              <p style={{ color: 'var(--paper)', opacity: 0.92, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
                Перетаскивай блоки, пиши Python, публикуй свои игры. 3 режима: блоки → блоки+Python → чистый Python.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link
                to="/studio"
                className="kb-btn kb-btn--secondary kb-btn--lg"
                style={{ whiteSpace: 'nowrap' }}
              >
                🎮 Открыть студию игр
              </Link>
              <Link
                to="/profile"
                className="kb-btn kb-btn--secondary kb-btn--lg"
                style={{ whiteSpace: 'nowrap', opacity: 0.92 }}
              >
                🧑‍🎤 Собрать героя
              </Link>
            </div>
          </div>
          <div
            className="kb-card kb-card--feature"
            style={{
              background: 'linear-gradient(135deg, var(--mint-deep), var(--mint-ink))',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: 'var(--yellow)', fontWeight: 700 }}>ТРЕК 2 · САЙТЫ</span>
              <h2 className="h2" style={{ color: 'var(--paper)', marginTop: 8 }}>Собери свой сайт</h2>
              <p style={{ color: 'var(--paper)', opacity: 0.92, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
                Начни с шаблона и блок-секций, потом загляни под капот в HTML и CSS. Плавный путь от L1 к L2.
              </p>
            </div>
            <Link
              to="/sites"
              className="kb-btn kb-btn--secondary kb-btn--lg"
              style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
            >
              🌐 Открыть студию сайтов
            </Link>
          </div>
        </div>
      </section>

      {pyWarmup !== 'idle' && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            background: 'rgba(21,20,27,.88)',
            color: '#FFFBEF',
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 12px',
            borderRadius: 10,
            fontFamily: 'var(--f-display)',
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            opacity: pyWarmup === 'fading' ? 0 : 1,
            transition: 'opacity 600ms ease',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          ⏳ Готовим Python...
        </div>
      )}
    </PlatformShell>
  )
}
