import { Canvas } from '@react-three/fiber'
import { KeyboardControls, SoftShadows } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Player from './Player'
import Sun from './Sun'
import GradientSky from './GradientSky'
import VoxelClouds from './VoxelClouds'
import ObbyWorld, { OBBY_SPAWN } from './worlds/ObbyWorld'
import RaceWorld, { RACE_SPAWN } from './worlds/RaceWorld'
import SandboxWorld, { SANDBOX_SPAWN } from './worlds/SandboxWorld'
import TowerWorld, { TOWER_SPAWN } from './worlds/TowerWorld'
import GardenWorld, { GARDEN_SPAWN } from './worlds/GardenWorld'
import PetSimWorld, { PETSIM_SPAWN } from './worlds/PetSimWorld'
import BotTownWorld, { BOTTOWN_SPAWN } from './worlds/BotTownWorld'
import FashionWorld, { FASHION_SPAWN } from './worlds/FashionWorld'
import MysteryWorld, { MYSTERY_SPAWN } from './worlds/MysteryWorld'
import NightsWorld, { NIGHTS_SPAWN } from './worlds/NightsWorld'
import TycoonWorld, { TYCOON_SPAWN } from './worlds/TycoonWorld'
import AbilityBuilderWorld, { ABILITY_SPAWN } from './worlds/AbilityBuilderWorld'
import PetBrainWorld, { PETBRAIN_SPAWN } from './worlds/PetBrainWorld'
import TempleWorld, { TEMPLE_SPAWN } from './worlds/TempleWorld'
import SpaceStationWorld, { SPACE_SPAWN } from './worlds/SpaceStationWorld'
import CyberCityWorld, { CYBER_SPAWN } from './worlds/CyberCityWorld'
import CameraController from './CameraController'
import AdaptiveDPR from './AdaptiveDPR'
import Scriptable from './Scriptable'
import UniversalClickCatcher from './UniversalClickCatcher'
import FocusedObjectIndicator from './FocusedObjectIndicator'
import WorldAdditions from './WorldAdditions'
import WorldOverridesApplier from './WorldOverridesApplier'
import ToonOverride from './ToonOverride'
import GroundOverride from './GroundOverride'
import PostFX from './PostFX'
import ScriptGhosts from './ScriptGhosts'
import { getWorldTargets } from './worlds/scriptableTargets'
import type { GameMeta } from '../lib/games'
import type { Avatar } from '../lib/avatars'
import { getPhysicsTimestep, getShadowMapSize, canPostfx } from '../lib/deviceTier'

// Размер теневой карты берём из централизованного deviceTier (256/512/1024/2048).
const SHADOW_MAP_SIZE = getShadowMapSize()
const PHYSICS_TIMESTEP = getPhysicsTimestep()
// Когда добавим postprocessing (EffectComposer/Bloom/SSAO) — оборачивать в
// `{canPostfx() && <EffectComposer>...}`, чтобы low-tier не платил за эффекты.

const KEYS = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
]

interface Props {
  game: GameMeta
  avatar: Avatar
}

// Позиция солнца: высоко-слева-сбоку — даёт драматичные тени, но не выгорает.
const SUN_POS: [number, number, number] = [50, 45, 20]
// Контровая подсветка с противоположной стороны — тень не чернеет.
const FILL_LIGHT_POS: [number, number, number] = [-30, 20, -20]

