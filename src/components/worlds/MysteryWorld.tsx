import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'

const _isLow = detectDeviceTier() === 'low'
const _CANDLE_JITTER = Array.from({ length: 10 }, () =>
  Array.from({ length: 32 }, () => Math.random() < 0.04 ? (Math.random() - 0.5) * 0.6 : 0)
)

// ─── MansionFog — 20 drifting semi-transparent planes creating eerie mist ───
const FOG_PLANES: { pos: [number, number, number]; phase: number; speed: number }[] = [
  { pos: [-8,  0.6, -8],  phase: 0.0,  speed: 0.28 },
  { pos: [ 8,  0.9, -8],  phase: 1.1,  speed: 0.22 },
  { pos: [-8,  1.4,  8],  phase: 2.3,  speed: 0.31 },
  { pos: [ 8,  0.7,  8],  phase: 0.7,  speed: 0.19 },
  { pos: [-3,  1.1, -5],  phase: 1.8,  speed: 0.25 },
  { pos: [ 4,  0.8, -3],  phase: 0.4,  speed: 0.33 },
  { pos: [-5,  1.6,  3],  phase: 2.9,  speed: 0.20 },
  { pos: [ 2,  1.0,  5],  phase: 1.5,  speed: 0.27 },
  { pos: [-10, 0.5, -3],  phase: 3.2,  speed: 0.24 },
  { pos: [ 10, 1.2, -5],  phase: 0.9,  speed: 0.30 },
  { pos: [-6,  2.0,  10], phase: 2.1,  speed: 0.18 },
  { pos: [ 6,  1.8, -10], phase: 1.3,  speed: 0.35 },
  { pos: [ 0,  0.7, -12], phase: 0.2,  speed: 0.23 },
  { pos: [ 0,  1.3,  12], phase: 2.6,  speed: 0.26 },
  { pos: [-13, 1.0, -13], phase: 3.5,  speed: 0.21 },
  { pos: [ 13, 0.6,  13], phase: 1.7,  speed: 0.29 },
  { pos: [-13, 1.5,  13], phase: 0.6,  speed: 0.32 },
  { pos: [ 13, 1.1, -13], phase: 2.4,  speed: 0.17 },
  { pos: [-2,  0.9,  0],  phase: 3.1,  speed: 0.34 },
  { pos: [ 2,  1.7,  2],  phase: 0.3,  speed: 0.22 },
]

function MansionFog() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameCount = useRef(0)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (++frameCount.current % 2 !== 0) return  // 30fps is enough for slow fog drift
    const t = clock.elapsedTime
    FOG_PLANES.forEach((fp, i) => {
      dummy.position.set(
        fp.pos[0] + Math.sin(t * fp.speed * 0.6 + fp.phase + 1.0) * 0.25,
        fp.pos[1] + Math.sin(t * fp.speed + fp.phase) * 0.18,
        fp.pos[2],
      )
      dummy.rotation.set(-Math.PI / 2, 0, fp.phase * 0.4)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, FOG_PLANES.length]} frustumCulled={false}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial color="#221133" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

// ─── Flickering Candle Lights ─────────────────────────────────
const CANDLE_POSITIONS: [number, number, number][] = [
  [-8,  1.8, -10],
  [ 8,  1.8, -10],
  [-10, 1.8,  -8],
  [ 10, 1.8,  -8],
  [-8,  1.8,  10],
  [ 8,  1.8,  10],
  [-10, 1.8,   8],
  [ 10, 1.8,   8],
  [ 0,  2.2, -14],
  [ 0,  2.2,  14],
]

function CandleLights() {
  const lightRefs = useRef<(THREE.PointLight | null)[]>([])
  const flameRef  = useRef<THREE.InstancedMesh>(null!)
  const frameSkip = useRef(0)
  const jitterPtr = useRef(0)
  useEffect(() => {
    CANDLE_POSITIONS.forEach(([cx, cy, cz], i) => {
      _mwDummy.position.set(cx, cy, cz); _mwDummy.rotation.set(0,0,0); _mwDummy.scale.setScalar(1); _mwDummy.updateMatrix()
      flameRef.current.setMatrixAt(i, _mwDummy.matrix)
    })
    flameRef.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    const ptr = jitterPtr.current++ % 32
    CANDLE_POSITIONS.forEach((_pos, i) => {
      const light = lightRefs.current[i]
      if (light) {
        const base = 0.8 + 0.5 * Math.sin(t * 3.1 + i * 1.7)
        const jitter = _CANDLE_JITTER[i]![ptr]!
        light.intensity = Math.max(0.3, Math.min(1.8, base + jitter))
      }
    })
  })
  return (
    <>
      {CANDLE_POSITIONS.map((pos, i) => (
        <pointLight
          key={`cl${i}`}
          ref={(el) => { lightRefs.current[i] = el }}
          color="#ff8833"
          intensity={1.2}
          distance={8}
          decay={2}
          position={pos}
        />
      ))}
      <instancedMesh ref={flameRef} args={[undefined, undefined, CANDLE_POSITIONS.length]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#ffaa44" />
      </instancedMesh>
    </>
  )
}

// ─── ClueParticles — 30 gold spheres orbiting the goal area ───
const CLUE_PARTICLE_COUNT = 30

function ClueParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)
  const params = useMemo(() =>
    Array.from({ length: CLUE_PARTICLE_COUNT }, (_, i) => ({
      radius: 2 + (i % 5) * 0.45,
      yBase:  1.0 + (i % 7) * 0.3,
      speed:  0.18 + (i % 4) * 0.07,
      phase:  (i / CLUE_PARTICLE_COUNT) * Math.PI * 2,
      yAmp:   0.15 + (i % 3) * 0.1,
      yFreq:  0.4 + (i % 5) * 0.15,
    })), [])

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    params.forEach((p, i) => {
      const angle = t * p.speed + p.phase
      dummy.position.set(
        Math.cos(angle) * p.radius,
        p.yBase + Math.sin(t * p.yFreq + p.phase) * p.yAmp,
        Math.sin(angle) * p.radius,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[0, 0, 0]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, CLUE_PARTICLE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#ffcc44" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

// ─── Footstep Dust — 15 tiny semi-transparent spheres on the floor ───
const FOOTSTEP_POSITIONS: [number, number, number][] = [
  [-7,  0.1, -7],
  [ 7,  0.1, -7],
  [-9,  0.1, -3],
  [ 9,  0.1, -3],
  [-7,  0.1,  7],
  [ 7,  0.1,  7],
  [-3,  0.1, -9],
  [ 3,  0.1,  9],
  [ 0,  0.1, -4],
  [-4,  0.1,  0],
  [ 4,  0.1,  2],
  [-2,  0.1,  5],
  [ 5,  0.1, -2],
  [-6,  0.1,  3],
  [ 6,  0.1, -6],
]

function FootstepDust() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    FOOTSTEP_POSITIONS.forEach(([fx, fy, fz], i) => {
      _mwDummy.position.set(fx, fy, fz); _mwDummy.rotation.set(0,0,0); _mwDummy.scale.setScalar(1); _mwDummy.updateMatrix()
      meshRef.current.setMatrixAt(i, _mwDummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, FOOTSTEP_POSITIONS.length]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 6, 6]} />
      <meshBasicMaterial color="#999988" transparent opacity={0.15} depthWrite={false} />
    </instancedMesh>
  )
}
// ─── Ghost Footprints — 12 ghostly shoe prints appearing and fading on the floor ───
// Arranged in left/right pairs along a wandering path through the mansion
const GHOST_FOOTPRINT_DEFS: {
  pos: [number, number, number]
  rotY: number
  offsetX: number
  delay: number
}[] = [
  // Pair 1 — near entrance corridor heading inward
  { pos: [-1.15, 0.06,  -11.0], rotY:  0.08,  offsetX: -0.28, delay: 0.0  },
  { pos: [ 1.15, 0.06,  -10.2], rotY:  0.08,  offsetX:  0.28, delay: 0.45 },
  // Pair 2 — veering slightly left
  { pos: [-1.40, 0.06,   -9.0], rotY:  0.20,  offsetX: -0.28, delay: 0.9  },
  { pos: [ 0.90, 0.06,   -8.1], rotY:  0.20,  offsetX:  0.28, delay: 1.35 },
  // Pair 3 — approaching centre
  { pos: [-1.60, 0.06,   -6.8], rotY:  0.35,  offsetX: -0.28, delay: 1.8  },
  { pos: [ 0.70, 0.06,   -5.8], rotY:  0.35,  offsetX:  0.28, delay: 2.25 },
  // Pair 4 — curving past centre
  { pos: [-2.20, 0.06,   -4.2], rotY:  0.55,  offsetX: -0.28, delay: 2.7  },
  { pos: [ 0.30, 0.06,   -3.0], rotY:  0.55,  offsetX:  0.28, delay: 3.15 },
  // Pair 5 — heading toward library corner
  { pos: [-3.00, 0.06,   -1.5], rotY:  0.70,  offsetX: -0.28, delay: 3.6  },
  { pos: [-0.60, 0.06,   -0.2], rotY:  0.70,  offsetX:  0.28, delay: 4.05 },
  // Pair 6 — fading near detective table
  { pos: [-3.80, 0.06,    1.2], rotY:  0.85,  offsetX: -0.28, delay: 4.5  },
  { pos: [-1.30, 0.06,    2.5], rotY:  0.85,  offsetX:  0.28, delay: 4.95 },
]

// Total cycle duration per footprint: 1.5 rise + 2.0 hold + 1.5 fade + 3.0 wait = 8.0 s
const FP_RISE  = 1.5
const FP_HOLD  = 2.0
const FP_FADE  = 1.5
const FP_WAIT  = 3.0
const FP_CYCLE = FP_RISE + FP_HOLD + FP_FADE + FP_WAIT // 8.0 s

function GhostFootprints() {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const frameCount = useRef(0)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (++frameCount.current % 2 !== 0) return
    const t = clock.elapsedTime
    GHOST_FOOTPRINT_DEFS.forEach((fp, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const mat = mesh.material as THREE.MeshBasicMaterial
      // Each footprint has a staggered start based on its delay
      const local = ((t - fp.delay) % FP_CYCLE + FP_CYCLE) % FP_CYCLE
      let opacity: number
      if (local < FP_RISE) {
        opacity = (local / FP_RISE) * 0.6
      } else if (local < FP_RISE + FP_HOLD) {
        opacity = 0.6
      } else if (local < FP_RISE + FP_HOLD + FP_FADE) {
        opacity = (1 - (local - FP_RISE - FP_HOLD) / FP_FADE) * 0.6
      } else {
        opacity = 0
      }
      mat.opacity = opacity
    })
  })

  return (
    <>
      {GHOST_FOOTPRINT_DEFS.map((fp, i) => (
        <mesh
          key={`gfp${i}`}
          ref={(el) => { meshRefs.current[i] = el }}
          position={fp.pos}
          rotation={[0, fp.rotY, 0]}
          scale={[1, 1, 0.5]}
        >
          <cylinderGeometry args={[0.12, 0.15, 0.03, 6]} />
          <meshBasicMaterial
            color="#8888ff"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

const _orbDummy = new THREE.Object3D()
const _orbCol   = new THREE.Color()
const _mwDummy  = new THREE.Object3D()

const _STONE_UPRIGHTS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  return { x: Math.cos(angle) * 20, z: Math.sin(angle) * 20, rotY: -angle }
})
const _STONE_LINTELS = Array.from({ length: 6 }, (_, i) => {
  const angle = ((i * 2 + 0.5) / 12) * Math.PI * 2
  return { x: Math.cos(angle) * 20, z: Math.sin(angle) * 20, rotY: -angle + Math.PI / 2 }
})

// ─── GhostApparition — semi-transparent ethereal figure drifting through mansion ───
function GhostApparition() {
  const groupRef = useRef<THREE.Group>(null!)
  const bodyMatRef = useRef<THREE.MeshBasicMaterial>(null!)
  const orbImRef = useRef<THREE.InstancedMesh>(null!)
  // Circular buffer of last 8 positions
  const posBuffer = useRef<THREE.Vector3[]>(
    Array.from({ length: 8 }, () => new THREE.Vector3(0, 1.5, -5))
  )
  const bufHead = useRef(0)
  const lastPos = useRef(new THREE.Vector3(0, 1.5, -5))

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime() * 0.25
    const x = Math.sin(t) * 12
    const z = Math.cos(t * 2) * 8 - 5
    const y = 1.5 + Math.sin(t * 0.7) * 0.5

    const grp = groupRef.current
    if (grp) {
      // Facing direction of travel
      const dx = x - lastPos.current.x
      const dz = z - lastPos.current.z
      if (Math.abs(dx) + Math.abs(dz) > 0.0001) {
        grp.rotation.y = Math.atan2(dx, dz)
      }
      grp.position.set(x, y, z)
    }

    lastPos.current.set(x, y, z)

    // Opacity pulse on body
    if (bodyMatRef.current) {
      bodyMatRef.current.opacity = Math.sin(t * 1.5 * 4) * 0.05 + 0.3
    }

    // Push position to circular buffer
    const idx = bufHead.current % 8
    posBuffer.current[idx]!.set(x, y, z)
    bufHead.current++

    // Update trail orb positions and fade via brightness
    if (orbImRef.current) {
      for (let i = 0; i < 8; i++) {
        const bufIdx = ((bufHead.current - 1 - i) % 8 + 8) % 8
        const p = posBuffer.current[bufIdx]!
        _orbDummy.position.set(p.x, p.y, p.z)
        _orbDummy.updateMatrix()
        orbImRef.current.setMatrixAt(i, _orbDummy.matrix)
        const bright = (1 - i / 8) * 0.25
        orbImRef.current.setColorAt(i, _orbCol.setRGB(bright * 0.667, bright * 0.733, bright))
      }
      orbImRef.current.instanceMatrix.needsUpdate = true
      if (orbImRef.current.instanceColor) orbImRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <>
      {/* Ghost group — position driven by useFrame */}
      <group ref={groupRef}>
        {/* Pale blue point light moves with ghost */}
        <pointLight color="#aabbff" intensity={2.5} distance={8} decay={2} />

        {/* Head */}
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.5, 8, 7]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
        </mesh>

        {/* Left eye — emissive bright blue dots */}
        <mesh position={[-0.16, 2.58, -0.48]}>
          <sphereGeometry args={[0.08, 5, 4]} />
          <meshStandardMaterial color="#88aaff" emissive="#88aaff" emissiveIntensity={2} />
        </mesh>

        {/* Right eye — emissive bright blue dots */}
        <mesh position={[0.16, 2.58, -0.48]}>
          <sphereGeometry args={[0.08, 5, 4]} />
          <meshStandardMaterial color="#88aaff" emissive="#88aaff" emissiveIntensity={2} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 1.0, 8]} />
          <meshBasicMaterial ref={bodyMatRef} color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>

        {/* Skirt / trailing open cone */}
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.5, 1.2, 8, 1, true]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Trail orbs — 8 fading spheres at buffered positions */}
      <instancedMesh ref={orbImRef} args={[undefined, undefined, 8]} frustumCulled={false}>
        <sphereGeometry args={[0.12, 5, 4]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthWrite={false} />
      </instancedMesh>
    </>
  )
}

