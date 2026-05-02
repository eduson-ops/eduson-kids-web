import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getShadowMapSize, detectDeviceTier } from '../../lib/deviceTier'

const SHADOW_MAP_SIZE = getShadowMapSize()
const _isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import NPC from '../NPC'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import {
  Tree, Bush, Flowers, GrassTuft, Building,
  ParkedCar, Rock, Lantern, Well, Bench, Sign,
  TreePine, TreeRound, Portal, GenCampfire, MushroomGlow,
  Trophy,
  PalmTree, CrystalCluster, LavaRock, IceBlock, BossGolem,
} from '../Scenery'

export const SANDBOX_SPAWN: [number, number, number] = [0, 3, 6]

// ─── Ocean shader (expanded ocean surface beyond beach) ──────────────

const OCEAN_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const OCEAN_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float wave1 = sin(vUv.x * 8.0 + iTime * 1.5) * 0.06;
    float wave2 = sin(vUv.y * 6.0 + iTime * 1.2) * 0.04;
    float foam = step(0.97, sin(vUv.x * 20.0 + iTime * 2.0) * 0.5 + 0.5);
    vec3 deepWater = vec3(0.05, 0.2, 0.55);
    vec3 shallowWater = vec3(0.1, 0.5, 0.7);
    vec3 foamColor = vec3(0.85, 0.92, 1.0);
    float depth = clamp(vUv.y + wave1 + wave2, 0.0, 1.0);
    vec3 col = mix(deepWater, shallowWater, depth);
    col = mix(col, foamColor, foam * 0.4);
    gl_FragColor = vec4(col, 0.92);
  }
`

// ─── Wave shader (Beach coastline) ──────────────────────────────────

const WAVE_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const WAVE_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.2, 0.6, 0.9, sin(vUv.x * 20.0 + iTime * 3.0) * 0.3 + 0.4);
  }
`

// ─── Shaders ────────────────────────────────────────────────────────

const GRID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const GRID_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    vec2 grid50 = fract(vUv * 100.0);
    float thin = step(0.97, grid50.x) + step(0.97, grid50.y);
    thin = clamp(thin, 0.0, 1.0);

    vec2 grid10 = fract(vUv * 20.0);
    float thick = step(0.95, grid10.x) + step(0.95, grid10.y);
    thick = clamp(thick, 0.0, 1.0);

    // glowing intersections
    vec2 inter = fract(vUv * 20.0);
    float dot = (1.0 - smoothstep(0.0, 0.08, length(inter - 0.0))) +
                (1.0 - smoothstep(0.0, 0.08, length(inter - vec2(1.0, 0.0)))) +
                (1.0 - smoothstep(0.0, 0.08, length(inter - vec2(0.0, 1.0)))) +
                (1.0 - smoothstep(0.0, 0.08, length(inter - vec2(1.0, 1.0))));
    dot = clamp(dot, 0.0, 1.0);
    float pulse = 0.5 + 0.5 * sin(iTime * 2.0);
    float alpha = thin * 0.06 + thick * 0.13 + dot * 0.28 * pulse;
    gl_FragColor = vec4(0.4, 0.8, 1.0, alpha);
  }
`

const WATER_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const WATER_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float wave = sin(r * 8.0 - iTime * 3.0) * 0.5 + 0.5;
    float swirl = sin(atan(uv.y, uv.x) * 4.0 + iTime * 2.0) * 0.3 + 0.7;
    vec3 col = mix(vec3(0.0, 0.6, 1.0), vec3(0.4, 1.0, 1.0), wave * swirl);
    gl_FragColor = vec4(col, 0.85);
  }
`

// ─── Animated sun ────────────────────────────────────────────────────
function AnimatedSun() {
  const lightRef = useRef<THREE.PointLight>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime() * 0.08
    const x = Math.cos(t) * 120
    const z = Math.sin(t) * 120
    const y = 80 + Math.sin(t * 0.5) * 20
    if (lightRef.current) lightRef.current.position.set(x, y, z)
    if (meshRef.current) meshRef.current.position.set(x, y, z)
  })
  return (
    <>
      <pointLight ref={lightRef} intensity={2.5} color="#fff7cc" distance={350} castShadow />
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 12, 12]} />
        <meshBasicMaterial color="#ffe866" />
      </mesh>
    </>
  )
}

// ─── Stars ────────────────────────────────────────────────────────
function Stars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    for (let i = 0; i < 600; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 350 + Math.random() * 50
      pts.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      )
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

// ─── Grid overlay ────────────────────────────────────────────────
function GridOverlay() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.getElapsedTime()
  })
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        uniforms={{ iTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Fountain water disc ────────────────────────────────────────
function FountainWater({ y }: { y: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.getElapsedTime()
  })
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.2, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        uniforms={{ iTime: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Central Fountain ────────────────────────────────────────────
function Fountain() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base pool */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.5, 0.4, 24]} />
          <meshStandardMaterial color="#b0c8e8" roughness={0.5} metalness={0.2} />
        </mesh>
      </RigidBody>
      {/* Tier 1 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[1.8, 2.0, 0.3, 24]} />
        <meshStandardMaterial color="#d4e8f8" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Tier 2 */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.3, 20]} />
        <meshStandardMaterial color="#d4e8f8" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Top sphere */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#88ccff" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Animated water surfaces */}
      <FountainWater y={0.42} />
      <FountainWater y={0.78} />
      {/* Water glow */}
      <pointLight position={[0, 1.5, 0]} color="#44bbff" intensity={1.2} distance={18} />
    </group>
  )
}

// ─── Park sparkles (NW) — InstancedMesh, was 40 individual meshes ───
const SPARKLE_COLORS = ['#ffdd44', '#44ffcc', '#ff88cc', '#88ff88', '#aaccff']
function ParkSparkles() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)
  const data = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    x: -80 + Math.random() * 80,
    z: -80 + Math.random() * 80,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    color: SPARKLE_COLORS[i % 5]!,
  })), [])
  const colorArray = useMemo(() => {
    const arr = new Float32Array(40 * 3)
    const col = new THREE.Color()
    data.forEach((d, i) => { col.set(d.color); arr[i*3]=col.r; arr[i*3+1]=col.g; arr[i*3+2]=col.b })
    return arr
  }, [data])
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    data.forEach((d, i) => {
      dummy.position.set(d.x, 1.5 + Math.sin(t * d.speed + d.phase) * 0.4, d.z)
      dummy.scale.setScalar(0.6 + Math.sin(t * d.speed * 1.3 + d.phase) * 0.4)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 40]} frustumCulled={false}>
      <sphereGeometry args={[0.07, 5, 5]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

// ─── Park Pollen (NW) — InstancedMesh, was 50 individual meshes ───
function ParkPollen() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)
  const data = useMemo(() => Array.from({ length: 50 }, () => ({
    x: -10 - Math.random() * 70,
    z: -10 - Math.random() * 70,
    baseY: 1 + Math.random() * 3,
    driftSpeed: 0.15 + Math.random() * 0.25,
    driftAmp: 1.5 + Math.random() * 2.0,
    bobSpeed: 0.4 + Math.random() * 0.6,
    bobAmp: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    driftPhase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.5 ? '#ffee88' : '#ffffff',
  })), [])
  const colorArray = useMemo(() => {
    const arr = new Float32Array(50 * 3)
    const col = new THREE.Color()
    data.forEach((d, i) => { col.set(d.color); arr[i*3]=col.r; arr[i*3+1]=col.g; arr[i*3+2]=col.b })
    return arr
  }, [data])
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    data.forEach((d, i) => {
      dummy.position.set(
        d.x + Math.sin(t * d.driftSpeed + d.driftPhase) * d.driftAmp,
        d.baseY + Math.sin(t * d.bobSpeed + d.phase) * d.bobAmp,
        d.z + Math.cos(t * d.driftSpeed * 0.7 + d.driftPhase) * d.driftAmp * 0.6,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 50]} frustumCulled={false}>
      <sphereGeometry args={[0.04, 5, 5]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

// ─── Ocean Plane (expanded water surface south of beach) ─────────
function OceanPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.getElapsedTime()
  })
  return (
    <mesh position={[55, -0.05, 130]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 60]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={OCEAN_VERT}
        fragmentShader={OCEAN_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Sunset Reflection shimmer on beach sand ─────────────────────
function SunsetReflection() {
  return (
    <mesh position={[55, 0.02, 65]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 50]} />
      <meshBasicMaterial color="#ff8844" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  )
}

// ─── Beach Wave Planes (SE coastline, z≈95-100) ───────────────────
function BeachWaves() {
  const mat1 = useRef<THREE.ShaderMaterial>(null!)
  const mat2 = useRef<THREE.ShaderMaterial>(null!)
  const mat3 = useRef<THREE.ShaderMaterial>(null!)
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (mat1.current) mat1.current.uniforms.iTime.value = t
    if (mat2.current) mat2.current.uniforms.iTime.value = t + 1.0
    if (mat3.current) mat3.current.uniforms.iTime.value = t + 2.0
  })
  const waveUniforms = () => ({ iTime: { value: 0 } })
  return (
    <group>
      {/* Three wave planes parallel to the southern coastline, z ~ 88-96 */}
      <mesh position={[50, 0.1, 88]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 1.5]} />
        <shaderMaterial
          ref={mat1}
          vertexShader={WAVE_VERT}
          fragmentShader={WAVE_FRAG}
          uniforms={waveUniforms()}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh position={[50, 0.1, 91]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 1.5]} />
        <shaderMaterial
          ref={mat2}
          vertexShader={WAVE_VERT}
          fragmentShader={WAVE_FRAG}
          uniforms={waveUniforms()}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh position={[50, 0.1, 94]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 1.5]} />
        <shaderMaterial
          ref={mat3}
          vertexShader={WAVE_VERT}
          fragmentShader={WAVE_FRAG}
          uniforms={waveUniforms()}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── Factory Grit overlay (SW quadrant) ──────────────────────────
