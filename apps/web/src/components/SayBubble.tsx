import { useEffect, useRef, useState } from 'react'

const SAY_DURATION = 3000

export default function SayBubble() {
  const [text, setText] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const onSay = (e: Event) => {
      const msg = (e as CustomEvent<{ text: string }>).detail?.text
      if (!msg) return
      setText(String(msg))
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setText(null), SAY_DURATION)
    }
    window.addEventListener('ek:player-say', onSay)
    return () => {
      window.removeEventListener('ek:player-say', onSay)
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  if (!text) return null

  return (
    <div className="say-bubble" role="status" aria-live="polite">
      <span className="say-bubble-arrow" />
      {text}
    </div>
  )
}
