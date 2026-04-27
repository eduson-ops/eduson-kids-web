import { useEffect, useState } from 'react'

/**
 * useIsMobile — true когда устройство с грубым указателем (touch) ИЛИ окно ≤ 900px.
 * Следит за изменениями media-query и resize (redock tablet, DevTools toggle, и т.п.).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobile())

  useEffect(() => {
    const coarseMq = window.matchMedia('(pointer: coarse)')
    const widthMq = window.matchMedia('(max-width: 900px)')
    const update = () => setIsMobile(detectMobile())

    const addListener = (mq: MediaQueryList) => {
      if (mq.addEventListener) mq.addEventListener('change', update)
      else mq.addListener(update)
    }
    const removeListener = (mq: MediaQueryList) => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }

    addListener(coarseMq)
    addListener(widthMq)
    window.addEventListener('resize', update)
    return () => {
      removeListener(coarseMq)
      removeListener(widthMq)
      window.removeEventListener('resize', update)
    }
  }, [])

  return isMobile
}

/** useIsTouch — чистая media-query `(pointer: coarse)`. */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => detectCoarse())

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', update)
    else mq.addListener(update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [])

  return isTouch
}

/** useIsNative — true если работаем внутри Capacitor (iOS/Android shell). */
export function useIsNative(): boolean {
  const [isNative, setIsNative] = useState<boolean>(() => detectNative())

  useEffect(() => {
    // isNativePlatform is sync and stable — one check is enough, но
    // react-strict-mode двойной mount требует аккуратности: просто проверяем заново.
    setIsNative(detectNative())
  }, [])

  return isNative
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = detectCoarse()
  const narrow = window.matchMedia?.('(max-width: 900px)').matches ?? false
  return coarse || narrow
}

function detectCoarse(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const touchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  return coarse || touchPoints
}

function detectNative(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !!cap?.isNativePlatform?.()
}

export default useIsMobile
