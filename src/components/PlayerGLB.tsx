import { useAnimations, useGLTF } from '@react-three/drei'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import * as THREE from 'three'
import type { PlayerVisualHandle } from './PlayerCharacter'
import { PUBLIC_BASE } from '../lib/publicPath'
import { getToonGradientMap } from '../lib/toonGradient'

const GLB_URL = `${PUBLIC_BASE}/models/generated/penguin_hero.glb?v=6`

// Применяем тун-материал ко всем мешам модели
function applyToon(root: THREE.Object3D, gradientMap: THREE.DataTexture) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.castShadow = true
    obj.receiveShadow = true
    const oldMat = obj.material as THREE.MeshStandardMaterial
    obj.material = new THREE.MeshToonMaterial({
      color: oldMat.color?.clone() ?? new THREE.Color('#e8a06a'),
      emissive: oldMat.emissive?.clone() ?? new THREE.Color(0x000000),
      emissiveIntensity: (oldMat as any).emissiveIntensity ?? 0,
      gradientMap,
    })
  })
}

const PlayerGLB = forwardRef<PlayerVisualHandle>(function PlayerGLB(_props, ref) {
  const gradientMap = getToonGradientMap()
  const gltf = useGLTF(GLB_URL)
  const group = useRef<THREE.Group>(null!)
  const { actions } = useAnimations(gltf.animations, group)
  const current = useRef<string | null>(null)

  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene)
    applyToon(c, gradientMap)
    return c
  }, [gltf.scene, gradientMap])

  // Нормализуем высоту до ~1.7 (стандарт платформы)
  const autoScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const h = Math.max(size.y, 0.01)
    return 1.7 / h
  }, [cloned])

  useEffect(() => {
    const a = actions['idle']
    if (a) { a.reset().fadeIn(0.2).play() }
    current.current = 'idle'
    return () => { Object.values(actions).forEach(a => a?.stop()) }
  }, [actions])

  useImperativeHandle(ref, () => ({
    update(state) {
      const desired = state.airborne
        ? 'jump'
        : state.speed > 5
          ? 'run'
          : state.speed > 0.3
            ? 'walk'
            : 'idle'

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
  }), [actions])

  return (
    <group ref={group} scale={[autoScale, autoScale, autoScale]}>
      <primitive object={cloned} />
    </group>
  )
})

export default PlayerGLB

useGLTF.preload(GLB_URL)