export default function GameScene({ game, avatar }: Props) {
  const { world: W, spawn } = pickWorld(game.category)
  const scriptTargets = getWorldTargets(game.id, game.category)
  return (
    <KeyboardControls map={KEYS}>
      <Canvas
        shadows="soft"
        camera={{ position: [spawn[0], spawn[1] + 4, spawn[2] + 8], fov: 60, near: 0.1, far: 600 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        // Глушим браузерное контекст-меню в зоне канваса: правый клик в режиме
        // редактора должен быть свободен для собственных действий редактора,
        // иначе любой ПКМ открывает «копировать/сохранить картинку» и кикает
        // PointerLock — сцена становится непригодной.
        onContextMenu={(e) => e.preventDefault()}
      >
        {canPostfx() && <SoftShadows size={12} samples={12} focus={0.5} />}
        {/* Градиентное голубое небо через shader — всегда голубое */}
        <GradientSky top="#3d88ff" bottom="#b8e1ff" />
        {/* Pixel-voxel облака, медленно плывут */}
        <VoxelClouds />
        {/* Видимое солнце */}
        <Sun position={SUN_POS} />
        {/* Мягкий туман только в самой дали, не глушит небо */}
        <fog attach="fog" args={['#b8e1ff', 140, 320]} />

        {/* Освещение: тёплое солнце + голубая заливка тени + сильный ambient.
            Избегаем "чёрного силуэта" персонажа когда он стоит между камерой и солнцем. */}
        <ambientLight intensity={0.75} />
        <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
        <directionalLight
          position={SUN_POS}
          intensity={1.3}
          color="#fff3d8"
          castShadow
          shadow-mapSize-width={SHADOW_MAP_SIZE}
          shadow-mapSize-height={SHADOW_MAP_SIZE}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.00005}
          shadow-normalBias={0.03}
        />
        {/* Контровая подсветка с противоположной стороны — тень не чернеет */}
        <directionalLight position={FILL_LIGHT_POS} intensity={0.45} color="#b0d8ff" />
        {/* Subtle top-down rim for character readability */}
        <directionalLight position={[0, 30, -40]} intensity={0.25} color="#e8f4ff" />

        <Physics gravity={[0, -25, 0]} timeStep={PHYSICS_TIMESTEP}>
          <UniversalClickCatcher worldId={game.id}>
            <W />
            <WorldAdditions worldId={game.id} />
            {scriptTargets.map((t) => (
              <Scriptable
                key={t.id}
                worldId={game.id}
                objectId={t.id}
                pos={t.pos}
                label={t.label}
                radius={t.radius ?? 1.2}
              />
            ))}
            {/* Невидимые Scriptable для universal-click скриптов (at_*) */}
            <ScriptGhosts
              worldId={game.id}
              knownIds={new Set(scriptTargets.map((t) => t.id))}
            />
          </UniversalClickCatcher>
          <Player avatar={avatar} startPos={spawn} />
        </Physics>
        {/* Applier живёт ВНЕ Physics — ему нужен доступ к scene через useThree */}
        <WorldOverridesApplier worldId={game.id} />
        {/* Cel / toon shading — заменяет MeshStandardMaterial на MeshToonMaterial */}
        <ToonOverride />
        {/* Procedural noise-variation shader for large ground planes */}
        <GroundOverride />
        <PostFX />
        <CameraController />
        <FocusedObjectIndicator />
        <AdaptiveDPR />
      </Canvas>
    </KeyboardControls>
  )
}

function pickWorld(cat: GameMeta['category']) {
  switch (cat) {
    case 'race':
      return { world: RaceWorld, spawn: RACE_SPAWN }
    case 'tower':
      return { world: TowerWorld, spawn: TOWER_SPAWN }
    case 'garden':
      return { world: GardenWorld, spawn: GARDEN_SPAWN }
    case 'pets':
      return { world: PetSimWorld, spawn: PETSIM_SPAWN }
    case 'town':
      return { world: BotTownWorld, spawn: BOTTOWN_SPAWN }
    case 'fashion':
      return { world: FashionWorld, spawn: FASHION_SPAWN }
    case 'mystery':
      return { world: MysteryWorld, spawn: MYSTERY_SPAWN }
    case 'nights':
      return { world: NightsWorld, spawn: NIGHTS_SPAWN }
    case 'tycoon':
      return { world: TycoonWorld, spawn: TYCOON_SPAWN }
    case 'ability':
      return { world: AbilityBuilderWorld, spawn: ABILITY_SPAWN }
    case 'petbrain':
      return { world: PetBrainWorld, spawn: PETBRAIN_SPAWN }
    case 'sandbox':
    case 'rp':
    case 'sim':
      return { world: SandboxWorld, spawn: SANDBOX_SPAWN }
    case 'temple':
      return { world: TempleWorld, spawn: TEMPLE_SPAWN }
    case 'space':
      return { world: SpaceStationWorld, spawn: SPACE_SPAWN }
    case 'cyber':
      return { world: CyberCityWorld, spawn: CYBER_SPAWN }
    case 'obby':
    default:
      return { world: ObbyWorld, spawn: OBBY_SPAWN }
  }
}
