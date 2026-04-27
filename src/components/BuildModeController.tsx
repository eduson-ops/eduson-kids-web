import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  getBuildState,
  harvestPiece,
  onPlacePiece,
  pieceSize,
  setSelectedKind,
  snapToGrid,
  subscribeBuild,
  toggleBuild,
  type BuildPieceKind,
  type BuildModeState,
} from '../lib/buildModeState'
import {
  addPart,
  deletePart,
  getState as getEditorState,
} from '../studio/editorState'
import { SFX } from '../lib/audio'

/**
 * BuildModeController — TPS-стройка поверх Test/Play режима.
 *
 * Контракт:
 *   B       — toggle build mode
 *   1/2/3/4 — выбрать тип детали (Wall/Floor/Ramp/Roof)
 *   ЛКМ     — поставить деталь по ghost-preview (если place valid)
 *   ПКМ     — pickup: ближайший prefab под курсором удаляется, +1 в инвентарь
 *
 * Рендерит ghost только пока build mode активен.
 * Raycast из камеры вперёд до 25 ед., снап-позиция = grid (2 ед.).
 */
export default function BuildModeController() {
  const { camera, gl, scene, pointer } = useThree()
  const ghostRef = useRef<THREE.Mesh>(null!)
  const [bs, setBs] = useState<BuildModeState>(getBuildState())
  const raycaster = useRef(new THREE.Raycaster())
  const ghostPos = useRef(new THREE.Vector3())
  const validRef = useRef(false)

  // P-08: Кэшированный список build-targets — обходим scene лишь по запросу
  // и собираем объекты с пользовательским data.buildTarget=true либо name начинается
  // с 'part-'. Это убирает full-tree raycast по всем childcen scene.
  const collectBuildTargets = (): THREE.Object3D[] => {
    const out: THREE.Object3D[] = []
    scene.traverse((obj) => {
      const ud = obj.userData as { buildTarget?: boolean } | undefined
      if (ud?.buildTarget || (obj.name && obj.name.startsWith('part-'))) {
        out.push(obj)
      }
    })
    return out
  }

  // Subscribe to build mode store
  useEffect(() => subscribeBuild(setBs), [])

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Не перехватываем если пользователь печатает в input/textarea/contenteditable
      const tgt = e.target as HTMLElement | null
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return

      if (e.code === 'KeyB') {
        toggleBuild()
        SFX.click()
        e.preventDefault()
      } else if (e.code === 'Digit1') {
        setSelectedKind('wall')
      } else if (e.code === 'Digit2') {
        setSelectedKind('floor')
      } else if (e.code === 'Digit3') {
        setSelectedKind('ramp')
      } else if (e.code === 'Digit4') {
        setSelectedKind('roof')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Place / pickup via pointer (mouse + touch unified)
  useEffect(() => {
    const canvas = gl.domElement
    const onPointer = (e: PointerEvent) => {
      const buildState = getBuildState()
      if (!buildState.active) return

      // ЛКМ — place
      if (e.button === 0) {
        if (!validRef.current) return
        const kind = buildState.selectedKind
        const pos: [number, number, number] = [ghostPos.current.x, ghostPos.current.y, ghostPos.current.z]
        const scale = pieceSize(kind)
        addPart({
          type: kind,
          position: pos,
          scale,
          rotation: [0, 0, 0],
          color: buildState.color,
          material: kind === 'wall' || kind === 'floor' ? 'wood' : 'plastic',
          anchored: true,
        })
        onPlacePiece(kind)
        SFX.click()
        e.preventDefault()
      }

      // ПКМ — pickup (забрать деталь под курсором)
      if (e.button === 2) {
        e.preventDefault()
        // P-08: используем актуальный pointer NDC + ограничиваем raycast build-targets
        raycaster.current.setFromCamera(pointer, camera)
        const targets = collectBuildTargets()
        const hits = raycaster.current.intersectObjects(targets, true)
        for (const hit of hits) {
          // Ищем RigidBody с именем part-<id>
          let obj: THREE.Object3D | null = hit.object
          let partId: string | null = null
          while (obj) {
            const n = obj.name
            if (n && n.startsWith('part-')) {
              partId = n.slice('part-'.length)
              break
            }
            obj = obj.parent
          }
          if (!partId) continue
          const editor = getEditorState()
          const part = editor.parts.find((p) => p.id === partId)
          if (!part) continue
          // Pickup — только build-pieces (wall/floor/ramp/roof). Остальное не трогаем.
          if (part.type === 'wall' || part.type === 'floor' || part.type === 'ramp' || part.type === 'roof') {
            harvestPiece(part.type)
            deletePart(part.id)
            SFX.click()
          }
          break
        }
      }
    }
    const onContextMenu = (e: MouseEvent) => {
      if (getBuildState().active) e.preventDefault()
    }
    canvas.addEventListener('pointerdown', onPointer, { passive: false })
    canvas.addEventListener('contextmenu', onContextMenu)
    return () => {
      canvas.removeEventListener('pointerdown', onPointer)
      canvas.removeEventListener('contextmenu', onContextMenu)
    }
  }, [camera, gl, scene, pointer])

  // Raycast ghost по каждому кадру, когда build mode активен
  useFrame(() => {
    if (!bs.active || !ghostRef.current) {
      if (ghostRef.current) ghostRef.current.visible = false
      return
    }
    ghostRef.current.visible = true

    // P-08: используем pointer NDC из R3F вместо хардкода (0,0)
    raycaster.current.setFromCamera(pointer, camera)
    const origin = camera.position
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)

    // Пересечение с гор. плоскостью Y=0 (база для пола/рампы/крыши)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hitPoint = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(groundPlane, hitPoint)

    if (!hitPoint || !isFinite(hitPoint.x)) {
      // fallback — спроецировать вперёд на 10 ед.
      hitPoint.copy(origin).addScaledVector(dir, 10)
    }

    // Ограничить расстояние от игрока (чтобы не строили на другом конце карты)
    const maxDist = 18
    if (origin.distanceTo(hitPoint) > maxDist) {
      hitPoint.copy(origin).addScaledVector(dir.normalize(), maxDist)
    }

    const size = pieceSize(bs.selectedKind)
    const sx = snapToGrid(hitPoint.x)
    const sz = snapToGrid(hitPoint.z)
    // Y — зависит от типа: floor лежит на Y=0, wall от Y=size.y/2, ramp/roof чуть выше
    let sy = 0
    switch (bs.selectedKind) {
      case 'floor':
        sy = 0
        break
      case 'wall':
        sy = size[1] / 2
        break
      case 'ramp':
      case 'roof':
        sy = size[1] / 2
        break
    }
    ghostPos.current.set(sx, sy, sz)
    ghostRef.current.position.copy(ghostPos.current)
    ghostRef.current.scale.set(size[0], size[1], size[2])

    // Валидность: не ставим в блок который уже стоит на той же позиции
    const editor = getEditorState()
    const occupied = editor.parts.some(
      (p) =>
        Math.abs(p.position[0] - sx) < 0.1 &&
        Math.abs(p.position[1] - sy) < 0.1 &&
        Math.abs(p.position[2] - sz) < 0.1
    )
    validRef.current = !occupied

    const mat = ghostRef.current.material as THREE.MeshBasicMaterial
    mat.color.set(validRef.current ? '#6bff9a' : '#ff6b6b')
    mat.opacity = validRef.current ? 0.45 : 0.35
  })

  if (!bs.active) return null

  const [gx, gy, gz] = [ghostPos.current.x, ghostPos.current.y, ghostPos.current.z]

  return (
    <mesh ref={ghostRef} position={[gx, gy, gz]}>
      <PieceGeometry kind={bs.selectedKind} />
      <meshBasicMaterial color="#6bff9a" transparent opacity={0.45} wireframe={false} depthWrite={false} />
    </mesh>
  )
}

