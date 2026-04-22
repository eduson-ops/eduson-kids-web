import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group } from 'three'

interface CloudDef {
  x: number
  y: number
  z: number
  scale: number
  drift: number
}

const CLOUDS: CloudDef[] = [
  { x: -30, y: 22, z: -20, scale: 2.0, drift: 0.4 },
  { x: 35, y: 26, z: -35, scale: 2.4, drift: 0.3 },
  { x: -10, y: 20, z: -50, scale: 1.6, drift: 0.5 },
  { x: 50, y: 24, z: 10, scale: 2.1, drift: 0.35 },
  { x: -45, y: 28, z: 25, scale: 1.8, drift: 0.45 },
  { x: 5, y: 30, z: 60, scale: 2.2, drift: 0.3 },
  { x: -60, y: 21, z: -5, scale: 1.5, drift: 0.5 },
]

/**
 * Voxel-pixel облака — композиция белых кубов, медленно плывут по оси X.
 * Форма: центральный прямоугольник + 2-3 чуть меньших кубика по бокам.
 * Дешёвый flat-shaded материал, без теней (они бы только мусорили).
 */
export default function VoxelClouds() {
  const root = useRef<Group>(null!)

  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    root.current.children.forEach((child, i) => {
      const def = CLOUDS[i]
      // плавно дрейф по X + sway по Y
      child.position.x = def.x + Math.sin(t * 0.05 + i) * 6 * def.drift
      child.position.y = def.y + Math.sin(t * 0.15 + i * 0.8) * 0.4
    })
  })

  return (
    <group ref={root}>
      {CLOUDS.map((c, i) => (
        <Cloud key={i} scale={c.scale} />
      ))}
    </group>
  )
}

function Cloud({ scale }: { scale: number }) {
  // Воксель-блоки, собранные в облако
  const blocks = useMemo<
    Array<{ pos: [number, number, number]; size: [number, number, number] }>
  >(
    () => [
      { pos: [0, 0, 0], size: [3, 1.2, 1.8] },
      { pos: [1.8, 0.3, 0], size: [1.6, 1, 1.5] },
      { pos: [-1.6, 0.1, 0.2], size: [1.5, 0.9, 1.4] },
      { pos: [0.5, 0.8, 0.2], size: [1.3, 0.8, 1.1] },
      { pos: [-0.6, -0.4, -0.3], size: [1.2, 0.6, 1.0] },
    ],
    []
  )
  return (
    <group scale={[scale, scale, scale]}>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.05}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}
