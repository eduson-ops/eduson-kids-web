import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import StaticModel from './StaticModel'
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

export const TREE_VARIANTS = [
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

export const BUSH_VARIANTS = [
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

// Прелоад самых частых моделей — убирает pop-in при первой игре
useGLTF.preload(TREE_VARIANTS[0].url)
useGLTF.preload(TREE_VARIANTS[1].url)
useGLTF.preload(`${CITY}/building-type-a.glb`)
useGLTF.preload(`${CITY}/building-type-b.glb`)
useGLTF.preload(`${CITY}/building-type-c.glb`)
useGLTF.preload(`${CAR}/sedan.glb`)
