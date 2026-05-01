import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import NikselIcon from '../design/mascot/NikselIcon'
import { pluralize } from '../lib/plural'
import { useToast } from '../hooks/useToast'
import { loadSession } from '../lib/auth'
import { fetchClassrooms, fetchStudents, type ClassroomDto, type StudentDto } from '../api/classrooms'
import { fetchClassroomProgress, unlockBatch, type ClassroomProgressStudent } from '../api/lessonAccess'
import { fetchMySlots, createSlot, updateSlotStatus, type SlotDto } from '../api/schedule'
import { fetchMyReports, createReport, type ReportDto, type CreateReportPayload } from '../api/lessonReports'

const ROLE_KEY = 'ek_role'

const TEACHER_ROLES = new Set([
  'teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin',
])

function isTeacherRole(): boolean {
  if (typeof window === 'undefined') return false
  const urlRole = new URLSearchParams(window.location.search).get('role')
  if (urlRole === 'teacher') {
    localStorage.setItem(ROLE_KEY, 'teacher')
    return true
  }
  // Accept JWT session role as well as legacy ek_role key
  const session = loadSession()
  if (session?.role && TEACHER_ROLES.has(session.role)) {
    localStorage.setItem(ROLE_KEY, 'teacher')
    return true
  }
  return localStorage.getItem(ROLE_KEY) === 'teacher'
}

