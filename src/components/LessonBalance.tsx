import { Link } from 'react-router-dom'
import type { BillingState } from '../lib/billing'
import { useToast } from '../hooks/useToast'

interface Props {
  billing: BillingState
  compact?: boolean
}

/**
 * Плашка «остаток уроков» — SVG-кольцо + счётчик + CTA.
 * compact=true — уменьшенная версия для ребёнка (без текста разбивки).
 */
export default function LessonBalance({ billing, compact = false }: Props) {
  const total = billing.lessonsPaid || 48  // если ничего не куплено — показываем демо на 48
  const used = billing.lessonsUsed
  const remaining = Math.max(0, total - used)
  const plan = billing.subscription.plan
  const hasUnlimited = plan === 'monthly' || plan === 'annual' || plan === 'family-2' || plan === 'family-3'
  const pct = total > 0 ? Math.min(1, used / total) : 0
  const { toast, show: showToast } = useToast()

  const r = compact ? 34 : 52
  const size = compact ? 88 : 136
  const cx = size / 2
  const circumference = 2 * Math.PI * r
  const strokeDash = pct * circumference

  return (
    <div
      className={`lesson-balance${compact ? ' lesson-balance--compact' : ''}`}
      role="region"
      aria-label="Баланс уроков"
    >
      {toast && (
        <div key={toast.key} className={`kb-ui-toast kb-ui-toast--${toast.kind}`}>
          {toast.msg}
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(107,92,231,.12)" strokeWidth={compact ? 8 : 12} />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={remaining === 0 ? '#ff5464' : '#6B5CE7'}
          strokeWidth={compact ? 8 : 12}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
        <text x={cx} y={cx - (compact ? 4 : 6)} textAnchor="middle" fontSize={compact ? 13 : 20} fontWeight={800} fill="#15141b">
          {hasUnlimited ? '∞' : remaining}
        </text>
        <text x={cx} y={cx + (compact ? 10 : 16)} textAnchor="middle" fontSize={compact ? 8 : 11} fill="#6b6e78">
          {hasUnlimited ? 'безлимит' : 'осталось'}
        </text>
      </svg>

      <div className="lesson-balance-info">
        {hasUnlimited ? (
          <div className="lesson-balance-label">
            Подписка <b>{plan === 'annual' ? 'годовая' : plan === 'monthly' ? 'месячная' : 'семейная'}</b> — уроки без ограничений
          </div>
        ) : (
          <>
            <div className="lesson-balance-label">
              Осталось <b>{remaining}</b> из {total} {total === 1 ? 'урока' : total < 5 ? 'уроков' : 'уроков'}
            </div>
            {!compact && (
              <div className="lesson-balance-used">Использовано: {used} из {total}</div>
            )}
          </>
        )}

        {!compact && !hasUnlimited && (
          <div className="lesson-balance-actions">
            <button
              className="lesson-balance-btn lesson-balance-btn--buy"
              onClick={() => showToast('💳 Для покупки уроков перейди в раздел «Оплата»')}
              type="button"
            >
              + Докупить урок — 699 ₽
            </button>
            <Link to="/billing" className="lesson-balance-btn lesson-balance-btn--sub">
              ∞ Перейти на безлимит
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
