import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Halloween ────────────────────────────────────────────
export function WitchHat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.2
    if (bob.current) bob.current.position.y = Math.sin(phase.current) * size * 0.06
  })
  return (
    <group ref={bob} position={pos}>
      {/* Brim */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.08, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Band */}
      <mesh position={[0, size * 0.14, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.09, 16]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* Buckle */}
      <mesh position={[size * 0.28, size * 0.14, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.09, size * 0.03]} />
        <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cone */}
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <coneGeometry args={[size * 0.28, size * 1.0, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Ghost({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.8
    if (bob.current) {
      bob.current.position.y = pos[1] + size * 0.3 + Math.sin(phase.current) * size * 0.12
      bob.current.rotation.z = Math.sin(phase.current * 0.6) * 0.08
    }
  })
  return (
    <group ref={bob} position={pos}>
      {/* Ghost body */}
      <mesh castShadow>
        <capsuleGeometry args={[size * 0.3, size * 0.4, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.88} />
      </mesh>
      {/* Wavy bottom */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * size * 0.2, -size * 0.36, 0]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.88} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.12, size * 0.08, size * 0.28]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 6]} />
          <meshStandardMaterial color="#2a1a3a" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function SpiderWeb({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const rings = [0.15, 0.28, 0.42, 0.55]
  const spokes = 8
  return (
    <group position={pos}>
      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={i} rotation={[0, (i / spokes) * Math.PI * 2, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.008, size * 0.008, size * 1.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      {/* Rings */}
      {rings.map((r, i) => (
        <mesh key={i} castShadow>
          <torusGeometry args={[size * r, size * 0.009, 4, spokes * 2]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      {/* Small spider in center */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.06, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Toys ─────────────────────────────────────────────────
export function TeddyBear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.35, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 0.52, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.2, size * 0.74, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 8, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* Snout */}
      <mesh position={[0, size * 0.48, size * 0.24]} castShadow>
        <sphereGeometry args={[size * 0.12, 8, 6]} />
        <meshStandardMaterial color="#d4a090" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.1, size * 0.56, size * 0.24]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
      ))}
      {/* Arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.44, size * 0.08, 0]} castShadow rotation={[0, 0, s * 0.6]}>
          <capsuleGeometry args={[size * 0.1, size * 0.24, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function LegoBrick({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const studs = [[-.25, .25], [.25, .25], [-.25, -.25], [.25, -.25], [0, 0]]
  return (
    <group position={pos}>
      {/* Main block */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.7, size * 0.4, size * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Studs on top */}
      {studs.map(([x = 0, z = 0], i) => (
        <mesh key={i} position={[x * size, size * 0.25, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function YoYo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 8
    if (spin.current) spin.current.rotation.x = phase.current
  })
  return (
    <group position={pos}>
      <group ref={spin}>
        {/* Two discs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, s * size * 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.1, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
        {/* Center axle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.24, 8]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      {/* String */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.01, size * 0.01, size * 0.72, 4]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Lab ──────────────────────────────────────────────────
export function Flask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.5
    if (bob.current) bob.current.position.y = pos[1] + Math.sin(phase.current) * size * 0.04
  })
  return (
    <group ref={bob} position={pos}>
      {/* Flask body */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.0} transparent opacity={0.75} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, -size * 0.12, 0]} castShadow>
        <sphereGeometry args={[size * 0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.1} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.18, size * 0.28, 10]} />
        <meshStandardMaterial color="#d0e8d0" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* Mouth rim */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.025, 6, 12]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Bubble effect */}
      <mesh position={[size * 0.12, size * 0.06, size * 0.12]} castShadow>
        <sphereGeometry args={[size * 0.06, 6, 4]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={3} decay={2} />
    </group>
  )
}

export function Atom({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.2
  })
  return (
    <group position={pos}>
      {/* Nucleus */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.14, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <group ref={spin}>
        {/* Three orbital rings */}
        {[0, 60, 120].map((deg, i) => (
          <group key={i} rotation={[0, (deg * Math.PI) / 180, (deg * Math.PI) / 180]}>
            <mesh castShadow>
              <torusGeometry args={[size * 0.42, size * 0.025, 6, 32]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Electron */}
            <mesh position={[size * 0.42, 0, 0]} castShadow>
              <sphereGeometry args={[size * 0.07, 8, 6]} />
              <meshStandardMaterial color="#88d4ff" roughness={0.2} emissive="#88d4ff" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <pointLight color={color} intensity={0.4} distance={3} decay={2} />
    </group>
  )
}

export function Gear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * 0.8
  })
  return (
    <group ref={spin} position={pos}>
      {/* Main disc */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.14, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Center hole */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.16, 12]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} />
      </mesh>
      {/* Teeth */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * size * 0.42, 0, Math.sin(angle) * size * 0.42]}
            rotation={[0, angle, 0]}
            castShadow
          >
            <boxGeometry args={[size * 0.12, size * 0.14, size * 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Weather props ──────────────────────────────────────────────────────────

export function RainCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 0.8) * 0.15
  })
  const c = color || '#6b8099'
  return (
    <group ref={ref} position={pos} castShadow>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[size * 0.45, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      <mesh position={[size * 0.4, size * 0.05, 0]}><sphereGeometry args={[size * 0.32, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      <mesh position={[-size * 0.38, 0, 0]}><sphereGeometry args={[size * 0.3, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x * size, -size * 0.6 - (i % 2) * size * 0.1, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.01, size * 0.2, 6]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[size * 0.15, -size * 0.55, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[size * 0.07, size * 0.3, size * 0.07]} />
        <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function LightningBolt({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(clock.elapsedTime * 4)) * 1.5
    }
  })
  const c = color || '#FFD43C'
  return (
    <group position={pos} castShadow>
      <mesh rotation={[0, 0, -0.4]} position={[size * 0.1, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.12, size * 0.5, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[0, 0, 0.8]} position={[-size * 0.05, 0, 0]}>
        <boxGeometry args={[size * 0.12, size * 0.35, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={ref} rotation={[0, 0, -0.3]} position={[size * 0.08, -size * 0.38, 0]}>
        <boxGeometry args={[size * 0.1, size * 0.4, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function RainbowArch({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bands = ['#ff5464', '#ff8c1a', '#FFD43C', '#48c774', '#4c97ff', '#c879ff']
  return (
    <group position={pos} castShadow>
      {bands.map((c, i) => {
        const r = size * (0.9 - i * 0.12)
        return (
          <mesh key={i}>
            <torusGeometry args={[r, size * 0.055, 8, 20, Math.PI]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Snowdrift({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#daeeff'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[size * 0.55, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[size * 0.5, -size * 0.12, 0]}><sphereGeometry args={[size * 0.35, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[-size * 0.48, -size * 0.1, 0]}><sphereGeometry args={[size * 0.32, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[0, -size * 0.35, 0]}><cylinderGeometry args={[size * 0.75, size * 0.85, size * 0.2, 12]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
    </group>
  )
}

export function SunDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = clock.elapsedTime * 0.3 })
  const c = color || '#FFD43C'
  const rays = 8
  return (
    <group position={pos}>
      <mesh castShadow>
        <sphereGeometry args={[size * 0.38, 14, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i / rays) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.62, Math.sin(angle) * size * 0.62, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[size * 0.08, size * 0.28, size * 0.06]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// ── Egypt props ────────────────────────────────────────────────────────────

export function Pyramid({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e8c97a'
  return (
    <group position={pos} castShadow>
      <mesh>
        <coneGeometry args={[size * 0.7, size * 1.0, 4]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.55, 0]}>
        <boxGeometry args={[size * 0.1, size * 0.1, size * 0.1]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function Sphinx({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8a84e'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.45, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[size * 0.2, -size * 0.15, size * 0.62]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.2, -size * 0.15, size * 0.62]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.45, size * 0.44]}>
        <boxGeometry args={[size * 0.42, size * 0.44, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.62, size * 0.38]}>
        <boxGeometry args={[size * 0.38, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#c8a84e" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.42, size * 0.65]}>
        <boxGeometry args={[size * 0.28, size * 0.28, size * 0.06]} />
        <meshStandardMaterial color="#d4b87a" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Obelisk({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4c060'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.38, size * 0.12, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 0.7, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 1.25, 4]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 1.4, 0]}>
        <coneGeometry args={[size * 0.14, size * 0.22, 4]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ── Candy props ────────────────────────────────────────────────────────────

export function Lollipop({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.6 })
  const c = color || '#ff5ab1'
  return (
    <group position={pos}>
      <mesh position={[0, -size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.7, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <group ref={ref} position={[0, size * 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.1, 24]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * size * 0.18, size * 0.06, Math.sin((i / 4) * Math.PI * 2) * size * 0.18]}>
            <boxGeometry args={[size * 0.08, size * 0.12, size * 0.08]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function CandyCane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.85, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.085, size * 0.085, size * 0.85, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} wireframe />
      </mesh>
      <mesh position={[size * 0.12, size * 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size * 0.12, size * 0.075, 8, 12, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Gingerbread({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.8, size * 0.55, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.62, size * 0.4, 4]} />
        <meshStandardMaterial color="#a05010" roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.63, size * 0.1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, -size * 0.1, size * 0.31]}>
        <boxGeometry args={[size * 0.18, size * 0.3, size * 0.04]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[-size * 0.24, size * 0.05, size * 0.31]}>
        <boxGeometry args={[size * 0.16, size * 0.16, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} />
      </mesh>
      <mesh position={[size * 0.24, size * 0.05, size * 0.31]}>
        <boxGeometry args={[size * 0.16, size * 0.16, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── Workshop props ─────────────────────────────────────────────────────────

export function Toolbox({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff8c1a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.85, size * 0.45, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.85, size * 0.08, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size * 0.12, size * 0.03, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.2, size * 0.23]}>
        <boxGeometry args={[size * 0.12, size * 0.08, size * 0.04]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function Anvil({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a3a3a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, -size * 0.25, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, -size * 0.08, 0]}>
        <boxGeometry args={[size * 0.3, size * 0.15, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.1, 0]}>
        <boxGeometry args={[size * 0.7, size * 0.18, size * 0.35]} />
        <meshStandardMaterial color={c} roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh position={[size * 0.42, size * 0.05, 0]}>
        <coneGeometry args={[size * 0.12, size * 0.28, 6]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function BarrelFire({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flame = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (flame.current) {
      flame.current.scale.y = 0.85 + Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.3
      flame.current.rotation.y = clock.elapsedTime * 2
    }
  })
  const c = color || '#4a3020'
  return (
    <group position={pos}>
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.28, size * 0.6, 10]} />
        <meshStandardMaterial color={c} roughness={0.8} metalness={0.3} />
      </mesh>
      {[-0.15, 0.15].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]}>
          <torusGeometry args={[size * 0.32, size * 0.03, 6, 14]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      <group ref={flame} position={[0, size * 0.42, 0]}>
        <mesh>
          <coneGeometry args={[size * 0.2, size * 0.55, 8]} />
          <meshStandardMaterial color="#ff5464" emissive="#ff2200" emissiveIntensity={1.2} roughness={0.3} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -size * 0.05, 0]}>
          <coneGeometry args={[size * 0.14, size * 0.4, 8]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={1.5} roughness={0.2} transparent opacity={0.9} />
        </mesh>
      </group>
      <pointLight position={[0, size * 0.6, 0]} color="#ff8820" intensity={1.2} distance={size * 4} />
    </group>
  )
}

// ── Art props ──────────────────────────────────────────────────────────────

export function Easel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      {[[-0.22, 0.25], [0.22, -0.25], [0, 0]].map(([x, rz], i) => (
        <mesh key={i} position={[(x ?? 0) * size, -size * 0.1, 0]} rotation={[0, 0, (rz ?? 0) * 0.5]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 6]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 0.05]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.35, size * 0.5, size * 0.03]}>
        <boxGeometry args={[size * 0.06, size * 0.57, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.35, size * 0.5, size * 0.03]}>
        <boxGeometry args={[size * 0.06, size * 0.57, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.225, size * 0.03]}>
        <boxGeometry args={[size * 0.72, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.775, size * 0.03]}>
        <boxGeometry args={[size * 0.72, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.08, size * 0.55, size * 0.05]}>
        <boxGeometry args={[size * 0.22, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#4c97ff" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.12, size * 0.4, size * 0.05]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#48c774" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Sculpture({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.25 })
  const c = color || '#b0b0b0'
  return (
    <group position={pos}>
      <mesh position={[0, -size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.22, size * 0.45]} />
        <meshStandardMaterial color="#d0c8c0" roughness={0.85} />
      </mesh>
      <group ref={ref} position={[0, size * 0.1, 0]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[size * 0.32]} />
          <meshStandardMaterial color={c} roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, size * 0.42, 0]} castShadow>
          <sphereGeometry args={[size * 0.18, 10, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[size * 0.28, size * 0.18, 0]} rotation={[0.4, 0, 0.8]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.04, size * 0.45, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export function VaseAncient({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, -size * 0.55, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 0.1, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, -size * 0.2, 0]}>
        <cylinderGeometry args={[size * 0.35, size * 0.14, size * 0.6, 14]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.25, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.35, size * 0.45, 14]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.55, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.2, size * 0.22, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.68, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.04, 8, 14]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.38, size * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.14, size * 0.04, 8, 10, Math.PI]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, -size * 0.05, 0]}>
        <torusGeometry args={[size * 0.36, size * 0.025, 8, 18]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
    </group>
  )
}
