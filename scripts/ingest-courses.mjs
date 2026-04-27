#!/usr/bin/env node
/**
 * ingest-courses.mjs — парсит 2 курса из Desktop/products/ в наш Course-формат.
 *
 * Входы (локальный путь автора):
 *   c:/Users/being/Desktop/products/Python_и_нейросети_Eduson_Kids/
 *     02_уроки/уроки_{01-12,13-24,25-36,37-48}.md   — batched lesson markdowns
 *     03_презентации/урок_{01..48}.html             — per-lesson HTML presentations
 *   c:/Users/being/Desktop/products/детский_курс_вайб_кодинг/
 *     01_step1_11-12лет/уроки/уроки_{01-12,...}.md
 *     01_step1_11-12лет/презентации/урок_{01..48}.html
 *     02_step2_13-15лет/... (аналогично)
 *
 * Выходы:
 *   src/apps/web/src/lib/courses.generated.ts  — массив INGESTED_COURSES
 *   src/apps/web/public/courses/<slug>/lesson_<NN>.html — скопированные презентации
 *
 * Запуск:
 *   node scripts/ingest-courses.mjs
 */

import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const WEB_ROOT = join(__dirname, '..')
const PUBLIC_COURSES = join(WEB_ROOT, 'public', 'courses')
const GENERATED_OUT = join(WEB_ROOT, 'src', 'lib', 'courses.generated.ts')

const PRODUCTS_ROOT = 'c:/Users/being/Desktop/products'

// ═════ Helpers ════════════════════════════════════════════════════

const pad2 = (n) => String(n).padStart(2, '0')

/** Извлечь первое непустое значение после строки с маркером (**Маркер:** value). */
function extractField(block, markerRegex) {
  const m = block.match(markerRegex)
  return m ? m[1].trim() : null
}

/** Первая секция после ### Heading, до следующего ### или ## */
function extractSection(block, headingRegex) {
  const re = new RegExp(`###\\s*(?:[🎯📚🛠️⚙️🕐💬🎨🏠✅❗🧠📝🎬🔁]+\\s*)?${headingRegex}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|\\n##\\s|$)`, 'u')
  const m = block.match(re)
  return m ? m[1].trim() : null
}

/** Все bullet items из markdown-блока: строки на "- " или "* " */
function extractBullets(text) {
  if (!text) return []
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
    .map((l) => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
}

/** Грубая heuristic для kind урока по названию/содержимому */
function guessKind(title, n, totalLessons) {
  const t = title.toLowerCase()
  if (/защит|презент|демо-день|итог/.test(t)) return 'defense'
  if (/проект|капстон|мини-проект/.test(t)) return 'project'
  if (/повтор|вспоминал/.test(t)) return 'recall'
  if (/практик/.test(t)) return 'practice'
  // Каждый 6-й — проект, каждый 12-й — защита
  if (n % 12 === 0) return 'defense'
  if (n % 6 === 0) return 'project'
  return 'concept'
}

// ═════ Lesson parser ══════════════════════════════════════════════

/**
 * Разбить batch-md (уроки_01-12.md) на отдельные блоки уроков
 * по заголовкам `## Урок № N — Title` (с вариациями тире).
 */
function splitLessonBlocks(md) {
  const lessonRe = /^##\s*Урок\s*№?\s*(\d+)\s*[—\-–]\s*(.+?)$/gm
  const blocks = []
  const matches = [...md.matchAll(lessonRe)]
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const next = matches[i + 1]
    const start = m.index + m[0].length
    const end = next ? next.index : md.length
    blocks.push({
      n: Number(m[1]),
      title: m[2].trim(),
      body: md.slice(start, end).trim(),
    })
  }
  return blocks
}

