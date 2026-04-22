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

/**
 * Global achievement unlock toast — mounts once in App, shows a
 * slide-in card whenever a new achievement is unlocked.
 */
export default function AchievementToast() {
  const [item, setItem] = useState<ToastItem | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return subscribeAchievementUnlock((id) => {
      if (timer) clearTimeout(timer)
      setItem({ id, key: Date.now() })
      timer = setTimeout(() => setItem(null), 3500)
    })
  }, [])

  if (!item) return null
  const a = getAchievementById(item.id)
  if (!a) return null
  const rarityColor = RARITY_COLOR[a.rarity]

  return (
    <div key={item.key} className="achievement-toast" style={{ borderColor: rarityColor }}>
      <div className="achievement-toast-emoji" style={{ color: rarityColor }}>{a.emoji}</div>
      <div className="achievement-toast-body">
        <div className="achievement-toast-label">Новое достижение!</div>
        <div className="achievement-toast-title">{a.title}</div>
        <div className="achievement-toast-desc">{a.description}</div>
      </div>
    </div>
  )
}
