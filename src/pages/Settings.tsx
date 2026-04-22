import { useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'

export default function Settings() {
  const navigate = useNavigate()

  function handleSignOut() {
    localStorage.removeItem('ek_child_name')
    localStorage.removeItem('ek_parent_name')
    navigate('/')
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
          <h2 className="h2" style={{ marginBottom: 16 }}>Язык</h2>
          <select disabled style={{ opacity: 0.5, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--paper-2)', cursor: 'not-allowed' }}>
            <option>Русский</option>
          </select>
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
        </div>

        {/* Аккаунт */}
        <div className="kb-card">
          <h2 className="h2" style={{ marginBottom: 16 }}>Аккаунт</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button className="kb-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Сменить имя
            </button>
            <button
              className="kb-btn kb-btn--secondary"
              onClick={handleSignOut}
            >
              Выйти
            </button>
            <button className="kb-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--error, #e53)', borderColor: 'var(--error, #e53)' }}>
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
