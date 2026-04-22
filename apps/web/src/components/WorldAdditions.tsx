import { useEffect, useMemo, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { PUBLIC_BASE } from '../lib/publicPath'
import {
  getAdditionsForWorld,
  getRecoloredForWorld,
  subscribeEdits,
  hashPos,
  type SpawnedPart,
} from '../lib/worldEdits'
import { Tree, Bush, Mushroom, Rock, Flowers, GrassTuft, Building, ParkedCar } from './Scenery'
import GltfMonster, { type MonsterId } from './GltfMonster'
import Coin from './Coin'

interface Props {
  worldId: string
}

export default function WorldAdditions({ worldId }: Props) {
  const [parts, setParts] = useState<SpawnedPart[]>(() => getAdditionsForWorld(worldId))
  const [recolored, setRecolored] = useState<Record<string, string>>(() => getRecoloredForWorld(worldId))

  useEffect(() => {
    const refresh = () => {
      setParts(getAdditionsForWorld(worldId))
      setRecolored(getRecoloredForWorld(worldId))
    }
    return subscribeEdits(refresh)
  }, [worldId])

  const nodes = useMemo(
    () => parts.map((p) => {
      const posHash = hashPos(p.pos)
      const effectiveColor = recolored[posHash] ?? p.color
      return <SpawnedMesh key={p.id} part={{ ...p, color: effectiveColor }} />
    }),
    [parts, recolored]
  )
  return <>{nodes}</>
}

function SpawnedMesh({ part }: { part: SpawnedPart }) {
  const { pos, color, size, kind } = part

  switch (kind) {
    // ─── Блоки ───
    case 'cube':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'sphere':
      return (
        <RigidBody type="fixed" colliders="ball" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]}>
            <sphereGeometry args={[0.5, 18, 14]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>
        </RigidBody>
      )
    case 'cylinder':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size * 1.5, size]}>
            <cylinderGeometry args={[0.45, 0.45, 1, 18]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'ramp':
      return (
        <RigidBody type="fixed" colliders="trimesh" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[2, 0.3, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'plate':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size * 2, size * 0.2, size * 2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </RigidBody>
      )

    // ─── Геймплей ───
    case 'coin':
      return <Coin pos={pos} />
    case 'checkpoint':
      return (
        <group position={pos}>
          <mesh castShadow>
            <coneGeometry args={[0.1, 0.8, 4]} />
            <meshStandardMaterial color="#48c774" />
          </mesh>
          <mesh position={[0.35, 0.2, 0]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.05]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )
    case 'goal':
      return (
        <group position={pos}>
          <mesh castShadow receiveShadow scale={[size * 3, size * 0.2, size * 1.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#ffd644"
              emissive="#ffaa00"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.4, 1.7, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )
    case 'spike':
      return (
        <group position={pos}>
          {[0, 0.3, -0.3].map((xo, i) => (
            <mesh key={i} position={[xo, 0.3, 0]} castShadow>
              <coneGeometry args={[0.15, 0.6, 6]} />
              <meshStandardMaterial color="#ff5464" roughness={0.4} metalness={0.6} />
            </mesh>
          ))}
        </group>
      )
    case 'bouncer':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size * 0.3, size]}>
            <cylinderGeometry args={[0.8, 0.9, 1, 16]} />
            <meshStandardMaterial
              color="#ff5ab1"
              emissive="#ff5ab1"
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        </RigidBody>
      )

    // ─── Платформер (Kenney Platformer Kit) ───
    case 'chest':
    case 'key':
    case 'star':
    case 'heart':
    case 'bomb':
    case 'barrel':
    case 'crate':
    case 'ladder':
    case 'tree-pine':
    case 'flag-platformer': {
      const fileMap: Record<string, string> = {
        'chest': 'chest.glb',
        'key': 'key.glb',
        'star': 'star.glb',
        'heart': 'heart.glb',
        'bomb': 'bomb.glb',
        'barrel': 'barrel.glb',
        'crate': 'crate.glb',
        'ladder': 'ladder.glb',
        'tree-pine': 'tree-pine.glb',
        'flag-platformer': 'flag.glb',
      }
      const scaleMap: Record<string, number> = {
        'chest': 1.8, 'key': 1.2, 'star': 1.4, 'heart': 1.2, 'bomb': 1.5,
        'barrel': 1.5, 'crate': 1.5, 'ladder': 2.0, 'tree-pine': 2.5, 'flag-platformer': 1.8,
      }
      return (
        <PlatformerProp
          file={fileMap[kind]}
          pos={pos}
          scale={size * (scaleMap[kind] ?? 1.5)}
        />
      )
    }

    // ─── Природа ───
    case 'tree':
      return (
        <group position={pos} scale={[size, size, size]}>
          <Tree pos={[0, 0, 0]} variant={0} />
        </group>
      )
    case 'bush':
      return <Bush pos={pos} variant={0} scale={size} />
    case 'mushroom':
      return <Mushroom pos={pos} red scale={size} />
    case 'rock':
      return <Rock pos={pos} scale={size} />
    case 'flower':
      return <Flowers pos={pos} scale={size} />
    case 'grass-tuft':
      return <GrassTuft pos={pos} tall scale={size} />

    // ─── Персонажи ───
    case 'npc-bunny':
    case 'npc-alien':
    case 'npc-cactoro':
    case 'npc-birb':
    case 'npc-bluedemon': {
      const map: Record<string, MonsterId> = {
        'npc-bunny': 'bunny',
        'npc-alien': 'alien',
        'npc-cactoro': 'cactoro',
        'npc-birb': 'birb',
        'npc-bluedemon': 'blueDemon',
      }
      return <GltfMonster which={map[kind]} pos={pos} scale={size} animation="Yes" />
    }

    // ─── Свет ───
    case 'light':
      return (
        <group position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.2}
              roughness={0.3}
            />
          </mesh>
          <pointLight color={color} intensity={1.5} distance={10} decay={2} />
        </group>
      )
    case 'torch':
      return <Torch pos={pos} />
    case 'neon-sign':
      return (
        <group position={pos}>
          <mesh castShadow scale={[size * 1.2, size * 0.8, size * 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
          <pointLight color={color} intensity={2} distance={8} decay={2} />
        </group>
      )

    // ─── Декор (Kenney packs) ───
    case 'building':
      return <Building pos={pos} letter="a" scale={size * 2} />
    case 'car':
      return <ParkedCar pos={pos} model="sedan" rotY={0} />
    case 'pumpkin':
      return <GraveyardProp file="pumpkin-carved.glb" pos={pos} scale={size * 1.6} />
    case 'coffin':
      return <GraveyardProp file="coffin.glb" pos={pos} scale={size * 2} rotY={Math.PI / 4} />
    case 'candle':
      return <GraveyardProp file="candle.glb" pos={pos} scale={size * 1.5} />

    // ─── Процедурные механики ───
    case 'speed-pad':
      return <SpeedPad pos={pos} color={color} size={size} />
    case 'portal':
      return <Portal pos={pos} color={color} size={size} />
    case 'crystal':
      return <Crystal pos={pos} color={color} size={size} />
    case 'campfire':
      return <Campfire pos={pos} size={size} />
    case 'sign':
      return <Sign pos={pos} color={color} size={size} />
    case 'stair-step':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[size * 2, size * 0.5, size]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </RigidBody>
      )

    // ─── Архитектура ───
    case 'arch':
      return <Arch pos={pos} color={color} size={size} />
    case 'fence':
      return <Fence pos={pos} color={color} size={size} />
    case 'bench':
      return <Bench pos={pos} color={color} size={size} />
    case 'flower-pot':
      return <FlowerPot pos={pos} color={color} size={size} />
    case 'halfpipe':
      return <Halfpipe pos={pos} color={color} size={size} />

    // ─── Особые ───
    case 'windmill':
      return <Windmill pos={pos} color={color} size={size} />
    case 'snowman':
      return <Snowman pos={pos} size={size} />
    case 'satellite-dish':
      return <SatelliteDish pos={pos} color={color} size={size} />

    // ─── Еда ───
    case 'cake':
      return <Cake pos={pos} color={color} size={size} />
    case 'donut':
      return <Donut pos={pos} color={color} size={size} />
    case 'ice-cream':
      return <IceCream pos={pos} color={color} size={size} />

    // ─── Sci-fi ───
    case 'rocket':
      return <Rocket pos={pos} color={color} size={size} />
    case 'robot':
      return <Robot pos={pos} color={color} size={size} />
    case 'ufo':
      return <UFO pos={pos} color={color} size={size} />

    // ─── Фэнтези ───
    case 'castle-tower':
      return <CastleTower pos={pos} color={color} size={size} />
    case 'magic-orb':
      return <MagicOrb pos={pos} color={color} size={size} />
    case 'throne':
      return <Throne pos={pos} color={color} size={size} />
    case 'guitar':
      return <Guitar pos={pos} color={color} size={size} />
    case 'piano':
      return <Piano pos={pos} color={color} size={size} />
    case 'drum-kit':
      return <DrumKit pos={pos} color={color} size={size} />
    case 'soccer-ball':
      return <SoccerBall pos={pos} color={color} size={size} />
    case 'trophy':
      return <Trophy pos={pos} color={color} size={size} />
    case 'goal-net':
      return <GoalNet pos={pos} color={color} size={size} />
    case 'duck':
      return <Duck pos={pos} color={color} size={size} />
    case 'cat-statue':
      return <CatStatue pos={pos} color={color} size={size} />
    case 'fish-tank':
      return <FishTank pos={pos} color={color} size={size} />
    case 'table':
      return <Table pos={pos} color={color} size={size} />
    case 'bookshelf':
      return <Bookshelf pos={pos} color={color} size={size} />
    case 'lamp-floor':
      return <FloorLamp pos={pos} color={color} size={size} />

    // Transportation
    case 'airplane':
      return <Airplane pos={pos} color={color} size={size} />
    case 'boat':
      return <Boat pos={pos} color={color} size={size} />
    case 'train':
      return <Train pos={pos} color={color} size={size} />

    // Playground
    case 'swing':
      return <Swing pos={pos} color={color} size={size} />
    case 'slide':
      return <Slide pos={pos} color={color} size={size} />
    case 'seesaw':
      return <Seesaw pos={pos} color={color} size={size} />

    // Space
    case 'planet':
      return <Planet pos={pos} color={color} size={size} />
    case 'asteroid':
      return <Asteroid pos={pos} color={color} size={size} />
    case 'space-station':
      return <SpaceStation pos={pos} color={color} size={size} />

    // School
    case 'book-stack':
      return <BookStack pos={pos} color={color} size={size} />
    case 'globe':
      return <Globe pos={pos} color={color} size={size} />
    case 'microscope':
      return <Microscope pos={pos} color={color} size={size} />

    // Medieval
    case 'sword':
      return <Sword pos={pos} color={color} size={size} />
    case 'shield':
      return <Shield pos={pos} color={color} size={size} />
    case 'knight-statue':
      return <KnightStatue pos={pos} color={color} size={size} />

    default:
      return null
  }
}

