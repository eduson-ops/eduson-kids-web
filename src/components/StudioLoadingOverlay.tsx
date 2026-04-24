/**
 * StudioLoadingOverlay — branded full-screen loader для Студии.
 *
 * Шаги (loadingStep):
 *   0 — «Загружаем Python…» (Pyodide warming)
 *   1 — «Загружаем блоки…»  (Blockly mounted)
 *   2 — «Готовим редактор…» (Monaco / CodeMirror mounted)
 *   3 — «Почти готово…»     (всё, вот-вот скрываемся)
 *   4 — done → fade-out → unmount
 *
 * Использует только токены из tokens.ts через CSS-vars (--violet/--yellow/--paper/--ink),
 * так что меняется вместе с темой.
 */
import { useEffect, useState } from 'react'
import Niksel from '../design/mascot/Niksel'

interface Props {
  /** 0..4 — текущий шаг загрузки. 4 = всё загружено, нужно скрыть. */
  step: number
}

const STEPS = [
  'Загружаем Python…',
  'Загружаем блоки…',
  'Готовим редактор…',
  'Почти готово…',
]

export default function StudioLoadingOverlay({ step }: Props) {
  const [hidden, setHidden] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (step >= 4) {
      // fade-out 320ms → unmount
      setFading(true)
      const t = setTimeout(() => setHidden(true), 360)
      return () => clearTimeout(t)
    }
  }, [step])

  if (hidden) return null

  // Прогресс — линейный по шагам: 0→25→50→75→100
  const pct = Math.min(100, Math.max(0, (step / 3) * 100))
  const label = STEPS[Math.min(step, STEPS.length - 1)]

  return (
    <div
      className={`studio-loading-overlay${fading ? ' studio-loading-overlay--fade' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Загрузка Студии: ${label}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--paper, #FFFBF3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: '24px',
        opacity: fading ? 0 : 1,
        transition: 'opacity 320ms ease-out',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* Слева — Никсель в pose='think' */}
      <div style={{ flex: '0 0 auto' }}>
        <Niksel pose="think" size={140} ariaLabel="Никсель готовит студию" />
      </div>

      {/* Справа — прогресс-бар + текст */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxWidth: 360,
          width: '100%',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display, system-ui)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--ink, #15141B)',
            letterSpacing: '-0.01em',
          }}
        >
          Эдюсон <span style={{ color: 'var(--yellow, #FFD43C)' }}>Kids</span>
          <span style={{ opacity: 0.4, margin: '0 6px' }}>·</span>
          <span style={{ color: 'var(--violet, #6B5CE7)' }}>Студия</span>
        </div>

        <div
          style={{
            fontSize: 14,
            color: 'var(--ink-soft, #2B2A36)',
            minHeight: 20,
            transition: 'opacity 200ms',
          }}
        >
          {label}
        </div>

        {/* Прогресс-трек */}
        <div
          style={{
            position: 'relative',
            height: 10,
            borderRadius: 999,
            background: 'var(--paper-2, #F4EFE3)',
            overflow: 'hidden',
            border: '1.5px solid var(--ink, #15141B)',
            boxShadow: '0 3px 0 0 var(--ink, #15141B)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${pct}%`,
              background:
                'linear-gradient(90deg, var(--violet, #6B5CE7) 0%, var(--yellow, #FFD43C) 100%)',
              transition: 'width 360ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </div>

        {/* Шаг N из 4 */}
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-soft, #2B2A36)',
            opacity: 0.7,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.min(step + 1, 4)} / 4
        </div>
      </div>
    </div>
  )
}
