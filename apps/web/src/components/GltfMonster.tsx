import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Box3, Group, Vector3 } from 'three'

// URL пресеты — Quaternius Ultimate Monsters (CC0), уже лежат в public/models.
export const MONSTER_URLS = {
  alien: '/models/ultimate-monsters/Big/glTF/Alien.gltf',
  birb: '/models/ultimate-monsters/Big/glTF/Birb.gltf',
  blueDemon: '/models/ultimate-monsters/Big/glTF/BlueDemon.gltf',
  bunny: '/models/ultimate-monsters/Big/glTF/Bunny.gltf',
  cactoro: '/models/ultimate-monsters/Big/glTF/Cactoro.gltf',
} as const

export type MonsterId = keyof typeof MONSTER_URLS

interface Props {
  which: MonsterId
  pos: [number, number, number]
  scale?: number
  /** если задан > 0 — монстр "патрулирует" по X с этой амплитудой */
  patrolX?: number
  /** если true — колидер как сенсор (проходимый), иначе — physical block */
  sensor?: boolean
  /** rotation.y в радианах */
  rotY?: number
}

/**
 * Рендерит одну модель-монстра из Quaternius Ultimate Monsters.
 * - scale подбираем под единицу игрового мира: Quaternius-пак ~2-3 units роста,
 *   что для нас сопоставимо со стандартным персонажем.
 * - При `patrolX > 0` — kinematic body, двигается по синусоиде.
 * - При `patrolX = 0` — fixed body, просто стоит.
 *
 * Каждый экземпляр получает свой скелет через SkeletonUtils.clone, чтобы
 * разные инстансы одной модели не делили transform'ы.
 */
export default function GltfMonster({
  which,
  pos,
  scale = 1,
  patrolX = 0,
  sensor = false,
  rotY = 0,
}: Props) {
  const { scene } = useGLTF(MONSTER_URLS[which])
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const rb = useRef<RapierRigidBody>(null!)
  const visual = useRef<Group>(null!)
  const t0 = useRef(Math.random() * 10)

  // Авто-нормализация: Quaternius пак приходит с разными размерами.
  // Берём bbox, масштабируем так, чтобы высота была ~1.6 (наш игрок ~2).
  const autoScale = useMemo(() => {
    const box = new Box3().setFromObject(cloned)
    const size = new Vector3()
    box.getSize(size)
    const h = Math.max(size.y, 0.01)
    return (1.6 / h) * scale
  }, [cloned, scale])

  useFrame((_, dt) => {
    if (!rb.current) return
    t0.current += dt
    if (patrolX > 0) {
      const x = pos[0] + Math.sin(t0.current * 1.0) * patrolX
      const y = pos[1] + Math.abs(Math.sin(t0.current * 3)) * 0.15
      rb.current.setNextKinematicTranslation({ x, y, z: pos[2] })
      // fake bob rotation
      if (visual.current) {
        visual.current.rotation.y = rotY + Math.sin(t0.current * 1.0) * 0.3
      }
    } else {
      // idle bob
      if (visual.current) {
        visual.current.position.y = Math.sin(t0.current * 2) * 0.05
        visual.current.rotation.y = rotY
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
      <group ref={visual} scale={[autoScale, autoScale, autoScale]} rotation={[0, rotY, 0]}>
        <primitive object={cloned} />
      </group>
    </RigidBody>
  )
}

// Прелоад моделей при старте приложения — убираем задержку при первой игре
Object.values(MONSTER_URLS).forEach((u) => useGLTF.preload(u))
