import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [childCode, setChildCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (childCode.length !== 6) {
      setStatus('error')
      return
    }
    setStatus('checking')
    // MVP: любой 6-значный код принимается (dev-режим без бэка).
    // Stage 1 US-01: real auth через /api/v1/auth/child-code
    localStorage.setItem('ek_child_code', childCode)
    localStorage.setItem('ek_child_name', `Игрок-${childCode.slice(-3)}`)
    setTimeout(() => navigate('/editor'), 300)
  }

  const quickStart = () => {
    localStorage.setItem('ek_child_code', '000000')
    localStorage.setItem('ek_child_name', 'Гость')
    navigate('/editor')
  }

  return (
    <main className="app">
      <header className="brand">
        <div className="logo" aria-hidden>🎮</div>
        <h1>Eduson Kids</h1>
        <p className="tagline">Строй свои миры. Учись Python играя.</p>
      </header>

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
            autoFocus
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
        <small>© 2026 Eduson Kids · Stage 1 MVP</small>
      </footer>
    </main>
  )
}