type Tab = 'classes' | 'progress' | 'assignments' | 'unlock' | 'schedule' | 'reports' | 'methodologies' | 'students'

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
  const { show: showToast } = useToast()

  // Real classrooms from API (falls back to MOCK_CLASSES if API unavailable)
  const [apiClasses, setApiClasses] = useState<ClassroomDto[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    if (!isTeacher) return
    fetchClassrooms()
      .then((data) => setApiClasses(data))
      .catch(() => setApiClasses(null))
      .finally(() => setApiLoading(false))
  }, [isTeacher])

  // Use real classrooms if available, otherwise fall back to mock
  const classes: Array<{ id: string; name: string; inviteCode: string; studentCount: number }> =
    apiClasses?.map((c) => ({
      id: c.id,
      name: c.name,
      inviteCode: c.inviteCode ?? '------',
      studentCount: c.studentCount,
    })) ?? MOCK_CLASSES.map((c) => ({ id: c.id, name: c.name, inviteCode: c.inviteCode, studentCount: c.students.length }))

  const [activeClassId, setActiveClassId] = useState<string>('')
  const activeClassIdResolved = activeClassId || (classes[0]?.id ?? '')

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
          <span className="eyebrow">Учительская консоль</span>
          <span className="kb-cover-meta-row">
            <span>{pluralize(classes.length, 'class')}</span>
            <span className="dot" />
            <span>{pluralize(classes.reduce((s, c) => s + c.studentCount, 0), 'student')}</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Кабинет<br/><span className="kb-cover-accent">учителя</span>
        </h1>
        <p className="kb-cover-sub">
          Следите за прогрессом класса, открывайте уроки и собирайте heatmap по модулям.
        </p>
        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="wave" size={240} />
        </div>
      </section>

      {/* Tabs */}
      <div className="kb-tabs" role="tablist" style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid rgba(21,20,27,.08)', flexWrap: 'wrap' }}>
        {([
          { k: 'classes' as Tab, label: '🏫 Классы' },
          { k: 'students' as Tab, label: '👨‍🎓 Ученики' },
          { k: 'schedule' as Tab, label: '🗓 Расписание' },
          { k: 'reports' as Tab, label: '📋 Отчёты' },
          { k: 'methodologies' as Tab, label: '📚 Методички' },
          { k: 'progress' as Tab, label: '📊 Прогресс' },
          { k: 'unlock' as Tab, label: '🔓 Открыть уроки' },
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
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveClassId(c.id)}
              className={activeClassIdResolved === c.id ? 'kb-btn kb-btn--secondary' : 'kb-btn'}
              style={{ fontSize: 13 }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {tab === 'classes' && <ClassesTab classes={classes} loading={apiLoading} />}
      {tab === 'students' && <StudentsTab classroomId={activeClassIdResolved} classroomName={classes.find((c) => c.id === activeClassIdResolved)?.name ?? ''} />}
      {tab === 'schedule' && <ScheduleTab classrooms={classes} showToast={showToast} />}
      {tab === 'reports' && <ReportsTab classrooms={classes} showToast={showToast} />}
      {tab === 'methodologies' && <MethodologiesTab />}
      {tab === 'progress' && <ProgressTab classroomId={activeClassIdResolved} classroomName={classes.find((c) => c.id === activeClassIdResolved)?.name ?? ''} />}
      {tab === 'unlock' && (
        <UnlockTab
          classroomId={activeClassIdResolved}
          classroomName={classes.find((c) => c.id === activeClassIdResolved)?.name ?? ''}
          showToast={showToast}
        />
      )}
      {tab === 'assignments' && (
        <AssignmentsTab
          classroomName={classes.find((c) => c.id === activeClassIdResolved)?.name ?? ''}
          studentCount={classes.find((c) => c.id === activeClassIdResolved)?.studentCount ?? 0}
        />
      )}
    </PlatformShell>
  )
}

// ─── Tab: Classes ─────────────────────────────────

function ClassesTab({ classes, loading }: {
  classes: Array<{ id: string; name: string; inviteCode: string; studentCount: number }>
  loading: boolean
}) {
  const { show: showToast } = useToast()
  return (
    <>
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 className="h2">Мои классы</h2>
      </section>

      {loading && (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      )}

      <div className="kb-grid-2">
        {classes.map((c) => (
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
            <div style={{ padding: '14px 0', borderTop: '1px solid rgba(21,20,27,.08)', borderBottom: '1px solid rgba(21,20,27,.08)' }}>
              <div className="eyebrow">Учеников</div>
              <strong style={{ fontSize: 20, color: 'var(--violet)' }}>{c.studentCount}</strong>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="kb-btn kb-btn--sm" onClick={() => {
                void navigator.clipboard?.writeText(c.inviteCode)
                showToast(`✓ Код ${c.inviteCode} скопирован`, 'success')
              }}>📋 Скопировать код</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Tab: Unlock Lessons ──────────────────────────

function UnlockTab({ classroomId, classroomName, showToast }: {
  classroomId: string
  classroomName: string
  showToast: (msg: string, kind: 'success' | 'error' | 'info') => void
}) {
  const [students, setStudents] = useState<StudentDto[]>([])
  const [progress, setProgress] = useState<ClassroomProgressStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(1)
  const [unlocking, setUnlocking] = useState(false)

  const LESSON_COUNT = 48
  const MODULE_SIZE = 6

  const reload = () => {
    if (!classroomId) return
    setLoading(true)
    Promise.all([
      fetchStudents(classroomId).catch(() => [] as StudentDto[]),
      fetchClassroomProgress(classroomId).catch(() => [] as ClassroomProgressStudent[]),
    ]).then(([s, p]) => {
      setStudents(s)
      setProgress(p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { reload() }, [classroomId])

  const progressByStudent = new Map(progress.map((p) => [p.studentId, p.lessons]))

  const handleUnlockAll = async () => {
    if (!classroomId) return
    setUnlocking(true)
    try {
      const result = await unlockBatch({ classroomId, lessonN: selectedLesson })
      showToast(`✓ Урок ${selectedLesson} открыт: ${result.unlocked} учеников (${result.skipped} уже было)`, 'success')
      reload()
    } catch (e) {
      showToast('Ошибка: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setUnlocking(false)
    }
  }

  if (!classroomId) {
    return <div className="kb-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>Выбери класс выше.</div>
  }

  return (
    <>
      <section style={{ marginBottom: 20 }}>
        <h2 className="h2" style={{ marginBottom: 8 }}>Открыть урок · {classroomName || classroomId.slice(0, 8)}</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 16px' }}>
          Выбери урок и открой его всему классу. Ученики увидят его в своём журнале после обновления страницы.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>
              Урок (1–{LESSON_COUNT})
            </label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border, #e5e2f0)', fontSize: 14, fontFamily: 'inherit', background: '#fff' }}
            >
              {Array.from({ length: LESSON_COUNT }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Урок {n} · М{Math.ceil(n / MODULE_SIZE)} L{((n - 1) % MODULE_SIZE) + 1}
                </option>
              ))}
            </select>
          </div>
          <button
            className="kb-btn kb-btn--secondary"
            onClick={() => void handleUnlockAll()}
            disabled={unlocking}
          >
            {unlocking ? 'Открываю…' : `🔓 Открыть урок ${selectedLesson} всем`}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      ) : (
        <div className="kb-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(21,20,27,.08)', background: 'var(--bg-soft, #f9f8ff)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Ученик</th>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((m) => (
                  <th key={m} style={{ padding: '10px 6px', textAlign: 'center', fontFamily: 'var(--f-display)' }}>М{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const lessonMap = progressByStudent.get(student.id) ?? {}
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {student.login}
                    </td>
                    {Array.from({ length: 8 }, (_, mi) => {
                      const moduleStart = mi * MODULE_SIZE + 1
                      const moduleLessons = Array.from({ length: MODULE_SIZE }, (_, li) => moduleStart + li)
                      const unlocked = moduleLessons.filter((n) => lessonMap[n]?.unlocked).length
                      const completed = moduleLessons.filter((n) => lessonMap[n]?.completed).length
                      const pct = unlocked / MODULE_SIZE
                      const bg = completed === MODULE_SIZE
                        ? 'var(--mint-deep, #3DB07A)'
                        : pct > 0 ? `rgba(107,92,231,${0.15 + pct * 0.7})` : 'rgba(21,20,27,.05)'
                      const color = pct >= 0.6 || completed === MODULE_SIZE ? '#fff' : 'var(--ink)'
                      return (
                        <td key={mi} style={{ padding: 2, textAlign: 'center' }}>
                          <div
                            title={`М${mi + 1}: ${unlocked} откр. / ${completed} пройд.`}
                            style={{
                              width: 36, height: 26, margin: '0 auto', borderRadius: 6,
                              background: bg, color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-mono)',
                            }}
                          >
                            {unlocked > 0 ? `${completed}/${unlocked}` : ''}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                    В классе нет учеников
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Tab: Progress ────────────────────────────────

function ProgressTab({ classroomId, classroomName }: { classroomId: string; classroomName: string }) {
  const [students, setStudents] = useState<StudentDto[]>([])
  const [progress, setProgress] = useState<ClassroomProgressStudent[]>([])
  const [loading, setLoading] = useState(false)

  const MODULE_SIZE = 6

  useEffect(() => {
    if (!classroomId) return
    setLoading(true)
    Promise.all([
      fetchStudents(classroomId).catch(() => [] as StudentDto[]),
      fetchClassroomProgress(classroomId).catch(() => [] as ClassroomProgressStudent[]),
    ]).then(([s, p]) => { setStudents(s); setProgress(p) })
      .finally(() => setLoading(false))
  }, [classroomId])

  const progressByStudent = new Map(progress.map((p) => [p.studentId, p.lessons]))

  const formatLastSeen = (dt: string | null): { label: string; alarm: boolean } => {
    if (!dt) return { label: 'никогда', alarm: true }
    const days = Math.floor((Date.now() - new Date(dt).getTime()) / 86400000)
    if (days === 0) return { label: 'сегодня', alarm: false }
    if (days === 1) return { label: 'вчера', alarm: false }
    return { label: `${days} дн. назад`, alarm: days >= 5 }
  }

  if (!classroomId) {
    return <div className="kb-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>Выбери класс выше.</div>
  }

  return (
    <>
      <section style={{ marginBottom: 24 }}>
        <h2 className="h2" style={{ marginBottom: 8 }}>Прогресс · {classroomName}</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
          Heatmap: каждая строка — ученик, столбец — модуль M1..M8. Дробь: пройдено/открыто уроков.
        </p>
      </section>

      {loading ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      ) : (
        <div className="kb-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(21,20,27,.08)', background: 'var(--bg-soft, #f9f8ff)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Ученик</th>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <th key={n} style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'var(--f-display)' }}>M{n}</th>
                ))}
                <th style={{ padding: '8px 12px' }}>Был</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>В классе нет учеников</td></tr>
              ) : students.map((s) => {
                const lessonMap = progressByStudent.get(s.id) ?? {}
                const { label: lastSeen, alarm } = formatLastSeen(s.lastLoginAt)
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {alarm && <span title="Не был ≥ 5 дней" style={{ marginRight: 6 }}>⚠</span>}
                      {s.login}
                    </td>
                    {Array.from({ length: 8 }, (_, mi) => {
                      const moduleStart = mi * MODULE_SIZE + 1
                      const moduleLessons = Array.from({ length: MODULE_SIZE }, (_, li) => moduleStart + li)
                      const unlocked = moduleLessons.filter((n) => lessonMap[n]?.unlocked).length
                      const completed = moduleLessons.filter((n) => lessonMap[n]?.completed).length
                      const pct = unlocked / MODULE_SIZE
                      const bg = completed === MODULE_SIZE
                        ? 'var(--mint-deep, #3DB07A)'
                        : pct > 0 ? `rgba(107,92,231,${0.15 + pct * 0.7})` : 'rgba(21,20,27,.05)'
                      const color = pct >= 0.6 || completed === MODULE_SIZE ? '#fff' : 'var(--ink)'
                      return (
                        <td key={mi} style={{ padding: 2, textAlign: 'center' }}>
                          <div
                            title={`M${mi + 1}: ${completed}✓ / ${unlocked} откр.`}
                            style={{ width: 36, height: 26, margin: '0 auto', borderRadius: 6, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-mono)' }}
                          >
                            {unlocked > 0 ? `${completed}/${unlocked}` : ''}
                          </div>
                        </td>
                      )
                    })}
                    <td style={{ padding: '8px 12px', color: alarm ? '#c33' : 'var(--ink-soft)', fontSize: 12 }}>
                      {lastSeen}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && students.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3 className="h3" style={{ marginBottom: 10 }}>Тревоги класса</h3>
          <div className="kb-card" style={{ padding: 18 }}>
            {students.filter((s) => formatLastSeen(s.lastLoginAt).alarm).length === 0 ? (
              <p style={{ color: 'var(--mint-deep, #3DB07A)', fontWeight: 600, margin: 0 }}>
                ✓ В классе всё спокойно — все ученики входили за последние 5 дней.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {students.filter((s) => formatLastSeen(s.lastLoginAt).alarm).map((s) => {
                  const { label } = formatLastSeen(s.lastLoginAt)
                  return (
                    <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>⚠</span>
                      <strong style={{ flex: 1 }}>{s.login}</strong>
                      <span style={{ color: '#c33', fontSize: 13 }}>{label}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  )
}

// ─── Tab: Assignments ─────────────────────────────

function AssignmentsTab({ classroomName, studentCount }: { classroomName: string; studentCount: number }) {
  return (
    <>
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 className="h2">Задания · {classroomName}</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '4px 0 0' }}>
            Назначай урок или капстон всему классу с дедлайном. Ученики получают уведомление.
          </p>
        </div>
        <button className="kb-btn kb-btn--secondary">➕ Назначить задание</button>
      </section>

      <div className="kb-grid-2">
        {[
          { n: 1, title: 'Пройти урок M2 L3 — Переменные', due: 'через 3 дня', done: 8, total: studentCount },
          { n: 2, title: 'Защита капстона M1 — Прыжковая полоса', due: 'через 5 дней', done: 3, total: studentCount },
          { n: 3, title: 'Квиз урока M1 L4 — идеальный балл', due: 'без дедлайна', done: 14, total: studentCount },
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

// ─── Tab: Students with contacts ──────────────────

function StudentsTab({ classroomId, classroomName }: { classroomId: string; classroomName: string }) {
  const [students, setStudents] = useState<StudentDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!classroomId) return
    setLoading(true)
    fetchStudents(classroomId)
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [classroomId])

  if (!classroomId) return <div className="kb-card" style={{ padding: 24, color: 'var(--ink-soft)' }}>Выбери класс выше.</div>

  return (
    <>
      <h2 className="h2" style={{ marginBottom: 16 }}>Ученики · {classroomName}</h2>
      {loading ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      ) : students.length === 0 ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>В классе нет учеников</div>
      ) : (
        <div className="kb-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft, #f9f8ff)', borderBottom: '2px solid var(--border, #e5e2f0)' }}>
                {['Логин', 'Роль', 'Последний вход', 'Телефон родителя', 'Email родителя', 'Трек'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                  <td style={{ padding: '8px 14px', fontWeight: 700, fontFamily: 'var(--f-mono)' }}>{s.login}</td>
                  <td style={{ padding: '8px 14px', color: 'var(--ink-soft)' }}>{s.role}</td>
                  <td style={{ padding: '8px 14px', color: 'var(--ink-soft)' }}>
                    {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    {(s as any).parentPhone
                      ? <a href={`tel:${(s as any).parentPhone}`} style={{ color: 'var(--violet)' }}>{(s as any).parentPhone}</a>
                      : <span style={{ color: 'var(--ink-soft)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    {(s as any).parentEmail
                      ? <a href={`mailto:${(s as any).parentEmail}`} style={{ color: 'var(--violet)' }}>{(s as any).parentEmail}</a>
                      : <span style={{ color: 'var(--ink-soft)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: (s as any).track === 'python' ? 'var(--sky-soft)' : (s as any).track === 'scratch' ? 'var(--orange-soft)' : 'var(--pink-soft)',
                      color: (s as any).track === 'python' ? 'var(--sky-ink)' : (s as any).track === 'scratch' ? 'var(--orange-ink)' : 'var(--pink-ink)',
                    }}>
                      {(s as any).track ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Tab: Schedule ────────────────────────────────

function ScheduleTab({ classrooms, showToast }: {
  classrooms: Array<{ id: string; name: string }>
  showToast: (msg: string, kind: 'success' | 'error' | 'info') => void
}) {
  const [slots, setSlots] = useState<SlotDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    datetime: '',
    durationMin: 60,
    type: 'regular' as SlotDto['type'],
    classroomId: '',
    zoomLink: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const reload = () => {
    setLoading(true)
    fetchMySlots()
      .then(setSlots)
      .catch(() => showToast('Ошибка загрузки расписания', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  const handleCreate = async () => {
    if (!form.datetime) { showToast('Укажи дату и время', 'error'); return }
    setSaving(true)
    try {
      await createSlot({
        datetime: new Date(form.datetime).toISOString(),
        durationMin: form.durationMin,
        type: form.type,
        classroomId: form.classroomId || undefined,
        zoomLink: form.zoomLink || undefined,
        notes: form.notes || undefined,
      })
      showToast('Слот создан', 'success')
      setShowForm(false)
      reload()
    } catch (e) {
      showToast('Ошибка: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (slotId: string) => {
    try {
      await updateSlotStatus(slotId, 'cancelled')
      showToast('Занятие отменено', 'success')
      reload()
    } catch {
      showToast('Ошибка отмены', 'error')
    }
  }

  const upcoming = slots.filter((s) => s.status === 'scheduled' && new Date(s.datetime) >= new Date())
  const past = slots.filter((s) => s.status !== 'scheduled' || new Date(s.datetime) < new Date())

  const fmtDt = (iso: string) =>
    new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const statusColor = (s: SlotDto['status']) =>
    ({ scheduled: '#3DB07A', conducted: '#6B5CE7', cancelled: '#dc2626', transferred: '#FF9454' }[s] ?? '#999')

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 className="h2">Моё расписание</h2>
        <button className="kb-btn kb-btn--secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Закрыть' : '+ Добавить слот'}
        </button>
      </div>

      {showForm && (
        <div className="kb-card" style={{ padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Новый слот</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Дата и время</label>
              <input type="datetime-local" value={form.datetime} onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Длительность (мин)</label>
              <input type="number" value={form.durationMin} onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))} style={inp} min={15} max={180} />
            </div>
            <div>
              <label style={lbl}>Тип</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} style={inp}>
                <option value="regular">Обычное</option>
                <option value="trial">Пробное</option>
                <option value="makeup">Отработка</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Класс (опционально)</label>
              <select value={form.classroomId} onChange={(e) => setForm((f) => ({ ...f, classroomId: e.target.value }))} style={inp}>
                <option value="">— не указан —</option>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Ссылка на Zoom / LiveKit</label>
            <input type="url" value={form.zoomLink} onChange={(e) => setForm((f) => ({ ...f, zoomLink: e.target.value }))} placeholder="https://…" style={inp} />
          </div>
          <div>
            <label style={lbl}>Примечание</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ ...inp, height: 60, resize: 'vertical' }} />
          </div>
          <button className="kb-btn kb-btn--secondary" onClick={() => void handleCreate()} disabled={saving}>
            {saving ? 'Сохранение…' : '✓ Создать слот'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 className="h3" style={{ marginBottom: 12 }}>Предстоящие</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map((s) => (
                  <div key={s.id} className="kb-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{fmtDt(s.datetime)}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {s.durationMin} мин · {s.type === 'trial' ? 'Пробное' : s.type === 'makeup' ? 'Отработка' : 'Обычное'}
                        {s.classroomId && ' · Класс привязан'}
                      </div>
                      {s.notes && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{s.notes}</div>}
                    </div>
                    {s.zoomLink && (
                      <a href={s.zoomLink} target="_blank" rel="noreferrer" className="kb-btn" style={{ fontSize: 13 }}>
                        Войти на занятие →
                      </a>
                    )}
                    <button
                      className="kb-btn"
                      style={{ fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                      onClick={() => void handleCancel(s.id)}
                    >
                      Отменить
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h3 className="h3" style={{ marginBottom: 12 }}>История</h3>
              <div className="kb-card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-soft, #f9f8ff)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left' }}>Дата</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left' }}>Тип</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left' }}>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {past.slice(0, 20).map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                        <td style={{ padding: '8px 14px' }}>{fmtDt(s.datetime)}</td>
                        <td style={{ padding: '8px 14px', color: 'var(--ink-soft)' }}>
                          {s.type === 'trial' ? 'Пробное' : s.type === 'makeup' ? 'Отработка' : 'Обычное'}
                        </td>
                        <td style={{ padding: '8px 14px' }}>
                          <span style={{ color: statusColor(s.status), fontWeight: 700 }}>
                            {s.status === 'scheduled' ? 'Запланировано' : s.status === 'conducted' ? 'Проведено' : s.status === 'cancelled' ? 'Отменено' : 'Перенесено'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
              Слотов пока нет. Нажми «+ Добавить слот», чтобы создать первый.
            </div>
          )}
        </>
      )}
    </>
  )
}

// ─── Tab: Lesson Reports ─────────────────────────

function ReportsTab({ classrooms, showToast }: {
  classrooms: Array<{ id: string; name: string; studentCount: number }>
  showToast: (msg: string, kind: 'success' | 'error' | 'info') => void
}) {
  const [reports, setReports] = useState<ReportDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [students, setStudents] = useState<StudentDto[]>([])
  const [form, setForm] = useState<CreateReportPayload>({
    studentId: '',
    conductedAt: new Date().toISOString().slice(0, 16),
    status: 'conducted',
    grade: undefined,
    notes: '',
    vkRecordUrl: '',
    isSubstitute: false,
    lessonN: undefined,
  })
  const [saving, setSaving] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')

  const reload = () => {
    setLoading(true)
    fetchMyReports()
      .then(setReports)
      .catch(() => showToast('Ошибка загрузки отчётов', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  useEffect(() => {
    if (!selectedClassId) return
    fetchStudents(selectedClassId).then(setStudents).catch(() => null)
  }, [selectedClassId])

  const handleSubmit = async () => {
    if (!form.studentId) { showToast('Выбери ученика', 'error'); return }
    setSaving(true)
    try {
      await createReport({
        ...form,
        conductedAt: new Date(form.conductedAt).toISOString(),
        grade: form.grade ? Number(form.grade) : undefined,
        lessonN: form.lessonN ? Number(form.lessonN) : undefined,
      })
      showToast('Отчёт сохранён', 'success')
      setShowForm(false)
      reload()
    } catch (e) {
      showToast('Ошибка сохранения: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setSaving(false)
    }
  }

  const statusLabel = (s: ReportDto['status']) =>
    ({ conducted: 'Проведено', cancelled: 'Отменено', transferred: 'Перенесено' }[s])
  const statusColor = (s: ReportDto['status']) =>
    ({ conducted: '#3DB07A', cancelled: '#dc2626', transferred: '#FF9454' }[s])

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 className="h2">Отчёты по занятиям</h2>
        <button className="kb-btn kb-btn--secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Закрыть' : '+ Заполнить отчёт'}
        </button>
      </div>

      {showForm && (
        <div className="kb-card" style={{ padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>Отчёт о занятии</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Класс</label>
              <select value={selectedClassId} onChange={(e) => { setSelectedClassId(e.target.value); setForm((f) => ({ ...f, studentId: '' })) }} style={inp}>
                <option value="">— выбери —</option>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Ученик</label>
              <select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))} style={inp} disabled={!selectedClassId}>
                <option value="">— выбери —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.login}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Дата занятия</label>
              <input type="datetime-local" value={form.conductedAt} onChange={(e) => setForm((f) => ({ ...f, conductedAt: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Статус занятия</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} style={inp}>
                <option value="conducted">✅ Проведено</option>
                <option value="cancelled">❌ Отменено</option>
                <option value="transferred">🔄 Перенесено</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Оценка (1–5)</label>
              <input type="number" value={form.grade ?? ''} onChange={(e) => setForm((f) => ({ ...f, grade: Number(e.target.value) || undefined }))} style={inp} min={1} max={5} placeholder="—" />
            </div>
            <div>
              <label style={lbl}>Номер урока</label>
              <input type="number" value={form.lessonN ?? ''} onChange={(e) => setForm((f) => ({ ...f, lessonN: Number(e.target.value) || undefined }))} style={inp} min={1} max={200} placeholder="—" />
            </div>
          </div>

          <div>
            <label style={lbl}>Ссылка на запись (VK Video)</label>
            <input type="url" value={form.vkRecordUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, vkRecordUrl: e.target.value }))} placeholder="https://vk.com/video…" style={inp} />
          </div>
          <div>
            <label style={lbl}>Комментарий</label>
            <textarea value={form.notes ?? ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Как прошло занятие, что отработали…" rows={3} style={{ ...inp, resize: 'vertical' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.isSubstitute} onChange={(e) => setForm((f) => ({ ...f, isSubstitute: e.target.checked }))} />
            Я провёл занятие как замена
          </label>

          <button className="kb-btn kb-btn--secondary" onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? 'Сохранение…' : '✓ Сохранить отчёт'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
      ) : reports.length === 0 ? (
        <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
          Отчётов пока нет. После занятия нажми «+ Заполнить отчёт».
        </div>
      ) : (
        <div className="kb-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft, #f9f8ff)', borderBottom: '2px solid var(--border)' }}>
                {['Дата', 'Статус', 'Оценка', 'Урок', 'Запись', 'Комментарий'].map((h) => (
                  <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(21,20,27,.04)' }}>
                  <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                    {new Date(r.conductedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {r.isSubstitute && <span title="Замена" style={{ marginLeft: 6, fontSize: 11, color: 'var(--orange-deep)' }}>замена</span>}
                  </td>
                  <td style={{ padding: '8px 14px' }}>
                    <span style={{ color: statusColor(r.status), fontWeight: 700 }}>{statusLabel(r.status)}</span>
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 800 }}>{r.grade ?? '—'}</td>
                  <td style={{ padding: '8px 14px' }}>{r.lessonN ?? '—'}</td>
                  <td style={{ padding: '8px 14px' }}>
                    {r.vkRecordUrl
                      ? <a href={r.vkRecordUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', fontSize: 12 }}>Смотреть</a>
                      : <span style={{ color: 'var(--ink-soft)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 14px', color: 'var(--ink-soft)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ─── Tab: Methodologies ───────────────────────────

const METHODS_PYTHON = Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  title: `Урок ${i + 1} · Python`,
  url: `/courses/python-ai/lesson_${String(i + 1).padStart(2, '0')}.html`,
}))

const METHODS_VIBE_1 = Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  title: `Урок ${i + 1} · Vibe-coding Ступень 1`,
  url: `/courses/vibe-coding-step1/lesson_${String(i + 1).padStart(2, '0')}.html`,
}))

const METHODS_VIBE_2 = Array.from({ length: 12 }, (_, i) => ({
  n: i + 1,
  title: `Урок ${i + 1} · Vibe-coding Ступень 2`,
  url: `/courses/vibe-coding-step2/lesson_${String(i + 1).padStart(2, '0')}.html`,
}))

function MethodologiesTab() {
  const [filter, setFilter] = useState<'python' | 'vibe1' | 'vibe2' | 'scratch'>('python')

  const lessons = filter === 'python' ? METHODS_PYTHON : filter === 'vibe1' ? METHODS_VIBE_1 : METHODS_VIBE_2
  const hasScratch = filter === 'scratch'

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 className="h2">Методички</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {([
            ['python', '🐍 Python'],
            ['vibe1', '🌐 Vibe-1'],
            ['vibe2', '🌐 Vibe-2'],
            ['scratch', '🎮 Scratch'],
          ] as const).map(([k, l]) => (
            <button key={k} className={filter === k ? 'kb-btn kb-btn--secondary' : 'kb-btn'} style={{ fontSize: 13 }} onClick={() => setFilter(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {hasScratch ? (
        <div className="kb-card" style={{ padding: 24 }}>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 20, fontSize: 14 }}>
            Игры Scratch доступны на платформе и в редакторе. Для занятий рекомендуем открывать в браузере напрямую.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/scratch/game1.sb3" download className="kb-btn">⬇ Скачать Игру 1</a>
            <a href="/scratch/game2.sb3" download className="kb-btn">⬇ Скачать Игру 2</a>
            <a href="https://scratch.mit.edu" target="_blank" rel="noreferrer" className="kb-btn kb-btn--secondary">Открыть Scratch →</a>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {lessons.map((l) => (
            <a
              key={l.n}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block', padding: '16px 20px', borderRadius: 14,
                background: 'var(--paper-2)', border: '1.5px solid var(--paper-3)',
                textDecoration: 'none', color: 'var(--ink)', transition: 'box-shadow .15s',
              }}
            >
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6 }}>
                УРОК {String(l.n).padStart(2, '0')}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: 'var(--violet)', marginTop: 8, fontWeight: 600 }}>Открыть методичку →</div>
            </a>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Style helpers ────────────────────────────────
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }
const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border, #e5e2f0)',
  fontSize: 14, fontFamily: 'inherit', background: '#fff', color: '#15141b', boxSizing: 'border-box',
}
