import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, GrassTuft, Building } from '../Scenery'
import GradientSky from '../GradientSky'

const GRASS = '#6fd83e'
const WALL_BLUE = '#2f5599'
const WALL_BLUE_TOP = '#3d6ab5'

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} metalness={0} />
      </mesh>
    </RigidBody>
  )
}

function Walls() {
  const W = 80
  const H = 5
  const T = 2
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W / 2 - T / 2], size: [W + T * 2, H, T] },
    { pos: [0, H / 2, W / 2 + T / 2], size: [W + T * 2, H, T] },
    { pos: [-W / 2 - T / 2, H / 2, 0], size: [T, H, W] },
    { pos: [W / 2 + T / 2, H / 2, 0], size: [T, H, W] },
  ]
  return (
    <>
      {items.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={WALL_BLUE} roughness={0.95} />
          </mesh>
          <mesh position={[0, w.size[1] / 2 + 0.15, 0]}>
            <boxGeometry args={[w.size[0], 0.3, w.size[2] + 0.1]} />
            <meshStandardMaterial color={WALL_BLUE_TOP} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

// ─── Grid overlay — creation mode feel ───────────────────────────
const GRID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const GRID_FRAG = `
  varying vec2 vUv;
  void main() {
    // Thin lines every 2 units — uv maps 0..1 over 100 units, so 50 cells
    vec2 grid50 = fract(vUv * 50.0);
    float thinLine = step(0.97, grid50.x) + step(0.97, grid50.y);
    thinLine = clamp(thinLine, 0.0, 1.0);

    // Thick lines every 10 units — 10 cells over 100
    vec2 grid10 = fract(vUv * 10.0);
    float thickLine = step(0.94, grid10.x) + step(0.94, grid10.y);
    thickLine = clamp(thickLine, 0.0, 1.0);

    float alpha = thinLine * 0.08 + thickLine * 0.14;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

function GridOverlay() {
  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Creation sparkle orbiting particles ─────────────────────────
const SPARKLE_COLORS = [
  '#ff6ec7', '#ffdd44', '#44ffcc', '#88aaff', '#ff8844',
  '#ccff44', '#ff44bb', '#44eeff', '#ffaa22', '#aaffaa',
]

interface SparkleParticle {
  angle: number
  angleSpeed: number
  radius: number
  yOffset: number
  colorIdx: number
}

function CreationSparkles() {
  const groupRef = useRef<THREE.Group>(null!)
  const particles = useMemo<SparkleParticle[]>(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      angle: (i / 20) * Math.PI * 2,
      angleSpeed: 0.4 + Math.random() * 0.8,
      radius: 1.5 + Math.random() * 0.5,
      yOffset: Math.random() * 1.5,
      colorIdx: i % SPARKLE_COLORS.length,
    }))
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    particles.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const angle = p.angle + t * p.angleSpeed
      mesh.position.set(
        Math.cos(angle) * p.radius,
        1.5 + p.yOffset + Math.sin(t * 1.5 + i) * 0.2,
        Math.sin(angle) * p.radius
      )
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 6]}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[Math.cos(p.angle) * p.radius, 1.5 + p.yOffset, Math.sin(p.angle) * p.radius]}
        >
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshBasicMaterial color={SPARKLE_COLORS[p.colorIdx] ?? '#ffffff'} />
        </mesh>
      ))}
    </group>
  )
}

export default function SandboxWorld() {
  return (
    <>
      {/* Creative sunset sky */}
      <GradientSky top="#1a0a30" bottom="#ff5500" radius={440} />

      {/* Grid overlay — sandbox creation mode */}
      <GridOverlay />

      {/* Creation sparkle aura at spawn */}
      <CreationSparkles />

      <Ground />
      <Walls />

      {/* Дома — Kenney City Kit (настоящие здания) */}
      <Building pos={[-10, 0, -12]} letter="a" scale={2.6} rotY={Math.PI / 4} />
      <Building pos={[12, 0, -14]} letter="b" scale={2.6} rotY={-Math.PI / 5} />
      <Building pos={[-14, 0, 6]} letter="c" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[14, 0, 8]} letter="d" scale={2.6} rotY={-Math.PI / 2} />

      {/* Деревья — Stylized Nature (5 вариантов, случайные) */}
      <Tree pos={[-4, 0, -4]} variant={0} />
      <Tree pos={[3, 0, -3]} variant={1} rotY={0.5} />
      <Tree pos={[-6, 0, 2]} variant={2} />
      <Tree pos={[5, 0, 6]} variant={3} rotY={1.2} />
      <Tree pos={[-14, 0, -2]} variant={4} />
      <Tree pos={[14, 0, -2]} variant={0} rotY={-0.8} />
      <Tree pos={[-2, 0, 14]} variant={1} />
      <Tree pos={[2, 0, -18]} variant={2} rotY={2} />
      <Tree pos={[-8, 0, -18]} variant={3} />
      <Tree pos={[8, 0, -20]} variant={4} rotY={0.4} />

      {/* Кусты и цветы — атмосфера */}
      <Bush pos={[1, 0, 2]} variant={1} scale={0.9} />
      <Bush pos={[-5, 0, -6]} variant={0} scale={1.1} />
      <Bush pos={[7, 0, 2]} variant={1} scale={1} rotY={1} />
      <Flowers pos={[-2, 0, 5]} scale={1.3} />
      <Flowers pos={[4, 0, -8]} scale={1.1} rotY={0.5} />
      <Flowers pos={[-7, 0, -2]} scale={1} />

      {/* Трава */}
      {[
        [-3, 0, 1],
        [2, 0, -2],
        [6, 0, 4],
        [-8, 0, 6],
        [9, 0, -4],
        [-10, 0, -8],
        [-4, 0, 10],
        [5, 0, 12],
      ].map((p, i) => (
        <GrassTuft
          key={i}
          pos={p as [number, number, number]}
          tall={i % 2 === 0}
          scale={0.9 + (i % 3) * 0.1}
          rotY={i * 0.7}
        />
      ))}

      {/* Продавец за прилавком */}
      <NPC pos={[3, 0, -6]} label="ЛАВКА" />

      {/* GLTF-NPC с анимациями */}
      <GltfMonster which="bunny" pos={[-7, 0, -7]} scale={1.2} rotY={Math.PI / 4} animation="Yes" />
      <GltfMonster which="cactoro" pos={[7, 0, -8]} scale={1.3} rotY={-0.5} animation="Wave" />
      <GltfMonster which="alien" pos={[-9, 0, 6]} scale={1.1} rotY={1.2} />

      <Enemy pos={[6, 1.4, -6]} patrolX={2} color="#ff5464" />
      <GltfMonster which="birb" pos={[0, 2.2, 4]} patrolX={5} scale={0.8} sensor animation="Run" />

      {/* Монетки */}
      {[
        [0, 1, -4],
        [4, 1, 4],
        [-5, 1, -6],
        [6, 1, -10],
        [-8, 1, 8],
        [10, 1, 4],
        [-2, 1, 10],
        [8, 1, -3],
      ].map((p, i) => (
        <Coin key={i} pos={p as [number, number, number]} />
      ))}

      <GoalTrigger
        pos={[3, 1.5, -6]}
        size={[2, 3, 2]}
        result={{
          kind: 'win',
          label: 'ДОБРО ПОЖАЛОВАТЬ!',
          subline: 'Ты нашёл торговца. Собирай монетки!',
        }}
      />
    </>
  )
}

export const SANDBOX_SPAWN: [number, number, number] = [0, 3, 6]