/** Парсим один блок урока → наш Lesson объект. */
function parseLesson(block, totalLessons) {
  const { n, title, body } = block
  const goal = extractSection(body, '(?:Цель занятия|Цель урока|Цель)')
  const outcomes = extractSection(body, '(?:Образовательные результаты|Результаты)')
  const miniProject = extractSection(body, '(?:Мини-проект урока|Мини-проект)')
  const homework = extractSection(body, '(?:Домашнее задание|ДЗ)')
  const vocab = extractSection(body, '(?:Словарь|Ключевые термины|Термины)')

  // Термины: вытянуть жирные **слова** из словаря или первого раздела
  const termCandidates = []
  const vocabSource = vocab || outcomes || body
  const boldRe = /\*\*([^*\n]{2,40})\*\*/g
  let bm
  while ((bm = boldRe.exec(vocabSource)) !== null) {
    const term = bm[1].trim().toLowerCase()
    if (term.length >= 3 && !termCandidates.includes(term)) termCandidates.push(term)
    if (termCandidates.length >= 4) break
  }

  // Hook — первая строка из goal, макс 140 симв.
  let hook = ''
  if (goal) {
    const firstLine = goal.split('\n')[0].replace(/^>\s*/, '').trim()
    hook = firstLine.length > 140 ? firstLine.slice(0, 137) + '...' : firstLine
  }
  if (!hook) hook = title

  // Capstone contribution — если есть "мини-проект": первая строка описания
  let capstoneContribution = ''
  if (miniProject) {
    const nameMatch = miniProject.match(/\*\*Название:\*\*\s*«?([^»\n]+)»?/)
    capstoneContribution = nameMatch ? nameMatch[1].trim() : miniProject.split('\n')[0].slice(0, 80)
  }

  return {
    n,
    localN: ((n - 1) % 6) + 1,
    moduleN: Math.ceil(n / 6),
    kind: guessKind(title, n, totalLessons),
    title,
    hook,
    terms: termCandidates.slice(0, 4),
    newBlocks: [],
    capstoneContribution,
    goal: goal || undefined,
    outcomes: outcomes || undefined,
    miniProject: miniProject || undefined,
    homework: homework || undefined,
  }
}

// ═════ Course builder ═════════════════════════════════════════════

async function readLessonsFromBatches(batchDir, ranges = ['01-12', '13-24', '25-36', '37-48']) {
  const allBlocks = []
  for (const r of ranges) {
    const file = join(batchDir, `уроки_${r}.md`)
    if (!existsSync(file)) {
      console.warn(`  ⚠ missing ${basename(file)}`)
      continue
    }
    const md = await readFile(file, 'utf-8')
    const blocks = splitLessonBlocks(md)
    allBlocks.push(...blocks)
  }
  return allBlocks
}

/** Скопировать HTML-презентации в public/courses/<slug>/lesson_NN.html */
async function copyPresentations(srcDir, slug, totalLessons) {
  if (!existsSync(srcDir)) {
    console.warn(`  ⚠ no presentations dir ${srcDir}`)
    return []
  }
  const outDir = join(PUBLIC_COURSES, slug)
  await mkdir(outDir, { recursive: true })
  const copied = []
  for (let n = 1; n <= totalLessons; n++) {
    const src = join(srcDir, `урок_${pad2(n)}.html`)
    if (!existsSync(src)) continue
    const dst = join(outDir, `lesson_${pad2(n)}.html`)
    await copyFile(src, dst)
    copied.push(n)
  }
  return copied
}

/** Группируем 48 уроков в 8 модулей по 6 */
function groupLessonsIntoModules(lessons, moduleSpecs) {
  const modules = []
  for (let i = 0; i < 8; i++) {
    const start = i * 6
    const end = start + 6
    const sliceLessons = lessons.slice(start, end)
    const spec = moduleSpecs[i] || { title: `Модуль ${i + 1}`, emoji: '📘', accent: '#6B5CE7', ageAnchor: '8-14' }
    modules.push({
      n: i + 1,
      title: spec.title,
      emoji: spec.emoji,
      accent: spec.accent,
      ageAnchor: spec.ageAnchor,
      story: spec.story || `Модуль ${i + 1}: ${sliceLessons[0]?.title || ''}`,
      capstone: spec.capstone || {
        name: `Капстон модуля ${i + 1}`,
        genre: 'mini-project',
      },
      lessons: sliceLessons,
    })
  }
  return modules
}

// ═════ Course definitions ═════════════════════════════════════════

