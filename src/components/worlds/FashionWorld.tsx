import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import Coin from '../Coin'
import NPC from '../NPC'
import GoalTrigger from '../GoalTrigger'
import GltfMonster from '../GltfMonster'

/**
 * FashionWorld — educational remake of «Dress to Impress» (Roblox top-5, 2024).
 *
 * Curriculum: M6 L34 «Dress the Avatar» — функция принимает тему, возвращает
 * словарь ID одежды. Здесь ребёнок учит словари и return-values.
 *
 * Python hooks:
 *   pick_outfit(theme="y2k") → dict
 *   show_outfit(mannequin_id, outfit_dict)
 *
 * MVP: ковровая дорожка, 4 манекена по бокам в разных стилях, подиум-финиш
 * с тремя «судьями» (NPC) и 5 монетами-«звёздочками» для сбора вдоль дорожки.
 */

const STAGE_COLOR = '#c879ff'
const CARPET = '#ff5ab1'
const CARPET_EDGE = '#c03579'
const LIGHT_COLORS = ['#FFD43C', '#FFB4C8', '#9FE8C7', '#A9D8FF', '#FF9454']

function Stage() {
  return (
    <>
      {/* Пол — тёмная сцена */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -20]}>
        <mesh receiveShadow>
          <boxGeometry args={[30, 0.5, 60]} />
          <meshStandardMaterial color="#2a1f4c" roughness={0.85} />
        </mesh>
      </RigidBody>
      {/* Дорожка — розовый ковёр */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.05, -20]}>
        <mesh receiveShadow>
          <boxGeometry args={[6, 0.1, 50]} />
          <meshStandardMaterial color={CARPET} roughness={0.7} emissive={CARPET} emissiveIntensity={0.15} />
        </mesh>
        {/* Декоративные полосы по бокам */}
        <mesh position={[-3.15, 0.02, 0]}>
          <boxGeometry args={[0.3, 0.12, 50]} />
          <meshStandardMaterial color={CARPET_EDGE} />
        </mesh>
        <mesh position={[3.15, 0.02, 0]}>
          <boxGeometry args={[0.3, 0.12, 50]} />
          <meshStandardMaterial color={CARPET_EDGE} />
        </mesh>
      </RigidBody>
    </>
  )
}

function Mannequin({ pos, dressColor, accent }: { pos: [number, number, number]; dressColor: string; accent: string }) {
  const group = useRef<THREE.Group>(null!)
  useFrame(() => {
    if (group.current) group.current.rotation.y += 0.004
  })
  return (
    <group position={pos}>
      {/* Пьедестал */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1, 0.4, 16]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.3} metalness={0.1} />
        </mesh>
      </RigidBody>
      {/* Вращающийся манекен */}
      <group ref={group} position={[0, 0.2, 0]}>
        {/* Юбка-конус */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <coneGeometry args={[0.6, 1.2, 12]} />
          <meshStandardMaterial color={dressColor} roughness={0.6} />
        </mesh>
        {/* Торс */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.35]} />
          <meshStandardMaterial color={dressColor} roughness={0.6} />
        </mesh>
        {/* Голова */}
        <mesh position={[0, 2.05, 0]} castShadow>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#FFE0C2" roughness={0.5} />
        </mesh>
        {/* Акцент — пояс/пуговица */}
        <mesh position={[0, 1.2, 0.18]} castShadow>
          <torusGeometry args={[0.3, 0.06, 8, 24]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} metalness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Spotlight({ pos, color }: { pos: [number, number, number]; color: string }) {
  // Подвешенная лампа + цветной конус света
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.6, 10, 1, true]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={10} decay={2} />
    </group>
  )
}

function Backdrop() {
  // Задний фон сцены — градиентная стена с перекладинами
  return (
    <group position={[0, 5, -48]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[30, 10, 0.6]} />
        <meshStandardMaterial color={STAGE_COLOR} emissive={STAGE_COLOR} emissiveIntensity={0.2} />
      </mesh>
      {[-9, -3, 3, 9].map((x) => (
        <mesh key={x} position={[x, 0, 0.4]}>
          <boxGeometry args={[0.4, 10, 0.2]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export default function FashionWorld() {
  return (
    <>
      <Stage />
      <Backdrop />

      {/* 4 манекена по бокам подиума — каждый в своей теме */}
      <Mannequin pos={[-5, 0, -5]}  dressColor="#6B5CE7" accent="#FFD43C" />
      <Mannequin pos={[5, 0, -5]}   dressColor="#FFB4C8" accent="#6B5CE7" />
      <Mannequin pos={[-5, 0, -25]} dressColor="#9FE8C7" accent="#FF9454" />
      <Mannequin pos={[5, 0, -25]}  dressColor="#FFD43C" accent="#c879ff" />

      {/* Прожекторы сверху */}
      {LIGHT_COLORS.map((c, i) => (
        <Spotlight key={i} pos={[(i - 2) * 5, 9, -20]} color={c} />
      ))}

      {/* Звёздочки-монетки — «баллы за стиль» */}
      <Coin pos={[0, 1.5, -3]} value={3} />
      <Coin pos={[0, 1.5, -13]} value={3} />
      <Coin pos={[0, 1.5, -23]} value={3} />
      <Coin pos={[0, 1.5, -33]} value={3} />
      <Coin pos={[0, 1.5, -40]} value={5} />

      {/* 3 Судьи у дальнего края */}
      <NPC pos={[-4, 0, -44]} label="ДИВА"    bodyColor="#FFB4C8" />
      <NPC pos={[0, 0, -44]}  label="РЕДАКТОР" bodyColor="#6B5CE7" />
      <NPC pos={[4, 0, -44]}  label="СТИЛИСТ" bodyColor="#9FE8C7" />

      {/* Зрители-боты в фан-зоне */}
      <GltfMonster which="bunny"   pos={[-10, 0, -15]} scale={0.9} animation="Yes" />
      <GltfMonster which="cactoro" pos={[10, 0, -15]}  scale={0.9} animation="Wave" />
      <GltfMonster which="alien"   pos={[-10, 0, -30]} scale={0.9} animation="Wave" />
      <GltfMonster which="blueDemon" pos={[10, 0, -30]} scale={0.9} animation="Yes" />

      {/* Финиш — сцена-подиум под софитами */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.4, -43]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.3, 24]} />
          <meshStandardMaterial color="#FFD43C" emissive="#FFD43C" emissiveIntensity={0.4} />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2, -43]}
        size={[5, 4, 3]}
        result={{
          kind: 'win',
          label: '10 БАЛЛОВ!',
          subline: 'Судьи в восторге. Ты — икона стиля.',
        }}
      />
    </>
  )
}

export const FASHION_SPAWN: [number, number, number] = [0, 3, 3]
