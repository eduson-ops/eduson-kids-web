import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'
const _isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Building, ParkedCar, Tree, Lantern, Sign, Bench, Well, Rock, Flag, Pillar, GenTable, Chair, Fountain, Trophy, MarketStall, Podium, BossWizard, CrystalCluster, IceBlock, LavaRock } from '../Scenery'

// ─── Gold shimmer ground shader (финансовый район) ───────────────────────────
const SHIMMER_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const SHIMMER_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  float rand(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5); }
  void main() {
    float shimmer = rand(vUv + floor(iTime * 3.));
    float s = step(.97, shimmer);
    vec3 gold = vec3(.78, .62, .1);
    vec3 bright = vec3(1., .95, .4);
    gl_FragColor = vec4(mix(gold, bright, s), 1.);
  }
`

function GoldShimmerGround() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SHIMMER_VERT}
        fragmentShader={SHIMMER_FRAG}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Rotating golden ring ────────────────────────────────────────────────────
function GoldenRing({ posY, radius, speed, phase }: { posY: number; radius: number; speed: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * speed + phase
  })
  return (
    <mesh ref={ref} position={[0, posY, 0]}>
      <torusGeometry args={[radius, 0.12, 16, 64]} />
      <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={1.2} metalness={1} roughness={0.1} />
    </mesh>
  )
}

// ─── Revenue counter display ─────────────────────────────────────────────────
function RevenueDisplay() {
  const ref = useRef<THREE.MeshStandardMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (ref.current) ref.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 2.5) * 0.4
  })
  return (
    <group position={[0, 8, 0]}>
      {/* main panel */}
      <mesh castShadow>
        <boxGeometry args={[8, 2.5, 0.3]} />
        <meshStandardMaterial ref={ref} color="#1a1000" emissive="#ffd700" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* side pillars */}
      {([-4.3, 4.3] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.6} metalness={1} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Animated stock ticker ────────────────────────────────────────────────────
function StockTicker() {
  const ref = useRef<THREE.MeshStandardMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (ref.current) ref.current.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 4) * 0.35
  })
  return (
    <mesh position={[0, 2.5, -45]}>
      <boxGeometry args={[50, 0.1, 0.5]} />
      <meshStandardMaterial ref={ref} color="#001500" emissive="#00ff44" emissiveIntensity={0.75} />
    </mesh>
  )
}

// ─── Money rain (InstancedMesh) ───────────────────────────────────────────────
const COIN_COUNT = 80
const COIN_COLORS = ['#ffd644', '#ffec80', '#e8b800'] as const
function MoneyRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const { camera } = useThree()
  const frameSkip = useRef(0)
  const states = useMemo(() =>
    Array.from({ length: COIN_COUNT }).map((_, i) => ({
      x: (Math.random() - 0.5) * 80,   // -40..40 local offset
      y: Math.random() * 25,            // 0..25
      z: (Math.random() - 0.5) * 80,   // -40..40 local offset
      speed: 2 + Math.random() * 3,     // 2..5 units/sec
      rotZ: Math.random() * Math.PI * 2,
      colorIdx: i % COIN_COLORS.length,
    })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorObjs = useMemo(
    () => COIN_COLORS.map(c => new THREE.Color(c)),
    []
  )
  // Set per-instance colors once at mount (static — colorIdx never changes)
  const colorInitDone = useRef(false)

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return

    if (!colorInitDone.current) {
      states.forEach((s, i) => { meshRef.current.setColorAt(i, colorObjs[s.colorIdx]) })
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
      colorInitDone.current = true
    }

    const step = _isLow ? dt * 2 : dt
    const camX = camera.position.x
    const camZ = camera.position.z
    states.forEach((s, i) => {
      s.y -= s.speed * step
      s.rotZ += s.speed * step
      if (s.y < -1) {
        s.y = 25
        s.x = (Math.random() - 0.5) * 80
        s.z = (Math.random() - 0.5) * 80
      }
      dummy.position.set(camX + s.x, s.y, camZ + s.z)
      dummy.rotation.set(Math.PI / 2, 0, s.rotZ)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COIN_COUNT]} frustumCulled={false}>
      <cylinderGeometry args={[0.12, 0.12, 0.04, 8]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}

// ─── Golden vortex ────────────────────────────────────────────────────────────
const VORTEX_COUNT = 80
function GoldenVortex() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)
  const particles = useMemo(() =>
    Array.from({ length: VORTEX_COUNT }).map((_, i) => ({
      baseAngle: (i / VORTEX_COUNT) * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.12,
      baseR: 8 + Math.random() * 7,          // 8–15 units
      baseY: 2 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
    })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      const angle = p.baseAngle + t * p.speed
      const r = p.baseR
      const y = p.baseY + Math.sin(t * 0.5 + p.phase) * 2
      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VORTEX_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#ffd700" transparent opacity={0.8} />
    </instancedMesh>
  )
}

// ─── Chimney smoke (InstancedMesh) ───────────────────────────────────────────
const CHIMNEY_SMOKE_COUNT = 40
// chimney tops sit at y≈8 (chimney height 12, centered at 0 → tip at 6, + origin y=0)
const SMOKE_ORIGINS: [number, number, number][] = [
  [-80, 0, -28], [-108, 0, -28], [-80, 0, 28], [-108, 0, 28],
]
function ChimneySmoke() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const states = useMemo(() =>
    Array.from({ length: CHIMNEY_SMOKE_COUNT }).map((_, i) => {
      const origin = SMOKE_ORIGINS[i % SMOKE_ORIGINS.length]
      return {
        ox: origin[0],
        oz: origin[2],
        x: origin[0] + (Math.random() - 0.5) * 1.2,
        y: 8 + Math.random() * 6,
        z: origin[2] + (Math.random() - 0.5) * 1.2,
        speed: 0.6 + Math.random() * 0.8,
        baseScale: 0.2 + Math.random() * 0.2,
      }
    }), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const matRef = useRef<THREE.MeshBasicMaterial>(null!)
  const _col = useRef(new THREE.Color())
  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    states.forEach((s, i) => {
      s.y += s.speed * step
      const progress = Math.min((s.y - 8) / 17, 1)
      const sc = s.baseScale + progress * 0.6
      const opacity = 0.15 + progress * 0.15
      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      const grey = 0.2 + (1 - opacity) * 0.5
      _col.current.setRGB(grey, grey, grey)
      meshRef.current.setColorAt(i, _col.current)
      if (s.y > 25) {
        s.y = 8
        s.x = s.ox + (Math.random() - 0.5) * 1.2
        s.z = s.oz + (Math.random() - 0.5) * 1.2
      }
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CHIMNEY_SMOKE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial ref={matRef} color="#444444" transparent opacity={0.22} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── SmokeStacks — thick chimneys with rising instanced smoke ────────────────
function SmokeStacks() {
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const CHIMNEYS: [number, number, number][] = [[-60, 0, -15], [-60, 0, 5], [-60, 0, 25]]
  const PER = 40
  const COUNT = CHIMNEYS.length * PER
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const ci = Math.floor(i / PER)
      const [cx, , cz] = CHIMNEYS[ci]
      return {
        x: cx + (Math.random() - 0.5) * 2,
        y: 12 + Math.random() * 8,
        z: cz + (Math.random() - 0.5) * 2,
        speed: Math.random() * 0.04 + 0.02,
        chimney: ci,
      }
    }), []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    particles.forEach((p, i) => {
      p.y += p.speed * step
      const t = Math.min((p.y - 12) / 14, 1)
      if (t >= 1) {
        p.y = 12
        p.x = CHIMNEYS[p.chimney][0] + (Math.random() - 0.5) * 2
        p.z = CHIMNEYS[p.chimney][2] + (Math.random() - 0.5) * 2
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(0.4 + t * 1.8)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {CHIMNEYS.map(([x, , z], i) => (
        <mesh key={`ss-chimney-${i}`} position={[x, 6, z]}>
          <cylinderGeometry args={[1.5, 1.8, 12, 8]} />
          <meshStandardMaterial color="#666666" roughness={0.9} />
        </mesh>
      ))}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} depthWrite={false} />
      </instancedMesh>
    </>
  )
}

// ─── ProductBoxes — stacks of cardboard shipping boxes near conveyors ─────────
function ProductBoxes() {
  // Stacks placed near conveyor belt positions (BELT_POSITIONS: [-70,0.5,15], [-85,0.5,-10], [-100,0.5,20], [-115,0.5,0])
  const STACKS: { base: [number, number, number]; count: number; colorAlt: boolean }[] = [
    { base: [-65, 0, 15],  count: 4, colorAlt: false },
    { base: [-67, 0, 18],  count: 3, colorAlt: true  },
    { base: [-80, 0, -10], count: 5, colorAlt: false },
    { base: [-90, 0, 22],  count: 4, colorAlt: true  },
    { base: [-110, 0, 3],  count: 3, colorAlt: false },
  ]
  return (
    <group>
      {STACKS.map((stack, si) => (
        <group key={`stack-${si}`}>
          {Array.from({ length: stack.count }, (_, bi) => {
            const color = stack.colorAlt && bi % 2 === 0 ? '#d4b870' : '#e8d090'
            return (
              <mesh
                key={`box-${si}-${bi}`}
                position={[stack.base[0], stack.base[1] + 0.6 + bi * 1.22, stack.base[2]]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial color={color} roughness={0.9} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

// ─── FactoryWindows — glowing window panels on factory walls ──────────────────
function FactoryWindows() {
  const refs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    refs.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 1.6 + Math.sin(t * 1.8 + i * 0.7) * 0.5
    })
  })

  // Windows on west-facing walls of factory buildings (x ~ -63 and x ~ -93, various z)
  // Building centers: [-70,4,-35], [-100,4,-35], [-70,4,35], [-100,4,35]
  // Building size 14×8×10; west face (facing +x) at x = -70+7 = -63, east at -70-7 = -77
  const WINDOWS: [number, number, number][] = [
    // Buildings at z=-35 (south)
    [-63, 5,  -32], [-63, 7,  -32], [-63, 5,  -38], [-63, 7,  -38],
    // Buildings at z=35 (north)
    [-63, 5,   32], [-63, 7,   32], [-63, 5,   38], [-63, 7,   38],
    // x=-100 buildings
    [-93, 5,  -32], [-93, 7,  -32],
    [-93, 5,   32], [-93, 7,   32],
  ]

  return (
    <>
      {WINDOWS.map((pos, i) => (
        <mesh key={`win-${i}`} position={pos}>
          <boxGeometry args={[0.1, 1.2, 0.8]} />
          <meshStandardMaterial
            ref={el => { refs.current[i] = el }}
            color="#ffcc44"
            emissive="#ffcc44"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Industrial pipework ─────────────────────────────────────────────────────
function IndustrialPipework() {
  const PIPE_MAT = { color: '#2a2a2a', roughness: 0.8, metalness: 0.6 } as const

  // horizontal pipes along X-axis: rotated so cylinder axis lies along X
  const hPipes: { pos: [number, number, number]; len: number }[] = [
    { pos: [-85, 8, -35], len: 30 },
    { pos: [-85, 8,  35], len: 30 },
    { pos: [-85, 8, -20], len: 30 },
    { pos: [-85, 8,  20], len: 30 },
  ]
  // vertical pipes along Y-axis (default cylinder orientation)
  const vPipes: { pos: [number, number, number]; len: number }[] = [
    { pos: [-70, 8, -28], len: 8 },
    { pos: [-100, 8, -28], len: 8 },
    { pos: [-70, 8,  28], len: 8 },
    { pos: [-100, 8,  28], len: 8 },
  ]
  const junctionLights: [number, number, number][] = [
    [-85, 8,  0],
    [-100, 8, 0],
  ]

  return (
    <group>
      {hPipes.map((p, i) => (
        <mesh key={`hpipe-${i}`} position={p.pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, p.len, 8]} />
          <meshStandardMaterial {...PIPE_MAT} />
        </mesh>
      ))}
      {vPipes.map((p, i) => (
        <mesh key={`vpipe-${i}`} position={p.pos}>
          <cylinderGeometry args={[0.4, 0.4, p.len, 8]} />
          <meshStandardMaterial {...PIPE_MAT} />
        </mesh>
      ))}
      {junctionLights.map((pos, i) => (
        <pointLight key={`pjl-${i}`} position={pos} color="#ff6600" intensity={2} distance={20} />
      ))}
    </group>
  )
}

// ─── Heat glow vents ──────────────────────────────────────────────────────────
function HeatGlow() {
  const VENT_POSITIONS: [number, number, number][] = [
    [-60,  0.02,   0],
    [-75,  0.02, -15],
    [-90,  0.02,  10],
    [-105, 0.02, -20],
    [-65,  0.02,  25],
    [-80,  0.02, -40],
    [-95,  0.02,  30],
    [-115, 0.02, -10],
  ]
  return (
    <group>
      {VENT_POSITIONS.map((pos, i) => (
        <group key={`vent-${i}`} position={pos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.8, 16]} />
            <meshStandardMaterial
              color="#ff3300"
              emissive="#ff1100"
              emissiveIntensity={3}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Conveyor belt shader strings ────────────────────────────────────────────
const BELT_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const BELT_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    float stripe = step(0.5, fract(uv.x * 8.0 - iTime * 2.0));
    vec3 col = mix(vec3(0.15), vec3(0.35, 0.35, 0.25), stripe);
    gl_FragColor = vec4(col, 1.0);
  }
`

