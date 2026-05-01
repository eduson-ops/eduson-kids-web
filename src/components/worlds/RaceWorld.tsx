import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Tree, ParkedCar, Lantern, Sign, Flag, Rock, TreePine, Ramp, Trophy, BossGolem, CrystalCluster, LavaRock, PalmTree } from '../Scenery'

// ─── Exhaust smoke particles ─────────────────────────────────────────────────
const SMOKE_COUNT = 60

type SmokeParticle = {
  x: number
  baseZ: number
  y: number
  scale: number
  speed: number
  visible: boolean
}

function ExhaustSmoke() {
  const refs = useRef<(THREE.Mesh | null)[]>([])

  const particles = useMemo<SmokeParticle[]>(() => {
    return Array.from({ length: SMOKE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 30,    // -15 to 15
      baseZ: 50 + (Math.random() - 0.5) * 6,
      y: Math.random() * 3,
      scale: 0.3 + Math.random() * 0.7,
      speed: 0.3 + Math.random() * 0.5,
      visible: true,
    }))
  }, [])

  useFrame((_s, delta) => {
    particles.forEach((p, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      if (!p.visible) {
        // reset
        p.y = 0
        p.scale = 0.3 + Math.random() * 0.4
        p.visible = true
      }
      p.y += delta * p.speed
      p.scale += delta * 0.25
      if (p.y >= 3) {
        p.visible = false
      }
      mesh.position.y = p.y
      mesh.scale.setScalar(p.scale)
      mesh.visible = p.visible
    })
  })

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={[p.x, p.y, p.baseZ]}
        >
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#888888" opacity={0.25} transparent />
        </mesh>
      ))}
    </group>
  )
}

// ─── Speed lines on start straight ──────────────────────────────────────────
function SpeedLines() {
  const lines = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: -8 + (i / 11) * 16,
      y: 0.5 + Math.random() * 1.0,
      z: 45 + Math.random() * 10,
    }))
  }, [])

  return (
    <group>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, l.z]}>
          {/* 0.05 wide × 4 long, oriented along Z axis */}
          <planeGeometry args={[0.05, 4]} />
          <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Victory Podium ──────────────────────────────────────────────────────────
// Placed at x=-50, z=90 (outside circuit, north-west of grandstands)
const PODIUM_ORIGIN: [number, number, number] = [-50, 0, 90]

