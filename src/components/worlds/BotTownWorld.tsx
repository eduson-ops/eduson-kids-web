import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Building, ParkedCar, Flowers, GrassTuft } from '../Scenery'

/**
 * BotTownWorld — educational remake of Brookhaven + Adopt Me.
 *
 * Curriculum: M5 capstone — сделать NPC-брейн на if/elif/else для Adopt Me Pet Brain.
 * MVP: песочница-городок с 6 зданиями, 3 NPC (каждый с ярлыком-ролью),
 * машины по парковке, бабочки-«жители» (GltfMonster), цель — найти 5 жителей.
 *
 * Python hooks (для L29-L30):
 *   on_tick(fn)       — вызывается каждую секунду
 *   walk_to(pos)      — NPC идёт к позиции
 *   on_talk(npc, fn)  — обработчик касания с NPC
 */

const ROAD = '#3a3f4a'
const ROAD_LINE = '#ffff88'
const GRASS = '#6fd83e'

function Grass() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Road({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={ROAD} roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

function RoadLine({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={pos} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={ROAD_LINE} roughness={0.5} />
    </mesh>
  )
}

export default function BotTownWorld() {
  return (
    <>
      <Grass />

      {/* Перекрёсток: горизонтальная и вертикальная дороги */}
      <Road pos={[0, -0.1, 0]} size={[80, 0.3, 6]} />
      <Road pos={[0, -0.1, 0]} size={[6, 0.3, 80]} />
      {/* Разметка центровых линий */}
      {[-35, -25, -15, 15, 25, 35].map((x) => (
        <RoadLine key={`hl${x}`} pos={[x, 0.06, 0]} size={[4, 0.05, 0.3]} />
      ))}
      {[-35, -25, -15, 15, 25, 35].map((z) => (
        <RoadLine key={`vl${z}`} pos={[0, 0.06, z]} size={[0.3, 0.05, 4]} />
      ))}

      {/* 6 зданий вокруг перекрёстка — Kenney City Kit */}
      <Building pos={[-16, 0, -14]} letter="a" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[16, 0, -14]}  letter="b" scale={2.6} rotY={-Math.PI / 2} />
      <Building pos={[-16, 0, 14]}  letter="c" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[16, 0, 14]}   letter="d" scale={2.6} rotY={-Math.PI / 2} />
      <Building pos={[-26, 0, 0]}   letter="a" scale={2.4} rotY={0} />
      <Building pos={[26, 0, 0]}    letter="b" scale={2.4} rotY={Math.PI} />

      {/* 3 NPC с ролями — игрок должен всех обойти */}
      <NPC pos={[-10, 0, -10]} label="БАНК"        bodyColor="#ffd644" />
      <NPC pos={[10, 0, -10]}  label="КАФЕ"        bodyColor="#ff8caa" />
      <NPC pos={[0, 0, 20]}    label="БИБЛИОТЕКА"  bodyColor="#a9d8ff" />

      {/* Монеты на перекрёстках — цель собрать "5 жителей" = 5 coins */}
      <Coin pos={[-8, 1, 0]} />
      <Coin pos={[8, 1, 0]} />
      <Coin pos={[0, 1, -8]} />
      <Coin pos={[0, 1, 8]} />
      <Coin pos={[0, 1, 16]} />

      {/* GltfMonsters — "жители-боты", патрулируют по улицам */}
      <GltfMonster which="bunny"  pos={[-4, 0, -4]} scale={1.0} patrolX={4} sensor animation="Yes" />
      <GltfMonster which="alien"  pos={[4, 0, 4]}   scale={1.0} patrolX={4} sensor animation="Wave" />
      <GltfMonster which="cactoro" pos={[-4, 0, 8]} scale={1.1} animation="Yes" />

      {/* Парковка — машины */}
      <ParkedCar pos={[-14, 0, 4]}  model="taxi"   rotY={Math.PI / 2} />
      <ParkedCar pos={[14, 0, -4]}  model="sedan"  rotY={-Math.PI / 2} />
      <ParkedCar pos={[-14, 0, -4]} model="police" rotY={Math.PI / 2} />

      {/* Декор вокруг перекрёстка: деревья, клумбы */}
      <Tree pos={[-20, 0, -22]} variant={0} />
      <Tree pos={[20, 0, -22]}  variant={1} />
      <Tree pos={[-20, 0, 22]}  variant={2} />
      <Tree pos={[20, 0, 22]}   variant={3} />
      <Bush pos={[-8, 0, -16]}  variant={0} scale={1.2} />
      <Bush pos={[8, 0, -16]}   variant={1} scale={1.0} />
      <Bush pos={[-8, 0, 16]}   variant={0} scale={1.1} />
      <Bush pos={[8, 0, 16]}    variant={1} scale={1.3} />
      <Flowers pos={[-4, 0, -18]} scale={1.3} />
      <Flowers pos={[4, 0, 18]}   scale={1.3} />
      <GrassTuft pos={[-6, 0, -6]} tall />
      <GrassTuft pos={[6, 0, 6]}   tall={false} />

      {/* Центральная фонтан-площадь = финиш */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2, 2.2, 0.5, 16]} />
          <meshStandardMaterial color="#6B5CE7" emissive="#6B5CE7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.6, 10]} />
          <meshStandardMaterial color="#88ddff" emissive="#88ddff" emissiveIntensity={0.5} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2, 0]}
        size={[3, 3, 3]}
        result={{
          kind: 'win',
          label: 'ДОБРО ПОЖАЛОВАТЬ!',
          subline: 'Ты познакомился с ботами города. Тут можно жить.',
        }}
      />
    </>
  )
}

export const BOTTOWN_SPAWN: [number, number, number] = [0, 3, 12]
