import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getToonGradientMap } from '../lib/toonGradient'

// Slightly after WorldOverridesApplier (250ms) so color edits are applied first
const INIT_DELAY_MS = 300
// Second pass catches GLB models loaded via Suspense after initial render
const LATE_PASS_MS = 1800

const SKIP_NAME_RE = /sky|cloud|sun|voxel|fog|backdrop|hemisphere|light/i


/**
 * Replaces MeshStandardMaterial with MeshToonMaterial globally after scene load.
 * Skips emissive, transparent, and named sky/cloud/light meshes.
 * Restores originals on unmount for clean HMR.
 *
 * Mount OUTSIDE <Physics> alongside WorldOverridesApplier in GameScene.
 */
export default function ToonOverride() {
  const { scene } = useThree()

  useEffect(() => {
    const gradientMap = getToonGradientMap()
    const replaced = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()

    const apply = () => {
      scene.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh
        if (replaced.has(mesh)) return
        if (mesh.userData?.skipToon) return

        const nm = (mesh.name || '') + '|' + (mesh.parent?.name || '')
        if (SKIP_NAME_RE.test(nm)) return

        const mat = mesh.material
        if (!mat || Array.isArray(mat)) return
        if (mat.type !== 'MeshStandardMaterial') return

        const std = mat as THREE.MeshStandardMaterial
        if (std.emissiveIntensity > 0.05) return
        if (std.transparent && std.opacity < 0.95) return

        replaced.set(mesh, mat)
        mesh.material = new THREE.MeshToonMaterial({
          color: std.color.clone(),
          map: std.map ?? null,
          gradientMap,
        })

        // Preserve normal map from the original material for depth detail
        if (std.normalMap) {
          (mesh.material as THREE.MeshToonMaterial).normalMap = std.normalMap
          ;(mesh.material as THREE.MeshToonMaterial).normalScale = std.normalScale
        }

        // Slightly reduce saturation — imported models can look over-saturated with toon
        const col = (mesh.material as THREE.MeshToonMaterial).color
        const hsl = { h: 0, s: 0, l: 0 }
        col.getHSL(hsl)
        col.setHSL(hsl.h, Math.min(hsl.s * 0.9, 1.0), hsl.l)
      })
    }

    const t1 = setTimeout(apply, INIT_DELAY_MS)
    const t2 = setTimeout(apply, LATE_PASS_MS)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      replaced.forEach((origMat, mesh) => { mesh.material = origMat })
      replaced.clear()
    }
  }, [scene])

  return null
}
