import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, ParkedCar } from '../Scenery'
import { addCoin } from '../../lib/gameState'
import { SFX } from '../../lib/audio'

// Kenney Mini Market CC0 — атмосфера магазин-империи
function MarketProp({
  file,
  pos,
  scale = 1,
  rotY = 0,
}: {
  file: string
  pos: [number, number, number]
  scale?: number
  rotY?: number
}) {
  const gltf = useGLTF(`/models/kenney-mini-market/${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/kenney-mini-market/cash-register.glb')
useGLTF.preload('/models/kenney-mini-market/shopping-cart.glb')
useGLTF.preload('/models/kenney-mini-market/display-fruit.glb')
useGLTF.preload('/models/kenney-mini-market/shelf-bags.glb')
useGLTF.preload('/models/kenney-mini-market/freezer.glb')

/**
 * TycoonWorld — educational remake of «Steal a Brainrot» (Roblox 2025 meme).
 *
 * Curriculum: M5 L35-36 «Brainrot Tycoon» — OOP composition, ticks, accumulation.
 * Python hooks (будущее):
 *   Plinth.income_per_second
 *   Base.total_income()  → sum по всем plinth'ам
 *
 * Механика (живая):
 *   1. Подходишь к плинту (sensor) → становится «твой» → он начинает тикать
 *   2. Каждые 3 сек плинт создаёт монету (+1) прямо на подиуме
 *   3. Набираешь 3 монеты с плинта → он **rebirth** (уровень +1, скорость тика +1)
 *   4. Все 5 плинтов на уровне 3 → goal "IMPERIUM"
 *
 * Это первая карта с настоящим game state и ticking income.
 */

const BASE_COLOR = '#3d3148'
const PATH_COLOR = '#ff9454'
const COLORS = ['#FFD43C', '#FFB4C8', '#9FE8C7', '#A9D8FF', '#c879ff']
const LABELS = ['💰 БАНК', '🍔 ФАСТФУД', '🎮 АРКАДА', '💎 АЛМАЗЫ', '🚀 РАКЕТЫ']

function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[60, 0.5, 60]} />
          <meshStandardMaterial color="#233340" roughness={0.9} />
        </mesh>
      </RigidBody>
      {/* Светящаяся дорожка-круг по плинтам */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.5, 8.5, 48]} />
        <meshStandardMaterial color={PATH_COLOR} emissive={PATH_COLOR} emissiveIntensity={0.45} />
      </mesh>
    </>
  )
}

interface PlinthState {
  level: number        // 1..3
  owned: boolean
  tickAccum: number    // сек накопленных с последнего emit монеты
  cashDrop: number     // сколько монет сейчас лежит (до сбора игроком)
}

function Plinth({
  pos,
  color,
  label,
  onLevel,
}: {
  pos: [number, number, number]
  color: string
  label: string
  onLevel: (lvl: number) => void
}) {
  const bodyRef = useRef<RapierRigidBody>(null!)
  const [state, setState] = useState<PlinthState>({ level: 1, owned: false, tickAccum: 0, cashDrop: 0 })

  // Каждые 3 сек (скалируется уровнем) накапливаем cashDrop. Максимум 5 штук на подиуме.
  useFrame((_, dt) => {
    if (!state.owned) return
    const rate = 1 / (3 / state.level)  // level 1 → 3сек, level 2 → 1.5сек, level 3 → 1сек
    setState((s) => {
      if (!s.owned) return s
      const newAcc = s.tickAccum + dt * rate
      if (newAcc >= 1 && s.cashDrop < 5) {
        return { ...s, tickAccum: newAcc - 1, cashDrop: s.cashDrop + 1 }
      }
      return { ...s, tickAccum: newAcc }
    })
  })

  // При покупке подбираем монеты (т.е. rebirth если 3 накопилось)
  const collect = () => {
    if (state.cashDrop === 0) return
    addCoin(state.cashDrop)
    SFX.coin()
    setState((s) => {
      const base = { ...s, cashDrop: 0 }
      // Rebirth: если игрок собрал ≥3 за раз — апгрейд уровня
      if (s.cashDrop >= 3 && s.level < 3) {
        const nl = s.level + 1
        onLevel(nl)
        return { ...base, level: nl }
      }
      return base
    })
  }

  const height = 0.5 + state.level * 0.3

  return (
    <RigidBody
      ref={bodyRef}
      type="fixed"
      colliders="cuboid"
      position={pos}
      sensor
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.name !== 'player') return
        if (!state.owned) {
          setState((s) => ({ ...s, owned: true }))
          SFX.coin()
        } else {
          collect()
        }
      }}
    >
      {/* Основание плинта */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, height, 16]} />
        <meshStandardMaterial
          color={state.owned ? color : BASE_COLOR}
          emissive={state.owned ? color : '#000'}
          emissiveIntensity={state.owned ? 0.45 : 0}
          roughness={0.5}
          metalness={state.owned ? 0.4 : 0.1}
        />
      </mesh>
      {/* «Ромб» сверху — уровень */}
      <mesh position={[0, height + 0.5, 0]} rotation={[0, state.level * 0.5, 0]}>
        <octahedronGeometry args={[0.35 + state.level * 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      {/* Табличка с лейблом и состоянием */}
      <Html position={[0, height + 1.5, 0]} center distanceFactor={8}>
        <div
          style={{
            background: 'rgba(11,10,17,0.88)',
            color: state.owned ? color : '#7a8099',
            padding: '4px 10px',
            borderRadius: 10,
            border: `2px solid ${state.owned ? color : '#3d4760'}`,
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {state.owned ? `${label} · L${state.level}` : `🔒 ${label} — коснись`}
        </div>
      </Html>
      {/* Накопленные «монеты» в виде маленьких светящихся шариков */}
      {Array.from({ length: state.cashDrop }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.7, height + 0.15, Math.sin(angle) * 0.7]}
            castShadow
          >
            <sphereGeometry args={[0.15, 10, 10]} />
            <meshStandardMaterial
              color="#FFD43C"
              emissive="#FFD43C"
              emissiveIntensity={1.2}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        )
      })}
    </RigidBody>
  )
}

export default function TycoonWorld() {
  // Плинты по кругу r=8 через 72°
  const plinths = Array.from({ length: 5 }).map((_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    return {
      pos: [Math.cos(a) * 8, 0, Math.sin(a) * 8] as [number, number, number],
      color: COLORS[i],
      label: LABELS[i],
    }
  })
  const [levels, setLevels] = useState<number[]>([1, 1, 1, 1, 1])
  const allMaxed = levels.every((l) => l >= 3)

  return (
    <>
      <Ground />

      {/* 5 плинтов */}
      {plinths.map((p, i) => (
        <Plinth
          key={i}
          pos={p.pos}
          color={p.color}
          label={p.label}
          onLevel={(lvl) =>
            setLevels((prev) => {
              const next = [...prev]
              next[i] = lvl
              return next
            })
          }
        />
      ))}

      {/* HUD-индикатор глобального прогресса */}
      <Html position={[0, 10, 0]} center distanceFactor={12}>
        <div
          style={{
            background: 'rgba(11,10,17,0.92)',
            color: '#FFD43C',
            padding: '8px 16px',
            borderRadius: 12,
            border: '2px solid #6B5CE7',
            fontFamily: "'Nunito', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          🏛 Империя: {levels.filter((l) => l >= 3).length} / 5 максимум
        </div>
      </Html>

      {/* Центральная пирамида-«казна» */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.8, 0]}>
        <mesh castShadow receiveShadow>
          <coneGeometry args={[2, 1.6, 4]} />
          <meshStandardMaterial
            color={allMaxed ? '#FFD43C' : '#5a4a8a'}
            emissive={allMaxed ? '#FFD43C' : '#6B5CE7'}
            emissiveIntensity={allMaxed ? 0.8 : 0.3}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      </RigidBody>

      {/* Kenney Mini Market декор — атмосфера настоящего магазина */}
      <MarketProp file="cash-register.glb" pos={[0, 0.5, -2.5]} scale={2.2} />
      <MarketProp file="shopping-cart.glb" pos={[-2, 0, 2]} scale={1.8} rotY={0.4} />
      <MarketProp file="shopping-cart.glb" pos={[2.5, 0, 2]} scale={1.8} rotY={-0.4} />
      <MarketProp file="display-fruit.glb" pos={[-4, 0, 4]} scale={2} />
      <MarketProp file="shelf-bags.glb" pos={[4, 0, 4]} scale={2} rotY={Math.PI / 2} />
      <MarketProp file="freezer.glb" pos={[-12, 0, 12]} scale={2} rotY={Math.PI / 4} />
      <MarketProp file="freezer.glb" pos={[12, 0, -12]} scale={2} rotY={-Math.PI / 4} />

      {/* Монеты стартовые по периферии — мотивация двигаться */}
      <Coin pos={[0, 1, 14]} />
      <Coin pos={[14, 1, 0]} />
      <Coin pos={[0, 1, -14]} />
      <Coin pos={[-14, 1, 0]} />

      {/* Декор */}
      <Tree pos={[-18, 0, -18]} variant={0} />
      <Tree pos={[18, 0, -18]} variant={1} />
      <Tree pos={[-18, 0, 18]} variant={2} />
      <Tree pos={[18, 0, 18]} variant={3} />
      <Bush pos={[-10, 0, -13]} variant={0} scale={1.2} />
      <Bush pos={[10, 0, 13]} variant={1} scale={1.2} />
      <ParkedCar pos={[-14, 0, 8]} model="taxi" rotY={Math.PI / 2} />
      <ParkedCar pos={[14, 0, -8]} model="sedan" rotY={-Math.PI / 2} />

      {/* «Конкуренты» патрулируют */}
      <GltfMonster which="alien" pos={[-6, 0, 12]} patrolX={3} scale={0.9} sensor animation="Wave" />
      <GltfMonster which="cactoro" pos={[6, 0, -12]} patrolX={3} scale={0.9} sensor animation="Wave" />

      {/* Финиш: все 5 плинтов на уровне 3 */}
      {allMaxed && (
        <GoalTrigger
          pos={[0, 2, 0]}
          size={[4, 3, 4]}
          result={{
            kind: 'win',
            label: 'ИМПЕРИЯ!',
            subline: 'Все 5 плинтов на максимальном уровне. Ты — магнат.',
          }}
        />
      )}
    </>
  )
}

export const TYCOON_SPAWN: [number, number, number] = [0, 3, 12]
