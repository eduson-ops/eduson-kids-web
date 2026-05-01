import { RigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import {
  Tree, Bush, Flowers, MushroomGlow, Crystal,
  Lantern, FlowerPot, Flag, TreePine, TreeRound,
  Snowflake, PalmTree, IceBlock, LavaRock, CrystalCluster,
} from '../Scenery'
import NPC from '../NPC'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

export const PETSIM_SPAWN: [number, number, number] = [0, 3, 8]

// ─── Biome ground floors ───────────────────────────────────────────────────

function BiomeFloor({
  color, z0, z1, roughness = 0.85, metalness = 0,
  emissive = '#000000', emissiveIntensity = 0,
}: {
  color: string; z0: number; z1: number
  roughness?: number; metalness?: number
  emissive?: string; emissiveIntensity?: number
}) {
  const len = Math.abs(z1 - z0)
  const cz = (z0 + z1) / 2
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, cz]}>
      <mesh receiveShadow>
        <boxGeometry args={[40, 0.5, len]} />
        <meshStandardMaterial
          color={color} roughness={roughness} metalness={metalness}
          emissive={emissive} emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </RigidBody>
  )
}

// ─── Lava shader for Volcano biome ────────────────────────────────────────

const lavaVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const lavaFrag = `
  uniform float iTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv * 6.0;
    float n = fbm(uv + vec2(iTime * 0.3, iTime * 0.2));
    float n2 = fbm(uv * 1.3 - vec2(iTime * 0.2, iTime * 0.15) + n);
    float lava = smoothstep(0.3, 0.7, n2);
    vec3 hot = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.85, 0.0), lava);
    vec3 dark = vec3(0.08, 0.02, 0.02);
    vec3 col = mix(dark, hot, pow(lava, 1.5));
    gl_FragColor = vec4(col, 1.0);
  }
`

function LavaFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame((_, dt) => { if (matRef.current) matRef.current.uniforms.iTime!.value += dt })
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -75]}>
      <mesh receiveShadow>
        <boxGeometry args={[40, 0.5, 30]} />
        <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={lavaVert} fragmentShader={lavaFrag} />
      </mesh>
    </RigidBody>
  )
}

// ─── Breakable block (sensor-based, with scale-out animation) ─────────────

function BreakableBlock({
  pos, color, emissive = '#000000', emissiveInt = 0, metalness = 0.1,
}: {
  pos: [number, number, number]
  color: string
  emissive?: string
  emissiveInt?: number
  metalness?: number
}) {
  const [broken, setBroken] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null!)
  const breakT = useRef(0)
  const breaking = useRef(false)

  useFrame((_, dt) => {
    if (breaking.current && meshRef.current) {
      breakT.current += dt
      const p = Math.min(breakT.current / 0.3, 1)
      meshRef.current.scale.setScalar(1 - p)
      if (p >= 1) setBroken(true)
    }
    if (!breaking.current && meshRef.current) {
      meshRef.current.rotation.y += dt * 0.5
    }
  })

  if (broken) return null

  return (
    <group>
      <RigidBody
        type="fixed"
        colliders="cuboid"
        position={pos}
        sensor={breaking.current}
        onIntersectionEnter={({ other }) => {
          if (breaking.current) return
          if (other.rigidBodyObject?.name === 'player') {
            breaking.current = true
            breakT.current = 0
            addCoin(3)
            SFX.coin()
          }
        }}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[3, 1.5, 3]} />
          <meshStandardMaterial
            color={color} roughness={0.4} metalness={metalness}
            emissive={emissive} emissiveIntensity={emissiveInt}
          />
        </mesh>
      </RigidBody>
      {/* Coin floating above block */}
      <Coin pos={[pos[0], pos[1] + 1.8, pos[2]]} />
    </group>
  )
}

// ─── Snowflake particle system (Winter biome) ─────────────────────────────

