import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Процедурные механики ─────────────────────────────────────────

export function SpeedPad({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Portal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Crystal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Campfire({ pos, size }: { pos: [number, number, number]; size: number }) {
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

export function Sign({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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