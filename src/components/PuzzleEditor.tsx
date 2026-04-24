// Главный компонент решения пазла.
// 2 колонки: редактор (Блоки или Python) + превью (top-down SVG или stdout).

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PuzzleTask } from '../lib/puzzles'
import { checkSolution, simulatePlayer, type CheckResult, type RawCommand } from '../lib/checkSolution'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import HintLadder from './HintLadder'
import Niksel from '../design/mascot/Niksel'
import { MascotMoodOverlay } from '../design/mascot/MascotMoodOverlay'
import type { MascotMood } from '../hooks/useMascotMood'

const PurePythonEditor = lazy(() => import('./PurePythonEditor'))
const BlocklyWorkspace = lazy(() => import('./BlocklyWorkspace'))

type EditorMode = 'blocks' | 'python'

export interface PuzzleSolvedEvent {
  task: PuzzleTask
  result: CheckResult
  hintsUsed: number
}

interface Props {
  task: PuzzleTask
  onSolved?: (ev: PuzzleSolvedEvent) => void
  onNext?: () => void
  initialMode?: EditorMode
}

export default function PuzzleEditor({ task, onSolved, onNext, initialMode = 'blocks' }: Props) {
  const [mode, setMode] = useState<EditorMode>(initialMode)
  const [blocklyXml, setBlocklyXml] = useState<string>(
    task.starterBlocks ??
      '<xml xmlns="https://developers.google.com/blockly/xml"><block type="ek_on_start" deletable="false" x="40" y="40"></block></xml>',
  )
  const [blocklyPython, setBlocklyPython] = useState<string>('')
  const [pythonCode, setPythonCode] = useState<string>(task.starterPython ?? '')
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [lastCommands, setLastCommands] = useState<RawCommand[]>([])
  const [lastStdout, setLastStdout] = useState<string[]>([])
  const [revealed, setRevealed] = useState(0)
  const [mood, setMood] = useState<MascotMood>('think')
  const reportedRef = useRef(false)

  // Сбрасываем состояние когда меняется задача
  useEffect(() => {
    setBlocklyXml(
      task.starterBlocks ??
        '<xml xmlns="https://developers.google.com/blockly/xml"><block type="ek_on_start" deletable="false" x="40" y="40"></block></xml>',
    )
    setBlocklyPython('')
    setPythonCode(task.starterPython ?? '')
    setRunError(null)
    setCheckResult(null)
    setLastCommands([])
    setLastStdout([])
    setRevealed(0)
    setMood('think')
    setMode(initialMode)
    reportedRef.current = false
  }, [task, initialMode])

  // Прогреваем Pyodide при монтировании
  useEffect(() => {
    warmPyodide().catch((e) => {
      console.warn('Pyodide warmup failed:', e)
    })
  }, [])

  const currentCode = mode === 'blocks' ? blocklyPython : pythonCode

  const isPreviewStdout =
    task.check.kind === 'output-match' || task.check.kind === 'uses-feature'

  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setRunError(null)
    setCheckResult(null)
    setMood('code')
    try {
      const cmds = (await runPython(currentCode)) as RawCommand[]
      setLastCommands(cmds)
      const stdout = cmds
        .filter((c) => c.op === 'print')
        .map((c) => (typeof c.text === 'string' ? c.text : ''))
      setLastStdout(stdout)
      setMood('idle')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setRunError(message)
      setMood('confused')
    } finally {
      setIsRunning(false)
    }
  }, [currentCode, isRunning])

  const handleCheck = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setRunError(null)
    setMood('code')
    try {
      const res = await checkSolution(currentCode, task)
      setCheckResult(res)
      if (res.commands) setLastCommands(res.commands)
      if (res.stdout) setLastStdout(res.stdout)
      if (res.passed) {
        setMood('celebrate')
        if (!reportedRef.current) {
          reportedRef.current = true
          onSolved?.({ task, result: res, hintsUsed: revealed })
        }
      } else {
        setMood('confused')
        // Автоматически открываем ещё одну подсказку при провале
        setRevealed((r) => Math.min(r + 1, task.hints.length))
        if (res.error) setRunError(res.error)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setRunError(message)
      setMood('confused')
    } finally {
      setIsRunning(false)
    }
  }, [currentCode, isRunning, task, onSolved, revealed])

  const switchMode = useCallback(
    (next: EditorMode) => {
      if (next === mode) return
      if (next === 'python') {
        // Блоки → Python: переносим сгенерированный код
        if (blocklyPython && !pythonCode.trim()) {
          setPythonCode(blocklyPython)
        } else if (blocklyPython && pythonCode !== blocklyPython) {
          // Оставляем то что уже написал ребёнок; просто переключаем
        }
        setMode('python')
      } else {
        // Python → Блоки: нельзя обратно конвертнуть, спрашиваем
        if (pythonCode.trim() && pythonCode !== blocklyPython) {
          const ok = window.confirm(
            'Переключение на блоки потеряет твой Python-код. Точно переключить?',
          )
          if (!ok) return
        }
        setMode('blocks')
      }
    },
    [mode, blocklyPython, pythonCode],
  )

  const handleReveal = useCallback(() => {
    setRevealed((r) => Math.min(r + 1, task.hints.length))
  }, [task.hints.length])

  const handleBlockChange = useCallback((python: string, xml: string) => {
    setBlocklyXml(xml)
    setBlocklyPython(python)
  }, [])

  const passed = checkResult?.passed ?? false

  return (
    <div className="puzzle-layout">
      {/* Левая колонка: задача + редактор */}
      <aside className="puzzle-editor-panel">
        <header className="puzzle-head">
          <div className="puzzle-head-badges">
            <span className="puzzle-badge">Задача {task.n}/10</span>
            {task.maxBlocks ? (
              <span className="puzzle-badge puzzle-badge--muted">
                ≤ {task.maxBlocks} блоков
              </span>
            ) : null}
          </div>
          <h2 className="puzzle-title">{task.title}</h2>
          <p className="puzzle-prompt">{task.prompt}</p>
        </header>

        <HintLadder hints={task.hints} revealed={revealed} onReveal={handleReveal} />

        <div className="trainer-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'blocks'}
            className={`trainer-tab ${mode === 'blocks' ? 'active' : ''}`}
            onClick={() => switchMode('blocks')}
            type="button"
          >
            🧩 Блоки
          </button>
          <button
            role="tab"
            aria-selected={mode === 'python'}
            className={`trainer-tab ${mode === 'python' ? 'active' : ''}`}
            onClick={() => switchMode('python')}
            type="button"
          >
            🐍 Python
          </button>
        </div>

        <div className={`puzzle-editor-zone puzzle-editor-zone--${mode}`}>
          {mode === 'blocks' ? (
            <Suspense fallback={<div className="puzzle-editor-loading">Готовим блоки…</div>}>
              <BlocklyWorkspace
                key={task.id + ':blocks'}
                initialXml={blocklyXml}
                onChange={handleBlockChange}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<div className="puzzle-editor-loading">Загружаем Python…</div>}>
              <PurePythonEditor
                code={pythonCode}
                onChange={setPythonCode}
                onRun={handleRun}
                isRunning={isRunning}
                error={runError}
              />
            </Suspense>
          )}
        </div>

        <div className="puzzle-actions">
          <button
            className="kb-btn"
            type="button"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Работаю…' : '▶ Запустить'}
          </button>
          <button
            className="kb-btn kb-btn--secondary"
            type="button"
            onClick={handleCheck}
            disabled={isRunning}
          >
            ✓ Проверить
          </button>
        </div>
      </aside>

      {/* Правая колонка: превью */}
      <section className={`puzzle-preview-panel ${passed ? 'is-passed' : ''}`}>
        <div className="puzzle-preview-head">
          <div className="puzzle-preview-mascot">
            <div style={{ position: 'relative', width: 96, height: 112 }}>
              <Niksel pose={mood === 'idle' ? 'idle' : mood === 'celebrate' ? 'celebrate' : mood === 'confused' ? 'confused' : mood === 'code' ? 'code' : 'think'} size={96} />
              <MascotMoodOverlay mood={mood} />
            </div>
          </div>
          <div className="puzzle-preview-status">
            {checkResult ? (
              <>
                <div
                  className={`puzzle-status ${passed ? 'puzzle-status--ok' : 'puzzle-status--fail'}`}
                >
                  {passed ? '✅ Решено!' : '❌ Не решено'}
                </div>
                <div className="puzzle-status-text">{checkResult.message}</div>
                {checkResult.details ? (
                  <div className="puzzle-status-details">{checkResult.details}</div>
                ) : null}
              </>
            ) : runError ? (
              <>
                <div className="puzzle-status puzzle-status--fail">⚠️ Ошибка</div>
                <div className="puzzle-status-text">{runError}</div>
              </>
            ) : (
              <div className="puzzle-status-text">
                Запусти или проверь своё решение.
              </div>
            )}
          </div>
        </div>

        <div className="puzzle-preview-body">
          {isPreviewStdout ? (
            <StdoutView lines={lastStdout} error={runError} />
          ) : (
            <PuzzleTopDownPreview task={task} commands={lastCommands} />
          )}
        </div>

        {passed && (
          <div className="puzzle-reward-bar">
            <span className="puzzle-reward-coin">🪙 +{task.reward.coins}</span>
            <span className="puzzle-reward-xp">⭐ +{task.reward.xp} XP</span>
            {onNext ? (
              <button
                className="kb-btn kb-btn--secondary kb-btn--sm puzzle-reward-next"
                type="button"
                onClick={onNext}
              >
                Следующая →
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Превью: stdout ───────────────────────────────────────────
function StdoutView({ lines, error }: { lines: string[]; error: string | null }) {
  return (
    <div className="puzzle-stdout">
      <div className="puzzle-stdout-head">
        <span>Вывод</span>
        <span className="puzzle-stdout-count">{lines.length} строк</span>
      </div>
      <pre className="puzzle-stdout-body">
        {lines.length === 0 && !error ? (
          <span className="puzzle-stdout-empty">— пока пусто —</span>
        ) : (
          <>
            {lines.map((l, i) => (
              <div key={i} className="puzzle-stdout-line">
                {l || '·'}
              </div>
            ))}
            {error ? (
              <div className="puzzle-stdout-err">⚠ {error}</div>
            ) : null}
          </>
        )}
      </pre>
    </div>
  )
}

// ─── Превью: top-down SVG ────────────────────────────────────
function PuzzleTopDownPreview({
  task,
  commands,
}: {
  task: PuzzleTask
  commands: RawCommand[]
}) {
  // Определяем область просмотра
  const { minX, maxX, minZ, maxZ, cell, goal, blocks, playerFinal, playerStart } = useMemo(() => {
    const startX = 0
    const startZ = 0
    const sim = simulatePlayer(commands, startX, startZ)
    const blocks: Array<{ x: number; y: number; z: number; color: string }> = []
    for (const c of commands) {
      if (c.op === 'place_block') {
        blocks.push({
          x: typeof c.x === 'number' ? c.x : 0,
          y: typeof c.y === 'number' ? c.y : 0,
          z: typeof c.z === 'number' ? c.z : 0,
          color: typeof c.color === 'string' ? c.color : 'red',
        })
      }
    }
    const goal =
      task.check.kind === 'reach-goal'
        ? { x: task.check.goalX, z: task.check.goalZ }
        : null

    // Подсчёт границ
    const xs = [startX, sim.x]
    const zs = [startZ, sim.z]
    if (goal) {
      xs.push(goal.x)
      zs.push(goal.z)
    }
    for (const b of blocks) {
      xs.push(b.x)
      zs.push(b.z)
    }
    if (task.check.kind === 'build-pattern') {
      for (const b of task.check.expectedBlocks) {
        xs.push(b.x)
        zs.push(b.z)
      }
    }

    const minX = Math.min(...xs) - 2
    const maxX = Math.max(...xs) + 2
    const minZ = Math.min(...zs) - 2
    const maxZ = Math.max(...zs) + 2
    const cell = Math.max(18, Math.min(36, Math.floor(280 / Math.max(maxX - minX, maxZ - minZ))))
    return {
      minX,
      maxX,
      minZ,
      maxZ,
      cell,
      goal,
      blocks,
      playerFinal: { x: sim.x, z: sim.z },
      playerStart: { x: startX, z: startZ },
    }
  }, [task, commands])

  const w = (maxX - minX) * cell
  const h = (maxZ - minZ) * cell

  const gx = (x: number) => (x - minX) * cell
  const gz = (z: number) => (z - minZ) * cell

  // Ожидаемые блоки в build-pattern рисуем пунктирными контурами
  const expected =
    task.check.kind === 'build-pattern' ? task.check.expectedBlocks : []

  const colorMap: Record<string, string> = {
    red: '#e15554',
    blue: '#3e87e8',
    green: '#52c987',
    yellow: '#FFD43C',
    purple: '#A06BE0',
    orange: '#FF9454',
    black: '#2a2a3a',
    white: '#fdfdfd',
    pink: '#FFB4C8',
    cyan: '#7FD6E8',
  }
  const colorOf = (c: string) => colorMap[c] ?? '#888'

  return (
    <div className="puzzle-preview-grid">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Превью задачи">
        {/* Сетка */}
        {Array.from({ length: maxX - minX + 1 }, (_, i) => (
          <line
            key={`vx${i}`}
            x1={i * cell}
            y1={0}
            x2={i * cell}
            y2={h}
            stroke="rgba(107, 92, 231, 0.12)"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: maxZ - minZ + 1 }, (_, i) => (
          <line
            key={`vz${i}`}
            x1={0}
            y1={i * cell}
            x2={w}
            y2={i * cell}
            stroke="rgba(107, 92, 231, 0.12)"
            strokeWidth={1}
          />
        ))}

        {/* Origin (0,0) метка */}
        <rect
          x={gx(0)}
          y={gz(0)}
          width={cell}
          height={cell}
          fill="rgba(255, 212, 60, 0.18)"
        />

        {/* Ожидаемые блоки (пунктир) */}
        {expected.map((b, i) => (
          <rect
            key={`exp${i}`}
            x={gx(b.x)}
            y={gz(b.z)}
            width={cell}
            height={cell}
            fill="none"
            stroke={colorOf(b.color ?? 'red')}
            strokeDasharray="4 3"
            strokeWidth={2}
            opacity={0.7}
          />
        ))}

        {/* Поставленные блоки */}
        {blocks.map((b, i) => (
          <rect
            key={`bk${i}`}
            x={gx(b.x) + 2}
            y={gz(b.z) + 2}
            width={cell - 4}
            height={cell - 4}
            fill={colorOf(b.color)}
            rx={4}
            opacity={0.85}
          />
        ))}

        {/* Цель (reach-goal) */}
        {goal && (
          <g>
            <circle
              cx={gx(goal.x) + cell / 2}
              cy={gz(goal.z) + cell / 2}
              r={cell * 0.35}
              fill="#FFD43C"
              opacity={0.85}
              stroke="#15141B"
              strokeWidth={2}
            />
            <text
              x={gx(goal.x) + cell / 2}
              y={gz(goal.z) + cell / 2 + 4}
              textAnchor="middle"
              fontSize={cell * 0.5}
            >
              🎯
            </text>
          </g>
        )}

        {/* Старт */}
        <g>
          <rect
            x={gx(playerStart.x) + cell * 0.2}
            y={gz(playerStart.z) + cell * 0.2}
            width={cell * 0.6}
            height={cell * 0.6}
            rx={6}
            fill="rgba(107, 92, 231, 0.2)"
            stroke="#6B5CE7"
            strokeWidth={2}
          />
          <text
            x={gx(playerStart.x) + cell / 2}
            y={gz(playerStart.z) + cell / 2 + cell * 0.12}
            textAnchor="middle"
            fontSize={cell * 0.35}
            fill="#6B5CE7"
            fontWeight={700}
          >
            S
          </text>
        </g>

        {/* Пингвин — финальная позиция */}
        <text
          x={gx(playerFinal.x) + cell / 2}
          y={gz(playerFinal.z) + cell / 2 + cell * 0.28}
          textAnchor="middle"
          fontSize={cell * 0.78}
        >
          🐧
        </text>
      </svg>
    </div>
  )
}
