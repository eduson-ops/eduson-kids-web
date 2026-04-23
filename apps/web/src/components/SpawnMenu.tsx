import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  isEditMode,
  subscribeEditMode,
  getPlacement,
  setPlacement,
  subscribePlacement,
  getActiveTool,
  setActiveTool,
  subscribeActiveTool,
  getToolColor,
  setToolColor,
  type ActiveTool,
} from '../lib/playEditMode'
import {
  CATALOG,
  searchItems,
  findItem,
  type CatalogItem,
} from '../lib/spawnCatalog'
import type { PropKind } from '../lib/worldEdits'
import {
  getPrefs,
  subscribePrefs,
  toggleFavorite,
  markRecent,
  isFavorite,
} from '../lib/spawnPrefs'
import { doUndo, canUndo, resetWorldEdits, subscribeEdits } from '../lib/worldEdits'
import { SFX } from '../lib/audio'

function highlight(text: string, q: string): ReactNode {
  if (!q.trim()) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase().trim())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="spawn-hl">{text.slice(idx, idx + q.trim().length)}</mark>
      {text.slice(idx + q.trim().length)}
    </>
  )
}

type TopTab = 'spawn' | 'tools'

interface ToolDef {
  id: ActiveTool
  label: string
  emoji: string
  hint: string
}
const TOOLS: ToolDef[] = [
  { id: 'paint', emoji: '🎨', label: 'Кисть', hint: 'Клик по объекту красит его выбранным цветом' },
  { id: 'remove', emoji: '🗑', label: 'Удалятель', hint: 'Клик по объекту мгновенно скрывает его' },
]