import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Mushroom, Cauldron, Torch, Bookshelf, Chair, NpcCat, BossWizard, CrystalCluster, IceBlock, LavaRock, PharaohMask, RuinsPillar, MagicPotion, Pumpkin, Spider } from '../Scenery'
import { PUBLIC_BASE } from '../../lib/publicPath'
import GradientSky from '../GradientSky'

// Kenney Graveyard Kit — CC0 GLB модели
function GraveyardProp({
  file,
  pos,
  scale = 1,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const gltf = useGLTF(`${PUBLIC_BASE}/models/kenney-graveyard/${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/crypt.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/coffin.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/cross.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/candle.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/pumpkin-carved.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/lantern-glass.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/fence.glb`)

/**
 * MysteryWorld — kid-safe remake of «Murder Mystery 2».
 * Тема насилия убрана — это «Детектив в Особняке»: собираешь улики,
 * узнаёшь кто что делал. Подходит для возраста 9-15.
 *
 * Curriculum: M5 L30 «Murder Mystery Logic» — shuffle list + indexing + enums.
 * Python hooks:
 *   assign_roles(players) → dict     # роль каждого
 *   check_clue(name) → bool
 *
 * MVP: 4 тематические комнаты под одной крышей, между ними проходы.
 * 5 светящихся «улик» (монеток), 3 подозреваемых NPC, финиш — детектив-стол.
 */

const WALL = '#3d3148'
const WALL_TOP = '#504264'
const FLOOR_WOOD = '#6b4f2a'
const FLOOR_DARK = '#4a3619'

function Floor() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[40, 0.5, 40]} />
        <meshStandardMaterial color={FLOOR_WOOD} roughness={0.85} />
      </mesh>
      {/* Шахматный паттерн через второй слой точечных плиток */}
    </RigidBody>
  )
}

interface RoomDef {
  cx: number
  cz: number
  w: number
  d: number
  accent: string
  name: string
}

const ROOMS: RoomDef[] = [
  { cx: -8,  cz: -8,  w: 10, d: 10, accent: '#c03535', name: 'Столовая' },
  { cx:  8,  cz: -8,  w: 10, d: 10, accent: '#2e5f8a', name: 'Библиотека' },
  { cx: -8,  cz:  8,  w: 10, d: 10, accent: '#3fb74d', name: 'Оранжерея' },
  { cx:  8,  cz:  8,  w: 10, d: 10, accent: '#c879ff', name: 'Кабинет' },
]

function Walls() {
  // Внешние стены особняка (прямоугольник 40×40 с проёмами для атмосферы)
  const W = 22
  const H = 4
  const T = 0.6
  const items: Array<{ pos: [number, number, number]; size: [number, number, number]; cap?: boolean }> = [
    { pos: [0, H / 2, -W - T / 2], size: [W * 2, H, T], cap: true },
    { pos: [0, H / 2, W + T / 2],  size: [W * 2, H, T], cap: true },
    { pos: [-W - T / 2, H / 2, 0], size: [T, H, W * 2], cap: true },
    { pos: [W + T / 2, H / 2, 0],  size: [T, H, W * 2], cap: true },
    // Внутренние перегородки — делят дом на 4 квадрата
    { pos: [0, H / 2, 0], size: [22, H, 0.25] },
    { pos: [0, H / 2, 0], size: [0.25, H, 22] },
  ]
  return (
    <>
      {items.map((it, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={it.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={it.size} />
            <meshStandardMaterial color={WALL} roughness={0.9} />
          </mesh>
          {it.cap && (
            <mesh position={[0, it.size[1] / 2 + 0.15, 0]}>
              <boxGeometry args={[it.size[0], 0.3, it.size[2] + 0.1]} />
              <meshStandardMaterial color={WALL_TOP} roughness={0.9} />
            </mesh>
          )}
        </RigidBody>
      ))}
    </>
  )
}

function RoomAccent({ room }: { room: RoomDef }) {
  // Светящийся ковёр + подвешенная вывеска-свет по центру комнаты
  return (
    <group position={[room.cx, 0, room.cz]}>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[room.w - 1.5, 0.02, room.d - 1.5]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
      {/* Хрустальная лампа-светильник */}
      <mesh position={[0, 3.6, 0]}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.9} />
      </mesh>
      <pointLight color={room.accent} position={[0, 3.5, 0]} intensity={0.4} distance={9} decay={2} />
    </group>
  )
}

