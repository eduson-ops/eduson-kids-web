import { memo, useMemo } from 'react'
import * as THREE from 'three'

// Простая "obby"-подобная сцена для MVP: plane + цветные платформы + финиш.
// В Stage 2 будем грузить JSON-описание мира из игры (через API).

interface BlockDef {
  pos: [number, number, number]
  size?: [number, number, number]
  color: string
}

const BLOCKS: BlockDef[] = [
  // Цветная дорожка — прыжки по платформам
  { pos: [0, 0.5, -4], color: '#ff5ab1' },
  { pos: [3, 0.5, -7], color: '#ffd644' },
  { pos: [-3, 0.5, -10], color: '#5ba55b' },
  { pos: [0, 0.5, -13], color: '#4c97ff' },
  { pos: [4, 0.5, -16], color: '#c879ff' },
  { pos: [-4, 0.5, -19], color: '#ff8c1a' },
  { pos: [0, 0.5, -22], color: '#ff5ab1' },
  // Стены-декорации слева/справа
  { pos: [-10, 1, 0], size: [1, 2, 40], color: '#2a3142' },
  { pos: [10, 1, 0], size: [1, 2, 40], color: '#2a3142' },
]

// Пассивные препятствия-столбы
const PILLARS: BlockDef[] = Array.from({ length: 6 }, (_, i) => ({
  pos: [i % 2 === 0 ? 6 : -6, 1, -2 - i * 5] as [number, number, number],
  size: [1, 2, 1] as [number, number, number],
  color: '#8b9bb4',
}))

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]} receiveShadow>
      <planeGeometry args={[60, 80]} />
      <meshStandardMaterial color="#5ba55b" />
    </mesh>
  )
}

function Finish() {
  return (
    <group position={[0, 0.1, -26]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial
          color="#ffd644"
          emissive="#ffd644"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, 0.15]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.4, 2.8, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshBasicMaterial color="#ff5ab1" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Block({ pos, size, color }: BlockDef) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size ?? [2.4, 1, 2.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function World() {
  const all = useMemo(() => [...BLOCKS, ...PILLARS], [])
  return (
    <>
      <Ground />
      {all.map((b, i) => (
        <Block key={i} {...b} />
      ))}
      <Finish />
    </>
  )
}

export default memo(World)
