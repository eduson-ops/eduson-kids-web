import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import GoalTrigger from '../GoalTrigger'
import { Tree, Bush } from '../Scenery'
import { addCoin, shakeCamera } from '../../lib/gameState'
import { SFX } from '../../lib/audio'
import GradientSky from '../GradientSky'

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

const ORB_COLORS = [
  '#ff0040', '#0080ff', '#00ff80', '#ff8000',
  '#ff00ff', '#00ffff', '#ffff00', '#ff4080',
]

// 8 orb positions arranged in a ring around the arena
const ORB_POSITIONS: Array<[number, number, number]> = [
  [-8, 2.5, -8],
  [0, 3.0, -12],
  [8, 2.5, -8],
  [12, 2.8, 0],
  [8, 2.5, 8],
  [0, 3.2, 12],
  [-8, 2.5, 8],
  [-12, 2.8, 0],
]

// Energy grid floor shader
const GRID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const GRID_FRAG = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float row = floor(vUv.y * 20.0);
    float offset = mod(row * 0.5, 1.0);
    float col = mod(vUv.x * 20.0 + offset, 1.0);
    float lineH = smoothstep(0.0, 0.04, col) * (1.0 - smoothstep(0.96, 1.0, col));
    float lineV = smoothstep(0.0, 0.04, mod(vUv.y * 20.0, 1.0)) * (1.0 - smoothstep(0.96, 1.0, mod(vUv.y * 20.0, 1.0)));
    float grid = 1.0 - (lineH * lineV);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.5 + vUv.x * 8.0 + vUv.y * 6.0);
    vec3 col3 = mix(vec3(0.05, 0.1, 0.3), vec3(0.4, 0.6, 1.0), grid * 0.9);
    gl_FragColor = vec4(col3, grid * 0.15 * (0.7 + 0.3 * pulse));
  }
`

// Power orb glow shader
const ORB_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ORB_FRAG = `
  uniform vec3 uColor;
  uniform float uPulse;
  varying vec2 vUv;
  void main() {
    float d = 1.0 - length(vUv - 0.5) * 2.0;
    d = max(d, 0.0);
    float core = pow(d, 1.5);
    float glow = pow(d, 0.4) * 0.5;
    float brightness = (core + glow) * uPulse;
    gl_FragColor = vec4(uColor * brightness, d * 0.9);
  }
`

// Activation ring shader
const RING_FRAG = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`
const RING_VERT = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

function EnergyGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    []
  )
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime!.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[60, 60]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function PowerOrb({ index, color, position }: { index: number; color: string; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const ringMatRef = useRef<THREE.ShaderMaterial>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  const orbUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uPulse: { value: 1.0 },
    }),
    [color]
  )
  const ringUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0.6 },
    }),
    [color]
  )

  // Phase offset so orbs animate independently
  const phase = index * (Math.PI * 2 / 8)
  const ringPhase = useRef(phase)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (meshRef.current) {
      // Bob up/down
      meshRef.current.position.y = position[1] + Math.sin(t * 1.2 + phase) * 0.4
      // Slow orbit around arena center — offset angle per orb
      const baseAngle = Math.atan2(position[2], position[0])
      const orbitAngle = baseAngle + t * 0.15
      const radius = Math.hypot(position[0], position[2])
      meshRef.current.position.x = Math.cos(orbitAngle) * radius
      meshRef.current.position.z = Math.sin(orbitAngle) * radius
    }
    if (orbUniforms.uColor) {
      orbUniforms.uPulse.value = 0.7 + 0.3 * Math.sin(t * 3.0 + phase)
    }
    if (lightRef.current && meshRef.current) {
      lightRef.current.position.copy(meshRef.current.position)
    }

    // Activation ring: scale 1→3, opacity 0.6→0, then reset
    ringPhase.current += 1 / 60 // approx per-frame increment
    const ringT = (ringPhase.current % 2) / 2 // 0..1 over 2 seconds
    if (ringRef.current) {
      const sc = 1 + ringT * 2
      ringRef.current.scale.setScalar(sc)
      if (meshRef.current) {
        ringRef.current.position.copy(meshRef.current.position)
      }
    }
    if (ringMatRef.current) {
      ringMatRef.current.uniforms.uOpacity!.value = 0.6 * (1 - ringT)
    }
  })

  return (
    <>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <shaderMaterial
          vertexShader={ORB_VERT}
          fragmentShader={ORB_FRAG}
          uniforms={orbUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={position}>
        <torusGeometry args={[0.6, 0.04, 8, 32]} />
        <shaderMaterial
          ref={ringMatRef}
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={ringUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.8}
        distance={6}
        decay={2}
        position={position}
      />
    </>
  )
}

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
      {/* Power sky */}
      <GradientSky top="#000a30" bottom="#003090" radius={440} />

      <Ground />
      {/* Energy grid overlay on floor */}
      <EnergyGrid />
      <Arena />

      {/* 8 power orbs floating around arena */}
      {ORB_POSITIONS.map((pos, i) => (
        <PowerOrb key={i} index={i} color={ORB_COLORS[i] ?? '#ffffff'} position={pos} />
      ))}

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