const BELT_POSITIONS: [number, number, number][] = [
  [-70, 0.5, 15],
  [-85, 0.5, -10],
  [-100, 0.5, 20],
  [-115, 0.5, 0],
]

function ConveyorBelts() {
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    matRefs.current.forEach(mat => {
      if (mat) mat.uniforms.iTime!.value = t
    })
  })

  return (
    <group>
      {BELT_POSITIONS.map((pos, i) => (
        <group key={`belt-${i}`} position={pos}>
          {/* belt body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[16, 0.2, 2]} />
            <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* animated shader surface */}
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[16, 2]} />
            <shaderMaterial
              ref={(el: THREE.ShaderMaterial | null) => { matRefs.current[i] = el }}
              vertexShader={BELT_VERT}
              fragmentShader={BELT_FRAG}
              uniforms={uniforms}
            />
          </mesh>
        </group>
      ))}
      {/* 2 shared lights for the belt cluster */}
      <pointLight position={[-78, 3, 10]} color="#ff6600" intensity={4} distance={25} />
      <pointLight position={[-107, 3, 5]} color="#ff6600" intensity={4} distance={25} />
    </group>
  )
}

// ─── Factory robotic arms ─────────────────────────────────────────────────────
const ARM_CONFIGS: { pos: [number, number, number]; phase: number }[] = [
  { pos: [-75, 0, 5],   phase: 0 },
  { pos: [-105, 0, -5], phase: Math.PI },
]

function FactoryArm() {
  const armRefs = useRef<(THREE.Group | null)[]>([])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    armRefs.current.forEach((arm, i) => {
      if (arm) arm.rotation.x = Math.sin(t * 1.2 + ARM_CONFIGS[i].phase) * 0.4
    })
  })

  return (
    <group>
      {ARM_CONFIGS.map((cfg, i) => (
        <group key={`factory-arm-${i}`} position={cfg.pos}>
          {/* base */}
          <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 0.4, 1.2]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* arm segment — rotates on X */}
          <group ref={(el: THREE.Group | null) => { armRefs.current[i] = el }} position={[0, 0.4, 0]}>
            <mesh castShadow position={[0, 1.5, 0]}>
              <boxGeometry args={[0.4, 3, 0.4]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* head at top of arm */}
            <mesh castShadow position={[0, 3.2, 0]}>
              <boxGeometry args={[0.8, 0.4, 0.8]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

// ─── Market neon signs ────────────────────────────────────────────────────────
const NEON_COLORS = ['#ffdd00', '#ff4400', '#00ff88', '#ffdd00', '#ff4400', '#00ff88'] as const
const NEON_POSITIONS: [number, number, number][] = [
  [57, 4.5, -30], [67, 4.5, -30], [77, 4.5, -30],
  [57, 4.5, -15], [67, 4.5, -15], [77, 4.5, -15],
]
function MarketNeonSigns() {
  const refs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    refs.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 2.5 + Math.sin(t * 2.5 + i * 1.1) * 0.5
    })
  })
  return (
    <>
      {NEON_POSITIONS.map((pos, i) => (
        <mesh key={`neon-${i}`} position={pos}>
          <boxGeometry args={[2.5, 0.4, 0.1]} />
          <meshStandardMaterial
            ref={el => { refs.current[i] = el }}
            color={NEON_COLORS[i]}
            emissive={NEON_COLORS[i]}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Animated business car ────────────────────────────────────────────────────
function BusinessCar() {
  const ref = useRef<THREE.Group>(null!)
  const dir = useRef(1)
  const pos = useRef(40)
  const frameSkip = useRef(0)
  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    pos.current += dir.current * 8 * step
    if (pos.current > 110) dir.current = -1
    if (pos.current < 45) dir.current = 1
    if (ref.current) {
      ref.current.position.x = pos.current
      ref.current.rotation.y = dir.current > 0 ? -Math.PI / 2 : Math.PI / 2
    }
  })
  return (
    <group ref={ref} position={[40, 0.4, 0]}>
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.6, 1.2]} />
        <meshStandardMaterial color="#1a1a6e" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.3, 0.55, 1.0]} />
        <meshStandardMaterial color="#22228a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* wheels */}
      {([[-0.9, -0.3, 0.65], [0.9, -0.3, 0.65], [-0.9, -0.3, -0.65], [0.9, -0.3, -0.65]] as [number, number, number][]).map((wp, i) => (
        <mesh key={i} position={wp} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.18, 10]} />
          <meshStandardMaterial color="#111" metalness={0.4} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Factory building (custom) ────────────────────────────────────────────────
function FactoryBuilding({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14, 8, 10]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} metalness={0.3} />
        </mesh>
      </RigidBody>
      {/* roof detail */}
      <mesh position={[0, 4.6, 0]} castShadow>
        <boxGeometry args={[14.4, 0.5, 10.4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={1} />
      </mesh>
    </group>
  )
}

// ─── Chimney ──────────────────────────────────────────────────────────────────
function Chimney({ pos }: { pos: [number, number, number] }) {
  const tipRef = useRef<THREE.MeshStandardMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (tipRef.current) tipRef.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.3
  })
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 12, 10]} />
          <meshStandardMaterial color="#444" roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* red tip */}
      <mesh position={[0, 6.3, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 10]} />
        <meshStandardMaterial ref={tipRef} color="#cc2200" emissive="#ff3300" emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

