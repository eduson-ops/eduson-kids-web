import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// === BATCH 37: Candy Land + Egyptian Pyramids ===
interface P37 { pos: [number,number,number]; color: string; size: number }

export function GiantLollipopB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.2) * 0.1
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size*0.4, 0]} castShadow>
        <sphereGeometry args={[size*0.42, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.08, size*0.95, 6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0, size*0.4, 0]} rotation={[0, i * 2.094, 0]}>
          <torusGeometry args={[size*0.28, size*0.04, 6, 20, Math.PI*0.5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function CandyCaneB37({ pos, color, size }: P37) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.08, size*1.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[size*0.12, size*0.72, 0]}>
        <torusGeometry args={[size*0.12, size*0.08, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {([0.3, 0.6, 0.9, 1.2] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size - size*0.3, 0]}>
          <torusGeometry args={[size*0.09, size*0.085, 6, 16, Math.PI*0.25]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function GingerbreadHouseB37({ pos, color, size }: P37) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.1, 0]} castShadow>
        <boxGeometry args={[size*0.85, size*0.55, size*0.65]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.32, 0]}>
        <boxGeometry args={[size*0.95, size*0.02, size*0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.28, 0]}>
        <coneGeometry args={[size*0.58, size*0.45, 4]} />
        <meshStandardMaterial color="#cc4400" roughness={0.7} />
      </mesh>
      <mesh position={[0, -size*0.12, size*0.34]}>
        <boxGeometry args={[size*0.28, size*0.42, size*0.06]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {([-0.28, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, -size*0.02, size*0.34]}>
          <sphereGeometry args={[size*0.07, 6, 5]} />
          <meshStandardMaterial color="#ff4488" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function GumdropB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.abs(Math.sin(clock.getElapsedTime() * 1.5)) * size * 0.12
  })
  return (
    <mesh ref={ref} position={pos} castShadow>
      <sphereGeometry args={[size*0.38, 10, 8, 0, Math.PI*2, 0, Math.PI*0.65]} />
      <meshStandardMaterial color={color} roughness={0.25} />
    </mesh>
  )
}