function SnowflakeSystem() {
  const COUNT = 60
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 38,
      y: Math.random() * 10 + 1,
      z: -30 - Math.random() * 30,
      speed: 0.3 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
    }))
  , [])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    data.forEach((p, i) => {
      p.y -= p.speed * dt
      p.x += p.drift * dt * 0.5
      if (p.y < 0.1) {
        p.y = 10
        p.x = (Math.random() - 0.5) * 38
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial color="#cceeff" transparent opacity={0.9} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── Sky sparkle particle system (Sky biome) ──────────────────────────────

function SkySparkles() {
  const COUNT = 80
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 38,
      y: Math.random() * 8 + 0.5,
      z: -120 - Math.random() * 30,
      phase: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 2,
      color: new THREE.Color(['#ff88cc', '#88ffcc', '#ffcc44', '#88ccff', '#cc88ff'][Math.floor(Math.random() * 5)]!),
    }))
  , [])
  const t = useRef(0)

  useFrame((_, dt) => {
    if (!meshRef.current) return
    t.current += dt
    data.forEach((d, i) => {
      const s = Math.abs(Math.sin(t.current * d.speed + d.phase))
      const sc = s * 0.5 + 0.1
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, d.color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <octahedronGeometry args={[0.12, 0]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  )
}

// ─── ЛУГА (Meadow) — Pollen drift ────────────────────────────────────────

function MeadowPollen() {
  const count = 40
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 24,
      y: 1 + Math.random() * 3,
      z: -3 - Math.random() * 22,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      freqX: 0.2 + Math.random() * 0.3,
      freqY: 0.15 + Math.random() * 0.25,
      freqZ: 0.1 + Math.random() * 0.2,
      ampX: 0.8 + Math.random() * 1.2,
      ampY: 0.3 + Math.random() * 0.5,
      ampZ: 0.5 + Math.random() * 0.8,
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.x = d.x + Math.sin(t.current * d.freqX + d.phaseX) * d.ampX
      m.position.y = d.y + Math.sin(t.current * d.freqY + d.phaseY) * d.ampY
      m.position.z = d.z + Math.sin(t.current * d.freqZ + d.phaseZ) * d.ampZ
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#ffe033" transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

// ─── ЗИМА (Winter) — Snowfall ─────────────────────────────────────────────

function WinterSnow() {
  const COUNT = 120
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: Math.random() * 11,
      z: -32 - Math.random() * 25,
      speed: 0.8 + Math.random() * 1.4,
      driftX: (Math.random() - 0.5) * 0.6,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.4 + Math.random() * 0.6,
    }))
  , [])
  const t = useRef(0)

  useFrame((_, dt) => {
    if (!meshRef.current) return
    t.current += dt
    data.forEach((d, i) => {
      d.y -= d.speed * dt
      d.x += d.driftX * dt + Math.sin(t.current * d.driftFreq + d.driftPhase) * 0.008
      if (d.y < -1) {
        d.y = 10
        d.x = (Math.random() - 0.5) * 30
      }
      dummy.position.set(d.x, d.y, d.z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── ВУЛКАН (Volcano) — Rising embers ────────────────────────────────────

const EMBER_COLORS = ['#ff4400', '#ff8800', '#ffcc00'] as const

function VolcanoEmbers() {
  const COUNT = 60
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 28,
      y: 1 + Math.random() * 9,
      z: -63 - Math.random() * 22,
      speed: 3 + Math.random() * 3,
      scale: 0.04 + Math.random() * 0.03,
      color: new THREE.Color(EMBER_COLORS[Math.floor(Math.random() * 3)]!),
      driftX: (Math.random() - 0.5) * 1.2,
    }))
  , [])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    data.forEach((d, i) => {
      d.y += d.speed * dt
      d.x += d.driftX * dt * 0.3
      if (d.y > 10) {
        d.y = 1
        d.x = (Math.random() - 0.5) * 28
      }
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(d.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, d.color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial vertexColors transparent opacity={0.9} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── НЕБО (Sky) — Cloud wisps ─────────────────────────────────────────────

function SkyCloudWisps() {
  const count = 8
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: 4 + Math.random() * 5,
      z: -125 - Math.random() * 25,
      speed: (Math.random() < 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))

  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.x += d.speed * dt
      if (m.position.x > 20) m.position.x = -20
      if (m.position.x < -20) m.position.x = 20
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh
          key={i}
          ref={el => { refs.current[i] = el }}
          position={[d.x, d.y, d.z]}
          scale={[5, 1, 2]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
        </mesh>
      ))}
    </>
  )
}

// ─── ЛУГА (Forest/Meadow) — Forest Spores rising ─────────────────────────

function ForestSpores() {
  const count = 30
  const { camera } = useThree()
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      ox: (Math.random() - 0.5) * 28,
      y: Math.random() * 6 + 0.5,
      z: -3 - Math.random() * 26,
      speed: 0.4 + Math.random() * 0.6,
      driftX: (Math.random() - 0.5) * 0.3,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.3 + Math.random() * 0.4,
      color: Math.random() > 0.5 ? '#88ff44' : '#ccff66',
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.y += d.speed * dt
      m.position.x = camera.position.x + d.ox + Math.sin(t.current * d.driftFreq + d.driftPhase) * 0.6
      if (m.position.y > 7) {
        m.position.y = 0.5
        d.ox = (Math.random() - 0.5) * 28
      }
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.ox, d.y, d.z]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  )
}

// ─── ЗИМА (Snow/Ice) — Snow Drift falling spheres ─────────────────────────

