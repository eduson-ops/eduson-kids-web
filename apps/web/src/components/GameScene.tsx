import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './Player'
import ObbyWorld, { OBBY_SPAWN } from './worlds/ObbyWorld'
import RaceWorld, { RACE_SPAWN } from './worlds/RaceWorld'
import SandboxWorld, { SANDBOX_SPAWN } from './worlds/SandboxWorld'
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
        shadows
        camera={{ position: [spawn[0], spawn[1] + 4, spawn[2] + 8], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Sky sunPosition={[20, 40, 20]} turbidity={8} rayleigh={2} />
        <fog attach="fog" args={['#cfe7ff', 40, 90]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={90}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />
        <Physics gravity={[0, -30, 0]}>
          <W />
          <Player avatar={avatar} startPos={spawn} />
        </Physics>
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