// ─── Market stall (geometry, local) ──────────────────────────────────────────
function LocalMarketStall({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 1.2, 1.8]} />
          <meshStandardMaterial color="#e8d8b0" roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* canopy */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[3, 0.12, 2.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {/* posts */}
      {([-1.1, 1.1] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0.9]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 6]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      ))}
    </group>
  )
}

// ─── Central plaza platform ───────────────────────────────────────────────────
function CentralPlaza() {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.05, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[30, 0.3, 30]} />
          <meshStandardMaterial color="#c8a020" roughness={0.5} metalness={0.4} />
        </mesh>
      </RigidBody>
      {/* decorative edge trim */}
      {([[-15, 0], [15, 0], [0, -15], [0, 15]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.15, z]} castShadow>
          <boxGeometry args={[i < 2 ? 0.4 : 30, 0.3, i < 2 ? 30 : 0.4]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.4} metalness={1} roughness={0.1} />
        </mesh>
      ))}
      <GoldShimmerGround />
    </group>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    for (let i = 0; i < 400; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 200 + Math.random() * 50
      pts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi))
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.8} sizeAttenuation />
    </points>
  )
}

// ─── Tallest factory building constants ──────────────────────────────────────
// FactoryBuilding at pos=[-70, 4, -35]: group y=4, box h=8 → top y=8, roof slab offset=4.6+0.25=8.85
const TALLEST_X = -70
const TALLEST_Z = -35
const ROOFTOP_Y = 8.85   // world-space top of roof slab
const HELIPAD_Y = ROOFTOP_Y + 0.15   // center of helipad cylinder (h=0.3)

