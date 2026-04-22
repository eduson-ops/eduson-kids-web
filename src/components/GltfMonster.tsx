import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Box3, Group, Mesh, Vector3 } from 'three'

// Quaternius Ultimate Monsters (CC0). Все модели содержат одинаковый
// набор анимаций: Idle, Walk, Run, Jump, Wave, Punch, Death, HitReact,
// Duck, Jump_Idle, Jump_Land, No, Weapon, Yes.
export const MONSTER_URLS = {
  alien: '/models/ultimate-monsters/Big/glTF/Alien.gltf',
  birb: '/models/ultimate-monsters/Big/glTF/Birb.gltf',
  blueDemon: '/models/ultimate-monsters/Big/glTF/BlueDemon.gltf',
  bunny: '/models/ultimate-monsters/Big/glTF/Bunny.gltf',
  cactoro: '/models/ultimate-monsters/Big/glTF/Cactoro.gltf',
} as const

export type MonsterId = keyof typeof MONSTER_URLS

export type MonsterAnim =
  | 'Idle'
  | 'Walk'
  | 'Run'
  | 'Jump'
  | 'Jump_Idle'
  | 'Jump_Land'
  | 'Wave'
  | 'Punch'
  | 'HitReact'
  | 'Duck'
  | 'Death'
  | 'No'
  | 'Yes'
  | 'Weapon'

interface Props {
  which: MonsterId
  pos: [number, number, number]
  scale?: number
  /** если > 0 — монстр патрулирует по X, проигрывает Walk. Иначе — Idle. */
  patrolX?: number
  /** явное имя анимации — override над auto-логикой */
  animation?: MonsterAnim
  /** sensor (не блокирует движение) или физический блок */
  sensor?: boolean
  rotY?: number
}

export default function GltfMonster({
  which,
  pos,
  scale = 1,
  patrolX = 0,
  animation,
  sensor = false,
  rotY = 0,
}: Props) {
  const gltf = useGLTF(MONSTER_URLS[which])
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene)
    c.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return c
  }, [gltf.scene])

  const rb = useRef<RapierRigidBody>(null!)
  const groupRef = useRef<Group>(null!)
  const t0 = useRef(Math.random() * 10)

  // Нормализуем рост модели под ~1.6 units (у пака высоты разные)
  const autoScale = useMemo(() => {
    const box = new Box3().setFromObject(cloned)
    const size = new Vector3()
    box.getSize(size)
    const h = Math.max(size.y, 0.01)
    return (1.6 / h) * scale
  }, [cloned, scale])

  // Анимации: прицепляем mixer к groupRef. animations берём из оригинального gltf.
  const { actions, names } = useAnimations(gltf.animations, groupRef)

  useEffect(() => {
    if (!actions || names.length === 0) return
    // Решаем какую гонять
    const preferred: MonsterAnim = animation ?? (patrolX > 0 ? 'Walk' : 'Idle')
    const available = names as MonsterAnim[]
    const pick =
      available.find((n) => n === preferred) ??
      available.find((n) => n === 'Idle') ??
      available[0]
    const action = pick ? actions[pick] : null
    if (!action) return

    action.reset().fadeIn(0.25).play()
    return () => {
      action.fadeOut(0.25)
    }
  }, [actions, names, patrolX, animation])

  useFrame((_, dt) => {
    if (!rb.current) return
    t0.current += dt
    if (patrolX > 0) {
      const x = pos[0] + Math.sin(t0.current * 1.0) * patrolX
      const y = pos[1] + Math.abs(Math.sin(t0.current * 3)) * 0.12
      rb.current.setNextKinematicTranslation({ x, y, z: pos[2] })
      if (groupRef.current) {
        // Персонаж смотрит туда, куда двигается
        const dx = Math.cos(t0.current * 1.0) * patrolX
        groupRef.current.rotation.y = rotY + Math.atan2(dx, 0)
      }
    } else {
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t0.current * 2) * 0.04
        groupRef.current.rotation.y = rotY
      }
    }
  })

  return (
    <RigidBody
      ref={rb}
      type={patrolX > 0 ? 'kinematicPosition' : 'fixed'}
      colliders="cuboid"
      position={pos}
      sensor={sensor}
    >
      <group ref={groupRef} scale={[autoScale, autoScale, autoScale]} rotation={[0, rotY, 0]}>
        <primitive object={cloned} />
      </group>
    </RigidBody>
  )
}

// Прелоад всех моделей на старте приложения
Object.values(MONSTER_URLS).forEach((u) => useGLTF.preload(u))
