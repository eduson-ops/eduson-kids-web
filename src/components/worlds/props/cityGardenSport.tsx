import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── City ─────────────────────────────────────────────────────────────────

export function TrafficLight({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<number>(0)
  const [phase, setPhase] = useState(0)
  useFrame((_, dt) => {
    ref.current += dt
    if (ref.current > 2.5) { ref.current = 0; setPhase((p) => (p + 1) % 3) }
  })
  const lights = ['#ff5464', '#ffd644', '#48c774']
  const activeIdx = [0, 1, 2][phase]
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.045, size * 0.055, size * 1.0, 8]} />
        <meshStandardMaterial color={color || '#2a3340'} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* housing */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.52, size * 0.16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* lights */}
      {lights.map((lc, i) => (
        <mesh key={i} position={[0, size * (1.08 - i * 0.16), size * 0.09]} castShadow>
          <sphereGeometry args={[size * 0.065, 10, 8]} />
          <meshStandardMaterial color={lc} roughness={0.3}
            emissive={activeIdx === i ? lc : '#000'} emissiveIntensity={activeIdx === i ? 1.5 : 0} />
        </mesh>
      ))}
      {activeIdx === 0 && <pointLight position={[0, size * 1.08, size * 0.1]} color="#ff5464" intensity={0.6} distance={3} />}
      {activeIdx === 2 && <pointLight position={[0, size * 0.76, size * 0.1]} color="#48c774" intensity={0.6} distance={3} />}
    </group>
  )
}

