import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import type { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Crystal, MushroomGlow, IceBlock, CrystalCluster, LavaRock, BossDragon } from '../Scenery'
import GradientSky from '../GradientSky'

// ─── Three zones ─────────────────────────────────────────────────────────────
// SKY     z: 0  → -42   pastel rainbow, fluffy clouds
// CRYSTAL z: -42 → -75  purple/cyan, moving platforms, crystal spires
// VOLCANO z: -75 → -105 red/orange, lava glow, final boss

interface Plat {
  pos: [number, number, number]
  size: [number, number, number]
  color: string
  emissive?: string
  moving?: true
  moveAxis?: 'x'
  moveRange?: number
  moveSpeed?: number
  phase?: number
}

const SKY_PLATS: Plat[] = [
  { pos: [0,   1.0, -5 ], size: [3.2, 0.7, 3.2], color: '#ffb3de' },
  { pos: [4,   1.5, -9 ], size: [2.8, 0.7, 2.8], color: '#ffe680' },
  { pos: [-3.5,2.2, -13], size: [3.0, 0.7, 3.0], color: '#a8f5a0' },
  { pos: [2.5, 2.8, -17], size: [2.6, 0.7, 2.6], color: '#88d8ff' },
  { pos: [-4,  3.4, -21], size: [3.2, 0.7, 3.2], color: '#e2b8ff' },
  { pos: [0,   4.0, -26], size: [4.2, 0.8, 4.2], color: '#ffc888' },
  { pos: [4.5, 4.6, -30], size: [2.6, 0.7, 2.6], color: '#ffb3de' },
  { pos: [-3,  5.2, -35], size: [3.0, 0.7, 3.0], color: '#ffe680' },
  { pos: [0,   5.8, -40], size: [5.0, 0.9, 5.0], color: '#c8ffc0', emissive: '#40d040' },
]

const CRYSTAL_PLATS: Plat[] = [
  { pos: [4,   6.4, -45], size: [2.6, 0.7, 2.6], color: '#7048e8', emissive: '#3828a0' },
  { pos: [-3.5,7.0, -50], size: [2.4, 0.7, 2.4], color: '#4888ff', emissive: '#2048b0' },
  { pos: [0,   7.5, -55], size: [3.0, 0.7, 3.0], color: '#48d0ff', emissive: '#208898',
    moving: true, moveAxis: 'x', moveRange: 3.5, moveSpeed: 1.1, phase: 0 },
  { pos: [4.5, 8.0, -60], size: [2.4, 0.7, 2.4], color: '#a050ff', emissive: '#602898' },
  { pos: [-4,  8.5, -65], size: [2.6, 0.7, 2.6], color: '#4888ff', emissive: '#2048b0',
    moving: true, moveAxis: 'x', moveRange: 4, moveSpeed: 1.4, phase: 1.5 },
  { pos: [0,   9.2, -72], size: [5.5, 0.9, 5.5], color: '#d080ff', emissive: '#8840b8' },
]

const VOLCANO_PLATS: Plat[] = [
  { pos: [4,   9.8, -77], size: [2.6, 0.7, 2.6], color: '#e83010', emissive: '#801008' },
  { pos: [-3.5,10.3,-82], size: [2.4, 0.7, 2.4], color: '#ff6010', emissive: '#a02808' },
  { pos: [0,  10.8, -87], size: [3.0, 0.7, 3.0], color: '#e83010', emissive: '#801008',
    moving: true, moveAxis: 'x', moveRange: 3.5, moveSpeed: 1.7, phase: 0.8 },
  { pos: [4.5,11.3, -92], size: [2.4, 0.7, 2.4], color: '#ff6010', emissive: '#a02808' },
  { pos: [-3, 11.8, -97], size: [2.6, 0.7, 2.6], color: '#e83010', emissive: '#801008' },
  { pos: [0,  12.8,-103], size: [7.5, 1.0, 7.5], color: '#ffd644', emissive: '#ff9900' },
]

const ALL_PLATS = [...SKY_PLATS, ...CRYSTAL_PLATS, ...VOLCANO_PLATS]

// ─── Static platform ──────────────────────────────────────────────────────────
function StaticBlock({ pos, size, color, emissive }: Plat) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? 0.3 : 0} roughness={0.8} />
      </mesh>
      {/* Glow rim */}
      <mesh scale={1.04}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </RigidBody>
  )
}

// ─── Moving platform ──────────────────────────────────────────────────────────
function MovingBlock({ pos, size, color, emissive, moveRange = 3, moveSpeed = 1.2, phase = 0 }: Plat) {
  const rbRef = useRef<RapierRigidBody>(null!)
  const base = useMemo(() => new THREE.Vector3(...pos), [pos])
  const next = useMemo(() => new THREE.Vector3(), [])
  const t = useRef(phase)

  useFrame((_, dt) => {
    t.current += dt * moveSpeed
    next.set(base.x + Math.sin(t.current) * moveRange, base.y, base.z)
    rbRef.current?.setNextKinematicTranslation(next)
  })

  return (
    <RigidBody ref={rbRef} type="kinematicPosition" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? 0.4 : 0} roughness={0.75} />
      </mesh>
      <mesh scale={1.06}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </RigidBody>
  )
}

// ─── Cloud ground ─────────────────────────────────────────────────────────────
const CLOUD_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
  varying vec2 vUv2;
  void main(){
    vec2 uv=vUv*5.+vec2(iTime*.012,0.);
    float c=fbm(uv);
    float alpha=smoothstep(.38,.68,c)*.88;
    gl_FragColor=vec4(1.,1.,1.,alpha);
  }
