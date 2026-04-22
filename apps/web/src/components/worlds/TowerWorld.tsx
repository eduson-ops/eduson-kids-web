import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'

/**
 * TowerWorld — кап-стон для модуля M4 «Функции и повторы».
 *
 * Процедурно генерируемая башня из 8 секций. Каждая секция собрана из случайно
 * выбранного префаба: straight / zigzag / moving / rotating / spikes.
 * Таймер 8 мин (480 сек) задаётся при старте уровня через set_timer (см. API ниже).
 *
 * Python SDK (для урока M4 L24):
 *   tower_section(type="straight")   — добавить секцию
 *   randomize_tower(seed=42)         — процедурная генерация
 *   set_timer(seconds=480)           — установить таймер
 *
 * Ассеты: пока только цветные boxGeometry (Kenney packs подключим в полировке).
 */

// ─── Tunables ────────────────────────────────────────────────────
const SECTION_COUNT = 8
const SECTION_HEIGHT = 6       // юнитов между уровнями
const BASE_Y = 0                // низ башни
const TOWER_RADIUS = 8          // радиус в XZ — платформы укладываются в 16x16 "этаж"
const SEED = 42                 // дефолтный seed (рандомайзер детерминированный)

// ─── Palette (Blockseli) ────────────────────────────────────────
const PAL = {
  platform: ['#6B5CE7', '#FFB4C8', '#9FE8C7', '#A9D8FF', '#FFD43C', '#FF9454'],
  spike: '#ff5464',
  moving: '#5AA9FF',
  rotating: '#c879ff',
}

type PrefabKind = 'straight' | 'zigzag' | 'moving' | 'rotating' | 'spikes'
const PREFAB_POOL: PrefabKind[] = ['straight', 'zigzag', 'moving', 'rotating', 'spikes']

// Mulberry32 — детерминированный seeded PRNG
function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SectionDef {
  y: number
  kind: PrefabKind
  color: string
  seedForThis: number
}

function buildSections(seed: number): SectionDef[] {
  const rand = mulberry32(seed)
  const out: SectionDef[] = []
  for (let i = 0; i < SECTION_COUNT; i++) {
    const y = BASE_Y + i * SECTION_HEIGHT
    // Первая секция всегда straight — честный старт
    const kind: PrefabKind = i === 0 ? 'straight' : PREFAB_POOL[Math.floor(rand() * PREFAB_POOL.length)]
    const color = PAL.platform[Math.floor(rand() * PAL.platform.length)]
    out.push({ y, kind, color, seedForThis: Math.floor(rand() * 1e9) })
  }
  return out
}

// ─── Static prefabs ─────────────────────────────────────────────
function StraightSection({ y, color, seed }: { y: number; color: string; seed: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed])
  // Платформа 6x1x4 с ямкой по центру на 1 юнит (заставляет прыгать)
  const offsetX = (rand() - 0.5) * 2
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[offsetX - 1.5, y, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 0.5, 4]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[offsetX + 1.8, y, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.5, 4]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </RigidBody>
    </>
  )
}

