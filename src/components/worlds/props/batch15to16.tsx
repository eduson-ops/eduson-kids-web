import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 15: Pirate Cove + Candy Land ───────────────────────────────────────
interface P15 { pos: [number,number,number]; color: string; size: number }

export function PirateShip({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.4, size * 0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.22, size * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 1.2, 6]} />
        <meshStandardMaterial color="#4a2800" />
      </mesh>
      <mesh position={[size * 0.35, size * 1.2, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.45, size * 0.04]} />
        <meshStandardMaterial color="#ddddcc" />
      </mesh>
      <mesh position={[-size * 0.55, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.18, size * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function ShipCannon({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[-0.18, 0.18].map((z, i) => (
        <mesh key={i} position={[0, size * 0.15, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.28, 6]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[size * 0.08, size * 0.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.1, size * 0.7, 10]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.3, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.4} />
      </mesh>
    </group>
  )
}

export function PirateTreasureMap({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.2]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.55, 6]} />
          <meshStandardMaterial color="#6b3a1f" />
        </mesh>
      ))}
      <mesh position={[0, size * 0.1, size * 0.04]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.12, size * 0.04]} />
        <meshStandardMaterial color="#cc1111" emissive="#aa0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function JollyRogerFlag({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.75, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.5, 6]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
      <mesh position={[size * 0.25, size * 1.3, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.35, size * 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size * 0.25, size * 1.3, size * 0.05]} castShadow>
        <sphereGeometry args={[size * 0.1, 7, 5]} />
        <meshStandardMaterial color="#f5f0e0" />
      </mesh>
      {[[-0.08, 1.22, 0.05], [0.08, 1.22, 0.05]].map((p, i) => (
        <mesh key={i} position={[p[0] * size, p[1] * size, p[2] * size]}>
          <boxGeometry args={[size * 0.06, size * 0.02, size * 0.04]} />
          <meshStandardMaterial color="#f5f0e0" />
        </mesh>
      ))}
    </group>
  )
}

export function PlankBridge({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[-0.4, -0.15, 0.15, 0.4].map((z, i) => (
        <mesh key={i} position={[0, size * 0.06, z * size]} castShadow>
          <boxGeometry args={[size * 1.2, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[-0.52, 0.52].map((z, i) => (
        <mesh key={i} position={[0, size * 0.12, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.22, 5]} />
          <meshStandardMaterial color="#8b5a1a" />
        </mesh>
      ))}
    </group>
  )
}

export function PirateChest({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.36, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.22, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.42, 0]}>
        <cylinderGeometry args={[size * 0.24, size * 0.24, size * 0.44, 12, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[-0.22, 0, 0.22].map((z, i) => (
        <mesh key={i} position={[0, size * 0.18, z * size]}>
          <boxGeometry args={[size * 0.65, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#cc9900" metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[size * 0.33, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.08, size * 0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

export function AnchorProp({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.9, 7]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.9, 0]}>
        <torusGeometry args={[size * 0.2, size * 0.05, 6, 12]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.6, 6]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.05, 0]} castShadow>
          <sphereGeometry args={[size * 0.09, 6, 5]} />
          <meshStandardMaterial color={color} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function SeaMine({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.35, 10, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[0.7,0.7,0],[-0.7,0.7,0]].map((d, i) => (
        <mesh key={i} position={[d[0]*size*0.38, size*0.35+d[1]*size*0.38, d[2]*size*0.38]} castShadow>
          <sphereGeometry args={[size * 0.06, 5, 4]} />
          <meshStandardMaterial color="#cc2200" emissive="#aa0000" emissiveIntensity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.35, 6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}

export function CrowNest({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.07, size * 1.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.25, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.32, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.48, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.28, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI/2)*size*0.34, size*1.3, Math.sin(i*Math.PI/2)*size*0.34]}>
          <boxGeometry args={[size * 0.04, size * 0.22, size * 0.04]} />
          <meshStandardMaterial color="#6b3a1f" />
        </mesh>
      ))}
    </group>
  )
}

export function PirateTavern({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.9, size * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.3, size * 0.9]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 1.25, 0]} castShadow>
        <boxGeometry args={[size * 1.25, size * 0.06, size * 0.95]} />
        <meshStandardMaterial color="#4a2808" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.35, size * 0.42]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.48, size * 0.06]} />
        <meshStandardMaterial color="#4a2808" />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.5, size * 0.42]}>
          <boxGeometry args={[size * 0.18, size * 0.22, size * 0.05]} />
          <meshStandardMaterial color="#886644" transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[-size * 0.35, size * 0.7, size * 0.43]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.12, size * 0.05]} />
        <meshStandardMaterial color="#cc8800" />
      </mesh>
    </group>
  )
}

