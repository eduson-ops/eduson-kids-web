import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastKind = 'default' | 'success' | 'error' | 'info'

interface ToastState {
  msg: string
  kind: ToastKind
  key: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((msg: string, kind: ToastKind = 'default') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ msg, kind, key: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 2500)
  }, [])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { toast, show }
}
