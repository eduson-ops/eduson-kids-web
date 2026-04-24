import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'

/**
 * /enterprise — B2B/B2G landing для школ, районов, Сферум-партнёров.
 *
 * Показывает LTI 1.3 / SCORM / SSO / DPA / audit-log как готовые feature-tracks
 * (в роадмапе P3, но архитектура описана и мы открыты к пилотам).
 *
 * Цена формируется по объёму (seat-based) с выгодой на district-уровне.
 */

const TIERS = [
  {
    name: 'School',
    seats: 'от 30',
    price: '299 ₽',
    unit: 'seat/мес',
    colorFrom: 'var(--violet)',
    colorTo: 'var(--violet-deep)',
    features: [
      'Учительская консоль',
      'Heatmap + тревоги',
      'Задания с дедлайнами',
      'LTI 1.3 launch (Moodle / Canvas)',
      'VK + Яндекс SSO',
      'Базовая аналитика класса',
      'Email-поддержка 1 раб.день',
    ],
  },
  {
    name: 'District',
    seats: 'от 500',
    price: '199 ₽',
    unit: 'seat/мес',
    colorFrom: 'var(--mint-deep)',
    colorTo: 'var(--mint-ink)',
    highlight: 'Выгодно',
    features: [
      'Всё из School',
      'Мульти-школа консоль',
      'SSO Сферум / Госуслуги',
      'Данные в Yandex Cloud (РФ)',
      'SAML 2.0 + SCIM provisioning',
      'Аудит-лог 1 год',
      'Email + чат-поддержка 4 часа',
      'Свой под-домен *.eduson.kids',
    ],
  },
  {
    name: 'Custom · B2G',
    seats: 'по запросу',
    price: 'от 1 млн ₽',
    unit: 'год',
    colorFrom: 'var(--orange)',
    colorTo: 'var(--orange-deep)',
    features: [
      'Всё из District',
      'Реестр Минцифры',
      'ФЗ-152 ПДн-Оператор',
      'SLA 99,9% + DPA',
      'Выделенный аккаунт-менеджер',
      'Кастомный брендинг',
      'On-premise опция',
      'ФГОС-код компетенции на сертификат',
    ],
  },
]

const COMPLIANCE = [
  { title: 'ФЗ-152', desc: 'Персональные данные обрабатываются в соответствии с законом. Право на удаление, экспорт, отзыв согласия.' },
  { title: 'ЗоЗПП ст.32', desc: 'Отмена подписки в 1 клик, 14 дней охлаждения, email-уведомление за 3 дня до списания.' },
  { title: 'WCAG 2.2 AA', desc: 'Skip-to-content, focus-visible, prefers-reduced-motion, a11y-токены готовы.', status: 'в процессе' },
  { title: 'ГОСТ Р 52872-2019', desc: 'Доступность для лиц с ограниченными возможностями. Требование для госзакупок.', status: 'в процессе' },
  { title: 'LTI 1.3 Advantage', desc: 'AGS (Assignment & Grade Services), Deep Linking 2.0, Names & Role Provisioning.', status: 'роадмап' },
  { title: 'SCORM 1.2 / 2004', desc: 'Экспорт капстонов как SCORM-пакетов. cmi.completion_status, cmi.score.raw.', status: 'роадмап' },
  { title: 'SAML 2.0 / OIDC', desc: 'Google Workspace, Microsoft 365, Яндекс 360, Сферум, Госуслуги.', status: 'роадмап' },
  { title: 'SOC 2 Type II', desc: 'Процесс подачи — после выхода в коммерческую эксплуатацию.', status: 'план 2026' },
]

