import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { canPostfx } from '../../lib/deviceTier'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Crystal, MushroomGlow, Lantern, Well, Rock, TreeRound, Chest, CrystalCluster, BossGolem, PalmTree, IceBlock, Jellyfish, CoralReef, Anchor, Seaweed, VikingShip, Whale, Submarine, GiantClam } from '../Scenery'

// ─── Bioluminescent plankton (InstancedMesh, 120 instances) ──────────────────
const BIO_COLORS = ['#00ffcc', '#4488ff', '#ff44aa']
const BIO_COUNT = 120

interface BioParticle { x: number; z: number; baseY: number; speed: number; phaseX: number; phaseZ: number; ampX: number; ampZ: number }

const BIO_DATA: BioParticle[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 83.7 + 251.3) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: BIO_COUNT }, (_, i) => ({
    x: (seed(i * 7.1) - 0.5) * 160,        // -80 to 80
    z: -10 - seed(i * 7.2) * 100,           // -10 to -110
    baseY: seed(i * 7.3) * 10,              // 0 to 10 (start offset within [0,12])
    speed: 0.3 + seed(i * 7.4) * 0.7,
    phaseX: seed(i * 7.5) * Math.PI * 2,
    phaseZ: seed(i * 7.6) * Math.PI * 2,
    ampX: 0.5 + seed(i * 7.7) * 1.0,
    ampZ: 0.3 + seed(i * 7.8) * 0.8,
  }))
})()

