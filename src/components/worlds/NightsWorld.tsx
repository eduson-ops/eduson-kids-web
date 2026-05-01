import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Mushroom, Rock, GrassTuft, GenCampfire, MushroomGlow, MushroomRed, TreePine, Lantern, CrystalCluster, BossWizard, IceBlock, MagicPotion, CrystalSword, MagicGate, MagicMushroom, FairyHouse, DragonEgg, RuinsPillar } from '../Scenery'
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
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -20]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 100]} />
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

// ─── Forest fog bands — thin dark planes drifting at ground level ─────────────

const FOG_BAND_POSITIONS: [number, number, number][] = [
  [-8,  0.3,  5],
  [7,   0.6, -9],
  [-14, 0.5,  12],
  [12,  0.4, -18],
]

function ForestFogBands() {
  return (
    <>
      {FOG_BAND_POSITIONS.map(([x, y, z], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial
            color="#0a0820"
            opacity={0.18}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Will-o-wisps — 24 instanced floating orbs drifting through the forest ────

const WISP_COUNT = 24

interface WispParticle {
  baseX: number
  baseZ: number
  baseY: number
  orbitRadius: number
  orbitSpeed: number
  phase: number
  driftSpeed: number
}

const wispParticles: WispParticle[] = (() => {
  const pseudo = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: WISP_COUNT }, (_, i) => {
    const s = i * 91.37 + 500
    return {
      baseX: (pseudo(s) - 0.5) * 70,          // [-35, 35]
      baseZ: -10 - pseudo(s + 1) * 65,         // [-10, -75]
      baseY: 0.5 + pseudo(s + 2) * 2.0,        // [0.5, 2.5]
      orbitRadius: 0.3 + pseudo(s + 3) * 0.9,  // [0.3, 1.2]
      orbitSpeed: 0.4 + pseudo(s + 4) * 1.2,   // [0.4, 1.6]
      phase: pseudo(s + 5) * Math.PI * 2,
      driftSpeed: (pseudo(s + 6) - 0.5) * 0.6, // [-0.3, 0.3]
    }
  })
})()

const WISP_LIGHT_POSITIONS: [number, number, number][] = [
  [-15, 1.5, -25],
  [ 20, 1.5, -40],
  [ -8, 1.5, -55],
  [ 18, 1.5, -65],
  [-25, 1.5, -45],
  [  5, 1.5, -35],
]

function WillOWisps() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    wispParticles.forEach((wp, i) => {
      const x = wp.baseX + Math.sin(t * wp.orbitSpeed + wp.phase) * wp.orbitRadius
      const y = wp.baseY + Math.sin(t * 0.7 + wp.phase) * 0.5
      const z = wp.baseZ + Math.cos(t * wp.orbitSpeed * 0.8 + wp.phase) * wp.orbitRadius * 0.6
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, WISP_COUNT]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshBasicMaterial color="#88ffcc" transparent opacity={0.85} depthWrite={false} />
      </instancedMesh>
      {WISP_LIGHT_POSITIONS.map(([x, y, z], i) => (
        <pointLight
          key={i}
          position={[x, y, z]}
          color="#44ffaa"
          intensity={1.5}
          distance={8}
          decay={2}
        />
      ))}
    </>
  )
}

// ─── HauntedMist — layered fog discs at ground level ─────────────────────────

const MIST_LAYERS: { y: number; radius: number; opacity: number; rotY: number }[] = [
  { y: 0.05, radius: 40, opacity: 0.12, rotY: 0.0 },
  { y: 0.08, radius: 55, opacity: 0.08, rotY: 1.1 },
  { y: 0.12, radius: 70, opacity: 0.05, rotY: 2.4 },
]

function HauntedMist() {
  return (
    <>
      {MIST_LAYERS.map((layer, i) => (
        <mesh
          key={i}
          position={[0, layer.y, -35]}
          rotation={[-Math.PI / 2, 0, layer.rotY]}
        >
          <circleGeometry args={[layer.radius, 48]} />
          <meshBasicMaterial
            color="#aaccff"
            transparent
            opacity={layer.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Moonbeam shafts — tall translucent cylinders angled ~15° from vertical ──

const MOONBEAM_POSITIONS: [number, number, number][] = [
  [-12,  7, -14],
  [ 15,  7,  6],
  [  2,  7, -18],
]

function MoonbeamShafts({ phase }: { phase: 'day' | 'night' }) {
  if (phase !== 'night') return null
  const tiltX = Math.PI * 0.083  // ~15° tilt
  return (
    <>
      {MOONBEAM_POSITIONS.map(([x, y, z], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[tiltX, i * 0.7, 0]}
        >
          <cylinderGeometry args={[0.8, 0.8, 20, 12, 1, true]} />
          <meshBasicMaterial
            color="#ddeeff"
            opacity={0.04}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Ground mist particles — 30 large flat semi-transparent spheres ───────────

interface MistParticle {
  x: number
  z: number
  y: number
  scale: number
  driftPhase: number
  driftSpeed: number
  driftAmp: number
}

const mistParticles: MistParticle[] = Array.from({ length: 30 }, (_, i) => {
  const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
  const s = i * 57.93 + 400
  return {
    x: (seed(s) - 0.5) * 44,
    z: (seed(s + 1) - 0.5) * 44,
    y: seed(s + 2) * 1.0,
    scale: 3.0 + seed(s + 3) * 3.0,
    driftPhase: seed(s + 4) * Math.PI * 2,
    driftSpeed: 0.15 + seed(s + 5) * 0.25,
    driftAmp: 0.4 + seed(s + 6) * 0.6,
  }
})

function GroundMist({ phase }: { phase: 'day' | 'night' }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!groupRef.current || phase !== 'night') return
    const t = clock.getElapsedTime()
    mistParticles.forEach((mp, i) => {
      const mesh = groupRef.current.children[i]
      if (!mesh) return
      const drift = Math.sin(t * mp.driftSpeed + mp.driftPhase) * mp.driftAmp
      mesh.position.x = mp.x + drift
      mesh.position.y = mp.y + Math.sin(t * mp.driftSpeed * 0.5 + mp.driftPhase) * 0.15
    })
  })

  if (phase !== 'night') return null

  return (
    <group ref={groupRef}>
      {mistParticles.map((mp, i) => (
        <mesh
          key={i}
          position={[mp.x, mp.y, mp.z]}
          scale={[mp.scale, mp.scale, mp.scale]}
        >
          <sphereGeometry args={[1, 7, 7]} />
          <meshBasicMaterial
            color="#112233"
            opacity={0.12}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Ancient ruins stone circle ─────────────────────────────────────────────

function AncientRuins() {
  const STONE_COUNT = 8
  const RADIUS = 15
  const CENTER: [number, number, number] = [20, 0, -15]

  return (
    <group position={CENTER}>
      {/* Standing stones at 45° intervals */}
      {Array.from({ length: STONE_COUNT }, (_, i) => {
        const angle = (i / STONE_COUNT) * Math.PI * 2
        const x = Math.cos(angle) * RADIUS
        const z = Math.sin(angle) * RADIUS
        const rotY = angle + Math.PI / 2
        return (
          <RigidBody key={i} type="fixed" colliders="cuboid" position={[x, 1.5, z]}>
            <mesh rotation={[0, rotY, 0]} castShadow>
              <boxGeometry args={[0.8, 3, 0.6]} />
              <meshStandardMaterial color="#3a3a3a" roughness={0.95} metalness={0.05} />
            </mesh>
          </RigidBody>
        )
      })}
      {/* Glowing rune at center */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial
          color="#440066"
          emissive="#9900ff"
          emissiveIntensity={1.2}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#9900ff" intensity={1.5} distance={20} position={[0, 1, 0]} />
    </group>
  )
}

// ─── Magic well ──────────────────────────────────────────────────────────────

function MagicWell() {
  const glowRef = useRef<THREE.PointLight>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 1.2 + Math.sin(clock.getElapsedTime() * 2.2) * 0.5
    }
  })
  return (
    <group position={[-18, 0, -20]}>
      {/* Base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.5, 16]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
        </mesh>
        {/* Outer wall */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.8, 16, 1, true]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner cap to show depth */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.1, 16]} />
          <meshStandardMaterial color="#001133" emissive="#0055ff" emissiveIntensity={0.9} />
        </mesh>
      </RigidBody>
      {/* Glow from inside */}
      <pointLight ref={glowRef} color="#3399ff" intensity={1.5} distance={12} position={[0, 0.5, 0]} />
    </group>
  )
}

// ─── Ghost orbs ──────────────────────────────────────────────────────────────

interface OrbData {
  cx: number
  cz: number
  cy: number
  speedH: number
  speedV: number
  phase: number
  phaseV: number
  radius: number
}

const ghostOrbData: OrbData[] = Array.from({ length: 8 }, (_, i) => {
  const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
  const s = i * 11.3
  return {
    cx: (seed(s) - 0.5) * 30,
    cz: (seed(s + 1) - 0.5) * 30,
    cy: 1.2 + seed(s + 2) * 2.0,
    speedH: 0.25 + seed(s + 3) * 0.3,
    speedV: 0.18 + seed(s + 4) * 0.2,
    phase: seed(s + 5) * Math.PI * 2,
    phaseV: seed(s + 6) * Math.PI * 2,
    radius: 1.5 + seed(s + 7) * 2.0,
  }
})

function GhostOrbs({ phase }: { phase: 'day' | 'night' }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!groupRef.current || phase !== 'night') return
    const t = clock.getElapsedTime()
    ghostOrbData.forEach((od, i) => {
      const mesh = groupRef.current.children[i]
      if (!mesh) return
      // Figure-8 path
      const angle = t * od.speedH + od.phase
      mesh.position.x = od.cx + Math.sin(angle) * od.radius
      mesh.position.z = od.cz + Math.sin(angle * 2) * od.radius * 0.5
      mesh.position.y = od.cy + Math.sin(t * od.speedV + od.phaseV) * 0.5
    })
  })

  if (phase !== 'night') return null

  return (
    <group ref={groupRef}>
      {ghostOrbData.map((od, i) => (
        <mesh key={i} position={[od.cx, od.cy, od.cz]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshBasicMaterial color="#ddeeff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Shooting stars ──────────────────────────────────────────────────────────

function ShootingStars() {
  const starRef = useRef<THREE.Mesh>(null!)
  const stateRef = useRef({ active: false, timer: 0, x: 0, y: 0, z: 0, vx: 0 })

  useFrame((_, dt) => {
    const s = stateRef.current
    s.timer += dt
    if (!s.active && s.timer > 8) {
      // Launch a new shooting star
      s.active = true
      s.timer = 0
      s.x = -80
      s.y = 35 + Math.random() * 20
      s.z = -50 - Math.random() * 80
      s.vx = 60 + Math.random() * 40
    }
    if (s.active) {
      s.x += s.vx * dt
      if (starRef.current) {
        starRef.current.position.set(s.x, s.y, s.z)
        starRef.current.visible = true
      }
      if (s.x > 80) {
        s.active = false
        if (starRef.current) starRef.current.visible = false
      }
    }
  })

  return (
    <mesh ref={starRef} visible={false} rotation={[0, 0, Math.PI / 6]}>
      <boxGeometry args={[3.5, 0.08, 0.08]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  )
}

// ─── Deep Forest Decor — dense atmospheric section z: -45 to -78 ─────────────

function DeepForestDecor() {
  return (
    <>
      {/* Dense mushroom clusters */}
      <MushroomGlow pos={[-8, 0, -44]} scale={1.8} />
      <MushroomGlow pos={[10, 0, -47]} scale={1.5} />
      <MushroomGlow pos={[-14, 0, -52]} scale={2.0} />
      <MushroomGlow pos={[7, 0, -54]} scale={1.6} />
      <MushroomGlow pos={[-5, 0, -58]} scale={1.9} />
      <MushroomGlow pos={[15, 0, -61]} scale={1.4} />
      <MushroomGlow pos={[-12, 0, -65]} scale={2.1} />
      <MushroomGlow pos={[4, 0, -68]} scale={1.7} />
      <MushroomGlow pos={[-9, 0, -72]} scale={1.5} />
      <MushroomGlow pos={[13, 0, -75]} scale={1.8} />
      {/* Ruins pillars */}
      <RuinsPillar pos={[-18, 0, -46]} scale={1.2} rotY={0.3} />
      <RuinsPillar pos={[18, 0, -55]} scale={1.4} rotY={1.1} />
      <RuinsPillar pos={[-17, 0, -63]} scale={1.0} rotY={2.4} />
      <RuinsPillar pos={[16, 0, -71]} scale={1.3} rotY={0.8} />
      {/* Eerie deep-forest lights */}
      <pointLight position={[-10, 3, -50]} color="#4400aa" intensity={3} distance={15} decay={2} />
      <pointLight position={[10, 3, -58]} color="#00aa44" intensity={2.5} distance={12} decay={2} />
      <pointLight position={[-8, 3, -66]} color="#aa0044" intensity={3} distance={14} decay={2} />
      <pointLight position={[8, 3, -74]} color="#0044aa" intensity={2.5} distance={12} decay={2} />
      {/* Crystal clusters on forest floor */}
      <CrystalCluster pos={[-20, 0, -49]} scale={1.3} rotY={0.5} />
      <CrystalCluster pos={[19, 0, -60]} scale={1.5} rotY={1.8} />
      <CrystalCluster pos={[-16, 0, -70]} scale={1.2} rotY={0.2} />
      <CrystalCluster pos={[17, 0, -76]} scale={1.4} rotY={2.7} />
    </>
  )
}

// ─── HauntedMansion ──────────────────────────────────────────────────────────

function HauntedMansion() {
  // 8 window refs for flicker animation
  const winRefs = useRef<(THREE.MeshStandardMaterial | null)[]>(Array(8).fill(null))
  const timeRef = useRef(0)

  useFrame((_, dt) => {
    timeRef.current += dt
    const t = timeRef.current
    winRefs.current.forEach((mat, i) => {
      if (!mat) return
      // Each window flickers at a slightly different freq and phase
      const noise = Math.sin(t * 3.1 + i * 1.73) * Math.sin(t * 1.7 + i * 0.91)
      mat.emissiveIntensity = 2.0 + noise * 1.0
    })
  })

  // 8 window positions on the facade (z face at z = -90 + 6 = -84)
  const windowPositions: [number, number, number][] = [
    [-5, 9, -83.9],
    [-2, 9, -83.9],
    [ 2, 9, -83.9],
    [ 5, 9, -83.9],
    [-5, 5, -83.9],
    [-2, 5, -83.9],
    [ 2, 5, -83.9],
    [ 5, 5, -83.9],
  ]

  return (
    <group>
      {/* Main building */}
      <mesh position={[0, 7, -90]} castShadow>
        <boxGeometry args={[18, 14, 12]} />
        <meshStandardMaterial color="#2a2030" roughness={0.95} />
      </mesh>

      {/* Roof — dark box approximation */}
      <mesh position={[0, 17, -90]} castShadow>
        <boxGeometry args={[16, 6, 12]} />
        <meshStandardMaterial color="#1a1020" roughness={0.95} />
      </mesh>

      {/* Left tower */}
      <mesh position={[-10, 9, -90]} castShadow>
        <cylinderGeometry args={[3, 3, 18, 10]} />
        <meshStandardMaterial color="#251a2e" roughness={0.95} />
      </mesh>
      {/* Left tower roof */}
      <mesh position={[-10, 20, -90]} castShadow>
        <coneGeometry args={[3.5, 5, 10]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.95} />
      </mesh>

      {/* Right tower */}
      <mesh position={[10, 9, -90]} castShadow>
        <cylinderGeometry args={[3, 3, 18, 10]} />
        <meshStandardMaterial color="#251a2e" roughness={0.95} />
      </mesh>
      {/* Right tower roof */}
      <mesh position={[10, 20, -90]} castShadow>
        <coneGeometry args={[3.5, 5, 10]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.95} />
      </mesh>

      {/* 8 flickering candle windows */}
      {windowPositions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[1.2, 1.8, 0.2]} />
          <meshStandardMaterial
            ref={(mat) => { winRefs.current[i] = mat }}
            color="#ffaa00"
            emissive="#ffaa00"
            emissiveIntensity={2}
          />
        </mesh>
      ))}

      {/* Eerie green point light at mansion base */}
      <pointLight
        position={[0, 1, -88]}
        color="#44aa33"
        intensity={3}
        distance={30}
        decay={2}
      />
    </group>
  )
}

// ─── Cemetery ────────────────────────────────────────────────────────────────

/** Deterministic pseudo-random from seed */
function cPseudo(n: number): number {
  return (((Math.sin(n) * 43758.5453) % 1) + 1) % 1
}

function Cemetery() {
  // 12 tombstones in a 4×3 grid, centred around z=-60 x=0
  const tombstones = Array.from({ length: 12 }, (_, i) => {
    const col = i % 4       // 0-3
    const row = Math.floor(i / 4)  // 0-2
    const baseX = (col - 1.5) * 4.0
    const baseZ = -55 - row * 5.0
    const offX = (cPseudo(i * 7.3 + 1) - 0.5) * 1.2
    const offZ = (cPseudo(i * 7.3 + 2) - 0.5) * 1.2
    const tiltZ = (cPseudo(i * 7.3 + 3) - 0.5) * 0.4   // ±0.2 rad
    return { x: baseX + offX, z: baseZ + offZ, tiltZ }
  })

  // 4 dead tree positions
  const deadTrees: [number, number, number][] = [
    [-14, 0, -52],
    [ 14, 0, -58],
    [-12, 0, -67],
    [ 13, 0, -63],
  ]

  // Branch angles for dead trees (3 branches each)
  const branchAngles = [
    [0.6, -0.4, 1.2],
    [0.5, -0.6, 1.1],
    [0.7, -0.3, 1.3],
    [0.4, -0.7, 1.0],
  ]

  return (
    <group>
      {/* Tombstones */}
      {tombstones.map((ts, i) => (
        <group key={i} position={[ts.x, 0, ts.z]} rotation={[0, cPseudo(i * 13.7) * 0.4 - 0.2, ts.tiltZ]}>
          {/* Slab */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[1, 1.8, 0.15]} />
            <meshStandardMaterial color="#555566" roughness={0.95} />
          </mesh>
          {/* Rounded top — small cylinder cap */}
          <mesh position={[0, 1.85, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 0.15, 12]} />
            <meshStandardMaterial color="#555566" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 4 dead trees */}
      {deadTrees.map(([tx, ty, tz], ti) => (
        <group key={ti} position={[tx, ty, tz]}>
          {/* Trunk */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.35, 5, 7]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
          </mesh>
          {/* 3 bare branches */}
          {branchAngles[ti].map((angle, bi) => {
            const sign = bi % 2 === 0 ? 1 : -1
            return (
              <mesh
                key={bi}
                position={[sign * 0.6, 4.0 - bi * 0.5, 0]}
                rotation={[0, 0, angle * sign]}
                castShadow
              >
                <cylinderGeometry args={[0.08, 0.1, 2, 5]} />
                <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* 2 wrought-iron fence sections */}
      {([-8, 8] as const).map((fx, fi) => (
        <group key={fi} position={[fx, 0, -60]}>
          {/* 5 vertical poles */}
          {[0, 0.7, 1.4, 2.1, 2.8].map((px, pi) => (
            <mesh key={pi} position={[px, 1.25, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 2.5, 6]} />
              <meshStandardMaterial color="#222233" roughness={0.7} metalness={0.5} />
            </mesh>
          ))}
          {/* Top crossbar */}
          <mesh position={[1.4, 2.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.9, 5]} />
            <meshStandardMaterial color="#222233" roughness={0.7} metalness={0.5} />
          </mesh>
          {/* Bottom crossbar */}
          <mesh position={[1.4, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.9, 5]} />
            <meshStandardMaterial color="#222233" roughness={0.7} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── GhostlyOrbs (cemetery) ──────────────────────────────────────────────────

interface CemeteryOrbData {
  cx: number
  cz: number
  cy: number
  a: number   // Lissajous freq-x
  b: number   // Lissajous freq-z
  phase: number
  phaseZ: number
  rx: number  // x amplitude
  rz: number  // z amplitude
}

const cemeteryOrbData: CemeteryOrbData[] = Array.from({ length: 6 }, (_, i) => {
  const s = i * 17.91 + 200
  return {
    cx: (cPseudo(s) - 0.5) * 20,
    cz: -55 - cPseudo(s + 1) * 14,
    cy: 0.8 + cPseudo(s + 2) * 1.5,
    a: 1 + Math.floor(cPseudo(s + 3) * 3),       // 1, 2, or 3
    b: 2 + Math.floor(cPseudo(s + 4) * 2),       // 2 or 3
    phase: cPseudo(s + 5) * Math.PI * 2,
    phaseZ: cPseudo(s + 6) * Math.PI * 2,
    rx: 1.5 + cPseudo(s + 7) * 2.5,
    rz: 1.5 + cPseudo(s + 8) * 2.0,
  }
})

function GhostlyOrb({ data }: { data: CemeteryOrbData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.6
    const x = data.cx + Math.sin(data.a * t + data.phase) * data.rx
    const z = data.cz + Math.sin(data.b * t + data.phaseZ) * data.rz
    const y = data.cy + Math.sin(t * 1.3 + data.phase) * 0.4
    if (meshRef.current) meshRef.current.position.set(x, y, z)
    if (lightRef.current) lightRef.current.position.set(x, y, z)
  })

  return (
    <>
      <mesh ref={meshRef} position={[data.cx, data.cy, data.cz]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial
          color="#ccffcc"
          emissive="#88ffaa"
          emissiveIntensity={5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[data.cx, data.cy, data.cz]}
        color="#aaffcc"
        intensity={4}
        distance={8}
        decay={2}
      />
    </>
  )
}

function GhostlyOrbs() {
  return (
    <>
      {cemeteryOrbData.map((od, i) => (
        <GhostlyOrb key={i} data={od} />
      ))}
    </>
  )
}

// ─── PumpkinPatch ─────────────────────────────────────────────────────────────

/** Deterministic pseudo-random for pumpkins */
function ppRand(n: number): number {
  return (((Math.sin(n) * 43758.5453) % 1) + 1) % 1
}

const PUMPKIN_COUNT = 20
const pumpkinData: { x: number; z: number; rotY: number }[] = Array.from(
  { length: PUMPKIN_COUNT },
  (_, i) => {
    const s = i * 29.17 + 700
    return {
      x: -30 - ppRand(s) * 20,          // -30 to -50
      z:  20 + ppRand(s + 1) * 30,      // 20 to 50
      rotY: ppRand(s + 2) * Math.PI * 2,
    }
  }
)

function SinglePumpkin({ x, z, rotY }: { x: number; z: number; rotY: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Body — slightly flattened orange sphere */}
      <mesh scale={[1, 0.85, 1]} castShadow>
        <sphereGeometry args={[1.2, 16, 12]} />
        <meshStandardMaterial color="#ff6600" roughness={0.7} />
      </mesh>

      {/* 5 vertical ridge cylinders */}
      {Array.from({ length: 5 }, (_, ri) => {
        const angle = (ri / 5) * Math.PI * 2
        const rx = Math.cos(angle) * 0.95
        const rz = Math.sin(angle) * 0.95
        return (
          <mesh key={ri} position={[rx, 0, rz]} rotation={[0, angle, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 2.2, 6]} />
            <meshStandardMaterial color="#cc5500" roughness={0.8} />
          </mesh>
        )
      })}

      {/* Stem */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.5, 6]} />
        <meshStandardMaterial color="#3a2a0a" roughness={0.9} />
      </mesh>

      {/* Carved left eye */}
      <mesh position={[-0.35, 0.15, 1.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.32, 0.22, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
      {/* Carved right eye */}
      <mesh position={[0.35, 0.15, 1.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.32, 0.22, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>

      {/* Jagged smile — 4 tiny boxes */}
      <mesh position={[-0.38, -0.28, 1.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
      <mesh position={[-0.12, -0.22, 1.12]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.18, 0.2, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
      <mesh position={[0.14, -0.22, 1.12]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.18, 0.2, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
      <mesh position={[0.39, -0.28, 1.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>
    </group>
  )
}

function PumpkinPatch() {
  return (
    <>
      {pumpkinData.map((pd, i) => (
        <SinglePumpkin key={i} x={pd.x} z={pd.z} rotY={pd.rotY} />
      ))}
      {/* One pointLight per group of 4 pumpkins */}
      {Array.from({ length: Math.ceil(PUMPKIN_COUNT / 4) }, (_, gi) => {
        const slice = pumpkinData.slice(gi * 4, gi * 4 + 4)
        const cx = slice.reduce((s, p) => s + p.x, 0) / slice.length
        const cz = slice.reduce((s, p) => s + p.z, 0) / slice.length
        return (
          <pointLight
            key={gi}
            position={[cx, 1.2, cz]}
            color="#ff8800"
            intensity={3}
            distance={6}
            decay={2}
          />
        )
      })}
    </>
  )
}

// ─── WitchHut ─────────────────────────────────────────────────────────────────

interface SmokeParticle {
  phase: number
  speed: number
  xOff: number
}
const smokeParticles: SmokeParticle[] = Array.from({ length: 10 }, (_, i) => ({
  phase: (i / 10) * Math.PI * 2,
  speed: 0.5 + ppRand(i * 5.13 + 300) * 0.5,
  xOff: (ppRand(i * 3.7 + 301) - 0.5) * 0.6,
}))

const cauldronParticles: { phase: number; speed: number; xOff: number; zOff: number }[] =
  Array.from({ length: 15 }, (_, i) => ({
    phase: (i / 15) * Math.PI * 2,
    speed: 0.6 + ppRand(i * 7.31 + 400) * 0.8,
    xOff: (ppRand(i * 3.1 + 401) - 0.5) * 0.7,
    zOff: (ppRand(i * 2.9 + 402) - 0.5) * 0.7,
  }))

function WitchHut() {
  const smokeRef = useRef<THREE.Group>(null!)
  const cauldronRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Smoke rises from chimney [40, 0, 30] + chimney offset [1.5, 9, -1.5]
    if (smokeRef.current) {
      smokeParticles.forEach((sp, i) => {
        const child = smokeRef.current.children[i]
        if (!child) return
        const progress = ((t * sp.speed + sp.phase) % (Math.PI * 2)) / (Math.PI * 2)
        child.position.set(sp.xOff * progress, progress * 4, 0)
        const scale = 0.2 + progress * 0.6
        child.scale.setScalar(scale)
        ;(child as THREE.Mesh).material &&
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).setValues({
            opacity: 0.25 * (1 - progress),
          })
      })
    }

    // Cauldron bubbles at [40, 0, 30] + cauldron offset [-2, 0, 2]
    if (cauldronRef.current) {
      cauldronParticles.forEach((cp, i) => {
        const child = cauldronRef.current.children[i]
        if (!child) return
        const progress = ((t * cp.speed + cp.phase) % (Math.PI * 2)) / (Math.PI * 2)
        child.position.set(cp.xOff, progress * 3.5, cp.zOff)
        const scale = 0.08 + (1 - progress) * 0.12
        child.scale.setScalar(scale)
      })
    }
  })

  // Hut base position
  const HX = 40
  const HY = 0
  const HZ = 30

  return (
    <group position={[HX, HY, HZ]}>
      {/* ── Main body — slightly tilted for crooked look */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 3, 0]} rotation={[0, 0, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[7, 6, 6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* ── Roof — 4 angled boxes forming a pyramid */}
      {/* Front slope */}
      <mesh position={[0, 6.8, 1.8]} rotation={[-0.65, 0, 0.05]} castShadow>
        <boxGeometry args={[7.6, 0.3, 4.5]} />
        <meshStandardMaterial color="#1a0a05" roughness={0.95} />
      </mesh>
      {/* Back slope */}
      <mesh position={[0, 6.8, -1.8]} rotation={[0.65, 0, 0.05]} castShadow>
        <boxGeometry args={[7.6, 0.3, 4.5]} />
        <meshStandardMaterial color="#1a0a05" roughness={0.95} />
      </mesh>
      {/* Left slope */}
      <mesh position={[-2.6, 6.8, 0]} rotation={[0, 0, 0.65 + 0.05]} castShadow>
        <boxGeometry args={[0.3, 4.5, 6.4]} />
        <meshStandardMaterial color="#150805" roughness={0.95} />
      </mesh>
      {/* Right slope */}
      <mesh position={[2.6, 6.8, 0]} rotation={[0, 0, -0.65 + 0.05]} castShadow>
        <boxGeometry args={[0.3, 4.5, 6.4]} />
        <meshStandardMaterial color="#150805" roughness={0.95} />
      </mesh>

      {/* ── Chimney */}
      <mesh position={[1.5, 9, -1.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 3, 8]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>

      {/* ── Smoke particles above chimney */}
      <group ref={smokeRef} position={[1.5, 10.5, -1.5]}>
        {smokeParticles.map((_, i) => (
          <mesh key={i} position={[0, i * 0.3, 0]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color="#888888" transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* ── Front windows — glowing yellow */}
      <mesh position={[-2, 4, 3.05]}>
        <boxGeometry args={[1.2, 1.2, 0.15]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={4} />
      </mesh>
      <mesh position={[2, 4, 3.05]}>
        <boxGeometry args={[1.2, 1.2, 0.15]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0, 3, 4]} color="#ffaa00" intensity={3} distance={10} decay={2} />

      {/* ── Door */}
      <mesh position={[0, 1.25, 3.06]}>
        <boxGeometry args={[1.2, 2.5, 0.2]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.9} />
      </mesh>

      {/* ── Crooked fence — 8 poles in front with varied heights */}
      {Array.from({ length: 8 }, (_, fi) => {
        const fx = -3.5 + fi * 1.0
        const fh = 0.5 + ppRand(fi * 6.3 + 500) * 1.0   // 0.5–1.5
        const ftilt = (ppRand(fi * 4.1 + 501) - 0.5) * 0.25
        return (
          <mesh key={fi} position={[fx, fh / 2, 4.2]} rotation={[0, 0, ftilt]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, fh, 5]} />
            <meshStandardMaterial color="#3a2010" roughness={0.95} />
          </mesh>
        )
      })}

      {/* ── Cauldron */}
      <mesh position={[-2, 0.3, 2.5]} castShadow>
        <cylinderGeometry args={[0.8, 0.65, 0.6, 12]} />
        <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Green liquid disc on top */}
      <mesh position={[-2, 0.62, 2.5]}>
        <cylinderGeometry args={[0.72, 0.72, 0.08, 12]} />
        <meshStandardMaterial color="#22aa22" emissive="#44ff44" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[-2, 1.2, 2.5]} color="#44ff44" intensity={3} distance={6} decay={2} />

      {/* ── Cauldron bubble particles */}
      <group ref={cauldronRef} position={[-2, 0.65, 2.5]}>
        {cauldronParticles.map((_, i) => (
          <mesh key={i} position={[0, i * 0.1, 0]}>
            <sphereGeometry args={[1, 5, 5]} />
            <meshBasicMaterial color="#44ff44" transparent opacity={0.7} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── BloodyMoon ───────────────────────────────────────────────────────────────

function BloodyMoon({ phase }: { phase: 'day' | 'night' }) {
  if (phase !== 'night') return null
  return (
    <group position={[0, 50, -200]}>
      {/* Main moon disc */}
      <mesh>
        <sphereGeometry args={[15, 24, 24]} />
        <meshStandardMaterial
          color="#cc2200"
          emissive="#881100"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Atmospheric halo */}
      <mesh>
        <sphereGeometry args={[18, 16, 16]} />
        <meshBasicMaterial
          color="#550000"
          transparent
          opacity={0.15}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Faint red ambient influence */}
      <pointLight color="#ff2200" intensity={0.4} distance={300} decay={1} />
    </group>
  )
}

// ─── VampireGargoyles ─────────────────────────────────────────────────────────

function SingleGargoyle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Crouching body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.5, 1.5, 2]} />
        <meshStandardMaterial color="#444444" roughness={0.95} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-1.3, 1.2, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[2, 0.15, 1.5]} />
        <meshStandardMaterial color="#333333" roughness={0.95} />
      </mesh>
      {/* Right wing */}
      <mesh position={[1.3, 1.2, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[2, 0.15, 1.5]} />
        <meshStandardMaterial color="#333333" roughness={0.95} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0.7]} castShadow>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial color="#3d3d3d" roughness={0.95} />
      </mesh>
      {/* Left horn */}
      <mesh position={[-0.3, 2.55, 0.65]} rotation={[0.3, 0, -0.3]} castShadow>
        <coneGeometry args={[0.12, 0.55, 6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      {/* Right horn */}
      <mesh position={[0.3, 2.55, 0.65]} rotation={[0.3, 0, 0.3]} castShadow>
        <coneGeometry args={[0.12, 0.55, 6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>
      {/* Glowing red eyes */}
      <mesh position={[-0.22, 1.85, 1.26]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={6} />
      </mesh>
      <mesh position={[0.22, 1.85, 1.26]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={6} />
      </mesh>
    </group>
  )
}

function VampireGargoyles() {
  // Placed on castle battlements/towers (castle at z=-120)
  // Left tower top: [-8, 22, -120], right tower top: [8, 22, -120]
  // Main keep corners: [-5, 18, -120], [5, 18, -120]
  const positions: [number, number, number][] = [
    [-8, 22, -120],
    [ 8, 22, -120],
    [-5, 18, -116],
    [ 5, 18, -116],
  ]
  return (
    <>
      {positions.map((pos, i) => (
        <SingleGargoyle key={i} position={pos} />
      ))}
    </>
  )
}

// ─── VampireCastleRuins ───────────────────────────────────────────────────────

const BAT_COUNT = 20

interface BatData {
  orbitRadius: number
  orbitSpeed: number
  phase: number
  yBase: number
  ySpeed: number
  yPhase: number
  tiltPhase: number
}

const batData: BatData[] = Array.from({ length: BAT_COUNT }, (_, i) => {
  const pseudo = (n: number) => (((Math.sin(n) * 43758.5453) % 1) + 1) % 1
  const s = i * 53.7 + 900
  return {
    orbitRadius: 12 + pseudo(s) * 16,
    orbitSpeed: 0.4 + pseudo(s + 1) * 0.9,
    phase: pseudo(s + 2) * Math.PI * 2,
    yBase: 25 + pseudo(s + 3) * 10,
    ySpeed: 0.5 + pseudo(s + 4) * 0.8,
    yPhase: pseudo(s + 5) * Math.PI * 2,
    tiltPhase: pseudo(s + 6) * Math.PI * 2,
  }
})

function CastleBats() {
  // InstancedMesh: each bat = 2 wing boxes + 1 body sphere is too complex for instanced;
  // use a single flat cross-shaped mesh per bat as a silhouette.
  const wingMeshRef = useRef<THREE.InstancedMesh>(null!)
  const bodyMeshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!wingMeshRef.current || !bodyMeshRef.current) return
    const t = clock.getElapsedTime()
    batData.forEach((bd, i) => {
      const angle = t * bd.orbitSpeed + bd.phase
      const x = Math.cos(angle) * bd.orbitRadius
      const z = -120 + Math.sin(angle) * bd.orbitRadius * 0.5
      const y = bd.yBase + Math.sin(t * bd.ySpeed + bd.yPhase) * 2.0
      // Wing flap: tilt wings up/down
      const tilt = Math.sin(t * 6 + bd.tiltPhase) * 0.4

      dummy.position.set(x, y, z)
      dummy.rotation.set(tilt, angle + Math.PI / 2, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      wingMeshRef.current.setMatrixAt(i, dummy.matrix)
      bodyMeshRef.current.setMatrixAt(i, dummy.matrix)
    })
    wingMeshRef.current.instanceMatrix.needsUpdate = true
    bodyMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {/* Wings: flat wide box */}
      <instancedMesh ref={wingMeshRef} args={[undefined, undefined, BAT_COUNT]}>
        <boxGeometry args={[1.4, 0.08, 0.5]} />
        <meshBasicMaterial color="#110008" />
      </instancedMesh>
      {/* Body: tiny sphere approximated as a small box */}
      <instancedMesh ref={bodyMeshRef} args={[undefined, undefined, BAT_COUNT]}>
        <sphereGeometry args={[0.18, 5, 5]} />
        <meshBasicMaterial color="#1a0010" />
      </instancedMesh>
    </>
  )
}

function VampireCastleRuins({ phase }: { phase: 'day' | 'night' }) {
  // 12 arch windows: some flicker between intensity 1–3
  const winRefs = useRef<(THREE.MeshStandardMaterial | null)[]>(Array(12).fill(null))
  const timeRef = useRef(0)

  useFrame((_, dt) => {
    timeRef.current += dt
    const t = timeRef.current
    winRefs.current.forEach((mat, i) => {
      if (!mat) return
      const noise =
        Math.sin(t * 2.7 + i * 1.33) * Math.sin(t * 4.1 + i * 2.07)
      mat.emissiveIntensity = 2.0 + noise * 1.0  // 1.0 – 3.0
    })
  })

  // 12 window positions on the front face (z = -120 + 6 = -114)
  const windowPositions: [number, number, number][] = [
    // Upper row — 4 windows
    [-4.5, 14, -113.9],
    [-1.5, 14, -113.9],
    [ 1.5, 14, -113.9],
    [ 4.5, 14, -113.9],
    // Middle row — 4 windows
    [-4.5, 10, -113.9],
    [-1.5, 10, -113.9],
    [ 1.5, 10, -113.9],
    [ 4.5, 10, -113.9],
    // Lower row — 4 windows
    [-4.5,  6, -113.9],
    [-1.5,  6, -113.9],
    [ 1.5,  6, -113.9],
    [ 4.5,  6, -113.9],
  ]

  return (
    <group>
      {/* ── Moonlight highlight from behind the castle (blue-white silhouette rim) ── */}
      <directionalLight
        position={[0, 60, -160]}
        target-position={[0, 9, -120]}
        intensity={0.5}
        color="#aabfff"
        castShadow={false}
      />

      {/* ── Main castle keep ── */}
      <mesh position={[0, 9, -120]} castShadow>
        <boxGeometry args={[14, 18, 12]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.97} />
      </mesh>

      {/* ── Crumbling wall section extending from keep ── */}
      <mesh position={[-17, 4, -120]} castShadow>
        <boxGeometry args={[20, 8, 2]} />
        <meshStandardMaterial color="#221222" roughness={0.97} />
      </mesh>
      {/* Right wall stub */}
      <mesh position={[17, 3, -120]} castShadow>
        <boxGeometry args={[12, 6, 2]} />
        <meshStandardMaterial color="#1e1020" roughness={0.97} />
      </mesh>

      {/* ── Left tower (full height h=22) ── */}
      <mesh position={[-8, 11, -120]} castShadow>
        <cylinderGeometry args={[3, 3, 22, 10]} />
        <meshStandardMaterial color="#1a0a18" roughness={0.97} />
      </mesh>
      {/* Left tower battlement ring (slightly wider) */}
      <mesh position={[-8, 22.5, -120]} castShadow>
        <cylinderGeometry args={[3.5, 3.5, 2, 10]} />
        <meshStandardMaterial color="#1a0a18" roughness={0.97} />
      </mesh>
      {/* Left battlement notches — 4 dark boxes cut into top */}
      {[0, 1, 2, 3].map((ni) => {
        const angle = (ni / 4) * Math.PI * 2
        const nx = -8 + Math.cos(angle) * 3.5
        const nz = -120 + Math.sin(angle) * 3.5
        return (
          <mesh key={ni} position={[nx, 23, nz]} castShadow>
            <boxGeometry args={[1.1, 1.6, 1.1]} />
            <meshStandardMaterial color="#090509" roughness={0.99} />
          </mesh>
        )
      })}

      {/* ── Right tower (broken, h=12, shorter) ── */}
      <mesh position={[8, 6, -120]} castShadow>
        <cylinderGeometry args={[3, 3, 12, 10]} />
        <meshStandardMaterial color="#1a0a18" roughness={0.97} />
      </mesh>
      {/* Broken top edge — angled slab to simulate a jagged break */}
      <mesh position={[8, 12.5, -120]} rotation={[0.25, 0.3, 0.15]} castShadow>
        <boxGeometry args={[6.5, 1.2, 6.5]} />
        <meshStandardMaterial color="#160814" roughness={0.99} />
      </mesh>
      {/* Right tower battlement ring */}
      <mesh position={[8, 12, -120]} castShadow>
        <cylinderGeometry args={[3.5, 3.5, 2, 10]} />
        <meshStandardMaterial color="#1a0a18" roughness={0.97} />
      </mesh>
      {/* Right battlement notches */}
      {[0, 1, 2, 3].map((ni) => {
        const angle = (ni / 4) * Math.PI * 2
        const nx = 8 + Math.cos(angle) * 3.5
        const nz = -120 + Math.sin(angle) * 3.5
        return (
          <mesh key={ni} position={[nx, 13, nz]} castShadow>
            <boxGeometry args={[1.1, 1.6, 1.1]} />
            <meshStandardMaterial color="#090509" roughness={0.99} />
          </mesh>
        )
      })}

      {/* ── 12 arch windows — box + half-sphere arch top ── */}
      {windowPositions.map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]}>
          {/* Window rect */}
          <mesh>
            <boxGeometry args={[0.9, 1.4, 0.2]} />
            <meshStandardMaterial
              ref={(mat) => { winRefs.current[i] = mat }}
              color="#550022"
              emissive="#990033"
              emissiveIntensity={2}
            />
          </mesh>
          {/* Arch top — half-sphere */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.45, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#550022"
              emissive="#990033"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* Red ambient glow inside castle */}
      {phase === 'night' && (
        <pointLight
          position={[0, 9, -118]}
          color="#880022"
          intensity={2}
          distance={40}
          decay={2}
        />
      )}

      {/* ── Circling bats ── */}
      <CastleBats />

      {/* ── Gargoyles on battlements ── */}
      <VampireGargoyles />
    </group>
  )
}

// ─── ForestSilhouettes — dark tree shapes far in background ──────────────────

interface SilTree {
  x: number
  z: number
  trunkR: number
  trunkH: number
  hasCrown: boolean
  crownR: number
  branchAngles: number[]
}

const silTreeData: SilTree[] = (() => {
  const rng = (n: number) => (((Math.sin(n) * 43758.5453) % 1) + 1) % 1
  return Array.from({ length: 20 }, (_, i) => {
    const s = i * 61.7 + 1300
    const hasCrown = rng(s + 4) > 0.4
    return {
      x: (rng(s) - 0.5) * 90,
      z: -60 - rng(s + 1) * 40,
      trunkR: 0.5 + rng(s + 2) * 0.5,
      trunkH: 8 + rng(s + 3) * 7,
      hasCrown,
      crownR: 3 + rng(s + 5) * 4,
      branchAngles: hasCrown
        ? []
        : [
            (rng(s + 6) - 0.5) * 1.2,
            (rng(s + 7) - 0.5) * 1.2,
            (rng(s + 8) - 0.5) * 1.0,
          ],
    }
  })
})()

function ForestSilhouettes() {
  return (
    <>
      {silTreeData.map((st, i) => (
        <group key={i} position={[st.x, 0, st.z]}>
          {/* Trunk */}
          <mesh position={[0, st.trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[st.trunkR * 0.7, st.trunkR, st.trunkH, 6]} />
            <meshBasicMaterial color="#0a0a0a" />
          </mesh>
          {/* Crown — sphere or bare branches */}
          {st.hasCrown ? (
            <mesh position={[0, st.trunkH + st.crownR * 0.6, 0]} castShadow>
              <sphereGeometry args={[st.crownR, 7, 7]} />
              <meshBasicMaterial color="#0a0a0a" />
            </mesh>
          ) : (
            st.branchAngles.map((angle, bi) => {
              const sign = bi % 2 === 0 ? 1 : -1
              return (
                <mesh
                  key={bi}
                  position={[sign * 0.8, st.trunkH - bi * 1.5, 0]}
                  rotation={[0, 0, angle]}
                  castShadow
                >
                  <cylinderGeometry args={[0.12, 0.18, 3.5, 5]} />
                  <meshBasicMaterial color="#0a0a0a" />
                </mesh>
              )
            })
          )}
        </group>
      ))}
    </>
  )
}

// ─── HowlParticles — sound-wave rings + misty breath from howl ────────────────

const HOWL_RING_COUNT = 4
const HOWL_BREATH_COUNT = 8

// Mouth world position (werewolf is at [30, 6, -20], muzzle ~at [30, 9.1, -19.3])
const HOWL_ORIGIN: [number, number, number] = [30, 9.1, -19.3]

interface HowlRingState {
  phase: number
}

const howlRingPhases: HowlRingState[] = Array.from({ length: HOWL_RING_COUNT }, (_, i) => ({
  phase: (i / HOWL_RING_COUNT) * Math.PI * 2,
}))

interface BreathParticle {
  xOff: number
  zOff: number
  phase: number
  speed: number
}

const breathParticles: BreathParticle[] = Array.from({ length: HOWL_BREATH_COUNT }, (_, i) => {
  const rng = (n: number) => (((Math.sin(n) * 43758.5453) % 1) + 1) % 1
  const s = i * 37.4 + 2100
  return {
    xOff: (rng(s) - 0.5) * 0.5,
    zOff: -(rng(s + 1) * 0.4),
    phase: rng(s + 2) * Math.PI * 2,
    speed: 0.6 + rng(s + 3) * 0.6,
  }
})

function HowlParticles({ phase }: { phase: 'day' | 'night' }) {
  const ringsRef = useRef<(THREE.Mesh | null)[]>(Array(HOWL_RING_COUNT).fill(null))
  const breathRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (phase !== 'night') return
    const t = clock.getElapsedTime()

    // Expanding rings
    ringsRef.current.forEach((mesh, i) => {
      if (!mesh) return
      const raw = (t * 0.55 + howlRingPhases[i].phase / (Math.PI * 2)) % 1
      const s = raw * 5
      mesh.scale.set(s + 0.01, s + 0.01, s + 0.01)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.55 * (1 - raw))
    })

    // Breath clouds drifting from muzzle
    if (breathRef.current) {
      breathParticles.forEach((bp, i) => {
        const child = breathRef.current.children[i]
        if (!child) return
        const progress = ((t * bp.speed + bp.phase) % (Math.PI * 2)) / (Math.PI * 2)
        child.position.set(
          bp.xOff + progress * 0.6,
          progress * 1.2,
          bp.zOff - progress * 0.8,
        )
        child.scale.setScalar(0.12 + progress * 0.25)
        ;(child as THREE.Mesh).material &&
          ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).setValues({
            opacity: 0.4 * (1 - progress),
          })
      })
    }
  })

  if (phase !== 'night') return null

  return (
    <group position={HOWL_ORIGIN}>
      {/* Expanding torus rings */}
      {howlRingPhases.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => { ringsRef.current[i] = m }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.9, 0.06, 8, 32]} />
          <meshBasicMaterial
            color="#aabbcc"
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Misty breath clouds */}
      <group ref={breathRef}>
        {breathParticles.map((_, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[1, 5, 5]} />
            <meshBasicMaterial
              color="#cce0ee"
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── WerewolfFigure — dramatic silhouette howling at the bloody moon ───────────

function WerewolfFigure({ phase }: { phase: 'day' | 'night' }) {
  const bodyRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    if (!bodyRef.current) return
    const t = clock.getElapsedTime()
    bodyRef.current.rotation.x = -0.3 + Math.sin(t * 0.2) * 0.15
  })

  // Placed at [30, 0, -20]; rock raises it by ~3 units → figure base at y≈3
  const BASE_Y = 3.0

  return (
    <group position={[30, 0, -20]} rotation={[0, Math.PI + 0.3, 0]}>
      {/* ── Craggy rock formation ── */}
      <mesh position={[0, 0.8, 0]} rotation={[0.05, 0.2, 0.08]} castShadow>
        <boxGeometry args={[3.5, 1.6, 3.0]} />
        <meshStandardMaterial color="#334433" roughness={0.98} />
      </mesh>
      <mesh position={[0.8, 1.4, -0.3]} rotation={[0.15, 0.4, 0.1]} castShadow>
        <boxGeometry args={[2.4, 1.2, 2.0]} />
        <meshStandardMaterial color="#2e3d2e" roughness={0.98} />
      </mesh>
      <mesh position={[-0.6, 1.6, 0.4]} rotation={[-0.1, -0.3, 0.12]} castShadow>
        <boxGeometry args={[1.8, 1.0, 1.6]} />
        <meshStandardMaterial color="#3a4a3a" roughness={0.98} />
      </mesh>

      {/* ── Werewolf body group (animated sway) ── */}
      <group ref={bodyRef} position={[0, BASE_Y, 0]}>
        {/* Body cylinder */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 2.2, 10]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>

        {/* Chest sphere */}
        <mesh position={[0, 1.6, 0]} scale={[1.1, 1.0, 0.8]} castShadow>
          <sphereGeometry args={[0.7, 10, 10]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 2.6, 0]} castShadow>
          <sphereGeometry args={[0.6, 10, 10]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>

        {/* Muzzle / snout */}
        <mesh position={[0, 2.45, -0.55]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.35, 3.15, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[0.2, 0.5, 6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
        </mesh>
        {/* Right ear */}
        <mesh position={[0.35, 3.15, 0]} rotation={[0, 0, 0.2]} castShadow>
          <coneGeometry args={[0.2, 0.5, 6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
        </mesh>

        {/* Glowing amber eyes */}
        <mesh position={[-0.2, 2.6, -0.52]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#ff8800"
            emissive="#ff8800"
            emissiveIntensity={8}
          />
        </mesh>
        <mesh position={[0.2, 2.6, -0.52]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#ff8800"
            emissive="#ff8800"
            emissiveIntensity={8}
          />
        </mesh>

        {/* Left arm — raised upward-left */}
        <mesh
          position={[-0.9, 1.9, 0]}
          rotation={[0.3, 0, -1.1]}
          castShadow
        >
          <cylinderGeometry args={[0.25, 0.25, 1.5, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
        {/* Left claws (3 thin cones at arm tip) */}
        {([-0.15, 0, 0.15] as const).map((xOff, ci) => (
          <mesh
            key={ci}
            position={[-1.7 + xOff * 0.3, 2.65, 0.4 + xOff]}
            rotation={[0.8, 0, -0.9]}
            castShadow
          >
            <coneGeometry args={[0.08, 0.3, 5]} />
            <meshStandardMaterial color="#1a0a00" roughness={0.9} />
          </mesh>
        ))}

        {/* Right arm — raised upward-right */}
        <mesh
          position={[0.9, 1.9, 0]}
          rotation={[0.3, 0, 1.1]}
          castShadow
        >
          <cylinderGeometry args={[0.25, 0.25, 1.5, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
        {/* Right claws */}
        {([-0.15, 0, 0.15] as const).map((xOff, ci) => (
          <mesh
            key={ci}
            position={[1.7 + xOff * 0.3, 2.65, 0.4 + xOff]}
            rotation={[0.8, 0, 0.9]}
            castShadow
          >
            <coneGeometry args={[0.08, 0.3, 5]} />
            <meshStandardMaterial color="#1a0a00" roughness={0.9} />
          </mesh>
        ))}

        {/* Left leg — upper segment */}
        <mesh position={[-0.35, 0.2, 0]} rotation={[0.15, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.0, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
        {/* Left leg — lower segment (bent at knee) */}
        <mesh position={[-0.35, -0.65, 0.2]} rotation={[-0.3, 0, 0.08]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.0, 8]} />
          <meshStandardMaterial color="#2e2010" roughness={0.9} />
        </mesh>

        {/* Right leg — upper segment */}
        <mesh position={[0.35, 0.2, 0]} rotation={[0.15, 0, -0.08]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.0, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
        {/* Right leg — lower segment */}
        <mesh position={[0.35, -0.65, 0.2]} rotation={[-0.3, 0, -0.08]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.0, 8]} />
          <meshStandardMaterial color="#2e2010" roughness={0.9} />
        </mesh>

        {/* Tail */}
        <mesh position={[0, 0.9, 0.65]} rotation={[-0.6, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.12, 0.8, 7]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>

        {/* Fur tufts — 8 thin cylinders on shoulders and head */}
        {([
          [-0.65, 2.15, 0.1, 0.3, 0, -0.5],
          [0.65, 2.15, 0.1, 0.3, 0, 0.5],
          [-0.55, 2.35, -0.1, 0.5, 0, -0.4],
          [0.55, 2.35, -0.1, 0.5, 0, 0.4],
          [-0.3, 2.9, 0.2, 0.2, 0.4, -0.3],
          [0.3, 2.9, 0.2, 0.2, 0.4, 0.3],
          [-0.15, 3.05, -0.35, 0.15, -0.5, 0],
          [0.15, 3.05, -0.35, 0.15, -0.5, 0],
        ] as const).map(([fx, fy, fz, rx, ry, rz], fi) => (
          <mesh key={fi} position={[fx, fy, fz]} rotation={[rx, ry, rz]} castShadow>
            <cylinderGeometry args={[0.05, 0.03, 0.35, 4]} />
            <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
          </mesh>
        ))}

        {/* Amber eye glow point light */}
        {phase === 'night' && (
          <pointLight
            position={[0, 2.6, -0.5]}
            color="#ff8800"
            intensity={2}
            distance={8}
            decay={2}
          />
        )}
      </group>
    </group>
  )
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
      <ForestFogBands />
      <WillOWisps />
      <MoonbeamShafts phase={phase} />
      <GroundMist phase={phase} />

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

      {/* ── Ancient ruins ── */}
      <AncientRuins />

      {/* ── Magic well ── */}
      <MagicWell />

      {/* ── Ghost orbs (night only) ── */}
      <GhostOrbs phase={phase} />

      {/* ── Shooting stars ── */}
      <ShootingStars />

      {/* ── Magic mushroom ring ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 8
        const mx = -10 + Math.cos(angle) * r
        const mz = 10 + Math.sin(angle) * r
        return <MushroomGlow key={i} pos={[mx, 0, mz]} scale={0.9 + (i % 3) * 0.15} />
      })}

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

      {/* ── Crystal clusters — magical glowing crystals spread across the forest floor ── */}
      <CrystalCluster pos={[-7,  0,  8]}  scale={1.2} rotY={0.3} />
      <CrystalCluster pos={[9,   0, -7]}  scale={1.0} rotY={1.1} />
      <CrystalCluster pos={[-13, 0,  3]}  scale={1.4} rotY={0.7} />
      <CrystalCluster pos={[4,   0, 14]}  scale={0.9} rotY={2.0} />
      <CrystalCluster pos={[-4,  0, -13]} scale={1.1} rotY={0.5} />
      <CrystalCluster pos={[17,  0,  5]}  scale={1.3} rotY={1.8} />
      <CrystalCluster pos={[-17, 0, -9]}  scale={1.0} rotY={0.9} />
      <CrystalCluster pos={[11,  0, 12]}  scale={1.2} rotY={2.4} />

      {/* ── Ice blocks — frozen pond area near the magic well + ice formations ── */}
      {/* Frozen pond cluster near [-18, 0, -20] well */}
      <IceBlock pos={[-15, 0, -17]} scale={1.1} rotY={0.4} />
      <IceBlock pos={[-21, 0, -18]} scale={0.9} rotY={1.2} />
      <IceBlock pos={[-19, 0, -23]} scale={1.3} rotY={0.8} />
      {/* Scattered ice formations in the north-east forest */}
      <IceBlock pos={[22,  0,  8]}  scale={1.0} rotY={2.1} />
      <IceBlock pos={[-8,  0, -20]} scale={1.2} rotY={1.5} />

      {/* ── MagicPotion — glowing potion artifacts near key locations ── */}
      {/* Near the magic well [-18, 0, -20] — scattered around the well base */}
      <MagicPotion pos={[-16, 0.1, -19]} scale={0.9} rotY={0.5} />
      <MagicPotion pos={[-20, 0.1, -22]} scale={1.0} rotY={1.8} />
      {/* Ancient ruins stone circle [20, 0, -15] — offerings inside the rune ring */}
      <MagicPotion pos={[17, 0.1, -13]} scale={0.85} rotY={2.4} />
      <MagicPotion pos={[23, 0.1, -17]} scale={0.95} rotY={-0.7} />
      {/* Campfire area [0, 0, 0] — potions placed near the fire stones */}
      <MagicPotion pos={[2.5, 0.1, 2]} scale={0.8} rotY={1.0} />
      <MagicPotion pos={[-2.5, 0.1, 2]} scale={0.9} rotY={-1.2} />

      {/* ── BossWizard "Тёмный Маг" — guardian at the center of the Ancient Ruins ── */}
      {/* AncientRuins center = [20, 0, -15]. Wizard stands inside the rune circle. */}
      <BossWizard pos={[20, 0, -15]} scale={1.4} rotY={Math.PI} />

      {/* ── CrystalSword — legendary swords stuck in ground ── */}
      <CrystalSword pos={[0, 0, -10]}  scale={2} />
      <CrystalSword pos={[5, 0, -25]}  scale={2} />
      <CrystalSword pos={[-8, 0, -40]} scale={2} />

      {/* ── MagicGate — main goal / portal area at the far end ── */}
      <MagicGate pos={[0, 0, -60]} scale={3} rotY={0} />

      {/* ── MagicMushroom — светящиеся грибы в ночном лесу ── */}
      <MagicMushroom pos={[6,   0,  -8]}  scale={1.5} rotY={0.4} />
      <MagicMushroom pos={[-9,  0, -20]}  scale={2.0} rotY={1.1} />
      <MagicMushroom pos={[14,  0, -32]}  scale={1.8} rotY={0.7} />
      <MagicMushroom pos={[-4,  0, -50]}  scale={2.5} rotY={2.0} />
      <MagicMushroom pos={[10,  0, -65]}  scale={1.6} rotY={0.3} />
      <MagicMushroom pos={[-12, 0, -78]}  scale={2.2} rotY={1.8} />

      {/* ── FairyHouse — glowing huts deep in the dark forest ── */}
      <FairyHouse pos={[10, 0, -18]} scale={1.3} rotY={0.7} />
      <FairyHouse pos={[-12, 0, -32]} scale={1.5} rotY={-0.4} />
      <FairyHouse pos={[8, 0, -55]} scale={1.2} rotY={1.8} />
      <pointLight color="#ff8833" intensity={2.0} distance={8} position={[10, 2, -18]} />
      <pointLight color="#ff8833" intensity={2.0} distance={8} position={[-12, 2, -32]} />
      <pointLight color="#ff8833" intensity={2.0} distance={8} position={[8, 2, -55]} />

      {/* ── DragonEgg — dark artifacts scattered in the forest ── */}
      <DragonEgg pos={[3, 0, -25]} scale={1.4} rotY={0.3} />
      <DragonEgg pos={[-5, 0, -48]} scale={1.6} rotY={2.2} />
      <pointLight color="#8800ff" intensity={1.8} distance={7} position={[3, 1.5, -25]} />
      <pointLight color="#8800ff" intensity={1.8} distance={7} position={[-5, 1.5, -48]} />

      {/* ── DeepForestDecor — dense atmospheric section z: -45 to -78 ── */}
      <DeepForestDecor />

      {/* ── WerewolfFigure — howling werewolf on cliff at [30, 0, -20] ── */}
      <WerewolfFigure phase={phase} />

      {/* ── HowlParticles — sound-wave rings + misty breath ── */}
      <HowlParticles phase={phase} />

      {/* ── ForestSilhouettes — dark tree shapes far in background ── */}
      <ForestSilhouettes />

      {/* ── BloodyMoon — dramatic large red moon in the sky ── */}
      <BloodyMoon phase={phase} />

      {/* ── VampireCastleRuins — far background z: -120 ── */}
      <VampireCastleRuins phase={phase} />

      {/* ── HauntedMansion — background z: -80 to -100 ── */}
      <HauntedMansion />

      {/* ── Cemetery — graveyard z: -50 to -70 ── */}
      <Cemetery />

      {/* ── GhostlyOrbs — Lissajous orbs floating through cemetery ── */}
      <GhostlyOrbs />

      {/* ── Haunted mist + additional wisp layer at forest depth ── */}
      <HauntedMist />

      {/* ── Pumpkin patch — jack-o-lantern field west of center ── */}
      <PumpkinPatch />

      {/* ── Witch's hut — crooked cottage at [40, 0, 30] ── */}
      <WitchHut />

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
