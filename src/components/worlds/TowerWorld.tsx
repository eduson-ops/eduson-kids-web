import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'

const _isLow = detectDeviceTier() === 'low'
const _FLASH_RAND = Array.from({ length: 32 }, () => Math.random())
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import { BossDragon, BossGolem, CrystalCluster, IceBlock, MagicGate, DragonEgg } from '../Scenery'

// ─── Rune Wall shader ────────────────────────────────────────────
const RUNE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const RUNE_FRAG = /* glsl */`
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); }
  void main(){
    // stone base
    vec3 stone = vec3(0.06,0.04,0.10);
    // rune grid: 4 cols, 8 rows — only some cells glow
    vec2 cell = floor(vUv * vec2(4.0, 8.0));
    float h = hash(cell);
    // rune glow: pulsing with per-cell phase
    float pulse = sin(uTime*1.3 + h*6.28)*0.5+0.5;
    float active = step(0.55, h); // ~45% of cells have runes
    // rune shape inside cell: concentric rings
    vec2 local = fract(vUv * vec2(4.0,8.0)) - 0.5;
    float ring = smoothstep(0.38,0.35,length(local)) - smoothstep(0.18,0.15,length(local));
    float cross = smoothstep(0.04,0.02,abs(local.x))*step(abs(local.y),0.38)
                + smoothstep(0.04,0.02,abs(local.y))*step(abs(local.x),0.38);
    float glyph = (ring + cross*0.5)*active;
    vec3 runeCol = mix(vec3(0.4,0.1,0.9), vec3(0.9,0.3,1.0), pulse);
    // crack lines
    float crack = step(0.995, hash(vUv*80.0));
    vec3 col = stone + runeCol*glyph*pulse*1.5 + vec3(0.5,0.3,0.8)*crack*0.3;
    gl_FragColor = vec4(col, 0.92);
  }
`

// ─── Spawn ───────────────────────────────────────────────────────
export const TOWER_SPAWN: [number, number, number] = [0, 3, 8]

// ─── Platform data ───────────────────────────────────────────────
const PLATFORM_HEIGHTS = [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78]
const MOVING_HEIGHTS = new Set([23, 38, 53, 68])

function platformColor(i: number): string {
  if (i < 4) return ['#1a0a3a', '#1a0a40', '#0d0a3a', '#160838'][i]!
  if (i < 8) return ['#0a0d3a', '#0a1240', '#06103a', '#04103a'][i - 4]!
  if (i < 12) return ['#040e30', '#030c28', '#040b22', '#030a1c'][i - 8]!
  return ['#200010', '#2a0014', '#380010', '#4a0010'][i - 12]!
}

// ─── Star Field ──────────────────────────────────────────────────
function StarField() {
  const geo = useMemo(() => {
    const positions = new Float32Array(220 * 3)
    for (let i = 0; i < 220; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 180 + Math.random() * 60
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 10
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ddeeff" size={0.55} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

// ─── Rain Particles ──────────────────────────────────────────────
function RainParticles() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const COUNT = 600
  const frameSkip = useRef(0)
  const data = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 80,
      y: Math.random() * 110,
      z: (Math.random() - 0.5) * 80,
      speed: 14 + Math.random() * 8,
    }))
  }, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    const step = _isLow ? dt * 2 : dt
    if (!ref.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    for (let i = 0; i < COUNT; i++) {
      const p = data[i]!
      p.y -= p.speed * step
      if (p.y < -2) p.y = 110
      dummy.position.set(p.x, p.y, p.z)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.055, 0.5, 0.055]} />
      <meshStandardMaterial color="#3a3060" transparent opacity={0.45} />
    </instancedMesh>
  )
}

