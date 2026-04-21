import { useState } from 'react'
import './App.css'

function App() {
  const [childCode, setChildCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (childCode.length !== 6) {
      setStatus('error')
      return
    }
    setStatus('checking')
    // TODO: real API call to /v1/auth/child-code
    setTimeout(() => setStatus('ok'), 400)
  }

  return (
    <main className="app">
      <header className="brand">
        <div className="logo" aria-hidden>
          🎮
        </div>
        <h1>Eduson Kids</h1>
        <p className="tagline">
          Строй свои 3D-миры. Учись Python играя.
        </p>
      </header>

      <section className="card">
        <h2>Войти по коду</h2>
        <p className="hint">
          Код — 6 цифр. Дал наставник на мастер-классе.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            value={childCode}
            onChange={(e) => setChildCode(e.target.value.replace(/\D/g, ''))}
            className="code-input"
            aria-label="Код ребёнка"
          />
          <button type="submit" disabled={status === 'checking'}>
            {status === 'checking' ? 'Проверяю…' : 'Войти'}
          </button>
        </form>
        {status === 'error' && <p className="err">Код должен быть из 6 цифр</p>}
        {status === 'ok' && <p className="ok">Готово! (TODO: открыть редактор)</p>}
      </section>

      <section className="card alt">
        <h3>Родителям</h3>
        <p>
          Нет кода? Запишитесь на{' '}
          <a href="https://eduson.academy/kids" target="_blank" rel="noreferrer">
            мастер-класс Eduson Kids
          </a>{' '}
          — после него ребёнок получит код автоматически.
        </p>
      </section>

      <footer className="foot">
        <small>
          © 2026 Eduson Kids Platform · Stage 1 MVP · <a href="/privacy">Политика ПД</a>
        </small>
      </footer>
    </main>
  )
}

export default App
