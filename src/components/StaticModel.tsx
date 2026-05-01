import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Mesh } from 'three'
import * as THREE from 'three'

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
        // Smooth normals — eliminates faceting artifacts on imported models
        if (obj.geometry) {
          obj.geometry.computeVertexNormals()
        }

        obj.castShadow = true
        obj.receiveShadow = true
        // Explicit frustum culling (ensures it is never accidentally disabled)
        obj.frustumCulled = true

        // Nudge materials toward cartoonish look: less specular blowout
        if (obj.material && !Array.isArray(obj.material)) {
          const mat = obj.material as THREE.MeshStandardMaterial
          if (mat.roughness !== undefined) {
            mat.roughness = Math.min(mat.roughness + 0.1, 1.0)
            mat.metalness = Math.max(mat.metalness - 0.1, 0.0)
          }
        }
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
