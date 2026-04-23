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

    // ─── Nordic/Viking ───
    case 'longship':
      return <Longship pos={pos} color={color} size={size} />
    case 'runestone':
      return <Runestone pos={pos} color={color} size={size} />
    case 'viking-helmet':
      return <VikingHelmet pos={pos} color={color} size={size} />
    case 'mead-hall':
      return <MeadHall pos={pos} color={color} size={size} />
    case 'axe-rack':
      return <AxeRack pos={pos} color={color} size={size} />

    // ─── Magical Forest ───
    case 'fairy-ring':
      return <FairyRing pos={pos} color={color} size={size} />
    case 'giant-mushroom':
      return <GiantMushroom pos={pos} color={color} size={size} />
    case 'crystal-tree':
      return <CrystalTree pos={pos} color={color} size={size} />
    case 'wizard-hat':
      return <WizardHat pos={pos} color={color} size={size} />
    case 'potion-stand':
      return <PotionStand pos={pos} color={color} size={size} />

    // ─── Industrial ───
    case 'factory-chimney':
      return <FactoryChimney pos={pos} color={color} size={size} />
    case 'conveyor-belt':
      return <ConveyorBelt pos={pos} color={color} size={size} />
    case 'robot-arm':
      return <RobotArm pos={pos} color={color} size={size} />
    case 'oil-drum':
      return <OilDrum pos={pos} color={color} size={size} />
    case 'crane':
      return <Crane pos={pos} color={color} size={size} />

    // ─── Retro ───
    case 'arcade-machine':
      return <ArcadeMachine pos={pos} color={color} size={size} />
    case 'retro-tv':
      return <RetroTv pos={pos} color={color} size={size} />
    case 'cassette-tape':
      return <CassetteTape pos={pos} color={color} size={size} />
    case 'game-controller':
      return <GameController pos={pos} color={color} size={size} />
    case 'pixel-heart':
      return <PixelHeart pos={pos} color={color} size={size} />

    // ─── Nature 2 ───
    case 'waterfall':
      return <Waterfall pos={pos} color={color} size={size} />
    case 'lotus-pond':
      return <LotusPond pos={pos} color={color} size={size} />
    case 'volcano':
      return <Volcano pos={pos} color={color} size={size} />
    case 'geyser':
      return <Geyser pos={pos} color={color} size={size} />
    case 'cave-entrance':
      return <CaveEntrance pos={pos} color={color} size={size} />

    // ─── Dinosaurs ───
    case 't-rex':
      return <TRex pos={pos} color={color} size={size} />
    case 'triceratops':
      return <Triceratops pos={pos} color={color} size={size} />
    case 'stegosaurus':
      return <Stegosaurus pos={pos} color={color} size={size} />
    case 'pterodactyl':
      return <Pterodactyl pos={pos} color={color} size={size} />
    case 'dino-egg':
      return <DinoEgg pos={pos} color={color} size={size} />

    // ─── Western ───
    case 'saloon':
      return <Saloon pos={pos} color={color} size={size} />
    case 'cactus-tall':
      return <CactusTall pos={pos} color={color} size={size} />
    case 'tumbleweed':
      return <Tumbleweed pos={pos} color={color} size={size} />
    case 'wanted-sign':
      return <WantedSign pos={pos} color={color} size={size} />
    case 'horseshoe':
      return <Horseshoe pos={pos} color={color} size={size} />

    // ─── Ice Kingdom ───
    case 'ice-castle':
      return <IceCastle pos={pos} color={color} size={size} />
    case 'ice-spike':
      return <IceSpike pos={pos} color={color} size={size} />
    case 'frozen-tree':
      return <FrozenTree pos={pos} color={color} size={size} />
    case 'snowfort':
      return <Snowfort pos={pos} color={color} size={size} />
    case 'polar-bear':
      return <PolarBear pos={pos} color={color} size={size} />

    // ─── Anime ───
    case 'torii-gate':
      return <ToriiGate pos={pos} color={color} size={size} />
    case 'paper-lantern':
      return <PaperLantern pos={pos} color={color} size={size} />
    case 'sakura-tree':
      return <SakuraTree pos={pos} color={color} size={size} />
    case 'ninja-star':
      return <NinjaStar pos={pos} color={color} size={size} />
    case 'temple-bell':
      return <TempleBell pos={pos} color={color} size={size} />

    // ─── Deep Space ───
    case 'black-hole':
      return <BlackHole pos={pos} color={color} size={size} />
    case 'nebula-cloud':
      return <NebulaCloud pos={pos} color={color} size={size} />
    case 'space-debris':
      return <SpaceDebris pos={pos} color={color} size={size} />
    case 'laser-turret':
      return <LaserTurret pos={pos} color={color} size={size} />
    case 'warp-gate':
      return <WarpGate pos={pos} color={color} size={size} />

    // ─── Magic Effects ───
    case 'fireworks':
      return <Fireworks pos={pos} color={color} size={size} />
    case 'spark-fountain':
      return <SparkFountain pos={pos} color={color} size={size} />
    case 'smoke-cloud':
      return <SmokeCloud pos={pos} color={color} size={size} />
    case 'rainbow-jet':
      return <RainbowJet pos={pos} color={color} size={size} />
    case 'magic-circle':
      return <MagicCircle pos={pos} color={color} size={size} />

    // ─── Superhero ───
    case 'hero-cape':
      return <HeroCape pos={pos} color={color} size={size} />
    case 'hero-mask':
      return <HeroMask pos={pos} color={color} size={size} />
    case 'power-shield':
      return <PowerShield pos={pos} color={color} size={size} />
    case 'hero-statue':
      return <HeroStatue pos={pos} color={color} size={size} />
    case 'energy-core':
      return <EnergyCore pos={pos} color={color} size={size} />

    // ─── Buildings ───
    case 'house-small':
      return <HouseSmall pos={pos} color={color} size={size} />
    case 'apartment':
      return <ApartmentBlock pos={pos} color={color} size={size} />
    case 'skyscraper':
      return <Skyscraper pos={pos} color={color} size={size} />
    case 'cottage':
      return <Cottage pos={pos} color={color} size={size} />
    case 'lighthouse-prop':
      return <LighthouseProp pos={pos} color={color} size={size} />
    case 'castle-wall':
      return <CastleWall pos={pos} color={color} size={size} />
    case 'shop-front':
      return <ShopFront pos={pos} color={color} size={size} />
    case 'school-building':
      return <SchoolBuilding pos={pos} color={color} size={size} />
    case 'barn-big':
      return <BarnBig pos={pos} color={color} size={size} />
    case 'temple-prop':
      return <TempleProp pos={pos} color={color} size={size} />

    // ─── City-2 ───
    case 'hospital':
      return <Hospital pos={pos} color={color} size={size} />
    case 'police-station':
      return <PoliceStation pos={pos} color={color} size={size} />
    case 'fire-station':
      return <FireStation pos={pos} color={color} size={size} />
    case 'library-building':
      return <LibraryBuilding pos={pos} color={color} size={size} />
    case 'park-fountain':
      return <ParkFountain pos={pos} color={color} size={size} />
    case 'bus-stop':
      return <BusStop pos={pos} color={color} size={size} />
    case 'bridge-arch':
      return <BridgeArch pos={pos} color={color} size={size} />
    case 'stadium':
      return <Stadium pos={pos} color={color} size={size} />
    case 'museum':
      return <Museum pos={pos} color={color} size={size} />
    case 'market-stall':
      return <MarketStall pos={pos} color={color} size={size} />

    // ─── Transport-2 ───
    case 'ambulance':
      return <Ambulance pos={pos} color={color} size={size} />
    case 'fire-truck':
      return <FireTruck pos={pos} color={color} size={size} />
    case 'police-car':
      return <PoliceCar pos={pos} color={color} size={size} />
    case 'school-bus':
      return <SchoolBus pos={pos} color={color} size={size} />
    case 'tractor':
      return <Tractor pos={pos} color={color} size={size} />
    case 'submarine-mini':
      return <SubmarineMini pos={pos} color={color} size={size} />
    case 'sailboat':
      return <Sailboat pos={pos} color={color} size={size} />
    case 'hot-air-balloon-2':
      return <HotAirBalloon2 pos={pos} color={color} size={size} />
    case 'cable-car':
      return <CableCar pos={pos} color={color} size={size} />
    case 'monorail':
      return <Monorail pos={pos} color={color} size={size} />

    // ─── Food/Café ───
    case 'cafe-table':
      return <CafeTable pos={pos} color={color} size={size} />
    case 'coffee-cup':
      return <CoffeeCup pos={pos} color={color} size={size} />
    case 'cake-slice':
      return <CakeSlice pos={pos} color={color} size={size} />
    case 'ice-cream-stand':
      return <IceCreamStand pos={pos} color={color} size={size} />
    case 'food-cart':
      return <FoodCart pos={pos} color={color} size={size} />
    case 'pizza-oven':
      return <PizzaOven pos={pos} color={color} size={size} />
    case 'soda-machine':
      return <SodaMachine pos={pos} color={color} size={size} />
    case 'cupcake':
      return <Cupcake pos={pos} color={color} size={size} />
    case 'pretzel':
      return <Pretzel pos={pos} color={color} size={size} />
    case 'hot-dog-stand':
      return <HotDogStand pos={pos} color={color} size={size} />

    // ─── Sports-2 ───
    case 'swimming-pool':
      return <SwimmingPool pos={pos} color={color} size={size} />
    case 'tennis-court':
      return <TennisCourt pos={pos} color={color} size={size} />
    case 'ski-jump':
      return <SkiJump pos={pos} color={color} size={size} />
    case 'bowling-pin':
      return <BowlingPin pos={pos} color={color} size={size} />
    case 'dartboard':
      return <Dartboard pos={pos} color={color} size={size} />
    case 'golf-hole':
      return <GolfHole pos={pos} color={color} size={size} />
    case 'climbing-wall':
      return <ClimbingWall pos={pos} color={color} size={size} />
    case 'balance-beam':
      return <BalanceBeam pos={pos} color={color} size={size} />
    case 'racing-flag':
      return <RacingFlag pos={pos} color={color} size={size} />
    case 'medal-stand':
      return <MedalStand pos={pos} color={color} size={size} />

    // ─── Space-2 ───
    case 'moon-base':
      return <MoonBase pos={pos} color={color} size={size} />
    case 'space-rover':
      return <SpaceRover pos={pos} color={color} size={size} />
    case 'satellite-dish-2':
      return <SatelliteDish2 pos={pos} color={color} size={size} />
    case 'alien-ship':
      return <AlienShip pos={pos} color={color} size={size} />
    case 'cryo-pod':
      return <CryoPod pos={pos} color={color} size={size} />
    case 'space-suit':
      return <SpaceSuit pos={pos} color={color} size={size} />
    case 'meteor-shower':
      return <MeteorShower pos={pos} color={color} size={size} />
    case 'ring-planet':
      return <RingPlanet pos={pos} color={color} size={size} />
    case 'rocket-launch-pad':
      return <RocketLaunchPad pos={pos} color={color} size={size} />
    case 'space-cannon':
      return <SpaceCannon pos={pos} color={color} size={size} />

    // Fantasy-2
    case 'wizard-tower':
      return <WizardTower pos={pos} color={color} size={size} />
    case 'dragon-statue':
      return <DragonStatue pos={pos} color={color} size={size} />
    case 'magic-wand':
      return <MagicWand pos={pos} color={color} size={size} />
    case 'spell-book':
      return <SpellBook pos={pos} color={color} size={size} />
    case 'enchanted-sword':
      return <EnchantedSword pos={pos} color={color} size={size} />
    case 'alchemy-table':
      return <AlchemyTable pos={pos} color={color} size={size} />
    case 'fairy-house':
      return <FairyHouse pos={pos} color={color} size={size} />
    case 'rune-stone-glow':
      return <RuneStoneGlow pos={pos} color={color} size={size} />
    case 'magic-mirror':
      return <MagicMirror pos={pos} color={color} size={size} />
    case 'cursed-chest':
      return <CursedChest pos={pos} color={color} size={size} />

    // Sci-Tech
    case 'hologram-display':
      return <HologramDisplay pos={pos} color={color} size={size} />
    case 'tesla-coil':
      return <TeslaCoil pos={pos} color={color} size={size} />
    case 'dna-helix':
      return <DnaHelix pos={pos} color={color} size={size} />
    case 'laser-beam':
      return <LaserBeam pos={pos} color={color} size={size} />
    case 'computer-terminal':
      return <ComputerTerminal pos={pos} color={color} size={size} />
    case 'reactor-core':
      return <ReactorCore pos={pos} color={color} size={size} />
    case 'data-tower':
      return <DataTower pos={pos} color={color} size={size} />
    case 'magnifying-glass':
      return <MagnifyingGlass pos={pos} color={color} size={size} />
    case 'portal-gun':
      return <PortalGun pos={pos} color={color} size={size} />
    case 'hover-pad':
      return <HoverPad pos={pos} color={color} size={size} />

    // Ocean Park
    case 'jellyfish':
      return <Jellyfish pos={pos} color={color} size={size} />
    case 'clam-shell':
      return <ClamShell pos={pos} color={color} size={size} />
    case 'crab-prop':
      return <CrabProp pos={pos} color={color} size={size} />
    case 'seaweed-tall':
      return <SeaweedTall pos={pos} color={color} size={size} />
    case 'diving-bell':
      return <DivingBell pos={pos} color={color} size={size} />
    case 'reef-rock':
      return <ReefRock pos={pos} color={color} size={size} />
    case 'sea-star':
      return <SeaStar pos={pos} color={color} size={size} />
    case 'manta-ray':
      return <MantaRay pos={pos} color={color} size={size} />
    case 'puffer-fish':
      return <PufferFish pos={pos} color={color} size={size} />
    case 'sunken-ship-bow':
      return <SunkenShipBow pos={pos} color={color} size={size} />

    // Jungle Park
    case 'jungle-bridge':
      return <JungleBridge pos={pos} color={color} size={size} />
    case 'tribal-drum':
      return <TribalDrum pos={pos} color={color} size={size} />
    case 'jungle-flower':
      return <JungleFlower pos={pos} color={color} size={size} />
    case 'tree-giant':
      return <TreeGiant pos={pos} color={color} size={size} />
    case 'parrot-perch':
      return <ParrotPerch pos={pos} color={color} size={size} />
    case 'waterfall-small':
      return <WaterfallSmall pos={pos} color={color} size={size} />
    case 'bamboo-wall':
      return <BambooWall pos={pos} color={color} size={size} />
    case 'frog-statue':
      return <FrogStatue pos={pos} color={color} size={size} />
    case 'temple-ruin':
      return <TempleRuin pos={pos} color={color} size={size} />
    case 'treasure-map-stand':
      return <TreasureMapStand pos={pos} color={color} size={size} />

    // Steampunk
    case 'steam-pipe': return <SteamPipe pos={pos} color={color} size={size} />
    case 'clockwork-gear': return <ClockworkGear pos={pos} color={color} size={size} />
    case 'airship-engine': return <AirshipEngine pos={pos} color={color} size={size} />
    case 'pressure-gauge': return <PressureGauge pos={pos} color={color} size={size} />
    case 'steam-locomotive': return <SteamLocomotive pos={pos} color={color} size={size} />
    case 'cog-tower': return <CogTower pos={pos} color={color} size={size} />
    case 'tesla-lamp': return <TeslaLamp pos={pos} color={color} size={size} />
    case 'brass-telescope': return <BrassTelescope pos={pos} color={color} size={size} />
    case 'steam-vent': return <SteamVent pos={pos} color={color} size={size} />
    case 'dirigible': return <Dirigible pos={pos} color={color} size={size} />
    // Cyberpunk
    case 'neon-billboard': return <NeonBillboard pos={pos} color={color} size={size} />
    case 'cyber-vending': return <CyberVending pos={pos} color={color} size={size} />
    case 'holo-ad': return <HoloAd pos={pos} color={color} size={size} />
    case 'drone-prop': return <DroneProp pos={pos} color={color} size={size} />
    case 'cyberpunk-car': return <CyberpunkCar pos={pos} color={color} size={size} />
    case 'server-rack': return <ServerRack pos={pos} color={color} size={size} />
    case 'cyber-street-lamp': return <CyberStreetLamp pos={pos} color={color} size={size} />
    case 'rain-puddle': return <RainPuddle pos={pos} color={color} size={size} />
    case 'graffiti-wall': return <GraffitiWall pos={pos} color={color} size={size} />
    case 'cyber-trash': return <CyberTrash pos={pos} color={color} size={size} />

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

