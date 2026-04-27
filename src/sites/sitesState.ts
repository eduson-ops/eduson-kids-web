// Стор треков «Сайты». Простое event-emitter хранилище в localStorage.
import { nanoid } from 'nanoid'

/**
 * Блочная система сайта. Задумывалась как «презентация, которую можно
 * отправить другу ссылкой»: много мелких блоков с кастомизацией,
 * вставкой ссылок, картинок, видео и т.д. Идея — чтобы ребёнок собирал
 * страницу из кирпичиков так же легко, как в Tilda/Notion, но в своей
 * терминологии и с простыми контролами.
 */
export type SectionType =
  // «Базовые» (существующие)
  | 'hero'
  | 'about'
  | 'gallery'
  | 'skills'
  | 'cta'
  | 'footer'
  // Текст
  | 'heading'
  | 'paragraph'
  | 'quote'
  // Макет
  | 'divider'
  | 'spacer'
  | 'banner'
  | 'two-column'
  // Медиа
  | 'image'
  | 'image-row'
  | 'video'
  // Интерактив
  | 'button'
  | 'link-cards'
  | 'social'
  // Данные
  | 'stats'
  | 'timeline'
  | 'faq'

export type ThemeKey = 'violet' | 'mint' | 'pink' | 'sky' | 'yellow' | 'orange'

export interface Section {
  id: string
  type: SectionType
  /** свободный JSON: title/subtitle/items/buttonText и т.д. */
  data: Record<string, unknown>
}

export type SiteMode = 'template' | 'blocks' | 'code'

export interface Site {
  id: string
  name: string
  theme: ThemeKey
  mode: SiteMode
  sections: Section[]
  /** HTML код руками (если пользователь перешёл в L2) */
  html: string
  /** CSS код руками */
  css: string
  /** XML-сериализация блочного редактора сайта */
  blocksXml?: string
  /** обновлено */
  updated: number
}

export const THEMES: Record<ThemeKey, { name: string; color: string; soft: string; ink: string }> = {
  violet: { name: 'Фиалка',   color: '#6B5CE7', soft: '#E4E0FC', ink: '#2A1F8C' },
  mint:   { name: 'Мята',     color: '#34C38A', soft: '#D8F5E7', ink: '#0C4E2E' },
  pink:   { name: 'Зефир',    color: '#FF8CAE', soft: '#FFE4EC', ink: '#6A1A33' },
  sky:    { name: 'Небо',     color: '#5AA9FF', soft: '#DFF0FF', ink: '#1A3A6E' },
  yellow: { name: 'Солнце',   color: '#FFC43C', soft: '#FFF0B0', ink: '#7A5900' },
  orange: { name: 'Лиса',     color: '#FF7E4C', soft: '#FFE2CE', ink: '#6B2A05' },
}

/* ─────────── Каталог блоков (для меню «+ Добавить блок») ─────────── */

export interface BlockSpec {
  type: SectionType
  emoji: string
  label: string
  hint: string
  category: 'base' | 'text' | 'layout' | 'media' | 'action' | 'data'
  make: () => Section
}

const newId = () => nanoid(6)

