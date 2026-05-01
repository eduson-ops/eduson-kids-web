import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  isEditMode, subscribeEditMode,
  setHoverTarget, getHoverTarget,
  type HoverTarget,
} from '../lib/playEditMode'

/**
 * FocusedObjectIndicator — режим A («от первого лица»).
 *
 * Кадрово (throttled до ~10 Hz) пускает луч из камеры вперёд на FOCUS_RADIUS,
 * находит ближайший mesh со scriptable-меткой (атрибут userData.scriptable
 * либо родитель в Scriptable). Если попал — публикует HoverTarget в
 * playEditMode. Параллельно подсвечивает объект эмиссивным аутлайном
 * (без post-fx, чтобы не платить FPS на low-end Android) и рисует подсказку
 * «Нажми Q чтобы редактировать».
 *
 * Q-клавиша обрабатывается ОТДЕЛЬНО в Play.tsx (window-level), чтобы можно
 * было решить приоритет: hover-target есть → открыть PropertiesPanel,
 * иначе — отдать клавишу старому SpawnMenu.
 */

const FOCUS_RADIUS = 3.0
const RAYCAST_THROTTLE_MS = 100
const RAY_DIRECTION = new THREE.Vector3(0, 0, -1)
const HIGHLIGHT_COLOR = '#ffd43c'
const HIGHLIGHT_EMISSIVE_INTENSITY = 0.7

export default function FocusedObjectIndicator() {
  const { camera, scene } = useThree()
  const [edit, setEdit] = useState(isEditMode())
  const [target, setTarget] = useState<HoverTarget | null>(getHoverTarget())
  const raycaster = useRef(new THREE.Raycaster())
  const lastCheck = useRef(0)
  const prevEmissive = useRef<{ mesh: THREE.Mesh; color: THREE.Color; intensity: number } | null>(null)

  useEffect(() => subscribeEditMode(setEdit), [])

  // Возвращаем эмиссив исходному объекту, когда target меняется
  useEffect(() => {
    return () => {
      restoreEmissive()
    }
  }, [])

  function restoreEmissive() {
    const prev = prevEmissive.current
    if (!prev) return
    const mat = prev.mesh.material as THREE.MeshStandardMaterial | undefined
    if (mat && 'emissive' in mat) {
      mat.emissive.copy(prev.color)
      mat.emissiveIntensity = prev.intensity
    }
    prevEmissive.current = null
  }

  function applyEmissive(mesh: THREE.Mesh) {
    const mat = mesh.material as THREE.MeshStandardMaterial | undefined
    if (!mat || !('emissive' in mat)) return
    prevEmissive.current = {
      mesh,
      color: mat.emissive.clone(),
      intensity: mat.emissiveIntensity ?? 1,
    }
    mat.emissive.set(HIGHLIGHT_COLOR)
    mat.emissiveIntensity = HIGHLIGHT_EMISSIVE_INTENSITY
  }

  useFrame((state) => {
    if (!edit) {
      if (target) { setTarget(null); setHoverTarget(null); restoreEmissive() }
      return
    }
    const now = state.clock.elapsedTime * 1000
    if (now - lastCheck.current < RAYCAST_THROTTLE_MS) return
    lastCheck.current = now

    // Луч идёт из позиции камеры в направлении её взгляда.
    // PointerLock-камера хранит -Z как "вперёд".
    const dir = RAY_DIRECTION.clone().applyQuaternion(camera.quaternion).normalize()
    raycaster.current.set(camera.position, dir)
    raycaster.current.far = FOCUS_RADIUS

    const hits = raycaster.current.intersectObjects(scene.children, true)
    let next: HoverTarget | null = null
    for (const hit of hits) {
      const obj = hit.object
      // Игнорируем невидимые/служебные (Sky, Sun, gizmos)
      if (!obj.visible) continue
      const tag = findEditableTag(obj)
      if (tag) {
        const wp = new THREE.Vector3()
        obj.getWorldPosition(wp)
        next = {
          uuid: tag.uuid,
          pos: [wp.x, wp.y, wp.z],
          label: tag.label,
          ref: tag.ref,
        }
        break
      }
    }

    // Меняем подсветку только если объект действительно сменился.
    if (next?.uuid !== target?.uuid) {
      restoreEmissive()
      if (next) {
        // Найдём mesh для эмиссива — берём первый Mesh-предок
        const mesh = findFirstMesh(next.ref as THREE.Object3D)
        if (mesh) applyEmissive(mesh)
      }
      setTarget(next)
      setHoverTarget(next)
    }
  })

  if (!edit || !target) return null

  return (
    <Html
      position={[target.pos[0], target.pos[1] + 2.0, target.pos[2]]}
      center
      distanceFactor={6}
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        background: 'rgba(10, 10, 20, 0.96)',
        color: '#FFD43C',
        padding: '10px 16px',
        borderRadius: 12,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'nowrap',
        border: '2px solid #FFD43C',
        boxShadow: '0 0 24px rgba(255, 212, 60, 0.4), 0 4px 16px rgba(0,0,0,0.6)',
        animation: 'focusHintPulse 1.2s ease-in-out infinite',
        textAlign: 'center',
        minWidth: 140,
      }}>
        {target.label && (
          <div style={{ color: '#fff', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
            {target.label}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <kbd style={{
            background: '#FFD43C', color: '#15141B', padding: '3px 10px',
            borderRadius: 6, fontWeight: 700, fontSize: 14, lineHeight: 1.4,
          }}>Q</kbd>
          <span style={{ color: '#fff', fontSize: 13 }}>редактировать</span>
        </div>
      </div>
    </Html>
  )
}

interface EditableTag {
  uuid: string
  label: string | null
  ref: THREE.Object3D
}

/**
 * Идём вверх по иерархии до первого объекта с userData.scriptable=true либо
 * userData.editable=true. Для Scriptable-маркеров мы выставим флаг при mount.
 */
function findEditableTag(o: THREE.Object3D | null): EditableTag | null {
  let cur: THREE.Object3D | null = o
  while (cur) {
    if (cur.userData?.scriptable || cur.userData?.editable) {
      return {
        uuid: cur.uuid,
        label: (cur.userData.label as string) ?? null,
        ref: cur,
      }
    }
    cur = cur.parent
  }
  return null
}

function findFirstMesh(o: THREE.Object3D): THREE.Mesh | null {
  if ((o as THREE.Mesh).isMesh) return o as THREE.Mesh
  let found: THREE.Mesh | null = null
  o.traverse((child) => {
    if (!found && (child as THREE.Mesh).isMesh) found = child as THREE.Mesh
  })
  return found
}
