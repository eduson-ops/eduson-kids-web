import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 17: Ancient Egypt + Fairy Garden ───────────────────────────────────
interface P17 { pos: [number,number,number]; color: string; size: number }

export function PyramidBlock({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <coneGeometry args={[size*0.8, size, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[0, size*(0.15+i*0.18), 0]}>
          <boxGeometry args={[size*(1.0-i*0.2), size*0.03, size*(1.0-i*0.2)]} />
          <meshStandardMaterial color="#b89030" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function SphinxHead({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <boxGeometry args={[size*0.7, size*0.55, size*0.65]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.7, 0]} castShadow>
        <sphereGeometry args={[size*0.32, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.5, -size*0.3]} castShadow>
        <boxGeometry args={[size*0.7, size*0.62, size*0.1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[[-0.12,0.74,0.26],[0.12,0.74,0.26]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <sphereGeometry args={[size*0.07, 6,5]} />
          <meshStandardMaterial color="#333311" />
        </mesh>
      ))}
      <mesh position={[0, size*0.6, size*0.3]} castShadow>
        <boxGeometry args={[size*0.2, size*0.05, size*0.1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function EgyptObelisk({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <boxGeometry args={[size*0.26, size*1.3, size*0.26]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size*1.38, 0]} castShadow>
        <coneGeometry args={[size*0.16, size*0.25, 4]} />
        <meshStandardMaterial color="#ffcc44" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <boxGeometry args={[size*0.38, size*0.12, size*0.38]} />
        <meshStandardMaterial color="#9a7a30" roughness={0.8} />
      </mesh>
      {[0.2, 0.5, 0.8, 1.1].map((y, i) => (
        <mesh key={i} position={[size*0.14, y*size, 0]}>
          <boxGeometry args={[size*0.02, size*0.06, size*0.22]} />
          <meshStandardMaterial color="#c8a030" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function EgyptSarcophagus({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.25, size*1.1]} />
        <meshStandardMaterial color="#5a4010" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.38, 0]} castShadow>
        <boxGeometry args={[size*0.52, size*0.38, size*1.06]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, size*0.38, size*0.28]} castShadow>
        <sphereGeometry args={[size*0.2, 7,5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
      </mesh>
      {[-0.18,0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.38, -size*0.1]} castShadow>
          <boxGeometry args={[size*0.12, size*0.22, size*0.08]} />
          <meshStandardMaterial color={color} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.42, 0]}>
        <boxGeometry args={[size*0.08, size*0.03, size*0.85]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa00" emissiveIntensity={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function AnkhIdol({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.25, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.06, size*0.5, 7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.65, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[size*0.05, size*0.05, size*0.45, 7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.85, 0]} castShadow>
        <torusGeometry args={[size*0.14, size*0.055, 6, 14]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.02, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.12, size*0.06, 8]} />
        <meshStandardMaterial color="#8b7030" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function CanopicJar({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.18, size*0.6, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, size*0.05, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.2, size*0.1, 8]} />
        <meshStandardMaterial color="#8b7030" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.66, 0]} castShadow>
        <sphereGeometry args={[size*0.18, 7,5]} />
        <meshStandardMaterial color="#cc9040" roughness={0.5} />
      </mesh>
      {[[-0.18,0.3,0.18],[0.18,0.3,0.18],[-0.18,0.3,-0.18],[0.18,0.3,-0.18]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <boxGeometry args={[size*0.03, size*0.5, size*0.03]} />
          <meshStandardMaterial color="#7a5a20" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ScarabGem({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.16, 0]} castShadow>
        <boxGeometry args={[size*0.32, size*0.08, size*0.44]} />
        <meshStandardMaterial color="#8b7030" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.24, 0]} castShadow>
        <sphereGeometry args={[size*0.2, 7,5]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.3} />
      </mesh>
      {[-0.18, 0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.26, size*0.12]} rotation={[0.5, x*2, 0]} castShadow>
          <boxGeometry args={[size*0.14, size*0.04, size*0.24]} />
          <meshStandardMaterial color={color} roughness={0.15} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size*0.2, -size*0.2]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.02, size*0.22, 5]} />
        <meshStandardMaterial color={color} roughness={0.15} />
      </mesh>
    </group>
  )
}

