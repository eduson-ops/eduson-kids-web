import { useEffect, useState } from 'react'
import BuildScene from './BuildScene'
import Palette from './Palette'
import PropertiesPanel from './PropertiesPanel'
import {
  deletePart,
  duplicatePart,
  getState,
  setTool,
  subscribe,
  type EditorState,
} from './editorState'

export default function BuildTab() {
  const [state, setState] = useState<EditorState>(getState())

  useEffect(() => subscribe(setState), [])

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Пропускаем когда фокус в inputs
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (e.key === 'v' || e.key === 'V') setTool('select')
      else if (e.key === 'b' || e.key === 'B') setTool('place')
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = getState().selectedId
        if (id) deletePart(id)
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const id = getState().selectedId
        if (id) duplicatePart(id)
      } else if (e.key === 'Escape') {
        setTool('select')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="studio-build">
      <Palette state={state} />
      <div className="studio-viewport">
        <BuildScene state={state} />
        <div className="viewport-hint">
          {state.tool === 'place'
            ? `Кликай по земле чтобы поставить ${placeLabel(state.placingType)}. ESC — отмена.`
            : 'Клик на объект — выбрать. ПКМ + тащи — крути камеру.'}
        </div>
      </div>
      <PropertiesPanel state={state} />
    </div>
  )
}

function placeLabel(t: string): string {
  return ({ cube: 'блок', coin: 'монетку', finish: 'финиш', spawn: 'спавн' } as Record<string, string>)[t] ?? t
}
