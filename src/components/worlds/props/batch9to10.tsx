import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Batch 9: Ocean Park ─────────────────────────────────────────────────────
interface P9 { pos: [number,number,number]; color: string; size: number }

export function Jellyfish({ pos, color, size }: P9) {
  const c = color || '#ff88cc'
  const bodyRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.2) * size * 0.08
      bodyRef.current.scale.y = 1 + Math.sin(t * 2.4) * 0.08
    }
  })
  return (
    <group position={pos}>
      <group ref={bodyRef}>
        {/* bell */}
        <mesh position={[0, size * 0.6, 0]} castShadow>
          <sphereGeometry args={[size * 0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={c} transparent opacity={0.65} roughness={0.2} />
        </mesh>
        {/* tentacles */}
        {([0, 0.8, 1.6, 2.4, 3.2, 4.0] as number[]).map((angle, i) => (
          <mesh key={i} position={[
            Math.sin(angle) * size * 0.2,
            size * 0.28,
            Math.cos(angle) * size * 0.2,
          ]}>
            <cylinderGeometry args={[size * 0.015, size * 0.008, size * 0.5, 4]} />
            <meshStandardMaterial color={c} transparent opacity={0.5} />
          </mesh>
        ))}
        {/* inner glow */}
        <mesh position={[0, size * 0.62, 0]}>
          <sphereGeometry args={[size * 0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function ClamShell({ pos, color, size }: P9) {
  const c = color || '#f0e0c0'
  return (
    <group position={pos}>
      {/* bottom shell */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* top shell (tilted open) */}
      <mesh position={[0, size * 0.1, -size * 0.1]} rotation={[-0.6, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* pearl */}
      <mesh position={[0, size * 0.22, 0]}>
        <sphereGeometry args={[size * 0.12, 10, 10]} />
        <meshStandardMaterial color="#f8f8ff" metalness={0.6} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function CrabProp({ pos, color, size }: P9) {
  const c = color || '#ff5522'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* shell dome */}
      <mesh position={[0, size * 0.3, 0]}>
        <sphereGeometry args={[size * 0.35, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* eyes */}
      <mesh position={[size * 0.16, size * 0.42, size * 0.24]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-size * 0.16, size * 0.42, size * 0.24]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* claws */}
      <mesh position={[size * 0.55, size * 0.25, size * 0.1]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.55, size * 0.25, size * 0.1]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* legs */}
      {([-0.2, 0, 0.2] as number[]).map((z, i) => (
        <group key={i}>
          <mesh position={[size * 0.42, size * 0.12, size * z]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[size * 0.025, size * 0.02, size * 0.38, 5]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
          <mesh position={[-size * 0.42, size * 0.12, size * z]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[size * 0.025, size * 0.02, size * 0.38, 5]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function SeaweedTall({ pos, color, size }: P9) {
  const c = color || '#2a8b2a'
  const sway1 = useRef<THREE.Mesh>(null!)
  const sway2 = useRef<THREE.Mesh>(null!)
  const sway3 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (sway1.current) sway1.current.rotation.z = Math.sin(t * 1.2) * 0.12
    if (sway2.current) sway2.current.rotation.z = Math.sin(t * 1.4 + 0.5) * 0.15
    if (sway3.current) sway3.current.rotation.z = Math.sin(t * 1.1 + 1.0) * 0.1
  })
  return (
    <group position={pos}>
      <mesh ref={sway1} position={[-size * 0.1, size * 0.6, 0]}>
        <capsuleGeometry args={[size * 0.06, size * 1.2, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh ref={sway2} position={[size * 0.12, size * 0.7, size * 0.05]}>
        <capsuleGeometry args={[size * 0.05, size * 1.4, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh ref={sway3} position={[0, size * 0.55, -size * 0.08]}>
        <capsuleGeometry args={[size * 0.055, size * 1.1, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function DivingBell({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* bell dome */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#b0b8c8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* porthole */}
      <mesh position={[0, size * 0.75, size * 0.44]}>
        <circleGeometry args={[size * 0.12, 10]} />
        <meshStandardMaterial color="#88ccdd" transparent opacity={0.6} />
      </mesh>
      {/* ring porthole */}
      <mesh position={[0, size * 0.75, size * 0.44]}>
        <torusGeometry args={[size * 0.13, size * 0.025, 6, 14]} />
        <meshStandardMaterial color="#888899" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* chain */}
      {([0.2, 0.4, 0.6, 0.8] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * (0.9 + h * 0.3), 0]}>
          <torusGeometry args={[size * 0.07, size * 0.02, 5, 10]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* bottom platform */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.46, size * 0.46, size * 0.06, 10]} />
        <meshStandardMaterial color="#9a9aaa" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function ReefRock({ pos, color, size }: P9) {
  const c = color || '#cc7744'
  return (
    <group position={pos}>
      {/* main rock */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.42, 0]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* coral bumps */}
      {([0, 1.2, 2.4, 3.6] as number[]).map((angle, i) => (
        <group key={i}>
          <mesh position={[
            Math.sin(angle) * size * 0.32,
            size * 0.7,
            Math.cos(angle) * size * 0.32,
          ]}>
            <coneGeometry args={[size * 0.06, size * 0.25, 5]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#ff6688' : '#ff9944'} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function SeaStar({ pos, color, size }: P9) {
  const c = color || '#ff8844'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.08
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef} position={[0, size * 0.06, 0]}>
        {/* 5 arms */}
        {([0, 72, 144, 216, 288] as number[]).map((deg, i) => {
          const rad = (deg * Math.PI) / 180
          return (
            <mesh
              key={i}
              position={[Math.sin(rad) * size * 0.28, 0, Math.cos(rad) * size * 0.28]}
              rotation={[0, rad, 0]}
            >
              <boxGeometry args={[size * 0.14, size * 0.07, size * 0.55]} />
              <meshStandardMaterial color={c} roughness={0.5} />
            </mesh>
          )
        })}
        {/* center */}
        <mesh position={[0, size * 0.04, 0]}>
          <sphereGeometry args={[size * 0.18, 8, 8]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

export function MantaRay({ pos, color, size }: P9) {
  const c = color || '#3355aa'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.8) * size * 0.12
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={floatRef}>
        {/* left wing */}
        <mesh position={[-size * 0.45, 0, 0]} rotation={[0.15, 0, 0.12]}>
          <boxGeometry args={[size * 0.9, size * 0.04, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        {/* right wing */}
        <mesh position={[size * 0.45, 0, 0]} rotation={[-0.15, 0, -0.12]}>
          <boxGeometry args={[size * 0.9, size * 0.04, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        {/* body */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[size * 0.12, size * 0.5, 4, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* tail */}
        <mesh position={[0, 0, -size * 0.55]}>
          <coneGeometry args={[size * 0.06, size * 0.5, 4]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function PufferFish({ pos, color, size }: P9) {
  const c = color || '#ffaa33'
  const puffRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (puffRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.05
      puffRef.current.scale.setScalar(s)
    }
  })
  return (
    <group position={pos}>
      <group ref={puffRef} position={[0, size * 0.5, 0]}>
        {/* body */}
        <mesh castShadow>
          <sphereGeometry args={[size * 0.4, 14, 14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* spines */}
        {Array.from({ length: 18 }).map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 18)
          const theta = Math.PI * (1 + Math.sqrt(5)) * i
          return (
            <mesh key={i} position={[
              Math.sin(phi) * Math.cos(theta) * size * 0.42,
              Math.cos(phi) * size * 0.42,
              Math.sin(phi) * Math.sin(theta) * size * 0.42,
            ]}>
              <coneGeometry args={[size * 0.025, size * 0.14, 4]} />
              <meshStandardMaterial color="#cc8800" roughness={0.4} />
            </mesh>
          )
        })}
        {/* eyes */}
        <mesh position={[size * 0.2, size * 0.08, size * 0.34]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[-size * 0.2, size * 0.08, size * 0.34]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    </group>
  )
}

export function SunkenShipBow({ pos, size }: P9) {
  return (
    <group position={pos} rotation={[0.25, 0.1, -0.15]}>
      {/* hull */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 0.8, size * 0.8, size * 1.5]} />
        <meshStandardMaterial color="#5a4a2a" roughness={0.9} />
      </mesh>
      {/* bow prow */}
      <mesh position={[0, size * 0.5, size * 0.85]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.7, size * 0.4]} />
        <meshStandardMaterial color="#4a3a1a" roughness={0.9} />
      </mesh>
      {/* mast stump */}
      <mesh position={[0, size * 1.2, -size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.09, size * 0.9, 6]} />
        <meshStandardMaterial color="#6a5a2a" roughness={0.9} />
      </mesh>
      {/* barnacles / algae patches */}
      {([0.1, 0.4, 0.7] as number[]).map((z, i) => (
        <mesh key={i} position={[size * 0.41, size * 0.4, size * (z - 0.3)]}>
          <sphereGeometry args={[size * 0.08, 5, 5]} />
          <meshStandardMaterial color="#336633" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Batch 9: Jungle Park ────────────────────────────────────────────────────

export function JungleBridge({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* planks */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, size * 0.1, size * (-0.9 + i * 0.3)]} castShadow>
          <boxGeometry args={[size * 0.85, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* side ropes */}
      <mesh position={[size * 0.43, size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.9, 5]} rotation-z={0} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.43, size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.9, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {/* vertical ropes */}
      {([-0.8, -0.3, 0.2, 0.7] as number[]).map((z, i) => (
        <mesh key={i} position={[size * 0.43, size * 0.22, size * z]}>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 4]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function TribalDrum({ pos, color, size }: P9) {
  const c = color || '#8b4513'
  return (
    <group position={pos}>
      {/* drum body */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.9, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* drum heads */}
      <mesh position={[0, size * 0.92, 0]}>
        <cylinderGeometry args={[size * 0.39, size * 0.39, size * 0.04, 12]} />
        <meshStandardMaterial color="#f5e0c0" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.02, 0]}>
        <cylinderGeometry args={[size * 0.39, size * 0.39, size * 0.04, 12]} />
        <meshStandardMaterial color="#f5e0c0" roughness={0.7} />
      </mesh>
      {/* roping pattern */}
      {([0.25, 0.45, 0.65] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * 0.4, size * 0.02, 5, 16]} />
          <meshStandardMaterial color="#5a3010" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function JungleFlower({ pos, color, size }: P9) {
  const c = color || '#ff3355'
  return (
    <group position={pos}>
      {/* stem */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.7, 6]} />
        <meshStandardMaterial color="#2d6b2d" roughness={0.7} />
      </mesh>
      {/* petals */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * size * 0.3, size * 0.74, Math.cos(rad) * size * 0.3]}
            rotation={[0, rad, 0.4]}
          >
            <capsuleGeometry args={[size * 0.09, size * 0.35, 4, 6]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        )
      })}
      {/* center */}
      <mesh position={[0, size * 0.78, 0]}>
        <sphereGeometry args={[size * 0.14, 8, 8]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {/* leaves */}
      <mesh position={[size * 0.22, size * 0.4, 0]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[size * 0.06, size * 0.4, 3, 6]} />
        <meshStandardMaterial color="#2d6b2d" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function TreeGiant({ pos, color, size }: P9) {
  const c = color || '#2d6b2d'
  return (
    <group position={pos}>
      {/* main trunk */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.45, size * 2.0, 10]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
      {/* buttress roots */}
      {([0, 1.2, 2.4, 3.6, 4.8] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.5,
          size * 0.2,
          Math.cos(angle) * size * 0.5,
        ]} rotation={[0, angle, 0.5]}>
          <boxGeometry args={[size * 0.12, size * 0.5, size * 0.5]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      {/* canopy layers */}
      <mesh position={[0, size * 2.3, 0]} castShadow>
        <sphereGeometry args={[size * 0.9, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.4, size * 1.9, size * 0.2]} castShadow>
        <sphereGeometry args={[size * 0.55, 8, 6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.35, size * 2.0, -size * 0.15]} castShadow>
        <sphereGeometry args={[size * 0.6, 8, 6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function ParrotPerch({ pos, color, size }: P9) {
  const c = color || '#ff4400'
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.08
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size, 6]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* perch bar */}
      <mesh position={[0, size * 0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.5, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* parrot body */}
      <group ref={bobRef} position={[size * 0.1, size * 1.05, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[size * 0.12, size * 0.2, 4, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* head */}
        <mesh position={[0, size * 0.22, 0]}>
          <sphereGeometry args={[size * 0.13, 8, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* wing */}
        <mesh position={[size * 0.14, 0, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[size * 0.22, size * 0.04, size * 0.28]} />
          <meshStandardMaterial color="#ff8800" roughness={0.5} />
        </mesh>
        {/* beak */}
        <mesh position={[0, size * 0.22, size * 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[size * 0.04, size * 0.1, 4]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.4} />
        </mesh>
        {/* eye */}
        <mesh position={[size * 0.08, size * 0.26, size * 0.1]}>
          <sphereGeometry args={[size * 0.03, 5, 5]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* tail */}
        <mesh position={[0, -size * 0.22, -size * 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[size * 0.08, size * 0.04, size * 0.32]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function WaterfallSmall({ pos, color, size }: P9) {
  const c = color || '#4fc3f7'
  const splashRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (splashRef.current) {
      (splashRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* cliff */}
      <mesh position={[0, size * 0.7, -size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.8, size * 1.4, size * 0.35]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
      </mesh>
      {/* water stream */}
      <mesh position={[0, size * 0.55, size * 0.06]}>
        <boxGeometry args={[size * 0.3, size * 1.1, size * 0.04]} />
        <meshStandardMaterial color={c} transparent opacity={0.65} emissive={c} emissiveIntensity={0.2} />
      </mesh>
      {/* pool */}
      <mesh position={[0, size * 0.04, size * 0.22]}>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.06, 12]} />
        <meshStandardMaterial color={c} transparent opacity={0.7} />
      </mesh>
      {/* splash */}
      <mesh ref={splashRef} position={[0, size * 0.08, size * 0.22]}>
        <sphereGeometry args={[size * 0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function BambooWall({ pos, color, size }: P9) {
  const c = color || '#5ba55b'
  return (
    <group position={pos}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.8 + i * 0.4), size * 0.7, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.08, size * 1.4, 7]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      {/* nodes on each stalk */}
      {Array.from({ length: 5 }).map((_, i) =>
        ([0.3, 0.65, 1.0] as number[]).map((h, j) => (
          <mesh key={`${i}${j}`} position={[size * (-0.8 + i * 0.4), size * h, 0]}>
            <torusGeometry args={[size * 0.075, size * 0.02, 5, 10]} />
            <meshStandardMaterial color="#3d6e3d" roughness={0.7} />
          </mesh>
        ))
      )}
      {/* horizontal ties */}
      <mesh position={[0, size * 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 2.0, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 2.0, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function FrogStatue({ pos, color, size }: P9) {
  const c = color || '#2a8b2a'
  return (
    <group position={pos}>
      {/* pedestal */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.36, size * 0.2, 8]} />
        <meshStandardMaterial color="#888880" roughness={0.9} />
      </mesh>
      {/* body */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 12, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* belly */}
      <mesh position={[0, size * 0.38, size * 0.2]}>
        <sphereGeometry args={[size * 0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88cc88" roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.72, size * 0.06]} castShadow>
        <sphereGeometry args={[size * 0.25, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* eyes */}
      <mesh position={[size * 0.16, size * 0.95, size * 0.08]}>
        <sphereGeometry args={[size * 0.1, 7, 7]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.3} />
      </mesh>
      <mesh position={[-size * 0.16, size * 0.95, size * 0.08]}>
        <sphereGeometry args={[size * 0.1, 7, 7]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.3} />
      </mesh>
      {/* back legs */}
      <mesh position={[size * 0.3, size * 0.22, -size * 0.1]} rotation={[0, 0, -0.6]}>
        <capsuleGeometry args={[size * 0.07, size * 0.35, 4, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.3, size * 0.22, -size * 0.1]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[size * 0.07, size * 0.35, 4, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function TempleRuin({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* back wall fragment */}
      <mesh position={[0, size * 0.7, -size * 0.4]} castShadow>
        <boxGeometry args={[size * 1.2, size * 1.4, size * 0.25]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* side pillar left */}
      <mesh position={[-size * 0.55, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 1.1, 8]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* side pillar right (broken) */}
      <mesh position={[size * 0.55, size * 0.35, size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.7, 8]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* fallen pillar segment */}
      <mesh position={[size * 0.6, size * 0.12, size * 0.55]} rotation={[Math.PI / 2, 0, 0.5]}>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.55, 8]} />
        <meshStandardMaterial color="#8a7a5a" roughness={0.9} />
      </mesh>
      {/* debris blocks */}
      {([[-0.1, 0.06, 0.3], [0.25, 0.06, 0.4], [-0.3, 0.06, 0.15]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={[size * p[0], size * p[1], size * p[2]]} rotation={[0, i * 0.7, 0]}>
          <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function TreasureMapStand({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* stand legs */}
      <mesh position={[-size * 0.2, size * 0.3, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[size * 0.03, size * 0.04, size * 0.6, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.2, size * 0.3, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[size * 0.03, size * 0.04, size * 0.6, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* map surface */}
      <mesh position={[0, size * 0.72, 0]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.5, size * 0.03]} />
        <meshStandardMaterial color="#c8a870" roughness={0.8} />
      </mesh>
      {/* map details */}
      <mesh position={[0, size * 0.72, size * 0.02]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.01]} />
        <meshStandardMaterial color="#b89050" roughness={0.9} />
      </mesh>
      {/* X marks the spot */}
      <mesh position={[size * 0.1, size * 0.76, size * 0.022]} rotation={[-0.15, 0, Math.PI / 4]}>
        <boxGeometry args={[size * 0.14, size * 0.025, size * 0.01]} />
        <meshStandardMaterial color="#8b2222" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.1, size * 0.76, size * 0.022]} rotation={[-0.15, 0, -Math.PI / 4]}>
        <boxGeometry args={[size * 0.14, size * 0.025, size * 0.01]} />
        <meshStandardMaterial color="#8b2222" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Batch 10: Steampunk ─────────────────────────────────────────────────────
interface P10 { pos: [number,number,number]; color: string; size: number }

export function SteamPipe({ pos, color, size }: P10) {
  const c = color || '#8b6914'
  const steamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (steamRef.current) {
      steamRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3
      ;(steamRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.25 + Math.sin(clock.getElapsedTime() * 2) * 0.12
    }
  })
  return (
    <group position={pos}>
      {/* main horizontal pipe */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 1.0, 10]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* vertical elbow */}
      <mesh position={[0, size * 0.82, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.1, 8, 10, Math.PI / 2]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* vertical section */}
      <mesh position={[size * 0.16, size * 1.05, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.46, 8]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* valve */}
      <mesh position={[0, size * 0.55, 0]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#884400" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* steam cloud */}
      <mesh ref={steamRef} position={[size * 0.16, size * 1.4, 0]}>
        <sphereGeometry args={[size * 0.18, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* pipe rings */}
      {([-0.3, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[size * 0.13, size * 0.025, 5, 12]} />
          <meshStandardMaterial color="#6a5000" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function ClockworkGear({ pos, color, size }: P10) {
  const c = color || '#c0a040'
  const gearRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (gearRef.current) gearRef.current.rotation.z = clock.getElapsedTime() * 0.6
  })
  const teeth = 12
  return (
    <group position={pos}>
      <group ref={gearRef} position={[0, size * 0.5, 0]}>
        {/* main disk */}
        <mesh>
          <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.1, 20]} />
          <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* hub */}
        <mesh>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.12, 8]} />
          <meshStandardMaterial color="#8b7000" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* teeth */}
        {Array.from({ length: teeth }).map((_, i) => {
          const angle = (i / teeth) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(angle) * size * 0.44, 0, Math.cos(angle) * size * 0.44]}>
              <boxGeometry args={[size * 0.09, size * 0.12, size * 0.12]} />
              <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
            </mesh>
          )
        })}
        {/* spokes */}
        {([0, Math.PI / 2, Math.PI, Math.PI * 1.5] as number[]).map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0]}>
            <boxGeometry args={[size * 0.06, size * 0.1, size * 0.7]} />
            <meshStandardMaterial color="#9a8020" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function AirshipEngine({ pos, color, size }: P10) {
  const c = color || '#a07820'
  const propRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (propRef.current) propRef.current.rotation.z = clock.getElapsedTime() * 8
  })
  return (
    <group position={pos}>
      {/* engine cylinder */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.3, size * 0.8, 10]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* exhaust pipe */}
      <mesh position={[size * 0.28, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.4, 6]} />
        <meshStandardMaterial color="#5a3a00" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* propeller group */}
      <group ref={propRef} position={[0, size * 0.5, size * 0.32]}>
        <mesh>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.06, 6]} />
          <meshStandardMaterial color="#886600" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* blades */}
        {([0, 1, 2] as number[]).map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <boxGeometry args={[size * 0.06, size * 0.55, size * 0.04]} />
            <meshStandardMaterial color="#6a5000" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* bands */}
      {([0.25, 0.5, 0.75] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * 0.31, size * 0.03, 5, 14]} />
          <meshStandardMaterial color="#5a3a00" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function PressureGauge({ pos, size }: P10) {
  const needleRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (needleRef.current) {
      const t = clock.getElapsedTime()
      needleRef.current.rotation.z = -0.5 + Math.sin(t * 0.8) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* mounting plate */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.06]} />
        <meshStandardMaterial color="#888880" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* gauge face */}
      <mesh position={[0, size * 0.4, size * 0.04]}>
        <circleGeometry args={[size * 0.22, 16]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
      {/* bezel */}
      <mesh position={[0, size * 0.4, size * 0.034]}>
        <torusGeometry args={[size * 0.23, size * 0.025, 6, 18]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* needle */}
      <mesh ref={needleRef} position={[0, size * 0.4, size * 0.05]}>
        <boxGeometry args={[size * 0.025, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>
      {/* pipe connector */}
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.25, 6]} />
        <meshStandardMaterial color="#888880" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function SteamLocomotive({ pos, size }: P10) {
  const smokeRef = useRef<THREE.Mesh>(null!)
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (smokeRef.current) {
      smokeRef.current.scale.y = 1 + Math.sin(t * 3) * 0.25
      ;(smokeRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.3 + Math.sin(t * 2.5) * 0.15
    }
    if (wheelRef.current) wheelRef.current.rotation.z = t * 2
  })
  return (
    <group position={pos}>
      {/* boiler */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 1.0, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* cab */}
      <mesh position={[0, size * 0.78, -size * 0.45]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.5, size * 0.5]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* smokestack */}
      <mesh position={[0, size * 0.95, size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.4, 7]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* smoke */}
      <mesh ref={smokeRef} position={[0, size * 1.3, size * 0.3]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#aaaaaa" transparent opacity={0.35} />
      </mesh>
      {/* wheels group */}
      <group ref={wheelRef}>
        {([-0.35, 0] as number[]).map((z, i) => (
          <group key={i}>
            <mesh position={[size * 0.3, size * 0.2, size * z]}>
              <torusGeometry args={[size * 0.2, size * 0.04, 6, 14]} />
              <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[-size * 0.3, size * 0.2, size * z]}>
              <torusGeometry args={[size * 0.2, size * 0.04, 6, 14]} />
              <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function CogTower({ pos, color, size }: P10) {
  const c = color || '#8b6914'
  const gear1Ref = useRef<THREE.Mesh>(null!)
  const gear2Ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (gear1Ref.current) gear1Ref.current.rotation.z = t * 0.7
    if (gear2Ref.current) gear2Ref.current.rotation.z = -t * 1.0
  })
  return (
    <group position={pos}>
      {/* tower */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 1.4, size * 0.4]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.8} />
      </mesh>
      {/* big gear */}
      <mesh ref={gear1Ref} position={[0, size * 1.0, size * 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.32, size * 0.32, size * 0.06, 16]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* small gear */}
      <mesh ref={gear2Ref} position={[size * 0.32, size * 0.7, size * 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.05, 12]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* platform */}
      <mesh position={[0, size * 1.42, 0]}>
        <boxGeometry args={[size * 0.52, size * 0.08, size * 0.52]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function TeslaLamp({ pos, size }: P10) {
  const sparkRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sparkRef.current) {
      ;(sparkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + (Math.sin(clock.getElapsedTime() * 15) > 0.3 ? 2.5 : 0)
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.06, size, 6]} />
        <meshStandardMaterial color="#5a4010" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* lamp cage */}
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 8]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.3} wireframe />
      </mesh>
      {/* inner glow */}
      <mesh position={[0, size * 1.05, 0]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#fff3a0" emissive="#ffdd44" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      {/* spark arc */}
      <mesh ref={sparkRef} position={[size * 0.18, size * 1.05, 0]}>
        <sphereGeometry args={[size * 0.06, 5, 5]} />
        <meshStandardMaterial color="#aaccff" emissive="#aaccff" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function BrassTelescope({ pos, color, size }: P10) {
  const c = color || '#b8860b'
  return (
    <group position={pos} rotation={[0, 0.5, 0]}>
      {/* tripod */}
      {([0, 2.1, 4.2] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.22,
          size * 0.2,
          Math.cos(angle) * size * 0.22,
        ]} rotation={[0.25, angle, 0]}>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 5]} />
          <meshStandardMaterial color="#5a3a00" roughness={0.8} />
        </mesh>
      ))}
      {/* mount head */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <sphereGeometry args={[size * 0.09, 7, 7]} />
        <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* main tube */}
      <mesh position={[0, size * 0.65, size * 0.18]} rotation={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.7, 10]} />
        <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* eyepiece */}
      <mesh position={[0, size * 0.45, size * 0.48]} rotation={[-0.55, 0, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.15, 8]} />
        <meshStandardMaterial color="#8b6914" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* lens ring */}
      <mesh position={[0, size * 0.87, -size * 0.14]} rotation={[-0.55, 0, 0]}>
        <torusGeometry args={[size * 0.1, size * 0.02, 5, 14]} />
        <meshStandardMaterial color="#c0a040" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function SteamVent({ pos, size }: P10) {
  const steamRef1 = useRef<THREE.Mesh>(null!)
  const steamRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (steamRef1.current) {
      steamRef1.current.position.y = size * 0.55 + Math.sin(t * 3) * size * 0.08
      ;(steamRef1.current.material as THREE.MeshStandardMaterial).opacity =
        0.35 + Math.sin(t * 4) * 0.2
    }
    if (steamRef2.current) {
      steamRef2.current.position.y = size * 0.8 + Math.sin(t * 3 + 1) * size * 0.08
      steamRef2.current.scale.x = 1 + Math.sin(t * 2.5 + 0.5) * 0.3
      ;(steamRef2.current.material as THREE.MeshStandardMaterial).opacity =
        0.2 + Math.sin(t * 3 + 1) * 0.15
    }
  })
  return (
    <group position={pos}>
      {/* valve body */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.18, size * 0.4, 8]} />
        <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.2, 7]} />
        <meshStandardMaterial color="#777770" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* steam clouds */}
      <mesh ref={steamRef1} position={[0, size * 0.55, 0]}>
        <sphereGeometry args={[size * 0.18, 7, 7]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={steamRef2} position={[0, size * 0.8, 0]}>
        <sphereGeometry args={[size * 0.24, 7, 7]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
      {/* handle knob */}
      <mesh position={[size * 0.18, size * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.35, 5]} />
        <meshStandardMaterial color="#884400" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function Dirigible({ pos, color, size }: P10) {
  const c = color || '#c8a050'
  const floatRef = useRef<THREE.Group>(null!)
  const propRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (floatRef.current) floatRef.current.position.y = Math.sin(t * 0.7) * size * 0.1
    if (propRef.current) propRef.current.rotation.z = t * 6
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      <group ref={floatRef}>
        {/* envelope (balloon) */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[size * 0.28, size * 0.7, 6, 14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* gondola */}
        <mesh position={[0, -size * 0.45, 0]} castShadow>
          <boxGeometry args={[size * 0.32, size * 0.18, size * 0.5]} />
          <meshStandardMaterial color="#5a3a10" roughness={0.7} />
        </mesh>
        {/* struts */}
        {([-0.1, 0.1] as number[]).map((x, i) => (
          <mesh key={i} position={[size * x, -size * 0.26, 0]} rotation={[0, 0, 0.2 * (i === 0 ? -1 : 1)]}>
            <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.42, 4]} />
            <meshStandardMaterial color="#8b7000" roughness={0.7} />
          </mesh>
        ))}
        {/* propeller */}
        <group ref={propRef} position={[0, -size * 0.45, size * 0.28]}>
          <mesh>
            <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.04, 5]} />
            <meshStandardMaterial color="#8b7000" metalness={0.6} roughness={0.3} />
          </mesh>
          {([0, 1] as number[]).map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI)]}>
              <boxGeometry args={[size * 0.04, size * 0.38, size * 0.04]} />
              <meshStandardMaterial color="#6a5000" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
        </group>
        {/* tail fin */}
        <mesh position={[0, 0, -size * 0.42]}>
          <boxGeometry args={[size * 0.12, size * 0.25, size * 0.06]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Batch 10: Cyberpunk ─────────────────────────────────────────────────────

export function NeonBillboard({ pos, color, size }: P10) {
  const c = color || '#00ffcc'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.2, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* board */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.65, size * 0.08]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.6} />
      </mesh>
      {/* neon face */}
      <mesh ref={glowRef} position={[0, size * 1.3, size * 0.05]}>
        <boxGeometry args={[size * 1.1, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
      {/* neon frame */}
      <mesh position={[0, size * 1.3, size * 0.05]}>
        <boxGeometry args={[size * 1.15, size * 0.03, size * 0.03]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

export function CyberVending({ pos, color, size }: P10) {
  const c = color || '#ff0066'
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (screenRef.current) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 1.2) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 1.4, size * 0.38]} />
        <meshStandardMaterial color="#111122" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.9, size * 0.2]}>
        <boxGeometry args={[size * 0.5, size * 0.45, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      {/* neon stripe */}
      <mesh position={[0, size * 1.3, size * 0.2]}>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
      </mesh>
      {/* slot */}
      <mesh position={[0, size * 0.38, size * 0.2]}>
        <boxGeometry args={[size * 0.28, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#333344" roughness={0.5} />
      </mesh>
      {/* side glow strips */}
      <mesh position={[size * 0.33, size * 0.7, size * 0.1]}>
        <boxGeometry args={[size * 0.02, size * 1.3, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function HoloAd({ pos, color, size }: P10) {
  const c = color || '#0088ff'
  const holoRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (holoRef.current) {
      holoRef.current.rotation.y = clock.getElapsedTime() * 0.4
      const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.04
      holoRef.current.scale.y = s
    }
  })
  return (
    <group position={pos}>
      {/* emitter base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.12, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size * 0.14, 0]}>
        <torusGeometry args={[size * 0.18, size * 0.03, 5, 16]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
      {/* holo content */}
      <group ref={holoRef} position={[0, size * 0.75, 0]}>
        <mesh>
          <boxGeometry args={[size * 0.45, size * 0.65, size * 0.02]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.35} side={2} />
        </mesh>
        {/* scan lines */}
        {([0.1, 0.25, 0.4] as number[]).map((h, i) => (
          <mesh key={i} position={[0, size * (h - 0.2), size * 0.015]}>
            <boxGeometry args={[size * 0.38, size * 0.03, size * 0.01]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function DroneProp({ pos, size }: P10) {
  const droneRef = useRef<THREE.Group>(null!)
  const prop1 = useRef<THREE.Mesh>(null!)
  const prop2 = useRef<THREE.Mesh>(null!)
  const prop3 = useRef<THREE.Mesh>(null!)
  const prop4 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (droneRef.current) droneRef.current.position.y = Math.sin(t * 1.5) * size * 0.08
    if (prop1.current) prop1.current.rotation.z = t * 15
    if (prop2.current) prop2.current.rotation.z = -t * 15
    if (prop3.current) prop3.current.rotation.z = t * 15
    if (prop4.current) prop4.current.rotation.z = -t * 15
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={droneRef}>
        {/* center body */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.3, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color="#222233" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* camera */}
        <mesh position={[0, -size * 0.08, size * 0.14]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.1} />
        </mesh>
        {/* arms */}
        {([[0.28, 0.28], [0.28, -0.28], [-0.28, 0.28], [-0.28, -0.28]] as [number, number][]).map(([x, z], i) => (
          <group key={i}>
            <mesh position={[size * x * 0.5, 0, size * z * 0.5]}>
              <boxGeometry args={[size * Math.abs(x) * 0.55, size * 0.05, size * 0.04]} />
              <meshStandardMaterial color="#333344" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* propeller */}
            <mesh
              ref={i === 0 ? prop1 : i === 1 ? prop2 : i === 2 ? prop3 : prop4}
              position={[size * x, size * 0.07, size * z]}
            >
              <boxGeometry args={[size * 0.35, size * 0.02, size * 0.06]} />
              <meshStandardMaterial color="#444455" transparent opacity={0.6} />
            </mesh>
            {/* motor */}
            <mesh position={[size * x, size * 0.02, size * z]}>
              <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.07, 7]} />
              <meshStandardMaterial color="#0088ff" emissive="#0044cc" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export function CyberpunkCar({ pos, size }: P10) {
  const neonRef1 = useRef<THREE.Mesh>(null!)
  const neonRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const i = 0.7 + Math.sin(t * 1.5) * 0.3
    if (neonRef1.current) (neonRef1.current.material as THREE.MeshStandardMaterial).emissiveIntensity = i
    if (neonRef2.current) (neonRef2.current.material as THREE.MeshStandardMaterial).emissiveIntensity = i
  })
  return (
    <group position={pos}>
      {/* lower body */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.25, size * 0.56]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size * 0.44, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color="#0a0a18" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.2, size * 0.44, 0]}>
        <boxGeometry args={[size * 0.22, size * 0.22, size * 0.48]} />
        <meshStandardMaterial color="#4488cc" transparent opacity={0.5} metalness={0.1} roughness={0.05} />
      </mesh>
      {/* under-glow */}
      <mesh ref={neonRef1} position={[0, size * 0.07, 0]}>
        <boxGeometry args={[size * 1.08, size * 0.02, size * 0.54]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.8} />
      </mesh>
      {/* rear glow */}
      <mesh ref={neonRef2} position={[-size * 0.56, size * 0.2, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.14, size * 0.5]} />
        <meshStandardMaterial color="#ff2244" emissive="#ff0044" emissiveIntensity={0.8} />
      </mesh>
      {/* wheels */}
      {([[0.38, 0.22], [-0.38, 0.22], [0.38, -0.22], [-0.38, -0.22]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.12, size * z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.13, size * 0.05, 7, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ServerRack({ pos, size }: P10) {
  const ledRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ledRef.current) {
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        ((Math.sin(clock.getElapsedTime() * 7) + 1) / 2) * 1.5
    }
  })
  return (
    <group position={pos}>
      {/* rack body */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 1.4, size * 0.4]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* server units */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, size * (0.1 + i * 0.22), size * 0.21]}>
          <boxGeometry args={[size * 0.56, size * 0.18, size * 0.02]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
        </mesh>
      ))}
      {/* LED strip */}
      <mesh ref={ledRef} position={[size * 0.32, size * 0.7, size * 0.21]}>
        <boxGeometry args={[size * 0.025, size * 1.3, size * 0.025]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
      </mesh>
      {/* fans */}
      {([0.3, 0.9] as number[]).map((h, i) => (
        <mesh key={i} position={[-size * 0.22, size * h, size * 0.21]}>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.03, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function CyberStreetLamp({ pos, color, size }: P10) {
  const c = color || '#ff8800'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 0.8) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.055, size * 1.4, 6]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* arm */}
      <mesh position={[size * 0.18, size * 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.4, 5]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* lamp housing */}
      <mesh position={[size * 0.38, size * 1.28, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.1, size * 0.15]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* neon glow */}
      <mesh ref={glowRef} position={[size * 0.38, size * 1.23, 0]}>
        <boxGeometry args={[size * 0.2, size * 0.03, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} transparent opacity={0.9} />
      </mesh>
      {/* neon stripe on pole */}
      <mesh position={[0, size * 0.4, size * 0.04]}>
        <boxGeometry args={[size * 0.025, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

export function RainPuddle({ pos, color, size }: P10) {
  const c = color || '#334455'
  const reflectRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (reflectRef.current) {
      (reflectRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.15 + Math.sin(clock.getElapsedTime() * 2.5) * 0.1
    }
  })
  return (
    <group position={pos}>
      {/* puddle base */}
      <mesh position={[0, size * 0.01, 0]}>
        <cylinderGeometry args={[size * 0.6, size * 0.55, size * 0.02, 16]} />
        <meshStandardMaterial color={c} metalness={0.1} roughness={0.05} transparent opacity={0.7} />
      </mesh>
      {/* neon reflection */}
      <mesh ref={reflectRef} position={[0, size * 0.02, 0]}>
        <cylinderGeometry args={[size * 0.35, size * 0.3, size * 0.005, 12]} />
        <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.2} transparent opacity={0.4} />
      </mesh>
      {/* ripple rings */}
      {([0.35, 0.52] as number[]).map((r, i) => (
        <mesh key={i} position={[0, size * 0.015, 0]}>
          <torusGeometry args={[size * r, size * 0.01, 4, 20]} />
          <meshStandardMaterial color="#88aacc" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function GraffitiWall({ pos, size }: P10) {
  return (
    <group position={pos}>
      {/* wall */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 1.2, size * 0.12]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* graffiti layers — abstract colored rectangles */}
      {([
        [0, 0.7, '#ff0066', 0.8, 0.4],
        [-0.2, 0.4, '#00ffcc', 0.5, 0.5],
        [0.25, 0.8, '#ffdd00', 0.3, 0.25],
        [0, 1.0, '#aa44ff', 0.7, 0.2],
        [-0.3, 0.65, '#ff4400', 0.3, 0.3],
      ] as [number, number, string, number, number][]).map(([x, y, col, w, h], i) => (
        <mesh key={i} position={[size * x, size * y, size * 0.065]}>
          <boxGeometry args={[size * w, size * h, size * 0.01]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.2} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

export function CyberTrash({ pos, size }: P10) {
  return (
    <group position={pos}>
      {/* main heap */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.35, 0]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* scattered pieces */}
      {([
        [0.28, 0.08, 0.15, '#222233'],
        [-0.25, 0.06, -0.1, '#333344'],
        [0.05, 0.06, -0.28, '#1a1a2e'],
        [-0.15, 0.14, 0.22, '#222233'],
      ] as [number, number, number, string][]).map(([x, y, z, col], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} rotation={[i * 0.4, i * 0.7, i * 0.3]}>
          <boxGeometry args={[size * 0.18, size * 0.12, size * 0.1]} />
          <meshStandardMaterial color={col} roughness={0.7} />
        </mesh>
      ))}
      {/* glowing chip */}
      <mesh position={[size * 0.12, size * 0.38, size * 0.1]}>
        <boxGeometry args={[size * 0.1, size * 0.06, size * 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.5} />
      </mesh>
      {/* wire coil */}
      <mesh position={[-size * 0.12, size * 0.1, size * 0.15]} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[size * 0.08, size * 0.015, 5, 10]} />
        <meshStandardMaterial color="#ff4400" roughness={0.5} />
      </mesh>
    </group>
  )
}
