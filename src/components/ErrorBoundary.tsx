import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * ErrorBoundary — wraps the app's route tree so that a single crash
 * doesn't leave the user staring at a white screen. Shows a friendly
 * Russian fallback with a reload button and an optional "report" button.
 *
 * Uses CSS vars from the brand theme (--brand-primary, --brand-accent)
 * so white-labelled tenants inherit the correct palette.
 *
 * Note: error boundaries only catch render-time / lifecycle errors in
 * their subtree. They do NOT catch async handlers, timers, or event
 * handlers — those still need try/catch in place.
 */

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO: ship to backend telemetry endpoint when available.
     
    console.error('[ErrorBoundary] caught', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleReport = (): void => {
    const { error } = this.state
     
    console.warn('[ErrorBoundary] user-reported error', {
      message: error?.message,
      stack: error?.stack,
      url: typeof window !== 'undefined' ? window.location.href : null,
      ts: new Date().toISOString(),
    })
    // Future: POST to /api/v1/errors
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--brand-bg, #FFFBF3)',
          fontFamily: 'var(--brand-font, "Nunito", system-ui, sans-serif)',
          color: 'var(--ink, #15141b)',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            padding: '32px 24px',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 20px 48px rgba(21,20,27,0.08)',
            border: '1px solid rgba(21,20,27,0.06)',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }} aria-hidden>
            🧩
          </div>
          <h1 style={{ fontSize: 24, margin: '0 0 12px', fontWeight: 800 }}>
            Что-то пошло не так — мы уже работаем над этим.
          </h1>
          <p style={{ fontSize: 15, margin: '0 0 24px', color: 'var(--ink-soft, #5a5867)' }}>
            Попробуй перезагрузить страницу. Если не поможет — напиши нам, и мы
            разберёмся.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                background: 'var(--brand-primary, #ffd84c)',
                color: 'var(--brand-ink, #15141b)',
              }}
            >
              Перезагрузить
            </button>
            <button
              type="button"
              onClick={this.handleReport}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                border: '1px solid rgba(21,20,27,0.12)',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                background: 'transparent',
                color: 'var(--ink, #15141b)',
              }}
            >
              Сообщить
            </button>
          </div>
          {this.state.error?.message && (
            <details style={{ marginTop: 20, textAlign: 'left' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 12,
                  color: 'var(--ink-soft, #5a5867)',
                }}
              >
                Технические детали
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: 'rgba(21,20,27,0.04)',
                  borderRadius: 8,
                  fontSize: 11,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--ink-soft, #5a5867)',
                }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
