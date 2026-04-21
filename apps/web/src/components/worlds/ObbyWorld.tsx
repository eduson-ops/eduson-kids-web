import { RigidBody } from '@react-three/rapier'

interface BlockDef {
  pos: [number, number, number]
  size?: [number, number, number]
  color: string
}

// Радужная полоса прыгательных платформ — классический obby-паттерн.
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

const WALLS: BlockDef[] = [
  { pos: [-10, 1, -10], size: [1, 2, 40], color: '#2a3142' },
  { pos: [10, 1, -10], size: [1, 2, 40], color: '#2a3142' },
]

function Block({ pos, size, color }: BlockDef) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size ?? [2.4, 1, 2.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -10]}>
      <mesh receiveShadow>
        <boxGeometry args={[80, 0.5, 80]} />
        <meshStandardMaterial color="#5ba55b" />
      </mesh>
    </RigidBody>
  )
}

function Finish() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, 3.1, -26]}>
      <mesh castShadow>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial
          color="#ffd644"
          emissive="#ffd644"
          emissiveIntensity={0.4}
        />
      </mesh>
    </RigidBody>
  )
}

export default function ObbyWorld() {
  return (
    <>
      <Ground />
      {PLATFORMS.map((b, i) => (
        <Block key={`p${i}`} {...b} />
      ))}
      {PILLARS.map((b, i) => (
        <Block key={`pl${i}`} {...b} />
      ))}
      {WALLS.map((b, i) => (
        <Block key={`w${i}`} {...b} />
      ))}
      <Finish />
    </>
  )
}

export const OBBY_SPAWN: [number, number, number] = [0, 3, 4]
