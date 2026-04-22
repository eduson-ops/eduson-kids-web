import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import NikselIcon, { type NikselIconKind } from '../design/mascot/NikselIcon'
import { GAMES } from '../lib/games'
import { plural, pluralize } from '../lib/plural'
import { useProgress } from '../hooks/useProgress'

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
  const coins = p.completedLessons * 15 // placeholder: 15 coins per lesson

  useEffect(() => {
    setName(localStorage.getItem('ek_child_name'))
  }, [])

  // Unlock modules based on progress: module N unlocks after finishing lesson (N-1)*6
  const lessonsCompleted = p.completedLessons
  const unlockedModuleN = Math.max(1, Math.ceil((lessonsCompleted + 1) / 6))
  const currentModuleN = Math.min(8, Math.ceil(currentLesson / 6))
  const currentModuleTitle = MODULES[currentModuleN - 1]?.title ?? 'Первые шаги в Эдюсон Kids'

  const featuredGames = GAMES.filter((g) => g.featured).slice(0, 3)

  return (
    <PlatformShell activeKey="hub">
      {/* Cover-style hero (Designbook pattern) */}
      <section className="kb-cover">
        <div className="kb-cover-meta">
          <span className="eyebrow">С&nbsp;возвращением{name ? `, ${name}` : ''}</span>
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
          Строй 3D-миры, собирай игры из блоков, пиши Python.<br/>
          Платформа блочного программирования для&nbsp;возраста 9–15&nbsp;лет.
        </p>
        <div className="kb-cover-actions">
          <Link to={`/learn/${currentLesson}`} className="kb-btn kb-btn--lg kb-btn--secondary">
            ▶ Продолжить урок {currentLesson}
          </Link>
          <Link to="/learn" className="kb-btn kb-btn--lg kb-btn--ghost" style={{ color: 'var(--paper)', boxShadow: 'inset 0 0 0 2px rgba(255,251,243,.6)' }}>
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
            <strong>{lessonsCompleted} / 48 {plural(48, 'lesson')}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Монет</span>
            <strong>{coins} 💰</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Достижений</span>
            <strong>2 ⭐</strong>
          </div>
        </div>

        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="wave" size={280} />
        </div>

        {/* Plashki встают РЯДОМ в верхний ряд над title, НЕ над пингвином и не в его зоне. */}
        <div className="kb-cover-deco kb-cover-deco--top-row" aria-hidden>
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
            <div className="kb-progress-bar" style={{ width: `${(lessonsCompleted / 48) * 100}%`, background: 'var(--violet)' }} />
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            {lessonsCompleted} / 48 · {pluralize(coins, 'coin')}
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
            const a = ACCENT_MAP[m.accent]
            const unlocked = m.n <= unlockedModuleN
            const isActive = m.n === currentModuleN
            // Module internal progress: how many of this module's 6 lessons are done
            const moduleLessonsStart = (m.n - 1) * m.lessons + 1
            const doneinModule = Math.min(m.lessons, Math.max(0, lessonsCompleted - (moduleLessonsStart - 1)))
            const modulePct = (doneinModule / m.lessons) * 100
            return (
              <Link
                key={m.n}
                to={unlocked ? `/learn/module/${m.n}` : '#'}
                className={`kb-course${isActive ? ' kb-course--active' : ''}`}
                style={{
                  '--accent': a.color,
                  '--accent-soft': a.soft,
                  '--accent-ink': a.ink,
                  opacity: unlocked ? 1 : 0.45,
                  pointerEvents: unlocked ? 'auto' : 'none',
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

      {/* Y2 teaser — только когда Y1 завершён или почти (урок ≥ 43) */}
      {currentLesson >= 43 && (
        <section style={{ marginBottom: 40 }}>
          <div
            className="kb-card kb-card--feature"
            style={{
              background: 'linear-gradient(135deg, #FF9454 0%, #6B5CE7 140%)',
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
              background: 'linear-gradient(135deg, var(--violet-soft), var(--violet) 140%)',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,251,243,.65)' }}>Трек 1 · Игры</span>
              <h2 className="h2" style={{ color: 'var(--paper)', marginTop: 8 }}>Построй свой 3D-мир</h2>
              <p style={{ color: 'rgba(255,251,243,.85)', fontSize: 15, marginTop: 10, maxWidth: 420 }}>
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
              background: 'linear-gradient(135deg, #E1F7EC, #34C38A 140%)',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: 'rgba(255,251,243,.75)' }}>Трек 2 · Сайты</span>
              <h2 className="h2" style={{ color: 'var(--paper)', marginTop: 8 }}>Собери свой сайт</h2>
              <p style={{ color: 'rgba(255,251,243,.9)', fontSize: 15, marginTop: 10, maxWidth: 420 }}>
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
    </PlatformShell>
  )
}
