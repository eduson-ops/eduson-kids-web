import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { detectDeviceTier } from '../../lib/deviceTier'

const _isLow = detectDeviceTier() === 'low'
import { type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import { Tree, Bush, Flowers, GrassTuft, Torch, Pillar, Gate, Altar, Crystal, Trophy, MushroomGlow, Chest, LavaRock, CrystalCluster, BossGolem, PalmTree, RuinsPillar, AncientIdol, Scorpion } from '../Scenery'
import GradientSky from '../GradientSky'

// ─── Palette ─────────────────────────────────────────────────────
const STONE = '#a08c6a'
const DARK_STONE = '#6b5a44'
const MOSS = '#7a8c5e'
const JUNGLE = '#3d8c2f'
const WATER_BLUE = '#1a6fa8'
const GOLD = '#ffd644'
const LAVA = '#ff6b1a'
const FIRE = '#ff5464'

// ─── Pyramid geometry ─────────────────────────────────────────────
// 5 tiers stacked; each is 7 units tall.
// Tier tops at y = 7, 14, 21, 28.  Apex top at y = 36.
const TIERS: { halfW: number; halfD: number; centerY: number; h: number }[] = [
  { halfW: 30, halfD: 30, centerY: 3.5, h: 7 },
  { halfW: 23, halfD: 23, centerY: 10.5, h: 7 },
  { halfW: 16, halfD: 16, centerY: 17.5, h: 7 },
  { halfW: 9, halfD: 9, centerY: 24.5, h: 7 },
]

function PyramidBlock({
  pos,
  size,
  color = STONE,
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

// Decorative horizontal stripe on each tier face (purely visual)
function TierStripe({
  pos,
  size,
}: {
  pos: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={DARK_STONE} roughness={0.9} />
    </mesh>
  )
}

// ─── Staircase ────────────────────────────────────────────────────
// Generates 7 steps going from yBase upward at south face zFace.
function Staircase({
  yBase,
  zFace,
  width,
}: {
  yBase: number
  zFace: number
  width: number
}) {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={[0, yBase + i + 0.5, zFace - i * 1.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, 1, 2]} />
            <meshStandardMaterial color={DARK_STONE} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// Apex stairs (8 steps, shallower depth)
function ApexStaircase() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={[0, 28 + i + 0.5, 4 - i * 0.75]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[5, 1, 1.5]} />
            <meshStandardMaterial color={DARK_STONE} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// ─── Brazier (animated fire torch) ───────────────────────────────
function Brazier({ pos }: { pos: [number, number, number] }) {
  const flame = useRef<THREE.Mesh>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 5.5
    if (!flame.current) return
    flame.current.scale.y = 0.85 + Math.sin(phase.current) * 0.28
    flame.current.scale.x = 0.85 + Math.sin(phase.current * 1.4) * 0.18
  })
  return (
    <group position={pos}>
      {/* Post */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.2, 7]} />
        <meshStandardMaterial color={DARK_STONE} roughness={0.9} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.22, 0.55, 8]} />
        <meshStandardMaterial color="#5b4020" roughness={0.85} metalness={0.25} />
      </mesh>
      {/* Flame */}
      <mesh ref={flame} position={[0, 0.72, 0]}>
        <coneGeometry args={[0.22, 0.75, 7]} />
        <meshStandardMaterial
          color={LAVA}
          emissive={FIRE}
          emissiveIntensity={2.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight color={LAVA} intensity={1.1} distance={9} decay={2} position={[0, 0.75, 0]} />
    </group>
  )
}

// ─── Lava channel (horizontal glow strip) ─────────────────────────
function LavaChannel({
  pos,
  size,
}: {
  pos: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#ff4500"
        emissive="#ff2200"
        emissiveIntensity={1.8}
        roughness={0.5}
      />
    </mesh>
  )
}

// ─── Moving platform (tier 3) ─────────────────────────────────────
function MovingPlatform({
  startPos,
  travel,
  speed = 0.6,
}: {
  startPos: [number, number, number]
  travel: number
  speed?: number
}) {
  const grp = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * speed
    if (grp.current) grp.current.position.x = startPos[0] + Math.sin(phase.current) * travel
  })
  return (
    <group ref={grp} position={startPos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 0.5, 4]} />
          <meshStandardMaterial color={MOSS} roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ─── Rotating spinner (tier 4 obstacle) ───────────────────────────
function Spinner({ pos, speed = 0.7 }: { pos: [number, number, number]; speed?: number }) {
  const grp = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (grp.current) grp.current.rotation.y += dt * speed
  })
  return (
    <group ref={grp} position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[11, 0.4, 1.6]} />
          <meshStandardMaterial color={DARK_STONE} roughness={0.9} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ─── Ground ───────────────────────────────────────────────────────
function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[160, 0.5, 160]} />
        <meshStandardMaterial color={JUNGLE} roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

// Outer perimeter walls (invisible stone walls at 80 units)
function Walls() {
  const W = 160
  const H = 6
  const T = 2
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W / 2 - T / 2], size: [W + T * 2, H, T] },
    { pos: [0, H / 2, W / 2 + T / 2], size: [W + T * 2, H, T] },
    { pos: [-W / 2 - T / 2, H / 2, 0], size: [T, H, W] },
    { pos: [W / 2 + T / 2, H / 2, 0], size: [T, H, W] },
  ]
  return (
    <>
      {items.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={STONE} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// ─── Water moat (visual only) ─────────────────────────────────────
function Moat() {
  // 4 water planes surrounding pyramid base (within 30-55 units from center)
  const sections: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, 0.15, -44], size: [70, 0.25, 28] },   // north
    { pos: [0, 0.15, 44], size: [70, 0.25, 28] },    // south
    { pos: [-44, 0.15, 0], size: [28, 0.25, 34] },   // west
    { pos: [44, 0.15, 0], size: [28, 0.25, 34] },    // east
  ]
  return (
    <>
      {sections.map((s, i) => (
        <mesh key={i} position={s.pos} receiveShadow>
          <boxGeometry args={s.size} />
          <meshStandardMaterial color={WATER_BLUE} roughness={0.2} transparent opacity={0.82} />
        </mesh>
      ))}
    </>
  )
}

// ─── Gold apex floor ──────────────────────────────────────────────
function ApexFloor() {
  return (
    <>
      {/* Gold inlaid floor on apex top */}
      <mesh position={[0, 36.05, 0]}>
        <boxGeometry args={[7.5, 0.1, 7.5]} />
        <meshStandardMaterial color={GOLD} emissive="#aa7700" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
      {/* Central altar */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 36.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 1.6, 2.5]} />
          <meshStandardMaterial color={STONE} roughness={0.85} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 37.65, 0]}>
        <boxGeometry args={[2.8, 0.2, 2.8]} />
        <meshStandardMaterial color={GOLD} emissive="#ffaa00" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
    </>
  )
}

// ─── Dense jungle (tree ring) ─────────────────────────────────────
function Jungle() {
  const trees: Array<{ pos: [number, number, number]; v: number; ry: number }> = useMemo(
    () => [
      // Inner ring (55-65 units out)
      { pos: [-55, 0, 0], v: 0, ry: 0.3 },
      { pos: [55, 0, 0], v: 1, ry: 1.1 },
      { pos: [0, 0, -55], v: 2, ry: 0.7 },
      { pos: [0, 0, 55], v: 3, ry: 1.6 },
      { pos: [-40, 0, -40], v: 4, ry: 0.9 },
      { pos: [40, 0, -40], v: 0, ry: 0.2 },
      { pos: [-40, 0, 40], v: 1, ry: 2.1 },
      { pos: [40, 0, 40], v: 2, ry: 1.4 },
      { pos: [-58, 0, -25], v: 3, ry: 0.6 },
      { pos: [58, 0, -25], v: 4, ry: 1.8 },
      { pos: [-58, 0, 25], v: 0, ry: 3.1 },
      { pos: [58, 0, 25], v: 1, ry: 2.4 },
      // Outer ring (65-75 units)
      { pos: [-65, 0, 10], v: 2, ry: 0.4 },
      { pos: [65, 0, -10], v: 3, ry: 1.3 },
      { pos: [10, 0, -65], v: 4, ry: 0.8 },
      { pos: [-10, 0, 65], v: 0, ry: 2.0 },
      { pos: [-50, 0, -52], v: 1, ry: 1.7 },
      { pos: [50, 0, -52], v: 2, ry: 0.5 },
      { pos: [-50, 0, 52], v: 3, ry: 2.6 },
      { pos: [50, 0, 52], v: 4, ry: 3.0 },
      { pos: [-70, 0, -40], v: 0, ry: 1.2 },
      { pos: [70, 0, 40], v: 1, ry: 0.9 },
      { pos: [70, 0, -40], v: 2, ry: 2.2 },
      { pos: [-70, 0, 40], v: 3, ry: 1.5 },
      // Far corners
      { pos: [-72, 0, -60], v: 4, ry: 0.3 },
      { pos: [72, 0, -60], v: 0, ry: 1.9 },
      { pos: [-72, 0, 60], v: 1, ry: 2.7 },
      { pos: [72, 0, 60], v: 2, ry: 0.6 },
      { pos: [-60, 0, -72], v: 3, ry: 1.4 },
      { pos: [60, 0, -72], v: 4, ry: 2.1 },
    ],
    []
  )
  return (
    <>
      {trees.map((t, i) => (
        <Tree key={i} pos={t.pos} variant={t.v} rotY={t.ry} />
      ))}
      <Bush pos={[-35, 0, 36]} variant={0} scale={1.2} />
      <Bush pos={[35, 0, 36]} variant={1} scale={1.1} />
      <Bush pos={[-35, 0, -36]} variant={1} scale={1.0} />
      <Bush pos={[35, 0, -36]} variant={0} scale={1.3} />
      <Flowers pos={[-48, 0, 28]} scale={1.4} />
      <Flowers pos={[48, 0, -28]} scale={1.2} />
      <GrassTuft pos={[-38, 0, 32]} tall />
      <GrassTuft pos={[38, 0, 32]} tall />
      <GrassTuft pos={[-38, 0, -32]} tall />
      <GrassTuft pos={[38, 0, -32]} />
    </>
  )
}

