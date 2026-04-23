import { useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import NikselIcon from '../design/mascot/NikselIcon'
import { pluralize } from '../lib/plural'

/**
 * /teacher — учительская консоль (MVP-заглушка для B2B/B2G-питча).
 *
 * 3 вкладки:
 *   1. «Классы» — список с кодами приглашения (mock-data: 2 класса)
 *   2. «Прогресс» — heatmap 20 учеников × 8 модулей
 *   3. «Назначения» — пригласить домашнее задание группе
 *
 * Доступ:
 *   - localStorage.ek_role = 'teacher'
 *   - или ?role=teacher в URL (для демо)
 *   - иначе — заглушка «Эта страница для учителей»
 *
 * В production: backend-роль, заявка на верификацию школы, SSO через Сферум.
 */

function isTeacherRole(): boolean {
  if (typeof window === 'undefined') return false
  const urlRole = new URLSearchParams(window.location.search).get('role')
  if (urlRole === 'teacher') {
    localStorage.setItem('ek_role', 'teacher')
    return true
  }
  return localStorage.getItem('ek_role') === 'teacher'
}

type Tab = 'classes' | 'progress' | 'assignments'

interface Student {
  id: string
  name: string
  progress: number // 0..48
  streak: number
  lastActive: string
}

interface Classroom {
  id: string
  name: string
  inviteCode: string
  students: Student[]
  createdAt: number
}

// ─── Mock data ────────────────────────────────────

const FIRST_NAMES = ['Никита', 'Мария', 'Алексей', 'София', 'Артём', 'Анна', 'Михаил', 'Полина', 'Иван', 'Ксения', 'Даниил', 'Вика', 'Егор', 'Алиса', 'Максим', 'Ева', 'Тимофей', 'Дарья', 'Роман', 'Лиза']
const SURNAME_INITIALS = ['А.', 'Б.', 'В.', 'Г.', 'Д.', 'Е.', 'Ж.', 'З.', 'И.', 'К.', 'Л.', 'М.', 'Н.', 'О.', 'П.', 'Р.', 'С.', 'Т.', 'У.', 'Ф.']

function genStudent(seed: number): Student {
  const rng = (s: number) => {
    let x = s
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
  const r1 = rng(seed * 31)
  const r2 = rng(seed * 37 + 13)
  const r3 = rng(seed * 41 + 7)
  const daysAgo = Math.floor(r3 * 7)
  return {
    id: `st-${seed}`,
    name: `${FIRST_NAMES[Math.floor(r1 * FIRST_NAMES.length)]} ${SURNAME_INITIALS[Math.floor(r2 * SURNAME_INITIALS.length)]}`,
    progress: Math.floor(r1 * 48),
    streak: Math.floor(r2 * 25),
    lastActive: daysAgo === 0 ? 'сегодня' : daysAgo === 1 ? 'вчера' : `${daysAgo} дн. назад`,
  }
}

const MOCK_CLASSES: Classroom[] = [
  {
    id: 'class-5a',
    name: '5А · Эдюсон Kids',
    inviteCode: 'KIDS5A',
    students: Array.from({ length: 20 }, (_, i) => genStudent(i + 1)),
    createdAt: Date.now() - 14 * 24 * 3600_000,
  },
  {
    id: 'class-6b',
    name: '6Б · Python pilot',
    inviteCode: 'PYTH6B',
    students: Array.from({ length: 12 }, (_, i) => genStudent(i + 100)),
    createdAt: Date.now() - 4 * 24 * 3600_000,
  },
]

export default function Teacher() {
  const isTeacher = isTeacherRole()
  const [tab, setTab] = useState<Tab>('classes')
  const [activeClassId, setActiveClassId] = useState<string>(MOCK_CLASSES[0].id)
  const active = MOCK_CLASSES.find((c) => c.id === activeClassId) ?? MOCK_CLASSES[0]

  if (!isTeacher) {
    return (
      <PlatformShell>
        <section className="kb-cover">
          <h1 className="kb-cover-title">
            Учительская<br/>консоль<span className="kb-cover-accent">.</span>
          </h1>
          <p className="kb-cover-sub">
            Страница для учителей и школ. Чтобы попробовать в демо-режиме — добавь
            <code style={{ background: 'rgba(255,251,243,.15)', padding: '2px 6px', borderRadius: 4, margin: '0 4px' }}>?role=teacher</code>
            к адресу.
          </p>
          <div className="kb-cover-actions">
            <Link to="/teacher?role=teacher" className="kb-btn kb-btn--lg kb-btn--secondary">
              Демо-режим →
            </Link>
            <Link to="/" className="kb-btn kb-btn--lg kb-btn--ghost" style={{ color: 'var(--paper)', boxShadow: 'inset 0 0 0 2px rgba(255,251,243,.6)' }}>
              На главную
            </Link>
          </div>
          <div className="kb-cover-mascot" aria-hidden>
            <Niksel pose="think" size={240} />
          </div>
        </section>
        <section className="kb-card" style={{ padding: 32, maxWidth: 640 }}>
          <h2 className="h2">Для школ и преподавателей</h2>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 12 }}>
            Эдюсон Kids предоставляет учителям дашборд с прогрессом учеников, heatmap освоения модулей
            и инструмент назначения заданий. Цена — от 199 ₽/seat в месяц при классе 30+ учеников.
          </p>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 12 }}>
            <strong>В роадмапе:</strong> LTI 1.3 для подключения из Сферум/Moodle/Canvas,
            SCORM-экспорт капстонов, SAML SSO, админ-консоль с SoC 2 готовностью.
          </p>
          <a href="mailto:schools@eduson.kids" className="kb-btn kb-btn--secondary" style={{ marginTop: 16 }}>
            ✉ Написать для школ
          </a>
        </section>
      </PlatformShell>
    )
  }

  return (
    <PlatformShell>
      <section className="kb-cover kb-cover--violet">
        <div className="kb-cover-meta">
          <span className="eyebrow">Учительская консоль · демо</span>
          <span className="kb-cover-meta-row">
            <span>{MOCK_CLASSES.length} {pluralize(MOCK_CLASSES.length, 'day').split(' ')[1] === 'дней' ? 'классов' : 'класса'}</span>
            <span className="dot" />
            <span>{MOCK_CLASSES.reduce((s, c) => s + c.students.length, 0)} учеников</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Кабинет<br/><span className="kb-cover-accent">учителя</span>
        </h1>
        <p className="kb-cover-sub">
          Следите за прогрессом класса, выдавайте задания, собирайте heatmap.
          Данные сейчас демо — при полной интеграции подтягиваются из Сферум/LTI.
        </p>
        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="wave" size={240} />
        </div>
      </section>

      {/* Tabs */}
      <div className="kb-tabs" role="tablist" style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid rgba(21,20,27,.08)' }}>
        {([
          { k: 'classes' as Tab, label: '🏫 Классы' },
          { k: 'progress' as Tab, label: '📊 Прогресс' },
          { k: 'assignments' as Tab, label: '📝 Задания' },
        ]).map(({ k, label }) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--f-display)',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              color: tab === k ? 'var(--violet)' : 'var(--ink-soft)',
              borderBottom: tab === k ? '3px solid var(--violet)' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Class picker (shared) */}
      {tab !== 'classes' && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MOCK_CLASSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={activeClassId === c.id ? 'kb-btn kb-btn--secondary' : 'kb-btn'}
              style={{ fontSize: 13 }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {tab === 'classes' && <ClassesTab />}
      {tab === 'progress' && <ProgressTab classroom={active} />}
      {tab === 'assignments' && <AssignmentsTab classroom={active} />}
    </PlatformShell>
  )
}

// ─── Tab: Classes ─────────────────────────────────

function ClassesTab() {
  const [showCreate, setShowCreate] = useState(false)
  return (
    <>
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 className="h2">Мои классы</h2>
        <button className="kb-btn kb-btn--secondary" onClick={() => setShowCreate(true)}>
          ➕ Создать класс
        </button>
      </section>

      {showCreate && (
        <div className="kb-card kb-card--feature" style={{ marginBottom: 20, background: 'var(--yellow-soft)' }}>
          <h3 className="h3">Новый класс</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 16px' }}>
            В production создание добавит запись в БД. Сейчас демо — только mock-данные отображаются.
            Ученики подключаются через 6-буквенный код приглашения или QR-код.
          </p>
          <button className="kb-btn" onClick={() => setShowCreate(false)}>Закрыть</button>
        </div>
      )}

      <div className="kb-grid-2">
        {MOCK_CLASSES.map((c) => {
          const avgProgress = Math.round(c.students.reduce((s, st) => s + st.progress, 0) / c.students.length)
          const activeNow = c.students.filter((s) => s.lastActive === 'сегодня').length
          return (
            <div key={c.id} className="kb-card kb-card--feature">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span className="eyebrow">Класс</span>
                  <h3 className="h3" style={{ marginTop: 4 }}>{c.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="eyebrow">Код</span>
                  <code style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 18, fontWeight: 900, color: 'var(--violet)', marginTop: 4 }}>
                    {c.inviteCode}
                  </code>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '14px 0', borderTop: '1px solid rgba(21,20,27,.08)', borderBottom: '1px solid rgba(21,20,27,.08)' }}>
                <div>
                  <div className="eyebrow">Учеников</div>
                  <strong style={{ fontSize: 20, color: 'var(--violet)' }}>{c.students.length}</strong>
                </div>
                <div>
                  <div className="eyebrow">Сегодня</div>
                  <strong style={{ fontSize: 20, color: 'var(--mint-deep, #3DB07A)' }}>{activeNow}</strong>
                </div>
                <div>
                  <div className="eyebrow">Прогресс</div>
                  <strong style={{ fontSize: 20, color: 'var(--yellow-ink, #7A5900)' }}>{avgProgress}/48</strong>
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="kb-btn kb-btn--sm kb-btn--secondary">Открыть →</button>
                <button className="kb-btn kb-btn--sm" onClick={() => navigator.clipboard?.writeText(c.inviteCode)}>📋 Скопировать код</button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Tab: Progress ────────────────────────────────

function ProgressTab({ classroom }: { classroom: Classroom }) {
  return (
    <>
      <section style={{ marginBottom: 24 }}>
        <h2 className="h2" style={{ marginBottom: 8 }}>Прогресс · {classroom.name}</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          Heatmap: каждая строка — ученик, столбец — модуль M1..M8. Ячейка показывает долю пройденных уроков модуля.
        </p>
      </section>

      <div className="kb-card" style={{ padding: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(21,20,27,.08)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Ученик</th>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <th key={n} style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'var(--f-display)' }}>M{n}</th>
              ))}
              <th style={{ padding: '8px 12px', textAlign: 'center' }}>Стрик</th>
              <th style={{ padding: '8px 12px' }}>Был</th>
            </tr>
          </thead>
          <tbody>
            {classroom.students.map((s) => {
              const isAlarm = s.lastActive.includes('7 дн') || s.lastActive.includes('5') || s.lastActive.includes('6')
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {isAlarm && <span title="Не был > 5 дней" style={{ marginRight: 6 }}>⚠</span>}
                    {s.name}
                  </td>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const moduleStart = (n - 1) * 6
                    const doneInMod = Math.max(0, Math.min(6, s.progress - moduleStart))
                    const pct = doneInMod / 6
                    const intensity = pct > 0 ? 0.15 + pct * 0.75 : 0
                    const bg = pct === 1 ? 'var(--mint-deep, #3DB07A)' : pct > 0 ? `rgba(107, 92, 231, ${intensity})` : 'rgba(21,20,27,.05)'
                    const color = pct >= 0.7 ? '#fff' : 'var(--ink)'
                    return (
                      <td key={n} style={{ padding: 0, textAlign: 'center' }}>
                        <div
                          style={{
                            margin: '2px auto',
                            width: 34,
                            height: 26,
                            background: bg,
                            color,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'var(--f-mono)',
                          }}
                          title={`M${n}: ${doneInMod}/6 уроков`}
                        >
                          {doneInMod > 0 ? `${doneInMod}/6` : ''}
                        </div>
                      </td>
                    )
                  })}
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--f-mono)' }}>
                    {s.streak > 0 ? `🔥${s.streak}` : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: isAlarm ? '#c33' : 'var(--ink-soft)', fontSize: 12 }}>
                    {s.lastActive}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <section style={{ marginTop: 24 }}>
        <h3 className="h3" style={{ marginBottom: 10 }}>Тревоги класса</h3>
        <div className="kb-card" style={{ padding: 18 }}>
          {classroom.students.filter((s) => s.lastActive.includes('7 дн') || s.lastActive.includes('5') || s.lastActive.includes('6')).length === 0 ? (
            <p style={{ color: 'var(--mint-deep, #3DB07A)', fontWeight: 600, margin: 0 }}>
              ✓ В классе всё спокойно — все ученики занимались за последние 5 дней.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {classroom.students
                .filter((s) => s.lastActive.includes('7 дн') || s.lastActive.includes('5') || s.lastActive.includes('6'))
                .map((s) => (
                  <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>⚠</span>
                    <strong style={{ flex: 1 }}>{s.name}</strong>
                    <span style={{ color: '#c33', fontSize: 13 }}>{s.lastActive}</span>
                    <button className="kb-btn kb-btn--sm">✉ Написать родителю</button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

// ─── Tab: Assignments ─────────────────────────────

function AssignmentsTab({ classroom }: { classroom: Classroom }) {
  return (
    <>
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="h2">Задания · {classroom.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
            Назначай урок или капстон всему классу с дедлайном. Ученики получают уведомление.
          </p>
        </div>
        <button className="kb-btn kb-btn--secondary">➕ Назначить задание</button>
      </section>

      <div className="kb-grid-2">
        {[
          { n: 1, title: 'Пройти урок M2 L3 — Переменные', due: 'через 3 дня', done: 8, total: classroom.students.length },
          { n: 2, title: 'Защита капстона M1 — Прыжковая полоса', due: 'через 5 дней', done: 3, total: classroom.students.length },
          { n: 3, title: 'Квиз урока M1 L4 — идеальный балл', due: 'без дедлайна', done: 14, total: classroom.students.length },
        ].map((a) => (
          <div key={a.n} className="kb-card">
            <div className="eyebrow">Задание · {a.due}</div>
            <h3 className="h3" style={{ marginTop: 6, fontSize: 15 }}>{a.title}</h3>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="kb-progress" style={{ flex: 1 }}>
                <div className="kb-progress-bar" style={{ width: `${(a.done / a.total) * 100}%`, background: 'var(--violet)' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--f-mono)' }}>
                {a.done}/{a.total}
              </span>
            </div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 32 }}>
        <div className="kb-card" style={{ padding: 20, background: 'var(--violet-soft)', color: 'var(--violet-ink)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <NikselIcon kind="book" size={56} />
            <div>
              <strong style={{ fontSize: 15 }}>LTI 1.3 + SCORM в роадмапе P3</strong>
              <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55 }}>
                Когда подключим LTI — задания будут автоматически синкаться со Сферум / Moodle / Canvas.
                Оценки уходят в журнал школы. Сертификаты экспортируются в SCORM 1.2 и 2004.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
