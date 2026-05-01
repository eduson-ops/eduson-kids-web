import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import Enemy from '../Enemy'
import GoalTrigger from '../GoalTrigger'
import GradientSky from '../GradientSky'

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
    const kind: PrefabKind = i === 0 ? 'straight' : (PREFAB_POOL[Math.floor(rand() * PREFAB_POOL.length)] ?? 'straight')
    const color = PAL.platform[Math.floor(rand() * PAL.platform.length)] ?? '#6b5ce7'
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
      <pointLight color="#4488ff" intensity={0.6} distance={5} position={[offsetX - 1.5, y - 0.5, 0]} />
      <RigidBody type="fixed" colliders="cuboid" position={[offsetX + 1.8, y, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.5, 4]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      </RigidBody>
      <pointLight color="#4488ff" intensity={0.6} distance={5} position={[offsetX + 1.8, y - 0.5, 0]} />
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
        <group key={i}>
          <RigidBody type="fixed" colliders="cuboid" position={[x, y + i * 0.6, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.4, 1.6]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          </RigidBody>
          <pointLight color="#4488ff" intensity={0.6} distance={5} position={[x, y + i * 0.6 - 0.4, z]} />
        </group>
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
      <pointLight color="#4488ff" intensity={0.6} distance={5} position={[0, -0.4, 0]} />
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
      <pointLight color="#4488ff" intensity={0.6} distance={5} position={[0, -0.3, 0]} />
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
      <pointLight color="#4488ff" intensity={0.6} distance={5} position={[0, y - 0.4, 0]} />
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

// ─── Cloud Band (mid-height misty plane) ─────────────────────
const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float wisp = sin(vUv.x * 12.0 + iTime * 0.3) * sin(vUv.y * 8.0 + iTime * 0.2);
    float alpha = clamp(wisp * 0.5 + 0.5, 0.0, 1.0) * 0.12;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

function CloudBand() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({ iTime: { value: 0.0 } }),
    []
  )
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = clock.elapsedTime
    }
  })
  return (
    <mesh position={[0, 15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={cloudVertexShader}
        fragmentShader={cloudFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Lightning Flash ─────────────────────────────────────────
function LightningFlash() {
  const ambientRef = useRef<THREE.AmbientLight>(null!)
  const pointRef = useRef<THREE.PointLight>(null!)
  const intensity = useRef(0.0)

  useFrame(() => {
    // Random trigger ~0.1% chance per frame
    if (Math.random() < 0.001) {
      intensity.current = 4.0
    }
    // Exponential decay
    intensity.current *= 0.92
    const v = intensity.current
    if (ambientRef.current) {
      ambientRef.current.intensity = v
    }
    if (pointRef.current) {
      pointRef.current.intensity = v * 3.0
    }
  })

  const topY = BASE_Y + SECTION_COUNT * SECTION_HEIGHT + 4

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} color="#aaccff" />
      <pointLight ref={pointRef} color="#aaccff" intensity={0} distance={60} position={[0, topY, 0]} />
    </>
  )
}

// ─── World Component ─────────────────────────────────────────
export default function TowerWorld() {
  const sections = useMemo(() => buildSections(SEED), [])
  const topY = BASE_Y + SECTION_COUNT * SECTION_HEIGHT

  return (
    <>
      {/* Dramatic stormy sky */}
      <GradientSky top="#060410" bottom="#1a1040" radius={440} />

      {/* Dense ground fog */}
      <fog attach="fog" args={['#050315', 8, 80]} />

      {/* Lightning flash effect */}
      <LightningFlash />

      {/* Cloud band at mid-height */}
      <CloudBand />

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
