import { useEffect, useState } from 'react'
import { SFX } from '../lib/audio'

/**
 * StudioTour — интерактивный 6-шаговый тур по Студии (Scratch-style onboarding).
 * Spotlight на DOM-элемент + tooltip рядом. Пишется в localStorage, показывается 1 раз.
 *
 * Hotkey replay: можно вызвать через replayTour() из кнопки «Показать тур».
 */

const KEY = 'ek_studio_tour_v1'

interface Step {
  /** CSS-селектор таргета */
  selector: string
  title: string
  body: string
  /** Позиция tooltip относительно таргета: bottom/right/left/top/center */
  side?: 'bottom' | 'right' | 'left' | 'top' | 'center'
}

const STEPS: Step[] = [
  {
    selector: '.studio-tabs',
    title: '🎯 Три вкладки Студии',
    body: 'Строить — расставляешь блоки в 3D. Скрипт — программируешь поведение. Тест — запускаешь с физикой. Пройдись туда-обратно.',
    side: 'bottom',
  },
  {
    selector: '.studio-tab:nth-child(1)',
    title: '🧱 Вкладка «Строить»',
    body: 'Начнём здесь. Слева — палитра блоков, справа — панель свойств выделенного объекта.',
    side: 'bottom',
  },
  {
    selector: '.studio-tab:nth-child(2)',
    title: '🧩 Вкладка «Скрипт»',
    body: 'Здесь ты пишешь программу: хат-события и блоки действий. 3 режима: блоки, мост, чистый Python.',
    side: 'bottom',
  },
  {
    selector: '.studio-tab:nth-child(3)',
    title: '▶ Вкладка «Тест»',
    body: 'Играешь в свою сцену. Физика, герой, скрипты — всё оживает. Игра запускается прямо тут.',
    side: 'bottom',
  },
  {
    selector: '.studio-viewport',
    title: '🎥 Камера',
    body: 'ПКМ — крути камеру. Колёсико мыши — зум (приблизить/отдалить). Тач-пад: двумя пальцами скролл.',
    side: 'top',
  },
  {
    selector: '.studio-actions',
    title: '🔄 Сброс сцены',
    body: 'Если что-то пошло не так — кнопка «Сброс» вернёт всё в исходное. Не бойся эксперементировать.',
    side: 'bottom',
  },
  {
    selector: '.studio-props',
    title: '⌨ Горячие клавиши',
    body: 'Delete — удалить выделенный объект. Ctrl+Z — отменить последнее действие. Escape — снять выделение. Кликни на любой объект в списке справа — он выделится.',
    side: 'left',
  },
  {
    selector: '.studio-brand-lockup',
    title: '✨ Всё готово',
    body: 'Теперь ты знаешь базу. В любой момент открой «Уроки» на главной — там 48 шаговых уроков. Удачи!',
    side: 'bottom',
  },
]

export function replayTour() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('ek:studio-tour-replay'))
}

export default function StudioTour() {
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [box, setBox] = useState<DOMRect | null>(null)

  // Запуск тура: при первом входе или при replayTour()
  useEffect(() => {
    const seen = localStorage.getItem(KEY)
    if (!seen) {
      const t = setTimeout(() => setActive(true), 600)
      return () => clearTimeout(t)
    }
    const onReplay = () => setActive(true)
    window.addEventListener('ek:studio-tour-replay', onReplay)
    return () => window.removeEventListener('ek:studio-tour-replay', onReplay)
  }, [])

  // Находим целевой DOM-элемент и измеряем его bounding-box
  useEffect(() => {
    if (!active) return
    const find = () => {
      const step = STEPS[stepIdx]
      const el = document.querySelector(step.selector)
      if (el instanceof HTMLElement) {
        setBox(el.getBoundingClientRect())
      } else {
        setBox(null)
      }
    }
    find()
    window.addEventListener('resize', find)
    return () => window.removeEventListener('resize', find)
  }, [active, stepIdx])

  const next = () => {
    SFX.click()
    if (stepIdx < STEPS.length - 1) setStepIdx((x) => x + 1)
    else finish()
  }
  const prev = () => {
    if (stepIdx > 0) setStepIdx((x) => x - 1)
  }
  const finish = () => {
    localStorage.setItem(KEY, '1')
    setActive(false)
    setStepIdx(0)
  }

  if (!active) return null

  const step = STEPS[stepIdx]
  if (!step) return null
  const tooltipPos = computeTooltipPos(box, step.side)
  const pct = ((stepIdx + 1) / STEPS.length) * 100

  return (
    <>
      {/* Dark overlay с вырезом на таргете */}
      <div className="tour-overlay" onClick={finish} role="presentation">
        {box && (
          <div
            className="tour-spotlight"
            style={{
              left: box.left - 8,
              top: box.top - 8,
              width: box.width + 16,
              height: box.height + 16,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="tour-tip"
        style={tooltipPos}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Тур по студии, шаг ${stepIdx + 1} из ${STEPS.length}: ${step.title}`}
      >
        <div className="tour-tip-head">
          <span className="tour-tip-step" aria-hidden>Шаг {stepIdx + 1} / {STEPS.length}</span>
          <button className="tour-tip-close" onClick={finish} aria-label="Закрыть тур">×</button>
        </div>
        <h3 className="tour-tip-title">{step.title}</h3>
        <p className="tour-tip-body">{step.body}</p>
        <div className="tour-tip-progress">
          <div className="tour-tip-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="tour-tip-nav">
          <button
            className="tour-tip-btn"
            onClick={prev}
            disabled={stepIdx === 0}
          >← Назад</button>
          <button className="tour-tip-btn tour-tip-btn-next" onClick={next}>
            {stepIdx < STEPS.length - 1 ? 'Дальше →' : '✓ Готово'}
          </button>
        </div>
      </div>
    </>
  )
}

function computeTooltipPos(box: DOMRect | null, side: Step['side'] = 'bottom'): React.CSSProperties {
  const W = 320
  const margin = 16
  if (!box) {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: W,
    }
  }
  switch (side) {
    case 'bottom':
      return {
        left: Math.max(margin, Math.min(box.left + box.width / 2 - W / 2, window.innerWidth - W - margin)),
        top: box.bottom + margin,
        width: W,
      }
    case 'top':
      return {
        left: Math.max(margin, Math.min(box.left + box.width / 2 - W / 2, window.innerWidth - W - margin)),
        top: box.top - margin - 200,
        width: W,
      }
    case 'right':
      return {
        left: box.right + margin,
        top: box.top + box.height / 2 - 100,
        width: W,
      }
    case 'left':
      return {
        left: Math.max(margin, box.left - W - margin),
        top: box.top + box.height / 2 - 100,
        width: W,
      }
    default:
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: W }
  }
}