// ─── Dust motes ──────────────────────────────────────────────────
const DUST_COUNT = 100
const DUST_CEILING = 12

function DustMotes() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  const particles = useMemo(() => {
    return Array.from({ length: DUST_COUNT }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: Math.random() * DUST_CEILING,
      z: (Math.random() - 0.5) * 30,
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.002,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      p.y += (p.speed + Math.sin(t * 0.5 + p.phase) * 0.002) * (_isLow ? 2 : 1)
      if (p.y > DUST_CEILING) p.y = 0
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.04, 4, 4]} />
      <meshBasicMaterial color="#d4a870" transparent opacity={0.6} />
    </instancedMesh>
  )
}

// ─── Rune pads ────────────────────────────────────────────────────
const RUNE_PAD_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float rings = mod(dist * 8.0, 1.0);
    float glow = smoothstep(0.85, 1.0, rings) + smoothstep(0.45, 0.5, rings) * 0.5;
    float pulse = 0.7 + sin(iTime * 0.8) * 0.3;
    vec3 amber = vec3(0.784, 0.471, 0.125);
    vec3 white = vec3(1.0, 0.9, 0.7);
    vec3 col = mix(amber, white, glow * pulse);
    float alpha = glow * pulse * 0.85;
    if (dist > 0.48) discard;
    gl_FragColor = vec4(col, alpha);
  }
`
const RUNE_PAD_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const RUNE_PAD_POSITIONS: [number, number, number][] = [
  [-20, 0.02, 20],
  [20, 0.02, 20],
  [-20, 0.02, -20],
  [20, 0.02, -20],
  [0, 0.02, 35],
  [0, 0.02, -35],
]

function RunePads() {
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })

  return (
    <>
      {RUNE_PAD_POSITIONS.map((pos, i) => {
        const uniforms = { iTime: { value: 0 } }
        return (
          <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <shaderMaterial
              ref={(el) => { materialRefs.current[i] = el }}
              vertexShader={RUNE_PAD_VERT}
              fragmentShader={RUNE_PAD_FRAG}
              uniforms={uniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ─── Rune Obelisks ───────────────────────────────────────────────
const OBELISK_POSITIONS: [number, number, number][] = [
  [-24, 0, 24],
  [24, 0, 24],
  [-24, 0, -24],
  [24, 0, -24],
]

function RuneObelisks() {
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([])

  const uniformsList = useMemo(
    () => OBELISK_POSITIONS.map(() => ({ iTime: { value: 0 } })),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })

  return (
    <>
      {OBELISK_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Base plinth */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.4, 1.2]} />
            <meshStandardMaterial color={STONE} roughness={0.9} />
          </mesh>
          {/* Main shaft */}
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 5, 0.7]} />
            <meshStandardMaterial color={DARK_STONE} roughness={0.88} />
          </mesh>
          {/* Pyramid cap */}
          <mesh position={[0, 5.8, 0]} castShadow>
            <coneGeometry args={[0.5, 1.2, 4]} />
            <meshStandardMaterial color={GOLD} emissive="#aa7700" emissiveIntensity={0.7} roughness={0.35} />
          </mesh>
          {/* Rune face (animated shader plane) */}
          <mesh position={[0, 3, 0.36]}>
            <planeGeometry args={[0.68, 4.8]} />
            <shaderMaterial
              ref={(el) => { materialRefs.current[i] = el }}
              vertexShader={RUNE_PAD_VERT}
              fragmentShader={RUNE_PAD_FRAG}
              uniforms={uniformsList[i]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Apex glow light */}
          <pointLight color={GOLD} intensity={3} distance={10} decay={2} position={[0, 6, 0]} />
        </group>
      ))}
    </>
  )
}

// ─── God rays ────────────────────────────────────────────────────
const GOD_RAY_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float alpha = vUv.y * 0.15;
    float flicker = 0.85 + sin(iTime * 0.4) * 0.15;
    vec3 col = mix(vec3(1.0, 0.95, 0.7), vec3(1.0, 1.0, 1.0), vUv.y);
    gl_FragColor = vec4(col, alpha * flicker);
  }
`
const GOD_RAY_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const GOD_RAY_CONFIGS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-8, 28, -6], rotY: 0.3 },
  { pos: [0, 32, 5], rotY: -0.2 },
  { pos: [9, 28, -4], rotY: 0.7 },
]

function GodRays() {
  const groupRef = useRef<THREE.Group>(null!)
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat) {
        mat.uniforms.iTime!.value = t
      }
    })
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {GOD_RAY_CONFIGS.map((cfg, i) => {
        const uniforms = { iTime: { value: 0 } }
        return (
          <mesh key={i} position={cfg.pos} rotation={[0, cfg.rotY, 0]}>
            {/* ConeGeometry: radiusTop, radiusBottom, height, radialSegments — pointing down means wide top */}
            <coneGeometry args={[5, 18, 12, 1, true]} />
            <shaderMaterial
              ref={(el) => { materialRefs.current[i] = el }}
              vertexShader={GOD_RAY_VERT}
              fragmentShader={GOD_RAY_FRAG}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Guardian Statue ─────────────────────────────────────────────
function GuardianStatue({ pos }: { pos: [number, number, number] }) {
  const [x, y, z] = pos
  return (
    <group position={[x, y, z]}>
      {/* Body */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 8, 3]} />
          <meshStandardMaterial color="#3a3020" roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Head */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <sphereGeometry args={[1.5, 10, 10]} />
        <meshStandardMaterial color="#3a3020" roughness={0.9} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.55, 9.6, 1.3]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={3} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.55, 9.6, 1.3]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={3} />
      </mesh>
      {/* Eye-level point light */}
      <pointLight color="#ff6600" intensity={3} distance={15} decay={2} position={[0, 9.6, 1.3]} />
    </group>
  )
}

// ─── Treasure Vault ───────────────────────────────────────────────
function TreasureVault() {
  // Centred at [0, 0, 35]; floor y = 0.15
  const wallColor = DARK_STONE
  return (
    <group position={[0, 0, 35]}>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.15, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[20, 0.3, 15]} />
          <meshStandardMaterial color={STONE} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Back wall */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 3, -7.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[20, 6, 0.4]} />
          <meshStandardMaterial color={wallColor} roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Left wall */}
      <RigidBody type="fixed" colliders="cuboid" position={[-9.8, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 6, 15]} />
          <meshStandardMaterial color={wallColor} roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Right wall */}
      <RigidBody type="fixed" colliders="cuboid" position={[9.8, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 6, 15]} />
          <meshStandardMaterial color={wallColor} roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Contents */}
      <Crystal pos={[-5, 0.3, -4]} scale={1.4} />
      <Crystal pos={[0, 0.3, -5]} scale={1.6} rotY={0.7} />
      <Crystal pos={[5, 0.3, -4]} scale={1.3} rotY={1.2} />
      <Trophy pos={[-6, 0.3, 1]} scale={1.5} />
      <Trophy pos={[6, 0.3, 1]} scale={1.5} rotY={Math.PI} />
      {/* Chest-like box */}
      <Chest pos={[0, 0.3, 2]} scale={1.8} />
      {/* Golden vault light */}
      <pointLight color="#ffd644" intensity={4} distance={12} decay={2} position={[0, 3, -2]} />
    </group>
  )
}

// ─── Sacrificial Altar Ring ───────────────────────────────────────
function AltarRing() {
  const COUNT = 6
  const RADIUS = 20
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2
        const x = Math.cos(angle) * RADIUS
        const z = Math.sin(angle) * RADIUS
        return (
          <Altar key={i} pos={[x, 0.3, z]} scale={0.9} rotY={-angle} />
        )
      })}
    </>
  )
}

// ─── Lava glow reflections ────────────────────────────────────────
// PointLights along the two diagonal lava river paths to cast warm orange glow
const LAVA_GLOW_POSITIONS: [number, number, number][] = [
  // NE–SW channel (rotated 45°): sample points along the diagonal
  [22, 0.5, -22],
  [-22, 0.5, 22],
  // NW–SE channel (rotated -45°)
  [-22, 0.5, -22],
  [22, 0.5, 22],
  // Extra lights near pyramid base where channels converge
  [10, 0.5, -10],
  [-10, 0.5, 10],
]

function LavaGlowLights() {
  return (
    <>
      {LAVA_GLOW_POSITIONS.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          color="#ff3300"
          intensity={3}
          distance={15}
          decay={2}
        />
      ))}
    </>
  )
}