function FactoryGrit() {
  // Factory zone: x ~ [-100, 0], z ~ [0, 100], center ~ [-50, y, 50]
  const metalPanels: Array<[number, number, number]> = [
    [-30,  0.01,  30],
    [-55,  0.01,  25],
    [-42,  0.01,  55],
    [-72,  0.01,  48],
    [-85,  0.01,  72],
    [-22,  0.01,  78],
  ]

  const warningBarriers: Array<{ pos: [number, number, number]; rotY: number }> = [
    { pos: [-20,  0.25,  18], rotY: 0 },
    { pos: [-60,  0.25,  18], rotY: 0 },
    { pos: [-90,  0.25,  50], rotY: Math.PI / 2 },
    { pos: [-15,  0.25,  65], rotY: Math.PI / 2 },
  ]

  const industrialLights: Array<[number, number, number]> = [
    [-25,  6,  30],
    [-55,  6,  55],
    [-72,  6,  78],
  ]

  return (
    <group>
      {/* Dark metal floor panels */}
      {metalPanels.map((pos, i) => (
        <mesh key={`panel-${i}`} position={pos}>
          <boxGeometry args={[4, 0.1, 4]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.6} />
        </mesh>
      ))}

      {/* Warning stripe barriers */}
      {warningBarriers.map(({ pos, rotY }, i) => (
        <mesh key={`barrier-${i}`} position={pos} rotation={[0, rotY, 0]}>
          <boxGeometry args={[8, 0.5, 0.5]} />
          <meshStandardMaterial
            color="#1a1a1a"
            emissive="#ff8800"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Industrial orange point lights */}
      {industrialLights.map((pos, i) => (
        <pointLight
          key={`ilight-${i}`}
          position={pos}
          color="#ff6600"
          intensity={4}
          distance={18}
        />
      ))}

      {/* Rust haze floor overlay */}
      <mesh position={[-50, 0.02, 50]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[25, 32]} />
        <meshStandardMaterial
          color="#3a1a0a"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* LavaRock perimeter accents — 4 corners of factory zone */}
      <LavaRock pos={[-18,  0,  18]} scale={1.5} rotY={0.3} />
      <LavaRock pos={[-88,  0,  20]} scale={1.6} rotY={1.2} />
      <LavaRock pos={[-15,  0,  88]} scale={1.4} rotY={2.0} />
      <LavaRock pos={[-90,  0,  85]} scale={1.7} rotY={0.7} />
    </group>
  )
}

// ─── Factory Smoke Stacks (SW quadrant) ───────────────────────────
function FactorySmoke() {
  // 3 stacks × 15 particles each
  const STACKS: Array<{ x: number; z: number }> = [
    { x: -30, z: 25 },
    { x: -60, z: 35 },
    { x: -80, z: 60 },
  ]
  const COUNT = 15
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const data = useMemo(() => STACKS.flatMap(({ x, z }) =>
    Array.from({ length: COUNT }).map((_, i) => ({
      baseX: x + (Math.random() - 0.5) * 1.5,
      baseZ: z + (Math.random() - 0.5) * 1.5,
      startY: 8 + (i / COUNT) * 10,
      speed: 0.8 + Math.random() * 0.6,
      wobble: (Math.random() - 0.5) * 0.4,
      radius: 0.2 + Math.random() * 0.2,
      phase: (i / COUNT) * Math.PI * 2,
    }))
  ), [])  // eslint-disable-line react-hooks/exhaustive-deps
  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    data.forEach((d, i) => {
      const m = refs.current[i]
      if (!m) return
      const elapsed = (t * d.speed + d.phase) % (Math.PI * 2)
      const frac = elapsed / (Math.PI * 2)
      m.position.y = 8 + frac * 10
      m.position.x = d.baseX + Math.sin(t * 0.5 + d.phase) * d.wobble
      m.position.z = d.baseZ + Math.cos(t * 0.4 + d.phase) * d.wobble
      // Fade opacity: denser at bottom, transparent at top
      const mat = m.material as THREE.MeshStandardMaterial
      mat.opacity = 0.2 * (1 - frac)
    })
  })
  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} position={[d.baseX, d.startY, d.baseZ]}>
          <sphereGeometry args={[d.radius, 7, 7]} />
          <meshStandardMaterial color="#555555" opacity={0.2} transparent />
        </mesh>
      ))}
    </>
  )
}

// ─── City Lights Glow (NE quadrant) ──────────────────────────────
function CityLights() {
  const COLORS = ['#ff8800', '#ffffff', '#44aaff']
  const lights = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    x: 15 + Math.random() * 70,
    y: 5 + Math.random() * 7,
    z: -15 - Math.random() * 65,
    color: COLORS[i % COLORS.length],
  })), [])  // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      {lights.map((l, i) => (
        <pointLight
          key={i}
          position={[l.x, l.y, l.z]}
          color={l.color}
          intensity={1.5}
          distance={8}
        />
      ))}
    </>
  )
}

// ─── Sun Rays (4 positions across the map) ────────────────────────
function SunRays() {
  const positions: Array<[number, number, number]> = [
    [-50, 50, -50],
    [ 50, 50, -50],
    [ 50, 50,  50],
    [-50, 50,  50],
  ]
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI]}>
          {/* Cone pointing downward — rotated 180° around Z so tip faces down */}
          <coneGeometry args={[15, 40, 8, 1, true]} />
          <meshBasicMaterial color="#ffffcc" opacity={0.025} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// ─── Ground sections ─────────────────────────────────────────────
function MainGround() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[200, 0.5, 200]} />
        <meshStandardMaterial color="#4ec832" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function BeachGround() {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[50, -0.22, 50]}>
        <mesh receiveShadow>
          <boxGeometry args={[100, 0.08, 100]} />
          <meshStandardMaterial color="#e8d5a0" roughness={1.0} />
        </mesh>
      </RigidBody>
      {/* Sand extension plane stretching south toward the ocean */}
      <mesh position={[55, 0, 105]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 20]} />
        <meshStandardMaterial color="#d4b483" roughness={1.0} />
      </mesh>
    </>
  )
}

function FactoryGround() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[-50, -0.22, 50]}>
      <mesh receiveShadow>
        <boxGeometry args={[100, 0.08, 100]} />
        <meshStandardMaterial color="#7a7a8a" roughness={1.0} />
      </mesh>
    </RigidBody>
  )
}

