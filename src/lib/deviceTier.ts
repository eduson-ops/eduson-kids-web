/**
 * deviceTier — synchronous device-capability probe.
 *
 * Используется для:
 *   - начального DPR (AdaptiveDPR)
 *   - размера теневой карты (directionalLight shadow-mapSize)
 *   - решения «рендерить ли postprocessing вообще»
 *   - физического timestep (@react-three/rapier)
 *
 * Тир считается ОДИН раз (кэш). На всех SSR/не-browser окружениях возвращает 'medium'.
 *
 * Пороги:
 *   low     — deviceMemory ≤ 2 GB, ИЛИ hardwareConcurrency ≤ 2 ядра,
 *             ИЛИ mobile UA + screen.width < 400
 *   high    — не mobile, deviceMemory ≥ 8 GB, hardwareConcurrency ≥ 8 ядер
 *   medium  — всё остальное
 */

export type DeviceTier = 'low' | 'medium' | 'high'

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number
}

let cached: DeviceTier | null = null

function isMobileUa(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent)
}

function getScreenWidth(): number {
  if (typeof window === 'undefined') return Infinity
  return window.screen?.width ?? Infinity
}

export function detectDeviceTier(): DeviceTier {
  if (cached !== null) return cached
  if (typeof navigator === 'undefined') {
    cached = 'medium'
    return cached
  }

  const nav = navigator as NavigatorWithDeviceMemory
  const mem = nav.deviceMemory ?? 4 // default to 4GB when API missing
  const cores = nav.hardwareConcurrency ?? 4
  const mobile = isMobileUa()
  const narrow = mobile && getScreenWidth() < 400

  if (mem <= 2 || cores <= 2 || narrow) {
    cached = 'low'
  } else if (!mobile && mem >= 8 && cores >= 8) {
    cached = 'high'
  } else {
    cached = 'medium'
  }
  return cached
}


/** Размер теневой текстуры для directionalLight.shadow-mapSize. */
export function getShadowMapSize(): 256 | 512 | 1024 | 2048 {
  const t = detectDeviceTier()
  if (t === 'low') return 512
  if (t === 'high') return 2048
  return 1024
}


/** Физический timestep для @react-three/rapier: 1/30 на слабых, иначе 1/60. */
export function getPhysicsTimestep(): number {
  return detectDeviceTier() === 'low' ? 1 / 30 : 1 / 60
}

/** Можно ли включать EffectComposer / постобработку (Bloom, Outline, SSAO). */
export function canPostfx(): boolean {
  return detectDeviceTier() !== 'low'
}

export const QUALITY_KEY = 'ek_quality'

/**
 * Однократно применяет tier-default к `ek_quality`, если пользователь ещё не
 * выбирал качество вручную. Вызывать до маунта AdaptiveDPR (из main.tsx или
 * самого AdaptiveDPR).
 */
export function seedDefaultQualityFromTier(): void {
  if (typeof window === 'undefined') return
  try {
    const existing = localStorage.getItem(QUALITY_KEY)
    if (existing) return
    if (detectDeviceTier() === 'low') {
      localStorage.setItem(QUALITY_KEY, 'low')
    }
  } catch {
    // localStorage может быть недоступен (privacy mode) — игнорируем
  }
}
