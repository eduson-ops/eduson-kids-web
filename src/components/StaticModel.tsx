import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { Mesh } from 'three'
import * as THREE from 'three'
import { getToonGradientMap } from '../lib/toonGradient'

interface Props {
  url: string
  scale?: number
  rotY?: number
  toon?: boolean
}

/**
 * Универсальная обёртка над GLTF/GLB для статичных сцен — Tree, House, Prop.
 * Клонирует scene через SkeletonUtils и включает тени на всех мешах внутри.
 * Для generated/ пропов автоматически применяет MeshToonMaterial.
 */
export default function StaticModel({ url, scale = 1, rotY = 0, toon }: Props) {
  const gltf = useGLTF(url)
  const gradientMap = getToonGradientMap()
  // Auto-toon for generated props; caller can override
  const useToon = toon ?? url.includes('/models/generated/')
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene)
    c.traverse((obj) => {
      if (obj instanceof Mesh) {
        if (obj.geometry) obj.geometry.computeVertexNormals()
        obj.castShadow = true
        obj.receiveShadow = true
        obj.frustumCulled = true

        if (useToon) {
          // Replace with MeshToonMaterial preserving base color
          const oldMat = obj.material as THREE.MeshStandardMaterial
          const color = oldMat.color?.clone() ?? new THREE.Color(0xffffff)
          const emissive = oldMat.emissive?.clone() ?? new THREE.Color(0x000000)
          const emissiveIntensity = (oldMat as any).emissiveIntensity ?? 0
          obj.material = new THREE.MeshToonMaterial({
            color,
            emissive,
            emissiveIntensity,
            gradientMap,
          })
        } else {
          // Standard models: nudge toward cartoon look
          if (obj.material && !Array.isArray(obj.material)) {
            const mat = obj.material as THREE.MeshStandardMaterial
            if (mat.roughness !== undefined) {
              mat.roughness = Math.min(mat.roughness + 0.1, 1.0)
              mat.metalness = Math.max(mat.metalness - 0.1, 0.0)
            }
          }
        }
      }
    })
    return c
  }, [gltf.scene, useToon, gradientMap])

  return (
    <group scale={[scale, scale, scale]} rotation={[0, rotY, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
