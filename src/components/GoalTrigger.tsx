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
export default function GoalTrigger({ pos, size, result }: Props) {
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