// ─── Helipad ──────────────────────────────────────────────────────────────────
function Helipad() {
  // Flashing lights: 8 lights alternating on/off every 0.5s
  const lightRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  // Wind sock rotation
  const sockRef = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    // Alternate two groups: even indices flash at one phase, odd at opposite
    lightRefs.current.forEach((mat, i) => {
      if (!mat) return
      const phase = i % 2 === 0 ? 0 : Math.PI
      const on = Math.sin(t * Math.PI / 0.5 + phase) > 0
      if (i % 2 === 0) {
        // red lights
        mat.emissive.set(on ? '#ff2200' : '#220000')
        mat.emissiveIntensity = on ? 3 : 0.1
      } else {
        // white lights
        mat.emissive.set(on ? '#ffffff' : '#222222')
        mat.emissiveIntensity = on ? 3 : 0.1
      }
    })
    // Wind sock slowly rotates
    if (sockRef.current) sockRef.current.rotation.y = t * 0.4
  })

  // 8 lights evenly spaced in a ring of radius 5.5
  const LIGHT_RING_R = 5.5
  const lightPositions: [number, number, number][] = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return [Math.cos(angle) * LIGHT_RING_R, 0.3, Math.sin(angle) * LIGHT_RING_R]
  })

  return (
    <group position={[TALLEST_X, HELIPAD_Y, TALLEST_Z]}>
      {/* Circular pad */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 0.3, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* "H" marking — 3 flat boxes */}
      {/* Left vertical bar */}
      <mesh position={[-1.4, 0.16, 0]}>
        <boxGeometry args={[0.5, 0.05, 2.6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Right vertical bar */}
      <mesh position={[1.4, 0.16, 0]}>
        <boxGeometry args={[0.5, 0.05, 2.6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Horizontal crossbar */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[2.8, 0.05, 0.5]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* Perimeter flashing lights */}
      {lightPositions.map((lp, i) => (
        <mesh key={`hlight-${i}`} position={lp} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            ref={el => { lightRefs.current[i] = el }}
            color={i % 2 === 0 ? '#ff2200' : '#ffffff'}
            emissive={i % 2 === 0 ? '#ff2200' : '#ffffff'}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Wind indicator — pole + sock */}
      <group ref={sockRef} position={[4.5, 0.15, 0]}>
        {/* Pole */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 2.0, 6]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Sock — flat box tapered appearance */}
        <mesh position={[0.4, 1.9, 0]}>
          <boxGeometry args={[0.8, 0.18, 0.22]} />
          <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── CEOOffice ────────────────────────────────────────────────────────────────
function CEOOffice() {
  const monitorRef = useRef<THREE.MeshStandardMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (monitorRef.current) {
      monitorRef.current.emissiveIntensity = 1.5 + Math.sin(clock.getElapsedTime() * 1.8) * 0.5
    }
  })

  // Penthouse is 8×4×8 (w, h, d), floor sits on rooftop
  const FLOOR_Y = ROOFTOP_Y + 0.1   // floor top surface
  const WALL_H = 4
  const HALF_W = 4   // half-width of penthouse footprint
  const HALF_D = 4   // half-depth

  return (
    <group position={[TALLEST_X, FLOOR_Y, TALLEST_Z]}>
      {/* Floor */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[8, 0.2, 8]} />
        <meshStandardMaterial color="#333322" roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, WALL_H + 0.1, 0]}>
        <boxGeometry args={[8, 0.2, 8]} />
        <meshStandardMaterial color="#333322" roughness={0.7} />
      </mesh>

      {/* 4 transparent glass walls */}
      {/* Front wall (z = +HALF_D) */}
      <mesh position={[0, WALL_H / 2, HALF_D]}>
        <boxGeometry args={[8, WALL_H, 0.2]} />
        <meshStandardMaterial color="#aaccff" transparent opacity={0.3} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Back wall (z = -HALF_D) */}
      <mesh position={[0, WALL_H / 2, -HALF_D]}>
        <boxGeometry args={[8, WALL_H, 0.2]} />
        <meshStandardMaterial color="#aaccff" transparent opacity={0.3} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Left wall (x = -HALF_W) */}
      <mesh position={[-HALF_W, WALL_H / 2, 0]}>
        <boxGeometry args={[0.2, WALL_H, 8]} />
        <meshStandardMaterial color="#aaccff" transparent opacity={0.3} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* Right wall (x = +HALF_W) */}
      <mesh position={[HALF_W, WALL_H / 2, 0]}>
        <boxGeometry args={[0.2, WALL_H, 8]} />
        <meshStandardMaterial color="#aaccff" transparent opacity={0.3} roughness={0.05} metalness={0.2} />
      </mesh>

      {/* Big desk — dark wood */}
      <mesh position={[0, 0.6, -1.5]} castShadow>
        <boxGeometry args={[3, 0.8, 1.5]} />
        <meshStandardMaterial color="#2a1505" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Monitor screen */}
      <mesh position={[0, 1.35, -1.9]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.07]} />
        <meshStandardMaterial
          ref={monitorRef}
          color="#001a0d"
          emissive="#00ff88"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, 1.0, -1.9]}>
        <boxGeometry args={[0.18, 0.35, 0.12]} />
        <meshStandardMaterial color="#222222" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Boss chair — cylinder seat + box back */}
      <mesh position={[0, 0.55, -0.3]} castShadow>
        <cylinderGeometry args={[0.6, 0.55, 0.28, 10]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, 1.05, -0.7]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.12]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>

      {/* Trophy shelf */}
      <mesh position={[2.5, 1.2, -3.5]} castShadow>
        <boxGeometry args={[2.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#3a2008" roughness={0.8} />
      </mesh>
      {/* 4 trophies — small cup cylinders */}
      {([-1.0, -0.3, 0.4, 1.1] as number[]).map((tx, i) => (
        <group key={`trophy-${i}`} position={[2.5 + tx, 1.25, -3.5]}>
          {/* cup */}
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.32, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.6} metalness={1} roughness={0.1} />
          </mesh>
          {/* stem */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.12, 6]} />
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </mesh>
          {/* base */}
          <mesh position={[0, -0.29, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Interior point light — warm office glow */}
      <pointLight position={[0, WALL_H - 0.5, 0]} color="#ffe8b0" intensity={2} distance={14} />
    </group>
  )
}

// ─── TradingFloor ────────────────────────────────────────────────────────────
// Placed in the trading quarter at ~[90, 0, -20], inside an open-floor building
function TradingFloor() {
  // Animated ticker tape
  const tickerRef = useRef<THREE.Group>(null!)
  // Flashing screen intensities
  const screenRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    // scroll ticker tape along Z
    if (tickerRef.current) {
      tickerRef.current.position.z = ((t * 2) % 20) - 10
    }
    screenRefs.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 1.5 + Math.sin(t * 3 + i * 1.3) * 0.5
    })
  })

  // Octagon parameters — 8 fence segments around the pit
  // radius 4, segments at angles 0, 45, 90 … 315
  const OCT_R = 4
  const SEG_W = 3.1  // width of each segment (≈ chord length at r=4)
  const octagonSegments: { pos: [number, number, number]; rotY: number }[] = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return {
      pos: [Math.cos(angle) * OCT_R, 0.25, Math.sin(angle) * OCT_R],
      rotY: angle + Math.PI / 2,
    }
  })

  // 6 traders evenly spaced just outside the fence (r=5.5)
  const TRADER_R = 5.5
  const SUIT_COLORS = ['#2244aa', '#2244aa', '#224422', '#224422', '#441122', '#441122'] as const
  const traders: { pos: [number, number, number]; rotY: number; suitColor: string }[] = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2
    return {
      pos: [Math.cos(angle) * TRADER_R, 0, Math.sin(angle) * TRADER_R],
      rotY: angle + Math.PI,  // face the pit
      suitColor: SUIT_COLORS[i],
    }
  })

  // 3 trading screens at cardinal positions, radius 7
  const SCREEN_R = 7.5
  const screens: { pos: [number, number, number]; rotY: number }[] = [0, 1, 2].map(i => {
    const angle = (i / 3) * Math.PI * 2
    return {
      pos: [Math.cos(angle) * SCREEN_R, 1.5, Math.sin(angle) * SCREEN_R],
      rotY: angle + Math.PI,
    }
  })

  return (
    <group position={[90, 0, -20]}>
      {/* ── Floor of the trading room ── */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#1a1008" roughness={0.8} />
      </mesh>

      {/* ── Trading pit octagonal fence ── */}
      {octagonSegments.map((seg, i) => (
        <mesh key={`oct-${i}`} position={seg.pos} rotation={[0, seg.rotY, 0]} castShadow>
          <boxGeometry args={[SEG_W, 0.5, 0.2]} />
          <meshStandardMaterial color="#ccaa44" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* ── Pit floor ── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 8]} />
        <meshStandardMaterial color="#2a1a00" roughness={0.9} />
      </mesh>

      {/* ── 6 trader figures ── */}
      {traders.map((tr, i) => (
        <group key={`trader-${i}`} position={tr.pos} rotation={[0, tr.rotY, 0]}>
          {/* body cylinder */}
          <mesh castShadow position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 1.4, 8]} />
            <meshStandardMaterial color={tr.suitColor} roughness={0.7} />
          </mesh>
          {/* head sphere */}
          <mesh castShadow position={[0, 1.75, 0]}>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshStandardMaterial color="#f5c8a0" roughness={0.8} />
          </mesh>
          {/* raised arm — angled up ~45° forward-up */}
          <mesh castShadow position={[0.55, 1.15, -0.3]} rotation={[Math.PI / 4, 0, Math.PI / 8]}>
            <cylinderGeometry args={[0.1, 0.1, 0.7, 6]} />
            <meshStandardMaterial color={tr.suitColor} roughness={0.7} />
          </mesh>
          {/* other arm down */}
          <mesh castShadow position={[-0.52, 0.9, 0]} rotation={[0, 0, -Math.PI / 8]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 6]} />
            <meshStandardMaterial color={tr.suitColor} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ── 3 trading screens ── */}
      {screens.map((sc, i) => (
        <group key={`tscreen-${i}`} position={sc.pos} rotation={[0, sc.rotY, 0]}>
          {/* screen panel */}
          <mesh castShadow>
            <boxGeometry args={[2, 2.5, 0.1]} />
            <meshStandardMaterial
              ref={el => { screenRefs.current[i] = el }}
              color="#001a00"
              emissive="#00ff44"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          {/* screen frame */}
          <mesh position={[0, 0, -0.07]}>
            <boxGeometry args={[2.2, 2.7, 0.08]} />
            <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* 3 bar-chart bars visible on screen face */}
          {([[-0.55, 0.4], [0, 0.7], [0.55, 0.25]] as [number, number][]).map(([bx, bh], bi) => (
            <mesh key={`bar-${i}-${bi}`} position={[bx, -0.5 + bh / 2, 0.06]}>
              <boxGeometry args={[0.3, bh, 0.04]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff44" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
          {/* up arrow above screen */}
          <mesh position={[0, 1.55, 0.06]}>
            <boxGeometry args={[0.25, 0.4, 0.04]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.75, 0.06]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <mesh position={[-0.16, 1.75, 0.06]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.22, 0.08, 0.04]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          {/* stand/pedestal */}
          <mesh position={[0, -1.55, -0.3]}>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ── Scrolling ticker tape along back wall ── */}
      <group ref={tickerRef} position={[0, 1.5, -11]}>
        <mesh>
          <boxGeometry args={[0.1, 0.15, 20]} />
          <meshStandardMaterial color="#111100" emissive="#ffff00" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      {/* Wall behind ticker */}
      <mesh position={[0, 1.5, -11.5]}>
        <boxGeometry args={[22, 4, 0.15]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>

      {/* Interior lighting */}
      <pointLight position={[0, 4, 0]} color="#ffdd88" intensity={3} distance={20} />
      <pointLight position={[0, 2, 0]} color="#00ff44" intensity={1} distance={12} />
    </group>
  )
}

// ─── Boardroom ────────────────────────────────────────────────────────────────
// Executive boardroom placed at [-85, 0, 5] — a ground-level wing between factory buildings
function Boardroom() {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null!)
  const chandelierRef = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (screenRef.current) {
      screenRef.current.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.3
    }
    chandelierRef.current.forEach((mat, i) => {
      if (mat) mat.emissiveIntensity = 2.5 + Math.sin(t * 2 + i * 0.5) * 0.5
    })
  })

  // 8 executive chairs — 4 per long side of the 8×3 table
  // Table at y=0.8, chair seats at y=0.7 (chair seat top), placed at z±2.2 along table
  const CHAIR_POSITIONS_LEFT: [number, number, number][] = [
    [-3, 0, -2.2], [-1, 0, -2.2], [1, 0, -2.2], [3, 0, -2.2]
  ]
  const CHAIR_POSITIONS_RIGHT: [number, number, number][] = [
    [-3, 0, 2.2], [-1, 0, 2.2], [1, 0, 2.2], [3, 0, 2.2]
  ]

  // 8 chandelier hanging spheres on a ring r=1.5
  const chandelierRing: [number, number, number][] = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return [Math.cos(angle) * 1.5, -0.6, Math.sin(angle) * 1.5]
  })

  // Bar chart on presentation screen — 5 bars of varying height
  const BAR_HEIGHTS = [1.0, 1.6, 1.2, 1.9, 0.8]
  const BAR_X_OFFSETS = [-1.8, -0.9, 0, 0.9, 1.8]

  return (
    <group position={[-85, 0, 5]}>
      {/* ── Dark wood floor ── */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#331100" roughness={0.7} />
      </mesh>

      {/* ── Walls ── */}
      {/* Back wall (head of table, -x side) */}
      <mesh position={[-7.5, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#1a0d00" roughness={0.9} />
      </mesh>
      {/* Opposite wall (+x) */}
      <mesh position={[7.5, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#1a0d00" roughness={0.9} />
      </mesh>
      {/* Side wall (-z) */}
      <mesh position={[0, 2.5, -4.9]}>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#1a0d00" roughness={0.9} />
      </mesh>
      {/* Side wall (+z) */}
      <mesh position={[0, 2.5, 4.9]}>
        <boxGeometry args={[15, 5, 0.2]} />
        <meshStandardMaterial color="#1a0d00" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[15, 0.2, 10]} />
        <meshStandardMaterial color="#110800" roughness={0.9} />
      </mesh>

      {/* ── Conference table ── */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[8, 0.8, 3]} />
        <meshStandardMaterial color="#2a1505" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Table legs */}
      {([[-3.5, 0, -1.2], [-3.5, 0, 1.2], [3.5, 0, -1.2], [3.5, 0, 1.2]] as [number, number, number][]).map((lp, i) => (
        <mesh key={`leg-${i}`} castShadow position={[lp[0], lp[1], lp[2]]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#1a0d03" roughness={0.7} />
        </mesh>
      ))}

      {/* ── 8 executive chairs ── */}
      {CHAIR_POSITIONS_LEFT.map((cp, i) => (
        <group key={`chair-l-${i}`} position={cp} rotation={[0, Math.PI / 2, 0]}>
          {/* seat */}
          <mesh castShadow position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.4, 0.38, 0.12, 10]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          {/* chair back */}
          <mesh castShadow position={[0, 1.15, -0.38]}>
            <boxGeometry args={[0.7, 0.8, 0.1]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          {/* left armrest */}
          <mesh castShadow position={[-0.38, 0.9, -0.1]}>
            <boxGeometry args={[0.06, 0.08, 0.5]} />
            <meshStandardMaterial color="#222222" roughness={0.6} />
          </mesh>
          {/* right armrest */}
          <mesh castShadow position={[0.38, 0.9, -0.1]}>
            <boxGeometry args={[0.06, 0.08, 0.5]} />
            <meshStandardMaterial color="#222222" roughness={0.6} />
          </mesh>
          {/* pedestal */}
          <mesh castShadow position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 6]} />
            <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {CHAIR_POSITIONS_RIGHT.map((cp, i) => (
        <group key={`chair-r-${i}`} position={cp} rotation={[0, -Math.PI / 2, 0]}>
          <mesh castShadow position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.4, 0.38, 0.12, 10]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 1.15, -0.38]}>
            <boxGeometry args={[0.7, 0.8, 0.1]} />
            <meshStandardMaterial color="#111111" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[-0.38, 0.9, -0.1]}>
            <boxGeometry args={[0.06, 0.08, 0.5]} />
            <meshStandardMaterial color="#222222" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0.38, 0.9, -0.1]}>
            <boxGeometry args={[0.06, 0.08, 0.5]} />
            <meshStandardMaterial color="#222222" roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.7, 6]} />
            <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ── Wall presentation screen at head of table ── */}
      <mesh castShadow position={[-7.2, 2.5, 0]}>
        <boxGeometry args={[6, 4, 0.15]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#000820"
          emissive="#0033aa"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Bar chart on screen — 5 bars */}
      {BAR_HEIGHTS.map((bh, i) => (
        <mesh key={`chart-bar-${i}`} position={[-7.1, 0.8 + bh / 2, BAR_X_OFFSETS[i]]}>
          <boxGeometry args={[0.08, bh, 0.5]} />
          <meshStandardMaterial color="#4499ff" emissive="#2266ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}

      {/* ── Chandelier ── */}
      {/* Central sphere */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial
          ref={el => { chandelierRef.current[0] = el }}
          color="#ffe8cc"
          emissive="#ffeecc"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* Chain from ceiling */}
      <mesh position={[0, 4.85, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 8 hanging spheres on chains */}
      {chandelierRing.map((hp, i) => (
        <group key={`chandelier-${i}`} position={[hp[0], 4.5, hp[2]]}>
          {/* chain link */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 4]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* hanging bulb */}
          <mesh castShadow position={[0, 0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              ref={el => { chandelierRef.current[i + 1] = el }}
              color="#ffeecc"
              emissive="#ffeecc"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* Chandelier light */}
      <pointLight position={[0, 4, 0]} color="#ffeecc" intensity={4} distance={18} />
    </group>
  )
}

// ─── MoneyBags ────────────────────────────────────────────────────────────────
// Decorative money bags + gold bars scattered around CEO office and trading area
function MoneyBags() {
  // 6 money bags: positions spread near CEO office ([-70, ~10, -35]) and trading area ([90, 0, -20])
  const BAG_POSITIONS: [number, number, number][] = [
    // near CEO office (world y = FLOOR_Y + offset)
    [-72, ROOFTOP_Y + 0.2,  -33],
    [-68, ROOFTOP_Y + 0.2,  -37],
    [-74, ROOFTOP_Y + 0.2,  -36],
    // near trading floor
    [86, 0.2, -22],
    [94, 0.2, -18],
    [88, 0.2, -17],
  ]

  // 4 gold bars
  const GOLD_BAR_POSITIONS: [number, number, number][] = [
    [-71, ROOFTOP_Y + 0.16, -34],
    [-69, ROOFTOP_Y + 0.16, -36],
    [87, 0.16, -23],
    [93, 0.16, -19],
  ]

  return (
    <group>
      {/* ── Money bags ── */}
      {BAG_POSITIONS.map((bp, i) => (
        <group key={`bag-${i}`} position={bp}>
          {/* bag body — slightly flattened sphere */}
          <mesh castShadow scale={[1, 0.9, 1]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#f0e890" roughness={0.7} />
          </mesh>
          {/* tie at top */}
          <mesh castShadow position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.3, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          {/* dollar sign — two thin flat boxes forming "$" approximation */}
          {/* vertical bar */}
          <mesh position={[0, 0.05, 0.62]}>
            <boxGeometry args={[0.05, 0.5, 0.04]} />
            <meshStandardMaterial color="#c8a800" emissive="#aa8800" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          {/* upper horizontal */}
          <mesh position={[0, 0.22, 0.62]}>
            <boxGeometry args={[0.3, 0.05, 0.04]} />
            <meshStandardMaterial color="#c8a800" emissive="#aa8800" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          {/* lower horizontal */}
          <mesh position={[0, -0.12, 0.62]}>
            <boxGeometry args={[0.3, 0.05, 0.04]} />
            <meshStandardMaterial color="#c8a800" emissive="#aa8800" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ── Gold bars ── */}
      {GOLD_BAR_POSITIONS.map((gp, i) => (
        <mesh key={`gold-${i}`} castShadow position={gp} rotation={[0, (i * Math.PI) / 3, 0]}>
          <boxGeometry args={[0.8, 0.3, 1.5]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#aa8800"
            emissiveIntensity={1.5}
            metalness={0.95}
            roughness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── FactoryWorkerRobots ──────────────────────────────────────────────────────
// 8 robot workers doing different factory tasks near the conveyor belts.
// BELT_POSITIONS: [-70,0.5,15], [-85,0.5,-10], [-100,0.5,20], [-115,0.5,0]

interface WorkerConfig {
  pos: [number, number, number]
  rotY: number
  job: 'wrench' | 'dolly' | 'clipboard' | 'weld' | 'carry' | 'panel' | 'paint' | 'inspect'
  phase: number
}

const WORKER_CONFIGS: WorkerConfig[] = [
  { pos: [-68, 0, 12],  rotY: 0.4,         job: 'wrench',    phase: 0 },
  { pos: [-73, 0, 18],  rotY: -0.5,        job: 'dolly',     phase: 1.0 },
  { pos: [-83, 0, -7],  rotY: 1.2,         job: 'clipboard', phase: 2.1 },
  { pos: [-87, 0, -13], rotY: -1.0,        job: 'weld',      phase: 0.5 },
  { pos: [-98, 0, 17],  rotY: 0.8,         job: 'carry',     phase: 3.2 },
  { pos: [-102, 0, 23], rotY: Math.PI,     job: 'panel',     phase: 1.7 },
  { pos: [-113, 0, 3],  rotY: -0.3,        job: 'paint',     phase: 2.8 },
  { pos: [-117, 0, -3], rotY: Math.PI / 2, job: 'inspect',   phase: 0.9 },
]

function WorkerRobot({ cfg }: { cfg: WorkerConfig }) {
  const leftArmRef  = useRef<THREE.Group>(null!)
  const rightArmRef = useRef<THREE.Group>(null!)
  const bodyRef     = useRef<THREE.Group>(null!)
  const sparkRef    = useRef<THREE.MeshStandardMaterial>(null!)
  const frameSkip   = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime() + cfg.phase
    const bob  = Math.sin(t * 1.8) * 0.25
    const sway = Math.sin(t * 0.9) * 0.04

    if (bodyRef.current) bodyRef.current.rotation.z = sway

    switch (cfg.job) {
      case 'wrench':
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.6 + Math.sin(t * 2.0) * 0.5
        if (leftArmRef.current)  leftArmRef.current.rotation.x  =  0.15
        break
      case 'dolly':
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.3 + Math.sin(t * 1.2) * 0.1
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.3 + Math.sin(t * 1.2) * 0.1
        break
      case 'clipboard':
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8 + Math.sin(t * 0.7) * 0.1
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.3
        break
      case 'weld':
        if (rightArmRef.current) rightArmRef.current.rotation.x = -1.1 + Math.sin(t * 3.0) * 0.15
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.2
        if (sparkRef.current)    sparkRef.current.emissiveIntensity = 3 + Math.sin(t * 8) * 2.5
        break
      case 'carry':
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -1.4
        if (rightArmRef.current) rightArmRef.current.rotation.x = -1.4
        break
      case 'panel':
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.5 + Math.sin(t * 1.5) * 0.3
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5 + Math.cos(t * 1.5) * 0.3
        break
      case 'paint':
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.4 + Math.sin(t * 2.5) * 0.6
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.2
        break
      case 'inspect':
        if (bodyRef.current)     bodyRef.current.rotation.x     = 0.3 + Math.sin(t * 0.6) * 0.05
        if (leftArmRef.current)  leftArmRef.current.rotation.x  = -0.8
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.8
        break
    }
    // use bob on body Y via a ref-based approach — we shift the whole group slightly
    if (bodyRef.current && cfg.job !== 'inspect') {
      bodyRef.current.position.y = bob * 0.08
    }
  })

  return (
    <group position={cfg.pos} rotation={[0, cfg.rotY, 0]}>
      {/* Legs */}
      <mesh castShadow position={[-0.22, 0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.8, 8]} />
        <meshStandardMaterial color="#445566" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.22, 0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.8, 8]} />
        <meshStandardMaterial color="#445566" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Body group — everything above the legs */}
      <group ref={bodyRef} position={[0, 0.8, 0]}>
        {/* Torso */}
        <mesh castShadow position={[0, 0.65, 0]}>
          <boxGeometry args={[0.7, 1.3, 0.5]} />
          <meshStandardMaterial color="#556677" roughness={0.6} metalness={0.6} />
        </mesh>
        {/* Safety vest orange stripe across chest */}
        <mesh castShadow position={[0, 0.7, 0.26]}>
          <boxGeometry args={[0.75, 0.15, 0.02]} />
          <meshStandardMaterial color="#ff8800" emissive="#cc5500" emissiveIntensity={0.8} />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 1.5, 0]}>
          <boxGeometry args={[0.6, 0.55, 0.5]} />
          <meshStandardMaterial color="#667788" roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Safety helmet */}
        <mesh castShadow position={[0, 1.83, 0]}>
          <cylinderGeometry args={[0.4, 0.38, 0.2, 10]} />
          <meshStandardMaterial color="#ffcc00" emissive="#aa8800" emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.14, 1.52, 0.26]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#00aaff" emissive="#00ccff" emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <mesh position={[0.14, 1.52, 0.26]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#00aaff" emissive="#00ccff" emissiveIntensity={4} toneMapped={false} />
        </mesh>

        {/* Left arm — origin at shoulder, extends downward */}
        <group ref={leftArmRef} position={[-0.5, 1.15, 0]}>
          <mesh castShadow position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.0, 8]} />
            <meshStandardMaterial color="#556677" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* clipboard prop */}
          {cfg.job === 'clipboard' && (
            <mesh castShadow position={[0, -1.1, 0.2]}>
              <boxGeometry args={[0.45, 0.6, 0.06]} />
              <meshStandardMaterial color="#eeeecc" roughness={0.9} />
            </mesh>
          )}
        </group>

        {/* Right arm */}
        <group ref={rightArmRef} position={[0.5, 1.15, 0]}>
          <mesh castShadow position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.0, 8]} />
            <meshStandardMaterial color="#556677" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* wrench prop */}
          {cfg.job === 'wrench' && (
            <>
              <mesh castShadow position={[0, -1.0, 0]} rotation={[0, 0, 0.4]}>
                <cylinderGeometry args={[0.06, 0.06, 0.7, 6]} />
                <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh castShadow position={[0.08, -1.35, 0]}>
                <boxGeometry args={[0.18, 0.12, 0.1]} />
                <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
              </mesh>
            </>
          )}
          {/* weld spark */}
          {cfg.job === 'weld' && (
            <mesh position={[0.1, -1.05, 0.15]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshStandardMaterial
                ref={sparkRef}
                color="#ffcc00"
                emissive="#ffcc00"
                emissiveIntensity={5}
                toneMapped={false}
              />
            </mesh>
          )}
          {/* paint brush */}
          {cfg.job === 'paint' && (
            <>
              <mesh castShadow position={[0, -1.05, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
                <meshStandardMaterial color="#884400" roughness={0.9} />
              </mesh>
              <mesh castShadow position={[0, -1.42, 0.06]}>
                <boxGeometry args={[0.14, 0.2, 0.08]} />
                <meshStandardMaterial color="#dddddd" roughness={0.8} />
              </mesh>
            </>
          )}
        </group>

        {/* carry box on shoulder */}
        {cfg.job === 'carry' && (
          <mesh castShadow position={[0, 1.75, 0]}>
            <boxGeometry args={[0.8, 0.7, 0.7]} />
            <meshStandardMaterial color="#e8d090" roughness={0.9} />
          </mesh>
        )}

        {/* control panel (panel job) */}
        {cfg.job === 'panel' && (
          <mesh castShadow position={[0, 0.5, 0.7]}>
            <boxGeometry args={[0.8, 0.6, 0.1]} />
            <meshStandardMaterial color="#222233" emissive="#002244" emissiveIntensity={1} roughness={0.5} />
          </mesh>
        )}
      </group>

      {/* dolly cart (dolly job) — positioned in front of worker */}
      {cfg.job === 'dolly' && (
        <group position={[0, 0, 0.8]}>
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[0.9, 0.06, 0.6]} />
            <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* dolly wheels */}
          {([-0.35, 0.35] as number[]).map((wx, wi) => (
            <mesh key={wi} position={[wx, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
              <meshStandardMaterial color="#222222" roughness={0.8} />
            </mesh>
          ))}
          {/* stacked boxes on dolly */}
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[0.7, 0.6, 0.55]} />
            <meshStandardMaterial color="#d4b870" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 1.38, 0]}>
            <boxGeometry args={[0.7, 0.6, 0.55]} />
            <meshStandardMaterial color="#e8d090" roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function FactoryWorkerRobots() {
  return (
    <group>
      {WORKER_CONFIGS.map((cfg, i) => (
        <WorkerRobot key={`worker-${i}`} cfg={cfg} />
      ))}
    </group>
  )
}

// ─── ForkliftRobot ────────────────────────────────────────────────────────────
function ForkliftRobot() {
  const groupRef   = useRef<THREE.Group>(null!)
  const forkRef    = useRef<THREE.Group>(null!)
  const wheel0Ref  = useRef<THREE.Mesh>(null!)
  const wheel1Ref  = useRef<THREE.Mesh>(null!)
  const wheel2Ref  = useRef<THREE.Mesh>(null!)
  const wheel3Ref  = useRef<THREE.Mesh>(null!)
  const frameSkip  = useRef(0)
  const dirRef     = useRef(1)
  const posXRef    = useRef(-90)

  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    const t = performance.now() / 1000
    // drive back and forth
    posXRef.current += dirRef.current * 4 * step
    if (posXRef.current > -72) dirRef.current = -1
    if (posXRef.current < -108) dirRef.current = 1

    if (groupRef.current) {
      groupRef.current.position.x = posXRef.current
      groupRef.current.rotation.y = dirRef.current > 0 ? -Math.PI / 2 : Math.PI / 2
    }

    // raise / lower forks
    if (forkRef.current) {
      forkRef.current.position.y = 0.5 + Math.sin(t * 0.3) * 1.0
    }

    // spin wheels
    const wSpin = dirRef.current * step * 4
    if (wheel0Ref.current) wheel0Ref.current.rotation.z += wSpin
    if (wheel1Ref.current) wheel1Ref.current.rotation.z += wSpin
    if (wheel2Ref.current) wheel2Ref.current.rotation.z += wSpin
    if (wheel3Ref.current) wheel3Ref.current.rotation.z += wSpin
  })

  const WHEEL_POSITIONS: [number, number, number][] = [
    [-1.1,  0,  0.85],
    [ 1.1,  0,  0.85],
    [-1.1,  0, -0.85],
    [ 1.1,  0, -0.85],
  ]
  const wheelRefs = [wheel0Ref, wheel1Ref, wheel2Ref, wheel3Ref]

  // Warning stripe colors alternate yellow / black
  const STRIPE_COLORS = ['#ffcc00', '#111111', '#ffcc00', '#111111', '#ffcc00', '#111111'] as const
  const STRIPE_POSITIONS: [number, number, number][] = [
    [-1.0, 0.5, 0.76], [-0.6, 0.5, 0.76], [-0.2, 0.5, 0.76],
    [ 0.2, 0.5, 0.76], [ 0.6, 0.5, 0.76], [ 1.0, 0.5, 0.76],
  ]

  return (
    <group ref={groupRef} position={[-90, 0, 8]}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[2, 2, 1.5]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Operator cab at rear */}
      <mesh castShadow position={[0.8, 1.8, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.2]} />
        <meshStandardMaterial color="#ddaa00" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Cab glass */}
      <mesh position={[0.22, 1.85, 0]}>
        <boxGeometry args={[0.06, 0.9, 1.0]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.5} roughness={0.05} />
      </mesh>

      {/* Warning stripes on front face */}
      {STRIPE_POSITIONS.map((sp, i) => (
        <mesh key={`stripe-${i}`} position={sp}>
          <boxGeometry args={[0.38, 1.6, 0.06]} />
          <meshStandardMaterial color={STRIPE_COLORS[i]} roughness={0.6} />
        </mesh>
      ))}

      {/* Mast — 2 vertical bars at front */}
      <mesh castShadow position={[-1.1, 2.2, 0.45]}>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[-1.1, 2.2, -0.45]}>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Forks group — animates up/down */}
      <group ref={forkRef} position={[-1.08, 0.5, 0]}>
        {/* Fork tines */}
        <mesh castShadow position={[0, 0, 0.3]}>
          <boxGeometry args={[2.5, 0.15, 0.4]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0, -0.3]}>
          <boxGeometry args={[2.5, 0.15, 0.4]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Load — 3 stacked boxes on forks */}
        <mesh castShadow position={[-0.3, 0.45, 0]}>
          <boxGeometry args={[1.4, 0.6, 0.9]} />
          <meshStandardMaterial color="#e8d090" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.3, 1.08, 0]}>
          <boxGeometry args={[1.3, 0.6, 0.8]} />
          <meshStandardMaterial color="#d4b870" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.3, 1.7, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.7]} />
          <meshStandardMaterial color="#e8d090" roughness={0.9} />
        </mesh>
      </group>

      {/* Wheels — 4 flat cylinders, axis along Z so they spin on Z rotation */}
      {WHEEL_POSITIONS.map((wp, i) => (
        <mesh
          key={`fwheel-${i}`}
          ref={wheelRefs[i]}
          castShadow
          position={wp}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.5, 0.5, 0.3, 12]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
      ))}

      {/* Warning light on top */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.4, 0]} color="#ff4400" intensity={2} distance={8} />
    </group>
  )
}

