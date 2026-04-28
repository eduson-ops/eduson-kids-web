import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 21: Dinosaur Park + Atlantis City ──────────────────────────────────
interface P21 { pos: [number,number,number]; color: string; size: number }

export function DinoSkeleton({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.35, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.3,-0.1,0.1,0.3].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.25, 0]} castShadow>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.5, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[size*0.55, size*0.65, 0]} castShadow>
        <boxGeometry args={[size*0.25, size*0.25, size*0.3]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-size*0.7, size*0.55, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.08, size*0.05]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TRexRoar({ pos, color, size }: P21) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.1
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.7, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*1.0, size*0.15]} castShadow>
        <boxGeometry args={[size*0.3, size*0.35, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.2, size*0.1, 0]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.08, size*0.6, 7]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.5, -size*0.35]} castShadow>
        <boxGeometry args={[size*0.12, size*0.1, size*0.7]} />
        <meshStandardMaterial color="#556633" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function DinoEggB21({ pos, color, size }: P21) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + size*0.3 + Math.sin(clock.getElapsedTime()*1.5)*size*0.03
  })
  return (
    <group position={pos}>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[size*0.35, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0.2,0.6,1.0,1.4,1.8].map((a,i) => (
        <mesh key={i} position={[Math.cos(a*2)*size*0.3, -size*0.05, Math.sin(a*2)*size*0.3]}>
          <sphereGeometry args={[size*0.06, 5, 5]} />
          <meshStandardMaterial color="#88aa44" />
        </mesh>
      ))}
      <mesh position={[0, -size*0.3, 0]}>
        <cylinderGeometry args={[size*0.4, size*0.3, size*0.08, 8]} />
        <meshStandardMaterial color="#aa8866" roughness={1} />
      </mesh>
    </group>
  )
}

