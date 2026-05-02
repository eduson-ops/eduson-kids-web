import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { BackSide } from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'

const _isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import { Spaceship, BossDragon, BossGolem, IceBlock, CrystalCluster, ScifiCrate, UFO, Meteor } from '../Scenery'

// ─── Wormhole rainbow shader ──────────────────────────────────────
const WORMHOLE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const WORMHOLE_FRAGMENT = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    float hue = mod(vUv.x * 3.0 + vUv.y * 2.0 + uTime * 0.6, 1.0);
    // HSV to RGB
    vec3 c = abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0;
    vec3 rgb = clamp(c, 0.0, 1.0);
    gl_FragColor = vec4(rgb, 1.0);
  }
`

function Wormhole() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const grpRef = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    if (matRef.current) matRef.current.uniforms.uTime!.value = clock.getElapsedTime()
    if (grpRef.current) grpRef.current.rotation.z += step * 0.8
  })
  return (
    <group ref={grpRef} position={[0, 15, -180]}>
      <mesh>
        <torusGeometry args={[6, 0.5, 12, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={WORMHOLE_VERTEX}
          fragmentShader={WORMHOLE_FRAGMENT}
          uniforms={{ uTime: { value: 0 } }}
          toneMapped={false}
        />
      </mesh>
      <pointLight color="#cc88ff" intensity={3} distance={40} />
    </group>
  )
}

// ─── Solar panels ────────────────────────────────────────────────
function SolarPanels() {
  const PANEL_MAT = { color: '#0a1a3a', emissive: '#0033cc', emissiveIntensity: 0.4 }
  return (
    <>
      {/* Left side panels */}
      <mesh position={[-20, 12, -52]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial {...PANEL_MAT} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[-20, 12, -84]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial {...PANEL_MAT} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Right side panels */}
      <mesh position={[20, 12, -52]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial {...PANEL_MAT} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[20, 12, -84]}>
        <boxGeometry args={[8, 0.1, 3]} />
        <meshStandardMaterial {...PANEL_MAT} roughness={0.2} metalness={0.9} />
      </mesh>
    </>
  )
}

// ─── Space debris ────────────────────────────────────────────────
interface DebrisData {
  pos: [number, number, number]
  size: number
  rotSpeedX: number
  rotSpeedY: number
  rotSpeedZ: number
}

function SpaceDebris() {
  const debrisData = useMemo<DebrisData[]>(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: 15 }, (_, i) => ({
      pos: [
        (seed(i * 7.1) - 0.5) * 60,
        3 + seed(i * 7.2) * 12,
        -20 - seed(i * 7.3) * 130,
      ] as [number, number, number],
      size: 0.3 + seed(i * 7.4) * 0.5,
      rotSpeedX: (seed(i * 7.5) - 0.5) * 0.6,
      rotSpeedY: (seed(i * 7.6) - 0.5) * 0.4,
      rotSpeedZ: (seed(i * 7.7) - 0.5) * 0.5,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    debrisData.forEach((d, i) => {
      const m = meshRefs.current[i]
      if (!m) return
      m.rotation.x += d.rotSpeedX * step
      m.rotation.y += d.rotSpeedY * step
      m.rotation.z += d.rotSpeedZ * step
    })
  })

  return (
    <>
      {debrisData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={d.pos}
        >
          <boxGeometry args={[d.size, d.size * 0.7, d.size * 0.9]} />
          <meshStandardMaterial color="#556677" roughness={0.6} metalness={0.8} />
        </mesh>
      ))}
    </>
  )
}

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
  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    phase.current += step * speed
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
  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    phase.current += step * 3
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

// ─── StarField ─── 600→1 draw call via THREE.Points ──────────────
function StarField() {
  const geometry = useMemo(() => {
    const RADIUS = 200
    const count = 600
    const buf = new Float32Array(count * 3)
    let n = 0
    while (n < count) {
      const x = (Math.random() * 2 - 1) * RADIUS
      const y = (Math.random() * 2 - 1) * RADIUS
      const z = (Math.random() * 2 - 1) * RADIUS
      if (x * x + y * y + z * z <= RADIUS * RADIUS) {
        buf[n * 3] = x; buf[n * 3 + 1] = y; buf[n * 3 + 2] = z; n++
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(buf, 3))
    return geo
  }, [])
  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial color="white" size={0.5} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

// ─── Cosmic nebula backdrop planes ───────────────────────────────
// Three large semi-transparent planes far behind the station, evoking
// deep-space nebula clouds in the distance.
function NebulaBackdrop() {
  return (
    <>
      {/* Deep purple cloud */}
      <mesh position={[-20, 30, -220]} rotation={[0.1, 0.15, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#220044"
          transparent
          opacity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Deep blue cloud */}
      <mesh position={[25, 10, -270]} rotation={[-0.05, -0.2, 0.05]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#001133"
          transparent
          opacity={0.35}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Dark violet cloud */}
      <mesh position={[-10, -8, -245]} rotation={[0.12, 0.08, -0.08]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#110022"
          transparent
          opacity={0.30}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

// ─── Thruster glow rings ──────────────────────────────────────────
// Cyan torus rings placed at the station's aft section to simulate
// engine nozzle glow. Each ring pairs with a PointLight for local bloom.
const THRUSTER_POSITIONS: Array<[number, number, number]> = [
  [-6, 0, -148],
  [6, 0, -148],
  [-6, 7, -148],
  [6, 7, -148],
  [0, 14, -150],
  [0, 3.5, -150],
]

function ThrusterGlowRings() {
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    ringRefs.current.forEach((m, i) => {
      if (!m) return
      // Subtle pulse on scale
      const pulse = 1 + Math.sin(t * 2.5 + i * 1.1) * 0.06
      m.scale.setScalar(pulse)
    })
  })
  return (
    <>
      {THRUSTER_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh ref={(el) => { ringRefs.current[i] = el }} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.15, 16, 64]} />
            <meshBasicMaterial color="#00ffff" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* 2 shared lights for the whole thruster cluster */}
      <pointLight color="#00aaff" intensity={5} distance={20} position={[-6, 3.5, -149]} />
      <pointLight color="#00aaff" intensity={5} distance={20} position={[6, 3.5, -149]} />
    </>
  )
}

// ─── Dense debris field (InstancedMesh) ───────────────────────────
// 40 small tumbling boxes spread across deep-z background space.
const DEBRIS_COUNT = 40

function DebrisField() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)

  // Pre-allocated temporaries — reused every frame, no per-frame GC pressure
  const _mat = useRef(new THREE.Matrix4())
  const _pos = useRef(new THREE.Vector3())
  const _quat = useRef(new THREE.Quaternion())
  const _scl = useRef(new THREE.Vector3())

  // Per-instance data: angular velocity + initial matrix
  const instanceData = useMemo(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: DEBRIS_COUNT }, (_, i) => {
      const sx = seed(i * 13.1)
      const sy = seed(i * 13.2)
      const sz = seed(i * 13.3)
      const s = 0.15 + seed(i * 13.4) * 0.25
      return {
        pos: new THREE.Vector3(
          (seed(i * 13.5) - 0.5) * 120,
          -15 + seed(i * 13.6) * 45,
          -50 - seed(i * 13.7) * 130,
        ),
        scale: new THREE.Vector3(s, s * 0.7, s * 0.9),
        rotX: (sx - 0.5) * 1.2,
        rotY: (sy - 0.5) * 0.9,
        rotZ: (sz - 0.5) * 1.0,
        euler: new THREE.Euler(seed(i * 13.8) * Math.PI * 2, seed(i * 13.9) * Math.PI * 2, seed(i * 14.0) * Math.PI * 2),
      }
    })
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const mat = new THREE.Matrix4()
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scl = new THREE.Vector3()
    instanceData.forEach((d, i) => {
      pos.copy(d.pos)
      quat.setFromEuler(d.euler)
      scl.copy(d.scale)
      mat.compose(pos, quat, scl)
      meshRef.current.setMatrixAt(i, mat)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [instanceData])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    const mat = _mat.current
    const pos = _pos.current
    const quat = _quat.current
    const scl = _scl.current
    instanceData.forEach((d, i) => {
      d.euler.x += d.rotX * step
      d.euler.y += d.rotY * step
      d.euler.z += d.rotZ * step
      pos.copy(d.pos)
      quat.setFromEuler(d.euler)
      scl.copy(d.scale)
      mat.compose(pos, quat, scl)
      meshRef.current.setMatrixAt(i, mat)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DEBRIS_COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#666688" />
    </instancedMesh>
  )
}

// ─── Extended bright star layer ───────────────────────────────────
// 200 additional bright stars concentrated in the deep-z far field
// (z -150 to -400) to increase the sense of cosmic depth.
function DeepStars() {
  const COUNT = 200
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const starData = useMemo(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: COUNT }, (_, i) => ({
      pos: [
        (seed(i * 17.1) - 0.5) * 320,
        (seed(i * 17.2) - 0.5) * 280,
        -150 - seed(i * 17.3) * 250,
      ] as [number, number, number],
      r: 0.1 + seed(i * 17.4) * 0.1,
    }))
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    starData.forEach((s, i) => {
      dummy.position.set(...s.pos)
      dummy.scale.setScalar(s.r)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [starData])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#e8eeff" toneMapped={false} />
    </instancedMesh>
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

// ─── Asteroid belt (instanced, 80 asteroids) ──────────────────────
const ASTEROID_COUNT = 80

interface AsteroidInstanceData {
  angle: number
  ringRadius: number
  y: number
  scale: number
  orbitSpeed: number
  rotX: number
  rotY: number
  rotZ: number
  selfRotSpeed: number
  rx: number
  ry: number
  rz: number
}

function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  const asteroids = useMemo<AsteroidInstanceData[]>(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: ASTEROID_COUNT }, (_, i) => ({
      angle: seed(i * 5.1) * Math.PI * 2,
      ringRadius: 80 + seed(i * 5.2) * 50,          // 80–130
      y: -15 + seed(i * 5.3) * 30,                   // -15 to +15
      scale: 0.4 + seed(i * 5.4) * 2.1,              // 0.4–2.5
      orbitSpeed: 0.008 + seed(i * 5.5) * 0.017,     // 0.008–0.025 rad/s
      rotX: seed(i * 5.6) * Math.PI * 2,
      rotY: seed(i * 5.7) * Math.PI * 2,
      rotZ: seed(i * 5.8) * Math.PI * 2,
      selfRotSpeed: 0.2 + seed(i * 5.9) * 0.6,       // 0.2–0.8
      rx: 0,
      ry: 0,
      rz: 0,
    }))
  }, [])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    for (let i = 0; i < ASTEROID_COUNT; i++) {
      const a = asteroids[i]!
      a.angle += a.orbitSpeed * step
      a.rx += a.selfRotSpeed * step
      a.ry += a.selfRotSpeed * step * 0.7
      a.rz += a.selfRotSpeed * step * 0.5
      dummy.position.set(
        Math.cos(a.angle) * a.ringRadius,
        a.y,
        Math.sin(a.angle) * a.ringRadius,
      )
      dummy.scale.setScalar(a.scale)
      dummy.rotation.set(a.rx, a.ry, a.rz)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]} frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#4a4a5a" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  )
}

// ─── Nebula glow spheres ───────────────────────────────────────────
function NebulaGlow() {
  const CLOUDS: Array<{ pos: [number, number, number]; radius: number; color: string }> = [
    { pos: [180, 20, -120],  radius: 55, color: '#330066' },
    { pos: [-150, -30, 80],  radius: 60, color: '#003366' },
    { pos: [60, 50, -200],   radius: 40, color: '#331100' },
  ]
  return (
    <>
      {CLOUDS.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <sphereGeometry args={[c.radius, 16, 16]} />
          <meshBasicMaterial
            color={c.color}
            transparent
            opacity={0.04}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      ))}
    </>
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

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
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

// ─── UFO Encounter ────────────────────────────────────────────────
function UFOEncounter() {
  const grp1Ref = useRef<THREE.Group>(null!)
  const grp2Ref = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    // UFO 1: large slow orbit at far distance
    if (grp1Ref.current) {
      grp1Ref.current.position.x = Math.sin(t * 0.08) * 80
      grp1Ref.current.position.y = 20 + Math.sin(t * 0.3) * 5
      grp1Ref.current.position.z = -70 + Math.cos(t * 0.08) * 80
      grp1Ref.current.rotation.y = t * 0.2
    }
    // UFO 2: smaller faster orbit — attack run at station
    if (grp2Ref.current) {
      grp2Ref.current.position.x = Math.sin(t * 0.22 + 2) * 45
      grp2Ref.current.position.y = 12 + Math.sin(t * 0.5 + 1) * 3
      grp2Ref.current.position.z = -60 + Math.cos(t * 0.22 + 2) * 35
      grp2Ref.current.rotation.y = t * 0.4
    }
  })
  return (
    <>
      <group ref={grp1Ref}>
        <UFO pos={[0, 0, 0]} scale={4.5} />
        <pointLight color="#00ff88" intensity={6} distance={30} />
      </group>
      <group ref={grp2Ref}>
        <UFO pos={[0, 0, 0]} scale={2.8} />
        <pointLight color="#ff4400" intensity={4} distance={20} />
      </group>
    </>
  )
}

// ─── Meteor shower ────────────────────────────────────────────────
function MeteorShower() {
  const COUNT = 8
  const refs = useRef<(THREE.Group | null)[]>([])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    startX: -80 + (i / COUNT) * 160,
    startY: 60 + Math.random() * 30,
    startZ: 20 + Math.random() * 40,
    speed: 25 + Math.random() * 20,
    phase: (i / COUNT) * 8,
    dx: 0.3 + Math.random() * 0.4,
    dz: -(0.8 + Math.random() * 0.4),
  })), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    refs.current.forEach((grp, i) => {
      if (!grp) return
      const d = data[i]!
      const t = (clock.elapsedTime + d.phase) % 12
      const progress = t / 12
      grp.position.x = d.startX + progress * d.dx * 160
      grp.position.y = d.startY - progress * d.speed * 3
      grp.position.z = d.startZ + progress * d.dz * 180
      grp.visible = progress < 0.6
      grp.rotation.x += step * 1.2
      grp.rotation.z += step * 0.8
    })
  })

  return (
    <>
      {data.map((_, i) => (
        <group key={i} ref={el => { refs.current[i] = el }}>
          <Meteor pos={[0, 0, 0]} scale={1.8} />
          {/* Fire trail */}
          <pointLight color="#ff6600" intensity={5} distance={12} />
        </group>
      ))}
    </>
  )
}

// ─── Station Activity ─────────────────────────────────────────────
// Drone anchor positions keyed to station platform centres
const DRONE_ANCHORS: Array<[number, number, number]> = [
  [0,   2,    0],    // Spawn dock
  [0,   2,  -52],    // Alpha module
  [50,  2,  -52],    // East wing
  [0,   9,  -84],    // Beta module
  [-48, 9,  -84],    // West wing
  [0,  16, -128],    // Command bridge
]

// Per-drone constants (orbit radius, speed, phase offset, y-bob phase)
const DRONE_PARAMS = DRONE_ANCHORS.map((_, i) => ({
  r:     2 + (i % 3) * 0.7,
  speed: 0.4 + i * 0.07,
  phase: (i / DRONE_ANCHORS.length) * Math.PI * 2,
  bobPh: (i * 1.3) % (Math.PI * 2),
}))

// Data-stream pillar positions (4 corners of the main platform area)
const STREAM_POSITIONS: Array<[number, number, number]> = [
  [ 10, 0,   10],
  [-10, 0,   10],
  [ 10, 0,  -10],
  [-10, 0,  -10],
]
const STREAM_COUNT    = 12   // particles per pillar
const STREAM_HEIGHT   = 8    // y range each particle cycles through

// Warning beacon positions at entry / transition points (3 of 5 kept)
const ACTIVITY_BEACON_POSITIONS: Array<[number, number, number]> = [
  [ 0,  1,  -22],   // bridge STA-00 → STA-01 entry
  [-14, 8,  -84],   // Beta module west entry
  [13, 15, -128],   // Command bridge east rail
]

function StationActivity() {
  // ── Patrol drones ──────────────────────────────────────────────
  const droneRefs = useRef<(THREE.Group | null)[]>([])

  // ── Data stream particles ──────────────────────────────────────
  // Flat 1-D array: pillar i, particle j  →  index i * STREAM_COUNT + j
  const streamRefs = useRef<(THREE.Mesh | null)[]>([])
  const streamOffsets = useMemo(
    () =>
      Array.from({ length: STREAM_POSITIONS.length * STREAM_COUNT }, (_, k) => {
        // stagger initial y offsets evenly within each pillar
        const j = k % STREAM_COUNT
        return (j / STREAM_COUNT) * STREAM_HEIGHT
      }),
    [],
  )

  // ── Warning beacons ────────────────────────────────────────────
  const beaconMeshRefs  = useRef<(THREE.Mesh | null)[]>([])
  const beaconLightRefs = useRef<(THREE.PointLight | null)[]>([])
  const beaconPhases    = useMemo(
    () => ACTIVITY_BEACON_POSITIONS.map((_, i) => (i / ACTIVITY_BEACON_POSITIONS.length) * Math.PI * 2),
    [],
  )

  const frameSkip = useRef(0)
  useFrame(({ clock }, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    const t = clock.getElapsedTime()

    // Patrol drones
    DRONE_ANCHORS.forEach((anchor, i) => {
      const grp = droneRefs.current[i]
      if (!grp) return
      const p = DRONE_PARAMS[i]!
      const angle = t * p.speed + p.phase
      grp.position.set(
        anchor[0] + Math.cos(angle) * p.r,
        anchor[1] + Math.sin(t * 1.8 + p.bobPh) * 0.3,
        anchor[2] + Math.sin(angle) * p.r,
      )
      grp.rotation.y = -angle   // face direction of travel
    })

    // Data stream particles
    STREAM_POSITIONS.forEach((base, pi) => {
      for (let j = 0; j < STREAM_COUNT; j++) {
        const idx  = pi * STREAM_COUNT + j
        const mesh = streamRefs.current[idx]
        if (!mesh) continue
        // Advance y offset, wrap back to 0 when it exceeds STREAM_HEIGHT
        streamOffsets[idx] = (streamOffsets[idx]! + step * 3.5) % STREAM_HEIGHT
        mesh.position.set(base[0], base[1] + streamOffsets[idx]!, base[2])
        // Fade opacity: bright near top, dim near bottom
        const frac = streamOffsets[idx]! / STREAM_HEIGHT
        ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.2 + frac * 0.8
      }
    })

    // Warning beacons pulse
    ACTIVITY_BEACON_POSITIONS.forEach((_, i) => {
      const bm = beaconMeshRefs.current[i]
      const bl = beaconLightRefs.current[i]
      const intensity = 0.5 + (Math.sin(t * 3 + beaconPhases[i]!) * 0.5 + 0.5) * 2.5  // 0.5 → 3
      if (bm) (bm.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity
      if (bl) bl.intensity = intensity * 0.8
    })
  })

  return (
    <>
      {/* ── Patrol drones ── */}
      {DRONE_ANCHORS.map((_, i) => (
        <group key={`drone-${i}`} ref={(el) => { droneRefs.current[i] = el }}>
          {/* Main body */}
          <mesh>
            <boxGeometry args={[0.4, 0.2, 0.6]} />
            <meshStandardMaterial color="#333344" roughness={0.4} metalness={0.9} />
          </mesh>
          {/* Left wing */}
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.15]} />
            <meshStandardMaterial color={NEON_CYAN} emissive={NEON_CYAN} emissiveIntensity={1.2} roughness={0.2} />
          </mesh>
          {/* Right wing */}
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.15]} />
            <meshStandardMaterial color={NEON_CYAN} emissive={NEON_CYAN} emissiveIntensity={1.2} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ── Data stream pillars ── */}
      {STREAM_POSITIONS.map((base, pi) =>
        Array.from({ length: STREAM_COUNT }, (_, j) => {
          const idx = pi * STREAM_COUNT + j
          const initY = (j / STREAM_COUNT) * STREAM_HEIGHT
          return (
            <mesh
              key={`stream-${pi}-${j}`}
              ref={(el) => { streamRefs.current[idx] = el }}
              position={[base[0], base[1] + initY, base[2]]}
            >
              <sphereGeometry args={[0.08, 5, 5]} />
              <meshBasicMaterial
                color="#48e0ff"
                toneMapped={false}
                transparent
                opacity={0.5}
              />
            </mesh>
          )
        }),
      )}

      {/* ── Warning beacons ── */}
      {ACTIVITY_BEACON_POSITIONS.map((pos, i) => (
        <group key={`act-beacon-${i}`} position={pos}>
          <mesh ref={(el) => { beaconMeshRefs.current[i] = el }}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ffaa00"
              emissive="#ffaa00"
              emissiveIntensity={1.5}
            />
          </mesh>
          <pointLight
            ref={(el) => { beaconLightRefs.current[i] = el }}
            color="#ffaa00"
            intensity={2}
            distance={8}
          />
        </group>
      ))}
    </>
  )
}

// ─── Gas Giant planet in the far background ───────────────────────
function GasGiant() {
  return (
    <group position={[280, -40, -350]}>
      {/* Planet sun — warm distant light */}
      <pointLight color="#fff4cc" intensity={1.5} distance={1200} position={[-400, 300, 200]} />

      {/* Main planet sphere */}
      <mesh>
        <sphereGeometry args={[120, 64, 32]} />
        <meshStandardMaterial
          color="#e8a030"
          emissive="#663300"
          emissiveIntensity={0.3}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Atmospheric band rings — equatorial tori */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[128, 0.5, 6, 128]} />
        <meshStandardMaterial color="#d49020" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[136, 0.5, 6, 128]} />
        <meshStandardMaterial color="#f0b040" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[144, 0.5, 6, 128]} />
        <meshStandardMaterial color="#c08010" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[150, 0.5, 6, 128]} />
        <meshStandardMaterial color="#d49020" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[156, 0.5, 6, 128]} />
        <meshStandardMaterial color="#f0b040" roughness={0.9} />
      </mesh>

      {/* Ring system — 3 flat torus rings tilted */}
      <mesh rotation={[Math.PI / 2, 0.15, 0]}>
        <torusGeometry args={[140, 1.5, 4, 256]} />
        <meshStandardMaterial color="#c0a060" transparent opacity={0.7} roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.15, 0]}>
        <torusGeometry args={[155, 1.5, 4, 256]} />
        <meshStandardMaterial color="#c0a060" transparent opacity={0.7} roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.15, 0]}>
        <torusGeometry args={[175, 1.5, 4, 256]} />
        <meshStandardMaterial color="#c0a060" transparent opacity={0.7} roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── StarField2 — additional deep star layer (instanced, 200 stars) ─
const STARFIELD2_COUNT = 200

function StarField2() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  const starData = useMemo(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: STARFIELD2_COUNT }, (_, i) => {
      // Scatter at distance 300–600 in all directions
      const theta = seed(i * 19.1) * Math.PI * 2
      const phi   = Math.acos(2 * seed(i * 19.2) - 1)
      const r     = 300 + seed(i * 19.3) * 300
      return {
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ),
        opacity: 0.4 + seed(i * 19.4) * 0.5,
      }
    })
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const mat = new THREE.Matrix4()
    const quat = new THREE.Quaternion()
    const scl  = new THREE.Vector3(1, 1, 1)
    starData.forEach((s, i) => {
      mat.compose(s.pos, quat, scl)
      meshRef.current.setMatrixAt(i, mat)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [starData])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STARFIELD2_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.6, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
    </instancedMesh>
  )
}

// ─── SolarFlare — animated energy flare from a distant star ──────
const FLARE_COUNT = 5

function SolarFlare() {
  const flareRefs = useRef<(THREE.Mesh | null)[]>([])

  const flareData = useMemo(() => {
    return Array.from({ length: FLARE_COUNT }, (_, i) => {
      const angle = (i / FLARE_COUNT) * Math.PI * 2
      return {
        rotX: Math.cos(angle) * (Math.PI / 2),
        rotZ: Math.sin(angle) * (Math.PI / 2),
        phase: (i / FLARE_COUNT) * Math.PI * 2,
      }
    })
  }, [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    flareData.forEach((fd, i) => {
      const mesh = flareRefs.current[i]
      if (!mesh) return
      const pulse = 0.8 + Math.sin(t * 2.2 + fd.phase) * 0.4
      mesh.scale.setScalar(pulse)
    })
  })

  return (
    <group position={[500, 100, -200]}>
      {/* Bright distant point light simulating the star */}
      <pointLight color="#ff9900" intensity={2} distance={1000} />

      {flareData.map((fd, i) => (
        <mesh
          key={i}
          ref={(el) => { flareRefs.current[i] = el }}
          rotation={[fd.rotX, 0, fd.rotZ]}
        >
          <coneGeometry args={[6, 80, 8, 1, true]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff8800"
            emissiveIntensity={3}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── FloatingEquipment — 15 zero-gravity items inside the station ──
interface EquipmentItem {
  pos: [number, number, number]
  rx: number
  ry: number
  rz: number
  dx: number
  dy: number
  dz: number
  type: 'toolbox' | 'tank' | 'datapad' | 'pouch'
  color: string
}

function FloatingEquipment() {
  const items = useMemo<EquipmentItem[]>(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    const COLORS = ['#aaaaaa', '#ffffff', '#ff6633']
    const TYPES: EquipmentItem['type'][] = ['toolbox', 'tank', 'datapad', 'pouch']
    return Array.from({ length: 15 }, (_, i) => ({
      pos: [
        (seed(i * 11.1) - 0.5) * 30,
        3 + seed(i * 11.2) * 10,
        -10 - seed(i * 11.3) * 110,
      ] as [number, number, number],
      rx: (seed(i * 11.4) - 0.5) * 2 + 0.5,
      ry: (seed(i * 11.5) - 0.5) * 2 + 0.5,
      rz: (seed(i * 11.6) - 0.5) * 2 + 0.5,
      dx: (seed(i * 11.7) - 0.5) * 2,
      dy: (seed(i * 11.8) - 0.5) * 2,
      dz: (seed(i * 11.9) - 0.5) * 2,
      type: TYPES[i % TYPES.length]!,
      color: COLORS[i % COLORS.length]!,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    items.forEach((item, i) => {
      const m = meshRefs.current[i]
      if (!m) return
      m.rotation.x += 0.003 * item.rx
      m.rotation.y += 0.004 * item.ry
      m.rotation.z += 0.002 * item.rz
      m.position.x += item.dx * 0.002
      m.position.y += item.dy * 0.002
      m.position.z += item.dz * 0.002
      if (m.position.x > 15) item.dx = -Math.abs(item.dx)
      if (m.position.x < -15) item.dx = Math.abs(item.dx)
      if (m.position.y > 20) item.dy = -Math.abs(item.dy)
      if (m.position.y < 2) item.dy = Math.abs(item.dy)
      if (m.position.z > 0) item.dz = -Math.abs(item.dz)
      if (m.position.z < -130) item.dz = Math.abs(item.dz)
    })
  })

  return (
    <>
      {items.map((item, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={item.pos}
        >
          {item.type === 'toolbox' && <boxGeometry args={[0.8, 0.5, 0.4]} />}
          {item.type === 'tank' && <cylinderGeometry args={[0.25, 0.25, 0.8, 10]} />}
          {item.type === 'datapad' && <boxGeometry args={[0.5, 0.7, 0.05]} />}
          {item.type === 'pouch' && <boxGeometry args={[0.3, 0.4, 0.2]} />}
          <meshStandardMaterial color={item.color} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </>
  )
}

// ─── AstronautFigure — EVA spacewalk outside the station ──────────
function AstronautFigure() {
  const grpRef = useRef<THREE.Group>(null!)
  const angle = useRef(0)

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    angle.current += step * 0.05
    if (grpRef.current) {
      const a = angle.current
      grpRef.current.position.set(
        Math.cos(a) * 20,
        5,
        -65 + Math.sin(a) * 20,
      )
      grpRef.current.rotation.y = -a + Math.PI / 2
    }
  })

  return (
    <group ref={grpRef} position={[20, 5, -65]}>
      {/* Helmet */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[1.2, 14, 14]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 2.2, 1.05]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.7, 20]} />
        <meshStandardMaterial
          color="#4488ff"
          emissive="#2266aa"
          emissiveIntensity={0.6}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 1.8, 0.9]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Backpack (life support) */}
      <mesh position={[0, 0.4, -0.65]}>
        <boxGeometry args={[1.0, 1.2, 0.4]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.9, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.9, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.35, -1.0, 0]}>
        <cylinderGeometry args={[0.28, 0.25, 1.1, 8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.35, -1.0, 0]}>
        <cylinderGeometry args={[0.28, 0.25, 1.1, 8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Tether connecting astronaut to station */}
      <mesh position={[0, 0.3, -4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 8, 5]} />
        <meshStandardMaterial color="#ffdd88" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── StarTracker — rotating telescope/antenna array ───────────────
function StarTracker() {
  const grpRef = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (grpRef.current) grpRef.current.rotation.y += 0.001
  })

  // Strut offsets at 90° intervals
  const struts: Array<{ x: number; z: number; ry: number }> = [
    { x:  1.2, z:  0,   ry: 0            },
    { x: -1.2, z:  0,   ry: Math.PI      },
    { x:  0,   z:  1.2, ry: Math.PI / 2  },
    { x:  0,   z: -1.2, ry: -Math.PI / 2 },
  ]

  return (
    <group ref={grpRef} position={[0, 20, -128]}>
      {/* Main dish — open cone pointing up */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[3, 1.5, 20, 1, true]} />
        <meshStandardMaterial
          color="#334455"
          emissive="#2244aa"
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      {/* Dish rim ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.08, 8, 48]} />
        <meshStandardMaterial
          color="#4466cc"
          emissive="#4466cc"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Focal point receiver */}
      <mesh position={[0, -0.8, 0]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial
          color="#88aaff"
          emissive="#4466ff"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Support struts */}
      {struts.map((s, i) => (
        <mesh
          key={i}
          position={[s.x * 0.5, -0.4, s.z * 0.5]}
          rotation={[Math.atan2(0.8, 1.2), s.ry, 0]}
        >
          <cylinderGeometry args={[0.04, 0.04, 1.5, 5]} />
          <meshStandardMaterial color="#556677" roughness={0.5} metalness={0.8} />
        </mesh>
      ))}
      {/* Mount column */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
        <meshStandardMaterial color={METAL} roughness={0.5} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ─── DockingShuttle ──────────────────────────────────────────────
// A NASA-style space shuttle docked to the east side of the station hull,
// placed at x≈+30, y≈7, z≈-84 (adjacent to Module Beta).
function DockingShuttle() {
  // All meshes are local to the group; shuttle nose points in +z direction.
  return (
    <group position={[32, 8.5, -84]} rotation={[0, Math.PI / 2, 0]}>
      {/* ── Main fuselage ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2.5, 12]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Nose cone ── */}
      <mesh position={[0, 0, 8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.5, 4, 16]} />
        <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Left wing (swept back -30°) ── */}
      <mesh position={[-5.5, -0.8, -1]} rotation={[0, (-30 * Math.PI) / 180, 0]} castShadow>
        <boxGeometry args={[8, 0.4, 5]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Right wing (swept back +30°) ── */}
      <mesh position={[5.5, -0.8, -1]} rotation={[0, (30 * Math.PI) / 180, 0]} castShadow>
        <boxGeometry args={[8, 0.4, 5]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Tail fin ── */}
      <mesh position={[0, 2.2, -5]} castShadow>
        <boxGeometry args={[0.3, 3, 2]} />
        <meshStandardMaterial color="#cccccc" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Engine nozzles (3 at rear z- end) ── */}
      <mesh position={[-1.0, -0.5, -6.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 12]} />
        <meshStandardMaterial color="#555566" roughness={0.5} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.5, -6.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 12]} />
        <meshStandardMaterial color="#555566" roughness={0.5} metalness={0.9} />
      </mesh>
      <mesh position={[1.0, -0.5, -6.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 12]} />
        <meshStandardMaterial color="#555566" roughness={0.5} metalness={0.9} />
      </mesh>

      {/* ── Cockpit windows (2 flat boxes, emissive blue) ── */}
      <mesh position={[-0.55, 0.9, 8.3]}>
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={2} roughness={0.2} />
      </mesh>
      <mesh position={[0.55, 0.9, 8.3]}>
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={2} roughness={0.2} />
      </mesh>

      {/* ── US flag decal — red stripe, white stripe, blue field ── */}
      <mesh position={[-1.52, 0.6, 3]}>
        <boxGeometry args={[0.04, 0.5, 0.9]} />
        <meshStandardMaterial color="#bb2233" roughness={0.6} />
      </mesh>
      <mesh position={[-1.52, 0.6, 3.95]}>
        <boxGeometry args={[0.04, 0.5, 0.9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[-1.52, 0.6, 4.45]}>
        <boxGeometry args={[0.04, 0.5, 0.45]} />
        <meshStandardMaterial color="#002868" roughness={0.6} />
      </mesh>

      {/* ── Docking port (cylinder connecting shuttle to station) ── */}
      <mesh position={[1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.5, 16]} />
        <meshStandardMaterial color="#888899" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* ── Cargo bay doors (open — hinged upward at top of fuselage) ── */}
      {/* Left door — rotated open ~70° around z-axis hinge */}
      <mesh position={[-1.5, 2.0, 0.5]} rotation={[0, 0, (-70 * Math.PI) / 180]}>
        <boxGeometry args={[2.5, 0.3, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Right door */}
      <mesh position={[1.5, 2.0, 0.5]} rotation={[0, 0, (70 * Math.PI) / 180]}>
        <boxGeometry args={[2.5, 0.3, 5]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* ── Satellite in open cargo bay ── */}
      <group position={[0, 1.8, 0.5]}>
        {/* Satellite body */}
        <mesh>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#ccccaa" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Solar panel wings */}
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial
            color="#ddcc44"
            emissive="#ddcc44"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial
            color="#ddcc44"
            emissive="#ddcc44"
            emissiveIntensity={0.6}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      </group>
    </group>
  )
}

// ─── DockingArmRMS ────────────────────────────────────────────────
// Remote Manipulator System (Canadarm-style) extending from the station
// near the shuttle docking port. Arm segments sweep gently over time.
function DockingArmRMS() {
  const shoulderRef = useRef<THREE.Group>(null!)
  const elbowRef    = useRef<THREE.Group>(null!)
  const wristRef    = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    // Shoulder: gentle yaw sweep ±15°
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = Math.sin(t * 0.3) * (15 * Math.PI / 180)
    }
    // Elbow: gentle pitch ±10°
    if (elbowRef.current) {
      elbowRef.current.rotation.x = Math.sin(t * 0.45 + 1.2) * (10 * Math.PI / 180)
    }
    // Wrist: slow roll ±8°
    if (wristRef.current) {
      wristRef.current.rotation.z = Math.sin(t * 0.6 + 0.8) * (8 * Math.PI / 180)
    }
  })

  return (
    // Base mount on the station hull between Beta and the shuttle
    <group position={[12, 9, -84]}>
      {/* Attachment base plate */}
      <mesh>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <meshStandardMaterial color="#888899" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Shoulder segment */}
      <group ref={shoulderRef} position={[0, 0.2, 0]}>
        {/* Shoulder joint sphere */}
        <mesh>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Shoulder cylinder */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 3, 10]} />
          <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Elbow joint */}
        <group ref={elbowRef} position={[0, 3, 0]}>
          <mesh>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Forearm cylinder */}
          <mesh position={[0, 1.75, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 3.5, 10]} />
            <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Wrist assembly */}
          <group ref={wristRef} position={[0, 3.5, 0]}>
            {/* Wrist sphere */}
            <mesh>
              <sphereGeometry args={[0.35, 10, 10]} />
              <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Wrist cylinder */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.5, 10]} />
              <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* End effector box */}
            <mesh position={[0, 0.85, 0]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Claw detail 1 */}
            <mesh position={[-0.35, 1.25, 0]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial color="#888899" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Claw detail 2 */}
            <mesh position={[0.35, 1.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial color="#888899" roughness={0.3} metalness={0.9} />
            </mesh>
            {/* Claw detail 3 */}
            <mesh position={[0, 1.25, 0.35]} rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial color="#888899" roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

// ─── LaunchExhaust ────────────────────────────────────────────────
// Subtle thruster firing effect at the shuttle's three engine nozzles.
// Three cones pulse in scale, plus a pale blue point light.
function LaunchExhaust() {
  const coneRefs = useRef<THREE.Mesh[]>([])

  // Nozzle positions in shuttle-local space, mirrored into world coords.
  // Shuttle group: position [32, 8.5, -84], rotation.y = PI/2
  // In shuttle local: engines at x=(-1,0,+1), y=-0.5, z=-6.4
  // After rotation.y=PI/2: world x = localZ, world z = -localX
  // base world: x=32, y=8, z=-84
  // Nozzle 0 local x=-1,z=-6.4 → world x=32+(-6.4)=25.6, z=-84-(-1)=-83
  // Nozzle 1 local x=0 ,z=-6.4 → world x=32+(-6.4)=25.6, z=-84
  // Nozzle 2 local x=+1,z=-6.4 → world x=32+(-6.4)=25.6, z=-84-1=-85
  const EXHAUST_POSITIONS: Array<[number, number, number]> = [
    [25.6, 8.0, -83.0],
    [25.6, 8.0, -84.0],
    [25.6, 8.0, -85.0],
  ]

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    coneRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const s = 1 + Math.sin(t * 6 + i * 0.8) * 0.2
      mesh.scale.setScalar(s)
    })
  })

  return (
    <>
      {EXHAUST_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) coneRefs.current[i] = el }}
          position={pos}
          rotation={[0, 0, -Math.PI / 2]}
        >
          {/* Cone pointing away from shuttle */}
          <coneGeometry args={[0.4, 1.5, 10]} />
          <meshStandardMaterial
            color="#4499ff"
            emissive="#4499ff"
            emissiveIntensity={3}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* Pale blue point light at engine cluster */}
      <pointLight
        position={[25.6, 8.0, -84.0]}
        color="#88bbff"
        intensity={3}
        distance={14}
      />
    </>
  )
}

// ─── AlienScoutShip ───────────────────────────────────────────────
// Otherworldly alien vessel that approaches the station and then orbits.
function AlienScoutShip() {
  const grpRef = useRef<THREE.Group>(null!)
  // Track approach phase with a mutable ref to avoid stale closure
  const stateRef = useRef({ approaching: true, orbitAngle: 0 })

  // 6 hull fins radiating outward at 60° intervals
  const FIN_ANGLES = useMemo(
    () => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2),
    [],
  )
  // 8 alien glyph positions on hull surface (alternating quadrants)
  const GLYPH_POSITIONS = useMemo<Array<[number, number, number]>>(
    () => [
      [ 2.5,  0.35,  0.0  ],
      [-2.5,  0.35,  0.0  ],
      [ 0.0,  0.35,  2.5  ],
      [ 0.0,  0.35, -2.5  ],
      [ 1.8,  0.35,  1.8  ],
      [-1.8,  0.35,  1.8  ],
      [ 1.8,  0.35, -1.8  ],
      [-1.8,  0.35, -1.8  ],
    ],
    [],
  )
  // 3 engine nodes in triangle formation
  const ENGINE_POSITIONS = useMemo<Array<[number, number, number]>>(
    () => [
      [ 0.0, -0.45,  1.5 ],
      [ 1.3, -0.45, -0.75],
      [-1.3, -0.45, -0.75],
    ],
    [],
  )

  const glyphRefs  = useRef<(THREE.Mesh | null)[]>([])
  const engineRefs = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(({ clock }, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    const t = clock.getElapsedTime()
    const s = stateRef.current
    const grp = grpRef.current
    if (!grp) return

    if (s.approaching) {
      // Start position: x=200, y=30, z=0; move toward station center (0,15,−70)
      const targetX = 0
      const targetY = 15
      const targetZ = -70
      const speed   = 8 * step
      const dx = targetX - grp.position.x
      const dy = targetY - grp.position.y
      const dz = targetZ - grp.position.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist > 60) {
        grp.position.x += (dx / dist) * speed
        grp.position.y += (dy / dist) * speed
        grp.position.z += (dz / dist) * speed
      } else {
        // Reached hover distance — switch to orbit
        s.approaching = false
        s.orbitAngle = Math.atan2(grp.position.x, grp.position.z)
      }
    } else {
      // Orbit at r=80 around (0,15,−70) at y=15+sin oscillation
      s.orbitAngle += 0.006 * step
      const orbitR = 80
      const cx = 0; const cy = 15; const cz = -70
      grp.position.x = cx + Math.sin(s.orbitAngle) * orbitR
      grp.position.y = cy + Math.sin(t * 0.4) * 4
      grp.position.z = cz + Math.cos(s.orbitAngle) * orbitR
      // Face direction of travel
      grp.rotation.y = s.orbitAngle + Math.PI / 2
    }

    // Pulse alien glyphs
    const glyphIntensity = 2 + Math.sin(t * 3) * 1
    glyphRefs.current.forEach((m) => {
      if (m) (m.material as THREE.MeshStandardMaterial).emissiveIntensity = glyphIntensity
    })

    // Pulse engines
    const engIntensity = 4 + Math.sin(t * 8) * 1.5
    engineRefs.current.forEach((m, i) => {
      if (m) (m.material as THREE.MeshStandardMaterial).emissiveIntensity = engIntensity + i * 0.5
    })
  })

  return (
    <group ref={grpRef} position={[200, 30, 0]}>
      {/* ── Main hull — flattened sphere ── */}
      <mesh scale={[3.5, 0.6, 3.5]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#2a1a3a" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* ── 6 flat fins radiating outward ── */}
      {FIN_ANGLES.map((angle, i) => (
        <mesh
          key={`fin-${i}`}
          position={[Math.sin(angle) * 2.0, 0, Math.cos(angle) * 2.0]}
          rotation={[0, -angle, 0]}
        >
          <boxGeometry args={[0.3, 0.1, 2.5]} />
          <meshStandardMaterial color="#1a0d2a" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* ── Cockpit dome ── */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0033ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>

      {/* ── Alien writing — 8 glyph boxes on hull surface ── */}
      {GLYPH_POSITIONS.map((pos, i) => (
        <mesh
          key={`glyph-${i}`}
          ref={(el) => { glyphRefs.current[i] = el }}
          position={pos}
          rotation={[0, (i / 8) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.5, 0.04, 0.15]} />
          <meshStandardMaterial
            color="#00ffaa"
            emissive="#00ffaa"
            emissiveIntensity={3}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* ── Engine nodes (3 in triangle) + glow cones ── */}
      {ENGINE_POSITIONS.map((pos, i) => (
        <group key={`engine-${i}`} position={pos}>
          {/* Engine sphere */}
          <mesh ref={(el) => { engineRefs.current[i] = el }}>
            <sphereGeometry args={[0.5, 10, 8]} />
            <meshStandardMaterial
              color="#aa00ff"
              emissive="#aa00ff"
              emissiveIntensity={5}
              roughness={0.2}
            />
          </mesh>
          {/* Engine glow cone — pointing backward */}
          <mesh position={[0, 0, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.4, 2.4, 8, 1, true]} />
            <meshStandardMaterial
              color="#7700cc"
              emissive="#7700cc"
              emissiveIntensity={3}
              transparent
              opacity={0.5}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* ── Tractor beam — thin cone pointing toward station center ── */}
      <mesh position={[0, -0.3, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 12, 12, 1, true]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={2}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Alien color point light ── */}
      <pointLight color="#9933ff" intensity={8} distance={40} />
    </group>
  )
}

// ─── AlienSignalBeacons ───────────────────────────────────────────
// 4 alien signal buoys marking territory in a loose formation.
function AlienSignalBeacons() {
  const BEACON_POSITIONS: Array<[number, number, number]> = [
    [ 90,  5, -40],
    [-85,  3, -55],
    [ 70,  8, -110],
    [-75,  6, -100],
  ]
  const RING_TILTS: Array<[number, number, number]> = [
    [Math.PI / 2, 0,              0             ],
    [0,           Math.PI / 4,    0             ],
    [Math.PI / 3, 0,              Math.PI / 4   ],
    [0,           0,              Math.PI / 2   ],
  ]

  const sphereRefs = useRef<(THREE.Mesh | null)[]>([])
  const beamRefs   = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    BEACON_POSITIONS.forEach((_, i) => {
      const intensity = 1.5 + Math.sin(t * 2 + i * 1.3) * 1.0
      const sphere = sphereRefs.current[i]
      const beam   = beamRefs.current[i]
      if (sphere) (sphere.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity
      if (beam)   (beam.material   as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 0.8
    })
  })

  return (
    <>
      {BEACON_POSITIONS.map((pos, i) => (
        <group key={`alien-beacon-${i}`} position={pos}>
          {/* Main buoy sphere */}
          <mesh ref={(el) => { sphereRefs.current[i] = el }}>
            <sphereGeometry args={[0.8, 12, 10]} />
            <meshStandardMaterial
              color="#1a0a2a"
              emissive="#00ffaa"
              emissiveIntensity={1.5}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>

          {/* Ring around buoy */}
          <mesh rotation={RING_TILTS[i]}>
            <torusGeometry args={[1.2, 0.1, 8, 32]} />
            <meshStandardMaterial
              color="#00ffaa"
              emissive="#00ffaa"
              emissiveIntensity={2}
              roughness={0.2}
            />
          </mesh>

          {/* Second ring at different angle */}
          <mesh rotation={[RING_TILTS[i]![0] + Math.PI / 3, RING_TILTS[i]![1], Math.PI / 2]}>
            <torusGeometry args={[1.4, 0.06, 6, 32]} />
            <meshStandardMaterial
              color="#00aa77"
              emissive="#00aa77"
              emissiveIntensity={1.5}
              roughness={0.3}
            />
          </mesh>

          {/* Vertical signal beam */}
          <mesh
            ref={(el) => { beamRefs.current[i] = el }}
            position={[0, 10, 0]}
          >
            <cylinderGeometry args={[0.05, 0.05, 20, 6]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={1.5}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </mesh>

          {/* Buoy glow light */}
          <pointLight color="#00ffaa" intensity={3} distance={15} />
        </group>
      ))}
    </>
  )
}

// ─── OuterAsteroidBelt ────────────────────────────────────────────
// 30 asteroids in a wide ring (r: 150-200) orbiting slowly.
const OUTER_ASTEROID_COUNT = 30

interface OuterAsteroidData {
  angle:      number
  ringRadius: number
  y:          number
  scale:      number
  orbitSpeed: number
  rx:         number
  ry:         number
  rz:         number
  selfRotSpeed: number
}

function OuterAsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  const asteroids = useMemo<OuterAsteroidData[]>(() => {
    const seed = (n: number) => ((Math.sin(n) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: OUTER_ASTEROID_COUNT }, (_, i) => ({
      angle:        seed(i * 13.1) * Math.PI * 2,
      ringRadius:   150 + seed(i * 13.2) * 50,          // 150-200
      y:            -10 + seed(i * 13.3) * 20,           // -10 to +10
      scale:        0.5 + seed(i * 13.4) * 2.5,          // 0.5-3.0
      orbitSpeed:   0.003 + seed(i * 13.5) * 0.007,      // slower than inner belt
      rx:           0,
      ry:           0,
      rz:           0,
      selfRotSpeed: 0.1 + seed(i * 13.6) * 0.4,
    }))
  }, [])

  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    if (!meshRef.current) return
    for (let i = 0; i < OUTER_ASTEROID_COUNT; i++) {
      const a = asteroids[i]!
      a.angle += a.orbitSpeed * step
      a.rx    += a.selfRotSpeed * step
      a.ry    += a.selfRotSpeed * step * 0.7
      a.rz    += a.selfRotSpeed * step * 0.5
      dummy.position.set(
        Math.cos(a.angle) * a.ringRadius,
        a.y,
        Math.sin(a.angle) * a.ringRadius,
      )
      dummy.scale.setScalar(a.scale)
      dummy.rotation.set(a.rx, a.ry, a.rz)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, OUTER_ASTEROID_COUNT]} frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#554433" roughness={0.9} metalness={0.1} />
    </instancedMesh>
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
      {/* Extended deep-z star layer */}
      <DeepStars />
      {/* Additional instanced star layer at 300-600 distance */}
      <StarField2 />
      {/* Gas Giant planet far in the background */}
      <GasGiant />
      {/* Solar flare energy effect from a distant star */}
      <SolarFlare />
      {/* Cosmic nebula backdrop planes */}
      <NebulaBackdrop />
      <VoidFloor />

      {/* Asteroid belt orbiting the station */}
      <AsteroidBelt />
      {/* Nebula glow volumes at extreme distances */}
      <NebulaGlow />

      {/* Station warning lights — blinking red/orange */}
      <StationWarningLights />

      {/* ── Alien UFO encounter — two orbiting saucers ── */}
      <UFOEncounter />

      {/* ── Dynamic meteor shower ── */}
      <MeteorShower />

      {/* ── Station crew/base ambient activity ── */}
      <StationActivity />

      {/* ── Zero-gravity floating equipment inside station ── */}
      <FloatingEquipment />

      {/* ── Astronaut doing EVA spacewalk around station ── */}
      <AstronautFigure />

      {/* ── Rotating star tracker / antenna array on station exterior ── */}
      <StarTracker />

      {/* ── Space shuttle docked to east hull near Module Beta ── */}
      <DockingShuttle />

      {/* ── Remote Manipulator Arm extending from station hull ── */}
      <DockingArmRMS />

      {/* ── Thruster exhaust plumes from shuttle engines ── */}
      <LaunchExhaust />

      {/* ── Alien scout ship approaching the station ── */}
      <AlienScoutShip />

      {/* ── Alien signal beacons marking territory ── */}
      <AlienSignalBeacons />

      {/* ── Outer asteroid belt (r: 150-200) ── */}
      <OuterAsteroidBelt />

      {/* ── Static asteroid field ── */}
      <Meteor pos={[-70, 25, -80]} scale={3.5} rotY={0.5} />
      <Meteor pos={[80, 18, -110]} scale={2.8} rotY={1.2} />
      <Meteor pos={[-55, 35, -150]} scale={4.0} rotY={2.1} />
      <Meteor pos={[65, 30, -60]} scale={2.5} rotY={0.8} />
      <Meteor pos={[-90, 22, -130]} scale={3.2} rotY={1.7} />
      <Meteor pos={[40, 40, -140]} scale={2.2} rotY={3.0} />

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

      {/* ── Solar panels attached to station hull ── */}
      <SolarPanels />

      {/* ── Space debris field (original 15 hand-placed pieces) ── */}
      <SpaceDebris />
      {/* ── Dense instanced debris field (40 deep-z tumbling boxes) ── */}
      <DebrisField />

      {/* ── Thruster glow rings at station aft ── */}
      <ThrusterGlowRings />

      {/* ── Wormhole goal marker ── */}
      <Wormhole />

      {/* ── Astronaut NPCs in EVA positions ── */}
      <GltfMonster which="alien"     pos={[-20, 10, -60]}  scale={1.2} animation="Wave" />
      <BossGolem pos={[20, 8.5, -90]} scale={1.1} rotY={-Math.PI * 0.5} />
      <GltfMonster which="cactoro"   pos={[0, 15, -120]}   scale={1.1} animation="Wave" />

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
      {/* Extended path toward wormhole */}
      <Coin pos={[0, 15.5, -145]} />
      <Coin pos={[-5, 15.5, -152]} />
      <Coin pos={[5, 15.5, -158]} />
      <Coin pos={[0, 15.5, -163]} />
      <Coin pos={[-4, 15.5, -169]} />
      <Coin pos={[4, 15.5, -174]} />
      <Coin pos={[0, 15.5, -178]} value={3} />
      <Coin pos={[0, 16, -182]} value={5} />

      {/* ── Docked Spaceships ── */}
      <Spaceship pos={[30, 8, -40]} scale={2.5} rotY={Math.PI * 0.3} />
      <Spaceship pos={[-28, 6, -80]} scale={3.0} rotY={-Math.PI * 0.5} />
      <Spaceship pos={[20, 12, -130]} scale={2.0} rotY={Math.PI} />
      <Spaceship pos={[-15, 10, -160]} scale={2.8} rotY={Math.PI * 0.7} />

      {/* ── Boss Dragon — alien guardian of the wormhole ── */}
      {/* Positioned on the final approach path toward the wormhole at z=-180 */}
      <BossDragon pos={[0, 15.5, -155]} scale={1.6} rotY={Math.PI} />

      {/* ── Cryo storage containers (IceBlock) — Alpha & Beta lab sections ── */}
      {/* Alpha module STA-01 — cryo specimens */}
      <IceBlock pos={[4, 0.6, -47]} scale={1.2} rotY={0.3} />
      <IceBlock pos={[-4, 0.6, -47]} scale={1.0} rotY={-0.5} />
      {/* Beta module STA-10 — cryo storage row */}
      <IceBlock pos={[-3, 7.6, -79]} scale={1.1} rotY={0.8} />
      <IceBlock pos={[3, 7.6, -79]} scale={1.3} rotY={-0.2} />

      {/* ── Crystal Clusters — alien mineral deposits in outer asteroid field ── */}
      {/* Scattered around perimeter platforms and outer docking areas */}
      <CrystalCluster pos={[38, 0.6, -30]} scale={1.4} rotY={0.5} />
      <CrystalCluster pos={[55, 0.6, -42]} scale={1.0} rotY={1.2} />
      <CrystalCluster pos={[58, 0.6, -62]} scale={1.2} rotY={-0.7} />
      <CrystalCluster pos={[-52, 7.6, -76]} scale={1.5} rotY={0.9} />
      <CrystalCluster pos={[-52, 7.6, -92]} scale={1.1} rotY={-1.1} />
      <CrystalCluster pos={[-22, 6.6, -168]} scale={1.3} rotY={0.3} />

      {/* ── ScifiCrate — cargo containers scattered across the station's cargo bay / hangar ── */}
      {/* Spawn Dock STA-00 — entry hangar crates */}
      <ScifiCrate pos={[-9, 0.5, 4]} scale={1.1} rotY={0.3} />
      <ScifiCrate pos={[9, 0.5, 4]} scale={1.0} rotY={-0.5} />
      {/* Alpha module STA-01 — additional cargo stacks */}
      <ScifiCrate pos={[4, 0.5, -58]} scale={1.2} rotY={0.8} />
      <ScifiCrate pos={[-4, 0.5, -58]} scale={1.0} rotY={-0.2} />
      <ScifiCrate pos={[0, 0.5, -46]} scale={0.9} rotY={1.5} />
      {/* East wing hangar — crates near docked ship */}
      <ScifiCrate pos={[44, 0.5, -52]} scale={1.3} rotY={0.1} />
      <ScifiCrate pos={[44, 0.5, -57]} scale={1.1} rotY={-1.0} />
      {/* Beta module STA-10 — cargo storage row */}
      <ScifiCrate pos={[-3, 7.5, -90]} scale={1.0} rotY={0.6} />
      <ScifiCrate pos={[3, 7.5, -90]} scale={1.2} rotY={-0.4} />
      {/* West wing depot — crates near the wall panel */}
      <ScifiCrate pos={[-44, 7.5, -88]} scale={1.1} rotY={1.2} />

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
