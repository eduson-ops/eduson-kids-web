/// <reference lib="webworker" />
// Web Worker: загружает Pyodide (CPython → WebAssembly), исполняет Python-код ученика,
// возвращает список команд для игрового канваса. См. ADR-002.

// Pyodide подтягивается с CDN — избегаем бандлинга 15МБ в наш клиент.
// В MVP это OK; продакшен-вариант — self-host в Yandex Object Storage.
const PYODIDE_VERSION = 'v0.26.2'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`

declare const self: DedicatedWorkerGlobalScope & {
  loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInstance>
}

type PyodideInstance = {
  runPython: (code: string) => unknown
  globals: { get: (name: string) => { toJs: (opts: { dict_converter: unknown }) => unknown } }
  toPy: (v: unknown) => unknown
}

// При top-level import в worker Vite бандлит — мы хотим чистый фетч с CDN.
// importScripts работает в classic worker; для module-worker используем dynamic import.
// Vite с { type: 'module' } даёт нам dynamic import.

let pyodide: PyodideInstance | null = null
let loadPromise: Promise<PyodideInstance> | null = null

async function getPyodide(): Promise<PyodideInstance> {
  if (pyodide) return pyodide
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    // Подгружаем сам pyodide.mjs как ES-модуль с CDN
    const mod: { loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInstance> } =
      await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`)
    const py = await mod.loadPyodide({ indexURL: PYODIDE_CDN })
    // Устанавливаем runtime-API, который генерированный Python вызывает
    py.runPython(RUNTIME_PY)
    pyodide = py
    return py
  })()
  return loadPromise
}

// Python-прелюдия: инициализирует глобальный список команд и API, доступное ученику.
const RUNTIME_PY = `
_commands = []

def _emit(op, **kwargs):
    cmd = {"op": op}
    cmd.update(kwargs)
    _commands.append(cmd)

def move_forward(steps=1):
    try:
        steps = int(steps)
    except (TypeError, ValueError):
        steps = 1
    steps = max(1, min(steps, 50))
    _emit("move_forward", steps=steps)

def turn_left():
    _emit("turn_left")

def turn_right():
    _emit("turn_right")

def jump():
    _emit("jump")

def wait(seconds=1):
    try:
        seconds = float(seconds)
    except (TypeError, ValueError):
        seconds = 1.0
    seconds = max(0.1, min(seconds, 10))
    _emit("wait", seconds=seconds)

def say(text="Привет!"):
    _emit("say", text=str(text)[:140])

def place_block(color="red"):
    allowed = {"red","blue","green","yellow","purple","black"}
    c = str(color)
    if c not in allowed:
        c = "red"
    _emit("place_block", color=c)

def _reset():
    _commands.clear()

_reset()
`

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

// Ping ourselves to trigger pyodide load as soon as worker spawns
self.postMessage({ id: 0, type: 'ready' } satisfies OutMsg)
getPyodide().catch((err) => {
  const message = err instanceof Error ? err.message : String(err)
  self.postMessage({ id: 0, type: 'error', message } satisfies OutMsg)
})
