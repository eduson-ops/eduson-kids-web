import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GameScene from '../components/GameScene'
import { findGame } from '../lib/games'
import { loadAvatar } from '../lib/avatars'

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
  const avatar = useMemo(() => loadAvatar(), [])

  useEffect(() => {
    if (!localStorage.getItem('ek_child_name')) {
      localStorage.setItem('ek_child_name', 'Гость')
    }
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready || !game) return
    const waveByCat = {
      obby: ['ПРЫГАЙ ВЫШЕ!', 'СКОРОСТНОЙ РЕЖИМ', 'ОСТАЛОСЬ 3!'],
      race: ['НА СТАРТ', 'КРУГ 2', 'ФИНИШ БЛИЗКО'],
      sandbox: ['ИССЛЕДУЙ!', 'НАЙДИ ДРУЗЕЙ', 'СЛУЧАЙ!'],
      rp: ['НОВАЯ МИССИЯ', 'ВСТРЕЧА У ПОРТА', 'БОСС ПРИЛЕТЕЛ'],
      sim: ['МЕДЛЕННАЯ ВОЛНА', 'БЫСТРАЯ ВОЛНА', 'БОСС!'],
    } as const
    const waves = waveByCat[game.category]
    let i = 0
    const waveTimer = setInterval(() => {
      setHud((h) => ({ ...h, wave: waves[i % waves.length] }))
      setTimeout(() => setHud((h) => ({ ...h, wave: null })), 2200)
      i++
    }, 9000)
    const moneyTimer = setInterval(() => {
      setHud((h) => ({ ...h, money: h.money + 1 }))
    }, 3000)
    return () => {
      clearInterval(waveTimer)
      clearInterval(moneyTimer)
    }
  }, [ready, game])

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
        аватар из <Link to="/profile" style={{ color: 'inherit' }}>профиля</Link>
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
