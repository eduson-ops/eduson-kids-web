import { useEffect, useRef, useState } from 'react'

const ON_TICK_INTERVAL_MS = 1000
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getWorldScript, subscribeWorldScripts } from '../lib/worldScripts'
import { isEditMode, setFocusedObject, subscribeEditMode } from '../lib/playEditMode'
import { runPython } from '../lib/pyodide-executor'
import { emitCommands } from '../lib/commandBus'
import { wrapObjectPython } from '../lib/objectBlocks'
import type { WorldCommand } from '../lib/python-world-runtime'
import { registerScriptable, unregisterScriptable } from './PlayScriptRuntime'

interface Props {
  /** ID игры/мира — общий для всех Scriptable внутри одного world */
  worldId: string
  /** ID объекта — уникальный в рамках этого world */
  objectId: string
  /** Позиция объекта в мире (где появится маркер в Edit-режиме) */
  pos: [number, number, number]
  /** Человекочитаемая подпись, показывается при наведении и в редакторе */
  label: string
  /** Размер «кликабельной ауры» (радиус sphere-hitbox) */
  radius?: number
}

/**
 * Scriptable — невидимый маркер-обёртка, который можно повесить рядом с любым
 * gameplay-объектом в мире. Делает две вещи:
 *   1. В **Edit-режиме** рисует полупрозрачную кликабельную сферу с floating-меткой.
 *      Клик → открывает ObjectScriptEditor для этого (worldId, objectId).
 *   2. В **Play-режиме** исполняет скрипт (если есть):
 *      - on_start один раз при mount
 *      - on_touch — через sensor-коллайдер, когда игрок входит в радиус
 *      - on_tick — 1 раз в секунду
 *
 * Не требует менять gameplay-компонент (Coin / Enemy / NPC / …) — ставь рядом.
 */
export default function Scriptable({ worldId, objectId, pos, label, radius = 1.2 }: Props) {
  const [edit, setEdit] = useState(isEditMode())
  const [hasScript, setHasScript] = useState(Boolean(getWorldScript(worldId, objectId)))
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null!)

  useEffect(() => subscribeEditMode(setEdit), [])
  useEffect(
    () =>
      subscribeWorldScripts(() => {
        setHasScript(Boolean(getWorldScript(worldId, objectId)))
      }),
    [worldId, objectId]
  )

  // Регистрируемся в реестре Play-runtime для broadcast-роутинга
  useEffect(() => {
    const key = `${worldId}:${objectId}`
    registerScriptable(key, { worldId, objectId })
    return () => unregisterScriptable(key)
  }, [worldId, objectId])

  // Мягкая анимация «дыхания» маркера
  useFrame(({ clock }) => {
    if (meshRef.current && (edit || hasScript)) {
      const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.08
      meshRef.current.scale.setScalar(s)
    }
  })

  // ── Runtime: on_start (один раз при mount) ──
  useEffect(() => {
    const s = getWorldScript(worldId, objectId)
    if (!s?.python || !s.python.includes('def on_start')) return
    void runHandler(`${worldId}:${objectId}`, s.python, 'on_start')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasScript])

  // ── Runtime: on_tick (каждую секунду) ──
  useEffect(() => {
    const s = getWorldScript(worldId, objectId)
    if (!s?.python || !s.python.includes('def on_tick')) return
    const id = window.setInterval(() => {
      const curr = getWorldScript(worldId, objectId)
      if (!curr?.python) return
      void runHandler(`${worldId}:${objectId}`, curr.python, 'on_tick')
    }, ON_TICK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [worldId, objectId, hasScript])

  const handleClick = () => {
    if (!edit) return
    setFocusedObject(objectId)
  }

  const triggerTouch = () => {
    const s = getWorldScript(worldId, objectId)
    if (!s?.python || !s.python.includes('def on_touch')) return
    void runHandler(`${worldId}:${objectId}`, s.python, 'on_touch')
  }

  const showVisual = edit || hasScript
  const halo = edit ? 'rgba(255,212,60,0.55)' : 'rgba(255,212,60,0.8)'

  return (
    <>
      {/* Клик-сфера (видна в edit; если скрипт есть — тонкий маркер и в play) */}
      {showVisual && (
        <group
          position={pos}
          // userData: маркер для FocusedObjectIndicator — он по этому полю
          // понимает, что объект редактируемый, и подсвечивает его в Q-режиме.
          userData={{ scriptable: true, editable: true, label, objectId }}
        >
          <mesh
            ref={meshRef}
            userData={{ scriptable: true, editable: true, label, objectId }}
            onPointerDown={handleClick}
            onPointerOver={() => setHovered(edit)}
            onPointerOut={() => setHovered(false)}
          >
            <sphereGeometry args={[radius, 18, 14]} />
            <meshBasicMaterial
              color={halo}
              transparent
              opacity={edit ? (hovered ? 0.35 : 0.18) : 0.12}
              depthWrite={false}
            />
          </mesh>
          {/* Жёлтый «огонёк» сверху — всегда видно если есть скрипт */}
          {hasScript && (
            <mesh position={[0, radius + 0.25, 0]}>
              <sphereGeometry args={[0.14, 10, 10]} />
              <meshBasicMaterial color="#FFD43C" />
            </mesh>
          )}
          {edit && (
            <Html position={[0, radius + 0.7, 0]} center distanceFactor={8}>
              <div className="scriptable-label">
                {hasScript ? '⚡ ' : '✏ '}
                {label}
              </div>
            </Html>
          )}
        </group>
      )}

      {/* Sensor-hitbox для on_touch — работает даже когда edit выключен */}
      <RigidBody
        type="fixed"
        position={pos}
        sensor
        colliders="ball"
        name={`scriptable-${objectId}`}
        onIntersectionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === 'player') triggerTouch()
        }}
      >
        <mesh visible={false}>
          <sphereGeometry args={[radius, 8, 6]} />
        </mesh>
      </RigidBody>
    </>
  )
}

/** Запустить Python-handler объекта и разослать команды в commandBus. */
async function runHandler(targetId: string, python: string, handler: string) {
  if (!python.includes(`def ${handler}`)) return
  try {
    const wrapped = wrapObjectPython(targetId, python)
    const code = `${wrapped}\nif "${handler}" in dir():\n    ${handler}()\n`
    const cmds = (await runPython(code)) as unknown as WorldCommand[]
    emitCommands(cmds)
  } catch (err) {
    console.warn(`[Scriptable ${targetId}.${handler}] failed:`, err)
  }
}
