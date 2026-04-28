import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 19: Robot Factory + Underwater City ────────────────────────────────
interface P19 { pos: [number,number,number]; color: string; size: number }

export function AssemblyArm({ pos, color, size }: P19) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.6
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.1, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.18, size*0.2, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={ref} position={[0, size*0.22, 0]}>
        <mesh position={[0, size*0.25, 0]} castShadow>
          <cylinderGeometry args={[size*0.07, size*0.08, size*0.5, 7]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, size*0.52, 0]} castShadow>
          <sphereGeometry args={[size*0.1, 7,5]} />
          <meshStandardMaterial color="#444444" metalness={0.7} />
        </mesh>
        <mesh position={[size*0.2, size*0.65, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.06, size*0.35, 6]} />
          <meshStandardMaterial color={color} metalness={0.6} />
        </mesh>
        {[-0.06, 0.06].map((x,i) => (
          <mesh key={i} position={[size*0.36, size*0.82, x*size]} rotation={[0, 0, 0.5]} castShadow>
            <boxGeometry args={[size*0.06, size*0.18, size*0.04]} />
            <meshStandardMaterial color="#555555" metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function FactoryConveyorBelt({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*1.4, size*0.14, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.4} />
      </mesh>
      {[-0.6,-0.3,0,0.3,0.6].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.19, 0]}>
          <boxGeometry args={[size*0.08, size*0.06, size*0.42]} />
          <meshStandardMaterial color="#444444" roughness={0.6} />
        </mesh>
      ))}
      {[-0.62, 0.62].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.12, 0]} castShadow>
          <cylinderGeometry args={[size*0.14, size*0.14, size*0.4, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.6} />
        </mesh>
      ))}
      {[-0.4, 0, 0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.26, 0]} castShadow>
          <boxGeometry args={[size*0.2, size*0.14, size*0.18]} />
          <meshStandardMaterial color={['#ff4444','#ffdd00','#4488ff'][i]!} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function RobotDrone({ pos, color, size }: P19) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 2) * size * 0.12
      ref.current.rotation.y = clock.getElapsedTime() * 0.5
    }
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.18, size*0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {[[-0.3,0.6,-0.3],[0.3,0.6,-0.3],[-0.3,0.6,0.3],[0.3,0.6,0.3]].map((p,i) => (
        <group key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <mesh castShadow>
            <cylinderGeometry args={[size*0.06, size*0.06, size*0.04, 6]} />
            <meshStandardMaterial color="#222222" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[size*0.12, size*0.02, 4, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size*0.52, 0]} castShadow>
        <sphereGeometry args={[size*0.1, 7,5]} />
        <meshStandardMaterial color="#44aaff" emissive="#2288cc" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export function GearColumn({ pos, color, size }: P19) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.6
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.1, size*1.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={ref}>
        {[0.2, 0.55, 0.9].map((y,i) => (
          <mesh key={i} position={[0, y*size, 0]}>
            <cylinderGeometry args={[size*(0.35-i*0.05), size*(0.35-i*0.05), size*0.08, 8]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {[0.2, 0.55, 0.9].map((y,i) => (
          [0,1,2,3,4,5,6,7].map(j => (
            <mesh key={`${i}_${j}`} position={[Math.cos(j*Math.PI/4)*size*(0.38-i*0.05), y*size, Math.sin(j*Math.PI/4)*size*(0.38-i*0.05)]}>
              <boxGeometry args={[size*0.06, size*0.08, size*0.04]} />
              <meshStandardMaterial color="#555555" metalness={0.5} />
            </mesh>
          ))
        ))}
      </group>
    </group>
  )
}

export function SparkWelder({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      const spark = Math.sin(t * 12) > 0.6
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = spark ? 1.0 : 0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.7, size*0.4]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-size*0.05, size*0.75, size*0.12]} rotation={[0.4, 0, 0.2]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.055, size*0.55, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.7} />
      </mesh>
      <mesh ref={ref} position={[-size*0.15, size*1.02, size*0.28]}>
        <sphereGeometry args={[size*0.07, 5,4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[-size*(0.12+i*0.05), size*(1.02-i*0.04), size*(0.28+i*0.05)]} castShadow>
          <sphereGeometry args={[size*(0.04-i*0.006), 4,3]} />
          <meshStandardMaterial color="#ffdd44" emissive="#ffaa00" emissiveIntensity={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CircuitPanel({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <boxGeometry args={[size*0.8, size*1.1, size*0.1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.72, size*0.06]}>
        <boxGeometry args={[size*0.55, size*0.55, size*0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.2} />
      </mesh>
      {[[-0.22,0.38],[0,0.38],[0.22,0.38],[-0.22,0.55],[0,0.55],[0.22,0.55]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, size*0.07]}>
          <sphereGeometry args={[size*0.05, 5,4]} />
          <meshStandardMaterial color={i%3===0 ? '#ff4444' : i%3===1 ? '#44ff44' : '#ffdd00'} emissive={i%3===0 ? '#ff2222' : i%3===1 ? '#22ff22' : '#ffcc00'} emissiveIntensity={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*0.14, 0]}>
        <boxGeometry args={[size*0.16, size*0.28, size*0.1]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function PowerCore({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.8) * 0.4
      ref.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })
  return (
    <group position={pos}>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.32, size*0.45, Math.sin(i*Math.PI/3)*size*0.32]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.06, size*0.9, 6]} />
          <meshStandardMaterial color="#333344" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.45, 0]} castShadow>
        <octahedronGeometry args={[size*0.28, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.2} />
      </mesh>
      {[0.15, 0.45, 0.75].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.36, size*0.025, 5, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SensorTower({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 1.2
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.14, size*1.1, 8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={ref} position={[0, size*1.18, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.08, size*0.08]} />
        <meshStandardMaterial color="#888888" metalness={0.7} />
      </mesh>
      {[-0.28, 0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*1.18, 0]}>
          <sphereGeometry args={[size*0.07, 6,5]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*1.28, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.22, 5]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.6} />
      </mesh>
    </group>
  )
}

export function CargoClaw({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.8, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.5, size*0.35]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.52, 0]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.05, size*0.12, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.7} />
      </mesh>
      {[[-0.15,0.42,0],[0.15,0.42,0],[0,0.42,-0.12],[0,0.42,0.12]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} rotation={[p[2]!*3, 0, p[0]!*3]} castShadow>
          <boxGeometry args={[size*0.06, size*0.3, size*0.05]} />
          <meshStandardMaterial color={color} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function BotChassis({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.42, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.75, size*0.45]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.86, 0]} castShadow>
        <boxGeometry args={[size*0.4, size*0.35, size*0.35]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      {[[-0.12,0.88,0.12],[0.12,0.88,0.12]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <sphereGeometry args={[size*0.07, 6,5]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[-0.32, 0.32].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.42, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*0.6, size*0.18]} />
          <meshStandardMaterial color="#444455" metalness={0.6} />
        </mesh>
      ))}
      {[-0.22, 0, 0.22].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.06, 0]}>
          <cylinderGeometry args={[size*0.1, size*0.1, size*0.1, 7]} />
          <meshStandardMaterial color="#555555" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Underwater City ───────────────────────────────────────────────────────────

export function KelpTower({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.7) * 0.08
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size*0.65, 0]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.12, size*1.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[0.3, 0.6, 0.9, 1.1].map((y,i) => (
        <mesh key={i} position={[Math.sin(i*0.8)*size*0.18, y*size, Math.cos(i*0.8)*size*0.1]} rotation={[0.3, i*0.5, 0.2]} castShadow>
          <boxGeometry args={[size*0.25, size*0.04, size*0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function BubbleDome({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <sphereGeometry args={[size*0.55, 10, 6, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, size*0.4, 0]}>
        <sphereGeometry args={[size*0.56, 10, 6, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.05} transparent opacity={0.15} side={2} />
      </mesh>
      <mesh position={[0, size*0.04, 0]}>
        <cylinderGeometry args={[size*0.55, size*0.56, size*0.08, 10]} />
        <meshStandardMaterial color="#3366aa" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <boxGeometry args={[size*0.1, size*0.55, size*0.04]} />
        <meshStandardMaterial color="#556688" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function SeaArch({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.55, 0]} castShadow>
          <cylinderGeometry args={[size*0.16, size*0.2, size*1.1, 7]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, size*1.12, 0]} castShadow>
        <torusGeometry args={[size*0.52, size*0.15, 7, 14, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[[-0.4,0.3,0.12],[0.3,0.55,-0.1],[-0.2,0.85,0.08],[0.45,1.05,0.05]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} castShadow>
          <sphereGeometry args={[size*0.08, 5,4]} />
          <meshStandardMaterial color={['#ff8899','#ff6688','#ffaacc','#ff4477'][i]!} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function ClamThrone({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <sphereGeometry args={[size*0.5, 9,5, 0, Math.PI*2, Math.PI/3, Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.55, -size*0.15]} rotation={[-0.5, 0, 0]} castShadow>
        <sphereGeometry args={[size*0.5, 9,5, 0, Math.PI*2, Math.PI/3, Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 7,5]} />
        <meshStandardMaterial color="#f5ddee" roughness={0.2} metalness={0.2} />
      </mesh>
      {[-0.28, 0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.85, -size*0.08]} castShadow>
          <sphereGeometry args={[size*0.1, 5,4]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function WhirlpoolGate({ pos, color, size }: P19) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.8
  })
  return (
    <group position={pos}>
      {[-0.55, 0.55].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.65, 0]} castShadow>
          <cylinderGeometry args={[size*0.12, size*0.16, size*1.3, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size*1.32, 0]} castShadow>
        <boxGeometry args={[size*1.22, size*0.12, size*0.2]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <group ref={ref} position={[0, size*0.65, 0]}>
        {[0.12, 0.24, 0.36, 0.48].map((r,i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <torusGeometry args={[r*size, size*0.015, 4, 14]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function GlowingJellyfish({ pos, color, size }: P19) {
  const ref = useRef<THREE.Group>(null!)
  const matRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.3) * size * 0.15
    if (matRef.current) (matRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      <mesh ref={matRef} position={[0, size*0.55, 0]} castShadow>
        <sphereGeometry args={[size*0.35, 8, 5, 0, Math.PI*2, 0, Math.PI*0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.75} roughness={0.1} />
      </mesh>
      {[-0.2,-0.1,0,0.1,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.22-i%2*0.1), 0]} castShadow>
          <cylinderGeometry args={[size*0.018, size*0.01, size*(0.3+i%3*0.1), 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SunkenStatue({ pos, color, size }: P19) {
  return (
    <group position={pos} rotation={[0, 0.15, 0.08]}>
      <mesh position={[0, size*0.45, 0]} castShadow>
        <boxGeometry args={[size*0.42, size*0.9, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*1.0, 0]} castShadow>
        <sphereGeometry args={[size*0.24, 7,5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <cylinderGeometry args={[size*0.35, size*0.4, size*0.12, 8]} />
        <meshStandardMaterial color="#335522" roughness={0.7} />
      </mesh>
      {[-0.2,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.55, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.45, size*0.12]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {[[-0.15,0.82,0.16],[0.15,0.82,0.16]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <sphereGeometry args={[size*0.06, 5,4]} />
          <meshStandardMaterial color="#224422" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function TreasureChestSea({ pos, color, size }: P19) {
  return (
    <group position={pos} rotation={[0, 0.2, -0.08]}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.36, size*0.44]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, size*0.44, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.22, size*0.44]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.44, 0]}>
        <cylinderGeometry args={[size*0.24, size*0.24, size*0.44, 12, 1, false, -Math.PI/2, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh position={[size*0.33, size*0.28, 0]} castShadow>
        <boxGeometry args={[size*0.08, size*0.08, size*0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 6,4]} />
        <meshStandardMaterial color="#335522" roughness={0.8} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function AnglerfishLamp({ pos, color, size }: P19) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.8) * 0.45
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <sphereGeometry args={[size*0.3, 8,6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 7,5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[size*0.1, size*0.7, size*0.1]} castShadow>
        <cylinderGeometry args={[size*0.02, size*0.02, size*0.28, 4]} />
        <meshStandardMaterial color="#5a3010" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[size*0.18, size*0.82, size*0.2]} castShadow>
        <sphereGeometry args={[size*0.09, 6,5]} />
        <meshStandardMaterial color="#88ffcc" emissive="#44ffaa" emissiveIntensity={0.7} />
      </mesh>
      {[[-0.2,0.32,0.2],[0.2,0.28,-0.15],[-0.1,0.24,0.22],[0.15,0.22,0.1]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} rotation={[p[2]!*5, 0, p[0]!*4]}>
          <boxGeometry args={[size*0.1, size*0.02, size*0.04]} />
          <meshStandardMaterial color="#dddddd" roughness={0.3} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SubmarineDock({ pos, color, size }: P19) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.24, size*0.55]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.3, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.42, size*0.55]} />
          <meshStandardMaterial color="#334455" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.26, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.22, size*0.55, 8]} />
        <meshStandardMaterial color="#445566" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.35, 0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.42, 0]}>
          <torusGeometry args={[size*0.12, size*0.03, 5, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── BATCH 20: Sky Kingdom + Crystal Cave ─────────────────────────────────────
interface P20 { pos: [number,number,number]; color: string; size: number }

export function CloudCastle({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      {[[-0.4,0,0],[0.4,0,0],[0,0,0]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, size*(0.3+i*0.08), 0]} castShadow>
          <sphereGeometry args={[size*(0.32-i*0.02), 7,5]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.55, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      {[[-0.2,0.92,-0.1],[0.2,0.88,0.1],[0,1.02,0]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} castShadow>
          <cylinderGeometry args={[size*0.07, size*0.09, size*0.35, 7]} />
          <meshStandardMaterial color={color} roughness={0.25} />
        </mesh>
      ))}
      {[[-0.2,1.1,-0.1],[0.2,1.06,0.1],[0,1.22,0]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} castShadow>
          <coneGeometry args={[size*0.1, size*0.18, 7]} />
          <meshStandardMaterial color="#ffccee" roughness={0.3} />
        </mesh>
      ))}
      {[-0.5,0,0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.18, 0]}>
          <sphereGeometry args={[size*(0.22-i%2*0.05), 6,4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function RainbowBridge({ pos, color: _color, size }: P20) {
  return (
    <group position={pos}>
      {['#ff4444','#ff8800','#ffdd00','#44cc44','#4488ff','#8844ff'].map((c,i) => (
        <mesh key={i} position={[0, size*(0.42+i*0.05), 0]} castShadow>
          <torusGeometry args={[size*0.62, size*(0.06-i*0.005), 5, 16, Math.PI]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function SkyBalloon({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.8) * size * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.9, 0]} castShadow>
        <sphereGeometry args={[size*0.45, 9,7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[0, size*0.9, 0]} rotation={[0, i*Math.PI/3, 0]}>
          <boxGeometry args={[size*0.02, size*0.9, size*0.02]} />
          <meshStandardMaterial color={i%2===0 ? color : '#ffffff'} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.4, size*0.22, size*0.28]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.45, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.55, 5]} />
        <meshStandardMaterial color="#888888" metalness={0.4} />
      </mesh>
    </group>
  )
}

export function WindMillSky({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.7
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.2, size*1.1, 7]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*1.18, 0]}>
        <sphereGeometry args={[size*0.08, 6,5]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.5} />
      </mesh>
      <group ref={ref} position={[0, size*1.18, size*0.1]}>
        {[0,1,2,3].map(i => (
          <mesh key={i} rotation={[0, 0, i*Math.PI/2]} castShadow>
            <boxGeometry args={[size*0.06, size*0.55, size*0.04]} />
            <meshStandardMaterial color="#ddddff" roughness={0.3} />
          </mesh>
        ))}
      </group>
      {[-0.4,-0.2,0,0.2,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.12, 0]}>
          <sphereGeometry args={[size*0.12, 5,4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function FloatingIsland({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.6) * size * 0.1
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <cylinderGeometry args={[size*0.6, size*0.42, size*0.32, 9]} />
        <meshStandardMaterial color="#7a5520" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <cylinderGeometry args={[size*0.62, size*0.62, size*0.1, 9]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/3)*size*0.28, size*0.35, Math.sin(i*Math.PI*2/3)*size*0.28]} castShadow>
          <sphereGeometry args={[size*(0.16-i*0.02), 6,4]} />
          <meshStandardMaterial color="#3a8a20" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*0.36, size*0.2]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.45, 5]} />
        <meshStandardMaterial color="#6b3a10" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function SunDial({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.06, 0]} castShadow>
        <cylinderGeometry args={[size*0.45, size*0.5, size*0.12, 10]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.14, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.42, size*0.42, size*0.04, 10]} />
        <meshStandardMaterial color="#ddbb44" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.16, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
        <boxGeometry args={[size*0.38, size*0.06, size*0.04]} />
        <meshStandardMaterial color={color} metalness={0.7} />
      </mesh>
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/6)*size*0.36, size*0.15, Math.sin(i*Math.PI/6)*size*0.36]}>
          <boxGeometry args={[size*0.04, size*0.04, size*0.04]} />
          <meshStandardMaterial color={color} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CloudThrone({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      {[-0.45,0,0.45,-0.25,0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.25+i%2*0.1), 0]} castShadow>
          <sphereGeometry args={[size*(0.24-i%3*0.03), 6,4]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size*0.5, -size*0.4]} castShadow>
        <boxGeometry args={[size*0.7, size*0.7, size*0.12]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {[-0.28,0,0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.88, -size*0.38]}>
          <sphereGeometry args={[size*(0.12-i%2*0.02), 5,4]} />
          <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function SkyCrystal({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.4
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.1
    }
  })
  return (
    <group ref={ref} position={pos}>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.2, size*0.5, Math.sin(i*Math.PI/3)*size*0.2]} castShadow>
          <coneGeometry args={[size*0.09, size*0.65, 5]} />
          <meshStandardMaterial color={color} roughness={0.05} metalness={0.2} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, size*0.5, 0]} castShadow>
        <octahedronGeometry args={[size*0.25, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.05} metalness={0.3} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export function WindChime({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.85, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.22, size*0.06, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.18,-0.08,0.02,0.12,0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.5-i%2*0.1), 0]} castShadow>
          <cylinderGeometry args={[size*0.025, size*0.025, size*(0.3+i*0.04), 5]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export function StormEye({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 1.5
  })
  return (
    <group position={pos}>
      <group ref={ref}>
        {[0.2, 0.35, 0.5, 0.65].map((r,i) => (
          <mesh key={i} position={[0, size*0.5, 0]}>
            <torusGeometry args={[r*size, size*(0.04-i*0.005), 4, 16]} />
            <meshStandardMaterial color={i%2===0 ? color : '#aabbcc'} roughness={0.4} transparent opacity={0.8-i*0.1} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <sphereGeometry args={[size*0.1, 7,5]} />
        <meshStandardMaterial color="#223355" roughness={0.4} />
      </mesh>
    </group>
  )
}

// ── Crystal Cave ──────────────────────────────────────────────────────────────

export function Stalactite({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/2)*size*0.14, size*(0.5-i*0.08), Math.sin(i*Math.PI/2)*size*0.12]} rotation={[Math.PI, 0, Math.cos(i*Math.PI/2)*0.1]} castShadow>
          <coneGeometry args={[size*(0.1-i*0.015), size*(0.65-i*0.1), 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CrystalCluster({ pos, color, size }: P20) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const children = ref.current.children
      for (let i = 0; i < children.length; i++) {
        const mesh = children[i] as THREE.Mesh
        if (mesh.material) (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 1.5 + i) * 0.25
      }
    }
  })
  return (
    <group ref={ref} position={pos}>
      {[0,1,2,3,4,5,6].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/7)*size*0.2, size*(0.3+i%3*0.15), Math.sin(i*Math.PI*2/7)*size*0.18]} rotation={[(i%3-1)*0.2, i*0.4, 0]} castShadow>
          <coneGeometry args={[size*0.07, size*(0.45+i%3*0.1), 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.1} metalness={0.2} transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export function CavePool({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.04, 0]} castShadow>
        <cylinderGeometry args={[size*0.55, size*0.48, size*0.08, 9]} />
        <meshStandardMaterial color="#1a3a5a" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.46, size*0.46, size*0.04, 9]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {[-0.25, 0.18, -0.1].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.1, (i-1)*size*0.15]}>
          <sphereGeometry args={[size*0.04, 5,4]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

export function GlowWorm({ pos, color, size }: P20) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 2.2) * 0.35
  })
  return (
    <group position={pos}>
      {[0,1,2,3,4].map(i => (
        <mesh key={i} position={[Math.sin(i*0.6)*size*0.1, size*(0.06+i*0.08), Math.cos(i*0.4)*size*0.06]} castShadow>
          <sphereGeometry args={[size*(0.06-i*0.005), 5,4]} />
          <meshStandardMaterial color={i===0 ? color : '#334422'} roughness={0.6} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.4, 0]}>
        <sphereGeometry args={[size*0.08, 6,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function MineralVein({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <boxGeometry args={[size*0.12, size*0.55, size*0.8]} />
        <meshStandardMaterial color="#554433" roughness={0.9} />
      </mesh>
      {[[-0.05,0.15,-0.2],[-0.07,0.32,0.1],[-0.06,0.48,-0.15],[-0.04,0.22,0.28]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} rotation={[0.2, i*0.4, 0.1]} castShadow>
          <boxGeometry args={[size*0.14, size*0.08, size*0.18]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function CaveMushroom({ pos, color, size }: P20) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 1.8) * 0.2
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.12, size*0.44, 6]} />
        <meshStandardMaterial color="#ddccff" roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.52, 0]} castShadow>
        <sphereGeometry args={[size*0.32, 7,5, 0, Math.PI*2, 0, Math.PI*0.55]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {[0,1,2,3,4].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*size*0.2, size*0.48, Math.sin(i*Math.PI*2/5)*size*0.2]}>
          <sphereGeometry args={[size*0.05, 5,3]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function EchoStone({ pos, color, size }: P20) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.15
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.32, 0]} castShadow>
        <dodecahedronGeometry args={[size*0.42, 0]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.32, 0]}>
        <sphereGeometry args={[size*0.44, 8,6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} transparent opacity={0.2} roughness={0.1} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} position={[0, size*0.32, 0]}>
          <torusGeometry args={[size*(0.55+i*0.12), size*0.012, 4, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.3-i*0.08} />
        </mesh>
      ))}
    </group>
  )
}

export function UndergroundWaterfall({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, -size*0.1]} castShadow>
        <boxGeometry args={[size*0.45, size*1.1, size*0.1]} />
        <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.04, 0]}>
        <cylinderGeometry args={[size*0.32, size*0.4, size*0.08, 9]} />
        <meshStandardMaterial color={color} transparent opacity={0.75} roughness={0.2} />
      </mesh>
      {[-0.18,0,0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.08, size*0.12]}>
          <sphereGeometry args={[size*0.05, 5,4]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[-size*0.3, size*0.75, 0]} castShadow>
        <boxGeometry args={[size*0.2, size*0.42, size*0.16]} />
        <meshStandardMaterial color="#2a4a2a" roughness={0.9} />
      </mesh>
      <mesh position={[size*0.3, size*0.8, 0]} castShadow>
        <boxGeometry args={[size*0.2, size*0.55, size*0.16]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function GemGeode({ pos, color, size }: P20) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.25, 0]} rotation={[0.3, 0, 0.15]} castShadow>
        <sphereGeometry args={[size*0.38, 8,5, 0, Math.PI*2, 0, Math.PI*0.7]} />
        <meshStandardMaterial color="#554433" roughness={0.9} />
      </mesh>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.12, size*(0.22+i%2*0.12), Math.sin(i*Math.PI/3)*size*0.12]} rotation={[(i%3)*0.2, i*0.5, 0]} castShadow>
          <coneGeometry args={[size*0.07, size*(0.28+i%2*0.1), 5]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.2} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function LavaCrack({ pos, color, size }: P20) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.8) * 0.35
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.02, 0]} rotation={[-Math.PI/2, 0, 0.3]}>
        <boxGeometry args={[size*0.12, size*0.85, size*0.04]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.04, 0]} rotation={[-Math.PI/2, 0, 0.3]}>
        <boxGeometry args={[size*0.08, size*0.78, size*0.02]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      {[-0.3,-0.1,0.1,0.3].map((x,i) => (
        <mesh key={i} position={[x*size*0.4, size*0.05, i*size*0.15]}>
          <sphereGeometry args={[size*0.05, 5,4]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}
