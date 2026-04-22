import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiLoginChildCode, apiLoginGuest } from '../lib/api'
import { startVkLogin, vkConfig } from '../lib/vkAuth'
import Niksel, { NikselMini } from '../design/mascot/Niksel'

/**
 * Login — четыре пути входа:
 *   1) VK ID — если настроен backend OAuth flow. На статик-сборке disabled.
 *   2) Демо-VK — быстрый вход для co-founder preview. Просто заводит гостя
 *      с именем «Демо», без реального VK.
 *   3) Код ребёнка (6 цифр) — от наставника на МК.
 *   4) Гость — оффлайн, только в этом браузере.
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

  const demoVk = () => {
    // Демо-вход: симулирует успешный VK-флоу без реального OAuth.
    // Используется на статических сборках (GH Pages), где нет бекенда для обмена code→token.
    localStorage.setItem('ek_child_code', 'demo-vk')
    localStorage.setItem('ek_child_name', 'Никита (VK-демо)')
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
    <div className="brand-shell login-shell">
      <header className="login-head">
        <Link to="/" className="kb-shell-brand" aria-label="Eduson Kids — главная">
          <NikselMini size={36} />
          <span>Эдусон</span>
          <span className="kb-shell-brand-kids">Kids</span>
        </Link>
      </header>

      <main className="login-main">
        <div className="login-intro">
          <Niksel pose="wave" size={140} />
          <span className="eyebrow">Добро пожаловать</span>
          <h1 className="h1">Вход в&nbsp;Эдусон&nbsp;Kids</h1>
          <p className="lead">
            Выбери способ — и продолжи учиться. Все варианты сохраняют прогресс,
            так что начать можно одним кликом.
          </p>
        </div>

        <div className="login-grid">
          {/* 1. VK-блок */}
          <section className="kb-card kb-card--feature login-card">
            <div className="login-card-head">
              <span className="eyebrow">VK ID</span>
              <h2 className="h2">Войти через VK</h2>
              <p className="lead-s">
                Быстро и безопасно. Родитель получает отчёты в&nbsp;VK-сообщениях.
              </p>
            </div>

            {!vkAppConfigured && (
              <div className="kb-state kb-state--info login-info">
                <span>🔌</span>
                <span>
                  VK OAuth требует серверный обмен токеном. На превью попробуй
                  «Демо-вход» ниже — работает без бэкенда.
                </span>
              </div>
            )}

            <div className="login-btn-col">
              <button
                className="kb-btn kb-btn--lg"
                onClick={() => loginWithVk('child')}
                disabled={!vkAppConfigured}
              >
                <VkIcon /> Войти как ученик
              </button>
              <button
                className="kb-btn kb-btn--lg kb-btn--secondary"
                onClick={() => loginWithVk('parent')}
                disabled={!vkAppConfigured}
              >
                <VkIcon /> Войти как родитель
              </button>
              {vkErr && <div className="kb-state kb-state--error">{vkErr}</div>}

              <div className="login-divider"><span>или</span></div>

              <button className="kb-btn kb-btn--lg kb-btn--ghost" onClick={demoVk}>
                🎭 Демо-вход (без VK)
              </button>
            </div>
          </section>

          {/* 2. Код ребёнка */}
          <section className="kb-card login-card">
            <div className="login-card-head">
              <span className="eyebrow">Мастер-класс</span>
              <h2 className="h2">Код от&nbsp;наставника</h2>
              <p className="lead-s">6 цифр, которые дал наставник на&nbsp;встрече.</p>
            </div>

            <form className="login-code-form" onSubmit={handleSubmit}>
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
                className="login-code-input"
                aria-label="Код ребёнка"
              />
              <button
                type="submit"
                className="kb-btn kb-btn--lg"
                disabled={status === 'checking' || childCode.length !== 6}
              >
                {status === 'checking' ? 'Вхожу…' : '→ Войти'}
              </button>
              {status === 'error' && (
                <div className="kb-state kb-state--error">Код должен быть из 6 цифр</div>
              )}
            </form>
          </section>

          {/* 3. Гость */}
          <section className="kb-card login-card login-card--guest">
            <div className="login-card-head">
              <span className="eyebrow">Без регистрации</span>
              <h2 className="h2">Просто посмотреть</h2>
              <p className="lead-s">
                Сохранение работает только в&nbsp;этом браузере. Хороший вариант
                для первой встречи.
              </p>
            </div>
            <button className="kb-btn kb-btn--lg kb-btn--ghost" onClick={quickStart}>
              👋 Войти как гость
            </button>
          </section>
        </div>
      </main>

      <footer className="login-foot">
        <small>© 2026 Эдусон Kids · LXP</small>
      </footer>
    </div>
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
