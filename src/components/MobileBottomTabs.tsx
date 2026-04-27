import { Link, useLocation } from 'react-router-dom'

/**
 * MobileBottomTabs — нижняя навигация на мобилке (<768px).
 * 5 главных входов. На десктопе скрыт через CSS.
 */

interface Tab {
  to: string
  emoji: string
  label: string
  match: (p: string) => boolean
}

const TABS: Tab[] = [
  { to: '/',        emoji: '🏠', label: 'Главная', match: (p) => p === '/' },
  { to: '/learn',   emoji: '📚', label: 'Уроки',   match: (p) => p.startsWith('/learn') },
  { to: '/play',    emoji: '🎮', label: 'Играть',  match: (p) => p.startsWith('/play') },
  { to: '/studio',  emoji: '🧱', label: 'Студия',  match: (p) => p.startsWith('/studio') || p.startsWith('/build') },
  { to: '/me',      emoji: '📊', label: 'Прогресс', match: (p) => p.startsWith('/me') || p.startsWith('/profile') || p.startsWith('/settings') },
]

export default function MobileBottomTabs() {
  const loc = useLocation()
  return (
    <nav className="kb-bottom-tabs" aria-label="Мобильная навигация">
      {TABS.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={`kb-bottom-tab${t.match(loc.pathname) ? ' active' : ''}`}
          aria-current={t.match(loc.pathname) ? 'page' : undefined}
        >
          <span className="kb-bottom-tab-emoji" aria-hidden>{t.emoji}</span>
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  )
}