export const BLOCK_CATALOG: BlockSpec[] = [
  /* base */
  { type: 'hero', emoji: '✨', label: 'Шапка', hint: 'Большой заголовок — вверху страницы.', category: 'base',
    make: () => ({ id: newId(), type: 'hero', data: { title: 'Привет!', subtitle: 'Это моя страничка.' } }) },
  { type: 'about', emoji: '👤', label: 'Обо мне', hint: 'Короткий блок с рассказом о себе.', category: 'base',
    make: () => ({ id: newId(), type: 'about', data: { text: 'Мне 10 лет, я учусь собирать игры.' } }) },
  { type: 'skills', emoji: '🎯', label: 'Список-пункты', hint: 'Маркированный список умений/задач.', category: 'base',
    make: () => ({ id: newId(), type: 'skills', data: { title: 'Что я умею', items: ['Писать код', 'Рисовать', 'Петь'] } }) },
  { type: 'footer', emoji: '📎', label: 'Подпись снизу', hint: 'Финальная подпись страницы.', category: 'base',
    make: () => ({ id: newId(), type: 'footer', data: { text: '© 2026' } }) },

  /* text */
  { type: 'heading', emoji: '🔠', label: 'Заголовок', hint: 'Крупный подпись-секция, выбери H2/H3.', category: 'text',
    make: () => ({ id: newId(), type: 'heading', data: { text: 'Новый раздел', level: 'h2', align: 'left' } }) },
  { type: 'paragraph', emoji: '📝', label: 'Абзац', hint: 'Просто текст — расскажи что угодно.', category: 'text',
    make: () => ({ id: newId(), type: 'paragraph', data: { text: 'Пиши здесь длинный текст. Можно несколько абзацев через пустую строку.', align: 'left' } }) },
  { type: 'quote', emoji: '💬', label: 'Цитата', hint: 'Выделить важную мысль с автором.', category: 'text',
    make: () => ({ id: newId(), type: 'quote', data: { text: 'Программирование — это искусство.', author: 'Дональд Кнут' } }) },

  /* layout */
  { type: 'divider', emoji: '➖', label: 'Разделитель', hint: 'Тонкая линия между разделами.', category: 'layout',
    make: () => ({ id: newId(), type: 'divider', data: { style: 'line' } }) },
  { type: 'spacer', emoji: '⬜', label: 'Отступ', hint: 'Пустое место между блоками.', category: 'layout',
    make: () => ({ id: newId(), type: 'spacer', data: { size: 'md' } }) },
  { type: 'banner', emoji: '🏳️', label: 'Баннер-плашка', hint: 'Яркая полоса с эмодзи и короткой фразой.', category: 'layout',
    make: () => ({ id: newId(), type: 'banner', data: { emoji: '🔥', text: 'Горячая новость!', color: 'accent' } }) },
  { type: 'two-column', emoji: '🪟', label: '2 колонки (фото + текст)', hint: 'Картинка слева или справа, рядом текст.', category: 'layout',
    make: () => ({ id: newId(), type: 'two-column', data: {
      imageUrl: 'https://images.unsplash.com/photo-1526178613658-3f1622045557?w=600',
      title: 'Моя история',
      text: 'Расскажи об интересном проекте или эпизоде из жизни.',
      imageSide: 'left',
    } }) },

  /* media */
  { type: 'gallery', emoji: '🎨', label: 'Галерея-сетка', hint: 'Квадратики с эмодзи — подойдёт для коллекции.', category: 'media',
    make: () => ({ id: newId(), type: 'gallery', data: { title: 'Моя коллекция', items: ['🎮', '🎨', '🚀', '🤖'] } }) },
  { type: 'image', emoji: '🖼️', label: 'Картинка', hint: 'Одна картинка по ссылке, с подписью.', category: 'media',
    make: () => ({ id: newId(), type: 'image', data: {
      src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900',
      alt: 'Звёздное небо',
      caption: 'Красивая космическая картинка',
      width: 'full',
      linkHref: '',
    } }) },
  { type: 'image-row', emoji: '🖼️🖼️', label: 'Ряд картинок', hint: '2–4 картинки рядом — мини-коллаж.', category: 'media',
    make: () => ({ id: newId(), type: 'image-row', data: {
      items: [
        { src: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', alt: 'Геймпад' },
        { src: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400', alt: 'Лаборатория' },
        { src: 'https://images.unsplash.com/photo-1526178613658-3f1622045557?w=400', alt: 'Клавиатура' },
      ],
    } }) },
  { type: 'video', emoji: '🎬', label: 'Видео YouTube', hint: 'Вставь ссылку на YouTube/Vimeo — плеер появится.', category: 'media',
    make: () => ({ id: newId(), type: 'video', data: { url: 'https://www.youtube.com/watch?v=aircAruvnKk', caption: '' } }) },

  /* action */
  { type: 'cta', emoji: '🚀', label: 'Призыв к действию', hint: 'Большой блок с яркой кнопкой.', category: 'action',
    make: () => ({ id: newId(), type: 'cta', data: { title: 'Поиграй со мной!', buttonText: 'Начать', buttonHref: '#' } }) },
  { type: 'button', emoji: '🔘', label: 'Кнопка-ссылка', hint: 'Одинокая кнопка с ссылкой (наружу или вниз).', category: 'action',
    make: () => ({ id: newId(), type: 'button', data: { text: 'Перейти', href: 'https://example.com', variant: 'solid', align: 'center' } }) },
  { type: 'link-cards', emoji: '🔗', label: 'Карточки со ссылками', hint: 'Сетка карточек — эмодзи, название, ссылка.', category: 'action',
    make: () => ({ id: newId(), type: 'link-cards', data: {
      title: 'Мои любимые штуки',
      items: [
        { emoji: '🎮', title: 'Моя игра', desc: 'Играй прямо сейчас', href: '#' },
        { emoji: '🎨', title: 'Мои рисунки', desc: 'Смотреть галерею', href: '#' },
        { emoji: '📓', title: 'Блог', desc: 'Читать последний пост', href: '#' },
      ],
    } }) },
  { type: 'social', emoji: '🌐', label: 'Соцсети (иконки)', hint: 'Строка иконок ВК/Telegram/YouTube и т.д.', category: 'action',
    make: () => ({ id: newId(), type: 'social', data: {
      items: [
        { kind: 'tg', href: 'https://t.me/' },
        { kind: 'vk', href: 'https://vk.com/' },
        { kind: 'yt', href: 'https://youtube.com/' },
      ],
    } }) },

  /* data */
  { type: 'stats', emoji: '📊', label: '3 больших числа', hint: 'Статистика: "100+ проектов / 7 лет / ...".', category: 'data',
    make: () => ({ id: newId(), type: 'stats', data: {
      items: [
        { value: '12', label: 'проектов' },
        { value: '48', label: 'уроков' },
        { value: '7★', label: 'рейтинг' },
      ],
    } }) },
  { type: 'timeline', emoji: '📅', label: 'Таймлайн', hint: 'История: дата — событие, строкой вниз.', category: 'data',
    make: () => ({ id: newId(), type: 'timeline', data: {
      items: [
        { date: '2025', title: 'Начал учиться', desc: 'Первые блоки и первая игра.' },
        { date: '2026', title: 'Сделал свой сайт', desc: 'Вот этот самый сайт!' },
      ],
    } }) },
  { type: 'faq', emoji: '❓', label: 'FAQ — вопросы/ответы', hint: 'Раскрывающиеся вопросы.', category: 'data',
    make: () => ({ id: newId(), type: 'faq', data: {
      items: [
        { q: 'Сколько тебе лет?', a: 'Мне 10, скоро 11!' },
        { q: 'На чём ты программируешь?', a: 'На Эдюсон Kids в блоках и понемногу на Python.' },
      ],
    } }) },
]

export function findBlockSpec(type: SectionType): BlockSpec | undefined {
  return BLOCK_CATALOG.find((b) => b.type === type)
}

export interface SiteTemplate {
  id: string
  title: string
  emoji: string
  description: string
  theme: ThemeKey
  build: () => Section[]
}

export const TEMPLATES: SiteTemplate[] = [
  {
    id: 'about-me',
    title: 'Обо мне',
    emoji: '🙋',
    description: 'Представь себя миру: имя, хобби, что любишь.',
    theme: 'violet',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Привет! Я Никита', subtitle: 'Люблю играть, рисовать и учиться.' } },
      { id: newId(), type: 'about', data: { text: 'Мне 10 лет. Я учусь в 4-м классе и обожаю роботов.' } },
      { id: newId(), type: 'skills', data: { title: 'Что я умею', items: ['Собирать Лего', 'Рисовать комиксы', 'Программировать в Эдюсон Kids'] } },
      { id: newId(), type: 'social', data: { items: [
        { kind: 'tg', href: 'https://t.me/' },
        { kind: 'vk', href: 'https://vk.com/' },
      ] } },
      { id: newId(), type: 'footer', data: { text: 'Сделано в Эдюсон Kids 🧱' } },
    ],
  },
  {
    id: 'portfolio',
    title: 'Моё портфолио',
    emoji: '🎨',
    description: 'Покажи свои работы: игры, рисунки, проекты.',
    theme: 'pink',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Мои работы', subtitle: 'Собрал за этот год' } },
      { id: newId(), type: 'stats', data: { items: [
        { value: '12', label: 'проектов' },
        { value: '48', label: 'уроков' },
        { value: '7★', label: 'рейтинг' },
      ] } },
      { id: newId(), type: 'gallery', data: { title: 'Мини-галерея', items: ['🎮', '🎨', '🚀', '🤖', '🏰', '🦄'] } },
      { id: newId(), type: 'link-cards', data: { title: 'Смотреть вживую', items: [
        { emoji: '🎮', title: 'Моя игра', desc: 'Платформер с кодом на Python', href: '#' },
        { emoji: '🌐', title: 'Мой сайт', desc: 'Он тебя и встречает прямо сейчас', href: '#' },
        { emoji: '🎨', title: 'Мой 3D-аватар', desc: 'Собрал в Эдюсон Kids-редакторе', href: '#' },
      ] } },
      { id: newId(), type: 'cta', data: { title: 'Хочешь попробовать?', buttonText: 'Начать', buttonHref: '#' } },
      { id: newId(), type: 'footer', data: { text: '© 2026' } },
    ],
  },
  {
    id: 'blog',
    title: 'Мой блог',
    emoji: '📓',
    description: 'Страничка с дневником: что нового, что изучил.',
    theme: 'mint',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Дневник юного программиста', subtitle: 'Что я сделал сегодня' } },
      { id: newId(), type: 'heading', data: { text: 'Апдейт недели', level: 'h2', align: 'left' } },
      { id: newId(), type: 'paragraph', data: { text: 'Сегодня я построил свой первый 3D-мир в Эдюсон Kids и добавил туда летающего дракона. Дракон ещё не понимает команды, но уже очень красиво машет крыльями.', align: 'left' } },
      { id: newId(), type: 'quote', data: { text: 'Ошибка — это не провал, а ещё одна подсказка.', author: 'моя учительница' } },
      { id: newId(), type: 'timeline', data: { items: [
        { date: 'Пн', title: 'Начал проект', desc: 'Собрал карту и персонажа.' },
        { date: 'Ср', title: 'Добавил врагов', desc: 'Теперь они ходят туда-сюда.' },
        { date: 'Пт', title: 'Первая версия', desc: 'Прошёл уровень до конца!' },
      ] } },
      { id: newId(), type: 'footer', data: { text: '~ продолжение следует' } },
    ],
  },
  {
    id: 'fan-page',
    title: 'Фан-страница',
    emoji: '🌟',
    description: 'Страница в честь любимой игры, мультика или героя.',
    theme: 'sky',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Мир любимой игры', subtitle: 'Всё, что я про неё знаю' } },
      { id: newId(), type: 'two-column', data: {
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
        title: 'Почему мне нравится',
        text: 'Потому что тут можно строить свои миры, а не только играть по готовым правилам.',
        imageSide: 'left',
      } },
      { id: newId(), type: 'image-row', data: { items: [
        { src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', alt: 'Скрин 1' },
        { src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', alt: 'Скрин 2' },
        { src: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400', alt: 'Скрин 3' },
      ] } },
      { id: newId(), type: 'faq', data: { items: [
        { q: 'Сколько часов ты уже играешь?', a: 'Примерно 40.' },
        { q: 'Есть любимая карта?', a: 'Да, та что с озером — там красивые закаты.' },
      ] } },
      { id: newId(), type: 'footer', data: { text: '© фанатская страничка' } },
    ],
  },
  {
    id: 'presentation',
    title: 'Презентация-сайт',
    emoji: '🖼️',
    description: 'Как слайды, но можно листать в браузере — идеально для рассказа.',
    theme: 'orange',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Моя презентация', subtitle: 'Листай вниз — как слайды' } },
      { id: newId(), type: 'heading', data: { text: 'Что я хочу рассказать', level: 'h2', align: 'center' } },
      { id: newId(), type: 'paragraph', data: { text: 'Короткое введение — о чём следующие блоки.', align: 'center' } },
      { id: newId(), type: 'divider', data: { style: 'line' } },
      { id: newId(), type: 'banner', data: { emoji: '💡', text: 'Главная идея — в одну строку.', color: 'accent' } },
      { id: newId(), type: 'two-column', data: {
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
        title: 'Почему это важно',
        text: 'Пару предложений, которые объясняют суть. Идеально для рассказа учителю или семье.',
        imageSide: 'right',
      } },
      { id: newId(), type: 'stats', data: { items: [
        { value: '3', label: 'причины' },
        { value: '1', label: 'вывод' },
        { value: '∞', label: 'возможностей' },
      ] } },
      { id: newId(), type: 'cta', data: { title: 'Что дальше?', buttonText: 'Связаться со мной', buttonHref: 'mailto:me@example.com' } },
      { id: newId(), type: 'footer', data: { text: 'Спасибо за просмотр!' } },
    ],
  },
  {
    id: 'hello',
    title: 'Привет, мир!',
    emoji: '👋',
    description: 'Самая простая страничка. Отличный старт.',
    theme: 'yellow',
    build: () => [
      { id: newId(), type: 'hero', data: { title: 'Привет, мир!', subtitle: 'Это моя первая веб-страница.' } },
      { id: newId(), type: 'footer', data: { text: 'Сделано в Эдюсон Kids' } },
    ],
  },
]

