import type { EditorState, MaterialType } from './editorState'
import {
  PALETTE_COLORS,
  SCENE_PRESETS,
  deletePart,
  duplicatePart,
  setLightingPreset,
  updatePart,
} from './editorState'

interface Props {
  state: EditorState
}

const MATERIALS: Array<[MaterialType, string]> = [
  ['plastic', 'Пластик'],
  ['metal', 'Металл'],
  ['wood', 'Дерево'],
  ['grass', 'Трава'],
  ['stone', 'Камень'],
  ['neon', 'Неон'],
]

export default function PropertiesPanel({ state }: Props) {
  const selected = state.parts.find((p) => p.id === state.selectedId) ?? null

  return (
    <aside className="studio-props">
      {selected ? (
        <>
          <section>
            <div className="prop-header">
              <input
                className="prop-name"
                value={selected.name}
                onChange={(e) => updatePart(selected.id, { name: e.target.value })}
              />
              <span className="prop-type">{selected.type}</span>
            </div>
            <div className="prop-actions">
              <button onClick={() => duplicatePart(selected.id)}>Дублировать</button>
              <button className="ghost danger" onClick={() => deletePart(selected.id)}>
                Удалить
              </button>
            </div>
          </section>

          <section>
            <h4>Позиция</h4>
            <div className="prop-xyz">
              {(['x', 'y', 'z'] as const).map((axis, i) => (
                <label key={axis}>
                  <span>{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step={0.5}
                    value={selected.position[i]}
                    onChange={(e) => {
                      const pos = [...selected.position] as [number, number, number]
                      pos[i] = parseFloat(e.target.value) || 0
                      updatePart(selected.id, { position: pos })
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4>Размер</h4>
            <div className="prop-xyz">
              {(['w', 'h', 'd'] as const).map((axis, i) => (
                <label key={axis}>
                  <span>{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step={0.5}
                    min={0.1}
                    value={selected.scale[i]}
                    onChange={(e) => {
                      const s = [...selected.scale] as [number, number, number]
                      s[i] = Math.max(0.1, parseFloat(e.target.value) || 1)
                      updatePart(selected.id, { scale: s })
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4>Цвет</h4>
            <div className="color-palette sm">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`palette-swatch ${selected.color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => updatePart(selected.id, { color: c })}
                />
              ))}
              <label className="palette-custom">
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => updatePart(selected.id, { color: e.target.value })}
                />
              </label>
            </div>
          </section>

          <section>
            <h4>Материал</h4>
            <div className="pill-group">
              {MATERIALS.map(([m, label]) => (
                <button
                  key={m}
                  className={`pill ${selected.material === m ? 'active' : ''}`}
                  onClick={() => updatePart(selected.id, { material: m })}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="prop-check">
              <input
                type="checkbox"
                checked={selected.anchored}
                onChange={(e) => updatePart(selected.id, { anchored: e.target.checked })}
              />
              <span>Закрепить (не падает)</span>
            </label>
          </section>
        </>
      ) : (
        <>
          <section>
            <h4>Сцена</h4>
            <div className="pill-group">
              {(Object.keys(SCENE_PRESETS) as Array<keyof typeof SCENE_PRESETS>).map((k) => (
                <button
                  key={k}
                  className={`pill ${state.scene.lighting === k ? 'active' : ''}`}
                  onClick={() => setLightingPreset(k)}
                >
                  {lightingLabel(k)}
                </button>
              ))}
            </div>
          </section>

          <section className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Выбери объект кликом по нему, чтобы изменить.</p>
            <p>Или <strong>«Поставить»</strong> в палитре слева → <strong>клик по земле</strong> — появится новый блок.</p>
          </section>

          <section>
            <h4>Всё в сцене</h4>
            <ul className="scene-list">
              {state.parts.map((p) => (
                <li key={p.id}>
                  <span className="scene-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </aside>
  )
}

function lightingLabel(p: string): string {
  return (
    {
      day: '☀️ День',
      evening: '🌇 Вечер',
      night: '🌙 Ночь',
      cloudy: '☁️ Облачно',
      space: '🚀 Космос',
    } as Record<string, string>
  )[p] ?? p
}
