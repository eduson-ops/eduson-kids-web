import { useNavigate, useLocation } from 'react-router-dom'
import { haptic } from '../lib/native'

/**
 * MobileTabBar — нижняя таб-панель для мобильной оболочки (iOS/Android/PWA).
 * 5 главных входов. Видимость контролирует MobileAppShell.
 *
 * Вёрстка инлайном (CSS-vars), чтобы не конфликтовать с kb-bottom-tabs
 * из styles/mobile.css и не трогать чужой CSS.
 */

interface Tab {
  to: string
  emoji: string
  label: string
  match: (p: string) => boolean
}

const BRAND = 'var(--violet)'
const INACTIVE = 'var(--ink-soft)'

const TABS: Tab[] = [
  { to: '/',       emoji: '🏠', label: 'Главная', match: (p) => p === '/' },
  { to: '/learn',  emoji: '📚', label: 'Уроки',   match: (p) => p.startsWith('/learn') },
  { to: '/studio', emoji: '🧱', label: 'Студия',  match: (p) => p.startsWith('/studio') },
  { to: '/play',   emoji: '🎮', label: 'Играть',  match: (p) => p.startsWith('/play') },
  { to: '/profile',emoji: '👤', label: 'Я',       match: (p) => p.startsWith('/profile') || p.startsWith('/me') },
]

export default function MobileTabBar() {
  const nav = useNavigate()
  const loc = useLocation()

  const navRoot: React.CSSProperties = {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    height: 'calc(56px + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    zIndex: 1000,
    fontFamily: 'inherit',
  }

  const onTap = (to: string) => {
    void haptic('selection')
    if (to !== loc.pathname) nav(to)
  }

  return (
    <nav
      className="mobile-tab-bar"
      aria-label="Мобильная навигация"
      style={navRoot}
      role="tablist"
    >
      {TABS.map((t) => {
        const active = t.match(loc.pathname)
        const color = active ? BRAND : INACTIVE
        const btnStyle: React.CSSProperties = {
          flex: 1,
          border: 'none',
          background: 'transparent',
          color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '6px 0',
          fontSize: 11,
          fontWeight: active ? 700 : 500,
          cursor: 'pointer',
          transition: 'color 120ms ease',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }
        return (
          <button
            key={t.to}
            type="button"
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            aria-label={t.label}
            onClick={() => onTap(t.to)}
            style={btnStyle}
          >
            <span aria-hidden style={{ fontSize: 22, lineHeight: 1, filter: active ? 'none' : 'grayscale(0.2)' }}>
              {t.emoji}
            </span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