function SnowDrift() {
  const count = 50
  const { camera } = useThree()
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      ox: (Math.random() - 0.5) * 34,
      y: Math.random() * 9 + 1,
      z: -31 - Math.random() * 28,
      speed: 0.5 + Math.random() * 0.8,
      driftX: (Math.random() - 0.5) * 0.5,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.2 + Math.random() * 0.3,
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.y -= d.speed * dt
      m.position.x = camera.position.x + d.ox + Math.sin(t.current * d.driftFreq + d.driftPhase) * 1.2
      if (m.position.y < -1) {
        m.position.y = 9
        d.ox = (Math.random() - 0.5) * 34
      }
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.ox, d.y, d.z]}>
          <sphereGeometry args={[0.055, 4, 4]} />
          <meshBasicMaterial color="#ddf4ff" transparent opacity={0.88} />
        </mesh>
      ))}
    </>
  )
}

// ─── КРИСТАЛЛЫ (Crystal) — Crystal Sparkle motes ─────────────────────────

function CrystalSparkle() {
  const count = 40
  const { camera } = useThree()
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      ox: (Math.random() - 0.5) * 32,
      y: 0.5 + Math.random() * 7,
      z: -91 - Math.random() * 28,
      speed: 0.6 + Math.random() * 0.9,
      driftX: (Math.random() - 0.5) * 0.4,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.5 + Math.random() * 0.8,
      scalePhase: Math.random() * Math.PI * 2,
      scaleFreq: 1.0 + Math.random() * 2.0,
      color: ['#cc44ff', '#4488ff', '#ff44cc', '#44ffcc'][Math.floor(Math.random() * 4)]!,
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.y += d.speed * dt
      m.position.x = camera.position.x + d.ox + Math.sin(t.current * d.driftFreq + d.driftPhase) * 0.8
      const s = 0.5 + Math.abs(Math.sin(t.current * d.scaleFreq + d.scalePhase)) * 0.5
      m.scale.setScalar(s)
      ;(m.material as THREE.MeshBasicMaterial).opacity = s * 0.85
      if (m.position.y > 8) {
        m.position.y = 0.5
        d.ox = (Math.random() - 0.5) * 32
      }
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.ox, d.y, d.z]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}

// ─── НЕБО (Sky) — Candy Sparkle twinkling stars ───────────────────────────

function CandySparkle() {
  const count = 20
  const { camera } = useThree()
  const data = useMemo(() =>
    Array.from({ length: count }, () => ({
      ox: (Math.random() - 0.5) * 34,
      y: 1 + Math.random() * 7,
      z: -121 - Math.random() * 28,
      scalePhase: Math.random() * Math.PI * 2,
      scaleFreq: 1.5 + Math.random() * 2.5,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.3 + Math.random() * 0.4,
      color: ['#ff88cc', '#ffcc44', '#88ffcc', '#ff44aa', '#44ccff', '#ffaa44'][Math.floor(Math.random() * 6)]!,
    }))
  , [])
  const refs = useRef<(THREE.Mesh | null)[]>(Array(count).fill(null))
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      const s = 0.3 + Math.abs(Math.sin(t.current * d.scaleFreq + d.scalePhase)) * 0.7
      m.scale.setScalar(s)
      ;(m.material as THREE.MeshBasicMaterial).opacity = s * 0.9
      m.position.x = camera.position.x + d.ox + Math.sin(t.current * d.driftFreq + d.driftPhase) * 1.5
      m.rotation.y = t.current * 1.2
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.ox, d.y, d.z]}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.9} />
        </mesh>
      ))}
    </>
  )
}

// ─── Global floating sparkles across entire map ───────────────────────────

function GlobalSparkles() {
  const COUNT = 100
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 38,
      y: Math.random() * 9 + 0.5,
      z: -Math.random() * 150,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
    }))
  , [])
  const t = useRef(0)

  useFrame((_, dt) => {
    if (!meshRef.current) return
    t.current += dt
    data.forEach((d, i) => {
      const s = Math.sin(t.current * d.speed + d.phase) * 0.5 + 0.5
      // Encode opacity via scale (s > 0.05 → visible, else scale=0)
      const sc = s > 0.05 ? s * 0.7 : 0
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.045, 4, 4]} />
      <meshBasicMaterial color="#ffffaa" toneMapped={false} />
    </instancedMesh>
  )
}

// ─── Biome boundary arch ──────────────────────────────────────────────────

