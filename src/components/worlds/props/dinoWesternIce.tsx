import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Dinosaurs ────────────────────────────────────────────

export function TRex({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const tailRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (tailRef.current) tailRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.15 })
  const c = color || '#4a7a2a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.55, 0]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.44, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.85, size * 0.3]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.36, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.0, size * 0.52]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.26, size * 0.42]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, size * 0.9, size * 0.56]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.1, size * 0.36]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.14, size * 1.04, size * 0.72]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#ffe000" emissive="#cc8800" emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
      ))}
      {/* tiny arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.28, size * 0.65, size * 0.22]} rotation={[0.5, 0, s * 0.5]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.22, size * 0.08]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.18, size * 0.22, -size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.44, size * 0.2]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail */}
      <group ref={tailRef} position={[0, size * 0.45, -size * 0.38]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.16, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
        <mesh position={[0, -size * 0.04, -size * 0.38]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export function Triceratops({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#6a8a4a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.48, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* frill (neck shield) */}
      <mesh position={[0, size * 0.72, -size * 0.32]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 0.5, size * 0.08]} />
        <meshStandardMaterial color="#b87a4a" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.5, size * 0.5]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.3, size * 0.34]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* horns */}
      {[[-0.14, 0.7, 0.64], [0.14, 0.7, 0.64], [0, 0.6, 0.72]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} rotation={[-0.3, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.05, size * (i === 2 ? 0.18 : 0.3), 6]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.22, 0, 0.28], [0.22, 0, 0.28], [-0.22, 0, -0.28], [0.22, 0, -0.28]].map(([x, _y, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.26, size * 0.18]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[0, size * 0.32, -size * 0.5]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.12, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Stegosaurus({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5a7a3a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.42, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* back plates */}
      {[-0.3, -0.1, 0.1, 0.3].map((z, i) => (
        <mesh key={i} position={[0, size * 0.75 + i % 2 * size * 0.08, z * size]} castShadow>
          <boxGeometry args={[size * 0.06, size * (0.28 + Math.abs(i - 1.5) * 0.06), size * 0.12]} />
          <meshStandardMaterial color="#c87040" roughness={0.7} />
        </mesh>
      ))}
      {/* head */}
      <mesh position={[0, size * 0.32, size * 0.45]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.22, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* legs */}
      {[[-0.18, 0.26], [0.18, 0.26], [-0.18, -0.26], [0.18, -0.26]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.26, size * 0.16]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail spikes */}
      {[-0.5, -0.62].map((z, i) => (
        <mesh key={i} position={[(i % 2 === 0 ? 0.1 : -0.1) * size, size * 0.28, z * size]} rotation={[0, i * 0.5, 0.3]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.18, 4]} />
          <meshStandardMaterial color="#f0e030" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Pterodactyl({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wingRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Math.sin(Date.now() * 0.004)
    if (wingRef.current) {
      wingRef.current.children[0].rotation.z = t * 0.35
      wingRef.current.children[1].rotation.z = -t * 0.35
    }
  })
  const c = color || '#7a5a3a'
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.2, size * 0.24, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.1, size * 0.32]} castShadow>
        <boxGeometry args={[size * 0.16, size * 0.18, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* crest */}
      <mesh position={[0, size * 0.24, size * 0.2]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.22, size * 0.18]} />
        <meshStandardMaterial color="#c06040" roughness={0.6} />
      </mesh>
      {/* beak */}
      <mesh position={[0, -size * 0.02, size * 0.52]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.24]} />
        <meshStandardMaterial color="#d4a844" roughness={0.5} />
      </mesh>
      {/* wings */}
      <group ref={wingRef}>
        <mesh position={[size * 0.45, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[size * 0.8, size * 0.04, size * 0.4]} />
          <meshStandardMaterial color={c} roughness={0.7} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-size * 0.45, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[size * 0.8, size * 0.04, size * 0.4]} />
          <meshStandardMaterial color={c} roughness={0.7} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.08, -size * 0.14, size * 0.05]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.16, size * 0.06]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function DinoEgg({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8b48a'
  return (
    <group position={pos}>
      {/* nest twigs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.04, Math.sin(a) * size * 0.3]} rotation={[0, a, 0.3]} castShadow>
            <boxGeometry args={[size * 0.06, size * 0.04, size * 0.35]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.9} />
          </mesh>
        )
      })}
      {/* egg */}
      <mesh position={[0, size * 0.32, 0]} scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[size * 0.26, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* spots */}
      {[[0.18, 0.38, 0.16], [-0.14, 0.28, 0.2], [0.08, 0.42, -0.18]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#8a6838" roughness={0.5} />
        </mesh>
      ))}
      {/* crack hint */}
      <mesh position={[size * 0.1, size * 0.28, size * 0.22]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[size * 0.12, size * 0.03, size * 0.02]} />
        <meshStandardMaterial color="#6a5020" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Western ──────────────────────────────────────────────

export function Saloon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0724a'
  return (
    <group position={pos}>
      {/* main structure */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 1.0, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* facade sign board */}
      <mesh position={[0, size * 1.12, size * 0.41]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.28, size * 0.08]} />
        <meshStandardMaterial color="#6a4020" roughness={0.9} />
      </mesh>
      {/* sign text area */}
      <mesh position={[0, size * 1.12, size * 0.46]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#f5e8b0" roughness={0.7} />
      </mesh>
      {/* saloon swing doors */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.36, size * 0.42]} castShadow>
          <boxGeometry args={[size * 0.24, size * 0.48, size * 0.05]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* windows */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, size * 0.41]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.24, size * 0.04]} />
          <meshStandardMaterial color="#ffd88a" emissive="#ffc040" emissiveIntensity={0.2} roughness={0.5} />
        </mesh>
      ))}
      {/* porch posts */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.56, size * 0.65]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 1.12, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* porch roof */}
      <mesh position={[0, size * 1.12, size * 0.64]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.44]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function CactusTall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a8a3a'
  return (
    <group position={pos}>
      {/* main trunk */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.17, size * 1.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* left arm */}
      <mesh position={[-size * 0.3, size * 0.72, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.5, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[-size * 0.5, size * 0.95, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.36, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* right arm */}
      <mesh position={[size * 0.3, size * 0.88, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.45, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.48, size * 1.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.32, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* spines */}
      {[0.3, 0.6, 0.9, 1.1].map((y, i) => (
        <mesh key={i} position={[size * 0.16, y * size, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.012, size * 0.012, size * 0.1, 4]} />
          <meshStandardMaterial color="#f5f0d8" roughness={0.5} />
        </mesh>
      ))}
      {/* flower on top */}
      <mesh position={[0, size * 1.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 4]} />
        <meshStandardMaterial color="#ff9f43" roughness={0.5} emissive="#ff7000" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

export function Tumbleweed({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.02
      ref.current.rotation.z += 0.015
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.3, pos[2]]}>
      <group ref={ref}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a1 = (i / 12) * Math.PI * 2
          const a2 = i * 0.9
          return (
            <mesh key={i} position={[Math.cos(a1) * size * 0.2, Math.sin(a2) * size * 0.18, Math.sin(a1) * size * 0.2]} rotation={[a1, a2, 0]} castShadow>
              <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 4]} />
              <meshStandardMaterial color="#c8a87a" roughness={0.9} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function WantedSign({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#f5e8b0'
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.1, 5]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* sign board */}
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.75, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* border */}
      <mesh position={[0, size * 1.05, size * 0.035]} castShadow>
        <boxGeometry args={[size * 0.58, size * 0.68, size * 0.01]} />
        <meshStandardMaterial color="#c8a040" roughness={0.6} />
      </mesh>
      {/* portrait silhouette */}
      <mesh position={[0, size * 1.12, size * 0.04]}>
        <sphereGeometry args={[size * 0.14, 8, 6]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.98, size * 0.04]}>
        <boxGeometry args={[size * 0.22, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      {/* "WANTED" text bar */}
      <mesh position={[0, size * 1.38, size * 0.04]}>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.01]} />
        <meshStandardMaterial color="#c03020" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Horseshoe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#b0a080'
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      {/* horseshoe U shape */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.32, size * 0.08, 6, 20, Math.PI * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* nail holes */}
      {[-0.28, -0.14, 0.14, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.28, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.1, 6]} />
          <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Ice Kingdom ──────────────────────────────────────────

export function IceCastle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0d8ef'
  return (
    <group position={pos}>
      {/* main keep */}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.8, size * 1.1, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.1} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* towers */}
      {[[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].map(([x, z], i) => (
        <group key={i} position={[x * size, 0, z * size]}>
          <mesh position={[0, size * 0.6, 0]} castShadow>
            <cylinderGeometry args={[size * 0.18, size * 0.2, size * 1.2, 8]} />
            <meshStandardMaterial color={c} roughness={0.1} metalness={0.1} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, size * 1.28, 0]} castShadow>
            <coneGeometry args={[size * 0.2, size * 0.38, 8]} />
            <meshStandardMaterial color="#7ab8d8" roughness={0.05} metalness={0.2} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      {/* battlements */}
      {[-0.28, 0, 0.28].map((x, i) =>
        [[-0.41], [0.41]].map(([z]) => (
          <mesh key={`${i}-${z}`} position={[x * size, size * 1.14, z * size]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.16, size * 0.1]} />
            <meshStandardMaterial color="#c0e8ff" roughness={0.1} transparent opacity={0.9} />
          </mesh>
        ))
      )}
      {/* main roof */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <coneGeometry args={[size * 0.55, size * 0.5, 4]} />
        <meshStandardMaterial color="#7ab8d8" roughness={0.05} metalness={0.2} transparent opacity={0.9} />
      </mesh>
      {/* gate */}
      <mesh position={[0, size * 0.34, size * 0.41]}>
        <boxGeometry args={[size * 0.22, size * 0.44, size * 0.04]} />
        <meshStandardMaterial color="#0a1a2a" roughness={1.0} />
      </mesh>
    </group>
  )
}

