import { useEffect, useRef, useState } from 'react'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import {
  PYTHON_API_REFERENCE,
  PYTHON_STARTER_CODE,
} from '../lib/python-world-runtime'
import {
  getState,
  setPythonCode,
  subscribe,
  type EditorState,
} from './editorState'
import { SFX } from '../lib/audio'

/**
 * Python редактор — альтернатива Blockly в Studio ScriptTab.
 * Ребёнок пишет чистый Python, код исполняется через Pyodide Worker,
 * команды применяются к editorState (аналогично блокам).
 */
export default function PythonScriptTab() {
  const [state, setState] = useState<EditorState>(getState())
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'done' | 'error'>('idle')
  const [lastError, setLastError] = useState<string | null>(null)
  const [commands, setCommands] = useState<unknown[]>([])
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => subscribe(setState), [])

  useEffect(() => {
    setStatus('loading')
    warmPyodide()
      .then(() => setStatus('idle'))
      .catch(() => setStatus('error'))
  }, [])

  const run = async () => {
    if (status === 'running' || status === 'loading') return
    setStatus('running')
    setLastError(null)
    SFX.click()
    try {
      const cmds = await runPython(state.pythonCode || PYTHON_STARTER_CODE)
      setCommands(cmds)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setLastError(msg)
      setStatus('error')
    }
  }

  const reset = () => {
    setPythonCode(PYTHON_STARTER_CODE)
    setCommands([])
    setLastError(null)
    setStatus('idle')
  }

  const statusLabel =
    status === 'loading'
      ? '⏳ Загружаю Python…'
      : status === 'running'
        ? '▶ Выполняю…'
        : status === 'done'
          ? `✓ ${commands.length} команд выполнено`
          : status === 'error'
            ? '✕ Ошибка'
            : 'готово к запуску'

  return (
    <div className="studio-python">
      <aside className="python-help">
        <header>
          <span className="py-icon">🐍</span>
          <h3>Python</h3>
        </header>

        <p className="python-intro">
          Настоящий Python управляет 3D-миром. Ребёнок пишет код — мир меняется.
        </p>

        <details open>
          <summary>Движение</summary>
          <ul className="api-list">
            {PYTHON_API_REFERENCE.slice(0, 6).map((r) => (
              <li key={r.fn}>
                <code>{r.fn}</code>
                <small>{r.desc}</small>
              </li>
            ))}
          </ul>
        </details>

        <details>
          <summary>Мир</summary>
          <ul className="api-list">
            {PYTHON_API_REFERENCE.slice(6, 11).map((r) => (
              <li key={r.fn}>
                <code>{r.fn}</code>
                <small>{r.desc}</small>
              </li>
            ))}
          </ul>
        </details>

        <details>
          <summary>Готовые формы</summary>
          <ul className="api-list">
            {PYTHON_API_REFERENCE.slice(13).map((r) => (
              <li key={r.fn}>
                <code>{r.fn}</code>
                <small>{r.desc}</small>
              </li>
            ))}
          </ul>
        </details>

        <div className="python-note">
          <small>
            Python исполняется в Web Worker через Pyodide (CPython ↔ WebAssembly).
            Sandbox — нет доступа к файлам и сети.
          </small>
        </div>
      </aside>

      <section className="python-editor">
        <header className="py-editor-header">
          <span className={`py-status ${status}`}>{statusLabel}</span>
          <div className="py-actions">
            <button className="ghost small" onClick={reset}>
              ↻ Сброс
            </button>
            <button className="primary small" onClick={run} disabled={status === 'loading' || status === 'running'}>
              ▶ Запустить
            </button>
          </div>
        </header>
        <textarea
          ref={taRef}
          className="py-code"
          spellCheck={false}
          value={state.pythonCode || PYTHON_STARTER_CODE}
          onChange={(e) => setPythonCode(e.target.value)}
          placeholder="# пиши Python код..."
        />
      </section>

      <aside className="python-output">
        <header>
          <strong>Вывод</strong>
        </header>
        {lastError && (
          <div className="py-error">
            <strong>Ошибка:</strong>
            <pre>{lastError}</pre>
          </div>
        )}
        {commands.length > 0 && !lastError && (
          <>
            <small className="py-cmd-count">
              Сгенерировано {commands.length} команд:
            </small>
            <ol className="py-cmd-list">
              {commands.slice(0, 30).map((c, i) => (
                <li key={i}>
                  <code>{JSON.stringify(c)}</code>
                </li>
              ))}
              {commands.length > 30 && <li>… и ещё {commands.length - 30}</li>}
            </ol>
          </>
        )}
        {!lastError && commands.length === 0 && (
          <p className="py-empty">Нажми «Запустить» чтобы увидеть команды.</p>
        )}
      </aside>
    </div>
  )
}
