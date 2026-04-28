/**
 * Curriculum data — single source of truth для 48-урочного
 * годового курса Эдюсон Kids (blocks-only).
 *
 * Структура навеяна 9-step Blockseli + Bloxels 2025-2026 pattern
 * (вспоминалка/проектный/защита) из competitor_pedagogy_review.md.
 *
 * Каждый модуль M1-M8 имеет 6 уроков:
 *   L1 — вспоминалка прошлого модуля + введение темы
 *   L2-L4 — пошаговое освоение блоков
 *   L5 — проектный урок (сборка капстона)
 *   L6 — «Защита капстона» (публичная презентация)
 */

import { PUBLIC_BASE } from './publicPath'
import { INGESTED_COURSES as RAW_INGESTED_COURSES } from './courses.generated'

/** MCQ-вопрос для квиза в конце презентации урока. */
export interface QuizQuestion {
  text: string
  options: string[]
  correctIdx: number
  /** Объяснение почему именно этот ответ верен (показывается после попытки) */
  explanation?: string
}

export interface Lesson {
  n: number                 // 1..48 globally
  localN: number            // 1..6 within module
  moduleN: number           // 1..8
  title: string
  kind: 'recall' | 'concept' | 'practice' | 'project' | 'defense'
  /** 1-строчное summary для списка */
  hook: string
  /** 2-4 термина, вводимых на уроке */
  terms: string[]
  /** Новые блоки, вводимые на уроке */
  newBlocks: string[]
  /** Вклад урока в капстон-игру модуля */
  capstoneContribution: string
  /** Дифференциация по возрасту 🟢 9-10 / 🟡 11-12 / 🔴 13-15 */
  differentiation?: { easy: string; mid: string; hard: string }
  /** Ссылка на HTML-презентацию (если готова) */
  htmlFile?: string
  /** Ссылка на methodist guide markdown (если готов) */
  guideFile?: string
  /**
   * 2-3 MCQ-вопроса в конце презентации. Если не задано явно —
   * generateFallbackQuiz(lesson) соберёт базовый квиз из terms.
   */
  quiz?: QuizQuestion[]
  // ── Extended content (из ingested курсов; markdown-text) ──
  /** Цель занятия (markdown) */
  goal?: string
  /** Образовательные результаты (markdown: bullets) */
  outcomes?: string
  /** Мини-проект урока (markdown) */
  miniProject?: string
  /** Домашнее задание (markdown) */
  homework?: string
}

export interface Module {
  n: number                 // 1..8
  title: string
  story: string             // narrative hook
  emoji: string
  accent: string            // brand color
  capstone: {
    name: string
    genre: string
    worldId?: string        // id игры-эталона на платформе (если есть)
  }
  ageAnchor: string         // "9-11" / "11-14" etc
  lessons: Lesson[]
}

/**
 * Course — верхний уровень LXP иерархии.
 * Одна платформа может содержать несколько курсов (Эдюсон Kids / Python+AI / Vibe Coding …).
 * У каждого курса — свой набор модулей, возраст, формат, домен, методический документ.
 */
export interface Course {
  slug: string              // URL-id курса: 'kubik' / 'python-ai' / 'vibe-coding-step1'
  title: string
  subtitle: string          // одна строка для карточки
  emoji: string
  accent: string            // брендинг
  ageRange: string          // "9-15" / "8-14" / "11-12"
  lessonDurationMin: number // 45 / 60
  totalLessons: number      // 48 обычно
  modules: Module[]
  /** Полный путь на программу/методичку (md/html) если есть */
  programFile?: string
  /** Источник: наш in-repo курс или ingested из products/ */
  source: 'builtin' | 'ingested'
}

