import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ek_onboarded_play_v1'

interface Step {
  title: string
  text: string
  emoji: string
  pointer?: { top: string; left: string }
}

const STEPS: Step[] = [
  {
    emoji: '🎮',
    title: 'Привет, игрок!',
    text: 'Это твой персонаж. Сейчас научу управлять за 30 секунд.',
  },
  {
    emoji: '🏃',
    title: 'Ходить',
    text: 'Жми WASD или стрелочки чтобы двигаться.',
    pointer: { top: '50%', left: '50%' },
  },
  {
    emoji: '🦘',
    title: 'Прыжок',
    text: 'Нажми Space чтобы прыгнуть. Space ещё раз в воздухе — двойной прыжок (в некоторых играх).',
  },
  {
    emoji: '🖱️',
    title: 'Камера',
    text: 'Клик по экрану — зажмёшь мышь и сможешь крутить камеру. ESC — вернуть курсор.',
  },
  {
    emoji: '💰',
    title: 'Собирай монетки!',
    text: 'Золотые монетки дают очки. Найди их все или дойди до ФИНИША.',
  },
]

/**
 * First-time onboarding для Play. Показывается один раз, запоминается в localStorage.
 * 5 шагов с emoji-иконками, кнопками "дальше / пропустить".
 */
export default function OnboardingOverlay() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Небольшая задержка чтобы сцена успела появиться
      const t = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="ob-emoji">{current.emoji}</div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`ob-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="ob-actions">
          <button className="ob-btn ghost" onClick={finish}>
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
