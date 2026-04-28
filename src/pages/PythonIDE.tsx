import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import type { RawCommand } from '../lib/types'
import { HISTORY_LIMIT } from '../lib/constants'

const SmartPythonEditor = lazy(() => import('../components/SmartPythonEditor'))

const CODE_KEY = 'ek_python_ide_code'
const HISTORY_KEY = 'ek_python_ide_history'

interface Snippet {
  name: string
  code: string
}

const SNIPPETS: Snippet[] = [
  {
    name: 'Hello World',
    code: 'print("Привет, мир!")\n',
  },
  {
    name: 'Цикл до 10',
    code: 'for i in range(1, 11):\n    print(i)\n',
  },
  {
    name: 'Список чисел',
    code: 'nums = [1, 2, 3, 4, 5]\nfor n in nums:\n    print(n * 2)\n',
  },
  {
    name: 'Функция приветствия',
    code: 'def greet(name):\n    print(f"Привет, {name}!")\n\ngreet("Саша")\ngreet("Лена")\n',
  },
  {
    name: 'Простой калькулятор',
    code:
      'def calc(a, op, b):\n    if op == "+":\n        return a + b\n    if op == "-":\n        return a - b\n    if op == "*":\n        return a * b\n    if op == "/":\n        return a / b\n    return 0\n\nprint(calc(10, "+", 5))\nprint(calc(10, "-", 3))\nprint(calc(4, "*", 6))\n',
  },
  {
    name: 'Фибоначчи',
    code:
      'def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a)\n        a, b = b, a + b\n\nfib(10)\n',
  },
  {
    name: 'Пирамида из звёздочек',
    code: 'for i in range(1, 6):\n    print("*" * i)\n',
  },
]

interface HistoryEntry {
  at: number
  lines: number
  error: string | null
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return []
    return arr.filter((x): x is HistoryEntry =>
      typeof x === 'object' &&
      x !== null &&
      typeof (x as HistoryEntry).at === 'number' &&
      typeof (x as HistoryEntry).lines === 'number',
    )
  } catch {
    return []
  }
}

function persistHistory(h: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, HISTORY_LIMIT)))
  } catch {
    /* quota */
  }
}

export default function PythonIDE() {
  const [code, setCode] = useState<string>(() => {
    try {
      return localStorage.getItem(CODE_KEY) ?? 'print("Привет, мир!")\n'
    } catch {
      return 'print("Привет, мир!")\n'
    }
  })
  const [output, setOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [snippetOpen, setSnippetOpen] = useState(false)
  const snippetBtnRef = useRef<HTMLDivElement | null>(null)

  // Автосейв кода
  useEffect(() => {
    try {
      localStorage.setItem(CODE_KEY, code)
    } catch {
      /* quota */
    }
  }, [code])

  // Warm pyodide
  useEffect(() => {
    warmPyodide().catch((e) => console.warn('Pyodide warmup:', e))
  }, [])

  // Закрытие dropdown по клику вне
  useEffect(() => {
    if (!snippetOpen) return
    const handler = (ev: MouseEvent) => {
      if (snippetBtnRef.current && !snippetBtnRef.current.contains(ev.target as Node)) {
        setSnippetOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [snippetOpen])

  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setError(null)
    setOutput([])
    try {
      const cmds = (await runPython(code)) as RawCommand[]
      const lines: string[] = []
      let stderr = ''
      for (const c of cmds) {
        if (c.op === 'print' && typeof c.text === 'string') {
          lines.push(c.text)
        } else if (c.op === 'stderr' && typeof c.text === 'string') {
          stderr += (stderr ? '\n' : '') + c.text
        }
      }
      setOutput(lines)
      if (stderr) setError(stderr)
      const entry: HistoryEntry = { at: Date.now(), lines: lines.length, error: stderr || null }
      const nextHistory = [entry, ...history].slice(0, HISTORY_LIMIT)
      setHistory(nextHistory)
      persistHistory(nextHistory)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      const entry: HistoryEntry = { at: Date.now(), lines: 0, error: msg }
      const nextHistory = [entry, ...history].slice(0, HISTORY_LIMIT)
      setHistory(nextHistory)
      persistHistory(nextHistory)
    } finally {
      setIsRunning(false)
    }
  }, [code, isRunning, history])

  const handleClear = useCallback(() => {
    setOutput([])
    setError(null)
  }, [])

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(CODE_KEY, code)
    } catch {
      /* quota */
    }
  }, [code])

  const insertSnippet = useCallback((s: Snippet) => {
    setCode(s.code)
    setSnippetOpen(false)
    setOutput([])
    setError(null)
  }, [])

  return (
    <PlatformShell activeKey="python-ide">
      <div className="python-ide-layout">
        <div className="python-ide-toolbar">
          <button
            className="kb-btn"
            type="button"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Работаю…' : '▶ Запустить'}
            <span className="python-ide-hk">Ctrl+Enter</span>
          </button>
          <button
            className="kb-btn kb-btn--ghost kb-btn--sm"
            type="button"
            onClick={handleClear}
          >
            🧹 Очистить
          </button>
          <button
            className="kb-btn kb-btn--ghost kb-btn--sm"
            type="button"
            onClick={handleSave}
            title="Сохранить в браузер (localStorage)"
          >
            💾 Сохранить
          </button>
          <div className="python-ide-snippets" ref={snippetBtnRef}>
            <button
              className="kb-btn kb-btn--ghost kb-btn--sm"
              type="button"
              onClick={() => setSnippetOpen((v) => !v)}
              aria-expanded={snippetOpen}
            >
              📚 Примеры ▾
            </button>
            {snippetOpen && (
              <div className="python-ide-snippet-dropdown" role="menu">
                {SNIPPETS.map((s) => (
                  <button
                    key={s.name}
                    className="python-ide-snippet-item"
                    type="button"
                    role="menuitem"
                    onClick={() => insertSnippet(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="python-ide-toolbar-spacer" />
          <div className="python-ide-history" title="Последние запуски">
            {history.length > 0
              ? `↻ Последний запуск: ${new Date(history[0]!.at).toLocaleTimeString()}`
              : '↻ Ещё не запускалось'}
          </div>
        </div>

        <div className="python-ide-split">
          <div className="python-ide-editor">
            <Suspense fallback={<div className="py-editor-loading">Загружаем редактор…</div>}>
              <SmartPythonEditor
                code={code}
                onChange={setCode}
                onRun={handleRun}
                isRunning={isRunning}
                error={error}
              />
            </Suspense>
          </div>
          <div className="python-ide-output">
            <div className="python-ide-output-head">
              <span>Вывод</span>
              <span className="python-ide-output-count">
                {output.length} строк {error ? '· ⚠ ошибка' : ''}
              </span>
            </div>
            <pre className="python-ide-output-body">
              {output.length === 0 && !error ? (
                <span className="python-ide-output-empty">
                  — пока пусто — нажми «Запустить»
                </span>
              ) : (
                <>
                  {output.map((l, i) => (
                    <div key={i} className="python-ide-output-line">
                      {l || '·'}
                    </div>
                  ))}
                  {error && (
                    <div className="python-ide-output-err">⚠ {error}</div>
                  )}
                </>
              )}
            </pre>
          </div>
        </div>
      </div>
    </PlatformShell>
  )
}
