import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Group } from 'three'
import { addCoin } from '../lib/gameState'
import { SFX } from '../lib/audio'

interface Props {
  pos: [number, number, number]
  value?: number
}

export default function Coin({ pos, value = 1 }: Props) {
  const rb = useRef<RapierRigidBody>(null!)
  const visual = useRef<Group>(null!)
  const [collected, setCollected] = useState(false)

  useFrame((_, dt) => {
    if (visual.current && !collected) {
      visual.current.rotation.y += dt * 2.5
      visual.current.position.y = pos[1] + Math.sin(Date.now() * 0.003) * 0.15
    }
  })

  if (collected) return null

  return (
    <RigidBody
      ref={rb}
      type="fixed"
      colliders="ball"
      position={pos}
      sensor
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'player') {
          setCollected(true)
          addCoin(value)
          SFX.coin()
        }
      }}
    >
      <group ref={visual}>
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
          <meshStandardMaterial
            color="#ffd644"
            emissive="#ffaa00"
            emissiveIntensity={0.45}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
        {/* звёздочка поверх для контраста */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 5]} />
          <meshStandardMaterial color="#fff5a0" />
        </mesh>
      </group>
    </RigidBody>
  )
}
