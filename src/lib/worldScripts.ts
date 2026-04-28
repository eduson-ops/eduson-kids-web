import type { ObjectScript } from '../studio/editorState'

/**
 * worldScripts — стор скриптов, которые ребёнок привесил к объектам
 * на готовых картах (Play-режим). Ключ — `${worldId}:${objectId}`.
 *
 * Не пересекается с editorState (тот живёт для Studio). Сохраняется в
 * localStorage отдельным ключом `ek_world_scripts_v1`.
 */

type ScriptsMap = Record<string, ObjectScript>   // key = "worldId:objectId"

export const WORLD_SCRIPTS_KEY = 'ek_world_scripts_v1'
const listeners = new Set<() => void>()

function load(): ScriptsMap {
  try {
    const raw = localStorage.getItem(WORLD_SCRIPTS_KEY)
    return raw ? (JSON.parse(raw) as ScriptsMap) : {}
  } catch {
    return {}
  }
}

let state: ScriptsMap = load()

function persist() {
  try {
    localStorage.setItem(WORLD_SCRIPTS_KEY, JSON.stringify(state))
  } catch { /* quota */ }
}
function emit() { for (const l of listeners) l() }

export function subscribeWorldScripts(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

function key(worldId: string, objectId: string) {
  return `${worldId}:${objectId}`
}

export function getWorldScript(worldId: string, objectId: string): ObjectScript | undefined {
  return state[key(worldId, objectId)]
}

export function setWorldScript(worldId: string, objectId: string, script: ObjectScript | null) {
  const k = key(worldId, objectId)
  if (script === null) {
    if (!(k in state)) return
    const { [k]: _removed, ...rest } = state
    void _removed
    state = rest
  } else {
    state = { ...state, [k]: script }
  }
  persist()
  emit()
}

export function getAllScriptsForWorld(worldId: string): Array<{ objectId: string; script: ObjectScript }> {
  const prefix = worldId + ':'
  return Object.entries(state)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, script]) => ({ objectId: k.slice(prefix.length), script }))
}
