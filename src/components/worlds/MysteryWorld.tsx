import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'
import { Tree, Bush, Mushroom } from '../Scenery'

// Kenney Graveyard Kit — CC0 GLB модели
function GraveyardProp({
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
  const gltf = useGLTF(`/models/kenney-graveyard/${file}`)
  const scene = useMemo(() => gltf.scene.clone(), [gltf])
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/kenney-graveyard/crypt.glb')
useGLTF.preload('/models/kenney-graveyard/coffin.glb')
useGLTF.preload('/models/kenney-graveyard/cross.glb')
useGLTF.preload('/models/kenney-graveyard/candle.glb')
useGLTF.preload('/models/kenney-graveyard/pumpkin-carved.glb')
useGLTF.preload('/models/kenney-graveyard/lantern-glass.glb')
useGLTF.preload('/models/kenney-graveyard/fence.glb')

/**
 * MysteryWorld — kid-safe remake of «Murder Mystery 2».
 * Тема насилия убрана — это «Детектив в Особняке»: собираешь улики,
 * узнаёшь кто что делал. Подходит для возраста 9-15.
 *
 * Curriculum: M5 L30 «Murder Mystery Logic» — shuffle list + indexing + enums.
 * Python hooks:
 *   assign_roles(players) → dict     # роль каждого
 *   check_clue(name) → bool
 *
 * MVP: 4 тематические комнаты под одной крышей, между ними проходы.
 * 5 светящихся «улик» (монеток), 3 подозреваемых NPC, финиш — детектив-стол.
 */

const WALL = '#3d3148'
const WALL_TOP = '#504264'
const FLOOR_WOOD = '#6b4f2a'
const FLOOR_DARK = '#4a3619'

function Floor() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[40, 0.5, 40]} />
        <meshStandardMaterial color={FLOOR_WOOD} roughness={0.85} />
      </mesh>
      {/* Шахматный паттерн через второй слой точечных плиток */}
    </RigidBody>
  )
}

interface RoomDef {
  cx: number
  cz: number
  w: number
  d: number
  accent: string
  name: string
}

const ROOMS: RoomDef[] = [
  { cx: -8,  cz: -8,  w: 10, d: 10, accent: '#c03535', name: 'Столовая' },
  { cx:  8,  cz: -8,  w: 10, d: 10, accent: '#2e5f8a', name: 'Библиотека' },
  { cx: -8,  cz:  8,  w: 10, d: 10, accent: '#3fb74d', name: 'Оранжерея' },
  { cx:  8,  cz:  8,  w: 10, d: 10, accent: '#c879ff', name: 'Кабинет' },
]

function Walls() {
  // Внешние стены особняка (прямоугольник 40×40 с проёмами для атмосферы)
  const W = 22
  const H = 4
  const T = 0.6
  const items: Array<{ pos: [number, number, number]; size: [number, number, number]; cap?: boolean }> = [
    { pos: [0, H / 2, -W - T / 2], size: [W * 2, H, T], cap: true },
    { pos: [0, H / 2, W + T / 2],  size: [W * 2, H, T], cap: true },
    { pos: [-W - T / 2, H / 2, 0], size: [T, H, W * 2], cap: true },
    { pos: [W + T / 2, H / 2, 0],  size: [T, H, W * 2], cap: true },
    // Внутренние перегородки — делят дом на 4 квадрата
    { pos: [0, H / 2, 0], size: [22, H, 0.25] },
    { pos: [0, H / 2, 0], size: [0.25, H, 22] },
  ]
  return (
    <>
      {items.map((it, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={it.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={it.size} />
            <meshStandardMaterial color={WALL} roughness={0.9} />
          </mesh>
          {it.cap && (
            <mesh position={[0, it.size[1] / 2 + 0.15, 0]}>
              <boxGeometry args={[it.size[0], 0.3, it.size[2] + 0.1]} />
              <meshStandardMaterial color={WALL_TOP} roughness={0.9} />
            </mesh>
          )}
        </RigidBody>
      ))}
    </>
  )
}

function RoomAccent({ room }: { room: RoomDef }) {
  // Светящийся ковёр + подвешенная вывеска-свет по центру комнаты
  return (
    <group position={[room.cx, 0, room.cz]}>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[room.w - 1.5, 0.02, room.d - 1.5]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.2} roughness={0.7} />
      </mesh>
      {/* Хрустальная лампа-светильник */}
      <mesh position={[0, 3.6, 0]}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={room.accent} emissive={room.accent} emissiveIntensity={0.9} />
      </mesh>
      <pointLight color={room.accent} position={[0, 3.5, 0]} intensity={0.4} distance={9} decay={2} />
    </group>
  )
}

function ClueOrb({ pos }: { pos: [number, number, number] }) {
  // Декоративная сфера с парящим «облачком» вокруг — визуальный маркер улики
  const orb = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (orb.current) {
      orb.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 1.8) * 0.12
    }
  })
  return (
    <mesh ref={orb} position={pos}>
      <sphereGeometry args={[0.22, 14, 14]} />
      <meshStandardMaterial
        color="#A9D8FF"
        emissive="#A9D8FF"
        emissiveIntensity={1.2}
        roughness={0.2}
        metalness={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function Table({ pos, color = '#6b4f2a' }: { pos: [number, number, number]; color?: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* «Плоскостной» топ — светлее */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.05, 0.08, 1.25]} />
        <meshStandardMaterial color={FLOOR_DARK} roughness={0.6} />
      </mesh>
    </RigidBody>
  )
}

