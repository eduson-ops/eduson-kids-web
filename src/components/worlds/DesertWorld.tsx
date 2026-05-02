import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'

const __isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Crystal, Pillar, Altar, Gate, Trophy, Lantern, Rock, Sign, Flag, TreeRound, PalmTree, BossWizard, LavaRock, CrystalCluster, PharaohMask, PharaohStaff, Obelisk as ObeliskGlb, UFO, Cactus, Scorpion } from '../Scenery'

// ─── Palette ────────────────────────────────────────────────────────────────
const SAND       = '#d4a855'
const STONE_GOLD = '#c8953c'
const DARK_STONE = '#5a4520'
const WATER_BLUE = '#44aaff'

// ─── Ground ─────────────────────────────────────────────────────────────────
function DesertGround() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[300, 0.5, 300]} />
        <meshStandardMaterial color={SAND} roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

// ─── Sand Dunes ──────────────────────────────────────────────────────────────
function SandDunes() {
  const dunes = useMemo(() => [
    { pos: [25, 0, -45] as [number,number,number], sx: 12, sy: 2.5, sz: 5, rotY: 0.3 },
    { pos: [-30, 0, -55] as [number,number,number], sx: 15, sy: 2.0, sz: 4, rotY: -0.5 },
    { pos: [40, 0, -80] as [number,number,number], sx: 18, sy: 3.0, sz: 6, rotY: 0.8 },
    { pos: [-45, 0, -70] as [number,number,number], sx: 14, sy: 2.2, sz: 5, rotY: -0.2 },
    { pos: [15, 0, -100] as [number,number,number], sx: 20, sy: 3.5, sz: 7, rotY: 0.6 },
    { pos: [-20, 0, -110] as [number,number,number], sx: 16, sy: 2.8, sz: 6, rotY: -0.9 },
    { pos: [55, 0, -30] as [number,number,number], sx: 10, sy: 1.8, sz: 4, rotY: 1.2 },
    { pos: [-55, 0, -40] as [number,number,number], sx: 13, sy: 2.3, sz: 5, rotY: 0.1 },
  ], [])
  return (
    <>
      {dunes.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={[0, d.rotY, 0]} scale={[d.sx, d.sy, d.sz]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshStandardMaterial color="#d4a855" roughness={0.95} metalness={0.0} />
        </mesh>
      ))}
    </>
  )
}

// ─── Pyramid Tier ────────────────────────────────────────────────────────────
function PyramidTier({
  pos, size, color = STONE_GOLD,
}: { pos: [number, number, number]; size: [number, number, number]; color?: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
    </RigidBody>
  )
}

// ─── Main Pyramid ────────────────────────────────────────────────────────────
function MainPyramid() {
  const capRef = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (capRef.current) {
      const mat = capRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 1.2) * 0.2
    }
  })
  return (
    <group position={[0, 0, 0]}>
      {/* 4 main tiers */}
      <PyramidTier pos={[0, 4,  0]} size={[60, 8, 60]} />
      <PyramidTier pos={[0, 12, 0]} size={[45, 8, 45]} />
      <PyramidTier pos={[0, 20, 0]} size={[30, 8, 30]} />
      <PyramidTier pos={[0, 28, 0]} size={[15, 8, 15]} />

      {/* Capstone cone */}
      <mesh ref={capRef} position={[0, 36, 0]} castShadow>
        <coneGeometry args={[7, 10, 4]} />
        <meshStandardMaterial
          color="#ffd644"
          emissive="#ffd644"
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Capstone glow light */}
      <pointLight position={[0, 40, 0]} color="#ffd644" intensity={3} distance={60} />
    </group>
  )
}

// ─── Pyramid Sunset Glow ─────────────────────────────────────────────────────
// 2 amber point-lights opposite each other around the pyramid base
const GLOW_RADIUS = 25

function PyramidSunsetGlow() {
  return (
    <>
      <pointLight position={[GLOW_RADIUS, 0.5, 0]} color="#ff6600" intensity={4} distance={55} />
      <pointLight position={[-GLOW_RADIUS, 0.5, 0]} color="#ff6600" intensity={4} distance={55} />
    </>
  )
}

// ─── Small Flanking Pyramid ──────────────────────────────────────────────────
function SmallPyramid({ ox, oz }: { ox: number; oz: number }) {
  return (
    <group position={[ox, 0, oz]}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 6, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[20, 12, 20]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 16, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[20, 8, 20]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* mini cap */}
      <mesh position={[0, 22, 0]}>
        <coneGeometry args={[4, 6, 4]} />
        <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Sphinx ──────────────────────────────────────────────────────────────────
function Sphinx() {
  return (
    <group position={[0, 0, 40]}>
      {/* Body */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.75, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 3.5, 12]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.92} />
        </mesh>
      </RigidBody>
      {/* Head */}
      <mesh position={[0, 5, -4.5]} castShadow>
        <sphereGeometry args={[2.5, 12, 10]} />
        <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
      </mesh>
      {/* Headdress */}
      <mesh position={[0, 6.2, -4.5]} castShadow>
        <boxGeometry args={[5, 3, 0.5]} />
        <meshStandardMaterial color="#c07a20" roughness={0.85} />
      </mesh>
      {/* Left paw */}
      <RigidBody type="fixed" colliders="cylinder" position={[-2.5, 0.75, 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 3, 8]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Right paw */}
      <RigidBody type="fixed" colliders="cylinder" position={[2.5, 0.75, 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 3, 8]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Glowing eyes */}
      <mesh position={[-0.7, 5.2, -6.9]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.7, 5.2, -6.9]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 5.2, -7]} color="#ff8800" intensity={1.5} distance={10} />
    </group>
  )
}

// ─── Oasis ───────────────────────────────────────────────────────────────────
function Oasis() {
  const poolRef = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (poolRef.current) {
      const mat = poolRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05
    }
  })

  const palmAngles = useMemo(
    () => [0, 1.05, 2.09, 3.14, 4.19, 5.24],
    []
  )

  return (
    <group position={[-60, 0, 0]}>
      {/* Water pool */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, 0]}>
        <mesh ref={poolRef} receiveShadow>
          <cylinderGeometry args={[8, 8, 0.2, 24]} />
          <meshStandardMaterial
            color={WATER_BLUE}
            emissive={WATER_BLUE}
            emissiveIntensity={0.2}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      </RigidBody>

      {/* Oasis glow */}
      <pointLight position={[0, 2, 0]} color="#44aaff" intensity={2} distance={20} />

      {/* Palm trees */}
      {palmAngles.map((a, i) => (
        <TreeRound
          key={i}
          pos={[Math.cos(a) * 11, 0, Math.sin(a) * 11]}
          scale={1.2}
          rotY={a}
        />
      ))}

      {/* Crystal gem reeds */}
      <Crystal pos={[5, 0, 3]} scale={0.7} />
      <Crystal pos={[-4, 0, 6]} scale={0.5} />
      <Crystal pos={[6, 0, -5]} scale={0.6} />

      {/* Lanterns along water */}
      <Lantern pos={[9, 0, 0]}  />
      <Lantern pos={[-9, 0, 0]} />
      <Lantern pos={[0, 0, 9]}  />
      <Lantern pos={[0, 0, -9]} />

      {/* Coins at oasis */}
      <Coin pos={[3, 1, 2]} />
      <Coin pos={[-3, 1, 3]} />
      <Coin pos={[0, 1, -4]} />
    </group>
  )
}

