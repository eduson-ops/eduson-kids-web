import { useEffect } from 'react'

const INIT_APPLY_DELAY_MS = 250  // wait for scene to mount before applying overrides
const EDIT_APPLY_DELAY_MS = 50   // debounce-like gap after edit events
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  getRemovedForWorld,
  getRecoloredForWorld,
  hashPos,
  subscribeEdits,
} from '../lib/worldEdits'

interface Props {
  worldId: string
}

export default function WorldOverridesApplier({ worldId }: Props) {
  const { scene } = useThree()

  useEffect(() => {
    // Track previously applied state so we can undo it on re-apply
    const hiddenMeshes = new Set<THREE.Mesh>()
    const recoloredMeshes = new Map<THREE.Mesh, THREE.Color>() // mesh -> original color

    const apply = () => {
      const removed = getRemovedForWorld(worldId)
      const recolored = getRecoloredForWorld(worldId)

      // Restore previously hidden meshes
      for (const mesh of hiddenMeshes) {
        mesh.visible = true
      }
      hiddenMeshes.clear()

      // Restore previously recolored meshes to original colors
      for (const [mesh, origColor] of recoloredMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
        const restore = (m: THREE.MeshStandardMaterial) => {
          try { m.color = origColor.clone() } catch { /* skip */ }
        }
        if (Array.isArray(mat)) mat.forEach(restore)
        else restore(mat)
      }
      recoloredMeshes.clear()

      if (removed.size === 0 && Object.keys(recolored).length === 0) return

      const candidates: Array<{ mesh: THREE.Mesh; hash: string; hex?: string }> = []
      let totalMeshes = 0
      const tmp = new THREE.Vector3()

      scene.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        totalMeshes++
        const mesh = obj as THREE.Mesh
        const parentName = mesh.parent?.name || ''
        if (parentName.startsWith('scriptable-')) return
        const nm = (mesh.name || '') + '|' + parentName
        if (/sky|cloud|sun|voxel|fog|backdrop|hemisphere|dir-?light|light\b/i.test(nm)) return
        if (mesh.userData?.skipEdits) return
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (!mat) return
        const isStandardLike = Array.isArray(mat)
          ? mat.some((m) => m.type === 'MeshStandardMaterial' || m.type === 'MeshPhysicalMaterial' || m.type === 'MeshToonMaterial')
          : mat.type === 'MeshStandardMaterial' || mat.type === 'MeshPhysicalMaterial' || mat.type === 'MeshToonMaterial'
        if (!isStandardLike) return
        mesh.getWorldPosition(tmp)
        const h = hashPos([tmp.x, tmp.y, tmp.z])
        const hex = recolored[h]
        if (removed.has(h) || hex) {
          candidates.push({ mesh, hash: h, ...(hex ? { hex } : {}) })
        }
      })

      // Safety: > 60% of all meshes is almost certainly a corrupted store
      if (totalMeshes > 0 && candidates.length / totalMeshes > 0.6) {
        console.warn(
          `[WorldOverrides] Skip — suspiciously many matches (${candidates.length}/${totalMeshes}). ` +
          `Run: localStorage.removeItem('ek_world_edits_v2'); location.reload()`
        )
        return
      }

      for (const c of candidates) {
        if (removed.has(c.hash)) {
          c.mesh.visible = false
          hiddenMeshes.add(c.mesh)
        } else if (c.hex) {
          type Colorable = THREE.MeshStandardMaterial | THREE.MeshToonMaterial
          const mat = c.mesh.material as Colorable | Colorable[]
          const firstMat = Array.isArray(mat) ? mat[0] : mat
          if (firstMat?.color) {
            recoloredMeshes.set(c.mesh, firstMat.color.clone())
          }
          const applyColor = (m: Colorable) => {
            try { m.color = new THREE.Color(c.hex!) } catch { /* skip */ }
          }
          if (Array.isArray(mat)) mat.forEach(applyColor)
          else applyColor(mat)
        }
      }
    }

    const t = setTimeout(apply, INIT_APPLY_DELAY_MS)
    const unsub = subscribeEdits(() => { setTimeout(apply, EDIT_APPLY_DELAY_MS) })
    return () => {
      clearTimeout(t)
      unsub()
      // Restore on unmount
      for (const mesh of hiddenMeshes) mesh.visible = true
      for (const [mesh, orig] of recoloredMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
        const restore = (m: THREE.MeshStandardMaterial) => {
          try { m.color = orig.clone() } catch { /* skip */ }
        }
        if (Array.isArray(mat)) mat.forEach(restore)
        else restore(mat)
      }
    }
  }, [scene, worldId])

  return null
}