// ─── Jungle mist wisps ────────────────────────────────────────────
const MIST_CONFIGS = [
  { pos: [-58, 0.8, 12] as [number, number, number], sx: 7, sy: 0.55, sz: 2.2, phase: 0.0 },
  { pos: [60, 1.1, -18] as [number, number, number], sx: 5.5, sy: 0.45, sz: 1.8, phase: 1.3 },
  { pos: [-45, 0.5, -48] as [number, number, number], sx: 6.0, sy: 0.5, sz: 2.0, phase: 2.7 },
  { pos: [48, 0.6, 46] as [number, number, number], sx: 8.0, sy: 0.6, sz: 2.5, phase: 0.9 },
  { pos: [12, 1.2, -60] as [number, number, number], sx: 4.5, sy: 0.5, sz: 1.6, phase: 3.5 },
  { pos: [-14, 0.7, 62] as [number, number, number], sx: 7.5, sy: 0.55, sz: 2.3, phase: 1.8 },
  { pos: [70, 1.0, 20] as [number, number, number], sx: 5.0, sy: 0.45, sz: 1.7, phase: 4.1 },
  { pos: [-68, 0.9, -35] as [number, number, number], sx: 6.5, sy: 0.5, sz: 2.1, phase: 2.2 },
  { pos: [35, 0.4, 70] as [number, number, number], sx: 7.0, sy: 0.6, sz: 2.4, phase: 5.0 },
  { pos: [-32, 1.3, -66] as [number, number, number], sx: 5.8, sy: 0.48, sz: 1.9, phase: 0.5 },
]
const MIST_COUNT = MIST_CONFIGS.length

function JungleMist() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!meshRef.current) return
    MIST_CONFIGS.forEach((cfg, i) => {
      const x = cfg.pos[0] + Math.sin(t * 0.18 + cfg.phase) * 2.5
      const y = cfg.pos[1] + Math.sin(t * 0.12 + cfg.phase * 0.7) * 0.25
      dummy.position.set(x, y, cfg.pos[2])
      dummy.scale.set(cfg.sx, cfg.sy, cfg.sz)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MIST_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color="#114422"
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

// ─── Jungle fireflies ─────────────────────────────────────────────
const FIREFLY_COLORS = ['#88ff44', '#ffff44', '#44ff88'] as const
const FIREFLY_COUNT = 50
// Split 50 fireflies evenly across 3 color groups (indices 0,1,2 cycle per firefly)
const FIREFLY_PER_COLOR = Math.ceil(FIREFLY_COUNT / FIREFLY_COLORS.length) // 17

function JungleFireflies() {
  const meshRef0 = useRef<THREE.InstancedMesh>(null!)
  const meshRef1 = useRef<THREE.InstancedMesh>(null!)
  const meshRef2 = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  const fireflies = useMemo(() =>
    Array.from({ length: FIREFLY_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const r = 40 + Math.random() * 35
      return {
        x: Math.cos(angle) * r,
        y: 1 + Math.random() * 3,
        z: Math.sin(angle) * r,
        colorIdx: i % FIREFLY_COLORS.length,
        visible: true,
      }
    }), [])

  // Per-color local indices: firefly i belongs to group (i % 3), slot (Math.floor(i/3))
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const refs = [meshRef0.current, meshRef1.current, meshRef2.current]
    // Track per-color instance counter for positioning
    const counters = [0, 0, 0]
    fireflies.forEach((f) => {
      if (Math.random() < 0.002) f.visible = !f.visible
      const ref = refs[f.colorIdx]
      if (!ref) return
      const slot = counters[f.colorIdx]++
      dummy.position.set(f.x, f.y, f.z)
      dummy.scale.setScalar(f.visible ? 1 : 0)
      dummy.updateMatrix()
      ref.setMatrixAt(slot, dummy.matrix)
    })
    refs.forEach((ref) => { if (ref) ref.instanceMatrix.needsUpdate = true })
  })

  return (
    <>
      <instancedMesh ref={meshRef0} args={[undefined, undefined, FIREFLY_PER_COLOR]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 5, 5]} />
        <meshStandardMaterial color={FIREFLY_COLORS[0]} emissive={FIREFLY_COLORS[0]} emissiveIntensity={2.5} />
      </instancedMesh>
      <instancedMesh ref={meshRef1} args={[undefined, undefined, FIREFLY_PER_COLOR]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 5, 5]} />
        <meshStandardMaterial color={FIREFLY_COLORS[1]} emissive={FIREFLY_COLORS[1]} emissiveIntensity={2.5} />
      </instancedMesh>
      <instancedMesh ref={meshRef2} args={[undefined, undefined, FIREFLY_PER_COLOR]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 5, 5]} />
        <meshStandardMaterial color={FIREFLY_COLORS[2]} emissive={FIREFLY_COLORS[2]} emissiveIntensity={2.5} />
      </instancedMesh>
    </>
  )
}

// ─── Pillar / corner glow lights ─────────────────────────────────
// The two scene pillars sit at x=±8, z=33 (entrance). We light those
// plus 4 more at the pyramid base corners for a ring of warm fire glow.
const PILLAR_GLOW_POSITIONS: [number, number, number][] = [
  [-8, 6, 33],   // left entrance pillar top
  [8, 6, 33],    // right entrance pillar top
  [-30, 7, 29],  // tier-1 NW torch pillar
  [30, 7, 29],   // tier-1 NE torch pillar
  [-30, 7, -31], // tier-1 SW torch pillar
  [30, 7, -31],  // tier-1 SE torch pillar
]

function PillarGlowLights() {
  return (
    <>
      {PILLAR_GLOW_POSITIONS.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          color="#ff8822"
          intensity={1.5}
          distance={10}
          decay={2}
        />
      ))}
    </>
  )
}

// ─── Extended lava rivers ─────────────────────────────────────────
function LavaRiversExtended() {
  return (
    <>
      {/* NE–SW channel */}
      <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[3, 0.1, 80]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff2200" emissiveIntensity={1.6} roughness={0.5} />
      </mesh>
      {/* NW–SE channel */}
      <mesh position={[0, 0.08, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[3, 0.1, 80]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff2200" emissiveIntensity={1.6} roughness={0.5} />
      </mesh>
    </>
  )
}

// ─── Extra God Rays ───────────────────────────────────────────────
const EXTRA_GOD_RAY_CONFIGS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-20, 5, -20], rotY: 0.5 },
  { pos: [20, 5, -20], rotY: -0.5 },
  { pos: [0, 5, 20], rotY: 0.1 },
]

function ExtraGodRays() {
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })
  return (
    <>
      {EXTRA_GOD_RAY_CONFIGS.map((cfg, i) => {
        const uniforms = { iTime: { value: 0 } }
        return (
          <mesh key={i} position={cfg.pos} rotation={[0, cfg.rotY, 0]}>
            <coneGeometry args={[4, 12, 10, 1, true]} />
            <shaderMaterial
              ref={(el) => { materialRefs.current[i] = el }}
              vertexShader={GOD_RAY_VERT}
              fragmentShader={GOD_RAY_FRAG}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ─── Extra Dust Motes ─────────────────────────────────────────────
const EXTRA_DUST_COUNT = 200

function ExtraDustMotes() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)
  const particles = useMemo(() => {
    return Array.from({ length: EXTRA_DUST_COUNT }, () => ({
      x: (Math.random() - 0.5) * 80,
      y: Math.random() * 30,
      z: (Math.random() - 0.5) * 80,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.003,
    }))
  }, [])
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      p.y += (p.speed + Math.sin(t * 0.4 + p.phase) * 0.002) * (_isLow ? 2 : 1)
      if (p.y > 32) p.y = 0
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, EXTRA_DUST_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.035, 4, 4]} />
      <meshBasicMaterial color="#c8a060" transparent opacity={0.45} />
    </instancedMesh>
  )
}

// ─── Circular Fog Ring ────────────────────────────────────────────
function CircularFogRing() {
  return (
    <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0, 80, 64]} />
      <meshBasicMaterial color="#1a0a2e" transparent opacity={0.35} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Far Jungle Ring ─────────────────────────────────────────────
const FAR_JUNGLE_TREES: Array<{ pos: [number, number, number]; v: number; ry: number }> = [
  { pos: [-78, 0, 20], v: 0, ry: 0.4 },
  { pos: [80, 0, 30], v: 1, ry: 1.2 },
  { pos: [-82, 0, -30], v: 2, ry: 2.0 },
  { pos: [75, 0, -50], v: 3, ry: 0.7 },
  { pos: [0, 0, 82], v: 4, ry: 1.5 },
  { pos: [-20, 0, -80], v: 0, ry: 2.3 },
  { pos: [85, 0, 10], v: 1, ry: 0.9 },
  { pos: [-70, 0, 60], v: 2, ry: 1.7 },
  { pos: [30, 0, 85], v: 3, ry: 0.3 },
  { pos: [-85, 0, -10], v: 4, ry: 2.8 },
]

const MUSHROOM_POSITIONS: [number, number, number][] = [
  [-50, 0, 5],
  [52, 0, -8],
  [-45, 0, 45],
  [47, 0, 42],
  [-8, 0, 56],
  [10, 0, -58],
]

function FarJungle() {
  return (
    <>
      {FAR_JUNGLE_TREES.map((t, i) => (
        <Tree key={i} pos={t.pos} variant={t.v} rotY={t.ry} />
      ))}
      {MUSHROOM_POSITIONS.map((p, i) => (
        <MushroomGlow key={i} pos={p} scale={1.3} />
      ))}
    </>
  )
}

