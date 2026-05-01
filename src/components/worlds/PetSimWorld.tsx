import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'
import GradientSky from '../GradientSky'

/**
 * PetSimWorld — educational remake of «Pet Simulator 99» (Roblox top-6).
 *
 * Curriculum: M3 capstone «Pet Math Sim» — формула урона = base * level * rarity.
 * MVP — три зоны подряд:
 *   Zone 1: Трава (низкая награда)  — 5 блоков, coin на каждом
 *   Zone 2: Лёд (средняя)           — 5 блоков, coin на каждом
 *   Zone 3: Космос (высокая)        — 5 блоков, coin + редкий «rainbow»
 * Питомцы (GLTF-монстры) расставлены по зонам как decor.
 *
 * Python hooks для урока L14-L17:
 *   damage(base, level, rarity)  — formula
 *   rebirth()                    — reset progression
 */

const GRASS = '#6fd83e'
const ICE = '#88d4ff'
const SPACE = '#15142a'

interface ZoneDef {
  z0: number
  z1: number
  color: string
  blockColor: string
  name: string
  rarity: number
}

const ZONES: ZoneDef[] = [
  { z0:  0,  z1: -20, color: GRASS, blockColor: '#3fb74d', name: 'Трава',  rarity: 1 },
  { z0: -20, z1: -40, color: ICE,   blockColor: '#5aa9ff', name: 'Лёд',    rarity: 2 },
  { z0: -40, z1: -60, color: SPACE, blockColor: '#6B5CE7', name: 'Космос', rarity: 5 },
]

