import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 25: Toy Workshop + Garden Party ─────────────────────────────────────
interface P25 { pos: [number,number,number]; color: string; size: number }

export function ToyTrainB25({ pos, color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.3
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.3, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.18, size*0.38, 0]} castShadow>
        <boxGeometry args={[size*0.28, size*0.22, size*0.38]} />
        <meshStandardMaterial color="#cc2222" roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.18, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.07, size*0.07, size*0.2, 7]} />
        <meshStandardMaterial color="#333333" roughness={0.4} />
      </mesh>
      {[-0.28,-0.08,0.12,0.28].map((z,i) => [-0.25,0.25].map((x,j) => (
        <mesh key={`${i}-${j}`} position={[x*size, size*0.1, z*size]}>
          <cylinderGeometry args={[size*0.09, size*0.09, size*0.06, 8]} />
          <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
        </mesh>
      )))}
    </group>
  )
}

export function BuildingBlockTower({ pos, color, size }: P25) {
  const colors = [color, "#ff4444", "#ffcc00", "#44cc44", "#4488ff", "#ff44aa"]
  return (
    <group position={pos}>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[(i%2===0?0:size*0.05), size*(0.12+i*0.22), (i%2===0?size*0.05:0)]} castShadow>
          <boxGeometry args={[size*(0.32-i*0.02), size*0.2, size*(0.32-i*0.02)]} />
          <meshStandardMaterial color={colors[i]!} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function WindUpRobot({ pos, color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime()*1.5)*0.4
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*0.4, size*0.44, size*0.32]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.58, 0]} castShadow>
        <boxGeometry args={[size*0.32, size*0.3, size*0.26]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.22, size*0.58, size*0.14]}>
          <sphereGeometry args={[size*0.055, 5, 5]} />
          <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.26, size*0.28, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*0.34, size*0.14]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.14, size*0.06, 0]} castShadow>
          <boxGeometry args={[size*0.1, size*0.18, size*0.12]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[size*0.22, size*0.7, 0]} rotation={[0, 0, 1.5]}>
        <cylinderGeometry args={[size*0.035, size*0.035, size*0.22, 5]} />
        <meshStandardMaterial color="#cc4422" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function TeddyBearB25({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <sphereGeometry args={[size*0.3, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.68, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.28, size*0.38, 0]} castShadow>
          <sphereGeometry args={[size*0.12, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.12, size*0.74, size*0.17]}>
          <sphereGeometry args={[size*0.04, 5, 5]} />
          <meshStandardMaterial color="#111111" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*0.68, size*0.19]}>
        <sphereGeometry args={[size*0.04, 5, 5]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.08, size*0.82, 0]}>
          <sphereGeometry args={[size*0.07, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function KaleidoscopeTower({ pos, color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.5
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.18, size*0.8, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.22, size*(0.12+i*0.16), Math.sin(i*1.26)*size*0.22]}>
          <sphereGeometry args={[size*0.08, 6, 5]} />
          <meshStandardMaterial color={["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa"][i]!}
            emissive={["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa"][i]!} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function SnowGlobe({ pos, color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.25
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.1, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.2, 10]} />
        <meshStandardMaterial color="#cc8822" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.45, 0]}>
        <sphereGeometry args={[size*0.35, 10, 9]} />
        <meshStandardMaterial color="#aaeeff" transparent opacity={0.5} metalness={0.2} roughness={0.05} />
      </mesh>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.15, size*0.25, size*0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.18, size*0.25, Math.sin(i*1.047)*size*0.18]}>
          <sphereGeometry args={[size*0.02, 4, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function ToyChestB25({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.36, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.38, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.1, size*0.5]} />
        <meshStandardMaterial color="#cc8822" metalness={0.4} roughness={0.4} />
      </mesh>
      {[-0.25,0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.22, size*0.26]}>
          <boxGeometry args={[size*0.1, size*0.2, size*0.02]} />
          <meshStandardMaterial color="#cc8822" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[size*0.04, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.2, size*0.18, size*0.16]} />
        <meshStandardMaterial color="#ff4444" roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.18, size*0.52, size*0.1]} castShadow>
        <sphereGeometry args={[size*0.1, 6, 5]} />
        <meshStandardMaterial color="#4488ff" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function MusicBoxB25({ pos, color, size }: P25) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.8
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.16, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.32, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.08, size*0.45]} />
        <meshStandardMaterial color="#cc8822" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.52, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.22, 6]} />
        <meshStandardMaterial color="#ffccaa" roughness={0.5} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.1, size*0.64, Math.sin(i*1.047)*size*0.1]}>
          <boxGeometry args={[size*0.02, size*0.08, size*0.02]} />
          <meshStandardMaterial color="#cc8822" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function PuppetStage({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      {[-0.4,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.45, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*0.9, size*0.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*0.94, 0]} castShadow>
        <boxGeometry args={[size*0.94, size*0.14, size*0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.94, 0]}>
        <boxGeometry args={[size*0.8, size*0.06, size*0.06]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.42, -size*0.04]}>
        <boxGeometry args={[size*0.68, size*0.7, size*0.08]} />
        <meshStandardMaterial color="#cc4422" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.12, 0]}>
        <boxGeometry args={[size*0.94, size*0.08, size*0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function MarbleMachine({ pos, color: _color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.children.forEach((c, i) => {
        c.position.y = pos[1] + size*0.5 + Math.sin(t*2+i*1.5)*size*0.25
      })
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.36, size*0.45]} />
        <meshStandardMaterial color="#886644" roughness={0.6} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[(i-1.5)*size*0.15, size*0.5, 0]}>
          <sphereGeometry args={[size*0.07, 7, 6]} />
          <meshStandardMaterial color={["#ff4444","#4488ff","#44cc44","#ffcc00"][i]!}
            emissive={["#ff4444","#4488ff","#44cc44","#ffcc00"][i]!} emissiveIntensity={0.3} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ── Garden Party ──────────────────────────────────────────────────────────────
export function GardenPavilion({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      {[[-0.4,-0.3],[0.4,-0.3],[-0.4,0.3],[0.4,0.3]].map(([x = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.5, z*size]} castShadow>
          <cylinderGeometry args={[size*0.07, size*0.08, size*1.0, 7]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.02, 0]} castShadow>
        <boxGeometry args={[size*1.0, size*0.08, size*0.72]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*1.1, 0]}>
        <boxGeometry args={[size*0.9, size*0.04, size*0.62]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function RoseArbor({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.35, size*0.5, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.06, size*1.0, 6]} />
          <meshStandardMaterial color="#5C3317" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.02, 0]} castShadow>
        <boxGeometry args={[size*0.76, size*0.08, size*0.16]} />
        <meshStandardMaterial color="#5C3317" roughness={0.8} />
      </mesh>
      {[-0.25,-0.08,0.08,0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.6+i*0.1), size*0.04]}>
          <sphereGeometry args={[size*0.08, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {[-0.2,0,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.85+i*0.06), 0]}>
          <sphereGeometry args={[size*0.07, 5, 5]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function GardenBench({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      {[[-0.3,-0.18],[0.3,-0.18],[-0.3,0.18],[0.3,0.18]].map(([x = 0,z = 0],i) => (
        <mesh key={i} position={[x*size, size*0.2, z*size]}>
          <boxGeometry args={[size*0.06, size*0.4, size*0.06]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.4, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.06, size*0.38]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {[-0.22,0,0.22].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.44, 0]}>
          <boxGeometry args={[size*0.04, size*0.02, size*0.36]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function FlowerArrangement({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.1, 0]} castShadow>
        <cylinderGeometry args={[size*0.15, size*0.18, size*0.2, 8]} />
        <meshStandardMaterial color="#cc8844" roughness={0.6} />
      </mesh>
      {[0,1,2,3,4,5,6].map((i) => {
        const a = (i/7)*Math.PI*2
        const r = size*0.1
        return (
          <group key={i} position={[Math.cos(a)*r, 0, Math.sin(a)*r]}>
            <mesh position={[0, size*0.28, 0]} castShadow>
              <cylinderGeometry args={[size*0.02, size*0.02, size*0.38, 5]} />
              <meshStandardMaterial color="#336622" roughness={0.7} />
            </mesh>
            <mesh position={[0, size*0.52, 0]} castShadow>
              <sphereGeometry args={[size*0.07, 6, 5]} />
              <meshStandardMaterial color={i%3===0?color:i%3===1?"#ffcc44":"#ff4466"} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function PartyBalloons({ pos, color: _color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime()*1.2)*size*0.06
  })
  return (
    <group position={pos} ref={ref}>
      {[0,1,2,3,4].map((i) => {
        const a = (i/5)*Math.PI*2
        const c = ["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa"][i]!
        return (
          <group key={i} position={[Math.cos(a)*size*0.22, size*0.6, Math.sin(a)*size*0.22]}>
            <mesh castShadow>
              <sphereGeometry args={[size*0.12, 7, 6]} />
              <meshStandardMaterial color={c} roughness={0.3} />
            </mesh>
            <mesh position={[0, -size*0.14, 0]}>
              <cylinderGeometry args={[size*0.01, size*0.01, size*0.5, 4]} />
              <meshStandardMaterial color={c} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, size*0.1, 0]}>
        <sphereGeometry args={[size*0.04, 5, 5]} />
        <meshStandardMaterial color="#336622" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function CakeTower({ pos, color, size }: P25) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <cylinderGeometry args={[size*0.38, size*0.4, size*0.24, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.34, 0]} castShadow>
        <cylinderGeometry args={[size*0.3, size*0.32, size*0.2, 10]} />
        <meshStandardMaterial color="#ff99bb" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.52, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.24, size*0.2, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.68, 0]}>
        <sphereGeometry args={[size*0.1, 7, 6]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.047)*size*0.3, size*0.26, Math.sin(i*1.047)*size*0.3]}>
          <cylinderGeometry args={[size*0.015, size*0.015, size*0.22, 5]} />
          <meshStandardMaterial color={["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa","#cc44ff"][i]!}
            emissive={["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa","#cc44ff"][i]!} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function GardenSunflower({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.45, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.06, size*0.9, 6]} />
        <meshStandardMaterial color="#336622" roughness={0.7} />
      </mesh>
      {[0,1,2,3,4,5,6,7].map((i) => (
        <mesh key={i} position={[Math.cos(i*0.785)*size*0.25, size*0.92, Math.sin(i*0.785)*size*0.25]}
          rotation={[0, i*0.785, 0.5]}>
          <boxGeometry args={[size*0.22, size*0.08, size*0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, size*0.92, 0]} castShadow>
        <cylinderGeometry args={[size*0.14, size*0.14, size*0.06, 10]} />
        <meshStandardMaterial color="#553311" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function GardenWindmill({ pos, color, size }: P25) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime()*0.8
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.4, 0]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.1, size*0.8, 8]} />
        <meshStandardMaterial color="#886644" roughness={0.7} />
      </mesh>
      <group ref={ref} position={[0, size*0.82, size*0.07]}>
        {[0,1,2,3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i/4)*Math.PI*2]}>
            <boxGeometry args={[size*0.05, size*0.38, size*0.04]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[size*0.04, 5, 5]} />
          <meshStandardMaterial color="#cc8822" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

export function GardenBirdBath({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.12, size*0.44, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.46, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.3, size*0.1, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.52, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.32, size*0.08, 10]} />
        <meshStandardMaterial color="#4488cc" transparent opacity={0.7} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function PicnicBlanket({ pos, color, size }: P25) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.01, 0]} receiveShadow>
        <boxGeometry args={[size*1.1, size*0.02, size*0.9]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.35,0.35].map((x,i) => [-0.3,0.3].map((z,j) => (
        <mesh key={`${i}-${j}`} position={[x*size, size*0.06, z*size]}>
          <cylinderGeometry args={[size*0.07, size*0.08, size*0.08, 8]} />
          <meshStandardMaterial color="#cc8844" roughness={0.6} />
        </mesh>
      )))}
      <mesh position={[size*0.18, size*0.1, -size*0.12]} castShadow>
        <sphereGeometry args={[size*0.1, 7, 6]} />
        <meshStandardMaterial color="#ff6644" roughness={0.4} />
      </mesh>
      <mesh position={[-size*0.15, size*0.09, size*0.1]} castShadow>
        <boxGeometry args={[size*0.14, size*0.12, size*0.18]} />
        <meshStandardMaterial color="#88ccff" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ── BATCH 26: Circus Spectacular + Viking Age ─────────────────────────────────
interface P26 { pos: [number,number,number]; color: string; size: number }

export function AcrobatTrapeze({ pos, color, size }: P26) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime()*1.4)*0.35
  })
  return (
    <group position={pos}>
      {[-0.35,0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.55, 0]} castShadow>
          <cylinderGeometry args={[size*0.03, size*0.03, size*1.1, 6]} />
          <meshStandardMaterial color="#886644" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*1.12, 0]}>
        <boxGeometry args={[size*0.76, size*0.05, size*0.1]} />
        <meshStandardMaterial color="#886644" roughness={0.7} />
      </mesh>
      <group ref={ref} position={[0, size*0.55, 0]}>
        {[-0.2,0.2].map((x,i) => (
          <mesh key={i} position={[x*size, -size*0.25, 0]}>
            <cylinderGeometry args={[size*0.015, size*0.015, size*0.5, 5]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, -size*0.52, 0]}>
          <boxGeometry args={[size*0.44, size*0.05, size*0.06]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

export function CircusElephant({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 9, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.75, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.68, size*0.28]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.05, size*0.45, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.22, size*0.82, 0]}>
          <boxGeometry args={[size*0.18, size*0.04, size*0.12]} />
          <meshStandardMaterial color="#eeeecc" roughness={0.7} />
        </mesh>
      ))}
      {[-0.18,-0.06,0.06,0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]} castShadow>
          <cylinderGeometry args={[size*0.07, size*0.08, size*0.4, 7]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function JugglingBalls({ pos, color: _color, size }: P26) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        const a = t*2 + i*1.047
        c.position.x = pos[0] + Math.cos(a)*size*0.22
        c.position.y = pos[1] + size*0.5 + Math.abs(Math.sin(a))*size*0.3
        c.position.z = pos[2] + Math.sin(a)*size*0.1
      })
    }
  })
  return (
    <group position={pos} ref={ref}>
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[0, size*0.5, 0]}>
          <sphereGeometry args={[size*0.08, 7, 6]} />
          <meshStandardMaterial color={["#ff4444","#ffcc00","#44cc44","#4488ff","#ff44aa","#cc44ff"][i]!}
            roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function CircusBigTent({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <coneGeometry args={[size*0.65, size*1.1, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.15, 0]} castShadow>
        <cylinderGeometry args={[size*0.65, size*0.65, size*0.3, 10]} />
        <meshStandardMaterial color="#ffcc44" roughness={0.5} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.65, size*0.3, Math.sin(i*1.26)*size*0.65]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.4, 6]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*1.12, 0]}>
        <coneGeometry args={[size*0.06, size*0.2, 5]} />
        <meshStandardMaterial color="#ffcc44" roughness={0.4} />
      </mesh>
    </group>
  )
}

