import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { MOUSE, TOUCH } from 'three'
import GradientSky from '../components/GradientSky'
import Sun from '../components/Sun'
import { PieceGeometry } from '../components/BuildModeController'
import { pieceSize, type BuildPieceKind } from '../lib/buildModeState'
import { getShadowMapSize } from '../lib/deviceTier'

// Размер теневой карты: 512 на low / 1024 medium / 2048 high.
const SHADOW_MAP_SIZE = getShadowMapSize()
// Когда появится postprocessing — оборачивать в `canPostfx()` условный рендер.

// ─── Константы редактора (raised из magic numbers) ───────────────────────
/** Толщина «обводки» выделенного part'а в долях от scale. */
const SELECTION_OUTLINE_SCALE = 1.04
/** Прозрачность wireframe-обводки выделения. */
const SELECTION_OUTLINE_OPACITY = 0.85
/** Эмиссивная подсветка для светящихся материалов (coin/finish/neon). */
const EMISSIVE_INTENSITY_DEFAULT = 0.25
/** Прозрачность ghost-куба placing-preview. */
const PREVIEW_GHOST_OPACITY = 0.5
/** Куда уводим preview-меш до первого raycast'а — чтобы не мигал в (0,0,0). */
const PREVIEW_OFFSCREEN_Y = -100
/** Поднимаем grid чуть выше плоскости, чтобы не было z-fighting'а. */
const GRID_Y_LIFT = 0.05
/** Опускаем земляную плоскость, чтобы пропсы не утопали. */
const GROUND_Y_DROP = -0.02
/** Позиция солнца: высоко-слева-сбоку — драматичные тени без выгорания. */
const SUN_POS: [number, number, number] = [50, 45, 20]
/** Контровая подсветка с противоположной стороны — тень не чернеет. */
const FILL_LIGHT_POS: [number, number, number] = [-30, 20, -20]
/** Начальная позиция камеры редактора. */
const BUILD_CAM_POS: [number, number, number] = [8, 9, 12]
/** Размер сетки (количество делений). */
const GRID_DIVISIONS = 40
/** Размер земляной плоскости (единицы Three.js). */
const GROUND_PLANE_SIZE = 200
/** Радиус и высота маркера точки старта. */
const SPAWN_MARKER_RADIUS = 0.35
const SPAWN_MARKER_HEIGHT = 0.08
const SPAWN_MARKER_SEGMENTS = 16
import {
  addPart,
  getState,
  selectPart,
  subscribe,
  type EditorState,
  type MaterialType,
  type PartObject,
} from './editorState'

// Сетка + наземная плоскость для удобной расстановки
function EditGrid({ onPlace }: { onPlace: (pos: [number, number, number]) => void }) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (getState().tool !== 'place') return
    e.stopPropagation()
    // Snap to integer grid
    const x = Math.round(e.point.x)
    const z = Math.round(e.point.z)
    onPlace([x, 0.5, z])
  }
  return (
    <>
      <gridHelper
        args={[GRID_DIVISIONS, GRID_DIVISIONS, '#88a0c0', '#5a7291']}
        position={[0, GRID_Y_LIFT, 0]}
        onUpdate={(self) => {
          const mat = self.material as THREE.Material
          mat.depthWrite = false
          mat.transparent = true
          self.renderOrder = 1
        }}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GROUND_Y_DROP, 0]}
        onClick={handleClick}
        receiveShadow
      >
        <planeGeometry args={[GROUND_PLANE_SIZE, GROUND_PLANE_SIZE]} />
        <meshStandardMaterial
          color="#6a9a55"
          roughness={0.95}
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
    </>
  )
}

// Материалы — пресеты под Roblox-style flat-shaded
function materialProps(m: MaterialType): {
  roughness: number
  metalness: number
} {
  switch (m) {
    case 'metal':
      return { roughness: 0.3, metalness: 0.8 }
    case 'neon':
      return { roughness: 0.2, metalness: 0 }
    case 'wood':
      return { roughness: 0.9, metalness: 0 }
    case 'stone':
      return { roughness: 0.95, metalness: 0 }
    case 'grass':
      return { roughness: 0.95, metalness: 0 }
    default:
      return { roughness: 0.85, metalness: 0 }
  }
}

