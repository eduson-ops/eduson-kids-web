import { Suspense, useEffect, useMemo, useState } from 'react'
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
import ObjectScriptEditor from '../components/ObjectScriptEditor'
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
} from '../lib/playEditMode'
import { getAllScriptsForWorld, subscribeWorldScripts } from '../lib/worldScripts'
import { getWorldTargets, getTargetLabel, type WorldTarget } from '../components/worlds/scriptableTargets'
import { getRemovedForWorld, getRecoloredForWorld, resetWorldEdits, subscribeEdits } from '../lib/worldEdits'

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
        if (s.goal.kind === 'win') shakeCamera(0.2, 0.4)
      }
    })
    const t = setTimeout(() => setReady(true), 250)
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
          <span className="hud-pill">⏱ {formatTime(state.timeMs)}</span>
          <span className="hud-pill gold">💰 {state.coins}</span>
          <button
            className={`hud-btn edit-toggle ${edit ? 'active' : ''}`}
            onClick={() => {
              SFX.click()
              setEditMode(!edit)
            }}
            aria-label="Режим редактирования"
            title="Редактировать карту: спавн объектов (Q), перекраска, скрипты на объектах"
          >
            ⚡ {edit ? 'Выкл' : 'Ред.'}
            {scriptedCount > 0 && <span className="edit-count">{scriptedCount}</span>}
          </button>
          <button className="hud-btn" onClick={toggleMute} aria-label="Звук">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {edit && (
        <div className="edit-mode-hint">
          <strong>⚡ Режим редактирования.</strong>
          Клик по объекту → меню (покрасить / дублировать / убрать / скрипт). <kbd>Q</kbd> — спавн пропсов.
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
                onClick={() => { resetWorldEdits(gameId); location.reload() }}
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

      <MobileControls />
      <SayBubble />
      <PlayScriptRuntime />
      <EscapeMenu gameTitle={game.title} />
      <Leaderboard gameTitle={game.title} />
      <OnboardingOverlay />

      {state.goal?.kind === 'win' && <ConfettiOverlay />}

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

      {/* Контекстное меню — появляется при клике по ЛЮБОМУ мешу в edit-режиме */}
      {gameId && <WorldContextMenu worldId={gameId} />}
      {/* Q-меню спавна (GMod-style) — Q в Edit-режиме открывает */}
      {gameId && <SpawnMenu worldId={gameId} />}

      {state.goal && (
        <div className="goal-overlay">
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

function LoaderHud() {
  return (
    <div className="play-loader">
      <div className="spinner" />
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
