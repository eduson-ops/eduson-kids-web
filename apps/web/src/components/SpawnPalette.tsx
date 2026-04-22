import { useEffect, useState } from 'react'
import {
  getPlacement,
  subscribePlacement,
  setPlacement,
  isEditMode,
  subscribeEditMode,
} from '../lib/playEditMode'
import type { PropKind } from '../lib/worldEdits'
import { SFX } from '../lib/audio'

/**
 * SpawnPalette — плавающая палитра спавна «в стиле Garry's Mod».
 * Видна только в Edit-режиме. Клик по элементу → курсор становится «призраком»,
 * следующий клик по миру = размещение объекта.
 *
 * Категории:
 *   🧱 Блоки      — куб / сфера / цилиндр
 *   💎 Коллекция   — монета
 *   🌳 Природа    — дерево / куст / гриб / камень
 *   🧑 Персонажи  — 4 GLTF-монстра
 *   💡 Свет       — точка света / факел
 */

interface PaletteItem {
  kind: PropKind
  emoji: string
  label: string
  defaultColor: string
}

const CATEGORIES: Array<{ name: string; items: PaletteItem[] }> = [
  {
    name: '🧱 Блоки',
    items: [
      { kind: 'cube', emoji: '🟫', label: 'Куб', defaultColor: '#FFD43C' },
      { kind: 'sphere', emoji: '🟤', label: 'Шар', defaultColor: '#FF9454' },
      { kind: 'cylinder', emoji: '⬛', label: 'Столб', defaultColor: '#6B5CE7' },
    ],
  },
  {
    name: '💎 Коллекция',
    items: [
      { kind: 'coin', emoji: '💰', label: 'Монета', defaultColor: '#FFD43C' },
    ],
  },
  {
    name: '🌳 Природа',
    items: [
      { kind: 'tree', emoji: '🌳', label: 'Дерево', defaultColor: '#34C38A' },
      { kind: 'bush', emoji: '🌿', label: 'Куст', defaultColor: '#48c774' },
      { kind: 'mushroom', emoji: '🍄', label: 'Гриб', defaultColor: '#ff5464' },
      { kind: 'rock', emoji: '🪨', label: 'Камень', defaultColor: '#8b8b8b' },
    ],
  },
  {
    name: '🧑 Персонажи',
    items: [
      { kind: 'npc-bunny', emoji: '🐰', label: 'Кролик', defaultColor: '#ffd1e8' },
      { kind: 'npc-alien', emoji: '👽', label: 'Алиен', defaultColor: '#c879ff' },
      { kind: 'npc-cactoro', emoji: '🌵', label: 'Кактор', defaultColor: '#5ba55b' },
      { kind: 'npc-birb', emoji: '🐦', label: 'Птичка', defaultColor: '#ffd644' },
    ],
  },
  {
    name: '💡 Свет',
    items: [
      { kind: 'light', emoji: '💡', label: 'Лампа', defaultColor: '#fff3d8' },
      { kind: 'torch', emoji: '🔥', label: 'Факел', defaultColor: '#ff9454' },
    ],
  },
  {
    name: '✈️ Транспорт',
    items: [
      { kind: 'airplane', emoji: '✈️', label: 'Самолёт', defaultColor: '#88d4ff' },
      { kind: 'boat', emoji: '⛵', label: 'Лодка', defaultColor: '#ff8c1a' },
      { kind: 'train', emoji: '🚂', label: 'Поезд', defaultColor: '#e53' },
    ],
  },
  {
    name: '🛝 Площадка',
    items: [
      { kind: 'swing', emoji: '🪁', label: 'Качели', defaultColor: '#4c97ff' },
      { kind: 'slide', emoji: '🛝', label: 'Горка', defaultColor: '#ff5464' },
      { kind: 'seesaw', emoji: '⚖️', label: 'Качалка', defaultColor: '#48c774' },
    ],
  },
  {
    name: '🪐 Космос',
    items: [
      { kind: 'planet', emoji: '🪐', label: 'Планета', defaultColor: '#a855f7' },
      { kind: 'asteroid', emoji: '☄️', label: 'Астероид', defaultColor: '#8b8b8b' },
      { kind: 'space-station', emoji: '🛸', label: 'Станция', defaultColor: '#c0c0c0' },
    ],
  },
  {
    name: '📚 Школа',
    items: [
      { kind: 'book-stack', emoji: '📚', label: 'Книги', defaultColor: '#FF9454' },
      { kind: 'globe', emoji: '🌍', label: 'Глобус', defaultColor: '#4c97ff' },
      { kind: 'microscope', emoji: '🔬', label: 'Микроскоп', defaultColor: '#6B5CE7' },
    ],
  },
  {
    name: '⚔️ Рыцари',
    items: [
      { kind: 'sword', emoji: '⚔️', label: 'Меч', defaultColor: '#c0c0c0' },
      { kind: 'shield', emoji: '🛡️', label: 'Щит', defaultColor: '#8b5a2b' },
      { kind: 'knight-statue', emoji: '🏰', label: 'Рыцарь', defaultColor: '#8b8b8b' },
    ],
  },
]

export default function SpawnPalette() {
  const [edit, setEdit] = useState(isEditMode())
  const [placement, setPlacementLocal] = useState(getPlacement())
  const [open, setOpen] = useState(true)
  const [activeCat, setActiveCat] = useState(0)

  useEffect(() => subscribeEditMode(setEdit), [])
  useEffect(() => subscribePlacement(setPlacementLocal), [])

  // Esc отменяет placement
  useEffect(() => {
    if (!placement) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlacement(null)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [placement])

  if (!edit) return null

  const pickItem = (item: PaletteItem) => {
    SFX.click()
    if (placement?.kind === item.kind) {
      setPlacement(null)
    } else {
      setPlacement({ kind: item.kind, color: item.defaultColor })
    }
  }

  const cat = CATEGORIES[activeCat]

  return (
    <>
      {placement && (
        <div className="spawn-placement-hint">
          📍 Кликни в мир чтобы поставить <b>{placement.kind}</b>. Esc — отмена.
        </div>
      )}
      <aside className={`spawn-palette ${open ? 'open' : 'closed'}`}>
        <header className="spawn-palette-head">
          <button className="spawn-palette-toggle" onClick={() => setOpen((v) => !v)}>
            {open ? '◀' : '▶'}
          </button>
          {open && <strong>🎨 Спавнер</strong>}
        </header>

        {open && (
          <>
            <nav className="spawn-cats">
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.name}
                  className={`spawn-cat ${activeCat === i ? 'active' : ''}`}
                  onClick={() => setActiveCat(i)}
                  title={c.name}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </nav>
            <div className="spawn-grid">
              {cat.items.map((item) => (
                <button
                  key={item.kind}
                  className={`spawn-item ${placement?.kind === item.kind ? 'active' : ''}`}
                  onClick={() => pickItem(item)}
                  title={item.label}
                >
                  <span className="spawn-item-emoji">{item.emoji}</span>
                  <span className="spawn-item-label">{item.label}</span>
                </button>
              ))}
            </div>
            <footer className="spawn-palette-foot">
              <small>Клик → курсор → клик в мир</small>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
