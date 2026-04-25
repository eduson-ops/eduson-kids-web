import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiLoginChildCode, apiLoginGuest, apiChildLogin, apiParentLogin } from '../lib/api'
import { startVkLogin, vkConfig } from '../lib/vkAuth'
import { checkPin } from '../lib/classRoster'
import { saveSession } from '../lib/auth'
import Niksel, { NikselMini } from '../design/mascot/Niksel'

/**
 * Login v2 — role picker:
 *   🎒 Ученик  / 👨‍👩‍👦 Родитель / 🎓 Учитель
 *
 * Child: PIN+login (roster), VK, 6-digit code, guest
 * Parent/Teacher: email + password form
 */

type LoginRole = 'child' | 'parent' | 'teacher'

export default function Login() {
  const navigate = useNavigate()
  const [pickedRole, setPickedRole] = useState<LoginRole | null>(null)

  return (
    <div className="brand-shell login-shell">
      <header className="login-head">
        <Link to="/" className="kb-shell-brand" aria-label="Eduson Kids — главная">
          <NikselMini size={36} />
          <span>Эдюсон</span>
          <span className="kb-shell-brand-kids">Kids</span>
        </Link>
      </header>

      <main className="login-main">
        <div className="login-intro">
          <Niksel pose="wave" size={140} />
          <span className="eyebrow">Добро пожаловать</span>
          <h1 className="h1">Вход в&nbsp;Эдюсон&nbsp;Kids</h1>
          <p className="lead">Выбери, кто ты — и мы подберём правильный вход.</p>
        </div>

        {/* Role picker */}
        {pickedRole === null && (
          <div className="login-grid login-grid--roles">
            <RoleButton
              emoji="🎒"
              label="Я ученик"
              description="Вход по логину + пин, VK или коду"
              onClick={() => setPickedRole('child')}
            />
            <RoleButton
              emoji="👨‍👩‍👦"
              label="Я родитель"
              description="Отчёты, оплата, связь с учителем"
              onClick={() => setPickedRole('parent')}
            />
            <RoleButton
              emoji="🎓"
              label="Я учитель"
              description="Классы, прогресс учеников, расписание"
              onClick={() => setPickedRole('teacher')}
            />
          </div>
        )}

        {/* Child login */}
        {pickedRole === 'child' && (
          <div className="login-grid">
            <BackButton onClick={() => setPickedRole(null)} />
            <ChildPinSection navigate={navigate} />
            <ChildVkSection navigate={navigate} />
            <ChildCodeSection navigate={navigate} />
            <ChildGuestSection navigate={navigate} />
          </div>
        )}

        {/* Parent / Teacher login */}
        {(pickedRole === 'parent' || pickedRole === 'teacher') && (
          <div className="login-grid">
            <BackButton onClick={() => setPickedRole(null)} />
            <StaffLogin role={pickedRole} navigate={navigate} />
          </div>
        )}
      </main>

      <footer className="login-foot">
        <small>© 2026 Эдюсон Kids · LXP</small>
      </footer>
    </div>
  )
}

// ─── Role picker button ──────────────────────────────────────────────

function RoleButton({
  emoji,
  label,
  description,
  onClick,
}: {
  emoji: string
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      className="kb-card"
      onClick={onClick}
      aria-label={label}
      style={{
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '20px 24px',
        border: '2px solid var(--border, #e5e2f0)',
        borderRadius: 16,
        background: 'var(--paper, #fffbf3)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 18,
        fontWeight: 600,
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      }}
    >
      <span style={{ fontSize: 36 }}>{emoji}</span>
      <span>
        <div>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-soft, #6b7280)', marginTop: 2 }}>
          {description}
        </div>
      </span>
    </button>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="kb-btn kb-btn--ghost"
      onClick={onClick}
      style={{ gridColumn: '1 / -1', justifySelf: 'start', marginBottom: 8 }}
    >
      ← Назад
    </button>
  )
}

// ─── Child: Login + PIN ──────────────────────────────────────────────

function ChildPinSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [pinLogin, setPinLogin] = useState('')
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinLogin.trim() || pin.length !== 6) {
      setStatus('error')
      setErrMsg('Введи логин и 6-значный пин')
      return
    }
    setStatus('checking')
    // 1. Check locally from roster
    const ok = checkPin(pinLogin.trim(), pin)
    if (ok) {
      saveSession({ role: 'child', name: pinLogin.trim(), login: pinLogin.trim() })
      localStorage.setItem('ek_child_name', pinLogin.trim())
      navigate('/')
      return
    }
    // 2. Try backend
    const r = await apiChildLogin(pinLogin.trim(), pin)
    if (r?.accessToken) {
      saveSession({ role: 'child', name: pinLogin.trim(), login: pinLogin.trim() })
      localStorage.setItem('ek_child_name', pinLogin.trim())
      navigate('/')
      return
    }
    setStatus('error')
    setErrMsg('Неверный логин или пин. Спроси учителя.')
  }

  return (
    <section className="kb-card login-card">
      <div className="login-card-head">
        <span className="eyebrow">Журнал класса</span>
        <h2 className="h2">Войти по логину + пину</h2>
        <p className="lead-s">Логин и пин выдаёт учитель при записи в класс.</p>
      </div>
      <form className="login-code-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин (напр. masha-ivanova-3a)"
          value={pinLogin}
          onChange={(e) => { setStatus('idle'); setPinLogin(e.target.value.trim()) }}
          className="login-code-input"
          autoComplete="username"
          aria-label="Логин ученика"
        />
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Пин (6 цифр)"
          value={pin}
          onChange={(e) => { setStatus('idle'); setPin(e.target.value.replace(/\D/g, '')) }}
          className="login-code-input"
          aria-label="Пин-код"
        />
        <button
          type="submit"
          className="kb-btn kb-btn--lg"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Вхожу…' : '→ Войти'}
        </button>
        {status === 'error' && (
          <div className="kb-state kb-state--error">{errMsg}</div>
        )}
      </form>
    </section>
  )
}

// ─── Child: VK ───────────────────────────────────────────────────────

function ChildVkSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [vkErr, setVkErr] = useState<string | null>(null)
  const vkAppConfigured = vkConfig().appId.length > 0

  const loginWithVk = async () => {
    setVkErr(null)
    try {
      sessionStorage.setItem('ek_vk_next', '/')
      await startVkLogin('child')
    } catch (e) {
      setVkErr((e as Error).message)
    }
  }

  const demoVk = () => {
    saveSession({ role: 'child', name: 'Никита (VK-демо)', login: 'demo-vk' })
    localStorage.setItem('ek_child_name', 'Никита (VK-демо)')
    navigate('/')
  }

  return (
    <section className="kb-card kb-card--feature login-card">
      <div className="login-card-head">
        <span className="eyebrow">VK ID</span>
        <h2 className="h2">Войти через VK</h2>
        <p className="lead-s">Быстро и безопасно.</p>
      </div>
      {!vkAppConfigured && (
        <div className="kb-state kb-state--info login-info">
          <span>🔌</span>
          <span>VK OAuth требует серверный обмен токеном. На превью попробуй «Демо-вход».</span>
        </div>
      )}
      <div className="login-btn-col">
        <button
          className="kb-btn kb-btn--lg"
          onClick={loginWithVk}
          disabled={!vkAppConfigured}
        >
          <VkIcon /> Войти как ученик (VK)
        </button>
        {vkErr && <div className="kb-state kb-state--error">{vkErr}</div>}
        <div className="login-divider"><span>или</span></div>
        <button className="kb-btn kb-btn--lg kb-btn--ghost" onClick={demoVk}>
          🎭 Демо-вход (без VK)
        </button>
      </div>
    </section>
  )
}

// ─── Child: 6-digit code ─────────────────────────────────────────────

function ChildCodeSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [childCode, setChildCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (childCode.length !== 6) { setStatus('error'); return }
    setStatus('checking')
    const r = await apiLoginChildCode(childCode)
    const name = r?.user?.name ?? `Игрок-${childCode.slice(-3)}`
    saveSession({ role: 'child', name, login: childCode })
    localStorage.setItem('ek_child_name', name)
    navigate('/')
  }

  return (
    <section className="kb-card login-card">
      <div className="login-card-head">
        <span className="eyebrow">Мастер-класс</span>
        <h2 className="h2">Код от&nbsp;наставника</h2>
        <p className="lead-s">6 цифр, которые выдал наставник на встрече.</p>
      </div>
      <form className="login-code-form" onSubmit={handleSubmit}>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={childCode}
          onChange={(e) => { setStatus('idle'); setChildCode(e.target.value.replace(/\D/g, '')) }}
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
  )
}

// ─── Child: Guest ────────────────────────────────────────────────────

function ChildGuestSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const quickStart = async () => {
    const r = await apiLoginGuest()
    const name = r?.user?.name ?? 'Гость'
    saveSession({ role: 'child', name, login: 'guest' })
    localStorage.setItem('ek_child_name', name)
    navigate('/')
  }

  return (
    <section className="kb-card login-card login-card--guest">
      <div className="login-card-head">
        <span className="eyebrow">Без регистрации</span>
        <h2 className="h2">Просто посмотреть</h2>
        <p className="lead-s">
          Сохранение работает только в&nbsp;этом браузере. Хороший вариант для первой встречи.
        </p>
      </div>
      <button className="kb-btn kb-btn--lg kb-btn--ghost" onClick={quickStart}>
        👋 Войти как гость
      </button>
    </section>
  )
}

// ─── Staff: Parent / Teacher login ───────────────────────────────────

function StaffLogin({
  role,
  navigate,
}: {
  role: 'parent' | 'teacher'
  navigate: ReturnType<typeof useNavigate>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const isParent = role === 'parent'
  const label = isParent ? 'Кабинет родителя' : 'Кабинет учителя'
  const redirectTo = isParent ? '/parent' : '/teacher'
  const demoName = isParent ? 'Родитель (демо)' : 'Учитель (демо)'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setStatus('error')
      setErrMsg('Введи email и пароль')
      return
    }
    setStatus('checking')
    const r = await apiParentLogin(email.trim(), password.trim())
    if (r?.accessToken) {
      saveSession({ role, name: email.trim(), email: email.trim() })
      navigate(redirectTo)
      return
    }
    setStatus('error')
    setErrMsg('Неверный email или пароль')
  }

  const demoLogin = () => {
    saveSession({ role, name: demoName, email: 'demo@eduson.ru' })
    if (role === 'teacher') {
      localStorage.setItem('ek_admin', '1')
    }
    navigate(redirectTo)
  }

  return (
    <section className="kb-card login-card" style={{ gridColumn: '1 / -1', maxWidth: 480, margin: '0 auto', width: '100%' }}>
      <div className="login-card-head">
        <span className="eyebrow">{label}</span>
        <h2 className="h2">{isParent ? '👨‍👩‍👦 Войти как родитель' : '🎓 Войти как учитель'}</h2>
        <p className="lead-s">Email и пароль, которые использовались при регистрации.</p>
      </div>
      <form className="login-code-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => { setStatus('idle'); setEmail(e.target.value) }}
          className="login-code-input"
          autoComplete="email"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => { setStatus('idle'); setPassword(e.target.value) }}
          className="login-code-input"
          autoComplete="current-password"
          aria-label="Пароль"
        />
        <button
          type="submit"
          className="kb-btn kb-btn--lg"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Вхожу…' : '→ Войти'}
        </button>
        {status === 'error' && (
          <div className="kb-state kb-state--error">{errMsg}</div>
        )}
        <div className="login-divider"><span>или</span></div>
        <button type="button" className="kb-btn kb-btn--lg kb-btn--ghost" onClick={demoLogin}>
          🎭 Демо-вход (без бэкенда)
        </button>
      </form>
    </section>
  )
}

// ─── VK Icon ─────────────────────────────────────────────────────────

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