function VictoryPodium() {
  // "1" numeral marking: 3 flat emissive boxes stacked vertically
  const OneMarking = ({ y }: { y: number }) => (
    <group position={[0, y, 2.05]}>
      {/* vertical bar of the "1" */}
      <mesh>
        <boxGeometry args={[0.25, 1.6, 0.06]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      {/* top serif */}
      <mesh position={[-0.22, 0.65, 0]}>
        <boxGeometry args={[0.45, 0.22, 0.06]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
      {/* base serif */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[0.6, 0.22, 0.06]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={2} />
      </mesh>
    </group>
  )

  // Trophy: cylinder base + sphere cup
  const TierTrophy = ({
    pos,
    color,
  }: {
    pos: [number, number, number]
    color: string
  }) => (
    <group position={pos}>
      {/* Cup base cylinder */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 10]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Cup bowl sphere */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color="#ffdd00" metalness={0.9} roughness={0.1} emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )

  // Champion's laurel wreath (torus)
  const Wreath = ({ y }: { y: number }) => (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.7, 0.15, 8, 24]} />
      <meshStandardMaterial color="#44aa44" emissive="#44aa44" emissiveIntensity={0.6} roughness={0.7} />
    </mesh>
  )

  return (
    <group position={PODIUM_ORIGIN}>
      {/* ── Podium base platform ── */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[18, 0.5, 5]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* ── 1st place tier (centre, tallest) ── */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#ffdd00" metalness={0.5} roughness={0.3} emissive="#ffaa00" emissiveIntensity={0.2} />
      </mesh>
      <OneMarking y={3.6} />
      <TierTrophy pos={[0, 4.5, 0]} color="#ffdd00" />
      <Wreath y={5.85} />
      {/* Gold champion spotlight */}
      <pointLight position={[0, 8, 0]} intensity={8} distance={12} color="#ffdd88" />

      {/* ── 2nd place tier (left / negative X) ── */}
      <mesh position={[-6.5, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 2, 4]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.2} />
      </mesh>
      <TierTrophy pos={[-6.5, 3.45, 0]} color="#cccccc" />

      {/* ── 3rd place tier (right / positive X) ── */}
      <mesh position={[6.5, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.5, 4]} />
        <meshStandardMaterial color="#cc8833" metalness={0.4} roughness={0.4} />
      </mesh>
      <TierTrophy pos={[6.5, 2.95, 0]} color="#cc8833" />
    </group>
  )
}

// ─── Victory Fireworks ────────────────────────────────────────────────────────
const BURST_COLORS = ['#ffdd00', '#ff2222', '#2244ff', '#22cc44', '#ffffff', '#ff66cc'] as const
const BURST_PARTICLE_COUNT = 20

type BurstState = {
  radius: number
  maxRadius: number
  speed: number
  startDelay: number
  elapsed: number
  active: boolean
}

function VictoryFireworks() {
  // 4 mortar launchers
  const MORTAR_X = [-9, -3, 3, 9]
  // 6 burst clusters, each mapped to a mortar (cycling) with staggered timing
  const burstCount = 6
  const _fw_dummy = useRef(new THREE.Object3D())

  const burstStates = useRef<BurstState[]>(
    Array.from({ length: burstCount }, (_, i) => ({
      radius: 0,
      maxRadius: 6 + (i % 3),
      speed: 3.5 + (i % 2) * 1.2,
      startDelay: i * 1.1,
      elapsed: 0,
      active: false,
    }))
  )

  // Particle offsets per burst — fixed unit directions
  const particleDirections = useMemo<THREE.Vector3[][]>(() => {
    return Array.from({ length: burstCount }, () =>
      Array.from({ length: BURST_PARTICLE_COUNT }, () => {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        return new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.abs(Math.sin(phi) * Math.sin(theta)) + 0.3, // bias upward
          Math.sin(phi) * Math.cos(theta + 1.0)
        ).normalize()
      })
    )
  }, [])

  // One instancedMesh per burst color
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([])
  const lightRefs = useRef<(THREE.PointLight | null)[]>([])

  const BURST_Y = 14
  const BURST_Z_OFFSETS = [0, 2, -2, 1, -1, 0]

  useFrame((_s, delta) => {
    const dummy = _fw_dummy.current
    for (let b = 0; b < burstCount; b++) {
      const state = burstStates.current[b]!
      state.elapsed += delta

      if (state.elapsed < state.startDelay) continue

      const localT = state.elapsed - state.startDelay

      // Cycle: expand for (maxRadius/speed) seconds, then reset
      const cycleDuration = state.maxRadius / state.speed + 0.4
      if (localT > cycleDuration) {
        state.elapsed = state.startDelay  // restart
        state.active = true
        continue
      }

      state.active = true
      state.radius = Math.min(localT * state.speed, state.maxRadius)

      const mesh = meshRefs.current[b]
      const light = lightRefs.current[b]
      const dirs = particleDirections[b]!

      const fade = 1 - state.radius / state.maxRadius

      if (mesh) {
        for (let p = 0; p < BURST_PARTICLE_COUNT; p++) {
          const dir = dirs[p]!
          const mortarIdx = b % MORTAR_X.length
          const bx = (PODIUM_ORIGIN[0]) + (MORTAR_X[mortarIdx] ?? 0)
          const bz = PODIUM_ORIGIN[2] + (BURST_Z_OFFSETS[b] ?? 0)
          dummy.position.set(
            bx + dir.x * state.radius,
            BURST_Y + dir.y * state.radius,
            bz + dir.z * state.radius
          )
          const s = fade * 0.18
          dummy.scale.setScalar(s > 0.001 ? s : 0.001)
          dummy.updateMatrix()
          mesh.setMatrixAt(p, dummy.matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
      }

      if (light) {
        light.intensity = fade * 12
      }
    }
  })

  return (
    <group>
      {/* Mortar launchers */}
      {MORTAR_X.map((mx, i) => (
        <mesh
          key={i}
          position={[PODIUM_ORIGIN[0] + mx, 4, PODIUM_ORIGIN[2]]}
          castShadow
        >
          <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
          <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Burst instancedMeshes */}
      {Array.from({ length: burstCount }, (_, b) => {
        const color = BURST_COLORS[b % BURST_COLORS.length]!
        const mortarIdx = b % MORTAR_X.length
        const bx = PODIUM_ORIGIN[0] + (MORTAR_X[mortarIdx] ?? 0)
        const bz = PODIUM_ORIGIN[2] + (BURST_Z_OFFSETS[b] ?? 0)
        return (
          <group key={b}>
            <instancedMesh
              ref={(el) => { meshRefs.current[b] = el }}
              args={[undefined, undefined, BURST_PARTICLE_COUNT]}
              frustumCulled={false}
            >
              <sphereGeometry args={[1, 5, 5]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
            </instancedMesh>
            <pointLight
              ref={(el) => { lightRefs.current[b] = el as THREE.PointLight | null }}
              position={[bx, BURST_Y, bz]}
              color={color}
              intensity={0}
              distance={20}
            />
          </group>
        )
      })}
    </group>
  )
}

// ─── Crowd glow bands behind grandstands ─────────────────────────────────────
function CrowdGlowBands() {
  const bands = [
    { x: -36, y: 3, z: 72, color: '#ff8800' },
    { x:   0, y: 4, z: 72, color: '#0088ff' },
    { x:  36, y: 3, z: 72, color: '#ff8800' },
    { x:   0, y: 5, z: 28, color: '#0088ff' },
  ]

  return (
    <group>
      {bands.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <planeGeometry args={[20, 3]} />
          <meshBasicMaterial
            color={b.color}
            opacity={0.08}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
// ─── Oval path waypoints ────────────────────────────────────────────────────
// Each point is center of track segment. Arc turns use 8 segments each.
const OVAL_PATH: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = []
  // Straight 1: START — west to east along z=50
  for (let x = -80; x <= 80; x += 20) pts.push(new THREE.Vector3(x, 0.4, 50))
  // Turn 1 NE: arc from (80, z=50) curving to (80, z=-50)
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI / 2) - (Math.PI * i) / 8
    pts.push(new THREE.Vector3(80 + Math.cos(a) * 0, 0.4, 50 - 50 * (i / 8) * 2))
  }
  // Straight 2: BACK — east to west along z=-50
  for (let x = 80; x >= -80; x -= 20) pts.push(new THREE.Vector3(x, 0.4, -50))
  // Turn 2 SW: arc from (-80, z=-50) curving to (-80, z=50)
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    pts.push(new THREE.Vector3(-80, 0.4, -50 + 100 * t))
  }
  return pts
})()

// ─── Heat shimmer shader on track ──────────────────────────────────────────
const heatVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const heatFrag = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float shimmer = sin(vUv.x * 40.0 + iTime * 3.0) * 0.008 + sin(vUv.y * 30.0 + iTime * 2.3) * 0.006;
    vec3 base = vec3(0.10, 0.10, 0.14);
    vec3 hot = vec3(0.15, 0.13, 0.16);
    vec3 col = mix(base, hot, shimmer + 0.5);
    float alpha = 0.18 + shimmer * 2.0;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.35));
  }
`

function HeatShimmer({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms['iTime']!.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={matRef}
        vertexShader={heatVert}
        fragmentShader={heatFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Stars ──────────────────────────────────────────────────────────────────
function Stars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 280 + Math.random() * 20
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 30
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.6} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

// ─── Floodlight pole ────────────────────────────────────────────────────────
function Floodlight({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      {/* Pole */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 14, 0.4]} />
        <meshStandardMaterial color="#888899" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[2.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.6} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial color="#ffffe0" emissive="#ffff88" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 7.8, 0]} intensity={8} distance={40} color="#fffde8" castShadow />
    </group>
  )
}

// ─── AI cars ────────────────────────────────────────────────────────────────
const AI_CARS: { color: string; speed: number; offset: number }[] = [
  { color: '#ff2020', speed: 0.045, offset: 0.0 },
  { color: '#2080ff', speed: 0.038, offset: 0.33 },
  { color: '#20e040', speed: 0.052, offset: 0.66 },
]

function AICar({ color, speed, offset }: { color: string; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null)
  const tRef = useRef(offset)

  useFrame((_s, delta) => {
    tRef.current = (tRef.current + delta * speed) % 1
    const t = tRef.current
    const total = OVAL_PATH.length
    const idx = t * total
    const i0 = Math.floor(idx) % total
    const i1 = (i0 + 1) % total
    const frac = idx - Math.floor(idx)
    const p0 = OVAL_PATH[i0]!
    const p1 = OVAL_PATH[i1]!
    const px = p0.x + (p1.x - p0.x) * frac
    const pz = p0.z + (p1.z - p0.z) * frac
    if (ref.current) {
      ref.current.position.set(px, 0.5, pz)
      // face direction of travel
      const dx = p1.x - p0.x
      const dz = p1.z - p0.z
      if (Math.abs(dx) + Math.abs(dz) > 0.001) {
        ref.current.rotation.y = Math.atan2(dx, dz)
      }
    }
  })

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.7, 4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Headlights */}
      <pointLight position={[0, 0, -2.1]} intensity={3} distance={14} color="#fffbe8" />
    </group>
  )
}

// ─── Grandstand tier ────────────────────────────────────────────────────────
function Grandstand({ pos, side }: { pos: [number, number, number]; side: 1 | -1 }) {
  return (
    <group position={pos}>
      {[0, 1, 2].map((tier) => (
        <mesh key={tier} position={[side * tier * 1.8, tier * 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.4, 24]} />
          <meshStandardMaterial
            color={tier === 0 ? '#2a2a40' : tier === 1 ? '#1e2040' : '#191930'}
            roughness={0.8}
          />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[side * 2.6, 5.2, 0]}>
        <boxGeometry args={[2.4, 0.25, 25]} />
        <meshStandardMaterial color="#111128" metalness={0.4} />
      </mesh>
    </group>
  )
}

// ─── Start/finish gantry ────────────────────────────────────────────────────
function StartGantry() {
  // Checkered arch: left post, right post, horizontal beam with alternating black/white boxes
  const checks = []
  for (let i = 0; i < 14; i++) {
    checks.push(
      <mesh key={i} position={[-7 + i + 0.5, 6.5, 0]}>
        <boxGeometry args={[1, 0.9, 0.5]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : '#111111'} />
      </mesh>
    )
  }
  return (
    <group position={[0, 0, 50]}>
      {/* Left post */}
      <mesh position={[-8, 3.5, 0]} castShadow>
        <boxGeometry args={[0.6, 7, 0.6]} />
        <meshStandardMaterial color="#cc0000" metalness={0.5} />
      </mesh>
      {/* Right post */}
      <mesh position={[8, 3.5, 0]} castShadow>
        <boxGeometry args={[0.6, 7, 0.6]} />
        <meshStandardMaterial color="#cc0000" metalness={0.5} />
      </mesh>
      {/* Horizontal beam */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[16, 0.5, 0.5]} />
        <meshStandardMaterial color="#880000" metalness={0.5} />
      </mesh>
      {/* Checkered panels */}
      {checks}
      {/* Spotlight */}
      <pointLight position={[0, 8, 0]} intensity={15} distance={50} color="#ffffff" castShadow />
      {/* "START / FINISH" sign strip */}
      <mesh position={[0, 7.9, 0]}>
        <boxGeometry args={[5, 0.55, 0.3]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

// ─── Track surface ───────────────────────────────────────────────────────────
// Straight sections + arc segments
function TrackSurface() {
  // Straight 1: z=50, x from -80 to 80
  // Straight 2: z=-50, x from -80 to 80
  // Turn 1 NE: right side x=80, z from 50 to -50
  // Turn 2 SW: left side x=-80, z from -50 to 50

  const trackMat = (
    <meshStandardMaterial color="#1a1a24" roughness={0.85} metalness={0.3} />
  )

  // Arc segments for turns (8 slices each)
  const arcSegments: JSX.Element[] = []
  const NEcx = 80, NEcz = 0, SWcx = -80, SWcz = 0
  const R = 50

  for (let i = 0; i < 8; i++) {
    const a0 = Math.PI / 2 - (Math.PI * i) / 8
    const a1 = Math.PI / 2 - (Math.PI * (i + 1)) / 8
    const amid = (a0 + a1) / 2
    const midX = NEcx + R * Math.cos(amid)
    const midZ = NEcz + R * Math.sin(amid)
    const segLen = 2 * R * Math.sin(Math.PI / 16) + 14
    const angle = -amid + Math.PI / 2
    arcSegments.push(
      <mesh key={`ne${i}`} position={[midX, 0, midZ]} rotation={[0, angle, 0]} receiveShadow>
        <boxGeometry args={[14, 0.3, segLen]} />
        {trackMat}
      </mesh>
    )
  }
  for (let i = 0; i < 8; i++) {
    const a0 = -Math.PI / 2 - (Math.PI * i) / 8
    const a1 = -Math.PI / 2 - (Math.PI * (i + 1)) / 8
    const amid = (a0 + a1) / 2
    const midX = SWcx + R * Math.cos(amid)
    const midZ = SWcz + R * Math.sin(amid)
    const segLen = 2 * R * Math.sin(Math.PI / 16) + 14
    const angle = -amid + Math.PI / 2
    arcSegments.push(
      <mesh key={`sw${i}`} position={[midX, 0, midZ]} rotation={[0, angle, 0]} receiveShadow>
        <boxGeometry args={[14, 0.3, segLen]} />
        {trackMat}
      </mesh>
    )
  }

  return (
    <group>
      {/* Straight 1 — START */}
      <mesh position={[0, 0, 50]} receiveShadow>
        <boxGeometry args={[160, 0.3, 14]} />
        {trackMat}
      </mesh>
      {/* Straight 2 — BACK */}
      <mesh position={[0, 0, -50]} receiveShadow>
        <boxGeometry args={[160, 0.3, 14]} />
        {trackMat}
      </mesh>
      {/* Arc segments */}
      {arcSegments}
    </group>
  )
}

// ─── Pit lane (original — wall strip along north straight) ──────────────────
function PitLaneGantry() {
  return (
    <group>
      {/* Pit surface */}
      <mesh position={[-30, -0.01, 58]} receiveShadow>
        <boxGeometry args={[60, 0.25, 8]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
      </mesh>
      {/* Pit wall strip */}
      <mesh position={[-30, 0.4, 54.5]}>
        <boxGeometry args={[60, 0.8, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[-55 + i * 10, 0.4, 54.5]}>
          <boxGeometry args={[4, 0.8, 0.42]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#cc0000' : '#ffffff'} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Grand Stands — two stadium stands along main straight ───────────────────
const TIER_COLORS: string[] = ['#cc2200', '#002299', '#cc2200', '#002299']

function GrandStands() {
  const tierColors = useMemo(() => TIER_COLORS, [])

  const Stand = ({ xBase, xDir }: { xBase: number; xDir: 1 | -1 }) => (
    <group position={[xBase, 0, 0]}>
      {/* Base structure */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[8, 0.5, 40]} />
        <meshStandardMaterial color="#555566" roughness={0.9} />
      </mesh>
      {/* 4 seating tiers — staircase shape stepping inward toward track */}
      {([0, 1, 2, 3] as const).map((tier) => (
        <mesh
          key={tier}
          position={[xDir * tier * -1.5, 1 + tier * 1.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[6, 1.5, 40]} />
          <meshStandardMaterial color={tierColors[tier]} roughness={0.8} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[8, 0.3, 42]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Roof support pillars */}
      {([-18, -6, 6, 18] as const).map((pz) => (
        <mesh key={pz} position={[0, 3.5, pz]}>
          <cylinderGeometry args={[0.2, 0.2, 7, 6]} />
          <meshStandardMaterial color="#888888" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )

  return (
    <group>
      <Stand xBase={-22} xDir={1} />
      <Stand xBase={22} xDir={-1} />
    </group>
  )
}

// ─── Sponsor Banners — vertical boards along outer fence ─────────────────────
const BANNER_DEFS: { x: number; z: number; color: string }[] = [
  { x: -28, z: -20, color: '#ff3300' },
  { x: -28, z:   0, color: '#0033ff' },
  { x: -28, z:  20, color: '#ffcc00' },
  { x:  28, z: -20, color: '#ffcc00' },
  { x:  28, z:   0, color: '#ff3300' },
  { x:  28, z:  20, color: '#0033ff' },
]

function SponsorBanners() {
  return (
    <group>
      {BANNER_DEFS.map(({ x, z, color }, i) => (
        <group key={i} position={[x, 2, z]}>
          <mesh>
            <boxGeometry args={[0.2, 4, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
          <pointLight
            position={[0, 0, 0]}
            intensity={1.5}
            distance={10}
            color={color}
          />
        </group>
      ))}
    </group>
  )
}

// ─── Pit Lane — right-side service area ──────────────────────────────────────
function PitLane() {
  // 4 garages at x≈26-36, spread along z=-10 to +10
  const garageZ = [-10, -3.5, 3.5, 10] as const
  // 4 warning cones at pit lane entrance (x=24, z spread)
  const conePositions: [number, number, number][] = [
    [24, 0.4, -12],
    [24, 0.4, -4],
    [24, 0.4,  4],
    [24, 0.4, 12],
  ]

  return (
    <group>
      {/* Pit surface */}
      <mesh position={[30, 0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.05, 30]} />
        <meshStandardMaterial color="#333333" roughness={0.95} />
      </mesh>
      {/* Pit garages */}
      {garageZ.map((gz, i) => (
        <mesh key={i} position={[34, 1, gz]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2, 5]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* Warning cones */}
      {conePositions.map(([cx, cy, cz], i) => (
        <mesh key={i} position={[cx, cy, cz]} castShadow>
          <coneGeometry args={[0.3, 0.8, 6]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff6600"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Center line dashes ──────────────────────────────────────────────────────
function CenterDashes() {
  const dashes: JSX.Element[] = []
  // Straight 1
  for (let x = -76; x <= 76; x += 8) {
    dashes.push(
      <mesh key={`s1${x}`} position={[x, 0.2, 50]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 0.05, 3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    )
  }
  // Straight 2
  for (let x = -76; x <= 76; x += 8) {
    dashes.push(
      <mesh key={`s2${x}`} position={[x, 0.2, -50]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.2, 0.05, 3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    )
  }
  return <group>{dashes}</group>
}

// ─── Kerb stripes at turn entries ────────────────────────────────────────────
function Kerbs() {
  const kerbs: JSX.Element[] = []
  // NE entry kerb — right edge of straight 1 at x=75-80
  for (let i = 0; i < 6; i++) {
    kerbs.push(
      <mesh key={`ker1${i}`} position={[66 + i * 2.5, 0.15, 57]}>
        <boxGeometry args={[2.4, 0.3, 1.2]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ff2222' : '#ffffff'} />
      </mesh>
    )
  }
  // SW entry kerb
  for (let i = 0; i < 6; i++) {
    kerbs.push(
      <mesh key={`ker2${i}`} position={[-66 - i * 2.5, 0.15, -57]}>
        <boxGeometry args={[2.4, 0.3, 1.2]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ff2222' : '#ffffff'} />
      </mesh>
    )
  }
  return <group>{kerbs}</group>
}

// ─── Spectator stands (instanced colored boxes) ─────────────────────────────
const SPECTATOR_COLORS = ['#ff4444', '#4488ff', '#ffcc44', '#44cc44', '#ff88cc']
const SPECTATOR_COUNT = 20

function SpectatorStands() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const _dummy = useRef(new THREE.Object3D())

  // Build per-instance color array and base transforms
  const { colors, positions } = useMemo(() => {
    const pos: [number, number, number][] = []
    const col: THREE.Color[] = []
    let idx = 0
    // 2 rows × 10 spectators on each side
    // Side A: x = +15, Side B: x = -15, z spread from 10 to 40 (step ~3.3)
    for (let side = 0; side < 2; side++) {
      const xBase = side === 0 ? 15 : -15
      for (let j = 0; j < 10; j++) {
        const z = 10 + j * 3.3
        const y = 0.3 + (side % 2) * 0.05  // slight height variation
        pos.push([xBase, y, z])
        col.push(new THREE.Color(SPECTATOR_COLORS[idx % SPECTATOR_COLORS.length]))
        idx++
      }
    }
    return { colors: col, positions: pos }
  }, [])

  // Assign colors to instancedMesh via instanceColor
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = _dummy.current
    for (let i = 0; i < SPECTATOR_COUNT; i++) {
      const [px, py, pz] = positions[i]!
      dummy.position.set(px, py, pz)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, colors[i]!)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [colors, positions])

  // Mexican wave + color flash animation
  const timeRef = useRef(0)
  const flashTimerRef = useRef(0)
  const flashStateRef = useRef<boolean[]>(Array(SPECTATOR_COUNT).fill(false))

  // Wave constants
  const WAVE_SPEED = 2.5
  const WAVE_SPACING = 0.3
  const WAVE_HEIGHT = 1.2

  // Flash colors
  const FLASH_COLOR_A = new THREE.Color('#ffffff')
  const FLASH_COLOR_B = new THREE.Color('#ffff44')

  useFrame((_s, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    timeRef.current += delta
    flashTimerRef.current += 1

    const t = timeRef.current

    // Every ~120 frames: randomly flash ~20% of crowd members
    if (flashTimerRef.current >= 120) {
      flashTimerRef.current = 0
      for (let i = 0; i < SPECTATOR_COUNT; i++) {
        flashStateRef.current[i] = Math.random() < 0.2
      }
    }

    const dummy = _dummy.current
    for (let i = 0; i < SPECTATOR_COUNT; i++) {
      const [px, py, pz] = positions[i]!

      // Mexican wave: members pop up sequentially
      const wave = Math.max(0, Math.sin(t * WAVE_SPEED - i * WAVE_SPACING)) * WAVE_HEIGHT
      const scaleY = 1.0 + wave * 0.8
      dummy.position.set(px, py + wave * 0.5, pz)
      dummy.scale.set(1, scaleY, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      // Color flash: briefly swap to highlight color then fade back
      if (flashStateRef.current[i]) {
        const flashColor = i % 2 === 0 ? FLASH_COLOR_A : FLASH_COLOR_B
        mesh.setColorAt(i, flashColor)
      } else {
        mesh.setColorAt(i, colors[i]!)
      }
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SPECTATOR_COUNT]} castShadow frustumCulled={false}>
      <boxGeometry args={[0.4, 0.6, 0.2]} />
      <meshStandardMaterial vertexColors roughness={0.7} />
    </instancedMesh>
  )
}

// ─── Track heat shimmer (start zone) ────────────────────────────────────────
const shimmerVertGlsl = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const shimmerFragGlsl = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(1.0, 0.5 + sin(vUv.x * 20.0 + iTime * 3.0) * 0.1, 0.0, 0.06);
  }
`

function TrackHeatShimmer() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms['iTime']!.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 25]}>
      <planeGeometry args={[30, 50]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={shimmerVertGlsl}
        fragmentShader={shimmerFragGlsl}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Ground planes ──────────────────────────────────────────────────────────
function GroundPlanes() {
  return (
    <>
      {/* Outer grass */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.3, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[300, 0.5, 300]} />
          <meshStandardMaterial color="#4aaa28" roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Infield grass oval */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[130, 85]} />
        <meshStandardMaterial color="#5dcf2a" roughness={0.9} />
      </mesh>
    </>
  )
}

