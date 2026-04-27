import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Batch 13: Desert Oasis ───────────────────────────────────────────────────
interface P13 { pos: [number,number,number]; color: string; size: number }

export function SandDune({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* main dune body */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <sphereGeometry args={[size * 0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* secondary smaller dune */}
      <mesh position={[size * 0.42, size * 0.12, size * 0.2]}>
        <sphereGeometry args={[size * 0.32, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* crest highlight */}
      <mesh position={[0, size * 0.36, size * 0.1]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[size * 0.9, size * 0.04, size * 0.12]} />
        <meshStandardMaterial color="#e8cc88" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function OasisPool({ pos, color, size }: P13) {
  const water = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 1.2
    if (water.current) {
      ;(water.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(t.current) * 0.1
    }
  })
  return (
    <group position={pos}>
      {/* sandy rim */}
      <mesh position={[0, size * 0.04, 0]}>
        <torusGeometry args={[size * 0.44, size * 0.12, 5, 14]} />
        <meshStandardMaterial color="#c8a055" roughness={0.95} />
      </mesh>
      {/* pool floor */}
      <mesh position={[0, -size * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.36, 14]} />
        <meshStandardMaterial color="#336688" roughness={0.6} />
      </mesh>
      {/* water surface */}
      <mesh ref={water} position={[0, size * 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.36, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.1} metalness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* grass tufts */}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 4) * Math.PI * 2) * size * 0.48,
          size * 0.08,
          Math.sin((i / 4) * Math.PI * 2) * size * 0.48,
        ]}>
          <coneGeometry args={[size * 0.04, size * 0.18, 4]} />
          <meshStandardMaterial color="#6a8840" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function DatePalm({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* trunk with natural curve */}
      <mesh position={[size * 0.04, size * 0.45, 0]} rotation={[0, 0, 0.06]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.9, 7]} />
        <meshStandardMaterial color="#7a5020" roughness={0.9} />
      </mesh>
      {/* trunk rings */}
      {([0.15, 0.3, 0.5, 0.68] as number[]).map((y, i) => (
        <mesh key={i} position={[size * 0.04, size * y, 0]}>
          <torusGeometry args={[size * 0.085, size * 0.018, 4, 8]} />
          <meshStandardMaterial color="#5a3810" roughness={0.9} />
        </mesh>
      ))}
      {/* fronds */}
      {([0, 1, 2, 3, 4, 5] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.92, 0]}
          rotation={[0.6, (i / 6) * Math.PI * 2, 0]}>
          <boxGeometry args={[size * 0.06, size * 0.5, size * 0.08]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* date clusters */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos(i * 2.1) * size * 0.18,
          size * 0.84,
          Math.sin(i * 2.1) * size * 0.18,
        ]}>
          <sphereGeometry args={[size * 0.08, 6, 4]} />
          <meshStandardMaterial color="#aa4400" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function DesertTent({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* tent peak pole */}
      <mesh position={[0, size * 0.72, 0]}>
        <cylinderGeometry args={[size * 0.025, size * 0.03, size * 0.5, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* left slope */}
      <mesh position={[-size * 0.36, size * 0.44, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[size * 0.78, size * 0.04, size * 0.82]} />
        <meshStandardMaterial color={color} roughness={0.7} side={2} />
      </mesh>
      {/* right slope */}
      <mesh position={[size * 0.36, size * 0.44, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[size * 0.78, size * 0.04, size * 0.82]} />
        <meshStandardMaterial color={color} roughness={0.7} side={2} />
      </mesh>
      {/* front panel (open) */}
      <mesh position={[0, size * 0.24, size * 0.4]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[size * 0.4, size * 0.44, size * 0.03]} />
        <meshStandardMaterial color="#cc8822" roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {/* floor */}
      <mesh position={[0, size * 0.02, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.03, size * 0.82]} />
        <meshStandardMaterial color="#aa7733" roughness={0.85} />
      </mesh>
      {/* guy ropes */}
      {([-0.55, 0.55] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.3, 0]} rotation={[0, 0, x > 0 ? -0.9 : 0.9]}>
          <cylinderGeometry args={[size * 0.01, size * 0.01, size * 0.7, 3]} />
          <meshStandardMaterial color="#ccaa66" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function CamelStatue({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.32, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.3, size * 0.28]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* hump */}
      <mesh position={[0, size * 0.54, 0]}>
        <sphereGeometry args={[size * 0.18, 9, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* neck */}
      <mesh position={[size * 0.28, size * 0.46, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.32, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* head */}
      <mesh position={[size * 0.44, size * 0.6, 0]}>
        <boxGeometry args={[size * 0.2, size * 0.15, size * 0.14]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* legs */}
      {([[-0.18, 0.12], [0.18, 0.12], [-0.18, -0.12], [0.18, -0.12]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.1, size * z]}>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.26, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* base */}
      <mesh position={[0, size * 0.02, 0]}>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.36]} />
        <meshStandardMaterial color="#9a8870" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function MiragePillar({ pos, color, size }: P13) {
  const haze = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 2
    if (haze.current) {
      haze.current.scale.x = 0.9 + Math.sin(t.current * 1.3) * 0.15
      haze.current.scale.z = 0.9 + Math.cos(t.current * 1.1) * 0.15
      ;(haze.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t.current) * 0.15
    }
  })
  return (
    <group position={pos}>
      {/* heat haze base */}
      <mesh ref={haze} position={[0, size * 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.32, 12]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.35} />
      </mesh>
      {/* mirage column */}
      <mesh position={[0, size * 0.44, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.18, size * 0.88, 10]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* top shimmer */}
      <mesh position={[0, size * 0.9, 0]}>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export function DesertScorpion({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* body segments */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.14, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.2, size * 0.1, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* claws */}
      {([-1, 1] as number[]).map((s, i) => (
        <group key={i}>
          <mesh position={[size * 0.3, size * 0.12, size * s * 0.18]} rotation={[0, s * 0.4, 0]}>
            <boxGeometry args={[size * 0.22, size * 0.1, size * 0.08]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[size * 0.42, size * 0.12, size * s * 0.24]} rotation={[0, s * 0.8, 0]}>
            <boxGeometry args={[size * 0.1, size * 0.08, size * 0.06]} />
            <meshStandardMaterial color="#886622" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* tail with stinger */}
      <mesh position={[-size * 0.32, size * 0.22, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.28, 5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.46, size * 0.42, 0]} rotation={[0, 0, -1.3]}>
        <cylinderGeometry args={[size * 0.025, size * 0.04, size * 0.2, 5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* stinger tip */}
      <mesh position={[-size * 0.52, size * 0.58, 0]} rotation={[0, 0, -1.8]}>
        <coneGeometry args={[size * 0.03, size * 0.08, 4]} />
        <meshStandardMaterial color="#440000" roughness={0.5} />
      </mesh>
      {/* legs */}
      {([0, 1, 2, 3] as number[]).map((i) => (
        <mesh key={i} position={[size * (0.1 - i * 0.06), size * 0.06, size * (i % 2 === 0 ? 0.14 : -0.14)]} rotation={[i % 2 === 0 ? 0.4 : -0.4, 0, 0]}>
          <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.2, 3]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function NomadBrazier({ pos, color, size }: P13) {
  const flame = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 4
    if (flame.current) {
      flame.current.scale.y = 0.85 + Math.sin(t.current) * 0.18
      flame.current.rotation.y += dt * 2
    }
  })
  return (
    <group position={pos}>
      {/* tripod legs */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[
          Math.cos((i / 3) * Math.PI * 2) * size * 0.22,
          size * 0.2,
          Math.sin((i / 3) * Math.PI * 2) * size * 0.22,
        ]} rotation={[0.35, (i / 3) * Math.PI * 2, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.03, size * 0.5, 4]} />
          <meshStandardMaterial color="#7a5010" roughness={0.8} />
        </mesh>
      ))}
      {/* bowl */}
      <mesh position={[0, size * 0.44, 0]}>
        <sphereGeometry args={[size * 0.22, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#6a4010" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* decorative band */}
      <mesh position={[0, size * 0.42, 0]}>
        <torusGeometry args={[size * 0.22, size * 0.025, 4, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* flame */}
      <group ref={flame} position={[0, size * 0.56, 0]}>
        <mesh>
          <coneGeometry args={[size * 0.12, size * 0.28, 5]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, size * 0.1, 0]}>
          <coneGeometry args={[size * 0.06, size * 0.16, 4]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={2.5} transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export function SandstoneArch({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* left pillar */}
      <mesh position={[-size * 0.42, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.8, size * 0.24]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* right pillar */}
      <mesh position={[size * 0.42, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.8, size * 0.24]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* arch keystone blocks */}
      {([0, 1, 2, 3, 4] as number[]).map((i) => {
        const angle = Math.PI - (i / 4) * Math.PI
        return (
          <mesh key={i} position={[
            Math.cos(angle) * size * 0.42,
            size * 0.82 + Math.sin(angle) * size * 0.3,
            0,
          ]} rotation={[0, 0, angle - Math.PI / 2]}>
            <boxGeometry args={[size * 0.25, size * 0.18, size * 0.24]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        )
      })}
      {/* erosion pits */}
      {([-0.28, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.3, size * 0.12]}>
          <sphereGeometry args={[size * 0.06, 6, 4]} />
          <meshStandardMaterial color="#b08040" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

export function DesertSkull({ pos, size }: P13) {
  return (
    <group position={pos}>
      {/* cranium */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 10, 8]} />
        <meshStandardMaterial color="#e8ddc0" roughness={0.6} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, size * 0.08, size * 0.1]}>
        <boxGeometry args={[size * 0.26, size * 0.08, size * 0.18]} />
        <meshStandardMaterial color="#ddd0a8" roughness={0.6} />
      </mesh>
      {/* eye sockets */}
      {([-0.1, 0.1] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.26, size * 0.19]}>
          <sphereGeometry args={[size * 0.06, 7, 5]} />
          <meshStandardMaterial color="#2a2010" roughness={0.9} />
        </mesh>
      ))}
      {/* nasal cavity */}
      <mesh position={[0, size * 0.18, size * 0.2]}>
        <boxGeometry args={[size * 0.04, size * 0.05, size * 0.04]} />
        <meshStandardMaterial color="#2a2010" roughness={0.9} />
      </mesh>
      {/* teeth */}
      {([-0.08, -0.02, 0.02, 0.08] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.06, size * 0.17]}>
          <boxGeometry args={[size * 0.04, size * 0.06, size * 0.04]} />
          <meshStandardMaterial color="#f0e8c8" roughness={0.5} />
        </mesh>
      ))}
      {/* horns */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * s * 0.2, size * 0.36, -size * 0.08]} rotation={[0, 0, s * 0.5]}>
          <coneGeometry args={[size * 0.04, size * 0.22, 5]} />
          <meshStandardMaterial color="#c8b890" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Batch 13: Medieval Castle ────────────────────────────────────────────────

export function CastleDoor({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* stone frame */}
      <mesh position={[0, size * 0.44, -size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.76, size * 0.88, size * 0.18]} />
        <meshStandardMaterial color="#778899" roughness={0.85} />
      </mesh>
      {/* door panels */}
      {([-0.18, 0.18] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.4, 0]}>
          <boxGeometry args={[size * 0.3, size * 0.72, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* door arch */}
      <mesh position={[0, size * 0.82, 0]}>
        <torusGeometry args={[size * 0.3, size * 0.08, 5, 10, Math.PI]} />
        <meshStandardMaterial color="#667788" roughness={0.8} />
      </mesh>
      {/* iron studs */}
      {([-0.14, 0, 0.14] as number[]).map((x) =>
        ([0.22, 0.44, 0.66] as number[]).map((y, j) => (
          <mesh key={`${x}-${j}`} position={[size * x, size * y, size * 0.06]}>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.04, 6]} />
            <meshStandardMaterial color="#334455" roughness={0.3} metalness={0.9} />
          </mesh>
        ))
      )}
      {/* door knocker */}
      <mesh position={[0, size * 0.44, size * 0.07]}>
        <torusGeometry args={[size * 0.06, size * 0.018, 4, 8]} />
        <meshStandardMaterial color="#445566" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function Drawbridge({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* bridge planks */}
      {([0.28, 0.14, 0, -0.14, -0.28] as number[]).map((z, i) => (
        <mesh key={i} position={[0, size * 0.04, size * z]}>
          <boxGeometry args={[size * 0.82, size * 0.07, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {/* chain links left */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[-size * 0.35, size * (0.22 + i * 0.18), -size * 0.28]} rotation={[Math.PI / 2, 0, 0.3]}>
          <torusGeometry args={[size * 0.04, size * 0.015, 4, 6]} />
          <meshStandardMaterial color="#778899" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* chain links right */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[size * 0.35, size * (0.22 + i * 0.18), -size * 0.28]} rotation={[Math.PI / 2, 0, -0.3]}>
          <torusGeometry args={[size * 0.04, size * 0.015, 4, 6]} />
          <meshStandardMaterial color="#778899" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* crossbeams */}
      {([0.24, -0.24] as number[]).map((z, i) => (
        <mesh key={i} position={[0, size * 0.06, size * z]}>
          <boxGeometry args={[size * 0.84, size * 0.08, size * 0.06]} />
          <meshStandardMaterial color="#7a5020" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function KnightArmor({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* display stand */}
      <mesh position={[0, size * 0.04, 0]}>
        <boxGeometry args={[size * 0.44, size * 0.08, size * 0.24]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
      </mesh>
      {/* stand pole */}
      <mesh position={[0, size * 0.22, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.28, 5]} />
        <meshStandardMaterial color="#6a4a2a" roughness={0.7} />
      </mesh>
      {/* torso breastplate */}
      <mesh position={[0, size * 0.54, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.36, size * 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* pauldrons */}
      {([-1, 1] as number[]).map((s, i) => (
        <mesh key={i} position={[size * s * 0.2, size * 0.66, 0]}>
          <sphereGeometry args={[size * 0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* helmet */}
      <mesh position={[0, size * 0.84, 0]}>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.2, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.96, 0]}>
        <sphereGeometry args={[size * 0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* visor slit */}
      <mesh position={[0, size * 0.88, size * 0.12]}>
        <boxGeometry args={[size * 0.14, size * 0.03, size * 0.04]} />
        <meshStandardMaterial color="#1a2030" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function CatapultProp({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* wheels */}
      {([-0.32, 0.32] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 10]} />
          <meshStandardMaterial color="#5a3a10" roughness={0.8} />
        </mesh>
      ))}
      {/* axle */}
      <mesh position={[0, size * 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.68, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* frame base */}
      <mesh position={[0, size * 0.24, 0]}>
        <boxGeometry args={[size * 0.64, size * 0.1, size * 0.28]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* beam arm down */}
      <mesh position={[-size * 0.1, size * 0.38, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[size * 0.06, size * 0.7, size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* counterweight */}
      <mesh position={[-size * 0.36, size * 0.42, 0]}>
        <boxGeometry args={[size * 0.18, size * 0.18, size * 0.18]} />
        <meshStandardMaterial color="#445566" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* sling cup (arm up position) */}
      <mesh position={[size * 0.14, size * 0.68, 0]}>
        <sphereGeometry args={[size * 0.1, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function DungeonDoor({ pos, size }: P13) {
  return (
    <group position={pos}>
      {/* stone surround */}
      <mesh position={[0, size * 0.44, -size * 0.05]} castShadow>
        <boxGeometry args={[size * 0.72, size * 0.88, size * 0.14]} />
        <meshStandardMaterial color="#556677" roughness={0.9} />
      </mesh>
      {/* iron bars */}
      {([-0.24, -0.08, 0.08, 0.24] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.42, size * 0.02]}>
          <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.76, 5]} />
          <meshStandardMaterial color="#334444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* horizontal crossbars */}
      {([0.2, 0.5, 0.72] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, size * 0.02]}>
          <boxGeometry args={[size * 0.56, size * 0.05, size * 0.06]} />
          <meshStandardMaterial color="#334444" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      {/* keyhole */}
      <mesh position={[0, size * 0.36, size * 0.04]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.04, 8]} />
        <meshStandardMaterial color="#221111" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function HeraldicBanner({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 6]} />
        <meshStandardMaterial color="#8b6a1a" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* banner cloth */}
      <mesh position={[size * 0.28, size * 0.68, 0]}>
        <boxGeometry args={[size * 0.52, size * 0.58, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} side={2} />
      </mesh>
      {/* banner tail cut */}
      <mesh position={[size * 0.38, size * 0.34, 0]}>
        <boxGeometry args={[size * 0.3, size * 0.14, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.7} side={2} />
      </mesh>
      {/* heraldic cross */}
      <mesh position={[size * 0.28, size * 0.68, size * 0.025]}>
        <boxGeometry args={[size * 0.3, size * 0.06, size * 0.02]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.28, size * 0.68, size * 0.025]}>
        <boxGeometry args={[size * 0.06, size * 0.3, size * 0.02]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.5} />
      </mesh>
      {/* finial */}
      <mesh position={[0, size * 1.12, 0]}>
        <sphereGeometry args={[size * 0.07, 6, 5]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function ArrowSlit({ pos, size }: P13) {
  return (
    <group position={pos}>
      {/* wall segment */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <boxGeometry args={[size * 0.78, size * 0.7, size * 0.3]} />
        <meshStandardMaterial color="#778899" roughness={0.85} />
      </mesh>
      {/* slit opening (vertical) */}
      <mesh position={[0, size * 0.38, size * 0.15]}>
        <boxGeometry args={[size * 0.05, size * 0.36, size * 0.32]} />
        <meshStandardMaterial color="#1a2030" roughness={0.9} />
      </mesh>
      {/* slit opening (horizontal crossbar) */}
      <mesh position={[0, size * 0.35, size * 0.15]}>
        <boxGeometry args={[size * 0.18, size * 0.05, size * 0.32]} />
        <meshStandardMaterial color="#1a2030" roughness={0.9} />
      </mesh>
      {/* stone texture rows */}
      {([0.1, 0.26, 0.42, 0.58] as number[]).map((y, i) => (
        <mesh key={i} position={[(i % 2 === 0 ? 0.2 : 0) * size, size * y, size * 0.16]}>
          <boxGeometry args={[size * 0.35, size * 0.03, size * 0.02]} />
          <meshStandardMaterial color="#667788" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function WallTorch({ pos, color, size }: P13) {
  const flame = useRef<THREE.Group>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 5
    if (flame.current) {
      flame.current.scale.y = 0.8 + Math.sin(t.current) * 0.25
      flame.current.position.x = Math.sin(t.current * 0.8) * size * 0.02
    }
  })
  return (
    <group position={pos}>
      {/* wall backing */}
      <mesh position={[0, size * 0.35, -size * 0.06]}>
        <boxGeometry args={[size * 0.24, size * 0.46, size * 0.12]} />
        <meshStandardMaterial color="#667788" roughness={0.85} />
      </mesh>
      {/* bracket arm */}
      <mesh position={[0, size * 0.44, size * 0.08]}>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.28]} />
        <meshStandardMaterial color="#334455" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* torch handle */}
      <mesh position={[0, size * 0.36, size * 0.18]}>
        <cylinderGeometry args={[size * 0.035, size * 0.04, size * 0.3, 6]} />
        <meshStandardMaterial color="#7a5010" roughness={0.8} />
      </mesh>
      {/* torch head */}
      <mesh position={[0, size * 0.54, size * 0.18]}>
        <cylinderGeometry args={[size * 0.055, size * 0.045, size * 0.1, 7]} />
        <meshStandardMaterial color="#443322" roughness={0.6} />
      </mesh>
      {/* flame */}
      <group ref={flame} position={[0, size * 0.64, size * 0.18]}>
        <mesh>
          <coneGeometry args={[size * 0.055, size * 0.15, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export function MoatWater({ pos, color, size }: P13) {
  const water = useRef<THREE.Mesh>(null!)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.8
    if (water.current) water.current.rotation.y += dt * 0.05
  })
  return (
    <group position={pos}>
      {/* stone-lined channel */}
      <mesh position={[0, -size * 0.08, 0]}>
        <boxGeometry args={[size * 1.1, size * 0.18, size * 0.6]} />
        <meshStandardMaterial color="#556677" roughness={0.85} />
      </mesh>
      {/* inner water surface */}
      <mesh ref={water} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size * 0.96, size * 0.46, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      {/* algae spots */}
      {([[-0.3, 0.1], [0.2, -0.12], [0, 0.18]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.01, size * z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[size * 0.06, 6]} />
          <meshStandardMaterial color="#336622" roughness={0.8} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function Portcullis({ pos, color, size }: P13) {
  return (
    <group position={pos}>
      {/* gate frame */}
      <mesh position={[-size * 0.4, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 1.0, size * 0.14]} />
        <meshStandardMaterial color="#667788" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.4, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 1.0, size * 0.14]} />
        <meshStandardMaterial color="#667788" roughness={0.8} />
      </mesh>
      {/* top bar */}
      <mesh position={[0, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.9, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color="#667788" roughness={0.8} />
      </mesh>
      {/* vertical iron bars */}
      {([-0.28, -0.1, 0.1, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.46, 0]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.84, 5]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* horizontal bar */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.05, size * 0.09]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* spike tips */}
      {([-0.28, -0.1, 0.1, 0.28] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.06, 0]}>
          <coneGeometry args={[size * 0.04, size * 0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ── BATCH 14: Rainforest + Arctic Research ───────────────────────────────────
interface P14 { pos: [number,number,number]; color: string; size: number }

export function JungleCanopy({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <sphereGeometry args={[size * 0.9, 10, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size * 0.5, size * 1.0, 0.2]} castShadow>
        <sphereGeometry args={[size * 0.6, 8, 5]} />
        <meshStandardMaterial color="#1a7a1a" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 1.2, 7]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
    </group>
  )
}

export function Lianas({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.2, 0]} rotation={[0.4, 0, 0.3]}>
          <torusGeometry args={[size * 0.15, size * 0.02, 5, 10, Math.PI]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

export function TreeFrog({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <sphereGeometry args={[size * 0.25, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[[-0.18, 0.35, 0.12], [0.18, 0.35, 0.12]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, p[1] * size, p[2] * size]}>
          <sphereGeometry args={[size * 0.07, 6, 5]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {[[-0.22, 0.1, 0.1], [0.22, 0.1, 0.1], [-0.15, 0.1, -0.15], [0.15, 0.1, -0.15]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, p[1] * size, p[2] * size]} rotation={[0, 0, i < 2 ? 0.5 : -0.5]}>
          <cylinderGeometry args={[size * 0.03, size * 0.02, size * 0.22, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

export function ToucanPerch({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.8, 6]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 8, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[size * 0.28, size * 0.84, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.03, size * 0.45, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-size * 0.12, size * 0.88, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

export function JungleWaterfall({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.6, -size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.6, size * 1.2, size * 0.12]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.4, size * 0.5, size * 0.1, 10]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.05, size * 0.15]}>
          <sphereGeometry args={[size * 0.06, 6, 5]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[-size * 0.4, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.5, size * 0.18]} />
        <meshStandardMaterial color="#3d8b3d" />
      </mesh>
      <mesh position={[size * 0.4, size * 0.9, 0]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.7, size * 0.18]} />
        <meshStandardMaterial color="#2d7a2d" />
      </mesh>
    </group>
  )
}

export function OrchidBloom({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.6, 6]} />
        <meshStandardMaterial color="#4a7c3f" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, size * 0.6, 0]} rotation={[Math.PI / 4, (i / 5) * Math.PI * 2, 0]} castShadow>
          <sphereGeometry args={[size * 0.18, 5, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.6, size * 0.1]} castShadow>
        <sphereGeometry args={[size * 0.12, 6, 5]} />
        <meshStandardMaterial color="#ffeecc" emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function JaguarStatue({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.36, size * 0.85]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.52, size * 0.32]} castShadow>
        <sphereGeometry args={[size * 0.28, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[[-0.12, 0.58, 0.5], [0.12, 0.58, 0.5]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, p[1] * size, p[2] * size]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.12, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.52, -size * 0.45]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.04, size * 0.5, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.01, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.5, size * 0.08, 8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function VineLadder({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size, 5]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.44, 5]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
      ))}
    </group>
  )
}

export function LeafPlatform({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <cylinderGeometry args={[size * 0.7, size * 0.65, size * 0.1, 7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[Math.cos((i / 7) * Math.PI * 2) * size * 0.5, size * 0.08, Math.sin((i / 7) * Math.PI * 2) * size * 0.5]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.04, size * 0.08]} />
          <meshStandardMaterial color="#1a6620" />
        </mesh>
      ))}
      <mesh position={[0, size * 0.1, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.08, 7]} />
        <meshStandardMaterial color="#228822" />
      </mesh>
    </group>
  )
}

export function JungleHut({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.75, 0]} castShadow>
        <coneGeometry args={[size * 0.6, size * 0.55, 8]} />
        <meshStandardMaterial color="#8b6a20" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.3, size * 0.45]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.4, size * 0.06]} />
        <meshStandardMaterial color="#5a3a10" />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.35, size * 0.44]}>
          <boxGeometry args={[size * 0.12, size * 0.18, size * 0.05]} />
          <meshStandardMaterial color="#3a5a1a" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Arctic Research ───────────────────────────────────────────────────────────

export function IglooLab({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.55, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.06, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size * 0.5, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.3, size * 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[0.1, 0.2, 0.3].map((y, i) => (
        <mesh key={i} position={[size * 0.55, y * size, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.04, size * 0.25]} />
          <meshStandardMaterial color="#aaccee" roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function IceDrill({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.9, size * 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.03, size * 0.5, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.65, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.55, 6]} />
          <meshStandardMaterial color="#888888" metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.18, 6]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

export function PolarBuoy({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.35, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.7, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.08, 0]} castShadow>
        <sphereGeometry args={[size * 0.09, 6, 5]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, size * (0.2 + i * 0.12), 0]}>
          <torusGeometry args={[size * 0.38, size * 0.03, 5, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

export function Snowcat({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.32, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.45, size * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.25, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-0.22, 0.22].map((z, i) => (
        <group key={i} position={[0, size * 0.08, z * size]}>
          <mesh>
            <boxGeometry args={[size * 1.2, size * 0.12, size * 0.14]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
          {[-0.4, -0.1, 0.2].map((x, j) => (
            <mesh key={j} position={[x * size, 0, 0]}>
              <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.13, 8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function BlizzardShield({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.5, 0]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[size * 0.12, size, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      {[0.35, 0.65].map((y, i) => (
        <mesh key={i} position={[size * 0.08, y * size, 0]}>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 1.4, 6]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#aabbcc" metalness={0.5} />
        </mesh>
      ))}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={i} position={[-size * 0.1, 0, z * size]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.15, size * 0.06]} />
          <meshStandardMaterial color="#888899" />
        </mesh>
      ))}
    </group>
  )
}

export function AuroraPost({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.08, size * 1.3, 6]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} />
      </mesh>
      {[0.8, 1.0, 1.2].map((y, i) => (
        <mesh key={i} position={[size * (i % 2 === 0 ? 0.18 : -0.18), y * size, 0]} castShadow>
          <boxGeometry args={[size * 0.38, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#dddddd" metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      {[-0.22, 0, 0.22].map((x, i) => (
        <mesh key={i} position={[x * size, size * 1.22, 0]} castShadow>
          <boxGeometry args={[size * 0.04, size * 0.18, size * 0.04]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function IceCoreRack({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.4, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.8, size * 0.08]} />
          <meshStandardMaterial color="#888888" metalness={0.6} />
        </mesh>
      ))}
      {[0.12, 0.36, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.85, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.1} />
        </mesh>
      ))}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.78, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#cccccc" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function PenguinProp({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.28, size * 0.16]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[[-0.12, 0.58, 0.08], [0.12, 0.58, 0.08]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, p[1] * size, p[2] * size]} castShadow>
          <sphereGeometry args={[size * 0.07, 6, 5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      <mesh position={[0, size * 0.55, size * 0.22]} rotation={[0.4, 0, 0]} castShadow>
        <coneGeometry args={[size * 0.06, size * 0.14, 5]} />
        <meshStandardMaterial color="#ff8800" />
      </mesh>
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.05, size * 0.1]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.04, size * 0.22]} />
          <meshStandardMaterial color="#ff6600" />
        </mesh>
      ))}
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.28, 0]} rotation={[0, 0, x > 0 ? 0.5 : -0.5]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.32, size * 0.06]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

export function WalrusStatue({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.45, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.55, size * 0.25]} castShadow>
        <sphereGeometry args={[size * 0.32, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.45, size * 0.48]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.025, size * 0.35, 5]} />
          <meshStandardMaterial color="#f5f0e0" />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, size * 0.22]} castShadow>
          <sphereGeometry args={[size * 0.08, 6, 5]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
      <mesh position={[0, size * 0.02, 0]}>
        <cylinderGeometry args={[size * 0.4, size * 0.5, size * 0.1, 8]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function ArcticTent({ pos, color, size }: P14) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <coneGeometry args={[size * 0.6, size * 0.9, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.08, 0]}>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.12, 6]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.28, size * 0.56]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.38, size * 0.06]} />
        <meshStandardMaterial color="#cc2200" />
      </mesh>
      {[[-0.38, 0.44, 0.44], [0.38, 0.44, 0.44], [-0.38, 0.44, -0.44], [0.38, 0.44, -0.44]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, 0, p[2] * size]} castShadow>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.44, 4]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
      ))}
    </group>
  )
}
