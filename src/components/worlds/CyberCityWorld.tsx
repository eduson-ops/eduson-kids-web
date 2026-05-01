import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import NPC from '../NPC'

// ─── Palette ─────────────────────────────────────────────────────
const ASPHALT = '#111118'
const CONCRETE = '#1e1e2e'
const BUILDING_DARK = '#0d0d1a'
const NEON_PINK = '#ff5ab1'
const NEON_BLUE = '#4c97ff'
const NEON_PURPLE = '#c879ff'
const NEON_YELLOW = '#ffd644'
const NEON_CYAN = '#48e0ff'
const NEON_RED = '#ff5464'
const GLASS = '#88d4ff'

// ─── CyberBuilding ────────────────────────────────────────────────
// Solid building block with neon horizontal strips on faces.
interface BuildingProps {
  pos: [number, number, number]
  w: number
  d: number
  h: number
  neon: string
  stripes?: number
}

function CyberBuilding({ pos, w, d, h, neon, stripes = 4 }: BuildingProps) {
  const [bx, , bz] = pos
  const topY = h
  return (
    <>
      {/* Main body */}
      <RigidBody type="fixed" colliders="cuboid" position={[bx, h / 2, bz]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={BUILDING_DARK} roughness={0.7} metalness={0.4} />
        </mesh>
      </RigidBody>

      {/* Neon horizontal stripes */}
      {Array.from({ length: stripes }, (_, i) => {
        const frac = (i + 1) / (stripes + 1)
        const y = frac * h
        return (
          <mesh key={i} position={[bx, y, bz]}>
            <boxGeometry args={[w + 0.12, 0.22, d + 0.12]} />
            <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={1.2} roughness={0.2} />
          </mesh>
        )
      })}

      {/* Rooftop edge strip */}
      <mesh position={[bx, topY + 0.12, bz]}>
        <boxGeometry args={[w + 0.1, 0.25, d + 0.1]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={1.8} roughness={0.2} />
      </mesh>

      {/* Window grid on south face (purely decorative) */}
      {Array.from({ length: Math.floor(h / 3) }, (_, row) =>
        Array.from({ length: Math.floor(w / 3) }, (_, col) => {
          const wx = bx - w / 2 + 1.5 + col * 3
          const wy = 1.5 + row * 3
          if (wy > h - 1) return null
          return (
            <mesh key={`w${row}-${col}`} position={[wx, wy, bz + d / 2 + 0.02]}>
              <boxGeometry args={[1.2, 1.5, 0.05]} />
              <meshStandardMaterial
                color={GLASS}
                emissive={neon}
                emissiveIntensity={0.2 + Math.sin(row * 1.3 + col * 0.9) * 0.15}
                transparent
                opacity={0.7}
              />
            </mesh>
          )
        })
      )}
    </>
  )
}

// ─── Elevated walkway ─────────────────────────────────────────────
function SkyBridge({
  pos,
  length,
  axis = 'x',
  neon = NEON_PINK,
}: {
  pos: [number, number, number]
  length: number
  axis?: 'x' | 'z'
  neon?: string
}) {
  const [cx, cy, cz] = pos
  const w = axis === 'x' ? length : 4
  const d = axis === 'x' ? 4 : length
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={pos}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, 0.35, d]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.5} />
        </mesh>
      </RigidBody>
      {/* Neon edge */}
      <mesh position={[cx, cy + 0.19, cz]}>
        <boxGeometry args={[w + 0.1, 0.1, d + 0.1]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={1.5} />
      </mesh>
      {/* Railings */}
      {axis === 'x' ? (
        <>
          <RigidBody type="fixed" colliders="cuboid" position={[cx, cy + 0.6, cz + 2.15]}>
            <mesh castShadow>
              <boxGeometry args={[w, 1.2, 0.2]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.4} />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" colliders="cuboid" position={[cx, cy + 0.6, cz - 2.15]}>
            <mesh castShadow>
              <boxGeometry args={[w, 1.2, 0.2]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.4} />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <>
          <RigidBody type="fixed" colliders="cuboid" position={[cx + 2.15, cy + 0.6, cz]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 1.2, d]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.4} />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" colliders="cuboid" position={[cx - 2.15, cy + 0.6, cz]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 1.2, d]} />
              <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.4} />
            </mesh>
          </RigidBody>
        </>
      )}
    </>
  )
}

