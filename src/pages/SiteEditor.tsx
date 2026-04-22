import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  compileSite,
  getSite,
  subscribeSites,
  updateSite,
  THEMES,
  BLOCK_CATALOG,
  findBlockSpec,
  type Section,
  type SectionType,
  type Site,
  type SiteMode,
  type ThemeKey,
} from '../sites/sitesState'
import { nanoid } from 'nanoid'
import { SFX } from '../lib/audio'
import HtmlBlocklyWorkspace from '../components/HtmlBlocklyWorkspace'
import { NikselMini } from '../design/mascot/Niksel'

/**
 * SiteEditor — редактор сайта с тремя режимами прогрессии:
 *  L1 «Шаблон»  — секции, свойства, live-preview
 *  L2 «Блоки»   — визуальный Blockly собирает HTML+CSS
 *  L3 «Код»     — текстовый редактор HTML + CSS
 *
 * Переключение режимов сохраняет состояние: уходя в Код из Шаблона/Блоков —
 * текущий HTML/CSS компилится; возврат в Шаблон возможен только с ручным
 * подтверждением (код может быть утерян).
 */
export default function SiteEditor() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const [site, setSite] = useState<Site | null>(siteId ? getSite(siteId) ?? null : null)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const unsub = subscribeSites((st) => {
      if (!siteId) return
      const found = st.sites.find((s) => s.id === siteId)
      setSite(found ?? null)
    })
    return unsub
  }, [siteId])

  if (!site) {
    return (
      <div className="site-editor-missing">
        <h2>Сайт не найден</h2>
        <button className="kb-btn" onClick={() => navigate('/sites')}>К списку сайтов</button>
      </div>
    )
  }

  const onSwitchMode = (mode: SiteMode) => {
    SFX.click()
    if (mode === site.mode) return
    // Уход в Код → компилируем текущий режим в HTML/CSS
    if (mode === 'code') {
      if (site.mode === 'template') {
        const { html, css } = compileSite(site)
        updateSite(site.id, { mode, html, css })
        return
      }
      // из Блоков: html/css уже обновляются на каждое изменение
      updateSite(site.id, { mode })
      return
    }
    // Из Кода → предупреждение
    if (site.mode === 'code' && (mode === 'template' || mode === 'blocks')) {
      if (!confirm('Перейти в визуальный режим? Ручные правки HTML/CSS сохранятся, но могут быть перезаписаны при следующих изменениях.')) return
    }
    updateSite(site.id, { mode })
  }

  return (
    <div className="site-editor">
      <header className="site-editor-header">
        <button className="home-btn" onClick={() => navigate('/sites')} aria-label="К списку">
          ←
        </button>
        <div className="site-editor-brand">
          <NikselMini size={26} />
          <strong style={{ marginLeft: 2 }}>{site.name}</strong>
          <small>· {site.sections.length} секций</small>
        </div>
        <div className="site-mode-switch">
          <button
            className={`mode-pill ${site.mode === 'template' ? 'active' : ''}`}
            onClick={() => onSwitchMode('template')}
          >
            🧩 Шаблон <small>L1</small>
          </button>
          <span className="mode-arrow-mini">→</span>
          <button
            className={`mode-pill ${site.mode === 'blocks' ? 'active' : ''}`}
            onClick={() => onSwitchMode('blocks')}
          >
            🧱 Блоки <small>L2</small>
          </button>
          <span className="mode-arrow-mini">→</span>
          <button
            className={`mode-pill ${site.mode === 'code' ? 'active' : ''}`}
            onClick={() => onSwitchMode('code')}
          >
            📝 HTML &amp; CSS <small>L3</small>
          </button>
        </div>
        <div className="site-editor-actions">
          <input
            className="site-name-input"
            value={site.name}
            onChange={(e) => updateSite(site.id, { name: e.target.value })}
            aria-label="Имя сайта"
          />
          <button
            className="kb-btn kb-btn--sm"
            onClick={() => setShareOpen(true)}
            title="Поделиться сайтом"
          >
            🔗 Поделиться
          </button>
        </div>
      </header>

      <main className="site-editor-body">
        {site.mode === 'template' && <TemplateMode site={site} />}
        {site.mode === 'blocks' && <BlocksMode site={site} />}
        {site.mode === 'code' && <CodeMode site={site} />}
      </main>

      {shareOpen && <ShareModal site={site} onClose={() => setShareOpen(false)} />}
    </div>
  )
}

