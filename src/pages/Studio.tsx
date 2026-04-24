import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BuildTab from '../studio/BuildTab'
import ScriptTab from '../studio/ScriptTab'
import TestTab from '../studio/TestTab'
import StudioIntroOverlay from '../components/StudioIntroOverlay'
import StudioTour, { replayTour } from '../components/StudioTour'
import StudioMobileBar from '../components/StudioMobileBar'
import { useIsMobile } from '../hooks/useIsMobile'
import { getState, resetScene, subscribe, selectPart, deletePart, undoEditor, type EditorState } from '../studio/editorState'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import { emitCommands } from '../lib/commandBus'
import type { WorldCommand } from '../lib/python-world-runtime'
import { SFX } from '../lib/audio'
import { NikselMini } from '../design/mascot/Niksel'

type Tab = 'build' | 'script' | 'test'

export default function Studio() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<Tab>('build')
  const [state, setState] = useState<EditorState>(getState())
  const [saved, setSaved] = useState<string>('сохранено')
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [publishToast, setPublishToast] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => subscribe(setState), [])

  // Global keyboard shortcuts: Delete = remove selected, Ctrl+Z = undo, Escape = deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = getState().selectedId
        if (id) deletePart(id)
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undoEditor()
      } else if (e.key === 'Escape') {
        selectPart(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Прогреваем Pyodide сразу — первая попытка Live-режима должна быть быстрой
  useEffect(() => {
    void warmPyodide()
  }, [])

  // ─── Глобальный Live-watcher (персистит между вкладками) ───
  // Раньше жил в ScriptTab — и пока ты на Test, watcher был мёртв.
  // Теперь: что бы ты ни редактировал (Script textarea или Live-оверлей
  // прямо из Test-табa), изменение pythonCode/blocklyPython вызывает debounced run.
  const lastCodeRef = useRef('')
  useEffect(() => {
    if (!state.autoRun) return
    const code = state.scriptMode === 'python' ? state.pythonCode : state.blocklyPython
    if (!code || code === lastCodeRef.current) return
    lastCodeRef.current = code
    const id = window.setTimeout(async () => {
      try {
        const cmds = (await runPython(code)) as unknown as WorldCommand[]
        emitCommands(cmds)
        setScriptError(null)
      } catch (e) {
        setScriptError(e instanceof Error ? e.message : String(e))
      }
    }, 500)
    return () => window.clearTimeout(id)
  }, [state.autoRun, state.blocklyPython, state.pythonCode, state.scriptMode])

  // Когда пользователь впервые приходит на Test-таб с autoRun=true — если
  // watcher уже отрабатывал до монтажа TestTab, команды ушли в пустоту
  // (никто не был подписан). Прогоним текущий код ещё раз.
  const lastReplayRef = useRef('')
  useEffect(() => {
    if (tab !== 'test' || !state.autoRun) return
    const code = state.scriptMode === 'python' ? state.pythonCode : state.blocklyPython
    if (!code || code === lastReplayRef.current) return
    lastReplayRef.current = code
    ;(async () => {
      try {
        const cmds = (await runPython(code)) as unknown as WorldCommand[]
        emitCommands(cmds)
        setScriptError(null)
      } catch (e) {
        setScriptError(e instanceof Error ? e.message : String(e))
      }
    })()
  }, [tab, state.autoRun, state.pythonCode, state.blocklyPython, state.scriptMode])

  useEffect(() => {
    // Индикатор автосохранения: "..." → "сохранено"
    setSaved('сохраняем…')
    const t = setTimeout(() => setSaved('сохранено ✓'), 400)
    return () => clearTimeout(t)
  }, [state])

  const onHome = () => {
    SFX.click()
    navigate('/')
  }

  const onReset = () => setConfirmReset(true)

  const count = state.parts.length

  return (
    <div className="studio-root">
      <header className="studio-header">
        <button className="home-btn" onClick={onHome} aria-label="В лобби" title="Назад в лобби">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <Link to="/" className="studio-brand-lockup" aria-label="Эдюсон Kids — главная">
          <NikselMini size={30} />
          <span>Эдюсон</span>
          <span className="kb-shell-brand-kids">Kids</span>
          <span style={{ opacity: .4, margin: '0 4px' }}>·</span>
          <span style={{ color: 'var(--yellow)' }}>Студия</span>
        </Link>
        <nav className="studio-tabs">
          <button
            className={`studio-tab ${tab === 'build' ? 'active' : ''}`}
            onClick={() => setTab('build')}
          >
            🧱 Строить
          </button>
          <button
            className={`studio-tab ${tab === 'script' ? 'active' : ''}`}
            onClick={() => setTab('script')}
          >
            🧩 Скрипт
          </button>
          <button
            className={`studio-tab ${tab === 'test' ? 'active' : ''}`}
            onClick={() => setTab('test')}
          >
            ▶ Тест
          </button>
        </nav>
        <div className="studio-stats">
          <span title="Объектов в сцене">📦 {count}</span>
          <span className={`save-indicator ${saved.includes('✓') ? 'ok' : ''}`}>{saved}</span>
        </div>
        <div className="studio-actions">
          {scriptError && (
            <span className="studio-error-pill" title={scriptError} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              ⚠ Ошибка
              <button
                onClick={() => setScriptError(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: 12, lineHeight: 1, color: 'inherit', opacity: 0.7 }}
                title="Закрыть"
                aria-label="Закрыть ошибку"
              >✕</button>
            </span>
          )}
          {!confirmReset ? (
            <button className="ghost" onClick={onReset}>Сброс</button>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Стереть всё?</span>
              <button className="ghost" style={{ color: '#ff5464', borderColor: '#ff5464' }} onClick={() => { resetScene(); setConfirmReset(false) }}>Да</button>
              <button className="ghost" onClick={() => setConfirmReset(false)}>Нет</button>
            </span>
          )}
          <button className="ghost" onClick={() => replayTour()} title="Повторить тур по Студии">
            ❓ Тур
          </button>
          <button
            className={`publish${publishToast ? ' publish--toast' : ''}`}
            title="Публикация появится в v1.1"
            aria-label="Опубликовать проект (v1.1)"
            onClick={() => { setPublishToast(true); setTimeout(() => setPublishToast(false), 3000) }}
          >
            {publishToast ? '🚀 Готовим публикацию · Q2 2026' : '📤 Опубликовать'}
          </button>
        </div>
      </header>

      <main
        className="studio-main"
        style={isMobile ? { paddingBottom: 'calc(58px + env(safe-area-inset-bottom))' } : undefined}
      >
        {tab === 'build' && <BuildTab isMobile={isMobile} />}
        {tab === 'script' && <ScriptTab />}
        {tab === 'test' && <TestTab state={state} />}
      </main>

      {isMobile && <StudioMobileBar tab={tab} onTabChange={setTab} />}

      <StudioIntroOverlay />
      <StudioTour />
    </div>
  )
}