export function StegosaurusSpike({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*1.0, size*0.5, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.4,-0.15,0.15,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.75, 0]} castShadow>
          <coneGeometry args={[size*0.1, size*0.4, 5]} />
          <meshStandardMaterial color="#dd4422" roughness={0.7} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.12, size*0.5, 7]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function VelociraptorNest({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.06, 0]}>
        <torusGeometry args={[size*0.45, size*0.15, 6, 16]} />
        <meshStandardMaterial color="#886644" roughness={1} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.25, size*0.18, Math.sin(i*1.26)*size*0.25]} castShadow>
          <sphereGeometry args={[size*0.12, 7, 6]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function FernJurassic({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.08, size*0.4, 6]} />
        <meshStandardMaterial color="#665544" roughness={1} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.05)*size*0.3, size*0.5, Math.sin(i*1.05)*size*0.3]}
          rotation={[0.4, i*1.05, 0.3]}>
          <boxGeometry args={[size*0.04, size*0.45, size*0.15]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function DinoTrackB21({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      {[0,1,2].map((row) => [-0.25,0.25].map((x,i) => (
        <mesh key={`${row}-${i}`} position={[x*size, size*0.02, row*size*0.5-size*0.5]} receiveShadow>
          <boxGeometry args={[size*0.18, size*0.04, size*0.22]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      )))}
    </group>
  )
}

export function PterodactylPerch({ pos, color, size }: P21) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime()*1.2)*0.08
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.09, size*0.8, 7]} />
        <meshStandardMaterial color="#888877" roughness={0.9} />
      </mesh>
      <group ref={ref} position={[0, size*0.85, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size*0.2, size*0.18, size*0.35]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {[-1,1].map((s,i) => (
          <mesh key={i} position={[s*size*0.45, 0, 0]} rotation={[0, 0, s*0.3]}>
            <boxGeometry args={[size*0.55, size*0.06, size*0.28]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, size*0.08, size*0.22]} castShadow>
          <coneGeometry args={[size*0.06, size*0.25, 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export function VolcanoMudPit({ pos, color, size }: P21) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime()*2)*0.15
    }
  })
  return (
    <group position={pos}>
      <mesh receiveShadow>
        <cylinderGeometry args={[size*0.7, size*0.8, size*0.12, 12]} />
        <meshStandardMaterial color="#553322" roughness={1} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.55, size*0.6, size*0.06, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[Math.cos(i*2.1)*size*0.3, size*0.16, Math.sin(i*2.1)*size*0.3]}>
          <sphereGeometry args={[size*0.08, 6, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function DinoInfoSign({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      {[-0.25,0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.7, 6]} />
          <meshStandardMaterial color="#996633" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.75, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.4, size*0.06]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.75, size*0.04]}>
        <boxGeometry args={[size*0.6, size*0.3, size*0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── Atlantis City ─────────────────────────────────────────────────────────────
export function AtlantisTemple({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.15, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.3, size*1.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.4, size*0.9]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.85, 0]} castShadow>
        <coneGeometry args={[size*0.5, size*0.55, 8]} />
        <meshStandardMaterial color="#44ddcc" emissive="#44ddcc" emissiveIntensity={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function TridentMonument({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.09, size*1.2, 7]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.2,0,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*1.3, 0]} castShadow>
          <coneGeometry args={[size*0.05, size*0.3, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[-0.2*size, size*1.1, 0]} rotation={[0,0,0.52]}>
        <boxGeometry args={[size*0.04, size*0.2, size*0.04]} />
        <meshStandardMaterial color={color} metalness={0.6} />
      </mesh>
      <mesh position={[0.2*size, size*1.1, 0]} rotation={[0,0,-0.52]}>
        <boxGeometry args={[size*0.04, size*0.2, size*0.04]} />
        <meshStandardMaterial color={color} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function CoralPillar({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.18, size*1.0, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0.2,0.45,0.7,0.9].map((h,i) => (
        <mesh key={i} position={[Math.cos(i*1.8)*size*0.08, h*size, Math.sin(i*1.8)*size*0.08]}>
          <sphereGeometry args={[size*(0.08+i*0.02), 6, 5]} />
          <meshStandardMaterial color={i%2===0?"#ff6688":"#ffaa44"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SeahorseStatue({ pos, color, size }: P21) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.2
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.18, size*0.7, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[size*0.1, size*0.85, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[size*0.18, size*1.05, 0]} castShadow>
        <coneGeometry args={[size*0.06, size*0.25, 5]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {[0.55,0.65,0.75].map((h,i) => (
        <mesh key={i} position={[size*0.18, h*size, 0]} rotation={[0,0,-0.5]}>
          <boxGeometry args={[size*0.18, size*0.04, size*0.08]} />
          <meshStandardMaterial color="#44ddaa" metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function BubbleChamber({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.4, size*0.4, 10]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} metalness={0.3} roughness={0.2} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.15, size*(0.45+i*0.18), Math.sin(i*1.57)*size*0.15]}>
          <sphereGeometry args={[size*(0.05+i*0.02), 7, 7]} />
          <meshStandardMaterial color="#aaeeff" transparent opacity={0.7} emissive="#aaeeff" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function AtlantisGate({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.5, size*0.5, 0]} castShadow>
          <boxGeometry args={[size*0.18, size*1.0, size*0.22]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*1.08, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.22, size*0.22]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.95, 0]}>
        <torusGeometry args={[size*0.32, size*0.06, 8, 20]} />
        <meshStandardMaterial color="#44ddcc" emissive="#44ddcc" emissiveIntensity={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

export function OceanFloorRuin({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      {[[-0.4,0.2,0],[0,0.05,-0.3],[0.4,0.15,0.2]].map(([x = 0,h = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, h*size, z*size]} rotation={[0,i*0.6,i*0.2]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.13, size*(0.3+i*0.1), 7]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.04, 0]} receiveShadow>
        <boxGeometry args={[size*1.0, size*0.08, size*0.7]} />
        <meshStandardMaterial color="#556677" roughness={1} />
      </mesh>
    </group>
  )
}

export function AtlantisCrystalSpire({ pos, color, size }: P21) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime()*1.8)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.22, size*0.7, 6]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} metalness={0.2} roughness={0.1} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.85, 0]} castShadow>
        <coneGeometry args={[size*0.12, size*0.5, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.85} metalness={0.3} roughness={0.1} />
      </mesh>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[Math.cos(i*2.09)*size*0.2, size*0.5, Math.sin(i*2.09)*size*0.2]}>
          <coneGeometry args={[size*0.05, size*0.25, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function MermaidFountain({ pos, color, size }: P21) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.55, size*0.6, size*0.16, 12]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.6, 6]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <group ref={ref} position={[0, size*0.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size*0.18, size*0.3, size*0.12]} />
          <meshStandardMaterial color="#ffdebb" roughness={0.6} />
        </mesh>
        {[-1,1].map((s,i) => (
          <mesh key={i} position={[s*size*0.15, -size*0.1, 0]} rotation={[0,0,s*0.4]}>
            <coneGeometry args={[size*0.08, size*0.3, 6]} />
            <meshStandardMaterial color="#44ccaa" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function NeptuneIdol({ pos, color, size }: P21) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.24, size*0.5]} />
        <meshStandardMaterial color="#556677" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <boxGeometry args={[size*0.3, size*0.62, size*0.28]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.96, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[size*0.28, size*0.75, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.5, 6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── BATCH 22: Magic School + Jungle Temple ────────────────────────────────────
interface P22 { pos: [number,number,number]; color: string; size: number }

export function SpellCauldron({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime()*2.5)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <cylinderGeometry args={[size*0.4, size*0.3, size*0.4, 10]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.42, 0]}>
        <cylinderGeometry args={[size*0.38, size*0.38, size*0.06, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.2, size*0.5 + Math.sin(Date.now()*0.002+i)*size*0.03, Math.sin(i*1.57)*size*0.2]}>
          <sphereGeometry args={[size*0.05, 5, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[-0.35,0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]}>
          <boxGeometry args={[size*0.08, size*0.1, size*0.1]} />
          <meshStandardMaterial color="#333333" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function WizardDesk({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.08, size*0.55]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {[[-0.38,0],[0.38,0],[-0.38,0.45],[0.38,0.45]].map(([x = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.17, z*size-size*0.22]}>
          <boxGeometry args={[size*0.06, size*0.35, size*0.06]} />
          <meshStandardMaterial color="#5C3317" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[size*0.25, size*0.42, 0]} castShadow>
        <sphereGeometry args={[size*0.12, 7, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-size*0.2, size*0.42, 0]} castShadow>
        <boxGeometry args={[size*0.18, size*0.22, size*0.04]} />
        <meshStandardMaterial color="#ddccaa" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.42, size*0.15]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.035, size*0.28, 6]} />
        <meshStandardMaterial color="#664400" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function SpellBookStand({ pos, color, size }: P22) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime()*0.5)*0.15
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.1, size*0.44, 8]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.06, size*0.45]} />
        <meshStandardMaterial color="#886644" roughness={0.7} />
      </mesh>
      <group ref={ref} position={[0, size*0.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size*0.45, size*0.35, size*0.06]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {[-0.1,0.1].map((y,i) => (
          <mesh key={i} position={[0, y*size, size*0.04]}>
            <boxGeometry args={[size*0.35, size*0.04, size*0.02]} />
            <meshStandardMaterial color="#gold" emissive="#ffcc44" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function AstroLabTable({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <boxGeometry args={[size*0.8, size*0.06, size*0.55]} />
        <meshStandardMaterial color="#7a6040" roughness={0.7} />
      </mesh>
      {[[-0.35,-0.2],[0.35,-0.2],[-0.35,0.2],[0.35,0.2]].map(([x = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.14, z*size]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.28, 6]} />
          <meshStandardMaterial color="#5a4030" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.42, 0]}>
        <torusGeometry args={[size*0.25, size*0.03, 6, 18]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.42, 0]}>
        <torusGeometry args={[size*0.25, size*0.025, 6, 18]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.42, 0]} castShadow>
        <sphereGeometry args={[size*0.07, 7, 7]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

export function MagicMirrorSchool({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime()*1.3)*0.15
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.08, size*1.0, size*0.12]} />
        <meshStandardMaterial color="#886644" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.8, size*0.06]}>
        <boxGeometry args={[size*0.55, size*0.7, size*0.04]} />
        <meshStandardMaterial color="#cc8822" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.8, size*0.09]}>
        <boxGeometry args={[size*0.48, size*0.62, size*0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.7} metalness={0.8} roughness={0.1} />
      </mesh>
      {[[-0.22,1.16],[0.22,1.16],[-0.22,0.44],[0.22,0.44]].map(([x = 0,y = 0],i) => (
        <mesh key={i} position={[x*size, y*size, size*0.1]}>
          <sphereGeometry args={[size*0.04, 5, 5]} />
          <meshStandardMaterial color="#cc8822" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function GraduationPodium({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[(i-1)*size*0.35, size*(0.1+i*0.08), 0]} castShadow>
          <boxGeometry args={[size*0.32, size*(0.2+i*0.16), size*0.45]} />
          <meshStandardMaterial color={i===1?color:"#ccaa66"} roughness={0.5} />
        </mesh>
      ))}
      {[[-0.35,0.2],[0,0.37],[0.35,0.2]].map(([x = 0,h = 0],i) => (
        <mesh key={i} position={[x*size, h*size, 0]}>
          <cylinderGeometry args={[size*0.06, size*0.06, size*0.06, 7]} />
          <meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={0.4} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function WandRack({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.06, size*0.18]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
      {[-0.28,-0.14,0,0.14,0.28].map((x,i) => (
        <group key={i}>
          <mesh position={[x*size, size*0.55, 0]} castShadow>
            <cylinderGeometry args={[size*0.025, size*0.02, size*0.44, 5]} />
            <meshStandardMaterial color={["#8B4513","#2d4a2d","#1a1a4a","#4a2d1a","#3a1a3a"][i]!} roughness={0.7} />
          </mesh>
          <mesh position={[x*size, size*0.78, 0]}>
            <sphereGeometry args={[size*0.04, 5, 5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function HourglassSchool({ pos, color, size }: P22) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.4
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.25, size*0.28, size*0.16, 8]} />
        <meshStandardMaterial color="#cc8822" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.45, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.24, size*0.35, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.1} metalness={0.2} />
      </mesh>
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.24, size*0.04, size*0.35, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.1} metalness={0.2} />
      </mesh>
      <mesh position={[0, size*0.92, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.25, size*0.16, 8]} />
        <meshStandardMaterial color="#cc8822" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function StarMap({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, -size*0.02]} castShadow>
        <boxGeometry args={[size*0.75, size*0.55, size*0.04]} />
        <meshStandardMaterial color="#0a0a2a" roughness={0.5} />
      </mesh>
      {[[-0.25,0.1],[0.15,0.18],[-0.1,-0.12],[0.28,-0.05],[0,0.06],[-0.3,-0.08]].map(([x = 0,y = 0],i) => (
        <mesh key={i} position={[x*size, y*size+size*0.35, size*0.02]}>
          <sphereGeometry args={[size*(0.015+i*0.008), 4, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[-0.36,0.36].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.7, 6]} />
          <meshStandardMaterial color="#664422" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function MagicChalkboard({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.08 + Math.sin(clock.getElapsedTime()*0.8)*0.06
    }
  })
  return (
    <group position={pos}>
      {[-0.42,0.42].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.5, 0]}>
          <boxGeometry args={[size*0.06, size*1.0, size*0.1]} />
          <meshStandardMaterial color="#663300" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*0.08, size*1.0, size*0.06]} />
        <meshStandardMaterial color="#663300" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.5, size*0.06]}>
        <boxGeometry args={[size*0.78, size*0.88, size*0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.08} roughness={0.7} />
      </mesh>
      {[-0.22,0,0.22].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.5+(i-1)*size*0.12, size*0.08]}>
          <boxGeometry args={[size*0.28, size*0.02, size*0.01]} />
          <meshStandardMaterial color="#aaffaa" emissive="#aaffaa" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── Jungle Temple ─────────────────────────────────────────────────────────────
export function JunglePillar({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.22, size*1.0, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[0.15,0.4,0.65,0.85].map((h,i) => (
        <mesh key={i} position={[0, h*size, 0]}>
          <torusGeometry args={[size*0.21, size*0.03, 5, 12]} />
          <meshStandardMaterial color="#556633" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.02, 0]} castShadow>
        <boxGeometry args={[size*0.4, size*0.1, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function MossAltar({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.1, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.2, size*0.7]} />
        <meshStandardMaterial color="#445533" roughness={1} />
      </mesh>
      <mesh position={[0, size*0.25, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.1, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.35, 0]}>
        <sphereGeometry args={[size*0.14, 8, 8]} />
        <meshStandardMaterial color="#aaffaa" emissive="#44ff44" emissiveIntensity={0.3} transparent opacity={0.85} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.57)*size*0.25, size*0.3, Math.sin(i*1.57)*size*0.25]}>
          <coneGeometry args={[size*0.035, size*0.12, 5]} />
          <meshStandardMaterial color="#88bb44" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function VineGate({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.5, size*0.5, 0]} castShadow>
          <boxGeometry args={[size*0.16, size*1.0, size*0.2]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*1.04, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.2, size*0.2]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.4,-0.15,0.1,0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.6+i*0.08), size*0.1]}>
          <sphereGeometry args={[size*0.06, 5, 5]} />
          <meshStandardMaterial color="#336622" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function TempleIdol({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.25 + Math.sin(clock.getElapsedTime()*1.5)*0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.24, size*0.5]} />
        <meshStandardMaterial color="#445533" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <boxGeometry args={[size*0.32, size*0.6, size*0.28]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.96, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.25} metalness={0.4} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.2, size*0.7, size*0.14]} castShadow>
          <boxGeometry args={[size*0.12, size*0.12, size*0.04]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function GiantLeaf({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.07, size*0.36, 6]} />
        <meshStandardMaterial color="#664422" roughness={1} />
      </mesh>
      <mesh position={[size*0.08, size*0.5, 0]} rotation={[0, 0, 0.25]} castShadow>
        <boxGeometry args={[size*0.65, size*0.45, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size*0.25, size*0.52, 0]}>
        <boxGeometry args={[size*0.04, size*0.38, size*0.02]} />
        <meshStandardMaterial color="#44aa22" roughness={0.5} />
      </mesh>
      {[-0.08,0.08].map((x,i) => (
        <mesh key={i} position={[x*size+size*0.18, size*0.5, 0]}>
          <boxGeometry args={[size*0.02, size*0.28, size*0.01]} />
          <meshStandardMaterial color="#55bb33" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function TempleFireBrazier({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.scale.y = 1 + Math.sin(clock.getElapsedTime()*5)*0.15
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime()*4)*0.3
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.06, size*0.44, 7]} />
        <meshStandardMaterial color="#664422" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.2, size*0.12, size*0.2, 8]} />
        <meshStandardMaterial color="#333222" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.68, 0]}>
        <coneGeometry args={[size*0.13, size*0.3, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export function SerpentCarving({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.18, size*0.6, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[0.1,0.3,0.5].map((h,i) => (
        <mesh key={i} position={[size*(i%2===0?0.12:-0.12), h*size, size*0.12]}>
          <sphereGeometry args={[size*0.07, 6, 5]} />
          <meshStandardMaterial color="#446633" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*0.65, size*0.1]} castShadow>
        <sphereGeometry args={[size*0.11, 7, 7]} />
        <meshStandardMaterial color="#336622" roughness={0.7} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.07, size*0.72, size*0.14]}>
          <boxGeometry args={[size*0.04, size*0.02, size*0.06]} />
          <meshStandardMaterial color="#ff2200" />
        </mesh>
      ))}
    </group>
  )
}

