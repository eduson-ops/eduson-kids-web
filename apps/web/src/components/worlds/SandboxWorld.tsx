import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import NPC from '../NPC'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color="#48c774" />
      </mesh>
    </RigidBody>
  )
}

function House({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.4, 1.2, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

function Tree({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.75, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.25, 1.5, 6]} />
          <meshStandardMaterial color="#6b3a0f" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color="#36a336" />
      </mesh>
    </group>
  )
}

export default function SandboxWorld() {
  return (
    <>
      <Ground />
      <House pos={[-8, 0, -8]} color="#ff8c1a" />
      <House pos={[8, 0, -10]} color="#4c97ff" />
      <House pos={[-10, 0, 5]} color="#c879ff" />
      <Tree pos={[-4, 0, -4]} />
      <Tree pos={[3, 0, -3]} />
      <Tree pos={[-6, 0, 2]} />
      <Tree pos={[5, 0, 6]} />
      <Tree pos={[-12, 0, -2]} />
      <Tree pos={[12, 0, 2]} />

      {/* Продавец за прилавком (как на скрине Блокселей) */}
      <NPC pos={[3, 0, -12]} label="ЛАВКА" />

      {/* Зайка-NPC у домика — радуется (Yes) */}
      <GltfMonster
        which="bunny"
        pos={[-7, 0, -7]}
        scale={1.2}
        rotY={Math.PI / 4}
        animation="Yes"
      />
      {/* Кактус-монстр у другого домика — машет рукой */}
      <GltfMonster
        which="cactoro"
        pos={[7, 0, -8]}
        scale={1.3}
        rotY={-0.5}
        animation="Wave"
      />
      {/* Алиен-путешественник — просто Idle (дышит) */}
      <GltfMonster which="alien" pos={[-9, 0, 6]} scale={1.1} rotY={1.2} />

      {/* Пара "злых" капель (процедурные) */}
      <Enemy pos={[6, 1.4, -6]} patrolX={2} color="#ff5464" />
      {/* Летающая птичка-патруль из Quaternius — анимация Run */}
      <GltfMonster
        which="birb"
        pos={[0, 2.2, 4]}
        patrolX={5}
        scale={0.8}
        sensor
        animation="Run"
      />

      {/* Монетки по карте */}
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

      {/* Победа: собери 8 монет — скоро реализуем через подписку */}
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
