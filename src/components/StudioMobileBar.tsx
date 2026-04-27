import { useEffect, useState, type ReactNode } from 'react'
import {
  deletePart,
  getState,
  selectPart,
  subscribe,
  undoEditor,
  type EditorState,
} from '../studio/editorState'
import Palette from '../studio/Palette'
import PropertiesPanel from '../studio/PropertiesPanel'

export type StudioTab = 'build' | 'script' | 'test'

interface Props {
  tab: StudioTab
  onTabChange: (t: StudioTab) => void
}

type Sheet = null | 'palette' | 'properties'

/**
 * StudioMobileBar — bottom toolbar для touch-устройств.
 * Мобильные эквиваленты keyboard-shortcut'ов (Delete, Ctrl+Z, Escape)
 * + переключатель режимов + bottom-sheet тогглы для Palette/PropertiesPanel.
 */
export default function StudioMobileBar({ tab, onTabChange }: Props) {
  const [state, setState] = useState<EditorState>(getState())
  const [sheet, setSheet] = useState<Sheet>(null)

  useEffect(() => subscribe(setState), [])

  const hasSelection = state.selectedId !== null

  const onDelete = () => {
    const id = getState().selectedId
    if (id) deletePart(id)
  }

  const onUndo = () => {
    undoEditor()
  }

  const onDeselect = () => {
    selectPart(null)
    setSheet(null)
  }

  const closeSheet = () => setSheet(null)

  return (
    <>
      {/* Затемнение-подложка для bottom sheet */}
      {sheet && <div className="studio-sheet-backdrop" onClick={closeSheet} role="presentation" />}

      {/* Bottom sheets */}
      {sheet === 'palette' && (
        <div className="studio-sheet-container">
          <Palette state={state} variant="bottom-sheet" onClose={closeSheet} />
        </div>
      )}
      {sheet === 'properties' && (
        <div className="studio-sheet-container">
          <PropertiesPanel state={state} variant="bottom-sheet" onClose={closeSheet} />
        </div>
      )}

      {/* Нижний тулбар */}
      <nav
        className="studio-mobile-bar"
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          gap: 6,
          padding: '8px 10px calc(8px + env(safe-area-inset-bottom)) 10px',
          background: 'rgba(20,24,40,0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Mode switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: 3 }}>
          <PillBtn active={tab === 'build'} onClick={() => onTabChange('build')}>🧱</PillBtn>
          <PillBtn active={tab === 'script'} onClick={() => onTabChange('script')}>🧩</PillBtn>
          <PillBtn active={tab === 'test'} onClick={() => onTabChange('test')}>▶</PillBtn>
        </div>

        <div style={{ width: 1, background: 'rgba(255,255,255,0.12)', margin: '4px 2px' }} />

        {/* Palette / Properties только в build */}
        {tab === 'build' && (
          <>
            <PillBtn
              active={sheet === 'palette'}
              onClick={() => setSheet(sheet === 'palette' ? null : 'palette')}
            >
              🎨 <span style={{ marginLeft: 4, fontSize: 12 }}>Палитра</span>
            </PillBtn>
            <PillBtn
              active={sheet === 'properties'}
              onClick={() => setSheet(sheet === 'properties' ? null : 'properties')}
            >
              🔧 <span style={{ marginLeft: 4, fontSize: 12 }}>Свойства</span>
            </PillBtn>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <PillBtn onClick={onUndo} title="Undo">↶</PillBtn>
        <PillBtn onClick={onDelete} disabled={!hasSelection} title="Удалить выделенное">🗑</PillBtn>
        <PillBtn onClick={onDeselect} disabled={!hasSelection} title="Снять выделение">✕</PillBtn>
      </nav>
    </>
  )
}

function PillBtn({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        minWidth: 42,
        height: 38,
        padding: '0 12px',
        borderRadius: 999,
        border: 'none',
        background: active ? 'var(--violet, #6B5CE7)' : 'rgba(255,255,255,0.10)',
        color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
        fontSize: 16,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'manipulation',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
