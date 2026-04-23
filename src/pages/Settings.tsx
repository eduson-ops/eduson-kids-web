import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { useToast } from '../hooks/useToast'
import { getMuted, setMuted, setVolume, getVolume } from '../lib/audio'

const AVATAR_COLORS = ['#7c6be8', '#3ab97a', '#f5a623', '#e84040', '#4c97ff', '#c879ff', '#ff9f43', '#00bcd4']

function getAvatarColor(): string {
  return localStorage.getItem('ek_avatar_color') ?? AVATAR_COLORS[0]
}
function setAvatarColor(c: string) {
  localStorage.setItem('ek_avatar_color', c)
}

function getQuality(): string {
  return localStorage.getItem('ek_quality') ?? 'auto'
}
function applyQuality(q: string) {
  localStorage.setItem('ek_quality', q)
  window.dispatchEvent(new CustomEvent('ek:quality-change', { detail: { quality: q } }))
}

export default function Settings() {
  const navigate = useNavigate()
  const { toast, show: showToast } = useToast()
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [muted, setMutedState] = useState(getMuted())
  const [vol, setVol] = useState(getVolume())
  const [quality, setQuality] = useState(getQuality())
  const [avatarColor, setAvatarColorState] = useState(getAvatarColor())

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
    showToast('✓ Имя сохранено', 'success')
  }

  function handleToggleMute() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10) / 100
    setVolume(v)
    setVol(v)
    if (muted) { setMuted(false); setMutedState(false) }
  }

  function handleQuality(q: string) {
    setQuality(q)
    applyQuality(q)
    showToast(`✓ Качество: ${q === 'auto' ? 'авто' : q === 'med' ? 'среднее' : 'низкое'}`, 'success')
  }

  function handleAvatarColor(c: string) {
    setAvatarColor(c)
    setAvatarColorState(c)
  }

  const qualityOptions = [
    { key: 'auto', label: 'Авто', desc: 'Адаптируется под устройство' },
    { key: 'med', label: 'Среднее', desc: 'Для слабых компьютеров' },
    { key: 'low', label: 'Низкое', desc: 'Максимальная скорость' },
  ]

  return (
    <PlatformShell activeKey="settings">
      {toast && (
        <div key={toast.key} className={`kb-ui-toast kb-ui-toast--${toast.kind}`}>
          {toast.msg}
        </div>
      )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: avatarColor, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: '#fff',
              boxShadow: `0 0 0 3px ${avatarColor}44`,
              flexShrink: 0,
            }}>
              {name ? name[0].toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              {editingName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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

          {/* Avatar color picker */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>Цвет аватара</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleAvatarColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c, border: avatarColor === c ? `3px solid var(--ink)` : '3px solid transparent',
                    cursor: 'pointer', outline: 'none', padding: 0,
                    boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : 'none',
                    transform: avatarColor === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s',
                  }}
                  aria-label={`Цвет ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Звук */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Звук</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={handleToggleMute}
                className="kb-btn"
                style={{ minWidth: 44, fontSize: 20, padding: '6px 12px' }}
                aria-label={muted ? 'Включить звук' : 'Выключить звук'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <span style={{ fontSize: 15 }}>{muted ? 'Выключен' : 'Включён'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 14, color: 'var(--ink-soft)', minWidth: 70 }}>Громкость</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(vol * 100)}
                onChange={handleVolume}
                style={{ flex: 1, maxWidth: 220, accentColor: 'var(--violet)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', minWidth: 32, textAlign: 'right' }}>
                {Math.round(vol * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Качество графики */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Качество 3D</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {qualityOptions.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => handleQuality(key)}
                style={{
                  flex: '1 1 120px',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: quality === key ? '2px solid var(--violet)' : '2px solid var(--border)',
                  background: quality === key ? 'var(--violet-soft)' : 'var(--paper-2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: quality === key ? 'var(--violet)' : 'var(--ink)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Горячие клавиши */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Горячие клавиши</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 20px', alignItems: 'center' }}>
            {[
              ['WASD', 'Движение персонажа'],
              ['Space', 'Прыжок'],
              ['Клик', 'Захват мыши / взаимодействие'],
              ['ESC', 'Отпустить мышь / меню'],
              ['Q', 'Открыть меню спавна (в режиме редактирования)'],
              ['Ctrl+Z', 'Отменить последнее действие (в редактировании)'],
              ['⚡ Ред.', 'Включить режим редактирования мира'],
            ].map(([key, desc]) => (
              <>
                <kbd key={`k-${key}`} style={{
                  background: 'var(--paper-2)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '3px 8px', fontSize: 13, fontFamily: 'monospace',
                  whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                }}>
                  {key}
                </kbd>
                <span key={`d-${key}`} style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{desc}</span>
              </>
            ))}
          </div>
        </div>

        {/* Уведомления */}
        <div className="kb-card" style={{ opacity: 0.7 }}>
          <h2 className="h2" style={{ marginBottom: 16 }}>Уведомления <span className="eyebrow" style={{ marginLeft: 8 }}>скоро</span></h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['Email', 'Telegram', 'Push'] as const).map((ch) => (
              <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'not-allowed' }}>
                <input type="checkbox" disabled />
                <span>{ch}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Аккаунт */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Аккаунт</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="kb-btn kb-btn--secondary" onClick={handleSignOut}>
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
