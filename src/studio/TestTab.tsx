import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import GradientSky from '../components/GradientSky'
import Sun from '../components/Sun'
import Player from '../components/Player'
import VoxelClouds from '../components/VoxelClouds'
import LiveOverlay from '../components/LiveOverlay'
import CoinHud from '../components/CoinHud'
import SayBubble from '../components/SayBubble'
import CameraController from '../components/CameraController'
import BuildModeController, { PieceGeometry } from '../components/BuildModeController'
import BuildModeHud from '../components/BuildModeHud'
import type { BuildPieceKind } from '../lib/buildModeState'
import { loadAvatar } from '../lib/avatars'
import {
  addPart,
  deletePart,
  setLightingPreset,
  updatePart,
  type EditorState,
  type PartObject,
  type MaterialType,
} from './editorState'
import { subscribeCommands, emitCommands, COMMAND_STEP_MS, delay } from '../lib/commandBus'
import { getState as getEditorState } from './editorState'
import { addCoin, setScore, playerSay } from '../lib/gameState'
import type { WorldCommand } from '../lib/python-world-runtime'
import { runPython } from '../lib/pyodide-executor'
import { wrapObjectPython } from '../lib/objectBlocks'
import { DEG_TO_RAD, ANIM_FPS, TICK_INTERVAL_MS, SCALE_MIN, SCALE_MAX, LIVE_STEP_MS } from '../lib/constants'

/** PartGeometry — рендер корректной геометрии по type (coin/wall/floor/ramp/roof/cube). */
function PartGeometry({ type }: { type: PartObject['type'] }) {
  if (type === 'coin') return <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
  if (type === 'wall' || type === 'floor' || type === 'ramp' || type === 'roof') {
    return <PieceGeometry kind={type as BuildPieceKind} />
  }
  return <boxGeometry args={[1, 1, 1]} />
}

const KEYS = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
]

function materialProps(m: MaterialType) {
  switch (m) {
    case 'metal':
      return { roughness: 0.3, metalness: 0.8 }
    case 'neon':
      return { roughness: 0.2, metalness: 0 }
    default:
      return { roughness: 0.85, metalness: 0 }
  }
}

/**
 * StaticPartMesh — pure-render mesh (без RigidBody). Используется ТОЛЬКО внутри
 * объединённого <RigidBody type="fixed">: коллайдеры собираются автоматически
 * из всех вложенных мешей по `colliders` родителя. Memoized — re-render
 * только при реальных изменениях геометрии/цвета этой части.
 */
const StaticPartMesh = memo(function StaticPartMesh({ p }: { p: PartObject }) {
  const mp = materialProps(p.material)
  const isEmissive = p.type === 'coin' || p.type === 'finish' || p.material === 'neon'
  return (
    <mesh
      position={p.position}
      rotation={p.rotation}
      scale={p.scale}
      castShadow
      receiveShadow
      name={`part-${p.id}`}
    >
      <PartGeometry type={p.type} />
      <meshStandardMaterial
        color={p.color}
        roughness={mp.roughness}
        metalness={mp.metalness}
        emissive={isEmissive ? p.color : '#000'}
        emissiveIntensity={isEmissive ? 0.3 : 0}
      />
    </mesh>
  )
}, partsEqual)

/**
 * DynamicPart — для частей с пользовательскими скриптами. Собственный
 * RigidBody-сенсор + ⚡-маркер сверху. Memoized — нет re-create RigidBody
 * пока id/transform/material не меняется.
 */
const DynamicPart = memo(function DynamicPart({
  p,
  onTouch,
  onClick,
}: {
  p: PartObject
  onTouch?: (id: string) => void
  onClick?: (id: string) => void
}) {
  const mp = materialProps(p.material)
  const isEmissive = p.type === 'coin' || p.type === 'finish' || p.material === 'neon'
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      position={p.position}
      rotation={p.rotation}
      name={`part-${p.id}`}
      sensor
      onIntersectionEnter={({ other }) => {
        if (other.rigidBodyObject?.name === 'player') onTouch?.(p.id)
      }}
    >
      <mesh
        scale={p.scale}
        castShadow
        receiveShadow
        onClick={
          onClick
            ? (e) => {
                e.stopPropagation()
                onClick(p.id)
              }
            : undefined
        }
      >
        <PartGeometry type={p.type} />
        <meshStandardMaterial
          color={p.color}
          roughness={mp.roughness}
          metalness={mp.metalness}
          emissive={isEmissive ? p.color : '#000'}
          emissiveIntensity={isEmissive ? 0.3 : 0}
        />
      </mesh>
      {/* Живой ⚡-маркер над запрограммированным объектом */}
      <mesh position={[0, Math.max(p.scale[1], 1) + 0.6, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial color="#FFD43C" />
      </mesh>
    </RigidBody>
  )
}, partsEqualWithCallbacks)

/** memo-equality: сравниваем только то, что меняет геометрию/цвет/трансформ. */
function partsEqual(prev: { p: PartObject }, next: { p: PartObject }): boolean {
  const a = prev.p
  const b = next.p
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.color === b.color &&
    a.material === b.material &&
    a.position[0] === b.position[0] &&
    a.position[1] === b.position[1] &&
    a.position[2] === b.position[2] &&
    a.rotation[0] === b.rotation[0] &&
    a.rotation[1] === b.rotation[1] &&
    a.rotation[2] === b.rotation[2] &&
    a.scale[0] === b.scale[0] &&
    a.scale[1] === b.scale[1] &&
    a.scale[2] === b.scale[2]
  )
}

