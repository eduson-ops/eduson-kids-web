import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import GoalTrigger from '../GoalTrigger'
import { Tree, Bush } from '../Scenery'
import { addCoin, shakeCamera } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

/**
 * AbilityBuilderWorld — educational remake of «Blox Fruits» (без grind).
 *
 * Curriculum: M8 L44-48 «Fruits Ability Builder» — first-class functions,
 * параметры, события мыши, векторы.
 * Python hooks (будущее):
 *   def fireball(p):
 *       spawn_projectile(p.pos, p.forward, dmg=10)
 *   on_click(fireball)
 *
 * Механика (живая):
 *   1. Клик мыши (или F / Enter) → из игрока вылетает светящийся снаряд вперёд
 *   2. Снаряд — Dynamic RigidBody с импульсом, живёт 2 сек
 *   3. Попал в «манекен» (Sensor) → +5 очков, манекен восстанавливается через 1.2 сек
 *   4. Попал во все 6 манекенов → goal «МАСТЕР СИЛЫ»
 */

const PROJECTILE_SPEED = 22
const PROJECTILE_LIFETIME = 2
const DUMMY_RESPAWN = 1.2

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[60, 0.5, 60]} />
        <meshStandardMaterial color="#2a3142" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Arena() {
  // Низкие стены по периметру — чтобы снаряды не улетали в бесконечность
  const W = 24
  const H = 3
  const T = 0.4
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W], size: [W * 2, H, T] },
    { pos: [0, H / 2, W],  size: [W * 2, H, T] },
    { pos: [-W, H / 2, 0], size: [T, H, W * 2] },
    { pos: [W, H / 2, 0],  size: [T, H, W * 2] },
  ]
  return (
    <>
      {items.map((it, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={it.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={it.size} />
            <meshStandardMaterial color="#6B5CE7" emissive="#6B5CE7" emissiveIntensity={0.15} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

interface ProjectileData {
  id: number
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  born: number
}

function Projectile({
  data,
  onExpire,
  onHit,
}: {
  data: ProjectileData
  onExpire: (id: number) => void
  onHit: (id: number, dummyId: string) => void
}) {
  const ref = useRef<RapierRigidBody>(null!)
  useEffect(() => {
    if (ref.current) {
      ref.current.setLinvel({ x: data.vx, y: data.vy, z: data.vz }, true)
    }
  }, [data.vx, data.vy, data.vz])

  useFrame(() => {
    const age = (performance.now() - data.born) / 1000
    if (age > PROJECTILE_LIFETIME) onExpire(data.id)
  })

  return (
    <RigidBody
      ref={ref}
      name={`proj-${data.id}`}
      type="dynamic"
      colliders="ball"
      position={[data.x, data.y, data.z]}
      gravityScale={0}
      linearDamping={0}
      ccd
      sensor
      onIntersectionEnter={({ other }) => {
        const nm = other.rigidBodyObject?.name
        if (nm && nm.startsWith('dummy-')) {
          onHit(data.id, nm)
        }
      }}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial
          color="#FFD43C"
          emissive="#FFD43C"
          emissiveIntensity={1.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight color="#FFD43C" intensity={0.8} distance={4} decay={2} />
    </RigidBody>
  )
}

interface DummyProps {
  id: string
  pos: [number, number, number]
  hit: boolean
}

function Dummy({ id, pos, hit }: DummyProps) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current && !hit) {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.2
    }
  })
  return (
    <RigidBody name={`dummy-${id}`} type="fixed" colliders="ball" position={pos} sensor>
      <group ref={ref} visible={!hit}>
        {/* Пьедестал */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.7, 0.25, 14]} />
          <meshStandardMaterial color="#1e1933" roughness={0.8} />
        </mesh>
        {/* Тело-манекен */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.8, 16, 14]} />
          <meshStandardMaterial
            color="#ff5464"
            emissive="#ff5464"
            emissiveIntensity={0.45}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
        {/* Кольцо-цель */}
        <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.05, 8, 24]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </RigidBody>
  )
}

const DUMMY_POSITIONS: Array<[number, number, number]> = [
  [-10, 1, -10],
  [0, 1, -14],
  [10, 1, -10],
  [-10, 1, 10],
  [0, 1, 14],
  [10, 1, 10],
]

