import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import NikselIcon, { type NikselIconKind } from '../design/mascot/NikselIcon'
import { MascotMoodOverlay } from '../design/mascot/MascotMoodOverlay'
import { GAMES } from '../lib/games'
import { plural, pluralize } from '../lib/plural'
import { useProgress } from '../hooks/useProgress'
import { useMascotMood } from '../hooks/useMascotMood'
import PathMap from '../components/PathMap'

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

// ACCENT_MAP removed — PathMap resolves accent from its own --accent CSS var

export default function Hub() {
  const [name, setName] = useState<string | null>(null)
  const p = useProgress()
  const currentLesson = p.currentLesson
  const coins = p.completedLessons * 15 // placeholder: 15 coins per lesson
  const mood = useMascotMood('hub')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setName(localStorage.getItem('ek_child_name'))
  }, [])

  // Плашки растворяются после 200px скролла — чтобы не отвлекали при чтении модулей
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Unlock modules based on progress: module N unlocks after finishing lesson (N-1)*6
  const lessonsCompleted = p.completedLessons
  const courseComplete = lessonsCompleted >= 48
  const safeLesson = Math.min(currentLesson, 48)
  const unlockedModuleN = Math.max(1, Math.ceil((lessonsCompleted + 1) / 6))
  const currentModuleN = Math.min(8, Math.ceil(safeLesson / 6))
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
            <strong>{lessonsCompleted} / 48 {plural(lessonsCompleted, 'lesson')}</strong>
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

        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose={mood} size={280} />
          <MascotMoodOverlay mood={mood} />
        </div>

        {/* Plashki встают РЯДОМ в верхний ряд над title, НЕ над пингвином и не в его зоне. */}
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
            <div className="kb-progress-bar" style={{ width: `${(lessonsCompleted / 48) * 100}%`, background: 'var(--violet)' }} />
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            {lessonsCompleted} / 48 · {pluralize(coins, 'coin')}
          </div>
        </div>
      </section>

      {/* Course modules — Duolingo-style path map */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2 className="h2">Твой путь · 8 модулей</h2>
          <span className="eyebrow">{pluralize(48, 'lesson')}</span>
        </div>
        <PathMap
          modules={MODULES.map((m) => {
            const moduleLessonsStart = (m.n - 1) * m.lessons + 1
            const doneinModule = Math.min(m.lessons, Math.max(0, lessonsCompleted - (moduleLessonsStart - 1)))
            return {
              n: m.n,
              title: m.title,
              accent: m.accent,
              icon: m.icon,
              lessonsTotal: m.lessons,
              lessonsDone: doneinModule,
            }
          })}
          unlockedUpTo={unlockedModuleN}
          currentModuleN={currentModuleN}
        />
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

      {/* Y2 teaser — только когда Y1 завершён или почти (42+ уроков пройдено) */}
      {lessonsCompleted >= 42 && (
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
              background: 'linear-gradient(135deg, #6B5CE7, #4A3DB5)',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: '#FFD43C', fontWeight: 700 }}>ТРЕК 1 · ИГРЫ</span>
              <h2 className="h2" style={{ color: '#fff', marginTop: 8 }}>Построй свой 3D-мир</h2>
              <p style={{ color: '#fff', opacity: 0.92, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
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
              background: 'linear-gradient(135deg, #2E8C5F, #1E6D47)',
              color: 'var(--paper)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: '#FFD43C', fontWeight: 700 }}>ТРЕК 2 · САЙТЫ</span>
              <h2 className="h2" style={{ color: '#fff', marginTop: 8 }}>Собери свой сайт</h2>
              <p style={{ color: '#fff', opacity: 0.92, fontSize: 15, marginTop: 10, maxWidth: 420 }}>
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
