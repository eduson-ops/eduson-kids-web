// Лесенка подсказок — первые N показаны, остальные за кнопкой «Показать».
// Стоимость раскрытия — снаружи через onReveal (напр. −5 монет).

interface Props {
  hints: string[]
  revealed: number
  onReveal: () => void
  revealCost?: number
}

export default function HintLadder({
  hints,
  revealed,
  onReveal,
  revealCost = 5,
}: Props) {
  if (hints.length === 0) return null

  return (
    <div className="hint-ladder" aria-label="Подсказки">
      <div className="hint-ladder-title">
        <span className="hint-ladder-icon" aria-hidden>💡</span>
        Подсказки
        <span className="hint-ladder-counter">
          {Math.min(revealed, hints.length)}/{hints.length}
        </span>
      </div>
      <ol className="hint-ladder-list">
        {hints.map((h, i) => {
          const isOpen = i < revealed
          if (isOpen) {
            return (
              <li key={i} className="hint-ladder-item">
                <span className="hint-ladder-num" aria-hidden>
                  {i + 1}
                </span>
                <span className="hint-ladder-text">{h}</span>
              </li>
            )
          }
          return (
            <li key={i} className="hint-ladder-item hint-ladder-locked" aria-hidden>
              <span className="hint-ladder-num" aria-hidden>{i + 1}</span>
              <span className="hint-ladder-text">— спрятано —</span>
            </li>
          )
        })}
      </ol>
      {revealed < hints.length ? (
        <button
          className="hint-ladder-reveal"
          type="button"
          onClick={onReveal}
          title="Раскрыть следующую подсказку"
        >
          💡 Показать подсказку{' '}
          <span className="hint-ladder-cost">(−{revealCost} монет)</span>
        </button>
      ) : (
        <div className="hint-ladder-done">Ты открыл все подсказки.</div>
      )}
    </div>
  )
}
