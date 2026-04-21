import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './Player'
import ObbyWorld, { OBBY_SPAWN } from './worlds/ObbyWorld'
import RaceWorld, { RACE_SPAWN } from './worlds/RaceWorld'
import SandboxWorld, { SANDBOX_SPAWN } from './worlds/SandboxWorld'
import CameraController from './CameraController'
import type { GameMeta } from '../lib/games'
import type { Avatar } from '../lib/avatars'

const KEYS = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
]

interface Props {
  game: GameMeta
  avatar: Avatar
}

export default function GameScene({ game, avatar }: Props) {
  const { world: W, spawn } = pickWorld(game.category)
  return (
    <KeyboardControls map={KEYS}>
      <Canvas
        shadows="soft"
        camera={{ position: [spawn[0], spawn[1] + 4, spawn[2] + 8], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Голубое небо — turbidity низкий, rayleigh чуть выше → насыщенный cyan-blue */}
        <Sky sunPosition={[20, 40, 20]} turbidity={4} rayleigh={1.2} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <fog attach="fog" args={['#8cc3f5', 50, 110]} />
        {/* Верхнее солнце даёт жёсткую тень, hemisphere + ambient — мягкий filler */}
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#a8d5ff', '#48c774', 0.5]} />
        <directionalLight
          position={[25, 35, 15]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-20, 25, -10]} intensity={0.25} />
        <Physics gravity={[0, -30, 0]}>
          <W />
          <Player avatar={avatar} startPos={spawn} />
        </Physics>
        <CameraController />
      </Canvas>
    </KeyboardControls>
  )
}

function pickWorld(cat: GameMeta['category']) {
  switch (cat) {
    case 'race':
      return { world: RaceWorld, spawn: RACE_SPAWN }
    case 'sandbox':
    case 'rp':
    case 'sim':
      return { world: SandboxWorld, spawn: SANDBOX_SPAWN }
    case 'obby':
    default:
      return { world: ObbyWorld, spawn: OBBY_SPAWN }
  }
}
