import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef, useState } from 'react'
import { Vector2 } from 'three'

/**
 * Постпроцессинг:
 *  - Bloom на ярких emissive объектах (финиш, монетки)
 *  - ChromaticAberration усиливается с движением → "speed-blur" ощущение
 *  - Vignette пульсирует от скорости
 *  - FOV камеры слегка раздвигается на высокой скорости (wide-angle на бегу)
 *
 * Истинного motion-blur (с velocity buffer) в @react-three/postprocessing нет
 * без ручной настройки — мы компенсируем этими тремя эффектами + FOV.
 */
export default function PostFX() {
  const offset = useRef(new Vector2(0.0008, 0.0008))
  const [, force] = useState(0)
  const speedRef = useRef(0)
  const { camera } = useThree()

  useFrame((_, dt) => {
    // Speed считаем из delta позиции камеры в горизонтальной плоскости.
    // (Player сам меняет позицию камеры в своём useFrame — это будет ближайший
    // прокси к скорости игрока.)
    const cp = camera.position
    const key = `${cp.x.toFixed(2)}_${cp.z.toFixed(2)}`
    const prev = (camera as unknown as { __ek_prevPos?: string }).__ek_prevPos
    if (prev && prev !== key) {
      // простая оценка скорости — изменение за кадр, нормированное
      const [px, pz] = prev.split('_').map(Number)
      const distance = Math.hypot(cp.x - px, cp.z - pz)
      const instantSpeed = distance / Math.max(0.016, dt)
      speedRef.current = speedRef.current * 0.85 + instantSpeed * 0.15
    }
    ;(camera as unknown as { __ek_prevPos?: string }).__ek_prevPos = key

    const s = Math.min(1, speedRef.current / 10) // 0..1
    // chromatic aberration offset
    const chrom = 0.0008 + s * 0.004
    offset.current.set(chrom, chrom)

    // FOV
    if ('isPerspectiveCamera' in camera && camera.isPerspectiveCamera) {
      const persp = camera as import('three').PerspectiveCamera
      const targetFov = 60 + s * 8
      persp.fov += (targetFov - persp.fov) * 0.1
      persp.updateProjectionMatrix()
    }

    // force re-render for vignette amount
    force((n) => (n + 1) % 60)
  })

  const s = Math.min(1, speedRef.current / 10)

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset.current}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.35 + s * 0.15} />
    </EffectComposer>
  )
}
