import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import StaticModel from './StaticModel'
import GltfNPC from './GltfNPC'
import { PUBLIC_BASE } from '../lib/publicPath'

// Пути к готовым паковым моделям — все CC0, лежат в public/models.
// PUBLIC_BASE пустой локально и '/eduson-kids-web' в проде GH Pages.
const STYLIZED = `${PUBLIC_BASE}/models/stylized-nature`
// Kenney Nature был переименован (kenney-nature/Models/glb), остальные —
// пока с пробелом в папке ("GLB format") из-за Windows lock на переименовании.
const CITY = `${PUBLIC_BASE}/models/kenney-city/Models/GLB%20format`
const CAR = `${PUBLIC_BASE}/models/kenney-car/Models/GLB%20format`
const NATURE = `${PUBLIC_BASE}/models/kenney-nature/Models/glb`

// ─── Деревья (Stylized Nature) ─────────────────────────────

const TREE_VARIANTS = [
  { url: `${STYLIZED}/CommonTree_1.gltf`, scale: 1.1, collider: [0.3, 2.5, 0.3] as [number, number, number] },
  { url: `${STYLIZED}/CommonTree_2.gltf`, scale: 1.0, collider: [0.3, 2.5, 0.3] as [number, number, number] },
  { url: `${STYLIZED}/CommonTree_3.gltf`, scale: 1.2, collider: [0.3, 2.5, 0.3] as [number, number, number] },
  { url: `${STYLIZED}/CommonTree_4.gltf`, scale: 0.9, collider: [0.3, 2.5, 0.3] as [number, number, number] },
  { url: `${STYLIZED}/CommonTree_5.gltf`, scale: 1.15, collider: [0.3, 2.5, 0.3] as [number, number, number] },
] as const

