/// <reference lib="webworker" />
// Web Worker: загружает Pyodide (CPython → WebAssembly), исполняет Python-код ученика,
// возвращает команды для игрового мира. Расширенная версия с полным Game World API.

import { PYTHON_WORLD_PRELUDE } from './python-world-runtime'

const PYODIDE_VERSION = 'v0.26.2'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

declare const self: DedicatedWorkerGlobalScope & {
  loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInstance>
}

type PyodideInstance = {
  runPython: (code: string) => unknown
  globals: {
    get: (name: string) => { toJs: (opts: { dict_converter: unknown }) => unknown }
  }
  toPy: (v: unknown) => unknown
}

let pyodide: PyodideInstance | null = null
let loadPromise: Promise<PyodideInstance> | null = null

async function getPyodide(): Promise<PyodideInstance> {
  if (pyodide) return pyodide
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    const mod: {
      loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInstance>
    } = await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`)
    const py = await mod.loadPyodide({ indexURL: PYODIDE_CDN })
    py.runPython(PYTHON_WORLD_PRELUDE)
    pyodide = py
    return py
  })()
  return loadPromise
}

type InMsg =
  | { id: number; type: 'run'; code: string }
  | { id: number; type: 'reset' }
  | { id: number; type: 'ping' }

type OutMsg =
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; commands: unknown[] }
  | { id: number; type: 'error'; message: string }

self.addEventListener('message', async (ev: MessageEvent<InMsg>) => {
  const msg = ev.data
  try {
    if (msg.type === 'ping') {
      await getPyodide()
      self.postMessage({ id: msg.id, type: 'ready' } satisfies OutMsg)
      return
    }
    if (msg.type === 'reset') {
      const py = await getPyodide()
      py.runPython('_reset()')
      self.postMessage({ id: msg.id, type: 'result', commands: [] } satisfies OutMsg)
      return
    }
    if (msg.type === 'run') {
      const py = await getPyodide()
      py.runPython('_reset()')
      py.runPython(msg.code)
      const raw = py.globals.get('_commands')
      const commands = raw.toJs({ dict_converter: Object.fromEntries })
      self.postMessage({
        id: msg.id,
        type: 'result',
        commands: commands as unknown[],
      } satisfies OutMsg)
      return
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    self.postMessage({ id: msg.id, type: 'error', message } satisfies OutMsg)
  }
})

self.postMessage({ id: 0, type: 'ready' } satisfies OutMsg)
getPyodide().catch((err) => {
  const message = err instanceof Error ? err.message : String(err)
  self.postMessage({ id: 0, type: 'error', message } satisfies OutMsg)
})
