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
import {
  fetchAllSlots,
  patchSlot,
  updateSlotStatus,
  type SlotDto,
} from '../api/schedule'
import {
  createGuestToken,
  listGuestTokens,
  type GuestTokenDto,
  type GuestTokenType,
} from '../api/guest'

type Tab = 'classes' | 'transfer' | 'slots' | 'guest' | 'messages' | 'protection'

interface ConfirmState {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

const TAB_LIST: { key: Tab; label: string }[] = [
  { key: 'classes',    label: '🏫 Классы' },
  { key: 'transfer',   label: '🔀 Переводы' },
  { key: 'slots',      label: '🗓 KidsSlots' },
  { key: 'guest',      label: '🎫 Гость-токены' },
  { key: 'messages',   label: '💬 Сообщения' },
  { key: 'protection', label: '🛡 Защита' },
]

export default function Admin() {
  const navigate = useNavigate()
  const { toast, show } = useToast()
  const confirmDialogRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<Tab>('classes')

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

  // KidsSlots state
  const [slots, setSlots] = useState<SlotDto[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [assignClassroomId, setAssignClassroomId] = useState('')
  const [assignStudents, setAssignStudents] = useState<StudentDto[]>([])
  const [assignStudentsLoading, setAssignStudentsLoading] = useState(false)
  const [slotFilter, setSlotFilter] = useState<'available' | 'all'>('available')
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null)
  const [assignStudentId, setAssignStudentId] = useState('')

  // Guest tokens state
  const [guestTokens, setGuestTokens] = useState<GuestTokenDto[]>([])
  const [guestLoading, setGuestLoading] = useState(false)
  const [tokenType, setTokenType] = useState<GuestTokenType>('trial')
  const [tokenTtl, setTokenTtl] = useState(72)
  const [creatingToken, setCreatingToken] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

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

  useEffect(() => {
    if (activeTab !== 'slots') return
    setSlotsLoading(true)
    fetchAllSlots()
      .then(setSlots)
      .catch(() => show('Ошибка загрузки слотов', 'error'))
      .finally(() => setSlotsLoading(false))
  }, [activeTab, show])

  useEffect(() => {
    if (!assignClassroomId) { setAssignStudents([]); return }
    setAssignStudentsLoading(true)
    fetchStudents(assignClassroomId)
      .then(setAssignStudents)
      .catch(() => show('Ошибка загрузки учеников', 'error'))
      .finally(() => setAssignStudentsLoading(false))
  }, [assignClassroomId, show])

  useEffect(() => {
    if (activeTab !== 'guest') return
    setGuestLoading(true)
    listGuestTokens()
      .then(setGuestTokens)
      .catch(() => show('Ошибка загрузки токенов', 'error'))
      .finally(() => setGuestLoading(false))
  }, [activeTab, show])

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

  const handleAssignStudent = async (slotId: string) => {
    if (!assignStudentId) { show('Выбери ученика', 'error'); return }
    setAssigningSlotId(slotId)
    try {
      await patchSlot(slotId, { studentId: assignStudentId })
      show('Ученик назначен на слот', 'success')
      setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, studentId: assignStudentId } : s))
      setAssignStudentId('')
    } catch (e) {
      show('Ошибка назначения: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setAssigningSlotId(null)
    }
  }

  const handleCancelSlot = async (slotId: string) => {
    try {
      await updateSlotStatus(slotId, 'cancelled')
      setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, status: 'cancelled' } : s))
      show('Слот отменён', 'success')
    } catch (e) {
      show('Ошибка отмены: ' + (e instanceof Error ? e.message : ''), 'error')
    }
  }

  const handleCreateToken = async () => {
    setCreatingToken(true)
    try {
      const token = await createGuestToken({ type: tokenType, ttlHours: tokenTtl })
      setGuestTokens((prev) => [token, ...prev])
      show('Токен создан', 'success')
    } catch (e) {
      show('Ошибка создания токена: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setCreatingToken(false)
    }
  }

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/join/${encodeURIComponent(token)}`
    void navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // ─── Render ───────────────────────────────────────────────────────

  const displayedSlots = slotFilter === 'available'
    ? slots.filter((s) => s.status === 'scheduled' && !s.studentId)
    : slots

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

      {/* Tab bar */}
      <div style={{ overflowX: 'auto', borderBottom: '2px solid var(--paper-3, #e5e2f0)', marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 0, minWidth: 'max-content', padding: '0 16px' }}>
          {TAB_LIST.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '12px 20px', fontWeight: 700, fontSize: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === t.key ? '3px solid var(--violet, #6b5ce7)' : '3px solid transparent',
                color: activeTab === t.key ? 'var(--violet, #6b5ce7)' : 'var(--ink-soft, #6b7280)',
                transition: 'color .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Tab: Классы ── */}
        {activeTab === 'classes' && (
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
        )}

        {/* ── Tab: Переводы ── */}
        {activeTab === 'transfer' && (
          <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Перевод ученика</h2>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>Из класса</label>
                <select value={fromClassId} onChange={(e) => setFromClassId(e.target.value)} style={selectStyle}>
                  <option value="">— выбери —</option>
                  {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={labelStyle}>В класс</label>
                <select value={toClassId} onChange={(e) => setToClassId(e.target.value)} style={selectStyle}>
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
        )}

        {/* ── Tab: KidsSlots ── */}
        {activeTab === 'slots' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Доступные слоты</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['available', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    className="kb-btn"
                    style={{
                      fontSize: 13, padding: '6px 14px',
                      background: slotFilter === f ? 'var(--violet, #6b5ce7)' : 'transparent',
                      color: slotFilter === f ? '#fff' : 'var(--ink-soft)',
                      border: '1.5px solid var(--violet, #6b5ce7)',
                    }}
                    onClick={() => setSlotFilter(f)}
                  >
                    {f === 'available' ? '🟢 Свободные' : '📋 Все'}
                  </button>
                ))}
                <button
                  className="kb-btn"
                  style={{ fontSize: 13, padding: '6px 14px' }}
                  onClick={() => {
                    setSlotsLoading(true)
                    fetchAllSlots().then(setSlots).catch(() => show('Ошибка', 'error')).finally(() => setSlotsLoading(false))
                  }}
                >
                  ↻ Обновить
                </button>
              </div>
            </div>

            {/* Assign student picker */}
            <div className="kb-card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Класс для назначения</label>
                <select value={assignClassroomId} onChange={(e) => { setAssignClassroomId(e.target.value); setAssignStudentId('') }} style={selectStyle}>
                  <option value="">— выбери класс —</option>
                  {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Ученик</label>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  style={selectStyle}
                  disabled={assignStudentsLoading || assignStudents.length === 0}
                >
                  <option value="">— выбери ученика —</option>
                  {assignStudents.map((s) => <option key={s.id} value={s.id}>{s.login}</option>)}
                </select>
              </div>
            </div>

            {slotsLoading ? (
              <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка слотов…</div>
            ) : displayedSlots.length === 0 ? (
              <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                {slotFilter === 'available' ? 'Нет свободных слотов' : 'Слотов нет'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-soft, #f5f3ff)', textAlign: 'left' }}>
                      {['Дата / Время', 'Тип', 'Статус', 'Длит.', 'Ссылка Zoom', 'Назначить / Действия'].map((h) => (
                        <th key={h} style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSlots.map((slot, i) => {
                      const dt = new Date(slot.datetime)
                      const isPast = dt < new Date()
                      return (
                        <tr
                          key={slot.id}
                          style={{
                            background: i % 2 === 0 ? '#fff' : 'var(--bg-soft, #f9f8ff)',
                            borderBottom: '1px solid var(--border, #e5e2f0)',
                            opacity: slot.status === 'cancelled' ? 0.5 : 1,
                          }}
                        >
                          <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                            {dt.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {isPast && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-soft)' }}>(прош.)</span>}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              background: slot.type === 'trial' ? '#fef3c7' : slot.type === 'makeup' ? '#dbeafe' : '#f3f0ff',
                              color: slot.type === 'trial' ? '#92400e' : slot.type === 'makeup' ? '#1e40af' : '#4c1d95',
                            }}>
                              {slot.type === 'trial' ? 'Пробный' : slot.type === 'makeup' ? 'Отработка' : 'Обычный'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              background: slot.status === 'scheduled' ? '#dcfce7' : slot.status === 'conducted' ? '#dbeafe' : '#fee2e2',
                              color: slot.status === 'scheduled' ? '#166534' : slot.status === 'conducted' ? '#1e40af' : '#991b1b',
                            }}>
                              {slot.status === 'scheduled' ? 'Запланирован' : slot.status === 'conducted' ? 'Проведён' : slot.status === 'cancelled' ? 'Отменён' : 'Перенесён'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>{slot.durationMin} мин</td>
                          <td style={{ padding: '10px 14px' }}>
                            {slot.zoomLink
                              ? <a href={slot.zoomLink} target="_blank" rel="noreferrer" style={{ color: 'var(--violet)', fontWeight: 600, fontSize: 12 }}>Войти →</a>
                              : <span style={{ color: 'var(--ink-soft)', fontSize: 12 }}>—</span>
                            }
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {slot.status === 'scheduled' && !slot.studentId && (
                                <button
                                  className="kb-btn"
                                  style={{ fontSize: 12, padding: '4px 10px', background: 'var(--violet)', color: '#fff' }}
                                  disabled={!assignStudentId || assigningSlotId === slot.id}
                                  onClick={() => void handleAssignStudent(slot.id)}
                                >
                                  {assigningSlotId === slot.id ? '…' : '+ Назначить'}
                                </button>
                              )}
                              {slot.studentId && (
                                <span style={{ fontSize: 12, color: 'var(--ink-soft)', padding: '4px 0' }}>
                                  ✓ Назначен
                                </span>
                              )}
                              {slot.status === 'scheduled' && (
                                <button
                                  className="kb-btn"
                                  style={{ fontSize: 12, padding: '4px 10px', background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                                  onClick={() => void handleCancelSlot(slot.id)}
                                >
                                  Отменить
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Гость-токены ── */}
        {activeTab === 'guest' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Гость-токены</h2>

            {/* Create token */}
            <div className="kb-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Создать токен</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={labelStyle}>Тип</label>
                  <select value={tokenType} onChange={(e) => setTokenType(e.target.value as GuestTokenType)} style={selectStyle}>
                    <option value="trial">Пробный урок</option>
                    <option value="masterclass">Мастер-класс</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label style={labelStyle}>Срок (часы)</label>
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={tokenTtl}
                    onChange={(e) => setTokenTtl(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <button
                  className="kb-btn"
                  style={{ background: 'var(--violet, #6b5ce7)', color: '#fff', fontWeight: 700 }}
                  onClick={() => void handleCreateToken()}
                  disabled={creatingToken}
                >
                  {creatingToken ? 'Создаю…' : '+ Создать токен'}
                </button>
              </div>
            </div>

            {/* Tokens list */}
            {guestLoading ? (
              <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
            ) : guestTokens.length === 0 ? (
              <div className="kb-card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>Токенов нет</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-soft, #f5f3ff)', textAlign: 'left' }}>
                      {['Токен', 'Тип', 'Статус', 'Истекает', 'Ссылка'].map((h) => (
                        <th key={h} style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guestTokens.map((t, i) => {
                      const expired = new Date(t.expiresAt) < new Date()
                      return (
                        <tr
                          key={t.id}
                          style={{
                            background: i % 2 === 0 ? '#fff' : 'var(--bg-soft, #f9f8ff)',
                            borderBottom: '1px solid var(--border, #e5e2f0)',
                            opacity: t.used || expired ? 0.5 : 1,
                          }}
                        >
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>
                            {t.token.slice(0, 12)}…
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              background: t.type === 'masterclass' ? '#f3f0ff' : '#fef3c7',
                              color: t.type === 'masterclass' ? '#4c1d95' : '#92400e',
                            }}>
                              {t.type === 'masterclass' ? 'Мастер-класс' : 'Пробный'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {t.used
                              ? <span style={{ color: '#dc2626', fontWeight: 700 }}>Использован</span>
                              : expired
                                ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>Истёк</span>
                                : <span style={{ color: '#059669', fontWeight: 700 }}>Активен</span>
                            }
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--ink-soft)', fontSize: 12 }}>
                            {new Date(t.expiresAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {!t.used && !expired && (
                              <button
                                className="kb-btn"
                                style={{ fontSize: 12, padding: '4px 12px' }}
                                onClick={() => handleCopyLink(t.token)}
                              >
                                {copiedToken === t.token ? '✓ Скопировано' : '📋 Скопировать ссылку'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Сообщения ── */}
        {activeTab === 'messages' && (
          <section className="kb-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Сообщения</h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="kb-btn" onClick={() => navigate('/chat')}>💬 Написать учителю</button>
              <button className="kb-btn kb-btn--secondary" onClick={() => navigate('/chat')}>👨‍👩‍👦 Написать родителю</button>
            </div>
          </section>
        )}

        {/* ── Tab: Защита контента ── */}
        {activeTab === 'protection' && (
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
        )}

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
