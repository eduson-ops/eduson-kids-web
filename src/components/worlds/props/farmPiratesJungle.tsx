import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Farm ─────────────────────────────────────────────────────────────────

export function Cow({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bodyColor = color || '#f5f5f5'
  const spotColor = '#2a2a2a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.45, size * 0.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
      {/* spot */}
      <mesh position={[size * 0.1, size * 0.28, size * 0.26]} castShadow>
        <sphereGeometry args={[size * 0.13, 8, 8]} />
        <meshStandardMaterial color={spotColor} roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[size * 0.5, size * 0.24, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.3, size * 0.28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
      {/* snout */}
      <mesh position={[size * 0.68, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color="#f0c8b0" roughness={0.9} />
      </mesh>
      {/* ears */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.42, size * 0.36, s * size * 0.16]} castShadow>
          <sphereGeometry args={[size * 0.07, 6, 6]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} />
        </mesh>
      ))}
      {/* horns */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.46, size * 0.42, s * size * 0.1]} rotation={[0, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.025, size * 0.12, 6]} />
          <meshStandardMaterial color="#d4c080" roughness={0.7} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.28, -0.18], [-0.28, 0.18], [0.28, -0.18], [0.28, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, -size * 0.1, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.05, size * 0.3, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[-size * 0.38, size * 0.18, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.015, size * 0.3, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Barn({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wallColor = color || '#c0392b'
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.8, size * 0.9]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* roof ridge (A-frame triangles via boxes) */}
      <mesh position={[0, size * 0.82, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.6, size * 0.92]} />
        <meshStandardMaterial color="#8b2020" roughness={0.8} />
      </mesh>
      {/* door */}
      <mesh position={[0, size * 0.12, size * 0.456]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.44, size * 0.02]} />
        <meshStandardMaterial color="#5a2d00" roughness={0.9} />
      </mesh>
      {/* door arch */}
      <mesh position={[0, size * 0.37, size * 0.456]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.02, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5a2d00" roughness={0.9} />
      </mesh>
      {/* windows */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 0.4, size * 0.457]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.16, size * 0.02]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
      {/* loft side window */}
      <mesh position={[0, size * 0.72, size * 0.457]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  )
}

export function HayBale({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* main cylinder roll (on its side) */}
      <mesh position={[0, size * 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.7, 16]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* spiral wrap rings */}
      {[-0.15, 0, 0.15].map((z, i) => (
        <mesh key={i} position={[0, size * 0.25, z * size]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[size * 0.38, size * 0.025, 6, 16]} />
          <meshStandardMaterial color="#b08030" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function Scarecrow({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.045, size * 0.045, size * 1.1, 6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, size * 0.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.8, 6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* shirt body */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.28, size * 0.12]} />
        <meshStandardMaterial color="#c8a030" roughness={0.9} />
      </mesh>
      {/* arms (sleeves) */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.42, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.055, size * 0.32, 6]} />
          <meshStandardMaterial color="#c8a030" roughness={0.9} />
        </mesh>
      ))}
      {/* pants */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.22, size * 0.14]} />
        <meshStandardMaterial color="#4c7cb0" roughness={0.9} />
      </mesh>
      {/* head (pumpkin-ish) */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 10, 8]} />
        <meshStandardMaterial color="#ff9030" roughness={0.8} />
      </mesh>
      {/* hat brim */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.04, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* hat crown */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.13, size * 0.13, size * 0.22, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Well({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* stone ring */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.4, size * 0.28, 14, 1, true]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* stone top rim */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <torusGeometry args={[size * 0.38, size * 0.05, 6, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
      {/* posts */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.28, size * 0.42, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.55, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* roof ridge beam */}
      <mesh position={[0, size * 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.64, 6]} />
        <meshStandardMaterial color={wood} roughness={0.9} />
      </mesh>
      {/* roof panels */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.56, 0]} rotation={[s * 0.55, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.7, size * 0.02, size * 0.4]} />
          <meshStandardMaterial color="#8b2020" roughness={0.85} />
        </mesh>
      ))}
      {/* rope */}
      <mesh position={[0, size * 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.35, 6]} />
        <meshStandardMaterial color="#c8a030" roughness={0.9} />
      </mesh>
      {/* bucket */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.055, size * 0.12, 10]} />
        <meshStandardMaterial color={wood} roughness={0.85} />
      </mesh>
    </group>
  )
}

// ─── Pirates ──────────────────────────────────────────────────────────────

