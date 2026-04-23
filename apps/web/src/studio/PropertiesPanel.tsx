import { useState } from 'react'
import type { EditorState, MaterialType } from './editorState'
import {
  SCENE_PRESETS,
  deletePart,
  duplicatePart,
  selectPart,
  setLightingPreset,
  updatePart,
} from './editorState'
import ObjectScriptEditor from '../components/ObjectScriptEditor'
import { pluralize } from '../lib/plural'

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

const QUICK_COLORS = [
  '#ff5464', '#ffd644', '#48c774', '#4c97ff', '#c879ff',
  '#ff8c1a', '#ff5ab1', '#88d4ff', '#ffffff', '#2a3340',
  '#6B5CE7', '#FFD43C', '#9FE8C7', '#FFB4C8', '#A9D8FF',
]

export default function PropertiesPanel({ state }: Props) {
  const selected = state.parts.find((p) => p.id === state.selectedId) ?? null
  const [editingScriptFor, setEditingScriptFor] = useState<string | null>(null)
  const editingPart = editingScriptFor ? state.parts.find((p) => p.id === editingScriptFor) : null

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
              {selected.scripts && <span className="prop-script-badge" title="У объекта есть скрипт">⚡</span>}
            </div>
            <div className="prop-actions">
              <button onClick={() => duplicatePart(selected.id)}>Дублировать</button>
              <button className="ghost danger" onClick={() => deletePart(selected.id)}>
                Удалить
              </button>
            </div>
          </section>

          {/* ── Per-object scripting — ключевая фишка ── */}
          <section className="prop-script-section">
            <h4>📜 Скрипт объекта</h4>
            {selected.scripts ? (
              <>
                <div className="prop-script-summary">
                  <span className="prop-script-dot" />
                  <span>Скрипт готов · {pluralize(countEvents(selected.scripts.python), 'event')}</span>
                </div>
                <div className="prop-script-actions">
                  <button className="kb-btn kb-btn--sm" onClick={() => setEditingScriptFor(selected.id)}>
                    ✏ Редактировать
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="prop-script-hint">
                  Добавь поведение прямо этому объекту: реакция на касание, на старт сцены, на сигнал.
                </p>
                <button
                  className="kb-btn kb-btn--sm prop-script-add"
                  onClick={() => setEditingScriptFor(selected.id)}
                >
                  ⚡ Добавить скрипт
                </button>
              </>
            )}
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
            <h4>Поворот (°)</h4>
            <div className="prop-xyz">
              {(['x', 'y', 'z'] as const).map((axis, i) => (
                <label key={axis}>
                  <span>{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step={15}
                    value={Math.round((selected.rotation[i] * 180) / Math.PI)}
                    onChange={(e) => {
                      const rot = [...selected.rotation] as [number, number, number]
                      rot[i] = ((parseFloat(e.target.value) || 0) * Math.PI) / 180
                      updatePart(selected.id, { rotation: rot })
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4>Цвет</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  title={c}
                  style={{
                    width: 24, height: 24, borderRadius: 6, background: c, border: 'none', cursor: 'pointer',
                    outline: selected.color === c ? '2px solid var(--violet)' : '2px solid transparent',
                    outlineOffset: 1,
                  }}
                  onClick={() => updatePart(selected.id, { color: c })}
                />
              ))}
              <label title="Произвольный цвет" style={{ cursor: 'pointer' }}>
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => updatePart(selected.id, { color: e.target.value })}
                  style={{ width: 24, height: 24, border: 'none', borderRadius: 6, padding: 0, cursor: 'pointer' }}
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
                <li
                  key={p.id}
                  className={`${p.scripts ? 'has-script' : ''} ${state.selectedId === p.id ? 'selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectPart(p.id)}
                >
                  <span className="scene-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                  {p.scripts && <span className="scene-item-badge" title="Запрограммирован">⚡</span>}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {editingPart && (
        <ObjectScriptEditor
          target={{ scope: 'part', part: editingPart }}
          onClose={() => setEditingScriptFor(null)}
        />
      )}
    </aside>
  )
}

/** Посчитать число hat-событий (для бейджа «N событий»). */
function countEvents(python: string): number {
  const matches = python.match(/^def (on_\w+)\(/gm)
  return matches ? matches.length : 0
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