// ── Candy Land ────────────────────────────────────────────────────────────────

export function CandyTree({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.7, 6]} />
        <meshStandardMaterial color="#cc6688" />
      </mesh>
      {[[0, 1.0, 0], [size*0.25, 0.8, 0], [-size*0.2, 0.85, size*0.15]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1] * size, p[2]]} castShadow>
          <sphereGeometry args={[size * (0.32 - i * 0.06), 8, 6]} />
          <meshStandardMaterial color={i === 0 ? color : i === 1 ? '#ff88bb' : '#ee44aa'} />
        </mesh>
      ))}
      {[0,1,2,3,4,5].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.28, size*1.02, Math.sin(i*Math.PI/3)*size*0.28]} castShadow>
          <sphereGeometry args={[size * 0.07, 5, 4]} />
          <meshStandardMaterial color={['#ffdd00','#ff4444','#44aaff','#44ff88','#ffaa00','#ff44ff'][i]} emissive={['#ffdd00','#ff4444','#44aaff','#44ff88','#ffaa00','#ff44ff'][i]} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function LollipopTower({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI/4)*size*0.04, size*(0.12 + i*0.12), Math.sin(i*Math.PI/4)*size*0.04]} rotation={[0, i*Math.PI/4, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.12, size * 0.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? color : '#ffffff'} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.12, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function GingerbreadHouse({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.7, size * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.0, size * 0.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <coneGeometry args={[size * 0.6, size * 0.42, 4]} />
        <meshStandardMaterial color="#dd5522" />
      </mesh>
      <mesh position={[0, size * 0.35, size * 0.36]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.44, size * 0.06]} />
        <meshStandardMaterial color="#884422" />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.42, size * 0.36]}>
          <boxGeometry args={[size * 0.14, size * 0.16, size * 0.05]} />
          <meshStandardMaterial color="#ffeeaa" transparent opacity={0.7} />
        </mesh>
      ))}
      {[-0.38, 0, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.37]}>
          <sphereGeometry args={[size * 0.06, 5, 4]} />
          <meshStandardMaterial color={['#ff4444','#ffffff','#ff4444'][i]} />
        </mesh>
      ))}
    </group>
  )
}

export function CandyCaneGate({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[-0.45, 0.45].map((x, i) => (
        <group key={i} position={[x * size, size * 0.55, 0]}>
          {[0,1,2,3,4,5,6].map((j) => (
            <mesh key={j} position={[0, size * (j * 0.16 - 0.42), 0]} castShadow>
              <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.16, 7]} />
              <meshStandardMaterial color={j % 2 === 0 ? color : '#ffffff'} />
            </mesh>
          ))}
          <mesh position={[0, size * 0.7, 0]} castShadow>
            <torusGeometry args={[size * 0.1, size * 0.08, 6, 12, Math.PI]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size * 1.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.92, 7]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function CupcakeThrone({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.38, size * 0.36, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 0.44, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.44, size * 0.28, 8]} />
        <meshStandardMaterial color="#ffddee" roughness={0.3} />
      </mesh>
      {[0,1,2,3,4,5,6].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/7)*size*0.44, size*0.58, Math.sin(i*Math.PI*2/7)*size*0.44]} castShadow>
          <sphereGeometry args={[size * 0.08, 5, 4]} />
          <meshStandardMaterial color={['#ff4444','#ffdd00','#44aaff','#ff88bb','#44ff88','#ffaa00','#aa44ff'][i]} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 7, 5]} />
        <meshStandardMaterial color="#ff2266" emissive="#ff0044" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, size * 0.5, -size * 0.42]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.62, size * 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-0.22, 0.22].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, -size * 0.42]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.22, 5]} />
          <meshStandardMaterial color="#ffddee" />
        </mesh>
      ))}
    </group>
  )
}

