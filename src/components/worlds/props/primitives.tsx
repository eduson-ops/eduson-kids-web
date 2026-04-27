import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { PUBLIC_BASE } from '../../lib/publicPath'
export function Torch({ pos }: { pos: [number, number, number] }) {
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

export function GraveyardProp({
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

export function PlatformerProp({
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