import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { loadSession, clearSession, CHILD_NAME_KEY, ADMIN_KEY } from '../lib/auth'
import { NikselMini } from '../design/mascot/Niksel'
import NikselChat from './NikselChat'
import StreakWidget from './StreakWidget'
// MobileBottomTabs заменён на MobileTabBar, монтируемый из MobileAppShell на уровне Routes.
// Оставляем sidebar только для десктопа.

/**
 * Platform shell v3 — role-based sidenav.
 * Child / Parent / Teacher / Designbook nav group sets.
 */

const SIDENAV_KEY = 'ek_sidenav_collapsed_v1'

interface Props {
  children: ReactNode
  activeKey?: NavKey
}

export type NavKey =
  | 'hub'
  | 'learn'
  | 'play'
  | 'build'
  | 'sites'
  | 'profile'
  | 'parent'
  | 'portfolio'
  | 'designbook'
  | 'billing'
  | 'settings'
  | 'teacher'
  | 'teacher-classes'
  | 'leagues'
  | 'trainers'
  | 'python-ide'
  | 'chat'
  | 'room'
  | 'admin'

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

const GROUPS_CHILD: NavGroup[] = [
  {
    label: 'Обучение',
    items: [
      { key: 'hub',        label: 'Главная',       to: '/',           emoji: '🏠' },
      { key: 'learn',      label: 'Уроки',         to: '/learn',      emoji: '📚' },
      { key: 'trainers',   label: 'Тренажёры',     to: '/trainers',   emoji: '🏋️' },
      { key: 'python-ide', label: 'Python IDE',    to: '/python-ide', emoji: '🐍' },
      { key: 'portfolio',  label: 'Мой прогресс',  to: '/me',         emoji: '📊' },
      { key: 'leagues',    label: 'Лиги',          to: '/leagues',    emoji: '🏆' },
    ],
  },
  {
    label: 'Творчество',
    items: [
      { key: 'play',  label: 'Играть', to: '/play',   emoji: '🎮' },
      { key: 'build', label: 'Студия', to: '/studio', emoji: '🧱' },
      { key: 'sites', label: 'Сайты',  to: '/sites',  emoji: '🌐' },
    ],
  },
  {
    label: 'Аккаунт',
    items: [
      { key: 'billing',  label: 'Оплата',    to: '/billing',  emoji: '💳' },
      { key: 'settings', label: 'Настройки', to: '/settings', emoji: '⚙️' },
      { key: 'profile',  label: 'Аватар',    to: '/profile',  emoji: '🎭' },
    ],
  },
  {
    label: 'Чат',
    items: [
      { key: 'chat', label: 'Чат', to: '/chat', emoji: '💬' },
    ],
  },
]

const GROUPS_PARENT: NavGroup[] = [
  {
    label: 'Кабинет родителя',
    items: [
      { key: 'hub',      label: 'Главная',    to: '/',         emoji: '🏠' },
      { key: 'parent',   label: 'Кабинет',    to: '/parent',   emoji: '👨‍👩‍👦' },
      { key: 'billing',  label: 'Оплата',     to: '/billing',  emoji: '💳' },
      { key: 'settings', label: 'Настройки',  to: '/settings', emoji: '⚙️' },
    ],
  },
  {
    label: 'Чат',
    items: [
      { key: 'chat', label: 'Чат', to: '/chat', emoji: '💬' },
    ],
  },
]

const GROUPS_TEACHER: NavGroup[] = [
  {
    label: 'Кабинет учителя',
    items: [
      { key: 'hub',             label: 'Главная',         to: '/',                emoji: '🏠' },
      { key: 'teacher',         label: 'Консоль',         to: '/teacher',         emoji: '🎓' },
      { key: 'teacher-classes', label: 'Классы',          to: '/teacher/classes', emoji: '📋' },
      { key: 'admin',           label: 'Администрирование', to: '/admin',         emoji: '👑' },
    ],
  },
  {
    label: 'Учебные материалы',
    items: [
      { key: 'learn',    label: 'Уроки',     to: '/learn',    emoji: '📚' },
      { key: 'trainers', label: 'Тренажёры', to: '/trainers', emoji: '🏋️' },
    ],
  },
  {
    label: 'Коммуникация',
    items: [
      { key: 'chat', label: 'Чат', to: '/chat', emoji: '💬' },
    ],
  },
  {
    label: 'Аккаунт',
    items: [
      { key: 'settings', label: 'Настройки', to: '/settings', emoji: '⚙️' },
    ],
  },
]

const GROUPS_DESIGNBOOK: NavGroup[] = [
  {
    label: 'Бренд',
    items: [
      { key: 'designbook', label: 'Дизайнбук', to: '/designbook', emoji: '🎨' },
    ],
  },
]

function roleBadge(role: string): string {
  if (role === 'child') return 'УЧЕНИК'
  if (role === 'parent') return 'РОДИТЕЛЬ'
  if (role === 'teacher') return 'УЧИТЕЛЬ'
  return 'КУРАТОР'
}

