import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Общий пропс-тип для всех мини-компонентов в этом батче пропсов:
// каждая модель параметризуется только позицией, базовым цветом и размером.
// Раньше тип назывался P6 в шаблоне, но определение потеряли при сплите файлов.
type P6 = { pos: [number, number, number]; color: string; size: number }

// ─── Transport-2 ────────────────────────────────────────

export function Ambulance({ pos, color, size }: P6) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.85, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[size * 0.62, size * 0.68, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.42, size * 0.85]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* red cross */}
      <mesh position={[0, size * 0.68, size * 0.46]}>
        <boxGeometry args={[size * 0.38, size * 0.08, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.68, size * 0.46]}>
        <boxGeometry args={[size * 0.08, size * 0.38, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      {/* red stripe */}
      <mesh position={[0, size * 0.32, size * 0.46]}>
        <boxGeometry args={[size * 1.8, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      {/* wheels */}
      {([-0.55, 0.55] as number[]).map((dx, i) =>
        ([-0.38, 0.38] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.12, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* siren light */}
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function FireTruck({ pos, color, size }: P6) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.4, size * 1.0, size * 0.95]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[size * 0.92, size * 0.88, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* ladder (yellow bars) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.8 + i * 0.35), size * 1.12, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.06, size * 0.9]} />
          <meshStandardMaterial color="#f39c12" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-size * 0.44, size * 1.16, size * 0.42]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.44, size * 1.16, -size * 0.42]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      {/* wheels */}
      {([-0.8, 0, 0.8] as number[]).map((dx, i) =>
        ([-0.42, 0.42] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* siren */}
      <mesh position={[size * 0.7, size * 1.04, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.1, size * 0.18]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function PoliceCar({ pos, color, size }: P6) {
  const c = color || '#1a5276'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.7, size * 0.75, size * 0.85]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* white doors strip */}
      <mesh position={[0, size * 0.38, size * 0.43]}>
        <boxGeometry args={[size * 0.8, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.85, size * 0.38, size * 0.82]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.38, size * 0.72, 0]}>
        <boxGeometry args={[size * 0.08, size * 0.3, size * 0.7]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* police siren bar */}
      <mesh position={[0, size * 0.94, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.1, size * 0.12]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      <mesh position={[-size * 0.12, size * 0.94, 0]}>
        <sphereGeometry args={[size * 0.07, 6, 6]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[size * 0.12, size * 0.94, 0]}>
        <sphereGeometry args={[size * 0.07, 6, 6]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1.0} />
      </mesh>
      {/* wheels */}
      {([-0.55, 0.55] as number[]).map((dx, i) =>
        ([-0.36, 0.36] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.17, size * 0.17, size * 0.1, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function SchoolBus({ pos, color, size }: P6) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.6, size * 1.1, size * 0.95]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* black stripe */}
      <mesh position={[0, size * 0.44, size * 0.48]}>
        <boxGeometry args={[size * 2.6, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      {/* windows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.85 + i * 0.42), size * 0.72, size * 0.48]}>
          <boxGeometry args={[size * 0.28, size * 0.3, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* stop sign arm */}
      <mesh position={[-size * 1.3, size * 0.55, size * 0.48]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>
      {/* wheels */}
      {([-0.85, 0.85] as number[]).map((dx, i) =>
        ([-0.42, 0.42] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function Tractor({ pos, color, size }: P6) {
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.7, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* hood */}
      <mesh position={[size * 0.55, size * 0.48, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.6]} />
        <meshStandardMaterial color="#1a8a48" roughness={0.6} />
      </mesh>
      {/* exhaust */}
      <mesh position={[size * 0.62, size * 0.9, size * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.35, 6]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
      {/* big rear wheels */}
      {([-0.38, 0.38] as number[]).map((dz, i) => (
        <mesh key={i} position={[-size * 0.28, size * 0.3, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.18, 12]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}
      {/* small front wheels */}
      {([-0.32, 0.32] as number[]).map((dz, i) => (
        <mesh key={i} position={[size * 0.6, size * 0.2, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.1, 10]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}
      {/* cabin */}
      <mesh position={[-size * 0.18, size * 0.92, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.48, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function SubmarineMini({ pos, color, size }: P6) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[size * 0.28, size * 1.1, 6, 12]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* conning tower */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.35, size * 0.2]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* periscope */}
      <mesh position={[size * 0.08, size * 0.62, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.3, 5]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* propeller */}
      <mesh position={[-size * 0.62, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.14, size * 0.03, 4, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* portholes */}
      {([-0.2, 0, 0.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.08, size * 0.29]}>
          <circleGeometry args={[size * 0.07, 10]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Sailboat({ pos, color, size }: P6) {
  const sailRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sailRef.current) sailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08
  })
  const c = color || '#8B4513'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.28, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* keel bottom */}
      <mesh position={[0, -size * 0.06, 0]}>
        <boxGeometry args={[size * 1.4, size * 0.1, size * 0.35]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.7} />
      </mesh>
      {/* mast */}
      <mesh position={[size * 0.1, size * 0.85, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.5, 6]} />
        <meshStandardMaterial color="#6B4226" roughness={0.5} />
      </mesh>
      {/* mainsail */}
      <mesh ref={sailRef} position={[size * 0.1, size * 0.85, 0]} castShadow>
        <coneGeometry args={[size * 0.55, size * 1.2, 3]} />
        <meshStandardMaterial color="#fff8f0" roughness={0.6} side={2} />
      </mesh>
      {/* jib */}
      <mesh position={[size * 0.52, size * 0.7, 0]} castShadow>
        <coneGeometry args={[size * 0.3, size * 0.8, 3]} />
        <meshStandardMaterial color="#fff8f0" roughness={0.6} side={2} />
      </mesh>
    </group>
  )
}

export function HotAirBalloon2({ pos, color, size }: P6) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.5) * size * 0.08
  })
  const c = color || '#e74c3c'
  return (
    <group ref={groupRef} position={pos}>
      {/* balloon envelope */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <sphereGeometry args={[size * 0.7, 12, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* color panels */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.62, size * 1.2, Math.sin(rad) * size * 0.62]}
            rotation={[0, -rad, 0]}>
            <boxGeometry args={[size * 0.2, size * 1.1, size * 0.05]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#f7dc6f' : c} roughness={0.5} />
          </mesh>
        )
      })}
      {/* ropes */}
      {([-0.28, 0.28] as number[]).map((dx, i) =>
        ([-0.28, 0.28] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.65, size * dz]} castShadow>
            <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.55, 4]} />
            <meshStandardMaterial color="#8B6914" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* basket */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.28, size * 0.55]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function CableCar({ pos, color, size }: P6) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* cable */}
      <mesh position={[0, size * 1.25, 0]}>
        <boxGeometry args={[size * 2.5, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* car body */}
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.85, size * 0.55, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* windows */}
      {([-0.25, 0, 0.25] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.78, size * 0.28]}>
          <boxGeometry args={[size * 0.2, size * 0.28, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* wheel assembly */}
      <mesh position={[0, size * 1.06, 0]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.22]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
      {/* hanging rods */}
      {([-0.28, 0.28] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.92, 0]} castShadow>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.32, 5]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function Monorail({ pos, color, size }: P6) {
  const c = color || '#3498db'
  return (
    <group position={pos}>
      {/* beam track */}
      <mesh position={[0, size * 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 3.5, size * 0.18, size * 0.35]} />
        <meshStandardMaterial color="#bbb" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* support pillars */}
      {([-1.3, 1.3] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.6, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} />
        </mesh>
      ))}
      {/* train car */}
      <mesh position={[0, size * 0.98, 0]} castShadow>
        <boxGeometry args={[size * 1.8, size * 0.45, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* nose */}
      <mesh position={[size * 0.95, size * 0.98, 0]} castShadow>
        <coneGeometry args={[size * 0.28, size * 0.3, 4]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* windows strip */}
      <mesh position={[0, size * 1.05, size * 0.28]}>
        <boxGeometry args={[size * 1.5, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

// ─── Food/Café ──────────────────────────────────────────

export function CafeTable({ pos, color, size }: P6) {
  const c = color || '#8B6914'
  return (
    <group position={pos}>
      {/* tabletop */}
      <mesh position={[0, size * 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.06, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.6, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* base plate */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.06, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      {/* 2 chairs */}
      {([-0.7, 0.7] as number[]).map((dx, i) => (
        <group key={i} position={[size * dx, 0, 0]}>
          <mesh position={[0, size * 0.26, 0]} castShadow>
            <boxGeometry args={[size * 0.35, size * 0.06, size * 0.35]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          <mesh position={[0, size * 0.52, -size * 0.16]}>
            <boxGeometry args={[size * 0.35, size * 0.42, size * 0.04]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          {([-0.14, 0.14] as number[]).map((dz, j) => (
            <mesh key={j} position={[size * 0.14 * (i === 0 ? -1 : 1), size * 0.13, size * dz]}>
              <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.26, 5]} />
              <meshStandardMaterial color="#888" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function CoffeeCup({ pos, color, size }: P6) {
  const steamRef1 = useRef<THREE.Mesh>(null!)
  const steamRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (steamRef1.current) { steamRef1.current.position.y = size * 1.1 + Math.sin(t * 1.2) * size * 0.05; (steamRef1.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(t * 1.2) * 0.2 }
    if (steamRef2.current) { steamRef2.current.position.y = size * 1.2 + Math.sin(t * 1.5 + 1) * size * 0.06; (steamRef2.current.material as THREE.MeshStandardMaterial).opacity = 0.4 + Math.sin(t * 1.5) * 0.2 }
  })
  const c = color || '#6F4E37'
  return (
    <group position={pos}>
      {/* saucer */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.65, size * 0.65, size * 0.06, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* cup body */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.26, size * 0.72, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* coffee inside */}
      <mesh position={[0, size * 0.76, 0]}>
        <cylinderGeometry args={[size * 0.3, size * 0.3, size * 0.02, 12]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* handle */}
      <mesh position={[size * 0.4, size * 0.42, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.04, 5, 10, Math.PI]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* steam puffs */}
      <mesh ref={steamRef1} position={[-size * 0.07, size * 1.1, 0]}>
        <sphereGeometry args={[size * 0.08, 5, 5]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.5} roughness={0.8} />
      </mesh>
      <mesh ref={steamRef2} position={[size * 0.07, size * 1.2, 0]}>
        <sphereGeometry args={[size * 0.1, 5, 5]} />
        <meshStandardMaterial color="#eee" transparent opacity={0.4} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function CakeSlice({ pos, color, size }: P6) {
  const c = color || '#f5cba7'
  return (
    <group position={pos}>
      {/* slice body — wedge (1/6 of cylinder) */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.6, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* frosting top */}
      <mesh position={[0, size * 0.61, 0]} castShadow>
        <cylinderGeometry args={[size * 0.61, size * 0.61, size * 0.08, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* strawberry on top */}
      <mesh position={[size * 0.18, size * 0.72, size * 0.08]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.5} />
      </mesh>
      {/* filling layers */}
      <mesh position={[0, size * 0.24, 0]} castShadow>
        <cylinderGeometry args={[size * 0.61, size * 0.61, size * 0.08, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function IceCreamStand({ pos, color, size }: P6) {
  const c = color || '#ff69b4'
  return (
    <group position={pos}>
      {/* umbrella pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.6, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* umbrella canopy */}
      <mesh position={[0, size * 1.62, 0]} castShadow>
        <coneGeometry args={[size * 0.85, size * 0.42, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* counter cart */}
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.9, size * 0.85, size * 0.6]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* stripe */}
      <mesh position={[0, size * 0.55, size * 0.31]}>
        <boxGeometry args={[size * 0.9, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* ice cream scoops */}
      {([-0.22, 0, 0.22] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 1.0, 0]} castShadow>
          <sphereGeometry args={[size * 0.14, 8, 8]} />
          <meshStandardMaterial color={(['#ff69b4','#87ceeb','#90ee90'] as string[])[i]!} roughness={0.4} />
        </mesh>
      ))}
      {/* wheels */}
      {([-0.3, 0.3] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.1, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 10]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function FoodCart({ pos, color, size }: P6) {
  const c = color || '#e67e22'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.95, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.02, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.12, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* menu board */}
      <mesh position={[0, size * 0.85, size * 0.36]}>
        <boxGeometry args={[size * 0.7, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* handle */}
      <mesh position={[-size * 0.6, size * 0.75, 0]}>
        <boxGeometry args={[size * 0.08, size * 0.45, size * 0.6]} />
        <meshStandardMaterial color="#555" roughness={0.4} />
      </mesh>
      {/* wheels */}
      {([-0.3, 0.3] as number[]).map((dz, i) =>
        ([-0.38, 0.38] as number[]).map((dx, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.18, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.1, 10]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function PizzaOven({ pos, color, size }: P6) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })
  const c = color || '#d35400'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.55, size * 1.1]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      {/* dome */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.52, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* arch opening */}
      <mesh position={[0, size * 0.5, size * 0.5]}>
        <boxGeometry args={[size * 0.45, size * 0.42, size * 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* fire glow inside */}
      <mesh ref={glowRef} position={[0, size * 0.42, size * 0.35]}>
        <sphereGeometry args={[size * 0.18, 6, 6]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4500" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
      {/* chimney */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.45, 6]} />
        <meshStandardMaterial color="#666" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function SodaMachine({ pos, color, size }: P6) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.75, size * 1.5, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* screen / display */}
      <mesh position={[0, size * 1.05, size * 0.28]}>
        <boxGeometry args={[size * 0.55, size * 0.45, size * 0.02]} />
        <meshStandardMaterial color="#1a2030" roughness={0.2} />
      </mesh>
      {/* can graphic */}
      <mesh position={[0, size * 1.05, size * 0.3]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.28, 8]} />
        <meshStandardMaterial color="#f8c300" roughness={0.3} />
      </mesh>
      {/* button panel */}
      <mesh position={[0, size * 0.5, size * 0.28]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#c0392b" roughness={0.3} />
      </mesh>
      {/* buttons x4 */}
      {([-0.15, 0.15] as number[]).map((dx, i) =>
        ([-0.06, 0.06] as number[]).map((dy, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.5 + size * dy, size * 0.295]}>
            <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.02, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#e74c3c' : '#3498db'} roughness={0.3} />
          </mesh>
        ))
      )}
      {/* coin slot */}
      <mesh position={[size * 0.25, size * 0.62, size * 0.28]}>
        <boxGeometry args={[size * 0.06, size * 0.02, size * 0.02]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* tray */}
      <mesh position={[0, size * 0.24, size * 0.3]}>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.14]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Cupcake({ pos, color, size }: P6) {
  const c = color || '#ff69b4'
  return (
    <group position={pos}>
      {/* paper cup */}
      <mesh position={[0, size * 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.22, size * 0.44, 10]} />
        <meshStandardMaterial color="#fff8e1" roughness={0.6} />
      </mesh>
      {/* wrapper lines */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.08 + i * size * 0.12, 0]}>
          <cylinderGeometry args={[size * 0.29, size * 0.23, size * 0.02, 10]} />
          <meshStandardMaterial color="#f39c12" roughness={0.5} />
        </mesh>
      ))}
      {/* frosting dome */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* sprinkles */}
      {([[-0.1, 0.62, 0.12], [0.08, 0.68, -0.08], [0.14, 0.58, 0.1], [-0.05, 0.72, 0]] as [number,number,number][]).map(([dx = 0,dy = 0,dz = 0], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * dz]} castShadow>
          <sphereGeometry args={[size * 0.04, 4, 4]} />
          <meshStandardMaterial color={(['#f7dc6f','#3498db','#27ae60','#e74c3c'] as string[])[i]!} roughness={0.4} />
        </mesh>
      ))}
      {/* cherry on top */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <sphereGeometry args={[size * 0.08, 6, 6]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function Pretzel({ pos, color, size }: P6) {
  const c = color || '#c8860a'
  return (
    <group position={pos}>
      {/* outer ring left */}
      <mesh position={[-size * 0.2, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.08, 6, 10, Math.PI * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* outer ring right */}
      <mesh position={[size * 0.2, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.08, 6, 10, Math.PI * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* bottom twist */}
      <mesh position={[0, size * 0.15, 0]} castShadow>
        <torusGeometry args={[size * 0.14, size * 0.08, 6, 8, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* salt dots */}
      {([[-0.15, 0.5], [0.15, 0.5], [0, 0.15], [-0.25, 0.28], [0.25, 0.28]] as [number,number][]).map(([dx,dy], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * 0.08]}>
          <sphereGeometry args={[size * 0.03, 4, 4]} />
          <meshStandardMaterial color="#fff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function HotDogStand({ pos, size }: P6) {
  return (
    <group position={pos}>
      {/* umbrella pole */}
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.7, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* umbrella */}
      <mesh position={[0, size * 1.72, 0]} castShadow>
        <coneGeometry args={[size * 0.9, size * 0.45, 8]} />
        <meshStandardMaterial color="#f39c12" roughness={0.6} />
      </mesh>
      {/* umbrella stripes */}
      {([0, 45, 90, 135, 180, 225, 270, 315] as number[]).map((deg, i) => {
        if (i % 2 !== 0) return null
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.42, size * 1.55, Math.sin(rad) * size * 0.42]}
            rotation={[0, -rad, Math.PI * 0.2]}>
            <boxGeometry args={[size * 0.04, size * 0.42, size * 0.04]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.6} />
          </mesh>
        )
      })}
      {/* cart */}
      <mesh position={[0, size * 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.95, size * 0.9, size * 0.65]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      {/* grill top */}
      <mesh position={[0, size * 0.92, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.7]} />
        <meshStandardMaterial color="#555" roughness={0.4} />
      </mesh>
      {/* sausage */}
      <mesh position={[size * 0.12, size * 0.98, 0]} castShadow rotation={[0, Math.PI * 0.1, Math.PI / 2]}>
        <capsuleGeometry args={[size * 0.06, size * 0.4, 4, 8]} />
        <meshStandardMaterial color="#c0392b" roughness={0.5} />
      </mesh>
      {/* wheels */}
      {([-0.28, 0.28] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.2, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.1, 10]} />
          <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 7 — Sports-2 & Space-2 (20 props)
// ══════════════════════════════════════════════════════════

interface P7 { pos: [number,number,number]; color: string; size: number }

// ─── Sports-2 ───────────────────────────────────────────

export function SwimmingPool({ pos, color, size }: P7) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (waterRef.current) {
      const m = waterRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* pool basin */}
      <mesh position={[0, -size * 0.1, 0]} receiveShadow>
        <boxGeometry args={[size * 2.8, size * 0.2, size * 1.6]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {/* side walls */}
      {([
        { pos: [0, size * 0.1, size * 0.82] as [number,number,number], args: [size * 2.8, size * 0.2, size * 0.04] as [number,number,number] },
        { pos: [0, size * 0.1, -size * 0.82] as [number,number,number], args: [size * 2.8, size * 0.2, size * 0.04] as [number,number,number] },
        { pos: [size * 1.42, size * 0.1, 0] as [number,number,number], args: [size * 0.04, size * 0.2, size * 1.6] as [number,number,number] },
        { pos: [-size * 1.42, size * 0.1, 0] as [number,number,number], args: [size * 0.04, size * 0.2, size * 1.6] as [number,number,number] },
      ]).map(({ pos: wp, args }, i) => (
        <mesh key={i} position={wp} castShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#ddd" roughness={0.4} />
        </mesh>
      ))}
      {/* water surface */}
      <mesh ref={waterRef} position={[0, size * 0.08, 0]}>
        <boxGeometry args={[size * 2.74, size * 0.04, size * 1.58]} />
        <meshStandardMaterial color={c} roughness={0.05} metalness={0.1} transparent opacity={0.85} emissive={c} emissiveIntensity={0.1} />
      </mesh>
      {/* lane dividers */}
      {([-0.55, 0, 0.55] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.1, size * dz]}>
          <boxGeometry args={[size * 2.7, size * 0.03, size * 0.04]} />
          <meshStandardMaterial color={i === 1 ? '#f39c12' : '#e74c3c'} roughness={0.4} />
        </mesh>
      ))}
      {/* diving board */}
      <mesh position={[size * 1.2, size * 0.32, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.06, size * 0.18]} />
        <meshStandardMaterial color="#3498db" roughness={0.3} />
      </mesh>
      <mesh position={[size * 1.38, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.36, 5]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} />
      </mesh>
    </group>
  )
}

export function TennisCourt({ pos, color, size }: P7) {
  const c = color || '#2ecc71'
  return (
    <group position={pos}>
      {/* court surface */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <boxGeometry args={[size * 3.0, size * 0.08, size * 1.8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* court lines */}
      {[
        { p: [0, size * 0.09, 0] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [0, size * 0.09, size * 0.88] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [0, size * 0.09, -size * 0.88] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [-size * 1.48, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
        { p: [size * 1.48, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
        { p: [0, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
      ].map(({ p, a }, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={a} />
          <meshStandardMaterial color="#fff" roughness={0.4} />
        </mesh>
      ))}
      {/* net posts */}
      {([-0.92, 0.92] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.32, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.55, 5]} />
          <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* net */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.02, size * 0.28, size * 1.84]} />
        <meshStandardMaterial color="#fff" roughness={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function SkiJump({ pos, color, size }: P7) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* ramp structure */}
      <mesh position={[size * 0.4, size * 0.8, 0]} rotation={[0, 0, -Math.PI * 0.22]} castShadow>
        <boxGeometry args={[size * 2.0, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#ddd" roughness={0.5} />
      </mesh>
      {/* support tower */}
      <mesh position={[-size * 0.5, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.18, size * 1.0, size * 0.5]} />
        <meshStandardMaterial color="#aaa" roughness={0.5} />
      </mesh>
      {/* ramp rails */}
      {([-0.22, 0.22] as number[]).map((dz, i) => (
        <mesh key={i} position={[size * 0.4, size * 0.82, size * dz]} rotation={[0, 0, -Math.PI * 0.22]}>
          <boxGeometry args={[size * 2.0, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* jump lip (upward curve tip) */}
      <mesh position={[size * 1.38, size * 1.18, 0]} rotation={[0, 0, Math.PI * 0.08]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {/* flag */}
      <mesh position={[-size * 0.5, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.4, 5]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      <mesh position={[-size * 0.36, size * 1.24, 0]}>
        <boxGeometry args={[size * 0.28, size * 0.16, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function BowlingPin({ pos, color, size }: P7) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* pin arrangement — triangle of 6 */}
      {([
        [0, 0], [0.4, -0.3], [-0.4, -0.3], [0.8, -0.6], [0, -0.6], [-0.8, -0.6]
      ] as [number,number][]).map(([dx, dz], i) => (
        <group key={i} position={[size * dx, 0, size * dz]}>
          {/* pin body */}
          <mesh position={[0, size * 0.38, 0]} castShadow>
            <cylinderGeometry args={[size * 0.12, size * 0.15, size * 0.55, 10]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* pin neck */}
          <mesh position={[0, size * 0.68, 0]} castShadow>
            <cylinderGeometry args={[size * 0.07, size * 0.12, size * 0.14, 10]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* pin head */}
          <mesh position={[0, size * 0.82, 0]} castShadow>
            <sphereGeometry args={[size * 0.1, 8, 8]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* red stripe */}
          <mesh position={[0, size * 0.5, 0]}>
            <cylinderGeometry args={[size * 0.125, size * 0.125, size * 0.06, 10]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* bowling ball */}
      <mesh position={[size * 1.2, size * 0.18, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 10]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function Dartboard({ pos, size }: P7) {
  return (
    <group position={pos}>
      {/* board rings */}
      {([
        { r: size * 0.55, col: '#222' },
        { r: size * 0.46, col: '#27ae60' },
        { r: size * 0.38, col: '#222' },
        { r: size * 0.3,  col: '#27ae60' },
        { r: size * 0.22, col: '#e74c3c' },
        { r: size * 0.14, col: '#e74c3c' },
        { r: size * 0.07, col: '#27ae60' },
      ]).map(({ r, col }, i) => (
        <mesh key={i} position={[0, size * 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 20]} />
          <meshStandardMaterial color={col} roughness={0.5} side={2} />
        </mesh>
      ))}
      {/* bullseye */}
      <mesh position={[0, size * 0.8, size * 0.01]}>
        <circleGeometry args={[size * 0.04, 12]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      {/* dart */}
      <mesh position={[size * 0.08, size * 0.8, size * 0.04]} rotation={[0, Math.PI * 0.1, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.015, size * 0.003, size * 0.25, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* board backing */}
      <mesh position={[0, size * 0.8, -size * 0.02]}>
        <cylinderGeometry args={[size * 0.58, size * 0.58, size * 0.04, 20]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.7} />
      </mesh>
      {/* stand post */}
      <mesh position={[0, size * 0.4, -size * 0.04]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.8, 6]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function GolfHole({ pos, color, size }: P7) {
  const flagRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (flagRef.current) flagRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.3
  })
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* green */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 1.0, size * 1.0, size * 0.08, 16]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* hole */}
      <mesh position={[size * 0.35, size * 0.04, size * 0.2]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* flag post */}
      <mesh position={[size * 0.35, size * 0.45, size * 0.2]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.82, 5]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* flag */}
      <mesh ref={flagRef} position={[size * 0.52, size * 0.8, size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
      {/* golf ball */}
      <mesh position={[-size * 0.3, size * 0.1, -size * 0.4]} castShadow>
        <sphereGeometry args={[size * 0.08, 10, 10]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
    </group>
  )
}

export function ClimbingWall({ pos, color, size }: P7) {
  const c = color || '#e67e22'
  return (
    <group position={pos}>
      {/* wall panel */}
      <mesh position={[0, size * 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * 2.0, size * 0.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* handholds (colored bumps) */}
      {[
        [-0.5, 1.6, 0.1], [0.2, 1.4, 0.1], [0.55, 1.75, 0.1],
        [-0.3, 1.2, 0.1], [0.45, 1.05, 0.1], [0, 1.85, 0.1],
        [-0.6, 0.8, 0.1], [0.3, 0.7, 0.1], [-0.15, 0.5, 0.1],
        [0.55, 0.35, 0.1], [-0.5, 0.25, 0.1], [0.1, 0.15, 0.1],
      ].map(([dx = 0, dy = 0, dz = 0], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * dz]} castShadow>
          <sphereGeometry args={[size * 0.09, 6, 6]} />
          <meshStandardMaterial color={(['#e74c3c','#27ae60','#f39c12','#3498db','#9b59b6','#1abc9c'] as string[])[i % 6]!} roughness={0.5} />
        </mesh>
      ))}
      {/* base platform */}
      <mesh position={[0, size * 0.05, size * 0.15]} receiveShadow>
        <boxGeometry args={[size * 1.6, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function BalanceBeam({ pos, color, size }: P7) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* beam */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 2.8, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* support legs */}
      {([-1.2, 1.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.12, size * 0.6, size * 0.35]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} />
        </mesh>
      ))}
      {/* leg feet */}
      {([-1.2, 1.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.04, 0]} receiveShadow>
          <boxGeometry args={[size * 0.45, size * 0.08, size * 0.45]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
      {/* crash mats */}
      {([-0.6, 0.6] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.04, size * 0.35]} receiveShadow>
          <boxGeometry args={[size * 0.8, size * 0.08, size * 0.6]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function RacingFlag({ pos, size }: P7) {
  const flagRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.15
      flagRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.5 + 0.5) * 0.2
    }
  })
  return (
    <group position={pos}>
      {/* flag pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.6, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* checkered flag */}
      <mesh ref={flagRef} position={[size * 0.38, size * 1.5, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.48, size * 0.03]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      {/* checker pattern (black squares) */}
      {([
        [-0.22, 1.58, 0.02], [0, 1.58, 0.02], [0.22, 1.58, 0.02],
        [-0.11, 1.46, 0.02], [0.11, 1.46, 0.02],
        [-0.22, 1.34, 0.02], [0, 1.34, 0.02], [0.22, 1.34, 0.02],
      ] as [number,number,number][]).map(([dx,dy,dz], i) => (
        i % 2 === 0 ? (
          <mesh key={i} position={[size * dx, size * dy, size * dz]}>
            <boxGeometry args={[size * 0.18, size * 0.12, size * 0.01]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
        ) : null
      ))}
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.22, size * 0.1, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function MedalStand({ pos, size }: P7) {
  return (
    <group position={pos}>
      {/* podium blocks */}
      {[
        { dx: 0,    h: 0.55, label: '🥇', col: '#f8c300' },
        { dx: -0.7, h: 0.4,  label: '🥈', col: '#aaa' },
        { dx: 0.7,  h: 0.3,  label: '🥉', col: '#cd7f32' },
      ].map(({ dx, h, col }, i) => (
        <group key={i} position={[size * dx, 0, 0]}>
          <mesh position={[0, size * h * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[size * 0.55, size * h, size * 0.55]} />
            <meshStandardMaterial color={col} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* number */}
          <mesh position={[0, size * h + size * 0.04, size * 0.28]}>
            <boxGeometry args={[size * 0.38, size * 0.3, size * 0.02]} />
            <meshStandardMaterial color="#fff" roughness={0.4} />
          </mesh>
          {/* trophy on top */}
          <mesh position={[0, size * h + size * 0.15, 0]} castShadow>
            <sphereGeometry args={[size * 0.1, 8, 8]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Space-2 ────────────────────────────────────────────

export function MoonBase({ pos, color, size }: P7) {
  const c = color || '#b0b8c8'
  return (
    <group position={pos}>
      {/* main habitat dome */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[size * 0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* dome ring base */}
      <mesh position={[0, size * 0.06, 0]}>
        <cylinderGeometry args={[size * 0.57, size * 0.57, size * 0.12, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      {/* connecting tunnel */}
      <mesh position={[size * 0.65, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.6, 8]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* secondary dome */}
      <mesh position={[size * 1.0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* solar panels */}
      {([-0.45, 0.45] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.55, size * dz]} castShadow>
          <boxGeometry args={[size * 0.5, size * 0.04, size * 0.28]} />
          <meshStandardMaterial color="#1a3a6a" roughness={0.2} metalness={0.3} />
        </mesh>
      ))}
      {/* airlock */}
      <mesh position={[-size * 0.55, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.15, size * 0.35, size * 0.2]} />
        <meshStandardMaterial color="#666" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function SpaceRover({ pos, color, size }: P7) {
  const c = color || '#f5f0e0'
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (wheelRef.current) wheelRef.current.rotation.z = clock.getElapsedTime() * 0.5
  })
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.35, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* instrument mast */}
      <mesh position={[size * 0.3, size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.7, 5]} />
        <meshStandardMaterial color="#888" roughness={0.3} />
      </mesh>
      {/* camera head */}
      <mesh position={[size * 0.3, size * 1.1, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.18]} />
        <meshStandardMaterial color="#333" roughness={0.3} />
      </mesh>
      {/* solar panel */}
      <mesh position={[-size * 0.12, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.04, size * 0.38]} />
        <meshStandardMaterial color="#1a3a6a" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* wheels x6 */}
      <group ref={wheelRef}>
        {([-0.45, 0, 0.45] as number[]).map((dx, i) =>
          ([-0.4, 0.4] as number[]).map((dz, j) => (
            <mesh key={`${i}-${j}`} position={[size * dx, size * 0.16, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.1, 10]} />
              <meshStandardMaterial color="#444" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}

export function SatelliteDish2({ pos, color, size }: P7) {
  const dishRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (dishRef.current) dishRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.8
  })
  const c = color || '#ddd'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.4, size * 0.16, 8]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      {/* rotating assembly */}
      <group ref={dishRef} position={[0, size * 0.16, 0]}>
        {/* pivot shaft */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.56, 6]} />
          <meshStandardMaterial color="#888" roughness={0.4} />
        </mesh>
        {/* dish arm */}
        <mesh position={[0, size * 0.5, size * 0.28]} rotation={[Math.PI * 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.55, 5]} />
          <meshStandardMaterial color="#999" roughness={0.4} />
        </mesh>
        {/* dish bowl */}
        <mesh position={[0, size * 0.72, size * 0.45]} rotation={[Math.PI * 0.55, 0, 0]} castShadow>
          <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={c} roughness={0.2} metalness={0.2} side={2} />
        </mesh>
        {/* feed horn */}
        <mesh position={[0, size * 0.72, size * 0.45]}>
          <cylinderGeometry args={[size * 0.06, size * 0.03, size * 0.22, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function AlienShip({ pos, color, size }: P7) {
  const hoverRef = useRef<THREE.Group>(null!)
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (hoverRef.current) hoverRef.current.position.y = pos[1] + Math.sin(t * 0.6) * size * 0.1
    if (beamRef.current) {
      const m = beamRef.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.3 + Math.sin(t * 2) * 0.15
    }
  })
  const c = color || '#00ff88'
  return (
    <group ref={hoverRef} position={pos}>
      {/* saucer body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.65, 12, 6]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* cockpit dome */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} emissive={c} emissiveIntensity={0.3} />
      </mesh>
      {/* rim lights */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.58, -size * 0.08, Math.sin(rad) * size * 0.58]}>
            <sphereGeometry args={[size * 0.06, 5, 5]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.0} />
          </mesh>
        )
      })}
      {/* tractor beam */}
      <mesh ref={beamRef} position={[0, -size * 0.55, 0]}>
        <coneGeometry args={[size * 0.35, size * 0.9, 8]} />
        <meshStandardMaterial color={c} transparent opacity={0.35} roughness={0.1} emissive={c} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

export function CryoPod({ pos, color, size }: P7) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.2) * 0.2
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* pod shell */}
      <mesh position={[0, size * 0.65, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[size * 0.3, size * 0.7, 4, 12]} />
        <meshStandardMaterial color="#333" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* frost glass window */}
      <mesh ref={glowRef} position={[0, size * 0.75, size * 0.3]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.8, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.05} transparent opacity={0.55} emissive={c} emissiveIntensity={0.5} />
      </mesh>
      {/* control panel */}
      <mesh position={[0, size * 0.18, size * 0.28]}>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.04]} />
        <meshStandardMaterial color="#1a2030" roughness={0.2} />
      </mesh>
      {/* status lights */}
      {([-0.1, 0, 0.1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.18, size * 0.31]}>
          <sphereGeometry args={[size * 0.025, 5, 5]} />
          <meshStandardMaterial color={(['#27ae60','#f39c12','#e74c3c'] as string[])[i]!} emissive={(['#27ae60','#f39c12','#e74c3c'] as string[])[i]!} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* base stand */}
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <boxGeometry args={[size * 0.75, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function SpaceSuit({ pos, color, size }: P7) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* helmet */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 10, 10]} />
        <meshStandardMaterial color={c} roughness={0.2} />
      </mesh>
      {/* visor */}
      <mesh position={[size * 0.18, size * 1.22, size * 0.2]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 8, 0, Math.PI, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#f39c12" roughness={0.1} transparent opacity={0.8} emissive="#f39c12" emissiveIntensity={0.2} />
      </mesh>
      {/* torso */}
      <mesh position={[0, size * 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.52, size * 0.7, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* backpack (life support) */}
      <mesh position={[0, size * 0.72, -size * 0.25]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.55, size * 0.16]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
      {/* arms */}
      {([-0.35, 0.35] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.72, 0]} castShadow>
          <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.6, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* gloves */}
      {([-0.35, 0.35] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 7, 7]} />
          <meshStandardMaterial color="#ccc" roughness={0.4} />
        </mesh>
      ))}
      {/* legs */}
      {([-0.15, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.55, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* boots */}
      {([-0.15, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx * 0.8, size * -0.02, size * 0.06]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.18, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SingleMeteor({ offset, size, color }: { offset: number; size: number; color: string }) {
  const ref = useRef<THREE.Group>(null!)
  const c = color || '#ff6b35'
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const cycle = (t * size * 0.6 + offset) % (size * 4)
    ref.current.position.y = size * 2.5 - cycle
    ref.current.position.x = Math.sin(t * 0.3 + offset) * size * 0.2
  })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[size * (0.08 + offset * 0.015), 5, 5]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.05, size * 0.18, 0]} rotation={[Math.PI * 0.1, 0, 0]}>
        <coneGeometry args={[size * 0.06, size * 0.4, 5]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export function MeteorShower({ pos, color, size }: P7) {
  return (
    <group position={pos}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SingleMeteor key={i} offset={i * 0.8 * size} size={size} color={color} />
      ))}
    </group>
  )
}

export function RingPlanet({ pos, color, size }: P7) {
  const planetRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = clock.getElapsedTime() * 0.2
      planetRef.current.rotation.x = 0.3
    }
  })
  const c = color || '#e8a87c'
  return (
    <group ref={planetRef} position={pos}>
      {/* planet */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.65, 14, 12]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* surface bands */}
      {([0.3, 0] as number[]).map((lat, i) => (
        <mesh key={i} position={[0, size * lat * 0.5, 0]} rotation={[lat, 0, 0]}>
          <torusGeometry args={[size * 0.65, size * 0.05, 5, 24]} />
          <meshStandardMaterial color={i === 0 ? '#c87050' : '#d4956a'} roughness={0.4} />
        </mesh>
      ))}
      {/* rings */}
      {([1.1, 1.3, 1.5] as number[]).map((r, i) => (
        <mesh key={i} rotation={[Math.PI * 0.22, 0, 0]}>
          <torusGeometry args={[size * r, size * (0.06 - i * 0.01), 4, 32]} />
          <meshStandardMaterial color={(['#d4a857','#c8a04a','#b89840'] as string[])[i]!} roughness={0.5} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function RocketLaunchPad({ pos, color, size }: P7) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* launch platform */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.16, size * 1.8]} />
        <meshStandardMaterial color="#555" roughness={0.6} />
      </mesh>
      {/* support structure */}
      {([[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * dz]} castShadow>
          <boxGeometry args={[size * 0.1, size * 1.6, size * 0.1]} />
          <meshStandardMaterial color="#888" roughness={0.4} />
        </mesh>
      ))}
      {/* rocket body */}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.25, size * 1.8, 10]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* rocket nose */}
      <mesh position={[0, size * 2.35, 0]} castShadow>
        <coneGeometry args={[size * 0.2, size * 0.55, 10]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* fins */}
      {([0, 120, 240] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.22, size * 0.65, Math.sin(rad) * size * 0.22]}
            rotation={[0, -rad, Math.PI * 0.05]}>
            <boxGeometry args={[size * 0.35, size * 0.55, size * 0.04]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
        )
      })}
      {/* exhaust flame */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <coneGeometry args={[size * 0.14, size * 0.45, 6]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4500" emissiveIntensity={1.0} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function SpaceCannon({ pos, color, size }: P7) {
  const barrelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (barrelRef.current) barrelRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.2 - 0.3
  })
  const c = color || '#555'
  return (
    <group position={pos}>
      {/* base turret */}
      <mesh position={[0, size * 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.5, size * 0.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* turret ring */}
      <mesh position={[0, size * 0.42, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.42, size * 0.08, 8]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* rotating barrel group */}
      <group ref={barrelRef} position={[0, size * 0.5, 0]}>
        {/* main barrel */}
        <mesh position={[0, 0, size * 0.55]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.15, size * 1.1, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* barrel rings */}
        {([0.15, 0.4, 0.65] as number[]).map((dz, i) => (
          <mesh key={i} position={[0, 0, size * dz]}>
            <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.08, 8]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.5} />
          </mesh>
        ))}
        {/* muzzle glow */}
        <mesh position={[0, 0, size * 1.12]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.8} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  )
}
