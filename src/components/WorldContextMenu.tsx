import { useEffect, useState } from 'react'
import * as THREE from 'three'
import {
  setClickContext,
  subscribeClickContext,
  setFocusedObject,
  makeObjectIdFromPos,
  type ClickContext,
} from '../lib/playEditMode'
import { addSpawnedPart, addRemoved, setRecolor, hashPos } from '../lib/worldEdits'
import { SFX } from '../lib/audio'

interface Props {
  worldId: string
}

const QUICK_COLORS = [
  '#ff5464', '#ffd644', '#48c774', '#4c97ff', '#c879ff',
  '#ff8c1a', '#ff5ab1', '#88d4ff', '#ffffff', '#2a3340',
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
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
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
      // Мгновенная визуальная реакция
      obj.visible = false
      // Persistence: сохраняем position-hash по world-position меша
      const wp = new THREE.Vector3()
      obj.getWorldPosition(wp)
      addRemoved(worldId, hashPos([wp.x, wp.y, wp.z]))
    }
    SFX.click()
    close()
  }

  const recolor = (hex: string) => {
    const obj = ctx.objectRef as THREE.Mesh | null
    if (obj) {
      // Мгновенная визуальная реакция
      const mat = obj.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined
      if (mat) {
        const apply = (m: THREE.MeshStandardMaterial) => {
          m.color = new THREE.Color(hex)
          if ('emissive' in m && m.emissive) m.emissive = new THREE.Color(hex)
        }
        if (Array.isArray(mat)) mat.forEach(apply)
        else apply(mat)
      }
      // Persistence: сохраняем по world-position
      const wp = new THREE.Vector3()
      obj.getWorldPosition(wp)
      setRecolor(worldId, hashPos([wp.x, wp.y, wp.z]), hex)
    }
    SFX.click()
    close()
  }

  const duplicate = () => {
    addSpawnedPart({
      worldId,
      pos: [ctx.pos[0] + 1.5, ctx.pos[1] + 0.5, ctx.pos[2]],
      color: '#FFD43C',
      size: 1,
      kind: 'cube',
    })
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
      <div className="wctx-backdrop" onClick={close} />
      <div className="wctx-menu" style={style}>
        <header className="wctx-header">
          <span>Объект в ({ctx.pos[0].toFixed(1)}, {ctx.pos[1].toFixed(1)}, {ctx.pos[2].toFixed(1)})</span>
          <button className="wctx-close" onClick={close} aria-label="Закрыть">×</button>
        </header>
        {colorOpen ? (
          <div className="wctx-colors">
            {QUICK_COLORS.map((c) => (
              <button
                key={c}
                className="wctx-swatch"
                style={{ background: c }}
                onClick={() => recolor(c)}
                aria-label={`Цвет ${c}`}
              />
            ))}
            <button className="wctx-back" onClick={() => setColorOpen(false)}>← назад</button>
          </div>
        ) : (
          <div className="wctx-actions">
            <button className="wctx-btn primary" onClick={editScript}>
              ✏ <span>Редактировать скрипт</span>
            </button>
            <button className="wctx-btn" onClick={() => setColorOpen(true)}>
              🎨 <span>Перекрасить</span>
            </button>
            <button className="wctx-btn" onClick={duplicate}>
              ➕ <span>Дублировать рядом</span>
            </button>
            <button className="wctx-btn danger" onClick={removeMesh}>
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