export function TightropeWire({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      {[-0.5,0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.44, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.06, size*0.88, 7]} />
          <meshStandardMaterial color="#886644" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.9, 0]}>
        <boxGeometry args={[size*1.05, size*0.02, size*0.02]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.95, 0]} castShadow>
        <boxGeometry args={[size*0.08, size*0.22, size*0.06]} />
        <meshStandardMaterial color="#ffccaa" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function ClownCar({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.24, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.3, size*0.42]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[size*0.12, size*0.45, 0]} castShadow>
        <boxGeometry args={[size*0.38, size*0.28, size*0.4]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[-0.22,0.22].map((x,i) => [-0.18,0.18].map((z,j) => (
        <mesh key={`${i}-${j}`} position={[x*size, size*0.12, z*size]}>
          <cylinderGeometry args={[size*0.1, size*0.1, size*0.08, 10]} />
          <meshStandardMaterial color="#ff2222" metalness={0.3} roughness={0.4} />
        </mesh>
      )))}
      <mesh position={[size*0.12, size*0.62, size*0.21]} castShadow>
        <sphereGeometry args={[size*0.1, 6, 5]} />
        <meshStandardMaterial color="#ff6644" roughness={0.3} />
      </mesh>
    </group>
  )
}

export function MagicHatCircus({ pos, color, size }: P26) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.4
  })
  return (
    <group position={pos} ref={ref}>
      <mesh position={[0, size*0.06, 0]}>
        <cylinderGeometry args={[size*0.32, size*0.35, size*0.12, 10]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.38, 0]} castShadow>
        <cylinderGeometry args={[size*0.2, size*0.22, size*0.52, 10]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      <mesh position={[0, size*0.12, 0]}>
        <torusGeometry args={[size*0.3, size*0.04, 5, 14]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.65, 0]}>
        <sphereGeometry args={[size*0.08, 6, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
      {[0,1,2].map((i) => (
        <mesh key={i} position={[Math.cos(i*2.09)*size*0.1, size*(0.7+i*0.12), Math.sin(i*2.09)*size*0.1]}>
          <sphereGeometry args={[size*0.04, 5, 5]} />
          <meshStandardMaterial color={["#ff4444","#ffcc00","#44cc44"][i]!}
            emissive={["#ff4444","#ffcc00","#44cc44"][i]!} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function RingOfFire({ pos, color, size }: P26) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime()*4)*0.3
    }
  })
  return (
    <group position={pos}>
      {[-0.4,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.44, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.06, size*0.88, 7]} />
          <meshStandardMaterial color="#444433" roughness={0.7} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.9, 0]}>
        <torusGeometry args={[size*0.32, size*0.04, 7, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function CircusPodium({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <cylinderGeometry args={[size*0.38, size*0.42, size*0.36, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*1.26)*size*0.42, size*0.18, Math.sin(i*1.26)*size*0.42]}>
          <boxGeometry args={[size*0.06, size*0.38, size*0.04]} />
          <meshStandardMaterial color="#ffcc44" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.38, 0]}>
        <cylinderGeometry args={[size*0.38, size*0.36, size*0.04, 10]} />
        <meshStandardMaterial color="#cc8822" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function LionTamerWhip({ pos, color, size }: P26) {
  return (
    <group position={pos} rotation={[0, 0, 0.3]}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.03, size*0.025, size*0.7, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {[0,1,2,3].map((i) => (
        <mesh key={i} position={[Math.cos(i*0.5)*size*0.1, size*(0.7+i*0.12), Math.sin(i*0.5)*size*0.08]}>
          <cylinderGeometry args={[size*(0.02-i*0.004), size*(0.02-i*0.004), size*0.14, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ── Viking Age ────────────────────────────────────────────────────────────────
export function VikingLongship({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*1.3, size*0.25, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.65, size*0.32, 0]} castShadow>
        <boxGeometry args={[size*0.06, size*0.2, size*0.35]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.65, size*0.45, 0]} castShadow>
        <sphereGeometry args={[size*0.15, 7, 6]} />
        <meshStandardMaterial color="#cc4422" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.05, size*0.7, 7]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.85, -size*0.22]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[size*0.5, size*0.35, size*0.04]} />
        <meshStandardMaterial color="#cc4422" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function RunestoneB26({ pos, color, size }: P26) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.15 + Math.sin(clock.getElapsedTime()*0.7)*0.1
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.4, size*0.7, size*0.14]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.35, size*0.08]}>
        <boxGeometry args={[size*0.28, size*0.55, size*0.02]} />
        <meshStandardMaterial color="#cc4422" emissive="#cc4422" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      {[size*0.15,-size*0.15].map((y,i) => (
        <mesh key={i} position={[0, y+size*0.35, size*0.09]}>
          <torusGeometry args={[size*0.08, size*0.015, 5, 12]} />
          <meshStandardMaterial color="#cc4422" emissive="#cc4422" emissiveIntensity={0.2} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function VikingIronHelmet({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.14, 0]} castShadow>
        <boxGeometry args={[size*0.5, size*0.06, size*0.5]} />
        <meshStandardMaterial color="#888877" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 9, 7]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.35, size*0.25]} castShadow>
        <boxGeometry args={[size*0.42, size*0.16, size*0.06]} />
        <meshStandardMaterial color="#888877" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.18, size*0.54, 0]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.22, 6]} />
          <meshStandardMaterial color="#eeeecc" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function VikingMeadHall({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*0.56, size*0.7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.72, 0]} castShadow>
        <boxGeometry args={[size*1.25, size*0.42, size*0.75]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      {[-0.45,0.45].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.88, 0]} castShadow>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.34, 7]} />
          <meshStandardMaterial color="#664422" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.18, size*0.36]}>
        <boxGeometry args={[size*0.22, size*0.34, size*0.04]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function VikingAxeRack({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, -size*0.06]}>
        <boxGeometry args={[size*0.65, size*0.7, size*0.06]} />
        <meshStandardMaterial color="#664422" roughness={0.8} />
      </mesh>
      {[-0.2,0.2].map((x,i) => (
        <group key={i} position={[x*size, size*0.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[size*0.025, size*0.02, size*0.6, 6]} />
            <meshStandardMaterial color="#886644" roughness={0.7} />
          </mesh>
          <mesh position={[size*0.1, size*0.25, 0]}>
            <boxGeometry args={[size*0.2, size*0.18, size*0.06]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function BonfireViking({ pos, color, size }: P26) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.children.forEach((c, i) => {
        c.scale.y = 1 + Math.sin(t*4+i*0.8)*0.25
        const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
        if (mat?.emissive) mat.emissiveIntensity = 0.4 + Math.sin(t*3+i)*0.3
      })
    }
  })
  return (
    <group position={pos}>
      {[-0.12,0,0.12].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.1, 0]} castShadow>
          <cylinderGeometry args={[size*0.03, size*0.04, size*0.3, 5]} />
          <meshStandardMaterial color="#664422" roughness={0.9} />
        </mesh>
      ))}
      <group ref={ref}>
        {[0,1,2].map((i) => (
          <mesh key={i} position={[Math.cos(i*2.09)*size*0.06, size*0.32, Math.sin(i*2.09)*size*0.06]}>
            <coneGeometry args={[size*0.06, size*0.28, 5]} />
            <meshStandardMaterial color={i===0?"#ff4400":i===1?color:"#ffcc44"}
              emissive={i===0?"#ff4400":i===1?color:"#ffcc44"} emissiveIntensity={0.4} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function VikingShield({ pos, color, size }: P26) {
  return (
    <group position={pos} rotation={[0, 0.3, 0]}>
      <mesh position={[0, size*0.45, 0]} castShadow>
        <cylinderGeometry args={[size*0.38, size*0.38, size*0.06, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.48, 0]}>
        <torusGeometry args={[size*0.3, size*0.025, 5, 16]} />
        <meshStandardMaterial color="#888877" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.48, 0]}>
        <torusGeometry args={[size*0.15, size*0.02, 5, 12]} />
        <meshStandardMaterial color="#888877" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.5, 0]}>
        <sphereGeometry args={[size*0.07, 7, 7]} />
        <meshStandardMaterial color="#888877" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.28,0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]}>
          <boxGeometry args={[size*0.06, size*0.22, size*0.04]} />
          <meshStandardMaterial color="#888877" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function DragonProw({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.14, size*0.6, 7]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.72, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.88, size*0.16]} castShadow>
        <coneGeometry args={[size*0.08, size*0.35, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*size*0.14, size*0.8, 0]}>
          <sphereGeometry args={[size*0.05, 5, 5]} />
          <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[0,1,2].map((i) => (
        <mesh key={i} position={[0, size*(0.94+i*0.12), size*0.08]}>
          <coneGeometry args={[size*0.04, size*0.12, 4]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function NordicWell({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.16, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.32, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.25,0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.48, 0]} castShadow>
          <cylinderGeometry args={[size*0.04, size*0.05, size*0.5, 7]} />
          <meshStandardMaterial color="#886644" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.76, 0]}>
        <boxGeometry args={[size*0.6, size*0.06, size*0.1]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.1, 0]}>
        <cylinderGeometry args={[size*0.24, size*0.26, size*0.1, 10]} />
        <meshStandardMaterial color="#2255aa" transparent opacity={0.65} roughness={0.2} />
      </mesh>
    </group>
  )
}

export function NordicBanner({ pos, color, size }: P26) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.035, size*0.04, size*1.0, 6]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.96, 0]}>
        <boxGeometry args={[size*0.42, size*0.06, size*0.06]} />
        <meshStandardMaterial color="#886644" roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.08, size*0.68, size*0.03]}>
        <boxGeometry args={[size*0.26, size*0.5, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-size*0.08, size*0.68, size*0.05]}>
        <boxGeometry args={[size*0.16, size*0.35, size*0.02]} />
        <meshStandardMaterial color="#cc4422" roughness={0.4} />
      </mesh>
    </group>
  )
}
