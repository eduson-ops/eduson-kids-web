// Мини-стор для совместной игровой сессии: монетки, цели, таймер.
// Деталь MVP: используем простой event emitter, без Zustand — меньше зависимостей.

const TIMER_TICK_MS = 100
const MAX_SCORE = 9999
const MAX_SAY_LENGTH = 140

type Listener = (state: GameState) => void

export interface GoalResult {
  kind: 'win' | 'lose'
  label: string
  subline?: string
}

export interface GameState {
  coins: number
  timeMs: number
  running: boolean
  goal: GoalResult | null
}

const state: GameState = {
  coins: 0,
  timeMs: 0,
  running: true,
  goal: null,
}

const listeners = new Set<Listener>()
let tickInterval: ReturnType<typeof setInterval> | null = null

function notify() {
  for (const l of listeners) l(state)
}

export function subscribe(l: Listener): () => void {
  listeners.add(l)
  l(state)
  return () => {
    listeners.delete(l)
  }
}

export function getState(): Readonly<GameState> {
  return state
}

export function resetGame() {
  state.coins = 0
  state.timeMs = 0
  state.running = true
  state.goal = null
  stopTimer()
  startTimer()
  notify()
}

export function startTimer() {
  if (tickInterval) return
  const start = Date.now() - state.timeMs
  tickInterval = setInterval(() => {
    if (state.running) {
      state.timeMs = Date.now() - start
      notify()
    }
  }, TIMER_TICK_MS)
}

export function stopTimer() {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
}

export function addCoin(n = 1) {
  state.coins += n
  notify()
}

export function setScore(n: number) {
  state.coins = Math.max(0, Math.min(MAX_SCORE, Math.floor(n)))
  notify()
}

export function enemyHit() {
  // Dispatches a custom event picked up by Player.tsx to trigger respawn
  window.dispatchEvent(new CustomEvent('ek:enemy-hit'))
}

/**
 * Дрожание камеры. Отправляет event 'ek:shake', Player.tsx подхватывает и сдвигает камеру.
 * @param intensity 0..1+ — амплитуда сдвига в юнитах мира (0.4 — сильный хит, 0.2 — мягкое win)
 * @param duration сек — длительность, линейный decay до 0
 */
export function shakeCamera(intensity: number, duration: number) {
  window.dispatchEvent(new CustomEvent('ek:shake', { detail: { intensity, duration } }))
}

export function playerSay(text: string) {
  window.dispatchEvent(new CustomEvent('ek:player-say', { detail: { text: String(text).slice(0, MAX_SAY_LENGTH) } }))
}


export function setGoal(g: GoalResult) {
  if (state.goal) return
  state.goal = g
  state.running = false
  stopTimer()
  notify()
}

// При размонтировании Play мы явно чистим всё
export function disposeGame() {
  stopTimer()
  state.coins = 0
  state.timeMs = 0
  state.running = false
  state.goal = null
  listeners.clear()
}
