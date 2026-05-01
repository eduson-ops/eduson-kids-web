import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BackSide } from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'

// ─── Palette ─────────────────────────────────────────────────────
const HULL = '#0b0b22'
const HULL_LIGHT = '#141432'
const PANEL = '#1a1a42'
const METAL = '#22223a'
const NEON_BLUE = '#4c97ff'
const NEON_PURPLE = '#c879ff'
const NEON_RED = '#ff5464'
const NEON_CYAN = '#48e0ff'
const NEON_YELLOW = '#ffd644'
const WARN = '#ff8c1a'
const VOID = '#030310'

// ─── Basic building blocks ────────────────────────────────────────
function HullPlate({
  pos,
  size,
  color = HULL,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.6} />
      </mesh>
    </RigidBody>
  )
}

// Decorative neon strip (no physics)
function NeonStrip({
  pos,
  size,
  color = NEON_BLUE,
  intensity = 1.4,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
  intensity?: number
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} roughness={0.2} />
    </mesh>
  )
}

// Low barrier / guard rail on platform edge
function Railing({
  pos,
  size,
}: {
  pos: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={METAL} roughness={0.4} metalness={0.8} />
      </mesh>
    </RigidBody>
  )
}

// Support column below a platform
function Column({ pos, height }: { pos: [number, number, number]; height: number }) {
  return (
    <mesh position={[pos[0], pos[1] - height / 2, pos[2]]}>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.7} />
    </mesh>
  )
}

// ─── Platform with full railing + neon grid ───────────────────────
function StationPlatform({
  pos,
  w,
  d,
  neonColor = NEON_BLUE,
  colHeight = 6,
  openSide = 'none',
}: {
  pos: [number, number, number]
  w: number
  d: number
  neonColor?: string
  colHeight?: number
  openSide?: 'north' | 'south' | 'east' | 'west' | 'none'
}) {
  const [cx, cy, cz] = pos
  const hw = w / 2
  const hd = d / 2
  const rH = 0.9
  const rT = 0.25

  return (
    <>
      {/* Floor plate */}
      <HullPlate pos={pos} size={[w, 0.4, d]} color={HULL_LIGHT} />

      {/* Neon grid on surface */}
      <NeonStrip pos={[cx, cy + 0.21, cz]} size={[w - 0.4, 0.04, 0.12]} color={neonColor} intensity={1.0} />
      <NeonStrip pos={[cx, cy + 0.21, cz]} size={[0.12, 0.04, d - 0.4]} color={neonColor} intensity={1.0} />

      {/* Railings on 4 sides (skip openSide) */}
      {openSide !== 'south' && (
        <Railing pos={[cx, cy + rH / 2, cz + hd + rT / 2]} size={[w, rH, rT]} />
      )}
      {openSide !== 'north' && (
        <Railing pos={[cx, cy + rH / 2, cz - hd - rT / 2]} size={[w, rH, rT]} />
      )}
      {openSide !== 'east' && (
        <Railing pos={[cx + hw + rT / 2, cy + rH / 2, cz]} size={[rT, rH, d]} />
      )}
      {openSide !== 'west' && (
        <Railing pos={[cx - hw - rT / 2, cy + rH / 2, cz]} size={[rT, rH, d]} />
      )}

      {/* Corner support columns */}
      <Column pos={[cx + hw - 0.6, cy, cz + hd - 0.6]} height={colHeight} />
      <Column pos={[cx - hw + 0.6, cy, cz + hd - 0.6]} height={colHeight} />
      <Column pos={[cx + hw - 0.6, cy, cz - hd + 0.6]} height={colHeight} />
      <Column pos={[cx - hw + 0.6, cy, cz - hd + 0.6]} height={colHeight} />
    </>
  )
}