export function HiddenTrapDoor({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.02, 0]} receiveShadow>
        <boxGeometry args={[size*0.8, size*0.04, size*0.65]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <boxGeometry args={[size*0.72, size*0.02, size*0.57]} />
        <meshStandardMaterial color="#2a2a2a" roughness={1} />
      </mesh>
      {[[-0.28,-0.2],[0.28,-0.2],[-0.28,0.2],[0.28,0.2]].map(([x = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.05, z*size]}>
          <sphereGeometry args={[size*0.035, 5, 5]} />
          <meshStandardMaterial color="#886644" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function AncientGong({ pos, color, size }: P22) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime()*0.35)*0.12
  })
  return (
    <group position={pos}>
      {[-0.38,0.38].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.45, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.9, 7]} />
          <meshStandardMaterial color="#664422" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.9, 0]}>
        <boxGeometry args={[size*0.82, size*0.07, size*0.07]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.5, 0]} castShadow>
        <torusGeometry args={[size*0.3, size*0.04, 8, 24]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.04, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function JungleShrine({ pos, color, size }: P22) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.4, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[[-0.25,0,0],[0.25,0,0]].map(([x = 0,_y = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.6, z*size]} castShadow>
          <cylinderGeometry args={[size*0.07, size*0.09, size*0.6, 7]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, size*0.46, 0]} castShadow>
        <boxGeometry args={[size*0.72, size*0.1, size*0.62]} />
        <meshStandardMaterial color="#446633" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.56, 0]}>
        <sphereGeometry args={[size*0.1, 7, 7]} />
        <meshStandardMaterial color="#aaff44" emissive="#44ff22" emissiveIntensity={0.4} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}