export const SITES_KEY = 'ek_sites_v1'
const STORAGE_KEY = SITES_KEY

function defaultSite(templateId = 'about-me'): Site {
  const tpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]
  return {
    id: nanoid(8),
    name: tpl.title,
    theme: tpl.theme,
    mode: 'template',
    sections: tpl.build(),
    html: '',
    css: '',
    updated: Date.now(),
  }
}

interface SitesState {
  sites: Site[]
  currentId: string | null
}

const listeners = new Set<(s: SitesState) => void>()

function loadState(): SitesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SitesState
      if (Array.isArray(parsed.sites)) return parsed
    }
  } catch {
    /* ignore */
  }
  return { sites: [], currentId: null }
}

let state: SitesState = loadState()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota */
  }
}

function emit() {
  for (const l of listeners) l(state)
}

export function subscribeSites(l: (s: SitesState) => void): () => void {
  listeners.add(l)
  l(state)
  return () => { listeners.delete(l) }
}

export function getSitesState(): SitesState {
  return state
}

export function getSite(id: string): Site | undefined {
  return state.sites.find((s) => s.id === id)
}

export function createSiteFromTemplate(templateId: string): Site {
  const site = defaultSite(templateId)
  state = { sites: [site, ...state.sites], currentId: site.id }
  persist()
  emit()
  return site
}