export function IceSpike({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#7ab8d8'
  return (
    <group position={pos}>
      {/* main spike */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[0, size * 0.2, size * 1.1, 6]} />
        <meshStandardMaterial color={c} roughness={0.05} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      {/* secondary spikes */}
      {[0.5, 1.1, 1.9, 2.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.22, size * 0.22, Math.sin(a) * size * 0.22]} castShadow>
          <cylinderGeometry args={[0, size * 0.1, size * 0.45, 5]} />
          <meshStandardMaterial color={c} roughness={0.05} metalness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* base platform */}
      <mesh position={[0, size * 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.1, 8]} />
        <meshStandardMaterial color="#c0e8ff" roughness={0.15} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function FrozenTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0e0f0'
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.8, 6]} />
        <meshStandardMaterial color="#9ab8d0" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* ice-crusted canopy layers */}
      {[1.0, 0.72, 0.46].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <coneGeometry args={[size * (0.38 - i * 0.06), size * 0.36, 7]} />
          <meshStandardMaterial color={c} roughness={0.1} metalness={0.15} transparent opacity={0.88} />
        </mesh>
      ))}
      {/* icicles hanging */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.62, Math.sin(a) * size * 0.3]} castShadow>
          <cylinderGeometry args={[0, size * 0.04, size * 0.22, 4]} />
          <meshStandardMaterial color="#d8f0ff" roughness={0.05} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Snowfort({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* walls */}
      {[[0, 0.5], [Math.PI / 2, 0.5], [Math.PI, 0.5], [3 * Math.PI / 2, 0.5]].map(([a, r], i) => (
        <mesh key={i} position={[Math.cos(a as number) * size * (r as number), size * 0.22, Math.sin(a as number) * size * (r as number)]} rotation={[0, -(a as number), 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 1.0, size * 0.44, size * 0.14]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.6} />
        </mesh>
      ))}
      {/* battlements */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.5, size * 0.52, Math.sin(a) * size * 0.5]} castShadow>
            <boxGeometry args={[size * 0.12, size * 0.16, size * 0.12]} />
            <meshStandardMaterial color="#f0f8ff" roughness={0.5} />
          </mesh>
        )
      })}
      {/* snowballs inside */}
      {[[-0.2, 0, 0.1], [0.2, 0, -0.15], [0, 0, 0.25]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, (y as number) * size + size * 0.08, z * size]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function PolarBear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const headRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (headRef.current) headRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.2 })
  const c = color || '#f0f0f0'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* head */}
      <group ref={headRef} position={[0, size * 0.75, size * 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.24, 10, 8]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
        {/* snout */}
        <mesh position={[0, -size * 0.04, size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6]} />
          <meshStandardMaterial color="#e8e0d8" roughness={0.6} />
        </mesh>
        {/* nose */}
        <mesh position={[0, -size * 0.01, size * 0.32]}>
          <sphereGeometry args={[size * 0.04, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * size * 0.1, size * 0.06, size * 0.22]}>
            <sphereGeometry args={[size * 0.04, 5, 5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
        ))}
        {/* ears */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * size * 0.18, size * 0.2, 0]} castShadow>
            <sphereGeometry args={[size * 0.07, 6, 6]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[[-0.24, 0, 0.18], [0.24, 0, 0.18], [-0.24, 0, -0.18], [0.24, 0, -0.18]].map(([x, _y, z], i) => (
        <mesh key={i} position={[x * size, size * 0.12, z * size]} castShadow>
          <sphereGeometry args={[size * 0.14, 7, 6]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Anime/Japanese ───────────────────────────────────────

export function ToriiGate({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* columns */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.6, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
      {/* kasagi (top beam curved) */}
      <mesh position={[0, size * 1.24, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* kasagi ends curve upward */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.52, size * 1.3, 0]} rotation={[0, 0, s * 0.18]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.12, size * 0.14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
      {/* nuki (lower crossbar) */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.08, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* kusabi (wedges) */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 1.0, size * 0.06]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.14, size * 0.06]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
      {/* base stones */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.04, 0]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.08, size * 0.22]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function PaperLantern({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.2
    }
  })
  const c = color || '#ff7a3a'
  return (
    <group position={pos}>
      {/* string/hook */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.2, 4]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      {/* lantern body */}
      <mesh ref={glowRef} position={[0, size * 0.75, 0]} scale={[1, 1.35, 1]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.5} transparent opacity={0.88} />
      </mesh>
      {/* bands */}
      {[0.55, 0.75, 0.95].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <torusGeometry args={[size * 0.3, size * 0.025, 5, 16]} />
          <meshStandardMaterial color="#8b2020" roughness={0.5} />
        </mesh>
      ))}
      {/* tassel */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.01, size * 0.25, 4]} />
        <meshStandardMaterial color="#ffd040" roughness={0.6} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.3, size * 0.1, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* bottom cap */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.12, size * 0.1, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function SakuraTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const petalRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (petalRef.current) petalRef.current.rotation.y += 0.005 })
  const c = color || '#ffb7c5'
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.76, 7]} />
        <meshStandardMaterial color="#7a4a2a" roughness={0.9} />
      </mesh>
      {/* branches */}
      {[0.6, 1.2, 2.0, 3.0, 4.2, 5.0].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.22, size * 0.65 + i * size * 0.04, Math.sin(a) * size * 0.22]} rotation={[0.4, a, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.45, 5]} />
          <meshStandardMaterial color="#6a3a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* blossom clusters */}
      {[[0, 0.95, 0, 0.32], [0.3, 0.85, 0.2, 0.24], [-0.28, 0.88, -0.2, 0.22], [0.16, 0.78, -0.28, 0.2], [-0.2, 0.82, 0.24, 0.2]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} castShadow>
          <sphereGeometry args={[r * size, 8, 6]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      {/* falling petals */}
      <group ref={petalRef}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          const r = 0.3 + (i % 3) * 0.15
          return (
            <mesh key={i} position={[Math.cos(a) * r * size, size * 0.55 + (i % 4) * size * 0.12, Math.sin(a) * r * size]} rotation={[0.3 * i, a, 0]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color={c} roughness={0.5} transparent opacity={0.8} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function NinjaStar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 3 })
  const c = color || '#888888'
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {[0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4].map((a, i) => (
          <mesh key={i} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[size * 0.7, size * 0.12, size * 0.08]} />
            <meshStandardMaterial color={c} roughness={0.2} metalness={0.8} />
          </mesh>
        ))}
        {/* center */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 8]} />
          <meshStandardMaterial color="#666" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

