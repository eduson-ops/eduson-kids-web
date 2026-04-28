import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Архитектура ─────────────────────────────────────────────

export function Arch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Fence({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Bench({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function FlowerPot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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
      {[[0, 0], [0.25, 0.2], [-0.25, -0.15], [0.1, -0.3]].map(([x = 0, z = 0], i) => (
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

export function Halfpipe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Windmill({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Snowman({ pos, size }: { pos: [number, number, number]; size: number }) {
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
      {[[-0.13, 0.12], [0.13, 0.12]].map(([x = 0, z = 0], i) => (
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

export function SatelliteDish({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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