/** memo-equality для DynamicPart: + проверяем стабильность колбэков. */
function partsEqualWithCallbacks(
  prev: { p: PartObject; onTouch?: (id: string) => void; onClick?: (id: string) => void },
  next: { p: PartObject; onTouch?: (id: string) => void; onClick?: (id: string) => void }
): boolean {
  return (
    partsEqual(prev, next) &&
    prev.onTouch === next.onTouch &&
    prev.onClick === next.onClick
  )
}

const COLOR_MAP: Record<string, string> = {
  red: '#ff5464', blue: '#4c97ff', green: '#48c774', yellow: '#ffd644',
  purple: '#c879ff', orange: '#ff8c1a', black: '#2a3340', white: '#f0f0f0',
  pink: '#ff5ab1', cyan: '#88d4ff',
}

function findPartAt(
  state: EditorState,
  x: number,
  y: number,
  z: number,
  eps = 0.6
): PartObject | undefined {
  return state.parts.find(
    (p) =>
      Math.abs(p.position[0] - x) < eps &&
      Math.abs(p.position[1] - y) < eps &&
      Math.abs(p.position[2] - z) < eps
  )
}

/**
 * Построить Python-исполняемый фрагмент: prelude + пользовательский код + вызов handler-а.
 */
function buildRunCode(objectId: string, objectPython: string, handlerName: string): string {
  const wrapped = wrapObjectPython(objectId, objectPython)
  return `${wrapped}\nif "${handlerName}" in dir():\n    ${handlerName}()\n`
}

