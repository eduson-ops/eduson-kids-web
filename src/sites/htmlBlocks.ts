import * as Blockly from 'blockly'

/**
 * Блочное программирование HTML/CSS для трека «Сайты».
 * Это отдельный набор блоков, не пересекается с игровыми блоками (ek_*).
 * Префикс: ek_site_
 *
 * Генератор выдаёт пару { html, css } — используется в SiteEditor для live-превью.
 */

// ── Brand palette ──
const C_PAGE    = '#6B5CE7'   // violet — структура страницы
const C_SECTION = '#FFB4C8'   // pink   — секции
const C_MEDIA   = '#A9D8FF'   // sky    — медиа (img/video)
const C_LINK    = '#9FE8C7'   // mint   — ссылки и кнопки
const C_STYLE   = '#FFD43C'   // yellow — оформление

type GenFn = (block: Blockly.Block, g: Blockly.CodeGenerator) => string | [string, number]

// Мы храним CSS-сниппеты в глобальной карте при каждом прогоне — генератор добавляет
// туда стили, если блок их требует. На уровне верхнего `ek_site_page` мы их
// собираем в единый stylesheet.
const cssBucket = new Map<string, string>()

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function indent(s: string, n = 2): string {
  const pad = ' '.repeat(n)
  return s.split('\n').map((l) => (l ? pad + l : l)).join('\n')
}

// Тема → CSS-переменные
const THEME_CSS: Record<string, { accent: string; soft: string; ink: string; paper: string }> = {
  violet: { accent: '#6B5CE7', soft: '#E4E0FC', ink: '#2A1F8C', paper: '#FFFBF3' },
  mint:   { accent: '#34C38A', soft: '#D8F5E7', ink: '#0C4E2E', paper: '#FFFBF3' },
  pink:   { accent: '#FF8CAE', soft: '#FFE4EC', ink: '#6A1A33', paper: '#FFFBF3' },
  sky:    { accent: '#5AA9FF', soft: '#DFF0FF', ink: '#1A3A6E', paper: '#FFFBF3' },
  yellow: { accent: '#FFC43C', soft: '#FFF0B0', ink: '#7A5900', paper: '#FFFBF3' },
  orange: { accent: '#FF7E4C', soft: '#FFE2CE', ink: '#6B2A05', paper: '#FFFBF3' },
  dark:   { accent: '#FFD43C', soft: '#2a1f4c', ink: '#FFFBF3', paper: '#15141b' },
}

