import { useMemo, useState } from 'react'
import { PYTHON_API_REFERENCE } from '../lib/python-world-runtime'

interface Props {
  code: string
  onRun?: () => void
  isRunning?: boolean
  error?: string | null
}

/** Minimal token-based syntax highlighter for KubiK Python subset. */
function highlight(line: string): string {
  if (!line) return '&nbsp;'
  // Escape HTML first
  let s = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Comments
  s = s.replace(/(#.*)$/, '<span class="py-cmt">$1</span>')
  // f-strings & strings (after comment escape so # inside strings is handled)
  s = s.replace(/(f"[^"]*")/g, '<span class="py-str">$1</span>')
  s = s.replace(/(f'[^']*')/g, '<span class="py-str">$1</span>')
  s = s.replace(/("[^"]*")/g, '<span class="py-str">$1</span>')
  s = s.replace(/('[^']*')/g, '<span class="py-str">$1</span>')
  // Decorators
  s = s.replace(/(@\w+)/g, '<span class="py-dec">$1</span>')
  // Keywords
  const kw = ['def','return','if','elif','else','for','while','in','range','global','import','class','pass','break','continue','True','False','None','and','or','not','lambda']
  kw.forEach(k => {
    s = s.replace(new RegExp(`\\b(${k})\\b`, 'g'), '<span class="py-kw">$1</span>')
  })
  // KubiK API functions
  const apiFns = PYTHON_API_REFERENCE.map(r => r.fn.split('(')[0])
  apiFns.forEach(f => {
    s = s.replace(new RegExp(`\\b(${f})\\b`, 'g'), '<span class="py-fn">$1</span>')
  })
  // Builtins
  const builtins = ['print','len','range','int','float','str','list','dict','type','abs','round','max','min','sum','enumerate','zip','map','filter']
  builtins.forEach(b => {
    s = s.replace(new RegExp(`\\b(${b})\\b`, 'g'), '<span class="py-blt">$1</span>')
  })
  // Numbers
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="py-num">$1</span>')
  return s
}

export default function PythonPanel({ code, onRun, isRunning, error }: Props) {
  const [showRef, setShowRef] = useState(false)

  const lines = useMemo(() => (code || '# здесь появится Python\n').split('\n'), [code])

  return (
    <div className="py-panel">
      {/* Header */}
      <div className="py-panel-header">
        <span className="py-logo">🐍</span>
        <strong className="py-title">Python</strong>
        <span className="py-subtitle">живой код</span>
        <div className="py-header-actions">
          <button
            className={`py-btn-ref ${showRef ? 'active' : ''}`}
            onClick={() => setShowRef(v => !v)}
            title="API Reference"
          >
            📖 API
          </button>
          {onRun && (
            <button
              className={`py-btn-run ${isRunning ? 'running' : ''}`}
              onClick={onRun}
              disabled={isRunning}
            >
              {isRunning ? '⏳ Выполняется…' : '▶ Запустить'}
            </button>
          )}
        </div>
      </div>

      <div className="py-panel-body">
        {/* Code area with line numbers */}
        <div className="py-code-wrap">
          <div className="py-linenos" aria-hidden>
            {lines.map((_, i) => (
              <div key={i} className="py-lineno">{i + 1}</div>
            ))}
          </div>
          <pre
            className="py-code"
            dangerouslySetInnerHTML={{
              __html: lines.map(highlight).join('\n')
            }}
          />
        </div>

        {/* Error bar */}
        {error && (
          <div className="py-error-bar">
            <span className="py-error-icon">⚠️</span>
            <span className="py-error-text">{error}</span>
          </div>
        )}

        {/* API Reference drawer */}
        {showRef && (
          <div className="py-ref-drawer">
            <div className="py-ref-title">API функции v1.0</div>
            <div className="py-ref-grid">
              {PYTHON_API_REFERENCE.map((item) => (
                <div key={item.fn} className="py-ref-row">
                  <code className="py-ref-fn">{item.fn}</code>
                  <span className="py-ref-desc">{item.desc}</span>
                </div>
              ))}
            </div>
            <div className="py-ref-footer">
              Цвета: red blue green yellow purple orange black white pink cyan
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
