import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, GrassTuft, Torch, Pillar } from '../Scenery'
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
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const particles = useMemo(() => {
    return Array.from({ length: DUST_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 30,
      y: Math.random() * DUST_CEILING,
      z: (Math.random() - 0.5) * 30,
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.002,
      index: i,
    }))
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      mesh.position.y += p.speed + Math.sin(t * 0.5 + p.phase) * 0.002
      if (mesh.position.y > DUST_CEILING) {
        mesh.position.y = 0
      }
    })
  })

  return (
    <>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[p.x, p.y, p.z]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#d4a870" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
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
      {/* Apex boss */}
      <GltfMonster which="blueDemon" pos={[0, 36.1, -1]} scale={1.5} rotY={Math.PI} animation="Wave" />

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

      {/* ── Temple torch pillars flanking entrance ── */}
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
    </>
  )
}

export const TEMPLE_SPAWN: [number, number, number] = [0, 3, 55]
