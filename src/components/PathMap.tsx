import { Link } from 'react-router-dom'
import NikselIcon, { type NikselIconKind } from '../design/mascot/NikselIcon'

/**
 * PathMap — Duolingo-style вертикальная извилистая дорожка модулей.
 * Заменяет flat 4×2 сетку карточек на эмоционально вовлекающий путь.
 *
 * Логика состояний:
 *   ✅ done      — все 6 уроков модуля пройдены, узел зелёный с галочкой
 *   🟣 active    — текущий модуль, пульсирует, подписан «Продолжить»
 *   🔒 locked    — n > unlockedModuleN, серый с замком
 *
 * Модули M4 и M8 — «боссы» (капстоны сезона), визуально крупнее.
 */

export interface PathMapModule {
  n: number
  title: string
  accent: string
  icon: NikselIconKind
  lessonsTotal: number
  lessonsDone: number
}

interface Props {
  modules: PathMapModule[]
  unlockedUpTo: number
  currentModuleN: number
}

export default function PathMap({ modules, unlockedUpTo, currentModuleN }: Props) {
  return (
    <div className="path-map" role="list">
      {modules.map((m, i) => {
        const done = m.lessonsDone >= m.lessonsTotal
        const locked = m.n > unlockedUpTo
        const active = m.n === currentModuleN && !done
        const isBoss = m.n === 4 || m.n === 8
        // Зигзаг: чётные слева, нечётные справа
        const alignLeft = i % 2 === 0
        return (
          <div
            key={m.n}
            className={`path-node-row ${alignLeft ? 'align-left' : 'align-right'}`}
            role="listitem"
          >
            {/* SVG-коннектор к следующему узлу */}
            {i < modules.length - 1 && (
              <svg className="path-connector" viewBox="0 0 200 100" aria-hidden>
                <path
                  d={
                    alignLeft
                      ? 'M 40 0 Q 40 50, 100 50 T 160 100'
                      : 'M 160 0 Q 160 50, 100 50 T 40 100'
                  }
                  fill="none"
                  stroke={locked ? 'rgba(21,20,27,.1)' : 'rgba(107,92,231,.25)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={locked ? '6 6' : '0'}
                />
              </svg>
            )}

            <Link
              to={locked ? '#' : `/learn/module/${m.n}`}
              className={`path-node ${done ? 'done' : ''} ${active ? 'active' : ''} ${
                locked ? 'locked' : ''
              } ${isBoss ? 'boss' : ''}`}
              style={
                {
                  '--accent': `var(--${m.accent}, #6B5CE7)`,
                } as React.CSSProperties
              }
              aria-label={`Модуль ${m.n}: ${m.title}. ${
                done
                  ? 'Пройден.'
                  : locked
                    ? 'Заблокирован.'
                    : active
                      ? 'Текущий.'
                      : 'Доступен.'
              }`}
              onClick={(e) => locked && e.preventDefault()}
            >
              <div className="path-node-ring" aria-hidden>
                {/* Прогресс-кольцо */}
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="rgba(21,20,27,.08)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(m.lessonsDone / m.lessonsTotal) * 226.2} 226.2`}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
              </div>

              <div className="path-node-core">
                {locked ? (
                  <span className="path-node-lock">🔒</span>
                ) : done ? (
                  <span className="path-node-check" aria-hidden>✓</span>
                ) : (
                  <NikselIcon kind={m.icon} size={isBoss ? 56 : 44} />
                )}
              </div>

              {isBoss && !locked && (
                <span className="path-node-crown" aria-label="Капстон-босс">👑</span>
              )}

              {active && (
                <span className="path-node-pulse" aria-hidden />
              )}

              <div className="path-node-meta">
                <strong>M{m.n}</strong>
                <span className="path-node-count">
                  {m.lessonsDone}/{m.lessonsTotal}
                </span>
              </div>

              <div className="path-node-label">
                <span className="path-node-title">{m.title}</span>
                {active && (
                  <span className="path-node-cta">→ Продолжить</span>
                )}
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
