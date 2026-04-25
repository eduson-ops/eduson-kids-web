import { Link, useLocation } from 'react-router-dom'
import Niksel from '../design/mascot/Niksel'

/**
 * 404 — branded "page not found" stub.
 *
 * Shows confused Niksel + the path the user tried to reach,
 * with a single CTA back to /. Used as the catch-all in App.tsx.
 *
 * Design tokens via .brand-shell — matches Login/Hub palette
 * (paper bg, ink text, violet accent). Mobile-first via flex column.
 */
export default function NotFound() {
  const location = useLocation()
  const attemptedUrl = location.pathname + location.search

  return (
    <div className="brand-shell" style={shellStyle}>
      <main style={mainStyle}>
        <Niksel pose="confused" size={160} />

        <span className="eyebrow" style={{ marginTop: 24 }}>
          Ошибка 404
        </span>
        <h1 className="h1" style={h1Style}>
          Не&nbsp;нашёл такую страницу
        </h1>

        <p className="lead" style={leadStyle}>
          Возможно, ссылка устарела или ты ошибся при наборе адреса.
        </p>

        <code style={urlStyle} aria-label="Адрес, который ты пытался открыть">
          {attemptedUrl}
        </code>

        <Link to="/" style={ctaStyle} className="kb-btn kb-btn--primary">
          ← На&nbsp;главную
        </Link>
      </main>
    </div>
  )
}

const shellStyle: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px',
  background:
    'radial-gradient(circle at 30% 20%, var(--violet-soft, #E4E0FC) 0%, var(--paper, #FFFBF3) 60%)',
}

const mainStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: 560,
  width: '100%',
  gap: 4,
}

const h1Style: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 8,
  fontSize: 'clamp(1.6rem, 4vw + 0.5rem, 2.4rem)',
  lineHeight: 1.15,
}

const leadStyle: React.CSSProperties = {
  marginBottom: 16,
  color: 'var(--ink-soft, #2B2A36)',
  fontSize: 'clamp(1rem, 1.5vw + 0.5rem, 1.125rem)',
  maxWidth: 460,
}

const urlStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  borderRadius: 10,
  background: 'var(--paper-2, #F4EFE3)',
  color: 'var(--ink, #15141B)',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '0.9rem',
  marginBottom: 28,
  wordBreak: 'break-all',
  maxWidth: '100%',
  border: '1px solid var(--paper-3, #ECE4D2)',
}

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 28px',
  borderRadius: 14,
  background: 'var(--violet, #6B5CE7)',
  color: 'var(--paper, #FFFBF3)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 48,
  minWidth: 200,
  boxShadow: '0 8px 24px rgba(107,92,231,0.28)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
}
