import { useEffect } from 'react'
import { subscribeCommands, emitCommands, delay } from '../lib/commandBus'
import { getWorldScript } from '../lib/worldScripts'
import { wrapObjectPython } from '../lib/objectBlocks'
import { runPython } from '../lib/pyodide-executor'
import { addCoin, setScore, playerSay } from '../lib/gameState'
import type { WorldCommand } from '../lib/python-world-runtime'

/**
 * Реестр живых Scriptable-объектов — для маршрутизации broadcast-сообщений.
 * Регистрируют себя Scriptable.tsx через register/unregister.
 */
interface ScriptableEntry {
  worldId: string
  objectId: string
}

const registry = new Map<string, ScriptableEntry>()

export function registerScriptable(key: string, entry: ScriptableEntry) {
  registry.set(key, entry)
}
export function unregisterScriptable(key: string) {
  registry.delete(key)
}

async function runHandler(targetId: string, python: string, handler: string) {
  if (!python.includes(`def ${handler}`)) return
  try {
    const wrapped = wrapObjectPython(targetId, python)
    const code = `${wrapped}\nif "${handler}" in dir():\n    ${handler}()\n`
    const cmds = (await runPython(code)) as unknown as WorldCommand[]
    emitCommands(cmds)
  } catch (err) {
    console.warn(`[PlayRuntime ${targetId}.${handler}] failed:`, err)
  }
}

/**
 * PlayScriptRuntime — мониторит commandBus в Play-режиме и применяет
 * команды, которые имеют смысл в живой игре (не в editor-песочнице).
 *
 * Что применяется:
 *   obj_say / player_say   — floating-текст над игроком/объектом
 *   add_score / set_score  — изменение HUD-счёта
 *   obj_broadcast          — роутинг в on_<name> всех зарегистрированных Scriptable
 *   wait                   — real pause между последующими командами
 *
 * Что НЕ применяется (в Play gameplay объекты — живые React-компоненты):
 *   obj_move / rotate / color / scale / hide / destroy  — no-op
 *   place_block / remove_block                          — no-op (нет editorState)
 */
export default function PlayScriptRuntime() {
  useEffect(() => {
    let cancelled = false
    const unsub = subscribeCommands(async (cmds) => {
      if (cancelled) return
      for (const cmd of cmds) {
        if (cancelled) return
        switch (cmd.op) {
          case 'obj_say':
          case 'player_say':
            playerSay(cmd.text)
            break
          case 'add_score':
            addCoin(cmd.n)
            break
          case 'set_score':
            setScore(cmd.n)
            break
          case 'set_sky':
            // В Play используем скай из GameScene — можно дёрнуть через event
            window.dispatchEvent(new CustomEvent('ek:sky-preset', { detail: { preset: cmd.preset } }))
            break
          case 'obj_broadcast': {
            const handlerName = `on_${cmd.name.replace(/[^a-zA-Z_а-яА-Я0-9]/g, '_')}`
            for (const entry of registry.values()) {
              const s = getWorldScript(entry.worldId, entry.objectId)
              if (s?.python && s.python.includes(`def ${handlerName}`)) {
                void runHandler(
                  `${entry.worldId}:${entry.objectId}`,
                  s.python,
                  handlerName
                )
              }
            }
            break
          }
          case 'wait':
            await delay(Math.round(cmd.seconds * 1000))
            break
          default:
            // obj_move / rotate / color / scale / hide / show / destroy / place_block / ... — no-op в Play
            break
        }
      }
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  return null
}