const TOOL_COLORS: { hex: string; name: string }[] = [
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

interface SpawnMenuProps {
  worldId: string
}

/**
 * SpawnMenu — полноэкранное Q-меню спавна (GMod-inspired).
 *
 * Hotkey: Q (toggle) — работает когда Edit-режим активен.
 * Структура: сайдбар категорий слева · поиск сверху · grid справа ·
 * блоки «Избранное» и «Недавние» над сеткой.
 *
 * Клик по пропсу → placement-mode (см. UniversalClickCatcher). Ребёнок
 * закрывает меню (Esc / Q / клик-вне) и кликает в мир → объект появляется.
 */
export default function SpawnMenu({ worldId }: SpawnMenuProps) {
  const [edit, setEdit] = useState(isEditMode())
  const [open, setOpen] = useState(false)
  const [topTab, setTopTab] = useState<TopTab>('spawn')
  const [activeCat, setActiveCat] = useState<string>('favs')
  const [query, setQuery] = useState('')
  const [placement, setPlacementLocal] = useState(getPlacement())
  const [tool, setTool] = useState<ActiveTool>(getActiveTool())
  const [toolColor, setToolColorLocal] = useState(getToolColor())
  const [prefs, setPrefs] = useState(getPrefs())
  const [undoAvail, setUndoAvail] = useState(canUndo())
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => subscribeEditMode(setEdit), [])
  useEffect(() => subscribePlacement(setPlacementLocal), [])
  useEffect(() => subscribeActiveTool(setTool), [])
  useEffect(() => subscribePrefs(() => setPrefs(getPrefs())), [])
  useEffect(() => subscribeEdits(() => setUndoAvail(canUndo())), [])

  // Q / Esc hotkey
  useEffect(() => {
    if (!edit) {
      setOpen(false)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
      if (e.key === 'q' || e.key === 'Q') {
        if (isTyping) return
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') {
        if (open) { e.stopImmediatePropagation(); setOpen(false) }
        else if (placement) { e.stopImmediatePropagation(); setPlacement(null) }
        else if (tool) { e.stopImmediatePropagation(); setActiveTool(null) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [edit, open, placement, tool])

  // ВСЕ хуки должны вызываться ДО любого early-return — правило React.
  const searchResults = useMemo(() => searchItems(query), [query])

  if (!edit) return null

  const pickItem = (item: CatalogItem) => {
    SFX.click()
    markRecent(item.kind)
    if (placement?.kind === item.kind) {
      setPlacement(null)
    } else {
      setPlacement({ kind: item.kind, color: item.defaultColor })
    }
    setOpen(false)
  }

  const favItems: CatalogItem[] = prefs.favorites
    .map((k) => findItem(k))
    .filter((x): x is CatalogItem => Boolean(x))
  const recentItems: CatalogItem[] = prefs.recent
    .map((k) => findItem(k))
    .filter((x): x is CatalogItem => Boolean(x))

  const gridItems: CatalogItem[] =
    query.trim()
      ? searchResults
      : activeCat === 'favs'
        ? favItems
        : activeCat === 'recent'
          ? recentItems
          : CATALOG.find((c) => c.id === activeCat)?.items ?? []

  const toolInfo = TOOLS.find((t) => t.id === tool)

  return (
    <>
      {/* Floating toggle — чтобы открыть меню без клавиатуры */}
      <button
        className={`spawn-q-btn ${open ? 'active' : ''} ${placement || tool ? 'placement' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Меню спавна (Q)"
      >
        {tool ? toolInfo?.emoji : placement ? '📍' : '🎨'} <kbd>Q</kbd>
      </button>

      {/* Placement hint */}
      {placement && !open && (
        <div className="spawn-placement-hint">
          <span>📍 Кликни в мир чтобы поставить <b>{findItem(placement.kind as PropKind)?.label ?? placement.kind}</b>.
          Esc — отмена · Q — другой объект</span>
          <div className="spawn-hint-colors">
            {TOOL_COLORS.map(({ hex, name }) => (
              <button
                key={hex}
                className="spawn-hint-swatch"
                style={{ background: hex, outline: placement.color === hex ? '2px solid #fff' : '2px solid transparent' }}
                onClick={() => setPlacement({ ...placement, color: hex })}
                aria-label={name}
                title={name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active tool hint (GMod-style toolgun HUD) */}
      {tool && !open && (
        <div className="spawn-placement-hint tool-hint">
          {toolInfo?.emoji} <b>{toolInfo?.label}</b> · {toolInfo?.hint}
          {tool === 'paint' && (
            <span className="tool-hint-swatch" style={{ background: toolColor }} />
          )}
          <button
            className="tool-hint-exit"
            onClick={() => setActiveTool(null)}
            title="Выключить инструмент (Esc)"
          >
            ×
          </button>
        </div>
      )}

      {open && (
        <>
          <div
            className="spawn-menu-backdrop"
            onClick={() => setOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Закрыть меню спавна"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(false) }}
          />
          <div className="spawn-menu" onClick={(e) => e.stopPropagation()}>
            <header className="spawn-menu-head">
              <nav className="spawn-menu-tabs">
                <button
                  className={`spawn-menu-tab ${topTab === 'spawn' ? 'active' : ''}`}
                  onClick={() => setTopTab('spawn')}
                >
                  🎨 Спавн
                </button>
                <button
                  className={`spawn-menu-tab ${topTab === 'tools' ? 'active' : ''}`}
                  onClick={() => setTopTab('tools')}
                >
                  🔧 Инструменты
                </button>
              </nav>
              {topTab === 'spawn' && (
                <input
                  type="text"
                  className="spawn-menu-search"
                  placeholder="🔍 Поиск: дерево, npc, монета…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
              )}
              {topTab === 'tools' && <div style={{ flex: 1 }} />}
              <button className="spawn-menu-close" onClick={() => setOpen(false)}>
                × <kbd>Esc</kbd>
              </button>
            </header>

            {/* ── Tools tab ── */}
            {topTab === 'tools' && (
              <div className="tools-tab">
                <section className="tools-section">
                  <h4>🎯 Активный инструмент</h4>
                  <div className="tools-grid">
                    {TOOLS.map((t) => (
                      <button
                        key={t.id}
                        className={`tools-card ${tool === t.id ? 'active' : ''}`}
                        onClick={() => {
                          SFX.click()
                          setActiveTool(t.id)
                          setOpen(false)
                        }}
                      >
                        <span className="tools-card-emoji">{t.emoji}</span>
                        <span className="tools-card-label">{t.label}</span>
                        <small className="tools-card-hint">{t.hint}</small>
                      </button>
                    ))}
                  </div>
                  {tool && (
                    <div className="tools-deactivate">
                      Выбран: <b>{toolInfo?.label}</b>{' '}
                      <button onClick={() => setActiveTool(null)}>Выключить</button>
                    </div>
                  )}
                </section>

                {tool === 'paint' && (
                  <section className="tools-section">
                    <h4>🎨 Цвет кисти</h4>
                    <div className="tools-colors">
                      {TOOL_COLORS.map(({ hex, name }) => (
                        <button
                          key={hex}
                          className={`tools-swatch ${toolColor === hex ? 'active' : ''}`}
                          style={{ background: hex }}
                          onClick={() => { setToolColor(hex); setToolColorLocal(hex); SFX.click() }}
                          aria-label={name}
                          title={name}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section className="tools-section">
                  <h4>⏪ Действия</h4>
                  <div className="tools-row">
                    <button
                      className="tools-action"
                      disabled={!undoAvail}
                      onClick={() => { doUndo(); SFX.click() }}
                    >
                      ↩ Отменить последнее
                    </button>
                    {!confirmReset ? (
                      <button className="tools-action danger" onClick={() => setConfirmReset(true)}>
                        💥 Обнулить карту
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12 }}>Удалить все правки?</span>
                        <button className="tools-action danger" onClick={() => { resetWorldEdits(worldId); SFX.click(); location.reload() }}>Да</button>
                        <button className="tools-action" onClick={() => setConfirmReset(false)}>Нет</button>
                      </div>
                    )}
                  </div>
                </section>

                <section className="tools-section tools-info">
                  <h4>💡 Как пользоваться</h4>
                  <ul>
                    <li>Выбери инструмент → закрой меню → кликай в мир</li>
                    <li><kbd>Esc</kbd> — выключить текущий инструмент</li>
                    <li><kbd>Q</kbd> — открыть/закрыть это меню</li>
                    <li>Все правки <b>сохраняются</b> между сессиями</li>
                  </ul>
                </section>
              </div>
            )}

            {/* ── Spawn tab ── */}
            {topTab === 'spawn' && (
            <div className="spawn-menu-body">
              {/* Sidebar */}
              <nav className="spawn-menu-sidebar">
                <button
                  className={`spawn-menu-cat ${activeCat === 'favs' && !query ? 'active' : ''}`}
                  onClick={() => { setQuery(''); setActiveCat('favs') }}
                >
                  <span>⭐</span><span>Избранное</span>
                  {favItems.length > 0 && <small>{favItems.length}</small>}
                </button>
                <button
                  className={`spawn-menu-cat ${activeCat === 'recent' && !query ? 'active' : ''}`}
                  onClick={() => { setQuery(''); setActiveCat('recent') }}
                >
                  <span>🕘</span><span>Недавние</span>
                  {recentItems.length > 0 && <small>{recentItems.length}</small>}
                </button>
                <hr className="spawn-menu-sep" />
                {CATALOG.map((c) => (
                  <button
                    key={c.id}
                    className={`spawn-menu-cat ${activeCat === c.id && !query ? 'active' : ''}`}
                    onClick={() => { setQuery(''); setActiveCat(c.id) }}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                    <small>{c.items.length}</small>
                  </button>
                ))}
              </nav>

              {/* Main grid */}
              <section className="spawn-menu-main">
                {query.trim() && (
                  <div className="spawn-menu-headline">
                    🔍 Результаты поиска «{query}» · {searchResults.length} найдено
                  </div>
                )}
                {!query.trim() && activeCat !== 'favs' && activeCat !== 'recent' && recentItems.length > 0 && (
                  <div className="spawn-quick-row">
                    <span className="spawn-quick-label">Недавние:</span>
                    {recentItems.slice(0, 6).map((item) => (
                      <button
                        key={item.kind}
                        className={`spawn-quick-chip ${placement?.kind === item.kind ? 'active' : ''}`}
                        onClick={() => pickItem(item)}
                        title={item.label}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!query.trim() && activeCat === 'favs' && favItems.length === 0 && (
                  <div className="spawn-menu-empty">
                    Пока пусто. Нажми ⭐ на любом пропсе чтобы добавить в избранное.
                  </div>
                )}
                {!query.trim() && activeCat === 'recent' && recentItems.length === 0 && (
                  <div className="spawn-menu-empty">
                    Ты ещё не спавнил ничего. Выбери категорию слева.
                  </div>
                )}

                <div className="spawn-menu-grid">
                  {gridItems.map((item) => {
                    const fav = isFavorite(item.kind)
                    const active = placement?.kind === item.kind
                    return (
                      <button
                        key={item.kind}
                        className={`spawn-menu-card ${active ? 'active' : ''}`}
                        onClick={() => pickItem(item)}
                        title={item.hint}
                      >
                        <button
                          className="spawn-menu-fav"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item.kind) }}
                          title={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
                          aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                        >
                          {fav ? '⭐' : '☆'}
                        </button>
                        <span className="spawn-menu-emoji">{item.emoji}</span>
                        <span className="spawn-menu-label">{highlight(item.label, query)}</span>
                        {item.hint && <small className="spawn-menu-hint">{item.hint}</small>}
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
            )}

            <footer className="spawn-menu-foot">
              <span><kbd>Q</kbd> открыть/закрыть</span>
              <span><kbd>Esc</kbd> отмена</span>
              <span>Клик → выбор · <kbd>★</kbd> в избранное</span>
            </footer>
          </div>
        </>
      )}
    </>
  )
}
