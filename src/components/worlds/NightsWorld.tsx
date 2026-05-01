import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Mushroom, Rock, GrassTuft, GenCampfire, MushroomGlow, MushroomRed, TreePine, Lantern } from '../Scenery'
import { PUBLIC_BASE } from '../../lib/publicPath'
import GradientSky from '../GradientSky'

// Kenney Graveyard — CC0 (тыквы и фонари для атмосферы)
function GraveyardProp({
  file,
  pos,
  scale = 1,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const gltf = useGLTF(`${PUBLIC_BASE}/models/kenney-graveyard/${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/pumpkin.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/pumpkin-carved.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/lantern-glass.glb`)

/**
 * NightsWorld — educational remake of «99 Nights in the Forest» (Roblox 2024 co-op).
 *
 * Curriculum: M7 L37-42 «99 Nights Scheduler» — конечный автомат DAY/NIGHT,
 * callbacks on_night_start / on_day_start, state machines.
 *
 * Python hooks:
 *   on_day_start(fn) / on_night_start(fn)
 *   schedule(seconds, fn)   — запланировать событие
 *   current_phase() → "day" | "night"
 *
 * MVP: лес с хижиной в центре, костёр, призрачные чудища по периметру.
 * Фаза меняется каждые 20 сек: день-ночь-день-… Освещение, цвет неба,
 * emissive костра и монстров меняются. Цель — собрать 5 «запасов» и зайти в хижину.
 */

const DAY_SECS = 18
const NIGHT_SECS = 14

function useDayNight(): { phase: 'day' | 'night'; t: number } {
  const [tick, setTick] = useState(0)
  const t0 = useRef(performance.now())

  useFrame(() => {
    const now = performance.now()
    const elapsed = (now - t0.current) / 1000
    if (Math.floor(elapsed / 2) !== tick) setTick(Math.floor(elapsed / 2))   // лёгкий throttle
  })

  const elapsed = (performance.now() - t0.current) / 1000
  const cycle = DAY_SECS + NIGHT_SECS
  const phaseT = elapsed % cycle
  const phase = phaseT < DAY_SECS ? 'day' : 'night'
  const t = phase === 'day' ? phaseT / DAY_SECS : (phaseT - DAY_SECS) / NIGHT_SECS
  void tick
  return { phase, t }
}

function Sky({ phase }: { phase: 'day' | 'night' }) {
  if (phase === 'night') {
    return <GradientSky top="#000308" bottom="#050e1a" radius={440} />
  }
  return <color attach="background" args={['#FFD7A8']} />
}

function DynamicLighting({ phase }: { phase: 'day' | 'night' }) {
  const ref = useRef<THREE.DirectionalLight>(null!)
  useFrame(() => {
    if (!ref.current) return
    const target = phase === 'day' ? 1.3 : 0.25
    ref.current.intensity += (target - ref.current.intensity) * 0.06
  })
  return (
    <>
      <ambientLight intensity={phase === 'day' ? 0.65 : 0.3} />
      <directionalLight
        ref={ref}
        position={phase === 'day' ? [40, 40, 20] : [-30, 35, -20]}
        intensity={phase === 'day' ? 1.3 : 0.25}
        color={phase === 'day' ? '#fff3d8' : '#7098ff'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Moonlight — cool blue light from opposite direction to sun, only at night */}
      {phase === 'night' && (
        <directionalLight
          position={[-20, 35, -10]}
          intensity={0.6}
          color="#c8d8ff"
          castShadow={false}
        />
      )}
    </>
  )
}

/** Moon disc + point light, only shown at night */
function Moon({ phase }: { phase: 'day' | 'night' }) {
  if (phase !== 'night') return null
  return (
    <group position={[-60, 55, -80]}>
      <mesh>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial color="#fffde8" />
      </mesh>
      <pointLight color="#c8d8ff" intensity={1.5} distance={200} />
    </group>
  )
}

// ─── Bioluminescent ground patches ──────────────────────────────────────────

const BIOLUMIN_VSHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BIOLUMIN_FSHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float alpha = clamp(1.0 - d, 0.0, 1.0);
    // subtle pulse
    float pulse = 0.75 + 0.25 * sin(uTime * 1.8);
    gl_FragColor = vec4(uColor * pulse, alpha * 0.82);
  }
`

const PATCH_POSITIONS: [number, number, number, number, number][] = [
  // [x, z, rotY, scaleX, scaleZ]
  [-8,  6,  0.3, 1.8, 1.4],
  [9,  -5,  1.1, 1.5, 2.0],
  [-5, -10, 0.7, 2.0, 1.6],
  [12,  3,  0.2, 1.2, 1.2],
  [-13, -3, 1.5, 1.6, 1.8],
  [4,   12, 0.9, 1.4, 1.0],
  [-11,  9, 0.4, 1.0, 1.5],
  [7,  -13, 1.2, 1.8, 1.3],
  [-4,   7, 0.0, 1.1, 1.1],
  [15,  -8, 0.6, 2.0, 1.4],
  [-7, -14, 1.0, 1.3, 1.7],
  [10,  10, 0.8, 1.5, 1.5],
  [-15,  4, 0.3, 1.2, 1.0],
  [3,  -8,  0.5, 1.0, 1.8],
]

// alternating cyan / purple
const PATCH_COLORS = ['#00ffcc', '#aa00ff']

function BioluminescentPatches({ phase }: { phase: 'day' | 'night' }) {
  const timeRef = useRef(0)

  // We hold one ref array of ShaderMaterial per patch
  const matsRef = useRef<(THREE.ShaderMaterial | null)[]>(
    Array(PATCH_POSITIONS.length).fill(null)
  )

  useFrame((_, dt) => {
    if (phase !== 'night') return
    timeRef.current += dt
    matsRef.current.forEach((mat) => {
      if (mat) mat.uniforms.uTime!.value = timeRef.current
    })
  })

  if (phase !== 'night') return null

  return (
    <>
      {PATCH_POSITIONS.map((entry, i) => {
        const [x, z, rotY, sx, sz] = entry
        const hexColor = PATCH_COLORS[i % 2]
        const color = new THREE.Color(hexColor)

        return (
          <mesh
            key={i}
            position={[x, 0.02, z]}
            rotation={[-Math.PI / 2, 0, rotY]}
            scale={[sx, sz, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
              ref={(mat) => { matsRef.current[i] = mat }}
              vertexShader={BIOLUMIN_VSHADER}
              fragmentShader={BIOLUMIN_FSHADER}
              uniforms={{
                uColor: { value: color },
                uTime: { value: 0 },
              }}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ─── Fireflies ───────────────────────────────────────────────────────────────

interface FireflyData {
  cx: number
  cz: number
  cy: number
  radius: number
  speed: number
  phase: number
  vertPhase: number
}

const FIREFLY_COUNT = 30
const FIREFLY_LIGHT_COUNT = 8 // only first N get a point light

const fireflyData: FireflyData[] = Array.from({ length: FIREFLY_COUNT }, (_, i) => {
  const seed = i * 137.508
  const pseudo = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
  return {
    cx: (pseudo(seed) - 0.5) * 28,
    cz: (pseudo(seed + 1) - 0.5) * 28,
    cy: 0.5 + pseudo(seed + 2) * 2.5,
    radius: 1.0 + pseudo(seed + 3) * 2.0,
    speed: 0.3 + pseudo(seed + 4) * 0.5,
    phase: pseudo(seed + 5) * Math.PI * 2,
    vertPhase: pseudo(seed + 6) * Math.PI * 2,
  }
})

function Fireflies({ phase }: { phase: 'day' | 'night' }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!groupRef.current || phase !== 'night') return
    const t = clock.getElapsedTime()
    const children = groupRef.current.children
    fireflyData.forEach((fd, i) => {
      const mesh = children[i]
      if (!mesh) return
      const angle = t * fd.speed + fd.phase
      mesh.position.x = fd.cx + Math.cos(angle) * fd.radius
      mesh.position.z = fd.cz + Math.sin(angle * 0.7) * fd.radius
      mesh.position.y = fd.cy + Math.sin(t * 0.8 + fd.vertPhase) * 0.4
    })
  })

  if (phase !== 'night') return null

  return (
    <group ref={groupRef}>
      {fireflyData.map((fd, i) => (
        <mesh key={i} position={[fd.cx, fd.cy, fd.cz]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#ffffaa" />
          {i < FIREFLY_LIGHT_COUNT && (
            <pointLight intensity={0.3} distance={2} color="#ffffaa" />
          )}
        </mesh>
      ))}
    </group>
  )
}

// ─── Components unchanged from original ──────────────────────────────────────

function Campfire() {
  const flame = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 6
    if (flame.current) {
      flame.current.scale.y = 1 + Math.sin(phase.current) * 0.2
      flame.current.rotation.y = phase.current * 0.5
    }
  })
  return (
    <group position={[0, 0, 0]}>
      {/* Камни вокруг */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        const x = Math.cos(a) * 1
        const z = Math.sin(a) * 1
        return (
          <mesh key={i} position={[x, 0.15, z]} castShadow>
            <dodecahedronGeometry args={[0.28]} />
            <meshStandardMaterial color="#4a3f3a" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Поленья крест-накрест */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#5b3f1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 1.2, 8]} />
        <meshStandardMaterial color="#5b3f1e" roughness={0.9} />
      </mesh>
      {/* Пламя — светящийся конус, колеблется */}
      <group ref={flame} position={[0, 0.4, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.32, 0.9, 8]} />
          <meshStandardMaterial color="#ff9454" emissive="#ff5464" emissiveIntensity={1.5} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <coneGeometry args={[0.45, 0.6, 8]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={1.8} transparent opacity={0.7} />
        </mesh>
      </group>
      <pointLight color="#ff9454" intensity={1.3} distance={12} decay={2} position={[0, 0.7, 0]} />
    </group>
  )
}

function Cabin() {
  return (
    <group position={[0, 0, -8]}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Основание */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 2.4, 3.5]} />
          <meshStandardMaterial color="#7a4a22" roughness={0.9} />
        </mesh>
        {/* Горизонтальные брусья — деталь */}
        {[0.3, 1.2, 2.1].map((y) => (
          <mesh key={y} position={[0, y, 1.8]}>
            <boxGeometry args={[4.6, 0.12, 0.1]} />
            <meshStandardMaterial color="#5b3515" roughness={0.9} />
          </mesh>
        ))}
        {/* Дверь */}
        <mesh position={[0, 0.9, 1.81]}>
          <boxGeometry args={[1.1, 1.8, 0.1]} />
          <meshStandardMaterial color="#3a2210" roughness={0.8} />
        </mesh>
        {/* Окошки */}
        <mesh position={[-1.5, 1.5, 1.81]}>
          <boxGeometry args={[0.7, 0.7, 0.1]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[1.5, 1.5, 1.81]}>
          <boxGeometry args={[0.7, 0.7, 0.1]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.7} />
        </mesh>
      </RigidBody>
      {/* Крыша — конус */}
      <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.4, 1.4, 4]} />
        <meshStandardMaterial color="#3d2512" roughness={0.9} />
      </mesh>
    </group>
  )
}

function PhaseIndicator({ phase, t }: { phase: 'day' | 'night'; t: number }) {
  // Визуальный хронометр над костром
  return (
    <group position={[0, 5, 0]}>
      <mesh>
        <ringGeometry args={[0.45, 0.55, 24]} />
        <meshBasicMaterial color={phase === 'day' ? '#FFD43C' : '#6B5CE7'} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, t * Math.PI * 2]}>
        <ringGeometry args={[0.45, 0.55, 24, 1, 0, t * Math.PI * 2]} />
        <meshBasicMaterial color={phase === 'day' ? '#ff9454' : '#c879ff'} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[60, 0.5, 60]} />
        <meshStandardMaterial color="#5b8c44" roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

// ─── NightFog — dark atmospheric fog override ─────────────────────────────────

function NightFog({ phase }: { phase: 'day' | 'night' }) {
  if (phase !== 'night') return null
  return <fog attach="fog" args={['#020810', 30, 120]} />
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function NightsWorld() {
  const { phase, t } = useDayNight()

  const monsterEmissive = phase === 'night' ? 1.2 : 0.2

  // Лёгкий memo для неизменных элементов
  const decor = useMemo(
    () => (
      <>
        <Tree pos={[-10, 0, -10]} variant={0} />
        <Tree pos={[10, 0, -10]} variant={1} />
        <Tree pos={[-10, 0, 10]} variant={2} />
        <Tree pos={[10, 0, 10]} variant={3} />
        <Tree pos={[-16, 0, 0]} variant={4} />
        <Tree pos={[16, 0, 0]} variant={0} />
        <Tree pos={[0, 0, 16]} variant={1} />
        <Tree pos={[0, 0, -16]} variant={2} />
        <Bush pos={[-5, 0, 5]} variant={0} scale={1.0} />
        <Bush pos={[5, 0, -5]} variant={1} scale={1.0} />
        <Bush pos={[-12, 0, -5]} variant={0} scale={1.2} />
        <Bush pos={[12, 0, 5]} variant={1} scale={1.1} />
        <MushroomRed pos={[-6, 0, -12]} scale={1.2} />
        <MushroomGlow pos={[6, 0, 12]} scale={1.1} />
        <MushroomGlow pos={[-9, 0, 5]} scale={0.85} />
        <TreePine pos={[-18, 0, 0]} scale={1.2} />
        <TreePine pos={[18, 0, 0]} scale={1.1} />
        <Lantern pos={[-2.5, 0, -6.5]} scale={0.85} />
        <Lantern pos={[2.5, 0, -6.5]} scale={0.85} />
        <Rock pos={[-14, 0, -14]} scale={1.5} />
        <Rock pos={[14, 0, 14]} scale={1.2} />
        <GrassTuft pos={[-3, 0, 3]} tall />
        <GrassTuft pos={[3, 0, -3]} tall={false} />
        <GrassTuft pos={[-7, 0, -3]} tall />
      </>
    ),
    []
  )

  return (
    <>
      <Sky phase={phase} />
      <NightFog phase={phase} />
      <DynamicLighting phase={phase} />
      <Moon phase={phase} />
      <Ground />

      <BioluminescentPatches phase={phase} />
      <Fireflies phase={phase} />

      <GenCampfire pos={[0, 0, 0]} scale={1.1} />
      <Cabin />
      <PhaseIndicator phase={phase} t={t} />

      {decor}

      {/* Тыквы и фонари — ночное настроение */}
      <GraveyardProp file="pumpkin-carved.glb" pos={[3, 0, 4]} scale={1.6} />
      <GraveyardProp file="pumpkin-carved.glb" pos={[-3, 0, 4]} scale={1.6} rotY={0.5} />
      <GraveyardProp file="pumpkin.glb" pos={[-5, 0, -4]} scale={1.5} />
      <GraveyardProp file="pumpkin.glb" pos={[5, 0, -4]} scale={1.5} />
      <GraveyardProp file="lantern-glass.glb" pos={[-3, 0, -7]} scale={1.8} />
      <GraveyardProp file="lantern-glass.glb" pos={[3, 0, -7]} scale={1.8} />

      {/* 5 «запасов» (монеток) разбросанных по лесу */}
      <Coin pos={[6, 1, 2]} value={2} />
      <Coin pos={[-6, 1, 2]} value={2} />
      <Coin pos={[0, 1, 6]} value={2} />
      <Coin pos={[8, 1, -6]} value={2} />
      <Coin pos={[-8, 1, -6]} value={2} />

      {/* Монстры (явно светятся ночью) */}
      <group>
        <GltfMonster which="blueDemon" pos={[-14, 0, -8]} patrolX={3} scale={1.1} sensor animation="Wave" />
        <GltfMonster which="alien"     pos={[14, 0, 8]}   patrolX={3} scale={1.0} sensor animation="Wave" />
        {/* Дополнительное свечение для ночи — тонкие emissive-шары вокруг монстров */}
        <mesh position={[-14, 1, -8]}>
          <sphereGeometry args={[1.3, 10, 10]} />
          <meshBasicMaterial color="#6B5CE7" transparent opacity={monsterEmissive * 0.15} />
        </mesh>
        <mesh position={[14, 1, 8]}>
          <sphereGeometry args={[1.3, 10, 10]} />
          <meshBasicMaterial color="#c879ff" transparent opacity={monsterEmissive * 0.15} />
        </mesh>
      </group>

      {/* Финиш — дверь хижины */}
      <GoalTrigger
        pos={[0, 1, -6.5]}
        size={[1.4, 2.2, 0.6]}
        result={{
          kind: 'win',
          label: 'В УКРЫТИИ!',
          subline: `Ты пережил ${phase === 'night' ? 'ночь' : 'день'} и дошёл до хижины.`,
        }}
      />
    </>
  )
}

export const NIGHTS_SPAWN: [number, number, number] = [0, 3, 10]
