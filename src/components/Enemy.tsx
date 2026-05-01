import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useRef } from 'react'
import * as THREE from 'three'
import { enemyHit, shakeCamera } from '../lib/gameState'
import { SFX } from '../lib/audio'

interface Props {
  pos: [number, number, number]
  /** амплитуда патрулирования по X */
  patrolX?: number
  color?: string
}

/**
 * Летающий враг-капля. Патрулирует слева-направо, крутится.
 * Коллизия — сенсор, персонажа не сбивает в MVP (но можно добавить урон/респаун).
 */
function EnemyImpl({ pos, patrolX = 3, color = '#ff5464' }: Props) {
  const rb = useRef<RapierRigidBody>(null!)
  const t0 = useRef(Math.random() * 10)
  const glowLightRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }, dt) => {
    if (!rb.current) return
    t0.current += dt
    const x = pos[0] + Math.sin(t0.current * 1.2) * patrolX
    const yBob = pos[1] + Math.sin(t0.current * 2) * 0.2
    rb.current.setNextKinematicTranslation({ x, y: yBob, z: pos[2] })
    // P-05 fix: unit quaternion для поворота вокруг Y на угол θ = t*0.8.
    // Раньше было {y: t*0.8, w: 1} — это НЕ единичный кватернион (|q| ≠ 1),
    // Rapier постепенно накапливал ошибку и через минуты ротация уходила в NaN.
    const halfAngle = t0.current * 0.8 * 0.5
    rb.current.setNextKinematicRotation({
      x: 0,
      y: Math.sin(halfAngle),
      z: 0,
      w: Math.cos(halfAngle),
    })
    // Pulse glow light intensity
    if (glowLightRef.current) {
      glowLightRef.current.intensity = Math.sin(clock.elapsedTime * 2.0) * 0.3 + 0.5
    }
  })

  return (
    <RigidBody
      ref={rb}
      type="kinematicPosition"
      colliders="ball"
      position={pos}
      sensor
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'player') {
          enemyHit()
          SFX.lose()
          shakeCamera(0.4, 0.3)
        }
      }}
    >
      <group>
        {/* Pulsing glow light */}
        <pointLight ref={glowLightRef} color="#ff2200" intensity={0.8} distance={4} />
        <mesh castShadow>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
        {/* Inverted hull outline */}
        <mesh scale={1.08}>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshBasicMaterial color="#440000" side={THREE.BackSide} />
        </mesh>
        {/* злые глазки */}
        <mesh position={[-0.15, 0.08, 0.4]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[0.15, 0.08, 0.4]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[-0.15, 0.08, 0.47]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.15, 0.08, 0.47]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* мини-крылья */}
        <mesh position={[-0.4, 0.15, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.4, 0.15, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.3, 0.04, 0.25]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.6} />
        </mesh>
      </group>
    </RigidBody>
  )
}

// D-11: Enemy вызывается из World*-компонентов с inline `pos={[...]}` —
// дефолтная shallow-compare видела бы новый массив каждый ре-рендер.
// Comparator делает поэлементное сравнение tuple + остальные primitives.
export default memo(EnemyImpl, (prev, next) => (
  prev.pos[0] === next.pos[0] &&
  prev.pos[1] === next.pos[1] &&
  prev.pos[2] === next.pos[2] &&
  prev.patrolX === next.patrolX &&
  prev.color === next.color
))
