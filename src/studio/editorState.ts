// Простой store для Studio editor — без zustand/redux, минимум зависимостей.
// Подписка через event-emitter pattern.

import { nanoid } from 'nanoid'

export type PartType = 'cube' | 'coin' | 'spawn' | 'finish' | 'wall' | 'floor' | 'ramp' | 'roof'
export type MaterialType = 'plastic' | 'metal' | 'wood' | 'grass' | 'stone' | 'neon'

/**
 * Три уровня программирования в Studio.
 *  - blocks     — чистый Blockly (L1: начальный уровень 9-10 лет)
 *  - bridge     — Blockly слева + живой Python справа (L2: мост 10-12 лет)
 *  - python     — чистый текстовый Python (L3: 12-15 лет)
 */
export type ScriptMode = 'blocks' | 'bridge' | 'python'

export interface ObjectScript {
  /** Blockly XML — для возврата к визуальному редактору */
  xml: string
  /** Готовый Python — сохраняем чтобы не прогонять генератор каждый раз при запуске */
  python: string
}

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
  /**
   * Скрипт привязанный к этому конкретному объекту.
   * Запускается runtime'ом в TestTab: on_start при монтаже сцены,
   * on_touch при касании с игроком (если внутри скрипта есть такой handler).
   */
  scripts?: ObjectScript
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
  /** Текущий режим программирования: blocks / bridge / python */
  scriptMode: ScriptMode
  /** Skript — Blockly workspace serialized */
  blocklyXml: string
  /** Python code auto-generated from Blockly (read-only preview) */
  blocklyPython: string
  /** Python code written manually in pure-Python mode */
  pythonCode: string
  /**
   * Live-режим: если true — каждое изменение блоков авто-запускает Python
   * и применяет результат в Test-табе (instant, без 200мс step).
   * Главная образовательная фишка: ребёнок видит прямое влияние блоков на мир.
   */
  autoRun: boolean
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
      // Земля (пол 16×16)
      {
        id: 'ground-0',
        type: 'floor',
        position: [0, -0.5, 0],
        scale: [16, 1, 16],
        rotation: [0, 0, 0],
        color: '#48c774',
        material: 'grass',
        anchored: true,
        name: 'Земля',
      },
      // Точка старта — чтобы игрок появился в правильном месте
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
      // Платформы — ребёнок сразу видит, что сцена живая
      {
        id: 'plat-1',
        type: 'cube',
        position: [-3, 0.5, -2],
        scale: [2, 1, 2],
        rotation: [0, 0, 0],
        color: '#6B5CE7',
        material: 'plastic',
        anchored: true,
        name: 'Платформа 1',
      },
      {
        id: 'plat-2',
        type: 'cube',
        position: [0, 1, -4],
        scale: [2, 1, 2],
        rotation: [0, 0, 0],
        color: '#FF8CAE',
        material: 'plastic',
        anchored: true,
        name: 'Платформа 2',
      },
      {
        id: 'plat-3',
        type: 'cube',
        position: [3, 1.5, -6],
        scale: [2, 1, 2],
        rotation: [0, 0, 0],
        color: '#FFD43C',
        material: 'plastic',
        anchored: true,
        name: 'Платформа 3',
      },
      // Монетки — образец цели
      {
        id: 'coin-1',
        type: 'coin',
        position: [-3, 1.2, -2],
        scale: [0.6, 0.6, 0.6],
        rotation: [0, 0, 0],
        color: '#FFD43C',
        material: 'plastic',
        anchored: true,
        name: 'Монетка 1',
      },
      {
        id: 'coin-2',
        type: 'coin',
        position: [0, 1.7, -4],
        scale: [0.6, 0.6, 0.6],
        rotation: [0, 0, 0],
        color: '#FFD43C',
        material: 'plastic',
        anchored: true,
        name: 'Монетка 2',
      },
      {
        id: 'coin-3',
        type: 'coin',
        position: [3, 2.2, -6],
        scale: [0.6, 0.6, 0.6],
        rotation: [0, 0, 0],
        color: '#FFD43C',
        material: 'plastic',
        anchored: true,
        name: 'Монетка 3',
      },
      // Финиш — куда надо добежать
      {
        id: 'finish-0',
        type: 'finish',
        position: [5, 1.6, -6],
        scale: [1, 0.3, 1],
        rotation: [0, 0, 0],
        color: '#3DB07A',
        material: 'neon',
        anchored: true,
        name: 'Финиш',
      },
    ],
    selectedId: null,
    scene: SCENE_PRESETS.day,
    tool: 'select',
    placingType: 'cube',
    placingColor: PALETTE_COLORS[4],
    scriptMode: 'blocks',
    blocklyXml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_on_start" x="40" y="40"></block>
