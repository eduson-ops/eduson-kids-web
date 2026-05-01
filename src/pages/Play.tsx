import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GameScene from '../components/GameScene'
import { findGame } from '../lib/games'
import { loadAvatar } from '../lib/avatars'
import {
  disposeGame,
  resetGame,
  shakeCamera,
  startTimer,
  subscribe,
  type GameState,
} from '../lib/gameState'
import { SFX, getMuted, setMuted } from '../lib/audio'
import { apiPutProgress } from '../lib/api'
import { warmPyodide } from '../lib/pyodide-executor'
import EscapeMenu from '../components/EscapeMenu'
import Leaderboard from '../components/Leaderboard'
import OnboardingOverlay from '../components/OnboardingOverlay'
import ConfettiOverlay from '../components/ConfettiOverlay'
const ObjectScriptEditor = lazy(() => import('../components/ObjectScriptEditor'))
import PlayScriptRuntime from '../components/PlayScriptRuntime'
import WorldContextMenu from '../components/WorldContextMenu'
import SpawnMenu from '../components/SpawnMenu'
import MobileControls from '../components/MobileControls'
import SayBubble from '../components/SayBubble'
import {
  isEditMode,
  setEditMode,
  subscribeEditMode,
  subscribeFocus,
  setFocusedObject,
  getHoverTarget,
} from '../lib/playEditMode'
import { getAllScriptsForWorld, subscribeWorldScripts } from '../lib/worldScripts'
import { getWorldTargets, getTargetLabel, type WorldTarget } from '../components/worlds/scriptableTargets'
import { getRemovedForWorld, getRecoloredForWorld, resetWorldEdits, subscribeEdits } from '../lib/worldEdits'

/** Задержка после монтирования до отображения сцены (прогрев WebGL). */
const SCENE_READY_DELAY_MS = 250
/** Амплитуда и длительность тряски камеры при победе. */
const WIN_SHAKE_AMPLITUDE = 0.2
const WIN_SHAKE_DURATION = 0.4

