import { forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import type { Avatar, BodyShape } from '../lib/avatars'
import type { PlayerVisualHandle } from './PlayerCharacter'

// Переиспользуем единый интерфейс, чтобы Player мог переключаться между
// процедурным (этим) и GLTF (PlayerCharacter) визуалом.
export type AvatarModelHandle = PlayerVisualHandle
export type AnimState = Parameters<PlayerVisualHandle['update']>[0]

interface Props {
  avatar: Avatar
  /** если true — используем слегка спокойное idle-покачивание (для превью) */
  preview?: boolean
}

const BODY_SIZES: Record<BodyShape, [number, number, number]> = {
  standard: [0.95, 0.9, 0.7],
  chubby: [1.15, 1.0, 0.85],
  thin: [0.75, 1.0, 0.55],
}

// Процедурная voxel-моделька. Конечности и хвост — дочерние группы,
// которые анимирует useFrame в Player / preview.
const AvatarModel = forwardRef<AvatarModelHandle, Props>(function AvatarModel(
  { avatar, preview = false },
  ref
) {
  const rootRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const headGroupRef = useRef<THREE.Group>(null!)
  const legLRef = useRef<THREE.Mesh>(null!)
  const legRRef = useRef<THREE.Mesh>(null!)
  const armLRef = useRef<THREE.Group>(null!)
  const armRRef = useRef<THREE.Group>(null!)
  const tailRef = useRef<THREE.Group>(null!)

  const [bw, bh, bd] = BODY_SIZES[avatar.bodyShape]
  const headY = bh + 0.42
  const legY = -bh * 0.5 - 0.25
  const armY = bh * 0.25

  useImperativeHandle(
    ref,
    () => ({
      update(state: AnimState) {
        const { speed, phase, airborne, idlePhase } = state
        const moving = speed > 0.15
        const swing = moving ? Math.sin(phase) * 0.5 * Math.min(1, speed / 4) : 0

        // Ноги (противофаза)
        if (legLRef.current) legLRef.current.rotation.x = airborne ? -0.6 : swing
        if (legRRef.current) legRRef.current.rotation.x = airborne ? -0.3 : -swing
        // Руки (противофаза, меньше амплитуда)
        if (armLRef.current) armLRef.current.rotation.x = airborne ? -0.8 : -swing * 0.6
        if (armRRef.current) armRRef.current.rotation.x = airborne ? -0.8 : swing * 0.6
        // Хвост — лёгкое виляние и при движении сильнее
        if (tailRef.current) {
          tailRef.current.rotation.y = Math.sin(phase * 0.8 + 1) * (0.2 + (moving ? 0.35 : 0))
          tailRef.current.rotation.x = -0.2 + Math.sin(phase * 0.6) * 0.1
        }
        // Дыхание (idle): голова слегка поднимается/опускается
        if (headGroupRef.current) {
          const breatheY = Math.sin(idlePhase) * (moving ? 0 : 0.015)
          headGroupRef.current.position.y = headY + breatheY
        }
        // Лёгкий squash&stretch корпуса при беге
        if (bodyRef.current) {
          const sq = moving ? 1 + Math.abs(Math.sin(phase)) * 0.04 : 1
          bodyRef.current.scale.y = sq
          bodyRef.current.scale.x = 1 + (sq - 1) * -0.5
        }
      },
    }),
    [headY]
  )

  return (
    <group ref={rootRef} name="avatar-root">
      {/* Body */}
      <mesh ref={bodyRef} position={[0, bh * 0.5, 0]} castShadow>
        <boxGeometry args={[bw, bh, bd]} />
        <meshStandardMaterial color={avatar.bodyColor} />
      </mesh>

      {/* Head group */}
      <group ref={headGroupRef} position={[0, headY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[bw * 0.82, 0.7, bd * 1.1]} />
          <meshStandardMaterial color={avatar.headColor} />
        </mesh>
        {/* Eyes (white square + pupil) */}
        <mesh position={[-0.18, 0.05, bd * 0.55 + 0.001]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.18, 0.05, bd * 0.55 + 0.001]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.18, 0.05, bd * 0.55 + 0.002]}>
          <planeGeometry args={[0.09, 0.09]} />
          <meshStandardMaterial color="#2a1a1a" />
        </mesh>
        <mesh position={[0.18, 0.05, bd * 0.55 + 0.002]}>
          <planeGeometry args={[0.09, 0.09]} />
          <meshStandardMaterial color="#2a1a1a" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.15, bd * 0.55 + 0.001]}>
          <planeGeometry args={[0.18, 0.04]} />
          <meshStandardMaterial color="#2a1a1a" />
        </mesh>

        <Ears style={avatar.earStyle} color={avatar.accentColor} />
        <Hat style={avatar.hatStyle} color={avatar.accentColor} />
      </group>

      {/* Legs — роторный оффсет сверху каждой ноги */}
      <group position={[-bw * 0.25, legY + 0.25, 0]}>
        <mesh ref={legLRef} position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.5, 0.32]} />
          <meshStandardMaterial color={avatar.bodyColor} />
        </mesh>
      </group>
      <group position={[bw * 0.25, legY + 0.25, 0]}>
        <mesh ref={legRRef} position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.5, 0.32]} />
          <meshStandardMaterial color={avatar.bodyColor} />
        </mesh>
      </group>

      {/* Arms — роторные группы */}
      <group ref={armLRef} position={[-bw * 0.55, armY + 0.3, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.28, 0.55, 0.28]} />
          <meshStandardMaterial color={avatar.bodyColor} />
        </mesh>
      </group>
      <group ref={armRRef} position={[bw * 0.55, armY + 0.3, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.28, 0.55, 0.28]} />
          <meshStandardMaterial color={avatar.bodyColor} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, bh * 0.4, -bd * 0.55]}>
        <Tail style={avatar.tailStyle} color={avatar.accentColor} />
      </group>

      {preview && <gridHelper args={[4, 8, '#333', '#333']} position={[0, 0, 0]} />}
    </group>
  )
})

