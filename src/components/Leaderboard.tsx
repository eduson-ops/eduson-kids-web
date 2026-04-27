import { useEffect, useState } from 'react'
import { subscribe, type GameState } from '../lib/gameState'

interface Props {
  gameTitle: string
}

interface LeaderRow {
  name: string
  coins: number
  isYou?: boolean
}

/**
 * Лидерборд в стиле Roblox — открывается по удержанию Tab.
 * В single-player показывает тебя + AI-опонентов (mock данные с реалистичными русскими именами).
 * В v1.0+ здесь будут реальные данные с leaderboard backend.
 */
export default function Leaderboard({ gameTitle }: Props) {
  const [visible, setVisible] = useState(false)
  const [state, setState] = useState<GameState>({
    coins: 0,
    timeMs: 0,
    running: true,
    goal: null,
  })
  const [mockRivals, setMockRivals] = useState<LeaderRow[]>(() => generateMockRivals(0))

  useEffect(() => subscribe((s) => {
    setState(s)
    // Rivals slowly "catch up" — regenerate from coin-seeded values
    setMockRivals(generateMockRivals(s.coins))
  }), [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !document.pointerLockElement) {
        e.preventDefault()
        setVisible(true)
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setVisible(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  if (!visible) {
    return (
      <div className="leaderboard-hint">
        <kbd>Tab</kbd> — лидерборд
      </div>
    )
  }

  const you: LeaderRow = { name: 'Ты', coins: state.coins, isYou: true }
  const all = [...mockRivals, you].sort((a, b) => b.coins - a.coins).slice(0, 8)

  return (
    <div className="leaderboard">
      <header className="lb-header">
        <span>🏆</span>
        <span>{gameTitle}</span>
      </header>
      <div className="lb-rows">
        {all.map((row, i) => (
          <div key={`${row.name}-${i}`} className={`lb-row ${row.isYou ? 'you' : ''}`}>
            <span className="lb-rank">#{i + 1}</span>
            <span className="lb-name">{row.name}</span>
            <span className="lb-coins">💰 {row.coins}</span>
          </div>
        ))}
      </div>
      <footer className="lb-footer">
        <small>удерживай <kbd>Tab</kbd></small>
      </footer>
    </div>
  )
}

// Mulberry32 PRNG — deterministic from seed, no random() so rivals don't jump around
function seededRand(seed: number) {
  let s = seed | 0
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s)
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s)
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296
  }
}

function generateMockRivals(playerCoins: number): LeaderRow[] {
  const NAMES = ['Маша', 'Дима', 'Артур', 'Соня', 'Саша', 'Лев', 'Ариана']
  const rand = seededRand(42)
  // Spread rivals around player score ±3, so leaderboard feels competitive
  const base = Math.max(1, playerCoins)
  return NAMES.map((name, i) => ({
    name,
    coins: Math.max(0, base + Math.floor((rand() - 0.5) * 6) + (i % 3 === 0 ? 2 : 0)),
  }))
}
