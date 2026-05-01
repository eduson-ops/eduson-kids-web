import { forwardRef, useImperativeHandle, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { Avatar, BodyShape } from '../lib/avatars'
import type { PlayerVisualHandle } from './PlayerCharacter'
import { getToonGradientMap } from '../lib/toonGradient'

function OutlineRounded({
  args,
  radius = 0.07,
  position,
  rotation,
}: {
  args: [number, number, number]
  radius?: number
  position?: [number, number, number] | THREE.Vector3
  rotation?: [number, number, number] | THREE.Euler
}) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} position={position as any} rotation={rotation as any} scale={1.07}>
      <meshBasicMaterial color="#0d0d0d" side={THREE.BackSide} />
    </RoundedBox>
  )
}

// Переиспользуем единый интерфейс, чтобы Player мог переключаться между
// процедурным (этим) и GLTF (PlayerCharacter) визуалом.
type AvatarModelHandle = PlayerVisualHandle
type AnimState = Parameters<PlayerVisualHandle['update']>[0]

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
  const gradientMap = getToonGradientMap()
  const rootRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const headGroupRef = useRef<THREE.Group>(null!)
  const legLRef = useRef<THREE.Group>(null!)
  const legRRef = useRef<THREE.Group>(null!)
  const armLRef = useRef<THREE.Group>(null!)
  const armRRef = useRef<THREE.Group>(null!)
  const tailRef = useRef<THREE.Group>(null!)

  const [bw, bh, bd] = BODY_SIZES[avatar.bodyShape]
  const headY = bh + 0.42
  const legY = -bh * 0.5 - 0.25
  const armY = bh * 0.25

  const faceTexture = useMemo(() => {
    const S = 128
    const canvas = document.createElement('canvas')
    canvas.width = S; canvas.height = S
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = avatar.headColor
    ctx.fillRect(0, 0, S, S)
    for (const [ex] of [[36], [92]] as [number][]) {
      const ey = 52
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(ex, ey, 17, 17, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#3a6ab0'
      ctx.beginPath(); ctx.ellipse(ex, ey + 2, 11, 12, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#111111'
      ctx.beginPath(); ctx.ellipse(ex + 1, ey + 2, 6, 7, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(ex + 4, ey - 2, 3, 3, 0, 0, Math.PI * 2); ctx.fill()
    }
    // Eyebrows (inner ends slightly raised = friendly expression)
    const browColor = new THREE.Color(avatar.headColor).getHSL({ h: 0, s: 0, l: 0 } as any)
    ctx.strokeStyle = `hsl(${browColor.h * 360 | 0},${(browColor.s * 60) | 0}%,${Math.max((browColor.l * 100 - 30) | 0, 12)}%)`
    ctx.lineWidth = 7; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(18, 30); ctx.lineTo(50, 36); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(78, 36); ctx.lineTo(110, 30); ctx.stroke()
    ctx.strokeStyle = '#cc3333'; ctx.lineWidth = 7; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(64, 88, 28, Math.PI + 0.25, Math.PI * 2 - 0.25); ctx.stroke()
    ctx.fillStyle = 'rgba(255,110,110,0.35)'
    ctx.beginPath(); ctx.ellipse(18, 82, 14, 10, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(110, 82, 14, 10, 0, 0, Math.PI * 2); ctx.fill()
    const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true
    return tex
  }, [avatar.headColor])

  useImperativeHandle(
    ref,
    () => ({
      update(state: AnimState) {
        const { speed, phase, airborne, idlePhase } = state
        const moving = speed > 0.15
        const swing = moving ? Math.sin(phase) * 0.5 * Math.min(1, speed / 4) : 0

        // Ноги (противофаза) — pivot from hip group
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
      <RoundedBox ref={bodyRef} args={[bw, bh, bd]} radius={0.07} smoothness={3} position={[0, bh * 0.5, 0]} castShadow>
        <meshToonMaterial color={avatar.bodyColor} gradientMap={gradientMap} />
      </RoundedBox>
      <OutlineRounded args={[bw, bh, bd]} position={[0, bh * 0.5, 0]} />

      {/* Head group */}
      <group ref={headGroupRef} position={[0, headY, 0]}>
        <RoundedBox args={[bw * 0.82, 0.7, bd * 1.1]} radius={0.08} smoothness={3} castShadow>
          <meshToonMaterial color={avatar.headColor} gradientMap={gradientMap} />
        </RoundedBox>
        <OutlineRounded args={[bw * 0.82, 0.7, bd * 1.1]} radius={0.08} />

        {/* Face texture — eyes + mouth + blush in one canvas plane */}
        <mesh position={[0, 0.05, bd * 1.1 * 0.5 + 0.002]}>
          <planeGeometry args={[bw * 0.75, 0.58]} />
          <meshToonMaterial map={faceTexture} gradientMap={gradientMap} />
        </mesh>

        <Ears style={avatar.earStyle} color={avatar.accentColor} gradientMap={gradientMap} />
        <Hat style={avatar.hatStyle} color={avatar.accentColor} gradientMap={gradientMap} />
      </group>

      {/* Legs — pivot group at hip, ref on group for correct rotation origin */}
      <group ref={legLRef} position={[-bw * 0.25, legY + 0.25, 0]}>
        <RoundedBox args={[0.32, 0.5, 0.32]} radius={0.06} smoothness={2} position={[0, -0.25, 0]} castShadow>
          <meshToonMaterial color={avatar.bodyColor} gradientMap={gradientMap} />
        </RoundedBox>
        <OutlineRounded args={[0.32, 0.5, 0.32]} radius={0.06} position={[0, -0.25, 0]} />
        {/* Shoe */}
        <RoundedBox args={[0.36, 0.18, 0.44]} radius={0.05} smoothness={2} position={[0, -0.54, 0.07]} castShadow>
          <meshToonMaterial color={avatar.accentColor} gradientMap={gradientMap} />
        </RoundedBox>
      </group>
      <group ref={legRRef} position={[bw * 0.25, legY + 0.25, 0]}>
        <RoundedBox args={[0.32, 0.5, 0.32]} radius={0.06} smoothness={2} position={[0, -0.25, 0]} castShadow>
          <meshToonMaterial color={avatar.bodyColor} gradientMap={gradientMap} />
        </RoundedBox>
        <OutlineRounded args={[0.32, 0.5, 0.32]} radius={0.06} position={[0, -0.25, 0]} />
        {/* Shoe */}
        <RoundedBox args={[0.36, 0.18, 0.44]} radius={0.05} smoothness={2} position={[0, -0.54, 0.07]} castShadow>
          <meshToonMaterial color={avatar.accentColor} gradientMap={gradientMap} />
        </RoundedBox>
      </group>

      {/* Arms — роторные группы */}
      <group ref={armLRef} position={[-bw * 0.55, armY + 0.3, 0]}>
        <RoundedBox args={[0.28, 0.55, 0.28]} radius={0.06} smoothness={2} position={[0, -0.28, 0]} castShadow>
          <meshToonMaterial color={avatar.bodyColor} gradientMap={gradientMap} />
        </RoundedBox>
        <OutlineRounded args={[0.28, 0.55, 0.28]} radius={0.06} position={[0, -0.28, 0]} />
        {/* Hand paw */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color={avatar.accentColor} gradientMap={gradientMap} />
        </mesh>
      </group>
      <group ref={armRRef} position={[bw * 0.55, armY + 0.3, 0]}>
        <RoundedBox args={[0.28, 0.55, 0.28]} radius={0.06} smoothness={2} position={[0, -0.28, 0]} castShadow>
          <meshToonMaterial color={avatar.bodyColor} gradientMap={gradientMap} />
        </RoundedBox>
        <OutlineRounded args={[0.28, 0.55, 0.28]} radius={0.06} position={[0, -0.28, 0]} />
        {/* Hand paw */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshToonMaterial color={avatar.accentColor} gradientMap={gradientMap} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, bh * 0.4, -bd * 0.55]}>
        <Tail style={avatar.tailStyle} color={avatar.accentColor} gradientMap={gradientMap} />
      </group>

      {preview && <gridHelper args={[4, 8, '#333', '#333']} position={[0, 0, 0]} />}
    </group>
  )
})

function Ears({
  style,
  color,
  gradientMap,
}: {
  style: Avatar['earStyle']
  color: string
  gradientMap: THREE.DataTexture
}) {
  if (style === 'none') return null
  if (style === 'cat') {
    return (
      <>
        <mesh position={[-0.25, 0.5, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[0.14, 0.32, 4]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.25, 0.5, 0]} rotation={[0, 0, 0.2]} castShadow>
          <coneGeometry args={[0.14, 0.32, 4]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </>
    )
  }
  if (style === 'bear') {
    return (
      <>
        <mesh position={[-0.3, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0.3, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </>
    )
  }
  if (style === 'bunny') {
    return (
      <>
        <RoundedBox args={[0.12, 0.55, 0.1]} radius={0.04} smoothness={2} position={[-0.18, 0.65, 0]} castShadow>
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </RoundedBox>
        <RoundedBox args={[0.12, 0.55, 0.1]} radius={0.04} smoothness={2} position={[0.18, 0.65, 0]} castShadow>
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </RoundedBox>
      </>
    )
  }
  return null
}

function Hat({
  style,
  color,
  gradientMap,
}: {
  style: Avatar['hatStyle']
  color: string
  gradientMap: THREE.DataTexture
}) {
  if (style === 'none') return null
  if (style === 'cap') {
    return (
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.75, 0.2, 0.7]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.06, 0.4]} castShadow>
          <boxGeometry args={[0.75, 0.08, 0.22]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </group>
    )
  }
  if (style === 'crown') {
    return (
      <group position={[0, 0.45, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.2, 8]} />
          <meshToonMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.15} gradientMap={gradientMap} />
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
            <meshToonMaterial color={color} gradientMap={gradientMap} />
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
          <meshToonMaterial color="#ffffff" gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.1, 0.4]}>
          <boxGeometry args={[0.7, 0.28, 0.02]} />
          <meshToonMaterial color={color} transparent opacity={0.6} gradientMap={gradientMap} />
        </mesh>
      </group>
    )
  }
  if (style === 'wizard') {
    return (
      <group position={[0, 0.5, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.42, 0.9, 8]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.08, 10]} />
          <meshToonMaterial color={color} gradientMap={gradientMap} />
        </mesh>
      </group>
    )
  }
  return null
}

function Tail({
  style,
  color,
  gradientMap,
}: {
  style: Avatar['tailStyle']
  color: string
  gradientMap: THREE.DataTexture
}) {
  if (style === 'none') return null
  if (style === 'cat') {
    return (
      <mesh position={[0, -0.1, -0.25]} rotation={[-Math.PI / 3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 6]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    )
  }
  if (style === 'fluffy') {
    return (
      <mesh position={[0, -0.1, -0.3]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshToonMaterial color="#ffffff" gradientMap={gradientMap} />
      </mesh>
    )
  }
  if (style === 'dragon') {
    return (
      <mesh position={[0, -0.15, -0.4]} rotation={[-Math.PI / 2.5, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.8, 5]} />
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    )
  }
  return null
}

export default AvatarModel