// ─── Bridge walkway ───────────────────────────────────────────────
function Bridge({
  pos,
  length,
  axis = 'z',
  neonColor = NEON_BLUE,
}: {
  pos: [number, number, number]
  length: number
  axis?: 'x' | 'z'
  neonColor?: string
}) {
  const [cx, cy, cz] = pos
  const isZ = axis === 'z'
  const w = isZ ? 3.5 : length
  const d = isZ ? length : 3.5
  const rH = 0.65
  const rT = 0.2

  return (
    <>
      <HullPlate pos={pos} size={[w, 0.3, d]} color={PANEL} />
      <NeonStrip pos={[cx, cy + 0.16, cz]} size={[isZ ? 0.12 : w - 0.2, 0.04, isZ ? d - 0.2 : 0.12]} color={neonColor} intensity={0.9} />
      {/* Side rails */}
      {isZ ? (
        <>
          <Railing pos={[cx + 1.9, cy + rH / 2, cz]} size={[rT, rH, length]} />
          <Railing pos={[cx - 1.9, cy + rH / 2, cz]} size={[rT, rH, length]} />
        </>
      ) : (
        <>
          <Railing pos={[cx, cy + rH / 2, cz + 1.9]} size={[length, rH, rT]} />
          <Railing pos={[cx, cy + rH / 2, cz - 1.9]} size={[length, rH, rT]} />
        </>
      )}
    </>
  )
}

// ─── Steps (connecting two height levels) ─────────────────────────
function StepsUp({
  start,
  count,
  dir = 'north',
  risePerStep = 1,
  runPerStep = 1.8,
}: {
  start: [number, number, number]
  count: number
  dir?: 'north' | 'south'
  risePerStep?: number
  runPerStep?: number
}) {
  const dz = dir === 'north' ? -runPerStep : runPerStep
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const pos: [number, number, number] = [start[0], start[1] + i * risePerStep + risePerStep / 2, start[2] + i * dz]
        return (
          <RigidBody key={i} type="fixed" colliders="cuboid" position={pos}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4, risePerStep, runPerStep]} />
              <meshStandardMaterial color={PANEL} roughness={0.5} metalness={0.5} />
            </mesh>
          </RigidBody>
        )
      })}
    </>
  )
}

// ─── Moving platform ──────────────────────────────────────────────
function MovingPlatform({
  startPos,
  travel,
  axis = 'x',
  speed = 0.55,
}: {
  startPos: [number, number, number]
  travel: number
  axis?: 'x' | 'z'
  speed?: number
}) {
  const grp = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * speed
    if (!grp.current) return
    const offset = Math.sin(phase.current) * travel
    if (axis === 'x') grp.current.position.x = startPos[0] + offset
    else grp.current.position.z = startPos[2] + offset
  })
  return (
    <group ref={grp} position={startPos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 0.4, 5]} />
          <meshStandardMaterial color={NEON_BLUE} emissive={NEON_BLUE} emissiveIntensity={0.3} roughness={0.4} metalness={0.6} />
        </mesh>
      </RigidBody>
      <NeonStrip pos={[0, 0.21, 0]} size={[4.5, 0.05, 4.5]} color={NEON_CYAN} intensity={1.2} />
    </group>
  )
}

// ─── Warning beacon ───────────────────────────────────────────────
function Beacon({ pos, color = WARN }: { pos: [number, number, number]; color?: string }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 3
    if (mat.current) mat.current.emissiveIntensity = 0.5 + Math.sin(phase.current) * 0.5
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <pointLight color={color} intensity={0.6} distance={5} position={[0, 0.9, 0]} />
    </group>
  )
}

// ─── StarField ────────────────────────────────────────────────────
function StarField() {
  const positions = useMemo(() => {
    const pts: Array<[number, number, number]> = []
    const RADIUS = 200
    for (let i = 0; i < 600; i++) {
      // Random point inside sphere — rejection-sample for uniform distribution
      let x = 0, y = 0, z = 0
      do {
        x = (Math.random() * 2 - 1) * RADIUS
        y = (Math.random() * 2 - 1) * RADIUS
        z = (Math.random() * 2 - 1) * RADIUS
      } while (x * x + y * y + z * z > RADIUS * RADIUS)
      pts.push([x, y, z])
    }
    return pts
  }, [])

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 4, 4]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </>
  )
}