function ClueOrb({ pos }: { pos: [number, number, number] }) {
  // Декоративная сфера с парящим «облачком» вокруг — визуальный маркер улики
  const orb = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (orb.current) {
      orb.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 1.8) * 0.12
    }
  })
  return (
    <mesh ref={orb} position={pos}>
      <sphereGeometry args={[0.22, 14, 14]} />
      <meshStandardMaterial
        color="#A9D8FF"
        emissive="#A9D8FF"
        emissiveIntensity={1.2}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function Table({ pos, color = '#6b4f2a' }: { pos: [number, number, number]; color?: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* «Плоскостной» топ — светлее */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.05, 0.08, 1.25]} />
        <meshStandardMaterial color={FLOOR_DARK} roughness={0.6} />
      </mesh>
    </RigidBody>
  )
}

// ─── Pulsing mystery orbs ─────────────────────────────────────
const orbGlowVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const orbGlowFrag = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = clamp(1.0 - d, 0.0, 1.0);
    float pulse = 0.7 + 0.3 * sin(iTime * 2.5);
    gl_FragColor = vec4(1.0, 0.8, 0.0, glow * pulse);
  }
`

// Fixed scatter positions for the 6 mystery orbs
const ORB_POSITIONS: [number, number, number][] = [
  [-12, 1.5,  -5],
  [ 12, 1.5,  -6],
  [ -5, 1.5,  12],
  [  6, 1.5,  11],
  [-14, 1.5,   9],
  [ 14, 1.5,   7],
]

function MysteryOrb({ basePos }: { basePos: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0.0 } }), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.position.y = basePos[1] + Math.sin(t * 1.2 + basePos[0]) * 0.18
    }
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = t
    }
  })

  return (
    <mesh ref={meshRef} position={basePos}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={orbGlowVert}
        fragmentShader={orbGlowFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Shadow vignette ground plane ─────────────────────────────
const vignetteVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const vignetteFrag = `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float alpha = clamp(d * d * 0.85, 0.0, 0.92);
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
`

function VignetteGround() {
  return (
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <shaderMaterial
        vertexShader={vignetteVert}
        fragmentShader={vignetteFrag}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Pulsing mystery ring ─────────────────────────────────────
const ringVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ringFrag = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    // Flowing dots along the torus UV
    float dot = step(0.85, sin(vUv.x * 60.0 - iTime * 2.0) * 0.5 + 0.5);
    gl_FragColor = vec4(0.533, 0.0, 1.0, dot * 0.2);
  }
`