export default function TestTab({ state }: { state: EditorState }) {
  const avatar = useMemo(() => loadAvatar(), [])
  const spawnPart = state.parts.find((p) => p.type === 'spawn')
  const spawnPos: [number, number, number] = spawnPart
    ? [spawnPart.position[0], spawnPart.position[1] + 2, spawnPart.position[2]]
    : [0, 3, 0]

  const stateRef = useRef(state)
  stateRef.current = state
  const isExecutingRef = useRef(false)
  const tickIntervalsRef = useRef<number[]>([])
  const firedOnStartRef = useRef(false)

  // ─── Запустить обработчик конкретного объекта ───
  const runObjectHandler = async (partId: string, handler: string) => {
    const p = stateRef.current.parts.find((x) => x.id === partId)
    if (!p?.scripts?.python) return
    if (!p.scripts.python.includes(`def ${handler}`)) return
    try {
      const code = buildRunCode(partId, p.scripts.python, handler)
      const cmds = (await runPython(code)) as unknown as WorldCommand[]
      emitCommands(cmds)
    } catch (err) {
      console.warn(`[ObjectScript ${partId}.${handler}] failed:`, err)
    }
  }

  // On-start — один раз при монтировании Test-таба
  useEffect(() => {
    if (firedOnStartRef.current) return
    firedOnStartRef.current = true
    for (const p of state.parts) {
      if (p.scripts?.python && p.scripts.python.includes('def on_start')) {
        void runObjectHandler(p.id, 'on_start')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tick-handlers — раз в секунду ищем `on_tick` и дёргаем
  useEffect(() => {
    // Снести старые интервалы
    tickIntervalsRef.current.forEach((id) => window.clearInterval(id))
    tickIntervalsRef.current = []

    for (const p of state.parts) {
      if (p.scripts?.python && p.scripts.python.includes('def on_tick')) {
        // Interval 1с (в прелюде нет точного парсинга комментария — берём дефолт)
        const id = window.setInterval(() => void runObjectHandler(p.id, 'on_tick'), TICK_INTERVAL_MS)
        tickIntervalsRef.current.push(id)
      }
    }
    return () => {
      tickIntervalsRef.current.forEach((id) => window.clearInterval(id))
      tickIntervalsRef.current = []
    }
  }, [state.parts])

  // Touch events — дёргаются через DynamicPart sensor ниже.
  // useCallback — чтобы memo-сравнение в DynamicPart считало проп стабильным.
  const onPartTouched = useCallback((partId: string) => {
    void runObjectHandler(partId, 'on_touch')
     
  }, [])

  // Click события на объекты — ловим mesh.onClick в DynamicPart
  const onPartClicked = useCallback((partId: string) => {
    void runObjectHandler(partId, 'on_click')
     
  }, [])

  // Key events — глобальный keydown раздаёт on_key_<Code> всем объектам,
  // которые определили такой handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const handler = `on_key_${e.code}`
      for (const p of stateRef.current.parts) {
        if (p.scripts?.python && p.scripts.python.includes(`def ${handler}`)) {
          void runObjectHandler(p.id, handler)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
     
  }, [])

  // stop_all — обрубаем tick-интервалы и команды, которые ещё в очереди
  useEffect(() => {
    const onStopAll = () => {
      tickIntervalsRef.current.forEach((id) => window.clearInterval(id))
      tickIntervalsRef.current = []
      isExecutingRef.current = false
    }
    window.addEventListener('ek:stop-all', onStopAll)
    return () => window.removeEventListener('ek:stop-all', onStopAll)
  }, [])

  // Broadcasts — перехват obj_broadcast и дёрганье всех on_<name> у всех частей
  const runBroadcast = async (name: string) => {
    const handler = `on_${name.replace(/[^a-zA-Z_а-яА-Я0-9]/g, '_')}`
    for (const p of stateRef.current.parts) {
      if (p.scripts?.python && p.scripts.python.includes(`def ${handler}`)) {
        void runObjectHandler(p.id, handler)
      }
    }
  }

  useEffect(() => {
    const unsub = subscribeCommands(async (cmds) => {
      if (isExecutingRef.current) return
      isExecutingRef.current = true
      const live = getEditorState().autoRun
      const step = live ? LIVE_STEP_MS : COMMAND_STEP_MS
      try {
        for (const cmd of cmds) {
          await executeCmd(cmd, stateRef, runBroadcast)
          if (cmd.op === 'wait') {
            // wait сам паузит
          } else {
            await delay(step)
          }
        }
      } finally {
        isExecutingRef.current = false
      }
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="studio-test">
      <KeyboardControls map={KEYS}>
        <Canvas
          shadows="soft"
          camera={{ position: [spawnPos[0], spawnPos[1] + 4, spawnPos[2] + 8], fov: 60, far: 600 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={[state.scene.skyBottom]} />
          <GradientSky top={state.scene.skyTop} bottom={state.scene.skyBottom} />
          <VoxelClouds />
          <Sun position={[50, 45, 20]} />

          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
          <directionalLight
            position={[50, 45, 20]}
            intensity={1.3}
            color="#fff3d8"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={150}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />
          <directionalLight position={[-30, 20, -20]} intensity={0.45} color="#b0d8ff" />

          <Physics gravity={[0, -25, 0]}>
            {/*
             * Perf: вместо 287+ отдельных <RigidBody> на каждый prop —
             * один общий fixed RigidBody для статических (без скриптов)
             * частей с merged-collider (cuboid auto-собирает колайдеры
             * по всем вложенным мешам). Динамические (со скриптами) —
             * остаются с собственным sensor RigidBody для on_touch.
             */}
            <RigidBody type="fixed" colliders="cuboid" name="static-props">
              {state.parts
                .filter((p) => !p.scripts)
                .map((p) => (
                  <StaticPartMesh key={p.id} p={p} />
                ))}
            </RigidBody>
            {state.parts
              .filter((p) => Boolean(p.scripts))
              .map((p) => (
                <DynamicPart key={p.id} p={p} onTouch={onPartTouched} onClick={onPartClicked} />
              ))}
            <Player avatar={avatar} startPos={spawnPos} />
          </Physics>

          <CameraController />
          <BuildModeController />
        </Canvas>
      </KeyboardControls>
      <div className="test-help">
        <strong>WASD</strong> — ходить · <strong>Space</strong> — прыжок · <strong>B</strong> — стройка · клик — захват мыши
      </div>
      <SayBubble />
      <CoinHud />
      <BuildModeHud />
      <LiveOverlay />
    </div>
  )
}

async function executeCmd(
  cmd: WorldCommand,
  stateRef: React.MutableRefObject<EditorState>,
  onBroadcast: (name: string) => void
) {
  switch (cmd.op) {
    case 'place_block': {
      const color = COLOR_MAP[cmd.color] ?? '#888888'
      const mat = (cmd.material as MaterialType) ?? 'plastic'
      addPart({
        type: 'cube',
        position: [cmd.x, cmd.y, cmd.z],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
        color,
        material: mat,
        anchored: true,
      })
      break
    }
    case 'remove_block': {
      const p = findPartAt(stateRef.current, cmd.x, cmd.y, cmd.z)
      if (p) deletePart(p.id)
      break
    }
    case 'paint_block': {
      const p = findPartAt(stateRef.current, cmd.x, cmd.y, cmd.z)
      if (p) {
        const color = COLOR_MAP[cmd.color] ?? p.color
        updatePart(p.id, { color })
      }
      break
    }
    case 'set_sky':
      setLightingPreset(cmd.preset)
      break
    case 'player_move':
      window.dispatchEvent(new CustomEvent('ek:player-move', { detail: { dx: cmd.dx, dz: cmd.dz } }))
      break
    case 'player_turn':
      window.dispatchEvent(new CustomEvent('ek:player-turn', { detail: { degrees: cmd.degrees } }))
      break
    case 'player_jump':
      window.dispatchEvent(new CustomEvent('ek:player-jump'))
      break
    case 'player_say':
      playerSay(cmd.text)
      break
    case 'add_score':
      addCoin(cmd.n)
      break
    case 'set_score':
      setScore(cmd.n)
      break
    case 'wait':
      await delay(Math.round(cmd.seconds * 1000))
      break

    // ─── Per-object commands ───
    case 'obj_move': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (p) {
        updatePart(p.id, {
          position: [p.position[0] + cmd.dx, p.position[1] + cmd.dy, p.position[2] + cmd.dz],
        })
      }
      break
    }
    case 'obj_rotate': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (p) {
        const rad = cmd.deg * DEG_TO_RAD
        updatePart(p.id, {
          rotation: [p.rotation[0], p.rotation[1] + rad, p.rotation[2]],
        })
      }
      break
    }
    case 'obj_set_color': {
      const color = COLOR_MAP[cmd.color] ?? cmd.color
      updatePart(cmd.target, { color })
      break
    }
    case 'obj_set_scale': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (p) updatePart(p.id, { scale: [cmd.s, cmd.s, cmd.s] })
      break
    }
    case 'obj_say': {
      // Показываем как player-say (floating) — объект-агностик пока
      playerSay(cmd.text)
      break
    }
    case 'obj_hide': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (p) updatePart(p.id, { scale: [0.001, 0.001, 0.001] })
      break
    }
    case 'obj_show': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (p) updatePart(p.id, { scale: [1, 1, 1] })
      break
    }
    case 'obj_destroy': {
      deletePart(cmd.target)
      break
    }
    case 'obj_broadcast': {
      onBroadcast(cmd.name)
      break
    }
    case 'obj_set_position': {
      updatePart(cmd.target, { position: [cmd.x, cmd.y, cmd.z] })
      break
    }
    case 'obj_glide_to': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (!p) break
      const from: [number, number, number] = [p.position[0], p.position[1], p.position[2]]
      const to: [number, number, number] = [cmd.x, cmd.y, cmd.z]
      const frames = Math.max(1, Math.round(cmd.seconds * ANIM_FPS))
      for (let i = 1; i <= frames; i++) {
        const t = i / frames
        updatePart(cmd.target, {
          position: [
            from[0] + (to[0] - from[0]) * t,
            from[1] + (to[1] - from[1]) * t,
            from[2] + (to[2] - from[2]) * t,
          ],
        })
        await delay(Math.round(1000 / ANIM_FPS))
      }
      break
    }
    case 'obj_change_size': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (!p) break
      const s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, p.scale[0] + cmd.delta))
      updatePart(cmd.target, { scale: [s, s, s] })
      break
    }
    case 'obj_flash': {
      const p = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (!p) break
      const prev = p.color
      const flashColor = COLOR_MAP[cmd.color] ?? cmd.color
      updatePart(cmd.target, { color: flashColor })
      await delay(Math.round(cmd.seconds * 1000))
      const still = stateRef.current.parts.find((x) => x.id === cmd.target)
      if (still) updatePart(cmd.target, { color: prev })
      break
    }
    case 'stop_all': {
      window.dispatchEvent(new CustomEvent('ek:stop-all'))
      break
    }

    default:
      break
  }
}