export function Tree({
  pos,
  variant = 0,
  rotY = 0,
}: {
  pos: [number, number, number]
  variant?: number
  rotY?: number
}) {
  const v = TREE_VARIANTS[variant % TREE_VARIANTS.length]!
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      {/* Невидимая "коробка" под колижн — крону оставляем проходимой */}
      <mesh visible={false}>
        <boxGeometry args={v.collider} />
        <meshBasicMaterial />
      </mesh>
      <StaticModel url={v.url} scale={v.scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── Кусты / цветы / трава (Stylized Nature, декор без коллайдера) ──

const BUSH_VARIANTS = [
  `${STYLIZED}/Bush_Common.gltf`,
  `${STYLIZED}/Bush_Common_Flowers.gltf`,
] as const

export function Bush({
  pos,
  variant = 0,
  scale = 1,
  rotY = 0,
}: {
  pos: [number, number, number]
  variant?: number
  scale?: number
  rotY?: number
}) {
  return (
    <group position={pos}>
      <StaticModel url={BUSH_VARIANTS[variant % BUSH_VARIANTS.length]!} scale={scale} rotY={rotY} />
    </group>
  )
}

export function Flowers({
  pos,
  scale = 1,
  rotY = 0,
}: {
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  return (
    <group position={pos}>
      <StaticModel url={`${STYLIZED}/Flower_3_Group.gltf`} scale={scale} rotY={rotY} />
    </group>
  )
}

export function GrassTuft({
  pos,
  tall = false,
  scale = 1,
  rotY = 0,
}: {
  pos: [number, number, number]
  tall?: boolean
  scale?: number
  rotY?: number
}) {
  return (
    <group position={pos}>
      <StaticModel
        url={`${STYLIZED}/Grass_Common_${tall ? 'Tall' : 'Short'}.gltf`}
        scale={scale}
        rotY={rotY}
      />
    </group>
  )
}

// ─── Здания (Kenney Suburban) ─────────────────────────────

// a-an, всего 40 вариантов
export function Building({
  pos,
  letter = 'a',
  scale = 2.6,
  rotY = 0,
}: {
  pos: [number, number, number]
  letter?: string
  scale?: number
  rotY?: number
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${CITY}/building-type-${letter}.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── Машины (Kenney Car Kit) ──────────────────────────────

export function ParkedCar({
  pos,
  model = 'sedan',
  scale = 1.4,
  rotY = 0,
}: {
  pos: [number, number, number]
  /** имя глб без расширения, напр. 'sedan', 'hatchback-sports', 'truck', 'ambulance' */
  model?: string
  scale?: number
  rotY?: number
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${CAR}/${model}.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── Kenney Nature — запас (камни, пни, грибы) ────────────

export function Rock({
  pos,
  scale = 1,
  rotY = 0,
}: {
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${NATURE}/cliff_blockCave_rock.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Mushroom({
  pos,
  red = true,
  scale = 1,
}: {
  pos: [number, number, number]
  red?: boolean
  scale?: number
}) {
  return (
    <group position={pos}>
      <StaticModel url={`${NATURE}/flower_${red ? 'redA' : 'yellowA'}.glb`} scale={scale} />
    </group>
  )
}

// ─── Generated toon props (Blender-generated, CC0-equivalent) ────────────

const GEN = `${PUBLIC_BASE}/models/generated`

export function Chest({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/chest.glb`} scale={scale} rotY={rotY} /></group>
}

export function Crystal({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/crystal.glb`} scale={scale} rotY={rotY} /></group>
}

export function Lantern({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/lantern.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Barrel({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/barrel.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Crate({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/crate.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function MushroomRed({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/mushroom_red.glb`} scale={scale} /></group>
}

export function MushroomGlow({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/mushroom_glow.glb`} scale={scale} /></group>
}

export function TreePine({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/tree_pine.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function TreeRound({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/tree_round.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Sign({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/sign.glb`} scale={scale} rotY={rotY} /></group>
}

export function Well({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/well.glb`} scale={scale} />
    </RigidBody>
  )
}

export function Portal({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/portal.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function GenCampfire({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/campfire.glb`} scale={scale} /></group>
}

export function Bench({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/bench.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Torch({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/torch.glb`} scale={scale} rotY={rotY} /></group>
}

export function Pillar({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/pillar.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Cauldron({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/cauldron.glb`} scale={scale} />
    </RigidBody>
  )
}

export function Bookshelf({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/bookshelf.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Gate({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/gate.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Altar({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/altar.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function GenTable({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/table.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Chair({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/chair.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Flag({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/flag.glb`} scale={scale} rotY={rotY} /></group>
}

export function FlowerPot({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/flower_pot.glb`} scale={scale} /></group>
}

export function Stage({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/stage.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Podium({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/podium.glb`} scale={scale} rotY={rotY} /></group>
}

export function MarketStall({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/market_stall.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Snowflake({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/snowflake.glb`} scale={scale} /></group>
}

export function Spaceship({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/spaceship.glb`} scale={scale} rotY={rotY} /></group>
}

export function Fountain({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/fountain.glb`} scale={scale} />
    </RigidBody>
  )
}

export function Trophy({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/trophy.glb`} scale={scale} rotY={rotY} /></group>
}

export function Ramp({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/ramp.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── Природные пропы из генерации ────────────────────────────

export function IceBlock({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/ice_block.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function LavaRock({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/lava_rock.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function CrystalCluster({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/crystal_cluster.glb`} scale={scale} rotY={rotY} /></group>
}

export function PalmTree({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/palm_tree.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── Боссы (анимированные) ────────────────────────────────────

export function BossGolem({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/boss_golem.glb`} scale={scale} rotY={rotY} /></group>
}

export function BossWizard({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/boss_wizard.glb`} scale={scale} rotY={rotY} /></group>
}

export function BossDragon({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/boss_dragon.glb`} scale={scale} rotY={rotY} /></group>
}

// ─── Тематические декоративные объекты ───────────────────────

export function Jellyfish({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/jellyfish.glb`} scale={scale} /></group>
}

export function PharaohMask({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/pharaoh_mask.glb`} scale={scale} rotY={rotY} /></group>
}

export function EnergyOrb({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/energy_orb.glb`} scale={scale} /></group>
}

export function CoralReef({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/coral_reef.glb`} scale={scale} rotY={rotY} /></group>
}

export function Obelisk({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/obelisk.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Anchor({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/anchor.glb`} scale={scale} rotY={rotY} /></group>
}

export function RuinsPillar({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/ruins_pillar.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function ScifiCrate({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/scifi_crate.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function MagicPotion({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/magic_potion.glb`} scale={scale} rotY={rotY} /></group>
}

export function Seaweed({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/seaweed.glb`} scale={scale} rotY={rotY} /></group>
}

export function PharaohStaff({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/pharaoh_staff.glb`} scale={scale} rotY={rotY} /></group>
}

export function CrystalSword({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/crystal_sword.glb`} scale={scale} rotY={rotY} /></group>
}

export function MagicMushroom({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/magic_mushroom.glb`} scale={scale} rotY={rotY} /></group>
}

export function VikingShip({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/viking_ship.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function MagicGate({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/magic_gate.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function FairyHouse({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/fairy_house.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function UFO({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/ufo.glb`} scale={scale} rotY={rotY} /></group>
}

export function DragonEgg({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/dragon_egg.glb`} scale={scale} rotY={rotY} /></group>
}

export function Whale({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/whale.glb`} scale={scale} rotY={rotY} /></group>
}

export function Meteor({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/meteor.glb`} scale={scale} rotY={rotY} /></group>
}

export function Submarine({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/submarine.glb`} scale={scale} rotY={rotY} /></group>
}

export function Cactus({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/cactus.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

export function Pumpkin({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/pumpkin.glb`} scale={scale} rotY={rotY} /></group>
}

export function Spider({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/spider.glb`} scale={scale} rotY={rotY} /></group>
}

export function GiantClam({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/giant_clam.glb`} scale={scale} rotY={rotY} /></group>
}

export function Scorpion({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><StaticModel url={`${GEN}/scorpion.glb`} scale={scale} rotY={rotY} /></group>
}

export function AncientIdol({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <StaticModel url={`${GEN}/ancient_idol.glb`} scale={scale} rotY={rotY} />
    </RigidBody>
  )
}

// ─── NPC персонажи (анимированные) ────────────────────────────

export function NpcCat({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/npc_cat.glb`} scale={scale} rotY={rotY} /></group>
}

export function NpcRobot({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/npc_robot.glb`} scale={scale} rotY={rotY} /></group>
}

export function NpcFairy({ pos, scale = 1, rotY = 0 }: { pos: [number, number, number]; scale?: number; rotY?: number }) {
  return <group position={pos}><GltfNPC url={`${GEN}/npc_fairy.glb`} scale={scale} rotY={rotY} /></group>
}

// Прелоад самых частых моделей — убирает pop-in при первой игре
useGLTF.preload(TREE_VARIANTS[0].url)
useGLTF.preload(TREE_VARIANTS[1].url)
useGLTF.preload(`${CITY}/building-type-a.glb`)
useGLTF.preload(`${CITY}/building-type-b.glb`)
useGLTF.preload(`${CITY}/building-type-c.glb`)
useGLTF.preload(`${CAR}/sedan.glb`)
// Generated props preload
useGLTF.preload(`${GEN}/chest.glb`)
useGLTF.preload(`${GEN}/lantern.glb`)
useGLTF.preload(`${GEN}/tree_pine.glb`)
useGLTF.preload(`${GEN}/tree_round.glb`)
useGLTF.preload(`${GEN}/torch.glb`)
useGLTF.preload(`${GEN}/pillar.glb`)
useGLTF.preload(`${GEN}/cauldron.glb`)
useGLTF.preload(`${PUBLIC_BASE}/models/generated/penguin_hero.glb`)
useGLTF.preload(`${GEN}/fountain.glb`)
useGLTF.preload(`${GEN}/trophy.glb`)
useGLTF.preload(`${GEN}/stage.glb`)
useGLTF.preload(`${GEN}/podium.glb`)
useGLTF.preload(`${GEN}/spaceship.glb`)
useGLTF.preload(`${GEN}/market_stall.glb`)
useGLTF.preload(`${GEN}/npc_cat.glb`)
useGLTF.preload(`${GEN}/npc_robot.glb`)
useGLTF.preload(`${GEN}/npc_fairy.glb`)
useGLTF.preload(`${GEN}/ice_block.glb`)
useGLTF.preload(`${GEN}/crystal_cluster.glb`)
useGLTF.preload(`${GEN}/palm_tree.glb`)
useGLTF.preload(`${GEN}/boss_golem.glb`)
useGLTF.preload(`${GEN}/boss_wizard.glb`)
useGLTF.preload(`${GEN}/boss_dragon.glb`)
useGLTF.preload(`${GEN}/jellyfish.glb`)
useGLTF.preload(`${GEN}/energy_orb.glb`)
useGLTF.preload(`${GEN}/seaweed.glb`)
useGLTF.preload(`${GEN}/pharaoh_staff.glb`)
useGLTF.preload(`${GEN}/crystal_sword.glb`)
useGLTF.preload(`${GEN}/magic_mushroom.glb`)
useGLTF.preload(`${GEN}/viking_ship.glb`)
useGLTF.preload(`${GEN}/magic_gate.glb`)
useGLTF.preload(`${GEN}/fairy_house.glb`)
useGLTF.preload(`${GEN}/ufo.glb`)
useGLTF.preload(`${GEN}/dragon_egg.glb`)
useGLTF.preload(`${GEN}/whale.glb`)
useGLTF.preload(`${GEN}/meteor.glb`)
useGLTF.preload(`${GEN}/submarine.glb`)
useGLTF.preload(`${GEN}/ancient_idol.glb`)
useGLTF.preload(`${GEN}/cactus.glb`)
useGLTF.preload(`${GEN}/pumpkin.glb`)
useGLTF.preload(`${GEN}/spider.glb`)
useGLTF.preload(`${GEN}/giant_clam.glb`)
useGLTF.preload(`${GEN}/scorpion.glb`)
