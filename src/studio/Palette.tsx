import {
  PALETTE_COLORS,
  setPlacingColor,
  setPlacingType,
  setTool,
  updatePart,
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
  { type: 'cube',   label: 'Блок',    emoji: '🟦' },
  { type: 'wall',   label: 'Стена',   emoji: '🧱' },
  { type: 'floor',  label: 'Пол',     emoji: '⬛' },
  { type: 'ramp',   label: 'Рампа',   emoji: '📐' },
  { type: 'roof',   label: 'Крыша',   emoji: '🔺' },
  { type: 'coin',   label: 'Монетка', emoji: '💰' },
  { type: 'finish', label: 'Финиш',   emoji: '🏁' },
  { type: 'spawn',  label: 'Спавн',   emoji: '📍' },
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

      {(() => {
        const selected = state.parts.find((p) => p.id === state.selectedId) ?? null
        const activeColor = selected ? selected.color : state.placingColor
        const setColor = (c: string) => {
          if (selected) {
            updatePart(selected.id, { color: c })
          }
          setPlacingColor(c)
        }
        return (
          <section>
            <div className="palette-color-head">
              <h4>Цвет</h4>
              <span className="palette-color-ctx">
                {selected ? `объект «${selected.name}»` : 'нового блока'}
              </span>
            </div>
            <div className="color-palette">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`palette-swatch ${activeColor === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
              <label className="palette-custom">
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
            </div>
          </section>
        )
      })()}

      <section className="hint-section">
        <h4>Как играть</h4>
        <ul className="hint-list">
          <li><kbd>V</kbd> выделить объект</li>
          <li><kbd>B</kbd> начать ставить</li>
          <li><kbd>Del</kbd> удалить выбранное</li>
          <li><kbd>Ctrl+D</kbd> дублировать</li>
          <li>ПКМ — крутить камеру</li>
          <li>⊙ колесо — зум камеры</li>
        </ul>
      </section>
    </aside>
  )
}