function MysteryRing() {
  const groupRef = useRef<THREE.Group>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0.0 } }), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.3
    }
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = clock.elapsedTime
    }
  })

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <mesh>
        <torusGeometry args={[8, 0.06, 8, 80]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={ringVert}
          fragmentShader={ringFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ─── FloatingRunes — 12 glowing rune tablets floating in a ring around the centre ───
const RUNE_COUNT = 12

function FloatingRunes() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const rotYArr = useRef(new Float32Array(RUNE_COUNT))

  const runes = useMemo(() =>
    Array.from({ length: RUNE_COUNT }, (_, i) => {
      const angle = (i / RUNE_COUNT) * Math.PI * 2
      const radius = 25 + (i * 7.3) % 10
      return {
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        baseY: 5 + (i * 3.7) % 7,
        phase: (i / RUNE_COUNT) * Math.PI * 2,
      }
    }), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (!meshRef.current) return
    const t = clock.elapsedTime
    runes.forEach((r, i) => {
      rotYArr.current[i] = (rotYArr.current[i] ?? 0) + 0.008
      dummy.position.set(r.baseX, r.baseY + Math.sin(t * 0.8 + r.phase) * 1.2, r.baseZ)
      dummy.rotation.set(0, rotYArr.current[i], Math.sin(t * 0.3 + r.phase) * 0.15)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RUNE_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.8, 1.2, 0.05]} />
      <meshStandardMaterial
        color="#330066"
        emissive="#aa44ff"
        emissiveIntensity={3}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  )
}

// ─── CrystalCave — cluster of 8 crystal stalagmite/stalactite pairs in one corner ───
const CAVE_COUNT = 8

function CrystalCave() {
  const crystals = useMemo(() =>
    Array.from({ length: CAVE_COUNT }, (_, i) => ({
      x: -40 + Math.random() * 15,
      z: -40 + Math.random() * 15,
      height: 4 + Math.random() * 3,
      color: i % 2 === 0 ? '#aa66ff' : '#6644aa' as string,
    })), [])

  return (
    <group>
      {/* Two ambient lights to illuminate the cave corner */}
      <pointLight color="#aa44ff" intensity={4} distance={20} decay={2} position={[-33, 3, -33]} />
      <pointLight color="#4422bb" intensity={3} distance={15} decay={2} position={[-28, 6, -28]} />

      {crystals.map((c, i) => (
        <group key={`cave${i}`}>
          {/* Stalagmite — pointing up from floor */}
          <mesh position={[c.x, c.height / 2, c.z]} castShadow>
            <coneGeometry args={[0.8, c.height, 6]} />
            <meshStandardMaterial
              color={c.color}
              emissive={c.color}
              emissiveIntensity={1.5}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
          {/* Stalactite — inverted cone hanging from above at y=12 */}
          <mesh position={[c.x, 12, c.z]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.8, c.height, 6]} />
            <meshStandardMaterial
              color={c.color}
              emissive={c.color}
              emissiveIntensity={1.5}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── StoneCircle — Stonehenge-like ancient stone circle at [30, 0, -30] ───
const STONE_MIST_COUNT = 20

function StoneCircle() {
  const mistRef = useRef<THREE.InstancedMesh>(null!)
  const mistData = useMemo(() =>
    Array.from({ length: STONE_MIST_COUNT }, (_, i) => ({
      angle: (i / STONE_MIST_COUNT) * Math.PI * 2,
      radius: Math.random() * 1.8,
      phase: (i / STONE_MIST_COUNT) * Math.PI * 2,
      speed: 0.15 + Math.random() * 0.12,
      size: 0.4 + Math.random() * 0.5,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    mistData.forEach((m, i) => {
      const x = Math.cos(m.angle + t * 0.08) * m.radius
      const z = Math.sin(m.angle + t * 0.08) * m.radius
      const y = 0.3 + ((t * m.speed + m.phase) % 3.0) * 0.7
      const fade = 1.0 - ((t * m.speed + m.phase) % 3.0) / 3.0
      dummy.position.set(x, y, z)
      const s = m.size * (0.6 + fade * 0.4)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      if (mistRef.current) {
        mistRef.current.setMatrixAt(i, dummy.matrix)
      }
    })
    if (mistRef.current) {
      mistRef.current.instanceMatrix.needsUpdate = true
    }
  })

  const uprightIM = useRef<THREE.InstancedMesh>(null!)
  const lintelIM  = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    _STONE_UPRIGHTS.forEach(({ x, z, rotY }, i) => {
      _mwDummy.position.set(x, 3, z); _mwDummy.rotation.set(0, rotY, 0); _mwDummy.scale.setScalar(1); _mwDummy.updateMatrix()
      uprightIM.current.setMatrixAt(i, _mwDummy.matrix)
    })
    uprightIM.current.instanceMatrix.needsUpdate = true
    _STONE_LINTELS.forEach(({ x, z, rotY }, i) => {
      _mwDummy.position.set(x, 6.75, z); _mwDummy.rotation.set(0, rotY, 0); _mwDummy.scale.setScalar(1); _mwDummy.updateMatrix()
      lintelIM.current.setMatrixAt(i, _mwDummy.matrix)
    })
    lintelIM.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group position={[30, 0, -30]}>
      <instancedMesh ref={uprightIM} args={[undefined, undefined, _STONE_UPRIGHTS.length]} castShadow>
        <boxGeometry args={[2, 6, 1.5]} />
        <meshStandardMaterial color="#888899" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={lintelIM} args={[undefined, undefined, _STONE_LINTELS.length]} castShadow>
        <boxGeometry args={[4.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#777788" roughness={0.95} />
      </instancedMesh>

      {/* Center altar flat cylinder */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2, 2, 0.4, 32]} />
        <meshStandardMaterial color="#999988" roughness={0.9} />
      </mesh>

      {/* Blood-red pool on altar top */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        <meshStandardMaterial
          color="#660000"
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Green magical mist — InstancedMesh 20 spheres */}
      <instancedMesh ref={mistRef} args={[undefined, undefined, STONE_MIST_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color="#22aa44"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Altar glow light */}
      <pointLight color="#44ff66" intensity={3} distance={18} decay={2} position={[0, 1, 0]} />
    </group>
  )
}

// ─── SwampZone — dark murky swamp in the [−40, 0, 30] corner ───
const SWAMP_BUBBLE_COUNT = 30

function SwampZone() {
  const bubbleRef = useRef<THREE.InstancedMesh>(null!)
  const bubbleData = useMemo(() =>
    Array.from({ length: SWAMP_BUBBLE_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 28,
      z: (Math.random() - 0.5) * 23,
      phase: (i / SWAMP_BUBBLE_COUNT) * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.3,
      size: 0.08 + Math.random() * 0.14,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    bubbleData.forEach((b, i) => {
      const cycleT = (t * b.speed + b.phase) % 4.0
      const y = -0.1 + cycleT * 0.5
      dummy.position.set(b.x, y, b.z)
      dummy.scale.setScalar(b.size)
      dummy.updateMatrix()
      if (bubbleRef.current) {
        bubbleRef.current.setMatrixAt(i, dummy.matrix)
      }
    })
    if (bubbleRef.current) {
      bubbleRef.current.instanceMatrix.needsUpdate = true
    }
  })

  // Dead tree trunk + angled branch helper
  function DeadTree({ pos, rotY }: { pos: [number, number, number]; rotY: number }) {
    const branchAngles: [number, number, number, number][] = [
      [0.6, 0, 0, 1.2],
      [-0.5, 0, 0.4, 0.9],
      [0.4, 0.8, -0.3, 1.0],
      [-0.3, -0.5, 0.5, 0.8],
    ]
    return (
      <group position={pos} rotation={[0, rotY, 0]}>
        {/* Trunk */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.15, 0.25, 5, 6]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.99} />
        </mesh>
        {/* Branches */}
        {branchAngles.map(([rx, ry, rz, len], bi) => (
          <mesh key={bi} position={[Math.sin(ry) * len * 0.5, 3 + bi * 0.4, Math.cos(ry) * len * 0.3]} rotation={[rx, ry, rz]}>
            <cylinderGeometry args={[0.05, 0.08, len, 5]} />
            <meshStandardMaterial color="#1a1005" roughness={0.99} />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <group position={[-40, 0, 30]}>
      {/* Dark water plane */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[30, 0.2, 25]} />
        <meshStandardMaterial color="#1a2a0a" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Murky green fog — 3 large transparent spheres */}
      <mesh position={[-4, 3, -3]}>
        <sphereGeometry args={[10, 8, 8]} />
        <meshBasicMaterial color="#1a3a0a" transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh position={[5, 3, 4]}>
        <sphereGeometry args={[9, 8, 8]} />
        <meshBasicMaterial color="#1a3a0a" transparent opacity={0.10} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh position={[-2, 2.5, 6]}>
        <sphereGeometry args={[8, 8, 8]} />
        <meshBasicMaterial color="#1a3a0a" transparent opacity={0.09} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* 6 dead trees */}
      <DeadTree pos={[-10, 0,  -8]} rotY={0.3} />
      <DeadTree pos={[ -6, 0, -10]} rotY={1.1} />
      <DeadTree pos={[  8, 0,  -9]} rotY={-0.5} />
      <DeadTree pos={[ 11, 0,   4]} rotY={2.0} />
      <DeadTree pos={[ -9, 0,   9]} rotY={-1.2} />
      <DeadTree pos={[  2, 0,  10]} rotY={0.8} />

      {/* 8 lily pads */}
      {([
        [-5,  -3], [3,  -5], [-2,  2], [7, 1],
        [-8,  4],  [0,  6],  [5,  -1], [-4, -7],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={`lily${i}`} position={[x, -0.09, z]} rotation={[-Math.PI / 2, 0, i * 0.8]}>
          <cylinderGeometry args={[1, 1, 0.05, 12]} />
          <meshStandardMaterial color="#2a4a0a" roughness={0.8} />
        </mesh>
      ))}

      {/* Swamp gas bubbles — InstancedMesh 30 */}
      <instancedMesh ref={bubbleRef} args={[undefined, undefined, SWAMP_BUBBLE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial
          color="#44aa22"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 2 eerie green point lights low over swamp */}
      <pointLight color="#33ff44" intensity={1.8} distance={16} decay={2} position={[ 0,  1,  -4]} />
      <pointLight color="#22dd33" intensity={1.6} distance={16} decay={2} position={[ 0,  1,   6]} />
    </group>
  )
}

// ─── SpectralText — glowing "???" sigil floating high in the sky ───
function SpectralText() {
  const groupRef = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = 20 + Math.sin(t * 0.6) * 0.8
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.25
    }
  })

  // Build "???" from box geometry: each "?" = vertical bar + dot below
  // '?' shape: top horizontal, vertical descender, curve top-right, dot
  // We approximate each "?" as: top-bar + right-bar + mid-bar + lower-hook + dot
  function QuestionMark({ offsetX }: { offsetX: number }) {
    const mat = (
      <meshStandardMaterial
        color="#330066"
        emissive="#8800ff"
        emissiveIntensity={3}
        transparent
        opacity={0.8}
      />
    )
    return (
      <group position={[offsetX, 0, 0]}>
        {/* Top horizontal bar */}
        <mesh position={[0, 2.2, 0]}><boxGeometry args={[0.8, 0.22, 0.15]} />{mat}</mesh>
        {/* Upper-right vertical */}
        <mesh position={[0.3, 1.7, 0]}><boxGeometry args={[0.22, 0.7, 0.15]} />{mat}</mesh>
        {/* Mid curve-left bar */}
        <mesh position={[0, 1.3, 0]}><boxGeometry args={[0.6, 0.22, 0.15]} />{mat}</mesh>
        {/* Lower vertical descender */}
        <mesh position={[0, 0.7, 0]}><boxGeometry args={[0.22, 0.6, 0.15]} />{mat}</mesh>
        {/* Dot */}
        <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.25, 0.25, 0.15]} />{mat}</mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} position={[0, 20, 0]}>
      <QuestionMark offsetX={-1.4} />
      <QuestionMark offsetX={ 0.0} />
      <QuestionMark offsetX={ 1.4} />

      {/* Glow point light */}
      <pointLight color="#8800ff" intensity={6} distance={25} decay={2} position={[0, 0, 0]} />
    </group>
  )
}

// ─── WizardWorkshop — cluttered alchemist workshop corner at [-50, 0, -20] ───
const POTION_COLORS: { body: string; glow: string }[] = [
  { body: '#331133', glow: '#cc44ff' },
  { body: '#113311', glow: '#44ff44' },
  { body: '#111133', glow: '#4488ff' },
  { body: '#331111', glow: '#ff4444' },
  { body: '#332211', glow: '#ffaa22' },
  { body: '#113322', glow: '#22ffcc' },
  { body: '#221133', glow: '#8844ff' },
  { body: '#112233', glow: '#22aaff' },
  { body: '#331122', glow: '#ff44aa' },
  { body: '#223311', glow: '#88ff22' },
]

const CANDLE_PHASES = [0.0, 1.3, 2.6, 0.7, 1.9]
const _bubbleColor = new THREE.Color()
const _bubbleDummy = new THREE.Object3D()

function WizardWorkshop() {
  const bubbleMeshRef = useRef<THREE.InstancedMesh>(null!)
  const flameRefs = useRef<(THREE.Mesh | null)[]>([])

  const bubbleData = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      phase: (i / 10) * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.3,
    })), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (bubbleMeshRef.current) {
      bubbleData.forEach((b, i) => {
        const cycleT = (t * b.speed + b.phase) % 3.0
        _bubbleDummy.position.set(b.x, 0.7 + cycleT * 0.9, b.z)
        _bubbleDummy.updateMatrix()
        bubbleMeshRef.current.setMatrixAt(i, _bubbleDummy.matrix)
        const bright = (1.0 - cycleT / 3.0) * 0.7
        bubbleMeshRef.current.setColorAt(i, _bubbleColor.setRGB(0.267 * bright, bright, 0.533 * bright))
      })
      bubbleMeshRef.current.instanceMatrix.needsUpdate = true
      if (bubbleMeshRef.current.instanceColor) bubbleMeshRef.current.instanceColor.needsUpdate = true
    }
    // candle flame scale flicker
    CANDLE_PHASES.forEach((phase, i) => {
      const flame = flameRefs.current[i]
      if (flame) {
        flame.scale.y = 1 + Math.sin(t * 5 + phase) * 0.3
      }
    })
  })

  // Shelf potion positions — spread across x
  const potionPositions: [number, number, number][] = [
    [-1.8, 0.3, 0], [-1.3, 0.3, 0], [-0.8, 0.3, 0], [-0.3, 0.3, 0], [0.2, 0.3, 0],
    [0.7, 0.3, 0],  [1.2, 0.3, 0],  [1.6, 0.3, 0],  [-1.5, 0.3, 0], [1.0, 0.3, 0],
  ]
  const bookPositions: [number, number, number][] = [
    [-2.0, 0.31, 0], [-1.6, 0.31, 0], [-1.2, 0.31, 0],
    [1.4, 0.31, 0],  [1.75, 0.31, 0], [2.0, 0.31, 0],
  ]
  const candlePositions: [number, number, number][] = [
    [-2.1, 0.95, -0.9], [-1.5, 0.95, 1.0], [0.5, 0.95, -1.0], [1.6, 0.95, 0.9], [2.1, 0.95, 0.2],
  ]

  return (
    <group position={[-50, 0, -20]}>
      {/* ── Workbench ── */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.9, 2.5]} />
        <meshStandardMaterial color="#3a1a05" roughness={0.9} />
      </mesh>

      {/* ── 3 Shelves above bench ── */}
      {([2, 3.5, 5] as number[]).map((sy, si) => (
        <group key={`shelf${si}`}>
          <mesh position={[0, sy, -0.8]} castShadow>
            <boxGeometry args={[4.5, 0.12, 0.4]} />
            <meshStandardMaterial color="#3a1a05" roughness={0.9} />
          </mesh>

          {/* Potion bottles on each shelf */}
          {si === 0 && potionPositions.map((pp, pi) => {
            const col = POTION_COLORS[pi % POTION_COLORS.length]!
            return (
              <group key={`pot${pi}`} position={[pp[0], sy + 0.12, -0.8]}>
                {/* Bottle body */}
                <mesh>
                  <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
                  <meshStandardMaterial
                    color={col.body}
                    emissive={col.glow}
                    emissiveIntensity={3}
                    transparent opacity={0.85}
                  />
                </mesh>
                {/* Bottle cap sphere */}
                <mesh position={[0, 0.32, 0]}>
                  <sphereGeometry args={[0.15, 7, 7]} />
                  <meshStandardMaterial
                    color={col.body}
                    emissive={col.glow}
                    emissiveIntensity={3}
                    transparent opacity={0.85}
                  />
                </mesh>
              </group>
            )
          })}

          {/* Ancient books on shelves 1 and 2 */}
          {si > 0 && bookPositions.map((bp, bi) => (
            <mesh
              key={`book${bi}`}
              position={[bp[0], sy + 0.12 + 0.25, -0.8]}
              castShadow
            >
              <boxGeometry args={[0.3, 0.5, 0.2]} />
              <meshStandardMaterial
                color={bi % 3 === 0 ? '#1a0a0a' : bi % 3 === 1 ? '#0a0a1a' : '#0a1a0a'}
                roughness={0.95}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Skull on top shelf ── */}
      <group position={[2.1, 5.5, -0.8]}>
        <mesh>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.7} />
        </mesh>
        {/* Left eye socket */}
        <mesh position={[-0.12, 0.04, -0.26]}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshBasicMaterial color="#110000" />
        </mesh>
        {/* Right eye socket */}
        <mesh position={[0.12, 0.04, -0.26]}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshBasicMaterial color="#110000" />
        </mesh>
      </group>

      {/* ── Cauldron on bench ── */}
      <mesh position={[0, 1.65, 0.3]} castShadow>
        <cylinderGeometry args={[0.7, 0.55, 0.6, 14]} />
        <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Bubbling liquid disc inside cauldron */}
      <mesh position={[0, 1.93, 0.3]}>
        <cylinderGeometry args={[0.62, 0.62, 0.04, 14]} />
        <meshStandardMaterial
          color="#004422"
          emissive="#00ff44"
          emissiveIntensity={3}
          transparent opacity={0.9}
        />
      </mesh>
      {/* Cauldron glow light */}
      <pointLight color="#00ff44" intensity={3} distance={8} decay={2} position={[0, 2.5, 0.3]} />

      {/* ── Bubbling particles rising from cauldron ── */}
      <instancedMesh ref={bubbleMeshRef} args={[undefined, undefined, 10]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 5, 5]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthWrite={false} />
      </instancedMesh>

      {/* ── Lectern (angled box) ── */}
      <mesh position={[-1.8, 1.6, -0.6]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[1.0, 0.08, 0.7]} />
        <meshStandardMaterial color="#5a2a08" roughness={0.9} />
      </mesh>
      {/* Open spell book on lectern */}
      <group position={[-1.8, 1.7, -0.7]} rotation={[0.5, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshStandardMaterial color="#eeddcc" roughness={0.7} />
        </mesh>
        {/* Left page */}
        <mesh position={[-0.19, 0, 0.03]} rotation={[0, -0.18, 0]}>
          <boxGeometry args={[0.38, 0.54, 0.02]} />
          <meshStandardMaterial color="#f5eedd" roughness={0.6} />
        </mesh>
        {/* Right page */}
        <mesh position={[0.19, 0, 0.03]} rotation={[0, 0.18, 0]}>
          <boxGeometry args={[0.38, 0.54, 0.02]} />
          <meshStandardMaterial color="#f0e8d8" roughness={0.6} />
        </mesh>
      </group>

      {/* ── Candles on bench ── */}
      {candlePositions.map((cp, ci) => (
        <group key={`wcandle${ci}`} position={cp}>
          {/* Candle body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
            <meshStandardMaterial color="#fffff0" roughness={0.7} />
          </mesh>
          {/* Flame cone */}
          <mesh
            ref={(el) => { flameRefs.current[ci] = el }}
            position={[0, 0.28, 0]}
          >
            <coneGeometry args={[0.07, 0.15, 8]} />
            <meshStandardMaterial
              color="#ff8800"
              emissive="#ff8800"
              emissiveIntensity={6}
              transparent opacity={0.9}
            />
          </mesh>
          {/* Small flame light */}
          <pointLight color="#ff6600" intensity={0.8} distance={3} decay={2} position={[0, 0.35, 0]} />
        </group>
      ))}
    </group>
  )
}

// ─── FlyingBroomstick — witch's broom orbiting the workshop ───
function FlyingBroomstick() {
  const groupRef = useRef<THREE.Group>(null!)
  const broomRef = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    const radius = 8
    const angle = t * 0.7
    const x = -50 + Math.cos(angle) * radius
    const z = -20 + Math.sin(angle) * radius
    const y = 4 + Math.sin(t * 1.3) * 0.5

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z)
      // face direction of travel
      groupRef.current.rotation.y = -angle - Math.PI / 2
    }
    if (broomRef.current) {
      // slight tilt
      broomRef.current.rotation.z = Math.sin(t * 1.3) * 0.12
    }
  })

  const bristleAngles = useMemo(() =>
    Array.from({ length: 9 }, (_, i) => ({
      angle: ((i / 9) * Math.PI * 2),
      spread: 0.18 + (i % 3) * 0.06,
    })), [])

  return (
    <group ref={groupRef}>
      <group ref={broomRef} rotation={[0.22, 0, 0]}>
        {/* Handle — long brown wood cylinder along Z axis */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.85} />
        </mesh>

        {/* Broom tie — at bristle junction */}
        <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#333300" roughness={0.9} />
        </mesh>

        {/* Bristles — 9 thin cylinders fanning out from handle end */}
        {bristleAngles.map((b, i) => (
          <mesh
            key={`bristle${i}`}
            position={[
              Math.cos(b.angle) * b.spread,
              Math.sin(b.angle) * b.spread,
              1.65,
            ]}
            rotation={[
              Math.sin(b.angle) * 0.35,
              0,
              Math.cos(b.angle) * 0.35,
            ]}
          >
            <cylinderGeometry args={[0.035, 0.02, 0.5, 5]} />
            <meshStandardMaterial color="#cc9933" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── MagicMirror — ornate magic mirror on the workshop wall ───
function MagicMirror() {
  const mirrorMatRef = useRef<THREE.MeshStandardMaterial>(null!)

  const runePositions = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const r = 1.5
      return {
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        phase: (i / 8) * Math.PI * 2,
      }
    }), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    if (mirrorMatRef.current) {
      mirrorMatRef.current.emissiveIntensity = 1 + Math.sin(t * 0.7) * 0.6
    }
  })

  return (
    <group position={[-55, 4, -20]} rotation={[0, Math.PI / 2, 0]}>
      {/* Purple point light behind mirror */}
      <pointLight color="#aa00ff" intensity={4} distance={15} decay={2} position={[0.5, 0, 0]} />

      {/* Ornate frame — torus */}
      <mesh>
        <torusGeometry args={[1.5, 0.3, 16, 48]} />
        <meshStandardMaterial color="#884400" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Mirror surface — circle */}
      <mesh>
        <circleGeometry args={[1.4, 48]} />
        <meshStandardMaterial
          ref={mirrorMatRef}
          color="#001122"
          emissive="#4400aa"
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 8 rune carvings on frame — small emissive spheres in a ring */}
      {runePositions.map((rp, ri) => (
        <mesh key={`mrune${ri}`} position={[rp.x, rp.y, 0.32]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial
            color="#330044"
            emissive="#cc44ff"
            emissiveIntensity={4}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── MoonPortal — large glowing circle portal floating at z=-50 ───
function MoonPortal() {
  const groupRef = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.005
    }
  })

  return (
    <group position={[0, 8, -50]}>
      {/* Central point light */}
      <pointLight color="#8800ff" intensity={6} distance={20} decay={2} />

      {/* Outer torus ring */}
      <mesh ref={groupRef}>
        <torusGeometry args={[6, 0.4, 16, 64]} />
        <meshStandardMaterial
          color="#220044"
          emissive="#8800ff"
          emissiveIntensity={2}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Inner disc */}
      <mesh>
        <circleGeometry args={[5.5, 64]} />
        <meshStandardMaterial
          color="#110022"
          emissive="#4400aa"
          emissiveIntensity={1}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── BatSwarm — 18 animated bats flying erratically in the night sky ─────────
function BatSwarm() {
  const COUNT = 18
  const bodyRef = useRef<THREE.InstancedMesh>(null!)
  const leftRef = useRef<THREE.InstancedMesh>(null!)
  const rightRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    cx: (i % 6 - 2.5) * 5,
    cy: 10 + (i % 5) * 2.4,
    cz: (Math.floor(i / 6) - 1.5) * 8,
    radius: 4 + (i % 4) * 2,
    speed: 0.8 + (i % 5) * 0.24,
    phase: (i / COUNT) * Math.PI * 2,
    wingPhase: (i / COUNT) * Math.PI * 1.618,
  })), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (!bodyRef.current) return
    const t = clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      const angle = t * d.speed + d.phase
      const bx = d.cx + Math.cos(angle) * d.radius + Math.sin(t * 2.1 + d.phase) * 1.5
      const by = d.cy + Math.sin(t * 0.7 + d.phase) * 2
      const bz = d.cz + Math.sin(angle) * d.radius
      const batRotY = -angle
      const wing = Math.sin(t * 4 + d.wingPhase) * 0.6
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      dummy.position.set(bx, by, bz)
      dummy.rotation.set(0, batRotY, 0)
      dummy.updateMatrix()
      bodyRef.current.setMatrixAt(i, dummy.matrix)

      dummy.position.set(bx - 0.28 * cosA, by, bz - 0.28 * sinA)
      dummy.rotation.set(0, batRotY, wing)
      dummy.updateMatrix()
      leftRef.current.setMatrixAt(i, dummy.matrix)

      dummy.position.set(bx + 0.28 * cosA, by, bz + 0.28 * sinA)
      dummy.rotation.set(0, batRotY, -wing)
      dummy.updateMatrix()
      rightRef.current.setMatrixAt(i, dummy.matrix)
    }
    bodyRef.current.instanceMatrix.needsUpdate = true
    leftRef.current.instanceMatrix.needsUpdate = true
    rightRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={bodyRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.08, 5, 5]} />
        <meshBasicMaterial color="#220022" />
      </instancedMesh>
      <instancedMesh ref={leftRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <planeGeometry args={[0.55, 0.25]} />
        <meshBasicMaterial color="#110011" side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={rightRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <planeGeometry args={[0.55, 0.25]} />
        <meshBasicMaterial color="#110011" side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  )
}

