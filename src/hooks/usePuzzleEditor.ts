// Custom hook that encapsulates all state + logic for PuzzleEditor.
// The component itself keeps only JSX after this extraction.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PuzzleTask } from '../lib/puzzles'
import { checkSolution } from '../lib/checkSolution'
import type { CheckResult, RawCommand } from '../lib/types'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import type { MascotMood } from './useMascotMood'

type EditorMode = 'blocks' | 'python'

export interface PuzzleSolvedEvent {
  task: PuzzleTask
  result: CheckResult
  hintsUsed: number
}

const DEFAULT_BLOCKLY_XML =
  '<xml xmlns="https://developers.google.com/blockly/xml"><block type="ek_on_start" deletable="false" x="40" y="40"></block></xml>'

export function usePuzzleEditor(
  task: PuzzleTask,
  onSolved?: (ev: PuzzleSolvedEvent) => void,
  initialMode: EditorMode = 'blocks',
) {
  // ── state ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<EditorMode>(initialMode)
  const [blocklyXml, setBlocklyXml] = useState<string>(
    task.starterBlocks ?? DEFAULT_BLOCKLY_XML,
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

  // ── ref ────────────────────────────────────────────────────────
  // Guard against double-reporting solved events when React renders twice
  const reportedRef = useRef(false)

  // ── derived values ─────────────────────────────────────────────
  const currentCode = mode === 'blocks' ? blocklyPython : pythonCode

  const isPreviewStdout =
    task.check.kind === 'output-match' || task.check.kind === 'uses-feature'

  const passed = checkResult?.passed ?? false

  const moodBadge =
    mood === 'think' ? '?' :
    mood === 'confused' ? '…' :
    mood === 'celebrate' ? '★' :
    mood === 'code' ? '⌨' :
    null

  // ── effects ────────────────────────────────────────────────────

  // Reset all state when the task or initialMode changes
  useEffect(() => {
    setBlocklyXml(task.starterBlocks ?? DEFAULT_BLOCKLY_XML)
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

  // Warm up Pyodide in the background on mount
  useEffect(() => {
    warmPyodide().catch((e) => {
      console.warn('Pyodide warmup failed:', e)
    })
  }, [])

  // ── handlers ───────────────────────────────────────────────────

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
        if (blocklyPython && !pythonCode.trim()) {
          setPythonCode(blocklyPython)
        }
        setMode('python')
      } else {
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

  // ── return ─────────────────────────────────────────────────────
  return {
    // editor mode
    mode,
    switchMode,
    // blockly editor
    blocklyXml,
    handleBlockChange,
    // python editor
    pythonCode,
    setPythonCode,
    // run state
    isRunning,
    runError,
    // check result
    checkResult,
    passed,
    // preview data
    lastCommands,
    lastStdout,
    isPreviewStdout,
    // hints
    revealed,
    handleReveal,
    // mascot
    mood,
    moodBadge,
    // actions
    handleRun,
    handleCheck,
  }
}
