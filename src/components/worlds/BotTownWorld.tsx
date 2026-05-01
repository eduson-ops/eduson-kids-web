import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'
const _isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Building, ParkedCar, Flowers, GrassTuft, NpcRobot, Fountain, MarketStall, Trophy, BossGolem, CrystalCluster, LavaRock } from '../Scenery'
import GradientSky from '../GradientSky'

/**
 * BotTownWorld — educational remake of Brookhaven + Adopt Me.
 *
 * Curriculum: M5 capstone — сделать NPC-брейн на if/elif/else для Adopt Me Pet Brain.
 * MVP: песочница-городок с 6 зданиями, 3 NPC (каждый с ярлыком-ролью),
 * машины по парковке, бабочки-«жители» (GltfMonster), цель — найти 5 жителей.
 *
 * Python hooks (для L29-L30):
 *   on_tick(fn)       — вызывается каждую секунду
 *   walk_to(pos)      — NPC идёт к позиции
 *   on_talk(npc, fn)  — обработчик касания с NPC
 */

const ROAD = '#3a3f4a'
const ROAD_LINE = '#ffff88'
const GRASS = '#6fd83e'

function Grass() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Road({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={ROAD} roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

function RoadLine({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={pos} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={ROAD_LINE} roughness={0.5} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Street lamp with enhanced point light + glowing bulb sphere
// ---------------------------------------------------------------------------

function StreetLamp({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 3.0, 8]} />
        <meshStandardMaterial color="#555566" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.4, 2.9, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        <meshStandardMaterial color="#555566" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Glowing bulb sphere */}
      <mesh position={[0.4, 2.7, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshBasicMaterial color="#fffaaa" />
      </mesh>
      {/* Point light from bulb */}
      <pointLight
        position={[0.4, 2.7, 0]}
        color="#ffee88"
        intensity={1.2}
        distance={12}
        decay={2}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Holographic NPC indicator rings — cyan torus with UV pulse + Y rotation
// ---------------------------------------------------------------------------

const holoVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const holoFragmentShader = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float pulse = 0.5 + 0.5 * sin(iTime * 3.0 + vUv.x * 6.28318);
    vec3 col = vec3(0.0, 1.0, 1.0); // cyan #00ffff
    float alpha = pulse * 0.85;
    gl_FragColor = vec4(col, alpha);
  }
`

function HoloRing({ pos }: { pos: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * 0.8
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })

  return (
    <group ref={groupRef} position={[pos[0], pos[1] + 0.1, pos[2]]}>
      <mesh>
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={holoVertexShader}
          fragmentShader={holoFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Bot activity window lights — 12 small colored spheres, occasional flicker
// ---------------------------------------------------------------------------

const WINDOW_LIGHT_COLORS = ['#44ff44', '#ff4444', '#4488ff', '#ffdd44']

const WINDOW_LIGHTS = Array.from({ length: 12 }, (_, i) => ({
  // Scatter on building facades: rough positions around the 6 buildings
  x: ([-16, 16, -16, 16, -26, 26][i % 6] ?? 0) + (Math.random() - 0.5) * 3,
  y: 1.5 + Math.random() * 3.5,
  z: ([-14, -14, 14, 14, 0, 0][i % 6] ?? 0) + (Math.random() - 0.5) * 2,
  color: WINDOW_LIGHT_COLORS[i % 4] ?? '#ffffff',
}))

function BotWindowLights() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  // Track per-instance visibility state
  const visibleRef = useRef<boolean[]>(Array.from({ length: WINDOW_LIGHTS.length }, () => true))

  // Set initial matrices and colors once
  useEffect(() => {
    if (!meshRef.current) return
    WINDOW_LIGHTS.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, new THREE.Color(w.color))
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [dummy])

  useFrame(() => {
    if (!meshRef.current) return
    let changed = false
    WINDOW_LIGHTS.forEach((w, i) => {
      if (Math.random() < 0.005) {
        visibleRef.current[i] = !visibleRef.current[i]
        dummy.position.set(w.x, w.y, w.z)
        dummy.scale.setScalar(visibleRef.current[i] ? 1 : 0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        changed = true
      }
    })
    if (changed) meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, WINDOW_LIGHTS.length]} frustumCulled={false}>
      <sphereGeometry args={[0.12, 6, 6]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// NeonDrizzle — 80 instanced thin rain cylinders falling in cyan/magenta
// ---------------------------------------------------------------------------

const DRIZZLE_COUNT = 80

function NeonDrizzle() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)

  // Precompute per-instance data: x, z starting position, y start, speed
  const instanceData = useMemo(() => {
    const POOL = 16
    const data: { x: number; z: number; y: number; speed: number; color: THREE.Color; resetXs: number[]; resetZs: number[]; resetIdx: number }[] = []
    for (let i = 0; i < DRIZZLE_COUNT; i++) {
      data.push({
        x: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 60,
        y: Math.random() * 16,
        speed: 12 + Math.random() * 6,
        color: i % 2 === 0 ? new THREE.Color('#00ffff') : new THREE.Color('#ff44aa'),
        resetXs: Array.from({ length: POOL }, () => (Math.random() - 0.5) * 60),
        resetZs: Array.from({ length: POOL }, () => (Math.random() - 0.5) * 60),
        resetIdx: 0,
      })
    }
    return data
  }, [])

  // Apply initial colors once mesh is mounted
  useEffect(() => {
    if (!meshRef.current) return
    instanceData.forEach((d, i) => {
      meshRef.current.setColorAt(i, d.color)
    })
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [instanceData])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? delta * 2 : delta
    instanceData.forEach((d, i) => {
      d.y -= d.speed * step
      if (d.y < -1) {
        d.y = 15
        d.x = d.resetXs[d.resetIdx % 16]!
        d.z = d.resetZs[d.resetIdx++ % 16]!
      }
      dummy.position.set(d.x, d.y, d.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DRIZZLE_COUNT]} frustumCulled={false}>
      <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
      <meshBasicMaterial vertexColors transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// HoloCitySign — scrolling-line shader on a vertical plane on building walls
// ---------------------------------------------------------------------------

const holoSignVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const holoSignFragmentShader = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float lines = step(0.1, mod(vUv.y * 15.0 - iTime * 2.0, 1.0));
    gl_FragColor = vec4(0.0, 1.0, 1.0, lines * 0.7);
  }
`

const SIGN_CONFIGS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-13, 4.5, -14], rotY: Math.PI / 2 },
  { pos: [13, 5.0, -14],  rotY: -Math.PI / 2 },
  { pos: [-13, 3.5, 14],  rotY: Math.PI / 2 },
  { pos: [13, 4.0, 14],   rotY: -Math.PI / 2 },
]

function HoloCitySigns() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useEffect(() => {
    if (!meshRef.current) return
    SIGN_CONFIGS.forEach((cfg, i) => {
      dummy.position.set(...cfg.pos)
      dummy.rotation.set(0, cfg.rotY, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  useFrame(({ clock }) => {
    uniforms.iTime.value = clock.getElapsedTime()
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SIGN_CONFIGS.length]} frustumCulled={false}>
      <planeGeometry args={[2, 1.5]} />
      <shaderMaterial
        vertexShader={holoSignVertexShader}
        fragmentShader={holoSignFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// WetStreetPuddles — flat reflective circles on road surface
// ---------------------------------------------------------------------------

const PUDDLE_CONFIGS: { pos: [number, number, number]; radius: number }[] = [
  { pos: [-4,  0.01,  2],  radius: 2.5 },
  { pos: [5,   0.01, -3],  radius: 1.8 },
  { pos: [-8,  0.01,  0],  radius: 2.0 },
  { pos: [10,  0.01,  1],  radius: 1.5 },
  { pos: [0,   0.01, -6],  radius: 3.0 },
  { pos: [2,   0.01,  7],  radius: 1.7 },
  { pos: [-6,  0.01, -5],  radius: 2.2 },
  { pos: [7,   0.01,  5],  radius: 2.8 },
  { pos: [-2,  0.01,  12], radius: 1.6 },
  { pos: [3,   0.01, -10], radius: 2.0 },
]

function WetStreetPuddles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    PUDDLE_CONFIGS.forEach((p, i) => {
      dummy.position.set(...p.pos)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      // radius is baked into geometry as 1; scale XY to match each puddle's radius
      dummy.scale.set(p.radius, p.radius, 1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PUDDLE_CONFIGS.length]} frustumCulled={false}>
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial
        color="#001144"
        opacity={0.55}
        transparent
        depthWrite={false}
      />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------------------
// BuildingNeonStrips — 12 thin vertical emissive bars on building corners
// ---------------------------------------------------------------------------

const NEON_STRIP_COLORS = ['#ff0088', '#00ffcc', '#ff8800']

const NEON_STRIP_CONFIGS: { pos: [number, number, number]; colorIndex: number }[] = [
  // Building A [-16, -14]
  { pos: [-14.0, 3.5, -12.5], colorIndex: 0 },
  { pos: [-17.5, 2.0, -12.5], colorIndex: 1 },
  // Building B [16, -14]
  { pos: [14.0,  4.0, -12.5], colorIndex: 2 },
  { pos: [17.5,  2.5, -12.5], colorIndex: 0 },
  // Building C [-16, 14]
  { pos: [-14.0, 3.0, 12.5],  colorIndex: 1 },
  { pos: [-17.5, 4.5, 12.5],  colorIndex: 2 },
  // Building D [16, 14]
  { pos: [14.0,  2.0, 12.5],  colorIndex: 0 },
  { pos: [17.5,  3.5, 12.5],  colorIndex: 1 },
  // Building E [-26, 0]
  { pos: [-24.5, 4.0, -1.5],  colorIndex: 2 },
  { pos: [-24.5, 2.5,  1.5],  colorIndex: 0 },
  // Building F [26, 0]
  { pos: [24.5,  3.0, -1.5],  colorIndex: 1 },
  { pos: [24.5,  4.5,  1.5],  colorIndex: 2 },
]

// Pre-group strip positions by colorIndex so each InstancedMesh handles one color
const NEON_STRIPS_BY_COLOR = NEON_STRIP_COLORS.map((_, ci) =>
  NEON_STRIP_CONFIGS.filter((s) => s.colorIndex === ci).map((s) => s.pos)
)

function NeonStripGroup({ color, positions }: { color: string; positions: [number, number, number][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    positions.forEach((pos, i) => {
      dummy.position.set(...pos)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [dummy, positions])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} frustumCulled={false}>
      <boxGeometry args={[0.15, 3, 0.15]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

function BuildingNeonStrips() {
  return (
    <>
      {NEON_STRIP_COLORS.map((color, ci) => (
        <NeonStripGroup key={ci} color={color} positions={NEON_STRIPS_BY_COLOR[ci]} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Traffic light — red/yellow/green cycle every 3s/1s/4s
// ---------------------------------------------------------------------------

const TRAFFIC_POSITIONS: [number, number, number][] = [
  [-4.5, 0, -4.5], [4.5, 0, -4.5], [-4.5, 0, 4.5], [4.5, 0, 4.5],
]

function TrafficLight({ pos }: { pos: [number, number, number] }) {
  const redRef  = useRef<THREE.Mesh>(null!)
  const yelRef  = useRef<THREE.Mesh>(null!)
  const grnRef  = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime % 8
    const red = t < 4
    const yel = t >= 4 && t < 5
    const grn = t >= 5
    if (redRef.current) (redRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = red ? 2.5 : 0.1
    if (yelRef.current) (yelRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = yel ? 2.5 : 0.1
    if (grnRef.current) (grnRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = grn ? 2.5 : 0.1
  })
  return (
    <group position={pos}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.06, 0.06, 3, 6]} /><meshStandardMaterial color="#333344" /></mesh>
      <mesh position={[0, 3.2, 0]}><boxGeometry args={[0.26, 0.72, 0.22]} /><meshStandardMaterial color="#111122" /></mesh>
      <mesh ref={redRef} position={[0, 3.48, 0.12]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0.1} /></mesh>
      <mesh ref={yelRef} position={[0, 3.2,  0.12]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.1} /></mesh>
      <mesh ref={grnRef} position={[0, 2.92, 0.12]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial color="#00cc44" emissive="#00cc44" emissiveIntensity={0.1} /></mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Animated cars — 3 cars driving circuits around the crossroads
// ---------------------------------------------------------------------------

const CAR_CONFIGS = [
  { radius: 12, speed: 0.55, phase: 0,          color: '#ffcc00', emissive: '#cc9900', y: 0.35 },  // taxi
  { radius: 18, speed: 0.38, phase: Math.PI,    color: '#2244cc', emissive: '#001188', y: 0.35 },  // police
  { radius: 25, speed: 0.28, phase: Math.PI/2,  color: '#cc3322', emissive: '#881100', y: 0.35 },  // red sedan
] as const

function AnimatedCars() {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    CAR_CONFIGS.forEach((cfg, i) => {
      const g = refs.current[i]
      if (!g) return
      const angle = t * cfg.speed + cfg.phase
      g.position.x = Math.cos(angle) * cfg.radius
      g.position.z = Math.sin(angle) * cfg.radius
      g.rotation.y = -angle + Math.PI / 2
    })
  })
  return (
    <>
      {CAR_CONFIGS.map((cfg, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }} position={[cfg.radius, cfg.y, 0]}>
          {/* Car body */}
          <mesh castShadow>
            <boxGeometry args={[1.8, 0.55, 0.9]} />
            <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.15} roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Cabin */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.95, 0.4, 0.78]} />
            <meshStandardMaterial color={cfg.color} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Wheels */}
          {([-0.55, 0.55] as const).map((xo) =>
            ([-0.7, 0.7] as const).map((zo) => (
              <mesh key={`${xo},${zo}`} position={[xo, -0.22, zo]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.12, 10]} />
                <meshStandardMaterial color="#222222" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// NeonGridGround — animated shader overlay + concrete patch variety
// ---------------------------------------------------------------------------

const neonGridVertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

const neonGridFragmentShader = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    vec2 grid = fract(vUv * 16.0);
    float lines = step(0.97, grid.x) + step(0.97, grid.y);
    float glow = lines * (0.5 + 0.5 * sin(iTime * 1.2 + vUv.x * 8.0 + vUv.y * 6.0));
    vec3 col = vec3(0.0, glow * 0.6, glow * 1.0); // cyan grid lines
    gl_FragColor = vec4(col, glow * 0.4);
  }
`

const CONCRETE_PATCHES: { pos: [number, number, number] }[] = [
  { pos: [-22,  0.01,  18] },
  { pos: [ 22,  0.01, -18] },
  { pos: [-18,  0.01, -22] },
  { pos: [ 18,  0.01,  22] },
  { pos: [-30,  0.01,  30] },
  { pos: [ 30,  0.01, -30] },
]

function NeonGridGround() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })

  return (
    <>
      {/* Animated neon grid overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[80, 80]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={neonGridVertexShader}
          fragmentShader={neonGridFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Concrete patch variety — 6 dark circular overlays */}
      {CONCRETE_PATCHES.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[8, 32]} />
          <meshBasicMaterial
            color="#1a1a22"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// ElevatedWalkways — 5 catwalk bridges at y=7 between buildings
// ---------------------------------------------------------------------------

interface BridgeConfig {
  cx: number
  cy: number
  cz: number
  width: number
  rotY: number
}

const BRIDGE_CONFIGS: BridgeConfig[] = [
  // Bridge A: Building A [-16,-14] → Building B [16,-14] along z=-14 (east-west)
  { cx: 0,   cy: 7, cz: -14, width: 26, rotY: 0 },
  // Bridge B: Building C [-16,14] → Building D [16,14] along z=14 (east-west)
  { cx: 0,   cy: 7, cz:  14, width: 26, rotY: 0 },
  // Bridge C: Building A [-16,-14] → Building C [-16,14] along x=-16 (north-south)
  { cx: -16, cy: 7, cz:   0, width: 24, rotY: Math.PI / 2 },
  // Bridge D: Building B [16,-14] → Building D [16,14] along x=16 (north-south)
  { cx:  16, cy: 7, cz:   0, width: 24, rotY: Math.PI / 2 },
  // Bridge E: Building E [-26,0] → Building A [-16,-14] diagonal approximated as E-W offset
  { cx: -21, cy: 7, cz:  -7, width: 16, rotY: Math.PI / 5 },
]

const POST_COUNT = 5

function BridgeCatwalk({ cfg }: { cfg: BridgeConfig }) {
  const { cx, cy, cz, width, rotY } = cfg

  // Evenly spaced post offsets along the bridge (local X before rotation)
  const postOffsets = Array.from({ length: POST_COUNT }, (_, i) =>
    -width / 2 + (width / (POST_COUNT - 1)) * i
  )

  return (
    <group position={[cx, cy, cz]} rotation={[0, rotY, 0]}>
      {/* Main beam */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.3, 1.2]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Railing posts */}
      {postOffsets.map((ox, i) => (
        <mesh key={i} position={[ox, 0.9, 0.55]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {postOffsets.map((ox, i) => (
        <mesh key={`b${i}`} position={[ox, 0.9, -0.55]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 5]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* Horizontal railing bars at top of posts */}
      <mesh position={[0, 1.62, 0.55]}>
        <boxGeometry args={[width, 0.06, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.62, -0.55]}>
        <boxGeometry args={[width, 0.06, 0.06]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Blue/cyan strip light */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[width, 0.08, 0.12]} />
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={2.0}
        />
      </mesh>
      <pointLight color="#00ccff" intensity={1.5} distance={8} position={[0, 0.3, 0]} />
    </group>
  )
}

function ElevatedWalkways() {
  return (
    <>
      {BRIDGE_CONFIGS.map((cfg, i) => (
        <BridgeCatwalk key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// HolographicDisplays — 4 large animated shader screens across the city
// ---------------------------------------------------------------------------

const holoDisplayVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const holoDisplayFragmentShader = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float scan = step(0.995, fract(vUv.y * 20.0 + iTime * 2.0));
    float grid = step(0.97, fract(vUv.x * 12.0)) + step(0.97, fract(vUv.y * 8.0));
    float glow = 0.4 + sin(iTime * 1.5 + vUv.x * 3.0) * 0.1;
    vec3 col = mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 0.8, 1.0), glow + grid * 0.3 + scan);
    gl_FragColor = vec4(col, 0.75);
  }
`

interface DisplayConfig {
  pos: [number, number, number]
  rotY: number
}

const DISPLAY_CONFIGS: DisplayConfig[] = [
  // Facing south, at the north edge of the central block
  { pos: [-16, 10, -18], rotY: 0 },
  // Facing north
  { pos: [16,  10,  18], rotY: Math.PI },
  // Facing east, on the west side
  { pos: [-30, 10,   0], rotY: Math.PI / 2 },
  // Facing west, on the east side
  { pos: [30,  10,   0], rotY: -Math.PI / 2 },
]

function HolographicDisplays() {
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })

  return (
    <>
      {DISPLAY_CONFIGS.map((cfg, i) => (
        <mesh key={i} position={cfg.pos} rotation={[0, cfg.rotY, 0]}>
          <planeGeometry args={[8, 5]} />
          <shaderMaterial
            ref={(el) => { materialRefs.current[i] = el }}
            vertexShader={holoDisplayVertexShader}
            fragmentShader={holoDisplayFragmentShader}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// RobotPedestrians — 12 stylized robot citizens walking in circles
// ---------------------------------------------------------------------------

interface RobotConfig {
  cx: number
  cz: number
  radius: number
  speed: number
  startAngle: number
  phase: number
}

const ROBOT_CONFIGS: RobotConfig[] = [
  { cx:  0,   cz:  0,  radius: 15, speed: 0.42, startAngle: 0,                  phase: 0 },
  { cx:  0,   cz:  0,  radius: 15, speed: 0.42, startAngle: Math.PI,             phase: 1.1 },
  { cx:  0,   cz:  0,  radius: 20, speed: 0.31, startAngle: Math.PI / 2,         phase: 2.2 },
  { cx:  0,   cz:  0,  radius: 20, speed: 0.31, startAngle: (3 * Math.PI) / 2,   phase: 0.5 },
  { cx: -5,   cz: -5,  radius: 25, speed: 0.25, startAngle: 0,                   phase: 3.1 },
  { cx:  5,   cz:  5,  radius: 25, speed: 0.25, startAngle: Math.PI,             phase: 1.7 },
  { cx:  0,   cz:  0,  radius: 30, speed: 0.20, startAngle: Math.PI / 4,         phase: 0.3 },
  { cx:  0,   cz:  0,  radius: 30, speed: 0.20, startAngle: (5 * Math.PI) / 4,   phase: 2.0 },
  { cx: 10,   cz: -10, radius: 35, speed: 0.16, startAngle: Math.PI / 6,         phase: 4.2 },
  { cx: -10,  cz: 10,  radius: 35, speed: 0.16, startAngle: Math.PI + Math.PI/6, phase: 1.4 },
  { cx:  5,   cz:  0,  radius: 40, speed: 0.13, startAngle: 0,                   phase: 0.8 },
  { cx: -5,   cz:  0,  radius: 40, speed: 0.13, startAngle: Math.PI,             phase: 3.5 },
]

function SingleRobot({ cfg }: { cfg: RobotConfig }) {
  const groupRef    = useRef<THREE.Group>(null!)
  const legLRef     = useRef<THREE.Mesh>(null!)
  const legRRef     = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const angle = t * cfg.speed + cfg.startAngle
    const x = cfg.cx + cfg.radius * Math.cos(angle)
    const z = cfg.cz + cfg.radius * Math.sin(angle)
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
      // face direction of travel (tangent to circle)
      groupRef.current.rotation.y = -angle - Math.PI / 2
    }
    // bob legs
    const bob = Math.sin(t * 3 + cfg.phase)
    if (legLRef.current) legLRef.current.rotation.x =  bob * 0.4
    if (legRRef.current) legRRef.current.rotation.x = -bob * 0.4
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#778899" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.5]} />
        <meshStandardMaterial color="#99aabb" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Eye Left */}
      <mesh position={[-0.14, 1.78, 0.26]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={4}
          roughness={0}
        />
      </mesh>
      {/* Eye Right */}
      <mesh position={[0.14, 1.78, 0.26]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={4}
          roughness={0}
        />
      </mesh>

      {/* Arm Left */}
      <mesh position={[-0.55, 0.9, 0]} rotation={[0, 0, 0.45]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 7]} />
        <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Arm Right */}
      <mesh position={[0.55, 0.9, 0]} rotation={[0, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 7]} />
        <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Leg Left */}
      <mesh ref={legLRef} position={[-0.22, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 7]} />
        <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Leg Right */}
      <mesh ref={legRRef} position={[0.22, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 7]} />
        <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Antenna pole */}
      <mesh position={[0, 2.25, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
        <meshStandardMaterial color="#aabbcc" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Antenna tip */}
      <mesh position={[0, 2.48, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

function RobotPedestrians() {
  const configs = useMemo(() => ROBOT_CONFIGS, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <SingleRobot key={i} cfg={cfg} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// MarketStalls — 6 robot tech-component stalls along z: -20 to -80, x: 30-40
// ---------------------------------------------------------------------------

interface StallConfig {
  pos: [number, number, number]
  roofColors: [string, string, string]
  productColors: string[]
  lightColor: string
}

const STALL_CONFIGS: StallConfig[] = [
  {
    pos: [35, 0, -20],
    roofColors: ['#00ccdd', '#0088aa', '#005577'],
    productColors: ['#00ffff', '#ff4400', '#ffdd00', '#44ff44'],
    lightColor: '#aaddff',
  },
  {
    pos: [35, 0, -32],
    roofColors: ['#6600cc', '#4400aa', '#220088'],
    productColors: ['#ff00ff', '#00ff88', '#ffaa00', '#0088ff'],
    lightColor: '#aaddff',
  },
  {
    pos: [35, 0, -44],
    roofColors: ['#0044cc', '#0022aa', '#001188'],
    productColors: ['#44aaff', '#ff2200', '#ffff00', '#00ffcc'],
    lightColor: '#aaddff',
  },
  {
    pos: [35, 0, -56],
    roofColors: ['#009944', '#007733', '#005522'],
    productColors: ['#00ff44', '#ff8800', '#ff00aa', '#0044ff'],
    lightColor: '#aaddff',
  },
  {
    pos: [35, 0, -68],
    roofColors: ['#cc4400', '#aa2200', '#881100'],
    productColors: ['#ff6600', '#00ffaa', '#8800ff', '#ffee00'],
    lightColor: '#aaddff',
  },
  {
    pos: [35, 0, -80],
    roofColors: ['#884400', '#663300', '#442200'],
    productColors: ['#ffaa44', '#44ffdd', '#ff0066', '#aaffaa'],
    lightColor: '#aaddff',
  },
]

function RobotMarketStall({ cfg }: { cfg: StallConfig }) {
  const [px, py, pz] = cfg.pos
  return (
    <group position={[px, py, pz]}>
      {/* Three frame poles */}
      {[-1.4, 0, 1.4].map((xo, i) => (
        <mesh key={i} position={[xo, 1.5, -1.1]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3, 7]} />
          <meshStandardMaterial color="#223344" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}

      {/* Roof — 3 colored boxes side by side */}
      {cfg.roofColors.map((color, i) => {
        const xo = (i - 1) * 1.17
        return (
          <mesh key={i} position={[xo, 3.075, -1.1]} castShadow>
            <boxGeometry args={[1.17, 0.15, 2.5]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        )
      })}

      {/* Counter */}
      <mesh position={[0, 0.4, 0.3]} castShadow>
        <boxGeometry args={[3, 0.8, 0.8]} />
        <meshStandardMaterial color="#334455" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Glowing products on counter */}
      {cfg.productColors.map((color, i) => {
        const xOff = (i - 1.5) * 0.7
        return (
          <mesh key={i} position={[xOff, 1.0, 0.3]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </mesh>
        )
      })}

    </group>
  )
}

function MarketStalls() {
  const configs = useMemo(() => STALL_CONFIGS, [])
  return (
    <>
      {configs.map((cfg, i) => (
        <RobotMarketStall key={i} cfg={cfg} />
      ))}
      <pointLight color="#aaddff" intensity={4} distance={22} position={[35, 3, -38]} />
      <pointLight color="#aaddff" intensity={4} distance={22} position={[35, 3, -62]} />
    </>
  )
}

// ---------------------------------------------------------------------------
// AssemblyLine — robot manufacturing conveyor belt with 4 robotic arm stations
// ---------------------------------------------------------------------------

const BELT_SEGMENT_COUNT = 8
const STATION_PHASES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2] as const

/** Tiny emissive sphere that flashes to simulate a welding spark */
function WeldSpark({ offset }: { offset: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.visible = Math.sin(t * 18 + offset[0] * 3) > 0.4
  })
  return (
    <mesh ref={ref} position={offset}>
      <sphereGeometry args={[0.06, 4, 4]} />
      <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={6} />
    </mesh>
  )
}

/** One robotic arm station: frame + base + forearm + tool + sparks */
function ArmStation({ xOffset, phase }: { xOffset: number; phase: number }) {
  const baseRef    = useRef<THREE.Mesh>(null!)
  const forearmRef = useRef<THREE.Mesh>(null!)
  const toolRef    = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const angle = Math.sin(t * 1.5 + phase) * 0.5

    if (baseRef.current)    baseRef.current.rotation.x    = angle
    if (forearmRef.current) forearmRef.current.rotation.x = angle * 0.8
    if (toolRef.current)    toolRef.current.rotation.x    = angle * 0.6
  })

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Station frame */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#445566" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Arm base — pivots at the top of the frame */}
      <mesh ref={baseRef} position={[0, 3.1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 2, 10]} />
        <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Forearm — attached at elbow */}
      <mesh ref={forearmRef} position={[0, 4.2, 0.6]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 8]} />
        <meshStandardMaterial color="#778899" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Welding tool head */}
      <mesh ref={toolRef} position={[0, 5.0, 1.1]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffaa00"
          emissiveIntensity={2}
          roughness={0.1}
        />
      </mesh>

      {/* Welding sparks — 3 tiny flashing spheres near tool tip */}
      <group position={[0, 5.0, 1.1]}>
        <WeldSpark offset={[0.15,  0.15, 0.1]} />
        <WeldSpark offset={[-0.12, 0.2,  0.15]} />
        <WeldSpark offset={[0.05, -0.1,  0.2]} />
      </group>
    </group>
  )
}

/** Robot in progress at a given assembly stage (1-3) */
function RobotInProgress({ stageX, stage }: { stageX: number; stage: 1 | 2 | 3 }) {
  return (
    <group position={[stageX, 0.45, 0]}>
      {/* Stage 1+: body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#889999" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Stage 2+: head */}
      {stage >= 2 && (
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.5, 0.45, 0.38]} />
          <meshStandardMaterial color="#99aabb" roughness={0.5} metalness={0.4} />
        </mesh>
      )}
      {/* Stage 3: arms (no legs) */}
      {stage >= 3 && (
        <>
          <mesh position={[-0.45, 0.05, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.7, 6]} />
            <meshStandardMaterial color="#778899" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.7, 6]} />
            <meshStandardMaterial color="#778899" roughness={0.5} metalness={0.4} />
          </mesh>
        </>
      )}
    </group>
  )
}

function AssemblyLine() {
  // 8 conveyor belt segment refs
  const segRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    segRefs.current.forEach((seg, i) => {
      if (!seg) return
      // Each segment moves along x from -10 to +10 (belt width 20), modular
      const segSpacing = 20 / BELT_SEGMENT_COUNT
      const baseX = i * segSpacing - 10
      seg.position.x = ((baseX + t * 2) % 20) - 10
    })
  })

  return (
    <group position={[0, 0, -50]}>
      {/* Conveyor belt base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.3, 2]} />
        <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Moving belt segments on top */}
      {Array.from({ length: BELT_SEGMENT_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { segRefs.current[i] = el }}
          position={[i * (20 / BELT_SEGMENT_COUNT) - 10, 0.32, 0]}
        >
          <boxGeometry args={[2.3, 0.1, 2]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
      ))}

      {/* 4 arm stations evenly spaced: x = -7.5, -2.5, 2.5, 7.5 */}
      {STATION_PHASES.map((phase, i) => (
        <ArmStation key={i} xOffset={-7.5 + i * 5} phase={phase} />
      ))}

      {/* 3 robots in progress at different assembly stages */}
      <RobotInProgress stageX={-6} stage={1} />
      <RobotInProgress stageX={0}  stage={2} />
      <RobotInProgress stageX={6}  stage={3} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// RobotPainting — paint spray booth at end of assembly line (x=+15, z=-50)
// ---------------------------------------------------------------------------

const SPRAY_COLORS = [
  '#ff2222', '#2222ff', '#ffee00', '#22cc22',
  '#ff8800', '#cc00ff', '#00ffcc', '#ff4488',
  '#88ff44', '#4488ff',
]
const SPRAY_COUNT = 30

interface SprayParticle {
  color: string
  baseAngle: number
  radius: number
  speed: number
  phase: number
}

const SPRAY_PARTICLES: SprayParticle[] = Array.from({ length: SPRAY_COUNT }, (_, i) => ({
  color: SPRAY_COLORS[i % SPRAY_COLORS.length] ?? '#ffffff',
  baseAngle: (i / SPRAY_COUNT) * Math.PI * 0.9,
  radius: 0.3 + (i % 5) * 0.12,
  speed: 1.2 + (i % 4) * 0.3,
  phase: (i * 0.4) % (Math.PI * 2),
}))

function SprayParticles({ nozzleRef }: { nozzleRef: React.RefObject<THREE.Mesh | null> }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    SPRAY_PARTICLES.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh || !nozzleRef.current) return
      // Spray forward (+z) from nozzle in a fan pattern
      const age = ((t * p.speed + p.phase) % 1.2)
      const dist = age * 1.8
      mesh.position.x = Math.cos(p.baseAngle - Math.PI * 0.45) * dist * 0.4
      mesh.position.y = Math.sin(p.baseAngle - Math.PI * 0.45) * dist * 0.4
      mesh.position.z = dist
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = Math.max(0, 1 - age / 1.2)
    })
  })

  return (
    <>
      {SPRAY_PARTICLES.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
        >
          <sphereGeometry args={[0.07, 4, 4]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={1.5}
            transparent
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

/** Finished robot standing at booth exit */
function FinishedRobot() {
  return (
    <group position={[4, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.45]} />
        <meshStandardMaterial color="#cc3344" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[0.55, 0.5, 0.4]} />
        <meshStandardMaterial color="#dd4455" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 1.68, 0.22]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0.12, 1.68, 0.22]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={4} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.5, 0.85, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 7]} />
        <meshStandardMaterial color="#bb2233" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.5, 0.85, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 7]} />
        <meshStandardMaterial color="#bb2233" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.7, 7]} />
        <meshStandardMaterial color="#bb2233" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.2, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.7, 7]} />
        <meshStandardMaterial color="#bb2233" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

function RobotPainting() {
  const sprayArmRef    = useRef<THREE.Group>(null!)
  const nozzleRef      = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (sprayArmRef.current) {
      sprayArmRef.current.rotation.y = Math.sin(t * 1.8) * 0.7
    }
  })

  return (
    // Positioned at end of assembly line: x=+13, z=-50
    <group position={[13, 0, -50]}>
      {/* ---- Booth enclosure (U-shape: back wall + two side walls) ---- */}
      {/* Back wall */}
      <mesh position={[0, 2, -3]} castShadow>
        <boxGeometry args={[6, 4, 0.2]} />
        <meshStandardMaterial color="#334466" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-3, 2, 0]} castShadow>
        <boxGeometry args={[0.2, 4, 6]} />
        <meshStandardMaterial color="#334466" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[3, 2, 0]} castShadow>
        <boxGeometry args={[0.2, 4, 6]} />
        <meshStandardMaterial color="#334466" transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor of booth */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[6, 0.05, 6]} />
        <meshStandardMaterial color="#223355" roughness={0.8} />
      </mesh>

      {/* ---- Paint spray robot ---- */}
      <group ref={sprayArmRef} position={[0, 1.5, -2]}>
        {/* Arm cylinder */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 2.0, 8]} />
          <meshStandardMaterial color="#556677" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Nozzle cone — points +z */}
        <mesh ref={nozzleRef} position={[0, 1.1, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.5, 8]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Spray particles in nozzle local space */}
        <group position={[0, 1.1, 0.55]}>
          <SprayParticles nozzleRef={nozzleRef} />
        </group>
        {/* Nozzle point light — tinted colorful */}
        <pointLight color="#ff88ff" intensity={1.5} distance={4} position={[0, 1.1, 0.6]} />
      </group>

      {/* ---- Finished painted robot at booth exit ---- */}
      <FinishedRobot />
    </group>
  )
}