// ─── Sandstorm Particles ─────────────────────────────────────────────────────
function SandstormParticles() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)
  const COUNT = 300
  const data = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 140,
    y: Math.random() * 12,
    z: (Math.random() - 0.5) * 140,
    speed: 8 + Math.random() * 14,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 1 + Math.random() * 2,
    size: 0.05 + Math.random() * 0.08,
  })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    const step = _isLow ? dt * 2 : dt
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      d.x += d.speed * step
      if (d.x > 70) d.x = -70
      dummy.position.set(
        d.x,
        d.y + Math.sin(t * d.wobbleSpeed + d.wobble) * 0.4,
        d.z + Math.cos(t * d.wobbleSpeed * 0.7 + d.wobble) * 0.3,
      )
      dummy.scale.setScalar(d.size)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#c8a050" transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── Sand Vortex ─────────────────────────────────────────────────────────────
// 60 particles spiraling above the treasure vault entrance (world pos ~[0,4,-10])
const VORTEX_COUNT = 60

function SandVortex() {
  const frameSkip = useRef(0)
  // Pre-compute per-particle constants: base radius, angular offset, vertical offset, speed
  const vortexData = useMemo(() =>
    Array.from({ length: VORTEX_COUNT }, (_, i) => ({
      baseRadius:    0.5 + (i / VORTEX_COUNT) * 5,   // 0.5 → 5.5 spiral radius
      angleOffset:   (i / VORTEX_COUNT) * Math.PI * 4, // two full turns
      heightOffset:  (i / VORTEX_COUNT) * 3,           // rises 0 → 3 units
      orbitSpeed:    1.2 + (i / VORTEX_COUNT) * 0.8,  // inner faster
      bobPhase:      Math.random() * Math.PI * 2,
    })), [])

  const meshRefs = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < VORTEX_COUNT; i++) {
      const m = meshRefs.current[i]
      if (!m) continue
      const d = vortexData[i]!
      const angle = d.angleOffset + t * d.orbitSpeed
      m.position.set(
        Math.cos(angle) * d.baseRadius,
        d.heightOffset + Math.sin(t * 2 + d.bobPhase) * 0.25,
        Math.sin(angle) * d.baseRadius,
      )
    }
  })

  return (
    // Positioned above the treasure vault entrance
    <group position={[0, 4, -10]}>
      {vortexData.map((d, i) => (
        <mesh key={i} ref={el => { if (el) meshRefs.current[i] = el }}>
          <sphereGeometry args={[0.07, 4, 4]} />
          <meshBasicMaterial color="#d4a855" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Burial Chamber ──────────────────────────────────────────────────────────
function BurialChamber({ pos }: { pos: [number, number, number] }) {
  const [ox, oy, oz] = pos
  const wallMat = { color: STONE_GOLD, roughness: 0.9 } as const
  return (
    <group position={[ox, oy, oz]}>
      {/* 4 walls */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, -2.5]}>
        <mesh castShadow receiveShadow><boxGeometry args={[6, 3, 0.4]} /><meshStandardMaterial {...wallMat} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.5, 2.5]}>
        <mesh castShadow receiveShadow><boxGeometry args={[6, 3, 0.4]} /><meshStandardMaterial {...wallMat} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-3, 1.5, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.4, 3, 5.4]} /><meshStandardMaterial {...wallMat} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[3, 1.5, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.4, 3, 5.4]} /><meshStandardMaterial {...wallMat} /></mesh>
      </RigidBody>
      {/* Contents */}
      <Altar pos={[0, 0, 0]} />
      <Crystal pos={[-1.5, 0, -1]} scale={0.7} />
      <Crystal pos={[1.5, 0, -1]} scale={0.6} />
      <Coin pos={[0, 1, 0]} />
    </group>
  )
}

// ─── Hieroglyph Obelisk ───────────────────────────────────────────────────────
function Obelisk({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 4, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 8, 1]} />
          <meshStandardMaterial color={DARK_STONE} roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Pointed top */}
      <mesh position={[0, 8.8, 0]} castShadow>
        <coneGeometry args={[0.7, 1.6, 4]} />
        <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Guard Statue ─────────────────────────────────────────────────────────────
