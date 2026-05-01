import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Crystal, Pillar, Torch, Altar, Lantern, Portal, Sign, BossGolem, BossWizard, CrystalCluster, LavaRock, EnergyOrb, CrystalSword, MagicGate } from '../Scenery'

// ─── SHADER: Arena barrier wall ──────────────────────────────────────────────
const BARRIER_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const BARRIER_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float scanline = step(0.97, fract(vUv.y * 40.0 + iTime * 0.5));
    float glow = 0.3 + 0.15 * sin(iTime * 2.0 + vUv.x * 6.28);
    float hexPat = step(0.92, fract(vUv.x * 20.0)) + step(0.92, fract(vUv.y * 20.0));
    vec3 col = vec3(0.3, 0.0, 0.8) + vec3(0.0, 0.5, 1.0) * (hexPat * 0.4 + scanline * 0.5);
    float alpha = (glow + hexPat * 0.15 + scanline * 0.3) * 0.55;
    gl_FragColor = vec4(col, alpha);
  }
`

// ─── ARENA BARRIER (glowing energy fence ring) ───────────────────────────────
const BARRIER_LIGHT_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)

function ArenaBarrier() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.elapsedTime
  })
  return (
    <>
      {/* Main barrier cylinder */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[92, 92, 20, 64, 1, true]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={BARRIER_VERT}
          fragmentShader={BARRIER_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 8 point lights evenly spaced around the ring */}
      {BARRIER_LIGHT_ANGLES.map((a, i) => (
        <pointLight
          key={`barrier-light-${i}`}
          color="#6600cc"
          intensity={3}
          distance={25}
          position={[Math.cos(a) * 90, 8, Math.sin(a) * 90]}
        />
      ))}
    </>
  )
}

// ─── FORCE FIELD TOP (translucent cap disc) ───────────────────────────────────
function ForceFieldTop() {
  return (
    <mesh position={[0, 20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[92, 64]} />
      <meshBasicMaterial color="#3300aa" transparent opacity={0.06} depthWrite={false} />
    </mesh>
  )
}

// ─── SHADER: Energy surge ground rings ───────────────────────────────────────
const SURGE_VERT = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`
const SURGE_FRAG = `
  uniform float iTime;
  uniform float iRadius;
  void main(){
    float alpha = sin(iTime * 2.0 + iRadius * 0.5) * 0.4 + 0.4;
    gl_FragColor = vec4(0.5, 0.0, 1.0, alpha);
  }
`

// ─── SHADER: Hexagonal energy grid ───────────────────────────────────────────
const HEX_VERT = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`
const HEX_FRAG = `
  uniform float iTime;
  varying vec2 vUv;
  void main(){
    vec2 uv=vUv*12.;
    vec2 cell=fract(uv)-.5;
    float dist=length(cell);
    float grid=smoothstep(.45,.42,dist);
    float pulse=.5+.5*sin(iTime*2.+length(floor(uv))*1.5);
    vec3 col=mix(vec3(.1,.0,.3),vec3(.2,.8,1.),pulse*grid);
    gl_FragColor=vec4(col+grid*.3,1.);
  }
`

// ─── ENERGY SURGES (8 ground pulse rings) ────────────────────────────────────
const SURGE_RADII = [5, 7, 9, 11, 14, 17, 20, 23]

function EnergySurges() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([])
  const uniformsArray = useMemo(
    () => SURGE_RADII.map((r) => ({ iTime: { value: 0 }, iRadius: { value: r } })),
    []
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    matRefs.current.forEach((mat) => {
      if (mat) mat.uniforms.iTime.value = t
    })
  })
  return (
    <>
      {SURGE_RADII.map((r, i) => (
        <mesh key={`surge-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <torusGeometry args={[r, 0.08, 8, 80]} />
          <shaderMaterial
            ref={(el) => { matRefs.current[i] = el }}
            vertexShader={SURGE_VERT}
            fragmentShader={SURGE_FRAG}
            uniforms={uniformsArray[i]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── LIGHTNING ARCS (6 thin cylinders between portals) ───────────────────────
// Portal positions: N=[0,0,-45], S=[0,0,45], W=[-45,0,0], E=[45,0,0]
const PORTAL_POS: [number, number, number][] = [
  [0, 0, -45], [0, 0, 45], [-45, 0, 0], [45, 0, 0],
]
// 6 pairs (with-repetition combos)
const ARC_PAIRS: [number, number][] = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]]

function buildArcMatrix(a: [number,number,number], b: [number,number,number]): THREE.Matrix4 {
  const aV = new THREE.Vector3(...a)
  const bV = new THREE.Vector3(...b)
  const mid = new THREE.Vector3().lerpVectors(aV, bV, 0.5)
  mid.y = 5
  const dir = new THREE.Vector3().subVectors(bV, aV).normalize()
  const height = aV.distanceTo(bV)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  const mat = new THREE.Matrix4()
  mat.compose(mid, quat, new THREE.Vector3(1, 1, 1))
  return new THREE.Matrix4().multiplyMatrices(
    new THREE.Matrix4().setPosition(mid),
    new THREE.Matrix4().makeRotationFromQuaternion(quat)
  ).scale(new THREE.Vector3(1, height, 1))
}

function LightningArcs() {
  const arcRefs = useRef<(THREE.Mesh | null)[]>([])

  // Precompute positions, heights, midpoints for each arc
  const arcData = useMemo(() => ARC_PAIRS.map(([ai, bi]) => {
    const a = PORTAL_POS[ai]!
    const b = PORTAL_POS[bi]!
    const aV = new THREE.Vector3(...a)
    const bV = new THREE.Vector3(...b)
    const mid = new THREE.Vector3().lerpVectors(aV, bV, 0.5)
    mid.y = 5
    const dir = new THREE.Vector3().subVectors(bV, aV).normalize()
    const height = aV.distanceTo(bV)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return { mid: mid.toArray() as [number, number, number], height, quat }
  }), [])

  useFrame(() => {
    arcRefs.current.forEach((mesh) => {
      if (!mesh) return
      if (Math.random() < 0.05) {
        mesh.visible = !mesh.visible
      }
    })
  })

  return (
    <>
      {arcData.map((arc, i) => {
        const euler = new THREE.Euler().setFromQuaternion(arc.quat)
        return (
          <mesh
            key={`arc-${i}`}
            ref={(el) => { arcRefs.current[i] = el }}
            position={arc.mid}
            rotation={[euler.x, euler.y, euler.z]}
          >
            <cylinderGeometry args={[0.04, 0.04, arc.height, 5, 1]} />
            <meshBasicMaterial color="#8844ff" />
          </mesh>
        )
      })}
    </>
  )
}

// ─── POWER BEAM PILLARS (4 corners, vertical glow columns) ───────────────────
const BEAM_CORNERS: [number, number, number][] = [
  [-45, 0, -45], [45, 0, -45], [-45, 0, 45], [45, 0, 45],
]

