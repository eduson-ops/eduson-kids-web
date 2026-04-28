import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Superhero ────────────────────────────────────────────

export function HeroCape({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const capeRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (capeRef.current) {
      const t = Date.now() * 0.002
      capeRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t + i * 0.3) * 0.08
      })
    }
  })
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* stand/mannequin torso */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.18, size * 0.7, 8]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.94, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.18, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.14, 8, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* shoulders */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.22, size * 0.82, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
        </mesh>
      ))}
      {/* cape (layered panels) */}
      <group ref={capeRef} position={[0, size * 0.84, -size * 0.05]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.55, size * 0.72, size * 0.04]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        <mesh position={[0, -size * 0.36, size * 0.04]} castShadow>
          <boxGeometry args={[size * 0.5, size * 0.1, size * 0.04]} />
          <meshStandardMaterial color="#8b0000" roughness={0.5} />
        </mesh>
      </group>
      {/* logo symbol */}
      <mesh position={[0, size * 0.62, size * 0.16]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#ffd644" emissive="#ffa000" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.28, size * 0.1, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function HeroMask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* display stand */}
      <mesh position={[0, size * 0.32, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.64, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 8, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* mask */}
      <mesh position={[0, size * 0.68, size * 0.18]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.26, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* eye holes */}
      {[-0.13, 0.13].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.24]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.02]} />
          <meshStandardMaterial color="#000" roughness={1.0} />
        </mesh>
      ))}
      {/* ear wings */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.25, size * 0.76, size * 0.14]} rotation={[0, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.06, size * 0.18, 3]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      ))}
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.25, size * 0.08, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function PowerShield({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const shieldRef = useRef<THREE.Mesh>(null!)
  const rimRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (shieldRef.current) {
      const mat = shieldRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.15
    }
    if (rimRef.current) rimRef.current.rotation.z += dt * 0.5
  })
  const c = color || '#4488ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.55, pos[2]]}>
      {/* shield face */}
      <mesh ref={shieldRef} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.75, size * 0.08]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.2} metalness={0.3} transparent opacity={0.85} />
      </mesh>
      {/* energy rim */}
      <mesh ref={rimRef}>
        <torusGeometry args={[size * 0.38, size * 0.04, 5, 24]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      {/* star/emblem */}
      <mesh position={[0, 0, size * 0.05]}>
        <sphereGeometry args={[size * 0.1, 5, 5]} />
        <meshStandardMaterial color="#fff" emissive="#ffdd00" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      {/* arm grip (back) */}
      <mesh position={[size * 0.15, 0, -size * 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.5, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function HeroStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#888888'
  return (
    <group position={pos}>
      {/* base pedestal */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.2, size * 0.65]} />
        <meshStandardMaterial color="#777" roughness={0.8} />
      </mesh>
      {/* legs */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.42, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.44, size * 0.2]} />
          <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {/* body */}
      <mesh position={[0, size * 0.74, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.46, size * 0.24]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* heroic pose arm up */}
      <mesh position={[size * 0.28, size * 0.95, 0]} rotation={[0, 0, -0.7]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.4, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* other arm */}
      <mesh position={[-size * 0.25, size * 0.78, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.36, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* cape flowing back */}
      <mesh position={[0, size * 0.88, -size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.5, size * 0.06]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* raised fist */}
      <mesh position={[size * 0.46, size * 1.2, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.12, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* inscription plaque */}
      <mesh position={[0, size * 0.12, size * 0.33]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.12, size * 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function EnergyCore({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const coreRef = useRef<THREE.Mesh>(null!)
  const ringRef1 = useRef<THREE.Mesh>(null!)
  const ringRef2 = useRef<THREE.Mesh>(null!)
  const ringRef3 = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      const pulse = 0.7 + Math.sin(Date.now() * 0.004) * 0.3
      mat.emissiveIntensity = pulse * 1.5
      coreRef.current.scale.setScalar(0.9 + pulse * 0.1)
    }
    if (ringRef1.current) ringRef1.current.rotation.x += dt * 1.5
    if (ringRef2.current) ringRef2.current.rotation.y += dt * 1.2
    if (ringRef3.current) ringRef3.current.rotation.z += dt * 0.9
  })
  const c = color || '#00d2ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.6, pos[2]]}>
      {/* orbital rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[size * 0.45, size * 0.04, 5, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
      <mesh ref={ringRef2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[size * 0.38, size * 0.03, 5, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
      <mesh ref={ringRef3} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[size * 0.32, size * 0.025, 5, 18]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* glowing core */}
      <mesh ref={coreRef} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 10]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.5} roughness={0.05} metalness={0.1} transparent opacity={0.9} />
      </mesh>
      {/* outer glow shell */}
      <mesh>
        <sphereGeometry args={[size * 0.28, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.2} transparent opacity={0.25} />
      </mesh>
      {/* support stand */}
      <mesh position={[0, -size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.14, size * 0.5, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.08, 8]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 5 — Buildings & City-2 (20 props)
// ══════════════════════════════════════════════════════════

interface P5 { pos: [number,number,number]; color: string; size: number }

export function HouseSmall({ pos, color, size }: P5) {
  const c = color || '#e8d5b0'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <coneGeometry args={[size * 1.05, size * 0.65, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.28, size * 0.61]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.5, size * 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {([-0.38, 0.38] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.55, size * 0.61]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.22, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[size * 0.45, size * 1.4, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.35, size * 0.12]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function ApartmentBlock({ pos, color, size }: P5) {
  const c = color || '#b8c8d8'
  const floors = 4
  return (
    <group position={pos}>
      <mesh position={[0, size * floors * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * floors, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * floors + size * 0.06, 0]}>
        <boxGeometry args={[size * 1.7, size * 0.12, size * 1.3]} />
        <meshStandardMaterial color="#999" roughness={0.4} />
      </mesh>
      {Array.from({ length: floors }).map((_, row) =>
        ([-0.45, 0, 0.45] as number[]).map((dx, col) => (
          <mesh key={`w${row}-${col}`} position={[size * dx, size * (row + 0.5), size * 0.61]} castShadow>
            <boxGeometry args={[size * 0.24, size * 0.3, size * 0.02]} />
            <meshStandardMaterial color="#f0e8b0" roughness={0.1} emissive="#f0e8b0" emissiveIntensity={0.15} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function Skyscraper({ pos, color, size }: P5) {
  const c = color || '#7fb3d3'
  const h = size * 8
  return (
    <group position={pos}>
      <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, h, size]} />
        <meshStandardMaterial color={c} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, h + size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.7, 5]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, h + size * 0.75, 0]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={1.2} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[size * 0.51, size * (i + 0.5), 0]}>
          <boxGeometry args={[size * 0.02, size * 0.6, size * 0.7]} />
          <meshStandardMaterial color="#c8e6fa" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function Cottage({ pos, color, size }: P5) {
  const c = color || '#f5e6c8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.85, size]} />
        <meshStandardMaterial color={c} roughness={0.75} />
      </mesh>
      <mesh position={[0, size * 0.96, 0]} castShadow>
        <coneGeometry args={[size * 0.92, size * 0.6, 4]} />
        <meshStandardMaterial color="#c8a850" roughness={0.9} />
      </mesh>
      {([-0.15, 0, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.02, size * 0.75 + size * i * 0.18]} receiveShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.04, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[size * 0.42, size * 0.38, size * 0.5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.1, size * 0.12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {([-0.1, 0, 0.1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * (0.42 + dx), size * 0.48, size * 0.5]}>
          <sphereGeometry args={[size * 0.06, 5, 5]} />
          <meshStandardMaterial color={(['#ff6b6b','#ffcc00','#ff69b4'] as string[])[i]!} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function LighthouseProp({ pos, color, size }: P5) {
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (beamRef.current) beamRef.current.rotation.y = clock.getElapsedTime() * 1.5
  })
  const c = color || '#f5f0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.38, size * 3, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([0.8, 1.6, 2.4] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, 0]}>
          <cylinderGeometry args={[size * 0.295, size * 0.35, size * 0.18, 8]} />
          <meshStandardMaterial color="#c0392b" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size * 3.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.3, size * 0.4, 8]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh ref={beamRef} position={[0, size * 3.4, 0]}>
        <boxGeometry args={[size * 1.8, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, size * 3.4, 0]}>
        <sphereGeometry args={[size * 0.22, 8, 8]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={1.8} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.55, size * 0.12, 8]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function CastleWall({ pos, color, size }: P5) {
  const c = color || '#a0a098'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.5, size * 1.2, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {([-1, -0.5, 0, 0.5, 1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx * 1.1, size * 1.35, 0]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.35, size * 0.5]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.42, 0]}>
        <boxGeometry args={[size * 0.45, size * 0.84, size * 0.52]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ShopFront({ pos, color, size }: P5) {
  const c = color || '#e8f4e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * 1.4, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.72, size * 0.52]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.08, size * 0.5]} />
        <meshStandardMaterial color={color || '#e74c3c'} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 1.12, size * 0.46]}>
        <boxGeometry args={[size * 1.1, size * 0.22, size * 0.04]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.55, size * 0.46]}>
        <boxGeometry args={[size * 1.1, size * 0.65, size * 0.04]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, size * 1.46, 0]}>
        <boxGeometry args={[size * 1.65, size * 0.12, size * 0.95]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function SchoolBuilding({ pos, color, size }: P5) {
  const c = color || '#fdf6e3'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.2, size * 1.5, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
      <mesh position={[0, size * 1.6, 0]} castShadow>
        <coneGeometry args={[size * 1.65, size * 0.5, 4]} />
        <meshStandardMaterial color="#6c5a2e" roughness={0.7} />
      </mesh>
      {([-0.7, 0, 0.7] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.9, size * 0.61]} castShadow>
          <boxGeometry args={[size * 0.32, size * 0.38, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.36, size * 0.61]}>
        <boxGeometry args={[size * 0.35, size * 0.65, size * 0.03]} />
        <meshStandardMaterial color="#3d7ab5" roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.95, size * 1.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.8, 5]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[size * 1.12, size * 2.2, 0]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.22, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function BarnBig({ pos, color, size }: P5) {
  const c = color || '#8B2020'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 1.8, size * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 2.05, 0]} castShadow>
        <boxGeometry args={[size * 2, size * 0.55, size * 1.6]} />
        <meshStandardMaterial color="#5a1010" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 2.28, 0]} castShadow>
        <coneGeometry args={[size * 1.12, size * 0.5, 4]} />
        <meshStandardMaterial color="#5a1010" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.7, size * 0.71]}>
        <boxGeometry args={[size * 0.75, size * 1.3, size * 0.04]} />
        <meshStandardMaterial color="#6B3a12" roughness={0.8} />
      </mesh>
      {([1, -1] as number[]).map((s, i) => (
        <mesh key={i} position={[0, size * 0.7, size * 0.73]} rotation={[0, 0, s * Math.PI / 4]}>
          <boxGeometry args={[size * 1.1, size * 0.05, size * 0.02]} />
          <meshStandardMaterial color="#4a2a08" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.75, size * 0.71]}>
        <boxGeometry args={[size * 0.38, size * 0.32, size * 0.03]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function TempleProp({ pos, color, size }: P5) {
  const c = color || '#d4af6a'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 0.2, size * 2]} />
        <meshStandardMaterial color="#c8b87a" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.3, size * 1.2, size * 1.3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([0, 1] as number[]).map((tier) => (
        <mesh key={tier} position={[0, size * 1.5 + tier * size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * (1.7 - tier * 0.4), size * 0.18, size * (1.7 - tier * 0.4)]} />
          <meshStandardMaterial color="#8B0000" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 2.55, 0]} castShadow>
        <coneGeometry args={[size * 0.18, size * 0.55, 4]} />
        <meshStandardMaterial color="#8B0000" roughness={0.5} />
      </mesh>
      {([[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
          <meshStandardMaterial color="#e8d8a0" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function Hospital({ pos, color, size }: P5) {
  const c = color || '#f0f0f8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 2.4, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.55, size * 0.68]} castShadow>
        <boxGeometry args={[size * 0.9, size * 1.1, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.8, size * 0.61]}>
        <boxGeometry args={[size * 0.5, size * 0.12, size * 0.04]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.8, size * 0.61]}>
        <boxGeometry args={[size * 0.12, size * 0.5, size * 0.04]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      {Array.from({ length: 3 }).map((_, row) =>
        ([-0.6, 0, 0.6] as number[]).map((dx, col) => (
          <mesh key={`h${row}-${col}`} position={[size * dx, size * (row * 0.7 + 0.55), size * 0.61]}>
            <boxGeometry args={[size * 0.28, size * 0.32, size * 0.02]} />
            <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function PoliceStation({ pos, color, size }: P5) {
  const c = color || '#dde8ee'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 1.4, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.47, 0]}>
        <boxGeometry args={[size * 1.85, size * 0.14, size * 1.15]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.9, size * 0.56]}>
        <boxGeometry args={[size * 1.8, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.12, size * 0.56]}>
        <boxGeometry args={[size * 0.8, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.32, size * 0.56]}>
        <boxGeometry args={[size * 0.32, size * 0.58, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function FireStation({ pos, color, size }: P5) {
  const c = color || '#fff0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 1.4, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {([-0.5, 0.5] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.52, size * 0.56]}>
          <boxGeometry args={[size * 0.72, size * 0.96, size * 0.03]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.12, size * 0.56]}>
        <boxGeometry args={[size * 2, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#c0392b" roughness={0.3} />
      </mesh>
      <mesh position={[size * 0.78, size * 1.85, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 1.0, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.78, size * 2.42, 0]}>
        <coneGeometry args={[size * 0.32, size * 0.3, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.47, 0]}>
        <boxGeometry args={[size * 2.05, size * 0.12, size * 1.15]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function LibraryBuilding({ pos, color, size }: P5) {
  const c = color || '#f5f0e0'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, size * 0.62]} receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.12, size * 0.4]} />
        <meshStandardMaterial color="#ddd" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 1.6, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([-0.55, -0.18, 0.18, 0.55] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * 0.65]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size * 1.6, 8]} />
          <meshStandardMaterial color="#ece8d8" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.76, size * 0.58]} castShadow>
        <coneGeometry args={[size * 1.1, size * 0.45, 3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.65, 0]}>
        <boxGeometry args={[size * 1.85, size * 0.1, size * 1.25]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function ParkFountain({ pos, color, size }: P5) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (waterRef.current) waterRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.9, size * 1.0, size * 0.16, 16]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
      <mesh ref={waterRef} position={[0, size * 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.82, size * 0.82, size * 0.04, 16]} />
        <meshStandardMaterial color={c} roughness={0.1} metalness={0.2} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.7, 8]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.85, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.42, size * 0.1, 12]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {([0, 90, 180, 270] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.15, size * 0.95, Math.sin(rad) * size * 0.15]}
            rotation={[Math.PI * 0.35, 0, rad + Math.PI / 2]}>
            <cylinderGeometry args={[size * 0.018, size * 0.018, size * 0.32, 5]} />
            <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} emissive={c} emissiveIntensity={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

export function BusStop({ pos, color, size }: P5) {
  const c = color || '#2980b9'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.38, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, size * 0.7, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 1.4, size * 1.3, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.2} transparent opacity={0.5} />
      </mesh>
      {([-0.65, 0.65] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.7, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 1.4, size * 0.06]} />
          <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.28, -size * 0.12]}>
        <boxGeometry args={[size * 1.1, size * 0.08, size * 0.28]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {([-0.42, 0.42] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.12, -size * 0.12]}>
          <boxGeometry args={[size * 0.06, size * 0.24, size * 0.06]} />
          <meshStandardMaterial color="#666" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.9, -size * 0.26]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function BridgeArch({ pos, color, size }: P5) {
  const c = color || '#a0a098'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 3.5, size * 0.15, size * 0.9]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 1.1, size * 0.12, 5, 24, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([-1.65, 1.65] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.25, size * 0.7, size * 0.9]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      {([-0.42, 0.42] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.98, size * dz]} castShadow>
          <boxGeometry args={[size * 3.5, size * 0.07, size * 0.04]} />
          <meshStandardMaterial color="#aaa" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function Stadium({ pos, color, size }: P5) {
  const c = color || '#2c8a4a'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <boxGeometry args={[size * 2.4, size * 0.12, size * 1.6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {([-0.8, 0, 0.8] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.13, 0]}>
          <boxGeometry args={[size * 0.04, size * 0.02, size * 1.6]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
      {[
        { sp: [0, size * 0.45, size * 1.05] as [number,number,number], rot: [Math.PI * 0.18, 0, 0] as [number,number,number], w: size * 2.6 },
        { sp: [0, size * 0.45, -size * 1.05] as [number,number,number], rot: [-Math.PI * 0.18, 0, 0] as [number,number,number], w: size * 2.6 },
        { sp: [size * 1.4, size * 0.45, 0] as [number,number,number], rot: [0, 0, -Math.PI * 0.18] as [number,number,number], w: size * 1.6 },
        { sp: [-size * 1.4, size * 0.45, 0] as [number,number,number], rot: [0, 0, Math.PI * 0.18] as [number,number,number], w: size * 1.6 },
      ].map(({ sp, rot, w }, i) => (
        <mesh key={i} position={sp} rotation={rot} castShadow receiveShadow>
          <boxGeometry args={[w, size * 0.5, size * 0.3]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
      ))}
      {([[-1.35,-1.0],[1.35,-1.0],[-1.35,1.0],[1.35,1.0]] as [number,number][]).map(([dx,dz],i) => (
        <mesh key={i} position={[size*dx, size*0.6, size*dz]} castShadow>
          <cylinderGeometry args={[size*0.15, size*0.18, size*1.2, 6]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Museum({ pos, color, size }: P5) {
  const c = color || '#f5f0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.2, size * 1.7, size * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.45} />
      </mesh>
      <mesh position={[0, size * 1.9, 0]} castShadow>
        <sphereGeometry args={[size * 0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.78, 0]}>
        <cylinderGeometry args={[size * 0.62, size * 0.62, size * 0.2, 12]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.3} />
      </mesh>
      {([-0.75, -0.25, 0.25, 0.75] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.85, size * 0.76]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.7, 8]} />
          <meshStandardMaterial color="#ece8d8" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.77, size * 0.66]}>
        <boxGeometry args={[size * 2.2, size * 0.12, size * 0.2]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0, size * i * 0.06, size * 0.82 + size * i * 0.08]}>
          <boxGeometry args={[size * 2.2, size * 0.06, size * 0.22]} />
          <meshStandardMaterial color="#ddd" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function MarketStall({ pos, color, size }: P5) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {([[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.65, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.3, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {([-0.5, -0.16, 0.16, 0.5] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 1.28, size * 0.34]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.16, size * 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? c : '#fff'} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.08, size * 0.55]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
      </mesh>
      {([-0.3, 0, 0.3] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.64, 0]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color={(['#e74c3c','#f39c12','#27ae60'] as string[])[i]!} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 6 — Transport-2 & Food/Café (20 props) — stub, no components yet
// ══════════════════════════════════════════════════════════
