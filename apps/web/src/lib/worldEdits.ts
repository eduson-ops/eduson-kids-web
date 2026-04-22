/**
 * worldEdits — стор правок мира в Play-режиме.
 *
 * Три вида модификаций (все persist в localStorage):
 *   1. Additions  — кубы/коины/NPC/деревья/лампы, добавленные ребёнком через Spawn-палитру
 *   2. Removed    — набор position-hash мешей, которые ребёнок убрал с карты
 *   3. Recolored  — map position-hash → hex-цвет, для перекрашенных мешей
 *
 * Идентификация мешей по «position-hash» — округлённая до 0.5м позиция меша
 * при первом рендере сцены. Это стабильнее UUID (они регенерятся на reload)
 * и достаточно уникально для объектов которые не двигаются.
 */

export type PropKind =
  // Blocks
  | 'cube' | 'sphere' | 'cylinder' | 'ramp' | 'plate'
  // Gameplay
  | 'coin' | 'checkpoint' | 'goal' | 'spike' | 'bouncer'
  // Platformer collectibles (Kenney)
  | 'chest' | 'key' | 'star' | 'heart' | 'bomb' | 'barrel' | 'crate' | 'ladder' | 'tree-pine' | 'flag-platformer'
  // Nature
  | 'tree' | 'bush' | 'mushroom' | 'rock' | 'flower' | 'grass-tuft'
  // NPCs
  | 'npc-bunny' | 'npc-alien' | 'npc-cactoro' | 'npc-birb' | 'npc-bluedemon'
  // Lights
  | 'light' | 'torch' | 'neon-sign'
  // Decor (Kenney)
  | 'building' | 'car' | 'pumpkin' | 'coffin' | 'candle'
  // Procedural mechanics
  | 'speed-pad' | 'portal' | 'crystal' | 'campfire' | 'sign' | 'stair-step'
  // Architecture
  | 'arch' | 'fence' | 'bench' | 'flower-pot' | 'halfpipe'
  // Special
  | 'windmill' | 'snowman' | 'satellite-dish'
  // Food
  | 'cake' | 'donut' | 'ice-cream'
  // Sci-fi
  | 'rocket' | 'robot' | 'ufo'
  // Fantasy
  | 'castle-tower' | 'magic-orb' | 'throne'
  // Music
  | 'guitar' | 'piano' | 'drum-kit'
  // Sports
  | 'soccer-ball' | 'trophy' | 'goal-net'
  // Animals
  | 'duck' | 'cat-statue' | 'fish-tank'
  // Household
  | 'table' | 'bookshelf' | 'lamp-floor'
  // Transportation
  | 'airplane' | 'boat' | 'train'
  // Playground
  | 'swing' | 'slide' | 'seesaw'
  // Space
  | 'planet' | 'asteroid' | 'space-station'
  // School
  | 'book-stack' | 'globe' | 'microscope'
  // Medieval
  | 'sword' | 'shield' | 'knight-statue'

export interface SpawnedPart {
  id: string
  worldId: string
  pos: [number, number, number]
  color: string
  size: number
  kind: PropKind
}

interface StoreShape {
  additions: SpawnedPart[]
  removed: Record<string, string[]>          // worldId -> array of position hashes
  recolored: Record<string, Record<string, string>>  // worldId -> { posHash: hex }
}

const STORAGE_KEY = 'ek_world_edits_v2'
const listeners = new Set<() => void>()

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoreShape>
      return {
        additions: parsed.additions ?? [],
        removed: parsed.removed ?? {},
        recolored: parsed.recolored ?? {},
      }
    }
  } catch {
    /* ignore */
  }
  return { additions: [], removed: {}, recolored: {} }
}

let state: StoreShape = load()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota */ }
}
function emit() { for (const l of listeners) l() }

