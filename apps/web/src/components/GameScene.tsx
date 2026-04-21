import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './Player'
import Sun from './Sun'
import GradientSky from './GradientSky'
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

// Позиция солнца: высоко-слева-сбоку — даёт драматичные тени, но не выгорает.
const SUN_POS: [number, number, number] = [50, 45, 20]

export default function GameScene({ game, avatar }: Props) {
  const { world: W, spawn } = pickWorld(game.category)
  return (
    <KeyboardControls map={KEYS}>
      <Canvas
        shadows="soft"
        camera={{ position: [spawn[0], spawn[1] + 4, spawn[2] + 8], fov: 60, far: 600 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Градиентное голубое небо через shader — всегда голубое */}
        <GradientSky top="#3d88ff" bottom="#b8e1ff" />
        {/* Видимое солнце */}
        <Sun position={SUN_POS} />
        {/* Мягкий туман только в самой дали, не глушит небо */}
        <fog attach="fog" args={['#b8e1ff', 140, 320]} />

        {/* Освещение: тёплое солнце + голубая заливка тени + сильный ambient.
            Избегаем "чёрного силуэта" персонажа когда он стоит между камерой и солнцем. */}
        <ambientLight intensity={0.9} />
        <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
        <directionalLight
          position={SUN_POS}
          intensity={1.3}
          color="#fff3d8"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
        />
        {/* Контровая подсветка с противоположной стороны — тень не чернеет */}
        <directionalLight position={[-30, 20, -20]} intensity={0.45} color="#b0d8ff" />

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