// ─── HauntedMoon — large glowing moon in the sky ─────────────────────────────
function HauntedMoon() {
  const ref = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (!ref.current) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.85 + 0.1 * Math.sin(clock.elapsedTime * 0.2)
  })
  return (
    <group position={[30, 45, -60]}>
      <mesh ref={ref}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshBasicMaterial color="#e8f0c8" transparent opacity={0.9} />
      </mesh>
      {/* Moon halo */}
      <mesh>
        <ringGeometry args={[6.5, 9, 32]} />
        <meshBasicMaterial color="#aabf70" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color="#c8e090" intensity={2.5} distance={80} />
    </group>
  )
}

// ─── GraveyardDecor — pumpkins, tombstone boxes, and crypt arches in the exterior graveyard ───
const GRAVEYARD_PUMPKIN_POSITIONS: [number, number, number][] = [
  [-24, 0.1, -16],
  [ 24, 0.1, -16],
  [-24, 0.1,  16],
  [ 24, 0.1,  16],
  [-18, 0.1, -22],
  [ 18, 0.1, -22],
  [-18, 0.1,  22],
  [ 18, 0.1,  22],
]

const TOMBSTONE_POSITIONS: [number, number, number][] = [
  [-26, 0.6, -26],
  [ 26, 0.6, -26],
  [-26, 0.6,  26],
  [ 26, 0.6,  26],
]