export function subscribeEdits(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** Округляем до 0.5 юнита — совпадает с Spawn-палитрой и makeObjectIdFromPos. */
export function hashPos(p: [number, number, number]): string {
  const r = (n: number) => Math.round(n * 2) / 2
  return `${r(p[0])}|${r(p[1])}|${r(p[2])}`
}

// ─── Additions ────────────────────────────────────────────
export function getAdditionsForWorld(worldId: string): SpawnedPart[] {
  return state.additions.filter((s) => s.worldId === worldId)
}
export function addSpawnedPart(p: Omit<SpawnedPart, 'id'>): string {
  const id = `spawn_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  state = { ...state, additions: [...state.additions, { ...p, id }] }
  persist()
  emit()
  return id
}
export function removeSpawnedPart(id: string) {
  state = { ...state, additions: state.additions.filter((s) => s.id !== id) }
  persist()
  emit()
}

// ─── Removed ──────────────────────────────────────────────
export function getRemovedForWorld(worldId: string): Set<string> {
  return new Set(state.removed[worldId] ?? [])
}
export function addRemoved(worldId: string, posHash: string) {
  const list = state.removed[worldId] ?? []
  if (list.includes(posHash)) return
  state = { ...state, removed: { ...state.removed, [worldId]: [...list, posHash] } }
  persist()
  emit()
}
export function clearRemovedForWorld(worldId: string) {
  const next = { ...state.removed }
  delete next[worldId]
  state = { ...state, removed: next }
  persist()
  emit()
}

// ─── Recolored ────────────────────────────────────────────
export function getRecoloredForWorld(worldId: string): Record<string, string> {
  return state.recolored[worldId] ?? {}
}
export function setRecolor(worldId: string, posHash: string, hex: string) {
  const map = state.recolored[worldId] ?? {}
  state = {
    ...state,
    recolored: { ...state.recolored, [worldId]: { ...map, [posHash]: hex } },
  }
  persist()
  emit()
}
export function clearRecolorsForWorld(worldId: string) {
  const next = { ...state.recolored }
  delete next[worldId]
  state = { ...state, recolored: next }
  persist()
  emit()
}

// ─── Bulk reset ──────────────────────────────────────────
export function resetWorldEdits(worldId: string) {
  clearRemovedForWorld(worldId)
  clearRecolorsForWorld(worldId)
  state = { ...state, additions: state.additions.filter((s) => s.worldId !== worldId) }
  persist()
  emit()
}

// ─── Undo stack (паттерн GMod undo) ───────────────────────
// Простой in-memory стек последних операций. На reload сбрасывается —
// это не полноценная история, а защита от случайных кликов в Edit-режиме.
export type UndoOp =
  | { kind: 'add'; worldId: string; partId: string }
  | { kind: 'remove'; worldId: string; posHash: string }
  | { kind: 'recolor'; worldId: string; posHash: string; prevHex?: string }

const undoStack: UndoOp[] = []
const UNDO_LIMIT = 30

export function pushUndo(op: UndoOp) {
  undoStack.push(op)
  if (undoStack.length > UNDO_LIMIT) undoStack.shift()
}

export function canUndo(): boolean { return undoStack.length > 0 }

export function popUndo(): UndoOp | null {
  return undoStack.pop() ?? null
}

/** Применить reverse-операцию из стека. Возвращает true если что-то отменили. */
export function doUndo(): boolean {
  const op = popUndo()
  if (!op) return false
  switch (op.kind) {
    case 'add':
      state = { ...state, additions: state.additions.filter((s) => s.id !== op.partId) }
      break
    case 'remove': {
      const list = state.removed[op.worldId] ?? []
      state = {
        ...state,
        removed: { ...state.removed, [op.worldId]: list.filter((h) => h !== op.posHash) },
      }
      break
    }
    case 'recolor': {
      const map = { ...(state.recolored[op.worldId] ?? {}) }
      if (op.prevHex) map[op.posHash] = op.prevHex
      else delete map[op.posHash]
      state = { ...state, recolored: { ...state.recolored, [op.worldId]: map } }
      break
    }
  }
  persist()
  emit()
  return true
}

// Legacy alias
export const subscribeAdditions = subscribeEdits