// ---------------------------------------------------------------------------
// PowerStation — robot energy generation facility at x=-50, z=0
// ---------------------------------------------------------------------------

const STEAM_COUNT = 20

interface SteamParticle {
  x: number
  z: number
  y: number
  speed: number
  phase: number
  resetXs: number[]
  resetZs: number[]
  resetIdx: number
}

function makeSteamParticles(cx: number, cz: number): SteamParticle[] {
  const POOL = 12
  return Array.from({ length: STEAM_COUNT }, (_, i) => ({
    x: cx + (Math.random() - 0.5) * 1.2,
    z: cz + (Math.random() - 0.5) * 1.2,
    y: 14 + Math.random() * 4,
    speed: 1.5 + Math.random() * 1.5,
    phase: (i / STEAM_COUNT) * Math.PI * 2,
    resetXs: Array.from({ length: POOL }, () => cx + (Math.random() - 0.5) * 1.2) as number[],
    resetZs: Array.from({ length: POOL }, () => cz + (Math.random() - 0.5) * 1.2) as number[],
    resetIdx: i,
  }))
}

function TowerSteam({ cx, cz }: { cx: number; cz: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const particles = useMemo(() => makeSteamParticles(cx, cz), [cx, cz])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    particles.forEach((p, i) => {
      p.y += p.speed * delta
      const top = 14 + 8
      if (p.y > top) {
        p.y = 14
        p.x = p.resetXs[p.resetIdx % 12]!
        p.z = p.resetZs[p.resetIdx++ % 12]!
      }
      const progress = (p.y - 14) / 8
      const scale = 0.3 + progress * 1.2
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STEAM_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.4, 6, 6]} />
      <meshStandardMaterial color="#ccddee" transparent opacity={0.45} depthWrite={false} />
    </instancedMesh>
  )
}