export function TempleBell({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bellRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Math.sin(Date.now() * 0.0008) * 0.1
    if (bellRef.current) bellRef.current.rotation.z = t
  })
  const c = color || '#c8a050'
  return (
    <group position={pos}>
      {/* beam support */}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color="#6b4020" roughness={0.9} />
      </mesh>
      {/* posts */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.68, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.08, size * 1.36, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* rope */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 4]} />
        <meshStandardMaterial color="#8b6a3a" roughness={0.8} />
      </mesh>
      {/* bell */}
      <group ref={bellRef} position={[0, size * 0.65, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.32, size * 0.36, size * 0.55, 12, 1, true]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} side={2} />
        </mesh>
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.32, size * 0.1, 10]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
        {/* struck ring */}
        <mesh position={[0, -size * 0.12, 0]} castShadow>
          <torusGeometry args={[size * 0.32, size * 0.03, 6, 16]} />
          <meshStandardMaterial color="#a88030" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Deep Space ───────────────────────────────────────────

export function BlackHole({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const diskRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (diskRef.current) diskRef.current.rotation.z += dt * 0.4
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.2
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.6, pos[2]]}>
      {/* accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[size * 0.55, size * 0.22, 4, 32]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      {/* event horizon (dark sphere) */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.28, 12, 10]} />
        <meshStandardMaterial color="#000000" roughness={1.0} />
      </mesh>
      {/* gravitational lens glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 0.35, 10, 8]} />
        <meshStandardMaterial color="#8040ff" emissive="#4020aa" emissiveIntensity={0.5} roughness={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

export function NebulaCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002 })
  const c = color || '#7040c0'
  const colors = [c, '#ff6080', '#4080ff', '#ff8040', '#40ffaa']
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2
          const r = (0.2 + (i % 3) * 0.18) * size
          const y = (Math.sin(i * 1.3) * 0.3) * size
          return (
            <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
              <sphereGeometry args={[size * (0.18 + (i % 3) * 0.08), 5, 5]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={0.4}
                roughness={0.3}
                transparent
                opacity={0.45 + (i % 3) * 0.1}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function SpaceDebris({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.x += dt * 0.3; ref.current.rotation.y += dt * 0.2 } })
  const c = color || '#707070'
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {/* main chunk */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.45, size * 0.3, size * 0.38]} />
          <meshStandardMaterial color={c} roughness={0.7} metalness={0.3} />
        </mesh>
        {/* fragments */}
        {[[0.3, 0.2, 0.1], [-0.28, 0.18, -0.12], [0.1, -0.22, 0.24], [-0.15, 0.2, 0.28]].map(([x, y, z], i) => (
          <mesh key={i} position={[x * size, y * size, z * size]} castShadow>
            <boxGeometry args={[size * 0.16, size * 0.12, size * 0.14]} />
            <meshStandardMaterial color={c} roughness={0.7} metalness={0.3} />
          </mesh>
        ))}
        {/* solar panel remnant */}
        <mesh position={[size * 0.45, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.4, size * 0.02, size * 0.25]} />
          <meshStandardMaterial color="#1a3a7a" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* wire */}
        <mesh position={[size * 0.28, size * 0.08, 0]} castShadow>
          <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.35, 4]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

