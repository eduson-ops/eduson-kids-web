import { useEffect, useState } from 'react'
import * as THREE from 'three'
import {
  setClickContext,
  subscribeClickContext,
  setFocusedObject,
  makeObjectIdFromPos,
  type ClickContext,
} from '../lib/playEditMode'
import { addSpawnedPart, addRemoved, setRecolor, getRecoloredForWorld, getAdditionsForWorld, hashPos, pushUndo } from '../lib/worldEdits'
import { SFX } from '../lib/audio'

interface Props {
  worldId: string
}

const QUICK_COLORS: { hex: string; name: string }[] = [
  { hex: '#ff5464', name: 'Красный' },
  { hex: '#ffd644', name: 'Жёлтый' },
  { hex: '#48c774', name: 'Зелёный' },
  { hex: '#4c97ff', name: 'Синий' },
  { hex: '#c879ff', name: 'Фиолетовый' },
  { hex: '#ff8c1a', name: 'Оранжевый' },
  { hex: '#ff5ab1', name: 'Розовый' },
  { hex: '#88d4ff', name: 'Голубой' },
  { hex: '#ffffff', name: 'Белый' },
  { hex: '#2a3340', name: 'Тёмный' },
]

export default function WorldContextMenu({ worldId }: Props) {
  const [ctx, setCtx] = useState<ClickContext | null>(null)
  const [colorOpen, setColorOpen] = useState(false)

  useEffect(() => subscribeClickContext((c) => {
    setCtx(c)
    setColorOpen(false)
  }), [])

  useEffect(() => {
    if (!ctx) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); close() } }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [ctx])

  if (!ctx) return null

  const close = () => setClickContext(null)

  const editScript = () => {
    SFX.click()
    const id = makeObjectIdFromPos(ctx.pos)
    setFocusedObject(id)
    close()
  }

  const removeMesh = () => {
    const obj = ctx.objectRef as THREE.Object3D | null
    if (obj) {
      obj.visible = false
      const wp = new THREE.Vector3()
      obj.getWorldPosition(wp)
      const ph = hashPos([wp.x, wp.y, wp.z])
      pushUndo({ kind: 'remove', worldId, posHash: ph })
      addRemoved(worldId, ph)
    }
    SFX.click()
    close()
  }

  const recolor = (hex: string) => {
    const obj = ctx.objectRef as THREE.Mesh | null
    if (obj) {
      const mat = obj.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined
      if (mat) {
        const apply = (m: THREE.MeshStandardMaterial) => {
          m.color = new THREE.Color(hex)
          if ('emissive' in m && m.emissive) m.emissive = new THREE.Color(hex)
        }
        if (Array.isArray(mat)) mat.forEach(apply)
        else apply(mat)
      }
      const wp = new THREE.Vector3()
      obj.getWorldPosition(wp)
      const ph = hashPos([wp.x, wp.y, wp.z])
      const prevHex = getRecoloredForWorld(worldId)[ph]
      pushUndo({ kind: 'recolor', worldId, posHash: ph, ...(prevHex ? { prevHex } : {}) })
      setRecolor(worldId, ph, hex)
    }
    SFX.click()
    close()
  }

  const duplicate = () => {
    const additions = getAdditionsForWorld(worldId)
    const ph = hashPos([ctx.pos[0], ctx.pos[1], ctx.pos[2]])
    const src = additions.find((a) => hashPos(a.pos) === ph)
    const kind = src?.kind ?? 'cube'
    const size = src?.size ?? 1

    // Extract live color from mesh material (respects recolors)
    const obj = ctx.objectRef as THREE.Mesh | null
    let color = src?.color ?? '#FFD43C'
    if (obj) {
      const mat = obj.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined
      if (mat) {
        const m = Array.isArray(mat) ? mat[0] : mat
        if (m?.color) color = '#' + m.color.getHexString()
      }
    }

    const newId = addSpawnedPart({
      worldId,
      pos: [ctx.pos[0] + 1.5, ctx.pos[1] + 0.5, ctx.pos[2]],
      color,
      size,
      kind,
    })
    pushUndo({ kind: 'add', worldId, partId: newId })
    SFX.coin()
    close()
  }

  const [sx, sy] = ctx.screen
  const style: React.CSSProperties = {
    left: Math.min(sx, window.innerWidth - 280),
    top: Math.min(sy, window.innerHeight - 300),
  }

  return (
    <>
      <div className="wctx-backdrop" onClick={close} role="presentation" />
      <div className="wctx-menu" role="menu" aria-label="Контекстное меню объекта" style={style}>
        <header className="wctx-header">
          <span>Объект в ({ctx.pos[0].toFixed(1)}, {ctx.pos[1].toFixed(1)}, {ctx.pos[2].toFixed(1)})</span>
          <button className="wctx-close" onClick={close} aria-label="Закрыть">×</button>
        </header>
        {colorOpen ? (
          <div className="wctx-colors">
            {QUICK_COLORS.map(({ hex, name }) => (
              <button
                key={hex}
                className="wctx-swatch"
                style={{ background: hex }}
                onClick={() => recolor(hex)}
                aria-label={name}
                title={name}
              />
            ))}
            <button className="wctx-back" onClick={() => setColorOpen(false)}>← назад</button>
          </div>
        ) : (
          <div className="wctx-actions" role="group" aria-label="Действия с объектом">
            <button className="wctx-btn primary" onClick={editScript} role="menuitem">
              ✏ <span>Редактировать скрипт</span>
            </button>
            <button className="wctx-btn" onClick={() => setColorOpen(true)} role="menuitem">
              🎨 <span>Перекрасить</span>
            </button>
            <button className="wctx-btn" onClick={duplicate} role="menuitem">
              ➕ <span>Дублировать рядом</span>
            </button>
            <button className="wctx-btn danger" onClick={removeMesh} role="menuitem">
              🗑 <span>Убрать с карты</span>
            </button>
          </div>
        )}
        <footer className="wctx-footer">
          <small>Esc — закрыть · правки сохраняются</small>
        </footer>
      </div>
    </>
  )
}