export function CottonCandyCloud({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[[0,0],[0.35,0.08],[-0.3,0.05],[0.15,0.2],[-0.18,0.18],[0.4,-0.05],[-0.38,-0.04]].map(([x,y], i) => (
        <mesh key={i} position={[x*size, size*0.35 + y*size, 0]} castShadow>
          <sphereGeometry args={[size * (0.32 - i * 0.02), 7, 5]} />
          <meshStandardMaterial color={i % 2 === 0 ? color : '#ffbbdd'} transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  )
}

export function ChocolateRiver({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.6, size * 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[-0.35, 0, 0.35].map((z, i) => (
        <mesh key={i} position={[0, size * 0.1, z * size * 0.5]} castShadow>
          <sphereGeometry args={[size * 0.1, 6, 4]} />
          <meshStandardMaterial color="#3a1a06" roughness={0.3} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, 0]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.18, size * 0.6]} />
          <meshStandardMaterial color="#5c3010" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function DonutArch({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <torusGeometry args={[size * 0.62, size * 0.22, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[0,1,2,3,4,5,6,7,8].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI/8 + Math.PI)*size*0.62, size*0.65+Math.sin(i*Math.PI/8+Math.PI)*size*0.62, 0]} castShadow>
          <sphereGeometry args={[size * 0.07, 5, 4]} />
          <meshStandardMaterial color={['#ff4444','#ffdd00','#88ddff','#ff88aa','#44ff88'][i%5]} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.12, 0]}>
        <boxGeometry args={[size * 1.68, size * 0.08, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.4} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function JellybeanPath({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      {[-2,-1,0,1,2].map((xi) => (
        [-1,0,1].map((zi) => (
          <mesh key={`${xi}_${zi}`} position={[xi * size * 0.32, size * 0.05, zi * size * 0.32]} castShadow>
            <sphereGeometry args={[size * 0.1, 6, 5]} />
            <meshStandardMaterial color={['#ff4444','#44cc44','#4444ff','#ffdd00','#ff88aa','#44ccff','#ffaa44'][(Math.abs(xi)+Math.abs(zi))%7]} />
          </mesh>
        ))
      ))}
      <mesh position={[0, size * 0.01, 0]}>
        <boxGeometry args={[size * 1.6, size * 0.02, size * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function SugarCastle({ pos, color, size }: P15) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.8, size * 0.9]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {[[-0.45,0.9,-0.35],[0.45,0.9,-0.35],[-0.45,0.9,0.35],[0.45,0.9,0.35]].map((p, i) => (
        <group key={i} position={[p[0]*size, p[1]*size, p[2]*size]}>
          <mesh castShadow>
            <cylinderGeometry args={[size*0.14, size*0.14, size*0.5, 8]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
          <mesh position={[0, size*0.35, 0]} castShadow>
            <coneGeometry args={[size*0.18, size*0.3, 8]} />
            <meshStandardMaterial color="#ff44aa" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 1.18, size * 0.12, size * 0.98]} />
        <meshStandardMaterial color="#ffddee" roughness={0.2} />
      </mesh>
      <mesh position={[0, size * 0.35, size * 0.46]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.5, size * 0.06]} />
        <meshStandardMaterial color="#cc3366" />
      </mesh>
      {[0,1,2,3,4,5,6,7].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI/4)*size*0.62, size*0.82, Math.sin(i*Math.PI/4)*size*0.52]}>
          <sphereGeometry args={[size*0.06, 5, 4]} />
          <meshStandardMaterial color={['#ff4444','#ffdd00','#44aaff','#ff88bb','#44ff88','#ffaa00','#aa44ff','#ffffff'][i]} emissive={['#ff4444','#ffdd00','#44aaff','#ff88bb','#44ff88','#ffaa00','#aa44ff','#ffffff'][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// ── BATCH 16: Volcano World + Neon City ─────────────────────────────────────
interface P16 { pos: [number,number,number]; color: string; size: number }

export function LavaPool({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 1.2) * 0.3
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.7, size * 0.6, size * 0.1, 10]} />
        <meshStandardMaterial color={color} emissive="#ff3300" emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      {[0,1,2,3,4].map((i) => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*size*0.45, size*0.1, Math.sin(i*Math.PI*2/5)*size*0.45]} castShadow>
          <sphereGeometry args={[size*0.08, 5, 4]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {[-0.5,-0.2,0.2,0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.06, 0]}>
          <boxGeometry args={[size*0.05, size*0.04, size*1.4]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function VolcanoRock({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.5, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[size*0.25, size*0.12, size*0.15]} castShadow>
        <dodecahedronGeometry args={[size * 0.25, 0]} />
        <meshStandardMaterial color="#222222" roughness={0.95} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/3)*size*0.38, size*0.05, Math.sin(i*Math.PI*2/3)*size*0.35]} castShadow>
          <sphereGeometry args={[size*0.08, 5,4]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function FireGeyser({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.2
      ref.current.scale.set(s, 1 + Math.sin(clock.getElapsedTime() * 2.5) * 0.3, s)
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 4) * 0.3
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.06, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.22, size*0.12, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.6, 0]} castShadow>
        <coneGeometry args={[size*0.15, size*1.0, 8]} />
        <meshStandardMaterial color={color} emissive="#ff4400" emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/3)*size*0.1, size*0.35, Math.sin(i*Math.PI*2/3)*size*0.1]} castShadow>
          <sphereGeometry args={[size*0.07, 5,4]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ObsidianPillar({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      {[0,1,2].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI*2/3)*size*0.12, size*(0.5+i*0.15), Math.sin(i*Math.PI*2/3)*size*0.12]} castShadow>
          <cylinderGeometry args={[size*(0.14-i*0.02), size*(0.14-i*0.02), size*1.2, 6]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, size*0.06, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.35, size*0.12, 6]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, size*1.25, 0]} castShadow>
        <coneGeometry args={[size*0.14, size*0.22, 6]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.05} />
      </mesh>
    </group>
  )
}

