import { useState } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'

/**
 * /auth/sso — страница SSO для школ и B2G.
 *
 * MVP-stub с заглушками 6 провайдеров. При клике — показывает
 * toast «Интеграция на подключении». Реальные OAuth/SAML flows
 * в архитектуре (см. architecture/backend_v1.md) и роадмапе P3.
 *
 * Роли после авторизации (в бэке):
 *   - student        (default)
 *   - parent         (linked_students: string[])
 *   - teacher        (classroom_ids: string[])
 *   - school_admin   (school_id, teacher_ids)
 *   - district_admin (district_id, school_ids)
 */

type Region = 'international' | 'russia' | 'ru-b2g'

interface Provider {
  id: string
  label: string
  sub: string
  region: Region
  type: 'OIDC' | 'SAML 2.0' | 'OAuth 2.0'
  badge?: string
  color: string
  ready: boolean
}

const PROVIDERS: Provider[] = [
  {
    id: 'vk',
    label: 'VK ID',
    sub: 'OAuth 2.0 · для B2C родителей/детей',
    region: 'russia',
    type: 'OAuth 2.0',
    color: '#0077FF',
    badge: 'B2C',
    ready: true,
  },
  {
    id: 'yandex',
    label: 'Яндекс 360 для образования',
    sub: 'OAuth 2.0 · для российских учреждений',
    region: 'russia',
    type: 'OAuth 2.0',
    color: '#FFCC00',
    ready: false,
  },
  {
    id: 'gosuslugi',
    label: 'Госуслуги · ЕСИА',
    sub: 'SAML 2.0 · B2G, госзакупки, реестр Минцифры',
    region: 'ru-b2g',
    type: 'SAML 2.0',
    badge: 'B2G',
    color: '#0D4CD3',
    ready: false,
  },
  {
    id: 'sferum',
    label: 'Сферум / Моя Школа',
    sub: 'LTI 1.3 + OIDC · федеральная платформа школ РФ',
    region: 'ru-b2g',
    type: 'OIDC',
    badge: 'B2G',
    color: '#FF5A00',
    ready: false,
  },
  {
    id: 'google',
    label: 'Google Workspace',
    sub: 'OIDC · для международных школ',
    region: 'international',
    type: 'OIDC',
    color: '#4285F4',
    ready: false,
  },
  {
    id: 'microsoft',
    label: 'Microsoft 365 / Entra ID',
    sub: 'SAML 2.0 · корпоративный SSO',
    region: 'international',
    type: 'SAML 2.0',
    color: '#00A4EF',
    ready: false,
  },
]

export default function AuthSSO() {
  const [notice, setNotice] = useState<string | null>(null)

  const onPick = (p: Provider) => {
    if (p.id === 'vk') {
      window.location.href = '/login?via=vk'
      return
    }
    setNotice(`Интеграция с ${p.label} — в разработке (${p.type}). Для раннего доступа: schools@eduson.kids`)
  }

  return (
    <PlatformShell>
      <section className="kb-cover">
        <div className="kb-cover-meta">
          <span className="eyebrow">SSO · для школ и организаций</span>
          <span className="kb-cover-meta-row">
            <span>6 провайдеров</span>
            <span className="dot" />
            <span>SAML / OIDC / OAuth</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Войти через<br/><span className="kb-cover-accent">школу</span>
        </h1>
        <p className="kb-cover-sub">
          Единый вход для учителей, администраторов и учеников через
          корпоративные директории. Роли автоматически из провайдера.
        </p>
        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="wave" size={240} />
        </div>
      </section>

      {/* Providers grid */}
      <section style={{ marginBottom: 32 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Выбери свой провайдер</h2>
        <div className="kb-grid-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="kb-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 18,
                border: '2px solid rgba(21,20,27,.08)',
                background: 'var(--paper)',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                transition: 'border-color .12s, transform .12s',
                position: 'relative',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
              onMouseUp={(e) => e.currentTarget.style.transform = ''}
              onMouseLeave={(e) => e.currentTarget.style.transform = ''}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: p.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--f-display)',
                  fontWeight: 900,
                  fontSize: 22,
                  flexShrink: 0,
                }}
                aria-hidden
              >
                {p.label[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 15 }}>{p.label}</strong>
                  {p.badge && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: p.badge === 'B2G' ? '#FFE4EC' : 'var(--violet-soft)',
                      color: p.badge === 'B2G' ? 'var(--pink-ink)' : 'var(--violet-ink)',
                      letterSpacing: '0.5px',
                    }}>
                      {p.badge}
                    </span>
                  )}
                  {!p.ready && (
                    <span style={{
                      fontSize: 10,
                      color: 'var(--ink-soft)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: 700,
                    }}>
                      Q2 2026
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {p.sub}
                </div>
              </div>
              <span style={{ fontSize: 20, color: 'var(--ink-soft)' }} aria-hidden>→</span>
            </button>
          ))}
        </div>
      </section>

      {notice && (
        <div
          role="status"
          style={{ background: 'var(--violet-soft)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
        >
          <span style={{ fontSize: 13, color: 'var(--violet-ink)', lineHeight: 1.5 }}>{notice}</span>
          <button onClick={() => setNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--violet-ink)', opacity: 0.7, flexShrink: 0 }} aria-label="Закрыть">✕</button>
        </div>
      )}

      {/* Roles info */}
      <section style={{ marginBottom: 32 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Роли после авторизации</h2>
        <div className="kb-grid-3">
          {([
            { role: 'Ученик', desc: 'Доступ к урокам, Студии, Сайтам', icon: '🧑‍🎓' },
            { role: 'Родитель', desc: 'Прогресс ребёнка + оплата', icon: '👨‍👩‍👦' },
            { role: 'Учитель', desc: 'Классы + задания + heatmap', icon: '🎓' },
            { role: 'Админ школы', desc: 'Учителя + seats + аудит-лог', icon: '🏫' },
            { role: 'Админ района', desc: 'Несколько школ, консолидация', icon: '🏛' },
            { role: 'Супер-админ', desc: 'Биллинг + SSO-настройки + DPA', icon: '⚙️' },
          ]).map(({ role, desc, icon }) => (
            <div key={role} className="kb-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 28 }} aria-hidden>{icon}</div>
              <strong style={{ fontSize: 14, display: 'block', marginTop: 6 }}>{role}</strong>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '4px 0 0', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="kb-card kb-card--feature" style={{ background: 'var(--violet-soft)', marginBottom: 40 }}>
        <h3 className="h3" style={{ color: 'var(--violet-ink)' }}>Для своей школы?</h3>
        <p style={{ color: 'var(--violet-ink)', marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
          Если ваша школа уже использует SAML/OIDC-провайдер — подключим за 1–2 дня.
          Для Сферум / Моя Школа / Госуслуги — в рамках федеральной заявки, ориентир 3 недели.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <a href="mailto:schools@eduson.kids" className="kb-btn kb-btn--secondary">
            ✉ schools@eduson.kids
          </a>
          <Link to="/enterprise" className="kb-btn">
            Enterprise тарифы →
          </Link>
        </div>
      </section>
    </PlatformShell>
  )
}
