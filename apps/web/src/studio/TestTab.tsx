import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import GradientSky from '../components/GradientSky'
import Sun from '../components/Sun'
import Player from '../components/Player'
import VoxelClouds from '../components/VoxelClouds'
import { loadAvatar } from '../lib/avatars'
import type { EditorState, PartObject, MaterialType } from './editorState'

const KEYS = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
]

function materialProps(m: MaterialType) {
  switch (m) {
    case 'metal':
      return { roughness: 0.3, metalness: 0.8 }
    case 'neon':
      return { roughness: 0.2, metalness: 0 }
    default:
      return { roughness: 0.85, metalness: 0 }
  }
}

function StaticPart({ p }: { p: PartObject }) {
  const mp = materialProps(p.material)
  const isEmissive = p.type === 'coin' || p.type === 'finish' || p.material === 'neon'
  return (
    <RigidBody type="fixed" colliders="cuboid" position={p.position} rotation={p.rotation}>
      <mesh scale={p.scale} castShadow receiveShadow>
        {p.type === 'coin' ? (
          <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
        ) : (
          <boxGeometry args={[1, 1, 1]} />
        )}
        <meshStandardMaterial
          color={p.color}
          roughness={mp.roughness}
          metalness={mp.metalness}
          emissive={isEmissive ? p.color : '#000'}
          emissiveIntensity={isEmissive ? 0.3 : 0}
        />
      </mesh>
    </RigidBody>
  )
}

/**
 * Test Tab — запускает текущую сцену редактора как живую игру с физикой.
 * Cобирает Parts из editorState, ставит Player в spawn-позицию, физика работает.
 */
export default function TestTab({ state }: { state: EditorState }) {
  const avatar = useMemo(() => loadAvatar(), [])
  const spawnPart = state.parts.find((p) => p.type === 'spawn')
  const spawnPos: [number, number, number] = spawnPart
    ? [spawnPart.position[0], spawnPart.position[1] + 2, spawnPart.position[2]]
    : [0, 3, 0]

  return (
    <div className="studio-test">
      <KeyboardControls map={KEYS}>
        <Canvas
          shadows="soft"
          camera={{ position: [spawnPos[0], spawnPos[1] + 4, spawnPos[2] + 8], fov: 60, far: 600 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={[state.scene.skyBottom]} />
          <GradientSky top={state.scene.skyTop} bottom={state.scene.skyBottom} />
          <VoxelClouds />
          <Sun position={[50, 45, 20]} />

          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
          <directionalLight
            position={[50, 45, 20]}
            intensity={1.3}
            color="#fff3d8"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={150}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />
          <directionalLight position={[-30, 20, -20]} intensity={0.45} color="#b0d8ff" />

          <Physics gravity={[0, -30, 0]}>
            {state.parts.map((p) => (
              <StaticPart key={p.id} p={p} />
            ))}
            <Player avatar={avatar} startPos={spawnPos} />
          </Physics>

          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.05} />
        </Canvas>
      </KeyboardControls>
      <div className="test-help">
        <strong>WASD</strong> — ходить · <strong>Space</strong> — прыжок · клик — захват мыши
      </div>
    </div>
  )
}