export default function PlatformShell({ children, activeKey }: Props) {
  const loc = useLocation()
  const navigate = useNavigate()
  const active = activeKey ?? inferKey(loc.pathname)

  const isAdmin =
    typeof window !== 'undefined' &&
    (localStorage.getItem(ADMIN_KEY) === '1' ||
      new URLSearchParams(window.location.search).get('admin') === '1')

  const session = loadSession()
  const role = session?.role ?? null

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SIDENAV_KEY) === '1'
  })

  // Re-read session when route changes
  const [sessionName, setSessionName] = useState<string | null>(null)
  const [sessionRole, setSessionRole] = useState<string | null>(null)
  useEffect(() => {
    const s = loadSession()
    setSessionName(s?.name ?? localStorage.getItem(CHILD_NAME_KEY))
    setSessionRole(s?.role ?? null)
  }, [loc.pathname])

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v
      try { localStorage.setItem(SIDENAV_KEY, next ? '1' : '0') } catch { /* quota */ }
      return next
    })
  }

  const signOut = () => {
    clearSession()
    localStorage.removeItem(CHILD_NAME_KEY)
    navigate('/login')
  }

  // Determine visible nav groups — STRICTLY by session.role, not by isAdmin flag.
  // (Earlier `isAdmin || role === 'teacher'` caused parents/students to see teacher
  // nav if ek_admin was set in localStorage from a previous demo session.)
  let groups: NavGroup[]
  if (role === 'teacher' || role === 'admin' || role === 'school_admin') {
    groups = GROUPS_TEACHER
  } else if (role === 'parent') {
    groups = GROUPS_PARENT
  } else if (loc.pathname.startsWith('/designbook')) {
    groups = GROUPS_DESIGNBOOK
  } else {
    groups = GROUPS_CHILD
  }

  // Hide admin-only items unless user is actually an admin or has the dev flag
  const showAdmin = isAdmin || role === 'admin' || role === 'school_admin'
  if (!showAdmin) {
    groups = groups.map((g) => ({
      ...g,
      items: g.items.filter((item) => item.key !== 'admin'),
    })).filter((g) => g.items.length > 0)
  }

  const displayName = sessionName ?? session?.name ?? null
  const displayRole = sessionRole ?? role ?? null

  return (
    <div className={`brand-shell brand-shell--sidenav${collapsed ? ' brand-shell--collapsed' : ''}`}>
      <a href="#kb-main-content" className="kb-skip-link">
        Перейти к содержимому
      </a>
      <aside className={`kb-sidenav${collapsed ? ' kb-sidenav--collapsed' : ''}`} aria-label="Основная навигация">
        <Link to="/" className="kb-shell-brand" aria-label="Эдюсон Kids — главная">
          <NikselMini size={36} />
          {!collapsed && (
            <>
              <span>Эдюсон</span>
              <span className="kb-shell-brand-kids">Kids</span>
            </>
          )}
        </Link>

        <button
          className="kb-sidenav-collapse-btn"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Раскрыть меню' : 'Свернуть меню'}
          title={collapsed ? 'Раскрыть меню' : 'Свернуть меню'}
        >
          {collapsed ? '»' : '«'}
        </button>

        <div className="kb-sidenav-groups">
          {groups.map((g) => (
            <div key={g.label} className="kb-sidenav-group">
              {!collapsed && <div className="kb-sidenav-label">{g.label}</div>}
              {g.items.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`kb-sidenav-link ${active === item.key ? 'active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  aria-current={active === item.key ? 'page' : undefined}
                >
                  <span className="kb-sidenav-link-emoji" aria-hidden>{item.emoji}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {displayName ? (
          <div className="kb-sidenav-user">
            <span className="kb-sidenav-user-avatar" aria-hidden>
              {displayName.charAt(0).toUpperCase()}
            </span>
            {!collapsed && (
              <>
                <div className="kb-sidenav-user-body">
                  <span className="kb-sidenav-user-name">{displayName}</span>
                  <span className="kb-sidenav-user-role">
                    {displayRole ? roleBadge(displayRole) : 'ГОСТЬ'}
                  </span>
                </div>
                <button className="kb-sidenav-user-out" onClick={signOut} title="Выйти" aria-label="Выйти из аккаунта">
                  ↩
                </button>
              </>
            )}
          </div>
        ) : !collapsed ? (
          <Link to="/login" className="kb-sidenav-login">
            → Войти
          </Link>
        ) : (
          <Link to="/login" className="kb-sidenav-login" title="Войти">
            →
          </Link>
        )}

        {!collapsed && (
          <div className="kb-sidenav-foot">
            <div className="kb-sidenav-foot-links">
              <Link to="/legal/privacy">Политика</Link>
              <Link to="/legal/terms">Оферта</Link>
              <Link to="/legal/contacts">Контакты</Link>
            </div>
            <div className="kb-sidenav-foot-ver">v1.0 · 2026</div>
          </div>
        )}
      </aside>

      <main className="kb-shell-main" id="kb-main-content" tabIndex={-1}>{children}</main>
      <StreakWidget />
      <NikselChat />
    </div>
  )
}

function inferKey(path: string): NavKey | undefined {
  if (path === '/') return 'hub'
  if (path.startsWith('/teacher/classes')) return 'teacher-classes'
  if (path.startsWith('/teacher')) return 'teacher'
  if (path.startsWith('/admin')) return 'admin'
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
  if (path.startsWith('/leagues')) return 'leagues'
  if (path.startsWith('/trainers')) return 'trainers'
  if (path.startsWith('/python-ide')) return 'python-ide'
  if (path.startsWith('/chat')) return 'chat'
  if (path.startsWith('/room/')) return 'room'
  return undefined
}