</xml>`,
    blocklyPython: '# нажми «▶ Тест» чтобы запустить\n',
    autoRun: false,
    pythonCode: `# Привет! Это твой Python-код.
# Управляй игровым миром через готовые функции.
# Подсказка: нажми 📖 API чтобы увидеть все команды.

say("Привет, мир!")

# Построить башню из 5 красных блоков
tower(5, x=0, z=-3, color="red")

# Походить
move_forward(3)
turn_right()
jump()
`,
  }
}

type Listener = (state: EditorState) => void
const listeners = new Set<Listener>()

let state: EditorState = loadFromStorage() ?? defaultScene()

function loadFromStorage(): EditorState | null {
  try {
    const raw = localStorage.getItem('ek_studio_v1')
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<EditorState>
    if (!Array.isArray(parsed.parts)) return null
    const defaults = defaultScene()
    return {
      ...defaults,
      ...parsed,
      scriptMode: parsed.scriptMode ?? defaults.scriptMode,
      pythonCode: parsed.pythonCode ?? defaults.pythonCode,
      autoRun: parsed.autoRun ?? defaults.autoRun,
    } as EditorState
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
  pushUndo({ kind: 'add', partId: id })
  persist()
  emit()
  return id
}

export function updatePart(id: string, patch: Partial<PartObject>) {
  const before = state.parts.find((p) => p.id === id)
  if (!before) return
  // Snapshot ONLY the keys we're about to overwrite so undo restores
  // the prior values without touching anything else.
  const beforePatch: Partial<PartObject> = {}
  const afterPatch: Partial<PartObject> = {}
  for (const k of Object.keys(patch) as Array<keyof PartObject>) {
    ;(beforePatch as Record<string, unknown>)[k] = (before as Record<string, unknown>)[k]
    ;(afterPatch as Record<string, unknown>)[k] = (patch as Record<string, unknown>)[k]
  }
  pushUndo({ kind: 'updatePart', partId: id, before: beforePatch, after: afterPatch })
  state = {
    ...state,
    parts: state.parts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }
  persist()
  emit()
}

export function deletePart(id: string) {
  if (id.startsWith('ground-') || id.startsWith('spawn-')) return // нельзя удалить базу
  const part = state.parts.find((p) => p.id === id)
  if (part) pushUndo({ kind: 'delete', part, prevSelectedId: state.selectedId })
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

export function setBlocklyPython(code: string) {
  state = { ...state, blocklyPython: code }
  emit()
}

export function setPythonCode(code: string) {
  state = { ...state, pythonCode: code }
  persist()
  emit()
}

export function setScriptMode(mode: ScriptMode) {
  state = { ...state, scriptMode: mode }
  persist()
  emit()
}

/** Обновить/удалить скрипт конкретного объекта */
export function setObjectScript(id: string, scripts: ObjectScript | null) {
  state = {
    ...state,
    parts: state.parts.map((p) =>
      p.id === id ? { ...p, scripts: scripts ?? undefined } : p
    ),
  }
  persist()
  emit()
}

export function setAutoRun(v: boolean) {
  state = { ...state, autoRun: v }
  persist()
  emit()
}

export function resetScene() {
  state = defaultScene()
  localStorage.removeItem('ek_studio_v1')
  undoStack.length = 0
  emit()
}

// ─── Undo stack ───────────────────────────────────────────
type UndoOp =
  | { kind: 'add'; partId: string }
  | { kind: 'delete'; part: PartObject; prevSelectedId: string | null }
  | { kind: 'updatePart'; partId: string; before: Partial<PartObject>; after: Partial<PartObject> }

const undoStack: UndoOp[] = []
const UNDO_LIMIT = 40

function pushUndo(op: UndoOp) {
  undoStack.push(op)
  if (undoStack.length > UNDO_LIMIT) undoStack.shift()
}

export function undoEditor(): boolean {
  const op = undoStack.pop()
  if (!op) return false
  if (op.kind === 'add') {
    state = {
      ...state,
      parts: state.parts.filter((p) => p.id !== op.partId),
      selectedId: null,
    }
  } else if (op.kind === 'delete') {
    state = {
      ...state,
      parts: [...state.parts, op.part],
      selectedId: op.prevSelectedId,
    }
  } else {
    // updatePart — restore the prior values for the patched keys
    state = {
      ...state,
      parts: state.parts.map((p) =>
        p.id === op.partId ? { ...p, ...op.before } : p,
      ),
    }
  }
  persist()
  emit()
  return true
}

export { PALETTE_COLORS, SCENE_PRESETS }
