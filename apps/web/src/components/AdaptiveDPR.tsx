import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

/**
 * Определяет iPad (включая новые, которые маскируются под MacIntel).
 * На iPad принудительно держим DPR=1 — Retina + WebGL вызывает перегрев
 * и thermal-throttling уже через 2-3 минуты игры.
 */
function isIPad(): boolean {
  if (typeof navigator === 'undefined') return false
  if (/iPad/i.test(navigator.userAgent)) return true
  // iPadOS 13+ рапортует MacIntel — отличаем по touch-поинтам
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent)
}

/**
 * Adaptive DPR controller — мониторит средний FPS (60-frame rolling window)
 * и меняет pixel ratio рендерера:
 *   - средний FPS <45 в течение 1с → dpr=1.0 (экономия GPU)
 *   - средний FPS >58 в течение 3с → dpr=1.5 (поднять качество)
 *
 * Стартовый DPR:
 *   - iPad            → 1.0 (принудительно, против перегрева — паттерн Bloxels)
 *   - мобильный       → min(devicePixelRatio, 1.5)
 *   - desktop         → min(devicePixelRatio, 2.0)
 */
export default function AdaptiveDPR() {
  const { gl } = useThree()

  const fpsBuf = useRef<number[]>([])
  const lastT = useRef(performance.now())
  const lowSince = useRef<number | null>(null)
  const highSince = useRef<number | null>(null)
  const curDpr = useRef(1)

  // Инициализация стартового DPR — ОДИН раз при монтаже
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1
    let initial: number
    if (isIPad()) {
      initial = 1
    } else if (isMobile()) {
      initial = Math.min(raw, 1.5)
    } else {
      initial = Math.min(raw, 2)
    }
    curDpr.current = initial
    gl.setPixelRatio(initial)
  }, [gl])

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
      // iPad — никогда не поднимаем выше 1, даже при высоком FPS
      const cap = isIPad() ? 1.0 : 1.5
      if (now - highSince.current > 3000 && curDpr.current < cap) {
        curDpr.current = cap
        gl.setPixelRatio(cap)
        highSince.current = null
      }
    } else {
      lowSince.current = null
      highSince.current = null
    }
  })

  return null
}
