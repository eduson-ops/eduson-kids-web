import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ─── Fantasy ─────────────────────────────────────────────
export function CastleTower({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const MERLON_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
  const WINDOW_Y = [size * 0.9, size * 1.4, size * 1.9]
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.44, size * 0.48, size * 2.2, 14]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.45, size * 0.45]}>
        <boxGeometry args={[size * 0.32, size * 0.55, size * 0.08]} />
        <meshStandardMaterial color="#2a3340" roughness={0.8} />
      </mesh>
      {WINDOW_Y.map((y, j) => (
        <mesh key={j} position={[0, y, size * 0.45]}>
          <boxGeometry args={[size * 0.14, size * 0.22, size * 0.06]} />
          <meshStandardMaterial color="#2a3340" roughness={0.8} />
        </mesh>
      ))}
      {MERLON_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.38, size * 2.38, Math.sin(a) * size * 0.38]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.26, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 2.6, 0]} castShadow>
        <coneGeometry args={[size * 0.54, size * 0.7, 14]} />
        <meshStandardMaterial color="#ff5464" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 3.05, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 6]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.12, size * 3.18, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.16, size * 0.02]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function MagicOrb({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const orbRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (orbRef.current) orbRef.current.rotation.y += dt * 0.5
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.9
  })
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.24, 10]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.28, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.28, size * 0.08, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={orbRef} position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, size * 0.65, 0]}>
        <sphereGeometry args={[size * 0.24, 14, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      <group ref={ringRef} position={[0, size * 0.65, 0]}>
        <mesh rotation={[Math.PI * 0.3, 0, 0]}>
          <torusGeometry args={[size * 0.48, size * 0.04, 8, 22]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export function Throne({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CROWN_X = [-0.32, -0.16, 0, 0.16, 0.32]
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.12, size * 0.9]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <boxGeometry args={[size * 0.88, size * 0.1, size * 0.72]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.8, -size * 0.34]} castShadow>
        <boxGeometry args={[size * 0.88, size * 1.1, size * 0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {CROWN_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 1.42, -size * 0.34]} castShadow>
          <coneGeometry args={[size * 0.06, size * (i % 2 === 0 ? 0.22 : 0.16), 6]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.7, -size * 0.34]}>
        <sphereGeometry args={[size * 0.07, 8, 6]} />
        <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function Guitar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.15]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.4, size * 0.18, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.14, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Sound hole */}
      <mesh position={[0, size * 0.06, size * 0.12]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 1.1, size * 0.08]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 1.34, 0]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.22, size * 0.07]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Strings */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.05]}>
          <cylinderGeometry args={[size * 0.003, size * 0.003, size * 1.3, 4]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Piano({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const WHITE_KEYS = 7
  const BLACK_KEYS = [1, 2, 4, 5, 6]
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.5, size * 0.7, size * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Legs */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.2, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ))}
      {/* White keys */}
      {Array.from({ length: WHITE_KEYS }, (_, i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19, size * 0.73, size * 0.22]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.06, size * 0.28]} />
          <meshStandardMaterial color="#f0ede0" roughness={0.3} />
        </mesh>
      ))}
      {/* Black keys */}
      {BLACK_KEYS.map((i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19 - size * 0.095, size * 0.78, size * 0.12]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
      ))}
      {/* Lid */}
      <mesh position={[0, size * 0.77, -size * 0.08]} rotation={[-Math.PI * 0.15, 0, 0]} castShadow>
        <boxGeometry args={[size * 1.5, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

export function DrumKit({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Bass drum (large, on ground) */}
      <mesh position={[0, size * 0.22, 0]} castShadow receiveShadow rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.28, 20]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.22, size * 0.15]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.02, 20]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Snare drum */}
      <mesh position={[-size * 0.5, size * 0.5, size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.12, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-size * 0.5, size * 0.56, size * 0.1]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.01, 16]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Hi-hat cymbal */}
      <mesh position={[size * 0.5, size * 0.7, -size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.02, 20]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Cymbal stand */}
      <mesh position={[size * 0.5, size * 0.38, -size * 0.1]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.72, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Tom-tom */}
      <mesh position={[size * 0.15, size * 0.68, size * 0.05]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.12, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.15, size * 0.74, size * 0.05]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.01, 14]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Drumsticks */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, -size * 0.28]} rotation={[-Math.PI * 0.4, 0, x * 5]}>
          <cylinderGeometry args={[size * 0.018, size * 0.01, size * 0.6, 6]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function SoccerBall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 24, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Pentagon patches */}
      {[
        [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1],
      ].map(([x = 0, y = 0, z = 0], i) => (
        <mesh key={i} position={[x * size * 0.33, y * size * 0.33 + size * 0.38, z * size * 0.33]}>
          <dodecahedronGeometry args={[size * 0.1, 0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function Trophy({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.12, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.14, size * 0.22, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup body */}
      <mesh position={[0, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.2, size * 0.54, 18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup rim */}
      <mesh position={[0, size * 0.86, 0]} castShadow>
        <torusGeometry args={[size * 0.32, size * 0.04, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Handles */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.42, size * 0.58, 0]} castShadow>
          <torusGeometry args={[size * 0.12, size * 0.03, 8, 12, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Star on top */}
      <mesh position={[0, size * 0.96, 0]}>
        <sphereGeometry args={[size * 0.1, 10, 8]} />
        <meshStandardMaterial color="#fff" emissive="#ffe066" emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function GoalNet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.22, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Back bar */}
      <mesh position={[0, size * 0.6, -size * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, size * 1.22, -size * 0.5]} rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Net planes */}
      <mesh position={[0, size * 0.61, -size * 0.25]} receiveShadow>
        <boxGeometry args={[size * 1.16, size * 1.16, size * 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.18} side={2} />
      </mesh>
    </group>
  )
}

export function Duck({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[size * 0.2, size * 0.58, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Beak */}
      <mesh position={[size * 0.38, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.06, size * 0.08]} />
        <meshStandardMaterial color="#FF8C1A" roughness={0.6} />
      </mesh>
      {/* Eye */}
      <mesh position={[size * 0.35, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.028, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      {/* Tail */}
      <mesh position={[-size * 0.28, size * 0.38, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
        <coneGeometry args={[size * 0.1, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Feet */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[size * 0.04, size * 0.04, side * size * 0.12]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.04, size * 0.1]} />
          <meshStandardMaterial color="#FF8C1A" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CatStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.66, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.14, size * 1.04, 0]} castShadow>
          <coneGeometry args={[size * 0.07, size * 0.13, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.08, size * 0.84, size * 0.18]}>
          <sphereGeometry args={[size * 0.04, 8, 6]} />
          <meshStandardMaterial color="#1a6a1a" roughness={0.1} emissive="#00aa00" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Raised paw */}
      <mesh position={[size * 0.2, size * 0.6, 0]} rotation={[0, 0, Math.PI * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.28, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, size * 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.32, size * 0.06, 20]} />
        <meshStandardMaterial color="#c0a060" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

export function FishTank({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Stand */}
      <mesh position={[0, size * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.9, size * 0.18, size * 0.5]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.7} />
      </mesh>
      {/* Tank glass */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.6, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.35} side={2} />
      </mesh>
      {/* Water */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.5, size * 0.4]} />
        <meshStandardMaterial color="#4c97ff" roughness={0.1} transparent opacity={0.4} />
      </mesh>
      {/* Fish 1 */}
      <mesh position={[-size * 0.12, size * 0.52, 0]}>
        <sphereGeometry args={[size * 0.07, 10, 8]} />
        <meshStandardMaterial color="#ff5464" roughness={0.4} />
      </mesh>
      {/* Fish 2 */}
      <mesh position={[size * 0.14, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.055, 10, 8]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} />
      </mesh>
      {/* Gravel */}
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.08, size * 0.4]} />
        <meshStandardMaterial color="#c8b89a" roughness={1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 0.84, size * 0.04, size * 0.46]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function Table({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Top */}
      <mesh position={[0, size * 0.76, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.6, -0.32], [-0.6, 0.32], [0.6, -0.32], [0.6, 0.32]].map(([x = 0, z = 0], i) => (
        <mesh key={i} position={[x * size, size * 0.38, z * size]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.76, size * 0.08]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Cross supports */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 1.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Bookshelf({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const BOOK_COLORS = ['#ff5464', '#6B5CE7', '#48c774', '#FFD43C', '#4c97ff', '#FF9454']
  return (
    <group position={pos}>
      {/* Frame */}
      <mesh position={[-size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.58, 0]} castShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Shelves */}
      {[0.54, 1.06].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]}>
          <boxGeometry args={[size * 0.94, size * 0.05, size * 0.38]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Books on shelves */}
      {[0.2, 0.72, 1.24].map((shelfY, si) =>
        BOOK_COLORS.slice(0, 5).map((c, bi) => (
          <mesh key={`${si}-${bi}`} position={[(bi - 2) * size * 0.17, shelfY * size, 0]} castShadow>
            <boxGeometry args={[size * 0.12, size * 0.24, size * 0.32]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function FloorLamp({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.1, 16]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.4, 8]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[size * 0.12, size * 1.44, 0]} rotation={[0, 0, -Math.PI * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.28, 6]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Shade */}
      <mesh position={[size * 0.18, size * 1.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.14, size * 0.28, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} side={2} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[size * 0.18, size * 1.34, 0]}>
        <sphereGeometry args={[size * 0.06, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function Airplane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.12, size * 1.6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <coneGeometry args={[size * 0.12, size * 0.3, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Main wings */}
      <mesh position={[size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, size * 0.3, -size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.4, size * 0.28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh position={[size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Windows strip */}
      <mesh position={[size * 0.14, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.6, size * 0.08]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} metalness={0.1} emissive="#88d4ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

export function Boat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.35, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Hull bottom taper (dark) */}
      <mesh position={[0, -size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.25, size * 1.3]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, size * 0.4, size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.4, size * 0.6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, size * 0.9, size * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 1.2, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Sail */}
      <mesh position={[size * 0.15, size * 1.15, size * 0.15]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.7, size * 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} side={2} />
      </mesh>
      {/* Porthole windows */}
      <mesh position={[size * 0.36, size * 0.4, size * 0.2]}>
        <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.04, 12]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} emissive="#88d4ff" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

export function Train({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main body */}
      <mesh position={[0, size * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[0, size * 0.72, size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.18, size * 0.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Boiler */}
      <mesh position={[0, size * 0.4, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Smokestack */}
      <mesh position={[0, size * 0.84, -size * 0.42]} castShadow>
        <cylinderGeometry args={[size * 0.09, size * 0.07, size * 0.25, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[0, size * 0.15, -size * 0.76]} castShadow>
        <boxGeometry args={[size * 0.72, size * 0.1, size * 0.08]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Wheels (4) */}
      {([-size * 0.35, size * 0.35] as number[]).flatMap((xOff, xi) =>
        ([-size * 0.38, size * 0.38] as number[]).map((zOff, zi) => (
          <mesh key={`w${xi}${zi}`} position={[xOff, size * 0.07, zOff]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 14]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* Headlamp */}
      <mesh position={[0, size * 0.5, -size * 0.72]}>
        <sphereGeometry args={[size * 0.08, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function Swing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.82, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Chains left */}
      <mesh position={[-size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Chains right */}
      <mesh position={[size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.06, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Slide({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Platform */}
      <mesh position={[0, size * 1.1, -size * 0.35]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.7]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
      {/* Left support post */}
      <mesh position={[-size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Right support post */}
      <mesh position={[size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Ladder rungs */}
      {[0.2, 0.5, 0.8].map((h) => (
        <mesh key={h} position={[0, size * h, -size * 0.35]} castShadow>
          <boxGeometry args={[size * 0.6, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.5} />
        </mesh>
      ))}
      {/* Slide surface */}
      <mesh position={[0, size * 0.55, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Side rails */}
      <mesh position={[-size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

export function Seesaw({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base triangle */}
      <mesh position={[0, size * 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.18, size * 0.28, 4]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Pivot pin */}
      <mesh position={[0, size * 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Board (slightly tilted) */}
      <mesh position={[0, size * 0.42, 0]} rotation={[0, 0, Math.PI * 0.06]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.07, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Left handle */}
      <mesh position={[-size * 0.68, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right handle */}
      <mesh position={[size * 0.68, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Left seat */}
      <mesh position={[-size * 0.68, size * 0.48, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#ff5464" roughness={0.5} />
      </mesh>
      {/* Right seat */}
      <mesh position={[size * 0.68, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#48c774" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function Planet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4 })
  return (
    <group ref={ref} position={pos}>
      {/* Main sphere */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.55, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ring 1 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.78, size * 0.06, 6, 32]} />
        <meshStandardMaterial color="#c0a060" roughness={0.8} transparent opacity={0.75} />
      </mesh>
      {/* Ring 2 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.95, size * 0.04, 6, 32]} />
        <meshStandardMaterial color="#a08848" roughness={0.8} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

export function Asteroid({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main irregular chunk */}
      <mesh castShadow rotation={[0.4, 0.7, 0.2]}>
        <dodecahedronGeometry args={[size * 0.45, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 1 */}
      <mesh position={[size * 0.3, size * 0.2, 0]} castShadow rotation={[1, 0.5, 0]}>
        <dodecahedronGeometry args={[size * 0.18, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 2 */}
      <mesh position={[-size * 0.25, -size * 0.15, size * 0.1]} castShadow rotation={[0.2, 1.2, 0.8]}>
        <dodecahedronGeometry args={[size * 0.12, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  )
}

export function SpaceStation({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3 })
  return (
    <group ref={ref} position={pos}>
      {/* Central hub */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Horizontal arm */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 1.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Solar panel left */}
      <mesh position={[-size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Solar panel right */}
      <mesh position={[size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Top module */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.18, size * 0.24]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function BookStack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const COLORS = [color, '#FF5464', '#4c97ff', '#48c774']
  const heights = [size * 0.14, size * 0.12, size * 0.16, size * 0.11]
  let y = 0
  return (
    <group position={pos}>
      {heights.map((h, i) => {
        const cy = y + h / 2
        y += h
        const tilt = (i % 2 === 0) ? 0 : Math.PI * 0.04
        return (
          <mesh key={i} position={[0, cy, 0]} rotation={[0, tilt, 0]} castShadow>
            <boxGeometry args={[size * 0.7, h, size * 0.5]} />
            <meshStandardMaterial color={COLORS[i]!} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Globe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.5 })
  return (
    <group position={pos}>
      {/* Stand base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.3, size * 0.08, 12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.44, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </mesh>
      {/* Sphere globe */}
      <group ref={ref} position={[0, size * 0.56, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.3, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Equator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.32, size * 0.018, 6, 24]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function Microscope({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.08, size * 0.38]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Arm / column */}
      <mesh position={[-size * 0.1, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Horizontal arm */}
      <mesh position={[-size * 0.1, size * 0.78, -size * 0.08]} castShadow rotation={[Math.PI / 2.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[-size * 0.1, size * 0.9, -size * 0.04]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.07, size * 0.16, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Stage / slide platform */}
      <mesh position={[-size * 0.1, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.22]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function Sword({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.12]}>
      {/* Blade */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.9, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Blade tip (cone) */}
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <coneGeometry args={[size * 0.04, size * 0.14, 4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Guard (crossguard) */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.07, size * 0.07]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Grip */}
      <mesh position={[0, -size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.38, 8]} />
        <meshStandardMaterial color="#5a3010" roughness={0.7} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -size * 0.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.08, 10, 10]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function Shield({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0.2, 0.3, 0]}>
      {/* Shield body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.65, size * 0.8, size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Emblem cross horizontal */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Emblem cross vertical */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Metal rim */}
      <mesh position={[0, 0, -size * 0.04]}>
        <boxGeometry args={[size * 0.7, size * 0.85, size * 0.04]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} wireframe />
      </mesh>
    </group>
  )
}

export function KnightStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Plinth */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.1, size * 0.55]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Torso / armour */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.4, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Helmet head */}
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Visor slit */}
      <mesh position={[0, size * 0.9, size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Sword arm */}
      <mesh position={[size * 0.28, size * 0.66, 0]} castShadow rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function Coral({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Main branches */}
      {[[-0.1, 0.35, 0.08, -0.2], [0.12, 0.42, -0.06, 0.25], [0, 0.48, 0, 0]].map(([x = 0, y = 0, z = 0, rot = 0], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} rotation={[0, 0, rot]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.07, size * (0.4 + i * 0.05), 6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* Tips */}
      {[[-0.1, 0.6, 0.08], [0.12, 0.7, -0.06], [0, 0.75, 0]].map(([x = 0, y = 0, z = 0], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

export function Submarine({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, Math.PI * 0.15, 0]}>
      {/* Main hull */}
      <mesh castShadow>
        <capsuleGeometry args={[size * 0.18, size * 0.7, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Conning tower */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.22, size * 0.14]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Periscope */}
      <mesh position={[size * 0.04, size * 0.44, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.2, 6]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Propeller */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-size * 0.38, size * 0.04, side * size * 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.02, size * 0.04, 3]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function Anchor({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Ring at top */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.025, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Shank (vertical bar) */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.68, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stock (horizontal bar near top) */}
      <mesh position={[0, size * 0.52, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.38, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Left fluke */}
      <mesh position={[-size * 0.22, size * 0.04, 0]} castShadow rotation={[0, 0, Math.PI * 0.3]}>
        <coneGeometry args={[size * 0.08, size * 0.25, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right fluke */}
      <mesh position={[size * 0.22, size * 0.04, 0]} castShadow rotation={[0, 0, -Math.PI * 0.3]}>
        <coneGeometry args={[size * 0.08, size * 0.25, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

export function Igloo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Snow base ring */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.52, size * 0.52, size * 0.06, 16]} />
        <meshStandardMaterial color="#e0f0ff" roughness={0.9} />
      </mesh>
      {/* Main dome */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Entrance tunnel */}
      <mesh position={[size * 0.44, size * 0.12, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Entrance opening (dark) */}
      <mesh position={[size * 0.56, size * 0.12, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.04, 8]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Sled({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0.3, 0]}>
      {/* Seat board */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.07, size * 0.34]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Back rail */}
      <mesh position={[0, size * 0.38, -size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.26, size * 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Left runner */}
      <mesh position={[-size * 0.28, size * 0.07, 0]} castShadow rotation={[0, 0, 0.12]}>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.72]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Right runner */}
      <mesh position={[size * 0.28, size * 0.07, 0]} castShadow rotation={[0, 0, -0.12]}>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.72]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Cross struts */}
      {[-0.18, 0.18].map((z, i) => (
        <mesh key={i} position={[0, size * 0.14, size * z]} castShadow>
          <boxGeometry args={[size * 0.62, size * 0.05, size * 0.05]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function SnowflakeDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.6 })
  return (
    <group ref={ref} position={pos}>
      {/* 3 arms crossing at center (6-fold symmetry = 3 pairs) */}
      {[0, 60, 120].map((deg) => (
        <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]} castShadow>
          <boxGeometry args={[size * 1.1, size * 0.08, size * 0.06]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* 6 branch tips per arm = 12 small branches */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return [0.28, -0.28].map((side) => (
          <mesh
            key={`${deg}-${side}`}
            position={[Math.cos(rad) * size * 0.32, Math.sin(rad) * size * 0.32, 0]}
            rotation={[0, 0, rad + Math.PI / 4 * Math.sign(side)]}
            castShadow
          >
            <boxGeometry args={[size * 0.22, size * 0.05, size * 0.04]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>
        ))
      })}
      {/* Center gem */}
      <mesh castShadow>
        <octahedronGeometry args={[size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

export function CircusTent({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const STRIPE = '#ffffff'
  return (
    <group position={pos}>
      {/* Ground ring */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.62, size * 0.65, size * 0.06, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Main cone body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <coneGeometry args={[size * 0.62, size * 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Stripe panels (3 alternating) */}
      {[0, 2, 4].map((i) => (
        <mesh key={i} position={[0, size * 0.38, 0]} rotation={[0, (i * Math.PI) / 3, 0]} castShadow>
          <coneGeometry args={[size * 0.63, size * 0.71, 3]} />
          <meshStandardMaterial color={STRIPE} roughness={0.6} transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Top spire */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <coneGeometry args={[size * 0.07, size * 0.28, 8]} />
        <meshStandardMaterial color="#ffd644" roughness={0.4} />
      </mesh>
      {/* Flag */}
      <mesh position={[0, size * 1.0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.09, size * 0.01]} />
        <meshStandardMaterial color="#ff5464" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function FerrisWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.35 })
  return (
    <group position={pos}>
      {/* Support legs */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.25, size * 0.36, 0]} rotation={[0, 0, side * 0.35]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.74, 6]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* Axle */}
      <mesh position={[0, size * 0.72, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.14, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Rotating wheel */}
      <group ref={ref} position={[0, size * 0.72, 0]}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[size * 0.48, size * 0.04, 8, 24]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[size * 0.18, size * 0.03, 6, 20]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Spokes (6) */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]} castShadow>
            <boxGeometry args={[size * 0.96, size * 0.03, size * 0.03]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        ))}
        {/* 6 gondola cars */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return (
            <mesh key={deg} position={[Math.cos(rad) * size * 0.48, Math.sin(rad) * size * 0.48, 0]} castShadow>
              <boxGeometry args={[size * 0.1, size * 0.1, size * 0.08]} />
              <meshStandardMaterial color="#FFD43C" roughness={0.5} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function HotAirBalloon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.7) * size * 0.08 })
  return (
    <group ref={ref} position={pos}>
      {/* Balloon envelope */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.48, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Vertical color stripes */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <mesh key={deg} position={[0, size * 0.55, 0]} rotation={[0, (deg * Math.PI) / 180, 0]} castShadow>
          <sphereGeometry args={[size * 0.49, 3, 16, 0, 0.628, 0, Math.PI]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Ropes */}
      {[[-0.14, 0.14], [0.14, 0.14], [-0.14, -0.14], [0.14, -0.14]].map(([rx = 0, rz = 0], i) => (
        <mesh key={i} position={[size * rx, size * 0.16, size * rz]} castShadow>
          <cylinderGeometry args={[size * 0.008, size * 0.008, size * 0.42, 4]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
      ))}
      {/* Basket */}
      <mesh position={[0, size * -0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.16, size * 0.28]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Pinwheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 2.5 })
  return (
    <group position={pos}>
      {/* Stick */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Spinning blades */}
      <group ref={ref} position={[0, size * 0.5, 0]}>
        {[0, 90, 180, 270].map((deg, i) => (
          <mesh key={deg} position={[
            Math.cos((deg * Math.PI) / 180) * size * 0.14,
            Math.sin((deg * Math.PI) / 180) * size * 0.14,
            0
          ]} rotation={[0, 0, (deg * Math.PI) / 180 + Math.PI / 4]} castShadow>
            <boxGeometry args={[size * 0.28, size * 0.14, size * 0.03]} />
            <meshStandardMaterial color={i % 2 === 0 ? color : '#ffffff'} roughness={0.5} />
          </mesh>
        ))}
        {/* Center bolt */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.05, 6]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export function Lantern({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Top cap */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.2, size * 0.08, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* Top hook */}
      <mesh position={[0, size * 0.68, 0]} castShadow>
        <torusGeometry args={[size * 0.05, size * 0.015, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#8b2020" roughness={0.4} />
      </mesh>
      {/* Main lantern body */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.48, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.85} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, size * 0.36, 0]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.46, 8]} />
        <meshStandardMaterial color="#ffeeaa" roughness={1} emissive="#ffeeaa" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      {/* Tassel at bottom */}
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[size * x * 0.06, size * 0.06, 0]} castShadow>
          <cylinderGeometry args={[size * 0.01, size * 0.005, size * 0.14, 4]} />
          <meshStandardMaterial color="#8b2020" roughness={0.6} />
        </mesh>
      ))}
      {/* Bottom cap */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.14, size * 0.07, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
    </group>
  )
}
