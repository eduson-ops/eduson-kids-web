import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import { useToast } from '../hooks/useToast'
import {
  getBilling,
  subscribeBilling,
  buyInstallment48,
  buyPack10,
  startTrial,
  startSubscription,
  cancelSubscription,
  lessonsRemaining,
  formatRub,
  applyPromo,
  PLAN_INFO,
  PRICE_INSTALLMENT_48,
  PRICE_PACK_10,
  type SubscriptionPlan,
} from '../lib/billing'

function isDebug(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === '1'
}

/**
 * /billing — отдельная страница «Оплата и уроки».
 * Видна в sidenav рядом с портфолио. Родитель прилетает сюда напрямую
 * и не ищет нужный раздел внутри портфолио ребёнка.
 */
export default function Billing() {
  const [, force] = useState(0)
  const { toast, show } = useToast()
  const [promoInput, setPromoInput] = useState('')
  useEffect(() => subscribeBilling(() => force((x) => x + 1)), [])

  const b = getBilling()
  const remaining = lessonsRemaining()

  const applyPromoCode = () => {
    if (!promoInput.trim()) return
    const res = applyPromo(promoInput)
    show(res.message, res.ok ? 'success' : 'info')
    if (res.ok) setPromoInput('')
  }

  const referralLink = `https://eduson-ops.github.io/eduson-kids-web/?ref=${b.referralCode}`
  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      show('✓ Ссылка скопирована', 'success')
    } catch {
      show('Не получилось скопировать — выдели вручную', 'info')
    }
  }

  return (
    <PlatformShell activeKey="billing">
      <section className="kb-cover kb-cover--yellow">
        <div className="kb-cover-meta">
          <span className="eyebrow">Оплата · Управление уроками</span>
          <span className="kb-cover-meta-row">
            <span>Оплачено {b.lessonsPaid}</span>
            <span className="dot" />
            <span>Осталось {remaining}</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Оплата<br/><span className="kb-cover-accent">и уроки</span>
        </h1>
        <p className="kb-cover-sub">
          Прозрачный счёт: сколько заплачено, сколько уроков ещё впереди.
          Подписка или&nbsp;рассрочка на&nbsp;48 занятий — выбираешь сам.
        </p>

        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="celebrate" size={240} />
        </div>
      </section>

      {/* Large KPI cards */}
      <section style={{ marginBottom: 32 }}>
        <div className="kb-grid-3">
          <div className="kb-card kb-card--feature" style={{ borderTop: '4px solid var(--violet)' }}>
            <span className="eyebrow">Оплачено</span>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 56, color: 'var(--violet)', lineHeight: 1 }}>
              {b.lessonsPaid}
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>уроков куплено всего</div>
          </div>
          <div className="kb-card kb-card--feature" style={{ borderTop: '4px solid var(--ink)' }}>
            <span className="eyebrow">Пройдено</span>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 56, color: 'var(--ink)', lineHeight: 1 }}>
              {b.lessonsUsed}
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>из оплаченных использовано</div>
          </div>
          <div className="kb-card kb-card--feature" style={{ borderTop: '4px solid var(--mint-deep)' }}>
            <span className="eyebrow">Осталось</span>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 56, color: 'var(--mint-deep)', lineHeight: 1 }}>
              {remaining}
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
              {remaining === 0 ? 'нужно докупить' : 'доступно к прохождению'}
            </div>
          </div>
        </div>

        {b.lessonsPaid > 0 && (
          <div className="kb-progress kb-progress--lg" style={{ marginTop: 20 }}>
            <div
              className="kb-progress-bar"
              style={{
                width: `${(b.lessonsUsed / b.lessonsPaid) * 100}%`,
                background: 'linear-gradient(90deg, var(--violet), var(--yellow))',
              }}
            />
          </div>
        )}
      </section>

      {/* Active subscription banner (only if active) */}
      {b.subscription.active && (
        <section style={{ marginBottom: 24 }}>
          <div className="kb-card kb-card--feature" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 340px' }}>
              <span className="eyebrow" style={{ color: 'var(--mint-deep)' }}>
                {b.subscription.plan === 'trial' ? '🎁 Пробный период активен' : '✓ Подписка активна'}
              </span>
              <h3 className="h3" style={{ margin: '6px 0 6px' }}>
                {PLAN_INFO[b.subscription.plan === 'none' ? 'monthly' : b.subscription.plan].label}
                {b.subscription.plan !== 'trial' && ` — ${formatRub(b.subscription.pricePerMonthRub)}/мес`}
              </h3>
              {b.subscription.plan === 'trial' && b.subscription.trialEndsAt && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)' }}>
                  Бесплатно до <strong>{new Date(b.subscription.trialEndsAt).toLocaleDateString('ru-RU')}</strong>.
                  Автопереход на месячную подписку ({formatRub(PLAN_INFO['monthly'].pricePerMonth)}/мес) после — отмени заранее если не подходит.
                </p>
              )}
              {b.subscription.plan !== 'trial' && b.subscription.nextChargeAt && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)' }}>
                  Следующее списание: <strong>{new Date(b.subscription.nextChargeAt).toLocaleDateString('ru-RU')}</strong>.
                  Отмена в 1 клик, email-уведомление за 3 дня.
                </p>
              )}
            </div>
            <button className="kb-btn kb-btn--ghost kb-btn--lg" onClick={cancelSubscription}>
              Отменить
            </button>
          </div>
        </section>
      )}

      {/* Plan picker — 4 плана + Trial primary CTA */}
      {!b.subscription.active && (
        <section style={{ marginBottom: 32 }}>
          <header style={{ marginBottom: 16 }}>
            <span className="eyebrow">Подписка · выбери план</span>
            <h2 className="h2" style={{ marginTop: 6 }}>7 дней бесплатно · отмена в 1 клик</h2>
          </header>

          {/* Trial — primary */}
          <div
            className="kb-card kb-card--feature"
            style={{
              background: 'linear-gradient(135deg, #6B5CE7, #4A3DB5)',
              color: 'var(--paper)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 340px' }}>
              <span className="eyebrow" style={{ color: '#FFD43C', fontWeight: 700 }}>РЕКОМЕНДУЕМ · ПРОБНО</span>
              <h3 className="h3" style={{ color: '#fff', margin: '8px 0 8px' }}>Начни с 7 дней бесплатно</h3>
              <p style={{ color: '#fff', opacity: 0.92, fontSize: 14, marginBottom: 10, maxWidth: 480, lineHeight: 1.55 }}>
                Без кода и картой — просто попробуй все 48 уроков, 3D-Studio, Никселя-помощника и родительский кабинет.
                Карта не списывается до 8-го дня. Не понравится — отменишь в 1 клик.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#fff', opacity: 0.9, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <li>✓ Полный доступ все 7 дней</li>
                <li>✓ Email-уведомление за 3 дня до первого списания</li>
                <li>✓ 14 дней на возврат по закону (ст. 32 ЗоЗПП)</li>
              </ul>
            </div>
            <button className="kb-btn kb-btn--lg" style={{ background: '#FFD43C', color: '#15141b', fontWeight: 900 }} onClick={startTrial}>
              🎁 Попробовать бесплатно
            </button>
          </div>

          {/* Plans grid */}
          <div className="kb-grid-4" style={{ gap: 16 }}>
            <PlanCard
              plan="monthly"
              title="Месячная"
              priceLine={`${formatRub(PLAN_INFO.monthly.pricePerMonth)}/мес`}
              subLine="Привычный формат"
              bullets={['1 ребёнок', 'Отмена в 1 клик', 'Email-уведомления']}
              onPick={() => startSubscription('monthly')}
            />
            <PlanCard
              plan="annual"
              title="Годовая"
              priceLine={`${formatRub(PLAN_INFO.annual.totalRubIfYear ?? 49900)}/год`}
              subLine={`≈ ${formatRub(PLAN_INFO.annual.pricePerMonth)}/мес · −30%`}
              bullets={['1 ребёнок', 'Экономия 21 344 ₽', 'Можно отменить, вернём остаток']}
              badge="Выгодно"
              onPick={() => startSubscription('annual')}
            />
            <PlanCard
              plan="family-2"
              title="Семейная · 2"
              priceLine={`${formatRub(PLAN_INFO['family-2'].pricePerMonth)}/мес`}
              subLine={`−25% vs 2× monthly`}
              bullets={['2 ребёнка', 'Один родитель · /parent', 'Отмена в 1 клик']}
              onPick={() => startSubscription('family-2')}
            />
            <PlanCard
              plan="family-3"
              title="Семейная · 3"
              priceLine={`${formatRub(PLAN_INFO['family-3'].pricePerMonth)}/мес`}
              subLine={`−33% vs 3× monthly`}
              bullets={['3 ребёнка', 'Max выгода для семьи', 'Отмена в 1 клик']}
              badge="Лучшее"
              onPick={() => startSubscription('family-3')}
            />
          </div>

          <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            Все подписки — с правом отказа в любой момент без объяснений (ст. 32 ЗоЗПП).
            14 дней охлаждения с возвратом неиспользованного. Email-уведомление приходит за 3 дня до списания.
          </p>
        </section>
      )}

      {/* Promo code */}
      <section style={{ marginBottom: 32 }}>
        <div className="kb-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 28 }} aria-hidden>🎟</span>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Есть промокод?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              Попробуй <code style={{ background: 'var(--paper-2)', padding: '1px 5px', borderRadius: 4 }}>FRIEND14</code> — +14 дней к пробному периоду
            </div>
          </div>
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="PROMO-CODE"
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid rgba(21,20,27,.15)',
              fontFamily: 'var(--f-mono)',
              fontSize: 14,
              textTransform: 'uppercase',
              minWidth: 160,
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') applyPromoCode() }}
          />
          <button className="kb-btn kb-btn--secondary" onClick={applyPromoCode} disabled={!promoInput.trim()}>
            Применить
          </button>
        </div>
      </section>

      {/* Referral */}
      <section style={{ marginBottom: 32 }}>
        <header style={{ marginBottom: 16 }}>
          <span className="eyebrow">Приведи друга</span>
          <h2 className="h2" style={{ marginTop: 6 }}>Ты получаешь месяц бесплатно · друг — 14 дней</h2>
        </header>
        <div className="kb-card kb-card--feature" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 56, flexShrink: 0 }} aria-hidden>🤝</div>
          <div style={{ flex: '1 1 300px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.55 }}>
              За каждого друга, который оплатит подписку по твоей ссылке — мы добавим тебе <strong>1 месяц бесплатно</strong>.
              Друг получает <strong>14 дней бесплатно</strong> вместо стандартных 7.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
              <code style={{
                flex: '1 1 280px',
                background: 'var(--paper-2)',
                padding: '10px 14px',
                borderRadius: 10,
                fontFamily: 'var(--f-mono)',
                fontSize: 12,
                userSelect: 'all',
                wordBreak: 'break-all',
              }}>
                {referralLink}
              </code>
              <button className="kb-btn kb-btn--secondary" onClick={copyReferral}>
                📋 Копировать
              </button>
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 13 }}>
              <div>
                <strong style={{ fontSize: 20, color: 'var(--violet)' }}>{b.referralConverts}</strong>{' '}
                <span style={{ color: 'var(--ink-soft)' }}>друзей оплатили</span>
              </div>
              <div>
                <strong style={{ fontSize: 20, color: 'var(--mint-deep, #2E8C5F)' }}>{b.referralBonusMonths}</strong>{' '}
                <span style={{ color: 'var(--ink-soft)' }}>мес в запасе</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase options */}
      <section style={{ marginBottom: 32 }}>
        <header style={{ marginBottom: 16 }}>
          <span className="eyebrow">Разовые покупки</span>
          <h2 className="h2" style={{ marginTop: 6 }}>Рассрочка или пак-добивка</h2>
        </header>
        <div className="kb-grid-2">
          <div className="kb-card" style={{ borderLeft: '4px solid var(--violet)' }}>
            <span className="eyebrow">Полный курс в рассрочку</span>
            <h3 className="h3" style={{ marginTop: 6 }}>48 уроков за {formatRub(PRICE_INSTALLMENT_48)}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Разовое зачисление 48&nbsp;уроков сразу в&nbsp;баланс. Оплата через банк-партнёр —
              платишь помесячно, учится без&nbsp;ограничений с&nbsp;первого дня.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 14px', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--ink-soft)' }}>
              <li>✓ Все 48 уроков зачисляются сразу</li>
              <li>✓ Рассрочка 0% через банк-партнёр (обычно 6–12 мес)</li>
              <li>✓ Сертификат по окончании курса</li>
            </ul>
            <button className="kb-btn kb-btn--lg" onClick={buyInstallment48}>
              → Оформить рассрочку
            </button>
          </div>

          <div className="kb-card" style={{ borderLeft: '4px solid var(--yellow)' }}>
            <span className="eyebrow">Пак-добивка</span>
            <h3 className="h3" style={{ marginTop: 6 }}>+10 уроков за {formatRub(PRICE_PACK_10)}</h3>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Если нужно больше занятий помимо подписки или&nbsp;базового курса.
              Зачисляем моментально после оплаты. 990&nbsp;₽ за&nbsp;урок.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 14px', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--ink-soft)' }}>
              <li>✓ Мгновенное зачисление</li>
              <li>✓ Не&nbsp;сгорает — используешь когда удобно</li>
              <li>✓ Оплата картой, СБП, ЮMoney</li>
            </ul>
            <button className="kb-btn kb-btn--lg kb-btn--secondary" onClick={buyPack10}>
              + Купить 10 уроков
            </button>
          </div>
        </div>
      </section>

      {/* Purchase history */}
      {b.purchases.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <header style={{ marginBottom: 16 }}>
            <span className="eyebrow">История</span>
            <h2 className="h2" style={{ marginTop: 6 }}>Последние операции</h2>
          </header>
          <div className="kb-card">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {b.purchases.slice(0, 10).map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 16,
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(21,20,27,.06)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span style={{ fontWeight: 700 }}>
                    {p.kind === 'installment-48' ? 'Рассрочка 48 уроков' : p.kind === 'pack-10' ? 'Пак 10 уроков' : 'Подписка'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    +{p.lessons} ур.
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{formatRub(p.amountRub)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Legal note */}
      <section style={{ marginBottom: 32, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
        {isDebug() && (
          <p style={{ margin: '0 0 6px' }}>
            ⓘ&nbsp;<strong>MVP-режим:</strong> настоящие списания подключаем с&nbsp;бэкендом (ЮKassa&nbsp;/ CloudPayments).
            Сейчас все операции локальные — нужны для демонстрации UX.
          </p>
        )}
        <p style={{ margin: 0 }}>
          🛡&nbsp;Защита прав потребителя: отмена подписки — в&nbsp;1&nbsp;клик из&nbsp;этой страницы.
          14&nbsp;дней на&nbsp;возврат (ЗоЗПП&nbsp;ст.32). Данные ребёнка — по&nbsp;ФЗ-152.
        </p>
      </section>

      {toast && (
        <div key={toast.key} className={`kb-ui-toast kb-ui-toast--${toast.kind}`}>
          {toast.msg}
        </div>
      )}
    </PlatformShell>
  )
}

/** Одна карточка плана в grid-сетке на Billing */
function PlanCard({
  title,
  priceLine,
  subLine,
  bullets,
  onPick,
  badge,
}: {
  plan: SubscriptionPlan
  title: string
  priceLine: string
  subLine: string
  bullets: string[]
  onPick: () => void
  badge?: string
}) {
  return (
    <div
      className="kb-card"
      style={{
        borderTop: '4px solid var(--violet)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        padding: 18,
      }}
    >
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: 'var(--yellow)',
            color: 'var(--ink)',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 900,
            fontFamily: 'var(--f-display)',
            boxShadow: '0 2px 0 var(--ink)',
          }}
        >
          {badge}
        </span>
      )}
      <h3 className="h3" style={{ margin: 0, fontSize: 17 }}>{title}</h3>
      <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 24, lineHeight: 1, color: 'var(--violet)' }}>
        {priceLine}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{subLine}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--ink-soft)', flex: 1 }}>
        {bullets.map((b) => <li key={b}>✓ {b}</li>)}
      </ul>
      <button className="kb-btn kb-btn--secondary" onClick={onPick}>
        Выбрать
      </button>
    </div>
  )
}
