import { useEffect, useState } from 'react'
import { onQueueChange, pendingCount } from '../lib/offlineQueue'

/**
 * Slim banner that shows when the app is offline OR has pending saves
 * waiting to sync. Renders nothing when fully synced + online.
 *
 * Designed to be unobtrusive — small, top-of-screen, autohide on success.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [pending, setPending] = useState(0)
  const [recentSyncFlash, setRecentSyncFlash] = useState(false)

  useEffect(() => {
    const onOn = () => {
      setOnline(true)
      setRecentSyncFlash(true)
      setTimeout(() => setRecentSyncFlash(false), 3000)
    }
    const onOff = () => setOnline(false)
    window.addEventListener('online', onOn)
    window.addEventListener('offline', onOff)
    return () => {
      window.removeEventListener('online', onOn)
      window.removeEventListener('offline', onOff)
    }
  }, [])

  useEffect(() => {
    const update = () => void pendingCount().then(setPending)
    update()
    const off = onQueueChange(update)
    return off
  }, [])

  // Hide when synced + online + no flash
  if (online && pending === 0 && !recentSyncFlash) return null

  let label = ''
  let bg = '#ffd84c'
  let fg = '#0f1117'
  if (!online && pending === 0) {
    label = 'Нет сети — работаем оффлайн'
    bg = '#666'
    fg = '#fff'
  } else if (!online && pending > 0) {
    label = `Нет сети — ${pending} сохранений в очереди, отправим автоматически`
    bg = '#cc7a00'
    fg = '#fff'
  } else if (pending > 0) {
    label = `Синхронизируем ${pending} сохранений...`
    bg = '#ffd84c'
    fg = '#0f1117'
  } else if (recentSyncFlash) {
    label = 'Все сохранено в облако'
    bg = '#7ee6a0'
    fg = '#0f1117'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: bg,
        color: fg,
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
      }}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  )
}
