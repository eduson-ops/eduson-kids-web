import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 33 · Farm + Industrial Port ───────────────────────────────────────

interface P33 { pos: [number,number,number]; color: string; size: number }

export function FarmHayBale({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* bale */}
      <mesh position={[0, size*0.28, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[size*0.35, size*0.35, size*0.6, 10]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* string bands */}
      {([-0.15, 0.15] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.28, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.36, size*0.02, 5, 10]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function ChickenCoop({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* structure */}
      <mesh position={[0, size*0.38, 0]}>
        <boxGeometry args={[size*1.0, size*0.75, size*0.7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* slanted roof */}
      <mesh position={[-size*0.12, size*0.82, 0]}>
        <boxGeometry args={[size*1.3, size*0.08, size*0.85]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* chicken wire front */}
      <mesh position={[0, size*0.38, size*0.36]}>
        <boxGeometry args={[size*0.88, size*0.6, size*0.03]} />
        <meshStandardMaterial color="#ccaa66" transparent opacity={0.5} wireframe />
      </mesh>
      {/* door */}
      <mesh position={[-size*0.3, size*0.22, size*0.37]}>
        <boxGeometry args={[size*0.28, size*0.3, size*0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TractorB33({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.45, 0]}>
        <boxGeometry args={[size*0.95, size*0.55, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* cabin */}
      <mesh position={[-size*0.2, size*0.82, 0]}>
        <boxGeometry args={[size*0.45, size*0.4, size*0.48]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* big back wheels */}
      {([-0.28, 0.28] as number[]).map((z, i) => (
        <mesh key={i} position={[-size*0.28, size*0.28, z*size]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.3, size*0.1, 6, 10]} />
          <meshStandardMaterial color="#222" roughness={0.95} />
        </mesh>
      ))}
      {/* small front wheels */}
      {([-0.2, 0.2] as number[]).map((z, i) => (
        <mesh key={i} position={[size*0.35, size*0.18, z*size]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.18, size*0.065, 5, 8]} />
          <meshStandardMaterial color="#222" roughness={0.95} />
        </mesh>
      ))}
      {/* exhaust pipe */}
      <mesh position={[size*0.3, size*0.75, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.4, 6]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function FarmSilo({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* cylinder */}
      <mesh position={[0, size*0.85, 0]}>
        <cylinderGeometry args={[size*0.35, size*0.38, size*1.7, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
      </mesh>
      {/* dome top */}
      <mesh position={[0, size*1.75, 0]}>
        <sphereGeometry args={[size*0.36, 8, 6]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* horizontal bands */}
      {([0.25, 0.65, 1.05, 1.45] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.37, size*0.025, 5, 10]} />
          <meshStandardMaterial color="#999" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function GardenScarecrow({ pos, color, size }: P33) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.08
  })
  return (
    <group ref={ref} position={pos}>
      {/* post */}
      <mesh position={[0, size*0.55, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.1, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* cross arm */}
      <mesh position={[0, size*0.85, 0]}>
        <boxGeometry args={[size*0.8, size*0.05, size*0.05]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* shirt */}
      <mesh position={[0, size*0.85, 0]}>
        <boxGeometry args={[size*0.45, size*0.38, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* head/hat */}
      <mesh position={[0, size*1.15, 0]}>
        <sphereGeometry args={[size*0.16, 7, 6]} />
        <meshStandardMaterial color="#e8d5a0" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*1.26, 0]}>
        <coneGeometry args={[size*0.22, size*0.28, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function PortCrane({ pos, color, size }: P33) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.5
  })
  return (
    <group ref={ref} position={pos}>
      {/* base */}
      <mesh position={[0, size*0.1, 0]}>
        <boxGeometry args={[size*0.6, size*0.2, size*0.6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* mast */}
      <mesh position={[0, size*0.85, 0]}>
        <boxGeometry args={[size*0.1, size*1.5, size*0.1]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* boom */}
      <mesh position={[size*0.45, size*1.52, 0]} rotation={[0,0,-0.15]}>
        <boxGeometry args={[size*0.85, size*0.08, size*0.08]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* cable */}
      <mesh position={[size*0.82, size*1.2, 0]}>
        <cylinderGeometry args={[size*0.015, size*0.015, size*0.7, 4]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* hook */}
      <mesh position={[size*0.82, size*0.82, 0]}>
        <torusGeometry args={[size*0.06, size*0.02, 5, 6, Math.PI]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function ShippingContainer({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* main box */}
      <mesh position={[0, size*0.32, 0]}>
        <boxGeometry args={[size*1.4, size*0.65, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.25} />
      </mesh>
      {/* corrugation lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[(-0.5+i*0.25)*size, size*0.32, size*0.31]}>
          <boxGeometry args={[size*0.03, size*0.65, size*0.02]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[size*0.58, size*0.32, size*0.31]}>
        <boxGeometry args={[size*0.3, size*0.58, size*0.02]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.35} />
      </mesh>
    </group>
  )
}

export function DockCleat({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <boxGeometry args={[size*0.5, size*0.1, size*0.25]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* horns */}
      {([-0.2, 0.2] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.12, 0]}>
          <boxGeometry args={[size*0.12, size*0.15, size*0.22]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* rope wrap */}
      <mesh position={[0, size*0.1, 0]}>
        <torusGeometry args={[size*0.1, size*0.03, 5, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function StorageTankB33({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* cylinder */}
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.42, size*0.45, size*1.3, 12]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* dome */}
      <mesh position={[0, size*1.32, 0]}>
        <sphereGeometry args={[size*0.43, 10, 7]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* platform */}
      <mesh position={[0, size*0.25, 0]}>
        <torusGeometry args={[size*0.48, size*0.06, 5, 12]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* ladder rungs */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[size*0.44, (0.28+i*0.22)*size, 0]}>
          <boxGeometry args={[size*0.08, size*0.02, size*0.12]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function ForkLift({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.38, 0]}>
        <boxGeometry args={[size*0.75, size*0.65, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* cabin */}
      <mesh position={[-size*0.05, size*0.78, size*0.1]}>
        <boxGeometry args={[size*0.42, size*0.35, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* wheels */}
      {([-0.3, 0.3] as number[]).map((z, i) =>
        ([-0.28, 0.28] as number[]).map((x, j) => (
          <mesh key={`${i}${j}`} position={[x*size, size*0.15, z*size]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[size*0.16, size*0.06, 5, 8]} />
            <meshStandardMaterial color="#222" roughness={0.95} />
          </mesh>
        ))
      )}
      {/* mast */}
      <mesh position={[size*0.38, size*0.65, 0]}>
        <boxGeometry args={[size*0.06, size*0.9, size*0.1]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* forks */}
      {([-0.08, 0.08] as number[]).map((z, i) => (
        <mesh key={i} position={[size*0.7, size*0.18, z*size]}>
          <boxGeometry args={[size*0.55, size*0.05, size*0.06]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function RoosterWeatherVane({ pos, color, size }: P33) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 1.2
  })
  return (
    <group ref={ref} position={pos}>
      {/* pole */}
      <mesh position={[0, size*0.4, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.8, 5]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* N-S bar */}
      <mesh position={[0, size*0.82, 0]}>
        <boxGeometry args={[size*0.5, size*0.04, size*0.04]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* rooster body */}
      <mesh position={[0, size*1.0, 0]}>
        <sphereGeometry args={[size*0.14, 7, 6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* tail */}
      <mesh position={[-size*0.18, size*1.05, 0]} rotation={[0,0,0.5]}>
        <coneGeometry args={[size*0.08, size*0.2, 5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* comb */}
      <mesh position={[size*0.05, size*1.15, 0]}>
        <coneGeometry args={[size*0.04, size*0.1, 4]} />
        <meshStandardMaterial color="#cc2200" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function FishingBoat({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size*0.22, 0]}>
        <boxGeometry args={[size*1.4, size*0.38, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* deck cabin */}
      <mesh position={[-size*0.25, size*0.5, 0]}>
        <boxGeometry args={[size*0.55, size*0.32, size*0.48]} />
        <meshStandardMaterial color="#e8e8e0" roughness={0.8} />
      </mesh>
      {/* mast */}
      <mesh position={[size*0.28, size*0.7, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.75, 5]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* fishing net rolled up */}
      <mesh position={[size*0.25, size*0.42, size*0.12]}>
        <torusGeometry args={[size*0.1, size*0.05, 5, 8]} />
        <meshStandardMaterial color="#c8a46e" roughness={0.9} />
      </mesh>
      {/* bow */}
      <mesh position={[size*0.7, size*0.15, 0]} rotation={[0,0,-0.15]}>
        <coneGeometry args={[size*0.12, size*0.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function PigPen({ pos, color: _color, size }: P33) {
  return (
    <group position={pos}>
      {/* fence panels */}
      {([0, 1, 2, 3] as number[]).map((i) => {
        const a = (i / 4) * Math.PI * 2
        const nx = Math.cos(a + Math.PI/4)
        const nz = Math.sin(a + Math.PI/4)
        return (
          <mesh key={i} position={[nx*size*0.42, size*0.2, nz*size*0.42]} rotation={[0, a + Math.PI/4, 0]}>
            <boxGeometry args={[size*0.62, size*0.35, size*0.05]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
        )
      })}
      {/* mud base */}
      <mesh position={[0, size*0.02, 0]}>
        <cylinderGeometry args={[size*0.4, size*0.4, size*0.04, 10]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
      </mesh>
      {/* pig */}
      <mesh position={[0, size*0.18, 0]}>
        <sphereGeometry args={[size*0.18, 7, 6]} />
        <meshStandardMaterial color="#ffaabb" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function LighthousePortB33({ pos, color, size }: P33) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.8 + Math.sin(clock.getElapsedTime() * 4) * 0.5
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.25, 10]} />
        <meshStandardMaterial color="#888888" roughness={0.8} />
      </mesh>
      {/* tower */}
      <mesh position={[0, size*0.75, 0]}>
        <cylinderGeometry args={[size*0.2, size*0.26, size*1.3, 10]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {/* light housing */}
      <mesh position={[0, size*1.5, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.28, 10]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* light beam */}
      <mesh ref={ref} position={[0, size*1.5, 0]}>
        <sphereGeometry args={[size*0.15, 8, 8]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={0.9} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export function CoalConveyor({ pos, color, size }: P33) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 2
  })
  return (
    <group position={pos}>
      {/* belt frame */}
      <mesh position={[0, size*0.35, 0]} rotation={[0,0,-0.35]}>
        <boxGeometry args={[size*1.3, size*0.08, size*0.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* belt surface */}
      <mesh position={[size*0.05, size*0.41, 0]} rotation={[0,0,-0.35]}>
        <boxGeometry args={[size*1.25, size*0.04, size*0.35]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* rollers */}
      {([-0.5, 0.5] as number[]).map((x, i) => (
        <mesh key={i} {...(i===0 && ref ? {ref} : {})} position={[(x*size*0.6), size*0.35 + x*size*0.21, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[size*0.08, size*0.08, size*0.45, 8]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function WaterMill({ pos, color, size }: P33) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.4
  })
  return (
    <group position={pos}>
      {/* building */}
      <mesh position={[0, size*0.45, 0]}>
        <boxGeometry args={[size*0.8, size*0.9, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*0.98, 0]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[size*0.55, size*0.35, 4]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* wheel */}
      <group ref={ref} position={[-size*0.45, size*0.45, 0]}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[size*0.38, size*0.04, 5, 10]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
        {/* paddles */}
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[0, Math.cos(a)*size*0.38, Math.sin(a)*size*0.38]}>
              <boxGeometry args={[size*0.08, size*0.25, size*0.06]} />
              <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function IndustrialChimney({ pos, color, size }: P33) {
  return (
    <group position={pos}>
      {/* chimney stack */}
      <mesh position={[0, size*1.0, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.24, size*2.0, 10]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* red bands */}
      {([0.3, 0.7, 1.1, 1.5] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*(0.23-i*0.01), size*0.025, 5, 10]} />
          <meshStandardMaterial color="#cc2200" roughness={0.7} />
        </mesh>
      ))}
      {/* smoke */}
      {([0.15, 0.4, 0.65] as number[]).map((y, i) => (
        <mesh key={i} position={[(i-1)*size*0.1, size*2.1+y*size, 0]}>
          <sphereGeometry args={[size*(0.12+i*0.04), 6, 5]} />
          <meshStandardMaterial color="#aaaaaa" transparent opacity={0.4-i*0.1} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

// === BATCH 34: Ancient Greece + Cyberpunk City ===
interface P34 { pos: [number,number,number]; color: string; size: number }

export function GreekPillar({ pos, color, size }: P34) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.2, size*1.6, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.85, 0]}>
        <boxGeometry args={[size*0.45, size*0.12, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, -size*0.85, 0]}>
        <boxGeometry args={[size*0.5, size*0.1, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-0.3, 0, 0.3] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y * size * 0.5, 0]}>
          <torusGeometry args={[size*0.19, size*0.02, 6, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function GreekUrnB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.3 })
  return (
    <group position={pos}>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[size*0.35, 12, 10, 0, Math.PI*2, 0, Math.PI*0.7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, -size*0.28, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.14, size*0.28, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, -size*0.42, 0]}>
        <cylinderGeometry args={[size*0.2, size*0.2, size*0.05, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s * size*0.38, 0, 0]} rotation={[0, 0, s * 1.4]}>
          <torusGeometry args={[size*0.12, size*0.025, 6, 10, Math.PI*0.8]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function GreekShield({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.15 })
  return (
    <group ref={ref} position={pos}>
      <mesh castShadow>
        <cylinderGeometry args={[size*0.55, size*0.55, size*0.07, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.04, 24]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, size*0.1, 0]}>
        <sphereGeometry args={[size*0.1, 8, 8]} />
        <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  )
}

export function OliveTreeB34({ pos, color, size }: P34) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.12, size*0.9, 6]} />
        <meshStandardMaterial color="#8B6914" roughness={0.9} />
      </mesh>
      {([
        [0, size*0.7, 0, size*0.55],
        [0, size*0.45, size*0.15, size*0.4],
        [0, size*0.55, -size*0.12, size*0.35],
      ] as [number,number,number,number][]).map(([x,y,z,r], i) => (
        <mesh key={i} position={[x,y,z]} castShadow>
          <sphereGeometry args={[r, 8, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.18, size*0.55, 0]}>
          <sphereGeometry args={[size*0.06, 5, 4]} />
          <meshStandardMaterial color="#9acd32" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function GreekLyre({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.4 })
  return (
    <group ref={ref} position={pos}>
      <mesh castShadow>
        <torusGeometry args={[size*0.32, size*0.06, 6, 20, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, -size*0.32, 0]} rotation={[0,0,0]}>
        <boxGeometry args={[size*0.08, size*0.35, size*0.06]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-0.18, -0.06, 0.06, 0.18] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, -size*0.1, 0]}>
          <cylinderGeometry args={[size*0.01, size*0.01, size*0.5, 4]} />
          <meshStandardMaterial color="#c8a000" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function AthensOwlB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.7) * 0.2
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.2) * size * 0.04
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.24, 0]}>
        <sphereGeometry args={[size*0.2, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.1, size*0.28, size*0.12]}>
          <sphereGeometry args={[size*0.07, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#aa7700" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.12, size*0.36, 0]}>
          <coneGeometry args={[size*0.06, size*0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function TriremeB34({ pos, color, size }: P34) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.6, size*0.25, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.2, 0]}>
        <boxGeometry args={[size*1.4, size*0.08, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} rotation={[0,0,0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.9, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.52, -size*0.22]}>
        <boxGeometry args={[size*0.8, size*0.5, size*0.03]} />
        <meshStandardMaterial color="#cc3300" roughness={0.8} />
      </mesh>
      <mesh position={[size*0.75, size*0.1, 0]}>
        <coneGeometry args={[size*0.06, size*0.28, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function ParthenoCap({ pos, color, size }: P34) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.08, size*0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.15, 0]}>
        <boxGeometry args={[size*1.0, size*0.12, size*0.65]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.33, 0]}>
        <boxGeometry args={[size*1.1, size*0.4, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {([-0.45, -0.15, 0.15, 0.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, -size*0.36, 0]}>
          <cylinderGeometry args={[size*0.07, size*0.08, size*0.65, 10]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function NeonSignB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.4
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size*1.1, size*0.45, size*0.06]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, 0, size*0.04]}>
        <torusGeometry args={[size*0.18, size*0.03, 6, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} roughness={0.2} />
      </mesh>
      {([-0.3, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, 0, size*0.04]}>
          <boxGeometry args={[size*0.3, size*0.04, size*0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, -size*0.3, 0]}>
        <boxGeometry args={[size*0.06, size*0.3, size*0.06]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function CyberTowerB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*2.2, size*0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
      </mesh>
      {([0.3, 0.75, 1.2, 1.65] as number[]).map((y, i) => (
        <mesh key={i} position={[0, (y - 0.8) * size, 0]}>
          <boxGeometry args={[size*0.55, size*0.06, size*0.55]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*1.2, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.3, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*1.37, 0]}>
        <sphereGeometry args={[size*0.07, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function HoverCarB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.06
    ref.current.rotation.y = clock.getElapsedTime() * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*1.0, size*0.22, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.17, 0]}>
        <boxGeometry args={[size*0.65, size*0.18, size*0.44]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} />
      </mesh>
      {([-0.35, 0.35] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, -size*0.15, 0]}>
          <torusGeometry args={[size*0.14, size*0.04, 6, 14]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[size*0.52, 0, 0]}>
        <sphereGeometry args={[size*0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

export function DataTerminalB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, -size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.7, size*0.3]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.2, size*0.03]}>
        <boxGeometry args={[size*0.38, size*0.42, size*0.04]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.2, size*0.06]}>
        <boxGeometry args={[size*0.32, size*0.35, size*0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[0, -size*0.68, 0]}>
        <boxGeometry args={[size*0.55, size*0.05, size*0.4]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CyberBladeB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 1.2
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.06, size*0.8, size*0.18]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, size*0.75, 0]}>
        <boxGeometry args={[size*0.04, size*0.2, size*0.06]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      <mesh position={[0, -size*0.12, 0]}>
        <boxGeometry args={[size*0.12, size*0.16, size*0.12]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, -size*0.36, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.45, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function SynthPlantB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.25
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, -size*0.2, 0]}>
        <cylinderGeometry args={[size*0.12, size*0.15, size*0.25, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.6} />
      </mesh>
      {([0, 1, 2, 3, 4] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.sin(i * 1.26) * size * 0.22,
          (i * 0.22 - 0.2) * size,
          Math.cos(i * 1.26) * size * 0.22
        ]} rotation={[0, i * 1.26, 0.5]}>
          <boxGeometry args={[size*0.28, size*0.06, size*0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size*0.9, 0]}>
        <sphereGeometry args={[size*0.12, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function CyberDroneB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 2.5) * size * 0.08
    ref.current.rotation.y = clock.getElapsedTime() * 1.5
  })
  return (
    <group ref={ref} position={pos}>
      <mesh castShadow>
        <boxGeometry args={[size*0.35, size*0.1, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {([[-1,-1], [-1,1], [1,-1], [1,1]] as number[][]).map(([x,z], i) => (
        <group key={i} position={[x*size*0.28, 0, z*size*0.28]}>
          <mesh>
            <cylinderGeometry args={[size*0.04, size*0.04, size*0.04, 6]} />
            <meshStandardMaterial color="#333" roughness={0.4} />
          </mesh>
          <mesh>
            <torusGeometry args={[size*0.1, size*0.015, 4, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -size*0.08, 0]}>
        <sphereGeometry args={[size*0.06, 6, 6]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.0} />
      </mesh>
    </group>
  )
}

export function PowerCoreB34({ pos, color, size }: P34) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 2.0
    ref.current.rotation.x = clock.getElapsedTime() * 0.7;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.4
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[size*0.42, 0]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh ref={ref}>
        <dodecahedronGeometry args={[size*0.32, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size*0.18, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.0} />
      </mesh>
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[Math.sin(i*1.57)*size*0.44, 0, Math.cos(i*1.57)*size*0.44]}>
          <boxGeometry args={[size*0.06, size*0.35, size*0.06]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function CyberBridgeB34({ pos, color, size }: P34) {
  return (
    <group position={pos}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[size*2.0, size*0.08, size*0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.8} />
      </mesh>
      {([-0.8, 0.8] as number[]).map((x, i) => (
        <group key={i} position={[x*size, 0, 0]}>
          <mesh position={[0, size*0.35, 0]}>
            <cylinderGeometry args={[size*0.05, size*0.05, size*0.7, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[0, size*0.72, 0]}>
            <sphereGeometry args={[size*0.07, 6, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {([-0.4, 0, 0.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.06, 0]}>
          <boxGeometry args={[size*0.04, size*0.05, size*0.5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
