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
  undoEditor,
  type EditorState,
} from './editorState'

interface BuildTabProps {
  isMobile?: boolean
}

export default function BuildTab({ isMobile = false }: BuildTabProps = {}) {
  const [state, setState] = useState<EditorState>(getState())

  useEffect(() => subscribe(setState), [])

  // Hotkeys — match on KeyboardEvent.code (locale-safe, works on Russian layout).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Пропускаем когда фокус в inputs / редакторах
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

      const mod = e.ctrlKey || e.metaKey

      // Ctrl/Cmd+Z → undo (last add/delete). First, catch the modifier shortcuts.
      if (mod && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault()
        undoEditor()
        return
      }
      if (mod && e.code === 'KeyD') {
        e.preventDefault()
        const id = getState().selectedId
        if (id) duplicatePart(id)
        return
      }

      if (e.code === 'KeyV') setTool('select')
      else if (e.code === 'KeyB') setTool('place')
      else if (e.code === 'Delete' || e.code === 'Backspace') {
        const id = getState().selectedId
        if (id) deletePart(id)
      } else if (e.code === 'Escape') {
        setTool('select')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="studio-build">
      {!isMobile && <Palette state={state} />}
      <div className="studio-viewport">
        <BuildScene state={state} />
        <div className="viewport-hint">
          {state.tool === 'place'
            ? isMobile
              ? `Тапни по земле чтобы поставить ${placeLabel(state.placingType)}.`
              : `Кликай по земле чтобы поставить ${placeLabel(state.placingType)}. ESC — отмена.`
            : isMobile
              ? 'Тап — выбрать. Один палец — крутить, два — зум/панорама.'
              : 'Клик на объект — выбрать. ПКМ + тащи — крути камеру.'}
        </div>
      </div>
      {!isMobile && <PropertiesPanel state={state} />}
    </div>
  )
}

function placeLabel(t: string): string {
  return ({ cube: 'блок', coin: 'монетку', finish: 'финиш', spawn: 'спавн' } as Record<string, string>)[t] ?? t
}
