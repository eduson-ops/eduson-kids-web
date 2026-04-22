import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { NikselMini } from '../design/mascot/Niksel'

/**
 * Platform shell — wraps all non-game pages with brand chrome.
 * Sticky nav + brand lockup + main content area.
 * Game/Studio pages (/play/:id, /studio) skip this shell.
 */

interface Props {
  children: ReactNode
  activeKey?: 'hub' | 'learn' | 'play' | 'build' | 'sites' | 'profile' | 'parent' | 'portfolio'
}

const NAV = [
  { key: 'hub',       label: 'Главная',    to: '/' },
  { key: 'learn',     label: 'Уроки',      to: '/learn' },
  { key: 'play',      label: 'Играть',     to: '/play' },
  { key: 'build',     label: 'Студия',     to: '/studio' },
  { key: 'sites',     label: 'Сайты',      to: '/sites' },
  { key: 'portfolio', label: 'Портфолио',  to: '/me' },
  { key: 'parent',    label: 'Родителям',  to: '/parent' },
  { key: 'profile',   label: 'Профиль',    to: '/profile' },
] as const

export default function PlatformShell({ children, activeKey }: Props) {
  const loc = useLocation()
  const navigate = useNavigate()
  const active = activeKey ?? inferKey(loc.pathname)
  const [childName, setChildName] = useState<string | null>(null)

  useEffect(() => {
    setChildName(localStorage.getItem('ek_child_name'))
  }, [loc.pathname])

  const signOut = () => {
    localStorage.removeItem('ek_child_name')
    localStorage.removeItem('ek_child_code')
    setChildName(null)
    navigate('/login')
  }

  return (
    <div className="brand-shell">
      <nav className="kb-shell-nav">
        <Link to="/" className="kb-shell-brand" aria-label="Eduson Kids — главная">
          <NikselMini size={36} />
          <span>Эдусон</span>
          <span className="kb-shell-brand-kids">Kids</span>
        </Link>
        <div className="kb-shell-nav-links">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`kb-shell-nav-link ${active === item.key ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        {childName ? (
          <div className="kb-shell-user">
            <span className="kb-shell-user-avatar" aria-hidden>
              {childName.charAt(0).toUpperCase()}
            </span>
            <span className="kb-shell-user-name">{childName}</span>
            <button className="kb-shell-user-out" onClick={signOut} title="Выйти">
              ↩
            </button>
          </div>
        ) : (
          <Link to="/login" className="kb-btn kb-btn--sm">Войти</Link>
        )}
      </nav>
      <main className="kb-shell-main">{children}</main>
    </div>
  )
}

function inferKey(path: string): Props['activeKey'] {
  if (path === '/') return 'hub'
  if (path.startsWith('/learn')) return 'learn'
  if (path.startsWith('/play')) return 'play'
  if (path.startsWith('/studio') || path.startsWith('/build')) return 'build'
  if (path.startsWith('/sites')) return 'sites'
  if (path.startsWith('/parent')) return 'parent'
  if (path.startsWith('/me')) return 'portfolio'
  if (path.startsWith('/profile')) return 'profile'
  return undefined
}
