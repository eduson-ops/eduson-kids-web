import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 29 · Medieval Market + Tech Lab ─────────────────────────────────

interface P29 { pos: [number,number,number]; color: string; size: number }

export function B29MarketStall({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* frame posts */}
      {([-0.5, 0.5] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.6, -size*0.3]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*1.2, 6]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* canopy */}
      <mesh position={[0, size*1.28, 0]}>
        <boxGeometry args={[size*1.3, size*0.08, size*0.9]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {/* counter */}
      <mesh position={[0, size*0.55, 0]}>
        <boxGeometry args={[size*1.1, size*0.1, size*0.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* goods */}
      {([-0.3, 0, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.65, 0]}>
          <sphereGeometry args={[size*0.1, 6, 6]} />
          <meshStandardMaterial color={i===0?'#ff4422':i===1?'#ffcc00':'#22aa44'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function MedievalWell({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* stone wall */}
      <mesh>
        <cylinderGeometry args={[size*0.38, size*0.42, size*0.5, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* frame */}
      {([-0.32, 0.32] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.72, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.55, 6]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* crossbar */}
      <mesh position={[0, size*1.0, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.7, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* bucket */}
      <mesh position={[0, size*0.55, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.08, size*0.18, 8]} />
        <meshStandardMaterial color="#888" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function MedievalCatapult({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.35 - 0.35
  })
  return (
    <group position={pos}>
      {/* wheels */}
      {([-0.45, 0.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.22, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.22, size*0.05, 6, 10]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* axle */}
      <mesh position={[0, size*0.22, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.95, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* base frame */}
      <mesh position={[0, size*0.35, 0]}>
        <boxGeometry args={[size*1.0, size*0.1, size*0.2]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* arm */}
      <mesh ref={ref} position={[size*0.08, size*0.48, 0]}>
        <boxGeometry args={[size*0.08, size*0.85, size*0.08]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </group>
  )
}

export function HeraldBanner({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size*0.9, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.8, 6]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* banner */}
      <mesh position={[-size*0.25, size*1.45, 0]}>
        <boxGeometry args={[size*0.5, size*0.75, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* cross emblem */}
      <mesh position={[-size*0.25, size*1.45, size*0.03]}>
        <boxGeometry args={[size*0.3, size*0.06, size*0.02]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-size*0.25, size*1.45, size*0.03]}>
        <boxGeometry args={[size*0.06, size*0.3, size*0.02]} />
        <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function SmithyAnvil({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size*0.08, 0]}>
        <boxGeometry args={[size*0.5, size*0.16, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* waist */}
      <mesh position={[0, size*0.25, 0]}>
        <boxGeometry args={[size*0.28, size*0.2, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* top */}
      <mesh position={[0, size*0.44, 0]}>
        <boxGeometry args={[size*0.55, size*0.14, size*0.25]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* horn */}
      <mesh position={[size*0.35, size*0.44, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[size*0.06, size*0.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function MedievalTavern({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* ground floor */}
      <mesh position={[0, size*0.35, 0]}>
        <boxGeometry args={[size*1.3, size*0.7, size*0.9]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.9} />
      </mesh>
      {/* upper floor */}
      <mesh position={[0, size*0.9, 0]}>
        <boxGeometry args={[size*1.4, size*0.5, size*1.0]} />
        <meshStandardMaterial color="#c8a46e" roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*1.25, 0]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[size*0.82, size*0.5, 4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* sign */}
      <mesh position={[size*0.55, size*0.65, -size*0.47]}>
        <boxGeometry args={[size*0.08, size*0.28, size*0.22]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TechHologram({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.8;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.7 + Math.sin(clock.getElapsedTime() * 3) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* base pedestal */}
      <mesh>
        <cylinderGeometry args={[size*0.25, size*0.3, size*0.15, 8]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* hologram core */}
      <mesh ref={ref} position={[0, size*0.55, 0]}>
        <octahedronGeometry args={[size*0.3, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.7} wireframe />
      </mesh>
      {/* outer ring */}
      <mesh position={[0, size*0.55, 0]}>
        <torusGeometry args={[size*0.42, size*0.03, 6, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function TechRobotArm({ pos, color, size }: P29) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.5
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.25, size*0.3, size*0.2, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      <group ref={ref} position={[0, size*0.15, 0]}>
        {/* lower arm */}
        <mesh position={[0, size*0.35, 0]}>
          <boxGeometry args={[size*0.15, size*0.6, size*0.15]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
        </mesh>
        {/* elbow joint */}
        <mesh position={[0, size*0.7, 0]}>
          <sphereGeometry args={[size*0.12, 8, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* upper arm */}
        <mesh position={[size*0.25, size*0.88, 0]} rotation={[0,0,0.7]}>
          <boxGeometry args={[size*0.14, size*0.5, size*0.14]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
        </mesh>
        {/* claw */}
        <mesh position={[size*0.5, size*1.1, 0]}>
          <boxGeometry args={[size*0.22, size*0.08, size*0.08]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

export function DNAHelix({ pos, color, size }: P29) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.6
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 10 }, (_, i) => {
        const t = (i / 10) * Math.PI * 4
        const y = i * size * 0.14 - size * 0.65
        return (
          <group key={i}>
            <mesh position={[Math.cos(t)*size*0.25, y, Math.sin(t)*size*0.25]}>
              <sphereGeometry args={[size*0.07, 6, 6]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[Math.cos(t+Math.PI)*size*0.25, y, Math.sin(t+Math.PI)*size*0.25]}>
              <sphereGeometry args={[size*0.07, 6, 6]} />
              <meshStandardMaterial color="#ff8844" emissive="#ff8844" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, y, 0]} rotation={[0, t, 0]}>
              <boxGeometry args={[size*0.5, size*0.03, size*0.03]} />
              <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function QuantumComputer({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.4 + Math.sin(clock.getElapsedTime() * 2.5) * 0.3
  })
  return (
    <group position={pos}>
      {/* main unit */}
      <mesh>
        <boxGeometry args={[size*0.9, size*1.2, size*0.7]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* glowing core */}
      <mesh ref={ref} position={[0, 0, size*0.36]}>
        <cylinderGeometry args={[size*0.2, size*0.2, size*0.5, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>
      {/* panels */}
      <mesh position={[0, size*0.42, size*0.36]}>
        <boxGeometry args={[size*0.75, size*0.06, size*0.02]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, size*0.28, size*0.36]}>
        <boxGeometry args={[size*0.75, size*0.06, size*0.02]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function LaserCutter({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      1.0 + Math.sin(clock.getElapsedTime() * 8) * 0.5
  })
  return (
    <group position={pos}>
      {/* frame */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*1.2, size*0.06, size*0.8]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*0.45, 0]}>
        <boxGeometry args={[size*0.2, size*0.18, size*0.18]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* laser beam */}
      <mesh ref={ref} position={[0, size*0.1, 0]}>
        <cylinderGeometry args={[size*0.015, size*0.015, size*0.7, 5]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={1.2} transparent opacity={0.85} />
      </mesh>
      {/* table */}
      <mesh>
        <boxGeometry args={[size*1.1, size*0.06, size*0.75]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function NanodroneSwarm({ pos, color, size }: P29) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.9
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        const r = size * 0.45
        return (
          <group key={i} position={[Math.cos(a)*r, Math.sin(a*0.5)*size*0.15, Math.sin(a)*r]}>
            {/* drone body */}
            <mesh>
              <boxGeometry args={[size*0.12, size*0.04, size*0.12]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
            {/* propellers */}
            {([-0.09, 0.09] as number[]).map((x, j) => (
              <mesh key={j} position={[x*size, size*0.03, 0]}>
                <cylinderGeometry args={[size*0.06, size*0.06, size*0.01, 6]} />
                <meshStandardMaterial color="#ccc" transparent opacity={0.6} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

export function PlasmaReactor({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 1.2;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 4) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* containment vessel */}
      <mesh>
        <cylinderGeometry args={[size*0.45, size*0.45, size*0.85, 12]} />
        <meshStandardMaterial color="#1a2244" transparent opacity={0.7} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* plasma core */}
      <mesh ref={ref} position={[0, 0, 0]}>
        <sphereGeometry args={[size*0.28, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} transparent opacity={0.85} />
      </mesh>
      {/* rings */}
      {([-0.28, 0, 0.28] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.45, size*0.04, 6, 16]} />
          <meshStandardMaterial color="#4488ff" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function CloningPod({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* glass tube */}
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*1.1, 10]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.4} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.38, size*0.42, size*0.18, 10]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size*1.2, 0]}>
        <cylinderGeometry args={[size*0.32, size*0.28, size*0.14, 10]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* figure inside */}
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.08, size*0.7, 6]} />
        <meshStandardMaterial color="#88aaff" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function MedievalKnightStatue({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* plinth */}
      <mesh>
        <boxGeometry args={[size*0.55, size*0.18, size*0.55]} />
        <meshStandardMaterial color="#888888" roughness={0.8} />
      </mesh>
      {/* body */}
      <mesh position={[0, size*0.55, 0]}>
        <boxGeometry args={[size*0.42, size*0.65, size*0.32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* head/helmet */}
      <mesh position={[0, size*1.02, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.2, size*0.28, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* sword */}
      <mesh position={[size*0.28, size*0.6, 0]} rotation={[0,0,0.15]}>
        <boxGeometry args={[size*0.05, size*0.85, size*0.04]} />
        <meshStandardMaterial color="#c0c8d0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* shield */}
      <mesh position={[-size*0.32, size*0.52, size*0.18]}>
        <boxGeometry args={[size*0.28, size*0.38, size*0.06]} />
        <meshStandardMaterial color="#cc3322" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function LabBeaker({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.2
  })
  return (
    <group position={pos}>
      {/* glass vessel */}
      <mesh position={[0, size*0.3, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.5, 8]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size*0.62, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.18, size*0.2, 8]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* liquid */}
      <mesh ref={ref} position={[0, size*0.15, 0]}>
        <cylinderGeometry args={[size*0.2, size*0.2, size*0.2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export function TimePortal({ pos, color, size }: P29) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      {/* outer ring */}
      <mesh>
        <torusGeometry args={[size*0.6, size*0.07, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* inner glow disc */}
      <mesh>
        <cylinderGeometry args={[size*0.52, size*0.52, size*0.04, 20]} />
        <meshStandardMaterial color="#aaddff" emissive="#aaddff" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
      {/* energy arcs */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} rotation={[0, 0, (i/3)*Math.PI*2]}>
          <torusGeometry args={[size*0.38, size*0.03, 6, 12, Math.PI*0.6]} />
          <meshStandardMaterial color="#88ffff" emissive="#88ffff" emissiveIntensity={0.8} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

export function MedievalCrossbow({ pos, color, size }: P29) {
  return (
    <group position={pos}>
      {/* stock */}
      <mesh position={[0, 0, size*0.1]}>
        <boxGeometry args={[size*0.1, size*0.1, size*0.9]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* bow limbs */}
      <mesh position={[0, 0, -size*0.1]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[size*0.35, size*0.04, 6, 12, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* rail */}
      <mesh position={[0, size*0.07, 0]}>
        <boxGeometry args={[size*0.06, size*0.06, size*0.65]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function MerchantChest({ pos, color, size }: P29) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15
  })
  return (
    <group position={pos}>
      {/* chest body */}
      <mesh position={[0, size*0.22, 0]}>
        <boxGeometry args={[size*0.85, size*0.45, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size*0.52, 0]}>
        <boxGeometry args={[size*0.87, size*0.18, size*0.57]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* metal bands */}
      {([-0.25, 0, 0.25] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.32, size*0.28]}>
          <boxGeometry args={[size*0.08, size*0.5, size*0.03]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* lock + glow */}
      <mesh ref={ref} position={[0, size*0.4, size*0.28]}>
        <boxGeometry args={[size*0.12, size*0.12, size*0.04]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.35} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ── BATCH 30 · Space Station + Underwater Castle ─────────────────────────────

interface P30 { pos: [number,number,number]; color: string; size: number }

export function SpaceStationHub({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      {/* central module */}
      <mesh>
        <cylinderGeometry args={[size*0.4, size*0.4, size*0.6, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* solar panels L */}
      <mesh position={[-size*0.85, 0, 0]}>
        <boxGeometry args={[size*0.9, size*0.04, size*0.5]} />
        <meshStandardMaterial color="#4488ff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* solar panels R */}
      <mesh position={[size*0.85, 0, 0]}>
        <boxGeometry args={[size*0.9, size*0.04, size*0.5]} />
        <meshStandardMaterial color="#4488ff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* connecting trusses */}
      <mesh position={[-size*0.4, 0, 0]}>
        <boxGeometry args={[size*0.4, size*0.06, size*0.06]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[size*0.4, 0, 0]}>
        <boxGeometry args={[size*0.4, size*0.06, size*0.06]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* docking port */}
      <mesh position={[0, -size*0.38, 0]}>
        <cylinderGeometry args={[size*0.15, size*0.15, size*0.18, 8]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function SpaceOxyTank({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* tank body */}
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.8, 10]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* caps */}
      <mesh position={[0, size*0.93, 0]}>
        <sphereGeometry args={[size*0.22, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, size*0.08, 0]}>
        <sphereGeometry args={[size*0.22, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* valve */}
      <mesh position={[0, size*1.18, 0]}>
        <torusGeometry args={[size*0.1, size*0.03, 6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* label stripe */}
      <mesh position={[0, size*0.5, size*0.23]}>
        <boxGeometry args={[size*0.15, size*0.6, size*0.02]} />
        <meshStandardMaterial color="#ff4400" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function AsteroidB30({ pos, color, size }: P30) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.3
      ref.current.rotation.z = clock.getElapsedTime() * 0.18
    }
  })
  return (
    <mesh ref={ref} position={pos}>
      <dodecahedronGeometry args={[size*0.45, 1]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.1} />
    </mesh>
  )
}

export function SpaceAirlock({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* outer frame */}
      <mesh>
        <boxGeometry args={[size*0.8, size*1.0, size*0.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* inner door */}
      <mesh position={[0, 0, size*0.11]}>
        <boxGeometry args={[size*0.58, size*0.78, size*0.06]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* porthole */}
      <mesh position={[0, size*0.18, size*0.15]}>
        <cylinderGeometry args={[size*0.14, size*0.14, size*0.04, 10]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* handle */}
      <mesh position={[size*0.22, 0, size*0.15]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.28, 6]} />
        <meshStandardMaterial color="#ff8800" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function SpaceSatDish({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.6
  })
  return (
    <group ref={ref} position={pos}>
      {/* mount */}
      <mesh position={[0, size*0.25, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.1, size*0.5, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* dish */}
      <mesh position={[0, size*0.6, 0]} rotation={[-0.6, 0, 0]}>
        <coneGeometry args={[size*0.5, size*0.2, 16, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} side={2} />
      </mesh>
      {/* feed arm */}
      <mesh position={[0, size*0.75, size*0.12]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[size*0.025, size*0.025, size*0.35, 5]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function UnderwaterCastle({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* main keep */}
      <mesh position={[0, size*0.6, 0]}>
        <boxGeometry args={[size*0.8, size*1.2, size*0.7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* battlements */}
      {([-0.3,-0.1,0.1,0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.28, size*0.3]}>
          <boxGeometry args={[size*0.14, size*0.2, size*0.12]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* towers */}
      {([-0.48, 0.48] as number[]).map((x, i) => (
        <group key={i} position={[x*size, 0, 0]}>
          <mesh position={[0, size*0.7, 0]}>
            <cylinderGeometry args={[size*0.22, size*0.24, size*1.4, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, size*1.42, 0]}>
            <coneGeometry args={[size*0.25, size*0.4, 8]} />
            <meshStandardMaterial color="#006633" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* seaweed */}
      <mesh position={[-size*0.55, size*0.2, size*0.2]}>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.5, 6]} />
        <meshStandardMaterial color="#006633" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function CoralSpire({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        const h = size * (0.5 + i * 0.12)
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.2, h*0.5, Math.sin(a)*size*0.2]}>
            <coneGeometry args={[size*(0.1-i*0.01), h, 5]} />
            <meshStandardMaterial color={i%2===0 ? color : '#ff4488'} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export function MermaidStatue({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.3, size*0.35, size*0.15, 10]} />
        <meshStandardMaterial color="#888888" roughness={0.8} />
      </mesh>
      {/* tail */}
      <mesh position={[0, size*0.4, 0]}>
        <cylinderGeometry args={[size*0.14, size*0.18, size*0.65, 8]} />
        <meshStandardMaterial color="#006699" roughness={0.6} />
      </mesh>
      {/* torso */}
      <mesh position={[0, size*0.85, 0]}>
        <cylinderGeometry args={[size*0.15, size*0.16, size*0.35, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*1.12, 0]}>
        <sphereGeometry args={[size*0.15, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* fin tail */}
      <mesh position={[0, size*0.08, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[size*0.2, size*0.18, 4]} />
        <meshStandardMaterial color="#004488" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function UnderwaterAnchor({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* shaft */}
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.08, size*1.0, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, size*0.9, 0]}>
        <boxGeometry args={[size*0.6, size*0.07, size*0.07]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* flukes */}
      <mesh position={[-size*0.2, size*0.06, 0]} rotation={[0,0,-0.5]}>
        <coneGeometry args={[size*0.1, size*0.3, 4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[size*0.2, size*0.06, 0]} rotation={[0,0,0.5]}>
        <coneGeometry args={[size*0.1, size*0.3, 4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* ring */}
      <mesh position={[0, size*1.0, 0]}>
        <torusGeometry args={[size*0.12, size*0.035, 6, 10]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function BubbleStream({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + (clock.getElapsedTime() * size * 0.3) % (size * 1.5)
  })
  return (
    <group position={pos}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[(i%3-1)*size*0.1, i*size*0.2, (i%2)*size*0.08]}>
          <sphereGeometry args={[size*(0.06+i*0.01), 6, 6]} />
          <meshStandardMaterial color="#aaddff" transparent opacity={0.5} roughness={0.1} />
        </mesh>
      ))}
      <group ref={ref}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} position={[(i%3-1)*size*0.1, i*size*0.25 + size*1.2, 0]}>
            <sphereGeometry args={[size*0.05, 5, 5]} />
            <meshStandardMaterial color={color} transparent opacity={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function SpacePod({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.3, 0]}>
        <sphereGeometry args={[size*0.38, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* heat shield bottom */}
      <mesh position={[0, -size*0.05, 0]}>
        <cylinderGeometry args={[size*0.38, size*0.32, size*0.12, 10]} />
        <meshStandardMaterial color="#cc4400" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* window */}
      <mesh position={[0, size*0.45, size*0.3]}>
        <cylinderGeometry args={[size*0.13, size*0.13, size*0.06, 10]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      {/* thruster */}
      <mesh position={[0, size*0.7, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.06, size*0.18, 6]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function OceanTreasureMap({ pos, color: _color, size }: P30) {
  return (
    <group position={pos}>
      {/* scroll base */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI/6, 0, 0]}>
        <boxGeometry args={[size*0.75, size*0.55, size*0.03]} />
        <meshStandardMaterial color="#e8d5a0" roughness={0.9} />
      </mesh>
      {/* rolled edge top */}
      <mesh position={[0, size*0.32, size*0.02]} rotation={[Math.PI/6, 0, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.75, 6]} />
        <meshStandardMaterial color="#d4c080" roughness={0.9} />
      </mesh>
      {/* rolled edge bottom */}
      <mesh position={[0, -size*0.28, size*0.02]} rotation={[Math.PI/6, 0, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.75, 6]} />
        <meshStandardMaterial color="#d4c080" roughness={0.9} />
      </mesh>
      {/* X mark */}
      <mesh position={[size*0.1, 0, size*0.03]} rotation={[Math.PI/6, 0, 0.6]}>
        <boxGeometry args={[size*0.25, size*0.04, size*0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.7} />
      </mesh>
      <mesh position={[size*0.1, 0, size*0.03]} rotation={[Math.PI/6, 0, -0.6]}>
        <boxGeometry args={[size*0.25, size*0.04, size*0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function B30SeaTurtle({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 0.6) * size * 0.1
      ref.current.rotation.y = t * 0.15
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* shell */}
      <mesh>
        <sphereGeometry args={[size*0.35, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* shell pattern */}
      <mesh position={[0, size*0.2, 0]}>
        <boxGeometry args={[size*0.5, size*0.05, size*0.4]} />
        <meshStandardMaterial color="#224422" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0, size*0.4]}>
        <sphereGeometry args={[size*0.14, 8, 8]} />
        <meshStandardMaterial color="#448822" roughness={0.7} />
      </mesh>
      {/* flippers */}
      {([[-0.38,-0.05,-0.1],[0.38,-0.05,-0.1],[-0.28,-0.05,0.2],[0.28,-0.05,0.2]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[0,0,i<2?-0.3:0.3]}>
          <boxGeometry args={[size*0.3, size*0.05, size*0.15]} />
          <meshStandardMaterial color="#448822" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function WreckCannon({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* carriage */}
      <mesh position={[0, size*0.15, 0]} rotation={[0,0,0.15]}>
        <boxGeometry args={[size*0.9, size*0.2, size*0.32]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
      </mesh>
      {/* barrel */}
      <mesh position={[size*0.1, size*0.3, 0]} rotation={[0,0,-0.2]}>
        <cylinderGeometry args={[size*0.1, size*0.12, size*0.8, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* wheels */}
      {([-0.4, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.12, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.18, size*0.04, 6, 10]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* rust/algae overlay */}
      <mesh position={[size*0.15, size*0.33, size*0.1]}>
        <sphereGeometry args={[size*0.07, 5, 5]} />
        <meshStandardMaterial color="#335533" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function SpaceHelmet({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* helmet dome */}
      <mesh>
        <sphereGeometry args={[size*0.42, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* visor */}
      <mesh position={[0, size*0.05, size*0.34]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.3, size*0.04, 12, 1, false, -0.8, 1.6]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.65} roughness={0.1} metalness={0.2} />
      </mesh>
      {/* neck ring */}
      <mesh position={[0, -size*0.35, 0]}>
        <torusGeometry args={[size*0.3, size*0.05, 6, 12]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function AquaGargoyle({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*0.38, size*0.55, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* wings */}
      {([-1,1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.4, size*0.55, -size*0.05]} rotation={[0,0,s*0.5]}>
          <boxGeometry args={[size*0.4, size*0.5, size*0.05]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* head */}
      <mesh position={[0, size*0.92, 0]}>
        <boxGeometry args={[size*0.28, size*0.28, size*0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* horns */}
      {([-0.1, 0.1] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.1, 0]}>
          <coneGeometry args={[size*0.04, size*0.2, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* algae glow */}
      <mesh position={[0, size*0.45, size*0.17]}>
        <sphereGeometry args={[size*0.08, 5, 5]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function B30SpaceDebris({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.4
      ref.current.rotation.z = clock.getElapsedTime() * 0.27
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* main chunk */}
      <mesh>
        <boxGeometry args={[size*0.4, size*0.25, size*0.3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.5} />
      </mesh>
      {/* broken panel */}
      <mesh position={[size*0.22, size*0.1, 0]} rotation={[0,0,0.4]}>
        <boxGeometry args={[size*0.3, size*0.05, size*0.22]} />
        <meshStandardMaterial color="#4488ff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* fragment */}
      <mesh position={[-size*0.18, -size*0.15, size*0.1]}>
        <tetrahedronGeometry args={[size*0.15, 0]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function UnderwaterGate({ pos, color, size }: P30) {
  return (
    <group position={pos}>
      {/* pillars */}
      {([-0.45, 0.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.7, 0]}>
          <cylinderGeometry args={[size*0.12, size*0.15, size*1.4, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* arch */}
      <mesh position={[0, size*1.42, 0]}>
        <torusGeometry args={[size*0.5, size*0.1, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* kelp on sides */}
      {([-0.55, 0.55] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.3, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.06, size*0.7, 6]} />
          <meshStandardMaterial color="#226644" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function NebulaClouds({ pos, color, size }: P30) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        const r = size * (0.3 + (i%3)*0.15)
        return (
          <mesh key={i} position={[Math.cos(a)*r, (i%3-1)*size*0.2, Math.sin(a)*r]}>
            <sphereGeometry args={[size*(0.2+i*0.025), 6, 6]} />
            <meshStandardMaterial color={i%2===0?color:'#ff88aa'} transparent opacity={0.35} roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}
