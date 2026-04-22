import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { NikselMini } from '../design/mascot/Niksel'

/**
 * Platform shell v2 — dark left sidenav (Designbook pattern).
 * Sticky 260px sidenav on left, main content shifted right.
 * Game/Studio pages (/play/:id, /studio, /profile) skip this shell.
 */

interface Props {
  children: ReactNode
  activeKey?: NavKey
}

type NavKey = 'hub' | 'learn' | 'play' | 'build' | 'sites' | 'profile' | 'parent' | 'portfolio' | 'designbook' | 'billing' | 'settings'

interface NavItem {
  key: NavKey
  label: string
  to: string
  emoji: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const GROUPS: NavGroup[] = [
  {
    label: 'Обучение',
    items: [
      { key: 'hub',       label: 'Главная',       to: '/',      emoji: '🏠' },
      { key: 'learn',     label: 'Уроки',         to: '/learn', emoji: '📚' },
      { key: 'portfolio', label: 'Мой прогресс',  to: '/me',    emoji: '📊' },
    ],
  },
  {
    label: 'Творчество',
    items: [
      { key: 'play',  label: 'Играть',  to: '/play',   emoji: '🎮' },
      { key: 'build', label: 'Студия',  to: '/studio', emoji: '🧱' },
      { key: 'sites', label: 'Сайты',   to: '/sites',  emoji: '🌐' },
    ],
  },
  {
    label: 'Аккаунт',
    items: [
      { key: 'parent',   label: 'Родителям', to: '/parent',   emoji: '👨‍👩‍👦' },
      { key: 'billing',  label: 'Оплата',    to: '/billing',  emoji: '💳' },
      { key: 'settings', label: 'Настройки', to: '/settings', emoji: '⚙️' },
      { key: 'profile',  label: 'Аватар',    to: '/profile',  emoji: '🎭' },
    ],
  },
  {
    label: 'Бренд',
    items: [
      { key: 'designbook', label: 'Дизайнбук', to: '/designbook', emoji: '🎨' },
    ],
  },
]

export default function PlatformShell({ children, activeKey }: Props) {
  const loc = useLocation()
  const navigate = useNavigate()
  const active = activeKey ?? inferKey(loc.pathname)
  const isAdmin = typeof window !== 'undefined' && (
    localStorage.getItem('ek_admin') === '1' ||
    new URLSearchParams(window.location.search).get('admin') === '1'
  )
  const visibleGroups = isAdmin ? GROUPS : GROUPS.filter((g) => g.label !== 'Бренд')
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
    <div className="brand-shell brand-shell--sidenav">
      <aside className="kb-sidenav">
        <Link to="/" className="kb-shell-brand" aria-label="Эдюсон Kids — главная">
          <NikselMini size={36} />
          <span>Эдюсон</span>
          <span className="kb-shell-brand-kids">Kids</span>
        </Link>

        <div className="kb-sidenav-groups">
          {visibleGroups.map((g) => (
            <div key={g.label} className="kb-sidenav-group">
              <div className="kb-sidenav-label">{g.label}</div>
              {g.items.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`kb-sidenav-link ${active === item.key ? 'active' : ''}`}
                >
                  <span className="kb-sidenav-link-emoji" aria-hidden>{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        {childName ? (
          <div className="kb-sidenav-user">
            <span className="kb-sidenav-user-avatar" aria-hidden>
              {childName.charAt(0).toUpperCase()}
            </span>
            <div className="kb-sidenav-user-body">
              <span className="kb-sidenav-user-name">{childName}</span>
              <span className="kb-sidenav-user-role">УЧЕНИК</span>
            </div>
            <button className="kb-sidenav-user-out" onClick={signOut} title="Выйти">
              ↩
            </button>
          </div>
        ) : (
          <Link to="/login" className="kb-sidenav-login">
            → Войти
          </Link>
        )}

        <div className="kb-sidenav-foot">v1.0 · 2026</div>
      </aside>

      <main className="kb-shell-main">{children}</main>
    </div>
  )
}

function inferKey(path: string): NavKey | undefined {
  if (path === '/') return 'hub'
  if (path.startsWith('/learn')) return 'learn'
  if (path.startsWith('/play')) return 'play'
  if (path.startsWith('/studio') || path.startsWith('/build')) return 'build'
  if (path.startsWith('/sites')) return 'sites'
  if (path.startsWith('/parent')) return 'parent'
  if (path.startsWith('/me')) return 'portfolio'
  if (path.startsWith('/profile')) return 'profile'
  if (path.startsWith('/billing')) return 'billing'
  if (path.startsWith('/settings')) return 'settings'
  if (path.startsWith('/designbook')) return 'designbook'
  return undefined
}