export function Cannon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#3a3a3a'
  return (
    <group position={pos}>
      {/* barrel — angled up */}
      <mesh position={[0, size * 0.18, 0]} rotation={[Math.PI / 2 - 0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.72, 12]} />
        <meshStandardMaterial color={metal} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* muzzle ring */}
      <mesh position={[0, size * 0.44, size * 0.12]} rotation={[Math.PI / 2 - 0.35, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.16, size * 0.03, 8, 14]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* wheels */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.0, -size * 0.08]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.06, 12]} />
          <meshStandardMaterial color="#5a3000" roughness={0.9} />
        </mesh>
      ))}
      {/* wheel spokes */}
      {[-1, 1].map((s, i) =>
        [0, 1, 2, 3].map((j) => (
          <mesh key={`${i}-${j}`} position={[s * size * 0.3, size * 0, -size * 0.08]} rotation={[j * Math.PI / 4, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[size * 0.03, size * 0.37, size * 0.06]} />
            <meshStandardMaterial color="#5a3000" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* carriage */}
      <mesh position={[0, -size * 0.04, -size * 0.08]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.12, size * 0.55]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ShipWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.4 })
  const wood = color || '#8b5a2b'
  const spokes = Array.from({ length: 8 }, (_, i) => i)
  return (
    <group position={pos}>
      <group ref={ref}>
        {/* outer ring */}
        <mesh castShadow>
          <torusGeometry args={[size * 0.44, size * 0.06, 8, 20]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
        {/* spokes */}
        {spokes.map((i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} rotation={[0, 0, angle]} castShadow>
              <boxGeometry args={[size * 0.06, size * 0.88, size * 0.06]} />
              <meshStandardMaterial color={wood} roughness={0.9} />
            </mesh>
          )
        })}
        {/* handle pegs */}
        {spokes.map((i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.44, Math.sin(angle) * size * 0.44, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.03, size * 0.14, 6]} />
              <meshStandardMaterial color="#6b3800" roughness={0.85} />
            </mesh>
          )
        })}
        {/* center hub */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.12, 12]} />
          <meshStandardMaterial color="#5a3000" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
      {/* post behind wheel */}
      <mesh position={[0, -size * 0.3, -size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.8, 8]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TreasureMap({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* scroll body */}
      <mesh position={[0, size * 0.02, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.02, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* rolled ends */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.35, size * 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.52, 8]} />
          <meshStandardMaterial color="#b08030" roughness={0.85} />
        </mesh>
      ))}
      {/* X marks the spot */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.06, size * 0.025, size * 0.04]} rotation={[Math.PI / 2, 0, s * Math.PI / 4]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.012, size * 0.012]} />
          <meshStandardMaterial color="#c0392b" roughness={0.8} />
        </mesh>
      ))}
      {/* dotted path lines (boxes) */}
      {[-0.15, -0.05, 0.05].map((z, i) => (
        <mesh key={i} position={[-size * 0.15, size * 0.025, z * size]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.05, size * 0.012, size * 0.012]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function JollyRoger({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flagColor = color || '#2a2a2a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* flag */}
      <mesh position={[size * 0.28, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.38, size * 0.02]} />
        <meshStandardMaterial color={flagColor} roughness={0.8} />
      </mesh>
      {/* skull */}
      <mesh position={[size * 0.2, size * 0.86, size * 0.015]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 8]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
      {/* crossbones H bar */}
      <mesh position={[size * 0.2, size * 0.74, size * 0.015]} rotation={[0, 0, Math.PI / 5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
      <mesh position={[size * 0.2, size * 0.74, size * 0.015]} rotation={[0, 0, -Math.PI / 5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function AnchorChain({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#5a5a5a'
  return (
    <group position={pos}>
      {/* main shaft */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.72, 8]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
      </mesh>
      {/* top ring */}
      <mesh position={[0, size * 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 8, 14]} />
        <meshStandardMaterial color={metal} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* cross bar */}
      <mesh position={[0, size * 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.44, 8]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.18, -size * 0.04, size * 0.18]} rotation={[Math.PI / 3, 0, s * 0.5]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.03, size * 0.42, 8]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* flukes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.26, -size * 0.14, size * 0.26]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* chain links */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, size * 0.65 + i * size * 0.12, 0]} rotation={[i % 2 ? 0 : Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.06, size * 0.02, 6, 10]} />
          <meshStandardMaterial color={metal} roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Jungle ───────────────────────────────────────────────────────────────

export function PalmTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const leafColor = color || '#34C38A'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.08 })
  return (
    <group position={pos}>
      {/* trunk — slight curve using 3 segments */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * size * 0.04, size * (i * 0.22 + 0.12), 0]} castShadow>
          <cylinderGeometry args={[size * (0.1 - i * 0.015), size * (0.12 - i * 0.015), size * 0.28, 8]} />
          <meshStandardMaterial color="#c8a030" roughness={0.9} />
        </mesh>
      ))}
      {/* leaf crown */}
      <group ref={ref} position={[size * 0.16, size * 1.02, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.35, -size * 0.1, Math.sin(angle) * size * 0.35]}
              rotation={[Math.sin(angle) * 0.5, angle, 0.6]} castShadow>
              <boxGeometry args={[size * 0.06, size * 0.02, size * 0.55]} />
              <meshStandardMaterial color={leafColor} roughness={0.85} />
            </mesh>
          )
        })}
        {/* coconuts */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.1, -size * 0.05, Math.sin(a) * size * 0.1]} castShadow>
              <sphereGeometry args={[size * 0.075, 8, 8]} />
              <meshStandardMaterial color="#5a3000" roughness={0.85} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function Bamboo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5ba55b'
  const stalks = [
    [0, 0, 0],
    [size * 0.18, 0, size * 0.1],
    [-size * 0.15, 0, -size * 0.12],
  ]
  return (
    <group position={pos}>
      {stalks.map(([x, , z], si) =>
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={`${si}-${i}`} position={[x, size * (i * 0.22 + 0.12), z]} castShadow>
            <cylinderGeometry args={[size * 0.055, size * 0.06, size * 0.2, 8]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))
      )}
      {/* nodes */}
      {stalks.map(([x, , z], si) =>
        [1, 2, 3, 4].map((i) => (
          <mesh key={`n${si}-${i}`} position={[x, size * (i * 0.22 + 0.01), z]} castShadow>
            <torusGeometry args={[size * 0.06, size * 0.018, 6, 12]} />
            <meshStandardMaterial color="#3a7a3a" roughness={0.85} />
          </mesh>
        ))
      )}
      {/* leaves at top */}
      {stalks.map(([x, , z], si) =>
        [-1, 1].map((s, i) => (
          <mesh key={`l${si}-${i}`} position={[x + s * size * 0.18, size * 1.05, z]} rotation={[0, 0, s * 0.55]} castShadow>
            <boxGeometry args={[size * 0.28, size * 0.02, size * 0.06]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function SnakeDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5ba55b'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5 })
  const coils = Array.from({ length: 8 }, (_, i) => i)
  return (
    <group position={pos}>
      {/* coiled body */}
      {coils.map((i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = size * (0.35 - i * 0.02)
        const y = size * i * 0.07
        return (
          <mesh key={i} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
            rotation={[0, angle + Math.PI / 2, 0]} castShadow>
            <cylinderGeometry args={[size * (0.07 - i * 0.004), size * (0.08 - i * 0.004), size * 0.32, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? c : '#2a5a2a'} roughness={0.8} />
          </mesh>
        )
      })}
      {/* head */}
      <group ref={ref} position={[0, size * 0.64, 0]}>
        <mesh position={[0, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.09, size * 0.12]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.04, size * 0.1, size * 0.06]} castShadow>
            <sphereGeometry args={[size * 0.025, 6, 6]} />
            <meshStandardMaterial color="#ffff00" roughness={0.3} />
          </mesh>
        ))}
        {/* tongue */}
        <mesh position={[0, size * 0.07, size * 0.07]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.055, size * 0.01, size * 0.07]} />
          <meshStandardMaterial color="#ff5464" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export function TribalMask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos}>
      {/* face panel */}
      <mesh position={[0, size * 0.15, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.75, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* forehead crest */}
      <mesh position={[0, size * 0.58, size * 0.04]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.16, size * 0.1]} />
        <meshStandardMaterial color="#a06020" roughness={0.85} />
      </mesh>
      {/* crest spikes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.73, size * 0.04]} castShadow>
          <coneGeometry args={[size * 0.055, size * 0.18, 6]} />
          <meshStandardMaterial color="#a06020" roughness={0.85} />
        </mesh>
      ))}
      {/* eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.15, size * 0.25, size * 0.07]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.07, size * 0.05]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, size * 0.1, size * 0.08]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.1, size * 0.06]} />
        <meshStandardMaterial color="#a06020" roughness={0.85} />
      </mesh>
      {/* mouth */}
      <mesh position={[0, -size * 0.06, size * 0.07]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
      {/* teeth */}
      {[-0.07, 0, 0.07].map((x, i) => (
        <mesh key={i} position={[x * size, -size * 0.04, size * 0.09]} castShadow>
          <boxGeometry args={[size * 0.04, size * 0.06, size * 0.03]} />
          <meshStandardMaterial color="#f5f5e0" roughness={0.8} />
        </mesh>
      ))}
      {/* side decorations */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.32, size * 0.1, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.04, size * 0.35, 6]} />
          <meshStandardMaterial color="#c84030" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function VineSwing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.3
  })
  const c = color || '#48c774'
  return (
    <group position={pos}>
      {/* anchor bar at top */}
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.8, 8]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
      <group ref={ref} position={[0, size * 0.7, 0]}>
        {/* vine ropes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.3, -size * 0.35, 0]} castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.7, 6]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
        ))}
        {/* seat plank */}
        <mesh position={[0, -size * 0.72, 0]} castShadow>
          <boxGeometry args={[size * 0.66, size * 0.06, size * 0.24]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {/* leaf accents on ropes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.3, -size * 0.18, 0]} rotation={[0, 0, s * 0.4]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.04, size * 0.08]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
