import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Sci-fi ──────────────────────────────────────────────
export function Rocket({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function Robot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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

export function UFO({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
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