// ─── Circuit billboards ──────────────────────────────────────────────────────
const BILLBOARD_VERT = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const BILLBOARD_FRAG = `
  uniform float iTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float border = step(0.05, vUv.x) * step(vUv.x, 0.95) * step(0.08, vUv.y) * step(vUv.y, 0.92);
    float stripe = step(0.5, fract(vUv.x * 5.0 + iTime * 0.4));
    float pulse = 0.7 + 0.3 * sin(iTime * 2.0);
    vec3 col = mix(uColor * 0.3, uColor, stripe) * pulse;
    vec3 frame = uColor * (1.0 - border) * 1.5;
    gl_FragColor = vec4(col * border + frame * (1.0 - border), 1.0);
  }
`

const BILLBOARD_COLORS = [
  [1.0, 0.2, 0.4],
  [0.2, 0.6, 1.0],
  [1.0, 0.8, 0.1],
  [0.3, 1.0, 0.5],
  [0.9, 0.3, 1.0],
  [0.1, 0.9, 0.9],
] as const

const BILLBOARD_POSITIONS: { pos: [number,number,number]; rotY: number; colorIdx: number }[] = [
  { pos: [60, 5, 80],    rotY: 0,             colorIdx: 0 },
  { pos: [-60, 5, 80],   rotY: 0,             colorIdx: 1 },
  { pos: [100, 5, 40],   rotY: Math.PI / 2,   colorIdx: 2 },
  { pos: [100, 5, -40],  rotY: Math.PI / 2,   colorIdx: 3 },
  { pos: [60, 5, -80],   rotY: Math.PI,       colorIdx: 4 },
  { pos: [-60, 5, -80],  rotY: Math.PI,       colorIdx: 5 },
  { pos: [-100, 5, 40],  rotY: -Math.PI / 2,  colorIdx: 0 },
  { pos: [-100, 5, -40], rotY: -Math.PI / 2,  colorIdx: 1 },
  { pos: [0, 5, 80],     rotY: 0,             colorIdx: 2 },
  { pos: [0, 5, -80],    rotY: Math.PI,       colorIdx: 3 },
  { pos: [110, 5, 0],    rotY: Math.PI / 2,   colorIdx: 4 },
  { pos: [-110, 5, 0],   rotY: -Math.PI / 2,  colorIdx: 5 },
]