export function updateSite(id: string, patch: Partial<Site>) {
  state = {
    ...state,
    sites: state.sites.map((s) => (s.id === id ? { ...s, ...patch, updated: Date.now() } : s)),
  }
  persist()
  emit()
}

export function deleteSite(id: string) {
  state = {
    ...state,
    sites: state.sites.filter((s) => s.id !== id),
    currentId: state.currentId === id ? null : state.currentId,
  }
  persist()
  emit()
}

/**
 * Сгенерировать HTML + CSS из текущих секций. Используется при переходе L1 → L2.
 */
export function compileSite(site: Site): { html: string; css: string } {
  const theme = THEMES[site.theme]
  const body = site.sections.map(renderSection).join('\n')
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(site.name)}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="site">
${indent(body, 4)}
  </main>
</body>
</html>`
  const css = SITE_CSS(theme)
  return { html, css }
}

function SITE_CSS(theme: { color: string; soft: string; ink: string }): string {
  return `:root {
  --accent: ${theme.color};
  --accent-soft: ${theme.soft};
  --ink: ${theme.ink};
  --paper: #FFFBF3;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Nunito', system-ui, sans-serif;
  background: var(--paper);
  color: #15141b;
  line-height: 1.55;
}
.site {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px;
}
.site > * + * { margin-top: 16px; }