function PowerStation() {
  // pulse ring animation
  const pulseRef = useRef<THREE.Mesh>(null!)
  // warning lights blinking
  const warnRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Pulsing scale on the core ring
    if (pulseRef.current) {
      const s = 1 + 0.18 * Math.sin(t * 3.5)
      pulseRef.current.scale.setScalar(s)
    }
    // Alternating warning lights: lights 0,2 vs 1,3
    warnRefs.current.forEach((m, i) => {
      if (!m) return
      const phase = (i % 2) * Math.PI
      const on = Math.sin(t * 4 + phase) > 0
      ;(m.material as THREE.MeshStandardMaterial).emissiveIntensity = on ? 6 : 0.05
    })
  })

  // conduit colors for 6 energy conduits
  const conduitColors = ['#00aaff', '#ff4400', '#ffcc00', '#00ff88', '#ff00ff', '#44ffff']

  return (
    <group position={[-50, 0, 0]}>
      {/* ---- Main reactor building ---- */}
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 12, 8]} />
        <meshStandardMaterial color="#334455" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* ---- Reactor core cylinder (visible above building top y=12) ---- */}
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[2, 2, 8, 16]} />
        <meshStandardMaterial
          color="#112233"
          emissive="#0088ff"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* ---- Core pulse ring at reactor top (y=12) ---- */}
      <mesh ref={pulseRef} position={[0, 12.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.3, 12, 40]} />
        <meshStandardMaterial
          color="#00aaff"
          emissive="#00aaff"
          emissiveIntensity={4}
          roughness={0}
        />
      </mesh>

      {/* ---- 2 cooling towers at x=±6 ---- */}
      {([-7, 7] as const).map((xo) => (
        <mesh key={xo} position={[xo, 7, 0]} castShadow>
          {/* tapered: top r smaller than bottom */}
          <cylinderGeometry args={[1.5, 2.5, 14, 14]} />
          <meshStandardMaterial color="#556677" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}

      {/* Steam rising from tower tops */}
      <TowerSteam cx={-7} cz={0} />
      <TowerSteam cx={7}  cz={0} />

      {/* ---- 6 energy conduits from reactor outward ---- */}
      {conduitColors.map((color, i) => {
        const angle = (i / conduitColors.length) * Math.PI * 2
        const len = 7
        const cx2 = Math.cos(angle) * (len / 2)
        const cz2 = Math.sin(angle) * (len / 2)
        return (
          <mesh
            key={i}
            position={[cx2, 3, cz2]}
            rotation={[0, -angle, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.3, 0.3, len, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.5}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        )
      })}

      {/* ---- 4 warning lights at building corners ---- */}
      {([[-4.8, 3, -3.8], [4.8, 3, -3.8], [-4.8, 3, 3.8], [4.8, 3, 3.8]] as [number, number, number][]).map(
        ([wx, wy, wz], i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) warnRefs.current[i] = el }}
            position={[wx, wy, wz]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.05}
            />
          </mesh>
        )
      )}

      {/* ---- Security fence: 12 posts + horizontal connecting bars ---- */}
      {Array.from({ length: 12 }, (_, i) => {
        const fAngle = (i / 12) * Math.PI * 2
        const fr = 10
        const fx = Math.cos(fAngle) * fr
        const fz = Math.sin(fAngle) * fr
        return (
          <mesh key={i} position={[fx, 1.2, fz]}>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 5]} />
            <meshStandardMaterial color="#445566" roughness={0.7} metalness={0.5} />
          </mesh>
        )
      })}
      {/* Horizontal fence rail connecting adjacent posts */}
      {Array.from({ length: 12 }, (_, i) => {
        const a1 = (i / 12) * Math.PI * 2
        const a2 = ((i + 1) / 12) * Math.PI * 2
        const fr = 10
        const x1 = Math.cos(a1) * fr
        const z1 = Math.sin(a1) * fr
        const x2 = Math.cos(a2) * fr
        const z2 = Math.sin(a2) * fr
        const mx = (x1 + x2) / 2
        const mz = (z1 + z2) / 2
        const dx = x2 - x1
        const dz = z2 - z1
        const len = Math.sqrt(dx * dx + dz * dz)
        const rotY = -Math.atan2(dz, dx)
        return (
          <mesh key={i} position={[mx, 1.8, mz]} rotation={[0, rotY, 0]}>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color="#445566" roughness={0.7} metalness={0.5} />
          </mesh>
        )
      })}

      {/* Station point light for ambient glow */}
      <pointLight color="#0088ff" intensity={3} distance={25} position={[0, 13, 0]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// EnergyGrid — 5 power pylons with lines running east from power station
// ---------------------------------------------------------------------------

function PowerPylon({ pos }: { pos: [number, number, number] }) {
  const [px, py, pz] = pos
  return (
    <group position={[px, 0, pz]}>
      {/* Vertical spine */}
      <mesh position={[0, py / 2, 0]} castShadow>
        <boxGeometry args={[0.4, py, 0.4]} />
        <meshStandardMaterial color="#667788" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Horizontal cross-arm wide */}
      <mesh position={[0, py - 1.5, 0]} castShadow>
        <boxGeometry args={[6, 0.3, 0.3]} />
        <meshStandardMaterial color="#667788" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Horizontal cross-arm narrow */}
      <mesh position={[0, py - 3.5, 0]} castShadow>
        <boxGeometry args={[4, 0.25, 0.25]} />
        <meshStandardMaterial color="#667788" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Diagonal braces */}
      <mesh position={[1.2, py - 4.5, 0]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#556677" roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[-1.2, py - 4.5, 0]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[0.2, 3, 0.2]} />
        <meshStandardMaterial color="#556677" roughness={0.8} metalness={0.3} />
      </mesh>
    </group>
  )
}

