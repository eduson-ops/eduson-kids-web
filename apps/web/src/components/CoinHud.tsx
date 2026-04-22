import { useEffect, useState } from 'react'
import { subscribe, getState } from '../lib/gameState'

/**
 * CoinHud — DOM-оверлей очков, прибитый к правому верхнему углу вьюпорта.
 * Заменяет прежний 3D-FloatingLabel (drei <Html>), который «скакал» с камерой.
 */
export default function CoinHud() {
  const [coins, setCoins] = useState(getState().coins)
  useEffect(() => subscribe((s) => setCoins(s.coins)), [])
  return (
    <div className="coin-hud" aria-live="polite">
      <span className="coin-hud-icon">💰</span>
      <span className="coin-hud-value">{coins}</span>
    </div>
  )
}