// ─── Fog Planes ──────────────────────────────────────────────────
function FogPlanes() {
  const fogHeights = [15, 30, 50, 70]
  return (
    <>
      {fogHeights.map((h, i) => (
        <mesh key={i} position={[0, h, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 90]} />
          <meshStandardMaterial
            color="#1a0530"
            transparent
            opacity={0.13 + i * 0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Lightning Flash ─────────────────────────────────────────────
function LightningFlash({ color, position, interval, prob }: {
  color: string
  position: [number, number, number]
  interval: number
  prob: number
}) {
  const lightRef = useRef<THREE.PointLight>(null!)
  const flash = useRef(0)
  const timer = useRef(0)
  const frameSkipF = useRef(0)
  const flashRandPtr = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkipF.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    timer.current += step
    if (timer.current >= interval) {
      timer.current = 0
    }
    if (_FLASH_RAND[flashRandPtr.current++ % 32]! < prob) flash.current = 6.0
    flash.current *= 0.86
    if (lightRef.current) lightRef.current.intensity = flash.current
  })
  return <pointLight ref={lightRef} color={color} intensity={0} distance={130} position={position} />
}

function LightningSystem() {
  return (
    <>
      <LightningFlash color="#c0aaff"  position={[ 10, 85, -10]} interval={6}  prob={0.0012} />
      <LightningFlash color="#88aaff"  position={[-18, 90,   8]} interval={9}  prob={0.0008} />
      <LightningFlash color="#ffcc44"  position={[ 22, 80,  15]} interval={13} prob={0.0006} />
    </>
  )
}

// ─── Fog Ring ────────────────────────────────────────────────────
function FogRing() {
  return (
    <mesh position={[0, 100, 0]}>
      <cylinderGeometry args={[60, 60, 200, 32, 1, true]} />
      <meshBasicMaterial color="#110022" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

// ─── Tower Walls (the actual tower shell) ─────────────────────────
function TowerWalls() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  const WALL_H = 86
  const WALL_R = 22
  const wall = (rotY: number) => (
    <mesh rotation={[0, rotY, 0]} position={[0, WALL_H / 2, 0]}>
      <planeGeometry args={[40, WALL_H, 2, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={RUNE_VERT}
        fragmentShader={RUNE_FRAG}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
  return (
    <group>
      {/* 4 wall panels forming a square tower shaft */}
      <group position={[0, 0, -WALL_R]}>{wall(0)}</group>
      <group position={[0, 0,  WALL_R]}>{wall(Math.PI)}</group>
      <group position={[-WALL_R, 0, 0]}>{wall(Math.PI / 2)}</group>
      <group position={[ WALL_R, 0, 0]}>{wall(-Math.PI / 2)}</group>
    </group>
  )
}

// ─── Storm Crown (apex rotating ring with lightning bolts) ────────
function StormCrown() {
  const grpRef = useRef<THREE.Group>(null!)
  const spikesRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const spikes = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    len: 6 + Math.random() * 4,
  })), [])
  const frameSkip = useRef(0)

  // Initialise spike matrices once (static relative to the rotating group)
  useMemo(() => {
    // matrices are set in useFrame after mount, nothing to do here
  }, [])

  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    if (grpRef.current) grpRef.current.rotation.y += step * 0.4
    if (!spikesRef.current) return
    spikes.forEach((s, i) => {
      dummy.position.set(Math.cos(s.angle) * 14, 0, Math.sin(s.angle) * 14)
      dummy.rotation.set(0, 0, Math.PI / 2)
      dummy.scale.set(1, s.len, 1)
      dummy.updateMatrix()
      spikesRef.current.setMatrixAt(i, dummy.matrix)
    })
    spikesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={grpRef} position={[0, 88, 0]}>
      {/* Rotating torus base */}
      <mesh>
        <torusGeometry args={[14, 0.6, 8, 48]} />
        <meshStandardMaterial color="#440088" emissive="#aa00ff" emissiveIntensity={2.0} />
      </mesh>
      {/* Lightning spikes — single InstancedMesh (cone r=0.18, h=1 → scaled by len) */}
      <instancedMesh ref={spikesRef} args={[undefined, undefined, spikes.length]} frustumCulled={false}>
        <coneGeometry args={[0.18, 1, 4]} />
        <meshStandardMaterial color="#cc44ff" emissive="#ff88ff" emissiveIntensity={3.0} />
      </instancedMesh>
      <pointLight color="#aa00ff" intensity={6} distance={40} />
    </group>
  )
}

// ─── Floating Debris ─────────────────────────────────────────────
function FloatingDebris() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const COUNT = 40
  const frameSkip = useRef(0)
  const data = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 60,
    y: 20 + Math.random() * 65,
    z: (Math.random() - 0.5) * 60,
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.5,
    rotSpeed: (Math.random() - 0.5) * 2,
  })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      dummy.position.set(
        d.x + Math.sin(t * d.speed + d.phase) * 3,
        d.y + Math.sin(t * 0.4 + d.phase) * 1.5,
        d.z + Math.cos(t * d.speed * 0.7 + d.phase) * 3,
      )
      dummy.rotation.set(t * d.rotSpeed * 0.4, t * d.rotSpeed, 0)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color="#1a0035" emissive="#440088" emissiveIntensity={0.8} roughness={0.9} />
    </instancedMesh>
  )
}

// ─── Energy Orbs ─────────────────────────────────────────────────
const ORB_COUNT = 10
const orbData: { x: number; y: number; z: number; phase: number }[] = Array.from({ length: ORB_COUNT }, () => ({
  x: (Math.random() - 0.5) * 50,
  y: 5 + Math.random() * 70,
  z: (Math.random() - 0.5) * 50,
  phase: Math.random() * Math.PI * 2,
}))

function EnergyOrbs() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    for (let i = 0; i < ORB_COUNT; i++) {
      const o = orbData[i]!
      const s = 0.85 + 0.35 * Math.sin(t * 1.8 + o.phase)
      dummy.position.set(o.x, o.y, o.z)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ORB_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color="#8844ff" />
    </instancedMesh>
  )
}