/* ─────── L1: Template mode ─────── */

function TemplateMode({ site }: { site: Site }) {
  const [selectedId, setSelectedId] = useState<string | null>(site.sections[0]?.id ?? null)
  const [addOpen, setAddOpen] = useState(false)

  const patchData = (id: string, dataPatch: Record<string, unknown>) => {
    updateSite(site.id, {
      sections: site.sections.map((s) =>
        s.id === id ? { ...s, data: { ...s.data, ...dataPatch } } : s
      ),
    })
  }
  const removeSection = (id: string) => {
    updateSite(site.id, { sections: site.sections.filter((s) => s.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }
  const duplicateSection = (id: string) => {
    const src = site.sections.find((s) => s.id === id)
    if (!src) return
    const copy: Section = { ...src, id: nanoid(6), data: JSON.parse(JSON.stringify(src.data)) }
    const idx = site.sections.findIndex((s) => s.id === id)
    const next = [...site.sections]
    next.splice(idx + 1, 0, copy)
    updateSite(site.id, { sections: next })
    setSelectedId(copy.id)
  }
  const moveSection = (id: string, dir: -1 | 1) => {
    const idx = site.sections.findIndex((s) => s.id === id)
    if (idx < 0) return
    const next = [...site.sections]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    updateSite(site.id, { sections: next })
  }
  const addSection = (type: SectionType) => {
    const spec = findBlockSpec(type)
    if (!spec) return
    const block = spec.make()
    updateSite(site.id, { sections: [...site.sections, block] })
    setSelectedId(block.id)
    setAddOpen(false)
    SFX.click()
  }

  return (
    <div className="tpl-mode tpl-mode--split">
      {/* Left column: все секции раскрыты + их редактирование inline */}
      <aside className="tpl-editor-pane">
        <header className="tpl-editor-head">
          <div>
            <strong>Секции сайта</strong>
            <small>·&nbsp;{site.sections.length}</small>
          </div>
          <div className="tpl-theme-inline">
            <span className="eyebrow">Тема</span>
            <div className="tpl-theme-swatches">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  className={`tpl-theme-dot ${site.theme === key ? 'active' : ''}`}
                  style={{ background: theme.color }}
                  onClick={() => updateSite(site.id, { theme: key as ThemeKey })}
                  title={theme.name}
                  aria-label={`Тема ${theme.name}`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="tpl-section-list">
          {site.sections.map((s, idx) => {
            const isOpen = selectedId === s.id
            return (
              <div key={s.id} className={`tpl-section-card ${isOpen ? 'open' : ''}`}>
                <button
                  className="tpl-section-header"
                  onClick={() => setSelectedId(isOpen ? null : s.id)}
                >
                  <span className="tpl-section-idx">{idx + 1}</span>
                  <span className="tpl-section-icon">{sectionEmoji(s.type)}</span>
                  <span className="tpl-section-name">{sectionLabel(s.type)}</span>
                  <span className="tpl-section-preview-hint">
                    {previewHint(s)}
                  </span>
                  <div className="tpl-section-actions">
                    <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, -1) }} title="Выше">▲</button>
                    <button onClick={(e) => { e.stopPropagation(); moveSection(s.id, 1) }} title="Ниже">▼</button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateSection(s.id) }} title="Дублировать">⎘</button>
                    <button onClick={(e) => { e.stopPropagation(); removeSection(s.id) }} title="Удалить">×</button>
                  </div>
                  <span className="tpl-section-chev" aria-hidden>{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="tpl-section-body">
                    <SectionProps
                      key={s.id}
                      section={s}
                      onChange={(p) => patchData(s.id, p)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button className="tpl-add-btn" onClick={() => { SFX.click(); setAddOpen(true) }}>
          ＋ Добавить блок
        </button>
      </aside>

      {/* Right column: live preview — половина экрана */}
      <section className="tpl-preview tpl-preview--half">
        <LivePreview site={site} />
      </section>

      {addOpen && <AddBlockModal onPick={addSection} onClose={() => setAddOpen(false)} />}
    </div>
  )
}

/** Короткая подсказка для свёрнутой секции — что в ней сейчас (первые 40 симв). */
function previewHint(s: Section): string {
  const d = s.data as Record<string, unknown>
  const text =
    (typeof d.title === 'string' && d.title) ||
    (typeof d.text === 'string' && d.text) ||
    (typeof d.q === 'string' && d.q) ||
    (Array.isArray(d.items) && d.items.length > 0 ? `${d.items.length} элементов` : '') ||
    ''
  if (!text) return ''
  return text.length > 40 ? text.slice(0, 40) + '…' : text
}

/** Модалка выбора нового блока с категориями. */
function AddBlockModal({ onPick, onClose }: { onPick: (type: SectionType) => void; onClose: () => void }) {
  type Cat = { key: string; label: string; emoji: string }
  const CATEGORIES: Cat[] = [
    { key: 'base',   label: 'Базовые',  emoji: '🧱' },
    { key: 'text',   label: 'Текст',    emoji: '📝' },
    { key: 'layout', label: 'Макет',    emoji: '🧩' },
    { key: 'media',  label: 'Медиа',    emoji: '🎬' },
    { key: 'action', label: 'Действие', emoji: '🚀' },
    { key: 'data',   label: 'Данные',   emoji: '📊' },
  ]
  const [cat, setCat] = useState<string>('base')
  const items = useMemo(() => BLOCK_CATALOG.filter((b) => b.category === cat), [cat])

  return (
    <div className="add-block-backdrop" onClick={onClose}>
      <div className="add-block-modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <strong>＋ Добавить блок</strong>
          <button className="ghost" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <div className="add-block-body">
          <aside className="add-block-cats">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`add-block-cat ${cat === c.key ? 'active' : ''}`}
                onClick={() => setCat(c.key)}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </aside>
          <div className="add-block-grid">
            {items.map((b) => (
              <button
                key={b.type}
                className="add-block-card"
                onClick={() => onPick(b.type)}
                title={b.hint}
              >
                <span className="add-block-emoji">{b.emoji}</span>
                <strong>{b.label}</strong>
                <small>{b.hint}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionProps({
  section,
  onChange,
}: {
  section: Section
  onChange: (patch: Record<string, unknown>) => void
}) {
  const d = section.data
  const s = (k: string, fb = '') => (typeof d[k] === 'string' ? (d[k] as string) : fb)
  const arr = <T,>(k: string): T[] => (Array.isArray(d[k]) ? (d[k] as T[]) : [])

  return (
    <div className="tpl-props-form">
      <header>
        <span>{sectionEmoji(section.type)}</span>
        <strong>{sectionLabel(section.type)}</strong>
      </header>

      {section.type === 'hero' && (
        <>
          <Field label="Заголовок">
            <input type="text" value={s('title')} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Подзаголовок">
            <textarea value={s('subtitle')} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </Field>
        </>
      )}

      {section.type === 'cta' && (
        <>
          <Field label="Заголовок">
            <input type="text" value={s('title')} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Текст кнопки">
            <input type="text" value={s('buttonText')} onChange={(e) => onChange({ buttonText: e.target.value })} />
          </Field>
          <Field label="Ссылка кнопки">
            <input type="text" value={s('buttonHref')} onChange={(e) => onChange({ buttonHref: e.target.value })} placeholder="https://… или #" />
          </Field>
        </>
      )}

      {section.type === 'about' && (
        <Field label="Текст о себе">
          <textarea value={s('text')} rows={5} onChange={(e) => onChange({ text: e.target.value })} />
        </Field>
      )}

      {(section.type === 'skills' || section.type === 'gallery') && (
        <>
          <Field label="Заголовок раздела">
            <input type="text" value={s('title')} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Пункты (каждый с новой строки)">
            <textarea
              rows={6}
              value={(arr<string>('items')).join('\n')}
              onChange={(e) => onChange({ items: e.target.value.split('\n').filter(Boolean) })}
            />
          </Field>
        </>
      )}

      {section.type === 'footer' && (
        <Field label="Текст подписи">
          <input type="text" value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
        </Field>
      )}

      {section.type === 'heading' && (
        <>
          <Field label="Текст заголовка">
            <input type="text" value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Размер">
            <PillSelect
              value={s('level', 'h2')}
              options={[['h2', 'Большой (H2)'], ['h3', 'Средний (H3)']]}
              onChange={(v) => onChange({ level: v })}
            />
          </Field>
          <Field label="Выравнивание">
            <PillSelect
              value={s('align', 'left')}
              options={[['left', '← Слева'], ['center', '↔ По центру'], ['right', 'Справа →']]}
              onChange={(v) => onChange({ align: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'paragraph' && (
        <>
          <Field label="Текст абзаца (пустая строка = новый абзац)">
            <textarea rows={8} value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Выравнивание">
            <PillSelect
              value={s('align', 'left')}
              options={[['left', '← Слева'], ['center', '↔ По центру'], ['right', 'Справа →']]}
              onChange={(v) => onChange({ align: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'quote' && (
        <>
          <Field label="Цитата">
            <textarea rows={4} value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Автор">
            <input type="text" value={s('author')} onChange={(e) => onChange({ author: e.target.value })} />
          </Field>
        </>
      )}

      {section.type === 'divider' && (
        <Field label="Стиль линии">
          <PillSelect
            value={s('style', 'line')}
            options={[['line', '—'], ['dashed', '- -'], ['dots', '· ·']]}
            onChange={(v) => onChange({ style: v })}
          />
        </Field>
      )}

      {section.type === 'spacer' && (
        <Field label="Размер отступа">
          <PillSelect
            value={s('size', 'md')}
            options={[['sm', 'Маленький'], ['md', 'Средний'], ['lg', 'Большой']]}
            onChange={(v) => onChange({ size: v })}
          />
        </Field>
      )}

      {section.type === 'banner' && (
        <>
          <Field label="Эмодзи">
            <input type="text" value={s('emoji')} onChange={(e) => onChange({ emoji: e.target.value })} />
          </Field>
          <Field label="Текст баннера">
            <input type="text" value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Цвет">
            <PillSelect
              value={s('color', 'accent')}
              options={[['accent', 'Акцент'], ['success', 'Зелёный'], ['warn', 'Жёлтый']]}
              onChange={(v) => onChange({ color: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'two-column' && (
        <>
          <Field label="URL картинки">
            <input type="text" value={s('imageUrl')} onChange={(e) => onChange({ imageUrl: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Заголовок">
            <input type="text" value={s('title')} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Текст">
            <textarea rows={4} value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Где картинка">
            <PillSelect
              value={s('imageSide', 'left')}
              options={[['left', '← Слева'], ['right', 'Справа →']]}
              onChange={(v) => onChange({ imageSide: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'image' && (
        <>
          <Field label="URL картинки">
            <input type="text" value={s('src')} onChange={(e) => onChange({ src: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Описание (alt — кратко, что на картинке)">
            <input type="text" value={s('alt')} onChange={(e) => onChange({ alt: e.target.value })} />
          </Field>
          <Field label="Подпись под картинкой (необязательно)">
            <input type="text" value={s('caption')} onChange={(e) => onChange({ caption: e.target.value })} />
          </Field>
          <Field label="Ссылка по клику (необязательно)">
            <input type="text" value={s('linkHref')} onChange={(e) => onChange({ linkHref: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Ширина">
            <PillSelect
              value={s('width', 'full')}
              options={[['sm', 'Маленькая'], ['md', 'Средняя'], ['full', 'На всю']]}
              onChange={(v) => onChange({ width: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'image-row' && (
        <RepeaterField
          label="Картинки в ряд"
          items={arr<{ src?: string; alt?: string }>('items')}
          onChange={(items) => onChange({ items })}
          newItem={() => ({ src: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', alt: '' })}
          render={(it, update) => (
            <>
              <input className="rep-input" placeholder="URL картинки" value={it.src || ''} onChange={(e) => update({ src: e.target.value })} />
              <input className="rep-input" placeholder="Alt (описание)" value={it.alt || ''} onChange={(e) => update({ alt: e.target.value })} />
            </>
          )}
        />
      )}

      {section.type === 'video' && (
        <>
          <Field label="Ссылка YouTube или Vimeo">
            <input type="text" value={s('url')} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <Field label="Подпись под видео (необязательно)">
            <input type="text" value={s('caption')} onChange={(e) => onChange({ caption: e.target.value })} />
          </Field>
        </>
      )}

      {section.type === 'button' && (
        <>
          <Field label="Текст кнопки">
            <input type="text" value={s('text')} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Ссылка">
            <input type="text" value={s('href')} onChange={(e) => onChange({ href: e.target.value })} placeholder="https://… или mailto:" />
          </Field>
          <Field label="Стиль">
            <PillSelect
              value={s('variant', 'solid')}
              options={[['solid', '■ Полная'], ['ghost', '□ Обводка']]}
              onChange={(v) => onChange({ variant: v })}
            />
          </Field>
          <Field label="Выравнивание">
            <PillSelect
              value={s('align', 'center')}
              options={[['left', '←'], ['center', '↔'], ['right', '→']]}
              onChange={(v) => onChange({ align: v })}
            />
          </Field>
        </>
      )}

      {section.type === 'link-cards' && (
        <>
          <Field label="Заголовок (необязательно)">
            <input type="text" value={s('title')} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <RepeaterField
            label="Карточки со ссылками"
            items={arr<{ emoji?: string; title?: string; desc?: string; href?: string }>('items')}
            onChange={(items) => onChange({ items })}
            newItem={() => ({ emoji: '🔗', title: 'Новая ссылка', desc: '', href: '#' })}
            render={(it, update) => (
              <>
                <input className="rep-input" style={{ maxWidth: 60 }} placeholder="🔗" value={it.emoji || ''} onChange={(e) => update({ emoji: e.target.value })} />
                <input className="rep-input" placeholder="Название" value={it.title || ''} onChange={(e) => update({ title: e.target.value })} />
                <input className="rep-input" placeholder="Описание" value={it.desc || ''} onChange={(e) => update({ desc: e.target.value })} />
                <input className="rep-input" placeholder="URL" value={it.href || ''} onChange={(e) => update({ href: e.target.value })} />
              </>
            )}
          />
        </>
      )}

      {section.type === 'social' && (
        <RepeaterField
          label="Иконки соцсетей"
          items={arr<{ kind?: string; href?: string }>('items')}
          onChange={(items) => onChange({ items })}
          newItem={() => ({ kind: 'tg', href: '' })}
          render={(it, update) => (
            <>
              <select className="rep-input" style={{ maxWidth: 100 }} value={it.kind || 'tg'} onChange={(e) => update({ kind: e.target.value })}>
                <option value="tg">Telegram</option>
                <option value="vk">ВКонтакте</option>
                <option value="yt">YouTube</option>
                <option value="gh">GitHub</option>
                <option value="ig">Instagram</option>
                <option value="web">Сайт</option>
                <option value="mail">Почта</option>
              </select>
              <input className="rep-input" placeholder="URL или mailto:" value={it.href || ''} onChange={(e) => update({ href: e.target.value })} />
            </>
          )}
        />
      )}

      {section.type === 'stats' && (
        <RepeaterField
          label="Числа-статистики"
          items={arr<{ value?: string; label?: string }>('items')}
          onChange={(items) => onChange({ items })}
          newItem={() => ({ value: '100', label: 'штук' })}
          render={(it, update) => (
            <>
              <input className="rep-input" style={{ maxWidth: 90 }} placeholder="Число" value={it.value || ''} onChange={(e) => update({ value: e.target.value })} />
              <input className="rep-input" placeholder="Подпись" value={it.label || ''} onChange={(e) => update({ label: e.target.value })} />
            </>
          )}
        />
      )}

      {section.type === 'timeline' && (
        <RepeaterField
          label="Точки таймлайна"
          items={arr<{ date?: string; title?: string; desc?: string }>('items')}
          onChange={(items) => onChange({ items })}
          newItem={() => ({ date: '2026', title: 'Событие', desc: '' })}
          render={(it, update) => (
            <>
              <input className="rep-input" style={{ maxWidth: 90 }} placeholder="Дата" value={it.date || ''} onChange={(e) => update({ date: e.target.value })} />
              <input className="rep-input" placeholder="Заголовок" value={it.title || ''} onChange={(e) => update({ title: e.target.value })} />
              <input className="rep-input" placeholder="Описание" value={it.desc || ''} onChange={(e) => update({ desc: e.target.value })} />
            </>
          )}
        />
      )}

      {section.type === 'faq' && (
        <RepeaterField
          label="Вопросы и ответы"
          items={arr<{ q?: string; a?: string }>('items')}
          onChange={(items) => onChange({ items })}
          newItem={() => ({ q: 'Вопрос?', a: 'Ответ.' })}
          render={(it, update) => (
            <>
              <input className="rep-input" placeholder="Вопрос" value={it.q || ''} onChange={(e) => update({ q: e.target.value })} />
              <textarea className="rep-input" placeholder="Ответ" rows={2} value={it.a || ''} onChange={(e) => update({ a: e.target.value })} />
            </>
          )}
        />
      )}
    </div>
  )
}

/** Компактный pill-switch для коротких enum-выборов. */
function PillSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: Array<[string, string]>
  onChange: (v: string) => void
}) {
  return (
    <div className="pill-select">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          className={`pill-select-btn ${value === v ? 'active' : ''}`}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** Повторяющийся список однотипных элементов (картинки/ссылки/FAQ). */
function RepeaterField<T>({
  label,
  items,
  onChange,
  newItem,
  render,
}: {
  label: string
  items: T[]
  onChange: (next: T[]) => void
  newItem: () => T
  render: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode
}) {
  const update = (idx: number, patch: Partial<T>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx))
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }
  return (
    <div className="tpl-repeater">
      <span className="tpl-repeater-label">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="tpl-repeater-row">
          <div className="tpl-repeater-inputs">{render(it, (p) => update(i, p))}</div>
          <div className="tpl-repeater-actions">
            <button type="button" onClick={() => move(i, -1)} title="Выше">▲</button>
            <button type="button" onClick={() => move(i, 1)} title="Ниже">▼</button>
            <button type="button" onClick={() => remove(i)} title="Удалить">×</button>
          </div>
        </div>
      ))}
      <button type="button" className="tpl-repeater-add" onClick={() => onChange([...items, newItem()])}>
        ＋ Добавить
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="tpl-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function LivePreview({ site }: { site: Site }) {
  const { html, css } = useMemo(() => compileSite(site), [site])
  const doc = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head>${htmlBody(html)}</html>`,
    [html, css]
  )
  return (
    <div className="tpl-preview-frame">
      <iframe srcDoc={doc} title="Превью сайта" sandbox="allow-same-origin" />
    </div>
  )
}

function htmlBody(fullHtml: string): string {
  const m = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return m ? `<body>${m[1]}</body>` : `<body>${fullHtml}</body>`
}

/* ─────── L2: Blocks mode ─────── */

function BlocksMode({ site }: { site: Site }) {
  const [htmlBody, setHtmlBody] = useState(site.html)
  const [cssBody, setCssBody] = useState(site.css)

  const onBlocksChange = (html: string, css: string, _theme: string, xml: string) => {
    setHtmlBody(html)
    setCssBody(css)
    updateSite(site.id, { html, css, blocksXml: xml })
  }

  const doc = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${cssBody}</style></head><body>${htmlBody}</body></html>`,
    [htmlBody, cssBody]
  )

  return (
    <div className="blocks-mode">
      <section className="blocks-mode-canvas">
        <HtmlBlocklyWorkspace initialXml={site.blocksXml} onChange={onBlocksChange} />
      </section>
      <section className="blocks-mode-preview">
        <div className="blocks-mode-preview-header">Превью</div>
        <iframe srcDoc={doc} title="Превью" sandbox="allow-same-origin" />
      </section>
    </div>
  )
}

/* ─────── L3: Code mode ─────── */

function CodeMode({ site }: { site: Site }) {
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html')
  const doc = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${site.css}</style></head>${htmlBody(site.html)}</html>`,
    [site.html, site.css]
  )

  return (
    <div className="code-mode">
      <section className="code-mode-editor">
        <div className="code-tabs">
          <button
            className={`code-tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML
          </button>
          <button
            className={`code-tab ${activeTab === 'css' ? 'active' : ''}`}
            onClick={() => setActiveTab('css')}
          >
            CSS
          </button>
        </div>
        <textarea
          className="code-mode-textarea"
          key={activeTab}
          value={activeTab === 'html' ? site.html : site.css}
          onChange={(e) => updateSite(site.id, activeTab === 'html' ? { html: e.target.value } : { css: e.target.value })}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
        />
      </section>
      <section className="code-mode-preview">
        <div className="code-mode-preview-header">Превью</div>
        <iframe srcDoc={doc} title="Превью" sandbox="allow-same-origin" />
      </section>
    </div>
  )
}

/* ─────── Share modal ─────── */

const SHARE_URL_LIMIT = 8000

function ShareModal({ site, onClose }: { site: Site; onClose: () => void }) {
  const { encoded, tooLarge } = useMemo(() => {
    try {
      const snap = { n: site.name, t: site.theme, h: site.html, c: site.css }
      const json = JSON.stringify(snap)
      const enc = btoa(unescape(encodeURIComponent(json)))
      return { encoded: enc, tooLarge: enc.length > SHARE_URL_LIMIT }
    } catch {
      return { encoded: '', tooLarge: false }
    }
  }, [site])
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const shareUrl = encoded
    ? `${window.location.origin}${basePath}/share#s=${encoded}`
    : ''
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <strong>🔗 Поделиться сайтом</strong>
          <button className="ghost" onClick={onClose}>×</button>
        </header>
        {tooLarge ? (
          <p className="share-hint" style={{ color: 'var(--pink-ink)', background: 'var(--pink-soft)', borderRadius: 8, padding: '10px 14px' }}>
            ⚠ Сайт слишком большой для ссылки. Удали часть изображений или текста, чтобы уложиться в лимит браузера.
          </p>
        ) : (
          <>
            <p className="share-hint">
              Отправь ссылку другу — сайт откроется у него в браузере, без установки и без аккаунта.
            </p>
            <div className="share-url-row">
              <input readOnly value={shareUrl} />
              <button className="kb-btn" onClick={copy}>{copied ? '✓ Скопировано' : 'Копировать'}</button>
            </div>
            <p className="share-hint" style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
              💡 Ссылка содержит сам сайт в закодированном виде. Чем сайт больше — тем длиннее ссылка.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function sectionEmoji(t: Section['type']): string {
  return findBlockSpec(t)?.emoji ?? '🧱'
}

function sectionLabel(t: Section['type']): string {
  return findBlockSpec(t)?.label ?? t
}
