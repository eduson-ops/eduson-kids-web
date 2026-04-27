/**
 * Build-mode store — игровой режим стройки а-ля Fortnite (TPS с 4 типами частей,
 * grid-snap, ghost preview, инвентарь материалов).
 *
 * Живёт параллельно editorState, потому что это GAMEPLAY-слой поверх Test/Play.
 * Подписка через event-emitter pattern.
 */

export type BuildPieceKind = 'wall' | 'floor' | 'ramp' | 'roof'

export const BUILD_PIECES: Array<{ kind: BuildPieceKind; label: string; emoji: string; hotkey: string }> = [
  { kind: 'wall',  label: 'Стена',  emoji: '🧱', hotkey: '1' },
  { kind: 'floor', label: 'Пол',    emoji: '⬛', hotkey: '2' },
  { kind: 'ramp',  label: 'Рампа',  emoji: '📐', hotkey: '3' },
  { kind: 'roof',  label: 'Крыша',  emoji: '🔺', hotkey: '4' },
]

export interface BuildModeState {
  /** Режим стройки включён — показывается ghost-preview, блокируется обычный click */
  active: boolean
  /** Какая деталь в руке сейчас */
  selectedKind: BuildPieceKind
  /** Текущий цвет ставимой детали */
  color: string
  /** Инвентарь: сколько каждой детали получено «пикапом» (ПКМ по блоку) */
  inventory: Record<BuildPieceKind, number>
  /** Общий счётчик поставленных блоков в build-режиме — статистика */
  placedTotal: number
}

let state: BuildModeState = {
  active: false,
  selectedKind: 'wall',
  color: '#ffd644',
  inventory: { wall: 0, floor: 0, ramp: 0, roof: 0 },
  placedTotal: 0,
}

const listeners = new Set<(s: BuildModeState) => void>()

export function getBuildState(): BuildModeState {
  return state
}

export function subscribeBuild(fn: (s: BuildModeState) => void): () => void {
  listeners.add(fn)
  fn(state)
  return () => listeners.delete(fn)
}

function emit() {
  for (const fn of listeners) fn(state)
}

export function setBuildActive(active: boolean) {
  if (state.active === active) return
  state = { ...state, active }
  emit()
}

export function toggleBuild() {
  setBuildActive(!state.active)
}

export function setSelectedKind(kind: BuildPieceKind) {
  state = { ...state, selectedKind: kind }
  emit()
}

export function setBuildColor(c: string) {
  state = { ...state, color: c }
  emit()
}

export function harvestPiece(kind: BuildPieceKind) {
  state = {
    ...state,
    inventory: { ...state.inventory, [kind]: state.inventory[kind] + 1 },
  }
  emit()
}

export function onPlacePiece(_kind: BuildPieceKind) {
  // В MVP строим без расхода инвентаря — у детей мотивация важнее лимитов.
  // Если в инвентаре есть — показываем инкремент «расхода», иначе просто
  // прибавляем к счётчику поставленных.
  state = {
    ...state,
    placedTotal: state.placedTotal + 1,
  }
  emit()
}

/** Снап координаты к сетке build-режима (по умолчанию 2 ед.) */
export const BUILD_GRID = 2
export function snapToGrid(v: number): number {
  return Math.round(v / BUILD_GRID) * BUILD_GRID
}

/** Габариты детали в мире (в метрах) — для ghost и коллайдера */
export function pieceSize(kind: BuildPieceKind): [number, number, number] {
  switch (kind) {
    case 'wall':  return [BUILD_GRID, BUILD_GRID * 1.5, 0.2]
    case 'floor': return [BUILD_GRID, 0.2, BUILD_GRID]
    case 'ramp':  return [BUILD_GRID, BUILD_GRID * 0.8, BUILD_GRID]
    case 'roof':  return [BUILD_GRID, BUILD_GRID * 0.8, BUILD_GRID]
  }
}
