import type { Command } from './blocks'

type WarmupStep = 'fetching' | 'instantiating' | 'ready'

type InMsg =
  | { id: number; type: 'run'; code: string }
  | { id: number; type: 'reset' }
  | { id: number; type: 'ping' }

type OutMsg =
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; commands: unknown[] }
  | { id: number; type: 'error'; message: string }
  | { id: 0; type: 'progress'; step: WarmupStep }

let worker: Worker | null = null
let nextId = 1
const pending = new Map<
  number,
  { resolve: (cmds: Command[]) => void; reject: (err: Error) => void }
>()
let readyPromise: Promise<void> | null = null

// ── Warmup progress pub/sub ──────────────────────────────
let lastStep: WarmupStep | null = null
const progressSubs = new Set<(step: WarmupStep) => void>()

function emitProgress(step: WarmupStep) {
  lastStep = step
  for (const fn of progressSubs) {
    try { fn(step) } catch { /* swallow */ }
  }
}

/**
 * Subscribe to Pyodide warmup progress. Returns unsubscribe.
 * If the warmup already emitted a step, the listener is invoked with
 * the latest step synchronously so late subscribers don't miss state.
 */
function onWarmupProgress(fn: (step: WarmupStep) => void): () => void {
  progressSubs.add(fn)
  if (lastStep !== null) {
    try { fn(lastStep) } catch { /* swallow */ }
  }
  return () => { progressSubs.delete(fn) }
}

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
    type: 'module',
    name: 'pyodide-worker',
  })
  worker.addEventListener('message', (ev: MessageEvent<OutMsg>) => {
    const msg = ev.data
    if (msg.id === 0 && msg.type === 'progress') {
      emitProgress(msg.step)
      return
    }
    if (msg.id === 0 && msg.type === 'error') {
      for (const p of pending.values()) p.reject(new Error(msg.message))
      pending.clear()
      return
    }
    const slot = pending.get(msg.id)
    if (!slot) return
    pending.delete(msg.id)
    if (msg.type === 'result') {
      slot.resolve(msg.commands as Command[])
    } else if (msg.type === 'error') {
      slot.reject(new Error(msg.message))
    } else {
      slot.resolve([])
    }
  })
  worker.addEventListener('error', (ev) => {
    console.error('Pyodide worker error:', ev)
    for (const p of pending.values()) p.reject(new Error(ev.message || 'Worker error'))
    pending.clear()
  })
  return worker
}

export async function warmPyodide(
  onProgress?: (step: WarmupStep) => void,
): Promise<void> {
  const unsubscribe = onProgress ? onWarmupProgress(onProgress) : null
  if (readyPromise) {
    try {
      await readyPromise
    } finally {
      unsubscribe?.()
    }
    return
  }
  const w = getWorker()
  const id = nextId++
  readyPromise = new Promise<void>((resolve, reject) => {
    pending.set(id, {
      resolve: () => resolve(),
      reject,
    })
    w.postMessage({ id, type: 'ping' } satisfies InMsg)
  })
  try {
    await readyPromise
  } finally {
    unsubscribe?.()
  }
}

export async function runPython(code: string): Promise<Command[]> {
  const w = getWorker()
  const id = nextId++
  return new Promise<Command[]>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    w.postMessage({ id, type: 'run', code } satisfies InMsg)
  })
}
