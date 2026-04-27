import { useEffect, useRef, useState } from 'react'
import { getState, setAutoRun, setPythonCode, setScriptMode, subscribe } from '../studio/editorState'
import { subscribeCommands } from '../lib/commandBus'
import type { WorldCommand } from '../lib/python-world-runtime'

/**
 * LiveOverlay — UI-оверлей поверх 3D-сцены в Test-табе.
 *   ⚡ LIVE статус + счётчик прогонов + последняя команда + быстрый выкл
 *   ✏ Встроенный Python-редактор: меняй код не выходя из Test-таба
 *   🟡 Flash-рамка на 600мс при каждом прогоне
 *
 * Редактирование в overlay автоматически:
 *   1. setScriptMode('python')  — чтобы глобальный watcher ловил именно pythonCode
 *   2. setPythonCode(value)     — Studio-watcher подхватит через debounce 500мс
 */
export default function LiveOverlay() {
  const [live, setLive] = useState(getState().autoRun)
  const [runCount, setRunCount] = useState(0)
  const [lastCmd, setLastCmd] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [code, setCode] = useState(getState().pythonCode)
  const flashTimer = useRef<number | undefined>(undefined)

  // Синхронизация с editorState (autoRun + внешние правки кода)
  useEffect(
    () =>
      subscribe((s) => {
        setLive(s.autoRun)
        // Синкуем код, только если редактор закрыт — иначе затираем пользовательский ввод
        setCode((prev) => (editorOpen ? prev : s.pythonCode))
      }),
    [editorOpen]
  )

  // Счётчик прогонов и последняя команда — из commandBus
  useEffect(() => {
    return subscribeCommands((cmds) => {
      setRunCount((n) => n + 1)
      const last = cmds[cmds.length - 1]
      if (last) setLastCmd(formatCmd(last))
      setFlash(true)
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(false), 600)
    })
  }, [])

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    },
    []
  )

  if (!live) return null

  const applyCode = (next: string) => {
    setCode(next)
    // Гарантируем что watcher в Studio смотрит на pythonCode
    if (getState().scriptMode !== 'python') setScriptMode('python')
    setPythonCode(next)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd+Enter → немедленный re-apply (по сути просто перезаписываем тем же значением,
    // что форсирует watcher. Полезно когда код тот же, но ты хочешь повторить).
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      // Hack: меняем пробел в конце, чтобы watcher сработал заново
      const bumped = code.endsWith(' ') ? code.slice(0, -1) : code + ' '
      applyCode(bumped)
      // И возвращаем чистым через кадр
      requestAnimationFrame(() => applyCode(code))
    }
    // Tab → 4 пробела
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = code.slice(0, start) + '    ' + code.slice(end)
      applyCode(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }

  return (
    <>
      {/* Рамка-вспышка на всю сцену */}
      <div className={`live-frame ${flash ? 'flash' : ''}`} aria-hidden />

      {/* Блок статуса */}
      <div className={`live-overlay ${flash ? 'flash' : ''} ${editorOpen ? 'expanded' : ''}`}>
        <div className="live-top">
          <span className="live-pulse" aria-hidden>⚡</span>
          <strong>LIVE режим</strong>
          <button
            className={`live-edit-btn ${editorOpen ? 'active' : ''}`}
            onClick={() => setEditorOpen((v) => !v)}
            aria-label={editorOpen ? 'Закрыть редактор Python' : 'Открыть редактор Python'}
            aria-expanded={editorOpen}
          >
            <span aria-hidden>✏</span>
          </button>
          <button
            className="live-toggle-btn"
            onClick={() => setAutoRun(false)}
            aria-label="Выключить LIVE режим"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <div className="live-stats">
          <span>
            Прогонов: <b>{runCount}</b>
          </span>
        </div>

        {lastCmd && (
          <>
            <div className="live-label">Последняя команда</div>
            <div className="live-cmd">{lastCmd}</div>
          </>
        )}

        {editorOpen ? (
          <>
            <div className="live-label">🐍 Python (авто-запуск через 0.5с)</div>
            <textarea
              className="live-editor"
              value={code}
              onChange={(e) => applyCode(e.target.value)}
              onKeyDown={handleKey}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              wrap="off"
              aria-label="Python-код для авто-запуска"
              placeholder={PLACEHOLDER}
            />
            <div className="live-hint">
              <kbd>Tab</kbd> — отступ · <kbd>Ctrl+Enter</kbd> — повторить прогон
            </div>
          </>
        ) : (
          <div className="live-hint">
            Блоки / код → мир в реальном времени.
            <br />
            <button className="live-inline-btn" onClick={() => setEditorOpen(true)}>
              <span aria-hidden>✏</span> открыть редактор Python
            </button>
          </div>
        )}
      </div>
    </>
  )
}

const PLACEHOLDER = `# Пиши Python тут — мир обновится через 0.5с
say("Привет!")
tower(5, x=0, z=-3, color="red")
square(3, x=-5, z=-5, color="cyan")
add_score(10)
`

/** Человекочитаемое описание команды для overlay */
function formatCmd(cmd: WorldCommand): string {
  switch (cmd.op) {
    case 'place_block':
      return `🧱 ${cmd.color} в (${cmd.x}, ${cmd.y}, ${cmd.z})`
    case 'remove_block':
      return `❌ убрать (${cmd.x}, ${cmd.y}, ${cmd.z})`
    case 'paint_block':
      return `🎨 ${cmd.color} в (${cmd.x}, ${cmd.y}, ${cmd.z})`
    case 'player_move':
      return `🏃 сдвиг (${cmd.dx.toFixed(1)}, ${cmd.dz.toFixed(1)})`
    case 'player_turn':
      return `↩ поворот на ${cmd.degrees}°`
    case 'player_jump':
      return `🦘 прыжок`
    case 'player_say':
      return `💬 «${cmd.text.slice(0, 24)}${cmd.text.length > 24 ? '…' : ''}»`
    case 'set_sky':
      return `🌤 небо: ${cmd.preset}`
    case 'set_gravity':
      return `🌍 гравитация ${cmd.g}`
    case 'add_score':
      return `💰 +${cmd.n} очков`
    case 'set_score':
      return `📊 счёт = ${cmd.n}`
    case 'wait':
      return `⏱ пауза ${cmd.seconds}s`
    case 'on_touch':
      return `📡 касание: ${cmd.block}`
    case 'tower_section':
      return `🗼 секция: ${cmd.type}`
    case 'randomize_tower':
      return `🎲 башня (seed=${cmd.seed})`
    case 'set_timer':
      return `⏰ таймер ${cmd.seconds}s`
    default:
      return '—'
  }
}