function ArcheryTarget({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
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
      {[-1, 0, 1].map((_, i) => (
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

function SurfboardRack({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
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

function BalloonArch({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
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

// ─── Nordic/Viking ────────────────────────────────────────

function Longship({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const sailRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (sailRef.current) sailRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.08 })
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* prow (front) */}
      <mesh position={[size * 0.78, size * 0.32, 0]} rotation={[0, 0, 0.5]} castShadow>
        <coneGeometry args={[size * 0.12, size * 0.38, 4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* stern */}
      <mesh position={[-size * 0.78, size * 0.32, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[size * 0.1, size * 0.3, 4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* mast */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.0, 6]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.9} />
      </mesh>
      {/* sail */}
      <group ref={sailRef} position={[0, size * 0.9, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size * 0.06, size * 0.55, size * 0.65]} />
          <meshStandardMaterial color="#d4a843" roughness={0.6} side={2} />
        </mesh>
        {/* sail stripes */}
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[size * 0.04, i * size * 0.16, 0]} castShadow>
            <boxGeometry args={[size * 0.02, size * 0.08, size * 0.66]} />
            <meshStandardMaterial color="#c0392b" roughness={0.6} />
          </mesh>
        ))}
      </group>
      {/* oars */}
      {[-1, 1].map((side) =>
        [-0.4, 0, 0.4].map((xOff, i) => (
          <mesh key={`${side}-${i}`} position={[xOff * size, size * 0.1, side * size * 0.45]} rotation={[0, 0, side * 0.4]} castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.7, 5]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Runestone({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0a0a0'
  return (
    <group position={pos}>
      {/* stone slab */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 1.1, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* rune engravings (darker grooves) */}
      {[0.3, 0.05, -0.25].map((y, i) => (
        <mesh key={i} position={[0, size * y + size * 0.55, size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.04, size * 0.02]} />
          <meshStandardMaterial color="#e8c84a" emissive="#c0a020" emissiveIntensity={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* carved circle */}
      <mesh position={[0, size * 0.85, size * 0.1]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.13, size * 0.025, 6, 20]} />
        <meshStandardMaterial color="#e8c84a" emissive="#c0a020" emissiveIntensity={0.3} roughness={0.6} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.12, size * 0.35]} />
        <meshStandardMaterial color="#888" roughness={0.95} />
      </mesh>
    </group>
  )
}

function VikingHelmet({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#b8b8b8'
  return (
    <group position={pos}>
      {/* dome */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* nose guard */}
      <mesh position={[0, size * 0.38, size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.1, size * 0.28, size * 0.08]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* horns */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.46, size * 0.7, 0]} rotation={[0, 0, side * 0.45]} castShadow>
          <coneGeometry args={[size * 0.07, size * 0.4, 6]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.6} />
        </mesh>
      ))}
      {/* brim */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.48, size * 0.48, size * 0.08, 14]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.35, size * 0.12, 8]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
    </group>
  )
}

function MeadHall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8b5a2b'
  return (
    <group position={pos}>
      {/* walls */}
      <mesh position={[0, size * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size * 0.8, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* roof (pitched) */}
      <mesh position={[0, size * 0.98, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[size * 0.82, size * 0.6, 4]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
      </mesh>
      {/* door */}
      <mesh position={[0, size * 0.28, size * 0.46]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.56, size * 0.05]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>
      {/* windows */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.5, size * 0.46]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.2, size * 0.04]} />
          <meshStandardMaterial color="#ffd88a" emissive="#ffc040" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      ))}
      {/* corner logs */}
      {[[-0.72, 0.46], [0.72, 0.46], [-0.72, -0.46], [0.72, -0.46]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.4, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.82, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function AxeRack({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0522d'
  return (
    <group position={pos}>
      {/* rack frame */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* legs */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.25, 0]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.5, size * 0.08]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* axes */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <group key={i} position={[x * size, size * 0.62, 0]}>
          {/* handle */}
          <mesh castShadow>
            <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.55, 5]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.8} />
          </mesh>
          {/* blade */}
          <mesh position={[size * 0.1, size * 0.22, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[size * 0.22, size * 0.2, size * 0.04]} />
            <meshStandardMaterial color="#b0b8c0" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Magical Forest ───────────────────────────────────────

function FairyRing({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const glowRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (glowRef.current) glowRef.current.rotation.y += 0.008
  })
  const c = color || '#9b59b6'
  const mushroomColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db']
  return (
    <group position={pos}>
      {/* grass ring */}
      <mesh position={[0, size * 0.02, 0]} receiveShadow>
        <torusGeometry args={[size * 0.55, size * 0.12, 4, 28]} />
        <meshStandardMaterial color="#2d8a2d" roughness={0.9} />
      </mesh>
      {/* mushrooms around ring */}
      {mushroomColors.map((mc, i) => {
        const a = (i / mushroomColors.length) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * size * 0.55, 0, Math.sin(a) * size * 0.55]}>
            <mesh position={[0, size * 0.18, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.36, 6]} />
              <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
            </mesh>
            <mesh position={[0, size * 0.42, 0]} castShadow>
              <coneGeometry args={[size * 0.14, size * 0.18, 8]} />
              <meshStandardMaterial color={mc} roughness={0.6} />
            </mesh>
          </group>
        )
      })}
      {/* floating magic particles */}
      <group ref={glowRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.35, size * 0.3 + Math.sin(i) * size * 0.1, Math.sin(a) * size * 0.35]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function GiantMushroom({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (bobRef.current) bobRef.current.position.y = Math.sin(Date.now() * 0.0008) * size * 0.02 })
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* stalk */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.22, size * 1.0, 10]} />
        <meshStandardMaterial color="#f0ece0" roughness={0.7} />
      </mesh>
      {/* gills under cap */}
      <mesh position={[0, size * 1.03, 0]} castShadow>
        <cylinderGeometry args={[size * 0.58, size * 0.18, size * 0.06, 16]} />
        <meshStandardMaterial color="#f5e8d0" roughness={0.8} side={2} />
      </mesh>
      {/* cap */}
      <group ref={bobRef}>
        <mesh position={[0, size * 1.18, 0]} castShadow>
          <sphereGeometry args={[size * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
        {/* white spots */}
        {[[0.2, 0.3, 0.35], [-0.3, 0.25, 0.3], [0.0, 0.15, -0.4], [-0.2, 0.4, -0.2]].map(([dx, dy, dz], i) => (
          <mesh key={i} position={[dx * size, size * 1.18 + dy * size * 0.4, dz * size]} castShadow>
            <sphereGeometry args={[size * 0.07, 6, 6]} />
            <meshStandardMaterial color="#fff" roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function CrystalTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#00d2ff'
  return (
    <group position={pos}>
      {/* trunk (translucent crystal) */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.16, size * 0.9, 6]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} roughness={0.1} metalness={0.3} transparent opacity={0.75} />
      </mesh>
      {/* crystal crown clusters */}
      {[
        [0, 1.1, 0, 0.28, 0.55],
        [0.3, 0.88, 0.2, 0.18, 0.38],
        [-0.28, 0.85, -0.18, 0.16, 0.34],
        [0.18, 0.78, -0.25, 0.14, 0.3],
      ].map(([x, y, z, r, h], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} rotation={[Math.random() * 0.4, i * 1.1, Math.random() * 0.4]} castShadow>
          <cylinderGeometry args={[0, r * size, h * size, 5]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.05} metalness={0.4} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* glow orb at top */}
      <mesh position={[0, size * 1.45, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.2} roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function WizardHat({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const starRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (starRef.current) starRef.current.rotation.y += 0.02 })
  const c = color || '#4a235a'
  return (
    <group position={pos}>
      {/* brim */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.1, 14]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* cone */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <coneGeometry args={[size * 0.38, size * 1.0, 14]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* band */}
      <mesh position={[0, size * 0.16, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.08, 14]} />
        <meshStandardMaterial color="#f8d74a" emissive="#d4a020" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      {/* stars on hat */}
      <group ref={starRef} position={[0, size * 0.7, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.2, 0, Math.sin(a) * size * 0.2]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color="#ffe066" emissive="#ffc000" emissiveIntensity={0.8} roughness={0.2} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function PotionStand({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#8e44ad'
  const bottleColors = ['#27ae60', '#c0392b', '#2980b9', '#e67e22']
  return (
    <group position={pos}>
      {/* table */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.08, size * 0.55]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* table legs */}
      {[[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.19, z * size]} castShadow>
          <boxGeometry args={[size * 0.07, size * 0.38, size * 0.07]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* potion bottles */}
      {bottleColors.map((bc, i) => {
        const x = (i - 1.5) * size * 0.2
        return (
          <group key={i} position={[x, size * 0.52, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.26, 8]} />
              <meshStandardMaterial color={bc} emissive={bc} emissiveIntensity={0.2} roughness={0.3} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, size * 0.17, 0]} castShadow>
              <cylinderGeometry args={[size * 0.04, size * 0.07, size * 0.1, 6]} />
              <meshStandardMaterial color={bc} roughness={0.4} />
            </mesh>
            <mesh position={[0, size * 0.23, 0]} castShadow>
              <cylinderGeometry args={[size * 0.045, size * 0.045, size * 0.06, 6]} />
              <meshStandardMaterial color="#555" roughness={0.5} />
            </mesh>
          </group>
        )
      })}
      {/* sign */}
      <mesh position={[0, size * 0.75, -size * 0.29]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.18, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Industrial ───────────────────────────────────────────

function FactoryChimney({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const smokeRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (smokeRef.current) {
      smokeRef.current.position.y = ((smokeRef.current.position.y - pos[1] - size * 1.3 + size * 0.4) % (size * 0.4)) + size * 1.3
      smokeRef.current.scale.x = smokeRef.current.scale.z = 1 + (smokeRef.current.position.y - pos[1] - size * 1.3) / (size * 0.4) * 0.5
    }
  })
  const c = color || '#8b4513'
  return (
    <group position={pos}>
      {/* chimney stack */}
      <mesh position={[0, size * 0.75, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.3, size * 1.5, 10]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {/* brick bands */}
      {[0.2, 0.5, 0.8].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * 0.31, size * 0.31, size * 0.06, 10]} />
          <meshStandardMaterial color="#5a2a0a" roughness={0.9} />
        </mesh>
      ))}
      {/* top rim */}
      <mesh position={[0, size * 1.52, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.25, size * 0.08, 10]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* smoke puff */}
      <group ref={smokeRef} position={[0, size * 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[size * 0.18, 6, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.9} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.1, size * 0.9]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

function ConveyorBelt({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const beltRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (beltRef.current) {
      beltRef.current.children.forEach((c) => {
        c.position.x -= 0.012 * size
        if (c.position.x < -size * 0.55) c.position.x = size * 0.55
      })
    }
  })
  const c = color || '#444'
  return (
    <group position={pos}>
      {/* belt frame */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <boxGeometry args={[size * 1.3, size * 0.12, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* rollers */}
      {[-0.58, 0.58].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.22, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.56, 8]} rotation-x={Math.PI / 2} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* moving belt surface */}
      <mesh position={[0, size * 0.285, 0]} receiveShadow>
        <boxGeometry args={[size * 1.15, size * 0.04, size * 0.5]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
      {/* belt slats */}
      <group ref={beltRef}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[(i - 3) * size * 0.18, size * 0.3, 0]} castShadow>
            <boxGeometry args={[size * 0.06, size * 0.025, size * 0.5]} />
            <meshStandardMaterial color="#555" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[-0.52, 0.52].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.08, 0]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.16, size * 0.5]} />
          <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function RobotArm({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const armRef = useRef<THREE.Group>(null!)
  const clawRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.001
    if (armRef.current) armRef.current.rotation.y = Math.sin(t * 0.7) * 0.8
    if (clawRef.current) clawRef.current.rotation.z = Math.sin(t * 1.2) * 0.3 - 0.3
  })
  const c = color || '#607d8b'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.32, size * 0.2, 10]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
      </mesh>
      <group ref={armRef}>
        {/* pivot */}
        <mesh position={[0, size * 0.26, 0]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.16, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* lower arm */}
        <mesh position={[0, size * 0.55, 0]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.5, size * 0.14]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* elbow joint */}
        <mesh position={[0, size * 0.82, size * 0.1]} castShadow>
          <sphereGeometry args={[size * 0.1, 8, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* upper arm */}
        <mesh position={[0, size * 1.06, size * 0.2]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.11, size * 0.45, size * 0.11]} />
          <meshStandardMaterial color={c} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* claw */}
        <group ref={clawRef} position={[0, size * 1.32, size * 0.35]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * size * 0.08, 0, size * 0.06]} rotation={[0, 0, side * 0.3]} castShadow>
              <boxGeometry args={[size * 0.05, size * 0.18, size * 0.06]} />
              <meshStandardMaterial color="#37474f" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

function OilDrum({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#2c3e50'
  return (
    <group position={pos}>
      {/* drum body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.76, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size * 0.77, 0]} castShadow>
        <cylinderGeometry args={[size * 0.29, size * 0.29, size * 0.05, 12]} />
        <meshStandardMaterial color="#1a252f" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* bands */}
      {[0.2, 0.55].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <cylinderGeometry args={[size * 0.29, size * 0.29, size * 0.05, 12]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* label */}
      <mesh position={[size * 0.28, size * 0.38, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[size * 0.2, size * 0.25, size * 0.01]} />
        <meshStandardMaterial color="#e8c84a" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Crane({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const hookRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (hookRef.current) hookRef.current.position.y = pos[1] + size * 0.6 + Math.sin(Date.now() * 0.001) * size * 0.15
  })
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* mast */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 1.6, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* horizontal boom */}
      <mesh position={[size * 0.45, size * 1.6, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.12, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* counterweight boom */}
      <mesh position={[-size * 0.28, size * 1.6, 0]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.1, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* counterweight */}
      <mesh position={[-size * 0.5, size * 1.52, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.22, size * 0.22]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* cable */}
      <mesh position={[size * 0.6, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 1.2, 4]} />
        <meshStandardMaterial color="#555" roughness={0.6} />
      </mesh>
      {/* hook */}
      <group ref={hookRef} position={[size * 0.6, size * 0.6, 0]}>
        <mesh castShadow>
          <torusGeometry args={[size * 0.08, size * 0.025, 5, 12, Math.PI * 1.3]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.1, size * 0.6]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ─── Retro/Arcade ─────────────────────────────────────────

function ArcadeMachine({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2
    }
  })
  const c = color || '#1a1a2e'
  return (
    <group position={pos}>
      {/* cabinet */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 1.2, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* screen bezel */}
      <mesh position={[0, size * 0.9, size * 0.23]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.38, size * 0.05]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.9, size * 0.255]}>
        <boxGeometry args={[size * 0.37, size * 0.3, size * 0.01]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      {/* marquee top */}
      <mesh position={[0, size * 1.18, size * 0.16]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.2, size * 0.22]} />
        <meshStandardMaterial color={color || '#e91e63'} roughness={0.4} emissive={color || '#e91e63'} emissiveIntensity={0.1} />
      </mesh>
      {/* control panel */}
      <mesh position={[0, size * 0.55, size * 0.2]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.28, size * 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      {/* joystick */}
      <mesh position={[-size * 0.1, size * 0.62, size * 0.26]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.1, 6]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* buttons */}
      {[0.05, 0.14, 0.23].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, size * 0.26]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.04, 8]} />
          <meshStandardMaterial color={['#e74c3c', '#27ae60', '#2980b9'][i]} roughness={0.3} emissive={['#e74c3c', '#27ae60', '#2980b9'][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* base */}
      <mesh position={[0, size * 0.03, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.06, size * 0.5]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
    </group>
  )
}

function RetroTv({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.003) * 0.15
    }
  })
  const c = color || '#c8b99a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.62, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* screen recess */}
      <mesh position={[-size * 0.1, size * 0.5, size * 0.26]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[-size * 0.1, size * 0.5, size * 0.275]}>
        <boxGeometry args={[size * 0.42, size * 0.34, size * 0.01]} />
        <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.4} roughness={0.2} />
      </mesh>
      {/* knobs */}
      {[0.25, 0.3].map((y, i) => (
        <mesh key={i} position={[size * 0.28, y * size + size * 0.3, size * 0.26]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.06, 8]} />
          <meshStandardMaterial color="#555" roughness={0.4} />
        </mesh>
      ))}
      {/* antenna */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.85, size * 0.1]} rotation={[0, 0, x * 3]} castShadow>
          <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.5, 4]} />
          <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      {/* legs */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.07, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.14, size * 0.42]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function CassetteTape({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const reelRef1 = useRef<THREE.Mesh>(null!)
  const reelRef2 = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (reelRef1.current) reelRef1.current.rotation.z += dt * 1.5
    if (reelRef2.current) reelRef2.current.rotation.z += dt * 1.5
  })
  const c = color || '#1a1a1a'
  return (
    <group position={pos} rotation={[Math.PI / 2, 0, 0]}>
      {/* case body */}
      <mesh position={[0, 0, -size * 0.05]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.5, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* label */}
      <mesh position={[0, size * 0.04, -size * -0.003]}>
        <boxGeometry args={[size * 0.55, size * 0.28, size * 0.01]} />
        <meshStandardMaterial color={color || '#e74c3c'} roughness={0.5} />
      </mesh>
      {/* window */}
      <mesh position={[0, -size * 0.1, size * 0.02]}>
        <boxGeometry args={[size * 0.48, size * 0.16, size * 0.01]} />
        <meshStandardMaterial color="#333" roughness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* reels */}
      <mesh ref={reelRef1} position={[-size * 0.17, -size * 0.1, size * 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.04, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh ref={reelRef2} position={[size * 0.17, -size * 0.1, size * 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.04, 12]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  )
}

function GameController({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#222'
  return (
    <group position={pos} rotation={[-0.3, 0, 0]}>
      {/* body */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.16, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* handles */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * size * 0.27, size * 0.15, size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.26, size * 0.22]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      ))}
      {/* d-pad */}
      {[[0, 0], [0.06, 0], [-0.06, 0], [0, 0.06], [0, -0.06]].map(([x, z], i) => (
        <mesh key={i} position={[-size * 0.2 + x * size, size * 0.37, z * size]} castShadow>
          <boxGeometry args={[i === 0 ? size * 0.06 : size * 0.13, size * 0.02, i === 0 ? size * 0.13 : size * 0.06]} />
          <meshStandardMaterial color="#555" roughness={0.4} />
        </mesh>
      ))}
      {/* buttons */}
      {[['#e74c3c', 0.14, 0], ['#27ae60', 0.08, -0.06], ['#2980b9', 0.2, -0.06], ['#f39c12', 0.08, 0.06]].map(([col, x, z], i) => (
        <mesh key={i} position={[size * (x as number), size * 0.37, size * (z as number)]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.03, 8]} />
          <meshStandardMaterial color={col as string} roughness={0.3} emissive={col as string} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* analog sticks */}
      {[[-0.12, -0.04], [0.08, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.37, z * size]} castShadow>
          <cylinderGeometry args={[size * 0.055, size * 0.055, size * 0.03, 10]} />
          <meshStandardMaterial color="#444" roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function PixelHeart({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const heartRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const s = 1 + Math.abs(Math.sin(Date.now() * 0.004)) * 0.12
    if (heartRef.current) heartRef.current.scale.set(s, s, s)
  })
  const c = color || '#e74c3c'
  // pixel art heart grid (5x4)
  const pixels = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ]
  return (
    <group position={pos}>
      <group ref={heartRef} position={[0, size * 0.5, 0]}>
        {pixels.map((row, ri) =>
          row.map((cell, ci) => cell ? (
            <mesh key={`${ri}-${ci}`} position={[(ci - 2) * size * 0.13, (2 - ri) * size * 0.13, 0]} castShadow>
              <boxGeometry args={[size * 0.12, size * 0.12, size * 0.1]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
          ) : null)
        )}
      </group>
    </group>
  )
}

// ─── Nature 2 ─────────────────────────────────────────────

function Waterfall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.55 + Math.sin(Date.now() * 0.004) * 0.1
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* cliff rock */}
      <mesh position={[0, size * 0.72, -size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.8, size * 1.44, size * 0.4]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
      </mesh>
      {/* water stream */}
      <mesh ref={waterRef} position={[0, size * 0.4, size * 0.02]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.8, size * 0.08]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.15} roughness={0.1} transparent opacity={0.65} />
      </mesh>
      {/* splash pool */}
      <mesh position={[0, size * 0.04, size * 0.12]} receiveShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.45, size * 0.08, 12]} />
        <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* foam */}
      <mesh position={[0, size * 0.09, size * 0.12]}>
        <sphereGeometry args={[size * 0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0.5} transparent opacity={0.5} />
      </mesh>
      {/* side rocks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.48, size * 0.18, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.36, size * 0.3]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function LotusPond({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const lilyRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (lilyRef.current) lilyRef.current.rotation.y += 0.003
  })
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* pond water */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.75, size * 0.75, size * 0.1, 16]} />
        <meshStandardMaterial color="#1a7abf" roughness={0.1} transparent opacity={0.75} />
      </mesh>
      {/* pond rim */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <torusGeometry args={[size * 0.75, size * 0.08, 4, 20]} />
        <meshStandardMaterial color="#8b7a5a" roughness={0.8} />
      </mesh>
      {/* lily pads */}
      <group ref={lilyRef}>
        {[0, 1.2, 2.5, 4.0].map((a, i) => (
          <group key={i} position={[Math.cos(a) * size * 0.42, size * 0.1, Math.sin(a) * size * 0.42]}>
            <mesh rotation={[-Math.PI / 2, 0, a]} receiveShadow>
              <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.02, 12]} />
              <meshStandardMaterial color={c} roughness={0.6} />
            </mesh>
            {/* lotus flower */}
            {i % 2 === 0 && (
              <group position={[0, size * 0.06, 0]}>
                {[0, 1, 2, 3, 4].map((pi) => {
                  const pa = (pi / 5) * Math.PI * 2
                  return (
                    <mesh key={pi} position={[Math.cos(pa) * size * 0.08, 0, Math.sin(pa) * size * 0.08]} rotation={[0.4, pa, 0]} castShadow>
                      <coneGeometry args={[size * 0.05, size * 0.12, 4]} />
                      <meshStandardMaterial color="#e91e8c" roughness={0.5} />
                    </mesh>
                  )
                })}
                {/* center */}
                <mesh position={[0, size * 0.04, 0]} castShadow>
                  <sphereGeometry args={[size * 0.04, 6, 6]} />
                  <meshStandardMaterial color="#f8d74a" roughness={0.4} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

function Volcano({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const lavaRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (lavaRef.current) {
      const mat = lavaRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.3
    }
  })
  const c = color || '#5a3020'
  return (
    <group position={pos}>
      {/* volcano body */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <coneGeometry args={[size * 0.75, size * 1.1, 10]} />
        <meshStandardMaterial color={c} roughness={0.95} />
      </mesh>
      {/* crater rim */}
      <mesh position={[0, size * 1.12, 0]} castShadow>
        <torusGeometry args={[size * 0.2, size * 0.08, 6, 14]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.9} />
      </mesh>
      {/* lava pool */}
      <mesh ref={lavaRef} position={[0, size * 1.07, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.06, 10]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff2200" emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      {/* lava drips */}
      {[0.6, 1.4, 2.2, 3.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.2, size * 0.95, Math.sin(a) * size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.06, 5, 5]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2000" emissiveIntensity={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* rocks at base */}
      {[0, 1.1, 2.2, 3.3, 4.4, 5.5].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.62, size * 0.08, Math.sin(a) * size * 0.62]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.14, size * 0.14]} />
          <meshStandardMaterial color="#4a3020" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function Geyser({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const steamRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.002
    const active = Math.sin(t) > 0.3
    if (steamRef.current) {
      steamRef.current.visible = active
      steamRef.current.scale.y = active ? 1 + Math.sin(t * 3) * 0.2 : 1
    }
  })
  const c = color || '#88ccff'
  return (
    <group position={pos}>
      {/* rock mound */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <coneGeometry args={[size * 0.45, size * 0.36, 8]} />
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
      </mesh>
      {/* vent hole */}
      <mesh position={[0, size * 0.36, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.06, 8]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      {/* steam/water jet */}
      <group ref={steamRef} position={[0, size * 0.42, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, i * size * 0.28, 0]}>
            <cylinderGeometry args={[size * (0.12 - i * 0.03), size * (0.1 - i * 0.02), size * 0.3, 6]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.2} roughness={0.2} transparent opacity={0.7 - i * 0.15} />
          </mesh>
        ))}
        <mesh position={[0, size * 0.9, 0]}>
          <sphereGeometry args={[size * 0.16, 6, 6]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.3} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* mineral deposits */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.06, Math.sin(a) * size * 0.3]}>
          <boxGeometry args={[size * 0.1, size * 0.08, size * 0.1]} />
          <meshStandardMaterial color="#c8b88a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function CaveEntrance({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* cliff face */}
      <mesh position={[0, size * 0.7, -size * 0.25]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size * 1.4, size * 0.5]} />
        <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
      </mesh>
      {/* cave opening - dark box inside */}
      <mesh position={[0, size * 0.42, -size * 0.04]}>
        <boxGeometry args={[size * 0.62, size * 0.84, size * 0.38]} />
        <meshStandardMaterial color="#0a0808" roughness={1.0} />
      </mesh>
      {/* arch top */}
      <mesh position={[0, size * 0.88, -size * 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.31, size * 0.31, size * 0.38, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#0a0808" roughness={1.0} />
      </mesh>
      {/* stalactites */}
      {[-0.18, -0.05, 0.12, 0.22].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.88 - i * size * 0.05, -size * 0.06]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.04, size * (0.16 + i * 0.04), 5]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>
      ))}
      {/* ground rocks */}
      {[-0.45, 0.45, -0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.1, size * 0.05]} castShadow>
          <boxGeometry args={[size * (0.15 + i * 0.03), size * 0.2, size * 0.2]} />
          <meshStandardMaterial color="#6a5a4a" roughness={0.95} />
        </mesh>
      ))}
      {/* eerie glow inside */}
      <mesh position={[0, size * 0.42, -size * 0.2]}>
        <sphereGeometry args={[size * 0.15, 6, 6]} />
        <meshStandardMaterial color="#4488ff" emissive="#2244ff" emissiveIntensity={0.6} roughness={0.3} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ─── Dinosaurs ────────────────────────────────────────────

