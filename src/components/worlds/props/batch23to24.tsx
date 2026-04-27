import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 23: Ice Palace + Lava Forge ────────────────────────────────────────
interface P23 { pos: [number,number,number]; color: string; size: number }

export function IcePalaceTower({ pos, color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime()*0.8)*0.08
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.25, size*0.32, size*0.8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} metalness={0.3} roughness={0.1} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.9, 0]} castShadow>
        <coneGeometry args={[size*0.28, size*0.5, 8]} />
        <meshStandardMaterial color="#88eeff" emissive="#88eeff" emissiveIntensity={0.1} transparent opacity={0.9} metalness={0.3} roughness={0.1} />
      </mesh>
      {[0.2,0.5,0.75].map((h,i) => (
        <mesh key={i} position={[0, h*size, 0]}>
          <torusGeometry args={[size*0.28, size*0.025, 5, 14]} />
          <meshStandardMaterial color="#ccffff" metalness={0.5} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function FrozenWaterfall({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      {[-0.15,0,0.15].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.4, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*0.8, size*0.08]} />
          <meshStandardMaterial color={color} transparent opacity={0.7+i*0.1} metalness={0.2} roughness={0.05} />
        </mesh>
      ))}
      <mesh position={[0, size*0.82, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.1, size*0.22]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      {[-0.18,0,0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]}>
          <coneGeometry args={[size*0.06, size*0.15, 5]} rotation={[Math.PI, 0, 0]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

export function IceStatue({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.22, size*0.4, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <boxGeometry args={[size*0.28, size*0.5, size*0.22]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      <mesh position={[0, size*0.96, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.85} metalness={0.3} roughness={0.08} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.24, size*0.65, 0]} rotation={[0,0,s*0.5]}>
          <boxGeometry args={[size*0.32, size*0.06, size*0.06]} />
          <meshStandardMaterial color={color} transparent opacity={0.75} metalness={0.2} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function IceBridge({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*1.4, size*0.12, size*0.5]} />
        <meshStandardMaterial color={color} transparent opacity={0.75} metalness={0.2} roughness={0.08} />
      </mesh>
      {[-0.55,0.55].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.32, 0]} castShadow>
          <boxGeometry args={[size*0.1, size*0.4, size*0.5]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.2} roughness={0.1} />
        </mesh>
      ))}
      {[-0.4,-0.2,0,0.2,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.5, 0]}>
          <boxGeometry args={[size*0.06, size*0.5, size*0.06]} />
          <meshStandardMaterial color={color} transparent opacity={0.65} metalness={0.2} roughness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, size*0.75, 0]}>
        <boxGeometry args={[size*1.0, size*0.06, size*0.06]} />
        <meshStandardMaterial color={color} transparent opacity={0.7} metalness={0.2} roughness={0.1} />
      </mesh>
    </group>
  )
}

export function SnowDrift({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.1, 0]} receiveShadow>
        <sphereGeometry args={[size*0.5, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[size*0.3, size*0.06, size*0.15]} receiveShadow>
        <sphereGeometry args={[size*0.35, 7, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-size*0.25, size*0.05, -size*0.1]} receiveShadow>
        <sphereGeometry args={[size*0.3, 7, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function IceCrystalPillar({ pos, color, size }: P23) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.2
  })
  return (
    <group position={pos} ref={ref}>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.12, size*(0.3+i*0.12), Math.sin(i*1.57)*size*0.12]}
          rotation={[0, i*0.4, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.09, size*(0.4+i*0.1), 6]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.3} roughness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, size*0.9, 0]} castShadow>
        <sphereGeometry args={[size*0.14, 8, 8]} />
        <meshStandardMaterial color="#eeffff" emissive="#aaddff" emissiveIntensity={0.3} transparent opacity={0.9} metalness={0.4} roughness={0.05} />
      </mesh>
    </group>
  )
}

