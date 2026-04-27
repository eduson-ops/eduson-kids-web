// commandBus — общий event emitter для передачи Python WorldCommand[] из ScriptTab в TestTab.
// Используется когда ученик жмёт «▶ Запустить» в ScriptTab: результат runPython()
// публикуется в шину, TestTab подписан и применяет команды по одной с задержкой 200мс.
import type { WorldCommand } from './python-world-runtime'

type Listener = (cmds: WorldCommand[]) => void

const listeners = new Set<Listener>()

export function emitCommands(cmds: WorldCommand[]) {
  for (const l of listeners) l(cmds)
}

export function subscribeCommands(l: Listener): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

/** Пауза N мс — удобно для пошагового применения команд. */
export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Задержка между командами (кроме wait(), которая использует свою собственную). */
export const COMMAND_STEP_MS = 200
