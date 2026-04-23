import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'ek_onboarded_play_v1'

interface Step {
  title: string
  text: string
  emoji: string
  keys?: string[]
}

const STEPS: Step[] = [
  {
    emoji: '🎮',
    title: 'Привет, игрок!',
    text: 'Это твой персонаж. Научу управлять за 30 секунд.',
  },
  {
    emoji: '🏃',
    title: 'Ходить',
    text: 'Жми WASD или стрелочки чтобы двигаться.',
    keys: ['W', 'A', 'S', 'D'],
  },
  {
    emoji: '🦘',
    title: 'Прыжок и бег',
    text: 'Space — прыжок. Space ещё раз в воздухе — двойной прыжок! Shift — бежать быстрее.',
    keys: ['Space', 'Shift'],
  },
  {
    emoji: '🖱️',
    title: 'Камера',
    text: 'Клик по экрану — зажмёшь мышь и сможешь крутить камеру. ESC — вернуть курсор.',
    keys: ['Click', 'Esc'],
  },
  {
    emoji: '⚡',
    title: 'Режим редактора',
    text: 'Нажми кнопку «⚡ Ред.» снизу — добавляй объекты, меняй цвета, строй свои миры!',
  },
  {
    emoji: '💰',
    title: 'Собирай монетки!',
    text: 'Золотые монетки дают очки. Найди их все или дойди до ФИНИША. Удачи!',
  },
]

export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      const t = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (show) cardRef.current?.focus()
  }, [show, step])

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault()
        if (step < STEPS.length - 1) setStep((s) => s + 1)
        else finish()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (step > 0) setStep((s) => s - 1)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, step])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="onboarding-overlay">
      <div
        className="onboarding-card"
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
      >
        <div className="ob-emoji">{current.emoji}</div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        {current.keys && (
          <div className="ob-keys">
            {current.keys.map((k) => <kbd key={k}>{k}</kbd>)}
          </div>
        )}
        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`ob-dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Шаг ${i + 1}`}
            />
          ))}
        </div>
        <div className="ob-actions">
          {step > 0 && (
            <button className="ob-btn ghost" onClick={() => setStep((s) => s - 1)}>
              ← Назад
            </button>
          )}
          <button className="ob-btn ghost" onClick={finish} style={{ marginLeft: step > 0 ? 0 : 'auto' }}>
            Пропустить
          </button>
          {isLast ? (
            <button className="ob-btn primary" onClick={finish}>
              🎮 Играть!
            </button>
          ) : (
            <button className="ob-btn primary" onClick={() => setStep((s) => s + 1)}>
              Дальше →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
