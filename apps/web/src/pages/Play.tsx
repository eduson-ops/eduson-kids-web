import { Suspense, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GameScene from '../components/GameScene'
import { findGame } from '../lib/games'

type HudState = {
  money: number
  wave: string | null
}

export default function Play() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const game = gameId ? findGame(gameId) : undefined
  const [hud, setHud] = useState<HudState>({ money: 0, wave: null })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Дефолтный гость, если не залогинен (из лобби можно войти)
    if (!localStorage.getItem('ek_child_name')) {
      localStorage.setItem('ek_child_name', 'Гость')
    }
    // Короткая иллюзия загрузки, чтобы Canvas успел смонтироваться
    const t = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    // Фейковый HUD-сценарий: периодические «волны» и капающие деньги, как в Bloxels.
    if (!ready) return
    const waveCycle = ['МЕДЛЕННАЯ ВОЛНА', 'БЫСТРАЯ ВОЛНА', 'БОСС!']
    let i = 0
    const waveTimer = setInterval(() => {
      setHud((h) => ({ ...h, wave: waveCycle[i % waveCycle.length] }))
      setTimeout(() => setHud((h) => ({ ...h, wave: null })), 2200)
      i++
    }, 8000)
    const moneyTimer = setInterval(() => {
      setHud((h) => ({ ...h, money: h.money + 1 }))
    }, 3000)
    return () => {
      clearInterval(waveTimer)
      clearInterval(moneyTimer)
    }
  }, [ready])

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
            <GameScene playerColor={game.color} />
          </Suspense>
        ) : (
          <LoaderHud />
        )}
      </div>

      {/* HUD поверх 3D-сцены */}
      <div className="hud-top">
        <button className="hud-btn" onClick={() => navigate('/')} aria-label="Назад в лобби">
          ←
        </button>
        <div className="hud-title">{game.title}</div>
        <div className="hud-right">
          <span className="money">💰 {hud.money} $</span>
        </div>
      </div>

      {hud.wave && (
        <div className="hud-toast" key={hud.wave}>
          {hud.wave}
        </div>
      )}

      <div className="hud-help">
        <strong>WASD</strong> — ходить · <strong>Space</strong> — прыжок ·
        крути мышью, меняй камеру
      </div>
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
