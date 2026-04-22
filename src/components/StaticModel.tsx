import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Mesh } from 'three'

interface Props {
  url: string
  scale?: number
  rotY?: number
}

/**
 * Универсальная обёртка над GLTF/GLB для статичных сцен — Tree, House, Prop.
 * Клонирует scene через SkeletonUtils и включает тени на всех мешах внутри.
 * Без RigidBody (добавляется снаружи в конкретных компонентах).
 */
export default function StaticModel({ url, scale = 1, rotY = 0 }: Props) {
  const gltf = useGLTF(url)
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

  return (
    <group scale={[scale, scale, scale]} rotation={[0, rotY, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
