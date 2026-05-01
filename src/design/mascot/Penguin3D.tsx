import { forwardRef, memo, useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder, Cone } from '@react-three/drei'
import * as THREE from 'three'
import type { PlayerVisualHandle } from '../../components/PlayerCharacter'
import { getToonGradientMap } from '../../lib/toonGradient'

// Материалы переиспользуемые (MeshToonMaterial с общим gradientMap)
const _gm = () => getToonGradientMap()
const MAT_BLACK  = new THREE.MeshToonMaterial({ color: '#1a1a2e', gradientMap: _gm() })
const MAT_WHITE  = new THREE.MeshToonMaterial({ color: '#fffbf3', gradientMap: _gm() })
const MAT_ORANGE = new THREE.MeshToonMaterial({ color: '#FF9454', gradientMap: _gm() })
const MAT_EYE   = new THREE.MeshToonMaterial({ color: '#000000', gradientMap: _gm() })
const MAT_SHINE = new THREE.MeshToonMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, gradientMap: _gm() })

type PenguinAnimation = 'idle' | 'walk' | 'jump' | 'cheer'

interface Props {
  animation?: PenguinAnimation
}

/**
 * Процедурный пингвин из Three.js-примитивов.
 * Реализует PlayerVisualHandle — совместим с Player.tsx.
 *
 * Анимации через useFrame:
 *   idle  — покачивание по оси Y
 *   walk  — переставление ног + наклон тела
 *   jump  — тело запрокинуто назад, ноги вытянуты
 *   cheer — взмах крыльями + наклон головы
 */
