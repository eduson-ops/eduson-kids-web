import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import NPC from '../NPC'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, GrassTuft, Building } from '../Scenery'

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

function Walls() {
  const W = 80
  const H = 5
  const T = 2
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, H / 2, -W / 2 - T / 2], size: [W + T * 2, H, T] },
    { pos: [0, H / 2, W / 2 + T / 2], size: [W + T * 2, H, T] },
    { pos: [-W / 2 - T / 2, H / 2, 0], size: [T, H, W] },
    { pos: [W / 2 + T / 2, H / 2, 0], size: [T, H, W] },
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

export default function SandboxWorld() {
  return (
    <>
      <Ground />
      <Walls />

      {/* Дома — Kenney City Kit (настоящие здания) */}
      <Building pos={[-10, 0, -12]} letter="a" scale={2.6} rotY={Math.PI / 4} />
      <Building pos={[12, 0, -14]} letter="b" scale={2.6} rotY={-Math.PI / 5} />
      <Building pos={[-14, 0, 6]} letter="c" scale={2.6} rotY={Math.PI / 2} />
      <Building pos={[14, 0, 8]} letter="d" scale={2.6} rotY={-Math.PI / 2} />

      {/* Деревья — Stylized Nature (5 вариантов, случайные) */}
      <Tree pos={[-4, 0, -4]} variant={0} />
      <Tree pos={[3, 0, -3]} variant={1} rotY={0.5} />
      <Tree pos={[-6, 0, 2]} variant={2} />
      <Tree pos={[5, 0, 6]} variant={3} rotY={1.2} />
      <Tree pos={[-14, 0, -2]} variant={4} />
      <Tree pos={[14, 0, -2]} variant={0} rotY={-0.8} />
      <Tree pos={[-2, 0, 14]} variant={1} />
      <Tree pos={[2, 0, -18]} variant={2} rotY={2} />
      <Tree pos={[-8, 0, -18]} variant={3} />
      <Tree pos={[8, 0, -20]} variant={4} rotY={0.4} />

      {/* Кусты и цветы — атмосфера */}
      <Bush pos={[1, 0, 2]} variant={1} scale={0.9} />
      <Bush pos={[-5, 0, -6]} variant={0} scale={1.1} />
      <Bush pos={[7, 0, 2]} variant={1} scale={1} rotY={1} />
      <Flowers pos={[-2, 0, 5]} scale={1.3} />
      <Flowers pos={[4, 0, -8]} scale={1.1} rotY={0.5} />
      <Flowers pos={[-7, 0, -2]} scale={1} />

      {/* Трава */}
      {[
        [-3, 0, 1],
        [2, 0, -2],
        [6, 0, 4],
        [-8, 0, 6],
        [9, 0, -4],
        [-10, 0, -8],
        [-4, 0, 10],
        [5, 0, 12],
      ].map((p, i) => (
        <GrassTuft
          key={i}
          pos={p as [number, number, number]}
          tall={i % 2 === 0}
          scale={0.9 + (i % 3) * 0.1}
          rotY={i * 0.7}
        />
      ))}

      {/* Продавец за прилавком */}
      <NPC pos={[3, 0, -6]} label="ЛАВКА" />

      {/* GLTF-NPC с анимациями */}
      <GltfMonster which="bunny" pos={[-7, 0, -7]} scale={1.2} rotY={Math.PI / 4} animation="Yes" />
      <GltfMonster which="cactoro" pos={[7, 0, -8]} scale={1.3} rotY={-0.5} animation="Wave" />
      <GltfMonster which="alien" pos={[-9, 0, 6]} scale={1.1} rotY={1.2} />

      <Enemy pos={[6, 1.4, -6]} patrolX={2} color="#ff5464" />
      <GltfMonster which="birb" pos={[0, 2.2, 4]} patrolX={5} scale={0.8} sensor animation="Run" />

      {/* Монетки */}
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
        pos={[3, 1.5, -6]}
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
