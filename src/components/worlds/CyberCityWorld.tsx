import { RigidBody } from '@react-three/rapier'
import { useFrame, extend } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { canPostfx, detectDeviceTier } from '../../lib/deviceTier'
const _isLow = detectDeviceTier() === 'low'
const _GRATE_SPIKE = Array.from({ length: 6 }, () =>
  Array.from({ length: 32 }, () => Math.random() < 0.015)
)
let _grateIdx = 0

// Module-level pre-allocated objects for InstancedMesh conversions
const _ccDummy  = new THREE.Object3D()
const _ccPart   = new THREE.Object3D()
const _ccMat    = new THREE.Matrix4()
const _ccCol    = new THREE.Color()

import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import NPC from '../NPC'
import GradientSky from '../GradientSky'
import { NpcRobot, BossDragon, BossGolem, IceBlock, CrystalCluster } from '../Scenery'

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

// ─── HoloGrid shader ─────────────────────────────────────────────
class HoloGridMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        iTime: { value: 0 },
        gridSize: { value: 8.0 },
        lineColor: { value: new THREE.Color('#00ffff') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform float gridSize;
        uniform vec3 lineColor;
        varying vec2 vUv;
        void main() {
          vec2 cell = fract(vUv * gridSize);
          float lineW = 0.04;
          float lx = step(cell.x, lineW) + step(1.0 - lineW, cell.x);
          float ly = step(cell.y, lineW) + step(1.0 - lineW, cell.y);
          float line = clamp(lx + ly, 0.0, 1.0);
          float pulse = 0.55 + 0.45 * sin(iTime * 1.8);
          float alpha = line * 0.35 * pulse;
          gl_FragColor = vec4(lineColor, alpha);
        }
      `,
    })
  }
}
extend({ HoloGridMaterial })

// ─── HoloBillboard scanline shader ───────────────────────────────
class HoloBillboardMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        iTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        varying vec2 vUv;
        void main() {
          // Scrolling scanlines
          float lineFreq = 40.0;
          float scroll = iTime * 0.4;
          float scanline = step(0.45, fract((vUv.y - scroll) * lineFreq));
          // Vignette-like fade at edges
          float edgeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
          float edgeY = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
          float edge = edgeX * edgeY;
          // Flicker
          float flicker = 0.85 + 0.15 * sin(iTime * 7.3 + vUv.y * 2.0);
          // Cyan/teal base tint
          vec3 col = vec3(0.0, 0.85, 0.9) * scanline * flicker * edge;
          float alpha = scanline * 0.55 * flicker * edge;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    })
  }
}
extend({ HoloBillboardMaterial })

// ─── TypeScript JSX declaration for custom material ───────────────
declare module '@react-three/fiber' {
  interface ThreeElements {
    holoGridMaterial: React.JSX.IntrinsicElements['shaderMaterial'] & {
      iTime?: number
      gridSize?: number
      lineColor?: THREE.Color
    }
    holoBillboardMaterial: React.JSX.IntrinsicElements['shaderMaterial'] & {
      iTime?: number
    }
  }
}

// ─── HoloGrid component ───────────────────────────────────────────
function HoloGrid() {
  const matRef = useRef<HoloGridMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
    }
  })
  return (
    <mesh position={[0, 0.02, -55]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[140, 130, 1, 1]} />
      <holoGridMaterial ref={matRef} />
    </mesh>
  )
}

// ─── NeonRain system (Blade Runner / Ghost in the Shell) ─────────
const NEON_RAIN_COUNT = 150

function NeonRain() {
  const enabled = canPostfx()
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Per-drop data: [x, y, z, speed]   (speed 15–25 units/sec)
  const drops = useMemo(() => {
    const arr = new Float32Array(NEON_RAIN_COUNT * 4)
    for (let i = 0; i < NEON_RAIN_COUNT; i++) {
      const b = i * 4
      arr[b]     = (Math.random() - 0.5) * 60        // x: ±30
      arr[b + 1] = Math.random() * 45 - 5             // y: -5 → 40
      arr[b + 2] = (Math.random() - 0.5) * 130 - 55  // z: full city depth
      arr[b + 3] = 15 + Math.random() * 10            // speed 15–25
    }
    return arr
  }, [])

  // Alternating cyan / hot-pink per drop (static color, set once via instance color)
  const colors = useMemo(() => {
    const cyan = new THREE.Color('#00ffff')
    const pink = new THREE.Color('#ff0080')
    const buf = new Float32Array(NEON_RAIN_COUNT * 3)
    for (let i = 0; i < NEON_RAIN_COUNT; i++) {
      const c = i % 2 === 0 ? cyan : pink
      buf[i * 3]     = c.r
      buf[i * 3 + 1] = c.g
      buf[i * 3 + 2] = c.b
    }
    return buf
  }, [])

  // Apply instance colors after first render
  const colorsApplied = useRef(false)

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    if (!enabled) return
    const mesh = meshRef.current
    if (!mesh) return

    // One-time colour upload
    if (!colorsApplied.current) {
      const cyan = new THREE.Color('#00ffff')
      const pink = new THREE.Color('#ff0080')
      for (let i = 0; i < NEON_RAIN_COUNT; i++) {
        mesh.setColorAt(i, i % 2 === 0 ? cyan : pink)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      colorsApplied.current = true
    }

    for (let i = 0; i < NEON_RAIN_COUNT; i++) {
      const b = i * 4
      drops[b + 1]! -= drops[b + 3]! * step
      if (drops[b + 1]! < -5) {
        drops[b + 1] = 40
        drops[b]     = (Math.random() - 0.5) * 60
        drops[b + 2] = (Math.random() - 0.5) * 130 - 55
      }
      dummy.position.set(drops[b]!, drops[b + 1]!, drops[b + 2]!)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  if (!enabled) return null
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, NEON_RAIN_COUNT]} frustumCulled={false}>
      <cylinderGeometry args={[0.015, 0.015, 0.8, 4]} />
      <meshBasicMaterial vertexColors opacity={0.75} transparent />
    </instancedMesh>
  )
}

// ─── Holographic billboard panel ──────────────────────────────────
function HoloBillboard({ pos, rotY = 0 }: { pos: [number, number, number]; rotY?: number }) {
  const matRef = useRef<HoloBillboardMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Backing panel */}
      <mesh>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#001015" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* Scanline overlay */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[3, 2]} />
        <holoBillboardMaterial ref={matRef} />
      </mesh>
      {/* Thin neon frame */}
      {[[-1.55, 0, 0.02], [1.55, 0, 0.02], [0, -1.05, 0.02], [0, 1.05, 0.02]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, i < 2 ? Math.PI / 2 : 0]}>
          <boxGeometry args={[0.06, i < 2 ? 2.1 : 3.15, 0.04]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Ground puddle reflections ────────────────────────────────────
const PUDDLE_DATA: { pos: [number, number, number]; r: number }[] = [
  { pos: [-18, 0.015, -15],  r: 2.5 },
  { pos: [20,  0.015, -28],  r: 2.0 },
  { pos: [-10, 0.015, -50],  r: 3.0 },
  { pos: [14,  0.015, -60],  r: 2.2 },
  { pos: [-22, 0.015, -72],  r: 2.8 },
  { pos: [8,   0.015, -82],  r: 2.0 },
]
function GroundPuddles() {
  const imRef = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    PUDDLE_DATA.forEach(({ pos, r }, i) => {
      _ccDummy.position.set(pos[0], pos[1], pos[2])
      _ccDummy.rotation.set(-Math.PI / 2, 0, 0)
      _ccDummy.scale.setScalar(r)
      _ccDummy.updateMatrix()
      imRef.current.setMatrixAt(i, _ccDummy.matrix)
    })
    imRef.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={imRef} args={[undefined, undefined, 6]}>
      <circleGeometry args={[1, 24]} />
      <meshBasicMaterial color="#001122" opacity={0.6} transparent depthWrite={false} />
    </instancedMesh>
  )
}

// ─── Rain system ──────────────────────────────────────────────────
const RAIN_COUNT = 400
const RAIN_AREA_X = 140
const RAIN_AREA_Z = 130
const RAIN_TOP = 40
const RAIN_BOTTOM = -1

function Rain() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  // Each drop: [x, y, z, speed]
  const drops = useMemo(() => {
    const arr: Float32Array = new Float32Array(RAIN_COUNT * 4)
    for (let i = 0; i < RAIN_COUNT; i++) {
      const b = i * 4
      arr[b]     = (Math.random() - 0.5) * RAIN_AREA_X
      arr[b + 1] = Math.random() * (RAIN_TOP - RAIN_BOTTOM) + RAIN_BOTTOM
      arr[b + 2] = (Math.random() - 0.5) * RAIN_AREA_Z - 55
      arr[b + 3] = 6 + Math.random() * 8
    }
    return arr
  }, [])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    for (let i = 0; i < RAIN_COUNT; i++) {
      const b = i * 4
      drops[b + 1]! -= drops[b + 3]! * step
      if (drops[b + 1]! < RAIN_BOTTOM) {
        drops[b + 1] = RAIN_TOP
        drops[b]     = (Math.random() - 0.5) * RAIN_AREA_X
        drops[b + 2] = (Math.random() - 0.5) * RAIN_AREA_Z - 55
      }
      dummy.position.set(drops[b]!, drops[b + 1]!, drops[b + 2]!)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.04, 0.6, 0.04]} />
      <meshBasicMaterial color="#aaddff" opacity={0.4} transparent />
    </instancedMesh>
  )
}

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
            <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={1.8} roughness={0.2} />
          </mesh>
        )
      })}

      {/* Rooftop edge strip */}
      <mesh position={[bx, topY + 0.12, bz]}>
        <boxGeometry args={[w + 0.1, 0.25, d + 0.1]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={2.0} roughness={0.2} />
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
// Varied pulse frequencies for different sign "personalities"
const PULSE_FREQS = [0.8, 1.3, 2.1, 0.5]
// Pre-baked flicker pools for each sign instance (32 entries, ~0.2% true)
const _SIGN_FLICKER = Array.from({ length: 12 }, () =>
  Array.from({ length: 32 }, () => Math.random() < 0.002)
)
let _signIdx = 0

function NeonSign({
  pos,
  size,
  color,
  rotY = 0,
  freqIdx = 0,
}: {
  pos: [number, number, number]
  size: [number, number]
  color: string
  rotY?: number
  freqIdx?: number
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  const freq = PULSE_FREQS[freqIdx % PULSE_FREQS.length]!
  const flickerPool = useRef(_SIGN_FLICKER[_signIdx++ % 12]!)
  const flickerPtr = useRef(0)
  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    phase.current += step * (_isLow ? 2 : 1) * freq
    if (mat.current) {
      const base = 1.5 + Math.sin(phase.current) * 0.6
      const flicker = flickerPool.current[flickerPtr.current++ % 32]
      mat.current.emissiveIntensity = flicker ? 0 : base
    }
  })
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh castShadow>
        <boxGeometry args={[size[0], size[1], 0.15]} />
        <meshStandardMaterial color={BUILDING_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[size[0] - 0.3, size[1] - 0.3, 0.08]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={1.8} transparent opacity={0.92} />
      </mesh>
    </group>
  )
}

// ─── Moving billboard crane (obstacle) ───────────────────────────
function MovingBillboard({ startX, y, z }: { startX: number; y: number; z: number }) {
  const grp = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    phase.current += step * 0.45
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

// ─── Flying Drone Swarm ───────────────────────────────────────────
const DRONE_CONFIG: Array<{
  center: [number, number, number]
  radius: number
  height: number
  speed: number
  phase: number
}> = [
  { center: [0,   0, -30], radius: 10, height: 12, speed: 0.5, phase: 0.0 },
  { center: [-20, 0, -50], radius: 8,  height: 18, speed: 0.7, phase: 1.1 },
  { center: [20,  0, -50], radius: 12, height: 15, speed: 0.4, phase: 2.2 },
  { center: [0,   0, -80], radius: 25, height: 28, speed: 0.3, phase: 3.3 },
  { center: [-30, 0, -80], radius: 9,  height: 22, speed: 0.8, phase: 4.4 },
  { center: [30,  0, -80], radius: 14, height: 30, speed: 0.6, phase: 5.5 },
]

function SingleDrone({
  center,
  radius,
  height,
  speed,
  phase,
}: (typeof DRONE_CONFIG)[number]) {
  const groupRef = useRef<THREE.Group>(null!)
  const blinkRef = useRef<THREE.MeshBasicMaterial>(null!)
  const [cx, , cz] = center

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.set(
        cx + Math.cos(t * speed + phase) * radius,
        height,
        cz + Math.sin(t * speed + phase) * radius,
      )
      // face direction of travel
      groupRef.current.rotation.y = -(t * speed + phase) + Math.PI / 2
    }
    if (blinkRef.current) {
      const flash = Math.floor(t / 0.5) % 2 === 0
      blinkRef.current.color.set(flash ? '#00ffff' : '#ff00ff')
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.15, 0.4]} />
        <meshStandardMaterial color="#111122" emissive="#0044ff" emissiveIntensity={1.5} />
      </mesh>
      {/* Blink light */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.08, 4, 4]} />
        <meshBasicMaterial ref={blinkRef} color="#00ffff" />
      </mesh>
      {/* Point light */}
      <pointLight color="#0088ff" intensity={1.2} distance={8} />
    </group>
  )
}

function FlyingDrones() {
  return (
    <>
      {DRONE_CONFIG.map((cfg, i) => (
        <SingleDrone key={i} {...cfg} />
      ))}
    </>
  )
}

// ─── WindowPulse — randomly blinking window lights on building faces ─
const WINDOW_LIGHTS: { pos: [number, number, number]; color: string }[] = [
  { pos: [-24, 7,  -6],  color: '#00ffff' },
  { pos: [ 22, 11, -6],  color: '#ff00aa' },
  { pos: [-30, 15, -12], color: '#ffcc00' },
  { pos: [ 30,  9, -12], color: '#8800ff' },
  { pos: [-24, 18, -40], color: '#00ff88' },
  { pos: [ 22, 14, -40], color: '#00ffff' },
  { pos: [-30,  6, -65], color: '#ff00aa' },
  { pos: [ 24, 20, -65], color: '#ffcc00' },
  { pos: [ -8, 12, -95], color: '#8800ff' },
  { pos: [  8, 17, -95], color: '#00ff88' },
  { pos: [-22, 10, -50], color: '#00ffff' },
  { pos: [ 20,  5, -30], color: '#ff00aa' },
]

// Pre-baked window flicker pools (12 windows × 32 frames, ~2% true each)
const _WIN_FLICKER = Array.from({ length: 12 }, () =>
  Array.from({ length: 32 }, () => Math.random() < 0.02)
)

function WindowPulse() {
  const imRef = useRef<THREE.InstancedMesh>(null!)
  const winOn = useRef<boolean[]>(Array(WINDOW_LIGHTS.length).fill(true))
  const flickerPtr = useRef(0)
  const frameSkip = useRef(0)

  useEffect(() => {
    WINDOW_LIGHTS.forEach(({ pos, color }, i) => {
      _ccDummy.position.set(pos[0], pos[1], pos[2])
      _ccDummy.rotation.set(0, 0, 0)
      _ccDummy.scale.setScalar(1)
      _ccDummy.updateMatrix()
      imRef.current.setMatrixAt(i, _ccDummy.matrix)
      imRef.current.setColorAt(i, _ccCol.set(color))
    })
    imRef.current.instanceMatrix.needsUpdate = true
    if (imRef.current.instanceColor) imRef.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const ptr = flickerPtr.current++ % 32
    let changed = false
    WINDOW_LIGHTS.forEach(({ color }, i) => {
      if (_WIN_FLICKER[i % 12]![ptr]) {
        winOn.current[i] = !winOn.current[i]
        const bright = winOn.current[i] ? 1.0 : 0.125
        imRef.current.setColorAt(i, _ccCol.set(color).multiplyScalar(bright))
        changed = true
      }
    })
    if (changed && imRef.current.instanceColor) imRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={imRef} args={[undefined, undefined, WINDOW_LIGHTS.length]}>
      <planeGeometry args={[1.2, 0.8]} />
      <meshBasicMaterial vertexColors opacity={0.8} transparent />
    </instancedMesh>
  )
}

// ─── HoverTraffic ─────────────────────────────────────────────────
interface CarData {
  color: string
  laneX: number
  dir: 1 | -1
  speed: number
  phase: number
}

const CAR_CONFIGS: CarData[] = [
  // +z direction (approaching): start near z=-120
  { color: '#cc0000', laneX: -7, dir:  1, speed: 8, phase:   0 },
  { color: '#0044ff', laneX:  0, dir:  1, speed: 8, phase:  45 },
  { color: '#ffcc00', laneX:  7, dir:  1, speed: 8, phase:  90 },
  // -z direction (going away): start near z=10
  { color: '#00aacc', laneX: -5, dir: -1, speed: 8, phase:   0 },
  { color: '#ff6600', laneX:  0, dir: -1, speed: 8, phase:  47 },
  { color: '#8800cc', laneX:  5, dir: -1, speed: 8, phase:  94 },
]

function HoverTraffic() {
  const carRefs = useRef<THREE.Group[]>([])

  // Pre-compute initial z positions incorporating phase offset
  const initialZ = useMemo<number[]>(() =>
    CAR_CONFIGS.map((c) => {
      if (c.dir === 1) return -120 - c.phase  // +z travelers start deep negative
      return 10 + c.phase                      // -z travelers start near positive
    }),
  [])

  // Mutable z positions tracked as a ref array (no re-render needed)
  const zPos = useRef<number[]>(initialZ.slice())

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    CAR_CONFIGS.forEach((c, i) => {
      const car = carRefs.current[i]
      if (!car) return

      zPos.current[i]! += c.dir * c.speed * step

      // Wrap around
      if (c.dir === 1 && zPos.current[i]! > 15) {
        zPos.current[i] = -125
      } else if (c.dir === -1 && zPos.current[i]! < -125) {
        zPos.current[i] = 15
      }

      car.position.z = zPos.current[i]!
    })
  })

  return (
    <>
      {CAR_CONFIGS.map((c, i) => (
        <group
          key={i}
          ref={(el) => { if (el) carRefs.current[i] = el }}
          position={[c.laneX, 2.0, initialZ[i]!]}
          rotation={[0, c.dir === 1 ? 0 : Math.PI, 0]}
        >
          {/* Body */}
          <mesh>
            <boxGeometry args={[2.5, 0.5, 5]} />
            <meshStandardMaterial color={c.color} roughness={0.3} metalness={0.6} />
          </mesh>

          {/* Windshield — slanted at top-front */}
          <mesh position={[0, 0.35, -1.4]} rotation={[0.45, 0, 0]}>
            <boxGeometry args={[2.0, 0.3, 1.5]} />
            <meshStandardMaterial color={GLASS} roughness={0.1} metalness={0.2} transparent opacity={0.7} />
          </mesh>

          {/* Wheel pods: front-left, front-right, rear-left, rear-right */}
          {([ [-1.1, -0.18, -1.8], [1.1, -0.18, -1.8], [-1.1, -0.18, 1.8], [1.1, -0.18, 1.8] ] as [number, number, number][]).map((p, wi) => (
            <mesh key={wi} position={p} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.35, 0.3, 8]} />
              <meshStandardMaterial color="#222233" roughness={0.8} metalness={0.4} />
            </mesh>
          ))}

          {/* Headlights (front = -z because car faces -z by default, rotated by dir) */}
          <mesh position={[-0.7, 0.1, -2.55]}>
            <sphereGeometry args={[0.15, 5, 4]} />
            <meshStandardMaterial color="#ffffee" emissive="#ffffcc" emissiveIntensity={3.5} />
          </mesh>
          <mesh position={[0.7, 0.1, -2.55]}>
            <sphereGeometry args={[0.15, 5, 4]} />
            <meshStandardMaterial color="#ffffee" emissive="#ffffcc" emissiveIntensity={3.5} />
          </mesh>

          {/* Rear brake light */}
          <mesh position={[0, 0.1, 2.55]}>
            <sphereGeometry args={[0.12, 5, 4]} />
            <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={2.5} />
          </mesh>

        </group>
      ))}
    </>
  )
}

// ─── TrafficLights ────────────────────────────────────────────────
const TRAFFIC_LIGHT_POSITIONS: [number, number, number][] = [
  [ 12, 0, -30],
  [-12, 0, -30],
  [ 12, 0, -60],
  [-12, 0, -60],
]

function TrafficLights() {
  const poleIM    = useRef<THREE.InstancedMesh>(null!)
  const housingIM = useRef<THREE.InstancedMesh>(null!)
  const redIM     = useRef<THREE.InstancedMesh>(null!)
  const yellowIM  = useRef<THREE.InstancedMesh>(null!)
  const greenIM   = useRef<THREE.InstancedMesh>(null!)
  const iTimeRef  = useRef(0)
  const frameSkip = useRef(0)

  useEffect(() => {
    TRAFFIC_LIGHT_POSITIONS.forEach((pos, i) => {
      // Pole: pos + (0,2,0)
      _ccDummy.position.set(pos[0], pos[1] + 2, pos[2])
      _ccDummy.rotation.set(0, 0, 0)
      _ccDummy.scale.setScalar(1)
      _ccDummy.updateMatrix()
      poleIM.current.setMatrixAt(i, _ccDummy.matrix)
      // Housing: pos + (0,4.7,0)
      _ccDummy.position.set(pos[0], pos[1] + 4.7, pos[2])
      _ccDummy.updateMatrix()
      housingIM.current.setMatrixAt(i, _ccDummy.matrix)
      // Red: pos + (0,5.5,0.18)
      _ccDummy.position.set(pos[0], pos[1] + 5.5, pos[2] + 0.18)
      _ccDummy.updateMatrix()
      redIM.current.setMatrixAt(i, _ccDummy.matrix)
      // Yellow: pos + (0,5.0,0.18)
      _ccDummy.position.set(pos[0], pos[1] + 5.0, pos[2] + 0.18)
      _ccDummy.updateMatrix()
      yellowIM.current.setMatrixAt(i, _ccDummy.matrix)
      // Green: pos + (0,4.5,0.18)
      _ccDummy.position.set(pos[0], pos[1] + 4.5, pos[2] + 0.18)
      _ccDummy.updateMatrix()
      greenIM.current.setMatrixAt(i, _ccDummy.matrix)
    })
    poleIM.current.instanceMatrix.needsUpdate    = true
    housingIM.current.instanceMatrix.needsUpdate = true
    redIM.current.instanceMatrix.needsUpdate     = true
    yellowIM.current.instanceMatrix.needsUpdate  = true
    greenIM.current.instanceMatrix.needsUpdate   = true
  }, [])

  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    iTimeRef.current += step
    const t = iTimeRef.current % 6
    const greenActive  = t < 2.5
    const yellowActive = t >= 2.5 && t < 3.0
    const redActive    = t >= 3.0
    ;(redIM.current.material    as THREE.MeshStandardMaterial).emissiveIntensity = redActive    ? 2.0 : 0.1
    ;(yellowIM.current.material as THREE.MeshStandardMaterial).emissiveIntensity = yellowActive ? 2.0 : 0.1
    ;(greenIM.current.material  as THREE.MeshStandardMaterial).emissiveIntensity = greenActive  ? 2.0 : 0.1
  })

  return (
    <>
      <instancedMesh ref={poleIM} args={[undefined, undefined, 4]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={housingIM} args={[undefined, undefined, 4]}>
        <boxGeometry args={[0.35, 1.4, 0.35]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={redIM} args={[undefined, undefined, 4]}>
        <sphereGeometry args={[0.12, 5, 4]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={0.1} />
      </instancedMesh>
      <instancedMesh ref={yellowIM} args={[undefined, undefined, 4]}>
        <sphereGeometry args={[0.12, 5, 4]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.1} />
      </instancedMesh>
      <instancedMesh ref={greenIM} args={[undefined, undefined, 4]}>
        <sphereGeometry args={[0.12, 5, 4]} />
        <meshStandardMaterial color="#00cc44" emissive="#00cc44" emissiveIntensity={2.0} />
      </instancedMesh>
    </>
  )
}

// ─── NeonSkylines — horizontal neon bars at building-top height ───────
const NEON_SKYLINE_BARS: { pos: [number, number, number]; color: string; rotY: number }[] = [
  { pos: [  0, 25, -30], color: '#00ffff', rotY: 0 },
  { pos: [  0, 25, -60], color: '#ff00aa', rotY: 0 },
  { pos: [-30, 25, -45], color: '#8800ff', rotY: Math.PI / 2 },
  { pos: [ 30, 25, -45], color: '#ffcc00', rotY: Math.PI / 2 },
]

function NeonSkylines() {
  return (
    <>
      {NEON_SKYLINE_BARS.map((bar, i) => (
        <mesh key={i} position={bar.pos} rotation={[0, bar.rotY, 0]}>
          <boxGeometry args={[40, 0.3, 0.3]} />
          <meshStandardMaterial color={bar.color} emissive={bar.color} emissiveIntensity={3} />
        </mesh>
      ))}
    </>
  )
}

// ─── NeonSigns — 12 animated neon sign panels on building facades ─
const NEON_SIGN_DATA: {
  pos: [number, number, number]
  rotY: number
  color: string
  phase: number
}[] = [
  { pos: [-31.9, 10, -8],  rotY: Math.PI / 2,  color: '#ff0044', phase: 0.0 },
  { pos: [-31.9, 16, -14], rotY: Math.PI / 2,  color: '#00ffcc', phase: 1.1 },
  { pos: [31.9,  12, -8],  rotY: -Math.PI / 2, color: '#ff8800', phase: 2.2 },
  { pos: [31.9,  18, -14], rotY: -Math.PI / 2, color: '#0088ff', phase: 3.3 },
  { pos: [-31.9,  9, -36], rotY: Math.PI / 2,  color: '#ff0044', phase: 0.7 },
  { pos: [-31.9, 14, -44], rotY: Math.PI / 2,  color: '#00ffcc', phase: 1.8 },
  { pos: [31.9,  10, -36], rotY: -Math.PI / 2, color: '#ff8800', phase: 2.9 },
  { pos: [31.9,  15, -44], rotY: -Math.PI / 2, color: '#0088ff', phase: 4.0 },
  { pos: [-31.9, 11, -61], rotY: Math.PI / 2,  color: '#ff0044', phase: 0.3 },
  { pos: [-31.9, 17, -69], rotY: Math.PI / 2,  color: '#00ffcc', phase: 1.4 },
  { pos: [31.9,  13, -61], rotY: -Math.PI / 2, color: '#ff8800', phase: 2.5 },
  { pos: [31.9,  20, -69], rotY: -Math.PI / 2, color: '#0088ff', phase: 3.6 },
]

const STRIP_COLORS = ['#ff0044', '#00ffcc', '#ff8800', '#0088ff'] as const

function NeonSigns() {
  const boardIM  = useRef<THREE.InstancedMesh>(null!)
  const strip1IM = useRef<THREE.InstancedMesh>(null!)
  const strip2IM = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)

  useEffect(() => {
    NEON_SIGN_DATA.forEach((sign, i) => {
      _ccDummy.position.set(sign.pos[0], sign.pos[1], sign.pos[2])
      _ccDummy.rotation.set(0, sign.rotY, 0)
      _ccDummy.scale.setScalar(1)
      _ccDummy.updateMatrix()
      boardIM.current.setMatrixAt(i, _ccDummy.matrix)

      // strip1: child offset (0, 0.35, 0.06)
      _ccPart.position.set(0, 0.35, 0.06)
      _ccPart.rotation.set(0, 0, 0)
      _ccPart.scale.setScalar(1)
      _ccPart.updateMatrix()
      _ccMat.multiplyMatrices(_ccDummy.matrix, _ccPart.matrix)
      strip1IM.current.setMatrixAt(i, _ccMat)

      // strip2: child offset (0, -0.35, 0.06)
      _ccPart.position.set(0, -0.35, 0.06)
      _ccPart.updateMatrix()
      _ccMat.multiplyMatrices(_ccDummy.matrix, _ccPart.matrix)
      strip2IM.current.setMatrixAt(i, _ccMat)

      // init colors at full brightness
      const col = STRIP_COLORS[i % STRIP_COLORS.length]!
      strip1IM.current.setColorAt(i, _ccCol.set(col))
      strip2IM.current.setColorAt(i, _ccCol.set(sign.color))
    })
    boardIM.current.instanceMatrix.needsUpdate  = true
    strip1IM.current.instanceMatrix.needsUpdate = true
    strip2IM.current.instanceMatrix.needsUpdate = true
    if (strip1IM.current.instanceColor) strip1IM.current.instanceColor.needsUpdate = true
    if (strip2IM.current.instanceColor) strip2IM.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    NEON_SIGN_DATA.forEach((sign, i) => {
      const bright = (2 + Math.sin(t * 2 + sign.phase) * 1.5) / 3.5
      const col = STRIP_COLORS[i % STRIP_COLORS.length]!
      strip1IM.current.setColorAt(i, _ccCol.set(col).multiplyScalar(bright))
      strip2IM.current.setColorAt(i, _ccCol.set(sign.color).multiplyScalar(bright))
    })
    if (strip1IM.current.instanceColor) strip1IM.current.instanceColor.needsUpdate = true
    if (strip2IM.current.instanceColor) strip2IM.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={boardIM} args={[undefined, undefined, 12]}>
        <boxGeometry args={[3, 1.2, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={strip1IM} args={[undefined, undefined, 12]}>
        <boxGeometry args={[2.8, 0.15, 0.12]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
      <instancedMesh ref={strip2IM} args={[undefined, undefined, 12]}>
        <boxGeometry args={[2.8, 0.15, 0.12]} />
        <meshBasicMaterial vertexColors />
      </instancedMesh>
    </>
  )
}

// ─── RooftopAntennas — 8 comm antenna towers on building tops ─────
const ANTENNA_DATA: { pos: [number, number, number] }[] = [
  { pos: [-32, 22, -10] },
  { pos: [-32, 22, -14] },
  { pos: [ 32, 18, -10] },
  { pos: [ 32, 18, -14] },
  { pos: [-32, 14, -38] },
  { pos: [ 32, 16, -38] },
  { pos: [-32, 18, -63] },
  { pos: [ 32, 20, -63] },
]

function SingleAntenna({ pos }: { pos: [number, number, number] }) {
  const blinkRef = useRef<THREE.MeshStandardMaterial>(null!)
  const blinkState = useRef(0)

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    blinkState.current += step
    if (blinkRef.current) {
      blinkRef.current.emissiveIntensity = blinkState.current % 0.8 < 0.4 ? 5 : 0
    }
  })

  return (
    <group position={pos}>
      {/* Main pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 6]} />
        <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Cross-arm 1 */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Cross-arm 2 */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Cross-arm 3 */}
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Blinking red light at top */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial
          ref={blinkRef}
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={5}
        />
      </mesh>
    </group>
  )
}

function RooftopAntennas() {
  return (
    <>
      {ANTENNA_DATA.map((a, i) => (
        <SingleAntenna key={i} pos={a.pos} />
      ))}
    </>
  )
}

// ─── StreetVendors — 4 holographic vending kiosk stands ──────────
const VENDOR_DATA: { pos: [number, number, number] }[] = [
  { pos: [-20,  0, -22] },
  { pos: [ 20,  0, -22] },
  { pos: [-20,  0, -55] },
  { pos: [ 20,  0, -55] },
]

function StreetVendors() {
  return (
    <>
      {VENDOR_DATA.map(({ pos }, i) => (
        <group key={i} position={pos}>
          {/* Base */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[1.5, 1.2, 1.5]} />
            <meshStandardMaterial color="#2a2a3a" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* Holographic display */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[1.2, 1.8, 0.05]} />
            <meshStandardMaterial
              color="#001133"
              emissive="#0066ff"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── FlyingAds — 3 large floating advertisement boards ───────────
const FLYING_AD_DATA: { pos: [number, number, number]; color: string; rotPhase: number }[] = [
  { pos: [-20, 35, -35], color: '#ff0088', rotPhase: 0.0 },
  { pos: [  0, 45, -60], color: '#00ff88', rotPhase: 2.1 },
  { pos: [ 22, 38, -80], color: '#8800ff', rotPhase: 4.2 },
]

function FlyingAds() {
  const adRefs = useRef<(THREE.Group | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    adRefs.current.forEach((grp) => {
      if (grp) grp.rotation.y += 0.003
    })
  })

  return (
    <>
      {FLYING_AD_DATA.map((ad, i) => (
        <group
          key={i}
          position={ad.pos}
          ref={(el) => { adRefs.current[i] = el }}
        >
          {/* Flat ad panel */}
          <mesh>
            <boxGeometry args={[8, 4, 0.1]} />
            <meshStandardMaterial
              color={ad.color}
              emissive={ad.color}
              emissiveIntensity={2.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Thin frame */}
          <mesh>
            <boxGeometry args={[8.2, 4.2, 0.05]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} transparent opacity={0.15} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── MetroEntrance ────────────────────────────────────────────────
const METRO_ENTRANCE_DATA: Array<{
  pos: [number, number, number]
  rotY: number
}> = [
  { pos: [-15, 0, -8],  rotY: 0 },
  { pos: [ 16, 0, -45], rotY: Math.PI / 2 },
  { pos: [-14, 0, -72], rotY: -Math.PI / 4 },
]

function SingleMetroEntrance({ pos, rotY }: { pos: [number, number, number]; rotY: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* ── Staircase: 6 steps descending into ground ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`step${i}`} position={[0, -(i * 0.25) - 0.125, i * 0.6 + 0.3]}>
          <boxGeometry args={[3, 0.25, 0.6]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* ── Entry arch frame ── */}
      {/* Top bar */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[3.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2.5} />
      </mesh>
      {/* Left upright */}
      <mesh position={[-1.6, 1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#001122" emissive="#00ffcc" emissiveIntensity={1.2} />
      </mesh>
      {/* Right upright */}
      <mesh position={[1.6, 1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#001122" emissive="#00ffcc" emissiveIntensity={1.2} />
      </mesh>
      {/* Arch backing panel */}
      <mesh position={[0, 1.5, -0.05]}>
        <boxGeometry args={[3.5, 3, 0.3]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* ── Neon Metro sign ── */}
      <mesh position={[0, 2.4, 0.16]}>
        <boxGeometry args={[2.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={4} transparent opacity={0.95} />
      </mesh>

      {/* ── Metro "M" symbol: sphere + cross ── */}
      {/* Centre sphere */}
      <mesh position={[0, 3.6, 0.1]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial color="#110022" emissive="#ff00ff" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      {/* Horizontal bar of M */}
      <mesh position={[0, 3.6, 0.1]}>
        <boxGeometry args={[0.7, 0.12, 0.12]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
      </mesh>
      {/* Vertical bar of M */}
      <mesh position={[0, 3.6, 0.1]}>
        <boxGeometry args={[0.12, 0.7, 0.12]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
      </mesh>

      {/* ── Underground glow ── */}
      <pointLight color="#0088ff" intensity={4} distance={8} position={[0, -2, 2]} />

      {/* ── Barrier rails: left and right ── */}
      {([-1.3, 1.3] as number[]).map((xOff, ri) => (
        <mesh key={`rail${ri}`} position={[xOff, 0.5, 1.5]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#334466" emissive="#0044aa" emissiveIntensity={0.8} metalness={0.6} />
        </mesh>
      ))}
      {/* Rail horizontal bar */}
      <mesh position={[0, 0.95, 1.5]}>
        <boxGeometry args={[2.6, 0.05, 0.05]} />
        <meshStandardMaterial color="#334466" emissive="#0044aa" emissiveIntensity={0.8} metalness={0.6} />
      </mesh>
    </group>
  )
}

function MetroEntrance() {
  return (
    <>
      {METRO_ENTRANCE_DATA.map((d, i) => (
        <SingleMetroEntrance key={i} pos={d.pos} rotY={d.rotY} />
      ))}
    </>
  )
}

// ─── HoloCops ─────────────────────────────────────────────────────
const HOLOCOP_DATA: Array<{ pos: [number, number, number]; rotYOffset: number }> = [
  { pos: [ 12, 0, -30], rotYOffset: 0 },
  { pos: [-12, 0, -60], rotYOffset: Math.PI },
]

function SingleHoloCop({ pos, rotYOffset }: { pos: [number, number, number]; rotYOffset: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const scanRef  = useRef<THREE.Mesh>(null!)
  const sweepAngle = useRef(0)
  const sweepDir   = useRef(1)

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    sweepAngle.current += step * 0.6 * sweepDir.current
    if (sweepAngle.current >  Math.PI / 4) sweepDir.current = -1
    if (sweepAngle.current < -Math.PI / 4) sweepDir.current =  1
    if (groupRef.current) {
      groupRef.current.rotation.y = rotYOffset + sweepAngle.current
    }
    if (scanRef.current) {
      scanRef.current.rotation.y += step * 1.2
    }
  })

  return (
    <group ref={groupRef} position={pos}>
      {/* Body */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#00ccff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.05, 0]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#00ccff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Scan beam: flat cone rotating at head */}
      <mesh ref={scanRef} position={[0, 1.85, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.8, 1.8, 16, 1, true]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Arm (right) — extended pointing */}
      <mesh position={[0.45, 1.0, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.7, 0.12]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#00ccff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Forearm */}
      <mesh position={[0.75, 0.65, 0.38]} rotation={[0.3, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#00ccff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Left arm (at rest) */}
      <mesh position={[-0.35, 0.9, 0]} rotation={[0, 0, Math.PI / 8]}>
        <boxGeometry args={[0.12, 0.65, 0.12]} />
        <meshStandardMaterial
          color="#001122"
          emissive="#00ccff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Legs */}
      {([-0.14, 0.14] as number[]).map((xOff, li) => (
        <mesh key={`leg${li}`} position={[xOff, 0.12, 0]}>
          <boxGeometry args={[0.16, 0.5, 0.2]} />
          <meshStandardMaterial
            color="#001122"
            emissive="#00ccff"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function HoloCops() {
  return (
    <>
      {HOLOCOP_DATA.map((d, i) => (
        <SingleHoloCop key={i} pos={d.pos} rotYOffset={d.rotYOffset} />
      ))}
    </>
  )
}

// ─── NeonPuddles (street-level reflective puddles) ────────────────
const NEON_PUDDLE_DATA: Array<{
  pos: [number, number, number]
  scaleX: number
  scaleZ: number
  color: string
}> = [
  { pos: [-13, 0.01,  -10], scaleX: 2.0, scaleZ: 1.5, color: '#ff0044' },
  { pos: [ 13, 0.01,  -18], scaleX: 1.5, scaleZ: 1.0, color: '#00ffcc' },
  { pos: [ -8, 0.01,  -32], scaleX: 2.0, scaleZ: 1.3, color: '#ff00ff' },
  { pos: [ 11, 0.01,  -44], scaleX: 1.8, scaleZ: 1.2, color: '#ff0044' },
  { pos: [-12, 0.01,  -55], scaleX: 2.2, scaleZ: 1.5, color: '#00ffcc' },
  { pos: [  9, 0.01,  -62], scaleX: 1.6, scaleZ: 1.1, color: '#ff8800' },
  { pos: [-10, 0.01,  -75], scaleX: 2.0, scaleZ: 1.4, color: '#0088ff' },
  { pos: [ 12, 0.01,  -83], scaleX: 1.7, scaleZ: 1.2, color: '#ff0044' },
]

function NeonPuddles() {
  const puddleRefs = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    NEON_PUDDLE_DATA.forEach((pd, i) => {
      const mesh = puddleRefs.current[i]
      if (!mesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      // Slow colour pulse cycling emissiveIntensity
      mat.emissiveIntensity = 0.4 + 0.4 * Math.abs(Math.sin(t * 0.7 + i * 0.8))
    })
  })

  return (
    <>
      {NEON_PUDDLE_DATA.map((pd, i) => (
        <mesh
          key={i}
          ref={(el) => { puddleRefs.current[i] = el }}
          position={pd.pos}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[pd.scaleX, pd.scaleZ, 1]}
        >
          <planeGeometry args={[2, 1.5]} />
          <meshStandardMaterial
            color="#050a10"
            emissive={pd.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
            depthWrite={false}
            roughness={0.05}
            metalness={0.9}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── UndergroundRacingHints ───────────────────────────────────────
// Floor grates with neon glow from below + underground access door
const GRATE_POSITIONS: [number, number, number][] = [
  [-18, 0.04, -20],
  [ 18, 0.04, -20],
  [ -8, 0.04, -35],
  [  8, 0.04, -35],
  [-14, 0.04, -52],
  [ 14, 0.04, -52],
]

function FloorGrate({ pos }: { pos: [number, number, number] }) {
  const glowRef = useRef<THREE.PointLight>(null!)
  const flickerRef = useRef(0)
  const spikePool = useRef(_GRATE_SPIKE[_grateIdx++ % 6]!)
  const spikePtr = useRef(0)

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    flickerRef.current += step * 6
    if (glowRef.current) {
      // Flicker: occasional drop to simulate distant race lights
      const flicker = Math.sin(flickerRef.current * 3.7) * 0.5 + 0.5
      const spike   = spikePool.current[spikePtr.current++ % 32] ? 0 : 1
      glowRef.current.intensity = 4 * flicker * spike + 1.5
    }
  })

  const [gx, , gz] = pos
  // Grid bars: 5 along x + 5 along z
  const barsX = Array.from({ length: 5 }, (_, i) => gz - 1.2 + i * 0.6)
  const barsZ = Array.from({ length: 5 }, (_, i) => gx - 1.2 + i * 0.6)

  return (
    <group>
      {/* Grate base plate */}
      <mesh position={pos}>
        <boxGeometry args={[3, 0.08, 3]} />
        <meshStandardMaterial color="#333344" roughness={0.9} metalness={0.6} />
      </mesh>

      {/* Grid bars — along Z axis */}
      {barsX.map((bz, i) => (
        <mesh key={`bx${i}`} position={[gx, pos[1] + 0.01, bz]}>
          <boxGeometry args={[2.8, 0.06, 0.1]} />
          <meshStandardMaterial color="#222233" roughness={0.8} metalness={0.7} />
        </mesh>
      ))}

      {/* Grid bars — along X axis */}
      {barsZ.map((bx, i) => (
        <mesh key={`bz${i}`} position={[bx, pos[1] + 0.01, gz]}>
          <boxGeometry args={[0.1, 0.06, 2.8]} />
          <meshStandardMaterial color="#222233" roughness={0.8} metalness={0.7} />
        </mesh>
      ))}

      {/* Neon glow from below — point light at y=-0.5 relative */}
      <pointLight
        ref={glowRef}
        color="#ff0044"
        intensity={4}
        distance={5}
        position={[gx, pos[1] - 0.5, gz]}
      />

      {/* Emissive race light strip visible through grate */}
      <mesh position={[gx, pos[1] - 1, gz]}>
        <boxGeometry args={[2.6, 0.08, 0.3]} />
        <meshStandardMaterial
          color="#ff0044"
          emissive="#ff0044"
          emissiveIntensity={5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[gx, pos[1] - 1, gz]}>
        <boxGeometry args={[0.3, 0.08, 2.6]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

function UndergroundRacingHints() {
  return (
    <>
      {/* Floor grates over underground circuit */}
      {GRATE_POSITIONS.map((pos, i) => (
        <FloorGrate key={i} pos={pos} />
      ))}

      {/* Underground access door — set into the left alley wall face */}
      <group position={[-26, 1.5, -28]}>
        {/* Door slab */}
        <mesh>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.4} />
        </mesh>
        {/* Neon frame — top */}
        <mesh position={[0, 1.6, 0.11]}>
          <boxGeometry args={[2.2, 0.12, 0.08]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3.5} />
        </mesh>
        {/* Neon frame — bottom */}
        <mesh position={[0, -1.6, 0.11]}>
          <boxGeometry args={[2.2, 0.12, 0.08]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3.5} />
        </mesh>
        {/* Neon frame — left */}
        <mesh position={[-1.1, 0, 0.11]}>
          <boxGeometry args={[0.12, 3.2, 0.08]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3.5} />
        </mesh>
        {/* Neon frame — right */}
        <mesh position={[1.1, 0, 0.11]}>
          <boxGeometry args={[0.12, 3.2, 0.08]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3.5} />
        </mesh>
        {/* Warning stripe */}
        <mesh position={[0, -0.8, 0.11]}>
          <boxGeometry args={[1.6, 0.08, 0.06]} />
          <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={4} />
        </mesh>
        {/* Point light casting pink glow on ground */}
        <pointLight color="#ff00ff" intensity={3} distance={6} position={[0, 0, 1]} />
      </group>
    </>
  )
}

// ─── NeonRaceTrail ────────────────────────────────────────────────
// Light trail residue of a car that just raced through 2 city blocks

// 20 trail segment positions — curved path from z=-10 to z=-55
// Each: [x, y, z, rotY]
const TRAIL_SEGMENTS: [number, number, number, number][] = [
  [ -5,  0.05,  -10,  0.0],
  [ -5,  0.05,  -13,  0.0],
  [ -5,  0.05,  -16,  0.0],
  [ -4,  0.05,  -19,  0.15],
  [ -3,  0.05,  -21,  0.25],
  [ -2,  0.05,  -23,  0.35],
  [  0,  0.05,  -25,  0.5],
  [  2,  0.05,  -27,  0.35],
  [  4,  0.05,  -29,  0.2],
  [  5,  0.05,  -31,  0.0],
  [  5,  0.05,  -34,  0.0],
  [  5,  0.05,  -37,  0.0],
  [  4,  0.05,  -40, -0.2],
  [  2,  0.05,  -42, -0.35],
  [  0,  0.05,  -44, -0.4],
  [ -2,  0.05,  -46, -0.3],
  [ -4,  0.05,  -48, -0.15],
  [ -5,  0.05,  -50,  0.0],
  [ -5,  0.05,  -52,  0.0],
  [ -5,  0.05,  -55,  0.0],
]

// Skid mark positions at turn apexes
const SKID_MARKS: [number, number, number, number][] = [
  [  0, 0.02, -25,  0.5],
  [  0, 0.02, -44, -0.4],
]

function NeonRaceTrail() {
  return (
    <>
      {TRAIL_SEGMENTS.map(([tx, ty, tz, rotY], i) => {
        // Opacity fades from 0.8 (fresh, at the front) to 0.1 (older, at back)
        const opacity = 0.8 - (i / TRAIL_SEGMENTS.length) * 0.7
        return (
          <mesh key={i} position={[tx, ty, tz]} rotation={[0, rotY, 0]}>
            <boxGeometry args={[0.08, 0.1, 1.5]} />
            <meshStandardMaterial
              color="#ff0044"
              emissive="#ff0044"
              emissiveIntensity={4}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        )
      })}

      {/* Skid marks at turns */}
      {SKID_MARKS.map(([sx, sy, sz, sRot], i) => (
        <mesh key={`skid${i}`} position={[sx, sy, sz]} rotation={[0, sRot, 0]}>
          <boxGeometry args={[0.5, 0.01, 2]} />
          <meshStandardMaterial
            color="#222222"
            roughness={1}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── RacingCar ────────────────────────────────────────────────────
// Illegal street racer parked in the left alley between buildings
function RacingCar() {
  // Placed in the alley at x=-40, z=-46 (between left-col buildings)
  const carX = -40
  const carY = 0
  const carZ = -46

  return (
    <group position={[carX, carY, carZ]} rotation={[0, Math.PI * 0.1, 0]}>
      {/* ── Low body ── */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.8, 0.5, 4]} />
        <meshStandardMaterial color="#110011" roughness={0.9} metalness={0.3} />
      </mesh>

      {/* ── Roof / cabin ── */}
      <mesh position={[0, 0.7, 0.3]}>
        <boxGeometry args={[1.5, 0.4, 2]} />
        <meshStandardMaterial color="#0d000d" roughness={0.85} metalness={0.35} />
      </mesh>

      {/* ── Spoiler — rear top, angled backward ── */}
      <mesh position={[0, 0.95, -1.6]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[2, 0.3, 0.4]} />
        <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.5} />
      </mesh>
      {/* Spoiler supports */}
      {([-0.7, 0.7] as number[]).map((xOff, i) => (
        <mesh key={`sp${i}`} position={[xOff, 0.7, -1.6]}>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.6} />
        </mesh>
      ))}

      {/* ── Wheels: 4 flat cylinders with emissive rim ── */}
      {([
        [-0.95, 0.3, -1.3],
        [ 0.95, 0.3, -1.3],
        [-0.95, 0.3,  1.3],
        [ 0.95, 0.3,  1.3],
      ] as [number, number, number][]).map((wpos, i) => (
        <group key={`wheel${i}`} position={wpos} rotation={[0, 0, Math.PI / 2]}>
          {/* Tyre */}
          <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
            <meshStandardMaterial color="#222222" roughness={0.95} metalness={0.1} />
          </mesh>
          {/* Emissive rim */}
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.27, 12]} />
            <meshStandardMaterial
              color="#ff0044"
              emissive="#ff0044"
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      ))}

      {/* ── Underglow strip ── */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.6, 0.04, 3.6]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={3}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      {/* Underglow point light */}
      <pointLight color="#ff00ff" intensity={4} distance={5} position={[0, 0.1, 0]} />

      {/* ── Headlights (front = +z) ── */}
      <mesh position={[-0.5, 0.32, 2.01]}>
        <boxGeometry args={[0.5, 0.1, 0.04]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
        />
      </mesh>
      <mesh position={[0.5, 0.32, 2.01]}>
        <boxGeometry args={[0.5, 0.1, 0.04]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
        />
      </mesh>
      {/* Headlight point lights */}
      <pointLight color="#ffffff" intensity={3} distance={8} position={[-0.5, 0.32, 2.1]} />
      <pointLight color="#ffffff" intensity={3} distance={8} position={[ 0.5, 0.32, 2.1]} />

      {/* ── Tail lights ── */}
      <mesh position={[-0.5, 0.32, -2.01]}>
        <boxGeometry args={[0.5, 0.1, 0.04]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={3}
        />
      </mesh>
      <mesh position={[0.5, 0.32, -2.01]}>
        <boxGeometry args={[0.5, 0.1, 0.04]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={3}
        />
      </mesh>

      {/* ── Tinted windows (blue-tint glass) ── */}
      {/* Front windshield */}
      <mesh position={[0, 0.75, 1.25]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[1.4, 0.35, 0.06]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0022aa"
          emissiveIntensity={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.75, -0.7]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[1.4, 0.35, 0.06]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0022aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.65}
        />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.76, 0.73, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.8, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0022aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[0.76, 0.73, 0.3]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.8, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0022aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── Neon stripe along body sides ── */}
      <mesh position={[-0.91, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.06, 3.8]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={4} />
      </mesh>
      <mesh position={[0.91, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.06, 3.8]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={4} />
      </mesh>
    </group>
  )
}

// ─── HackerLair ───────────────────────────────────────────────────
// Underground hacker den visible through a wall window at x=-44, z=-55 (left alley)
function HackerLair() {
  // 8 monitor refs for individual pulsing
  const monRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const phases  = useRef<number[]>([0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    monRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.emissiveIntensity = 1.5 + Math.sin(t * 1.8 + phases.current[i]!) * 1.0
    })
  })

  // Lair origin: x=-44, y=0, z=-55
  const lx = -44
  const ly = 0
  const lz = -55

  // Monitor data: [relX, relY, relZ, rotY, color]
  const MONITORS: [number, number, number, number, string][] = [
    [-1.5, 2.5, -2.8,  0,           '#00ff44'],
    [ 0.0, 2.5, -2.8,  0,           '#0088ff'],
    [ 1.5, 2.5, -2.8,  0,           '#ff0044'],
    [-1.5, 1.0, -2.8,  0,           '#ffffff'],
    [-2.8, 2.5,  0.0,  Math.PI / 2, '#00ff44'],
    [-2.8, 1.0,  0.0,  Math.PI / 2, '#0088ff'],
    [ 2.8, 2.5,  0.0, -Math.PI / 2, '#ff0044'],
    [ 2.8, 1.0,  0.0, -Math.PI / 2, '#00ff44'],
  ]

  // Code rain strips: 5 thin vertical strips on the first front monitor
  const CODE_STRIPS: [number, number][] = [-0.65, -0.32, 0.0, 0.32, 0.65].map(
    (xOff) => [xOff, 0] as [number, number],
  )

  return (
    <group position={[lx, ly, lz]}>
      {/* ── Lair walls ── */}
      {/* Back wall */}
      <mesh position={[0, 2.5, -3]}>
        <boxGeometry args={[8, 5, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-4, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5.05, 0]}>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>
      {/* Floor */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.95} />
      </mesh>

      {/* ── Window opening (cut look) — neon frame on front face ── */}
      {/* Top frame */}
      <mesh position={[0, 4.15, 3.1]}>
        <boxGeometry args={[6.2, 0.12, 0.08]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
      </mesh>
      {/* Bottom frame */}
      <mesh position={[0, 0.85, 3.1]}>
        <boxGeometry args={[6.2, 0.12, 0.08]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-3.1, 2.5, 3.1]}>
        <boxGeometry args={[0.12, 3.3, 0.08]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
      </mesh>
      {/* Right frame */}
      <mesh position={[3.1, 2.5, 3.1]}>
        <boxGeometry args={[0.12, 3.3, 0.08]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={3} />
      </mesh>

      {/* ── Half-open door (right side) ── */}
      {/* Door slab — rotated ~45° outward */}
      <mesh position={[3.6, 1.5, 2.4]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.1, 3, 1.4]} />
        <meshStandardMaterial color="#111122" roughness={0.8} metalness={0.5} />
      </mesh>
      {/* Door neon frame strip */}
      <mesh position={[3.6, 1.5, 2.4]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.06, 3.1, 0.06]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} />
      </mesh>

      {/* ── Monitors ── */}
      {MONITORS.map(([rx, ry, rz, rotY, color], i) => (
        <group key={`mon${i}`} position={[rx, ry, rz]} rotation={[0, rotY, 0]}>
          {/* Screen backing */}
          <mesh>
            <boxGeometry args={[1.8, 1.2, 0.08]} />
            <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* Screen face */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[1.6, 1.0, 0.02]} />
            <meshStandardMaterial
              ref={(el) => { monRefs.current[i] = el }}
              color={color}
              emissive={color}
              emissiveIntensity={2}
            />
          </mesh>
          {/* Code rain strips on first monitor only */}
          {i === 0 && CODE_STRIPS.map(([xOff], si) => (
            <mesh key={`cs${si}`} position={[xOff, 0, 0.07]}>
              <boxGeometry args={[0.04, 0.9, 0.01]} />
              <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={4} transparent opacity={0.8} />
            </mesh>
          ))}
          {/* Monitor stand */}
          <mesh position={[0, -0.75, 0]}>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Server racks — 4 tall columns ── */}
      {([-2.8, -1.2, 1.2, 2.8] as number[]).map((rx, i) => (
        <group key={`rack${i}`} position={[rx, 1.5, -2.6]}>
          <mesh>
            <boxGeometry args={[0.6, 3, 0.4]} />
            <meshStandardMaterial color="#1a1a2a" roughness={0.6} metalness={0.7} />
          </mesh>
          {/* LED dots — 6 per rack */}
          {Array.from({ length: 6 }, (_, di) => (
            <mesh key={`led${di}`} position={[0.25, -1.2 + di * 0.44, 0.21]}>
              <sphereGeometry args={[0.04, 4, 4]} />
              <meshStandardMaterial
                color={di % 2 === 0 ? '#00ff44' : '#0088ff'}
                emissive={di % 2 === 0 ? '#00ff44' : '#0088ff'}
                emissiveIntensity={4}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Neon skull decal on left wall ── */}
      {/* Skull sphere */}
      <mesh position={[-3.6, 3.0, -1.0]}>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color="#1a0000" emissive="#ff0044" emissiveIntensity={4} />
      </mesh>
      {/* Jaw box */}
      <mesh position={[-3.6, 2.55, -1.0]}>
        <boxGeometry args={[0.3, 0.18, 0.18]} />
        <meshStandardMaterial color="#1a0000" emissive="#ff0044" emissiveIntensity={4} />
      </mesh>
      {/* Eye sockets */}
      <mesh position={[-3.61, 3.08, -0.92]}>
        <boxGeometry args={[0.08, 0.07, 0.04]} />
        <meshStandardMaterial color="#000000" emissive="#000000" />
      </mesh>
      <mesh position={[-3.61, 3.08, -1.08]}>
        <boxGeometry args={[0.08, 0.07, 0.04]} />
        <meshStandardMaterial color="#000000" emissive="#000000" />
      </mesh>

      {/* ── Hacker chair ── */}
      {/* Seat */}
      <mesh position={[1.0, 0.45, 0.5]}>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Reclined back */}
      <mesh position={[1.0, 0.9, -0.08]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[0.88, 0.9, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Chair legs */}
      {([[-0.35, -0.35], [-0.35, 0.35], [0.35, -0.35], [0.35, 0.35]] as [number, number][]).map(([xo, zo], li) => (
        <mesh key={`cl${li}`} position={[1.0 + xo, 0.2, 0.5 + zo]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.5} />
        </mesh>
      ))}

      {/* ── Pizza box (authentic hacker detail) ── */}
      <mesh position={[0.5, 0.04, 1.5]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#cc8833" roughness={0.95} />
      </mesh>
      {/* Cheese stripe on pizza box */}
      <mesh position={[0.5, 0.09, 1.5]}>
        <boxGeometry args={[0.38, 0.01, 0.38]} />
        <meshStandardMaterial color="#ffcc44" roughness={0.9} />
      </mesh>

      {/* ── Green ambiance point light ── */}
      <pointLight color="#004400" intensity={6} distance={10} position={[0, 2.5, 0]} />
      {/* Cyan trim lights */}
      <pointLight color="#00ffcc" intensity={2} distance={6} position={[0, 4.5, 0]} />
      <pointLight color="#004444" intensity={3} distance={8} position={[-3, 1, 2]} />
    </group>
  )
}

// ─── DroneSwarm ───────────────────────────────────────────────────
// 8 surveillance drones patrolling the city at y=15-20
interface DroneData {
  center: [number, number, number]
  radius: number
  height: number
  speed: number
  phase: number
}

const DRONE_SWARM_CONFIG: DroneData[] = [
  { center: [ -8,  0, -18], radius:  7, height: 16, speed: 0.55, phase: 0.0 },
  { center: [  8,  0, -18], radius:  6, height: 17, speed: 0.70, phase: 0.8 },
  { center: [-14,  0, -42], radius:  9, height: 15, speed: 0.45, phase: 1.6 },
  { center: [ 14,  0, -42], radius:  8, height: 18, speed: 0.60, phase: 2.4 },
  { center: [  0,  0, -60], radius: 10, height: 20, speed: 0.40, phase: 3.2 },
  { center: [-10,  0, -75], radius:  7, height: 16, speed: 0.65, phase: 4.0 },
  { center: [ 10,  0, -75], radius:  8, height: 19, speed: 0.50, phase: 4.8 },
  { center: [  0,  0, -85], radius: 11, height: 17, speed: 0.35, phase: 5.6 },
]

function SurveillanceDrone({ center, radius, height, speed, phase }: DroneData) {
  const groupRef  = useRef<THREE.Group>(null!)
  const rotor1Ref = useRef<THREE.Mesh>(null!)
  const rotor2Ref = useRef<THREE.Mesh>(null!)
  const rotor3Ref = useRef<THREE.Mesh>(null!)
  const rotor4Ref = useRef<THREE.Mesh>(null!)
  const lightRef  = useRef<THREE.MeshStandardMaterial>(null!)
  const [cx, , cz] = center

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    // Patrol position
    if (groupRef.current) {
      groupRef.current.position.set(
        cx + Math.cos(t * speed + phase) * radius,
        height + Math.sin(t * 0.4 + phase) * 0.5,
        cz + Math.sin(t * speed + phase) * radius,
      )
      groupRef.current.rotation.y = -(t * speed + phase) + Math.PI / 2
    }
    // Spin rotors fast
    const spinDelta = 0.3
    if (rotor1Ref.current) rotor1Ref.current.rotation.y += spinDelta
    if (rotor2Ref.current) rotor2Ref.current.rotation.y += spinDelta
    if (rotor3Ref.current) rotor3Ref.current.rotation.y += spinDelta
    if (rotor4Ref.current) rotor4Ref.current.rotation.y += spinDelta
    // Alternating red/blue light
    if (lightRef.current) {
      const flash = Math.floor(t / 0.4) % 2 === 0
      lightRef.current.color.set(flash ? '#ff2200' : '#0044ff')
      lightRef.current.emissive.set(flash ? '#ff2200' : '#0044ff')
    }
  })

  // Rotor positions at corners of drone body
  const ROTOR_OFFSETS: [number, number, number][] = [
    [-0.55, 0.08,  0.55],
    [ 0.55, 0.08,  0.55],
    [-0.55, 0.08, -0.55],
    [ 0.55, 0.08, -0.55],
  ]
  const rotorRefs = [rotor1Ref, rotor2Ref, rotor3Ref, rotor4Ref]

  return (
    <group ref={groupRef}>
      {/* Body — flat octagon approximated as cylinder */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 8]} />
        <meshStandardMaterial color="#111122" emissive="#0033aa" emissiveIntensity={1.2} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Rotors — 4 small cylinders */}
      {ROTOR_OFFSETS.map((rpos, i) => (
        <mesh key={`r${i}`} ref={rotorRefs[i]} position={rpos}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 6]} />
          <meshStandardMaterial color="#222233" roughness={0.5} metalness={0.8} />
        </mesh>
      ))}

      {/* Alternating red/blue blink light */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshStandardMaterial
          ref={lightRef}
          color="#ff2200"
          emissive="#ff2200"
          emissiveIntensity={4}
        />
      </mesh>
      {/* Second side light */}
      <mesh position={[0.3, 0.0, 0]}>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshStandardMaterial color="#0044ff" emissive="#0044ff" emissiveIntensity={3} />
      </mesh>

      {/* Scanning beam — thin cone pointing downward */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.6, 2.5, 8, 1, true]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.2}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Scanning point light below drone */}
      <pointLight color="#0088ff" intensity={1.5} distance={6} position={[0, -1, 0]} />
    </group>
  )
}

function DroneSwarm() {
  return (
    <>
      {DRONE_SWARM_CONFIG.map((cfg, i) => (
        <SurveillanceDrone key={`ds${i}`} {...cfg} />
      ))}
    </>
  )
}

// ─── GraffitiWalls ────────────────────────────────────────────────
// Neon graffiti murals on building walls

// Mural 1: Abstract shapes (left wall, z=-18)
function GraffitiMural1() {
  const DRIPS: [number, number, number][] = [[-1.2, -1.8, 0], [0, -2.1, 0], [1.0, -1.6, 0]]
  return (
    <group position={[-31.5, 8, -18]} rotation={[0, Math.PI / 2, 0]}>
      {/* Main overlapping boxes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 2.0, 0.1]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.4, 0.3, 0.05]}>
        <boxGeometry args={[2.0, 1.2, 0.08]} />
        <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={2.5} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-0.5, -0.2, 0.06]}>
        <boxGeometry args={[1.2, 1.8, 0.07]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
      {/* Drips */}
      {DRIPS.map(([dx, dy, dz], i) => (
        <mesh key={`d1${i}`} position={[dx, dy, dz]}>
          <boxGeometry args={[0.08, 0.5 + i * 0.15, 0.06]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Mural 2: Big question mark "?" shape (right wall, z=-32)
function GraffitiMural2() {
  const DRIPS: [number, number, number][] = [[-0.3, -2.5, 0], [0.3, -2.2, 0]]
  return (
    <group position={[31.5, 9, -32]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Question mark top arc — two boxes forming curve */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.4, 0.25, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.55, 0.7, 0]}>
        <boxGeometry args={[0.25, 1.0, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.25, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      {/* Stem of ? */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.25, 0.9, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      {/* Dot of ? */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} transparent opacity={0.95} />
      </mesh>
      {/* Drips */}
      {DRIPS.map(([dx, dy, dz], i) => (
        <mesh key={`d2${i}`} position={[dx, dy, dz]}>
          <boxGeometry args={[0.06, 0.4 + i * 0.1, 0.06]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Mural 3: Robot face made of geometric boxes (left wall, z=-48)
function GraffitiMural3() {
  const DRIPS: [number, number, number][] = [[-0.6, -2.3, 0], [0, -2.5, 0], [0.7, -2.0, 0]]
  return (
    <group position={[-31.5, 7, -48]} rotation={[0, Math.PI / 2, 0]}>
      {/* Head outline */}
      <mesh>
        <boxGeometry args={[2.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.85} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.55, 0.4, 0.06]}>
        <boxGeometry args={[0.5, 0.35, 0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.55, 0.4, 0.06]}>
        <boxGeometry args={[0.5, 0.35, 0.08]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.1, 0.07]}>
        <boxGeometry args={[0.18, 0.35, 0.07]} />
        <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={2.5} transparent opacity={0.85} />
      </mesh>
      {/* Mouth — wide grill */}
      <mesh position={[0, -0.65, 0.07]}>
        <boxGeometry args={[1.4, 0.22, 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      {/* Mouth grill teeth — 5 vertical bars */}
      {([-0.5, -0.25, 0, 0.25, 0.5] as number[]).map((xo, ti) => (
        <mesh key={`t${ti}`} position={[xo, -0.65, 0.09]}>
          <boxGeometry args={[0.06, 0.18, 0.05]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* Antenna on top */}
      <mesh position={[0, 1.35, 0.07]}>
        <boxGeometry args={[0.08, 0.4, 0.07]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 1.6, 0.07]}>
        <sphereGeometry args={[0.1, 5, 4]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={4} />
      </mesh>
      {/* Drips */}
      {DRIPS.map(([dx, dy, dz], i) => (
        <mesh key={`d3${i}`} position={[dx, dy, dz]}>
          <boxGeometry args={[0.07, 0.45 + i * 0.1, 0.06]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Mural 4: Abstract bars (right wall, z=-62)
function GraffitiMural4() {
  const DRIPS: [number, number, number][] = [[-0.8, -2.0, 0], [0.2, -2.3, 0]]
  const BARS: [number, number, number, number][] = [
    [-1.0, 0.5, 4.0, 0.3],
    [-0.2, 0.0, 3.0, 0.28],
    [ 0.6, -0.4, 2.0, 0.26],
    [-0.5, 1.2, 1.5, 0.22],
  ]
  return (
    <group position={[31.5, 8, -62]} rotation={[0, -Math.PI / 2, 0]}>
      {BARS.map(([bx, by, bw, bh], i) => (
        <mesh key={`b4${i}`} position={[bx, by, i * 0.02]}>
          <boxGeometry args={[bw, bh, 0.1]} />
          <meshStandardMaterial
            color={(['#ff00aa', '#ffcc00', '#ff4400', '#00ff88'] as const)[i % 4]}
            emissive={(['#ff00aa', '#ffcc00', '#ff4400', '#00ff88'] as const)[i % 4]}
            emissiveIntensity={2.5}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
      {/* Drips */}
      {DRIPS.map(([dx, dy, dz], i) => (
        <mesh key={`d4${i}`} position={[dx, dy, dz]}>
          <boxGeometry args={[0.07, 0.38 + i * 0.1, 0.06]} />
          <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={2.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Mural 5: Large overlapping circles/blobs on back wall, z=-90 south face
function GraffitiMural5() {
  const DRIPS: [number, number, number][] = [[-1.0, -3.0, 0], [0.0, -3.2, 0], [1.2, -2.8, 0]]
  return (
    <group position={[0, 10, -84]} rotation={[0, 0, 0]}>
      {/* Big circle approximated as sphere + backing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 3.0, 0.1]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.0, 0.3, 0.05]}>
        <boxGeometry args={[2.5, 1.8, 0.09]} />
        <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={2.5} transparent opacity={0.85} />
      </mesh>
      <mesh position={[1.2, -0.4, 0.07]}>
        <boxGeometry args={[1.8, 2.2, 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.5} transparent opacity={0.8} />
      </mesh>
      {/* X mark */}
      <mesh position={[0.5, 0.6, 0.09]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.2, 0.18, 0.07]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.5, 0.6, 0.09]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[1.2, 0.18, 0.07]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      {/* Drips */}
      {DRIPS.map(([dx, dy, dz], i) => (
        <mesh key={`d5${i}`} position={[dx, dy, dz]}>
          <boxGeometry args={[0.08, 0.5 + i * 0.12, 0.06]} />
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2.5} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function GraffitiWalls() {
  return (
    <>
      <GraffitiMural1 />
      <GraffitiMural2 />
      <GraffitiMural3 />
      <GraffitiMural4 />
      <GraffitiMural5 />
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
      {/* ── Dark cyberpunk sky override (overrides GameScene GradientSky) ── */}
      <GradientSky top="#0d0020" bottom="#1a0035" radius={440} />
      {nightLights}
      {/* ── Holographic ground grid ── */}
      <HoloGrid />
      {/* ── Cyberpunk rain ── */}
      <Rain />
      {/* ── Neon rain streaks (Blade Runner / Ghost in the Shell) ── */}
      <NeonRain />
      {/* ── Flying drone swarm ── */}
      <FlyingDrones />
      {/* ── Hovercar street traffic ── */}
      <HoverTraffic />
      {/* ── Traffic light poles at intersections ── */}
      <TrafficLights />
      {/* ── Blinking window lights on building faces ── */}
      <WindowPulse />
      {/* ── Neon skyline bars at building-top height ── */}
      <NeonSkylines />
      {/* ── Neon sign panels on building facades ── */}
      <NeonSigns />
      {/* ── Rooftop communication antenna towers ── */}
      <RooftopAntennas />
      {/* ── Street-level holographic vending kiosks ── */}
      <StreetVendors />
      {/* ── Floating advertisement boards in sky ── */}
      <FlyingAds />
      {/* ── Cyberpunk metro / subway entrances ── */}
      <MetroEntrance />
      {/* ── Holographic police officers at intersections ── */}
      <HoloCops />
      {/* ── Neon-reflective street puddles ── */}
      <NeonPuddles />
      {/* ── Ground wet reflections ── */}
      <GroundPuddles />
      {/* ── Underground racing circuit hints (grates + access door) ── */}
      <UndergroundRacingHints />
      {/* ── Neon light trail residue from recent illegal race ── */}
      <NeonRaceTrail />
      {/* ── Illegal street racer parked in the left alley ── */}
      <RacingCar />
      {/* ── Rebel hacker underground lair (left alley, z=-55) ── */}
      <HackerLair />
      {/* ── Surveillance drone swarm patrolling city at y=15-20 ── */}
      <DroneSwarm />
      {/* ── Neon graffiti murals on building walls ── */}
      <GraffitiWalls />
      {/* ── Holographic billboard panels ── */}
      <HoloBillboard pos={[-8,  12, -20]} rotY={0} />
      <HoloBillboard pos={[9,   18, -30]} rotY={Math.PI} />
      <HoloBillboard pos={[-9,  22, -55]} rotY={0} />
      <HoloBillboard pos={[8,   15, -65]} rotY={Math.PI} />
      <HoloBillboard pos={[-8,  25, -75]} rotY={0.3} />
      <HoloBillboard pos={[9,   20, -80]} rotY={-0.3} />
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
      <NeonSign pos={[-32, 20, -5.95]} size={[8, 4]} color={NEON_PINK}   freqIdx={0} />
      <NeonSign pos={[32, 16, -5.95]}  size={[8, 3]} color={NEON_BLUE}   freqIdx={1} />
      <NeonSign pos={[-32, 12, -33.95]} size={[8, 3]} color={NEON_PURPLE} rotY={Math.PI} freqIdx={2} />
      <NeonSign pos={[0, 24, -5.95]}   size={[6, 3]} color={NEON_YELLOW} freqIdx={3} />
      <NeonSign pos={[0, 10, -58.95]}  size={[6, 2.5]} color={NEON_CYAN} freqIdx={0} />
      <NeonSign pos={[9.05, 20, -95]}  size={[5, 3]} color={NEON_RED}    rotY={-Math.PI / 2} freqIdx={1} />
      <NeonSign pos={[-9.05, 18, -95]} size={[5, 3]} color={NEON_RED}    rotY={Math.PI / 2}  freqIdx={2} />

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
      {/* Роботы на улицах */}
      <NpcRobot pos={[0, 0, -20]} rotY={Math.PI} />
      <NpcRobot pos={[-30, 0, -60]} rotY={0.5} />

      {/* ═══ BOSS: КИБЕР-ДРАКОН (final boss — skyscraper roof) ═══ */}
      {/* Positioned on the roof platform at y=36.6, facing south toward the player */}
      <BossDragon pos={[0, 36.6, -95]} scale={1.6} rotY={Math.PI} />

      {/* ═══ BOSS: КИБЕР-СТРАЖ (mid-city checkpoint guardian) ═══ */}
      {/* Guards the approach to the final skyscraper at street level z=-80 */}
      <BossGolem pos={[0, 1.0, -80]} scale={1.4} rotY={Math.PI} />

      {/* ═══ CRYO SERVER BANKS — IceBlock data-storage arrays ═══ */}
      {/* Server room cluster: left alley between left-col buildings */}
      <IceBlock pos={[-46, 0.5, -30]} scale={1.1} rotY={0.2} />
      <IceBlock pos={[-50, 0.5, -30]} scale={0.9} rotY={-0.3} />
      <IceBlock pos={[-46, 0.5, -36]} scale={1.2} rotY={0.5} />
      <IceBlock pos={[-50, 0.5, -36]} scale={1.0} rotY={0.1} />
      {/* Server room cluster: right alley */}
      <IceBlock pos={[46, 0.5, -55]} scale={1.1} rotY={-0.2} />
      <IceBlock pos={[50, 0.5, -55]} scale={0.9} rotY={0.4} />
      <IceBlock pos={[46, 0.5, -61]} scale={1.0} rotY={-0.4} />
      <IceBlock pos={[50, 0.5, -61]} scale={1.2} rotY={0.0} />

      {/* ═══ DATA CRYSTALS — CrystalCluster server-node formations ═══ */}
      {/* Emerging from the cyber-ground along the main approach */}
      <CrystalCluster pos={[-8, 0.0, -18]}  scale={1.0} rotY={0.3} />
      <CrystalCluster pos={[8, 0.0, -18]}   scale={0.9} rotY={-0.4} />
      <CrystalCluster pos={[-6, 0.0, -48]}  scale={1.1} rotY={0.8} />
      <CrystalCluster pos={[6, 0.0, -48]}   scale={1.0} rotY={-0.6} />
      <CrystalCluster pos={[-8, 0.0, -72]}  scale={1.2} rotY={0.2} />
      <CrystalCluster pos={[8, 0.0, -72]}   scale={1.0} rotY={-0.2} />
      <CrystalCluster pos={[-5, 0.0, -88]}  scale={0.9} rotY={1.0} />
      <CrystalCluster pos={[5, 0.0, -88]}   scale={1.1} rotY={-0.8} />

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