// ─── RooftopMoneyRain ──────────────────────────────────────────────────────────
const RMONEY_COUNT = 60
const RMONEY_SPAWN_Y = HELIPAD_Y + 1.5   // just above helipad top
const RMONEY_CYCLE = 8                   // seconds per burst cycle

interface RMoneyState {
  x: number; y: number; z: number
  vx: number; vy: number
  rotZ: number; rotVZ: number
  active: boolean
  delay: number
}

function RooftopMoneyRain() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const timeRef = useRef(0)
  const frameSkip = useRef(0)

  const states = useMemo<RMoneyState[]>(() =>
    Array.from({ length: RMONEY_COUNT }, (_, i) => ({
      x: TALLEST_X + (Math.random() - 0.5) * 10,
      y: RMONEY_SPAWN_Y + Math.random() * 4,
      z: TALLEST_Z + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.5 + Math.random() * 2.0),
      rotZ: Math.random() * Math.PI * 2,
      rotVZ: (Math.random() - 0.5) * 4,
      active: false,
      delay: (i / RMONEY_COUNT) * RMONEY_CYCLE,
    })), [])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    timeRef.current += step
    const cycleT = timeRef.current % RMONEY_CYCLE

    states.forEach((s, i) => {
      // Activate bills in the first half of each cycle
      if (cycleT < RMONEY_CYCLE * 0.5 && !s.active) {
        s.active = true
        // Reset to spawn position
        s.x = TALLEST_X + (Math.random() - 0.5) * 10
        s.y = RMONEY_SPAWN_Y + Math.random() * 3
        s.z = TALLEST_Z + (Math.random() - 0.5) * 10
        s.vx = (Math.random() - 0.5) * 1.2
        s.vy = -(1.5 + Math.random() * 2.0)
        s.rotVZ = (Math.random() - 0.5) * 4
      }
      if (cycleT >= RMONEY_CYCLE * 0.5) s.active = false

      if (s.active) {
        s.y += s.vy * step
        s.x += s.vx * step
        s.rotZ += s.rotVZ * step
        if (s.y < ROOFTOP_Y - 2) {
          // Landed — reset
          s.y = RMONEY_SPAWN_Y + Math.random() * 4
          s.x = TALLEST_X + (Math.random() - 0.5) * 10
          s.z = TALLEST_Z + (Math.random() - 0.5) * 10
        }
      }

      if (s.active) {
        dummy.position.set(s.x, s.y, s.z)
        dummy.rotation.set(Math.PI * 0.1, s.rotZ * 0.3, s.rotZ)
        dummy.scale.set(1, 1, 1)
      } else {
        // Hide by scaling to zero
        dummy.position.set(TALLEST_X, ROOFTOP_Y - 5, TALLEST_Z)
        dummy.scale.set(0, 0, 0)
      }
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RMONEY_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.3, 0.5, 0.02]} />
      <meshStandardMaterial color="#00aa44" transparent opacity={0.9} emissive="#007722" emissiveIntensity={0.4} />
    </instancedMesh>
  )
}