export default function AbilityBuilderWorld() {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const [dummyHitAt, setDummyHitAt] = useState<Record<string, number>>({})
  const [hitCount, setHitCount] = useState(0)
  const nextIdRef = useRef(1)

  // Клики мыши и клавиши F/Enter — спавн снаряда
  useEffect(() => {
    const fire = () => {
      const pos = window.__ekPlayerPos
      const cam = window.__ekCam
      if (!pos) return
      const yaw = cam?.yaw ?? 0
      const dirX = -Math.sin(yaw)
      const dirZ = -Math.cos(yaw)
      const id = nextIdRef.current++
      setProjectiles((prev) => [
        ...prev,
        {
          id,
          x: pos.x + dirX * 1.2,
          y: pos.y + 0.4,
          z: pos.z + dirZ * 1.2,
          vx: dirX * PROJECTILE_SPEED,
          vy: 0,
          vz: dirZ * PROJECTILE_SPEED,
          born: performance.now(),
        },
      ])
      SFX.jump()
    }
    const onMouse = (e: MouseEvent) => {
      // Левый клик — только если локнут курсор (иначе это обычный клик UI)
      if (e.button === 0 && document.pointerLockElement) fire()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F' || e.key === 'Enter') fire()
    }
    window.addEventListener('mousedown', onMouse)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onMouse)
      window.removeEventListener('keydown', onKey)
    }
  }, [camera])

  const expireProjectile = (id: number) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== id))
  }

  const hitDummy = (projId: number, dummyName: string) => {
    const dummyId = dummyName.replace('dummy-', '')
    setProjectiles((prev) => prev.filter((p) => p.id !== projId))
    setDummyHitAt((prev) => {
      if (prev[dummyId] && performance.now() - prev[dummyId] < DUMMY_RESPAWN * 1000) return prev
      addCoin(5)
      SFX.coin()
      shakeCamera(0.15, 0.15)
      setHitCount((h) => h + 1)
      return { ...prev, [dummyId]: performance.now() }
    })
  }

  // Респаун манекенов — тикает каждый кадр
  useFrame(() => {
    const now = performance.now()
    let changed = false
    const next = { ...dummyHitAt }
    for (const [k, ts] of Object.entries(dummyHitAt)) {
      if (now - ts > DUMMY_RESPAWN * 1000) {
        delete next[k]
        changed = true
      }
    }
    if (changed) setDummyHitAt(next)
  })

  const distinctHit = Object.keys(dummyHitAt).length + (hitCount > 0 ? 0 : 0)
  void distinctHit

  return (
    <>
      <Ground />
      <Arena />

      {/* 6 манекенов */}
      {DUMMY_POSITIONS.map((pos, i) => {
        const id = String(i)
        const hit = Boolean(dummyHitAt[id])
        return <Dummy key={id} id={id} pos={pos} hit={hit} />
      })}

      {/* Живые снаряды */}
      {projectiles.map((p) => (
        <Projectile key={p.id} data={p} onExpire={expireProjectile} onHit={hitDummy} />
      ))}

      {/* HUD-подсказка */}
      <Html position={[0, 7, 0]} center distanceFactor={12}>
        <div
          style={{
            background: 'rgba(11,10,17,0.92)',
            color: '#FFD43C',
            padding: '10px 18px',
            borderRadius: 14,
            border: '2px solid #6B5CE7',
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          🔥 Клик / F / Enter — огненный шар<br />
          Попаданий: {hitCount} / 20
        </div>
      </Html>

      {/* Декор */}
      <Tree pos={[-22, 0, -22]} variant={0} />
      <Tree pos={[22, 0, -22]} variant={1} />
      <Tree pos={[-22, 0, 22]} variant={2} />
      <Tree pos={[22, 0, 22]} variant={3} />
      <Bush pos={[-18, 0, 0]} variant={0} scale={1.3} />
      <Bush pos={[18, 0, 0]} variant={1} scale={1.3} />

      {/* Финиш: 20 попаданий */}
      {hitCount >= 20 && (
        <GoalTrigger
          pos={[0, 1.5, 0]}
          size={[4, 3, 4]}
          result={{
            kind: 'win',
            label: 'МАСТЕР СИЛЫ!',
            subline: '20 попаданий. Ты освоил огненный шар.',
          }}
        />
      )}
    </>
  )
}

export const ABILITY_SPAWN: [number, number, number] = [0, 3, 0]