// ─── Tower Columns ────────────────────────────────────────────────
function TowerColumns() {
  const HEIGHT = 82
  const positions: [number, number, number][] = [
    [-19, HEIGHT / 2, -19], [19, HEIGHT / 2, -19],
    [-19, HEIGHT / 2, 19],  [19, HEIGHT / 2, 19],
  ]
  return (
    <>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[1.6, HEIGHT, 1.6]} />
          <meshStandardMaterial
            color="#0d0020"
            emissive="#220033"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Floating Pinnacles ──────────────────────────────────────────
// [x, baseY, z, height, color]
const PINNACLE_DATA = [
  [-28,  8, -28, 12, '#2a3060'],
  [ 28, 15, -28,  8, '#1a2040'],
  [ 28, 25,  28, 15, '#2a3060'],
  [-28, 35,  28, 10, '#1a2040'],
  [-30, 45,  10,  8, '#2a3060'],
  [ 30, 55, -10, 12, '#1a2040'],
  [-10, 62,  30,  9, '#2a3060'],
  [ 10, 70, -30,  7, '#1a2040'],
] as const

type PinnacleEntry = (typeof PINNACLE_DATA)[number]

function FloatingPinnacles() {
  return (
    <>
      {(PINNACLE_DATA as readonly PinnacleEntry[]).map(([x, baseY, z, height, color], i) => (
        <group key={i} position={[x, baseY, z]}>
          {/* Base spire */}
          <mesh position={[0, height / 2, 0]}>
            <coneGeometry args={[1.8, height, 7]} />
            <meshStandardMaterial
              color={color}
              emissive="#4466ff"
              emissiveIntensity={0.3}
              roughness={0.9}
            />
          </mesh>
          {/* Cap */}
          <mesh position={[0, height + 1, 0]}>
            <coneGeometry args={[0.3, 2, 5]} />
            <meshStandardMaterial
              color={color}
              emissive="#4466ff"
              emissiveIntensity={0.3}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Storm Clouds ────────────────────────────────────────────────
function StormClouds() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameCount = useRef(0)

  // Build all sphere world-positions once: 8 clouds × 3 puffs = 24 instances
  const spheres = useMemo(() => {
    const result: { x: number; y: number; z: number; r: number }[] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 18 + Math.random() * 10
      const baseY = 52 + Math.random() * 8
      const cx = Math.cos(angle) * radius
      const cz = Math.sin(angle) * radius
      for (let j = 0; j < 3; j++) {
        result.push({
          x: cx + (Math.random() - 0.5) * 5,
          y: baseY + (Math.random() - 0.5) * 3,
          z: cz + (Math.random() - 0.5) * 5,
          r: 3 + Math.random() * 3,
        })
      }
    }
    return result
  }, [])

  // Rotation state stored as ref so we don't re-create spheres
  const rotY = useRef(0)

  useFrame((_, dt) => {
    const skip = _isLow ? 4 : 2
    const step = _isLow ? dt * 2 : dt
    if (++frameCount.current % skip !== 0) return  // 30 fps (15 fps on low)
    if (!meshRef.current) return
    rotY.current += step * 0.015
    const cos = Math.cos(rotY.current)
    const sin = Math.sin(rotY.current)
    spheres.forEach((s, i) => {
      // Rotate the position around Y manually (avoids a parent Group)
      const rx = s.x * cos - s.z * sin
      const rz = s.x * sin + s.z * cos
      dummy.position.set(rx, s.y, rz)
      dummy.scale.setScalar(s.r)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, spheres.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 7, 7]} />
      <meshBasicMaterial color="#1a1a2e" transparent opacity={0.6} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── Thunder Flash ────────────────────────────────────────────────
function ThunderFlash() {
  const lightRef = useRef<THREE.PointLight>(null!)
  const nextFlash = useRef<number>(3 + Math.random() * 4)
  const flashStart = useRef<number>(-1)
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (t >= nextFlash.current) {
      flashStart.current = t
      nextFlash.current = t + 3 + Math.random() * 4
    }
    if (flashStart.current >= 0 && lightRef.current) {
      const elapsed = t - flashStart.current
      const intensity = 25 * Math.max(0, 1 - elapsed / 0.23)
      lightRef.current.intensity = intensity
      if (intensity <= 0) {
        flashStart.current = -1
        lightRef.current.intensity = 0
      }
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#aaddff"
      intensity={0}
      distance={120}
      position={[0, 58, 0]}
    />
  )
}

// ─── Lightning Bolt ───────────────────────────────────────────────
function LightningBolt() {
  const groupRef = useRef<THREE.Group>(null!)
  const nextBoltTime = useRef<number>(3 + Math.random() * 4)
  const boltEnd = useRef<number>(-1)
  const frameSkip = useRef(0)

  const segments: [number, number, number][] = [
    [0.5,  57,  0.5],
    [-0.3, 51, -0.2],
    [0.7,  45,  0.3],
    [-0.1, 39, -0.4],
  ]

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (t >= nextBoltTime.current) {
      boltEnd.current = t + 0.12
      nextBoltTime.current = t + 3 + Math.random() * 4
    }
    if (groupRef.current) {
      groupRef.current.visible = t < boltEnd.current
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      {segments.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.08, 6, 0.08]} />
          <meshBasicMaterial color="#ccddff" transparent opacity={0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Guardian Statues ────────────────────────────────────────────
const STATUE_CORNERS: [number, number, number][] = [
  [ 18, 0,  18],
  [-18, 0,  18],
  [ 18, 0, -18],
  [-18, 0, -18],
]

function GuardianStatue({ position }: { position: [number, number, number] }) {
  const [px, , pz] = position
  // Arms fan outward from center (signs of x/z give diagonal direction)
  const armSignX = px >= 0 ? 1 : -1
  const armSignZ = pz >= 0 ? 1 : -1
  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[3, 1.5, 3]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#999999" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 6.3, 0]}>
        <sphereGeometry args={[0.9, 12, 10]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.8} metalness={0.15} />
      </mesh>
      {/* Left arm — angled outward */}
      <mesh
        position={[armSignX * 1.3, 4.5, armSignZ * 0.3]}
        rotation={[0, 0, armSignX * 0.45]}
      >
        <boxGeometry args={[0.5, 2, 0.5]} />
        <meshStandardMaterial color="#999999" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Right arm — angled outward the other diagonal */}
      <mesh
        position={[armSignX * 0.3, 4.5, armSignZ * 1.3]}
        rotation={[armSignZ * 0.45, 0, 0]}
      >
        <boxGeometry args={[0.5, 2, 0.5]} />
        <meshStandardMaterial color="#999999" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Glowing eye — left */}
      <mesh position={[-0.35, 6.4, 0.7]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={3}
        />
      </mesh>
      {/* Glowing eye — right */}
      <mesh position={[0.35, 6.4, 0.7]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={3}
        />
      </mesh>
      {/* Orange point light at head height */}
      <pointLight color="#ff6600" intensity={4} distance={12} position={[0, 6.3, 0]} />
    </group>
  )
}

function GuardianStatues() {
  return (
    <>
      {STATUE_CORNERS.map((pos, i) => (
        <GuardianStatue key={i} position={pos} />
      ))}
    </>
  )
}

// ─── Torch Ring ───────────────────────────────────────────────────
const TORCH_COUNT = 8
const TORCH_RING_RADIUS = 22

function TorchRing() {
  const torches = useMemo(
    () =>
      Array.from({ length: TORCH_COUNT }, (_, i) => {
        const angle = (i / TORCH_COUNT) * Math.PI * 2
        return {
          x: Math.cos(angle) * TORCH_RING_RADIUS,
          z: Math.sin(angle) * TORCH_RING_RADIUS,
        }
      }),
    [],
  )

  const polesRef = useRef<THREE.InstancedMesh>(null!)
  const flamesRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Set static matrices once on first frame
  const initialised = useRef(false)
  useFrame(() => {
    if (initialised.current) return
    initialised.current = true
    torches.forEach(({ x, z }, i) => {
      // Pole: centred at y=2
      dummy.position.set(x, 2, z)
      dummy.scale.setScalar(1)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      polesRef.current?.setMatrixAt(i, dummy.matrix)
      // Flame: centred at y=4.3
      dummy.position.set(x, 4.3, z)
      dummy.updateMatrix()
      flamesRef.current?.setMatrixAt(i, dummy.matrix)
    })
    if (polesRef.current) polesRef.current.instanceMatrix.needsUpdate = true
    if (flamesRef.current) flamesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {/* Wooden poles — one InstancedMesh */}
      <instancedMesh ref={polesRef} args={[undefined, undefined, TORCH_COUNT]} frustumCulled={false}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.95} metalness={0.0} />
      </instancedMesh>
      {/* Fire heads — one InstancedMesh */}
      <instancedMesh ref={flamesRef} args={[undefined, undefined, TORCH_COUNT]} frustumCulled={false}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial color="#ff9900" emissive="#ff6600" emissiveIntensity={4} roughness={0.6} />
      </instancedMesh>
      {/* Point lights must stay individual — one per torch */}
      {torches.map(({ x, z }, i) => (
        <pointLight
          key={i}
          color="#ff8800"
          intensity={3}
          distance={10}
          decay={2}
          position={[x, 4.5, z]}
        />
      ))}
    </>
  )
}

// ─── Ground ───────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[40, 1, 40]} />
          <meshStandardMaterial color="#0d0018" roughness={0.95} metalness={0.1} />
        </mesh>
      </RigidBody>
      {/* Glowing floor ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 10, 64]} />
        <meshStandardMaterial
          color="#4400aa"
          emissive="#6600cc"
          emissiveIntensity={1.2}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>
    </>
  )
}

// ─── Static Platform ─────────────────────────────────────────────
function StaticPlatform({ x, y, z, color, idx }: { x: number; y: number; z: number; color: string; idx: number }) {
  const emColor = idx >= 12 ? '#660010' : '#220044'
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[x, y, z]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[7, 0.5, 4.5]} />
          <meshStandardMaterial
            color={color}
            emissive={emColor}
            emissiveIntensity={0.5}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      </RigidBody>
      <pointLight
        color={idx >= 12 ? '#ff2244' : '#6622ff'}
        intensity={0.9}
        distance={9}
        position={[x, y + 0.8, z]}
      />
    </>
  )
}

// ─── Moving Platform ─────────────────────────────────────────────
function MovingPlatform({ y, phase, color }: { y: number; phase: number; color: string }) {
  const rbRef = useRef<RapierRigidBody>(null!)
  const t = useRef(phase)
  useFrame((_, dt) => {
    if (!rbRef.current) return
    t.current += step * 0.7
    const nx = Math.sin(t.current) * 9
    rbRef.current.setNextKinematicTranslation({ x: nx, y, z: 0 })
  })
  return (
    <>
      <RigidBody ref={rbRef} type="kinematicPosition" colliders="cuboid" position={[0, y, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6.5, 0.5, 4]} />
          <meshStandardMaterial
            color={color}
            emissive="#440088"
            emissiveIntensity={0.7}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      </RigidBody>
      <pointLight color="#aa44ff" intensity={1.1} distance={10} position={[0, y + 1, 0]} />
    </>
  )
}

// ─── Treasure Chests ─────────────────────────────────────────────
const CHEST_DATA: { pos: [number, number, number]; phase: number }[] = [
  { pos: [ 4,  4.5,  2], phase: 0.0 },
  { pos: [-3, 14.5, -1], phase: 1.1 },
  { pos: [ 5, 29.5,  2], phase: 2.3 },
  { pos: [-4, 44.5, -2], phase: 3.7 },
  { pos: [ 3, 59.5,  1], phase: 5.0 },
]

function TreasureChest({ pos, phase }: { pos: [number, number, number]; phase: number }) {
  const lidRef = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (!lidRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    lidRef.current.rotation.x = Math.sin(t * 0.5 + phase) * 0.3 + 0.15
  })
  const [cx, cy, cz] = pos
  return (
    <group position={[cx, cy, cz]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.4, 0.8, 0.9]} />
        <meshStandardMaterial color="#3a1a05" roughness={0.9} metalness={0.2} />
      </mesh>
      {/* Lid — pivots from back edge */}
      <mesh ref={lidRef} position={[0, 0.865, -0.45]}>
        <boxGeometry args={[1.4, 0.3, 0.9]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* Lock */}
      <mesh position={[0, 0.82, 0.46]}>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={4}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Gold glow spill on ground */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 24]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ffaa00"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
      {/* Gold point light */}
      <pointLight color="#ffdd44" intensity={5} distance={8} position={[0, 1, 0]} />
    </group>
  )
}

function TreasureChests() {
  return (
    <>
      {CHEST_DATA.map((c, i) => (
        <TreasureChest key={i} pos={c.pos} phase={c.phase} />
      ))}
    </>
  )
}

// ─── Wall Runes ───────────────────────────────────────────────────
// 16 rune panels distributed on the 4 interior wall faces at various heights
const RUNE_PANEL_DATA: { pos: [number, number, number]; rotY: number; phase: number }[] = [
  // North wall (z = -21)
  { pos: [-8,  10, -21], rotY: 0,              phase: 0.0 },
  { pos: [ 8,  22, -21], rotY: 0,              phase: 0.7 },
  { pos: [-4,  35, -21], rotY: 0,              phase: 1.4 },
  { pos: [ 4,  50, -21], rotY: 0,              phase: 2.1 },
  // South wall (z = +21)
  { pos: [ 8,  10,  21], rotY: Math.PI,        phase: 0.3 },
  { pos: [-8,  22,  21], rotY: Math.PI,        phase: 1.0 },
  { pos: [ 4,  35,  21], rotY: Math.PI,        phase: 1.7 },
  { pos: [-4,  50,  21], rotY: Math.PI,        phase: 2.4 },
  // East wall (x = +21)
  { pos: [ 21,  10,  6], rotY: -Math.PI / 2,  phase: 0.5 },
  { pos: [ 21,  22, -6], rotY: -Math.PI / 2,  phase: 1.2 },
  { pos: [ 21,  38,  4], rotY: -Math.PI / 2,  phase: 1.9 },
  { pos: [ 21,  55, -3], rotY: -Math.PI / 2,  phase: 2.6 },
  // West wall (x = -21)
  { pos: [-21,  10, -6], rotY:  Math.PI / 2,  phase: 0.9 },
  { pos: [-21,  22,  6], rotY:  Math.PI / 2,  phase: 1.6 },
  { pos: [-21,  38, -4], rotY:  Math.PI / 2,  phase: 2.3 },
  { pos: [-21,  55,  3], rotY:  Math.PI / 2,  phase: 3.0 },
]

function RunePanel({ pos, rotY, phase, emitLight }: {
  pos: [number, number, number]
  rotY: number
  phase: number
  emitLight: boolean
}) {
  const hBarRef = useRef<THREE.Mesh>(null!)
  const vBarRef = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const intensity = 2 + Math.sin(clock.elapsedTime * 1.1 + phase) * 1
    const mat = hBarRef.current?.material as THREE.MeshStandardMaterial | undefined
    const mat2 = vBarRef.current?.material as THREE.MeshStandardMaterial | undefined
    if (mat) mat.emissiveIntensity = intensity
    if (mat2) mat2.emissiveIntensity = intensity
  })
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Stone background */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.6, 1.0, 0.08]} />
        <meshStandardMaterial color="#666666" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Horizontal bar of cross */}
      <mesh ref={hBarRef} position={[0, 0, 0.07]}>
        <boxGeometry args={[0.4, 0.08, 0.1]} />
        <meshStandardMaterial
          color="#6644ff"
          emissive="#6644ff"
          emissiveIntensity={3}
          roughness={0.2}
        />
      </mesh>
      {/* Vertical bar of cross */}
      <mesh ref={vBarRef} position={[0, 0, 0.07]}>
        <boxGeometry args={[0.08, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#6644ff"
          emissive="#6644ff"
          emissiveIntensity={3}
          roughness={0.2}
        />
      </mesh>
      {emitLight && (
        <pointLight color="#7755ff" intensity={2} distance={6} position={[0, 0, 0.5]} />
      )}
    </group>
  )
}

function WallRunes() {
  return (
    <>
      {RUNE_PANEL_DATA.map((r, i) => (
        <RunePanel
          key={i}
          pos={r.pos}
          rotY={r.rotY}
          phase={r.phase}
          emitLight={i % 4 === 0}
        />
      ))}
    </>
  )
}

// ─── Floating Crystals ────────────────────────────────────────────
const CRYSTAL_COLORS: string[] = ['#aa66ff', '#6644ff', '#ff44aa', '#44aaff']

const CRYSTAL_DATA = Array.from({ length: 8 }, (_, i) => ({
  orbitAngle: (i / 8) * Math.PI * 2,
  orbitRadius: 12,
  orbitY: 52 + (i % 4) * 1.8,
  orbitSpeed: 0.28 + i * 0.04,
  color: CRYSTAL_COLORS[i % CRYSTAL_COLORS.length] as string,
  phase: (i / 8) * Math.PI * 2,
}))

function FloatingCrystal({ orbitAngle, orbitRadius, orbitY, orbitSpeed, color, phase }: {
  orbitAngle: number
  orbitRadius: number
  orbitY: number
  orbitSpeed: number
  color: string
  phase: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    const angle = orbitAngle + t * orbitSpeed
    groupRef.current.position.x = Math.cos(angle) * orbitRadius
    groupRef.current.position.y = orbitY + Math.sin(t * 0.6 + phase) * 0.8
    groupRef.current.position.z = Math.sin(angle) * orbitRadius
    groupRef.current.rotation.y += _isLow ? 0.04 : 0.02
  })
  return (
    <group ref={groupRef}>
      {/* Upper cone (point up) */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.5, 2, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          roughness={0.1}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Lower cone (point down, base-to-base) */}
      <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 2, 6]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          roughness={0.1}
          metalness={0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

function FloatingCrystals() {
  return (
    <>
      {CRYSTAL_DATA.map((c, i) => (
        <FloatingCrystal
          key={i}
          orbitAngle={c.orbitAngle}
          orbitRadius={c.orbitRadius}
          orbitY={c.orbitY}
          orbitSpeed={c.orbitSpeed}
          color={c.color}
          phase={c.phase}
        />
      ))}
    </>
  )
}

// ─── Dungeon Entrance ────────────────────────────────────────────
function DungeonEntrance() {
  // 8 steps descend: each step shifts down 0.5 in y and forward 0.9 in z
  const steps = Array.from({ length: 8 }, (_, i) => ({
    x: 0,
    y: -0.2 - i * 0.5,
    z: i * 0.9,
  }))

  // 5-box arc approximating a curved lintel over the entrance
  // boxes lean inward at increasing angles
  const lintels = Array.from({ length: 5 }, (_, i) => {
    const t = (i / 4) * Math.PI  // 0 → π across the arc
    const arcR = 2.4
    const cx = Math.cos(t) * arcR  // goes -arcR to +arcR
    const cy = Math.sin(t) * arcR  // peaks in the middle
    const angle = t - Math.PI / 2  // tangent tilt of each segment
    return { cx, cy, angle }
  })

  return (
    <group position={[5, 0, 25]}>
      {/* Staircase steps descending underground */}
      {steps.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[4, 0.4, 0.8]} />
          <meshStandardMaterial color="#555544" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {/* Arch pillars */}
      <mesh position={[-2.1, 1.5, 0]}>
        <boxGeometry args={[0.8, 3, 0.8]} />
        <meshStandardMaterial color="#666655" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[2.1, 1.5, 0]}>
        <boxGeometry args={[0.8, 3, 0.8]} />
        <meshStandardMaterial color="#666655" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Arc lintel — 5 boxes forming a curved top */}
      {lintels.map((l, i) => (
        <mesh key={i} position={[l.cx * 0.9, 3 + l.cy * 0.7, -0.1]} rotation={[0, 0, l.angle]}>
          <boxGeometry args={[0.7, 0.55, 0.8]} />
          <meshStandardMaterial color="#666655" roughness={0.92} metalness={0.05} />
        </mesh>
      ))}

      {/* Iron gate — 6 vertical bars */}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((bx, i) => (
        <mesh key={i} position={[bx, 1.5, 0.1]} rotation={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.8} />
        </mesh>
      ))}
      {/* 2 horizontal bars */}
      <mesh position={[0, 0.6, 0.1]} rotation={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0.1]} rotation={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.4, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#333333" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Eerie red glow from underground */}
      <pointLight color="#ff2200" intensity={5} distance={12} position={[0, -3, 3]} />
    </group>
  )
}

