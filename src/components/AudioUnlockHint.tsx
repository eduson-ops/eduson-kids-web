import { useEffect, useState } from 'react'
import { isAudioUnlocked } from '../lib/audioUnlock'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * AudioUnlockHint — small toast shown on mobile until the first user gesture
 * resumes the AudioContext. Auto-hides when `audio:unlocked` fires on window.
 */
export default function AudioUnlockHint() {
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState<boolean>(() => !isAudioUnlocked())

  useEffect(() => {
    if (isAudioUnlocked()) {
      setVisible(false)
      return
    }
    const onUnlocked = () => setVisible(false)
    window.addEventListener('audio:unlocked', onUnlocked)
    return () => window.removeEventListener('audio:unlocked', onUnlocked)
  }, [])

  if (!isMobile || !visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'calc(72px + env(safe-area-inset-bottom))',
        zIndex: 9999,
        background: 'rgba(21, 20, 27, 0.88)',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span aria-hidden>🔊</span>
      <span>Нажми, чтобы включить звук</span>
    </div>
  )
}
