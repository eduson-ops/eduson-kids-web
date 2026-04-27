import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 27 · Samurai Japan + Aztec Empire ─────────────────────────────────

interface P27 { pos: [number,number,number]; color: string; size: number }

export function SamuraiSword({ pos, color: _color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      {/* blade */}
      <mesh position={[0, size * 0.9, 0]} rotation={[0,0,0.08]}>
        <boxGeometry args={[size*0.06, size*1.6, size*0.04]} />
        <meshStandardMaterial color="#d0d8e0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* guard */}
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.2, size*0.2, size*0.06, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* handle */}
      <mesh position={[0, -size*0.3, 0]}>
        <cylinderGeometry args={[size*0.07, size*0.07, size*0.6, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function SamuraiArmor({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.4, 0]}>
        <boxGeometry args={[size*0.7, size*0.9, size*0.45]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* shoulder L */}
      <mesh position={[-size*0.55, size*0.7, 0]}>
        <boxGeometry args={[size*0.3, size*0.55, size*0.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* shoulder R */}
      <mesh position={[size*0.55, size*0.7, 0]}>
        <boxGeometry args={[size*0.3, size*0.55, size*0.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* helmet */}
      <mesh position={[0, size*1.05, 0]}>
        <cylinderGeometry args={[size*0.25, size*0.35, size*0.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function PagodaTemple({ pos, color, size }: P27) {
  const tiers = [
    { y: 0,        w: size*1.2, h: size*0.35 },
    { y: size*0.4, w: size*0.95, h: size*0.3 },
    { y: size*0.75, w: size*0.7, h: size*0.28 },
    { y: size*1.07, w: size*0.45, h: size*0.22 },
  ]
  return (
    <group position={pos}>
      {tiers.map((t, i) => (
        <mesh key={i} position={[0, t.y, 0]}>
          <boxGeometry args={[t.w, t.h, t.w]} />
          <meshStandardMaterial color={i % 2 === 0 ? color : '#8b1a1a'} />
        </mesh>
      ))}
      {/* spire */}
      <mesh position={[0, size*1.38, 0]}>
        <coneGeometry args={[size*0.08, size*0.45, 8]} />
        <meshStandardMaterial color="#d4a017" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Torii({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* posts */}
      <mesh position={[-size*0.5, size*0.75, 0]}>
        <cylinderGeometry args={[size*0.07, size*0.07, size*1.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size*0.5, size*0.75, 0]}>
        <cylinderGeometry args={[size*0.07, size*0.07, size*1.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* top beam */}
      <mesh position={[0, size*1.55, 0]}>
        <boxGeometry args={[size*1.3, size*0.12, size*0.12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* mid beam */}
      <mesh position={[0, size*1.3, 0]}>
        <boxGeometry args={[size*1.1, size*0.1, size*0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function CherryBlossom({ pos, color: _color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      {/* trunk */}
      <mesh position={[0, size*0.4, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.14, size*0.8, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* blossom clusters */}
      {([[-0.25,1.0,0.1],[0.2,1.2,-0.1],[0,1.35,0.15],[-0.15,1.5,-0.1],[0.25,1.45,0.05]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <sphereGeometry args={[size*(0.2+i*0.03), 7, 7]} />
          <meshStandardMaterial color="#ffb7c5" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function KatanaRack({ pos, color: _color, size }: P27) {
  return (
    <group position={pos}>
      {/* rack frame */}
      <mesh position={[0, size*0.6, 0]}>
        <boxGeometry args={[size*1.0, size*0.06, size*0.2]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.25, 0]}>
        <boxGeometry args={[size*1.0, size*0.06, size*0.2]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* posts */}
      {([-0.45, 0.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.4, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.9, 6]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
        </mesh>
      ))}
      {/* swords on rack */}
      {([-0.3, 0, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.6, size*0.05]} rotation={[0,0,0.15]}>
          <boxGeometry args={[size*0.04, size*0.85, size*0.03]} />
          <meshStandardMaterial color="#c8d4dc" metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

export function LanternJapanese({ pos, color, size }: P27) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.6 + Math.sin(clock.getElapsedTime() * 2.2) * 0.3
  })
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.2, 6]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* lantern body */}
      <mesh ref={ref} position={[0, size*1.3, 0]}>
        <boxGeometry args={[size*0.38, size*0.55, size*0.38]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.85} />
      </mesh>
      {/* cap */}
      <mesh position={[0, size*1.6, 0]}>
        <coneGeometry args={[size*0.25, size*0.2, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

export function AztecPyramid({ pos, color, size }: P27) {
  const steps = 5
  return (
    <group position={pos}>
      {Array.from({ length: steps }, (_, i) => {
        const w = size * (1.2 - i * 0.18)
        const y = i * size * 0.28
        return (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[w, size*0.28, w]} />
            <meshStandardMaterial color={i % 2 === 0 ? color : '#b8860b'} roughness={0.8} />
          </mesh>
        )
      })}
      {/* temple top */}
      <mesh position={[0, steps * size*0.28 + size*0.12, 0]}>
        <boxGeometry args={[size*0.38, size*0.25, size*0.38]} />
        <meshStandardMaterial color="#cc4400" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function AztecSunStone({ pos, color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      {/* main disk */}
      <mesh>
        <cylinderGeometry args={[size*0.7, size*0.7, size*0.12, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* inner ring */}
      <mesh position={[0, size*0.07, 0]}>
        <torusGeometry args={[size*0.5, size*0.06, 8, 20]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* spikes */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.62, size*0.07, Math.sin(a)*size*0.62]} rotation={[Math.PI/2, 0, a]}>
            <coneGeometry args={[size*0.06, size*0.18, 4]} />
            <meshStandardMaterial color="#cc6600" roughness={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

export function QuetzalBird({ pos, color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.15
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 3) * 0.12
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* body */}
      <mesh>
        <sphereGeometry args={[size*0.22, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* tail feathers */}
      <mesh position={[0, -size*0.55, 0]}>
        <coneGeometry args={[size*0.1, size*0.9, 6]} />
        <meshStandardMaterial color="#00aa44" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*0.28, 0]}>
        <sphereGeometry args={[size*0.14, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* wings L */}
      <mesh position={[-size*0.35, 0, 0]} rotation={[0,0,-0.4]}>
        <boxGeometry args={[size*0.5, size*0.1, size*0.22]} />
        <meshStandardMaterial color="#228833" roughness={0.6} />
      </mesh>
      {/* wings R */}
      <mesh position={[size*0.35, 0, 0]} rotation={[0,0,0.4]}>
        <boxGeometry args={[size*0.5, size*0.1, size*0.22]} />
        <meshStandardMaterial color="#228833" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function AztecWaterFountain({ pos, color, size }: P27) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.5
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.65, size*0.75, size*0.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* column */}
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.12, size*0.15, size*0.9, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* rotating top disc */}
      <mesh ref={ref} position={[0, size*1.0, 0]}>
        <cylinderGeometry args={[size*0.4, size*0.4, size*0.1, 12]} />
        <meshStandardMaterial color="#4488cc" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function JadeMask({ pos, color: _color, size }: P27) {
  return (
    <group position={pos}>
      {/* mask face */}
      <mesh>
        <boxGeometry args={[size*0.65, size*0.85, size*0.15]} />
        <meshStandardMaterial color="#3da05f" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* eyes */}
      <mesh position={[-size*0.18, size*0.12, size*0.09]}>
        <boxGeometry args={[size*0.15, size*0.1, size*0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[size*0.18, size*0.12, size*0.09]}>
        <boxGeometry args={[size*0.15, size*0.1, size*0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* mouth */}
      <mesh position={[0, -size*0.2, size*0.09]}>
        <boxGeometry args={[size*0.3, size*0.08, size*0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* headdress */}
      <mesh position={[0, size*0.65, 0]}>
        <coneGeometry args={[size*0.38, size*0.6, 6]} />
        <meshStandardMaterial color="#b8860b" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

export function ObsidianAltar({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* base platform */}
      <mesh>
        <boxGeometry args={[size*1.1, size*0.15, size*0.8]} />
        <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* altar block */}
      <mesh position={[0, size*0.3, 0]}>
        <boxGeometry args={[size*0.7, size*0.35, size*0.5]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* carvings on sides */}
      <mesh position={[-size*0.36, size*0.3, 0]}>
        <boxGeometry args={[size*0.04, size*0.25, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[size*0.36, size*0.3, 0]}>
        <boxGeometry args={[size*0.04, size*0.25, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function TepeeHut({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.6, size*0.65, size*0.1, 10]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* cone */}
      <mesh position={[0, size*0.65, 0]}>
        <coneGeometry args={[size*0.6, size*1.3, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* poles sticking out top */}
      {([0, 1, 2] as number[]).map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.1, size*1.45, Math.sin(a)*size*0.1]} rotation={[Math.cos(a)*0.3, 0, Math.sin(a)*0.3]}>
            <cylinderGeometry args={[size*0.025, size*0.025, size*0.5, 5]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

export function AztecWarrior({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*0.42, size*0.6, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*0.97, 0]}>
        <boxGeometry args={[size*0.3, size*0.32, size*0.28]} />
        <meshStandardMaterial color="#d2956f" roughness={0.7} />
      </mesh>
      {/* headdress */}
      <mesh position={[0, size*1.2, 0]}>
        <coneGeometry args={[size*0.28, size*0.5, 6]} />
        <meshStandardMaterial color="#b8860b" roughness={0.5} />
      </mesh>
      {/* shield */}
      <mesh position={[-size*0.38, size*0.5, size*0.1]}>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.06, 10]} />
        <meshStandardMaterial color="#228833" roughness={0.6} />
      </mesh>
      {/* spear */}
      <mesh position={[size*0.3, size*0.7, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*1.4, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function ShurikenB27({ pos, color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 3
  })
  return (
    <group ref={ref} position={pos}>
      {([0, 1] as number[]).map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
          <boxGeometry args={[size*0.8, size*0.15, size*0.08]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* center hub */}
      <mesh>
        <cylinderGeometry args={[size*0.12, size*0.12, size*0.1, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function SakuraBridge({ pos, color: _color, size }: P27) {
  return (
    <group position={pos}>
      {/* deck */}
      <mesh position={[0, size*0.2, 0]}>
        <boxGeometry args={[size*1.6, size*0.1, size*0.55]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* railings */}
      {[-0.25, 0.25].map((z, i) => (
        <mesh key={i} position={[0, size*0.48, z*size]}>
          <boxGeometry args={[size*1.6, size*0.06, size*0.04]} />
          <meshStandardMaterial color="#cc3333" roughness={0.6} />
        </mesh>
      ))}
      {/* arch */}
      <mesh position={[0, size*0.05, 0]}>
        <torusGeometry args={[size*0.7, size*0.07, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#cc3333" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function AztecSerpent({ pos, color, size }: P27) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      {/* coiled body segments */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        const r = size * 0.45
        const y = i * size * 0.08
        return (
          <mesh key={i} position={[Math.cos(a)*r, y, Math.sin(a)*r]}>
            <sphereGeometry args={[size*0.18, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        )
      })}
      {/* head */}
      <mesh position={[0, size*0.6, 0]}>
        <boxGeometry args={[size*0.28, size*0.2, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function TeaHouseJapanese({ pos, color, size }: P27) {
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size*0.4, 0]}>
        <boxGeometry args={[size*1.1, size*0.8, size*0.9]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.9} />
      </mesh>
      {/* main roof */}
      <mesh position={[0, size*0.98, 0]}>
        <boxGeometry args={[size*1.35, size*0.12, size*1.15]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* roof overhang shape (cone approach) */}
      <mesh position={[0, size*0.9, 0]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[size*0.85, size*0.35, 4]} />
        <meshStandardMaterial color="#8b1a1a" roughness={0.7} />
      </mesh>
      {/* door */}
      <mesh position={[0, size*0.25, size*0.46]}>
        <boxGeometry args={[size*0.28, size*0.45, size*0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── BATCH 28 · Deep Sea + Wild West ─────────────────────────────────────────

interface P28 { pos: [number,number,number]; color: string; size: number }

export function AnglerfishB28({ pos, color, size }: P28) {
  const ref = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 0.7) * size * 0.12
      ref.current.rotation.z = Math.sin(t * 0.5) * 0.08
    }
    if (lightRef.current) (lightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.8 + Math.sin(t * 3) * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      {/* body */}
      <mesh>
        <sphereGeometry args={[size*0.4, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* lower jaw */}
      <mesh position={[size*0.28, -size*0.18, 0]} rotation={[0,0,0.4]}>
        <boxGeometry args={[size*0.35, size*0.1, size*0.25]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* lure rod */}
      <mesh position={[size*0.15, size*0.42, 0]} rotation={[0,0,-0.3]}>
        <cylinderGeometry args={[size*0.02, size*0.02, size*0.5, 5]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      {/* lure light */}
      <mesh ref={lightRef} position={[size*0.32, size*0.75, 0]}>
        <sphereGeometry args={[size*0.08, 6, 6]} />
        <meshStandardMaterial color="#88ffcc" emissive="#88ffcc" emissiveIntensity={0.9} />
      </mesh>
      {/* fins */}
      <mesh position={[0, -size*0.1, size*0.4]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[size*0.18, size*0.35, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function OceanTrench({ pos, color: _color, size }: P28) {
  return (
    <group position={pos}>
      {/* trench floor */}
      <mesh position={[0, -size*0.1, 0]}>
        <boxGeometry args={[size*1.8, size*0.2, size*0.9]} />
        <meshStandardMaterial color="#1a2233" roughness={0.9} />
      </mesh>
      {/* trench walls */}
      <mesh position={[-size*0.9, size*0.3, 0]}>
        <boxGeometry args={[size*0.15, size*0.8, size*0.9]} />
        <meshStandardMaterial color="#223344" roughness={0.9} />
      </mesh>
      <mesh position={[size*0.9, size*0.3, 0]}>
        <boxGeometry args={[size*0.15, size*0.8, size*0.9]} />
        <meshStandardMaterial color="#223344" roughness={0.9} />
      </mesh>
      {/* hydrothermal vent */}
      <mesh position={[0.2*size, size*0.1, 0]}>
        <coneGeometry args={[size*0.12, size*0.35, 6]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* vent glow */}
      <mesh position={[0.2*size, size*0.3, 0]}>
        <sphereGeometry args={[size*0.1, 6, 6]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function GiantSquid({ pos, color, size }: P28) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 0.5) * size * 0.1
      ref.current.rotation.y = t * 0.2
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* mantle */}
      <mesh position={[0, size*0.5, 0]}>
        <coneGeometry args={[size*0.35, size*0.9, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh>
        <sphereGeometry args={[size*0.32, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* tentacles */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.2, -size*0.35, Math.sin(a)*size*0.2]} rotation={[Math.cos(a)*0.4, 0, Math.sin(a)*0.4]}>
            <cylinderGeometry args={[size*0.04, size*0.015, size*0.7, 5]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export function DeepSeaJellyfish({ pos, color, size }: P28) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(t * 1.2) * size * 0.15;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3
    }
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size*0.2, 0]}>
        <sphereGeometry args={[size*0.35, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.75} roughness={0.3} />
      </mesh>
      {/* tentacles */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.2, -size*0.15, Math.sin(a)*size*0.2]}>
            <cylinderGeometry args={[size*0.02, size*0.005, size*0.8, 4]} />
            <meshStandardMaterial color={color} transparent opacity={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

export function SunkenShipB28({ pos, color: _color, size }: P28) {
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size*0.1, 0]} rotation={[0,0,0.25]}>
        <boxGeometry args={[size*1.6, size*0.45, size*0.55]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
      </mesh>
      {/* mast remains */}
      <mesh position={[-size*0.3, size*0.55, 0]} rotation={[0,0,0.35]}>
        <cylinderGeometry args={[size*0.05, size*0.05, size*0.8, 6]} />
        <meshStandardMaterial color="#3d2810" roughness={0.9} />
      </mesh>
      {/* coral growth */}
      <mesh position={[size*0.4, size*0.25, size*0.25]}>
        <coneGeometry args={[size*0.12, size*0.25, 5]} />
        <meshStandardMaterial color="#ff6688" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function SaloonB28({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* building */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*1.4, size*1.0, size*0.8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* false front / facade */}
      <mesh position={[0, size*1.2, -size*0.42]}>
        <boxGeometry args={[size*1.4, size*0.45, size*0.06]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* sign */}
      <mesh position={[0, size*1.35, -size*0.46]}>
        <boxGeometry args={[size*0.8, size*0.18, size*0.04]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* swing doors */}
      <mesh position={[size*0.12, size*0.3, -size*0.42]}>
        <boxGeometry args={[size*0.22, size*0.45, size*0.04]} />
        <meshStandardMaterial color="#c8a46e" roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.12, size*0.3, -size*0.42]}>
        <boxGeometry args={[size*0.22, size*0.45, size*0.04]} />
        <meshStandardMaterial color="#c8a46e" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function WildWestWagon({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.55, 0]}>
        <boxGeometry args={[size*1.1, size*0.5, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* wheels */}
      {([-0.45, 0.45] as number[]).map((x, i) =>
        ([-0.35, 0.35] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[x*size, size*0.2, z*size]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[size*0.2, size*0.04, 6, 12]} />
            <meshStandardMaterial color="#4a2e0a" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* cover arch */}
      <mesh position={[0, size*0.88, 0]}>
        <coneGeometry args={[size*0.35, size*0.45, 4]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function WestSheriffStar({ pos, color, size }: P28) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[size*0.85, size*0.18, size*0.06]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[size*0.12, size*0.12, size*0.08, 6]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function TumbleweedB28({ pos, color, size }: P28) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 1.5
      ref.current.rotation.z = clock.getElapsedTime() * 1.1
    }
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        const b = (i / 8) * Math.PI
        return (
          <mesh key={i} position={[Math.cos(a)*Math.sin(b)*size*0.3, Math.cos(b)*size*0.3, Math.sin(a)*Math.sin(b)*size*0.3]}>
            <sphereGeometry args={[size*0.08, 5, 5]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        )
      })}
    </group>
  )
}

export function WaterTowerWest({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* legs */}
      {([[-0.3,-0.3],[0.3,-0.3],[-0.3,0.3],[0.3,0.3]] as [number,number][]).map(([x,z], i) => (
        <mesh key={i} position={[x*size, size*0.5, z*size]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*1.0, 5]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* tank */}
      <mesh position={[0, size*1.2, 0]}>
        <cylinderGeometry args={[size*0.45, size*0.45, size*0.7, 10]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*1.6, 0]}>
        <coneGeometry args={[size*0.5, size*0.3, 10]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function CoralGarden({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {([[-0.3,0,0.1],[0.2,0,-0.2],[0,0,0.3],[-0.15,0,-0.1],[0.35,0,0.1]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y, z*size]}>
          <coneGeometry args={[size*(0.08+i*0.02), size*(0.25+i*0.06), 5+i]} />
          <meshStandardMaterial color={i % 2 === 0 ? color : '#ff6688'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function DeepSubMini({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size*0.1, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*1.2, 10]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* nose */}
      <mesh position={[0, size*0.1, size*0.65]}>
        <sphereGeometry args={[size*0.28, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* conning tower */}
      <mesh position={[0, size*0.45, -size*0.1]}>
        <boxGeometry args={[size*0.22, size*0.3, size*0.35]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* propeller */}
      <mesh position={[0, size*0.1, -size*0.65]}>
        <torusGeometry args={[size*0.18, size*0.04, 5, 6]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function WestGoldNugget({ pos, color: _color, size }: P28) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.8;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime() * 2) * 0.1
    }
  })
  return (
    <mesh ref={ref} position={pos}>
      <dodecahedronGeometry args={[size*0.35, 0]} />
      <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={0.25} metalness={0.85} roughness={0.15} />
    </mesh>
  )
}

export function CactusBig({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* main trunk */}
      <mesh position={[0, size*0.7, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.22, size*1.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* left arm */}
      <mesh position={[-size*0.38, size*0.9, 0]} rotation={[0,0,-1.1]}>
        <cylinderGeometry args={[size*0.11, size*0.11, size*0.55, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.58, size*1.18, 0]}>
        <cylinderGeometry args={[size*0.11, size*0.11, size*0.4, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* right arm */}
      <mesh position={[size*0.38, size*1.1, 0]} rotation={[0,0,1.0]}>
        <cylinderGeometry args={[size*0.11, size*0.11, size*0.5, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.56, size*1.42, 0]}>
        <cylinderGeometry args={[size*0.11, size*0.11, size*0.38, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function BanditCampfire({ pos, color: _color, size }: P28) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.7 + Math.sin(clock.getElapsedTime() * 4) * 0.3
  })
  return (
    <group position={pos}>
      {/* log ring */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0,0,0]} rotation={[0, (i/3)*Math.PI*2, 0.4]}>
          <cylinderGeometry args={[size*0.05, size*0.07, size*0.7, 6]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* flame */}
      <mesh ref={ref} position={[0, size*0.2, 0]}>
        <coneGeometry args={[size*0.15, size*0.45, 6]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.8} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export function OilDerrick({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* legs A-frame */}
      {([-1,1] as number[]).map((side, i) => (
        <mesh key={i} position={[side*size*0.45, size*0.75, 0]} rotation={[0,0,-side*0.45]}>
          <cylinderGeometry args={[size*0.05, size*0.05, size*1.5, 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* cross beam */}
      <mesh position={[0, size*1.25, 0]}>
        <boxGeometry args={[size*0.8, size*0.08, size*0.08]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* top pulley */}
      <mesh position={[0, size*1.55, 0]}>
        <torusGeometry args={[size*0.12, size*0.04, 6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* drill pipe */}
      <mesh position={[0, size*0.4, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.9, 6]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function BarnWest({ pos, color: _color, size }: P28) {
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*1.4, size*1.0, size*1.0]} />
        <meshStandardMaterial color="#cc3322" roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*1.12, 0]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[size*0.82, size*0.5, 4]} />
        <meshStandardMaterial color="#8B1a1a" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[0, size*0.3, size*0.51]}>
        <boxGeometry args={[size*0.38, size*0.55, size*0.03]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* X-brace on door */}
      <mesh position={[0, size*0.3, size*0.53]} rotation={[0,0,0.7]}>
        <boxGeometry args={[size*0.45, size*0.05, size*0.02]} />
        <meshStandardMaterial color="#4a2e0a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function PressBothLanterns({ pos, color: _color, size }: P28) {
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.06, size*1.2, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, size*1.22, 0]}>
        <boxGeometry args={[size*0.7, size*0.06, size*0.06]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* two lanterns */}
      {([-0.3, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.1, 0]}>
          <boxGeometry args={[size*0.18, size*0.25, size*0.18]} />
          <meshStandardMaterial color="#ffcc44" emissive="#ffaa00" emissiveIntensity={0.7} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function GoldMineCart({ pos, color, size }: P28) {
  return (
    <group position={pos}>
      {/* cart body */}
      <mesh position={[0, size*0.35, 0]}>
        <boxGeometry args={[size*0.9, size*0.5, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
      </mesh>
      {/* wheels */}
      {([-0.38, 0.38] as number[]).map((x, i) =>
        ([-0.22, 0.22] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[x*size, size*0.12, z*size]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[size*0.14, size*0.035, 6, 10]} />
            <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}
      {/* nuggets inside */}
      {([[-0.2,0.6,0.1],[0.15,0.65,-0.08],[0,0.68,0.15]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <dodecahedronGeometry args={[size*0.1, 0]} />
          <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
