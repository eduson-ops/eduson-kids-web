import { useEffect, useMemo, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { PUBLIC_BASE } from '../lib/publicPath'
import {
  getAdditionsForWorld,
  getRecoloredForWorld,
  subscribeEdits,
  hashPos,
  type SpawnedPart,
} from '../lib/worldEdits'
import { Tree, Bush, Mushroom, Rock, Flowers, GrassTuft, Building, ParkedCar } from './Scenery'
import GltfMonster, { type MonsterId } from './GltfMonster'
import Coin from './Coin'

interface Props {
  worldId: string
}

export default function WorldAdditions({ worldId }: Props) {
  const [parts, setParts] = useState<SpawnedPart[]>(() => getAdditionsForWorld(worldId))
  const [recolored, setRecolored] = useState<Record<string, string>>(() => getRecoloredForWorld(worldId))

  useEffect(() => {
    const refresh = () => {
      setParts(getAdditionsForWorld(worldId))
      setRecolored(getRecoloredForWorld(worldId))
    }
    return subscribeEdits(refresh)
  }, [worldId])

  const nodes = useMemo(
    () => parts.map((p) => {
      const posHash = hashPos(p.pos)
      const effectiveColor = recolored[posHash] ?? p.color
      return <SpawnedMesh key={p.id} part={{ ...p, color: effectiveColor }} />
    }),
    [parts, recolored]
  )
  return <>{nodes}</>
}

function SpawnedMesh({ part }: { part: SpawnedPart }) {
  const { pos, color, size, kind } = part

  switch (kind) {
    // ─── Блоки ───
    case 'cube':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'sphere':
      return (
        <RigidBody type="fixed" colliders="ball" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]}>
            <sphereGeometry args={[0.5, 18, 14]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>
        </RigidBody>
      )
    case 'cylinder':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size * 1.5, size]}>
            <cylinderGeometry args={[0.45, 0.45, 1, 18]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'ramp':
      return (
        <RigidBody type="fixed" colliders="trimesh" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size, size]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[2, 0.3, 1.2]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        </RigidBody>
      )
    case 'plate':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size * 2, size * 0.2, size * 2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        </RigidBody>
      )

    // ─── Геймплей ───
    case 'coin':
      return <Coin pos={pos} />
    case 'checkpoint':
      return (
        <group position={pos}>
          <mesh castShadow>
            <coneGeometry args={[0.1, 0.8, 4]} />
            <meshStandardMaterial color="#48c774" />
          </mesh>
          <mesh position={[0.35, 0.2, 0]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.05]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      )
    case 'goal':
      return (
        <group position={pos}>
          <mesh castShadow receiveShadow scale={[size * 3, size * 0.2, size * 1.5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#ffd644"
              emissive="#ffaa00"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.4, 1.7, 0]}>
            <boxGeometry args={[0.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )
    case 'spike':
      return (
        <group position={pos}>
          {[0, 0.3, -0.3].map((xo, i) => (
            <mesh key={i} position={[xo, 0.3, 0]} castShadow>
              <coneGeometry args={[0.15, 0.6, 6]} />
              <meshStandardMaterial color="#ff5464" roughness={0.4} metalness={0.6} />
            </mesh>
          ))}
        </group>
      )
    case 'bouncer':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow scale={[size, size * 0.3, size]}>
            <cylinderGeometry args={[0.8, 0.9, 1, 16]} />
            <meshStandardMaterial
              color="#ff5ab1"
              emissive="#ff5ab1"
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>
        </RigidBody>
      )

    // ─── Платформер (Kenney Platformer Kit) ───
    case 'chest':
    case 'key':
    case 'star':
    case 'heart':
    case 'bomb':
    case 'barrel':
    case 'crate':
    case 'ladder':
    case 'tree-pine':
    case 'flag-platformer': {
      const fileMap: Record<string, string> = {
        'chest': 'chest.glb',
        'key': 'key.glb',
        'star': 'star.glb',
        'heart': 'heart.glb',
        'bomb': 'bomb.glb',
        'barrel': 'barrel.glb',
        'crate': 'crate.glb',
        'ladder': 'ladder.glb',
        'tree-pine': 'tree-pine.glb',
        'flag-platformer': 'flag.glb',
      }
      const scaleMap: Record<string, number> = {
        'chest': 1.8, 'key': 1.2, 'star': 1.4, 'heart': 1.2, 'bomb': 1.5,
        'barrel': 1.5, 'crate': 1.5, 'ladder': 2.0, 'tree-pine': 2.5, 'flag-platformer': 1.8,
      }
      return (
        <PlatformerProp
          file={fileMap[kind]}
          pos={pos}
          scale={size * (scaleMap[kind] ?? 1.5)}
        />
      )
    }

    // ─── Природа ───
    case 'tree':
      return (
        <group position={pos} scale={[size, size, size]}>
          <Tree pos={[0, 0, 0]} variant={0} />
        </group>
      )
    case 'bush':
      return <Bush pos={pos} variant={0} scale={size} />
    case 'mushroom':
      return <Mushroom pos={pos} red scale={size} />
    case 'rock':
      return <Rock pos={pos} scale={size} />
    case 'flower':
      return <Flowers pos={pos} scale={size} />
    case 'grass-tuft':
      return <GrassTuft pos={pos} tall scale={size} />

    // ─── Персонажи ───
    case 'npc-bunny':
    case 'npc-alien':
    case 'npc-cactoro':
    case 'npc-birb':
    case 'npc-bluedemon': {
      const map: Record<string, MonsterId> = {
        'npc-bunny': 'bunny',
        'npc-alien': 'alien',
        'npc-cactoro': 'cactoro',
        'npc-birb': 'birb',
        'npc-bluedemon': 'blueDemon',
      }
      return <GltfMonster which={map[kind]} pos={pos} scale={size} animation="Yes" />
    }

    // ─── Свет ───
    case 'light':
      return (
        <group position={pos}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.2}
              roughness={0.3}
            />
          </mesh>
          <pointLight color={color} intensity={1.5} distance={10} decay={2} />
        </group>
      )
    case 'torch':
      return <Torch pos={pos} />
    case 'neon-sign':
      return (
        <group position={pos}>
          <mesh castShadow scale={[size * 1.2, size * 0.8, size * 0.2]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
          <pointLight color={color} intensity={2} distance={8} decay={2} />
        </group>
      )

    // ─── Декор (Kenney packs) ───
    case 'building':
      return <Building pos={pos} letter="a" scale={size * 2} />
    case 'car':
      return <ParkedCar pos={pos} model="sedan" rotY={0} />
    case 'pumpkin':
      return <GraveyardProp file="pumpkin-carved.glb" pos={pos} scale={size * 1.6} />
    case 'coffin':
      return <GraveyardProp file="coffin.glb" pos={pos} scale={size * 2} rotY={Math.PI / 4} />
    case 'candle':
      return <GraveyardProp file="candle.glb" pos={pos} scale={size * 1.5} />

    // ─── Процедурные механики ───
    case 'speed-pad':
      return <SpeedPad pos={pos} color={color} size={size} />
    case 'portal':
      return <Portal pos={pos} color={color} size={size} />
    case 'crystal':
      return <Crystal pos={pos} color={color} size={size} />
    case 'campfire':
      return <Campfire pos={pos} size={size} />
    case 'sign':
      return <Sign pos={pos} color={color} size={size} />
    case 'stair-step':
      return (
        <RigidBody type="fixed" colliders="cuboid" position={pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[size * 2, size * 0.5, size]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </RigidBody>
      )

    // ─── Архитектура ───
    case 'arch':
      return <Arch pos={pos} color={color} size={size} />
    case 'fence':
      return <Fence pos={pos} color={color} size={size} />
    case 'bench':
      return <Bench pos={pos} color={color} size={size} />
    case 'flower-pot':
      return <FlowerPot pos={pos} color={color} size={size} />
    case 'halfpipe':
      return <Halfpipe pos={pos} color={color} size={size} />

    // ─── Особые ───
    case 'windmill':
      return <Windmill pos={pos} color={color} size={size} />
    case 'snowman':
      return <Snowman pos={pos} size={size} />
    case 'satellite-dish':
      return <SatelliteDish pos={pos} color={color} size={size} />

    // ─── Еда ───
    case 'cake':
      return <Cake pos={pos} color={color} size={size} />
    case 'donut':
      return <Donut pos={pos} color={color} size={size} />
    case 'ice-cream':
      return <IceCream pos={pos} color={color} size={size} />

    // ─── Sci-fi ───
    case 'rocket':
      return <Rocket pos={pos} color={color} size={size} />
    case 'robot':
      return <Robot pos={pos} color={color} size={size} />
    case 'ufo':
      return <UFO pos={pos} color={color} size={size} />

    // ─── Фэнтези ───
    case 'castle-tower':
      return <CastleTower pos={pos} color={color} size={size} />
    case 'magic-orb':
      return <MagicOrb pos={pos} color={color} size={size} />
    case 'throne':
      return <Throne pos={pos} color={color} size={size} />
    case 'guitar':
      return <Guitar pos={pos} color={color} size={size} />
    case 'piano':
      return <Piano pos={pos} color={color} size={size} />
    case 'drum-kit':
      return <DrumKit pos={pos} color={color} size={size} />
    case 'soccer-ball':
      return <SoccerBall pos={pos} color={color} size={size} />
    case 'trophy':
      return <Trophy pos={pos} color={color} size={size} />
    case 'goal-net':
      return <GoalNet pos={pos} color={color} size={size} />
    case 'duck':
      return <Duck pos={pos} color={color} size={size} />
    case 'cat-statue':
      return <CatStatue pos={pos} color={color} size={size} />
    case 'fish-tank':
      return <FishTank pos={pos} color={color} size={size} />
    case 'table':
      return <Table pos={pos} color={color} size={size} />
    case 'bookshelf':
      return <Bookshelf pos={pos} color={color} size={size} />
    case 'lamp-floor':
      return <FloorLamp pos={pos} color={color} size={size} />

    // Transportation
    case 'airplane':
      return <Airplane pos={pos} color={color} size={size} />
    case 'boat':
      return <Boat pos={pos} color={color} size={size} />
    case 'train':
      return <Train pos={pos} color={color} size={size} />

    // Playground
    case 'swing':
      return <Swing pos={pos} color={color} size={size} />
    case 'slide':
      return <Slide pos={pos} color={color} size={size} />
    case 'seesaw':
      return <Seesaw pos={pos} color={color} size={size} />

    // Space
    case 'planet':
      return <Planet pos={pos} color={color} size={size} />
    case 'asteroid':
      return <Asteroid pos={pos} color={color} size={size} />
    case 'space-station':
      return <SpaceStation pos={pos} color={color} size={size} />

    // School
    case 'book-stack':
      return <BookStack pos={pos} color={color} size={size} />
    case 'globe':
      return <Globe pos={pos} color={color} size={size} />
    case 'microscope':
      return <Microscope pos={pos} color={color} size={size} />

    // Medieval
    case 'sword':
      return <Sword pos={pos} color={color} size={size} />
    case 'shield':
      return <Shield pos={pos} color={color} size={size} />
    case 'knight-statue':
      return <KnightStatue pos={pos} color={color} size={size} />

    // Ocean
    case 'coral':
      return <Coral pos={pos} color={color} size={size} />
    case 'submarine':
      return <Submarine pos={pos} color={color} size={size} />
    case 'anchor':
      return <Anchor pos={pos} color={color} size={size} />

    // Winter
    case 'igloo':
      return <Igloo pos={pos} color={color} size={size} />
    case 'sled':
      return <Sled pos={pos} color={color} size={size} />
    case 'snowflake-deco':
      return <SnowflakeDeco pos={pos} color={color} size={size} />

    // Circus/Fair
    case 'circus-tent':
      return <CircusTent pos={pos} color={color} size={size} />
    case 'ferris-wheel':
      return <FerrisWheel pos={pos} color={color} size={size} />
    case 'hot-air-balloon':
      return <HotAirBalloon pos={pos} color={color} size={size} />
    case 'pinwheel':
      return <Pinwheel pos={pos} color={color} size={size} />
    case 'lantern':
      return <Lantern pos={pos} color={color} size={size} />

    // Kitchen
    case 'burger':
      return <Burger pos={pos} color={color} size={size} />
    case 'pizza':
      return <Pizza pos={pos} color={color} size={size} />
    case 'sushi':
      return <Sushi pos={pos} color={color} size={size} />

    // Camping
    case 'tent':
      return <Tent pos={pos} color={color} size={size} />
    case 'backpack':
      return <Backpack pos={pos} color={color} size={size} />
    case 'compass':
      return <Compass pos={pos} color={color} size={size} />

    // Halloween
    case 'witch-hat':
      return <WitchHat pos={pos} color={color} size={size} />
    case 'ghost':
      return <Ghost pos={pos} color={color} size={size} />
    case 'spider-web':
      return <SpiderWeb pos={pos} color={color} size={size} />

    // Toys
    case 'teddy-bear':
      return <TeddyBear pos={pos} color={color} size={size} />
    case 'lego-brick':
      return <LegoBrick pos={pos} color={color} size={size} />
    case 'yo-yo':
      return <YoYo pos={pos} color={color} size={size} />

    // Lab
    case 'flask':
      return <Flask pos={pos} color={color} size={size} />
    case 'atom':
      return <Atom pos={pos} color={color} size={size} />
    case 'gear':
      return <Gear pos={pos} color={color} size={size} />
    // Weather
    case 'rain-cloud':
      return <RainCloud pos={pos} color={color} size={size} />
    case 'lightning-bolt':
      return <LightningBolt pos={pos} color={color} size={size} />
    case 'rainbow-arch':
      return <RainbowArch pos={pos} color={color} size={size} />
    case 'snowdrift':
      return <Snowdrift pos={pos} color={color} size={size} />
    case 'sun-deco':
      return <SunDeco pos={pos} color={color} size={size} />
    // Egypt
    case 'pyramid':
      return <Pyramid pos={pos} color={color} size={size} />
    case 'sphinx':
      return <Sphinx pos={pos} color={color} size={size} />
    case 'obelisk':
      return <Obelisk pos={pos} color={color} size={size} />
    // Candy
    case 'lollipop':
      return <Lollipop pos={pos} color={color} size={size} />
    case 'candy-cane':
      return <CandyCane pos={pos} color={color} size={size} />
    case 'gingerbread':
      return <Gingerbread pos={pos} color={color} size={size} />
    // Workshop
    case 'toolbox':
      return <Toolbox pos={pos} color={color} size={size} />
    case 'anvil':
      return <Anvil pos={pos} color={color} size={size} />
    case 'barrel-fire':
      return <BarrelFire pos={pos} color={color} size={size} />
    // Art
    case 'easel':
      return <Easel pos={pos} color={color} size={size} />
    case 'sculpture':
      return <Sculpture pos={pos} color={color} size={size} />
    case 'vase-ancient':
      return <VaseAncient pos={pos} color={color} size={size} />

    // ─── Farm ───
    case 'cow':
      return <Cow pos={pos} color={color} size={size} />
    case 'barn':
      return <Barn pos={pos} color={color} size={size} />
    case 'hay-bale':
      return <HayBale pos={pos} color={color} size={size} />
    case 'scarecrow':
      return <Scarecrow pos={pos} color={color} size={size} />
    case 'well':
      return <Well pos={pos} color={color} size={size} />

    // ─── Sport-2 ───
    case 'basketball-hoop':
      return <BasketballHoop pos={pos} color={color} size={size} />
    case 'boxing-gloves':
      return <BoxingGloves pos={pos} color={color} size={size} />
    case 'archery-target':
      return <ArcheryTarget pos={pos} color={color} size={size} />
    case 'surf-board':
      return <SurfBoard pos={pos} color={color} size={size} />
    case 'dumbbell':
      return <Dumbbell pos={pos} color={color} size={size} />

    // ─── Food-2 ───
    case 'taco':
      return <Taco pos={pos} color={color} size={size} />
    case 'ramen-bowl':
      return <RamenBowl pos={pos} color={color} size={size} />
    case 'boba-tea':
      return <BobaTea pos={pos} color={color} size={size} />
    case 'croissant':
      return <Croissant pos={pos} color={color} size={size} />
    case 'watermelon-slice':
      return <WatermelonSlice pos={pos} color={color} size={size} />

    // ─── Garden ───
    case 'watering-can':
      return <WateringCan pos={pos} color={color} size={size} />
    case 'bird-bath':
      return <BirdBath pos={pos} color={color} size={size} />
    case 'garden-gnome':
      return <GardenGnome pos={pos} color={color} size={size} />
    case 'flower-bed':
      return <FlowerBed pos={pos} color={color} size={size} />
    case 'trellis':
      return <Trellis pos={pos} color={color} size={size} />

    // ─── Jungle ───
    case 'palm-tree':
      return <PalmTree pos={pos} color={color} size={size} />
    case 'bamboo':
      return <Bamboo pos={pos} color={color} size={size} />
    case 'snake-deco':
      return <SnakeDeco pos={pos} color={color} size={size} />
    case 'tribal-mask':
      return <TribalMask pos={pos} color={color} size={size} />
    case 'vine-swing':
      return <VineSwing pos={pos} color={color} size={size} />

    // ─── City ───
    case 'traffic-light':
      return <TrafficLight pos={pos} color={color} size={size} />
    case 'fire-hydrant':
      return <FireHydrant pos={pos} color={color} size={size} />
    case 'mailbox':
      return <Mailbox pos={pos} color={color} size={size} />
    case 'street-lamp':
      return <StreetLamp pos={pos} color={color} size={size} />
    case 'phone-booth':
      return <PhoneBooth pos={pos} color={color} size={size} />

    // ─── Pirates ───
    case 'cannon':
      return <Cannon pos={pos} color={color} size={size} />
    case 'ship-wheel':
      return <ShipWheel pos={pos} color={color} size={size} />
    case 'treasure-map':
      return <TreasureMap pos={pos} color={color} size={size} />
    case 'jolly-roger':
      return <JollyRoger pos={pos} color={color} size={size} />
    case 'anchor-chain':
      return <AnchorChain pos={pos} color={color} size={size} />

    // ─── Vehicles ───
    case 'helicopter':
      return <Helicopter pos={pos} color={color} size={size} />
    case 'bicycle':
      return <Bicycle pos={pos} color={color} size={size} />
    case 'scooter':
      return <Scooter pos={pos} color={color} size={size} />
    case 'hot-rod':
      return <HotRod pos={pos} color={color} size={size} />
    case 'jeep':
      return <Jeep pos={pos} color={color} size={size} />

    // ─── Beach ───
    case 'sandcastle':
      return <Sandcastle pos={pos} color={color} size={size} />
    case 'beach-umbrella':
      return <BeachUmbrella pos={pos} color={color} size={size} />
    case 'lifeguard-tower':
      return <LifeguardTower pos={pos} color={color} size={size} />
    case 'buoy':
      return <Buoy pos={pos} color={color} size={size} />
    case 'surfboard-rack':
      return <SurfboardRack pos={pos} color={color} size={size} />

    // ─── Ancient ───
    case 'catapult':
      return <Catapult pos={pos} color={color} size={size} />
    case 'broken-column':
      return <BrokenColumn pos={pos} color={color} size={size} />
    case 'altar':
      return <Altar pos={pos} color={color} size={size} />
    case 'sarcophagus':
      return <Sarcophagus pos={pos} color={color} size={size} />
    case 'colosseum-arch':
      return <ColosseumArch pos={pos} color={color} size={size} />

    // ─── Underwater ───
    case 'shipwreck':
      return <Shipwreck pos={pos} color={color} size={size} />
    case 'treasure-chest-open':
      return <TreasureChestOpen pos={pos} color={color} size={size} />
    case 'anemone':
      return <Anemone pos={pos} color={color} size={size} />
    case 'sea-turtle':
      return <SeaTurtle pos={pos} color={color} size={size} />
    case 'whale':
      return <Whale pos={pos} color={color} size={size} />

    // ─── Fairground ───
    case 'popcorn-stand':
      return <PopcornStand pos={pos} color={color} size={size} />
    case 'bumper-car':
      return <BumperCar pos={pos} color={color} size={size} />
    case 'ticket-booth':
      return <TicketBooth pos={pos} color={color} size={size} />
    case 'balloon-arch':
      return <BalloonArch pos={pos} color={color} size={size} />
    case 'prize-wheel':
      return <PrizeWheel pos={pos} color={color} size={size} />

    default:
      return null
  }
}