// ─── Main world ───────────────────────────────────────────────────────────────
export default function TycoonWorld() {
  const [_tick] = useState(0)

  const stalls: { pos: [number, number, number]; color: string }[] = [
    { pos: [55, 0.6, -30], color: '#ff4444' },
    { pos: [65, 0.6, -30], color: '#44aaff' },
    { pos: [75, 0.6, -30], color: '#ffcc00' },
    { pos: [85, 0.6, -30], color: '#44ff88' },
    { pos: [55, 0.6, -15], color: '#ff88aa' },
    { pos: [65, 0.6, -15], color: '#aa44ff' },
    { pos: [75, 0.6, -15], color: '#ff7700' },
    { pos: [85, 0.6, -15], color: '#00ffee' },
  ]

  return (
    <>
      {/* SKY */}
      <GradientSky top="#0a0820" bottom="#1a1040" radius={440} />
      <Stars />

      {/* LIGHTS */}
      <ambientLight intensity={0.25} />
      {/* Financial district gold lights */}
      <pointLight position={[0, 20, 0]} color="#ffd700" intensity={3} distance={80} />
      <pointLight position={[-20, 15, -20]} color="#ffaa00" intensity={2} distance={60} />
      <pointLight position={[20, 15, 20]} color="#ffd700" intensity={2} distance={60} />
      {/* Industrial neon lights */}
      <pointLight position={[-80, 12, 0]} color="#8800ff" intensity={3} distance={70} />
      <pointLight position={[-100, 8, -30]} color="#0044ff" intensity={2} distance={50} />
      {/* Trading quarter */}
      <pointLight position={[80, 12, 0]} color="#ff6600" intensity={2} distance={60} />

      {/* MONEY RAIN */}
      <MoneyRain />

      {/* GOLDEN VORTEX */}
      <GoldenVortex />

      {/* MARKET NEON SIGNS */}
      <MarketNeonSigns />

      {/* ANIMATED STOCK TICKER */}
      <StockTicker />

      {/* REVENUE COUNTER */}
      <RevenueDisplay />

      {/* ══════════════════════════════════════════════════════
          GROUND — full 250×250 map base
      ══════════════════════════════════════════════════════ */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[250, 1, 250]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Industrial ground overlay */}
      <mesh position={[-80, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 120]} />
        <meshStandardMaterial color="#2a2a2a" roughness={1} />
      </mesh>

      {/* Trading quarter ground */}
      <mesh position={[80, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 120]} />
        <meshStandardMaterial color="#1e1a10" roughness={0.9} />
      </mesh>

      {/* ══════════════════════════════════════════════════════
          ФИНАНСОВЫЙ РАЙОН — center, -40..40 x -40..40
      ══════════════════════════════════════════════════════ */}
      <CentralPlaza />

      {/* 3×3 grid of tall buildings */}
      {([ // [x, z, scale, letter]
        [-28, -28, 3.8, 'a'], [0, -28, 4.2, 'b'], [28, -28, 3.5, 'c'],
        [-28,   0, 4.5, 'd'], [0,   0, 4.0, 'e'], [28,   0, 3.8, 'f'],
        [-28,  28, 3.2, 'g'], [0,  28, 4.3, 'h'], [28,  28, 3.6, 'i'],
      ] as [number, number, number, string][]).map(([x, z, sc, key]) => (
        <Building key={key} pos={[x, 0, z]} scale={sc} />
      ))}

      {/* Lantern grid — 20 lights */}
      {Array.from({ length: 20 }).map((_, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return <Lantern key={`ln-${i}`} pos={[-15 + col * 10, 0, -15 + row * 8]} />
      })}

      {/* 5 rotating golden rings above plaza */}
      <GoldenRing posY={6}  radius={5}  speed={0.4} phase={0} />
      <GoldenRing posY={9}  radius={8}  speed={0.3} phase={1.2} />
      <GoldenRing posY={12} radius={11} speed={0.25} phase={2.4} />
      <GoldenRing posY={15} radius={14} speed={0.2} phase={0.8} />
      <GoldenRing posY={18} radius={17} speed={0.15} phase={1.8} />

      {/* Central plaza Fountain */}
      <Fountain pos={[0, 0, 0]} />

      {/* Achievement Trophies */}
      <Trophy pos={[10, 0, 0]} />
      <Trophy pos={[20, 0, 0]} />
      <Trophy pos={[30, 0, 0]} />

      {/* Scenery accents — financial */}
      <Pillar pos={[-13, 0, -13]} />
      <Pillar pos={[13, 0, -13]} />
      <Pillar pos={[-13, 0, 13]} />
      <Pillar pos={[13, 0, 13]} />
      <Well pos={[0, 0, 14]} />
      <Sign pos={[-5, 0, -14]} label="БИРЖА" />
      <Sign pos={[5, 0, -14]} label="БАНК" />
      <Bench pos={[-8, 0, 10]} />
      <Bench pos={[8, 0, 10]} />

      {/* CrystalCluster — золотые месторождения, символы богатства */}
      <CrystalCluster pos={[-22, 0, -22]} scale={1.4} rotY={0.3} />
      <CrystalCluster pos={[22, 0, -22]} scale={1.2} rotY={1.1} />
      <CrystalCluster pos={[-22, 0, 22]} scale={1.5} rotY={2.0} />
      <CrystalCluster pos={[22, 0, 22]} scale={1.3} rotY={0.8} />
      <CrystalCluster pos={[0, 0, 35]} scale={1.6} rotY={1.5} />

      {/* ══════════════════════════════════════════════════════
          ТОРГОВЫЙ КВАРТАЛ — east, x: 40..120, z: -60..60
      ══════════════════════════════════════════════════════ */}
      {/* 6 medium buildings */}
      <Building pos={[55, 0, -45]} scale={2.5} />
      <Building pos={[75, 0, -45]} scale={2.8} />
      <Building pos={[95, 0, -45]} scale={2.3} />
      <Building pos={[55, 0, 40]} scale={2.6} />
      <Building pos={[75, 0, 40]} scale={2.4} />
      <Building pos={[95, 0, 40]} scale={2.7} />

      {/* Market stalls — 8 geometry stalls in rows */}
      {stalls.map((s) => (
        <LocalMarketStall key={s.pos.join(',')} pos={s.pos} color={s.color} />
      ))}

      {/* GLB MarketStall props — trading quarter rows */}
      <MarketStall pos={[55, 0, -20]} scale={1.2} rotY={Math.PI / 2} />
      <MarketStall pos={[55, 0, 0]}   scale={1.2} rotY={Math.PI / 2} />
      <MarketStall pos={[55, 0, 20]}  scale={1.2} rotY={Math.PI / 2} />
      <MarketStall pos={[70, 0, -20]} scale={1.2} rotY={-Math.PI / 2} />
      <MarketStall pos={[70, 0, 0]}   scale={1.2} rotY={-Math.PI / 2} />
      <MarketStall pos={[70, 0, 20]}  scale={1.2} rotY={-Math.PI / 2} />

      {/* Achievement Podium — financial district */}
      <Podium pos={[0, 0, -30]} scale={2.0} />

      {/* Outdoor café — 4 tables + 4 chairs */}
      <GenTable pos={[60, 0, 10]} />
      <GenTable pos={[67, 0, 10]} />
      <GenTable pos={[74, 0, 10]} />
      <GenTable pos={[81, 0, 10]} />
      <Chair pos={[60, 0, 13]} />
      <Chair pos={[67, 0, 13]} />
      <Chair pos={[74, 0, 13]} />
      <Chair pos={[81, 0, 13]} />

      {/* 6 colorful flags */}
      <Flag pos={[45, 0, -55]} color="#ff4444" />
      <Flag pos={[60, 0, -55]} color="#44aaff" />
      <Flag pos={[80, 0, -55]} color="#ffcc00" />
      <Flag pos={[45, 0, 55]} color="#44ff88" />
      <Flag pos={[65, 0, 55]} color="#ff88aa" />
      <Flag pos={[95, 0, 55]} color="#aa44ff" />

      {/* 8 parked cars */}
      <ParkedCar pos={[50, 0, -5]} model="taxi" rotY={0} />
      <ParkedCar pos={[50, 0, 5]} model="sedan" rotY={0} />
      <ParkedCar pos={[50, 0, 25]} model="taxi" rotY={Math.PI} />
      <ParkedCar pos={[110, 0, -10]} model="sedan" rotY={Math.PI} />
      <ParkedCar pos={[110, 0, 10]} model="taxi" rotY={Math.PI} />
      <ParkedCar pos={[110, 0, 30]} model="sedan" rotY={0} />
      <ParkedCar pos={[70, 0, -55]} model="taxi" rotY={Math.PI / 2} />
      <ParkedCar pos={[90, 0, -55]} model="sedan" rotY={Math.PI / 2} />
      {/* 5 extra cars */}
      <ParkedCar pos={[55, 0, 50]} model="sedan" rotY={-Math.PI / 2} />
      <ParkedCar pos={[70, 0, 50]} model="taxi" rotY={-Math.PI / 2} />
      <ParkedCar pos={[85, 0, 50]} model="sedan" rotY={-Math.PI / 2} />
      <ParkedCar pos={[100, 0, 50]} model="taxi" rotY={-Math.PI / 2} />
      <ParkedCar pos={[115, 0, 50]} model="sedan" rotY={-Math.PI / 2} />

      {/* Animated business car */}
      <BusinessCar />

      {/* IceBlock — ледяные скульптуры торгового квартала */}
      <IceBlock pos={[48, 0, -50]} scale={1.3} rotY={0.5} />
      <IceBlock pos={[65, 0, -50]} scale={1.1} rotY={1.2} />
      <IceBlock pos={[82, 0, -50]} scale={1.4} rotY={0.2} />
      <IceBlock pos={[99, 0, -50]} scale={1.2} rotY={2.1} />
      <IceBlock pos={[112, 0, -25]} scale={1.3} rotY={0.9} />

      {/* Trees around trading quarter */}
      <Tree pos={[45, 0, 25]} variant={0} />
      <Tree pos={[45, 0, -25]} variant={1} />
      <Tree pos={[115, 0, 25]} variant={2} />
      <Tree pos={[115, 0, -25]} variant={3} />

      {/* ══════════════════════════════════════════════════════
          ПРОМЫШЛЕННАЯ ЗОНА — west, x: -120..-40, z: -60..60
      ══════════════════════════════════════════════════════ */}
      {/* 4 large factory buildings */}
      <FactoryBuilding pos={[-70, 4, -35]} />
      <FactoryBuilding pos={[-100, 4, -35]} />
      <FactoryBuilding pos={[-70, 4, 35]} />
      <FactoryBuilding pos={[-100, 4, 35]} />

      {/* ══════════════════════════════════════════════════════
          CEO PENTHOUSE — on top of tallest factory [-70,4,-35]
      ══════════════════════════════════════════════════════ */}
      <Helipad />
      <CEOOffice />
      <RooftopMoneyRain />

      {/* 4 tall chimneys */}
      <Chimney pos={[-80, 0, -28]} />
      <Chimney pos={[-108, 0, -28]} />
      <Chimney pos={[-80, 0, 28]} />
      <Chimney pos={[-108, 0, 28]} />

      {/* 40 chimney smoke particles (instanced) */}
      <ChimneySmoke />

      {/* 3 rock formations */}
      <Rock pos={[-55, 0, -50]} scale={2} />
      <Rock pos={[-55, 0, 50]} scale={1.6} />
      <Rock pos={[-115, 0, 0]} scale={2.2} />

      {/* LavaRock — промышленные вулканические породы */}
      <LavaRock pos={[-75, 0, -55]} scale={1.8} rotY={0.4} />
      <LavaRock pos={[-95, 0, -55]} scale={1.5} rotY={1.3} />
      <LavaRock pos={[-75, 0, 55]} scale={1.7} rotY={2.2} />
      <LavaRock pos={[-110, 0, 50]} scale={1.6} rotY={0.7} />

      {/* Neon decor for industrial */}
      <Sign pos={[-60, 0, -40]} label="ЗАВОД" />
      <Sign pos={[-60, 0, 40]} label="ЦЕХ" />

      {/* Industrial pipework — pipe network connecting factory buildings */}
      <IndustrialPipework />

      {/* Heat glow vents — glowing hot floor vents */}
      <HeatGlow />

      {/* Conveyor belts — 4 animated belt segments */}
      <ConveyorBelts />

      {/* Factory robotic arms — 2 swinging arm silhouettes */}
      <FactoryArm />

      {/* SmokeStacks — 3 thick chimneys with 120 rising smoke particles */}
      <SmokeStacks />

      {/* ProductBoxes — 5 stacks of cardboard boxes near conveyor belts */}
      <ProductBoxes />

      {/* FactoryWindows — glowing yellow windows on factory building walls */}
      <FactoryWindows />

      {/* ══════════════════════════════════════════════════════
          STOCK MARKET TRADING FLOOR
      ══════════════════════════════════════════════════════ */}
      <TradingFloor />

      {/* ══════════════════════════════════════════════════════
          EXECUTIVE BOARDROOM
      ══════════════════════════════════════════════════════ */}
      <Boardroom />

      {/* ══════════════════════════════════════════════════════
          MONEY BAGS + GOLD BARS
      ══════════════════════════════════════════════════════ */}
      <MoneyBags />

      {/* ══════════════════════════════════════════════════════
          NPCS — 5 roles
      ══════════════════════════════════════════════════════ */}
      <NPC pos={[0, 0, -5]}   color="#ffd700" label="CEO"       />
      <NPC pos={[12, 0, 5]}   color="#c0a000" label="ИНВЕСТОР"  />
      <NPC pos={[70, 0, 20]}  color="#4488ff" label="МЕНЕДЖЕР"  />
      <NPC pos={[70, 0, -20]} color="#ff8800" label="ТОРГОВЕЦ"  />
      <NPC pos={[-65, 0, 0]}  color="#888888" label="РАБОЧИЙ"   />

      {/* ══════════════════════════════════════════════════════
          GLTF MONSTERS
      ══════════════════════════════════════════════════════ */}
      <GltfMonster which="cactoro" pos={[0, 0, 8]}    patrolX={4}  scale={1.1} sensor animation="Wave" />
      <GltfMonster which="alien"   pos={[80, 0, 0]}   patrolX={5}  scale={1.0} sensor animation="Wave" />
      <GltfMonster which="bunny"   pos={[-60, 0, -10]} patrolX={3} scale={0.9} sensor animation="Wave" />

      {/* ══════════════════════════════════════════════════════
          ENEMIES — 2 in industrial zone
      ══════════════════════════════════════════════════════ */}
      <Enemy pos={[-90, 0, 10]}  patrolX={8} />
      <Enemy pos={[-90, 0, -10]} patrolX={8} />

      {/* ══════════════════════════════════════════════════════
          30 COINS across all districts
      ══════════════════════════════════════════════════════ */}
      {/* Financial district — 10 */}
      <Coin pos={[-20, 1, -20]} />
      <Coin pos={[20, 1, -20]} />
      <Coin pos={[-20, 1, 20]} />
      <Coin pos={[20, 1, 20]} />
      <Coin pos={[0, 1, -30]} />
      <Coin pos={[0, 1, 30]} />
      <Coin pos={[-30, 1, 0]} />
      <Coin pos={[30, 1, 0]} />
      <Coin pos={[-10, 1, 0]} />
      <Coin pos={[10, 1, 0]} />
      {/* Trading quarter — 12 */}
      <Coin pos={[50, 1, 0]} />
      <Coin pos={[60, 1, -40]} />
      <Coin pos={[75, 1, -40]} />
      <Coin pos={[90, 1, -40]} />
      <Coin pos={[60, 1, 25]} />
      <Coin pos={[75, 1, 25]} />
      <Coin pos={[90, 1, 25]} />
      <Coin pos={[105, 1, 0]} />
      <Coin pos={[70, 1, 0]} />
      <Coin pos={[55, 1, 35]} />
      <Coin pos={[95, 1, -25]} />
      <Coin pos={[80, 1, 45]} />
      {/* Industrial zone — 8 */}
      <Coin pos={[-55, 1, 0]} />
      <Coin pos={[-70, 1, -50]} />
      <Coin pos={[-90, 1, -50]} />
      <Coin pos={[-110, 1, 0]} />
      <Coin pos={[-70, 1, 50]} />
      <Coin pos={[-90, 1, 50]} />
      <Coin pos={[-60, 1, 20]} />
      <Coin pos={[-115, 1, -40]} />

      {/* ══════════════════════════════════════════════════════
          ФИНАНСОВЫЙ МАГ — финальный босс у хранилища
      ══════════════════════════════════════════════════════ */}
      <BossWizard pos={[0, 0, -8]} scale={1.8} rotY={0} />

      {/* ══════════════════════════════════════════════════════
          GOAL TRIGGER
      ══════════════════════════════════════════════════════ */}
      <GoalTrigger
        pos={[0, 2, 0]}
        size={[15, 5, 15]}
        result={{ kind: 'win', label: 'БИЗНЕС-ИМПЕРИЯ!', subline: 'Ты стал тайкуном!' }}
      />
    </>
  )
}

export const TYCOON_SPAWN: [number, number, number] = [0, 3, 12]