function PowerBeamPillars() {
  return (
    <>
      {BEAM_CORNERS.map(([x, , z], i) => (
        <group key={`beam-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 15, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 30, 10, 1]} />
            <meshBasicMaterial color="#aa44ff" transparent opacity={0.2} />
          </mesh>
          <pointLight
            color="#8800ff"
            intensity={8}
            distance={25}
            position={[0, 30, 0]}
          />
        </group>
      ))}
    </>
  )
}

// ─── ENERGY DEBRIS (25 small boxes orbiting arena) ───────────────────────────
function EnergyDebris() {
  const count = 25
  const debrisData = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    const radius = 30 + Math.random() * 30
    const y = 2 + Math.random() * 6
    const size = 0.1 + Math.random() * 0.15
    const speed = (0.08 + Math.random() * 0.12) * (Math.random() < 0.5 ? 1 : -1)
    const phase = angle
    return { radius, y, size, speed, phase }
  }), [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    debrisData.forEach((d, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const a = d.phase + t * d.speed
      mesh.position.set(Math.cos(a) * d.radius, d.y + Math.sin(t * 0.7 + d.phase) * 0.8, Math.sin(a) * d.radius)
      mesh.rotation.x += 0.02
      mesh.rotation.y += 0.03
      mesh.rotation.z += 0.01
    })
  })

  return (
    <>
      {debrisData.map((d, i) => (
        <mesh
          key={`debris-${i}`}
          ref={(el) => { meshRefs.current[i] = el }}
        >
          <boxGeometry args={[d.size, d.size, d.size]} />
          <meshBasicMaterial color="#cc88ff" />
        </mesh>
      ))}
    </>
  )
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const RAINBOW = [
  '#ff0040','#ff4000','#ffaa00','#aaff00',
  '#00ff80','#00ffff','#0080ff','#8000ff',
  '#ff00ff','#ff0088','#00ff44','#44aaff',
]

// ─── ENERGY GRID FLOOR (central platform) ────────────────────────────────────
function EnergyGridFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.52, 0]}>
      <planeGeometry args={[40, 40]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={HEX_VERT}
        fragmentShader={HEX_FRAG}
        uniforms={uniforms}
        transparent={false}
        depthWrite
      />
    </mesh>
  )
}

// ─── POWER ORBS (3 rings × 4) ────────────────────────────────────────────────
interface OrbProps { index: number; ring: number; color: string }
function PowerOrb({ index, ring, color }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)
  const baseRadius = ring === 0 ? 8 : ring === 1 ? 16 : 24
  const baseY     = ring === 0 ? 3 : ring === 1 ? 5 : 7
  const speed     = ring === 0 ? 0.7 : ring === 1 ? 0.4 : 0.2
  const phaseOff  = (index / 4) * Math.PI * 2
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const angle = t * speed + phaseOff
    const x = Math.cos(angle) * baseRadius
    const z = Math.sin(angle) * baseRadius
    const y = baseY + Math.sin(t * 1.4 + phaseOff) * 0.5
    if (meshRef.current) meshRef.current.position.set(x, y, z)
    if (lightRef.current)  lightRef.current.position.set(x, y, z)
  })
  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={6} distance={20} decay={2} />
    </>
  )
}

function PowerOrbs() {
  return (
    <>
      {[0, 1, 2].flatMap((ring) =>
        [0, 1, 2, 3].map((i) => {
          const colorIdx = ring * 4 + i
          return (
            <PowerOrb
              key={`orb-${ring}-${i}`}
              index={i}
              ring={ring}
              color={RAINBOW[colorIdx % RAINBOW.length]!}
            />
          )
        })
      )}
    </>
  )
}

// ─── DUMMY TARGETS (8) ───────────────────────────────────────────────────────
const DUMMY_CIRCLE_R = 15
const DUMMY_POSITIONS: Array<[number, number, number]> = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2
  return [Math.cos(a) * DUMMY_CIRCLE_R, 0, Math.sin(a) * DUMMY_CIRCLE_R]
})

function TargetDummy({ pos }: { pos: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [isReacting, setIsReacting] = useState(false)
  const reactingRef = useRef(false)
  const playerVec = useMemo(() => new THREE.Vector3(), [])
  const dummyVec  = useMemo(() => new THREE.Vector3(...pos), [pos])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!groupRef.current) return

    // Slow idle rotation
    groupRef.current.rotation.y = t * 0.3

    // Distance check for reaction
    const px = (window as Record<string, unknown>).__ekPlayerPos as { x: number; y: number; z: number } | undefined
    if (px) {
      playerVec.set(px.x, 0, px.z)
      const dist = playerVec.distanceTo(dummyVec)
      const near = dist < 5
      if (near && !reactingRef.current) {
        reactingRef.current = true
        setIsReacting(true)
        setTimeout(() => { setIsReacting(false); reactingRef.current = false }, 400)
      }
    }

    // Scale pulse on react
    const targetScale = isReacting ? 1.35 : 1.0
    const curScale = groupRef.current.scale.x
    groupRef.current.scale.setScalar(curScale + (targetScale - curScale) * 0.18)
  })

  return (
    <group ref={groupRef} position={pos}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.3, 16]} />
        <meshStandardMaterial color="#555577" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.45]} />
        <meshStandardMaterial color="#888899" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#aaaacc" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Target ring */}
      <mesh position={[0, 1.0, 0.23]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.04, 8, 24]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff1111" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}

// ─── ENERGY MOTES (80) — InstancedMesh, was 80 individual meshes ─────────────
function EnergyMotes() {
  const COUNT = 80
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    x: (Math.random() - 0.5) * 180,
    y: 0.5 + Math.random() * 14,
    z: (Math.random() - 0.5) * 180,
    speedY: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    color: RAINBOW[i % RAINBOW.length]!,
  })), [])
  const colorArray = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const col = new THREE.Color()
    data.forEach((m, i) => { col.set(m.color); arr[i*3]=col.r; arr[i*3+1]=col.g; arr[i*3+2]=col.b })
    return arr
  }, [data])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((m, i) => {
      dummy.position.set(
        m.x + Math.sin(t * 0.4 + m.phase) * 2,
        m.y + Math.sin(t * m.speedY + m.phase) * 1.5,
        m.z + Math.cos(t * 0.35 + m.phase) * 2,
      )
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

// ─── STARS (800) ─────────────────────────────────────────────────────────────
function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3)
    for (let i = 0; i < 800; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 380 + Math.random() * 20
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.9} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

// ─── ARENA LIGHTNING (6 vertical bolt columns striking from above) ───────────
const BOLT_COUNT = 6
const BOLT_DATA = Array.from({ length: BOLT_COUNT }, (_, i) => {
  const angle = (i / BOLT_COUNT) * Math.PI * 2 + Math.random() * 0.5
  return {
    x: Math.cos(angle) * 28,
    z: Math.sin(angle) * 28,
  }
})

function ArenaLightning() {
  const boltRefs = useRef<THREE.Mesh[]>([])
  const lightRefs = useRef<THREE.PointLight[]>([])

  useFrame(() => {
    boltRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      if (Math.random() < 0.03) {
        const nowVisible = !mesh.visible
        mesh.visible = nowVisible
        const light = lightRefs.current[i]
        if (light) {
          light.intensity = nowVisible ? 12 : 0
        }
      }
    })
  })

  return (
    <>
      {BOLT_DATA.map((d, i) => (
        <group key={`bolt-${i}`} position={[d.x, 20, d.z]}>
          <mesh
            ref={(el) => { if (el) boltRefs.current[i] = el }}
            visible={false}
          >
            <cylinderGeometry args={[0.02, 0.02, 40, 4]} />
            <meshBasicMaterial color="#cc44ff" />
          </mesh>
          <pointLight
            ref={(el) => { if (el) lightRefs.current[i] = el }}
            color="#cc44ff"
            intensity={0}
            distance={30}
            decay={2}
          />
        </group>
      ))}
    </>
  )
}

// ─── NEBULA RING (large cosmic torus framing the arena from above) ────────────
function NebulaRing() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.04 * delta
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 25, 0]}>
      <torusGeometry args={[55, 8, 16, 80]} />
      <meshBasicMaterial color="#1a0033" transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── WALLS WITH BATTLEMENTS ───────────────────────────────────────────────────
function ArenaWalls() {
  const W = 100
  const wallH = 8
  const wallT = 1.5
  const battleH = 2.5
  const battleW = 3
  const gap = 5

  const wallDefs = [
    { pos: [0, wallH / 2, -W] as [number,number,number], size: [W*2, wallH, wallT] as [number,number,number], axis: 'x' as const },
    { pos: [0, wallH / 2,  W] as [number,number,number], size: [W*2, wallH, wallT] as [number,number,number], axis: 'x' as const },
    { pos: [-W, wallH / 2, 0] as [number,number,number], size: [wallT, wallH, W*2] as [number,number,number], axis: 'z' as const },
    { pos: [ W, wallH / 2, 0] as [number,number,number], size: [wallT, wallH, W*2] as [number,number,number], axis: 'z' as const },
  ]

  return (
    <>
      {wallDefs.map((w, wi) => {
        const battlements: JSX.Element[] = []
        const count = Math.floor(W * 2 / gap)
        for (let j = 0; j < count; j++) {
          if (j % 2 === 0) {
            const offset = -W + j * gap + gap / 2
            const bpos: [number,number,number] = w.axis === 'x'
              ? [offset, wallH + battleH / 2, w.pos[2]]
              : [w.pos[0], wallH + battleH / 2, offset]
            battlements.push(
              <mesh key={`b-${wi}-${j}`} position={bpos} castShadow>
                <boxGeometry args={[battleW, battleH, battleW]} />
                <meshStandardMaterial color="#1e1a3a" roughness={0.9} />
              </mesh>
            )
          }
        }
        return (
          <RigidBody key={wi} type="fixed" colliders="cuboid" position={w.pos}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={w.size} />
              <meshStandardMaterial
                color="#1a1535"
                roughness={0.85}
                emissive="#2a1060"
                emissiveIntensity={0.12}
              />
            </mesh>
            {battlements}
          </RigidBody>
        )
      })}
    </>
  )
}

// ─── ABILITY ORBS (8 glowing pickup orbs) ────────────────────────────────────
const ABILITY_ORB_DATA: Array<{
  pos: [number, number, number]
  color: string
  phase: number
}> = [
  { pos: [ 28, 6,  10], color: '#ff4400', phase: 0.0 },
  { pos: [-28, 5, -15], color: '#0088ff', phase: 0.8 },
  { pos: [ 10, 7,  38], color: '#44ff00', phase: 1.6 },
  { pos: [-40, 4, -20], color: '#ff00ff', phase: 2.4 },
  { pos: [ 55, 8,  -8], color: '#ffcc00', phase: 3.1 },
  { pos: [-18, 5,  55], color: '#00ffcc', phase: 3.9 },
  { pos: [ 35, 6, -48], color: '#ff8800', phase: 4.7 },
  { pos: [-52, 7,  32], color: '#cc00ff', phase: 5.5 },
]

function AbilityOrbs() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ABILITY_ORB_DATA.forEach((d, i) => {
      const g = groupRefs.current[i]
      if (!g) return
      g.position.y = d.pos[1] + Math.sin(t * 1.5 + d.phase) * 0.8
      g.rotation.y += 0.02
    })
  })

  return (
    <>
      {ABILITY_ORB_DATA.map((d, i) => (
        <group
          key={`aorb-${i}`}
          ref={(el) => { groupRefs.current[i] = el }}
          position={d.pos}
        >
          {/* Core sphere */}
          <mesh>
            <sphereGeometry args={[0.7, 20, 20]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={4}
              roughness={0.05}
              metalness={0.3}
            />
          </mesh>
          {/* Outer glow ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.9, 0.1, 12, 40]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={2}
              roughness={0.1}
            />
          </mesh>
          {/* Point light */}
          <pointLight color={d.color} intensity={5} distance={10} decay={2} />
        </group>
      ))}
    </>
  )
}

// ─── TRAINING TARGET DUMMIES (6 in semicircle) ───────────────────────────────
const TRAINING_DUMMY_DATA: Array<{
  pos: [number, number, number]
  phase: number
}> = Array.from({ length: 6 }, (_, i) => {
  const frac = i / 6
  const angle = frac * Math.PI // semicircle: 0 → π
  const radius = 20 + i * 8    // z: -20 .. -60 range via radius
  return {
    pos: [
      Math.cos(angle) * 18 - 9,  // spread x across -27..+9
      0,
      -(20 + i * 7),             // z from -20 to -55
    ] as [number, number, number],
    phase: frac * Math.PI * 2,
  }
})

function TrainingTargetDummies() {
  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    TRAINING_DUMMY_DATA.forEach((d, i) => {
      const g = groupRefs.current[i]
      if (!g) return
      g.rotation.z = Math.sin(t * 0.8 + d.phase) * 0.1
    })
  })

  return (
    <>
      {TRAINING_DUMMY_DATA.map((d, i) => (
        <group
          key={`tdummy-${i}`}
          ref={(el) => { groupRefs.current[i] = el }}
          position={d.pos}
        >
          {/* Body */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <sphereGeometry args={[0.4, 14, 14]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Left arm */}
          <mesh position={[-0.75, 1.4, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 10]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Right arm */}
          <mesh position={[0.75, 1.4, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 1.2, 10]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Target ring 1 — red */}
          <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.05, 8, 28]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1} />
          </mesh>
          {/* Target ring 2 — white */}
          <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.05, 8, 28]} />
            <meshStandardMaterial color="#ffffff" emissive="#aaaaaa" emissiveIntensity={0.5} />
          </mesh>
          {/* Target ring 3 — red */}
          <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.05, 8, 28]} />
            <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── POWER PLATFORMS (4 glowing power-up pads) ───────────────────────────────
const PLATFORM_POSITIONS: [number, number, number][] = [
  [ 32, 0,  32],
  [-32, 0,  32],
  [ 32, 0, -32],
  [-32, 0, -32],
]

function PowerPlatforms() {
  const discRefs = useRef<(THREE.Mesh | null)[]>([])
  const _col = useRef(new THREE.Color())

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    discRefs.current.forEach((disc, i) => {
      if (!disc) return
      disc.rotation.y = t * (0.6 + i * 0.15)
      _col.current.setHSL((t * 0.15 + i * 0.25) % 1, 1, 0.55)
      ;(disc.material as THREE.MeshStandardMaterial).emissive.copy(_col.current)
      ;(disc.material as THREE.MeshStandardMaterial).color.copy(_col.current)
    })
  })

  return (
    <>
      {PLATFORM_POSITIONS.map((pos, i) => (
        <group key={`ppad-${i}`} position={pos}>
          {/* Base platform */}
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.2, 40]} />
            <meshStandardMaterial
              color="#222233"
              emissive="#0044ff"
              emissiveIntensity={1}
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>
          {/* Inner glow ring */}
          <mesh position={[0, 0.225, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 0.25, 40]} />
            <meshStandardMaterial
              color="#0044ff"
              emissive="#0044ff"
              emissiveIntensity={3}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>
          {/* Rotating energy disc */}
          <mesh
            ref={(el) => { discRefs.current[i] = el }}
            position={[0, 0.28, 0]}
          >
            <cylinderGeometry args={[2.2, 2.2, 0.05, 48]} />
            <meshStandardMaterial
              color="#0088ff"
              emissive="#0088ff"
              emissiveIntensity={3}
              roughness={0.05}
              metalness={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Ambient glow light */}
          <pointLight color="#0044ff" intensity={4} distance={12} decay={2} position={[0, 1, 0]} />
        </group>
      ))}
    </>
  )
}

// ─── ARENA SCOREBOARD ────────────────────────────────────────────────────────
function ArenaScoreboard() {
  const leftScoreRef  = useRef<THREE.Mesh>(null!)
  const rightScoreRef = useRef<THREE.Mesh>(null!)
  const timerRef      = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 2.5 + Math.sin(t * 1.8) * 0.7
    if (leftScoreRef.current)
      (leftScoreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    if (rightScoreRef.current)
      (rightScoreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    if (timerRef.current) {
      const tPulse = 1.5 + Math.sin(t * 3.0) * 0.5
      ;(timerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = tPulse
    }
  })

  return (
    <group position={[0, 18, 0]}>
      {/* Support pillars */}
      <mesh position={[-8, -9, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 18, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.4} />
      </mesh>
      <mesh position={[8, -9, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 18, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* Back frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[18, 8, 1.5]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.5} />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 0, 0.76]}>
        <boxGeometry args={[17, 7, 0.2]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#003366"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Left score block */}
      <mesh ref={leftScoreRef} position={[-5.5, 0.5, 0.88]}>
        <boxGeometry args={[4, 5, 0.1]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={3}
          roughness={0.05}
          metalness={0.0}
        />
      </mesh>

      {/* Right score block */}
      <mesh ref={rightScoreRef} position={[5.5, 0.5, 0.88]}>
        <boxGeometry args={[4, 5, 0.1]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={3}
          roughness={0.05}
          metalness={0.0}
        />
      </mesh>

      {/* VS — V shape (two thin angled boxes) */}
      <mesh position={[-0.55, 0.4, 0.88]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.25, 3, 0.1]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={4} roughness={0.1} />
      </mesh>
      <mesh position={[0.55, 0.4, 0.88]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.25, 3, 0.1]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={4} roughness={0.1} />
      </mesh>
      {/* S shape — approximated as 3 horizontal bars */}
      {([-0.9, 0.0, 0.9] as const).map((yOff, idx) => (
        <mesh key={`s-bar-${idx}`} position={[0, yOff - 2.8, 0.88]}>
          <boxGeometry args={[1.0, 0.25, 0.1]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={4} roughness={0.1} />
        </mesh>
      ))}

      {/* Timer bar */}
      <mesh ref={timerRef} position={[0, -2.9, 0.88]}>
        <boxGeometry args={[14, 0.4, 0.1]} />
        <meshStandardMaterial
          color="#ffcc00"
          emissive="#ffcc00"
          emissiveIntensity={2}
          roughness={0.05}
          metalness={0.0}
        />
      </mesh>
    </group>
  )
}

// ─── SPECTATOR STANDS ─────────────────────────────────────────────────────────
const SPECTATOR_COLORS = [
  '#ff4444', '#ff8800', '#ffdd00', '#88ff00',
  '#00ffcc', '#0088ff', '#aa44ff', '#ff44cc',
  '#ffffff', '#ffaa88', '#aaffee', '#ffeeaa',
]

function SpectatorSection({ side }: { side: 'left' | 'right' }) {
  const xSign = side === 'left' ? -1 : 1
  const xBase = xSign * 55
  const rotY  = side === 'left' ? Math.PI / 2 : -Math.PI / 2

  // Build instanced mesh data for spectator figures
  const COUNT = 30
  const spectatorData = useMemo(() => {
    const items: { pos: [number, number, number]; color: string }[] = []
    for (let t = 0; t < 3; t++) {
      const count = 10
      for (let j = 0; j < count; j++) {
        const xOff = (j - count / 2 + 0.5) * 2.4
        const yOff = 1.0 + t * 2.5
        const zOff = -t * 3.5
        items.push({
          pos: [xBase + xOff, yOff, zOff],
          color: SPECTATOR_COLORS[(t * count + j) % SPECTATOR_COLORS.length]!,
        })
      }
    }
    return items
  }, [xBase])

  // Instanced body meshes
  const bodyGeo = useMemo(() => new THREE.CylinderGeometry(0.3, 0.3, 1.0, 8), [])
  const headGeo = useMemo(() => new THREE.SphereGeometry(0.25, 8, 8), [])

  const bodyInstRef = useRef<THREE.InstancedMesh>(null!)
  const headInstRef = useRef<THREE.InstancedMesh>(null!)

  // Create separate InstancedMesh per color group for simplicity — or use one per section
  // We'll use individual meshes for heads but instanced for bodies (all same color per tier)
  useMemo(() => {
    const dummy = new THREE.Object3D()
    const instBody = bodyInstRef.current
    const instHead = headInstRef.current
    if (!instBody || !instHead) return
    spectatorData.forEach((d, i) => {
      dummy.position.set(d.pos[0], d.pos[1], d.pos[2])
      dummy.updateMatrix()
      instBody.setMatrixAt(i, dummy.matrix)
      dummy.position.set(d.pos[0], d.pos[1] + 0.85, d.pos[2])
      dummy.updateMatrix()
      instHead.setMatrixAt(i, dummy.matrix)
    })
    instBody.instanceMatrix.needsUpdate = true
    instHead.instanceMatrix.needsUpdate = true
  })

  return (
    <group rotation={[0, rotY, 0]}>
      {/* 3 tier platforms */}
      {[0, 1, 2].map((t) => (
        <group key={`tier-${t}`} position={[0, t * 2.5, -t * 3.5]}>
          {/* Tier base */}
          <mesh position={[xBase, 0.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[25, 1, 4]} />
            <meshStandardMaterial color="#222233" roughness={0.9} metalness={0.2} />
          </mesh>
          {/* Front railing */}
          <mesh position={[xBase, 0.65, 1.6]}>
            <boxGeometry args={[25, 0.15, 0.1]} />
            <meshStandardMaterial color="#aaaacc" emissive="#6666aa" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Instanced spectator bodies */}
      <instancedMesh
        ref={bodyInstRef}
        args={[bodyGeo, undefined, COUNT]}
        castShadow
      >
        <meshStandardMaterial color="#cc8844" roughness={0.8} />
      </instancedMesh>

      {/* Instanced spectator heads */}
      <instancedMesh
        ref={headInstRef}
        args={[headGeo, undefined, COUNT]}
        castShadow
      >
        <meshStandardMaterial color="#ffcc99" roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

function SpectatorStands() {
  return (
    <>
      <SpectatorSection side="left" />
      <SpectatorSection side="right" />
    </>
  )
}

// ─── ARENA LIGHTS ─────────────────────────────────────────────────────────────
const TOWER_CORNERS: [number, number, number][] = [
  [-48, 0, -48],
  [ 48, 0, -48],
  [-48, 0,  48],
  [ 48, 0,  48],
]

const RING_LIGHT_COLORS = [
  '#ff4400', // fire
  '#0088ff', // ice
  '#44ff00', // nature
  '#aa00ff', // magic
  '#ff0088', // arcane
  '#ffcc00', // lightning
  '#00ffcc', // water
  '#ff6600', // lava
  '#00aaff', // wind
  '#88ff44', // earth
  '#ff44aa', // spirit
  '#4488ff', // frost
]

const RING_LIGHT_ANGLES = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)

function ArenaLights() {
  const ringLightRefs = useRef<THREE.PointLight[]>([])
  const _col = useRef(new THREE.Color())

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ringLightRefs.current.forEach((light, i) => {
      if (!light) return
      _col.current.setHSL((t * 0.08 + i / 12) % 1.0, 1.0, 0.6)
      light.color.copy(_col.current)
    })
  })

  return (
    <>
      {/* 4 light towers at corners */}
      {TOWER_CORNERS.map(([tx, , tz], i) => (
        <group key={`ltower-${i}`} position={[tx, 0, tz]}>
          {/* Tower pole */}
          <mesh position={[0, 10, 0]} castShadow>
            <boxGeometry args={[0.8, 20, 0.8]} />
            <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.5} />
          </mesh>

          {/* 3 light housing boxes at tower top */}
          <mesh position={[-0.6, 20.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={5}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 21.2, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#ffffcc"
              emissive="#ffffcc"
              emissiveIntensity={5}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0.6, 20.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={5}
              roughness={0.1}
            />
          </mesh>

          {/* SpotLight aimed at arena center */}
          <spotLight
            position={[0, 21, 0]}
            target-position={[0, 0, 0]}
            angle={0.55}
            penumbra={0.35}
            intensity={60}
            distance={120}
            color="#ffffff"
            castShadow={false}
          />
        </group>
      ))}

      {/* 12 colored point lights in a ring at r=70, y=25 */}
      {RING_LIGHT_ANGLES.map((a, i) => (
        <pointLight
          key={`ring-light-${i}`}
          ref={(el) => { if (el) ringLightRefs.current[i] = el }}
          color={RING_LIGHT_COLORS[i % RING_LIGHT_COLORS.length]}
          intensity={12}
          distance={60}
          decay={2}
          position={[
            Math.cos(a) * 70,
            25,
            Math.sin(a) * 70,
          ]}
        />
      ))}
    </>
  )
}

// ─── ABILITY CRAFTING FORGE ──────────────────────────────────────────────────
const FORGE_CRYSTAL_COLORS = [
  '#ff4400', // fire
  '#0088ff', // ice
  '#44ff00', // nature
  '#aa00ff', // magic
  '#ff0088', // arcane
  '#ffcc00', // lightning
]

function AbilityCraftingForge({ position }: { position: [number, number, number] }) {
  const sparkRef   = useRef<THREE.PointLight>(null!)
  const runeRefs   = useRef<(THREE.Mesh | null)[]>([])
  const crystalRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Pulsing spark at focal point
    if (sparkRef.current) {
      sparkRef.current.intensity = 10 + Math.sin(t * 3) * 8
    }
    // Slowly rotate each rune tile
    runeRefs.current.forEach((rune) => {
      if (rune) rune.rotation.y += 0.005
    })
    // Crystals lean-in wobble
    crystalRefs.current.forEach((crystal, i) => {
      if (!crystal) return
      crystal.rotation.z = -0.35 + Math.sin(t * 1.5 + i) * 0.04
    })
  })

  // 8 rune tiles in a ring at r=6
  const RUNE_COUNT = 8
  const runeAngles = Array.from({ length: RUNE_COUNT }, (_, i) => (i / RUNE_COUNT) * Math.PI * 2)

  // 6 crystals in a ring at r=1.5, height 3.5 (tips converging toward y=5.5)
  const CRYSTAL_COUNT = 6
  const crystalAngles = Array.from({ length: CRYSTAL_COUNT }, (_, i) => (i / CRYSTAL_COUNT) * Math.PI * 2)

  return (
    <group position={position}>
      {/* Forge base — hexagonal-approximated cylinder */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[4, 4, 0.5, 6]} />
        <meshStandardMaterial color="#222233" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Outer ring torus */}
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.5, 0.3, 16, 80]} />
        <meshStandardMaterial
          color="#8800ff"
          emissive="#8800ff"
          emissiveIntensity={3}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Central anvil */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#334455" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* 8 rune tiles forming a ring on the floor */}
      {runeAngles.map((a, i) => (
        <mesh
          key={`rune-${i}`}
          ref={(el) => { runeRefs.current[i] = el }}
          position={[Math.cos(a) * 3.2, 0.52, Math.sin(a) * 3.2]}
          rotation={[0, a, 0]}
        >
          <boxGeometry args={[0.8, 0.06, 0.35]} />
          <meshStandardMaterial
            color="#6600ff"
            emissive="#6600ff"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* 6 crystals (cones) arranged in a ring, leaning inward */}
      {crystalAngles.map((a, i) => {
        const cx = Math.cos(a) * 1.5
        const cz = Math.sin(a) * 1.5
        const color = FORGE_CRYSTAL_COLORS[i % FORGE_CRYSTAL_COLORS.length]!
        return (
          <group key={`forge-crystal-${i}`} position={[cx, 2.5, cz]}>
            <mesh
              ref={(el) => { crystalRefs.current[i] = el }}
              rotation={[0, a + Math.PI, -0.35]}
            >
              <coneGeometry args={[0.5, 2, 6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                roughness={0.15}
                metalness={0.4}
              />
            </mesh>
          </group>
        )
      })}

      {/* 6 energy beams: thin cylinders from crystal tip area toward focal point */}
      {crystalAngles.map((a, i) => {
        const color = FORGE_CRYSTAL_COLORS[i % FORGE_CRYSTAL_COLORS.length]!
        const cx = Math.cos(a) * 0.8
        const cz = Math.sin(a) * 0.8
        return (
          <mesh
            key={`beam-${i}`}
            position={[cx, 4.2, cz]}
            rotation={[Math.atan2(Math.sqrt(cx * cx + cz * cz), 1.3), a + Math.PI / 2, 0]}
          >
            <cylinderGeometry args={[0.06, 0.06, 2, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={4}
              roughness={0.1}
              transparent
              opacity={0.85}
            />
          </mesh>
        )
      })}

      {/* Crystal tips converging spark — pointLight at focal point */}
      <pointLight
        ref={sparkRef}
        color="#ffffff"
        intensity={15}
        distance={12}
        decay={2}
        position={[0, 5.5, 0]}
      />
      {/* Visible spark mesh */}
      <mesh position={[0, 5.5, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} roughness={0} />
      </mesh>

      {/* Ambient forge glow */}
      <pointLight color="#8800ff" intensity={5} distance={14} decay={2} position={[0, 3, 0]} />
    </group>
  )
}

// ─── SPELL TOMES LIBRARY ──────────────────────────────────────────────────────
const TOME_DATA: Array<{ color: string; pageEmissive: string; phase: number }> = [
  { color: '#1a0033', pageEmissive: '#00ffcc', phase: 0.0 },
  { color: '#001a33', pageEmissive: '#ff8800', phase: 0.785 },
  { color: '#1a1a00', pageEmissive: '#ff00ff', phase: 1.571 },
  { color: '#001a00', pageEmissive: '#00ff88', phase: 2.356 },
  { color: '#1a0011', pageEmissive: '#ffcc00', phase: 3.142 },
  { color: '#001133', pageEmissive: '#0088ff', phase: 3.927 },
  { color: '#0d001a', pageEmissive: '#ff4400', phase: 4.712 },
  { color: '#00001a', pageEmissive: '#88ff00', phase: 5.497 },
]
const TOME_ORBIT_R = 8
const TOME_ORBIT_Y = 6

function SpellTomesLibrary({ position }: { position: [number, number, number] }) {
  const groupRefs  = useRef<(THREE.Group | null)[]>([])
  const leftRefs   = useRef<(THREE.Mesh | null)[]>([])
  const rightRefs  = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    TOME_DATA.forEach((d, i) => {
      const angle = t * 0.22 + d.phase
      const g = groupRefs.current[i]
      if (g) {
        g.position.set(Math.cos(angle) * TOME_ORBIT_R, TOME_ORBIT_Y + Math.sin(t * 0.7 + d.phase) * 0.4, Math.sin(angle) * TOME_ORBIT_R)
        g.rotation.y = angle + Math.PI / 2
      }
      // Pages flutter
      const leftPage = leftRefs.current[i]
      const rightPage = rightRefs.current[i]
      if (leftPage)  leftPage.rotation.z  =  0.35 + Math.sin(t * 2 + d.phase) * 0.02
      if (rightPage) rightPage.rotation.z = -0.35 + Math.sin(t * 2 + d.phase) * 0.02
    })
  })

  return (
    <group position={position}>
      {TOME_DATA.map((d, i) => (
        <group
          key={`tome-${i}`}
          ref={(el) => { groupRefs.current[i] = el }}
        >
          {/* Book spine */}
          <mesh>
            <boxGeometry args={[0.12, 1, 0.04]} />
            <meshStandardMaterial color={d.color} roughness={0.9} />
          </mesh>
          {/* Left page */}
          <mesh
            ref={(el) => { leftRefs.current[i] = el }}
            position={[-0.42, 0, 0]}
            rotation={[0, 0, 0.35]}
          >
            <boxGeometry args={[0.8, 1, 0.02]} />
            <meshStandardMaterial
              color="#eeeedd"
              emissive={d.pageEmissive}
              emissiveIntensity={0.6}
              roughness={0.8}
            />
          </mesh>
          {/* Right page */}
          <mesh
            ref={(el) => { rightRefs.current[i] = el }}
            position={[0.42, 0, 0]}
            rotation={[0, 0, -0.35]}
          >
            <boxGeometry args={[0.8, 1, 0.02]} />
            <meshStandardMaterial
              color="#eeeedd"
              emissive={d.pageEmissive}
              emissiveIntensity={0.6}
              roughness={0.8}
            />
          </mesh>
          {/* Page glow */}
          <pointLight color={d.pageEmissive} intensity={1.5} distance={4} decay={2} />
        </group>
      ))}
    </group>
  )
}

// ─── ABILITY PREVIEW DISPLAY ──────────────────────────────────────────────────
// Ability shape index: 0=fire cone, 1=ice shard, 2=lightning, 3=orb, 4=void, 5=earth
const NUM_ABILITY_SHAPES = 6

function AbilityPreviewShape({ shapeIndex }: { shapeIndex: number }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.8
      meshRef.current.rotation.x += delta * 0.6
    }
  })

  // Pick geometry + color based on shapeIndex
  const shapeColor = FORGE_CRYSTAL_COLORS[shapeIndex % FORGE_CRYSTAL_COLORS.length]!

  const geometries: JSX.Element[] = [
    <coneGeometry key="fire"  args={[0.5, 1.2, 6]} />,        // fire cone
    <coneGeometry key="ice"   args={[0.25, 1.5, 4]} />,       // ice shard (narrow 4-sided)
    <boxGeometry  key="bolt"  args={[0.2, 1.4, 0.2]} />,      // lightning bolt (thin box)
    <sphereGeometry key="orb" args={[0.6, 12, 12]} />,        // orb
    <torusGeometry key="void" args={[0.5, 0.18, 8, 24]} />,   // void ring
    <dodecahedronGeometry key="earth" args={[0.55, 0]} />,     // earth gem
  ]

  return (
    <mesh ref={meshRef}>
      {geometries[shapeIndex % NUM_ABILITY_SHAPES]}
      <meshStandardMaterial
        color={shapeColor}
        emissive={shapeColor}
        emissiveIntensity={3}
        roughness={0.1}
        metalness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

function AbilityPreview({ position }: { position: [number, number, number] }) {
  const [shapeIndex, setShapeIndex] = useState(0)
  const prevTimeRef = useRef(0)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const nextIndex = Math.floor(t / 2) % NUM_ABILITY_SHAPES
    if (nextIndex !== prevTimeRef.current) {
      prevTimeRef.current = nextIndex
      setShapeIndex(nextIndex)
    }
  })

  return (
    <group position={position}>
      {/* Pillar */}
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3.5, 16]} />
        <meshStandardMaterial color="#222233" roughness={0.6} metalness={0.6} />
      </mesh>

      {/* Holographic display sphere */}
      <mesh position={[0, 5.0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#001133"
          emissive="#0044ff"
          emissiveIntensity={1}
          transparent
          opacity={0.5}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating ability icon inside the sphere */}
      <group position={[0, 5.0, 0]}>
        <AbilityPreviewShape shapeIndex={shapeIndex} />
      </group>

      {/* Pillar base ring */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.1, 8, 32]} />
        <meshStandardMaterial color="#0044ff" emissive="#0044ff" emissiveIntensity={2} roughness={0.2} />
      </mesh>

      {/* Display glow */}
      <pointLight color="#0044ff" intensity={4} distance={8} decay={2} position={[0, 5.0, 0]} />
    </group>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AbilityBuilderWorld() {
  // ── Floor setup ──
  const PILLAR_R = 35
  const pillarAngles = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  const altarAngles  = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)
  const crystalAngles= Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + 0.2)

  return (
    <>
      {/* ── SKY ─────────────────────────────────────────────────────────── */}
      <GradientSky top="#050015" bottom="#150040" radius={440} />
      <Stars />

      {/* ── LIGHTS ──────────────────────────────────────────────────────── */}
      <ambientLight color="#2a0055" intensity={1.4} />
      <directionalLight color="#aa44ff" intensity={1.2} position={[30, 50, 30]} castShadow />
      <directionalLight color="#0088ff" intensity={0.7} position={[-40, 30, -20]} />
      <directionalLight color="#ff2244" intensity={0.5} position={[0, 20, -70]} />
      <directionalLight color="#ffaa00" intensity={0.4} position={[0, 20, 70]} />
      <pointLight color="#aa00ff" intensity={8} distance={60} position={[0, 15, 0]} />

      {/* ── GROUND (full 200×200) ────────────────────────────────────────── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[200, 0.5, 200]} />
          <meshStandardMaterial color="#0d0820" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* ── CENTRAL ELEVATED PLATFORM (40×40) ───────────────────────────── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[40, 0.5, 40]} />
          <meshStandardMaterial color="#1a1040" roughness={0.6} metalness={0.5} />
        </mesh>
      </RigidBody>
      {/* Platform edge trim */}
      {[0,1,2,3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={`trim-${i}`} position={[Math.cos(a)*20.5, 0.6, Math.sin(a)*20.5]} castShadow>
            <boxGeometry args={[i % 2 === 0 ? 1 : 40, 0.3, i % 2 === 0 ? 40 : 1]} />
            <meshStandardMaterial color="#5500aa" emissive="#7700ff" emissiveIntensity={0.6} />
          </mesh>
        )
      })}

      {/* ── ENERGY GRID SHADER ON PLATFORM ──────────────────────────────── */}
      <EnergyGridFloor />

      {/* ── ENERGY SURGE GROUND PULSES ───────────────────────────────────── */}
      <EnergySurges />

      {/* ── LIGHTNING ARCS BETWEEN PORTALS ───────────────────────────────── */}
      <LightningArcs />

      {/* ── POWER BEAM PILLARS (4 corners) ───────────────────────────────── */}
      <PowerBeamPillars />

      {/* ── FLOATING ENERGY DEBRIS (25 orbiting boxes) ───────────────────── */}
      <EnergyDebris />

      {/* ── 8 OUTER PILLARS ─────────────────────────────────────────────── */}
      {pillarAngles.map((a, i) => {
        const x = Math.cos(a) * PILLAR_R
        const z = Math.sin(a) * PILLAR_R
        return (
          <group key={`pil-${i}`} position={[x, 0, z]}>
            <Pillar />
            {i % 3 === 0 && <Torch pos={[0, 4.5, 0.6]} />}
          </group>
        )
      })}

      {/* ── 4 CORNER TOWERS ─────────────────────────────────────────────── */}
      {([ [55,55],[55,-55],[-55,55],[-55,-55] ] as [number,number][]).map(([tx, tz], i) => (
        <RigidBody key={`tower-${i}`} type="fixed" colliders="cuboid" position={[tx, 10, tz]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4, 20, 4]} />
            <meshStandardMaterial color="#2a2040" roughness={0.85} metalness={0.3} />
          </mesh>
        </RigidBody>
      ))}
      {/* Tower torch tops */}
      {([ [55,55],[55,-55],[-55,55],[-55,-55] ] as [number,number][]).map(([tx, tz], i) => (
        <Torch key={`ttorch-${i}`} pos={[tx, 21, tz]} />
      ))}

      {/* ── ARENA WALLS WITH BATTLEMENTS ────────────────────────────────── */}
      <ArenaWalls />

      {/* ── POWER ORBS (3 rings) ─────────────────────────────────────────── */}
      <PowerOrbs />

      {/* ── ABILITY PICKUP ORBS (8 glowing, each a different ability) ────── */}
      <AbilityOrbs />

      {/* ── TRAINING TARGET DUMMIES (6, semicircle in front of boss area) ── */}
      <TrainingTargetDummies />

      {/* ── POWER PLATFORMS (4 quadrant glowing pads) ────────────────────── */}
      <PowerPlatforms />

      {/* ── PORTAL GATES N/S/E/W ────────────────────────────────────────── */}
      <Portal pos={[0, 0, -45]} />
      <Portal pos={[0, 0,  45]} />
      <Portal pos={[-45, 0, 0]} />
      <Portal pos={[ 45, 0, 0]} />

      {/* ── ABILITY PEDESTALS (6 Altars at r=22) ────────────────────────── */}
      {altarAngles.map((a, i) => {
        const x = Math.cos(a) * 22
        const z = Math.sin(a) * 22
        return <Altar key={`altar-${i}`} pos={[x, 0, z]} />
      })}

      {/* ── TARGET DUMMIES (8 at r=15) ───────────────────────────────────── */}
      {DUMMY_POSITIONS.map((pos, i) => (
        <TargetDummy key={`dummy-${i}`} pos={pos} />
      ))}

      {/* ── DRAMATIC ENTRANCE ARCHWAY (spawn side z=90) ─────────────────── */}
      {/* Left pillar */}
      <RigidBody type="fixed" colliders="cuboid" position={[-4, 6, 88]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 12, 1.5]} />
          <meshStandardMaterial color="#3a1a6a" emissive="#6600cc" emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
      {/* Right pillar */}
      <RigidBody type="fixed" colliders="cuboid" position={[4, 6, 88]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 12, 1.5]} />
          <meshStandardMaterial color="#3a1a6a" emissive="#6600cc" emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
      {/* Top beam */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 12.5, 88]}>
        <mesh castShadow>
          <boxGeometry args={[10, 1.5, 1.5]} />
          <meshStandardMaterial color="#3a1a6a" emissive="#aa44ff" emissiveIntensity={0.8} />
        </mesh>
      </RigidBody>
      <Lantern pos={[-5, 0, 87]} />
      <Lantern pos={[ 5, 0, 87]} />

      {/* ── BOSS ARENA (far end z=-80) ────────────────────────────────────── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.5, -80]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[20, 1, 20]} />
          <meshStandardMaterial color="#3d0a0a" emissive="#cc2200" emissiveIntensity={0.25} metalness={0.6} roughness={0.4} />
        </mesh>
      </RigidBody>
      {/* Boss platform gold trim */}
      <mesh position={[0, 1.1, -80]}>
        <boxGeometry args={[20.5, 0.15, 20.5]} />
        <meshStandardMaterial color="#cc8800" emissive="#ffaa00" emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
      </mesh>
      <pointLight color="#ff2200" intensity={10} distance={35} position={[0, 8, -80]} />
      <GltfMonster which="alien" pos={[0, 1.5, -80]} scale={2.5} rotY={Math.PI} animation="Wave" />

      {/* ── CRYSTAL DECORATIONS (8 at arena edges) ───────────────────────── */}
      {crystalAngles.map((a, i) => {
        const r = 70
        const x = Math.cos(a) * r
        const z = Math.sin(a) * r
        return <Crystal key={`crys-${i}`} pos={[x, 0, z]} />
      })}

      {/* ── ENERGY MOTES ─────────────────────────────────────────────────── */}
      <EnergyMotes />

      {/* ── NPCs ─────────────────────────────────────────────────────────── */}
      <NPC
        pos={[-35, 0, 0]}
        name="МАСТЕР"
        color="#ff4488"
        dialog="Добро пожаловать в арену силы! Уничтожь всех врагов!"
      />
      <NPC
        pos={[35, 0, 0]}
        name="ТРЕНЕР"
        color="#44aaff"
        dialog="Используй порталы для быстрого перемещения по арене."
      />
      <NPC
        pos={[0, 0, 60]}
        name="ХРАНИТЕЛЬ"
        color="#44ffaa"
        dialog="Пьедесталы силы восстанавливают твою энергию. Используй их!"
      />

      {/* ── SIGN at entrance ─────────────────────────────────────────────── */}
      <Sign pos={[0, 0, 80]} text="АРЕНА СИЛЫ" />

      {/* ── ENEMIES (5) ──────────────────────────────────────────────────── */}
      <Enemy pos={[-20, 0, -20]} />
      <Enemy pos={[ 20, 0, -20]} />
      <Enemy pos={[ 0,  0, -35]} />
      <Enemy pos={[-18, 0,  15]} />
      <Enemy pos={[ 18, 0,  15]} />

      {/* ── COINS (20) ───────────────────────────────────────────────────── */}
      {[
        [-5,1,5],[5,1,5],[0,1,10],[-10,1,0],[10,1,0],
        [-8,1,-8],[8,1,-8],[0,1,-18],[-15,1,5],[15,1,5],
        [-25,1,25],[25,1,25],[-25,1,-25],[25,1,-25],
        [0,1,30],[-30,1,0],[30,1,0],[0,1,-50],
        [-12,1,-30],[12,1,-30],
      ].map((p, i) => (
        <Coin key={`coin-${i}`} pos={p as [number,number,number]} />
      ))}

      {/* ── BOSS GOLEM "СТРАЖ АРЕНЫ" — center of arena near goal ───────── */}
      <BossGolem pos={[0, 1, -75]} scale={2.2} rotY={Math.PI} />

      {/* ── BOSS WIZARD "МАСТЕР СПОСОБНОСТЕЙ" — far corner (NW) ─────────── */}
      <BossWizard pos={[-72, 1, -72]} scale={1.8} rotY={Math.PI * 0.75} />

      {/* ── CRYSTAL CLUSTERS — energy formations around arena edges (9) ──── */}
      {([
        [ 85,  0,   0], [-85,  0,   0],
        [  0,  0,  85], [  0,  0, -85],
        [ 60,  0,  60], [-60,  0,  60],
        [ 60,  0, -60], [-60,  0, -60],
        [  0,  0,  45],
      ] as [number, number, number][]).map(([cx, cy, cz], i) => (
        <CrystalCluster
          key={`cc-${i}`}
          pos={[cx, cy, cz]}
          scale={1.4 + (i % 3) * 0.3}
          rotY={(i / 9) * Math.PI * 2}
        />
      ))}

      {/* ── ENERGY ORBS — decorative orbs scattered across the arena ──── */}
      <EnergyOrb pos={[-28, 2.0, 30]} scale={1.1} />
      <EnergyOrb pos={[28, 1.5, -30]} scale={0.9} />
      <EnergyOrb pos={[50, 2.5, 20]} scale={1.3} />
      <EnergyOrb pos={[-50, 2.0, -20]} scale={1.0} />
      <EnergyOrb pos={[10, 1.8, 55]} scale={1.2} />
      <EnergyOrb pos={[-10, 2.3, -55]} scale={0.8} />

      {/* ── LAVA ROCKS — battle terrain at corners/edges (5) ────────────── */}
      {([
        [ 75,  0,  75],
        [-75,  0,  75],
        [ 75,  0, -75],
        [-75,  0, -75],
        [  0,  0, -60],
      ] as [number, number, number][]).map(([rx, ry, rz], i) => (
        <LavaRock
          key={`lr-${i}`}
          pos={[rx, ry, rz]}
          scale={1.6 + (i % 2) * 0.4}
          rotY={(i / 5) * Math.PI * 2}
        />
      ))}

      {/* ── CRYSTAL SWORD PICKUPS (4 ability/power pickups) ─────────────── */}
      <CrystalSword pos={[8, 0, -15]} scale={1.5} rotY={0.3} />
      <CrystalSword pos={[-8, 0, -20]} scale={1.8} rotY={-0.5} />
      <CrystalSword pos={[12, 0, -35]} scale={2.0} rotY={0.8} />
      <CrystalSword pos={[-5, 0, -45]} scale={1.5} rotY={-0.2} />

      {/* ── MAGIC GATE — final arena goal ────────────────────────────────── */}
      <MagicGate pos={[0, 0, -55]} scale={2.5} rotY={0} />

      {/* ── GIANT SCOREBOARD (floating above arena) ──────────────────────── */}
      <ArenaScoreboard />

      {/* ── SPECTATOR STANDS (tiered seating at x:±55) ───────────────────── */}
      <SpectatorStands />

      {/* ── ARENA LIGHT RIGS (4 towers + 12 ring point lights) ───────────── */}
      <ArenaLights />

      {/* ── ARENA LIGHTNING (6 vertical bolt columns) ────────────────────── */}
      <ArenaLightning />

      {/* ── NEBULA RING (cosmic torus framing the arena) ─────────────────── */}
      <NebulaRing />

      {/* ── ARENA BARRIER (glowing energy fence ring at r=92) ────────────── */}
      <ArenaBarrier />

      {/* ── FORCE FIELD TOP (translucent cap disc at y=20) ───────────────── */}
      <ForceFieldTop />

      {/* ── ABILITY CRAFTING FORGE (forging station at z=+20) ────────────── */}
      <AbilityCraftingForge position={[0, 0, 20]} />

      {/* ── SPELL TOMES LIBRARY (8 books orbiting the forge) ─────────────── */}
      <SpellTomesLibrary position={[0, 0, 20]} />

      {/* ── ABILITY PREVIEW DISPLAYS (flanking the forge at ±7) ─────────── */}
      <AbilityPreview position={[7, 0, 20]} />
      <AbilityPreview position={[-7, 0, 20]} />

      {/* ── GOAL TRIGGER ─────────────────────────────────────────────────── */}
      <GoalTrigger
        pos={[0, 2, -80]}
        size={[20, 4, 20]}
        result={{
          kind: 'win',
          label: 'АРЕНА ПРОЙДЕНА!',
          subline: 'Ты победил всех врагов!',
        }}
      />
    </>
  )
}

export const ABILITY_SPAWN: [number, number, number] = [0, 3, 0]
