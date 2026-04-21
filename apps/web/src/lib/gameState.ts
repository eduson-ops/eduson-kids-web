// Мини-стор для совместной игровой сессии: монетки, цели, таймер.
// Деталь MVP: используем простой event emitter, без Zustand — меньше зависимостей.

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
  }, 100)
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