const CRYPT_ARCH_POSITIONS: [number, number, number][] = [
  [-26, 0,  0],
  [ 26, 0,  0],
]

function CryptArch({ pos }: { pos: [number, number, number] }) {
  const archZ = pos[2]
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-0.25, 0.3, archZ] as [number, number, number]}>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
      </mesh>
      {/* Right post */}
      <mesh position={[0.25, 0.3, archZ] as [number, number, number]}>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
      </mesh>
      {/* Lintel */}
      <mesh position={[0, 0.725, archZ] as [number, number, number]}>
        <boxGeometry args={[0.75, 0.15, 0.25]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.9} />
      </mesh>
    </group>
  )
}

function GraveyardDecor() {
  return (
    <>
      {/* 8 Pumpkins scattered in the graveyard exterior */}
      {GRAVEYARD_PUMPKIN_POSITIONS.map((pos, i) => (
        <Pumpkin key={`gvpk${i}`} pos={pos} scale={1.2} rotY={(i * 1.1) % (Math.PI * 2)} />
      ))}
      {/* 4 tombstone-style boxes at graveyard corners */}
      {TOMBSTONE_POSITIONS.map((pos, i) => (
        <mesh key={`tomb${i}`} position={pos} castShadow>
          <boxGeometry args={[0.5, 1.2, 0.1]} />
          <meshStandardMaterial color="#333344" roughness={0.95} />
        </mesh>
      ))}
      {/* 2 crypt arch structures flanking the exterior */}
      {CRYPT_ARCH_POSITIONS.map((pos, i) => (
        <CryptArch key={`arch${i}`} pos={pos} />
      ))}
    </>
  )
}