function GuardStatue({ pos, rotY = 0 }: { pos: [number, number, number]; rotY?: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Body */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.5, 6, 2.5]} />
          <meshStandardMaterial color={STONE_GOLD} roughness={0.92} />
        </mesh>
      </RigidBody>
      {/* Head */}
      <mesh position={[0, 7.2, 0]} castShadow>
        <sphereGeometry args={[1.2, 10, 8]} />
        <meshStandardMaterial color={STONE_GOLD} roughness={0.9} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-0.35, 7.3, -1.15]}>
        <sphereGeometry args={[0.15, 5, 5]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.35, 7.3, -1.15]}>
        <sphereGeometry args={[0.15, 5, 5]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

// ─── Sacred Geometry Floor ───────────────────────────────────────────────────
// Subtle amber glow plane between the pyramid (z=0) and sphinx (z=40) → centred at z=20
function SacredGeometryFloor() {
  return (
    <mesh
      position={[0, 0.1, 20]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={3}
    >
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="#cc9944" transparent opacity={0.15} depthWrite={false} />
    </mesh>
  )
}

// ─── Heat Haze ───────────────────────────────────────────────────────────────
function HeatHaze() {
  return (
    <>
      {/* Main ground shimmer */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[300, 300]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.05} depthWrite={false} />
      </mesh>
      {/* Mirage shimmer at distance */}
      {[
        [80,  0, 0], [-80, 0, 0], [0, 0, 80], [0, 0, -80],
        [60, 0, 60], [-60, 0, 60], [60, 0, -60], [-60, 0, -60],
      ].map(([x, , z], i) => (
        <mesh key={i} position={[x!, 0.3, z!]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#ffcc44" transparent opacity={0.04} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// ─── Heat Shimmer (ShaderMaterial) ───────────────────────────────────────────
// 150×150 animated heat-haze overlay at y=0.03, driven by GLSL fragment shader.
const HEAT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const HEAT_FRAG = /* glsl */ `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float shimmer = sin(vUv.x * 40.0 + iTime * 3.0) * sin(vUv.y * 35.0 + iTime * 2.5) * 0.5 + 0.5;
    vec3 col = mix(vec3(0.9, 0.7, 0.3), vec3(1.0, 0.95, 0.7), shimmer);
    gl_FragColor = vec4(col, shimmer * 0.08);
  }
`

function HeatShimmer() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const frameSkip = useRef(0)

  const uniforms = useMemo(
    () => ({ iTime: { value: 0 } }),
    []
  )

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) {
      matRef.current.uniforms.iTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh
      position={[0, 0.03, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={4}
    >
      <planeGeometry args={[150, 150]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={HEAT_VERT}
        fragmentShader={HEAT_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Desert Oasis ─────────────────────────────────────────────────────────────
// Small oasis feature at [20, 0, -30] — open interior area, no existing objects.
function DesertOasis() {
  const palmAngles = useMemo(
    () => [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5],
    []
  )

  return (
    <group position={[20, 0, -30]}>
      {/* Water pool */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial
          color="#1a6fa8"
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Gentle water glow */}
      <pointLight position={[0, 1, 0]} color="#44aaff" intensity={3} distance={18} decay={2} />

      {/* Palm trees around pool at radius 7 */}
      {palmAngles.map((a, i) => (
        <PalmTree
          key={i}
          pos={[Math.cos(a) * 7, 0, Math.sin(a) * 7]}
          scale={1.3}
          rotY={a + Math.PI}
        />
      ))}

      {/* Rocks on pool edge */}
      <Rock pos={[5, 0, 3]}  scale={0.6} />
      <Rock pos={[-4, 0, -5]} scale={0.5} />
    </group>
  )
}

// ─── Sun God Rays ─────────────────────────────────────────────────────────────
// 3 semi-transparent cone beams descending from y=50, slowly rotating.
const RAY_POSITIONS: [number, number, number][] = [
  [-20, 50, 40],
  [  0, 50, 30],
  [ 20, 50, 50],
]

function SunGodRay() {
  const groupRef = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)

  useFrame((_state, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (groupRef.current) {
      const step = _isLow ? dt * 2 : dt
      groupRef.current.children.forEach(child => {
        child.rotation.y += step * 0.1
      })
    }
  })

  return (
    <group ref={groupRef}>
      {RAY_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[8, 40, 12, 1, true]} />
          <meshBasicMaterial
            color="#ffdd88"
            transparent
            opacity={0.04}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── Treasure Vault ───────────────────────────────────────────────────────────
function TreasureVault() {
  return (
    <group position={[0, 4, -10]}>
      <Trophy pos={[-3, 0, 0]} />
      <Trophy pos={[0, 0, 0]} />
      <Trophy pos={[3, 0, 0]} />
      <Crystal pos={[-2, 0, -2]} scale={0.8} />
      <Crystal pos={[2, 0, -2]} scale={0.9} />
      <Crystal pos={[-2.5, 0, 1.5]} scale={0.7} />
      <Crystal pos={[2.5, 0, 1.5]} scale={0.75} />
      <Lantern pos={[-4, 0, 0]} />
      <Lantern pos={[4, 0, 0]} />
      <pointLight position={[0, 2, 0]} color="#ffd644" intensity={6} distance={20} />
      {/* Vault coins */}
      <Coin pos={[-1, 1, 0]} />
      <Coin pos={[1, 1, 0]} />
      <Coin pos={[0, 1, 1]} />
      <Coin pos={[0, 1, -1]} />
    </group>
  )
}

// ─── Pyramid Entrance Coins ───────────────────────────────────────────────────
function PyramidCoins() {
  // 20 coins scattered on tiers and around
  const coinPositions: [number, number, number][] = [
    // Tier 1 corners
    [25,  8.5,  25], [-25, 8.5, 25], [25, 8.5, -25], [-25, 8.5, -25],
    // Tier 2
    [18, 16.5, 18], [-18, 16.5, 18], [18, 16.5, -18], [-18, 16.5, -18],
    // Tier 3
    [11, 24.5, 11], [-11, 24.5, 11],
    // Ground approach
    [10, 0.5, 45], [-10, 0.5, 45], [0, 0.5, 50],
    // Small pyramids
    [55, 0.5, -28], [-55, 0.5, -28], [65, 0.5, -32], [-65, 0.5, -32],
    // Desert scatter
    [35, 0.5, 20], [-35, 0.5, 20], [0, 0.5, 30],
  ]
  return (
    <>
      {coinPositions.map((p, i) => <Coin key={i} pos={p} />)}
    </>
  )
}

// ─── Ceremonial Avenue (Pillars) ──────────────────────────────────────────────
function CeremonialAvenue() {
  const zPositions = [55, 62, 70]
  return (
    <>
      {zPositions.map((z, i) => (
        <group key={i}>
          <Pillar pos={[-8, 0, z]} />
          <Pillar pos={[ 8, 0, z]} />
        </group>
      ))}
    </>
  )
}

// ─── Hovering UFO ─────────────────────────────────────────────────────────────
function HoveringUFO() {
  const grpRef = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (!grpRef.current) return
    const t = clock.elapsedTime
    // Slow circular hover over the pyramid area
    grpRef.current.position.x = Math.sin(t * 0.18) * 15
    grpRef.current.position.y = 18 + Math.sin(t * 0.7) * 1.5
    grpRef.current.position.z = -30 + Math.cos(t * 0.18) * 8
    grpRef.current.rotation.y = t * 0.3
  })
  return (
    <group ref={grpRef}>
      {/* UFO model */}
      <UFO pos={[0, 0, 0]} scale={3.0} />
      {/* Tractor beam — translucent green cone pointing down */}
      <mesh position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2.5, 10, 32, 1, true]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Glow light */}
      <pointLight color="#00ff88" intensity={4} distance={20} />
    </group>
  )
}

// ─── SandStorm ────────────────────────────────────────────────────────────────
function SandStorm() {
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const COUNT = 300
  const ref = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: Math.random() * 18 + 0.5,
      z: (Math.random() - 0.5) * 200,
      speed: Math.random() * 0.08 + 0.04,
      drift: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.08 + 0.04,
    })), [])

  useFrame((_, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    particles.forEach((p, i) => {
      p.x += p.speed
      p.y += Math.sin(p.phase + p.x * 0.1) * 0.02
      p.z += p.drift
      p.phase += dt * (_isLow ? 1 : 0.5)
      if (p.x > 100) p.x = -100
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#d4a853" transparent opacity={0.35} />
    </instancedMesh>
  )
}

// ─── DesertHeatHaze ───────────────────────────────────────────────────────────
function DesertHeatHaze() {
  return (
    <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#ffcc88" transparent opacity={0.04} depthWrite={false} />
    </mesh>
  )
}

// ─── VultureGroup ─────────────────────────────────────────────────────────────
const VULTURE_CONFIGS = [
  { radius: 30, speed: 0.22, startAngle: 0,              height: 35 },
  { radius: 40, speed: 0.17, startAngle: Math.PI * 0.66, height: 42 },
  { radius: 50, speed: 0.13, startAngle: Math.PI * 1.33, height: 45 },
] as const

function VultureGroup() {
  const refs = useRef<THREE.Group[]>([])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < VULTURE_CONFIGS.length; i++) {
      const g = refs.current[i]
      if (!g) continue
      const cfg = VULTURE_CONFIGS[i]!
      const angle = cfg.startAngle + t * cfg.speed
      g.position.set(
        Math.cos(angle) * cfg.radius,
        cfg.height,
        Math.sin(angle) * cfg.radius,
      )
      // Face direction of travel
      g.rotation.y = -angle - Math.PI * 0.5
    }
  })

  return (
    <>
      {VULTURE_CONFIGS.map((_, i) => (
        <group key={i} ref={el => { if (el) refs.current[i] = el }}>
          {/* Body — ellipsoid */}
          <mesh scale={[2, 0.5, 1]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#333333" roughness={0.9} />
          </mesh>
          {/* Left wing */}
          <mesh position={[-1.5, 0, 0]}>
            <boxGeometry args={[3, 0.1, 0.8]} />
            <meshStandardMaterial color="#222222" roughness={0.9} />
          </mesh>
          {/* Right wing */}
          <mesh position={[1.5, 0, 0]}>
            <boxGeometry args={[3, 0.1, 0.8]} />
            <meshStandardMaterial color="#222222" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Cactus Grove ─────────────────────────────────────────────────────────────
// Fills two sparse zones: Southwest (X:-60→-100, Z:-50→-110) and
// Northeast (X:60→100, Z:20→90) with cacti and palm trees.
const ROT_CYCLE: number[] = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]

function CactusGrove() {
  const swCacti: [number, number, number][] = [
    [-65, 0, -55], [-78, 0, -62], [-88, 0, -70], [-95, 0, -55], [-70, 0, -78],
    [-82, 0, -85], [-92, 0, -92], [-65, 0, -95], [-75, 0, -105], [-85, 0, -100],
    [-60, 0, -72], [-98, 0, -78],
  ]
  const neCacti: [number, number, number][] = [
    [65, 0, 25], [75, 0, 35], [85, 0, 28], [90, 0, 45], [70, 0, 55],
    [80, 0, 62], [92, 0, 70], [65, 0, 75], [78, 0, 82], [88, 0, 88],
  ]
  const swPalms: { pos: [number, number, number]; scale: number }[] = [
    { pos: [-72, 0, -65], scale: 1.4 },
    { pos: [-85, 0, -90], scale: 1.6 },
    { pos: [-60, 0, -105], scale: 1.3 },
  ]
  const nePalms: { pos: [number, number, number]; scale: number }[] = [
    { pos: [72, 0, 45], scale: 1.5 },
    { pos: [85, 0, 75], scale: 1.3 },
  ]

  return (
    <>
      {swCacti.map((pos, i) => (
        <Cactus key={`swc-${i}`} pos={pos} rotY={ROT_CYCLE[i % 7]!} />
      ))}
      {neCacti.map((pos, i) => (
        <Cactus key={`nec-${i}`} pos={pos} rotY={ROT_CYCLE[i % 7]!} />
      ))}
      {swPalms.map((p, i) => (
        <PalmTree key={`swp-${i}`} pos={p.pos} scale={p.scale} />
      ))}
      {nePalms.map((p, i) => (
        <PalmTree key={`nep-${i}`} pos={p.pos} scale={p.scale} />
      ))}
    </>
  )
}

// ─── Bedouin Trader Camp ──────────────────────────────────────────────────────
// Camp is anchored near the main Oasis at [-60,0,0].
// Individual tent centres are offset so they don't overlap the water pool.

const TENT_CONFIGS = [
  { ox: -72, oz:  18, color: '#cc4422' as const, phase: 0   },
  { ox: -50, oz:  22, color: '#2244cc' as const, phase: 1.2 },
  { ox: -48, oz: -20, color: '#cc8822' as const, phase: 2.4 },
  { ox: -74, oz: -18, color: '#448822' as const, phase: 3.6 },
] as const

function TraderTents() {
  return (
    <>
      {TENT_CONFIGS.map(({ ox, oz, color, phase }, ti) => (
        <group key={ti} position={[ox, 0, oz]}>
          {/* Ground cloth */}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[6, 0.1, 5]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>

          {/* Tent roof — 4-sided pyramid cone */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[3.5, 2.5, 4]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>

          {/* Tent walls — two angled panels forming A-frame below roof */}
          {/* Left panel */}
          <mesh position={[-1.4, 1.25, 0]} rotation={[0, 0, Math.PI / 5]} castShadow>
            <boxGeometry args={[0.12, 2.5, 4.8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          {/* Right panel */}
          <mesh position={[1.4, 1.25, 0]} rotation={[0, 0, -Math.PI / 5]} castShadow>
            <boxGeometry args={[0.12, 2.5, 4.8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>

          {/* Tent poles */}
          <mesh position={[-2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2.5, 6]} />
            <meshStandardMaterial color="#8b5c2a" roughness={0.95} />
          </mesh>
          <mesh position={[2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2.5, 6]} />
            <meshStandardMaterial color="#8b5c2a" roughness={0.95} />
          </mesh>

          {/* Hanging fabric strip front */}
          <mesh position={[0, 0.8, 2.52]} rotation={[0, 0, 0]}>
            <boxGeometry args={[5.6, 1.6, 0.05]} />
            <meshStandardMaterial color={color} roughness={0.95} transparent opacity={0.7} />
          </mesh>

          {/* Warm lantern light inside tent */}
          <pointLight
            position={[0, 1.2, 0]}
            color="#ffaa44"
            intensity={3}
            distance={8}
          />
          {/* Small lantern sphere */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.18, 6, 6]} />
            <meshStandardMaterial
              color="#ffcc66"
              emissive="#ffaa22"
              emissiveIntensity={3 + phase * 0.1}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Trading Goods ────────────────────────────────────────────────────────────
const SPICE_COLORS = ['#cc6600', '#880000', '#006600', '#aa3300', '#554400'] as const
const CARPET_COLORS = ['#cc2222', '#cc6600', '#2244bb'] as const

function TradingGoods() {
  const spicePositions: [number, number, number][] = [
    [-63, 0, 14], [-59, 0, 16], [-55, 0, 13], [-65, 0, -14], [-58, 0, -16],
  ]
  const carpetConfigs: { pos: [number, number, number]; rotZ: number; color: string }[] = [
    { pos: [-70, 0.4, 10],  rotZ: Math.PI / 2, color: '#cc2222' },
    { pos: [-53, 0.4, 18],  rotZ: Math.PI / 2, color: '#cc6600' },
    { pos: [-72, 0.4, -12], rotZ: Math.PI / 2, color: '#2244bb' },
  ]

  return (
    <group>
      {/* Spice urns */}
      {spicePositions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Urn body */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.2, 0.6, 8]} />
            <meshStandardMaterial color={SPICE_COLORS[i % 5]} roughness={0.7} />
          </mesh>
          {/* Urn cap sphere */}
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshStandardMaterial color={SPICE_COLORS[i % 5]} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Rolled carpets laid on side */}
      {carpetConfigs.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[0, 0, c.rotZ]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 2.5, 10]} />
          <meshStandardMaterial color={c.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Treasure chest — dark wood box */}
      <group position={[-62, 0, 0]}>
        {/* Chest body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.9} />
        </mesh>
        {/* Lid */}
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[1.22, 0.12, 0.82]} />
          <meshStandardMaterial color="#3a1a00" roughness={0.95} />
        </mesh>
        {/* Gold lock */}
        <mesh position={[0, 0.46, -0.42]} castShadow>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#ffcc00"
            emissiveIntensity={1.5}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  )
}

// ─── Camp Fire ────────────────────────────────────────────────────────────────
// Placed at the centre of the trader camp — midpoint between tents at [-62,0,0].
const FIRE_CONES = [
  { ox:  0.0, oz:  0.0, color: '#ff6600' as const, emissive: '#ff6600' as const, intensity: 8, phase: 0   },
  { ox:  0.25, oz: 0.15, color: '#ff9900' as const, emissive: '#ff9900' as const, intensity: 6, phase: 1.3 },
  { ox: -0.2, oz: 0.1, color: '#ffcc00' as const, emissive: '#ffcc00' as const, intensity: 5, phase: 2.6 },
] as const

const SMOKE_COUNT = 20

function CampFire() {
  const fireRefs = useRef<THREE.Mesh[]>([])
  const lightRef  = useRef<THREE.PointLight>(null!)
  const smokeRef  = useRef<THREE.InstancedMesh>(null!)
  const dummy     = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  const smokeData = useMemo(() =>
    Array.from({ length: SMOKE_COUNT }, (_, i) => ({
      angle:  (i / SMOKE_COUNT) * Math.PI * 2,
      radius: Math.random() * 0.4,
      speed:  0.3 + Math.random() * 0.4,
      phase:  Math.random() * Math.PI * 2,
      size:   0.06 + Math.random() * 0.1,
    })), [])

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()

    // Animate fire cones — scale pulsing
    FIRE_CONES.forEach((cfg, i) => {
      const m = fireRefs.current[i]
      if (!m) return
      const s = 1 + Math.sin(t * 4 + cfg.phase) * 0.3
      m.scale.set(s, s, s)
    })

    // Flickering point light
    if (lightRef.current) {
      lightRef.current.intensity = 6 + Math.sin(t * 5) * 2
    }

    // Smoke particles rising
    if (smokeRef.current) {
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const d = smokeData[i]!
        const age = ((t * d.speed + d.phase) % 3) // 0..3 loop
        dummy.position.set(
          Math.cos(d.angle + t * 0.3) * d.radius * (1 - age / 4),
          age * 1.5 + 1,
          Math.sin(d.angle + t * 0.3) * d.radius * (1 - age / 4),
        )
        const sc = d.size * (1 + age * 0.6)
        dummy.scale.setScalar(sc)
        dummy.updateMatrix()
        smokeRef.current.setMatrixAt(i, dummy.matrix)
      }
      smokeRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    // Centred between the four tents
    <group position={[-62, 0, 0]}>
      {/* Log pile — 3 crossed cylinders */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 6]} />
        <meshStandardMaterial color="#5a3010" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[0, 1.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 6]} />
        <meshStandardMaterial color="#5a3010" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0.8]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 6]} />
        <meshStandardMaterial color="#5a3010" roughness={0.95} />
      </mesh>

      {/* Fire cones */}
      {FIRE_CONES.map((cfg, i) => (
        <mesh
          key={i}
          ref={el => { if (el) fireRefs.current[i] = el }}
          position={[cfg.ox, 0.6, cfg.oz]}
        >
          <coneGeometry args={[0.35, 1.1, 6]} />
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.emissive}
            emissiveIntensity={cfg.intensity}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}

      {/* Flickering fire light */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 0]}
        color="#ff8822"
        intensity={8}
        distance={15}
      />

      {/* Smoke particle cloud */}
      <instancedMesh
        ref={smokeRef}
        args={[undefined, undefined, SMOKE_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#888888" transparent opacity={0.18} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

// ─── Tomb Entrance ────────────────────────────────────────────────────────────
// Ancient underground pyramid tomb at [60, -4, -60] — bottom 4 units buried.
function TombEntrance() {
  return (
    <group position={[60, -4, -60]}>
      {/* Pyramid body — 4-sided cone (pyramid shape), partially buried */}
      <mesh castShadow receiveShadow position={[0, 7, 0]}>
        <cylinderGeometry args={[0, 18, 18, 4]} />
        <meshStandardMaterial color="#c8b060" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Dark tunnel opening carved into pyramid front face */}
      <mesh position={[0, 2.5, -8.2]}>
        <boxGeometry args={[4, 5, 8]} />
        <meshStandardMaterial color="#1a1008" roughness={1.0} />
      </mesh>

      {/* Door frame — left pillar */}
      <mesh position={[-2.5, 2.75, -5.6]} castShadow>
        <boxGeometry args={[0.8, 5.5, 0.6]} />
        <meshStandardMaterial color="#d4b040" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Door frame — right pillar */}
      <mesh position={[2.5, 2.75, -5.6]} castShadow>
        <boxGeometry args={[0.8, 5.5, 0.6]} />
        <meshStandardMaterial color="#d4b040" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Door frame — lintel */}
      <mesh position={[0, 5.6, -5.6]} castShadow>
        <boxGeometry args={[6.2, 0.7, 0.6]} />
        <meshStandardMaterial color="#d4b040" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Hieroglyph carvings on left pillar — 3 horizontal symbol bars */}
      <mesh position={[-2.5, 4.2, -5.25]}>
        <boxGeometry args={[0.55, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-2.5, 3.5, -5.25]}>
        <boxGeometry args={[0.4, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-2.5, 2.8, -5.25]}>
        <boxGeometry args={[0.5, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>
      {/* Hieroglyph carvings on right pillar */}
      <mesh position={[2.5, 4.2, -5.25]}>
        <boxGeometry args={[0.55, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[2.5, 3.5, -5.25]}>
        <boxGeometry args={[0.35, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[2.5, 2.8, -5.25]}>
        <boxGeometry args={[0.45, 0.12, 0.08]} />
        <meshStandardMaterial color="#ffdd88" emissive="#cc9900" emissiveIntensity={1.2} />
      </mesh>

      {/* Sand drift — gentle angled mound blown against pyramid front */}
      <mesh position={[0, 0.5, -10]} rotation={[0.25, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 1.2, 6]} />
        <meshStandardMaterial color="#d4a855" roughness={0.96} />
      </mesh>
      {/* Sand drift side left */}
      <mesh position={[-9, 0.3, -7]} rotation={[0.15, 0.3, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.9, 5]} />
        <meshStandardMaterial color="#d4a855" roughness={0.96} />
      </mesh>
      {/* Sand drift side right */}
      <mesh position={[9, 0.3, -7]} rotation={[0.15, -0.3, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.9, 5]} />
        <meshStandardMaterial color="#d4a855" roughness={0.96} />
      </mesh>
    </group>
  )
}

// ─── Tomb Treasure ────────────────────────────────────────────────────────────
// Glinting treasure visible just inside the tomb entrance.
// Positioned relative to TombEntrance group — inside tunnel at z offset.
function TombTreasure() {
  // 20 gold coins scattered in pile
  const coins = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4,
      y: Math.floor(i / 6) * 0.07,
      rotY: Math.random() * Math.PI,
    })), [])

  // 3 urns
  const urns: { x: number; z: number }[] = [
    { x: -1.2, z: 0.5 },
    { x: 0, z: -0.8 },
    { x: 1.3, z: 0.3 },
  ]

  // 5 jewels: ruby, emerald, sapphire, ruby, emerald
  const jewels: { x: number; z: number; color: string; emissive: string }[] = [
    { x: -0.8, z:  0.9, color: '#ff2244', emissive: '#aa0022' },
    { x:  0.6, z:  1.1, color: '#22ff44', emissive: '#009922' },
    { x:  1.0, z: -0.4, color: '#2244ff', emissive: '#0022aa' },
    { x: -1.4, z: -0.5, color: '#ff2244', emissive: '#aa0022' },
    { x:  0.2, z:  0.6, color: '#22ff44', emissive: '#009922' },
  ]

  return (
    // Tomb entrance group origin is [60, -4, -60]; tunnel opens in -Z direction.
    // Offset -Z places treasure inside the tunnel.
    <group position={[60, -2, -65]}>
      {/* Gold coin pile */}
      {coins.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[Math.PI / 2, c.rotY, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 10]} />
          <meshStandardMaterial
            color="#ffcc00"
            emissive="#aa8800"
            emissiveIntensity={2}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Gold urns: cylinder body + sphere cap */}
      {urns.map((u, i) => (
        <group key={i} position={[u.x, 0, u.z]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.3, 0.8, 10]} />
            <meshStandardMaterial
              color="#ddaa00"
              emissive="#886600"
              emissiveIntensity={1.5}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow>
            <sphereGeometry args={[0.4, 10, 8]} />
            <meshStandardMaterial
              color="#ddaa00"
              emissive="#886600"
              emissiveIntensity={1.5}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Jewels — dodecahedron approximation: sphere scaled to faceted look */}
      {jewels.map((j, i) => (
        <mesh key={i} position={[j.x, 0.3, j.z]} scale={[1, 1.4, 0.9]}>
          <sphereGeometry args={[0.3, 5, 4]} />
          <meshStandardMaterial
            color={j.color}
            emissive={j.emissive}
            emissiveIntensity={4}
            metalness={0.3}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Treasure glow — bright gold point light inside tomb */}
      <pointLight color="#ffdd44" intensity={8} distance={12} position={[0, 1.5, 0]} />
    </group>
  )
}

// ─── Tomb Curse Glow ──────────────────────────────────────────────────────────
// Mysterious purple curse aura around the tomb.
const CURSE_COUNT = 30

function TombCurseGlow() {
  const mistRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  // Per-particle data: orbit angle offset, radius, height, speed, phase
  const mistData = useMemo(() =>
    Array.from({ length: CURSE_COUNT }, (_, i) => ({
      angleOffset: (i / CURSE_COUNT) * Math.PI * 2,
      radius:      8 + Math.random() * 8,
      baseY:       Math.random() * 3,
      speed:       0.2 + Math.random() * 0.3,
      phase:       Math.random() * Math.PI * 2,
    })), [])

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (!mistRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < CURSE_COUNT; i++) {
      const d = mistData[i]!
      const angle = d.angleOffset + t * d.speed
      dummy.position.set(
        Math.cos(angle) * d.radius,
        d.baseY + Math.sin(t * 0.8 + d.phase) * 0.6,
        Math.sin(angle) * d.radius,
      )
      dummy.scale.setScalar(0.5)
      dummy.updateMatrix()
      mistRef.current.setMatrixAt(i, dummy.matrix)
    }
    mistRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[60, -4, -60]}>
      {/* Purple mist particles orbiting pyramid base */}
      <instancedMesh ref={mistRef} args={[undefined, undefined, CURSE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial color="#880088" transparent opacity={0.35} depthWrite={false} />
      </instancedMesh>

      {/* Purple curse light at entrance */}
      <pointLight position={[0, 3, -6]} color="#8844aa" intensity={4} distance={15} />

      {/* 4 corner torches — one at each base corner */}
      {([
        [-9, 0, -9],
        [ 9, 0, -9],
        [-9, 0,  9],
        [ 9, 0,  9],
      ] as [number, number, number][]).map((p, i) => (
        <group key={i} position={p}>
          {/* Torch pole */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 3, 6]} />
            <meshStandardMaterial color="#6b3a1a" roughness={0.95} />
          </mesh>
          {/* Fire tip cone */}
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.25, 0.7, 6]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff4400"
              emissiveIntensity={6}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Small torch glow */}
          <pointLight position={[0, 3.4, 0]} color="#ff8822" intensity={3} distance={8} />
        </group>
      ))}
    </group>
  )
}

// ─── Camel Caravan ────────────────────────────────────────────────────────────
const CAMEL_BODY_COLOR   = '#d4a860'
const CAMEL_SKIN_COLOR   = '#c8a050'
const CAMEL_LEG_COLOR    = '#c09040'
const SADDLE_COLOR       = '#8B2222'
const CARGO_COLOR        = '#8B4513'

interface CamelConfig {
  offsetX: number
}

function SingleCamel({ offsetX }: CamelConfig) {
  const bodyRef   = useRef<THREE.Group>(null!)
  const neckRef   = useRef<THREE.Group>(null!)
  const fl1Ref    = useRef<THREE.Mesh>(null!)  // front-left
  const fl2Ref    = useRef<THREE.Mesh>(null!)  // front-right
  const rl1Ref    = useRef<THREE.Mesh>(null!)  // rear-left
  const rl2Ref    = useRef<THREE.Mesh>(null!)  // rear-right
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    // leg gait
    const frontAngle = Math.sin(t * 2 + Math.PI) * 0.35
    const rearAngle  = Math.sin(t * 2)            * 0.35
    if (fl1Ref.current) fl1Ref.current.rotation.x = frontAngle
    if (fl2Ref.current) fl2Ref.current.rotation.x = -frontAngle
    if (rl1Ref.current) rl1Ref.current.rotation.x = rearAngle
    if (rl2Ref.current) rl2Ref.current.rotation.x = -rearAngle
    // head bob via neck group
    if (neckRef.current) {
      neckRef.current.rotation.x = -0.4 + Math.sin(t * 1.5) * 0.1
    }
    // subtle body bob
    if (bodyRef.current) {
      bodyRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.04
    }
  })

  return (
    <group position={[offsetX, 0, 0]}>
      {/* ── Body ── */}
      <group ref={bodyRef} position={[0, 1.5, 0]}>
        <mesh scale={[1.8, 1.0, 1.2]}>
          <sphereGeometry args={[1.0, 10, 8]} />
          <meshStandardMaterial color={CAMEL_BODY_COLOR} roughness={0.85} />
        </mesh>

        {/* ── Hump (single dromedary) ── */}
        <mesh position={[0, 1.0, 0]} scale={[0.8, 1.3, 0.7]}>
          <sphereGeometry args={[0.65, 8, 7]} />
          <meshStandardMaterial color={CAMEL_BODY_COLOR} roughness={0.85} />
        </mesh>

        {/* ── Saddle & cargo ── */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.6]} />
          <meshStandardMaterial color={SADDLE_COLOR} roughness={0.8} />
        </mesh>
        {/* Left cargo bag */}
        <mesh position={[-1.0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.25, 10]} />
          <meshStandardMaterial color={CARGO_COLOR} roughness={0.85} />
        </mesh>
        {/* Right cargo bag */}
        <mesh position={[1.0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.25, 10]} />
          <meshStandardMaterial color={CARGO_COLOR} roughness={0.85} />
        </mesh>

        {/* ── Neck group (rotates for head bob) ── */}
        <group ref={neckRef} position={[0, 0.3, -1.0]} rotation={[-0.4, 0, 0]}>
          {/* Neck cylinder */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
            <meshStandardMaterial color={CAMEL_BODY_COLOR} roughness={0.85} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.45, 8, 7]} />
            <meshStandardMaterial color={CAMEL_SKIN_COLOR} roughness={0.85} />
          </mesh>
          {/* Left ear */}
          <mesh position={[-0.28, 1.7, 0.05]} rotation={[0, 0, 0.35]}>
            <sphereGeometry args={[0.15, 6, 5]} />
            <meshStandardMaterial color={CAMEL_SKIN_COLOR} roughness={0.85} />
          </mesh>
          {/* Right ear */}
          <mesh position={[0.28, 1.7, 0.05]} rotation={[0, 0, -0.35]}>
            <sphereGeometry args={[0.15, 6, 5]} />
            <meshStandardMaterial color={CAMEL_SKIN_COLOR} roughness={0.85} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, 1.2, -0.42]}>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#b89040" roughness={0.9} />
          </mesh>
        </group>

        {/* ── Tail ── */}
        <mesh position={[0, -0.2, 1.05]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.06, 0.6, 6]} />
          <meshStandardMaterial color={CAMEL_BODY_COLOR} roughness={0.85} />
        </mesh>
        {/* Tail tuft */}
        <mesh position={[0, -0.55, 1.4]}>
          <sphereGeometry args={[0.2, 6, 5]} />
          <meshStandardMaterial color={CAMEL_SKIN_COLOR} roughness={0.85} />
        </mesh>

        {/* ── Legs (pivot at body bottom) ── */}
        {/* Front-left */}
        <mesh ref={fl1Ref} position={[-0.55, -1.45, -0.65]}>
          <cylinderGeometry args={[0.2, 0.17, 1.5, 7]} />
          <meshStandardMaterial color={CAMEL_LEG_COLOR} roughness={0.88} />
        </mesh>
        {/* Front-right */}
        <mesh ref={fl2Ref} position={[0.55, -1.45, -0.65]}>
          <cylinderGeometry args={[0.2, 0.17, 1.5, 7]} />
          <meshStandardMaterial color={CAMEL_LEG_COLOR} roughness={0.88} />
        </mesh>
        {/* Rear-left */}
        <mesh ref={rl1Ref} position={[-0.55, -1.45, 0.65]}>
          <cylinderGeometry args={[0.2, 0.17, 1.5, 7]} />
          <meshStandardMaterial color={CAMEL_LEG_COLOR} roughness={0.88} />
        </mesh>
        {/* Rear-right */}
        <mesh ref={rl2Ref} position={[0.55, -1.45, 0.65]}>
          <cylinderGeometry args={[0.2, 0.17, 1.5, 7]} />
          <meshStandardMaterial color={CAMEL_LEG_COLOR} roughness={0.88} />
        </mesh>
      </group>
    </group>
  )
}

// Thin rope connecting neck-to-tail between successive camels
function CaravanRope({ fromX, toX }: { fromX: number; toX: number }) {
  const midX   = (fromX + toX) / 2
  const length = Math.abs(toX - fromX)
  return (
    <mesh position={[midX, 2.1, -0.9]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, length, 5]} />
      <meshStandardMaterial color="#8b6020" roughness={0.95} />
    </mesh>
  )
}

