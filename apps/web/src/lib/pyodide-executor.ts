import type { Command } from './blocks'

type InMsg =
  | { id: number; type: 'run'; code: string }
  | { id: number; type: 'reset' }
  | { id: number; type: 'ping' }

type OutMsg =
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; commands: unknown[] }
  | { id: number; type: 'error'; message: string }

let worker: Worker | null = null
let nextId = 1
const pending = new Map<
  number,
  { resolve: (cmds: Command[]) => void; reject: (err: Error) => void }
>()
let readyPromise: Promise<void> | null = null

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('./pyodide.worker.ts', import.meta.url), {
    type: 'module',
    name: 'pyodide-worker',
  })
  worker.addEventListener('message', (ev: MessageEvent<OutMsg>) => {
    const msg = ev.data
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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then((v) => { clearTimeout(t); resolve(v) }, (e) => { clearTimeout(t); reject(e) })
  })
}

export async function warmPyodide(): Promise<void> {
  if (readyPromise) return readyPromise
  const w = getWorker()
  const id = nextId++
  const raw = new Promise<void>((resolve, reject) => {
    pending.set(id, {
      resolve: () => resolve(),
      reject,
    })
    w.postMessage({ id, type: 'ping' } satisfies InMsg)
  })
  readyPromise = withTimeout(raw, 30_000, 'warmPyodide')
  return readyPromise
}

export async function runPython(code: string): Promise<Command[]> {
  const w = getWorker()
  const id = nextId++
  const raw = new Promise<Command[]>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    w.postMessage({ id, type: 'run', code } satisfies InMsg)
  })
  return withTimeout(raw, 10_000, 'runPython')
}

export async function resetRuntime(): Promise<void> {
  if (!worker) return
  const w = worker
  const id = nextId++
  await new Promise<void>((resolve, reject) => {
    pending.set(id, { resolve: () => resolve(), reject })
    w.postMessage({ id, type: 'reset' } satisfies InMsg)
  })
}
