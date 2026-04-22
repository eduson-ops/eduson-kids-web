import { useEffect, useState } from 'react'
import Scriptable from './Scriptable'
import { getAllScriptsForWorld, subscribeWorldScripts } from '../lib/worldScripts'

interface Props {
  worldId: string
  /** ID-ы объектов, которые уже рендерит `getWorldTargets` — пропускаем их */
  knownIds: Set<string>
}

/**
 * ScriptGhosts — рендерит невидимые Scriptable-hitbox'ы в позициях, куда
 * ребёнок повесил скрипт через universal-click (objectId формата `at_x_y_z`).
 *
 * Без этого слоя скрипт сохранился бы в store, но in-game не триггерился
 * (не было ни sensor-коллайдера для on_touch, ни on_start-запуска).
 */
export default function ScriptGhosts({ worldId, knownIds }: Props) {
  const [ghosts, setGhosts] = useState<Array<{ id: string; pos: [number, number, number] }>>([])

  useEffect(() => {
    const refresh = () => {
      const all = getAllScriptsForWorld(worldId)
      const pending: Array<{ id: string; pos: [number, number, number] }> = []
      for (const { objectId } of all) {
        if (knownIds.has(objectId)) continue
        // Парсим at_x_y_z формат
        const m = objectId.match(/^at_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/)
        if (m) {
          pending.push({
            id: objectId,
            pos: [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])],
          })
        }
      }
      setGhosts(pending)
    }
    refresh()
    return subscribeWorldScripts(refresh)
  }, [worldId, knownIds])

  return (
    <>
      {ghosts.map((g) => (
        <Scriptable
          key={g.id}
          worldId={worldId}
          objectId={g.id}
          pos={g.pos}
          label={`Кастом ${g.id.replace('at_', '').replace(/_/g, ',')}`}
          radius={1.4}
        />
      ))}
    </>
  )
}