export function PapyrusScroll({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[size*0.24, size*0.24, size*0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.38, 0.38].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.1, size*0.74, 8]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*0.65, size*0.28, size*0.06]} />
        <meshStandardMaterial color="#c9a050" roughness={0.85} />
      </mesh>
      {[-0.22, -0.08, 0.08, 0.22].map((y,i) => (
        <mesh key={i} position={[0, (0.12+y)*size, size*0.04]}>
          <boxGeometry args={[size*0.44, size*0.02, size*0.02]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function EyeOfRa({ pos, color, size }: P17) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 1.5) * 0.35
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.08, 0]}>
        <cylinderGeometry args={[size*0.5, size*0.55, size*0.12, 8]} />
        <meshStandardMaterial color="#8b7030" roughness={0.8} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.28, 0]} castShadow>
        <torusGeometry args={[size*0.28, size*0.08, 6, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <sphereGeometry args={[size*0.16, 8, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, size*0.28, size*0.1]} castShadow>
        <sphereGeometry args={[size*0.08, 6, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {[-0.35, 0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.2, 0]} rotation={[0, 0, x*0.6]} castShadow>
          <boxGeometry args={[size*0.06, size*0.18, size*0.04]} />
          <meshStandardMaterial color={color} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function DesertTorch({ pos, color, size }: P17) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 4) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.06, size*0.09, size*0.7, 7]} />
        <meshStandardMaterial color="#9a7030" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.12, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.26, size*0.24, 8]} />
        <meshStandardMaterial color="#7a5020" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.78, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.1, size*0.12, 7]} />
        <meshStandardMaterial color="#555555" roughness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.92, 0]} castShadow>
        <sphereGeometry args={[size*0.1, 6,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

// ── Fairy Garden ──────────────────────────────────────────────────────────────

export function FairyMushroom({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.12, size*0.15, size*0.44, 7]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <sphereGeometry args={[size*0.4, 8, 5, 0, Math.PI*2, 0, Math.PI*0.55]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[0,1,2,3,4].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*size*0.22, size*0.5, Math.sin(i*Math.PI*2/5)*size*0.22]}>
          <sphereGeometry args={[size*0.06, 5,4]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

export function DewdropFlower({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.03, size*0.04, size*0.6, 5]} />
        <meshStandardMaterial color="#4a8a30" roughness={0.7} />
      </mesh>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.22, size*0.62, Math.sin(i*Math.PI/3)*size*0.22]} rotation={[0.3, i*Math.PI/3, 0]} castShadow>
          <sphereGeometry args={[size*0.14, 5,4]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.62, 0]} castShadow>
        <sphereGeometry args={[size*0.1, 6,5]} />
        <meshStandardMaterial color="#ffdd44" />
      </mesh>
      {[[-0.15,0.62,0.18],[0.12,0.58,0.2]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <sphereGeometry args={[size*0.04, 4,3]} />
          <meshStandardMaterial color="#aaddff" transparent opacity={0.8} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

export function ButterflyPerch({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.03, size*0.05, size*0.6, 6]} />
        <meshStandardMaterial color="#6b3a1f" roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.12, size*0.62, 0]} rotation={[0.1, 0, 0.4]} castShadow>
        <sphereGeometry args={[size*0.2, 6,4]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[size*0.12, size*0.62, 0]} rotation={[0.1, 0, -0.4]} castShadow>
        <sphereGeometry args={[size*0.2, 6,4]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-size*0.06, size*0.52, 0]} rotation={[0.1, 0, 0.2]} castShadow>
        <sphereGeometry args={[size*0.12, 5,4]} />
        <meshStandardMaterial color="#cc88ff" transparent opacity={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[size*0.06, size*0.52, 0]} rotation={[0.1, 0, -0.2]} castShadow>
        <sphereGeometry args={[size*0.12, 5,4]} />
        <meshStandardMaterial color="#cc88ff" transparent opacity={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size*0.6, 0]} castShadow>
        <cylinderGeometry args={[size*0.025, size*0.025, size*0.28, 5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  )
}

