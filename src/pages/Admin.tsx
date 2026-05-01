/**
 * Admin / Curator panel — connected to real backend API.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { useToast } from '../hooks/useToast'
import {
  fetchClassrooms,
  createClassroom,
  deleteClassroom,
  fetchStudents,
  transferStudent,
  type ClassroomDto,
  type StudentDto,
} from '../api/classrooms'

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

  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewClassForm, setShowNewClassForm] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  // Transfer student state
  const [fromClassId, setFromClassId] = useState('')
  const [toClassId, setToClassId] = useState('')
  const [fromStudents, setFromStudents] = useState<StudentDto[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [transferring, setTransferring] = useState(false)

  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  useEffect(() => { if (confirmState) confirmDialogRef.current?.focus() }, [confirmState])

  // ─── Data loading ─────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    try {
      const data = await fetchClassrooms()
      setClassrooms(data)
    } catch (e) {
      show('Ошибка загрузки классов: ' + (e instanceof Error ? e.message : 'неизвестная ошибка'), 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    if (!fromClassId) { setFromStudents([]); return }
    setLoadingStudents(true)
    setSelectedStudentId('')
    fetchStudents(fromClassId)
      .then(setFromStudents)
      .catch(() => show('Ошибка загрузки учеников', 'error'))
      .finally(() => setLoadingStudents(false))
  }, [fromClassId, show])

  // ─── Handlers ────────────────────────────────────────────────────

  const handleDeleteClass = (id: string, name: string) => {
    setConfirmState({
      title: 'Удалить класс?',
      message: `Класс «${name}» будет удалён. Это действие необратимо.`,
      confirmLabel: 'Удалить',
      onConfirm: async () => {
        try {
          await deleteClassroom(id)
          show(`Класс «${name}» удалён`, 'success')
          void refresh()
        } catch (e) {
          show('Ошибка удаления: ' + (e instanceof Error ? e.message : ''), 'error')
        }
      },
    })
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) { show('Введи название класса', 'error'); return }
    try {
      await createClassroom(newClassName.trim())
      setNewClassName('')
      setShowNewClassForm(false)
      show('Класс создан', 'success')
      void refresh()
    } catch (e) {
      show('Ошибка создания: ' + (e instanceof Error ? e.message : ''), 'error')
    }
  }

  const handleTransfer = async () => {
    if (!fromClassId || !toClassId || !selectedStudentId) {
      show('Выбери классы и ученика', 'error'); return
    }
    if (fromClassId === toClassId) { show('Классы должны быть разными', 'error'); return }
    setTransferring(true)
    try {
      await transferStudent(fromClassId, selectedStudentId, toClassId)
      show('Ученик переведён', 'success')
      setSelectedStudentId('')
      setFromClassId('')
      void refresh()
    } catch (e) {
      show('Ошибка перевода: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setTransferring(false)
    }
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

      {/* Branded Confirm dialog */}
      {confirmState && (
        <div
          ref={confirmDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          tabIndex={-1}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(21,20,27,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmState(null) }}
        >
          <div
            className="kb-card"
            style={{
              maxWidth: 420, width: '100%', padding: 24,
              background: 'var(--paper)',
              boxShadow: '0 4px 0 0 rgba(21,20,27,.22), 0 20px 60px rgba(21,20,27,.25)',
              border: '2px solid var(--ink)', borderRadius: 18,
            }}
          >
            <h2 id="confirm-title" style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: 'var(--f-display)' }}>
              {confirmState.title}
            </h2>
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="kb-btn" onClick={() => setConfirmState(null)} autoFocus>Отмена</button>
              <button
                className="kb-btn"
                style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626', fontWeight: 900 }}
                onClick={() => { const fn = confirmState.onConfirm; setConfirmState(null); void fn() }}
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
                onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateClass() }}
                style={inputStyle}
                aria-label="Название класса"
                autoFocus
              />
              <button className="kb-btn" onClick={() => void handleCreateClass()}>Создать класс</button>
            </div>
          )}

          {loading ? (
            <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
              Загрузка…
            </div>
          ) : classrooms.length === 0 ? (
            <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
              Классов пока нет. Создай первый.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-soft, #f5f3ff)', textAlign: 'left' }}>
                    {['Название', 'Учеников', 'Дата создания', 'Код', 'Действия'].map((h) => (
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
                      <td style={{ padding: '10px 14px' }}>{cls.studentCount}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }}>
                        {new Date(cls.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                        {cls.inviteCode ?? '—'}
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
                onChange={(e) => setFromClassId(e.target.value)}
                style={selectStyle}
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
              >
                <option value="">— выбери —</option>
                {classrooms.filter((c) => c.id !== fromClassId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingStudents && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>Загрузка учеников…</p>
          )}

          {!loadingStudents && fromStudents.length > 0 && (
            <div>
              <label style={labelStyle}>Ученик</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border, #e5e2f0)', borderRadius: 10, padding: 8 }}>
                {fromStudents.map((s) => (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      padding: '4px 6px', borderRadius: 6,
                      background: selectedStudentId === s.id ? '#f3f0ff' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="transfer-student"
                      value={s.id}
                      checked={selectedStudentId === s.id}
                      onChange={() => setSelectedStudentId(s.id)}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{s.login}</span>
                    {s.lastLoginAt && (
                      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                        · был {new Date(s.lastLoginAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="kb-btn"
            onClick={() => void handleTransfer()}
            disabled={!fromClassId || !toClassId || !selectedStudentId || transferring}
          >
            {transferring ? 'Перевод…' : 'Перевести ученика →'}
          </button>
        </section>

        {/* ── Section: Сообщения ── */}
        <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Сообщения</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="kb-btn" onClick={() => navigate('/chat')}>💬 Написать учителю</button>
            <button className="kb-btn kb-btn--secondary" onClick={() => navigate('/chat')}>👨‍👩‍👦 Написать родителю</button>
          </div>
        </section>

        {/* ── Section: Защита контента ── */}
        <section className="kb-card" style={{ padding: 24, background: 'var(--bg-soft, #f9f8ff)' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Защита контента</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CONTENT_PROTECTION_ITEMS.map((item) => (
              <li key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                <span style={{ color: 'var(--violet)', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>•</span>
                <span>
                  <strong>{item.title}</strong>
                  {' — '}
                  <span style={{ color: 'var(--ink-soft)' }}>{item.desc}</span>
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
  { title: 'Подписанные временные URL (Signed URLs)', desc: 'ссылки на видео/PDF истекают через N минут' },
  { title: 'Canvas watermark', desc: 'имя ученика наносится поверх PDF/изображений при открытии' },
  { title: 'DRM (Widevine/FairPlay)', desc: 'для видео-контента в продакшне' },
  { title: 'Запрет DevTools', desc: 'детекция открытых DevTools (эвристика по window.outerWidth)' },
  { title: 'Fingerprinting', desc: 'уникальный тег в каждой копии документа для деанонимизации утечки' },
  { title: 'Отключение right-click + select', desc: 'базовая защита текстового контента' },
]

// ─── Style helpers ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid var(--border, #e5e2f0)',
  fontSize: 14, fontFamily: 'inherit', background: '#fff',
  color: '#15141b', boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', cursor: 'pointer' }

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--ink-soft, #6b7280)', marginBottom: 5,
}
