// Tренажёры-пазлы в стиле chess.com puzzles.
// 5 тем по 10 задач. Каждая задача решается в Блоках (Blockly) или Python.

// Story slide shown as a full-screen overlay before a puzzle
export interface StorySlide {
  chapter: string   // e.g. "Глава 1"
  emoji: string
  title: string
  text: string
}

export type CheckKind =
  | { kind: 'reach-goal'; goalX: number; goalZ: number; startX?: number; startZ?: number }
  | {
      kind: 'build-pattern'
      expectedBlocks: Array<{ x: number; y: number; z: number; color?: string }>
      strictColor?: boolean
    }
  | {
      kind: 'exact-commands'
      ops: string[]
      minCount?: number
      maxCount?: number
    }
  | { kind: 'output-match'; expected: string | string[]; mode?: 'exact' | 'includes' }
  | {
      kind: 'uses-feature'
      required: Array<'for' | 'if' | 'def' | 'range' | 'while' | 'call3'>
    }

export interface PuzzleTask {
  id: string
  trainerId: TrainerId
  n: number
  title: string
  prompt: string
  hints: string[]
  starterBlocks?: string
  starterPython?: string
  check: CheckKind
  maxBlocks?: number
  reward: { coins: number; xp: number }
  beforeSlide?: StorySlide
}

export type TrainerId = 'path' | 'tower' | 'loop' | 'if' | 'function' | 'detective'

export interface Trainer {
  id: TrainerId
  emoji: string
  title: string
  tagline: string
  description: string
  color: string
  puzzles: PuzzleTask[]
}

