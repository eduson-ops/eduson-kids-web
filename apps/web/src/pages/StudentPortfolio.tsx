import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { loadAvatar } from '../lib/avatars'
import { MODULES, ALL_LESSONS, getLesson } from '../lib/curriculum'
import {
  countDoneInModule,
  getQuizResult,
  buyStreakFreeze,
  getStreak,
} from '../lib/progress'
import { useProgress } from '../hooks/useProgress'
import { useToast } from '../hooks/useToast'
import {
  ACHIEVEMENTS,
  RARITY_COLOR,
  RARITY_LABEL,
  ensureAchievementsWatcher,
} from '../lib/achievements'
import { hasAchievement } from '../lib/progress'
import { getSitesState } from '../sites/sitesState'
import {
  getBilling,
  subscribeBilling,
  buyInstallment48,
  buyPack10,
  startSubscription,
  cancelSubscription,
  lessonsRemaining,
  formatRub,
} from '../lib/billing'

const TOTAL_LESSONS = 48
const QUIZ_RESULTS_LIMIT = 12

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
  const prog = useProgress()

  useEffect(() => {
    ensureAchievementsWatcher()
    setName(localStorage.getItem('ek_child_name') ?? 'Гость')
    const unsub2 = subscribeBilling(() => force((x) => x + 1))
    return () => { unsub2() }
  }, [])

  const billing = getBilling()
  const remaining = lessonsRemaining()

  const lessonsDone = prog.completedLessons
  const streakState = { current: prog.streak, longest: prog.streak, lastDay: '' }
  const perfectQuizzes = prog.perfectQuizzes
  const avgScore = prog.avgQuizScore
  const achievements = prog.achievements
  const unlocked = new Set(prog.unlocked)
  const progressPct = (lessonsDone / TOTAL_LESSONS) * 100

  // Capstones status — memo so MODULES loop doesn't run on every render
  const capstones = useMemo(() => MODULES.map((m) => {
    const done = countDoneInModule(m.n, m.lessons.map((l) => l.n)) === m.lessons.length
    return { m, done }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [lessonsDone])
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
      {/* Cover-style hero */}
      <section className="kb-cover kb-cover--mint portfolio-hero-cover">
        <div className="kb-cover-meta">
          <span className="eyebrow">Личный кабинет · Портфолио</span>
          <span className="kb-cover-meta-row">
            <span>Стрик {streakState.current} дн.</span>
            <span className="dot" />
            <span>{achievements}/{ACHIEVEMENTS.length} ачивок</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Привет,<br/><span className="kb-cover-accent">{name}!</span>
        </h1>
        <p className="kb-cover-sub">
          Твой путь в&nbsp;коде. Здесь собрано всё что ты&nbsp;построил, чему научился и&nbsp;куда идёшь дальше.
        </p>
        <div className="kb-cover-footer">
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Уроков</span>
            <strong>{lessonsDone} / {TOTAL_LESSONS}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Стрик</span>
            <strong>🔥 {streakState.current} {streakState.current === 1 ? 'день' : 'дн.'}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Ачивок</span>
            <strong>🏆 {achievements} / {ACHIEVEMENTS.length}</strong>
          </div>
          <div className="kb-cover-footer-col">
            <span className="eyebrow">Прогресс</span>
            <strong>{Math.round(progressPct)}%</strong>
          </div>
        </div>

        <div className="portfolio-progress-ring" style={{ position: 'absolute', right: 56, top: 56, zIndex: 2 }}>
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
        <KPI label="Уроков" value={`${lessonsDone}/${TOTAL_LESSONS}`} emoji="🎓" color="#6B5CE7" />
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

      {/* Billing / lessons balance */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <h2 className="h2">Оплата и уроки</h2>
          <span className="eyebrow">баланс курса</span>
        </div>

        <div className="kb-card kb-card--feature" style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>
            <div>
              <span className="eyebrow">Оплачено уроков</span>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 40, color: 'var(--violet)', marginTop: 4 }}>
                {billing.lessonsPaid}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>всего куплено</div>
            </div>
            <div>
              <span className="eyebrow">Пройдено</span>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 40, color: 'var(--ink)', marginTop: 4 }}>
                {billing.lessonsUsed}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>использовано</div>
            </div>
            <div>
              <span className="eyebrow">Осталось</span>
              <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 40, color: 'var(--mint-deep)', marginTop: 4 }}>
                {remaining}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {remaining === 0 ? 'нужно докупить' : 'доступно к прохождению'}
              </div>
            </div>
          </div>

          {billing.lessonsPaid > 0 && (
            <div className="kb-progress kb-progress--lg" style={{ marginTop: 16 }}>
              <div
                className="kb-progress-bar"
                style={{
                  width: `${(billing.lessonsUsed / billing.lessonsPaid) * 100}%`,
                  background: 'linear-gradient(90deg, var(--violet), var(--yellow))',
                }}
              />
            </div>
          )}
        </div>

        {/* Subscription status */}
        <div className="kb-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">Подписка</span>
              <h3 className="h3" style={{ marginTop: 6 }}>
                {billing.subscription.active
                  ? `Активна — ${formatRub(billing.subscription.pricePerMonthRub)}/мес`
                  : 'Не подключена'}
              </h3>
              {billing.subscription.active && billing.subscription.nextChargeAt && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                  Следующее списание: {new Date(billing.subscription.nextChargeAt).toLocaleDateString('ru-RU')}.
                  Отменить можно в&nbsp;один клик — мы&nbsp;не&nbsp;привязываем.
                </p>
              )}
              {!billing.subscription.active && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                  {formatRub(5937)}/мес за&nbsp;безлимит уроков. Отключение в&nbsp;1 клик (ст. 32 ЗоЗПП).
                </p>
              )}
            </div>
            {billing.subscription.active ? (
              <button className="kb-btn kb-btn--ghost" onClick={cancelSubscription}>
                Отменить подписку
              </button>
            ) : (
              <button className="kb-btn kb-btn--secondary kb-btn--lg" onClick={startSubscription}>
                Подключить за {formatRub(5937)}/мес
              </button>
            )}
          </div>
        </div>

        {/* Quick buy options */}
        <div className="kb-grid-2">
          <div className="kb-card" style={{ borderLeft: '4px solid var(--violet)' }}>
            <span className="eyebrow">Полный курс в рассрочку</span>
            <h3 className="h3" style={{ marginTop: 6 }}>48 уроков за {formatRub(71244)}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
              Разовое зачисление 48 уроков сразу. Рассрочка через банк-партнёр, платишь помесячно.
            </p>
            <button className="kb-btn kb-btn--lg" style={{ marginTop: 14 }} onClick={buyInstallment48}>
              → Оформить рассрочку
            </button>
          </div>

          <div className="kb-card" style={{ borderLeft: '4px solid var(--yellow)' }}>
            <span className="eyebrow">Пак-добивка</span>
            <h3 className="h3" style={{ marginTop: 6 }}>+10 уроков за {formatRub(9900)}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
              Если нужно больше занятий помимо подписки или базового курса. Зачисляем моментально.
            </p>
            <button className="kb-btn kb-btn--lg kb-btn--secondary" style={{ marginTop: 14 }} onClick={buyPack10}>
              + Купить 10 уроков
            </button>
          </div>
        </div>

        {/* Purchase history */}
        {billing.purchases.length > 0 && (
          <div className="kb-card" style={{ marginTop: 16 }}>
            <span className="eyebrow">История покупок</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {billing.purchases.slice(0, 6).map((p) => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(21,20,27,.06)' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {p.kind === 'installment-48' ? 'Рассрочка 48 уроков' : p.kind === 'pack-10' ? 'Пак 10 уроков' : 'Подписка'}
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{formatRub(p.amountRub)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.55 }}>
          ⓘ MVP-заглушка: реальные списания подключим с&nbsp;бэкендом (ЮKassa / CloudPayments).
          Все оплаты пока локальные.
        </p>
      </section>

      {/* Streak Freeze shop */}
      <StreakFreezeShop />

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
          {ALL_LESSONS.filter((l) => getQuizResult(l.n)).slice(0, QUIZ_RESULTS_LIMIT).map((l) => {
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

/**
 * StreakFreezeShop — магазин заморозок стрика.
 * 200 монет = 1 заморозка. Максимум 3 в запасе.
 * Монеты сейчас не трекаются отдельно (placeholder: 15 за урок).
 */
function StreakFreezeShop() {
  const p = useProgress()
  const { show } = useToast()
  const [s, setS] = useState(() => getStreak())

  useEffect(() => {
    // Обновляем состояние при изменении прогресса (пройден урок → мог начислиться стрик)
    setS(getStreak())
  }, [p.streak, p.streakFreezes])

  // Placeholder монет — 15 за каждый урок (тот же расчёт что в Hub)
  const coins = p.completedLessons * 15
  const FREEZE_PRICE = 200
  const canAfford = coins >= FREEZE_PRICE
  const canBuy = s.freezes < 3

  const onBuy = () => {
    if (!canBuy) return show('Максимум 3 заморозки в запасе', 'info')
    if (!canAfford) return show(`Нужно ${FREEZE_PRICE} монет, а у тебя ${coins}`, 'info')
    if (!buyStreakFreeze()) return show('Не получилось купить', 'info')
    setS(getStreak())
    show('✓ Заморозка куплена!', 'success')
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h2 className="h2">Защита стрика</h2>
        <span className="eyebrow">❄ {s.freezes} / 3 в запасе</span>
      </div>
      <div className="kb-card kb-card--feature" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 64, flexShrink: 0 }} aria-hidden>❄</div>
        <div style={{ flex: '1 1 320px' }}>
          <h3 className="h3" style={{ margin: '0 0 8px' }}>
            Заморозка стрика
          </h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '0 0 10px', lineHeight: 1.55 }}>
            Пропустил день? Заморозка сама спасёт твой стрик —{' '}
            <strong>🔥 {s.current} дн.</strong> не сгорит. Одна заморозка бесплатно каждую неделю, остальные можно купить за монеты.
          </p>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
            У тебя: <strong>{coins}</strong> 💰 · Цена: <strong>{FREEZE_PRICE}</strong> 💰 за штуку
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
          <button
            className="kb-btn kb-btn--lg"
            onClick={onBuy}
            disabled={!canBuy || !canAfford}
            style={{ opacity: canBuy && canAfford ? 1 : 0.5 }}
          >
            ❄ Купить за {FREEZE_PRICE}
          </button>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', textAlign: 'center' }}>
            {s.freezes === 0 && 'Начни стрик — начислим одну бесплатно'}
            {s.freezes > 0 && s.freezes < 3 && `Есть ${s.freezes}. Можно купить ещё.`}
            {s.freezes >= 3 && '🎉 Максимум, больше не купить'}
          </div>
        </div>
      </div>
    </section>
  )
}