function Torch({ pos }: { pos: [number, number, number] }) {
  const flame = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 6
    if (flame.current) {
      flame.current.scale.y = 1 + Math.sin(phase.current) * 0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.9} />
      </mesh>
      <group ref={flame} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshStandardMaterial
            color="#ff9454"
            emissive="#ff5464"
            emissiveIntensity={1.6}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
      <pointLight color="#ff9454" intensity={1.3} distance={8} decay={2} position={[0, 1, 0]} />
    </group>
  )
}

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

function PlatformerProp({
  file,
  pos,
  scale = 1.5,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const base = `${PUBLIC_BASE}/models/kenney-platformer/Models/GLB%20format/`
  const gltf = useGLTF(`${base}${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/pumpkin-carved.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/coffin.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/candle.glb`)

// Platformer pack — preload most-used items
const PLT_BASE = `${PUBLIC_BASE}/models/kenney-platformer/Models/GLB%20format/`
useGLTF.preload(`${PLT_BASE}chest.glb`)
useGLTF.preload(`${PLT_BASE}star.glb`)
useGLTF.preload(`${PLT_BASE}coin-gold.glb`)
useGLTF.preload(`${PLT_BASE}tree-pine.glb`)

// ─── Процедурные механики ─────────────────────────────────────────

function SpeedPad({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        <mesh receiveShadow>
          <boxGeometry args={[size * 2, size * 0.15, size * 2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Arrow chevrons */}
        {[-0.5, 0, 0.5].map((z) => (
          <mesh key={z} position={[0, size * 0.1, z * size * 0.5]} rotation={[0, 0, 0]}>
            <coneGeometry args={[size * 0.25, size * 0.3, 3]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <pointLight color={color} intensity={0.8} distance={4} decay={2} position={[0, 0.5, 0]} />
      </group>
    </RigidBody>
  )
}

function Portal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ring = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 1.2
  })
  return (
    <group position={pos}>
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[size * 0.9, size * 0.12, 12, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.1} />
        </mesh>
      </group>
      {/* Inner glow disc */}
      <mesh>
        <circleGeometry args={[size * 0.78, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={6} decay={2} />
    </group>
  )
}

function Crystal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const group = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.6
  })
  const offsets: [number, number, number, number, number][] = [
    [0, 0, 0, size, size * 2.2],
    [size * 0.5, 0, size * 0.3, size * 0.6, size * 1.4],
    [-size * 0.5, 0, -size * 0.3, size * 0.55, size * 1.2],
    [size * 0.2, 0, -size * 0.55, size * 0.45, size * 1.0],
  ]
  return (
    <group position={pos} ref={group}>
      {offsets.map(([x, y, z, r, h], i) => (
        <mesh key={i} position={[x, y + h * 0.5, z]} castShadow>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.05} metalness={0.1} transparent opacity={0.85} />
        </mesh>
      ))}
      <pointLight color={color} intensity={1.2} distance={5} decay={2} />
    </group>
  )
}

function Campfire({ pos, size }: { pos: [number, number, number]; size: number }) {
  const flame = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (flame.current) {
      flame.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.12
      flame.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 7) * 0.12
    }
  })
  const logColor = '#5a3a1a'
  return (
    <group position={pos}>
      {/* Logs X-cross */}
      {[0, Math.PI / 2].map((ry, i) => (
        <mesh key={i} rotation={[0, ry, Math.PI / 8]} position={[0, size * 0.1, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 1.2, 8]} />
          <meshStandardMaterial color={logColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Flame */}
      <mesh ref={flame} position={[0, size * 0.6, 0]}>
        <coneGeometry args={[size * 0.3, size * 0.9, 8]} />
        <meshStandardMaterial color="#FF9454" emissive="#FF5400" emissiveIntensity={1.5} transparent opacity={0.85} roughness={0} />
      </mesh>
      <pointLight color="#FF9454" intensity={2} distance={6} decay={2} position={[0, size * 0.8, 0]} />
    </group>
  )
}

function Sign({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Post */}
        <mesh position={[0, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size, 8]} />
          <meshStandardMaterial color="#7a5a2a" roughness={0.9} />
        </mesh>
        {/* Board */}
        <mesh position={[0, size, 0]} castShadow>
          <boxGeometry args={[size * 1.2, size * 0.65, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
    </RigidBody>
  )
}
useGLTF.preload(`${PLT_BASE}barrel.glb`)

// ─── Архитектура ─────────────────────────────────────────────

function Arch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const mat = { color, roughness: 0.7, metalness: 0.05 }
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Left pillar */}
        <mesh position={[-size * 0.85, size * 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.4, size * 1.8, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        {/* Right pillar */}
        <mesh position={[size * 0.85, size * 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.4, size * 1.8, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        {/* Lintel */}
        <mesh position={[0, size * 1.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 2.1, size * 0.35, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      </group>
    </RigidBody>
  )
}

function Fence({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = { color, roughness: 0.9 }
  const postH = size * 1.4
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Posts */}
        {[-size * 0.75, size * 0.75].map((x, i) => (
          <mesh key={i} position={[x, postH * 0.5, 0]} castShadow>
            <boxGeometry args={[size * 0.12, postH, size * 0.12]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        {/* Rails */}
        {[0.3, 0.65, 1.0].map((frac, i) => (
          <mesh key={i} position={[0, postH * frac, 0]} castShadow>
            <boxGeometry args={[size * 1.7, size * 0.09, size * 0.09]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

function Bench({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = { color, roughness: 0.85 }
  const legColor = '#5a3a1a'
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Seat planks */}
        {[-0.1, 0.1].map((z, i) => (
          <mesh key={i} position={[0, size * 0.55, z * size]} castShadow receiveShadow>
            <boxGeometry args={[size * 1.8, size * 0.1, size * 0.25]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        {/* Backrest */}
        <mesh position={[0, size * 0.9, -size * 0.28]} castShadow>
          <boxGeometry args={[size * 1.8, size * 0.28, size * 0.09]} />
          <meshStandardMaterial {...wood} />
        </mesh>
        {/* Legs */}
        {[-size * 0.7, size * 0.7].map((x, i) => (
          <mesh key={i} position={[x, size * 0.25, 0]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.5, size * 0.6]} />
            <meshStandardMaterial color={legColor} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

function FlowerPot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Pot body */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.35, size * 0.7, 12]} />
        <meshStandardMaterial color="#c87941" roughness={0.8} />
      </mesh>
      {/* Soil top */}
      <mesh position={[0, size * 0.73, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.08, 12]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.95} />
      </mesh>
      {/* Flowers */}
      {[[0, 0], [0.25, 0.2], [-0.25, -0.15], [0.1, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x * size, size * 0.85, z * size]}>
          <mesh position={[0, size * 0.2, 0]} castShadow>
            <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.4, 6]} />
            <meshStandardMaterial color="#5ba55b" roughness={0.8} />
          </mesh>
          <mesh position={[0, size * 0.45, 0]} castShadow>
            <sphereGeometry args={[size * 0.15, 8, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Halfpipe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const segments = 8
  const radius = size * 0.9
  const width = size * 2
  return (
    <RigidBody type="fixed" colliders="trimesh" position={pos}>
      <group>
        {Array.from({ length: segments }).map((_, i) => {
          const a0 = (Math.PI / segments) * i
          const a1 = (Math.PI / segments) * (i + 1)
          const aMid = (a0 + a1) / 2
          const y = -Math.cos(aMid) * radius + radius
          const x = Math.sin(aMid) * radius - radius
          const rot = aMid - Math.PI / 2
          return (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rot]} receiveShadow castShadow>
              <boxGeometry args={[radius * (2 * Math.PI / segments / 2), size * 0.12, width]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
          )
        })}
      </group>
    </RigidBody>
  )
}

// ─── Особые ──────────────────────────────────────────────────

function Windmill({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const blades = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.8
  })
  return (
    <group position={pos}>
      <mesh position={[0, size, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.32, size * 2, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 2.1, size * 0.1]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={blades} position={[0, size * 2.1, size * 0.15]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, size * 0.65, 0]} rotation={[0, 0, (Math.PI / 2) * i]} castShadow>
            <boxGeometry args={[size * 0.14, size * 1.3, size * 0.06]} />
            <meshStandardMaterial color="#fff" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Snowman({ pos, size }: { pos: [number, number, number]; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.55, 14, 10]} />
        <meshStandardMaterial color="#f4f8ff" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 14, 10]} />
        <meshStandardMaterial color="#f4f8ff" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.38, size * 1.38, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[size * 0.06, size * 0.25, 6]} />
        <meshStandardMaterial color="#ff7700" roughness={0.5} />
      </mesh>
      {[[-0.13, 0.12], [0.13, 0.12]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 1.48, z * size]} castShadow>
          <sphereGeometry args={[size * 0.05, 6, 4]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <torusGeometry args={[size * 0.4, size * 0.07, 8, 24]} />
        <meshStandardMaterial color="#e53" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.36, size * 0.36, 12]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.07, 12]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
    </group>
  )
}

function SatelliteDish({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.1, size * 0.2]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.3, size * 0.42]} rotation={[-Math.PI / 3, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.65, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, size * 1.5, size * 0.72]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 4]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ─── Food ────────────────────────────────────────────────
function Cake({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CANDLE_COLORS = ['#ff5464', '#FFD43C', '#9FE8C7']
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.7, size * 0.7, size * 0.55, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.6, 0]}>
        <torusGeometry args={[size * 0.7, size * 0.08, 8, 20]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.52, size * 0.52, size * 0.42, 18]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]}>
        <torusGeometry args={[size * 0.52, size * 0.07, 8, 18]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.3, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {CANDLE_COLORS.map((cc, i) => {
        const angle = (i / CANDLE_COLORS.length) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(angle) * size * 0.18, size * 1.55, Math.sin(angle) * size * 0.18]}>
            <mesh>
              <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.22, 6]} />
              <meshStandardMaterial color={cc} roughness={0.7} />
            </mesh>
            <mesh position={[0, size * 0.18, 0]}>
              <coneGeometry args={[size * 0.04, size * 0.1, 6]} />
              <meshStandardMaterial color="#FF9454" emissive="#FF9454" emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Donut({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={[pos[0], pos[1] + size * 0.28, pos[2]]} rotation={[Math.PI * 0.08, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[size * 0.42, size * 0.22, 14, 28]} />
        <meshStandardMaterial color="#C99E00" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.08, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[size * 0.42, size * 0.24, 14, 28, Math.PI * 1.7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

function IceCream({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const scoop2Color = color === '#9FE8C7' ? '#FFB4C8' : '#9FE8C7'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <coneGeometry args={[size * 0.35, size * 0.8, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.8} />
      </mesh>
      {[-0.15, 0, 0.15].map((y, i) => (
        <mesh key={i} position={[0, size * (0.2 + (y + 0.15) * 2.5), 0]}>
          <torusGeometry args={[size * (0.18 - i * 0.04), size * 0.012, 4, 14]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.26, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 14, 10]} />
        <meshStandardMaterial color={scoop2Color} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Sci-fi ──────────────────────────────────────────────
function Rocket({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const FIN_ANGLES = [0, Math.PI * 2 / 3, Math.PI * 4 / 3]
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.25, size * 1.2, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.7, 0]} castShadow>
        <coneGeometry args={[size * 0.25, size * 0.6, 12]} />
        <meshStandardMaterial color="#ff5464" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.0, size * 0.26]}>
        <sphereGeometry args={[size * 0.1, 10, 8]} />
        <meshStandardMaterial color="#A9D8FF" roughness={0.1} metalness={0.8} />
      </mesh>
      {FIN_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * size * 0.35, size * 0.3, Math.cos(a) * size * 0.35]} rotation={[0, a, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.5, size * 0.35]} />
          <meshStandardMaterial color="#ff5464" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.3, size * 0.32, 10]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Robot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const LEG_X = [-0.22, 0.22]
  const ARM_X = [-0.55, 0.55]
  const EYE_X = [-0.14, 0.14]
  const CHEST_X = [-0.1, 0, 0.1]
  const CHEST_COLORS = ['#ff5464', '#FFD43C', '#9FE8C7']
  return (
    <group position={pos}>
      {LEG_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.18, 0]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.36, size * 0.22]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.54, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.62, size * 0.23]}>
        <boxGeometry args={[size * 0.36, size * 0.28, size * 0.04]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      {CHEST_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.62, size * 0.26]}>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color={CHEST_COLORS[i]} emissive={CHEST_COLORS[i]} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {ARM_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.6, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.46, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.95, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.12, 8]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.17, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.4, size * 0.42]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      {EYE_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 1.2, size * 0.22]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.04]} />
          <meshStandardMaterial color="#A9D8FF" emissive="#A9D8FF" emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.46, 0]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.22, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.58, 0]}>
        <sphereGeometry args={[size * 0.07, 8, 6]} />
        <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function UFO({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  const LIGHT_COLORS = ['#FFD43C', '#ff5464', '#9FE8C7', '#A9D8FF', '#FF9454']
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.8 })
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.8, size * 0.5, size * 0.2, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.8, size * 0.12, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#A9D8FF" roughness={0.1} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, size * 0.45, 0]}>
        <sphereGeometry args={[size * 0.16, 10, 8]} />
        <meshStandardMaterial color="#9FE8C7" roughness={0.5} />
      </mesh>
      <group ref={ref} position={[0, size * 0.14, 0]}>
        {LIGHT_COLORS.map((lc, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI * 0.4) * size * 0.62, 0, Math.sin(i * Math.PI * 0.4) * size * 0.62]}>
            <sphereGeometry args={[size * 0.07, 6, 4]} />
            <meshStandardMaterial color={lc} emissive={lc} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Fantasy ─────────────────────────────────────────────
function CastleTower({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const MERLON_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
  const WINDOW_Y = [size * 0.9, size * 1.4, size * 1.9]
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.44, size * 0.48, size * 2.2, 14]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.45, size * 0.45]}>
        <boxGeometry args={[size * 0.32, size * 0.55, size * 0.08]} />
        <meshStandardMaterial color="#2a3340" roughness={0.8} />
      </mesh>
      {WINDOW_Y.map((y, j) => (
        <mesh key={j} position={[0, y, size * 0.45]}>
          <boxGeometry args={[size * 0.14, size * 0.22, size * 0.06]} />
          <meshStandardMaterial color="#2a3340" roughness={0.8} />
        </mesh>
      ))}
      {MERLON_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.38, size * 2.38, Math.sin(a) * size * 0.38]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.26, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 2.6, 0]} castShadow>
        <coneGeometry args={[size * 0.54, size * 0.7, 14]} />
        <meshStandardMaterial color="#ff5464" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 3.05, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 6]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.12, size * 3.18, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.16, size * 0.02]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
    </group>
  )
}

function MagicOrb({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const orbRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (orbRef.current) orbRef.current.rotation.y += dt * 0.5
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.9
  })
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.24, 10]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.28, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.28, size * 0.08, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={orbRef} position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, size * 0.65, 0]}>
        <sphereGeometry args={[size * 0.24, 14, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      <group ref={ringRef} position={[0, size * 0.65, 0]}>
        <mesh rotation={[Math.PI * 0.3, 0, 0]}>
          <torusGeometry args={[size * 0.48, size * 0.04, 8, 22]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Throne({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CROWN_X = [-0.32, -0.16, 0, 0.16, 0.32]
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.12, size * 0.9]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <boxGeometry args={[size * 0.88, size * 0.1, size * 0.72]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.8, -size * 0.34]} castShadow>
        <boxGeometry args={[size * 0.88, size * 1.1, size * 0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {CROWN_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 1.42, -size * 0.34]} castShadow>
          <coneGeometry args={[size * 0.06, size * (i % 2 === 0 ? 0.22 : 0.16), 6]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.7, -size * 0.34]}>
        <sphereGeometry args={[size * 0.07, 8, 6]} />
        <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Guitar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.15]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.4, size * 0.18, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.14, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Sound hole */}
      <mesh position={[0, size * 0.06, size * 0.12]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 1.1, size * 0.08]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 1.34, 0]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.22, size * 0.07]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Strings */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.05]}>
          <cylinderGeometry args={[size * 0.003, size * 0.003, size * 1.3, 4]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Piano({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const WHITE_KEYS = 7
  const BLACK_KEYS = [1, 2, 4, 5, 6]
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.5, size * 0.7, size * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Legs */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.2, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ))}
      {/* White keys */}
      {Array.from({ length: WHITE_KEYS }, (_, i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19, size * 0.73, size * 0.22]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.06, size * 0.28]} />
          <meshStandardMaterial color="#f0ede0" roughness={0.3} />
        </mesh>
      ))}
      {/* Black keys */}
      {BLACK_KEYS.map((i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19 - size * 0.095, size * 0.78, size * 0.12]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
      ))}
      {/* Lid */}
      <mesh position={[0, size * 0.77, -size * 0.08]} rotation={[-Math.PI * 0.15, 0, 0]} castShadow>
        <boxGeometry args={[size * 1.5, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

function DrumKit({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Bass drum (large, on ground) */}
      <mesh position={[0, size * 0.22, 0]} castShadow receiveShadow rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.28, 20]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.22, size * 0.15]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.02, 20]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Snare drum */}
      <mesh position={[-size * 0.5, size * 0.5, size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.12, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-size * 0.5, size * 0.56, size * 0.1]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.01, 16]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Hi-hat cymbal */}
      <mesh position={[size * 0.5, size * 0.7, -size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.02, 20]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Cymbal stand */}
      <mesh position={[size * 0.5, size * 0.38, -size * 0.1]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.72, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Tom-tom */}
      <mesh position={[size * 0.15, size * 0.68, size * 0.05]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.12, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.15, size * 0.74, size * 0.05]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.01, 14]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Drumsticks */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, -size * 0.28]} rotation={[-Math.PI * 0.4, 0, x * 5]}>
          <cylinderGeometry args={[size * 0.018, size * 0.01, size * 0.6, 6]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function SoccerBall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 24, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Pentagon patches */}
      {[
        [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size * 0.33, y * size * 0.33 + size * 0.38, z * size * 0.33]}>
          <dodecahedronGeometry args={[size * 0.1, 0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Trophy({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.12, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.14, size * 0.22, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup body */}
      <mesh position={[0, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.2, size * 0.54, 18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup rim */}
      <mesh position={[0, size * 0.86, 0]} castShadow>
        <torusGeometry args={[size * 0.32, size * 0.04, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Handles */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.42, size * 0.58, 0]} castShadow>
          <torusGeometry args={[size * 0.12, size * 0.03, 8, 12, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Star on top */}
      <mesh position={[0, size * 0.96, 0]}>
        <sphereGeometry args={[size * 0.1, 10, 8]} />
        <meshStandardMaterial color="#fff" emissive="#ffe066" emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
    </group>
  )
}

function GoalNet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.22, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Back bar */}
      <mesh position={[0, size * 0.6, -size * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, size * 1.22, -size * 0.5]} rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Net planes */}
      <mesh position={[0, size * 0.61, -size * 0.25]} receiveShadow>
        <boxGeometry args={[size * 1.16, size * 1.16, size * 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.18} side={2} />
      </mesh>
    </group>
  )
}

function Duck({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[size * 0.2, size * 0.58, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Beak */}
      <mesh position={[size * 0.38, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.06, size * 0.08]} />
        <meshStandardMaterial color="#FF8C1A" roughness={0.6} />
      </mesh>
      {/* Eye */}
      <mesh position={[size * 0.35, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.028, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      {/* Tail */}
      <mesh position={[-size * 0.28, size * 0.38, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
        <coneGeometry args={[size * 0.1, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Feet */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[size * 0.04, size * 0.04, side * size * 0.12]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.04, size * 0.1]} />
          <meshStandardMaterial color="#FF8C1A" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function CatStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.66, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.14, size * 1.04, 0]} castShadow>
          <coneGeometry args={[size * 0.07, size * 0.13, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.08, size * 0.84, size * 0.18]}>
          <sphereGeometry args={[size * 0.04, 8, 6]} />
          <meshStandardMaterial color="#1a6a1a" roughness={0.1} emissive="#00aa00" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Raised paw */}
      <mesh position={[size * 0.2, size * 0.6, 0]} rotation={[0, 0, Math.PI * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.28, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, size * 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.32, size * 0.06, 20]} />
        <meshStandardMaterial color="#c0a060" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

function FishTank({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Stand */}
      <mesh position={[0, size * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.9, size * 0.18, size * 0.5]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.7} />
      </mesh>
      {/* Tank glass */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.6, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.35} side={2} />
      </mesh>
      {/* Water */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.5, size * 0.4]} />
        <meshStandardMaterial color="#4c97ff" roughness={0.1} transparent opacity={0.4} />
      </mesh>
      {/* Fish 1 */}
      <mesh position={[-size * 0.12, size * 0.52, 0]}>
        <sphereGeometry args={[size * 0.07, 10, 8]} />
        <meshStandardMaterial color="#ff5464" roughness={0.4} />
      </mesh>
      {/* Fish 2 */}
      <mesh position={[size * 0.14, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.055, 10, 8]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} />
      </mesh>
      {/* Gravel */}
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.08, size * 0.4]} />
        <meshStandardMaterial color="#c8b89a" roughness={1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 0.84, size * 0.04, size * 0.46]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Table({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Top */}
      <mesh position={[0, size * 0.76, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.6, -0.32], [-0.6, 0.32], [0.6, -0.32], [0.6, 0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.38, z * size]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.76, size * 0.08]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Cross supports */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 1.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Bookshelf({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const BOOK_COLORS = ['#ff5464', '#6B5CE7', '#48c774', '#FFD43C', '#4c97ff', '#FF9454']
  return (
    <group position={pos}>
      {/* Frame */}
      <mesh position={[-size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.58, 0]} castShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Shelves */}
      {[0.54, 1.06].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]}>
          <boxGeometry args={[size * 0.94, size * 0.05, size * 0.38]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Books on shelves */}
      {[0.2, 0.72, 1.24].map((shelfY, si) =>
        BOOK_COLORS.slice(0, 5).map((c, bi) => (
          <mesh key={`${si}-${bi}`} position={[(bi - 2) * size * 0.17, shelfY * size, 0]} castShadow>
            <boxGeometry args={[size * 0.12, size * 0.24, size * 0.32]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  )
}

function FloorLamp({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.1, 16]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.4, 8]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[size * 0.12, size * 1.44, 0]} rotation={[0, 0, -Math.PI * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.28, 6]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Shade */}
      <mesh position={[size * 0.18, size * 1.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.14, size * 0.28, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} side={2} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[size * 0.18, size * 1.34, 0]}>
        <sphereGeometry args={[size * 0.06, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Airplane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.12, size * 1.6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <coneGeometry args={[size * 0.12, size * 0.3, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Main wings */}
      <mesh position={[size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, size * 0.3, -size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.4, size * 0.28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh position={[size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Windows strip */}
      <mesh position={[size * 0.14, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.6, size * 0.08]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} metalness={0.1} emissive="#88d4ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function Boat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.35, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Hull bottom taper (dark) */}
      <mesh position={[0, -size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.25, size * 1.3]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, size * 0.4, size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.4, size * 0.6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, size * 0.9, size * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 1.2, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Sail */}
      <mesh position={[size * 0.15, size * 1.15, size * 0.15]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.7, size * 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} side={2} />
      </mesh>
      {/* Porthole windows */}
      <mesh position={[size * 0.36, size * 0.4, size * 0.2]}>
        <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.04, 12]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} emissive="#88d4ff" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

function Train({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main body */}
      <mesh position={[0, size * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[0, size * 0.72, size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.18, size * 0.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Boiler */}
      <mesh position={[0, size * 0.4, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Smokestack */}
      <mesh position={[0, size * 0.84, -size * 0.42]} castShadow>
        <cylinderGeometry args={[size * 0.09, size * 0.07, size * 0.25, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[0, size * 0.15, -size * 0.76]} castShadow>
        <boxGeometry args={[size * 0.72, size * 0.1, size * 0.08]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Wheels (4) */}
      {([-size * 0.35, size * 0.35] as number[]).flatMap((xOff, xi) =>
        ([-size * 0.38, size * 0.38] as number[]).map((zOff, zi) => (
          <mesh key={`w${xi}${zi}`} position={[xOff, size * 0.07, zOff]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 14]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* Headlamp */}
      <mesh position={[0, size * 0.5, -size * 0.72]}>
        <sphereGeometry args={[size * 0.08, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Swing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.82, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Chains left */}
      <mesh position={[-size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Chains right */}
      <mesh position={[size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.06, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Slide({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Platform */}
      <mesh position={[0, size * 1.1, -size * 0.35]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.7]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
      {/* Left support post */}
      <mesh position={[-size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Right support post */}
      <mesh position={[size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Ladder rungs */}
      {[0.2, 0.5, 0.8].map((h) => (
        <mesh key={h} position={[0, size * h, -size * 0.35]} castShadow>
          <boxGeometry args={[size * 0.6, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.5} />
        </mesh>
      ))}
      {/* Slide surface */}
      <mesh position={[0, size * 0.55, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Side rails */}
      <mesh position={[-size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

function Seesaw({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base triangle */}
      <mesh position={[0, size * 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.18, size * 0.28, 4]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Pivot pin */}
      <mesh position={[0, size * 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Board (slightly tilted) */}
      <mesh position={[0, size * 0.42, 0]} rotation={[0, 0, Math.PI * 0.06]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.07, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Left handle */}
      <mesh position={[-size * 0.68, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right handle */}
      <mesh position={[size * 0.68, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Left seat */}
      <mesh position={[-size * 0.68, size * 0.48, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#ff5464" roughness={0.5} />
      </mesh>
      {/* Right seat */}
      <mesh position={[size * 0.68, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#48c774" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Planet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4 })
  return (
    <group ref={ref} position={pos}>
      {/* Main sphere */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.55, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ring 1 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.78, size * 0.06, 6, 32]} />
        <meshStandardMaterial color="#c0a060" roughness={0.8} transparent opacity={0.75} />
      </mesh>
      {/* Ring 2 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.95, size * 0.04, 6, 32]} />
        <meshStandardMaterial color="#a08848" roughness={0.8} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Asteroid({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main irregular chunk */}
      <mesh castShadow rotation={[0.4, 0.7, 0.2]}>
        <dodecahedronGeometry args={[size * 0.45, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 1 */}
      <mesh position={[size * 0.3, size * 0.2, 0]} castShadow rotation={[1, 0.5, 0]}>
        <dodecahedronGeometry args={[size * 0.18, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 2 */}
      <mesh position={[-size * 0.25, -size * 0.15, size * 0.1]} castShadow rotation={[0.2, 1.2, 0.8]}>
        <dodecahedronGeometry args={[size * 0.12, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  )
}

function SpaceStation({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3 })
  return (
    <group ref={ref} position={pos}>
      {/* Central hub */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Horizontal arm */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 1.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Solar panel left */}
      <mesh position={[-size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Solar panel right */}
      <mesh position={[size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Top module */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.18, size * 0.24]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function BookStack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const COLORS = [color, '#FF5464', '#4c97ff', '#48c774']
  const heights = [size * 0.14, size * 0.12, size * 0.16, size * 0.11]
  let y = 0
  return (
    <group position={pos}>
      {heights.map((h, i) => {
        const cy = y + h / 2
        y += h
        const tilt = (i % 2 === 0) ? 0 : Math.PI * 0.04
        return (
          <mesh key={i} position={[0, cy, 0]} rotation={[0, tilt, 0]} castShadow>
            <boxGeometry args={[size * 0.7, h, size * 0.5]} />
            <meshStandardMaterial color={COLORS[i]} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

function Globe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.5 })
  return (
    <group position={pos}>
      {/* Stand base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.3, size * 0.08, 12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.44, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </mesh>
      {/* Sphere globe */}
      <group ref={ref} position={[0, size * 0.56, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.3, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Equator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.32, size * 0.018, 6, 24]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function Microscope({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.08, size * 0.38]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Arm / column */}
      <mesh position={[-size * 0.1, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Horizontal arm */}
      <mesh position={[-size * 0.1, size * 0.78, -size * 0.08]} castShadow rotation={[Math.PI / 2.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[-size * 0.1, size * 0.9, -size * 0.04]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.07, size * 0.16, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Stage / slide platform */}
      <mesh position={[-size * 0.1, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.22]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Sword({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.12]}>
      {/* Blade */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.9, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Blade tip (cone) */}
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <coneGeometry args={[size * 0.04, size * 0.14, 4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Guard (crossguard) */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.07, size * 0.07]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Grip */}
      <mesh position={[0, -size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.38, 8]} />
        <meshStandardMaterial color="#5a3010" roughness={0.7} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -size * 0.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.08, 10, 10]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

function Shield({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0.2, 0.3, 0]}>
      {/* Shield body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.65, size * 0.8, size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Emblem cross horizontal */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Emblem cross vertical */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Metal rim */}
      <mesh position={[0, 0, -size * 0.04]}>
        <boxGeometry args={[size * 0.7, size * 0.85, size * 0.04]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} wireframe />
      </mesh>
    </group>
  )
}

function KnightStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Plinth */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.1, size * 0.55]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Torso / armour */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.4, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Helmet head */}
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Visor slit */}
      <mesh position={[0, size * 0.9, size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Sword arm */}
      <mesh position={[size * 0.28, size * 0.66, 0]} castShadow rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}
