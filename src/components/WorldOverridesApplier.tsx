import { useEffect } from 'react'
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

/**
 * WorldOverridesApplier — пробегает по всей Three.js-сцене и применяет
 * сохранённые правки (removed / recolored) на меши по их world-position hash.
 *
 * Запускается:
 *  - на mount (через короткую задержку чтобы world-компонент успел построить сцену)
 *  - на каждое изменение стора (ребёнок сохранил новую правку)
 */
export default function WorldOverridesApplier({ worldId }: Props) {
  const { scene } = useThree()

  useEffect(() => {
    const apply = () => {
      const removed = getRemovedForWorld(worldId)
      const recolored = getRecoloredForWorld(worldId)
      if (removed.size === 0 && Object.keys(recolored).length === 0) return

      // Собираем всех кандидатов в массив чтобы принять решение: если под hide
      // попадает подавляющее большинство — localStorage, скорее всего, битый.
      const candidates: Array<{ mesh: THREE.Mesh; hash: string; hex?: string }> = []
      const tmp = new THREE.Vector3()

      scene.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh

        // Skip: scriptable-hitbox, pointLight helpers
        const parentName = mesh.parent?.name || ''
        if (parentName.startsWith('scriptable-')) return

        // Skip критические меши — sky/clouds/sun/fog/postprocess
        // identifier лучше по userData-флагу, но пока — проверим by name pattern
        // и по материалу (BasicMaterial/ShaderMaterial — всё что НЕ Standard)
        const nm = (mesh.name || '') + '|' + parentName
        if (/sky|cloud|sun|voxel|fog|backdrop|hemisphere|dir-?light|light\b/i.test(nm)) return
        if (mesh.userData?.skipEdits) return

        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (!mat) return
        // Красить можно только MeshStandardMaterial. Sky/clouds — ShaderMaterial → пропустим.
        const isStandardLike = Array.isArray(mat)
          ? mat.some((m) => m.type === 'MeshStandardMaterial' || m.type === 'MeshPhysicalMaterial')
          : mat.type === 'MeshStandardMaterial' || mat.type === 'MeshPhysicalMaterial'
        if (!isStandardLike) return

        mesh.getWorldPosition(tmp)
        const h = hashPos([tmp.x, tmp.y, tmp.z])
        const hex = recolored[h]
        if (removed.has(h) || hex) {
          candidates.push({ mesh, hash: h, hex })
        }
      })

      // Safety: если applier хотел бы спрятать/перекрасить > 60% ВСЕХ меш'ей,
      // это почти наверняка битый стор (прошлые тесты). Пропускаем и логируем.
      let totalMeshes = 0
      scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) totalMeshes++ })
      const wouldTouch = candidates.length
      if (totalMeshes > 0 && wouldTouch / totalMeshes > 0.6) {
        console.warn(
          `[WorldOverrides] Skip — suspiciously many matches (${wouldTouch}/${totalMeshes}). ` +
          `localStorage['ek_world_edits_v2'] likely corrupted. ` +
          `Run: localStorage.removeItem('ek_world_edits_v2'); location.reload()`
        )
        return
      }

      let hiddenCount = 0
      let recoloredCount = 0
      for (const c of candidates) {
        if (removed.has(c.hash)) {
          c.mesh.visible = false
          hiddenCount++
          continue
        }
        if (c.hex) {
          const mat = c.mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
          const applyColor = (m: THREE.MeshStandardMaterial) => {
            try {
              m.color = new THREE.Color(c.hex!)
              if ('emissive' in m && m.emissive) m.emissive = new THREE.Color(c.hex!)
            } catch { /* skip */ }
          }
          if (Array.isArray(mat)) mat.forEach(applyColor)
          else applyColor(mat)
          recoloredCount++
        }
      }
      if (hiddenCount || recoloredCount) {
        console.log(
          `[WorldOverrides] world=${worldId}: hidden ${hiddenCount}, recolored ${recoloredCount} ` +
          `(out of ${totalMeshes} total meshes)`
        )
      }
    }

    // Первичное применение — с задержкой, чтобы сцена успела построиться
    const t = setTimeout(apply, 250)
    const unsub = subscribeEdits(() => {
      setTimeout(apply, 50)
    })
    return () => {
      clearTimeout(t)
      unsub()
    }
  }, [scene, worldId])

  return null
}