export function LaserTurret({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const turretRef = useRef<THREE.Group>(null!)
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const t = Date.now() * 0.001
    if (turretRef.current) turretRef.current.rotation.y = Math.sin(t * 0.8) * 1.2
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshStandardMaterial
      const firing = Math.sin(t * 4) > 0.7
      mat.opacity = firing ? 0.9 : 0
    }
  })
  const c = color || '#00ff88'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.35, size * 0.2, 8]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* pivot */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.12, 8]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* rotating turret head */}
      <group ref={turretRef} position={[0, size * 0.36, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size * 0.4, size * 0.24, size * 0.4]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* barrel */}
        <mesh position={[0, 0, size * 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.07, size * 0.5, 6]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* laser glow ring */}
        <mesh position={[0, 0, size * 0.54]}>
          <torusGeometry args={[size * 0.05, size * 0.02, 5, 10]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.0} roughness={0.1} />
        </mesh>
        {/* laser beam */}
        <mesh ref={beamRef} position={[0, 0, size * 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.7, 4]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2.0} roughness={0.1} transparent opacity={0} />
        </mesh>
      </group>
    </group>
  )
}

export function WarpGate({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const innerRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (innerRef.current) innerRef.current.rotation.z += dt * 1.2
    if (ringRef.current) ringRef.current.rotation.z -= dt * 0.4
  })
  const c = color || '#4488ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      {/* outer ring */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.65, size * 0.08, 8, 32]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* inner energy ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[size * 0.5, size * 0.04, 6, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* swirling portal */}
      <mesh ref={innerRef}>
        <torusGeometry args={[size * 0.35, size * 0.32, 4, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} roughness={0.2} transparent opacity={0.65} />
      </mesh>
      {/* center glow */}
      <mesh>
        <sphereGeometry args={[size * 0.22, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={c} emissiveIntensity={0.6} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* support legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.65, -size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 1.1, size * 0.1]} />
          <meshStandardMaterial color="#666" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* foot plates */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.65, -size * 1.06, 0]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.08, size * 0.3]} />
          <meshStandardMaterial color="#555" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Magic Effects ────────────────────────────────────────

