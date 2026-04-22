import { useEffect, useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import {
  getBilling,
  subscribeBilling,
  buyInstallment48,
  buyPack10,
  startSubscription,
  cancelSubscription,
  lessonsRemaining,
  formatRub,
} from '../lib/billing'

/**
 * /billing — отдельная страница «Оплата и уроки».
 * Видна в sidenav рядом с портфолио. Родитель прилетает сюда напрямую
 * и не ищет нужный раздел внутри портфолио ребёнка.
 */
export default function Billing() {
  const [, force] = useState(0)
  useEffect(() => subscribeBilling(() => force((x) => x + 1)), [])

  const b = getBilling()
  const remaining = lessonsRemaining()

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

      {/* Subscription */}
      <section style={{ marginBottom: 32 }}>
        <header style={{ marginBottom: 16 }}>
          <span className="eyebrow">Подписка с автосписанием</span>
          <h2 className="h2" style={{ marginTop: 6 }}>Безлимит уроков · 5 937 ₽/мес</h2>
        </header>
        <div className="kb-card kb-card--feature">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 340px' }}>
              <h3 className="h3" style={{ marginBottom: 8 }}>
                {b.subscription.active
                  ? `Активна — ${formatRub(b.subscription.pricePerMonthRub)}/мес`
                  : 'Не подключена'}
              </h3>
              {b.subscription.active && b.subscription.nextChargeAt && (
                <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--ink-soft)' }}>
                  Следующее списание: <strong>{new Date(b.subscription.nextChargeAt).toLocaleDateString('ru-RU')}</strong>.
                  Отменить можно в&nbsp;один клик — без звонков и&nbsp;объяснений.
                </p>
              )}
              {!b.subscription.active && (
                <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--ink-soft)' }}>
                  Подписка даёт доступ ко&nbsp;всем 48 урокам + обновлениям. Право отказа в&nbsp;любой момент
                  (ст.&nbsp;32 ЗоЗПП). 14 дней охлаждения с&nbsp;возвратом неиспользованного.
                </p>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--ink-soft)' }}>
                <li>✓ Автоматическое списание раз в месяц</li>
                <li>✓ Отмена в 1 клик — без контактов с поддержкой</li>
                <li>✓ 14 дней на возврат по закону</li>
                <li>✓ Email-уведомление за 3 дня до списания</li>
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {b.subscription.active ? (
                <button className="kb-btn kb-btn--ghost kb-btn--lg" onClick={cancelSubscription}>
                  Отменить подписку
                </button>
              ) : (
                <button className="kb-btn kb-btn--secondary kb-btn--lg" onClick={startSubscription}>
                  Подключить за {formatRub(5937)}/мес
                </button>
              )}
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
            <h3 className="h3" style={{ marginTop: 6 }}>48 уроков за {formatRub(71244)}</h3>
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
            <h3 className="h3" style={{ marginTop: 6 }}>+10 уроков за {formatRub(9900)}</h3>
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
        <p style={{ margin: '0 0 6px' }}>
          ⓘ&nbsp;<strong>MVP-режим:</strong> настоящие списания подключаем с&nbsp;бэкендом (ЮKassa&nbsp;/ CloudPayments).
          Сейчас все операции локальные — нужны для демонстрации UX.
        </p>
        <p style={{ margin: 0 }}>
          🛡&nbsp;Защита прав потребителя: отмена подписки — в&nbsp;1&nbsp;клик из&nbsp;этой страницы.
          14&nbsp;дней на&nbsp;возврат (ЗоЗПП&nbsp;ст.32). Данные ребёнка — по&nbsp;ФЗ-152.
        </p>
      </section>
    </PlatformShell>
  )
}