function ZigzagSection({ y, color, seed }: { y: number; color: string; seed: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed])
  // 3 маленьких смещённых платформы в шахматном порядке
  const slots: Array<[number, number]> = [
    [-3 + rand() * 0.5, -1.5],
    [0 + (rand() - 0.5) * 1, 0.5],
    [3 - rand() * 0.5, -0.5],
  ]
  return (
    <>
      {slots.map(([x, z], i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={[x, y + i * 0.6, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.6, 0.4, 1.6]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

function MovingSection({ y, seed }: { y: number; seed: number }) {
  const rb = useRef<THREE.Group>(null!)
  const phase = useRef(mulberry32(seed)() * Math.PI * 2)
  useFrame((_, dt) => {
    if (!rb.current) return
    phase.current += dt * 0.8
    rb.current.position.x = Math.sin(phase.current) * 2.5
  })
  return (
    <group ref={rb} position={[0, y, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.4, 2.2]} />
          <meshStandardMaterial color={PAL.moving} roughness={0.6} metalness={0.2} />
        </mesh>
      </RigidBody>
    </group>
  )
}

function RotatingSection({ y, seed }: { y: number; seed: number }) {
  const ref = useRef<THREE.Group>(null!)
  const initPhase = useRef(mulberry32(seed)() * Math.PI * 2)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.5
  })
  return (
    <group ref={ref} position={[0, y, 0]} rotation={[0, initPhase.current, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.5, 0.3, 1.2]} />
          <meshStandardMaterial color={PAL.rotating} roughness={0.5} />
        </mesh>
      </RigidBody>
    </group>
  )
}

function SpikesSection({ y, color, seed }: { y: number; color: string; seed: number }) {
  const rand = useMemo(() => mulberry32(seed), [seed])
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, y, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.4, 3]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </RigidBody>
      {/* 2 патрулирующих врага в качестве "шипов" */}
      <Enemy pos={[-1.5 + rand(), y + 0.8, 0]} patrolX={2} color={PAL.spike} />
      <Enemy pos={[1.5 - rand(), y + 0.8, 0.5]} patrolX={1.5} color="#ff8c1a" />
    </>
  )
}

// ─── Базовая земля-спавн ─────────────────────────────────────
function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 4]}>
      <mesh receiveShadow>
        <boxGeometry args={[40, 1, 40]} />
        <meshStandardMaterial color="#2a3142" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

function TowerCore() {
  // Центральная колонна-обелиск — визуальный ориентир башни
  const height = SECTION_COUNT * SECTION_HEIGHT + 2
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[0.5, 0.5, height, 12]} />
      <meshStandardMaterial color="#15141b" roughness={0.4} emissive="#6B5CE7" emissiveIntensity={0.15} />
    </mesh>
  )
}

function TowerBase() {
  // Большая стартовая платформа на y=0 с подсветкой
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[TOWER_RADIUS * 2, 0.6, TOWER_RADIUS * 2]} />
          <meshStandardMaterial color="#1e1933" roughness={0.7} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.35, 0]}>
        <ringGeometry args={[TOWER_RADIUS - 1, TOWER_RADIUS - 0.6, 32]} />
        <meshStandardMaterial
          color="#6B5CE7"
          emissive="#6B5CE7"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

// ─── World Component ─────────────────────────────────────────
export default function TowerWorld() {
  const sections = useMemo(() => buildSections(SEED), [])
  const topY = BASE_Y + SECTION_COUNT * SECTION_HEIGHT

  return (
    <>
      <Ground />
      <TowerBase />
      <TowerCore />

      {sections.map((s, i) => {
        const key = `sec-${i}`
        switch (s.kind) {
          case 'straight':
            return <StraightSection key={key} y={s.y + 1} color={s.color} seed={s.seedForThis} />
          case 'zigzag':
            return <ZigzagSection key={key} y={s.y + 1} color={s.color} seed={s.seedForThis} />
          case 'moving':
            return <MovingSection key={key} y={s.y + 1} seed={s.seedForThis} />
          case 'rotating':
            return <RotatingSection key={key} y={s.y + 1} seed={s.seedForThis} />
          case 'spikes':
            return <SpikesSection key={key} y={s.y + 1} color={s.color} seed={s.seedForThis} />
        }
      })}

      {/* Монеты между секций (каждая третья) */}
      {sections
        .filter((_, i) => i % 2 === 1)
        .map((s, i) => (
          <Coin key={`c${i}`} pos={[(i % 2 === 0 ? 1 : -1) * 1.5, s.y + 2, 0]} />
        ))}

      {/* Финиш на вершине */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, topY, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.3, 6]} />
          <meshStandardMaterial
            color="#ffd644"
            emissive="#ffaa00"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, topY + 2, 0]}
        size={[6, 4, 6]}
        result={{
          kind: 'win',
          label: 'ВЕРШИНА!',
          subline: `Ты добрался до верха башни из ${SECTION_COUNT} секций!`,
        }}
      />
    </>
  )
}

/** Спавн-точка игрока в TowerWorld: на стартовой платформе, лицом к башне */
export const TOWER_SPAWN: [number, number, number] = [0, 3, 8]