const PYTHON_MODULES = [
  { title: 'Первые шаги: Python + IDE', emoji: '🐍', accent: '#48c774', ageAnchor: '8-14', story: 'Установим среду и напишем первую программу', capstone: { name: 'Визитка программиста', genre: 'Скрипт' } },
  { title: 'Переменные, типы, вывод', emoji: '🔢', accent: '#3E87E8', ageAnchor: '8-14', story: 'Числа, строки, форматирование', capstone: { name: 'Электронный помощник', genre: 'CLI' } },
  { title: 'Условия и циклы', emoji: '🔁', accent: '#FFD43C', ageAnchor: '9-14', story: 'Алгоритмическое мышление в действии', capstone: { name: 'Лабиринт', genre: 'Console game' } },
  { title: 'Функции и списки', emoji: '🛠', accent: '#c879ff', ageAnchor: '10-14', story: 'DRY, декомпозиция, структуры данных', capstone: { name: 'Морской бой', genre: 'Game' } },
  { title: 'Файлы и словари', emoji: '📁', accent: '#FF9454', ageAnchor: '10-14', story: 'Сохранение состояния и работа с данными', capstone: { name: 'Тамагочи', genre: 'Sim' } },
  { title: 'Нейросети: первые шаги', emoji: '🧠', accent: '#E8517B', ageAnchor: '11-14', story: 'GigaChat, YandexGPT, промпты', capstone: { name: 'Квиз с ИИ', genre: 'Quiz' } },
  { title: 'Веб и визитка-сайт', emoji: '🌐', accent: '#A9D8FF', ageAnchor: '11-14', story: 'HTML, CSS, публикация сайта', capstone: { name: 'Сайт-визитка', genre: 'Website' } },
  { title: 'Финальная игра на PyGame Zero', emoji: '🏆', accent: '#FFD43C', ageAnchor: '11-14', story: 'Полноценная 2D-игра: сцены, анимация, звук', capstone: { name: 'Финальная игра', genre: 'PyGame' } },
]

const VIBE_MODULES = [
  { title: 'Я + ИИ: первый напарник', emoji: '🤖', accent: '#6B5CE7', ageAnchor: '11-12', story: 'Что такое vibe-coding и как ставить задачу нейросети', capstone: { name: 'Telegram-бот "Помощник"', genre: 'Bot' } },
  { title: 'Python + прямой промпт', emoji: '🐍', accent: '#48c774', ageAnchor: '11-12', story: 'Пишем код вместе с GigaChat', capstone: { name: 'Игра-викторина', genre: 'Game' } },
  { title: 'Сайты на HTML/CSS', emoji: '🌐', accent: '#A9D8FF', ageAnchor: '11-12', story: 'Веб-страница за час, вместе с AI', capstone: { name: 'Лендинг своего проекта', genre: 'Web' } },
  { title: 'Деплой и GitHub Pages', emoji: '🚀', accent: '#FF9454', ageAnchor: '11-12', story: 'От локалки до публичной ссылки', capstone: { name: 'Сайт с доменом', genre: 'Web' } },
  { title: 'Боты и автоматизация', emoji: '⚙', accent: '#FFD43C', ageAnchor: '11-12', story: 'Aiogram, расписания, обработка сообщений', capstone: { name: 'Бот-напоминалка', genre: 'Bot' } },
  { title: 'Генерация картинок и текстов', emoji: '🎨', accent: '#E8517B', ageAnchor: '11-12', story: 'Stable Diffusion / Kandinsky через API', capstone: { name: 'Мем-генератор', genre: 'Creative' } },
  { title: 'Первый продукт для друзей', emoji: '💎', accent: '#c879ff', ageAnchor: '11-12', story: 'Упаковка проекта и сбор обратной связи', capstone: { name: 'Свой сервис', genre: 'Product' } },
  { title: 'Защита финального проекта', emoji: '🏆', accent: '#FFD43C', ageAnchor: '11-12', story: 'Демо-день, презентация родителям', capstone: { name: 'Финальный проект', genre: 'Showcase' } },
]

