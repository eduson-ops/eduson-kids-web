import { Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import { subscribe } from '../lib/gameState'

/**
 * Плавающий label над персонажем с суммой денег — как в Bloxels.
 * Крепится через drei <Html> к позиции игрока в 3D-мире.
 */
export default function FloatingLabel() {
  const group = useRef<Group>(null!)
  const [coins, setCoins] = useState(0)

  useEffect(() => subscribe((s) => setCoins(s.coins)), [])

  return (
    <group ref={group} position={[0, 2.2, 0]}>
      <Html center distanceFactor={9} pointerEvents="none" zIndexRange={[0, 0]}>
        <div className="world-label">
          <span className="world-label-money">$ {coins}</span>
        </div>
      </Html>
    </group>
  )
}