function BiomeArch({ z, color, label }: { z: number; color: string; label: string }) {
  return (
    <group position={[0, 0, z]}>
      {/* Left pillar */}
      <RigidBody type="fixed" colliders="cuboid" position={[-12, 3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      </RigidBody>
      {/* Right pillar */}
      <RigidBody type="fixed" colliders="cuboid" position={[12, 3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 6, 1.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      </RigidBody>
      {/* Top beam */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 6.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[25, 1.0, 1.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      </RigidBody>
    </group>
  )
}

// ─── Biome 3: Volcano boulders ────────────────────────────────────────────

function Boulder({ pos, sz }: { pos: [number, number, number]; sz: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={sz} />
        <meshStandardMaterial color="#3a2a28" roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

// ─── Sky Cloud Architecture ───────────────────────────────────────────────

const CLOUD_PLATFORMS = [
  { cx: -18, cy: 6,  cz: -126 },
  { cx:  17, cy: 8,  cz: -131 },
  { cx: -16, cy: 10, cz: -138 },
  { cx:  15, cy: 7,  cz: -143 },
  { cx:   0, cy: 12, cz: -134 },
  { cx:  -8, cy: 9,  cz: -148 },
] as const

const CLOUD_TOWERS = [
  { x: -22, z: -125 },
  { x:  22, z: -125 },
  { x: -22, z: -145 },
  { x:  22, z: -145 },
] as const

// Pre-built instance data for SkyCloudArchitecture
const PLATFORM_OFFSETS = [
  { pos: [0, 0, 0] as const,      r: 2.5 },
  { pos: [1.8, -0.5, 0] as const, r: 2.0 },
  { pos: [-1.8, -0.5, 0] as const, r: 2.0 },
  { pos: [0, -0.3, 1.5] as const, r: 2.0 },
  { pos: [0, -0.3, -1.5] as const, r: 2.0 },
] as const

const TOWER_LEVELS = [
  { dy: 2,  r: 2.0 },
  { dy: 5,  r: 1.8 },
  { dy: 8,  r: 1.5 },
  { dy: 11, r: 1.2 },
] as const

function SkyCloudArchitecture() {
  const PLATFORM_COUNT = CLOUD_PLATFORMS.length * PLATFORM_OFFSETS.length  // 6 × 5 = 30
  const TOWER_COUNT    = CLOUD_TOWERS.length    * TOWER_LEVELS.length       // 4 × 4 = 16

  const platformRef = useRef<THREE.InstancedMesh>(null!)
  const towerRef    = useRef<THREE.InstancedMesh>(null!)

  // Set instance matrices once on mount — these are static meshes
  const platformMatrices = useMemo(() => {
    const d = new THREE.Object3D()
    const mats: THREE.Matrix4[] = []
    CLOUD_PLATFORMS.forEach(({ cx, cy, cz }) => {
      PLATFORM_OFFSETS.forEach(({ pos, r }) => {
        d.position.set(cx + pos[0], cy + pos[1], cz + pos[2])
        d.scale.setScalar(r)
        d.updateMatrix()
        mats.push(d.matrix.clone())
      })
    })
    return mats
  }, [])

  const towerMatrices = useMemo(() => {
    const d = new THREE.Object3D()
    const mats: THREE.Matrix4[] = []
    CLOUD_TOWERS.forEach(({ x, z }) => {
      TOWER_LEVELS.forEach(({ dy, r }) => {
        d.position.set(x, dy, z)
        d.scale.setScalar(r)
        d.updateMatrix()
        mats.push(d.matrix.clone())
      })
    })
    return mats
  }, [])

  // Apply matrices once after mount
  useFrame(() => {
    if (platformRef.current && !platformRef.current.userData.init) {
      platformMatrices.forEach((m, i) => platformRef.current.setMatrixAt(i, m))
      platformRef.current.instanceMatrix.needsUpdate = true
      platformRef.current.userData.init = true
    }
    if (towerRef.current && !towerRef.current.userData.init) {
      towerMatrices.forEach((m, i) => towerRef.current.setMatrixAt(i, m))
      towerRef.current.instanceMatrix.needsUpdate = true
      towerRef.current.userData.init = true
    }
  })

  return (
    <group>
      {/* Platform point lights — kept individual (only 6) */}
      {CLOUD_PLATFORMS.map(({ cx, cy, cz }, i) => (
        <pointLight
          key={i}
          position={[cx, cy - 1, cz] as [number, number, number]}
          color="#ffccee"
          intensity={1.2}
          distance={12}
        />
      ))}

      {/* Fluffy cloud platforms — 30 spheres, one InstancedMesh */}
      <instancedMesh ref={platformRef} args={[undefined, undefined, PLATFORM_COUNT]} frustumCulled={false} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#eeeeff" emissiveIntensity={0.4} roughness={0.1} />
      </instancedMesh>

      {/* Corner cloud towers — 16 spheres, one InstancedMesh */}
      <instancedMesh ref={towerRef} args={[undefined, undefined, TOWER_COUNT]} frustumCulled={false} castShadow>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#f0f8ff" emissive="#ddeeff" emissiveIntensity={0.3} roughness={0.1} />
      </instancedMesh>
    </group>
  )
}

// ─── Main world component ──────────────────────────────────────────────────

export default function PetSimWorld() {
  return (
    <>
      {/* Sky */}
      <GradientSky top="#1a2a60" bottom="#4060c0" />

      {/* Ambient + sun */}
      <ambientLight intensity={0.55} color="#c8d8ff" />
      <directionalLight castShadow position={[20, 40, 10]} intensity={1.1} color="#fff8e0" />

      {/* ── Biome 1: ЛУГА (z: 0 → -30) ─────────────────────────────────── */}
      <BiomeFloor color="#5dcf2a" z0={0} z1={-30} />
      <BiomeArch z={-0.5} color="#ffd43b" label="ЛУГА" />
      <pointLight color="#aaff44" intensity={0.8} distance={30} position={[-10, 5, -15]} />
      <pointLight color="#ffee88" intensity={0.6} distance={20} position={[10, 4, -10]} />

      {/* Луга decorations */}
      <Tree pos={[-15, 0, -5]} variant={0} rotY={0.3} />
      <Tree pos={[15, 0, -8]} variant={1} rotY={1.2} />
      <Tree pos={[-17, 0, -18]} variant={2} rotY={2.0} />
      <Tree pos={[16, 0, -22]} variant={3} rotY={0.7} />
      <TreeRound pos={[-14, 0, -25]} scale={1.1} />
      <TreeRound pos={[14, 0, -14]} scale={0.9} />
      <Bush pos={[-8, 0, -6]} variant={1} scale={1.2} />
      <Bush pos={[8, 0, -12]} variant={0} scale={1.0} />
      <Bush pos={[-6, 0, -20]} variant={1} scale={1.3} />
      <Flowers pos={[-4, 0, -4]} scale={1.1} />
      <Flowers pos={[5, 0, -9]} scale={1.0} />
      <Flowers pos={[-7, 0, -16]} scale={1.2} />
      <Flowers pos={[9, 0, -24]} scale={0.9} />
      <FlowerPot pos={[-3, 0, -7]} scale={1.0} />
      <FlowerPot pos={[4, 0, -19]} scale={1.1} />
      <Flag pos={[-13, 0, -13]} scale={1.2} rotY={0} />
      <Flag pos={[13, 0, -13]} scale={1.2} rotY={Math.PI} />

      {/* Луга palm trees */}
      <PalmTree pos={[-10, 0, -3]} scale={1.1} rotY={0.4} />
      <PalmTree pos={[11, 0, -11]} scale={1.0} rotY={2.1} />
      <PalmTree pos={[-12, 0, -21]} scale={1.2} rotY={1.0} />
      <PalmTree pos={[10, 0, -27]} scale={0.9} rotY={3.2} />

      {/* Луга breakable blocks */}
      <BreakableBlock pos={[-9, 0.75, -5]} color="#4caf50" emissive="#4caf50" emissiveInt={0.2} />
      <BreakableBlock pos={[9, 0.75, -10]} color="#66bb6a" emissive="#66bb6a" emissiveInt={0.2} />
      <BreakableBlock pos={[-6, 0.75, -15]} color="#81c784" emissive="#81c784" emissiveInt={0.15} />
      <BreakableBlock pos={[7, 0.75, -20]} color="#4caf50" emissive="#4caf50" emissiveInt={0.2} />
      <BreakableBlock pos={[0, 0.75, -26]} color="#66bb6a" emissive="#66bb6a" emissiveInt={0.25} />

      {/* Extra coins in луга */}
      <Coin pos={[-12, 1, -8]} />
      <Coin pos={[11, 1, -17]} />
      <Coin pos={[0, 1, -12]} />

      {/* Meadow pollen drift */}
      <MeadowPollen />
      {/* Forest spores rising */}
      <ForestSpores />

      {/* Bunny pet */}
      <GltfMonster which="bunny" pos={[-11, 0, -18]} scale={1.2} animation="Yes" />

      {/* NPC trainer at start */}
      <NPC pos={[0, 0, 5]} label="ТРЕНЕР" bodyColor="#ffd644" />

      {/* ── Biome 2: ЗИМА (z: -30 → -60) ───────────────────────────────── */}
      <BiomeFloor color="#ddeeff" z0={-30} z1={-60} roughness={0.3} metalness={0.15}
        emissive="#aaccff" emissiveIntensity={0.08} />
      <BiomeArch z={-30} color="#88ccff" label="ЗИМА" />
      <pointLight color="#aaddff" intensity={1.0} distance={35} position={[0, 8, -45]} />
      <pointLight color="#cceeff" intensity={0.7} distance={20} position={[-12, 5, -35]} />
      <pointLight color="#aabbff" intensity={0.6} distance={20} position={[12, 5, -55]} />

      {/* Snow piles */}
      <RigidBody type="fixed" colliders="cuboid" position={[-14, 0.8, -33]}>
        <mesh castShadow><boxGeometry args={[3, 1.6, 2.5]} /><meshStandardMaterial color="#eef4ff" roughness={0.95} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[13, 1.0, -40]}>
        <mesh castShadow><boxGeometry args={[4, 2, 3]} /><meshStandardMaterial color="#ddeeff" roughness={0.9} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-10, 0.6, -50]}>
        <mesh castShadow><boxGeometry args={[2.5, 1.2, 2]} /><meshStandardMaterial color="#e8f4ff" roughness={0.9} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[11, 0.7, -57]}>
        <mesh castShadow><boxGeometry args={[3.5, 1.4, 2.5]} /><meshStandardMaterial color="#eef4ff" roughness={0.95} /></mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-16, 1.2, -44]}>
        <mesh castShadow><boxGeometry args={[2, 2.4, 2]} /><meshStandardMaterial color="#d8eeff" roughness={0.85} /></mesh>
      </RigidBody>

      {/* Зима breakable blocks */}
      <BreakableBlock pos={[-8, 0.75, -34]} color="#88ccff" emissive="#88ccff" emissiveInt={0.3} metalness={0.2} />
      <BreakableBlock pos={[8, 0.75, -40]} color="#aaddff" emissive="#aaddff" emissiveInt={0.3} metalness={0.2} />
      <BreakableBlock pos={[-5, 0.75, -46]} color="#bbddff" emissive="#bbddff" emissiveInt={0.25} metalness={0.2} />
      <BreakableBlock pos={[6, 0.75, -52]} color="#88ccff" emissive="#88ccff" emissiveInt={0.3} metalness={0.25} />
      <BreakableBlock pos={[0, 0.75, -57]} color="#aaddff" emissive="#aaddff" emissiveInt={0.35} metalness={0.3} />

      {/* Extra coins in winter */}
      <Coin pos={[-13, 1, -38]} />
      <Coin pos={[12, 1, -49]} />

      {/* Snowflakes */}
      <SnowflakeSystem />
      {/* Winter snowfall spheres */}
      <WinterSnow />
      {/* Snow drift — horizontal drift particles */}
      <SnowDrift />

      {/* Snowflake props — winter/ice biome zone */}
      <Snowflake pos={[-15, 2, -35]} scale={1.5} />
      <Snowflake pos={[12, 3, -40]} scale={2.0} />
      <Snowflake pos={[-8, 1.5, -45]} scale={1.2} />
      <Snowflake pos={[18, 4, -50]} scale={1.8} />
      <Snowflake pos={[-16, 2, -55]} scale={1.4} />
      <Snowflake pos={[5, 2.5, -58]} scale={1.6} />
      <Snowflake pos={[-3, 3, -42]} scale={2.2} />
      <Snowflake pos={[14, 1.5, -48]} scale={1.3} />

      {/* Зима ice blocks */}
      <IceBlock pos={[-13, 0, -32]} scale={1.3} rotY={0.2} />
      <IceBlock pos={[10, 0, -38]} scale={1.5} rotY={1.5} />
      <IceBlock pos={[-11, 0, -43]} scale={1.1} rotY={0.8} />
      <IceBlock pos={[14, 0, -50]} scale={1.4} rotY={2.3} />
      <IceBlock pos={[-8, 0, -56]} scale={1.2} rotY={3.0} />
      <IceBlock pos={[5, 0, -59]} scale={1.0} rotY={1.1} />

      {/* Cactoro in winter */}
      <GltfMonster which="cactoro" pos={[10, 0, -43]} scale={1.1} animation="Idle" />

      {/* ── Biome 3: ВУЛКАН (z: -60 → -90) ─────────────────────────────── */}
      <LavaFloor />
      {/* Dark rock border strips */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -72]}>
        <mesh receiveShadow>
          <boxGeometry args={[40, 0.5, 6]} />
          <meshStandardMaterial color="#1a0a08" roughness={0.98} />
        </mesh>
      </RigidBody>
      <BiomeArch z={-60} color="#ff4400" label="ВУЛКАН" />
      <pointLight color="#ff3300" intensity={2.5} distance={25} position={[-8, 4, -68]} />
      <pointLight color="#ff6600" intensity={2.0} distance={25} position={[8, 4, -78]} />
      <pointLight color="#ff2200" intensity={1.8} distance={20} position={[0, 6, -85]} />

      {/* Boulders */}
      <Boulder pos={[-14, 1.5, -64]} sz={[3, 3, 2.5]} />
      <Boulder pos={[13, 2.0, -72]} sz={[4, 4, 3]} />
      <Boulder pos={[-12, 1.0, -80]} sz={[2.5, 2, 2]} />
      <Boulder pos={[15, 1.5, -87]} sz={[3.5, 3, 3]} />
      <Boulder pos={[-15, 2.5, -85]} sz={[3, 5, 3]} />
      <Boulder pos={[0, 1.0, -68]} sz={[2, 2, 2]} />

      {/* Volcano lava rocks */}
      <LavaRock pos={[-11, 0, -63]} scale={1.2} rotY={0.5} />
      <LavaRock pos={[10, 0, -69]} scale={1.4} rotY={2.0} />
      <LavaRock pos={[-13, 0, -76]} scale={1.1} rotY={1.3} />
      <LavaRock pos={[11, 0, -82]} scale={1.3} rotY={0.9} />
      <LavaRock pos={[-7, 0, -86]} scale={1.5} rotY={3.1} />
      <LavaRock pos={[6, 0, -73]} scale={1.0} rotY={1.7} />

      {/* Volcano breakable blocks */}
      <BreakableBlock pos={[-9, 0.75, -63]} color="#cc2200" emissive="#ff3300" emissiveInt={0.5} metalness={0.3} />
      <BreakableBlock pos={[9, 0.75, -70]} color="#dd3300" emissive="#ff4400" emissiveInt={0.5} metalness={0.3} />
      <BreakableBlock pos={[-7, 0.75, -76]} color="#cc2200" emissive="#ff3300" emissiveInt={0.6} metalness={0.35} />
      <BreakableBlock pos={[8, 0.75, -82]} color="#dd3300" emissive="#ff5500" emissiveInt={0.5} metalness={0.3} />
      <BreakableBlock pos={[0, 0.75, -87]} color="#ff4400" emissive="#ff6600" emissiveInt={0.7} metalness={0.4} />

      <Coin pos={[-11, 1, -73]} />
      <Coin pos={[11, 1, -81]} />

      {/* Rising embers */}
      <VolcanoEmbers />

      {/* BlueDemon in volcano */}
      <GltfMonster which="blueDemon" pos={[0, 0, -74]} scale={1.4} animation="Wave" />

      {/* ── Biome 4: КРИСТАЛЛЫ (z: -90 → -120) ─────────────────────────── */}
      <BiomeFloor color="#1a0a2e" z0={-90} z1={-120} roughness={0.2} metalness={0.6}
        emissive="#220044" emissiveIntensity={0.3} />
      <BiomeArch z={-90} color="#aa44ff" label="КРИСТАЛЛЫ" />
      <pointLight color="#8800ff" intensity={3.5} distance={35} position={[-10, 6, -100]} />
      <pointLight color="#00ccff" intensity={3.0} distance={35} position={[10, 5, -112]} />

      {/* Crystal formations */}
      <Crystal pos={[-14, 0, -93]} scale={2.0} rotY={0.5} />
      <Crystal pos={[13, 0, -96]} scale={2.5} rotY={1.8} />
      <Crystal pos={[-11, 0, -103]} scale={1.8} rotY={0.9} />
      <Crystal pos={[12, 0, -108]} scale={2.2} rotY={2.3} />
      <Crystal pos={[-13, 0, -114]} scale={1.6} rotY={1.1} />
      <Crystal pos={[15, 0, -118]} scale={2.0} rotY={3.0} />
      <Crystal pos={[0, 0, -95]} scale={3.0} rotY={0.0} />
      <Crystal pos={[-7, 0, -112]} scale={1.4} rotY={2.7} />

      {/* Crystal clusters — extra density */}
      <CrystalCluster pos={[-16, 0, -92]} scale={1.8} rotY={0.3} />
      <CrystalCluster pos={[11, 0, -98]} scale={2.0} rotY={1.4} />
      <CrystalCluster pos={[-9, 0, -104]} scale={1.5} rotY={2.7} />
      <CrystalCluster pos={[16, 0, -109]} scale={1.7} rotY={0.8} />
      <CrystalCluster pos={[-14, 0, -116]} scale={2.2} rotY={1.9} />
      <CrystalCluster pos={[7, 0, -119]} scale={1.6} rotY={3.3} />
      <CrystalCluster pos={[0, 0, -101]} scale={1.3} rotY={0.6} />
      <CrystalCluster pos={[-5, 0, -111]} scale={1.9} rotY={2.2} />

      {/* Glowing mushrooms */}
      <MushroomGlow pos={[-10, 0, -97]} scale={1.5} />
      <MushroomGlow pos={[9, 0, -102]} scale={1.8} />
      <MushroomGlow pos={[-8, 0, -108]} scale={1.3} />
      <MushroomGlow pos={[11, 0, -116]} scale={1.6} />
      <MushroomGlow pos={[0, 0, -119]} scale={2.0} />

      {/* Crystal breakable blocks */}
      <BreakableBlock pos={[-9, 0.75, -93]} color="#6600cc" emissive="#9900ff" emissiveInt={0.6} metalness={0.7} />
      <BreakableBlock pos={[9, 0.75, -100]} color="#4400aa" emissive="#7700ee" emissiveInt={0.7} metalness={0.7} />
      <BreakableBlock pos={[-8, 0.75, -107]} color="#0044cc" emissive="#0088ff" emissiveInt={0.6} metalness={0.6} />
      <BreakableBlock pos={[8, 0.75, -113]} color="#6600cc" emissive="#9900ff" emissiveInt={0.7} metalness={0.75} />
      <BreakableBlock pos={[0, 0.75, -118]} color="#cc00ff" emissive="#ff44ff" emissiveInt={0.8} metalness={0.8} />

      <Coin pos={[-12, 1, -105]} />
      <Coin pos={[12, 1, -115]} />
      <Coin pos={[0, 1, -99]} />

      {/* Crystal sparkle motes */}
      <CrystalSparkle />

      {/* Alien in crystal zone */}
      <GltfMonster which="alien" pos={[-10, 0, -110]} scale={1.2} animation="Idle" />

      {/* ── Biome 5: НЕБО (z: -120 → -150) ─────────────────────────────── */}
      <BiomeFloor color="#f0f8ff" z0={-120} z1={-150} roughness={0.05} metalness={0.1}
        emissive="#ffffff" emissiveIntensity={0.15} />
      <BiomeArch z={-120} color="#ffaacc" label="НЕБО" />
      <pointLight color="#ffaaee" intensity={3.0} distance={40} position={[-10, 7, -130]} />
      <pointLight color="#aaffee" intensity={2.5} distance={40} position={[10, 6, -142]} />

      {/* Cloud-like pillars */}
      <RigidBody type="fixed" colliders="cuboid" position={[-15, 2, -125]}>
        <mesh castShadow>
          <sphereGeometry args={[2.5, 12, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#eeeeff" emissiveIntensity={0.3} roughness={0.1} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[14, 3, -132]}>
        <mesh castShadow>
          <sphereGeometry args={[3, 12, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffeeff" emissiveIntensity={0.3} roughness={0.1} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[-13, 2.5, -142]}>
        <mesh castShadow>
          <sphereGeometry args={[2.8, 12, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#eeffee" emissiveIntensity={0.3} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Rich cloud platforms and corner towers */}
      <SkyCloudArchitecture />

      {/* Flower pots and lanterns */}
      <FlowerPot pos={[-7, 0, -123]} scale={1.3} />
      <FlowerPot pos={[7, 0, -128]} scale={1.4} />
      <FlowerPot pos={[-6, 0, -136]} scale={1.2} />
      <FlowerPot pos={[8, 0, -143]} scale={1.3} />
      <FlowerPot pos={[0, 0, -138]} scale={1.5} />
      <Lantern pos={[-11, 0, -126]} scale={1.2} />
      <Lantern pos={[11, 0, -133]} scale={1.1} />
      <Lantern pos={[-9, 0, -140]} scale={1.3} />
      <Lantern pos={[10, 0, -147]} scale={1.2} />
      <Lantern pos={[0, 0, -124]} scale={1.0} />

      {/* Rainbow arches */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[0, 4 + i * 0.5, -130 - i * 4]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[8 + i, 0.25, 8, 40, Math.PI]} />
          <meshBasicMaterial
            color={['#ff4444', '#ff9900', '#ffee00', '#44ff44', '#4488ff'][i]!}
            transparent opacity={0.7}
          />
        </mesh>
      ))}

      {/* Sky breakable blocks */}
      <BreakableBlock pos={[-9, 0.75, -123]} color="#ffbbee" emissive="#ffaacc" emissiveInt={0.5} metalness={0.1} />
      <BreakableBlock pos={[9, 0.75, -129]} color="#aaffee" emissive="#88ffdd" emissiveInt={0.5} metalness={0.1} />
      <BreakableBlock pos={[-7, 0.75, -136]} color="#ffeeaa" emissive="#ffdd88" emissiveInt={0.5} metalness={0.1} />
      <BreakableBlock pos={[8, 0.75, -143]} color="#bbaaff" emissive="#aa88ff" emissiveInt={0.6} metalness={0.1} />
      <BreakableBlock pos={[0, 0.75, -147]} color="#ffccff" emissive="#ff88ff" emissiveInt={0.7} metalness={0.2} />

      <Coin pos={[-12, 1, -130]} />
      <Coin pos={[12, 1, -138]} />
      <Coin pos={[0, 1, -126]} />
      <Coin pos={[-5, 1, -145]} />

      {/* Sky sparkle system */}
      <SkySparkles />
      {/* Cloud wisps drifting overhead */}
      <SkyCloudWisps />
      {/* Candy sparkle twinkling stars */}
      <CandySparkle />

      {/* Boss birb at the end */}
      <GltfMonster which="birb" pos={[0, 0, -144]} scale={2.0} animation="Wave" />

      {/* ── Global particles ─────────────────────────────────────────────── */}
      <GlobalSparkles />

      {/* ── GOAL trigger ─────────────────────────────────────────────────── */}
      <GoalTrigger
        pos={[0, 2, -148]}
        size={[40, 8, 4]}
        result={{
          kind: 'win',
          label: 'ПИТОМЦЫ СОБРАНЫ!',
          subline: 'Ты прошёл все биомы!',
        }}
      />
    </>
  )
}
