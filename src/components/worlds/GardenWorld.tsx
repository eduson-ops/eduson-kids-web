import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Flowers, Mushroom, GrassTuft } from '../Scenery'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

/**
 * GardenWorld — educational remake of «Grow a Garden» (Roblox top-4, 2025 breakout).
 *
 * Curriculum: M3 capstone «Pet Math Sim» pre-study + introducing timers and probability.
 * Python hooks (later):
 *   plant_seed(x, z, type="carrot")    → _emit("plant_seed", ...)
 *   harvest_at(x, z)                    → _emit("harvest", ...)
 *   mutate_if(chance=0.1)               → probability
 *
 * MVP: процедурная сетка грядок 4×4, на каждой — маленький росток (зелёный конус),
 * некоторые "созрели" (цветок-корона + монета). Пчелы-враги над грядками.
 * NPC-фермер в центре. Цель: собрать 10 монет (созревший урожай).
 */

const GROUND = '#6fd83e'
const DIRT = '#6b4f2a'
const DIRT_EDGE = '#5a3f1e'
const GRID_SIZE = 4        // 4×4 = 16 грядок
const BED_SIZE = 2.4       // ширина одной грядки
const BED_GAP = 0.4        // расстояние между

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[60, 0.5, 60]} />
        <meshStandardMaterial color={GROUND} roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function Fence() {
  // Низкий забор по периметру огорода (декор)
  const W = 22
  const items: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
    { pos: [0, 0.3, -W / 2], size: [W, 0.6, 0.2] },
    { pos: [0, 0.3, W / 2],  size: [W, 0.6, 0.2] },
    { pos: [-W / 2, 0.3, 0], size: [0.2, 0.6, W] },
    { pos: [W / 2, 0.3, 0],  size: [0.2, 0.6, W] },
  ]
  return (
    <>
      {items.map((it, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={it.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={it.size} />
            <meshStandardMaterial color="#a37144" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/**
 * Bed FSM: 'empty' → 'growing' → 'ripe' → 'harvested'
 * Прикоснулся к пустой — посадилось семя. Через GROW_SECS становится спелым.
 * Прикоснулся к спелому — собрал, +монеты, грядка пустая.
 */
const GROW_SECS = 6

function Bed({
  pos,
  initialRipe,
  seed,
  onHarvest,
}: {
  pos: [number, number, number]
  initialRipe: boolean
  seed: number
  onHarvest: () => void
}) {
  const plantRef = useRef<THREE.Group>(null!)
  const phase = useRef(seed * 0.01)
  const [stage, setStage] = useState<'empty' | 'growing' | 'ripe'>(initialRipe ? 'ripe' : 'empty')
  const growT = useRef(0)

  useFrame((_, dt) => {
    phase.current += dt
    if (plantRef.current) {
      plantRef.current.rotation.z = Math.sin(phase.current * 1.5) * 0.05
    }
    if (stage === 'growing') {
      growT.current += dt
      if (growT.current >= GROW_SECS) setStage('ripe')
    }
  })

  const onTouch = (name: string | undefined) => {
    if (name !== 'player') return
    if (stage === 'empty') {
      setStage('growing')
      growT.current = 0
      SFX.click()
    } else if (stage === 'ripe') {
      setStage('empty')
      addCoin(2)
      SFX.coin()
      onHarvest()
    }
  }

  // Масштаб растения зависит от стадии
  const growth = stage === 'empty' ? 0 : stage === 'growing' ? Math.min(1, growT.current / GROW_SECS) : 1
  const showSprout = stage === 'growing' || stage === 'ripe'
  const showFlower = stage === 'ripe'

  return (
    <group position={pos}>
      <RigidBody
        type="fixed"
        colliders="cuboid"
        sensor
        onIntersectionEnter={({ other }) => onTouch(other.rigidBodyObject?.name)}
      >
        <mesh receiveShadow castShadow>
          <boxGeometry args={[BED_SIZE, 0.2, BED_SIZE]} />
          <meshStandardMaterial color={DIRT} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[BED_SIZE + 0.08, 0.2, BED_SIZE + 0.08]} />
          <meshStandardMaterial color={DIRT_EDGE} roughness={0.95} />
        </mesh>
      </RigidBody>
      <group ref={plantRef} position={[0, 0.15, 0]} scale={[growth, growth, growth]}>
        {showSprout && (
          <mesh position={[0, 0.4, 0]} castShadow>
            <coneGeometry args={[0.35, 0.8, 8]} />
            <meshStandardMaterial color="#3fb74d" roughness={0.7} />
          </mesh>
        )}
        {showFlower && (
          <>
            <mesh position={[0, 0.95, 0]} castShadow>
              <sphereGeometry args={[0.28, 12, 10]} />
              <meshStandardMaterial color="#ff5ab1" emissive="#ff5ab1" emissiveIntensity={0.35} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#ffd43c" emissive="#ffd43c" emissiveIntensity={0.7} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

function buildGrid(): Array<{ pos: [number, number, number]; ripe: boolean; seed: number }> {
  const out: Array<{ pos: [number, number, number]; ripe: boolean; seed: number }> = []
  const total = BED_SIZE + BED_GAP
  const offset = -((GRID_SIZE - 1) * total) / 2
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      // ~35% грядок созрели — каждая третья по кольцу
      const ripe = (i * 7 + j * 3) % 3 === 0
      out.push({
        pos: [offset + i * total, 0, offset + j * total],
        ripe,
        seed: i * GRID_SIZE + j,
      })
    }
  }
  return out
}

export default function GardenWorld() {
  const beds = useMemo(buildGrid, [])
  const [harvested, setHarvested] = useState(0)

  return (
    <>
      <Ground />
      <Fence />

      {beds.map((b, i) => (
        <Bed
          key={i}
          pos={b.pos}
          initialRipe={b.ripe}
          seed={b.seed}
          onHarvest={() => setHarvested((h) => h + 1)}
        />
      ))}

      {/* Маленький центральный знак прогресса (без Html, чтобы не перегружать) */}
      <mesh position={[0, 4, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshBasicMaterial color={harvested >= 5 ? '#FFD43C' : '#9FE8C7'} />
      </mesh>
      <Coin pos={[0, 1, 0]} value={harvested >= 5 ? 10 : 1} />
      {/* harvested — просто счётчик-переменная для кап-стона (потом можно в HUD) */}

      {/* NPC-фермер в центре */}
      <NPC pos={[0, 0, 13]} label="ФЕРМЕР" bodyColor="#c8e8a0" />

      {/* Пчелы-«вредители» патрулируют над полем */}
      <GltfMonster which="birb" pos={[-4, 2.2, -4]} patrolX={3} scale={0.7} sensor animation="Run" />
      <GltfMonster which="birb" pos={[4, 2.2, 4]} patrolX={2.5} scale={0.7} sensor animation="Run" />

      {/* Декор по углам */}
      <Tree pos={[-14, 0, -12]} variant={0} />
      <Tree pos={[14, 0, -12]} variant={1} />
      <Tree pos={[-14, 0, 12]} variant={2} />
      <Tree pos={[14, 0, 12]} variant={3} />
      <Bush pos={[-10, 0, 0]} variant={0} scale={1.2} />
      <Bush pos={[10, 0, 0]} variant={1} scale={1.2} />
      <Flowers pos={[-6, 0, 15]} scale={1.3} />
      <Flowers pos={[6, 0, 15]} scale={1.3} />
      <Mushroom pos={[-8, 0, 8]} red scale={1.2} />
      <Mushroom pos={[8, 0, -8]} red={false} scale={1.2} />
      <GrassTuft pos={[-3, 0, 11]} tall />
      <GrassTuft pos={[3, 0, -11]} tall={false} />

      {/* Сарай-финиш: собрал урожай — вернись */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 1, -14]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 2, 2]} />
          <meshStandardMaterial color="#c03535" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[3.2, 0.2, 2.2]} />
          <meshStandardMaterial color="#8a1e1e" roughness={0.8} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 1.8, -14]}
        size={[4, 3, 2.5]}
        result={{
          kind: 'win',
          label: 'УРОЖАЙ СОБРАН!',
          subline: 'Ты зашёл в сарай. Питомцы будут сыты.',
        }}
      />
    </>
  )
}

export const GARDEN_SPAWN: [number, number, number] = [0, 3, 10]
