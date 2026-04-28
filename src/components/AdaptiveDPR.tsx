import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { detectDeviceTier, seedDefaultQualityFromTier, QUALITY_KEY } from '../lib/deviceTier'

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

const FPS_SAMPLE_SIZE = 60
const FPS_LOW_THRESHOLD = 45
const FPS_HIGH_THRESHOLD = 58
const DOWNSCALE_HYSTERESIS_MS = 1000
const UPSCALE_HYSTERESIS_MS = 3000

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

  const overrideDpr = useRef<number | null>(null)

  // Инициализация стартового DPR — ОДИН раз при монтаже
  useEffect(() => {
    // Для low-end без пользовательского выбора — ставим ek_quality='low'
    // ДО чтения saved ниже, чтобы UI-дропдаун и логика совпадали.
    seedDefaultQualityFromTier()

    const raw = typeof window !== 'undefined' ? window.devicePixelRatio : 1
    const tier = detectDeviceTier()
    let initial: number
    if (isIPad()) {
      initial = 1
    } else if (tier === 'low') {
      // Low-tier: жёсткий cap 1.0 даже при высоком FPS
      initial = 1
    } else if (isMobile()) {
      initial = Math.min(raw, 1.5)
    } else {
      initial = Math.min(raw, 2)
    }
    // Apply saved quality preference (всегда побеждает авто-детект)
    const saved = localStorage.getItem(QUALITY_KEY)
    if (saved === 'low') { initial = 1; overrideDpr.current = 1 }
    else if (saved === 'med') { initial = Math.min(raw, 1.5); overrideDpr.current = Math.min(raw, 1.5) }
    else if (saved === 'high') { initial = Math.min(raw, 2); overrideDpr.current = Math.min(raw, 2) }
    else { overrideDpr.current = null }
    curDpr.current = initial
    gl.setPixelRatio(initial)

    const onQuality = (e: Event) => {
      const { quality } = (e as CustomEvent).detail as { quality: string }
      const deviceRaw = window.devicePixelRatio
      if (quality === 'low') { overrideDpr.current = 1; gl.setPixelRatio(1); curDpr.current = 1 }
      else if (quality === 'med') { const v = Math.min(deviceRaw, 1.5); overrideDpr.current = v; gl.setPixelRatio(v); curDpr.current = v }
      else if (quality === 'high') { const v = Math.min(deviceRaw, 2); overrideDpr.current = v; gl.setPixelRatio(v); curDpr.current = v }
      else { overrideDpr.current = null }
    }
    window.addEventListener('ek:quality-change', onQuality)
    return () => window.removeEventListener('ek:quality-change', onQuality)
  }, [gl])

  useFrame(() => {
    // If user picked a manual quality level, skip adaptive logic
    if (overrideDpr.current !== null) return

    const now = performance.now()
    const dtMs = Math.max(1, now - lastT.current)
    lastT.current = now
    const fps = 1000 / dtMs
    fpsBuf.current.push(fps)
    if (fpsBuf.current.length > FPS_SAMPLE_SIZE) fpsBuf.current.shift()
    if (fpsBuf.current.length < FPS_SAMPLE_SIZE) return

    const avg = fpsBuf.current.reduce((a, b) => a + b, 0) / fpsBuf.current.length

    if (avg < FPS_LOW_THRESHOLD) {
      highSince.current = null
      if (!lowSince.current) lowSince.current = now
      if (now - lowSince.current > DOWNSCALE_HYSTERESIS_MS && curDpr.current > 1.0) {
        curDpr.current = 1.0
        gl.setPixelRatio(1.0)
        lowSince.current = null
      }
    } else if (avg > FPS_HIGH_THRESHOLD) {
      lowSince.current = null
      if (!highSince.current) highSince.current = now
      // iPad и low-tier — никогда не поднимаем выше 1, даже при высоком FPS
      const cap = isIPad() || detectDeviceTier() === 'low' ? 1.0 : 1.5
      if (now - highSince.current > UPSCALE_HYSTERESIS_MS && curDpr.current < cap) {
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
