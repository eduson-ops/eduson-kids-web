import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, Mushroom, GrassTuft } from '../Scenery'
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
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[60, 0.5, 60]} />
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

function FallingPetals() {
  const refs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const s = PETAL_SEEDS[i]!
      // Fall downward, reset at top
      mesh.position.y -= s.speed * 0.016
      if (mesh.position.y < 0) {
        mesh.position.y = 12
        mesh.position.x = (Math.random() - 0.5) * 25
        mesh.position.z = (Math.random() - 0.5) * 25
      }
      // Gentle X drift + Y swirl rotation
      mesh.position.x += Math.sin(t * s.swirl + s.phase) * 0.003
      mesh.rotation.y = Math.sin(t * 0.7 + s.phase) * 1.2
      mesh.rotation.z = Math.cos(t * 0.5 + s.phase) * 0.4
    })
  })

  return (
    <>
      {PETAL_SEEDS.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el }}
          position={[s.x, s.y, s.z]}
        >
          <planeGeometry args={[0.15, 0.2]} />
          <meshBasicMaterial color="#ffaacc" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </>
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
// Butterflies — 6 pairs of wings drifting in figure-8 paths
// ---------------------------------------------------------------------------

const BUTTERFLY_COLORS = ['#ffaaff', '#aaffdd', '#ffddaa', '#aaaaff', '#ffaaaa', '#aaffaa']

const BUTTERFLY_DATA = Array.from({ length: 6 }, (_, i) => ({
  cx: (Math.random() - 0.5) * 20,
  cy: 1.2 + Math.random() * 2.0,
  cz: (Math.random() - 0.5) * 20,
  speed: 0.3 + Math.random() * 0.3,
  radius: 2.0 + Math.random() * 2.5,
  phase: (i / 6) * Math.PI * 2,
  flapSpeed: 4.0 + Math.random() * 2.0,
  color: BUTTERFLY_COLORS[i] ?? '#ffffff',
}))

function Butterflies() {
  const groupRefs = useRef<THREE.Group[]>([])
  const leftWingRefs = useRef<THREE.Mesh[]>([])
  const rightWingRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    BUTTERFLY_DATA.forEach((b, i) => {
      const group = groupRefs.current[i]
      if (!group) return
      // Figure-8 path using Lissajous
      const angle = t * b.speed + b.phase
      group.position.x = b.cx + Math.sin(angle) * b.radius
      group.position.y = b.cy + Math.sin(t * 0.4 + b.phase) * 0.4
      group.position.z = b.cz + Math.sin(angle * 2) * (b.radius * 0.5)
      // Face direction of movement
      group.rotation.y = angle + Math.PI / 2

      // Flap wings
      const flapAngle = Math.sin(t * b.flapSpeed) * 0.9
      const lw = leftWingRefs.current[i]
      const rw = rightWingRefs.current[i]
      if (lw) lw.rotation.y = flapAngle
      if (rw) rw.rotation.y = -flapAngle
    })
  })

  return (
    <>
      {BUTTERFLY_DATA.map((b, i) => (
        <group
          key={i}
          ref={(el) => { if (el) groupRefs.current[i] = el }}
          position={[b.cx, b.cy, b.cz]}
        >
          {/* Left wing */}
          <mesh
            ref={(el) => { if (el) leftWingRefs.current[i] = el }}
            position={[-0.13, 0, 0]}
          >
            <planeGeometry args={[0.25, 0.18]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {/* Right wing */}
          <mesh
            ref={(el) => { if (el) rightWingRefs.current[i] = el }}
            position={[0.13, 0, 0]}
          >
            <planeGeometry args={[0.25, 0.18]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
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

      {/* Visual enhancements */}
      <FallingPetals />
      <GrassGlowPatches />
      <Butterflies />

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

      {/* Пчелы-«вредители» патрулируют над полем */}
      <GltfMonster which="birb" pos={[-4, 2.2, -4]} patrolX={3} scale={0.7} sensor animation="Run" />
      <GltfMonster which="birb" pos={[4, 2.2, 4]} patrolX={2.5} scale={0.7} sensor animation="Run" />

      {/* Декор по углам */}
      <Tree pos={[-14, 0, -12]} variant={0} />
      <Tree pos={[14, 0, -12]} variant={1} />
      <Tree pos={[-14, 0, 12]} variant={2} />
      <Tree pos={[14, 0, 12]} variant={3} />
      <Bush pos={[-10, 0, 0]} variant={0} scale={1.2} />
      <Bush pos={[10, 0, 0]} variant={1} scale={1.2} />
      <Flowers pos={[-6, 0, 15]} scale={1.3} />
      <Flowers pos={[6, 0, 15]} scale={1.3} />
      <Mushroom pos={[-8, 0, 8]} red scale={1.2} />
      <Mushroom pos={[8, 0, -8]} red={false} scale={1.2} />
      <GrassTuft pos={[-3, 0, 11]} tall />
      <GrassTuft pos={[3, 0, -11]} tall={false} />

      {/* Декоративный пруд за забором, между деревьями и краем мира */}
      <WaterSurface position={[0, 0.02, 22]} width={16} depth={12} />

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
