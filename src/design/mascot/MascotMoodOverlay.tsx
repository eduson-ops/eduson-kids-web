import type { MascotMood } from '../../hooks/useMascotMood'

/**
 * Absolute-positioned overlay on top of Niksel.
 * Does NOT modify the penguin geometry — adds floating elements only.
 * Wrap Niksel in a relative-positioned container before using this.
 */
export function MascotMoodOverlay({ mood }: { mood: MascotMood }) {
  if (mood === 'idle' || mood === 'wave') return null

  return (
    <div className={`mascot-overlay mascot-overlay--${mood}`} aria-hidden>
      {mood === 'celebrate' && (
        <>
          <span className="mascot-spark mascot-spark--1">★</span>
          <span className="mascot-spark mascot-spark--2">★</span>
          <span className="mascot-spark mascot-spark--3">★</span>
        </>
      )}
      {(mood === 'think' || mood === 'confused') && (
        <span className="mascot-bubble">{mood === 'confused' ? '...' : '?'}</span>
      )}
      {mood === 'code' && <div className="mascot-laptop" />}
    </div>
  )
}