export function FireHydrant({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.25, size * 0.1, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* body */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.35, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.44, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.18, size * 0.12, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* cap */}
      <mesh position={[0, size * 0.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.08, 10]} />
        <meshStandardMaterial color="#e0c000" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* nozzle caps */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.19, size * 0.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.08, 8]} />
          <meshStandardMaterial color="#e0c000" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function Mailbox({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.55, size * 0.08]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* box body */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.26, size * 0.22]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* rounded top (half cylinder) */}
      <mesh position={[0, size * 0.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.13, size * 0.13, size * 0.22, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* slot */}
      <mesh position={[0, size * 0.6, size * 0.115]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.03, size * 0.01]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
      {/* door handle */}
      <mesh position={[size * 0.165, size * 0.5, 0]} castShadow>
        <sphereGeometry args={[size * 0.03, 6, 6]} />
        <meshStandardMaterial color="#e0c000" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function StreetLamp({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a3a3a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.2, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* curved arm */}
      <mesh position={[size * 0.15, size * 1.15, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.38, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* lamp housing */}
      <mesh position={[size * 0.28, size * 1.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.08, size * 0.16, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* glass */}
      <mesh position={[size * 0.28, size * 1.14, 0]} castShadow>
        <sphereGeometry args={[size * 0.09, 10, 8]} />
        <meshStandardMaterial color="#fff3d8" roughness={0.1} transparent opacity={0.85}
          emissive="#fff3d8" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[size * 0.28, size * 1.14, 0]} color="#fff3d8" intensity={1.2} distance={5} />
      {/* base */}
      <mesh position={[0, -size * 0.02, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.08, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function PhoneBooth({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.1, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* walls — 3 sides (front open) */}
      {/* back */}
      <mesh position={[0, size * 0.55, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.6, size * 1.0, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* sides */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.28, size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.04, size * 1.0, size * 0.56]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      {/* glass panels (sides) */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.25, size * 0.6, size * 0.06]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.7, size * 0.42]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.1} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* roof */}
      <mesh position={[0, size * 1.07, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.12, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* roof crown */}
      <mesh position={[0, size * 1.14, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.22]} />
        <meshStandardMaterial color="#e0c000" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* phone handset */}
      <mesh position={[-size * 0.05, size * 0.56, -size * 0.24]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* coin slot */}
      <mesh position={[size * 0.08, size * 0.7, -size * 0.24]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.02, size * 0.02]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Garden ───────────────────────────────────────────────────────────────

export function WateringCan({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* main body (oval-ish box) */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.38, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* spout pipe */}
      <mesh position={[size * 0.32, size * 0.08, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[size * 0.055, size * 0.065, size * 0.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* rose (sprinkle head) */}
      <mesh position={[size * 0.52, -size * 0.08, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.06, size * 0.06, 10]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* handle arc */}
      <mesh position={[-size * 0.04, size * 0.38, 0]} rotation={[0, 0, 0.3]} castShadow>
        <torusGeometry args={[size * 0.2, size * 0.035, 8, 14, Math.PI * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 0.05, 10]} />
        <meshStandardMaterial color="#3a7ace" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}

export function BirdBath({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const stone = color || '#a9d8ff'
  return (
    <group position={pos}>
      {/* pedestal */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.15, 10]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.1, size * 0.18, 10]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
      </mesh>
      {/* basin */}
      <mesh position={[0, size * 0.34, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.28, size * 0.12, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
      {/* water */}
      <mesh position={[0, size * 0.41, 0]}>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.04, 14]} />
        <meshStandardMaterial color={stone} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* base plate */}
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.24, size * 0.06, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function GardenGnome({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const hatColor = color || '#ff5464'
  return (
    <group position={pos}>
      {/* shoes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.07, size * 0.03, size * 0.04]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.08, size * 0.18]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* legs */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.07, size * 0.15, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.065, size * 0.18, 8]} />
          <meshStandardMaterial color="#4c7cb0" roughness={0.9} />
        </mesh>
      ))}
      {/* body */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.25, size * 0.22]} />
        <meshStandardMaterial color="#c84848" roughness={0.8} />
      </mesh>
      {/* jacket/belt */}
      <mesh position={[0, size * 0.2, size * 0.115]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.06, size * 0.02]} />
        <meshStandardMaterial color="#3a2000" roughness={0.9} />
      </mesh>
      {/* beard */}
      <mesh position={[0, size * 0.35, size * 0.12]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.14, size * 0.04]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.48, 0]} castShadow>
        <sphereGeometry args={[size * 0.15, 10, 8]} />
        <meshStandardMaterial color="#f5c87a" roughness={0.8} />
      </mesh>
      {/* eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.055, size * 0.5, size * 0.14]} castShadow>
          <sphereGeometry args={[size * 0.025, 6, 6]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, size * 0.46, size * 0.15]} castShadow>
        <sphereGeometry args={[size * 0.03, 6, 6]} />
        <meshStandardMaterial color="#e0a050" roughness={0.8} />
      </mesh>
      {/* hat brim */}
      <mesh position={[0, size * 0.63, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.04, 12]} />
        <meshStandardMaterial color={hatColor} roughness={0.8} />
      </mesh>
      {/* hat cone */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <coneGeometry args={[size * 0.16, size * 0.4, 12]} />
        <meshStandardMaterial color={hatColor} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function FlowerBed({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flowerColor = color || '#ff5ab1'
  const flowerPositions: Array<[number, number]> = [
    [0, 0], [-0.18, 0.12], [0.18, -0.1], [-0.08, -0.16], [0.12, 0.14],
    [0.22, 0.02], [-0.22, -0.06], [0, 0.18], [-0.16, 0.06],
  ]
  return (
    <group position={pos}>
      {/* soil bed */}
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#6b3d00" roughness={0.95} />
      </mesh>
      {/* border stones */}
      {[0, 1, 2, 3].map((i) => {
        const xSigns = [-1, 1, 0, 0]
        const zSigns = [0, 0, -1, 1]
        return (
          <mesh key={i} position={[xSigns[i] * size * 0.36, size * 0.02, zSigns[i] * size * 0.26]} castShadow>
            <boxGeometry args={i < 2 ? [size * 0.06, size * 0.12, size * 0.54] : [size * 0.76, size * 0.12, size * 0.06]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
          </mesh>
        )
      })}
      {/* flowers */}
      {flowerPositions.map(([x, z], i) => (
        <group key={i} position={[x * size, size * 0.08, z * size]}>
          {/* stem */}
          <mesh castShadow>
            <cylinderGeometry args={[size * 0.02, size * 0.025, size * 0.18, 6]} />
            <meshStandardMaterial color="#5ba55b" roughness={0.85} />
          </mesh>
          {/* petals */}
          <mesh position={[0, size * 0.1, 0]} castShadow>
            <sphereGeometry args={[size * 0.07, 8, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? flowerColor : '#FFD43C'} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Trellis({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = color || '#8b5a2b'
  const verts = 4
  const horiz = 5
  return (
    <group position={pos}>
      {/* vertical posts */}
      {Array.from({ length: verts }, (_, i) => (
        <mesh key={i} position={[(i / (verts - 1) - 0.5) * size * 0.8, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.035, size * 1.1, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* horizontal rails */}
      {Array.from({ length: horiz }, (_, i) => (
        <mesh key={i} position={[0, size * (i / (horiz - 1) * 0.9 + 0.05), 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.022, size * 0.022, size * 0.86, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* diagonal vines */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.5, 0]} rotation={[0, 0, s * 0.55]} castShadow>
          <cylinderGeometry args={[size * 0.016, size * 0.016, size * 1.1, 6]} />
          <meshStandardMaterial color="#5ba55b" roughness={0.9} />
        </mesh>
      ))}
      {/* leaf dots on vine */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={i} position={[y * size * 0.5, size * (0.5 + y * 0.35), size * 0.02]} castShadow>
          <sphereGeometry args={[size * 0.055, 6, 6]} />
          <meshStandardMaterial color="#48c774" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Sport-2 ──────────────────────────────────────────────────────────────

export function BasketballHoop({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff8c1a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.55, -size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.3, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* backboard */}
      <mesh position={[0, size * 1.0, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.5, size * 0.04]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>
      {/* backboard inner box */}
      <mesh position={[0, size * 0.92, -size * 0.26]} castShadow>
        <boxGeometry args={[size * 0.26, size * 0.2, size * 0.01]} />
        <meshStandardMaterial color="#ff5464" roughness={0.6} />
      </mesh>
      {/* arm */}
      <mesh position={[0, size * 1.0, -size * 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.36, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* hoop ring */}
      <mesh position={[0, size * 0.92, size * 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.025, 8, 18]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* net (approximated with cones) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.18, size * 0.82, Math.sin(a) * size * 0.06 + size * 0.06]}
            rotation={[0.2, a, 0]} castShadow>
            <cylinderGeometry args={[size * 0.012, size * 0.005, size * 0.22, 4]} />
            <meshStandardMaterial color="#f5f5f0" roughness={0.9} transparent opacity={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

export function BoxingGloves({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
  })
  return (
    <group position={pos}>
      <group ref={ref}>
        {/* glove pair side by side */}
        {[-1, 1].map((s, i) => (
          <group key={i} position={[s * size * 0.28, size * 0.35, 0]}>
            {/* main glove body */}
            <mesh castShadow>
              <boxGeometry args={[size * 0.35, size * 0.45, size * 0.28]} />
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
            {/* thumb bump */}
            <mesh position={[s * size * 0.18, size * 0.08, 0]} castShadow>
              <sphereGeometry args={[size * 0.1, 8, 8]} />
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
            {/* wrist cuff */}
            <mesh position={[0, -size * 0.26, 0]} castShadow>
              <cylinderGeometry args={[size * 0.16, size * 0.14, size * 0.14, 10]} />
              <meshStandardMaterial color="#f5f5f0" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      {/* string connecting them */}
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.6, 6]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ArcheryTarget({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const rings = [
    '#ff5464', '#ff8c1a', '#ffd644', '#48c774', '#4c97ff',
  ]
  return (
    <group position={pos}>
      {/* stand legs */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.22, size * 0.12, -size * 0.08 * s]} rotation={[s * 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.5, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
      {/* target face */}
      {rings.map((rc, i) => {
        const r = size * (0.42 - i * 0.075)
        return (
          <mesh key={i} position={[0, size * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[r, r, size * (0.015 - i * 0.001), 16]} />
            <meshStandardMaterial color={rc} roughness={0.7} />
          </mesh>
        )
      })}
      {/* bullseye */}
      <mesh position={[0, size * 0.5, size * 0.06]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.01, 16]} />
        <meshStandardMaterial color="#ff5464" roughness={0.6} emissive="#ff5464" emissiveIntensity={0.3} />
      </mesh>
      {/* arrow */}
      <mesh position={[size * 0.08, size * 0.5, size * 0.08]} rotation={[0.1, 0.1, 1.3]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.012, size * 0.4, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function SurfBoard({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#48c774'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
  })
  return (
    <group position={pos}>
      <group ref={ref} position={[0, size * 0.1, 0]}>
        {/* board body */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.22, size * 0.06, size * 0.85]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* nose taper */}
        <mesh position={[0, 0, size * 0.43]} castShadow>
          <coneGeometry args={[size * 0.11, size * 0.12, 6]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* tail notch */}
        <mesh position={[0, 0, -size * 0.43]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.06, size * 0.08]} />
          <meshStandardMaterial color="#2a8a5a" roughness={0.5} />
        </mesh>
        {/* stripe decoration */}
        <mesh position={[0, size * 0.035, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.01, size * 0.7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* fin */}
        <mesh position={[0, -size * 0.06, -size * 0.3]} castShadow>
          <boxGeometry args={[size * 0.03, size * 0.1, size * 0.12]} />
          <meshStandardMaterial color="#2a5a3a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export function Dumbbell({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#3a3a3a'
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 6]}>
      {/* handle bar */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.65, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* weight plates — left */}
      {[-0.38, -0.28].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * (0.22 - i * 0.03), size * (0.22 - i * 0.03), size * 0.06, 14]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* weight plates — right */}
      {[0.28, 0.38].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * (0.19 + i * 0.03), size * (0.19 + i * 0.03), size * 0.06, 14]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Food-2 ───────────────────────────────────────────────────────────────

export function Taco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const shellColor = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* shell (bent cylinder half) */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.6, 12, 1, false, -0.7, 2.5]} />
        <meshStandardMaterial color={shellColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* lettuce */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.08, size * 0.4]} />
        <meshStandardMaterial color="#5ba55b" roughness={0.9} />
      </mesh>
      {/* meat */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <boxGeometry args={[size * 0.46, size * 0.06, size * 0.34]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      {/* tomato dots */}
      {[-0.08, 0, 0.08].map((z, i) => (
        <mesh key={i} position={[size * 0.1, size * 0.3, z * size]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 6]} />
          <meshStandardMaterial color="#ff5464" roughness={0.8} />
        </mesh>
      ))}
      {/* cheese */}
      <mesh position={[-size * 0.08, size * 0.31, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.04, size * 0.36]} />
        <meshStandardMaterial color="#ffd644" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function RamenBowl({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bowlColor = color || '#ff9454'
  return (
    <group position={pos}>
      {/* bowl body */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.28, size * 0.28, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* soup */}
      <mesh position={[0, size * 0.19, 0]}>
        <cylinderGeometry args={[size * 0.36, size * 0.36, size * 0.02, 14]} />
        <meshStandardMaterial color={bowlColor} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* noodles */}
      {[-0.1, 0, 0.1].map((z, i) => (
        <mesh key={i} position={[size * (i - 1) * 0.08, size * 0.22, z * size]} rotation={[0, i * 0.4, 0.2]} castShadow>
          <torusGeometry args={[size * 0.14, size * 0.018, 6, 14]} />
          <meshStandardMaterial color="#f5f5e0" roughness={0.8} />
        </mesh>
      ))}
      {/* egg half */}
      <mesh position={[size * 0.14, size * 0.24, -size * 0.08]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5f5e0" roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.14, size * 0.24, -size * 0.08]}>
        <cylinderGeometry args={[size * 0.065, size * 0.065, size * 0.01, 10]} />
        <meshStandardMaterial color="#ffd644" roughness={0.5} />
      </mesh>
      {/* chopsticks */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.04, size * 0.36, 0]} rotation={[0.1, 0, s * 0.08]} castShadow>
          <cylinderGeometry args={[size * 0.012, size * 0.008, size * 0.6, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function BobaTea({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const liquidColor = color || '#c8841a'
  return (
    <group position={pos}>
      {/* cup */}
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.18, size * 0.65, 12]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* liquid */}
      <mesh position={[0, size * 0.24, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.175, size * 0.6, 12]} />
        <meshStandardMaterial color={liquidColor} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* boba pearls */}
      {[[-0.06, -0.06], [0.06, -0.1], [-0.04, 0.08], [0.08, 0.04], [0, -0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.06, z * size]} castShadow>
          <sphereGeometry args={[size * 0.04, 8, 8]} />
          <meshStandardMaterial color="#2a1200" roughness={0.7} />
        </mesh>
      ))}
      {/* lid */}
      <mesh position={[0, size * 0.59, 0]} castShadow>
        <cylinderGeometry args={[size * 0.24, size * 0.22, size * 0.05, 12]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} transparent opacity={0.8} />
      </mesh>
      {/* straw */}
      <mesh position={[size * 0.08, size * 0.78, 0]} rotation={[0.05, 0, 0.05]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.6, 6]} />
        <meshStandardMaterial color="#48c774" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Croissant({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* main body arc */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.1, 8, 14, Math.PI * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* horns */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.06, size * 0.05]}
          rotation={[Math.PI / 2, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.065, size * 0.22, 6]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* layers highlight */}
      {[-1, 0, 1].map((_, i) => (
        <mesh key={i} position={[0, size * (0.02 + i * 0.04), 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.28, size * 0.015, 4, 14, Math.PI * 1.1]} />
          <meshStandardMaterial color="#b08030" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function WatermelonSlice({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* slice wedge (half cylinder) */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* white rind */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* green outer skin */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.5, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5ba55b" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* seeds */}
      {[[-0.12, -0.08], [0.08, -0.14], [0.18, 0.04], [-0.06, 0.12], [0, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <sphereGeometry args={[size * 0.028, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* flat cut face */}
      <mesh position={[0, size * 0.06, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.12, size * 0.02]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// VEHICLES
// ═══════════════════════════════════════════════════════════

export function Helicopter({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bladeRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (bladeRef.current) bladeRef.current.rotation.y += dt * 8 })
  const c = color || '#5b8dee'
  return (
    <group position={pos}>
      {/* fuselage */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.32, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.45} metalness={0.2} />
      </mesh>
      {/* cockpit bubble */}
      <mesh position={[size * 0.28, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* tail boom */}
      <mesh position={[-size * 0.55, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.12, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.45} />
      </mesh>
      {/* tail rotor */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[-size * 0.82, size * 0.36, s * size * 0.14]} castShadow>
          <boxGeometry args={[size * 0.05, size * 0.28, size * 0.04]} />
          <meshStandardMaterial color="#ccc" roughness={0.3} />
        </mesh>
      ))}
      {/* main rotor mast */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.12, 6]} />
        <meshStandardMaterial color="#888" roughness={0.3} />
      </mesh>
      {/* main rotor blades */}
      <group ref={bladeRef} position={[0, size * 0.63, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * size * 0.42, 0, Math.sin(a) * size * 0.42]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[size * 0.78, size * 0.03, size * 0.1]} />
            <meshStandardMaterial color="#555" roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* skids */}
      {[-1, 1].map((s, i) => (
        <group key={i}>
          <mesh position={[s * size * 0.06, size * 0.14, s * size * 0.22]} castShadow>
            <boxGeometry args={[size * 0.04, size * 0.24, size * 0.04]} />
            <meshStandardMaterial color="#666" roughness={0.5} />
          </mesh>
          <mesh position={[0, size * 0.06, s * size * 0.22]} castShadow>
            <boxGeometry args={[size * 0.62, size * 0.04, size * 0.04]} />
            <meshStandardMaterial color="#666" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Bicycle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  const wheelColor = '#2a2a2a'
  return (
    <group position={pos}>
      {/* rear wheel */}
      <mesh position={[-size * 0.3, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.04, 8, 24]} />
        <meshStandardMaterial color={wheelColor} roughness={0.9} />
      </mesh>
      {/* front wheel */}
      <mesh position={[size * 0.3, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.04, 8, 24]} />
        <meshStandardMaterial color={wheelColor} roughness={0.9} />
      </mesh>
      {/* frame — down tube */}
      <mesh position={[0, size * 0.38, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[size * 0.05, size * 0.6, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* seat tube */}
      <mesh position={[-size * 0.08, size * 0.44, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[size * 0.05, size * 0.38, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* top tube */}
      <mesh position={[0, size * 0.58, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.05, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* seat */}
      <mesh position={[-size * 0.12, size * 0.65, 0]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.06, size * 0.1]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      {/* handlebar */}
      <mesh position={[size * 0.28, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* pedal crank (center) */}
      <mesh position={[0, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.1, 8]} />
        <meshStandardMaterial color="#666" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function Scooter({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#48c774'
  return (
    <group position={pos}>
      {/* deck */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* rear wheel */}
      <mesh position={[-size * 0.28, size * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* front wheel */}
      <mesh position={[size * 0.28, size * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* fork/stem */}
      <mesh position={[size * 0.28, size * 0.35, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.52, size * 0.05]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* handlebar */}
      <mesh position={[size * 0.26, size * 0.64, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.1, size * 0.36]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function HotRod({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* body low */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.26, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.25} metalness={0.45} />
      </mesh>
      {/* cab roof */}
      <mesh position={[-size * 0.1, size * 0.44, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.46]} />
        <meshStandardMaterial color={c} roughness={0.25} metalness={0.45} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.15, size * 0.46, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.2, size * 0.4]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* front bumper/grill */}
      <mesh position={[size * 0.58, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.07, size * 0.18, size * 0.44]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* exhaust pipes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.3, size * 0.22, s * size * 0.26]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.5, 8]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* wheels */}
      {[[-size*0.35, size*0.25], [size*0.38, size*0.25]].map(([x, y], i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, y, s * size * 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[size * 0.16, size * 0.06, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        ))
      ))}
    </group>
  )
}

export function Jeep({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#7d6e3a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.98, size * 0.3, size * 0.58]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* cab */}
      <mesh position={[-size * 0.05, size * 0.52, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 0.28, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* front grille */}
      <mesh position={[size * 0.5, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.22, size * 0.48]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      {/* headlights */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.51, size * 0.32, s * size * 0.17]} castShadow>
          <boxGeometry args={[size * 0.04, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color="#ffe88a" emissive="#ffe88a" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
      ))}
      {/* big wheels */}
      {[[-size*0.3, size*0.22], [size*0.3, size*0.22]].map(([x, y], i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, y, s * size * 0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[size * 0.22, size * 0.09, 8, 18]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
        ))
      ))}
      {/* roof rack */}
      <mesh position={[-size * 0.05, size * 0.68, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// BEACH
// ═══════════════════════════════════════════════════════════

export function Sandcastle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e6c96e'
  return (
    <group position={pos}>
      {/* base mound */}
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.6, size * 0.24, 12]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* main keep */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.42, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* battlements */}
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size*0.2, size*0.7, z*size*0.2]} castShadow>
          <boxGeometry args={[size*0.12, size*0.14, size*0.12]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}
      {/* corner towers */}
      {[[-0.24,-0.24],[-0.24,0.24],[0.24,-0.24],[0.24,0.24]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.48, z*size]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.12, size*0.52, 8]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}
      {/* cone tops on towers */}
      {[[-0.24,-0.24],[-0.24,0.24],[0.24,-0.24],[0.24,0.24]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.82, z*size]} castShadow>
          <coneGeometry args={[size*0.12, size*0.18, 8]} />
          <meshStandardMaterial color="#c4a050" roughness={0.9} />
        </mesh>
      ))}
      {/* gate */}
      <mesh position={[0, size*0.32, size*0.27]} castShadow>
        <boxGeometry args={[size*0.18, size*0.28, size*0.06]} />
        <meshStandardMaterial color="#8b6a20" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function BeachUmbrella({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff9f43'
  const stripes = ['#ffffff', c]
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* canopy segments (8 stripes alternating) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, size * 1.14, 0]} rotation={[0, (i * Math.PI) / 4, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.62, size * 0.06, 4, 1, false, 0, Math.PI / 4]} />
          <meshStandardMaterial color={stripes[i % 2]} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* pole tip cap */}
      <mesh position={[0, size * 1.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.065, 8, 6]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      {/* sand anchor stake */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.02, size * 0.12, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function LifeguardTower({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* 4 legs */}
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size*0.22, size*0.5, z*size*0.22]} castShadow>
          <boxGeometry args={[size*0.07, size*1.0, size*0.07]} />
          <meshStandardMaterial color="#c8a06a" roughness={0.8} />
        </mesh>
      ))}
      {/* platform floor */}
      <mesh position={[0, size*1.08, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.08, size*0.6]} />
        <meshStandardMaterial color="#c8a06a" roughness={0.85} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size*1.42, 0]} castShadow>
        <boxGeometry args={[size*0.54, size*0.66, size*0.54]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.7} />
      </mesh>
      {/* red roof */}
      <mesh position={[0, size*1.8, 0]} castShadow>
        <boxGeometry args={[size*0.62, size*0.1, size*0.62]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
      {/* window */}
      <mesh position={[size*0.28, size*1.46, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.26, size*0.28]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* steps */}
      {[0,1,2].map((i)=>(
        <mesh key={i} position={[0, size*(0.22+i*0.28), size*0.24]} castShadow>
          <boxGeometry args={[size*0.32, size*0.06, size*0.18]} />
          <meshStandardMaterial color="#c8a06a" roughness={0.85} />
        </mesh>
      ))}
      {/* flag */}
      <mesh position={[0, size*2.08, 0]} castShadow>
        <cylinderGeometry args={[size*0.02, size*0.02, size*0.44, 4]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      <mesh position={[size*0.12, size*2.26, 0]} castShadow>
        <boxGeometry args={[size*0.22, size*0.14, size*0.03]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
    </group>
  )
}

export function Buoy({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(clock.elapsedTime * 1.2) * size * 0.08
    }
  })
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {/* main float */}
        <mesh position={[0, size * 0.3, 0]} castShadow>
          <sphereGeometry args={[size * 0.32, 14, 10]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={0.15} />
        </mesh>
        {/* white band */}
        <mesh position={[0, size * 0.3, 0]} castShadow>
          <cylinderGeometry args={[size * 0.33, size * 0.33, size * 0.12, 14]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
        </mesh>
        {/* top cone */}
        <mesh position={[0, size * 0.62, 0]} castShadow>
          <coneGeometry args={[size * 0.14, size * 0.28, 10]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={0.15} />
        </mesh>
        {/* ring */}
        <mesh position={[0, size * 0.36, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.36, size * 0.04, 6, 16]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* light/signal on top */}
        <mesh position={[0, size * 0.92, 0]} castShadow>
          <sphereGeometry args={[size * 0.07, 8, 6]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffcc00" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* chain anchor */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.12, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function SurfboardRack({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const boards = ['#ff5464', '#4c97ff', '#48c774']
  return (
    <group position={pos}>
      {/* rack posts */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.32, size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.07, size * 1.1, size * 0.07]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* horizontal rails */}
      {[0.32, 0.72].map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]} castShadow>
          <boxGeometry args={[size * 0.7, size * 0.06, size * 0.07]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* 3 leaning surfboards */}
      {boards.map((bc, i) => (
        <mesh key={i} position={[(i - 1) * size * 0.18, size * 0.72, size * 0.12]} rotation={[0.12, 0, -0.08]} castShadow>
          <boxGeometry args={[size * 0.13, size * 1.1, size * 0.05]} />
          <meshStandardMaterial color={bc} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// ANCIENT
// ═══════════════════════════════════════════════════════════

export function Catapult({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const armRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.35 - 0.3
    }
  })
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* frame base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.8, size * 0.12, size * 0.36]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* side supports */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.36, s * size * 0.14]} rotation={[0, 0, 0.1 * s]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.5, size * 0.1]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* axle */}
      <mesh position={[0, size * 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.4, 8]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* swinging arm */}
      <group ref={armRef} position={[0, size * 0.56, 0]}>
        <mesh position={[0, size * 0.26, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.6, size * 0.1]} />
          <meshStandardMaterial color="#6a3a1a" roughness={0.85} />
        </mesh>
        {/* sling/bucket */}
        <mesh position={[0, size * 0.56, 0]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
        {/* counterweight */}
        <mesh position={[0, -size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.2, size * 0.2]} />
          <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
      {/* wheels */}
      {[-size*0.32, size*0.32].map((x, i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, size*0.12, s*size*0.2]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[size*0.12, size*0.12, size*0.07, 10]} />
            <meshStandardMaterial color="#5a3a10" roughness={0.9} />
          </mesh>
        ))
      ))}
    </group>
  )
}

export function BrokenColumn({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4c4a0'
  return (
    <group position={pos}>
      {/* base plinth */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.56, size * 0.16, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* lower shaft */}
      <mesh position={[0, size * 0.54, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.22, size * 0.72, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* broken mid section (tilted) */}
      <mesh position={[size * 0.08, size * 1.06, size * 0.06]} rotation={[0.18, 0.12, 0.22]} castShadow>
        <cylinderGeometry args={[size * 0.19, size * 0.2, size * 0.44, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* rubble pieces */}
      {[[0.28, 0.12, 0.2], [-0.22, 0.1, -0.18], [0.1, 0.08, -0.28]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[Math.random()*1.2, Math.random()*2, 0]} castShadow>
          <boxGeometry args={[size*0.14, size*0.1, size*0.16]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* fluting lines (grooves effect via thin planks) */}
      {Array.from({length: 8}).map((_,i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.2, size*0.54, Math.sin(a)*size*0.2]} rotation={[0,a,0]} castShadow>
            <boxGeometry args={[size*0.03, size*0.68, size*0.04]} />
            <meshStandardMaterial color="#c0b090" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Altar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#6a5a4a'
  return (
    <group position={pos}>
      {/* step base */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.16, size * 0.7]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      {/* main slab */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.78, size * 0.46, size * 0.58]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* top surface */}
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.1, size * 0.62]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.8} />
      </mesh>
      {/* rune carvings (decorative) */}
      {[[-0.22, 0.38, 0.3], [0.22, 0.38, 0.3], [0, 0.38, 0.3]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <boxGeometry args={[size*0.06, size*0.12, size*0.02]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
        </mesh>
      ))}
      {/* side pillars */}
      {[[-0.34,-0.34],[0.34,-0.34],[-0.34,0.34],[0.34,0.34]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.38, z*size]} castShadow>
          <boxGeometry args={[size*0.1, size*0.46, size*0.1]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.88} />
        </mesh>
      ))}
      {/* flame effect on top */}
      <mesh position={[0, size*0.78, 0]} castShadow>
        <coneGeometry args={[size*0.1, size*0.24, 6]} />
        <meshStandardMaterial color="#ff8c1a" emissive="#ff5000" emissiveIntensity={1.2} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function Sarcophagus({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8a84a'
  return (
    <group position={pos} rotation={[0.1, 0, 0]}>
      {/* base/body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.76, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* head part — wider */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* headdress */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.22, size * 0.38]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
      {/* face mask eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size*0.74, s*size*0.12]} castShadow>
          <boxGeometry args={[size*0.05, size*0.06, size*0.1]} />
          <meshStandardMaterial color="#2a1a00" roughness={0.8} />
        </mesh>
      ))}
      {/* blue/teal decoration bands */}
      {[0.2, 0.42, 0.62].map((h, i) => (
        <mesh key={i} position={[size*0.2, h*size, 0]} castShadow>
          <boxGeometry args={[size*0.04, size*0.08, size*0.54]} />
          <meshStandardMaterial color="#2266cc" roughness={0.3} metalness={0.3} />
        </mesh>
      ))}
      {/* crook/flail cross emblem */}
      <mesh position={[size*0.2, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.22, size*0.06]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[size*0.2, size*0.58, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.06, size*0.18]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function ColosseumArch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c4a882'
  return (
    <group position={pos}>
      {/* left pillar */}
      <mesh position={[-size * 0.38, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 1.4, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* right pillar */}
      <mesh position={[size * 0.38, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 1.4, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* top beam */}
      <mesh position={[0, size * 1.44, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.2, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* arch curve (torus half) */}
      <mesh position={[0, size * 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.3, size * 0.1, 8, 16, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* classical capital on pillar tops */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 1.38, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.12, size * 0.36]} />
          <meshStandardMaterial color="#d4c0a0" roughness={0.8} />
        </mesh>
      ))}
      {/* base plinths */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.16, size * 0.38]} />
          <meshStandardMaterial color="#b8a078" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// UNDERWATER
// ═══════════════════════════════════════════════════════════

export function Shipwreck({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4a6a5a'
  return (
    <group position={pos} rotation={[0.15, 0.3, 0.25]}>
      {/* hull */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.44, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* hull bottom rounded */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.28, size * 1.1, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#3a5a4a" roughness={0.92} />
      </mesh>
      {/* broken mast */}
      <mesh position={[size * 0.1, size * 0.7, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.9, 6]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
      </mesh>
      {/* deck planks */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * size * 0.28, size * 0.46, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.06, size * 0.42]} />
          <meshStandardMaterial color="#5a4a30" roughness={0.88} />
        </mesh>
      ))}
      {/* coral/algae on hull */}
      {[[0.3, 0.18, 0.22], [-0.38, 0.14, -0.2], [0, 0.08, 0.22]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <sphereGeometry args={[size*0.08, 6, 5]} />
          <meshStandardMaterial color="#ff6b8a" roughness={0.8} />
        </mesh>
      ))}
      {/* porthole */}
      <mesh position={[size*0.28, size*0.28, size*0.23]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[size*0.07, size*0.02, 6, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function TreasureChestOpen({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* chest base */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.44, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* metal bands */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x*size, size*0.22, 0]} castShadow>
          <boxGeometry args={[size*0.06, size*0.46, size*0.46]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* lid open (tilted back) */}
      <mesh position={[0, size * 0.54, -size * 0.16]} rotation={[-Math.PI * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.14, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* lock */}
      <mesh position={[0, size*0.36, size*0.23]} castShadow>
        <boxGeometry args={[size*0.1, size*0.12, size*0.04]} />
        <meshStandardMaterial color="#c8a030" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* gold coins spilling out */}
      {[[-0.12, 0.48, 0.14], [0.14, 0.46, 0.16], [0, 0.44, 0.18], [0.22, 0.42, 0.12], [-0.08, 0.46, 0.2]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[Math.random()*0.8, Math.random()*Math.PI, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.06, size*0.03, 10]} />
          <meshStandardMaterial color="#ffd43c" emissive="#cc8800" emissiveIntensity={0.2} roughness={0.2} metalness={0.7} />
        </mesh>
      ))}
      {/* gems inside */}
      {[[0, 0.42, 0], [-0.18, 0.42, 0], [0.18, 0.42, 0]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <octahedronGeometry args={[size*0.07]} />
          <meshStandardMaterial color={['#ff4444','#4488ff','#44cc44'][i]} roughness={0.05} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function Anemone({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const waveRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (waveRef.current) {
      const t = clock.elapsedTime
      waveRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(t * 1.5 + i * 0.8) * 0.3
        child.rotation.z = Math.cos(t * 1.2 + i * 0.6) * 0.25
      })
    }
  })
  const c = color || '#ff6b8a'
  return (
    <group position={pos}>
      {/* base disc */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.34, size * 0.12, 10]} />
        <meshStandardMaterial color="#cc4466" roughness={0.85} />
      </mesh>
      {/* tentacles */}
      <group ref={waveRef} position={[0, size * 0.12, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const r = size * 0.18
          return (
            <mesh key={i} position={[Math.cos(a) * r, size * 0.22, Math.sin(a) * r]} castShadow>
              <cylinderGeometry args={[size * 0.025, size * 0.04, size * 0.44, 5]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          )
        })}
        {/* center tentacles */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.08, size * 0.28, Math.sin(a) * size * 0.08]} castShadow>
              <cylinderGeometry args={[size * 0.02, size * 0.03, size * 0.52, 5]} />
              <meshStandardMaterial color="#ff99bb" roughness={0.75} />
            </mesh>
          )
        })}
      </group>
      {/* mouth opening */}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color="#cc2244" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function SeaTurtle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const swimRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (swimRef.current) {
      swimRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * size * 0.06
      swimRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.08
    }
  })
  const c = color || '#48a887'
  return (
    <group position={pos}>
      <group ref={swimRef}>
        {/* shell */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <sphereGeometry args={[size * 0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={c} roughness={0.65} />
        </mesh>
        {/* shell pattern */}
        {[[0,0],[0.18,0.12],[-0.18,0.12],[0.1,-0.18],[-0.1,-0.18]].map(([x,z],i)=>(
          <mesh key={i} position={[x*size, size*0.44, z*size]} castShadow>
            <boxGeometry args={[size*0.12, size*0.04, size*0.12]} />
            <meshStandardMaterial color="#2d7a5a" roughness={0.7} />
          </mesh>
        ))}
        {/* head */}
        <mesh position={[size * 0.38, size * 0.26, 0]} castShadow>
          <sphereGeometry args={[size * 0.14, 10, 8]} />
          <meshStandardMaterial color="#3a8060" roughness={0.65} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[size*0.48, size*0.32, s*size*0.06]} castShadow>
            <sphereGeometry args={[size*0.03, 6, 4]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
        ))}
        {/* flippers */}
        {[[-0.12, 0.2, 0.34], [-0.12, 0.2, -0.34], [0.12, 0.2, 0.3], [0.12, 0.2, -0.3]].map(([x,y,z],i)=>(
          <mesh key={i} position={[x*size, y*size, z*size]} rotation={[0.3, 0, z>0 ? -0.4 : 0.4]} castShadow>
            <boxGeometry args={[size*0.26, size*0.06, size*0.16]} />
            <meshStandardMaterial color="#3a8060" roughness={0.7} />
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[-size * 0.36, size * 0.22, 0]} rotation={[0, 0, 0.15]} castShadow>
          <coneGeometry args={[size * 0.08, size * 0.22, 6]} />
          <meshStandardMaterial color="#3a8060" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export function Whale({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const swimRef = useRef<THREE.Group>(null!)
  const tailRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (swimRef.current) swimRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * size * 0.08
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.0) * 0.25
  })
  const c = color || '#2c3e6e'
  return (
    <group position={pos}>
      <group ref={swimRef}>
        {/* main body */}
        <mesh position={[0, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.55, 16, 10]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* head bulge */}
        <mesh position={[size * 0.48, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.36, 12, 8]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* belly (lighter color) */}
        <mesh position={[size * 0.1, size * 0.12, 0]} castShadow>
          <sphereGeometry args={[size * 0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color="#c8d8e8" roughness={0.6} />
        </mesh>
        {/* tail stock */}
        <mesh position={[-size * 0.58, size * 0.38, 0]} rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[size * 0.18, size * 0.28, size * 0.5, 10]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* tail fluke */}
        <mesh ref={tailRef} position={[-size * 0.82, size * 0.38, 0]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.08, size * 0.7]} />
          <meshStandardMaterial color={c} roughness={0.65} />
        </mesh>
        {/* dorsal fin */}
        <mesh position={[-size * 0.12, size * 0.82, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[size * 0.1, size * 0.28, 6]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* pectoral fins */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[size * 0.28, size * 0.2, s * size * 0.52]} rotation={[s * 0.4, 0, s * 0.3]} castShadow>
            <boxGeometry args={[size * 0.36, size * 0.06, size * 0.16]} />
            <meshStandardMaterial color={c} roughness={0.65} />
          </mesh>
        ))}
        {/* eye */}
        <mesh position={[size * 0.72, size * 0.46, size * 0.22]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 6]} />
          <meshStandardMaterial color="#fff" roughness={0.3} />
        </mesh>
        <mesh position={[size * 0.74, size * 0.46, size * 0.24]} castShadow>
          <sphereGeometry args={[size * 0.04, 8, 6]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
        {/* blowhole spout */}
        <mesh position={[size * 0.18, size * 0.96, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.3, 6]} />
          <meshStandardMaterial color="#88ddff" transparent opacity={0.7} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// FAIRGROUND
// ═══════════════════════════════════════════════════════════

export function PopcornStand({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* cart body */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.7, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.55} />
      </mesh>
      {/* glass case front */}
      <mesh position={[0, size * 0.55, size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.54, size * 0.04]} />
        <meshStandardMaterial color="#88ccff" roughness={0.05} transparent opacity={0.65} />
      </mesh>
      {/* popcorn pile inside */}
      {[[-0.12,0.6,0.06],[0.12,0.62,0.04],[0,0.64,0.05],[-0.06,0.56,0.08],[0.16,0.58,0.06]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <sphereGeometry args={[size*0.07, 5, 4]} />
          <meshStandardMaterial color="#ffe566" roughness={0.85} />
        </mesh>
      ))}
      {/* roof canopy stripes */}
      {Array.from({length:6}).map((_,i)=>(
        <mesh key={i} position={[(-0.25+i*0.1)*size, size*0.82, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.08, size*0.58]} />
          <meshStandardMaterial color={i%2===0 ? c : '#fff'} roughness={0.6} />
        </mesh>
      ))}
      {/* wheels */}
      {[-1,1].map((s,i)=>(
        <mesh key={i} position={[s*size*0.28, size*0.1, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.1, size*0.54, 10]} />
          <meshStandardMaterial color="#555" roughness={0.7} />
        </mesh>
      ))}
      {/* sign */}
      <mesh position={[0, size*0.96, 0]} castShadow>
        <boxGeometry args={[size*0.52, size*0.16, size*0.06]} />
        <meshStandardMaterial color="#fff5cc" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function BumperCar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.15
    }
  })
  const c = color || '#ffd644'
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {/* car body */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.68, size * 0.32, size * 0.52]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.15} />
        </mesh>
        {/* bumper rim (rubber) */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.76, size * 0.18, size * 0.6]} />
          <meshStandardMaterial color="#333" roughness={0.9} />
        </mesh>
        {/* seat backrest */}
        <mesh position={[-size * 0.12, size * 0.54, 0]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.32, size * 0.36]} />
          <meshStandardMaterial color={c} roughness={0.45} />
        </mesh>
        {/* steering wheel */}
        <mesh position={[size * 0.12, size * 0.6, 0]} rotation={[0.5, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.1, size * 0.025, 6, 12]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* pole/antenna */}
        <mesh position={[0, size * 1.0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 1.0, 6]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* top contact disc */}
        <mesh position={[0, size * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.08, size * 0.03, 6, 10]} />
          <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* floor wheels (4) */}
        {[[-0.26,-0.26],[0.26,-0.26],[-0.26,0.26],[0.26,0.26]].map(([x,z],i)=>(
          <mesh key={i} position={[x*size, size*0.07, z*size]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[size*0.07, size*0.07, size*0.06, 8]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function TicketBooth({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a29bfe'
  return (
    <group position={pos}>
      {/* base structure */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.58, size * 1.2, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.55} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size * 1.28, 0]} castShadow>
        <boxGeometry args={[size * 0.66, size * 0.14, size * 0.6]} />
        <meshStandardMaterial color="#7a6ace" roughness={0.5} />
      </mesh>
      {/* roof overhang front */}
      <mesh position={[0, size * 1.24, size * 0.32]} castShadow>
        <boxGeometry args={[size * 0.66, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#7a6ace" roughness={0.5} />
      </mesh>
      {/* ticket window */}
      <mesh position={[0, size * 0.72, size * 0.27]} castShadow>
        <boxGeometry args={[size * 0.36, size * 0.24, size * 0.04]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* ticket slot ledge */}
      <mesh position={[0, size * 0.54, size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.06, size * 0.14]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* TICKETS sign */}
      <mesh position={[0, size * 1.06, size * 0.27]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.14, size * 0.04]} />
        <meshStandardMaterial color="#ffea00" roughness={0.5} />
      </mesh>
      {/* stripe decoration */}
      {[-0.24, 0, 0.24].map((x, i) => (
        <mesh key={i} position={[x*size, size*0.24, size*0.27]} castShadow>
          <boxGeometry args={[size*0.06, size*0.44, size*0.03]} />
          <meshStandardMaterial color={i%2===0 ? '#fff' : c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function BalloonArch({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.children.forEach((child, i) => {
        (child as THREE.Group).position.y += Math.sin(clock.elapsedTime * 1.5 + i * 0.4) * 0.002 * size
      })
    }
  })
  const colors = ['#ff5464','#ffd644','#48c774','#4c97ff','#c879ff','#ff9f43']
  const archPositions: Array<[number, number, number]> = []
  const N = 12
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = (t - 0.5) * 2 * size * 0.9
    const y = size * (0.9 - 4 * (t - 0.5) ** 2 * 0.8)
    archPositions.push([x, y, 0])
  }
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {archPositions.map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            {/* main balloon */}
            <mesh castShadow>
              <sphereGeometry args={[size * 0.13, 10, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.45} />
            </mesh>
            {/* small accent balloon */}
            {i % 2 === 0 && (
              <mesh position={[0, -size * 0.2, 0]} castShadow>
                <sphereGeometry args={[size * 0.09, 8, 6]} />
                <meshStandardMaterial color={colors[(i + 2) % colors.length]} roughness={0.45} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

export function PrizeWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (wheelRef.current) wheelRef.current.rotation.z += dt * 0.5 })
  const c = color || '#6c5ce7'
  const segColors = ['#ff5464','#ffd644','#48c774','#4c97ff','#c879ff','#ff9f43','#ff5464','#ffd644']
  return (
    <group position={pos}>
      {/* support stand */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 1.2, size * 0.12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* base foot */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.32]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* spinning wheel */}
      <group ref={wheelRef} position={[0, size * 1.25, size * 0.08]}>
        {/* rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.5, size * 0.05, 8, 28]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* colored segments */}
        {segColors.map((sc, i) => {
          const a = (i / segColors.length) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3, 0]} rotation={[0, 0, a]} castShadow>
              <boxGeometry args={[size * 0.52, size * 0.12, size * 0.05]} />
              <meshStandardMaterial color={sc} roughness={0.5} />
            </mesh>
          )
        })}
        {/* spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} rotation={[0, 0, a]} castShadow>
              <boxGeometry args={[size * 0.98, size * 0.04, size * 0.04]} />
              <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.5} />
            </mesh>
          )
        })}
        {/* hub */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.1, 10]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
      {/* pointer */}
      <mesh position={[size * 0.52, size * 1.25, size * 0.1]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[size * 0.05, size * 0.16, 4]} />
        <meshStandardMaterial color="#e84040" roughness={0.4} />
      </mesh>
    </group>
  )
}
