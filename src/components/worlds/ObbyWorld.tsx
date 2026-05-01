import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { BackSide, Color, ShaderMaterial } from 'three'
import type { Mesh } from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush } from '../Scenery'
import GradientSky from '../GradientSky'

const GRASS = '#6fd83e'
const WALL_BLUE = '#2f5599'
const WALL_BLUE_TOP = '#3d6ab5'

interface BlockDef {
  pos: [number, number, number]
  size?: [number, number, number]
  color: string
}

const PLATFORMS: BlockDef[] = [
  { pos: [0, 0.5, -4], color: '#ff5ab1' },
  { pos: [3, 0.8, -7], color: '#ffd644' },
  { pos: [-3, 1.1, -10], color: '#5ba55b' },
  { pos: [0, 1.5, -13], color: '#4c97ff' },
  { pos: [4, 1.9, -16], color: '#c879ff' },
  { pos: [-4, 2.3, -19], color: '#ff8c1a' },
  { pos: [0, 2.7, -22], color: '#ff5ab1' },
]

const PILLARS: BlockDef[] = Array.from({ length: 6 }, (_, i) => ({
  pos: [i % 2 === 0 ? 7 : -7, 1, -2 - i * 5] as [number, number, number],
  size: [1, 2, 1] as [number, number, number],
  color: '#8b9bb4',
}))

// ─── Glow shader ────────────────────────────────────────────────────────────

const GLOW_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const GLOW_FRAG = `
  uniform vec3 glowColor;
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float ex = max(abs(vUv.x - 0.5) * 2.0 - 0.85, 0.0);
    float ey = max(abs(vUv.y - 0.5) * 2.0 - 0.85, 0.0);
    float edge = max(ex, ey);
    float pulse = sin(iTime * 2.0) * 0.3 + 0.7;
    float alpha = smoothstep(0.0, 1.0, edge) * pulse;
    gl_FragColor = vec4(glowColor, alpha);
  }
`

// ─── PlatformGlow ─────────────────────────────────────────────────────────

function PlatformGlow({
  size = [2.4, 1, 2.4],
}: {
  size?: [number, number, number]
}) {
  const matRef = useRef<ShaderMaterial>(null!)

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new Color('#00ffff') },
      iTime: { value: 0 },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
    }
  })

  const s = size.map((v) => v * 1.04) as [number, number, number]

  return (
    <mesh scale={[s[0] / size[0], s[1] / size[1], s[2] / size[2]]}>
      <boxGeometry args={size} />
      <shaderMaterial
        ref={matRef}
        side={BackSide}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={GLOW_VERT}
        fragmentShader={GLOW_FRAG}
      />
    </mesh>
  )
}

// ─── Block (with glow) ────────────────────────────────────────────────────

function Block({ pos, size, color, glow = false }: BlockDef & { glow?: boolean }) {
  const sz: [number, number, number] = size ?? [2.4, 1, 2.4]
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={sz} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {glow && <PlatformGlow size={sz} />}
    </RigidBody>
  )
}

// ─── Ground ───────────────────────────────────────────────────────────────

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -10]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

// ─── Walls ────────────────────────────────────────────────────────────────

function Walls() {
  const W = 80
  const H = 5
  const T = 2
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W / 2 - T / 2 - 10], size: [W + T * 2, H, T] },
    { pos: [0, H / 2, W / 2 + T / 2 - 10], size: [W + T * 2, H, T] },
    { pos: [-W / 2 - T / 2, H / 2, -10], size: [T, H, W] },
    { pos: [W / 2 + T / 2, H / 2, -10], size: [T, H, W] },
  ]
  return (
    <>
      {items.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={WALL_BLUE} roughness={0.95} />
          </mesh>
          <mesh position={[0, w.size[1] / 2 + 0.15, 0]}>
            <boxGeometry args={[w.size[0], 0.3, w.size[2] + 0.1]} />
            <meshStandardMaterial color={WALL_BLUE_TOP} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// ─── Finish pad ───────────────────────────────────────────────────────────

function Finish() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, 3.1, -26]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial
          color="#ffd644"
          emissive="#ffaa00"
          emissiveIntensity={0.25}
          roughness={0.7}
        />
      </mesh>
    </RigidBody>
  )
}

// ─── Floating energy particles ────────────────────────────────────────────

const PARTICLE_COUNT = 50

// Seeded pseudo-random to avoid layout shift on hot-reload
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123
  return x - Math.floor(x)
}

interface ParticleData {
  x: number
  z: number
  y: number
  speed: number
  phase: number
  amp: number
}

const PARTICLES: ParticleData[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: (seededRand(i * 3) - 0.5) * 20,
  z: -(seededRand(i * 3 + 1) * 24 + 2),
  y: seededRand(i * 3 + 2) * 5,
  speed: 0.4 + seededRand(i * 7) * 0.8,
  phase: seededRand(i * 11) * Math.PI * 2,
  amp: 0.3 + seededRand(i * 13) * 0.5,
}))

const Y_MAX = 8
const Y_MIN = -0.5

function FloatingParticles() {
  // We render each particle as a separate tiny sphere via instancing-lite:
  // individual meshes are fine at 50.
  return (
    <>
      {PARTICLES.map((p, i) => (
        <SingleParticle key={i} data={p} />
      ))}
    </>
  )
}