// ─── Lava Rivers (animated shader cross pattern) ──────────────────
const LAVA_RIVER_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const LAVA_RIVER_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float flow = fract(vUv.y * 3.0 - iTime * 0.8);
    float turbulence = sin(vUv.x * 12.0 + iTime * 2.5) * 0.08 + 0.5 * sin(vUv.y * 8.0 + iTime * 1.5);
    float lavaCore = smoothstep(0.3, 0.7, flow + turbulence * 0.15);
    vec3 hotLava = vec3(1.0, 0.4, 0.0);
    vec3 coolLava = vec3(0.4, 0.05, 0.0);
    vec3 col = mix(coolLava, hotLava, lavaCore);
    gl_FragColor = vec4(col, 0.95);
  }
`

const LAVA_RIVER_CHANNELS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [0, 0.1, 15],   rotY: 0 },             // North
  { pos: [0, 0.1, -15],  rotY: 0 },             // South
  { pos: [15, 0.1, 0],   rotY: Math.PI / 2 },   // East
  { pos: [-15, 0.1, 0],  rotY: Math.PI / 2 },   // West
]

function LavaRivers() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([])
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    matRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })

  return (
    <>
      {LAVA_RIVER_CHANNELS.map((ch, i) => (
        <group key={i} position={ch.pos} rotation={[0, ch.rotY, 0]}>
          <mesh>
            <boxGeometry args={[2, 0.15, 30]} />
            <shaderMaterial
              ref={(el) => { matRefs.current[i] = el }}
              vertexShader={LAVA_RIVER_VERT}
              fragmentShader={LAVA_RIVER_FRAG}
              uniforms={uniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
          <pointLight color="#ff4400" intensity={3} distance={15} decay={2} position={[0, 1, 0]} />
        </group>
      ))}
    </>
  )
}

// ─── Altar Fire Pillars ───────────────────────────────────────────
// 4 fire columns rising from corners around the AltarRing (radius 20)
const ALTAR_FIRE_PILLAR_POSITIONS: [number, number, number][] = [
  [-14, 0, -14],
  [14, 0, -14],
  [-14, 0, 14],
  [14, 0, 14],
]

function AltarFirePillars() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    groupRefs.current.forEach((grp, i) => {
      if (!grp) return
      grp.rotation.y += dt * 2.5 * (i % 2 === 0 ? 1 : -1)
      const s = Math.sin(t * 8 + i) * 0.08 + 0.92
      grp.scale.set(s, s, s)
    })
  })

  return (
    <>
      {ALTAR_FIRE_PILLAR_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <group ref={(el) => { groupRefs.current[i] = el }}>
            {/* Base cone — orange */}
            <mesh position={[0, 0.75, 0]}>
              <coneGeometry args={[0.3, 1.5, 8]} />
              <meshStandardMaterial
                color="#ff4400"
                emissive="#ff2200"
                emissiveIntensity={2.5}
                transparent
                opacity={0.92}
              />
            </mesh>
            {/* Middle cone — yellow */}
            <mesh position={[0, 1.85, 0]}>
              <coneGeometry args={[0.2, 1.2, 8]} />
              <meshStandardMaterial
                color="#ffaa00"
                emissive="#ff8800"
                emissiveIntensity={2.8}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Tip cone — bright yellow/white */}
            <mesh position={[0, 2.75, 0]}>
              <coneGeometry args={[0.1, 0.8, 8]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffee88"
                emissiveIntensity={3.5}
                transparent
                opacity={0.82}
              />
            </mesh>
          </group>
        </group>
      ))}
    </>
  )
}

// ─── PharaohStatues ──────────────────────────────────────────────
function PharaohStatue({ pos }: { pos: [number, number, number] }) {
  const [x, y, z] = pos
  return (
    <group position={[x, y, z]}>
      {/* Base pedestal */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 2, 3]} />
        <meshStandardMaterial color="#c8a030" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 6, 2.5]} />
        <meshStandardMaterial color="#d4ac3a" roughness={0.75} metalness={0.25} />
      </mesh>
      {/* Left arm crossed */}
      <mesh position={[-0.6, 7, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[2.5, 0.8, 0.7]} />
        <meshStandardMaterial color="#d4ac3a" roughness={0.75} />
      </mesh>
      {/* Right arm crossed */}
      <mesh position={[0.6, 7, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[2.5, 0.8, 0.7]} />
        <meshStandardMaterial color="#d4ac3a" roughness={0.75} />
      </mesh>
      {/* Head / Nemes headdress */}
      <mesh position={[0, 9, 0]} castShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#e0b840" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Crown lower (wider base) */}
      <mesh position={[0, 11, 0]} castShadow>
        <boxGeometry args={[2.2, 1.2, 2.2]} />
        <meshStandardMaterial color="#cc2200" roughness={0.6} />
      </mesh>
      {/* Crown upper (narrower top) */}
      <mesh position={[0, 12.4, 0]} castShadow>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color="#cc2200" roughness={0.6} />
      </mesh>
      {/* Left eye marking — emissive */}
      <mesh position={[-0.7, 9.1, 1.52]}>
        <boxGeometry args={[0.6, 0.25, 0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      {/* Right eye marking — emissive */}
      <mesh position={[0.7, 9.1, 1.52]}>
        <boxGeometry args={[0.6, 0.25, 0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      {/* Crook — vertical thin cylinder */}
      <mesh position={[-0.9, 6, 1.3]} rotation={[0.3, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 3.5, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Flail — thin cylinder angled */}
      <mesh position={[0.9, 6, 1.3]} rotation={[0.3, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 3.0, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function PharaohStatues() {
  // 4 statue positions: entrance pair + deep temple pair
  const pairs: Array<{ left: [number, number, number]; right: [number, number, number] }> = [
    { left: [-20, 0, 10],  right: [20, 0, 10]  },  // entrance
    { left: [-20, 0, -50], right: [20, 0, -50] },  // deep temple
  ]
  return (
    <>
      {pairs.map((pair, i) => (
        <group key={i}>
          <PharaohStatue pos={pair.left} />
          <PharaohStatue pos={pair.right} />
          {/* One gold point light per pair */}
          <pointLight
            position={[0, 6, (pair.left[2] + pair.right[2]) / 2]}
            color="#ffd060"
            intensity={5}
            distance={20}
            decay={2}
          />
        </group>
      ))}
    </>
  )
}

// ─── HieroglyphWalls ─────────────────────────────────────────────
function EyeOfRa({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Iris sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} />
      </mesh>
      {/* Flat disc behind */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[0.55, 12]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function AnkhSymbol({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Vertical bar */}
      <mesh>
        <boxGeometry args={[0.15, 0.9, 0.06]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2.5} />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.55, 0.15, 0.06]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2.5} />
      </mesh>
      {/* Loop (circle at top) */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.22, 0.06, 6, 12]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

function ScarabSymbol({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.45, 0.55, 0.08]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2.5} />
      </mesh>
      {/* Leg stubs — 3 on each side */}
      {([-0.22, 0, 0.22] as const).map((yOff, li) => (
        <group key={li}>
          <mesh position={[-0.38, yOff, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.28, 0.07, 0.05]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.38, yOff, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.28, 0.07, 0.05]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function HieroglyphPanel({ pos, rotY = 0 }: { pos: [number, number, number]; rotY?: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Wall panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 8, 0.3]} />
        <meshStandardMaterial color="#c8a820" roughness={0.85} />
      </mesh>
      {/* Hieroglyph symbols on panel face */}
      <EyeOfRa pos={[0, 2.2, 0.2]} />
      <AnkhSymbol pos={[-1.6, -0.5, 0.2]} />
      <ScarabSymbol pos={[1.6, -0.5, 0.2]} />
      <AnkhSymbol pos={[0, -2.8, 0.2]} />
    </group>
  )
}

const HIEROGLYPH_PANEL_CONFIGS: Array<{ pos: [number, number, number]; rotY: number }> = [
  // Left wall (x = -18)
  { pos: [-18, 4, 0],   rotY:  Math.PI / 2 },
  { pos: [-18, 4, -12], rotY:  Math.PI / 2 },
  { pos: [-18, 4, 12],  rotY:  Math.PI / 2 },
  { pos: [-18, 4, -24], rotY:  Math.PI / 2 },
  // Right wall (x = +18)
  { pos: [18, 4, 0],    rotY: -Math.PI / 2 },
  { pos: [18, 4, -12],  rotY: -Math.PI / 2 },
  { pos: [18, 4, 12],   rotY: -Math.PI / 2 },
  { pos: [18, 4, -24],  rotY: -Math.PI / 2 },
]

function HieroglyphWalls() {
  return (
    <>
      {HIEROGLYPH_PANEL_CONFIGS.map((cfg, i) => (
        <HieroglyphPanel key={i} pos={cfg.pos} rotY={cfg.rotY} />
      ))}
    </>
  )
}

// ─── SandDriftParticles ───────────────────────────────────────────
const SAND_COUNT = 150
const TEMPLE_HALF = 55  // wrap bound

function SandDriftParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() =>
    Array.from({ length: SAND_COUNT }, () => ({
      x: (Math.random() - 0.5) * TEMPLE_HALF * 2,
      y: 0.5 + Math.random() * 8,
      z: (Math.random() - 0.5) * TEMPLE_HALF * 2,
      bobPhase: Math.random() * Math.PI * 2,
      driftZ: (Math.random() - 0.5) * 0.008,
    })),
  [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      // Drift east (+x)
      p.x += 0.01
      if (p.x > TEMPLE_HALF) p.x = -TEMPLE_HALF
      // Gentle z drift
      p.z += p.driftZ
      if (p.z > TEMPLE_HALF) p.z = -TEMPLE_HALF
      if (p.z < -TEMPLE_HALF) p.z = TEMPLE_HALF
      // Bob in y
      const y = p.y + Math.sin(t * 0.9 + p.bobPhase) * 0.3
      dummy.position.set(p.x, y, p.z)
      dummy.scale.setScalar(0.08)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SAND_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#d4a853" transparent opacity={0.6} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── PressurePlates ──────────────────────────────────────────────
const PRESSURE_PLATE_CONFIGS: Array<{ pos: [number, number, number]; offset: number }> = [
  // 4 corner trigger plates
  { pos: [-12, 0.04, -12], offset: 0.0 },
  { pos: [12, 0.04, -12],  offset: 0.8 },
  { pos: [-12, 0.04, 12],  offset: 1.6 },
  { pos: [12, 0.04, 12],   offset: 2.4 },
  // 4 along central path (z axis)
  { pos: [0, 0.04, -8],    offset: 0.4 },
  { pos: [0, 0.04, -3],    offset: 1.2 },
  { pos: [0, 0.04, 3],     offset: 2.0 },
  { pos: [0, 0.04, 8],     offset: 2.8 },
]

// Each plate cycles: dim 3s → bright flash 0.3s → dim again (staggered by offset)
// Returns a 0-1 value: 0 = dim, 1 = bright
function platePhase(t: number, offset: number): number {
  const period = 3.3          // full cycle length (3s dim + 0.3s flash)
  const local = ((t + offset) % period + period) % period
  return local > 3.0 ? 1.0 : 0.0
}

function PressurePlates() {
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      const cfg = PRESSURE_PLATE_CONFIGS[i]
      const bright = platePhase(t, cfg.offset)
      mat.emissive.set(bright > 0.5 ? '#ffcc00' : '#886600')
      mat.emissiveIntensity = bright > 0.5 ? 4.0 : 0.5
    })
  })

  return (
    <>
      {PRESSURE_PLATE_CONFIGS.map((cfg, i) => (
        <mesh key={i} position={cfg.pos} receiveShadow>
          <boxGeometry args={[2, 0.08, 2]} />
          <meshStandardMaterial
            ref={(el) => { matRefs.current[i] = el }}
            color="#c8a820"
            emissive="#886600"
            emissiveIntensity={0.5}
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── DartTraps ────────────────────────────────────────────────────
// 4 dart launchers embedded in x:±20 walls.
// Each dart shoots out on X axis 0→3 units then retracts, timed to nearby pressure plates.
const DART_TRAP_CONFIGS: Array<{
  pos: [number, number, number]
  dir: 1 | -1   // +1 = shoots in +x direction (left wall), -1 = shoots in -x (right wall)
  offset: number
}> = [
  { pos: [-20, 1.2, -8],  dir:  1, offset: 0.4 },
  { pos: [-20, 1.2,  8],  dir:  1, offset: 2.0 },
  { pos: [20, 1.2, -8],   dir: -1, offset: 1.2 },
  { pos: [20, 1.2,  8],   dir: -1, offset: 2.8 },
]

function DartTrap({
  pos,
  dir,
  offset,
}: {
  pos: [number, number, number]
  dir: 1 | -1
  offset: number
}) {
  const dartRef = useRef<THREE.Mesh>(null!)
  // 3 puff spheres
  const puffRefs = useRef<(THREE.Mesh | null)[]>([])

  const puffAngles = useMemo(() => [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3], [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const period = 3.3
    const local = ((t + offset) % period + period) % period
    const shooting = local < 0.5  // dart extends for 0.5s, then retracts

    // Dart travel: 0 → 3 units along X direction
    if (dartRef.current) {
      const travel = shooting ? (local / 0.5) * 3 * dir : ((0.5 - Math.min(local - 0.5, 0.5)) / 0.5) * 3 * dir
      dartRef.current.position.x = travel
    }

    // Puff particles: fan out and fade when dart just fired
    const puffActive = local < 0.4
    puffRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      if (puffActive) {
        const progress = local / 0.4
        const angle = puffAngles[i]
        mesh.position.x = dir * (2 + progress * 1.5)
        mesh.position.y = Math.sin(angle) * progress * 0.8
        mesh.position.z = Math.cos(angle) * progress * 0.8
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.opacity = 1 - progress
        mesh.visible = true
      } else {
        mesh.visible = false
      }
    })
  })

  return (
    <group position={pos}>
      {/* Launcher housing */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.4, 0.4]} />
        <meshStandardMaterial color="#888866" roughness={0.8} />
      </mesh>
      {/* Dart */}
      <mesh ref={dartRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 6]} />
        <meshStandardMaterial color="#999999" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Puff particles */}
      {puffAngles.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { puffRefs.current[i] = el }}
          visible={false}
        >
          <sphereGeometry args={[0.12, 5, 5]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={3}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  )
}

function DartTraps() {
  return (
    <>
      {DART_TRAP_CONFIGS.map((cfg, i) => (
        <DartTrap key={i} pos={cfg.pos} dir={cfg.dir} offset={cfg.offset} />
      ))}
    </>
  )
}

// ─── SecretDoor ───────────────────────────────────────────────────
// A hidden door at far wall z: -55. Slowly oscillates open just a crack.
function SecretDoor() {
  const doorRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (doorRef.current) {
      doorRef.current.rotation.y = Math.sin(t * 0.3) * 0.15
    }
  })

  return (
    <group position={[0, 0, -55]}>
      {/* Frame: left pillar */}
      <mesh position={[-3.4, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 6, 0.6]} />
        <meshStandardMaterial color="#c8a820" roughness={0.85} />
      </mesh>
      {/* Frame: right pillar */}
      <mesh position={[3.4, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 6, 0.6]} />
        <meshStandardMaterial color="#c8a820" roughness={0.85} />
      </mesh>
      {/* Frame: lintel */}
      <mesh position={[0, 6.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.8, 0.6]} />
        <meshStandardMaterial color="#c8a820" roughness={0.85} />
      </mesh>

      {/* Door panel — hinged at left edge (pivot offset) */}
      <group ref={doorRef} position={[-2, 0, 0]}>
        <mesh position={[2, 2.75, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[4, 5.5, 0.3]} />
          <meshStandardMaterial color="#b89020" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Eye of Ra symbol cluster on door face */}
        <mesh position={[2, 3.2, 0.12]}>
          <sphereGeometry args={[0.28, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[1.6, 3.2, 0.1]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2.4, 3.2, 0.1]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
        </mesh>
        <mesh position={[2, 3.55, 0.1]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
        </mesh>
        {/* Mysterious green glow leaking through the gap, behind door */}
        <pointLight color="#44ff88" intensity={2} distance={4} position={[2, 2.75, -0.8]} />
      </group>
    </group>
  )
}

// ─── SphinxStatue ─────────────────────────────────────────────────
// One large sphinx at the temple entrance (z: 20)
function SphinxStatue() {
  return (
    <group position={[0, 0, 20]}>
      {/* Lion body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 8]} />
        <meshStandardMaterial color="#d4b050" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 4.5, 3.2]} castShadow>
        <sphereGeometry args={[1.5, 10, 10]} />
        <meshStandardMaterial color="#d4b050" roughness={0.8} />
      </mesh>
      {/* Nemes headdress */}
      <mesh position={[0, 5.2, 3.0]} castShadow>
        <boxGeometry args={[3, 2.5, 2.5]} />
        <meshStandardMaterial color="#cc9930" roughness={0.75} metalness={0.2} />
      </mesh>
      {/* Front left paw */}
      <mesh position={[-1.2, 0.6, -3.5]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 3, 8]} />
        <meshStandardMaterial color="#d4b050" roughness={0.85} />
      </mesh>
      {/* Front right paw */}
      <mesh position={[1.2, 0.6, -3.5]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 3, 8]} />
        <meshStandardMaterial color="#d4b050" roughness={0.85} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 4.3, 4.62]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#b89030" roughness={0.9} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.55, 4.7, 4.55]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.55, 4.7, 4.55]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} />
      </mesh>
      {/* Eye glow light */}
      <pointLight color="#ffcc00" intensity={3} distance={10} decay={2} position={[0, 4.7, 4.6]} />
    </group>
  )
}

// ─── MummyCreature ────────────────────────────────────────────────
const MUMMY_OVAL_RX = 8   // x semi-axis of patrol oval
const MUMMY_OVAL_RZ = 5   // z semi-axis
const MUMMY_BASE: [number, number, number] = [-35, 0, -30]  // curse chamber centre

function MummyCreature() {
  const groupRef   = useRef<THREE.Group>(null!)
  const bodyRef    = useRef<THREE.Mesh>(null!)
  const armLRef    = useRef<THREE.Mesh>(null!)
  const armRRef    = useRef<THREE.Mesh>(null!)
  const dustRefs   = useRef<(THREE.Mesh | null)[]>([])
  const phase      = useRef(0)

  // Pre-compute dust offsets
  const dustOffsets = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      ox: (Math.random() - 0.5) * 1.2,
      oz: (Math.random() - 0.5) * 1.2,
      bobPhase: Math.random() * Math.PI * 2,
    })), [])

  useFrame(({ clock }, dt) => {
    phase.current += dt * 0.35   // slow lurch
    const t = clock.getElapsedTime()
    const ang = phase.current

    // Oval patrol
    const px = MUMMY_BASE[0] + Math.cos(ang) * MUMMY_OVAL_RX
    const pz = MUMMY_BASE[2] + Math.sin(ang) * MUMMY_OVAL_RZ
    if (groupRef.current) {
      groupRef.current.position.set(px, MUMMY_BASE[1], pz)
      // Face direction of travel
      groupRef.current.rotation.y = -ang + Math.PI / 2
    }

    // Body sway
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 0.8) * 0.15
    }

    // Arms bob
    const armY = 0.35 + Math.sin(t * 0.6) * 0.12
    if (armLRef.current) armLRef.current.position.y = armY
    if (armRRef.current) armRRef.current.position.y = armY

    // Dust trail (behind mummy)
    dustRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const d = dustOffsets[i]
      const trailX = px - Math.cos(ang) * 1.0 + d.ox
      const trailZ = pz - Math.sin(ang) * 1.0 + d.oz
      const fade = 0.15 + Math.sin(t * 1.2 + d.bobPhase) * 0.1
      mesh.position.set(trailX, 0.15 + Math.sin(t + d.bobPhase) * 0.1, trailZ)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = fade
    })
  })

  return (
    <group ref={groupRef} position={MUMMY_BASE}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.8, 10]} />
        <meshStandardMaterial color="#ccbb99" roughness={0.9} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color="#ccbb99" roughness={0.9} />
      </mesh>

      {/* Bandage strips — 7 thin boxes at varied angles across body */}
      {([
        [0, 0.6, 0, 0.0],
        [0, 0.9, 0, 0.3],
        [0, 1.2, 0, -0.2],
        [0, 1.5, 0, 0.5],
        [0, 1.8, 0, -0.4],
        [0, 2.1, 0, 0.15],
        [0, 2.35, 0, -0.1],
      ] as [number, number, number, number][]).map(([bx, by, bz, rz], si) => (
        <mesh key={si} position={[bx, by, bz]} rotation={[0, 0, rz]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.08]} />
          <meshStandardMaterial color="#ddcc99" roughness={0.85} />
        </mesh>
      ))}

      {/* Glowing red eyes */}
      <mesh position={[-0.15, 2.58, 0.38]}>
        <sphereGeometry args={[0.12, 7, 7]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff4400" emissiveIntensity={6} />
      </mesh>
      <mesh position={[0.15, 2.58, 0.38]}>
        <sphereGeometry args={[0.12, 7, 7]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff4400" emissiveIntensity={6} />
      </mesh>
      <pointLight color="#ff2200" intensity={2} distance={5} decay={2} position={[0, 2.58, 0.5]} />

      {/* Left arm — extended forward (zombie pose) */}
      <mesh
        ref={armLRef}
        position={[-0.65, 0.35, 0.45]}
        rotation={[-0.7, 0, -0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
        <meshStandardMaterial color="#ccbb99" roughness={0.9} />
      </mesh>

      {/* Right arm — extended forward */}
      <mesh
        ref={armRRef}
        position={[0.65, 0.35, 0.45]}
        rotation={[-0.7, 0, 0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 1.2, 8]} />
        <meshStandardMaterial color="#ccbb99" roughness={0.9} />
      </mesh>

      {/* Dust trail particles */}
      {dustOffsets.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => { dustRefs.current[i] = el }}
          position={[d.ox, 0.15, d.oz]}
        >
          <sphereGeometry args={[0.12, 5, 5]} />
          <meshBasicMaterial color="#ccaa77" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── CurseChamber ─────────────────────────────────────────────────
const CURSE_X = -35
const CURSE_Z = -30

// Green mist InstancedMesh for the curse chamber
const CURSE_MIST_COUNT = 25
function CurseMist() {
  const meshRef  = useRef<THREE.InstancedMesh>(null!)
  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() =>
    Array.from({ length: CURSE_MIST_COUNT }, () => ({
      ox: (Math.random() - 0.5) * 18,
      oz: (Math.random() - 0.5) * 14,
      bobPhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.06 + Math.random() * 0.05,
    })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      const x = CURSE_X + p.ox + Math.sin(t * p.driftSpeed + p.bobPhase) * 1.5
      const y = 0.25 + Math.sin(t * 0.4 + p.bobPhase) * 0.15
      const z = CURSE_Z + p.oz + Math.cos(t * p.driftSpeed * 0.8 + p.bobPhase) * 1.2
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(0.9 + Math.sin(t * 0.3 + p.bobPhase) * 0.2)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CURSE_MIST_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 7, 7]} />
      <meshBasicMaterial color="#004400" transparent opacity={0.25} depthWrite={false} />
    </instancedMesh>
  )
}

function CurseChamber() {
  const cx = CURSE_X
  const cz = CURSE_Z
  return (
    <group>
      {/* ── Sarcophagus ── */}
      {/* Outer casing */}
      <mesh position={[cx, 0.5, cz]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 0.8]} />
        <meshStandardMaterial color="#c8a820" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Lid — slightly ajar */}
      <mesh position={[cx, 1.1, cz]} rotation={[- 0.3, 0, 0]} castShadow>
        <boxGeometry args={[2.1, 1.1, 0.15]} />
        <meshStandardMaterial color="#d4b030" roughness={0.75} metalness={0.25} />
      </mesh>
      {/* Mummy wrapping strips visible inside */}
      {([0, 0.25, 0.5] as const).map((oz, i) => (
        <mesh key={i} position={[cx, 0.55, cz - 0.1 + oz * 0.15]}>
          <boxGeometry args={[1.7, 0.1, 0.6]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.9} />
        </mesh>
      ))}

      {/* ── Curse aura pillars (4 corners square ~4 units) ── */}
      {([
        [cx - 4, cz - 4],
        [cx + 4, cz - 4],
        [cx - 4, cz + 4],
        [cx + 4, cz + 4],
      ] as [number, number][]).map(([px, pz], i) => (
        <group key={i} position={[px, 0, pz]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
            <meshStandardMaterial
              color="#004400"
              emissive="#00ff44"
              emissiveIntensity={3}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight color="#00ff44" intensity={2.5} distance={8} decay={2} position={[0, 1.5, 0]} />
        </group>
      ))}

      {/* ── Green curse mist (InstancedMesh, see CurseMist) ── */}
      {/* rendered separately below */}

      {/* ── Canopic jars — 4 around sarcophagus ── */}
      {([
        [cx - 1.6, cz + 1.0],
        [cx + 1.6, cz + 1.0],
        [cx - 1.6, cz - 1.0],
        [cx + 1.6, cz - 1.0],
      ] as [number, number][]).map(([jx, jz], i) => (
        <group key={i} position={[jx, 0, jz]}>
          {/* Jar body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.25, 0.7, 8]} />
            <meshStandardMaterial color="#c8a030" roughness={0.8} metalness={0.1} />
          </mesh>
          {/* Sphere lid */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.28, 7, 7]} />
            <meshStandardMaterial color="#c8a030" roughness={0.8} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ── Warning hieroglyph: skull on the wall behind sarcophagus ── */}
      {/* Positioned on a small wall segment or floating near z-3.5 */}
      <group position={[cx, 2.5, cz - 3.2]}>
        {/* Skull sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.55, 10, 10]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={3} />
        </mesh>
        {/* Jaw box */}
        <mesh position={[0, -0.45, 0.2]}>
          <boxGeometry args={[0.7, 0.3, 0.35]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={3} />
        </mesh>
        {/* Eye sockets */}
        <mesh position={[-0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#220000" roughness={1} />
        </mesh>
        <mesh position={[0.18, 0.1, 0.5]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#220000" roughness={1} />
        </mesh>
        <pointLight color="#ff8800" intensity={3} distance={7} decay={2} position={[0, 0, 0.6]} />
      </group>

      {/* ── Ambient curse light ── */}
      <pointLight color="#00ff44" intensity={1.5} distance={14} decay={2} position={[cx, 2, cz]} />
    </group>
  )
}

// ─── TombRaiderSkeletons ──────────────────────────────────────────
// Three defeated explorer skeletons near the curse chamber

function SkeletonExplorer({
  pos,
  rotY = 0,
  hasHat = false,
}: {
  pos: [number, number, number]
  rotY?: number
  hasHat?: boolean
}) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Skeleton is collapsed flat — overall group tilted */}
      <group rotation={[Math.PI / 2, 0, 0.3]}>
        {/* Skull */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>
        {/* Jaw */}
        <mesh position={[0, 0.7, 0.1]}>
          <boxGeometry args={[0.3, 0.12, 0.18]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>

        {/* Ribcage */}
        {([0.22, 0.45, 0.68] as const).map((ry, i) => (
          <mesh key={i} position={[0, ry, 0]} castShadow>
            <boxGeometry args={[0.55, 0.12, 0.3]} />
            <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
          </mesh>
        ))}

        {/* Spine */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>

        {/* Left arm */}
        <mesh position={[-0.55, 0.5, 0]} rotation={[0, 0, 1.1]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.55, 0.5, 0]} rotation={[0, 0, -1.1]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>

        {/* Pelvis */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.4, 0.15, 0.28]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>

        {/* Left leg */}
        <mesh position={[-0.18, -0.5, 0]} rotation={[0, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.18, -0.5, 0]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} />
        </mesh>
      </group>

      {/* Explorer hat (on one skeleton) */}
      {hasHat && (
        <group position={[0, 0.18, 0.55]} rotation={[0.15, 0, 0]}>
          {/* Brim */}
          <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.07, 10]} />
            <meshStandardMaterial color="#663300" roughness={0.9} />
          </mesh>
          {/* Crown (cone) */}
          <mesh position={[0, 0.22, 0]}>
            <coneGeometry args={[0.22, 0.35, 10]} />
            <meshStandardMaterial color="#663300" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Scattered prop: old lantern
function OldLantern({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos} rotation={[0.4, 0.5, 0.3]}>
      {/* Frame box */}
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <meshStandardMaterial color="#555533" roughness={0.8} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* Dim inner glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color="#ff9900" emissive="#ff9900" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#ff9900" intensity={0.6} distance={3} decay={2} />
    </group>
  )
}

// Scattered prop: whip coil
function WhipCoil({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos} rotation={[Math.PI / 2, 0.2, 0]}>
      <mesh>
        <torusGeometry args={[0.22, 0.03, 5, 14]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
    </group>
  )
}

function TombRaiderSkeletons() {
  const cx = CURSE_X
  const cz = CURSE_Z
  return (
    <group>
      {/* Skeleton 1 — with explorer hat, near entrance of curse chamber */}
      <SkeletonExplorer pos={[cx + 5, 0, cz + 3]} rotY={0.8} hasHat />
      {/* Skeleton 2 — sprawled to the left */}
      <SkeletonExplorer pos={[cx - 4, 0, cz + 4]} rotY={2.3} />
      {/* Skeleton 3 — near sarcophagus, like they got too close */}
      <SkeletonExplorer pos={[cx + 2, 0, cz - 3]} rotY={-0.5} />

      {/* Scattered props */}
      <OldLantern pos={[cx + 5.5, 0.15, cz + 1.5]} />
      <OldLantern pos={[cx - 4.5, 0.15, cz + 2.8]} />
      <WhipCoil pos={[cx + 4, 0.05, cz + 3.5]} />
    </group>
  )
}

// ─── Moving Boulders ─────────────────────────────────────────────
function MovingBoulder({
  startPos,
  travel,
  speed = 0.5,
}: {
  startPos: [number, number, number]
  travel: number
  speed?: number
}) {
  const rbRef = useRef<RapierRigidBody>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * speed
    if (!rbRef.current) return
    const nx = startPos[0] + Math.sin(phase.current) * travel
    rbRef.current.setNextKinematicTranslation({ x: nx, y: startPos[1], z: startPos[2] })
  })
  return (
    <RigidBody ref={rbRef} type="kinematicPosition" colliders="ball" position={startPos}>
      <mesh castShadow>
        <sphereGeometry args={[1.5, 10, 10]} />
        <meshStandardMaterial color="#3a3535" roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function TempleWorld() {
  return (
    <>
      {/* ── Atmosphere ── */}
      <GradientSky top="#0a0520" bottom="#1a0830" radius={440} />
      <DustMotes />
      <RunePads />
      <GodRays />

      <Ground />
      <Walls />
      <Moat />

      {/* ── Pyramid tiers ── */}
      {TIERS.map((t, i) => (
        <PyramidBlock
          key={`tier${i}`}
          pos={[0, t.centerY, 0]}
          size={[t.halfW * 2, t.h, t.halfD * 2]}
          color={i % 2 === 0 ? STONE : MOSS}
        />
      ))}
      {/* Apex temple block */}
      <PyramidBlock pos={[0, 32, 0]} size={[8, 8, 8]} color={DARK_STONE} />

      {/* Decorative stripes on tier faces */}
      <TierStripe pos={[0, 7.12, 30.05]} size={[60, 0.25, 0.15]} />
      <TierStripe pos={[0, 14.12, 23.05]} size={[46, 0.25, 0.15]} />
      <TierStripe pos={[0, 21.12, 16.05]} size={[32, 0.25, 0.15]} />
      <TierStripe pos={[0, 28.12, 9.05]} size={[18, 0.25, 0.15]} />

      {/* Lava channels on tier1 east/west faces */}
      <LavaChannel pos={[30.08, 4, 0]} size={[0.15, 3, 50]} />
      <LavaChannel pos={[-30.08, 4, 0]} size={[0.15, 3, 50]} />
      <LavaChannel pos={[0, 4, 30.08]} size={[50, 3, 0.15]} />

      {/* ── Staircases ── */}
      <Staircase yBase={0} zFace={30} width={12} />
      <Staircase yBase={7} zFace={23} width={10} />
      <Staircase yBase={14} zFace={16} width={8} />
      <Staircase yBase={21} zFace={9} width={6} />
      <ApexStaircase />

      {/* Side platforms (east alcoves with coins) */}
      <PyramidBlock pos={[35, 7.25, -10]} size={[8, 0.5, 8]} color={MOSS} />
      <PyramidBlock pos={[35, 7.25, 10]} size={[8, 0.5, 8]} color={MOSS} />
      <PyramidBlock pos={[-35, 14.25, 0]} size={[8, 0.5, 12]} color={MOSS} />

      {/* ── Moving platforms on tier 3 ── */}
      <MovingPlatform startPos={[0, 21.5, -4]} travel={4.5} speed={0.55} />
      <MovingPlatform startPos={[0, 21.5, 4]} travel={4} speed={0.7} />

      {/* ── Rotating spinner on tier 4 ── */}
      <Spinner pos={[0, 28.4, 0]} speed={0.8} />

      {/* ── Apex ── */}
      <ApexFloor />

      {/* ── Braziers ── */}
      <Brazier pos={[-25, 7.1, 29]} />
      <Brazier pos={[25, 7.1, 29]} />
      <Brazier pos={[-18, 14.1, 22]} />
      <Brazier pos={[18, 14.1, 22]} />
      <Brazier pos={[-10, 21.1, 15]} />
      <Brazier pos={[10, 21.1, 15]} />
      <Brazier pos={[-3, 28.1, 8]} />
      <Brazier pos={[3, 28.1, 8]} />
      <Brazier pos={[-2.5, 36.1, 3]} />
      <Brazier pos={[2.5, 36.1, 3]} />

      {/* ── Enemies (one per tier level) ── */}
      <Enemy pos={[0, 8.5, 15]} patrolX={10} color="#ff8c1a" />
      <Enemy pos={[0, 8.5, -10]} patrolX={8} color="#c879ff" />
      <Enemy pos={[0, 15.5, 5]} patrolX={7} color="#ff5464" />
      <Enemy pos={[0, 22.5, -3]} patrolX={5} color="#4c97ff" />
      {/* Apex boss — BossGolem replaces GltfMonster for more visual impact */}
      <BossGolem pos={[0, 36.1, -1]} scale={1.5} rotY={Math.PI} />

      {/* ── Coins ── */}
      {/* Tier 1 */}
      <Coin pos={[-20, 8.5, 20]} />
      <Coin pos={[20, 8.5, 20]} />
      <Coin pos={[-20, 8.5, -10]} />
      <Coin pos={[20, 8.5, -10]} />
      <Coin pos={[0, 8.5, -20]} />
      {/* Side alcove coins */}
      <Coin pos={[35, 8.5, -10]} />
      <Coin pos={[35, 8.5, 10]} />
      <Coin pos={[-35, 15.5, 0]} />
      <Coin pos={[-35, 15.5, 4]} />
      {/* Tier 2 */}
      <Coin pos={[-13, 15.5, 12]} />
      <Coin pos={[13, 15.5, 12]} />
      <Coin pos={[0, 15.5, -12]} />
      {/* Tier 3 */}
      <Coin pos={[-6, 22.5, 6]} />
      <Coin pos={[6, 22.5, 6]} />
      <Coin pos={[0, 22.5, -6]} />
      {/* Moving platform coins */}
      <Coin pos={[0, 23, -4]} />
      <Coin pos={[0, 23, 4]} />
      {/* Tier 4 */}
      <Coin pos={[-4, 29.5, 4]} />
      <Coin pos={[4, 29.5, 4]} />
      {/* Staircase coins */}
      <Coin pos={[6, 9, 26]} />
      <Coin pos={[5, 16, 20]} />
      <Coin pos={[4, 23, 13]} />
      <Coin pos={[3, 30, 7]} />
      {/* Apex */}
      <Coin pos={[0, 37.5, 2]} value={5} />

      {/* ── Temple entrance gate + torch pillars ── */}
      <Gate pos={[0, 0, 38]} scale={2.0} />
      <Altar pos={[0, 36, -2]} scale={1.5} />
      <Torch pos={[-5, 0, 33]} scale={1.6} />
      <Torch pos={[5, 0, 33]} scale={1.6} />
      <Pillar pos={[-8, 0, 33]} scale={1.4} />
      <Pillar pos={[8, 0, 33]} scale={1.4} />
      {/* Tier 1 corners */}
      <Torch pos={[-30, 7, 29]} scale={1.2} />
      <Torch pos={[30, 7, 29]} scale={1.2} />
      <Torch pos={[-30, 7, -31]} scale={1.2} rotY={Math.PI} />
      <Torch pos={[30, 7, -31]} scale={1.2} rotY={Math.PI} />
      {/* Tier 2 corners */}
      <Torch pos={[-23, 14, 22]} scale={1.0} />
      <Torch pos={[23, 14, 22]} scale={1.0} />

      {/* ── Jungle ── */}
      <Jungle />

      {/* ── Ancient Idols — Mesoamerican totems flanking the pyramid base ── */}
      <AncientIdol pos={[-28, 0, 32]} scale={2.2} rotY={0.4} />
      <pointLight position={[-28, 4, 32]} color="#ffaa00" intensity={4} distance={12} decay={2} />
      <AncientIdol pos={[28, 0, 32]} scale={2.2} rotY={-0.4} />
      <pointLight position={[28, 4, 32]} color="#ffaa00" intensity={4} distance={12} decay={2} />
      <AncientIdol pos={[-28, 0, -32]} scale={2.2} rotY={Math.PI + 0.4} />
      <pointLight position={[-28, 4, -32]} color="#ff7700" intensity={3.5} distance={12} decay={2} />
      <AncientIdol pos={[28, 0, -32]} scale={2.2} rotY={Math.PI - 0.4} />
      <pointLight position={[28, 4, -32]} color="#ff7700" intensity={3.5} distance={12} decay={2} />

      {/* ── Guardian Statues at pyramid corners ── */}
      <GuardianStatue pos={[-40, 0, -40]} />
      <GuardianStatue pos={[40, 0, -40]} />
      <GuardianStatue pos={[-40, 0, 40]} />
      <GuardianStatue pos={[40, 0, 40]} />

      {/* ── Treasure Vault ── */}
      <TreasureVault />

      {/* ── Sacrificial Altar Ring ── */}
      <AltarRing />

      {/* ── Animated Lava Rivers (shader cross pattern) ── */}
      <LavaRivers />

      {/* ── Altar Fire Pillars ── */}
      <AltarFirePillars />

      {/* ── Extended Lava Rivers ── */}
      <LavaRiversExtended />

      {/* ── Lava glow reflections along river paths ── */}
      <LavaGlowLights />

      {/* ── Jungle mist wisps drifting at ground level ── */}
      <JungleMist />

      {/* ── Jungle fireflies blinking in the canopy ── */}
      <JungleFireflies />

      {/* ── Pillar / corner warm glow lights ── */}
      <PillarGlowLights />

      {/* ── Extra God Rays ── */}
      <ExtraGodRays />

      {/* ── Extra Dust Motes ── */}
      <ExtraDustMotes />

      {/* ── Circular Fog Ring ── */}
      <CircularFogRing />

      {/* ── Far Jungle ── */}
      <FarJungle />

      {/* ── Moving Boulders on pyramid tiers ── */}
      <MovingBoulder startPos={[0, 8.5, 10]} travel={12} speed={0.45} />
      <MovingBoulder startPos={[0, 22.5, 4]} travel={6} speed={0.7} />

      {/* ── Extra Enemies on pyramid tiers ── */}
      <Enemy pos={[-15, 8.5, 15]} patrolX={8} color="#ff8c1a" />
      <Enemy pos={[15, 8.5, 15]} patrolX={8} color="#c879ff" />
      <Enemy pos={[-10, 15.5, 10]} patrolX={6} color="#ff5464" />
      <Enemy pos={[10, 15.5, 10]} patrolX={6} color="#4c97ff" />
      <Enemy pos={[-5, 22.5, 5]} patrolX={4} color="#ff8c1a" />
      <Enemy pos={[5, 22.5, 5]} patrolX={4} color="#c879ff" />
      <Enemy pos={[-3, 29.5, 3]} patrolX={3} color="#ff5464" />
      <Enemy pos={[3, 29.5, 3]} patrolX={3} color="#4c97ff" />

      {/* ── Extra Coins on tiers and vault ── */}
      {/* Tier 1 extras */}
      <Coin pos={[-25, 8.5, 0]} />
      <Coin pos={[25, 8.5, 0]} />
      <Coin pos={[0, 8.5, -25]} />
      {/* Tier 2 extras */}
      <Coin pos={[-12, 15.5, -8]} />
      <Coin pos={[12, 15.5, -8]} />
      {/* Tier 3 extras */}
      <Coin pos={[-5, 22.5, -4]} />
      <Coin pos={[5, 22.5, -4]} />
      {/* Vault coins */}
      <Coin pos={[-3, 1.5, 30]} />
      <Coin pos={[3, 1.5, 30]} />
      <Coin pos={[0, 1.5, 28]} />
      <Coin pos={[-6, 1.5, 28]} />
      <Coin pos={[6, 1.5, 28]} />
      {/* Near guardian statues */}
      <Coin pos={[-40, 1.5, -38]} />
      <Coin pos={[40, 1.5, -38]} />
      <Coin pos={[-40, 1.5, 38]} />
      <Coin pos={[40, 1.5, 38]} value={2} />
      <Coin pos={[0, 1.5, -28]} />

      {/* ── Rune Obelisks at pyramid base corners ── */}
      <RuneObelisks />

      {/* ── Pharaoh Statues flanking entrance + deep temple ── */}
      <PharaohStatues />

      {/* ── Hieroglyph wall panels along temple walls ── */}
      <HieroglyphWalls />

      {/* ── Sand drift particles drifting through temple ── */}
      <SandDriftParticles />

      {/* ── Scorpion guardians — patrolling the temple approach ── */}
      <Scorpion pos={[-18, 0, 28]}  scale={1.3} rotY={0.6}  />
      <Scorpion pos={[ 18, 0, 28]}  scale={1.3} rotY={5.7}  />
      <Scorpion pos={[-12, 0, -35]} scale={1.1} rotY={2.1}  />
      <Scorpion pos={[ 12, 0, -35]} scale={1.1} rotY={4.3}  />
      <Scorpion pos={[-28, 0,  0]}  scale={1.2} rotY={1.8}  />
      <Scorpion pos={[ 28, 0,  0]}  scale={1.2} rotY={3.9}  />

      {/* ── Goal ── */}
      <GoalTrigger
        pos={[0, 39, 0]}
        size={[8, 4, 8]}
        result={{
          kind: 'win',
          label: 'ВЕРШИНА ХРАМА!',
          subline: 'Ты покорил пирамиду Майя и добрался до золотого алтаря!',
        }}
      />

      {/* ── Final Guardian Boss near the altar ── */}
      {/* Faces the player (south = +z direction), positioned at the back of the altar area */}
      <BossGolem pos={[0, 1, -38]} scale={2.2} rotY={0} />

      {/* ── Lava Rocks along the lava rivers ── */}
      <LavaRock pos={[-8, 0, -20]} scale={1.3} rotY={0.5} />
      <LavaRock pos={[8, 0, -20]} scale={1.1} rotY={1.2} />
      <LavaRock pos={[-12, 0, -8]} scale={1.4} rotY={2.0} />
      <LavaRock pos={[12, 0, -8]} scale={1.2} rotY={0.8} />
      <LavaRock pos={[-6, 0, 12]} scale={1.0} rotY={1.5} />
      <LavaRock pos={[6, 0, 12]} scale={1.3} rotY={2.7} />

      {/* ── Crystal Clusters around the crystal formations area ── */}
      <CrystalCluster pos={[-5, 0.3, -42]} scale={1.5} rotY={0.3} />
      <CrystalCluster pos={[5, 0.3, -42]} scale={1.3} rotY={1.1} />
      <CrystalCluster pos={[-10, 0.3, -38]} scale={1.2} rotY={2.0} />
      <CrystalCluster pos={[10, 0.3, -38]} scale={1.4} rotY={0.7} />
      <CrystalCluster pos={[-3, 0.3, -45]} scale={1.1} rotY={1.8} />
      <CrystalCluster pos={[3, 0.3, -45]} scale={1.6} rotY={0.2} />
      <CrystalCluster pos={[-15, 0.3, -32]} scale={1.0} rotY={2.5} />
      <CrystalCluster pos={[15, 0.3, -32]} scale={1.2} rotY={1.4} />

      {/* ── Palm Trees near the entrance area ── */}
      <PalmTree pos={[-15, 0, 45]} scale={1.6} rotY={0.4} />
      <PalmTree pos={[15, 0, 45]} scale={1.5} rotY={-0.3} />

      {/* ── RuinsPillar — broken ancient columns flanking courtyard paths ── */}
      {/* North path (entrance side) */}
      <RuinsPillar pos={[-18, 0, 42]} scale={1.3} rotY={0.2} />
      <RuinsPillar pos={[18, 0, 42]} scale={1.2} rotY={-0.3} />
      {/* East path */}
      <RuinsPillar pos={[42, 0, 15]} scale={1.4} rotY={1.1} />
      <RuinsPillar pos={[42, 0, -15]} scale={1.1} rotY={0.8} />
      {/* West path */}
      <RuinsPillar pos={[-42, 0, 15]} scale={1.3} rotY={-0.5} />
      <RuinsPillar pos={[-42, 0, -15]} scale={1.2} rotY={2.0} />
      {/* South rear courtyard */}
      <RuinsPillar pos={[-20, 0, -50]} scale={1.5} rotY={0.6} />
      <RuinsPillar pos={[20, 0, -50]} scale={1.2} rotY={-0.9} />

      {/* ── Booby Trap: Pressure Plates on temple floor ── */}
      <PressurePlates />

      {/* ── Booby Trap: Dart Launchers on x:±20 walls ── */}
      <DartTraps />

      {/* ── Secret Door at far wall z:-55 ── */}
      <SecretDoor />

      {/* ── Sphinx Statue at temple entrance ── */}
      <SphinxStatue />

      {/* ── Curse Chamber — mummy's lair at x:-35 z:-30 ── */}
      <CurseChamber />
      <CurseMist />

      {/* ── Mummy Creature patrolling the curse chamber ── */}
      <MummyCreature />

      {/* ── Tomb Raider Skeletons — defeated explorers ── */}
      <TombRaiderSkeletons />
    </>
  )
}

export const TEMPLE_SPAWN: [number, number, number] = [0, 3, 55]
