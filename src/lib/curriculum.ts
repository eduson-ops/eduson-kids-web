/**
 * Curriculum data — single source of truth для 48-урочного
 * годового курса KubiK (blocks-only).
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

// ─── M1 · Первые шаги в KubiK ──────────────────────────────────
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
        text: 'Сколько вкладок в Студии KubiK?',
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
    hook: 'Презентуй свой Obby классу. 2 мин на игрока.',
    terms: ['защита', 'рубрика', 'рефлексия'],
    newBlocks: [],
    capstoneContribution: '✅ Капстон M1: готовый Obby-платформер',
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
        options: ['0', '1 — Obby', '3', '5'],
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
    title: 'Проектный урок: Pet Math Sim',
    hook: 'Питомник с 3 редкостями монет и HUD-счётом.',
    terms: ['playtest', 'баланс'],
    newBlocks: [],
    capstoneContribution: 'готовая Pet Math Sim',
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
    capstoneContribution: '✅ Капстон M3: Pet Math Sim',
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
    title: 'Проектный урок: Tower of Code',
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
    capstoneContribution: '✅ Капстон M4: Tower of Code',
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
    title: 'Проектный урок: Pet Brain',
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
    capstoneContribution: '✅ Капстон M5: Pet Brain',
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
    hook: 'Берём старый Obby из M1 — сокращаем в 3 раза.',
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
    title: 'Демо-день: защита + публикация на KubiK Hub',
    hook: '2-минутная защита. Публикация. Сертификат об окончании курса.',
    terms: ['публикация', 'рефлексия', 'портфолио'],
    newBlocks: [],
    capstoneContribution: '✅ Собственная игра на Hub + сертификат',
  },
]

export const MODULES: Module[] = [
  {
    n: 1, title: 'Первые шаги в KubiK', emoji: '🧱', accent: '#6B5CE7', ageAnchor: '9-11',
    story: 'Ты попал на остров KubiK — всё построено из блоков. Собери свой первый мир.',
    capstone: { name: 'Моя первая игра', genre: 'Obby', worldId: 'obby-rainbow' },
    lessons: M1,
  },
  {
    n: 2, title: 'Движение и события', emoji: '🎮', accent: '#A9D8FF', ageAnchor: '9-12',
    story: 'Твой герой устал ходить. Построй гоночный трек с чекпоинтами.',
    capstone: { name: 'Гонка с препятствиями', genre: 'Race' },
    lessons: M2,
  },
  {
    n: 3, title: 'Переменные и счёт', emoji: '💰', accent: '#9FE8C7', ageAnchor: '10-13',
    story: 'Открылся питомник: чем больше монет, тем сильнее питомцы.',
    capstone: { name: 'Pet Math Sim', genre: 'Idle Collector', worldId: 'pet-math-sim' },
    lessons: M3,
  },
  {
    n: 4, title: 'Повторы — цикл', emoji: '🔁', accent: '#FFD43C', ageAnchor: '11-14',
    story: '100 этажей башни. Писать руками скучно — напиши цикл.',
    capstone: { name: 'Tower of Code', genre: 'Procedural Tower', worldId: 'tower-of-code' },
    lessons: M4,
  },
  {
    n: 5, title: 'Условия и логика', emoji: '🧠', accent: '#FFB4C8', ageAnchor: '11-14',
    story: 'Твоему питомцу нужен разум. Научи его думать — if/elif/else.',
    capstone: { name: 'Pet Brain (Adopt Me AI)', genre: 'Simulation', worldId: 'pet-brain' },
    lessons: M5,
  },
  {
    n: 6, title: 'Скрипты объектов', emoji: '📜', accent: '#FF9454', ageAnchor: '12-15',
    story: 'Каждый объект — свой характер. Детективный особняк с NPC и уликами.',
    capstone: { name: 'Детектив в Особняке', genre: 'Mystery', worldId: 'detective-mansion' },
    lessons: M6,
  },
  {
    n: 7, title: 'Функции и DRY', emoji: '⚡', accent: '#c879ff', ageAnchor: '12-15',
    story: 'Мастерская магов. Собираешь свои заклинания как функции.',
    capstone: { name: 'Моя мини-библиотека', genre: 'Library', worldId: 'ability-builder' },
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
    const primary = lesson.terms[0]
    const distractors = lesson.terms.slice(1, 4)
    // Если дистракторов мало — добавляем «обманки» из универсального пула
    const pool = ['функция', 'цикл', 'переменная', 'событие', 'массив', 'сравнение', 'условие']
    while (distractors.length < 3) {
      const d = pool.find((p) => p !== primary && !distractors.includes(p))
      if (d) distractors.push(d)
      else break
    }
    const options = [primary, ...distractors].sort(() => 0.5 - Math.random())
    out.push({
      text: `Какое главное слово сегодняшнего урока «${lesson.title}»?`,
      options,
      correctIdx: options.indexOf(primary),
      explanation: `${primary} — ключевой термин этого урока.`,
    })
  }

  // Q2: block introduction (если вводились новые блоки)
  if (lesson.newBlocks.length > 0) {
    const block = lesson.newBlocks[0]
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

  return out.slice(0, 2)   // максимум 2 вопроса в автофоллбэке
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