function CircuitBillboard({ pos, rotY, colorIdx }: { pos: [number,number,number]; rotY: number; colorIdx: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const color = BILLBOARD_COLORS[colorIdx]!
  const uniforms = useMemo(() => ({
    iTime: { value: colorIdx * 1.1 },
    uColor: { value: new THREE.Vector3(...color) },
  }), [color, colorIdx])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.elapsedTime + colorIdx * 1.1
  })
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Billboard back frame */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[10, 5, 0.3]} />
        <meshStandardMaterial color="#222233" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Animated face */}
      <mesh>
        <planeGeometry args={[10, 5]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={BILLBOARD_VERT}
          fragmentShader={BILLBOARD_FRAG}
          uniforms={uniforms}
        />
      </mesh>
      {/* Support pole */}
      <mesh position={[0, -3.5, -0.1]} castShadow>
        <boxGeometry args={[0.4, 2, 0.4]} />
        <meshStandardMaterial color="#444455" metalness={0.6} />
      </mesh>
    </group>
  )
}

function CircuitBillboards() {
  return (
    <>
      {BILLBOARD_POSITIONS.map((b, i) => (
        <CircuitBillboard key={i} pos={b.pos} rotY={b.rotY} colorIdx={b.colorIdx} />
      ))}
    </>
  )
}

// ─── Pit crew robots ─────────────────────────────────────────────────────────
type RobotDef = {
  pos: [number, number, number]
  pose: 'bent' | 'arms-up' | 'crouch'
  phase: number
}

const ROBOT_DEFS: RobotDef[] = [
  // Left side of pit (x≈27)
  { pos: [27, 0, -8],  pose: 'bent',     phase: 0.0 },
  { pos: [27, 0,  0],  pose: 'arms-up',  phase: 1.0 },
  { pos: [27, 0,  8],  pose: 'crouch',   phase: 2.0 },
  // Right side of pit (x≈33)
  { pos: [33, 0, -8],  pose: 'crouch',   phase: 0.5 },
  { pos: [33, 0,  0],  pose: 'bent',     phase: 1.5 },
  { pos: [33, 0,  8],  pose: 'arms-up',  phase: 2.5 },
]

function PitRobot({ pos, pose, phase }: RobotDef) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef  = useRef<THREE.Mesh>(null)
  const leftArmRef  = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const leftLegRef  = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = pos[1] + Math.sin(t * 2 + phase) * 0.05
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.x = pose === 'bent' ? 0.4 : 0
    }
    const armAngle = pose === 'arms-up' ? -1.1 : 0.5
    if (leftArmRef.current)  leftArmRef.current.rotation.z  =  armAngle
    if (rightArmRef.current) rightArmRef.current.rotation.z = -armAngle
    const legBend = pose === 'crouch' ? 0.4 : 0
    if (leftLegRef.current)  leftLegRef.current.rotation.x  = legBend
    if (rightLegRef.current) rightLegRef.current.rotation.x = legBend
  })

  const crouchY = pose === 'crouch' ? -0.2 : 0

  return (
    <group ref={groupRef} position={pos}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.8 + crouchY, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.4]} />
        <meshStandardMaterial color="#ff6600" roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.55 + crouchY, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#ffaa00" roughness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 1.62 + crouchY, 0.21]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.12, 1.62 + crouchY, 0.21]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      {/* Left arm */}
      <mesh ref={leftArmRef} position={[-0.45, 0.9 + crouchY, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
        <meshStandardMaterial color="#ff6600" roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh ref={rightArmRef} position={[0.45, 0.9 + crouchY, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
        <meshStandardMaterial color="#ff6600" roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <mesh ref={leftLegRef} position={[-0.18, 0.2 + crouchY, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 6]} />
        <meshStandardMaterial color="#cc4400" roughness={0.8} />
      </mesh>
      {/* Right leg */}
      <mesh ref={rightLegRef} position={[0.18, 0.2 + crouchY, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 6]} />
        <meshStandardMaterial color="#cc4400" roughness={0.8} />
      </mesh>
    </group>
  )
}

function PitCrewRobots() {
  return (
    <group>
      {ROBOT_DEFS.map((def, i) => (
        <PitRobot key={i} {...def} />
      ))}
    </group>
  )
}

// ─── Tire stacks in pit area ──────────────────────────────────────────────────
type TireStackDef = {
  pos: [number, number, number]
  stripeColor: string
}

const TIRE_STACK_DEFS: TireStackDef[] = [
  { pos: [24,  0,  -6], stripeColor: '#ff0000' },
  { pos: [24,  0,   0], stripeColor: '#00aaff' },
  { pos: [24,  0,   6], stripeColor: '#ff0000' },
  { pos: [36,  0,  -4], stripeColor: '#00aaff' },
  { pos: [36,  0,   4], stripeColor: '#ff0000' },
]

function TireStack({ pos, stripeColor }: TireStackDef) {
  const tireCount = 3 + Math.floor(Math.abs(pos[2]) % 2)  // 3 or 4 tires
  return (
    <group position={pos}>
      {Array.from({ length: tireCount }, (_, i) => (
        <group key={i} position={[0, i * 0.72, 0]}>
          {/* Black rubber tire */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.8, 0.35, 8, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.95} />
          </mesh>
          {/* Team color stripe */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.82, 0.08, 6, 16]} />
            <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TireStacks() {
  return (
    <group>
      {TIRE_STACK_DEFS.map((def, i) => (
        <TireStack key={i} {...def} />
      ))}
    </group>
  )
}

// ─── Checkered flags at start/finish ─────────────────────────────────────────
const FLAG_POLE_POSITIONS: [number, number, number][] = [
  [-8, 0,  2],
  [-4, 0,  2],
  [ 4, 0,  2],
  [ 8, 0,  2],
]

function CheckeredFlag({ pos }: { pos: [number, number, number] }) {
  const flagRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.3
    }
  })

  // 4×3 checkerboard sub-boxes
  const checks: JSX.Element[] = []
  const cols = 4
  const rows = 3
  const cellW = 0.5
  const cellH = 0.5
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isBlack = (r + c) % 2 === 0
      checks.push(
        <mesh
          key={`${r}-${c}`}
          position={[
            -((cols - 1) * cellW) / 2 + c * cellW,
            -((rows - 1) * cellH) / 2 + r * cellH,
            0,
          ]}
        >
          <boxGeometry args={[cellW, cellH, 0.06]} />
          <meshStandardMaterial color={isBlack ? '#111111' : '#ffffff'} />
        </mesh>
      )
    }
  }

  return (
    <group position={pos}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 5, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Animated flag group anchored at pole top */}
      <group ref={flagRef} position={[1.0, 5.0, 0]}>
        {checks}
      </group>
    </group>
  )
}