export default function Enterprise() {
  return (
    <PlatformShell>
      <section className="kb-cover">
        <div className="kb-cover-meta">
          <span className="eyebrow">Для школ · районов · госучреждений</span>
          <span className="kb-cover-meta-row">
            <span>LTI 1.3</span>
            <span className="dot" />
            <span>SCORM</span>
            <span className="dot" />
            <span>SSO</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Эдюсон Kids<br/>
          <span className="kb-cover-accent">для образования.</span>
        </h1>
        <p className="kb-cover-sub">
          Курс программирования 9–15 лет. Учительская консоль, интеграция с{' '}
          LMS через LTI, экспорт оценок, соответствие ФЗ-152. От 199 ₽/seat в месяц.
        </p>
        <div className="kb-cover-actions">
          <a href="mailto:schools@eduson.kids" className="kb-btn kb-btn--lg kb-btn--secondary">
            ✉ Запросить пилот
          </a>
          <Link to="/auth/sso" className="kb-btn kb-btn--lg kb-btn--ghost" style={{ color: 'var(--paper)', boxShadow: 'inset 0 0 0 2px rgba(255,251,243,.6)' }}>
            SSO
          </Link>
        </div>
        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="celebrate" size={240} />
        </div>
      </section>

      {/* Pricing tiers */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Тарифы</h2>
        <div className="kb-grid-3" style={{ gap: 16 }}>
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="kb-card"
              style={{
                background: `linear-gradient(135deg, ${t.colorFrom}, ${t.colorTo})`,
                color: 'var(--paper)',
                padding: 24,
                position: 'relative',
              }}
            >
              {t.highlight && (
                <span
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
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
                  {t.highlight}
                </span>
              )}
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--yellow)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {t.name}
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 32, lineHeight: 1, color: 'var(--paper)' }}>
                  {t.price}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,251,243,.85)', marginTop: 4 }}>{t.unit}</div>
              </div>
              <div style={{ fontSize: 12, marginTop: 12, color: 'rgba(255,251,243,.85)' }}>
                Объём: <strong style={{ color: 'var(--paper)' }}>{t.seats}</strong>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,251,243,.2)', margin: '18px 0' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--paper)' }}>
                {t.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <a
                href="mailto:schools@eduson.kids"
                className="kb-btn"
                style={{
                  marginTop: 18,
                  background: 'var(--yellow)',
                  color: 'var(--ink)',
                  display: 'inline-flex',
                  fontWeight: 900,
                }}
              >
                Запросить расчёт →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance matrix */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Compliance и стандарты</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 20, maxWidth: 640 }}>
          Готовность по юр.требованиям РФ и международным edtech-стандартам. Прозрачно указываем что уже готово, что в разработке, что в роадмапе.
        </p>
        <div className="kb-grid-2">
          {COMPLIANCE.map((c) => (
            <div key={c.title} className="kb-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <strong style={{ fontSize: 15 }}>{c.title}</strong>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: !c.status
                      ? 'rgba(46, 140, 95, 0.15)'
                      : c.status === 'в процессе'
                      ? 'rgba(255, 212, 60, 0.25)'
                      : 'rgba(107, 92, 231, 0.12)',
                    color: !c.status
                      ? 'var(--mint-deep, #2E8C5F)'
                      : c.status === 'в процессе'
                      ? 'var(--yellow-ink, #7A5900)'
                      : 'var(--violet)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.status ?? '✓ готово'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 0', lineHeight: 1.55 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Integration snippets (LTI/SCORM proof-of-seriousness) */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Как интегрируемся</h2>
        <div className="kb-grid-2">
          <div className="kb-card" style={{ padding: 20 }}>
            <strong style={{ fontSize: 15 }}>LTI 1.3 Tool Provider</strong>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 12px', lineHeight: 1.55 }}>
              Launch из Moodle / Canvas / Blackboard / Сферум одним JWT-токеном.
              Оценки уходят обратно в журнал школы через AGS.
            </p>
            <pre style={{
              background: 'var(--paper-2)',
              padding: 12,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'var(--f-mono)',
              overflow: 'auto',
              color: 'var(--ink)',
              lineHeight: 1.5,
              margin: 0,
            }}>
{`POST /lti/launch
Authorization: Bearer <jwt>
{
  iss: "https://sferum.ru",
  sub: "user-12345",
  roles: ["Learner"],
  context: { id: "class-5a" }
}`}
            </pre>
          </div>
          <div className="kb-card" style={{ padding: 20 }}>
            <strong style={{ fontSize: 15 }}>SCORM 1.2 / 2004 экспорт</strong>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '8px 0 12px', lineHeight: 1.55 }}>
              Капстоны упаковываются в ZIP c imsmanifest.xml.
              Загружай в любую LMS — отслеживание completion и баллов работает из коробки.
            </p>
            <pre style={{
              background: 'var(--paper-2)',
              padding: 12,
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'var(--f-mono)',
              overflow: 'auto',
              color: 'var(--ink)',
              lineHeight: 1.5,
              margin: 0,
            }}>
{`capstone-m1-obby-platform.zip
├── imsmanifest.xml
├── index.html
├── assets/
└── scorm_api.js

→ cmi.completion_status = "completed"
→ cmi.score.raw = 85`}
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="kb-card kb-card--feature" style={{ background: 'var(--yellow-soft)', marginBottom: 40 }}>
        <h3 className="h3" style={{ color: 'var(--yellow-ink)' }}>Готовы обсудить пилот?</h3>
        <p style={{ color: 'var(--ink)', marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
          Запускаем пилоты в сентябре 2026. Школа — 30 seats на месяц бесплатно. Потом — School-tier.
          Для B2G (регион, муниципалитет) — индивидуальное соглашение.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <a href="mailto:schools@eduson.kids" className="kb-btn kb-btn--secondary">
            ✉ schools@eduson.kids
          </a>
          <Link to="/legal/privacy" className="kb-btn">
            Политика ПДн
          </Link>
          <Link to="/auth/sso" className="kb-btn">
            SSO-провайдеры →
          </Link>
        </div>
      </section>
    </PlatformShell>
  )
}
