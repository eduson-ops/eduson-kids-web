import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'

export default function Settings() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    const n = localStorage.getItem('ek_child_name') ?? ''
    setName(n)
    setNameInput(n)
  }, [])

  function handleSignOut() {
    localStorage.removeItem('ek_child_name')
    localStorage.removeItem('ek_parent_name')
    navigate('/')
  }

  function handleSaveName() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    localStorage.setItem('ek_child_name', trimmed)
    setName(trimmed)
    setEditingName(false)
  }

  return (
    <PlatformShell activeKey="settings">
      <section className="kb-cover kb-cover--violet" style={{ minHeight: 200 }}>
        <div className="kb-cover-meta">
          <span className="eyebrow">Аккаунт</span>
        </div>
        <h1 className="kb-cover-title" style={{ fontSize: 48 }}>
          Настройки<span className="kb-cover-accent">.</span>
        </h1>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 32 }}>
        {/* Профиль */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Профиль</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--violet-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900,
            }}>
              {name ? name[0].toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1 }}>
              {editingName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    className="text-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                    style={{ padding: '8px 12px', borderRadius: 10, border: '2px solid var(--violet)', fontFamily: 'var(--f-ui)', fontSize: 16 }}
                  />
                  <button className="kb-btn kb-btn--secondary" onClick={handleSaveName}>Сохранить</button>
                  <button className="kb-btn" onClick={() => setEditingName(false)}>Отмена</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <strong style={{ fontSize: 18 }}>{name || 'Гость'}</strong>
                  <button
                    className="kb-btn"
                    style={{ fontSize: 13, padding: '4px 12px' }}
                    onClick={() => { setNameInput(name); setEditingName(true) }}
                  >
                    Изменить имя
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Уведомления */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Уведомления</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['Email', 'Telegram', 'Push'] as const).map((ch) => (
              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.5, cursor: 'not-allowed' }}>
                <input type="checkbox" disabled />
                <span>{ch}</span>
                <span className="eyebrow" style={{ marginLeft: 'auto' }}>скоро</span>
              </label>
            ))}
          </div>
        </div>

        {/* Язык */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Язык интерфейса</h2>
          <select disabled style={{ opacity: 0.5, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--paper-2)', cursor: 'not-allowed', fontFamily: 'var(--f-ui)', fontSize: 15 }}>
            <option>🇷🇺 Русский</option>
          </select>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-soft)' }}>Поддержка других языков запланирована на v1.2</p>
        </div>

        {/* Родительский контроль */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Родительский контроль</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.5 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'not-allowed' }}>
              <span>Максимум минут в день:</span>
              <input type="number" disabled defaultValue={60} style={{ width: 70, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--paper-2)' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'not-allowed' }}>
              <input type="checkbox" disabled />
              <span>Согласие на обработку персональных данных (ФЗ-152)</span>
            </label>
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>Доступно для родителей в разделе <a href="/parent" style={{ color: 'var(--violet)' }}>Родительский кабинет</a></p>
        </div>

        {/* Аккаунт */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Аккаунт</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button
              className="kb-btn kb-btn--secondary"
              onClick={handleSignOut}
            >
              🚪 Выйти
            </button>
            <button className="kb-btn" disabled style={{ opacity: 0.4, cursor: 'not-allowed', color: '#e53', borderColor: '#e53' }}>
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
