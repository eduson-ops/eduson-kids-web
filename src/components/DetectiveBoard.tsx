import { useMemo, useState } from 'react'

// ── Типы ─────────────────────────────────────────────────────────
type SuspectStatus = 'unknown' | 'cleared' | 'suspect' | 'prime' | 'criminal'

interface Suspect {
  id: string
  fullName: string
  emoji: string
  role: string
  status: SuspectStatus
}

interface Clue {
  icon: string
  text: string
}

// ── Статические данные дела ───────────────────────────────────────
const SUSPECTS_BASE: Omit<Suspect, 'status'>[] = [
  { id: 'khaks',  fullName: 'Артём Хакс',  emoji: '🧔', role: 'Учитель' },
  { id: 'bayt',   fullName: 'Оля Байт',    emoji: '👩', role: 'Студентка' },
  { id: 'bag',    fullName: 'Денис Баг',   emoji: '😤', role: 'Охранник' },
  { id: 'logik',  fullName: 'Лена Логик',  emoji: '🕵️', role: 'Уборщица' },
  { id: 'null',   fullName: 'Виктор Нуль', emoji: '🎩', role: 'Директор' },
]

const ALL_CLUES: Clue[] = [
  { icon: '👥', text: '5 подозреваемых установлено' },
  { icon: '🪪', text: 'Без алиби: Байт, Баг, Нуль' },
  { icon: '📍', text: 'Тайник расшифрован: БАЗА' },
  { icon: '👟', text: 'Следы 44-го: Баг и Нуль' },
  { icon: '📷', text: 'Вход в 22:00: Байт и Нуль' },
  { icon: '🔗', text: 'Совпадение улик: Баг и Нуль' },
  { icon: '🔡', text: 'Имя в шифре: ВИКТОР' },
  { icon: '⚙️', text: 'Алгоритм дедукции готов' },
  { icon: '✅', text: 'Единственный подозреваемый: НУЛЬ' },
  { icon: '🚨', text: 'ПРЕСТУПНИК ЗАДЕРЖАН!' },
]

const STATUS_LABEL: Record<SuspectStatus, string> = {
  unknown:  '—',
  cleared:  '✓ Снят',
  suspect:  '⚠ Под.',
  prime:    '🔴 Главный',
  criminal: '🚨 ЗАДЕРЖАН',
}

// ── Вычисление состояния доски по прогрессу ───────────────────────
function computeBoard(progress: number): { suspects: Suspect[]; clues: Clue[] } {
  const s = SUSPECTS_BASE.map<Suspect>((b) => ({ ...b, status: 'unknown' }))

  const set = (idx: number, status: Suspect['status']) => { if (s[idx]) s[idx]!.status = status }

  if (progress >= 2) {
    set(0, 'cleared'); set(3, 'cleared')
    set(1, 'suspect'); set(2, 'suspect'); set(4, 'suspect')
  }
  if (progress >= 4) set(1, 'cleared')
  if (progress >= 7) set(4, 'prime')
  if (progress >= 9) set(2, 'cleared')
  if (progress >= 10) set(4, 'criminal')

  return { suspects: s, clues: ALL_CLUES.slice(0, progress) }
}

// ── Компонент ─────────────────────────────────────────────────────
interface Props {
  n: number           // текущий номер задачи (1–10)
  solvedCount: number // сколько задач детектива решено
}

export default function DetectiveBoard({ n, solvedCount }: Props) {
  const [expanded, setExpanded] = useState(true)

  // progress = число завершённых задач (приблизительно n-1 или solvedCount)
  const progress = Math.max(n - 1, solvedCount)
  const { suspects, clues } = useMemo(() => computeBoard(progress), [progress])

  const isCaseSolved = suspects[4]?.status === 'criminal'

  return (
    <div className="det-board">
      {/* Коллапсная шапка */}
      <button
        type="button"
        className="det-board-bar"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="det-bar-icon">📁</span>
        <span className="det-bar-title">Дело «КодМастер»</span>

        {/* Чипы подозреваемых — видны всегда */}
        <span className="det-bar-chips" aria-label="Подозреваемые">
          {suspects.map((s) => (
            <span
              key={s.id}
              className={`det-chip det-chip--${s.status}`}
              title={`${s.fullName} — ${STATUS_LABEL[s.status]}`}
            >
              {s.emoji}
            </span>
          ))}
        </span>

        <span className={`det-bar-status ${isCaseSolved ? 'det-bar-status--solved' : ''}`}>
          {isCaseSolved ? '✓ ЗАКРЫТО' : `${clues.length}/10 улик`}
        </span>
        <span className="det-bar-toggle" aria-hidden>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Раскрытая панель */}
      {expanded && (
        <div className="det-board-body">
          {/* Карточки подозреваемых */}
          <div className="det-suspects">
            {suspects.map((s) => (
              <div key={s.id} className={`det-suspect-card det-suspect-card--${s.status}`}>
                <span className="det-suspect-emoji" aria-hidden>{s.emoji}</span>
                <span className="det-suspect-name">{s.fullName}</span>
                <span className="det-suspect-role">{s.role}</span>
                <span className={`det-suspect-tag det-suspect-tag--${s.status}`}>
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
            ))}
          </div>

          {/* Журнал улик */}
          {clues.length > 0 ? (
            <aside className="det-clues-panel">
              <span className="det-clues-title">Собранные улики</span>
              <ul className="det-clues-list">
                {clues.map((c, i) => (
                  <li key={i} className="det-clue-item">
                    <span className="det-clue-icon" aria-hidden>{c.icon}</span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <aside className="det-clues-panel det-clues-panel--empty">
              <span className="det-clues-title">Улики</span>
              <p className="det-clues-empty">Решай задачи — улики появятся здесь</p>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}