// ─── XML helpers для стартеров Blockly ─────────────────────────────
const ON_START_EMPTY = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_on_start" deletable="false" x="40" y="40"></block>
</xml>`

export const fwdXml = (steps: number) =>
  `<block type="ek_move_forward"><field name="STEPS">${steps}</field></block>`

// ─── Содержимое задач ──────────────────────────────────────────────
// Маршрут — двигай пингвина из старта (0,0) в цель. Одна клетка = 1 шаг.
// move_forward двигает по -Z, turn_left/turn_right поворачивают.
const pathPuzzles: PuzzleTask[] = [
  {
    id: 'path-1',
    trainerId: 'path',
    n: 1,
    title: 'Первый шаг',
    prompt: 'Дойди до цветка на 1 клетке впереди. Один блок «идти вперёд» — и готово!',
    hints: [
      'Найди блок «идти вперёд» в категории «Движение».',
      'Поставь его внутрь «при запуске».',
      'Достаточно одного шага: move_forward(1).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(1)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: -1 },
    maxBlocks: 2,
    reward: { coins: 5, xp: 10 },
  },
  {
    id: 'path-2',
    trainerId: 'path',
    n: 2,
    title: 'Три клетки',
    prompt: 'Пройди три клетки вперёд. Можно тремя блоками — или одним с числом.',
    hints: [
      'Три «идти вперёд» подряд — это 3 клетки.',
      'Лучше — один блок «идти вперёд 3 шагов».',
      'В Python: move_forward(3).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(3)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: -3 },
    maxBlocks: 4,
    reward: { coins: 5, xp: 10 },
  },
  {
    id: 'path-3',
    trainerId: 'path',
    n: 3,
    title: 'Поворот направо',
    prompt: 'Дойди до цели: 2 клетки вперёд, поверни направо, ещё 2 клетки.',
    hints: [
      'После 2 шагов вперёд используй «повернуть направо».',
      'Потом снова «идти вперёд» на 2.',
      'move_forward(2); turn_right(); move_forward(2).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(2)\nturn_right()\nmove_forward(2)\n',
    check: { kind: 'reach-goal', goalX: 2, goalZ: -2 },
    maxBlocks: 5,
    reward: { coins: 7, xp: 12 },
  },
  {
    id: 'path-4',
    trainerId: 'path',
    n: 4,
    title: 'Поворот налево',
    prompt: 'Дойди до цели слева впереди: 3 вперёд, налево, 2 вперёд.',
    hints: [
      'Налево — это turn_left().',
      'После поворота налево «вперёд» пойдёт в −X.',
      'move_forward(3); turn_left(); move_forward(2).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(3)\nturn_left()\nmove_forward(2)\n',
    check: { kind: 'reach-goal', goalX: -2, goalZ: -3 },
    maxBlocks: 5,
    reward: { coins: 7, xp: 12 },
  },
  {
    id: 'path-5',
    trainerId: 'path',
    n: 5,
    title: 'Зигзаг',
    prompt: 'Пройди зигзагом до (2, −4): вперёд 2, направо 2, налево 2, и ещё 2 вперёд.',
    hints: [
      'Следи за углом: после right-left ты снова смотришь по −Z.',
      'Двигайся небольшими шагами — по 2 клетки.',
      'move_forward(2); turn_right(); move_forward(2); turn_left(); move_forward(2).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'move_forward(2)\nturn_right()\nmove_forward(2)\nturn_left()\nmove_forward(2)\n',
    check: { kind: 'reach-goal', goalX: 2, goalZ: -4 },
    maxBlocks: 8,
    reward: { coins: 10, xp: 15 },
  },
  {
    id: 'path-6',
    trainerId: 'path',
    n: 6,
    title: 'Разворот',
    prompt:
      'Сначала сходи на 3 клетки вперёд, потом развернись кругом и вернись в старт (0, 0).',
    hints: [
      'Развернуться кругом — это два поворота направо подряд.',
      'После разворота ты смотришь по +Z и move_forward уменьшает дистанцию.',
      'move_forward(3); turn_right(); turn_right(); move_forward(3).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'move_forward(3)\nturn_right()\nturn_right()\nmove_forward(3)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: 0 },
    maxBlocks: 6,
    reward: { coins: 10, xp: 15 },
  },
  {
    id: 'path-7',
    trainerId: 'path',
    n: 7,
    title: 'Квадрат по периметру',
    prompt:
      'Обойди по периметру квадрат 3×3: вперёд 3, направо, вперёд 3, направо, вперёд 3, направо, вперёд 3. Придёшь в (0,0).',
    hints: [
      'Четыре одинаковых шага: идти 3 и повернуть направо.',
      'Используй цикл «повторить 4 раза» чтобы не копировать.',
      'for _ in range(4): move_forward(3); turn_right().',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for _ in range(4):\n    move_forward(3)\n    turn_right()\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: 0 },
    maxBlocks: 10,
    reward: { coins: 12, xp: 18 },
  },
  {
    id: 'path-8',
    trainerId: 'path',
    n: 8,
    title: 'Длинная дорога',
    prompt: 'Дойди до дальней цели (0, −10). Попробуй сделать это одним блоком.',
    hints: [
      'Число шагов может быть любым в пределах 50.',
      'Не обязательно по одному — одним блоком «идти вперёд 10 шагов».',
      'move_forward(10).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(10)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: -10 },
    maxBlocks: 2,
    reward: { coins: 8, xp: 12 },
  },
  {
    id: 'path-9',
    trainerId: 'path',
    n: 9,
    title: 'Ступеньки',
    prompt: 'Пройди ступеньками до (3, −6). Каждая ступенька: 2 вперёд и 1 направо.',
    hints: [
      'Повторяй пару «вперёд 2, направо 1» 3 раза.',
      'После «направо 1» снова поверни налево чтобы смотреть по −Z.',
      'Эффективно — цикл на 3 повтора с 4 действиями внутри.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for _ in range(3):\n    move_forward(2)\n    turn_right()\n    move_forward(1)\n    turn_left()\n',
    check: { kind: 'reach-goal', goalX: 3, goalZ: -6 },
    maxBlocks: 12,
    reward: { coins: 15, xp: 20 },
  },
  {
    id: 'path-10',
    trainerId: 'path',
    n: 10,
    title: 'Лабиринт-кольцо',
    prompt:
      'Цель — (−3, −3). Обойди невидимую стену: вперёд 5, налево 3, налево 2, направо и ещё 1.',
    hints: [
      'Разбей задачу: сначала продвинься по −Z, потом сверни налево дважды.',
      'После первого налево «вперёд» идёт по −X.',
      'move_forward(5); turn_left(); move_forward(3); turn_left(); move_forward(2); turn_right(); move_forward(1).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'move_forward(5)\nturn_left()\nmove_forward(3)\nturn_left()\nmove_forward(2)\nturn_right()\nmove_forward(1)\n',
    check: { kind: 'reach-goal', goalX: -3, goalZ: -3 },
    maxBlocks: 14,
    reward: { coins: 20, xp: 25 },
  },
]

// ─── Башня — place_block с цветами ────────────────────────────────
const buildPattern = (
  coords: Array<[number, number, number]>,
  color = 'red',
): Array<{ x: number; y: number; z: number; color: string }> =>
  coords.map(([x, y, z]) => ({ x, y, z, color }))

const towerPuzzles: PuzzleTask[] = [
  {
    id: 'tower-1',
    trainerId: 'tower',
    n: 1,
    title: 'Один блок',
    prompt: 'Поставь один красный блок под ногами (в (0, 0, 0)).',
    hints: [
      'Блок «поставить блок» в категории «Мир».',
      'По умолчанию цвет — красный.',
      'place_block(0, 0, 0, "red").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'place_block(0, 0, 0, "red")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern([[0, 0, 0]], 'red'),
    },
    maxBlocks: 2,
    reward: { coins: 5, xp: 10 },
  },
  {
    id: 'tower-2',
    trainerId: 'tower',
    n: 2,
    title: 'Ряд из трёх',
    prompt: 'Поставь ряд из 3 синих блоков по оси X: (0,0,0), (1,0,0), (2,0,0).',
    hints: [
      'Три place_block подряд, у каждого x = 0, 1, 2.',
      'Цвет — "blue".',
      'Можно использовать line(3, 0, 0, "blue").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'place_block(0, 0, 0, "blue")\nplace_block(1, 0, 0, "blue")\nplace_block(2, 0, 0, "blue")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern([[0, 0, 0], [1, 0, 0], [2, 0, 0]], 'blue'),
    },
    maxBlocks: 4,
    reward: { coins: 7, xp: 12 },
  },
  {
    id: 'tower-3',
    trainerId: 'tower',
    n: 3,
    title: 'Башенка 3',
    prompt: 'Построй вертикальную башню из 3 зелёных блоков в точке (0, 0..2, 0).',
    hints: [
      'Меняй Y, а не X/Z — тогда блоки идут вверх.',
      'Y = 0, 1, 2.',
      'for y in range(3): place_block(0, y, 0, "green").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for y in range(3):\n    place_block(0, y, 0, "green")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern([[0, 0, 0], [0, 1, 0], [0, 2, 0]], 'green'),
    },
    maxBlocks: 5,
    reward: { coins: 8, xp: 14 },
  },
  {
    id: 'tower-4',
    trainerId: 'tower',
    n: 4,
    title: 'Квадрат 3×3',
    prompt: 'Выложи квадратную плиту 3×3 из жёлтых блоков на земле (y=0).',
    hints: [
      'Это двойной цикл: for i и for j.',
      'Координаты x=0..2, z=0..2, y=0.',
      'square(3, 0, 0, "yellow") тоже решает.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(3):\n    for j in range(3):\n        place_block(i, 0, j, "yellow")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern(
        [
          [0, 0, 0], [1, 0, 0], [2, 0, 0],
          [0, 0, 1], [1, 0, 1], [2, 0, 1],
          [0, 0, 2], [1, 0, 2], [2, 0, 2],
        ],
        'yellow',
      ),
    },
    maxBlocks: 10,
    reward: { coins: 12, xp: 18 },
  },
  {
    id: 'tower-5',
    trainerId: 'tower',
    n: 5,
    title: 'Квадрат красный',
    prompt: 'Построй квадрат 3×3 из красных блоков — тренируем вложенный for.',
    hints: [
      'Не копируй 9 блоков! Используй цикл в цикле.',
      'Цвет "red", y = 0.',
      'for i in range(3): for j in range(3): place_block(i, 0, j, "red").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(3):\n    for j in range(3):\n        place_block(i, 0, j, "red")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern(
        [
          [0, 0, 0], [1, 0, 0], [2, 0, 0],
          [0, 0, 1], [1, 0, 1], [2, 0, 1],
          [0, 0, 2], [1, 0, 2], [2, 0, 2],
        ],
        'red',
      ),
    },
    maxBlocks: 10,
    reward: { coins: 12, xp: 18 },
  },
  {
    id: 'tower-6',
    trainerId: 'tower',
    n: 6,
    title: 'Лестница из 4',
    prompt: 'Построй лестницу: (0,0,0), (1,1,0), (2,2,0), (3,3,0) — синие.',
    hints: [
      'Каждая ступенька на 1 выше и на 1 дальше.',
      'x и y одинаковые у каждой ступеньки.',
      'for i in range(4): place_block(i, i, 0, "blue").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(4):\n    place_block(i, i, 0, "blue")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern(
        [[0, 0, 0], [1, 1, 0], [2, 2, 0], [3, 3, 0]],
        'blue',
      ),
    },
    maxBlocks: 6,
    reward: { coins: 14, xp: 20 },
  },
  {
    id: 'tower-7',
    trainerId: 'tower',
    n: 7,
    title: 'Две башни',
    prompt: 'Построй две башни из 3 блоков: одну в (0,y,0) красную, вторую в (3,y,0) жёлтую.',
    hints: [
      'Сделай две функции: tower(3, 0, 0, "red") и tower(3, 3, 0, "yellow").',
      'Или два цикла по очереди.',
      'for y in range(3): place_block(0,y,0,"red"); place_block(3,y,0,"yellow").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for y in range(3):\n    place_block(0, y, 0, "red")\n    place_block(3, y, 0, "yellow")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: [
        ...buildPattern([[0, 0, 0], [0, 1, 0], [0, 2, 0]], 'red'),
        ...buildPattern([[3, 0, 0], [3, 1, 0], [3, 2, 0]], 'yellow'),
      ],
    },
    maxBlocks: 10,
    reward: { coins: 15, xp: 22 },
  },
  {
    id: 'tower-8',
    trainerId: 'tower',
    n: 8,
    title: 'Рамка 3×3',
    prompt:
      'Построй квадратную рамку 3×3 из зелёных блоков — только по периметру, середина пуста.',
    hints: [
      'Внутри двойного for используй if: клади блок если на краю.',
      'Условие: i == 0 or i == 2 or j == 0 or j == 2.',
      'Или сделай 4 прямые границы линиями.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(3):\n    for j in range(3):\n        if i == 0 or i == 2 or j == 0 or j == 2:\n            place_block(i, 0, j, "green")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: buildPattern(
        [
          [0, 0, 0], [1, 0, 0], [2, 0, 0],
          [0, 0, 1], [2, 0, 1],
          [0, 0, 2], [1, 0, 2], [2, 0, 2],
        ],
        'green',
      ),
    },
    maxBlocks: 12,
    reward: { coins: 18, xp: 24 },
  },
  {
    id: 'tower-9',
    trainerId: 'tower',
    n: 9,
    title: 'Пирамида 3',
    prompt:
      'Построй пирамиду: нижний этаж 3×3 синий, средний 2×2 жёлтый, верхний 1 красный (по центру).',
    hints: [
      'Три вложенных цикла — по одному на этаж.',
      'Y=0 → 3×3, Y=1 → 2×2, Y=2 → 1×1.',
      'Посмотри на square() в справке — он строит квадратную плиту.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(3):\n    for j in range(3):\n        place_block(i, 0, j, "blue")\nfor i in range(2):\n    for j in range(2):\n        place_block(i, 1, j, "yellow")\nplace_block(0, 2, 0, "red")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: [
        ...buildPattern(
          [
            [0, 0, 0], [1, 0, 0], [2, 0, 0],
            [0, 0, 1], [1, 0, 1], [2, 0, 1],
            [0, 0, 2], [1, 0, 2], [2, 0, 2],
          ],
          'blue',
        ),
        ...buildPattern(
          [[0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 1, 1]],
          'yellow',
        ),
        ...buildPattern([[0, 2, 0]], 'red'),
      ],
    },
    maxBlocks: 16,
    reward: { coins: 25, xp: 30 },
  },
  {
    id: 'tower-10',
    trainerId: 'tower',
    n: 10,
    title: 'Башня-пирамида 5',
    prompt:
      'Построй пирамиду 5×5 → 3×3 → 1×1 синего цвета. Подсказка: сдвигай основание, чтобы каждый этаж был по центру.',
    hints: [
      'Три слоя: y=0 → 5×5, y=1 → 3×3 (сдвиг +1), y=2 → 1×1 (сдвиг +2).',
      'Двойной for для каждого этажа.',
      'Можешь написать функцию square(sz, ox, oy): for i,j in range(sz): place_block(i+ox, oy, j+ox, "blue").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def layer(size, y, off):\n    for i in range(size):\n        for j in range(size):\n            place_block(i+off, y, j+off, "blue")\nlayer(5, 0, 0)\nlayer(3, 1, 1)\nlayer(1, 2, 2)\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: [
        // 5x5
        ...buildPattern(
          Array.from({ length: 5 }, (_, i) =>
            Array.from({ length: 5 }, (_, j) => [i, 0, j] as [number, number, number]),
          ).flat(),
          'blue',
        ),
        // 3x3 offset +1
        ...buildPattern(
          Array.from({ length: 3 }, (_, i) =>
            Array.from({ length: 3 }, (_, j) => [i + 1, 1, j + 1] as [number, number, number]),
          ).flat(),
          'blue',
        ),
        // 1x1 offset +2
        ...buildPattern([[2, 2, 2]], 'blue'),
      ],
    },
    maxBlocks: 20,
    reward: { coins: 30, xp: 35 },
  },
]

// ─── Цикл — print() N раз, for-range ────────────────────────────────
const loopPuzzles: PuzzleTask[] = [
  {
    id: 'loop-1',
    trainerId: 'loop',
    n: 1,
    title: 'Первый print',
    prompt: 'Напечатай строку «Привет!» в консоль.',
    hints: [
      'Используй print в категории «Текст».',
      'Аргумент — строка «Привет!».',
      'print("Привет!")',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'print("Привет!")\n',
    check: { kind: 'output-match', expected: ['Привет!'] },
    reward: { coins: 5, xp: 10 },
  },
  {
    id: 'loop-2',
    trainerId: 'loop',
    n: 2,
    title: 'Три раза',
    prompt: 'Напечатай «Ок» три раза. Решается циклом.',
    hints: [
      'Используй цикл for i in range(3).',
      'Внутри — print("Ок").',
      'for i in range(3): print("Ок")',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(3):\n    print("Ок")\n',
    check: { kind: 'output-match', expected: ['Ок', 'Ок', 'Ок'] },
    reward: { coins: 7, xp: 12 },
  },
  {
    id: 'loop-3',
    trainerId: 'loop',
    n: 3,
    title: 'Пять раз «Привет!»',
    prompt: 'Напечатай «Привет!» пять раз. Только одним циклом — без копипасты.',
    hints: [
      'Цикл — это обязательно. Проверка убедится в наличии range.',
      'for i in range(5).',
      'Внутри — print("Привет!").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(5):\n    print("Привет!")\n',
    check: {
      kind: 'output-match',
      expected: ['Привет!', 'Привет!', 'Привет!', 'Привет!', 'Привет!'],
    },
    reward: { coins: 8, xp: 14 },
  },
  {
    id: 'loop-4',
    trainerId: 'loop',
    n: 4,
    title: 'Числа от 0 до 4',
    prompt: 'Напечатай числа от 0 до 4 (включительно), каждое на своей строке.',
    hints: [
      'range(5) даёт 0, 1, 2, 3, 4.',
      'print(i) — внутри цикла.',
      'for i in range(5): print(i)',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(5):\n    print(i)\n',
    check: { kind: 'output-match', expected: ['0', '1', '2', '3', '4'] },
    reward: { coins: 10, xp: 15 },
  },
  {
    id: 'loop-5',
    trainerId: 'loop',
    n: 5,
    title: 'Обратный отсчёт',
    prompt: 'Напечатай от 5 до 1 — по одному числу на строку.',
    hints: [
      'range(5, 0, -1) — считает назад.',
      'Или for i in range(5): print(5 - i).',
      'Или вручную 5 принтов: сначала 5, потом 4, 3, 2, 1.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(5, 0, -1):\n    print(i)\n',
    check: { kind: 'output-match', expected: ['5', '4', '3', '2', '1'] },
    reward: { coins: 12, xp: 18 },
  },
  {
    id: 'loop-6',
    trainerId: 'loop',
    n: 6,
    title: 'Сумма до 10',
    prompt: 'Посчитай сумму чисел от 1 до 10 и напечатай её. Должно получиться 55.',
    hints: [
      'Заведи переменную total = 0.',
      'В цикле прибавляй i: total = total + i.',
      'В конце print(total).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'total = 0\nfor i in range(1, 11):\n    total = total + i\nprint(total)\n',
    check: { kind: 'output-match', expected: ['55'] },
    reward: { coins: 15, xp: 20 },
  },
  {
    id: 'loop-7',
    trainerId: 'loop',
    n: 7,
    title: 'Чётные числа',
    prompt: 'Напечатай первые 5 чётных чисел: 0, 2, 4, 6, 8.',
    hints: [
      'range(0, 10, 2) идёт с шагом 2.',
      'Или for i in range(5): print(i*2).',
      'Главное — 5 значений.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(0, 10, 2):\n    print(i)\n',
    check: { kind: 'output-match', expected: ['0', '2', '4', '6', '8'] },
    reward: { coins: 15, xp: 20 },
  },
  {
    id: 'loop-8',
    trainerId: 'loop',
    n: 8,
    title: 'Таблица умножения',
    prompt: 'Напечатай таблицу умножения на 3: 3, 6, 9, 12, 15.',
    hints: [
      'for i in range(1, 6): print(i*3).',
      'Индекс 1..5, умножение на 3.',
      'Пять строк подряд.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(1, 6):\n    print(i * 3)\n',
    check: { kind: 'output-match', expected: ['3', '6', '9', '12', '15'] },
    reward: { coins: 18, xp: 22 },
  },
  {
    id: 'loop-9',
    trainerId: 'loop',
    n: 9,
    title: 'Ёлочка',
    prompt:
      'Напечатай «ёлочку» — звёздочками: строка 1 — «*», строка 2 — «**», строка 3 — «***», строка 4 — «****».',
    hints: [
      'В цикле for i in range(1, 5): делай строку из i звёздочек.',
      '"*" * i даёт повтор символа.',
      'print("*" * i).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(1, 5):\n    print("*" * i)\n',
    check: { kind: 'output-match', expected: ['*', '**', '***', '****'] },
    reward: { coins: 20, xp: 25 },
  },
  {
    id: 'loop-10',
    trainerId: 'loop',
    n: 10,
    title: 'Цикл в цикле',
    prompt:
      'Напечатай таблицу 3×3 умножения (1*1 .. 3*3): 9 строк вида «1 x 1 = 1», «1 x 2 = 2», … , «3 x 3 = 9».',
    hints: [
      'Нужны два цикла один внутри другого.',
      'for i in range(1,4): for j in range(1,4): print(f"{i} x {j} = {i*j}").',
      'Итого 9 строк.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i} x {j} = {i*j}")\n',
    check: {
      kind: 'output-match',
      expected: [
        '1 x 1 = 1', '1 x 2 = 2', '1 x 3 = 3',
        '2 x 1 = 2', '2 x 2 = 4', '2 x 3 = 6',
        '3 x 1 = 3', '3 x 2 = 6', '3 x 3 = 9',
      ],
    },
    reward: { coins: 25, xp: 30 },
  },
]

// ─── Условие — if/else на print/количество шагов ──────────────────
const ifPuzzles: PuzzleTask[] = [
  {
    id: 'if-1',
    trainerId: 'if',
    n: 1,
    title: 'Первое условие',
    prompt:
      'Заведи переменную x=10. Если x больше 5 — напечатай «Большое». Иначе ничего.',
    hints: [
      'if x > 5: ... — выполнится только если условие верно.',
      'Переменной присваивают равно: x = 10.',
      'Внутри if — print("Большое").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'x = 10\nif x > 5:\n    print("Большое")\n',
    check: { kind: 'output-match', expected: ['Большое'] },
    reward: { coins: 8, xp: 12 },
  },
  {
    id: 'if-2',
    trainerId: 'if',
    n: 2,
    title: 'Либо больше, либо меньше',
    prompt:
      'x=3. Если x > 5 — напечатай «Большое», иначе — «Маленькое».',
    hints: [
      'if / else — вместе.',
      'if x > 5: ... else: ...',
      'В else — print("Маленькое").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = 3\nif x > 5:\n    print("Большое")\nelse:\n    print("Маленькое")\n',
    check: {
      kind: 'output-match',
      expected: ['Маленькое'],
    },
    reward: { coins: 10, xp: 14 },
  },
  {
    id: 'if-3',
    trainerId: 'if',
    n: 3,
    title: 'Чётное или нечётное',
    prompt: 'x=7. Напечатай «чётное» если x%2==0, иначе «нечётное».',
    hints: [
      'Остаток от деления — оператор %.',
      'if x % 2 == 0: print("чётное") else: print("нечётное").',
      'Для 7 ответ — «нечётное».',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = 7\nif x % 2 == 0:\n    print("чётное")\nelse:\n    print("нечётное")\n',
    check: { kind: 'output-match', expected: ['нечётное'] },
    reward: { coins: 12, xp: 16 },
  },
  {
    id: 'if-4',
    trainerId: 'if',
    n: 4,
    title: 'Цикл + условие',
    prompt:
      'Для чисел 1..6 напечатай «да» если число чётное, иначе «нет». Всего 6 строк.',
    hints: [
      'Цикл и условие внутри.',
      'for i in range(1,7): if i % 2 == 0: print("да") else: print("нет").',
      'Ожидаемый ответ: нет, да, нет, да, нет, да.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(1, 7):\n    if i % 2 == 0:\n        print("да")\n    else:\n        print("нет")\n',
    check: {
      kind: 'output-match',
      expected: ['нет', 'да', 'нет', 'да', 'нет', 'да'],
    },
    reward: { coins: 16, xp: 22 },
  },
  {
    id: 'if-5',
    trainerId: 'if',
    n: 5,
    title: 'FizzBuzz мини',
    prompt:
      'Для чисел 1..5 напечатай «Fizz» если число делится на 3, иначе само число. Ожидается: 1, 2, Fizz, 4, 5.',
    hints: [
      'Условие делимости: i % 3 == 0.',
      'if i % 3 == 0: print("Fizz") else: print(i).',
      'Для i от 1 до 5 включительно.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(1, 6):\n    if i % 3 == 0:\n        print("Fizz")\n    else:\n        print(i)\n',
    check: {
      kind: 'output-match',
      expected: ['1', '2', 'Fizz', '4', '5'],
    },
    reward: { coins: 18, xp: 24 },
  },
  {
    id: 'if-6',
    trainerId: 'if',
    n: 6,
    title: 'Знак числа',
    prompt:
      'x = −3. Напечатай «плюс» если x>0, «минус» если x<0, «ноль» если x==0. Ожидается «минус».',
    hints: [
      'Три ветки: if / elif / else.',
      'if x > 0: ... elif x < 0: ... else: ...',
      'Для −3 сработает elif.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = -3\nif x > 0:\n    print("плюс")\nelif x < 0:\n    print("минус")\nelse:\n    print("ноль")\n',
    check: { kind: 'output-match', expected: ['минус'] },
    reward: { coins: 20, xp: 26 },
  },
  {
    id: 'if-7',
    trainerId: 'if',
    n: 7,
    title: 'Шаг с условием',
    prompt:
      'Пройди 3 шага вперёд. Если в коде есть проверка if — прыгни в конце. Код обязан содержать if.',
    hints: [
      'Задача — проверить навык писать if.',
      'if True: jump() — формально решит.',
      'Используй move_forward и в if — jump().',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = 5\nmove_forward(3)\nif x > 0:\n    jump()\n',
    check: { kind: 'uses-feature', required: ['if'] },
    maxBlocks: 8,
    reward: { coins: 18, xp: 24 },
  },
  {
    id: 'if-8',
    trainerId: 'if',
    n: 8,
    title: 'Макс из двух',
    prompt:
      'a=7, b=4. Напечатай максимум из них. Используй if. Ожидается 7.',
    hints: [
      'if a > b: print(a) else: print(b).',
      'Без max() — тренируем if.',
      'Ответ для a=7, b=4 — 7.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'a = 7\nb = 4\nif a > b:\n    print(a)\nelse:\n    print(b)\n',
    check: { kind: 'output-match', expected: ['7'] },
    reward: { coins: 20, xp: 26 },
  },
  {
    id: 'if-9',
    trainerId: 'if',
    n: 9,
    title: 'Проверка диапазона',
    prompt:
      'x=15. Если x между 10 и 20 — печатай «средний», иначе «крайний». Ожидается «средний».',
    hints: [
      'Можно и через and: if x >= 10 and x <= 20.',
      'Или вложить два if.',
      'Напечатай соответствующий текст в каждой ветке.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = 15\nif x >= 10 and x <= 20:\n    print("средний")\nelse:\n    print("крайний")\n',
    check: { kind: 'output-match', expected: ['средний'] },
    reward: { coins: 22, xp: 28 },
  },
  {
    id: 'if-10',
    trainerId: 'if',
    n: 10,
    title: 'FizzBuzz полный',
    prompt:
      'Для чисел 1..15 напечатай: «FizzBuzz» если делится на 15, «Fizz» если на 3, «Buzz» если на 5, иначе само число.',
    hints: [
      'Сначала проверяй 15, потом 3, потом 5, иначе — число.',
      'if i % 15 == 0: ... elif i % 3 == 0: ... elif i % 5 == 0: ... else: print(i).',
      'Так как 15=3*5, порядок важен — 15 в первую очередь.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)\n',
    check: {
      kind: 'output-match',
      expected: [
        '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz',
        '11', 'Fizz', '13', '14', 'FizzBuzz',
      ],
    },
    reward: { coins: 30, xp: 40 },
  },
]

// ─── Функция — def + вызов 3+ раз ─────────────────────────────────
const functionPuzzles: PuzzleTask[] = [
  {
    id: 'function-1',
    trainerId: 'function',
    n: 1,
    title: 'Первая функция',
    prompt:
      'Определи функцию hello() которая печатает «Привет!», и вызови её один раз.',
    hints: [
      'def hello(): ...',
      'В теле — print("Привет!").',
      'Не забудь вызвать: hello().',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'def hello():\n    print("Привет!")\n\nhello()\n',
    check: { kind: 'output-match', expected: ['Привет!'] },
    reward: { coins: 10, xp: 14 },
  },
  {
    id: 'function-2',
    trainerId: 'function',
    n: 2,
    title: 'Функция с параметром',
    prompt:
      'Определи функцию greet(name) которая печатает «Привет, <name>!». Вызови её один раз с «Саша».',
    hints: [
      'def greet(name): ...',
      'f-строка: print(f"Привет, {name}!").',
      'greet("Саша").',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def greet(name):\n    print(f"Привет, {name}!")\n\ngreet("Саша")\n',
    check: { kind: 'output-match', expected: ['Привет, Саша!'] },
    reward: { coins: 12, xp: 16 },
  },
  {
    id: 'function-3',
    trainerId: 'function',
    n: 3,
    title: 'Три вызова',
    prompt:
      'Определи функцию hi() и вызови её 3 раза. Проверка убедится что функция вызвана >= 3 раз.',
    hints: [
      'def hi(): print("Hi").',
      'Вызови hi() три раза подряд.',
      'Или циклом: for _ in range(3): hi().',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def hi():\n    print("Hi")\n\nhi()\nhi()\nhi()\n',
    check: { kind: 'uses-feature', required: ['def', 'call3'] },
    reward: { coins: 15, xp: 20 },
  },
  {
    id: 'function-4',
    trainerId: 'function',
    n: 4,
    title: 'Квадрат числа',
    prompt:
      'Функция square(x) возвращает x*x. Напечатай square(2), square(3), square(4). Ожидается 4, 9, 16.',
    hints: [
      'def square(x): return x * x.',
      'print(square(2)) и так трижды.',
      'Цикл: for i in [2,3,4]: print(square(i)).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def square(x):\n    return x * x\n\nprint(square(2))\nprint(square(3))\nprint(square(4))\n',
    check: { kind: 'output-match', expected: ['4', '9', '16'] },
    reward: { coins: 18, xp: 24 },
  },
  {
    id: 'function-5',
    trainerId: 'function',
    n: 5,
    title: 'Сумма двух',
    prompt:
      'Функция add(a, b) возвращает их сумму. Напечатай add(2,3), add(10,5), add(7,8). Ожидается 5, 15, 15.',
    hints: [
      'def add(a, b): return a + b.',
      'Три вызова с разными аргументами.',
      'print(add(2,3)) и так далее.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def add(a, b):\n    return a + b\n\nprint(add(2, 3))\nprint(add(10, 5))\nprint(add(7, 8))\n',
    check: { kind: 'output-match', expected: ['5', '15', '15'] },
    reward: { coins: 20, xp: 25 },
  },
  {
    id: 'function-6',
    trainerId: 'function',
    n: 6,
    title: 'Функция двигает игрока',
    prompt:
      'Функция step(n) делает move_forward(n). Вызови step(2), step(3). Должен дойти до (0, −5).',
    hints: [
      'def step(n): move_forward(n).',
      'step(2); step(3) — всего 5 шагов по −Z.',
      'Проверка: reach-goal до (0, −5).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def step(n):\n    move_forward(n)\n\nstep(2)\nstep(3)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: -5 },
    reward: { coins: 20, xp: 25 },
  },
  {
    id: 'function-7',
    trainerId: 'function',
    n: 7,
    title: 'Факториал 5',
    prompt: 'Функция fact(n) возвращает факториал. Напечатай fact(5). Ожидается 120.',
    hints: [
      'Факториал: 5! = 5*4*3*2*1 = 120.',
      'def fact(n): r=1; for i in range(1,n+1): r=r*i; return r.',
      'print(fact(5)).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def fact(n):\n    r = 1\n    for i in range(1, n + 1):\n        r = r * i\n    return r\n\nprint(fact(5))\n',
    check: { kind: 'output-match', expected: ['120'] },
    reward: { coins: 25, xp: 30 },
  },
  {
    id: 'function-8',
    trainerId: 'function',
    n: 8,
    title: 'Чётный?',
    prompt:
      'Функция is_even(n) возвращает True/False. Напечатай is_even(4), is_even(7). Ожидается True, False.',
    hints: [
      'def is_even(n): return n % 2 == 0.',
      'print выведет True или False.',
      'Два вызова.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4))\nprint(is_even(7))\n',
    check: { kind: 'output-match', expected: ['True', 'False'] },
    reward: { coins: 22, xp: 28 },
  },
  {
    id: 'function-9',
    trainerId: 'function',
    n: 9,
    title: 'Квадраты-рамки',
    prompt:
      'Напиши функцию build_square(size, ox, color), которая строит квадрат size×size в y=0 со сдвигом ox. Вызови 3 раза: build_square(2,0,"red"), build_square(2,3,"blue"), build_square(2,6,"yellow").',
    hints: [
      'def build_square(size, ox, color): for i in range(size): for j in range(size): place_block(i+ox, 0, j, color).',
      'Три вызова с разными аргументами.',
      'Проверка uses-feature: def и 3+ вызова.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def build_square(size, ox, color):\n    for i in range(size):\n        for j in range(size):\n            place_block(i + ox, 0, j, color)\n\nbuild_square(2, 0, "red")\nbuild_square(2, 3, "blue")\nbuild_square(2, 6, "yellow")\n',
    check: { kind: 'uses-feature', required: ['def', 'for', 'call3'] },
    reward: { coins: 30, xp: 35 },
  },
  {
    id: 'function-10',
    trainerId: 'function',
    n: 10,
    title: 'Рекурсивный счётчик',
    prompt:
      'Функция countdown(n) печатает числа от n до 1 (каждое на своей строке), потом «Бум!». Вызови countdown(3). Ожидается 3, 2, 1, Бум!.',
    hints: [
      'Можно циклом, а можно рекурсией.',
      'def countdown(n): if n <= 0: print("Бум!"); return; print(n); countdown(n-1).',
      'countdown(3).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def countdown(n):\n    if n <= 0:\n        print("Бум!")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)\n',
    check: { kind: 'output-match', expected: ['3', '2', '1', 'Бум!'] },
    reward: { coins: 35, xp: 45 },
  },
]

// ─── Детектив — сторителл с сюжетными слайдами ────────────────────
// История: пингвин-детектив Никс расследует кражу рыбы с острова.
const detectivePuzzles: PuzzleTask[] = [
  {
    id: 'detective-1',
    trainerId: 'detective',
    n: 1,
    title: 'Выход на место преступления',
    prompt: 'Никс получил дело: исчезла вся рыба с острова! Надо добраться до места преступления — 3 шага вперёд.',
    hints: [
      'Используй move_forward(3) — три шага по −Z.',
      'Цель стоит ровно на 3 клетки от старта.',
      'move_forward(3)',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(3)\n',
    check: { kind: 'reach-goal', goalX: 0, goalZ: -3 },
    maxBlocks: 2,
    reward: { coins: 8, xp: 12 },
    beforeSlide: {
      chapter: 'Пролог',
      emoji: '🐧🔍',
      title: 'Дело о пропавшей рыбе',
      text: 'Пингвин-детектив Никс получает записку:\n«Вся рыба на острове исчезла за одну ночь!»\nНикс берёт лупу и отправляется расследовать.',
    },
  },
  {
    id: 'detective-2',
    trainerId: 'detective',
    n: 2,
    title: 'Считаем улики',
    prompt: 'На месте преступления Никс нашёл следы. Напечатай числа от 1 до 4 — по одному на строку. Это порядковые номера улик.',
    hints: [
      'Используй for i in range(1, 5).',
      'print(i) внутри цикла.',
      'Ожидается: 1, 2, 3, 4 — по одной строке.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(1, 5):\n    print(i)\n',
    check: { kind: 'output-match', expected: ['1', '2', '3', '4'] },
    reward: { coins: 8, xp: 12 },
    beforeSlide: {
      chapter: 'Глава 1',
      emoji: '👣',
      title: 'Следы на снегу',
      text: 'Никс видит следы на снегу — четыре разных размера.\n«Четыре подозреваемых!» — думает он.\nНужно пронумеровать каждую улику.',
    },
  },
  {
    id: 'detective-3',
    trainerId: 'detective',
    n: 3,
    title: 'Переход через реку',
    prompt: 'Подозреваемый убежал за реку! Положи камни-ступеньки на позиции (0,0,0), (0,0,-1), (0,0,-2) — синего цвета — чтобы перейти.',
    hints: [
      'Три place_block по оси Z: z=0, z=-1, z=-2.',
      'Цвет "blue", x=0, y=0.',
      'for i in range(3): place_block(0, 0, -i, "blue")',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(3):\n    place_block(0, 0, -i, "blue")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: [
        { x: 0, y: 0, z: 0, color: 'blue' },
        { x: 0, y: 0, z: -1, color: 'blue' },
        { x: 0, y: 0, z: -2, color: 'blue' },
      ],
    },
    maxBlocks: 5,
    reward: { coins: 10, xp: 15 },
    beforeSlide: {
      chapter: 'Глава 2',
      emoji: '🌊',
      title: 'Подозреваемый у реки',
      text: 'Следы ведут к реке — широкой и ледяной.\n«Он перешёл вброд!» — понимает Никс.\nПложи камни-ступеньки, чтобы пройти по воде.',
    },
  },
  {
    id: 'detective-4',
    trainerId: 'detective',
    n: 4,
    title: 'Лесной лабиринт',
    prompt: 'За рекой — густой лес. Пройди к пещере: 2 шага вперёд, повернись направо, ещё 3 шага вперёд.',
    hints: [
      'move_forward(2), затем turn_right().',
      'После поворота ещё move_forward(3).',
      'Цель: (3, −2).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(2)\nturn_right()\nmove_forward(3)\n',
    check: { kind: 'reach-goal', goalX: 3, goalZ: -2 },
    maxBlocks: 5,
    reward: { coins: 10, xp: 15 },
    beforeSlide: {
      chapter: 'Глава 3',
      emoji: '🌲',
      title: 'Тёмный лес',
      text: 'За рекой начинается тёмный лес.\nНикс видит впереди вход в пещеру.\n«Туда!» — он идёт по извилистой тропинке.',
    },
  },
  {
    id: 'detective-5',
    trainerId: 'detective',
    n: 5,
    title: 'Тайный шифр',
    prompt: 'В пещере Никс нашёл закодированную записку. Расшифруй: напечатай каждое третье число от 3 до 15 (3, 6, 9, 12, 15).',
    hints: [
      'range(3, 16, 3) идёт с шагом 3.',
      'for n in range(3, 16, 3): print(n).',
      'Должно быть 5 чисел: 3, 6, 9, 12, 15.',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for n in range(3, 16, 3):\n    print(n)\n',
    check: { kind: 'output-match', expected: ['3', '6', '9', '12', '15'] },
    reward: { coins: 12, xp: 18 },
    beforeSlide: {
      chapter: 'Глава 4',
      emoji: '📜',
      title: 'Записка с шифром',
      text: 'В глубине пещеры — старая записка.\nНа ней цифры: каждая третья от 1 до 15.\n«Это координаты склада!» — догадывается Никс.',
    },
  },
  {
    id: 'detective-6',
    trainerId: 'detective',
    n: 6,
    title: 'Путь к складу',
    prompt: 'Шифр указывает на склад: 2 шага вперёд, налево, 3 шага вперёд, налево, 1 шаг. Доберись до цели (−3, −3).',
    hints: [
      'move_forward(2), turn_left(), move_forward(3), turn_left(), move_forward(1).',
      'После двух поворотов налево ты смотришь по +Z.',
      'Итоговая позиция: (−3, −3).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'move_forward(2)\nturn_left()\nmove_forward(3)\nturn_left()\nmove_forward(1)\n',
    check: { kind: 'reach-goal', goalX: -3, goalZ: -3 },
    maxBlocks: 7,
    reward: { coins: 12, xp: 18 },
    beforeSlide: {
      chapter: 'Глава 5',
      emoji: '🏚️',
      title: 'Заброшенный склад',
      text: 'Шифр расшифрован! Он указывает на\nзаброшенный склад в другом конце острова.\nНикс прокладывает маршрут по карте.',
    },
  },
  {
    id: 'detective-7',
    trainerId: 'detective',
    n: 7,
    title: 'Кодовый замок',
    prompt: 'Дверь заперта! Замок открывается если ввести код. Напечатай «открыто» если x=42 равно 42, иначе «заперто».',
    hints: [
      'x = 42',
      'if x == 42: print("открыто")',
      'Иначе — print("заперто"). Ожидается «открыто».',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'x = 42\nif x == 42:\n    print("открыто")\nelse:\n    print("заперто")\n',
    check: { kind: 'output-match', expected: ['открыто'] },
    reward: { coins: 14, xp: 20 },
    beforeSlide: {
      chapter: 'Глава 6',
      emoji: '🔒',
      title: 'Взлом замка',
      text: 'Дверь склада заперта на кодовый замок.\nНикс находит подсказку: «Код — это 42».\n«Если число верное — дверь откроется!»',
    },
  },
  {
    id: 'detective-8',
    trainerId: 'detective',
    n: 8,
    title: 'Рыба найдена!',
    prompt: 'Рыба нашлась! Отметь место находки блоками: поставь 3 красных блока в ряд по X: (0,0,0), (1,0,0), (2,0,0).',
    hints: [
      'Три place_block с x=0, 1, 2; y=0, z=0.',
      'Цвет "red".',
      'for i in range(3): place_block(i, 0, 0, "red")',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'for i in range(3):\n    place_block(i, 0, 0, "red")\n',
    check: {
      kind: 'build-pattern',
      strictColor: true,
      expectedBlocks: [
        { x: 0, y: 0, z: 0, color: 'red' },
        { x: 1, y: 0, z: 0, color: 'red' },
        { x: 2, y: 0, z: 0, color: 'red' },
      ],
    },
    maxBlocks: 4,
    reward: { coins: 14, xp: 20 },
    beforeSlide: {
      chapter: 'Глава 7',
      emoji: '🐟',
      title: 'Рыба найдена!',
      text: 'Внутри склада — горы рыбы!\n«Всё здесь!» — радуется Никс.\nОн отмечает место красными маркерами для полиции.',
    },
  },
  {
    id: 'detective-9',
    trainerId: 'detective',
    n: 9,
    title: 'Имя преступника',
    prompt: 'Никс вычислил преступника! Функция suspect(n) возвращает "Морж" если n==1, иначе "Тюлень". Напечатай suspect(1) и suspect(2).',
    hints: [
      'def suspect(n): if n == 1: return "Морж"; else: return "Тюлень"',
      'print(suspect(1)) — напечатает «Морж».',
      'print(suspect(2)) — напечатает «Тюлень».',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython:
      'def suspect(n):\n    if n == 1:\n        return "Морж"\n    else:\n        return "Тюлень"\n\nprint(suspect(1))\nprint(suspect(2))\n',
    check: { kind: 'output-match', expected: ['Морж', 'Тюлень'] },
    reward: { coins: 18, xp: 24 },
    beforeSlide: {
      chapter: 'Глава 8',
      emoji: '🔎',
      title: 'Кто украл рыбу?',
      text: 'Никс изучает улики и понимает:\nпреступник — либо Морж, либо Тюлень.\nПроверь улику №1 и улику №2 — кто из них виновен?',
    },
  },
  {
    id: 'detective-10',
    trainerId: 'detective',
    n: 10,
    title: 'Возвращение домой',
    prompt: 'Дело закрыто! Никс возвращается домой: 4 шага вперёд, направо, 4 шага. Цель — (4, −4).',
    hints: [
      'move_forward(4), turn_right(), move_forward(4).',
      'После поворота направо «вперёд» идёт по +X.',
      'Итоговая позиция: (4, −4).',
    ],
    starterBlocks: ON_START_EMPTY,
    starterPython: 'move_forward(4)\nturn_right()\nmove_forward(4)\n',
    check: { kind: 'reach-goal', goalX: 4, goalZ: -4 },
    maxBlocks: 4,
    reward: { coins: 20, xp: 30 },
    beforeSlide: {
      chapter: 'Финал',
      emoji: '🏆',
      title: 'Дело закрыто!',
      text: 'Морж пойман! Рыба возвращена жителям острова.\nВсе благодарят детектива Никса.\nТеперь пора вернуться домой и отдохнуть!',
    },
  },
]

// ─── Тренажёры ────────────────────────────────────────────────────
export const TRAINERS: Trainer[] = [
  {
    id: 'path',
    emoji: '🐧',
    title: 'Маршрут',
    tagline: 'Двигай пингвина из старта в цель',
    description:
      'Учимся давать команды: идти вперёд, поворачивать налево и направо. 10 коротких задач от одного шага до сложного лабиринта.',
    color: '#6B5CE7',
    puzzles: pathPuzzles,
  },
  {
    id: 'tower',
    emoji: '🧱',
    title: 'Башня',
    tagline: 'Построй фигуру из блоков',
    description:
      'Цветные блоки, координаты X-Y-Z и циклы. Соберём квадрат 3×3, лестницу и целую пирамиду.',
    color: '#FF9454',
    puzzles: towerPuzzles,
  },
  {
    id: 'loop',
    emoji: '🔁',
    title: 'Цикл',
    tagline: 'Повторяй действия умно',
    description:
      'Один раз — медленно, а 5 раз — один цикл. Напечатаем 5 приветов, посчитаем сумму и построим ёлочку.',
    color: '#9FE8C7',
    puzzles: loopPuzzles,
  },
  {
    id: 'if',
    emoji: '🤔',
    title: 'Условие',
    tagline: 'Решай по ситуации',
    description:
      'if/else, elif и сравнения. От простого «больше-меньше» до полного FizzBuzz.',
    color: '#FFD43C',
    puzzles: ifPuzzles,
  },
  {
    id: 'function',
    emoji: '📦',
    title: 'Функция',
    tagline: 'Соберай своё: def и вызов',
    description:
      'Функции дают имена действиям. Напишем square(x), add(a,b) и даже рекурсивный countdown.',
    color: '#FFB4C8',
    puzzles: functionPuzzles,
  },
  {
    id: 'detective',
    emoji: '🔍',
    title: 'Детектив',
    tagline: 'Помоги Никсу раскрыть дело',
    description:
      'Сторителл-тренажёр: пингвин-детектив Никс расследует кражу рыбы. 10 задач, сюжетные повороты, движение и логика.',
    color: '#A06BE0',
    puzzles: detectivePuzzles,
  },
]

export function getTrainer(id: string): Trainer | undefined {
  return TRAINERS.find((t) => t.id === id)
}

export function getPuzzle(trainerId: string, n: number): PuzzleTask | undefined {
  const t = getTrainer(trainerId)
  if (!t) return undefined
  return t.puzzles.find((p) => p.n === n)
}

// ─── Solved state (localStorage) ──────────────────────────────────
const SOLVED_PREFIX = 'ek_solved_'

export function getSolvedSet(trainerId: string): Set<number> {
  try {
    const raw = localStorage.getItem(SOLVED_PREFIX + trainerId)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is number => typeof x === 'number'))
  } catch {
    return new Set()
  }
}

export function markSolved(trainerId: string, n: number): void {
  const set = getSolvedSet(trainerId)
  set.add(n)
  try {
    localStorage.setItem(SOLVED_PREFIX + trainerId, JSON.stringify([...set]))
  } catch {
    /* quota */
  }
}

export function getSolvedCount(trainerId: string): number {
  return getSolvedSet(trainerId).size
}

/** Следующая нерешённая задача из тренажёра, или 1 если все решены / нет прогресса. */
export function getNextUnsolved(trainerId: string): number {
  const set = getSolvedSet(trainerId)
  for (let i = 1; i <= 10; i++) {
    if (!set.has(i)) return i
  }
  return 1
}