// ─── M1 · Первые шаги в Эдюсон Kids ──────────────────────────────────
const M1: Lesson[] = [
  {
    n: 1, localN: 1, moduleN: 1, kind: 'concept',
    title: 'Знакомство со средой',
    hook: 'Открой студию, посмотри на 3 таба и облети камеру.',
    terms: ['редактор', 'сцена', 'часть (Part)', 'палитра'],
    newBlocks: [],
    capstoneContribution: 'открыт проект, сохранён аватар',
    differentiation: {
      easy: 'Открыл Студию, нашёл кнопку ▶ Тест',
      mid: 'Прошёл все 3 таба (Строить/Скрипт/Тест), покрутил камеру',
      hard: '+ выбрал цвет сцены, изменил имя проекта',
    },
    htmlFile: `${PUBLIC_BASE}/curriculum/lessons/L1_first_game.html`,
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L1_teacher_guide.md`,
    quiz: [
      {
        text: 'Сколько вкладок в Студии Эдюсон Kids?',
        options: ['1', '2', '3', '5'],
        correctIdx: 2,
        explanation: 'Три вкладки: 🧱 Строить (сцена), 🧩 Скрипт (блоки), ▶ Тест (живая игра).',
      },
      {
        text: 'Что такое «часть» (Part) в сцене?',
        options: ['Команда в коде', 'Один объект-кубик', 'Вкладка редактора', 'Имя проекта'],
        correctIdx: 1,
        explanation: 'Часть — это отдельный 3D-объект: кубик, монета, платформа. Из частей собирается сцена.',
      },
    ],
  },
  {
    n: 2, localN: 2, moduleN: 1, kind: 'practice',
    title: 'Ставим части на сцену',
    hook: 'Перетащи блоки из палитры в мир — это твоя первая сцена.',
    terms: ['часть', 'материал', 'цвет'],
    newBlocks: [],
    capstoneContribution: '5 платформ + точка старта',
    differentiation: {
      easy: 'Поставил 3 куба',
      mid: 'Поставил 5 цветных платформ с разной высотой',
      hard: '+ выбрал материалы (дерево/металл/неон)',
    },
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L2_teacher_guide.md`,
    quiz: [
      {
        text: 'Зачем менять материал у части?',
        options: ['Она станет легче', 'Поменяется её вид: блеск, шершавость', 'Уменьшится размер', 'Изменится цвет'],
        correctIdx: 1,
        explanation: 'Материал меняет как свет отражается от поверхности — металл блестит, дерево матовое.',
      },
      {
        text: 'Куда надо поставить «точку старта» (spawn)?',
        options: ['На крыше дома', 'Там, откуда игрок должен начать играть', 'За пределами сцены', 'Нигде, она не нужна'],
        correctIdx: 1,
        explanation: 'Точка старта — место рождения героя. Без неё игрок упадёт в пустоту.',
      },
    ],
  },
  {
    n: 3, localN: 3, moduleN: 1, kind: 'concept',
    title: 'Первый блок-скрипт',
    hook: 'Напиши свою первую программу из 1 блока.',
    terms: ['блок', 'хат-событие', 'стопка'],
    newBlocks: ['@при запуске', 'сказать'],
    capstoneContribution: 'герой здоровается в начале игры',
    htmlFile: `${PUBLIC_BASE}/curriculum/lessons/L3_events_collisions.html`,
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L3_teacher_guide.md`,
    quiz: [
      {
        text: 'Что такое хат-событие (hat-блок)?',
        options: ['Блок-шапка, с которой начинается стопка', 'Блок последний в стопке', 'Блок-подсказка', 'Блок для удаления'],
        correctIdx: 0,
        explanation: 'Хат-блок — «шляпа» стопки. Под ним описывают что сделать в ответ на событие.',
      },
      {
        text: 'Когда сработает `@при запуске`?',
        options: ['Когда игрок нажмёт Space', 'Как только игра загрузилась', 'Раз в секунду', 'Никогда без вызова'],
        correctIdx: 1,
        explanation: '`@при запуске` — автоматически срабатывает один раз, когда сцена загрузилась.',
      },
    ],
  },
  {
    n: 4, localN: 4, moduleN: 1, kind: 'practice',
    title: 'Движение игрока',
    hook: 'WASD + прыжок встроены в платформу — тестируем!',
    terms: ['физика', 'гравитация', 'WASD'],
    newBlocks: [],
    capstoneContribution: 'прокатали управление, поправили размеры платформ',
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L4_teacher_guide.md`,
    quiz: [
      {
        text: 'Что делает гравитация?',
        options: ['Красит объекты', 'Тянет всё вниз', 'Ускоряет игру', 'Отключает физику'],
        correctIdx: 1,
        explanation: 'Гравитация — сила, притягивающая тело к земле. Герой падает именно из-за неё.',
      },
      {
        text: 'Какая клавиша запускает прыжок по умолчанию?',
        options: ['Enter', 'Space', 'Tab', 'Shift'],
        correctIdx: 1,
        explanation: 'Пробел (Space) — стандарт прыжка в играх и в нашем платформере.',
      },
    ],
  },
  {
    n: 5, localN: 5, moduleN: 1, kind: 'practice',
    title: 'Монеты и финиш',
    hook: 'Коснулся монеты → +очки. Коснулся финиша → победа.',
    terms: ['сенсор', 'сбор', 'цель-триггер'],
    newBlocks: ['@когда коснулся'],
    capstoneContribution: '5 монет + финишная платформа',
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L5_teacher_guide.md`,
    quiz: [
      {
        text: 'В чём разница между сенсором и твёрдым коллайдером?',
        options: ['Нет разницы', 'Сенсор пропускает насквозь, но замечает касание', 'Сенсор тяжелее', 'Сенсор только для финишей'],
        correctIdx: 1,
        explanation: 'Твёрдый коллайдер отталкивает (стена). Сенсор даёт пройти, но запускает событие — идеально для монеток.',
      },
      {
        text: 'Что делает `@когда коснулся`?',
        options: ['Убирает объект', 'Срабатывает при пересечении с игроком', 'Запускает игру', 'Считает время'],
        correctIdx: 1,
        explanation: 'Это событийный блок — реакция на столкновение/пересечение с игроком.',
      },
    ],
  },
  {
    n: 6, localN: 6, moduleN: 1, kind: 'defense',
    title: 'Защита первой игры',
    hook: 'Презентуй свой Прыжковую полосу классу. 2 мин на игрока.',
    terms: ['защита', 'рубрика', 'рефлексия'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M1: готовый Прыжковую полосу-платформер',
    htmlFile: `${PUBLIC_BASE}/curriculum/lessons/L6_python_mode.html`,
    guideFile: `${PUBLIC_BASE}/curriculum/lessons/L6_teacher_guide.md`,
    quiz: [
      {
        text: 'Что такое рефлексия после проекта?',
        options: ['Красить игру заново', 'Отзеркалить экран', 'Подумать что получилось / не получилось', 'Сохранить файл'],
        correctIdx: 2,
        explanation: 'Рефлексия — осмысление опыта. Без неё ошибка остаётся ошибкой, а с ней — уроком.',
      },
      {
        text: 'Сколько у тебя игр после M1?',
        options: ['0', '1 — Прыжковую полосу', '3', '5'],
        correctIdx: 1,
        explanation: 'Один капстон на модуль. За 8 модулей будет 8 собственных игр.',
      },
    ],
  },
]

// ─── M2 · Движение и события ──────────────────────────────────
const M2: Lesson[] = [
  {
    n: 7, localN: 1, moduleN: 2, kind: 'recall',
    title: 'Вспоминалка M1 + что такое событие',
    hook: '10 мин квиз по M1 · 35 мин: три вида событий.',
    terms: ['событие', 'обработчик', 'пусковой механизм'],
    newBlocks: ['@когда клавиша'],
    capstoneContribution: 'гоночный трек начат',
    quiz: [
      {
        text: 'Событие — это…',
        options: ['Команда в коде', 'Момент когда что-то случается (запуск, клик, касание)', 'Тип переменной', 'Цвет объекта'],
        correctIdx: 1,
        explanation: 'Событие — момент. Обработчик — что делать в этот момент. Событие → обработчик.',
      },
      {
        text: 'Какой блок сработает если игрок нажал клавишу?',
        options: ['@при запуске', '@когда клавиша', '@коллизия', 'сказать'],
        correctIdx: 1,
        explanation: '@когда клавиша реагирует на нажатия с клавиатуры.',
      },
    ],
  },
  {
    n: 8, localN: 2, moduleN: 2, kind: 'concept',
    title: 'Коллизии: твёрдо vs сенсор',
    hook: 'Стена отталкивает. Сенсор — пропускает, но замечает.',
    terms: ['коллайдер', 'твёрдое тело', 'сенсор'],
    newBlocks: [],
    capstoneContribution: '3 чекпоинта-сенсора',
    quiz: [
      {
        text: 'Стена в игре — это какой коллайдер?',
        options: ['Сенсор', 'Твёрдый', 'Никакой', 'Облако'],
        correctIdx: 1,
        explanation: 'Твёрдый коллайдер отталкивает — поэтому персонаж не проходит сквозь стену.',
      },
      {
        text: 'Монетку лучше сделать…',
        options: ['Твёрдой — чтоб сбивала скорость', 'Сенсором — чтоб игрок прошёл через неё и собрал', 'Без коллайдера — её нельзя будет собрать', 'Невидимой'],
        correctIdx: 1,
        explanation: 'Сенсор не мешает движению но ловит касание — идеально для монеты/чекпоинта.',
      },
    ],
  },
  {
    n: 9, localN: 3, moduleN: 2, kind: 'practice',
    title: 'Событие нажатия клавиши',
    hook: 'Пробел — двойной прыжок. Shift — ускорение.',
    terms: ['клавиша', 'триггер'],
    newBlocks: ['прыгнуть', 'повернуть'],
    capstoneContribution: 'двойной прыжок в гонке',
    quiz: [
      {
        text: 'Чтобы герой делал что-то по нажатию клавиши — нужен блок…',
        options: ['@при запуске', '@когда клавиша', 'сказать', 'повторить'],
        correctIdx: 1,
        explanation: 'Без @когда клавиша нажатие игнорируется игровой логикой.',
      },
    ],
  },
  {
    n: 10, localN: 4, moduleN: 2, kind: 'concept',
    title: 'Порядок и цепочки событий',
    hook: 'Финиш работает только если ты прошёл все чекпоинты.',
    terms: ['последовательность', 'условный переход'],
    newBlocks: [],
    capstoneContribution: 'логика прохождения трассы',
    quiz: [
      {
        text: 'Если «финиш срабатывает только после 3 чекпоинтов» — нам понадобится…',
        options: ['Мир-переменная со счётчиком пройденных чекпоинтов', 'Больше монет', 'Только @при запуске', 'Ничего'],
        correctIdx: 0,
        explanation: 'Считать — значит хранить число. Значит нужна переменная. Это мост к M3.',
      },
    ],
  },
  {
    n: 11, localN: 5, moduleN: 2, kind: 'project',
    title: 'Проектный урок: собери Гонку',
    hook: 'Трек + чекпоинты + таймер + финиш. Всё вместе.',
    terms: ['интеграция', 'playtest'],
    newBlocks: [],
    capstoneContribution: 'готовая Race-игра',
    differentiation: {
      easy: 'Прямой трек с 2 чекпоинтами',
      mid: 'Извилистый трек с 3 чекпоинтами + подсчёт времени',
      hard: '+ развилка (длинный/короткий путь), штраф за пропуск',
    },
    quiz: [
      {
        text: 'Что такое playtest?',
        options: ['Купить тест у друга', 'Проиграть свою игру самому или попросить друга — найти баги', 'Команда тестирования', 'Автоматический компилятор'],
        correctIdx: 1,
        explanation: 'Playtest — проба игры глазами игрока. Главный способ найти «скучно» и «непонятно».',
      },
    ],
  },
  {
    n: 12, localN: 6, moduleN: 2, kind: 'defense',
    title: 'Защита M2: турнир по гонкам',
    hook: 'Ученики проходят трассы друг друга — лучшее время берёт «Золотой руль».',
    terms: ['взаимооценка', 'метрика'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M2: Race-игра',
    quiz: [
      {
        text: 'Взаимооценка — это когда…',
        options: ['Учитель ставит оценку', 'Одноклассники оценивают работу друг друга по рубрике', 'Игра оценивает сама себя', 'Родители голосуют'],
        correctIdx: 1,
        explanation: 'Peer review — мощный педагогический инструмент: критик становится рефлексивным автором.',
      },
    ],
  },
]

// ─── M3 · Переменные и счёт ──────────────────────────────────
const M3: Lesson[] = [
  {
    n: 13, localN: 1, moduleN: 3, kind: 'recall',
    title: 'Вспоминалка M2 + переменная = коробка',
    hook: 'Переменная — коробка с именем, в которой лежит значение.',
    terms: ['переменная', 'значение', 'имя'],
    newBlocks: ['задать', 'показать_счёт'],
    capstoneContribution: 'HUD со счётом',
  },
  {
    n: 14, localN: 2, moduleN: 3, kind: 'concept',
    title: 'Три типа переменных: мир / местная / сохраняемая',
    hook: 'Мир-переменную видят все скрипты. Местная — только свой. Сохраняемая — живёт после выхода.',
    terms: ['scope', 'мир-переменная', 'сохраняемая'],
    newBlocks: ['мир', 'сохранённое()'],
    capstoneContribution: 'лучший рекорд сохраняется между запусками',
  },
  {
    n: 15, localN: 3, moduleN: 3, kind: 'practice',
    title: 'Арифметика в блоках',
    hook: '+ − × ÷ % — как в калькуляторе, но блоками.',
    terms: ['арифметика', 'операнд'],
    newBlocks: ['+', '−', '×', '÷', '%'],
    capstoneContribution: 'счёт корректно прирастает',
  },
  {
    n: 16, localN: 4, moduleN: 3, kind: 'concept',
    title: 'Формула очков: множитель × редкость',
    hook: 'Золотая монета × 5 = больше очков, чем обычная × 1.',
    terms: ['формула', 'множитель', 'редкость'],
    newBlocks: [],
    capstoneContribution: 'три типа монет с разной стоимостью',
  },
  {
    n: 17, localN: 5, moduleN: 3, kind: 'project',
    title: 'Проектный урок: Зверята-математики',
    hook: 'Питомник с 3 редкостями монет и HUD-счётом.',
    terms: ['playtest', 'баланс'],
    newBlocks: [],
    capstoneContribution: 'готовая Зверята-математики',
    differentiation: {
      easy: '2 типа монет, цель — 20',
      mid: '3 типа + рекорд + цель 100',
      hard: '+ шкала «опыт уровня», множитель = уровень × редкость',
    },
  },
  {
    n: 18, localN: 6, moduleN: 3, kind: 'defense',
    title: 'Защита M3: выставка питомников',
    hook: 'Гости класса играют в твой питомник. Приз за баланс.',
    terms: ['экспозиция', 'интервью'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M3: Зверята-математики',
  },
]

// ─── M4 · Повторы — цикл ──────────────────────────────────
const M4: Lesson[] = [
  {
    n: 19, localN: 1, moduleN: 4, kind: 'recall',
    title: 'Вспоминалка M3 + зачем повторять?',
    hook: 'Ставить 100 блоков руками = 100 кликов. Цикл = 3 блока.',
    terms: ['цикл', 'итерация'],
    newBlocks: ['повторить N раз'],
    capstoneContribution: 'лесенка из 5 жёлтых блоков',
  },
  {
    n: 20, localN: 2, moduleN: 4, kind: 'concept',
    title: 'Вложенные циклы: 2D-сетка',
    hook: 'Цикл в цикле = квадрат 5×5 = плита.',
    terms: ['вложенность', 'индекс i/j'],
    newBlocks: ['для i от 0 до N'],
    capstoneContribution: 'площадка-плита 5×5',
  },
  {
    n: 21, localN: 3, moduleN: 4, kind: 'concept',
    title: 'Списки как данные',
    hook: '[красный, синий, зелёный] — 3 значения в одной коробке.',
    terms: ['список', 'элемент', 'индекс'],
    newBlocks: ['пустой список', 'добавить в список'],
    capstoneContribution: 'радуга из 3 цветов',
  },
  {
    n: 22, localN: 4, moduleN: 4, kind: 'practice',
    title: 'Процедурная случайность',
    hook: 'Выбери случайный цвет из списка — и башня разная каждый раз.',
    terms: ['случайное число', 'seed'],
    newBlocks: ['выбрать_случайный'],
    capstoneContribution: 'разноцветная башня',
  },
  {
    n: 23, localN: 5, moduleN: 4, kind: 'project',
    title: 'Проектный урок: Башня Кода',
    hook: 'Процедурная башня-лабиринт на 8 этажей.',
    terms: ['декомпозиция', 'рефакторинг'],
    newBlocks: [],
    capstoneContribution: 'готовая Tower из 12 блоков кода',
    differentiation: {
      easy: '5 этажей, 1 цвет',
      mid: '8 этажей, 3 случайных цвета',
      hard: '+ секция с патрульным врагом на случайном этаже',
    },
  },
  {
    n: 24, localN: 6, moduleN: 4, kind: 'defense',
    title: 'Защита M4: кто проживёт дольше в чужой башне?',
    hook: 'Взаимное тестирование башен. Приз — «Железный зодчий».',
    terms: ['тестирование', 'сложность'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M4: Башня Кода',
  },
]

// ─── M5 · Условия и логика ──────────────────────────────────
const M5: Lesson[] = [
  {
    n: 25, localN: 1, moduleN: 5, kind: 'recall',
    title: 'Вспоминалка M4 + если-то',
    hook: 'Если здоровье < 3 — кричим «Помогите!».',
    terms: ['условие', 'истина', 'ложь'],
    newBlocks: ['если'],
    capstoneContribution: 'первое условие в игре',
  },
  {
    n: 26, localN: 2, moduleN: 5, kind: 'concept',
    title: 'Блок «иначе»',
    hook: 'Если голоден — ест, иначе — играет.',
    terms: ['бинарная логика', 'ветвление'],
    newBlocks: ['если-иначе'],
    capstoneContribution: 'два пути поведения',
  },
  {
    n: 27, localN: 3, moduleN: 5, kind: 'practice',
    title: 'Сравнения + «И/ИЛИ/НЕ»',
    hook: '`==` vs `>=`: разница в одну палочку, а смысл разный.',
    terms: ['булева логика', '==, <, >', 'и/или/не'],
    newBlocks: ['сравнить', 'и', 'или', 'не'],
    capstoneContribution: 'сложное условие',
  },
  {
    n: 28, localN: 4, moduleN: 5, kind: 'concept',
    title: 'Цепочка elif',
    hook: 'Сначала самое срочное. Потом остальное.',
    terms: ['приоритетная логика', 'FSM (превью)'],
    newBlocks: ['иначе если'],
    capstoneContribution: 'AI с 4 состояниями',
  },
  {
    n: 29, localN: 5, moduleN: 5, kind: 'project',
    title: 'Проектный урок: Питомцы и нейросеть',
    hook: 'Питомец сам решает что делать: hungry → ест, tired → спит.',
    terms: ['конечный автомат', 'приоритет'],
    newBlocks: [],
    capstoneContribution: 'готовый Pet AI с 4 состояниями',
    differentiation: {
      easy: '2 состояния (голоден/играет)',
      mid: '4 состояния + переходы',
      hard: '+ состояние «грустный» (нет хозяина 30 сек) с собственной логикой',
    },
  },
  {
    n: 30, localN: 6, moduleN: 5, kind: 'defense',
    title: 'Защита M5: «Мой питомец умнее твоего»',
    hook: 'Эксперименты на чужих Pet\'ах — кто разгадает их мозг?',
    terms: ['reverse engineering', 'фидбэк'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M5: Питомцы и нейросеть',
  },
]

// ─── M6 · Скрипты объектов ──────────────────────────────────
const M6: Lesson[] = [
  {
    n: 31, localN: 1, moduleN: 6, kind: 'recall',
    title: 'Вспоминалка M5 + клик по объекту = свой скрипт',
    hook: 'Раньше один скрипт на весь мир. Теперь у каждого объекта свой характер.',
    terms: ['per-object script', 'this', 'инкапсуляция'],
    newBlocks: ['📜 Скрипт объекта (per-object)'],
    capstoneContribution: 'первая NPC заговорила',
  },
  {
    n: 32, localN: 2, moduleN: 6, kind: 'concept',
    title: '@когда коснулся — для объекта',
    hook: 'Сундук: игрок коснулся — «Улика найдена!».',
    terms: ['триггер объекта', 'sensor'],
    newBlocks: ['@когда коснулся (объектный)'],
    capstoneContribution: 'сундук с уликой',
  },
  {
    n: 33, localN: 3, moduleN: 6, kind: 'practice',
    title: '@каждые N секунд — таймер',
    hook: 'Призрак говорит «Бу!» каждые 3 секунды.',
    terms: ['interval', 'периодическое событие'],
    newBlocks: ['@каждые N сек'],
    capstoneContribution: 'призрак повторяет фразу',
  },
  {
    n: 34, localN: 4, moduleN: 6, kind: 'concept',
    title: 'Broadcast — общий канал',
    hook: 'Рычаг шлёт сигнал «дверь_открыта» — все двери его слышат.',
    terms: ['broadcast', 'pub-sub', 'сигнал'],
    newBlocks: ['отправить сигнал', '@когда получен сигнал'],
    capstoneContribution: 'дверь открывается от рычага',
  },
  {
    n: 35, localN: 5, moduleN: 6, kind: 'project',
    title: 'Проектный урок: Детектив',
    hook: '3 подозреваемых NPC + 5 улик + broadcast «допрос» → расследование.',
    terms: ['многоагентная система', 'сюжет'],
    newBlocks: [],
    capstoneContribution: 'готовый Mystery',
    differentiation: {
      easy: '2 NPC, 3 улики, линейный сюжет',
      mid: '3 NPC, 5 улик, broadcast',
      hard: '+ 4-й NPC-лжец (говорит обратное), логика дедукции',
    },
  },
  {
    n: 36, localN: 6, moduleN: 6, kind: 'defense',
    title: 'Защита M6: «Кто убийца?»',
    hook: 'Автор рассказывает сюжет, класс играет и голосует за разгадку.',
    terms: ['storytelling', 'дедукция'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M6: Mystery',
  },
]

// ─── M7 · Функции и DRY ──────────────────────────────────
const M7: Lesson[] = [
  {
    n: 37, localN: 1, moduleN: 7, kind: 'recall',
    title: 'Вспоминалка M6 + функция = рецепт',
    hook: 'Написал один раз — используешь 100 раз.',
    terms: ['функция', 'имя', 'вызов'],
    newBlocks: ['функция', 'вызвать'],
    capstoneContribution: 'первая функция',
  },
  {
    n: 38, localN: 2, moduleN: 7, kind: 'concept',
    title: 'Параметры — ингредиенты рецепта',
    hook: '`башня(5)` — одна функция строит любую высоту.',
    terms: ['параметр', 'аргумент'],
    newBlocks: ['параметр'],
    capstoneContribution: 'параметризованная функция башни',
  },
  {
    n: 39, localN: 3, moduleN: 7, kind: 'concept',
    title: 'Возврат значения',
    hook: 'Функция может не только строить, но и возвращать результат.',
    terms: ['return', 'чистая функция'],
    newBlocks: ['вернуть'],
    capstoneContribution: 'функция-калькулятор очков',
  },
  {
    n: 40, localN: 4, moduleN: 7, kind: 'practice',
    title: 'DRY: не повторяйся',
    hook: 'Берём старый Прыжковую полосу из M1 — сокращаем в 3 раза.',
    terms: ['рефакторинг', 'декомпозиция', 'DRY'],
    newBlocks: [],
    capstoneContribution: 'код в 3 раза короче',
  },
  {
    n: 41, localN: 5, moduleN: 7, kind: 'project',
    title: 'Проектный урок: моя библиотека',
    hook: '5 функций → сохранены как «Мои блоки» → доступны в любой игре.',
    terms: ['переиспользование', 'модуль', 'API'],
    newBlocks: ['Мои блоки'],
    capstoneContribution: 'собственная библиотека из 5+ функций',
    differentiation: {
      easy: '3 функции без параметров',
      mid: '5 функций с параметрами',
      hard: '+ 2 функции с возвратом, документация для каждой',
    },
  },
  {
    n: 42, localN: 6, moduleN: 7, kind: 'defense',
    title: 'Защита M7: обмен библиотеками',
    hook: 'Ученики обмениваются функциями. Чей `дом()` красивее?',
    terms: ['код-ревью', 'opensource'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M7: Библиотека',
  },
]

// ─── M8 · Свой финальный проект ──────────────────────────────
const M8: Lesson[] = [
  {
    n: 43, localN: 1, moduleN: 8, kind: 'concept',
    title: 'Идея и концепт + выбор жанра',
    hook: 'Определи жанр (obby/race/RP/puzzle). 3 механики. 3 экрана.',
    terms: ['жанр', 'бриф', 'UX-макет'],
    newBlocks: [],
    capstoneContribution: 'макет на бумаге (название, жанр, механики)',
  },
  {
    n: 44, localN: 2, moduleN: 8, kind: 'practice',
    title: 'MVP-прототип: только ядро',
    hook: 'Одна механика. Без украшений. Главное — играется.',
    terms: ['MVP', 'прототип', 'playtest early'],
    newBlocks: [],
    capstoneContribution: 'играбельный MVP',
  },
  {
    n: 45, localN: 3, moduleN: 8, kind: 'practice',
    title: 'Украшение: темы, NPC, эффекты',
    hook: 'Добавь звук, эмодзи, NPC из Q-меню, меню.',
    terms: ['metagame', 'эстетика'],
    newBlocks: [],
    capstoneContribution: 'визуально готовая игра',
  },
  {
    n: 46, localN: 4, moduleN: 8, kind: 'practice',
    title: 'Тест с друзьями',
    hook: 'Сосед по парте проходит твою игру. Учитель фиксирует застревания.',
    terms: ['playtest', 'usability'],
    newBlocks: [],
    capstoneContribution: 'отчёт о плейтесте',
  },
  {
    n: 47, localN: 5, moduleN: 8, kind: 'project',
    title: 'Полировка: чиним по фидбэку',
    hook: 'Закрываем 3 главных бага из плейтеста. Добавляем «сюрприз».',
    terms: ['итерация', 'bugfix'],
    newBlocks: [],
    capstoneContribution: 'финальная версия',
  },
  {
    n: 48, localN: 6, moduleN: 8, kind: 'defense',
    title: 'Демо-день: защита + публикация на Эдюсон Kids Hub',
    hook: '2-минутная защита. Публикация. Сертификат об окончании курса.',
    terms: ['публикация', 'рефлексия', 'портфолио'],
    newBlocks: [],
    capstoneContribution: '✅ Собственная игра на Hub + сертификат',
  },
]

export const MODULES: Module[] = [
  {
    n: 1, title: 'Первые шаги в Эдюсон Kids', emoji: '🧱', accent: '#6B5CE7', ageAnchor: '9-11',
    story: 'Ты попал на остров Эдюсон Kids — всё построено из блоков. Собери свой первый мир.',
    capstone: { name: 'Моя первая игра', genre: 'Прыжковую полосу', worldId: 'obby-rainbow' },
    lessons: M1,
  },
  {
    n: 2, title: 'Движение и события', emoji: '🎮', accent: '#A9D8FF', ageAnchor: '9-12',
    story: 'Твой герой устал ходить. Построй гоночный трек с чекпоинтами.',
    capstone: { name: 'Гонка с препятствиями', genre: 'Гонка' },
    lessons: M2,
  },
  {
    n: 3, title: 'Переменные и счёт', emoji: '💰', accent: '#9FE8C7', ageAnchor: '10-13',
    story: 'Открылся питомник: чем больше монет, тем сильнее питомцы.',
    capstone: { name: 'Зверята-математики', genre: 'Тихий сборщик', worldId: 'pet-math-sim' },
    lessons: M3,
  },
  {
    n: 4, title: 'Повторы — цикл', emoji: '🔁', accent: '#FFD43C', ageAnchor: '11-14',
    story: '100 этажей башни. Писать руками скучно — напиши цикл.',
    capstone: { name: 'Башня Кода', genre: 'Генеративная башня', worldId: 'tower-of-code' },
    lessons: M4,
  },
  {
    n: 5, title: 'Условия и логика', emoji: '🧠', accent: '#FFB4C8', ageAnchor: '11-14',
    story: 'Твоему питомцу нужен разум. Научи его думать — if/elif/else.',
    capstone: { name: 'Питомцы и нейросеть', genre: 'Симулятор жизни', worldId: 'pet-brain' },
    lessons: M5,
  },
  {
    n: 6, title: 'Скрипты объектов', emoji: '📜', accent: '#FF9454', ageAnchor: '12-15',
    story: 'Каждый объект — свой характер. Детективный особняк с NPC и уликами.',
    capstone: { name: 'Детектив в Особняке', genre: 'Детектив', worldId: 'detective-mansion' },
    lessons: M6,
  },
  {
    n: 7, title: 'Функции и DRY', emoji: '⚡', accent: '#c879ff', ageAnchor: '12-15',
    story: 'Мастерская магов. Собираешь свои заклинания как функции.',
    capstone: { name: 'Моя мини-библиотека', genre: 'Библиотека', worldId: 'ability-builder' },
    lessons: M7,
  },
  {
    n: 8, title: 'Свой финальный проект', emoji: '🏆', accent: '#FFD43C', ageAnchor: '13-15',
    story: 'Ты — автор. Выбери что построить. Мир узнает.',
    capstone: { name: 'Авторская игра', genre: 'Любой' },
    lessons: M8,
  },
]

// ─── Плоский список 1-48 ───────────────────────────────
export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons)

export function getLesson(n: number): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.n === n)
}

/**
 * Вернуть quiz урока. Если у урока нет явного quiz — генерим базовый
 * на основе его terms+newBlocks. Всегда есть 1-3 вопроса для fallback.
 */
export function getLessonQuiz(lesson: Lesson): QuizQuestion[] {
  if (lesson.quiz && lesson.quiz.length > 0) return lesson.quiz
  return generateFallbackQuiz(lesson)
}

function generateFallbackQuiz(lesson: Lesson): QuizQuestion[] {
  const out: QuizQuestion[] = []

  // Q1: term comprehension (если есть термины)
  if (lesson.terms.length > 0) {
    const primary = lesson.terms[0]!
    const distractors = lesson.terms.slice(1, 4)
    // Если дистракторов мало — добавляем «обманки» из универсального пула
    const pool = ['функция', 'цикл', 'переменная', 'событие', 'массив', 'сравнение', 'условие']
    while (distractors.length < 3) {
      const d = pool.find((p) => p !== primary && !distractors.includes(p))
      if (d) distractors.push(d)
      else break
    }
    const options = fisherYates([primary, ...distractors])
    out.push({
      text: `Какое главное слово сегодняшнего урока «${lesson.title}»?`,
      options,
      correctIdx: options.indexOf(primary),
      explanation: `${primary} — ключевой термин этого урока.`,
    })
  }

  // Q2: block introduction (если вводились новые блоки)
  if (lesson.newBlocks.length > 0) {
    const block = lesson.newBlocks[0]!
    out.push({
      text: `Какой новый блок появился на уроке ${lesson.n}?`,
      options: [
        block,
        '@при запуске',
        'сказать',
        'повторить N раз',
      ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4),
      correctIdx: 0,
      explanation: `${block} — новый блок этого урока. Он теперь в твоей палитре.`,
    })
  }

  // Q3: capstone awareness
  const m = getModuleByLesson(lesson.n)
  if (m) {
    out.push({
      text: 'К какому капстону ведёт этот урок?',
      options: [
        m.capstone.name,
        'Обучалка Python',
        'Мини-чат',
        'Головоломка',
      ],
      correctIdx: 0,
      explanation: `Каждый модуль завершается капстон-игрой. Здесь — «${m.capstone.name}» (жанр ${m.capstone.genre}).`,
    })
  }

  return out.slice(0, 3)
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}
export function getModuleByLesson(n: number): Module | undefined {
  return MODULES.find((m) => m.lessons.some((l) => l.n === n))
}
export function getModule(n: number): Module | undefined {
  return MODULES.find((m) => m.n === n)
}

// ─── Человекочитаемые подписи kind ─────────────────────
export const KIND_LABEL: Record<Lesson['kind'], string> = {
  recall: '🔁 Повторение',
  concept: '💡 Новая тема',
  practice: '✋ Практика',
  project: '🛠 Проектный урок',
  defense: '🎤 Защита',
}
export const KIND_COLOR: Record<Lesson['kind'], string> = {
  recall: '#A9D8FF',
  concept: '#6B5CE7',
  practice: '#9FE8C7',
  project: '#FFD43C',
  defense: '#FFB4C8',
}

// ═══════════════════════════════════════════════════════════
// YEAR 2 — Алгоритмический стек (M9-M16, L49-96)
// ═══════════════════════════════════════════════════════════

function mkLesson(n: number, localN: number, moduleN: number, overrides: Partial<Lesson>): Lesson {
  return {
    n, localN, moduleN,
    kind: localN === 6 ? 'project' : localN === 1 ? 'recall' : 'concept',
    title: `Урок ${n}`,
    hook: '',
    terms: [],
    newBlocks: [],
    capstoneContribution: '',
    ...overrides,
  }
}

const M9: Lesson[] = [
  mkLesson(49, 1, 9, { kind: 'concept', title: 'Типы данных: число, строка, булево', hook: 'Что такое тип данных и почему «5»+«3» ≠ 8', terms: ['тип данных', 'кастинг', 'int()', 'str()', 'bool()'], newBlocks: ['получить тип', 'конвертировать в число', 'конвертировать в строку'], capstoneContribution: 'Базовые вычисления калькулятора' }),
  mkLesson(50, 2, 9, { kind: 'concept', title: 'Строки как данные', hook: 'Манипуляции со строками: длина, срезы, upper/lower', terms: ['конкатенация', 'длина строки', 'substring', 'метод'], newBlocks: ['длина строки', 'заглавные буквы', 'срез строки'], capstoneContribution: 'Форматирование ответов калькулятора' }),
  mkLesson(51, 3, 9, { kind: 'practice', title: 'Булева алгебра глубже', hook: 'Законы де Моргана и таблица истинности', terms: ['де Морган', 'таблица истинности', 'приоритет операторов', 'ранняя оценка'], newBlocks: ['не (A и B)', 'не (A или B)'], capstoneContribution: 'Проверка правильности ответа' }),
  mkLesson(52, 4, 9, { kind: 'concept', title: 'Константы vs переменные', hook: 'Когда число должно быть именованным, а не «магическим»', terms: ['константа', 'магическое число', 'стиль кода'], newBlocks: ['задать константу', 'группа констант'], capstoneContribution: 'Именованные уровни сложности' }),
  mkLesson(53, 5, 9, { kind: 'practice', title: 'Scope глубоко', hook: 'Почему переменная внутри функции не видна снаружи', terms: ['область видимости', 'глобальная', 'локальная', 'тень имени'], newBlocks: ['использовать глобальную', 'задать глобальную'], capstoneContribution: 'Счётчик попыток через global' }),
  mkLesson(54, 6, 9, { kind: 'project', title: 'Капстон M9: Калькулятор-тренажёр', hook: 'Собираем мини-приложение: вводишь пример → считает и засчитывает очки', terms: ['приложение', 'input/output', 'цикл ввода'], newBlocks: ['запросить ввод', 'вывести результат'], capstoneContribution: 'Полная игровая петля калькулятора' }),
]

const M10: Lesson[] = [
  mkLesson(55, 1, 10, { kind: 'concept', title: 'while — условный цикл', hook: 'Цикл «пока верно — продолжай» и опасность бесконечного', terms: ['while', 'условие выхода', 'бесконечный цикл', 'счётчик'], newBlocks: ['пока условие', 'счётчик цикла'], capstoneContribution: 'Цикл генерации комнат пока не заполнено' }),
  mkLesson(56, 2, 10, { kind: 'concept', title: 'break и continue', hook: 'Ранний выход из цикла и пропуск итерации', terms: ['break', 'continue', 'поиск', 'ранний выход'], newBlocks: ['выйти из цикла', 'перейти к следующему'], capstoneContribution: 'Прерывание при нахождении выхода из данжа' }),
  mkLesson(57, 3, 10, { kind: 'practice', title: 'Вложенные циклы (2D)', hook: 'Проход по сетке i × j, генерация матрицы', terms: ['вложенный цикл', 'матрица', 'сетка', 'координата'], newBlocks: ['цикл по сетке', 'получить ячейку'], capstoneContribution: 'Создание сетки 10×10 данжа' }),
  mkLesson(58, 4, 10, { kind: 'practice', title: 'Аккумулятор — паттерн', hook: 'Сумма, счёт, max, min, среднее через накопитель', terms: ['аккумулятор', 'агрегация', 'паттерн'], newBlocks: ['начать накопитель', 'добавить к накопителю'], capstoneContribution: 'Статистика комнат: монет/врагов' }),
  mkLesson(59, 5, 10, { kind: 'practice', title: 'Цикл с шагом и обратный', hook: 'range(0, 10, 2), range(10, 0, -1) — управление шагом', terms: ['шаг цикла', 'обратный порядок', 'диапазон'], newBlocks: ['цикл с шагом', 'обратный цикл'], capstoneContribution: 'Расстановка объектов с интервалом' }),
  mkLesson(60, 6, 10, { kind: 'project', title: 'Капстон M10: 2D-генератор карт', hook: 'Random-dungeon generator: 10×10 grid со стенами/полами/монетами', terms: ['процедурная генерация', 'данж', 'правила'], newBlocks: ['случайный тип ячейки', 'проверить соседей'], capstoneContribution: 'Полный данжен-генератор' }),
]

const M11: Lesson[] = [
  mkLesson(61, 1, 11, { kind: 'concept', title: 'Что такое список', hook: 'Упорядоченная коллекция — основа структур данных', terms: ['список', 'элемент', 'индекс', 'длина'], newBlocks: ['создать список', 'добавить элемент', 'длина списка'], capstoneContribution: 'Список очков для лидерборда' }),
  mkLesson(62, 2, 11, { kind: 'concept', title: 'Индексы и срезы', hook: 'list[0], list[-1], list[2:5] — доступ по позиции', terms: ['положительный индекс', 'отрицательный индекс', 'срез'], newBlocks: ['получить по индексу', 'получить срез'], capstoneContribution: 'Топ-10 из общего списка' }),
  mkLesson(63, 3, 11, { kind: 'practice', title: 'Методы списка', hook: 'append, pop, insert, remove, sort, reverse, count, index', terms: ['метод', 'append', 'pop', 'sort'], newBlocks: ['добавить в конец', 'удалить с конца', 'отсортировать список'], capstoneContribution: 'Сортировка результатов по очкам' }),
  mkLesson(64, 4, 11, { kind: 'practice', title: 'Итерация по списку', hook: 'для каждого item в list — обработать все элементы', terms: ['итерация', 'for each', 'элемент'], newBlocks: ['для каждого в списке', 'текущий элемент'], capstoneContribution: 'Отображение всех записей лидерборда' }),
  mkLesson(65, 5, 11, { kind: 'practice', title: 'Map и filter — паттерны', hook: 'Преобразование и фильтрация без явного индекса', terms: ['map', 'filter', 'трансформация', 'предикат'], newBlocks: ['преобразовать список', 'отфильтровать список'], capstoneContribution: 'Фильтр по уровню и дате' }),
  mkLesson(66, 6, 11, { kind: 'project', title: 'Капстон M11: Лидерборд', hook: 'Личный лидерборд из всех своих игр — топ-10 по очкам', terms: ['лидерборд', 'рейтинг', 'стабильная сортировка'], newBlocks: ['сохранить результат', 'загрузить рейтинг'], capstoneContribution: 'Полный рабочий лидерборд' }),
]

const M12: Lesson[] = [
  mkLesson(67, 1, 12, { kind: 'concept', title: 'Что такое словарь', hook: 'key → value: быстрый доступ по имени, не по номеру', terms: ['словарь', 'ключ', 'значение', 'пара'], newBlocks: ['создать словарь', 'получить по ключу', 'задать по ключу'], capstoneContribution: 'Структура одного монстра в Pokedex' }),
  mkLesson(68, 2, 12, { kind: 'practice', title: 'Методы словаря', hook: 'keys(), values(), items(), get(), pop(), update()', terms: ['keys', 'values', 'items', 'get'], newBlocks: ['все ключи', 'все значения', 'безопасное получение'], capstoneContribution: 'Поля монстра: имя/тип/HP/атака' }),
  mkLesson(69, 3, 12, { kind: 'practice', title: 'Вложенные структуры', hook: 'Список словарей, словарь словарей — реальные данные', terms: ['вложенная структура', 'JSON-like', 'доступ по цепочке'], newBlocks: ['получить вложенное', 'задать вложенное'], capstoneContribution: 'База из 20 монстров с вложенными статами' }),
  mkLesson(70, 4, 12, { kind: 'concept', title: 'Set — множество', hook: 'Уникальные элементы, O(1) проверка принадлежности', terms: ['множество', 'set', 'уникальность', 'пересечение'], newBlocks: ['создать множество', 'добавить в множество', 'проверить наличие'], capstoneContribution: 'Проверка уникальных типов монстров' }),
  mkLesson(71, 5, 12, { kind: 'practice', title: 'Операции над множествами', hook: 'union, intersection, difference — булева алгебра коллекций', terms: ['объединение', 'пересечение', 'разность', 'симметрическая разность'], newBlocks: ['объединить множества', 'пересечь множества', 'вычесть множество'], capstoneContribution: 'Фильтр монстров по нескольким тегам' }),
  mkLesson(72, 6, 12, { kind: 'project', title: 'Капстон M12: Pokedex', hook: 'Своя картотека 20 монстров со статами, фильтрами, поиском', terms: ['Pokedex', 'база данных', 'UI приложения'], newBlocks: ['поиск по полю', 'фильтр по тегам'], capstoneContribution: 'Полный рабочий Pokedex' }),
]

const M13: Lesson[] = [
  mkLesson(73, 1, 13, { kind: 'concept', title: 'Линейный поиск', hook: 'Перебор от начала до конца — O(n)', terms: ['линейный поиск', 'O(n)', 'сложность', 'перебор'], newBlocks: ['найти первый', 'найти все подходящие'], capstoneContribution: 'Поиск короля на доске 8×8' }),
  mkLesson(74, 2, 13, { kind: 'concept', title: 'Бинарный поиск', hook: 'Делим пополам — O(log n). Нужна сортировка!', terms: ['бинарный поиск', 'O(log n)', 'отсортированный список', 'делить пополам'], newBlocks: ['бинарный поиск в списке'], capstoneContribution: 'Быстрый поиск фигуры в отсортированном массиве' }),
  mkLesson(75, 3, 13, { kind: 'practice', title: 'Сортировка пузырьком', hook: 'Bubble sort: меняем соседей — понятно, но O(n²)', terms: ['bubble sort', 'swap', 'проходы', 'O(n²)'], newBlocks: ['пузырьковая сортировка', 'поменять местами'], capstoneContribution: 'Расстановка фигур по силе' }),
  mkLesson(76, 4, 13, { kind: 'practice', title: 'Selection sort и сравнение алгоритмов', hook: 'Selection sort и почему алгоритмы различаются по скорости', terms: ['selection sort', 'минимальный элемент', 'сравнение сложностей'], newBlocks: ['найти минимальный', 'переставить в начало'], capstoneContribution: 'Визуализация сортировки хода по ходу' }),
  mkLesson(77, 5, 13, { kind: 'practice', title: 'Big-O интуитивно', hook: 'О(1) / O(n) / O(n²) / O(log n) — когда что выбрать', terms: ['Big-O', 'константное время', 'линейное время', 'квадратичное'], newBlocks: ['измерить шаги алгоритма'], capstoneContribution: 'Профилировщик ходов в детективе' }),
  mkLesson(78, 6, 13, { kind: 'project', title: 'Капстон M13: Шахматный детектив', hook: 'Найти короля на доске 8×8, отсортировать фигуры, найти повторы', terms: ['детектив', 'поиск', 'дедукция'], newBlocks: ['сканировать доску', 'классифицировать фигуры'], capstoneContribution: 'Полный алгоритмический детектив' }),
]

const M14: Lesson[] = [
  mkLesson(79, 1, 14, { kind: 'concept', title: 'Что такое рекурсия', hook: 'Функция, которая вызывает саму себя. Base case — обязателен!', terms: ['рекурсия', 'базовый случай', 'рекурсивный случай', 'стек вызовов'], newBlocks: ['вызвать себя', 'если базовый случай'], capstoneContribution: 'Первый рекурсивный рисунок' }),
  mkLesson(80, 2, 14, { kind: 'practice', title: 'Классические рекурсивные задачи', hook: 'Факториал, числа Фибоначчи, сумма до N', terms: ['факториал', 'Фибоначчи', 'рекурсивная сумма'], newBlocks: ['факториал', 'фибоначчи'], capstoneContribution: 'Параметры фракталов через рекурсию' }),
  mkLesson(81, 3, 14, { kind: 'practice', title: 'Рекурсия и 3D-объекты', hook: 'Дерево из блоков через рекурсию — каждая ветка это рекурсивный вызов', terms: ['рекурсивная структура', 'глубина рекурсии', 'порождение'], newBlocks: ['нарисовать ветку', 'рекурсивное дерево'], capstoneContribution: 'Фрактальное дерево в 3D' }),
  mkLesson(82, 4, 14, { kind: 'practice', title: 'Фракталы: снежинка и пирамида', hook: 'Снежинка Коха и треугольник Серпинского — красота рекурсии', terms: ['фрактал', 'снежинка Коха', 'Серпинский', 'итерация'], newBlocks: ['нарисовать снежинку', 'нарисовать пирамиду Серпинского'], capstoneContribution: 'Снежинка + пирамида в мире фракталов' }),
  mkLesson(83, 5, 14, { kind: 'practice', title: 'Хвостовая рекурсия и оптимизация', hook: 'Tail recursion и почему стек может переполниться', terms: ['хвостовая рекурсия', 'переполнение стека', 'мемоизация'], newBlocks: ['мемоизированная функция', 'кэш результата'], capstoneContribution: 'Эффективные фракталы без вылета' }),
  mkLesson(84, 6, 14, { kind: 'project', title: 'Капстон M14: Мир фракталов', hook: 'Интерактивная демка 5 фракталов — дерево / снежинка / Серпинский / спираль / кустик', terms: ['интерактивный фрактал', 'параметры глубины', 'визуализация'], newBlocks: ['выбрать фрактал', 'задать глубину', 'перегенерировать'], capstoneContribution: 'Полная галерея из 5 фракталов' }),
]

const M15: Lesson[] = [
  mkLesson(85, 1, 15, { kind: 'concept', title: 'Что такое библиотека', hook: 'Набор функций, готовых к повторному использованию', terms: ['библиотека', 'модуль', 'API', 'импорт'], newBlocks: ['импортировать модуль', 'вызвать из библиотеки'], capstoneContribution: 'Структура моей библиотеки' }),
  mkLesson(86, 2, 15, { kind: 'concept', title: 'Параметры по умолчанию', hook: 'def func(x, color="red") — делает API удобнее', terms: ['параметр по умолчанию', 'опциональный аргумент', 'обязательный аргумент'], newBlocks: ['функция с умолчанием', 'опциональный параметр'], capstoneContribution: 'создать_врага(тип, hp=100)' }),
  mkLesson(87, 3, 15, { kind: 'practice', title: 'Проектирование API библиотеки', hook: 'Что должно быть в библиотеке? Именование. Документация.', terms: ['API-дизайн', 'именование', 'документация', 'контракт функции'], newBlocks: ['документировать функцию', 'блок документации'], capstoneContribution: 'Документация 5 функций библиотеки' }),
  mkLesson(88, 4, 15, { kind: 'practice', title: 'Тестирование библиотеки', hook: 'Как проверить что функция делает то что обещает', terms: ['тест', 'ожидаемый результат', 'крайний случай', 'покрытие'], newBlocks: ['утверждение', 'тестовый случай', 'проверить равенство'], capstoneContribution: 'Тесты для 5+ функций' }),
  mkLesson(89, 5, 15, { kind: 'practice', title: 'Поделиться библиотекой', hook: 'Экспорт, версионирование, share-ссылка на модуль', terms: ['шаринг', 'версия', 'зависимость', 'публикация'], newBlocks: ['экспортировать модуль', 'импортировать чужой'], capstoneContribution: 'Опубликованный модуль с версией v1.0' }),
  mkLesson(90, 6, 15, { kind: 'project', title: 'Капстон M15: Моя игровая библиотека', hook: '10+ задокументированных функций — создать_врага, спаун_волны, проверить_столкновение…', terms: ['игровая библиотека', 'геймдев-API', 'переиспользование'], newBlocks: ['создать_врага', 'спаун_волны', 'проверить_столкновение'], capstoneContribution: 'Полная геймдев-библиотека v1.0' }),
]

const M16: Lesson[] = [
  mkLesson(91, 1, 16, { kind: 'concept', title: 'Дизайн продукта', hook: 'Выбор категории, brief, целевая аудитория — чем продукт отличается от игры', terms: ['продукт', 'brief', 'целевая аудитория', 'категория'], newBlocks: ['описать продукт', 'задать ЦА'], capstoneContribution: 'Описание финального продукта' }),
  mkLesson(92, 2, 16, { kind: 'practice', title: 'Архитектура продукта', hook: 'Разбивка на модули, диаграмма, план функций, используем библиотеку из M15', terms: ['архитектура', 'модуль', 'диаграмма', 'зависимости'], newBlocks: ['блок-схема модулей', 'входные/выходные данные'], capstoneContribution: 'Карта модулей продукта' }),
  mkLesson(93, 3, 16, { kind: 'project', title: 'Sprint 1: core — главная функциональность', hook: 'MVP: главный цикл работает, данные сохраняются', terms: ['MVP', 'core loop', 'sprint', 'итерация'], newBlocks: ['главный цикл', 'сохранить состояние'], capstoneContribution: 'Рабочее ядро продукта' }),
  mkLesson(94, 4, 16, { kind: 'project', title: 'Sprint 2: features — обогащение', hook: 'Второстепенные функции, UI, звук, эффекты по плану из L92', terms: ['feature', 'UI', 'polish', 'итеративная разработка'], newBlocks: ['добавить меню', 'настройки продукта'], capstoneContribution: 'Продукт с полным feature-set' }),
  mkLesson(95, 5, 16, { kind: 'practice', title: 'Полировка и доступность', hook: 'UX-детали, большой текст, цвет-контраст, звук — для всех', terms: ['полировка', 'UX', 'accessibility', 'контраст'], newBlocks: ['проверить читаемость', 'добавить звук'], capstoneContribution: 'Продукт пригоден к реальному использованию' }),
  mkLesson(96, 6, 16, { kind: 'defense', title: 'Релиз + Защита Y2', hook: 'Публикуй в KubiK Hub и защити перед комиссией — ты настоящий разработчик!', terms: ['релиз', 'защита', 'портфолио', 'сертификат'], newBlocks: ['опубликовать продукт', 'создать портфолио'], capstoneContribution: 'Готовый продукт + защита = Сертификат Y2' }),
]

const Y2_MODULES: Module[] = [
  { n: 9,  title: 'Глубже в данные и выражения', story: 'Ты учёный-исследователь. Первая лаборатория — типы данных.', emoji: '🔬', accent: '#6B5CE7', ageAnchor: '11-14', capstone: { name: 'Калькулятор-тренажёр', genre: 'Приложение' }, lessons: M9 },
  { n: 10, title: 'Сложные циклы и итерация',     story: 'Лаборатория циклов: while, break, вложенные, аккумуляторы.', emoji: '🔁', accent: '#FF9454', ageAnchor: '11-14', capstone: { name: '2D-генератор карт', genre: 'Процедурная генерация' }, lessons: M10 },
  { n: 11, title: 'Списки как структура данных',   story: 'Коллекции — основа любой программы. Списки во всех деталях.', emoji: '📋', accent: '#9FE8C7', ageAnchor: '11-14', capstone: { name: 'Лидерборд', genre: 'Утилита' }, lessons: M11 },
  { n: 12, title: 'Словари и ключевые структуры',  story: 'key → value: ты строишь свою первую базу данных.', emoji: '🗝', accent: '#FFD43C', ageAnchor: '12-15', capstone: { name: 'Pokedex', genre: 'База данных' }, lessons: M12 },
  { n: 13, title: 'Алгоритмы: поиск и сортировка', story: 'Скорость имеет значение. Детектив ищет оптимальный путь.', emoji: '🧠', accent: '#FFB4C8', ageAnchor: '12-15', capstone: { name: 'Шахматный детектив', genre: 'Головоломка' }, lessons: M13 },
  { n: 14, title: 'Рекурсия',                      story: 'Функция, которая вызывает себя. Фракталы раскрывают магию.', emoji: '🪆', accent: '#A9D8FF', ageAnchor: '13-15', capstone: { name: 'Мир фракталов', genre: 'Визуализация' }, lessons: M14 },
  { n: 15, title: 'Библиотеки и модульность',       story: 'Ты пишешь не игру — ты пишешь инструмент для других.', emoji: '📚', accent: '#6B5CE7', ageAnchor: '13-15', capstone: { name: 'Моя игровая библиотека', genre: 'Библиотека' }, lessons: M15 },
  { n: 16, title: 'Финальный проект Y2 — продукт',  story: 'Настоящий sprint. Настоящий релиз. Настоящий сертификат.', emoji: '🚀', accent: '#FFD43C', ageAnchor: '13-16', capstone: { name: 'Авторский продукт', genre: 'Любой' }, lessons: M16 },
]

/** Второй год обучения — алгоритмический стек (M9-M16, L49-96) */
export const KUBIK_Y2_COURSE: Course = {
  slug: 'kubik-y2',
  title: 'Эдюсон Kids · Алгоритмы и структуры данных',
  subtitle: '48 уроков: алгоритмы, структуры данных, рекурсия, библиотеки — Year 2',
  emoji: '🔬',
  accent: '#FF9454',
  ageRange: '11-16',
  lessonDurationMin: 45,
  totalLessons: 48,
  modules: Y2_MODULES,
  source: 'builtin',
}

// ═══════════════════════════════════════════════════════════
// Multi-course registry — LXP уровень
// ═══════════════════════════════════════════════════════════

/** Основной built-in курс Эдюсон Kids (3D + блочное программирование) */
export const KUBIK_COURSE: Course = {
  slug: 'kubik',
  title: 'Эдюсон Kids · 3D Программирование',
  subtitle: '48 блочных уроков с переходом на Python: создаём 3D-миры и игры',
  emoji: '🧱',
  accent: '#6B5CE7',
  ageRange: '9-15',
  lessonDurationMin: 45,
  totalLessons: 48,
  modules: MODULES,
  source: 'builtin',
}

/**
 * Ingested-курсы сгенерированы из `products/` и имеют абсолютные пути вида
 * `/courses/python-ai/lesson_01.html`. На GitHub Pages реальный корень —
 * `/eduson-kids-web/`, поэтому префиксим PUBLIC_BASE при импорте. Генератор
 * (`scripts/ingest-courses.mjs`) остаётся naïve — единая нормализация здесь.
 */
function prefixPublicPath(p: string | undefined): string | undefined {
  if (!p) return p
  if (/^https?:\/\//.test(p)) return p
  if (PUBLIC_BASE && p.startsWith(PUBLIC_BASE + '/')) return p
  if (p.startsWith('/')) return PUBLIC_BASE + p
  return p
}

const INGESTED_COURSES: Course[] = RAW_INGESTED_COURSES.map((c) => {
  const course = { ...c }
  const pf = prefixPublicPath(c.programFile)
  if (pf !== undefined) course.programFile = pf
  course.modules = c.modules.map((m) => {
    return {
      ...m,
      lessons: m.lessons.map((l) => {
        const lesson = { ...l }
        const hf = prefixPublicPath(l.htmlFile)
        const gf = prefixPublicPath(l.guideFile)
        if (hf !== undefined) lesson.htmlFile = hf
        if (gf !== undefined) lesson.guideFile = gf
        return lesson
      }),
    }
  })
  return course
})

/** Все курсы платформы — builtin + ingested из products/ */
export const COURSES: Course[] = [KUBIK_COURSE, KUBIK_Y2_COURSE, ...INGESTED_COURSES]

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug)
}

/**
 * Получить все уроки курса плоским списком.
 * По умолчанию — Эдюсон Kids (для обратной совместимости со старыми страницами).
 */
export function getAllLessonsOf(course: Course = KUBIK_COURSE): Lesson[] {
  return course.modules.flatMap((m) => m.lessons)
}
