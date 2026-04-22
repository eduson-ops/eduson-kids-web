import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PYTHON_API_REFERENCE } from '../lib/python-world-runtime'

interface Props {
  code: string
  onRun?: () => void
  isRunning?: boolean
  error?: string | null
}

type TokenKind = 'kw' | 'str' | 'num' | 'cmt' | 'dec' | 'fn' | 'blt' | 'name' | 'ws'
interface Token {
  kind: TokenKind
  text: string
}

const PY_KEYWORDS = new Set([
  'def','return','if','elif','else','for','while','in','range','global','import','class','pass','break','continue','True','False','None','and','or','not','lambda'
])
const PY_BUILTINS = new Set([
  'print','len','range','int','float','str','list','dict','type','abs','round','max','min','sum','enumerate','zip','map','filter'
])
const PY_API_FNS = new Set(PYTHON_API_REFERENCE.map(r => r.fn.split('(')[0]))

/**
 * Tokenize a single line of Python-subset code into non-overlapping tokens.
 * Pure function — returns plain text per token. React will escape on render,
 * so there is no way for attribute strings like `class="py-kw"` to leak into
 * the DOM, which was the pre-refactor bug (chained .replace over HTML markup).
 */
function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = line.length
  while (i < n) {
    const c = line[i]
    // Comment: rest of line
    if (c === '#') {
      tokens.push({ kind: 'cmt', text: line.slice(i) })
      i = n
      break
    }
    // String literal (incl. f-strings)
    if (c === '"' || c === "'" || ((c === 'f' || c === 'F') && (line[i + 1] === '"' || line[i + 1] === "'"))) {
      const start = i
      if (c === 'f' || c === 'F') i++
      const quote = line[i]
      i++
      while (i < n && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < n) i += 2
        else i++
      }
      if (i < n) i++ // consume closing quote
      tokens.push({ kind: 'str', text: line.slice(start, i) })
      continue
    }
    // Decorator
    if (c === '@' && /[A-Za-z_]/.test(line[i + 1] ?? '')) {
      const start = i
      i++
      while (i < n && /[A-Za-z0-9_]/.test(line[i])) i++
      tokens.push({ kind: 'dec', text: line.slice(start, i) })
      continue
    }
    // Number
    if (/[0-9]/.test(c)) {
      const start = i
      while (i < n && /[0-9.]/.test(line[i])) i++
      tokens.push({ kind: 'num', text: line.slice(start, i) })
      continue
    }
    // Identifier / keyword / builtin / api fn
    if (/[A-Za-z_]/.test(c)) {
      const start = i
      while (i < n && /[A-Za-z0-9_]/.test(line[i])) i++
      const word = line.slice(start, i)
      let kind: TokenKind = 'name'
      if (PY_KEYWORDS.has(word)) kind = 'kw'
      else if (PY_API_FNS.has(word)) kind = 'fn'
      else if (PY_BUILTINS.has(word)) kind = 'blt'
      tokens.push({ kind, text: word })
      continue
    }
    // Whitespace / punctuation — collect runs as plain text (kind 'ws')
    const start = i
    while (i < n) {
      const ch = line[i]
      if (ch === '#' || ch === '"' || ch === "'" || ch === '@') break
      if (/[A-Za-z0-9_]/.test(ch)) break
      i++
    }
    if (i === start) i++ // safety
    tokens.push({ kind: 'ws', text: line.slice(start, i) })
  }
  return tokens
}

function classFor(kind: TokenKind): string | undefined {
  switch (kind) {
    case 'kw': return 'py-kw'
    case 'str': return 'py-str'
    case 'num': return 'py-num'
    case 'cmt': return 'py-cmt'
    case 'dec': return 'py-dec'
    case 'fn': return 'py-fn'
    case 'blt': return 'py-blt'
    default: return undefined
  }
}

function renderLine(line: string, lineIdx: number): ReactNode {
  if (!line) return ' '
  const tokens = tokenize(line)
  return tokens.map((t, i) => {
    const cls = classFor(t.kind)
    const key = `${lineIdx}-${i}`
    return cls
      ? <span key={key} className={cls}>{t.text}</span>
      : <Fragment key={key}>{t.text}</Fragment>
  })
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
          <pre className="py-code">
            {lines.map((line, i) => (
              <Fragment key={i}>
                {renderLine(line, i)}
                {i < lines.length - 1 ? '\n' : null}
              </Fragment>
            ))}
          </pre>
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
