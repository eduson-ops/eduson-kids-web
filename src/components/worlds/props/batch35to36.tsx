import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// === BATCH 35: Arctic Tundra + Medieval Castle ===
interface P35 { pos: [number,number,number]; color: string; size: number }

export function IglooB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.55, 12, 8, 0, Math.PI*2, 0, Math.PI*0.6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[size*0.42, -size*0.12, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[size*0.14, size*0.14, size*0.32, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, -size*0.42, 0]}>
        <cylinderGeometry args={[size*0.56, size*0.56, size*0.06, 12]} />
        <meshStandardMaterial color="#d8f0f8" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function PolarBearB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.3
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.8) * size * 0.02
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.35, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.3, size*0.22]}>
        <sphereGeometry args={[size*0.24, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.28, size*0.44]}>
        <sphereGeometry args={[size*0.1, 6, 6]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>
      {([[-0.22, -0.28, 0.16], [0.22, -0.28, 0.16], [-0.22, -0.28, -0.16], [0.22, -0.28, -0.16]] as number[][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <sphereGeometry args={[size*0.1, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function ArcticFoxB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.35
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.28, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.28, size*0.12, 0]}>
        <sphereGeometry args={[size*0.18, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.44, size*0.22, 0]}>
        <coneGeometry args={[size*0.04, size*0.12, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size*0.38, size*0.05, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[size*0.04, size*0.02, size*0.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function SnowDriftB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      {([
        [0, 0, 0, size*0.65, size*0.22, size*0.55],
        [size*0.3, 0, size*0.15, size*0.45, size*0.16, size*0.38],
        [-size*0.25, 0, -size*0.1, size*0.4, size*0.14, size*0.35],
      ] as number[][]).map(([x,y,z,_sx,_sy,_sz], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[1, 8, 5, 0, Math.PI*2, 0, Math.PI*0.55]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function WalrusB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.42, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.28, size*0.3]}>
        <sphereGeometry args={[size*0.28, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.09, size*0.12, size*0.55]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[size*0.025, size*0.015, size*0.28, 6]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.4} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.1, size*0.26, size*0.56]}>
          <sphereGeometry args={[size*0.06, 5, 5]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function IcebergB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[size*0.6, 1]} />
        <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.85} />
      </mesh>
      <mesh position={[size*0.2, -size*0.15, size*0.1]}>
        <octahedronGeometry args={[size*0.35, 0]} />
        <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function NorthernLightsB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.15;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
  })
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <torusGeometry args={[size*0.8, size*0.06, 4, 30, Math.PI*1.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, size*0.3, 0]} rotation={[0.3, 0.5, 0]}>
        <torusGeometry args={[size*0.55, size*0.04, 4, 24, Math.PI*1.2]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} roughness={0.1} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function PenguinB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.25
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.02, size*0.12]}>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.24, 0]}>
        <sphereGeometry args={[size*0.19, 8, 7]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.27, size*0.16]}>
        <sphereGeometry args={[size*0.14, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.24, size*0.3]}>
        <sphereGeometry args={[size*0.05, 5, 4]} />
        <meshStandardMaterial color="#ff8800" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CastleTowerB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.4, size*1.8, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*1.0, 0]}>
        <cylinderGeometry args={[size*0.38, size*0.38, size*0.12, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.628) * size * 0.38,
          size*1.12,
          Math.cos(i * 0.628) * size * 0.38
        ]}>
          <boxGeometry args={[size*0.1, size*0.18, size*0.1]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.3, size*0.38]}>
        <boxGeometry args={[size*0.22, size*0.35, size*0.05]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*1.3, 0]}>
        <coneGeometry args={[size*0.4, size*0.55, 10]} />
        <meshStandardMaterial color="#8b0000" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function DrawbridgeB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.12, size*0.08]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {([-0.55, 0.55] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.45, 0]}>
          <boxGeometry args={[size*0.1, size*0.9, size*0.08]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {([-0.4, 0, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, 0, 0]}>
          <boxGeometry args={[size*0.06, size*0.12, size*0.5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.92, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.16, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function KnightArmorB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.2 })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.05, 0]} castShadow>
        <boxGeometry args={[size*0.38, size*0.55, size*0.28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.38, 0]}>
        <sphereGeometry args={[size*0.22, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.42, size*0.13]}>
        <boxGeometry args={[size*0.28, size*0.12, size*0.04]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.28, -size*0.05, 0]}>
          <boxGeometry args={[size*0.1, size*0.52, size*0.22]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.1, -size*0.5, 0]}>
          <boxGeometry args={[size*0.14, size*0.48, size*0.2]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CatapultB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.22, 0]} castShadow>
        <boxGeometry args={[size*1.1, size*0.12, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {([-0.4, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, -size*0.12, 0]}>
          <cylinderGeometry args={[size*0.16, size*0.16, size*0.08, 10]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-size*0.15, size*0.12, 0]} rotation={[0, 0, -0.7]}>
        <boxGeometry args={[size*0.1, size*0.9, size*0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-size*0.5, size*0.52, 0]}>
        <sphereGeometry args={[size*0.15, 8, 6]} />
        <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>
      <mesh position={[size*0.18, -size*0.08, 0]}>
        <boxGeometry args={[size*0.12, size*0.28, size*0.12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function MedievalWellB35({ pos, color, size }: P35) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.18, 0]} castShadow>
        <cylinderGeometry args={[size*0.32, size*0.32, size*0.4, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[size*0.32, size*0.05, 6, 20]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-0.32, 0.32] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.28, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.55, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.56, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.68, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.62, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[size*0.72, size*0.06, size*0.16]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TorchB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 5 + Math.random()) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.85, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.07, size*0.07, size*0.15, 6]} />
        <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.65, 0]}>
        <coneGeometry args={[size*0.1, size*0.22, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function BannerB35({ pos, color, size }: P35) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.06
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.03, size*0.03, size*1.8, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[size*0.22, size*0.6, 0]}>
        <boxGeometry args={[size*0.45, size*0.65, size*0.03]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[size*0.22, size*0.35, 0]}>
        <coneGeometry args={[size*0.08, size*0.18, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.92, 0]}>
        <sphereGeometry args={[size*0.07, 6, 6]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// === BATCH 36: Rainforest + Space Exploration ===
interface P36 { pos: [number,number,number]; color: string; size: number }

export function ToucanB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.3
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.8) * size * 0.05
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.25, 8, 7]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <sphereGeometry args={[size*0.18, 8, 7]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.2, size*0.24]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[size*0.08, size*0.08, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.18, size*0.06]}>
        <sphereGeometry args={[size*0.1, 6, 5]} />
        <meshStandardMaterial color="#ffffd0" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function LianaB36({ pos, color, size }: P36) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*2.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {([0.4, 0.8, 1.2, 1.6] as number[]).map((y, i) => (
        <mesh key={i} position={[Math.sin(i*1.57)*size*0.18, (y - 1.0)*size, 0]} rotation={[0, 0, Math.sin(i*1.57)*0.4]}>
          <torusGeometry args={[size*0.1, size*0.02, 4, 10, Math.PI*1.6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[Math.sin(i)*size*0.22, (i*0.5 - 0.8)*size, 0]}>
          <sphereGeometry args={[size*0.06, 5, 4]} />
          <meshStandardMaterial color="#228B22" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ParrotB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.08
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.2, 0]}>
        <sphereGeometry args={[size*0.16, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.18, size*0.14]}>
        <sphereGeometry args={[size*0.06, 5, 4]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      <mesh position={[size*0.2, size*0.05, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[size*0.05, size*0.5, size*0.04]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.2, size*0.05, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[size*0.05, size*0.5, size*0.04]} />
        <meshStandardMaterial color="#ff4400" roughness={0.5} />
      </mesh>
      <mesh position={[0, -size*0.38, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.02, size*0.42, 6]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function WaterFallB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 2) * size * 0.04 - size * 0.5
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.3, size*0.2]} />
        <meshStandardMaterial color="#775533" roughness={0.9} />
      </mesh>
      <mesh ref={ref}>
        <boxGeometry args={[size*0.35, size*1.1, size*0.08]} />
        <meshStandardMaterial color={color} roughness={0.2} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, -size*0.85, 0]}>
        <cylinderGeometry args={[size*0.45, size*0.45, size*0.15, 12]} />
        <meshStandardMaterial color={color} roughness={0.2} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function FernB36({ pos, color, size }: P36) {
  return (
    <group position={pos}>
      {([0, 1, 2, 3, 4, 5, 6] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.898) * size * 0.25,
          size * 0.1,
          Math.cos(i * 0.898) * size * 0.25
        ]} rotation={[0.6, i * 0.898, 0]}>
          <boxGeometry args={[size*0.38, size*0.06, size*0.03]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, -size*0.15, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.3, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function JaguarB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.3
    ref.current.position.y = pos[1] + Math.abs(Math.sin(clock.getElapsedTime() * 0.9)) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.28, size*0.28]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[size*0.38, size*0.1, 0]}>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size*0.4, -size*0.1, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[size*0.04, size*0.02, size*0.48, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([[-0.2, -0.22, 0.1], [0.2, -0.22, 0.1], [-0.2, -0.22, -0.1], [0.2, -0.22, -0.1]] as number[][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <cylinderGeometry args={[size*0.04, size*0.03, size*0.28, 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function RocketShipB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.8) * size * 0.08
    ref.current.rotation.y = clock.getElapsedTime() * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.28, size*1.4, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.82, 0]}>
        <coneGeometry args={[size*0.22, size*0.55, 10]} />
        <meshStandardMaterial color="#cc0000" roughness={0.4} metalness={0.5} />
      </mesh>
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 2.094) * size * 0.32,
          -size*0.55,
          Math.cos(i * 2.094) * size * 0.32
        ]} rotation={[0, i * 2.094, 0.4]}>
          <boxGeometry args={[size*0.2, size*0.45, size*0.05]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -size*0.75, 0]}>
        <coneGeometry args={[size*0.14, size*0.2, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function SpaceSuitB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.25
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.6) * size * 0.06
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.08, 0]} castShadow>
        <boxGeometry args={[size*0.42, size*0.52, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, size*0.35, 0]}>
        <sphereGeometry args={[size*0.26, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, size*0.36, size*0.16]}>
        <sphereGeometry args={[size*0.16, 8, 8]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.2} transparent opacity={0.6} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.3, -size*0.05, 0]}>
          <boxGeometry args={[size*0.14, size*0.5, size*0.25]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.12, -size*0.5, 0]}>
          <boxGeometry args={[size*0.16, size*0.45, size*0.22]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function LunarLanderB36({ pos, color, size }: P36) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.8, size*0.55, size*0.8]} />
        <meshStandardMaterial color="#d4c87a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.35, 0]}>
        <cylinderGeometry args={[size*0.25, size*0.3, size*0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {([[-1,-1], [-1,1], [1,-1], [1,1]] as number[][]).map(([x,z], i) => (
        <group key={i} position={[x*size*0.55, -size*0.25, z*size*0.55]}>
          <mesh rotation={[0.4*x, 0, 0.4*z]}>
            <cylinderGeometry args={[size*0.03, size*0.03, size*0.55, 5]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[x*size*0.1, -size*0.28, z*size*0.1]}>
            <cylinderGeometry args={[size*0.1, size*0.1, size*0.04, 8]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function StarMapB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.4 })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size*0.5, 12, 8]} />
        <meshStandardMaterial color="#0a0520" roughness={0.3} transparent opacity={0.6} />
      </mesh>
      {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.524) * size * 0.44,
          Math.cos(i * 0.524 * 0.7) * size * 0.3,
          Math.cos(i * 0.524) * size * 0.44
        ]}>
          <sphereGeometry args={[size*0.03, 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function MoonRoverB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.x = pos[0] + Math.sin(clock.getElapsedTime() * 0.4) * size * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.75, size*0.3, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {([-0.32, 0.32] as number[]).map((x, i) => (
        <group key={i}>
          {([-0.2, 0.2] as number[]).map((z, j) => (
            <mesh key={j} position={[x*size, -size*0.18, z*size]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[size*0.14, size*0.14, size*0.08, 10]} />
              <meshStandardMaterial color="#555" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, size*0.28, -size*0.05]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[size*0.55, size*0.06, size*0.38]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[size*0.32, size*0.24, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.35, 5]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function AsteroidB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.getElapsedTime() * 0.4
    ref.current.rotation.z = clock.getElapsedTime() * 0.25
  })
  return (
    <mesh ref={ref} position={pos} castShadow>
      <dodecahedronGeometry args={[size*0.48, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

export function SpaceAntennaB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.5 })
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.1, size*1.1, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.18, 0]}>
        <cylinderGeometry args={[size*0.42, size*0.0, size*0.3, 12, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} side={2} />
      </mesh>
      <mesh position={[0, size*0.08, 0]}>
        <sphereGeometry args={[size*0.07, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function NebulaCrystalB36({ pos, color, size }: P36) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.8
    ref.current.rotation.x = clock.getElapsedTime() * 0.35;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.4
  })
  return (
    <group position={pos}>
      <mesh ref={ref} castShadow>
        <octahedronGeometry args={[size*0.45, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} transparent opacity={0.82} />
      </mesh>
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[Math.sin(i*1.57)*size*0.55, 0, Math.cos(i*1.57)*size*0.55]}>
          <tetrahedronGeometry args={[size*0.12, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.1} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}