`
const CLOUD_VERT = `varying vec2 vUv;varying vec2 vUv2;void main(){vUv=uv;vUv2=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`

function CloudGround() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uni = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime() })
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -52]}>
        <mesh visible={false}><boxGeometry args={[220, 0.5, 220]} /></mesh>
      </RigidBody>
      <mesh position={[0, 0.05, -52]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <shaderMaterial ref={matRef} uniforms={uni} vertexShader={CLOUD_VERT} fragmentShader={CLOUD_FRAG} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

// ─── Star field ───────────────────────────────────────────────────────────────
function StarField() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const n = 900, p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2, r = 370 + Math.random() * 30
      p[i*3] = r*Math.sin(th)*Math.cos(ph); p[i*3+1] = Math.abs(r*Math.cos(th)) + 5; p[i*3+2] = r*Math.sin(th)*Math.sin(ph)
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  return <points geometry={geo}><pointsMaterial color="#ffffff" size={0.9} sizeAttenuation transparent opacity={0.85} /></points>
}

// ─── Floating island chunk below a platform ───────────────────────────────────
function Island({ pos }: { pos: [number, number, number] }) {
  const angle = useMemo(() => Math.random() * 0.3 - 0.15, [])
  return (
    <group position={pos} rotation={[angle, 0, angle * 0.5]}>
      <mesh>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.95} />
      </mesh>
      <mesh position={[0, -1, 0]} scale={[0.65, 1.6, 0.65]}>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#5a4030" roughness={0.98} />
      </mesh>
    </group>
  )
}

// ─── Crystal spire ────────────────────────────────────────────────────────────
function CrystalSpire({ pos, h = 3, color = '#8888ff' }: { pos:[number,number,number]; h?:number; color?:string }) {
  return (
    <group position={pos}>
      <mesh position={[0, h/2, 0]} castShadow>
        <coneGeometry args={[0.2, h, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.15} transparent opacity={0.82} />
      </mesh>
    </group>
  )
}

// ─── Lava floor (zone 3) ──────────────────────────────────────────────────────
const LAVA_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
  void main(){
    vec2 uv=vUv*3.+vec2(iTime*.04,iTime*.025);
    float f=fbm(uv);
    vec3 lava=mix(vec3(1.,.12,0.),vec3(1.,.55,0.),f);
    lava=mix(lava,vec3(1.,1.,.5),smoothstep(.62,.9,f));
    gl_FragColor=vec4(lava,1.);
  }
`
const UV_VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`

function LavaFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uni = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime() })
  return (
    <mesh position={[0, 1.0, -90]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 50]} />
      <shaderMaterial ref={matRef} uniforms={uni} vertexShader={UV_VERT} fragmentShader={LAVA_FRAG} />
    </mesh>
  )
}

// ─── SKY zone: cloud sparkles ────────────────────────────────────────────────
function SkySparkles() {
  const COUNT = 60
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    x: (Math.random() - 0.5) * 30,
    y: 3 + Math.random() * 9,
    z: -Math.random() * 40,
    radius: 0.04 + Math.random() * 0.04,
    speed: 0.6 + Math.random() * 1.0,
    phase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.3,
    driftZ: (Math.random() - 0.5) * 0.2,
  })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      const s = d.radius * (0.7 + 0.3 * Math.sin(t * d.speed + d.phase))
      dummy.position.set(
        d.x + Math.sin(t * 0.15 + d.phase) * d.driftX * 10,
        d.y + Math.sin(t * 0.4 + d.phase) * 0.5,
        d.z + Math.sin(t * 0.1 + d.phase) * d.driftZ * 10,
      )
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#ddeeff" transparent opacity={0.82} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── CRYSTAL zone: mist planes ───────────────────────────────────────────────
function CrystalMist() {
  const refs = useRef<THREE.Mesh[]>([])
  const data = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    x: (Math.random() - 0.5) * 28,
    y: Math.random() * 2,
    z: -42 - Math.random() * 33,
    speed: 0.04 + Math.random() * 0.06,
    phase: Math.random() * Math.PI * 2,
  })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((m, i) => {
      if (!m) return
      const d = data[i]!
      m.position.x = d.x + Math.sin(t * d.speed + d.phase) * 4
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh
          key={i}
          ref={el => { if (el) refs.current[i] = el }}
          position={[d.x, d.y, d.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[8, 8]} />
          <meshBasicMaterial color="#8844ff" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

// ─── CRYSTAL zone: glowing dust particles ────────────────────────────────────
function CrystalDust() {
  const COUNT = 40
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    cx: (Math.random() - 0.5) * 26,
    cy: 1 + Math.random() * 7,
    cz: -42 - Math.random() * 33,
    r: 1.5 + Math.random() * 2.5,
    speed: 0.3 + Math.random() * 0.5,
    phase: (i / COUNT) * Math.PI * 2,
    vPhase: Math.random() * Math.PI * 2,
  })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      dummy.position.set(
        d.cx + Math.cos(t * d.speed + d.phase) * d.r,
        d.cy + Math.sin(t * 0.5 + d.vPhase) * 0.8,
        d.cz + Math.sin(t * d.speed + d.phase) * d.r,
      )
      dummy.scale.setScalar(0.04)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color="#cc88ff" transparent opacity={0.7} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── VOLCANO zone: rising embers ─────────────────────────────────────────────
const EMBER_COLORS = ['#ff4400', '#ff8800', '#ffcc00']
function VolcanoEmbers() {
  const COUNT = 50
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    x: (Math.random() - 0.5) * 24,
    z: -75 - Math.random() * 30,
    y: Math.random() * 12,
    radius: 0.04 + Math.random() * 0.03,
    speed: 4 + Math.random() * 4,
    wobble: (Math.random() - 0.5) * 0.8,
    wobbleSpeed: 1 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    colorIdx: i % 3,
  })), [])

  // InstancedMesh with per-instance color requires setColorAt
  const colors = useMemo(() => {
    const col = new THREE.Color()
    return data.map(d => col.set(EMBER_COLORS[d.colorIdx]!).clone())
  }, [data])

  useFrame(({ clock }, dt) => {
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]!
      d.y += d.speed * dt
      if (d.y > 12) {
        d.y = 0
        d.x = (Math.random() - 0.5) * 24
        d.z = -75 - Math.random() * 30
      }
      dummy.position.set(
        d.x + Math.sin(clock.getElapsedTime() * d.wobbleSpeed + d.phase) * d.wobble,
        d.y,
        d.z,
      )
      dummy.scale.setScalar(d.radius)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, colors[i]!)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial vertexColors transparent opacity={0.9} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── SKY zone decorations ─────────────────────────────────────────────────────
const RAINBOW_COLORS = ['#ff3333', '#ff9900', '#ffee00', '#44cc44', '#3388ff', '#aa44ff'] as const

function SkyZoneDecor() {
  const cloudRefs = useRef<THREE.Group[]>([])
  const cloudData = useMemo(() => [
    { x: -18, y: 18, z: -8,  sx: 1.0 },
    { x:  15, y: 22, z: -14, sx: 0.9 },
    { x: -12, y: 16, z: -21, sx: 1.1 },
    { x:  20, y: 25, z: -27, sx: 0.85 },
    { x: -20, y: 20, z: -33, sx: 1.2 },
    { x:  10, y: 17, z: -39, sx: 0.95 },
  ], [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    cloudRefs.current.forEach((g, i) => {
      if (!g) return
      g.position.y = cloudData[i]!.y + Math.sin(t * 0.22 + i * 1.3) * 0.8
    })
  })

  return (
    <group>
      {/* Fluffy cloud shapes — 3-4 overlapping spheres per cloud */}
      {cloudData.map((cd, ci) => (
        <group
          key={`skycloud-${ci}`}
          ref={el => { if (el) cloudRefs.current[ci] = el }}
          position={[cd.x, cd.y, cd.z]}
          scale={[cd.sx, cd.sx, cd.sx]}
        >
          <mesh>
            <sphereGeometry args={[4, 10, 10]} />
            <meshStandardMaterial color="#f0f0ff" transparent opacity={0.72} roughness={1} />
          </mesh>
          <mesh position={[3.5, -0.5, 0]}>
            <sphereGeometry args={[3, 10, 10]} />
            <meshStandardMaterial color="#f0f0ff" transparent opacity={0.65} roughness={1} />
          </mesh>
          <mesh position={[-3.2, -0.3, 0.5]}>
            <sphereGeometry args={[3.5, 10, 10]} />
            <meshStandardMaterial color="#f0f0ff" transparent opacity={0.68} roughness={1} />
          </mesh>
          <mesh position={[1.0, 1.8, 0.5]}>
            <sphereGeometry args={[3, 10, 10]} />
            <meshStandardMaterial color="#f0f0ff" transparent opacity={0.6} roughness={1} />
          </mesh>
        </group>
      ))}

      {/* Rainbow arch segments — 4 arcs at varying z depths */}
      {([
        { z: -5,  ry: 0.0  },
        { z: -15, ry: 0.05 },
        { z: -25, ry: -0.05 },
        { z: -35, ry: 0.03 },
      ] as const).map((arc, ai) =>
        RAINBOW_COLORS.map((col, ci) => (
          <mesh
            key={`rainbow-${ai}-${ci}`}
            position={[0, 14 + ci * 0.7, arc.z]}
            rotation={[0, arc.ry, 0]}
          >
            <torusGeometry args={[16 + ci * 0.9, 0.35, 8, 40, Math.PI]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.5} transparent opacity={0.55} />
          </mesh>
        ))
      )}

      {/* Gentle sun */}
      <mesh position={[50, 30, 15]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffaa00" emissiveIntensity={1} roughness={0.4} />
      </mesh>
      <pointLight position={[50, 30, 15]} color="#ffee88" intensity={6} distance={80} />
    </group>
  )
}

// ─── CRYSTAL zone decorations ─────────────────────────────────────────────────
function CrystalZoneDecor() {
  const SPIRE_POSITIONS: [number, number, number][] = [
    [-13,  0, -46], [ 12,  0, -49], [-11,  0, -54], [ 14,  0, -57],
    [-12,  0, -61], [ 11,  0, -64], [-14,  0, -68], [ 13,  0, -71],
  ]
  const ICE_PATCHES: [number, number, number][] = [
    [-7,  0.05, -47], [ 7, 0.05, -52], [-6, 0.05, -58],
    [ 8,  0.05, -63], [-9, 0.05, -69], [ 6, 0.05, -73],
  ]
  const STALACTITES: { pos: [number, number, number]; h: number }[] = [
    { pos: [-6, 20, -47], h: 5 }, { pos: [ 8, 20, -52], h: 7 },
    { pos: [-9, 20, -57], h: 4 }, { pos: [ 5, 20, -62], h: 6 },
    { pos: [-7, 20, -67], h: 8 }, { pos: [10, 20, -71], h: 5 },
  ]

  return (
    <group>
      {/* Ice crystal spires */}
      {SPIRE_POSITIONS.map((pos, i) => (
        <group key={`ice-spire-${i}`} position={pos}>
          {/* Main cone */}
          <mesh position={[0, 3, 0]} castShadow>
            <coneGeometry args={[1.2, 6, 6]} />
            <meshStandardMaterial
              color="#aaddff"
              emissive="#88ccff"
              emissiveIntensity={1.5}
              roughness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Prism tip */}
          <mesh position={[0, 7.5, 0]} castShadow>
            <coneGeometry args={[0.5, 2.5, 6]} />
            <meshStandardMaterial
              color="#cceeff"
              emissive="#aaddff"
              emissiveIntensity={2.0}
              roughness={0.05}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight position={[0, 4, 0]} color="#88ddff" intensity={1.5} distance={8} />
        </group>
      ))}

      {/* Ice floor patches */}
      {ICE_PATCHES.map((pos, i) => (
        <mesh key={`ice-patch-${i}`} position={pos}>
          <boxGeometry args={[8, 0.1, 8]} />
          <meshStandardMaterial color="#ddeeff" transparent opacity={0.6} roughness={0.1} />
        </mesh>
      ))}

      {/* Frozen stalactites hanging from above (inverted cones) */}
      {STALACTITES.map((s, i) => (
        <group key={`stalactite-${i}`} position={s.pos} rotation={[Math.PI, 0, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.9, s.h, 6]} />
            <meshStandardMaterial
              color="#aaddff"
              emissive="#88ccff"
              emissiveIntensity={1.2}
              roughness={0.1}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── VOLCANO zone decorations ─────────────────────────────────────────────────
function VolcanoZoneDecor() {
  const COUNT = 60
  const emberRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const emberData = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 28,
      z: -75 - Math.random() * 30,
      y: Math.random() * 14,
      speed: 3 + Math.random() * 5,
      wobble: (Math.random() - 0.5) * 1.0,
      wobbleSpeed: 1 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
    }))
  , [])

  const VOLCANO_CONES: { pos: [number, number, number]; rotY: number }[] = [
    { pos: [-18, 1, -79], rotY: 0.3 }, { pos: [ 16, 1, -83], rotY: 1.1 },
    { pos: [-15, 1, -88], rotY: 2.0 }, { pos: [ 17, 1, -93], rotY: 0.7 },
    { pos: [-16, 1, -99], rotY: 1.6 },
  ]
  const ASH_CLOUDS: { pos: [number, number, number]; r: number }[] = [
    { pos: [-10, 14, -80], r: 8  }, { pos: [ 12, 18, -86], r: 10 },
    { pos: [-14, 12, -92], r: 6  }, { pos: [  9, 16, -98], r: 9  },
    { pos: [-11, 15, -102], r: 7 },
  ]

  useFrame(({ clock }, dt) => {
    if (!emberRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      const d = emberData[i]!
      d.y += d.speed * dt
      if (d.y > 14) {
        d.y = 0
        d.x = (Math.random() - 0.5) * 28
        d.z = -75 - Math.random() * 30
      }
      dummy.position.set(
        d.x + Math.sin(t * d.wobbleSpeed + d.phase) * d.wobble,
        d.y,
        d.z,
      )
      dummy.scale.setScalar(0.05 + Math.random() * 0.02)
      dummy.updateMatrix()
      emberRef.current.setMatrixAt(i, dummy.matrix)
    }
    emberRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* Small volcano cones */}
      {VOLCANO_CONES.map((vc, i) => (
        <group key={`volcone-${i}`} position={vc.pos} rotation={[0, vc.rotY, 0]}>
          {/* Cone body: wide base (r=5) tapering to r=1 at top, height 8 */}
          <mesh castShadow>
            <cylinderGeometry args={[1, 5, 8, 12]} />
            <meshStandardMaterial color="#444444" roughness={0.95} />
          </mesh>
          {/* Lava pool at the base */}
          <mesh position={[0, -3.85, 0]}>
            <cylinderGeometry args={[4, 4, 0.3, 20]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff2200"
              emissiveIntensity={2}
              roughness={0.2}
            />
          </mesh>
          <pointLight position={[0, -3, 0]} color="#ff4400" intensity={3} distance={14} />
        </group>
      ))}

      {/* Flying embers — InstancedMesh 60 sparks */}
      <instancedMesh ref={emberRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.88} depthWrite={false} />
      </instancedMesh>

      {/* Ash clouds — large transparent spheres */}
      {ASH_CLOUDS.map((ac, i) => (
        <mesh key={`ash-${i}`} position={ac.pos}>
          <sphereGeometry args={[ac.r, 10, 10]} />
          <meshBasicMaterial color="#553333" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Floating energy orbs (zone transition markers) ───────────────────────────
const ORB_COLORS = ['#ffb3de', '#e2b8ff', '#88d8ff', '#a8f5a0', '#ffe680']
function FloatingOrbs() {
  const refs = useRef<THREE.Mesh[]>([])
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    x: (Math.sin(i * 2.39) * 0.5) * 18,
    z: -(i / 29) * 100 - 2,
    y: 1 + (i % 5) * 1.5,
    speed: 0.5 + (i % 7) * 0.15,
    phase: i * 0.73,
    color: ORB_COLORS[i % ORB_COLORS.length]!,
  })), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((m, i) => {
      if (!m) return
      m.position.y = data[i]!.y + Math.sin(t * data[i]!.speed + data[i]!.phase) * 0.6
    })
  })

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => { if (el) refs.current[i] = el }} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.1, 7, 7]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.75} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// ─── Floating side decorations ───────────────────────────────────────────────
// Zone 1 (SKY): pastel mini-islands, left side (x < 0) and right side (x > 0)
const SKY_ISLANDS_LEFT: { pos: [number,number,number]; color: string }[] = [
  { pos: [-14, 2.5,  -5], color: '#ffccee' },
  { pos: [-18, 5.0, -12], color: '#ffe680' },
  { pos: [-15, 3.5, -19], color: '#c8ffc0' },
  { pos: [-20, 7.0, -26], color: '#88d8ff' },
  { pos: [-16, 4.5, -33], color: '#ffccee' },
  { pos: [-17, 6.0, -40], color: '#ffe680' },
]
const SKY_ISLANDS_RIGHT: { pos: [number,number,number]; color: string }[] = [
  { pos: [15,  3.0,  -8], color: '#c8ffc0' },
  { pos: [19,  5.5, -14], color: '#88d8ff' },
  { pos: [16,  2.5, -21], color: '#ffccee' },
  { pos: [18,  7.5, -28], color: '#ffe680' },
  { pos: [14,  4.0, -35], color: '#c8ffc0' },
  { pos: [20,  6.5, -41], color: '#88d8ff' },
]

// Zone 2 (CRYSTAL): glowing pillars
const CRYSTAL_PILLARS_LEFT: { pos: [number,number,number]; color: string }[] = [
  { pos: [-15,  7.0, -45], color: '#7048e8' },
  { pos: [-20,  5.5, -52], color: '#4888ff' },
  { pos: [-16,  9.0, -59], color: '#48d0ff' },
  { pos: [-22, 11.0, -66], color: '#a050ff' },
  { pos: [-17,  6.5, -73], color: '#7048e8' },
]
const CRYSTAL_PILLARS_RIGHT: { pos: [number,number,number]; color: string }[] = [
  { pos: [18,  8.0, -47], color: '#4888ff' },
  { pos: [15,  5.0, -54], color: '#48d0ff' },
  { pos: [21, 10.5, -61], color: '#a050ff' },
  { pos: [16,  4.5, -68], color: '#7048e8' },
  { pos: [20, 12.0, -74], color: '#4888ff' },
]

// Zone 3 (VOLCANO): lava rocks
const LAVA_ROCKS_LEFT: { pos: [number,number,number] }[] = [
  { pos: [-14, 4.0, -77] },
  { pos: [-20, 7.5, -83] },
  { pos: [-16, 3.5, -89] },
  { pos: [-18, 9.0, -95] },
  { pos: [-15, 5.5, -102] },
]
const LAVA_ROCKS_RIGHT: { pos: [number,number,number] }[] = [
  { pos: [17, 5.0, -79] },
  { pos: [14, 8.0, -85] },
  { pos: [19, 3.5, -91] },
  { pos: [15, 6.5, -97] },
  { pos: [20, 9.5, -103] },
]

function FloatingSideDecor() {
  return (
    <>
      {/* ── Zone 1 SKY: pastel mini-islands ── */}
      {[...SKY_ISLANDS_LEFT, ...SKY_ISLANDS_RIGHT].map((item, i) => (
        <group key={`sky-island-${i}`} position={item.pos}>
          {/* Island top surface */}
          <mesh castShadow>
            <boxGeometry args={[4, 0.8, 3]} />
            <meshStandardMaterial color={item.color} roughness={0.7} />
          </mesh>
          {/* Island underbelly */}
          <mesh position={[0, -0.9, 0]} scale={[0.75, 1.0, 0.75]}>
            <boxGeometry args={[4, 0.8, 3]} />
            <meshStandardMaterial color="#8b6f47" roughness={0.95} />
          </mesh>
          {/* Glow light underneath */}
          <pointLight position={[0, -1, 0]} color="#ffccee" intensity={1} distance={8} />
        </group>
      ))}

      {/* ── Zone 2 CRYSTAL: glowing pillars ── */}
      {[...CRYSTAL_PILLARS_LEFT, ...CRYSTAL_PILLARS_RIGHT].map((item, i) => (
        <group key={`crystal-pillar-${i}`} position={item.pos}>
          <mesh castShadow>
            <boxGeometry args={[1, 6, 1]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={1.2}
              roughness={0.15}
              transparent
              opacity={0.88}
            />
          </mesh>
          {/* Crystal tip */}
          <mesh position={[0, 3.8, 0]}>
            <coneGeometry args={[0.55, 1.4, 6]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={1.4}
              roughness={0.1}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight position={[0, 0, 0]} color={item.color} intensity={1} distance={10} />
        </group>
      ))}

      {/* ── Zone 3 VOLCANO: lava rocks ── */}
      {[...LAVA_ROCKS_LEFT, ...LAVA_ROCKS_RIGHT].map((item, i) => (
        <group key={`lava-rock-${i}`} position={item.pos}>
          {/* Main rock body */}
          <mesh castShadow>
            <boxGeometry args={[3, 2, 3]} />
            <meshStandardMaterial
              color="#3a1a08"
              emissive="#ff3300"
              emissiveIntensity={0.4}
              roughness={0.95}
            />
          </mesh>
          {/* Secondary rough chunk for irregular look */}
          <mesh position={[0.6, 0.8, 0.4]} rotation={[0.3, 0.5, 0.2]}>
            <boxGeometry args={[1.8, 1.4, 1.8]} />
            <meshStandardMaterial
              color="#2a1005"
              emissive="#cc2200"
              emissiveIntensity={0.3}
              roughness={0.98}
            />
          </mesh>
          <pointLight position={[0, 0, 0]} color="#ff4400" intensity={2} distance={12} />
        </group>
      ))}
    </>
  )
}

// ─── Zone portal arch shaders ────────────────────────────────────────────────
const PORTAL_VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`

const PORTAL_FRAG = `
  uniform float iTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main(){
    vec2 uv=vUv-0.5;
    float dist=length(uv);
    float angle=atan(uv.y,uv.x);
    float swirl=sin(angle*5.0+dist*8.0-iTime*2.5);
    float alpha=(1.0-dist*2.0)*(0.3+swirl*0.15);
    gl_FragColor=vec4(uColor,max(0.0,alpha));
  }
`

// ─── Zone portal arch component ───────────────────────────────────────────────
function ZonePortalArch({
  position,
  color1,
  color2,
  label,
}: {
  position: [number, number, number]
  color1: string
  color2: string
  label: string
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({ iTime: { value: 0 }, uColor: { value: new THREE.Color(color1) } }),
    [color1],
  )

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[6, 0.35, 10, 48]} />
        <meshStandardMaterial
          color={color1}
          emissive={color1}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[5.3, 0.15, 8, 48]} />
        <meshStandardMaterial
          color={color2}
          emissive={color2}
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Portal fill — swirling shader */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[5.1, 40]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={PORTAL_VERT}
          fragmentShader={PORTAL_FRAG}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flanking point lights */}
      <pointLight position={[-6.5, 0, 0]} color={color1} intensity={4} distance={15} />
      <pointLight position={[6.5, 0, 0]} color={color1} intensity={4} distance={15} />

      {/* Label sign above arch */}
      <group position={[0, 7.5, 0]}>
        {/* Sign backing */}
        <mesh>
          <boxGeometry args={[3, 0.8, 0.2]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.8} />
        </mesh>
        {/* Inner emissive strip */}
        <mesh position={[0, 0, 0.11]}>
          <boxGeometry args={[2.8, 0.55, 0.05]} />
          <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={1.2} />
        </mesh>
        {/* Sign accent light */}
        <pointLight position={[0, 0, 0.5]} color={color1} intensity={1.5} distance={6} />
      </group>
    </group>
  )
}