// CaravanLeader — human figure walking ahead of the first camel
function CaravanLeader() {
  const bodyRef  = useRef<THREE.Group>(null!)
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 2) * 0.04
    }
  })

  return (
    <group ref={bodyRef}>
      {/* Robe body */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.4, 8]} />
        <meshStandardMaterial color="#441100" roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.32, 8, 7]} />
        <meshStandardMaterial color="#cc8855" roughness={0.85} />
      </mesh>
      {/* Keffiyeh head cloth */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#f0e8d0" roughness={0.9} />
      </mesh>
      {/* Walking staff — angled slightly forward */}
      <mesh position={[0.45, 0.9, -0.2]} rotation={[0.15, 0, 0.15]}>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 6]} />
        <meshStandardMaterial color="#5a3010" roughness={0.95} />
      </mesh>
    </group>
  )
}

// Full animated caravan — 4 camels + leader moving across desert
function CamelCaravan() {
  const groupRef = useRef<THREE.Group>(null!)
  const SPEED    = 2.5   // world units per second
  const X_MIN    = -80
  const X_MAX    =  80
  const frameSkip = useRef(0)

  const camelConfigs = useMemo<CamelConfig[]>(
    () => [
      { offsetX:  0  },
      { offsetX: -5  },
      { offsetX: -10 },
      { offsetX: -15 },
    ],
    []
  )

  // Caravan path is at z = -35, level with mid-desert
  useFrame(({ clock }, dt) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    if (!groupRef.current) return
    groupRef.current.position.x += SPEED * step
    if (groupRef.current.position.x > X_MAX) {
      groupRef.current.position.x = X_MIN
    }
  })

  return (
    // z = -35 keeps caravan in open desert between dunes, rotated to face +X
    <group ref={groupRef} position={[X_MIN, 0, -35]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Leader walks 3 units ahead of lead camel */}
      <group position={[3, 0, 0]}>
        <CaravanLeader />
      </group>

      {/* 4 camels in line */}
      {camelConfigs.map((cfg, i) => (
        <SingleCamel key={i} offsetX={cfg.offsetX} />
      ))}

      {/* Ropes between successive camels */}
      {camelConfigs.slice(0, -1).map((cfg, i) => (
        <CaravanRope
          key={i}
          fromX={cfg.offsetX}
          toX={camelConfigs[i + 1]!.offsetX}
        />
      ))}
    </group>
  )
}