// ─── Nebula shader ────────────────────────────────────────────────
const NEBULA_VERTEX = `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NEBULA_FRAGMENT = `
  varying vec3 vDir;

  // Hash function
  float hash(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  // 3-octave value noise
  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 3; i++) {
      vec3 i3 = floor(p * freq);
      vec3 f3 = fract(p * freq);
      vec3 u = f3 * f3 * (3.0 - 2.0 * f3);
      val += amp * mix(
        mix(mix(hash(i3),              hash(i3 + vec3(1,0,0)), u.x),
            mix(hash(i3 + vec3(0,1,0)), hash(i3 + vec3(1,1,0)), u.x), u.y),
        mix(mix(hash(i3 + vec3(0,0,1)), hash(i3 + vec3(1,0,1)), u.x),
            mix(hash(i3 + vec3(0,1,1)), hash(i3 + vec3(1,1,1)), u.x), u.y),
        u.z
      );
      amp *= 0.5;
      freq *= 2.0;
    }
    return val;
  }

  void main() {
    vec3 dir = normalize(vDir);

    // Base nebula noise — use direction as 3D sample point
    float n1 = fbm(dir * 2.8);
    float n2 = fbm(dir * 5.2 + vec3(1.7, 0.9, 2.3));
    float n3 = fbm(dir * 9.1 + vec3(3.1, 1.4, 0.7));

    // Deep purple base
    vec3 deepPurple = vec3(0.102, 0.0,   0.251); // #1a0040
    // Blue cloud
    vec3 blue       = vec3(0.0,   0.188, 0.502); // #003080
    // Pink streak
    vec3 pink       = vec3(0.251, 0.0,   0.188); // #400030

    // Layer the colours with noise weights
    vec3 col = deepPurple;
    col = mix(col, blue,  smoothstep(0.38, 0.65, n1));
    col = mix(col, pink,  smoothstep(0.60, 0.80, n2) * 0.6);
    // Bright wisps from 3rd octave
    col += vec3(0.08, 0.04, 0.14) * smoothstep(0.55, 0.85, n3);

    // Keep it dark — nebula is background atmosphere, not a lamp
    col = clamp(col, 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`

function NebulaSphere() {
  return (
    <mesh renderOrder={-9} frustumCulled={false}>
      <sphereGeometry args={[350, 48, 24]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        vertexShader={NEBULA_VERTEX}
        fragmentShader={NEBULA_FRAGMENT}
      />
    </mesh>
  )
}

// ─── Void floor (deep pit visual) ────────────────────────────────
function VoidFloor() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -40.25, -65]}>
      <mesh>
        <boxGeometry args={[160, 0.5, 200]} />
        <meshStandardMaterial color={VOID} roughness={1} />
      </mesh>
    </RigidBody>
  )
}

// ─── Asteroid belt ────────────────────────────────────────────────
interface AsteroidData {
  angle: number
  radius: number
  y: number
  size: number
  speed: number
  color: string
}

function AsteroidBelt() {
  const asteroids = useMemo<AsteroidData[]>(() => {
    const colors = ['#887766', '#998877', '#776655', '#aa9988', '#665544']
    return Array.from({ length: 15 }).map((_, i) => ({
      angle: (i / 15) * Math.PI * 2 + Math.random() * 0.4,
      radius: 40 + Math.random() * 20,
      y: 5 + Math.random() * 15,
      size: 0.3 + Math.random() * 0.5,
      speed: 0.05 + Math.random() * 0.1,
      color: colors[i % colors.length] ?? '#887766',
    }))
  }, [])

  const grpRef = useRef<THREE.Group>(null!)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const angles = useRef(asteroids.map((a) => a.angle))

  useFrame((_, dt) => {
    asteroids.forEach((a, i) => {
      angles.current[i]! += a.speed * dt
      const mesh = meshRefs.current[i]
      if (mesh) {
        mesh.position.set(
          Math.cos(angles.current[i]!) * a.radius,
          a.y,
          Math.sin(angles.current[i]!) * a.radius
        )
        mesh.rotation.x += dt * 0.3
        mesh.rotation.z += dt * 0.2
      }
    })
  })

  return (
    <group ref={grpRef}>
      {asteroids.map((a, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[Math.cos(a.angle) * a.radius, a.y, Math.sin(a.angle) * a.radius]}
        >
          <dodecahedronGeometry args={[a.size, 0]} />
          <meshBasicMaterial color={a.color} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Station warning lights ───────────────────────────────────────
// Placed at corners / key points of the station structure
const WARNING_LIGHT_POSITIONS: Array<[number, number, number]> = [
  [11, 1.5, 9],    // spawn platform corner
  [-11, 1.5, -11], // spawn platform corner
  [9, 1.5, -43],   // Alpha module corner
  [-9, 8.5, -93],  // Beta module corner
]

function StationWarningLights() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const lightRefs = useRef<(THREE.PointLight | null)[]>([])
  const phase = useRef(0)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Blink pattern: sin(t*3) > 0.7 → visible
    WARNING_LIGHT_POSITIONS.forEach((_, i) => {
      const mesh = meshRefs.current[i]
      const light = lightRefs.current[i]
      // Stagger blink per light
      const phaseOffset = i * (Math.PI / 2)
      const isOn = Math.sin(t * 3 + phaseOffset) > 0.7
      if (mesh) mesh.visible = isOn
      if (light) light.visible = isOn
    })
    phase.current = t
  })

  return (
    <>
      {WARNING_LIGHT_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh ref={(el) => { meshRefs.current[i] = el }}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#ff4400' : '#ff8800'} />
          </mesh>
          <pointLight
            ref={(el) => { lightRefs.current[i] = el }}
            color={i % 2 === 0 ? '#ff4400' : '#ff8800'}
            intensity={1.5}
            distance={10}
          />
        </group>
      ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function SpaceStationWorld() {
  return (
    <>
      {/* Dark space sky gradient */}
      <GradientSky top="#000510" bottom="#050020" radius={440} />
      {/* Nebula colour layer */}
      <NebulaSphere />
      {/* Star field */}
      <StarField />
      <VoidFloor />

      {/* Asteroid belt orbiting the station */}
      <AsteroidBelt />

      {/* Station warning lights — blinking red/orange */}
      <StationWarningLights />

      {/* ── Level 0 (y=0) ── */}

      {/* SPAWN platform — Entry Dock STA-00 */}
      <StationPlatform pos={[0, 0.2, 0]} w={22} d={22} neonColor={NEON_BLUE} colHeight={5} openSide="north" />
      <NeonStrip pos={[0, 0.42, 8]} size={[20, 0.06, 0.2]} color={NEON_CYAN} intensity={1.5} />
      <NeonStrip pos={[0, 0.42, -8]} size={[20, 0.06, 0.2]} color={NEON_CYAN} intensity={1.5} />
      <Beacon pos={[8, 0.4, -9]} color={WARN} />
      <Beacon pos={[-8, 0.4, -9]} color={NEON_BLUE} />

      {/* Bridge STA-00 → STA-01 */}
      <Bridge pos={[0, 0.2, -32]} length={22} axis="z" neonColor={NEON_BLUE} />

      {/* Module Alpha STA-01 */}
      <StationPlatform pos={[0, 0.2, -52]} w={24} d={24} neonColor={NEON_PURPLE} colHeight={5} openSide="north" />
      <Beacon pos={[9, 0.4, -43]} color={NEON_PURPLE} />
      <Beacon pos={[-9, 0.4, -43]} color={WARN} />

      {/* Crate obstacles on Alpha */}
      <HullPlate pos={[-7, 1.4, -52]} size={[2, 2, 2]} color={PANEL} />
      <HullPlate pos={[7, 1.4, -52]} size={[2, 2, 2]} color={PANEL} />
      <HullPlate pos={[-7, 2.4, -52]} size={[2, 1, 2]} color={METAL} />
      <NeonStrip pos={[-7, 1.02, -52]} size={[1.8, 0.05, 1.8]} color={NEON_PURPLE} intensity={0.8} />
      <NeonStrip pos={[7, 1.02, -52]} size={[1.8, 0.05, 1.8]} color={NEON_BLUE} intensity={0.8} />

      {/* East wing bridge + module */}
      <Bridge pos={[30, 0.2, -52]} length={20} axis="x" neonColor={NEON_CYAN} />
      <StationPlatform pos={[50, 0.2, -52]} w={16} d={16} neonColor={NEON_CYAN} colHeight={5} openSide="west" />
      <Beacon pos={[50, 0.4, -44]} color={NEON_CYAN} />
      <HullPlate pos={[50, 1.2, -52]} size={[3, 2, 8]} color={PANEL} />

      {/* ── Steps Level 0 → Level 1 ── */}
      {/* 7 steps north of Alpha, going up 7 units over ~12 z */}
      <StepsUp start={[0, 0.4, -64]} count={7} dir="north" risePerStep={1} runPerStep={1.7} />

      {/* ── Level 1 (y=7) ── */}

      {/* Module Beta STA-10 */}
      <StationPlatform pos={[0, 7.2, -84]} w={20} d={20} neonColor={NEON_RED} colHeight={7} openSide="north" />
      <NeonStrip pos={[0, 7.42, -84]} size={[18, 0.06, 18]} color={NEON_RED} intensity={0.5} />
      <Beacon pos={[7, 7.4, -75]} color={NEON_RED} />
      <Beacon pos={[-7, 7.4, -75]} color={NEON_RED} />
      <Beacon pos={[7, 7.4, -93]} color={WARN} />

      {/* Crates on Beta */}
      <HullPlate pos={[6, 9.2, -84]} size={[3, 4, 3]} color={METAL} />
      <HullPlate pos={[-6, 8.7, -82]} size={[2.5, 3, 2.5]} color={PANEL} />
      <NeonStrip pos={[6, 7.42, -84]} size={[2.8, 0.06, 2.8]} color={NEON_RED} intensity={1.0} />

      {/* West wing bridge + module */}
      <Bridge pos={[-28, 7.2, -84]} length={20} axis="x" neonColor={NEON_PURPLE} />
      <StationPlatform pos={[-48, 7.2, -84]} w={16} d={14} neonColor={NEON_PURPLE} colHeight={7} openSide="east" />
      <HullPlate pos={[-48, 9.2, -84]} size={[8, 4, 2]} color={PANEL} />
      <NeonStrip pos={[-48, 7.42, -84]} size={[14, 0.06, 12]} color={NEON_PURPLE} intensity={0.6} />
      <Beacon pos={[-48, 7.4, -78]} color={NEON_PURPLE} />

      {/* Moving platform near Beta */}
      <MovingPlatform startPos={[0, 7.4, -75]} travel={5} axis="x" speed={0.5} />

      {/* ── Steps Level 1 → Level 2 ── */}
      {/* 7 steps from Beta, going up 7 more units */}
      <StepsUp start={[0, 7.4, -94]} count={7} dir="north" risePerStep={1} runPerStep={1.7} />

      {/* ── Level 2 (y=14) ── */}

      {/* Bridge to Command */}
      <Bridge pos={[0, 14.2, -112]} length={20} axis="z" neonColor={NEON_YELLOW} />

      {/* Command Bridge STA-20 */}
      <StationPlatform pos={[0, 14.2, -128]} w={26} d={26} neonColor={NEON_YELLOW} colHeight={14} openSide="south" />
      <NeonStrip pos={[0, 14.42, -128]} size={[24, 0.08, 24]} color={NEON_YELLOW} intensity={0.7} />
      <NeonStrip pos={[0, 14.42, -128]} size={[0.15, 0.08, 24]} color={NEON_CYAN} intensity={1.2} />
      <NeonStrip pos={[0, 14.42, -128]} size={[24, 0.08, 0.15]} color={NEON_CYAN} intensity={1.2} />

      {/* Command bridge details — captain's dais */}
      <HullPlate pos={[0, 16.4, -128]} size={[8, 4, 8]} color={METAL} />
      <NeonStrip pos={[0, 14.42, -128]} size={[7.5, 0.06, 7.5]} color={NEON_YELLOW} intensity={1.8} />

      {/* Console banks */}
      <HullPlate pos={[-9, 15.7, -128]} size={[3, 3, 8]} color={PANEL} />
      <HullPlate pos={[9, 15.7, -128]} size={[3, 3, 8]} color={PANEL} />
      <NeonStrip pos={[-9, 14.62, -128]} size={[2.8, 0.06, 7.8]} color={NEON_BLUE} intensity={0.9} />
      <NeonStrip pos={[9, 14.62, -128]} size={[2.8, 0.06, 7.8]} color={NEON_BLUE} intensity={0.9} />

      {/* Viewport windows (decorative) */}
      <mesh position={[0, 18.2, -141.5]}>
        <boxGeometry args={[22, 8, 0.15]} />
        <meshStandardMaterial color={NEON_CYAN} emissive={NEON_CYAN} emissiveIntensity={0.2} transparent opacity={0.25} />
      </mesh>

      <Beacon pos={[11, 14.4, -117]} color={NEON_YELLOW} />
      <Beacon pos={[-11, 14.4, -117]} color={NEON_YELLOW} />

      {/* ── Enemies ── */}
      {/* L0: entry patrol */}
      <Enemy pos={[0, 1.5, -15]} patrolX={8} color={NEON_BLUE} />
      {/* L0: Alpha module robot */}
      <Enemy pos={[0, 1.5, -52]} patrolX={8} color={NEON_PURPLE} />
      {/* L0: East wing robot */}
      <Enemy pos={[50, 1.5, -52]} patrolX={5} color={NEON_CYAN} />
      {/* L1: Beta module robots */}
      <Enemy pos={[0, 8.5, -84]} patrolX={7} color={NEON_RED} />
      <Enemy pos={[-48, 8.5, -84]} patrolX={4} color={NEON_PURPLE} />
      {/* L2: Command guard */}
      <GltfMonster which="alien" pos={[0, 14.5, -130]} scale={1.2} rotY={Math.PI} animation="Wave" />

      {/* ── Coins ── */}
      {/* Spawn area */}
      <Coin pos={[-7, 1.5, 0]} />
      <Coin pos={[7, 1.5, 0]} />
      <Coin pos={[0, 1.5, -8]} />
      {/* Bridge 1 */}
      <Coin pos={[0, 1.5, -28]} />
      <Coin pos={[0, 1.5, -36]} />
      {/* Alpha */}
      <Coin pos={[-9, 1.5, -52]} />
      <Coin pos={[9, 1.5, -52]} />
      <Coin pos={[0, 1.5, -61]} />
      {/* East wing */}
      <Coin pos={[50, 1.5, -45]} />
      <Coin pos={[50, 1.5, -59]} />
      {/* Steps 0→1 */}
      <Coin pos={[2, 4, -72]} />
      {/* Beta */}
      <Coin pos={[-4, 9, -84]} />
      <Coin pos={[4, 9, -84]} />
      <Coin pos={[0, 9, -76]} />
      {/* West wing */}
      <Coin pos={[-48, 9, -78]} />
      <Coin pos={[-48, 9, -90]} />
      {/* Moving platform */}
      <Coin pos={[0, 9, -75]} />
      {/* Steps 1→2 */}
      <Coin pos={[-2, 11, -100]} />
      {/* Bridge to command */}
      <Coin pos={[0, 15.5, -108]} />
      <Coin pos={[0, 15.5, -116]} />
      {/* Command */}
      <Coin pos={[-10, 15.5, -128]} />
      <Coin pos={[10, 15.5, -128]} />
      <Coin pos={[0, 15.5, -138]} value={5} />

      {/* ── Goal ── */}
      <GoalTrigger
        pos={[0, 18, -128]}
        size={[26, 5, 26]}
        result={{
          kind: 'win',
          label: 'КОМАНДНЫЙ МОСТИК!',
          subline: 'Ты пробрался через всю станцию и захватил управление!',
        }}
      />
    </>
  )
}

export const SPACE_SPAWN: [number, number, number] = [0, 3, 9]