const COURSE_SPECS = [
  {
    slug: 'python-ai',
    title: 'Python и нейросети',
    subtitle: '48 уроков по 60 мин. Python + GigaChat/YandexGPT. Финальная игра на PyGame Zero.',
    emoji: '🐍',
    accent: '#48c774',
    ageRange: '8-14',
    lessonDurationMin: 60,
    totalLessons: 48,
    batchDir: join(PRODUCTS_ROOT, 'Python_и_нейросети_Eduson_Kids', '02_уроки'),
    presentationsDir: join(PRODUCTS_ROOT, 'Python_и_нейросети_Eduson_Kids', '03_презентации'),
    programFile: join(PRODUCTS_ROOT, 'Python_и_нейросети_Eduson_Kids', '01_программа', 'официальная_программа.md'),
    moduleSpecs: PYTHON_MODULES,
  },
  {
    slug: 'vibe-coding-step1',
    title: 'Vibe Coding · Step 1',
    subtitle: 'Возраст 11-12. Я + ИИ-напарник: боты, сайты, мини-продукты.',
    emoji: '🎨',
    accent: '#6B5CE7',
    ageRange: '11-12',
    lessonDurationMin: 60,
    totalLessons: 48,
    batchDir: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '01_step1_11-12лет', 'уроки'),
    presentationsDir: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '01_step1_11-12лет', 'презентации'),
    programFile: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '01_step1_11-12лет', 'официальная_программа.md'),
    moduleSpecs: VIBE_MODULES,
  },
  {
    slug: 'vibe-coding-step2',
    title: 'Vibe Coding · Step 2',
    subtitle: 'Возраст 13-15. Первый коммерческий продукт: сервер, домен, продажи.',
    emoji: '🚀',
    accent: '#ff5ab1',
    ageRange: '13-15',
    lessonDurationMin: 60,
    totalLessons: 48,
    batchDir: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '02_step2_13-15лет', 'уроки'),
    presentationsDir: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '02_step2_13-15лет', 'презентации'),
    programFile: join(PRODUCTS_ROOT, 'детский_курс_вайб_кодинг', '02_step2_13-15лет', 'официальная_программа.md'),
    moduleSpecs: VIBE_MODULES,
  },
]

// ═════ Main ═══════════════════════════════════════════════════════

async function main() {
  console.log('📚 Ingest курсов из products/ …\n')
  const courses = []

  for (const spec of COURSE_SPECS) {
    console.log(`— ${spec.title} (${spec.slug})`)
    if (!existsSync(spec.batchDir)) {
      console.warn(`  ⚠ skip, no batch dir ${spec.batchDir}\n`)
      continue
    }
    const blocks = await readLessonsFromBatches(spec.batchDir)
    console.log(`  парсим ${blocks.length} блоков уроков`)

    // Если меньше 48 — дополняем пустышками, больше — обрезаем
    while (blocks.length < spec.totalLessons) {
      const n = blocks.length + 1
      blocks.push({ n, title: `Урок ${n}`, body: '' })
    }
    const lessons = blocks.slice(0, spec.totalLessons).map((b) => parseLesson(b, spec.totalLessons))

    const copied = await copyPresentations(spec.presentationsDir, spec.slug, spec.totalLessons)
    console.log(`  презентаций скопировано: ${copied.length}`)

    // Подвязываем htmlFile к lesson'ам, у которых есть скопированная презентация
    for (const l of lessons) {
      if (copied.includes(l.n)) {
        l.htmlFile = `/courses/${spec.slug}/lesson_${pad2(l.n)}.html`
      }
    }

    const modules = groupLessonsIntoModules(lessons, spec.moduleSpecs)
    courses.push({
      slug: spec.slug,
      title: spec.title,
      subtitle: spec.subtitle,
      emoji: spec.emoji,
      accent: spec.accent,
      ageRange: spec.ageRange,
      lessonDurationMin: spec.lessonDurationMin,
      totalLessons: spec.totalLessons,
      modules,
      source: 'ingested',
    })
    console.log(`  ✓ ${modules.length} модулей, ${lessons.length} уроков\n`)
  }

  // Сериализация в TS — все поля в JSON плюс type annotations
  const tsOut = renderCoursesTs(courses)
  await writeFile(GENERATED_OUT, tsOut, 'utf-8')
  console.log(`\n✅ сгенерирован ${basename(GENERATED_OUT)} (${courses.length} курсов)`)
}

function renderCoursesTs(courses) {
  return `/* AUTO-GENERATED by scripts/ingest-courses.mjs — не править руками.
 * Запуск: node scripts/ingest-courses.mjs
 * Исходник: c:/Users/being/Desktop/products/
 * Сгенерировано: ${new Date().toISOString()}
 */
import type { Course } from './curriculum'

export const INGESTED_COURSES: Course[] = ${JSON.stringify(courses, null, 2)}
`
}

main().catch((e) => {
  console.error('❌ ingest failed:', e)
  process.exit(1)
})
