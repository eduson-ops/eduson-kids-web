import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, Mushroom, GrassTuft, Well, Bench, MushroomRed, MushroomGlow, TreeRound, Lantern, Flag, FlowerPot, NpcFairy, Stage, Trophy, PalmTree, CrystalCluster, BossGolem, LavaRock, MagicMushroom, FairyHouse } from '../Scenery'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'
import WaterSurface from '../WaterSurface'
import GradientSky from '../GradientSky'

/**
 * GardenWorld — educational remake of «Grow a Garden» (Roblox top-4, 2025 breakout).
 *
 * Curriculum: M3 capstone «Pet Math Sim» pre-study + introducing timers and probability.
 * Python hooks (later):
 *   plant_seed(x, z, type="carrot")    → _emit("plant_seed", ...)
 *   harvest_at(x, z)                    → _emit("harvest", ...)
 *   mutate_if(chance=0.1)               → probability
 *
 * MVP: процедурная сетка грядок 4×4, на каждой — маленький росток (зелёный конус),
 * некоторые "созрели" (цветок-корона + монета). Пчелы-враги над грядками.
 * NPC-фермер в центре. Цель: собрать 10 монет (созревший урожай).
 */

const GROUND = '#6fd83e'
const DIRT = '#6b4f2a'
const DIRT_EDGE = '#5a3f1e'
const GRID_SIZE = 4        // 4×4 = 16 грядок
const BED_SIZE = 2.4       // ширина одной грядки
const BED_GAP = 0.4        // расстояние между

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -25]}>
      <mesh receiveShadow>
        <boxGeometry args={[60, 0.5, 115]} />
        <meshStandardMaterial color={GROUND} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Fence() {
  // Низкий забор по периметру огорода (декор)
  const W = 22
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, 0.3, -W / 2], size: [W, 0.6, 0.2] },
    { pos: [0, 0.3, W / 2],  size: [W, 0.6, 0.2] },
    { pos: [-W / 2, 0.3, 0], size: [0.2, 0.6, W] },
    { pos: [W / 2, 0.3, 0],  size: [0.2, 0.6, W] },
  ]
  return (
    <>
      {items.map((it, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={it.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={it.size} />
            <meshStandardMaterial color="#a37144" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/**
 * Bed FSM: 'empty' → 'growing' → 'ripe' → 'harvested'
 * Прикоснулся к пустой — посадилось семя. Через GROW_SECS становится спелым.
 * Прикоснулся к спелому — собрал, +монеты, грядка пустая.
 */
const GROW_SECS = 6

function Bed({
  pos,
  initialRipe,
  seed,
  onHarvest,
}: {
  pos: [number, number, number]
  initialRipe: boolean
  seed: number
  onHarvest: () => void
}) {
  const plantRef = useRef<THREE.Group>(null!)
  const phase = useRef(seed * 0.01)
  const [stage, setStage] = useState<'empty' | 'growing' | 'ripe'>(initialRipe ? 'ripe' : 'empty')
  const growT = useRef(0)

  useFrame((_, dt) => {
    phase.current += dt
    if (plantRef.current) {
      plantRef.current.rotation.z = Math.sin(phase.current * 1.5) * 0.05
    }
    if (stage === 'growing') {
      growT.current += dt
      if (growT.current >= GROW_SECS) setStage('ripe')
    }
  })

  const onTouch = (name: string | undefined) => {
    if (name !== 'player') return
    if (stage === 'empty') {
      setStage('growing')
      growT.current = 0
      SFX.click()
    } else if (stage === 'ripe') {
      setStage('empty')
      addCoin(2)
      SFX.coin()
      onHarvest()
    }
  }

  // Масштаб растения зависит от стадии
  const growth = stage === 'empty' ? 0 : stage === 'growing' ? Math.min(1, growT.current / GROW_SECS) : 1
  const showSprout = stage === 'growing' || stage === 'ripe'
  const showFlower = stage === 'ripe'

  return (
    <group position={pos}>
      <RigidBody
        type="fixed"
        colliders="cuboid"
        sensor
        onIntersectionEnter={({ other }) => onTouch(other.rigidBodyObject?.name)}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[BED_SIZE, 0.2, BED_SIZE]} />
          <meshStandardMaterial color={DIRT} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[BED_SIZE + 0.08, 0.2, BED_SIZE + 0.08]} />
          <meshStandardMaterial color={DIRT_EDGE} roughness={0.95} />
        </mesh>
      </RigidBody>
      <group ref={plantRef} position={[0, 0.15, 0]} scale={[growth, growth, growth]}>
        {showSprout && (
          <mesh position={[0, 0.4, 0]} castShadow>
            <coneGeometry args={[0.35, 0.8, 8]} />
            <meshStandardMaterial color="#3fb74d" roughness={0.7} />
          </mesh>
        )}
        {showFlower && (
          <>
            <mesh position={[0, 0.95, 0]} castShadow>
              <sphereGeometry args={[0.28, 12, 10]} />
              <meshStandardMaterial color="#ff5ab1" emissive="#ff5ab1" emissiveIntensity={0.35} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#ffd43c" emissive="#ffd43c" emissiveIntensity={0.7} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

function buildGrid(): Array<{ pos: [number, number, number]; ripe: boolean; seed: number }> {
  const out: Array<{ pos: [number, number, number]; ripe: boolean; seed: number }> = []
  const total = BED_SIZE + BED_GAP
  const offset = -((GRID_SIZE - 1) * total) / 2
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      // ~35% грядок созрели — каждая третья по кольцу
      const ripe = (i * 7 + j * 3) % 3 === 0
      out.push({
        pos: [offset + i * total, 0, offset + j * total],
        ripe,
        seed: i * GRID_SIZE + j,
      })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Falling flower petals — 30 pink flat planes drifting downward with swirl
// ---------------------------------------------------------------------------

const PETAL_COUNT = 30

// Static random seed data computed once
const PETAL_SEEDS = Array.from({ length: PETAL_COUNT }, (_) => ({
  x: (Math.random() - 0.5) * 25,
  y: Math.random() * 12,
  z: (Math.random() - 0.5) * 25,
  phase: Math.random() * Math.PI * 2,
  speed: 0.4 + Math.random() * 0.5,
  swirl: 0.6 + Math.random() * 0.8,
}))

// Mutable per-petal positions tracked across frames (avoids reading from GPU)
const _petalPos = PETAL_SEEDS.map((s) => ({ x: s.x, y: s.y, z: s.z }))

function FallingPetals() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < PETAL_COUNT; i++) {
      const s = PETAL_SEEDS[i]!
      const pos = _petalPos[i]!
      // Fall downward, reset at top
      pos.y -= s.speed * 0.016
      if (pos.y < 0) {
        pos.y = 12
        pos.x = (Math.random() - 0.5) * 25
        pos.z = (Math.random() - 0.5) * 25
      }
      // Gentle X drift + Y swirl rotation
      pos.x += Math.sin(t * s.swirl + s.phase) * 0.003
      dummy.position.set(pos.x, pos.y, pos.z)
      dummy.rotation.set(
        0,
        Math.sin(t * 0.7 + s.phase) * 1.2,
        Math.cos(t * 0.5 + s.phase) * 0.4,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PETAL_COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.15, 0.2]} />
      <meshBasicMaterial color="#ffaacc" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// Grass glow patches — bioluminescent circles pulsing at dusk
// ---------------------------------------------------------------------------

const GLOW_PATCH_COUNT = 10

const GLOW_PATCHES = Array.from({ length: GLOW_PATCH_COUNT }, (_, i) => ({
  x: (Math.random() - 0.5) * 30,
  z: (Math.random() - 0.5) * 30,
  radius: 0.8 + Math.random() * 0.7,
  phase: i * 1.3,
}))

const glowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const glowFragmentShader = `
  uniform float iTime;
  uniform float iPhase;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float d = length(uv);
    float pulse = 0.55 + 0.45 * sin(iTime * 0.6 + iPhase);
    float alpha = (1.0 - smoothstep(0.4, 1.0, d)) * pulse;
    vec3 innerColor = vec3(0.267, 1.0, 0.267);   // #44ff44
    vec3 midColor   = vec3(0.0,   0.667, 0.0);   // #00aa00
    float t = smoothstep(0.0, 0.6, d);
    vec3 col = mix(innerColor, midColor, t);
    gl_FragColor = vec4(col, alpha * 0.75);
  }
`

function GrassGlowPatches() {
  const timeRef = useRef(0)
  const materialRefs = useRef<THREE.ShaderMaterial[]>([])

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat && mat.uniforms) {
        mat.uniforms.iTime!.value = timeRef.current
      }
    })
  })

  return (
    <>
      {GLOW_PATCHES.map((p, i) => {
        const uniforms = {
          iTime: { value: 0 },
          iPhase: { value: p.phase },
        }
        return (
          <mesh
            key={i}
            position={[p.x, 0.01, p.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[p.radius, 16]} />
            <shaderMaterial
              ref={(el) => { if (el) materialRefs.current[i] = el }}
              vertexShader={glowVertexShader}
              fragmentShader={glowFragmentShader}
              uniforms={uniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// PollenDrift — 80 tiny pollen spheres drifting lazily above the garden
// ---------------------------------------------------------------------------

const POLLEN_COUNT = 80
const POLLEN_COLORS = ['#ffffcc', '#ffeeaa', '#ffffff']

const POLLEN_DATA = Array.from({ length: POLLEN_COUNT }, (_, i) => ({
  x: (Math.random() - 0.5) * 26,
  y: 1 + Math.random() * 4,
  z: (Math.random() - 0.5) * 26,
  phase: Math.random() * Math.PI * 2,
  phaseZ: Math.random() * Math.PI * 2,
  speed: 0.18 + Math.random() * 0.18,
  driftAmp: 0.8 + Math.random() * 0.8,
  riseAmp: 0.25 + Math.random() * 0.35,
  radius: 0.03 + Math.random() * 0.03,
  color: POLLEN_COLORS[i % 3] as string,
}))

function PollenDrift() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    POLLEN_DATA.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * p.driftAmp,
        p.y + Math.sin(t * p.speed * 0.7 + p.phase) * p.riseAmp,
        p.z + Math.sin(t * p.speed * 0.9 + p.phaseZ) * p.driftAmp * 0.6,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POLLEN_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.045, 5, 4]} />
      <meshBasicMaterial color="#ffffcc" />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// Butterflies — 12 fully-articulated butterflies with wings, body and antennas
// ---------------------------------------------------------------------------

const BUTTERFLY_WING_COLORS = ['#ff88cc', '#ffcc44', '#88ddff', '#88ff88', '#ff8844']

// Lissajous orbit homes: flower bed area (z ~-8..8) and orchard fringe
const BUTTERFLY_HOMES: Array<[number, number, number]> = [
  [-8, 1.2, -4], [6, 1.5, -6], [-3, 1.0, 4], [10, 1.8, 2],
  [-5, 1.3, -10], [3, 1.0, 8], [-12, 1.6, 0], [8, 1.4, -12],
  [0, 1.2, -6], [-9, 1.7, 6], [12, 1.1, -3], [-4, 1.5, 10],
]

const BUTTERFLY_CONFIG = BUTTERFLY_HOMES.map((home, i) => ({
  home,
  phase: (i / BUTTERFLY_HOMES.length) * Math.PI * 2,
  flapPhase: Math.random() * Math.PI * 2,
  orbitA: 2.5 + Math.random() * 1.5,
  orbitB: 1.8 + Math.random() * 1.2,
  orbitSpeedA: 0.35 + Math.random() * 0.25,
  orbitSpeedB: 0.55 + Math.random() * 0.3,
  color: BUTTERFLY_WING_COLORS[i % BUTTERFLY_WING_COLORS.length] as string,
}))

function ButterflyMesh({ cfg }: { cfg: typeof BUTTERFLY_CONFIG[0] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const leftWingRef = useRef<THREE.Mesh>(null!)
  const rightWingRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Lissajous path around home
    const x = cfg.home[0] + Math.cos(t * cfg.orbitSpeedA + cfg.phase) * cfg.orbitA
    const y = cfg.home[1] + Math.sin(t * cfg.orbitSpeedB * 0.7 + cfg.phase) * 0.4
    const z = cfg.home[2] + Math.sin(t * cfg.orbitSpeedB + cfg.phase + 0.5) * cfg.orbitB
    groupRef.current.position.set(x, y, z)
    // Face direction of travel (approximate)
    groupRef.current.rotation.y = t * cfg.orbitSpeedA + cfg.phase + Math.PI / 2
    // Wing flap
    const flap = Math.sin(t * 8 + cfg.flapPhase) * 0.6
    leftWingRef.current.rotation.z  =  flap
    rightWingRef.current.rotation.z = -flap
  })

  return (
    <group ref={groupRef}>
      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.3, 0, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.6, 0.5, 0.02]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.88} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.3, 0, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.6, 0.5, 0.02]} />
        <meshBasicMaterial color={cfg.color} transparent opacity={0.88} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshBasicMaterial color="#333300" />
      </mesh>
      {/* Left antenna */}
      <mesh position={[-0.08, 0.22, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
        <meshBasicMaterial color="#333300" />
      </mesh>
      {/* Right antenna */}
      <mesh position={[0.08, 0.22, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
        <meshBasicMaterial color="#333300" />
      </mesh>
    </group>
  )
}

function Butterflies() {
  const configs = useMemo(() => BUTTERFLY_CONFIG, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <ButterflyMesh key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// SunbeamShafts — 4 semi-transparent cylinders simulating sunbeams through leaves
// ---------------------------------------------------------------------------

const SUNBEAM_POSITIONS: Array<[number, number, number]> = [
  [-10, 4, -10],
  [ 10, 4, -10],
  [-10, 4,  10],
  [ 10, 4,  10],
]

function SunbeamShafts() {
  const tiltRad = (20 * Math.PI) / 180

  return (
    <>
      {SUNBEAM_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          // Tilt 20° from vertical — alternate lean direction per shaft
          rotation={[tiltRad * (i < 2 ? 1 : -1), (i % 2 === 0 ? 0.4 : -0.4), 0]}
        >
          <cylinderGeometry args={[0.4, 0.4, 8, 8, 1, true]} />
          <meshBasicMaterial
            color="#ffffcc"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// RainbowArc — 7 torus rings in rainbow colors arching above the garden
// ---------------------------------------------------------------------------

const RAINBOW_BANDS: Array<{ radius: number; color: string }> = [
  { radius:  8, color: '#ff2200' },
  { radius:  9, color: '#ff8800' },
  { radius: 10, color: '#ffee00' },
  { radius: 11, color: '#44dd00' },
  { radius: 12, color: '#0088ff' },
  { radius: 13, color: '#4400cc' },
  { radius: 14, color: '#aa00ff' },
]

function RainbowArc() {
  return (
    <group position={[0, 5, -4]} rotation={[Math.PI / 2, 0, 0]}>
      {RAINBOW_BANDS.map((band, i) => (
        <mesh key={i}>
          <torusGeometry args={[band.radius, 0.12, 6, 40, Math.PI]} />
          <meshBasicMaterial
            color={band.color}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Bees — 6 articulated bees with elliptical body, stripes, and buzzing wings
// ---------------------------------------------------------------------------

// Figure-8 homes near flower beds
const BEE_HOMES: Array<[number, number, number]> = [
  [-5, 1.2, -4], [5, 1.1, -6], [0, 1.4, 2],
  [-8, 1.3, 0],  [8, 1.2, 4], [-3, 1.5, -8],
]

const BEE_CONFIG = BEE_HOMES.map((home, i) => ({
  home,
  phase: (i / BEE_HOMES.length) * Math.PI * 2,
  buzzPhase: Math.random() * Math.PI * 2,
  fig8Speed: 0.8 + Math.random() * 0.5,
  fig8A: 1.8 + Math.random() * 1.0,
  fig8B: 0.9 + Math.random() * 0.6,
}))

function BeeMesh({ cfg }: { cfg: typeof BEE_CONFIG[0] }) {
  const groupRef    = useRef<THREE.Group>(null!)
  const leftWingRef  = useRef<THREE.Mesh>(null!)
  const rightWingRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Figure-8: parametric (cos, sin*cos) scaled
    const u = t * cfg.fig8Speed + cfg.phase
    const x = cfg.home[0] + Math.cos(u) * cfg.fig8A
    const y = cfg.home[1] + Math.sin(t * 1.2 + cfg.phase) * 0.2
    const z = cfg.home[2] + Math.sin(u) * Math.cos(u) * cfg.fig8B * 2
    groupRef.current.position.set(x, y, z)
    groupRef.current.rotation.y = u + Math.PI / 2
    // Wing buzz
    const buzz = Math.sin(t * 20 + cfg.buzzPhase) * 0.3
    leftWingRef.current.rotation.z  =  buzz
    rightWingRef.current.rotation.z = -buzz
  })

  return (
    <group ref={groupRef}>
      {/* Body — elliptical sphere via scale */}
      <mesh scale={[1, 0.8, 1.4]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      {/* Stripe 1 */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.4, 0.08, 0.42]} />
        <meshBasicMaterial color="#333300" />
      </mesh>
      {/* Stripe 2 */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.4, 0.08, 0.42]} />
        <meshBasicMaterial color="#333300" />
      </mesh>
      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.2, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.01]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.2, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.01]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Bees() {
  const configs = useMemo(() => BEE_CONFIG, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <BeeMesh key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// WaterSprinkler — 2 rotating-arm garden sprinklers with particle water arcs
// ---------------------------------------------------------------------------

const SPRINKLER_COUNT = 30  // water particles per sprinkler

const SPRINKLER_POSITIONS: Array<[number, number, number]> = [
  [-7, 0, -4],
  [7, 0, -4],
]

function SprinklerUnit({ pos }: { pos: [number, number, number] }) {
  const armRef  = useRef<THREE.Mesh>(null!)
  const waterRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  // Each particle: random initial offset on arm, phase
  const particles = useMemo(
    () => Array.from({ length: SPRINKLER_COUNT }, (_, i) => ({
      phase: (i / SPRINKLER_COUNT) * Math.PI * 2,
      tOffset: i / SPRINKLER_COUNT,
    })),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Rotate arm
    armRef.current.rotation.y = t * 1.2

    // Shoot water particles from arm tip in arc with gravity
    const armAngle = t * 1.2
    const tipX = Math.cos(armAngle) * 0.75
    const tipZ = Math.sin(armAngle) * 0.75
    const tipY = 0.5  // arm y height

    particles.forEach((p, i) => {
      const tLife = ((t * 0.8 + p.tOffset) % 1.0)  // 0..1 life cycle
      // Projectile arc: initial velocity tangential to arm
      const vx = -Math.sin(armAngle) * 3.0
      const vz =  Math.cos(armAngle) * 3.0
      const vy = 4.0
      const px = pos[0] + tipX + vx * tLife
      const py = pos[1] + tipY + vy * tLife - 5.0 * tLife * tLife  // gravity
      const pz = pos[2] + tipZ + vz * tLife
      if (py < pos[1]) {
        // below ground — park off-screen
        dummy.position.set(pos[0], -10, pos[2])
      } else {
        dummy.position.set(px, py, pz)
      }
      dummy.scale.setScalar(0.5 + (1 - tLife) * 0.5)
      dummy.updateMatrix()
      waterRef.current.setMatrixAt(i, dummy.matrix)
    })
    waterRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.7} />
      </mesh>
      {/* Rotating arm */}
      <mesh ref={armRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.6} />
      </mesh>
      {/* Water particles */}
      <instancedMesh ref={waterRef} args={[undefined, undefined, SPRINKLER_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.6} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

function WaterSprinklers() {
  const positions = useMemo(() => SPRINKLER_POSITIONS, [])
  return (
    <>
      {positions.map((p, i) => (
        <SprinklerUnit key={i} pos={p} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// GardenSunRays — 5 warm light shaft cones filtering down from above the canopy
// ---------------------------------------------------------------------------

const SUN_RAY_POSITIONS: Array<[number, number, number]> = [
  [5,  14, -10],
  [-6, 14, -20],
  [8,  14, -30],
  [-4, 14, -40],
  [3,  14, -50],
]

function GardenSunRays() {
  const meshRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.06 + 0.02 * Math.sin(t + i)
    })
  })

  return (
    <>
      {SUN_RAY_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el }}
          position={pos}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[2.5, 18, 32]} />
          <meshBasicMaterial
            color="#fffacc"
            transparent
            opacity={0.06}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// GardenBoundary — picket fence posts + flower/bush border + gate arch
// ---------------------------------------------------------------------------

// Left fence posts: x=-30, z from -5 to -77 every 4 units (19 steps → 20 posts)
const LEFT_POSTS: Array<[number, number, number]> = Array.from({ length: 20 }, (_, i) => (
  [-30, 0.6, -5 - i * 3.684] as [number, number, number]
))
// Right fence posts: x=+30, same z range
const RIGHT_POSTS: Array<[number, number, number]> = Array.from({ length: 20 }, (_, i) => (
  [30, 0.6, -5 - i * 3.684] as [number, number, number]
))

// Flower positions: x=±28, 8 positions per side
const FLOWER_Z_POSITIONS: number[] = [-10, -20, -30, -40, -50, -60, -70, -78]
// Bush positions: x=±26, 4 positions per side
const BUSH_Z_POSITIONS: number[] = [-15, -35, -55, -75]

function GardenBoundary() {
  const postColor = '#e8d5b0'

  return (
    <group>
      {/* ---- Left fence posts ---- */}
      {LEFT_POSTS.map((pos, i) => (
        <mesh key={`lp-${i}`} position={pos} castShadow receiveShadow>
          <boxGeometry args={[0.15, 1.2, 0.15]} />
          <meshStandardMaterial color={postColor} roughness={0.8} />
        </mesh>
      ))}

      {/* ---- Right fence posts ---- */}
      {RIGHT_POSTS.map((pos, i) => (
        <mesh key={`rp-${i}`} position={pos} castShadow receiveShadow>
          <boxGeometry args={[0.15, 1.2, 0.15]} />
          <meshStandardMaterial color={postColor} roughness={0.8} />
        </mesh>
      ))}

      {/* ---- Left flower border ---- */}
      {FLOWER_Z_POSITIONS.map((z, i) => (
        <Flowers key={`lf-${i}`} pos={[-28, 0, z]} scale={1.0} />
      ))}
      {/* ---- Right flower border ---- */}
      {FLOWER_Z_POSITIONS.map((z, i) => (
        <Flowers key={`rf-${i}`} pos={[28, 0, z]} scale={1.0} />
      ))}

      {/* ---- Left bush border ---- */}
      {BUSH_Z_POSITIONS.map((z, i) => (
        <Bush key={`lb-${i}`} pos={[-26, 0, z]} variant={i % 2} scale={1.0} />
      ))}
      {/* ---- Right bush border ---- */}
      {BUSH_Z_POSITIONS.map((z, i) => (
        <Bush key={`rb-${i}`} pos={[26, 0, z]} variant={(i + 1) % 2} scale={1.0} />
      ))}

      {/* ---- Gate arch at entrance (z=-5) ---- */}
      {/* Left gate post */}
      <mesh position={[-4, 1.25, -5] as [number, number, number]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 2.5, 0.3]} />
        <meshStandardMaterial color={postColor} roughness={0.8} />
      </mesh>
      {/* Right gate post */}
      <mesh position={[4, 1.25, -5] as [number, number, number]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 2.5, 0.3]} />
        <meshStandardMaterial color={postColor} roughness={0.8} />
      </mesh>
      {/* Arch torus */}
      <mesh position={[0, 2.5, -5] as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.18, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa00" emissiveIntensity={0.8} roughness={0.4} />
      </mesh>
      {/* Gate glow lights */}
      <pointLight color="#ffcc44" intensity={2} distance={8} position={[-4, 2.6, -5] as [number, number, number]} />
      <pointLight color="#ffcc44" intensity={2} distance={8} position={[4, 2.6, -5] as [number, number, number]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// AppleOrchard — 12-16 apple trees filling the extended boundary zone
// ---------------------------------------------------------------------------

// Deterministic tree layout: irregular offset on a base grid
const ORCHARD_TREE_DATA: Array<{
  pos: [number, number, number]
  rotY: number
  apples: Array<[number, number, number]>
}> = (() => {
  // 4 cols × 4 rows base grid, with gentle pseudorandom offsets
  const cols = 4
  const rows = 4
  const xStart = -18
  const xStep = 12
  const zStart = -58
  const zStep = 8.5

  // Simple seeded pseudo-random (no Math.random — deterministic)
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1

  const trees: typeof ORCHARD_TREE_DATA = []

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const idx = c * rows + r
      const bx = xStart + c * xStep
      const bz = zStart - r * zStep
      const ox = (pr(idx * 2)     - 0.5) * 4.0   // ±2 offset
      const oz = (pr(idx * 2 + 1) - 0.5) * 3.5

      const tx = bx + ox
      const tz = bz + oz

      // 7 apples per tree — small offsets inside the canopy sphere
      const apples: Array<[number, number, number]> = Array.from({ length: 7 }, (_, a) => {
        const phi   = pr(idx * 100 + a * 3)     * Math.PI * 2
        const theta = pr(idx * 100 + a * 3 + 1) * Math.PI
        const rr    = 1.0 + pr(idx * 100 + a * 3 + 2) * 2.2
        return [
          Math.sin(theta) * Math.cos(phi) * rr,
          Math.cos(theta) * rr * 0.75,          // flatten slightly on y
          Math.sin(theta) * Math.sin(phi) * rr,
        ] as [number, number, number]
      })

      trees.push({
        pos: [tx, 0, tz],
        rotY: pr(idx * 7) * Math.PI * 2,
        apples,
      })
    }
  }

  return trees
})()

// 4 warm canopy point-light positions inside the orchard
const ORCHARD_POINT_LIGHTS: Array<[number, number, number]> = [
  [-12, 5, -62],
  [ 12, 5, -62],
  [-12, 5, -74],
  [ 12, 5, -74],
]

function AppleTree({
  pos,
  rotY,
  apples,
}: {
  pos: [number, number, number]
  rotY: number
  apples: Array<[number, number, number]>
}) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
        <meshStandardMaterial color="#6b3d1a" roughness={0.95} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[3.5, 14, 12]} />
        <meshStandardMaterial color="#2d8b3a" roughness={0.8} />
      </mesh>
      {/* Apples */}
      {apples.map((ap, i) => (
        <mesh key={i} position={[ap[0], 4.5 + ap[1], ap[2]]} castShadow>
          <sphereGeometry args={[0.25, 7, 6]} />
          <meshStandardMaterial
            color="#dd2222"
            emissive="#cc0000"
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

function AppleOrchard() {
  return (
    <group>
      {ORCHARD_TREE_DATA.map((tree, i) => (
        <AppleTree key={i} pos={tree.pos} rotY={tree.rotY} apples={tree.apples} />
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// OrchardAtmosphere — golden-hour directional + warm point lights
// ---------------------------------------------------------------------------

function OrchardAtmosphere() {
  return (
    <>
      {/* Warm directional golden-hour light aimed down-forward over the orchard */}
      {/* position [0,20,-70] aimed at [0,0,-70] ≈ direction [0.3,-1,0.5] normalized */}
      <directionalLight
        color="#ffcc88"
        intensity={1.2}
        position={[0, 20, -70]}
      />
      {/* Soft orange under-canopy fill lights */}
      {ORCHARD_POINT_LIGHTS.map((p, i) => (
        <pointLight
          key={i}
          color="#ff9944"
          intensity={2}
          distance={15}
          decay={2}
          position={p}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// PickedBasket — 5 simple woven-basket props scattered around the orchard
// ---------------------------------------------------------------------------

const BASKET_POSITIONS: Array<[number, number, number]> = [
  [-15, 0, -59],
  [  8, 0, -63],
  [ -4, 0, -70],
  [ 16, 0, -76],
  [ -8, 0, -82],
]

function PickedBasket({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Basket body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#8b5e2a" roughness={0.9} />
      </mesh>
      {/* Lid — slightly darker, offset upward */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.12, 0.85]} />
        <meshStandardMaterial color="#6b4318" roughness={0.85} />
      </mesh>
    </group>
  )
}

function PickedBaskets() {
  return (
    <>
      {BASKET_POSITIONS.map((p, i) => (
        <PickedBasket key={i} pos={p} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Windmill — Dutch-style decorative windmill with spinning sail assembly
// ---------------------------------------------------------------------------

function Windmill() {
  const sailRef = useRef<THREE.Group>(null!)

  useFrame((_, dt) => {
    if (sailRef.current) {
      sailRef.current.rotation.z += 0.008
    }
  })

  return (
    <group position={[35, 0, -30]}>
      {/* Tower: tapers from r=2.5 at base to r=1.5 at top */}
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2.5, 12, 8]} />
        <meshStandardMaterial color="#c8a860" roughness={0.85} />
      </mesh>

      {/* Cap / roof: cone */}
      <mesh position={[0, 13.5, 0]} castShadow>
        <coneGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color="#884422" roughness={0.8} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1, 1.6]} castShadow>
        <boxGeometry args={[1, 2, 0.2]} />
        <meshStandardMaterial color="#5a2a10" roughness={0.9} />
      </mesh>

      {/* Window lower */}
      <mesh position={[0, 4, 1.55]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
        <meshStandardMaterial color="#88aacc" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Window upper */}
      <mesh position={[0, 8, 1.55]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 12]} />
        <meshStandardMaterial color="#88aacc" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Sail hub — sticks out from front face at y=10 */}
      <mesh position={[0, 10, 1.8]}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 10]} />
        <meshStandardMaterial color="#5a3010" roughness={0.85} />
      </mesh>

      {/* Spinning sail assembly — rotates around Z */}
      <group ref={sailRef} position={[0, 10, 2.1]}>
        {/* 4 arms at 0°, 90°, 180°, 270° */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((rot, i) => (
          <group key={i} rotation={[0, 0, rot]}>
            {/* Structural arm */}
            <mesh position={[0, 3.5, 0]}>
              <boxGeometry args={[0.3, 7, 0.2]} />
              <meshStandardMaterial color="#6b3d1a" roughness={0.9} />
            </mesh>
            {/* Sail cloth — slightly offset forward */}
            <mesh position={[0.25, 3.5, 0.15]}>
              <boxGeometry args={[0.8, 6, 0.05]} />
              <meshStandardMaterial color="#eeeecc" roughness={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Warm ambient point light near windmill */}
      <pointLight color="#ffdd88" intensity={2} distance={15} position={[0, 7, 0]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// HarvestWagon — wooden wagon filled with vegetables near the apple orchard
// ---------------------------------------------------------------------------

function WheelWithSpokes({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Wheel rim */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 14]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.9} />
      </mesh>
      {/* 4 spokes crossing the diameter */}
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((rot, i) => (
        <mesh key={i} rotation={[0, 0, rot]}>
          <boxGeometry args={[1.4, 0.08, 0.07]} />
          <meshStandardMaterial color="#3d1a05" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function HarvestWagon() {
  // Vegetable positions (relative to wagon group centre)
  const carrots: Array<[number, number, number]> = [
    [-1.2, 1.2, 0.4], [-0.4, 1.3, -0.5], [0.5, 1.2, 0.3],
    [1.0, 1.3, -0.3], [-0.8, 1.4, 0.0], [0.2, 1.4, 0.6],
  ]
  const zucchini: Array<[number, number, number]> = [
    [-1.0, 1.2, -0.2], [0.0, 1.3, -0.7], [0.8, 1.2, 0.5], [-0.3, 1.4, 0.8],
  ]
  const tomatoes: Array<[number, number, number]> = [
    [-0.6, 1.2, 0.2], [0.4, 1.2, -0.4], [1.2, 1.3, 0.1],
    [-1.3, 1.3, -0.5], [0.0, 1.5, 0.4],
  ]

  return (
    <group position={[8, 0, -65]}>
      {/* Wagon body */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.5, 2.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Wagon side planks */}
      {/* Front wall */}
      <mesh position={[0, 1.3, 1.35]} castShadow>
        <boxGeometry args={[4, 0.8, 0.1]} />
        <meshStandardMaterial color="#7a3a0f" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.3, -1.35]} castShadow>
        <boxGeometry args={[4, 0.8, 0.1]} />
        <meshStandardMaterial color="#7a3a0f" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-2.05, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 2.5]} />
        <meshStandardMaterial color="#7a3a0f" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[2.05, 1.3, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 2.5]} />
        <meshStandardMaterial color="#7a3a0f" roughness={0.9} />
      </mesh>

      {/* 4 wooden wheels at corners */}
      <WheelWithSpokes position={[-1.6, 0.5, 1.4]} />
      <WheelWithSpokes position={[ 1.6, 0.5, 1.4]} />
      <WheelWithSpokes position={[-1.6, 0.5, -1.4]} />
      <WheelWithSpokes position={[ 1.6, 0.5, -1.4]} />

      {/* Cargo: orange spheres (carrots/pumpkins) */}
      {carrots.map((p, i) => (
        <mesh key={`c-${i}`} position={p} castShadow>
          <sphereGeometry args={[0.35, 8, 7]} />
          <meshStandardMaterial color="#ff8c00" roughness={0.6} />
        </mesh>
      ))}

      {/* Cargo: green cylinders (zucchini) */}
      {zucchini.map((p, i) => (
        <mesh key={`z-${i}`} position={p} rotation={[0.4 * (i % 2 === 0 ? 1 : -1), 0.3 * i, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 7]} />
          <meshStandardMaterial color="#4caf50" roughness={0.7} />
        </mesh>
      ))}

      {/* Cargo: red spheres (tomatoes) */}
      {tomatoes.map((p, i) => (
        <mesh key={`t-${i}`} position={p} castShadow>
          <sphereGeometry args={[0.3, 8, 7]} />
          <meshStandardMaterial color="#e53935" roughness={0.5} />
        </mesh>
      ))}

      {/* Overhead orange-brown point light */}
      <pointLight color="#cc7733" intensity={1.5} distance={8} position={[0, 4, 0]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// ChickenFlock — 8 chickens wandering and pecking near the flower bed zone
// ---------------------------------------------------------------------------

const CHICKEN_COUNT = 8

// Static config computed once — no Math.random() at module level in hooks
const CHICKEN_CONFIG = Array.from({ length: CHICKEN_COUNT }, (_, i) => {
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
  return {
    orbitRadius: 4 + pr(i * 3) * 5,          // 4..9 from centre
    orbitSpeed:  0.12 + pr(i * 3 + 1) * 0.1, // walk speed
    orbitPhase:  (i / CHICKEN_COUNT) * Math.PI * 2,
    bobPhase:    pr(i * 3 + 2) * Math.PI * 2,
    peckPhase:   pr(i * 5) * Math.PI * 2,
    home: [
      (pr(i * 7)     - 0.5) * 6,  // x wander home
      (pr(i * 7 + 1) - 0.5) * 6,  // z wander home
    ] as [number, number],
  }
})

function ChickenMesh({ cfg }: { cfg: typeof CHICKEN_CONFIG[0] }) {
  const groupRef   = useRef<THREE.Group>(null!)
  const headRef    = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Wander in an oval orbit around the home position
    const wx = cfg.home[0] + Math.cos(t * cfg.orbitSpeed + cfg.orbitPhase) * cfg.orbitRadius
    const wz = cfg.home[1] + Math.sin(t * cfg.orbitSpeed * 0.7 + cfg.orbitPhase + 0.8) * cfg.orbitRadius * 0.6
    const wy = Math.sin(t * 8 + cfg.bobPhase) * 0.05  // body bob while walking

    groupRef.current.position.set(wx, wy, wz)
    // Face direction of travel
    groupRef.current.rotation.y = t * cfg.orbitSpeed + cfg.orbitPhase + Math.PI / 2

    // Peck: head bobs down every ~1.5 s (slow sine wave)
    const peckCycle = Math.sin(t * 4 + cfg.peckPhase)
    if (headRef.current) {
      headRef.current.position.y = 0.55 + peckCycle * 0.1
    }
  })

  const BODY_COLOR  = '#f5e8c0'
  const BEAK_COLOR  = '#ff9900'
  const COMB_COLOR  = '#cc0000'
  const LEG_COLOR   = '#ff9900'

  return (
    <group ref={groupRef}>
      {/* Body — sphere scaled to oval */}
      <mesh scale={[1.3, 0.9, 1.0]} castShadow>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
      </mesh>

      {/* Head group — animated for peck */}
      <group ref={headRef} position={[0, 0.55, 0.45]}>
        {/* Head sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.25, 9, 7]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
        </mesh>

        {/* Beak — small cone pointing forward (+z) */}
        <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.1, 0.2, 6]} />
          <meshStandardMaterial color={BEAK_COLOR} roughness={0.6} />
        </mesh>

        {/* Comb — 3 tiny spheres in a row on top */}
        {[-0.06, 0, 0.06].map((ox, ci) => (
          <mesh key={ci} position={[ox, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.07, 6, 5]} />
            <meshStandardMaterial color={COMB_COLOR} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Left wing */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, 0.25]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.05]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.9} />
      </mesh>

      {/* Right wing */}
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, -0.25]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.05]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.9} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.18, -0.52, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 5]} />
        <meshStandardMaterial color={LEG_COLOR} roughness={0.6} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.18, -0.52, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.35, 5]} />
        <meshStandardMaterial color={LEG_COLOR} roughness={0.6} />
      </mesh>
    </group>
  )
}

function ChickenFlock() {
  const configs = useMemo(() => CHICKEN_CONFIG, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <ChickenMesh key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// SheepGroup — 4 sheep grazing in the apple orchard zone (z: -55 to -80)
// ---------------------------------------------------------------------------

const SHEEP_COUNT = 4

const SHEEP_CONFIG = Array.from({ length: SHEEP_COUNT }, (_, i) => {
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
  // Wool bump offsets — 7 bumps in a deterministic pattern
  const woolBumps: Array<[number, number, number]> = Array.from({ length: 7 }, (_, b) => {
    const phi   = pr(i * 50 + b * 3)     * Math.PI * 2
    const theta = pr(i * 50 + b * 3 + 1) * Math.PI * 0.9
    const rr    = 0.55 + pr(i * 50 + b * 3 + 2) * 0.35
    return [
      Math.sin(theta) * Math.cos(phi) * rr,
      Math.abs(Math.cos(theta)) * rr * 0.6,
      Math.sin(theta) * Math.sin(phi) * rr * 1.3,
    ] as [number, number, number]
  })
  return {
    // Place in orchard area at different z depths
    homeX:      (pr(i * 11)     - 0.5) * 20,
    homeZ:      -60 - pr(i * 11 + 1) * 20,
    orbitSpeed: 0.05 + pr(i * 11 + 2) * 0.04,
    orbitA:     3 + pr(i * 11 + 3) * 3,
    orbitB:     2 + pr(i * 11 + 4) * 2,
    orbitPhase: (i / SHEEP_COUNT) * Math.PI * 2,
    grazPhase:  pr(i * 13) * Math.PI * 2,
    woolBumps,
  }
})

function SheepMesh({ cfg }: { cfg: typeof SHEEP_CONFIG[0] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const headRef  = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    const wx = cfg.homeX + Math.cos(t * cfg.orbitSpeed + cfg.orbitPhase) * cfg.orbitA
    const wz = cfg.homeZ + Math.sin(t * cfg.orbitSpeed * 0.8 + cfg.orbitPhase + 0.6) * cfg.orbitB

    groupRef.current.position.set(wx, 0, wz)
    groupRef.current.rotation.y = t * cfg.orbitSpeed + cfg.orbitPhase + Math.PI / 2

    // Graze: head bobs down every ~2 s
    if (headRef.current) {
      headRef.current.position.y = 0.6 + Math.sin(t * 3 + cfg.grazPhase) * 0.12
    }
  })

  const WOOL_COLOR = '#f0f0f0'
  const FACE_COLOR = '#888877'

  return (
    <group ref={groupRef}>
      {/* Wool body — sphere scaled to oval */}
      <mesh scale={[1.2, 1.0, 1.5]} castShadow>
        <sphereGeometry args={[0.9, 12, 9]} />
        <meshStandardMaterial color={WOOL_COLOR} roughness={0.95} />
      </mesh>

      {/* Wool bumps for fluffy look */}
      {cfg.woolBumps.map((bp, bi) => (
        <mesh key={bi} position={bp} castShadow>
          <sphereGeometry args={[0.4, 7, 6]} />
          <meshStandardMaterial color={WOOL_COLOR} roughness={0.95} />
        </mesh>
      ))}

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.6, 1.2]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.6]} />
        <meshStandardMaterial color={FACE_COLOR} roughness={0.8} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.28, 0.72, 1.12]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color={FACE_COLOR} roughness={0.8} />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.28, 0.72, 1.12]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color={FACE_COLOR} roughness={0.8} />
      </mesh>

      {/* 4 legs */}
      {([ [-0.35, -0.75, 0.55], [0.35, -0.75, 0.55], [-0.35, -0.75, -0.55], [0.35, -0.75, -0.55] ] as Array<[number, number, number]>).map((lp, li) => (
        <mesh key={li} position={lp} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.7, 6]} />
          <meshStandardMaterial color={FACE_COLOR} roughness={0.8} />
        </mesh>
      ))}

      {/* Tail */}
      <mesh position={[0, 0.2, -1.2]} castShadow>
        <sphereGeometry args={[0.2, 7, 6]} />
        <meshStandardMaterial color={WOOL_COLOR} roughness={0.95} />
      </mesh>
    </group>
  )
}

function SheepGroup() {
  const configs = useMemo(() => SHEEP_CONFIG, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <SheepMesh key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// DuckPond — a pond at [20, 0, 30] with lily pads and 3 swimming ducks
// ---------------------------------------------------------------------------

const POND_CENTER: [number, number, number] = [20, 0, 30]

// Lily pad positions relative to pond centre (deterministic)
const LILY_PAD_OFFSETS: Array<[number, number, number]> = (() => {
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2 + 0.4
    const r = 1.2 + pr(i * 3) * 2.0
    return [Math.cos(angle) * r, 0.16, Math.sin(angle) * r] as [number, number, number]
  })
})()

const DUCK_CONFIG = Array.from({ length: 3 }, (_, i) => {
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
  return {
    orbitRadius: 1.5 + i * 0.8,
    orbitSpeed:  0.28 + pr(i * 7) * 0.12,
    orbitPhase:  (i / 3) * Math.PI * 2,
    bobPhase:    pr(i * 9) * Math.PI * 2,
    color:       i === 1 ? '#ffffff' : '#eeeeaa',
  }
})

function DuckMesh({ cfg }: { cfg: typeof DUCK_CONFIG[0] }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const angle = t * cfg.orbitSpeed + cfg.orbitPhase
    const x = POND_CENTER[0] + Math.cos(angle) * cfg.orbitRadius
    const z = POND_CENTER[2] + Math.sin(angle) * cfg.orbitRadius
    const y = POND_CENTER[1] + 0.28 + Math.sin(t * 2 + cfg.bobPhase) * 0.04  // gentle bob on water

    groupRef.current.position.set(x, y, z)
    // Face direction of travel
    groupRef.current.rotation.y = angle + Math.PI / 2
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh scale={[1.2, 0.8, 1.0]} castShadow>
        <sphereGeometry args={[0.4, 9, 7]} />
        <meshStandardMaterial color={cfg.color} roughness={0.75} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.22, 0.38]} castShadow>
        <sphereGeometry args={[0.22, 8, 7]} />
        <meshStandardMaterial color={cfg.color} roughness={0.75} />
      </mesh>

      {/* Bill — flat box pointing forward */}
      <mesh position={[0, 0.2, 0.6]} castShadow>
        <boxGeometry args={[0.25, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff9900" roughness={0.6} />
      </mesh>
    </group>
  )
}

function DuckPond() {
  return (
    <group position={POND_CENTER}>
      {/* Pond water disc */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 0.3, 24]} />
        <meshStandardMaterial color="#2255aa" transparent opacity={0.7} roughness={0.1} metalness={0.2} depthWrite={false} />
      </mesh>

      {/* Lily pads */}
      {LILY_PAD_OFFSETS.map((lp, i) => (
        <mesh key={i} position={lp} rotation={[-Math.PI / 2, 0, i * 0.8]}>
          <cylinderGeometry args={[0.6, 0.6, 0.06, 10]} />
          <meshStandardMaterial color="#2d8b3a" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function DuckPondWithDucks() {
  const duckConfigs = useMemo(() => DUCK_CONFIG, [])
  return (
    <>
      <DuckPond />
      {duckConfigs.map((cfg, i) => (
        <DuckMesh key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Scarecrow — classic garden scarecrow with sway animation and perched crows
// ---------------------------------------------------------------------------

function Scarecrow({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05
    }
  })

  const STRAW_OFFSETS: Array<[number, number, number, number]> = [
    [-0.55, 1.8, 0, 0.3], [0.55, 1.8, 0, -0.3],
    [-0.55, 1.6, 0, 0.5], [0.55, 1.6, 0, -0.5],
    [0, 2.3, 0.2, 0],     [0, 2.3, -0.2, 0],
    [-0.1, 0.35, 0.2, 0.2], [0.1, 0.35, -0.2, -0.2],
    [-0.2, 0.28, 0, 0.1], [0.2, 0.28, 0, -0.1],
  ]

  return (
    <group ref={groupRef} position={position}>
      {/* Wooden pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 7]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.95} />
      </mesh>
      {/* Horizontal crossbeam */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.95} />
      </mesh>

      {/* Body — plaid: 2 overlapping boxes */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1, 1.4, 0.4]} />
        <meshStandardMaterial color="#884400" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0.05]} castShadow>
        <boxGeometry args={[0.96, 1.38, 0.35]} />
        <meshStandardMaterial color="#aa5511" roughness={0.85} />
      </mesh>

      {/* Arms — cylinders along crossbeam */}
      <mesh position={[-0.9, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 7]} />
        <meshStandardMaterial color="#884400" roughness={0.85} />
      </mesh>
      <mesh position={[0.9, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 7]} />
        <meshStandardMaterial color="#884400" roughness={0.85} />
      </mesh>

      {/* Gloves */}
      <mesh position={[-1.55, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 7]} />
        <meshStandardMaterial color="#cc8844" roughness={0.75} />
      </mesh>
      <mesh position={[1.55, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 7]} />
        <meshStandardMaterial color="#cc8844" roughness={0.75} />
      </mesh>

      {/* Pants/legs */}
      <mesh position={[-0.22, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 7]} />
        <meshStandardMaterial color="#2244aa" roughness={0.85} />
      </mesh>
      <mesh position={[0.22, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 7]} />
        <meshStandardMaterial color="#2244aa" roughness={0.85} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.75, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 10]} />
        <meshStandardMaterial color="#e8c850" roughness={0.8} />
      </mesh>

      {/* Hat brim */}
      <mesh position={[0, 3.12, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.05, 14]} />
        <meshStandardMaterial color="#3a1a05" roughness={0.9} />
      </mesh>
      {/* Hat crown */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <coneGeometry args={[0.55, 0.7, 10]} />
        <meshStandardMaterial color="#3a1a05" roughness={0.9} />
      </mesh>

      {/* Face: triangle eyes — 2 dark flat boxes */}
      <mesh position={[-0.15, 2.8, 0.44]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
        <meshStandardMaterial color="#1a0a00" roughness={1} />
      </mesh>
      <mesh position={[0.15, 2.8, 0.44]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.02]} />
        <meshStandardMaterial color="#1a0a00" roughness={1} />
      </mesh>
      {/* Stitched smile — 5 tiny boxes in arc */}
      {([-0.18, -0.09, 0, 0.09, 0.18] as number[]).map((ox, si) => (
        <mesh key={si} position={[ox, 2.58 + (Math.abs(ox) > 0.1 ? -0.04 : 0), 0.44]} castShadow>
          <boxGeometry args={[0.06, 0.05, 0.02]} />
          <meshStandardMaterial color="#1a0a00" roughness={1} />
        </mesh>
      ))}

      {/* Straw stuffing — sleeves, collar, pant cuffs */}
      {STRAW_OFFSETS.map(([sx, sy, sz, rz], si) => (
        <mesh key={si} position={[sx, sy, sz]} rotation={[0, 0, rz]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.3, 5]} />
          <meshStandardMaterial color="#ffcc44" roughness={0.7} />
        </mesh>
      ))}

      {/* Crow on left arm */}
      <group position={[-1.3, 2.4, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 7, 6]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.25]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.25]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
      </group>

      {/* Crow on right arm */}
      <group position={[1.3, 2.4, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 7, 6]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.25]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.25]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// HarvestFestivalBanners — colorful autumn pennant bunting strung between posts
// ---------------------------------------------------------------------------

// 4 banner strings: each has [postA, postB] world positions
const BANNER_STRINGS: Array<[[number, number, number], [number, number, number]]> = [
  [[-20, 0, 18], [-8, 0, 18]],
  [[ -8, 0, 18], [ 4, 0, 18]],
  [[  4, 0, 18], [16, 0, 18]],
  [[ 16, 0, 18], [28, 0, 18]],
]

const BANNER_COLORS = ['#ff8822', '#cc2222', '#ffcc00', '#884400']
const PENNANT_COUNT = 11  // per string

function BannerString({
  posA,
  posB,
  stringIdx,
}: {
  posA: [number, number, number]
  posB: [number, number, number]
  stringIdx: number
}) {
  const flagRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    flagRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.z = Math.sin(t * 2 + i * 0.3 + stringIdx * 0.7) * 0.1
    })
  })

  const dx = posB[0] - posA[0]
  const dz = posB[2] - posA[2]
  const strLen = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dz, dx)
  const midX = (posA[0] + posB[0]) / 2
  const midZ = (posA[2] + posB[2]) / 2
  const postH = 4

  return (
    <group>
      {/* Post A */}
      <mesh position={[posA[0], postH / 2, posA[2]]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, postH, 7]} />
        <meshStandardMaterial color="#6b3d1a" roughness={0.9} />
      </mesh>
      {/* Post B */}
      <mesh position={[posB[0], postH / 2, posB[2]]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, postH, 7]} />
        <meshStandardMaterial color="#6b3d1a" roughness={0.9} />
      </mesh>
      {/* String line */}
      <mesh position={[midX, postH - 0.1, midZ]} rotation={[0, -angle, 0]} castShadow>
        <boxGeometry args={[strLen, 0.04, 0.04]} />
        <meshStandardMaterial color="#886633" roughness={0.9} />
      </mesh>
      {/* Pennants */}
      {Array.from({ length: PENNANT_COUNT }, (_, i) => {
        const frac = (i + 0.5) / PENNANT_COUNT
        const px = posA[0] + dx * frac
        const pz = posA[2] + dz * frac
        const py = postH - 0.1 - Math.sin(frac * Math.PI) * 0.4  // slight droop
        const color = BANNER_COLORS[(stringIdx * PENNANT_COUNT + i) % BANNER_COLORS.length] as string
        return (
          <mesh
            key={i}
            ref={(el) => { if (el) flagRefs.current[i] = el }}
            position={[px, py - 0.25, pz]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.6, 0.5, 0.02]} />
            <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

function HarvestFestivalBanners() {
  return (
    <>
      {BANNER_STRINGS.map(([a, b], i) => (
        <BannerString key={i} posA={a} posB={b} stringIdx={i} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// CornStalks — 4×5 grid of tall corn stalks with leaves and ears
// ---------------------------------------------------------------------------

// Deterministic layout: 4 cols × 5 rows, placed in a rectangular patch
const CORN_GRID_DATA: Array<{
  pos: [number, number, number]
  rotY: number
  leafAngles: number[]
}> = (() => {
  const pr = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
  const cols = 4
  const rows = 5
  const xStart = -20
  const xStep = 2.2
  const zStart = -50
  const zStep = 2.2
  const data: typeof CORN_GRID_DATA = []

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const idx = c * rows + r
      const ox = (pr(idx * 2)     - 0.5) * 0.5
      const oz = (pr(idx * 2 + 1) - 0.5) * 0.5
      data.push({
        pos: [xStart + c * xStep + ox, 0, zStart - r * zStep + oz],
        rotY: pr(idx * 13) * Math.PI * 2,
        leafAngles: Array.from({ length: 5 }, (_, li) => pr(idx * 50 + li) * Math.PI * 2),
      })
    }
  }
  return data
})()

function CornStalk({ pos, rotY, leafAngles }: { pos: [number, number, number]; rotY: number; leafAngles: number[] }) {
  const STALK_H = 3
  const LEAF_HEIGHTS = [0.6, 1.1, 1.6, 2.1, 2.6]

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Main stalk */}
      <mesh position={[0, STALK_H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, STALK_H, 7]} />
        <meshStandardMaterial color="#558822" roughness={0.8} />
      </mesh>

      {/* Leaves — fanning out at different heights */}
      {LEAF_HEIGHTS.map((ly, li) => {
        const angle = leafAngles[li] ?? (li * 1.3)
        return (
          <mesh
            key={li}
            position={[Math.cos(angle) * 0.35, ly, Math.sin(angle) * 0.35]}
            rotation={[Math.sin(angle) * 0.4, angle, Math.cos(angle) * 0.5]}
            castShadow
          >
            <boxGeometry args={[0.6, 0.08, 1.5]} />
            <meshStandardMaterial color="#558822" roughness={0.75} side={THREE.DoubleSide} />
          </mesh>
        )
      })}

      {/* Ear of corn */}
      <mesh position={[0.2, STALK_H - 0.3, 0]} rotation={[0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#ffcc44" roughness={0.7} />
      </mesh>
      {/* Corn silk cluster — 4 tiny yellow spheres at ear tip */}
      {([[-0.06, 0.08], [0.06, 0.05], [0, 0.1], [-0.04, 0.03]] as [number, number][]).map(([sx, sy], ci) => (
        <mesh key={ci} position={[0.2 + sx, STALK_H - 0.3 + 0.45 + sy, ci * 0.03]} castShadow>
          <sphereGeometry args={[0.07, 5, 4]} />
          <meshStandardMaterial color="#ffee88" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function CornStalks() {
  return (
    <>
      {CORN_GRID_DATA.map((d, i) => (
        <CornStalk key={i} pos={d.pos} rotY={d.rotY} leafAngles={d.leafAngles} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main world component
// ---------------------------------------------------------------------------

export default function GardenWorld() {
  const beds = useMemo(buildGrid, [])
  const [harvested, setHarvested] = useState(0)

  return (
    <>
      {/* Golden hour sunset sky */}
      <GradientSky top="#1a2060" bottom="#ff7020" radius={440} />

      <Ground />
      <Fence />
      <GardenBoundary />

      {/* Extended zone: Apple Orchard (z -55 to -85) */}
      <AppleOrchard />
      <OrchardAtmosphere />
      <PickedBaskets />

      {/* Decorative windmill — Dutch-style, away from other features */}
      <Windmill />

      {/* Harvest wagon filled with vegetables near the orchard */}
      <HarvestWagon />

      {/* Visual enhancements */}
      <FallingPetals />
      <GrassGlowPatches />
      <Butterflies />
      <PollenDrift />
      <SunbeamShafts />
      <RainbowArc />
      <GardenSunRays />

      {beds.map((b, i) => (
        <Bed
          key={i}
          pos={b.pos}
          initialRipe={b.ripe}
          seed={b.seed}
          onHarvest={() => setHarvested((h) => h + 1)}
        />
      ))}

      {/* Маленький центральный знак прогресса (без Html, чтобы не перегружать) */}
      <mesh position={[0, 4, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshBasicMaterial color={harvested >= 5 ? '#FFD43C' : '#9FE8C7'} />
      </mesh>
      <Coin pos={[0, 1, 0]} value={harvested >= 5 ? 10 : 1} />
      {/* harvested — просто счётчик-переменная для кап-стона (потом можно в HUD) */}

      {/* NPC-фермер в центре */}
      <NPC pos={[0, 0, 13]} label="ФЕРМЕР" bodyColor="#c8e8a0" />
      {/* Фея над садом */}
      <group position={[5, 1.8, 0]}><NpcFairy scale={0.9} /></group>

      {/* Пчелы-«вредители» патрулируют над полем */}
      <GltfMonster which="birb" pos={[-4, 2.2, -4]} patrolX={3} scale={0.7} sensor animation="Run" />
      <GltfMonster which="birb" pos={[4, 2.2, 4]} patrolX={2.5} scale={0.7} sensor animation="Run" />

      {/* Декор по углам — новые Blender-модели */}
      <TreeRound pos={[-14, 0, -12]} rotY={0.3} />
      <TreeRound pos={[14, 0, -12]} rotY={1.2} />
      <TreeRound pos={[-14, 0, 12]} rotY={2.1} />
      <TreeRound pos={[14, 0, 12]} rotY={0.7} />
      <Bush pos={[-10, 0, 0]} variant={0} scale={1.2} />
      <Bush pos={[10, 0, 0]} variant={1} scale={1.2} />
      <Flowers pos={[-6, 0, 15]} scale={1.3} />
      <Flowers pos={[6, 0, 15]} scale={1.3} />
      <MushroomRed pos={[-8, 0, 8]} scale={1.1} />
      <MushroomRed pos={[8, 0, -8]} scale={0.9} />
      <MushroomGlow pos={[-5, 0, -9]} scale={0.85} />
      <MushroomGlow pos={[5, 0, 9]} scale={1.0} />
      <GrassTuft pos={[-3, 0, 11]} tall />
      <GrassTuft pos={[3, 0, -11]} tall={false} />
      {/* Well и Bench у фермера */}
      <Well pos={[-3, 0, 15]} scale={0.9} />
      <Bench pos={[3, 0, 15]} scale={1.0} rotY={Math.PI} />
      {/* Флаги и горшки для уюта */}
      <Flag pos={[-12, 0, 12]} scale={1.2} />
      <Flag pos={[12, 0, 12]} scale={1.2} rotY={Math.PI} />
      <FlowerPot pos={[-1.5, 0, 15]} scale={1.3} />
      <FlowerPot pos={[1.5, 0, 15]} scale={1.3} />
      <FlowerPot pos={[-6, 0, -12]} scale={1.1} />
      {/* Фонари у входа */}
      <Lantern pos={[-2, 0, -13]} scale={0.9} />
      <Lantern pos={[2, 0, -13]} scale={0.9} />

      {/* Тропические пальмы — 5 шт., по углам сада и у пруда */}
      <PalmTree pos={[-17, 0, -16]} scale={1.1} rotY={0.5} />
      <PalmTree pos={[17, 0, -16]} scale={1.2} rotY={-0.4} />
      <PalmTree pos={[-17, 0, 16]} scale={1.0} rotY={1.0} />
      <PalmTree pos={[17, 0, 16]} scale={1.3} rotY={2.0} />
      <PalmTree pos={[0, 0, 24]} scale={1.1} rotY={0.0} />

      {/* Магические кристаллы феи-сада — 7 шт., по периметру грядок и у воды */}
      <CrystalCluster pos={[-12, 0, -5]} scale={0.9} rotY={0.3} />
      <CrystalCluster pos={[12, 0, -5]} scale={1.0} rotY={-0.5} />
      <CrystalCluster pos={[-12, 0, 5]} scale={0.8} rotY={1.2} />
      <CrystalCluster pos={[12, 0, 5]} scale={1.1} rotY={2.1} />
      <CrystalCluster pos={[-7, 0, -13]} scale={0.85} rotY={0.7} />
      <CrystalCluster pos={[7, 0, -13]} scale={0.9} rotY={-0.9} />
      <CrystalCluster pos={[0, 0, 19]} scale={1.0} rotY={1.5} />

      {/* Страж Сада — Голем-босс у ворот сарая-финиша */}
      <BossGolem pos={[6, 0, -14]} scale={1.4} rotY={Math.PI + 0.3} />

      {/* Камни-границы сада (лавовые булыжники) — 5 шт. вдоль забора */}
      <LavaRock pos={[-9, 0, -11]} scale={0.9} rotY={0.4} />
      <LavaRock pos={[9, 0, -11]} scale={1.0} rotY={-0.6} />
      <LavaRock pos={[-9, 0, 11]} scale={0.8} rotY={1.8} />
      <LavaRock pos={[9, 0, 11]} scale={1.1} rotY={0.9} />
      <LavaRock pos={[0, 0, -11]} scale={0.85} rotY={0.0} />

      {/* Autumn harvest festival decorations */}
      <Scarecrow position={[-8, 0, -8]} />
      <HarvestFestivalBanners />
      <CornStalks />

      {/* Farm animals */}
      <ChickenFlock />
      <SheepGroup />
      <DuckPondWithDucks />

      {/* Articulated butterflies + bees + water sprinklers */}
      <Bees />
      <WaterSprinklers />

      {/* Декоративный пруд за забором, между деревьями и краем мира */}
      <WaterSurface position={[0, 0.02, 22]} width={16} depth={12} />

      {/* Harvest festival stage at far end */}
      <Stage pos={[0, 0, -10]} scale={1.8} />

      {/* Winner trophies near the barn finish */}
      <Trophy pos={[-2, 0, -12]} scale={1.2} />
      <Trophy pos={[0, 0, -12]}  scale={1.5} rotY={Math.PI/6} />
      <Trophy pos={[2, 0, -12]}  scale={1.2} />

      {/* Волшебные грибы — разбросаны по саду на уровне земли */}
      <MagicMushroom pos={[5,  0, -8]}  scale={1.0} rotY={0.4} />
      <MagicMushroom pos={[-7, 0, -15]} scale={1.5} rotY={1.2} />
      <MagicMushroom pos={[12, 0, -25]} scale={1.8} rotY={0.7} />
      <MagicMushroom pos={[-3, 0, -30]} scale={1.2} rotY={2.0} />
      <MagicMushroom pos={[8,  0, -42]} scale={2.0} rotY={0.9} />
      <MagicMushroom pos={[-15,0, -20]} scale={1.3} rotY={1.5} />
      <MagicMushroom pos={[20, 0, -35]} scale={1.6} rotY={0.2} />
      <MagicMushroom pos={[-10,0, -45]} scale={1.1} rotY={2.8} />

      {/* Домики фей — вдоль дальней части сада */}
      <FairyHouse pos={[8,  0, -15]} scale={1.4} rotY={0.5} />
      <FairyHouse pos={[-9, 0, -22]} scale={1.2} rotY={-0.8} />
      <FairyHouse pos={[12, 0, -35]} scale={1.5} rotY={1.2} />
      <FairyHouse pos={[-7, 0, -45]} scale={1.3} rotY={2.1} />

      {/* Сарай-финиш: собрал урожай — вернись */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, -14]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 2, 2]} />
          <meshStandardMaterial color="#c03535" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[3.2, 0.2, 2.2]} />
          <meshStandardMaterial color="#8a1e1e" roughness={0.8} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 1.8, -14]}
        size={[4, 3, 2.5]}
        result={{
          kind: 'win',
          label: 'УРОЖАЙ СОБРАН!',
          subline: 'Ты зашёл в сарай. Питомцы будут сыты.',
        }}
      />
    </>
  )
}

export const GARDEN_SPAWN: [number, number, number] = [0, 3, 10]