// ─── SpinningObstacles ───────────────────────────────────────────────────────
// Purely decorative — no RigidBody, no collision

function SpinningStar({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.z += 0.03
  })
  return (
    <group ref={groupRef} position={position}>
      {[0, 60, 120].map((deg) => (
        <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
          <boxGeometry args={[4.5, 0.18, 0.18]} />
          <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={1.2} roughness={0.4} />
        </mesh>
      ))}
      <pointLight color="#ffee44" intensity={1.5} distance={6} />
    </group>
  )
}

function SpinningIceCrystal({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.02
  })
  return (
    <group ref={groupRef} position={position}>
      {[0, 120, 240].map((deg) => (
        <mesh key={deg} rotation={[(deg * Math.PI) / 180, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.12, 0.22, 2.8, 6]} />
          <meshStandardMaterial
            color="#aaddff"
            emissive="#88ccff"
            emissiveIntensity={2}
            roughness={0.1}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
      <pointLight color="#88ddff" intensity={1.2} distance={7} />
    </group>
  )
}

function SpinningFireRing({ position, axisTilt = 0 }: { position: [number, number, number]; axisTilt?: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.x += 0.04
  })
  return (
    <group ref={groupRef} position={position} rotation={[axisTilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[2, 0.3, 10, 40]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff2200"
          emissiveIntensity={3}
          roughness={0.3}
        />
      </mesh>
      <pointLight color="#ff4400" intensity={2} distance={8} />
    </group>
  )
}

const SKY_STAR_POSITIONS: [number, number, number][] = [
  [-8,  8, -8 ],
  [ 9,  8, -16],
  [-7,  9, -25],
  [ 8,  8, -33],
]
const CRYSTAL_CRYSTAL_POSITIONS: [number, number, number][] = [
  [-9,  10, -46],
  [ 8,  11, -54],
  [-8,  12, -63],
  [ 9,  10, -70],
]
const VOLCANO_RING_DATA: { pos: [number, number, number]; axisTilt: number }[] = [
  { pos: [-7, 3,  -78], axisTilt: 0.2  },
  { pos: [ 8, 5,  -86], axisTilt: -0.3 },
  { pos: [-6, 7,  -93], axisTilt: 0.15 },
  { pos: [ 7, 8, -100], axisTilt: -0.1 },
]

function SpinningObstacles() {
  return (
    <group>
      {SKY_STAR_POSITIONS.map((pos, i) => (
        <SpinningStar key={`spin-star-${i}`} position={pos} />
      ))}
      {CRYSTAL_CRYSTAL_POSITIONS.map((pos, i) => (
        <SpinningIceCrystal key={`spin-ice-${i}`} position={pos} />
      ))}
      {VOLCANO_RING_DATA.map((d, i) => (
        <SpinningFireRing key={`spin-fire-${i}`} position={d.pos} axisTilt={d.axisTilt} />
      ))}
    </group>
  )
}

// ─── MovingPlatformVisuals ────────────────────────────────────────────────────
// Visual-only bobbing platforms (no physics)

const SKY_CLOUD_PLATS: { pos: [number, number, number]; phase: number }[] = [
  { pos: [-11, 5,  -6 ], phase: 0.0 },
  { pos: [ 12, 6,  -12], phase: 1.1 },
  { pos: [-10, 7,  -18], phase: 2.2 },
  { pos: [ 11, 7,  -25], phase: 3.3 },
  { pos: [-12, 8,  -32], phase: 4.4 },
  { pos: [ 10, 8,  -38], phase: 5.5 },
]

const CRYSTAL_ICE_SLABS: { pos: [number, number, number]; phase: number }[] = [
  { pos: [-10, 9,  -47], phase: 0.5 },
  { pos: [ 11, 10, -56], phase: 1.8 },
  { pos: [-11, 11, -64], phase: 3.1 },
  { pos: [ 10, 12, -71], phase: 4.7 },
]

const VOLCANO_LAVA_PLATS: { pos: [number, number, number]; phase: number }[] = [
  { pos: [-8, 6,  -80], phase: 0.9 },
  { pos: [ 9, 8,  -89], phase: 2.3 },
  { pos: [-7, 10, -97], phase: 4.1 },
]

function CloudPlatVisual({ pos, phase }: { pos: [number, number, number]; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const baseY = pos[1]
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() + phase) * 0.8
    }
  })
  return (
    <mesh ref={meshRef} position={[pos[0], baseY, pos[2]]} castShadow>
      <boxGeometry args={[5, 0.8, 5]} />
      <meshStandardMaterial color="#f8f8ff" roughness={1} transparent opacity={0.7} />
    </mesh>
  )
}

