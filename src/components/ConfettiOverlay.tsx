import { useEffect, useRef } from 'react'

/**
 * Конфетти-оверлей для выигрышных моментов.
 * 2D canvas, 80 частиц, гравитация + ветер, 3 секунды (последние 0.8с — фейд).
 * Fixed-position, z-index 25, pointer-events none. Размонтируется сам.
 */

interface Props {
  /** Колбэк по окончании анимации (после фейда) */
  onDone?: () => void
}

const COUNT = 80
const TOTAL_MS = 3000
const FADE_MS = 800
const GRAVITY = 0.08
const WIND_VAR = 0.04
const BRAND_COLORS = ['#6B5CE7', '#FFD43C', '#FFB4C8', '#9FE8C7', '#FF9454', '#A9D8FF']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vrot: number
  w: number
  h: number
  color: string
}

export default function ConfettiOverlay({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: -10 - Math.random() * 260,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      w: 8 + Math.random() * 8,
      h: 4 + Math.random() * 4,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)]!,
    }))

    const start = performance.now()
    let raf = 0
    let finished = false

    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', onResize)

    const loop = () => {
      const now = performance.now()
      const t = now - start
      if (t >= TOTAL_MS) {
        ctx.clearRect(0, 0, width, height)
        if (!finished) {
          finished = true
          onDone?.()
        }
        return
      }
      ctx.clearRect(0, 0, width, height)

      const alpha = t > TOTAL_MS - FADE_MS ? 1 - (t - (TOTAL_MS - FADE_MS)) / FADE_MS : 1
      ctx.globalAlpha = alpha

      for (const p of particles) {
        p.vy += GRAVITY
        p.vx += (Math.random() - 0.5) * WIND_VAR
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot

        // Wrap по X, чтобы частицы не исчезли по бокам при сильном ветре
        if (p.x < -20) p.x = width + 20
        else if (p.x > width + 20) p.x = -20

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [onDone])

  return <canvas ref={canvasRef} className="confetti-overlay" aria-hidden />
}