// ─── Блоки ───────────────────────────────────────────────────
let installed = false
export function installHtmlBlocks() {
  if (installed) return
  installed = true

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ek_site_page',
      message0: '📄 моя страница · тема %1 %2 %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'THEME',
          options: [
            ['🟣 фиалка', 'violet'],
            ['🟢 мята',   'mint'],
            ['🌸 зефир',  'pink'],
            ['🟦 небо',   'sky'],
            ['🟡 солнце', 'yellow'],
            ['🟠 лиса',   'orange'],
            ['🌑 ночь',   'dark'],
          ],
        },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'SECTIONS' },
      ],
      colour: C_PAGE,
      tooltip: 'Корневой блок — вся страница внутри него',
      helpUrl: '',
    },
    // ── Секции ──
    {
      type: 'ek_site_hero',
      message0: '✨ шапка\nзаголовок %1\nподзаголовок %2',
      args0: [
        { type: 'field_input', name: 'TITLE', text: 'Привет, мир!' },
        { type: 'field_input', name: 'SUBTITLE', text: 'Это моя страница' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_SECTION,
      tooltip: 'Большая цветная шапка наверху',
    },
    {
      type: 'ek_site_heading',
      message0: '🔤 заголовок %1 размер %2',
      args0: [
        { type: 'field_input', name: 'TEXT', text: 'О чём эта страница' },
        {
          type: 'field_dropdown',
          name: 'SIZE',
          options: [
            ['большой', 'h2'],
            ['средний', 'h3'],
            ['мелкий',  'h4'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_SECTION,
      tooltip: 'Заголовок — выделяет тему параграфа',
    },
    {
      type: 'ek_site_paragraph',
      message0: '📝 абзац %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: 'Здесь мой текст.' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_SECTION,
      tooltip: 'Обычный текстовый абзац',
    },
    {
      type: 'ek_site_list',
      message0: '📋 список %1 пунктов через | %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'field_input', name: 'ITEMS', text: 'Первое | Второе | Третье' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_SECTION,
      tooltip: 'Маркированный список — каждый пункт отделяй |',
    },
    // ── Медиа ──
    {
      type: 'ek_site_image',
      message0: '🖼 картинка URL %1 подпись %2',
      args0: [
        { type: 'field_input', name: 'URL', text: 'https://picsum.photos/600/400' },
        { type: 'field_input', name: 'ALT', text: 'моя картинка' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_MEDIA,
      tooltip: 'Вставь картинку по ссылке (URL)',
    },
    {
      type: 'ek_site_gallery',
      message0: '🎨 галерея %1 URL через | %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'field_input', name: 'URLS', text: 'https://picsum.photos/300/300?1 | https://picsum.photos/300/300?2 | https://picsum.photos/300/300?3' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_MEDIA,
      tooltip: 'Сетка картинок — разделяй URL символом |',
    },
    {
      type: 'ek_site_video',
      message0: '🎬 YouTube видео %1',
      args0: [{ type: 'field_input', name: 'URL', text: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_MEDIA,
      tooltip: 'Вставь ссылку на YouTube — встроится плеер',
    },
    // ── Ссылки / действия ──
    {
      type: 'ek_site_link_button',
      message0: '🔗 кнопка-ссылка %1 → %2',
      args0: [
        { type: 'field_input', name: 'TEXT', text: 'Открыть' },
        { type: 'field_input', name: 'URL', text: 'https://eduson.tv' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_LINK,
      tooltip: 'Цветная кнопка, ведёт по ссылке',
    },
    {
      type: 'ek_site_card',
      message0: '🪪 карточка\nзаголовок %1\nтекст %2\nссылка %3',
      args0: [
        { type: 'field_input', name: 'TITLE', text: 'Мой проект' },
        { type: 'field_input', name: 'TEXT', text: 'Короткое описание' },
        { type: 'field_input', name: 'URL', text: '' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_LINK,
      tooltip: 'Карточка с заголовком, текстом и (опционально) ссылкой',
    },
    // ── Оформление ──
    {
      type: 'ek_site_divider',
      message0: '━ разделитель',
      previousStatement: null,
      nextStatement: null,
      colour: C_STYLE,
      tooltip: 'Тонкая линия между секциями',
    },
    {
      type: 'ek_site_spacer',
      message0: '↕ пробел %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'SIZE',
          options: [
            ['маленький', '16'],
            ['средний',   '40'],
            ['большой',   '80'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_STYLE,
      tooltip: 'Вертикальный отступ',
    },
    {
      type: 'ek_site_footer',
      message0: '📎 подпись внизу %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: '© Моя страница, 2026' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_STYLE,
      tooltip: 'Финальная подпись-копирайт',
    },
  ])
}

// ─── Генератор HTML+CSS ─────────────────────────────────────
export const htmlGenerator = new Blockly.CodeGenerator('EK_HTML')

// Scrub: stitch sibling blocks with newline
;(htmlGenerator as unknown as { scrub_: (b: Blockly.Block, c: string, t?: boolean) => string }).scrub_ = function (
  block,
  code,
  thisOnly
) {
  const next = block.getNextBlock()
  if (next && !thisOnly) {
    const nextCode = htmlGenerator.blockToCode(next)
    return code + '\n' + nextCode
  }
  return code
}

const FB = (htmlGenerator as unknown as { forBlock: Record<string, GenFn> }).forBlock

FB['ek_site_page'] = (block) => {
  // Страница — корневой блок. Тема определяет CSS.
  const theme = block.getFieldValue('THEME') || 'violet'
  const body = htmlGenerator.statementToCode(block, 'SECTIONS')
  cssBucket.set('__theme', theme)
  return `<main class="site" data-theme="${esc(theme)}">\n${indent(body, 2)}\n</main>`
}

FB['ek_site_hero'] = (block) => {
  const title = esc(block.getFieldValue('TITLE') || '')
  const sub = esc(block.getFieldValue('SUBTITLE') || '')
  return `<section class="hero">\n  <h1>${title}</h1>\n  <p>${sub}</p>\n</section>`
}

FB['ek_site_heading'] = (block) => {
  const text = esc(block.getFieldValue('TEXT') || '')
  const tag = block.getFieldValue('SIZE') || 'h2'
  return `<${tag} class="heading">${text}</${tag}>`
}

FB['ek_site_paragraph'] = (block) => {
  const text = esc(block.getFieldValue('TEXT') || '')
  return `<p class="p">${text}</p>`
}

FB['ek_site_list'] = (block) => {
  const raw = block.getFieldValue('ITEMS') || ''
  const items = raw.split('|').map((s: string) => s.trim()).filter(Boolean)
  const li = items.map((i: string) => `    <li>${esc(i)}</li>`).join('\n')
  return `<ul class="list">\n${li}\n  </ul>`
}

FB['ek_site_image'] = (block) => {
  const url = esc(block.getFieldValue('URL') || '')
  const alt = esc(block.getFieldValue('ALT') || '')
  return `<figure class="img"><img src="${url}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`
}

FB['ek_site_gallery'] = (block) => {
  const raw = block.getFieldValue('URLS') || ''
  const urls = raw.split('|').map((s: string) => s.trim()).filter(Boolean)
  const cells = urls
    .map(
      (u: string) => `    <img src="${esc(u)}" alt="фото" loading="lazy">`
    )
    .join('\n')
  return `<div class="gallery">\n${cells}\n  </div>`
}

FB['ek_site_video'] = (block) => {
  const url = block.getFieldValue('URL') || ''
  const id = extractYouTubeId(url)
  if (!id) return `<!-- невалидная YouTube-ссылка -->`
  return `<div class="video"><iframe src="https://www.youtube.com/embed/${esc(id)}" title="YouTube" frameborder="0" allowfullscreen></iframe></div>`
}

FB['ek_site_link_button'] = (block) => {
  const text = esc(block.getFieldValue('TEXT') || '')
  const url = esc(block.getFieldValue('URL') || '#')
  return `<a class="btn" href="${url}" target="_blank" rel="noopener">${text}</a>`
}

FB['ek_site_card'] = (block) => {
  const title = esc(block.getFieldValue('TITLE') || '')
  const text = esc(block.getFieldValue('TEXT') || '')
  const url = block.getFieldValue('URL') || ''
  const linkHtml = url
    ? `<a class="card-link" href="${esc(url)}" target="_blank" rel="noopener">Открыть →</a>`
    : ''
  return `<article class="card">\n  <h3>${title}</h3>\n  <p>${text}</p>\n  ${linkHtml}\n</article>`
}

FB['ek_site_divider'] = () => `<hr class="divider">`

FB['ek_site_spacer'] = (block) => {
  const size = block.getFieldValue('SIZE') || '40'
  return `<div class="spacer" style="height:${esc(size)}px"></div>`
}

FB['ek_site_footer'] = (block) => {
  const text = esc(block.getFieldValue('TEXT') || '')
  return `<footer class="footer">${text}</footer>`
}

// ─── Базовый CSS, построенный из темы ───
export function buildSiteCss(theme: keyof typeof THEME_CSS = 'violet'): string {
  const t = (THEME_CSS[theme] ?? THEME_CSS.violet)!
  return `:root {
  --accent: ${t.accent};
  --accent-soft: ${t.soft};
  --ink: ${t.ink};
  --paper: ${t.paper};
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Nunito', system-ui, -apple-system, sans-serif;
  background: var(--paper);
  color: ${t.paper === '#15141b' ? '#ffffff' : '#15141b'};
  line-height: 1.55;
}
.site {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px;
}
.hero {
  text-align: center;
  padding: 56px 20px;
  background: linear-gradient(135deg, var(--accent-soft), var(--accent));
  border-radius: 24px;
  color: var(--ink);
  margin-bottom: 24px;
}
.hero h1 { margin: 0 0 12px; font-size: 40px; }
.hero p  { margin: 0; font-size: 18px; opacity: 0.85; }
.heading { color: var(--ink); margin-top: 24px; margin-bottom: 8px; }
.p { margin: 0 0 16px; }
.list { background: #ffffff; padding: 18px 22px 18px 40px; border-radius: 16px; box-shadow: 0 4px 14px rgba(21,20,27,.05); }
.list li { padding: 4px 0; }
.img { margin: 0 0 20px; }
.img img { width: 100%; height: auto; border-radius: 16px; display: block; }
.img figcaption { color: var(--ink); opacity: .7; font-size: 13px; margin-top: 6px; text-align: center; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; }
.gallery img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; }
.video { margin-bottom: 20px; border-radius: 16px; overflow: hidden; aspect-ratio: 16/9; }
.video iframe { width: 100%; height: 100%; border: 0; }
.btn {
  display: inline-block;
  padding: 12px 24px;
  background: var(--accent);
  color: ${t.paper === '#15141b' ? t.paper : '#ffffff'};
  text-decoration: none;
  font-weight: 700;
  border-radius: 999px;
  margin-bottom: 16px;
  transition: transform .15s;
}
.btn:hover { transform: scale(1.04); }
.card {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(21,20,27,.06);
  margin-bottom: 16px;
}
.card h3 { margin: 0 0 8px; color: var(--ink); }
.card-link { color: var(--accent); font-weight: 700; text-decoration: none; }
.divider { border: 0; border-top: 2px dashed var(--accent-soft); margin: 24px 0; }
.footer { text-align: center; color: var(--ink); opacity: .6; font-size: 13px; padding: 24px 16px; }
@media (max-width: 520px) {
  .hero { padding: 32px 16px; }
  .hero h1 { font-size: 28px; }
}
`
}

// ─── Публичная функция: сгенерировать {html, css, theme} из workspace ───
export function generateSiteCode(ws: Blockly.WorkspaceSvg): { html: string; css: string; theme: string } {
  cssBucket.clear()
  const html = htmlGenerator.workspaceToCode(ws)
  const theme = (cssBucket.get('__theme') ?? 'violet') as keyof typeof THEME_CSS
  const css = buildSiteCss(theme)
  return { html, css, theme }
}

// ─── Toolbox ─────────────────────────────────────────────────
export const SITE_TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '📄 Страница',
      colour: C_PAGE,
      contents: [{ kind: 'block', type: 'ek_site_page' }],
    },
    {
      kind: 'category',
      name: '✨ Секции',
      colour: C_SECTION,
      contents: [
        { kind: 'block', type: 'ek_site_hero' },
        { kind: 'block', type: 'ek_site_heading' },
        { kind: 'block', type: 'ek_site_paragraph' },
        { kind: 'block', type: 'ek_site_list' },
      ],
    },
    {
      kind: 'category',
      name: '🖼 Медиа',
      colour: C_MEDIA,
      contents: [
        { kind: 'block', type: 'ek_site_image' },
        { kind: 'block', type: 'ek_site_gallery' },
        { kind: 'block', type: 'ek_site_video' },
      ],
    },
    {
      kind: 'category',
      name: '🔗 Ссылки',
      colour: C_LINK,
      contents: [
        { kind: 'block', type: 'ek_site_link_button' },
        { kind: 'block', type: 'ek_site_card' },
      ],
    },
    {
      kind: 'category',
      name: '🎨 Оформление',
      colour: C_STYLE,
      contents: [
        { kind: 'block', type: 'ek_site_divider' },
        { kind: 'block', type: 'ek_site_spacer' },
        { kind: 'block', type: 'ek_site_footer' },
      ],
    },
  ],
}

// ─── Helpers ─────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  const m1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (m1) return m1[1] ?? null
  const m2 = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
  if (m2) return m2[1] ?? null
  return null
}

export const SITE_STARTER_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_site_page" x="40" y="40">
    <field name="THEME">violet</field>
    <statement name="SECTIONS">
      <block type="ek_site_hero">
        <field name="TITLE">Привет! Я Никита</field>
        <field name="SUBTITLE">Люблю роботов, код и Лего</field>
      </block>
    </statement>
  </block>
</xml>`
