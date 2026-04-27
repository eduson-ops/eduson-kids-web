import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Batch 8: Fantasy-2 ───────────────────────────────────────────────────────
interface P8 { pos: [number,number,number]; color: string; size: number }

export function WizardTower({ pos, color, size }: P8) {
  const c = color || '#4b2882'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15
      glowRef.current.scale.setScalar(s)
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.6, size, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* mid */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.5, size * 0.7, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* top cone */}
      <mesh position={[0, size * 1.95, 0]} castShadow>
        <coneGeometry args={[size * 0.4, size * 0.7, 8]} />
        <meshStandardMaterial color="#1a0a30" roughness={0.6} />
      </mesh>
      {/* glowing orb on top */}
      <mesh ref={glowRef} position={[0, size * 2.45, 0]}>
        <sphereGeometry args={[size * 0.15, 10, 10]} />
        <meshStandardMaterial color="#bb88ff" emissive="#aa66ff" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* windows */}
      {([0.6, 1.2] as number[]).map((h, i) => (
        <mesh key={i} position={[size * 0.5, size * h, 0]}>
          <boxGeometry args={[size * 0.08, size * 0.2, size * 0.18]} />
          <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function DragonStatue({ pos, color, size }: P8) {
  const c = color || '#2d8b2d'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <capsuleGeometry args={[size * 0.35, size * 0.6, 6, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 1.1, size * 0.2]} rotation={[-0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.28, size * 0.5, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.45, size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.3, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* left wing */}
      <mesh position={[size * 0.6, size * 0.9, 0]} rotation={[0, 0.3, -0.4]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} side={2} />
      </mesh>
      {/* right wing */}
      <mesh position={[-size * 0.6, size * 0.9, 0]} rotation={[0, -0.3, 0.4]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} side={2} />
      </mesh>
      {/* tail */}
      <mesh position={[0, size * 0.3, -size * 0.6]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[size * 0.15, size * 0.8, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* eyes glow */}
      <mesh position={[size * 0.12, size * 1.5, size * 0.62]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-size * 0.12, size * 1.5, size * 0.62]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

export function MagicWand({ pos, color, size }: P8) {
  const c = color || '#ffd700'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * size * 0.1
      floatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.15
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef}>
        {/* handle */}
        <mesh position={[0, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size, 8]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
        </mesh>
        {/* tip star */}
        <mesh position={[0, size * 1.1, 0]}>
          <octahedronGeometry args={[size * 0.18]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} metalness={0.3} />
        </mesh>
        {/* sparkles */}
        {([0.3, 0.6, 0.9] as number[]).map((h, i) => (
          <mesh key={i} position={[size * (i % 2 === 0 ? 0.12 : -0.12), size * h, 0]}>
            <sphereGeometry args={[size * 0.04, 4, 4]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function SpellBook({ pos, color, size }: P8) {
  const c = color || '#8b0000'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* cover */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* left page */}
      <mesh position={[-size * 0.17, size * 0.12, 0]}>
        <boxGeometry args={[size * 0.32, size * 0.01, size * 0.82]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* right page */}
      <mesh position={[size * 0.17, size * 0.12, 0]}>
        <boxGeometry args={[size * 0.32, size * 0.01, size * 0.82]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* glow rune */}
      <mesh ref={glowRef} position={[0, size * 0.14, 0]}>
        <octahedronGeometry args={[size * 0.12]} />
        <meshStandardMaterial color="#aa44ff" emissive="#aa44ff" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function EnchantedSword({ pos, color, size }: P8) {
  const c = color || '#4488ff'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.5
    }
  })
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 12]}>
      {/* stone base */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.4, size * 0.5]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>
      {/* blade */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 1.2, size * 0.06]} />
        <meshStandardMaterial color="#ddeeff" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* crossguard */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.08, size * 0.12]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* glow */}
      <mesh ref={glowRef} position={[0, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.18, size * 1.25, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export function AlchemyTable({ pos, color, size }: P8) {
  const c = color || '#3a2b1a'
  const bubbleRef1 = useRef<THREE.Mesh>(null!)
  const bubbleRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (bubbleRef1.current) bubbleRef1.current.position.y = size * 0.85 + Math.sin(t * 2) * size * 0.05
    if (bubbleRef2.current) bubbleRef2.current.position.y = size * 0.9 + Math.sin(t * 2.5 + 1) * size * 0.05
  })
  return (
    <group position={pos}>
      {/* tabletop */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.08, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* legs */}
      {([-0.5, 0.5] as number[]).map((x, i) =>
        ([-0.35, 0.35] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[size * x, size * 0.27, size * z]}>
            <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.55, 6]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))
      )}
      {/* flask 1 */}
      <mesh position={[-size * 0.3, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.28, 8]} />
        <meshStandardMaterial color="#22cc88" transparent opacity={0.7} emissive="#22cc88" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={bubbleRef1} position={[-size * 0.3, size * 0.85, 0]}>
        <sphereGeometry args={[size * 0.1, 8, 8]} />
        <meshStandardMaterial color="#22cc88" transparent opacity={0.5} emissive="#22cc88" emissiveIntensity={0.5} />
      </mesh>
      {/* flask 2 */}
      <mesh position={[size * 0.25, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.1, size * 0.22, 8]} />
        <meshStandardMaterial color="#ff4444" transparent opacity={0.7} emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={bubbleRef2} position={[size * 0.25, size * 0.9, 0]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshStandardMaterial color="#ff4444" transparent opacity={0.5} emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      {/* book prop */}
      <mesh position={[size * 0.45, size * 0.62, size * 0.2]} rotation={[0, -0.3, 0.4]}>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.22]} />
        <meshStandardMaterial color="#5a3010" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function FairyHouse({ pos, color, size }: P8) {
  const c = color || '#ff9454'
  const lightRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (lightRef.current) {
      (lightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* main mushroom stem / wall */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.4, size, 12]} />
        <meshStandardMaterial color="#f5ecd4" roughness={0.8} />
      </mesh>
      {/* roof cap */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <coneGeometry args={[size * 0.7, size * 0.8, 12]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* cap spots */}
      {([0, 1.2, 2.4, 3.6, 4.8] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.45,
          size * 1.25,
          Math.cos(angle) * size * 0.45,
        ]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[0, size * 0.42, size * 0.39]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#7a4a1e" roughness={0.8} />
      </mesh>
      {/* window glow */}
      <mesh ref={lightRef} position={[0, size * 0.65, size * 0.38]}>
        <circleGeometry args={[size * 0.1, 8]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function RuneStoneGlow({ pos, color, size }: P8) {
  const c = color || '#7b2fff'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* main stone */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 1.6, size * 0.22]} />
        <meshStandardMaterial color="#555566" roughness={0.9} />
      </mesh>
      {/* rune face glow */}
      <mesh ref={glowRef} position={[0, size * 0.9, size * 0.12]}>
        <boxGeometry args={[size * 0.36, size * 1.2, size * 0.04]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      {/* small rune symbols */}
      {([0.3, 0.7, 1.1, 1.4] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, size * 0.13]}>
          <boxGeometry args={[size * 0.22, size * 0.08, size * 0.02]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

export function MagicMirror({ pos, color, size }: P8) {
  const c = color || '#88aaff'
  const surfaceRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (surfaceRef.current) {
      const t = clock.getElapsedTime()
      ;(surfaceRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 1.2) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* frame */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.07, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* mirror surface */}
      <mesh ref={surfaceRef} position={[0, size * 1.0, size * 0.04]}>
        <circleGeometry args={[size * 0.48, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} metalness={0.9} roughness={0.05} transparent opacity={0.85} />
      </mesh>
      {/* stand */}
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.5, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.28, size * 0.08, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function CursedChest({ pos, color, size }: P8) {
  const c = color || '#1a4a1a'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.55, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.22, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* eerie glow seam */}
      <mesh ref={glowRef} position={[0, size * 0.56, size * 0.33]}>
        <boxGeometry args={[size * 0.88, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#44ff44" emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
      {/* lock skull */}
      <mesh position={[0, size * 0.42, size * 0.33]}>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshStandardMaterial color="#334433" roughness={0.8} />
      </mesh>
      {/* corners metal */}
      {([-0.43, 0.43] as number[]).map((x, i) =>
        ([-0.31, 0.31] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[size * x, size * 0.28, size * z]}>
            <boxGeometry args={[size * 0.08, size * 0.6, size * 0.08]} />
            <meshStandardMaterial color="#2a5a2a" metalness={0.5} roughness={0.4} />
          </mesh>
        ))
      )}
    </group>
  )
}

// ─── Batch 8: Sci-Tech ────────────────────────────────────────────────────────

export function HologramDisplay({ pos, color, size }: P8) {
  const c = color || '#00ccff'
  const holoRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (holoRef.current) {
      holoRef.current.rotation.y = clock.getElapsedTime() * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* base platform */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.45, size * 0.08, 10]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* emitter ring */}
      <mesh position={[0, size * 0.1, 0]}>
        <torusGeometry args={[size * 0.3, size * 0.03, 6, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
      {/* hologram content */}
      <group ref={holoRef} position={[0, size * 0.65, 0]}>
        <mesh>
          <boxGeometry args={[size * 0.35, size * 0.5, size * 0.05]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} transparent opacity={0.4} side={2} />
        </mesh>
        {/* data lines */}
        {([0.1, 0.2, 0.3] as number[]).map((h, i) => (
          <mesh key={i} position={[0, size * (h - 0.15), size * 0.03]}>
            <boxGeometry args={[size * (0.25 - i * 0.05), size * 0.02, size * 0.01]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function TeslaCoil({ pos, size }: P8) {
  const sparkRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sparkRef.current) {
      const t = clock.getElapsedTime()
      ;(sparkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (Math.sin(t * 12) > 0.5 ? 3 : 0.1)
    }
  })
  return (
    <group position={pos}>
      {/* base ring */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.45, size * 0.12, 10]} />
        <meshStandardMaterial color="#444455" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* tower */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.16, size * 1.1, 8]} />
        <meshStandardMaterial color="#555566" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* top sphere */}
      <mesh position={[0, size * 1.25, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 14, 14]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* spark */}
      <mesh ref={sparkRef} position={[0, size * 1.25, 0]}>
        <sphereGeometry args={[size * 0.32, 8, 8]} />
        <meshStandardMaterial color="#cc88ff" emissive="#cc88ff" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      {/* coil rings */}
      {([0.3, 0.5, 0.7, 0.9] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * (0.14 - i * 0.01), size * 0.025, 4, 14]} />
          <meshStandardMaterial color="#aaaacc" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function DnaHelix({ pos, size }: P8) {
  const helixRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (helixRef.current) helixRef.current.rotation.y = clock.getElapsedTime() * 0.8
  })
  const steps = 10
  return (
    <group position={pos}>
      <group ref={helixRef}>
        {Array.from({ length: steps }).map((_, i) => {
          const angle = (i / steps) * Math.PI * 4
          const y = (i / steps) * 1.5
          return (
            <group key={i}>
              <mesh position={[Math.sin(angle) * size * 0.25, size * (y + 0.1), Math.cos(angle) * size * 0.25]}>
                <sphereGeometry args={[size * 0.07, 6, 6]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[-Math.sin(angle) * size * 0.25, size * (y + 0.1), -Math.cos(angle) * size * 0.25]}>
                <sphereGeometry args={[size * 0.07, 6, 6]} />
                <meshStandardMaterial color="#ff4488" emissive="#ff4488" emissiveIntensity={0.8} />
              </mesh>
              {/* crossbar */}
              <mesh position={[0, size * (y + 0.1), 0]} rotation={[0, angle, Math.PI / 2]}>
                <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.5, 5]} />
                <meshStandardMaterial color="#aaffcc" />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export function LaserBeam({ pos, color, size }: P8) {
  const c = color || '#ff0044'
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.6 + Math.sin(clock.getElapsedTime() * 8) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* emitter base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.2, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* beam */}
      <mesh ref={beamRef} position={[0, size * 1.1, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 2, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      {/* tip glow */}
      <mesh position={[0, size * 0.22, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function ComputerTerminal({ pos, size }: P8) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (screenRef.current) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    }
  })
  return (
    <group position={pos}>
      {/* base unit */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.8, size * 0.3]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.5, size * 0.16]}>
        <boxGeometry args={[size * 0.6, size * 0.5, size * 0.02]} />
        <meshStandardMaterial color="#004488" emissive="#0066cc" emissiveIntensity={0.5} />
      </mesh>
      {/* side panels */}
      <mesh position={[size * 0.36, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.75, size * 0.28]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-size * 0.36, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.75, size * 0.28]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      {/* keyboard */}
      <mesh position={[0, size * 0.04, size * 0.22]}>
        <boxGeometry args={[size * 0.65, size * 0.04, size * 0.32]} />
        <meshStandardMaterial color="#111122" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function ReactorCore({ pos, color, size }: P8) {
  const c = color || '#88ff44'
  const coreRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (coreRef.current) {
      const t = clock.getElapsedTime()
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(t * 2) * 0.8
    }
  })
  return (
    <group position={pos}>
      {/* outer housing */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.55, size * 1.4, 10]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* core glow */}
      <mesh ref={coreRef} position={[0, size * 0.7, 0]}>
        <sphereGeometry args={[size * 0.3, 12, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* rings */}
      {([0.3, 0.7, 1.1] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.52, size * 0.03, 5, 18]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* vents */}
      {([0, Math.PI / 2, Math.PI, Math.PI * 1.5] as number[]).map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * size * 0.52, size * 0.7, Math.cos(a) * size * 0.52]}>
          <boxGeometry args={[size * 0.1, size * 0.4, size * 0.08]} />
          <meshStandardMaterial color="#333344" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function DataTower({ pos, color, size }: P8) {
  const c = color || '#0044ff'
  const ledRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ledRef.current) {
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + ((Math.sin(clock.getElapsedTime() * 5) + 1) / 2) * 1.5
    }
  })
  return (
    <group position={pos}>
      {/* main shaft */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 2.0, size * 0.45]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* LED strips */}
      <mesh ref={ledRef} position={[size * 0.23, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.03, size * 1.9, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
      </mesh>
      <mesh position={[-size * 0.23, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.03, size * 1.9, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
      </mesh>
      {/* shelf rings */}
      {([0.4, 0.9, 1.4, 1.85] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <boxGeometry args={[size * 0.52, size * 0.04, size * 0.52]} />
          <meshStandardMaterial color="#1a1a33" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* top antenna */}
      <mesh position={[0, size * 2.15, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.04, size * 0.3, 6]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function MagnifyingGlass({ pos, size }: P8) {
  return (
    <group position={pos} rotation={[0, 0, 0.4]}>
      {/* lens ring */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <torusGeometry args={[size * 0.38, size * 0.06, 8, 24]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* glass */}
      <mesh position={[0, size * 0.7, 0]}>
        <circleGeometry args={[size * 0.34, 20]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.3} metalness={0.1} roughness={0.05} />
      </mesh>
      {/* handle */}
      <mesh position={[size * 0.18, size * 0.24, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 0.7, 8]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function PortalGun({ pos, color, size }: P8) {
  const c = color || '#ff8800'
  const muzzleRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (muzzleRef.current) {
      (muzzleRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + Math.sin(clock.getElapsedTime() * 4) * 0.5
    }
  })
  return (
    <group position={pos} rotation={[0, Math.PI / 4, 0]}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <capsuleGeometry args={[size * 0.15, size * 0.55, 6, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* barrel */}
      <mesh position={[0, size * 0.85, size * 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.65, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* muzzle glow */}
      <mesh ref={muzzleRef} position={[0, size * 0.85, size * 0.65]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>
      {/* handle */}
      <mesh position={[0, size * 0.18, 0]}>
        <boxGeometry args={[size * 0.15, size * 0.35, size * 0.22]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* accent stripe */}
      <mesh position={[size * 0.16, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.03, size * 0.55, size * 0.3]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function HoverPad({ pos, color, size }: P8) {
  const c = color || '#44aaff'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * size * 0.06
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef}>
        {/* pad surface */}
        <mesh position={[0, size * 0.08, 0]} castShadow>
          <cylinderGeometry args={[size * 0.55, size * 0.5, size * 0.12, 12]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* edge glow */}
        <mesh position={[0, size * 0.08, 0]}>
          <torusGeometry args={[size * 0.52, size * 0.04, 6, 20]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
        </mesh>
        {/* underside thruster glow */}
        <mesh position={[0, size * 0.01, 0]}>
          <circleGeometry args={[size * 0.4, 16]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
        {/* top markings */}
        <mesh position={[0, size * 0.15, 0]}>
          <circleGeometry args={[size * 0.25, 12]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  )
}