function TRex({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const tailRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (tailRef.current) tailRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.15 })
  const c = color || '#4a7a2a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.55, 0]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.48, size * 0.44, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.85, size * 0.3]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.36, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.0, size * 0.52]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.26, size * 0.42]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, size * 0.9, size * 0.56]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.1, size * 0.36]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* eyes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.14, size * 1.04, size * 0.72]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#ffe000" emissive="#cc8800" emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
      ))}
      {/* tiny arms */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.28, size * 0.65, size * 0.22]} rotation={[0.5, 0, s * 0.5]} castShadow>
          <boxGeometry args={[size * 0.08, size * 0.22, size * 0.08]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.18, size * 0.22, -size * 0.1]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.44, size * 0.2]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail */}
      <group ref={tailRef} position={[0, size * 0.45, -size * 0.38]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.16, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
        <mesh position={[0, -size * 0.04, -size * 0.38]} castShadow>
          <boxGeometry args={[size * 0.1, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function Triceratops({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#6a8a4a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.48, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* frill (neck shield) */}
      <mesh position={[0, size * 0.72, -size * 0.32]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 0.5, size * 0.08]} />
        <meshStandardMaterial color="#b87a4a" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.5, size * 0.5]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.3, size * 0.34]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* horns */}
      {[[-0.14, 0.7, 0.64], [0.14, 0.7, 0.64], [0, 0.6, 0.72]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} rotation={[-0.3, 0, 0]} castShadow>
          <coneGeometry args={[size * 0.05, size * (i === 2 ? 0.18 : 0.3), 6]} />
          <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
        </mesh>
      ))}
      {/* legs */}
      {[[-0.22, 0, 0.28], [0.22, 0, 0.28], [-0.22, 0, -0.28], [0.22, 0, -0.28]].map(([x, _y, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <boxGeometry args={[size * 0.16, size * 0.26, size * 0.18]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail */}
      <mesh position={[0, size * 0.32, -size * 0.5]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.12, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Stegosaurus({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#5a7a3a'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 0.42, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* back plates */}
      {[-0.3, -0.1, 0.1, 0.3].map((z, i) => (
        <mesh key={i} position={[0, size * 0.75 + i % 2 * size * 0.08, z * size]} castShadow>
          <boxGeometry args={[size * 0.06, size * (0.28 + Math.abs(i - 1.5) * 0.06), size * 0.12]} />
          <meshStandardMaterial color="#c87040" roughness={0.7} />
        </mesh>
      ))}
      {/* head */}
      <mesh position={[0, size * 0.32, size * 0.45]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.22, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* legs */}
      {[[-0.18, 0.26], [0.18, 0.26], [-0.18, -0.26], [0.18, -0.26]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.13, z * size]} castShadow>
          <boxGeometry args={[size * 0.14, size * 0.26, size * 0.16]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
      {/* tail spikes */}
      {[-0.5, -0.62].map((z, i) => (
        <mesh key={i} position={[(i % 2 === 0 ? 0.1 : -0.1) * size, size * 0.28, z * size]} rotation={[0, i * 0.5, 0.3]} castShadow>
          <coneGeometry args={[size * 0.05, size * 0.18, 4]} />
          <meshStandardMaterial color="#f0e030" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Pterodactyl({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const wingRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Math.sin(Date.now() * 0.004)
    if (wingRef.current) {
      wingRef.current.children[0].rotation.z = t * 0.35
      wingRef.current.children[1].rotation.z = -t * 0.35
    }
  })
  const c = color || '#7a5a3a'
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      {/* body */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.2, size * 0.24, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.1, size * 0.32]} castShadow>
        <boxGeometry args={[size * 0.16, size * 0.18, size * 0.28]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* crest */}
      <mesh position={[0, size * 0.24, size * 0.2]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.22, size * 0.18]} />
        <meshStandardMaterial color="#c06040" roughness={0.6} />
      </mesh>
      {/* beak */}
      <mesh position={[0, -size * 0.02, size * 0.52]} castShadow>
        <boxGeometry args={[size * 0.08, size * 0.06, size * 0.24]} />
        <meshStandardMaterial color="#d4a844" roughness={0.5} />
      </mesh>
      {/* wings */}
      <group ref={wingRef}>
        <mesh position={[size * 0.45, 0, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[size * 0.8, size * 0.04, size * 0.4]} />
          <meshStandardMaterial color={c} roughness={0.7} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-size * 0.45, 0, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[size * 0.8, size * 0.04, size * 0.4]} />
          <meshStandardMaterial color={c} roughness={0.7} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.08, -size * 0.14, size * 0.05]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.16, size * 0.06]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function DinoEgg({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c8b48a'
  return (
    <group position={pos}>
      {/* nest twigs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.04, Math.sin(a) * size * 0.3]} rotation={[0, a, 0.3]} castShadow>
            <boxGeometry args={[size * 0.06, size * 0.04, size * 0.35]} />
            <meshStandardMaterial color="#8b6a3a" roughness={0.9} />
          </mesh>
        )
      })}
      {/* egg */}
      <mesh position={[0, size * 0.32, 0]} scale={[1, 1.25, 1]} castShadow>
        <sphereGeometry args={[size * 0.26, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* spots */}
      {[[0.18, 0.38, 0.16], [-0.14, 0.28, 0.2], [0.08, 0.42, -0.18]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#8a6838" roughness={0.5} />
        </mesh>
      ))}
      {/* crack hint */}
      <mesh position={[size * 0.1, size * 0.28, size * 0.22]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[size * 0.12, size * 0.03, size * 0.02]} />
        <meshStandardMaterial color="#6a5020" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Western ──────────────────────────────────────────────

function Saloon({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0724a'
  return (
    <group position={pos}>
      {/* main structure */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 1.0, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* facade sign board */}
      <mesh position={[0, size * 1.12, size * 0.41]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.28, size * 0.08]} />
        <meshStandardMaterial color="#6a4020" roughness={0.9} />
      </mesh>
      {/* sign text area */}
      <mesh position={[0, size * 1.12, size * 0.46]} castShadow>
        <boxGeometry args={[size * 0.82, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#f5e8b0" roughness={0.7} />
      </mesh>
      {/* saloon swing doors */}
      {[-0.15, 0.15].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.36, size * 0.42]} castShadow>
          <boxGeometry args={[size * 0.24, size * 0.48, size * 0.05]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
        </mesh>
      ))}
      {/* windows */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.62, size * 0.41]} castShadow>
          <boxGeometry args={[size * 0.28, size * 0.24, size * 0.04]} />
          <meshStandardMaterial color="#ffd88a" emissive="#ffc040" emissiveIntensity={0.2} roughness={0.5} />
        </mesh>
      ))}
      {/* porch posts */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.56, size * 0.65]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 1.12, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* porch roof */}
      <mesh position={[0, size * 1.12, size * 0.64]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.44]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
    </group>
  )
}

function CactusTall({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#3a8a3a'
  return (
    <group position={pos}>
      {/* main trunk */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.17, size * 1.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* left arm */}
      <mesh position={[-size * 0.3, size * 0.72, 0]} rotation={[0, 0, -Math.PI / 3]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.5, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[-size * 0.5, size * 0.95, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.36, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* right arm */}
      <mesh position={[size * 0.3, size * 0.88, 0]} rotation={[0, 0, Math.PI / 3]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.45, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.48, size * 1.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.32, 6]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* spines */}
      {[0.3, 0.6, 0.9, 1.1].map((y, i) => (
        <mesh key={i} position={[size * 0.16, y * size, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[size * 0.012, size * 0.012, size * 0.1, 4]} />
          <meshStandardMaterial color="#f5f0d8" roughness={0.5} />
        </mesh>
      ))}
      {/* flower on top */}
      <mesh position={[0, size * 1.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 4]} />
        <meshStandardMaterial color="#ff9f43" roughness={0.5} emissive="#ff7000" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

function Tumbleweed({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.02
      ref.current.rotation.z += 0.015
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.3, pos[2]]}>
      <group ref={ref}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a1 = (i / 12) * Math.PI * 2
          const a2 = i * 0.9
          return (
            <mesh key={i} position={[Math.cos(a1) * size * 0.2, Math.sin(a2) * size * 0.18, Math.sin(a1) * size * 0.2]} rotation={[a1, a2, 0]} castShadow>
              <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 4]} />
              <meshStandardMaterial color="#c8a87a" roughness={0.9} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function WantedSign({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#f5e8b0'
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.1, 5]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
      </mesh>
      {/* sign board */}
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.75, size * 0.06]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* border */}
      <mesh position={[0, size * 1.05, size * 0.035]} castShadow>
        <boxGeometry args={[size * 0.58, size * 0.68, size * 0.01]} />
        <meshStandardMaterial color="#c8a040" roughness={0.6} />
      </mesh>
      {/* portrait silhouette */}
      <mesh position={[0, size * 1.12, size * 0.04]}>
        <sphereGeometry args={[size * 0.14, 8, 6]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.98, size * 0.04]}>
        <boxGeometry args={[size * 0.22, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      {/* "WANTED" text bar */}
      <mesh position={[0, size * 1.38, size * 0.04]}>
        <boxGeometry args={[size * 0.5, size * 0.1, size * 0.01]} />
        <meshStandardMaterial color="#c03020" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Horseshoe({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#b0a080'
  return (
    <group position={pos} rotation={[-Math.PI / 2, 0, 0]}>
      {/* horseshoe U shape */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.32, size * 0.08, 6, 20, Math.PI * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* nail holes */}
      {[-0.28, -0.14, 0.14, 0.28].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.28, 0]}>
          <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.1, 6]} />
          <meshStandardMaterial color="#555" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Ice Kingdom ──────────────────────────────────────────

function IceCastle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#a0d8ef'
  return (
    <group position={pos}>
      {/* main keep */}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.8, size * 1.1, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.1} metalness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* towers */}
      {[[-0.45, 0.45], [0.45, 0.45], [-0.45, -0.45], [0.45, -0.45]].map(([x, z], i) => (
        <group key={i} position={[x * size, 0, z * size]}>
          <mesh position={[0, size * 0.6, 0]} castShadow>
            <cylinderGeometry args={[size * 0.18, size * 0.2, size * 1.2, 8]} />
            <meshStandardMaterial color={c} roughness={0.1} metalness={0.1} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, size * 1.28, 0]} castShadow>
            <coneGeometry args={[size * 0.2, size * 0.38, 8]} />
            <meshStandardMaterial color="#7ab8d8" roughness={0.05} metalness={0.2} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      {/* battlements */}
      {[-0.28, 0, 0.28].map((x, i) =>
        [[-0.41], [0.41]].map(([z]) => (
          <mesh key={`${i}-${z}`} position={[x * size, size * 1.14, z * size]} castShadow>
            <boxGeometry args={[size * 0.1, size * 0.16, size * 0.1]} />
            <meshStandardMaterial color="#c0e8ff" roughness={0.1} transparent opacity={0.9} />
          </mesh>
        ))
      )}
      {/* main roof */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <coneGeometry args={[size * 0.55, size * 0.5, 4]} />
        <meshStandardMaterial color="#7ab8d8" roughness={0.05} metalness={0.2} transparent opacity={0.9} />
      </mesh>
      {/* gate */}
      <mesh position={[0, size * 0.34, size * 0.41]}>
        <boxGeometry args={[size * 0.22, size * 0.44, size * 0.04]} />
        <meshStandardMaterial color="#0a1a2a" roughness={1.0} />
      </mesh>
    </group>
  )
}

function IceSpike({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#7ab8d8'
  return (
    <group position={pos}>
      {/* main spike */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[0, size * 0.2, size * 1.1, 6]} />
        <meshStandardMaterial color={c} roughness={0.05} metalness={0.2} transparent opacity={0.82} />
      </mesh>
      {/* secondary spikes */}
      {[0.5, 1.1, 1.9, 2.8].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.22, size * 0.22, Math.sin(a) * size * 0.22]} castShadow>
          <cylinderGeometry args={[0, size * 0.1, size * 0.45, 5]} />
          <meshStandardMaterial color={c} roughness={0.05} metalness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* base platform */}
      <mesh position={[0, size * 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.35, size * 0.1, 8]} />
        <meshStandardMaterial color="#c0e8ff" roughness={0.15} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function FrozenTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#c0e0f0'
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.8, 6]} />
        <meshStandardMaterial color="#9ab8d0" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* ice-crusted canopy layers */}
      {[1.0, 0.72, 0.46].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <coneGeometry args={[size * (0.38 - i * 0.06), size * 0.36, 7]} />
          <meshStandardMaterial color={c} roughness={0.1} metalness={0.15} transparent opacity={0.88} />
        </mesh>
      ))}
      {/* icicles hanging */}
      {[0, 0.8, 1.6, 2.4, 3.2, 4.0].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.3, size * 0.62, Math.sin(a) * size * 0.3]} castShadow>
          <cylinderGeometry args={[0, size * 0.04, size * 0.22, 4]} />
          <meshStandardMaterial color="#d8f0ff" roughness={0.05} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Snowfort({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={pos}>
      {/* walls */}
      {[[0, 0.5], [Math.PI / 2, 0.5], [Math.PI, 0.5], [3 * Math.PI / 2, 0.5]].map(([a, r], i) => (
        <mesh key={i} position={[Math.cos(a as number) * size * (r as number), size * 0.22, Math.sin(a as number) * size * (r as number)]} rotation={[0, -(a as number), 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 1.0, size * 0.44, size * 0.14]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.6} />
        </mesh>
      ))}
      {/* battlements */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * size * 0.5, size * 0.52, Math.sin(a) * size * 0.5]} castShadow>
            <boxGeometry args={[size * 0.12, size * 0.16, size * 0.12]} />
            <meshStandardMaterial color="#f0f8ff" roughness={0.5} />
          </mesh>
        )
      })}
      {/* snowballs inside */}
      {[[-0.2, 0, 0.1], [0.2, 0, -0.15], [0, 0, 0.25]].map(([x, y, z], i) => (
        <mesh key={i} position={[x * size, (y as number) * size + size * 0.08, z * size]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function PolarBear({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const headRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (headRef.current) headRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.2 })
  const c = color || '#f0f0f0'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <sphereGeometry args={[size * 0.38, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* head */}
      <group ref={headRef} position={[0, size * 0.75, size * 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[size * 0.24, 10, 8]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
        {/* snout */}
        <mesh position={[0, -size * 0.04, size * 0.2]} castShadow>
          <sphereGeometry args={[size * 0.12, 8, 6]} />
          <meshStandardMaterial color="#e8e0d8" roughness={0.6} />
        </mesh>
        {/* nose */}
        <mesh position={[0, -size * 0.01, size * 0.32]}>
          <sphereGeometry args={[size * 0.04, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* eyes */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * size * 0.1, size * 0.06, size * 0.22]}>
            <sphereGeometry args={[size * 0.04, 5, 5]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
        ))}
        {/* ears */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * size * 0.18, size * 0.2, 0]} castShadow>
            <sphereGeometry args={[size * 0.07, 6, 6]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* legs */}
      {[[-0.24, 0, 0.18], [0.24, 0, 0.18], [-0.24, 0, -0.18], [0.24, 0, -0.18]].map(([x, _y, z], i) => (
        <mesh key={i} position={[x * size, size * 0.12, z * size]} castShadow>
          <sphereGeometry args={[size * 0.14, 7, 6]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Anime/Japanese ───────────────────────────────────────

function ToriiGate({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* columns */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.6, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
      {/* kasagi (top beam curved) */}
      <mesh position={[0, size * 1.24, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* kasagi ends curve upward */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.52, size * 1.3, 0]} rotation={[0, 0, s * 0.18]} castShadow>
          <boxGeometry args={[size * 0.12, size * 0.12, size * 0.14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      ))}
      {/* nuki (lower crossbar) */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.08, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* kusabi (wedges) */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 1.0, size * 0.06]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.14, size * 0.06]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
      {/* base stones */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.04, 0]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.08, size * 0.22]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function PaperLantern({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.2
    }
  })
  const c = color || '#ff7a3a'
  return (
    <group position={pos}>
      {/* string/hook */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.2, 4]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      {/* lantern body */}
      <mesh ref={glowRef} position={[0, size * 0.75, 0]} scale={[1, 1.35, 1]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.5} transparent opacity={0.88} />
      </mesh>
      {/* bands */}
      {[0.55, 0.75, 0.95].map((y, i) => (
        <mesh key={i} position={[0, y * size, 0]} castShadow>
          <torusGeometry args={[size * 0.3, size * 0.025, 5, 16]} />
          <meshStandardMaterial color="#8b2020" roughness={0.5} />
        </mesh>
      ))}
      {/* tassel */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.01, size * 0.25, 4]} />
        <meshStandardMaterial color="#ffd040" roughness={0.6} />
      </mesh>
      {/* top cap */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.3, size * 0.1, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
      {/* bottom cap */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.12, size * 0.1, 8]} />
        <meshStandardMaterial color="#8b2020" roughness={0.5} />
      </mesh>
    </group>
  )
}

function SakuraTree({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const petalRef = useRef<THREE.Group>(null!)
  useFrame(() => { if (petalRef.current) petalRef.current.rotation.y += 0.005 })
  const c = color || '#ffb7c5'
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.76, 7]} />
        <meshStandardMaterial color="#7a4a2a" roughness={0.9} />
      </mesh>
      {/* branches */}
      {[0.6, 1.2, 2.0, 3.0, 4.2, 5.0].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * size * 0.22, size * 0.65 + i * size * 0.04, Math.sin(a) * size * 0.22]} rotation={[0.4, a, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.06, size * 0.45, 5]} />
          <meshStandardMaterial color="#6a3a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* blossom clusters */}
      {[[0, 0.95, 0, 0.32], [0.3, 0.85, 0.2, 0.24], [-0.28, 0.88, -0.2, 0.22], [0.16, 0.78, -0.28, 0.2], [-0.2, 0.82, 0.24, 0.2]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x * size, y * size, z * size]} castShadow>
          <sphereGeometry args={[r * size, 8, 6]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      {/* falling petals */}
      <group ref={petalRef}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          const r = 0.3 + (i % 3) * 0.15
          return (
            <mesh key={i} position={[Math.cos(a) * r * size, size * 0.55 + (i % 4) * size * 0.12, Math.sin(a) * r * size]} rotation={[0.3 * i, a, 0]}>
              <sphereGeometry args={[size * 0.04, 4, 4]} />
              <meshStandardMaterial color={c} roughness={0.5} transparent opacity={0.8} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function NinjaStar({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 3 })
  const c = color || '#888888'
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {[0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4].map((a, i) => (
          <mesh key={i} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[size * 0.7, size * 0.12, size * 0.08]} />
            <meshStandardMaterial color={c} roughness={0.2} metalness={0.8} />
          </mesh>
        ))}
        {/* center */}
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 8]} />
          <meshStandardMaterial color="#666" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

function TempleBell({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const bellRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Math.sin(Date.now() * 0.0008) * 0.1
    if (bellRef.current) bellRef.current.rotation.z = t
  })
  const c = color || '#c8a050'
  return (
    <group position={pos}>
      {/* beam support */}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color="#6b4020" roughness={0.9} />
      </mesh>
      {/* posts */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.68, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.08, size * 1.36, 6]} />
          <meshStandardMaterial color="#6b4020" roughness={0.9} />
        </mesh>
      ))}
      {/* rope */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.4, 4]} />
        <meshStandardMaterial color="#8b6a3a" roughness={0.8} />
      </mesh>
      {/* bell */}
      <group ref={bellRef} position={[0, size * 0.65, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[size * 0.32, size * 0.36, size * 0.55, 12, 1, true]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} side={2} />
        </mesh>
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.32, size * 0.1, 10]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.6} />
        </mesh>
        {/* struck ring */}
        <mesh position={[0, -size * 0.12, 0]} castShadow>
          <torusGeometry args={[size * 0.32, size * 0.03, 6, 16]} />
          <meshStandardMaterial color="#a88030" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Deep Space ───────────────────────────────────────────

function BlackHole({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const diskRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (diskRef.current) diskRef.current.rotation.z += dt * 0.4
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.2
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.6, pos[2]]}>
      {/* accretion disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[size * 0.55, size * 0.22, 4, 32]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      {/* event horizon (dark sphere) */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.28, 12, 10]} />
        <meshStandardMaterial color="#000000" roughness={1.0} />
      </mesh>
      {/* gravitational lens glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 0.35, 10, 8]} />
        <meshStandardMaterial color="#8040ff" emissive="#4020aa" emissiveIntensity={0.5} roughness={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function NebulaCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002 })
  const c = color || '#7040c0'
  const colors = [c, '#ff6080', '#4080ff', '#ff8040', '#40ffaa']
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2
          const r = (0.2 + (i % 3) * 0.18) * size
          const y = (Math.sin(i * 1.3) * 0.3) * size
          return (
            <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
              <sphereGeometry args={[size * (0.18 + (i % 3) * 0.08), 5, 5]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={0.4}
                roughness={0.3}
                transparent
                opacity={0.45 + (i % 3) * 0.1}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

function SpaceDebris({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.x += dt * 0.3; ref.current.rotation.y += dt * 0.2 } })
  const c = color || '#707070'
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={ref}>
        {/* main chunk */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.45, size * 0.3, size * 0.38]} />
          <meshStandardMaterial color={c} roughness={0.7} metalness={0.3} />
        </mesh>
        {/* fragments */}
        {[[0.3, 0.2, 0.1], [-0.28, 0.18, -0.12], [0.1, -0.22, 0.24], [-0.15, 0.2, 0.28]].map(([x, y, z], i) => (
          <mesh key={i} position={[x * size, y * size, z * size]} castShadow>
            <boxGeometry args={[size * 0.16, size * 0.12, size * 0.14]} />
            <meshStandardMaterial color={c} roughness={0.7} metalness={0.3} />
          </mesh>
        ))}
        {/* solar panel remnant */}
        <mesh position={[size * 0.45, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.4, size * 0.02, size * 0.25]} />
          <meshStandardMaterial color="#1a3a7a" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* wire */}
        <mesh position={[size * 0.28, size * 0.08, 0]} castShadow>
          <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.35, 4]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

function LaserTurret({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const turretRef = useRef<THREE.Group>(null!)
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const t = Date.now() * 0.001
    if (turretRef.current) turretRef.current.rotation.y = Math.sin(t * 0.8) * 1.2
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshStandardMaterial
      const firing = Math.sin(t * 4) > 0.7
      mat.opacity = firing ? 0.9 : 0
    }
  })
  const c = color || '#00ff88'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.35, size * 0.2, 8]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* pivot */}
      <mesh position={[0, size * 0.26, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.12, 8]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* rotating turret head */}
      <group ref={turretRef} position={[0, size * 0.36, 0]}>
        <mesh castShadow>
          <boxGeometry args={[size * 0.4, size * 0.24, size * 0.4]} />
          <meshStandardMaterial color="#444" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* barrel */}
        <mesh position={[0, 0, size * 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.05, size * 0.07, size * 0.5, 6]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* laser glow ring */}
        <mesh position={[0, 0, size * 0.54]}>
          <torusGeometry args={[size * 0.05, size * 0.02, 5, 10]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.0} roughness={0.1} />
        </mesh>
        {/* laser beam */}
        <mesh ref={beamRef} position={[0, 0, size * 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.7, 4]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2.0} roughness={0.1} transparent opacity={0} />
        </mesh>
      </group>
    </group>
  )
}

function WarpGate({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const innerRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (innerRef.current) innerRef.current.rotation.z += dt * 1.2
    if (ringRef.current) ringRef.current.rotation.z -= dt * 0.4
  })
  const c = color || '#4488ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      {/* outer ring */}
      <mesh castShadow>
        <torusGeometry args={[size * 0.65, size * 0.08, 8, 32]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* inner energy ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[size * 0.5, size * 0.04, 6, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* swirling portal */}
      <mesh ref={innerRef}>
        <torusGeometry args={[size * 0.35, size * 0.32, 4, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} roughness={0.2} transparent opacity={0.65} />
      </mesh>
      {/* center glow */}
      <mesh>
        <sphereGeometry args={[size * 0.22, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={c} emissiveIntensity={0.6} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* support legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.65, -size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * 0.1, size * 1.1, size * 0.1]} />
          <meshStandardMaterial color="#666" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* foot plates */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.65, -size * 1.06, 0]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.08, size * 0.3]} />
          <meshStandardMaterial color="#555" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Magic Effects ────────────────────────────────────────

function Fireworks({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = (Date.now() % 2000) / 2000
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = (t + i / ref.current.children.length) % 1
        const r = phase * size * 0.8
        const a = i * 1.618 * Math.PI * 2
        child.position.x = Math.cos(a) * r
        child.position.y = phase * size * 0.9 + pos[1]
        child.position.z = Math.sin(a) * r
        const s = phase < 0.5 ? phase * 2 : (1 - phase) * 2
        child.scale.setScalar(s * 0.8 + 0.1)
      })
    }
  })
  const c = color || '#ff5464'
  const colors = [c, '#ffd644', '#48c774', '#4c97ff', '#c879ff', '#ff8c1a', '#ff5ab1']
  return (
    <group>
      {/* launch tube */}
      <mesh position={[pos[0], pos[1] + size * 0.15, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.09, size * 0.3, 6]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* sparks */}
      <group ref={ref}>
        {colors.map((sc, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.06, 4, 4]} />
            <meshStandardMaterial color={sc} emissive={sc} emissiveIntensity={1.0} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function SparkFountain({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.003
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = ((t + i * 0.3) % 2.5) / 2.5
        const a = i * 0.8
        const r = Math.sin(phase * Math.PI) * size * 0.5
        child.position.x = pos[0] + Math.cos(a) * r
        child.position.y = pos[1] + phase * size * 1.1
        child.position.z = pos[2] + Math.sin(a) * r
        child.scale.setScalar(1 - phase * 0.8)
      })
    }
  })
  const c = color || '#ffd644'
  return (
    <group>
      {/* base */}
      <mesh position={[pos[0], pos[1] + size * 0.08, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.16, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* sparks */}
      <group ref={ref}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.04, 4, 4]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.2} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function SmokeCloud({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        child.position.y = pos[1] + size * 0.3 + (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * size * 0.3
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        mat.opacity = 0.25 + Math.sin(Date.now() * 0.002 + i * 0.8) * 0.1
      })
    }
  })
  const c = color || '#aaaaaa'
  return (
    <group>
      <group ref={ref}>
        {[
          [0, 0], [size * 0.25, 0.1], [-size * 0.22, 0.15], [size * 0.12, 0.25],
          [-size * 0.1, 0.3], [size * 0.3, 0.2],
        ].map(([x, yOff], i) => (
          <mesh key={i} position={[pos[0] + (x as number), pos[1] + size * 0.3 + (yOff as number) * size, pos[2] + (i % 2 === 0 ? 0.1 : -0.1) * size]}>
            <sphereGeometry args={[size * (0.22 + (i % 3) * 0.08), 6, 5]} />
            <meshStandardMaterial color={c} roughness={0.9} transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function RainbowJet({ pos, size }: { pos: [number, number, number]; color: string; size: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(() => {
    const t = Date.now() * 0.003
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const phase = ((t + i * 0.2) % 3) / 3
        const a = i * 0.7
        child.position.x = pos[0] + Math.cos(a + t * 0.5) * phase * size * 0.4
        child.position.y = pos[1] + phase * size * 1.2
        child.position.z = pos[2] + Math.sin(a + t * 0.5) * phase * size * 0.4
        child.scale.setScalar(0.5 + phase * 0.8)
      })
    }
  })
  const rainbow = ['#ff5464', '#ff8c1a', '#ffd644', '#48c774', '#4c97ff', '#c879ff']
  return (
    <group>
      {/* nozzle */}
      <mesh position={[pos[0], pos[1] + size * 0.12, pos[2]]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.24, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
      <group ref={ref}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[size * 0.05, 4, 4]} />
            <meshStandardMaterial color={rainbow[i % rainbow.length]} emissive={rainbow[i % rainbow.length]} emissiveIntensity={0.8} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function MagicCircle({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const outerRef = useRef<THREE.Mesh>(null!)
  const innerRef = useRef<THREE.Mesh>(null!)
  const orbRef = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    if (outerRef.current) outerRef.current.rotation.y += dt * 0.8
    if (innerRef.current) innerRef.current.rotation.y -= dt * 1.2
    if (orbRef.current) orbRef.current.rotation.y += dt * 2
  })
  const c = color || '#c879ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.06, pos[2]]}>
      {/* ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[size * 0.7, 32]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.5} transparent opacity={0.4} />
      </mesh>
      {/* outer ring */}
      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.65, size * 0.04, 4, 32]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* inner ring */}
      <mesh ref={innerRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.4, size * 0.03, 4, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* runes (small orbs on outer ring) */}
      <group ref={orbRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * size * 0.65, size * 0.04, Math.sin(a) * size * 0.65]}>
              <sphereGeometry args={[size * 0.06, 5, 5]} />
              <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.0} roughness={0.1} />
            </mesh>
          )
        })}
      </group>
      {/* center glow */}
      <mesh position={[0, size * 0.08, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.5} roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

// ─── Superhero ────────────────────────────────────────────

function HeroCape({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const capeRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (capeRef.current) {
      const t = Date.now() * 0.002
      capeRef.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t + i * 0.3) * 0.08
      })
    }
  })
  const c = color || '#e84040'
  return (
    <group position={pos}>
      {/* stand/mannequin torso */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.15, size * 0.18, size * 0.7, 8]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 0.94, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.18, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.14, 8, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* shoulders */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.22, size * 0.82, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
        </mesh>
      ))}
      {/* cape (layered panels) */}
      <group ref={capeRef} position={[0, size * 0.84, -size * 0.05]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[size * 0.55, size * 0.72, size * 0.04]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        <mesh position={[0, -size * 0.36, size * 0.04]} castShadow>
          <boxGeometry args={[size * 0.5, size * 0.1, size * 0.04]} />
          <meshStandardMaterial color="#8b0000" roughness={0.5} />
        </mesh>
      </group>
      {/* logo symbol */}
      <mesh position={[0, size * 0.62, size * 0.16]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#ffd644" emissive="#ffa000" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} castShadow>
        <cylinderGeometry args={[size * 0.25, size * 0.28, size * 0.1, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

function HeroMask({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* display stand */}
      <mesh position={[0, size * 0.32, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.64, 6]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.64, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 8, 6]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.6} />
      </mesh>
      {/* mask */}
      <mesh position={[0, size * 0.68, size * 0.18]} castShadow>
        <boxGeometry args={[size * 0.44, size * 0.26, size * 0.1]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* eye holes */}
      {[-0.13, 0.13].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.7, size * 0.24]}>
          <boxGeometry args={[size * 0.1, size * 0.07, size * 0.02]} />
          <meshStandardMaterial color="#000" roughness={1.0} />
        </mesh>
      ))}
      {/* ear wings */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * size * 0.25, size * 0.76, size * 0.14]} rotation={[0, 0, s * 0.5]} castShadow>
          <coneGeometry args={[size * 0.06, size * 0.18, 3]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      ))}
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.25, size * 0.08, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

