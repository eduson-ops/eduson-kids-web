import {
  PALETTE_COLORS,
  setPlacingColor,
  setPlacingType,
  setTool,
  type EditorState,
} from './editorState'

interface Props {
  state: EditorState
}

const PART_TYPES: Array<{
  type: EditorState['placingType']
  label: string
  emoji: string
}> = [
  { type: 'cube', label: 'Блок', emoji: '🟦' },
  { type: 'coin', label: 'Монетка', emoji: '💰' },
  { type: 'finish', label: 'Финиш', emoji: '🏁' },
  { type: 'spawn', label: 'Спавн', emoji: '📍' },
]

export default function Palette({ state }: Props) {
  return (
    <aside className="studio-palette">
      <section>
        <h4>Инструменты</h4>
        <div className="tool-row">
          <button
            className={`tool-btn ${state.tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
            title="Выделить (V)"
          >
            ↖ <small>выбор</small>
          </button>
          <button
            className={`tool-btn ${state.tool === 'place' ? 'active' : ''}`}
            onClick={() => setTool('place')}
            title="Поставить (B)"
          >
            ＋ <small>поставить</small>
          </button>
        </div>
      </section>

      <section>
        <h4>Объекты</h4>
        <div className="part-grid">
          {PART_TYPES.map((p) => (
            <button
              key={p.type}
              className={`part-btn ${
                state.tool === 'place' && state.placingType === p.type ? 'active' : ''
              }`}
              onClick={() => setPlacingType(p.type)}
              title={p.label}
            >
              <span className="part-emoji">{p.emoji}</span>
              <span className="part-label">{p.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Цвет</h4>
        <div className="color-palette">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c}
              className={`palette-swatch ${state.placingColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setPlacingColor(c)}
              aria-label={c}
            />
          ))}
          <label className="palette-custom">
            <input
              type="color"
              value={state.placingColor}
              onChange={(e) => setPlacingColor(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="hint-section">
        <h4>Как играть</h4>
        <ul className="hint-list">
          <li><kbd>V</kbd> выделить объект</li>
          <li><kbd>B</kbd> начать ставить</li>
          <li><kbd>Del</kbd> удалить выбранное</li>
          <li><kbd>Ctrl+D</kbd> дублировать</li>
          <li>ПКМ — крутить камеру</li>
        </ul>
      </section>
    </aside>
  )
}
