import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

/**
 * PetSimWorld — educational remake of «Pet Simulator 99» (Roblox top-6).
 *
 * Curriculum: M3 capstone «Pet Math Sim» — формула урона = base * level * rarity.
 * MVP — три зоны подряд:
 *   Zone 1: Трава (низкая награда)  — 5 блоков, coin на каждом
 *   Zone 2: Лёд (средняя)           — 5 блоков, coin на каждом
 *   Zone 3: Космос (высокая)        — 5 блоков, coin + редкий «rainbow»
 * Питомцы (GLTF-монстры) расставлены по зонам как decor.
 *
 * Python hooks для урока L14-L17:
 *   damage(base, level, rarity)  — formula
 *   rebirth()                    — reset progression
 */

const GRASS = '#6fd83e'
const ICE = '#88d4ff'
const SPACE = '#15142a'

interface ZoneDef {
  z0: number
  z1: number
  color: string
  blockColor: string
  name: string
  rarity: number
}

const ZONES: ZoneDef[] = [
  { z0:  0,  z1: -20, color: GRASS, blockColor: '#3fb74d', name: 'Трава',  rarity: 1 },
  { z0: -20, z1: -40, color: ICE,   blockColor: '#5aa9ff', name: 'Лёд',    rarity: 2 },
  { z0: -40, z1: -60, color: SPACE, blockColor: '#6B5CE7', name: 'Космос', rarity: 5 },
]

function Zone({ z0, z1, color }: ZoneDef) {
  const length = Math.abs(z1 - z0)
  const centerZ = (z0 + z1) / 2
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, centerZ]}>
      <mesh receiveShadow>
        <boxGeometry args={[24, 0.5, length]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    </RigidBody>
  )
}

function BreakableBlock({
  pos,
  color,
  rare,
  reward,
}: {
  pos: [number, number, number]
  color: string
  rare?: boolean
  reward: number
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [state, setState] = useState<'idle' | 'breaking' | 'done'>('idle')
  const breakT = useRef(0)

  // «Дышащая» анимация блока в idle
  useFrame((_, dt) => {
    if (state === 'idle' && meshRef.current) {
      meshRef.current.rotation.y += dt * 0.4
    }
    if (state === 'breaking' && meshRef.current) {
      breakT.current += dt
      const p = Math.min(breakT.current / 0.35, 1)
      meshRef.current.scale.setScalar(1 - p)
      if (p >= 1) setState('done')
    }
  })

  if (state === 'done') return null

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={pos}
      sensor={state === 'breaking'}
      onIntersectionEnter={({ other }) => {
        if (state !== 'idle') return
        if (other.rigidBodyObject?.name === 'player') {
          setState('breaking')
          breakT.current = 0
          addCoin(reward)
          SFX.coin()
        }
      }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color={color}
          roughness={rare ? 0.2 : 0.7}
          metalness={rare ? 0.9 : 0.1}
          emissive={rare ? color : '#000'}
          emissiveIntensity={rare ? 0.5 : 0}
        />
      </mesh>
      {/* Трещинки-декор при rare */}
      {rare && (
        <mesh position={[0, 0.8, 0]}>
          <torusGeometry args={[0.5, 0.05, 6, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} transparent opacity={0.7} />
        </mesh>
      )}
    </RigidBody>
  )
}

function ZoneBlocks({ zone, i }: { zone: ZoneDef; i: number }) {
  // Ряд из 5 блоков по центру зоны, X-шахматка. Сломал блок — получил монеты.
  const blocks: Array<{ pos: [number, number, number]; rare: boolean }> = []
  const zLen = Math.abs(zone.z1 - zone.z0)
  for (let k = 0; k < 5; k++) {
    const zFrac = (k + 0.5) / 5
    const z = zone.z0 - zFrac * zLen
    const x = (k % 2 === 0 ? -3 : 3)
    const rare = k === 2 && i === 2          // центральный блок в Космосе — редкий
    blocks.push({ pos: [x, 0.7, z], rare })
  }
  return (
    <>
      {blocks.map((b, idx) => (
        <BreakableBlock
          key={idx}
          pos={b.pos}
          color={zone.blockColor}
          rare={b.rare}
          reward={b.rare ? zone.rarity * 3 : zone.rarity}
        />
      ))}
    </>
  )
}

function ZoneSign({ zone }: { zone: ZoneDef }) {
  // Яркая вывеска на границе зоны
  return (
    <group position={[0, 2.5, zone.z0 - 0.5]}>
      <mesh castShadow>
        <boxGeometry args={[10, 1.2, 0.25]} />
        <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.35} />
      </mesh>
      {/* Палочки-опоры */}
      <mesh position={[-4.5, -1.8, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#7a4a22" />
      </mesh>
      <mesh position={[4.5, -1.8, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#7a4a22" />
      </mesh>
      {/* Буквы через маленькие шарики не делаем — пустая вывеска, цвет = зона */}
    </group>
  )
}

export default function PetSimWorld() {
  return (
    <>
      {ZONES.map((z, i) => (
        <Zone key={`z${i}`} {...z} />
      ))}

      {/* Стартовая платформа-«портал» */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, 5]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[3, 3, 0.4, 24]} />
          <meshStandardMaterial color="#9FE8C7" emissive="#9FE8C7" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>

      {/* Вывески-разделители зон */}
      {ZONES.map((z, i) => (
        <ZoneSign key={`s${i}`} zone={z} />
      ))}

      {/* Блоки + монеты в каждой зоне */}
      {ZONES.map((z, i) => (
        <ZoneBlocks key={`b${i}`} zone={z} i={i} />
      ))}

      {/* Питомцы — GltfMonsters по зонам */}
      <GltfMonster which="bunny" pos={[-7, 0, -8]}   scale={1.0} animation="Yes" />
      <GltfMonster which="cactoro" pos={[7, 0, -10]} scale={1.1} animation="Wave" />
      <GltfMonster which="alien" pos={[-7, 0, -28]}  scale={1.1} />
      <GltfMonster which="birb" pos={[7, 2, -32]}    scale={0.8} patrolX={3} sensor animation="Run" />
      <GltfMonster which="blueDemon" pos={[0, 0, -50]} scale={1.4} animation="Wave" />

      {/* Финиш — звёздный трон в конце космоса */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, -62]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 2, 3]} />
          <meshStandardMaterial
            color="#c879ff"
            emissive="#c879ff"
            emissiveIntensity={0.5}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2.5, -62]}
        size={[5, 4, 3]}
        result={{
          kind: 'win',
          label: 'МАКС УРОВЕНЬ!',
          subline: 'Ты прошёл все зоны: Трава → Лёд → Космос.',
        }}
      />
    </>
  )
}

export const PETSIM_SPAWN: [number, number, number] = [0, 3, 8]
