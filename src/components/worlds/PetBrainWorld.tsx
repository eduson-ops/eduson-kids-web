import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import NPC from '../NPC'
import { Crystal, MushroomGlow, Lantern, Pillar, Portal, BossGolem, CrystalCluster, IceBlock } from '../Scenery'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

// ─── SPAWN ────────────────────────────────────────────────────────────────────
export const PETBRAIN_SPAWN: [number, number, number] = [0, 3, 6]

// ─── SHADERS ──────────────────────────────────────────────────────────────────
const BINARY_VERT = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`
const BINARY_FRAG = `
  uniform float iTime; varying vec2 vUv;
  float rand(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
  void main(){
    vec2 cell=floor(vUv*40.);
    float col_speed=rand(vec2(cell.x,0.))*3.+1.;
    float digit=step(.5,rand(vec2(cell.x,floor(vUv.y*40.+iTime*col_speed))));
    float bright=smoothstep(0.,.15,fract(vUv.y*40.+iTime*col_speed));
    gl_FragColor=vec4(vec3(0.,digit*bright,digit*bright*.4),.95);
  }
`

const BRAIN_VERT = `
  varying vec3 vNormal; varying vec3 vPosition;
  void main(){
    vNormal=normalize(normalMatrix*normal);
    vPosition=position;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`
const BRAIN_FRAG = `
  uniform float iTime; varying vec3 vNormal; varying vec3 vPosition;
  float rand(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
  void main(){
    float pulse=sin(iTime*2.+vPosition.y*0.8)*0.5+0.5;
    float vein=sin(vPosition.x*4.+iTime)*sin(vPosition.z*4.-iTime*0.7)*0.5+0.5;
    vec3 base=vec3(0.0,0.7+vein*0.3,0.4+pulse*0.2);
    float fresnel=pow(1.-abs(dot(vNormal,vec3(0.,0.,1.))),2.5);
    gl_FragColor=vec4(base*fresnel+vec3(0.,0.05,0.02),0.35+fresnel*0.4);
  }
`

const WALL_VERT = `
  varying vec2 vUv;
  void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`
const WALL_FRAG = `
  uniform float iTime; varying vec2 vUv;
  void main(){
    float grid=step(0.97,fract(vUv.x*20.))+step(0.97,fract(vUv.y*10.));
    float pulse=sin(iTime*1.5+vUv.x*6.28)*0.5+0.5;
    vec3 col=vec3(0.,1.,0.3)*grid*(0.4+pulse*0.6);
    gl_FragColor=vec4(col,0.85);
  }
`

// ─── NEURAL NETWORK LAYOUT ────────────────────────────────────────────────────
// Input layer: 6 nodes at x=-30
const INPUT_NODES: [number, number, number][] = Array.from({ length: 6 }, (_, i) => [
  -30, 2, -15 + i * 6,
])
// Hidden layer: 8 nodes at x=0
const HIDDEN_NODES: [number, number, number][] = Array.from({ length: 8 }, (_, i) => [
  0, 2, -17.5 + i * 5,
])
// Output layer: 4 nodes at x=30
const OUTPUT_NODES: [number, number, number][] = Array.from({ length: 4 }, (_, i) => [
  30, 2, -7.5 + i * 5,
])

// Build connection pairs as flat index into combined [input, hidden, output]
// input indices 0..5, hidden 6..13, output 14..17
const buildConnections = () => {
  const pairs: Array<[[number, number, number], [number, number, number]]> = []
  INPUT_NODES.forEach((inp) =>
    HIDDEN_NODES.forEach((hid) => pairs.push([inp, hid]))
  )
  HIDDEN_NODES.forEach((hid) =>
    OUTPUT_NODES.forEach((out) => pairs.push([hid, out]))
  )
  return pairs
}
const ALL_CONNECTIONS = buildConnections()

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cylinderBetween(
  a: [number, number, number],
  b: [number, number, number]
): { position: [number, number, number]; quaternion: THREE.Quaternion; length: number } {
  const av = new THREE.Vector3(...a)
  const bv = new THREE.Vector3(...b)
  const mid = new THREE.Vector3().addVectors(av, bv).multiplyScalar(0.5)
  const dir = new THREE.Vector3().subVectors(bv, av)
  const length = dir.length()
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize())
  return { position: [mid.x, mid.y, mid.z], quaternion, length }
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function MatrixFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.elapsedTime
  })
  return (
    <>
      {/* Solid dark base */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[150, 0.5, 150]} />
          <meshStandardMaterial color="#020a05" roughness={1} />
        </mesh>
      </RigidBody>
      {/* Shader overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[150, 150]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={BINARY_VERT}
          fragmentShader={BINARY_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function NeuralConnections() {
  // Render all connections as thin cylinders
  const connections = useMemo(() => ALL_CONNECTIONS, [])
  return (
    <>
      {connections.map((pair, i) => {
        const { position, quaternion, length } = cylinderBetween(pair[0], pair[1])
        return (
          <mesh key={i} position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.025, 0.025, length, 4, 1]} />
            <meshBasicMaterial
              color={i < INPUT_NODES.length * HIDDEN_NODES.length ? '#00aaff' : '#aa00ff'}
              transparent
              opacity={0.25}
            />
          </mesh>
        )
      })}
    </>
  )
}

function NeuralNodes() {
  const inputRefs = useRef<(THREE.Mesh | null)[]>([])
  const hiddenRefs = useRef<(THREE.Mesh | null)[]>([])
  const outputRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    inputRefs.current.forEach((m, i) => {
      if (m) m.scale.setScalar(1 + 0.25 * Math.sin(t * 2.2 + i * 1.1))
    })
    hiddenRefs.current.forEach((m, i) => {
      if (m) m.scale.setScalar(1 + 0.3 * Math.sin(t * 1.8 + i * 0.9))
    })
    outputRefs.current.forEach((m, i) => {
      if (m) m.scale.setScalar(1 + 0.28 * Math.sin(t * 2.5 + i * 1.3))
    })
  })

  return (
    <>
      {INPUT_NODES.map((pos, i) => (
        <group key={`inp-${i}`} position={pos}>
          <mesh ref={(el) => { inputRefs.current[i] = el }}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.2} />
          </mesh>
          <pointLight color="#00ccff" intensity={1.5} distance={8} />
        </group>
      ))}
      {HIDDEN_NODES.map((pos, i) => (
        <group key={`hid-${i}`} position={pos}>
          <mesh ref={(el) => { hiddenRefs.current[i] = el }}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#cc00ff" emissive="#cc00ff" emissiveIntensity={1.2} />
          </mesh>
          <pointLight color="#aa00ff" intensity={1.2} distance={8} />
        </group>
      ))}
      {OUTPUT_NODES.map((pos, i) => (
        <group key={`out-${i}`} position={pos}>
          <mesh ref={(el) => { outputRefs.current[i] = el }}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={1.2} />
          </mesh>
          <pointLight color="#ff6600" intensity={1.2} distance={8} />
        </group>
      ))}
    </>
  )
}

// ─── SYNAPTIC SPARKS ──────────────────────────────────────────────────────────
const ALL_NODES: [number, number, number][] = [...INPUT_NODES, ...HIDDEN_NODES, ...OUTPUT_NODES]

function SynapticSparks() {
  const COUNT = 40
  const sparkData = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      connIdx: Math.floor(Math.random() * ALL_CONNECTIONS.length),
      progress: Math.random(),
      speed: 0.4 + Math.random() * 0.8,
      color: i % 2 === 0 ? '#00ffcc' : '#ff44aa',
    }))
  }, [])
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const _av = useRef(new THREE.Vector3())
  const _bv = useRef(new THREE.Vector3())
  const colorArray = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const col = new THREE.Color()
    sparkData.forEach((s, i) => { col.set(s.color); arr[i*3]=col.r; arr[i*3+1]=col.g; arr[i*3+2]=col.b })
    return arr
  }, [sparkData])

  useFrame((_, dt) => {
    sparkData.forEach((s, i) => {
      s.progress += dt * s.speed
      if (s.progress >= 1) {
        s.connIdx = Math.floor(Math.random() * ALL_CONNECTIONS.length)
        s.progress = 0
      }
      const conn = ALL_CONNECTIONS[s.connIdx]!
      _av.current.set(conn[0][0], conn[0][1], conn[0][2])
      _bv.current.set(conn[1][0], conn[1][1], conn[1][2])
      dummy.position.lerpVectors(_av.current, _bv.current, s.progress)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.06, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

// ─── NODE PULSE RINGS ─────────────────────────────────────────────────────────
function NodePulseRings() {
  const ringData = useMemo(() =>
    ALL_NODES.map((pos, i) => ({
      pos,
      scale: (i / ALL_NODES.length),  // stagger initial phases
      speed: 0.6 + (i % 4) * 0.15,
    })),
  [])
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((_, dt) => {
    ringData.forEach((r, i) => {
      r.scale += dt * r.speed
      if (r.scale >= 2) r.scale = 0
      const m = ringRefs.current[i]
      if (!m) return
      const s = r.scale
      m.scale.setScalar(s)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - s / 2)
    })
  })

  return (
    <>
      {ringData.map((r, i) => (
        <mesh key={i} ref={(el) => { ringRefs.current[i] = el }} position={r.pos} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.04, 8, 32]} />
          <meshBasicMaterial color="#44ffcc" transparent opacity={1} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// ─── SCAN BEAM ────────────────────────────────────────────────────────────────
function ScanBeam() {
  const beamRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (beamRef.current) {
      // sweeps y from -5 to 10 and back
      beamRef.current.position.y = 2.5 + 7.5 * Math.sin(clock.elapsedTime * 0.4)
    }
  })

  return (
    <mesh ref={beamRef} rotation={[0, 0, 0]} position={[0, 2.5, 0]}>
      <planeGeometry args={[150, 0.1]} />
      <meshBasicMaterial color="#00ffaa" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── DATA STREAM COLUMNS ──────────────────────────────────────────────────────
function DataStreamColumns() {
  const xs = [-30, -18, -6, 6, 18, 30]
  return (
    <>
      {xs.map((x, i) => (
        <mesh key={i} position={[x, 0, -35]}>
          <cylinderGeometry args={[0.08, 0.08, 12, 8, 1]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// Sample a subset of connections for data pulses
const PULSE_CONNECTIONS = ALL_CONNECTIONS.filter((_, i) => i % 5 === 0)

function DataPulses() {
  const progressRef = useRef<number[]>(
    PULSE_CONNECTIONS.map((_, i) => i / PULSE_CONNECTIONS.length)
  )
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((_, dt) => {
    progressRef.current = progressRef.current.map((p, i) => {
      const next = p + dt * (0.6 + (i % 3) * 0.2)
      return next > 1 ? next - 1 : next
    })
    meshRefs.current.forEach((m, i) => {
      if (!m) return
      const conn = PULSE_CONNECTIONS[i]!
      const av = new THREE.Vector3(...conn[0])
      const bv = new THREE.Vector3(...conn[1])
      m.position.lerpVectors(av, bv, progressRef.current[i]!)
    })
  })

  return (
    <>
      {PULSE_CONNECTIONS.map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el }}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#00ffcc' : '#ff88ff'} />
        </mesh>
      ))}
    </>
  )
}

function FoodBowl() {
  const particleRefs = useRef<(THREE.Mesh | null)[]>([])
  const particleData = useMemo(
    () => Array.from({ length: 6 }, (_, i) => ({ angle: (i / 6) * Math.PI * 2, r: 0.5 + Math.random() * 0.3, speed: 1.5 + Math.random() })),
    []
  )
  useFrame(({ clock }) => {
    particleData.forEach((p, i) => {
      const m = particleRefs.current[i]
      if (!m) return
      const a = p.angle + clock.elapsedTime * p.speed
      m.position.set(Math.cos(a) * p.r, 0.35 + Math.sin(clock.elapsedTime * 3 + i) * 0.12, Math.sin(a) * p.r)
    })
  })
  return (
    <group position={[-40, 0, -30]}>
      {/* Bowl */}
      <mesh>
        <cylinderGeometry args={[1.2, 0.8, 0.4, 20]} />
        <meshStandardMaterial color="#1a4a2a" emissive="#00ff66" emissiveIntensity={0.3} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Food surface */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.0, 0.9, 0.08, 20]} />
        <meshStandardMaterial color="#00cc44" emissive="#00ff44" emissiveIntensity={0.8} />
      </mesh>
      {/* Floating particles */}
      {particleData.map((_, i) => (
        <mesh key={i} ref={(el) => { particleRefs.current[i] = el }}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color="#88ffaa" />
        </mesh>
      ))}
      <pointLight color="#00ff44" intensity={2} distance={6} position={[0, 1, 0]} />
    </group>
  )
}

function PetBed() {
  return (
    <group position={[-40, 0, 30]}>
      {/* Base */}
      <mesh>
        <boxGeometry args={[3, 0.3, 2]} />
        <meshStandardMaterial color="#112233" emissive="#0044aa" emissiveIntensity={0.4} roughness={0.7} />
      </mesh>
      {/* Soft padding */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[2.8, 0.12, 1.8]} />
        <meshStandardMaterial color="#224466" emissive="#0066cc" emissiveIntensity={0.3} />
      </mesh>
      {/* Sleeping pet blob */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.55, 14, 10]} />
        <meshStandardMaterial color="#aaddff" emissive="#0088ff" emissiveIntensity={0.5} />
      </mesh>
      <pointLight color="#0066ff" intensity={1.5} distance={7} position={[0, 1.5, 0]} />
    </group>
  )
}

function TrainingRing() {
  const ringRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.elapsedTime
      ;(ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4
    }
  })
  return (
    <group position={[40, 0, 0]}>
      {/* Flat glowing torus */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[4, 0.15, 8, 60]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>
      <Crystal pos={[2.8, 0, 2.8]} />
      <Crystal pos={[-2.8, 0, 2.8]} />
      <Crystal pos={[2.8, 0, -2.8]} />
      <Crystal pos={[-2.8, 0, -2.8]} />
      <pointLight color="#ffaa00" intensity={2} distance={10} position={[0, 2, 0]} />
    </group>
  )
}

function BrainScanRoom() {
  const brainMatRef = useRef<THREE.ShaderMaterial>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const brainUniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (brainMatRef.current) brainMatRef.current.uniforms.iTime!.value = clock.elapsedTime
    if (ringRef.current) ringRef.current.rotation.z = clock.elapsedTime * 0.6
  })

  return (
    <group position={[0, 0, -60]}>
      {/* Brain sphere */}
      <mesh position={[0, 9, 0]}>
        <sphereGeometry args={[8, 32, 32]} />
        <shaderMaterial
          ref={brainMatRef}
          vertexShader={BRAIN_VERT}
          fragmentShader={BRAIN_FRAG}
          uniforms={brainUniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Rotating ring */}
      <mesh ref={ringRef} position={[0, 9, 0]}>
        <torusGeometry args={[9.5, 0.25, 8, 80]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1.5} />
      </mesh>
      {/* Inner glow */}
      <pointLight color="#00ff88" intensity={8} distance={25} position={[0, 9, 0]} />
      {/* Pillars at corners */}
      <Pillar pos={[-8, 0, -10]} />
      <Pillar pos={[8, 0, -10]} />
      <Pillar pos={[-8, 0, 10]} />
      <Pillar pos={[8, 0, 10]} />
      {/* Lanterns */}
      <Lantern pos={[-5, 0, -8]} />
      <Lantern pos={[5, 0, -8]} />
    </group>
  )
}

function StarField() {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const positions = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 300
      positions[i * 3 + 1] = 20 + Math.random() * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])
  return (
    <points geometry={geom}>
      <pointsMaterial color="#aaffdd" size={0.25} sizeAttenuation />
    </points>
  )
}

function DataParticles() {
  interface Particle { pos: THREE.Vector3; vel: THREE.Vector3 }
  const COUNT = 30
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: COUNT }, () => ({
      pos: new THREE.Vector3((Math.random()-0.5)*140, 0.5+Math.random()*5, (Math.random()-0.5)*140),
      vel: new THREE.Vector3((Math.random()-0.5)*2, Math.random()*0.5, (Math.random()-0.5)*2),
    })), [])
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArray = useMemo(() => {
    const arr = new Float32Array(COUNT * 3)
    const c0 = new THREE.Color('#00ffaa'); const c1 = new THREE.Color('#00ccff')
    for (let i = 0; i < COUNT; i++) { const c = i%2===0?c0:c1; arr[i*3]=c.r; arr[i*3+1]=c.g; arr[i*3+2]=c.b }
    return arr
  }, [])

  useFrame((_, dt) => {
    particles.forEach((p, i) => {
      p.pos.addScaledVector(p.vel, dt)
      if (p.pos.y > 8) p.pos.y = 0.5
      if (Math.abs(p.pos.x) > 72) p.vel.x *= -1
      if (Math.abs(p.pos.z) > 72) p.vel.z *= -1
      dummy.position.copy(p.pos)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.12, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colorArray, 3]} />
    </instancedMesh>
  )
}

function ProgressWall() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.iTime!.value = clock.elapsedTime
  })
  return (
    <mesh position={[0, 5, 70]}>
      <boxGeometry args={[60, 10, 0.5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={WALL_VERT}
        fragmentShader={WALL_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── NEURAL PULSE PARTICLES ───────────────────────────────────────────────────
// 30 instanced pulses: 10 input→hidden, 10 hidden→output, 10 hidden→hidden
function NeuralPulses() {
  const COUNT = 30
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const _src = useMemo(() => new THREE.Vector3(), [])
  const _dst = useMemo(() => new THREE.Vector3(), [])

  // Build connection pools
  const inputToHidden = useMemo(() => {
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = []
    INPUT_NODES.forEach((a) => HIDDEN_NODES.forEach((b) =>
      pairs.push([new THREE.Vector3(...a), new THREE.Vector3(...b)])
    ))
    return pairs
  }, [])

  const hiddenToOutput = useMemo(() => {
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = []
    HIDDEN_NODES.forEach((a) => OUTPUT_NODES.forEach((b) =>
      pairs.push([new THREE.Vector3(...a), new THREE.Vector3(...b)])
    ))
    return pairs
  }, [])

  const hiddenToHidden = useMemo(() => {
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = []
    for (let i = 0; i < HIDDEN_NODES.length; i++) {
      for (let j = 0; j < HIDDEN_NODES.length; j++) {
        if (i !== j) pairs.push([new THREE.Vector3(...HIDDEN_NODES[i]!), new THREE.Vector3(...HIDDEN_NODES[j]!)])
      }
    }
    return pairs
  }, [])

  // Per-particle state
  const pulses = useMemo(() => {
    const arr: Array<{
      t: number
      speed: number
      srcIdx: number
      dstIdx: number
      pool: 0 | 1 | 2
    }> = []
    for (let i = 0; i < COUNT; i++) {
      const pool: 0 | 1 | 2 = i < 10 ? 0 : i < 20 ? 1 : 2
      arr.push({
        t: Math.random(),
        speed: 0.4 + Math.random() * 0.4,
        srcIdx: 0,
        dstIdx: 0,
        pool,
      })
    }
    return arr
  }, [])

  // Initialise random connection indices once pools are ready
  useMemo(() => {
    pulses.forEach((p) => {
      const pool = p.pool === 0 ? inputToHidden : p.pool === 1 ? hiddenToOutput : hiddenToHidden
      p.srcIdx = Math.floor(Math.random() * pool.length)
      p.dstIdx = p.srcIdx  // same index = both ends of the chosen pair
    })
  }, [pulses, inputToHidden, hiddenToOutput, hiddenToHidden])

  useFrame((_, dt) => {
    const mesh = meshRef.current
    if (!mesh) return

    pulses.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t >= 1) {
        p.t = 0
        const pool = p.pool === 0 ? inputToHidden : p.pool === 1 ? hiddenToOutput : hiddenToHidden
        p.srcIdx = Math.floor(Math.random() * pool.length)
      }

      const pool = p.pool === 0 ? inputToHidden : p.pool === 1 ? hiddenToOutput : hiddenToHidden
      const pair = pool[p.srcIdx]!
      _src.copy(pair[0])
      _dst.copy(pair[1])

      dummy.position.lerpVectors(_src, _dst, p.t)

      const s = Math.sin(p.t * Math.PI) * 0.8 + 0.2
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.18, 6, 6]} />
      <meshBasicMaterial color="#00ffaa" />
    </instancedMesh>
  )
}

// ─── SYNAPSE PULSES ───────────────────────────────────────────────────────────
// Instanced sparks that travel from nodeA → nodeB along every connection.
// We use a subset of ALL_CONNECTIONS (every 2nd) to keep draw-call light while
// still covering both layers.  Each selected connection gets 3 pulses.
const SYNAPSE_CONNECTIONS = ALL_CONNECTIONS.filter((_, i) => i % 2 === 0)
const PULSES_PER_CONN = 3
const SYNAPSE_COUNT = SYNAPSE_CONNECTIONS.length * PULSES_PER_CONN  // ~60

const SYNAPSE_COLORS = ['#00ffaa', '#00ccff', '#cc44ff'] as const

interface SynapsePulseData {
  connIdx: number
  speed: number
  phase: number
  colorIndex: number
}

function SynapsePulses() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const pulseData = useMemo<SynapsePulseData[]>(() => {
    const arr: SynapsePulseData[] = []
    SYNAPSE_CONNECTIONS.forEach((_, ci) => {
      for (let p = 0; p < PULSES_PER_CONN; p++) {
        arr.push({
          connIdx: ci,
          speed: 0.4 + Math.random() * 0.8,
          phase: Math.random(),
          colorIndex: (ci * PULSES_PER_CONN + p) % SYNAPSE_COLORS.length,
        })
      }
    })
    return arr
  }, [])

  // Pre-bake THREE.Vector3 endpoints for every used connection
  const endpoints = useMemo<Array<[THREE.Vector3, THREE.Vector3]>>(() =>
    SYNAPSE_CONNECTIONS.map(([a, b]) => [new THREE.Vector3(...a), new THREE.Vector3(...b)]),
  [])

  // Apply per-instance colors once
  const colorRef = useRef(false)

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    // Paint instance colors on first frame
    if (!colorRef.current) {
      pulseData.forEach((pd, i) => {
        mesh.setColorAt(i, new THREE.Color(SYNAPSE_COLORS[pd.colorIndex]))
      })
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      colorRef.current = true
    }

    const t = clock.elapsedTime
    pulseData.forEach((pd, i) => {
      const tAlong = ((t * pd.speed + pd.phase) % 1 + 1) % 1
      const [av, bv] = endpoints[pd.connIdx]!
      dummy.position.lerpVectors(av, bv, tAlong)
      const s = 0.5 + 0.5 * Math.sin(t * 8 + pd.phase * Math.PI * 2)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SYNAPSE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.15, 5, 4]} />
      <meshBasicMaterial color="#00ffaa" transparent opacity={0.9} depthWrite={false} vertexColors />
    </instancedMesh>
  )
}

// ─── BRAIN PULSE RINGS ────────────────────────────────────────────────────────
// 2 expanding torus rings that periodically emit from the central brain sphere.
// Brain world-space position: group [0,0,-60] + mesh [0,9,0] = [0, 9, -60]
const BRAIN_CENTER: [number, number, number] = [0, 9, -60]
const RING_PHASES = [0, 0.5] as const

function BrainPulseRing() {
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    RING_PHASES.forEach((phase, i) => {
      const m = ringRefs.current[i]
      if (!m) return
      const r = ((t * 4 + phase) % 8)  // 0..8
      m.scale.setScalar(r)
      ;(m.material as THREE.MeshBasicMaterial).opacity = ((8 - r) / 8) * 0.7
    })
  })

  return (
    <>
      {RING_PHASES.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { ringRefs.current[i] = el }}
          position={BRAIN_CENTER}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.08, 6, 32]} />
          <meshBasicMaterial color="#44ffaa" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}

// ─── ZONE HALOS ───────────────────────────────────────────────────────────────
// Glowing animated torus rings floating above each pet zone at y=3

const ZONE_HALO_DEFS = [
  { pos: [-40, 3, -30] as [number, number, number], color: '#00ffaa', radius: 3,   tube: 0.08, speed:  0.5 },
  { pos: [-40, 3,  30] as [number, number, number], color: '#ff44aa', radius: 3.5, tube: 0.08, speed: -0.4 },
  { pos: [ 40, 3,   0] as [number, number, number], color: '#44aaff', radius: 4,   tube: 0.1,  speed:  0.6 },
]

function ZoneHalos() {
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((_, dt) => {
    ZONE_HALO_DEFS.forEach((def, i) => {
      const m = ringRefs.current[i]
      if (m) m.rotation.y += def.speed * dt
    })
  })

  return (
    <>
      {ZONE_HALO_DEFS.map((def, i) => (
        <group key={i} position={def.pos}>
          <mesh ref={(el) => { ringRefs.current[i] = el }}>
            <torusGeometry args={[def.radius, def.tube, 12, 80]} />
            <meshBasicMaterial color={def.color} transparent={false} toneMapped={false} />
          </mesh>
          <pointLight color={def.color} intensity={3} distance={15} />
        </group>
      ))}
    </>
  )
}

// ─── DATA PARTICLE RINGS ──────────────────────────────────────────────────────
// 60 instanced small spheres orbiting the 3 pet zones at y=1.5, 20 per zone

const ZONE_ORBIT_DEFS = [
  { cx: -40, cz: -30, color: '#00ffaa', speed: 0.9  },
  { cx: -40, cz:  30, color: '#ff44aa', speed: -0.7 },
  { cx:  40, cz:   0, color: '#44aaff', speed: 1.1  },
]
const ORBIT_RADIUS = 4
const PER_ZONE = 20
const TOTAL_ORBIT = PER_ZONE * ZONE_ORBIT_DEFS.length  // 60

function DataParticleRings() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Pre-compute per-instance phase offset so each sphere starts spread out
  const phases = useMemo(
    () => Array.from({ length: TOTAL_ORBIT }, (_, i) => (i % PER_ZONE) * ((Math.PI * 2) / PER_ZONE)),
    []
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.elapsedTime

    ZONE_ORBIT_DEFS.forEach((zone, zoneIdx) => {
      for (let j = 0; j < PER_ZONE; j++) {
        const instanceIdx = zoneIdx * PER_ZONE + j
        const angle = t * zone.speed + phases[instanceIdx]!
        dummy.position.set(
          zone.cx + Math.cos(angle) * ORBIT_RADIUS,
          1.5,
          zone.cz + Math.sin(angle) * ORBIT_RADIUS
        )
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(instanceIdx, dummy.matrix)
      }
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  // Build per-instance colors: 20 of each zone color
  const instanceColor = useMemo(() => {
    const colors: THREE.Color[] = []
    ZONE_ORBIT_DEFS.forEach((zone) => {
      const c = new THREE.Color(zone.color)
      for (let j = 0; j < PER_ZONE; j++) colors.push(c)
    })
    return colors
  }, [])

  // Apply colors after first render via a ref callback
  const applyColors = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return
    instanceColor.forEach((c, i) => mesh.setColorAt(i, c))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  return (
    <instancedMesh
      ref={(el) => {
        ;(meshRef as React.MutableRefObject<THREE.InstancedMesh | null>).current = el
        applyColors(el)
      }}
      args={[undefined, undefined, TOTAL_ORBIT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  )
}

// ─── DNA HELIX ────────────────────────────────────────────────────────────────
const DNA_COUNT = 40
const DNA_CX = -60
const DNA_CZ = -40

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null!)
  const strandARef = useRef<THREE.InstancedMesh>(null!)
  const strandBRef = useRef<THREE.InstancedMesh>(null!)
  const rungsRef = useRef<THREE.InstancedMesh>(null!)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Bake node positions for both strands
  const strandAPositions = useMemo(() =>
    Array.from({ length: DNA_COUNT }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.4) * 3,
      i * 0.5,
      Math.cos(i * 0.4) * 3,
    )),
  [])

  const strandBPositions = useMemo(() =>
    Array.from({ length: DNA_COUNT }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.4 + Math.PI) * 3,
      i * 0.5,
      Math.cos(i * 0.4 + Math.PI) * 3,
    )),
  [])

  // Midpoints for rungs (20 rungs, every 2nd node pair)
  const rungPositions = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => {
      const idx = i * 2
      const a = strandAPositions[idx]!
      const b = strandBPositions[idx]!
      return new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
    }),
  [strandAPositions, strandBPositions])

  // Set instanced matrices once on mount
  useEffect(() => {
    const sa = strandARef.current
    const sb = strandBRef.current
    const ru = rungsRef.current
    if (!sa || !sb || !ru) return

    strandAPositions.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      sa.setMatrixAt(i, dummy.matrix)
    })
    sa.instanceMatrix.needsUpdate = true

    strandBPositions.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      sb.setMatrixAt(i, dummy.matrix)
    })
    sb.instanceMatrix.needsUpdate = true

    rungPositions.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      ru.setMatrixAt(i, dummy.matrix)
    })
    ru.instanceMatrix.needsUpdate = true
  }, [dummy, strandAPositions, strandBPositions, rungPositions])

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.005
  })

  return (
    <group ref={groupRef} position={[DNA_CX, 0, DNA_CZ]}>
      {/* Strand A — pink */}
      <instancedMesh ref={strandARef} args={[undefined, undefined, DNA_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ff4488" emissive="#ff4488" emissiveIntensity={0.8} />
      </instancedMesh>
      {/* Strand B — blue */}
      <instancedMesh ref={strandBRef} args={[undefined, undefined, DNA_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#44aaff" emissive="#44aaff" emissiveIntensity={0.8} />
      </instancedMesh>
      {/* Rungs — green midpoints */}
      <instancedMesh ref={rungsRef} args={[undefined, undefined, 20]} frustumCulled={false}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#aaffaa" emissive="#aaffaa" emissiveIntensity={0.6} />
      </instancedMesh>
      <pointLight color="#ff44aa" intensity={3} distance={20} position={[0, 10, 0]} />
    </group>
  )
}

// ─── NEURON CLUSTERS ──────────────────────────────────────────────────────────
interface NeuronDef {
  pos: [number, number, number]
  phase: number
}

const NEURON_DEFS: NeuronDef[] = [
  { pos: [-50, 12, -20], phase: 0.0 },
  { pos: [ 55, 15, -15], phase: 1.3 },
  { pos: [-25, 18, 45],  phase: 2.1 },
  { pos: [ 30, 14, 45],  phase: 0.7 },
  { pos: [  5, 20, -45], phase: 1.8 },
]

// Dendrite directions: 8 unit vectors radiating outward
const DENDRITE_DIRS = Array.from({ length: 8 }, (_, i) => {
  const theta = (i / 8) * Math.PI * 2
  const phi = (i % 2 === 0) ? Math.PI / 4 : Math.PI * 3 / 4
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  )
})

function NeuronCell({ pos, phase }: NeuronDef) {
  const bodyRef = useRef<THREE.Mesh>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const s = 1 + Math.sin(t * 1.2 + phase) * 0.1
    if (bodyRef.current) bodyRef.current.scale.setScalar(s)
    if (lightRef.current) lightRef.current.intensity = 4 + Math.sin(t * 1.2 + phase) * 1.5
  })

  // Pre-compute dendrite cylinder geometry params
  const dendrites = useMemo(() =>
    DENDRITE_DIRS.map((dir) => {
      const length = 2.5
      const mid = dir.clone().multiplyScalar(length / 2 + 2.5)
      const up = new THREE.Vector3(0, 1, 0)
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize())
      return { mid, quat, length }
    }),
  [])

  return (
    <group position={pos}>
      {/* Cell body */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[2.5, 20, 20]} />
        <meshStandardMaterial
          color="#ffaa44"
          emissive="#ff6600"
          emissiveIntensity={1.5}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Dendrites */}
      {dendrites.map((d, i) => (
        <mesh key={i} position={[d.mid.x, d.mid.y, d.mid.z]} quaternion={d.quat}>
          <cylinderGeometry args={[0.15, 0.15, d.length, 6, 1]} />
          <meshStandardMaterial color="#ffcc66" emissive="#ff8800" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {/* Axon — pointing down */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 5, 6, 1]} />
        <meshStandardMaterial color="#ffdd88" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>
      <pointLight ref={lightRef} color="#ff8800" intensity={4} distance={12} />
    </group>
  )
}

function NeuronClusters() {
  return (
    <>
      {NEURON_DEFS.map((def, i) => (
        <NeuronCell key={i} pos={def.pos} phase={def.phase} />
      ))}
    </>
  )
}

// ─── MINDWAVE ARCS ────────────────────────────────────────────────────────────
// 5 energy arcs, each as 20-sphere InstancedMesh with a traveling spark window

// Arc endpoint pairs — connect major brain-related positions
const ARC_PAIRS: Array<[[number, number, number], [number, number, number]]> = [
  [INPUT_NODES[0]!,  HIDDEN_NODES[0]!],
  [INPUT_NODES[5]!,  HIDDEN_NODES[7]!],
  [HIDDEN_NODES[3]!, OUTPUT_NODES[2]!],
  [OUTPUT_NODES[0]!, [0, 9, -60]],
  [[0, 9, -60],      HIDDEN_NODES[4]!],
]

const ARC_SPHERE_COUNT = 20
const ARC_WINDOW = 4  // visible spheres per arc

function MindwaveArc({ pair, arcIdx }: { pair: [[number, number, number], [number, number, number]]; arcIdx: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const av = useMemo(() => new THREE.Vector3(...pair[0]), [pair])
  const bv = useMemo(() => new THREE.Vector3(...pair[1]), [pair])

  // Parabolic path: 20 points between av and bv with a vertical arc
  const pathPoints = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < ARC_SPHERE_COUNT; i++) {
      const t = i / (ARC_SPHERE_COUNT - 1)
      const pt = new THREE.Vector3().lerpVectors(av, bv, t)
      // parabolic lift: midpoint rises by 8 units
      pt.y += Math.sin(t * Math.PI) * 8
      pts.push(pt)
    }
    return pts
  }, [av, bv])

  // Set all spheres hidden initially
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < ARC_SPHERE_COUNT; i++) {
      dummy.position.set(0, -1000, 0)
      dummy.scale.setScalar(0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [dummy])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.elapsedTime
    // Spark head position along path (0..ARC_SPHERE_COUNT-1), loops
    const speed = 6 + arcIdx * 1.5
    const head = ((t * speed) % ARC_SPHERE_COUNT + ARC_SPHERE_COUNT) % ARC_SPHERE_COUNT

    for (let i = 0; i < ARC_SPHERE_COUNT; i++) {
      // Distance of this sphere from head (wrapping)
      const dist = ((head - i) % ARC_SPHERE_COUNT + ARC_SPHERE_COUNT) % ARC_SPHERE_COUNT
      const visible = dist < ARC_WINDOW
      if (visible) {
        const pt = pathPoints[i]!
        dummy.position.copy(pt)
        const fade = 1 - dist / ARC_WINDOW
        dummy.scale.setScalar(0.25 + fade * 0.2)
      } else {
        dummy.position.set(0, -1000, 0)
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ARC_SPHERE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.85} depthWrite={false} />
    </instancedMesh>
  )
}

function MindwaveArcs() {
  return (
    <>
      {ARC_PAIRS.map((pair, i) => (
        <MindwaveArc key={i} pair={pair} arcIdx={i} />
      ))}
    </>
  )
}

// ─── LAB BENCHES ─────────────────────────────────────────────────────────────
// 4 lab benches placed around the world

const LAB_BENCH_DEFS: Array<{ pos: [number, number, number]; rotY: number }> = [
  { pos: [-15, 0, 30],  rotY: 0 },
  { pos: [ 15, 0, 30],  rotY: 0 },
  { pos: [-15, 0, -30], rotY: Math.PI },
  { pos: [ 15, 0, -30], rotY: Math.PI },
]

function LabBench({ pos, rotY }: { pos: [number, number, number]; rotY: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* Surface */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[6, 0.09, 2]} />
        <meshStandardMaterial color="#ddd8c0" roughness={0.7} />
      </mesh>
      {/* Under-bench cabinet */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[5.8, 0.7, 1.8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.6} />
      </mesh>
      {/* 4 legs */}
      {([ [-2.7, -0.8], [2.7, -0.8], [-2.7, 0.8], [2.7, 0.8] ] as [number, number][]).map(([lx, lz], li) => (
        <mesh key={li} position={[lx, 0.45, lz]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#888888" roughness={0.5} />
        </mesh>
      ))}

      {/* ── On-bench items ── */}

      {/* Microscope — left side */}
      <group position={[-2.2, 0.95, 0.2]}>
        {/* Base */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Body / arm — angled cylinder */}
        <mesh position={[0, 0.85, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 8]} />
          <meshStandardMaterial color="#222222" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Eyepiece sphere */}
        <mesh position={[0, 1.35, -0.22]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#444444" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Petri dishes — center area */}
      {([
        { x: -0.4, z: -0.4, contentColor: '#44cc44' },
        { x:  0.4, z: -0.4, contentColor: '#cc4488' },
        { x:  0.0, z:  0.5, contentColor: '#4444cc' },
      ] as Array<{ x: number; z: number; contentColor: string }>).map((d, di) => (
        <group key={di} position={[d.x, 0.95, d.z]}>
          {/* Dish */}
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
            <meshStandardMaterial color="#ddddff" transparent opacity={0.7} roughness={0.1} />
          </mesh>
          {/* Content dot */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.03, 12]} />
            <meshStandardMaterial color={d.contentColor} transparent opacity={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Lab notes clipboard */}
      <group position={[1.8, 0.955, -0.2]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 0.02, 0.5]} />
          <meshStandardMaterial color="#eeeeee" roughness={0.9} />
        </mesh>
        {/* Text lines */}
        {[0.12, 0.04, -0.04, -0.12].map((lz, li) => (
          <mesh key={li} position={[0, 0.02, lz]}>
            <boxGeometry args={[0.28, 0.008, 0.025]} />
            <meshStandardMaterial color="#aaaaaa" roughness={1} />
          </mesh>
        ))}
      </group>

      {/* Erlenmeyer flask — right side */}
      <group position={[2.4, 0.95, 0.0]}>
        {/* Wide base */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 12]} />
          <meshStandardMaterial color="#cceecc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.1, 0.2, 0.5, 10]} />
          <meshStandardMaterial color="#cceecc" transparent opacity={0.6} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

function LabBenches() {
  return (
    <>
      {LAB_BENCH_DEFS.map((def, i) => (
        <LabBench key={i} pos={def.pos} rotY={def.rotY} />
      ))}
    </>
  )
}

// ─── DNA SEQUENCER ────────────────────────────────────────────────────────────
// Large sci-fi DNA sequencing machine next to a lab bench

function DNASequencer() {
  const scrollRefs = useRef<(THREE.Mesh | null)[]>([])
  const statusRef = useRef<THREE.Mesh>(null!)
  const statusBlinkRef = useRef(0)

  const scrollData = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      baseY: -0.55 + i * 0.16,
      speed: 0.28 + (i % 3) * 0.07,
      emissive: i % 2 === 0 ? '#00ff88' : '#004422',
    })),
  [])

  useFrame((_, dt) => {
    // Scroll data lines upward, wrap
    scrollData.forEach((sd, i) => {
      const m = scrollRefs.current[i]
      if (!m) return
      sd.baseY += dt * sd.speed
      if (sd.baseY > 0.6) sd.baseY -= 1.3
      m.position.y = sd.baseY
    })
    // Blink status light
    statusBlinkRef.current += dt * 3
    if (statusRef.current) {
      const mat = statusRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 3 + 2 * Math.abs(Math.sin(statusBlinkRef.current))
    }
  })

  return (
    <group position={[22, 0, 33]}>
      {/* Housing */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[3, 2.5, 1.5]} />
        <meshStandardMaterial color="#222244" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Green screen panel */}
      <mesh position={[0, 1.35, 0.76]}>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial color="#001a00" emissive="#00ff44" emissiveIntensity={1.5} roughness={1} />
      </mesh>

      {/* Scrolling data bars */}
      {scrollData.map((sd, i) => (
        <mesh
          key={i}
          ref={(el) => { scrollRefs.current[i] = el }}
          position={[(i % 2 === 0 ? -0.3 : 0.4), sd.baseY + 1.35, 0.80]}
        >
          <boxGeometry args={[2.2, 0.08, 0.06]} />
          <meshStandardMaterial
            color="#001100"
            emissive={sd.emissive}
            emissiveIntensity={sd.emissive === '#00ff88' ? 2.5 : 0.8}
            roughness={1}
          />
        </mesh>
      ))}

      {/* Control panel buttons — 6 spheres */}
      {([
        { x: -0.8, color: '#ff4444' },
        { x: -0.4, color: '#ffaa00' },
        { x:  0.0, color: '#44ff44' },
        { x:  0.4, color: '#4488ff' },
        { x:  0.8, color: '#ff44ff' },
        { x:  1.2, color: '#ffffff' },
      ] as Array<{ x: number; color: string }>).map((btn, bi) => (
        <mesh key={bi} position={[btn.x - 0.2, 0.18, 0.76]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={btn.color} emissive={btn.color} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Status blinking light */}
      <mesh ref={statusRef} position={[1.35, 2.3, 0.76]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={5} roughness={0.2} />
      </mesh>

      {/* Ambient green glow */}
      <pointLight color="#00ff44" intensity={2} distance={10} position={[0, 1.5, 1]} />
    </group>
  )
}

// ─── HOLO BRAIN SCAN ──────────────────────────────────────────────────────────
// Holographic rotating brain scan display floating at y=5

const HOLO_SLICE_COUNT = 12

function HoloBrainScan() {
  const groupRef = useRef<THREE.Group>(null!)

  // Pre-compute rotation.y angles for each slice (fan spread)
  const sliceAngles = useMemo(() =>
    Array.from({ length: HOLO_SLICE_COUNT }, (_, i) => (i / HOLO_SLICE_COUNT) * Math.PI),
  [])

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.01
  })

  return (
    <group ref={groupRef} position={[30, 5, -20]}>
      {/* Invisible pivot anchor */}
      <mesh>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} />
      </mesh>

      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.06, 10, 80]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={2} roughness={0.3} />
      </mesh>

      {/* Brain slice panels */}
      {sliceAngles.map((angle, i) => (
        <mesh key={i} rotation={[0, angle, 0]}>
          <boxGeometry args={[2, 2, 0.02]} />
          <meshStandardMaterial
            color="#001133"
            emissive="#0066cc"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Floating scan data readout bars */}
      {[0, 1, 2, 3].map((ri) => (
        <mesh key={ri} position={[2.8, -0.8 + ri * 0.45, 0]}>
          <boxGeometry args={[0.8, 0.06, 0.04]} />
          <meshStandardMaterial
            color="#002244"
            emissive="#00aaff"
            emissiveIntensity={1.8}
            roughness={1}
          />
        </mesh>
      ))}

      {/* Central glow */}
      <pointLight color="#4488ff" intensity={3} distance={12} />
    </group>
  )
}

// ─── PET ROBOTS ───────────────────────────────────────────────────────────────

// 5 robot pets wandering near the lab benches
const PET_DEFS: Array<{
  startX: number
  startZ: number
  phase: number
  wanderRadius: number
  speed: number
}> = [
  { startX: -15, startZ:  28, phase: 0.0,  wanderRadius: 7, speed: 0.4 },
  { startX:  15, startZ:  28, phase: 1.3,  wanderRadius: 6, speed: 0.5 },
  { startX: -15, startZ: -28, phase: 2.6,  wanderRadius: 7, speed: 0.35 },
  { startX:  15, startZ: -28, phase: 3.9,  wanderRadius: 6, speed: 0.45 },
  { startX:   0, startZ:  20, phase: 5.1,  wanderRadius: 9, speed: 0.3 },
]

function PetRobot({ def, petIdx }: { def: typeof PET_DEFS[0]; petIdx: number }) {
  const groupRef    = useRef<THREE.Group>(null!)
  const bodyRef     = useRef<THREE.Mesh>(null!)
  const headRef     = useRef<THREE.Group>(null!)
  const tailRef     = useRef<THREE.Mesh>(null!)
  const wingLRef    = useRef<THREE.Mesh>(null!)
  const wingRRef    = useRef<THREE.Mesh>(null!)
  const sparkRefs   = useRef<(THREE.Mesh | null)[]>([])

  // 8 happy sparkle particles per pet
  const sparkData = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle:  (i / 8) * Math.PI * 2,
      radius: 0.5 + Math.random() * 0.4,
      yOff:   0.3 + Math.random() * 0.8,
      speed:  2.5 + Math.random() * 1.5,
      phase:  Math.random() * Math.PI * 2,
    })),
  [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = def.phase

    // ── Wander path ──
    const wx = def.startX + Math.sin(t * def.speed + p)         * def.wanderRadius
    const wz = def.startZ + Math.cos(t * def.speed * 0.7 + p)   * def.wanderRadius

    if (groupRef.current) {
      groupRef.current.position.x = wx
      groupRef.current.position.z = wz
      // face direction of travel
      const dx = Math.cos(t * def.speed + p) * def.speed * def.wanderRadius
      const dz = -Math.sin(t * def.speed * 0.7 + p) * def.speed * 0.7 * def.wanderRadius
      if (Math.abs(dx) + Math.abs(dz) > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dx, dz)
      }
    }

    // ── Sit-and-look: every ~5 s for 1 s ──
    const sitPhase = (t * 0.2 + p * 0.1) % 1.0
    const sitting  = sitPhase > 0.8
    if (bodyRef.current) {
      bodyRef.current.position.y = sitting ? -0.12 : 0
    }
    if (headRef.current) {
      headRef.current.rotation.x = sitting ?  0.35 : 0
    }

    // ── Tail wag ──
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 4 + p) * 0.5
    }

    // ── Wing flap ──
    const flapA = Math.sin(t * 3 + p) * 0.25
    if (wingLRef.current) wingLRef.current.rotation.z =  flapA
    if (wingRRef.current) wingRRef.current.rotation.z = -flapA

    // ── Happy sparkles ──
    sparkRefs.current.forEach((m, i) => {
      if (!m) return
      const sd = sparkData[i]!
      const angle = t * sd.speed + sd.phase
      const active = Math.sin(t * 0.8 + sd.phase) > 0.5   // show/hide cycle
      if (active) {
        m.position.set(
          Math.cos(angle) * sd.radius,
          sd.yOff + Math.sin(t * sd.speed * 1.3 + sd.phase) * 0.15,
          Math.sin(angle) * sd.radius,
        )
        m.scale.setScalar(0.6 + 0.4 * Math.abs(Math.sin(t * 3 + i)))
      } else {
        m.scale.setScalar(0)
      }
    })
  })

  return (
    <group ref={groupRef} position={[def.startX, 0, def.startZ]}>
      {/* ── Body ── */}
      <mesh ref={bodyRef} position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.9]} />
        <meshStandardMaterial color="#aaccee" emissive="#4488bb" emissiveIntensity={0.3} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Head ── */}
      <group ref={headRef} position={[0, 1.1, 0.25]}>
        <mesh>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial color="#bbddee" emissive="#3377aa" emissiveIntensity={0.25} roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.13, 0.07, 0.27]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#001a1a" emissive="#00ffcc" emissiveIntensity={5} />
        </mesh>
        <mesh position={[0.13, 0.07, 0.27]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#001a1a" emissive="#00ffcc" emissiveIntensity={5} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.05, 0.28]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#330011" emissive="#ff88cc" emissiveIntensity={3} />
        </mesh>

        {/* Left antenna */}
        <group position={[-0.15, 0.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
            <meshStandardMaterial color="#889999" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#00ffdd" emissive="#00ffdd" emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Right antenna */}
        <group position={[0.15, 0.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
            <meshStandardMaterial color="#889999" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#ff88ff" emissive="#ff88ff" emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Pointlight inside head for cute glow */}
        <pointLight color="#00ffcc" intensity={1.5} distance={3} position={[0, 0, 0.3]} />
      </group>

      {/* ── Legs (4) ── */}
      {([ [-0.27, -0.35], [0.27, -0.35], [-0.27, 0.35], [0.27, 0.35] ] as [number, number][]).map(([lx, lz], li) => (
        <group key={li} position={[lx, 0.18, lz]}>
          {/* Leg cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.4, 8]} />
            <meshStandardMaterial color="#99bbcc" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Foot sphere */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#778899" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── Tail ── */}
      <mesh ref={tailRef} position={[0, 0.6, -0.6]}>
        <cylinderGeometry args={[0.05, 0.08, 0.5, 6]} />
        <meshStandardMaterial color="#99bbcc" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ── Wings ── */}
      <mesh ref={wingLRef} position={[-0.55, 0.65, 0.0]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#cceeee" transparent opacity={0.75} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh ref={wingRRef} position={[0.55, 0.65, 0.0]}>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshStandardMaterial color="#cceeee" transparent opacity={0.75} roughness={0.2} metalness={0.4} />
      </mesh>

      {/* ── Happy sparkles ── */}
      {sparkData.map((_, i) => (
        <mesh key={`spark-${petIdx}-${i}`} ref={(el) => { sparkRefs.current[i] = el }}>
          <sphereGeometry args={[0.05, 5, 5]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
      ))}
    </group>
  )
}

function PetRobots() {
  return (
    <>
      {PET_DEFS.map((def, i) => (
        <PetRobot key={i} def={def} petIdx={i} />
      ))}
    </>
  )
}

// ─── PET PLAY AREA ─────────────────────────────────────────────────────────────

function PetPlayArea() {
  const ballRef          = useRef<THREE.Mesh>(null!)
  const dispenserLEDRef  = useRef<THREE.Mesh>(null!)
  const treatRefs        = useRef<(THREE.Mesh | null)[]>([])

  // 6 treat spheres dispensed periodically
  const treatData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      angle:  (i / 6) * Math.PI * 2,
      speed:  1.2 + i * 0.18,
      phase:  (i / 6) * Math.PI * 2,
      radius: 0.6 + (i % 3) * 0.15,
    })),
  [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Bouncing ball
    if (ballRef.current) {
      ballRef.current.position.y = 0.5 + Math.abs(Math.sin(t * 2)) * 2
      ballRef.current.rotation.x = t * 2.5
      ballRef.current.rotation.z = t * 1.8
    }

    // LED display pulse
    if (dispenserLEDRef.current) {
      const mat = dispenserLEDRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + Math.sin(t * 2.5) * 0.5
    }

    // Treats orbit dispenser
    treatRefs.current.forEach((m, i) => {
      if (!m) return
      const td = treatData[i]!
      const angle = t * td.speed + td.phase
      const active = Math.sin(t * 0.6 + td.phase) > 0   // half-time visible
      if (active) {
        m.position.set(
          Math.cos(angle) * td.radius,
          0.8 + Math.abs(Math.sin(t * 2 + td.phase)) * 0.5,
          Math.sin(angle) * td.radius,
        )
        m.scale.setScalar(1)
      } else {
        m.scale.setScalar(0)
      }
    })
  })

  return (
    <group position={[0, 0.025, 50]}>
      {/* ── Play mat ── */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.05, 8]} />
        <meshStandardMaterial color="#ff8866" roughness={0.8} />
      </mesh>

      {/* ── Bouncing ball ── */}
      <mesh ref={ballRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa00" emissiveIntensity={1} roughness={0.3} />
      </mesh>
      <pointLight color="#ffcc44" intensity={2} distance={8} position={[0, 1, 0]} />

      {/* ── Obstacle course ── */}
      {/* Hurdle 1 */}
      <mesh position={[-3, 0.25, -2]}>
        <boxGeometry args={[0.15, 0.5, 2]} />
        <meshStandardMaterial color="#44bbff" emissive="#2299dd" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* Hurdle 2 */}
      <mesh position={[0, 0.3, -3]}>
        <boxGeometry args={[2, 0.6, 0.15]} />
        <meshStandardMaterial color="#ff44cc" emissive="#dd2288" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* Platform */}
      <mesh position={[2.5, 0.2, 2]}>
        <boxGeometry args={[1.5, 0.4, 1.5]} />
        <meshStandardMaterial color="#aaffaa" emissive="#66cc66" emissiveIntensity={0.3} roughness={0.6} />
      </mesh>
      {/* Cylinder hurdle */}
      <mesh position={[-2, 0.3, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.5, 10]} />
        <meshStandardMaterial color="#ffaa44" emissive="#ff8800" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* Low arch box */}
      <mesh position={[1, 0.15, -1]}>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#dd88ff" emissive="#aa44ff" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>

      {/* ── Treat dispenser ── */}
      <group position={[3.5, 0, 3.5]}>
        {/* Main cylinder */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.5, 16]} />
          <meshStandardMaterial color="#ff6644" emissive="#cc3311" emissiveIntensity={0.5} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.15, 16]} />
          <meshStandardMaterial color="#dd4422" emissive="#aa2200" emissiveIntensity={0.4} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* LED display panel (smiley) */}
        <mesh ref={dispenserLEDRef} position={[0, 0.75, 0.52]}>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshStandardMaterial color="#001a00" emissive="#00ff88" emissiveIntensity={2} roughness={1} />
        </mesh>
        {/* Smiley eyes (two small boxes on LED panel) */}
        <mesh position={[-0.15, 0.88, 0.55]}>
          <boxGeometry args={[0.1, 0.08, 0.03]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
        <mesh position={[0.15, 0.88, 0.55]}>
          <boxGeometry args={[0.1, 0.08, 0.03]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
        {/* Smiley mouth arc (3 small boxes) */}
        <mesh position={[-0.12, 0.68, 0.55]}>
          <boxGeometry args={[0.08, 0.06, 0.03]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
        <mesh position={[0, 0.63, 0.55]}>
          <boxGeometry args={[0.1, 0.06, 0.03]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
        <mesh position={[0.12, 0.68, 0.55]}>
          <boxGeometry args={[0.08, 0.06, 0.03]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>

        {/* Treats */}
        {treatData.map((_, i) => (
          <mesh key={i} ref={(el) => { treatRefs.current[i] = el }} position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.08, 7, 7]} />
            <meshBasicMaterial color="#ffcc00" />
          </mesh>
        ))}

        <pointLight color="#ff6644" intensity={2} distance={8} position={[0, 2, 0]} />
      </group>
    </group>
  )
}

// ─── MAIN WORLD ───────────────────────────────────────────────────────────────
export default function PetBrainWorld() {
  return (
    <>
      {/* Sky */}
      <GradientSky top="#000808" bottom="#001a10" radius={500} />

      {/* Lighting */}
      <ambientLight color="#003311" intensity={1.8} />
      <pointLight color="#00ffaa" intensity={3} distance={50} position={[-30, 8, 0]} />
      <pointLight color="#cc00ff" intensity={2.5} distance={50} position={[0, 8, 0]} />
      <pointLight color="#ff8800" intensity={2.5} distance={50} position={[30, 8, 0]} />
      <pointLight color="#00ccff" intensity={2} distance={40} position={[0, 6, -60]} />

      {/* Floor */}
      <MatrixFloor />

      {/* Stars */}
      <StarField />
      {/* Floating data particles */}
      <DataParticles />

      {/* Neural Network */}
      <NeuralConnections />
      <NeuralNodes />
      <NeuralPulses />
      <DataPulses />
      <SynapticSparks />
      <NodePulseRings />
      <SynapsePulses />
      <BrainPulseRing />

      {/* Ambient scanning effects */}
      <ScanBeam />
      <DataStreamColumns />

      {/* Interactive pet zones */}
      <FoodBowl />
      <PetBed />
      <TrainingRing />

      {/* Zone visual enhancements */}
      <ZoneHalos />
      <DataParticleRings />

      {/* Brain Scan Room */}
      <BrainScanRoom />

      {/* Lab equipment */}
      <LabBenches />
      <DNASequencer />
      <HoloBrainScan />

      {/* Robot pet companions */}
      <PetRobots />

      {/* Robot pet play area */}
      <PetPlayArea />

      {/* DNA Helix — corner decoration */}
      <DNAHelix />

      {/* Large glowing neuron cell bodies */}
      <NeuronClusters />

      {/* Energy arcs between brain nodes */}
      <MindwaveArcs />

      {/* AI Brain monster */}
      <GltfMonster which="alien" pos={[0, 9, -65]} scale={1.5} rotY={Math.PI} animation="Wave" />

      {/* Pet characters */}
      <GltfMonster which="bunny" pos={[-40, 0.5, -30]} scale={0.8} />
      <GltfMonster which="cactoro" pos={[-40, 0.5, 30]} scale={0.8} />
      <GltfMonster which="birb" pos={[40, 1, 0]} scale={0.9} animation="Yes" />

      {/* Portals at lab corners */}
      <Portal pos={[-70, 0, -70]} />
      <Portal pos={[70, 0, -70]} />
      <Portal pos={[-70, 0, 70]} />
      <Portal pos={[70, 0, 70]} />

      {/* Mushroom glows scattered */}
      <MushroomGlow pos={[-20, 0, -10]} />
      <MushroomGlow pos={[20, 0, -10]} />
      <MushroomGlow pos={[-20, 0, 10]} />
      <MushroomGlow pos={[20, 0, 10]} />

      {/* Extra lanterns near neural layers */}
      <Lantern pos={[-30, 0, 20]} />
      <Lantern pos={[0, 0, 22]} />
      <Lantern pos={[30, 0, -20]} />

      {/* Progress wall backdrop */}
      <ProgressWall />

      {/* NPCs */}
      <NPC pos={[-45, 0, 0]} label="ПРОФЕССОР" bodyColor="#a0d0ff" />
      <NPC pos={[45, 0, 0]} label="АССИСТЕНТ" bodyColor="#a0ffa0" />

      {/* Coins near nodes */}
      <Coin pos={[-30, 2, -15]} />
      <Coin pos={[-30, 2, -9]} />
      <Coin pos={[-30, 2, -3]} />
      <Coin pos={[-30, 2, 3]} />
      <Coin pos={[0, 2, -17]} />
      <Coin pos={[0, 2, -7]} />
      <Coin pos={[0, 2, 2]} />
      <Coin pos={[30, 2, -7]} />
      <Coin pos={[30, 2, -2]} />
      {/* Coins at interactive zones */}
      <Coin pos={[-40, 1.5, -30]} />
      <Coin pos={[-40, 1.5, 30]} />
      <Coin pos={[40, 1.5, 0]} />
      {/* Coins near brain room */}
      <Coin pos={[-8, 1, -55]} />
      <Coin pos={[8, 1, -55]} />

      {/* Enemies — rogue data packets */}
      <RigidBody type="fixed" colliders="ball" position={[0, 1, -20]}>
        <mesh>
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={1.5} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="ball" position={[0, 1, 20]}>
        <mesh>
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={1.5} />
        </mesh>
      </RigidBody>

      {/* Нейронный Страж — BossGolem guardian at the center of the hidden layer */}
      <BossGolem pos={[0, 0, 0]} scale={1.8} rotY={Math.PI} />

      {/* Synaptic crystals — CrystalCluster around the node network */}
      <CrystalCluster pos={[-30, 0, -20]} scale={1.4} rotY={0} />
      <CrystalCluster pos={[-30, 0, 20]}  scale={1.2} rotY={Math.PI / 3} />
      <CrystalCluster pos={[0, 0, -22]}   scale={1.5} rotY={Math.PI / 6} />
      <CrystalCluster pos={[0, 0, 22]}    scale={1.3} rotY={-Math.PI / 4} />
      <CrystalCluster pos={[30, 0, -12]}  scale={1.4} rotY={Math.PI / 2} />
      <CrystalCluster pos={[30, 0, 12]}   scale={1.2} rotY={-Math.PI / 3} />
      <CrystalCluster pos={[-15, 0, 0]}   scale={1.1} rotY={Math.PI / 5} />
      <CrystalCluster pos={[15, 0, 0]}    scale={1.1} rotY={-Math.PI / 5} />

      {/* Frozen data blocks — IceBlock in lab corners */}
      <IceBlock pos={[-65, 0, -65]} scale={1.6} rotY={Math.PI / 4} />
      <IceBlock pos={[65, 0, -65]}  scale={1.6} rotY={-Math.PI / 4} />
      <IceBlock pos={[-65, 0, 65]}  scale={1.6} rotY={-Math.PI / 4} />
      <IceBlock pos={[65, 0, 65]}   scale={1.6} rotY={Math.PI / 4} />

      {/* Goal */}
      <GoalTrigger
        pos={[0, 5, -65]}
        size={[15, 8, 15]}
        result={{
          kind: 'win',
          label: 'МОЗГ ОБУЧЕН!',
          subline: 'AI питомец готов к бою!',
        }}
      />
    </>
  )
}