// ─── MansionChandelier — large ceiling chandelier for the mansion centre ───
function MansionChandelier() {
  const candles: { pos: [number, number, number] }[] = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2
    return {
      pos: [Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5] as [number, number, number],
    }
  })

  return (
    <group position={[0, 6, 0]}>
      {/* Central point light */}
      <pointLight color="#ffcc88" intensity={8} distance={18} decay={2} />
      {/* Main torus ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 8, 32]} />
        <meshStandardMaterial color="#aa8822" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 6 hanging candle cylinders evenly spaced around the ring */}
      {candles.map((c, i) => (
        <mesh key={`chc${i}`} position={c.pos}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial
            color="#ddaa66"
            emissive="#ffaa44"
            emissiveIntensity={1.0}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// ─── DragonSkeleton — massive ancient fossilized dragon lying across [40,0,30] to [60,0,10] ───
const DRAGON_BONE_MIST_COUNT = 20
const DRAGON_CURSE_MOTE_COUNT = 30

function DragonSkeleton() {
  const mistRef = useRef<THREE.InstancedMesh>(null!)
  const mistData = useMemo(() =>
    Array.from({ length: DRAGON_BONE_MIST_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 18,
      z: (Math.random() - 0.5) * 18,
      phase: (i / DRAGON_BONE_MIST_COUNT) * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.1,
      size: 0.5 + Math.random() * 0.8,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    mistData.forEach((m, i) => {
      const cycleT = (t * m.speed + m.phase) % 4.0
      dummy.position.set(m.x, 0.2 + cycleT * 0.6, m.z)
      const fade = 1.0 - cycleT / 4.0
      dummy.scale.setScalar(m.size * (0.5 + fade * 0.5))
      dummy.updateMatrix()
      if (mistRef.current) mistRef.current.setMatrixAt(i, dummy.matrix)
    })
    if (mistRef.current) mistRef.current.instanceMatrix.needsUpdate = true
  })

  // Pre-compute spine curve: 12 vertebrae from skull to tail along Z
  const spineVerts = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const t = i / 11
      return {
        x: Math.sin(t * Math.PI * 0.6) * 2.5,
        y: 0.5 + Math.sin(t * Math.PI) * 1.2,
        z: -t * 18,
        r: 0.6 - t * 0.25,
      }
    }), [])

  // 8 rib pairs — one per each of the first 8 spine vertebrae
  const ribData = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const sv = spineVerts[i]!
      return { x: sv.x, y: sv.y, z: sv.z }
    }), [spineVerts])

  // 10 teeth positions along jaw edges
  const teethLeft = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      x: -1.2 + i * 0.45,
      y: -0.3,
      z: 4.5,
    })), [])
  const teethRight = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      x: -1.2 + i * 0.45,
      y: -0.3,
      z: 3.5,
    })), [])

  // 8 tail vertebrae tapering from last spine vert outward
  const tailVerts = useMemo(() => {
    const base = spineVerts[11]!
    return Array.from({ length: 8 }, (_, i) => {
      const t = (i + 1) / 8
      return {
        x: base.x + Math.sin(t * Math.PI * 0.8) * 3,
        y: base.y * (1 - t * 0.8),
        z: base.z - t * 8,
        r: Math.max(0.12, 0.35 - t * 0.25),
      }
    })
  }, [spineVerts])

  return (
    <group position={[50, 0, 20]}>
      {/* ── Skull ── */}
      <group position={[0, 2.5, 0]}>
        {/* Main skull */}
        <mesh scale={[1.5, 1.0, 1.8]}>
          <sphereGeometry args={[3, 12, 12]} />
          <meshStandardMaterial color="#ddccaa" roughness={0.85} />
        </mesh>

        {/* Upper jaw */}
        <mesh position={[0, -1.2, 4.5]}>
          <boxGeometry args={[4, 0.8, 3]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>

        {/* Lower jaw — dropped open at ~25° */}
        <mesh position={[0, -2.4, 4.0]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[3.5, 0.6, 2.5]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>

        {/* 10 teeth — 5 upper, 5 lower */}
        {teethLeft.map((t, i) => (
          <mesh key={`tu${i}`} position={[t.x, -0.85, t.z]}>
            <coneGeometry args={[0.2, 0.6, 6]} />
            <meshStandardMaterial color="#ccbbaa" roughness={0.8} />
          </mesh>
        ))}
        {teethRight.map((t, i) => (
          <mesh key={`tl${i}`} position={[t.x, -2.15, t.z]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.2, 0.6, 6]} />
            <meshStandardMaterial color="#ccbbaa" roughness={0.8} />
          </mesh>
        ))}

        {/* Left eye socket — indented dark sphere with emissive purple glow */}
        <mesh position={[-1.8, 0.6, -2.2]}>
          <sphereGeometry args={[0.8, 10, 10]} />
          <meshStandardMaterial
            color="#110022"
            emissive="#8800ff"
            emissiveIntensity={2}
            roughness={0.3}
          />
        </mesh>
        {/* Right eye socket */}
        <mesh position={[1.8, 0.6, -2.2]}>
          <sphereGeometry args={[0.8, 10, 10]} />
          <meshStandardMaterial
            color="#110022"
            emissive="#8800ff"
            emissiveIntensity={2}
            roughness={0.3}
          />
        </mesh>

        {/* Eye socket glow lights */}
        <pointLight color="#8800ff" intensity={4} distance={10} decay={2} position={[-1.8, 0.6, -2.2]} />
        <pointLight color="#8800ff" intensity={4} distance={10} decay={2} position={[1.8, 0.6, -2.2]} />

        {/* Left horn — angled cone */}
        <mesh position={[-2.2, 2.8, -2.0]} rotation={[0.3, 0, -0.5]}>
          <coneGeometry args={[0.4, 2, 8]} />
          <meshStandardMaterial color="#bbaa88" roughness={0.9} />
        </mesh>
        {/* Horn bend segment */}
        <mesh position={[-2.9, 4.2, -2.3]} rotation={[0.6, 0, -0.7]}>
          <coneGeometry args={[0.22, 1.0, 8]} />
          <meshStandardMaterial color="#bbaa88" roughness={0.9} />
        </mesh>

        {/* Right horn */}
        <mesh position={[2.2, 2.8, -2.0]} rotation={[0.3, 0, 0.5]}>
          <coneGeometry args={[0.4, 2, 8]} />
          <meshStandardMaterial color="#bbaa88" roughness={0.9} />
        </mesh>
        {/* Horn bend segment */}
        <mesh position={[2.9, 4.2, -2.3]} rotation={[0.6, 0, 0.7]}>
          <coneGeometry args={[0.22, 1.0, 8]} />
          <meshStandardMaterial color="#bbaa88" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Spine: 12 vertebrae along a curve ── */}
      {spineVerts.map((sv, i) => (
        <group key={`sv${i}`} position={[sv.x, sv.y, sv.z]}>
          {/* Vertebra body */}
          <mesh>
            <sphereGeometry args={[sv.r, 8, 8]} />
            <meshStandardMaterial color="#ddccaa" roughness={0.85} />
          </mesh>
          {/* Dorsal spine process (up) */}
          <mesh position={[0, sv.r + 0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
            <meshStandardMaterial color="#ccbb99" roughness={0.85} />
          </mesh>
          {/* Ventral process (down) */}
          <mesh position={[0, -(sv.r + 0.3), 0]}>
            <cylinderGeometry args={[0.06, 0.1, 0.6, 5]} />
            <meshStandardMaterial color="#ccbb99" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* ── Ribs: 8 pairs from first 8 vertebrae ── */}
      {ribData.map((rv, i) => {
        const ribLen = 2.5 + i * 0.25
        const ribAngle = 0.5 + i * 0.04
        return (
          <group key={`rib${i}`} position={[rv.x, rv.y, rv.z]}>
            {/* Left rib */}
            <mesh
              position={[-(ribLen * 0.5), ribLen * 0.3, 0]}
              rotation={[0, 0, Math.PI / 2 - ribAngle]}
            >
              <cylinderGeometry args={[0.1, 0.2, ribLen, 6]} />
              <meshStandardMaterial color="#ccbb99" roughness={0.85} />
            </mesh>
            {/* Right rib */}
            <mesh
              position={[ribLen * 0.5, ribLen * 0.3, 0]}
              rotation={[0, 0, -(Math.PI / 2 - ribAngle)]}
            >
              <cylinderGeometry args={[0.1, 0.2, ribLen, 6]} />
              <meshStandardMaterial color="#ccbb99" roughness={0.85} />
            </mesh>
          </group>
        )
      })}

      {/* ── Wing bones (left wing) — partially raised, mid-collapse ── */}
      <group position={[-4, 2.5, -4]}>
        {/* Humerus */}
        <mesh position={[-2.5, 1.5, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.25, 0.35, 5, 8]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-6.0, 0.8, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.18, 0.28, 4.5, 8]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>
        {/* 4 finger bones radiating outward */}
        {([0, 1, 2, 3] as number[]).map((fi) => (
          <mesh
            key={`lwf${fi}`}
            position={[-9 + fi * 0.3, 0.5 - fi * 0.15, fi * 0.5 - 0.75]}
            rotation={[fi * 0.1, 0, -0.2 + fi * 0.1]}
          >
            <cylinderGeometry args={[0.06, 0.14, 3 + fi * 0.3, 6]} />
            <meshStandardMaterial color="#ccbb99" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ── Wing bones (right wing) ── */}
      <group position={[4, 2.5, -4]}>
        {/* Humerus */}
        <mesh position={[2.5, 1.5, 0]} rotation={[0, 0, 0.8]}>
          <cylinderGeometry args={[0.25, 0.35, 5, 8]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>
        {/* Forearm */}
        <mesh position={[6.0, 0.8, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.18, 0.28, 4.5, 8]} />
          <meshStandardMaterial color="#ccbb99" roughness={0.85} />
        </mesh>
        {/* 4 finger bones radiating outward */}
        {([0, 1, 2, 3] as number[]).map((fi) => (
          <mesh
            key={`rwf${fi}`}
            position={[9 - fi * 0.3, 0.5 - fi * 0.15, fi * 0.5 - 0.75]}
            rotation={[fi * 0.1, 0, 0.2 - fi * 0.1]}
          >
            <cylinderGeometry args={[0.06, 0.14, 3 + fi * 0.3, 6]} />
            <meshStandardMaterial color="#ccbb99" roughness={0.85} />
          </mesh>
        ))}
      </group>

      {/* ── Tail: 8 vertebrae tapering outward ── */}
      {tailVerts.map((tv, i) => (
        <mesh key={`tv${i}`} position={[tv.x, tv.y, tv.z]}>
          <sphereGeometry args={[tv.r, 7, 7]} />
          <meshStandardMaterial color="#ddccaa" roughness={0.85} />
        </mesh>
      ))}

      {/* ── Green bone mist — InstancedMesh 20 spheres ── */}
      <instancedMesh ref={mistRef} args={[undefined, undefined, DRAGON_BONE_MIST_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial
          color="#22aa44"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Extra atmospheric purple glow over the full body */}
      <pointLight color="#8800ff" intensity={3} distance={25} decay={2} position={[0, 4, -8]} />
      <pointLight color="#44ff88" intensity={2} distance={20} decay={2} position={[0, 2, -15]} />
    </group>
  )
}

// ─── DragonAura — mystical orbiting rune circles + curse energy motes ───
function DragonAura() {
  const runeRingMeshRef = useRef<THREE.InstancedMesh>(null!)
  const moteRef = useRef<THREE.InstancedMesh>(null!)

  const ringData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      speed: 0.18 + i * 0.07,
      yOffset: 4 + (i % 3) * 1.5,
      phase: (i / 6) * Math.PI * 2,
      tiltX: (i % 2 === 0 ? 0.3 : -0.3),
      tiltZ: (i % 3 === 0 ? 0.2 : (i % 3 === 1 ? -0.15 : 0.1)),
      rotY: 0,
    })), [])

  const moteData = useMemo(() =>
    Array.from({ length: DRAGON_CURSE_MOTE_COUNT }, (_, i) => ({
      orbitR: 4 + Math.random() * 10,
      yBase: 1 + Math.random() * 5,
      speed: 0.2 + Math.random() * 0.35,
      phase: (i / DRAGON_CURSE_MOTE_COUNT) * Math.PI * 2,
      yAmp: 0.5 + Math.random() * 1.0,
      yFreq: 0.3 + Math.random() * 0.4,
      size: 0.12 + Math.random() * 0.2,
    })), [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime

    // Orbit ring circles around skull at [50,0,20] local origin at [0,0,0]
    if (runeRingMeshRef.current) {
      ringData.forEach((rd, i) => {
        const angle = t * rd.speed + rd.phase
        dummy.position.set(Math.cos(angle) * 8, rd.yOffset + Math.sin(t * 0.4 + rd.phase) * 0.5, Math.sin(angle) * 8)
        dummy.rotation.set(rd.tiltX + Math.sin(t * 0.2 + rd.phase) * 0.1, rd.rotY, rd.tiltZ)
        rd.rotY += 0.02
        dummy.updateMatrix()
        runeRingMeshRef.current.setMatrixAt(i, dummy.matrix)
      })
      runeRingMeshRef.current.instanceMatrix.needsUpdate = true
    }

    // Animate curse motes
    moteData.forEach((m, i) => {
      const angle = t * m.speed + m.phase
      dummy.position.set(
        Math.cos(angle) * m.orbitR,
        m.yBase + Math.sin(t * m.yFreq + m.phase) * m.yAmp,
        Math.sin(angle) * m.orbitR - 8,
      )
      dummy.scale.setScalar(m.size)
      dummy.updateMatrix()
      if (moteRef.current) moteRef.current.setMatrixAt(i, dummy.matrix)
    })
    if (moteRef.current) moteRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={[50, 0, 20]}>
      {/* 6 orbiting torus rune circles */}
      <instancedMesh ref={runeRingMeshRef} args={[undefined, undefined, 6]} frustumCulled={false}>
        <torusGeometry args={[1.5, 0.08, 8, 40]} />
        <meshStandardMaterial
          color="#220044"
          emissive="#8800ff"
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      {/* 30 purple energy motes drifting around the body */}
      <instancedMesh ref={moteRef} args={[undefined, undefined, DRAGON_CURSE_MOTE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshStandardMaterial
          color="#440088"
          emissive="#8800ff"
          emissiveIntensity={4}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}

export default function MysteryWorld() {
  const vignetteColor = useMemo(() => new THREE.Color('#1a0e2e'), [])

  return (
    <>
      <color attach="background" args={[vignetteColor]} />

      {/* Fog of mystery */}
      <fog attach="fog" args={['#0a0510', 15, 60]} />

      {/* Very dark sky */}
      <GradientSky top="#050205" bottom="#150825" radius={440} />

      <Floor />
      <Walls />

      {/* ─── Atmospheric FX ─────────────────────────────────── */}
      <GhostFootprints />
      <MansionFog />
      <CandleLights />
      <FootstepDust />
      <BatSwarm />
      <HauntedMoon />

      {/* ─── Atmospheric depth additions ─── */}
      <FloatingRunes />
      <CrystalCave />
      <MoonPortal />
      <StoneCircle />
      <SwampZone />
      <SpectralText />

      {/* ─── Graveyard exterior props ─── */}
      <GraveyardDecor />

      {/* ─── Mansion chandelier — centre ceiling ─── */}
      <MansionChandelier />

      {/* Shadow vignette ground */}
      <VignetteGround />

      {/* Pulsing mystery ring */}
      <MysteryRing />

      {/* 6 floating golden mystery orbs */}
      {ORB_POSITIONS.map((pos, i) => (
        <MysteryOrb key={`orb${i}`} basePos={pos} />
      ))}

      {ROOMS.map((r, i) => (
        <RoomAccent key={i} room={r} />
      ))}

      {/* Столы по центру каждой комнаты */}
      {ROOMS.map((r, i) => (
        <Table key={`t${i}`} pos={[r.cx, 0.5, r.cz]} />
      ))}

      {/* ─── Kenney Graveyard props ─── */}
      {/* Гроб в «Столовой» — атмосфера */}
      <GraveyardProp file="coffin.glb" pos={[-8, 0.1, -12]} scale={2} rotY={Math.PI / 4} />
      {/* Свечи на всех четырёх столах */}
      {ROOMS.map((r, i) => (
        <GraveyardProp key={`cd${i}`} file="candle.glb" pos={[r.cx - 0.6, 1.1, r.cz]} scale={1.5} />
      ))}
      {/* Тыквы-фонари по углам каждой комнаты */}
      {ROOMS.map((r, i) => (
        <GraveyardProp
          key={`pk${i}`}
          file="pumpkin-carved.glb"
          pos={[r.cx + (r.cx > 0 ? 3 : -3), 0.1, r.cz + (r.cz > 0 ? 3 : -3)]}
          scale={1.6}
        />
      ))}
      {/* Фонари на стенах */}
      <GraveyardProp file="lantern-glass.glb" pos={[0, 0, -14]} scale={1.8} />
      <GraveyardProp file="lantern-glass.glb" pos={[0, 0, 14]} scale={1.8} rotY={Math.PI} />
      {/* Кресты снаружи (сквозь окна) */}
      <GraveyardProp file="cross.glb" pos={[-24, 0, 4]} scale={2} />
      <GraveyardProp file="cross.glb" pos={[24, 0, -4]} scale={2} />
      {/* Маленький склеп рядом с особняком */}
      <GraveyardProp file="crypt.glb" pos={[-24, 0, -20]} scale={2} rotY={Math.PI / 3} />
      <GraveyardProp file="crypt.glb" pos={[24, 0, 20]} scale={2} rotY={-Math.PI / 3} />
      {/* Забор по периметру (сегментами) */}
      {[-18, -10, 10, 18].map((x) => (
        <GraveyardProp key={`f-n${x}`} file="fence.glb" pos={[x, 0, -23]} scale={1.8} />
      ))}
      {[-18, -10, 10, 18].map((x) => (
        <GraveyardProp key={`f-s${x}`} file="fence.glb" pos={[x, 0, 23]} scale={1.8} rotY={Math.PI} />
      ))}

      {/* 5 улик — 4 в комнатах + 1 на центральном столе */}
      {ROOMS.map((r, i) => (
        <group key={`clue${i}`}>
          <ClueOrb pos={[r.cx + 0.8, 1.2, r.cz]} />
          <Coin pos={[r.cx + 0.8, 1.2, r.cz]} value={2} />
        </group>
      ))}
      <Coin pos={[0, 1.2, 0]} value={5} />

      {/* Котёл в оранжерее, факелы у входа, книжные полки в библиотеке */}
      <Cauldron pos={[-8, 0, 8]} scale={1.5} />
      <Torch pos={[-22, 0, 0]} scale={1.3} rotY={Math.PI / 2} />
      <Torch pos={[22, 0, 0]} scale={1.3} rotY={-Math.PI / 2} />
      <Bookshelf pos={[5, 0, -12]} scale={1.8} rotY={Math.PI / 2} />
      <Bookshelf pos={[11, 0, -8]} scale={1.8} />
      <Bookshelf pos={[11, 0, -4]} scale={1.8} />
      <Chair pos={[8, 0, -8]} scale={1.5} rotY={Math.PI / 4} />
      <Chair pos={[8, 0, -4]} scale={1.5} rotY={-Math.PI / 6} />

      {/* 3 подозреваемых NPC */}
      <NPC pos={[-8, 0, -14]} label="ГОСТЬ"   bodyColor="#ffb4b4" />
      <NPC pos={[8, 0, -14]}  label="ПОВАР"   bodyColor="#a9d8ff" />
      <NPC pos={[-8, 0, 14]}  label="САДОВНИК" bodyColor="#c6f0c0" />
      {/* Таинственный кот — настоящий свидетель */}
      <NpcCat pos={[0, 0, 12]} rotY={Math.PI / 5} />

      {/* Патрулирующий «призрак» */}
      <GltfMonster which="alien" pos={[0, 2, 0]} patrolX={4} scale={0.9} sensor animation="Wave" />

      {/* Декор снаружи (через проёмы видно) */}
      <Tree pos={[-20, 0, -20]} variant={2} />
      <Tree pos={[20, 0, -20]}  variant={3} />
      <Tree pos={[-20, 0, 20]}  variant={0} />
      <Tree pos={[20, 0, 20]}   variant={1} />
      <Bush pos={[-16, 0, -4]}  variant={0} scale={1.0} />
      <Bush pos={[16, 0, 4]}    variant={1} scale={1.0} />
      <Mushroom pos={[-18, 0, 10]} red scale={1.4} />
      <Mushroom pos={[18, 0, -10]} red={false} scale={1.3} />

      {/* ─── Злодей — финальное раскрытие у зоны финиша ─── */}
      {/* BossWizard «Злодей» стоит у детектив-стола, повернут лицом к игроку */}
      <BossWizard pos={[3.5, 0, 3.5]} scale={1.4} rotY={-Math.PI * 0.75} />

      {/* ─── CrystalCluster — светящиеся улики по особняку ─── */}
      {/* В каждой из 4 комнат по углам + 2 внешних у входа */}
      <CrystalCluster pos={[-11, 0, -11]} scale={1.2} rotY={Math.PI / 6} />
      <CrystalCluster pos={[11, 0, -11]}  scale={1.0} rotY={-Math.PI / 5} />
      <CrystalCluster pos={[-11, 0, 11]}  scale={1.3} rotY={Math.PI / 3} />
      <CrystalCluster pos={[11, 0, 11]}   scale={1.1} rotY={-Math.PI / 4} />
      <CrystalCluster pos={[-5, 0, -18]}  scale={0.9} rotY={Math.PI / 7} />
      <CrystalCluster pos={[5, 0, -18]}   scale={1.0} rotY={-Math.PI / 8} />
      <CrystalCluster pos={[-18, 0, 5]}   scale={1.2} rotY={Math.PI / 2} />
      <CrystalCluster pos={[18, 0, -5]}   scale={1.1} rotY={-Math.PI / 3} />

      {/* ─── IceBlock — ледяные скульптуры в садике особняка ─── */}
      <IceBlock pos={[-20, 0, -12]} scale={1.3} rotY={Math.PI / 5} />
      <IceBlock pos={[20, 0, -12]}  scale={1.2} rotY={-Math.PI / 6} />
      <IceBlock pos={[-20, 0, 12]}  scale={1.4} rotY={Math.PI / 4} />
      <IceBlock pos={[20, 0, 12]}   scale={1.3} rotY={-Math.PI / 5} />

      {/* ─── LavaRock — драматические каменные образования ─── */}
      <LavaRock pos={[-25, 0, 0]}  scale={1.5} rotY={Math.PI / 6} />
      <LavaRock pos={[25, 0, 0]}   scale={1.6} rotY={-Math.PI / 4} />
      <LavaRock pos={[0, 0, 25]}   scale={1.4} rotY={Math.PI / 3} />
      <LavaRock pos={[0, 0, -25]}  scale={1.5} rotY={-Math.PI / 7} />

      {/* ─── PharaohMask — экзотические артефакты коллекционера ─── */}
      {/* Библиотека — на книжной полке, как раритет */}
      <PharaohMask pos={[11, 1.2, -6]} scale={0.9} rotY={-Math.PI * 0.4} />
      {/* Кабинет — на каминной полке, загадочный экспонат */}
      <PharaohMask pos={[6, 1.0, 10]}  scale={1.0} rotY={Math.PI * 0.8} />
      {/* Столовая — на столе, как центральный артефакт */}
      <PharaohMask pos={[-10, 1.0, -4]} scale={1.1} rotY={Math.PI * 0.3} />

      {/* ─── RuinsPillar — broken decorative columns in mansion grounds ─── */}
      {/* Four broken ancient columns at the outer corners of the mansion grounds */}
      <RuinsPillar pos={[-20, 0, -20]} scale={1.3} rotY={0.4} />
      <RuinsPillar pos={[20, 0, -20]} scale={1.2} rotY={-0.7} />
      <RuinsPillar pos={[-20, 0, 20]} scale={1.4} rotY={1.2} />
      <RuinsPillar pos={[20, 0, 20]} scale={1.1} rotY={2.1} />

      {/* ─── MagicPotion — mysterious potion artifacts inside the mansion rooms ─── */}
      {/* Столовая room — potion on the side table */}
      <MagicPotion pos={[-10, 1.1, -6]} scale={0.9} rotY={0.5} />
      {/* Библиотека room — potion near the bookshelf */}
      <MagicPotion pos={[9, 1.1, -10]} scale={1.0} rotY={-0.3} />
      {/* Оранжерея room — glowing potion among the plants */}
      <MagicPotion pos={[-6, 1.1, 11]} scale={0.85} rotY={1.1} />
      {/* Кабинет room — collector's mysterious vial */}
      <MagicPotion pos={[11, 1.1, 7]} scale={0.95} rotY={-1.4} />

      {/* ─── Spiders — creepy graveyard & mansion decorations ─── */}
      {/* 4 spiders scattered near the graveyard / tombstone area */}
      <Spider pos={[-25, 0, -22]} scale={1.4} rotY={0.6} />
      <Spider pos={[24, 0, -25]} scale={1.8} rotY={2.1} />
      <Spider pos={[-27, 0, 24]} scale={1.2} rotY={-0.9} />
      <Spider pos={[26, 0, 27]} scale={1.6} rotY={3.5} />

      {/* 2 spiders on mansion exterior walls (y=2-3) */}
      <Spider pos={[-22, 2.5, -8]} scale={1.5} rotY={Math.PI / 2} />
      <Spider pos={[22, 2, 10]} scale={1.5} rotY={-Math.PI / 2} />

      {/* 2 giant spiders flanking the mansion entrance (z≈-22, one each side) */}
      <Spider pos={[-6, 0, -22]} scale={2.5} rotY={0.3} />
      <Spider pos={[6, 0, -22]} scale={2.5} rotY={-0.3} />

      {/* ─── Spider webs in mansion corners (thin planes at y=3.5, 45° tilts) ─── */}
      {/* SW corner — Столовая */}
      <mesh position={[-20, 3.5, -20]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* NE corner — Библиотека */}
      <mesh position={[20, 3.5, -20]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* NW corner — Оранжерея */}
      <mesh position={[-20, 3.5, 20]} rotation={[0, Math.PI * 0.75, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ─── Clue particle trail orbiting the villain / goal ─── */}
      <ClueParticles />

      {/* Финиш — «детективный стол» в центре с лупой */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.3, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 1.8, 0.6, 20]} />
          <meshStandardMaterial color="#6B5CE7" emissive="#6B5CE7" emissiveIntensity={0.35} roughness={0.4} metalness={0.4} />
        </mesh>
      </RigidBody>
      {/* ─── Wizard Workshop corner ─── */}
      <WizardWorkshop />
      <FlyingBroomstick />
      <MagicMirror />

      {/* ─── Ancient Dragon Skeleton — boss centerpiece at [50,0,20] ─── */}
      <DragonSkeleton />
      <DragonAura />

      {/* ─── Ghost Apparition — drifts figure-8 through the mansion ─── */}
      <GhostApparition />

      <GoalTrigger
        pos={[0, 1.5, 0]}
        size={[4, 3, 4]}
        result={{
          kind: 'win',
          label: 'ДЕЛО РАСКРЫТО!',
          subline: 'Ты собрал все улики и вычислил виновного.',
        }}
      />
    </>
  )
}

export const MYSTERY_SPAWN: [number, number, number] = [0, 3, -18]
