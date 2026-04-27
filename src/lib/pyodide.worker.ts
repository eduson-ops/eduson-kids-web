/// <reference lib="webworker" />
// Web Worker: загружает Pyodide (CPython → WebAssembly), исполняет Python-код ученика,
// возвращает команды для игрового мира. Расширенная версия с полным Game World API.

import { PYTHON_WORLD_PRELUDE } from './python-world-runtime'

// Self-hosted Pyodide bundle (см. public/pyodide/). Раньше тянули с jsdelivr CDN —
// демо ломалось на конференц-Wi-Fi и при offline-режиме. Теперь WASM и stdlib
// идут из той же origin, что и приложение.
//
// import.meta.env.BASE_URL даёт правильный префикс для всех таргетов:
//   dev       -> '/'
//   ghpages   -> '/eduson-kids-web/'
//   pwa       -> '/eduson-kids-web/'
//   capacitor -> './'
//
// Bundle version: v0.26.2 (sync via `node scripts/sync-pyodide.mjs`).
const PYODIDE_BASE_URL: string = (() => {
  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
  // Worker-контекст не имеет document.baseURI, но import.meta.env.BASE_URL
  // подставляется Vite-ом на этапе сборки. Гарантируем trailing slash.
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}pyodide/`
})()

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
    self.postMessage({ id: 0, type: 'progress', step: 'fetching' } satisfies OutMsg)
    const mod: {
      loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInstance>
    } = await import(/* @vite-ignore */ `${PYODIDE_BASE_URL}pyodide.mjs`)
    self.postMessage({ id: 0, type: 'progress', step: 'instantiating' } satisfies OutMsg)
    const py = await mod.loadPyodide({ indexURL: PYODIDE_BASE_URL })
    py.runPython(PYTHON_WORLD_PRELUDE)
    pyodide = py
    self.postMessage({ id: 0, type: 'progress', step: 'ready' } satisfies OutMsg)
    return py
  })()
  return loadPromise
}

type InMsg =
  | { id: number; type: 'run'; code: string }
  | { id: number; type: 'reset' }
  | { id: number; type: 'ping' }

type ProgressStep = 'fetching' | 'instantiating' | 'ready'

type OutMsg =
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; commands: unknown[] }
  | { id: number; type: 'error'; message: string }
  | { id: 0; type: 'progress'; step: ProgressStep }

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
