import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GameScene from '../components/GameScene'
import { findGame } from '../lib/games'
import { loadAvatar } from '../lib/avatars'
import {
  disposeGame,
  resetGame,
  startTimer,
  subscribe,
  type GameState,
} from '../lib/gameState'
import { SFX, getMuted, setMuted } from '../lib/audio'
import { apiPutProgress } from '../lib/api'
import EscapeMenu from '../components/EscapeMenu'
import Leaderboard from '../components/Leaderboard'
import OnboardingOverlay from '../components/OnboardingOverlay'

export default function Play() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const game = gameId ? findGame(gameId) : undefined
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<GameState>({
    coins: 0,
    timeMs: 0,
    running: true,
    goal: null,
  })
  const [muted, setMutedState] = useState(getMuted())
  const avatar = useMemo(() => loadAvatar(), [])

  useEffect(() => {
    if (!localStorage.getItem('ek_child_name')) {
      localStorage.setItem('ek_child_name', 'Гость')
    }
    resetGame()
    startTimer()
    let syncedGoal = false
    const unsub = subscribe((s) => {
      setState(s)
      // Когда цель достигнута — синкуем прогресс на бэк (если онлайн)
      if (s.goal && !syncedGoal && gameId) {
        syncedGoal = true
        void apiPutProgress(gameId, s.coins, s.timeMs, s.goal.kind === 'win')
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
          <button className="hud-btn" onClick={toggleMute} aria-label="Звук">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="hud-help">
        <strong>WASD</strong> — ходить · <strong>Space</strong> — прыжок ·
        <strong> клик</strong> — захват мыши (ESC — отменить)
      </div>

      <EscapeMenu gameTitle={game.title} />
      <Leaderboard gameTitle={game.title} />
      <OnboardingOverlay />

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
