import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { loadAvatar } from '../lib/avatars'
import { MODULES, ALL_LESSONS, getLesson } from '../lib/curriculum'
import {
  countDone,
  countDoneInModule,
  countAchievements,
  countPerfectQuizzes,
  averageQuizScore,
  getStreak,
  getQuizResult,
  getUnlockedAchievements,
  subscribeProgress,
} from '../lib/progress'
import {
  ACHIEVEMENTS,
  RARITY_COLOR,
  RARITY_LABEL,
  ensureAchievementsWatcher,
} from '../lib/achievements'
import { hasAchievement } from '../lib/progress'
import { getSitesState } from '../sites/sitesState'

/**
 * StudentPortfolio — личный кабинет ученика.
 *
 * Разделы:
 *   1. Hero: имя + статус + стрик + прогресс-кольцо
 *   2. Быстрая статистика (4 KPI)
 *   3. Путь курса: 8 модулей как визуальная дорожка
 *   4. Капстоны: 8 слотов (пройденные яркие, остальные призраки)
 *   5. Мои проекты: Studio scene + Sites
 *   6. Достижения: 17 бэйджей с фильтром «полученные/все»
 *   7. Активность: 14 дней bar-chart
 */
export default function StudentPortfolio() {
  const [, force] = useState(0)
  const [name, setName] = useState('Гость')
  const avatar = useMemo(() => loadAvatar(), [])
  const sites = useMemo(() => getSitesState().sites, [])

  useEffect(() => {
    ensureAchievementsWatcher()
    setName(localStorage.getItem('ek_child_name') ?? 'Гость')
    return subscribeProgress(() => force((x) => x + 1))
  }, [])

  const lessonsDone = countDone()
  const streakState = getStreak()
  const perfectQuizzes = countPerfectQuizzes()
  const avgScore = averageQuizScore()
  const achievements = countAchievements()
  const unlocked = getUnlockedAchievements()
  const progressPct = (lessonsDone / 48) * 100

  // Capstones status
  const capstones = MODULES.map((m) => {
    const done = countDoneInModule(m.n, m.lessons.map((l) => l.n)) === m.lessons.length
    return { m, done }
  })
  const capstonesDone = capstones.filter((c) => c.done).length

  // Studio scene data
  const studioParts = useMemo(() => {
    try {
      const raw = localStorage.getItem('ek_studio_v1')
      if (!raw) return 0
      const state = JSON.parse(raw) as { parts?: unknown[] }
      return (state.parts ?? []).length
    } catch { return 0 }
  }, [])

  return (
    <PlatformShell activeKey="portfolio">
      {/* Hero */}
      <section className="kb-hero portfolio-hero">
        <div>
          <span className="eyebrow">Личный кабинет · Портфолио</span>
          <h1>Привет, {name}!</h1>
          <p>
            Твой путь в коде. Здесь собрано всё что ты построил, чему научился и куда идёшь дальше.
          </p>
          <div className="portfolio-hero-meta">
            <span className="portfolio-hero-tag">
              🎓 {lessonsDone} / 48 уроков
            </span>
            <span className="portfolio-hero-tag streak">
              🔥 {streakState.current} {streakState.current === 1 ? 'день' : 'дн.'} стрик
            </span>
            <span className="portfolio-hero-tag">
              🏆 {achievements} / {ACHIEVEMENTS.length} ачивок
            </span>
          </div>
        </div>
        <div className="portfolio-progress-ring">
          <svg viewBox="0 0 140 140" width={180} height={180}>
            <circle cx={70} cy={70} r={60} fill="none" stroke="rgba(107,92,231,.15)" strokeWidth={14} />
            <circle
              cx={70} cy={70} r={60}
              fill="none"
              stroke="url(#progGrad)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${(progressPct / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
              transform="rotate(-90 70 70)"
            />
            <defs>
              <linearGradient id="progGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6B5CE7" />
                <stop offset="100%" stopColor="#FFD43C" />
              </linearGradient>
            </defs>
            <text x={70} y={68} textAnchor="middle" fontSize={26} fontWeight={800} fill="#15141b">
              {Math.round(progressPct)}%
            </text>
            <text x={70} y={92} textAnchor="middle" fontSize={11} fill="#6b6e78">
              пройдено
            </text>
          </svg>
        </div>
      </section>

      {/* KPIs */}
      <section className="portfolio-kpis">
        <KPI label="Уроков" value={`${lessonsDone}/48`} emoji="🎓" color="#6B5CE7" />
        <KPI label="Капстонов" value={`${capstonesDone}/8`} emoji="🏆" color="#FFD43C" />
        <KPI label="Идеальных квизов" value={`${perfectQuizzes}`} emoji="🧠" color="#FFB4C8" />
        <KPI label="Средний балл" value={`${Math.round(avgScore * 100)}%`} emoji="📊" color="#9FE8C7" />
      </section>

      {/* Путь курса */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Твой путь</h2>
          <Link to="/learn" className="kb-shell-nav-link">В каталог →</Link>
        </div>
        <div className="portfolio-journey">
          {MODULES.map((m, i) => {
            const done = countDoneInModule(m.n, m.lessons.map((l) => l.n))
            const pct = (done / m.lessons.length) * 100
            const fullDone = pct === 100
            return (
              <Link
                key={m.n}
                to={`/learn/module/${m.n}`}
                className={`portfolio-mod ${fullDone ? 'done' : ''}`}
                style={{ '--accent': m.accent } as React.CSSProperties}
              >
                <div className="portfolio-mod-emoji">{m.emoji}</div>
                <div className="portfolio-mod-n">M{m.n}</div>
                <div className="portfolio-mod-title">{m.title}</div>
                <div className="portfolio-mod-bar">
                  <div className="portfolio-mod-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="portfolio-mod-count">{done}/{m.lessons.length}</div>
                {i < MODULES.length - 1 && <div className="portfolio-mod-connector" />}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Капстоны */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Твои капстоны</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 20, fontSize: 14 }}>
          Одна игра на модуль. После защиты — слот подсвечивается.
        </p>
        <div className="portfolio-capstones">
          {capstones.map(({ m, done }) => (
            <div
              key={m.n}
              className={`portfolio-caps ${done ? 'unlocked' : 'ghost'}`}
              style={{ '--accent': m.accent } as React.CSSProperties}
            >
              <div className="portfolio-caps-emoji">{m.emoji}</div>
              <div className="portfolio-caps-title">{m.capstone.name}</div>
              <div className="portfolio-caps-meta">{m.capstone.genre}</div>
              {done ? (
                <div className="portfolio-caps-badge">✓ Защищён</div>
              ) : (
                <div className="portfolio-caps-badge ghost">🔒 После M{m.n}</div>
              )}
              {done && m.capstone.worldId && (
                <Link to={`/play/${m.capstone.worldId}`} className="kb-btn kb-btn--sm" style={{ marginTop: 8 }}>
                  ▶ Играть
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Мои проекты */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Мои проекты</h2>
        <div className="portfolio-projects">
          <div className="kb-card">
            <div className="eyebrow">Сцена студии</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>🧱 Моя 3D-сцена</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '0 0 14px' }}>
              {studioParts > 0 ? `${studioParts} частей на сцене` : 'Сцена пуста — построй что-нибудь!'}
            </p>
            <Link to="/studio" className="kb-btn kb-btn--sm">🧱 Открыть Студию</Link>
          </div>

          <div className="kb-card">
            <div className="eyebrow">Сайты</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>🌐 Мои страницы</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '0 0 14px' }}>
              {sites.length > 0 ? `${sites.length} сайтов собрано` : 'Создай первый сайт из шаблона или блоков'}
            </p>
            <Link to="/sites" className="kb-btn kb-btn--sm">🌐 К сайтам</Link>
          </div>

          <div className="kb-card">
            <div className="eyebrow">Аватар</div>
            <h3 className="h3" style={{ margin: '8px 0 12px' }}>🧑‍🎤 {avatar.name}</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '0 0 14px' }}>
              Твой 3D-герой. Меняется во всех играх.
            </p>
            <Link to="/profile" className="kb-btn kb-btn--sm">✏ Редактировать</Link>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Достижения</h2>
          <span className="eyebrow">{unlocked.size} / {ACHIEVEMENTS.length}</span>
        </div>
        <div className="portfolio-achievements">
          {ACHIEVEMENTS.map((a) => {
            const unlockedFlag = hasAchievement(a.id)
            return (
              <div
                key={a.id}
                className={`portfolio-ach ${unlockedFlag ? 'unlocked' : 'locked'}`}
                style={{
                  '--accent': a.color,
                  '--rarity': RARITY_COLOR[a.rarity],
                } as React.CSSProperties}
                title={a.description}
              >
                <div className="portfolio-ach-emoji">{unlockedFlag ? a.emoji : '🔒'}</div>
                <div className="portfolio-ach-title">{a.title}</div>
                <div className="portfolio-ach-rarity">{RARITY_LABEL[a.rarity]}</div>
                <div className="portfolio-ach-desc">{a.description}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Streak + quizzes */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Результаты квизов</h2>
        <div className="portfolio-quizzes">
          {ALL_LESSONS.filter((l) => getQuizResult(l.n)).slice(0, 12).map((l) => {
            const r = getQuizResult(l.n)!
            const pct = Math.round(r.bestScore * 100)
            return (
              <Link key={l.n} to={`/learn/lesson/${l.n}/present`} className="portfolio-quiz">
                <div className="portfolio-quiz-n">L{l.n}</div>
                <div className="portfolio-quiz-title">{l.title}</div>
                <div
                  className="portfolio-quiz-score"
                  style={{
                    color: pct >= 80 ? '#34C38A' : pct >= 50 ? '#FFD43C' : '#ff5464',
                  }}
                >
                  {r.correct}/{r.total} · {pct}%
                </div>
              </Link>
            )
          })}
          {ALL_LESSONS.filter((l) => getQuizResult(l.n)).length === 0 && (
            <div className="kb-card" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
              Пока квизов не пройдено. Открой любой урок → «▶ Открыть презентацию» → долистай до Квиза.
            </div>
          )}
        </div>
      </section>

      {/* Next steps */}
      <section style={{ marginBottom: 40 }}>
        <div className="kb-card kb-card--feature" style={{
          background: 'linear-gradient(135deg, rgba(107,92,231,.08), rgba(255,212,60,.1))',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 24,
          alignItems: 'center',
        }}>
          <div>
            <div className="eyebrow">Что дальше</div>
            <h3 className="h3" style={{ margin: '8px 0 10px' }}>
              {lessonsDone >= 48
                ? '🎓 Ты прошёл весь курс!'
                : lessonsDone === 0
                  ? '🚀 Начни с первого урока'
                  : `Продолжи: урок ${lessonsDone + 1}`}
            </h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: 0 }}>
              {lessonsDone >= 48
                ? 'Поздравляем! Сертификат уже готовится. А пока — построй что-то своё в Студии.'
                : 'Следующий непройденный урок готов. Открывай презентацию и поехали.'}
            </p>
          </div>
          <Link
            to={lessonsDone >= 48 ? '/studio' : `/learn/lesson/${Math.min(lessonsDone + 1, 48)}`}
            className="kb-btn kb-btn--lg"
          >
            {lessonsDone >= 48 ? '🧱 Своё творчество' : '▶ К уроку'}
          </Link>
        </div>
      </section>
    </PlatformShell>
  )

  void getLesson   // для type-check unused-guard в некоторых bundler'ах
}

function KPI({ label, value, emoji, color }: { label: string; value: string; emoji: string; color: string }) {
  return (
    <div className="portfolio-kpi" style={{ '--accent': color } as React.CSSProperties}>
      <div className="portfolio-kpi-emoji">{emoji}</div>
      <div className="portfolio-kpi-value">{value}</div>
      <div className="portfolio-kpi-label">{label}</div>
    </div>
  )
}