export function IceBlizzardShield({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[0, size*0.4, 0]} rotation={[0, i*1.05, 0]}>
          <torusGeometry args={[size*(0.3+i*0.08), size*0.03, 5, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.5+i*0.1} metalness={0.3} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, size*0.4, 0]}>
        <sphereGeometry args={[size*0.12, 7, 7]} />
        <meshStandardMaterial color="#aaeeff" emissive="#aaeeff" emissiveIntensity={0.4} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, size*0.1, 0]}>
        <cylinderGeometry args={[size*0.05, size*0.05, size*0.2, 6]} />
        <meshStandardMaterial color="#778899" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function IceThroneChair({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.4, size*0.55]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      <mesh position={[0, size*0.65, -size*0.24]} castShadow>
        <boxGeometry args={[size*0.6, size*0.7, size*0.1]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.28, size*0.42, 0]}>
          <boxGeometry args={[size*0.08, size*0.45, size*0.5]} />
          <meshStandardMaterial color={color} transparent opacity={0.75} metalness={0.2} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, size*1.04, -size*0.24]}>
        <coneGeometry args={[size*0.18, size*0.3, 6]} />
        <meshStandardMaterial color="#aaddff" emissive="#aaddff" emissiveIntensity={0.2} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export function PolarBearStatue({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <sphereGeometry args={[size*0.3, 9, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.58, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.18, size*0.25, size*0.1]} castShadow>
          <sphereGeometry args={[size*0.1, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.78, size*0.16]} castShadow>
        <sphereGeometry args={[size*0.07, 6, 5]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.1, size*0.62, size*0.18]}>
          <sphereGeometry args={[size*0.035, 5, 5]} />
          <meshStandardMaterial color="#111111" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function IceLantern({ pos, color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime()*1.8)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.44, 6]} />
        <meshStandardMaterial color="#aabbcc" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.24, size*0.3, size*0.24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.7} metalness={0.2} roughness={0.05} />
      </mesh>
      <mesh position={[0, size*0.68, 0]}>
        <coneGeometry args={[size*0.14, size*0.14, 6]} />
        <meshStandardMaterial color="#aabbcc" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── Lava Forge ────────────────────────────────────────────────────────────────
export function ForgeAnvil({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.24, size*0.3]} />
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.3, size*0.04]} castShadow>
        <boxGeometry args={[size*0.6, size*0.12, size*0.25]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[size*0.22, size*0.36, size*0.04]} castShadow>
        <boxGeometry args={[size*0.18, size*0.12, size*0.2]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function LavaForge({ pos, color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime()*3)*0.25
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*0.8, size*0.44, size*0.6]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.48, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.3, size*0.08, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.12, size*0.12, size*0.5, 8]} />
        <meshStandardMaterial color="#444333" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.86, 0]}>
        <sphereGeometry args={[size*0.16, 7, 7]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function MoltenHammer({ pos, color, size }: P23) {
  return (
    <group position={pos} rotation={[0, 0, 0.4]}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.04, size*0.7, 7]} />
        <meshStandardMaterial color="#664422" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.75, 0]} castShadow>
        <boxGeometry args={[size*0.25, size*0.22, size*0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function LavaTubePipe({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.14, size*0.8, 8]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.82, size*0.14]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.28, 8]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.82, size*0.27]}>
        <sphereGeometry args={[size*0.08, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
      {[0.2,0.5,0.75].map((h,i) => (
        <mesh key={i} position={[0, h*size, 0]}>
          <torusGeometry args={[size*0.14, size*0.025, 5, 12]} />
          <meshStandardMaterial color="#cc7700" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function ForgeChest({ pos, color, size }: P23) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.16, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.32, size*0.45]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.08, size*0.45]} />
        <meshStandardMaterial color="#cc7700" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.22,0.22].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.2, size*0.23]}>
          <boxGeometry args={[size*0.08, size*0.14, size*0.02]} />
          <meshStandardMaterial color="#cc7700" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size*0.22, size*0.23]}>
        <boxGeometry args={[size*0.12, size*0.1, size*0.02]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} metalness={0.9} />
      </mesh>
    </group>
  )
}