function IceSlabVisual({ pos, phase }: { pos: [number, number, number]; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const baseY = pos[1]
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.position.y = baseY + Math.sin(t + phase) * 0.8
    meshRef.current.rotation.z = Math.sin(t * 0.7 + phase) * 0.07
    meshRef.current.rotation.x = Math.sin(t * 0.5 + phase + 1) * 0.05
  })
  return (
    <mesh ref={meshRef} position={[pos[0], baseY, pos[2]]} castShadow>
      <boxGeometry args={[4, 0.5, 4]} />
      <meshStandardMaterial color="#cceeff" roughness={0.1} transparent opacity={0.8} />
    </mesh>
  )
}

function LavaPlatVisual({ pos, phase }: { pos: [number, number, number]; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const baseY = pos[1]
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = baseY + Math.sin(clock.getElapsedTime() + phase) * 0.8
    }
  })
  return (
    <mesh ref={meshRef} position={[pos[0], baseY, pos[2]]} castShadow>
      <cylinderGeometry args={[2.5, 2.5, 0.4, 20]} />
      <meshStandardMaterial color="#cc4400" emissive="#ff2200" emissiveIntensity={1} roughness={0.5} />
    </mesh>
  )
}

function MovingPlatformVisuals() {
  return (
    <group>
      {SKY_CLOUD_PLATS.map((d, i) => (
        <CloudPlatVisual key={`cloud-plat-${i}`} pos={d.pos} phase={d.phase} />
      ))}
      {CRYSTAL_ICE_SLABS.map((d, i) => (
        <IceSlabVisual key={`ice-slab-${i}`} pos={d.pos} phase={d.phase} />
      ))}
      {VOLCANO_LAVA_PLATS.map((d, i) => (
        <LavaPlatVisual key={`lava-plat-${i}`} pos={d.pos} phase={d.phase} />
      ))}
    </group>
  )
}