export default function Play() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const game = gameId ? findGame(gameId) : undefined
  const [ready, setReady] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [state, setState] = useState<GameState>({
    coins: 0,
    timeMs: 0,
    running: true,
    goal: null,
  })
  const [muted, setMutedState] = useState(getMuted())
  const [edit, setEdit] = useState(isEditMode())
  const [focused, setFocused] = useState<string | null>(null)
  const [scriptedCount, setScriptedCount] = useState(0)
  const avatar = useMemo(() => loadAvatar(), [])

  useEffect(() => subscribeEditMode(setEdit), [])
  useEffect(() => subscribeFocus(setFocused), [])

  const [editsCount, setEditsCount] = useState(() => {
    if (!gameId) return 0
    return getRemovedForWorld(gameId).size + Object.keys(getRecoloredForWorld(gameId)).length
  })
  useEffect(() => {
    const refresh = () => {
      if (!gameId) return
      setEditsCount(getRemovedForWorld(gameId).size + Object.keys(getRecoloredForWorld(gameId)).length)
    }
    return subscribeEdits(refresh)
  }, [gameId])
  useEffect(() => {
    const refresh = () => {
      if (gameId) setScriptedCount(getAllScriptsForWorld(gameId).length)
    }
    refresh()
    return subscribeWorldScripts(refresh)
  }, [gameId])

  // При размонтировании Play — гарантированно выйти из режима редактирования
  useEffect(() => () => setEditMode(false), [])

  // Tab — переключение в Studio (top-down редактор). В Edit-режиме Tab уводит
  // в /studio с возвратом обратно через Esc-меню Studio. Так у учителя/ребёнка
  // одна клавиша для смены «лопатим в мире» ↔ «строим сверху».
  useEffect(() => {
    if (!edit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const t = e.target as HTMLElement | null
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return
      e.preventDefault()
      navigate('/studio')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit, navigate])

  // Q-key приоритет: если игрок наведён на редактируемый объект — открываем
  // его properties / скрипт-редактор. Только если ни один объект не в фокусе,
  // даём Q-событию пройти дальше до SpawnMenu (палитра).
  // Слушаем в capture-фазе и stopImmediatePropagation, чтобы перехватить
  // window-listener в SpawnMenu (он повешен в bubble-фазе).
  useEffect(() => {
    if (!edit) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'q' && e.key !== 'Q') return
      const t = e.target as HTMLElement | null
      if (t?.tagName === 'INPUT' || t?.tagName === 'TEXTAREA') return
      const hover = getHoverTarget()
      if (!hover) return
      const objectId =
        (hover.ref?.userData?.objectId as string | undefined) ?? hover.uuid
      e.preventDefault()
      e.stopImmediatePropagation()
      setFocusedObject(objectId)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [edit])

  useEffect(() => {
    // Прогреваем Pyodide параллельно загрузке сцены — чтобы первый Run в Студии не ждал
    void warmPyodide()
    resetGame()
    startTimer()
    let syncedGoal = false
    const unsub = subscribe((s) => {
      setState(s)
      if (s.goal && !syncedGoal && gameId) {
        syncedGoal = true
        void apiPutProgress(gameId, s.coins, s.timeMs, s.goal.kind === 'win')
        if (s.goal.kind === 'win') shakeCamera(WIN_SHAKE_AMPLITUDE, WIN_SHAKE_DURATION)
      }
    })
    const t = setTimeout(() => setReady(true), SCENE_READY_DELAY_MS)
    return () => {
      clearTimeout(t)
      unsub()
      disposeGame()
    }
  }, [gameId])

  const onRetry = () => {
    resetGame()
    startTimer()
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  if (!game) {
    return (
      <div className="play-missing">
        <h2>Игра не найдена</h2>
        <Link to="/" className="btn">← в лобби</Link>
      </div>
    )
  }

  const worldTargets: WorldTarget[] = gameId
    ? getWorldTargets(gameId, game.category)
    : []
  const focusedTarget = focused ? worldTargets.find((t) => t.id === focused) : null

  return (
    <div className="play-root">
      <div className="play-canvas">
        {ready ? (
          <Suspense fallback={<LoaderHud />}>
            <GameScene game={game} avatar={avatar} />
          </Suspense>
        ) : (
          <LoaderHud />
        )}
      </div>

      <div className="hud-top">
        <button
          className="hud-btn"
          onClick={() => {
            SFX.click()
            navigate('/')
          }}
          aria-label="Назад в лобби"
        >
          ←
        </button>
        <div className="hud-title">{game.title}</div>
        <div className="hud-right">
          <span className="hud-pill" aria-label={`Время: ${formatTime(state.timeMs)}`}><span aria-hidden>⏱</span> {formatTime(state.timeMs)}</span>
          <span className="hud-pill gold" aria-label={`Монеты: ${state.coins}`}><span aria-hidden>💰</span> {state.coins}</span>
          <button
            className={`hud-btn edit-toggle ${edit ? 'active' : ''}`}
            onClick={() => {
              SFX.click()
              setEditMode(!edit)
            }}
            aria-label={edit ? 'Выключить режим редактирования' : 'Включить режим редактирования'}
            aria-pressed={edit}
            title="Редактировать карту: подойди к объекту → Q (скрипт), Tab → Studio (вид сверху)"
          >
            <span aria-hidden>✏️</span> {edit ? 'Выйти' : 'Ред.'}
            {scriptedCount > 0 && <span className="edit-count">{scriptedCount}</span>}
          </button>
          {edit && (
            <button
              className="hud-btn"
              onClick={() => { SFX.click(); navigate('/studio') }}
              title="Studio — редактор сверху (Tab)"
              aria-label="Открыть Studio в режиме сверху"
              style={{ background: 'rgba(107, 92, 231, 0.85)', borderColor: 'rgba(107, 92, 231, 0.9)', color: '#fff' }}
            >
              🏗️ Studio
            </button>
          )}
          <button className="hud-btn" onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'} aria-pressed={muted}>
            <span aria-hidden>{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>

      {edit && (
        <div className="edit-mode-hint">
          <strong>✏️ Режим редактирования</strong>
          <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 13 }}>
            Подойди к объекту → <kbd>Q</kbd> чтобы редактировать · <kbd>Q</kbd> в пустоте → спавн объектов
          </span>
          {editsCount > 0 && !confirmReset && (
            <button
              className="edit-mode-exit"
              style={{ background: 'rgba(255,84,100,0.3)', borderColor: 'rgba(255,84,100,0.6)' }}
              onClick={() => setConfirmReset(true)}
              title="Если карта кажется сломанной — это починит её"
            >
              🔄 Сбросить {editsCount} правки
            </button>
          )}
          {confirmReset && gameId && (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13 }}>Сбросить {editsCount} правок?</span>
              <button
                className="edit-mode-exit"
                style={{ background: 'rgba(255,84,100,0.5)', borderColor: 'rgba(255,84,100,0.8)' }}
                onClick={(e) => { (e.currentTarget as HTMLButtonElement).disabled = true; resetWorldEdits(gameId); location.reload() }}
              >Да</button>
              <button className="edit-mode-exit" onClick={() => setConfirmReset(false)}>Нет</button>
            </span>
          )}
          <button className="edit-mode-exit" onClick={() => setEditMode(false)}>
            Выйти
          </button>
        </div>
      )}

      <div className="hud-help">
        <strong>WASD</strong> — ходить · <strong>Space</strong> — прыжок ·
        <strong> клик</strong> — захват мыши (ESC — отменить)
      </div>

      {/* Hotbar — постоянная подсказка клавиш в Edit-режиме.
          Размещаем над MobileControls (touch-stick), но не закрываем нижнюю
          панель спавна Spawn-палитры (она открывается по Q). */}
      {edit && (
        <div
          className="play-hotbar"
          role="toolbar"
          aria-label="Подсказки клавиш режима редактирования"
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 14,
            background: 'rgba(10,10,20,0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,212,60,0.45)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 50,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          <HotbarKey k="Q" label="Ред. объекта" />
          <span style={{ opacity: 0.3, alignSelf: 'center' }}>·</span>
          <HotbarKey k="Tab" label="Studio ↑" />
          <span style={{ opacity: 0.3, alignSelf: 'center' }}>·</span>
          <HotbarKey k="Esc" label="Отмена" />
          <span style={{ opacity: 0.3, alignSelf: 'center' }}>·</span>
          <HotbarKey k="WASD" label="Движение" />
        </div>
      )}

      <MobileControls />
      <SayBubble />
      <PlayScriptRuntime />
      <EscapeMenu gameTitle={game.title} />
      <Leaderboard gameTitle={game.title} />
      <OnboardingOverlay />

      {state.goal?.kind === 'win' && <ConfettiOverlay />}

      <Suspense>
        {focusedTarget && gameId && (
          <ObjectScriptEditor
            target={{
              scope: 'world',
              worldId: gameId,
              objectId: focusedTarget.id,
              label: getTargetLabel(focusedTarget),
            }}
            onClose={() => setFocusedObject(null)}
          />
        )}

        {/* Universal edit: если ребёнок кликнул по случайному мешу (не на Scriptable),
            focused будет иметь id вида "at_x_y_z" — отобразим редактор для такой точки. */}
        {focused && !focusedTarget && gameId && focused.startsWith('at_') && (
          <ObjectScriptEditor
            target={{
              scope: 'world',
              worldId: gameId,
              objectId: focused,
              label: 'Объект на карте',
            }}
            onClose={() => setFocusedObject(null)}
          />
        )}
      </Suspense>

      {/* Контекстное меню — появляется при клике по ЛЮБОМУ мешу в edit-режиме */}
      {gameId && <WorldContextMenu worldId={gameId} />}
      {/* Q-меню спавна (GMod-style) — Q в Edit-режиме открывает */}
      {gameId && <SpawnMenu worldId={gameId} />}

      {state.goal && (
        <div className="goal-overlay" role="dialog" aria-modal="true" aria-label={state.goal.label}>
          <div className="goal-card">
            <div className={`goal-badge ${state.goal.kind}`}>
              {state.goal.kind === 'win' ? '🏆' : '💀'}
            </div>
            <h2>{state.goal.label}</h2>
            {state.goal.subline && <p>{state.goal.subline}</p>}
            <div className="goal-stats">
              <span>⏱ {formatTime(state.timeMs)}</span>
              <span>💰 {state.coins}</span>
            </div>
            <div className="goal-actions">
              <button onClick={onRetry}>Ещё раз</button>
              <button className="ghost" onClick={() => navigate('/')}>
                В лобби
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HotbarKey({ k, label }: { k: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <kbd style={{
        background: '#FFD43C', color: '#15141B', padding: '2px 7px',
        borderRadius: 5, fontWeight: 700, fontSize: 11,
      }}>{k}</kbd>
      <span style={{ opacity: 0.85 }}>{label}</span>
    </span>
  )
}

function LoaderHud() {
  return (
    <div className="play-loader" role="status" aria-live="polite" aria-label="Загружаем 3D-мир">
      <div className="spinner" aria-hidden />
      <p>Загружаем 3D-мир…</p>
    </div>
  )
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 100) / 10
  const m = Math.floor(total / 60)
  const s = (total % 60).toFixed(1)
  return m > 0 ? `${m}:${s.padStart(4, '0')}` : `${s}s`
}