export function FernCurl({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[size*0.025, size*0.04, size*0.4, 5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[0,1,2,3,4,5,6].map(i => (
        <mesh key={i} position={[Math.sin(i*0.8)*size*0.15, size*(0.15+i*0.07), Math.cos(i*0.8)*size*0.1]} rotation={[0, i*0.5, 0.3]}>
          <boxGeometry args={[size*0.12, size*0.03, size*0.06]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function AcornHouse({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.44, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <sphereGeometry args={[size*0.32, 8,5, 0, Math.PI*2, 0, Math.PI*0.6]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, size*0.22, size*0.29]} castShadow>
        <boxGeometry args={[size*0.1, size*0.2, size*0.06]} />
        <meshStandardMaterial color="#5a3010" />
      </mesh>
      {[-0.14, 0.14].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.26, size*0.29]}>
          <circleGeometry args={[size*0.07, 6]} />
          <meshStandardMaterial color="#ffeeaa" transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, size*0.62, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.16, 5]} />
        <meshStandardMaterial color="#4a8a30" />
      </mesh>
    </group>
  )
}

export function FairySpiderWeb({ pos, color, size }: P17) {
  return (
    <group position={pos} rotation={[-0.1, 0, 0.05]}>
      {[0.1, 0.22, 0.34, 0.46].map((r,i) => (
        <mesh key={i} position={[0, size*0.5, 0]}>
          <torusGeometry args={[r*size, size*0.008, 4, i%2===0 ? 6 : 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.1} />
        </mesh>
      ))}
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[0, size*0.5, 0]} rotation={[0, 0, i*Math.PI/3]}>
          <cylinderGeometry args={[size*0.006, size*0.006, size*0.95, 4]} />
          <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, size*0.5, 0]}>
        <sphereGeometry args={[size*0.025, 5,4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  )
}

export function FairyRingCircle({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      {[0,1,2,3,4,5,6,7].map(i => (
        <group key={i} position={[Math.cos(i*Math.PI/4)*size*0.55, 0, Math.sin(i*Math.PI/4)*size*0.55]}>
          <mesh position={[0, size*0.18, 0]} castShadow>
            <cylinderGeometry args={[size*0.06, size*0.08, size*0.36, 6]} />
            <meshStandardMaterial color={i%2===0 ? color : '#dddddd'} roughness={0.6} />
          </mesh>
          <mesh position={[0, size*0.44, 0]} castShadow>
            <sphereGeometry args={[size*0.14, 6,4]} />
            <meshStandardMaterial color={i%2===0 ? color : '#ff6699'} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size*0.02, 0]}>
        <torusGeometry args={[size*0.55, size*0.04, 4, 20]} />
        <meshStandardMaterial color="#44aa44" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function PebblePath({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      {[[-0.45,0.05,0.1],[-0.2,0.04,-0.12],[0.05,0.05,0.15],[0.28,0.04,-0.08],[0.5,0.05,0.1],
        [-0.35,0.04,-0.05],[-0.1,0.05,0.02],[0.15,0.04,-0.15],[0.4,0.05,0.05]].map((p, i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} castShadow>
          <sphereGeometry args={[size*(0.06+i%3*0.02), 5, 4]} />
          <meshStandardMaterial color={i%3===0 ? color : i%3===1 ? '#aaaaaa' : '#888888'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function MossLog({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.2, 0]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.22, size*0.28, size*1.1, 8]} />
        <meshStandardMaterial color="#5a3a15" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.28, 0]} rotation={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[size*0.23, size*0.24, size*1.08, 7, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.8} transparent opacity={0.7} />
      </mesh>
      {[-0.3, 0, 0.3].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.44, 0]} rotation={[0, 0.3*i, 0]} castShadow>
          <sphereGeometry args={[size*0.1, 5,4]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function WishWell({ pos, color, size }: P17) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.25, 0]} castShadow>
        <cylinderGeometry args={[size*0.38, size*0.4, size*0.5, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.14, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.3, size*0.1, 10]} />
        <meshStandardMaterial color="#445544" roughness={0.4} />
      </mesh>
      {[-0.42, 0.42].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.75, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.07, size*1.0, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.26, 0]} castShadow>
        <boxGeometry args={[size*1.0, size*0.06, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*1.35, 0]} castShadow>
        <coneGeometry args={[size*0.55, size*0.28, 6]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, size*1.28, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.55, 5]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
      <mesh position={[size*0.12, size*0.8, 0]}>
        <cylinderGeometry args={[size*0.02, size*0.02, size*0.7, 4]} />
        <meshStandardMaterial color="#888888" metalness={0.4} />
      </mesh>
      <mesh position={[size*0.12, size*0.44, 0]} castShadow>
        <boxGeometry args={[size*0.14, size*0.12, size*0.1]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ── BATCH 18: Western Town + Haunted Mansion ─────────────────────────────────
interface P18 { pos: [number,number,number]; color: string; size: number }

export function SaloonFront({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <boxGeometry args={[size*1.2, size*1.1, size*0.18]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*1.22, 0]} castShadow>
        <boxGeometry args={[size*1.28, size*0.22, size*0.22]} />
        <meshStandardMaterial color="#6b3a10" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.22, size*0.1]} castShadow>
        <boxGeometry args={[size*0.32, size*0.7, size*0.12]} />
        <meshStandardMaterial color="#5a2a08" />
      </mesh>
      {[-0.36, 0.36].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.62, size*0.1]}>
          <boxGeometry args={[size*0.22, size*0.38, size*0.1]} />
          <meshStandardMaterial color="#aa8844" transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*0.75, size*0.1]} castShadow>
        <boxGeometry args={[size*1.0, size*0.1, size*0.18]} />
        <meshStandardMaterial color="#7a4a18" roughness={0.9} />
      </mesh>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.5, size*0.08]} castShadow>
          <cylinderGeometry args={[size*0.055, size*0.06, size, 7]} />
          <meshStandardMaterial color="#6b3a10" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function WaterTrough({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.18, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.28, size*0.36]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.28, 0]}>
        <boxGeometry args={[size*0.8, size*0.12, size*0.28]} />
        <meshStandardMaterial color="#5588aa" roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {[-0.38, 0.38].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.1, 0]} castShadow>
          <boxGeometry args={[size*0.1, size*0.22, size*0.36]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      {[0.12, 0.25].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <boxGeometry args={[size*0.94, size*0.04, size*0.4]} />
          <meshStandardMaterial color="#3a7a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function HitchingPost({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <cylinderGeometry args={[size*0.055, size*0.07, size*1.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*1.3, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.55, 5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.12, size*0.12, 6]} />
        <meshStandardMaterial color="#7a5020" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function WantedPoster({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.3, 5]} />
        <meshStandardMaterial color="#6b3a10" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.88, size*0.05]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.75, size*0.04]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, size*1.0, size*0.07]}>
        <boxGeometry args={[size*0.4, size*0.18, size*0.02]} />
        <meshStandardMaterial color="#cc2211" roughness={0.8} />
      </mesh>
      {[-0.12,0,0.12].map((y,i) => (
        <mesh key={i} position={[0, (0.72+y)*size, size*0.07]}>
          <boxGeometry args={[size*0.38, size*0.04, size*0.02]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.72, size*0.07]}>
        <sphereGeometry args={[size*0.1, 6,5]} />
        <meshStandardMaterial color="#c8a040" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function SheriffStar({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.08, 8]} />
        <meshStandardMaterial color="#8b7030" roughness={0.7} />
      </mesh>
      {[0,1,2,3,4].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/5 - Math.PI/2)*size*0.3, size*0.24, Math.sin(i*Math.PI*2/5 - Math.PI/2)*size*0.3]} castShadow>
          <coneGeometry args={[size*0.1, size*0.24, 4]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size*0.24, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.06, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} />
      </mesh>
    </group>
  )
}