function Torch({ pos }: { pos: [number, number, number] }) {
  const flame = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 6
    if (flame.current) {
      flame.current.scale.y = 1 + Math.sin(phase.current) * 0.2
    }
  })
  return (
    <group position={pos}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.9} />
      </mesh>
      <group ref={flame} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshStandardMaterial
            color="#ff9454"
            emissive="#ff5464"
            emissiveIntensity={1.6}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
      <pointLight color="#ff9454" intensity={1.3} distance={8} decay={2} position={[0, 1, 0]} />
    </group>
  )
}

function GraveyardProp({
  file,
  pos,
  scale = 1,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const gltf = useGLTF(`${PUBLIC_BASE}/models/kenney-graveyard/${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function PlatformerProp({
  file,
  pos,
  scale = 1.5,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const base = `${PUBLIC_BASE}/models/kenney-platformer/Models/GLB%20format/`
  const gltf = useGLTF(`${base}${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/pumpkin-carved.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/coffin.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/kenney-graveyard/candle.glb`)

// Platformer pack — preload most-used items
const PLT_BASE = `${PUBLIC_BASE}/models/kenney-platformer/Models/GLB%20format/`
useGLTF.preload(`${PLT_BASE}chest.glb`)
useGLTF.preload(`${PLT_BASE}star.glb`)
useGLTF.preload(`${PLT_BASE}coin-gold.glb`)
useGLTF.preload(`${PLT_BASE}tree-pine.glb`)

// ─── Процедурные механики ─────────────────────────────────────────

function SpeedPad({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        <mesh receiveShadow>
          <boxGeometry args={[size * 2, size * 0.15, size * 2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Arrow chevrons */}
        {[-0.5, 0, 0.5].map((z) => (
          <mesh key={z} position={[0, size * 0.1, z * size * 0.5]} rotation={[0, 0, 0]}>
            <coneGeometry args={[size * 0.25, size * 0.3, 3]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <pointLight color={color} intensity={0.8} distance={4} decay={2} position={[0, 0.5, 0]} />
      </group>
    </RigidBody>
  )
}

function Portal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ring = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (ring.current) ring.current.rotation.z += dt * 1.2
  })
  return (
    <group position={pos}>
      <group ref={ring}>
        <mesh>
          <torusGeometry args={[size * 0.9, size * 0.12, 12, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.1} />
        </mesh>
      </group>
      {/* Inner glow disc */}
      <mesh>
        <circleGeometry args={[size * 0.78, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={6} decay={2} />
    </group>
  )
}

function Crystal({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const group = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.6
  })
  const offsets: [number, number, number, number, number][] = [
    [0, 0, 0, size, size * 2.2],
    [size * 0.5, 0, size * 0.3, size * 0.6, size * 1.4],
    [-size * 0.5, 0, -size * 0.3, size * 0.55, size * 1.2],
    [size * 0.2, 0, -size * 0.55, size * 0.45, size * 1.0],
  ]
  return (
    <group position={pos} ref={group}>
      {offsets.map(([x, y, z, r, h], i) => (
        <mesh key={i} position={[x, y + h * 0.5, z]} castShadow>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.05} metalness={0.1} transparent opacity={0.85} />
        </mesh>
      ))}
      <pointLight color={color} intensity={1.2} distance={5} decay={2} />
    </group>
  )
}

function Campfire({ pos, size }: { pos: [number, number, number]; size: number }) {
  const flame = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (flame.current) {
      flame.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.12
      flame.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 7) * 0.12
    }
  })
  const logColor = '#5a3a1a'
  return (
    <group position={pos}>
      {/* Logs X-cross */}
      {[0, Math.PI / 2].map((ry, i) => (
        <mesh key={i} rotation={[0, ry, Math.PI / 8]} position={[0, size * 0.1, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 1.2, 8]} />
          <meshStandardMaterial color={logColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Flame */}
      <mesh ref={flame} position={[0, size * 0.6, 0]}>
        <coneGeometry args={[size * 0.3, size * 0.9, 8]} />
        <meshStandardMaterial color="#FF9454" emissive="#FF5400" emissiveIntensity={1.5} transparent opacity={0.85} roughness={0} />
      </mesh>
      <pointLight color="#FF9454" intensity={2} distance={6} decay={2} position={[0, size * 0.8, 0]} />
    </group>
  )
}

function Sign({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Post */}
        <mesh position={[0, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size, 8]} />
          <meshStandardMaterial color="#7a5a2a" roughness={0.9} />
        </mesh>
        {/* Board */}
        <mesh position={[0, size, 0]} castShadow>
          <boxGeometry args={[size * 1.2, size * 0.65, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
    </RigidBody>
  )
}
useGLTF.preload(`${PLT_BASE}barrel.glb`)

// ─── Архитектура ─────────────────────────────────────────────

function Arch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const mat = { color, roughness: 0.7, metalness: 0.05 }
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Left pillar */}
        <mesh position={[-size * 0.85, size * 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.4, size * 1.8, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        {/* Right pillar */}
        <mesh position={[size * 0.85, size * 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.4, size * 1.8, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
        {/* Lintel */}
        <mesh position={[0, size * 1.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 2.1, size * 0.35, size * 0.4]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      </group>
    </RigidBody>
  )
}

function Fence({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = { color, roughness: 0.9 }
  const postH = size * 1.4
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Posts */}
        {[-size * 0.75, size * 0.75].map((x, i) => (
          <mesh key={i} position={[x, postH * 0.5, 0]} castShadow>
            <boxGeometry args={[size * 0.12, postH, size * 0.12]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        {/* Rails */}
        {[0.3, 0.65, 1.0].map((frac, i) => (
          <mesh key={i} position={[0, postH * frac, 0]} castShadow>
            <boxGeometry args={[size * 1.7, size * 0.09, size * 0.09]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

function Bench({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = { color, roughness: 0.85 }
  const legColor = '#5a3a1a'
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <group>
        {/* Seat planks */}
        {[-0.1, 0.1].map((z, i) => (
          <mesh key={i} position={[0, size * 0.55, z * size]} castShadow receiveShadow>
            <boxGeometry args={[size * 1.8, size * 0.1, size * 0.25]} />
            <meshStandardMaterial {...wood} />
          </mesh>
        ))}
        {/* Backrest */}
        <mesh position={[0, size * 0.9, -size * 0.28]} castShadow>
          <boxGeometry args={[size * 1.8, size * 0.28, size * 0.09]} />
          <meshStandardMaterial {...wood} />
        </mesh>
        {/* Legs */}
        {[-size * 0.7, size * 0.7].map((x, i) => (
          <mesh key={i} position={[x, size * 0.25, 0]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.5, size * 0.6]} />
            <meshStandardMaterial color={legColor} roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}

function FlowerPot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Pot body */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.35, size * 0.7, 12]} />
        <meshStandardMaterial color="#c87941" roughness={0.8} />
      </mesh>
      {/* Soil top */}
      <mesh position={[0, size * 0.73, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.08, 12]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.95} />
      </mesh>
      {/* Flowers */}
      {[[0, 0], [0.25, 0.2], [-0.25, -0.15], [0.1, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x * size, size * 0.85, z * size]}>
          <mesh position={[0, size * 0.2, 0]} castShadow>
            <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.4, 6]} />
            <meshStandardMaterial color="#5ba55b" roughness={0.8} />
          </mesh>
          <mesh position={[0, size * 0.45, 0]} castShadow>
            <sphereGeometry args={[size * 0.15, 8, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Halfpipe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const segments = 8
  const radius = size * 0.9
  const width = size * 2
  return (
    <RigidBody type="fixed" colliders="trimesh" position={pos}>
      <group>
        {Array.from({ length: segments }).map((_, i) => {
          const a0 = (Math.PI / segments) * i
          const a1 = (Math.PI / segments) * (i + 1)
          const aMid = (a0 + a1) / 2
          const y = -Math.cos(aMid) * radius + radius
          const x = Math.sin(aMid) * radius - radius
          const rot = aMid - Math.PI / 2
          return (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rot]} receiveShadow castShadow>
              <boxGeometry args={[radius * (2 * Math.PI / segments / 2), size * 0.12, width]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
          )
        })}
      </group>
    </RigidBody>
  )
}

// ─── Особые ──────────────────────────────────────────────────

function Windmill({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const blades = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z += dt * 0.8
  })
  return (
    <group position={pos}>
      <mesh position={[0, size, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.32, size * 2, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 2.1, size * 0.1]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={blades} position={[0, size * 2.1, size * 0.15]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, size * 0.65, 0]} rotation={[0, 0, (Math.PI / 2) * i]} castShadow>
            <boxGeometry args={[size * 0.14, size * 1.3, size * 0.06]} />
            <meshStandardMaterial color="#fff" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Snowman({ pos, size }: { pos: [number, number, number]; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.55, 14, 10]} />
        <meshStandardMaterial color="#f4f8ff" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 14, 10]} />
        <meshStandardMaterial color="#f4f8ff" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.38, size * 1.38, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[size * 0.06, size * 0.25, 6]} />
        <meshStandardMaterial color="#ff7700" roughness={0.5} />
      </mesh>
      {[[-0.13, 0.12], [0.13, 0.12]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 1.48, z * size]} castShadow>
          <sphereGeometry args={[size * 0.05, 6, 4]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <torusGeometry args={[size * 0.4, size * 0.07, 8, 24]} />
        <meshStandardMaterial color="#e53" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.36, size * 0.36, 12]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 1.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.07, 12]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
    </group>
  )
}

function SatelliteDish({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.1, size * 0.2]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.3, size * 0.42]} rotation={[-Math.PI / 3, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.65, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, size * 1.5, size * 0.72]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 4]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ─── Food ────────────────────────────────────────────────
function Cake({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CANDLE_COLORS = ['#ff5464', '#FFD43C', '#9FE8C7']
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.7, size * 0.7, size * 0.55, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.6, 0]}>
        <torusGeometry args={[size * 0.7, size * 0.08, 8, 20]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.52, size * 0.52, size * 0.42, 18]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]}>
        <torusGeometry args={[size * 0.52, size * 0.07, 8, 18]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.3, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {CANDLE_COLORS.map((cc, i) => {
        const angle = (i / CANDLE_COLORS.length) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(angle) * size * 0.18, size * 1.55, Math.sin(angle) * size * 0.18]}>
            <mesh>
              <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.22, 6]} />
              <meshStandardMaterial color={cc} roughness={0.7} />
            </mesh>
            <mesh position={[0, size * 0.18, 0]}>
              <coneGeometry args={[size * 0.04, size * 0.1, 6]} />
              <meshStandardMaterial color="#FF9454" emissive="#FF9454" emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Donut({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={[pos[0], pos[1] + size * 0.28, pos[2]]} rotation={[Math.PI * 0.08, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[size * 0.42, size * 0.22, 14, 28]} />
        <meshStandardMaterial color="#C99E00" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.08, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[size * 0.42, size * 0.24, 14, 28, Math.PI * 1.7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

function IceCream({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const scoop2Color = color === '#9FE8C7' ? '#FFB4C8' : '#9FE8C7'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <coneGeometry args={[size * 0.35, size * 0.8, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.8} />
      </mesh>
      {[-0.15, 0, 0.15].map((y, i) => (
        <mesh key={i} position={[0, size * (0.2 + (y + 0.15) * 2.5), 0]}>
          <torusGeometry args={[size * (0.18 - i * 0.04), size * 0.012, 4, 14]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.26, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 14, 10]} />
        <meshStandardMaterial color={scoop2Color} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Sci-fi ──────────────────────────────────────────────
function Rocket({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const FIN_ANGLES = [0, Math.PI * 2 / 3, Math.PI * 4 / 3]
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.25, size * 1.2, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.7, 0]} castShadow>
        <coneGeometry args={[size * 0.25, size * 0.6, 12]} />
        <meshStandardMaterial color="#ff5464" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.0, size * 0.26]}>
        <sphereGeometry args={[size * 0.1, 10, 8]} />
        <meshStandardMaterial color="#A9D8FF" roughness={0.1} metalness={0.8} />
      </mesh>
      {FIN_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * size * 0.35, size * 0.3, Math.cos(a) * size * 0.35]} rotation={[0, a, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.5, size * 0.35]} />
          <meshStandardMaterial color="#ff5464" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.3, size * 0.32, 10]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Robot({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const LEG_X = [-0.22, 0.22]
  const ARM_X = [-0.55, 0.55]
  const EYE_X = [-0.14, 0.14]
  const CHEST_X = [-0.1, 0, 0.1]
  const CHEST_COLORS = ['#ff5464', '#FFD43C', '#9FE8C7']
  return (
    <group position={pos}>
      {LEG_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.18, 0]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.36, size * 0.22]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.54, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.62, size * 0.23]}>
        <boxGeometry args={[size * 0.36, size * 0.28, size * 0.04]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      {CHEST_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.62, size * 0.26]}>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color={CHEST_COLORS[i]} emissive={CHEST_COLORS[i]} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {ARM_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.6, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.46, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.95, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.12, 8]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.17, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.4, size * 0.42]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>
      {EYE_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 1.2, size * 0.22]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.04]} />
          <meshStandardMaterial color="#A9D8FF" emissive="#A9D8FF" emissiveIntensity={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.46, 0]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.22, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.58, 0]}>
        <sphereGeometry args={[size * 0.07, 8, 6]} />
        <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function UFO({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  const LIGHT_COLORS = ['#FFD43C', '#ff5464', '#9FE8C7', '#A9D8FF', '#FF9454']
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.8 })
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.8, size * 0.5, size * 0.2, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.8, size * 0.12, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#A9D8FF" roughness={0.1} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, size * 0.45, 0]}>
        <sphereGeometry args={[size * 0.16, 10, 8]} />
        <meshStandardMaterial color="#9FE8C7" roughness={0.5} />
      </mesh>
      <group ref={ref} position={[0, size * 0.14, 0]}>
        {LIGHT_COLORS.map((lc, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI * 0.4) * size * 0.62, 0, Math.sin(i * Math.PI * 0.4) * size * 0.62]}>
            <sphereGeometry args={[size * 0.07, 6, 4]} />
            <meshStandardMaterial color={lc} emissive={lc} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── Fantasy ─────────────────────────────────────────────
function CastleTower({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const MERLON_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
  const WINDOW_Y = [size * 0.9, size * 1.4, size * 1.9]
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.44, size * 0.48, size * 2.2, 14]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.45, size * 0.45]}>
        <boxGeometry args={[size * 0.32, size * 0.55, size * 0.08]} />
        <meshStandardMaterial color="#2a3340" roughness={0.8} />
      </mesh>
      {WINDOW_Y.map((y, j) => (
        <mesh key={j} position={[0, y, size * 0.45]}>
          <boxGeometry args={[size * 0.14, size * 0.22, size * 0.06]} />
          <meshStandardMaterial color="#2a3340" roughness={0.8} />
        </mesh>
      ))}
      {MERLON_ANGLES.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.38, size * 2.38, Math.sin(a) * size * 0.38]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.26, size * 0.18]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 2.6, 0]} castShadow>
        <coneGeometry args={[size * 0.54, size * 0.7, 14]} />
        <meshStandardMaterial color="#ff5464" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 3.05, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 6]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.12, size * 3.18, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.16, size * 0.02]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
    </group>
  )
}

function MagicOrb({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const orbRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (orbRef.current) orbRef.current.rotation.y += dt * 0.5
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.9
  })
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.24, 10]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.28, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.28, size * 0.08, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={orbRef} position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.1} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, size * 0.65, 0]}>
        <sphereGeometry args={[size * 0.24, 14, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      <group ref={ringRef} position={[0, size * 0.65, 0]}>
        <mesh rotation={[Math.PI * 0.3, 0, 0]}>
          <torusGeometry args={[size * 0.48, size * 0.04, 8, 22]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Throne({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CROWN_X = [-0.32, -0.16, 0, 0.16, 0.32]
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.12, size * 0.9]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <boxGeometry args={[size * 0.88, size * 0.1, size * 0.72]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[-size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[size * 0.46, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.22, size * 0.66]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.8, -size * 0.34]} castShadow>
        <boxGeometry args={[size * 0.88, size * 1.1, size * 0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {CROWN_X.map((x, i) => (
        <mesh key={i} position={[size * x, size * 1.42, -size * 0.34]} castShadow>
          <coneGeometry args={[size * 0.06, size * (i % 2 === 0 ? 0.22 : 0.16), 6]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.7, -size * 0.34]}>
        <sphereGeometry args={[size * 0.07, 8, 6]} />
        <meshStandardMaterial color="#ff5464" emissive="#ff5464" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Guitar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.15]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.4, size * 0.18, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.14, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Sound hole */}
      <mesh position={[0, size * 0.06, size * 0.12]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 1.1, size * 0.08]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 1.34, 0]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.22, size * 0.07]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.6} />
      </mesh>
      {/* Strings */}
      {[-0.03, -0.01, 0.01, 0.03].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.05]}>
          <cylinderGeometry args={[size * 0.003, size * 0.003, size * 1.3, 4]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Piano({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const WHITE_KEYS = 7
  const BLACK_KEYS = [1, 2, 4, 5, 6]
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.5, size * 0.7, size * 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Legs */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.2, size * 0.1]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
      ))}
      {/* White keys */}
      {Array.from({ length: WHITE_KEYS }, (_, i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19, size * 0.73, size * 0.22]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.06, size * 0.28]} />
          <meshStandardMaterial color="#f0ede0" roughness={0.3} />
        </mesh>
      ))}
      {/* Black keys */}
      {BLACK_KEYS.map((i) => (
        <mesh key={i} position={[(i - 3) * size * 0.19 - size * 0.095, size * 0.78, size * 0.12]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
        </mesh>
      ))}
      {/* Lid */}
      <mesh position={[0, size * 0.77, -size * 0.08]} rotation={[-Math.PI * 0.15, 0, 0]} castShadow>
        <boxGeometry args={[size * 1.5, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

function DrumKit({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Bass drum (large, on ground) */}
      <mesh position={[0, size * 0.22, 0]} castShadow receiveShadow rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.28, 20]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.22, size * 0.15]}>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.02, 20]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Snare drum */}
      <mesh position={[-size * 0.5, size * 0.5, size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.12, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-size * 0.5, size * 0.56, size * 0.1]}>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.01, 16]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Hi-hat cymbal */}
      <mesh position={[size * 0.5, size * 0.7, -size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.02, 20]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Cymbal stand */}
      <mesh position={[size * 0.5, size * 0.38, -size * 0.1]}>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.72, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Tom-tom */}
      <mesh position={[size * 0.15, size * 0.68, size * 0.05]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.12, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.15, size * 0.74, size * 0.05]}>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.01, 14]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
      </mesh>
      {/* Drumsticks */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, -size * 0.28]} rotation={[-Math.PI * 0.4, 0, x * 5]}>
          <cylinderGeometry args={[size * 0.018, size * 0.01, size * 0.6, 6]} />
          <meshStandardMaterial color="#d4a574" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function SoccerBall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 24, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Pentagon patches */}
      {[
        [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size * 0.33, y * size * 0.33 + size * 0.38, z * size * 0.33]}>
          <dodecahedronGeometry args={[size * 0.1, 0]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Trophy({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.12, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.14, size * 0.22, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup body */}
      <mesh position={[0, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.2, size * 0.54, 18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cup rim */}
      <mesh position={[0, size * 0.86, 0]} castShadow>
        <torusGeometry args={[size * 0.32, size * 0.04, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Handles */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.42, size * 0.58, 0]} castShadow>
          <torusGeometry args={[size * 0.12, size * 0.03, 8, 12, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Star on top */}
      <mesh position={[0, size * 0.96, 0]}>
        <sphereGeometry args={[size * 0.1, 10, 8]} />
        <meshStandardMaterial color="#fff" emissive="#ffe066" emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
    </group>
  )
}

function GoalNet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.6, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.22, 0]} rotation={[0, 0, Math.PI * 0.5]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Back bar */}
      <mesh position={[0, size * 0.6, -size * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, size * 1.22, -size * 0.5]} rotation={[0, 0, Math.PI * 0.5]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Net planes */}
      <mesh position={[0, size * 0.61, -size * 0.25]} receiveShadow>
        <boxGeometry args={[size * 1.16, size * 1.16, size * 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.18} side={2} />
      </mesh>
    </group>
  )
}

function Duck({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[size * 0.2, size * 0.58, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Beak */}
      <mesh position={[size * 0.38, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.06, size * 0.08]} />
        <meshStandardMaterial color="#FF8C1A" roughness={0.6} />
      </mesh>
      {/* Eye */}
      <mesh position={[size * 0.35, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.028, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      {/* Tail */}
      <mesh position={[-size * 0.28, size * 0.38, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
        <coneGeometry args={[size * 0.1, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Feet */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[size * 0.04, size * 0.04, side * size * 0.12]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.04, size * 0.1]} />
          <meshStandardMaterial color="#FF8C1A" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function CatStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.66, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.22, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.14, size * 1.04, 0]} castShadow>
          <coneGeometry args={[size * 0.07, size * 0.13, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.08, size * 0.84, size * 0.18]}>
          <sphereGeometry args={[size * 0.04, 8, 6]} />
          <meshStandardMaterial color="#1a6a1a" roughness={0.1} emissive="#00aa00" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Raised paw */}
      <mesh position={[size * 0.2, size * 0.6, 0]} rotation={[0, 0, Math.PI * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.28, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, size * 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.32, size * 0.06, 20]} />
        <meshStandardMaterial color="#c0a060" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}

function FishTank({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Stand */}
      <mesh position={[0, size * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.9, size * 0.18, size * 0.5]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.7} />
      </mesh>
      {/* Tank glass */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.6, size * 0.44]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.35} side={2} />
      </mesh>
      {/* Water */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.5, size * 0.4]} />
        <meshStandardMaterial color="#4c97ff" roughness={0.1} transparent opacity={0.4} />
      </mesh>
      {/* Fish 1 */}
      <mesh position={[-size * 0.12, size * 0.52, 0]}>
        <sphereGeometry args={[size * 0.07, 10, 8]} />
        <meshStandardMaterial color="#ff5464" roughness={0.4} />
      </mesh>
      {/* Fish 2 */}
      <mesh position={[size * 0.14, size * 0.62, size * 0.06]}>
        <sphereGeometry args={[size * 0.055, 10, 8]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} />
      </mesh>
      {/* Gravel */}
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.78, size * 0.08, size * 0.4]} />
        <meshStandardMaterial color="#c8b89a" roughness={1} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 0.84, size * 0.04, size * 0.46]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function Table({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Top */}
      <mesh position={[0, size * 0.76, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.6, -0.32], [-0.6, 0.32], [0.6, -0.32], [0.6, 0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.38, z * size]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.76, size * 0.08]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Cross supports */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 1.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Bookshelf({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const BOOK_COLORS = ['#ff5464', '#6B5CE7', '#48c774', '#FFD43C', '#4c97ff', '#FF9454']
  return (
    <group position={pos}>
      {/* Frame */}
      <mesh position={[-size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.48, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 1.6, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.58, 0]} castShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.96, size * 0.06, size * 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Shelves */}
      {[0.54, 1.06].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]}>
          <boxGeometry args={[size * 0.94, size * 0.05, size * 0.38]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Books on shelves */}
      {[0.2, 0.72, 1.24].map((shelfY, si) =>
        BOOK_COLORS.slice(0, 5).map((c, bi) => (
          <mesh key={`${si}-${bi}`} position={[(bi - 2) * size * 0.17, shelfY * size, 0]} castShadow>
            <boxGeometry args={[size * 0.12, size * 0.24, size * 0.32]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  )
}

function FloorLamp({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.1, 16]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.4, 8]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Arm */}
      <mesh position={[size * 0.12, size * 1.44, 0]} rotation={[0, 0, -Math.PI * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.28, 6]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Shade */}
      <mesh position={[size * 0.18, size * 1.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.14, size * 0.28, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} side={2} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[size * 0.18, size * 1.34, 0]}>
        <sphereGeometry args={[size * 0.06, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Airplane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.12, size * 1.6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <coneGeometry args={[size * 0.12, size * 0.3, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Main wings */}
      <mesh position={[size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.06, size * 0.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, size * 0.3, -size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.4, size * 0.28]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh position={[size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[-size * 0.2, -size * 0.5, -size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.18]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Windows strip */}
      <mesh position={[size * 0.14, size * 0.3, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.6, size * 0.08]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} metalness={0.1} emissive="#88d4ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function Boat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.35, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Hull bottom taper (dark) */}
      <mesh position={[0, -size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.25, size * 1.3]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, size * 0.4, size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.4, size * 0.6]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.4} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, size * 0.9, size * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 1.2, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Sail */}
      <mesh position={[size * 0.15, size * 1.15, size * 0.15]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.7, size * 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} side={2} />
      </mesh>
      {/* Porthole windows */}
      <mesh position={[size * 0.36, size * 0.4, size * 0.2]}>
        <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.04, 12]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.1} emissive="#88d4ff" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

function Train({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main body */}
      <mesh position={[0, size * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 1.4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[0, size * 0.72, size * 0.35]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.18, size * 0.55]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      {/* Boiler */}
      <mesh position={[0, size * 0.4, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Smokestack */}
      <mesh position={[0, size * 0.84, -size * 0.42]} castShadow>
        <cylinderGeometry args={[size * 0.09, size * 0.07, size * 0.25, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[0, size * 0.15, -size * 0.76]} castShadow>
        <boxGeometry args={[size * 0.72, size * 0.1, size * 0.08]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Wheels (4) */}
      {([-size * 0.35, size * 0.35] as number[]).flatMap((xOff, xi) =>
        ([-size * 0.38, size * 0.38] as number[]).map((zOff, zi) => (
          <mesh key={`w${xi}${zi}`} position={[xOff, size * 0.07, zOff]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 14]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* Headlamp */}
      <mesh position={[0, size * 0.5, -size * 0.72]}>
        <sphereGeometry args={[size * 0.08, 8, 6]} />
        <meshStandardMaterial color="#fffde0" emissive="#ffe066" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>
    </group>
  )
}

function Swing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Left post */}
      <mesh position={[-size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Right post */}
      <mesh position={[size * 0.55, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.8, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, size * 1.82, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Chains left */}
      <mesh position={[-size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Chains right */}
      <mesh position={[size * 0.2, size * 1.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.06, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Slide({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Platform */}
      <mesh position={[0, size * 1.1, -size * 0.35]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.7]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.5} />
      </mesh>
      {/* Left support post */}
      <mesh position={[-size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Right support post */}
      <mesh position={[size * 0.3, size * 0.55, -size * 0.35]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.1, 8]} />
        <meshStandardMaterial color="#6B5CE7" roughness={0.5} />
      </mesh>
      {/* Ladder rungs */}
      {[0.2, 0.5, 0.8].map((h) => (
        <mesh key={h} position={[0, size * h, -size * 0.35]} castShadow>
          <boxGeometry args={[size * 0.6, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color="#FFD43C" roughness={0.5} />
        </mesh>
      ))}
      {/* Slide surface */}
      <mesh position={[0, size * 0.55, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Side rails */}
      <mesh position={[-size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[size * 0.29, size * 0.56, size * 0.28]} rotation={[-Math.PI * 0.28, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.12, size * 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

function Seesaw({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base triangle */}
      <mesh position={[0, size * 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.18, size * 0.28, 4]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Pivot pin */}
      <mesh position={[0, size * 0.32, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Board (slightly tilted) */}
      <mesh position={[0, size * 0.42, 0]} rotation={[0, 0, Math.PI * 0.06]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.07, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Left handle */}
      <mesh position={[-size * 0.68, size * 0.58, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right handle */}
      <mesh position={[size * 0.68, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.28, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Left seat */}
      <mesh position={[-size * 0.68, size * 0.48, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#ff5464" roughness={0.5} />
      </mesh>
      {/* Right seat */}
      <mesh position={[size * 0.68, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#48c774" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Planet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.4 })
  return (
    <group ref={ref} position={pos}>
      {/* Main sphere */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.55, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Ring 1 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.78, size * 0.06, 6, 32]} />
        <meshStandardMaterial color="#c0a060" roughness={0.8} transparent opacity={0.75} />
      </mesh>
      {/* Ring 2 */}
      <mesh rotation={[Math.PI * 0.28, 0, 0]}>
        <torusGeometry args={[size * 0.95, size * 0.04, 6, 32]} />
        <meshStandardMaterial color="#a08848" roughness={0.8} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

function Asteroid({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main irregular chunk */}
      <mesh castShadow rotation={[0.4, 0.7, 0.2]}>
        <dodecahedronGeometry args={[size * 0.45, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 1 */}
      <mesh position={[size * 0.3, size * 0.2, 0]} castShadow rotation={[1, 0.5, 0]}>
        <dodecahedronGeometry args={[size * 0.18, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Small chunk 2 */}
      <mesh position={[-size * 0.25, -size * 0.15, size * 0.1]} castShadow rotation={[0.2, 1.2, 0.8]}>
        <dodecahedronGeometry args={[size * 0.12, 0]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  )
}

function SpaceStation({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.3 })
  return (
    <group ref={ref} position={pos}>
      {/* Central hub */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Horizontal arm */}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 1.4, 8]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Solar panel left */}
      <mesh position={[-size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Solar panel right */}
      <mesh position={[size * 0.58, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.32]} />
        <meshStandardMaterial color="#1a3a8a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Top module */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.18, size * 0.24]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function BookStack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const COLORS = [color, '#FF5464', '#4c97ff', '#48c774']
  const heights = [size * 0.14, size * 0.12, size * 0.16, size * 0.11]
  let y = 0
  return (
    <group position={pos}>
      {heights.map((h, i) => {
        const cy = y + h / 2
        y += h
        const tilt = (i % 2 === 0) ? 0 : Math.PI * 0.04
        return (
          <mesh key={i} position={[0, cy, 0]} rotation={[0, tilt, 0]} castShadow>
            <boxGeometry args={[size * 0.7, h, size * 0.5]} />
            <meshStandardMaterial color={COLORS[i]} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

function Globe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.5 })
  return (
    <group position={pos}>
      {/* Stand base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.3, size * 0.08, 12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.44, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
      </mesh>
      {/* Sphere globe */}
      <group ref={ref} position={[0, size * 0.56, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.3, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        {/* Equator ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.32, size * 0.018, 6, 24]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function Microscope({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.08, size * 0.38]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Arm / column */}
      <mesh position={[-size * 0.1, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Horizontal arm */}
      <mesh position={[-size * 0.1, size * 0.78, -size * 0.08]} castShadow rotation={[Math.PI / 2.5, 0, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.3, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[-size * 0.1, size * 0.9, -size * 0.04]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.07, size * 0.16, 10]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Stage / slide platform */}
      <mesh position={[-size * 0.1, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.22]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Sword({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0, Math.PI * 0.12]}>
      {/* Blade */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.9, size * 0.04]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Blade tip (cone) */}
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <coneGeometry args={[size * 0.04, size * 0.14, 4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Guard (crossguard) */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.07, size * 0.07]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Grip */}
      <mesh position={[0, -size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.38, 8]} />
        <meshStandardMaterial color="#5a3010" roughness={0.7} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -size * 0.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.08, 10, 10]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

function Shield({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0.2, 0.3, 0]}>
      {/* Shield body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.65, size * 0.8, size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Emblem cross horizontal */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Emblem cross vertical */}
      <mesh position={[0, 0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.55, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Metal rim */}
      <mesh position={[0, 0, -size * 0.04]}>
        <boxGeometry args={[size * 0.7, size * 0.85, size * 0.04]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} wireframe />
      </mesh>
    </group>
  )
}

function KnightStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Plinth */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.1, size * 0.55]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[size * 0.1, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.38, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Torso / armour */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.4, size * 0.22]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Helmet head */}
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Visor slit */}
      <mesh position={[0, size * 0.9, size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Sword arm */}
      <mesh position={[size * 0.28, size * 0.66, 0]} castShadow rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.3, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Coral({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Main branches */}
      {[[-0.1, 0.35, 0.08, -0.2], [0.12, 0.42, -0.06, 0.25], [0, 0.48, 0, 0]].map(([x, y, z, rot], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} rotation={[0, 0, rot]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.07, size * (0.4 + i * 0.05), 6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {/* Tips */}
      {[[-0.1, 0.6, 0.08], [0.12, 0.7, -0.06], [0, 0.75, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

function Submarine({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, Math.PI * 0.15, 0]}>
      {/* Main hull */}
      <mesh castShadow>
        <capsuleGeometry args={[size * 0.18, size * 0.7, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Conning tower */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.22, size * 0.14]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Periscope */}
      <mesh position={[size * 0.04, size * 0.44, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.2, 6]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Propeller */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-size * 0.38, size * 0.04, side * size * 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.02, size * 0.04, 3]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Anchor({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Ring at top */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.025, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Shank (vertical bar) */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.68, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Stock (horizontal bar near top) */}
      <mesh position={[0, size * 0.52, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.38, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Left fluke */}
      <mesh position={[-size * 0.22, size * 0.04, 0]} castShadow rotation={[0, 0, Math.PI * 0.3]}>
        <coneGeometry args={[size * 0.08, size * 0.25, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Right fluke */}
      <mesh position={[size * 0.22, size * 0.04, 0]} castShadow rotation={[0, 0, -Math.PI * 0.3]}>
        <coneGeometry args={[size * 0.08, size * 0.25, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

function Igloo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Snow base ring */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.52, size * 0.52, size * 0.06, 16]} />
        <meshStandardMaterial color="#e0f0ff" roughness={0.9} />
      </mesh>
      {/* Main dome */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.48, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Entrance tunnel */}
      <mesh position={[size * 0.44, size * 0.12, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Entrance opening (dark) */}
      <mesh position={[size * 0.56, size * 0.12, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.04, 8]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Sled({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[0, 0.3, 0]}>
      {/* Seat board */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.07, size * 0.34]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Back rail */}
      <mesh position={[0, size * 0.38, -size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.26, size * 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Left runner */}
      <mesh position={[-size * 0.28, size * 0.07, 0]} castShadow rotation={[0, 0, 0.12]}>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.72]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Right runner */}
      <mesh position={[size * 0.28, size * 0.07, 0]} castShadow rotation={[0, 0, -0.12]}>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.72]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Cross struts */}
      {[-0.18, 0.18].map((z, i) => (
        <mesh key={i} position={[0, size * 0.14, size * z]} castShadow>
          <boxGeometry args={[size * 0.62, size * 0.05, size * 0.05]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function SnowflakeDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.6 })
  return (
    <group ref={ref} position={pos}>
      {/* 3 arms crossing at center (6-fold symmetry = 3 pairs) */}
      {[0, 60, 120].map((deg) => (
        <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]} castShadow>
          <boxGeometry args={[size * 1.1, size * 0.08, size * 0.06]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* 6 branch tips per arm = 12 small branches */}
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return [0.28, -0.28].map((side) => (
          <mesh
            key={`${deg}-${side}`}
            position={[Math.cos(rad) * size * 0.32, Math.sin(rad) * size * 0.32, 0]}
            rotation={[0, 0, rad + Math.PI / 4 * Math.sign(side)]}
            castShadow
          >
            <boxGeometry args={[size * 0.22, size * 0.05, size * 0.04]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
          </mesh>
        ))
      })}
      {/* Center gem */}
      <mesh castShadow>
        <octahedronGeometry args={[size * 0.1]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function CircusTent({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const STRIPE = '#ffffff'
  return (
    <group position={pos}>
      {/* Ground ring */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.62, size * 0.65, size * 0.06, 12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Main cone body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <coneGeometry args={[size * 0.62, size * 0.7, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Stripe panels (3 alternating) */}
      {[0, 2, 4].map((i) => (
        <mesh key={i} position={[0, size * 0.38, 0]} rotation={[0, (i * Math.PI) / 3, 0]} castShadow>
          <coneGeometry args={[size * 0.63, size * 0.71, 3]} />
          <meshStandardMaterial color={STRIPE} roughness={0.6} transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Top spire */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <coneGeometry args={[size * 0.07, size * 0.28, 8]} />
        <meshStandardMaterial color="#ffd644" roughness={0.4} />
      </mesh>
      {/* Flag */}
      <mesh position={[0, size * 1.0, size * 0.06]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.09, size * 0.01]} />
        <meshStandardMaterial color="#ff5464" roughness={0.5} />
      </mesh>
    </group>
  )
}

function FerrisWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.35 })
  return (
    <group position={pos}>
      {/* Support legs */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.25, size * 0.36, 0]} rotation={[0, 0, side * 0.35]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.74, 6]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* Axle */}
      <mesh position={[0, size * 0.72, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.14, 8]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Rotating wheel */}
      <group ref={ref} position={[0, size * 0.72, 0]}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[size * 0.48, size * 0.04, 8, 24]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Inner ring */}
        <mesh>
          <torusGeometry args={[size * 0.18, size * 0.03, 6, 20]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Spokes (6) */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]} castShadow>
            <boxGeometry args={[size * 0.96, size * 0.03, size * 0.03]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        ))}
        {/* 6 gondola cars */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180
          return (
            <mesh key={deg} position={[Math.cos(rad) * size * 0.48, Math.sin(rad) * size * 0.48, 0]} castShadow>
              <boxGeometry args={[size * 0.1, size * 0.1, size * 0.08]} />
              <meshStandardMaterial color="#FFD43C" roughness={0.5} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function HotAirBalloon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.7) * size * 0.08 })
  return (
    <group ref={ref} position={pos}>
      {/* Balloon envelope */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.48, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Vertical color stripes */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <mesh key={deg} position={[0, size * 0.55, 0]} rotation={[0, (deg * Math.PI) / 180, 0]} castShadow>
          <sphereGeometry args={[size * 0.49, 3, 16, 0, 0.628, 0, Math.PI]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Ropes */}
      {[[-0.14, 0.14], [0.14, 0.14], [-0.14, -0.14], [0.14, -0.14]].map(([rx, rz], i) => (
        <mesh key={i} position={[size * rx, size * 0.16, size * rz]} castShadow>
          <cylinderGeometry args={[size * 0.008, size * 0.008, size * 0.42, 4]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
        </mesh>
      ))}
      {/* Basket */}
      <mesh position={[0, size * -0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.16, size * 0.28]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Pinwheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 2.5 })
  return (
    <group position={pos}>
      {/* Stick */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Spinning blades */}
      <group ref={ref} position={[0, size * 0.5, 0]}>
        {[0, 90, 180, 270].map((deg, i) => (
          <mesh key={deg} position={[
            Math.cos((deg * Math.PI) / 180) * size * 0.14,
            Math.sin((deg * Math.PI) / 180) * size * 0.14,
            0
          ]} rotation={[0, 0, (deg * Math.PI) / 180 + Math.PI / 4]} castShadow>
            <boxGeometry args={[size * 0.28, size * 0.14, size * 0.03]} />
            <meshStandardMaterial color={i % 2 === 0 ? color : '#ffffff'} roughness={0.5} />
          </mesh>
        ))}
        {/* Center bolt */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.05, 6]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Lantern({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Top cap */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.2, size * 0.08, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* Top hook */}
      <mesh position={[0, size * 0.68, 0]} castShadow>
        <torusGeometry args={[size * 0.05, size * 0.015, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#8b2020" roughness={0.4} />
      </mesh>
      {/* Main lantern body */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.48, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} transparent opacity={0.85} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, size * 0.36, 0]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.46, 8]} />
        <meshStandardMaterial color="#ffeeaa" roughness={1} emissive="#ffeeaa" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      {/* Tassel at bottom */}
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[size * x * 0.06, size * 0.06, 0]} castShadow>
          <cylinderGeometry args={[size * 0.01, size * 0.005, size * 0.14, 4]} />
          <meshStandardMaterial color="#8b2020" roughness={0.6} />
        </mesh>
      ))}
      {/* Bottom cap */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.14, size * 0.07, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Kitchen ─────────────────────────────────────────────
function Burger({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Bottom bun */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8841a" roughness={0.8} />
      </mesh>
      {/* Patty */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.12, 12]} />
        <meshStandardMaterial color="#5a2e00" roughness={0.9} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.43, size * 0.43, size * 0.06, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Top bun */}
      <mesh position={[0, size * 0.46, 0]} castShadow>
        <sphereGeometry args={[size * 0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
        <meshStandardMaterial color="#c8841a" roughness={0.8} />
      </mesh>
      {/* Sesame seeds */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 2) * size * 0.2, size * 0.72, Math.sin(i * Math.PI / 2) * size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color="#f5deb3" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Pizza({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.08, 16]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.9} />
      </mesh>
      {/* Sauce */}
      <mesh position={[0, size * 0.05, 0]}>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.02, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Cheese layer */}
      <mesh position={[0, size * 0.07, 0]}>
        <cylinderGeometry args={[size * 0.44, size * 0.44, size * 0.02, 16]} />
        <meshStandardMaterial color="#ffd700" roughness={0.7} />
      </mesh>
      {/* Toppings */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i / 6 * Math.PI * 2) * size * 0.28, size * 0.1, Math.sin(i / 6 * Math.PI * 2) * size * 0.28]} castShadow>
          <sphereGeometry args={[size * 0.06, 6, 4]} />
          <meshStandardMaterial color="#cc3333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Sushi({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Nori wrapper */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.28, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Rice */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.2, 12]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
      </mesh>
      {/* Fish on top */}
      <mesh position={[0, size * 0.2, 0]} castShadow rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[size * 0.36, size * 0.08, size * 0.22]} />
        <meshStandardMaterial color="#ff8c69" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Plate */}
      <mesh position={[0, -size * 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.34, size * 0.04, 16]} />
        <meshStandardMaterial color="#f0efe8" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Camping ──────────────────────────────────────────────
function Tent({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main tent body (triangular prism approximation) */}
      <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.7, size * 1.0, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} side={2} />
      </mesh>
      {/* Door opening */}
      <mesh position={[0, size * 0.2, size * 0.48]} castShadow>
        <coneGeometry args={[size * 0.25, size * 0.5, 3]} />
        <meshStandardMaterial color="#2a3340" roughness={0.6} />
      </mesh>
      {/* Ground sheet */}
      <mesh position={[0, -size * 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.72, size * 0.72, size * 0.03, 4]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Backpack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.5, size * 0.7, size * 0.25]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Front pocket */}
      <mesh position={[0, -size * 0.1, size * 0.14]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.3, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Top handle */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Straps */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.12, -size * 0.1, -size * 0.14]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.5, 6]} />
          <meshStandardMaterial color="#8b6914" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Compass({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  const phase = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 0.5
    if (ref.current) ref.current.rotation.y = Math.sin(phase.current) * 0.3
  })
  return (
    <group position={pos}>
      {/* Outer ring */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.38, size * 0.06, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.32, size * 0.08, 24]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.6} />
      </mesh>
      {/* Needle */}
      <group ref={ref}>
        <mesh position={[0, size * 0.05, size * 0.14]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.28, 4]} />
          <meshStandardMaterial color="#e53" roughness={0.4} />
        </mesh>
        <mesh position={[0, size * 0.05, -size * 0.14]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.28, 4]} />
          <meshStandardMaterial color="#ccc" roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Halloween ────────────────────────────────────────────
function WitchHat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.2
    if (bob.current) bob.current.position.y = Math.sin(phase.current) * size * 0.06
  })
  return (
    <group ref={bob} position={pos}>
      {/* Brim */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.08, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Band */}
      <mesh position={[0, size * 0.14, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.09, 16]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* Buckle */}
      <mesh position={[size * 0.28, size * 0.14, 0]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.09, size * 0.03]} />
        <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Cone */}
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <coneGeometry args={[size * 0.28, size * 1.0, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function Ghost({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.8
    if (bob.current) {
      bob.current.position.y = pos[1] + size * 0.3 + Math.sin(phase.current) * size * 0.12
      bob.current.rotation.z = Math.sin(phase.current * 0.6) * 0.08
    }
  })
  return (
    <group ref={bob} position={pos}>
      {/* Ghost body */}
      <mesh castShadow>
        <capsuleGeometry args={[size * 0.3, size * 0.4, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.88} />
      </mesh>
      {/* Wavy bottom */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * size * 0.2, -size * 0.36, 0]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.88} />
        </mesh>
      ))}
      {/* Eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.12, size * 0.08, size * 0.28]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 6]} />
          <meshStandardMaterial color="#2a1a3a" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function SpiderWeb({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const rings = [0.15, 0.28, 0.42, 0.55]
  const spokes = 8
  return (
    <group position={pos}>
      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={i} rotation={[0, (i / spokes) * Math.PI * 2, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.008, size * 0.008, size * 1.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      {/* Rings */}
      {rings.map((r, i) => (
        <mesh key={i} castShadow>
          <torusGeometry args={[size * r, size * 0.009, 4, spokes * 2]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
      {/* Small spider in center */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.06, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Toys ─────────────────────────────────────────────────
function TeddyBear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.35, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 0.52, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.2, size * 0.74, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 8, 6]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
      {/* Snout */}
      <mesh position={[0, size * 0.48, size * 0.24]} castShadow>
        <sphereGeometry args={[size * 0.12, 8, 6]} />
        <meshStandardMaterial color="#d4a090" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.1, size * 0.56, size * 0.24]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
      ))}
      {/* Arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.44, size * 0.08, 0]} castShadow rotation={[0, 0, s * 0.6]}>
          <capsuleGeometry args={[size * 0.1, size * 0.24, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function LegoBrick({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const studs = [[-.25, .25], [.25, .25], [-.25, -.25], [.25, -.25], [0, 0]]
  return (
    <group position={pos}>
      {/* Main block */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.7, size * 0.4, size * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Studs on top */}
      {studs.map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.25, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 12]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function YoYo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 8
    if (spin.current) spin.current.rotation.x = phase.current
  })
  return (
    <group position={pos}>
      <group ref={spin}>
        {/* Two discs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, s * size * 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.1, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
          </mesh>
        ))}
        {/* Center axle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.24, 8]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      {/* String */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.01, size * 0.01, size * 0.72, 4]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Lab ──────────────────────────────────────────────────
function Flask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bob = useRef<THREE.Group>(null!)
  const phase = useRef(Math.random() * Math.PI * 2)
  useFrame((_, dt) => {
    phase.current += dt * 1.5
    if (bob.current) bob.current.position.y = pos[1] + Math.sin(phase.current) * size * 0.04
  })
  return (
    <group ref={bob} position={pos}>
      {/* Flask body */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.0} transparent opacity={0.75} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, -size * 0.12, 0]} castShadow>
        <sphereGeometry args={[size * 0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={color} roughness={0.1} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.18, size * 0.28, 10]} />
        <meshStandardMaterial color="#d0e8d0" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* Mouth rim */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.025, 6, 12]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Bubble effect */}
      <mesh position={[size * 0.12, size * 0.06, size * 0.12]} castShadow>
        <sphereGeometry args={[size * 0.06, 6, 4]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.6} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={3} decay={2} />
    </group>
  )
}

function Atom({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.2
  })
  return (
    <group position={pos}>
      {/* Nucleus */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.14, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <group ref={spin}>
        {/* Three orbital rings */}
        {[0, 60, 120].map((deg, i) => (
          <group key={i} rotation={[0, (deg * Math.PI) / 180, (deg * Math.PI) / 180]}>
            <mesh castShadow>
              <torusGeometry args={[size * 0.42, size * 0.025, 6, 32]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Electron */}
            <mesh position={[size * 0.42, 0, 0]} castShadow>
              <sphereGeometry args={[size * 0.07, 8, 6]} />
              <meshStandardMaterial color="#88d4ff" roughness={0.2} emissive="#88d4ff" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      <pointLight color={color} intensity={0.4} distance={3} decay={2} />
    </group>
  )
}

function Gear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const spin = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * 0.8
  })
  return (
    <group ref={spin} position={pos}>
      {/* Main disc */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.14, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Center hole */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.16, 12]} />
        <meshStandardMaterial color="#2a3340" roughness={0.4} />
      </mesh>
      {/* Teeth */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * size * 0.42, 0, Math.sin(angle) * size * 0.42]}
            rotation={[0, angle, 0]}
            castShadow
          >
            <boxGeometry args={[size * 0.12, size * 0.14, size * 0.14]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Weather props ──────────────────────────────────────────────────────────

function RainCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 0.8) * 0.15
  })
  const c = color || '#6b8099'
  return (
    <group ref={ref} position={pos} castShadow>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[size * 0.45, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      <mesh position={[size * 0.4, size * 0.05, 0]}><sphereGeometry args={[size * 0.32, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      <mesh position={[-size * 0.38, 0, 0]}><sphereGeometry args={[size * 0.3, 10, 8]} /><meshStandardMaterial color={c} roughness={1} /></mesh>
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x * size, -size * 0.6 - (i % 2) * size * 0.1, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.01, size * 0.2, 6]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[size * 0.15, -size * 0.55, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[size * 0.07, size * 0.3, size * 0.07]} />
        <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function LightningBolt({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.abs(Math.sin(clock.elapsedTime * 4)) * 1.5
    }
  })
  const c = color || '#FFD43C'
  return (
    <group position={pos} castShadow>
      <mesh rotation={[0, 0, -0.4]} position={[size * 0.1, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.12, size * 0.5, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[0, 0, 0.8]} position={[-size * 0.05, 0, 0]}>
        <boxGeometry args={[size * 0.12, size * 0.35, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={ref} rotation={[0, 0, -0.3]} position={[size * 0.08, -size * 0.38, 0]}>
        <boxGeometry args={[size * 0.1, size * 0.4, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function RainbowArch({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bands = ['#ff5464', '#ff8c1a', '#FFD43C', '#48c774', '#4c97ff', '#c879ff']
  return (
    <group position={pos} castShadow>
      {bands.map((c, i) => {
        const r = size * (0.9 - i * 0.12)
        return (
          <mesh key={i}>
            <torusGeometry args={[r, size * 0.055, 8, 20, Math.PI]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

function Snowdrift({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#daeeff'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[size * 0.55, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[size * 0.5, -size * 0.12, 0]}><sphereGeometry args={[size * 0.35, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[-size * 0.48, -size * 0.1, 0]}><sphereGeometry args={[size * 0.32, 10, 6]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
      <mesh position={[0, -size * 0.35, 0]}><cylinderGeometry args={[size * 0.75, size * 0.85, size * 0.2, 12]} /><meshStandardMaterial color={c} roughness={0.95} /></mesh>
    </group>
  )
}

function SunDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = clock.elapsedTime * 0.3 })
  const c = color || '#FFD43C'
  const rays = 8
  return (
    <group position={pos}>
      <mesh castShadow>
        <sphereGeometry args={[size * 0.38, 14, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i / rays) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.62, Math.sin(angle) * size * 0.62, 0]} rotation={[0, 0, angle]}>
              <boxGeometry args={[size * 0.08, size * 0.28, size * 0.06]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// ── Egypt props ────────────────────────────────────────────────────────────

function Pyramid({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e8c97a'
  return (
    <group position={pos} castShadow>
      <mesh>
        <coneGeometry args={[size * 0.7, size * 1.0, 4]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.55, 0]}>
        <boxGeometry args={[size * 0.1, size * 0.1, size * 0.1]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Sphinx({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8a84e'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.45, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[size * 0.2, -size * 0.15, size * 0.62]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.2, -size * 0.15, size * 0.62]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.45, size * 0.44]}>
        <boxGeometry args={[size * 0.42, size * 0.44, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.62, size * 0.38]}>
        <boxGeometry args={[size * 0.38, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#c8a84e" roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.42, size * 0.65]}>
        <boxGeometry args={[size * 0.28, size * 0.28, size * 0.06]} />
        <meshStandardMaterial color="#d4b87a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Obelisk({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4c060'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.38, size * 0.12, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 0.7, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 1.25, 4]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 1.4, 0]}>
        <coneGeometry args={[size * 0.14, size * 0.22, 4]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ── Candy props ────────────────────────────────────────────────────────────

function Lollipop({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.6 })
  const c = color || '#ff5ab1'
  return (
    <group position={pos}>
      <mesh position={[0, -size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.7, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <group ref={ref} position={[0, size * 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.1, 24]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * size * 0.18, size * 0.06, Math.sin((i / 4) * Math.PI * 2) * size * 0.18]}>
            <boxGeometry args={[size * 0.08, size * 0.12, size * 0.08]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function CandyCane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.85, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.3, 0]}>
        <cylinderGeometry args={[size * 0.085, size * 0.085, size * 0.85, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} wireframe />
      </mesh>
      <mesh position={[size * 0.12, size * 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size * 0.12, size * 0.075, 8, 12, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Gingerbread({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.8, size * 0.55, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.5, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.62, size * 0.4, 4]} />
        <meshStandardMaterial color="#a05010" roughness={0.85} />
      </mesh>
      <mesh position={[0, size * 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[size * 0.63, size * 0.1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, -size * 0.1, size * 0.31]}>
        <boxGeometry args={[size * 0.18, size * 0.3, size * 0.04]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      <mesh position={[-size * 0.24, size * 0.05, size * 0.31]}>
        <boxGeometry args={[size * 0.16, size * 0.16, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} />
      </mesh>
      <mesh position={[size * 0.24, size * 0.05, size * 0.31]}>
        <boxGeometry args={[size * 0.16, size * 0.16, size * 0.04]} />
        <meshStandardMaterial color="#FFD43C" roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── Workshop props ─────────────────────────────────────────────────────────

function Toolbox({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff8c1a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 0.85, size * 0.45, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.26, 0]}>
        <boxGeometry args={[size * 0.85, size * 0.08, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[size * 0.12, size * 0.03, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.2, size * 0.23]}>
        <boxGeometry args={[size * 0.12, size * 0.08, size * 0.04]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

function Anvil({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a3a3a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, -size * 0.25, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, -size * 0.08, 0]}>
        <boxGeometry args={[size * 0.3, size * 0.15, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.1, 0]}>
        <boxGeometry args={[size * 0.7, size * 0.18, size * 0.35]} />
        <meshStandardMaterial color={c} roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh position={[size * 0.42, size * 0.05, 0]}>
        <coneGeometry args={[size * 0.12, size * 0.28, 6]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  )
}

function BarrelFire({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flame = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (flame.current) {
      flame.current.scale.y = 0.85 + Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.3
      flame.current.rotation.y = clock.elapsedTime * 2
    }
  })
  const c = color || '#4a3020'
  return (
    <group position={pos}>
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.28, size * 0.6, 10]} />
        <meshStandardMaterial color={c} roughness={0.8} metalness={0.3} />
      </mesh>
      {[-0.15, 0.15].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]}>
          <torusGeometry args={[size * 0.32, size * 0.03, 6, 14]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.8} />
        </mesh>
      ))}
      <group ref={flame} position={[0, size * 0.42, 0]}>
        <mesh>
          <coneGeometry args={[size * 0.2, size * 0.55, 8]} />
          <meshStandardMaterial color="#ff5464" emissive="#ff2200" emissiveIntensity={1.2} roughness={0.3} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -size * 0.05, 0]}>
          <coneGeometry args={[size * 0.14, size * 0.4, 8]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={1.5} roughness={0.2} transparent opacity={0.9} />
        </mesh>
      </group>
      <pointLight position={[0, size * 0.6, 0]} color="#ff8820" intensity={1.2} distance={size * 4} />
    </group>
  )
}

// ── Art props ──────────────────────────────────────────────────────────────

function Easel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      {[[-0.22, 0.25], [0.22, -0.25], [0, 0]].map(([x, rz], i) => (
        <mesh key={i} position={[(x ?? 0) * size, -size * 0.1, 0]} rotation={[0, 0, (rz ?? 0) * 0.5]}>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.2, 6]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.7, size * 0.55, size * 0.05]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.35, size * 0.5, size * 0.03]}>
        <boxGeometry args={[size * 0.06, size * 0.57, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.35, size * 0.5, size * 0.03]}>
        <boxGeometry args={[size * 0.06, size * 0.57, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.225, size * 0.03]}>
        <boxGeometry args={[size * 0.72, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.775, size * 0.03]}>
        <boxGeometry args={[size * 0.72, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.08, size * 0.55, size * 0.05]}>
        <boxGeometry args={[size * 0.22, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#4c97ff" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.12, size * 0.4, size * 0.05]}>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#48c774" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Sculpture({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.25 })
  const c = color || '#b0b0b0'
  return (
    <group position={pos}>
      <mesh position={[0, -size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.22, size * 0.45]} />
        <meshStandardMaterial color="#d0c8c0" roughness={0.85} />
      </mesh>
      <group ref={ref} position={[0, size * 0.1, 0]}>
        <mesh castShadow>
          <dodecahedronGeometry args={[size * 0.32]} />
          <meshStandardMaterial color={c} roughness={0.35} metalness={0.5} />
        </mesh>
        <mesh position={[0, size * 0.42, 0]} castShadow>
          <sphereGeometry args={[size * 0.18, 10, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[size * 0.28, size * 0.18, 0]} rotation={[0.4, 0, 0.8]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.04, size * 0.45, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function VaseAncient({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos} castShadow>
      <mesh position={[0, -size * 0.55, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 0.1, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, -size * 0.2, 0]}>
        <cylinderGeometry args={[size * 0.35, size * 0.14, size * 0.6, 14]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.25, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.35, size * 0.45, 14]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.55, 0]}>
        <cylinderGeometry args={[size * 0.14, size * 0.2, size * 0.22, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 0.68, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.04, 8, 14]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * size * 0.38, size * 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.14, size * 0.04, 8, 10, Math.PI]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, -size * 0.05, 0]}>
        <torusGeometry args={[size * 0.36, size * 0.025, 8, 18]} />
        <meshStandardMaterial color="#8b4513" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Farm ─────────────────────────────────────────────────────────────────

function Cow({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bodyColor = color || '#f5f5f5'
  const spotColor = '#2a2a2a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.45, size * 0.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
      {/* spot */}
      <mesh position={[size * 0.1, size * 0.28, size * 0.26]} castShadow>
        <sphereGeometry args={[size * 0.13, 8, 8]} />
        <meshStandardMaterial color={spotColor} roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[size * 0.5, size * 0.24, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.3, size * 0.28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
      {/* snout */}
      <mesh position={[size * 0.68, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color="#f0c8b0" roughness={0.9} />
      </mesh>
      {/* ears */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.42, size * 0.36, s * size * 0.16]} castShadow>
          <sphereGeometry args={[size * 0.07, 6, 6]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} />
        </mesh>
      ))}
      {/* horns */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.46, size * 0.42, s * size * 0.1]} rotation={[0, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.025, size * 0.12, 6]} />
          <meshStandardMaterial color="#d4c080" roughness={0.7} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.28, -0.18], [-0.28, 0.18], [0.28, -0.18], [0.28, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, -size * 0.1, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.05, size * 0.3, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.9} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[-size * 0.38, size * 0.18, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.015, size * 0.3, 6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Barn({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wallColor = color || '#c0392b'
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.8, size * 0.9]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* roof ridge (A-frame triangles via boxes) */}
      <mesh position={[0, size * 0.82, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.6, size * 0.92]} />
        <meshStandardMaterial color="#8b2020" roughness={0.8} />
      </mesh>
      {/* door */}
      <mesh position={[0, size * 0.12, size * 0.456]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.44, size * 0.02]} />
        <meshStandardMaterial color="#5a2d00" roughness={0.9} />
      </mesh>
      {/* door arch */}
      <mesh position={[0, size * 0.37, size * 0.456]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.02, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5a2d00" roughness={0.9} />
      </mesh>
      {/* windows */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 0.4, size * 0.457]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.16, size * 0.02]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
      {/* loft side window */}
      <mesh position={[0, size * 0.72, size * 0.457]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#88d4ff" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  )
}

function HayBale({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* main cylinder roll (on its side) */}
      <mesh position={[0, size * 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.7, 16]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* spiral wrap rings */}
      {[-0.15, 0, 0.15].map((z, i) => (
        <mesh key={i} position={[0, size * 0.25, z * size]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[size * 0.38, size * 0.025, 6, 16]} />
          <meshStandardMaterial color="#b08030" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Scarecrow({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.045, size * 0.045, size * 1.1, 6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* crossbar */}
      <mesh position={[0, size * 0.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.8, 6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* shirt body */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.28, size * 0.12]} />
        <meshStandardMaterial color="#c8a030" roughness={0.9} />
      </mesh>
      {/* arms (sleeves) */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.42, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.055, size * 0.32, 6]} />
          <meshStandardMaterial color="#c8a030" roughness={0.9} />
        </mesh>
      ))}
      {/* pants */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.22, size * 0.14]} />
        <meshStandardMaterial color="#4c7cb0" roughness={0.9} />
      </mesh>
      {/* head (pumpkin-ish) */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 10, 8]} />
        <meshStandardMaterial color="#ff9030" roughness={0.8} />
      </mesh>
      {/* hat brim */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.04, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* hat crown */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.13, size * 0.13, size * 0.22, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Well({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* stone ring */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.4, size * 0.28, 14, 1, true]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* stone top rim */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <torusGeometry args={[size * 0.38, size * 0.05, 6, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
      {/* posts */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.28, size * 0.42, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.55, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* roof ridge beam */}
      <mesh position={[0, size * 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.64, 6]} />
        <meshStandardMaterial color={wood} roughness={0.9} />
      </mesh>
      {/* roof panels */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.56, 0]} rotation={[s * 0.55, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.7, size * 0.02, size * 0.4]} />
          <meshStandardMaterial color="#8b2020" roughness={0.85} />
        </mesh>
      ))}
      {/* rope */}
      <mesh position={[0, size * 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.35, 6]} />
        <meshStandardMaterial color="#c8a030" roughness={0.9} />
      </mesh>
      {/* bucket */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.055, size * 0.12, 10]} />
        <meshStandardMaterial color={wood} roughness={0.85} />
      </mesh>
    </group>
  )
}

// ─── Pirates ──────────────────────────────────────────────────────────────

function Cannon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#3a3a3a'
  return (
    <group position={pos}>
      {/* barrel — angled up */}
      <mesh position={[0, size * 0.18, 0]} rotation={[Math.PI / 2 - 0.35, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.16, size * 0.72, 12]} />
        <meshStandardMaterial color={metal} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* muzzle ring */}
      <mesh position={[0, size * 0.44, size * 0.12]} rotation={[Math.PI / 2 - 0.35, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.16, size * 0.03, 8, 14]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* wheels */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.0, -size * 0.08]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.06, 12]} />
          <meshStandardMaterial color="#5a3000" roughness={0.9} />
        </mesh>
      ))}
      {/* wheel spokes */}
      {[-1, 1].map((s, i) =>
        [0, 1, 2, 3].map((j) => (
          <mesh key={`${i}-${j}`} position={[s * size * 0.3, size * 0, -size * 0.08]} rotation={[j * Math.PI / 4, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[size * 0.03, size * 0.37, size * 0.06]} />
            <meshStandardMaterial color="#5a3000" roughness={0.9} />
          </mesh>
        ))
      )}
      {/* carriage */}
      <mesh position={[0, -size * 0.04, -size * 0.08]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.12, size * 0.55]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ShipWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.4 })
  const wood = color || '#8b5a2b'
  const spokes = Array.from({ length: 8 }, (_, i) => i)
  return (
    <group position={pos}>
      <group ref={ref}>
        {/* outer ring */}
        <mesh castShadow>
          <torusGeometry args={[size * 0.44, size * 0.06, 8, 20]} />
          <meshStandardMaterial color={wood} roughness={0.85} />
        </mesh>
        {/* spokes */}
        {spokes.map((i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} rotation={[0, 0, angle]} castShadow>
              <boxGeometry args={[size * 0.06, size * 0.88, size * 0.06]} />
              <meshStandardMaterial color={wood} roughness={0.9} />
            </mesh>
          )
        })}
        {/* handle pegs */}
        {spokes.map((i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.44, Math.sin(angle) * size * 0.44, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.03, size * 0.14, 6]} />
              <meshStandardMaterial color="#6b3800" roughness={0.85} />
            </mesh>
          )
        })}
        {/* center hub */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.12, 12]} />
          <meshStandardMaterial color="#5a3000" roughness={0.8} metalness={0.2} />
        </mesh>
      </group>
      {/* post behind wheel */}
      <mesh position={[0, -size * 0.3, -size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.8, 8]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
    </group>
  )
}

function TreasureMap({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* scroll body */}
      <mesh position={[0, size * 0.02, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.02, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* rolled ends */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.35, size * 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.52, 8]} />
          <meshStandardMaterial color="#b08030" roughness={0.85} />
        </mesh>
      ))}
      {/* X marks the spot */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.06, size * 0.025, size * 0.04]} rotation={[Math.PI / 2, 0, s * Math.PI / 4]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.012, size * 0.012]} />
          <meshStandardMaterial color="#c0392b" roughness={0.8} />
        </mesh>
      ))}
      {/* dotted path lines (boxes) */}
      {[-0.15, -0.05, 0.05].map((z, i) => (
        <mesh key={i} position={[-size * 0.15, size * 0.025, z * size]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.05, size * 0.012, size * 0.012]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function JollyRoger({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flagColor = color || '#2a2a2a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.04, size * 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* flag */}
      <mesh position={[size * 0.28, size * 0.82, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.38, size * 0.02]} />
        <meshStandardMaterial color={flagColor} roughness={0.8} />
      </mesh>
      {/* skull */}
      <mesh position={[size * 0.2, size * 0.86, size * 0.015]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 8]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
      {/* crossbones H bar */}
      <mesh position={[size * 0.2, size * 0.74, size * 0.015]} rotation={[0, 0, Math.PI / 5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
      <mesh position={[size * 0.2, size * 0.74, size * 0.015]} rotation={[0, 0, -Math.PI / 5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} />
      </mesh>
    </group>
  )
}

function AnchorChain({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#5a5a5a'
  return (
    <group position={pos}>
      {/* main shaft */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.72, 8]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
      </mesh>
      {/* top ring */}
      <mesh position={[0, size * 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 8, 14]} />
        <meshStandardMaterial color={metal} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* cross bar */}
      <mesh position={[0, size * 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.44, 8]} />
        <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.18, -size * 0.04, size * 0.18]} rotation={[Math.PI / 3, 0, s * 0.5]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.03, size * 0.42, 8]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* flukes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.26, -size * 0.14, size * 0.26]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* chain links */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, size * 0.65 + i * size * 0.12, 0]} rotation={[i % 2 ? 0 : Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.06, size * 0.02, 6, 10]} />
          <meshStandardMaterial color={metal} roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Jungle ───────────────────────────────────────────────────────────────

function PalmTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const leafColor = color || '#34C38A'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.08 })
  return (
    <group position={pos}>
      {/* trunk — slight curve using 3 segments */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * size * 0.04, size * (i * 0.22 + 0.12), 0]} castShadow>
          <cylinderGeometry args={[size * (0.1 - i * 0.015), size * (0.12 - i * 0.015), size * 0.28, 8]} />
          <meshStandardMaterial color="#c8a030" roughness={0.9} />
        </mesh>
      ))}
      {/* leaf crown */}
      <group ref={ref} position={[size * 0.16, size * 1.02, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * size * 0.35, -size * 0.1, Math.sin(angle) * size * 0.35]}
              rotation={[Math.sin(angle) * 0.5, angle, 0.6]} castShadow>
              <boxGeometry args={[size * 0.06, size * 0.02, size * 0.55]} />
              <meshStandardMaterial color={leafColor} roughness={0.85} />
            </mesh>
          )
        })}
        {/* coconuts */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.1, -size * 0.05, Math.sin(a) * size * 0.1]} castShadow>
              <sphereGeometry args={[size * 0.075, 8, 8]} />
              <meshStandardMaterial color="#5a3000" roughness={0.85} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function Bamboo({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5ba55b'
  const stalks = [
    [0, 0, 0],
    [size * 0.18, 0, size * 0.1],
    [-size * 0.15, 0, -size * 0.12],
  ]
  return (
    <group position={pos}>
      {stalks.map(([x, , z], si) =>
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={`${si}-${i}`} position={[x, size * (i * 0.22 + 0.12), z]} castShadow>
            <cylinderGeometry args={[size * 0.055, size * 0.06, size * 0.2, 8]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))
      )}
      {/* nodes */}
      {stalks.map(([x, , z], si) =>
        [1, 2, 3, 4].map((i) => (
          <mesh key={`n${si}-${i}`} position={[x, size * (i * 0.22 + 0.01), z]} castShadow>
            <torusGeometry args={[size * 0.06, size * 0.018, 6, 12]} />
            <meshStandardMaterial color="#3a7a3a" roughness={0.85} />
          </mesh>
        ))
      )}
      {/* leaves at top */}
      {stalks.map(([x, , z], si) =>
        [-1, 1].map((s, i) => (
          <mesh key={`l${si}-${i}`} position={[x + s * size * 0.18, size * 1.05, z]} rotation={[0, 0, s * 0.55]} castShadow>
            <boxGeometry args={[size * 0.28, size * 0.02, size * 0.06]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  )
}

function SnakeDeco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5ba55b'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5 })
  const coils = Array.from({ length: 8 }, (_, i) => i)
  return (
    <group position={pos}>
      {/* coiled body */}
      {coils.map((i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = size * (0.35 - i * 0.02)
        const y = size * i * 0.07
        return (
          <mesh key={i} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
            rotation={[0, angle + Math.PI / 2, 0]} castShadow>
            <cylinderGeometry args={[size * (0.07 - i * 0.004), size * (0.08 - i * 0.004), size * 0.32, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? c : '#2a5a2a'} roughness={0.8} />
          </mesh>
        )
      })}
      {/* head */}
      <group ref={ref} position={[0, size * 0.64, 0]}>
        <mesh position={[0, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.09, size * 0.12]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.04, size * 0.1, size * 0.06]} castShadow>
            <sphereGeometry args={[size * 0.025, 6, 6]} />
            <meshStandardMaterial color="#ffff00" roughness={0.3} />
          </mesh>
        ))}
        {/* tongue */}
        <mesh position={[0, size * 0.07, size * 0.07]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.055, size * 0.01, size * 0.07]} />
          <meshStandardMaterial color="#ff5464" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function TribalMask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8841a'
  return (
    <group position={pos}>
      {/* face panel */}
      <mesh position={[0, size * 0.15, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.75, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* forehead crest */}
      <mesh position={[0, size * 0.58, size * 0.04]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.16, size * 0.1]} />
        <meshStandardMaterial color="#a06020" roughness={0.85} />
      </mesh>
      {/* crest spikes */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.73, size * 0.04]} castShadow>
          <coneGeometry args={[size * 0.055, size * 0.18, 6]} />
          <meshStandardMaterial color="#a06020" roughness={0.85} />
        </mesh>
      ))}
      {/* eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.15, size * 0.25, size * 0.07]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.07, size * 0.05]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, size * 0.1, size * 0.08]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.1, size * 0.06]} />
        <meshStandardMaterial color="#a06020" roughness={0.85} />
      </mesh>
      {/* mouth */}
      <mesh position={[0, -size * 0.06, size * 0.07]} castShadow>
        <boxGeometry args={[size * 0.24, size * 0.06, size * 0.05]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
      {/* teeth */}
      {[-0.07, 0, 0.07].map((x, i) => (
        <mesh key={i} position={[x * size, -size * 0.04, size * 0.09]} castShadow>
          <boxGeometry args={[size * 0.04, size * 0.06, size * 0.03]} />
          <meshStandardMaterial color="#f5f5e0" roughness={0.8} />
        </mesh>
      ))}
      {/* side decorations */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.32, size * 0.1, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.04, size * 0.35, 6]} />
          <meshStandardMaterial color="#c84030" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function VineSwing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.3
  })
  const c = color || '#48c774'
  return (
    <group position={pos}>
      {/* anchor bar at top */}
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.8, 8]} />
        <meshStandardMaterial color="#5a3000" roughness={0.9} />
      </mesh>
      <group ref={ref} position={[0, size * 0.7, 0]}>
        {/* vine ropes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.3, -size * 0.35, 0]} castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.7, 6]} />
            <meshStandardMaterial color={c} roughness={0.9} />
          </mesh>
        ))}
        {/* seat plank */}
        <mesh position={[0, -size * 0.72, 0]} castShadow>
          <boxGeometry args={[size * 0.66, size * 0.06, size * 0.24]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {/* leaf accents on ropes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[s * size * 0.3, -size * 0.18, 0]} rotation={[0, 0, s * 0.4]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.04, size * 0.08]} />
            <meshStandardMaterial color={c} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── City ─────────────────────────────────────────────────────────────────

function TrafficLight({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<number>(0)
  const [phase, setPhase] = useState(0)
  useFrame((_, dt) => {
    ref.current += dt
    if (ref.current > 2.5) { ref.current = 0; setPhase((p) => (p + 1) % 3) }
  })
  const lights = ['#ff5464', '#ffd644', '#48c774']
  const activeIdx = [0, 1, 2][phase]
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.045, size * 0.055, size * 1.0, 8]} />
        <meshStandardMaterial color={color || '#2a3340'} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* housing */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.52, size * 0.16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* lights */}
      {lights.map((lc, i) => (
        <mesh key={i} position={[0, size * (1.08 - i * 0.16), size * 0.09]} castShadow>
          <sphereGeometry args={[size * 0.065, 10, 8]} />
          <meshStandardMaterial color={lc} roughness={0.3}
            emissive={activeIdx === i ? lc : '#000'} emissiveIntensity={activeIdx === i ? 1.5 : 0} />
        </mesh>
      ))}
      {activeIdx === 0 && <pointLight position={[0, size * 1.08, size * 0.1]} color="#ff5464" intensity={0.6} distance={3} />}
      {activeIdx === 2 && <pointLight position={[0, size * 0.76, size * 0.1]} color="#48c774" intensity={0.6} distance={3} />}
    </group>
  )
}

function FireHydrant({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.25, size * 0.1, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* body */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.35, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.44, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.18, size * 0.12, 10]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* cap */}
      <mesh position={[0, size * 0.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.08, 10]} />
        <meshStandardMaterial color="#e0c000" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* nozzle caps */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.19, size * 0.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.08, 8]} />
          <meshStandardMaterial color="#e0c000" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Mailbox({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.55, size * 0.08]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* box body */}
      <mesh position={[0, size * 0.56, 0]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.26, size * 0.22]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* rounded top (half cylinder) */}
      <mesh position={[0, size * 0.7, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.13, size * 0.13, size * 0.22, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* slot */}
      <mesh position={[0, size * 0.6, size * 0.115]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.03, size * 0.01]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
      {/* door handle */}
      <mesh position={[size * 0.165, size * 0.5, 0]} castShadow>
        <sphereGeometry args={[size * 0.03, 6, 6]} />
        <meshStandardMaterial color="#e0c000" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function StreetLamp({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a3a3a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.2, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* curved arm */}
      <mesh position={[size * 0.15, size * 1.15, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.38, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* lamp housing */}
      <mesh position={[size * 0.28, size * 1.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.08, size * 0.16, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* glass */}
      <mesh position={[size * 0.28, size * 1.14, 0]} castShadow>
        <sphereGeometry args={[size * 0.09, 10, 8]} />
        <meshStandardMaterial color="#fff3d8" roughness={0.1} transparent opacity={0.85}
          emissive="#fff3d8" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[size * 0.28, size * 1.14, 0]} color="#fff3d8" intensity={1.2} distance={5} />
      {/* base */}
      <mesh position={[0, -size * 0.02, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.08, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

function PhoneBooth({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.1, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* walls — 3 sides (front open) */}
      {/* back */}
      <mesh position={[0, size * 0.55, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.6, size * 1.0, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* sides */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.28, size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.04, size * 1.0, size * 0.56]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      {/* glass panels (sides) */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.25, size * 0.6, size * 0.06]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.7, size * 0.42]} />
          <meshStandardMaterial color="#88d4ff" roughness={0.1} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* roof */}
      <mesh position={[0, size * 1.07, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.12, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* roof crown */}
      <mesh position={[0, size * 1.14, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.06, size * 0.22]} />
        <meshStandardMaterial color="#e0c000" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* phone handset */}
      <mesh position={[-size * 0.05, size * 0.56, -size * 0.24]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* coin slot */}
      <mesh position={[size * 0.08, size * 0.7, -size * 0.24]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.02, size * 0.02]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Garden ───────────────────────────────────────────────────────────────

function WateringCan({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* main body (oval-ish box) */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.38, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* spout pipe */}
      <mesh position={[size * 0.32, size * 0.08, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[size * 0.055, size * 0.065, size * 0.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* rose (sprinkle head) */}
      <mesh position={[size * 0.52, -size * 0.08, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.06, size * 0.06, 10]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* handle arc */}
      <mesh position={[-size * 0.04, size * 0.38, 0]} rotation={[0, 0, 0.3]} castShadow>
        <torusGeometry args={[size * 0.2, size * 0.035, 8, 14, Math.PI * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.14, size * 0.18, size * 0.05, 10]} />
        <meshStandardMaterial color="#3a7ace" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}

function BirdBath({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const stone = color || '#a9d8ff'
  return (
    <group position={pos}>
      {/* pedestal */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.15, 10]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.1, size * 0.18, 10]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
      </mesh>
      {/* basin */}
      <mesh position={[0, size * 0.34, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.28, size * 0.12, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
      {/* water */}
      <mesh position={[0, size * 0.41, 0]}>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.04, 14]} />
        <meshStandardMaterial color={stone} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* base plate */}
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.24, size * 0.06, 14]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.9} />
      </mesh>
    </group>
  )
}

function GardenGnome({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const hatColor = color || '#ff5464'
  return (
    <group position={pos}>
      {/* shoes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.07, size * 0.03, size * 0.04]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.08, size * 0.18]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* legs */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.07, size * 0.15, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.065, size * 0.18, 8]} />
          <meshStandardMaterial color="#4c7cb0" roughness={0.9} />
        </mesh>
      ))}
      {/* body */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.25, size * 0.22]} />
        <meshStandardMaterial color="#c84848" roughness={0.8} />
      </mesh>
      {/* jacket/belt */}
      <mesh position={[0, size * 0.2, size * 0.115]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.06, size * 0.02]} />
        <meshStandardMaterial color="#3a2000" roughness={0.9} />
      </mesh>
      {/* beard */}
      <mesh position={[0, size * 0.35, size * 0.12]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.14, size * 0.04]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.9} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.48, 0]} castShadow>
        <sphereGeometry args={[size * 0.15, 10, 8]} />
        <meshStandardMaterial color="#f5c87a" roughness={0.8} />
      </mesh>
      {/* eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.055, size * 0.5, size * 0.14]} castShadow>
          <sphereGeometry args={[size * 0.025, 6, 6]} />
          <meshStandardMaterial color="#2a1200" roughness={0.9} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, size * 0.46, size * 0.15]} castShadow>
        <sphereGeometry args={[size * 0.03, 6, 6]} />
        <meshStandardMaterial color="#e0a050" roughness={0.8} />
      </mesh>
      {/* hat brim */}
      <mesh position={[0, size * 0.63, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.04, 12]} />
        <meshStandardMaterial color={hatColor} roughness={0.8} />
      </mesh>
      {/* hat cone */}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <coneGeometry args={[size * 0.16, size * 0.4, 12]} />
        <meshStandardMaterial color={hatColor} roughness={0.8} />
      </mesh>
    </group>
  )
}

function FlowerBed({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const flowerColor = color || '#ff5ab1'
  const flowerPositions: Array<[number, number]> = [
    [0, 0], [-0.18, 0.12], [0.18, -0.1], [-0.08, -0.16], [0.12, 0.14],
    [0.22, 0.02], [-0.22, -0.06], [0, 0.18], [-0.16, 0.06],
  ]
  return (
    <group position={pos}>
      {/* soil bed */}
      <mesh position={[0, size * 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.7, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#6b3d00" roughness={0.95} />
      </mesh>
      {/* border stones */}
      {[0, 1, 2, 3].map((i) => {
        const xSigns = [-1, 1, 0, 0]
        const zSigns = [0, 0, -1, 1]
        return (
          <mesh key={i} position={[xSigns[i] * size * 0.36, size * 0.02, zSigns[i] * size * 0.26]} castShadow>
            <boxGeometry args={i < 2 ? [size * 0.06, size * 0.12, size * 0.54] : [size * 0.76, size * 0.12, size * 0.06]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.9} />
          </mesh>
        )
      })}
      {/* flowers */}
      {flowerPositions.map(([x, z], i) => (
        <group key={i} position={[x * size, size * 0.08, z * size]}>
          {/* stem */}
          <mesh castShadow>
            <cylinderGeometry args={[size * 0.02, size * 0.025, size * 0.18, 6]} />
            <meshStandardMaterial color="#5ba55b" roughness={0.85} />
          </mesh>
          {/* petals */}
          <mesh position={[0, size * 0.1, 0]} castShadow>
            <sphereGeometry args={[size * 0.07, 8, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? flowerColor : '#FFD43C'} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Trellis({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wood = color || '#8b5a2b'
  const verts = 4
  const horiz = 5
  return (
    <group position={pos}>
      {/* vertical posts */}
      {Array.from({ length: verts }, (_, i) => (
        <mesh key={i} position={[(i / (verts - 1) - 0.5) * size * 0.8, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.035, size * 1.1, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* horizontal rails */}
      {Array.from({ length: horiz }, (_, i) => (
        <mesh key={i} position={[0, size * (i / (horiz - 1) * 0.9 + 0.05), 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.022, size * 0.022, size * 0.86, 6]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {/* diagonal vines */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.5, 0]} rotation={[0, 0, s * 0.55]} castShadow>
          <cylinderGeometry args={[size * 0.016, size * 0.016, size * 1.1, 6]} />
          <meshStandardMaterial color="#5ba55b" roughness={0.9} />
        </mesh>
      ))}
      {/* leaf dots on vine */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={i} position={[y * size * 0.5, size * (0.5 + y * 0.35), size * 0.02]} castShadow>
          <sphereGeometry args={[size * 0.055, 6, 6]} />
          <meshStandardMaterial color="#48c774" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Sport-2 ──────────────────────────────────────────────────────────────

function BasketballHoop({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff8c1a'
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.55, -size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 1.3, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* backboard */}
      <mesh position={[0, size * 1.0, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.5, size * 0.04]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>
      {/* backboard inner box */}
      <mesh position={[0, size * 0.92, -size * 0.26]} castShadow>
        <boxGeometry args={[size * 0.26, size * 0.2, size * 0.01]} />
        <meshStandardMaterial color="#ff5464" roughness={0.6} />
      </mesh>
      {/* arm */}
      <mesh position={[0, size * 1.0, -size * 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.36, 6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* hoop ring */}
      <mesh position={[0, size * 0.92, size * 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.025, 8, 18]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* net (approximated with cones) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.18, size * 0.82, Math.sin(a) * size * 0.06 + size * 0.06]}
            rotation={[0.2, a, 0]} castShadow>
            <cylinderGeometry args={[size * 0.012, size * 0.005, size * 0.22, 4]} />
            <meshStandardMaterial color="#f5f5f0" roughness={0.9} transparent opacity={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

function BoxingGloves({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
  })
  return (
    <group position={pos}>
      <group ref={ref}>
        {/* glove pair side by side */}
        {[-1, 1].map((s, i) => (
          <group key={i} position={[s * size * 0.28, size * 0.35, 0]}>
            {/* main glove body */}
            <mesh castShadow>
              <boxGeometry args={[size * 0.35, size * 0.45, size * 0.28]} />
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
            {/* thumb bump */}
            <mesh position={[s * size * 0.18, size * 0.08, 0]} castShadow>
              <sphereGeometry args={[size * 0.1, 8, 8]} />
              <meshStandardMaterial color={c} roughness={0.7} />
            </mesh>
            {/* wrist cuff */}
            <mesh position={[0, -size * 0.26, 0]} castShadow>
              <cylinderGeometry args={[size * 0.16, size * 0.14, size * 0.14, 10]} />
              <meshStandardMaterial color="#f5f5f0" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
      {/* string connecting them */}
      <mesh position={[0, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.6, 6]} />
        <meshStandardMaterial color="#2a1200" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ArcheryTarget({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const rings = [
    '#ff5464', '#ff8c1a', '#ffd644', '#48c774', '#4c97ff',
  ]
  return (
    <group position={pos}>
      {/* stand legs */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.22, size * 0.12, -size * 0.08 * s]} rotation={[s * 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.5, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
      {/* target face */}
      {rings.map((rc, i) => {
        const r = size * (0.42 - i * 0.075)
        return (
          <mesh key={i} position={[0, size * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[r, r, size * (0.015 - i * 0.001), 16]} />
            <meshStandardMaterial color={rc} roughness={0.7} />
          </mesh>
        )
      })}
      {/* bullseye */}
      <mesh position={[0, size * 0.5, size * 0.06]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.01, 16]} />
        <meshStandardMaterial color="#ff5464" roughness={0.6} emissive="#ff5464" emissiveIntensity={0.3} />
      </mesh>
      {/* arrow */}
      <mesh position={[size * 0.08, size * 0.5, size * 0.08]} rotation={[0.1, 0.1, 1.3]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.012, size * 0.4, 6]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
    </group>
  )
}

function SurfBoard({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#48c774'
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
  })
  return (
    <group position={pos}>
      <group ref={ref} position={[0, size * 0.1, 0]}>
        {/* board body */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.22, size * 0.06, size * 0.85]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* nose taper */}
        <mesh position={[0, 0, size * 0.43]} castShadow>
          <coneGeometry args={[size * 0.11, size * 0.12, 6]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* tail notch */}
        <mesh position={[0, 0, -size * 0.43]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.06, size * 0.08]} />
          <meshStandardMaterial color="#2a8a5a" roughness={0.5} />
        </mesh>
        {/* stripe decoration */}
        <mesh position={[0, size * 0.035, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.01, size * 0.7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        {/* fin */}
        <mesh position={[0, -size * 0.06, -size * 0.3]} castShadow>
          <boxGeometry args={[size * 0.03, size * 0.1, size * 0.12]} />
          <meshStandardMaterial color="#2a5a3a" roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

function Dumbbell({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const metal = color || '#3a3a3a'
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 6]}>
      {/* handle bar */}
      <mesh castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.65, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* weight plates — left */}
      {[-0.38, -0.28].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * (0.22 - i * 0.03), size * (0.22 - i * 0.03), size * 0.06, 14]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* weight plates — right */}
      {[0.28, 0.38].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * (0.19 + i * 0.03), size * (0.19 + i * 0.03), size * 0.06, 14]} />
          <meshStandardMaterial color={metal} roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Food-2 ───────────────────────────────────────────────────────────────

function Taco({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const shellColor = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* shell (bent cylinder half) */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.6, 12, 1, false, -0.7, 2.5]} />
        <meshStandardMaterial color={shellColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* lettuce */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.08, size * 0.4]} />
        <meshStandardMaterial color="#5ba55b" roughness={0.9} />
      </mesh>
      {/* meat */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <boxGeometry args={[size * 0.46, size * 0.06, size * 0.34]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      {/* tomato dots */}
      {[-0.08, 0, 0.08].map((z, i) => (
        <mesh key={i} position={[size * 0.1, size * 0.3, z * size]} castShadow>
          <sphereGeometry args={[size * 0.04, 6, 6]} />
          <meshStandardMaterial color="#ff5464" roughness={0.8} />
        </mesh>
      ))}
      {/* cheese */}
      <mesh position={[-size * 0.08, size * 0.31, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.04, size * 0.36]} />
        <meshStandardMaterial color="#ffd644" roughness={0.9} />
      </mesh>
    </group>
  )
}

function RamenBowl({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bowlColor = color || '#ff9454'
  return (
    <group position={pos}>
      {/* bowl body */}
      <mesh position={[0, size * 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.28, size * 0.28, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* soup */}
      <mesh position={[0, size * 0.19, 0]}>
        <cylinderGeometry args={[size * 0.36, size * 0.36, size * 0.02, 14]} />
        <meshStandardMaterial color={bowlColor} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* noodles */}
      {[-0.1, 0, 0.1].map((z, i) => (
        <mesh key={i} position={[size * (i - 1) * 0.08, size * 0.22, z * size]} rotation={[0, i * 0.4, 0.2]} castShadow>
          <torusGeometry args={[size * 0.14, size * 0.018, 6, 14]} />
          <meshStandardMaterial color="#f5f5e0" roughness={0.8} />
        </mesh>
      ))}
      {/* egg half */}
      <mesh position={[size * 0.14, size * 0.24, -size * 0.08]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5f5e0" roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.14, size * 0.24, -size * 0.08]}>
        <cylinderGeometry args={[size * 0.065, size * 0.065, size * 0.01, 10]} />
        <meshStandardMaterial color="#ffd644" roughness={0.5} />
      </mesh>
      {/* chopsticks */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.04, size * 0.36, 0]} rotation={[0.1, 0, s * 0.08]} castShadow>
          <cylinderGeometry args={[size * 0.012, size * 0.008, size * 0.6, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function BobaTea({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const liquidColor = color || '#c8841a'
  return (
    <group position={pos}>
      {/* cup */}
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.18, size * 0.65, 12]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* liquid */}
      <mesh position={[0, size * 0.24, 0]}>
        <cylinderGeometry args={[size * 0.2, size * 0.175, size * 0.6, 12]} />
        <meshStandardMaterial color={liquidColor} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* boba pearls */}
      {[[-0.06, -0.06], [0.06, -0.1], [-0.04, 0.08], [0.08, 0.04], [0, -0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.06, z * size]} castShadow>
          <sphereGeometry args={[size * 0.04, 8, 8]} />
          <meshStandardMaterial color="#2a1200" roughness={0.7} />
        </mesh>
      ))}
      {/* lid */}
      <mesh position={[0, size * 0.59, 0]} castShadow>
        <cylinderGeometry args={[size * 0.24, size * 0.22, size * 0.05, 12]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} transparent opacity={0.8} />
      </mesh>
      {/* straw */}
      <mesh position={[size * 0.08, size * 0.78, 0]} rotation={[0.05, 0, 0.05]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.6, 6]} />
        <meshStandardMaterial color="#48c774" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Croissant({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4aa60'
  return (
    <group position={pos}>
      {/* main body arc */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.1, 8, 14, Math.PI * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* horns */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.3, size * 0.06, size * 0.05]}
          rotation={[Math.PI / 2, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.065, size * 0.22, 6]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* layers highlight */}
      {[-1, 0, 1].map((y, i) => (
        <mesh key={i} position={[0, size * (0.02 + i * 0.04), 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.28, size * 0.015, 4, 14, Math.PI * 1.1]} />
          <meshStandardMaterial color="#b08030" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function WatermelonSlice({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* slice wedge (half cylinder) */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* white rind */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* green outer skin */}
      <mesh position={[0, size * 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.5, size * 0.12, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5ba55b" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* seeds */}
      {[[-0.12, -0.08], [0.08, -0.14], [0.18, 0.04], [-0.06, 0.12], [0, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <sphereGeometry args={[size * 0.028, 6, 4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* flat cut face */}
      <mesh position={[0, size * 0.06, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.12, size * 0.02]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// VEHICLES
// ═══════════════════════════════════════════════════════════

function Helicopter({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bladeRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (bladeRef.current) bladeRef.current.rotation.y += dt * 8 })
  const c = color || '#5b8dee'
  return (
    <group position={pos}>
      {/* fuselage */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.32, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.45} metalness={0.2} />
      </mesh>
      {/* cockpit bubble */}
      <mesh position={[size * 0.28, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* tail boom */}
      <mesh position={[-size * 0.55, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.12, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.45} />
      </mesh>
      {/* tail rotor */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[-size * 0.82, size * 0.36, s * size * 0.14]} castShadow>
          <boxGeometry args={[size * 0.05, size * 0.28, size * 0.04]} />
          <meshStandardMaterial color="#ccc" roughness={0.3} />
        </mesh>
      ))}
      {/* main rotor mast */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.12, 6]} />
        <meshStandardMaterial color="#888" roughness={0.3} />
      </mesh>
      {/* main rotor blades */}
      <group ref={bladeRef} position={[0, size * 0.63, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * size * 0.42, 0, Math.sin(a) * size * 0.42]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[size * 0.78, size * 0.03, size * 0.1]} />
            <meshStandardMaterial color="#555" roughness={0.4} />
          </mesh>
        ))}
      </group>
      {/* skids */}
      {[-1, 1].map((s, i) => (
        <group key={i}>
          <mesh position={[s * size * 0.06, size * 0.14, s * size * 0.22]} castShadow>
            <boxGeometry args={[size * 0.04, size * 0.24, size * 0.04]} />
            <meshStandardMaterial color="#666" roughness={0.5} />
          </mesh>
          <mesh position={[0, size * 0.06, s * size * 0.22]} castShadow>
            <boxGeometry args={[size * 0.62, size * 0.04, size * 0.04]} />
            <meshStandardMaterial color="#666" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bicycle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  const wheelColor = '#2a2a2a'
  return (
    <group position={pos}>
      {/* rear wheel */}
      <mesh position={[-size * 0.3, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.04, 8, 24]} />
        <meshStandardMaterial color={wheelColor} roughness={0.9} />
      </mesh>
      {/* front wheel */}
      <mesh position={[size * 0.3, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.28, size * 0.04, 8, 24]} />
        <meshStandardMaterial color={wheelColor} roughness={0.9} />
      </mesh>
      {/* frame — down tube */}
      <mesh position={[0, size * 0.38, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[size * 0.05, size * 0.6, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* seat tube */}
      <mesh position={[-size * 0.08, size * 0.44, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[size * 0.05, size * 0.38, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* top tube */}
      <mesh position={[0, size * 0.58, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.05, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* seat */}
      <mesh position={[-size * 0.12, size * 0.65, 0]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.06, size * 0.1]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>
      {/* handlebar */}
      <mesh position={[size * 0.28, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.14, size * 0.28]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* pedal crank (center) */}
      <mesh position={[0, size * 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.1, 8]} />
        <meshStandardMaterial color="#666" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  )
}

function Scooter({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#48c774'
  return (
    <group position={pos}>
      {/* deck */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* rear wheel */}
      <mesh position={[-size * 0.28, size * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* front wheel */}
      <mesh position={[size * 0.28, size * 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.1, size * 0.03, 6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      {/* fork/stem */}
      <mesh position={[size * 0.28, size * 0.35, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.52, size * 0.05]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* handlebar */}
      <mesh position={[size * 0.26, size * 0.64, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.1, size * 0.36]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

function HotRod({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      {/* body low */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.26, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.25} metalness={0.45} />
      </mesh>
      {/* cab roof */}
      <mesh position={[-size * 0.1, size * 0.44, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.46]} />
        <meshStandardMaterial color={c} roughness={0.25} metalness={0.45} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.15, size * 0.46, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[size * 0.04, size * 0.2, size * 0.4]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* front bumper/grill */}
      <mesh position={[size * 0.58, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.07, size * 0.18, size * 0.44]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* exhaust pipes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.3, size * 0.22, s * size * 0.26]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.5, 8]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* wheels */}
      {[[-size*0.35, size*0.25], [size*0.38, size*0.25]].map(([x, y], i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, y, s * size * 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[size * 0.16, size * 0.06, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        ))
      ))}
    </group>
  )
}

function Jeep({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#7d6e3a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.98, size * 0.3, size * 0.58]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* cab */}
      <mesh position={[-size * 0.05, size * 0.52, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 0.28, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* front grille */}
      <mesh position={[size * 0.5, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.22, size * 0.48]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      {/* headlights */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[size * 0.51, size * 0.32, s * size * 0.17]} castShadow>
          <boxGeometry args={[size * 0.04, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color="#ffe88a" emissive="#ffe88a" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
      ))}
      {/* big wheels */}
      {[[-size*0.3, size*0.22], [size*0.3, size*0.22]].map(([x, y], i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, y, s * size * 0.34]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[size * 0.22, size * 0.09, 8, 18]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
        ))
      ))}
      {/* roof rack */}
      <mesh position={[-size * 0.05, size * 0.68, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// BEACH
// ═══════════════════════════════════════════════════════════

function Sandcastle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e6c96e'
  return (
    <group position={pos}>
      {/* base mound */}
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.6, size * 0.24, 12]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* main keep */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <boxGeometry args={[size * 0.52, size * 0.42, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* battlements */}
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size*0.2, size*0.7, z*size*0.2]} castShadow>
          <boxGeometry args={[size*0.12, size*0.14, size*0.12]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}
      {/* corner towers */}
      {[[-0.24,-0.24],[-0.24,0.24],[0.24,-0.24],[0.24,0.24]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.48, z*size]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.12, size*0.52, 8]} />
          <meshStandardMaterial color={c} roughness={0.95} />
        </mesh>
      ))}
      {/* cone tops on towers */}
      {[[-0.24,-0.24],[-0.24,0.24],[0.24,-0.24],[0.24,0.24]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.82, z*size]} castShadow>
          <coneGeometry args={[size*0.12, size*0.18, 8]} />
          <meshStandardMaterial color="#c4a050" roughness={0.9} />
        </mesh>
      ))}
      {/* gate */}
      <mesh position={[0, size*0.32, size*0.27]} castShadow>
        <boxGeometry args={[size*0.18, size*0.28, size*0.06]} />
        <meshStandardMaterial color="#8b6a20" roughness={0.85} />
      </mesh>
    </group>
  )
}

function BeachUmbrella({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#ff9f43'
  const stripes = ['#ffffff', c]
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 1.2, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* canopy segments (8 stripes alternating) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, size * 1.14, 0]} rotation={[0, (i * Math.PI) / 4, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.62, size * 0.06, 4, 1, false, 0, Math.PI / 4]} />
          <meshStandardMaterial color={stripes[i % 2]} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* pole tip cap */}
      <mesh position={[0, size * 1.28, 0]} castShadow>
        <sphereGeometry args={[size * 0.065, 8, 6]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      {/* sand anchor stake */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.02, size * 0.12, 6]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function LifeguardTower({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* 4 legs */}
      {[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size*0.22, size*0.5, z*size*0.22]} castShadow>
          <boxGeometry args={[size*0.07, size*1.0, size*0.07]} />
          <meshStandardMaterial color="#c8a06a" roughness={0.8} />
        </mesh>
      ))}
      {/* platform floor */}
      <mesh position={[0, size*1.08, 0]} castShadow>
        <boxGeometry args={[size*0.6, size*0.08, size*0.6]} />
        <meshStandardMaterial color="#c8a06a" roughness={0.85} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size*1.42, 0]} castShadow>
        <boxGeometry args={[size*0.54, size*0.66, size*0.54]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.7} />
      </mesh>
      {/* red roof */}
      <mesh position={[0, size*1.8, 0]} castShadow>
        <boxGeometry args={[size*0.62, size*0.1, size*0.62]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
      {/* window */}
      <mesh position={[size*0.28, size*1.46, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.26, size*0.28]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* steps */}
      {[0,1,2].map((i)=>(
        <mesh key={i} position={[0, size*(0.22+i*0.28), size*0.24]} castShadow>
          <boxGeometry args={[size*0.32, size*0.06, size*0.18]} />
          <meshStandardMaterial color="#c8a06a" roughness={0.85} />
        </mesh>
      ))}
      {/* flag */}
      <mesh position={[0, size*2.08, 0]} castShadow>
        <cylinderGeometry args={[size*0.02, size*0.02, size*0.44, 4]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      <mesh position={[size*0.12, size*2.26, 0]} castShadow>
        <boxGeometry args={[size*0.22, size*0.14, size*0.03]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
    </group>
  )
}

function Buoy({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(clock.elapsedTime * 1.2) * size * 0.08
    }
  })
  const c = color || '#ff5464'
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {/* main float */}
        <mesh position={[0, size * 0.3, 0]} castShadow>
          <sphereGeometry args={[size * 0.32, 14, 10]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={0.15} />
        </mesh>
        {/* white band */}
        <mesh position={[0, size * 0.3, 0]} castShadow>
          <cylinderGeometry args={[size * 0.33, size * 0.33, size * 0.12, 14]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
        </mesh>
        {/* top cone */}
        <mesh position={[0, size * 0.62, 0]} castShadow>
          <coneGeometry args={[size * 0.14, size * 0.28, 10]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={0.15} />
        </mesh>
        {/* ring */}
        <mesh position={[0, size * 0.36, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.36, size * 0.04, 6, 16]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* light/signal on top */}
        <mesh position={[0, size * 0.92, 0]} castShadow>
          <sphereGeometry args={[size * 0.07, 8, 6]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffcc00" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* chain anchor */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.12, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function SurfboardRack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const boards = ['#ff5464', '#4c97ff', '#48c774']
  return (
    <group position={pos}>
      {/* rack posts */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.32, size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.07, size * 1.1, size * 0.07]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* horizontal rails */}
      {[0.32, 0.72].map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]} castShadow>
          <boxGeometry args={[size * 0.7, size * 0.06, size * 0.07]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* 3 leaning surfboards */}
      {boards.map((bc, i) => (
        <mesh key={i} position={[(i - 1) * size * 0.18, size * 0.72, size * 0.12]} rotation={[0.12, 0, -0.08]} castShadow>
          <boxGeometry args={[size * 0.13, size * 1.1, size * 0.05]} />
          <meshStandardMaterial color={bc} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// ANCIENT
// ═══════════════════════════════════════════════════════════

function Catapult({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const armRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.35 - 0.3
    }
  })
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* frame base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.8, size * 0.12, size * 0.36]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* side supports */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size * 0.36, s * size * 0.14]} rotation={[0, 0, 0.1 * s]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.5, size * 0.1]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* axle */}
      <mesh position={[0, size * 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.4, 8]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* swinging arm */}
      <group ref={armRef} position={[0, size * 0.56, 0]}>
        <mesh position={[0, size * 0.26, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.6, size * 0.1]} />
          <meshStandardMaterial color="#6a3a1a" roughness={0.85} />
        </mesh>
        {/* sling/bucket */}
        <mesh position={[0, size * 0.56, 0]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
        {/* counterweight */}
        <mesh position={[0, -size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.2, size * 0.2]} />
          <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
      {/* wheels */}
      {[-size*0.32, size*0.32].map((x, i) => (
        [-1, 1].map((s, j) => (
          <mesh key={`${i}${j}`} position={[x, size*0.12, s*size*0.2]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[size*0.12, size*0.12, size*0.07, 10]} />
            <meshStandardMaterial color="#5a3a10" roughness={0.9} />
          </mesh>
        ))
      ))}
    </group>
  )
}

function BrokenColumn({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#d4c4a0'
  return (
    <group position={pos}>
      {/* base plinth */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.56, size * 0.16, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* lower shaft */}
      <mesh position={[0, size * 0.54, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.22, size * 0.72, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* broken mid section (tilted) */}
      <mesh position={[size * 0.08, size * 1.06, size * 0.06]} rotation={[0.18, 0.12, 0.22]} castShadow>
        <cylinderGeometry args={[size * 0.19, size * 0.2, size * 0.44, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* rubble pieces */}
      {[[0.28, 0.12, 0.2], [-0.22, 0.1, -0.18], [0.1, 0.08, -0.28]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[Math.random()*1.2, Math.random()*2, 0]} castShadow>
          <boxGeometry args={[size*0.14, size*0.1, size*0.16]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      {/* fluting lines (grooves effect via thin planks) */}
      {Array.from({length: 8}).map((_,i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a)*size*0.2, size*0.54, Math.sin(a)*size*0.2]} rotation={[0,a,0]} castShadow>
            <boxGeometry args={[size*0.03, size*0.68, size*0.04]} />
            <meshStandardMaterial color="#c0b090" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

function Altar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#6a5a4a'
  return (
    <group position={pos}>
      {/* step base */}
      <mesh position={[0, size * 0.08, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.16, size * 0.7]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      {/* main slab */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.78, size * 0.46, size * 0.58]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* top surface */}
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.1, size * 0.62]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.8} />
      </mesh>
      {/* rune carvings (decorative) */}
      {[[-0.22, 0.38, 0.3], [0.22, 0.38, 0.3], [0, 0.38, 0.3]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <boxGeometry args={[size*0.06, size*0.12, size*0.02]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
        </mesh>
      ))}
      {/* side pillars */}
      {[[-0.34,-0.34],[0.34,-0.34],[-0.34,0.34],[0.34,0.34]].map(([x,z],i)=>(
        <mesh key={i} position={[x*size, size*0.38, z*size]} castShadow>
          <boxGeometry args={[size*0.1, size*0.46, size*0.1]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.88} />
        </mesh>
      ))}
      {/* flame effect on top */}
      <mesh position={[0, size*0.78, 0]} castShadow>
        <coneGeometry args={[size*0.1, size*0.24, 6]} />
        <meshStandardMaterial color="#ff8c1a" emissive="#ff5000" emissiveIntensity={1.2} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Sarcophagus({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8a84a'
  return (
    <group position={pos} rotation={[0.1, 0, 0]}>
      {/* base/body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.76, size * 0.56]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* head part — wider */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* headdress */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.22, size * 0.38]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
      {/* face mask eyes */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[0, size*0.74, s*size*0.12]} castShadow>
          <boxGeometry args={[size*0.05, size*0.06, size*0.1]} />
          <meshStandardMaterial color="#2a1a00" roughness={0.8} />
        </mesh>
      ))}
      {/* blue/teal decoration bands */}
      {[0.2, 0.42, 0.62].map((h, i) => (
        <mesh key={i} position={[size*0.2, h*size, 0]} castShadow>
          <boxGeometry args={[size*0.04, size*0.08, size*0.54]} />
          <meshStandardMaterial color="#2266cc" roughness={0.3} metalness={0.3} />
        </mesh>
      ))}
      {/* crook/flail cross emblem */}
      <mesh position={[size*0.2, size*0.5, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.22, size*0.06]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[size*0.2, size*0.58, 0]} castShadow>
        <boxGeometry args={[size*0.04, size*0.06, size*0.18]} />
        <meshStandardMaterial color="#d4a030" roughness={0.25} metalness={0.6} />
      </mesh>
    </group>
  )
}

function ColosseumArch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c4a882'
  return (
    <group position={pos}>
      {/* left pillar */}
      <mesh position={[-size * 0.38, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 1.4, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* right pillar */}
      <mesh position={[size * 0.38, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 1.4, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* top beam */}
      <mesh position={[0, size * 1.44, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.2, size * 0.32]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* arch curve (torus half) */}
      <mesh position={[0, size * 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.3, size * 0.1, 8, 16, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* classical capital on pillar tops */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 1.38, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.12, size * 0.36]} />
          <meshStandardMaterial color="#d4c0a0" roughness={0.8} />
        </mesh>
      ))}
      {/* base plinths */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * size * 0.38, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.16, size * 0.38]} />
          <meshStandardMaterial color="#b8a078" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// UNDERWATER
// ═══════════════════════════════════════════════════════════

function Shipwreck({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4a6a5a'
  return (
    <group position={pos} rotation={[0.15, 0.3, 0.25]}>
      {/* hull */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.44, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* hull bottom rounded */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.28, size * 1.1, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#3a5a4a" roughness={0.92} />
      </mesh>
      {/* broken mast */}
      <mesh position={[size * 0.1, size * 0.7, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.9, 6]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
      </mesh>
      {/* deck planks */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * size * 0.28, size * 0.46, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.06, size * 0.42]} />
          <meshStandardMaterial color="#5a4a30" roughness={0.88} />
        </mesh>
      ))}
      {/* coral/algae on hull */}
      {[[0.3, 0.18, 0.22], [-0.38, 0.14, -0.2], [0, 0.08, 0.22]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <sphereGeometry args={[size*0.08, 6, 5]} />
          <meshStandardMaterial color="#ff6b8a" roughness={0.8} />
        </mesh>
      ))}
      {/* porthole */}
      <mesh position={[size*0.28, size*0.28, size*0.23]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[size*0.07, size*0.02, 6, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function TreasureChestOpen({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* chest base */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.44, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* metal bands */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x*size, size*0.22, 0]} castShadow>
          <boxGeometry args={[size*0.06, size*0.46, size*0.46]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* lid open (tilted back) */}
      <mesh position={[0, size * 0.54, -size * 0.16]} rotation={[-Math.PI * 0.55, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.14, size * 0.44]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* lock */}
      <mesh position={[0, size*0.36, size*0.23]} castShadow>
        <boxGeometry args={[size*0.1, size*0.12, size*0.04]} />
        <meshStandardMaterial color="#c8a030" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* gold coins spilling out */}
      {[[-0.12, 0.48, 0.14], [0.14, 0.46, 0.16], [0, 0.44, 0.18], [0.22, 0.42, 0.12], [-0.08, 0.46, 0.2]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} rotation={[Math.random()*0.8, Math.random()*Math.PI, 0]} castShadow>
          <cylinderGeometry args={[size*0.06, size*0.06, size*0.03, 10]} />
          <meshStandardMaterial color="#ffd43c" emissive="#cc8800" emissiveIntensity={0.2} roughness={0.2} metalness={0.7} />
        </mesh>
      ))}
      {/* gems inside */}
      {[[0, 0.42, 0], [-0.18, 0.42, 0], [0.18, 0.42, 0]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <octahedronGeometry args={[size*0.07]} />
          <meshStandardMaterial color={['#ff4444','#4488ff','#44cc44'][i]} roughness={0.05} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Anemone({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const waveRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (waveRef.current) {
      const t = clock.elapsedTime
      waveRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(t * 1.5 + i * 0.8) * 0.3
        child.rotation.z = Math.cos(t * 1.2 + i * 0.6) * 0.25
      })
    }
  })
  const c = color || '#ff6b8a'
  return (
    <group position={pos}>
      {/* base disc */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.34, size * 0.12, 10]} />
        <meshStandardMaterial color="#cc4466" roughness={0.85} />
      </mesh>
      {/* tentacles */}
      <group ref={waveRef} position={[0, size * 0.12, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const r = size * 0.18
          return (
            <mesh key={i} position={[Math.cos(a) * r, size * 0.22, Math.sin(a) * r]} castShadow>
              <cylinderGeometry args={[size * 0.025, size * 0.04, size * 0.44, 5]} />
              <meshStandardMaterial color={c} roughness={0.8} />
            </mesh>
          )
        })}
        {/* center tentacles */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.08, size * 0.28, Math.sin(a) * size * 0.08]} castShadow>
              <cylinderGeometry args={[size * 0.02, size * 0.03, size * 0.52, 5]} />
              <meshStandardMaterial color="#ff99bb" roughness={0.75} />
            </mesh>
          )
        })}
      </group>
      {/* mouth opening */}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 8, 6]} />
        <meshStandardMaterial color="#cc2244" roughness={0.9} />
      </mesh>
    </group>
  )
}

function SeaTurtle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const swimRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (swimRef.current) {
      swimRef.current.position.y = Math.sin(clock.elapsedTime * 0.8) * size * 0.06
      swimRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.08
    }
  })
  const c = color || '#48a887'
  return (
    <group position={pos}>
      <group ref={swimRef}>
        {/* shell */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <sphereGeometry args={[size * 0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={c} roughness={0.65} />
        </mesh>
        {/* shell pattern */}
        {[[0,0],[0.18,0.12],[-0.18,0.12],[0.1,-0.18],[-0.1,-0.18]].map(([x,z],i)=>(
          <mesh key={i} position={[x*size, size*0.44, z*size]} castShadow>
            <boxGeometry args={[size*0.12, size*0.04, size*0.12]} />
            <meshStandardMaterial color="#2d7a5a" roughness={0.7} />
          </mesh>
        ))}
        {/* head */}
        <mesh position={[size * 0.38, size * 0.26, 0]} castShadow>
          <sphereGeometry args={[size * 0.14, 10, 8]} />
          <meshStandardMaterial color="#3a8060" roughness={0.65} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[size*0.48, size*0.32, s*size*0.06]} castShadow>
            <sphereGeometry args={[size*0.03, 6, 4]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
        ))}
        {/* flippers */}
        {[[-0.12, 0.2, 0.34], [-0.12, 0.2, -0.34], [0.12, 0.2, 0.3], [0.12, 0.2, -0.3]].map(([x,y,z],i)=>(
          <mesh key={i} position={[x*size, y*size, z*size]} rotation={[0.3, 0, z>0 ? -0.4 : 0.4]} castShadow>
            <boxGeometry args={[size*0.26, size*0.06, size*0.16]} />
            <meshStandardMaterial color="#3a8060" roughness={0.7} />
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[-size * 0.36, size * 0.22, 0]} rotation={[0, 0, 0.15]} castShadow>
          <coneGeometry args={[size * 0.08, size * 0.22, 6]} />
          <meshStandardMaterial color="#3a8060" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Whale({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const swimRef = useRef<THREE.Group>(null!)
  const tailRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (swimRef.current) swimRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * size * 0.08
    if (tailRef.current) tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.0) * 0.25
  })
  const c = color || '#2c3e6e'
  return (
    <group position={pos}>
      <group ref={swimRef}>
        {/* main body */}
        <mesh position={[0, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.55, 16, 10]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* head bulge */}
        <mesh position={[size * 0.48, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.36, 12, 8]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* belly (lighter color) */}
        <mesh position={[size * 0.1, size * 0.12, 0]} castShadow>
          <sphereGeometry args={[size * 0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          <meshStandardMaterial color="#c8d8e8" roughness={0.6} />
        </mesh>
        {/* tail stock */}
        <mesh position={[-size * 0.58, size * 0.38, 0]} rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[size * 0.18, size * 0.28, size * 0.5, 10]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* tail fluke */}
        <mesh ref={tailRef} position={[-size * 0.82, size * 0.38, 0]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.08, size * 0.7]} />
          <meshStandardMaterial color={c} roughness={0.65} />
        </mesh>
        {/* dorsal fin */}
        <mesh position={[-size * 0.12, size * 0.82, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[size * 0.1, size * 0.28, 6]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* pectoral fins */}
        {[-1, 1].map((s, i) => (
          <mesh key={i} position={[size * 0.28, size * 0.2, s * size * 0.52]} rotation={[s * 0.4, 0, s * 0.3]} castShadow>
            <boxGeometry args={[size * 0.36, size * 0.06, size * 0.16]} />
            <meshStandardMaterial color={c} roughness={0.65} />
          </mesh>
        ))}
        {/* eye */}
        <mesh position={[size * 0.72, size * 0.46, size * 0.22]} castShadow>
          <sphereGeometry args={[size * 0.06, 8, 6]} />
          <meshStandardMaterial color="#fff" roughness={0.3} />
        </mesh>
        <mesh position={[size * 0.74, size * 0.46, size * 0.24]} castShadow>
          <sphereGeometry args={[size * 0.04, 8, 6]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
        {/* blowhole spout */}
        <mesh position={[size * 0.18, size * 0.96, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.3, 6]} />
          <meshStandardMaterial color="#88ddff" transparent opacity={0.7} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// FAIRGROUND
// ═══════════════════════════════════════════════════════════

function PopcornStand({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* cart body */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.7, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.55} />
      </mesh>
      {/* glass case front */}
      <mesh position={[0, size * 0.55, size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.64, size * 0.54, size * 0.04]} />
        <meshStandardMaterial color="#88ccff" roughness={0.05} transparent opacity={0.65} />
      </mesh>
      {/* popcorn pile inside */}
      {[[-0.12,0.6,0.06],[0.12,0.62,0.04],[0,0.64,0.05],[-0.06,0.56,0.08],[0.16,0.58,0.06]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x*size, y*size, z*size]} castShadow>
          <sphereGeometry args={[size*0.07, 5, 4]} />
          <meshStandardMaterial color="#ffe566" roughness={0.85} />
        </mesh>
      ))}
      {/* roof canopy stripes */}
      {Array.from({length:6}).map((_,i)=>(
        <mesh key={i} position={[(-0.25+i*0.1)*size, size*0.82, 0]} castShadow>
          <boxGeometry args={[size*0.08, size*0.08, size*0.58]} />
          <meshStandardMaterial color={i%2===0 ? c : '#fff'} roughness={0.6} />
        </mesh>
      ))}
      {/* wheels */}
      {[-1,1].map((s,i)=>(
        <mesh key={i} position={[s*size*0.28, size*0.1, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
          <cylinderGeometry args={[size*0.1, size*0.1, size*0.54, 10]} />
          <meshStandardMaterial color="#555" roughness={0.7} />
        </mesh>
      ))}
      {/* sign */}
      <mesh position={[0, size*0.96, 0]} castShadow>
        <boxGeometry args={[size*0.52, size*0.16, size*0.06]} />
        <meshStandardMaterial color="#fff5cc" roughness={0.7} />
      </mesh>
    </group>
  )
}

function BumperCar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.15
    }
  })
  const c = color || '#ffd644'
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {/* car body */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.68, size * 0.32, size * 0.52]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.15} />
        </mesh>
        {/* bumper rim (rubber) */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <boxGeometry args={[size * 0.76, size * 0.18, size * 0.6]} />
          <meshStandardMaterial color="#333" roughness={0.9} />
        </mesh>
        {/* seat backrest */}
        <mesh position={[-size * 0.12, size * 0.54, 0]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.32, size * 0.36]} />
          <meshStandardMaterial color={c} roughness={0.45} />
        </mesh>
        {/* steering wheel */}
        <mesh position={[size * 0.12, size * 0.6, 0]} rotation={[0.5, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.1, size * 0.025, 6, 12]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* pole/antenna */}
        <mesh position={[0, size * 1.0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 1.0, 6]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* top contact disc */}
        <mesh position={[0, size * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.08, size * 0.03, 6, 10]} />
          <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* floor wheels (4) */}
        {[[-0.26,-0.26],[0.26,-0.26],[-0.26,0.26],[0.26,0.26]].map(([x,z],i)=>(
          <mesh key={i} position={[x*size, size*0.07, z*size]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <cylinderGeometry args={[size*0.07, size*0.07, size*0.06, 8]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function TicketBooth({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a29bfe'
  return (
    <group position={pos}>
      {/* base structure */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.58, size * 1.2, size * 0.52]} />
        <meshStandardMaterial color={c} roughness={0.55} />
      </mesh>
      {/* roof */}
      <mesh position={[0, size * 1.28, 0]} castShadow>
        <boxGeometry args={[size * 0.66, size * 0.14, size * 0.6]} />
        <meshStandardMaterial color="#7a6ace" roughness={0.5} />
      </mesh>
      {/* roof overhang front */}
      <mesh position={[0, size * 1.24, size * 0.32]} castShadow>
        <boxGeometry args={[size * 0.66, size * 0.06, size * 0.16]} />
        <meshStandardMaterial color="#7a6ace" roughness={0.5} />
      </mesh>
      {/* ticket window */}
      <mesh position={[0, size * 0.72, size * 0.27]} castShadow>
        <boxGeometry args={[size * 0.36, size * 0.24, size * 0.04]} />
        <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* ticket slot ledge */}
      <mesh position={[0, size * 0.54, size * 0.28]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.06, size * 0.14]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* TICKETS sign */}
      <mesh position={[0, size * 1.06, size * 0.27]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.14, size * 0.04]} />
        <meshStandardMaterial color="#ffea00" roughness={0.5} />
      </mesh>
      {/* stripe decoration */}
      {[-0.24, 0, 0.24].map((x, i) => (
        <mesh key={i} position={[x*size, size*0.24, size*0.27]} castShadow>
          <boxGeometry args={[size*0.06, size*0.44, size*0.03]} />
          <meshStandardMaterial color={i%2===0 ? '#fff' : c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function BalloonArch({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.children.forEach((child, i) => {
        (child as THREE.Group).position.y += Math.sin(clock.elapsedTime * 1.5 + i * 0.4) * 0.002 * size
      })
    }
  })
  const colors = ['#ff5464','#ffd644','#48c774','#4c97ff','#c879ff','#ff9f43']
  const archPositions: Array<[number, number, number]> = []
  const N = 12
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const x = (t - 0.5) * 2 * size * 0.9
    const y = size * (0.9 - 4 * (t - 0.5) ** 2 * 0.8)
    archPositions.push([x, y, 0])
  }
  return (
    <group position={pos}>
      <group ref={bobRef}>
        {archPositions.map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            {/* main balloon */}
            <mesh castShadow>
              <sphereGeometry args={[size * 0.13, 10, 8]} />
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.45} />
            </mesh>
            {/* small accent balloon */}
            {i % 2 === 0 && (
              <mesh position={[0, -size * 0.2, 0]} castShadow>
                <sphereGeometry args={[size * 0.09, 8, 6]} />
                <meshStandardMaterial color={colors[(i + 2) % colors.length]} roughness={0.45} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

function PrizeWheel({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (wheelRef.current) wheelRef.current.rotation.z += dt * 0.5 })
  const c = color || '#6c5ce7'
  const segColors = ['#ff5464','#ffd644','#48c774','#4c97ff','#c879ff','#ff9f43','#ff5464','#ffd644']
  return (
    <group position={pos}>
      {/* support stand */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 1.2, size * 0.12]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* base foot */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.32]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* spinning wheel */}
      <group ref={wheelRef} position={[0, size * 1.25, size * 0.08]}>
        {/* rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[size * 0.5, size * 0.05, 8, 28]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* colored segments */}
        {segColors.map((sc, i) => {
          const a = (i / segColors.length) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.3, Math.sin(a) * size * 0.3, 0]} rotation={[0, 0, a]} castShadow>
              <boxGeometry args={[size * 0.52, size * 0.12, size * 0.05]} />
              <meshStandardMaterial color={sc} roughness={0.5} />
            </mesh>
          )
        })}
        {/* spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} rotation={[0, 0, a]} castShadow>
              <boxGeometry args={[size * 0.98, size * 0.04, size * 0.04]} />
              <meshStandardMaterial color="#aaa" roughness={0.3} metalness={0.5} />
            </mesh>
          )
        })}
        {/* hub */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.1, 10]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.4} />
        </mesh>
      </group>
      {/* pointer */}
      <mesh position={[size * 0.52, size * 1.25, size * 0.1]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[size * 0.05, size * 0.16, 4]} />
        <meshStandardMaterial color="#e84040" roughness={0.4} />
      </mesh>
    </group>
  )
}
