// Простой store для Studio editor — без zustand/redux, минимум зависимостей.
// Подписка через event-emitter pattern.

import { nanoid } from 'nanoid'

export type PartType = 'cube' | 'coin' | 'spawn' | 'finish'
export type MaterialType = 'plastic' | 'metal' | 'wood' | 'grass' | 'stone' | 'neon'

export interface PartObject {
  id: string
  type: PartType
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  color: string
  material: MaterialType
  anchored: boolean
  name: string
}

export type LightingPreset = 'day' | 'evening' | 'night' | 'cloudy' | 'space'

export interface SceneConfig {
  lighting: LightingPreset
  skyTop: string
  skyBottom: string
}

export interface EditorState {
  parts: PartObject[]
  selectedId: string | null
  scene: SceneConfig
  /** инструмент в палитре */
  tool: 'select' | 'place'
  /** какой тип ставится в режиме "place" */
  placingType: PartType
  /** цвет по умолчанию для place */
  placingColor: string
  /** Skript — Blockly workspace serialized */
  blocklyXml: string
  /** generated Lua code (read-only preview) */
  luaCode: string
}

const PALETTE_COLORS = [
  '#ff5ab1', '#ff5464', '#ff8c1a', '#ffd644',
  '#5ba55b', '#48c774', '#4c97ff', '#c879ff',
  '#2a3340', '#f0f0f0', '#8b5a2b', '#88d4ff',
]

const SCENE_PRESETS: Record<LightingPreset, SceneConfig> = {
  day: { lighting: 'day', skyTop: '#3d88ff', skyBottom: '#b8e1ff' },
  evening: { lighting: 'evening', skyTop: '#ff7a4d', skyBottom: '#ffc16a' },
  night: { lighting: 'night', skyTop: '#0a1128', skyBottom: '#324a7a' },
  cloudy: { lighting: 'cloudy', skyTop: '#7a8ba0', skyBottom: '#c8d3de' },
  space: { lighting: 'space', skyTop: '#05010f', skyBottom: '#1a0e3d' },
}

function defaultScene(): EditorState {
  return {
    parts: [
      // Начальная «площадка»
      {
        id: 'ground-0',
        type: 'cube',
        position: [0, -0.5, 0],
        scale: [16, 1, 16],
        rotation: [0, 0, 0],
        color: '#48c774',
        material: 'grass',
        anchored: true,
        name: 'Земля',
      },
      {
        id: 'spawn-0',
        type: 'spawn',
        position: [0, 0.1, 0],
        scale: [1, 0.2, 1],
        rotation: [0, 0, 0],
        color: '#ffd644',
        material: 'plastic',
        anchored: true,
        name: 'Точка старта',
      },
    ],
    selectedId: null,
    scene: SCENE_PRESETS.day,
    tool: 'select',
    placingType: 'cube',
    placingColor: PALETTE_COLORS[4],
    blocklyXml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_on_start" x="40" y="40"></block>
</xml>`,
    luaCode: '-- нажми "Play" чтобы запустить\n',
  }
}

type Listener = (state: EditorState) => void
const listeners = new Set<Listener>()

let state: EditorState = loadFromStorage() ?? defaultScene()

function loadFromStorage(): EditorState | null {
  try {
    const raw = localStorage.getItem('ek_studio_v1')
    if (!raw) return null
    const parsed = JSON.parse(raw) as EditorState
    // basic validation
    if (!Array.isArray(parsed.parts)) return null
    return parsed
  } catch {
    return null
  }
}

let saveTimer: number | undefined
function persist() {
  if (saveTimer) window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem('ek_studio_v1', JSON.stringify(state))
    } catch {
      /* quota exceeded */
    }
  }, 300)
}

function emit() {
  for (const l of listeners) l(state)
}

export function subscribe(l: Listener): () => void {
  listeners.add(l)
  l(state)
  return () => {
    listeners.delete(l)
  }
}

export function getState(): Readonly<EditorState> {
  return state
}

// ─── Actions ─────────────────────────────────────

export function addPart(p: Omit<PartObject, 'id' | 'name'>, name?: string): string {
  const id = nanoid(8)
  const part: PartObject = {
    ...p,
    id,
    name: name ?? `${p.type} ${state.parts.filter((x) => x.type === p.type).length + 1}`,
  }
  state = { ...state, parts: [...state.parts, part], selectedId: id }
  persist()
  emit()
  return id
}

export function updatePart(id: string, patch: Partial<PartObject>) {
  state = {
    ...state,
    parts: state.parts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }
  persist()
  emit()
}

export function deletePart(id: string) {
  if (id.startsWith('ground-') || id.startsWith('spawn-')) return // нельзя удалить базу
  state = {
    ...state,
    parts: state.parts.filter((p) => p.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  }
  persist()
  emit()
}

export function duplicatePart(id: string) {
  const p = state.parts.find((x) => x.id === id)
  if (!p) return
  const nid = nanoid(8)
  const newPart: PartObject = {
    ...p,
    id: nid,
    position: [p.position[0] + 2, p.position[1], p.position[2]],
    name: `${p.name} (копия)`,
  }
  state = { ...state, parts: [...state.parts, newPart], selectedId: nid }
  persist()
  emit()
}

export function selectPart(id: string | null) {
  state = { ...state, selectedId: id }
  emit()
}

export function setTool(tool: EditorState['tool']) {
  state = { ...state, tool }
  emit()
}

export function setPlacingType(type: PartType) {
  state = { ...state, placingType: type, tool: 'place' }
  emit()
}

export function setPlacingColor(color: string) {
  state = { ...state, placingColor: color }
  emit()
}

export function setLightingPreset(preset: LightingPreset) {
  state = { ...state, scene: SCENE_PRESETS[preset] }
  persist()
  emit()
}

export function setBlocklyXml(xml: string) {
  state = { ...state, blocklyXml: xml }
  persist()
  emit()
}

export function setLuaCode(code: string) {
  state = { ...state, luaCode: code }
  emit()
}

export function resetScene() {
  state = defaultScene()
  localStorage.removeItem('ek_studio_v1')
  emit()
}

export { PALETTE_COLORS, SCENE_PRESETS }
