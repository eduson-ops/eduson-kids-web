import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Batch 11: Space Station ──────────────────────────────────────────────────
interface P11 { pos: [number,number,number]; color: string; size: number }

export function LaunchSilo({ pos, size }: P11) {
  return (
    <group position={pos}>
      {/* outer silo wall */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.42, size * 0.45, size * 1.1, 12, 1, true]} />
        <meshStandardMaterial color="#778899" roughness={0.7} side={2} />
      </mesh>
      {/* inner floor */}
      <mesh position={[0, -size * 0.54, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.42, size * 0.04, 12]} />
        <meshStandardMaterial color="#556677" roughness={0.8} />
      </mesh>
      {/* blast deflector */}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 4) * Math.PI * 2) * size * 0.3,
          -size * 0.5,
          Math.sin((i / 4) * Math.PI * 2) * size * 0.3,
        ]} rotation={[0, (i / 4) * Math.PI * 2, -0.4]}>
          <boxGeometry args={[size * 0.08, size * 0.12, size * 0.18]} />
          <meshStandardMaterial color="#445566" roughness={0.8} />
        </mesh>
      ))}
      {/* rim */}
      <mesh position={[0, size * 0.55, 0]}>
        <torusGeometry args={[size * 0.43, size * 0.04, 6, 16]} />
        <meshStandardMaterial color="#99aabb" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function SpaceCapsule({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* heat shield base */}
      <mesh position={[0, size * 0.08, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.42, size * 0.12, 10]} />
        <meshStandardMaterial color="#443322" roughness={0.9} />
      </mesh>
      {/* main body */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.38, size * 0.5, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0, size * 0.72, 0]}>
        <coneGeometry args={[size * 0.3, size * 0.28, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* window */}
      <mesh position={[0, size * 0.42, size * 0.29]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.04, 12]} />
        <meshStandardMaterial color="#88ddff" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* parachute lines */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 3) * Math.PI * 2) * size * 0.12,
          size * 0.85,
          Math.sin((i / 3) * Math.PI * 2) * size * 0.12,
        ]} rotation={[0.3, (i / 3) * Math.PI * 2, 0]}>
          <cylinderGeometry args={[size * 0.008, size * 0.008, size * 0.25, 3]} />
          <meshStandardMaterial color="#dddddd" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function MoonCrater({ pos, size }: P11) {
  return (
    <group position={pos}>
      {/* crater rim ring */}
      <mesh position={[0, size * 0.05, 0]}>
        <torusGeometry args={[size * 0.46, size * 0.1, 5, 20]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.95} />
      </mesh>
      {/* crater floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.38, 16]} />
        <meshStandardMaterial color="#999999" roughness={0.95} />
      </mesh>
      {/* small rocks around rim */}
      {([0, 1, 2, 3, 4, 5] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 6) * Math.PI * 2) * size * 0.42,
          size * 0.05 + (i % 2) * size * 0.04,
          Math.sin((i / 6) * Math.PI * 2) * size * 0.42,
        ]}>
          <dodecahedronGeometry args={[size * 0.06 + (i % 3) * 0.02 * size, 0]} />
          <meshStandardMaterial color="#b0b0b0" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function IonThruster({ pos, color, size }: P11) {
  const glow = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 3
    if (glow.current) {
      glow.current.scale.y = 0.8 + Math.sin(t.current) * 0.25
      ;(glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(t.current * 1.3) * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* thruster body */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.34, size * 0.5, 10]} />
        <meshStandardMaterial color="#334466" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, -size * 0.32, 0]}>
        <cylinderGeometry args={[size * 0.36, size * 0.28, size * 0.14, 10]} />
        <meshStandardMaterial color="#223355" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* ion glow */}
      <mesh ref={glow} position={[0, -size * 0.54, 0]}>
        <cylinderGeometry args={[size * 0.22, size * 0.08, size * 0.35, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      {/* mounting bracket */}
      {([0, 1] as number[]).map((i) => (
        <mesh key={i} position={[(i === 0 ? -1 : 1) * size * 0.28, size * 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.18, 6]} />
          <meshStandardMaterial color="#445577" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function AstroLab({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* base module */}
      <mesh position={[0, size * 0.15, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.3, size * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* dome top */}
      <mesh position={[0, size * 0.38, 0]}>
        <sphereGeometry args={[size * 0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88ccee" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* antenna */}
      <mesh position={[0, size * 0.68, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.35, 4]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.86, 0]}>
        <sphereGeometry args={[size * 0.05, 8, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1} />
      </mesh>
      {/* legs */}
      {([[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, -size * 0.02, size * z]} rotation={[0.15, 0, x > 0 ? 0.15 : -0.15]}>
          <cylinderGeometry args={[size * 0.03, size * 0.04, size * 0.2, 5]} />
          <meshStandardMaterial color="#556677" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SolarCollector({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* central mast */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.8, 6]} />
        <meshStandardMaterial color="#bbbbcc" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* left wing */}
      <mesh position={[-size * 0.6, size * 0.3, 0]}>
        <boxGeometry args={[size * 1.0, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* right wing */}
      <mesh position={[size * 0.6, size * 0.3, 0]}>
        <boxGeometry args={[size * 1.0, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* panel grid lines */}
      {([-0.9, -0.3, 0.3, 0.9] as number[]).map((xOff, i) => (
        <mesh key={i} position={[size * xOff, size * 0.3, size * 0.022]}>
          <boxGeometry args={[size * 0.02, size * 0.53, size * 0.01]} />
          <meshStandardMaterial color="#224466" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SpaceBeacon({ pos, color, size }: P11) {
  const light = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 2
    if (light.current) {
      ;(light.current.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.abs(Math.sin(t.current)) * 3
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.06, 0]}>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.12, 8]} />
        <meshStandardMaterial color="#556677" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* pole */}
      <mesh position={[0, size * 0.38, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.6, 6]} />
        <meshStandardMaterial color="#778899" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* beacon head */}
      <mesh ref={light} position={[0, size * 0.76, 0]}>
        <sphereGeometry args={[size * 0.14, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* rings */}
      {([0, 1] as number[]).map((i) => (
        <mesh key={i} position={[0, size * (0.58 + i * 0.06), 0]}>
          <torusGeometry args={[size * 0.1, size * 0.02, 4, 10]} />
          <meshStandardMaterial color="#99aabb" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function OxygenTank({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* main cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.72, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size * 0.4, 0]}>
        <sphereGeometry args={[size * 0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* bottom cap */}
      <mesh position={[0, -size * 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[size * 0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* valve */}
      <mesh position={[0, size * 0.56, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.1, 6]} />
        <meshStandardMaterial color="#334455" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* pressure band */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[size * 0.225, size * 0.03, 4, 14]} />
        <meshStandardMaterial color="#334455" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function HullPanel({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* main panel */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.9, size * 0.7, size * 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* reinforcement ribs */}
      {([-0.28, 0, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, 0, size * 0.05]}>
          <boxGeometry args={[size * 0.06, size * 0.68, size * 0.03]} />
          <meshStandardMaterial color="#aabbcc" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* bolts */}
      {([[-0.38, 0.3], [0.38, 0.3], [-0.38, -0.3], [0.38, -0.3]] as [number,number][]).map(([x, y], i) => (
        <mesh key={i} position={[size * x, size * y, size * 0.045]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.06, 6]} />
          <meshStandardMaterial color="#99aacc" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
      {/* status light */}
      <mesh position={[size * 0.36, -size * 0.28, size * 0.05]}>
        <sphereGeometry args={[size * 0.04, 6, 4]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

export function SpaceBuggy({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* chassis */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.18, size * 0.45]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* cab */}
      <mesh position={[-size * 0.1, size * 0.36, 0]}>
        <boxGeometry args={[size * 0.38, size * 0.24, size * 0.38]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.1, size * 0.38, 0]}>
        <boxGeometry args={[size * 0.06, size * 0.18, size * 0.34]} />
        <meshStandardMaterial color="#aaddff" roughness={0.1} metalness={0.2} transparent opacity={0.6} />
      </mesh>
      {/* wheels */}
      {([[-0.28, 0.18], [0.28, 0.18], [-0.28, -0.18], [0.28, -0.18]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.1, size * z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.1, 10]} />
          <meshStandardMaterial color="#222233" roughness={0.9} />
        </mesh>
      ))}
      {/* antenna */}
      <mesh position={[-size * 0.22, size * 0.56, size * 0.12]}>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.28, 4]} />
        <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Batch 11: Prehistoric ────────────────────────────────────────────────────

export function CavePainting({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* rock slab */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.85, size * 0.7, size * 0.18]} />
        <meshStandardMaterial color="#9a8070" roughness={0.95} />
      </mesh>
      {/* painted area */}
      <mesh position={[0, 0, size * 0.092]}>
        <boxGeometry args={[size * 0.68, size * 0.54, size * 0.01]} />
        <meshStandardMaterial color="#8a6050" roughness={0.9} />
      </mesh>
      {/* animal silhouette (boxes) */}
      <mesh position={[-size * 0.1, size * 0.05, size * 0.1]}>
        <boxGeometry args={[size * 0.28, size * 0.18, size * 0.01]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* legs */}
      {([-0.06, 0.06] as number[]).map((x, i) => (
        <mesh key={i} position={[size * (x - 0.1), -size * 0.05, size * 0.1]}>
          <boxGeometry args={[size * 0.04, size * 0.1, size * 0.01]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* head */}
      <mesh position={[size * 0.06, size * 0.1, size * 0.1]}>
        <boxGeometry args={[size * 0.08, size * 0.08, size * 0.01]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Mammoth({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.32, 0]} castShadow>
        <sphereGeometry args={[size * 0.32, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[size * 0.24, size * 0.5, 0]}>
        <sphereGeometry args={[size * 0.18, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* trunk */}
      <mesh position={[size * 0.38, size * 0.36, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[size * 0.05, size * 0.04, size * 0.28, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* tusks */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * 0.3, size * 0.44, size * s * 0.1]} rotation={[s * 0.3, 0, 0.5]}>
          <cylinderGeometry args={[size * 0.025, size * 0.01, size * 0.3, 5]} />
          <meshStandardMaterial color="#fffff0" roughness={0.4} />
        </mesh>
      ))}
      {/* legs */}
      {([[-0.15, 0.15], [0.15, 0.15], [-0.15, -0.15], [0.15, -0.15]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.08, size * z]}>
          <cylinderGeometry args={[size * 0.075, size * 0.07, size * 0.28, 7]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* ear */}
      <mesh position={[size * 0.16, size * 0.56, size * 0.18]}>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function DinoTrack({ pos, size }: P11) {
  return (
    <group position={pos}>
      {/* three-toed footprint as flat ellipses */}
      {/* center depression */}
      <mesh position={[0, size * 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.32, 12]} />
        <meshStandardMaterial color="#7a7060" roughness={0.95} />
      </mesh>
      {/* toes */}
      {([[-0.2, 0.32, 0.4], [0, 0.36, 0], [0.2, 0.32, -0.4]] as [number,number,number][]).map(([x, z, rot], i) => (
        <mesh key={i} position={[size * x, size * 0.015, size * z]} rotation={[0, rot, 0]}>
          <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.03, 7]} />
          <meshStandardMaterial color="#7a7060" roughness={0.95} />
        </mesh>
      ))}
      {/* rim */}
      <mesh position={[0, size * 0.02, 0]}>
        <torusGeometry args={[size * 0.33, size * 0.06, 4, 14]} />
        <meshStandardMaterial color="#6a6050" roughness={0.95} />
      </mesh>
    </group>
  )
}

export function BonePile({ pos, size }: P11) {
  const boneColor = '#e8ddc0'
  return (
    <group position={pos}>
      {/* large bone */}
      <mesh position={[0, size * 0.06, 0]} rotation={[0, 0.4, 0.15]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.55, 6]} />
        <meshStandardMaterial color={boneColor} roughness={0.6} />
      </mesh>
      <mesh position={[-size * 0.22, size * 0.1, 0]} rotation={[0, 0, 0.15]}>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color={boneColor} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.22, size * 0.08, 0]} rotation={[0, 0, 0.15]}>
        <sphereGeometry args={[size * 0.09, 8, 6]} />
        <meshStandardMaterial color={boneColor} roughness={0.6} />
      </mesh>
      {/* small bones */}
      {([[-0.12, 0.04, 0.18, 0.9], [0.1, 0.04, -0.15, -0.5], [-0.2, 0.03, -0.1, 1.2]] as [number,number,number,number][]).map(([x, y, z, r], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} rotation={[0.2, r, 0.1]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.22, 5]} />
          <meshStandardMaterial color={boneColor} roughness={0.6} />
        </mesh>
      ))}
      {/* skull hint */}
      <mesh position={[size * 0.05, size * 0.14, size * 0.18]} rotation={[0.3, 0.5, 0]}>
        <dodecahedronGeometry args={[size * 0.1, 0]} />
        <meshStandardMaterial color={boneColor} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function FlintClub({ pos, color, size }: P11) {
  return (
    <group position={pos} rotation={[0, 0, -0.3]}>
      {/* handle */}
      <mesh position={[0, -size * 0.15, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.6, 6]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.9} />
      </mesh>
      {/* binding wrap */}
      {([0.04, 0.1, 0.16] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, 0]}>
          <torusGeometry args={[size * 0.1, size * 0.025, 4, 8]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      {/* stone head */}
      <mesh position={[0, size * 0.32, 0]} rotation={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[size * 0.22, 0]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  )
}

export function StoneHut({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.42, size * 0.45, size * 0.44, 8, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.95} side={2} />
      </mesh>
      {/* floor */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.04, 8]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
      </mesh>
      {/* thatched roof */}
      <mesh position={[0, size * 0.55, 0]}>
        <coneGeometry args={[size * 0.48, size * 0.38, 8]} />
        <meshStandardMaterial color="#a08040" roughness={0.9} />
      </mesh>
      {/* doorway */}
      <mesh position={[size * 0.38, size * 0.16, 0]}>
        <boxGeometry args={[size * 0.08, size * 0.28, size * 0.2]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
      </mesh>
      {/* stone details */}
      {([0, 1, 2, 3, 4] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 5) * Math.PI * 2) * size * 0.44,
          size * (0.08 + (i % 2) * 0.2),
          Math.sin((i / 5) * Math.PI * 2) * size * 0.44,
        ]}>
          <boxGeometry args={[size * 0.16, size * 0.1, size * 0.08]} />
          <meshStandardMaterial color="#b0a090" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function FirePit2({ pos, size }: P11) {
  const flame = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 5
    if (flame.current) {
      flame.current.scale.y = 0.85 + Math.sin(t.current) * 0.2
      flame.current.rotation.y += dt * 1.5
    }
  })
  return (
    <group position={pos}>
      {/* stone ring */}
      {([0, 1, 2, 3, 4, 5, 6, 7] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 8) * Math.PI * 2) * size * 0.3,
          size * 0.07,
          Math.sin((i / 8) * Math.PI * 2) * size * 0.3,
        ]}>
          <dodecahedronGeometry args={[size * 0.09, 0]} />
          <meshStandardMaterial color="#888070" roughness={0.95} />
        </mesh>
      ))}
      {/* logs */}
      {([0, 1] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.06, 0]} rotation={[0, i * Math.PI / 2, 0.15]}>
          <cylinderGeometry args={[size * 0.05, size * 0.06, size * 0.5, 6]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      {/* flames */}
      <group ref={flame} position={[0, size * 0.18, 0]}>
        <mesh>
          <coneGeometry args={[size * 0.14, size * 0.32, 5]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={1.5} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, size * 0.12, 0]}>
          <coneGeometry args={[size * 0.07, size * 0.2, 4]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export function SabreTooth({ pos, color, size }: P11) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* neck */}
      <mesh position={[size * 0.2, size * 0.42, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* head */}
      <mesh position={[size * 0.38, size * 0.48, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.18, size * 0.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* sabres */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * 0.42, size * 0.37, size * s * 0.06]} rotation={[s * 0.1, 0, -0.2]}>
          <cylinderGeometry args={[size * 0.02, size * 0.005, size * 0.22, 4]} />
          <meshStandardMaterial color="#fffff0" roughness={0.3} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[-size * 0.3, size * 0.3, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[size * 0.04, size * 0.02, size * 0.28, 5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* legs */}
      {([[-0.12, 0.2], [0.12, 0.2], [-0.12, -0.2], [0.12, -0.2]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.08, size * z]}>
          <cylinderGeometry args={[size * 0.06, size * 0.055, size * 0.24, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function TarPit({ pos, size }: P11) {
  const surface = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.6
    if (surface.current) {
      surface.current.rotation.y += dt * 0.1
    }
  })
  return (
    <group position={pos}>
      {/* pit depression */}
      <mesh position={[0, -size * 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.52, 16]} />
        <meshStandardMaterial color="#221100" roughness={0.95} />
      </mesh>
      {/* tar surface with bubbles */}
      <mesh ref={surface} position={[0, -size * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.48, 14]} />
        <meshStandardMaterial color="#1a0e00" roughness={0.6} metalness={0.3} transparent opacity={0.92} />
      </mesh>
      {/* bubble domes */}
      {([[-0.18, 0.12], [0.22, -0.1], [0, 0.2], [-0.08, -0.18]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, 0, size * z]}>
          <sphereGeometry args={[size * (0.04 + i * 0.01), 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#111100" roughness={0.5} metalness={0.4} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* rim soil */}
      <mesh position={[0, -size * 0.04, 0]}>
        <torusGeometry args={[size * 0.52, size * 0.1, 4, 16]} />
        <meshStandardMaterial color="#443322" roughness={0.95} />
      </mesh>
    </group>
  )
}

export function AmberGem({ pos, color, size }: P11) {
  const gem = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (gem.current) gem.current.rotation.y += dt * 0.5
  })
  return (
    <group position={pos}>
      {/* amber chunk */}
      <mesh ref={gem} position={[0, size * 0.22, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.28, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.15} metalness={0.1} transparent opacity={0.82} />
      </mesh>
      {/* inner inclusion (insect) */}
      <mesh position={[size * 0.04, size * 0.24, size * 0.04]}>
        <sphereGeometry args={[size * 0.04, 6, 4]} />
        <meshStandardMaterial color="#222200" roughness={0.8} />
      </mesh>
      {/* base rock */}
      <mesh position={[0, size * 0.06, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.24, size * 0.1, 7]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Batch 12: Enchanted Village ─────────────────────────────────────────────
interface P12 { pos: [number,number,number]; color: string; size: number }

export function MagicWell({ pos, color, size }: P12) {
  const glow = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 2
    if (glow.current) {
      ;(glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t.current) * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* stone base */}
      <mesh position={[0, size * 0.14, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.38, size * 0.28, 10]} />
        <meshStandardMaterial color="#888880" roughness={0.9} />
      </mesh>
      {/* inner well */}
      <mesh position={[0, size * 0.28, 0]}>
        <cylinderGeometry args={[size * 0.24, size * 0.24, size * 0.06, 10, 1, true]} />
        <meshStandardMaterial color="#777770" roughness={0.9} side={2} />
      </mesh>
      {/* glowing water surface */}
      <mesh ref={glow} position={[0, size * 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.22, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.75} />
      </mesh>
      {/* roof posts */}
      {([[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.62, size * z]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.68, 5]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* roof ridge */}
      <mesh position={[0, size * 1.0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* roof panels */}
      {([0, 1] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.9, 0]} rotation={[i === 0 ? 0.5 : -0.5, 0, 0]}>
          <boxGeometry args={[size * 0.72, size * 0.04, size * 0.5]} />
          <meshStandardMaterial color="#a06020" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function EnchantedGate({ pos, color, size }: P12) {
  const runes = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.5
    if (runes.current) {
      runes.current.children.forEach((c, i) => {
        ;((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.8 + Math.sin(t.current + i * 0.8) * 0.5
      })
    }
  })
  return (
    <group position={pos}>
      {/* left pillar */}
      <mesh position={[-size * 0.38, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 1.1, size * 0.18]} />
        <meshStandardMaterial color="#556677" roughness={0.7} />
      </mesh>
      {/* right pillar */}
      <mesh position={[size * 0.38, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 1.1, size * 0.18]} />
        <meshStandardMaterial color="#556677" roughness={0.7} />
      </mesh>
      {/* arch */}
      <mesh position={[0, size * 1.1, 0]}>
        <torusGeometry args={[size * 0.38, size * 0.09, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#556677" roughness={0.7} />
      </mesh>
      {/* runes */}
      <group ref={runes}>
        {([[-0.38, 0.3], [-0.38, 0.65], [0.38, 0.3], [0.38, 0.65]] as [number,number][]).map(([x, y], i) => (
          <mesh key={i} position={[size * x, size * y, size * 0.1]}>
            <boxGeometry args={[size * 0.06, size * 0.06, size * 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
      {/* gate bars */}
      {([-0.22, -0.07, 0.07, 0.22] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.5, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 1.0, 4]} />
          <meshStandardMaterial color="#334455" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function PixieLamp({ pos, color, size }: P12) {
  const glow = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 3
    if (glow.current) {
      glow.current.scale.setScalar(0.9 + Math.sin(t.current) * 0.12)
      ;(glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t.current * 1.7) * 0.6
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.025, size * 0.03, size * 0.7, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* hook arm */}
      <mesh position={[size * 0.12, size * 0.72, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[size * 0.018, size * 0.018, size * 0.22, 4]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* lantern body */}
      <mesh position={[size * 0.2, size * 0.62, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.22, size * 0.18]} />
        <meshStandardMaterial color="#554422" roughness={0.6} transparent opacity={0.5} />
      </mesh>
      {/* pixie glow */}
      <mesh ref={glow} position={[size * 0.2, size * 0.62, 0]}>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function SpellScroll({ pos, color, size }: P12) {
  return (
    <group position={pos} rotation={[0.1, 0, 0]}>
      {/* main scroll body */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.44, 8]} />
        <meshStandardMaterial color="#ddcc88" roughness={0.7} />
      </mesh>
      {/* top rod */}
      <mesh position={[0, size * 0.48, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.6, 6]} />
        <meshStandardMaterial color="#8b4a10" roughness={0.6} />
      </mesh>
      {/* top rod caps */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * s * 0.28, size * 0.48, 0]}>
          <sphereGeometry args={[size * 0.06, 6, 4]} />
          <meshStandardMaterial color="#aa6620" roughness={0.5} />
        </mesh>
      ))}
      {/* bottom rod */}
      <mesh position={[0, -size * 0.04, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.6, 6]} />
        <meshStandardMaterial color="#8b4a10" roughness={0.6} />
      </mesh>
      {/* text lines on scroll */}
      {([0.12, 0.04, -0.04, -0.12] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * (0.22 + y), size * 0.29]}>
          <boxGeometry args={[size * 0.36, size * 0.025, size * 0.01]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CrystalBallStand({ pos, color, size }: P12) {
  const ball = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.2
    if (ball.current) {
      ;(ball.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(t.current) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.07, 0]}>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.14, 10]} />
        <meshStandardMaterial color="#443322" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* stem */}
      <mesh position={[0, size * 0.22, 0]}>
        <cylinderGeometry args={[size * 0.05, size * 0.1, size * 0.16, 8]} />
        <meshStandardMaterial color="#554433" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* crystal ball */}
      <mesh ref={ball} position={[0, size * 0.46, 0]}>
        <sphereGeometry args={[size * 0.26, 14, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.05} metalness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* claw brackets */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 3) * Math.PI * 2) * size * 0.18,
          size * 0.28,
          Math.sin((i / 3) * Math.PI * 2) * size * 0.18,
        ]} rotation={[0, (i / 3) * Math.PI * 2, 0.5]}>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.22, 4]} />
          <meshStandardMaterial color="#665544" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function MushroomHouse({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* stem/walls */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.56, 10]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.8} />
      </mesh>
      {/* door */}
      <mesh position={[size * 0.28, size * 0.2, 0]}>
        <boxGeometry args={[size * 0.07, size * 0.22, size * 0.15]} />
        <meshStandardMaterial color="#8b4a10" roughness={0.7} />
      </mesh>
      {/* windows */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * 0.22, size * 0.38, size * s * 0.16]}>
          <boxGeometry args={[size * 0.07, size * 0.1, size * 0.1]} />
          <meshStandardMaterial color="#aaddff" roughness={0.1} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* cap */}
      <mesh position={[0, size * 0.7, 0]}>
        <sphereGeometry args={[size * 0.52, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* spots */}
      {([[-0.15, 0.08, -0.3], [0.2, 0.06, 0], [-0.05, 0.08, 0.3], [0.18, 0.07, -0.22]] as [number,number,number][]).map(([x, y, z], i) => (
        <mesh key={i} position={[size * x, size * (0.72 + y), size * z]}>
          <sphereGeometry args={[size * 0.06, 6, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function FairyFountain({ pos, color, size }: P12) {
  const water = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 2
    if (water.current) {
      ;(water.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + Math.sin(t.current) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* basin */}
      <mesh position={[0, size * 0.1, 0]}>
        <cylinderGeometry args={[size * 0.46, size * 0.5, size * 0.2, 12]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* inner basin water */}
      <mesh ref={water} position={[0, size * 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.4, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.7} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, size * 0.34, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.28, 8]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* top cup */}
      <mesh position={[0, size * 0.54, 0]}>
        <cylinderGeometry args={[size * 0.22, size * 0.16, size * 0.12, 10]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* fairy orbs */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 3) * Math.PI * 2) * size * 0.28,
          size * 0.6 + Math.sin(i) * size * 0.05,
          Math.sin((i / 3) * Math.PI * 2) * size * 0.28,
        ]}>
          <sphereGeometry args={[size * 0.05, 6, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function GlowingTree({ pos, color, size }: P12) {
  const leaves = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.5
    if (leaves.current) {
      leaves.current.children.forEach((c, i) => {
        ;((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.6 + Math.sin(t.current + i * 0.6) * 0.35
      })
    }
  })
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.09, size * 0.13, size * 0.6, 7]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.9} />
      </mesh>
      {/* leaf clusters */}
      <group ref={leaves}>
        <mesh position={[0, size * 0.78, 0]}>
          <sphereGeometry args={[size * 0.32, 8, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.8} transparent opacity={0.9} />
        </mesh>
        <mesh position={[size * 0.18, size * 0.68, size * 0.1]}>
          <sphereGeometry args={[size * 0.22, 7, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.8} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-size * 0.2, size * 0.72, -size * 0.08]}>
          <sphereGeometry args={[size * 0.2, 7, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.8} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* firefly dots */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos(i * 2.1) * size * 0.44,
          size * (0.5 + i * 0.15),
          Math.sin(i * 2.1) * size * 0.44,
        ]}>
          <sphereGeometry args={[size * 0.03, 4, 3]} />
          <meshStandardMaterial color="#ffff88" emissive="#ffff88" emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  )
}

export function PotionRack({ pos, size }: P12) {
  const potionColors = ['#ff4488', '#44ff88', '#4488ff', '#ffcc00', '#ff6600']
  return (
    <group position={pos}>
      {/* shelf back */}
      <mesh position={[0, size * 0.35, -size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.78, size * 0.7, size * 0.06]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.8} />
      </mesh>
      {/* shelves */}
      {([0.12, 0.38, 0.64] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, 0]}>
          <boxGeometry args={[size * 0.78, size * 0.05, size * 0.2]} />
          <meshStandardMaterial color="#6a4a2a" roughness={0.7} />
        </mesh>
      ))}
      {/* potions */}
      {potionColors.map((col, i) => {
        const shelf = Math.floor(i / 2)
        const xOff = (i % 2 === 0 ? -1 : 1) * size * 0.22
        const y = [0.2, 0.46, 0.7][shelf] ?? 0.2
        return (
          <group key={i}>
            <mesh position={[xOff, size * y, 0]}>
              <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.16, 8]} />
              <meshStandardMaterial color={col} roughness={0.2} metalness={0.1} transparent opacity={0.8} />
            </mesh>
            <mesh position={[xOff, size * (y + 0.1), 0]}>
              <cylinderGeometry args={[size * 0.025, size * 0.04, size * 0.06, 6]} />
              <meshStandardMaterial color="#334433" roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function RuneAltar({ pos, color, size }: P12) {
  const runes = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    if (runes.current) {
      runes.current.rotation.y += dt * 0.4
      runes.current.children.forEach((c, i) => {
        ;((c as THREE.Mesh).material as THREE.MeshStandardMaterial).emissiveIntensity =
          1 + Math.sin(t.current * 2 + i) * 0.5
      })
    }
  })
  return (
    <group position={pos}>
      {/* stone table */}
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.24, size * 0.5]} />
        <meshStandardMaterial color="#6a7a8a" roughness={0.9} />
      </mesh>
      {/* table surface slab */}
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.72, size * 0.07, size * 0.57]} />
        <meshStandardMaterial color="#7a8a9a" roughness={0.8} />
      </mesh>
      {/* floating rune stones */}
      <group ref={runes} position={[0, size * 0.5, 0]}>
        {([0, 1, 2, 3] as number[]).map((i) => (
          <mesh key={i} position={[
            Math.cos((i / 4) * Math.PI * 2) * size * 0.22,
            Math.sin(i * 1.1) * size * 0.05,
            Math.sin((i / 4) * Math.PI * 2) * size * 0.22,
          ]}>
            <boxGeometry args={[size * 0.08, size * 0.12, size * 0.04]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Batch 12: Underwater Lab ─────────────────────────────────────────────────

export function SubmarineHatch({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* floor plate */}
      <mesh position={[0, size * 0.03, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.42, size * 0.06, 12]} />
        <meshStandardMaterial color="#445566" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* hatch ring */}
      <mesh position={[0, size * 0.07, 0]}>
        <torusGeometry args={[size * 0.3, size * 0.07, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* hatch door */}
      <mesh position={[0, size * 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.25, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* spokes */}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.13, 0]} rotation={[0, (i / 4) * Math.PI * 2, 0]}>
          <boxGeometry args={[size * 0.42, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#334455" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      {/* center wheel */}
      <mesh position={[0, size * 0.14, 0]}>
        <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.06, 8]} />
        <meshStandardMaterial color="#bbccdd" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function PressureDome({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* base ring */}
      <mesh position={[0, size * 0.05, 0]}>
        <torusGeometry args={[size * 0.44, size * 0.07, 5, 16]} />
        <meshStandardMaterial color="#446688" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* dome glass */}
      <mesh position={[0, size * 0.34, 0]} castShadow>
        <sphereGeometry args={[size * 0.46, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.35} />
      </mesh>
      {/* frame ribs */}
      {([0, 1, 2, 3, 4, 5] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.1, 0]} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
          <boxGeometry args={[size * 0.92, size * 0.04, size * 0.03]} />
          <meshStandardMaterial color="#557799" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* interior glow */}
      <mesh position={[0, size * 0.22, 0]}>
        <sphereGeometry args={[size * 0.2, 8, 6]} />
        <meshStandardMaterial color="#aaddff" emissive="#aaddff" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export function SonarTower({ pos, color, size }: P12) {
  const dish = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (dish.current) dish.current.rotation.y += dt * 1.2
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.1, 0]}>
        <cylinderGeometry args={[size * 0.24, size * 0.28, size * 0.2, 8]} />
        <meshStandardMaterial color="#334455" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* tower */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.5, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* rotating sonar dish */}
      <group ref={dish} position={[0, size * 0.78, 0]}>
        <mesh>
          <cylinderGeometry args={[size * 0.22, size * 0.02, size * 0.18, 10, 1, true]} />
          <meshStandardMaterial color="#aabbcc" roughness={0.3} metalness={0.7} side={2} />
        </mesh>
        {/* dish arm */}
        <mesh position={[size * 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.22, 4]} />
          <meshStandardMaterial color="#bbccdd" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export function DeepProbe({ pos, color, size }: P12) {
  const probe = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 2
    if (probe.current) {
      probe.current.position.y = Math.sin(t.current * 0.8) * size * 0.04
    }
  })
  return (
    <group position={pos}>
      <group ref={probe} position={[0, size * 0.32, 0]}>
        {/* body */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.42, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* nose */}
        <mesh position={[0, size * 0.25, 0]}>
          <coneGeometry args={[size * 0.14, size * 0.18, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* thruster */}
        <mesh position={[0, -size * 0.24, 0]}>
          <cylinderGeometry args={[size * 0.16, size * 0.1, size * 0.1, 8]} />
          <meshStandardMaterial color="#334455" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* fins */}
        {([0, 1, 2] as number[]).map((i) => (
          <mesh key={i} position={[0, -size * 0.15, 0]} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
            <boxGeometry args={[size * 0.26, size * 0.12, size * 0.04]} />
            <meshStandardMaterial color="#445566" roughness={0.5} metalness={0.6} />
          </mesh>
        ))}
        {/* eye light */}
        <mesh position={[0, size * 0.2, size * 0.13]}>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  )
}

export function BubbleVent({ pos, color, size }: P12) {
  const bubbles = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.5
    if (bubbles.current) {
      bubbles.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh
        mesh.position.y += dt * (0.3 + i * 0.08) * size
        if (mesh.position.y > size * 0.7) mesh.position.y = size * 0.05
      })
    }
  })
  return (
    <group position={pos}>
      {/* pipe */}
      <mesh position={[0, size * 0.24, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.48, 7]} />
        <meshStandardMaterial color="#778899" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* valve wheel */}
      <mesh position={[0, size * 0.32, size * 0.09]}>
        <torusGeometry args={[size * 0.1, size * 0.025, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, size * 0.5, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.07, size * 0.08, 7]} />
        <meshStandardMaterial color="#889aaa" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* rising bubbles */}
      <group ref={bubbles}>
        {([0, 1, 2, 3] as number[]).map((i) => (
          <mesh key={i} position={[(i % 2 === 0 ? -1 : 1) * size * 0.04, size * (0.52 + i * 0.08), (i % 3 === 0 ? 1 : -1) * size * 0.03]}>
            <sphereGeometry args={[size * (0.04 + i * 0.01), 5, 4]} />
            <meshStandardMaterial color="#aaddff" roughness={0.1} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function CoralLab({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* main habitat box */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.72, size * 0.44, size * 0.5]} />
        <meshStandardMaterial color="#334455" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* front window */}
      <mesh position={[0, size * 0.24, size * 0.26]}>
        <boxGeometry args={[size * 0.54, size * 0.3, size * 0.03]} />
        <meshStandardMaterial color="#88ccff" roughness={0.05} transparent opacity={0.4} />
      </mesh>
      {/* coral decorations */}
      {([-0.22, 0, 0.22] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.52, 0]}>
          <cylinderGeometry args={[size * 0.04, size * 0.07, size * 0.22 + i * size * 0.04, 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* pipes on side */}
      <mesh position={[size * 0.38, size * 0.22, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.44, 6]} />
        <meshStandardMaterial color="#557799" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* status light */}
      <mesh position={[size * 0.32, size * 0.4, size * 0.26]}>
        <sphereGeometry args={[size * 0.04, 6, 4]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

export function SpecimenTank({ pos, color, size }: P12) {
  const fish = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    if (fish.current) {
      fish.current.position.x = Math.sin(t.current * 0.7) * size * 0.12
      fish.current.rotation.y = Math.sin(t.current * 0.7) > 0 ? 0 : Math.PI
    }
  })
  return (
    <group position={pos}>
      {/* tank body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.58, size * 0.56, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.05} transparent opacity={0.3} />
      </mesh>
      {/* metal frame corners */}
      {([[-0.28, 0.28], [-0.28, -0.28], [0.28, 0.28], [0.28, -0.28]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.28, size * z]}>
          <boxGeometry args={[size * 0.04, size * 0.58, size * 0.04]} />
          <meshStandardMaterial color="#446688" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* water fill */}
      <mesh position={[0, size * 0.24, 0]}>
        <boxGeometry args={[size * 0.52, size * 0.44, size * 0.38]} />
        <meshStandardMaterial color="#1144aa" roughness={0.1} transparent opacity={0.25} />
      </mesh>
      {/* specimen fish */}
      <mesh ref={fish} position={[0, size * 0.28, 0]}>
        <sphereGeometry args={[size * 0.08, 8, 6]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff4400" emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size * 0.58, 0]}>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.46]} />
        <meshStandardMaterial color="#446688" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function DepthGauge({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* mounting bracket */}
      <mesh position={[0, size * 0.35, -size * 0.07]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.7, size * 0.1]} />
        <meshStandardMaterial color="#334455" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* gauge face */}
      <mesh position={[0, size * 0.35, -size * 0.01]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.04, 14]} />
        <meshStandardMaterial color="#eeeedd" roughness={0.3} />
      </mesh>
      {/* gauge ring */}
      <mesh position={[0, size * 0.35, size * 0.01]}>
        <torusGeometry args={[size * 0.2, size * 0.025, 4, 14]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* needle */}
      <mesh position={[size * 0.08, size * 0.38, size * 0.025]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[size * 0.18, size * 0.025, size * 0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.4} />
      </mesh>
      {/* depth labels (colored marks) */}
      {([0, 1, 2, 3, 4] as number[]).map((i) => {
        const angle = (-Math.PI * 0.7) + (i / 4) * Math.PI * 1.4
        return (
          <mesh key={i} position={[
            Math.cos(angle) * size * 0.17,
            size * 0.35 + Math.sin(angle) * size * 0.17,
            size * 0.02,
          ]}>
            <boxGeometry args={[size * 0.02, size * 0.04, size * 0.01]} />
            <meshStandardMaterial color="#334455" roughness={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

export function TorpedoBay({ pos, color, size }: P12) {
  return (
    <group position={pos}>
      {/* bay housing */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.44, size * 0.54]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* torpedo tubes */}
      {([-0.18, 0.18] as number[]).map((z, i) => (
        <group key={i} position={[0, size * 0.22, size * z]}>
          <mesh>
            <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.86, 8, 1, true]} />
            <meshStandardMaterial color="#223344" roughness={0.5} metalness={0.7} side={2} />
          </mesh>
          {/* torpedo */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.7, 8]} />
            <meshStandardMaterial color="#889900" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* warhead */}
          <mesh position={[0, size * 0.38, 0]}>
            <coneGeometry args={[size * 0.07, size * 0.12, 8]} />
            <meshStandardMaterial color="#667700" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* door tracks */}
      {([-0.4, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.22, 0]}>
          <boxGeometry args={[size * 0.04, size * 0.46, size * 0.58]} />
          <meshStandardMaterial color="#334455" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function BiolumeTank({ pos, color, size }: P12) {
  const orbs = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.2
    if (orbs.current) {
      orbs.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh
        mesh.position.y = size * 0.28 + Math.sin(t.current * 0.8 + i * 1.2) * size * 0.06
        ;(mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(t.current + i * 0.9) * 0.7
      })
    }
  })
  return (
    <group position={pos}>
      {/* tank */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.36, size * 0.56, 10]} />
        <meshStandardMaterial color="#112233" roughness={0.05} transparent opacity={0.3} />
      </mesh>
      {/* dark water fill */}
      <mesh position={[0, size * 0.25, 0]}>
        <cylinderGeometry args={[size * 0.3, size * 0.3, size * 0.48, 10]} />
        <meshStandardMaterial color="#001122" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* bioluminescent creatures */}
      <group ref={orbs}>
        {([0, 1, 2, 3] as number[]).map((i) => (
          <mesh key={i} position={[
            Math.cos(i * 1.5) * size * 0.15,
            size * 0.28,
            Math.sin(i * 1.5) * size * 0.15,
          ]}>
            <sphereGeometry args={[size * 0.06, 6, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      {/* frame rings */}
      {([0.05, 0.56] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, 0]}>
          <torusGeometry args={[size * 0.36, size * 0.04, 4, 12]} />
          <meshStandardMaterial color="#446688" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
