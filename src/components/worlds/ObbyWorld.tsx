import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush } from '../Scenery'

const GRASS = '#6fd83e'
const WALL_BLUE = '#2f5599'
const WALL_BLUE_TOP = '#3d6ab5'

interface BlockDef {
  pos: [number, number, number]
  size?: [number, number, number]
  color: string
}

const PLATFORMS: BlockDef[] = [
  { pos: [0, 0.5, -4], color: '#ff5ab1' },
  { pos: [3, 0.8, -7], color: '#ffd644' },
  { pos: [-3, 1.1, -10], color: '#5ba55b' },
  { pos: [0, 1.5, -13], color: '#4c97ff' },
  { pos: [4, 1.9, -16], color: '#c879ff' },
  { pos: [-4, 2.3, -19], color: '#ff8c1a' },
  { pos: [0, 2.7, -22], color: '#ff5ab1' },
]

const PILLARS: BlockDef[] = Array.from({ length: 6 }, (_, i) => ({
  pos: [i % 2 === 0 ? 7 : -7, 1, -2 - i * 5] as [number, number, number],
  size: [1, 2, 1] as [number, number, number],
  color: '#8b9bb4',
}))

function Block({ pos, size, color }: BlockDef) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size ?? [2.4, 1, 2.4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -10]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Walls() {
  const W = 80
  const H = 5
  const T = 2
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W / 2 - T / 2 - 10], size: [W + T * 2, H, T] },
    { pos: [0, H / 2, W / 2 + T / 2 - 10], size: [W + T * 2, H, T] },
    { pos: [-W / 2 - T / 2, H / 2, -10], size: [T, H, W] },
    { pos: [W / 2 + T / 2, H / 2, -10], size: [T, H, W] },
  ]
  return (
    <>
      {items.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={WALL_BLUE} roughness={0.95} />
          </mesh>
          <mesh position={[0, w.size[1] / 2 + 0.15, 0]}>
            <boxGeometry args={[w.size[0], 0.3, w.size[2] + 0.1]} />
            <meshStandardMaterial color={WALL_BLUE_TOP} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

function Finish() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, 3.1, -26]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial
          color="#ffd644"
          emissive="#ffaa00"
          emissiveIntensity={0.25}
          roughness={0.7}
        />
      </mesh>
    </RigidBody>
  )
}

export default function ObbyWorld() {
  return (
    <>
      <Ground />
      <Walls />
      {PLATFORMS.map((b, i) => (
        <Block key={`p${i}`} {...b} />
      ))}
      {PILLARS.map((b, i) => (
        <Block key={`pl${i}`} {...b} />
      ))}
      <Finish />

      {PLATFORMS.map((p, i) => (
        <Coin key={`c${i}`} pos={[p.pos[0], p.pos[1] + 1.2, p.pos[2]]} />
      ))}
      <Coin pos={[5, 1, -4]} />
      <Coin pos={[-5, 1, -4]} />
      <Coin pos={[6, 1, -12]} />
      <Coin pos={[-6, 1, -12]} />

      <Enemy pos={[0, 1.5, -9]} patrolX={3} />
      <Enemy pos={[0, 2.5, -17]} patrolX={4} color="#c879ff" />
      <GltfMonster
        which="blueDemon"
        pos={[0, 3.1, -28]}
        scale={1.4}
        rotY={Math.PI}
        animation="Wave"
      />

      <GoalTrigger
        pos={[0, 4, -26]}
        size={[6, 2, 2]}
        result={{ kind: 'win', label: 'ФИНИШ!', subline: 'Ты прошёл обби!' }}
      />

      {/* Деревья и кусты по периметру (декор, красоты ради) */}
      <Tree pos={[-15, 0, -6]} variant={0} />
      <Tree pos={[15, 0, -6]} variant={1} />
      <Tree pos={[-15, 0, -16]} variant={2} />
      <Tree pos={[15, 0, -16]} variant={3} />
      <Tree pos={[-15, 0, -26]} variant={4} />
      <Tree pos={[15, 0, -26]} variant={0} />
      <Bush pos={[-12, 0, 0]} variant={0} scale={1.2} />
      <Bush pos={[12, 0, 0]} variant={1} scale={1} />
    </>
  )
}

export const OBBY_SPAWN: [number, number, number] = [0, 3, 4]
