import { RigidBody } from '@react-three/rapier'
import Coin from '../Coin'
import Vehicle from '../Vehicle'
import GoalTrigger from '../GoalTrigger'

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -30]}>
      <mesh receiveShadow>
        <boxGeometry args={[14, 0.5, 80]} />
        <meshStandardMaterial color="#4a4e5a" />
      </mesh>
    </RigidBody>
  )
}

function Grass() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -30]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#48c774" />
    </mesh>
  )
}

function Wall({
  pos,
  size,
  color = '#ffffff',
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

function Checkpoint({ z, color }: { z: number; color: string }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-6, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[6, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[12, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export default function RaceWorld() {
  return (
    <>
      <Grass />
      <Ground />
      <Wall pos={[-7.2, 0.6, -30]} size={[0.4, 1.2, 80]} color="#ff5464" />
      <Wall pos={[7.2, 0.6, -30]} size={[0.4, 1.2, 80]} color="#ff5464" />
      {[-12, -24, -36, -48, -60].map((z, i) => (
        <Wall key={i} pos={[i % 2 === 0 ? -3 : 3, 0.5, z]} size={[0.8, 1, 0.8]} color="#ffa31a" />
      ))}
      <Checkpoint z={-15} color="#ffd644" />
      <Checkpoint z={-35} color="#4c97ff" />
      <Checkpoint z={-55} color="#c879ff" />

      {/* Машины на обочине */}
      <Vehicle pos={[-4, 0, -20]} color="#ff5464" />
      <Vehicle pos={[4, 0, -45]} color="#4c97ff" />
      <Vehicle pos={[-4, 0, -68]} color="#ffd644" />

      {/* Монетки по траектории */}
      {[-8, -16, -22, -30, -40, -50, -64].map((z, i) => (
        <Coin key={i} pos={[i % 2 === 0 ? -2 : 2, 1, z]} />
      ))}

      {/* Финиш */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, -70]}>
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.2, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2, -70]}
        size={[14, 4, 2]}
        result={{ kind: 'win', label: 'ФИНИШ!', subline: 'Вся трасса пройдена!' }}
      />
    </>
  )
}

export const RACE_SPAWN: [number, number, number] = [0, 3, 4]
