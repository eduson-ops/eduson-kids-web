import { useEffect, useMemo, useState } from 'react'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import {
  PYTHON_API_REFERENCE,
  PYTHON_STARTER_CODE,
} from '../lib/python-world-runtime'
import {
  getState,
  setPythonCode,
  setScriptMode,
  subscribe,
  type EditorState,
} from './editorState'
import { SFX } from '../lib/audio'
import CodeMirrorPythonEditor from '../components/CodeMirrorPythonEditor'

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

  // D-14: визуальный сигнал что код можно сгенерировать из блоков
  const blocksHavePython = useMemo(() => {
    const lines = (state.blocklyPython || '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
    return lines.length > 0
  }, [state.blocklyPython])

  const isPythonModified = useMemo(() => {
    const py = state.pythonCode || ''
    const gen = state.blocklyPython || ''
    if (!py.trim()) return false
    return py !== gen
  }, [state.pythonCode, state.blocklyPython])

  const restoreFromBlocks = () => {
    if (!state.blocklyPython) return
    setPythonCode(state.blocklyPython)
    SFX.click()
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
        {blocksHavePython && isPythonModified && (
          <div className="python-syncbar">
            <span className="python-syncbar-icon">🧱</span>
            <span className="python-syncbar-text">
              Этот код можно сгенерировать из блоков
            </span>
            <button
              className="python-syncbar-btn"
              onClick={restoreFromBlocks}
              type="button"
              title="Заменить текущий Python тем, что собрано из блоков"
            >
              ↺ Восстановить из блоков
            </button>
            <button
              className="python-syncbar-back"
              onClick={() => { SFX.click(); setScriptMode('blocks') }}
              type="button"
              title="Вернуться к блокам"
            >
              ← К блокам
            </button>
          </div>
        )}
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
        <div className="py-code-cm">
          <CodeMirrorPythonEditor
            code={state.pythonCode || PYTHON_STARTER_CODE}
            onChange={(value) => setPythonCode(value)}
            onRun={run}
            isRunning={status === 'running' || status === 'loading'}
            error={lastError}
          />
        </div>
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