export function LavaBridge({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.12, 0]} castShadow>
        <boxGeometry args={[size*1.6, size*0.14, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.65, 0.65].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.28, 0]} castShadow>
          <boxGeometry args={[size*0.12, size*0.3, size*0.5]} />
          <meshStandardMaterial color="#444444" roughness={0.9} />
        </mesh>
      ))}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]}>
          <boxGeometry args={[size*0.06, size*0.04, size*0.5]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function MagmaCrystal({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.2) * 0.4
  })
  return (
    <group position={pos}>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/2)*size*0.18, size*0.4, Math.sin(i*Math.PI/2)*size*0.18]} rotation={[0.2, i*Math.PI/2, 0]} castShadow>
          <coneGeometry args={[size*0.1, size*0.75, 4]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.3} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.38, 0]} castShadow>
        <octahedronGeometry args={[size*0.22, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.4} />
      </mesh>
    </group>
  )
}

export function FireShrine({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      {[-0.35, 0.35].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.55, 0]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.14, size*1.1, 6]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size*1.12, 0]} castShadow>
        <boxGeometry args={[size*0.85, size*0.1, size*0.22]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.45, size*0.5, size*0.35]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <sphereGeometry args={[size*0.12, 6,5]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

export function AshTree({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.5, 0]} castShadow>
        <cylinderGeometry args={[size*0.07, size*0.12, size, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {[-0.3, 0, 0.3].map((x,i) => (
        <mesh key={i} position={[x*size, size*(0.75+i*0.1), 0]} rotation={[0, 0, x*0.6]} castShadow>
          <cylinderGeometry args={[size*0.03, size*0.05, size*(0.4-i*0.05), 5]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {[-0.25, 0, 0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*(1.0+i*0.07), x*size*0.3]}>
          <sphereGeometry args={[size*0.1, 5,4]} />
          <meshStandardMaterial color="#888888" roughness={0.9} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function EmberLantern({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 3.5) * 0.35
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.65, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.3, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.5} />
      </mesh>
      <mesh position={[0, size*1.38, 0]} castShadow>
        <boxGeometry args={[size*0.28, size*0.3, size*0.28]} />
        <meshStandardMaterial color="#444444" metalness={0.6} roughness={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*1.38, 0]} castShadow>
        <sphereGeometry args={[size*0.12, 7,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

export function LavaGolem({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <boxGeometry args={[size*0.55, size*0.6, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, size*0.78, 0]} castShadow>
        <sphereGeometry args={[size*0.28, 7,5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {[[-0.4,0.6,0],[0.4,0.6,0]].map((p,i) => (
        <mesh key={i} position={[p[0]*size, p[1]*size, 0]} castShadow>
          <boxGeometry args={[size*0.18, size*0.42, size*0.18]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
      {[[-0.18,0.84,0.2],[0.18,0.84,0.2]].map((p,i) => (
        <mesh key={i} position={[p[0]*size, p[1]*size, p[2]*size]}>
          <sphereGeometry args={[size*0.07, 5,4]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {[-0.18, 0, 0.18].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]}>
          <boxGeometry args={[size*0.08, size*0.06, size*0.06]} />
          <meshStandardMaterial color="#444444" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ── Neon City ─────────────────────────────────────────────────────────────────

export function NeonTower({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.8) * 0.4
  })
  return (
    <group position={pos}>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[0, size*(0.22+i*0.38), 0]} castShadow>
          <boxGeometry args={[size*(0.55-i*0.06), size*0.36, size*(0.55-i*0.06)]} />
          <meshStandardMaterial color="#111122" roughness={0.2} metalness={0.7} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*0.58, 0]}>
        <boxGeometry args={[size*0.58, size*0.02, size*0.58]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, size*0.96, 0]}>
        <boxGeometry args={[size*0.52, size*0.02, size*0.52]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, size*1.75, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.5, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} />
      </mesh>
      <mesh position={[0, size*2.02, 0]}>
        <sphereGeometry args={[size*0.08, 6,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

export function HologramKiosk({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.8
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.14, 0]} castShadow>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.28, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.14, 6]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.7} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.58, 0]}>
        <torusGeometry args={[size*0.18, size*0.03, 6, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, size*0.58, 0]}>
        <sphereGeometry args={[size*0.1, 7,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export function CyberPod({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.45, 0]} castShadow>
        <cylinderGeometry args={[size*0.35, size*0.35, size*0.9, 8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.5} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, size*0.45, 0]}>
        <cylinderGeometry args={[size*0.36, size*0.36, size*0.92, 8, 1, true]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, size*0.9, 0]} castShadow>
        <sphereGeometry args={[size*0.35, 8,5, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <boxGeometry args={[size*0.18, size*0.3, size*0.06]} />
        <meshStandardMaterial color="#aaaacc" roughness={0.5} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} position={[0, size*(0.12+i*0.08), size*0.36]}>
          <boxGeometry args={[size*0.35, size*0.02, size*0.02]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function NeonFountain({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4
  })
  return (
    <group position={pos}>
      <mesh position={[0, size*0.06, 0]} castShadow>
        <cylinderGeometry args={[size*0.55, size*0.6, size*0.12, 10]} />
        <meshStandardMaterial color="#222233" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, size*0.15, 0]} castShadow>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.12, 8]} />
        <meshStandardMaterial color="#333344" metalness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, size*0.3, 0]}>
        <sphereGeometry args={[size*0.18, 7,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {[0,1,2,3,4,5].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/3)*size*0.35, size*0.18, Math.sin(i*Math.PI/3)*size*0.35]}>
          <sphereGeometry args={[size*0.05, 5,4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function HoverPlatform({ pos, color, size }: P16) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.2) * size * 0.08
  })
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size*0.06, 0]} castShadow>
        <cylinderGeometry args={[size*0.55, size*0.48, size*0.12, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, size*0.06, 0]}>
        <torusGeometry args={[size*0.55, size*0.04, 5, 16]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ccaa" emissiveIntensity={0.8} />
      </mesh>
      {[0,1,2,3].map(i => (
        <mesh key={i} position={[Math.cos(i*Math.PI/2)*size*0.4, 0, Math.sin(i*Math.PI/2)*size*0.4]}>
          <cylinderGeometry args={[size*0.04, size*0.04, size*0.3, 5]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ccaa" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function DataPillar({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.5
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 3) * 0.3
    }
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size*0.7, 0]} castShadow>
        <cylinderGeometry args={[size*0.18, size*0.22, size*1.4, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {[0.2,0.5,0.8,1.1,1.3].map((y,i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.22, size*0.025, 5, 14]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function GlitchBox({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      const glitch = Math.sin(t * 8) > 0.7
      ref.current.scale.x = glitch ? 1.08 : 1
      ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glitch ? 0.9 : 0.3
    }
  })
  return (
    <group position={pos}>
      <mesh ref={ref} position={[0, size*0.3, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.6, size*0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.1} metalness={0.3} />
      </mesh>
      {[[-0.32,0.3,0],[0.32,0.3,0],[0,0.3,-0.32],[0,0.3,0.32]].map((p,i) => (
        <mesh key={i} position={[p[0]*size, p[1]*size, p[2]*size]}>
          <boxGeometry args={[size*0.02, size*0.58, size*0.58]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function NeonBench({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.22, 0]} castShadow>
        <boxGeometry args={[size*0.9, size*0.08, size*0.35]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0, size*0.22, 0]}>
        <boxGeometry args={[size*0.92, size*0.03, size*0.37]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      {[-0.38, 0.38].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.12, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.22, size*0.3]} />
          <meshStandardMaterial color="#333344" metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function CyberGate({ pos, color, size }: P16) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2.2) * 0.4
  })
  return (
    <group position={pos}>
      {[-0.5, 0.5].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.65, 0]} castShadow>
          <boxGeometry args={[size*0.14, size*1.3, size*0.18]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      <mesh ref={ref} position={[0, size*1.32, 0]} castShadow>
        <boxGeometry args={[size*1.14, size*0.1, size*0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, size*0.65, 0]}>
        <boxGeometry args={[size*0.88, size*1.28, size*0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.15} />
      </mesh>
      {[-0.38, 0.38].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.65, 0]}>
          <boxGeometry args={[size*0.02, size*1.25, size*0.06]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SignalArray({ pos, color, size }: P16) {
  return (
    <group position={pos}>
      <mesh position={[0, size*0.35, 0]} castShadow>
        <cylinderGeometry args={[size*0.08, size*0.12, size*0.7, 6]} />
        <meshStandardMaterial color="#555566" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, size*0.75, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.06, size*0.06]} />
        <meshStandardMaterial color="#888899" metalness={0.6} />
      </mesh>
      {[-0.25, 0, 0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*0.88, 0]} castShadow>
          <cylinderGeometry args={[size*0.025, size*0.025, size*0.26, 5]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size*1.02, 0]}>
        <sphereGeometry args={[size*0.07, 6,5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      {[-0.25, 0.25].map((x,i) => (
        <mesh key={i} position={[x*size, size*1.01, 0]}>
          <sphereGeometry args={[size*0.05, 5,4]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}
