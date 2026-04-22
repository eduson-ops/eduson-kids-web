/**
 * spawnPrefs — избранное и недавние пропсы Q-меню.
 * Персиститься в localStorage.
 */
import type { PropKind } from './worldEdits'

const KEY = 'ek_spawn_prefs_v1'
const MAX_RECENT = 12

interface Shape {
  favorites: PropKind[]
  recent: PropKind[]
}

function load(): Shape {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Partial<Shape>
      return { favorites: p.favorites ?? [], recent: p.recent ?? [] }
    }
  } catch { /* ignore */ }
  return { favorites: [], recent: [] }
}

let state: Shape = load()
const listeners = new Set<() => void>()
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota */ } }
function emit() { for (const l of listeners) l() }

export function getPrefs(): Shape { return state }
export function subscribePrefs(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export function toggleFavorite(kind: PropKind) {
  const i = state.favorites.indexOf(kind)
  if (i >= 0) state = { ...state, favorites: state.favorites.filter((k) => k !== kind) }
  else state = { ...state, favorites: [...state.favorites, kind] }
  persist()
  emit()
}

export function markRecent(kind: PropKind) {
  const filtered = state.recent.filter((k) => k !== kind)
  state = { ...state, recent: [kind, ...filtered].slice(0, MAX_RECENT) }
  persist()
  emit()
}

export function isFavorite(kind: PropKind): boolean {
  return state.favorites.includes(kind)
}