function PowerShield({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const shieldRef = useRef<THREE.Mesh>(null!)
  const rimRef = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (shieldRef.current) {
      const mat = shieldRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.15
    }
    if (rimRef.current) rimRef.current.rotation.z += dt * 0.5
  })
  const c = color || '#4488ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.55, pos[2]]}>
      {/* shield face */}
      <mesh ref={shieldRef} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.75, size * 0.08]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.2} metalness={0.3} transparent opacity={0.85} />
      </mesh>
      {/* energy rim */}
      <mesh ref={rimRef}>
        <torusGeometry args={[size * 0.38, size * 0.04, 5, 24]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.0} roughness={0.1} />
      </mesh>
      {/* star/emblem */}
      <mesh position={[0, 0, size * 0.05]}>
        <sphereGeometry args={[size * 0.1, 5, 5]} />
        <meshStandardMaterial color="#fff" emissive="#ffdd00" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      {/* arm grip (back) */}
      <mesh position={[size * 0.15, 0, -size * 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.5, 6]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function HeroStatue({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const c = color || '#888888'
  return (
    <group position={pos}>
      {/* base pedestal */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.2, size * 0.65]} />
        <meshStandardMaterial color="#777" roughness={0.8} />
      </mesh>
      {/* legs */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x * size, size * 0.42, 0]} castShadow>
          <boxGeometry args={[size * 0.18, size * 0.44, size * 0.2]} />
          <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {/* body */}
      <mesh position={[0, size * 0.74, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.46, size * 0.24]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* heroic pose arm up */}
      <mesh position={[size * 0.28, size * 0.95, 0]} rotation={[0, 0, -0.7]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.4, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* other arm */}
      <mesh position={[-size * 0.25, size * 0.78, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[size * 0.14, size * 0.36, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.18, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* cape flowing back */}
      <mesh position={[0, size * 0.88, -size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.5, size * 0.06]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* raised fist */}
      <mesh position={[size * 0.46, size * 1.2, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.12, size * 0.12]} />
        <meshStandardMaterial color={c} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* inscription plaque */}
      <mesh position={[0, size * 0.12, size * 0.33]} castShadow>
        <boxGeometry args={[size * 0.4, size * 0.12, size * 0.02]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  )
}

function EnergyCore({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const coreRef = useRef<THREE.Mesh>(null!)
  const ringRef1 = useRef<THREE.Mesh>(null!)
  const ringRef2 = useRef<THREE.Mesh>(null!)
  const ringRef3 = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => {
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      const pulse = 0.7 + Math.sin(Date.now() * 0.004) * 0.3
      mat.emissiveIntensity = pulse * 1.5
      coreRef.current.scale.setScalar(0.9 + pulse * 0.1)
    }
    if (ringRef1.current) ringRef1.current.rotation.x += dt * 1.5
    if (ringRef2.current) ringRef2.current.rotation.y += dt * 1.2
    if (ringRef3.current) ringRef3.current.rotation.z += dt * 0.9
  })
  const c = color || '#00d2ff'
  return (
    <group position={[pos[0], pos[1] + size * 0.6, pos[2]]}>
      {/* orbital rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[size * 0.45, size * 0.04, 5, 24]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
      <mesh ref={ringRef2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[size * 0.38, size * 0.03, 5, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.1} />
      </mesh>
      <mesh ref={ringRef3} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[size * 0.32, size * 0.025, 5, 18]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* glowing core */}
      <mesh ref={coreRef} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 10]} />
        <meshStandardMaterial color="#fff" emissive={c} emissiveIntensity={1.5} roughness={0.05} metalness={0.1} transparent opacity={0.9} />
      </mesh>
      {/* outer glow shell */}
      <mesh>
        <sphereGeometry args={[size * 0.28, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} roughness={0.2} transparent opacity={0.25} />
      </mesh>
      {/* support stand */}
      <mesh position={[0, -size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.14, size * 0.5, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.08, 8]} />
        <meshStandardMaterial color="#555" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 5 — Buildings & City-2 (20 props)
// ══════════════════════════════════════════════════════════

interface P5 { pos: [number,number,number]; color: string; size: number }

function HouseSmall({ pos, color, size }: P5) {
  const c = color || '#e8d5b0'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.4, size, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <coneGeometry args={[size * 1.05, size * 0.65, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.28, size * 0.61]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.5, size * 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {([-0.38, 0.38] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.55, size * 0.61]} castShadow>
          <boxGeometry args={[size * 0.22, size * 0.22, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[size * 0.45, size * 1.4, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 0.35, size * 0.12]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.6} />
      </mesh>
    </group>
  )
}

function ApartmentBlock({ pos, color, size }: P5) {
  const c = color || '#b8c8d8'
  const floors = 4
  return (
    <group position={pos}>
      <mesh position={[0, size * floors * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * floors, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * floors + size * 0.06, 0]}>
        <boxGeometry args={[size * 1.7, size * 0.12, size * 1.3]} />
        <meshStandardMaterial color="#999" roughness={0.4} />
      </mesh>
      {Array.from({ length: floors }).map((_, row) =>
        ([-0.45, 0, 0.45] as number[]).map((dx, col) => (
          <mesh key={`w${row}-${col}`} position={[size * dx, size * (row + 0.5), size * 0.61]} castShadow>
            <boxGeometry args={[size * 0.24, size * 0.3, size * 0.02]} />
            <meshStandardMaterial color="#f0e8b0" roughness={0.1} emissive="#f0e8b0" emissiveIntensity={0.15} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Skyscraper({ pos, color, size }: P5) {
  const c = color || '#7fb3d3'
  const h = size * 8
  return (
    <group position={pos}>
      <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size, h, size]} />
        <meshStandardMaterial color={c} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[0, h + size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.7, 5]} />
        <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, h + size * 0.75, 0]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={1.2} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[size * 0.51, size * (i + 0.5), 0]}>
          <boxGeometry args={[size * 0.02, size * 0.6, size * 0.7]} />
          <meshStandardMaterial color="#c8e6fa" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Cottage({ pos, color, size }: P5) {
  const c = color || '#f5e6c8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.85, size]} />
        <meshStandardMaterial color={c} roughness={0.75} />
      </mesh>
      <mesh position={[0, size * 0.96, 0]} castShadow>
        <coneGeometry args={[size * 0.92, size * 0.6, 4]} />
        <meshStandardMaterial color="#c8a850" roughness={0.9} />
      </mesh>
      {([-0.15, 0, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.02, size * 0.75 + size * i * 0.18]} receiveShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.04, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[size * 0.42, size * 0.38, size * 0.5]} castShadow>
        <boxGeometry args={[size * 0.3, size * 0.1, size * 0.12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {([-0.1, 0, 0.1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * (0.42 + dx), size * 0.48, size * 0.5]}>
          <sphereGeometry args={[size * 0.06, 5, 5]} />
          <meshStandardMaterial color={(['#ff6b6b','#ffcc00','#ff69b4'] as string[])[i]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function LighthouseProp({ pos, color, size }: P5) {
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (beamRef.current) beamRef.current.rotation.y = clock.getElapsedTime() * 1.5
  })
  const c = color || '#f5f0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.38, size * 3, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([0.8, 1.6, 2.4] as number[]).map((y, i) => (
        <mesh key={i} position={[0, size * y, 0]}>
          <cylinderGeometry args={[size * 0.295, size * 0.35, size * 0.18, 8]} />
          <meshStandardMaterial color="#c0392b" roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, size * 3.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.3, size * 0.4, 8]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh ref={beamRef} position={[0, size * 3.4, 0]}>
        <boxGeometry args={[size * 1.8, size * 0.06, size * 0.06]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, size * 3.4, 0]}>
        <sphereGeometry args={[size * 0.22, 8, 8]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={1.8} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.55, size * 0.12, 8]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
    </group>
  )
}

function CastleWall({ pos, color, size }: P5) {
  const c = color || '#a0a098'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.5, size * 1.2, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      {([-1, -0.5, 0, 0.5, 1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx * 1.1, size * 1.35, 0]} castShadow>
          <boxGeometry args={[size * 0.3, size * 0.35, size * 0.5]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.42, 0]}>
        <boxGeometry args={[size * 0.45, size * 0.84, size * 0.52]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
    </group>
  )
}

function ShopFront({ pos, color, size }: P5) {
  const c = color || '#e8f4e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * 1.4, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.72, size * 0.52]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.08, size * 0.5]} />
        <meshStandardMaterial color={color || '#e74c3c'} roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 1.12, size * 0.46]}>
        <boxGeometry args={[size * 1.1, size * 0.22, size * 0.04]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.55, size * 0.46]}>
        <boxGeometry args={[size * 1.1, size * 0.65, size * 0.04]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, size * 1.46, 0]}>
        <boxGeometry args={[size * 1.65, size * 0.12, size * 0.95]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} />
      </mesh>
    </group>
  )
}

function SchoolBuilding({ pos, color, size }: P5) {
  const c = color || '#fdf6e3'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.2, size * 1.5, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.65} />
      </mesh>
      <mesh position={[0, size * 1.6, 0]} castShadow>
        <coneGeometry args={[size * 1.65, size * 0.5, 4]} />
        <meshStandardMaterial color="#6c5a2e" roughness={0.7} />
      </mesh>
      {([-0.7, 0, 0.7] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.9, size * 0.61]} castShadow>
          <boxGeometry args={[size * 0.32, size * 0.38, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.36, size * 0.61]}>
        <boxGeometry args={[size * 0.35, size * 0.65, size * 0.03]} />
        <meshStandardMaterial color="#3d7ab5" roughness={0.5} />
      </mesh>
      <mesh position={[size * 0.95, size * 1.9, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.8, 5]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[size * 1.12, size * 2.2, 0]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.22, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.7} />
      </mesh>
    </group>
  )
}

function BarnBig({ pos, color, size }: P5) {
  const c = color || '#8B2020'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 1.8, size * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, size * 2.05, 0]} castShadow>
        <boxGeometry args={[size * 2, size * 0.55, size * 1.6]} />
        <meshStandardMaterial color="#5a1010" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 2.28, 0]} castShadow>
        <coneGeometry args={[size * 1.12, size * 0.5, 4]} />
        <meshStandardMaterial color="#5a1010" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.7, size * 0.71]}>
        <boxGeometry args={[size * 0.75, size * 1.3, size * 0.04]} />
        <meshStandardMaterial color="#6B3a12" roughness={0.8} />
      </mesh>
      {([1, -1] as number[]).map((s, i) => (
        <mesh key={i} position={[0, size * 0.7, size * 0.73]} rotation={[0, 0, s * Math.PI / 4]}>
          <boxGeometry args={[size * 1.1, size * 0.05, size * 0.02]} />
          <meshStandardMaterial color="#4a2a08" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.75, size * 0.71]}>
        <boxGeometry args={[size * 0.38, size * 0.32, size * 0.03]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function TempleProp({ pos, color, size }: P5) {
  const c = color || '#d4af6a'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 0.2, size * 2]} />
        <meshStandardMaterial color="#c8b87a" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.3, size * 1.2, size * 1.3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([0, 1] as number[]).map((tier) => (
        <mesh key={tier} position={[0, size * 1.5 + tier * size * 0.55, 0]} castShadow>
          <boxGeometry args={[size * (1.7 - tier * 0.4), size * 0.18, size * (1.7 - tier * 0.4)]} />
          <meshStandardMaterial color="#8B0000" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 2.55, 0]} castShadow>
        <coneGeometry args={[size * 0.18, size * 0.55, 4]} />
        <meshStandardMaterial color="#8B0000" roughness={0.5} />
      </mesh>
      {([[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.2, 8]} />
          <meshStandardMaterial color="#e8d8a0" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Hospital({ pos, color, size }: P5) {
  const c = color || '#f0f0f8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 2.4, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.55, size * 0.68]} castShadow>
        <boxGeometry args={[size * 0.9, size * 1.1, size * 0.3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.8, size * 0.61]}>
        <boxGeometry args={[size * 0.5, size * 0.12, size * 0.04]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 1.8, size * 0.61]}>
        <boxGeometry args={[size * 0.12, size * 0.5, size * 0.04]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      {Array.from({ length: 3 }).map((_, row) =>
        ([-0.6, 0, 0.6] as number[]).map((dx, col) => (
          <mesh key={`h${row}-${col}`} position={[size * dx, size * (row * 0.7 + 0.55), size * 0.61]}>
            <boxGeometry args={[size * 0.28, size * 0.32, size * 0.02]} />
            <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function PoliceStation({ pos, color, size }: P5) {
  const c = color || '#dde8ee'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 1.4, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.47, 0]}>
        <boxGeometry args={[size * 1.85, size * 0.14, size * 1.15]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.9, size * 0.56]}>
        <boxGeometry args={[size * 1.8, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.12, size * 0.56]}>
        <boxGeometry args={[size * 0.8, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.32, size * 0.56]}>
        <boxGeometry args={[size * 0.32, size * 0.58, size * 0.02]} />
        <meshStandardMaterial color="#1a5276" roughness={0.6} />
      </mesh>
    </group>
  )
}

function FireStation({ pos, color, size }: P5) {
  const c = color || '#fff0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2, size * 1.4, size * 1.1]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {([-0.5, 0.5] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.52, size * 0.56]}>
          <boxGeometry args={[size * 0.72, size * 0.96, size * 0.03]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.12, size * 0.56]}>
        <boxGeometry args={[size * 2, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#c0392b" roughness={0.3} />
      </mesh>
      <mesh position={[size * 0.78, size * 1.85, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 1.0, size * 0.4]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh position={[size * 0.78, size * 2.42, 0]}>
        <coneGeometry args={[size * 0.32, size * 0.3, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.47, 0]}>
        <boxGeometry args={[size * 2.05, size * 0.12, size * 1.15]} />
        <meshStandardMaterial color="#aaa" roughness={0.4} />
      </mesh>
    </group>
  )
}

function LibraryBuilding({ pos, color, size }: P5) {
  const c = color || '#f5f0e0'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, size * 0.62]} receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.12, size * 0.4]} />
        <meshStandardMaterial color="#ddd" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 1.6, size * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([-0.55, -0.18, 0.18, 0.55] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * 0.65]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size * 1.6, 8]} />
          <meshStandardMaterial color="#ece8d8" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.76, size * 0.58]} castShadow>
        <coneGeometry args={[size * 1.1, size * 0.45, 3]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.65, 0]}>
        <boxGeometry args={[size * 1.85, size * 0.1, size * 1.25]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
    </group>
  )
}

function ParkFountain({ pos, color, size }: P5) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (waterRef.current) waterRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.9, size * 1.0, size * 0.16, 16]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
      <mesh ref={waterRef} position={[0, size * 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.82, size * 0.82, size * 0.04, 16]} />
        <meshStandardMaterial color={c} roughness={0.1} metalness={0.2} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.7, 8]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      <mesh position={[0, size * 0.85, 0]}>
        <cylinderGeometry args={[size * 0.38, size * 0.42, size * 0.1, 12]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {([0, 90, 180, 270] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.15, size * 0.95, Math.sin(rad) * size * 0.15]}
            rotation={[Math.PI * 0.35, 0, rad + Math.PI / 2]}>
            <cylinderGeometry args={[size * 0.018, size * 0.018, size * 0.32, 5]} />
            <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} emissive={c} emissiveIntensity={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

function BusStop({ pos, color, size }: P5) {
  const c = color || '#2980b9'
  return (
    <group position={pos}>
      <mesh position={[0, size * 1.38, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, size * 0.7, -size * 0.28]} castShadow>
        <boxGeometry args={[size * 1.4, size * 1.3, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.2} transparent opacity={0.5} />
      </mesh>
      {([-0.65, 0.65] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.7, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 1.4, size * 0.06]} />
          <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.28, -size * 0.12]}>
        <boxGeometry args={[size * 1.1, size * 0.08, size * 0.28]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
      {([-0.42, 0.42] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.12, -size * 0.12]}>
          <boxGeometry args={[size * 0.06, size * 0.24, size * 0.06]} />
          <meshStandardMaterial color="#666" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.9, -size * 0.26]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
    </group>
  )
}

