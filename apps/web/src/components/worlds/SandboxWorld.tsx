import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import NPC from '../NPC'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'

// Яркая сочная трава как у Bloxels.
const GRASS = '#6fd83e'
const WALL_BLUE = '#2f5599'
const WALL_BLUE_TOP = '#3d6ab5'

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color={GRASS} roughness={0.9} metalness={0} />
      </mesh>
    </RigidBody>
  )
}

// Воксельные стены-бордюры по периметру (как синие стены на скрине Bloxels)
function Walls() {
  const W = 80 // ширина поля
  const H = 5 // высота стен
  const T = 2 // толщина
  const items: Array<{ pos: [number, number, number]; size: [number, number, number]; color: string }> = [
    { pos: [0, H / 2, -W / 2 - T / 2], size: [W + T * 2, H, T], color: WALL_BLUE },
    { pos: [0, H / 2, W / 2 + T / 2], size: [W + T * 2, H, T], color: WALL_BLUE },
    { pos: [-W / 2 - T / 2, H / 2, 0], size: [T, H, W], color: WALL_BLUE },
    { pos: [W / 2 + T / 2, H / 2, 0], size: [T, H, W], color: WALL_BLUE },
  ]
  return (
    <>
      {items.map((w, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={w.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color={w.color} roughness={0.95} />
          </mesh>
          {/* верхний бортик чуть светлее — объём */}
          <mesh position={[0, w.size[1] / 2 + 0.15, 0]}>
            <boxGeometry args={[w.size[0], 0.3, w.size[2] + 0.1]} />
            <meshStandardMaterial color={WALL_BLUE_TOP} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

function House({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.4, 1.2, 4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Воксельное дерево — как на скрине Bloxels: тонкий тёмный куб-ствол + большой куб-крона
function Tree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1.1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 2.2, 0.5]} />
          <meshStandardMaterial color="#3a2410" roughness={0.95} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#3fc724" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Мелкие пучки травы для атмосферы
function GrassTufts() {
  const positions: Array<[number, number, number]> = [
    [2, 0.1, -4], [-3, 0.1, 3], [5, 0.1, 5], [-5, 0.1, -7],
    [8, 0.1, -2], [-8, 0.1, 2], [3, 0.1, 9], [-3, 0.1, -12],
    [10, 0.1, 6], [-10, 0.1, -3], [12, 0.1, -8], [-12, 0.1, 6],
  ]
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#2aad1c" roughness={0.95} />
        </mesh>
      ))}
    </>
  )
}

export default function SandboxWorld() {
  return (
    <>
      <Ground />
      <Walls />
      <GrassTufts />
      <House pos={[-8, 0, -8]} color="#ff8c1a" />
      <House pos={[8, 0, -10]} color="#4c97ff" />
      <House pos={[-10, 0, 5]} color="#c879ff" />
      <Tree pos={[-4, 0, -4]} />
      <Tree pos={[3, 0, -3]} />
      <Tree pos={[-6, 0, 2]} />
      <Tree pos={[5, 0, 6]} />
      <Tree pos={[-14, 0, -2]} />
      <Tree pos={[14, 0, 2]} />
      <Tree pos={[-2, 0, 12]} />
      <Tree pos={[2, 0, -14]} />

      {/* Продавец за прилавком */}
      <NPC pos={[3, 0, -12]} label="ЛАВКА" />

      {/* GLTF-NPC с анимациями */}
      <GltfMonster which="bunny" pos={[-7, 0, -7]} scale={1.2} rotY={Math.PI / 4} animation="Yes" />
      <GltfMonster which="cactoro" pos={[7, 0, -8]} scale={1.3} rotY={-0.5} animation="Wave" />
      <GltfMonster which="alien" pos={[-9, 0, 6]} scale={1.1} rotY={1.2} />

      <Enemy pos={[6, 1.4, -6]} patrolX={2} color="#ff5464" />
      <GltfMonster which="birb" pos={[0, 2.2, 4]} patrolX={5} scale={0.8} sensor animation="Run" />

      {/* Монетки раскиданы */}
      {[
        [0, 1, -4],
        [4, 1, 4],
        [-5, 1, -6],
        [6, 1, -10],
        [-8, 1, 8],
        [10, 1, 4],
        [-2, 1, 10],
        [8, 1, -3],
      ].map((p, i) => (
        <Coin key={i} pos={p as [number, number, number]} />
      ))}

      <GoalTrigger
        pos={[3, 1.5, -12]}
        size={[2, 3, 2]}
        result={{
          kind: 'win',
          label: 'ДОБРО ПОЖАЛОВАТЬ!',
          subline: 'Ты нашёл торговца. Собирай монетки!',
        }}
      />
    </>
  )
}

export const SANDBOX_SPAWN: [number, number, number] = [0, 3, 6]