function Ears({ style, color }: { style: Avatar['earStyle']; color: string }) {
  if (style === 'none') return null
  if (style === 'cat') {
    return (
      <>
        <mesh position={[-0.25, 0.5, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[0.14, 0.32, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.25, 0.5, 0]} rotation={[0, 0, 0.2]} castShadow>
          <coneGeometry args={[0.14, 0.32, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </>
    )
  }
  if (style === 'bear') {
    return (
      <>
        <mesh position={[-0.3, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </>
    )
  }
  if (style === 'bunny') {
    return (
      <>
        <mesh position={[-0.18, 0.65, 0]} castShadow>
          <boxGeometry args={[0.12, 0.55, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.18, 0.65, 0]} castShadow>
          <boxGeometry args={[0.12, 0.55, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </>
    )
  }
  return null
}

function Hat({ style, color }: { style: Avatar['hatStyle']; color: string }) {
  if (style === 'none') return null
  if (style === 'cap') {
    return (
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.2, 0.7]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.06, 0.4]} castShadow>
          <boxGeometry args={[0.75, 0.08, 0.22]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    )
  }
  if (style === 'crown') {
    return (
      <group position={[0, 0.45, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.2, 8]} />
          <meshStandardMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.15} metalness={0.6} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 0.36,
              0.22,
              Math.sin((i / 4) * Math.PI * 2) * 0.36,
            ]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.2, 4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
    )
  }
  if (style === 'helmet') {
    return (
      <group position={[0, 0.25, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.1, 0.4]}>
          <boxGeometry args={[0.7, 0.28, 0.02]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      </group>
    )
  }
  if (style === 'wizard') {
    return (
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.42, 0.9, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 10]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    )
  }
  return null
}

function Tail({ style, color }: { style: Avatar['tailStyle']; color: string }) {
  if (style === 'none') return null
  if (style === 'cat') {
    return (
      <mesh position={[0, -0.1, -0.25]} rotation={[-Math.PI / 3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  if (style === 'fluffy') {
    return (
      <mesh position={[0, -0.1, -0.3]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    )
  }
  if (style === 'dragon') {
    return (
      <mesh position={[0, -0.15, -0.4]} rotation={[-Math.PI / 2.5, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.8, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  return null
}

export default AvatarModel
