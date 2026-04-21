import { useAnimations, useGLTF } from '@react-three/drei'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { MONSTER_URLS, type MonsterId } from './GltfMonster'

export interface PlayerVisualHandle {
  /** вызывается из Player.useFrame каждый кадр; управляет анимацией */
  update(state: {
    speed: number
    phase: number
    airborne: boolean
    idlePhase: number
  }): void
}

interface Props {
  which: MonsterId
}

/**
 * 3D-модель игрока на базе Quaternius Ultimate Monsters (CC0).
 * Имеет анимацию-state-machine: Idle / Walk / Run / Jump_Idle
 * — переключается по speed + airborne из Player.
 */
const PlayerCharacter = forwardRef<PlayerVisualHandle, Props>(function PlayerCharacter(
  { which },
  ref
) {
  const gltf = useGLTF(MONSTER_URLS[which])
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene)
    // Включаем тени у всех мешей внутри
    c.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    return c
  }, [gltf.scene])
  const group = useRef<Group>(null!)
  const { actions } = useAnimations(gltf.animations, group)
  const current = useRef<string | null>(null)

  // Нормализуем рост (пак содержит модели разных высот)
  const autoScale = useMemo(() => {
    const box = new Box3().setFromObject(cloned)
    const size = new Vector3()
    box.getSize(size)
    const h = Math.max(size.y, 0.01)
    return 1.7 / h
  }, [cloned])

  useEffect(() => {
    const a = actions['Idle']
    if (a) a.reset().fadeIn(0.2).play()
    current.current = 'Idle'
    return () => {
      for (const name in actions) actions[name]?.stop()
    }
  }, [actions])

  useImperativeHandle(
    ref,
    () => ({
      update(state) {
        const desired = state.airborne
          ? 'Jump_Idle'
          : state.speed > 5
            ? 'Run'
            : state.speed > 0.3
              ? 'Walk'
              : 'Idle'

        if (desired !== current.current) {
          const prev = current.current ? actions[current.current] : null
          const next = actions[desired]
          if (next) {
            prev?.fadeOut(0.15)
            next.reset().fadeIn(0.15).play()
            current.current = desired
          }
        }
      },
    }),
    [actions]
  )

  return (
    <group ref={group} scale={[autoScale, autoScale, autoScale]}>
      <primitive object={cloned} />
    </group>
  )
})

export default PlayerCharacter

// Прелоад на старте
Object.values(MONSTER_URLS).forEach((u) => useGLTF.preload(u))