export default function MysteryWorld() {
  const vignetteColor = useMemo(() => new THREE.Color('#1a0e2e'), [])

  return (
    <>
      <color attach="background" args={[vignetteColor]} />
      <Floor />
      <Walls />

      {ROOMS.map((r, i) => (
        <RoomAccent key={i} room={r} />
      ))}

      {/* Столы по центру каждой комнаты */}
      {ROOMS.map((r, i) => (
        <Table key={`t${i}`} pos={[r.cx, 0.5, r.cz]} />
      ))}

      {/* ─── Kenney Graveyard props ─── */}
      {/* Гроб в «Столовой» — атмосфера */}
      <GraveyardProp file="coffin.glb" pos={[-8, 0.1, -12]} scale={2} rotY={Math.PI / 4} />
      {/* Свечи на всех четырёх столах */}
      {ROOMS.map((r, i) => (
        <GraveyardProp key={`cd${i}`} file="candle.glb" pos={[r.cx - 0.6, 1.1, r.cz]} scale={1.5} />
      ))}
      {/* Тыквы-фонари по углам каждой комнаты */}
      {ROOMS.map((r, i) => (
        <GraveyardProp
          key={`pk${i}`}
          file="pumpkin-carved.glb"
          pos={[r.cx + (r.cx > 0 ? 3 : -3), 0.1, r.cz + (r.cz > 0 ? 3 : -3)]}
          scale={1.6}
        />
      ))}
      {/* Фонари на стенах */}
      <GraveyardProp file="lantern-glass.glb" pos={[0, 0, -14]} scale={1.8} />
      <GraveyardProp file="lantern-glass.glb" pos={[0, 0, 14]} scale={1.8} rotY={Math.PI} />
      {/* Кресты снаружи (сквозь окна) */}
      <GraveyardProp file="cross.glb" pos={[-24, 0, 4]} scale={2} />
      <GraveyardProp file="cross.glb" pos={[24, 0, -4]} scale={2} />
      {/* Маленький склеп рядом с особняком */}
      <GraveyardProp file="crypt.glb" pos={[-24, 0, -20]} scale={2} rotY={Math.PI / 3} />
      <GraveyardProp file="crypt.glb" pos={[24, 0, 20]} scale={2} rotY={-Math.PI / 3} />
      {/* Забор по периметру (сегментами) */}
      {[-18, -10, 10, 18].map((x) => (
        <GraveyardProp key={`f-n${x}`} file="fence.glb" pos={[x, 0, -23]} scale={1.8} />
      ))}
      {[-18, -10, 10, 18].map((x) => (
        <GraveyardProp key={`f-s${x}`} file="fence.glb" pos={[x, 0, 23]} scale={1.8} rotY={Math.PI} />
      ))}

      {/* 5 улик — 4 в комнатах + 1 на центральном столе */}
      {ROOMS.map((r, i) => (
        <group key={`clue${i}`}>
          <ClueOrb pos={[r.cx + 0.8, 1.2, r.cz]} />
          <Coin pos={[r.cx + 0.8, 1.2, r.cz]} value={2} />
        </group>
      ))}
      <Coin pos={[0, 1.2, 0]} value={5} />

      {/* 3 подозреваемых NPC */}
      <NPC pos={[-8, 0, -14]} label="ГОСТЬ"   bodyColor="#ffb4b4" />
      <NPC pos={[8, 0, -14]}  label="ПОВАР"   bodyColor="#a9d8ff" />
      <NPC pos={[-8, 0, 14]}  label="САДОВНИК" bodyColor="#c6f0c0" />

      {/* Патрулирующий «призрак» */}
      <GltfMonster which="alien" pos={[0, 2, 0]} patrolX={4} scale={0.9} sensor animation="Wave" />

      {/* Декор снаружи (через проёмы видно) */}
      <Tree pos={[-20, 0, -20]} variant={2} />
      <Tree pos={[20, 0, -20]}  variant={3} />
      <Tree pos={[-20, 0, 20]}  variant={0} />
      <Tree pos={[20, 0, 20]}   variant={1} />
      <Bush pos={[-16, 0, -4]}  variant={0} scale={1.0} />
      <Bush pos={[16, 0, 4]}    variant={1} scale={1.0} />
      <Mushroom pos={[-18, 0, 10]} red scale={1.4} />
      <Mushroom pos={[18, 0, -10]} red={false} scale={1.3} />

      {/* Финиш — «детективный стол» в центре с лупой */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.3, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 1.8, 0.6, 20]} />
          <meshStandardMaterial color="#6B5CE7" emissive="#6B5CE7" emissiveIntensity={0.35} roughness={0.4} metalness={0.4} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 1.5, 0]}
        size={[4, 3, 4]}
        result={{
          kind: 'win',
          label: 'ДЕЛО РАСКРЫТО!',
          subline: 'Ты собрал все улики и вычислил виновного.',
        }}
      />
    </>
  )
}

export const MYSTERY_SPAWN: [number, number, number] = [0, 3, -18]