function SingleParticle({ data }: { data: ParticleData }) {
  const ref = useRef<Mesh>(null!)
  const state = useRef({ y: data.y })

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    state.current.y += data.speed * delta
    if (state.current.y > Y_MAX) state.current.y = Y_MIN

    if (ref.current) {
      ref.current.position.set(
        data.x + Math.sin(t * 0.7 + data.phase) * data.amp,
        state.current.y,
        data.z + Math.cos(t * 0.5 + data.phase) * data.amp * 0.5
      )
    }
  })

  return (
    <mesh ref={ref} position={[data.x, data.y, data.z]}>
      <sphereGeometry args={[0.07, 6, 6]} />
      <meshBasicMaterial color="#88aaff" transparent opacity={0.7} depthWrite={false} />
    </mesh>
  )
}

// ─── Portal ring shader ───────────────────────────────────────────────────

const PORTAL_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const PORTAL_FRAG = `
  uniform float iTime;
  varying vec2 vUv;

  vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 col;
    float hi = mod(h * 6.0, 6.0);
    if (hi < 1.0)      col = vec3(c, x, 0.0);
    else if (hi < 2.0) col = vec3(x, c, 0.0);
    else if (hi < 3.0) col = vec3(0.0, c, x);
    else if (hi < 4.0) col = vec3(0.0, x, c);
    else if (hi < 5.0) col = vec3(x, 0.0, c);
    else               col = vec3(c, 0.0, x);
    return col + m;
  }

  void main() {
    float h = mod(iTime * 0.3 + vUv.x * 2.0, 1.0);
    vec3 col = hsl2rgb(h, 1.0, 0.6);
    gl_FragColor = vec4(col, 1.0);
  }
`

const PORTAL_INNER_FRAG = `
  varying vec2 vUv;
  void main() {
    float dx = vUv.x - 0.5;
    float dy = vUv.y - 0.5;
    float r = sqrt(dx * dx + dy * dy) * 2.0;
    float alpha = (1.0 - smoothstep(0.5, 1.0, r)) * 0.35;
    gl_FragColor = vec4(0.2, 0.5, 1.0, alpha);
  }
`

function StartPortal() {
  const ringRef = useRef<Mesh>(null!)
  const ringMatRef = useRef<ShaderMaterial>(null!)

  const ringUniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.6
    }
    if (ringMatRef.current) {
      ringMatRef.current.uniforms.iTime!.value = t
    }
  })

  // Portal sits at the start area just above ground, oriented vertically
  // spawn is at [0,3,4], first platform at [0,0.5,-4] — place portal between them
  const portalPos: [number, number, number] = [0, 2.2, 1]

  return (
    <group position={portalPos} rotation={[Math.PI / 2, 0, 0]}>
      {/* Rainbow torus ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.5, 0.15, 12, 64]} />
        <shaderMaterial
          ref={ringMatRef}
          uniforms={ringUniforms}
          vertexShader={PORTAL_VERT}
          fragmentShader={PORTAL_FRAG}
          toneMapped={false}
        />
      </mesh>

      {/* Inner gradient disc */}
      <mesh>
        <circleGeometry args={[2.35, 48]} />
        <shaderMaterial
          vertexShader={PORTAL_VERT}
          fragmentShader={PORTAL_INNER_FRAG}
          transparent
          depthWrite={false}
          side={BackSide}
        />
      </mesh>
    </group>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────

// First 7 platforms get glow; pillars don't (too many, too thin)
const GLOW_COUNT = 7

export default function ObbyWorld() {
  return (
    <>
      {/* Vivid purple-blue game-level sky */}
      <GradientSky top="#1a0080" bottom="#4010c0" radius={440} />

      <Ground />
      <Walls />
      {PLATFORMS.map((b, i) => (
        <Block key={`p${i}`} {...b} glow={i < GLOW_COUNT} />
      ))}
      {PILLARS.map((b, i) => (
        <Block key={`pl${i}`} {...b} />
      ))}
      <Finish />

      {/* Start portal at spawn area */}
      <StartPortal />

      {/* Floating energy particles drifting upward */}
      <FloatingParticles />

      {PLATFORMS.map((p, i) => (
        <Coin key={`c${i}`} pos={[p.pos[0], p.pos[1] + 1.2, p.pos[2]]} />
      ))}
      <Coin pos={[5, 1, -4]} />
      <Coin pos={[-5, 1, -4]} />
      <Coin pos={[6, 1, -12]} />
      <Coin pos={[-6, 1, -12]} />

      <Enemy pos={[0, 1.5, -9]} patrolX={3} />
      <Enemy pos={[0, 2.5, -17]} patrolX={4} color="#c879ff" />
      <GltfMonster
        which="blueDemon"
        pos={[0, 3.1, -28]}
        scale={1.4}
        rotY={Math.PI}
        animation="Wave"
      />

      <GoalTrigger
        pos={[0, 4, -26]}
        size={[6, 2, 2]}
        result={{ kind: 'win', label: 'ФИНИШ!', subline: 'Ты прошёл обби!' }}
      />

      {/* Деревья и кусты по периметру (декор, красоты ради) */}
      <Tree pos={[-15, 0, -6]} variant={0} />
      <Tree pos={[15, 0, -6]} variant={1} />
      <Tree pos={[-15, 0, -16]} variant={2} />
      <Tree pos={[15, 0, -16]} variant={3} />
      <Tree pos={[-15, 0, -26]} variant={4} />
      <Tree pos={[15, 0, -26]} variant={0} />
      <Bush pos={[-12, 0, 0]} variant={0} scale={1.2} />
      <Bush pos={[12, 0, 0]} variant={1} scale={1} />
    </>
  )
}

export const OBBY_SPAWN: [number, number, number] = [0, 3, 4]
