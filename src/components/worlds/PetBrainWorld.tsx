import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import { Tree, Bush, Flowers, GrassTuft } from '../Scenery'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'
import GradientSky from '../GradientSky'

/**
 * PetBrainWorld — educational remake of «Adopt Me Pet Brain».
 *
 * Curriculum: M7 L41-42 — if/elif/else, priority AI, callbacks.
 * Python hooks (будущее):
 *   if pet.hungry:  pet.go_to(food)
 *   elif pet.tired: pet.go_to(bed)
 *   else:           pet.follow(owner)
 *
 * Механика (живая FSM):
 *   State = 'follow' | 'hungry' | 'tired' | 'eating' | 'sleeping'
 *   happiness: 100 → 0 со временем
 *   hunger: 0 → 100 со временем
 *   energy: 100 → 0 со временем
 *
 * Каждые 12сек hunger+25. Когда hunger>=70 → питомец сам идёт к миске, ест 3сек.
 * Каждые 18сек energy-25. Когда energy<=25 → питомец идёт к лежанке, спит 3сек.
 * Иначе → следует за игроком на расстоянии 2.5.
 * Игрок может **подозвать**: подойти на <1.5 м → +5 монет, happiness +10.
 * Цель: довести happiness до 100% (пять подзывов).
 */

type PetState = 'follow' | 'hungry' | 'tired' | 'eating' | 'sleeping'

interface PetStats {
  state: PetState
  hunger: number      // 0..100
  energy: number      // 0..100
  happiness: number   // 0..100
  timer: number       // сек в текущем состоянии (для eating/sleeping)
  lastPetTime: number
}

const FOOD_POS: [number, number, number] = [-10, 0.5, -6]
const BED_POS:  [number, number, number] = [10, 0.5, -6]
const FOLLOW_DIST = 2.5
const PET_REACH = 1.5           // радиус игрок→питомец для глажки
const MOVE_SPEED = 3.5

// 12 neural node positions in 3D volume
const NODE_POSITIONS: Array<[number, number, number]> = [
  [-7, 2, -8],
  [0, 4, -10],
  [7, 3, -9],
  [-5, 5, -14],
  [5, 2, -14],
  [0, 6, -18],
  [-8, 3, -20],
  [8, 4, -20],
  [-3, 2, -22],
  [3, 5, -22],
  [0, 3, -6],
  [-2, 6, -16],
]

// 20 random connection pairs between the 12 nodes
const CONNECTION_PAIRS: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [1, 4], [1, 5],
  [2, 4], [3, 5], [4, 5], [5, 6], [5, 7],
  [6, 8], [7, 9], [8, 9], [3, 11], [11, 5],
  [10, 0], [10, 1], [10, 2], [9, 7], [6, 11],
]

// 15 data particle pathways (start node index, end node index)
const PARTICLE_PATHS: Array<[number, number]> = [
  [0, 1], [1, 2], [1, 5], [3, 5], [4, 5],
  [5, 6], [5, 7], [6, 8], [7, 9], [8, 9],
  [10, 1], [11, 5], [0, 3], [2, 4], [9, 7],
]

// Matrix/binary ground shader
const BINARY_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const BINARY_FRAG = `
  uniform float uTime;
  varying vec2 vUv;
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(127.1, 311.7))) * 43758.5453123);
  }
  void main() {
    float col = floor(vUv.x * 40.0);
    float row = floor(vUv.y * 60.0);
    float digit = fract(sin(col * 127.1 + uTime * 2.0 + row * 311.7) * 43758.5);
    float on = step(0.97, digit);
    float brightness = 0.6 + 0.4 * rand(vec2(col, row + floor(uTime * 3.0)));
    vec3 color = vec3(0.0, 1.0, 0.25) * brightness;
    gl_FragColor = vec4(color * on, on * 0.08);
  }
`

function DigitalGround() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime!.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={BINARY_VERT}
        fragmentShader={BINARY_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function NeuralNetwork() {
  const networkGeom = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (const [a, b] of CONNECTION_PAIRS) {
      points.push(new THREE.Vector3(...NODE_POSITIONS[a]!))
      points.push(new THREE.Vector3(...NODE_POSITIONS[b]!))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  return (
    <lineSegments geometry={networkGeom}>
      <lineBasicMaterial color="#00ff80" opacity={0.4} transparent />
    </lineSegments>
  )
}

function NeuralNodes() {
  const refs = useRef<Array<THREE.Mesh | null>>([])
  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (mesh) {
        const sc = 1.0 + 0.3 * Math.sin(clock.elapsedTime * 2.5 + i * 0.8)
        mesh.scale.setScalar(sc)
      }
    })
  })
  return (
    <>
      {NODE_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh ref={(el) => { refs.current[i] = el }}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshBasicMaterial color="#00ff80" />
          </mesh>
          <pointLight intensity={0.4} distance={3} color="#00ff80" />
        </group>
      ))}
    </>
  )
}

