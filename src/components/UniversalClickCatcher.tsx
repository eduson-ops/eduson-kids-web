import { useEffect, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  isEditMode,
  subscribeEditMode,
  setClickContext,
  getPlacement,
  subscribePlacement,
  setPlacement,
  getActiveTool,
  subscribeActiveTool,
  getToolColor,
  type ActiveTool,
} from '../lib/playEditMode'
import {
  addSpawnedPart,
  addRemoved,
  setRecolor,
  getRecoloredForWorld,
  hashPos,
  pushUndo,
  type PropKind,
} from '../lib/worldEdits'
import { SFX } from '../lib/audio'

interface Props {
  worldId: string
  children: React.ReactNode
}

/**
 * UniversalClickCatcher — прослойка внутри GameScene, ловит pointer-down
 * на ЛЮБОЙ меш в Edit-режиме. Два сценария:
 *   1. placement активен  → спавн объекта в точке клика через worldEdits
 *   2. placement=null     → открыть WorldContextMenu для кликнутого меша
 */
export default function UniversalClickCatcher({ worldId, children }: Props) {
  const [edit, setEdit] = useState(isEditMode())
  const [placement, setPlacementLocal] = useState(getPlacement())
  const [tool, setTool] = useState<ActiveTool>(getActiveTool())
  useEffect(() => subscribeEditMode(setEdit), [])
  useEffect(() => subscribePlacement(setPlacementLocal), [])
  useEffect(() => subscribeActiveTool(setTool), [])

  const applyPaint = (obj: THREE.Object3D) => {
    const hex = getToolColor()
    const mesh = obj as THREE.Mesh
    const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined
    if (!mat) return
    // Persist + instant visual
    const wp = new THREE.Vector3()
    mesh.getWorldPosition(wp)
    const ph = hashPos([wp.x, wp.y, wp.z])
    const applyOne = (m: THREE.MeshStandardMaterial) => {
      try {
        m.color = new THREE.Color(hex)
        if ('emissive' in m && m.emissive) m.emissive = new THREE.Color(hex)
      } catch { /* non-standard mat — skip */ }
    }
    if (Array.isArray(mat)) mat.forEach(applyOne)
    else applyOne(mat)
    const prevHex = getRecoloredForWorld(worldId)[ph]
    setRecolor(worldId, ph, hex)
    pushUndo({ kind: 'recolor', worldId, posHash: ph, ...(prevHex ? { prevHex } : {}) })
  }

  const applyRemove = (obj: THREE.Object3D) => {
    obj.visible = false
    const wp = new THREE.Vector3()
    obj.getWorldPosition(wp)
    const ph = hashPos([wp.x, wp.y, wp.z])
    addRemoved(worldId, ph)
    pushUndo({ kind: 'remove', worldId, posHash: ph })
  }

  const handle = (e: ThreeEvent<PointerEvent>) => {
    if (!edit) return
    const obj = e.object
    const parentName = obj.parent?.name || obj.name || ''
    if (parentName.startsWith('scriptable-')) return

    e.stopPropagation()
    const p = e.point

    // №1: placement (Q-меню → пропс) — спавним
    if (placement) {
      const id = addSpawnedPart({
        worldId,
        pos: [p.x, p.y + 0.5, p.z],
        color: placement.color,
        size: 1,
        kind: placement.kind as PropKind,
      })
      pushUndo({ kind: 'add', worldId, partId: id })
      SFX.coin()
      return
    }

    // №2: активный tool из Инструментов-таба — применяем без меню
    if (tool === 'paint') {
      applyPaint(obj)
      SFX.click()
      return
    }
    if (tool === 'remove') {
      applyRemove(obj)
      SFX.click()
      return
    }

    // №3: обычный клик — открываем контекст-меню
    setClickContext({
      pos: [p.x, p.y, p.z],
      screen: [e.clientX ?? window.innerWidth / 2, e.clientY ?? window.innerHeight / 2],
      objectUuid: obj.uuid,
      objectRef: obj,
    })
  }

  // Esc в placement-режиме отменяет
  useEffect(() => {
    if (!placement) return
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setPlacement(null)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [placement])

  return <group onPointerDown={handle}>{children}</group>
}

// tool переменная используется только в handle — подавляем TS «unused» если включено
void (null as unknown as ActiveTool)