// Pylon positions: x goes from -42 toward -10 (approaching city)
const PYLON_POSITIONS: [number, number, number][] = [
  [-42, 8,  0],
  [-36, 9,  0],
  [-30, 10, 0],
  [-24, 10, 0],
  [-18, 9,  0],
]

function EnergyGrid() {
  return (
    <group>
      {PYLON_POSITIONS.map((pos, i) => (
        <PowerPylon key={i} pos={pos} />
      ))}

      {/* Power lines: thin boxes connecting adjacent pylons at arm tip height */}
      {PYLON_POSITIONS.slice(0, -1).map((posA, i) => {
        const posB = PYLON_POSITIONS[i + 1]!
        const mx = (posA[0] + posB[0]) / 2
        const myA = posA[1] - 1.5  // top arm height
        const myB = posB[1] - 1.5
        const my = (myA + myB) / 2
        const dx = posB[0] - posA[0]
        const len = Math.abs(dx)
        // slightly catenary droop: use a thin box per span
        return (
          <mesh key={i} position={[mx, my - 0.3, 0]}>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.3} />
          </mesh>
        )
      })}

      {/* Second set of lines at lower arm height */}
      {PYLON_POSITIONS.slice(0, -1).map((posA, i) => {
        const posB = PYLON_POSITIONS[i + 1]!
        const mx = (posA[0] + posB[0]) / 2
        const myA = posA[1] - 3.5
        const myB = posB[1] - 3.5
        const my = (myA + myB) / 2
        const dx = posB[0] - posA[0]
        const len = Math.abs(dx)
        return (
          <mesh key={i} position={[mx, my - 0.3, 0]}>
            <boxGeometry args={[len, 0.06, 0.06]} />
            <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------------------
// ChargingStations — 4 robot charging pod clusters around the city
// ---------------------------------------------------------------------------

interface ChargingClusterProps {
  pos: [number, number, number]
  clusterPhase: number
}

function ChargingPod({ xOffset, phase }: { xOffset: number; phase: number }) {
  const indicatorRef = useRef<THREE.Mesh>(null!)
  const arc1Ref = useRef<THREE.Mesh>(null!)
  const arc2Ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase

    // Cycling indicator color: green (0-2s) → orange (2-3s) → red (3-4s)
    if (indicatorRef.current) {
      const cycle = t % 4
      const mat = indicatorRef.current.material as THREE.MeshStandardMaterial
      if (cycle < 2) {
        mat.color.set('#00ff44')
        mat.emissive.set('#00ff44')
        mat.emissiveIntensity = 3
      } else if (cycle < 3) {
        mat.color.set('#ffaa00')
        mat.emissive.set('#ffaa00')
        mat.emissiveIntensity = 3
      } else {
        mat.color.set('#ff2222')
        mat.emissive.set('#ff2222')
        mat.emissiveIntensity = 3
      }
    }

    // Energy arc flicker
    const flicker = Math.sin(t * 22 + phase) > 0.2
    if (arc1Ref.current) arc1Ref.current.visible = flicker
    if (arc2Ref.current) arc2Ref.current.visible = !flicker
  })

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Charging pod cylinder */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 2, 12]} />
        <meshStandardMaterial color="#223344" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Pod door — flat box on front face */}
      <mesh position={[0, 1, 0.82]}>
        <boxGeometry args={[1.4, 1.8, 0.1]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.5} metalness={0.6} transparent opacity={0.8} />
      </mesh>

      {/* Charging indicator sphere */}
      <mesh ref={indicatorRef} position={[0, 2.2, 0.5]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0} />
      </mesh>

      {/* Energy arc contact spheres — flicker alternately */}
      <mesh ref={arc1Ref} position={[-0.25, 0.8, 0.75]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#ffee00" emissive="#ffee00" emissiveIntensity={8} roughness={0} />
      </mesh>
      <mesh ref={arc2Ref} position={[0.25, 0.8, 0.75]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshStandardMaterial color="#ffee00" emissive="#ffee00" emissiveIntensity={8} roughness={0} />
      </mesh>
    </group>
  )
}

function ChargingCluster({ pos, clusterPhase }: ChargingClusterProps) {
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    // Amber pointLight flickers with charging activity
    if (lightRef.current) {
      const t = clock.getElapsedTime() + clusterPhase
      lightRef.current.intensity = 1.5 + 0.8 * Math.sin(t * 5)
    }
  })

  return (
    <group position={pos}>
      {/* 3 pods in a row, spaced 2 units apart */}
      <ChargingPod xOffset={-2} phase={clusterPhase} />
      <ChargingPod xOffset={0}  phase={clusterPhase + 1.3} />
      <ChargingPod xOffset={2}  phase={clusterPhase + 2.6} />

      {/* Amber charging light above the cluster */}
      <pointLight ref={lightRef} color="#ffaa33" intensity={2} distance={8} position={[0, 4, 0]} />

      {/* Small sign plate */}
      <mesh position={[0, 2.6, 0.85]}>
        <boxGeometry args={[1.2, 0.25, 0.05]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

// 4 cluster positions: near the four quadrant buildings
const CHARGING_CLUSTER_POSITIONS: [number, number, number][] = [
  [-18, 0, -8],  // near Building A
  [ 18, 0, -8],  // near Building B
  [-18, 0,  8],  // near Building C
  [ 18, 0,  8],  // near Building D
]

function ChargingStations() {
  return (
    <>
      {CHARGING_CLUSTER_POSITIONS.map((pos, i) => (
        <ChargingCluster key={i} pos={pos} clusterPhase={i * 0.9} />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main world component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CityAurora — volumetric neon glow plane in the night sky above the city
// ---------------------------------------------------------------------------

function CityAurora() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.04 + 0.02 * Math.sin(clock.elapsedTime * 0.4)
  })
  return (
    <mesh ref={ref} position={[0, 35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshBasicMaterial color="#4400ff" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Street lamp positions
const LAMP_POSITIONS: [number, number, number][] = [
  [-8, 0, -8],
  [8, 0, -8],
  [-8, 0, 8],
  [8, 0, 8],
  [-20, 0, 0],
  [20, 0, 0],
]

// NPC positions (matches the 3 NPCs below)
const NPC_POSITIONS: [number, number, number][] = [
  [-10, 0, -10],
  [10, 0, -10],
  [0, 0, 20],
]

export default function BotTownWorld() {
  return (
    <>
      {/* Night city sky */}
      <GradientSky top="#0a1a2a" bottom="#102040" radius={440} />

      {/* Neon rain drizzle — 80 instanced cyan/magenta drops */}
      <NeonDrizzle />

      {/* Volumetric neon aurora glow in the night sky */}
      <CityAurora />

      <Grass />
      <NeonGridGround />

      {/* Перекрёсток: горизонтальная и вертикальная дороги */}
      <Road pos={[0, -0.1, 0]} size={[80, 0.3, 6]} />
      <Road pos={[0, -0.1, 0]} size={[6, 0.3, 80]} />
      {/* Разметка центровых линий */}
      {[-35, -25, -15, 15, 25, 35].map((x) => (
        <RoadLine key={`hl${x}`} pos={[x, 0.06, 0]} size={[4, 0.05, 0.3]} />
      ))}
      {[-35, -25, -15, 15, 25, 35].map((z) => (
        <RoadLine key={`vl${z}`} pos={[0, 0.06, z]} size={[0.3, 0.05, 4]} />
      ))}

      {/* Traffic lights at intersection corners */}
      {TRAFFIC_POSITIONS.map((pos, i) => <TrafficLight key={`tl${i}`} pos={pos} />)}

      {/* Animated cars driving circuits */}
      <AnimatedCars />

      {/* Enhanced street lamps */}
      {LAMP_POSITIONS.map((pos, i) => (
        <StreetLamp key={i} pos={pos} />
      ))}

      {/* 6 зданий вокруг перекрёстка — Kenney City Kit */}
      <Building pos={[-16, 0, -14]} letter="a" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[16, 0, -14]}  letter="b" scale={2.6} rotY={-Math.PI / 2} />
      <Building pos={[-16, 0, 14]}  letter="c" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[16, 0, 14]}   letter="d" scale={2.6} rotY={-Math.PI / 2} />
      <Building pos={[-26, 0, 0]}   letter="a" scale={2.4} rotY={0} />
      <Building pos={[26, 0, 0]}    letter="b" scale={2.4} rotY={Math.PI} />
      <Building pos={[-30, 0, -22]} letter="e" scale={3.0} rotY={Math.PI / 4} />
      <Building pos={[30, 0, -22]}  letter="f" scale={2.8} rotY={-Math.PI / 4} />
      <Building pos={[-30, 0, 22]}  letter="g" scale={2.8} rotY={Math.PI * 3 / 4} />
      <Building pos={[30, 0, 22]}   letter="h" scale={3.0} rotY={-Math.PI * 3 / 4} />
      <Building pos={[0, 0, -35]}   letter="i" scale={3.2} rotY={Math.PI} />
      <Building pos={[0, 0, 35]}    letter="j" scale={2.6} rotY={0} />

      {/* Bot activity window lights on buildings */}
      <BotWindowLights />

      {/* Holographic scrolling-line signs on building walls */}
      <HoloCitySigns />

      {/* Wet street puddles along the road intersection */}
      <WetStreetPuddles />

      {/* Neon vertical strips on building corners */}
      <BuildingNeonStrips />

      {/* Elevated catwalks at y=7 between buildings */}
      <ElevatedWalkways />

      {/* Large holographic display screens around the city */}
      <HolographicDisplays />

      {/* 3 NPC с ролями — игрок должен всех обойти */}
      <NPC pos={[-10, 0, -10]} label="БАНК"        bodyColor="#ffd644" />
      <NPC pos={[10, 0, -10]}  label="КАФЕ"        bodyColor="#ff8caa" />
      <NPC pos={[0, 0, 20]}    label="БИБЛИОТЕКА"  bodyColor="#a9d8ff" />
      {/* Роботы-жители */}
      <NpcRobot pos={[5, 0, 5]} rotY={Math.PI / 3} />
      <NpcRobot pos={[-5, 0, -5]} rotY={-Math.PI / 4} />

      {/* 12 robot pedestrians walking circuits around town */}
      <RobotPedestrians />

      {/* 6 robot tech-component market stalls along east street */}
      <MarketStalls />

      {/* Robot assembly line factory — conveyor + 4 arm stations + in-progress bots */}
      <AssemblyLine />

      {/* Robot paint spray booth at end of assembly line */}
      <RobotPainting />

      {/* Power station — energy generation facility west of city */}
      <PowerStation />

      {/* Energy grid — 5 pylons + power lines from station to city */}
      <EnergyGrid />

      {/* Charging stations — 4 robot pod clusters near quadrant buildings */}
      <ChargingStations />

      {/* Holographic indicator rings at NPC positions */}
      {NPC_POSITIONS.map((pos, i) => (
        <HoloRing key={i} pos={pos} />
      ))}

      {/* Монеты на перекрёстках — цель собрать "5 жителей" = 5 coins */}
      <Coin pos={[-8, 1, 0]} />
      <Coin pos={[8, 1, 0]} />
      <Coin pos={[0, 1, -8]} />
      <Coin pos={[0, 1, 8]} />
      <Coin pos={[0, 1, 16]} />

      {/* GltfMonsters — "жители-боты", патрулируют по улицам */}
      <GltfMonster which="bunny"  pos={[-4, 0, -4]} scale={1.0} patrolX={4} sensor animation="Yes" />
      <GltfMonster which="alien"  pos={[4, 0, 4]}   scale={1.0} patrolX={4} sensor animation="Wave" />
      <GltfMonster which="cactoro" pos={[-4, 0, 8]} scale={1.1} animation="Yes" />

      {/* Парковка — машины */}
      <ParkedCar pos={[-14, 0, 4]}  model="taxi"   rotY={Math.PI / 2} />
      <ParkedCar pos={[14, 0, -4]}  model="sedan"  rotY={-Math.PI / 2} />
      <ParkedCar pos={[-14, 0, -4]} model="police" rotY={Math.PI / 2} />

      {/* Декор вокруг перекрёстка: деревья, клумбы */}
      <Tree pos={[-20, 0, -22]} variant={0} />
      <Tree pos={[20, 0, -22]}  variant={1} />
      <Tree pos={[-20, 0, 22]}  variant={2} />
      <Tree pos={[20, 0, 22]}   variant={3} />
      <Bush pos={[-8, 0, -16]}  variant={0} scale={1.2} />
      <Bush pos={[8, 0, -16]}   variant={1} scale={1.0} />
      <Bush pos={[-8, 0, 16]}   variant={0} scale={1.1} />
      <Bush pos={[8, 0, 16]}    variant={1} scale={1.3} />
      <Flowers pos={[-4, 0, -18]} scale={1.3} />
      <Flowers pos={[4, 0, 18]}   scale={1.3} />
      <GrassTuft pos={[-6, 0, -6]} tall />
      <GrassTuft pos={[6, 0, 6]}   tall={false} />

      {/* Central fountain — town square centerpiece */}
      <Fountain pos={[0, 0, 0]} scale={1.5} />

      {/* Small market around central area */}
      <MarketStall pos={[8, 0, 8]}   scale={1.0} rotY={-Math.PI/4} />
      <MarketStall pos={[-8, 0, 8]}  scale={1.0} rotY={Math.PI/4} />
      <MarketStall pos={[8, 0, -8]}  scale={1.0} rotY={Math.PI/4} />
      <MarketStall pos={[-8, 0, -8]} scale={1.0} rotY={-Math.PI/4} />

      {/* Town achievement trophy near library NPC */}
      <Trophy pos={[0, 0, -25]} scale={1.5} />

      {/* Мэр-Голем — BossGolem mayor near the central fountain, offset so he's not inside it */}
      <BossGolem pos={[5, 0, 5]} scale={1.6} rotY={-Math.PI / 4} />

      {/* Energy deposits — CrystalCluster in city corners, far from buildings */}
      <CrystalCluster pos={[-33, 0, -33]} scale={1.5} rotY={0} />
      <CrystalCluster pos={[33, 0, -33]}  scale={1.4} rotY={Math.PI / 3} />
      <CrystalCluster pos={[-33, 0, 33]}  scale={1.5} rotY={-Math.PI / 4} />
      <CrystalCluster pos={[33, 0, 33]}   scale={1.4} rotY={Math.PI / 2} />
      <CrystalCluster pos={[0, 0, -36]}   scale={1.2} rotY={Math.PI / 6} />
      <CrystalCluster pos={[0, 0, 36]}    scale={1.2} rotY={-Math.PI / 6} />

      {/* Power cores — LavaRock decorative near building bases */}
      <LavaRock pos={[-16, 0, -20]} scale={1.2} rotY={Math.PI / 5} />
      <LavaRock pos={[16, 0, -20]}  scale={1.2} rotY={-Math.PI / 5} />
      <LavaRock pos={[-16, 0, 20]}  scale={1.2} rotY={Math.PI / 3} />
      <LavaRock pos={[16, 0, 20]}   scale={1.2} rotY={-Math.PI / 3} />

      {/* Центральная фонтан-площадь = финиш */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2, 2.2, 0.5, 16]} />
          <meshStandardMaterial color="#6B5CE7" emissive="#6B5CE7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.6, 10]} />
          <meshStandardMaterial color="#88ddff" emissive="#88ddff" emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2, 0]}
        size={[3, 3, 3]}
        result={{
          kind: 'win',
          label: 'ДОБРО ПОЖАЛОВАТЬ!',
          subline: 'Ты познакомился с ботами города. Тут можно жить.',
        }}
      />
    </>
  )
}

export const BOTTOWN_SPAWN: [number, number, number] = [0, 3, 12]
