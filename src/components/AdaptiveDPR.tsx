import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'

/**
 * Adaptive DPR controller — мониторит средний FPS (60-frame rolling window)
 * и меняет pixel ratio рендерера:
 *   - средний FPS <45 в течение 1с → dpr=1.0 (экономия GPU)
 *   - средний FPS >58 в течение 3с → dpr=1.5 (поднять качество)
 * Запускается внутри <Canvas> — не рендерит ничего.
 */
export default function AdaptiveDPR() {
  const { gl } = useThree()

  const fpsBuf = useRef<number[]>([])
  const lastT = useRef(performance.now())
  const lowSince = useRef<number | null>(null)
  const highSince = useRef<number | null>(null)
  const curDpr = useRef(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2))

  useFrame(() => {
    const now = performance.now()
    const dtMs = Math.max(1, now - lastT.current)
    lastT.current = now
    const fps = 1000 / dtMs
    fpsBuf.current.push(fps)
    if (fpsBuf.current.length > 60) fpsBuf.current.shift()
    if (fpsBuf.current.length < 60) return

    const avg = fpsBuf.current.reduce((a, b) => a + b, 0) / fpsBuf.current.length

    if (avg < 45) {
      highSince.current = null
      if (!lowSince.current) lowSince.current = now
      if (now - lowSince.current > 1000 && curDpr.current > 1.0) {
        curDpr.current = 1.0
        gl.setPixelRatio(1.0)
        lowSince.current = null
      }
    } else if (avg > 58) {
      lowSince.current = null
      if (!highSince.current) highSince.current = now
      if (now - highSince.current > 3000 && curDpr.current < 1.5) {
        curDpr.current = 1.5
        gl.setPixelRatio(1.5)
        highSince.current = null
      }
    } else {
      lowSince.current = null
      highSince.current = null
    }
  })

  return null
}