// ─── ZoneSignPosts ────────────────────────────────────────────────────────────

interface SignPostProps {
  position: [number, number, number]
  zoneColor: string
  label: string
  arrowDir: number  // rotation.y for arrow
}

function ZoneSignPost({ position, zoneColor, label: _label, arrowDir }: SignPostProps) {
  return (
    <group position={position}>
      {/* Wooden pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Arrow sign box at top of pole */}
      <group position={[0, 3.1, 0]} rotation={[0, arrowDir, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial color={zoneColor} emissive={zoneColor} emissiveIntensity={0.6} roughness={0.5} />
        </mesh>
        {/* Arrow tip — small triangle-ish cone on the right */}
        <mesh position={[1.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.25, 0.4, 4]} />
          <meshStandardMaterial color={zoneColor} emissive={zoneColor} emissiveIntensity={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* Zone name label — emissive glow slab */}
      <mesh position={[0, 3.9, 0]}>
        <boxGeometry args={[2.5, 0.8, 0.08]} />
        <meshStandardMaterial color={zoneColor} emissive={zoneColor} emissiveIntensity={1.4} roughness={0.3} />
      </mesh>

      <pointLight position={[0, 3.5, 0.3]} color={zoneColor} intensity={1} distance={5} />
    </group>
  )
}

function ZoneSignPosts() {
  return (
    <group>
      {/* SKY zone entrance */}
      <ZoneSignPost
        position={[5.5, 1.0, -3]}
        zoneColor="#88aaff"
        label="SKY"
        arrowDir={-Math.PI / 2}
      />
      {/* CRYSTAL zone entrance */}
      <ZoneSignPost
        position={[5.5, 5.8, -43]}
        zoneColor="#aaddff"
        label="CRYSTAL"
        arrowDir={-Math.PI / 2}
      />
      {/* VOLCANO zone entrance */}
      <ZoneSignPost
        position={[5.5, 9.2, -76]}
        zoneColor="#ff6622"
        label="VOLCANO"
        arrowDir={-Math.PI / 2}
      />
    </group>
  )
}

// ─── Main world ───────────────────────────────────────────────────────────────
export default function ObbyWorld() {
  return (
    <>
      {/* Deep cosmic sky — works for all 3 zones */}
      <GradientSky top="#08003a" bottom="#2808a0" radius={440} />

      <StarField />
      <CloudGround />
      <FloatingOrbs />

      {/* Zone atmospheres */}
      <SkySparkles />
      <CrystalMist />
      <CrystalDust />
      <VolcanoEmbers />

      {/* Zone-specific decorations */}
      <SkyZoneDecor />
      <CrystalZoneDecor />
      <VolcanoZoneDecor />

      {/* Starting pad — prevents fall-through at spawn [0,3,2] */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.8, 1]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[6, 0.7, 8]} />
          <meshStandardMaterial color="#ffccee" emissive="#ff88cc" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>

      {/* ── Zone 1: SKY ─────────────────────────────────── */}
      {SKY_PLATS.map((p, i) =>
        p.moving
          ? <MovingBlock key={`s${i}`} {...p} />
          : <StaticBlock key={`s${i}`} {...p} />
      )}

      {/* Floating islands below sky platforms for depth */}
      {SKY_PLATS.slice(0, 6).map((p, i) => (
        <Island key={`is${i}`} pos={[p.pos[0] + (i%2===0?0.5:-0.5), p.pos[1] - 3.5, p.pos[2]]} />
      ))}

      {/* Clouds bands at sky zone level */}
      <mesh position={[0, -1, -22]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[40, 50]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* ── Zone 1 extras: floating ICE BLOCKS ──────────── */}
      <IceBlock pos={[-9,  2.0,  -7]} scale={1.1} rotY={0.4} />
      <IceBlock pos={[ 10, 2.5, -12]} scale={0.9} rotY={1.0} />
      <IceBlock pos={[-11, 3.2, -18]} scale={1.2} rotY={2.1} />
      <IceBlock pos={[  9, 3.8, -23]} scale={1.0} rotY={0.8} />
      <IceBlock pos={[-10, 4.4, -29]} scale={1.3} rotY={3.0} />
      <IceBlock pos={[ 11, 5.0, -34]} scale={0.8} rotY={1.6} />

      {/* ── Zone 2: CRYSTAL ─────────────────────────────── */}
      {CRYSTAL_PLATS.map((p, i) =>
        p.moving
          ? <MovingBlock key={`c${i}`} {...p} />
          : <StaticBlock key={`c${i}`} {...p} />
      )}

      {/* Crystal spires around crystal zone */}
      <CrystalSpire pos={[-8, 0, -45]} h={5} color="#7048e8" />
      <CrystalSpire pos={[9, 0, -50]} h={7} color="#4888ff" />
      <CrystalSpire pos={[-9, 0, -55]} h={4} color="#48d0ff" />
      <CrystalSpire pos={[8, 0, -60]} h={6} color="#a050ff" />
      <CrystalSpire pos={[-7, 0, -67]} h={8} color="#7048e8" />
      <CrystalSpire pos={[10, 0, -64]} h={5} color="#4888ff" />
      <MushroomGlow pos={[-6, 0, -48]} scale={1.4} />
      <MushroomGlow pos={[7, 0, -57]} scale={1.2} />
      <MushroomGlow pos={[-8, 0, -63]} scale={1.6} />

      {/* Crystal clusters flanking platforms */}
      <CrystalCluster pos={[-12, 0, -44]} scale={1.2} rotY={0.5} />
      <CrystalCluster pos={[ 11, 0, -48]} scale={1.4} rotY={1.8} />
      <CrystalCluster pos={[-10, 0, -53]} scale={1.1} rotY={0.2} />
      <CrystalCluster pos={[ 12, 0, -58]} scale={1.5} rotY={2.7} />
      <CrystalCluster pos={[-11, 0, -62]} scale={1.3} rotY={1.2} />
      <CrystalCluster pos={[  9, 0, -67]} scale={1.0} rotY={3.5} />
      <CrystalCluster pos={[-13, 0, -70]} scale={1.6} rotY={0.9} />
      <CrystalCluster pos={[ 10, 0, -73]} scale={1.2} rotY={2.1} />

      {/* Purple point lights in crystal zone */}
      <pointLight position={[0, 8, -55]} color="#8040ff" intensity={3} distance={20} />
      <pointLight position={[0, 8, -65]} color="#4080ff" intensity={3} distance={20} />

      {/* ── Zone 3: VOLCANO ─────────────────────────────── */}
      {VOLCANO_PLATS.map((p, i) =>
        p.moving
          ? <MovingBlock key={`v${i}`} {...p} />
          : <StaticBlock key={`v${i}`} {...p} />
      )}

      <LavaFloor />

      {/* Lava point lights */}
      <pointLight position={[0, 5, -85]} color="#ff4400" intensity={5} distance={25} />
      <pointLight position={[5, 5, -95]} color="#ff8800" intensity={4} distance={20} />
      <pointLight position={[-5, 5, -90]} color="#ff4400" intensity={4} distance={20} />

      {/* Lava glow — ground-level embers */}
      <pointLight position={[ 5, 0.5, -80]} color="#ff3300" intensity={4} distance={12} />
      <pointLight position={[-5, 0.5, -80]} color="#ff3300" intensity={4} distance={12} />
      <pointLight position={[ 5, 0.5, -88]} color="#ff3300" intensity={4} distance={12} />
      <pointLight position={[-5, 0.5, -88]} color="#ff3300" intensity={4} distance={12} />
      <pointLight position={[ 5, 0.5, -95]} color="#ff3300" intensity={4} distance={12} />
      <pointLight position={[-5, 0.5, -102]} color="#ff3300" intensity={4} distance={12} />

      {/* ── Zone 3 extras: LAVA ROCKS ────────────────────── */}
      <LavaRock pos={[ 10, 1.0, -77]} scale={1.3} rotY={0.6} />
      <LavaRock pos={[-11, 1.0, -81]} scale={1.1} rotY={2.2} />
      <LavaRock pos={[  9, 1.0, -86]} scale={1.5} rotY={1.0} />
      <LavaRock pos={[-10, 1.0, -90]} scale={1.2} rotY={3.1} />
      <LavaRock pos={[ 12, 1.0, -94]} scale={1.0} rotY={0.3} />
      <LavaRock pos={[-12, 1.0, -98]} scale={1.4} rotY={1.8} />
      <LavaRock pos={[  8, 1.0, -101]} scale={1.1} rotY={2.6} />
      <LavaRock pos={[-9,  1.0, -103]} scale={1.3} rotY={0.9} />

      {/* ── Zone 3 FINAL BOSS: Дракон Вулкана ───────────── */}
      <BossDragon pos={[0, 1.0, -100]} scale={2.2} rotY={Math.PI} />

      {/* ── Coins ────────────────────────────────────────── */}
      {ALL_PLATS.filter((_, i) => i % 2 === 0).map((p, i) => (
        <Coin key={`coin${i}`} pos={[p.pos[0], p.pos[1] + 1.1, p.pos[2]]} />
      ))}
      {/* Bonus coins between hard jumps */}
      <Coin pos={[2, 6, -52]} />
      <Coin pos={[-2, 7.5, -62]} />
      <Coin pos={[3, 10, -84]} />

      {/* ── Enemies ──────────────────────────────────────── */}
      {/* Sky zone patrol */}
      <Enemy pos={[0, 2.8, -13]} patrolX={4} />
      <Enemy pos={[0, 4.2, -25]} patrolX={3.5} color="#ff88dd" />
      {/* Crystal zone patrol */}
      <Enemy pos={[0, 7.5, -52]} patrolX={3} color="#8040ff" />
      <Enemy pos={[0, 8.8, -65]} patrolX={3} color="#4080ff" />
      {/* Volcano zone patrol */}
      <Enemy pos={[0, 10.5, -85]} patrolX={3.5} color="#ff4010" />

      {/* ── Boss at finish ───────────────────────────────── */}
      <GltfMonster
        which="blueDemon"
        pos={[0, 13.8, -103]}
        scale={1.6}
        rotY={Math.PI}
        animation="Wave"
      />

      {/* ── Start portal ─────────────────────────────────── */}
      <StartPortal />

      {/* ── Zone transition portals ──────────────────────── */}
      {/* SKY → CRYSTAL at z=-42, ring center at average sky platform height */}
      <ZonePortalArch
        position={[0, 6.0, -42]}
        color1="#88ffcc"
        color2="#44aaff"
        label="КРИСТАЛЬНАЯ ЗОНА"
      />
      {/* CRYSTAL → VOLCANO at z=-75, ring center at average crystal platform height */}
      <ZonePortalArch
        position={[0, 8.5, -75]}
        color1="#ff6600"
        color2="#ff2200"
        label="ЗОНА ВУЛКАНА"
      />

      {/* ── Floating side decorations ────────────────────── */}
      <FloatingSideDecor />

      {/* ── Visual spinning obstacles ─────────────────────── */}
      <SpinningObstacles />

      {/* ── Visual bobbing platforms ──────────────────────── */}
      <MovingPlatformVisuals />

      {/* ── Zone signposts ───────────────────────────────── */}
      <ZoneSignPosts />

      {/* ── Goal ─────────────────────────────────────────── */}
      <GoalTrigger
        pos={[0, 13.5, -103]}
        size={[7.5, 3, 7.5]}
        result={{ kind: 'win', label: 'ФИНИШ!', subline: 'Ты покорил все три зоны!' }}
      />
    </>
  )
}

export const OBBY_SPAWN: [number, number, number] = [0, 3, 2]

// ─── Start portal (inline, reuses old code) ───────────────────────────────────
const P_VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`
const P_FRAG = `
  uniform float iTime;varying vec2 vUv;
  vec3 hsl(float h,float s,float l){float c=(1.-abs(2.*l-1.))*s,x=c*(1.-abs(mod(h*6.,2.)-1.)),m=l-c*.5;float hi=mod(h*6.,6.);vec3 col;if(hi<1.)col=vec3(c,x,0.);else if(hi<2.)col=vec3(x,c,0.);else if(hi<3.)col=vec3(0.,c,x);else if(hi<4.)col=vec3(0.,x,c);else if(hi<5.)col=vec3(x,0.,c);else col=vec3(c,0.,x);return col+m;}
  void main(){float h=mod(iTime*.25+vUv.x*2.,1.);gl_FragColor=vec4(hsl(h,1.,.6),1.);}
`

function StartPortal() {
  const ringRef = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uni = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.z = clock.getElapsedTime() * 0.5
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.getElapsedTime()
  })
  return (
    <group position={[0, 2.5, 1]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[2.4, 0.18, 12, 64]} />
        <shaderMaterial ref={matRef} uniforms={uni} vertexShader={P_VERT} fragmentShader={P_FRAG} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[2.22, 48]} />
        <meshBasicMaterial color="#2050ff" transparent opacity={0.22} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
