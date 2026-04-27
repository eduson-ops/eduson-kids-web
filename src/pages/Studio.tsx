import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BuildTab from '../studio/BuildTab'
import ScriptTab from '../studio/ScriptTab'
import TestTab from '../studio/TestTab'
import StudioIntroOverlay from '../components/StudioIntroOverlay'
import StudioLoadingOverlay from '../components/StudioLoadingOverlay'
import StudioTour, { replayTour } from '../components/StudioTour'
import StudioMobileBar from '../components/StudioMobileBar'
import { useIsMobile } from '../hooks/useIsMobile'
import { getState, resetScene, subscribe, selectPart, deletePart, undoEditor, type EditorState } from '../studio/editorState'
import { runPython, warmPyodide } from '../lib/pyodide-executor'
import { emitCommands } from '../lib/commandBus'
import type { WorldCommand } from '../lib/python-world-runtime'
import { SFX } from '../lib/audio'
import { NikselMini } from '../design/mascot/Niksel'
import { useCloudSave } from '../hooks/useCloudSave'
import { useToast } from '../hooks/useToast'
import { projectsApi } from '../lib/projectsApi'

type Tab = 'build' | 'script' | 'test'

export default function Studio() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<Tab>('build')
  const [state, setState] = useState<EditorState>(getState())
  const [scriptError, setScriptError] = useState<string | null>(null)

  // ─── Cloud save wiring (D-10) ──────────────────────────────
  // projectId derived from current Studio session. Null = demo / no backend
  // → fallback to localStorage-only save indicator (already done by editorState.persist).
  // We read it once from URL/localStorage to keep the demo branch deterministic.
  const projectId = useMemo<string | null>(() => {
    try {
      const url = new URL(window.location.href)
      const fromUrl = url.searchParams.get('projectId')
      if (fromUrl) return fromUrl
      return localStorage.getItem('ek_studio_active_project_id')
    } catch {
      return null
    }
  }, [])

  const stateRef = useRef<EditorState>(state)
  stateRef.current = state
  const getContent = useCallback(() => stateRef.current as unknown as Record<string, unknown>, [])
  const cloudSave = useCloudSave(projectId, getContent)
  const { status: cloudStatus, lastSavedAt, lastError: cloudError, manualSave, scheduleAutosave } = cloudSave

  // Local fallback timestamp — when no projectId we still want a "saved locally" hint
  // tied to actual editorState mutations (which `persist()` writes synchronously
  // via debounced timer in editorState.ts).
  const [localSavedAt, setLocalSavedAt] = useState<number | null>(null)

  // Tick "X сек назад" relative timestamps every 5s without re-rendering on
  // every editor change.
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(id)
  }, [])

  const [publishToast, setPublishToast] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { toast: shareToast, show: showShareToast } = useToast()
  const [publishing, setPublishing] = useState(false)

  /**
   * D2-13: Real publish flow.
   *  1. If we have a backend projectId → POST /projects/:id/share-token, copy URL.
   *  2. No projectId → fallback share-link encoder (/share#s=<base64> snapshot of editorState),
   *     consistent with SiteEditor.tsx.
   *  3. On any error → keep the legacy "Q2 2026" toast as ultimate fallback.
   */
  const handlePublish = useCallback(async () => {
    if (publishing) return
    setPublishing(true)
    try {
      if (projectId) {
        const { token, url } = await projectsApi.shareToken(projectId)
        try { await navigator.clipboard.writeText(url) } catch { /* clipboard blocked */ }
        showShareToast(`🔗 Ссылка скопирована: kubik.school/share/${token}`, 'success')
        return
      }
      // Local fallback — same encoder as SiteEditor
      const snap = stateRef.current
      const json = JSON.stringify(snap)
      const enc = btoa(unescape(encodeURIComponent(json)))
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
      const url = `${window.location.origin}${basePath}/share#s=${enc}`
      try { await navigator.clipboard.writeText(url) } catch { /* clipboard blocked */ }
      showShareToast('🔗 Ссылка скопирована — скинь другу!', 'success')
    } catch {
      // Ultimate fallback
      setPublishToast(true)
      setTimeout(() => setPublishToast(false), 3000)
    } finally {
      setPublishing(false)
    }
  }, [projectId, publishing, showShareToast])

  // ─── Loading overlay state (Pyodide + Blockly + Monaco) ───
  // step: 0=initial, 1=pyodide ready, 2=blockly ready, 3=editor ready, 4=hidden
  const [loadingStep, setLoadingStep] = useState(0)
  const pyReadyRef = useRef(false)
  const blocklyReadyRef = useRef(false)
  const editorReadyRef = useRef(false)

  const advanceIfReady = () => {
    const ready =
      (pyReadyRef.current ? 1 : 0) +
      (blocklyReadyRef.current ? 1 : 0) +
      (editorReadyRef.current ? 1 : 0)
    setLoadingStep(ready === 3 ? 4 : ready)
  }

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
    void warmPyodide().then(() => {
      pyReadyRef.current = true
      advanceIfReady()
    })

    // Blockly / Monaco mount lazily внутри ScriptTab. Слушаем custom events,
    // которые ScriptTab dispatch'ит при первом mount; плюс fallback-таймеры,
    // чтобы overlay не залипал, если юзер сидит на Build/Test.
    const onBlockly = () => {
      blocklyReadyRef.current = true
      advanceIfReady()
    }
    const onEditor = () => {
      editorReadyRef.current = true
      advanceIfReady()
    }
    window.addEventListener('ek:studio-blockly-ready', onBlockly)
    window.addEventListener('ek:studio-editor-ready', onEditor)

    // Fallback: chunks обычно подгружаются < 1.5s; даём 1200ms / 1800ms на staged advance
    const t1 = window.setTimeout(onBlockly, 1200)
    const t2 = window.setTimeout(onEditor, 1800)

    return () => {
      window.removeEventListener('ek:studio-blockly-ready', onBlockly)
      window.removeEventListener('ek:studio-editor-ready', onEditor)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
     
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

  // Реальное автосохранение: каждое значимое изменение editorState запускает
  // debounced cloud-save (если projectId есть) ИЛИ обновляет local-saved timestamp
  // (если projectId == null — demo / без бэкенда; editorState.persist() уже пишет в localStorage).
  useEffect(() => {
    if (projectId) {
      scheduleAutosave()
    } else {
      // Local fallback — показываем "сохранено локально" с реальной меткой времени.
      // editorState.persist() само дебаунсит запись, мы просто фиксируем факт.
      setLocalSavedAt(Date.now())
    }
  }, [state, projectId, scheduleAutosave])

  function formatRelative(ts: number | null, currentMs: number): string {
    if (!ts) return ''
    const sec = Math.max(0, Math.round((currentMs - ts) / 1000))
    if (sec < 5) return 'только что'
    if (sec < 60) return `${sec} сек назад`
    const min = Math.round(sec / 60)
    if (min < 60) return `${min} мин назад`
    const hr = Math.round(min / 60)
    return `${hr} ч назад`
  }

  // Compute indicator text + class based on real status
  type SaveBadge = { text: string; cls: 'ok' | 'saving' | 'queued' | 'error' | 'idle' | '' }
  const saveBadge: SaveBadge = (() => {
    if (!projectId) {
      // demo / no backend — local-only
      if (localSavedAt) return { text: `💾 сохранено локально · ${formatRelative(localSavedAt, now)}`, cls: 'ok' }
      return { text: 'локальный режим', cls: '' }
    }
    if (cloudStatus === 'saving') return { text: 'Сохраняем…', cls: 'saving' }
    if (cloudStatus === 'queued') return { text: '⏳ Сохраним когда появится сеть', cls: 'queued' }
    if (cloudStatus === 'error') return { text: '⚠️ Ошибка сохранения', cls: 'error' }
    if (cloudStatus === 'saved') return { text: `✓ Сохранено · ${formatRelative(lastSavedAt, now)}`, cls: 'ok' }
    return { text: '', cls: 'idle' }
  })()


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
          {saveBadge.text && (
            <span
              className={`save-indicator ${saveBadge.cls}`}
              title={cloudError ?? undefined}
            >
              {saveBadge.text}
              {saveBadge.cls === 'error' && (
                <button
                  onClick={() => void manualSave()}
                  style={{
                    marginLeft: 6,
                    background: 'none',
                    border: '1px solid currentColor',
                    borderRadius: 4,
                    padding: '0 6px',
                    fontSize: 11,
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                  title="Повторить сохранение"
                >
                  ↻
                </button>
              )}
            </span>
          )}
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
            title={projectId ? 'Скопировать share-ссылку на проект' : 'Локальная ссылка (без бэкенда)'}
            aria-label="Опубликовать проект — получить share-ссылку"
            onClick={handlePublish}
            disabled={publishing}
          >
            {publishing
              ? '⏳ Публикуем…'
              : publishToast
                ? '🚀 Готовим публикацию · Q2 2026'
                : '📤 Опубликовать'}
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

      <StudioLoadingOverlay step={loadingStep} />
      <StudioIntroOverlay />
      <StudioTour />
      {shareToast && (
        <div key={shareToast.key} className={`kb-ui-toast kb-ui-toast--${shareToast.kind}`}>
          {shareToast.msg}
        </div>
      )}
    </div>
  )
}