function BridgeArch({ pos, color, size }: P5) {
  const c = color || '#a0a098'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 3.5, size * 0.15, size * 0.9]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 1.1, size * 0.12, 5, 24, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {([-1.65, 1.65] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.25, size * 0.7, size * 0.9]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
      {([-0.42, 0.42] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.98, size * dz]} castShadow>
          <boxGeometry args={[size * 3.5, size * 0.07, size * 0.04]} />
          <meshStandardMaterial color="#aaa" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Stadium({ pos, color, size }: P5) {
  const c = color || '#2c8a4a'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <boxGeometry args={[size * 2.4, size * 0.12, size * 1.6]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {([-0.8, 0, 0.8] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.13, 0]}>
          <boxGeometry args={[size * 0.04, size * 0.02, size * 1.6]} />
          <meshStandardMaterial color="#fff" roughness={0.5} />
        </mesh>
      ))}
      {[
        { sp: [0, size * 0.45, size * 1.05] as [number,number,number], rot: [Math.PI * 0.18, 0, 0] as [number,number,number], w: size * 2.6 },
        { sp: [0, size * 0.45, -size * 1.05] as [number,number,number], rot: [-Math.PI * 0.18, 0, 0] as [number,number,number], w: size * 2.6 },
        { sp: [size * 1.4, size * 0.45, 0] as [number,number,number], rot: [0, 0, -Math.PI * 0.18] as [number,number,number], w: size * 1.6 },
        { sp: [-size * 1.4, size * 0.45, 0] as [number,number,number], rot: [0, 0, Math.PI * 0.18] as [number,number,number], w: size * 1.6 },
      ].map(({ sp, rot, w }, i) => (
        <mesh key={i} position={sp} rotation={rot} castShadow receiveShadow>
          <boxGeometry args={[w, size * 0.5, size * 0.3]} />
          <meshStandardMaterial color="#c0392b" roughness={0.6} />
        </mesh>
      ))}
      {([[-1.35,-1.0],[1.35,-1.0],[-1.35,1.0],[1.35,1.0]] as [number,number][]).map(([dx,dz],i) => (
        <mesh key={i} position={[size*dx, size*0.6, size*dz]} castShadow>
          <cylinderGeometry args={[size*0.15, size*0.18, size*1.2, 6]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Museum({ pos, color, size }: P5) {
  const c = color || '#f5f0e8'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.2, size * 1.7, size * 1.4]} />
        <meshStandardMaterial color={c} roughness={0.45} />
      </mesh>
      <mesh position={[0, size * 1.9, 0]} castShadow>
        <sphereGeometry args={[size * 0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 1.78, 0]}>
        <cylinderGeometry args={[size * 0.62, size * 0.62, size * 0.2, 12]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.3} />
      </mesh>
      {([-0.75, -0.25, 0.25, 0.75] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.85, size * 0.76]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.09, size * 1.7, 8]} />
          <meshStandardMaterial color="#ece8d8" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.77, size * 0.66]}>
        <boxGeometry args={[size * 2.2, size * 0.12, size * 0.2]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0, size * i * 0.06, size * 0.82 + size * i * 0.08]}>
          <boxGeometry args={[size * 2.2, size * 0.06, size * 0.22]} />
          <meshStandardMaterial color="#ddd" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function MarketStall({ pos, color, size }: P5) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {([[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.65, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.3, 6]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <boxGeometry args={[size * 1.4, size * 0.08, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {([-0.5, -0.16, 0.16, 0.5] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 1.28, size * 0.34]} castShadow>
          <boxGeometry args={[size * 0.2, size * 0.16, size * 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? c : '#fff'} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.08, size * 0.55]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
      </mesh>
      {([-0.3, 0, 0.3] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.64, 0]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color={(['#e74c3c','#f39c12','#27ae60'] as string[])[i]} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 6 — Transport-2 & Food/Café (20 props)
// ══════════════════════════════════════════════════════════

interface P6 { pos: [number,number,number]; color: string; size: number }

// ─── Transport-2 ────────────────────────────────────────

function Ambulance({ pos, color, size }: P6) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.85, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[size * 0.62, size * 0.68, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.42, size * 0.85]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* red cross */}
      <mesh position={[0, size * 0.68, size * 0.46]}>
        <boxGeometry args={[size * 0.38, size * 0.08, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      <mesh position={[0, size * 0.68, size * 0.46]}>
        <boxGeometry args={[size * 0.08, size * 0.38, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      {/* red stripe */}
      <mesh position={[0, size * 0.32, size * 0.46]}>
        <boxGeometry args={[size * 1.8, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} />
      </mesh>
      {/* wheels */}
      {([-0.55, 0.55] as number[]).map((dx, i) =>
        ([-0.38, 0.38] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.12, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* siren light */}
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <boxGeometry args={[size * 0.28, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function FireTruck({ pos, color, size }: P6) {
  const c = color || '#c0392b'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.4, size * 1.0, size * 0.95]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[size * 0.92, size * 0.88, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* ladder (yellow bars) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.8 + i * 0.35), size * 1.12, 0]} castShadow>
          <boxGeometry args={[size * 0.06, size * 0.06, size * 0.9]} />
          <meshStandardMaterial color="#f39c12" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-size * 0.44, size * 1.16, size * 0.42]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.44, size * 1.16, -size * 0.42]} castShadow>
        <boxGeometry args={[size * 1.6, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      {/* wheels */}
      {([-0.8, 0, 0.8] as number[]).map((dx, i) =>
        ([-0.42, 0.42] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
      {/* siren */}
      <mesh position={[size * 0.7, size * 1.04, 0]}>
        <boxGeometry args={[size * 0.24, size * 0.1, size * 0.18]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function PoliceCar({ pos, color, size }: P6) {
  const c = color || '#1a5276'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.7, size * 0.75, size * 0.85]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* white doors strip */}
      <mesh position={[0, size * 0.38, size * 0.43]}>
        <boxGeometry args={[size * 0.8, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size * 0.72, 0]} castShadow>
        <boxGeometry args={[size * 0.85, size * 0.38, size * 0.82]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.38, size * 0.72, 0]}>
        <boxGeometry args={[size * 0.08, size * 0.3, size * 0.7]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* police siren bar */}
      <mesh position={[0, size * 0.94, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.1, size * 0.12]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      <mesh position={[-size * 0.12, size * 0.94, 0]}>
        <sphereGeometry args={[size * 0.07, 6, 6]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[size * 0.12, size * 0.94, 0]}>
        <sphereGeometry args={[size * 0.07, 6, 6]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={1.0} />
      </mesh>
      {/* wheels */}
      {([-0.55, 0.55] as number[]).map((dx, i) =>
        ([-0.36, 0.36] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.17, size * 0.17, size * 0.1, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function SchoolBus({ pos, color, size }: P6) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 2.6, size * 1.1, size * 0.95]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* black stripe */}
      <mesh position={[0, size * 0.44, size * 0.48]}>
        <boxGeometry args={[size * 2.6, size * 0.14, size * 0.02]} />
        <meshStandardMaterial color="#111" roughness={0.4} />
      </mesh>
      {/* windows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.85 + i * 0.42), size * 0.72, size * 0.48]}>
          <boxGeometry args={[size * 0.28, size * 0.3, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* stop sign arm */}
      <mesh position={[-size * 1.3, size * 0.55, size * 0.48]} castShadow>
        <boxGeometry args={[size * 0.06, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>
      {/* wheels */}
      {([-0.85, 0.85] as number[]).map((dx, i) =>
        ([-0.42, 0.42] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.14, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.12, 10]} />
            <meshStandardMaterial color="#222" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Tractor({ pos, color, size }: P6) {
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.7, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* hood */}
      <mesh position={[size * 0.55, size * 0.48, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.6]} />
        <meshStandardMaterial color="#1a8a48" roughness={0.6} />
      </mesh>
      {/* exhaust */}
      <mesh position={[size * 0.62, size * 0.9, size * 0.15]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.35, 6]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
      {/* big rear wheels */}
      {([-0.38, 0.38] as number[]).map((dz, i) => (
        <mesh key={i} position={[-size * 0.28, size * 0.3, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.18, 12]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}
      {/* small front wheels */}
      {([-0.32, 0.32] as number[]).map((dz, i) => (
        <mesh key={i} position={[size * 0.6, size * 0.2, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.1, 10]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}
      {/* cabin */}
      <mesh position={[-size * 0.18, size * 0.92, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.48, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

function SubmarineMini({ pos, color, size }: P6) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[size * 0.28, size * 1.1, 6, 12]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* conning tower */}
      <mesh position={[0, size * 0.38, 0]} castShadow>
        <boxGeometry args={[size * 0.25, size * 0.35, size * 0.2]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* periscope */}
      <mesh position={[size * 0.08, size * 0.62, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.3, 5]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* propeller */}
      <mesh position={[-size * 0.62, 0, 0]} castShadow>
        <torusGeometry args={[size * 0.14, size * 0.03, 4, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* portholes */}
      {([-0.2, 0, 0.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.08, size * 0.29]}>
          <circleGeometry args={[size * 0.07, 10]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Sailboat({ pos, color, size }: P6) {
  const sailRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sailRef.current) sailRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08
  })
  const c = color || '#8B4513'
  return (
    <group position={pos}>
      {/* hull */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.28, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* keel bottom */}
      <mesh position={[0, -size * 0.06, 0]}>
        <boxGeometry args={[size * 1.4, size * 0.1, size * 0.35]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.7} />
      </mesh>
      {/* mast */}
      <mesh position={[size * 0.1, size * 0.85, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.5, 6]} />
        <meshStandardMaterial color="#6B4226" roughness={0.5} />
      </mesh>
      {/* mainsail */}
      <mesh ref={sailRef} position={[size * 0.1, size * 0.85, 0]} castShadow>
        <coneGeometry args={[size * 0.55, size * 1.2, 3]} />
        <meshStandardMaterial color="#fff8f0" roughness={0.6} side={2} />
      </mesh>
      {/* jib */}
      <mesh position={[size * 0.52, size * 0.7, 0]} castShadow>
        <coneGeometry args={[size * 0.3, size * 0.8, 3]} />
        <meshStandardMaterial color="#fff8f0" roughness={0.6} side={2} />
      </mesh>
    </group>
  )
}

function HotAirBalloon2({ pos, color, size }: P6) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.5) * size * 0.08
  })
  const c = color || '#e74c3c'
  return (
    <group ref={groupRef} position={pos}>
      {/* balloon envelope */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <sphereGeometry args={[size * 0.7, 12, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* color panels */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.62, size * 1.2, Math.sin(rad) * size * 0.62]}
            rotation={[0, -rad, 0]}>
            <boxGeometry args={[size * 0.2, size * 1.1, size * 0.05]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#f7dc6f' : c} roughness={0.5} />
          </mesh>
        )
      })}
      {/* ropes */}
      {([-0.28, 0.28] as number[]).map((dx, i) =>
        ([-0.28, 0.28] as number[]).map((dz, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.65, size * dz]} castShadow>
            <cylinderGeometry args={[size * 0.015, size * 0.015, size * 0.55, 4]} />
            <meshStandardMaterial color="#8B6914" roughness={0.6} />
          </mesh>
        ))
      )}
      {/* basket */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.28, size * 0.55]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
      </mesh>
    </group>
  )
}

function CableCar({ pos, color, size }: P6) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* cable */}
      <mesh position={[0, size * 1.25, 0]}>
        <boxGeometry args={[size * 2.5, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* car body */}
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.85, size * 0.55, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* windows */}
      {([-0.25, 0, 0.25] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.78, size * 0.28]}>
          <boxGeometry args={[size * 0.2, size * 0.28, size * 0.02]} />
          <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* wheel assembly */}
      <mesh position={[0, size * 1.06, 0]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.22]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
      {/* hanging rods */}
      {([-0.28, 0.28] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.92, 0]} castShadow>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.32, 5]} />
          <meshStandardMaterial color="#888" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Monorail({ pos, color, size }: P6) {
  const c = color || '#3498db'
  return (
    <group position={pos}>
      {/* beam track */}
      <mesh position={[0, size * 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 3.5, size * 0.18, size * 0.35]} />
        <meshStandardMaterial color="#bbb" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* support pillars */}
      {([-1.3, 1.3] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.14, size * 0.6, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} />
        </mesh>
      ))}
      {/* train car */}
      <mesh position={[0, size * 0.98, 0]} castShadow>
        <boxGeometry args={[size * 1.8, size * 0.45, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* nose */}
      <mesh position={[size * 0.95, size * 0.98, 0]} castShadow>
        <coneGeometry args={[size * 0.28, size * 0.3, 4]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* windows strip */}
      <mesh position={[0, size * 1.05, size * 0.28]}>
        <boxGeometry args={[size * 1.5, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#9fd3f5" roughness={0.1} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

// ─── Food/Café ──────────────────────────────────────────

function CafeTable({ pos, color, size }: P6) {
  const c = color || '#8B6914'
  return (
    <group position={pos}>
      {/* tabletop */}
      <mesh position={[0, size * 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.06, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.1, size * 0.6, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* base plate */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 0.06, 6]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      {/* 2 chairs */}
      {([-0.7, 0.7] as number[]).map((dx, i) => (
        <group key={i} position={[size * dx, 0, 0]}>
          <mesh position={[0, size * 0.26, 0]} castShadow>
            <boxGeometry args={[size * 0.35, size * 0.06, size * 0.35]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          <mesh position={[0, size * 0.52, -size * 0.16]}>
            <boxGeometry args={[size * 0.35, size * 0.42, size * 0.04]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          {([-0.14, 0.14] as number[]).map((dz, j) => (
            <mesh key={j} position={[size * 0.14 * (i === 0 ? -1 : 1), size * 0.13, size * dz]}>
              <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.26, 5]} />
              <meshStandardMaterial color="#888" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function CoffeeCup({ pos, color, size }: P6) {
  const steamRef1 = useRef<THREE.Mesh>(null!)
  const steamRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (steamRef1.current) { steamRef1.current.position.y = size * 1.1 + Math.sin(t * 1.2) * size * 0.05; (steamRef1.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(t * 1.2) * 0.2 }
    if (steamRef2.current) { steamRef2.current.position.y = size * 1.2 + Math.sin(t * 1.5 + 1) * size * 0.06; (steamRef2.current.material as THREE.MeshStandardMaterial).opacity = 0.4 + Math.sin(t * 1.5) * 0.2 }
  })
  const c = color || '#6F4E37'
  return (
    <group position={pos}>
      {/* saucer */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.65, size * 0.65, size * 0.06, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* cup body */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.26, size * 0.72, 12]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* coffee inside */}
      <mesh position={[0, size * 0.76, 0]}>
        <cylinderGeometry args={[size * 0.3, size * 0.3, size * 0.02, 12]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* handle */}
      <mesh position={[size * 0.4, size * 0.42, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.04, 5, 10, Math.PI]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* steam puffs */}
      <mesh ref={steamRef1} position={[-size * 0.07, size * 1.1, 0]}>
        <sphereGeometry args={[size * 0.08, 5, 5]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.5} roughness={0.8} />
      </mesh>
      <mesh ref={steamRef2} position={[size * 0.07, size * 1.2, 0]}>
        <sphereGeometry args={[size * 0.1, 5, 5]} />
        <meshStandardMaterial color="#eee" transparent opacity={0.4} roughness={0.8} />
      </mesh>
    </group>
  )
}

function CakeSlice({ pos, color, size }: P6) {
  const c = color || '#f5cba7'
  return (
    <group position={pos}>
      {/* slice body — wedge (1/6 of cylinder) */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.6, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* frosting top */}
      <mesh position={[0, size * 0.61, 0]} castShadow>
        <cylinderGeometry args={[size * 0.61, size * 0.61, size * 0.08, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* strawberry on top */}
      <mesh position={[size * 0.18, size * 0.72, size * 0.08]} castShadow>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.5} />
      </mesh>
      {/* filling layers */}
      <mesh position={[0, size * 0.24, 0]} castShadow>
        <cylinderGeometry args={[size * 0.61, size * 0.61, size * 0.08, 6, 1, false, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.5} />
      </mesh>
    </group>
  )
}

function IceCreamStand({ pos, color, size }: P6) {
  const c = color || '#ff69b4'
  return (
    <group position={pos}>
      {/* umbrella pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.6, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* umbrella canopy */}
      <mesh position={[0, size * 1.62, 0]} castShadow>
        <coneGeometry args={[size * 0.85, size * 0.42, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* counter cart */}
      <mesh position={[0, size * 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.9, size * 0.85, size * 0.6]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* stripe */}
      <mesh position={[0, size * 0.55, size * 0.31]}>
        <boxGeometry args={[size * 0.9, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* ice cream scoops */}
      {([-0.22, 0, 0.22] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 1.0, 0]} castShadow>
          <sphereGeometry args={[size * 0.14, 8, 8]} />
          <meshStandardMaterial color={(['#ff69b4','#87ceeb','#90ee90'] as string[])[i]} roughness={0.4} />
        </mesh>
      ))}
      {/* wheels */}
      {([-0.3, 0.3] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.1, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.14, size * 0.14, size * 0.08, 10]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function FoodCart({ pos, color, size }: P6) {
  const c = color || '#e67e22'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.95, size * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.02, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.12, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* menu board */}
      <mesh position={[0, size * 0.85, size * 0.36]}>
        <boxGeometry args={[size * 0.7, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.4} />
      </mesh>
      {/* handle */}
      <mesh position={[-size * 0.6, size * 0.75, 0]}>
        <boxGeometry args={[size * 0.08, size * 0.45, size * 0.6]} />
        <meshStandardMaterial color="#555" roughness={0.4} />
      </mesh>
      {/* wheels */}
      {([-0.3, 0.3] as number[]).map((dz, i) =>
        ([-0.38, 0.38] as number[]).map((dx, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.18, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[size * 0.2, size * 0.2, size * 0.1, 10]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function PizzaOven({ pos, color, size }: P6) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })
  const c = color || '#d35400'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.2, size * 0.55, size * 1.1]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      {/* dome */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.52, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* arch opening */}
      <mesh position={[0, size * 0.5, size * 0.5]}>
        <boxGeometry args={[size * 0.45, size * 0.42, size * 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* fire glow inside */}
      <mesh ref={glowRef} position={[0, size * 0.42, size * 0.35]}>
        <sphereGeometry args={[size * 0.18, 6, 6]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4500" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
      {/* chimney */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.45, 6]} />
        <meshStandardMaterial color="#666" roughness={0.5} />
      </mesh>
    </group>
  )
}

function SodaMachine({ pos, color, size }: P6) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.75, size * 1.5, size * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* screen / display */}
      <mesh position={[0, size * 1.05, size * 0.28]}>
        <boxGeometry args={[size * 0.55, size * 0.45, size * 0.02]} />
        <meshStandardMaterial color="#1a2030" roughness={0.2} />
      </mesh>
      {/* can graphic */}
      <mesh position={[0, size * 1.05, size * 0.3]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.28, 8]} />
        <meshStandardMaterial color="#f8c300" roughness={0.3} />
      </mesh>
      {/* button panel */}
      <mesh position={[0, size * 0.5, size * 0.28]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.02]} />
        <meshStandardMaterial color="#c0392b" roughness={0.3} />
      </mesh>
      {/* buttons x4 */}
      {([-0.15, 0.15] as number[]).map((dx, i) =>
        ([-0.06, 0.06] as number[]).map((dy, j) => (
          <mesh key={`${i}-${j}`} position={[size * dx, size * 0.5 + size * dy, size * 0.295]}>
            <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.02, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#e74c3c' : '#3498db'} roughness={0.3} />
          </mesh>
        ))
      )}
      {/* coin slot */}
      <mesh position={[size * 0.25, size * 0.62, size * 0.28]}>
        <boxGeometry args={[size * 0.06, size * 0.02, size * 0.02]} />
        <meshStandardMaterial color="#222" roughness={0.4} />
      </mesh>
      {/* tray */}
      <mesh position={[0, size * 0.24, size * 0.3]}>
        <boxGeometry args={[size * 0.55, size * 0.06, size * 0.14]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} />
      </mesh>
    </group>
  )
}

function Cupcake({ pos, color, size }: P6) {
  const c = color || '#ff69b4'
  return (
    <group position={pos}>
      {/* paper cup */}
      <mesh position={[0, size * 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.22, size * 0.44, 10]} />
        <meshStandardMaterial color="#fff8e1" roughness={0.6} />
      </mesh>
      {/* wrapper lines */}
      {([0, 1, 2] as number[]).map((i) => (
        <mesh key={i} position={[0, size * 0.08 + i * size * 0.12, 0]}>
          <cylinderGeometry args={[size * 0.29, size * 0.23, size * 0.02, 10]} />
          <meshStandardMaterial color="#f39c12" roughness={0.5} />
        </mesh>
      ))}
      {/* frosting dome */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* sprinkles */}
      {([[-0.1, 0.62, 0.12], [0.08, 0.68, -0.08], [0.14, 0.58, 0.1], [-0.05, 0.72, 0]] as [number,number,number][]).map(([dx,dy,dz], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * dz]} castShadow>
          <sphereGeometry args={[size * 0.04, 4, 4]} />
          <meshStandardMaterial color={(['#f7dc6f','#3498db','#27ae60','#e74c3c'] as string[])[i]} roughness={0.4} />
        </mesh>
      ))}
      {/* cherry on top */}
      <mesh position={[0, size * 0.9, 0]} castShadow>
        <sphereGeometry args={[size * 0.08, 6, 6]} />
        <meshStandardMaterial color="#c0392b" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Pretzel({ pos, color, size }: P6) {
  const c = color || '#c8860a'
  return (
    <group position={pos}>
      {/* outer ring left */}
      <mesh position={[-size * 0.2, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.08, 6, 10, Math.PI * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* outer ring right */}
      <mesh position={[size * 0.2, size * 0.35, 0]} castShadow>
        <torusGeometry args={[size * 0.22, size * 0.08, 6, 10, Math.PI * 1.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* bottom twist */}
      <mesh position={[0, size * 0.15, 0]} castShadow>
        <torusGeometry args={[size * 0.14, size * 0.08, 6, 8, Math.PI]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* salt dots */}
      {([[-0.15, 0.5], [0.15, 0.5], [0, 0.15], [-0.25, 0.28], [0.25, 0.28]] as [number,number][]).map(([dx,dy], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * 0.08]}>
          <sphereGeometry args={[size * 0.03, 4, 4]} />
          <meshStandardMaterial color="#fff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function HotDogStand({ pos, size }: P6) {
  return (
    <group position={pos}>
      {/* umbrella pole */}
      <mesh position={[0, size * 0.85, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.7, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* umbrella */}
      <mesh position={[0, size * 1.72, 0]} castShadow>
        <coneGeometry args={[size * 0.9, size * 0.45, 8]} />
        <meshStandardMaterial color="#f39c12" roughness={0.6} />
      </mesh>
      {/* umbrella stripes */}
      {([0, 45, 90, 135, 180, 225, 270, 315] as number[]).map((deg, i) => {
        if (i % 2 !== 0) return null
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.42, size * 1.55, Math.sin(rad) * size * 0.42]}
            rotation={[0, -rad, Math.PI * 0.2]}>
            <boxGeometry args={[size * 0.04, size * 0.42, size * 0.04]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.6} />
          </mesh>
        )
      })}
      {/* cart */}
      <mesh position={[0, size * 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.95, size * 0.9, size * 0.65]} />
        <meshStandardMaterial color="#f39c12" roughness={0.5} />
      </mesh>
      {/* grill top */}
      <mesh position={[0, size * 0.92, 0]} castShadow>
        <boxGeometry args={[size * 1.0, size * 0.08, size * 0.7]} />
        <meshStandardMaterial color="#555" roughness={0.4} />
      </mesh>
      {/* sausage */}
      <mesh position={[size * 0.12, size * 0.98, 0]} castShadow rotation={[0, Math.PI * 0.1, Math.PI / 2]}>
        <capsuleGeometry args={[size * 0.06, size * 0.4, 4, 8]} />
        <meshStandardMaterial color="#c0392b" roughness={0.5} />
      </mesh>
      {/* wheels */}
      {([-0.28, 0.28] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.2, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[size * 0.22, size * 0.22, size * 0.1, 10]} />
          <meshStandardMaterial color="#333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// BATCH 7 — Sports-2 & Space-2 (20 props)
// ══════════════════════════════════════════════════════════

interface P7 { pos: [number,number,number]; color: string; size: number }

// ─── Sports-2 ───────────────────────────────────────────

function SwimmingPool({ pos, color, size }: P7) {
  const waterRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (waterRef.current) {
      const m = waterRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.1 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* pool basin */}
      <mesh position={[0, -size * 0.1, 0]} receiveShadow>
        <boxGeometry args={[size * 2.8, size * 0.2, size * 1.6]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {/* side walls */}
      {([
        { pos: [0, size * 0.1, size * 0.82] as [number,number,number], args: [size * 2.8, size * 0.2, size * 0.04] as [number,number,number] },
        { pos: [0, size * 0.1, -size * 0.82] as [number,number,number], args: [size * 2.8, size * 0.2, size * 0.04] as [number,number,number] },
        { pos: [size * 1.42, size * 0.1, 0] as [number,number,number], args: [size * 0.04, size * 0.2, size * 1.6] as [number,number,number] },
        { pos: [-size * 1.42, size * 0.1, 0] as [number,number,number], args: [size * 0.04, size * 0.2, size * 1.6] as [number,number,number] },
      ]).map(({ pos: wp, args }, i) => (
        <mesh key={i} position={wp} castShadow>
          <boxGeometry args={args} />
          <meshStandardMaterial color="#ddd" roughness={0.4} />
        </mesh>
      ))}
      {/* water surface */}
      <mesh ref={waterRef} position={[0, size * 0.08, 0]}>
        <boxGeometry args={[size * 2.74, size * 0.04, size * 1.58]} />
        <meshStandardMaterial color={c} roughness={0.05} metalness={0.1} transparent opacity={0.85} emissive={c} emissiveIntensity={0.1} />
      </mesh>
      {/* lane dividers */}
      {([-0.55, 0, 0.55] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.1, size * dz]}>
          <boxGeometry args={[size * 2.7, size * 0.03, size * 0.04]} />
          <meshStandardMaterial color={i === 1 ? '#f39c12' : '#e74c3c'} roughness={0.4} />
        </mesh>
      ))}
      {/* diving board */}
      <mesh position={[size * 1.2, size * 0.32, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 0.06, size * 0.18]} />
        <meshStandardMaterial color="#3498db" roughness={0.3} />
      </mesh>
      <mesh position={[size * 1.38, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.36, 5]} />
        <meshStandardMaterial color="#aaa" roughness={0.3} />
      </mesh>
    </group>
  )
}

function TennisCourt({ pos, color, size }: P7) {
  const c = color || '#2ecc71'
  return (
    <group position={pos}>
      {/* court surface */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <boxGeometry args={[size * 3.0, size * 0.08, size * 1.8]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* court lines */}
      {[
        { p: [0, size * 0.09, 0] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [0, size * 0.09, size * 0.88] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [0, size * 0.09, -size * 0.88] as [number,number,number], a: [size * 3.0, size * 0.02, size * 0.04] as [number,number,number] },
        { p: [-size * 1.48, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
        { p: [size * 1.48, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
        { p: [0, size * 0.09, 0] as [number,number,number], a: [size * 0.04, size * 0.02, size * 1.8] as [number,number,number] },
      ].map(({ p, a }, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={a} />
          <meshStandardMaterial color="#fff" roughness={0.4} />
        </mesh>
      ))}
      {/* net posts */}
      {([-0.92, 0.92] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.32, size * dz]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.55, 5]} />
          <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {/* net */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <boxGeometry args={[size * 0.02, size * 0.28, size * 1.84]} />
        <meshStandardMaterial color="#fff" roughness={0.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function SkiJump({ pos, color, size }: P7) {
  const c = color || '#4c97ff'
  return (
    <group position={pos}>
      {/* ramp structure */}
      <mesh position={[size * 0.4, size * 0.8, 0]} rotation={[0, 0, -Math.PI * 0.22]} castShadow>
        <boxGeometry args={[size * 2.0, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#ddd" roughness={0.5} />
      </mesh>
      {/* support tower */}
      <mesh position={[-size * 0.5, size * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.18, size * 1.0, size * 0.5]} />
        <meshStandardMaterial color="#aaa" roughness={0.5} />
      </mesh>
      {/* ramp rails */}
      {([-0.22, 0.22] as number[]).map((dz, i) => (
        <mesh key={i} position={[size * 0.4, size * 0.82, size * dz]} rotation={[0, 0, -Math.PI * 0.22]}>
          <boxGeometry args={[size * 2.0, size * 0.04, size * 0.04]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* jump lip (upward curve tip) */}
      <mesh position={[size * 1.38, size * 1.18, 0]} rotation={[0, 0, Math.PI * 0.08]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </mesh>
      {/* flag */}
      <mesh position={[-size * 0.5, size * 1.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.4, 5]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      <mesh position={[-size * 0.36, size * 1.24, 0]}>
        <boxGeometry args={[size * 0.28, size * 0.16, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
    </group>
  )
}

function BowlingPin({ pos, color, size }: P7) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* pin arrangement — triangle of 6 */}
      {([
        [0, 0], [0.4, -0.3], [-0.4, -0.3], [0.8, -0.6], [0, -0.6], [-0.8, -0.6]
      ] as [number,number][]).map(([dx, dz], i) => (
        <group key={i} position={[size * dx, 0, size * dz]}>
          {/* pin body */}
          <mesh position={[0, size * 0.38, 0]} castShadow>
            <cylinderGeometry args={[size * 0.12, size * 0.15, size * 0.55, 10]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* pin neck */}
          <mesh position={[0, size * 0.68, 0]} castShadow>
            <cylinderGeometry args={[size * 0.07, size * 0.12, size * 0.14, 10]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* pin head */}
          <mesh position={[0, size * 0.82, 0]} castShadow>
            <sphereGeometry args={[size * 0.1, 8, 8]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
          {/* red stripe */}
          <mesh position={[0, size * 0.5, 0]}>
            <cylinderGeometry args={[size * 0.125, size * 0.125, size * 0.06, 10]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* bowling ball */}
      <mesh position={[size * 1.2, size * 0.18, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 10]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Dartboard({ pos, size }: P7) {
  return (
    <group position={pos}>
      {/* board rings */}
      {([
        { r: size * 0.55, col: '#222' },
        { r: size * 0.46, col: '#27ae60' },
        { r: size * 0.38, col: '#222' },
        { r: size * 0.3,  col: '#27ae60' },
        { r: size * 0.22, col: '#e74c3c' },
        { r: size * 0.14, col: '#e74c3c' },
        { r: size * 0.07, col: '#27ae60' },
      ]).map(({ r, col }, i) => (
        <mesh key={i} position={[0, size * 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r, 20]} />
          <meshStandardMaterial color={col} roughness={0.5} side={2} />
        </mesh>
      ))}
      {/* bullseye */}
      <mesh position={[0, size * 0.8, size * 0.01]}>
        <circleGeometry args={[size * 0.04, 12]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      {/* dart */}
      <mesh position={[size * 0.08, size * 0.8, size * 0.04]} rotation={[0, Math.PI * 0.1, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.015, size * 0.003, size * 0.25, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* board backing */}
      <mesh position={[0, size * 0.8, -size * 0.02]}>
        <cylinderGeometry args={[size * 0.58, size * 0.58, size * 0.04, 20]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.7} />
      </mesh>
      {/* stand post */}
      <mesh position={[0, size * 0.4, -size * 0.04]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.8, 6]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

function GolfHole({ pos, color, size }: P7) {
  const flagRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (flagRef.current) flagRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.3
  })
  const c = color || '#27ae60'
  return (
    <group position={pos}>
      {/* green */}
      <mesh position={[0, size * 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[size * 1.0, size * 1.0, size * 0.08, 16]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* hole */}
      <mesh position={[size * 0.35, size * 0.04, size * 0.2]}>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.1, 12]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* flag post */}
      <mesh position={[size * 0.35, size * 0.45, size * 0.2]} castShadow>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.82, 5]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* flag */}
      <mesh ref={flagRef} position={[size * 0.52, size * 0.8, size * 0.2]} castShadow>
        <boxGeometry args={[size * 0.32, size * 0.2, size * 0.02]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
      {/* golf ball */}
      <mesh position={[-size * 0.3, size * 0.1, -size * 0.4]} castShadow>
        <sphereGeometry args={[size * 0.08, 10, 10]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
    </group>
  )
}

function ClimbingWall({ pos, color, size }: P7) {
  const c = color || '#e67e22'
  return (
    <group position={pos}>
      {/* wall panel */}
      <mesh position={[0, size * 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.6, size * 2.0, size * 0.2]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* handholds (colored bumps) */}
      {[
        [-0.5, 1.6, 0.1], [0.2, 1.4, 0.1], [0.55, 1.75, 0.1],
        [-0.3, 1.2, 0.1], [0.45, 1.05, 0.1], [0, 1.85, 0.1],
        [-0.6, 0.8, 0.1], [0.3, 0.7, 0.1], [-0.15, 0.5, 0.1],
        [0.55, 0.35, 0.1], [-0.5, 0.25, 0.1], [0.1, 0.15, 0.1],
      ].map(([dx, dy, dz], i) => (
        <mesh key={i} position={[size * dx, size * dy, size * dz]} castShadow>
          <sphereGeometry args={[size * 0.09, 6, 6]} />
          <meshStandardMaterial color={(['#e74c3c','#27ae60','#f39c12','#3498db','#9b59b6','#1abc9c'] as string[])[i % 6]} roughness={0.5} />
        </mesh>
      ))}
      {/* base platform */}
      <mesh position={[0, size * 0.05, size * 0.15]} receiveShadow>
        <boxGeometry args={[size * 1.6, size * 0.1, size * 0.5]} />
        <meshStandardMaterial color="#888" roughness={0.6} />
      </mesh>
    </group>
  )
}

function BalanceBeam({ pos, color, size }: P7) {
  const c = color || '#f39c12'
  return (
    <group position={pos}>
      {/* beam */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 2.8, size * 0.1, size * 0.14]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* support legs */}
      {([-1.2, 1.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.12, size * 0.6, size * 0.35]} />
          <meshStandardMaterial color="#aaa" roughness={0.5} />
        </mesh>
      ))}
      {/* leg feet */}
      {([-1.2, 1.2] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.04, 0]} receiveShadow>
          <boxGeometry args={[size * 0.45, size * 0.08, size * 0.45]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
      {/* crash mats */}
      {([-0.6, 0.6] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.04, size * 0.35]} receiveShadow>
          <boxGeometry args={[size * 0.8, size * 0.08, size * 0.6]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function RacingFlag({ pos, size }: P7) {
  const flagRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.15
      flagRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.5 + 0.5) * 0.2
    }
  })
  return (
    <group position={pos}>
      {/* flag pole */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 1.6, 6]} />
        <meshStandardMaterial color="#aaa" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* checkered flag */}
      <mesh ref={flagRef} position={[size * 0.38, size * 1.5, 0]} castShadow>
        <boxGeometry args={[size * 0.75, size * 0.48, size * 0.03]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      {/* checker pattern (black squares) */}
      {([
        [-0.22, 1.58, 0.02], [0, 1.58, 0.02], [0.22, 1.58, 0.02],
        [-0.11, 1.46, 0.02], [0.11, 1.46, 0.02],
        [-0.22, 1.34, 0.02], [0, 1.34, 0.02], [0.22, 1.34, 0.02],
      ] as [number,number,number][]).map(([dx,dy,dz], i) => (
        i % 2 === 0 ? (
          <mesh key={i} position={[size * dx, size * dy, size * dz]}>
            <boxGeometry args={[size * 0.18, size * 0.12, size * 0.01]} />
            <meshStandardMaterial color="#111" roughness={0.5} />
          </mesh>
        ) : null
      ))}
      {/* base */}
      <mesh position={[0, size * 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.22, size * 0.1, 8]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

function MedalStand({ pos, size }: P7) {
  return (
    <group position={pos}>
      {/* podium blocks */}
      {[
        { dx: 0,    h: 0.55, label: '🥇', col: '#f8c300' },
        { dx: -0.7, h: 0.4,  label: '🥈', col: '#aaa' },
        { dx: 0.7,  h: 0.3,  label: '🥉', col: '#cd7f32' },
      ].map(({ dx, h, col }, i) => (
        <group key={i} position={[size * dx, 0, 0]}>
          <mesh position={[0, size * h * 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[size * 0.55, size * h, size * 0.55]} />
            <meshStandardMaterial color={col} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* number */}
          <mesh position={[0, size * h + size * 0.04, size * 0.28]}>
            <boxGeometry args={[size * 0.38, size * 0.3, size * 0.02]} />
            <meshStandardMaterial color="#fff" roughness={0.4} />
          </mesh>
          {/* trophy on top */}
          <mesh position={[0, size * h + size * 0.15, 0]} castShadow>
            <sphereGeometry args={[size * 0.1, 8, 8]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.3} roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Space-2 ────────────────────────────────────────────

function MoonBase({ pos, color, size }: P7) {
  const c = color || '#b0b8c8'
  return (
    <group position={pos}>
      {/* main habitat dome */}
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[size * 0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* dome ring base */}
      <mesh position={[0, size * 0.06, 0]}>
        <cylinderGeometry args={[size * 0.57, size * 0.57, size * 0.12, 12]} />
        <meshStandardMaterial color="#888" roughness={0.4} />
      </mesh>
      {/* connecting tunnel */}
      <mesh position={[size * 0.65, size * 0.18, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.6, 8]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* secondary dome */}
      <mesh position={[size * 1.0, size * 0.22, 0]} castShadow>
        <sphereGeometry args={[size * 0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* solar panels */}
      {([-0.45, 0.45] as number[]).map((dz, i) => (
        <mesh key={i} position={[0, size * 0.55, size * dz]} castShadow>
          <boxGeometry args={[size * 0.5, size * 0.04, size * 0.28]} />
          <meshStandardMaterial color="#1a3a6a" roughness={0.2} metalness={0.3} />
        </mesh>
      ))}
      {/* airlock */}
      <mesh position={[-size * 0.55, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.15, size * 0.35, size * 0.2]} />
        <meshStandardMaterial color="#666" roughness={0.4} />
      </mesh>
    </group>
  )
}

function SpaceRover({ pos, color, size }: P7) {
  const c = color || '#f5f0e0'
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (wheelRef.current) wheelRef.current.rotation.z = clock.getElapsedTime() * 0.5
  })
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.1, size * 0.35, size * 0.75]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* instrument mast */}
      <mesh position={[size * 0.3, size * 0.72, 0]} castShadow>
        <cylinderGeometry args={[size * 0.035, size * 0.035, size * 0.7, 5]} />
        <meshStandardMaterial color="#888" roughness={0.3} />
      </mesh>
      {/* camera head */}
      <mesh position={[size * 0.3, size * 1.1, 0]} castShadow>
        <boxGeometry args={[size * 0.18, size * 0.14, size * 0.18]} />
        <meshStandardMaterial color="#333" roughness={0.3} />
      </mesh>
      {/* solar panel */}
      <mesh position={[-size * 0.12, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.04, size * 0.38]} />
        <meshStandardMaterial color="#1a3a6a" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* wheels x6 */}
      <group ref={wheelRef}>
        {([-0.45, 0, 0.45] as number[]).map((dx, i) =>
          ([-0.4, 0.4] as number[]).map((dz, j) => (
            <mesh key={`${i}-${j}`} position={[size * dx, size * 0.16, size * dz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.1, 10]} />
              <meshStandardMaterial color="#444" roughness={0.8} />
            </mesh>
          ))
        )}
      </group>
    </group>
  )
}

function SatelliteDish2({ pos, color, size }: P7) {
  const dishRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (dishRef.current) dishRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.8
  })
  const c = color || '#ddd'
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.4, size * 0.16, 8]} />
        <meshStandardMaterial color="#888" roughness={0.5} />
      </mesh>
      {/* rotating assembly */}
      <group ref={dishRef} position={[0, size * 0.16, 0]}>
        {/* pivot shaft */}
        <mesh position={[0, size * 0.28, 0]} castShadow>
          <cylinderGeometry args={[size * 0.06, size * 0.06, size * 0.56, 6]} />
          <meshStandardMaterial color="#888" roughness={0.4} />
        </mesh>
        {/* dish arm */}
        <mesh position={[0, size * 0.5, size * 0.28]} rotation={[Math.PI * 0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.55, 5]} />
          <meshStandardMaterial color="#999" roughness={0.4} />
        </mesh>
        {/* dish bowl */}
        <mesh position={[0, size * 0.72, size * 0.45]} rotation={[Math.PI * 0.55, 0, 0]} castShadow>
          <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={c} roughness={0.2} metalness={0.2} side={2} />
        </mesh>
        {/* feed horn */}
        <mesh position={[0, size * 0.72, size * 0.45]}>
          <cylinderGeometry args={[size * 0.06, size * 0.03, size * 0.22, 6]} />
          <meshStandardMaterial color="#aaa" roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function AlienShip({ pos, color, size }: P7) {
  const hoverRef = useRef<THREE.Group>(null!)
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (hoverRef.current) hoverRef.current.position.y = pos[1] + Math.sin(t * 0.6) * size * 0.1
    if (beamRef.current) {
      const m = beamRef.current.material as THREE.MeshStandardMaterial
      m.opacity = 0.3 + Math.sin(t * 2) * 0.15
    }
  })
  const c = color || '#00ff88'
  return (
    <group ref={hoverRef} position={pos}>
      {/* saucer body */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.65, 12, 6]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* cockpit dome */}
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.1} transparent opacity={0.7} emissive={c} emissiveIntensity={0.3} />
      </mesh>
      {/* rim lights */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.58, -size * 0.08, Math.sin(rad) * size * 0.58]}>
            <sphereGeometry args={[size * 0.06, 5, 5]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.0} />
          </mesh>
        )
      })}
      {/* tractor beam */}
      <mesh ref={beamRef} position={[0, -size * 0.55, 0]}>
        <coneGeometry args={[size * 0.35, size * 0.9, 8]} />
        <meshStandardMaterial color={c} transparent opacity={0.35} roughness={0.1} emissive={c} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function CryoPod({ pos, color, size }: P7) {
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.2) * 0.2
    }
  })
  const c = color || '#4fc3f7'
  return (
    <group position={pos}>
      {/* pod shell */}
      <mesh position={[0, size * 0.65, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[size * 0.3, size * 0.7, 4, 12]} />
        <meshStandardMaterial color="#333" roughness={0.2} metalness={0.5} />
      </mesh>
      {/* frost glass window */}
      <mesh ref={glowRef} position={[0, size * 0.75, size * 0.3]} castShadow>
        <boxGeometry args={[size * 0.35, size * 0.8, size * 0.04]} />
        <meshStandardMaterial color={c} roughness={0.05} transparent opacity={0.55} emissive={c} emissiveIntensity={0.5} />
      </mesh>
      {/* control panel */}
      <mesh position={[0, size * 0.18, size * 0.28]}>
        <boxGeometry args={[size * 0.35, size * 0.12, size * 0.04]} />
        <meshStandardMaterial color="#1a2030" roughness={0.2} />
      </mesh>
      {/* status lights */}
      {([-0.1, 0, 0.1] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.18, size * 0.31]}>
          <sphereGeometry args={[size * 0.025, 5, 5]} />
          <meshStandardMaterial color={(['#27ae60','#f39c12','#e74c3c'] as string[])[i]} emissive={(['#27ae60','#f39c12','#e74c3c'] as string[])[i]} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* base stand */}
      <mesh position={[0, size * 0.06, 0]} receiveShadow>
        <boxGeometry args={[size * 0.75, size * 0.12, size * 0.5]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
    </group>
  )
}

function SpaceSuit({ pos, color, size }: P7) {
  const c = color || '#ffffff'
  return (
    <group position={pos}>
      {/* helmet */}
      <mesh position={[0, size * 1.2, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 10, 10]} />
        <meshStandardMaterial color={c} roughness={0.2} />
      </mesh>
      {/* visor */}
      <mesh position={[size * 0.18, size * 1.22, size * 0.2]} castShadow>
        <sphereGeometry args={[size * 0.18, 8, 8, 0, Math.PI, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#f39c12" roughness={0.1} transparent opacity={0.8} emissive="#f39c12" emissiveIntensity={0.2} />
      </mesh>
      {/* torso */}
      <mesh position={[0, size * 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 0.52, size * 0.7, size * 0.38]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* backpack (life support) */}
      <mesh position={[0, size * 0.72, -size * 0.25]} castShadow>
        <boxGeometry args={[size * 0.42, size * 0.55, size * 0.16]} />
        <meshStandardMaterial color="#ccc" roughness={0.4} />
      </mesh>
      {/* arms */}
      {([-0.35, 0.35] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.72, 0]} castShadow>
          <cylinderGeometry args={[size * 0.09, size * 0.09, size * 0.6, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* gloves */}
      {([-0.35, 0.35] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.38, 0]} castShadow>
          <sphereGeometry args={[size * 0.1, 7, 7]} />
          <meshStandardMaterial color="#ccc" roughness={0.4} />
        </mesh>
      ))}
      {/* legs */}
      {([-0.15, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx, size * 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.55, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} />
        </mesh>
      ))}
      {/* boots */}
      {([-0.15, 0.15] as number[]).map((dx, i) => (
        <mesh key={i} position={[size * dx * 0.8, size * -0.02, size * 0.06]} castShadow receiveShadow>
          <boxGeometry args={[size * 0.18, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color="#888" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function SingleMeteor({ offset, size, color }: { offset: number; size: number; color: string }) {
  const ref = useRef<THREE.Group>(null!)
  const c = color || '#ff6b35'
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const cycle = (t * size * 0.6 + offset) % (size * 4)
    ref.current.position.y = size * 2.5 - cycle
    ref.current.position.x = Math.sin(t * 0.3 + offset) * size * 0.2
  })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[size * (0.08 + offset * 0.015), 5, 5]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.05, size * 0.18, 0]} rotation={[Math.PI * 0.1, 0, 0]}>
        <coneGeometry args={[size * 0.06, size * 0.4, 5]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function MeteorShower({ pos, color, size }: P7) {
  return (
    <group position={pos}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SingleMeteor key={i} offset={i * 0.8 * size} size={size} color={color} />
      ))}
    </group>
  )
}

function RingPlanet({ pos, color, size }: P7) {
  const planetRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = clock.getElapsedTime() * 0.2
      planetRef.current.rotation.x = 0.3
    }
  })
  const c = color || '#e8a87c'
  return (
    <group ref={planetRef} position={pos}>
      {/* planet */}
      <mesh castShadow>
        <sphereGeometry args={[size * 0.65, 14, 12]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* surface bands */}
      {([0.3, 0] as number[]).map((lat, i) => (
        <mesh key={i} position={[0, size * lat * 0.5, 0]} rotation={[lat, 0, 0]}>
          <torusGeometry args={[size * 0.65, size * 0.05, 5, 24]} />
          <meshStandardMaterial color={i === 0 ? '#c87050' : '#d4956a'} roughness={0.4} />
        </mesh>
      ))}
      {/* rings */}
      {([1.1, 1.3, 1.5] as number[]).map((r, i) => (
        <mesh key={i} rotation={[Math.PI * 0.22, 0, 0]}>
          <torusGeometry args={[size * r, size * (0.06 - i * 0.01), 4, 32]} />
          <meshStandardMaterial color={(['#d4a857','#c8a04a','#b89840'] as string[])[i]} roughness={0.5} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function RocketLaunchPad({ pos, color, size }: P7) {
  const c = color || '#e74c3c'
  return (
    <group position={pos}>
      {/* launch platform */}
      <mesh position={[0, size * 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[size * 1.8, size * 0.16, size * 1.8]} />
        <meshStandardMaterial color="#555" roughness={0.6} />
      </mesh>
      {/* support structure */}
      {([[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]] as [number,number][]).map(([dx, dz], i) => (
        <mesh key={i} position={[size * dx, size * 0.8, size * dz]} castShadow>
          <boxGeometry args={[size * 0.1, size * 1.6, size * 0.1]} />
          <meshStandardMaterial color="#888" roughness={0.4} />
        </mesh>
      ))}
      {/* rocket body */}
      <mesh position={[0, size * 1.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.25, size * 1.8, 10]} />
        <meshStandardMaterial color="#fff" roughness={0.3} />
      </mesh>
      {/* rocket nose */}
      <mesh position={[0, size * 2.35, 0]} castShadow>
        <coneGeometry args={[size * 0.2, size * 0.55, 10]} />
        <meshStandardMaterial color={c} roughness={0.3} />
      </mesh>
      {/* fins */}
      {([0, 120, 240] as number[]).map((deg, i) => {
        const rad = deg * Math.PI / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * size * 0.22, size * 0.65, Math.sin(rad) * size * 0.22]}
            rotation={[0, -rad, Math.PI * 0.05]}>
            <boxGeometry args={[size * 0.35, size * 0.55, size * 0.04]} />
            <meshStandardMaterial color={c} roughness={0.3} />
          </mesh>
        )
      })}
      {/* exhaust flame */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <coneGeometry args={[size * 0.14, size * 0.45, 6]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff4500" emissiveIntensity={1.0} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function SpaceCannon({ pos, color, size }: P7) {
  const barrelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (barrelRef.current) barrelRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.2 - 0.3
  })
  const c = color || '#555'
  return (
    <group position={pos}>
      {/* base turret */}
      <mesh position={[0, size * 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.45, size * 0.5, size * 0.4, 8]} />
        <meshStandardMaterial color={c} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* turret ring */}
      <mesh position={[0, size * 0.42, 0]}>
        <cylinderGeometry args={[size * 0.42, size * 0.42, size * 0.08, 8]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* rotating barrel group */}
      <group ref={barrelRef} position={[0, size * 0.5, 0]}>
        {/* main barrel */}
        <mesh position={[0, 0, size * 0.55]} castShadow>
          <cylinderGeometry args={[size * 0.12, size * 0.15, size * 1.1, 8]} />
          <meshStandardMaterial color={c} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* barrel rings */}
        {([0.15, 0.4, 0.65] as number[]).map((dz, i) => (
          <mesh key={i} position={[0, 0, size * dz]}>
            <cylinderGeometry args={[size * 0.16, size * 0.16, size * 0.08, 8]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.5} />
          </mesh>
        ))}
        {/* muzzle glow */}
        <mesh position={[0, 0, size * 1.12]}>
          <sphereGeometry args={[size * 0.1, 6, 6]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" emissiveIntensity={0.8} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Batch 8: Fantasy-2 ───────────────────────────────────────────────────────
interface P8 { pos: [number,number,number]; color: string; size: number }

function WizardTower({ pos, color, size }: P8) {
  const c = color || '#4b2882'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15
      glowRef.current.scale.setScalar(s)
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.6, size, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* mid */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.5, size * 0.7, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* top cone */}
      <mesh position={[0, size * 1.95, 0]} castShadow>
        <coneGeometry args={[size * 0.4, size * 0.7, 8]} />
        <meshStandardMaterial color="#1a0a30" roughness={0.6} />
      </mesh>
      {/* glowing orb on top */}
      <mesh ref={glowRef} position={[0, size * 2.45, 0]}>
        <sphereGeometry args={[size * 0.15, 10, 10]} />
        <meshStandardMaterial color="#bb88ff" emissive="#aa66ff" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* windows */}
      {([0.6, 1.2] as number[]).map((h, i) => (
        <mesh key={i} position={[size * 0.5, size * h, 0]}>
          <boxGeometry args={[size * 0.08, size * 0.2, size * 0.18]} />
          <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function DragonStatue({ pos, color, size }: P8) {
  const c = color || '#2d8b2d'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <capsuleGeometry args={[size * 0.35, size * 0.6, 6, 12]} />
        <meshStandardMaterial color={c} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* neck */}
      <mesh position={[0, size * 1.1, size * 0.2]} rotation={[-0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.2, size * 0.28, size * 0.5, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 1.45, size * 0.4]} castShadow>
        <boxGeometry args={[size * 0.38, size * 0.3, size * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* left wing */}
      <mesh position={[size * 0.6, size * 0.9, 0]} rotation={[0, 0.3, -0.4]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} side={2} />
      </mesh>
      {/* right wing */}
      <mesh position={[-size * 0.6, size * 0.9, 0]} rotation={[0, -0.3, 0.4]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.6]} />
        <meshStandardMaterial color={c} roughness={0.4} side={2} />
      </mesh>
      {/* tail */}
      <mesh position={[0, size * 0.3, -size * 0.6]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[size * 0.15, size * 0.8, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* eyes glow */}
      <mesh position={[size * 0.12, size * 1.5, size * 0.62]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-size * 0.12, size * 1.5, size * 0.62]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function MagicWand({ pos, color, size }: P8) {
  const c = color || '#ffd700'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * size * 0.1
      floatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.15
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef}>
        {/* handle */}
        <mesh position={[0, size * 0.5, 0]} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.1, size, 8]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.6} />
        </mesh>
        {/* tip star */}
        <mesh position={[0, size * 1.1, 0]}>
          <octahedronGeometry args={[size * 0.18]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} metalness={0.3} />
        </mesh>
        {/* sparkles */}
        {([0.3, 0.6, 0.9] as number[]).map((h, i) => (
          <mesh key={i} position={[size * (i % 2 === 0 ? 0.12 : -0.12), size * h, 0]}>
            <sphereGeometry args={[size * 0.04, 4, 4]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function SpellBook({ pos, color, size }: P8) {
  const c = color || '#8b0000'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* cover */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.08, size * 0.9]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* left page */}
      <mesh position={[-size * 0.17, size * 0.12, 0]}>
        <boxGeometry args={[size * 0.32, size * 0.01, size * 0.82]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* right page */}
      <mesh position={[size * 0.17, size * 0.12, 0]}>
        <boxGeometry args={[size * 0.32, size * 0.01, size * 0.82]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.9} />
      </mesh>
      {/* glow rune */}
      <mesh ref={glowRef} position={[0, size * 0.14, 0]}>
        <octahedronGeometry args={[size * 0.12]} />
        <meshStandardMaterial color="#aa44ff" emissive="#aa44ff" emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function EnchantedSword({ pos, color, size }: P8) {
  const c = color || '#4488ff'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.5
    }
  })
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 12]}>
      {/* stone base */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.4, size * 0.5]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>
      {/* blade */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.12, size * 1.2, size * 0.06]} />
        <meshStandardMaterial color="#ddeeff" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* crossguard */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.08, size * 0.12]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* glow */}
      <mesh ref={glowRef} position={[0, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.18, size * 1.25, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function AlchemyTable({ pos, color, size }: P8) {
  const c = color || '#3a2b1a'
  const bubbleRef1 = useRef<THREE.Mesh>(null!)
  const bubbleRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (bubbleRef1.current) bubbleRef1.current.position.y = size * 0.85 + Math.sin(t * 2) * size * 0.05
    if (bubbleRef2.current) bubbleRef2.current.position.y = size * 0.9 + Math.sin(t * 2.5 + 1) * size * 0.05
  })
  return (
    <group position={pos}>
      {/* tabletop */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.08, size * 0.8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* legs */}
      {([-0.5, 0.5] as number[]).map((x, i) =>
        ([-0.35, 0.35] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[size * x, size * 0.27, size * z]}>
            <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.55, 6]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))
      )}
      {/* flask 1 */}
      <mesh position={[-size * 0.3, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.28, 8]} />
        <meshStandardMaterial color="#22cc88" transparent opacity={0.7} emissive="#22cc88" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={bubbleRef1} position={[-size * 0.3, size * 0.85, 0]}>
        <sphereGeometry args={[size * 0.1, 8, 8]} />
        <meshStandardMaterial color="#22cc88" transparent opacity={0.5} emissive="#22cc88" emissiveIntensity={0.5} />
      </mesh>
      {/* flask 2 */}
      <mesh position={[size * 0.25, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.07, size * 0.1, size * 0.22, 8]} />
        <meshStandardMaterial color="#ff4444" transparent opacity={0.7} emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={bubbleRef2} position={[size * 0.25, size * 0.9, 0]}>
        <sphereGeometry args={[size * 0.08, 8, 8]} />
        <meshStandardMaterial color="#ff4444" transparent opacity={0.5} emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      {/* book prop */}
      <mesh position={[size * 0.45, size * 0.62, size * 0.2]} rotation={[0, -0.3, 0.4]}>
        <boxGeometry args={[size * 0.3, size * 0.04, size * 0.22]} />
        <meshStandardMaterial color="#5a3010" roughness={0.8} />
      </mesh>
    </group>
  )
}

function FairyHouse({ pos, color, size }: P8) {
  const c = color || '#ff9454'
  const lightRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (lightRef.current) {
      (lightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* main mushroom stem / wall */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.35, size * 0.4, size, 12]} />
        <meshStandardMaterial color="#f5ecd4" roughness={0.8} />
      </mesh>
      {/* roof cap */}
      <mesh position={[0, size * 1.1, 0]} castShadow>
        <coneGeometry args={[size * 0.7, size * 0.8, 12]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      {/* cap spots */}
      {([0, 1.2, 2.4, 3.6, 4.8] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.45,
          size * 1.25,
          Math.cos(angle) * size * 0.45,
        ]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
      ))}
      {/* door */}
      <mesh position={[0, size * 0.42, size * 0.39]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.4, size * 0.04]} />
        <meshStandardMaterial color="#7a4a1e" roughness={0.8} />
      </mesh>
      {/* window glow */}
      <mesh ref={lightRef} position={[0, size * 0.65, size * 0.38]}>
        <circleGeometry args={[size * 0.1, 8]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function RuneStoneGlow({ pos, color, size }: P8) {
  const c = color || '#7b2fff'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* main stone */}
      <mesh position={[0, size * 0.8, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size * 1.6, size * 0.22]} />
        <meshStandardMaterial color="#555566" roughness={0.9} />
      </mesh>
      {/* rune face glow */}
      <mesh ref={glowRef} position={[0, size * 0.9, size * 0.12]}>
        <boxGeometry args={[size * 0.36, size * 1.2, size * 0.04]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      {/* small rune symbols */}
      {([0.3, 0.7, 1.1, 1.4] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, size * 0.13]}>
          <boxGeometry args={[size * 0.22, size * 0.08, size * 0.02]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

function MagicMirror({ pos, color, size }: P8) {
  const c = color || '#88aaff'
  const surfaceRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (surfaceRef.current) {
      const t = clock.getElapsedTime()
      ;(surfaceRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 1.2) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* frame */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.55, size * 0.55, size * 0.07, 16]} />
        <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* mirror surface */}
      <mesh ref={surfaceRef} position={[0, size * 1.0, size * 0.04]}>
        <circleGeometry args={[size * 0.48, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} metalness={0.9} roughness={0.05} transparent opacity={0.85} />
      </mesh>
      {/* stand */}
      <mesh position={[0, size * 0.25, 0]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.5, 6]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* base */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.28, size * 0.08, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function CursedChest({ pos, color, size }: P8) {
  const c = color || '#1a4a1a'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* base */}
      <mesh position={[0, size * 0.28, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.55, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* lid */}
      <mesh position={[0, size * 0.62, 0]} castShadow>
        <boxGeometry args={[size * 0.9, size * 0.22, size * 0.65]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      {/* eerie glow seam */}
      <mesh ref={glowRef} position={[0, size * 0.56, size * 0.33]}>
        <boxGeometry args={[size * 0.88, size * 0.04, size * 0.04]} />
        <meshStandardMaterial color="#44ff44" emissive="#00ff00" emissiveIntensity={1} />
      </mesh>
      {/* lock skull */}
      <mesh position={[0, size * 0.42, size * 0.33]}>
        <sphereGeometry args={[size * 0.1, 6, 6]} />
        <meshStandardMaterial color="#334433" roughness={0.8} />
      </mesh>
      {/* corners metal */}
      {([-0.43, 0.43] as number[]).map((x, i) =>
        ([-0.31, 0.31] as number[]).map((z, j) => (
          <mesh key={`${i}${j}`} position={[size * x, size * 0.28, size * z]}>
            <boxGeometry args={[size * 0.08, size * 0.6, size * 0.08]} />
            <meshStandardMaterial color="#2a5a2a" metalness={0.5} roughness={0.4} />
          </mesh>
        ))
      )}
    </group>
  )
}

// ─── Batch 8: Sci-Tech ────────────────────────────────────────────────────────

function HologramDisplay({ pos, color, size }: P8) {
  const c = color || '#00ccff'
  const holoRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (holoRef.current) {
      holoRef.current.rotation.y = clock.getElapsedTime() * 0.5
    }
  })
  return (
    <group position={pos}>
      {/* base platform */}
      <mesh position={[0, size * 0.04, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.45, size * 0.08, 10]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* emitter ring */}
      <mesh position={[0, size * 0.1, 0]}>
        <torusGeometry args={[size * 0.3, size * 0.03, 6, 20]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
      {/* hologram content */}
      <group ref={holoRef} position={[0, size * 0.65, 0]}>
        <mesh>
          <boxGeometry args={[size * 0.35, size * 0.5, size * 0.05]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} transparent opacity={0.4} side={2} />
        </mesh>
        {/* data lines */}
        {([0.1, 0.2, 0.3] as number[]).map((h, i) => (
          <mesh key={i} position={[0, size * (h - 0.15), size * 0.03]}>
            <boxGeometry args={[size * (0.25 - i * 0.05), size * 0.02, size * 0.01]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function TeslaCoil({ pos, size }: P8) {
  const sparkRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sparkRef.current) {
      const t = clock.getElapsedTime()
      ;(sparkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (Math.sin(t * 12) > 0.5 ? 3 : 0.1)
    }
  })
  return (
    <group position={pos}>
      {/* base ring */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.4, size * 0.45, size * 0.12, 10]} />
        <meshStandardMaterial color="#444455" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* tower */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.16, size * 1.1, 8]} />
        <meshStandardMaterial color="#555566" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* top sphere */}
      <mesh position={[0, size * 1.25, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 14, 14]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* spark */}
      <mesh ref={sparkRef} position={[0, size * 1.25, 0]}>
        <sphereGeometry args={[size * 0.32, 8, 8]} />
        <meshStandardMaterial color="#cc88ff" emissive="#cc88ff" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      {/* coil rings */}
      {([0.3, 0.5, 0.7, 0.9] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * (0.14 - i * 0.01), size * 0.025, 4, 14]} />
          <meshStandardMaterial color="#aaaacc" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function DnaHelix({ pos, size }: P8) {
  const helixRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (helixRef.current) helixRef.current.rotation.y = clock.getElapsedTime() * 0.8
  })
  const steps = 10
  return (
    <group position={pos}>
      <group ref={helixRef}>
        {Array.from({ length: steps }).map((_, i) => {
          const angle = (i / steps) * Math.PI * 4
          const y = (i / steps) * 1.5
          return (
            <group key={i}>
              <mesh position={[Math.sin(angle) * size * 0.25, size * (y + 0.1), Math.cos(angle) * size * 0.25]}>
                <sphereGeometry args={[size * 0.07, 6, 6]} />
                <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
              </mesh>
              <mesh position={[-Math.sin(angle) * size * 0.25, size * (y + 0.1), -Math.cos(angle) * size * 0.25]}>
                <sphereGeometry args={[size * 0.07, 6, 6]} />
                <meshStandardMaterial color="#ff4488" emissive="#ff4488" emissiveIntensity={0.8} />
              </mesh>
              {/* crossbar */}
              <mesh position={[0, size * (y + 0.1), 0]} rotation={[0, angle, Math.PI / 2]}>
                <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.5, 5]} />
                <meshStandardMaterial color="#aaffcc" />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

function LaserBeam({ pos, color, size }: P8) {
  const c = color || '#ff0044'
  const beamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.6 + Math.sin(clock.getElapsedTime() * 8) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* emitter base */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.18, size * 0.22, size * 0.2, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* beam */}
      <mesh ref={beamRef} position={[0, size * 1.1, 0]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 2, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      {/* tip glow */}
      <mesh position={[0, size * 0.22, 0]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function ComputerTerminal({ pos, size }: P8) {
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (screenRef.current) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 0.5) * 0.2
    }
  })
  return (
    <group position={pos}>
      {/* base unit */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.8, size * 0.3]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.5, size * 0.16]}>
        <boxGeometry args={[size * 0.6, size * 0.5, size * 0.02]} />
        <meshStandardMaterial color="#004488" emissive="#0066cc" emissiveIntensity={0.5} />
      </mesh>
      {/* side panels */}
      <mesh position={[size * 0.36, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.75, size * 0.28]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-size * 0.36, size * 0.4, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.75, size * 0.28]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.8} />
      </mesh>
      {/* keyboard */}
      <mesh position={[0, size * 0.04, size * 0.22]}>
        <boxGeometry args={[size * 0.65, size * 0.04, size * 0.32]} />
        <meshStandardMaterial color="#111122" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

function ReactorCore({ pos, color, size }: P8) {
  const c = color || '#88ff44'
  const coreRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (coreRef.current) {
      const t = clock.getElapsedTime()
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(t * 2) * 0.8
    }
  })
  return (
    <group position={pos}>
      {/* outer housing */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.5, size * 0.55, size * 1.4, 10]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* core glow */}
      <mesh ref={coreRef} position={[0, size * 0.7, 0]}>
        <sphereGeometry args={[size * 0.3, 12, 12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* rings */}
      {([0.3, 0.7, 1.1] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.52, size * 0.03, 5, 18]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* vents */}
      {([0, Math.PI / 2, Math.PI, Math.PI * 1.5] as number[]).map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * size * 0.52, size * 0.7, Math.cos(a) * size * 0.52]}>
          <boxGeometry args={[size * 0.1, size * 0.4, size * 0.08]} />
          <meshStandardMaterial color="#333344" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function DataTower({ pos, color, size }: P8) {
  const c = color || '#0044ff'
  const ledRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ledRef.current) {
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + ((Math.sin(clock.getElapsedTime() * 5) + 1) / 2) * 1.5
    }
  })
  return (
    <group position={pos}>
      {/* main shaft */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <boxGeometry args={[size * 0.45, size * 2.0, size * 0.45]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* LED strips */}
      <mesh ref={ledRef} position={[size * 0.23, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.03, size * 1.9, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
      </mesh>
      <mesh position={[-size * 0.23, size * 1.0, 0]}>
        <boxGeometry args={[size * 0.03, size * 1.9, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} />
      </mesh>
      {/* shelf rings */}
      {([0.4, 0.9, 1.4, 1.85] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <boxGeometry args={[size * 0.52, size * 0.04, size * 0.52]} />
          <meshStandardMaterial color="#1a1a33" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* top antenna */}
      <mesh position={[0, size * 2.15, 0]}>
        <cylinderGeometry args={[size * 0.02, size * 0.04, size * 0.3, 6]} />
        <meshStandardMaterial color="#aaaacc" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function MagnifyingGlass({ pos, size }: P8) {
  return (
    <group position={pos} rotation={[0, 0, 0.4]}>
      {/* lens ring */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <torusGeometry args={[size * 0.38, size * 0.06, 8, 24]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* glass */}
      <mesh position={[0, size * 0.7, 0]}>
        <circleGeometry args={[size * 0.34, 20]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.3} metalness={0.1} roughness={0.05} />
      </mesh>
      {/* handle */}
      <mesh position={[size * 0.18, size * 0.24, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 0.7, 8]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function PortalGun({ pos, color, size }: P8) {
  const c = color || '#ff8800'
  const muzzleRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (muzzleRef.current) {
      (muzzleRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1 + Math.sin(clock.getElapsedTime() * 4) * 0.5
    }
  })
  return (
    <group position={pos} rotation={[0, Math.PI / 4, 0]}>
      {/* body */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <capsuleGeometry args={[size * 0.15, size * 0.55, 6, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* barrel */}
      <mesh position={[0, size * 0.85, size * 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.1, size * 0.12, size * 0.65, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* muzzle glow */}
      <mesh ref={muzzleRef} position={[0, size * 0.85, size * 0.65]}>
        <sphereGeometry args={[size * 0.12, 8, 8]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>
      {/* handle */}
      <mesh position={[0, size * 0.18, 0]}>
        <boxGeometry args={[size * 0.15, size * 0.35, size * 0.22]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* accent stripe */}
      <mesh position={[size * 0.16, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.03, size * 0.55, size * 0.3]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function HoverPad({ pos, color, size }: P8) {
  const c = color || '#44aaff'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * size * 0.06
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef}>
        {/* pad surface */}
        <mesh position={[0, size * 0.08, 0]} castShadow>
          <cylinderGeometry args={[size * 0.55, size * 0.5, size * 0.12, 12]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* edge glow */}
        <mesh position={[0, size * 0.08, 0]}>
          <torusGeometry args={[size * 0.52, size * 0.04, 6, 20]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
        </mesh>
        {/* underside thruster glow */}
        <mesh position={[0, size * 0.01, 0]}>
          <circleGeometry args={[size * 0.4, 16]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
        {/* top markings */}
        <mesh position={[0, size * 0.15, 0]}>
          <circleGeometry args={[size * 0.25, 12]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Batch 9: Ocean Park ─────────────────────────────────────────────────────
interface P9 { pos: [number,number,number]; color: string; size: number }

function Jellyfish({ pos, color, size }: P9) {
  const c = color || '#ff88cc'
  const bodyRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.2) * size * 0.08
      bodyRef.current.scale.y = 1 + Math.sin(t * 2.4) * 0.08
    }
  })
  return (
    <group position={pos}>
      <group ref={bodyRef}>
        {/* bell */}
        <mesh position={[0, size * 0.6, 0]} castShadow>
          <sphereGeometry args={[size * 0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={c} transparent opacity={0.65} roughness={0.2} />
        </mesh>
        {/* tentacles */}
        {([0, 0.8, 1.6, 2.4, 3.2, 4.0] as number[]).map((angle, i) => (
          <mesh key={i} position={[
            Math.sin(angle) * size * 0.2,
            size * 0.28,
            Math.cos(angle) * size * 0.2,
          ]}>
            <cylinderGeometry args={[size * 0.015, size * 0.008, size * 0.5, 4]} />
            <meshStandardMaterial color={c} transparent opacity={0.5} />
          </mesh>
        ))}
        {/* inner glow */}
        <mesh position={[0, size * 0.62, 0]}>
          <sphereGeometry args={[size * 0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  )
}

function ClamShell({ pos, color, size }: P9) {
  const c = color || '#f0e0c0'
  return (
    <group position={pos}>
      {/* bottom shell */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* top shell (tilted open) */}
      <mesh position={[0, size * 0.1, -size * 0.1]} rotation={[-0.6, 0, 0]} castShadow>
        <sphereGeometry args={[size * 0.5, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.7} side={2} />
      </mesh>
      {/* pearl */}
      <mesh position={[0, size * 0.22, 0]}>
        <sphereGeometry args={[size * 0.12, 10, 10]} />
        <meshStandardMaterial color="#f8f8ff" metalness={0.6} roughness={0.1} />
      </mesh>
    </group>
  )
}

function CrabProp({ pos, color, size }: P9) {
  const c = color || '#ff5522'
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* shell dome */}
      <mesh position={[0, size * 0.3, 0]}>
        <sphereGeometry args={[size * 0.35, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
      {/* eyes */}
      <mesh position={[size * 0.16, size * 0.42, size * 0.24]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-size * 0.16, size * 0.42, size * 0.24]}>
        <sphereGeometry args={[size * 0.06, 6, 6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* claws */}
      <mesh position={[size * 0.55, size * 0.25, size * 0.1]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.55, size * 0.25, size * 0.1]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* legs */}
      {([-0.2, 0, 0.2] as number[]).map((z, i) => (
        <group key={i}>
          <mesh position={[size * 0.42, size * 0.12, size * z]} rotation={[0, 0, 0.8]}>
            <cylinderGeometry args={[size * 0.025, size * 0.02, size * 0.38, 5]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
          <mesh position={[-size * 0.42, size * 0.12, size * z]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[size * 0.025, size * 0.02, size * 0.38, 5]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SeaweedTall({ pos, color, size }: P9) {
  const c = color || '#2a8b2a'
  const sway1 = useRef<THREE.Mesh>(null!)
  const sway2 = useRef<THREE.Mesh>(null!)
  const sway3 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (sway1.current) sway1.current.rotation.z = Math.sin(t * 1.2) * 0.12
    if (sway2.current) sway2.current.rotation.z = Math.sin(t * 1.4 + 0.5) * 0.15
    if (sway3.current) sway3.current.rotation.z = Math.sin(t * 1.1 + 1.0) * 0.1
  })
  return (
    <group position={pos}>
      <mesh ref={sway1} position={[-size * 0.1, size * 0.6, 0]}>
        <capsuleGeometry args={[size * 0.06, size * 1.2, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh ref={sway2} position={[size * 0.12, size * 0.7, size * 0.05]}>
        <capsuleGeometry args={[size * 0.05, size * 1.4, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
      <mesh ref={sway3} position={[0, size * 0.55, -size * 0.08]}>
        <capsuleGeometry args={[size * 0.055, size * 1.1, 4, 8]} />
        <meshStandardMaterial color={c} roughness={0.6} />
      </mesh>
    </group>
  )
}

function DivingBell({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* bell dome */}
      <mesh position={[0, size * 0.65, 0]} castShadow>
        <sphereGeometry args={[size * 0.45, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#b0b8c8" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* porthole */}
      <mesh position={[0, size * 0.75, size * 0.44]}>
        <circleGeometry args={[size * 0.12, 10]} />
        <meshStandardMaterial color="#88ccdd" transparent opacity={0.6} />
      </mesh>
      {/* ring porthole */}
      <mesh position={[0, size * 0.75, size * 0.44]}>
        <torusGeometry args={[size * 0.13, size * 0.025, 6, 14]} />
        <meshStandardMaterial color="#888899" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* chain */}
      {([0.2, 0.4, 0.6, 0.8] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * (0.9 + h * 0.3), 0]}>
          <torusGeometry args={[size * 0.07, size * 0.02, 5, 10]} />
          <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* bottom platform */}
      <mesh position={[0, size * 0.22, 0]} castShadow>
        <cylinderGeometry args={[size * 0.46, size * 0.46, size * 0.06, 10]} />
        <meshStandardMaterial color="#9a9aaa" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function ReefRock({ pos, color, size }: P9) {
  const c = color || '#cc7744'
  return (
    <group position={pos}>
      {/* main rock */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.42, 0]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
      {/* coral bumps */}
      {([0, 1.2, 2.4, 3.6] as number[]).map((angle, i) => (
        <group key={i}>
          <mesh position={[
            Math.sin(angle) * size * 0.32,
            size * 0.7,
            Math.cos(angle) * size * 0.32,
          ]}>
            <coneGeometry args={[size * 0.06, size * 0.25, 5]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#ff6688' : '#ff9944'} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SeaStar({ pos, color, size }: P9) {
  const c = color || '#ff8844'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (floatRef.current) {
      floatRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.08
    }
  })
  return (
    <group position={pos}>
      <group ref={floatRef} position={[0, size * 0.06, 0]}>
        {/* 5 arms */}
        {([0, 72, 144, 216, 288] as number[]).map((deg, i) => {
          const rad = (deg * Math.PI) / 180
          return (
            <mesh
              key={i}
              position={[Math.sin(rad) * size * 0.28, 0, Math.cos(rad) * size * 0.28]}
              rotation={[0, rad, 0]}
            >
              <boxGeometry args={[size * 0.14, size * 0.07, size * 0.55]} />
              <meshStandardMaterial color={c} roughness={0.5} />
            </mesh>
          )
        })}
        {/* center */}
        <mesh position={[0, size * 0.04, 0]}>
          <sphereGeometry args={[size * 0.18, 8, 8]} />
          <meshStandardMaterial color={c} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

function MantaRay({ pos, color, size }: P9) {
  const c = color || '#3355aa'
  const floatRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.8) * size * 0.12
    }
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={floatRef}>
        {/* left wing */}
        <mesh position={[-size * 0.45, 0, 0]} rotation={[0.15, 0, 0.12]}>
          <boxGeometry args={[size * 0.9, size * 0.04, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        {/* right wing */}
        <mesh position={[size * 0.45, 0, 0]} rotation={[-0.15, 0, -0.12]}>
          <boxGeometry args={[size * 0.9, size * 0.04, size * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.5} side={2} />
        </mesh>
        {/* body */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[size * 0.12, size * 0.5, 4, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* tail */}
        <mesh position={[0, 0, -size * 0.55]}>
          <coneGeometry args={[size * 0.06, size * 0.5, 4]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function PufferFish({ pos, color, size }: P9) {
  const c = color || '#ffaa33'
  const puffRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (puffRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.05
      puffRef.current.scale.setScalar(s)
    }
  })
  return (
    <group position={pos}>
      <group ref={puffRef} position={[0, size * 0.5, 0]}>
        {/* body */}
        <mesh castShadow>
          <sphereGeometry args={[size * 0.4, 14, 14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* spines */}
        {Array.from({ length: 18 }).map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 18)
          const theta = Math.PI * (1 + Math.sqrt(5)) * i
          return (
            <mesh key={i} position={[
              Math.sin(phi) * Math.cos(theta) * size * 0.42,
              Math.cos(phi) * size * 0.42,
              Math.sin(phi) * Math.sin(theta) * size * 0.42,
            ]}>
              <coneGeometry args={[size * 0.025, size * 0.14, 4]} />
              <meshStandardMaterial color="#cc8800" roughness={0.4} />
            </mesh>
          )
        })}
        {/* eyes */}
        <mesh position={[size * 0.2, size * 0.08, size * 0.34]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[-size * 0.2, size * 0.08, size * 0.34]}>
          <sphereGeometry args={[size * 0.08, 6, 6]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    </group>
  )
}

function SunkenShipBow({ pos, size }: P9) {
  return (
    <group position={pos} rotation={[0.25, 0.1, -0.15]}>
      {/* hull */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 0.8, size * 0.8, size * 1.5]} />
        <meshStandardMaterial color="#5a4a2a" roughness={0.9} />
      </mesh>
      {/* bow prow */}
      <mesh position={[0, size * 0.5, size * 0.85]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.7, size * 0.4]} />
        <meshStandardMaterial color="#4a3a1a" roughness={0.9} />
      </mesh>
      {/* mast stump */}
      <mesh position={[0, size * 1.2, -size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.06, size * 0.09, size * 0.9, 6]} />
        <meshStandardMaterial color="#6a5a2a" roughness={0.9} />
      </mesh>
      {/* barnacles / algae patches */}
      {([0.1, 0.4, 0.7] as number[]).map((z, i) => (
        <mesh key={i} position={[size * 0.41, size * 0.4, size * (z - 0.3)]}>
          <sphereGeometry args={[size * 0.08, 5, 5]} />
          <meshStandardMaterial color="#336633" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Batch 9: Jungle Park ────────────────────────────────────────────────────

function JungleBridge({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* planks */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, size * 0.1, size * (-0.9 + i * 0.3)]} castShadow>
          <boxGeometry args={[size * 0.85, size * 0.07, size * 0.18]} />
          <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* side ropes */}
      <mesh position={[size * 0.43, size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.9, 5]} rotation-z={0} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[-size * 0.43, size * 0.35, 0]}>
        <cylinderGeometry args={[size * 0.03, size * 0.03, size * 1.9, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {/* vertical ropes */}
      {([-0.8, -0.3, 0.2, 0.7] as number[]).map((z, i) => (
        <mesh key={i} position={[size * 0.43, size * 0.22, size * z]}>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 4]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function TribalDrum({ pos, color, size }: P9) {
  const c = color || '#8b4513'
  return (
    <group position={pos}>
      {/* drum body */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <cylinderGeometry args={[size * 0.38, size * 0.38, size * 0.9, 12]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      {/* drum heads */}
      <mesh position={[0, size * 0.92, 0]}>
        <cylinderGeometry args={[size * 0.39, size * 0.39, size * 0.04, 12]} />
        <meshStandardMaterial color="#f5e0c0" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.02, 0]}>
        <cylinderGeometry args={[size * 0.39, size * 0.39, size * 0.04, 12]} />
        <meshStandardMaterial color="#f5e0c0" roughness={0.7} />
      </mesh>
      {/* roping pattern */}
      {([0.25, 0.45, 0.65] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * 0.4, size * 0.02, 5, 16]} />
          <meshStandardMaterial color="#5a3010" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function JungleFlower({ pos, color, size }: P9) {
  const c = color || '#ff3355'
  return (
    <group position={pos}>
      {/* stem */}
      <mesh position={[0, size * 0.35, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size * 0.7, 6]} />
        <meshStandardMaterial color="#2d6b2d" roughness={0.7} />
      </mesh>
      {/* petals */}
      {([0, 60, 120, 180, 240, 300] as number[]).map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.sin(rad) * size * 0.3, size * 0.74, Math.cos(rad) * size * 0.3]}
            rotation={[0, rad, 0.4]}
          >
            <capsuleGeometry args={[size * 0.09, size * 0.35, 4, 6]} />
            <meshStandardMaterial color={c} roughness={0.5} />
          </mesh>
        )
      })}
      {/* center */}
      <mesh position={[0, size * 0.78, 0]}>
        <sphereGeometry args={[size * 0.14, 8, 8]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffcc00" emissiveIntensity={0.3} roughness={0.4} />
      </mesh>
      {/* leaves */}
      <mesh position={[size * 0.22, size * 0.4, 0]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[size * 0.06, size * 0.4, 3, 6]} />
        <meshStandardMaterial color="#2d6b2d" roughness={0.6} />
      </mesh>
    </group>
  )
}

function TreeGiant({ pos, color, size }: P9) {
  const c = color || '#2d6b2d'
  return (
    <group position={pos}>
      {/* main trunk */}
      <mesh position={[0, size * 1.0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.3, size * 0.45, size * 2.0, 10]} />
        <meshStandardMaterial color="#5a3010" roughness={0.9} />
      </mesh>
      {/* buttress roots */}
      {([0, 1.2, 2.4, 3.6, 4.8] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.5,
          size * 0.2,
          Math.cos(angle) * size * 0.5,
        ]} rotation={[0, angle, 0.5]}>
          <boxGeometry args={[size * 0.12, size * 0.5, size * 0.5]} />
          <meshStandardMaterial color="#5a3010" roughness={0.9} />
        </mesh>
      ))}
      {/* canopy layers */}
      <mesh position={[0, size * 2.3, 0]} castShadow>
        <sphereGeometry args={[size * 0.9, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[size * 0.4, size * 1.9, size * 0.2]} castShadow>
        <sphereGeometry args={[size * 0.55, 8, 6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
      <mesh position={[-size * 0.35, size * 2.0, -size * 0.15]} castShadow>
        <sphereGeometry args={[size * 0.6, 8, 6]} />
        <meshStandardMaterial color={c} roughness={0.7} />
      </mesh>
    </group>
  )
}

function ParrotPerch({ pos, color, size }: P9) {
  const c = color || '#ff4400'
  const bobRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (bobRef.current) {
      bobRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.08
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.05, size, 6]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* perch bar */}
      <mesh position={[0, size * 0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.5, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* parrot body */}
      <group ref={bobRef} position={[size * 0.1, size * 1.05, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[size * 0.12, size * 0.2, 4, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* head */}
        <mesh position={[0, size * 0.22, 0]}>
          <sphereGeometry args={[size * 0.13, 8, 8]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* wing */}
        <mesh position={[size * 0.14, 0, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[size * 0.22, size * 0.04, size * 0.28]} />
          <meshStandardMaterial color="#ff8800" roughness={0.5} />
        </mesh>
        {/* beak */}
        <mesh position={[0, size * 0.22, size * 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[size * 0.04, size * 0.1, 4]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.4} />
        </mesh>
        {/* eye */}
        <mesh position={[size * 0.08, size * 0.26, size * 0.1]}>
          <sphereGeometry args={[size * 0.03, 5, 5]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* tail */}
        <mesh position={[0, -size * 0.22, -size * 0.08]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[size * 0.08, size * 0.04, size * 0.32]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

function WaterfallSmall({ pos, color, size }: P9) {
  const c = color || '#4fc3f7'
  const splashRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (splashRef.current) {
      (splashRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.5 + Math.sin(clock.getElapsedTime() * 4) * 0.25
    }
  })
  return (
    <group position={pos}>
      {/* cliff */}
      <mesh position={[0, size * 0.7, -size * 0.1]} castShadow>
        <boxGeometry args={[size * 0.8, size * 1.4, size * 0.35]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
      </mesh>
      {/* water stream */}
      <mesh position={[0, size * 0.55, size * 0.06]}>
        <boxGeometry args={[size * 0.3, size * 1.1, size * 0.04]} />
        <meshStandardMaterial color={c} transparent opacity={0.65} emissive={c} emissiveIntensity={0.2} />
      </mesh>
      {/* pool */}
      <mesh position={[0, size * 0.04, size * 0.22]}>
        <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.06, 12]} />
        <meshStandardMaterial color={c} transparent opacity={0.7} />
      </mesh>
      {/* splash */}
      <mesh ref={splashRef} position={[0, size * 0.08, size * 0.22]}>
        <sphereGeometry args={[size * 0.25, 8, 6, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

function BambooWall({ pos, color, size }: P9) {
  const c = color || '#5ba55b'
  return (
    <group position={pos}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[size * (-0.8 + i * 0.4), size * 0.7, 0]} castShadow>
          <cylinderGeometry args={[size * 0.07, size * 0.08, size * 1.4, 7]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
      {/* nodes on each stalk */}
      {Array.from({ length: 5 }).map((_, i) =>
        ([0.3, 0.65, 1.0] as number[]).map((h, j) => (
          <mesh key={`${i}${j}`} position={[size * (-0.8 + i * 0.4), size * h, 0]}>
            <torusGeometry args={[size * 0.075, size * 0.02, 5, 10]} />
            <meshStandardMaterial color="#3d6e3d" roughness={0.7} />
          </mesh>
        ))
      )}
      {/* horizontal ties */}
      <mesh position={[0, size * 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 2.0, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, size * 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 2.0, 5]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  )
}

function FrogStatue({ pos, color, size }: P9) {
  const c = color || '#2a8b2a'
  return (
    <group position={pos}>
      {/* pedestal */}
      <mesh position={[0, size * 0.1, 0]} castShadow>
        <cylinderGeometry args={[size * 0.32, size * 0.36, size * 0.2, 8]} />
        <meshStandardMaterial color="#888880" roughness={0.9} />
      </mesh>
      {/* body */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <sphereGeometry args={[size * 0.3, 12, 10]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* belly */}
      <mesh position={[0, size * 0.38, size * 0.2]}>
        <sphereGeometry args={[size * 0.22, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88cc88" roughness={0.5} />
      </mesh>
      {/* head */}
      <mesh position={[0, size * 0.72, size * 0.06]} castShadow>
        <sphereGeometry args={[size * 0.25, 10, 8]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      {/* eyes */}
      <mesh position={[size * 0.16, size * 0.95, size * 0.08]}>
        <sphereGeometry args={[size * 0.1, 7, 7]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.3} />
      </mesh>
      <mesh position={[-size * 0.16, size * 0.95, size * 0.08]}>
        <sphereGeometry args={[size * 0.1, 7, 7]} />
        <meshStandardMaterial color="#ffdd00" roughness={0.3} />
      </mesh>
      {/* back legs */}
      <mesh position={[size * 0.3, size * 0.22, -size * 0.1]} rotation={[0, 0, -0.6]}>
        <capsuleGeometry args={[size * 0.07, size * 0.35, 4, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
      <mesh position={[-size * 0.3, size * 0.22, -size * 0.1]} rotation={[0, 0, 0.6]}>
        <capsuleGeometry args={[size * 0.07, size * 0.35, 4, 6]} />
        <meshStandardMaterial color={c} roughness={0.5} />
      </mesh>
    </group>
  )
}

function TempleRuin({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* back wall fragment */}
      <mesh position={[0, size * 0.7, -size * 0.4]} castShadow>
        <boxGeometry args={[size * 1.2, size * 1.4, size * 0.25]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* side pillar left */}
      <mesh position={[-size * 0.55, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 1.1, 8]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* side pillar right (broken) */}
      <mesh position={[size * 0.55, size * 0.35, size * 0.1]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.14, size * 0.7, 8]} />
        <meshStandardMaterial color="#9a8a6a" roughness={0.9} />
      </mesh>
      {/* fallen pillar segment */}
      <mesh position={[size * 0.6, size * 0.12, size * 0.55]} rotation={[Math.PI / 2, 0, 0.5]}>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 0.55, 8]} />
        <meshStandardMaterial color="#8a7a5a" roughness={0.9} />
      </mesh>
      {/* debris blocks */}
      {([[-0.1, 0.06, 0.3], [0.25, 0.06, 0.4], [-0.3, 0.06, 0.15]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={[size * p[0], size * p[1], size * p[2]]} rotation={[0, i * 0.7, 0]}>
          <boxGeometry args={[size * 0.22, size * 0.12, size * 0.18]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function TreasureMapStand({ pos, size }: P9) {
  return (
    <group position={pos}>
      {/* stand legs */}
      <mesh position={[-size * 0.2, size * 0.3, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[size * 0.03, size * 0.04, size * 0.6, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.2, size * 0.3, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[size * 0.03, size * 0.04, size * 0.6, 5]} />
        <meshStandardMaterial color="#8b5a1a" roughness={0.8} />
      </mesh>
      {/* map surface */}
      <mesh position={[0, size * 0.72, 0]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[size * 0.7, size * 0.5, size * 0.03]} />
        <meshStandardMaterial color="#c8a870" roughness={0.8} />
      </mesh>
      {/* map details */}
      <mesh position={[0, size * 0.72, size * 0.02]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[size * 0.55, size * 0.35, size * 0.01]} />
        <meshStandardMaterial color="#b89050" roughness={0.9} />
      </mesh>
      {/* X marks the spot */}
      <mesh position={[size * 0.1, size * 0.76, size * 0.022]} rotation={[-0.15, 0, Math.PI / 4]}>
        <boxGeometry args={[size * 0.14, size * 0.025, size * 0.01]} />
        <meshStandardMaterial color="#8b2222" roughness={0.8} />
      </mesh>
      <mesh position={[size * 0.1, size * 0.76, size * 0.022]} rotation={[-0.15, 0, -Math.PI / 4]}>
        <boxGeometry args={[size * 0.14, size * 0.025, size * 0.01]} />
        <meshStandardMaterial color="#8b2222" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Batch 10: Steampunk ─────────────────────────────────────────────────────
interface P10 { pos: [number,number,number]; color: string; size: number }

function SteamPipe({ pos, color, size }: P10) {
  const c = color || '#8b6914'
  const steamRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (steamRef.current) {
      steamRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3
      ;(steamRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.25 + Math.sin(clock.getElapsedTime() * 2) * 0.12
    }
  })
  return (
    <group position={pos}>
      {/* main horizontal pipe */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.12, size * 0.12, size * 1.0, 10]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* vertical elbow */}
      <mesh position={[0, size * 0.82, 0]}>
        <torusGeometry args={[size * 0.16, size * 0.1, 8, 10, Math.PI / 2]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* vertical section */}
      <mesh position={[size * 0.16, size * 1.05, 0]} castShadow>
        <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.46, 8]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* valve */}
      <mesh position={[0, size * 0.55, 0]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#884400" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* steam cloud */}
      <mesh ref={steamRef} position={[size * 0.16, size * 1.4, 0]}>
        <sphereGeometry args={[size * 0.18, 8, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* pipe rings */}
      {([-0.3, 0.3] as number[]).map((x, i) => (
        <mesh key={i} position={[size * x, size * 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[size * 0.13, size * 0.025, 5, 12]} />
          <meshStandardMaterial color="#6a5000" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function ClockworkGear({ pos, color, size }: P10) {
  const c = color || '#c0a040'
  const gearRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (gearRef.current) gearRef.current.rotation.z = clock.getElapsedTime() * 0.6
  })
  const teeth = 12
  return (
    <group position={pos}>
      <group ref={gearRef} position={[0, size * 0.5, 0]}>
        {/* main disk */}
        <mesh>
          <cylinderGeometry args={[size * 0.4, size * 0.4, size * 0.1, 20]} />
          <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
        </mesh>
        {/* hub */}
        <mesh>
          <cylinderGeometry args={[size * 0.1, size * 0.1, size * 0.12, 8]} />
          <meshStandardMaterial color="#8b7000" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* teeth */}
        {Array.from({ length: teeth }).map((_, i) => {
          const angle = (i / teeth) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.sin(angle) * size * 0.44, 0, Math.cos(angle) * size * 0.44]}>
              <boxGeometry args={[size * 0.09, size * 0.12, size * 0.12]} />
              <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
            </mesh>
          )
        })}
        {/* spokes */}
        {([0, Math.PI / 2, Math.PI, Math.PI * 1.5] as number[]).map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0]}>
            <boxGeometry args={[size * 0.06, size * 0.1, size * 0.7]} />
            <meshStandardMaterial color="#9a8020" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function AirshipEngine({ pos, color, size }: P10) {
  const c = color || '#a07820'
  const propRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (propRef.current) propRef.current.rotation.z = clock.getElapsedTime() * 8
  })
  return (
    <group position={pos}>
      {/* engine cylinder */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.3, size * 0.8, 10]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* exhaust pipe */}
      <mesh position={[size * 0.28, size * 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.4, 6]} />
        <meshStandardMaterial color="#5a3a00" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* propeller group */}
      <group ref={propRef} position={[0, size * 0.5, size * 0.32]}>
        <mesh>
          <cylinderGeometry args={[size * 0.05, size * 0.05, size * 0.06, 6]} />
          <meshStandardMaterial color="#886600" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* blades */}
        {([0, 1, 2] as number[]).map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <boxGeometry args={[size * 0.06, size * 0.55, size * 0.04]} />
            <meshStandardMaterial color="#6a5000" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {/* bands */}
      {([0.25, 0.5, 0.75] as number[]).map((h, i) => (
        <mesh key={i} position={[0, size * h, 0]}>
          <torusGeometry args={[size * 0.31, size * 0.03, 5, 14]} />
          <meshStandardMaterial color="#5a3a00" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function PressureGauge({ pos, size }: P10) {
  const needleRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (needleRef.current) {
      const t = clock.getElapsedTime()
      needleRef.current.rotation.z = -0.5 + Math.sin(t * 0.8) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* mounting plate */}
      <mesh position={[0, size * 0.4, 0]} castShadow>
        <boxGeometry args={[size * 0.55, size * 0.55, size * 0.06]} />
        <meshStandardMaterial color="#888880" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* gauge face */}
      <mesh position={[0, size * 0.4, size * 0.04]}>
        <circleGeometry args={[size * 0.22, 16]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.8} />
      </mesh>
      {/* bezel */}
      <mesh position={[0, size * 0.4, size * 0.034]}>
        <torusGeometry args={[size * 0.23, size * 0.025, 6, 18]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* needle */}
      <mesh ref={needleRef} position={[0, size * 0.4, size * 0.05]}>
        <boxGeometry args={[size * 0.025, size * 0.18, size * 0.02]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} />
      </mesh>
      {/* pipe connector */}
      <mesh position={[0, size * 0.12, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.25, 6]} />
        <meshStandardMaterial color="#888880" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function SteamLocomotive({ pos, size }: P10) {
  const smokeRef = useRef<THREE.Mesh>(null!)
  const wheelRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (smokeRef.current) {
      smokeRef.current.scale.y = 1 + Math.sin(t * 3) * 0.25
      ;(smokeRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.3 + Math.sin(t * 2.5) * 0.15
    }
    if (wheelRef.current) wheelRef.current.rotation.z = t * 2
  })
  return (
    <group position={pos}>
      {/* boiler */}
      <mesh position={[0, size * 0.55, 0]} castShadow>
        <cylinderGeometry args={[size * 0.28, size * 0.28, size * 1.0, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* cab */}
      <mesh position={[0, size * 0.78, -size * 0.45]} castShadow>
        <boxGeometry args={[size * 0.6, size * 0.5, size * 0.5]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* smokestack */}
      <mesh position={[0, size * 0.95, size * 0.3]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.4, 7]} />
        <meshStandardMaterial color="#111111" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* smoke */}
      <mesh ref={smokeRef} position={[0, size * 1.3, size * 0.3]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#aaaaaa" transparent opacity={0.35} />
      </mesh>
      {/* wheels group */}
      <group ref={wheelRef}>
        {([-0.35, 0] as number[]).map((z, i) => (
          <group key={i}>
            <mesh position={[size * 0.3, size * 0.2, size * z]}>
              <torusGeometry args={[size * 0.2, size * 0.04, 6, 14]} />
              <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[-size * 0.3, size * 0.2, size * z]}>
              <torusGeometry args={[size * 0.2, size * 0.04, 6, 14]} />
              <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function CogTower({ pos, color, size }: P10) {
  const c = color || '#8b6914'
  const gear1Ref = useRef<THREE.Mesh>(null!)
  const gear2Ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (gear1Ref.current) gear1Ref.current.rotation.z = t * 0.7
    if (gear2Ref.current) gear2Ref.current.rotation.z = -t * 1.0
  })
  return (
    <group position={pos}>
      {/* tower */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.4, size * 1.4, size * 0.4]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.8} />
      </mesh>
      {/* big gear */}
      <mesh ref={gear1Ref} position={[0, size * 1.0, size * 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.32, size * 0.32, size * 0.06, 16]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* small gear */}
      <mesh ref={gear2Ref} position={[size * 0.32, size * 0.7, size * 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.18, size * 0.18, size * 0.05, 12]} />
        <meshStandardMaterial color={c} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* platform */}
      <mesh position={[0, size * 1.42, 0]}>
        <boxGeometry args={[size * 0.52, size * 0.08, size * 0.52]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.8} />
      </mesh>
    </group>
  )
}

function TeslaLamp({ pos, size }: P10) {
  const sparkRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (sparkRef.current) {
      ;(sparkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + (Math.sin(clock.getElapsedTime() * 15) > 0.3 ? 2.5 : 0)
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.06, size, 6]} />
        <meshStandardMaterial color="#5a4010" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* lamp cage */}
      <mesh position={[0, size * 1.05, 0]} castShadow>
        <sphereGeometry args={[size * 0.2, 10, 8]} />
        <meshStandardMaterial color="#c0a040" metalness={0.7} roughness={0.3} wireframe />
      </mesh>
      {/* inner glow */}
      <mesh position={[0, size * 1.05, 0]}>
        <sphereGeometry args={[size * 0.16, 8, 8]} />
        <meshStandardMaterial color="#fff3a0" emissive="#ffdd44" emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      {/* spark arc */}
      <mesh ref={sparkRef} position={[size * 0.18, size * 1.05, 0]}>
        <sphereGeometry args={[size * 0.06, 5, 5]} />
        <meshStandardMaterial color="#aaccff" emissive="#aaccff" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

function BrassTelescope({ pos, color, size }: P10) {
  const c = color || '#b8860b'
  return (
    <group position={pos} rotation={[0, 0.5, 0]}>
      {/* tripod */}
      {([0, 2.1, 4.2] as number[]).map((angle, i) => (
        <mesh key={i} position={[
          Math.sin(angle) * size * 0.22,
          size * 0.2,
          Math.cos(angle) * size * 0.22,
        ]} rotation={[0.25, angle, 0]}>
          <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.5, 5]} />
          <meshStandardMaterial color="#5a3a00" roughness={0.8} />
        </mesh>
      ))}
      {/* mount head */}
      <mesh position={[0, size * 0.45, 0]} castShadow>
        <sphereGeometry args={[size * 0.09, 7, 7]} />
        <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* main tube */}
      <mesh position={[0, size * 0.65, size * 0.18]} rotation={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.1, size * 0.7, 10]} />
        <meshStandardMaterial color={c} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* eyepiece */}
      <mesh position={[0, size * 0.45, size * 0.48]} rotation={[-0.55, 0, 0]}>
        <cylinderGeometry args={[size * 0.06, size * 0.08, size * 0.15, 8]} />
        <meshStandardMaterial color="#8b6914" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* lens ring */}
      <mesh position={[0, size * 0.87, -size * 0.14]} rotation={[-0.55, 0, 0]}>
        <torusGeometry args={[size * 0.1, size * 0.02, 5, 14]} />
        <meshStandardMaterial color="#c0a040" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function SteamVent({ pos, size }: P10) {
  const steamRef1 = useRef<THREE.Mesh>(null!)
  const steamRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (steamRef1.current) {
      steamRef1.current.position.y = size * 0.55 + Math.sin(t * 3) * size * 0.08
      ;(steamRef1.current.material as THREE.MeshStandardMaterial).opacity =
        0.35 + Math.sin(t * 4) * 0.2
    }
    if (steamRef2.current) {
      steamRef2.current.position.y = size * 0.8 + Math.sin(t * 3 + 1) * size * 0.08
      steamRef2.current.scale.x = 1 + Math.sin(t * 2.5 + 0.5) * 0.3
      ;(steamRef2.current.material as THREE.MeshStandardMaterial).opacity =
        0.2 + Math.sin(t * 3 + 1) * 0.15
    }
  })
  return (
    <group position={pos}>
      {/* valve body */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <cylinderGeometry args={[size * 0.16, size * 0.18, size * 0.4, 8]} />
        <meshStandardMaterial color="#888880" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, size * 0.42, 0]} castShadow>
        <cylinderGeometry args={[size * 0.08, size * 0.12, size * 0.2, 7]} />
        <meshStandardMaterial color="#777770" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* steam clouds */}
      <mesh ref={steamRef1} position={[0, size * 0.55, 0]}>
        <sphereGeometry args={[size * 0.18, 7, 7]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={steamRef2} position={[0, size * 0.8, 0]}>
        <sphereGeometry args={[size * 0.24, 7, 7]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
      {/* handle knob */}
      <mesh position={[size * 0.18, size * 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.35, 5]} />
        <meshStandardMaterial color="#884400" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Dirigible({ pos, color, size }: P10) {
  const c = color || '#c8a050'
  const floatRef = useRef<THREE.Group>(null!)
  const propRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (floatRef.current) floatRef.current.position.y = Math.sin(t * 0.7) * size * 0.1
    if (propRef.current) propRef.current.rotation.z = t * 6
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.8, pos[2]]}>
      <group ref={floatRef}>
        {/* envelope (balloon) */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[size * 0.28, size * 0.7, 6, 14]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
        {/* gondola */}
        <mesh position={[0, -size * 0.45, 0]} castShadow>
          <boxGeometry args={[size * 0.32, size * 0.18, size * 0.5]} />
          <meshStandardMaterial color="#5a3a10" roughness={0.7} />
        </mesh>
        {/* struts */}
        {([-0.1, 0.1] as number[]).map((x, i) => (
          <mesh key={i} position={[size * x, -size * 0.26, 0]} rotation={[0, 0, 0.2 * (i === 0 ? -1 : 1)]}>
            <cylinderGeometry args={[size * 0.02, size * 0.02, size * 0.42, 4]} />
            <meshStandardMaterial color="#8b7000" roughness={0.7} />
          </mesh>
        ))}
        {/* propeller */}
        <group ref={propRef} position={[0, -size * 0.45, size * 0.28]}>
          <mesh>
            <cylinderGeometry args={[size * 0.03, size * 0.03, size * 0.04, 5]} />
            <meshStandardMaterial color="#8b7000" metalness={0.6} roughness={0.3} />
          </mesh>
          {([0, 1] as number[]).map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI)]}>
              <boxGeometry args={[size * 0.04, size * 0.38, size * 0.04]} />
              <meshStandardMaterial color="#6a5000" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
        </group>
        {/* tail fin */}
        <mesh position={[0, 0, -size * 0.42]}>
          <boxGeometry args={[size * 0.12, size * 0.25, size * 0.06]} />
          <meshStandardMaterial color={c} roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Batch 10: Cyberpunk ─────────────────────────────────────────────────────

function NeonBillboard({ pos, color, size }: P10) {
  const c = color || '#00ffcc'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.6 + Math.sin(clock.getElapsedTime() * 1.5) * 0.4
    }
  })
  return (
    <group position={pos}>
      {/* post */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <cylinderGeometry args={[size * 0.05, size * 0.06, size * 1.2, 6]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* board */}
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 0.65, size * 0.08]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.6} />
      </mesh>
      {/* neon face */}
      <mesh ref={glowRef} position={[0, size * 1.3, size * 0.05]}>
        <boxGeometry args={[size * 1.1, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.7} />
      </mesh>
      {/* neon frame */}
      <mesh position={[0, size * 1.3, size * 0.05]}>
        <boxGeometry args={[size * 1.15, size * 0.03, size * 0.03]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

function CyberVending({ pos, color, size }: P10) {
  const c = color || '#ff0066'
  const screenRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (screenRef.current) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(clock.getElapsedTime() * 1.2) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* body */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 1.4, size * 0.38]} />
        <meshStandardMaterial color="#111122" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* screen */}
      <mesh ref={screenRef} position={[0, size * 0.9, size * 0.2]}>
        <boxGeometry args={[size * 0.5, size * 0.45, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      {/* neon stripe */}
      <mesh position={[0, size * 1.3, size * 0.2]}>
        <boxGeometry args={[size * 0.6, size * 0.04, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={2} />
      </mesh>
      {/* slot */}
      <mesh position={[0, size * 0.38, size * 0.2]}>
        <boxGeometry args={[size * 0.28, size * 0.06, size * 0.04]} />
        <meshStandardMaterial color="#333344" roughness={0.5} />
      </mesh>
      {/* side glow strips */}
      <mesh position={[size * 0.33, size * 0.7, size * 0.1]}>
        <boxGeometry args={[size * 0.02, size * 1.3, size * 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function HoloAd({ pos, color, size }: P10) {
  const c = color || '#0088ff'
  const holoRef = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (holoRef.current) {
      holoRef.current.rotation.y = clock.getElapsedTime() * 0.4
      const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.04
      holoRef.current.scale.y = s
    }
  })
  return (
    <group position={pos}>
      {/* emitter base */}
      <mesh position={[0, size * 0.06, 0]} castShadow>
        <cylinderGeometry args={[size * 0.22, size * 0.26, size * 0.12, 8]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, size * 0.14, 0]}>
        <torusGeometry args={[size * 0.18, size * 0.03, 5, 16]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} />
      </mesh>
      {/* holo content */}
      <group ref={holoRef} position={[0, size * 0.75, 0]}>
        <mesh>
          <boxGeometry args={[size * 0.45, size * 0.65, size * 0.02]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.5} transparent opacity={0.35} side={2} />
        </mesh>
        {/* scan lines */}
        {([0.1, 0.25, 0.4] as number[]).map((h, i) => (
          <mesh key={i} position={[0, size * (h - 0.2), size * 0.015]}>
            <boxGeometry args={[size * 0.38, size * 0.03, size * 0.01]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function DroneProp({ pos, size }: P10) {
  const droneRef = useRef<THREE.Group>(null!)
  const prop1 = useRef<THREE.Mesh>(null!)
  const prop2 = useRef<THREE.Mesh>(null!)
  const prop3 = useRef<THREE.Mesh>(null!)
  const prop4 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (droneRef.current) droneRef.current.position.y = Math.sin(t * 1.5) * size * 0.08
    if (prop1.current) prop1.current.rotation.z = t * 15
    if (prop2.current) prop2.current.rotation.z = -t * 15
    if (prop3.current) prop3.current.rotation.z = t * 15
    if (prop4.current) prop4.current.rotation.z = -t * 15
  })
  return (
    <group position={[pos[0], pos[1] + size * 0.5, pos[2]]}>
      <group ref={droneRef}>
        {/* center body */}
        <mesh castShadow>
          <boxGeometry args={[size * 0.3, size * 0.1, size * 0.3]} />
          <meshStandardMaterial color="#222233" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* camera */}
        <mesh position={[0, -size * 0.08, size * 0.14]}>
          <sphereGeometry args={[size * 0.06, 6, 6]} />
          <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.1} />
        </mesh>
        {/* arms */}
        {([[0.28, 0.28], [0.28, -0.28], [-0.28, 0.28], [-0.28, -0.28]] as [number, number][]).map(([x, z], i) => (
          <group key={i}>
            <mesh position={[size * x * 0.5, 0, size * z * 0.5]}>
              <boxGeometry args={[size * Math.abs(x) * 0.55, size * 0.05, size * 0.04]} />
              <meshStandardMaterial color="#333344" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* propeller */}
            <mesh
              ref={i === 0 ? prop1 : i === 1 ? prop2 : i === 2 ? prop3 : prop4}
              position={[size * x, size * 0.07, size * z]}
            >
              <boxGeometry args={[size * 0.35, size * 0.02, size * 0.06]} />
              <meshStandardMaterial color="#444455" transparent opacity={0.6} />
            </mesh>
            {/* motor */}
            <mesh position={[size * x, size * 0.02, size * z]}>
              <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.07, 7]} />
              <meshStandardMaterial color="#0088ff" emissive="#0044cc" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function CyberpunkCar({ pos, size }: P10) {
  const neonRef1 = useRef<THREE.Mesh>(null!)
  const neonRef2 = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const i = 0.7 + Math.sin(t * 1.5) * 0.3
    if (neonRef1.current) (neonRef1.current.material as THREE.MeshStandardMaterial).emissiveIntensity = i
    if (neonRef2.current) (neonRef2.current.material as THREE.MeshStandardMaterial).emissiveIntensity = i
  })
  return (
    <group position={pos}>
      {/* lower body */}
      <mesh position={[0, size * 0.2, 0]} castShadow>
        <boxGeometry args={[size * 1.1, size * 0.25, size * 0.56]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* cabin */}
      <mesh position={[0, size * 0.44, 0]} castShadow>
        <boxGeometry args={[size * 0.65, size * 0.28, size * 0.5]} />
        <meshStandardMaterial color="#0a0a18" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* windshield */}
      <mesh position={[size * 0.2, size * 0.44, 0]}>
        <boxGeometry args={[size * 0.22, size * 0.22, size * 0.48]} />
        <meshStandardMaterial color="#4488cc" transparent opacity={0.5} metalness={0.1} roughness={0.05} />
      </mesh>
      {/* under-glow */}
      <mesh ref={neonRef1} position={[0, size * 0.07, 0]}>
        <boxGeometry args={[size * 1.08, size * 0.02, size * 0.54]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.8} />
      </mesh>
      {/* rear glow */}
      <mesh ref={neonRef2} position={[-size * 0.56, size * 0.2, 0]}>
        <boxGeometry args={[size * 0.02, size * 0.14, size * 0.5]} />
        <meshStandardMaterial color="#ff2244" emissive="#ff0044" emissiveIntensity={0.8} />
      </mesh>
      {/* wheels */}
      {([[0.38, 0.22], [-0.38, 0.22], [0.38, -0.22], [-0.38, -0.22]] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[size * x, size * 0.12, size * z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 0.13, size * 0.05, 7, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function ServerRack({ pos, size }: P10) {
  const ledRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (ledRef.current) {
      (ledRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        ((Math.sin(clock.getElapsedTime() * 7) + 1) / 2) * 1.5
    }
  })
  return (
    <group position={pos}>
      {/* rack body */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <boxGeometry args={[size * 0.62, size * 1.4, size * 0.4]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* server units */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, size * (0.1 + i * 0.22), size * 0.21]}>
          <boxGeometry args={[size * 0.56, size * 0.18, size * 0.02]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
        </mesh>
      ))}
      {/* LED strip */}
      <mesh ref={ledRef} position={[size * 0.32, size * 0.7, size * 0.21]}>
        <boxGeometry args={[size * 0.025, size * 1.3, size * 0.025]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.8} />
      </mesh>
      {/* fans */}
      {([0.3, 0.9] as number[]).map((h, i) => (
        <mesh key={i} position={[-size * 0.22, size * h, size * 0.21]}>
          <cylinderGeometry args={[size * 0.07, size * 0.07, size * 0.03, 8]} />
          <meshStandardMaterial color="#333344" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function CyberStreetLamp({ pos, color, size }: P10) {
  const c = color || '#ff8800'
  const glowRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(clock.getElapsedTime() * 0.8) * 0.3
    }
  })
  return (
    <group position={pos}>
      {/* pole */}
      <mesh position={[0, size * 0.7, 0]} castShadow>
        <cylinderGeometry args={[size * 0.04, size * 0.055, size * 1.4, 6]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* arm */}
      <mesh position={[size * 0.18, size * 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[size * 0.025, size * 0.025, size * 0.4, 5]} />
        <meshStandardMaterial color="#111122" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* lamp housing */}
      <mesh position={[size * 0.38, size * 1.28, 0]} castShadow>
        <boxGeometry args={[size * 0.22, size * 0.1, size * 0.15]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* neon glow */}
      <mesh ref={glowRef} position={[size * 0.38, size * 1.23, 0]}>
        <boxGeometry args={[size * 0.2, size * 0.03, size * 0.12]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1} transparent opacity={0.9} />
      </mesh>
      {/* neon stripe on pole */}
      <mesh position={[0, size * 0.4, size * 0.04]}>
        <boxGeometry args={[size * 0.025, size * 0.55, size * 0.02]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

function RainPuddle({ pos, color, size }: P10) {
  const c = color || '#334455'
  const reflectRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (reflectRef.current) {
      (reflectRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.15 + Math.sin(clock.getElapsedTime() * 2.5) * 0.1
    }
  })
  return (
    <group position={pos}>
      {/* puddle base */}
      <mesh position={[0, size * 0.01, 0]}>
        <cylinderGeometry args={[size * 0.6, size * 0.55, size * 0.02, 16]} />
        <meshStandardMaterial color={c} metalness={0.1} roughness={0.05} transparent opacity={0.7} />
      </mesh>
      {/* neon reflection */}
      <mesh ref={reflectRef} position={[0, size * 0.02, 0]}>
        <cylinderGeometry args={[size * 0.35, size * 0.3, size * 0.005, 12]} />
        <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.2} transparent opacity={0.4} />
      </mesh>
      {/* ripple rings */}
      {([0.35, 0.52] as number[]).map((r, i) => (
        <mesh key={i} position={[0, size * 0.015, 0]}>
          <torusGeometry args={[size * r, size * 0.01, 4, 20]} />
          <meshStandardMaterial color="#88aacc" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function GraffitiWall({ pos, size }: P10) {
  return (
    <group position={pos}>
      {/* wall */}
      <mesh position={[0, size * 0.6, 0]} castShadow>
        <boxGeometry args={[size * 1.2, size * 1.2, size * 0.12]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* graffiti layers — abstract colored rectangles */}
      {([
        [0, 0.7, '#ff0066', 0.8, 0.4],
        [-0.2, 0.4, '#00ffcc', 0.5, 0.5],
        [0.25, 0.8, '#ffdd00', 0.3, 0.25],
        [0, 1.0, '#aa44ff', 0.7, 0.2],
        [-0.3, 0.65, '#ff4400', 0.3, 0.3],
      ] as [number, number, string, number, number][]).map(([x, y, col, w, h], i) => (
        <mesh key={i} position={[size * x, size * y, size * 0.065]}>
          <boxGeometry args={[size * w, size * h, size * 0.01]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.2} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function CyberTrash({ pos, size }: P10) {
  return (
    <group position={pos}>
      {/* main heap */}
      <mesh position={[0, size * 0.18, 0]} castShadow>
        <dodecahedronGeometry args={[size * 0.35, 0]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* scattered pieces */}
      {([
        [0.28, 0.08, 0.15, '#222233'],
        [-0.25, 0.06, -0.1, '#333344'],
        [0.05, 0.06, -0.28, '#1a1a2e'],
        [-0.15, 0.14, 0.22, '#222233'],
      ] as [number, number, number, string][]).map(([x, y, z, col], i) => (
        <mesh key={i} position={[size * x, size * y, size * z]} rotation={[i * 0.4, i * 0.7, i * 0.3]}>
          <boxGeometry args={[size * 0.18, size * 0.12, size * 0.1]} />
          <meshStandardMaterial color={col} roughness={0.7} />
        </mesh>
      ))}
      {/* glowing chip */}
      <mesh position={[size * 0.12, size * 0.38, size * 0.1]}>
        <boxGeometry args={[size * 0.1, size * 0.06, size * 0.08]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.5} />
      </mesh>
      {/* wire coil */}
      <mesh position={[-size * 0.12, size * 0.1, size * 0.15]} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[size * 0.08, size * 0.015, 5, 10]} />
        <meshStandardMaterial color="#ff4400" roughness={0.5} />
      </mesh>
    </group>
  )
}