function DataParticles() {
  // Each particle: progress 0..1 along path, speed
  const particles = useMemo(
    () =>
      PARTICLE_PATHS.map((path, i) => ({
        path,
        progress: (i / PARTICLE_PATHS.length),
        speed: 1 / (1.0 + (i % 3) * 0.7), // varies 1s to ~2.4s
      })),
    []
  )
  const progressRef = useRef(particles.map((p) => p.progress))
  const refs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((_, dt) => {
    progressRef.current = progressRef.current.map((prog, i) => {
      const newProg = prog + dt * particles[i]!.speed
      return newProg > 1 ? newProg - 1 : newProg
    })
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const [startIdx, endIdx] = particles[i]!.path
      const start = new THREE.Vector3(...NODE_POSITIONS[startIdx]!)
      const end = new THREE.Vector3(...NODE_POSITIONS[endIdx]!)
      mesh.position.lerpVectors(start, end, progressRef.current[i]!)
    })
  })

  return (
    <>
      {particles.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el }}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color="#88ffaa" />
        </mesh>
      ))}
    </>
  )
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[50, 0.5, 50]} />
        <meshStandardMaterial color="#0a1a0a" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function FoodBowl({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.5, 0.35, 16]} />
        <meshStandardMaterial color="#ff9454" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.45, 0.1, 16]} />
        <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.25} />
      </mesh>
      <Html position={[0, 0.8, 0]} center distanceFactor={7}>
        <div style={{
          background: 'rgba(11,10,17,0.85)',
          color: '#FFD43C',
          padding: '3px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontWeight: 700,
          pointerEvents: 'none',
        }}>🍖 МИСКА</div>
      </Html>
    </group>
  )
}

function Bed({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 1.3]} />
        <meshStandardMaterial color="#5AA9FF" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.2, 1.1]} />
        <meshStandardMaterial color="#E4E0FC" roughness={0.9} />
      </mesh>
      <Html position={[0, 0.8, 0]} center distanceFactor={7}>
        <div style={{
          background: 'rgba(11,10,17,0.85)',
          color: '#A9D8FF',
          padding: '3px 10px',
          borderRadius: 8,
          fontSize: 11,
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontWeight: 700,
          pointerEvents: 'none',
        }}>🛏 ЛЕЖАНКА</div>
      </Html>
    </group>
  )
}

