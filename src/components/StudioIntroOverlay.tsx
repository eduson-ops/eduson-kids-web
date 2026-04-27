import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ek_onboarded_studio_v2'

interface Step {
  emoji: string
  title: string
  text: string
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Добро пожаловать в Студию',
    text: 'Здесь ты строишь свой 3D-мир и программируешь его. За 30 секунд покажу главное.',
  },
  {
    emoji: '🧱',
    title: 'Строить',
    text: 'Вкладка «Строить» — это твой конструктор. Ставишь Эдюсон Kidsи, монетки, точки старта. Как в Minecraft.',
  },
  {
    emoji: '🧩',
    title: 'Три режима программирования',
    text: 'Во вкладке «Скрипт» — 3 уровня. L1 «Блоки» — собираешь программу из цветных блоков. L2 «Блоки + Python» — видишь настоящий код рядом. L3 «Python» — пишешь сам.',
  },
  {
    emoji: '▶',
    title: 'Проверить',
    text: 'Когда готово — вкладка «▶ Тест». Твоя игра запустится с физикой и героем. Играй и ломай.',
  },
  {
    emoji: '🌐',
    title: 'Ещё есть Сайты',
    text: 'Хочешь вместо игры сделать веб-страницу? На главной есть трек «Сайты» — тот же принцип, только L1 шаблон → L2 HTML.',
  },
]

export default function StudioIntroOverlay() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      const t = setTimeout(() => setShow(true), 300)
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
    <div className="onboarding-overlay" role="presentation">
      <div
        className="onboarding-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Знакомство со студией, шаг ${step + 1} из ${STEPS.length}: ${current.title}`}
      >
        <div className="ob-emoji" aria-hidden>{current.emoji}</div>
        <h3>{current.title}</h3>
        <p>{current.text}</p>
        <div className="ob-dots" role="tablist" aria-label="Прогресс">
          {STEPS.map((s, i) => (
            <span key={i} className={`ob-dot ${i === step ? 'active' : ''}`} role="tab" aria-label={s.title} aria-selected={i === step} />
          ))}
        </div>
        <div className="ob-actions">
          <button className="ob-btn ghost" onClick={finish}>
            Пропустить
          </button>
          {isLast ? (
            <button className="ob-btn primary" onClick={finish}>
              ✨ Поехали!
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