export function CottonCandyB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.5
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.2, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.6, 5]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.7} />
      </mesh>
      {([0, 1, 2, 3, 4] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i*1.257)*size*0.18,
          size*0.15 + Math.cos(i*0.8)*size*0.1,
          Math.cos(i*1.257)*size*0.18
        ]}>
          <sphereGeometry args={[size*0.22 - i*size*0.01, 7, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function ChocolateFountainB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime() * 2) * 0.05
  })
  return (
    <group position={pos}>
      {([0.55, 0.25, -0.08] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <cylinderGeometry args={[size*(0.45-i*0.12), size*(0.48-i*0.12), size*0.08, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.14, 0]}>
        <cylinderGeometry args={[size*0.55, size*0.55, size*0.12, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.72, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.25, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function PyramidB37({ pos, color, size }: P37) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[size*0.75, size*1.15, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.54, 0]}>
        <boxGeometry args={[size*1.55, size*0.08, size*1.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.52, 0]}>
        <sphereGeometry args={[size*0.06, 6, 5]} />
        <meshStandardMaterial color="#c8a000" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

export function SphinxB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.08
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.12, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.38, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.5, -size*0.06, 0]}>
        <sphereGeometry args={[size*0.26, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.5, size*0.08, 0]}>
        <boxGeometry args={[size*0.18, size*0.3, size*0.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[-size*0.45, -size*0.3, s*size*0.2]}>
          <boxGeometry args={[size*0.18, size*0.25, size*0.08]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ObeliskB37({ pos, color, size }: P37) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.24, size*1.8, size*0.24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.95, 0]}>
        <coneGeometry args={[size*0.14, size*0.26, 4]} />
        <meshStandardMaterial color="#c8a000" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.92, 0]}>
        <boxGeometry args={[size*0.38, size*0.08, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function EgyptianVaseB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.28, size*0.18, size*0.65, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, size*0.36, 0]}>
        <cylinderGeometry args={[size*0.14, size*0.28, size*0.14, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.45, 0]}>
        <cylinderGeometry args={[size*0.16, size*0.14, size*0.08, 10]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -size*0.35, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.1, size*0.16, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function AnubisStatueB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.15, 0]} castShadow>
        <boxGeometry args={[size*0.32, size*0.58, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.32, 0]}>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.44, size*0.08]}>
        <boxGeometry args={[size*0.08, size*0.28, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.06, size*0.52, 0]}>
          <coneGeometry args={[size*0.04, size*0.15, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.22, -size*0.15, 0]}>
          <boxGeometry args={[size*0.1, size*0.55, size*0.18]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function ScarabB37({ pos, color, size }: P37) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.7
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 2) * size * 0.05
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 10, 7]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.28, size*0.04, 0]} rotation={[0, 0, s * 0.4]}>
          <boxGeometry args={[size*0.28, size*0.05, size*0.2]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[(i<2 ? -1 : 1)*size*0.16, -size*0.12, (i%2*2-1)*size*0.12]}>
          <cylinderGeometry args={[size*0.02, size*0.02, size*0.22, 4]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function TombEntranceB37({ pos, color, size }: P37) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.05, 0]} castShadow>
        <boxGeometry args={[size*1.0, size*1.0, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.42, 0]}>
        <coneGeometry args={[size*0.52, size*0.28, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.05, size*0.13]}>
        <boxGeometry args={[size*0.38, size*0.68, size*0.04]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.38, size*0.06, 0]}>
          <cylinderGeometry args={[size*0.07, size*0.09, size*0.85, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// === BATCH 38: Pirate Cove + Fairy Tale Forest ===
interface P38 { pos: [number,number,number]; color: string; size: number }

export function PirateShipB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.06
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.2) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.8, size*0.32, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <boxGeometry args={[size*1.5, size*0.1, size*0.42]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.1, size*0.75, 0]}>
        <cylinderGeometry args={[size*0.05, size*0.05, size*1.1, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      <mesh position={[-size*0.1, size*0.82, -size*0.25]}>
        <boxGeometry args={[size*0.7, size*0.55, size*0.04]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[size*0.78, size*0.22, 0]}>
        <coneGeometry args={[size*0.07, size*0.28, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function TreasureChestB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.12
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.05, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.38, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.24, 0]}>
        <boxGeometry args={[size*0.68, size*0.22, size*0.48]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.22, size*0.26]}>
        <boxGeometry args={[size*0.25, size*0.12, size*0.05]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.7} />
      </mesh>
      {([-0.28, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.0, size*0.24]}>
          <boxGeometry args={[size*0.06, size*0.45, size*0.06]} />
          <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CannonB38({ pos, color, size }: P38) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[size*0.12, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[size*0.12, size*0.14, size*0.72, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[0, -size*0.24, s*size*0.22]}>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.28, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function AnchorB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.05, size*1.05, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, size*0.52, 0]}>
        <torusGeometry args={[size*0.16, size*0.04, 6, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, -size*0.52, 0]}>
        <torusGeometry args={[size*0.28, size*0.045, 6, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.28, -size*0.52, 0]}>
          <sphereGeometry args={[size*0.07, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SkullFlagB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2.5) * 0.08
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*1.6, 5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[size*0.24, size*0.62, 0]}>
        <boxGeometry args={[size*0.48, size*0.38, size*0.03]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[size*0.24, size*0.66, size*0.04]}>
        <sphereGeometry args={[size*0.1, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-0.07, 0.07] as number[]).map((x, i) => (
        <mesh key={i} position={[size*0.24 + x*size, size*0.6, size*0.04]}>
          <sphereGeometry args={[size*0.04, 5, 4]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function PirateBarrelB38({ pos, color, size }: P38) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.28, size*0.24, size*0.62, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-0.16, 0.16] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.3, size*0.035, 5, 14]} />
          <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function FairyMushroomB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.1, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.16, size*0.5, 8]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <sphereGeometry args={[size*0.45, 12, 8, 0, Math.PI*2, 0, Math.PI*0.58]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {([
        [0.18, 0.25, 0.22], [-0.18, 0.3, 0.18], [0.0, 0.18, -0.25],
        [0.22, 0.22, -0.12], [-0.22, 0.22, -0.08]
      ] as number[][]).map(([x = 0,y = 0,z = 0], i) => (
        <mesh key={i} position={[x*size, size*(0.22+y*0.3), z*size]}>
          <sphereGeometry args={[size*0.06, 5, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function FairyLanternB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4
    ref.current.rotation.y = clock.getElapsedTime() * 0.6
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.5, 5]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.06, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, 0, 0]}>
        <sphereGeometry args={[size*0.28, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.2} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, -size*0.28, 0]}>
        <sphereGeometry args={[size*0.08, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function EnchantedTreeB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.2, size*1.2, 7]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.82, 0]}>
        <sphereGeometry args={[size*0.6, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[size*0.3, size*0.55, 0]}>
        <sphereGeometry args={[size*0.38, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([0, 1, 2, 3, 4, 5] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.047) * size * 0.58,
          size * (0.65 + Math.cos(i * 0.8) * 0.2),
          Math.cos(i * 1.047) * size * 0.58
        ]}>
          <sphereGeometry args={[size*0.05, 4, 4]} />
          <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function FairyWingB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.8
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 3) * size * 0.06
  })
  return (
    <group ref={ref} position={pos}>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.3, 0, 0]} rotation={[0, 0, s * 0.3]}>
          <torusGeometry args={[size*0.28, size*0.04, 4, 16, Math.PI*1.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.2} transparent opacity={0.8} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.18, -size*0.2, 0]} rotation={[0, 0, s * 0.5]}>
          <torusGeometry args={[size*0.17, size*0.03, 4, 12, Math.PI*1.0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.2} transparent opacity={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size*0.07, 6, 5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function PixieDustB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 1.5
    ref.current.rotation.x = clock.getElapsedTime() * 0.8
  })
  return (
    <group ref={ref} position={pos}>
      {([0, 1, 2, 3, 4, 5, 6, 7] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 0.785) * size * (0.15 + (i%3)*0.08),
          Math.cos(i * 1.1) * size * 0.25,
          Math.cos(i * 0.785) * size * (0.15 + (i%3)*0.08)
        ]}>
          <tetrahedronGeometry args={[size*0.04, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function MagicWandB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.6
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*1.1, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.62, 0]}>
        <sphereGeometry args={[size*0.15, 8, 7]} />
        <meshStandardMaterial color="#ffee44" emissive="#ffee44" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {([0, 1, 2, 3, 4] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.257) * size * 0.22,
          size*0.62,
          Math.cos(i * 1.257) * size * 0.22
        ]}>
          <tetrahedronGeometry args={[size*0.05, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function StoryBookB38({ pos, color, size }: P38) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.62, size*0.8, size*0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[-size*0.34, 0, 0]}>
        <boxGeometry args={[size*0.07, size*0.84, size*0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, size*0.07]}>
        <boxGeometry args={[size*0.54, size*0.74, size*0.05]} />
        <meshStandardMaterial color="#f0ead0" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.15, size*0.08]}>
        <sphereGeometry args={[size*0.12, 6, 5]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// === BATCH 39: Dinosaur World + Music Studio ===
interface P39 { pos: [number,number,number]; color: string; size: number }

export function TRexB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    ref.current.position.y = pos[1] + Math.abs(Math.sin(clock.getElapsedTime() * 0.8)) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.75, size*0.48, size*0.42]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.52, size*0.24, 0]}>
        <sphereGeometry args={[size*0.32, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.82, size*0.2, 0]}>
        <boxGeometry args={[size*0.28, size*0.14, size*0.18]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.16, -size*0.36, size*0.18]}>
          <boxGeometry args={[size*0.18, size*0.48, size*0.16]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[-size*0.52, size*0.08, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[size*0.05, size*0.03, size*0.52, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size*0.38, size*0.18, s*size*0.1]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[size*0.06, size*0.22, size*0.06]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function TriceratopsB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.38, size*0.42]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.58, size*0.12, 0]}>
        <sphereGeometry args={[size*0.28, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.82, size*0.18, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.08, 14]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([
        [size*0.96, size*0.32, size*0.1],
        [size*0.96, size*0.32, -size*0.1],
        [size*1.06, size*0.22, 0],
      ] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[size*0.04, size*0.28, 6]} />
          <meshStandardMaterial color="#e8e0c0" roughness={0.5} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.2, -size*0.3, size*0.18]}>
          <boxGeometry args={[size*0.15, size*0.42, size*0.14]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function StegosaurusB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.35) * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.38, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.52, size*0.08, 0]}>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.52, 0, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[size*0.04, size*0.03, size*0.46, 5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {([-0.35, -0.1, 0.15, 0.38] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*(0.28 + (i%2)*0.08), 0]}>
          <boxGeometry args={[size*0.06, size*(0.22 + (i%2)*0.08), size*0.04]} />
          <meshStandardMaterial color="#cc4400" roughness={0.6} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.18, -size*0.3, size*0.16]}>
          <boxGeometry args={[size*0.14, size*0.38, size*0.12]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function DinoEggB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.06
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {([
        [0.22, 0.28, 0.1], [-0.2, 0.15, 0.2], [0.0, 0.32, -0.1],
        [0.25, 0.0, -0.15], [-0.18, 0.05, -0.2]
      ] as number[][]).map(([x = 0,y = 0,z = 0], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <sphereGeometry args={[size*0.05, 5, 4]} />
          <meshStandardMaterial color="#cc7722" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function PterodactylB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.6
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 2) * size * 0.1
    const wing = Math.sin(clock.getElapsedTime() * 4) * 0.3
    ref.current.children.forEach((c, i) => {
      if (i < 2) c.rotation.z = (i === 0 ? 1 : -1) * (0.5 + wing)
    })
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[size*0.25, 0, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[size*0.05, size*0.55, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size*0.25, 0, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[size*0.05, size*0.55, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.18, size*0.12]}>
        <sphereGeometry args={[size*0.12, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.24, size*0.38]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[size*0.05, size*0.06, size*0.26]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function GuitarB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.25, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.16, 0]}>
        <sphereGeometry args={[size*0.28, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.52, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.9, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.97, 0]}>
        <boxGeometry args={[size*0.12, size*0.16, size*0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {([-0.04, -0.01, 0.01, 0.04, 0.07] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.12, size*0.05]}>
          <cylinderGeometry args={[size*0.008, size*0.008, size*1.0, 4]} />
          <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -size*0.05, size*0.1]}>
        <torusGeometry args={[size*0.1, size*0.02, 5, 16]} />
        <meshStandardMaterial color="#555" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function DrumKitB39({ pos, color, size }: P39) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.12, 0]} castShadow>
        <cylinderGeometry args={[size*0.45, size*0.4, size*0.35, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.07, 0]}>
        <cylinderGeometry args={[size*0.46, size*0.46, size*0.04, 12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {([
        [-size*0.5, size*0.18, 0, size*0.22],
        [size*0.5, size*0.18, 0, size*0.22],
        [size*0.1, size*0.35, -size*0.3, size*0.16],
      ] as number[][]).map(([x = 0,y = 0,z = 0,r = 0], i) => (
        <group key={i} position={[x,y,z]}>
          <mesh>
            <cylinderGeometry args={[r, r*0.9, size*0.25, 10]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          <mesh position={[0, size*0.14, 0]}>
            <cylinderGeometry args={[r+size*0.01, r+size*0.01, size*0.03, 10]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function PianoB39({ pos, color: _color, size }: P39) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.4, size*0.45, size*0.5]} />
        <meshStandardMaterial color="#1a1008" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.32, size*0.12]}>
        <boxGeometry args={[size*1.4, size*0.22, size*0.28]} />
        <meshStandardMaterial color="#1a1008" roughness={0.5} />
      </mesh>
      {([-0.56, -0.36, -0.16, 0.04, 0.24, 0.44, 0.56] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.4, size*0.28]}>
          <boxGeometry args={[size*0.14, size*0.18, size*0.04]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
        </mesh>
      ))}
      {([-0.48, -0.28, 0.12, 0.32, 0.52] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.44, size*0.26]}>
          <boxGeometry args={[size*0.1, size*0.12, size*0.04]} />
          <meshStandardMaterial color="#111" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function MicrophoneB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + Math.abs(Math.sin(clock.getElapsedTime() * 3)) * 0.2
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.9, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.55, 0]}>
        <sphereGeometry args={[size*0.19, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} roughness={0.2} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -size*0.52, 0]}>
        <cylinderGeometry args={[size*0.16, size*0.04, size*0.12, 8]} />
        <meshStandardMaterial color="#444" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function VinylRecordB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 1.8 })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.5, size*0.5, size*0.04, 24]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.03, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.18, size*0.05, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.04, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.06, 6]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {([0.25, 0.35, 0.42] as number[]).map((r, i) => (
        <mesh key={i} position={[0, size*0.025, 0]}>
          <torusGeometry args={[r*size, size*0.005, 4, 24]} />
          <meshStandardMaterial color="#222" roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function SpeakerB39({ pos, color, size }: P39) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.scale.setScalar(1 + Math.abs(Math.sin(clock.getElapsedTime() * 4)) * 0.04)
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*1.0, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.15, size*0.24]}>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.04, 14]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      <mesh position={[0, -size*0.32, size*0.24]}>
        <cylinderGeometry args={[size*0.12, size*0.12, size*0.04, 12]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      <mesh position={[size*0.22, -size*0.38, size*0.24]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.04, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

// === BATCH 40: Sports + Halloween — crossing 1000 ===
interface P40 { pos: [number,number,number]; color: string; size: number }

export function SoccerBallB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.x = clock.getElapsedTime() * 1.5
    ref.current.rotation.z = clock.getElapsedTime() * 0.8
    ref.current.position.y = pos[1] + Math.abs(Math.sin(clock.getElapsedTime() * 2)) * size * 0.35
  })
  return (
    <mesh ref={ref} position={pos} castShadow>
      <sphereGeometry args={[size*0.4, 14, 10]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

export function TrophyB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.5
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <sphereGeometry args={[size*0.32, 10, 8, 0, Math.PI*2, 0, Math.PI*0.65]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.06, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.16, size*0.35, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.28, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.08, 10]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.32, size*0.28, 0]} rotation={[0, 0, s * 1.0]}>
          <torusGeometry args={[size*0.1, size*0.03, 5, 10, Math.PI*0.8]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.62, 0]}>
        <sphereGeometry args={[size*0.08, 6, 5]} />
        <meshStandardMaterial color="#ffee00" emissive="#ffee00" emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function BasketballHoopB40({ pos, color, size }: P40) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.08, size*1.9, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[size*0.28, size*0.8, 0]}>
        <boxGeometry args={[size*0.55, size*0.42, size*0.06]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      <mesh position={[size*0.28, size*0.62, 0]}>
        <torusGeometry args={[size*0.2, size*0.025, 6, 18]} />
        <meshStandardMaterial color="#ff6600" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function StartingBlockB40({ pos, color, size }: P40) {
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.1, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.12, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      {([-0.15, 0.15] as number[]).map((z, i) => (
        <mesh key={i} position={[-size*0.1, size*0.04, z*size]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[size*0.42, size*0.12, size*0.18]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function JackOLanternB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.04
    const intensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.4;
    (ref.current.children[1] as THREE.Mesh).traverse((o) => {
      if ((o as THREE.Mesh).material) {
        ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity = intensity
      }
    })
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.42, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <group>
        <mesh position={[0, size*0.15, size*0.38]}>
          <boxGeometry args={[size*0.12, size*0.08, size*0.04]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        {([-0.1, 0.1] as number[]).map((x, i) => (
          <mesh key={i} position={[x*size, size*0.08, size*0.4]}>
            <boxGeometry args={[size*0.06, size*0.06, size*0.04]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, size*0.42, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.18, 6]} />
        <meshStandardMaterial color="#228B22" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function GhostB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.2) * size * 0.12
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
    (ref.current.children[0] as THREE.Mesh & { material: THREE.MeshStandardMaterial }).material.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime() * 2) * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 10, 8, 0, Math.PI*2, 0, Math.PI*0.7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.5} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, -size*0.28, 0]}>
        <boxGeometry args={[size*0.76, size*0.22, size*0.01]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.85} />
      </mesh>
      {([-0.12, 0.12] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.06, size*0.35]}>
          <sphereGeometry args={[size*0.07, 5, 5]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function WitchHatB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.06
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.12, 0]}>
        <cylinderGeometry args={[size*0.6, size*0.6, size*0.1, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.32, 0]}>
        <coneGeometry args={[size*0.38, size*0.9, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, -size*0.06, 0]}>
        <torusGeometry args={[size*0.42, size*0.04, 5, 18]} />
        <meshStandardMaterial color="#553300" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function SpiderWebB40({ pos, color, size }: P40) {
  return (
    <group position={pos}>
      {([0.16, 0.3, 0.44] as number[]).map((r, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <torusGeometry args={[r*size, size*0.01, 4, 18]} />
          <meshStandardMaterial color={color} roughness={0.4} transparent opacity={0.7} />
        </mesh>
      ))}
      {([0, 1, 2, 3, 4, 5] as number[]).map((i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[0, 0, i * 0.524]}>
          <boxGeometry args={[size*0.9, size*0.01, size*0.01]} />
          <meshStandardMaterial color={color} roughness={0.4} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[size*0.1, -size*0.08, 0]}>
        <sphereGeometry args={[size*0.07, 6, 5]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CauldronB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.05, 0]} castShadow>
        <sphereGeometry args={[size*0.42, 12, 8, 0, Math.PI*2, 0, Math.PI*0.7]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -size*0.04, 0]}>
        <torusGeometry args={[size*0.43, size*0.04, 5, 18]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.04, 0]}>
        <cylinderGeometry args={[size*0.35, size*0.35, size*0.1, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} transparent opacity={0.8} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.38, -size*0.28, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.22, 5]} />
          <meshStandardMaterial color="#333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function BatB40({ pos, color, size }: P40) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.position.x = pos[0] + Math.sin(t * 1.5) * size * 0.4
    ref.current.position.y = pos[1] + Math.sin(t * 2.1) * size * 0.2
    ref.current.rotation.z = Math.sin(t * 1.5) * 0.2
    ref.current.children.forEach((c, i) => {
      c.rotation.y = (i === 0 ? 1 : -1) * (0.4 + Math.sin(t * 8) * 0.3)
    })
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[size*0.22, 0, 0]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[size*0.04, size*0.04, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size*0.22, 0, 0]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[size*0.04, size*0.04, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.14, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([-0.06, 0.06] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.1, size*0.1]}>
          <sphereGeometry args={[size*0.04, 5, 4]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// === BATCH 41: Final 10 — Ocean Life + Christmas ===
interface P41 { pos: [number,number,number]; color: string; size: number }

export function DolphinB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.6
    ref.current.position.y = pos[1] + Math.sin(t * 2) * size * 0.15
    ref.current.rotation.z = Math.sin(t * 2) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 10, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size*0.32, 0, 0]}>
        <sphereGeometry args={[size*0.18, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size*0.48, 0, 0]}>
        <boxGeometry args={[size*0.08, size*0.04, size*0.14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.32, 0, 0]}>
        <boxGeometry args={[size*0.12, size*0.02, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.26, 0]}>
        <boxGeometry args={[size*0.06, size*0.2, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function ClownFishB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.9
    ref.current.position.y = pos[1] + Math.sin(t * 2.5) * size * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-0.12, 0, 0.12] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, 0, size*0.18]}>
          <boxGeometry args={[size*0.03, size*0.3, size*0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0, -size*0.22]}>
        <boxGeometry args={[size*0.06, size*0.2, size*0.02]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function SeaHorseB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.5
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.08
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.2, 0]}>
        <sphereGeometry args={[size*0.18, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size*0.06, size*0.02, 0]}>
        <sphereGeometry args={[size*0.14, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size*0.08, -size*0.14, 0]}>
        <sphereGeometry args={[size*0.11, 7, 5]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size*0.04, -size*0.28, 0]}>
        <torusGeometry args={[size*0.1, size*0.03, 5, 10, Math.PI*1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[-size*0.06, size*0.28, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[size*0.22, size*0.05, size*0.03]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function ChristmasTreeB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.children.forEach((c, i) => {
      if (i > 2) {
        (c as THREE.Mesh).traverse((o) => {
          if ((o as THREE.Mesh).material) {
            ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(t * 2 + i * 0.8) * 0.5
          }
        })
      }
    })
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.65, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.25, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, -size*0.25, 0]}>
        <coneGeometry args={[size*0.6, size*0.65, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.18, 0]}>
        <coneGeometry args={[size*0.42, size*0.52, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.56, 0]}>
        <coneGeometry args={[size*0.24, size*0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.78, 0]}>
        <sphereGeometry args={[size*0.08, 6, 5]} />
        <meshStandardMaterial color="#ffee00" emissive="#ffee00" emissiveIntensity={0.9} roughness={0.2} />
      </mesh>
      {([0, 1, 2, 3, 4, 5, 6] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i*0.898)*size*(0.2 + (i%3)*0.1),
          (i*0.18 - 0.5)*size,
          Math.cos(i*0.898)*size*(0.2 + (i%3)*0.1)
        ]}>
          <sphereGeometry args={[size*0.05, 5, 4]} />
          <meshStandardMaterial color={['#ff0000','#ffee00','#4444ff','#ff8800'][i%4]!} emissive={['#ff0000','#ffee00','#4444ff','#ff8800'][i%4]!} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function SnowmanB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.28, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.15, 0]}>
        <sphereGeometry args={[size*0.28, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.46, 0]}>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.5, size*0.18]}>
        <coneGeometry args={[size*0.04, size*0.18, 6]} />
        <meshStandardMaterial color="#ff6600" roughness={0.6} />
      </mesh>
      {([-0.08, 0.08] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.5, size*0.18]}>
          <sphereGeometry args={[size*0.03, 5, 4]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.18, size*0.04, 8]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.74, 0]}>
        <cylinderGeometry args={[size*0.14, size*0.14, size*0.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.3, size*0.14, 0]} rotation={[0, 0, s * 0.5]}>
          <cylinderGeometry args={[size*0.025, size*0.02, size*0.38, 5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function GiftBoxB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.8) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.55, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.3, 0]}>
        <boxGeometry args={[size*0.64, size*0.12, size*0.64]} />
        <meshStandardMaterial color="#aa0000" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.0, 0]}>
        <boxGeometry args={[size*0.06, size*0.56, size*0.64]} />
        <meshStandardMaterial color="#aa0000" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.0, 0]}>
        <boxGeometry args={[size*0.64, size*0.56, size*0.06]} />
        <meshStandardMaterial color="#aa0000" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.4, 0]}>
        <torusGeometry args={[size*0.1, size*0.03, 5, 12]} />
        <meshStandardMaterial color="#ffee00" roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function ReindeerB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
    ref.current.position.y = pos[1] + Math.abs(Math.sin(clock.getElapsedTime() * 1.2)) * size * 0.06
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.32, size*0.28]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.38, size*0.12, 0]}>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.5, size*0.08, 0]}>
        <sphereGeometry args={[size*0.09, 6, 5]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={0.7} roughness={0.4} />
      </mesh>
      {([[-0.2, 0.26, 0.1], [0.2, 0.26, 0.1]] as [number,number,number][]).map(([x,y,z], i) => (
        <group key={i} position={[x*size, y*size, z*size]}>
          <mesh rotation={[0, 0, i === 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[size*0.02, size*0.025, size*0.35, 5]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[i===0?-size*0.12:size*0.12, size*0.18, 0]}>
            <cylinderGeometry args={[size*0.015, size*0.02, size*0.22, 4]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {([-0.2, 0, 0.2, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size - size*0.1, -size*0.26, (i%2*2-1)*size*0.1]}>
          <boxGeometry args={[size*0.1, size*0.38, size*0.08]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function SantaHatB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.5
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.2) * size * 0.05
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.06, 0]}>
        <cylinderGeometry args={[size*0.52, size*0.52, size*0.18, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.35, 0]}>
        <coneGeometry args={[size*0.44, size*0.88, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size*0.15, size*0.82, 0]}>
        <sphereGeometry args={[size*0.1, 7, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function BellB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 3) * 0.25
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.34, 10, 8, 0, Math.PI*2, 0, Math.PI*0.7]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.18, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.12, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.26, 0]}>
        <torusGeometry args={[size*0.06, size*0.02, 5, 10]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, -size*0.18, 0]}>
        <sphereGeometry args={[size*0.07, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function CandleB41({ pos, color, size }: P41) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 6 + Math.random() * 0.1) * 0.4
  })
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.1, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.12, size*0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.28, 0]}>
        <cylinderGeometry args={[size*0.015, size*0.015, size*0.16, 4]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.38, 0]}>
        <coneGeometry args={[size*0.06, size*0.14, 6]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -size*0.48, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.18, size*0.06, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}