export function SmithBellows({ pos, color: _color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.y = 1 + Math.sin(clock.getElapsedTime()*2)*0.12
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.04, size*0.4, 6]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.3, size*0.28, size*0.18]} />
        <meshStandardMaterial color="#882200" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.68, size*0.09]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.18, 6]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function LavaRune({ pos, color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime()*1.5)*0.35
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.06, 0]} receiveShadow>
        <cylinderGeometry args={[size*0.35, size*0.38, size*0.12, 6]} />
        <meshStandardMaterial color="#333222" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.14, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.3, size*0.04, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.18, size*0.16, Math.sin(i*1.047)*size*0.18]}>
          <boxGeometry args={[size*0.04, size*0.04, size*0.06]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function ForgeGolem({ pos, color, size }: P23) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime()*0.4)*0.2
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.44, size*0.36]} />
        <meshStandardMaterial color="#333222" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 8]} />
        <meshStandardMaterial color="#333222" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.38, size*0.44, 0]} castShadow>
          <boxGeometry args={[size*0.18, size*0.34, size*0.18]} />
          <meshStandardMaterial color="#333222" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.14, size*0.04, 0]} castShadow>
          <cylinderGeometry args={[size*0.08, size*0.1, size*0.28, 7]} />
          <meshStandardMaterial color="#333222" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.08, size*0.62, size*0.2]}>
          <sphereGeometry args={[size*0.055, 5, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function MoltenCrucible({ pos, color, size }: P23) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.35 + Math.sin(clock.getElapsedTime()*2.2)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.24, 0]} castShadow>
        <cylinderGeometry args={[size*0.32, size*0.22, size*0.48, 10]} />
        <meshStandardMaterial color="#222211" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.3, size*0.04, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.2} />
      </mesh>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[Math.cos(i*2.09)*size*0.18, size*0.54, Math.sin(i*2.09)*size*0.18]}>
          <sphereGeometry args={[size*0.06, 5, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {[-0.22,0.22].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.24, 0]}>
          <boxGeometry args={[size*0.08, size*0.04, size*0.36]} />
          <meshStandardMaterial color="#cc7700" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function EmberSpark({ pos, color, size }: P23) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        c.position.y = pos[1] + size*(0.1+i*0.15) + Math.abs(Math.sin(clock.getElapsedTime()*3+i))*size*0.25
        c.scale.setScalar(1 - Math.abs(Math.sin(clock.getElapsedTime()*3+i))*0.5)
      })
    }
  })
  return (
    <group position={pos} ref={ref}>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.12, size*(0.1+i*0.15), Math.sin(i*1.26)*size*0.12]}>
          <sphereGeometry args={[size*(0.04+i*0.01), 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.05, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.22, size*0.1, 8]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── BATCH 24: Mushroom Kingdom + Space Outpost ────────────────────────────────
interface P24 { pos: [number,number,number]; color: string; size: number }

export function GiantMushroomB24({ pos, color, size }: P24) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime()*0.7)*0.08
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.18, size*0.7, 8]} />
        <meshStandardMaterial color="#eeeecc" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.82, 0]} castShadow>
        <sphereGeometry args={[size*0.52, 10, 9]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} roughness={0.6} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.28, size*0.88, Math.sin(i*1.047)*size*0.28]}>
          <sphereGeometry args={[size*0.07, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function MushroomHouseB24({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.56, 10]} />
        <meshStandardMaterial color="#eeeecc" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <sphereGeometry args={[size*0.42, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.22, size*0.72, Math.sin(i*1.26)*size*0.22]}>
          <sphereGeometry args={[size*0.07, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.18, size*0.3]} castShadow>
        <boxGeometry args={[size*0.18, size*0.28, size*0.06]} />
        <meshStandardMaterial color="#664422" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function SporeCloud({ pos, color, size }: P24) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        c.position.y = pos[1] + size*(0.2+i*0.1) + Math.sin(clock.getElapsedTime()*1.2+i*0.7)*size*0.08
      })
    }
  })
  return (
    <group position={pos} ref={ref}>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.2, size*(0.2+i*0.1), Math.sin(i*1.047)*size*0.2]}>
          <sphereGeometry args={[size*(0.06+i*0.01), 5, 5]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function GlowingMushroomRing({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      {[0,1,2,3,4,5,6,7].map((i) => {
        const a = (i/8)*Math.PI*2
        const r = size*0.5
        return (
          <group key={i} position={[Math.cos(a)*r, 0, Math.sin(a)*r]}>
            <mesh position={[0, size*0.14, 0]} castShadow>
              <cylinderGeometry args={[size*0.04, size*0.05, size*0.28, 6]} />
              <meshStandardMaterial color="#ccddaa" roughness={0.8} />
            </mesh>
            <mesh position={[0, size*0.32, 0]} castShadow>
              <sphereGeometry args={[size*0.09, 6, 5]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function MushroomBridge({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      {[-0.4,0,0.4].map((x,i) => (
        <group key={i}>
          <mesh position={[x*size, size*0.18, -size*0.4]} castShadow>
            <cylinderGeometry args={[size*0.06, size*0.08, size*0.36, 7]} />
            <meshStandardMaterial color="#887755" roughness={0.9} />
          </mesh>
          <mesh position={[x*size, size*0.38, -size*0.4]} castShadow>
            <sphereGeometry args={[size*0.18, 7, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[x*size, size*0.18, size*0.4]} castShadow>
            <cylinderGeometry args={[size*0.06, size*0.08, size*0.36, 7]} />
            <meshStandardMaterial color="#887755" roughness={0.9} />
          </mesh>
          <mesh position={[x*size, size*0.38, size*0.4]} castShadow>
            <sphereGeometry args={[size*0.18, 7, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*0.88, size*0.08, size*0.8]} />
        <meshStandardMaterial color="#ccbb88" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function MushroomToadstool({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.12, size*0.36, 7]} />
        <meshStandardMaterial color="#ddddbb" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.42, 0]} castShadow>
        <sphereGeometry args={[size*0.3, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.42, 0]}>
        <cylinderGeometry args={[size*0.32, size*0.28, size*0.06, 8]} />
        <meshStandardMaterial color="#ddddbb" roughness={0.7} />
      </mesh>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[Math.cos(i*2.09)*size*0.15, size*0.46, Math.sin(i*2.09)*size*0.15]}>
          <sphereGeometry args={[size*0.055, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function MushroomLamp({ pos, color, size }: P24) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime()*2)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.25, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.5, 6]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.56, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.12, 6]} />
        <meshStandardMaterial color="#886633" roughness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.68, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function MushroomFountainB24({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.45, size*0.5, size*0.16, 10]} />
        <meshStandardMaterial color="#887755" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.44, 7]} />
        <meshStandardMaterial color="#998866" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <sphereGeometry args={[size*0.26, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.22, size*0.55, Math.sin(i*1.57)*size*0.22]}>
          <sphereGeometry args={[size*0.055, 5, 5]} />
          <meshStandardMaterial color="#88eeaa" emissive="#44ff88" emissiveIntensity={0.4} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function MushroomGate({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      {[-1,1].map((s,i) => (
        <group key={i}>
          <mesh position={[s*size*0.42, size*0.22, 0]} castShadow>
            <cylinderGeometry args={[size*0.08, size*0.1, size*0.44, 7]} />
            <meshStandardMaterial color="#998866" roughness={0.8} />
          </mesh>
          <mesh position={[s*size*0.42, size*0.56, 0]} castShadow>
            <sphereGeometry args={[size*0.22, 8, 7]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size*0.7, 0]}>
        <boxGeometry args={[size*0.7, size*0.2, size*0.12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[-0.2,0,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.82, 0]}>
          <sphereGeometry args={[size*0.06, 5, 5]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function ToadKingThrone({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.36, size*0.55]} />
        <meshStandardMaterial color="#887755" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.6, -size*0.25]} castShadow>
        <boxGeometry args={[size*0.65, size*0.6, size*0.1]} />
        <meshStandardMaterial color="#776644" roughness={0.8} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.3, size*0.42, 0]}>
          <boxGeometry args={[size*0.08, size*0.46, size*0.5]} />
          <meshStandardMaterial color="#776644" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.94, -size*0.25]}>
        <sphereGeometry args={[size*0.18, 8, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ── Space Outpost ─────────────────────────────────────────────────────────────
export function SatelliteDishB24({ pos, color, size }: P24) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.15
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.09, size*0.6, 7]} />
        <meshStandardMaterial color="#556677" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.7, size*0.12]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[size*0.35, size*0.01, size*0.18, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.72, size*0.28]}>
        <sphereGeometry args={[size*0.05, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

export function HabitatModule({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.38, size*0.6, 10]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.38, size*0.3, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.55, size*0.55]} />
          <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.58, size*0.3, 0]}>
          <boxGeometry args={[size*0.26, size*0.45, size*0.04]} />
          <meshStandardMaterial color="#225577" metalness={0.3} roughness={0.2} />
        </mesh>
      ))}
      {[[-0.12,0.22],[0.12,0.22],[-0.12,-0.18],[0.12,-0.18]].map(([x,z],i) => (
        <mesh key={i} position={[x*size, size*0.62, z*size]}>
          <boxGeometry args={[size*0.1, size*0.06, size*0.1]} />
          <meshStandardMaterial color="#aabbcc" emissive="#aabbcc" emissiveIntensity={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SpaceAntenna({ pos, color, size }: P24) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = Math.abs(Math.sin(clock.getElapsedTime()*2))*0.8
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.7, 6]} />
        <meshStandardMaterial color="#778899" metalness={0.6} roughness={0.4} />
      </mesh>
      {[0.6,0.75,0.88].map((h,i) => (
        <mesh key={i} position={[0, h*size, 0]}>
          <torusGeometry args={[size*(0.1+i*0.04), size*0.015, 5, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.95, 0]}>
        <sphereGeometry args={[size*0.05, 5, 5]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

export function OutpostCryoPod({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.25, size*0.8, 10]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.42, size*0.2]}>
        <boxGeometry args={[size*0.35, size*0.7, size*0.08]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} metalness={0.2} roughness={0.1} />
      </mesh>
      {[-0.12,0.12].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]}>
          <cylinderGeometry args={[size*0.06, size*0.07, size*0.1, 8]} />
          <meshStandardMaterial color="#556677" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.82, 0]}>
        <cylinderGeometry args={[size*0.24, size*0.2, size*0.08, 10]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function AirbockDoor({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.42, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.84, size*0.12]} />
        <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.42, size*0.07]}>
        <boxGeometry args={[size*0.48, size*0.65, size*0.04]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      {[-0.3,0.3].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.42, size*0.1]}>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.65, 8]} />
          <meshStandardMaterial color="#667788" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[size*0.2, size*0.42, size*0.1]}>
        <sphereGeometry args={[size*0.04, 5, 5]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export function SpaceToolRack({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, -size*0.06]} castShadow>
        <boxGeometry args={[size*0.7, size*0.7, size*0.08]} />
        <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.4} />
      </mesh>
      {[-0.25,0,0.25].map((x,i) => (
        <group key={i}>
          <mesh position={[x*size, size*0.5, 0]} castShadow>
            <cylinderGeometry args={[size*0.03, size*0.025, size*0.45, 6]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[x*size, size*0.5, size*0.16]}>
            <boxGeometry args={[size*0.12, size*0.1, size*0.04]} />
            <meshStandardMaterial color="#aabbcc" emissive="#aabbcc" emissiveIntensity={0.2} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function MeteorFragment({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      {[[-0.1,0.06,-0.08],[0.08,0.14,0.06],[-0.05,0.22,0.1],[0.12,0.05,0.15],[-0.08,0.18,-0.06]].map(([x,y,z],i) => (
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[i*0.8, i*0.5, i*0.3]} castShadow>
          <dodecahedronGeometry args={[size*(0.08+i*0.025)]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function OutpostBeacon({ pos, color, size }: P24) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*1.5
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.16, size*0.44, 8]} />
        <meshStandardMaterial color="#445566" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.28, size*0.18, size*0.28]} />
        <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.68, 0]}>
        <coneGeometry args={[size*0.08, size*0.22, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.25, size*0.52, Math.sin(i*1.57)*size*0.25]}>
          <boxGeometry args={[size*0.14, size*0.06, size*0.02]} />
          <meshStandardMaterial color="#225577" metalness={0.3} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function SpaceTurret({ pos, color, size }: P24) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.14, 0]} castShadow>
        <cylinderGeometry args={[size*0.2, size*0.24, size*0.28, 8]} />
        <meshStandardMaterial color="#445566" metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={ref} position={[0, size*0.32, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[size*0.18, 8, 7]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, size*0.24]} castShadow>
          <cylinderGeometry args={[size*0.04, size*0.035, size*0.48, 6]} rotation={[Math.PI/2, 0, 0]} />
          <meshStandardMaterial color="#334455" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, size*0.08, size*0.14]}>
          <sphereGeometry args={[size*0.04, 5, 5]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

export function HullBreachPatch({ pos, color, size }: P24) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size*0.38, size*0.42, size*0.08, 10]} />
        <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.1, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.32, size*0.04, 10]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.28, size*0.07, Math.sin(i*1.047)*size*0.28]}>
          <boxGeometry args={[size*0.06, size*0.06, size*0.06]} />
          <meshStandardMaterial color="#aabbcc" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size*0.12, 0]}>
        <sphereGeometry args={[size*0.08, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
    </group>
  )
}