function BioPlankton() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Per-instance colors cycling through BIO_COLORS
  const colorArray = useMemo(() => {
    const arr = new Float32Array(BIO_COUNT * 3)
    const col = new THREE.Color()
    BIO_DATA.forEach((_, i) => {
      col.set(BIO_COLORS[i % BIO_COLORS.length]!)
      arr[i * 3]     = col.r
      arr[i * 3 + 1] = col.g
      arr[i * 3 + 2] = col.b
    })
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    BIO_DATA.forEach((p, i) => {
      // drift upward, reset when y > 12
      const rawY = (p.baseY + t * p.speed) % 12
      const y = rawY < 0 ? rawY + 12 : rawY
      const x = p.x + Math.sin(t * 0.6 + p.phaseX) * p.ampX
      const z = p.z + Math.cos(t * 0.5 + p.phaseZ) * p.ampZ
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BIO_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 5, 5]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
    </instancedMesh>
  )
}

// ─── Caustic floor shader ─────────────────────────────────────────────────────
const CAUSTIC_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const CAUSTIC_FRAG = `
uniform float iTime;
varying vec2 vUv;

float causticLayer(vec2 uv, float speed, float scale) {
  float t = iTime * speed;
  float c1 = abs(sin(uv.x * scale + t * 2.0) * sin(uv.y * scale + t * 1.5));
  float c2 = abs(sin((uv.x + uv.y) * scale * 0.7 + t * 1.8));
  float c3 = abs(sin((uv.x - uv.y) * scale * 0.5 + t * 2.3));
  return c1 * c2 + c3 * 0.3;
}

void main() {
  float c = causticLayer(vUv, 0.8, 18.0) * 0.5
           + causticLayer(vUv, 1.2, 12.0) * 0.35
           + causticLayer(vUv, 0.5, 25.0) * 0.15;
  c = clamp(c, 0.0, 1.0);
  vec3 col = vec3(0.0, 0.35 + c * 0.3, 0.5 + c * 0.2);
  gl_FragColor = vec4(col, c * 0.22);
}
`

function CausticFloor() {
  const enabled = canPostfx()
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  useFrame(({ clock }) => {
    if (enabled && matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })
  if (!enabled) return null
  return (
    <mesh position={[0, -0.5, -50]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CAUSTIC_VERT}
        fragmentShader={CAUSTIC_FRAG}
        uniforms={{ iTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

// ─── Bubble column ────────────────────────────────────────────────────────────
const BUBBLE_COL_COUNT = 12

interface BubbleColParticle { offsetX: number; offsetZ: number; baseY: number; speed: number; phase: number }

function makeBubbleColData(): BubbleColParticle[] {
  const seed = (n: number) => ((Math.sin(n * 113.9 + 337.1) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: BUBBLE_COL_COUNT }, (_, i) => ({
    offsetX: (seed(i * 3.1) - 0.5) * 0.6,
    offsetZ: (seed(i * 3.2) - 0.5) * 0.6,
    baseY: seed(i * 3.3) * 12,
    speed: 1.0 + seed(i * 3.4) * 1.5,
    phase: seed(i * 3.5) * Math.PI * 2,
  }))
}

function BubbleColumn({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => makeBubbleColData(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    data.forEach((b, i) => {
      const y = (b.baseY + t * b.speed) % 12
      dummy.position.set(position[0] + b.offsetX + Math.sin(t * 1.2 + b.phase) * 0.15, y, position[2] + b.offsetZ)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BUBBLE_COL_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#aaeeff" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── CausticsFloor — animated caustics light pattern on ocean floor ──────────
const CAUSTICS_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const CAUSTICS_FRAG = `
  uniform float iTime;
  varying vec2 vUv;

  float caustic(vec2 uv, float t) {
    vec2 p = uv * 6.0;
    float v = 0.0;
    for(int i = 0; i < 3; i++) {
      float fi = float(i);
      p += vec2(sin(t * 0.3 + fi * 1.7) * 0.5, cos(t * 0.4 + fi * 2.1) * 0.5);
      v += sin(p.x + sin(p.y + t * 0.5)) * 0.5 + 0.5;
      p = vec2(p.y - p.x, p.x + p.y) * 0.7;
    }
    return v / 3.0;
  }

  void main() {
    float c = caustic(vUv, iTime);
    float bright = pow(c, 2.5);
    gl_FragColor = vec4(0.1 + bright * 0.3, 0.3 + bright * 0.5, 0.5 + bright * 0.4, 0.55);
  }
`

function CausticsFloor() {
  const enabled = canPostfx()
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  useFrame((_, dt) => { if (enabled && matRef.current) matRef.current.uniforms.iTime!.value += dt })
  if (!enabled) return null
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} renderOrder={1}>
      <planeGeometry args={[120, 120, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CAUSTICS_VERT}
        fragmentShader={CAUSTICS_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── BubbleStream — 3 streams of rising bubbles from the seafloor ─────────────
function BubbleStream() {
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const COUNT = 90
  const ref = useRef<THREE.InstancedMesh>(null!)
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => {
      const stream = Math.floor(i / 30)
      const sx = [-15, 5, 20][stream]!
      const sz = [-10, 15, -20][stream]!
      return { x: sx + (Math.random() - 0.5) * 2, y: Math.random() * 20 - 1, z: sz + (Math.random() - 0.5) * 2, speed: Math.random() * 0.04 + 0.02, wobble: Math.random() * Math.PI * 2 }
    }), [])
  useFrame((_, dt) => {
    particles.forEach((p, i) => {
      p.y += p.speed
      p.wobble += dt * 2
      if (p.y > 20) p.y = -1
      dummy.position.set(p.x + Math.sin(p.wobble) * 0.3, p.y, p.z)
      dummy.scale.setScalar(0.12 + Math.sin(p.wobble) * 0.04)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#88ccff" transparent opacity={0.4} />
    </instancedMesh>
  )
}

// ─── Water surface caustics shader ───────────────────────────────────────────
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
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
  void main(){
    vec2 uv=vUv*8.+vec2(iTime*.05);
    float caustic=noise(uv)*noise(uv*1.7+vec2(1.3,0.8))*2.;
    vec3 col=mix(vec3(0.,.4,.8),vec3(0.,.7,1.),caustic);
    gl_FragColor=vec4(col,.55);
  }
`

// ─── Water surface ────────────────────────────────────────────────────────────
function WaterSurface() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })
  return (
    <mesh position={[0, 12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[220, 220, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        uniforms={{ iTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

// ─── Underwater fog planes ────────────────────────────────────────────────────
function UnderwaterFog() {
  const planes: { y: number; size: number; opacity: number }[] = [
    { y: 2, size: 240, opacity: 0.12 },
    { y: 5, size: 220, opacity: 0.10 },
    { y: 9, size: 200, opacity: 0.08 },
  ]
  return (
    <>
      {planes.map((p, i) => (
        <mesh key={i} position={[0, p.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial
            color="#001840"
            transparent
            opacity={p.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Coral pillars ────────────────────────────────────────────────────────────
function CoralPillar({ pos, height, color }: { pos: [number, number, number]; height: number; color: string }) {
  return (
    <mesh position={[pos[0], pos[1] + height / 2, pos[2]]}>
      <cylinderGeometry args={[0.3, 0.4, height, 7]} />
      <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  )
}

// ─── Kelp forest ─────────────────────────────────────────────────────────────
interface KelpData { x: number; z: number; height: number; phase: number }

function KelpForest() {
  const kelpData = useMemo<KelpData[]>(() => {
    const seed = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: 20 }, (_, i) => ({
      x: (seed(i * 3.1) - 0.5) * 120,
      z: -20 - seed(i * 3.2) * 80,
      height: 5 + seed(i * 3.3) * 4,
      phase: seed(i * 3.4) * Math.PI * 2,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    kelpData.forEach((k, i) => {
      const m = meshRefs.current[i]
      if (!m) return
      m.rotation.x = Math.sin(t * 0.9 + k.phase) * 0.10
      m.rotation.z = Math.cos(t * 0.7 + k.phase) * 0.08
    })
  })

  return (
    <>
      {kelpData.map((k, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[k.x, k.height / 2, k.z]}
        >
          <cylinderGeometry args={[0.12, 0.16, k.height, 5]} />
          <meshStandardMaterial color="#00aa44" roughness={0.6} emissive="#005522" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </>
  )
}

// ─── Ocean fish (InstancedMesh) ───────────────────────────────────────────────
interface FishData { cx: number; cz: number; y: number; speed: number; radius: number; phase: number; color: string }

const FISH_COLORS = ['#ff6633', '#ffcc00', '#ff44aa', '#44ddff', '#88ff44', '#ff8844', '#66aaff', '#ff55ee']

const FISH_DATA: FishData[] = Array.from({ length: 20 }, (_, i) => {
  const seed = (n: number) => ((Math.sin(n * 91.3 + 127.1) * 43758.5453) % 1 + 1) % 1
  return {
    cx: (seed(i * 5.1) - 0.5) * 140,
    cz: -10 - seed(i * 5.2) * 90,
    y: 1 + seed(i * 5.3) * 7,
    speed: 0.4 + seed(i * 5.4) * 0.9,
    radius: 4 + seed(i * 5.5) * 10,
    phase: seed(i * 5.6) * Math.PI * 2,
    color: FISH_COLORS[i % FISH_COLORS.length]!,
  }
})

function OceanFish() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Build per-instance color array (set once)
  const colorArray = useMemo(() => {
    const arr = new Float32Array(20 * 3)
    const col = new THREE.Color()
    FISH_DATA.forEach((f, i) => {
      col.set(f.color)
      arr[i * 3] = col.r
      arr[i * 3 + 1] = col.g
      arr[i * 3 + 2] = col.b
    })
    return arr
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    FISH_DATA.forEach((f, i) => {
      const angle = t * f.speed + f.phase
      dummy.position.set(
        f.cx + Math.cos(angle) * f.radius,
        f.y + Math.sin(t * 0.4 + f.phase) * 0.3,
        f.cz + Math.sin(angle) * f.radius,
      )
      dummy.rotation.y = -angle + Math.PI / 2
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 20]} castShadow>
      <boxGeometry args={[0.5, 0.2, 0.8]} />
      <meshStandardMaterial vertexColors />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
    </instancedMesh>
  )
}

// ─── Oxygen bubbles ───────────────────────────────────────────────────────────
interface BubbleData { x: number; z: number; startY: number; speed: number; radius: number; phase: number }

function OxygenBubbles() {
  const bubbleData = useMemo<BubbleData[]>(() => {
    const seed = (n: number) => ((Math.sin(n * 53.7 + 199.3) * 43758.5453) % 1 + 1) % 1
    return Array.from({ length: 80 }, (_, i) => ({
      x: (seed(i * 4.1) - 0.5) * 180,
      z: (seed(i * 4.2) - 0.5) * 180,
      startY: 0,
      speed: 0.5 + seed(i * 4.3) * 1.2,
      radius: 0.06 + seed(i * 4.4) * 0.06,
      phase: seed(i * 4.5) * 50,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    bubbleData.forEach((b, i) => {
      const m = meshRefs.current[i]
      if (!m) return
      const y = ((t * b.speed + b.phase) % 12) + 0.1
      m.position.set(b.x + Math.sin(t * 0.3 + b.phase) * 0.3, y, b.z)
    })
  })

  return (
    <>
      {bubbleData.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[b.x, 0, b.z]}
        >
          <sphereGeometry args={[b.radius, 6, 6]} />
          <meshStandardMaterial
            color="#aaddff"
            transparent
            opacity={0.45}
            roughness={0.1}
            metalness={0.2}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Treasure Cave ────────────────────────────────────────────────────────────
function TreasureCave() {
  const cx = -30; const cz = -60
  return (
    <group position={[cx, 0, cz]}>
      {/* Cave arch: 3 dark grey boxes */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-3.5, 2.5, 0]} castShadow>
          <boxGeometry args={[2, 5, 3]} />
          <meshStandardMaterial color="#333344" roughness={0.95} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[3.5, 2.5, 0]} castShadow>
          <boxGeometry args={[2, 5, 3]} />
          <meshStandardMaterial color="#333344" roughness={0.95} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[9, 2, 3]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Interior treasure */}
      <Chest pos={[-1.5, 0, -2]} />
      <Chest pos={[1.5, 0, -2.5]} />
      <Crystal pos={[-2.5, 0, -3]} scale={1.3} />
      <Crystal pos={[0, 0, -3.5]} scale={1.1} />
      <Crystal pos={[2.5, 0, -2.8]} scale={1.4} />
      {/* Gold treasure light */}
      <pointLight position={[0, 1.5, -2]} color="#ffcc44" intensity={5} distance={12} />
      {/* Lanterns around entrance */}
      <Lantern pos={[-5, 0, 1]} />
      <Lantern pos={[5, 0, 1]} />
      <Lantern pos={[-5, 0, -1]} />
      <Lantern pos={[5, 0, -1]} />
    </group>
  )
}

// ─── Sunken Ship ──────────────────────────────────────────────────────────────
function SunkenShip() {
  const sx = 50; const sz = -50
  return (
    <group position={[sx, 0, sz]} rotation={[0, 0.4, 0]}>
      {/* Main hull */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 2.5, 0]} rotation={[0.12, 0, 0.08]} castShadow receiveShadow>
          <boxGeometry args={[12, 5, 30]} />
          <meshStandardMaterial color="#4a2e1a" roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Deck */}
      <mesh position={[0, 5.2, 0]} rotation={[0.12, 0, 0.08]} castShadow>
        <boxGeometry args={[10, 0.8, 28]} />
        <meshStandardMaterial color="#3a2010" roughness={0.95} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 9, -3]} rotation={[0.12, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 8, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {/* Broken sections */}
      <mesh position={[4, 1.5, 10]} rotation={[0.3, 0.5, 0.4]} castShadow>
        <boxGeometry args={[5, 2, 6]} />
        <meshStandardMaterial color="#3a2010" roughness={0.95} />
      </mesh>
      <mesh position={[-5, 1, -12]} rotation={[-0.2, -0.3, 0.5]} castShadow>
        <boxGeometry args={[4, 1.5, 7]} />
        <meshStandardMaterial color="#4a2e1a" roughness={0.9} />
      </mesh>
      <mesh position={[3, 0.8, -14]} rotation={[0.15, 0.8, -0.3]} castShadow>
        <boxGeometry args={[6, 1.2, 4]} />
        <meshStandardMaterial color="#3a2010" roughness={0.95} />
      </mesh>
      {/* Algae on ship */}
      <MushroomGlow pos={[-2, 5.5, 5]} scale={0.8} />
      <MushroomGlow pos={[3, 5.5, -2]} scale={0.9} />
      <MushroomGlow pos={[-4, 5.5, -6]} scale={0.7} />
      <MushroomGlow pos={[2, 5.5, -10]} scale={1.1} />
      {/* Ghostly glow inside ship */}
      <pointLight position={[0, 3, 0]} color="#44ffcc" intensity={1.5} distance={15} />
    </group>
  )
}

// ─── Coral reef zones ─────────────────────────────────────────────────────────
function ReefZoneNE() {
  // NE: [40,0,-40], red/pink coral
  const base: [number, number, number] = [40, 0, -40]
  return (
    <group position={base}>
      <Crystal pos={[-4, 0, -2]} scale={1.4} />
      <Crystal pos={[-1, 0, -4]} scale={1.1} />
      <Crystal pos={[2, 0, -3]} scale={1.6} />
      <Crystal pos={[4, 0, -1]} scale={1.0} />
      <Crystal pos={[0, 0, 2]} scale={1.3} />
      <Crystal pos={[-3, 0, 3]} scale={0.9} />
      <Rock pos={[-6, 0, 0]} />
      <Rock pos={[-4, 0, 4]} />
      <Rock pos={[5, 0, 3]} />
      <Rock pos={[6, 0, -2]} />
      <Rock pos={[2, 0, 5]} />
      <Rock pos={[-2, 0, -6]} />
      <Rock pos={[4, 0, -5]} />
      <Rock pos={[-5, 0, -4]} />
      <CoralPillar pos={[1, 0, -7]} height={5.5} color="#ff4488" />
      <CoralPillar pos={[-7, 0, 2]} height={6.5} color="#ff6699" />
      <CoralPillar pos={[7, 0, 1]} height={4.5} color="#ff2266" />
      <pointLight position={[0, 3, 0]} color="#ff4488" intensity={2} distance={20} />
    </group>
  )
}

function ReefZoneNW() {
  // NW: [-40,0,-40], purple coral
  const base: [number, number, number] = [-40, 0, -40]
  return (
    <group position={base}>
      <Crystal pos={[-3, 0, -2]} scale={1.3} />
      <Crystal pos={[0, 0, -4]} scale={1.5} />
      <Crystal pos={[3, 0, -3]} scale={1.1} />
      <Crystal pos={[-1, 0, 2]} scale={1.4} />
      <Crystal pos={[4, 0, 2]} scale={0.9} />
      <MushroomGlow pos={[-5, 0, 0]} scale={1.0} />
      <MushroomGlow pos={[-2, 0, 4]} scale={1.2} />
      <MushroomGlow pos={[2, 0, 5]} scale={0.8} />
      <MushroomGlow pos={[5, 0, -1]} scale={1.1} />
      <MushroomGlow pos={[-4, 0, -5]} scale={0.9} />
      <MushroomGlow pos={[1, 0, -6]} scale={1.3} />
      <CoralPillar pos={[-6, 0, -3]} height={7} color="#9933ff" />
      <CoralPillar pos={[5, 0, 3]} height={5} color="#cc44ff" />
      <CoralPillar pos={[0, 0, 6]} height={6} color="#7700cc" />
      <pointLight position={[0, 3, 0]} color="#9933ff" intensity={2} distance={20} />
    </group>
  )
}

function ReefZoneSouth() {
  // Center-South: [0,0,-80], orange coral
  const base: [number, number, number] = [0, 0, -80]
  return (
    <group position={base}>
      <Crystal pos={[-4, 0, -1]} scale={1.5} />
      <Crystal pos={[-1, 0, -3]} scale={1.2} />
      <Crystal pos={[2, 0, -4]} scale={1.6} />
      <Crystal pos={[4, 0, 0]} scale={1.0} />
      <Crystal pos={[0, 0, 3]} scale={1.4} />
      <Crystal pos={[-3, 0, 3]} scale={1.1} />
      <Crystal pos={[3, 0, 2]} scale={0.9} />
      <Rock pos={[-5, 0, -3]} />
      <Rock pos={[5, 0, -2]} />
      <Rock pos={[-6, 0, 2]} />
      <Rock pos={[6, 0, 2]} />
      <Rock pos={[0, 0, -6]} />
      <CoralPillar pos={[-7, 0, 0]} height={6} color="#ff7722" />
      <CoralPillar pos={[7, 0, -1]} height={5} color="#ffaa00" />
      <CoralPillar pos={[0, 0, 7]} height={7} color="#ff5500" />
      <pointLight position={[0, 3, 0]} color="#ff7722" intensity={2} distance={20} />
    </group>
  )
}

// ─── Ocean floor details ──────────────────────────────────────────────────────
function FloorDetails() {
  const seed = (n: number) => ((Math.sin(n * 73.1 + 211.7) * 43758.5453) % 1 + 1) % 1
  const rocks: [number, number, number][] = Array.from({ length: 15 }, (_, i) => [
    (seed(i * 6.1) - 0.5) * 160,
    0,
    -10 - seed(i * 6.2) * 170,
  ])
  const wells: [number, number, number][] = Array.from({ length: 6 }, (_, i) => [
    (seed(i * 8.1 + 100) - 0.5) * 140,
    0,
    -20 - seed(i * 8.2 + 100) * 150,
  ])
  const anemones: [number, number, number][] = Array.from({ length: 8 }, (_, i) => [
    (seed(i * 9.1 + 200) - 0.5) * 130,
    0,
    -15 - seed(i * 9.2 + 200) * 140,
  ])
  return (
    <>
      {rocks.map((pos, i) => <Rock key={`r${i}`} pos={pos} />)}
      {wells.map((pos, i) => <Well key={`w${i}`} pos={pos} />)}
      {anemones.map((pos, i) => <TreeRound key={`a${i}`} pos={pos} scale={0.7 + (i % 3) * 0.2} />)}
    </>
  )
}

// ─── Coins ────────────────────────────────────────────────────────────────────
function OceanCoins() {
  const seed = (n: number) => ((Math.sin(n * 61.3 + 177.7) * 43758.5453) % 1 + 1) % 1
  const positions: [number, number, number][] = [
    // Reef NE zone
    [37, 1, -38], [41, 1, -43], [44, 1, -38], [38, 1, -44], [43, 1, -41],
    // Reef NW zone
    [-38, 1, -37], [-43, 1, -42], [-37, 1, -44], [-41, 1, -38], [-44, 1, -41],
    // Reef South zone
    [-2, 1, -78], [3, 1, -83], [5, 1, -78], [-4, 1, -84], [1, 1, -82],
    // Treasure cave
    [-28, 1, -58], [-32, 1, -62], [-27, 1, -64], [-33, 1, -57], [-30, 1, -65],
    // Sunken ship area
    [48, 1, -48], [53, 1, -52], [47, 1, -54], [52, 1, -46], [55, 1, -50],
  ]
  return (
    <>
      {positions.map((pos, i) => <Coin key={i} pos={pos} />)}
    </>
  )
}

// ─── Atmosphere lights ────────────────────────────────────────────────────────
function AtmosphereLights() {
  return (
    <>
      {/* Main underwater blue ambient */}
      <pointLight position={[0, 15, 0]} color="#0060ff" intensity={2} distance={200} />
      {/* Ambient fill */}
      <ambientLight color="#002244" intensity={0.6} />
      <directionalLight position={[30, 20, 10]} color="#004488" intensity={0.5} />
      {/* Deep glow near goal */}
      <pointLight position={[0, 4, -100]} color="#0088ff" intensity={1.5} distance={40} />
    </>
  )
}

// ─── Underwater light shafts ─────────────────────────────────────────────────
const SHAFT_POSITIONS: [number, number, number][] = [
  [-8, 14, -15],
  [5, 14, -30],
  [-12, 14, -45],
  [8, 14, -25],
  [0, 14, -55],
]

function UnderwaterLightShafts() {
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.opacity = Math.sin(t * 0.3 + i) * 0.015 + 0.035
      // slow rotation via parent mesh — handled on the mesh refs below
    })
  })

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const dt = clock.getDelta()
    meshRefs.current.forEach((m) => {
      if (!m) return
      m.rotation.y += dt * 0.05
    })
  })

  return (
    <>
      {SHAFT_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={pos}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[2.5, 18, 8]} />
          <meshBasicMaterial
            ref={(el) => { matRefs.current[i] = el }}
            color="#44aaff"
            transparent
            opacity={0.035}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Deep sea fish (InstancedMesh, 15 instances) ──────────────────────────────
const DEEP_FISH_COUNT = 15

interface DeepFishData { cx: number; cz: number; baseY: number; speed: number; radius: number; phase: number }

const DEEP_FISH_DATA: DeepFishData[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 67.3 + 193.7) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: DEEP_FISH_COUNT }, (_, i) => ({
    cx: (seed(i * 6.1) - 0.5) * 20,          // -10 to 10
    cz: -20 - seed(i * 6.2) * 40,             // -20 to -60
    baseY: -1 - seed(i * 6.3) * 3,            // -1 to -4
    speed: 0.2 + seed(i * 6.4) * 0.4,         // 0.2 to 0.6 rad/s
    radius: 3 + seed(i * 6.5) * 5,
    phase: seed(i * 6.6) * Math.PI * 2,
  }))
})()

function DeepSeaFish() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    DEEP_FISH_DATA.forEach((f, i) => {
      const angle = t * f.speed + f.phase
      dummy.position.set(
        f.cx + Math.cos(angle) * f.radius,
        f.baseY + Math.sin(t * 0.15 + f.phase) * 0.3,
        f.cz + Math.sin(angle) * f.radius,
      )
      dummy.rotation.y = -angle + Math.PI / 2
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DEEP_FISH_COUNT]}>
      <boxGeometry args={[0.6, 0.2, 0.15]} />
      <meshStandardMaterial color="#0044aa" />
    </instancedMesh>
  )
}

// ─── Bioluminescence — 50 deep glowing orbs ──────────────────────────────────
const BIO_ORB_COUNT = 50

interface BioOrbData {
  baseX: number
  baseZ: number
  baseY: number
  orbitR: number
  orbitSpeed: number
  phase: number
  pulsePhase: number
}

const BIO_ORB_DATA: BioOrbData[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 97.3 + 157.9) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: BIO_ORB_COUNT }, (_, i) => ({
    baseX:      (seed(i * 11.1) - 0.5) * 120,         // -60 to 60
    baseZ:      -30 - seed(i * 11.2) * 80,             // -30 to -110
    baseY:      -0.5 + seed(i * 11.3) * 4.5,           // -0.5 to 4
    orbitR:     0.2 + seed(i * 11.4) * 0.6,            // 0.2 to 0.8
    orbitSpeed: 0.3 + seed(i * 11.5) * 0.9,            // 0.3 to 1.2
    phase:      seed(i * 11.6) * Math.PI * 2,
    pulsePhase: seed(i * 11.7) * Math.PI * 2,
  }))
})()

function Bioluminescence() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    BIO_ORB_DATA.forEach((o, i) => {
      // Lazy Lissajous drift + vertical bob
      const x = o.baseX + Math.sin(t * o.orbitSpeed + o.phase) * o.orbitR
      const z = o.baseZ + Math.cos(t * o.orbitSpeed * 0.7 + o.phase + 1.1) * o.orbitR
      const y = o.baseY + Math.sin(t * 0.4 + o.phase) * 0.5
      const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.8 + o.pulsePhase))
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(pulse)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BIO_ORB_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.12, 5, 4]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── Sea anemones — 12 animated clusters ─────────────────────────────────────
const ANEMONE_COLORS = ['#ff6688', '#ff8844', '#cc44ff', '#44ddff'] as const
const ANEMONE_COUNT = 12
const TENTACLE_COUNT = 8

// Positions scattered on seafloor, avoiding giant clam spots
const ANEMONE_POSITIONS: [number, number, number][] = [
  [ -8, 0, -38], [ 15, 0, -43], [-30, 0, -48], [ 35, 0, -52],
  [-48, 0, -60], [ 52, 0, -65], [-15, 0, -70], [ 28, 0, -72],
  [-38, 0, -78], [  5, 0, -82], [-55, 0, -88], [ 48, 0, -95],
]

function SeaAnemones() {
  // Refs for all tentacle groups — flattened: ANEMONE_COUNT * TENTACLE_COUNT entries
  const tentacleRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    tentacleRefs.current.forEach((grp, idx) => {
      if (!grp) return
      const aIdx = Math.floor(idx / TENTACLE_COUNT)
      grp.rotation.x = Math.sin(t * 1.5 + aIdx * 0.4) * 0.3
    })
  })

  return (
    <>
      {ANEMONE_POSITIONS.map((pos, aIdx) => {
        const color = ANEMONE_COLORS[aIdx % ANEMONE_COLORS.length]!
        return (
          <group key={aIdx} position={pos}>
            {/* Anemone base */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 0.6, 8]} />
              <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            {/* 8 tentacles fanning outward */}
            {Array.from({ length: TENTACLE_COUNT }, (_, tIdx) => {
              const flatIdx = aIdx * TENTACLE_COUNT + tIdx
              const angle = (tIdx / TENTACLE_COUNT) * Math.PI * 2
              const tiltOut = 0.45  // radians outward lean
              return (
                <group
                  key={tIdx}
                  ref={(el) => { tentacleRefs.current[flatIdx] = el }}
                  position={[
                    Math.sin(angle) * 0.18,
                    0.6,
                    Math.cos(angle) * 0.18,
                  ]}
                  rotation={[tiltOut, 0, 0]}
                  // spin each tentacle around its own axis to fan out
                  onUpdate={(self) => { self.rotation.y = angle }}
                >
                  <mesh position={[0, 0.35, 0]}>
                    <cylinderGeometry args={[0.04, 0.02, 0.7, 5]} />
                    <meshStandardMaterial color={color} roughness={0.6} emissive={color} emissiveIntensity={0.4} />
                  </mesh>
                </group>
              )
            })}
            {/* Per-anemone point light */}
            <pointLight color={color} intensity={0.8} distance={5} />
          </group>
        )
      })}
    </>
  )
}

// ─── Coral ridge — 8 branching pillars along the east side ───────────────────
interface CoralRidgePillarProps {
  pos: [number, number, number]
  height: number
  color: string
}

function CoralRidgePillar({ pos, height, color }: CoralRidgePillarProps) {
  // 2–3 stacked tapered segments simulating branching coral
  const segments = height > 2.5 ? 3 : 2
  const segH = height / segments
  return (
    <group position={pos}>
      {Array.from({ length: segments }, (_, s) => {
        const baseR = 0.28 - s * 0.07
        const topR  = Math.max(0.08, baseR - 0.08)
        const lean  = s === 0 ? 0 : (s % 2 === 0 ? 0.12 : -0.10)
        return (
          <mesh key={s} position={[lean, s * segH + segH / 2, 0]}>
            <cylinderGeometry args={[topR, baseR, segH, 7]} />
            <meshStandardMaterial
              color={color}
              roughness={0.65}
              emissive={color}
              emissiveIntensity={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function CoralRidge() {
  // 8 pillars on east side: x 45–55, z -40 to -90 spread evenly
  const RIDGE_COLORS = ['#ff7744', '#ff5599'] as const
  const pillars = Array.from({ length: 8 }, (_, i) => {
    const seed = (n: number) => ((Math.sin(n * 43.7 + 89.3) * 43758.5453) % 1 + 1) % 1
    return {
      x:      45 + seed(i * 5.1) * 10,           // 45–55
      z:      -40 - (i / 7) * 50,                 // -40 to -90 evenly
      height: 1.5 + seed(i * 5.2) * 2.0,          // 1.5–3.5
      color:  RIDGE_COLORS[i % 2]!,
    }
  })
  return (
    <>
      {pillars.map((p, i) => (
        <CoralRidgePillar
          key={i}
          pos={[p.x, 0, p.z]}
          height={p.height}
          color={p.color}
        />
      ))}
    </>
  )
}

// ─── Swimming whale ───────────────────────────────────────────────────────────
function SwimmingWhale() {
  const grpRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (!grpRef.current) return
    const t = clock.elapsedTime * 0.12
    // Giant lazy arc through the ocean — slow elliptical swim path
    grpRef.current.position.x = Math.sin(t) * 55
    grpRef.current.position.y = -1 + Math.sin(t * 2.3) * 1.8
    grpRef.current.position.z = -50 + Math.cos(t) * 45
    // Face direction of travel
    grpRef.current.rotation.y = -t - Math.PI / 2
    // Gentle roll
    grpRef.current.rotation.z = Math.sin(t * 2) * 0.08
  })
  return (
    <group ref={grpRef}>
      <Whale pos={[0, 0, 0]} scale={5.5} />
      {/* Soft blue glow from whale's presence */}
      <pointLight color="#4488ff" intensity={3} distance={25} />
    </group>
  )
}

// ─── FishSchool — 40 tropical fish swimming as a unit ────────────────────────
const SCHOOL_COUNT = 40

interface SchoolFishOffset { dx: number; dy: number; dz: number; bobPhase: number; bobAmp: number }

const SCHOOL_OFFSETS: SchoolFishOffset[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 137.5 + 421.3) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: SCHOOL_COUNT }, (_, i) => ({
    dx: (seed(i * 4.1) - 0.5) * 10,
    dy: (seed(i * 4.2) - 0.5) * 10,
    dz: (seed(i * 4.3) - 0.5) * 10,
    bobPhase: seed(i * 4.4) * Math.PI * 2,
    bobAmp:   0.1 + seed(i * 4.5) * 0.3,
  }))
})()

function FishSchool() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  // Store previous school position to compute velocity direction
  const prevPos = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // School center orbit
    const sx = Math.sin(t * 0.15) * 30
    const sz = Math.cos(t * 0.1)  * 25
    const sy = 5 + Math.sin(t * 0.3) * 3

    // Velocity (central diff would be ideal, but forward diff is fine here)
    const dt = 0.016
    const nx = Math.sin((t + dt) * 0.15) * 30
    const nz = Math.cos((t + dt) * 0.1)  * 25
    const vx = nx - sx
    const vz = nz - sz
    const facingY = Math.atan2(vx, vz)

    prevPos.current.set(sx, sy, sz)

    SCHOOL_OFFSETS.forEach((o, i) => {
      const bobY = Math.sin(t * 1.2 + o.bobPhase) * o.bobAmp
      dummy.position.set(sx + o.dx, sy + o.dy + bobY, sz + o.dz)
      dummy.scale.set(2, 0.6, 0.8)
      dummy.rotation.set(0, facingY, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SCHOOL_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.5, 8, 6]} />
      <meshStandardMaterial
        color="#ff6633"
        roughness={0.5}
        emissive="#ff3300"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  )
}

// ─── SharkSilhouette — large shark patrolling at depth ───────────────────────
function SharkSilhouette() {
  const grpRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t  = clock.getElapsedTime()
    const r  = 50
    const spd = 0.03
    const x  = Math.sin(t * spd) * r
    const z  = -50 + Math.cos(t * spd) * r
    const y  = 2

    // Velocity direction for facing
    const dt = 0.016
    const nx = Math.sin((t + dt) * spd) * r
    const nz = -50 + Math.cos((t + dt) * spd) * r
    const facingY = Math.atan2(nx - x, nz - z)

    if (grpRef.current) {
      grpRef.current.position.set(x, y, z)
      grpRef.current.rotation.y = facingY
    }
  })

  return (
    <group ref={grpRef}>
      {/* Body */}
      <mesh scale={[4, 0.8, 1.2]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#556677" roughness={0.7} />
      </mesh>
      {/* Dorsal fin */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.4, 1.5, 3]} />
        <meshStandardMaterial color="#445566" roughness={0.7} />
      </mesh>
      {/* Tail — two thin boxes angled at the rear */}
      <mesh position={[-3.5, 0.4, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[1.4, 0.12, 0.5]} />
        <meshStandardMaterial color="#445566" roughness={0.7} />
      </mesh>
      <mesh position={[-3.5, -0.4, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[1.4, 0.12, 0.5]} />
        <meshStandardMaterial color="#445566" roughness={0.7} />
      </mesh>
      {/* Pectoral fins — flat cones at sides */}
      <mesh position={[0.5, -0.3, 1.2]} rotation={[0.6, 0, 0.3]}>
        <coneGeometry args={[0.25, 1.0, 3]} />
        <meshStandardMaterial color="#445566" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, -0.3, -1.2]} rotation={[-0.6, 0, 0.3]}>
        <coneGeometry args={[0.25, 1.0, 3]} />
        <meshStandardMaterial color="#445566" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─── CoralPolyps — animated coral polyp tentacle clusters on the sea floor ───
const POLYP_COUNT  = 20
const POLYP_COLORS = ['#ff88aa', '#ff8844', '#ffcc44'] as const

interface PolypClusterData { x: number; z: number; colorIdx: number; phase: number }

const POLYP_CLUSTER_DATA: PolypClusterData[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 59.7 + 341.1) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: POLYP_COUNT }, (_, i) => ({
    x:        (seed(i * 3.7) - 0.5) * 140,
    z:        -5 - seed(i * 3.8) * 100,
    colorIdx: i % 3,
    phase:    seed(i * 3.9) * Math.PI * 2,
  }))
})()

// 6 tentacles per polyp cluster arranged in a flower pattern
const TENTACLE_ANGLES = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)

function CoralPolyps() {
  // Flat array: POLYP_COUNT * 6 tentacle refs
  const tentRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    tentRefs.current.forEach((m, idx) => {
      if (!m) return
      const clusterIdx = Math.floor(idx / 6)
      const cluster    = POLYP_CLUSTER_DATA[clusterIdx]
      if (!cluster) return
      m.rotation.x = Math.sin(t * 0.8 + cluster.phase + idx * 0.3) * 0.2
    })
  })

  return (
    <>
      {POLYP_CLUSTER_DATA.map((c, ci) => {
        const color = POLYP_COLORS[c.colorIdx]!
        return (
          <group key={ci} position={[c.x, 0, c.z]}>
            {TENTACLE_ANGLES.map((angle, ti) => {
              const flatIdx = ci * 6 + ti
              const outX = Math.sin(angle) * 0.18
              const outZ = Math.cos(angle) * 0.18
              return (
                <mesh
                  key={ti}
                  ref={(el) => { tentRefs.current[flatIdx] = el }}
                  position={[outX, 0.3, outZ]}
                  rotation={[0.3, angle, 0]}
                >
                  <cylinderGeometry args={[0.08, 0.04, 0.6, 5]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.6}
                    emissive={color}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </>
  )
}

// ─── SunkenShipwreck — dramatic wooden ship resting on the seafloor ──────────
const WRECK_BASE: [number, number, number] = [-40, -1, -60]

// Moss growth: 40 small spheres scattered on hull surfaces
const MOSS_COUNT = 40
const MOSS_DATA: { x: number; y: number; z: number }[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 71.3 + 193.7) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: MOSS_COUNT }, (_, i) => ({
    x: (seed(i * 4.1) - 0.5) * 13,
    y: (seed(i * 4.2)) * 2.5,
    z: (seed(i * 4.3) - 0.5) * 12,
  }))
})()

// Treasure coins: 10 scattered from ship
const TREASURE_COIN_POS: [number, number, number][] = (() => {
  const seed = (n: number) => ((Math.sin(n * 89.3 + 271.1) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: 10 }, (_, i) => [
    WRECK_BASE[0] + (seed(i * 5.1) - 0.5) * 18,
    WRECK_BASE[1] + 0.25,
    WRECK_BASE[2] + (seed(i * 5.2) - 0.5) * 18,
  ])
})()

function SunkenShipwreck() {
  const mossRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  // Build moss instanced mesh once
  useMemo(() => {
    // Populated in useFrame after first render; pre-set positions here
  }, [])

  // Set moss positions on first frame
  const mossSet = useRef(false)
  useFrame(() => {
    if (mossSet.current || !mossRef.current) return
    mossSet.current = true
    MOSS_DATA.forEach((m, i) => {
      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mossRef.current.setMatrixAt(i, dummy.matrix)
    })
    mossRef.current.instanceMatrix.needsUpdate = true
  })

  const [bx, by, bz] = WRECK_BASE

  return (
    <group position={[bx, by, bz]}>
      {/* ── Hull ── tilted on side */}
      <mesh rotation={[0, 0, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[3, 2.5, 12]} />
        <meshStandardMaterial color="#4a2a0a" roughness={0.95} />
      </mesh>

      {/* ── Deck planks (6 thin boxes) ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 1.3 + i * 0.01, -5.5 + i * 2.2]}
          rotation={[0, 0, 0.3]}
          castShadow
        >
          <boxGeometry args={[2.8, 0.08, 1.9]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.97} />
        </mesh>
      ))}

      {/* ── Broken mast ── fallen at angle */}
      <mesh position={[2, 0.3, -1]} rotation={[0, 0.3, 1.2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 6, 8]} />
        <meshStandardMaterial color="#4a2a0a" roughness={0.9} />
      </mesh>

      {/* ── Sail remnants (3 torn flaps) ── */}
      <mesh position={[1.8, 1.5, 0]} rotation={[0.2, 0.1, 1.1]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.8]} />
        <meshStandardMaterial color="#888866" transparent opacity={0.5} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[2.5, 0.5, 1.5]} rotation={[0.4, -0.2, 1.0]} castShadow>
        <boxGeometry args={[1.6, 0.05, 1.2]} />
        <meshStandardMaterial color="#888866" transparent opacity={0.5} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.5, 2.0, -2]} rotation={[-0.3, 0.3, 1.3]} castShadow>
        <boxGeometry args={[1.2, 0.05, 2.0]} />
        <meshStandardMaterial color="#888866" transparent opacity={0.5} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Bow figurehead (box shapes at front z=-6) ── */}
      <mesh position={[0, 1.4, -6.3]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.5]} />
        <meshStandardMaterial color="#4a2a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, -6.1]} rotation={[0.4, 0, 0.3]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.7]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>

      {/* ── Portholes (8 flat cylinders at hull sides) ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const side  = i < 4 ? 1.55 : -1.55
        const zi    = (i % 4) * 2.5 - 3.75
        return (
          <mesh key={i} position={[side, 0.4, zi]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 12]} />
            <meshStandardMaterial color="#333322" roughness={0.6} metalness={0.4} />
          </mesh>
        )
      })}

      {/* ── Anchor (box shapes) ── near stern */}
      {/* Ring */}
      <mesh position={[0.5, 0.6, 5.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.06, 8, 12]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Shank */}
      <mesh position={[0.5, -0.3, 5.5]}>
        <boxGeometry args={[0.1, 1.4, 0.1]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Flukes */}
      <mesh position={[0.5, -1.0, 5.7]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.7]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0.5, -1.0, 5.3]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.7]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* Stock (cross bar) */}
      <mesh position={[0.5, 0.4, 5.5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.7, 0.08, 0.08]} />
        <meshStandardMaterial color="#444444" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* ── Treasure coins spilling out ── */}
      {TREASURE_COIN_POS.map(([cx, cy, cz], i) => (
        <mesh key={i} position={[cx - bx, cy - by, cz - bz]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial
            color="#ffcc00"
            roughness={0.2}
            metalness={0.8}
            emissive="#ffcc00"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ── Mossy growth (InstancedMesh 40 small spheres) ── */}
      <instancedMesh ref={mossRef} args={[undefined, undefined, MOSS_COUNT]}>
        <sphereGeometry args={[0.2, 5, 4]} />
        <meshStandardMaterial color="#225522" roughness={0.9} />
      </instancedMesh>

      {/* ── Interior atmospheric glow ── */}
      <pointLight color="#1a4a4a" intensity={2} distance={10} position={[0, 0.5, 0]} />
    </group>
  )
}

// ─── MiniSubmarine — bright yellow research sub orbiting the shipwreck ────────
const SUB_ORBIT_CENTER: [number, number, number] = [-40, 2, -60]
const SUB_ORBIT_RADIUS = 15

function MiniSubmarine() {
  const grpRef      = useRef<THREE.Group>(null!)
  const propRef     = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Slow orbit around shipwreck
    const angle = t * 0.25
    const x = SUB_ORBIT_CENTER[0] + Math.cos(angle) * SUB_ORBIT_RADIUS
    const z = SUB_ORBIT_CENTER[2] + Math.sin(angle) * SUB_ORBIT_RADIUS
    const y = SUB_ORBIT_CENTER[1] + Math.sin(t * 0.4) * 1.2

    if (grpRef.current) {
      grpRef.current.position.set(x, y, z)
      // Face direction of travel
      const nx = SUB_ORBIT_CENTER[0] + Math.cos(angle + 0.016) * SUB_ORBIT_RADIUS
      const nz = SUB_ORBIT_CENTER[2] + Math.sin(angle + 0.016) * SUB_ORBIT_RADIUS
      grpRef.current.rotation.y = Math.atan2(nx - x, nz - z)
      // Gentle pitch bob
      grpRef.current.rotation.x = Math.sin(t * 0.4) * 0.08
    }

    // Propeller spin
    if (propRef.current) {
      propRef.current.rotation.z += 0.15
    }
  })

  return (
    <group ref={grpRef}>
      {/* ── Body (sphere scaled) ── */}
      <mesh scale={[2.5, 1.2, 1.8]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Conning tower ── */}
      <mesh position={[0, 1.4, 0.3]}>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 10]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Periscope vertical ── */}
      <mesh position={[0, 2.35, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 7]} />
        <meshStandardMaterial color="#ccaa00" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Periscope horizontal bar */}
      <mesh position={[0, 2.75, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
        <meshStandardMaterial color="#ccaa00" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* ── Viewport windows (3 flat cylinders) ── */}
      {[-0.5, 0, 0.5].map((zOff, i) => (
        <mesh key={i} position={[2.4, 0, zOff]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.08, 12]} />
          <meshStandardMaterial
            color="#88aaff"
            transparent
            opacity={0.7}
            roughness={0.05}
            metalness={0.1}
            emissive="#4466ff"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ── Propeller (3 blades + hub) ── */}
      <group ref={propRef} position={[-2.6, 0, 0]}>
        {/* Hub */}
        <mesh>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color="#ccaa00" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* 3 blades */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a, i) => (
          <mesh
            key={i}
            position={[0, Math.sin(a) * 0.45, Math.cos(a) * 0.45]}
            rotation={[a, 0, 0.3]}
          >
            <boxGeometry args={[0.08, 0.9, 0.3]} />
            <meshStandardMaterial color="#ccaa00" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── Headlight cones ── */}
      <mesh position={[2.5, 0.15, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffeecc" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[2.5, 0.15, -0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#ffeecc" emissive="#ffeecc" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* ── Forward spotlight ── */}
      <pointLight position={[3.5, 0, 0]} color="#ffffcc" intensity={6} distance={15} />
    </group>
  )
}

// ─── AncientCityRuins — sunken Atlantis-like ruins on the seafloor ────────────
const RUIN_BASE: [number, number, number] = [40, 0, 30]

// 30 mossy sphere clusters scattered on building surfaces
const RUIN_MOSS_COUNT = 30
const RUIN_MOSS_DATA: { x: number; y: number; z: number; s: number }[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 61.9 + 317.1) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: RUIN_MOSS_COUNT }, (_, i) => ({
    x: (seed(i * 5.1) - 0.5) * 36,
    y: seed(i * 5.2) * 4.0,
    z: (seed(i * 5.3) - 0.5) * 36,
    s: 0.3 + seed(i * 5.4) * 0.3,
  }))
})()

function AncientCityRuins() {
  const mossRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const mossSet = useRef(false)

  useFrame(() => {
    if (mossSet.current || !mossRef.current) return
    mossSet.current = true
    RUIN_MOSS_DATA.forEach((m, i) => {
      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(m.s)
      dummy.updateMatrix()
      mossRef.current.setMatrixAt(i, dummy.matrix)
    })
    mossRef.current.instanceMatrix.needsUpdate = true
  })

  const [bx, by, bz] = RUIN_BASE

  return (
    <group position={[bx, by, bz]}>
      {/* ── Ancient plaza floor ── */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[40, 0.3, 40]} />
        <meshStandardMaterial color="#776655" roughness={0.95} />
      </mesh>

      {/* ── Decorative tile octagram on plaza (8 thin emissive boxes) ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 10
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, -0.34, Math.sin(angle) * r]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[6, 0.04, 0.5]} />
            <meshStandardMaterial
              color="#998866"
              emissive="#998866"
              emissiveIntensity={0.2}
              roughness={0.9}
            />
          </mesh>
        )
      })}

      {/* ── 4 column stumps ── */}
      {/* Column 1 — tall intact */}
      <mesh position={[-8, 2.0, -8]}>
        <cylinderGeometry args={[0.8, 0.8, 4, 10]} />
        <meshStandardMaterial color="#887766" roughness={0.9} />
      </mesh>
      {/* Column 2 — medium */}
      <mesh position={[8, 1.5, -8]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 10]} />
        <meshStandardMaterial color="#887766" roughness={0.9} />
      </mesh>
      {/* Column 3 — short/broken */}
      <mesh position={[-8, 1.0, 8]}>
        <cylinderGeometry args={[0.8, 0.85, 2, 10]} />
        <meshStandardMaterial color="#887766" roughness={0.9} />
      </mesh>
      {/* Column 4 — short/broken */}
      <mesh position={[8, 0.85, 8]}>
        <cylinderGeometry args={[0.8, 0.85, 1.7, 10]} />
        <meshStandardMaterial color="#887766" roughness={0.9} />
      </mesh>

      {/* ── Ruined arch A (slightly tilted) ── */}
      <group position={[-14, 0, 0]} rotation={[0, 0, 0.06]}>
        {/* Left pillar */}
        <mesh position={[-1.2, 2.0, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 4, 8]} />
          <meshStandardMaterial color="#887766" roughness={0.88} />
        </mesh>
        {/* Right pillar */}
        <mesh position={[1.2, 2.0, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 4, 8]} />
          <meshStandardMaterial color="#887766" roughness={0.88} />
        </mesh>
        {/* Lintel */}
        <mesh position={[0, 4.25, 0]}>
          <boxGeometry args={[3.2, 0.55, 1.0]} />
          <meshStandardMaterial color="#887766" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Ruined arch B (more tilt) ── */}
      <group position={[14, 0, 0]} rotation={[0, 0.3, -0.08]}>
        {/* Left pillar */}
        <mesh position={[-1.2, 2.0, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 4, 8]} />
          <meshStandardMaterial color="#887766" roughness={0.88} />
        </mesh>
        {/* Right pillar — shorter (broken) */}
        <mesh position={[1.2, 1.5, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 3, 8]} />
          <meshStandardMaterial color="#887766" roughness={0.88} />
        </mesh>
        {/* Lintel — slightly angled */}
        <mesh position={[0, 4.1, 0]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[3.2, 0.55, 1.0]} />
          <meshStandardMaterial color="#887766" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Temple pediment (triangular top, two angled flat boxes) ── */}
      <group position={[0, 0, -15]}>
        {/* Base of pediment */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[12, 0.4, 3]} />
          <meshStandardMaterial color="#998877" roughness={0.92} />
        </mesh>
        {/* Left angled gable */}
        <mesh position={[-3.6, 1.6, 0]} rotation={[0, 0, 0.48]}>
          <boxGeometry args={[7.5, 0.35, 2.8]} />
          <meshStandardMaterial color="#998877" roughness={0.92} />
        </mesh>
        {/* Right angled gable */}
        <mesh position={[3.6, 1.6, 0]} rotation={[0, 0, -0.48]}>
          <boxGeometry args={[7.5, 0.35, 2.8]} />
          <meshStandardMaterial color="#998877" roughness={0.92} />
        </mesh>
        {/* Ridgeline cap */}
        <mesh position={[0, 3.0, 0]}>
          <boxGeometry args={[1.2, 0.3, 2.8]} />
          <meshStandardMaterial color="#998877" roughness={0.92} />
        </mesh>
      </group>

      {/* ── Mossy overgrowth (InstancedMesh 30 spheres) ── */}
      <instancedMesh ref={mossRef} args={[undefined, undefined, RUIN_MOSS_COUNT]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#224422" roughness={0.95} />
      </instancedMesh>

      {/* ── Atmospheric glow ── */}
      <pointLight position={[0, 3, 0]} color="#aaccaa" intensity={1.5} distance={30} />
    </group>
  )
}

// ─── UnderwaterGarden — kelp forest + giant clam near the ruins ───────────────
const GARDEN_BASE: [number, number, number] = [55, 0, 20]

interface GardenKelpData { dx: number; dz: number; height: number; phase: number }

const GARDEN_KELP: GardenKelpData[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 79.3 + 263.7) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: 15 }, (_, i) => ({
    dx:     (seed(i * 6.1) - 0.5) * 22,
    dz:     (seed(i * 6.2) - 0.5) * 22,
    height: 6 + seed(i * 6.3) * 4,
    phase:  seed(i * 6.4) * Math.PI * 2,
  }))
})()

function UnderwaterGarden() {
  const kelpRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    GARDEN_KELP.forEach((k, i) => {
      const m = kelpRefs.current[i]
      if (!m) return
      m.rotation.z = Math.sin(t * 0.5 + k.phase) * 0.15
    })
  })

  const [bx, by, bz] = GARDEN_BASE

  return (
    <group position={[bx, by, bz]}>
      {/* ── Kelp stalks ── */}
      {GARDEN_KELP.map((k, i) => (
        <group key={i} position={[k.dx, 0, k.dz]}>
          {/* Stalk */}
          <mesh
            ref={(el) => { kelpRefs.current[i] = el }}
            position={[0, k.height / 2, 0]}
          >
            <cylinderGeometry args={[0.15, 0.18, k.height, 6]} />
            <meshStandardMaterial color="#336633" roughness={0.7} emissive="#1a3a1a" emissiveIntensity={0.15} />
          </mesh>
          {/* Frond at top */}
          <mesh position={[0, k.height + 0.4, 0]} scale={[1.8, 0.4, 1.8]}>
            <sphereGeometry args={[0.8, 8, 6]} />
            <meshStandardMaterial color="#448844" roughness={0.6} emissive="#224422" emissiveIntensity={0.15} />
          </mesh>
        </group>
      ))}

      {/* ── Giant clam (two flattened hemisphere halves) ── */}
      <group position={[0, 0, 5]}>
        {/* Bottom shell */}
        <mesh scale={[1.5, 0.5, 1.5]}>
          <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#eebbaa" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Top shell (slightly open) */}
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI, 0, 0]} scale={[1.5, 0.5, 1.5]}>
          <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#eebbaa" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        {/* Pearl inside */}
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial
            color="#eeeeff"
            emissive="#eeeeff"
            emissiveIntensity={3}
            roughness={0.05}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
        {/* Pearl glow */}
        <pointLight position={[0, 0.5, 0]} color="#ddeeff" intensity={4} distance={10} />
      </group>
    </group>
  )
}

// ─── BioluminescentPlankton — 200 tiny glowing plankton filling the water column
const PLANKTON_COUNT = 200

interface PlanktonData { x: number; y: number; z: number; phase: number }

const PLANKTON_DATA: PlanktonData[] = (() => {
  const seed = (n: number) => ((Math.sin(n * 53.1 + 179.9) * 43758.5453) % 1 + 1) % 1
  return Array.from({ length: PLANKTON_COUNT }, (_, i) => ({
    x:     (seed(i * 7.1) - 0.5) * 100,
    y:     seed(i * 7.2) * 25,
    z:     (seed(i * 7.3) - 0.5) * 100,
    phase: seed(i * 7.4) * Math.PI * 2,
  }))
})()

function BioluminescentPlankton() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const posSet  = useRef(false)

  // Set static positions once
  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // First frame: set base positions
    if (!posSet.current) {
      posSet.current = true
      PLANKTON_DATA.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z)
        dummy.scale.setScalar(0.1)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }

    // Animate only scale (pulse)
    const t = clock.getElapsedTime()
    PLANKTON_DATA.forEach((p, i) => {
      const s = 0.08 + Math.sin(t * 2 + p.phase) * 0.04
      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PLANKTON_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 3]} />
      <meshBasicMaterial
        color="#00ffaa"
        transparent
        opacity={0.7}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

// ─── Main world ───────────────────────────────────────────────────────────────
export default function OceanWorld() {
  return (
    <>
      {/* Sky — deep ocean blue */}
      <GradientSky top="#001840" bottom="#004888" radius={450} />

      {/* Atmosphere */}
      <AtmosphereLights />

      {/* Water surface (seen from below, caustic shader) */}
      <WaterSurface />

      {/* Underwater fog depth layers */}
      <UnderwaterFog />

      {/* ── Ocean floor ── */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.25, -50]} receiveShadow>
          <boxGeometry args={[200, 0.5, 200]} />
          <meshStandardMaterial color="#d4c88a" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Subtle floor texture variation patches */}
      {([
        [30, 0.01, -20, '#c8b870'] as const,
        [-40, 0.01, -60, '#ddd4a0'] as const,
        [10, 0.01, -90, '#c0b060'] as const,
        [-60, 0.01, -30, '#e0d8b0'] as const,
      ]).map(([x, y, z, col], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[18, 22, 0.02, 12]} />
          <meshStandardMaterial color={col} roughness={1} />
        </mesh>
      ))}

      {/* Boundary walls (invisible) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 5, 100]} visible={false}>
          <boxGeometry args={[210, 20, 1]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 5, -110]} visible={false}>
          <boxGeometry args={[210, 20, 1]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[100, 5, -10]} visible={false}>
          <boxGeometry args={[1, 20, 220]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-100, 5, -10]} visible={false}>
          <boxGeometry args={[1, 20, 220]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

      {/* ── Coral reef zones ── */}
      <ReefZoneNE />
      <ReefZoneNW />
      <ReefZoneSouth />

      {/* Extra cross-zone coral pillars */}
      <CoralPillar pos={[15, 0, -30]} height={6} color="#ff8833" />
      <CoralPillar pos={[-15, 0, -55]} height={5} color="#33aaff" />
      <CoralPillar pos={[25, 0, -70]} height={7} color="#ff44cc" />
      <CoralPillar pos={[-25, 0, -30]} height={4.5} color="#44ffaa" />

      {/* ── Kelp forest ── */}
      <KelpForest />

      {/* ── Treasure cave ── */}
      <TreasureCave />

      {/* ── Sunken ship ── */}
      <SunkenShip />

      {/* ── Ocean floor details ── */}
      <FloorDetails />

      {/* ── Giant clams — pearl glow on the ocean floor ── */}
      <GiantClam pos={[20, 0, -40]} scale={2.5} rotY={0.3} />
      <pointLight position={[20, 1, -40]} color="#ffeecc" intensity={2} distance={12} decay={2} />
      <GiantClam pos={[-25, 0, -55]} scale={3.0} rotY={1.2} />
      <pointLight position={[-25, 1, -55]} color="#ffeecc" intensity={2} distance={12} decay={2} />
      <GiantClam pos={[40, 0, -75]} scale={2.8} rotY={2.1} />
      <pointLight position={[40, 1, -75]} color="#ffeecc" intensity={2} distance={12} decay={2} />
      <GiantClam pos={[-50, 0, -85]} scale={2.2} rotY={0.8} />
      <pointLight position={[-50, 1, -85]} color="#ffeecc" intensity={2} distance={12} decay={2} />
      <GiantClam pos={[10, 0, -95]} scale={3.5} rotY={1.8} />
      <pointLight position={[10, 1, -95]} color="#ffeecc" intensity={2} distance={12} decay={2} />

      {/* ── Fish (InstancedMesh) ── */}
      <OceanFish />

      {/* ── Oxygen bubbles ── */}
      <OxygenBubbles />

      {/* ── Bioluminescent plankton ── */}
      <BioPlankton />

      {/* ── Caustic floor overlay ── */}
      <CausticFloor />

      {/* ── CausticsFloor — shimmering caustics light pattern on ocean bottom ── */}
      <CausticsFloor />

      {/* ── BubbleStream — 3 rising bubble streams from the seafloor ── */}
      <BubbleStream />

      {/* ── Bubble columns ── */}
      <BubbleColumn position={[-20, 0, -40]} />
      <BubbleColumn position={[ 30, 0, -70]} />
      <BubbleColumn position={[-60, 0, -80]} />
      <BubbleColumn position={[ 15, 0, -90]} />

      {/* ── Sea boss monsters ── */}
      <GltfMonster which="alien" pos={[0, 2, -100]} scale={2.0} animation="Wave" />
      <GltfMonster which="bunny" pos={[-20, 1, -40]} scale={0.9} animation="Idle" />
      <GltfMonster which="birb" pos={[30, 2, -60]} scale={1.0} animation="Wave" />

      {/* ── Enemy jellyfish ── */}
      <Enemy pos={[10, 3, -20]} patrolX={5} color="#ff88ff" />
      <Enemy pos={[-10, 4, -50]} patrolX={5} color="#ff88ff" />
      <Enemy pos={[20, 3, -75]} patrolX={5} color="#ff88ff" />

      {/* ── NPCs ── */}
      <NPC pos={[0, 0, 20]} label="РЫБАК" bodyColor="#4488ff" />
      <NPC pos={[20, 0, -20]} label="НЫРЯЛЬЩИК" bodyColor="#44aaff" />

      {/* ── Coins ── */}
      <OceanCoins />

      {/* ── CrystalCluster — ocean floor purple clusters ── */}
      <CrystalCluster pos={[-60, 0, -20]} scale={1.4} rotY={0.3} />
      <CrystalCluster pos={[60, 0, -35]} scale={1.2} rotY={1.1} />
      <CrystalCluster pos={[-20, 0, -75]} scale={1.6} rotY={2.0} />
      <CrystalCluster pos={[15, 0, -55]} scale={1.1} rotY={0.7} />
      <CrystalCluster pos={[-45, 0, -90]} scale={1.5} rotY={1.8} />
      <CrystalCluster pos={[70, 0, -70]} scale={1.3} rotY={0.5} />
      <CrystalCluster pos={[-70, 0, -55]} scale={1.0} rotY={2.5} />
      <CrystalCluster pos={[35, 0, -100]} scale={1.7} rotY={1.4} />

      {/* ── BossGolem — Морской Страж guarding the treasure cave ── */}
      <BossGolem pos={[-22, 0, -55]} scale={2.2} rotY={Math.PI * 0.75} />

      {/* ── PalmTree — shore line near the north entrance ── */}
      <PalmTree pos={[-25, 0, 75]} scale={1.3} rotY={0.2} />
      <PalmTree pos={[0, 0, 80]} scale={1.5} rotY={Math.PI} />
      <PalmTree pos={[25, 0, 75]} scale={1.2} rotY={3.0} />
      <PalmTree pos={[50, 0, 70]} scale={1.4} rotY={0.8} />

      {/* ── IceBlock — frozen coral structures ── */}
      <IceBlock pos={[-50, 0, -15]} scale={1.3} rotY={0.4} />
      <IceBlock pos={[45, 0, -25]} scale={1.1} rotY={1.9} />
      <IceBlock pos={[-10, 0, -95]} scale={1.5} rotY={0.9} />
      <IceBlock pos={[80, 0, -55]} scale={1.2} rotY={2.3} />

      {/* ── Jellyfish — drifting through the water column ── */}
      <Jellyfish pos={[12, 8, -18]} scale={1.2} />
      <Jellyfish pos={[-18, 6, -35]} scale={0.9} />
      <Jellyfish pos={[30, 4, -55]} scale={1.4} />
      <Jellyfish pos={[-8, 10, -65]} scale={1.0} />
      <Jellyfish pos={[55, 7, -40]} scale={1.3} />
      <Jellyfish pos={[-40, 5, -78]} scale={0.8} />
      <Jellyfish pos={[5, 3, -90]} scale={1.1} />
      <Jellyfish pos={[-62, 9, -45]} scale={1.4} />

      {/* ── CoralReef GLB props — scattered across ocean floor ── */}
      <CoralReef pos={[-55, 0, -20]} scale={1.2} rotY={0.4} />
      <CoralReef pos={[ 42, 0, -28]} scale={1.5} rotY={1.1} />
      <CoralReef pos={[-18, 0, -45]} scale={0.9} rotY={2.7} />
      <CoralReef pos={[ 28, 0, -38]} scale={1.3} rotY={0.8} />
      <CoralReef pos={[-62, 0, -62]} scale={1.6} rotY={1.9} />
      <CoralReef pos={[ 55, 0, -72]} scale={1.0} rotY={3.2} />
      <CoralReef pos={[-30, 0, -85]} scale={1.4} rotY={0.3} />
      <CoralReef pos={[ 10, 0, -58]} scale={0.8} rotY={2.1} />
      <CoralReef pos={[-45, 0, -32]} scale={1.1} rotY={1.5} />

      {/* ── Anchor GLB props — lost anchors near SunkenShip and TreasureCave ── */}
      {/* Near SunkenShip (sx=50, sz=-50) */}
      <Anchor pos={[ 44, 0, -43]} scale={1.1} rotY={0.6} />
      <Anchor pos={[ 58, 0, -55]} scale={1.3} rotY={2.2} />
      <Anchor pos={[ 47, 0, -60]} scale={0.9} rotY={1.4} />
      {/* Near TreasureCave (cx=-30, cz=-60) */}
      <Anchor pos={[-38, 0, -52]} scale={1.2} rotY={3.0} />

      {/* ── Seaweed — scattered on the seabed ── */}
      <Seaweed pos={[-5, 0, -20]} scale={1.5} />
      <Seaweed pos={[8, 0, -35]} scale={2.0} />
      <Seaweed pos={[-12, 0, -50]} scale={1.8} />
      <Seaweed pos={[3, 0, -15]} scale={2.5} />
      <Seaweed pos={[15, 0, -45]} scale={1.6} />
      <Seaweed pos={[-20, 0, -30]} scale={2.2} />

      {/* ── VikingShip — dramatic wreck near the sunken ship area ── */}
      <VikingShip pos={[25, 0, -60]} scale={3} rotY={0.8} />

      {/* ── Sunken Submarine — yellow sub lying on the ocean floor ── */}
      <Submarine pos={[-38, 0, -72]} scale={3.5} rotY={1.1} />
      <pointLight position={[-38, 2, -72]} color="#88ffaa" intensity={2} distance={18} decay={2} />

      {/* ── Underwater light shafts ── */}
      <UnderwaterLightShafts />

      {/* ── Deep sea fish ── */}
      <DeepSeaFish />

      {/* ── Swimming whale ── */}
      <SwimmingWhale />

      {/* ── Bioluminescence — deep glowing orbs ── */}
      <Bioluminescence />

      {/* ── Sea anemones — animated clusters on seafloor ── */}
      <SeaAnemones />

      {/* ── Coral ridge — east-side branching coral pillars ── */}
      <CoralRidge />

      {/* ── FishSchool — 40 tropical fish swimming as a unit ── */}
      <FishSchool />

      {/* ── SharkSilhouette — large shark patrolling at depth ── */}
      <SharkSilhouette />

      {/* ── CoralPolyps — animated polyp clusters on the seafloor ── */}
      <CoralPolyps />

      {/* ── SunkenShipwreck — dramatic wooden wreck on seafloor ── */}
      <SunkenShipwreck />

      {/* ── MiniSubmarine — research sub orbiting the wreck ── */}
      <MiniSubmarine />

      {/* ── AncientCityRuins — sunken Atlantis-like city on the seafloor ── */}
      <AncientCityRuins />

      {/* ── UnderwaterGarden — kelp forest and giant clam near the ruins ── */}
      <UnderwaterGarden />

      {/* ── BioluminescentPlankton — 200 tiny glowing plankton in the water column ── */}
      <BioluminescentPlankton />

      {/* ── Win trigger ── */}
      <GoalTrigger
        pos={[0, 3, -100]}
        size={[20, 5, 20]}
        result={{ kind: 'win', label: 'СОКРОВИЩА НАЙДЕНЫ!', subline: 'Ты исследовал океан!' }}
      />
    </>
  )
}

export const OCEAN_SPAWN: [number, number, number] = [0, 3, 10]
