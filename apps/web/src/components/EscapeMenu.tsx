import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMuted, setMuted, getVolume, setVolume, SFX } from '../lib/audio'

interface Props {
  gameTitle: string
}

/**
 * Эскейп-меню как в Roblox — открывается по клавише Escape (когда
 * pointer-lock выключен), показывает настройки / выход в лобби /
 * продолжить.
 */
export default function EscapeMenu({ gameTitle }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [muted, setMutedState] = useState(getMuted())
  const [sfxVol, setSfxVol] = useState(Math.round(getVolume() * 100))
  const [quality, setQuality] = useState(() => localStorage.getItem('ek_quality') ?? 'auto')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Escape: если сейчас pointer-lock — браузер сам его снимет.
        // Если не залочен — переключаем наше меню.
        if (document.pointerLockElement) return
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div className="escape-overlay" onClick={() => setOpen(false)}>
      <div className="escape-menu" onClick={(e) => e.stopPropagation()}>
        <header className="escape-header">
          <h2>Пауза</h2>
          <button className="escape-close" onClick={() => setOpen(false)} aria-label="Закрыть">
            ✕
          </button>
        </header>

        <div className="escape-game-title">«{gameTitle}»</div>

        <section className="escape-section">
          <h4>Звук</h4>
          <label className="escape-row">
            <span>Общий звук</span>
            <input
              type="checkbox"
              checked={!muted}
              onChange={(e) => {
                const m = !e.target.checked
                setMuted(m)
                setMutedState(m)
              }}
            />
          </label>
          <label className="escape-row">
            <span>Громкость SFX</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sfxVol}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                setSfxVol(v)
                setVolume(v / 100)
              }}
            />
            <small>{sfxVol}%</small>
          </label>
        </section>

        <section className="escape-section">
          <h4>Графика</h4>
          <label className="escape-row">
            <span>Качество рендера</span>
            <select
              value={quality}
              onChange={(e) => {
                const q = e.target.value
                setQuality(q)
                localStorage.setItem('ek_quality', q)
                window.dispatchEvent(new CustomEvent('ek:quality-change', { detail: { quality: q } }))
              }}
            >
              <option value="auto">Авто (адаптивно)</option>
              <option value="med">Среднее</option>
              <option value="low">Низкое (быстро)</option>
            </select>
          </label>
        </section>

        <section className="escape-section">
          <h4>Управление</h4>
          <div className="escape-controls">
            <div><kbd>WASD</kbd> ходить</div>
            <div><kbd>Space</kbd> прыгнуть</div>
            <div><kbd>Shift</kbd> бежать</div>
            <div><kbd>клик</kbd> захват мыши</div>
            <div><kbd>Esc</kbd> меню / выйти</div>
            <div><kbd>Tab</kbd> лидерборд</div>
          </div>
        </section>

        <div className="escape-actions">
          <button
            className="escape-btn"
            onClick={() => {
              SFX.click()
              setOpen(false)
            }}
          >
            ▶ Продолжить
          </button>
          <button
            className="escape-btn ghost"
            onClick={() => {
              SFX.click()
              navigate('/')
            }}
          >
            ← В лобби
          </button>
        </div>
      </div>
    </div>
  )
}
