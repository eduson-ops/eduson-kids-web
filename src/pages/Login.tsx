import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiLoginChildCode, apiLoginGuest } from '../lib/api'
import { startVkLogin, vkConfig } from '../lib/vkAuth'

/**
 * Login — три пути входа:
 *   1) VK ID (OAuth2 + PKCE) — основной для LXP, открывает сообщения родителю
 *   2) Код ребёнка (6 цифр) — от наставника на МК, для малышей без аккаунта
 *   3) Гость — оффлайн, только этот браузер
 */
export default function Login() {
  const navigate = useNavigate()
  const [childCode, setChildCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')
  const [vkErr, setVkErr] = useState<string | null>(null)
  const vkAppConfigured = vkConfig().appId.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (childCode.length !== 6) {
      setStatus('error')
      return
    }
    setStatus('checking')
    const r = await apiLoginChildCode(childCode)
    const name = r?.user?.name ?? `Игрок-${childCode.slice(-3)}`
    localStorage.setItem('ek_child_code', childCode)
    localStorage.setItem('ek_child_name', name)
    navigate('/')
  }

  const quickStart = async () => {
    const r = await apiLoginGuest()
    localStorage.setItem('ek_child_code', '000000')
    localStorage.setItem('ek_child_name', r?.user?.name ?? 'Гость')
    navigate('/')
  }

  const loginWithVk = async (role: 'child' | 'parent') => {
    setVkErr(null)
    try {
      sessionStorage.setItem('ek_vk_next', role === 'parent' ? '/parent' : '/')
      await startVkLogin(role)
    } catch (e) {
      setVkErr((e as Error).message)
    }
  }

  return (
    <main className="app">
      <header className="brand">
        <div className="logo" aria-hidden>🎮</div>
        <h1>Eduson Kids</h1>
        <p className="tagline">Строй свои миры. Учись программировать.</p>
      </header>

      <section className="card">
        <h2>Вход через VK</h2>
        <p className="hint">Быстро и безопасно. Родитель получает отчёты в сообщениях.</p>
        {!vkAppConfigured && (
          <p className="err" style={{ marginTop: 0 }}>
            VK ID не настроен — задай <code>VITE_VK_APP_ID</code> в <code>.env.local</code>.
          </p>
        )}
        <div style={{ display: 'grid', gap: 10 }}>
          <button
            className="vk-btn"
            onClick={() => loginWithVk('child')}
            disabled={!vkAppConfigured}
          >
            <VkIcon /> Войти как ученик
          </button>
          <button
            className="vk-btn vk-btn-parent"
            onClick={() => loginWithVk('parent')}
            disabled={!vkAppConfigured}
          >
            <VkIcon /> Войти как родитель
          </button>
          {vkErr && <p className="err">{vkErr}</p>}
        </div>
      </section>

      <section className="card">
        <h2>Войти по коду</h2>
        <p className="hint">Код — 6 цифр. Дал наставник на мастер-классе.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            value={childCode}
            onChange={(e) => {
              setStatus('idle')
              setChildCode(e.target.value.replace(/\D/g, ''))
            }}
            className="code-input"
            aria-label="Код ребёнка"
          />
          <button type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? 'Вхожу…' : 'Войти'}
          </button>
        </form>
        {status === 'error' && <p className="err">Код должен быть из 6 цифр</p>}
      </section>

      <section className="card alt">
        <h3>Просто попробовать</h3>
        <p>Без кода. Сохранение работает только в этом браузере.</p>
        <button className="ghost" onClick={quickStart}>Войти как гость</button>
      </section>

      <footer className="foot">
        <small>© 2026 Eduson Kids · LXP</small>
      </footer>
    </main>
  )
}

function VkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M12.62 17.25c-5.51 0-9-3.81-9-9.75h2.77c0 4.13 1.85 5.95 3.34 6.32V7.5h2.64v4.01c1.5-.16 3.07-1.86 3.6-4.01h2.64c-.41 2.61-2.08 4.5-3.27 5.26 1.2.62 3.12 2.25 3.85 5.49h-2.9c-.56-1.84-2.05-3.26-3.92-3.45v3.45h-0.75z"
      />
    </svg>
  )
}
