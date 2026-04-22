import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import BlocklyWorkspace from '../components/BlocklyWorkspace'
import PythonPanel from '../components/PythonPanel'

// Monaco весит ~1MB — лениво грузим только для L3 Python режима
const PurePythonEditor = lazy(() => import('../components/PurePythonEditor'))
import {
  getState,
  setAutoRun,
  setBlocklyXml,
  setLuaCode,
  setPythonCode,
  setScriptMode,
  subscribe,
  type EditorState,
  type ScriptMode,
} from './editorState'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import { emitCommands } from '../lib/commandBus'
import type { WorldCommand } from '../lib/python-world-runtime'
import { SFX } from '../lib/audio'

/**
 * ScriptTab — трёхрежимный редактор программирования.
 *  L1 «Блоки»          — чистый Blockly на весь экран (9-10 лет)
 *  L2 «Блоки + Python» — Blockly слева + живой Python справа, мост (10-12 лет)
 *  L3 «Python»         — полноценный текстовый редактор (12-15 лет)
 *
 * Переключатель режимов — главный акцент вверху, прогрессия подчёркивается стрелками.
 * Подсказки вынесены в выдвижной help-drawer (по клику на ? справа сверху) —
 * это освобождает место и Blockly получает полную ширину.
 */
export default function ScriptTab() {
  const [state, setState] = useState<EditorState>(getState())
  const [helpOpen, setHelpOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<string | null>(null)
  const resultTimer = useRef<number | undefined>(undefined)

  useEffect(() => subscribe(setState), [])

  useEffect(() => {
    warmPyodide().catch((err) => console.warn('Pyodide warmup:', err))
  }, [])

  useEffect(() => {
    return () => { if (resultTimer.current) window.clearTimeout(resultTimer.current) }
  }, [])

  const handleSwitch = (mode: ScriptMode) => {
    SFX.click()
    setScriptMode(mode)
    setRunError(null)
    setRunResult(null)
  }

  const handleRun = useCallback(async (code: string, silent = false) => {
    if (!code.trim()) return
    if (!silent) setIsRunning(true)
    setRunError(null)
    if (!silent) setRunResult(null)
    try {
      const cmds = (await runPython(code)) as unknown as WorldCommand[]
      emitCommands(cmds)
      if (!silent) {
        setRunResult(`Готово: ${cmds.length} ${pluralizeCmd(cmds.length)}. Переключись на «▶ Тест» чтобы увидеть.`)
        SFX.coin()
        if (resultTimer.current) window.clearTimeout(resultTimer.current)
        resultTimer.current = window.setTimeout(() => setRunResult(null), 6000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setRunError(cleanPyError(msg))
      if (!silent) SFX.lose()
    } finally {
      if (!silent) setIsRunning(false)
    }
  }, [])

  // Авто-запуск теперь живёт в Studio.tsx (персистит между вкладками),
  // чтобы Live-режим работал когда ребёнок уже на Test-табе и пишет код
  // прямо в Live-оверлее.

  const mode = state.scriptMode

  return (
    <div className="studio-script-v2">
      <div className="script-top-row">
        <ScriptModeSwitcher current={mode} onSwitch={handleSwitch} />
        <label className="autorun-toggle" title="Автоматически прогонять блоки в Test на каждое изменение">
          <input
            type="checkbox"
            checked={state.autoRun}
            onChange={(e) => setAutoRun(e.target.checked)}
          />
          <span>⚡ Живой режим</span>
          {state.autoRun && <span className="autorun-badge">ON</span>}
        </label>
      </div>

      <div className={`script-body script-body--${mode}`}>
        {/* Blocks mode — Blockly full-screen */}
        {mode === 'blocks' && (
          <section className="script-blocks-hero">
            <BlocklyWorkspace
              initialXml={state.blocklyXml}
              onChange={(python, xml) => {
                setBlocklyXml(xml)
                setLuaCode(python)
              }}
            />
            <FloatingHint>
              Собирай свою программу из цветных блоков. Когда готово — нажми <strong>«▶ Тест»</strong>.
            </FloatingHint>
          </section>
        )}

        {/* Bridge mode — Blockly + live Python preview + Run */}
        {mode === 'bridge' && (
          <section className="script-bridge">
            <div className="script-bridge-left">
              <BlocklyWorkspace
                initialXml={state.blocklyXml}
                onChange={(python, xml) => {
                  setBlocklyXml(xml)
                  setLuaCode(python)
                }}
              />
            </div>
            <div className="script-bridge-right">
              <PythonPanel
                code={state.luaCode}
                onRun={() => handleRun(state.luaCode)}
                isRunning={isRunning}
                error={runError}
              />
              <div className="script-bridge-note">
                👀 Это <strong>Python</strong> — то же самое, что ты собрал из блоков.
                Внимательно посмотри: функции, отступы, кавычки. Скоро ты научишься писать такое сам.
              </div>
              {runResult && <div className="script-run-ok">✓ {runResult}</div>}
            </div>
          </section>
        )}

        {/* Python mode — full editor (Monaco, lazy-loaded) */}
        {mode === 'python' && (
          <section className="script-python-full">
            <Suspense fallback={<div className="py-editor-loading">Загружаем редактор…</div>}>
              <PurePythonEditor
                code={state.pythonCode}
                onChange={setPythonCode}
                onRun={() => handleRun(state.pythonCode)}
                isRunning={isRunning}
                error={runError}
              />
            </Suspense>
            {runResult && <div className="script-run-ok script-run-ok--floating">✓ {runResult}</div>}
          </section>
        )}
      </div>

      <button
        className={`script-help-fab ${helpOpen ? 'open' : ''}`}
        onClick={() => setHelpOpen((v) => !v)}
        title="Подсказка"
        aria-label="Подсказка"
      >
        {helpOpen ? '×' : '?'}
      </button>

      {helpOpen && <HelpDrawer mode={mode} onClose={() => setHelpOpen(false)} />}
    </div>
  )
}

function ScriptModeSwitcher({
  current,
  onSwitch,
}: {
  current: ScriptMode
  onSwitch: (m: ScriptMode) => void
}) {
  return (
    <div className="script-mode-switcher">
      <div className="script-mode-rail">
        <ModeChip
          mode="blocks"
          icon="🧱"
          label="Блоки"
          sub="L1 · начальный"
          active={current === 'blocks'}
          onClick={() => onSwitch('blocks')}
        />
        <Arrow active={current !== 'blocks'} />
        <ModeChip
          mode="bridge"
          icon="🌉"
          label="Блоки + Python"
          sub="L2 · мост"
          active={current === 'bridge'}
          onClick={() => onSwitch('bridge')}
        />
        <Arrow active={current === 'python'} />
        <ModeChip
          mode="python"
          icon="🐍"
          label="Python"
          sub="L3 · свобода"
          active={current === 'python'}
          onClick={() => onSwitch('python')}
        />
      </div>
    </div>
  )
}

function ModeChip({
  icon,
  label,
  sub,
  active,
  onClick,
}: {
  mode: ScriptMode
  icon: string
  label: string
  sub: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button className={`mode-chip ${active ? 'active' : ''}`} onClick={onClick} type="button">
      <span className="mode-chip-icon">{icon}</span>
      <span className="mode-chip-text">
        <strong className="mode-chip-label">{label}</strong>
        <small className="mode-chip-sub">{sub}</small>
      </span>
    </button>
  )
}

function Arrow({ active }: { active: boolean }) {
  return <span className={`mode-arrow ${active ? 'passed' : ''}`}>→</span>
}

function FloatingHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="script-floating-hint">
      <span className="hint-dot">💡</span>
      <span>{children}</span>
    </div>
  )
}

function HelpDrawer({ mode, onClose }: { mode: ScriptMode; onClose: () => void }) {
  return (
    <aside className="script-help-drawer">
      <header>
        <strong>Подсказки</strong>
        <button className="ghost" onClick={onClose}>Закрыть</button>
      </header>
      {mode === 'blocks' && <BlocksHelp />}
      {mode === 'bridge' && <BridgeHelp />}
      {mode === 'python' && <PythonHelp />}
    </aside>
  )
}

function BlocksHelp() {
  return (
    <>
      <p className="help-intro">
        Собирай программу из блоков. Каждый блок — это команда.
      </p>
      <details open>
        <summary>🎬 События</summary>
        <p>«при запуске» — отсюда начинается программа. Вкладывай остальные блоки внутрь.</p>
      </details>
      <details>
        <summary>🎮 Движение</summary>
        <p>«идти вперёд», «повернуть налево», «прыгнуть». Из этих блоков получаются маршруты.</p>
      </details>
      <details>
        <summary>🔁 Повторы</summary>
        <p>«повторить N раз» — повторяет всё, что внутри. Короче, чем копировать блоки.</p>
      </details>
      <details>
        <summary>🧠 Условия</summary>
        <p>«если монет ≥ X тогда…» — проверяет состояние и решает, что делать дальше.</p>
      </details>
      <details>
        <summary>▶ Как проверить?</summary>
        <p>Переключайся на вкладку <strong>«▶ Тест»</strong> — твой скрипт запустится в живой игре.</p>
      </details>
    </>
  )
}

function BridgeHelp() {
  return (
    <>
      <p className="help-intro">
        Слева — блоки, справа — <strong>настоящий Python</strong>. Каждому блоку соответствует строчка кода.
      </p>
      <details open>
        <summary>🌉 Зачем этот режим?</summary>
        <p>
          Ты уже умеешь собирать программу из блоков. Теперь учишься читать код.
          Перетащи любой блок и посмотри, как меняется Python справа.
        </p>
      </details>
      <details>
        <summary>🐍 Что такое Python?</summary>
        <p>
          Это популярный язык программирования. На нём пишут игры, сайты, нейросети.
          В школе его сдают на ЕГЭ — у тебя будет фора.
        </p>
      </details>
      <details>
        <summary>▶ Запустить</summary>
        <p>Кнопка «▶ Запустить» вверху панели — прогонит Python в игровом мире прямо здесь.</p>
      </details>
    </>
  )
}

function PythonHelp() {
  return (
    <>
      <p className="help-intro">
        Ты в свободном режиме. Пиши Python как настоящий разработчик.
      </p>
      <details open>
        <summary>📖 Справочник API</summary>
        <p>Нажми кнопку «📖 API» в редакторе — увидишь список функций для управления миром.</p>
      </details>
      <details>
        <summary>⌨️ Горячие клавиши</summary>
        <p>Tab — сдвиг. Enter — автоотступ. Коды ошибок подсвечиваются внизу.</p>
      </details>
      <details>
        <summary>🎯 Примеры</summary>
        <p>
          <code>say("Привет!")</code> · <code>tower(5, color="red")</code> ·<br />
          <code>for i in range(4):</code><br />
          <code>&nbsp;&nbsp;&nbsp;&nbsp;move_forward(2)</code><br />
          <code>&nbsp;&nbsp;&nbsp;&nbsp;turn_right()</code>
        </p>
      </details>
    </>
  )
}

function pluralizeCmd(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'команда'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'команды'
  return 'команд'
}

function cleanPyError(msg: string): string {
  const lines = msg.split('\n').filter(Boolean)
  const last = lines[lines.length - 1] || msg
  return last.length > 240 ? last.slice(0, 240) + '…' : last
}