export function Fireworks({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = (Date.now() % 2000) / 2000
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = (t + i / ref.current.children.length) % 1
        const r = phase * size * 0.8
        const a = i * 1.618 * Math.PI * 2
        child.position.x = Math.cos(a) * r
        child.position.y = phase * size * 0.9 + pos[1]
        child.position.z = Math.sin(a) * r
        const s = phase < 0.5 ? phase * 2 : (1 - phase) * 2
        child.scale.setScalar(s * 0.8 + 0.1)
      })
    }
  })
  const c = color || '#ff5464'
  const colors = [c, '#ffd644', '#48c774', '#4c97ff', '#c879ff', '#ff8c1a', '#ff5ab1']
  return (
    <group>
      {/* launch tube */}
      <mesh position={[pos[0], pos[1] + size * 0.15, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.3, 6]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* sparks */}
      <group ref={ref}>
        {colors.map((sc, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.06, 4, 4]} />
            <meshStandardMaterial color={sc} emissive={sc} emissiveIntensity={1.0} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function SparkFountain({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.003
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = ((t + i * 0.3) % 2.5) / 2.5
        const a = i * 0.8
        const r = Math.sin(phase * Math.PI) * size * 0.5
        child.position.x = pos[0] + Math.cos(a) * r
        child.position.y = pos[1] + phase * size * 1.1
        child.position.z = pos[2] + Math.sin(a) * r
        child.scale.setScalar(1 - phase * 0.8)
      })
    }
  })
  const c = color || '#ffd644'
  return (
    <group>
      {/* base */}
      <mesh position={[pos[0], pos[1] + size * 0.08, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.16, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* sparks */}
      <group ref={ref}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.04, 4, 4]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.2} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function SmokeCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.y = pos[1] + size * 0.3 + (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * size * 0.3
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.opacity = 0.25 + Math.sin(Date.now() * 0.002 + i * 0.8) * 0.1
      })
    }
  })
  const c = color || '#aaaaaa'
  return (
    <group>
      <group ref={ref}>
        {[
          [0, 0], [size * 0.25, 0.1], [-size * 0.22, 0.15], [size * 0.12, 0.25],
          [-size * 0.1, 0.3], [size * 0.3, 0.2],
        ].map(([x, yOff], i) => (
          <mesh key={i} position={[pos[0] + (x as number), pos[1] + size * 0.3 + (yOff as number) * size, pos[2] + (i % 2 === 0 ? 0.1 : -0.1) * size]}>
            <sphereGeometry args={[size * (0.22 + (i % 3) * 0.08), 6, 5]} />
            <meshStandardMaterial color={c} roughness={0.9} transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function RainbowJet({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.003
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = ((t + i * 0.2) % 3) / 3
        const a = i * 0.7
        child.position.x = pos[0] + Math.cos(a + t * 0.5) * phase * size * 0.4
        child.position.y = pos[1] + phase * size * 1.2
        child.position.z = pos[2] + Math.sin(a + t * 0.5) * phase * size * 0.4
        child.scale.setScalar(0.5 + phase * 0.8)
      })
    }
  })
  const rainbow = ['#ff5464', '#ff8c1a', '#ffd644', '#48c774', '#4c97ff', '#c879ff']
  return (
    <group>
      {/* nozzle */}
      <mesh position={[pos[0], pos[1] + size * 0.12, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.24, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.05, 4, 4]} />
            <meshStandardMaterial color={rainbow[i % rainbow.length]} emissive={rainbow[i % rainbow.length]} emissiveIntensity={0.8} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function MagicCircle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const outerRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const orbRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (outerRef.current) outerRef.current.rotation.y += dt * 0.8
    if (innerRef.current) innerRef.current.rotation.y -= dt * 1.2
    if (orbRef.current) orbRef.current.rotation.y += dt * 2
  })
  const c = color || '#c879ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.06, pos[2]]}>
      {/* ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[size * 0.7, 32]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.5} transparent opacity={0.4} />
      </mesh>
      {/* outer ring */}
      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.65, size * 0.04, 4, 32]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* inner ring */}
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.4, size * 0.03, 4, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* runes (small orbs on outer ring) */}
      <group ref={orbRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.65, size * 0.04, Math.sin(a) * size * 0.65]}>
              <sphereGeometry args={[size * 0.06, 5, 5]} />
              <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.0} roughness={0.1} />
            </mesh>
          )
        })}
      </group>
      {/* center glow */}
      <mesh position={[0, size * 0.08, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.5} roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
