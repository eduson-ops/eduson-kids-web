import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Kitchen ─────────────────────────────────────────────
export function Burger({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Bottom bun */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8841a" roughness={0.8} />
      </mesh>
      {/* Patty */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.12, 12]} />
        <meshStandardMaterial color="#5a2e00" roughness={0.9} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.43, size * 0.43, size * 0.06, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Top bun */}
      <mesh position={[0, size * 0.46, 0]} castShadow>
        <sphereGeometry args={[size * 0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
        <meshStandardMaterial color="#c8841a" roughness={0.8} />
      </mesh>
      {/* Sesame seeds */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * size * 0.2, size * 0.72, Math.sin(i * Math.PI / 2) * size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Pizza({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.08, 16]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.9} />
      </mesh>
      {/* Sauce */}
      <mesh position={[0, size * 0.05, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.02, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Cheese layer */}
      <mesh position={[0, size * 0.07, 0]}>
        <cylinderGeometry args={[size * 0.44, size * 0.44, size * 0.02, 16]} />
        <meshStandardMaterial color="#ffd700" roughness={0.7} />
      </mesh>
      {/* Toppings */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i / 6 * Math.PI * 2) * size * 0.28, size * 0.1, Math.sin(i / 6 * Math.PI * 2) * size * 0.28]} castShadow>
          <sphereGeometry args={[size * 0.06, 6, 4]} />
          <meshStandardMaterial color="#cc3333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Sushi({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Nori wrapper */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.28, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Rice */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.2, 12]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
      </mesh>
      {/* Fish on top */}
      <mesh position={[0, size * 0.2, 0]} castShadow rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[size * 0.36, size * 0.08, size * 0.22]} />
        <meshStandardMaterial color="#ff8c69" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Plate */}
      <mesh position={[0, -size * 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.34, size * 0.04, 16]} />
        <meshStandardMaterial color="#f0efe8" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Camping ──────────────────────────────────────────────
export function Tent({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main tent body (triangular prism approximation) */}
      <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.7, size * 1.0, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} side={2} />
      </mesh>
      {/* Door opening */}
      <mesh position={[0, size * 0.2, size * 0.48]} castShadow>
        <coneGeometry args={[size * 0.25, size * 0.5, 3]} />
        <meshStandardMaterial color="#2a3340" roughness={0.6} />
      </mesh>
      {/* Ground sheet */}
      <mesh position={[0, -size * 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.72, size * 0.72, size * 0.03, 4]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Backpack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.5, size * 0.7, size * 0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Front pocket */}
      <mesh position={[0, -size * 0.1, size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.3, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Top handle */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Straps */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.12, -size * 0.1, -size * 0.14]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.5, 6]} />
          <meshStandardMaterial color="#8b6914" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function Compass({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 0.5
    if (ref.current) ref.current.rotation.y = Math.sin(phase.current) * 0.3
  })
  return (
    <group position={pos}>
      {/* Outer ring */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.38, size * 0.06, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.32, size * 0.08, 24]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.6} />
      </mesh>
      {/* Needle */}
      <group ref={ref}>
        <mesh position={[0, size * 0.05, size * 0.14]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.28, 4]} />
          <meshStandardMaterial color="#e53" roughness={0.4} />
        </mesh>
        <mesh position={[0, size * 0.05, -size * 0.14]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.28, 4]} />
          <meshStandardMaterial color="#ccc" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}
