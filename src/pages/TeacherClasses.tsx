import { useCallback, useEffect, useState } from 'react'
import PlatformShell, { type NavKey } from '../components/PlatformShell'
import { useToast } from '../hooks/useToast'
import {
  fetchClassrooms,
  createClassroom,
  deleteClassroom,
  bulkCreateStudents,
  downloadRosterPdf,
  type ClassroomDto,
  type NewStudentResult,
} from '../api/classrooms'

interface CreatedRoster {
  classroomId: string
  className: string
  students: (NewStudentResult & { displayName: string })[]
}

function parseNameList(text: string): Array<{ firstName: string; lastName: string }> {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/)
      if (parts.length >= 2) return { lastName: parts[0]!, firstName: parts.slice(1).join(' ') }
      return { lastName: '', firstName: parts[0]! }
    })
}

export default function TeacherClasses() {
  const { toast, show } = useToast()
  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([])
  const [loading, setLoading] = useState(true)

  // Create-class form
  const [showForm, setShowForm] = useState(false)
  const [className, setClassName] = useState('')
  const [rosterText, setRosterText] = useState('')
  const [creating, setCreating] = useState(false)

  // One-time PIN display after bulk-create
  const [lastRoster, setLastRoster] = useState<CreatedRoster | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchClassrooms()
      setClassrooms(data)
    } catch (e) {
      show('Ошибка загрузки классов: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = async () => {
    if (!className.trim()) return
    const names = parseNameList(rosterText)
    if (names.length === 0) {
      show('Список учеников пуст — добавь хотя бы одного', 'info')
      return
    }
    setCreating(true)
    try {
      const classroom = await createClassroom(className.trim())
      const results = await bulkCreateStudents(
        classroom.id,
        names.map(({ firstName, lastName }) => {
          const s: { firstName: string; lastName?: string } = { firstName }
          if (lastName) s.lastName = lastName
          return s
        }),
      )
      setLastRoster({
        classroomId: classroom.id,
        className: classroom.name,
        students: results.map((r, i) => ({
          ...r,
          displayName: `${names[i]?.lastName ?? ''} ${names[i]?.firstName ?? ''}`.trim(),
        })),
      })
      show(`Класс «${classroom.name}» создан · ${results.length} учеников`, 'success')
      setShowForm(false)
      setClassName('')
      setRosterText('')
      void refresh()
    } catch (e) {
      show('Ошибка создания: ' + (e instanceof Error ? e.message : ''), 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить класс «${name}»? Ученики потеряют доступ.`)) return
    try {
      await deleteClassroom(id)
      show(`Класс «${name}» удалён`, 'success')
      if (lastRoster?.classroomId === id) setLastRoster(null)
      void refresh()
    } catch (e) {
      show('Ошибка удаления: ' + (e instanceof Error ? e.message : ''), 'error')
    }
  }

  const handleDownloadPdf = async (classroomId: string) => {
    try {
      await downloadRosterPdf(classroomId)
    } catch (e) {
      show('Не удалось скачать PDF: ' + (e instanceof Error ? e.message : ''), 'error')
    }
  }

  return (
    <PlatformShell activeKey={"teacher-classes" as NavKey}>
      {toast && (
        <div key={toast.key} className={`kb-ui-toast kb-ui-toast--${toast.kind}`}>
          {toast.msg}
        </div>
      )}

      <section className="kb-cover kb-cover--violet" style={{ minHeight: 200 }}>
        <div className="kb-cover-meta">
          <span className="eyebrow">Учитель · Управление</span>
        </div>
        <h1 className="kb-cover-title" style={{ fontSize: 48 }}>
          Классы<span className="kb-cover-accent">.</span>
        </h1>
        <p className="kb-cover-sub">
          Создай класс, загрузи список учеников — получи логины и PIN-коды для печати.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>

        {/* One-time PIN roster after creation */}
        {lastRoster && (
          <div className="kb-card" style={{ borderLeft: '4px solid var(--mint-deep, #3DB07A)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div className="eyebrow" style={{ color: 'var(--mint-deep, #3DB07A)' }}>✓ Класс создан</div>
                <h3 className="h3" style={{ marginTop: 2 }}>{lastRoster.className} · PIN-коды (сохрани сейчас!)</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="kb-btn kb-btn--secondary"
                  onClick={() => void handleDownloadPdf(lastRoster.classroomId)}
                >
                  🖨 Скачать PDF
                </button>
                <button className="kb-btn" onClick={() => setLastRoster(null)}>✕ Скрыть</button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#c17a00', background: '#fff8e7', borderRadius: 8, padding: '8px 12px', margin: '0 0 12px' }}>
              ⚠ PIN-коды показаны только один раз. Сохрани список или распечатай PDF сейчас.
              PDF-кнопка в списке классов генерирует новые PIN-коды, старые перестанут работать.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--ink-soft)', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Фамилия Имя</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--f-mono)' }}>Логин</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--f-mono)' }}>PIN</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRoster.students.map((s, i) => (
                    <tr key={s.login} style={{ borderBottom: '1px solid rgba(21,20,27,.05)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--ink-soft)' }}>{i + 1}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{s.displayName}</td>
                      <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', color: 'var(--violet)' }}>{s.login}</td>
                      <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>{s.pin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Classroom list */}
        {loading ? (
          <div className="kb-card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-soft)' }}>Загрузка…</div>
        ) : classrooms.length > 0 ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 className="h2">Мои классы</h2>
              <span className="eyebrow">{classrooms.length} классов</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classrooms.map((cls) => (
                <div key={cls.id} className="kb-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 className="h3">{cls.name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{cls.studentCount} учеников</span>
                        {cls.inviteCode && (
                          <span>
                            Код: <code style={{ fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--violet)' }}>{cls.inviteCode}</code>
                          </span>
                        )}
                        <span>создан {new Date(cls.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="kb-btn kb-btn--sm"
                        onClick={() => void handleDownloadPdf(cls.id)}
                        title="Сгенерирует новые PIN-коды для всех учеников"
                      >
                        🖨 PDF-журнал
                      </button>
                      <button
                        className="kb-btn kb-btn--sm"
                        style={{ color: '#e53', borderColor: '#fcc' }}
                        onClick={() => void handleDelete(cls.id, cls.name)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : !showForm ? (
          <div className="kb-card" style={{ padding: 32, textAlign: 'center', color: 'var(--ink-soft)' }}>
            У тебя пока нет классов. Создай первый!
          </div>
        ) : null}

        {/* Create form */}
        {!showForm ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <button
              type="button"
              className="kb-btn kb-btn--lg kb-btn--secondary"
              onClick={() => setShowForm(true)}
            >
              + Создать новый класс
            </button>
          </div>
        ) : (
          <div className="kb-card">
            <h2 className="h2" style={{ marginBottom: 16 }}>Новый класс</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  Название класса
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="5А · КуБиК · 2026"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--f-ui)', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  Список учеников — каждая строка: Фамилия Имя
                </label>
                <textarea
                  value={rosterText}
                  onChange={(e) => setRosterText(e.target.value)}
                  rows={10}
                  placeholder={'Иванова Маша\nПетров Ваня\nСидорова Оля'}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid var(--border)', fontFamily: 'var(--f-mono)',
                    fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {parseNameList(rosterText).length} учеников
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="kb-btn kb-btn--lg kb-btn--secondary"
                  onClick={() => void handleCreate()}
                  disabled={creating || !className.trim() || !rosterText.trim()}
                >
                  {creating ? 'Создаю…' : '⚡ Создать класс и выдать логины'}
                </button>
                <button
                  type="button"
                  className="kb-btn"
                  onClick={() => { setShowForm(false); setClassName(''); setRosterText('') }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformShell>
  )
}
