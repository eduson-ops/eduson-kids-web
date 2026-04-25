import { memo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { setGoal, getState } from '../lib/gameState'
import { SFX } from '../lib/audio'
import type { GoalResult } from '../lib/gameState'

interface Props {
  pos: [number, number, number]
  size: [number, number, number]
  result: GoalResult
}

/**
 * Невидимая зона-сенсор. Когда игрок заходит внутрь — триггер
 * записывает результат в gameState (Play page покажет overlay).
 */
function GoalTriggerImpl({ pos, size, result }: Props) {
  return (
    <RigidBody
      type="fixed"
      position={pos}
      colliders="cuboid"
      sensor
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'player' && !getState().goal) {
          setGoal(result)
          SFX.win()
        }
      }}
    >
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </RigidBody>
  )
}

// D-11: GoalTrigger вызывается из World*-компонентов с inline tuple-props
// и inline `result={{...}}`. GoalResult — плоский объект из 3 primitives.
export default memo(GoalTriggerImpl, (prev, next) => (
  prev.pos[0] === next.pos[0] &&
  prev.pos[1] === next.pos[1] &&
  prev.pos[2] === next.pos[2] &&
  prev.size[0] === next.size[0] &&
  prev.size[1] === next.size[1] &&
  prev.size[2] === next.size[2] &&
  prev.result.kind === next.result.kind &&
  prev.result.label === next.result.label &&
  prev.result.subline === next.result.subline
))