/**
 * PieceGeometry — примитивы для каждого типа build-piece.
 * Использует базовую ×1 геометрию, параметризация через scale на mesh-родителе.
 */
export function PieceGeometry({ kind }: { kind: BuildPieceKind }) {
  switch (kind) {
    case 'wall':
    case 'floor':
      return <boxGeometry args={[1, 1, 1]} />
    case 'ramp':
      // Наклонная призма: bottom face на Y=0, hypotenuse от (-0.5, -0.5, -0.5) до (0.5, 0.5, 0.5)
      return <RampGeometry />
    case 'roof':
      // Пирамида 4-гранная
      return <coneGeometry args={[0.7, 1, 4]} />
  }
}

/**
 * RampGeometry — диагональная призма-клин, base 1×1 на полу, верх наклонный.
 * Собирается через BufferGeometry с 6 вершинами (две треугольные торцевые стенки
 * + прямоугольные пол, задняя стенка и наклон).
 */
function RampGeometry() {
  // 6 vertices: A=front-bottom-left, B=front-bottom-right, C=back-bottom-left,
  //             D=back-bottom-right, E=back-top-left, F=back-top-right
  const verts = new Float32Array([
    // bottom (A B D C)
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,   0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,
    // back (C D F E)
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,   0.5,  0.5, -0.5,  -0.5,  0.5, -0.5,
    // slope (A B F E)
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5, -0.5,
    -0.5, -0.5,  0.5,   0.5,  0.5, -0.5,  -0.5,  0.5, -0.5,
    // left side triangle (A C E)
    -0.5, -0.5,  0.5,  -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,
    // right side triangle (B D F) — wind reverse for outward normal
     0.5, -0.5,  0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
  ])
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(verts, 3))
  geom.computeVertexNormals()
  return <primitive object={geom} attach="geometry" />
}
