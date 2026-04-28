/**
 * playEditMode — глобальный переключатель режима редактирования в Play-сцене.
 * В отличие от autoRun (Studio-only) это событие для Play: когда ON, все
 * <Scriptable> рендерят кликабельные хало-маркеры, клик открывает редактор
 * скрипта именно этого объекта.
 *
 * Хранится в памяти (не persist) — режим сбрасывается при перезагрузке.
 */
import type { Object3D } from 'three'

type Listener = (v: boolean) => void

let active = false
let focusedObjectId: string | null = null
const listeners = new Set<Listener>()
const focusListeners = new Set<(id: string | null) => void>()

export function isEditMode() { return active }

export function setEditMode(v: boolean) {
  if (active === v) return
  active = v
  if (!v) setFocusedObject(null)
  for (const l of listeners) l(active)
}

export function subscribeEditMode(l: Listener): () => void {
  listeners.add(l)
  l(active)
  return () => { listeners.delete(l) }
}

/**
 * Какой объект сейчас «в фокусе» — т.е. открыт в ObjectScriptEditor модалке.
 * Используется Play.tsx чтобы знать, рисовать ли модалку.
 */
export function setFocusedObject(id: string | null) {
  if (focusedObjectId === id) return
  focusedObjectId = id
  for (const l of focusListeners) l(focusedObjectId)
}

export function subscribeFocus(l: (id: string | null) => void): () => void {
  focusListeners.add(l)
  l(focusedObjectId)
  return () => { focusListeners.delete(l) }
}

/**
 * Контекст клика по любому мешу в Edit-режиме — координаты в 3D, позиция курсора
 * для плавающего меню, прямой ссылка на кликнутый THREE.Object3D.
 * Читает Play.tsx чтобы нарисовать <WorldContextMenu>.
 */
 
export interface ClickContext {
  pos: [number, number, number]
  screen: [number, number]
  /** UUID кликнутого three.js-объекта. Стабилен в пределах одной сессии. */
  objectUuid: string
  /** Прямая ссылка — для session-only мутаций (visible / color) */
  objectRef: Object3D
}

let clickContext: ClickContext | null = null
const ctxListeners = new Set<(c: ClickContext | null) => void>()

function getClickContext() { return clickContext }
export function setClickContext(c: ClickContext | null) {
  clickContext = c
  for (const l of ctxListeners) l(clickContext)
}
export function subscribeClickContext(l: (c: ClickContext | null) => void): () => void {
  ctxListeners.add(l)
  l(clickContext)
  return () => { ctxListeners.delete(l) }
}

/** Стабильный ID объекта на карте из округлённой до 0.5 позиции. */
export function makeObjectIdFromPos(pos: [number, number, number]): string {
  const r = (n: number) => Math.round(n * 2) / 2
  return `at_${r(pos[0])}_${r(pos[1])}_${r(pos[2])}`
}

/**
 * Hover-target в первом лице — объект, на который игрок смотрит и который
 * физически близко (raycast 2-3 юнита). Если он не null, нажатие Q открывает
 * редактор именно этого объекта вместо палитры спавна.
 *
 * Структура хранит UUID three-объекта, его world-position для подсказки и
 * человекочитаемый label, если есть (Scriptable.label).
 */
export interface HoverTarget {
  uuid: string
  pos: [number, number, number]
  label: string | null
  ref: Object3D
}

let hoverTarget: HoverTarget | null = null
const hoverListeners = new Set<(t: HoverTarget | null) => void>()

export function getHoverTarget() { return hoverTarget }
export function setHoverTarget(t: HoverTarget | null) {
  // Сравнение по uuid — сцена кидает множество событий за кадр, не дёргаем
  // подписчиков если фактический объект не сменился.
  if (hoverTarget?.uuid === t?.uuid) {
    if (t && hoverTarget) hoverTarget = t   // обновим pos
    return
  }
  hoverTarget = t
  for (const l of hoverListeners) l(hoverTarget)
}
export function subscribeHoverTarget(l: (t: HoverTarget | null) => void): () => void {
  hoverListeners.add(l)
  l(hoverTarget)
  return () => { hoverListeners.delete(l) }
}

/**
 * Placement-режим — когда пользователь выбрал пропс в Spawn-палитре и собирается
 * разместить его кликом в мире. `kind` — тип пропса, `color` — начальный цвет.
 */
export interface PlacementState {
  kind: string   // PropKind
  color: string
}

let placement: PlacementState | null = null
const placementListeners = new Set<(p: PlacementState | null) => void>()

export function getPlacement() { return placement }
export function setPlacement(p: PlacementState | null) {
  placement = p
  for (const l of placementListeners) l(placement)
}
export function subscribePlacement(l: (p: PlacementState | null) => void): () => void {
  placementListeners.add(l)
  l(placement)
  return () => { placementListeners.delete(l) }
}

/**
 * Активный инструмент (паттерн навеян GMod'овским Tool Menu / toolgun).
 * Когда инструмент выбран, `UniversalClickCatcher` не открывает контекст-меню —
 * сразу применяет действие инструмента.
 *
 *   null      — обычный клик открывает контекст-меню
 *   'paint'   — клик сразу красит меш (цвет из toolColor)
 *   'remove'  — клик мгновенно скрывает меш
 *   'graber'  — зажал и таскаешь (future, требует rapier kinematic)
 */
export type ActiveTool = null | 'paint' | 'remove' | 'graber'

let activeTool: ActiveTool = null
let toolColor = '#FFD43C'
const toolListeners = new Set<(t: ActiveTool) => void>()

export function getActiveTool() { return activeTool }
export function setActiveTool(t: ActiveTool) {
  if (activeTool === t) { activeTool = null } else { activeTool = t }
  for (const l of toolListeners) l(activeTool)
}
export function subscribeActiveTool(l: (t: ActiveTool) => void): () => void {
  toolListeners.add(l)
  l(activeTool)
  return () => { toolListeners.delete(l) }
}
export function getToolColor() { return toolColor }
export function setToolColor(c: string) {
  toolColor = c
  for (const l of toolListeners) l(activeTool)   // re-notify так как инструмент подхватит новый цвет
}