function PartMesh({
  part,
  isSelected,
  onClick,
}: {
  part: PartObject
  isSelected: boolean
  onClick: (id: string) => void
}) {
  const mp = materialProps(part.material)
  const isEmissive = part.type === 'coin' || part.type === 'finish' || part.material === 'neon'

  return (
    <group position={part.position} rotation={part.rotation}>
      <mesh
        scale={part.scale}
        castShadow
        receiveShadow
        onClick={(e) => {
          // В place-режиме НЕ поглощаем клик — он должен долететь до grid
          // и поставить блок рядом. stopPropagation только в select-режиме.
          if (getState().tool !== 'select') return
          e.stopPropagation()
          onClick(part.id)
        }}
      >
        {part.type === 'coin' ? (
          <cylinderGeometry args={[SPAWN_MARKER_RADIUS, SPAWN_MARKER_RADIUS, SPAWN_MARKER_HEIGHT, SPAWN_MARKER_SEGMENTS]} />
        ) : part.type === 'ramp' || part.type === 'roof' ? (
          <PieceGeometry kind={part.type as BuildPieceKind} />
        ) : (
          <boxGeometry args={[1, 1, 1]} />
        )}
        <meshStandardMaterial
          color={part.color}
          roughness={mp.roughness}
          metalness={mp.metalness}
          emissive={isEmissive ? part.color : '#000'}
          emissiveIntensity={isEmissive ? EMISSIVE_INTENSITY_DEFAULT : 0}
        />
      </mesh>
      {/* Selection outline */}
      {isSelected && (
        <mesh scale={[
          part.scale[0] * SELECTION_OUTLINE_SCALE,
          part.scale[1] * SELECTION_OUTLINE_SCALE,
          part.scale[2] * SELECTION_OUTLINE_SCALE,
        ]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffd644" wireframe transparent opacity={SELECTION_OUTLINE_OPACITY} />
        </mesh>
      )}
    </group>
  )
}

// Preview-куб под курсором в режиме place
function PlacingPreview() {
  const [state, setState] = useState<EditorState>(getState())
  const ref = useRef<THREE.Mesh>(null!)
  useEffect(() => subscribe(setState), [])
  useFrame(({ pointer, raycaster, camera }) => {
    if (!ref.current || state.tool !== 'place') return
    raycaster.setFromCamera(pointer, camera)
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hit = new THREE.Vector3()
    raycaster.ray.intersectPlane(ground, hit)
    if (hit) {
      ref.current.position.set(Math.round(hit.x), 0.5, Math.round(hit.z))
      ref.current.visible = true
    }
  })
  if (state.tool !== 'place') return null
  return (
    <mesh ref={ref} position={[0, PREVIEW_OFFSCREEN_Y, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={state.placingColor} transparent opacity={PREVIEW_GHOST_OPACITY} />
    </mesh>
  )
}

interface Props {
  state: EditorState
}

export default function BuildScene({ state }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useRef<any>(null)

  const onPlace = (pos: [number, number, number]) => {
    const s = getState()
    let scale: [number, number, number] = [1, 1, 1]
    let position = pos
    if (s.placingType === 'wall' || s.placingType === 'floor' || s.placingType === 'ramp' || s.placingType === 'roof') {
      scale = pieceSize(s.placingType as BuildPieceKind)
      // Для build-pieces правим Y чтобы ghost вставал корректно: floor на Y=0,
      // остальные от Y=scale[1]/2
      const y = s.placingType === 'floor' ? 0 : scale[1] / 2
      position = [pos[0], y, pos[2]]
    }
    addPart({
      type: s.placingType,
      position,
      scale,
      rotation: [0, 0, 0],
      color: s.placingColor,
      material: 'plastic',
      anchored: true,
    })
  }

  return (
    <Canvas
      shadows="soft"
      camera={{ position: BUILD_CAM_POS, fov: 45, near: 0.1, far: 600 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      onPointerMissed={() => selectPart(null)}
      // ПКМ зарезервирован за OrbitControls.PAN — браузерное контекст-меню
      // должно быть подавлено, иначе любая попытка панорамировать сцену
      // открывает «копировать картинку» вместо движения камеры.
      onContextMenu={(e) => e.preventDefault()}
    >
      <color attach="background" args={[state.scene.skyBottom]} />
      <GradientSky top={state.scene.skyTop} bottom={state.scene.skyBottom} />
      <Sun position={SUN_POS} />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
      <directionalLight
        position={SUN_POS}
        intensity={1.3}
        color="#fff3d8"
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-near={0.5}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      <directionalLight position={FILL_LIGHT_POS} intensity={0.45} color="#b0d8ff" />

      <EditGrid onPlace={onPlace} />

      {state.parts.map((p) => (
        <PartMesh
          key={p.id}
          part={p}
          isSelected={p.id === state.selectedId}
          onClick={selectPart}
        />
      ))}

      <PlacingPreview />

      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.15}
        makeDefault
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={80}
        target={[0, 1, 0]}
      />
    </Canvas>
  )
}
