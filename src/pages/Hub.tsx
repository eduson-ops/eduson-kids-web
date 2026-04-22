import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import { GAMES } from '../lib/games'

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

const MODULES = [
  { n: 1, title: 'Первые шаги в Эдюсон Kids',   accent: 'violet', lessons: 6, emoji: '🧱' },
  { n: 2, title: 'Движение и события',    accent: 'sky',    lessons: 6, emoji: '🎮' },
  { n: 3, title: 'Переменные и счёт',     accent: 'mint',   lessons: 6, emoji: '💰' },
  { n: 4, title: 'Функции и повторы',     accent: 'yellow', lessons: 6, emoji: '🔁' },
  { n: 5, title: 'Условия и логика',      accent: 'pink',   lessons: 6, emoji: '🧠' },
  { n: 6, title: 'Переход в Python',      accent: 'orange', lessons: 6, emoji: '🐍' },
  { n: 7, title: 'События и состояния',   accent: 'violet', lessons: 6, emoji: '⚡' },
  { n: 8, title: 'Публикация + авторство', accent: 'yellow', lessons: 6, emoji: '🏆' },
] as const

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
  const [currentLesson] = useState(3) // TODO: wire to real progress

  useEffect(() => {
    setName(localStorage.getItem('ek_child_name'))
  }, [])

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
            <strong>1 · Первые шаги</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Прогресс</span>
            <strong>{currentLesson} / 48 уроков</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Монет</span>
            <strong>{(currentLesson - 1) * 15} 💰</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Достижений</span>
            <strong>2 ⭐</strong>
          </div>
        </div>

        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="wave" size={280} />
        </div>

        {/* Deco blocks смещены вверх и в разные зоны — пингвин их не перекрывает. */}
        <div className="kb-cover-deco" aria-hidden>
          <div className="kb-cover-deco-block b-logic" style={{ left: '46%', top: 40, transform: 'rotate(6deg)' }}>Если</div>
          <div className="kb-cover-deco-block b-data" style={{ right: 320, top: 28, transform: 'rotate(-4deg)' }}>Повтори</div>
          <div className="kb-cover-deco-block b-event" style={{ right: 40, top: 40, transform: 'rotate(4deg)' }}>Клик</div>
        </div>
      </section>

      {/* Progress strip */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Твой путь</h2>
          <Link to="/learn" className="kb-shell-nav-link">Подробнее →</Link>
        </div>
        <div className="kb-card kb-card--feature" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Модуль 1 · Первые шаги в Эдюсон Kids</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>Урок {currentLesson} из 48</h3>
            <div className="kb-progress kb-progress--lg">
              <div className="kb-progress-bar" style={{ width: `${(currentLesson / 48) * 100}%`, background: 'var(--violet)' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 14, color: 'var(--ink-soft)', fontWeight: 600 }}>
              <span>🏆 {currentLesson - 1} завершено</span>
              <span>💰 {(currentLesson - 1) * 15} монет</span>
              <span>⭐ 2 достижения</span>
            </div>
          </div>
          <Link to={`/learn/${currentLesson}`} className="kb-btn kb-btn--lg">
            Продолжить
          </Link>
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
            const unlocked = m.n === 1
            return (
              <Link
                key={m.n}
                to={unlocked ? `/learn/module/${m.n}` : '#'}
                className="kb-course"
                style={{
                  '--accent': a.color,
                  '--accent-soft': a.soft,
                  '--accent-ink': a.ink,
                  opacity: unlocked ? 1 : 0.55,
                  pointerEvents: unlocked ? 'auto' : 'none',
                } as React.CSSProperties}
              >
                <div className="kb-course-top">
                  <span className="kb-course-age">M{m.n}</span>
                  <span className="kb-course-level">{m.lessons} уроков</span>
                </div>
                <div className="kb-course-icon">{m.emoji}</div>
                <div>
                  <div className="h3" style={{ fontSize: 16 }}>{m.title}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(21,20,27,.06)' }}>
                  <div className="kb-progress" style={{ flex: 1 }}>
                    <div className="kb-progress-bar" style={{ width: unlocked ? '40%' : '0%', background: a.color }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>
                    {unlocked ? 'В пути' : '🔒'}
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
