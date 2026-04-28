/**
 * Admin / Curator panel.
 * Wrapped in PlatformShell activeKey="admin".
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { getClassrooms, createClassroom, deleteClassroom, CLASSROOMS_KEY, type Classroom, type Student } from '../lib/classRoster'
import { useToast } from '../hooks/useToast'

interface ConfirmState {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

export default function Admin() {
  const navigate = useNavigate()
  const { toast, show } = useToast()
  const confirmDialogRef = useRef<HTMLDivElement>(null)

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => getClassrooms())
  const [showNewClassForm, setShowNewClassForm] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newTeacherId, setNewTeacherId] = useState('')

  // Transfer student state
  const [fromClassId, setFromClassId] = useState('')
  const [toClassId, setToClassId] = useState('')
  const [selectedLogin, setSelectedLogin] = useState('')

  // Assign teacher state
  const [assignClassId, setAssignClassId] = useState('')
  const [assignTeacherId, setAssignTeacherId] = useState('')

  // Branded confirm dialog (replaces window.confirm)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  useEffect(() => { if (confirmState) confirmDialogRef.current?.focus() }, [confirmState])

  const refresh = () => setClassrooms(getClassrooms())

  // ─── Handlers ────────────────────────────────────────────────────

  const handleDeleteClass = (id: string, name: string) => {
    setConfirmState({
      title: 'Удалить класс?',
      message: `Класс «${name}» будет удалён. Это действие необратимо — учеников придётся переводить вручную.`,
      confirmLabel: 'Удалить',
      onConfirm: () => {
        deleteClassroom(id)
        refresh()
        show(`Класс «${name}» удалён`, 'success')
      },
    })
  }

  const handleCreateClass = () => {
    if (!newClassName.trim()) { show('Введи название класса', 'error'); return }
    createClassroom(newClassName.trim(), newTeacherId.trim() || 'teacher-1', [])
    setNewClassName('')
    setNewTeacherId('')
    setShowNewClassForm(false)
    refresh()
    show('Класс создан', 'success')
  }

  const fromClassStudents: Student[] =
    classrooms.find((c) => c.id === fromClassId)?.students ?? []

  const handleTransfer = () => {
    if (!fromClassId || !toClassId || !selectedLogin) {
      show('Выбери классы и ученика', 'error')
      return
    }
    if (fromClassId === toClassId) { show('Классы должны быть разными', 'error'); return }

    const raw = localStorage.getItem(CLASSROOMS_KEY)
    const list: Classroom[] = raw ? (JSON.parse(raw) as Classroom[]) : []

    const from = list.find((c) => c.id === fromClassId)
    const to = list.find((c) => c.id === toClassId)
    if (!from || !to) { show('Класс не найден', 'error'); return }

    const studentIdx = from.students.findIndex((s) => s.login === selectedLogin)
    if (studentIdx === -1) { show('Ученик не найден', 'error'); return }

    const student = from.students.splice(studentIdx, 1)[0]!
    to.students.push(student)

    try { localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(list)) } catch { /* quota */ }
    refresh()
    setSelectedLogin('')
    show(`${student.firstName} ${student.lastName} переведён(а)`, 'success')
  }

  const handleAssignTeacher = () => {
    if (!assignClassId || !assignTeacherId.trim()) {
      show('Выбери класс и введи ID учителя', 'error')
      return
    }
    const raw = localStorage.getItem(CLASSROOMS_KEY)
    const list: Classroom[] = raw ? (JSON.parse(raw) as Classroom[]) : []
    const cls = list.find((c) => c.id === assignClassId)
    if (!cls) { show('Класс не найден', 'error'); return }
    cls.teacherId = assignTeacherId.trim()
    try { localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(list)) } catch { /* quota */ }
    refresh()
    show(`Учитель назначен в класс «${cls.name}»`, 'success')
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <PlatformShell activeKey="admin">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 9999,
            background: toast.kind === 'error' ? '#dc2626' : toast.kind === 'success' ? '#059669' : '#6b5ce7',
            color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Branded Confirm dialog (replaces window.confirm) */}
      {confirmState && (
        <div
          ref={confirmDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          tabIndex={-1}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(21,20,27,.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn .15s ease',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmState(null) }}
        >
          <div
            className="kb-card"
            style={{
              maxWidth: 420,
              width: '100%',
              padding: 24,
              background: 'var(--paper)',
              boxShadow: '0 4px 0 0 rgba(21,20,27,.22), 0 20px 60px rgba(21,20,27,.25)',
              border: '2px solid var(--ink)',
              borderRadius: 18,
            }}
          >
            <h2 id="confirm-title" style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: 'var(--f-display)', color: 'var(--ink)' }}>
              {confirmState.title}
            </h2>
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="kb-btn"
                onClick={() => setConfirmState(null)}
                autoFocus
              >
                Отмена
              </button>
              <button
                className="kb-btn"
                style={{ background: 'var(--pink-deep, #E8517B)', color: '#fff', borderColor: 'var(--pink-deep, #E8517B)', fontWeight: 900 }}
                onClick={() => {
                  const fn = confirmState.onConfirm
                  setConfirmState(null)
                  fn()
                }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover */}
      <div className="kb-cover kb-cover--violet">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }} aria-hidden>👑</span>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Куратор · Администрирование</div>
            <h1 className="h1" style={{ margin: 0, color: '#fff' }}>Управление платформой</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Section: Классы ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Классы</h2>
            <button className="kb-btn" onClick={() => setShowNewClassForm((v) => !v)}>
              {showNewClassForm ? '✕ Отмена' : '+ Новый класс'}
            </button>
          </div>

          {showNewClassForm && (
            <div className="kb-card" style={{ marginBottom: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                placeholder="Название класса (напр. 5А)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                style={inputStyle}
                aria-label="Название класса"
              />
              <input
                type="text"
                placeholder="ID учителя (email или логин)"
                value={newTeacherId}
                onChange={(e) => setNewTeacherId(e.target.value)}
                style={inputStyle}
                aria-label="ID учителя"
              />
              <button className="kb-btn" onClick={handleCreateClass}>Создать класс</button>
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft, #6b7280)' }}>
              Классов пока нет. Создай первый.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-soft, #f5f3ff)', textAlign: 'left' }}>
                    {['Название', 'Учеников', 'Дата создания', 'Учитель', 'Действия'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classrooms.map((cls, i) => (
                    <tr
                      key={cls.id}
                      style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg-soft, #f9f8ff)', borderBottom: '1px solid var(--border, #e5e2f0)' }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{cls.name}</td>
                      <td style={{ padding: '10px 14px' }}>{cls.students.length}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--ink-soft, #6b7280)' }}>
                        {new Date(cls.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                        {cls.teacherId || 'teacher-1'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          className="kb-btn"
                          style={{ background: '#dc2626', color: '#fff', fontSize: 12, padding: '4px 12px' }}
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Section: Перевод ученика ── */}
        <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Перевод ученика</h2>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>Из класса</label>
              <select
                value={fromClassId}
                onChange={(e) => { setFromClassId(e.target.value); setSelectedLogin('') }}
                style={selectStyle}
                aria-label="Из класса"
              >
                <option value="">— выбери —</option>
                {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>В класс</label>
              <select
                value={toClassId}
                onChange={(e) => setToClassId(e.target.value)}
                style={selectStyle}
                aria-label="В класс"
              >
                <option value="">— выбери —</option>
                {classrooms.filter((c) => c.id !== fromClassId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {fromClassStudents.length > 0 && (
            <div>
              <label style={labelStyle}>Ученик</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border, #e5e2f0)', borderRadius: 10, padding: 8 }}>
                {fromClassStudents.map((s) => (
                  <label key={s.login} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 6px', borderRadius: 6, background: selectedLogin === s.login ? '#f3f0ff' : 'transparent' }}>
                    <input
                      type="radio"
                      name="transfer-student"
                      value={s.login}
                      checked={selectedLogin === s.login}
                      onChange={() => setSelectedLogin(s.login)}
                    />
                    <span>{s.lastName} {s.firstName}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft, #6b7280)', fontFamily: 'monospace' }}>{s.login}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="kb-btn" onClick={handleTransfer} disabled={!fromClassId || !toClassId || !selectedLogin}>
            Перевести ученика →
          </button>

          <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-soft, #6b7280)' }}>
            В продакшне операция синхронизируется с бэкендом.
          </p>
        </section>

        {/* ── Section: Назначить учителя ── */}
        <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Назначить учителя</h2>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>Класс</label>
              <select
                value={assignClassId}
                onChange={(e) => setAssignClassId(e.target.value)}
                style={selectStyle}
                aria-label="Выбрать класс для назначения"
              >
                <option value="">— выбери —</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (сейчас: {c.teacherId || 'не назначен'})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>ID учителя (email / логин)</label>
              <input
                type="text"
                placeholder="teacher@school.ru"
                value={assignTeacherId}
                onChange={(e) => setAssignTeacherId(e.target.value)}
                style={inputStyle}
                aria-label="ID учителя"
              />
            </div>
            <button className="kb-btn" onClick={handleAssignTeacher}>Назначить</button>
          </div>

          {/* Current assignments */}
          {classrooms.length > 0 && (
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 4 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--ink-soft, #6b7280)', borderBottom: '1px solid var(--border, #e5e2f0)' }}>
                  <th style={{ padding: '6px 8px' }}>Класс</th>
                  <th style={{ padding: '6px 8px' }}>Учитель</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border, #e5e2f0)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: 12, color: c.teacherId ? '#15141b' : 'var(--ink-soft, #6b7280)' }}>
                      {c.teacherId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Section: Сообщения ── */}
        <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Сообщения</h2>
          <p style={{ margin: 0, color: 'var(--ink-soft, #6b7280)', fontSize: 14 }}>
            Напиши участникам напрямую через чат.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="kb-btn" onClick={() => navigate('/chat')}>
              💬 Написать учителю
            </button>
            <button className="kb-btn kb-btn--secondary" onClick={() => navigate('/chat')}>
              👨‍👩‍👦 Написать родителю
            </button>
          </div>
        </section>

        {/* ── Section: Защита контента ── */}
        <section className="kb-card" style={{ padding: 24, background: 'var(--bg-soft, #f9f8ff)' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Защита контента</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONTENT_PROTECTION_ITEMS.map((item) => (
              <li key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                <span style={{ color: 'var(--violet, #6b5ce7)', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>•</span>
                <span>
                  <strong>{item.title}</strong>
                  {' — '}
                  <span style={{ color: 'var(--ink-soft, #374151)' }}>{item.desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </PlatformShell>
  )
}

// ─── Data ────────────────────────────────────────────────────────────

const CONTENT_PROTECTION_ITEMS = [
  {
    title: 'Подписанные временные URL (Signed URLs)',
    desc: 'ссылки на видео/PDF истекают через N минут',
  },
  {
    title: 'Canvas watermark',
    desc: 'имя ученика наносится поверх PDF/изображений при открытии',
  },
  {
    title: 'DRM (Widevine/FairPlay)',
    desc: 'для видео-контента в продакшне',
  },
  {
    title: 'Запрет DevTools',
    desc: 'детекция открытых DevTools (эвристика по window.outerWidth)',
  },
  {
    title: 'Fingerprinting',
    desc: 'уникальный тег в каждой копии документа для деанонимизации утечки',
  },
  {
    title: 'Отключение right-click + select',
    desc: 'базовая защита текстового контента',
  },
]

// ─── Style helpers ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid var(--border, #e5e2f0)',
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#15141b',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink-soft, #6b7280)',
  marginBottom: 5,
}