// ─── Main World ───────────────────────────────────────────────────────────────
export default function DesertWorld() {
  return (
    <>
      {/* ── Atmosphere ────────────────────────────────────────────── */}
      <GradientSky top="#1a0a00" bottom="#ff8c1a" />

      {/* Sun */}
      <pointLight position={[100, 80, 50]} color="#fff8e0" intensity={8} distance={400} castShadow />
      {/* Ambient warm fill */}
      <ambientLight color="#ff9944" intensity={0.6} />

      <HeatHaze />
      <HeatShimmer />
      <SunGodRay />
      <SacredGeometryFloor />

      {/* ── Terrain ────────────────────────────────────────────────── */}
      <DesertGround />
      <SandDunes />

      {/* ── Pyramid Complex ────────────────────────────────────────── */}
      <MainPyramid />
      <PyramidSunsetGlow />
      <SmallPyramid ox={-60} oz={-30} />
      <SmallPyramid ox={60}  oz={-30} />

      {/* Sphinx */}
      <Sphinx />

      {/* Guard statues flanking entrance */}
      <GuardStatue pos={[-15, 0, 35]} rotY={0.3} />
      <GuardStatue pos={[ 15, 0, 35]} rotY={-0.3} />
      <GuardStatue pos={[-20, 0, 50]} rotY={0.15} />
      <GuardStatue pos={[ 20, 0, 50]} rotY={-0.15} />

      {/* Ceremonial gate */}
      <Gate pos={[0, 0, 60]} />

      {/* Ceremonial avenue pillars */}
      <CeremonialAvenue />

      {/* Hieroglyph obelisks */}
      <Obelisk pos={[-25, 0, 65]} />
      <Obelisk pos={[ 25, 0, 65]} />
      <Obelisk pos={[-25, 0, 45]} />
      <Obelisk pos={[ 25, 0, 45]} />

      {/* ── Burial Chambers ───────────────────────────────────────── */}
      <BurialChamber pos={[ 30, 0, 60]} />
      <BurialChamber pos={[-30, 0, 60]} />
      <BurialChamber pos={[  0, 0, 80]} />

      {/* ── CrystalCluster gem deposits inside burial chambers ────── */}
      <CrystalCluster pos={[ 30, 0, 58]} scale={0.9} rotY={0.5}  />
      <CrystalCluster pos={[-30, 0, 62]} scale={1.0} rotY={1.8}  />
      <CrystalCluster pos={[  2, 0, 80]} scale={0.8} rotY={3.1}  />
      <CrystalCluster pos={[ -2, 0, 79]} scale={0.7} rotY={0.9}  />

      {/* ── PharaohMask decorative props ──────────────────────────── */}
      {/* On pyramid tier 1 (y=8) — flanking the east face */}
      <PharaohMask pos={[20, 8.5, 20]}  scale={1.2} rotY={-Math.PI * 0.25} />
      {/* On pyramid tier 2 (y=16) — south face centre */}
      <PharaohMask pos={[0,  16.5, 18]} scale={1.0} rotY={Math.PI} />
      {/* Near the treasure vault — guarding the entrance */}
      <PharaohMask pos={[-4, 4.5, -6]}  scale={1.3} rotY={Math.PI * 0.6} />
      {/* By the Sphinx — resting between its paws */}
      <PharaohMask pos={[0,  0.5, 38]}  scale={1.1} rotY={0} />

      {/* ── PharaohStaff dramatic placements ─────────────────────── */}
      {/* Near the main pyramid entrance */}
      <PharaohStaff pos={[5, 1.5, 55]}   scale={2}   />
      {/* Near burial chamber */}
      <PharaohStaff pos={[-20, 1.5, 20]} scale={2}   rotY={0.5} />
      {/* By the oasis */}
      <PharaohStaff pos={[30, 1.5, 30]}  scale={1.5} />
      {/* Near treasure vault */}
      <PharaohStaff pos={[-15, 1.5, 65]} scale={2}   rotY={-0.3} />

      {/* ── Sand Vortex above vault entrance ──────────────────────── */}
      <SandVortex />

      {/* ── Treasure Vault (inside pyramid) ───────────────────────── */}
      <TreasureVault />

      {/* ── Oasis ─────────────────────────────────────────────────── */}
      <Oasis />

      {/* ── Palm Trees around oasis (lush oasis feel) ─────────────── */}
      <PalmTree pos={[-60,  0,  17]} scale={1.4} rotY={0}    />
      <PalmTree pos={[-44,  0,  10]} scale={1.2} rotY={1.2}  />
      <PalmTree pos={[-44,  0, -10]} scale={1.3} rotY={2.4}  />
      <PalmTree pos={[-60,  0, -17]} scale={1.5} rotY={3.6}  />
      <PalmTree pos={[-76,  0,  -8]} scale={1.2} rotY={4.8}  />
      <PalmTree pos={[-76,  0,   8]} scale={1.3} rotY={0.6}  />

      {/* ── LavaRock desert formations (outer perimeter) ──────────── */}
      <LavaRock pos={[ 100, 0,  40]} scale={2.4} rotY={0.3}  />
      <LavaRock pos={[-100, 0,  55]} scale={2.0} rotY={1.1}  />
      <LavaRock pos={[  85, 0, -80]} scale={2.8} rotY={2.2}  />
      <LavaRock pos={[ -90, 0, -70]} scale={2.2} rotY={0.7}  />
      <LavaRock pos={[  20, 0, -95]} scale={1.8} rotY={3.0}  />

      {/* ── Rock scatter ──────────────────────────────────────────── */}
      <Rock pos={[40,  0,  30]} scale={2} />
      <Rock pos={[-40, 0,  35]} scale={1.8} />
      <Rock pos={[50,  0, -50]} scale={2.5} />
      <Rock pos={[-50, 0, -45]} scale={2} />

      {/* ── Signs / flags ─────────────────────────────────────────── */}
      <Sign pos={[0, 0, 65]} label="ПИРАМИДА" />
      <Sign pos={[-60, 0, 12]} label="ОАЗИС" />
      <Flag pos={[-8, 0, 72]} color="#ffd644" />
      <Flag pos={[8, 0, 72]} color="#c8953c" />

      {/* ── Sandstorm ─────────────────────────────────────────────── */}
      <SandstormParticles />
      <SandStorm />
      <DesertHeatHaze />
      <VultureGroup />

      {/* ── Coins ─────────────────────────────────────────────────── */}
      <PyramidCoins />
      {/* Oasis coin (handled inside Oasis component) */}

      {/* ── Boss: Верховный Жрец (High Priest) at pyramid altar ──── */}
      <BossWizard pos={[0, 4, -8]} scale={2.2} rotY={Math.PI} />

      {/* ── NPCs ──────────────────────────────────────────────────── */}
      <NPC pos={[0,  0, 50]} bodyColor="#ffd644" label="ФАРАОН"   />
      <NPC pos={[30, 0, 50]} bodyColor="#ffffff" label="ЖРЕЦ"     />
      <NPC pos={[-60,0, 0]}  bodyColor="#ff8844" label="ТОРГОВЕЦ" />

      {/* ── Enemies ───────────────────────────────────────────────── */}
      {/* Scarab beetles at pyramid base */}
      <Enemy pos={[-25, 2, 32]} color="#2a2010" patrolX={4} />
      <Enemy pos={[ 25, 2, 32]} color="#2a2010" patrolX={4} />
      <Enemy pos={[-10, 2, 28]} color="#2a2010" patrolX={3} />
      <Enemy pos={[ 10, 2, 28]} color="#2a2010" patrolX={3} />
      {/* Desert guards at gate */}
      <Enemy pos={[-6, 2, 62]} color="#8b4513" patrolX={3} />
      <Enemy pos={[ 6, 2, 62]} color="#8b4513" patrolX={3} />

      {/* ── GltfMonsters ──────────────────────────────────────────── */}
      {/* Ancient Guardian inside pyramid */}
      <GltfMonster
        which="alien"
        pos={[0, 0, -25]}
        scale={2.5}
        rotY={Math.PI}
        animation="Wave"
      />
      {/* Desert demon near oasis */}
      <GltfMonster
        which="blueDemon"
        pos={[-60, 0, -20]}
        scale={1.5}
        rotY={0.8}
        animation="Idle"
      />
      {/* Desert wanderer */}
      <GltfMonster
        which="cactoro"
        pos={[80, 0, 0]}
        scale={1.2}
        rotY={-0.5}
        animation="Idle"
      />

      {/* ── ObeliskGlb (hieroglyph GLB) — complement procedural obelisks ── */}
      {/* Flanking main pyramid entrance */}
      <ObeliskGlb pos={[-15, 0, 30]} scale={1.3} rotY={0.3} />
      <ObeliskGlb pos={[ 15, 0, 30]} scale={1.3} rotY={-0.3} />
      {/* Near the Sphinx (Sphinx is at z=40) */}
      <ObeliskGlb pos={[-10, 0, 43]} scale={1.1} rotY={0.5} />
      <ObeliskGlb pos={[ 10, 0, 43]} scale={1.1} rotY={-0.5} />
      {/* Outer perimeter scatter */}
      <ObeliskGlb pos={[-70, 0, -50]} scale={1.5} rotY={1.2} />
      <ObeliskGlb pos={[ 75, 0, -45]} scale={1.4} rotY={2.0} />
      <ObeliskGlb pos={[ 45, 0,  75]} scale={1.2} rotY={0.8} />
      <ObeliskGlb pos={[-50, 0,  70]} scale={1.6} rotY={3.1} />

      {/* ── UFOs ──────────────────────────────────────────────────── */}
      <HoveringUFO />
      <UFO pos={[-40, 22, -60]} scale={2.0} rotY={0.5} />
      <UFO pos={[50, 28, -80]} scale={1.5} rotY={1.2} />

      {/* ── Cactus Grove (SW + NE fill zones) ────────────────────── */}
      <CactusGrove />

      {/* ── Scorpion scatter ──────────────────────────────────────── */}
      {/* SW desert — among the cacti */}
      <Scorpion pos={[-68, 0, -60]}  scale={1.2} rotY={0.8}  />
      <Scorpion pos={[-80, 0, -75]}  scale={1.4} rotY={2.1}  />
      <Scorpion pos={[-90, 0, -88]}  scale={1.1} rotY={3.5}  />
      <Scorpion pos={[-75, 0, -100]} scale={1.3} rotY={1.4}  />
      {/* Near pyramid base and sphinx */}
      <Scorpion pos={[30,  0, 22]}   scale={1.0} rotY={0.3}  />
      <Scorpion pos={[-28, 0, 18]}   scale={0.9} rotY={4.8}  />
      {/* Near Desert Oasis */}
      <Scorpion pos={[26,  0, -22]}  scale={1.2} rotY={1.9}  />
      <Scorpion pos={[16,  0, -38]}  scale={1.1} rotY={5.1}  />

      {/* ── Desert Oasis (interior feature) ──────────────────────── */}
      <DesertOasis />

      {/* ── Bedouin Trader Camp (near main Oasis at [-60,0,0]) ────── */}
      <TraderTents />
      <TradingGoods />
      <CampFire />

      {/* ── Ancient Underground Tomb ──────────────────────────────── */}
      <TombEntrance />
      <TombTreasure />
      <TombCurseGlow />

      {/* ── Camel Caravan crossing the desert ─────────────────────── */}
      <CamelCaravan />

      {/* ── Goal Trigger ──────────────────────────────────────────── */}
      <GoalTrigger
        pos={[0, 20, -5]}
        size={[15, 15, 15]}
        result={{
          kind: 'win',
          label: 'ФАРАОН ДОВОЛЕН!',
          subline: 'Ты раскрыл тайны пирамиды!',
        }}
      />
    </>
  )
}

export const DESERT_SPAWN: [number, number, number] = [0, 3, 90]
