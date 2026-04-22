import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import {
  TEMPLATES,
  THEMES,
  createSiteFromTemplate,
  deleteSite,
  subscribeSites,
  type Site,
} from '../sites/sitesState'
import { SFX } from '../lib/audio'
import NikselIcon from '../design/mascot/NikselIcon'

/**
 * SitesHub — лобби трека «Сайты».
 * Показывает: (а) уже созданные сайты пользователя, (б) шаблоны для старта.
 * Клик по шаблону создаёт новый сайт и отправляет в /sites/:id.
 */
export default function SitesHub() {
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => subscribeSites((s) => setSites(s.sites)), [])

  const onStart = (templateId: string) => {
    SFX.click()
    const site = createSiteFromTemplate(templateId)
    navigate(`/sites/${site.id}`)
  }

  const onDelete = (id: string) => {
    if (confirm('Удалить этот сайт? Это навсегда.')) {
      deleteSite(id)
      SFX.click()
    }
  }

  return (
    <PlatformShell activeKey="sites">
      {/* Hero */}
      <section className="kb-hero" style={{ marginBottom: 40 }}>
        <div>
          <span className="eyebrow">Трек 2 из 2</span>
          <h1>Сайты: от шаблона к коду</h1>
          <p>
            Собирай странички из блоков-секций. Когда будешь готов — перейди в HTML&nbsp;&amp;&nbsp;CSS
            и пиши «по-настоящему».
          </p>
          <div className="kb-hero-actions">
            <button className="kb-btn kb-btn--lg" onClick={() => onStart('about-me')}>
              ➕ Начать с шаблона
            </button>
            <Link to="/studio" className="kb-btn kb-btn--ghost kb-btn--lg">
              Вернуться в Студию игр
            </Link>
          </div>
        </div>
        <div style={{ fontSize: 160, lineHeight: 1 }}>🌐</div>
      </section>

      {/* Мои сайты */}
      {sites.length === 0 && (
        <section style={{ marginBottom: 40 }}>
          <div className="kb-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32 }}>
            <NikselIcon kind="build" size={80} />
            <div>
              <h3 className="h3" style={{ marginBottom: 8 }}>Твои сайты появятся здесь</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 16 }}>
                Выбери шаблон ниже — Никсель поможет собрать первый сайт за 5 минут!
              </p>
              <button className="kb-btn" onClick={() => onStart('about-me')}>
                ➕ Начать с шаблона «Обо мне»
              </button>
            </div>
          </div>
        </section>
      )}

      {sites.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <h2 className="h2">Мои сайты</h2>
            <span className="eyebrow">{sites.length}</span>
          </div>
          <div className="kb-grid-3">
            {sites.map((s) => {
              const theme = THEMES[s.theme]
              return (
                <div
                  key={s.id}
                  className="kb-course site-card"
                  style={{
                    '--accent': theme.color,
                    '--accent-soft': theme.soft,
                    '--accent-ink': theme.ink,
                  } as React.CSSProperties}
                >
                  <div className="kb-course-top">
                    <span className="kb-course-age">{s.mode === 'template' ? 'Шаблон' : 'Код'}</span>
                    <button
                      className="site-card-del"
                      onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                      title="Удалить"
                      aria-label="Удалить"
                    >
                      ×
                    </button>
                  </div>
                  <Link to={`/sites/${s.id}`} style={{ display: 'contents' }}>
                    <div className="kb-course-icon" style={{ fontSize: 64 }}>🌐</div>
                    <div>
                      <div className="h3" style={{ fontSize: 18 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                        {s.sections.length} секций · {formatDate(s.updated)}
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Шаблоны */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
          <h2 className="h2">Начни с шаблона</h2>
          <span className="eyebrow">{TEMPLATES.length} готовых шаблона</span>
        </div>
        <div className="kb-grid-4">
          {TEMPLATES.map((t) => {
            const theme = THEMES[t.theme]
            return (
              <button
                key={t.id}
                className="kb-course site-template"
                onClick={() => onStart(t.id)}
                style={{
                  '--accent': theme.color,
                  '--accent-soft': theme.soft,
                  '--accent-ink': theme.ink,
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: 'none',
                  font: 'inherit',
                  color: 'inherit',
                } as React.CSSProperties}
              >
                <div className="kb-course-top">
                  <span className="kb-course-age">Шаблон</span>
                  <span className="kb-course-level">→</span>
                </div>
                <div className="kb-course-icon">{t.emoji}</div>
                <div>
                  <div className="h3" style={{ fontSize: 16 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.4 }}>
                    {t.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Progress pipeline */}
      <section style={{ marginBottom: 40 }}>
        <h2 className="h2" style={{ marginBottom: 20 }}>Как устроен трек</h2>
        <div className="sites-pipeline">
          <div className="pipeline-step">
            <div className="pipeline-n">L1</div>
            <div>
              <strong>Шаблон из блоков</strong>
              <p>Выбираешь секции, меняешь текст и цвета. Живое превью.</p>
            </div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="pipeline-n">L2</div>
            <div>
              <strong>HTML &amp; CSS</strong>
              <p>Открываешь код за шаблоном, редактируешь «по-настоящему».</p>
            </div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="pipeline-n">✓</div>
            <div>
              <strong>Публикация</strong>
              <p>Сохраняешь и делишься ссылкой (в v1.0).</p>
            </div>
          </div>
        </div>
      </section>
    </PlatformShell>
  )
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60_000) return 'только что'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} мин назад`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} ч назад`
  return d.toLocaleDateString('ru-RU')
}