// ─── Roads ───────────────────────────────────────────────────────
function Roads() {
  return (
    <group>
      {/* Horizontal */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[200, 0.05, 8]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.95} />
      </mesh>
      {/* Vertical */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[8, 0.05, 200]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.95} />
      </mesh>
      {/* Road dashes horizontal */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`rh${i}`} position={[-95 + i * 10, 0.04, 0]}>
          <boxGeometry args={[4, 0.02, 0.25]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      ))}
      {/* Road dashes vertical */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`rv${i}`} position={[0, 0.04, -95 + i * 10]}>
          <boxGeometry args={[0.25, 0.02, 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Districts ───────────────────────────────────────────────────

function ParkDistrict() {
  return (
    <group>
      {/* Dense forest */}
      <TreePine pos={[-80, 0, -80]} scale={1.4} />
      <TreePine pos={[-65, 0, -85]} scale={1.2} rotY={0.5} />
      <TreePine pos={[-75, 0, -60]} scale={1.5} rotY={1.2} />
      <TreeRound pos={[-55, 0, -75]} scale={1.3} />
      <TreeRound pos={[-45, 0, -90]} scale={1.1} rotY={0.8} />
      <Tree pos={[-30, 0, -80]} variant={0} scale={1.3} />
      <Tree pos={[-20, 0, -70]} variant={1} scale={1.2} rotY={0.4} />
      <Tree pos={[-40, 0, -60]} variant={2} scale={1.4} />
      <Tree pos={[-60, 0, -40]} variant={3} scale={1.1} rotY={1.5} />
      <Tree pos={[-50, 0, -20]} variant={4} scale={1.3} />
      <Tree pos={[-80, 0, -30]} variant={0} scale={1.2} rotY={0.9} />
      <Tree pos={[-70, 0, -10]} variant={1} scale={1.0} />
      <Tree pos={[-15, 0, -50]} variant={2} scale={1.3} rotY={2.0} />
      <Tree pos={[-85, 0, -50]} variant={3} scale={1.5} />
      <Tree pos={[-35, 0, -35]} variant={4} scale={1.1} rotY={0.3} />
      <Tree pos={[-25, 0, -15]} variant={0} scale={1.2} />
      <Tree pos={[-55, 0, -55]} variant={1} scale={1.4} rotY={1.8} />

      {/* Bushes */}
      <Bush pos={[-60, 0, -30]} variant={0} scale={1.1} />
      <Bush pos={[-40, 0, -45]} variant={1} scale={0.9} rotY={0.7} />
      <Bush pos={[-20, 0, -30]} variant={0} scale={1.0} />
      <Bush pos={[-70, 0, -70]} variant={1} scale={1.2} rotY={2.0} />
      <Bush pos={[-50, 0, -10]} variant={0} scale={0.8} />

      {/* Flowers scattered */}
      <Flowers pos={[-45, 0, -25]} scale={1.2} />
      <Flowers pos={[-30, 0, -55]} scale={1.1} rotY={0.5} />
      <Flowers pos={[-65, 0, -20]} scale={1.3} />
      <Flowers pos={[-20, 0, -80]} scale={1.0} rotY={1.2} />
      <Flowers pos={[-75, 0, -45]} scale={1.1} />
      <Flowers pos={[-10, 0, -40]} scale={1.2} rotY={0.8} />

      {/* Grass tufts */}
      {[[-55,0,-65],[-40,0,-75],[-25,0,-45],[-70,0,-55],[-15,0,-65],[-80,0,-20],[-35,0,-20],[-60,0,-80]].map((p,i) => (
        <GrassTuft key={i} pos={p as [number,number,number]} tall={i%2===0} scale={0.9+(i%3)*0.1} rotY={i*0.7} />
      ))}

      {/* Benches along paths */}
      <Bench pos={[-30, 0, -12]} rotY={0} />
      <Bench pos={[-50, 0, -30]} rotY={Math.PI / 3} />
      <Bench pos={[-15, 0, -55]} rotY={Math.PI / 2} />

      {/* Well in the park center */}
      <Well pos={[-50, 0, -50]} />

      {/* Lanterns */}
      <Lantern pos={[-20, 0, -10]} />
      <Lantern pos={[-40, 0, -10]} />
      <Lantern pos={[-60, 0, -10]} />
      <Lantern pos={[-80, 0, -10]} />
      <Lantern pos={[-20, 0, -95]} />
      <Lantern pos={[-60, 0, -95]} />

      {/* Mushrooms */}
      <MushroomGlow pos={[-35, 0, -70]} scale={1.1} />
      <MushroomGlow pos={[-65, 0, -60]} scale={0.9} />
      <MushroomGlow pos={[-50, 0, -40]} scale={1.3} />
      <MushroomGlow pos={[-20, 0, -90]} scale={1.0} />
      <MushroomGlow pos={[-80, 0, -75]} scale={1.2} />

      {/* Campfire */}
      <GenCampfire pos={[-45, 0, -55]} />

      {/* Park portal */}
      <Portal pos={[-90, 0, -90]} rotY={Math.PI / 4} />

      {/* Park sparkle ambient */}
      <ParkSparkles />

      {/* Pollen / butterflies drifting over park */}
      <ParkPollen />

      {/* Magic crystal garden — scattered through park interior */}
      <CrystalCluster pos={[-40, 0, -40]} scale={1.2} rotY={0.3} />
      <CrystalCluster pos={[-60, 0, -65]} scale={1.4} rotY={1.1} />
      <CrystalCluster pos={[-75, 0, -35]} scale={1.1} rotY={2.2} />
      <CrystalCluster pos={[-25, 0, -60]} scale={1.3} rotY={0.8} />
      <CrystalCluster pos={[-55, 0, -20]} scale={1.0} rotY={1.7} />
      <CrystalCluster pos={[-85, 0, -60]} scale={1.2} rotY={0.5} />
    </group>
  )
}

function CityDistrict() {
  return (
    <group>
      {/* 12 buildings */}
      <Building pos={[15,  0, -20]} letter="a" scale={2.8} rotY={0} />
      <Building pos={[35,  0, -20]} letter="b" scale={3.0} rotY={Math.PI} />
      <Building pos={[55,  0, -20]} letter="c" scale={2.6} rotY={0.1} />
      <Building pos={[75,  0, -20]} letter="d" scale={3.2} rotY={-0.1} />
      <Building pos={[15,  0, -50]} letter="e" scale={2.9} rotY={Math.PI} />
      <Building pos={[35,  0, -50]} letter="f" scale={2.7} rotY={0} />
      <Building pos={[55,  0, -50]} letter="g" scale={3.1} rotY={Math.PI} />
      <Building pos={[75,  0, -50]} letter="h" scale={2.8} rotY={0.2} />
      <Building pos={[15,  0, -80]} letter="i" scale={2.6} rotY={-0.1} />
      <Building pos={[40,  0, -80]} letter="j" scale={3.0} rotY={Math.PI} />
      <Building pos={[65,  0, -80]} letter="k" scale={2.7} rotY={0} />
      <Building pos={[88,  0, -55]} letter="l" scale={3.2} rotY={-Math.PI/2} />

      {/* 8 parked cars */}
      <ParkedCar pos={[12,  0, -10]} rotY={0} />
      <ParkedCar pos={[30,  0, -10]} rotY={0} />
      <ParkedCar pos={[50,  0, -10]} rotY={0} />
      <ParkedCar pos={[70,  0, -10]} rotY={0} />
      <ParkedCar pos={[90,  0, -30]} rotY={Math.PI/2} />
      <ParkedCar pos={[90,  0, -60]} rotY={Math.PI/2} />
      <ParkedCar pos={[20,  0, -95]} rotY={Math.PI} />
      <ParkedCar pos={[60,  0, -95]} rotY={Math.PI} />

      {/* Street lanterns */}
      <Lantern pos={[10,  0, -10]} />
      <Lantern pos={[30,  0, -10]} />
      <Lantern pos={[50,  0, -10]} />
      <Lantern pos={[70,  0, -10]} />
      <Lantern pos={[90,  0, -10]} />
      <Lantern pos={[10,  0, -95]} />
      <Lantern pos={[50,  0, -95]} />
      <Lantern pos={[90,  0, -95]} />

      {/* Signs */}
      <Sign pos={[20,  0, -12]} rotY={0} />
      <Sign pos={[60,  0, -12]} rotY={0} />
      <Sign pos={[20,  0, -92]} rotY={Math.PI} />

      {/* IceBlock public art installations — city plazas */}
      <IceBlock pos={[25,  0, -35]} scale={1.3} rotY={0.4} />
      <IceBlock pos={[55,  0, -65]} scale={1.5} rotY={1.0} />
      <IceBlock pos={[80,  0, -35]} scale={1.2} rotY={2.1} />
      <IceBlock pos={[45,  0, -90]} scale={1.4} rotY={0.7} />

      {/* BossGolem — final challenge guardian near goal area */}
      <BossGolem pos={[15, 0, -15]} scale={1.6} rotY={Math.PI} />

      {/* City ambient point lights — warm/cool glow across building facades */}
      <CityLights />
    </group>
  )
}

function BeachDistrict() {
  return (
    <group>
      {/* Palm-like trees on beach */}
      <TreeRound pos={[20,  0, 20]}  scale={1.4} rotY={0.3} />
      <TreeRound pos={[45,  0, 15]}  scale={1.2} />
      <TreeRound pos={[70,  0, 25]}  scale={1.5} rotY={1.1} />
      <TreeRound pos={[90,  0, 40]}  scale={1.1} rotY={0.7} />
      <TreeRound pos={[30,  0, 60]}  scale={1.3} />
      <TreeRound pos={[80,  0, 75]}  scale={1.4} rotY={-0.4} />
      <TreeRound pos={[15,  0, 85]}  scale={1.2} rotY={0.9} />
      <Tree pos={[55,  0, 50]}  variant={1} scale={1.2} />
      <Tree pos={[75,  0, 55]}  variant={3} scale={1.1} rotY={1.4} />

      {/* Well on the beach */}
      <Well pos={[60,  0, 70]} />

      {/* Flowers along shore */}
      <Flowers pos={[25,  0, 30]} scale={1.1} />
      <Flowers pos={[50,  0, 20]} scale={1.2} rotY={0.6} />
      <Flowers pos={[85,  0, 60]} scale={1.0} />

      {/* Benches facing the "water" */}
      <Bench pos={[40,  0, 95]} rotY={Math.PI} />
      <Bench pos={[70,  0, 92]} rotY={Math.PI} />

      {/* Lanterns at beach entry */}
      <Lantern pos={[10,  0, 10]} />
      <Lantern pos={[10,  0, 90]} />
      <Lantern pos={[90,  0, 10]} />

      {/* Rocks on beach */}
      <Rock pos={[35,  0, 80]} scale={1.3} />
      <Rock pos={[65,  0, 88]} scale={0.9} />
      <Rock pos={[90,  0, 80]} scale={1.1} />

      {/* Mushrooms for a magical beach night vibe */}
      <MushroomGlow pos={[55,  0, 85]} scale={0.8} />
      <MushroomGlow pos={[20,  0, 70]} scale={0.9} />

      {/* Palm trees along the beach — tropical shore line */}
      <PalmTree pos={[15,  0, 35]} scale={1.4} rotY={0.2} />
      <PalmTree pos={[35,  0, 45]} scale={1.3} rotY={0.9} />
      <PalmTree pos={[60,  0, 40]} scale={1.5} rotY={1.6} />
      <PalmTree pos={[80,  0, 30]} scale={1.2} rotY={-0.5} />
      <PalmTree pos={[92,  0, 55]} scale={1.4} rotY={0.4} />
      <PalmTree pos={[75,  0, 90]} scale={1.3} rotY={2.0} />
      <PalmTree pos={[45,  0, 75]} scale={1.1} rotY={1.2} />
      <PalmTree pos={[20,  0, 55]} scale={1.5} rotY={-0.3} />

      {/* Sunset warm shimmer overlay on beach sand */}
      <SunsetReflection />

      {/* Expanded ocean surface beyond the beach */}
      <OceanPlane />

      {/* Animated wave shimmer at southern coastline */}
      <BeachWaves />

      {/* Sand castle structures scattered across sandy area */}
      <SandCastles />

      {/* Beach umbrellas with colourful canopies */}
      <BeachUmbrellas />

      {/* Toy boats floating near the ocean */}
      <ToyBoats />

      {/* Water park section */}
      <WaterSlide />
      <WavePool />
      <LifeguardTower />

      {/* Beach bonfire gathering */}
      <BeachBonfire />
      <BeachCampGroup />
    </group>
  )
}

function FactoryDistrict() {
  return (
    <group>
      {/* Large rock formations */}
      <Rock pos={[-20, 0, 20]} scale={2.0} />
      <Rock pos={[-40, 0, 30]} scale={1.8} rotY={0.9} />
      <Rock pos={[-60, 0, 20]} scale={2.2} rotY={1.5} />
      <Rock pos={[-80, 0, 40]} scale={1.6} />
      <Rock pos={[-30, 0, 60]} scale={1.9} rotY={0.4} />
      <Rock pos={[-70, 0, 70]} scale={2.1} rotY={2.0} />
      <Rock pos={[-55, 0, 85]} scale={1.7} rotY={1.1} />
      <Rock pos={[-15, 0, 50]} scale={1.5} />
      <Rock pos={[-90, 0, 25]} scale={2.0} rotY={0.7} />

      {/* Crate-like boxes (dark cubes) */}
      {[
        [-25,  0.5, 35], [-28,  0.5, 35], [-25,  1.5, 35],
        [-45,  0.5, 55], [-48,  0.5, 55], [-45,  0.5, 58],
        [-70,  0.5, 30], [-73,  0.5, 30], [-70,  1.5, 30],
        [-85,  0.5, 60], [-85,  0.5, 63], [-88,  0.5, 60],
        [-20,  0.5, 75], [-20,  0.5, 78], [-17,  0.5, 75],
      ].map((p, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={p as [number,number,number]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#4a4a5a' : i % 3 === 1 ? '#5a5040' : '#3a4550'} roughness={1} />
          </mesh>
        </RigidBody>
      ))}

      {/* Industrial signs */}
      <Sign pos={[-20, 0, 12]} rotY={Math.PI} />
      <Sign pos={[-60, 0, 12]} rotY={Math.PI} />

      {/* Minimal industrial lanterns (dim) */}
      <Lantern pos={[-15, 0, 15]} />
      <Lantern pos={[-50, 0, 15]} />
      <Lantern pos={[-85, 0, 15]} />
      <Lantern pos={[-15, 0, 95]} />
      <Lantern pos={[-85, 0, 95]} />

      {/* A campfire in the factory */}
      <GenCampfire pos={[-55, 0, 50]} />
      <GenCampfire pos={[-30, 0, 80]} />

      {/* LavaRock industrial terrain — volcanic deposits across factory floor */}
      <LavaRock pos={[-35, 0, 25]} scale={1.6} rotY={0.6} />
      <LavaRock pos={[-65, 0, 45]} scale={1.8} rotY={1.4} />
      <LavaRock pos={[-50, 0, 70]} scale={1.5} rotY={2.3} />
      <LavaRock pos={[-80, 0, 55]} scale={2.0} rotY={0.2} />
      <LavaRock pos={[-25, 0, 60]} scale={1.4} rotY={1.9} />
      <LavaRock pos={[-75, 0, 85]} scale={1.7} rotY={0.8} />

      {/* Rising smoke columns from factory stacks */}
      <FactorySmoke />

      {/* Industrial grit overlay — metal panels, warning barriers, orange lights, rust haze */}
      <FactoryGrit />
    </group>
  )
}

// ─── BeachBonfire ────────────────────────────────────────────────
function BeachBonfire() {
  const fireConeRefs = useRef<(THREE.Mesh | null)[]>([])
  const lightRef = useRef<THREE.PointLight>(null!)
  const sparkRefs = useRef<THREE.InstancedMesh | null>(null)
  const sparkData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * Math.PI * 2,
    radius: Math.random() * 0.5,
    speed: 1.0 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
  })), [])

  const dummyMatrix = useMemo(() => new THREE.Matrix4(), [])
  const dummyColor  = useMemo(() => new THREE.Color('#ffaa44'), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    const phases = [0, 1.1, 2.3]
    fireConeRefs.current.forEach((m, i) => {
      if (!m) return
      m.scale.y = 1 + Math.sin(t * 4 + phases[i]!) * 0.3
    })
    if (lightRef.current) {
      lightRef.current.intensity = 10 + Math.sin(t * 5) * 4
    }
    const mesh = sparkRefs.current
    if (mesh) {
      sparkData.forEach((d, i) => {
        const life = ((t * d.speed + d.phase) % 2) / 2
        const x = Math.cos(d.angle) * d.radius
        const y = 0.5 + life * 4.0
        const z = Math.sin(d.angle) * d.radius
        const s = (1 - life) * 0.12
        dummyMatrix.makeScale(s, s, s)
        dummyMatrix.setPosition(x, y, z)
        mesh.setMatrixAt(i, dummyMatrix)
        dummyColor.setHex(0xffaa44)
        mesh.setColorAt(i, dummyColor)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  })

  // Stone ring (8 stones)
  const stones = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2
    return {
      x: Math.cos(angle) * 2.5,
      z: Math.sin(angle) * 2.5,
      r: 0.4 + Math.random() * 0.3,
    }
  }), [])

  // Log pile (4 cylinders at angles)
  const logs = useMemo(() => [
    { rotY: 0.2,        rotZ: Math.PI / 2 },
    { rotY: 0.2 + Math.PI / 2, rotZ: Math.PI / 2 },
    { rotY: 0.2 + Math.PI / 4, rotZ: Math.PI / 2 },
    { rotY: 0.2 + (3 * Math.PI) / 4, rotZ: Math.PI / 2 },
  ], [])

  const fireConeData = [
    { height: 0.5, color: '#ff6600', emissive: '#ff6600', intensity: 6  },
    { height: 0.8, color: '#ff9900', emissive: '#ff9900', intensity: 8  },
    { height: 1.2, color: '#ffcc00', emissive: '#ffcc00', intensity: 10 },
  ]

  return (
    <group position={[-15, 0, 85]}>
      {/* Rock circle */}
      {stones.map((s, i) => (
        <mesh key={`stone-${i}`} position={[s.x, s.r * 0.6 * 0.5, s.z]} scale={[1.2, 0.6, 1.0]} castShadow>
          <sphereGeometry args={[s.r, 8, 6]} />
          <meshStandardMaterial color="#778877" roughness={1} />
        </mesh>
      ))}

      {/* Log pile */}
      {logs.map((l, i) => (
        <mesh key={`log-${i}`} position={[0, 0.25, 0]} rotation={[l.rotZ, l.rotY, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 2, 8]} />
          <meshStandardMaterial color="#5a3010" roughness={1} />
        </mesh>
      ))}

      {/* Fire cones */}
      {fireConeData.map((f, i) => (
        <mesh
          key={`cone-${i}`}
          ref={el => { fireConeRefs.current[i] = el }}
          position={[0, f.height * 0.5 + 0.3, 0]}
        >
          <coneGeometry args={[0.45 - i * 0.1, f.height, 8]} />
          <meshStandardMaterial
            color={f.color}
            emissive={f.emissive}
            emissiveIntensity={f.intensity}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Spark particles */}
      <instancedMesh ref={sparkRefs} args={[undefined, undefined, 20]} frustumCulled={false}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#ffaa44" />
      </instancedMesh>

      {/* Flickering fire light */}
      <pointLight ref={lightRef} color="#ff8822" intensity={12} distance={20} />
    </group>
  )
}

// ─── BeachCampGroup ──────────────────────────────────────────────
function BeachCampGroup() {
  const OUTFIT_COLORS = ['#3366cc', '#cc4422', '#44aa66', '#bb8833', '#9933cc']

  // 5 figures arranged around the fire (radius ~4 from fire center)
  const figures = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2
    return {
      x: Math.cos(angle) * 4,
      z: Math.sin(angle) * 4,
      rotY: angle + Math.PI, // face center
      armsRaised: i === 2,
      hunched: i === 4,
    }
  }), [])

  return (
    <group position={[-15, 0, 85]}>
      {figures.map((f, i) => (
        <group key={`figure-${i}`} position={[f.x, 0, f.z]} rotation={[0, f.rotY, 0]}>
          {/* Sitting body (shorter cylinder, lowered) */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.38, 0.9, 8]} />
            <meshStandardMaterial color={OUTFIT_COLORS[i % OUTFIT_COLORS.length]} roughness={0.8} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.28, 10, 8]} />
            <meshStandardMaterial color="#f5c5a3" roughness={0.8} />
          </mesh>
          {/* Arms raised (storyteller) */}
          {f.armsRaised && (
            <>
              <mesh position={[-0.5, 0.9, 0]} rotation={[0, 0, -0.9]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.7, 6]} />
                <meshStandardMaterial color={OUTFIT_COLORS[i % OUTFIT_COLORS.length]} roughness={0.8} />
              </mesh>
              <mesh position={[0.5, 0.9, 0]} rotation={[0, 0, 0.9]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.7, 6]} />
                <meshStandardMaterial color={OUTFIT_COLORS[i % OUTFIT_COLORS.length]} roughness={0.8} />
              </mesh>
            </>
          )}
          {/* Arms hugging knees (hunched) */}
          {f.hunched && (
            <>
              <mesh position={[-0.3, 0.5, 0.3]} rotation={[0.8, 0, -0.3]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.65, 6]} />
                <meshStandardMaterial color={OUTFIT_COLORS[i % OUTFIT_COLORS.length]} roughness={0.8} />
              </mesh>
              <mesh position={[0.3, 0.5, 0.3]} rotation={[0.8, 0, 0.3]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.65, 6]} />
                <meshStandardMaterial color={OUTFIT_COLORS[i % OUTFIT_COLORS.length]} roughness={0.8} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Guitar — one of the figures (figure 1, left side) */}
      <group position={[figures[1]!.x + 0.6, 0.4, figures[1]!.z]} rotation={[0, figures[1]!.rotY, 0]}>
        {/* Guitar neck */}
        <mesh position={[0, 0.7, 0]} rotation={[0.1, 0, 0.15]} castShadow>
          <boxGeometry args={[0.15, 1.2, 0.05]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        {/* Guitar body */}
        <mesh position={[0, 0.0, 0]} castShadow>
          <sphereGeometry args={[0.35, 10, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} />
        </mesh>
      </group>

      {/* Marshmallow on stick (figure 3) */}
      <group position={[figures[3]!.x, 0.6, figures[3]!.z]} rotation={[0, figures[3]!.rotY + Math.PI, 0]}>
        {/* Stick */}
        <mesh position={[0, 0.3, 0.6]} rotation={[0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 5]} />
          <meshStandardMaterial color="#885522" roughness={0.9} />
        </mesh>
        {/* Marshmallow tip */}
        <mesh position={[0, 0.85, 1.0]}>
          <sphereGeometry args={[0.11, 7, 6]} />
          <meshStandardMaterial color="#ffffee" emissive="#ffffcc" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// ─── SunsetSky ───────────────────────────────────────────────────
function SunsetSky() {
  return (
    <>
      {/* Horizon glow strip */}
      <mesh position={[0, -1, 200]}>
        <boxGeometry args={[200, 0.5, 2]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1} depthWrite={false} />
      </mesh>

      {/* Sun disk */}
      <mesh position={[80, 15, 200]}>
        <sphereGeometry args={[12, 20, 16]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>

      {/* Sun halo */}
      <mesh position={[80, 15, 200]}>
        <sphereGeometry args={[16, 20, 16]} />
        <meshStandardMaterial color="#ff4400" transparent opacity={0.2} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* Warm hemisphere light */}
      <hemisphereLight args={['#ff8844', '#442200', 0.5]} />

      {/* Warm directional light from sun direction */}
      <directionalLight position={[80, 15, 200]} color="#ff9944" intensity={0.8} />
    </>
  )
}

// ─── SandCastles ─────────────────────────────────────────────────
function SandCastles() {
  const castles: Array<{ x: number; z: number; rotY: number }> = [
    { x: -20, z:  58, rotY: 0.3 },
    { x:   5, z:  72, rotY: 1.1 },
    { x:  22, z:  95, rotY: 0.7 },
    { x: -10, z: 105, rotY: 2.0 },
    { x:  15, z:  62, rotY: 1.5 },
  ]

  return (
    <group>
      {castles.map(({ x, z, rotY }, ci) => (
        <group key={ci} position={[x, 0, z]} rotation={[0, rotY, 0]}>
          {/* Base */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 1.5, 16]} />
            <meshStandardMaterial color="#d4a853" roughness={1} />
          </mesh>
          {/* Main tower */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.3, 3, 12]} />
            <meshStandardMaterial color="#c8973d" roughness={1} />
          </mesh>
          {/* 4 corner turrets */}
          {([[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]] as [number, number][]).map(([tx, tz], ti) => (
            <mesh key={ti} position={[tx, 2.5, tz]} castShadow>
              <cylinderGeometry args={[0.4, 0.45, 1.5, 8]} />
              <meshStandardMaterial color="#c8973d" roughness={1} />
            </mesh>
          ))}
          {/* Battlements cone */}
          <mesh position={[0, 4.8, 0]} castShadow>
            <coneGeometry args={[1.4, 1.2, 12]} />
            <meshStandardMaterial color="#c08030" roughness={1} />
          </mesh>
          {/* Flag-like cone tip */}
          <mesh position={[0, 5.8, 0]} castShadow>
            <coneGeometry args={[0.6, 1.0, 8]} />
            <meshStandardMaterial color="#cc4422" roughness={0.8} />
          </mesh>
          {/* Flag pole */}
          <mesh position={[0, 7.05, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 5]} />
            <meshStandardMaterial color="#886633" roughness={0.9} />
          </mesh>
          {/* Flag cloth */}
          <mesh position={[0.25, 7.65, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.05]} />
            <meshStandardMaterial color="#ff4444" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── BeachUmbrellas ───────────────────────────────────────────────
function BeachUmbrellas() {
  const CANOPY_COLORS = ['#ff6644', '#44aaff', '#ffcc22', '#44cc88']
  const umbrellas: Array<{ x: number; z: number; rotY: number }> = [
    { x: -22, z:  62, rotY: 0.2 },
    { x:  -8, z:  70, rotY: 0.9 },
    { x:   8, z:  78, rotY: 1.4 },
    { x:  20, z:  68, rotY: 0.1 },
    { x: -15, z:  88, rotY: 1.8 },
    { x:   3, z:  96, rotY: 0.6 },
    { x:  18, z:  84, rotY: 2.2 },
    { x: -25, z: 100, rotY: 0.4 },
  ]

  return (
    <group>
      {umbrellas.map(({ x, z, rotY }, ui) => (
        <group key={ui} position={[x, 0, z]} rotation={[0, rotY, 0]}>
          {/* Pole */}
          <mesh position={[0, 1.75, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 3.5, 6]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[2.5, 0.8, 16, 1, true]} />
            <meshStandardMaterial
              color={CANOPY_COLORS[ui % CANOPY_COLORS.length]}
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Canopy top cap (closed) */}
          <mesh position={[0, 3.9, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
            <meshStandardMaterial color={CANOPY_COLORS[ui % CANOPY_COLORS.length]} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── ToyBoats ─────────────────────────────────────────────────────
function ToyBoats() {
  const boats: Array<{ x: number; z: number; color: string; rotY: number }> = [
    { x:  38, z: 125, color: '#cc3333', rotY: 0.4 },
    { x:  60, z: 133, color: '#3366cc', rotY: 1.1 },
    { x:  80, z: 121, color: '#33aa33', rotY: 2.5 },
  ]

  return (
    <group>
      {boats.map(({ x, z, color, rotY }, bi) => (
        <group key={bi} position={[x, 0.05, z]} rotation={[0, rotY, 0]}>
          {/* Hull */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[2.5, 0.8, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Hull bottom rounding */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.55, 0.65, 0.35, 10]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          {/* Mast */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 2.0, 6]} />
            <meshStandardMaterial color="#885533" roughness={0.9} />
          </mesh>
          {/* Sail */}
          <mesh position={[0.12, 2.15, 0]} castShadow>
            <boxGeometry args={[1.0, 1.5, 0.02]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Deck stripe */}
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[2.4, 0.06, 1.1]} />
            <meshStandardMaterial color="#eeeecc" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── WaterSlide ───────────────────────────────────────────────────
function WaterSlide() {
  // Splash particles slowly drift outward and bob
  const splashMeshRef = useRef<THREE.InstancedMesh>(null!)
  const splashDummy = useMemo(() => new THREE.Object3D(), [])
  const splashData = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2
    return {
      angle,
      radius: 0.5 + Math.random() * 2.2,
      speed: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      size: 0.07 + Math.random() * 0.06,
    }
  }), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    splashData.forEach((d, i) => {
      splashDummy.position.set(
        Math.cos(d.angle + t * 0.1) * d.radius,
        0.3 + Math.abs(Math.sin(t * d.speed + d.phase)) * 0.6,
        Math.sin(d.angle + t * 0.1) * d.radius,
      )
      splashDummy.scale.setScalar(d.size)
      splashDummy.updateMatrix()
      splashMeshRef.current.setMatrixAt(i, splashDummy.matrix)
    })
    splashMeshRef.current.instanceMatrix.needsUpdate = true
  })

  // 11 spiral segments descending from y=10 to y=1
  const slideSegments = useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    const angle = t * Math.PI * 2.5          // 2.5 full turns
    const radius = 2.5
    return {
      x: Math.cos(angle) * radius,
      y: 10 - t * 9,                          // y: 10 → 1
      z: Math.sin(angle) * radius,
      rotY: angle + Math.PI / 2,
      color: i % 2 === 0 ? '#2288ff' : '#ff4422',
    }
  }), [])

  return (
    <group position={[20, 0, 20]}>
      {/* Main support tower */}
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 10, 3]} />
        <meshStandardMaterial color="#2244cc" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Ladder rungs on front face */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`rung-${i}`} position={[0, 1.5 + i * 1.1, 1.6]} castShadow>
          <boxGeometry args={[2, 0.1, 0.4]} />
          <meshStandardMaterial color="#aaccff" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}

      {/* Spiral slide tube segments */}
      {slideSegments.map((seg, i) => (
        <mesh key={`slide-${i}`} position={[seg.x, seg.y, seg.z]} rotation={[0, seg.rotY, 0]} castShadow>
          <boxGeometry args={[0.1, 2, 1.5]} />
          <meshStandardMaterial color={seg.color} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}

      {/* Water shimmer strip on slide — emissive blue, very transparent */}
      {slideSegments.map((seg, i) => (
        <mesh key={`shimmer-${i}`} position={[seg.x, seg.y + 0.05, seg.z]} rotation={[0, seg.rotY, 0]}>
          <boxGeometry args={[0.12, 1.9, 0.6]} />
          <meshStandardMaterial
            color="#88ccff"
            emissive="#2266ff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Flat runout section at bottom */}
      <mesh position={[3.5, 0.6, 0]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[4, 0.15, 1.5]} />
        <meshStandardMaterial color="#2288ff" roughness={0.3} />
      </mesh>

      {/* Splash pool at bottom */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3.1, 0.4, 24]} />
        <meshStandardMaterial color="#3366cc" transparent opacity={0.8} roughness={0.2} />
      </mesh>
      {/* Pool water surface */}
      <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 24]} />
        <meshStandardMaterial
          color="#55aaff"
          emissive="#1144aa"
          emissiveIntensity={0.4}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Splash particles */}
      <instancedMesh ref={splashMeshRef} args={[undefined, undefined, 20]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.7} />
      </instancedMesh>

      {/* Point light inside pool */}
      <pointLight position={[0, 2, 0]} color="#44aaff" intensity={1.5} distance={12} />
    </group>
  )
}

// ─── WavePool ─────────────────────────────────────────────────────
function WavePool() {
  const waveRefs = useRef<(THREE.Mesh | null)[]>([])
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([])

  // Wave crest start positions (spread in z)
  const waveStartZ = useMemo(() => Array.from({ length: 5 }, (_, i) => i * 5 - 10), [])
  // Ripple base data
  const rippleData = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    x: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 12,
    phase: (i / 6) * Math.PI * 2,
    speed: 0.6 + Math.random() * 0.5,
  })), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()

    // Move wave crests from z=-9 to z=+9, wrapping
    waveRefs.current.forEach((m, i) => {
      if (!m) return
      const startZ = waveStartZ[i] ?? 0
      m.position.z = ((t * 4 + startZ + 9 + i * 5) % 18) - 9
    })

    // Expand and fade ripples
    rippleRefs.current.forEach((m, i) => {
      if (!m) return
      const d = rippleData[i]!
      const phase = (t * d.speed + d.phase) % (Math.PI * 2)
      const frac = phase / (Math.PI * 2)
      const scale = 0.5 + frac * 3
      m.scale.setScalar(scale)
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = 0.35 * (1 - frac)
    })
  })

  return (
    <group position={[-30, 0, 40]}>
      {/* Pool floor */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 0.3, 20]} />
        <meshStandardMaterial color="#2244aa" roughness={0.8} />
      </mesh>

      {/* Pool walls — 4 sides */}
      {/* North wall (z=-10) */}
      <mesh position={[0, 1, -10]} castShadow>
        <boxGeometry args={[30, 2, 0.5]} />
        <meshStandardMaterial color="#3355aa" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* South wall (z=+10) */}
      <mesh position={[0, 1, 10]} castShadow>
        <boxGeometry args={[30, 2, 0.5]} />
        <meshStandardMaterial color="#3355aa" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* West wall (x=-15) */}
      <mesh position={[-15, 1, 0]} castShadow>
        <boxGeometry args={[0.5, 2, 20]} />
        <meshStandardMaterial color="#3355aa" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* East wall — wave machine end (x=+15) */}
      <mesh position={[15, 1, 0]} castShadow>
        <boxGeometry args={[0.5, 2, 20]} />
        <meshStandardMaterial color="#3355aa" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Water surface */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[29, 0.1, 19]} />
        <meshStandardMaterial
          color="#4488cc"
          emissive="#1144aa"
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Wave machine housing at x=-15 end */}
      <mesh position={[-14, 2.5, 0]} castShadow>
        <boxGeometry args={[2, 3, 20]} />
        <meshStandardMaterial color="#2233aa" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Gear cylinders on wave machine */}
      {([-6, -2, 2, 6] as number[]).map((zOff, i) => (
        <mesh key={`gear-${i}`} position={[-13, 2.5, zOff]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.4, 12]} />
          <meshStandardMaterial color="#5577cc" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {/* Animated wave crests */}
      {waveStartZ.map((_, i) => (
        <mesh
          key={`wave-${i}`}
          ref={el => { waveRefs.current[i] = el }}
          position={[0, 2.1, 0]}
        >
          <boxGeometry args={[28, 0.4, 0.8]} />
          <meshStandardMaterial
            color="#88ccff"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Water ripple torus rings on surface */}
      {rippleData.map((d, i) => (
        <mesh
          key={`ripple-${i}`}
          ref={el => { rippleRefs.current[i] = el }}
          position={[d.x, 2.15, d.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.08, 6, 24]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}

      {/* Pool ambient light */}
      <pointLight position={[0, 4, 0]} color="#3388ff" intensity={2} distance={25} />
    </group>
  )
}

// ─── LifeguardTower ───────────────────────────────────────────────
function LifeguardTower() {
  return (
    <group position={[10, 0, 40]}>
      {/* 4 wooden leg cylinders at corners */}
      {([[-1.2, 1.25, -0.9], [1.2, 1.25, -0.9], [-1.2, 1.25, 0.9], [1.2, 1.25, 0.9]] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={`leg-${i}`} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 3.5, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      ))}

      {/* Diagonal braces: front face (z=-0.9) */}
      <mesh position={[0, 1.75, -0.9]} rotation={[0, 0, Math.atan2(3.5, 2.4)]} castShadow>
        <boxGeometry args={[0.08, 4.2, 0.08]} />
        <meshStandardMaterial color="#6B3410" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, -0.9]} rotation={[0, 0, -Math.atan2(3.5, 2.4)]} castShadow>
        <boxGeometry args={[0.08, 4.2, 0.08]} />
        <meshStandardMaterial color="#6B3410" roughness={0.9} />
      </mesh>
      {/* Back face (z=+0.9) */}
      <mesh position={[0, 1.75, 0.9]} rotation={[0, 0, Math.atan2(3.5, 2.4)]} castShadow>
        <boxGeometry args={[0.08, 4.2, 0.08]} />
        <meshStandardMaterial color="#6B3410" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0.9]} rotation={[0, 0, -Math.atan2(3.5, 2.4)]} castShadow>
        <boxGeometry args={[0.08, 4.2, 0.08]} />
        <meshStandardMaterial color="#6B3410" roughness={0.9} />
      </mesh>

      {/* Platform */}
      <mesh position={[0, 3.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.3, 2.5]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>

      {/* Chair seat */}
      <mesh position={[0, 4.15, 0.3]} castShadow>
        <boxGeometry args={[1.0, 0.15, 0.9]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>
      {/* Chair back */}
      <mesh position={[0, 4.6, 0.75]} castShadow>
        <boxGeometry args={[1.0, 0.9, 0.12]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>
      {/* Chair legs */}
      {([-0.4, 0.4] as number[]).map((xOff, i) => (
        <mesh key={`chairleg-${i}`} position={[xOff, 3.82, 0.3]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#aa1a00" roughness={0.6} />
        </mesh>
      ))}

      {/* Umbrella pole */}
      <mesh position={[0, 4.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
        <meshStandardMaterial color="#888888" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Umbrella canopy — two half-cones side by side for red/white stripe effect */}
      <mesh position={[-0.5, 5.5, 0]} castShadow>
        <coneGeometry args={[1, 0.7, 8, 1, true]} />
        <meshStandardMaterial color="#cc2200" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.5, 5.5, 0]} castShadow>
        <coneGeometry args={[1, 0.7, 8, 1, true]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Canopy cap */}
      <mesh position={[0, 5.85, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 6]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>

      {/* Rescue float (torus) hanging from one side */}
      <mesh position={[1.8, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.55, 0.18, 8, 20]} />
        <meshStandardMaterial color="#ff2200" roughness={0.5} />
      </mesh>
      {/* Float white stripe overlay */}
      <mesh position={[1.8, 3.2, 0]} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[0.56, 0.12, 6, 8, Math.PI / 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[1.8, 3.2, 0]} rotation={[Math.PI / 2, Math.PI + Math.PI / 4, 0]}>
        <torusGeometry args={[0.56, 0.12, 6, 8, Math.PI / 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Hanging string for float */}
      <mesh position={[1.5, 3.7, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 4]} />
        <meshStandardMaterial color="#ccaa88" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── ConstructionCrane ───────────────────────────────────────────
function ConstructionCrane() {
  const craneRef = useRef<THREE.Group>(null!)
  const hookRef = useRef<THREE.Group>(null!)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (craneRef.current) craneRef.current.rotation.y += 0.002
    if (hookRef.current) hookRef.current.rotation.x = Math.sin(t * 0.4) * 0.15
  })

  return (
    <group position={[40, 0, 40]}>
      <group ref={craneRef}>
        {/* Vertical mast */}
        <mesh position={[0, 15, 0]} castShadow>
          <boxGeometry args={[1.2, 30, 1.2]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Counter jib (rear arm) */}
        <mesh position={[-6, 30, 0]} castShadow>
          <boxGeometry args={[8, 0.8, 0.8]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Main jib (front arm) */}
        <mesh position={[10.6, 30, 0]} castShadow>
          <boxGeometry args={[20, 0.8, 0.8]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Counter weight */}
        <mesh position={[-10.5, 29, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 2.5]} />
          <meshStandardMaterial color="#555555" roughness={0.8} metalness={0.4} />
        </mesh>

        {/* Operator cab */}
        <mesh position={[0, 29, 0]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ffdd44" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Diagonal support cables (simulated as thin dark boxes) */}
        {/* Front-left cable: mast top [0,30,0] to jib end [20.6,30,0] */}
        <mesh position={[10.3, 33, 0]} rotation={[0, 0, Math.atan2(3, 20.6)]} castShadow>
          <boxGeometry args={[21.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
        {/* Front-right cable */}
        <mesh position={[10.3, 33, 0]} rotation={[0, 0, -Math.atan2(3, 20.6)]} castShadow>
          <boxGeometry args={[21.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
        {/* Rear-left cable: mast top to counter-jib end */}
        <mesh position={[-5.25, 33, 0]} rotation={[0, 0, Math.atan2(-3, -10.5)]} castShadow>
          <boxGeometry args={[11, 0.1, 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
        {/* Rear-right cable */}
        <mesh position={[-5.25, 33, 0]} rotation={[0, 0, -Math.atan2(-3, -10.5)]} castShadow>
          <boxGeometry args={[11, 0.1, 0.1]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>

        {/* Hook assembly hanging from jib end */}
        <group ref={hookRef} position={[20.6, 28, 0]}>
          {/* Hoist rod */}
          <mesh position={[0, -1, 0]} castShadow>
            <boxGeometry args={[0.3, 2, 0.3]} />
            <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Hook sphere */}
          <mesh position={[0, -2.2, 0]} castShadow>
            <sphereGeometry args={[0.4, 10, 10]} />
            <meshStandardMaterial color="#888888" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Crane base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Scaffolding (construction zone) ─────────────────────────────
function Scaffolding() {
  const warningRef = useRef<THREE.Mesh>(null!)

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    if (warningRef.current) {
      const mat = warningRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + Math.sin(t * 4) * 1.5
    }
  })

  const polePositions: Array<[number, number, number]> = [
    [-7, 11, -6], [7, 11, -6], [-7, 11, 6], [7, 11, 6],
    [0, 11, -6],  [0, 11, 6], [-7, 11, 0], [7, 11, 0],
  ]

  const debrisBoxes: Array<{ pos: [number, number, number]; size: [number, number, number]; color: string; rotY: number }> = [
    { pos: [-9, 0.3, -4], size: [1.5, 0.6, 0.8], color: '#cc3300', rotY: 0.3 },
    { pos: [-8, 0.3,  3], size: [1.0, 0.6, 1.0], color: '#cc3300', rotY: 1.1 },
    { pos: [ 9, 0.3, -3], size: [1.5, 0.5, 0.7], color: '#cc3300', rotY: 0.7 },
    { pos: [ 9, 0.3,  5], size: [1.2, 0.6, 0.9], color: '#888866', rotY: 2.0 },
    { pos: [-6, 0.3,  8], size: [0.8, 0.4, 2.5], color: '#888888', rotY: 0.2 },
    { pos: [ 5, 0.3,  8], size: [0.8, 0.4, 2.0], color: '#888888', rotY: 1.5 },
    { pos: [-10, 0.3, 2], size: [2.0, 0.5, 0.6], color: '#666644', rotY: 0.0 },
    { pos: [ 8, 0.3, -8], size: [1.0, 0.6, 1.0], color: '#cc3300', rotY: 0.9 },
    { pos: [-5, 0.3, -8], size: [1.5, 0.5, 0.8], color: '#cc3300', rotY: 1.7 },
    { pos: [ 3, 0.3,  9], size: [0.6, 0.4, 1.8], color: '#888888', rotY: 2.5 },
  ]

  return (
    <group position={[50, 0, 50]}>
      {/* Building core (concrete, half-built) */}
      <mesh position={[0, 10, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 20, 10]} />
        <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Exposed rebar top */}
      {([-3, -1, 1, 3] as number[]).map((x, i) => (
        <mesh key={`rebar-${i}`} position={[x, 21, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.5, 5]} />
          <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.7} />
        </mesh>
      ))}

      {/* Scaffolding levels: y=0, y=7, y=14 */}
      {([0, 7, 14] as number[]).map((levelY, li) => (
        <group key={`level-${li}`}>
          {/* Horizontal planks */}
          <mesh position={[0, levelY + 0.075, 0]} castShadow>
            <boxGeometry args={[14, 0.15, 12]} />
            <meshStandardMaterial color="#8B4513" roughness={0.95} />
          </mesh>
          {/* Diagonal braces (angled between levels) — only above level 0 */}
          {li > 0 && (
            <>
              <mesh position={[-6.5, levelY - 3.5, -5]} rotation={[0, 0, Math.atan2(7, 2)]} castShadow>
                <boxGeometry args={[0.12, 7.3, 0.12]} />
                <meshStandardMaterial color="#666666" roughness={0.8} metalness={0.4} />
              </mesh>
              <mesh position={[6.5, levelY - 3.5, -5]} rotation={[0, 0, -Math.atan2(7, 2)]} castShadow>
                <boxGeometry args={[0.12, 7.3, 0.12]} />
                <meshStandardMaterial color="#666666" roughness={0.8} metalness={0.4} />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Vertical scaffold poles (8 poles, full height 22) */}
      {polePositions.map((pos, i) => (
        <mesh key={`pole-${i}`} position={pos} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 22, 7]} />
          <meshStandardMaterial color="#aaaaaa" roughness={0.6} metalness={0.6} />
        </mesh>
      ))}

      {/* Hard hat warning light on top */}
      <mesh ref={warningRef} position={[0, 22.5, 0]}>
        <sphereGeometry args={[0.4, 10, 10]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 22.5, 0]} color="#ff0000" intensity={2} distance={15} />

      {/* Construction debris at base */}
      {debrisBoxes.map((d, i) => (
        <mesh key={`debris-${i}`} position={d.pos} rotation={[0, d.rotY, 0]} castShadow>
          <boxGeometry args={d.size} />
          <meshStandardMaterial color={d.color} roughness={0.95} />
        </mesh>
      ))}

      {/* Pipe debris cylinders */}
      <mesh position={[-7, 0.2, 5]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.0, 6]} />
        <meshStandardMaterial color="#777777" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[7, 0.2, -5]} rotation={[0, 1.2, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 2.5, 6]} />
        <meshStandardMaterial color="#777777" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ─── CementMixer ──────────────────────────────────────────────────
function CementMixer() {
  const drumRef = useRef<THREE.Mesh>(null!)
  const wheelRefs = useRef<(THREE.Mesh | null)[]>([])

  const frameSkip = useRef(0)
  useFrame(() => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (drumRef.current) drumRef.current.rotation.z += 0.05
    wheelRefs.current.forEach(w => {
      if (w) w.rotation.x += 0.08
    })
  })

  const wheelPositions: Array<[number, number, number]> = [
    [ 1.2, 0.7,  1.1],
    [ 1.2, 0.7, -1.1],
    [-1.4, 0.7,  1.1],
    [-1.4, 0.7, -1.1],
  ]

  return (
    <group position={[60, 0, 55]} rotation={[0, -0.4, 0]}>
      {/* Truck cab */}
      <mesh position={[2.0, 1.5, 0]} castShadow>
        <boxGeometry args={[3, 2.5, 2]} />
        <meshStandardMaterial color="#ff8800" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Cab windshield */}
      <mesh position={[3.45, 1.9, 0]}>
        <boxGeometry args={[0.05, 1.0, 1.6]} />
        <meshStandardMaterial color="#aaddff" roughness={0.1} metalness={0.1} transparent opacity={0.6} />
      </mesh>

      {/* Truck bed */}
      <mesh position={[-0.6, 1.0, 0]} castShadow>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial color="#666666" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Drum (tilted 45 deg, spinning) */}
      <mesh
        ref={drumRef}
        position={[-0.5, 2.5, 0]}
        rotation={[0, 0, Math.PI / 4]}
        castShadow
      >
        <cylinderGeometry args={[1.2, 1.2, 3.5, 16]} />
        <meshStandardMaterial color="#999999" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Drum end caps */}
      <mesh position={[-0.5 + Math.cos(Math.PI / 4) * 1.75, 2.5 + Math.sin(Math.PI / 4) * 1.75, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 16]} />
        <meshStandardMaterial color="#888888" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Wheels */}
      {wheelPositions.map((pos, i) => (
        <mesh
          key={`wheel-${i}`}
          ref={el => { wheelRefs.current[i] = el }}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.7, 0.7, 0.3, 14]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
      ))}
      {/* Wheel hubs */}
      {wheelPositions.map((pos, i) => (
        <mesh key={`hub-${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.32, 8]} />
          <meshStandardMaterial color="#888888" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* Exhaust pipe */}
      <mesh position={[3.0, 3.1, -0.7]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 7]} />
        <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Seagull Flock (beach atmosphere) ────────────────────────────
function SeagullFlock() {
  const COUNT = 12
  const refs = useRef<(THREE.Group | null)[]>([])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    cx: 30 + (Math.random() - 0.5) * 40,
    cy: 18 + Math.random() * 12,
    cz: 40 + (Math.random() - 0.5) * 40,
    radius: 8 + Math.random() * 12,
    speed: 0.3 + Math.random() * 0.3,
    phase: (i / COUNT) * Math.PI * 2,
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 2.5 + Math.random() * 2,
  })), [])

  const frameSkip = useRef(0)
  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    const t = clock.elapsedTime
    refs.current.forEach((grp, i) => {
      if (!grp) return
      const d = data[i]!
      const angle = t * d.speed + d.phase
      grp.position.set(
        d.cx + Math.cos(angle) * d.radius,
        d.cy + Math.sin(t * 0.4 + d.phase) * 1.5,
        d.cz + Math.sin(angle) * d.radius,
      )
      // Face direction of travel
      grp.rotation.y = -angle + Math.PI / 2
      // Wing flap: rotate left/right wing meshes
      const wingAngle = Math.sin(t * d.wingSpeed + d.wingPhase) * 0.5
      const leftWing = grp.children[0] as THREE.Mesh | undefined
      const rightWing = grp.children[1] as THREE.Mesh | undefined
      if (leftWing) leftWing.rotation.z = wingAngle
      if (rightWing) rightWing.rotation.z = -wingAngle
    })
  })

  return (
    <>
      {data.map((_, i) => (
        <group key={i} ref={el => { refs.current[i] = el }}>
          {/* Left wing */}
          <mesh position={[-0.35, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.05, 0.25]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
          </mesh>
          {/* Right wing */}
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.05, 0.25]} />
            <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
          </mesh>
          {/* Body */}
          <mesh>
            <boxGeometry args={[0.15, 0.1, 0.45]} />
            <meshStandardMaterial color="#dddddd" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Main world ──────────────────────────────────────────────────

export default function SandboxWorld() {
  return (
    <>
      {/* ── Sky & Atmosphere ── */}
      <GradientSky top="#1a3060" bottom="#4080d0" radius={500} />
      <Stars />
      <AnimatedSun />
      <SunsetSky />
      <ambientLight intensity={0.55} color="#c8d8f0" />
      <directionalLight position={[30, 60, 20]} intensity={0.9} castShadow color="#fff5e0"
        shadow-mapSize-width={SHADOW_MAP_SIZE} shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-far={300} shadow-camera-left={-120} shadow-camera-right={120}
        shadow-camera-top={120} shadow-camera-bottom={-120}
      />
      {/* Sun rays — 4 cone beams at map quadrant centers */}
      <SunRays />

      {/* ── Ground layers ── */}
      <MainGround />
      <BeachGround />
      <FactoryGround />
      <GridOverlay />

      {/* ── Roads ── */}
      <Roads />

      {/* ── Central Fountain ── */}
      <Fountain />

      {/* ── Districts ── */}
      <ParkDistrict />
      <CityDistrict />
      <BeachDistrict />
      <SeagullFlock />
      <FactoryDistrict />

      {/* ── Construction Zone ── */}
      <ConstructionCrane />
      <Scaffolding />
      <CementMixer />

      {/* ── District Prize Trophies ── */}
      <Trophy pos={[-35, 0, -35]} />
      <Trophy pos={[60, 0, -60]} />
      <Trophy pos={[60, 0, 50]} />

      {/* ── NPCs ── */}
      <NPC pos={[-45, 0, -45]} label="ПАРК" />
      <NPC pos={[40,  0, -40]} label="МАГАЗИН" />
      <NPC pos={[55,  0,  55]} label="ПЛЯЖ" />
      <NPC pos={[-35, 0,  45]} label="ЗАВОД" />

      {/* ── Street entertainers (GLTF monsters) ── */}
      <GltfMonster which="birb"   pos={[10,  0, -10]} scale={1.1} rotY={Math.PI}    animation="Run" />
      <GltfMonster which="bunny"  pos={[-10, 0, -10]} scale={1.2} rotY={0}          animation="Yes" />
      <GltfMonster which="cactoro"pos={[10,  0,  10]} scale={1.2} rotY={-Math.PI/2} animation="Wave" />

      {/* ── Enemies in factory ── */}
      <Enemy pos={[-40, 1.4, 45]} patrolX={8} color="#ff4444" />
      <Enemy pos={[-70, 1.4, 65]} patrolX={6} color="#ff6600" />

      {/* ── Coins ── */}
      {/* Park */}
      <Coin pos={[-30, 1, -30]} />
      <Coin pos={[-50, 1, -60]} />
      <Coin pos={[-70, 1, -25]} />
      <Coin pos={[-20, 1, -80]} />
      <Coin pos={[-80, 1, -70]} />
      {/* City */}
      <Coin pos={[20,  1, -35]} />
      <Coin pos={[50,  1, -35]} />
      <Coin pos={[75,  1, -65]} />
      <Coin pos={[30,  1, -85]} />
      <Coin pos={[85,  1, -25]} />
      {/* Beach */}
      <Coin pos={[25,  1, 40]} />
      <Coin pos={[60,  1, 30]} />
      <Coin pos={[80,  1, 65]} />
      <Coin pos={[40,  1, 85]} />
      <Coin pos={[70,  1, 85]} />
      {/* Factory */}
      <Coin pos={[-25, 1, 30]} />
      <Coin pos={[-55, 1, 45]} />
      <Coin pos={[-75, 1, 30]} />
      <Coin pos={[-40, 1, 70]} />
      <Coin pos={[-85, 1, 80]} />
      {/* Bonus near fountain */}
      <Coin pos={[5,   1,  5]} />
      <Coin pos={[-5,  1,  5]} />
      <Coin pos={[5,   1, -5]} />

      {/* ── Goal ── */}
      <GoalTrigger
        pos={[0, 1, 90]}
        size={[10, 4, 10]}
        result={{
          kind: 'win',
          label: 'ГОРОД ИССЛЕДОВАН!',
          subline: 'Ты побывал во всех районах!',
        }}
      />
    </>
  )
}