const Penguin3DInner = forwardRef<PlayerVisualHandle, Props>(function Penguin3D(
  { animation: animProp },
  ref
) {
  const rootRef    = useRef<THREE.Group>(null!)
  const bodyRef    = useRef<THREE.Group>(null!)
  const headRef    = useRef<THREE.Group>(null!)
  const wingLRef   = useRef<THREE.Group>(null!)
  const wingRRef   = useRef<THREE.Group>(null!)
  const legLRef    = useRef<THREE.Group>(null!)
  const legRRef    = useRef<THREE.Group>(null!)

  // Внутреннее состояние анимации
  const stateRef = useRef<{ speed: number; airborne: boolean; phase: number; idlePhase: number }>({
    speed: 0, airborne: false, phase: 0, idlePhase: 0,
  })

  useImperativeHandle(ref, () => ({
    update(s) { Object.assign(stateRef.current, s) },
  }))

  useFrame((_, dt) => {
    const { speed, airborne, phase, idlePhase } = stateRef.current
    const anim: PenguinAnimation = animProp
      ?? (airborne ? 'jump' : speed > 0.5 ? 'walk' : 'idle')

    const t = performance.now() * 0.001

    // M-03: reset rotations to defaults at frame start so pose transitions
    // (walk→jump→cheer) don't leave residual rotation.x / rotation.z deltas.
    if (rootRef.current)  rootRef.current.position.set(0, 0, 0)
    if (bodyRef.current)  bodyRef.current.rotation.set(0, 0, 0)
    if (headRef.current)  headRef.current.rotation.set(0, 0, 0)
    if (wingLRef.current) wingLRef.current.rotation.set(0, 0, -0.15)
    if (wingRRef.current) wingRRef.current.rotation.set(0, 0,  0.15)
    if (legLRef.current)  legLRef.current.rotation.set(0, 0, 0)
    if (legRRef.current)  legRRef.current.rotation.set(0, 0, 0)

    if (anim === 'idle') {
      // Лёгкое покачивание тела
      if (rootRef.current)  rootRef.current.position.y = Math.sin(t * 1.2) * 0.04
      if (bodyRef.current)  bodyRef.current.rotation.z = Math.sin(t * 1.0) * 0.04
      if (headRef.current)  headRef.current.rotation.y = Math.sin(t * 0.7) * 0.12
      if (wingLRef.current) wingLRef.current.rotation.z = -0.15 + Math.sin(t * 0.9) * 0.05
      if (wingRRef.current) wingRRef.current.rotation.z =  0.15 - Math.sin(t * 0.9) * 0.05
      if (legLRef.current)  legLRef.current.rotation.x = 0
      if (legRRef.current)  legRRef.current.rotation.x = 0

    } else if (anim === 'walk') {
      // Переставление ног + раскачка тела
      const walkT = phase !== 0 ? phase : t
      if (rootRef.current)  rootRef.current.position.y = Math.abs(Math.sin(walkT * 4)) * 0.03
      if (bodyRef.current)  bodyRef.current.rotation.z = Math.sin(walkT * 4) * 0.06
      if (headRef.current)  headRef.current.rotation.y = 0
      if (wingLRef.current) wingLRef.current.rotation.z = -0.2 + Math.sin(walkT * 4) * 0.15
      if (wingRRef.current) wingRRef.current.rotation.z =  0.2 - Math.sin(walkT * 4) * 0.15
      if (legLRef.current)  legLRef.current.rotation.x = Math.sin(walkT * 4) * 0.35
      if (legRRef.current)  legRRef.current.rotation.x = -Math.sin(walkT * 4) * 0.35

    } else if (anim === 'jump') {
      // Тело назад, ноги вытянуты вниз
      const jt = idlePhase !== 0 ? idlePhase : t
      if (rootRef.current)  rootRef.current.position.y = 0
      if (bodyRef.current)  bodyRef.current.rotation.x = -0.3
      if (headRef.current)  headRef.current.rotation.x = 0.15
      if (wingLRef.current) wingLRef.current.rotation.z = -0.6 + Math.sin(jt * 8) * 0.1
      if (wingRRef.current) wingRRef.current.rotation.z =  0.6 - Math.sin(jt * 8) * 0.1
      if (legLRef.current)  legLRef.current.rotation.x = -0.25
      if (legRRef.current)  legRRef.current.rotation.x = -0.25

    } else if (anim === 'cheer') {
      // Крылья вверх + покачивание головы
      if (rootRef.current)  rootRef.current.position.y = Math.sin(t * 6) * 0.06
      if (bodyRef.current)  bodyRef.current.rotation.z = Math.sin(t * 6) * 0.08
      if (headRef.current)  headRef.current.rotation.z = Math.sin(t * 6) * 0.18
      if (wingLRef.current) wingLRef.current.rotation.z = -0.9 + Math.sin(t * 6) * 0.25
      if (wingRRef.current) wingRRef.current.rotation.z =  0.9 - Math.sin(t * 6) * 0.25
      if (legLRef.current)  legLRef.current.rotation.x = 0
      if (legRRef.current)  legRRef.current.rotation.x = 0
    }

    void dt  // suppress unused
  })

  return (
    <group ref={rootRef} castShadow>
      <group ref={bodyRef}>
        {/* Тело — чёрный эллипсоид */}
        <Sphere args={[0.55, 16, 12]} scale={[1, 1.25, 0.9]} material={MAT_BLACK} castShadow />
        {/* Живот — белый, спереди */}
        <Sphere args={[0.42, 14, 10]} position={[0, -0.05, 0.22]} scale={[1, 1.1, 0.6]} material={MAT_WHITE} castShadow />

        {/* Голова */}
        <group ref={headRef} position={[0, 0.72, 0]}>
          <Sphere args={[0.38, 14, 10]} material={MAT_BLACK} castShadow />
          {/* Белое пятно на лице */}
          <Sphere args={[0.28, 12, 8]} position={[0, -0.04, 0.22]} scale={[1, 0.9, 0.5]} material={MAT_WHITE} />
          {/* Клюв */}
          <Cone args={[0.09, 0.2, 8]} position={[0, -0.06, 0.44]} rotation={[Math.PI / 2, 0, 0]} material={MAT_ORANGE} />
          {/* Глаза */}
          <Sphere args={[0.07, 8, 6]} position={[-0.16, 0.06, 0.3]} material={MAT_EYE} />
          <Sphere args={[0.07, 8, 6]} position={[ 0.16, 0.06, 0.3]} material={MAT_EYE} />
          {/* Блики в глазах */}
          <Sphere args={[0.025, 6, 4]} position={[-0.13, 0.09, 0.36]} material={MAT_SHINE} />
          <Sphere args={[0.025, 6, 4]} position={[ 0.19, 0.09, 0.36]} material={MAT_SHINE} />
        </group>

        {/* Крыло левое */}
        <group ref={wingLRef} position={[-0.54, 0.1, 0]} rotation={[0, 0, -0.15]}>
          <Sphere args={[0.18, 10, 6]} scale={[1, 2.8, 0.4]} position={[0, -0.22, 0]} material={MAT_BLACK} castShadow />
        </group>
        {/* Крыло правое */}
        <group ref={wingRRef} position={[0.54, 0.1, 0]} rotation={[0, 0, 0.15]}>
          <Sphere args={[0.18, 10, 6]} scale={[1, 2.8, 0.4]} position={[0, -0.22, 0]} material={MAT_BLACK} castShadow />
        </group>

        {/* Нога левая */}
        <group ref={legLRef} position={[-0.2, -0.7, 0]}>
          <Cylinder args={[0.09, 0.11, 0.32, 8]} material={MAT_ORANGE} castShadow />
          {/* Лапа */}
          <Sphere args={[0.12, 8, 6]} position={[0, -0.2, 0.06]} scale={[1.4, 0.6, 1.2]} material={MAT_ORANGE} />
        </group>
        {/* Нога правая */}
        <group ref={legRRef} position={[0.2, -0.7, 0]}>
          <Cylinder args={[0.09, 0.11, 0.32, 8]} material={MAT_ORANGE} castShadow />
          <Sphere args={[0.12, 8, 6]} position={[0, -0.2, 0.06]} scale={[1.4, 0.6, 1.2]} material={MAT_ORANGE} />
        </group>
      </group>
    </group>
  )
})

const Penguin3D = memo(Penguin3DInner)
Penguin3D.displayName = 'Penguin3D'
export default Penguin3D
