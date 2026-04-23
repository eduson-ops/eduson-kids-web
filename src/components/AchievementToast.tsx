import { useEffect, useState } from 'react'
import {
  subscribeAchievementUnlock,
  getAchievementById,
  RARITY_COLOR,
} from '../lib/achievements'

interface ToastItem {
  id: string
  key: number
}

const TOAST_DURATION = 3200

/**
 * Global achievement unlock toast — queues multiple unlocks so each
 * is shown in sequence, never dropped. Mounts once in App.
 */
export default function AchievementToast() {
  const [queue, setQueue] = useState<ToastItem[]>([])
  const [current, setCurrent] = useState<ToastItem | null>(null)

  useEffect(() => {
    const unsub = subscribeAchievementUnlock((id) => {
      setQueue((q) => [...q, { id, key: Date.now() }])
    })
    return unsub
  }, [])

  // Advance queue: when current clears, pop next
  useEffect(() => {
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    setCurrent(next)
    setQueue(rest)
    const t = setTimeout(() => setCurrent(null), TOAST_DURATION)
    return () => clearTimeout(t)
  }, [current, queue])

  if (!current) return null
  const a = getAchievementById(current.id)
  if (!a) return null
  const rarityColor = RARITY_COLOR[a.rarity]

  return (
    <div key={current.key} className="achievement-toast" style={{ borderColor: rarityColor }}>
      <div className="achievement-toast-emoji" style={{ color: rarityColor }}>{a.emoji}</div>
      <div className="achievement-toast-body">
        <div className="achievement-toast-label">
          Новое достижение!{queue.length > 0 && <span className="achievement-toast-queue"> +{queue.length}</span>}
        </div>
        <div className="achievement-toast-title">{a.title}</div>
        <div className="achievement-toast-desc">{a.description}</div>
      </div>
      <div className="achievement-toast-rarity" style={{ color: rarityColor }}>{a.rarity}</div>
    </div>
  )
}