// ─── Dungeon Chamber ─────────────────────────────────────────────
function DungeonChamber() {
  return (
    <group position={[5, 0, 25]}>
      {/* Chamber floor */}
      <mesh position={[0, -9.5, 8]}>
        <boxGeometry args={[20, 0.5, 20]} />
        <meshStandardMaterial color="#333322" roughness={0.98} metalness={0.02} />
      </mesh>

      {/* 4 walls */}
      {/* North wall */}
      <mesh position={[0, -6, -2]}>
        <boxGeometry args={[20, 7, 0.5]} />
        <meshStandardMaterial color="#444433" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* South wall */}
      <mesh position={[0, -6, 18]}>
        <boxGeometry args={[20, 7, 0.5]} />
        <meshStandardMaterial color="#444433" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* East wall */}
      <mesh position={[10, -6, 8]}>
        <boxGeometry args={[0.5, 7, 20]} />
        <meshStandardMaterial color="#444433" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* West wall */}
      <mesh position={[-10, -6, 8]}>
        <boxGeometry args={[0.5, 7, 20]} />
        <meshStandardMaterial color="#444433" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* ── Chained prisoner skeleton ── */}
      {/* Skull */}
      <mesh position={[-7, -3.5, 17.2]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial color="#ccbbaa" roughness={0.85} />
      </mesh>
      {/* Ribcage — 5 rib-pair boxes */}
      {[0, 0.22, 0.44, 0.66, 0.88].map((oy, i) => (
        <mesh key={i} position={[-7, -4.1 - oy, 17.2]}>
          <boxGeometry args={[0.55, 0.08, 0.18]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.85} />
        </mesh>
      ))}
      {/* Chain left wrist to wall */}
      <mesh position={[-8.6, -4, 17.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
        <meshStandardMaterial color="#444444" roughness={0.6} metalness={0.9} />
      </mesh>
      {/* Chain right wrist to wall */}
      <mesh position={[-5.4, -4, 17.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
        <meshStandardMaterial color="#444444" roughness={0.6} metalness={0.9} />
      </mesh>

      {/* ── Torture rack ── */}
      {/* Two main vertical posts */}
      <mesh position={[7, -6, 5]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 8]} />
        <meshStandardMaterial color="#3b1e0a" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[7, -6, 7]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 8]} />
        <meshStandardMaterial color="#3b1e0a" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Top crossbar */}
      <mesh position={[7, -4.6, 6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#3b1e0a" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Bottom crossbar */}
      <mesh position={[7, -7.4, 6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#3b1e0a" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Wall-mounted torches (4 torches) ── */}
      {/* Positions on chamber walls */}
      {([
        [-9.6, -5, 4],
        [-9.6, -5, 12],
        [9.6,  -5, 4],
        [9.6,  -5, 12],
      ] as [number, number, number][]).map(([tx, ty, tz], i) => (
        <group key={i} position={[tx, ty, tz]}>
          {/* Torch stick */}
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
            <meshStandardMaterial color="#5a3010" roughness={0.9} />
          </mesh>
          {/* Flame cone */}
          <mesh position={[0, 0.35, 0]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff6600"
              emissiveIntensity={6}
              roughness={0.5}
            />
          </mesh>
          <pointLight color="#ff8800" intensity={4} distance={8} position={[0, 0.5, 0]} />
        </group>
      ))}

      {/* ── Old wooden chest with gold coins ── */}
      {/* Body */}
      <mesh position={[6, -8.9, 15]}>
        <boxGeometry args={[1.4, 0.8, 0.9]} />
        <meshStandardMaterial color="#3a1a05" roughness={0.9} metalness={0.15} />
      </mesh>
      {/* Lid (slightly open) */}
      <mesh position={[6, -8.45, 14.55]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.4, 0.3, 0.9]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.85} metalness={0.15} />
      </mesh>
      {/* Gold coins visible inside */}
      <mesh position={[6, -8.7, 15]}>
        <boxGeometry args={[1.1, 0.15, 0.6]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <pointLight color="#ffdd44" intensity={4} distance={6} position={[6, -8.2, 15]} />
    </group>
  )
}

// ─── Dragon Bones ────────────────────────────────────────────────
function DragonBones() {
  // Spine vertebrae: curved arc across the chamber
  const vertebrae = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7  // 0 → 1
    return {
      x: -6 + t * 12,
      y: -9.0 + Math.sin(t * Math.PI) * 1.2,
      z: 25 + 4 + t * 6,
      ry: Math.atan2(1, (t - 0.5) * 12) * 0.3,
    }
  })

  // 12 ribs — 6 per side arching outward from vertebrae
  const ribs: { px: number; py: number; pz: number; rx: number; rz: number; side: number }[] = []
  for (let i = 0; i < 6; i++) {
    const v = vertebrae[i + 1]!
    const arch = 0.3 + i * 0.08
    for (const side of [-1, 1]) {
      ribs.push({
        px: v.x + side * 0.6,
        py: v.y + 0.5,
        pz: v.z,
        rx: side * arch,
        rz: side * 0.6,
        side,
      })
    }
  }

  // Wing bone fans — radiating cylinders from shoulder area
  const wingOrigins: [number, number, number, number][] = [
    [-3, -7.5, 32, -1],
    [ 3, -7.5, 32,  1],
  ]
  const wingRays = Array.from({ length: 5 }, (_, i) => {
    const spread = -0.6 + i * 0.3  // angle spread
    return spread
  })

  // 4 sets of 3 claws
  const clawSets: [number, number, number][] = [
    [-7, -9.0, 27],
    [ 7, -9.0, 27],
    [-5, -9.0, 34],
    [ 5, -9.0, 34],
  ]

  return (
    <group position={[5, 0, 0]}>
      {/* ── Skull ── */}
      <mesh position={[-6, -7.5, 29]}>
        <sphereGeometry args={[2, 10, 8]} />
        <meshStandardMaterial color="#ccbbaa" roughness={0.88} metalness={0.05} />
      </mesh>
      {/* Lower jaw */}
      <mesh position={[-6, -9.2, 28.5]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[3.5, 0.5, 2.5]} />
        <meshStandardMaterial color="#ccbbaa" roughness={0.88} metalness={0.05} />
      </mesh>
      {/* Upper snout */}
      <mesh position={[-6, -7.9, 26.8]}>
        <boxGeometry args={[2.8, 0.6, 2.2]} />
        <meshStandardMaterial color="#ccbbaa" roughness={0.88} metalness={0.05} />
      </mesh>

      {/* ── Spine vertebrae ── */}
      {vertebrae.map((v, i) => (
        <mesh key={i} position={[v.x, v.y, v.z]} rotation={[0, v.ry, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 10]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.88} metalness={0.05} />
        </mesh>
      ))}

      {/* ── Ribs ── */}
      {ribs.map((r, i) => (
        <mesh key={i} position={[r.px, r.py, r.pz]} rotation={[r.rx, 0, r.rz]}>
          <cylinderGeometry args={[0.09, 0.05, 3.5, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.9} metalness={0.04} />
        </mesh>
      ))}

      {/* ── Wing bones ── radiating fans */}
      {wingOrigins.map(([wx, wy, wz, side], wi) => (
        <group key={wi}>
          {wingRays.map((spread, ri) => (
            <mesh
              key={ri}
              position={[wx + side * (1 + ri * 0.6), wy + spread * 0.8, wz + ri * 0.5]}
              rotation={[spread * 0.6, 0, side * (0.5 + ri * 0.15)]}
            >
              <cylinderGeometry args={[0.06, 0.03, 3 + ri * 0.4, 6]} />
              <meshStandardMaterial color="#bbaa99" roughness={0.9} metalness={0.04} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Claws — 4 sets of 3 curved claw bones ── */}
      {clawSets.map(([cx, cy, cz], si) => (
        <group key={si} position={[cx, cy, cz]}>
          {[-0.3, 0, 0.3].map((offset, ci) => (
            <mesh key={ci} position={[offset, 0, 0]} rotation={[0.5, 0, offset]}>
              <cylinderGeometry args={[0.07, 0.02, 0.9, 6]} />
              <meshStandardMaterial color="#bbaa88" roughness={0.88} metalness={0.06} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ─── Main World ───────────────────────────────────────────────────
export default function TowerWorld() {
  const platforms = useMemo(() => {
    return PLATFORM_HEIGHTS.map((h, i) => {
      const angle = i * (Math.PI / 4)
      const radius = 7
      const x = Math.sin(angle) * radius * (i % 2 === 0 ? -1 : 1)
      const z = Math.cos(angle) * 3
      return { h, x, z, i, color: platformColor(i) }
    })
  }, [])

  const movingPhases = useMemo(() => [0, Math.PI / 2, Math.PI, Math.PI * 1.5], [])
  let movingIdx = 0

  return (
    <>
      {/* Sky */}
      <GradientSky top="#000008" bottom="#0d001f" radius={500} />

      {/* Ambient + directional */}
      <ambientLight color="#0a0018" intensity={0.6} />
      <directionalLight color="#330055" intensity={0.5} position={[20, 60, 20]} />

      {/* Atmosphere */}
      <LightningSystem />
      <StarField />
      <RainParticles />
      <FogPlanes />
      <FogRing />
      <EnergyOrbs />
      <TowerWalls />
      <StormCrown />
      <FloatingDebris />
      <StormClouds />
      <ThunderFlash />
      <LightningBolt />

      {/* Geometry */}
      <Ground />
      <TowerColumns />
      {/* Base decorations */}
      <GuardianStatues />
      <TorchRing />
      {/* Magic gate entrance at base */}
      <MagicGate pos={[0, 0, 12]} scale={2.5} rotY={Math.PI} />

      {/* Platforms */}
      {platforms.map(({ h, x, z, i, color }) => {
        if (MOVING_HEIGHTS.has(h)) {
          const ph = movingPhases[movingIdx++] ?? 0
          return <MovingPlatform key={i} y={h} phase={ph} color={color} />
        }
        return <StaticPlatform key={i} x={x} y={h} z={z} color={color} idx={i} />
      })}

      {/* Coins on every other platform */}
      {platforms
        .filter((_, i) => i % 2 === 0)
        .map(({ h, x, z, i }) => (
          <Coin key={`coin-${i}`} pos={[x, h + 1.2, z]} />
        ))}

      {/* Enemies mid-tower */}
      <Enemy pos={[5, 19, 0]} patrolX={4} color="#aa0044" />
      <Enemy pos={[-5, 34, 0]} patrolX={4} color="#880066" />
      <Enemy pos={[4, 49, 0]} patrolX={3} color="#660088" />

      {/* Boss at top */}
      <GltfMonster
        which="alien"
        pos={[0, 80, 0]}
        scale={2.0}
        rotY={Math.PI}
        animation="Wave"
      />
      {/* Boss glow */}
      <pointLight color="#ff0044" intensity={3} distance={18} position={[0, 82, 0]} />

      {/* Crown platform */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 78.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10, 0.6, 10]} />
          <meshStandardMaterial
            color="#300010"
            emissive="#880020"
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      </RigidBody>
      <pointLight color="#ff3300" intensity={2.5} distance={20} position={[0, 80, 0]} />

      {/* Peripheral rock spires */}
      <FloatingPinnacles />

      {/* ── Treasure chests on various platform levels ── */}
      <TreasureChests />

      {/* ── Ancient glowing runes on tower walls ── */}
      <WallRunes />

      {/* ── Magical crystals orbiting the tower top ── */}
      <FloatingCrystals />

      {/* Win trigger */}
      <GoalTrigger
        pos={[0, 79, 0]}
        size={[10, 4, 10]}
        result={{ kind: 'win', label: 'ВЕРШИНА!', subline: 'Ты покорил башню!' }}
      />

      {/* ── Дракон Вершины — финальный босс на самом верху ── */}
      <BossDragon pos={[0, 83, -3]} scale={2.2} rotY={Math.PI} />

      {/* ── Страж Башни — хранитель середины (y≈40) ── */}
      <BossGolem pos={[4, 40, 0]} scale={1.6} rotY={-Math.PI / 2} />

      {/* ── Кристальные кластеры на нижних платформах ── */}
      <CrystalCluster pos={[3,  4.5,  2]} scale={0.8} rotY={0} />
      <CrystalCluster pos={[-3, 4.5, -2]} scale={0.7} rotY={1.2} />
      <CrystalCluster pos={[4,  9.5,  1]} scale={0.9} rotY={2.4} />
      <CrystalCluster pos={[-4, 9.5, -1]} scale={0.75} rotY={0.6} />
      <CrystalCluster pos={[3, 14.5,  2]} scale={0.85} rotY={1.8} />
      <CrystalCluster pos={[-3, 19.5, 1]} scale={0.8} rotY={3.0} />
      <CrystalCluster pos={[4, 24.5, -2]} scale={0.7} rotY={0.3} />
      <CrystalCluster pos={[-4, 29.5, 2]} scale={0.9} rotY={2.1} />

      {/* ── Драконьи яйца — таинственные объекты на разных высотах ── */}
      <DragonEgg pos={[2, 4.5, -1]} scale={1.2} rotY={0.5} />
      <pointLight color="#aa00ff" intensity={1.5} distance={6} position={[2, 5.5, -1]} />
      <DragonEgg pos={[-3, 19.5, 1]} scale={1.0} rotY={1.8} />
      <pointLight color="#aa00ff" intensity={1.5} distance={6} position={[-3, 20.5, 1]} />
      <DragonEgg pos={[2, 44.5, -2]} scale={1.3} rotY={3.1} />
      <pointLight color="#aa00ff" intensity={1.5} distance={6} position={[2, 45.5, -2]} />

      {/* ── Ледяные глыбы на верхних платформах (высокогорный лёд) ── */}
      <IceBlock pos={[3,  59.5,  2]} scale={0.9} rotY={0.5} />
      <IceBlock pos={[-3, 64.5, -2]} scale={1.0} rotY={1.4} />
      <IceBlock pos={[4,  69.5,  1]} scale={0.85} rotY={2.8} />
      <IceBlock pos={[-4, 74.5, -1]} scale={1.1} rotY={0.2} />
      <IceBlock pos={[2,  74.5,  3]} scale={0.8} rotY={1.9} />
      <IceBlock pos={[-2, 59.5,  1]} scale={0.95} rotY={3.1} />

      {/* ── Underground dungeon complex ── */}
      <DungeonEntrance />
      <DungeonChamber />
      <DragonBones />
    </>
  )
}
