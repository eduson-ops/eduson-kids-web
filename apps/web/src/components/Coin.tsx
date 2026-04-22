import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Group } from 'three'
import { addCoin } from '../lib/gameState'
import { SFX } from '../lib/audio'
import SparkleBurst from './SparkleBurst'

interface Props {
  pos: [number, number, number]
  value?: number
}

// Pickup animation: -1 = idle, 0..COLLECT_DURATION = collapsing to sparkle
const COLLECT_DURATION = 0.35

export default function Coin({ pos, value = 1 }: Props) {
  const rb = useRef<RapierRigidBody>(null!)
  const visual = useRef<Group>(null!)
  const collectT = useRef(-1)
  const [done, setDone] = useState(false)
  const [sparkling, setSparkling] = useState(false)

  useFrame((_, dt) => {
    if (!visual.current || done) return

    if (collectT.current < 0) {
      visual.current.rotation.y += dt * 2.5
      visual.current.position.y = pos[1] + Math.sin(Date.now() * 0.003) * 0.15
    } else {
      collectT.current += dt
      const p = Math.min(collectT.current / COLLECT_DURATION, 1)
      const ease = 1 - p * p
      visual.current.scale.setScalar(ease)
      visual.current.position.y = pos[1] + p * 1.2
      if (p >= 1) setDone(true)
    }
  })

  // Пока сверкалка живёт — продолжаем рендерить её даже после done
  if (done && !sparkling) return null

  return (
    <>
      {!done && (
        <RigidBody
          ref={rb}
          type="fixed"
          colliders="ball"
          position={pos}
          sensor
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name === 'player' && collectT.current < 0) {
              collectT.current = 0
              addCoin(value)
              SFX.coin()
              setSparkling(true)
            }
          }}
        >
          <group ref={visual}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
              <meshStandardMaterial
                color="#ffd644"
                emissive="#ffaa00"
                emissiveIntensity={0.4}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.18, 5]} />
              <meshStandardMaterial color="#fff5a0" />
            </mesh>
          </group>
        </RigidBody>
      )}
      {sparkling && (
        <SparkleBurst pos={pos} onDone={() => setSparkling(false)} />
      )}
    </>
  )
}