function Pet() {
  const ref = useRef<THREE.Group>(null!)
  const pos = useRef(new THREE.Vector3(0, 0, 4))
  const bodyBob = useRef(0)
  const [stats, setStats] = useState<PetStats>({
    state: 'follow',
    hunger: 10,
    energy: 95,
    happiness: 40,
    timer: 0,
    lastPetTime: 0,
  })

  const statsRef = useRef(stats)
  statsRef.current = stats

  useFrame((_, dt) => {
    const player = window.__ekPlayerPos
    const s = { ...statsRef.current }

    // Natural drift
    s.hunger = Math.min(100, s.hunger + dt * 2.1)  // до 70 за ~33сек
    s.energy = Math.max(0, s.energy - dt * 1.4)    // до 25 за ~50сек
    s.happiness = Math.max(0, s.happiness - dt * 0.5)  // медленно падает

    // FSM transitions (priority: eating > sleeping > hungry > tired > follow)
    if (s.state === 'eating') {
      s.timer += dt
      if (s.timer >= 3) {
        s.state = 'follow'
        s.hunger = 0
        s.timer = 0
        s.happiness = Math.min(100, s.happiness + 5)
      }
    } else if (s.state === 'sleeping') {
      s.timer += dt
      if (s.timer >= 3) {
        s.state = 'follow'
        s.energy = 100
        s.timer = 0
      }
    } else {
      if (s.hunger >= 70) s.state = 'hungry'
      else if (s.energy <= 25) s.state = 'tired'
      else s.state = 'follow'
    }

    // Target position по state
    let tx = pos.current.x
    let tz = pos.current.z
    if (s.state === 'follow' && player) {
      const dx = player.x - pos.current.x
      const dz = player.z - pos.current.z
      const d = Math.hypot(dx, dz)
      if (d > FOLLOW_DIST) {
        tx = player.x - (dx / d) * FOLLOW_DIST
        tz = player.z - (dz / d) * FOLLOW_DIST
      }
    } else if (s.state === 'hungry' || s.state === 'eating') {
      tx = FOOD_POS[0]; tz = FOOD_POS[2]
      // Arrived?
      const d = Math.hypot(pos.current.x - tx, pos.current.z - tz)
      if (s.state === 'hungry' && d < 0.8) {
        s.state = 'eating'; s.timer = 0
      }
    } else if (s.state === 'tired' || s.state === 'sleeping') {
      tx = BED_POS[0]; tz = BED_POS[2]
      const d = Math.hypot(pos.current.x - tx, pos.current.z - tz)
      if (s.state === 'tired' && d < 0.8) {
        s.state = 'sleeping'; s.timer = 0
      }
    }

    // Lerp to target
    const dirX = tx - pos.current.x
    const dirZ = tz - pos.current.z
    const dist = Math.hypot(dirX, dirZ)
    const eating = s.state === 'eating' || s.state === 'sleeping'
    if (!eating && dist > 0.05) {
      const step = Math.min(dist, MOVE_SPEED * dt)
      pos.current.x += (dirX / dist) * step
      pos.current.z += (dirZ / dist) * step
    }
    bodyBob.current += dt * (eating ? 1.5 : 6)

    // Pet by player proximity
    if (player) {
      const d = Math.hypot(player.x - pos.current.x, player.z - pos.current.z)
      const now = performance.now()
      if (d < PET_REACH && now - s.lastPetTime > 3000 && s.state === 'follow') {
        s.lastPetTime = now
        s.happiness = Math.min(100, s.happiness + 20)
        addCoin(5)
        SFX.coin()
      }
    }

    if (ref.current) {
      ref.current.position.set(pos.current.x, pos.current.y + Math.abs(Math.sin(bodyBob.current)) * 0.08, pos.current.z)
      if (dist > 0.05) {
        ref.current.rotation.y = Math.atan2(dirX, dirZ)
      }
    }

    setStats(s)
  })

  // Цвет питомца зависит от настроения
  const color = stats.happiness > 70 ? '#FFD43C'
    : stats.happiness > 40 ? '#FFB4C8'
    : '#6B5CE7'

  const stateLabel = {
    follow: '😊 Счастлив',
    hungry: '🍖 Голоден',
    tired: '😴 Устал',
    eating: '🍽 Ест',
    sleeping: '💤 Спит',
  }[stats.state]

  return (
    <group ref={ref}>
      {/* Тело */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Голова */}
      <mesh position={[0, 0.7, 0.25]} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ушки */}
      <mesh position={[-0.15, 0.95, 0.25]} castShadow>
        <coneGeometry args={[0.09, 0.22, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.95, 0.25]} castShadow>
        <coneGeometry args={[0.09, 0.22, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Глаза */}
      <mesh position={[-0.1, 0.72, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#15141b" />
      </mesh>
      <mesh position={[0.1, 0.72, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#15141b" />
      </mesh>
      {/* Хвост — вилы */}
      <mesh position={[0, 0.5, -0.35]} rotation={[0.4, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.4, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* HUD над питомцем */}
      <Html position={[0, 1.5, 0]} center distanceFactor={6}>
        <div style={{
          background: 'rgba(11,10,17,0.9)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 10,
          border: `2px solid ${color}`,
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          minWidth: 140,
          pointerEvents: 'none',
          lineHeight: 1.3,
        }}>
          <div style={{ color, fontSize: 12 }}>{stateLabel}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, fontSize: 10 }}>
            <span>❤ {stats.happiness.toFixed(0)}</span>
            <span>🍖 {stats.hunger.toFixed(0)}</span>
            <span>⚡ {stats.energy.toFixed(0)}</span>
          </div>
        </div>
      </Html>
    </group>
  )
}

export default function PetBrainWorld() {
  return (
    <>
      {/* Neural sky */}
      <GradientSky top="#000810" bottom="#001a10" radius={440} />

      <Ground />
      {/* Digital matrix ground overlay */}
      <DigitalGround />

      {/* Neural network visual */}
      <NeuralNetwork />
      <NeuralNodes />
      <DataParticles />

      <FoodBowl pos={FOOD_POS} />
      <Bed pos={BED_POS} />
      <Pet />

      {/* Уютный «дом» — стены */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, -13]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 3, 0.4]} />
          <meshStandardMaterial color="#FFB4C8" roughness={0.8} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-6, 1.5, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 10]} />
          <meshStandardMaterial color="#FFB4C8" roughness={0.8} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[6, 1.5, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 3, 10]} />
          <meshStandardMaterial color="#FFB4C8" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* NPC-инструктор у входа */}
      <NPC pos={[0, 0, 8]} label="ТРЕНЕР" bodyColor="#A9D8FF" />

      {/* Монеты на дворе для сбора */}
      <Coin pos={[-5, 1, 0]} />
      <Coin pos={[5, 1, 0]} />
      <Coin pos={[0, 1, -3]} />

      {/* Декор */}
      <Tree pos={[-16, 0, -14]} variant={0} />
      <Tree pos={[16, 0, -14]} variant={1} />
      <Tree pos={[-16, 0, 14]} variant={2} />
      <Tree pos={[16, 0, 14]} variant={3} />
      <Bush pos={[-10, 0, 3]} variant={0} scale={1.2} />
      <Bush pos={[10, 0, 3]} variant={1} scale={1.2} />
      <Flowers pos={[-4, 0, 10]} scale={1.3} />
      <Flowers pos={[4, 0, 10]} scale={1.3} />
      <GrassTuft pos={[-2, 0, 6]} tall />
      <GrassTuft pos={[2, 0, 6]} tall={false} />

      {/* Финиш: дом с лейблом */}
      <GoalTrigger
        pos={[0, 2, -12.5]}
        size={[4, 3, 2]}
        result={{
          kind: 'win',
          label: 'ЛУЧШИЙ ХОЗЯИН!',
          subline: 'Питомец сыт, бодр и счастлив. Все вернулись домой.',
        }}
      />
    </>
  )
}

export const PETBRAIN_SPAWN: [number, number, number] = [0, 3, 6]