// ─── Skyscraper spiral ledges ─────────────────────────────────────
// 8 ledges spiraling around the final tower (x=0, z=-95, h=32)
function SkyscraperSpiral() {
  // Tower is 18×18 wide, so faces at ±9 in x/z.
  // Ledges spiral: S / E / N / W repeating, each 4 units higher.
  const ledges: Array<{ pos: [number, number, number]; size: [number, number, number]; neon: string }> = [
    { pos: [0, 4.25, -84],   size: [18, 0.4, 3], neon: NEON_PINK },    // south face y=4
    { pos: [10, 8.25, -95],  size: [3, 0.4, 18], neon: NEON_BLUE },    // east face y=8
    { pos: [0, 12.25, -106], size: [18, 0.4, 3], neon: NEON_PURPLE },  // north face y=12
    { pos: [-10, 16.25, -95], size: [3, 0.4, 18], neon: NEON_CYAN },   // west face y=16
    { pos: [0, 20.25, -84],  size: [18, 0.4, 3], neon: NEON_PINK },    // south face y=20
    { pos: [10, 24.25, -95], size: [3, 0.4, 18], neon: NEON_BLUE },    // east face y=24
    { pos: [0, 28.25, -106], size: [18, 0.4, 3], neon: NEON_YELLOW },  // north face y=28
    { pos: [-10, 32.25, -95], size: [3, 0.4, 18], neon: NEON_CYAN },   // west face y=32
  ]
  return (
    <>
      {ledges.map((l, i) => (
        <group key={i}>
          <RigidBody type="fixed" colliders="cuboid" position={l.pos}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={l.size} />
              <meshStandardMaterial color={CONCRETE} roughness={0.6} metalness={0.5} />
            </mesh>
          </RigidBody>
          <mesh position={[l.pos[0], l.pos[1] + 0.21, l.pos[2]]}>
            <boxGeometry args={[l.size[0] + 0.1, 0.1, l.size[2] + 0.1]} />
            <meshStandardMaterial color={l.neon} emissive={l.neon} emissiveIntensity={1.6} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Animated billboard / sign ────────────────────────────────────
function NeonSign({
  pos,
  size,
  color,
  rotY = 0,
}: {
  pos: [number, number, number]
  size: [number, number]
  color: string
  rotY?: number
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.5
    if (mat.current) mat.current.emissiveIntensity = 1.0 + Math.sin(phase.current) * 0.6
  })
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[size[0], size[1], 0.15]} />
        <meshStandardMaterial color={BUILDING_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[size[0] - 0.3, size[1] - 0.3, 0.08]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.92} />
      </mesh>
    </group>
  )
}

// ─── Moving billboard crane (obstacle) ───────────────────────────
function MovingBillboard({ startX, y, z }: { startX: number; y: number; z: number }) {
  const grp = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 0.45
    if (grp.current) grp.current.position.x = startX + Math.sin(phase.current) * 6
  })
  return (
    <group ref={grp} position={[startX, y, z]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[6, 0.4, 1]} />
          <meshStandardMaterial color={NEON_PINK} emissive={NEON_PINK} emissiveIntensity={0.8} roughness={0.4} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ─── Street grid (dark asphalt with lane markings) ────────────────
function Streets() {
  return (
    <>
      {/* Main asphalt plane */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -55]}>
        <mesh receiveShadow>
          <boxGeometry args={[140, 0.5, 130]} />
          <meshStandardMaterial color={ASPHALT} roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Lane markings (decorative) */}
      {[-10, 10].map((x, i) => (
        <mesh key={i} position={[x, 0.01, -55]}>
          <boxGeometry args={[0.25, 0.01, 100]} />
          <meshStandardMaterial color="#333355" emissive="#222244" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[-30, -60, -90].map((z, i) => (
        <mesh key={i} position={[0, 0.01, z]}>
          <boxGeometry args={[100, 0.01, 0.25]} />
          <meshStandardMaterial color="#333355" emissive="#222244" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </>
  )
}

// ─── City walls ───────────────────────────────────────────────────
function CityBounds() {
  const walls: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, 3, -122], size: [140, 6, 2] },
    { pos: [0, 3, 14], size: [140, 6, 2] },
    { pos: [-72, 3, -55], size: [2, 6, 136] },
    { pos: [72, 3, -55], size: [2, 6, 136] },
  ]
  return (
    <>
      {walls.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={CONCRETE} roughness={0.9} metalness={0.2} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function CyberCityWorld() {
  const bg = useMemo(() => <color attach="background" args={['#080810']} />, [])

  // Override ambient for night-time city
  const nightLights = useMemo(() => (
    <>
      <ambientLight intensity={0.35} />
      <pointLight color={NEON_PINK} intensity={2} distance={40} position={[-32, 22, -12]} />
      <pointLight color={NEON_BLUE} intensity={2} distance={40} position={[0, 26, -40]} />
      <pointLight color={NEON_PURPLE} intensity={1.5} distance={35} position={[32, 22, -12]} />
      <pointLight color={NEON_CYAN} intensity={2.5} distance={50} position={[0, 34, -95]} />
      <pointLight color={NEON_PINK} intensity={1.5} distance={30} position={[-32, 18, -65]} />
      <pointLight color={NEON_YELLOW} intensity={1.5} distance={30} position={[32, 20, -65]} />
    </>
  ), [])

  return (
    <>
      {bg}
      {nightLights}
      <Streets />
      <CityBounds />

      {/* ═══ LEFT COLUMN (x = -32) ═══ */}
      <CyberBuilding pos={[-32, 0, -12]} w={12} d={12} h={22} neon={NEON_PINK} stripes={5} />
      <CyberBuilding pos={[-32, 0, -40]} w={12} d={14} h={14} neon={NEON_BLUE} stripes={3} />
      <CyberBuilding pos={[-32, 0, -65]} w={14} d={12} h={18} neon={NEON_PINK} stripes={4} />

      {/* ═══ CENTER COLUMN (x = 0) ═══ */}
      <CyberBuilding pos={[0, 0, -12]} w={10} d={10} h={12} neon={NEON_BLUE} stripes={3} />
      <CyberBuilding pos={[0, 0, -40]} w={12} d={12} h={26} neon={NEON_PURPLE} stripes={6} />
      <CyberBuilding pos={[0, 0, -65]} w={10} d={10} h={10} neon={NEON_YELLOW} stripes={2} />

      {/* ═══ RIGHT COLUMN (x = +32) ═══ */}
      <CyberBuilding pos={[32, 0, -12]} w={12} d={12} h={18} neon={NEON_BLUE} stripes={4} />
      <CyberBuilding pos={[32, 0, -40]} w={12} d={12} h={16} neon={NEON_PINK} stripes={4} />
      <CyberBuilding pos={[32, 0, -65]} w={14} d={14} h={20} neon={NEON_PURPLE} stripes={5} />

      {/* ═══ LANDMARK SKYSCRAPER (final tower) ═══ */}
      {/* pos=[0, 0, -95], w=18, d=18, h=36 */}
      <CyberBuilding pos={[0, 0, -95]} w={18} d={18} h={36} neon={NEON_RED} stripes={8} />
      <SkyscraperSpiral />

      {/* Skyscraper roof platform + goal */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 36.2, -95]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[18, 0.4, 18]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.5} metalness={0.5} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 36.42, -95]}>
        <boxGeometry args={[17.5, 0.1, 17.5]} />
        <meshStandardMaterial color={NEON_RED} emissive={NEON_RED} emissiveIntensity={2} />
      </mesh>

      {/* ═══ BACKGROUND MEGA-TOWERS (no physics, just scenery) ═══ */}
      <mesh position={[-58, 22, -50]} castShadow>
        <boxGeometry args={[12, 44, 12]} />
        <meshStandardMaterial color={BUILDING_DARK} roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[-58, 22, -50]}>
        <boxGeometry args={[12.2, 44.4, 12.2]} />
        <meshStandardMaterial color={NEON_PURPLE} emissive={NEON_PURPLE} emissiveIntensity={0.3} transparent opacity={0.12} />
      </mesh>
      <mesh position={[58, 20, -60]} castShadow>
        <boxGeometry args={[12, 40, 12]} />
        <meshStandardMaterial color={BUILDING_DARK} roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[58, 20, -60]}>
        <boxGeometry args={[12.2, 40.4, 12.2]} />
        <meshStandardMaterial color={NEON_BLUE} emissive={NEON_BLUE} emissiveIntensity={0.3} transparent opacity={0.12} />
      </mesh>

      {/* ═══ ELEVATED BRIDGES (rooftop parkour) ═══ */}
      {/* L1 bridges at y=14: left-col(h=14) ↔ center-col(h=26) rooftops side */}
      <SkyBridge pos={[-16, 14.35, -40]} length={22} axis="x" neon={NEON_PINK} />
      <SkyBridge pos={[16, 14.35, -40]} length={22} axis="x" neon={NEON_BLUE} />
      {/* L2 bridges at y=10: left-col(h=18) ↔ center(h=10), right(h=16) */}
      <SkyBridge pos={[-16, 10.35, -12]} length={22} axis="x" neon={NEON_CYAN} />
      <SkyBridge pos={[16, 10.35, -12]} length={22} axis="x" neon={NEON_PURPLE} />
      {/* North bridge at y=10: left(h=18) side to skyscraper approach */}
      <SkyBridge pos={[-16, 10.35, -65]} length={22} axis="x" neon={NEON_PINK} />
      <SkyBridge pos={[16, 10.35, -65]} length={22} axis="x" neon={NEON_YELLOW} />
      {/* North-south bridge: center-col z=-65 top → skyscraper south ledge */}
      <SkyBridge pos={[0, 10.35, -77]} length={14} axis="z" neon={NEON_CYAN} />

      {/* ═══ NEON SIGNS ═══ */}
      <NeonSign pos={[-32, 20, -5.95]} size={[8, 4]} color={NEON_PINK} />
      <NeonSign pos={[32, 16, -5.95]} size={[8, 3]} color={NEON_BLUE} />
      <NeonSign pos={[-32, 12, -33.95]} size={[8, 3]} color={NEON_PURPLE} rotY={Math.PI} />
      <NeonSign pos={[0, 24, -5.95]} size={[6, 3]} color={NEON_YELLOW} />
      <NeonSign pos={[0, 10, -58.95]} size={[6, 2.5]} color={NEON_CYAN} />
      <NeonSign pos={[9.05, 20, -95]} size={[5, 3]} color={NEON_RED} rotY={-Math.PI / 2} />
      <NeonSign pos={[-9.05, 18, -95]} size={[5, 3]} color={NEON_RED} rotY={Math.PI / 2} />

      {/* ═══ MOVING BILLBOARD OBSTACLES (mid-air parkour hazard) ═══ */}
      <MovingBillboard startX={0} y={5} z={-20} />
      <MovingBillboard startX={0} y={8} z={-50} />

      {/* ═══ ENEMIES ═══ */}
      {/* Street level */}
      <Enemy pos={[-16, 1.5, -12]} patrolX={10} color={NEON_PINK} />
      <Enemy pos={[16, 1.5, -40]} patrolX={8} color={NEON_BLUE} />
      <Enemy pos={[-16, 1.5, -65]} patrolX={8} color={NEON_PURPLE} />
      <Enemy pos={[0, 1.5, -80]} patrolX={6} color={NEON_RED} />
      {/* Rooftop guards */}
      <Enemy pos={[-32, 23.5, -12]} patrolX={4} color={NEON_PINK} />
      <Enemy pos={[0, 27.5, -40]} patrolX={4} color={NEON_PURPLE} />
      {/* Skyscraper roof boss */}
      <GltfMonster which="cactoro" pos={[0, 36.5, -95]} scale={1.4} rotY={Math.PI} animation="Wave" />

      {/* NPCs on streets */}
      <NPC pos={[-20, 0, -30]} label="КИБЕР-ШОП" />
      <NPC pos={[20, 0, -50]} label="ХАКЕР" />

      {/* ═══ COINS ═══ */}
      {/* Street level */}
      <Coin pos={[-16, 1.5, -6]} />
      <Coin pos={[16, 1.5, -6]} />
      <Coin pos={[0, 1.5, -25]} />
      <Coin pos={[-24, 1.5, -40]} />
      <Coin pos={[24, 1.5, -40]} />
      <Coin pos={[0, 1.5, -55]} />
      <Coin pos={[-24, 1.5, -65]} />
      <Coin pos={[24, 1.5, -65]} />
      <Coin pos={[0, 1.5, -75]} />
      {/* Elevated bridges */}
      <Coin pos={[-22, 15.5, -40]} />
      <Coin pos={[-10, 15.5, -40]} />
      <Coin pos={[10, 15.5, -40]} />
      <Coin pos={[22, 15.5, -40]} />
      <Coin pos={[-10, 11.5, -12]} />
      <Coin pos={[10, 11.5, -12]} />
      <Coin pos={[0, 11.5, -77]} />
      {/* Rooftops */}
      <Coin pos={[-32, 23.5, -12]} />
      <Coin pos={[0, 27.5, -40]} />
      <Coin pos={[32, 17.5, -12]} />
      {/* Skyscraper spiral */}
      <Coin pos={[0, 5.5, -84]} />
      <Coin pos={[10, 9.5, -95]} />
      <Coin pos={[0, 13.5, -106]} />
      <Coin pos={[-10, 17.5, -95]} />
      <Coin pos={[0, 21.5, -84]} />
      <Coin pos={[10, 25.5, -95]} />
      <Coin pos={[0, 29.5, -106]} />
      <Coin pos={[-10, 33.5, -95]} />
      {/* Roof */}
      <Coin pos={[-5, 37.5, -95]} />
      <Coin pos={[5, 37.5, -95]} />
      <Coin pos={[0, 37.5, -90]} value={5} />

      {/* ═══ GOAL ═══ */}
      <GoalTrigger
        pos={[0, 39, -95]}
        size={[18, 4, 18]}
        result={{
          kind: 'win',
          label: 'ВЕРШИНА МЕГАПОЛИСА!',
          subline: 'Ты покорил небоскрёб и захватил КиберГород!',
        }}
      />
    </>
  )
}

export const CYBER_SPAWN: [number, number, number] = [0, 3, 7]