/* ── Hero ── */
.hero {
  text-align: center;
  padding: 56px 24px;
  background: linear-gradient(135deg, var(--accent-soft), var(--accent));
  border-radius: 24px;
  color: var(--ink);
}
.hero h1 { margin: 0 0 12px; font-size: 40px; line-height: 1.15; }
.hero p  { margin: 0; font-size: 18px; opacity: 0.85; }

/* ── About ── */
.about {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.about p { margin: 0; font-size: 16px; }

/* ── Heading / Paragraph / Quote ── */
.block-heading h2 { margin: 24px 0 8px; font-size: 28px; color: var(--ink); }
.block-heading h3 { margin: 20px 0 6px; font-size: 22px; color: var(--ink); }
.block-heading.align-center { text-align: center; }
.block-heading.align-right  { text-align: right; }

.block-paragraph { font-size: 16px; }
.block-paragraph.align-center { text-align: center; }
.block-paragraph.align-right  { text-align: right; }
.block-paragraph p { margin: 0 0 8px; }

.block-quote {
  border-left: 4px solid var(--accent);
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 0 12px 12px 0;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}
.block-quote p { margin: 0 0 8px; font-size: 18px; font-style: italic; color: var(--ink); }
.block-quote cite { font-size: 14px; color: rgba(21,20,27,0.6); font-style: normal; }

/* ── Divider / Spacer / Banner ── */
.block-divider { border: 0; border-top: 2px solid rgba(21,20,27,0.1); margin: 24px 0; }
.block-divider.style-dashed { border-top-style: dashed; }
.block-divider.style-dots   { border-top-style: dotted; }

.block-spacer.size-sm { height: 16px; }
.block-spacer.size-md { height: 32px; }
.block-spacer.size-lg { height: 64px; }

.block-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
}
.block-banner .banner-emoji { font-size: 28px; flex-shrink: 0; }
.block-banner.color-accent  { background: var(--accent-soft); color: var(--ink); }
.block-banner.color-success { background: #E0F5E7; color: #0B5A2A; }
.block-banner.color-warn    { background: #FFEBC9; color: #6B3F00; }

/* ── Two column ── */
.block-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: center;
  background: #ffffff;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.block-two-column.image-right .two-col-image { order: 2; }
.block-two-column .two-col-image img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.block-two-column h3 { margin: 0 0 10px; color: var(--ink); font-size: 22px; }
.block-two-column p { margin: 0; font-size: 15.5px; }

/* ── Image / Image row / Video ── */
.block-image { text-align: center; }
.block-image img {
  max-width: 100%;
  border-radius: 14px;
  display: inline-block;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.block-image.width-md img { max-width: 480px; width: 100%; }
.block-image.width-sm img { max-width: 280px; width: 100%; }
.block-image figcaption { margin-top: 8px; color: rgba(21,20,27,0.6); font-size: 14px; }

.block-image-row {
  display: grid;
  gap: 10px;
}
.block-image-row.count-2 { grid-template-columns: 1fr 1fr; }
.block-image-row.count-3 { grid-template-columns: 1fr 1fr 1fr; }
.block-image-row.count-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.block-image-row img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.block-video {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.block-video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.block-video + figcaption { margin-top: 8px; color: rgba(21,20,27,0.6); font-size: 14px; text-align: center; }

/* ── Skills / Gallery / CTA / Button / Link cards / Social ── */
.skills {
  background: var(--accent-soft);
  padding: 24px;
  border-radius: 16px;
}
.skills h2 { margin: 0 0 12px; color: var(--ink); }
.skills ul { margin: 0; padding-left: 20px; }
.skills li { padding: 4px 0; }

.gallery h2 { margin: 0 0 12px; color: var(--ink); }
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}
.gallery-item {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  transition: transform 0.15s;
}
.gallery-item:hover { transform: translateY(-4px); }

.cta {
  text-align: center;
  padding: 36px 20px;
  background: var(--accent);
  border-radius: 20px;
  color: #ffffff;
}
.cta h2 { margin: 0 0 16px; color: #ffffff; }
.cta a {
  display: inline-block;
  padding: 12px 28px;
  background: #ffffff;
  color: var(--ink);
  text-decoration: none;
  font-weight: 700;
  border-radius: 999px;
  transition: transform 0.15s;
}
.cta a:hover { transform: scale(1.05); }

.block-button { display: flex; }
.block-button.align-left   { justify-content: flex-start; }
.block-button.align-center { justify-content: center; }
.block-button.align-right  { justify-content: flex-end; }
.block-button a {
  display: inline-block;
  padding: 12px 24px;
  font-weight: 700;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 0.15s;
}
.block-button.variant-solid a { background: var(--accent); color: #ffffff; }
.block-button.variant-ghost a { background: transparent; color: var(--accent); border: 2px solid var(--accent); }
.block-button a:hover { transform: scale(1.05); }

.block-link-cards h2 { margin: 0 0 14px; color: var(--ink); }
.link-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.link-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}
.link-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); }
.link-card-emoji { font-size: 36px; line-height: 1; flex-shrink: 0; }
.link-card-body strong { display: block; font-size: 15px; margin-bottom: 4px; color: var(--ink); }
.link-card-body span { font-size: 13px; color: rgba(21,20,27,0.6); }

.block-social {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.social-pill {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  transition: transform 0.15s;
}
.social-pill:hover { transform: scale(1.12); }

/* ── Stats / Timeline / FAQ ── */
.block-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
}
.stat-item {
  background: #ffffff;
  padding: 20px 12px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
}
.stat-item .stat-value { font-size: 32px; font-weight: 800; color: var(--accent); line-height: 1; }
.stat-item .stat-label { display: block; margin-top: 6px; font-size: 13px; color: rgba(21,20,27,0.6); }

.block-timeline { position: relative; padding-left: 28px; }
.block-timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--accent-soft);
  border-radius: 2px;
}
.timeline-item { position: relative; padding: 6px 0 14px; }
.timeline-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px #ffffff;
}
.timeline-date { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; }
.timeline-title { margin: 2px 0 4px; color: var(--ink); font-size: 16px; }
.timeline-desc { margin: 0; font-size: 14px; color: rgba(21,20,27,0.7); }

