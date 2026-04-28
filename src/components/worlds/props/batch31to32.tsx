import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
// ── BATCH 31 · Steampunk City + Anime Dojo ───────────────────────────────────

interface P31 { pos: [number,number,number]; color: string; size: number }

export function SteamPiston({ pos, color, size }: P31) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + 0.3 + Math.abs(Math.sin(clock.getElapsedTime() * 2)) * size * 0.35
  })
  return (
    <group position={pos}>
      {/* cylinder housing */}
      <mesh position={[0, size*0.25, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.25, size*0.6, 10]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* rod */}
      <mesh ref={ref} position={[0, size*0.55, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.55, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* base flange */}
      <mesh>
        <cylinderGeometry args={[size*0.3, size*0.3, size*0.1, 10]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function GearworkClock({ pos, color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.3
  })
  return (
    <group position={pos}>
      {/* clock face */}
      <mesh>
        <cylinderGeometry args={[size*0.5, size*0.5, size*0.1, 16]} />
        <meshStandardMaterial color="#e8d5a0" roughness={0.7} />
      </mesh>
      <group ref={ref} position={[0, size*0.06, 0]}>
        {/* gears */}
        {([0, 1, 2] as number[]).map((i) => (
          <mesh key={i} rotation={[0, 0, (i/3)*Math.PI*2]}>
            <torusGeometry args={[size*(0.15+i*0.12), size*0.04, 4, 8]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* hands */}
        <mesh rotation={[0, 0, 0.5]}>
          <boxGeometry args={[size*0.04, size*0.35, size*0.04]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, -1.2]}>
          <boxGeometry args={[size*0.03, size*0.22, size*0.03]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function AirshipB31({ pos, color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.7) * size * 0.1
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.06
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* envelope */}
      <mesh position={[0, size*0.3, 0]}>
        <sphereGeometry args={[size*0.5, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* gondola */}
      <mesh position={[0, -size*0.2, 0]}>
        <boxGeometry args={[size*0.55, size*0.22, size*0.28]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
      {/* propeller */}
      <mesh position={[-size*0.28, -size*0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[size*0.14, size*0.03, 5, 6]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* ropes */}
      {([-0.18, 0.18] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.05, 0]} rotation={[0,0,x*0.3]}>
          <cylinderGeometry args={[size*0.015, size*0.015, size*0.5, 4]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function SteamPipeSystem({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* main vertical pipe */}
      <mesh position={[0, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.12, size*0.12, size*1.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* horizontal branches */}
      <mesh position={[size*0.3, size*0.9, 0]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.5, 7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-size*0.25, size*0.5, 0]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[size*0.08, size*0.08, size*0.45, 7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* valve wheel */}
      <mesh position={[size*0.56, size*0.9, 0]}>
        <torusGeometry args={[size*0.1, size*0.025, 5, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* steam vent glow */}
      <mesh position={[0, size*1.28, 0]}>
        <sphereGeometry args={[size*0.09, 6, 6]} />
        <meshStandardMaterial color="#ccddee" transparent opacity={0.6} emissive="#aabbcc" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function BrassGauge({ pos, color, size }: P31) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.4
  })
  return (
    <group position={pos}>
      {/* housing */}
      <mesh>
        <cylinderGeometry args={[size*0.3, size*0.32, size*0.12, 12]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* face */}
      <mesh position={[0, size*0.07, 0]}>
        <cylinderGeometry args={[size*0.25, size*0.25, size*0.04, 12]} />
        <meshStandardMaterial color="#e8e8d0" roughness={0.6} />
      </mesh>
      {/* needle */}
      <mesh ref={ref} position={[0, size*0.1, 0]}>
        <boxGeometry args={[size*0.03, size*0.22, size*0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function DojoPunchingDummy({ pos, color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.2
  })
  return (
    <group ref={ref} position={pos}>
      {/* base post */}
      <mesh position={[0, size*0.4, 0]}>
        <cylinderGeometry args={[size*0.08, size*0.1, size*0.8, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* body pad */}
      <mesh position={[0, size*0.95, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.2, size*0.55, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*1.35, 0]}>
        <sphereGeometry args={[size*0.18, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* arm pegs */}
      {([-1,1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.32, size*1.02, 0]}>
          <cylinderGeometry args={[size*0.06, size*0.06, size*0.25, 6]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function KatanaBlade({ pos, color: _color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.5
  })
  return (
    <group ref={ref} position={pos}>
      {/* blade gleam */}
      <mesh position={[0, size*0.7, 0]} rotation={[0,0,0.05]}>
        <boxGeometry args={[size*0.05, size*1.3, size*0.03]} />
        <meshStandardMaterial color="#d8e0e8" metalness={0.92} roughness={0.08} />
      </mesh>
      {/* guard tsuba */}
      <mesh position={[0, size*0.05, 0]}>
        <cylinderGeometry args={[size*0.18, size*0.18, size*0.05, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* hilt ito wrap */}
      <mesh position={[0, -size*0.28, 0]}>
        <cylinderGeometry args={[size*0.065, size*0.07, size*0.55, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* pommel kashira */}
      <mesh position={[0, -size*0.57, 0]}>
        <sphereGeometry args={[size*0.08, 6, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function DojoScrollBoard({ pos, color: _color, size }: P31) {
  return (
    <group position={pos}>
      {/* board */}
      <mesh position={[0, size*0.6, 0]}>
        <boxGeometry args={[size*0.85, size*0.65, size*0.04]} />
        <meshStandardMaterial color="#e8d5a0" roughness={0.8} />
      </mesh>
      {/* border frame */}
      <mesh position={[0, size*0.6, size*0.025]}>
        <boxGeometry args={[size*0.88, size*0.68, size*0.02]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* characters (placeholder bars) */}
      {([0.15, 0, -0.15] as number[]).map((y, i) => (
        <mesh key={i} position={[0, (size*0.6)+(y*size), size*0.04]}>
          <boxGeometry args={[size*0.5, size*0.07, size*0.01]} />
          <meshStandardMaterial color="#cc2200" roughness={0.6} />
        </mesh>
      ))}
      {/* post */}
      <mesh position={[0, size*0.22, -size*0.04]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*0.45, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function SteampunkGolem({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size*0.55, 0]}>
        <boxGeometry args={[size*0.55, size*0.65, size*0.4]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
      </mesh>
      {/* chest boiler */}
      <mesh position={[0, size*0.6, size*0.21]}>
        <cylinderGeometry args={[size*0.15, size*0.15, size*0.35, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* head */}
      <mesh position={[0, size*1.02, 0]}>
        <boxGeometry args={[size*0.38, size*0.35, size*0.32]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
      </mesh>
      {/* eyes */}
      {([-0.1, 0.1] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.06, size*0.17]}>
          <cylinderGeometry args={[size*0.05, size*0.05, size*0.04, 6]} />
          <meshStandardMaterial color="#ff8800" emissive="#ff6600" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* arms */}
      {([-1,1] as number[]).map((s, i) => (
        <mesh key={i} position={[s*size*0.4, size*0.6, 0]}>
          <boxGeometry args={[size*0.18, size*0.55, size*0.2]} />
          <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function NinjaTower({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* floors */}
      {([0, 1, 2] as number[]).map((i) => (
        <group key={i} position={[0, i*size*0.55, 0]}>
          <mesh>
            <boxGeometry args={[size*(1.0-i*0.15), size*0.45, size*(0.8-i*0.1)]} />
            <meshStandardMaterial color={i%2===0?color:'#1a1a1a'} roughness={0.8} />
          </mesh>
          {/* eave */}
          <mesh position={[0, size*0.28, 0]}>
            <boxGeometry args={[size*(1.15-i*0.15), size*0.07, size*(0.95-i*0.1)]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* finial */}
      <mesh position={[0, size*2.02, 0]}>
        <coneGeometry args={[size*0.15, size*0.35, 4]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function TelegraphStation({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* building */}
      <mesh position={[0, size*0.4, 0]}>
        <boxGeometry args={[size*0.9, size*0.8, size*0.65]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*0.88, 0]} rotation={[0, Math.PI/4, 0]}>
        <coneGeometry args={[size*0.58, size*0.28, 4]} />
        <meshStandardMaterial color="#3d2810" roughness={0.85} />
      </mesh>
      {/* telegraph pole */}
      <mesh position={[size*0.58, size*0.6, 0]}>
        <cylinderGeometry args={[size*0.04, size*0.04, size*1.2, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* cross arm */}
      <mesh position={[size*0.58, size*1.1, 0]}>
        <boxGeometry args={[size*0.35, size*0.05, size*0.05]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* wires */}
      <mesh position={[size*0.35, size*1.08, 0]} rotation={[0,0,-0.15]}>
        <cylinderGeometry args={[size*0.008, size*0.008, size*0.5, 4]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function AnimeEnergyOrb({ pos, color, size }: P31) {
  const ref = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + Math.sin(t*3)*0.4
      ref.current.rotation.y = t * 1.5
    }
    if (innerRef.current) innerRef.current.rotation.x = t * 2.3
  })
  return (
    <group position={pos}>
      <mesh ref={ref}>
        <sphereGeometry args={[size*0.38, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.75} wireframe />
      </mesh>
      <mesh ref={innerRef}>
        <sphereGeometry args={[size*0.25, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

export function TakoYakiCart({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* cart frame */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*1.0, size*0.06, size*0.6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* umbrella pole */}
      <mesh position={[size*0.35, size*0.8, 0]}>
        <cylinderGeometry args={[size*0.03, size*0.03, size*0.65, 6]} />
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* umbrella canopy */}
      <mesh position={[size*0.35, size*1.18, 0]}>
        <coneGeometry args={[size*0.42, size*0.2, 8, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* takoyaki griddle */}
      <mesh position={[0, size*0.54, 0]}>
        <boxGeometry args={[size*0.72, size*0.12, size*0.42]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* balls */}
      {([[-0.2,0,0.08],[0,0,0.08],[0.2,0,0.08],[-0.2,0,-0.08],[0,0,-0.08]] as [number,number,number][]).map(([x,_y,z], i) => (
        <mesh key={i} position={[x*size, size*0.64, z*size]}>
          <sphereGeometry args={[size*0.07, 6, 6]} />
          <meshStandardMaterial color="#d4a06a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SteamFactory({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* main building */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*1.2, size*1.0, size*0.85]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* chimneys */}
      {([-0.35, 0.35] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.4, 0]}>
          <cylinderGeometry args={[size*0.1, size*0.12, size*0.85, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* smoke puffs */}
      {([-0.35, 0.35] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*1.95, 0]}>
          <sphereGeometry args={[size*0.12, 6, 6]} />
          <meshStandardMaterial color="#aaaaaa" transparent opacity={0.5} roughness={1} />
        </mesh>
      ))}
      {/* windows */}
      {([-0.3, 0, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.55, size*0.43]}>
          <boxGeometry args={[size*0.18, size*0.22, size*0.02]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.7} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

export function DojoMat({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* main mat */}
      <mesh position={[0, size*0.04, 0]}>
        <boxGeometry args={[size*1.4, size*0.08, size*0.9]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* border stripes */}
      {([-0.62, 0.62] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.09, 0]}>
          <boxGeometry args={[size*0.12, size*0.02, size*0.9]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      ))}
      {([-0.38, 0.38] as number[]).map((z, i) => (
        <mesh key={i} position={[0, size*0.09, z*size]}>
          <boxGeometry args={[size*1.4, size*0.02, size*0.1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function ZeppelinB31({ pos, color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.4) * size * 0.12
    }
  })
  return (
    <group ref={ref} position={pos}>
      {/* envelope */}
      <mesh position={[0, size*0.3, 0]}>
        <cylinderGeometry args={[size*0.3, size*0.3, size*1.5, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0, size*0.3, size*0.75]}>
        <coneGeometry args={[size*0.3, size*0.35, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* tail cone */}
      <mesh position={[0, size*0.3, -size*0.75]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[size*0.3, size*0.3, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* gondola */}
      <mesh position={[0, size*0.0, 0]}>
        <boxGeometry args={[size*0.3, size*0.18, size*0.7]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

export function BreakingBoards({ pos, color, size }: P31) {
  return (
    <group position={pos}>
      {/* stand */}
      {([-0.35, 0.35] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.35, 0]}>
          <boxGeometry args={[size*0.08, size*0.7, size*0.1]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
        </mesh>
      ))}
      {/* boards */}
      {([0.35, 0.15, -0.05] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size+size*0.35, 0]} rotation={[0,0,i*0.04]}>
          <boxGeometry args={[size*0.75, size*0.08, size*0.05]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
      {/* crack on top board */}
      <mesh position={[size*0.05, size*0.72, size*0.03]}>
        <boxGeometry args={[size*0.5, size*0.02, size*0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function TrainingBell({ pos, color, size }: P31) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.15
  })
  return (
    <group ref={ref} position={pos}>
      {/* rope */}
      <mesh position={[0, size*0.95, 0]}>
        <cylinderGeometry args={[size*0.025, size*0.025, size*0.4, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* bell body */}
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.12, size*0.25, size*0.35, 10, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.25} side={2} />
      </mesh>
      {/* bell top */}
      <mesh position={[0, size*0.82, 0]}>
        <sphereGeometry args={[size*0.12, 8, 5]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* clapper */}
      <mesh position={[0, size*0.56, 0]}>
        <sphereGeometry args={[size*0.06, 6, 6]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ── BATCH 32 · Enchanted Forest + Post-Apocalypse ─────────────────────────────

interface P32 { pos: [number,number,number]; color: string; size: number }

export function FairyRingB32({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.25
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a)*size*0.55, 0, Math.sin(a)*size*0.55]}>
            {/* mushroom cap */}
            <mesh position={[0, size*0.22, 0]}>
              <sphereGeometry args={[size*0.14, 7, 5]} />
              <meshStandardMaterial color={i%3===0?color:i%3===1?'#ff4488':'#ffcc00'} roughness={0.7} />
            </mesh>
            {/* stalk */}
            <mesh position={[0, size*0.1, 0]}>
              <cylinderGeometry args={[size*0.04, size*0.05, size*0.2, 6]} />
              <meshStandardMaterial color="#e8d5b0" roughness={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function GlowingTreeB32({ pos, color, size }: P32) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.4 + Math.sin(clock.getElapsedTime() * 1.8) * 0.25
  })
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.15, size*1.0, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* canopy layers */}
      {([0.9, 1.3, 1.65] as number[]).map((y, i) => (
        <mesh {...(i===1 && ref ? {ref} : {})} key={i} position={[0, y*size, 0]}>
          <sphereGeometry args={[size*(0.42-i*0.08), 8, 7]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function PixieDust({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * 1.2
      ref.current.position.y = pos[1] + Math.sin(t * 2) * size * 0.1
    }
  })
  return (
    <group ref={ref} position={pos}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r = size * (0.2 + (i%3)*0.1)
        const y = (i % 4) * size * 0.1
        return (
          <mesh key={i} position={[Math.cos(a)*r, y, Math.sin(a)*r]}>
            <sphereGeometry args={[size*0.035, 4, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

export function AncientTreeSpirit({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* massive trunk */}
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.32, size*0.42, size*1.3, 9]} />
        <meshStandardMaterial color="#4a3020" roughness={0.95} />
      </mesh>
      {/* face - eyes */}
      {([-0.12, 0.12] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.85, size*0.33]}>
          <sphereGeometry args={[size*0.07, 6, 6]} />
          <meshStandardMaterial color="#88ff44" emissive="#44ff00" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {/* canopy */}
      <mesh position={[0, size*1.5, 0]}>
        <sphereGeometry args={[size*0.7, 8, 7]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-size*0.3, size*1.8, 0]}>
        <sphereGeometry args={[size*0.45, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[size*0.32, size*1.75, 0]}>
        <sphereGeometry args={[size*0.42, 7, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function EnchantedMushroom({ pos, color, size }: P32) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.35 + Math.sin(clock.getElapsedTime() * 2.5) * 0.2
  })
  return (
    <group position={pos}>
      {/* stalk */}
      <mesh position={[0, size*0.35, 0]}>
        <cylinderGeometry args={[size*0.15, size*0.2, size*0.7, 8]} />
        <meshStandardMaterial color="#e8d5b0" roughness={0.8} />
      </mesh>
      {/* cap */}
      <mesh ref={ref} position={[0, size*0.78, 0]}>
        <sphereGeometry args={[size*0.45, 9, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.6} />
      </mesh>
      {/* spots */}
      {([0.2, 0.5, 0.8] as number[]).map((u, i) => {
        const a = u * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.3, size*0.88, Math.sin(a)*size*0.3]}>
            <sphereGeometry args={[size*0.07, 5, 5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

export function RuinedSkyscraper({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* lower section intact */}
      <mesh position={[0, size*0.5, 0]}>
        <boxGeometry args={[size*0.7, size*1.0, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* upper section broken */}
      <mesh position={[size*0.08, size*1.55, size*0.05]} rotation={[0,0,0.12]}>
        <boxGeometry args={[size*0.58, size*0.85, size*0.45]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* rebar sticking out */}
      {([[-0.15,2.2,0.1],[0.18,2.0,-0.05],[0,2.35,0.2]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[0.2*i, 0, 0.15*i]}>
          <cylinderGeometry args={[size*0.02, size*0.02, size*0.3, 4]} />
          <meshStandardMaterial color="#888" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* windows */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, (0.2+i*0.18)*size, size*0.28]}>
          <boxGeometry args={[size*0.12, size*0.1, size*0.02]} />
          <meshStandardMaterial color={i%2===0?"#334455":"#1a1a1a"} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export function RustedCarWreck({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* car body */}
      <mesh position={[0, size*0.28, 0]} rotation={[0,0,0.08]}>
        <boxGeometry args={[size*1.3, size*0.4, size*0.6]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.3} />
      </mesh>
      {/* cab */}
      <mesh position={[-size*0.15, size*0.58, 0]} rotation={[0,0,0.08]}>
        <boxGeometry args={[size*0.7, size*0.35, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.25} />
      </mesh>
      {/* wheels (flat) */}
      {([-0.45, 0.45] as number[]).map((x, i) =>
        ([-0.24, 0.24] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[x*size, size*0.08, z*size]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[size*0.15, size*0.08, 5, 8]} />
            <meshStandardMaterial color="#222" roughness={0.95} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function RadiationBarrel({ pos, color, size }: P32) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3
  })
  return (
    <group position={pos}>
      {/* barrel */}
      <mesh position={[0, size*0.35, 0]}>
        <cylinderGeometry args={[size*0.22, size*0.24, size*0.65, 10]} />
        <meshStandardMaterial color="#444" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* bands */}
      {([0.15, 0.35, 0.55] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y*size, 0]}>
          <torusGeometry args={[size*0.225, size*0.025, 5, 10]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* glow symbol */}
      <mesh ref={ref} position={[0, size*0.35, size*0.23]}>
        <cylinderGeometry args={[size*0.1, size*0.1, size*0.02, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export function ScavengerTower({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* base container */}
      <mesh position={[0, size*0.3, 0]}>
        <boxGeometry args={[size*0.7, size*0.6, size*0.7]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      {/* mid section */}
      <mesh position={[0, size*0.85, 0]}>
        <boxGeometry args={[size*0.58, size*0.45, size*0.58]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.2} />
      </mesh>
      {/* lookout platform */}
      <mesh position={[0, size*1.15, 0]}>
        <boxGeometry args={[size*0.8, size*0.08, size*0.8]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* searchlight */}
      <mesh position={[0, size*1.28, 0]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.06, size*0.22, 8]} />
        <meshStandardMaterial color="#ccc" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* glow beam */}
      <mesh position={[0, size*1.28, size*0.22]} rotation={[0.4, 0, 0]}>
        <sphereGeometry args={[size*0.08, 6, 6]} />
        <meshStandardMaterial color="#ffff88" emissive="#ffff44" emissiveIntensity={1.0} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

export function WastelandTurret({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.5
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh>
        <cylinderGeometry args={[size*0.28, size*0.32, size*0.3, 8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={ref} position={[0, size*0.25, 0]}>
        {/* turret body */}
        <mesh position={[0, size*0.18, 0]}>
          <cylinderGeometry args={[size*0.22, size*0.22, size*0.32, 8]} />
          <meshStandardMaterial color={color} metalness={0.65} roughness={0.35} />
        </mesh>
        {/* barrel */}
        <mesh position={[0, size*0.22, size*0.3]}>
          <cylinderGeometry args={[size*0.06, size*0.08, size*0.45, 6]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

export function CrystalCave32({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (m) m.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 1.5 + i) * 0.25
    })
  })
  return (
    <group position={pos}>
      {/* cave floor */}
      <mesh>
        <boxGeometry args={[size*1.2, size*0.12, size*0.9]} />
        <meshStandardMaterial color="#334455" roughness={0.9} />
      </mesh>
      {/* crystal spires */}
      <group ref={ref}>
        {([[-0.3,0,0.1],[0.25,0,-0.15],[0,0,0.3],[-0.15,0,-0.2],[0.35,0,0.2]] as [number,number,number][]).map(([x,_y,z], i) => (
          <mesh key={i} position={[x*size, size*(0.2+i*0.08), z*size]}>
            <coneGeometry args={[size*(0.08+i*0.015), size*(0.4+i*0.1), 4+i%2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} transparent opacity={0.85} roughness={0.2} metalness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function DruidStone({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* standing stone */}
      <mesh position={[0, size*0.6, 0]}>
        <boxGeometry args={[size*0.3, size*1.2, size*0.18]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* rune glow */}
      <mesh position={[0, size*0.65, size*0.1]}>
        <boxGeometry args={[size*0.18, size*0.08, size*0.02]} />
        <meshStandardMaterial color="#88ff44" emissive="#44ff00" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, size*0.5, size*0.1]}>
        <boxGeometry args={[size*0.06, size*0.22, size*0.02]} />
        <meshStandardMaterial color="#88ff44" emissive="#44ff00" emissiveIntensity={0.6} />
      </mesh>
      {/* moss patches */}
      <mesh position={[0, size*0.15, size*0.1]}>
        <boxGeometry args={[size*0.28, size*0.04, size*0.04]} />
        <meshStandardMaterial color="#336622" roughness={0.95} />
      </mesh>
    </group>
  )
}

export function BunkerEntrance({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* mound */}
      <mesh position={[0, size*0.15, 0]}>
        <cylinderGeometry args={[size*0.7, size*0.85, size*0.35, 10]} />
        <meshStandardMaterial color="#556644" roughness={0.95} />
      </mesh>
      {/* blast door */}
      <mesh position={[0, size*0.15, size*0.65]}>
        <boxGeometry args={[size*0.55, size*0.45, size*0.08]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* door wheel */}
      <mesh position={[0, size*0.15, size*0.7]}>
        <torusGeometry args={[size*0.12, size*0.03, 6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* hazard stripe */}
      <mesh position={[0, size*0.36, size*0.7]}>
        <boxGeometry args={[size*0.55, size*0.05, size*0.03]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function WisteriaArch({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* stone arch */}
      <mesh position={[0, size*0.85, 0]}>
        <torusGeometry args={[size*0.5, size*0.1, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#888877" roughness={0.9} />
      </mesh>
      {/* posts */}
      {([-0.5, 0.5] as number[]).map((x, i) => (
        <mesh key={i} position={[x*size, size*0.45, 0]}>
          <cylinderGeometry args={[size*0.1, size*0.12, size*0.9, 8]} />
          <meshStandardMaterial color="#888877" roughness={0.9} />
        </mesh>
      ))}
      {/* hanging blossoms */}
      {([[-0.35,1.15],[-0.1,1.28],[0.15,1.2],[0.38,1.1]] as [number,number][]).map(([x,y], i) => (
        <mesh key={i} position={[x*size, y*size, 0]}>
          <sphereGeometry args={[size*(0.1+i*0.015), 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export function ApocSolarPanel({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.3
  })
  return (
    <group ref={ref} position={pos}>
      {/* pole */}
      <mesh position={[0, size*0.5, 0]}>
        <cylinderGeometry args={[size*0.05, size*0.07, size*1.0, 6]} />
        <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* panel array */}
      <mesh position={[0, size*1.08, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[size*0.85, size*0.06, size*0.55]} />
        <meshStandardMaterial color="#334466" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* panel cells */}
      <mesh position={[0, size*1.1, 0]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[size*0.8, size*0.04, size*0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function WillowTree({ pos, color, size }: P32) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.children.slice(1).forEach((c, i) => {
      c.rotation.z = Math.sin(clock.getElapsedTime() * 0.8 + i) * 0.12
    })
  })
  return (
    <group ref={ref} position={pos}>
      {/* trunk */}
      <mesh position={[0, size*0.65, 0]}>
        <cylinderGeometry args={[size*0.1, size*0.15, size*1.3, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
      </mesh>
      {/* drooping branches */}
      {([[-0.25,1.5,0],[0.2,1.45,0.1],[-0.05,1.55,-0.15],[0.3,1.4,-0.05],[-0.3,1.38,0.15]] as [number,number,number][]).map(([x,y,z], i) => (
        <mesh key={i} position={[x*size, y*size, z*size]}>
          <cylinderGeometry args={[size*0.015, size*0.025, size*(0.55+i*0.06), 5]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function PostApocTelephone({ pos, color, size }: P32) {
  return (
    <group position={pos}>
      {/* booth frame */}
      <mesh position={[0, size*0.7, 0]}>
        <boxGeometry args={[size*0.5, size*1.4, size*0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* glass panels (broken) */}
      <mesh position={[0, size*0.75, size*0.26]}>
        <boxGeometry args={[size*0.38, size*0.8, size*0.04]} />
        <meshStandardMaterial color="#88aabb" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* cracks */}
      <mesh position={[size*0.1, size*0.65, size*0.28]}>
        <boxGeometry args={[size*0.22, size*0.03, size*0.02]} />
        <meshStandardMaterial color="#334" roughness={0.9} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size*1.45, 0]}>
        <boxGeometry args={[size*0.55, size*0.1, size*0.55]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* vines */}
      <mesh position={[-size*0.27, size*0.85, 0]}>
        <cylinderGeometry args={[size*0.02, size*0.025, size*0.6, 5]} />
        <meshStandardMaterial color="#336622" roughness={0.9} />
      </mesh>
    </group>
  )
}
