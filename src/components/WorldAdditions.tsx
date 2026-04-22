import { useEffect, useMemo, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { PUBLIC_BASE } from '../lib/publicPath'
import {
  getAdditionsForWorld,
  subscribeEdits,
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

  useEffect(() => {
    const refresh = () => setParts(getAdditionsForWorld(worldId))
    return subscribeEdits(refresh)
  }, [worldId])

  const nodes = useMemo(
    () => parts.map((p) => <SpawnedMesh key={p.id} part={p} />),
    [parts]
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
useGLTF.preload(`${PLT_BASE}barrel.glb`)