function Zone({ z0, z1, color }: ZoneDef) {
  const length = Math.abs(z1 - z0)
  const centerZ = (z0 + z1) / 2
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, centerZ]}>
      <mesh receiveShadow>
        <boxGeometry args={[24, 0.5, length]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

function BreakableBlock({
  pos,
  color,
  rare,
  reward,
}: {
  pos: [number, number, number]
  color: string
  rare?: boolean
  reward: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [state, setState] = useState<'idle' | 'breaking' | 'done'>('idle')
  const breakT = useRef(0)

  // «Дышащая» анимация блока в idle
  useFrame((_, dt) => {
    if (state === 'idle' && meshRef.current) {
      meshRef.current.rotation.y += dt * 0.4
    }
    if (state === 'breaking' && meshRef.current) {
      breakT.current += dt
      const p = Math.min(breakT.current / 0.35, 1)
      meshRef.current.scale.setScalar(1 - p)
      if (p >= 1) setState('done')
    }
  })

  if (state === 'done') return null

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={pos}
      sensor={state === 'breaking'}
      onIntersectionEnter={({ other }) => {
        if (state !== 'idle') return
        if (other.rigidBodyObject?.name === 'player') {
          setState('breaking')
          breakT.current = 0
          addCoin(reward)
          SFX.coin()
        }
      }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color={color}
          roughness={rare ? 0.2 : 0.7}
          metalness={rare ? 0.9 : 0.1}
          emissive={rare ? color : '#000'}
          emissiveIntensity={rare ? 0.5 : 0}
        />
      </mesh>
      {/* Трещинки-декор при rare */}
      {rare && (
        <mesh position={[0, 0.8, 0]}>
          <torusGeometry args={[0.5, 0.05, 6, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} transparent opacity={0.7} />
        </mesh>
      )}
    </RigidBody>
  )
}

function ZoneBlocks({ zone, i }: { zone: ZoneDef; i: number }) {
  // Ряд из 5 блоков по центру зоны, X-шахматка. Сломал блок — получил монеты.
  const blocks: Array<{ pos: [number, number, number]; rare: boolean }> = []
  const zLen = Math.abs(zone.z1 - zone.z0)
  for (let k = 0; k < 5; k++) {
    const zFrac = (k + 0.5) / 5
    const z = zone.z0 - zFrac * zLen
    const x = (k % 2 === 0 ? -3 : 3)
    const rare = k === 2 && i === 2          // центральный блок в Космосе — редкий
    blocks.push({ pos: [x, 0.7, z], rare })
  }
  return (
    <>
      {blocks.map((b, idx) => (
        <BreakableBlock
          key={idx}
          pos={b.pos}
          color={zone.blockColor}
          rare={b.rare}
          reward={b.rare ? zone.rarity * 3 : zone.rarity}
        />
      ))}
    </>
  )
}

function ZoneSign({ zone }: { zone: ZoneDef }) {
  // Яркая вывеска на границе зоны
  return (
    <group position={[0, 2.5, zone.z0 - 0.5]}>
      <mesh castShadow>
        <boxGeometry args={[10, 1.2, 0.25]} />
        <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.35} />
      </mesh>
      {/* Палочки-опоры */}
      <mesh position={[-4.5, -1.8, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#7a4a22" />
      </mesh>
      <mesh position={[4.5, -1.8, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#7a4a22" />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// Sparkle system — 40 tiny floating star particles
// ─────────────────────────────────────────────

interface SparkleData {
  pos: [number, number, number]
  phase: number
  speed: number
  driftX: number
  driftZ: number
  burstTimer: number
  burstActive: boolean
}

function SparkleSystem() {
  const count = 40

  const sparkles = useMemo<SparkleData[]>(() => {
    return Array.from({ length: count }, () => ({
      pos: [
        (Math.random() - 0.5) * 20,
        Math.random() * 8,
        (Math.random() - 0.5) * 20 - 30,
      ] as [number, number, number],
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
      driftX: (Math.random() - 0.5) * 0.5,
      driftZ: (Math.random() - 0.5) * 0.5,
      burstTimer: 0,
      burstActive: false,
    }))
  }, [])

  const refs = useRef<Array<THREE.Mesh | null>>(Array(count).fill(null))
  const timeRef = useRef(0)

  // Burst cluster state — up to 4 extra sparkles at a random spot
  const burstRef = useRef<{ active: boolean; pos: THREE.Vector3; timer: number }>({
    active: false,
    pos: new THREE.Vector3(),
    timer: 0,
  })
  const burstMeshRefs = useRef<Array<THREE.Mesh | null>>([null, null, null, null])

  useFrame((_, dt) => {
    timeRef.current += dt

    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const sp = sparkles[i]!
      const t = timeRef.current * sp.speed + sp.phase
      const opacity = (Math.sin(t) * 0.5 + 0.5)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = opacity
      mesh.visible = opacity > 0.05

      // Gentle drift
      mesh.position.x += sp.driftX * dt * 0.3
      mesh.position.z += sp.driftZ * dt * 0.3
      // Wrap around volume
      if (mesh.position.x > 10) mesh.position.x = -10
      if (mesh.position.x < -10) mesh.position.x = 10
      if (mesh.position.z > 0) mesh.position.z = -60
      if (mesh.position.z < -60) mesh.position.z = 0
    })

    // Random burst trigger
    if (!burstRef.current.active && Math.random() < 0.005) {
      burstRef.current.active = true
      burstRef.current.timer = 0
      burstRef.current.pos.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 6 + 0.5,
        (Math.random() - 0.5) * 20 - 30,
      )
    }

    if (burstRef.current.active) {
      burstRef.current.timer += dt
      const bt = burstRef.current.timer
      const alpha = bt < 0.4 ? bt / 0.4 : Math.max(0, 1 - (bt - 0.4) / 0.4)
      burstMeshRefs.current.forEach((m, i) => {
        if (!m) return
        const angle = (i / 4) * Math.PI * 2
        m.position.set(
          burstRef.current.pos.x + Math.cos(angle) * bt * 1.5,
          burstRef.current.pos.y + bt,
          burstRef.current.pos.z + Math.sin(angle) * bt * 1.5,
        )
        ;(m.material as THREE.MeshBasicMaterial).opacity = alpha
        m.visible = alpha > 0.01
      })
      if (bt > 0.8) {
        burstRef.current.active = false
        burstMeshRefs.current.forEach((m) => { if (m) m.visible = false })
      }
    }
  })

  return (
    <>
      {sparkles.map((sp, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={sp.pos}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={1} />
        </mesh>
      ))}
      {/* Burst cluster meshes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`burst-${i}`}
          ref={(el) => { burstMeshRefs.current[i] = el }}
          visible={false}
          position={[0, -100, 0]}
        >
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshBasicMaterial color="#ffff44" transparent opacity={0} />
        </mesh>
      ))}
    </>
  )
}

// ─────────────────────────────────────────────
// Paw-print light patches on ground
// ─────────────────────────────────────────────

const PAW_PATCH_POSITIONS: Array<[number, number, number]> = [
  [-4, 0.02, -5],
  [4, 0.02, -8],
  [-3, 0.02, -14],
  [5, 0.02, -18],
  [-5, 0.02, -25],
  [3, 0.02, -30],
  [-4, 0.02, -38],
  [4, 0.02, -45],
]

const pawPatchVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const pawPatchFragmentShader = `
  uniform float iTime;
  uniform float iIndex;
  varying vec2 vUv;
  void main() {
    vec2 center = vec2(0.5, 0.5);
    // Stretch UV to make oval shape
    vec2 stretched = vec2((vUv.x - 0.5) * 1.0, (vUv.y - 0.5) * 1.5);
    float dist = length(stretched);
    float fade = 1.0 - smoothstep(0.2, 0.5, dist);
    float pulse = sin(iTime * 1.5 + iIndex * 0.8) * 0.15 + 0.45;
    vec3 pink = vec3(1.0, 0.667, 0.733);
    gl_FragColor = vec4(pink, fade * pulse);
  }
`

function PawPatch({ pos, index }: { pos: [number, number, number]; index: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    iIndex: { value: index },
  }), [index])

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value += dt
    }
  })

  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} scale={[1.2, 0.8, 1]}>
      <planeGeometry args={[2.5, 2.5, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={pawPatchVertexShader}
        fragmentShader={pawPatchFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function PetSimWorld() {
  return (
    <>
      {/* Cheerful rainbow sky */}
      <GradientSky top="#87ceeb" bottom="#ffe4b5" radius={440} />

      {/* Pet area soft lighting */}
      <pointLight color="#ffaacc" intensity={0.5} distance={8} position={[-4, 3, -10]} />
      <pointLight color="#aaffcc" intensity={0.5} distance={8} position={[4, 3, -20]} />
      <pointLight color="#ffffaa" intensity={0.5} distance={8} position={[-4, 3, -35]} />
      <pointLight color="#ffaacc" intensity={0.5} distance={8} position={[4, 3, -50]} />

      {ZONES.map((z, i) => (
        <Zone key={`z${i}`} {...z} />
      ))}

      {/* Стартовая платформа-«портал» */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, 5]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[3, 3, 0.4, 24]} />
          <meshStandardMaterial color="#9FE8C7" emissive="#9FE8C7" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>

      {/* Вывески-разделители зон */}
      {ZONES.map((z, i) => (
        <ZoneSign key={`s${i}`} zone={z} />
      ))}

      {/* Блоки + монеты в каждой зоне */}
      {ZONES.map((z, i) => (
        <ZoneBlocks key={`b${i}`} zone={z} i={i} />
      ))}

      {/* Sparkle particles */}
      <SparkleSystem />

      {/* Paw-print light patches */}
      {PAW_PATCH_POSITIONS.map((pos, i) => (
        <PawPatch key={`paw${i}`} pos={pos} index={i} />
      ))}

      {/* Питомцы — GltfMonsters по зонам */}
      <GltfMonster which="bunny" pos={[-7, 0, -8]}   scale={1.0} animation="Yes" />
      <GltfMonster which="cactoro" pos={[7, 0, -10]} scale={1.1} animation="Wave" />
      <GltfMonster which="alien" pos={[-7, 0, -28]}  scale={1.1} />
      <GltfMonster which="birb" pos={[7, 2, -32]}    scale={0.8} patrolX={3} sensor animation="Run" />
      <GltfMonster which="blueDemon" pos={[0, 0, -50]} scale={1.4} animation="Wave" />

      {/* Финиш — звёздный трон в конце космоса */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, -62]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 2, 3]} />
          <meshStandardMaterial
            color="#c879ff"
            emissive="#c879ff"
            emissiveIntensity={0.5}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2.5, -62]}
        size={[5, 4, 3]}
        result={{
          kind: 'win',
          label: 'МАКС УРОВЕНЬ!',
          subline: 'Ты прошёл все зоны: Трава → Лёд → Космос.',
        }}
      />
    </>
  )
}

export const PETSIM_SPAWN: [number, number, number] = [0, 3, 8]
