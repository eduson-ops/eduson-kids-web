import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Sky } from '@react-three/drei'
import World from './World'
import Player from './Player'

const KEYS = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
]

interface Props {
  playerColor?: string
}

export default function GameScene({ playerColor = '#ff5ab1' }: Props) {
  return (
    <KeyboardControls map={KEYS}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Sky sunPosition={[20, 40, 20]} turbidity={8} rayleigh={2} />
        <fog attach="fog" args={['#cfe7ff', 40, 80]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />
        <World />
        <Player color={playerColor} />
      </Canvas>
    </KeyboardControls>
  )
}