.block-faq details {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  margin-bottom: 8px;
}
.block-faq summary {
  font-weight: 700;
  cursor: pointer;
  color: var(--ink);
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.block-faq summary::after { content: '＋'; color: var(--accent); font-size: 18px; }
.block-faq details[open] summary::after { content: '−'; }
.block-faq details p { margin: 10px 0 0; color: rgba(21,20,27,0.8); font-size: 14.5px; }

/* ── Footer ── */
.footer {
  text-align: center;
  padding: 24px 16px;
  color: #6b6e78;
  font-size: 14px;
}

/* ── mobile ── */
@media (max-width: 600px) {
  .block-two-column { grid-template-columns: 1fr; }
  .block-two-column.image-right .two-col-image { order: 0; }
  .hero h1 { font-size: 30px; }
  .block-image-row.count-3,
  .block-image-row.count-4 { grid-template-columns: 1fr 1fr; }
}
`
}

function renderSection(s: Section): string {
  const d = s.data
  switch (s.type) {
    case 'hero':
      return `<section class="hero">
  <h1>${escapeHtml(str(d.title, 'Заголовок'))}</h1>
  <p>${escapeHtml(str(d.subtitle, ''))}</p>
</section>`

    case 'about':
      return `<section class="about">
  <p>${escapeMultilineHtml(str(d.text, ''))}</p>
</section>`

    case 'skills': {
      const items = Array.isArray(d.items) ? (d.items as string[]) : []
      const li = items.map((i) => `    <li>${escapeHtml(i)}</li>`).join('\n')
      return `<section class="skills">
  <h2>${escapeHtml(str(d.title, 'Навыки'))}</h2>
  <ul>
${li}
  </ul>
</section>`
    }

    case 'gallery': {
      const items = Array.isArray(d.items) ? (d.items as string[]) : []
      const cells = items.map((i) => `    <div class="gallery-item">${escapeHtml(i)}</div>`).join('\n')
      return `<section class="gallery">
  <h2>${escapeHtml(str(d.title, 'Галерея'))}</h2>
  <div class="gallery-grid">
${cells}
  </div>
</section>`
    }

    case 'cta':
      return `<section class="cta">
  <h2>${escapeHtml(str(d.title, 'Попробуй!'))}</h2>
  <a href="${safeHref(str(d.buttonHref, '#'))}">${escapeHtml(str(d.buttonText, 'Нажми'))}</a>
</section>`

    case 'footer':
      return `<footer class="footer">${escapeHtml(str(d.text, ''))}</footer>`

    case 'heading': {
      const level = str(d.level, 'h2') === 'h3' ? 'h3' : 'h2'
      const align = str(d.align, 'left')
      return `<section class="block-heading align-${align}">
  <${level}>${escapeHtml(str(d.text, 'Заголовок'))}</${level}>
</section>`
    }

    case 'paragraph': {
      const align = str(d.align, 'left')
      const text = str(d.text, '')
      const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
        .map((p) => `  <p>${escapeMultilineHtml(p)}</p>`).join('\n')
      return `<section class="block-paragraph align-${align}">
${paragraphs}
</section>`
    }

    case 'quote':
      return `<section class="block-quote">
  <p>«${escapeHtml(str(d.text, ''))}»</p>
  <cite>— ${escapeHtml(str(d.author, ''))}</cite>
</section>`

    case 'divider': {
      const style = str(d.style, 'line')
      return `<hr class="block-divider style-${style}" />`
    }

    case 'spacer': {
      const size = str(d.size, 'md')
      return `<div class="block-spacer size-${size}" aria-hidden="true"></div>`
    }

    case 'banner': {
      const color = str(d.color, 'accent')
      return `<div class="block-banner color-${color}">
  <span class="banner-emoji">${escapeHtml(str(d.emoji, '💡'))}</span>
  <span class="banner-text">${escapeHtml(str(d.text, ''))}</span>
</div>`
    }

    case 'two-column': {
      const side = str(d.imageSide, 'left')
      const img = str(d.imageUrl, '')
      return `<section class="block-two-column image-${side}">
  <div class="two-col-image"><img src="${safeHref(img)}" alt="${escapeHtml(str(d.title, ''))}" loading="lazy"/></div>
  <div class="two-col-text">
    <h3>${escapeHtml(str(d.title, ''))}</h3>
    <p>${escapeMultilineHtml(str(d.text, ''))}</p>
  </div>
</section>`
    }

    case 'image': {
      const width = str(d.width, 'full')
      const src = str(d.src, '')
      const alt = str(d.alt, '')
      const caption = str(d.caption, '')
      const link = str(d.linkHref, '')
      const img = `<img src="${safeHref(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`
      const wrapped = link ? `<a href="${safeHref(link)}">${img}</a>` : img
      const cap = caption ? `\n  <figcaption>${escapeHtml(caption)}</figcaption>` : ''
      return `<figure class="block-image width-${width}">
  ${wrapped}${cap}
</figure>`
    }

    case 'image-row': {
      const items = Array.isArray(d.items) ? (d.items as { src?: string; alt?: string }[]) : []
      const n = Math.min(Math.max(items.length, 2), 4)
      const cells = items.map((it) =>
        `    <img src="${safeHref(it.src || '')}" alt="${escapeHtml(it.alt || '')}" loading="lazy" />`
      ).join('\n')
      return `<section class="block-image-row count-${n}">
${cells}
</section>`
    }

    case 'video': {
      const url = str(d.url, '')
      const embed = toEmbedUrl(url)
      const cap = str(d.caption, '')
      const frame = embed
        ? `<iframe src="${escapeHtml(embed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#eee;color:#888">Вставь ссылку YouTube / Vimeo</div>`
      const capEl = cap ? `\n<figcaption>${escapeHtml(cap)}</figcaption>` : ''
      return `<figure class="block-video">${frame}</figure>${capEl}`
    }

    case 'button': {
      const align = str(d.align, 'center')
      const variant = str(d.variant, 'solid')
      return `<div class="block-button align-${align} variant-${variant}">
  <a href="${safeHref(str(d.href, '#'))}">${escapeHtml(str(d.text, 'Кнопка'))}</a>
</div>`
    }

    case 'link-cards': {
      const items = Array.isArray(d.items) ? (d.items as { emoji?: string; title?: string; desc?: string; href?: string }[]) : []
      const cards = items.map((it) => `    <a class="link-card" href="${safeHref(it.href || '#')}">
      <span class="link-card-emoji">${escapeHtml(it.emoji || '🔗')}</span>
      <div class="link-card-body">
        <strong>${escapeHtml(it.title || '')}</strong>
        <span>${escapeHtml(it.desc || '')}</span>
      </div>
    </a>`).join('\n')
      const title = str(d.title, '')
      const head = title ? `\n  <h2>${escapeHtml(title)}</h2>` : ''
      return `<section class="block-link-cards">${head}
  <div class="link-cards-grid">
${cards}
  </div>
</section>`
    }

    case 'social': {
      const items = Array.isArray(d.items) ? (d.items as { kind?: string; href?: string }[]) : []
      const labels: Record<string, string> = { vk: 'ВК', tg: 'TG', yt: 'YT', gh: 'GH', ig: 'IG', web: '🌐', mail: '✉' }
      const pills = items.map((it) => `  <a class="social-pill" href="${safeHref(it.href || '#')}" aria-label="${escapeHtml(it.kind || '')}">${escapeHtml(labels[it.kind || ''] || '🔗')}</a>`).join('\n')
      return `<nav class="block-social">
${pills}
</nav>`
    }

    case 'stats': {
      const items = Array.isArray(d.items) ? (d.items as { value?: string; label?: string }[]) : []
      const cells = items.map((it) => `  <div class="stat-item">
    <span class="stat-value">${escapeHtml(it.value || '')}</span>
    <span class="stat-label">${escapeHtml(it.label || '')}</span>
  </div>`).join('\n')
      return `<section class="block-stats">
${cells}
</section>`
    }

    case 'timeline': {
      const items = Array.isArray(d.items) ? (d.items as { date?: string; title?: string; desc?: string }[]) : []
      const cells = items.map((it) => `  <div class="timeline-item">
    <div class="timeline-date">${escapeHtml(it.date || '')}</div>
    <h3 class="timeline-title">${escapeHtml(it.title || '')}</h3>
    <p class="timeline-desc">${escapeHtml(it.desc || '')}</p>
  </div>`).join('\n')
      return `<section class="block-timeline">
${cells}
</section>`
    }

    case 'faq': {
      const items = Array.isArray(d.items) ? (d.items as { q?: string; a?: string }[]) : []
      const cells = items.map((it) => `  <details>
    <summary>${escapeHtml(it.q || '')}</summary>
    <p>${escapeMultilineHtml(it.a || '')}</p>
  </details>`).join('\n')
      return `<section class="block-faq">
${cells}
</section>`
    }
  }
}

/** Превратить URL YouTube/Vimeo в embed-вариант. Если не узнали — null. */
function toEmbedUrl(url: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const ytShort = url.match(/youtube\.com\/shorts\/([\w-]{11})/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  // Если уже embed-ссылка — оставляем
  if (/youtube\.com\/embed\//.test(url) || /player\.vimeo\.com\//.test(url)) return url
  return null
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** То же, что escapeHtml, но \n превращает в <br/> — для многострочных полей. */
function escapeMultilineHtml(s: string): string {
  return escapeHtml(s).replace(/\n/g, '<br/>')
}

/** Разрешаем только http(s)/mailto/tel/# — блокируем javascript: и data: URL. */
function safeHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed) return '#'
  if (/^(https?:|mailto:|tel:|#|\/)/.test(trimmed)) return escapeHtml(trimmed)
  return '#'
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n)
  return s.split('\n').map((l) => (l ? pad + l : l)).join('\n')
}
