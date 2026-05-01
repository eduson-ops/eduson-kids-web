import { useEffect, useMemo, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
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
// Prop components split from this file:
import {
  Torch, GraveyardProp, PlatformerProp,
  SpeedPad, Portal, Crystal, Campfire, Sign,
  Arch, Fence, Bench, FlowerPot, Halfpipe,
  Windmill, Snowman, SatelliteDish,
  Cake, Donut, IceCream,
  Rocket, Robot, UFO,
  CastleTower, MagicOrb, Throne,
  Guitar, Piano, DrumKit, SoccerBall, Trophy, GoalNet,
  Duck, CatStatue, FishTank, Table, Bookshelf, FloorLamp,
  Airplane, Boat, Train, Swing, Slide, Seesaw,
  Planet, Asteroid, SpaceStation,
  BookStack, Globe, Microscope,
  Sword, Shield, KnightStatue,
  Coral, Submarine, Anchor, Igloo, Sled, SnowflakeDeco,
  CircusTent, FerrisWheel, HotAirBalloon, Pinwheel, Lantern,
  Burger, Pizza, Sushi, Tent, Backpack, Compass,
  WitchHat, Ghost, SpiderWeb,
  TeddyBear, LegoBrick, YoYo, Flask, Atom, Gear,
  RainCloud, LightningBolt, RainbowArch, Snowdrift, SunDeco,
  Pyramid, Sphinx, Obelisk, Lollipop, CandyCane, Gingerbread,
  Toolbox, Anvil, BarrelFire, Easel, Sculpture, VaseAncient,
  Cow, Barn, HayBale, Scarecrow, Well,
  BasketballHoop, BoxingGloves, ArcheryTarget, SurfBoard, Dumbbell,
  Taco, RamenBowl, BobaTea, Croissant, WatermelonSlice,
  WateringCan, BirdBath, GardenGnome, FlowerBed, Trellis,
  PalmTree, Bamboo, SnakeDeco, TribalMask, VineSwing,
  TrafficLight, FireHydrant, Mailbox, StreetLamp, PhoneBooth,
  Cannon, ShipWheel, TreasureMap, JollyRoger, AnchorChain,
  Helicopter, Bicycle, Scooter, HotRod, Jeep,
  Sandcastle, BeachUmbrella, LifeguardTower, Buoy, SurfboardRack,
  Catapult, BrokenColumn, Altar, Sarcophagus, ColosseumArch,
  Shipwreck, TreasureChestOpen, Anemone, SeaTurtle, Whale,
  PopcornStand, BumperCar, TicketBooth, BalloonArch, PrizeWheel,
  Longship, Runestone, VikingHelmet, MeadHall, AxeRack,
  FairyRing, GiantMushroom, CrystalTree, WizardHat, PotionStand,
  FactoryChimney, ConveyorBelt, RobotArm, OilDrum, Crane,
  ArcadeMachine, RetroTv, CassetteTape, GameController, PixelHeart,
  Waterfall, LotusPond, Volcano, Geyser, CaveEntrance,
  TRex, Triceratops, Stegosaurus, Pterodactyl, DinoEgg,
  Saloon, CactusTall, Tumbleweed, WantedSign, Horseshoe,
  IceCastle, IceSpike, FrozenTree, Snowfort, PolarBear,
  ToriiGate, PaperLantern, SakuraTree, NinjaStar, TempleBell,
  BlackHole, NebulaCloud, SpaceDebris, LaserTurret, WarpGate,
  Fireworks, SparkFountain, SmokeCloud, RainbowJet, MagicCircle,
  HeroCape, HeroMask, PowerShield, HeroStatue, EnergyCore,
  HouseSmall, ApartmentBlock, Skyscraper, Cottage, LighthouseProp,
  CastleWall, ShopFront, SchoolBuilding, BarnBig, TempleProp,
  Hospital, PoliceStation, FireStation, LibraryBuilding, ParkFountain,
  BusStop, BridgeArch, Stadium, Museum, MarketStall,
  Ambulance, FireTruck, PoliceCar, SchoolBus, Tractor,
  SubmarineMini, Sailboat, HotAirBalloon2, CableCar, Monorail,
  CafeTable, CoffeeCup, CakeSlice, IceCreamStand, FoodCart,
  PizzaOven, SodaMachine, Cupcake, Pretzel, HotDogStand,
  SwimmingPool, TennisCourt, SkiJump, BowlingPin, Dartboard,
  GolfHole, ClimbingWall, BalanceBeam, RacingFlag, MedalStand,
  MoonBase, SpaceRover, SatelliteDish2, AlienShip, CryoPod,
  SpaceSuit, MeteorShower, RingPlanet, RocketLaunchPad, SpaceCannon,
  WizardTower, DragonStatue, MagicWand, SpellBook, EnchantedSword,
  AlchemyTable, FairyHouse, RuneStoneGlow, MagicMirror, CursedChest,
  HologramDisplay, TeslaCoil, DnaHelix, LaserBeam, ComputerTerminal,
  ReactorCore, DataTower, MagnifyingGlass, PortalGun, HoverPad,
  Jellyfish, ClamShell, CrabProp, SeaweedTall, DivingBell,
  ReefRock, SeaStar, MantaRay, PufferFish, SunkenShipBow,
  JungleBridge, TribalDrum, JungleFlower, TreeGiant, ParrotPerch,
  WaterfallSmall, BambooWall, FrogStatue, TempleRuin, TreasureMapStand,
  SteamPipe, ClockworkGear, AirshipEngine, PressureGauge, SteamLocomotive,
  CogTower, TeslaLamp, BrassTelescope, SteamVent, Dirigible,
  NeonBillboard, CyberVending, HoloAd, DroneProp, CyberpunkCar,
  ServerRack, CyberStreetLamp, RainPuddle, GraffitiWall, CyberTrash,
  LaunchSilo, SpaceCapsule, MoonCrater, IonThruster, AstroLab,
  SolarCollector, SpaceBeacon, OxygenTank, HullPanel, SpaceBuggy,
  CavePainting, Mammoth, DinoTrack, BonePile, FlintClub,
  StoneHut, FirePit2, SabreTooth, TarPit, AmberGem,
  MagicWell, EnchantedGate, PixieLamp, SpellScroll, CrystalBallStand,
  MushroomHouse, FairyFountain, GlowingTree, PotionRack, RuneAltar,
  SubmarineHatch, PressureDome, SonarTower, DeepProbe, BubbleVent,
  CoralLab, SpecimenTank, DepthGauge, TorpedoBay, BiolumeTank,
  SandDune, OasisPool, DatePalm, DesertTent, CamelStatue,
  MiragePillar, DesertScorpion, NomadBrazier, SandstoneArch, DesertSkull,
  CastleDoor, Drawbridge, KnightArmor, CatapultProp, DungeonDoor,
  HeraldicBanner, ArrowSlit, WallTorch, MoatWater, Portcullis,
  JungleCanopy, Lianas, TreeFrog, ToucanPerch, JungleWaterfall,
  OrchidBloom, JaguarStatue, VineLadder, LeafPlatform, JungleHut,
  IglooLab, IceDrill, PolarBuoy, Snowcat, BlizzardShield,
  AuroraPost, IceCoreRack, PenguinProp, WalrusStatue, ArcticTent,
  PirateShip, ShipCannon, PirateTreasureMap, JollyRogerFlag, PlankBridge,
  PirateChest, AnchorProp, SeaMine, CrowNest, PirateTavern,
  CandyTree, LollipopTower, GingerbreadHouse, CandyCaneGate, CupcakeThrone,
  CottonCandyCloud, ChocolateRiver, DonutArch, JellybeanPath, SugarCastle,
  LavaPool, VolcanoRock, FireGeyser, ObsidianPillar, LavaBridge,
  MagmaCrystal, FireShrine, AshTree, EmberLantern, LavaGolem,
  NeonTower, HologramKiosk, CyberPod, NeonFountain, HoverPlatform,
  DataPillar, GlitchBox, NeonBench, CyberGate, SignalArray,
  PyramidBlock, SphinxHead, EgyptObelisk, EgyptSarcophagus, AnkhIdol,
  CanopicJar, ScarabGem, PapyrusScroll, EyeOfRa, DesertTorch,
  FairyMushroom, DewdropFlower, ButterflyPerch, FernCurl, AcornHouse,
  FairySpiderWeb, FairyRingCircle, PebblePath, MossLog, WishWell,
  SaloonFront, WaterTrough, HitchingPost, WantedPoster, SheriffStar,
  CactusBarrel, MiningCart, GoldNugget, WesternFence, WesternHayBale,
  GhostLantern, Gravestone, HauntedTree, CauldronBubble, BatSwarm,
  CobwebArch, CoffinLid, PotionShelf, CursedMirror, SpiritFlame,
  AssemblyArm, FactoryConveyorBelt, RobotDrone, GearColumn, SparkWelder,
  CircuitPanel, PowerCore, SensorTower, CargoClaw, BotChassis,
  KelpTower, BubbleDome, SeaArch, ClamThrone, WhirlpoolGate,
  GlowingJellyfish, SunkenStatue, TreasureChestSea, AnglerfishLamp, SubmarineDock,
  CloudCastle, RainbowBridge, SkyBalloon, WindMillSky, FloatingIsland,
  SunDial, CloudThrone, SkyCrystal, WindChime, StormEye,
  Stalactite, CrystalCluster, CavePool, GlowWorm, MineralVein,
  CaveMushroom, EchoStone, UndergroundWaterfall, GemGeode, LavaCrack,
  DinoSkeleton, TRexRoar, DinoEggB21, StegosaurusSpike, VelociraptorNest,
  FernJurassic, DinoTrackB21, PterodactylPerch, VolcanoMudPit, DinoInfoSign,
  AtlantisTemple, TridentMonument, CoralPillar, SeahorseStatue, BubbleChamber,
  AtlantisGate, OceanFloorRuin, AtlantisCrystalSpire, MermaidFountain, NeptuneIdol,
  SpellCauldron, WizardDesk, SpellBookStand, AstroLabTable, MagicMirrorSchool,
  GraduationPodium, WandRack, HourglassSchool, StarMap, MagicChalkboard,
  JunglePillar, MossAltar, VineGate, TempleIdol, GiantLeaf,
  TempleFireBrazier, SerpentCarving, HiddenTrapDoor, AncientGong, JungleShrine,
  IcePalaceTower, FrozenWaterfall, IceStatue, IceBridge, SnowDrift,
  IceCrystalPillar, IceBlizzardShield, IceThroneChair, PolarBearStatue, IceLantern,
  ForgeAnvil, LavaForge, MoltenHammer, LavaTubePipe, ForgeChest,
  SmithBellows, LavaRune, ForgeGolem, MoltenCrucible, EmberSpark,
  GiantMushroomB24, MushroomHouseB24, SporeCloud, GlowingMushroomRing, MushroomBridge,
  MushroomToadstool, MushroomLamp, MushroomFountainB24, MushroomGate, ToadKingThrone,
  SatelliteDishB24, HabitatModule, SpaceAntenna, OutpostCryoPod, AirbockDoor,
  SpaceToolRack, MeteorFragment, OutpostBeacon, SpaceTurret, HullBreachPatch,
  ToyTrainB25, BuildingBlockTower, WindUpRobot, TeddyBearB25, KaleidoscopeTower,
  SnowGlobe, ToyChestB25, MusicBoxB25, PuppetStage, MarbleMachine,
  GardenPavilion, RoseArbor, GardenBench, FlowerArrangement, PartyBalloons,
  CakeTower, GardenSunflower, GardenWindmill, GardenBirdBath, PicnicBlanket,
  AcrobatTrapeze, CircusElephant, JugglingBalls, CircusBigTent, TightropeWire,
  ClownCar, MagicHatCircus, RingOfFire, CircusPodium, LionTamerWhip,
  VikingLongship, RunestoneB26, VikingIronHelmet, VikingMeadHall, VikingAxeRack,
  BonfireViking, VikingShield, DragonProw, NordicWell, NordicBanner,
  SamuraiSword, SamuraiArmor, PagodaTemple, Torii, CherryBlossom,
  KatanaRack, LanternJapanese, SakuraBridge, TeaHouseJapanese, ShurikenB27,
  AztecPyramid, AztecSunStone, QuetzalBird, AztecWaterFountain, JadeMask,
  ObsidianAltar, TepeeHut, AztecWarrior, AztecSerpent,
  AnglerfishB28, OceanTrench, GiantSquid, DeepSeaJellyfish, SunkenShipB28,
  CoralGarden, DeepSubMini,
  SaloonB28, WildWestWagon, WestSheriffStar, TumbleweedB28, WaterTowerWest,
  WestGoldNugget, CactusBig, BanditCampfire, OilDerrick, BarnWest,
  PressBothLanterns, GoldMineCart,
  B29MarketStall, MedievalWell, MedievalCatapult, HeraldBanner, SmithyAnvil,
  MedievalTavern, MedievalKnightStatue, MedievalCrossbow, MerchantChest,
  TechHologram, TechRobotArm, DNAHelix, QuantumComputer, LaserCutter,
  NanodroneSwarm, PlasmaReactor, CloningPod, LabBeaker, TimePortal,
  SpaceStationHub, SpaceOxyTank, AsteroidB30, SpaceAirlock, SpaceSatDish,
  SpacePod, SpaceHelmet, B30SpaceDebris, NebulaClouds,
  UnderwaterCastle, CoralSpire, MermaidStatue, UnderwaterAnchor, BubbleStream,
  OceanTreasureMap, B30SeaTurtle, WreckCannon, AquaGargoyle, UnderwaterGate,
  SteamPiston, GearworkClock, AirshipB31, SteamPipeSystem, BrassGauge,
  SteampunkGolem, TelegraphStation, SteamFactory, ZeppelinB31,
  DojoPunchingDummy, KatanaBlade, DojoScrollBoard, NinjaTower, AnimeEnergyOrb,
  TakoYakiCart, DojoMat, BreakingBoards, TrainingBell,
  FairyRingB32, GlowingTreeB32, PixieDust, AncientTreeSpirit, EnchantedMushroom,
  CrystalCave32, DruidStone, WisteriaArch, WillowTree,
  RuinedSkyscraper, RustedCarWreck, RadiationBarrel, ScavengerTower, WastelandTurret,
  BunkerEntrance, ApocSolarPanel, PostApocTelephone,
  FarmHayBale, ChickenCoop, TractorB33, FarmSilo, GardenScarecrow,
  RoosterWeatherVane, PigPen, WaterMill,
  PortCrane, ShippingContainer, DockCleat, StorageTankB33, ForkLift,
  FishingBoat, LighthousePortB33, CoalConveyor, IndustrialChimney,
  GreekPillar, GreekUrnB34, GreekShield, OliveTreeB34, GreekLyre,
  AthensOwlB34, TriremeB34, ParthenoCap,
  NeonSignB34, CyberTowerB34, HoverCarB34, DataTerminalB34, CyberBladeB34,
  SynthPlantB34, CyberDroneB34, PowerCoreB34, CyberBridgeB34,
  IglooB35, PolarBearB35, ArcticFoxB35, SnowDriftB35, WalrusB35,
  IcebergB35, NorthernLightsB35, PenguinB35,
  CastleTowerB35, DrawbridgeB35, KnightArmorB35, CatapultB35, MedievalWellB35,
  TorchB35, BannerB35,
  ToucanB36, LianaB36, ParrotB36, WaterFallB36, FernB36, JaguarB36,
  RocketShipB36, SpaceSuitB36, LunarLanderB36, StarMapB36, MoonRoverB36,
  AsteroidB36, SpaceAntennaB36, NebulaCrystalB36,
  GiantLollipopB37, CandyCaneB37, GingerbreadHouseB37, GumdropB37, CottonCandyB37,
  ChocolateFountainB37,
  PyramidB37, SphinxB37, ObeliskB37, EgyptianVaseB37, AnubisStatueB37,
  ScarabB37, TombEntranceB37,
  PirateShipB38, TreasureChestB38, CannonB38, AnchorB38, SkullFlagB38, PirateBarrelB38,
  FairyMushroomB38, FairyLanternB38, EnchantedTreeB38, FairyWingB38, PixieDustB38,
  MagicWandB38, StoryBookB38,
  TRexB39, TriceratopsB39, StegosaurusB39, DinoEggB39, PterodactylB39,
  GuitarB39, DrumKitB39, PianoB39, MicrophoneB39, VinylRecordB39, SpeakerB39,
  SoccerBallB40, TrophyB40, BasketballHoopB40, StartingBlockB40,
  JackOLanternB40, GhostB40, WitchHatB40, SpiderWebB40, CauldronB40, BatB40,
  DolphinB41, ClownFishB41, SeaHorseB41,
  ChristmasTreeB41, SnowmanB41, GiftBoxB41, ReindeerB41, SantaHatB41, BellB41, CandleB41,
} from './worlds/props/index'
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
        <RigidBody type="fixed" colliders="cuboid" position={pos} rotation={[0, 0, Math.PI / 6]}>
          <mesh castShadow receiveShadow scale={[size, size, size]}>
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
          file={fileMap[kind] ?? ''}
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
      return <GltfMonster which={map[kind] as MonsterId} pos={pos} scale={size} animation="Yes" />
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

    // Space Station
    case 'launch-silo': return <LaunchSilo pos={pos} color={color} size={size} />
    case 'space-capsule': return <SpaceCapsule pos={pos} color={color} size={size} />
    case 'moon-crater': return <MoonCrater pos={pos} color={color} size={size} />
    case 'ion-thruster': return <IonThruster pos={pos} color={color} size={size} />
    case 'astro-lab': return <AstroLab pos={pos} color={color} size={size} />
    case 'solar-collector': return <SolarCollector pos={pos} color={color} size={size} />
    case 'space-beacon': return <SpaceBeacon pos={pos} color={color} size={size} />
    case 'oxygen-tank': return <OxygenTank pos={pos} color={color} size={size} />
    case 'hull-panel': return <HullPanel pos={pos} color={color} size={size} />
    case 'space-buggy': return <SpaceBuggy pos={pos} color={color} size={size} />
    // Prehistoric
    case 'cave-painting': return <CavePainting pos={pos} color={color} size={size} />
    case 'mammoth': return <Mammoth pos={pos} color={color} size={size} />
    case 'dino-track': return <DinoTrack pos={pos} color={color} size={size} />
    case 'bone-pile': return <BonePile pos={pos} color={color} size={size} />
    case 'flint-club': return <FlintClub pos={pos} color={color} size={size} />
    case 'stone-hut': return <StoneHut pos={pos} color={color} size={size} />
    case 'fire-pit-2': return <FirePit2 pos={pos} color={color} size={size} />
    case 'sabre-tooth': return <SabreTooth pos={pos} color={color} size={size} />
    case 'tar-pit': return <TarPit pos={pos} color={color} size={size} />
    case 'amber-gem': return <AmberGem pos={pos} color={color} size={size} />

    // Enchanted Village
    case 'magic-well': return <MagicWell pos={pos} color={color} size={size} />
    case 'enchanted-gate': return <EnchantedGate pos={pos} color={color} size={size} />
    case 'pixie-lamp': return <PixieLamp pos={pos} color={color} size={size} />
    case 'spell-scroll': return <SpellScroll pos={pos} color={color} size={size} />
    case 'crystal-ball-stand': return <CrystalBallStand pos={pos} color={color} size={size} />
    case 'mushroom-house': return <MushroomHouse pos={pos} color={color} size={size} />
    case 'fairy-fountain': return <FairyFountain pos={pos} color={color} size={size} />
    case 'glowing-tree': return <GlowingTree pos={pos} color={color} size={size} />
    case 'potion-rack': return <PotionRack pos={pos} color={color} size={size} />
    case 'rune-altar': return <RuneAltar pos={pos} color={color} size={size} />
    // Underwater Lab
    case 'submarine-hatch': return <SubmarineHatch pos={pos} color={color} size={size} />
    case 'pressure-dome': return <PressureDome pos={pos} color={color} size={size} />
    case 'sonar-tower': return <SonarTower pos={pos} color={color} size={size} />
    case 'deep-probe': return <DeepProbe pos={pos} color={color} size={size} />
    case 'bubble-vent': return <BubbleVent pos={pos} color={color} size={size} />
    case 'coral-lab': return <CoralLab pos={pos} color={color} size={size} />
    case 'specimen-tank': return <SpecimenTank pos={pos} color={color} size={size} />
    case 'depth-gauge': return <DepthGauge pos={pos} color={color} size={size} />
    case 'torpedo-bay': return <TorpedoBay pos={pos} color={color} size={size} />
    case 'biolume-tank': return <BiolumeTank pos={pos} color={color} size={size} />

    // Desert Oasis
    case 'sand-dune': return <SandDune pos={pos} color={color} size={size} />
    case 'oasis-pool': return <OasisPool pos={pos} color={color} size={size} />
    case 'date-palm': return <DatePalm pos={pos} color={color} size={size} />
    case 'desert-tent': return <DesertTent pos={pos} color={color} size={size} />
    case 'camel-statue': return <CamelStatue pos={pos} color={color} size={size} />
    case 'mirage-pillar': return <MiragePillar pos={pos} color={color} size={size} />
    case 'desert-scorpion': return <DesertScorpion pos={pos} color={color} size={size} />
    case 'nomad-brazier': return <NomadBrazier pos={pos} color={color} size={size} />
    case 'sandstone-arch': return <SandstoneArch pos={pos} color={color} size={size} />
    case 'desert-skull': return <DesertSkull pos={pos} color={color} size={size} />
    // Medieval Castle
    case 'castle-door': return <CastleDoor pos={pos} color={color} size={size} />
    case 'drawbridge': return <Drawbridge pos={pos} color={color} size={size} />
    case 'knight-armor': return <KnightArmor pos={pos} color={color} size={size} />
    case 'catapult-prop': return <CatapultProp pos={pos} color={color} size={size} />
    case 'dungeon-door': return <DungeonDoor pos={pos} color={color} size={size} />
    case 'heraldic-banner': return <HeraldicBanner pos={pos} color={color} size={size} />
    case 'arrow-slit': return <ArrowSlit pos={pos} color={color} size={size} />
    case 'wall-torch': return <WallTorch pos={pos} color={color} size={size} />
    case 'moat-water': return <MoatWater pos={pos} color={color} size={size} />
    case 'portcullis': return <Portcullis pos={pos} color={color} size={size} />

    case 'jungle-canopy': return <JungleCanopy pos={pos} color={color} size={size} />
    case 'lianas': return <Lianas pos={pos} color={color} size={size} />
    case 'tree-frog': return <TreeFrog pos={pos} color={color} size={size} />
    case 'toucan-perch': return <ToucanPerch pos={pos} color={color} size={size} />
    case 'jungle-waterfall': return <JungleWaterfall pos={pos} color={color} size={size} />
    case 'orchid-bloom': return <OrchidBloom pos={pos} color={color} size={size} />
    case 'jaguar-statue': return <JaguarStatue pos={pos} color={color} size={size} />
    case 'vine-ladder': return <VineLadder pos={pos} color={color} size={size} />
    case 'leaf-platform': return <LeafPlatform pos={pos} color={color} size={size} />
    case 'jungle-hut': return <JungleHut pos={pos} color={color} size={size} />
    case 'igloo-lab': return <IglooLab pos={pos} color={color} size={size} />
    case 'ice-drill': return <IceDrill pos={pos} color={color} size={size} />
    case 'polar-buoy': return <PolarBuoy pos={pos} color={color} size={size} />
    case 'snowcat': return <Snowcat pos={pos} color={color} size={size} />
    case 'blizzard-shield': return <BlizzardShield pos={pos} color={color} size={size} />
    case 'aurora-post': return <AuroraPost pos={pos} color={color} size={size} />
    case 'ice-core-rack': return <IceCoreRack pos={pos} color={color} size={size} />
    case 'penguin-prop': return <PenguinProp pos={pos} color={color} size={size} />
    case 'walrus-statue': return <WalrusStatue pos={pos} color={color} size={size} />
    case 'arctic-tent': return <ArcticTent pos={pos} color={color} size={size} />

    case 'pirate-ship': return <PirateShip pos={pos} color={color} size={size} />
    case 'ship-cannon': return <ShipCannon pos={pos} color={color} size={size} />
    case 'treasure-map': return <PirateTreasureMap pos={pos} color={color} size={size} />
    case 'jolly-roger': return <JollyRogerFlag pos={pos} color={color} size={size} />
    case 'plank-bridge': return <PlankBridge pos={pos} color={color} size={size} />
    case 'pirate-chest': return <PirateChest pos={pos} color={color} size={size} />
    case 'anchor-prop': return <AnchorProp pos={pos} color={color} size={size} />
    case 'sea-mine': return <SeaMine pos={pos} color={color} size={size} />
    case 'crow-nest': return <CrowNest pos={pos} color={color} size={size} />
    case 'pirate-tavern': return <PirateTavern pos={pos} color={color} size={size} />
    case 'candy-tree': return <CandyTree pos={pos} color={color} size={size} />
    case 'lollipop-tower': return <LollipopTower pos={pos} color={color} size={size} />
    case 'gingerbread-house': return <GingerbreadHouse pos={pos} color={color} size={size} />
    case 'candy-cane-gate': return <CandyCaneGate pos={pos} color={color} size={size} />
    case 'cupcake-throne': return <CupcakeThrone pos={pos} color={color} size={size} />
    case 'cotton-candy-cloud': return <CottonCandyCloud pos={pos} color={color} size={size} />
    case 'chocolate-river': return <ChocolateRiver pos={pos} color={color} size={size} />
    case 'donut-arch': return <DonutArch pos={pos} color={color} size={size} />
    case 'jellybean-path': return <JellybeanPath pos={pos} color={color} size={size} />
    case 'sugar-castle': return <SugarCastle pos={pos} color={color} size={size} />

    case 'lava-pool': return <LavaPool pos={pos} color={color} size={size} />
    case 'volcano-rock': return <VolcanoRock pos={pos} color={color} size={size} />
    case 'fire-geyser': return <FireGeyser pos={pos} color={color} size={size} />
    case 'obsidian-pillar': return <ObsidianPillar pos={pos} color={color} size={size} />
    case 'lava-bridge': return <LavaBridge pos={pos} color={color} size={size} />
    case 'magma-crystal': return <MagmaCrystal pos={pos} color={color} size={size} />
    case 'fire-shrine': return <FireShrine pos={pos} color={color} size={size} />
    case 'ash-tree': return <AshTree pos={pos} color={color} size={size} />
    case 'ember-lantern': return <EmberLantern pos={pos} color={color} size={size} />
    case 'lava-golem': return <LavaGolem pos={pos} color={color} size={size} />
    case 'neon-tower': return <NeonTower pos={pos} color={color} size={size} />
    case 'hologram-kiosk': return <HologramKiosk pos={pos} color={color} size={size} />
    case 'cyber-pod': return <CyberPod pos={pos} color={color} size={size} />
    case 'neon-fountain': return <NeonFountain pos={pos} color={color} size={size} />
    case 'hover-platform': return <HoverPlatform pos={pos} color={color} size={size} />
    case 'data-pillar': return <DataPillar pos={pos} color={color} size={size} />
    case 'glitch-box': return <GlitchBox pos={pos} color={color} size={size} />
    case 'neon-bench': return <NeonBench pos={pos} color={color} size={size} />
    case 'cyber-gate': return <CyberGate pos={pos} color={color} size={size} />
    case 'signal-array': return <SignalArray pos={pos} color={color} size={size} />

    case 'pyramid-block': return <PyramidBlock pos={pos} color={color} size={size} />
    case 'sphinx-head': return <SphinxHead pos={pos} color={color} size={size} />
    case 'obelisk': return <EgyptObelisk pos={pos} color={color} size={size} />
    case 'sarcophagus': return <EgyptSarcophagus pos={pos} color={color} size={size} />
    case 'ankh-idol': return <AnkhIdol pos={pos} color={color} size={size} />
    case 'canopic-jar': return <CanopicJar pos={pos} color={color} size={size} />
    case 'scarab-gem': return <ScarabGem pos={pos} color={color} size={size} />
    case 'papyrus-scroll': return <PapyrusScroll pos={pos} color={color} size={size} />
    case 'eye-of-ra': return <EyeOfRa pos={pos} color={color} size={size} />
    case 'desert-torch': return <DesertTorch pos={pos} color={color} size={size} />
    case 'fairy-mushroom': return <FairyMushroom pos={pos} color={color} size={size} />
    case 'dewdrop-flower': return <DewdropFlower pos={pos} color={color} size={size} />
    case 'butterfly-perch': return <ButterflyPerch pos={pos} color={color} size={size} />
    case 'fern-curl': return <FernCurl pos={pos} color={color} size={size} />
    case 'acorn-house': return <AcornHouse pos={pos} color={color} size={size} />
    case 'spider-web': return <FairySpiderWeb pos={pos} color={color} size={size} />
    case 'fairy-ring': return <FairyRingCircle pos={pos} color={color} size={size} />
    case 'pebble-path': return <PebblePath pos={pos} color={color} size={size} />
    case 'moss-log': return <MossLog pos={pos} color={color} size={size} />
    case 'wish-well': return <WishWell pos={pos} color={color} size={size} />

    case 'saloon-front': return <SaloonFront pos={pos} color={color} size={size} />
    case 'water-trough': return <WaterTrough pos={pos} color={color} size={size} />
    case 'hitching-post': return <HitchingPost pos={pos} color={color} size={size} />
    case 'wanted-poster': return <WantedPoster pos={pos} color={color} size={size} />
    case 'sheriff-star': return <SheriffStar pos={pos} color={color} size={size} />
    case 'cactus-barrel': return <CactusBarrel pos={pos} color={color} size={size} />
    case 'mining-cart': return <MiningCart pos={pos} color={color} size={size} />
    case 'gold-nugget': return <GoldNugget pos={pos} color={color} size={size} />
    case 'western-fence': return <WesternFence pos={pos} color={color} size={size} />
    case 'hay-bale': return <WesternHayBale pos={pos} color={color} size={size} />
    case 'ghost-lantern': return <GhostLantern pos={pos} color={color} size={size} />
    case 'gravestone': return <Gravestone pos={pos} color={color} size={size} />
    case 'haunted-tree': return <HauntedTree pos={pos} color={color} size={size} />
    case 'cauldron-bubble': return <CauldronBubble pos={pos} color={color} size={size} />
    case 'bat-swarm': return <BatSwarm pos={pos} color={color} size={size} />
    case 'cobweb-arch': return <CobwebArch pos={pos} color={color} size={size} />
    case 'coffin-lid': return <CoffinLid pos={pos} color={color} size={size} />
    case 'potion-shelf': return <PotionShelf pos={pos} color={color} size={size} />
    case 'cursed-mirror': return <CursedMirror pos={pos} color={color} size={size} />
    case 'spirit-flame': return <SpiritFlame pos={pos} color={color} size={size} />

    case 'assembly-arm': return <AssemblyArm pos={pos} color={color} size={size} />
    case 'conveyor-belt': return <FactoryConveyorBelt pos={pos} color={color} size={size} />
    case 'robot-drone': return <RobotDrone pos={pos} color={color} size={size} />
    case 'gear-column': return <GearColumn pos={pos} color={color} size={size} />
    case 'spark-welder': return <SparkWelder pos={pos} color={color} size={size} />
    case 'circuit-panel': return <CircuitPanel pos={pos} color={color} size={size} />
    case 'power-core': return <PowerCore pos={pos} color={color} size={size} />
    case 'sensor-tower': return <SensorTower pos={pos} color={color} size={size} />
    case 'cargo-claw': return <CargoClaw pos={pos} color={color} size={size} />
    case 'bot-chassis': return <BotChassis pos={pos} color={color} size={size} />
    case 'kelp-tower': return <KelpTower pos={pos} color={color} size={size} />
    case 'bubble-dome': return <BubbleDome pos={pos} color={color} size={size} />
    case 'sea-arch': return <SeaArch pos={pos} color={color} size={size} />
    case 'clam-throne': return <ClamThrone pos={pos} color={color} size={size} />
    case 'whirlpool-gate': return <WhirlpoolGate pos={pos} color={color} size={size} />
    case 'glowing-jellyfish': return <GlowingJellyfish pos={pos} color={color} size={size} />
    case 'sunken-statue': return <SunkenStatue pos={pos} color={color} size={size} />
    case 'treasure-chest-sea': return <TreasureChestSea pos={pos} color={color} size={size} />
    case 'anglerfish-lamp': return <AnglerfishLamp pos={pos} color={color} size={size} />
    case 'submarine-dock': return <SubmarineDock pos={pos} color={color} size={size} />
    case 'cloud-castle': return <CloudCastle pos={pos} color={color} size={size} />
    case 'rainbow-bridge': return <RainbowBridge pos={pos} color={color} size={size} />
    case 'sky-balloon': return <SkyBalloon pos={pos} color={color} size={size} />
    case 'wind-mill-sky': return <WindMillSky pos={pos} color={color} size={size} />
    case 'floating-island': return <FloatingIsland pos={pos} color={color} size={size} />
    case 'sun-dial': return <SunDial pos={pos} color={color} size={size} />
    case 'cloud-throne': return <CloudThrone pos={pos} color={color} size={size} />
    case 'sky-crystal': return <SkyCrystal pos={pos} color={color} size={size} />
    case 'wind-chime': return <WindChime pos={pos} color={color} size={size} />
    case 'storm-eye': return <StormEye pos={pos} color={color} size={size} />
    case 'stalactite': return <Stalactite pos={pos} color={color} size={size} />
    case 'crystal-cluster': return <CrystalCluster pos={pos} color={color} size={size} />
    case 'cave-pool': return <CavePool pos={pos} color={color} size={size} />
    case 'glow-worm': return <GlowWorm pos={pos} color={color} size={size} />
    case 'mineral-vein': return <MineralVein pos={pos} color={color} size={size} />
    case 'cave-mushroom': return <CaveMushroom pos={pos} color={color} size={size} />
    case 'echo-stone': return <EchoStone pos={pos} color={color} size={size} />
    case 'underground-waterfall': return <UndergroundWaterfall pos={pos} color={color} size={size} />
    case 'gem-geode': return <GemGeode pos={pos} color={color} size={size} />
    case 'lava-crack': return <LavaCrack pos={pos} color={color} size={size} />
    case 'dino-skeleton': return <DinoSkeleton pos={pos} color={color} size={size} />
    case 't-rex-roar': return <TRexRoar pos={pos} color={color} size={size} />
    case 'dino-egg-b21': return <DinoEggB21 pos={pos} color={color} size={size} />
    case 'stegosaurus-spike': return <StegosaurusSpike pos={pos} color={color} size={size} />
    case 'velociraptor-nest': return <VelociraptorNest pos={pos} color={color} size={size} />
    case 'fern-jurassic': return <FernJurassic pos={pos} color={color} size={size} />
    case 'dino-track-b21': return <DinoTrackB21 pos={pos} color={color} size={size} />
    case 'pterodactyl-perch': return <PterodactylPerch pos={pos} color={color} size={size} />
    case 'volcano-mud-pit': return <VolcanoMudPit pos={pos} color={color} size={size} />
    case 'dino-info-sign': return <DinoInfoSign pos={pos} color={color} size={size} />
    case 'atlantis-temple': return <AtlantisTemple pos={pos} color={color} size={size} />
    case 'trident-monument': return <TridentMonument pos={pos} color={color} size={size} />
    case 'coral-pillar': return <CoralPillar pos={pos} color={color} size={size} />
    case 'seahorse-statue': return <SeahorseStatue pos={pos} color={color} size={size} />
    case 'bubble-chamber': return <BubbleChamber pos={pos} color={color} size={size} />
    case 'atlantis-gate': return <AtlantisGate pos={pos} color={color} size={size} />
    case 'ocean-floor-ruin': return <OceanFloorRuin pos={pos} color={color} size={size} />
    case 'atlantis-crystal-spire': return <AtlantisCrystalSpire pos={pos} color={color} size={size} />
    case 'mermaid-fountain': return <MermaidFountain pos={pos} color={color} size={size} />
    case 'neptune-idol': return <NeptuneIdol pos={pos} color={color} size={size} />
    case 'spell-cauldron': return <SpellCauldron pos={pos} color={color} size={size} />
    case 'wizard-desk': return <WizardDesk pos={pos} color={color} size={size} />
    case 'spell-book-stand': return <SpellBookStand pos={pos} color={color} size={size} />
    case 'astro-lab-table': return <AstroLabTable pos={pos} color={color} size={size} />
    case 'magic-mirror-school': return <MagicMirrorSchool pos={pos} color={color} size={size} />
    case 'graduation-podium': return <GraduationPodium pos={pos} color={color} size={size} />
    case 'wand-rack': return <WandRack pos={pos} color={color} size={size} />
    case 'hourglass-school': return <HourglassSchool pos={pos} color={color} size={size} />
    case 'star-map': return <StarMap pos={pos} color={color} size={size} />
    case 'magic-chalkboard': return <MagicChalkboard pos={pos} color={color} size={size} />
    case 'jungle-pillar': return <JunglePillar pos={pos} color={color} size={size} />
    case 'moss-altar': return <MossAltar pos={pos} color={color} size={size} />
    case 'vine-gate': return <VineGate pos={pos} color={color} size={size} />
    case 'temple-idol': return <TempleIdol pos={pos} color={color} size={size} />
    case 'giant-leaf': return <GiantLeaf pos={pos} color={color} size={size} />
    case 'temple-fire-brazier': return <TempleFireBrazier pos={pos} color={color} size={size} />
    case 'serpent-carving': return <SerpentCarving pos={pos} color={color} size={size} />
    case 'hidden-trap-door': return <HiddenTrapDoor pos={pos} color={color} size={size} />
    case 'ancient-gong': return <AncientGong pos={pos} color={color} size={size} />
    case 'jungle-shrine': return <JungleShrine pos={pos} color={color} size={size} />
    case 'ice-palace-tower': return <IcePalaceTower pos={pos} color={color} size={size} />
    case 'frozen-waterfall': return <FrozenWaterfall pos={pos} color={color} size={size} />
    case 'ice-statue': return <IceStatue pos={pos} color={color} size={size} />
    case 'ice-bridge': return <IceBridge pos={pos} color={color} size={size} />
    case 'snow-drift': return <SnowDrift pos={pos} color={color} size={size} />
    case 'ice-crystal-pillar': return <IceCrystalPillar pos={pos} color={color} size={size} />
    case 'ice-blizzard-shield': return <IceBlizzardShield pos={pos} color={color} size={size} />
    case 'ice-throne-chair': return <IceThroneChair pos={pos} color={color} size={size} />
    case 'polar-bear-statue': return <PolarBearStatue pos={pos} color={color} size={size} />
    case 'ice-lantern': return <IceLantern pos={pos} color={color} size={size} />
    case 'forge-anvil': return <ForgeAnvil pos={pos} color={color} size={size} />
    case 'lava-forge': return <LavaForge pos={pos} color={color} size={size} />
    case 'molten-hammer': return <MoltenHammer pos={pos} color={color} size={size} />
    case 'lava-tube-pipe': return <LavaTubePipe pos={pos} color={color} size={size} />
    case 'forge-chest': return <ForgeChest pos={pos} color={color} size={size} />
    case 'smith-bellows': return <SmithBellows pos={pos} color={color} size={size} />
    case 'lava-rune': return <LavaRune pos={pos} color={color} size={size} />
    case 'forge-golem': return <ForgeGolem pos={pos} color={color} size={size} />
    case 'molten-crucible': return <MoltenCrucible pos={pos} color={color} size={size} />
    case 'ember-spark': return <EmberSpark pos={pos} color={color} size={size} />
    case 'giant-mushroom-b24': return <GiantMushroomB24 pos={pos} color={color} size={size} />
    case 'mushroom-house-b24': return <MushroomHouseB24 pos={pos} color={color} size={size} />
    case 'spore-cloud': return <SporeCloud pos={pos} color={color} size={size} />
    case 'glowing-mushroom-ring': return <GlowingMushroomRing pos={pos} color={color} size={size} />
    case 'mushroom-bridge': return <MushroomBridge pos={pos} color={color} size={size} />
    case 'mushroom-toadstool': return <MushroomToadstool pos={pos} color={color} size={size} />
    case 'mushroom-lamp': return <MushroomLamp pos={pos} color={color} size={size} />
    case 'mushroom-fountain-b24': return <MushroomFountainB24 pos={pos} color={color} size={size} />
    case 'mushroom-gate': return <MushroomGate pos={pos} color={color} size={size} />
    case 'toad-king-throne': return <ToadKingThrone pos={pos} color={color} size={size} />
    case 'satellite-dish-b24': return <SatelliteDishB24 pos={pos} color={color} size={size} />
    case 'habitat-module': return <HabitatModule pos={pos} color={color} size={size} />
    case 'space-antenna': return <SpaceAntenna pos={pos} color={color} size={size} />
    case 'outpost-cryo-pod': return <OutpostCryoPod pos={pos} color={color} size={size} />
    case 'airblock-door': return <AirbockDoor pos={pos} color={color} size={size} />
    case 'space-tool-rack': return <SpaceToolRack pos={pos} color={color} size={size} />
    case 'meteor-fragment': return <MeteorFragment pos={pos} color={color} size={size} />
    case 'outpost-beacon': return <OutpostBeacon pos={pos} color={color} size={size} />
    case 'space-turret': return <SpaceTurret pos={pos} color={color} size={size} />
    case 'hull-breach-patch': return <HullBreachPatch pos={pos} color={color} size={size} />
    case 'toy-train-b25': return <ToyTrainB25 pos={pos} color={color} size={size} />
    case 'building-block-tower': return <BuildingBlockTower pos={pos} color={color} size={size} />
    case 'wind-up-robot': return <WindUpRobot pos={pos} color={color} size={size} />
    case 'teddy-bear-b25': return <TeddyBearB25 pos={pos} color={color} size={size} />
    case 'kaleidoscope-tower': return <KaleidoscopeTower pos={pos} color={color} size={size} />
    case 'snow-globe': return <SnowGlobe pos={pos} color={color} size={size} />
    case 'toy-chest-b25': return <ToyChestB25 pos={pos} color={color} size={size} />
    case 'music-box-b25': return <MusicBoxB25 pos={pos} color={color} size={size} />
    case 'puppet-stage': return <PuppetStage pos={pos} color={color} size={size} />
    case 'marble-machine': return <MarbleMachine pos={pos} color={color} size={size} />
    case 'garden-pavilion': return <GardenPavilion pos={pos} color={color} size={size} />
    case 'rose-arbor': return <RoseArbor pos={pos} color={color} size={size} />
    case 'garden-bench': return <GardenBench pos={pos} color={color} size={size} />
    case 'flower-arrangement': return <FlowerArrangement pos={pos} color={color} size={size} />
    case 'party-balloons': return <PartyBalloons pos={pos} color={color} size={size} />
    case 'cake-tower': return <CakeTower pos={pos} color={color} size={size} />
    case 'garden-sunflower': return <GardenSunflower pos={pos} color={color} size={size} />
    case 'garden-windmill': return <GardenWindmill pos={pos} color={color} size={size} />
    case 'garden-bird-bath': return <GardenBirdBath pos={pos} color={color} size={size} />
    case 'picnic-blanket': return <PicnicBlanket pos={pos} color={color} size={size} />
    case 'acrobat-trapeze': return <AcrobatTrapeze pos={pos} color={color} size={size} />
    case 'circus-elephant': return <CircusElephant pos={pos} color={color} size={size} />
    case 'juggling-balls': return <JugglingBalls pos={pos} color={color} size={size} />
    case 'circus-big-tent': return <CircusBigTent pos={pos} color={color} size={size} />
    case 'tightrope-wire': return <TightropeWire pos={pos} color={color} size={size} />
    case 'clown-car': return <ClownCar pos={pos} color={color} size={size} />
    case 'magic-hat-circus': return <MagicHatCircus pos={pos} color={color} size={size} />
    case 'ring-of-fire': return <RingOfFire pos={pos} color={color} size={size} />
    case 'circus-podium': return <CircusPodium pos={pos} color={color} size={size} />
    case 'lion-tamer-whip': return <LionTamerWhip pos={pos} color={color} size={size} />
    case 'viking-longship': return <VikingLongship pos={pos} color={color} size={size} />
    case 'runestone-b26': return <RunestoneB26 pos={pos} color={color} size={size} />
    case 'viking-iron-helmet': return <VikingIronHelmet pos={pos} color={color} size={size} />
    case 'viking-mead-hall': return <VikingMeadHall pos={pos} color={color} size={size} />
    case 'viking-axe-rack': return <VikingAxeRack pos={pos} color={color} size={size} />
    case 'bonfire-viking': return <BonfireViking pos={pos} color={color} size={size} />
    case 'viking-shield': return <VikingShield pos={pos} color={color} size={size} />
    case 'dragon-prow': return <DragonProw pos={pos} color={color} size={size} />
    case 'nordic-well': return <NordicWell pos={pos} color={color} size={size} />
    case 'nordic-banner': return <NordicBanner pos={pos} color={color} size={size} />
    // Batch 27 · Samurai Japan
    case 'samurai-sword': return <SamuraiSword pos={pos} color={color} size={size} />
    case 'samurai-armor': return <SamuraiArmor pos={pos} color={color} size={size} />
    case 'pagoda-temple': return <PagodaTemple pos={pos} color={color} size={size} />
    case 'torii-gate': return <Torii pos={pos} color={color} size={size} />
    case 'cherry-blossom': return <CherryBlossom pos={pos} color={color} size={size} />
    case 'katana-rack': return <KatanaRack pos={pos} color={color} size={size} />
    case 'lantern-japanese': return <LanternJapanese pos={pos} color={color} size={size} />
    case 'sakura-bridge': return <SakuraBridge pos={pos} color={color} size={size} />
    case 'tea-house-japanese': return <TeaHouseJapanese pos={pos} color={color} size={size} />
    case 'shuriken-b27': return <ShurikenB27 pos={pos} color={color} size={size} />
    // Batch 27 · Aztec Empire
    case 'aztec-pyramid': return <AztecPyramid pos={pos} color={color} size={size} />
    case 'aztec-sun-stone': return <AztecSunStone pos={pos} color={color} size={size} />
    case 'quetzal-bird': return <QuetzalBird pos={pos} color={color} size={size} />
    case 'aztec-water-fountain': return <AztecWaterFountain pos={pos} color={color} size={size} />
    case 'jade-mask': return <JadeMask pos={pos} color={color} size={size} />
    case 'obsidian-altar': return <ObsidianAltar pos={pos} color={color} size={size} />
    case 'tepee-hut': return <TepeeHut pos={pos} color={color} size={size} />
    case 'aztec-warrior': return <AztecWarrior pos={pos} color={color} size={size} />
    case 'aztec-serpent': return <AztecSerpent pos={pos} color={color} size={size} />
    // Batch 28 · Deep Sea
    case 'anglerfish-b28': return <AnglerfishB28 pos={pos} color={color} size={size} />
    case 'ocean-trench': return <OceanTrench pos={pos} color={color} size={size} />
    case 'giant-squid': return <GiantSquid pos={pos} color={color} size={size} />
    case 'deep-sea-jellyfish': return <DeepSeaJellyfish pos={pos} color={color} size={size} />
    case 'sunken-ship-b28': return <SunkenShipB28 pos={pos} color={color} size={size} />
    case 'coral-garden': return <CoralGarden pos={pos} color={color} size={size} />
    case 'deep-sub-mini': return <DeepSubMini pos={pos} color={color} size={size} />
    // Batch 28 · Wild West
    case 'saloon-b28': return <SaloonB28 pos={pos} color={color} size={size} />
    case 'wild-west-wagon': return <WildWestWagon pos={pos} color={color} size={size} />
    case 'west-sheriff-star': return <WestSheriffStar pos={pos} color={color} size={size} />
    case 'tumbleweed-b28': return <TumbleweedB28 pos={pos} color={color} size={size} />
    case 'water-tower-west': return <WaterTowerWest pos={pos} color={color} size={size} />
    case 'west-gold-nugget': return <WestGoldNugget pos={pos} color={color} size={size} />
    case 'cactus-big': return <CactusBig pos={pos} color={color} size={size} />
    case 'bandit-campfire': return <BanditCampfire pos={pos} color={color} size={size} />
    case 'oil-derrick': return <OilDerrick pos={pos} color={color} size={size} />
    case 'barn-west': return <BarnWest pos={pos} color={color} size={size} />
    case 'west-street-lanterns': return <PressBothLanterns pos={pos} color={color} size={size} />
    case 'gold-mine-cart': return <GoldMineCart pos={pos} color={color} size={size} />
    // Batch 29 · Medieval Market
    case 'b29-market-stall': return <B29MarketStall pos={pos} color={color} size={size} />
    case 'medieval-well': return <MedievalWell pos={pos} color={color} size={size} />
    case 'medieval-catapult': return <MedievalCatapult pos={pos} color={color} size={size} />
    case 'herald-banner': return <HeraldBanner pos={pos} color={color} size={size} />
    case 'smithy-anvil': return <SmithyAnvil pos={pos} color={color} size={size} />
    case 'medieval-tavern': return <MedievalTavern pos={pos} color={color} size={size} />
    case 'medieval-knight-statue': return <MedievalKnightStatue pos={pos} color={color} size={size} />
    case 'medieval-crossbow': return <MedievalCrossbow pos={pos} color={color} size={size} />
    case 'merchant-chest': return <MerchantChest pos={pos} color={color} size={size} />
    // Batch 29 · Tech Lab
    case 'tech-hologram': return <TechHologram pos={pos} color={color} size={size} />
    case 'tech-robot-arm': return <TechRobotArm pos={pos} color={color} size={size} />
    case 'dna-helix': return <DNAHelix pos={pos} color={color} size={size} />
    case 'quantum-computer': return <QuantumComputer pos={pos} color={color} size={size} />
    case 'laser-cutter': return <LaserCutter pos={pos} color={color} size={size} />
    case 'nanodrone-swarm': return <NanodroneSwarm pos={pos} color={color} size={size} />
    case 'plasma-reactor': return <PlasmaReactor pos={pos} color={color} size={size} />
    case 'cloning-pod': return <CloningPod pos={pos} color={color} size={size} />
    case 'lab-beaker': return <LabBeaker pos={pos} color={color} size={size} />
    case 'time-portal': return <TimePortal pos={pos} color={color} size={size} />
    // Batch 30 · Space Station
    case 'space-station-hub': return <SpaceStationHub pos={pos} color={color} size={size} />
    case 'space-oxy-tank': return <SpaceOxyTank pos={pos} color={color} size={size} />
    case 'asteroid-b30': return <AsteroidB30 pos={pos} color={color} size={size} />
    case 'space-airlock': return <SpaceAirlock pos={pos} color={color} size={size} />
    case 'space-sat-dish': return <SpaceSatDish pos={pos} color={color} size={size} />
    case 'space-pod': return <SpacePod pos={pos} color={color} size={size} />
    case 'space-helmet': return <SpaceHelmet pos={pos} color={color} size={size} />
    case 'b30-space-debris': return <B30SpaceDebris pos={pos} color={color} size={size} />
    case 'nebula-clouds': return <NebulaClouds pos={pos} color={color} size={size} />
    // Batch 30 · Underwater Castle
    case 'underwater-castle': return <UnderwaterCastle pos={pos} color={color} size={size} />
    case 'coral-spire': return <CoralSpire pos={pos} color={color} size={size} />
    case 'mermaid-statue': return <MermaidStatue pos={pos} color={color} size={size} />
    case 'underwater-anchor': return <UnderwaterAnchor pos={pos} color={color} size={size} />
    case 'bubble-stream': return <BubbleStream pos={pos} color={color} size={size} />
    case 'ocean-treasure-map': return <OceanTreasureMap pos={pos} color={color} size={size} />
    case 'b30-sea-turtle': return <B30SeaTurtle pos={pos} color={color} size={size} />
    case 'wreck-cannon': return <WreckCannon pos={pos} color={color} size={size} />
    case 'aqua-gargoyle': return <AquaGargoyle pos={pos} color={color} size={size} />
    case 'underwater-gate': return <UnderwaterGate pos={pos} color={color} size={size} />
    // Batch 31 · Steampunk City
    case 'steam-piston': return <SteamPiston pos={pos} color={color} size={size} />
    case 'gearwork-clock': return <GearworkClock pos={pos} color={color} size={size} />
    case 'airship-b31': return <AirshipB31 pos={pos} color={color} size={size} />
    case 'steam-pipe-system': return <SteamPipeSystem pos={pos} color={color} size={size} />
    case 'brass-gauge': return <BrassGauge pos={pos} color={color} size={size} />
    case 'steampunk-golem': return <SteampunkGolem pos={pos} color={color} size={size} />
    case 'telegraph-station': return <TelegraphStation pos={pos} color={color} size={size} />
    case 'steam-factory': return <SteamFactory pos={pos} color={color} size={size} />
    case 'zeppelin-b31': return <ZeppelinB31 pos={pos} color={color} size={size} />
    // Batch 31 · Anime Dojo
    case 'dojo-punching-dummy': return <DojoPunchingDummy pos={pos} color={color} size={size} />
    case 'katana-blade': return <KatanaBlade pos={pos} color={color} size={size} />
    case 'dojo-scroll-board': return <DojoScrollBoard pos={pos} color={color} size={size} />
    case 'ninja-tower': return <NinjaTower pos={pos} color={color} size={size} />
    case 'anime-energy-orb': return <AnimeEnergyOrb pos={pos} color={color} size={size} />
    case 'tako-yaki-cart': return <TakoYakiCart pos={pos} color={color} size={size} />
    case 'dojo-mat': return <DojoMat pos={pos} color={color} size={size} />
    case 'breaking-boards': return <BreakingBoards pos={pos} color={color} size={size} />
    case 'training-bell': return <TrainingBell pos={pos} color={color} size={size} />
    // Batch 32 · Enchanted Forest
    case 'fairy-ring-b32': return <FairyRingB32 pos={pos} color={color} size={size} />
    case 'glowing-tree-b32': return <GlowingTreeB32 pos={pos} color={color} size={size} />
    case 'pixie-dust': return <PixieDust pos={pos} color={color} size={size} />
    case 'ancient-tree-spirit': return <AncientTreeSpirit pos={pos} color={color} size={size} />
    case 'enchanted-mushroom': return <EnchantedMushroom pos={pos} color={color} size={size} />
    case 'crystal-cave-32': return <CrystalCave32 pos={pos} color={color} size={size} />
    case 'druid-stone': return <DruidStone pos={pos} color={color} size={size} />
    case 'wisteria-arch': return <WisteriaArch pos={pos} color={color} size={size} />
    case 'willow-tree': return <WillowTree pos={pos} color={color} size={size} />
    // Batch 32 · Post-Apocalypse
    case 'ruined-skyscraper': return <RuinedSkyscraper pos={pos} color={color} size={size} />
    case 'rusted-car-wreck': return <RustedCarWreck pos={pos} color={color} size={size} />
    case 'radiation-barrel': return <RadiationBarrel pos={pos} color={color} size={size} />
    case 'scavenger-tower': return <ScavengerTower pos={pos} color={color} size={size} />
    case 'wasteland-turret': return <WastelandTurret pos={pos} color={color} size={size} />
    case 'bunker-entrance': return <BunkerEntrance pos={pos} color={color} size={size} />
    case 'apoc-solar-panel': return <ApocSolarPanel pos={pos} color={color} size={size} />
    case 'post-apoc-telephone': return <PostApocTelephone pos={pos} color={color} size={size} />
    // Batch 33 · Farm
    case 'farm-hay-bale': return <FarmHayBale pos={pos} color={color} size={size} />
    case 'chicken-coop': return <ChickenCoop pos={pos} color={color} size={size} />
    case 'tractor-b33': return <TractorB33 pos={pos} color={color} size={size} />
    case 'farm-silo': return <FarmSilo pos={pos} color={color} size={size} />
    case 'garden-scarecrow': return <GardenScarecrow pos={pos} color={color} size={size} />
    case 'rooster-weather-vane': return <RoosterWeatherVane pos={pos} color={color} size={size} />
    case 'pig-pen': return <PigPen pos={pos} color={color} size={size} />
    case 'water-mill': return <WaterMill pos={pos} color={color} size={size} />
    // Batch 33 · Industrial Port
    case 'port-crane': return <PortCrane pos={pos} color={color} size={size} />
    case 'shipping-container': return <ShippingContainer pos={pos} color={color} size={size} />
    case 'dock-cleat': return <DockCleat pos={pos} color={color} size={size} />
    case 'storage-tank-b33': return <StorageTankB33 pos={pos} color={color} size={size} />
    case 'fork-lift': return <ForkLift pos={pos} color={color} size={size} />
    case 'fishing-boat': return <FishingBoat pos={pos} color={color} size={size} />
    case 'lighthouse-port-b33': return <LighthousePortB33 pos={pos} color={color} size={size} />
    case 'coal-conveyor': return <CoalConveyor pos={pos} color={color} size={size} />
    case 'industrial-chimney': return <IndustrialChimney pos={pos} color={color} size={size} />
    // Batch 34 — Ancient Greece
    case 'greek-pillar': return <GreekPillar pos={pos} color={color} size={size} />
    case 'greek-urn-b34': return <GreekUrnB34 pos={pos} color={color} size={size} />
    case 'greek-shield': return <GreekShield pos={pos} color={color} size={size} />
    case 'olive-tree-b34': return <OliveTreeB34 pos={pos} color={color} size={size} />
    case 'greek-lyre': return <GreekLyre pos={pos} color={color} size={size} />
    case 'athens-owl-b34': return <AthensOwlB34 pos={pos} color={color} size={size} />
    case 'trireme-b34': return <TriremeB34 pos={pos} color={color} size={size} />
    case 'parthenon-cap': return <ParthenoCap pos={pos} color={color} size={size} />
    // Batch 34 — Cyberpunk City
    case 'neon-sign-b34': return <NeonSignB34 pos={pos} color={color} size={size} />
    case 'cyber-tower-b34': return <CyberTowerB34 pos={pos} color={color} size={size} />
    case 'hover-car-b34': return <HoverCarB34 pos={pos} color={color} size={size} />
    case 'data-terminal-b34': return <DataTerminalB34 pos={pos} color={color} size={size} />
    case 'cyber-blade-b34': return <CyberBladeB34 pos={pos} color={color} size={size} />
    case 'synth-plant-b34': return <SynthPlantB34 pos={pos} color={color} size={size} />
    case 'cyber-drone-b34': return <CyberDroneB34 pos={pos} color={color} size={size} />
    case 'power-core-b34': return <PowerCoreB34 pos={pos} color={color} size={size} />
    case 'cyber-bridge-b34': return <CyberBridgeB34 pos={pos} color={color} size={size} />
    // Batch 35 — Arctic Tundra
    case 'igloo-b35': return <IglooB35 pos={pos} color={color} size={size} />
    case 'polar-bear-b35': return <PolarBearB35 pos={pos} color={color} size={size} />
    case 'arctic-fox-b35': return <ArcticFoxB35 pos={pos} color={color} size={size} />
    case 'snow-drift-b35': return <SnowDriftB35 pos={pos} color={color} size={size} />
    case 'walrus-b35': return <WalrusB35 pos={pos} color={color} size={size} />
    case 'iceberg-b35': return <IcebergB35 pos={pos} color={color} size={size} />
    case 'northern-lights-b35': return <NorthernLightsB35 pos={pos} color={color} size={size} />
    case 'penguin-b35': return <PenguinB35 pos={pos} color={color} size={size} />
    // Batch 35 — Medieval Castle
    case 'castle-tower-b35': return <CastleTowerB35 pos={pos} color={color} size={size} />
    case 'drawbridge-b35': return <DrawbridgeB35 pos={pos} color={color} size={size} />
    case 'knight-armor-b35': return <KnightArmorB35 pos={pos} color={color} size={size} />
    case 'catapult-b35': return <CatapultB35 pos={pos} color={color} size={size} />
    case 'medieval-well-b35': return <MedievalWellB35 pos={pos} color={color} size={size} />
    case 'torch-b35': return <TorchB35 pos={pos} color={color} size={size} />
    case 'banner-b35': return <BannerB35 pos={pos} color={color} size={size} />
    // Batch 36 — Rainforest
    case 'toucan-b36': return <ToucanB36 pos={pos} color={color} size={size} />
    case 'liana-b36': return <LianaB36 pos={pos} color={color} size={size} />
    case 'parrot-b36': return <ParrotB36 pos={pos} color={color} size={size} />
    case 'water-fall-b36': return <WaterFallB36 pos={pos} color={color} size={size} />
    case 'fern-b36': return <FernB36 pos={pos} color={color} size={size} />
    case 'jaguar-b36': return <JaguarB36 pos={pos} color={color} size={size} />
    // Batch 36 — Space Exploration
    case 'rocket-ship-b36': return <RocketShipB36 pos={pos} color={color} size={size} />
    case 'space-suit-b36': return <SpaceSuitB36 pos={pos} color={color} size={size} />
    case 'lunar-lander-b36': return <LunarLanderB36 pos={pos} color={color} size={size} />
    case 'star-map-b36': return <StarMapB36 pos={pos} color={color} size={size} />
    case 'moon-rover-b36': return <MoonRoverB36 pos={pos} color={color} size={size} />
    case 'asteroid-b36': return <AsteroidB36 pos={pos} color={color} size={size} />
    case 'space-antenna-b36': return <SpaceAntennaB36 pos={pos} color={color} size={size} />
    case 'nebula-crystal-b36': return <NebulaCrystalB36 pos={pos} color={color} size={size} />
    // Batch 37 — Candy Land
    case 'giant-lollipop-b37': return <GiantLollipopB37 pos={pos} color={color} size={size} />
    case 'candy-cane-b37': return <CandyCaneB37 pos={pos} color={color} size={size} />
    case 'gingerbread-house-b37': return <GingerbreadHouseB37 pos={pos} color={color} size={size} />
    case 'gumdrop-b37': return <GumdropB37 pos={pos} color={color} size={size} />
    case 'cotton-candy-b37': return <CottonCandyB37 pos={pos} color={color} size={size} />
    case 'chocolate-fountain-b37': return <ChocolateFountainB37 pos={pos} color={color} size={size} />
    // Batch 37 — Egyptian Pyramids
    case 'pyramid-b37': return <PyramidB37 pos={pos} color={color} size={size} />
    case 'sphinx-b37': return <SphinxB37 pos={pos} color={color} size={size} />
    case 'obelisk-b37': return <ObeliskB37 pos={pos} color={color} size={size} />
    case 'egyptian-vase-b37': return <EgyptianVaseB37 pos={pos} color={color} size={size} />
    case 'anubis-statue-b37': return <AnubisStatueB37 pos={pos} color={color} size={size} />
    case 'scarab-b37': return <ScarabB37 pos={pos} color={color} size={size} />
    case 'tomb-entrance-b37': return <TombEntranceB37 pos={pos} color={color} size={size} />
    // Batch 38 — Pirate Cove
    case 'pirate-ship-b38': return <PirateShipB38 pos={pos} color={color} size={size} />
    case 'treasure-chest-b38': return <TreasureChestB38 pos={pos} color={color} size={size} />
    case 'cannon-b38': return <CannonB38 pos={pos} color={color} size={size} />
    case 'anchor-b38': return <AnchorB38 pos={pos} color={color} size={size} />
    case 'skull-flag-b38': return <SkullFlagB38 pos={pos} color={color} size={size} />
    case 'pirate-barrel-b38': return <PirateBarrelB38 pos={pos} color={color} size={size} />
    // Batch 38 — Fairy Tale Forest
    case 'fairy-mushroom-b38': return <FairyMushroomB38 pos={pos} color={color} size={size} />
    case 'fairy-lantern-b38': return <FairyLanternB38 pos={pos} color={color} size={size} />
    case 'enchanted-tree-b38': return <EnchantedTreeB38 pos={pos} color={color} size={size} />
    case 'fairy-wing-b38': return <FairyWingB38 pos={pos} color={color} size={size} />
    case 'pixie-dust-b38': return <PixieDustB38 pos={pos} color={color} size={size} />
    case 'magic-wand-b38': return <MagicWandB38 pos={pos} color={color} size={size} />
    case 'story-book-b38': return <StoryBookB38 pos={pos} color={color} size={size} />
    // Batch 39 — Dinosaur World
    case 't-rex-b39': return <TRexB39 pos={pos} color={color} size={size} />
    case 'triceratops-b39': return <TriceratopsB39 pos={pos} color={color} size={size} />
    case 'stegosaurus-b39': return <StegosaurusB39 pos={pos} color={color} size={size} />
    case 'dino-egg-b39': return <DinoEggB39 pos={pos} color={color} size={size} />
    case 'pterodactyl-b39': return <PterodactylB39 pos={pos} color={color} size={size} />
    // Batch 39 — Music Studio
    case 'guitar-b39': return <GuitarB39 pos={pos} color={color} size={size} />
    case 'drum-kit-b39': return <DrumKitB39 pos={pos} color={color} size={size} />
    case 'piano-b39': return <PianoB39 pos={pos} color={color} size={size} />
    case 'microphone-b39': return <MicrophoneB39 pos={pos} color={color} size={size} />
    case 'vinyl-record-b39': return <VinylRecordB39 pos={pos} color={color} size={size} />
    case 'speaker-b39': return <SpeakerB39 pos={pos} color={color} size={size} />
    // Batch 40 — Sports
    case 'soccer-ball-b40': return <SoccerBallB40 pos={pos} color={color} size={size} />
    case 'trophy-b40': return <TrophyB40 pos={pos} color={color} size={size} />
    case 'basketball-hoop-b40': return <BasketballHoopB40 pos={pos} color={color} size={size} />
    case 'starting-block-b40': return <StartingBlockB40 pos={pos} color={color} size={size} />
    // Batch 40 — Halloween
    case 'jack-o-lantern-b40': return <JackOLanternB40 pos={pos} color={color} size={size} />
    case 'ghost-b40': return <GhostB40 pos={pos} color={color} size={size} />
    case 'witch-hat-b40': return <WitchHatB40 pos={pos} color={color} size={size} />
    case 'spider-web-b40': return <SpiderWebB40 pos={pos} color={color} size={size} />
    case 'cauldron-b40': return <CauldronB40 pos={pos} color={color} size={size} />
    case 'bat-b40': return <BatB40 pos={pos} color={color} size={size} />
    // Batch 41 — Ocean Life
    case 'dolphin-b41': return <DolphinB41 pos={pos} color={color} size={size} />
    case 'clown-fish-b41': return <ClownFishB41 pos={pos} color={color} size={size} />
    case 'sea-horse-b41': return <SeaHorseB41 pos={pos} color={color} size={size} />
    // Batch 41 — Christmas
    case 'christmas-tree-b41': return <ChristmasTreeB41 pos={pos} color={color} size={size} />
    case 'snowman-b41': return <SnowmanB41 pos={pos} color={color} size={size} />
    case 'gift-box-b41': return <GiftBoxB41 pos={pos} color={color} size={size} />
    case 'reindeer-b41': return <ReindeerB41 pos={pos} color={color} size={size} />
    case 'santa-hat-b41': return <SantaHatB41 pos={pos} color={color} size={size} />
    case 'bell-b41': return <BellB41 pos={pos} color={color} size={size} />
    case 'candle-b41': return <CandleB41 pos={pos} color={color} size={size} />

    default:
      return null
  }
}