export function CactusBarrel({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <cylinderGeometry args={[size*0.3, size*0.28, size*0.56, 9]} />
        <meshStandardMaterial color="#6b3a10" roughness={0.9} />
      </mesh>
      {[0.14, 0.28].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.3, size*0.03, 4, 14]} />
          <meshStandardMaterial color="#444444" metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size*0.62, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.55, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[-0.15, 0.15].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.85, 0]} rotation={[0, 0, x*2]} castShadow>
          <cylinderGeometry args={[size*0.04, size*0.035, size*0.25, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function MiningCart({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.75, size*0.45, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.3, 0.3].map((x,i) => (
        [-0.2, 0.2].map((z,j) => (
          <mesh key={`${i}_${j}`} position={[x*size, size*0.1, z*size]}>
            <cylinderGeometry args={[size*0.1, size*0.1, size*0.08, 8]} />
            <meshStandardMaterial color="#444444" metalness={0.5} roughness={0.5} />
          </mesh>
        ))
      ))}
      <mesh position={[0, size*0.08, 0]} rotation={[Math.PI/2, 0, 0]}>
        <boxGeometry args={[size*0.65, size*0.08, size*0.08]} />
        <meshStandardMaterial color="#555555" metalness={0.5} />
      </mesh>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[0, size*(0.1+i*0.1), 0]}>
          <boxGeometry args={[size*0.76, size*0.04, size*0.52]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function GoldNugget({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.16, 0]} castShadow>
        <dodecahedronGeometry args={[size*0.32, 0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {[[-0.2,0.14,0.12],[0.18,0.18,-0.1],[-0.12,0.22,0.18]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} castShadow>
          <dodecahedronGeometry args={[size*0.12, 0]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

export function WesternFence({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]} castShadow>
          <boxGeometry args={[size*0.09, size*0.7, size*0.09]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[0.18, 0.42].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]} castShadow>
          <boxGeometry args={[size*1.05, size*0.08, size*0.07]} />
          <meshStandardMaterial color="#7a5020" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function WesternHayBale({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.35, size*0.56, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[0,1,2,3,4].map(i => (
        <mesh key={i} position={[0, size*0.28, 0]} rotation={[0, 0, i*Math.PI/2.5]}>
          <torusGeometry args={[size*0.36, size*0.025, 4, 12]} />
          <meshStandardMaterial color="#c49a30" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── Haunted Mansion ───────────────────────────────────────────────────────────

export function GhostLantern({ pos, color, size }: P18) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.5
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.3, 5]} />
        <meshStandardMaterial color="#333333" metalness={0.5} />
      </mesh>
      <mesh position={[0, size*1.4, 0]} castShadow>
        <boxGeometry args={[size*0.3, size*0.35, size*0.3]} />
        <meshStandardMaterial color="#222222" metalness={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*1.4, 0]} castShadow>
        <sphereGeometry args={[size*0.15, 7,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, size*1.58, 0]} castShadow>
        <coneGeometry args={[size*0.2, size*0.18, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function Gravestone({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.52, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.9, size*0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.97, 0]} castShadow>
        <sphereGeometry args={[size*0.22, 7,4, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <boxGeometry args={[size*0.5, size*0.12, size*0.14]} />
        <meshStandardMaterial color="#777777" roughness={0.9} />
      </mesh>
      {[0.5, 0.7, 0.9].map((y,i) => (
        <mesh key={i} position={[0, y*size, size*0.06]}>
          <boxGeometry args={[size*0.28, size*0.04, size*0.02]} />
          <meshStandardMaterial color="#555555" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function HauntedTree({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.55, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.16, size*1.1, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[[-0.35, 0.9, -0.1],[-0.5, 0.75, 0.12],[0.4, 0.85, 0],[0.3, 1.05, -0.1]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} rotation={[0, 0, p[0]!*0.6]} castShadow>
          <cylinderGeometry args={[size*0.04, size*0.07, size*(0.38-i*0.04), 5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[[-0.48, 0.8, -0.05],[0.55, 0.78, 0.08]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]} rotation={[0, 0, p[0]!*1.2]}>
          <cylinderGeometry args={[size*0.025, size*0.035, size*0.22, 4]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function CauldronBubble({ pos, color, size }: P18) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 3) * 0.3
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.28, 0]} castShadow>
        <sphereGeometry args={[size*0.38, 9, 6, 0, Math.PI*2, Math.PI/4, Math.PI*0.7]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size*0.1, 0]}>
        <torusGeometry args={[size*0.36, size*0.06, 5, 14]} />
        <meshStandardMaterial color="#333333" metalness={0.5} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.38, 0]}>
        <cylinderGeometry args={[size*0.28, size*0.28, size*0.06, 9]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} roughness={0.3} />
      </mesh>
      {[[-0.12,0.48,0.1],[0.1,0.5,-0.08],[0.0,0.54,0.05]].map((p,i) => (
        <mesh key={i} position={[p[0]!*size, p[1]!*size, p[2]!*size]}>
          <sphereGeometry args={[size*(0.06-i*0.01), 5,4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.6} />
        </mesh>
      ))}
      {[-0.4, 0, 0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.08, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.07, size*0.18, 6]} />
          <meshStandardMaterial color="#555555" metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function BatSwarm({ pos, color, size }: P18) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={pos}>
      {[0,1,2,3,4].map(i => (
        <group key={i} position={[Math.cos(i*Math.PI*2/5)*size*0.4, size*(0.6+Math.sin(i*1.3)*0.2), Math.sin(i*Math.PI*2/5)*size*0.4]}>
          {[-0.15, 0.15].map((x,j) => (
            <mesh key={j} position={[x*size, 0, 0]} rotation={[0, 0, x*1.2]} castShadow>
              <sphereGeometry args={[size*0.1, 5,3]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, size*0.06, 0]} castShadow>
            <sphereGeometry args={[size*0.07, 5,4]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function CobwebArch({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.55, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*1.1, size*0.14]} />
          <meshStandardMaterial color="#222222" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.12, 0]} castShadow>
        <torusGeometry args={[size*0.52, size*0.06, 5, 14, Math.PI]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>
      {[0.1, 0.22, 0.34, 0.46].map((r,i) => (
        <mesh key={i} position={[0, size*1.12, 0]}>
          <torusGeometry args={[r*size, size*0.008, 3, i%2===0 ? 8 : 10, Math.PI]} />
          <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.1} />
        </mesh>
      ))}
      {[-0.4,-0.2,0,0.2,0.4].map((x,i) => (
        <mesh key={i} position={[x*size, size*1.12, 0]}>
          <boxGeometry args={[size*0.008, size*0.5, size*0.008]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function CoffinLid({ pos, color, size }: P18) {
  return (
    <group position={pos} rotation={[-0.15, 0, 0.05]}>
      <mesh position={[0, size*0.08, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.1, size*1.1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.22, 0, 0.22].map((z,i) => (
        <mesh key={i} position={[0, size*0.14, z*size]}>
          <boxGeometry args={[size*0.56, size*0.02, size*0.08]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size*0.16, size*0.12]}>
        <sphereGeometry args={[size*0.06, 5,4]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function PotionShelf({ pos, color, size }: P18) {
  return (
    <group position={pos}>
      {[0, 0.44].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]} castShadow>
          <boxGeometry args={[size*0.85, size*0.06, size*0.2]} />
          <meshStandardMaterial color="#4a2808" roughness={0.8} />
        </mesh>
      ))}
      {[-0.42, 0.42].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.22, 0]} castShadow>
          <boxGeometry args={[size*0.06, size*0.5, size*0.2]} />
          <meshStandardMaterial color="#4a2808" roughness={0.8} />
        </mesh>
      ))}
      {[-0.28,-0.1,0.1,0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.2, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.07, size*0.28, 7]} />
          <meshStandardMaterial color={[color,'#ff4444','#ffdd00','#aa44ff'][i]!} roughness={0.4} transparent opacity={0.75} />
        </mesh>
      ))}
      {[-0.2,0,0.2].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.62, 0]} castShadow>
          <cylinderGeometry args={[size*0.055, size*0.06, size*0.24, 7]} />
          <meshStandardMaterial color={['#44ff88','#ff88aa','#44aaff'][i]!} roughness={0.4} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

export function CursedMirror({ pos, color, size }: P18) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime() * 0.7) * 0.15
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.7, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*1.1, size*0.08]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.72, size*0.05]} castShadow>
        <boxGeometry args={[size*0.44, size*0.95, size*0.03]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} metalness={0.9} roughness={0.05} />
      </mesh>
      {[-0.28, 0, 0.28].map((x,i) => (
        <mesh key={i} position={[x*size, size*1.26, size*0.05]} castShadow>
          <boxGeometry args={[size*0.12, size*0.06, size*0.06]} />
          <meshStandardMaterial color="#5a3a08" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size*0.1, 0]}>
        <boxGeometry args={[size*0.3, size*0.2, size*0.12]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function SpiritFlame({ pos, color, size }: P18) {
  const ref = useRef<THREE.Mesh>(null!)
  const ref2 = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.scale.y = 0.85 + Math.sin(t * 4) * 0.22
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(t * 3.5) * 0.35
    }
    if (ref2.current) ref2.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.5) * size * 0.1
  })
  return (
    <group ref={ref2} position={pos}>
      <mesh ref={ref} position={[0, size*0.35, 0]} castShadow>
        <coneGeometry args={[size*0.16, size*0.7, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, size*0.1, 0]} castShadow>
        <coneGeometry args={[size*0.22, size*0.2, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, size*0.72, 0]} castShadow>
        <sphereGeometry args={[size*0.08, 6,5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
