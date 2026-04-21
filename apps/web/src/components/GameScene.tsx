import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './Player'
import Sun from './Sun'
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

// Позиция солнца: утреннее высоко-боковое (не зенит) — даёт красивые длинные тени
// и драматичный голубой оттенок неба. Используется И для directional-света, И для
// визуального диска солнца, И для Sky-шейдера.
const SUN_POS: [number, number, number] = [50, 30, 20]

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
        {/* Базовый фон на случай проблем со Sky shader — тот же голубой */}
        <color attach="background" args={['#7ec0f5']} />
        {/* Голубое небо с выраженным градиентом.
            rayleigh=3 → больше синего рассеивания
            turbidity=6 → атмосфера не слишком мутная
            низкое солнце → чёткий контраст горизонта и зенита */}
        <Sky
          distance={450000}
          sunPosition={SUN_POS}
          turbidity={6}
          rayleigh={3}
          mieCoefficient={0.005}
          mieDirectionalG={0.85}
        />
        {/* Видимый солнечный диск в направлении света */}
        <Sun position={SUN_POS} />
        {/* Туман — только очень далеко, чтобы не затирать небо */}
        <fog attach="fog" args={['#a8d5ff', 110, 240]} />
        {/* Освещение */}
        <ambientLight intensity={0.45} />
        <hemisphereLight args={['#a8d5ff', '#48c774', 0.5]} />
        <directionalLight
          position={SUN_POS}
          intensity={1.4}
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
        {/* Лёгкая контровая подсветка с другой стороны — чтобы теневая сторона
            не была полностью чёрной */}
        <directionalLight position={[-20, 15, -15]} intensity={0.2} color="#b0d8ff" />
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
