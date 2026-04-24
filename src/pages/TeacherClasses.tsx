import { useState } from 'react'
import PlatformShell, { type NavKey } from '../components/PlatformShell'
import { useToast } from '../hooks/useToast'
import RosterPDF from '../components/RosterPDF'
import {
  getClassrooms,
  createClassroom,
  deleteClassroom,
  parseRoster,
  type Classroom,
  type Student,
} from '../lib/classRoster'

/** /teacher/classes — управление классами и автогенерация логинов */
export default function TeacherClasses() {
  const { toast, show } = useToast()
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => getClassrooms())

  // Форма создания класса
  const [showForm, setShowForm] = useState(false)
  const [className, setClassName] = useState('')
  const [rosterText, setRosterText] = useState('')
  const [generated, setGenerated] = useState<Student[] | null>(null)

  function reload() { setClassrooms(getClassrooms()) }

  function handleGenerate() {
    const suffix = className.replace(/[^a-zA-Zа-яА-Я0-9]/g, '').slice(0, 4) || 'kls'
    const students = parseRoster(rosterText, suffix)
    if (students.length === 0) {
      show('Добавь хотя бы одного ученика — каждая строка: Фамилия Имя', 'info')
      return
    }
    setGenerated(students)
  }

  function handleSave() {
    if (!generated || !className) return
    createClassroom(className, 'teacher-1', generated)
    show(`Класс «${className}» создан · ${generated.length} учеников`, 'success')
    setShowForm(false)
    setClassName('')
    setRosterText('')
    setGenerated(null)
    reload()
  }

  function handleDelete(id: string) {
    if (!confirm('Удалить класс? Логины перестанут работать.')) return
    deleteClassroom(id)
    reload()
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
        {/* Список классов */}
        {classrooms.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 className="h2">Мои классы</h2>
              <span className="eyebrow">{classrooms.length} {classrooms.length === 1 ? 'класс' : 'классов'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {classrooms.map((cls) => (
                <div key={cls.id} className="kb-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h3 className="h3">{cls.name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                        {cls.students.length} учеников · создан {new Date(cls.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <RosterPDF className={cls.name} students={cls.students} />
                      <button
                        type="button"
                        className="kb-btn"
                        style={{ color: '#e53', borderColor: '#e53' }}
                        onClick={() => handleDelete(cls.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  {/* Таблица учеников */}
                  <div style={{ marginTop: 16, overflowX: 'auto' }}>
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
                        {cls.students.map((s, i) => (
                          <tr key={s.login} style={{ borderBottom: '1px solid rgba(21,20,27,.05)' }}>
                            <td style={{ padding: '6px 10px', color: 'var(--ink-soft)' }}>{i + 1}</td>
                            <td style={{ padding: '6px 10px', fontWeight: 600 }}>{s.lastName} {s.firstName}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', color: 'var(--violet)' }}>{s.login}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{s.pin}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Форма создания */}
        {!showForm ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
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
                  Название класса (напр. 5А)
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => { setClassName(e.target.value); setGenerated(null) }}
                  placeholder="5А · Математика · 2026"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--f-ui)', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  Список учеников — каждая строка: Фамилия Имя
                </label>
                <textarea
                  value={rosterText}
                  onChange={(e) => { setRosterText(e.target.value); setGenerated(null) }}
                  rows={8}
                  placeholder={'Иванова Маша\nПетров Ваня\nСидорова Оля'}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid var(--border)', fontFamily: 'var(--f-mono)',
                    fontSize: 14, resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="kb-btn kb-btn--lg"
                  onClick={handleGenerate}
                  disabled={!className.trim() || !rosterText.trim()}
                >
                  ⚡ Сгенерировать логины и PIN
                </button>
                <button
                  type="button"
                  className="kb-btn"
                  onClick={() => { setShowForm(false); setGenerated(null) }}
                >
                  Отмена
                </button>
              </div>

              {/* Предпросмотр */}
              {generated && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                    Готово — {generated.length} учеников:
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left' }}>Фамилия Имя</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--f-mono)' }}>Логин</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'var(--f-mono)' }}>PIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generated.map((s) => (
                        <tr key={s.login} style={{ borderBottom: '1px solid rgba(21,20,27,.05)' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 600 }}>{s.lastName} {s.firstName}</td>
                          <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', color: 'var(--violet)' }}>{s.login}</td>
                          <td style={{ padding: '6px 10px', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{s.pin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <button type="button" className="kb-btn kb-btn--lg kb-btn--secondary" onClick={handleSave}>
                      ✓ Сохранить класс
                    </button>
                    <RosterPDF className={className} students={generated} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PlatformShell>
  )
}
