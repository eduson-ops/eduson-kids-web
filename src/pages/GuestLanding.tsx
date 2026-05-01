import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'

const RUBITIME_WIDGET_URL = import.meta.env.VITE_RUBITIME_WIDGET_URL as string | undefined
const RUBITIME_NEXT_LESSON_DATETIME = import.meta.env.VITE_RUBITIME_NEXT_LESSON_DATETIME as string | undefined
const RUBITIME_NEXT_LESSON_LINK = import.meta.env.VITE_RUBITIME_NEXT_LESSON_LINK as string | undefined

function formatLessonDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
  }) + ' (МСК)'
}

function RubitimeBlock() {
  if (RUBITIME_WIDGET_URL) {
    return (
      <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--sh-3)', marginTop: 8 }}>
        <iframe
          src={RUBITIME_WIDGET_URL}
          width="100%"
          height="380"
          style={{ border: 'none', display: 'block' }}
          title="Запись на занятие"
        />
      </div>
    )
  }

  if (RUBITIME_NEXT_LESSON_DATETIME) {
    return (
      <div className="kb-card" style={{ padding: 28, background: 'var(--violet)', color: '#fff', borderRadius: 20, marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          Ближайшее бесплатное занятие
        </div>
        <div style={{ fontSize: 28, fontFamily: 'var(--f-display)', fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
          {formatLessonDate(RUBITIME_NEXT_LESSON_DATETIME)}
        </div>
        {RUBITIME_NEXT_LESSON_LINK && (
          <a
            href={RUBITIME_NEXT_LESSON_LINK}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block', background: '#fff', color: 'var(--violet)',
              fontWeight: 900, fontSize: 16, padding: '12px 28px', borderRadius: 12,
              textDecoration: 'none', boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
            }}
          >
            Войти на занятие →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="kb-card" style={{ padding: 24, background: 'var(--violet-soft)', borderRadius: 20, marginTop: 8 }}>
      <div style={{ fontSize: 14, color: 'var(--violet-ink)', fontWeight: 600, lineHeight: 1.6 }}>
        Расписание занятий настраивается через панель администратора.<br />
        Укажите <code>VITE_RUBITIME_WIDGET_URL</code> или <code>VITE_RUBITIME_NEXT_LESSON_DATETIME</code> в .env файле.
      </div>
    </div>
  )
}

const TRACKS = [
  {
    id: 'python',
    color: '#3E87E8',
    bg: 'var(--sky-soft)',
    ink: 'var(--sky-ink)',
    emoji: '🐢',
    title: 'Python',
    tagline: 'Черепашка и первый код',
    desc: 'Рисуем узоры черепашкой, пишем игры на Python. Ребёнок понимает логику программирования с первого занятия.',
    projects: ['Черепашка рисует звезду', 'Угадай число', 'Анимация из спиралей'],
    icon: '🐍',
  },
  {
    id: 'scratch',
    color: '#FF9454',
    bg: 'var(--orange-soft)',
    ink: 'var(--orange-ink)',
    emoji: '🎮',
    title: 'Scratch',
    tagline: '2 игры за первое занятие',
    desc: 'Блочное программирование — создаём настоящие игры мышкой. Без печатания, полная свобода творчества.',
    projects: ['Поймай монстра', 'Гонки на трассе'],
    icon: '🧩',
  },
  {
    id: 'vibe',
    color: '#E8517B',
    bg: 'var(--pink-soft)',
    ink: 'var(--pink-ink)',
    emoji: '🌐',
    title: 'Vibe-coding',
    tagline: 'Свой сайт за 1 час',
    desc: 'HTML, CSS и JavaScript — строим собственные сайты, анимации и мини-приложения. Современный веб с нуля.',
    projects: ['Личная страница', 'Анимированный баннер', 'Кликер с очками'],
    icon: '✨',
  },
]

const PARENT_BLOCKS = [
  { icon: '📚', title: 'Методички для родителей', desc: 'Как поддержать ребёнка дома — конспекты к каждому занятию.' },
  { icon: '🗓', title: 'Расписание и напоминания', desc: 'Уведомление в день занятия — не пропустите ни одного урока.' },
  { icon: '📊', title: 'Отчёт о прогрессе', desc: 'Еженедельная сводка: что освоил, где затруднился, что впереди.' },
  { icon: '🎓', title: 'Сертификат по итогам', desc: 'Официальный документ об окончании курса от Eduson Academy.' },
]

export default function GuestLanding() {
  const [guestCode, setGuestCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const navigate = useNavigate()

  function handleCodeSubmit() {
    const code = guestCode.trim()
    if (!code) { setCodeError('Введите код наставника'); return }
    setCodeError('')
    navigate(`/join/${encodeURIComponent(code)}`)
  }

  return (
    <PlatformShell>
      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--violet) 0%, #3E87E8 100%)',
        borderRadius: 28, padding: '56px 40px', marginBottom: 40,
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Eduson Kids · Программирование для детей 9–15 лет
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.1, margin: '0 0 16px' }}>
            Первое занятие — бесплатно
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.6, margin: '0 0 32px', maxWidth: 480 }}>
            Python, Scratch или Vibe-coding — выбери трек и начни создавать настоящие проекты уже на первом уроке.
          </p>

          {/* Rubitime: дата + ссылка вместо формы */}
          <RubitimeBlock />

          {/* Код наставника */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 10 }}>Уже есть код наставника?</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={guestCode}
                onChange={(e) => { setGuestCode(e.target.value); setCodeError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                placeholder="Введите код занятия"
                style={{
                  flex: 1, minWidth: 180, padding: '12px 16px', borderRadius: 12,
                  border: '2px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 16, fontFamily: 'var(--f-ui)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCodeSubmit}
                style={{
                  background: '#fff', color: 'var(--violet)', fontWeight: 900,
                  fontSize: 15, padding: '12px 24px', borderRadius: 12, border: 'none',
                  cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
                }}
              >
                Войти →
              </button>
            </div>
            {codeError && <div style={{ color: '#FFB4C8', fontSize: 13, marginTop: 8 }}>{codeError}</div>}
          </div>
        </div>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      </section>

      {/* ── Треки ── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>
            Направления обучения
          </div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, margin: 0, color: 'var(--ink)' }}>
            Три пути в программирование
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {TRACKS.map((t) => (
            <div
              key={t.id}
              className="kb-card"
              style={{ background: t.bg, border: `2px solid transparent`, borderRadius: 22, padding: 28, transition: 'box-shadow .2s' }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{t.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: t.ink, marginBottom: 6 }}>
                {t.tagline}
              </div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 24, margin: '0 0 10px', color: t.ink }}>
                {t.icon} {t.title}
              </h3>
              <p style={{ fontSize: 14, color: t.ink, opacity: 0.85, lineHeight: 1.6, margin: '0 0 18px' }}>
                {t.desc}
              </p>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.ink, opacity: 0.7, marginBottom: 8 }}>
                Проекты на пробном занятии:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {t.projects.map((p) => (
                  <li key={p} style={{ fontSize: 13, color: t.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scratch демо ── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 24, margin: 0, color: 'var(--ink)' }}>
            🎮 Сыграй в игры, которые делаем на Scratch
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 8 }}>
            Это настоящие проекты учеников — точно такие же вы сделаете на первом занятии.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {[
            { src: '/scratch/game1.sb3', title: 'Игра 1 · Поймай монстра', color: '#FF9454' },
            { src: '/scratch/game2.sb3', title: 'Игра 2 · Гонки', color: '#E8517B' },
          ].map((g) => (
            <div key={g.src} className="kb-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
              <div style={{ background: g.color, padding: '12px 20px', fontWeight: 900, fontSize: 14, color: '#fff' }}>
                {g.title}
              </div>
              <iframe
                src={`https://turbowarp.org/embed#project=${encodeURIComponent(location.origin + g.src)}`}
                width="100%"
                height="300"
                style={{ border: 'none', display: 'block' }}
                title={g.title}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Для родителей ── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8 }}>
            Для родителей
          </div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, margin: 0, color: 'var(--ink)' }}>
            Всё, чтобы ребёнок учился с удовольствием
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {PARENT_BLOCKS.map((b) => (
            <div
              key={b.title}
              className="kb-card"
              style={{ padding: 24, background: 'var(--paper-2)', border: '1.5px solid var(--paper-3)', borderRadius: 18 }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{b.icon}</div>
              <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 16, margin: '0 0 8px', color: 'var(--ink)' }}>
                {b.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA нижний ── */}
      <section style={{ marginBottom: 48 }}>
        <div
          className="kb-card"
          style={{
            background: 'var(--ink)', color: 'var(--paper)', borderRadius: 24,
            padding: '40px 40px', textAlign: 'center',
          }}
        >
          <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 28, margin: '0 0 12px' }}>
            Начните прямо сейчас
          </h2>
          <p style={{ fontSize: 16, opacity: 0.75, margin: '0 0 28px' }}>
            Первое занятие бесплатно · Без подготовки · Всё объяснит преподаватель
          </p>
          <RubitimeBlock />
        </div>
      </section>
    </PlatformShell>
  )
}
