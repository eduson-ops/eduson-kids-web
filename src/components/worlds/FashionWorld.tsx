import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { detectDeviceTier } from '../../lib/deviceTier'

const _isLow = detectDeviceTier() === 'low'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import GradientSky from '../GradientSky'
import { Flag, Stage, Podium, BossDragon, CrystalCluster, IceBlock, PalmTree } from '../Scenery'

export const FASHION_SPAWN: [number, number, number] = [0, 3, 8]

// ─── SHADERS ────────────────────────────────────────────────────────────────

const glitterVert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`
const glitterFrag = `
uniform float iTime; varying vec2 vUv;
float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5);}
void main(){
  vec2 cell=floor(vUv*40.);
  float r=rand(cell+floor(iTime*8.));
  float sparkle=step(0.94,r);
  vec3 col=vec3(1.,0.9,0.6)+vec3(r,1.-r,0.5)*sparkle;
  gl_FragColor=vec4(col,1.);
}`

// ─── GLITTER FLOOR ──────────────────────────────────────────────────────────

function GlitterFloor({ position, width, length }: { position: [number,number,number]; width: number; length: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  useFrame((_, dt) => { if (matRef.current) matRef.current.uniforms.iTime.value += dt })
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, length, 1, 1]} />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={glitterVert} fragmentShader={glitterFrag} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── DISCO BALL ─────────────────────────────────────────────────────────────

function DiscoBall({ position }: { position: [number,number,number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const tilesRef = useRef<THREE.InstancedMesh>(null!)
  useFrame((_, dt) => { if (groupRef.current) groupRef.current.rotation.y += dt * 0.8 })
  const tiles = useMemo(() => {
    const out: Array<{ pos: [number,number,number]; rot: [number,number,number] }> = []
    for (let phi = 0; phi < Math.PI; phi += 0.35) {
      for (let theta = 0; theta < Math.PI * 2; theta += 0.4) {
        const r = 1.05
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.cos(phi)
        const z = r * Math.sin(phi) * Math.sin(theta)
        out.push({ pos: [x, y, z], rot: [phi, theta, 0] })
      }
    }
    return out
  }, [])
  useEffect(() => {
    if (!tilesRef.current) return
    const dummy = new THREE.Object3D()
    tiles.forEach((t, i) => {
      dummy.position.set(...t.pos)
      dummy.rotation.set(...t.rot)
      dummy.updateMatrix()
      tilesRef.current.setMatrixAt(i, dummy.matrix)
    })
    tilesRef.current.instanceMatrix.needsUpdate = true
  }, [tiles])
  return (
    <group position={position} ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </mesh>
      <instancedMesh ref={tilesRef} args={[undefined, undefined, tiles.length]} frustumCulled={false}>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} metalness={1} roughness={0} />
      </instancedMesh>
    </group>
  )
}

// ─── SWEEPING BEAM LIGHTS ────────────────────────────────────────────────────

const BEAM_COLORS = ['#ff00ff', '#00ffff', '#ff8800', '#00ff00', '#ff0088', '#8800ff']

function SweepingBeams() {
  const refs = useRef<Array<THREE.Group | null>>([])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((g, i) => {
      if (!g) return
      g.rotation.z = Math.sin(t * 0.6 + i * 1.1) * 0.5
      g.rotation.x = Math.cos(t * 0.4 + i * 0.9) * 0.3
    })
  })
  const positions: Array<[number,number,number]> = [
    [-20, 18, -40], [20, 18, -40], [-15, 18, -80], [15, 18, -80], [-20, 18, -120], [20, 18, -120]
  ]
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos} ref={(el) => { refs.current[i] = el }}>
          <pointLight color={BEAM_COLORS[i]} intensity={6} distance={60} decay={2} />
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[4, 30, 12, 1, true]} />
            <meshBasicMaterial color={BEAM_COLORS[i]} transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── NEON SIGN ───────────────────────────────────────────────────────────────

function NeonSign({ position, text, color }: { position: [number,number,number]; text: string; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[text.length * 0.55 + 1, 1.4, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[text.length * 0.55 + 0.6, 1.0, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <pointLight color={color} intensity={3} distance={12} decay={2} position={[0, 0, 1]} />
    </group>
  )
}

// ─── MANNEQUIN ───────────────────────────────────────────────────────────────

function Mannequin({ pos, dressColor, accent }: { pos: [number,number,number]; dressColor: string; accent: string }) {
  const spinRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (spinRef.current) spinRef.current.rotation.y += dt * 0.5 })
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh>
          <cylinderGeometry args={[0.7, 0.9, 0.3, 16]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.2} roughness={0.3} />
        </mesh>
      </RigidBody>
      <group ref={spinRef} position={[0, 0.15, 0]}>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.55, 1.2, 12]} />
          <meshStandardMaterial color={dressColor} roughness={0.5} emissive={dressColor} emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[0.5, 0.65, 0.3]} />
          <meshStandardMaterial color={dressColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.15, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#ffe0c2" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.3, 0.2]}>
          <torusGeometry args={[0.28, 0.05, 8, 24]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ─── DJ BOOTH ─────────────────────────────────────────────────────────────────

function DJBooth({ position }: { position: [number,number,number] }) {
  const discRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { if (discRef.current) discRef.current.rotation.y += dt * 3 })
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh>
          <boxGeometry args={[3, 1.2, 2]} />
          <meshStandardMaterial color="#1a0040" roughness={0.6} metalness={0.4} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.85, 0]} ref={discRef}>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 32]} />
        <meshStandardMaterial color="#111" emissive="#aa00ff" emissiveIntensity={2} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={3} />
      </mesh>
      <pointLight color="#aa00ff" intensity={4} distance={10} decay={2} position={[0, 2, 0]} />
    </group>
  )
}

// ─── GLITTER PARTICLES ────────────────────────────────────────────────────────

function GlitterParticles() {
  const meshRef = useRef<THREE.Points>(null!)
  const count = 60
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = Math.random() * 4
      arr[i * 3 + 2] = -(Math.random() * 140 + 10)
    }
    return arr
  }, [])
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.5 + Math.random() * 1.5), [])
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] = ((((pos.array[i * 3 + 1] as number) + speeds[i] * 0.01)) % 5)
      pos.array[i * 3 + 0] = Math.sin(t * speeds[i] * 0.3 + i) * 5
    }
    pos.needsUpdate = true
  })
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffe680" size={0.18} sizeAttenuation transparent opacity={0.85} />
    </points>
  )
}

// ─── GLITTER SHOWER ──────────────────────────────────────────────────────────

const GLITTER_COLORS = ['#ff88cc', '#ffd700', '#88ffcc', '#ff44ff', '#44ddff']
const _RESET_POOL = 16

function GlitterShower() {
  const COUNT = 200
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const frameSkip = useRef(0)

  const particles = useMemo(() => Array.from({ length: COUNT }, () => ({
    x: (Math.random() - 0.5) * 80,
    y: Math.random() * 21,
    z: -(Math.random() * 140 + 10),
    speed: 0.04 + Math.random() * 0.08,
    rotX: 0,
    rotZ: 0,
    rotSpeedX: (Math.random() - 0.5) * 3,
    rotSpeedZ: (Math.random() - 0.5) * 3,
    resetXs: Array.from({ length: _RESET_POOL }, () => (Math.random() - 0.5) * 80),
    resetIdx: 0,
    colorIdx: Math.floor(Math.random() * GLITTER_COLORS.length),
  })), [])

  useEffect(() => {
    if (!meshRef.current) return
    const col = new THREE.Color()
    particles.forEach((p, i) => {
      col.set(GLITTER_COLORS[p.colorIdx]!)
      meshRef.current.setColorAt(i, col)
    })
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [particles])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    if (_isLow && (frameSkip.current++ & 1)) return
    const step = _isLow ? dt * 2 : dt
    particles.forEach((p, i) => {
      p.y -= p.speed * (_isLow ? 2 : 1)
      p.rotX += p.rotSpeedX * step
      p.rotZ += p.rotSpeedZ * step
      if (p.y < -1) {
        p.y = 20
        p.x = p.resetXs[p.resetIdx++ % _RESET_POOL]!
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rotX, 0, p.rotZ)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.05, 0.05]} />
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.9} depthWrite={false} />
    </instancedMesh>
  )
}

// ─── RUNWAY LIGHT STREAKS ─────────────────────────────────────────────────────

function RunwayLightStreaks() {
  const streakData = useMemo(() => {
    const streaks: Array<{ x: number; color: string }> = []
    const colors = ['#ff88cc', '#cc88ff']
    for (let i = 0; i < 12; i++) {
      const x = -2 + (i / 11) * 4
      streaks.push({ x, color: colors[i % 2] })
    }
    return streaks
  }, [])

  return (
    <>
      {streakData.map((s, i) => (
        <mesh key={i} position={[s.x, 0.05, -70]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.1, 8]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.4} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

// ─── AUDIENCE GLOW ────────────────────────────────────────────────────────────

function AudienceGlow() {
  const panels = [
    { x: -40, y: 2, z: -65, color: '#ff4488' },
    { x: -40, y: 4, z: -65, color: '#8844ff' },
    { x: -40, y: 6, z: -65, color: '#ff4488' },
    { x: -40, y: 3, z: -65, color: '#8844ff' },
    { x:  40, y: 2, z: -65, color: '#8844ff' },
    { x:  40, y: 4, z: -65, color: '#ff4488' },
    { x:  40, y: 6, z: -65, color: '#8844ff' },
    { x:  40, y: 3, z: -65, color: '#ff4488' },
  ]
  return (
    <>
      {panels.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[25, 4]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

// ─── SPOTLIGHT BEAMS FROM ABOVE ───────────────────────────────────────────────

function SpotlightBeams() {
  const beams: Array<[number, number, number]> = [
    [0,   20, -30],
    [-6,  20, -60],
    [6,   20, -60],
    [0,   20, -90],
    [-25, 20, -40],
    [25,  20, -40],
    [-25, 20, -80],
    [25,  20, -80],
  ]
  return (
    <>
      {beams.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2, 20, 16, 1, true]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

// ─── AUDIENCE CANOPY ─────────────────────────────────────────────────────────

const CANOPY_COLORS = ['#ff44cc', '#44ffee', '#ffaa00', '#cc44ff', '#44aaff']

function AudienceCanopy() {
  const tubePositionsLeft: Array<[number, number, number]> = [
    [-18, 9, -20], [-18, 9, -29], [-18, 9, -38], [-18, 9, -47], [-18, 9, -56],
    [-18, 9, -65], [-18, 9, -74], [-18, 9, -83], [-18, 9, -92], [-18, 9, -101],
  ]
  const tubePositionsRight: Array<[number, number, number]> = [
    [18, 9, -20], [18, 9, -29], [18, 9, -38], [18, 9, -47], [18, 9, -56],
    [18, 9, -65], [18, 9, -74], [18, 9, -83], [18, 9, -92], [18, 9, -101],
  ]
  const allTubes: Array<{ pos: [number, number, number]; color: string }> = [
    ...tubePositionsLeft.map((pos, i) => ({ pos, color: CANOPY_COLORS[i % CANOPY_COLORS.length] })),
    ...tubePositionsRight.map((pos, i) => ({ pos, color: CANOPY_COLORS[i % CANOPY_COLORS.length] })),
  ]
  return (
    <>
      {allTubes.map(({ pos, color }, i) => (
        <group key={i} position={pos}>
          <mesh>
            <boxGeometry args={[0.3, 0.3, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── CROWD LIGHTS ─────────────────────────────────────────────────────────────

function CrowdLights() {
  return (
    <>
      <pointLight position={[-18, 7, -47]} color="#ff88ff" intensity={3} distance={30} />
      <pointLight position={[-18, 7, -87]} color="#ff88ff" intensity={3} distance={30} />
      <pointLight position={[18, 7, -47]} color="#88ffff" intensity={3} distance={30} />
      <pointLight position={[18, 7, -87]} color="#88ffff" intensity={3} distance={30} />
    </>
  )
}

// ─── AUDIENCE STANDS ─────────────────────────────────────────────────────────

function AudienceStands({ side }: { side: 'left' | 'right' }) {
  const sx = side === 'left' ? -1 : 1
  const rows = 5
  return (
    <group position={[sx * 14, 0, -65]}>
      {Array.from({ length: rows }, (_, row) => (
        <RigidBody key={row} type="fixed" colliders="cuboid" position={[sx * row * 1.5, row * 0.9, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[1.4, (row + 1) * 0.9, 60]} />
            <meshStandardMaterial
              color={row % 2 === 0 ? '#2a0050' : '#3d0070'}
              roughness={0.8}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  )
}

// ─── STAGE SPOTLIGHTS ────────────────────────────────────────────────────────

function StageSpotlights() {
  const positions: Array<[number,number,number]> = [
    [-12, 18, -148], [-6, 18, -148], [0, 18, -148], [6, 18, -148], [12, 18, -148],
    [-9, 18, -160], [0, 18, -162], [9, 18, -160],
  ]
  const colors = ['#ffe080', '#ffffff', '#ff80c0', '#80c0ff', '#ffffff', '#ffcc44', '#ffffff', '#ff80ff']
  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <pointLight color={colors[i]} intensity={12} distance={50} decay={2} />
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[2.5, 20, 12, 1, true]} />
            <meshBasicMaterial color={colors[i]} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial color="#222" emissive={colors[i]} emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── WINNER PODIUM ────────────────────────────────────────────────────────────

function WinnerPodium() {
  // Trophy positions: 2 trophies per tier
  const trophySlots: Array<{ pos: [number, number, number] }> = [
    // Tier 1 gold top: y=1.0 + 2.0/2 = 2.0, add half trophy height (0.75) = 2.75
    { pos: [-0.8, 2.75, -172] },
    { pos: [0.8,  2.75, -172] },
    // Tier 2 silver top: y=0.6 + 1.2/2 = 1.2, add 0.75 = 1.95
    { pos: [-6.3, 1.95, -172] },
    { pos: [-4.7, 1.95, -172] },
    // Tier 3 bronze top: y=0.4 + 0.8/2 = 0.8, add 0.75 = 1.55
    { pos: [4.7,  1.55, -172] },
    { pos: [6.3,  1.55, -172] },
  ]

  return (
    <group>
      {/* ── Tier 1: Gold (1st place) ── */}
      <mesh position={[0, 1.0, -172]}>
        <boxGeometry args={[5, 2.0, 5]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Tier 2: Silver (2nd place) ── */}
      <mesh position={[-5.5, 0.6, -172]}>
        <boxGeometry args={[4, 1.2, 4]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Tier 3: Bronze (3rd place) ── */}
      <mesh position={[5.5, 0.4, -172]}>
        <boxGeometry args={[4, 0.8, 4]} />
        <meshStandardMaterial color="#cd7f32" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Trophy cylinders + star caps ── */}
      {trophySlots.map((slot, i) => (
        <group key={`trophy-${i}`}>
          {/* cylinder stem */}
          <mesh position={slot.pos}>
            <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* star cap cone on top */}
          <mesh position={[slot.pos[0], slot.pos[1] + 0.75 + 0.3, slot.pos[2]]}>
            <coneGeometry args={[0.5, 0.6, 5]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffcc00" emissiveIntensity={1.2} metalness={0.9} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* ── Banner arch: 2 vertical posts + horizontal bar ── */}
      {/* Left post */}
      <mesh position={[-10, 3, -172]}>
        <boxGeometry args={[0.4, 6, 0.4]} />
        <meshStandardMaterial color="#ff4488" emissive="#ff2266" emissiveIntensity={0.5} />
      </mesh>
      {/* Right post */}
      <mesh position={[10, 3, -172]}>
        <boxGeometry args={[0.4, 6, 0.4]} />
        <meshStandardMaterial color="#ff4488" emissive="#ff2266" emissiveIntensity={0.5} />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 6.1, -172]}>
        <boxGeometry args={[20.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#ff4488" emissive="#ff2266" emissiveIntensity={0.5} />
      </mesh>

      {/* ── 8 floating star spheres above podium ── */}
      {([
        [-7, 8.5, -170], [7, 8.5, -170],
        [-4, 9.5, -174], [4, 9.5, -174],
        [-9, 7.5, -173], [9, 7.5, -173],
        [0,  10,  -171], [0, 10,  -173],
      ] as Array<[number, number, number]>).map((pos, i) => (
        <mesh key={`star-${i}`} position={pos}>
          <sphereGeometry args={[0.2, 5, 4]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffcc00" emissiveIntensity={2.0} />
        </mesh>
      ))}

      {/* ── Central point light above tier 1 ── */}
      <pointLight color="#ffdd44" intensity={8} distance={25} position={[0, 7, -172]} />
    </group>
  )
}

// ─── CONFETTI BURST ───────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#ff88cc', '#ffd700', '#88ffcc', '#ff44ff', '#44ddff', '#ff6600']
const PIECES_PER_COLOR = 20

interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  vz: number
  rotSpeed: number
}

function ConfettiGroup({ color, pieces }: { color: string; pieces: ConfettiPiece[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const velocities = useRef<ConfettiPiece[]>(pieces.map(p => ({ ...p })))
  const rotations = useRef<number[]>(pieces.map(() => Math.random() * Math.PI * 2))

  useFrame((_, dt) => {
    if (!meshRef.current) return
    const vels = velocities.current
    for (let i = 0; i < PIECES_PER_COLOR; i++) {
      const v = vels[i]
      // apply gravity
      v.vy -= 2 * dt
      v.x += v.vx * dt
      v.y += v.vy * dt
      rotations.current[i] += v.rotSpeed * dt
      // wrap when piece falls below y = -2 relative to spawn
      if (v.y < -2) {
        v.y = 0
        v.vy = 2 + Math.random() * 3
        v.x = (Math.random() - 0.5) * 8
      }
      dummy.position.set(v.x, v.y, 0)
      dummy.rotation.z = rotations.current[i]
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PIECES_PER_COLOR]} position={[0, 0, -172]} frustumCulled={false}>
      <planeGeometry args={[0.12, 0.12]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} />
    </instancedMesh>
  )
}

function ConfettiBurst() {
  const groups = useMemo(() =>
    CONFETTI_COLORS.map(color => ({
      color,
      pieces: Array.from({ length: PIECES_PER_COLOR }, (): ConfettiPiece => ({
        x: (Math.random() - 0.5) * 8,
        y: Math.random() * 2,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        vz: (Math.random() - 0.5) * 0.5,
        rotSpeed: (Math.random() - 0.5) * 6,
      })),
    }))
  , [])

  return (
    <>
      {groups.map(({ color, pieces }) => (
        <ConfettiGroup key={color} color={color} pieces={pieces} />
      ))}
    </>
  )
}

// ─── FINALE FIREWORKS ─────────────────────────────────────────────────────────

const FIREWORK_POSITIONS: Array<[number, number, number]> = [
  [-12, 10, -168],
  [12,  10, -168],
  [-6,  15, -175],
  [6,   15, -175],
]
const FIREWORK_COLORS = ['#ff4488', '#ffcc00', '#44ffdd', '#ff6600']

function FinaleFireworks() {
  const lightRefs = useRef<Array<THREE.PointLight | null>>([null, null, null, null])
  const phases = useRef<number[]>(FIREWORK_COLORS.map((_, i) => Math.random() * 3 + i * 0.7))
  const nextFirework = useRef<number[]>(phases.current.slice())
  const activeUntil = useRef<number[]>([0, 0, 0, 0])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < 4; i++) {
      const light = lightRefs.current[i]
      if (!light) continue

      if (t > nextFirework.current[i]) {
        // trigger burst
        activeUntil.current[i] = t + 0.15
        nextFirework.current[i] = t + 1.5 + Math.random() * 2.0
      }

      if (t < activeUntil.current[i]) {
        // fade in/out within the 0.15s window
        const elapsed = t - (activeUntil.current[i] - 0.15)
        const progress = elapsed / 0.15
        light.intensity = 15 * (1 - progress)
      } else {
        light.intensity = 0
      }
    }
  })

  return (
    <>
      {FIREWORK_POSITIONS.map((pos, i) => (
        <pointLight
          key={`fw-${i}`}
          ref={(el) => { lightRefs.current[i] = el }}
          position={pos}
          color={FIREWORK_COLORS[i]}
          intensity={0}
          distance={30}
          decay={2}
        />
      ))}
    </>
  )
}

// ─── AUDIENCE CROWD ──────────────────────────────────────────────────────────

const CROWD_BODY_COLORS = ['#ff6699', '#9966ff', '#ff9933', '#33ccff', '#66ff99']
const CROWD_SKIN_TONES = ['#ffcc99', '#cc8855', '#885533']

interface FigureData {
  x: number
  y: number
  z: number
  phase: number
  bodyColor: string
  skinTone: string
}

function AudienceCrowd() {
  const figures = useMemo<FigureData[]>(() => {
    const out: FigureData[] = []
    const rowXLeft  = [-18, -22]
    const rowXRight = [ 18,  22]
    for (let row = 0; row < 2; row++) {
      for (let fig = 0; fig < 10; fig++) {
        const z = -20 - fig * 12
        out.push({
          x: rowXLeft[row],
          y: 0,
          z,
          phase: Math.random() * Math.PI * 2,
          bodyColor: CROWD_BODY_COLORS[Math.floor(Math.random() * CROWD_BODY_COLORS.length)],
          skinTone:  CROWD_SKIN_TONES[fig % CROWD_SKIN_TONES.length],
        })
        out.push({
          x: rowXRight[row],
          y: 0,
          z,
          phase: Math.random() * Math.PI * 2,
          bodyColor: CROWD_BODY_COLORS[Math.floor(Math.random() * CROWD_BODY_COLORS.length)],
          skinTone:  CROWD_SKIN_TONES[fig % CROWD_SKIN_TONES.length],
        })
      }
    }
    return out
  }, [])

  // One ref per figure group
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const crowdSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (crowdSkip.current++ & 1)) return
    const t = clock.getElapsedTime()
    groupRefs.current.forEach((g, i) => {
      if (!g) return
      g.position.y = Math.sin(t * 2 + figures[i].phase) * 0.05
    })
  })

  return (
    <>
      {figures.map((f, i) => (
        <group
          key={i}
          position={[f.x, f.y, f.z]}
          ref={(el) => { groupRefs.current[i] = el }}
        >
          {/* Body */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 1.5, 8]} />
            <meshStandardMaterial color={f.bodyColor} roughness={0.6} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color={f.skinTone} roughness={0.7} />
          </mesh>
          {/* Left arm raised */}
          <mesh position={[-0.6, 1.4, 0]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
            <meshStandardMaterial color={f.bodyColor} roughness={0.6} />
          </mesh>
          {/* Right arm raised */}
          <mesh position={[0.6, 1.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 6]} />
            <meshStandardMaterial color={f.bodyColor} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── SPOT LIGHTS ─────────────────────────────────────────────────────────────

function SpotLights() {
  type SpotConfig = {
    pos: [number, number, number]
    targetZ: number
    color: string
  }
  const configs: SpotConfig[] = [
    { pos: [ -6, 25,  -55], targetZ:  -55, color: '#ffffff' },
    { pos: [  6, 25,  -55], targetZ:  -55, color: '#ffee99' },
    { pos: [ -6, 25,  -85], targetZ:  -85, color: '#ffffff' },
    { pos: [  6, 25,  -85], targetZ:  -85, color: '#ffee99' },
    { pos: [ -6, 25, -115], targetZ: -115, color: '#ffffff' },
    { pos: [  6, 25, -115], targetZ: -115, color: '#ffee99' },
  ]

  return (
    <>
      {configs.map((cfg, i) => {
        const targetObj = new THREE.Object3D()
        targetObj.position.set(0, 0, cfg.targetZ)
        return (
          <group key={`spotlight-${i}`}>
            <spotLight
              position={cfg.pos}
              color={cfg.color}
              intensity={30}
              angle={0.3}
              penumbra={0.4}
              distance={80}
              decay={2}
              target={targetObj}
            />
            <primitive object={targetObj} />
          </group>
        )
      })}
    </>
  )
}

// ─── CONFETTI CANNON ─────────────────────────────────────────────────────────

const CANNON_COLORS = ['#ff4488', '#44aaff', '#ffcc00', '#44ff88']
const CANNON_POSITIONS: Array<[number, number, number]> = [
  [ 8, 0, -25],
  [-8, 0, -25],
  [ 8, 0, -50],
  [-8, 0, -50],
]
const PIECES_PER_CANNON = 25

interface CannonParticle {
  x0: number
  z0: number
  phase: number
  speed: number
  hAmp: number
}

function ConfettiCannonGroup({
  cannonPos,
  color,
  particles,
}: {
  cannonPos: [number, number, number]
  color: string
  particles: CannonParticle[]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy  = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < PIECES_PER_CANNON; i++) {
      const p = particles[i]
      // Each particle loops on its own cycle driven by phase + speed
      const cycle = ((t * p.speed + p.phase) % 1)
      // Parabolic arc: rise then fall under gravity
      const yRaw  = cycle * (1 - cycle) * 4  // peaks at cycle=0.5
      const y     = yRaw * 8                  // max height ~8 units
      const x     = cannonPos[0] + p.x0 + Math.sin(t * 0.7 + p.phase) * p.hAmp
      const z     = cannonPos[2] + p.z0
      dummy.position.set(x, cannonPos[1] + y, z)
      dummy.rotation.set(t * 2 + p.phase, t * 1.5 + p.phase, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PIECES_PER_CANNON]}
      frustumCulled={false}
    >
      <boxGeometry args={[0.15, 0.3, 0.02]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.92} depthWrite={false} />
    </instancedMesh>
  )
}

function ConfettiCannon() {
  const cannonData = useMemo(() =>
    CANNON_POSITIONS.map((pos, ci) => ({
      pos,
      color: CANNON_COLORS[ci % CANNON_COLORS.length],
      particles: Array.from({ length: PIECES_PER_CANNON }, (): CannonParticle => ({
        x0:    (Math.random() - 0.5) * 3,
        z0:    (Math.random() - 0.5) * 3,
        phase: Math.random(),
        speed: 0.3 + Math.random() * 0.5,
        hAmp:  0.3 + Math.random() * 0.8,
      })),
    }))
  , [])

  return (
    <>
      {cannonData.map((cd, i) => (
        <ConfettiCannonGroup
          key={`cannon-${i}`}
          cannonPos={cd.pos}
          color={cd.color}
          particles={cd.particles}
        />
      ))}
    </>
  )
}

// ─── BACKSTAGE AREA ──────────────────────────────────────────────────────────

function BackstageArea() {
  // Positioned at z=+20 to +45, the entrance end opposite the winner podium
  // Velvet rope: 4 golden poles in a row, connected by rope segments
  const poleXPositions: number[] = [-6, -2, 2, 6]

  // Lounge chair: seat box + angled back + left/right arm boxes
  type ChairConfig = { x: number; z: number; rotY: number }
  const chairConfigs: ChairConfig[] = [
    { x: -9, z: 32, rotY: 0 },
    { x: -4, z: 34, rotY: 0.15 },
    { x:  4, z: 34, rotY: -0.15 },
    { x:  9, z: 32, rotY: 0 },
  ]

  // Gold star pattern on curtain: 7 sphere-cluster stars at varying positions
  // Each star = 1 centre + 4 satellites → 7 centres + 28 satellites = 35 total instances
  type StarPos = { x: number; y: number }
  const curtainStars: StarPos[] = [
    { x: -8, y: 5 }, { x: -4, y: 2 }, { x: 0, y: 6 }, { x: 4, y: 2 },
    { x: 8, y: 5 }, { x: -6, y: 7 }, { x: 6, y: 7 },
  ]
  const STAR_SAT_OFFSETS: Array<[number, number, number]> = [
    [-0.28, 0, 0], [0.28, 0, 0], [0, -0.28, 0], [0, 0.28, 0],
  ]
  const starCentreRef = useRef<THREE.InstancedMesh>(null!)
  const starSatRef    = useRef<THREE.InstancedMesh>(null!)
  const starDummy     = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!starCentreRef.current || !starSatRef.current) return
    const Z = 42.88
    curtainStars.forEach((s, i) => {
      starDummy.position.set(s.x, s.y, Z)
      starDummy.updateMatrix()
      starCentreRef.current.setMatrixAt(i, starDummy.matrix)
    })
    starCentreRef.current.instanceMatrix.needsUpdate = true
    let si = 0
    curtainStars.forEach((s) => {
      STAR_SAT_OFFSETS.forEach(([ox, oy, oz]) => {
        starDummy.position.set(s.x + ox, s.y + oy, Z + oz)
        starDummy.updateMatrix()
        starSatRef.current.setMatrixAt(si++, starDummy.matrix)
      })
    })
    starSatRef.current.instanceMatrix.needsUpdate = true
  }, [starDummy])

  // InstancedMesh refs for velvet rope poles (4 cylinders + 4 sphere caps)
  const poleCylRef = useRef<THREE.InstancedMesh>(null!)
  const poleCapRef = useRef<THREE.InstancedMesh>(null!)
  const poleDummy  = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!poleCylRef.current || !poleCapRef.current) return
    poleXPositions.forEach((x, i) => {
      // cylinder centred at local [0,0.6,18] (pole group position)
      poleDummy.position.set(x, 0.6, 18)
      poleDummy.updateMatrix()
      poleCylRef.current.setMatrixAt(i, poleDummy.matrix)
      // sphere cap sits 0.65 above the cylinder centre
      poleDummy.position.set(x, 0.6 + 0.65, 18)
      poleDummy.updateMatrix()
      poleCapRef.current.setMatrixAt(i, poleDummy.matrix)
    })
    poleCylRef.current.instanceMatrix.needsUpdate = true
    poleCapRef.current.instanceMatrix.needsUpdate = true
  }, [poleDummy])

  // VIP sign star decorations (3 small spheres flanking text)
  const vipStarOffsets: Array<[number, number, number]> = [
    [-2.2, 0, 0.12], [0, 0.6, 0.12], [2.2, 0, 0.12],
  ]

  // VIP text approximated by boxes: V = two diagonal bars + gap, I = thin bar, P = bar + side bump
  // We use simple flat boxes at z=0.12 from sign face
  type BoxShape = { x: number; y: number; w: number; h: number; rotZ?: number }
  const vipBoxes: BoxShape[] = [
    // V - left bar diagonal down-right
    { x: -0.7, y:  0.08, w: 0.12, h: 0.55, rotZ:  0.35 },
    // V - right bar diagonal down-left
    { x: -0.3, y:  0.08, w: 0.12, h: 0.55, rotZ: -0.35 },
    // I
    { x:  0.1, y:  0.05, w: 0.14, h: 0.60, rotZ: 0 },
    // P - vertical stem
    { x:  0.55, y:  0.05, w: 0.13, h: 0.60, rotZ: 0 },
    // P - top bump
    { x:  0.72, y:  0.25, w: 0.20, h: 0.28, rotZ: 0 },
  ]

  return (
    <group>
      {/* ── Velvet curtain backdrop wall ── */}
      <mesh position={[0, 4, 43]}>
        <boxGeometry args={[20, 8, 0.3]} />
        <meshStandardMaterial color="#660022" roughness={0.8} />
      </mesh>

      {/* Gold star pattern on curtain — 7 centres + 28 satellites as InstancedMeshes */}
      <instancedMesh ref={starCentreRef} args={[undefined, undefined, 7]} frustumCulled={false}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={2.5} />
      </instancedMesh>
      <instancedMesh ref={starSatRef} args={[undefined, undefined, 28]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 5, 5]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={2} />
      </instancedMesh>

      {/* ── Velvet rope barrier ── */}
      {/* 4 golden poles — cylinder shafts + sphere caps as InstancedMeshes */}
      <instancedMesh ref={poleCylRef} args={[undefined, undefined, 4]} frustumCulled={false}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#ddaa00" metalness={0.8} roughness={0.2} />
      </instancedMesh>
      <instancedMesh ref={poleCapRef} args={[undefined, undefined, 4]} frustumCulled={false}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#ddaa00" metalness={0.9} roughness={0.1} />
      </instancedMesh>
      {/* Rope segments connecting poles */}
      {poleXPositions.slice(0, -1).map((x, i) => {
        const nextX = poleXPositions[i + 1]
        const midX = (x + nextX) / 2
        const segLen = Math.abs(nextX - x)
        return (
          <mesh key={`rope-${i}`} position={[midX, 1.05, 18]}>
            <boxGeometry args={[segLen, 0.05, 0.05]} />
            <meshStandardMaterial color="#880000" roughness={0.9} />
          </mesh>
        )
      })}

      {/* ── VIP sign ── */}
      <group position={[0, 5.5, 43.05]}>
        {/* Sign backing */}
        <mesh>
          <boxGeometry args={[3, 1, 0.1]} />
          <meshStandardMaterial color="#111111" roughness={0.7} />
        </mesh>
        {/* VIP text boxes */}
        {vipBoxes.map((b, i) => (
          <mesh key={`vbox-${i}`} position={[b.x, b.y, 0.07]} rotation={[0, 0, b.rotZ ?? 0]}>
            <boxGeometry args={[b.w, b.h, 0.04]} />
            <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={2.5} />
          </mesh>
        ))}
        {/* Decorative stars flanking VIP text */}
        {vipStarOffsets.map((off, i) => (
          <mesh key={`vsign-star-${i}`} position={off}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={3} />
          </mesh>
        ))}
        {/* Light glow from sign */}
        <pointLight color="#ffdd00" intensity={3} distance={8} decay={2} position={[0, 0, 0.5]} />
      </group>

      {/* ── Lounge chairs ── */}
      {chairConfigs.map((c, i) => (
        <group key={`chair-${i}`} position={[c.x, 0, c.z]} rotation={[0, c.rotY, 0]}>
          {/* Seat */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.4, 0.2, 1.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.05} />
          </mesh>
          {/* Angled back (leaning back ~25 deg) */}
          <mesh position={[0, 1.0, 0.42]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[1.4, 1.1, 0.14]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.05} />
          </mesh>
          {/* Left arm */}
          <mesh position={[-0.65, 0.7, 0]}>
            <boxGeometry args={[0.12, 0.5, 1.0]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.5} />
          </mesh>
          {/* Right arm */}
          <mesh position={[0.65, 0.7, 0]}>
            <boxGeometry args={[0.12, 0.5, 1.0]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.5} />
          </mesh>
          {/* Legs */}
          {([[-0.55, -0.5],[-0.55, 0.5],[0.55, -0.5],[0.55, 0.5]] as Array<[number,number]>).map(([lx, lz], li) => (
            <mesh key={li} position={[lx, 0.18, lz]}>
              <cylinderGeometry args={[0.05, 0.05, 0.38, 6]} />
              <meshStandardMaterial color="#ddaa00" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Ambient glow for backstage area */}
      <pointLight color="#ff4488" intensity={2} distance={20} decay={2} position={[0, 4, 30]} />
      <pointLight color="#ffaa00" intensity={1.5} distance={15} decay={2} position={[-8, 3, 38]} />
      <pointLight color="#ffaa00" intensity={1.5} distance={15} decay={2} position={[8, 3, 38]} />
    </group>
  )
}

// ─── PHOTO WALL ───────────────────────────────────────────────────────────────

function PhotoWall() {
  // Positioned on the right side of backstage, at x=+45, facing inward (rotated)
  // 12 logo boxes: 4 columns × 3 rows — split into 2 InstancedMeshes by alternating colour
  const cols = 4
  const rows = 3
  const startX = -7.5
  const startY = 2.5
  const stepX = 5
  const stepY = 2.5

  // Precompute positions split by colour (even idx = pink, odd idx = gold)
  const logoPosEven = useMemo<Array<[number, number]>>(() => {
    const out: Array<[number, number]> = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if ((r * cols + c) % 2 === 0) out.push([startX + c * stepX, startY + r * stepY])
    return out
  }, [])
  const logoPosOdd = useMemo<Array<[number, number]>>(() => {
    const out: Array<[number, number]> = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if ((r * cols + c) % 2 !== 0) out.push([startX + c * stepX, startY + r * stepY])
    return out
  }, [])

  const logoPinkRef = useRef<THREE.InstancedMesh>(null!)
  const logoGoldRef = useRef<THREE.InstancedMesh>(null!)
  const logoDummy   = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    if (!logoPinkRef.current || !logoGoldRef.current) return
    logoPosEven.forEach(([x, y], i) => {
      logoDummy.position.set(x, y, -0.26)
      logoDummy.updateMatrix()
      logoPinkRef.current.setMatrixAt(i, logoDummy.matrix)
    })
    logoPinkRef.current.instanceMatrix.needsUpdate = true
    logoPosOdd.forEach(([x, y], i) => {
      logoDummy.position.set(x, y, -0.26)
      logoDummy.updateMatrix()
      logoGoldRef.current.setMatrixAt(i, logoDummy.matrix)
    })
    logoGoldRef.current.instanceMatrix.needsUpdate = true
  }, [logoDummy, logoPosEven, logoPosOdd])

  // 4 spotlights pointing at the photo wall from in front
  type SpotPos = [number, number, number]
  const photoSpotPositions: SpotPos[] = [
    [-8,  10, 20],
    [ 8,  10, 20],
    [-4,  14, 18],
    [ 4,  14, 18],
  ]

  return (
    <group position={[0, 0, 30]} rotation={[0, Math.PI, 0]}>
      {/* ── Main photo wall panel ── */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[24, 10, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* ── 12 logo boxes in grid — 2 InstancedMeshes by colour (6 each) ── */}
      <instancedMesh ref={logoPinkRef} args={[undefined, undefined, 6]} frustumCulled={false}>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#ff88cc" emissive="#ff88cc" emissiveIntensity={1} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={logoGoldRef} args={[undefined, undefined, 6]} frustumCulled={false}>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={1} roughness={0.3} />
      </instancedMesh>

      {/* ── Ring light (large torus like a photographer's ring flash) ── */}
      <mesh position={[0, 5, -0.5]}>
        <torusGeometry args={[2, 0.2, 16, 64]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      {/* Ring light point source */}
      <pointLight color="#ffffff" intensity={8} distance={20} decay={2} position={[0, 5, -1.5]} />

      {/* ── 4 front spotlights aimed at photo wall ── */}
      {photoSpotPositions.map((pos, i) => (
        <group key={`pspot-${i}`} position={pos}>
          <pointLight color="#ffffff" intensity={6} distance={30} decay={2} />
          <mesh rotation={[i < 2 ? 0.6 : 0.8, 0, 0]}>
            <coneGeometry args={[1.2, 10, 12, 1, true]} />
            <meshBasicMaterial color="#ffffee" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── MIRROR WALL (DRESSING ROOM) ─────────────────────────────────────────────

function MirrorWall() {
  // Positioned on the left side of backstage at x=-45, facing inward
  // 6 mirror panels in a row
  const mirrorCount = 6
  const mirrorSpacing = 3.2
  const mirrorStartX = -((mirrorCount - 1) * mirrorSpacing) / 2

  // Makeup items on dressing table: lipstick, perfume bottles (tiny cylinders)
  type MakeupItem = { x: number; color: string; h: number; r: number }
  const makeupItems: MakeupItem[] = [
    { x: -0.6, color: '#ff2244', h: 0.35, r: 0.07 },
    { x: -0.2, color: '#ff88cc', h: 0.28, r: 0.09 },
    { x:  0.2, color: '#8844ff', h: 0.32, r: 0.08 },
    { x:  0.6, color: '#ffd700', h: 0.22, r: 0.11 },
  ]

  return (
    <group position={[-40, 0, 30]}>
      {/* ── 6 mirror panels ── */}
      {Array.from({ length: mirrorCount }, (_, i) => {
        const x = mirrorStartX + i * mirrorSpacing
        return (
          <group key={`mirror-${i}`} position={[x, 0, 0]}>
            {/* Mirror panel */}
            <mesh position={[0, 3, 0]}>
              <boxGeometry args={[2.5, 6, 0.15]} />
              <meshStandardMaterial
                color="#ccddff"
                metalness={0.9}
                roughness={0.05}
              />
            </mesh>
            {/* Mirror frame */}
            <mesh position={[0, 3, -0.1]}>
              <boxGeometry args={[2.7, 6.2, 0.08]} />
              <meshStandardMaterial color="#ddaa00" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Vanity light above mirror */}
            <mesh position={[0, 6.3, 0.1]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#ffeecc" emissive="#ffeecc" emissiveIntensity={3} />
            </mesh>
            <pointLight
              color="#ffeecc"
              intensity={3}
              distance={6}
              decay={2}
              position={[0, 6.3, 0.5]}
            />
          </group>
        )
      })}

      {/* ── Dressing table ── */}
      <group position={[0, 0, 1.5]}>
        {/* Table surface */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2, 0.08, 0.8]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Table body */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[2, 0.72, 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Makeup items on table surface */}
        {makeupItems.map((item, i) => (
          <mesh key={`makeup-${i}`} position={[item.x, 0.84 + item.h / 2, 0]}>
            <cylinderGeometry args={[item.r, item.r, item.h, 8]} />
            <meshStandardMaterial color={item.color} roughness={0.4} metalness={0.2} />
          </mesh>
        ))}
        {/* Mirror on table (small tilted panel) */}
        <mesh position={[0, 1.3, -0.25]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.8, 1.0, 0.05]} />
          <meshStandardMaterial color="#ccddff" metalness={0.9} roughness={0.05} />
        </mesh>
      </group>

      {/* Soft warm light for dressing room */}
      <pointLight color="#ffeecc" intensity={3} distance={18} decay={2} position={[0, 5, 2]} />
    </group>
  )
}

// ─── DESIGN STUDIO ───────────────────────────────────────────────────────────

function DesignStudio({ position }: { position: [number, number, number] }) {
  const needleRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (needleRef.current) {
      needleRef.current.position.y = Math.sin(clock.getElapsedTime() * 8) * 0.1
    }
  })

  // Fabric swatch colors
  const swatchColors = ['#ff4444', '#ff8800', '#ffdd00', '#44bb44', '#4488ff', '#8844ff', '#ff44cc', '#00cccc']

  return (
    <group position={position}>
      {/* ── Design table ── */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[5, 0.9, 3]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.4} />
      </mesh>
      {/* Table legs */}
      {([[-2.2, -2.2], [-2.2, 2.2], [2.2, -2.2], [2.2, 2.2]] as Array<[number, number]>).map(([lx, lz], i) => (
        <mesh key={`leg-${i}`} position={[lx, 0.35, lz]}>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 6]} />
          <meshStandardMaterial color="#ccbbaa" roughness={0.5} />
        </mesh>
      ))}

      {/* ── Sewing machine ── */}
      <group position={[-1.5, 1.4, -0.7]}>
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.5]} />
          <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* L-arm horizontal */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.15, 0.4]} />
          <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* L-arm vertical drop */}
        <mesh position={[0.28, 0.1, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.4]} />
          <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Needle — animated */}
        <mesh ref={needleRef} position={[0.28, -0.28, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Thread spool */}
        <mesh position={[-0.55, 0.1, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 12]} />
          <meshStandardMaterial color="#ff6688" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Fabric bolt (purple, laid flat on table) ── */}
      <mesh position={[0.5, 1.4, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
        <meshStandardMaterial color="#884488" roughness={0.6} />
      </mesh>

      {/* ── Scissors ── */}
      <group position={[1.5, 1.38, -0.6]}>
        {/* Blade 1 */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.25]}>
          <boxGeometry args={[0.55, 0.07, 0.04]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0, 0, 0.06]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[0.55, 0.07, 0.04]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Pivot */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Sketchpad ── */}
      <group position={[1.8, 1.37, 0.5]}>
        <mesh>
          <boxGeometry args={[0.5, 0.7, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* Pencil angled across */}
        <mesh position={[0.05, 0, 0.04]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.4} />
        </mesh>
      </group>

      {/* ── Dress form mannequin (hourglass) ── */}
      <group position={[2.5, 0, 0.6]}>
        {/* Stand cylinder */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.18, 1.2, 10]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Base plate */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.08, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Lower body */}
        <mesh position={[0, 1.5, 0]} scale={[1, 1.5, 0.8]}>
          <sphereGeometry args={[0.38, 12, 12]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.5} />
        </mesh>
        {/* Upper body */}
        <mesh position={[0, 2.15, 0]} scale={[1, 1.5, 0.8]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#f0e8d0" roughness={0.5} />
        </mesh>
      </group>

      {/* ── Fabric swatches on wall (8 coloured flat panels) ── */}
      {swatchColors.map((color, i) => (
        <mesh
          key={`swatch-${i}`}
          position={[-2.4 + i * 0.7, 3.0, -1.52]}
          rotation={[0, 0, 0]}
        >
          <boxGeometry args={[0.6, 0.8, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Wall behind swatches */}
      <mesh position={[0, 3.0, -1.6]}>
        <boxGeometry args={[6.5, 2.5, 0.1]} />
        <meshStandardMaterial color="#f8f4ee" roughness={0.7} />
      </mesh>

      {/* ── Overhead worklight ── */}
      <mesh position={[0, 5.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <pointLight color="#fffcf0" intensity={5} distance={8} decay={2} position={[0, 5.3, 0]} />
    </group>
  )
}

// ─── RUNWAY PREP ──────────────────────────────────────────────────────────────

function RunwayPrep({ position }: { position: [number, number, number] }) {
  const SKIN_TONES = ['#ffcc99', '#cc8855', '#ffe0c0']
  const OUTFIT_COLORS = ['#ff88cc', '#44aaff', '#ffcc44']
  const HAIR_COLORS = ['#441100', '#ffcc00', '#222222']

  return (
    <group position={position}>
      {/* ── 3 model figures ── */}
      {OUTFIT_COLORS.map((outfitColor, i) => {
        const figX = (i - 1) * 2.0
        return (
          <group key={`model-${i}`} position={[figX, 0, 0]}>
            {/* Body */}
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 1.8, 10]} />
              <meshStandardMaterial color={outfitColor} roughness={0.5} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.1, 0]}>
              <sphereGeometry args={[0.3, 10, 10]} />
              <meshStandardMaterial color={SKIN_TONES[i]} roughness={0.6} />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 2.3, 0]} scale={[1, 0.6, 1.1]}>
              <sphereGeometry args={[0.34, 10, 10]} />
              <meshStandardMaterial color={HAIR_COLORS[i]} roughness={0.7} />
            </mesh>
            {/* Arms — different poses per model */}
            {i === 0 && (
              /* Adjusting hair — right arm raised to head */
              <>
                <mesh position={[-0.55, 1.1, 0]} rotation={[0, 0, Math.PI / 5]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={outfitColor} roughness={0.5} />
                </mesh>
                <mesh position={[0.4, 1.8, 0.15]} rotation={[0.6, 0, -Math.PI / 3]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={SKIN_TONES[i]} roughness={0.5} />
                </mesh>
              </>
            )}
            {i === 1 && (
              /* Arms out for outfit check */
              <>
                <mesh position={[-0.75, 1.1, 0]} rotation={[0, 0, Math.PI / 2.2]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={outfitColor} roughness={0.5} />
                </mesh>
                <mesh position={[0.75, 1.1, 0]} rotation={[0, 0, -Math.PI / 2.2]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={outfitColor} roughness={0.5} />
                </mesh>
              </>
            )}
            {i === 2 && (
              /* Standing straight */
              <>
                <mesh position={[-0.55, 1.0, 0]} rotation={[0, 0, Math.PI / 6]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={outfitColor} roughness={0.5} />
                </mesh>
                <mesh position={[0.55, 1.0, 0]} rotation={[0, 0, -Math.PI / 6]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 6]} />
                  <meshStandardMaterial color={outfitColor} roughness={0.5} />
                </mesh>
              </>
            )}
          </group>
        )
      })}

      {/* ── 3 hair/makeup stations ── */}
      {[0, 1, 2].map((i) => {
        const sx = (i - 1) * 2.0
        return (
          <group key={`station-${i}`} position={[sx, 0, -1.8]}>
            {/* Round table */}
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
              <meshStandardMaterial color="#f0ece4" roughness={0.4} />
            </mesh>
            {/* Table leg */}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.76, 8]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Mirror box on table */}
            <mesh position={[0, 1.2, -0.1]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.5, 0.6, 0.05]} />
              <meshStandardMaterial color="#ccddff" metalness={0.9} roughness={0.05} />
            </mesh>
            {/* Cosmetic cylinders */}
            <mesh position={[-0.2, 0.86, 0.15]}>
              <cylinderGeometry args={[0.05, 0.05, 0.22, 6]} />
              <meshStandardMaterial color="#ff4488" roughness={0.3} />
            </mesh>
            <mesh position={[0.1, 0.86, 0.2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.18, 6]} />
              <meshStandardMaterial color="#ffcc00" roughness={0.3} />
            </mesh>
            <mesh position={[0.28, 0.86, 0.1]}>
              <cylinderGeometry args={[0.04, 0.04, 0.28, 6]} />
              <meshStandardMaterial color="#cc44ff" roughness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Soft warm prep area light */}
      <pointLight color="#ffeecc" intensity={3} distance={10} decay={2} position={[0, 4, 0]} />
    </group>
  )
}

// ─── FABRIC RAINBOW ───────────────────────────────────────────────────────────

function FabricRainbow({ position }: { position: [number, number, number] }) {
  // ROYGBIV colors
  const RAINBOW = ['#ff2200', '#ff8800', '#ffee00', '#44cc00', '#2255ff', '#4400cc', '#9900cc']

  // Pyramid layout: 4 bottom row, 2 middle row, 1 top
  const bottomRow: Array<[number, number, number]> = [
    [-3.0, 0.5, 0],
    [-1.0, 0.5, 0],
    [ 1.0, 0.5, 0],
    [ 3.0, 0.5, 0],
  ]
  const middleRow: Array<[number, number, number]> = [
    [-1.0, 1.6, 0],
    [ 1.0, 1.6, 0],
  ]
  const topRow: Array<[number, number, number]> = [
    [ 0.0, 2.7, 0],
  ]
  const allPositions = [...bottomRow, ...middleRow, ...topRow]

  return (
    <group position={position}>
      {/* ── Pyramid of fabric bolts ── */}
      {allPositions.map((pos, i) => (
        <group key={`bolt-${i}`} position={pos}>
          {/* Horizontal cylinder = fabric bolt laid on side */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 2.5, 16]} />
            <meshStandardMaterial color={RAINBOW[i % RAINBOW.length]} roughness={0.6} />
          </mesh>
          {/* Emissive tag label at end */}
          <mesh position={[1.28, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.04]} />
            <meshStandardMaterial
              color={RAINBOW[i % RAINBOW.length]}
              emissive={RAINBOW[i % RAINBOW.length]}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* ── Fabric draping off sides (thin flat planes angled outward) ── */}
      {/* Left drape */}
      <mesh position={[-4.5, 0.8, 0.1]} rotation={[0.1, 0, 0.3]}>
        <planeGeometry args={[1.8, 2.2]} />
        <meshStandardMaterial color="#ff6600" transparent opacity={0.7} side={THREE.DoubleSide} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Right drape */}
      <mesh position={[4.5, 0.8, 0.1]} rotation={[0.1, 0, -0.3]}>
        <planeGeometry args={[1.8, 2.2]} />
        <meshStandardMaterial color="#aa00dd" transparent opacity={0.7} side={THREE.DoubleSide} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Front drape off bottom bolt */}
      <mesh position={[0, 0.2, 0.8]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[5.0, 1.5]} />
        <meshStandardMaterial color="#0044ff" transparent opacity={0.6} side={THREE.DoubleSide} roughness={0.8} depthWrite={false} />
      </mesh>

      {/* ── Warm overhead spotlight ── */}
      <pointLight color="#fff8e0" intensity={6} distance={12} decay={2} position={[0, 6, 2]} />
      {/* Spotlight cone visual */}
      <mesh position={[0, 6, 2]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2, 8, 12, 1, true]} />
        <meshBasicMaterial color="#fff8e0" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ─── RUNWAY EDGE LIGHTS ───────────────────────────────────────────────────────

function RunwayEdgeLights({ xLeft, xRight, zStart, zEnd, step = 3, colors = ['#ff44cc', '#44ffee'] }: {
  xLeft: number; xRight: number; zStart: number; zEnd: number; step?: number; colors?: string[]
}) {
  const lights: Array<{ pos: [number,number,number]; color: string }> = []
  let idx = 0
  for (let z = zStart; z >= zEnd; z -= step, idx++) {
    const c = colors[idx % colors.length]
    lights.push({ pos: [xLeft, 0.15, z], color: c })
    lights.push({ pos: [xRight, 0.15, z], color: c })
  }
  return (
    <>
      {lights.map(({ pos, color }, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <pointLight color={color} intensity={0.6} distance={4} decay={2} />
        </group>
      ))}
    </>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function FashionWorld() {
  return (
    <>
      {/* Sky */}
      <GradientSky top="#1a0030" bottom="#600090" radius={600} />

      {/* Ambient + sun */}
      <ambientLight intensity={0.4} color="#440066" />
      <directionalLight position={[0, 30, 10]} intensity={1.2} color="#ffccff" castShadow />

      {/* ── FLOOR BASE ── */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -60]}>
        <mesh receiveShadow>
          <boxGeometry args={[120, 0.5, 200]} />
          <meshStandardMaterial color="#110022" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* ══ MAIN RUNWAY (center) ══ */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.05, -70]}>
        <mesh receiveShadow>
          <boxGeometry args={[12, 0.1, 160]} />
          <meshStandardMaterial color="#ff80b0" roughness={0.6} emissive="#ff80b0" emissiveIntensity={0.12} />
        </mesh>
      </RigidBody>
      {/* Main runway walls */}
      {([-6.4, 6.4] as const).map((x, i) => (
        <RigidBody key={`mw${i}`} type="fixed" colliders="cuboid" position={[x, 0.3, -70]}>
          <mesh>
            <boxGeometry args={[0.3, 0.6, 160]} />
            <meshStandardMaterial color="#ff80b0" emissive="#ff80b0" emissiveIntensity={0.8} />
          </mesh>
        </RigidBody>
      ))}

      {/* Glitter overlay on main runway */}
      <GlitterFloor position={[0, 0.12, -70]} width={12} length={160} />

      {/* Main runway edge lights */}
      <RunwayEdgeLights xLeft={-6.2} xRight={6.2} zStart={8} zEnd={-148} step={3} colors={['#ff44cc', '#44ffee', '#ffcc00']} />

      {/* ══ SIDE RUNWAY LEFT (x=-25) ══ */}
      <RigidBody type="fixed" colliders="cuboid" position={[-25, 0.05, -60]}>
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.1, 120]} />
          <meshStandardMaterial color="#c060ff" roughness={0.6} emissive="#c060ff" emissiveIntensity={0.12} />
        </mesh>
      </RigidBody>
      {([-29.2, -20.8] as const).map((x, i) => (
        <RigidBody key={`lw${i}`} type="fixed" colliders="cuboid" position={[x, 0.3, -60]}>
          <mesh>
            <boxGeometry args={[0.3, 0.6, 120]} />
            <meshStandardMaterial color="#c060ff" emissive="#c060ff" emissiveIntensity={0.8} />
          </mesh>
        </RigidBody>
      ))}
      <RunwayEdgeLights xLeft={-29} xRight={-21} zStart={0} zEnd={-120} step={3} colors={['#c060ff', '#ff80ff']} />

      {/* ══ SIDE RUNWAY RIGHT (x=25) ══ */}
      <RigidBody type="fixed" colliders="cuboid" position={[25, 0.05, -60]}>
        <mesh receiveShadow>
          <boxGeometry args={[8, 0.1, 120]} />
          <meshStandardMaterial color="#ffd644" roughness={0.6} emissive="#ffd644" emissiveIntensity={0.12} />
        </mesh>
      </RigidBody>
      {([20.8, 29.2] as const).map((x, i) => (
        <RigidBody key={`rw${i}`} type="fixed" colliders="cuboid" position={[x, 0.3, -60]}>
          <mesh>
            <boxGeometry args={[0.3, 0.6, 120]} />
            <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.8} />
          </mesh>
        </RigidBody>
      ))}
      <RunwayEdgeLights xLeft={21} xRight={29} zStart={0} zEnd={-120} step={3} colors={['#ffd644', '#ffaa00']} />

      {/* ══ AUDIENCE CANOPY ══ */}
      <AudienceCanopy />

      {/* ══ CROWD LIGHTS ══ */}
      <CrowdLights />

      {/* ══ AUDIENCE STANDS ══ */}
      <AudienceStands side="left" />
      <AudienceStands side="right" />

      {/* ══ AUDIENCE MONSTERS ══ */}
      {/* Left stand rows */}
      <GltfMonster which="birb"     pos={[-16, 2.5, -30]}  scale={0.75} animation="Wave" />
      <GltfMonster which="bunny"    pos={[-18, 3.5, -45]}  scale={0.8}  animation="Wave" />
      <GltfMonster which="cactoro"  pos={[-20, 4.5, -60]}  scale={0.7}  animation="Yes"  />
      <GltfMonster which="bunny"    pos={[-22, 5.5, -75]}  scale={0.8}  animation="Wave" />
      <GltfMonster which="birb"     pos={[-24, 6.5, -90]}  scale={0.75} animation="Yes"  />
      <GltfMonster which="cactoro"  pos={[-16, 2.5, -55]}  scale={0.7}  animation="Wave" />
      <GltfMonster which="birb"     pos={[-18, 3.5, -70]}  scale={0.75} animation="Yes"  />
      <GltfMonster which="bunny"    pos={[-20, 4.5, -85]}  scale={0.8}  animation="Wave" />
      <GltfMonster which="cactoro"  pos={[-22, 5.5, -100]} scale={0.7}  animation="Yes"  />
      <GltfMonster which="birb"     pos={[-16, 2.5, -110]} scale={0.75} animation="Wave" />
      {/* Right stand rows */}
      <GltfMonster which="cactoro"  pos={[16, 2.5, -30]}   scale={0.75} animation="Yes"  />
      <GltfMonster which="birb"     pos={[18, 3.5, -45]}   scale={0.8}  animation="Wave" />
      <GltfMonster which="bunny"    pos={[20, 4.5, -60]}   scale={0.7}  animation="Yes"  />
      <GltfMonster which="cactoro"  pos={[22, 5.5, -75]}   scale={0.8}  animation="Wave" />
      <GltfMonster which="birb"     pos={[24, 6.5, -90]}   scale={0.75} animation="Yes"  />
      <GltfMonster which="bunny"    pos={[16, 2.5, -55]}   scale={0.7}  animation="Wave" />
      <GltfMonster which="cactoro"  pos={[18, 3.5, -70]}   scale={0.75} animation="Yes"  />
      <GltfMonster which="birb"     pos={[20, 4.5, -85]}   scale={0.8}  animation="Wave" />
      <GltfMonster which="bunny"    pos={[22, 5.5, -100]}  scale={0.7}  animation="Yes"  />
      <GltfMonster which="cactoro"  pos={[16, 2.5, -110]}  scale={0.75} animation="Wave" />

      {/* ══ STAGE at far end ══ */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, -155]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[30, 0.5, 15]} />
          <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.5} metalness={0.3} roughness={0.3} />
        </mesh>
      </RigidBody>
      {/* Stage steps */}
      {[0.5, 1.0].map((h, i) => (
        <RigidBody key={`step${i}`} type="fixed" colliders="cuboid" position={[0, h * 0.5 - 0.1, -147 + i * 0.5]}>
          <mesh>
            <boxGeometry args={[30, h * 0.5, 1.5]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
          </mesh>
        </RigidBody>
      ))}
      {/* Backdrop wall behind stage */}
      <mesh position={[0, 8, -163]}>
        <boxGeometry args={[32, 16, 0.8]} />
        <meshStandardMaterial color="#2a0060" emissive="#6600cc" emissiveIntensity={0.3} />
      </mesh>
      {/* Backdrop vertical neon bars */}
      {[-12, -6, 0, 6, 12].map((x) => (
        <mesh key={`bar${x}`} position={[x, 8, -162.5]}>
          <boxGeometry args={[0.4, 16, 0.2]} />
          <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={2} />
        </mesh>
      ))}

      {/* GLB Stage prop at far end */}
      <Stage pos={[0, 0, -152]} scale={4.0} rotY={Math.PI} />

      {/* Winner's podium display */}
      <Podium pos={[-8, 0, -148]} scale={2.5} />
      <Podium pos={[8, 0, -148]} scale={2.5} rotY={Math.PI} />

      {/* Stage spotlights */}
      <StageSpotlights />

      {/* Boss on stage */}
      <GltfMonster which="alien" pos={[0, 0.8, -155]} scale={2.0} rotY={Math.PI} animation="Wave" />

      {/* ══ DJ BOOTH ══ */}
      <DJBooth position={[-18, 0, 5]} />

      {/* ══ DISCO BALL ══ */}
      <DiscoBall position={[0, 14, -70]} />
      <pointLight color="#ffffff" intensity={5} distance={60} decay={2} position={[0, 14, -70]} />

      {/* ══ SWEEPING BEAM LIGHTS ══ */}
      <SweepingBeams />

      {/* ══ NEON SIGNS at entrance ══ */}
      <NeonSign position={[-10, 5, 6]}  text="FASHION WEEK"  color="#ff00cc" />
      <NeonSign position={[10,  5, 6]}  text="STAR CATWALK"  color="#00ccff" />
      <NeonSign position={[0,  10, -155]} text="GRAND FINALE" color="#ffd644" />

      {/* ══ GLITTER PARTICLES ══ */}
      <GlitterParticles />

      {/* ══ MANNEQUINS on main runway ══ */}
      <Mannequin pos={[-4.5, 0, -20]}  dressColor="#ff4488" accent="#ffd644" />
      <Mannequin pos={[4.5,  0, -30]}  dressColor="#44ccff" accent="#ff88ff" />
      <Mannequin pos={[-4.5, 0, -50]}  dressColor="#aaff44" accent="#cc00ff" />
      <Mannequin pos={[4.5,  0, -70]}  dressColor="#ffaa00" accent="#00ffcc" />
      <Mannequin pos={[-4.5, 0, -90]}  dressColor="#cc44ff" accent="#ffff00" />
      <Mannequin pos={[4.5,  0, -110]} dressColor="#ff6600" accent="#00aaff" />

      {/* ══ FLAGS along runway sides ══ */}
      <Flag position={[-8,  0, -10]}  />
      <Flag position={[8,   0, -10]}  />
      <Flag position={[-8,  0, -40]}  />
      <Flag position={[8,   0, -40]}  />
      <Flag position={[-8,  0, -70]}  />
      <Flag position={[8,   0, -70]}  />
      <Flag position={[-8,  0, -100]} />
      <Flag position={[8,   0, -100]} />
      <Flag position={[-8,  0, -130]} />
      <Flag position={[8,   0, -130]} />

      {/* ══ NPCs — JUDGES ══ */}
      <NPC pos={[-8, 0.5, -148]}  label="СУДЬЯ 1"  bodyColor="#ff44aa" />
      <NPC pos={[0,  0.5, -148]}  label="СУДЬЯ 2"  bodyColor="#aa44ff" />
      <NPC pos={[8,  0.5, -148]}  label="ЗВЕЗДА"   bodyColor="#ffd644" />

      {/* ══ COINS ══ */}
      <Coin pos={[0,   1.5, -15]}  value={2} />
      <Coin pos={[0,   1.5, -30]}  value={2} />
      <Coin pos={[0,   1.5, -45]}  value={2} />
      <Coin pos={[0,   1.5, -60]}  value={3} />
      <Coin pos={[0,   1.5, -75]}  value={3} />
      <Coin pos={[0,   1.5, -90]}  value={3} />
      <Coin pos={[0,   1.5, -105]} value={3} />
      <Coin pos={[0,   1.5, -120]} value={3} />
      <Coin pos={[-25, 1.5, -40]}  value={2} />
      <Coin pos={[-25, 1.5, -80]}  value={2} />
      <Coin pos={[-25, 1.5, -110]} value={2} />
      <Coin pos={[25,  1.5, -40]}  value={2} />
      <Coin pos={[25,  1.5, -80]}  value={2} />
      <Coin pos={[25,  1.5, -110]} value={2} />
      <Coin pos={[0,   1.5, -145]} value={5} />

      {/* ══ ДРАКОН МОДЫ — гранд-финал у цели ══ */}
      <BossDragon pos={[0, 0.5, -162]} scale={2.5} rotY={Math.PI} />

      {/* ══ КРИСТАЛЬНЫЕ КЛАСТЕРЫ вдоль краёв главного подиума ══ */}
      <CrystalCluster pos={[-7.5, 0, -20]}  scale={1.4} rotY={0.3} />
      <CrystalCluster pos={[7.5,  0, -20]}  scale={1.2} rotY={-0.5} />
      <CrystalCluster pos={[-7.5, 0, -40]}  scale={1.5} rotY={1.0} />
      <CrystalCluster pos={[7.5,  0, -40]}  scale={1.3} rotY={2.1} />
      <CrystalCluster pos={[-7.5, 0, -65]}  scale={1.4} rotY={0.7} />
      <CrystalCluster pos={[7.5,  0, -65]}  scale={1.6} rotY={-1.2} />
      <CrystalCluster pos={[-7.5, 0, -90]}  scale={1.3} rotY={1.5} />
      <CrystalCluster pos={[7.5,  0, -90]}  scale={1.4} rotY={-0.8} />
      <CrystalCluster pos={[-7.5, 0, -115]} scale={1.5} rotY={0.4} />
      <CrystalCluster pos={[7.5,  0, -115]} scale={1.2} rotY={2.4} />

      {/* ══ ЛЕДЯНЫЕ СКУЛЬПТУРЫ — арт-объекты подиума ══ */}
      <IceBlock pos={[-9,  0, -10]}  scale={1.6} rotY={0.2} />
      <IceBlock pos={[9,   0, -10]}  scale={1.8} rotY={-0.3} />
      <IceBlock pos={[-9,  0, -55]}  scale={1.5} rotY={0.9} />
      <IceBlock pos={[9,   0, -55]}  scale={1.7} rotY={-0.6} />
      <IceBlock pos={[-9,  0, -100]} scale={1.6} rotY={1.3} />
      <IceBlock pos={[9,   0, -100]} scale={1.5} rotY={-1.1} />

      {/* ══ ПАЛЬМЫ — тропик-шик по бокам сцены ══ */}
      <PalmTree pos={[-35, 0, -20]}  scale={2.0} rotY={0.1} />
      <PalmTree pos={[35,  0, -20]}  scale={2.0} rotY={-0.1} />
      <PalmTree pos={[-35, 0, -60]}  scale={2.2} rotY={0.3} />
      <PalmTree pos={[35,  0, -60]}  scale={2.2} rotY={-0.3} />
      <PalmTree pos={[-35, 0, -100]} scale={2.1} rotY={0.2} />
      <PalmTree pos={[35,  0, -100]} scale={2.1} rotY={-0.2} />

      {/* ══ AUDIENCE CROWD ══ */}
      <AudienceCrowd />

      {/* ══ SPOT LIGHTS ON RUNWAY ══ */}
      <SpotLights />

      {/* ══ CONFETTI CANNONS ══ */}
      <ConfettiCannon />

      {/* ══ GLITTER CONFETTI SHOWER ══ */}
      <GlitterShower />

      {/* ══ RUNWAY LIGHT STREAKS ══ */}
      <RunwayLightStreaks />

      {/* ══ AUDIENCE GLOW PANELS ══ */}
      <AudienceGlow />

      {/* ══ SPOTLIGHT BEAMS FROM ABOVE ══ */}
      <SpotlightBeams />

      {/* ══ WINNER'S FINALE AREA ══ */}
      <WinnerPodium />
      <ConfettiBurst />
      <FinaleFireworks />

      {/* ══ VIP BACKSTAGE AREA ══ */}
      <BackstageArea />

      {/* ══ PHOTO WALL (branded step-and-repeat, near backstage entrance) ══ */}
      <PhotoWall />

      {/* ══ MIRROR WALL (dressing room, left side of backstage) ══ */}
      <MirrorWall />

      {/* ══ DESIGN STUDIO (side area x≈55–70) ══ */}
      <DesignStudio position={[60, 0, -40]} />

      {/* ══ RUNWAY PREP (models backstage, side x≈55) ══ */}
      <RunwayPrep position={[58, 0, -20]} />

      {/* ══ FABRIC RAINBOW (display wall, side x≈58) ══ */}
      <FabricRainbow position={[60, 0, -65]} />

      {/* ══ GOAL ══ */}
      <GoalTrigger
        pos={[0, 2, -155]}
        size={[30, 4, 15]}
        result={{
          kind: 'win',
          label: 'ПОБЕДИТЕЛЬ НЕДЕЛИ МОДЫ!',
          subline: 'Ты дошёл до финала!',
        }}
      />
    </>
  )
}