function CheckeredFlags() {
  return (
    <group position={[0, 0, 50]}>
      {FLAG_POLE_POSITIONS.map((p, i) => (
        <CheckeredFlag key={i} pos={p} />
      ))}
    </group>
  )
}

// ─── Rain system ─────────────────────────────────────────────────────────────
const RAIN_COUNT = 800

type RainParticle = {
  x: number
  y: number
  z: number
  speed: number
}

function RainSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const _rain_dummy = useRef(new THREE.Object3D())

  const particles = useMemo<RainParticle[]>(() =>
    Array.from({ length: RAIN_COUNT }, () => ({
      x: (Math.random() - 0.5) * 100,        // -50 to 50
      y: Math.random() * 32 - 2,              // -2 to 30
      z: (Math.random() - 0.5) * 160,         // -80 to 80
      speed: 0.3 + Math.random() * 0.2,       // 0.3 to 0.5
    }))
  , [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = _rain_dummy.current
    for (let i = 0; i < RAIN_COUNT; i++) {
      const p = particles[i]!
      p.y -= p.speed
      p.x += 0.02
      if (p.y < -2) {
        p.y = 30
        p.x = (Math.random() - 0.5) * 100
        p.z = (Math.random() - 0.5) * 160
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.set(0.02, 0.3, 0.02)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#aaccff" transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── Wet track surface with ripples ──────────────────────────────────────────
type RippleDef = {
  x: number
  z: number
  phase: number
  speed: number
}

const RIPPLE_DEFS: RippleDef[] = Array.from({ length: 12 }, (_, i) => ({
  x: (Math.random() - 0.5) * 70,
  z: (Math.random() - 0.5) * 70,
  phase: (i / 12) * Math.PI * 2,
  speed: 0.6 + Math.random() * 0.4,
}))

function WetTrack() {
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([])
  const ringRadii = useRef<number[]>(RIPPLE_DEFS.map((r) => (r.phase / (Math.PI * 2)) * 4))

  useFrame((_s, delta) => {
    for (let i = 0; i < RIPPLE_DEFS.length; i++) {
      const mesh = rippleRefs.current[i]
      if (!mesh) continue
      ringRadii.current[i]! += delta * RIPPLE_DEFS[i]!.speed
      if (ringRadii.current[i]! > 4) ringRadii.current[i] = 0
      const r = ringRadii.current[i]!
      mesh.scale.set(r === 0 ? 0.001 : r, r === 0 ? 0.001 : r, 1)
    }
  })

  return (
    <group>
      {/* Wet reflective layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#111122"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      {/* Ripple rings */}
      {RIPPLE_DEFS.map((rd, i) => (
        <mesh
          key={i}
          ref={(el) => { rippleRefs.current[i] = el }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[rd.x, 0.03, rd.z]}
        >
          <torusGeometry args={[1, 0.05 + (i % 3) * 0.05, 6, 32]} />
          <meshStandardMaterial
            color="#4466aa"
            emissive="#4466aa"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Spray particle cluster ───────────────────────────────────────────────────
type SprayParticle = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

const SPRAY_POSITIONS: [number, number, number][] = [
  [-7,  0.15,  50],
  [ 7,  0.15,  50],
  [-7,  0.15, -50],
  [ 7,  0.15, -50],
]

const SPRAY_PER_CLUSTER = 20

function SprayCluster({ origin }: { origin: [number, number, number] }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  const particles = useMemo<SprayParticle[]>(() =>
    Array.from({ length: SPRAY_PER_CLUSTER }, () => ({
      x: origin[0] + (Math.random() - 0.5) * 0.5,
      y: origin[1],
      z: origin[2] + (Math.random() - 0.5) * 0.5,
      vx: (Math.random() - 0.5) * 0.08,
      vy: 0.05 + Math.random() * 0.1,
      vz: (Math.random() - 0.5) * 0.08,
    }))
  , [origin])

  useFrame(() => {
    for (let i = 0; i < SPRAY_PER_CLUSTER; i++) {
      const p = particles[i]!
      const mesh = meshRefs.current[i]
      if (!mesh) continue
      p.x += p.vx
      p.y += p.vy
      p.z += p.vz
      p.vy -= 0.003
      if (p.y < origin[1]) {
        p.x = origin[0] + (Math.random() - 0.5) * 0.5
        p.y = origin[1]
        p.z = origin[2] + (Math.random() - 0.5) * 0.5
        p.vx = (Math.random() - 0.5) * 0.08
        p.vy = 0.05 + Math.random() * 0.1
        p.vz = (Math.random() - 0.5) * 0.08
      }
      mesh.position.set(p.x, p.y, p.z)
    }
  })

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[p.x, p.y, p.z]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#aaccff" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Storm lighting & atmosphere ──────────────────────────────────────────────
function StormLighting() {
  return (
    <>
      <hemisphereLight color="#112233" groundColor="#000011" intensity={0.4} />
      <primitive object={new THREE.Fog('#1a2233', 20, 80)} attach="fog" />
      {SPRAY_POSITIONS.map((origin, i) => (
        <SprayCluster key={i} origin={origin} />
      ))}
    </>
  )
}

// ─── Speed trail blur lines on track surface ──────────────────────────────────
function SpeedTrail() {
  const trails = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      x: -7 + (i / 7) * 14,
      z: 50,
    }))
  }, [])

  return (
    <group>
      {trails.map((t, i) => (
        <mesh key={i} position={[t.x, 0.22, t.z]}>
          <boxGeometry args={[0.15, 0.02, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#aaaaff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Celebration flags strung across the podium ───────────────────────────────
const FLAG_COLORS = ['#ff2222', '#ffdd00', '#2244ff', '#22cc44', '#ff66cc', '#ffffff', '#ff8800'] as const
const CELE_POLE_X = [-8, -4, 0, 4, 8]  // relative to podium origin
const CELE_POLE_H = 6

type CelebFlagState = {
  baseRot: number
}

function CelebrationFlags() {
  const flagRefs = useRef<(THREE.Mesh | null)[]>([])
  const flagStates = useMemo<CelebFlagState[]>(() =>
    Array.from({ length: (CELE_POLE_X.length - 1) * 2 }, (_, i) => ({
      baseRot: i * 0.5,
    }))
  , [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < flagStates.length; i++) {
      const mesh = flagRefs.current[i]
      if (!mesh) continue
      mesh.rotation.z = Math.sin(t * 3 + flagStates[i]!.baseRot) * 0.15
    }
  })

  // Build flag panels between consecutive poles (2 panels per gap, upper & lower)
  const flagPanels: JSX.Element[] = []
  let flagIdx = 0
  for (let pi = 0; pi < CELE_POLE_X.length - 1; pi++) {
    const x0 = PODIUM_ORIGIN[0] + (CELE_POLE_X[pi] ?? 0)
    const x1 = PODIUM_ORIGIN[0] + (CELE_POLE_X[pi + 1] ?? 0)
    const xMid = (x0 + x1) / 2
    const zBase = PODIUM_ORIGIN[2] - 2  // slightly in front of poles
    const topY = CELE_POLE_H - 0.5 + PODIUM_ORIGIN[1]
    const color = FLAG_COLORS[pi % FLAG_COLORS.length]!

    // Catenary tilt: flags between poles hang at a slight angle
    const tiltAngle = 0.1 + (pi % 2) * 0.05

    for (let row = 0; row < 2; row++) {
      const yOff = row === 0 ? 0 : -1.1
      flagPanels.push(
        <mesh
          key={`f${flagIdx}`}
          ref={(el) => { flagRefs.current[flagIdx] = el }}
          position={[xMid, topY + yOff, zBase]}
          rotation={[0, 0, tiltAngle * (pi % 2 === 0 ? 1 : -1)]}
        >
          <boxGeometry args={[1, 0.8, 0.05]} />
          <meshStandardMaterial
            color={FLAG_COLORS[(flagIdx) % FLAG_COLORS.length]!}
            emissive={FLAG_COLORS[(flagIdx) % FLAG_COLORS.length]!}
            emissiveIntensity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )
      flagIdx++
    }
  }

  return (
    <group>
      {/* Flag poles */}
      {CELE_POLE_X.map((px, i) => (
        <mesh
          key={i}
          position={[PODIUM_ORIGIN[0] + px, CELE_POLE_H / 2 + PODIUM_ORIGIN[1], PODIUM_ORIGIN[2] - 2]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.08, CELE_POLE_H, 6]} />
          <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* String line between poles */}
      {CELE_POLE_X.slice(0, -1).map((px, i) => {
        const x0 = PODIUM_ORIGIN[0] + (CELE_POLE_X[i] ?? 0)
        const x1 = PODIUM_ORIGIN[0] + (CELE_POLE_X[i + 1] ?? 0)
        return (
          <mesh
            key={i}
            position={[(x0 + x1) / 2, CELE_POLE_H + PODIUM_ORIGIN[1], PODIUM_ORIGIN[2] - 2]}
          >
            <boxGeometry args={[Math.abs(x1 - x0), 0.04, 0.04]} />
            <meshStandardMaterial color="#bbbbbb" metalness={0.5} />
          </mesh>
        )
      })}

      {/* Animated flag panels */}
      {flagPanels}

      {/* Team sponsor boards at sides of podium */}
      {([-1, 1] as const).map((side, i) => {
        const bx = PODIUM_ORIGIN[0] + side * 12
        const color = i === 0 ? '#ff2222' : '#2244ff'
        return (
          <group key={i} position={[bx, 3, PODIUM_ORIGIN[2]]}>
            {/* Board backing */}
            <mesh castShadow>
              <boxGeometry args={[4, 3, 0.1]} />
              <meshStandardMaterial color="#111111" roughness={0.8} />
            </mesh>
            {/* Emissive panel */}
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[3.5, 2.5, 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[0, 0, 1]} color={color} intensity={3} distance={8} />
          </group>
        )
      })}
    </group>
  )
}

// ─── TV Helicopter ────────────────────────────────────────────────────────────
function TVHelicopter() {
  const groupRef      = useRef<THREE.Group>(null)
  const mainRotorRef  = useRef<THREE.Group>(null)
  const tailRotorRef  = useRef<THREE.Group>(null)
  const light1Ref     = useRef<THREE.Mesh>(null)
  const light2Ref     = useRef<THREE.Mesh>(null)
  const beaconRef     = useRef<THREE.Mesh>(null)
  const angle         = useRef(0)

  const RADIUS = 60
  const HEIGHT = 40
  const SPEED  = 0.15   // rad/s

  useFrame((_s, delta) => {
    angle.current += delta * SPEED
    const a  = angle.current
    const nx = Math.cos(a + delta * SPEED)
    const nz = Math.sin(a + delta * SPEED)

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(a) * RADIUS,
        HEIGHT,
        Math.sin(a) * RADIUS,
      )
      // Face direction of travel
      groupRef.current.rotation.y = Math.atan2(nx, nz) + Math.PI
    }
    if (mainRotorRef.current) mainRotorRef.current.rotation.y += 0.3
    if (tailRotorRef.current) tailRotorRef.current.rotation.z += 0.25

    // Blink landing lights every ~0.5 s
    const blink = Math.sin(_s.clock.elapsedTime * 8) > 0
    const mat1 = light1Ref.current?.material as THREE.MeshStandardMaterial | null
    const mat2 = light2Ref.current?.material as THREE.MeshStandardMaterial | null
    if (mat1) mat1.emissiveIntensity = blink ? 6 : 0.5
    if (mat2) mat2.emissiveIntensity = blink ? 6 : 0.5

    // Beacon alternates
    const beaconMat = beaconRef.current?.material as THREE.MeshStandardMaterial | null
    if (beaconMat) beaconMat.emissiveIntensity = blink ? 4 : 0
  })

  return (
    <group ref={groupRef}>
      {/* Fuselage */}
      <mesh scale={[2.5, 0.9, 1.5]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Tail boom — extends backward (+Z local) */}
      <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.12, 3, 8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>

      {/* Tail rotor — at tail tip */}
      <group ref={tailRotorRef} position={[0, 0.1, 3.9]}>
        {/* Blade 1 */}
        <mesh>
          <boxGeometry args={[0.05, 1.5, 0.15]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        {/* Blade 2 (90°) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.05, 1.5, 0.15]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      </group>

      {/* Main rotor hub */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.7} />
      </mesh>

      {/* Main rotor blades */}
      <group ref={mainRotorRef} position={[0, 1.25, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.05, 4]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.2, 0.05, 4]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>
      </group>

      {/* Landing skid – left */}
      <group position={[-1.2, -0.8, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.5, 6]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.6} />
        </mesh>
        {/* Strut front */}
        <mesh position={[0.6, 0.5, -0.8]} rotation={[0.4, 0, -0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
        {/* Strut rear */}
        <mesh position={[0.6, 0.5, 0.8]} rotation={[-0.4, 0, -0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      </group>

      {/* Landing skid – right */}
      <group position={[1.2, -0.8, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 2.5, 6]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.6} />
        </mesh>
        <mesh position={[-0.6, 0.5, -0.8]} rotation={[0.4, 0, 0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
        <mesh position={[-0.6, 0.5, 0.8]} rotation={[-0.4, 0, 0.4]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      </group>

      {/* TV logo on fuselage side */}
      <mesh position={[1.3, 0.1, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.6]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={1.2} />
      </mesh>

      {/* Camera pod under nose */}
      <mesh position={[0, -0.65, -1.3]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Camera/search light cone */}
      <mesh position={[0, -1.0, -1.3]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.8, 1.8, 10]} />
        <meshStandardMaterial
          color="#ffffcc"
          emissive="#ffffcc"
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[0, -2.5, -1.3]} color="#ffffcc" intensity={6} distance={30} />

      {/* Landing lights – blinking */}
      <mesh ref={light1Ref} position={[-0.9, -0.5, -1.2]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} />
      </mesh>
      <mesh ref={light2Ref} position={[0.9, -0.5, -1.2]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} />
      </mesh>

      {/* Red beacon on tail */}
      <mesh ref={beaconRef} position={[0, 0.35, 3.6]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
      </mesh>
    </group>
  )
}

// ─── Racing Drones ─────────────────────────────────────────────────────────────
function DroneMesh({ position, pathFn }: {
  position: [number, number, number]
  pathFn: (t: number) => [number, number, number]
}) {
  const groupRef = useRef<THREE.Group>(null)
  const r1 = useRef<THREE.Mesh>(null)
  const r2 = useRef<THREE.Mesh>(null)
  const r3 = useRef<THREE.Mesh>(null)
  const r4 = useRef<THREE.Mesh>(null)
  const tRef = useRef(0)

  useFrame((_s, delta) => {
    tRef.current += delta * 0.4
    const [px, py, pz] = pathFn(tRef.current)
    if (groupRef.current) groupRef.current.position.set(px, py, pz)
    // spin rotors
    for (const r of [r1, r2, r3, r4]) {
      if (r.current) r.current.rotation.y += 0.5
    }
  })

  const armColor = "#333333"
  // 4 arms at 45° increments, each 0.4 long
  const arms = ([45, 135, 225, 315] as const).map((deg, i) => {
    const rad = (deg * Math.PI) / 180
    const ax  = Math.cos(rad) * 0.35
    const az  = Math.sin(rad) * 0.35
    const rotors = [r1, r2, r3, r4]
    return (
      <group key={i} position={[ax, 0, az]}>
        {/* Arm */}
        <mesh rotation={[0, -rad, 0]}>
          <boxGeometry args={[0.7, 0.05, 0.07]} />
          <meshStandardMaterial color={armColor} />
        </mesh>
        {/* Rotor disc */}
        <mesh ref={rotors[i]} position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 8]} />
          <meshStandardMaterial color="#555555" transparent opacity={0.6} />
        </mesh>
        {/* Corner LED */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#ff0000" : "#00ff00"}
            emissive={i % 2 === 0 ? "#ff0000" : "#00ff00"}
            emissiveIntensity={3}
          />
        </mesh>
      </group>
    )
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.6, 0.15, 0.6]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      {/* Camera */}
      <mesh position={[0, -0.1, -0.32]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {arms}
    </group>
  )
}

function DroneCamera() {
  // Drone 1 — follows the track close to ground
  const drone1Path = (t: number): [number, number, number] => {
    const total = OVAL_PATH.length
    const idx   = ((t * total * 0.6) % total + total) % total
    const i0    = Math.floor(idx) % total
    const i1    = (i0 + 1) % total
    const frac  = idx - Math.floor(idx)
    const p0    = OVAL_PATH[i0]!
    const p1    = OVAL_PATH[i1]!
    return [
      p0.x + (p1.x - p0.x) * frac,
      3,
      p0.z + (p1.z - p0.z) * frac,
    ]
  }

  // Drone 2 — hovers near pit lane entrance
  const drone2Path = (t: number): [number, number, number] => [
    28 + Math.sin(t * 0.7) * 3,
    8 + Math.sin(t * 1.3) * 0.6,
    0 + Math.cos(t * 0.5) * 4,
  ]

  return (
    <>
      <DroneMesh position={[0, 3, 50]} pathFn={drone1Path} />
      <DroneMesh position={[28, 8, 0]} pathFn={drone2Path} />
    </>
  )
}

// ─── JumboTron screens ────────────────────────────────────────────────────────
function JumboTron({ position, rotY }: {
  position: [number, number, number]
  rotY: number
}) {
  const speedRef    = useRef<THREE.Mesh>(null)
  const liveRef     = useRef<THREE.Mesh>(null)
  const speedVal    = useRef(0)
  const liveTimer   = useRef(0)

  useFrame((_s, delta) => {
    speedVal.current += delta * 18
    if (speedVal.current > 320) speedVal.current = 180

    liveTimer.current += delta
    // Pulse "LIVE" indicator
    const liveMat = liveRef.current?.material as THREE.MeshStandardMaterial | null
    if (liveMat) liveMat.emissiveIntensity = 1.5 + Math.sin(liveTimer.current * 4) * 0.8

    // Animate speed bar width — scale x
    if (speedRef.current) {
      const frac = Math.min(speedVal.current / 320, 1)
      speedRef.current.scale.x = 0.1 + frac * 0.9
    }
  })

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Back frame */}
      <mesh position={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[13, 9, 0.5]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Screen surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 8, 0.5]} />
        <meshStandardMaterial color="#001133" emissive="#001133" emissiveIntensity={0.8} />
      </mesh>

      {/* Support legs */}
      <mesh position={[-4, -6, -0.3]} castShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial color="#333344" metalness={0.7} />
      </mesh>
      <mesh position={[4, -6, -0.3]} castShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial color="#333344" metalness={0.7} />
      </mesh>

      {/* "LIVE" indicator dot */}
      <mesh ref={liveRef} position={[-4.5, 3.2, 0.3]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>

      {/* Red header bar — "LIVE BROADCAST" strip */}
      <mesh position={[0, 3.3, 0.28]}>
        <boxGeometry args={[8, 0.55, 0.1]} />
        <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* Speed bar background */}
      <mesh position={[0, -2.8, 0.28]}>
        <boxGeometry args={[9, 0.55, 0.1]} />
        <meshStandardMaterial color="#002244" emissive="#003366" emissiveIntensity={0.5} />
      </mesh>
      {/* Speed bar fill (animates) */}
      <mesh ref={speedRef} position={[-4.5, -2.8, 0.32]}>
        <boxGeometry args={[9, 0.45, 0.12]} />
        <meshStandardMaterial color="#00ccff" emissive="#00aaff" emissiveIntensity={1.5} />
      </mesh>

      {/* Track map outline — simplified oval using two arcs represented as thin boxes */}
      {/* Straight top */}
      <mesh position={[0, 0.6, 0.28]}>
        <boxGeometry args={[4, 0.12, 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} />
      </mesh>
      {/* Straight bottom */}
      <mesh position={[0, -0.6, 0.28]}>
        <boxGeometry args={[4, 0.12, 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} />
      </mesh>
      {/* Left curve (approximated) */}
      {([0, 1, 2, 3] as const).map((seg) => {
        const a = Math.PI / 2 + (seg / 4) * Math.PI
        return (
          <mesh
            key={seg}
            position={[-2.1 + Math.cos(a) * 0.55, Math.sin(a) * 0.6, 0.28]}
            rotation={[0, 0, a + Math.PI / 2]}
          >
            <boxGeometry args={[0.12, 0.6, 0.08]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} />
          </mesh>
        )
      })}
      {/* Right curve */}
      {([0, 1, 2, 3] as const).map((seg) => {
        const a = -Math.PI / 2 + (seg / 4) * Math.PI
        return (
          <mesh
            key={seg}
            position={[2.1 + Math.cos(a) * 0.55, Math.sin(a) * 0.6, 0.28]}
            rotation={[0, 0, a + Math.PI / 2]}
          >
            <boxGeometry args={[0.12, 0.6, 0.08]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} />
          </mesh>
        )
      })}

      {/* Position indicator dot on track map */}
      <mesh position={[0, 0.6, 0.32]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={3} />
      </mesh>

      {/* Screen glow light */}
      <pointLight position={[0, 0, 2]} color="#0033ff" intensity={3} distance={15} />
    </group>
  )
}

function JumboTrons() {
  return (
    <>
      {/* North grandstand screen — faces south toward track */}
      <JumboTron position={[0, 12, 75]} rotY={Math.PI} />
      {/* South grandstand screen — faces north toward track */}
      <JumboTron position={[0, 12, 25]} rotY={0} />
    </>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function RaceWorld() {
  // Grandstand audience positions — both sides of Start straight
  const audienceNorth: { x: number; z: number; tier: number; variant: string }[] = useMemo(() => {
    const chars = ['birb', 'bunny', 'cactoro', 'alien']
    const spots = []
    for (let t = 0; t < 3; t++) {
      for (let xi = 0; xi < 5; xi++) {
        spots.push({
          x: -40 + xi * 18 + t * 1.8,
          z: 60 + t * 4,
          tier: t,
          variant: chars[(t * 5 + xi) % 4]!,
        })
      }
    }
    return spots
  }, [])

  const audienceSouth: { x: number; z: number; tier: number; variant: string }[] = useMemo(() => {
    const chars = ['alien', 'cactoro', 'bunny', 'birb']
    const spots = []
    for (let t = 0; t < 3; t++) {
      for (let xi = 0; xi < 5; xi++) {
        spots.push({
          x: -40 + xi * 18 - t * 1.8,
          z: 40 - t * 4,
          tier: t,
          variant: chars[(t * 5 + xi) % 4]!,
        })
      }
    }
    return spots
  }, [])

  return (
    <>
      {/* ── Sky & atmosphere ── */}
      <GradientSky top="#0a1020" bottom="#203060" radius={480} />
      <Stars />
      <ambientLight intensity={0.15} color="#334466" />
      <directionalLight position={[40, 60, 20]} intensity={0.3} color="#7799bb" castShadow />

      {/* ── Storm lighting, fog & racing spray ── */}
      <StormLighting />

      {/* ── Ground ── */}
      <GroundPlanes />

      {/* ── Track surface ── */}
      <TrackSurface />
      <CenterDashes />
      <Kerbs />
      <PitLaneGantry />

      {/* ── New stadium grandstands, sponsor banners, and pit lane ── */}
      <GrandStands />
      <SponsorBanners />
      <PitLane />

      {/* ── Heat shimmer on straights ── */}
      <HeatShimmer position={[0, 0.18, 50]} size={[160, 14]} />
      <HeatShimmer position={[0, 0.18, -50]} size={[160, 14]} />

      {/* ── Start / Finish gantry ── */}
      <StartGantry />
      <Flag pos={[-8, 0, 50]} />
      <Flag pos={[8, 0, 50]} />

      {/* ── Grandstands — north side (z>50) ── */}
      <Grandstand pos={[-36, 0, 68]} side={1} />
      <Grandstand pos={[0, 0, 68]} side={1} />
      <Grandstand pos={[36, 0, 68]} side={1} />
      {/* Grandstands — south side (z<40) */}
      <Grandstand pos={[-36, 0, 32]} side={-1} />
      <Grandstand pos={[0, 0, 32]} side={-1} />
      <Grandstand pos={[36, 0, 32]} side={-1} />

      {/* ── Audience monsters in grandstands ── */}
      {audienceNorth.map((s, i) => (
        <GltfMonster
          key={`an${i}`}
          which={s.variant as 'birb' | 'bunny' | 'cactoro' | 'alien'}
          pos={[s.x, 1.5 + s.tier * 1.5, s.z]}
          scale={0.6}
          animation="Wave"
        />
      ))}
      {audienceSouth.map((s, i) => (
        <GltfMonster
          key={`as${i}`}
          which={s.variant as 'birb' | 'bunny' | 'cactoro' | 'alien'}
          pos={[s.x, 1.5 + s.tier * 1.5, s.z]}
          scale={0.6}
          animation="Wave"
        />
      ))}

      {/* ── 20 Floodlight poles around circuit ── */}
      {/* Along Start straight */}
      {[-60, -30, 0, 30, 60].map((x, i) => (
        <Floodlight key={`fl_n${i}`} pos={[x, 0, 64]} />
      ))}
      {[-60, -30, 0, 30, 60].map((x, i) => (
        <Floodlight key={`fl_s${i}`} pos={[x, 0, 28]} />
      ))}
      {/* Back straight */}
      {[-60, -30, 0, 30, 60].map((x, i) => (
        <Floodlight key={`fl_bk${i}`} pos={[x, 0, -64]} />
      ))}
      {/* Turn apex lights */}
      <Floodlight pos={[92, 0, 0]} />
      <Floodlight pos={[-92, 0, 0]} />

      {/* ── TreePine — outside circuit ── */}
      {[
        [0, 0, 90], [-30, 0, 100], [30, 0, 100],
        [-80, 0, 90], [80, 0, 90],
        [-110, 0, 30], [-110, 0, -30],
        [110, 0, 30], [110, 0, -30],
        [-80, 0, -90], [80, 0, -90],
        [-30, 0, -100], [30, 0, -100],
        [0, 0, -100], [-55, 0, 110],
        [55, 0, 110], [-55, 0, -110],
        [55, 0, -110], [-15, 0, 115],
        [15, 0, 115],
      ].map(([x, y, z], i) => (
        <TreePine key={`tp${i}`} pos={[x!, y!, z!]} />
      ))}

      {/* ── Rock formations in infield ── */}
      {[
        [20, 0, 10], [-20, 0, -10], [0, 0, 20],
        [35, 0, -15], [-35, 0, 15],
        [10, 0, -25], [-10, 0, 25],
        [40, 0, 5], [-40, 0, -5], [0, 0, -30],
      ].map(([x, y, z], i) => (
        <Rock key={`rk${i}`} pos={[x!, y!, z!]} />
      ))}

      {/* ── Lanterns along pit lane ── */}
      {[-55, -45, -35, -25, -15, -5, 5, 15].map((x, i) => (
        <Lantern key={`ln${i}`} pos={[x, 0, 62]} />
      ))}

      {/* ── Signs at circuit corners ── */}
      <Sign pos={[85, 0, 55]} rotY={Math.PI / 4} />
      <Sign pos={[85, 0, -55]} rotY={-Math.PI / 4} />
      <Sign pos={[-85, 0, -55]} rotY={Math.PI * 0.75} />
      <Sign pos={[-85, 0, 55]} rotY={-Math.PI * 0.75} />
      <Sign pos={[0, 0, -65]} rotY={0} />

      {/* ── Parked cars in pit lane ── */}
      <ParkedCar pos={[-50, 0, 58]} rotY={0} />
      <ParkedCar pos={[-25, 0, 58]} rotY={0} />
      <ParkedCar pos={[0, 0, 58]} rotY={0} />

      {/* ── AI cars driving the circuit ── */}
      {AI_CARS.map((car, i) => (
        <AICar key={`ai${i}`} {...car} />
      ))}

      {/* ── Coins on/near track ── */}
      <Coin pos={[-60, 1, 50]} />
      <Coin pos={[-40, 1, 50]} />
      <Coin pos={[-20, 1, 50]} />
      <Coin pos={[0, 1, 50]} />
      <Coin pos={[20, 1, 50]} />
      <Coin pos={[40, 1, 50]} />
      <Coin pos={[60, 1, 50]} />
      <Coin pos={[80, 1, 0]} />
      <Coin pos={[40, 1, -50]} />
      <Coin pos={[0, 1, -50]} />
      <Coin pos={[-40, 1, -50]} />
      <Coin pos={[-80, 1, 0]} />

      {/* ── Enemies ── */}
      <Enemy pos={[-20, 1, 60]} />
      <Enemy pos={[20, 1, 60]} />
      <Enemy pos={[0, 1, 10]} />

      {/* ── NPCs at pit lane ── */}
      <NPC pos={[-40, 0, 62]} label="МЕХАНИК" />
      <NPC pos={[-10, 0, 62]} label="ДИКТОР" />
      <NPC pos={[15, 0, 62]} label="ЧЕМПИОН" />

      {/* ── Ramp obstacles on track ── */}
      <Ramp pos={[0, 0.1, 45]} rotY={0} />
      <Ramp pos={[60, 0.1, 0]} rotY={Math.PI / 2} />
      <Ramp pos={[-60, 0.1, 0]} rotY={-Math.PI / 2} />

      {/* ── Winner's Trophy near finish line ── */}
      <Trophy pos={[0, 1, 52]} />

      {/* ── BossGolem — Судья Гонки at start/finish line ── */}
      <BossGolem pos={[-12, 0, 50]} rotY={Math.PI / 2} scale={1.4} />
      <BossGolem pos={[12, 0, 50]} rotY={-Math.PI / 2} scale={1.4} />

      {/* ── CrystalCluster — Trophy Crystals in winner's circle / podium area ── */}
      {/* Podium zone: infield near start straight, centred around x=0 z=20 */}
      {[
        [-8, 0, 18], [-4, 0, 15], [0, 0, 14], [4, 0, 15], [8, 0, 18],
        [-6, 0, 22], [0, 0, 22], [6, 0, 22],
        [-3, 0, 26], [3, 0, 26],
      ].map(([x, y, z], i) => (
        <CrystalCluster key={`cc${i}`} pos={[x!, y!, z!]} scale={0.9 + (i % 3) * 0.2} rotY={(i * Math.PI) / 5} />
      ))}

      {/* ── LavaRock — dramatic terrain around outer oval edges ── */}
      {[
        /* NE turn outer edge */
        [116, 0, 30], [124, 0, 0], [116, 0, -30],
        /* SW turn outer edge */
        [-116, 0, 30], [-124, 0, 0], [-116, 0, -30],
        /* back straight outer edge mid-points */
        [0, 0, -80], [50, 0, -78],
      ].map(([x, y, z], i) => (
        <LavaRock key={`lr${i}`} pos={[x!, y!, z!]} scale={1.1 + (i % 3) * 0.3} rotY={(i * Math.PI) / 4} />
      ))}

      {/* ── PalmTree — tropical atmosphere along track edges ── */}
      {[
        /* outside north straight */
        [-55, 0, 74], [-18, 0, 76], [18, 0, 76], [55, 0, 74],
        /* outside back straight */
        [-55, 0, -74], [-18, 0, -76], [18, 0, -76], [55, 0, -74],
      ].map(([x, y, z], i) => (
        <PalmTree key={`pt${i}`} pos={[x!, y!, z!]} scale={1.2} rotY={(i * Math.PI) / 4} />
      ))}

      {/* ── Exhaust smoke particles near start/finish ── */}
      <ExhaustSmoke />

      {/* ── Speed lines on start straight ── */}
      <SpeedLines />

      {/* ── Crowd glow bands behind grandstands ── */}
      <CrowdGlowBands />

      {/* ── Spectator crowd panels (bobbing bleacher spectators) ── */}
      <SpectatorStands />

      {/* ── Track heat shimmer over start zone ── */}
      <TrackHeatShimmer />

      {/* ── Goal trigger at start/finish ── */}
      <GoalTrigger
        pos={[0, 2, 50]}
        size={[14, 4, 6]}
        result={{ kind: 'win', label: 'ФИНИШНАЯ ЧЕРТА!', subline: 'Ты выиграл гонку!' }}
      />

      {/* ── Animated advertising billboards around circuit ── */}
      <CircuitBillboards />

      {/* ── Pit crew robots working in pit lane ── */}
      <PitCrewRobots />

      {/* ── Tire stacks near pit lane entrance ── */}
      <TireStacks />

      {/* ── Checkered flags at start/finish line ── */}
      <CheckeredFlags />

      {/* ── Speed trail blur lines on start straight ── */}
      <SpeedTrail />

      {/* ── Rain weather system ── */}
      <RainSystem />

      {/* ── Wet track surface & puddle ripples ── */}
      <WetTrack />

      {/* ── Victory podium ceremony area (x=-50, z=90) ── */}
      <VictoryPodium />

      {/* ── Fireworks bursting above the podium ── */}
      <VictoryFireworks />

      {/* ── Celebration banner flags across podium poles ── */}
      <CelebrationFlags />
    </>
  )
}

export const RACE_SPAWN: [number, number, number] = [0, 3, 4]
