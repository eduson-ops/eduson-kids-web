import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Nordic/Viking ────────────────────────────────────────

export function Longship({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const sailRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (sailRef.current) sailRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.08 })
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* prow (front) */}
      <mesh position={[size * 0.78, size * 0.32, 0]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[size * 0.12, size * 0.38, 4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* stern */}
      <mesh position={[-size * 0.78, size * 0.32, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[size * 0.1, size * 0.3, 4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* mast */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.0, 6]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.9} />
      </mesh>
      {/* sail */}
      <group ref={sailRef} position={[0, size * 0.9, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size * 0.06, size * 0.55, size * 0.65]} />
          <meshStandardMaterial color="#d4a843" roughness={0.6} side={2} />
        </mesh>
        {/* sail stripes */}
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[size * 0.04, i * size * 0.16, 0]} castShadow>
            <boxGeometry args={[size * 0.02, size * 0.08, size * 0.66]} />
            <meshStandardMaterial color="#c0392b" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* oars */}
      {[-1, 1].map((side) =>
        [-0.4, 0, 0.4].map((xOff, i) => (
          <mesh key={`${side}-${i}`} position={[xOff * size, size * 0.1, side * size * 0.45]} rotation={[0, 0, side * 0.4]} castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.7, 5]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function Runestone({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0a0a0'
  return (
    <group position={pos}>
      {/* stone slab */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 1.1, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* rune engravings (darker grooves) */}
      {[0.3, 0.05, -0.25].map((y, i) => (
        <mesh key={i} position={[0, size * y + size * 0.55, size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
          <meshStandardMaterial color="#e8c84a" emissive="#c0a020" emissiveIntensity={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* carved circle */}
      <mesh position={[0, size * 0.85, size * 0.1]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.13, size * 0.025, 6, 20]} />
        <meshStandardMaterial color="#e8c84a" emissive="#c0a020" emissiveIntensity={0.3} roughness={0.6} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.12, size * 0.35]} />
        <meshStandardMaterial color="#888" roughness={0.95} />
      </mesh>
    </group>
  )
}

export function VikingHelmet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#b8b8b8'
  return (
    <group position={pos}>
      {/* dome */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* nose guard */}
      <mesh position={[0, size * 0.38, size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.28, size * 0.08]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* horns */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.46, size * 0.7, 0]} rotation={[0, 0, side * 0.45]} castShadow>
          <coneGeometry args={[size * 0.07, size * 0.4, 6]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.6} />
        </mesh>
      ))}
      {/* brim */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.08, 14]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.35, size * 0.12, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function MeadHall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size * 0.8, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* roof (pitched) */}
      <mesh position={[0, size * 0.98, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[size * 0.82, size * 0.6, 4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[0, size * 0.28, size * 0.46]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.56, size * 0.05]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>
      {/* windows */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.5, size * 0.46]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.2, size * 0.04]} />
          <meshStandardMaterial color="#ffd88a" emissive="#ffc040" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      ))}
      {/* corner logs */}
      {[[-0.72, 0.46], [0.72, 0.46], [-0.72, -0.46], [0.72, -0.46]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.4, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.82, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function AxeRack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0522d'
  return (
    <group position={pos}>
      {/* rack frame */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* legs */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.25, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.5, size * 0.08]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* axes */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <group key={i} position={[x * size, size * 0.62, 0]}>
          {/* handle */}
          <mesh castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.55, 5]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.8} />
          </mesh>
          {/* blade */}
          <mesh position={[size * 0.1, size * 0.22, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[size * 0.22, size * 0.2, size * 0.04]} />
            <meshStandardMaterial color="#b0b8c0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Magical Forest ───────────────────────────────────────

export function FairyRing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const glowRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (glowRef.current) glowRef.current.rotation.y += 0.008
  })
  const c = color || '#9b59b6'
  const mushroomColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db']
  return (
    <group position={pos}>
      {/* grass ring */}
      <mesh position={[0, size * 0.02, 0]} receiveShadow>
        <torusGeometry args={[size * 0.55, size * 0.12, 4, 28]} />
        <meshStandardMaterial color="#2d8a2d" roughness={0.9} />
      </mesh>
      {/* mushrooms around ring */}
      {mushroomColors.map((mc, i) => {
        const a = (i / mushroomColors.length) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * size * 0.55, 0, Math.sin(a) * size * 0.55]}>
            <mesh position={[0, size * 0.18, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.36, 6]} />
              <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
            </mesh>
            <mesh position={[0, size * 0.42, 0]} castShadow>
              <coneGeometry args={[size * 0.14, size * 0.18, 8]} />
              <meshStandardMaterial color={mc} roughness={0.6} />
            </mesh>
          </group>
        )
      })}
      {/* floating magic particles */}
      <group ref={glowRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.35, size * 0.3 + Math.sin(i) * size * 0.1, Math.sin(a) * size * 0.35]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function GiantMushroom({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (bobRef.current) bobRef.current.position.y = Math.sin(Date.now() * 0.0008) * size * 0.02 })
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* stalk */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.22, size * 1.0, 10]} />
        <meshStandardMaterial color="#f0ece0" roughness={0.7} />
      </mesh>
      {/* gills under cap */}
      <mesh position={[0, size * 1.03, 0]} castShadow>
        <cylinderGeometry args={[size * 0.58, size * 0.18, size * 0.06, 16]} />
        <meshStandardMaterial color="#f5e8d0" roughness={0.8} side={2} />
      </mesh>
      {/* cap */}
      <group ref={bobRef}>
        <mesh position={[0, size * 1.18, 0]} castShadow>
          <sphereGeometry args={[size * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* white spots */}
        {[[0.2, 0.3, 0.35], [-0.3, 0.25, 0.3], [0.0, 0.15, -0.4], [-0.2, 0.4, -0.2]].map(([dx, dy, dz], i) => (
          <mesh key={i} position={[dx * size, size * 1.18 + dy * size * 0.4, dz * size]} castShadow>
            <sphereGeometry args={[size * 0.07, 6, 6]} />
            <meshStandardMaterial color="#fff" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function CrystalTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#00d2ff'
  return (
    <group position={pos}>
      {/* trunk (translucent crystal) */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.16, size * 0.9, 6]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} roughness={0.1} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      {/* crystal crown clusters */}
      {[
        [0, 1.1, 0, 0.28, 0.55],
        [0.3, 0.88, 0.2, 0.18, 0.38],
        [-0.28, 0.85, -0.18, 0.16, 0.34],
        [0.18, 0.78, -0.25, 0.14, 0.3],
      ].map(([x, y, z, r, h], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} rotation={[Math.random() * 0.4, i * 1.1, Math.random() * 0.4]} castShadow>
          <cylinderGeometry args={[0, r * size, h * size, 5]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.05} metalness={0.4} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* glow orb at top */}
      <mesh position={[0, size * 1.45, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.2} roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function WizardHat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const starRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (starRef.current) starRef.current.rotation.y += 0.02 })
  const c = color || '#4a235a'
  return (
    <group position={pos}>
      {/* brim */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.1, 14]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* cone */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <coneGeometry args={[size * 0.38, size * 1.0, 14]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* band */}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.08, 14]} />
        <meshStandardMaterial color="#f8d74a" emissive="#d4a020" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      {/* stars on hat */}
      <group ref={starRef} position={[0, size * 0.7, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.2, 0, Math.sin(a) * size * 0.2]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color="#ffe066" emissive="#ffc000" emissiveIntensity={0.8} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function PotionStand({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8e44ad'
  const bottleColors = ['#27ae60', '#c0392b', '#2980b9', '#e67e22']
  return (
    <group position={pos}>
      {/* table */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.08, size * 0.55]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* table legs */}
      {[[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.19, z * size]} castShadow>
          <boxGeometry args={[size * 0.07, size * 0.38, size * 0.07]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* potion bottles */}
      {bottleColors.map((bc, i) => {
        const x = (i - 1.5) * size * 0.2
        return (
          <group key={i} position={[x, size * 0.52, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.26, 8]} />
              <meshStandardMaterial color={bc} emissive={bc} emissiveIntensity={0.2} roughness={0.3} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, size * 0.17, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.07, size * 0.1, 6]} />
              <meshStandardMaterial color={bc} roughness={0.4} />
            </mesh>
            <mesh position={[0, size * 0.23, 0]} castShadow>
              <cylinderGeometry args={[size * 0.045, size * 0.045, size * 0.06, 6]} />
              <meshStandardMaterial color="#555" roughness={0.5} />
            </mesh>
          </group>
        )
      })}
      {/* sign */}
      <mesh position={[0, size * 0.75, -size * 0.29]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.18, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Industrial ───────────────────────────────────────────

export function FactoryChimney({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const smokeRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (smokeRef.current) {
      smokeRef.current.position.y = ((smokeRef.current.position.y - pos[1] - size * 1.3 + size * 0.4) % (size * 0.4)) + size * 1.3
      smokeRef.current.scale.x = smokeRef.current.scale.z = 1 + (smokeRef.current.position.y - pos[1] - size * 1.3) / (size * 0.4) * 0.5
    }
  })
  const c = color || '#8b4513'
  return (
    <group position={pos}>
      {/* chimney stack */}
      <mesh position={[0, size * 0.75, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.3, size * 1.5, 10]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* brick bands */}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * 0.31, size * 0.31, size * 0.06, 10]} />
          <meshStandardMaterial color="#5a2a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* top rim */}
      <mesh position={[0, size * 1.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.25, size * 0.08, 10]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* smoke puff */}
      <group ref={smokeRef} position={[0, size * 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[size * 0.18, 6, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.9} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.1, size * 0.9]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function ConveyorBelt({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const beltRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (beltRef.current) {
      beltRef.current.children.forEach((c) => {
        c.position.x -= 0.012 * size
        if (c.position.x < -size * 0.55) c.position.x = size * 0.55
      })
    }
  })
  const c = color || '#444'
  return (
    <group position={pos}>
      {/* belt frame */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.3, size * 0.12, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* rollers */}
      {[-0.58, 0.58].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.22, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.56, 8]} rotation-x={Math.PI / 2} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* moving belt surface */}
      <mesh position={[0, size * 0.285, 0]} receiveShadow>
        <boxGeometry args={[size * 1.15, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      {/* belt slats */}
      <group ref={beltRef}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[(i - 3) * size * 0.18, size * 0.3, 0]} castShadow>
            <boxGeometry args={[size * 0.06, size * 0.025, size * 0.5]} />
            <meshStandardMaterial color="#555" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.16, size * 0.5]} />
          <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function RobotArm({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const armRef = useRef<THREE.Group>(null!)
  const clawRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.001
    if (armRef.current) armRef.current.rotation.y = Math.sin(t * 0.7) * 0.8
    if (clawRef.current) clawRef.current.rotation.z = Math.sin(t * 1.2) * 0.3 - 0.3
  })
  const c = color || '#607d8b'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.2, 10]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
      </mesh>
      <group ref={armRef}>
        {/* pivot */}
        <mesh position={[0, size * 0.26, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.16, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* lower arm */}
        <mesh position={[0, size * 0.55, 0]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.5, size * 0.14]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* elbow joint */}
        <mesh position={[0, size * 0.82, size * 0.1]} castShadow>
          <sphereGeometry args={[size * 0.1, 8, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* upper arm */}
        <mesh position={[0, size * 1.06, size * 0.2]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.11, size * 0.45, size * 0.11]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* claw */}
        <group ref={clawRef} position={[0, size * 1.32, size * 0.35]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * size * 0.08, 0, size * 0.06]} rotation={[0, 0, side * 0.3]} castShadow>
              <boxGeometry args={[size * 0.05, size * 0.18, size * 0.06]} />
              <meshStandardMaterial color="#37474f" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

export function OilDrum({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#2c3e50'
  return (
    <group position={pos}>
      {/* drum body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.76, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size * 0.77, 0]} castShadow>
        <cylinderGeometry args={[size * 0.29, size * 0.29, size * 0.05, 12]} />
        <meshStandardMaterial color="#1a252f" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* bands */}
      {[0.2, 0.55].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * 0.29, size * 0.29, size * 0.05, 12]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* label */}
      <mesh position={[size * 0.28, size * 0.38, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.25, size * 0.01]} />
        <meshStandardMaterial color="#e8c84a" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Crane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const hookRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (hookRef.current) hookRef.current.position.y = pos[1] + size * 0.6 + Math.sin(Date.now() * 0.001) * size * 0.15
  })
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* mast */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 1.6, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* horizontal boom */}
      <mesh position={[size * 0.45, size * 1.6, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.12, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* counterweight boom */}
      <mesh position={[-size * 0.28, size * 1.6, 0]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.1, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* counterweight */}
      <mesh position={[-size * 0.5, size * 1.52, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.22, size * 0.22]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* cable */}
      <mesh position={[size * 0.6, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 4]} />
        <meshStandardMaterial color="#555" roughness={0.6} />
      </mesh>
      {/* hook */}
      <group ref={hookRef} position={[size * 0.6, size * 0.6, 0]}>
        <mesh castShadow>
          <torusGeometry args={[size * 0.08, size * 0.025, 5, 12, Math.PI * 1.3]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.1, size * 0.6]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Retro/Arcade ─────────────────────────────────────────

export function ArcadeMachine({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2
    }
  })
  const c = color || '#1a1a2e'
  return (
    <group position={pos}>
      {/* cabinet */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 1.2, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* screen bezel */}
      <mesh position={[0, size * 0.9, size * 0.23]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.38, size * 0.05]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.9, size * 0.255]}>
        <boxGeometry args={[size * 0.37, size * 0.3, size * 0.01]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      {/* marquee top */}
      <mesh position={[0, size * 1.18, size * 0.16]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.22]} />
        <meshStandardMaterial color={color || '#e91e63'} roughness={0.4} emissive={color || '#e91e63'} emissiveIntensity={0.1} />
      </mesh>
      {/* control panel */}
      <mesh position={[0, size * 0.55, size * 0.2]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.28, size * 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      {/* joystick */}
      <mesh position={[-size * 0.1, size * 0.62, size * 0.26]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.1, 6]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* buttons */}
      {[0.05, 0.14, 0.23].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, size * 0.26]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.04, 8]} />
          <meshStandardMaterial color={['#e74c3c', '#27ae60', '#2980b9'][i]} roughness={0.3} emissive={['#e74c3c', '#27ae60', '#2980b9'][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* base */}
      <mesh position={[0, size * 0.03, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.06, size * 0.5]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function RetroTv({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.003) * 0.15
    }
  })
  const c = color || '#c8b99a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.62, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* screen recess */}
      <mesh position={[-size * 0.1, size * 0.5, size * 0.26]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[-size * 0.1, size * 0.5, size * 0.275]}>
        <boxGeometry args={[size * 0.42, size * 0.34, size * 0.01]} />
        <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
      {/* knobs */}
      {[0.25, 0.3].map((y, i) => (
        <mesh key={i} position={[size * 0.28, y * size + size * 0.3, size * 0.26]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.06, 8]} />
          <meshStandardMaterial color="#555" roughness={0.4} />
        </mesh>
      ))}
      {/* antenna */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.85, size * 0.1]} rotation={[0, 0, x * 3]} castShadow>
          <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.5, 4]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* legs */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.07, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.14, size * 0.42]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function CassetteTape({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const reelRef1 = useRef<THREE.Mesh>(null!)
  const reelRef2 = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (reelRef1.current) reelRef1.current.rotation.z += dt * 1.5
    if (reelRef2.current) reelRef2.current.rotation.z += dt * 1.5
  })
  const c = color || '#1a1a1a'
  return (
    <group position={pos} rotation={[Math.PI / 2, 0, 0]}>
      {/* case body */}
      <mesh position={[0, 0, -size * 0.05]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.5, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* label */}
      <mesh position={[0, size * 0.04, -size * -0.003]}>
        <boxGeometry args={[size * 0.55, size * 0.28, size * 0.01]} />
        <meshStandardMaterial color={color || '#e74c3c'} roughness={0.5} />
      </mesh>
      {/* window */}
      <mesh position={[0, -size * 0.1, size * 0.02]}>
        <boxGeometry args={[size * 0.48, size * 0.16, size * 0.01]} />
        <meshStandardMaterial color="#333" roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* reels */}
      <mesh ref={reelRef1} position={[-size * 0.17, -size * 0.1, size * 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.04, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh ref={reelRef2} position={[size * 0.17, -size * 0.1, size * 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.04, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function GameController({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#222'
  return (
    <group position={pos} rotation={[-0.3, 0, 0]}>
      {/* body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.16, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* handles */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.27, size * 0.15, size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.26, size * 0.22]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      ))}
      {/* d-pad */}
      {[[0, 0], [0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]].map(([x, z], i) => (
        <mesh key={i} position={[-size * 0.2 + x * size, size * 0.37, z * size]} castShadow>
          <boxGeometry args={[i === 0 ? size * 0.06 : size * 0.13, size * 0.02, i === 0 ? size * 0.13 : size * 0.06]} />
          <meshStandardMaterial color="#555" roughness={0.4} />
        </mesh>
      ))}
      {/* buttons */}
      {[['#e74c3c', 0.14, 0], ['#27ae60', 0.08, -0.06], ['#2980b9', 0.2, -0.06], ['#f39c12', 0.08, 0.06]].map(([col, x, z], i) => (
        <mesh key={i} position={[size * (x as number), size * 0.37, size * (z as number)]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.03, 8]} />
          <meshStandardMaterial color={col as string} roughness={0.3} emissive={col as string} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* analog sticks */}
      {[[-0.12, -0.04], [0.08, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.37, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.03, 10]} />
          <meshStandardMaterial color="#444" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function PixelHeart({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const heartRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const s = 1 + Math.abs(Math.sin(Date.now() * 0.004)) * 0.12
    if (heartRef.current) heartRef.current.scale.set(s, s, s)
  })
  const c = color || '#e74c3c'
  // pixel art heart grid (5x4)
  const pixels = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ]
  return (
    <group position={pos}>
      <group ref={heartRef} position={[0, size * 0.5, 0]}>
        {pixels.map((row, ri) =>
          row.map((cell, ci) => cell ? (
            <mesh key={`${ri}-${ci}`} position={[(ci - 2) * size * 0.13, (2 - ri) * size * 0.13, 0]} castShadow>
              <boxGeometry args={[size * 0.12, size * 0.12, size * 0.1]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
          ) : null)
        )}
      </group>
    </group>
  )
}

// ─── Nature 2 ─────────────────────────────────────────────

export function Waterfall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.55 + Math.sin(Date.now() * 0.004) * 0.1
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* cliff rock */}
      <mesh position={[0, size * 0.72, -size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.8, size * 1.44, size * 0.4]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
      </mesh>
      {/* water stream */}
      <mesh ref={waterRef} position={[0, size * 0.4, size * 0.02]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.8, size * 0.08]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} roughness={0.1} transparent opacity={0.65} />
      </mesh>
      {/* splash pool */}
      <mesh position={[0, size * 0.04, size * 0.12]} receiveShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.08, 12]} />
        <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* foam */}
      <mesh position={[0, size * 0.09, size * 0.12]}>
        <sphereGeometry args={[size * 0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0.5} transparent opacity={0.5} />
      </mesh>
      {/* side rocks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.48, size * 0.18, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.36, size * 0.3]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function LotusPond({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const lilyRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (lilyRef.current) lilyRef.current.rotation.y += 0.003
  })
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* pond water */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.75, size * 0.75, size * 0.1, 16]} />
        <meshStandardMaterial color="#1a7abf" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* pond rim */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <torusGeometry args={[size * 0.75, size * 0.08, 4, 20]} />
        <meshStandardMaterial color="#8b7a5a" roughness={0.8} />
      </mesh>
      {/* lily pads */}
      <group ref={lilyRef}>
        {[0, 1.2, 2.5, 4.0].map((a, i) => (
          <group key={i} position={[Math.cos(a) * size * 0.42, size * 0.1, Math.sin(a) * size * 0.42]}>
            <mesh rotation={[-Math.PI / 2, 0, a]} receiveShadow>
              <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.02, 12]} />
              <meshStandardMaterial color={c} roughness={0.6} />
            </mesh>
            {/* lotus flower */}
            {i % 2 === 0 && (
              <group position={[0, size * 0.06, 0]}>
                {[0, 1, 2, 3, 4].map((pi) => {
                  const pa = (pi / 5) * Math.PI * 2
                  return (
                    <mesh key={pi} position={[Math.cos(pa) * size * 0.08, 0, Math.sin(pa) * size * 0.08]} rotation={[0.4, pa, 0]} castShadow>
                      <coneGeometry args={[size * 0.05, size * 0.12, 4]} />
                      <meshStandardMaterial color="#e91e8c" roughness={0.5} />
                    </mesh>
                  )
                })}
                {/* center */}
                <mesh position={[0, size * 0.04, 0]} castShadow>
                  <sphereGeometry args={[size * 0.04, 6, 6]} />
                  <meshStandardMaterial color="#f8d74a" roughness={0.4} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

export function Volcano({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const lavaRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (lavaRef.current) {
      const mat = lavaRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.3
    }
  })
  const c = color || '#5a3020'
  return (
    <group position={pos}>
      {/* volcano body */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <coneGeometry args={[size * 0.75, size * 1.1, 10]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* crater rim */}
      <mesh position={[0, size * 1.12, 0]} castShadow>
        <torusGeometry args={[size * 0.2, size * 0.08, 6, 14]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.9} />
      </mesh>
      {/* lava pool */}
      <mesh ref={lavaRef} position={[0, size * 1.07, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.06, 10]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      {/* lava drips */}
      {[0.6, 1.4, 2.2, 3.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.2, size * 0.95, Math.sin(a) * size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.06, 5, 5]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2000" emissiveIntensity={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* rocks at base */}
      {[0, 1.1, 2.2, 3.3, 4.4, 5.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.62, size * 0.08, Math.sin(a) * size * 0.62]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.14, size * 0.14]} />
          <meshStandardMaterial color="#4a3020" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function Geyser({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const steamRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.002
    const active = Math.sin(t) > 0.3
    if (steamRef.current) {
      steamRef.current.visible = active
      steamRef.current.scale.y = active ? 1 + Math.sin(t * 3) * 0.2 : 1
    }
  })
  const c = color || '#88ccff'
  return (
    <group position={pos}>
      {/* rock mound */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <coneGeometry args={[size * 0.45, size * 0.36, 8]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
      </mesh>
      {/* vent hole */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.06, 8]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      {/* steam/water jet */}
      <group ref={steamRef} position={[0, size * 0.42, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * size * 0.28, 0]}>
            <cylinderGeometry args={[size * (0.12 - i * 0.03), size * (0.1 - i * 0.02), size * 0.3, 6]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.2} roughness={0.2} transparent opacity={0.7 - i * 0.15} />
          </mesh>
        ))}
        <mesh position={[0, size * 0.9, 0]}>
          <sphereGeometry args={[size * 0.16, 6, 6]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.3} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* mineral deposits */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.06, Math.sin(a) * size * 0.3]}>
          <boxGeometry args={[size * 0.1, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color="#c8b88a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function CaveEntrance({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* cliff face */}
      <mesh position={[0, size * 0.7, -size * 0.25]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size * 1.4, size * 0.5]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
      </mesh>
      {/* cave opening - dark box inside */}
      <mesh position={[0, size * 0.42, -size * 0.04]}>
        <boxGeometry args={[size * 0.62, size * 0.84, size * 0.38]} />
        <meshStandardMaterial color="#0a0808" roughness={1.0} />
      </mesh>
      {/* arch top */}
      <mesh position={[0, size * 0.88, -size * 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.31, size * 0.31, size * 0.38, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#0a0808" roughness={1.0} />
      </mesh>
      {/* stalactites */}
      {[-0.18, -0.05, 0.12, 0.22].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.88 - i * size * 0.05, -size * 0.06]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.04, size * (0.16 + i * 0.04), 5]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>
      ))}
      {/* ground rocks */}
      {[-0.45, 0.45, -0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, size * 0.05]} castShadow>
          <boxGeometry args={[size * (0.15 + i * 0.03), size * 0.2, size * 0.2]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
        </mesh>
      ))}
      {/* eerie glow inside */}
      <mesh position={[0, size * 0.42, -size * 0.2]}>
        <sphereGeometry args={[size * 0.15, 6, 6]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244ff" emissiveIntensity={0.6} roughness={0.3} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
