import { RigidBody } from '@react-three/rapier'

// Песочница: плоский мир с несколькими "домиками" и деревьями для атмосферы.
function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color="#6cb76c" />
      </mesh>
    </RigidBody>
  )
}

function House({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <group position={pos}>
      {/* Стены */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
      {/* Крыша */}
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
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshStandardMaterial color="#2f7a2f" />
      </mesh>
    </group>
  )
}

function Pillar({ pos, color }: { pos: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
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
      <Pillar pos={[0, 1.25, -15]} color="#ffd644" />
      <Pillar pos={[-5, 1.25, -18]} color="#ff5ab1" />
      <Pillar pos={[5, 1.25, -18]} color="#5ba55b" />
    </>
  )
}

export const SANDBOX_SPAWN: [number, number, number] = [0, 3, 6]
