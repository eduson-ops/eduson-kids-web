import * as Blockly from 'blockly'
import { pythonGenerator, Order } from 'blockly/python'

/**
 * Per-Object блоки — для программирования поведения конкретного объекта
 * на сцене (как sprites в Scratch). Префикс: `obj_`
 *
 * v2 (Scratch+Bloxels-level):
 *   • События: on_start, on_touch, on_click, on_key, on_tick, on_broadcast
 *   • Движение: move, rotate, set_scale, set_position, glide_to, change_size_by
 *   • Внешний вид: set_color, say, hide, show, flash
 *   • Управление: wait, broadcast, destroy, stop_all
 *   • Утилиты (reporters): random_int
 *   • Мир: player_say, set_sky, add_score, set_score
 *
 * Плюс все встроенные категории Blockly: Циклы, Логика, Математика,
 * Текст, Переменные, Списки, Функции — вся палитра программирования
 * для полного CS-курса (loops, conditions, lists, functions).
 */

const C_EVENTS  = '#FFB4C8'
const C_MOTION  = '#6B5CE7'
const C_LOOKS   = '#c879ff'
const C_CONTROL = '#FFD43C'
const C_SENSING = '#48c774'
const C_WORLD   = '#A9D8FF'

let installed = false

export function installObjectBlocks() {
  if (installed) return
  installed = true

  Blockly.defineBlocksWithJsonArray([
    // ═══ HAT EVENTS ═══
    {
      type: 'obj_on_start',
      message0: '🎬 при запуске сцены %1 %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Срабатывает один раз когда игрок заходит в Test-режим',
      helpUrl: '',
    },
    {
      type: 'obj_on_touch',
      message0: '👋 когда игрок коснулся %1 %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Срабатывает когда игрок дотронулся до этого объекта',
    },
    {
      type: 'obj_on_click',
      message0: '🖱 когда игрок кликнул по мне %1 %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Срабатывает по клику мыши по этому объекту',
    },
    {
      type: 'obj_on_key',
      message0: '⌨ когда нажата %1 %2 %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'KEY',
          options: [
            ['пробел', 'Space'],
            ['W — вверх', 'KeyW'],
            ['S — вниз', 'KeyS'],
            ['A — влево', 'KeyA'],
            ['D — вправо', 'KeyD'],
            ['E', 'KeyE'],
            ['F', 'KeyF'],
            ['Q', 'KeyQ'],
            ['R', 'KeyR'],
            ['1', 'Digit1'],
            ['2', 'Digit2'],
            ['3', 'Digit3'],
          ],
        },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Срабатывает при нажатии клавиши во время Test/Play',
    },
    {
      type: 'obj_on_tick',
      message0: '🔁 каждые %1 сек %2 %3',
      args0: [
        { type: 'field_number', name: 'SECONDS', value: 1, min: 0.1, max: 60, precision: 0.1 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Повторяется с интервалом',
    },
    {
      type: 'obj_on_broadcast',
      message0: '📻 когда получен сигнал %1 %2 %3',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'открыть_дверь' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: C_EVENTS,
      tooltip: 'Срабатывает когда другой объект разослал такой же сигнал',
    },

    // ═══ MOTION ═══
    {
      type: 'obj_move',
      message0: 'сдвинуть себя на x:%1 y:%2 z:%3',
      args0: [
        { type: 'field_number', name: 'DX', value: 0 },
        { type: 'field_number', name: 'DY', value: 1 },
        { type: 'field_number', name: 'DZ', value: 0 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Сдвигает ЭТОТ объект относительно текущей позиции',
    },
    {
      type: 'obj_set_position',
      message0: 'встать в x:%1 y:%2 z:%3',
      args0: [
        { type: 'field_number', name: 'X', value: 0 },
        { type: 'field_number', name: 'Y', value: 1 },
        { type: 'field_number', name: 'Z', value: 0 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Абсолютная позиция — мгновенная телепортация',
    },
    {
      type: 'obj_glide_to',
      message0: '✨ плавно к x:%1 y:%2 z:%3 за %4 сек',
      args0: [
        { type: 'field_number', name: 'X', value: 0 },
        { type: 'field_number', name: 'Y', value: 1 },
        { type: 'field_number', name: 'Z', value: 0 },
        { type: 'field_number', name: 'SECONDS', value: 1, min: 0.1, max: 30, precision: 0.1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Плавная анимация перемещения (интерполяция)',
    },
    {
      type: 'obj_rotate',
      message0: 'повернуть себя на %1 °',
      args0: [{ type: 'field_number', name: 'DEG', value: 90 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Поворот по Y-оси',
    },
    {
      type: 'obj_set_scale',
      message0: 'размер себя = %1',
      args0: [{ type: 'field_number', name: 'S', value: 1, min: 0.1, max: 10, precision: 0.1 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Равномерный масштаб (1 = исходный)',
    },
    {
      type: 'obj_change_size_by',
      message0: 'изменить размер на %1',
      args0: [{ type: 'field_number', name: 'DELTA', value: 0.1, precision: 0.01 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_MOTION,
      tooltip: 'Инкремент масштаба (+ увеличить, − уменьшить)',
    },

    // ═══ LOOKS ═══
    {
      type: 'obj_set_color',
      message0: 'цвет себя %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'COLOR',
          options: [
            ['🟥 красный', 'red'],
            ['🟦 синий', 'blue'],
            ['🟩 зелёный', 'green'],
            ['🟨 жёлтый', 'yellow'],
            ['🟪 фиолет', 'purple'],
            ['🟧 оранжевый', 'orange'],
            ['⬛ чёрный', 'black'],
            ['⬜ белый', 'white'],
            ['🌸 розовый', 'pink'],
            ['🔵 голубой', 'cyan'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_LOOKS,
      tooltip: 'Перекрасить ЭТОТ объект',
    },
    {
      type: 'obj_say',
      message0: 'сказать %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: 'Привет!' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_LOOKS,
      tooltip: 'Показать floating-текст над собой',
    },
    {
      type: 'obj_hide',
      message0: '🫥 спрятать себя',
      previousStatement: null,
      nextStatement: null,
      colour: C_LOOKS,
      tooltip: 'Сделать невидимым (остаётся на сцене)',
    },
    {
      type: 'obj_show',
      message0: '👁 показать себя',
      previousStatement: null,
      nextStatement: null,
      colour: C_LOOKS,
      tooltip: 'Снять скрытие',
    },
    {
      type: 'obj_flash',
      message0: '✨ мигнуть цветом %1 на %2 сек',
      args0: [
        {
          type: 'field_dropdown',
          name: 'COLOR',
          options: [
            ['🟨 жёлтый', 'yellow'],
            ['🟥 красный', 'red'],
            ['🟦 синий', 'blue'],
            ['🟩 зелёный', 'green'],
            ['🌸 розовый', 'pink'],
            ['🔵 голубой', 'cyan'],
            ['⬜ белый', 'white'],
          ],
        },
        { type: 'field_number', name: 'SECONDS', value: 0.3, min: 0.05, max: 5, precision: 0.05 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_LOOKS,
      tooltip: 'Кратковременно перекрасить, затем вернуть исходный цвет',
    },

    // ═══ CONTROL ═══
    {
      type: 'obj_wait',
      message0: '⏱ подождать %1 сек',
      args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: 0.1, max: 10, precision: 0.1 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_CONTROL,
      tooltip: 'Пауза перед следующей командой',
    },
    {
      type: 'obj_broadcast',
      message0: '📡 отправить сигнал %1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'открыть_дверь' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_CONTROL,
      tooltip: 'Разослать сигнал всем другим объектам. Ловят через «когда получен сигнал».',
    },
    {
      type: 'obj_destroy',
      message0: '💥 удалить себя',
      previousStatement: null,
      colour: C_CONTROL,
      tooltip: 'Убрать ЭТОТ объект со сцены навсегда',
    },
    {
      type: 'obj_stop_all',
      message0: '⏹ остановить всё',
      previousStatement: null,
      colour: C_CONTROL,
      tooltip: 'Остановить все on_tick и очередь команд',
    },

    // ═══ SENSING / OPERATORS (reporters) ═══
    {
      type: 'obj_random_int',
      message0: 'случайное число от %1 до %2',
      args0: [
        { type: 'input_value', name: 'FROM', check: 'Number' },
        { type: 'input_value', name: 'TO', check: 'Number' },
      ],
      inputsInline: true,
      output: 'Number',
      colour: C_SENSING,
      tooltip: 'Случайное целое число в диапазоне',
    },

    // ═══ WORLD (глобальные команды) ═══
    {
      type: 'obj_player_say',
      message0: '💬 игрок сказал %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: 'Добро пожаловать!' }],
      previousStatement: null,
      nextStatement: null,
      colour: C_WORLD,
      tooltip: 'Floating-текст над игроком',
    },
    {
      type: 'obj_set_sky',
      message0: '🌤 небо = %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PRESET',
          options: [
            ['☀ день', 'day'],
            ['🌇 вечер', 'evening'],
            ['🌙 ночь', 'night'],
            ['☁ облачно', 'cloudy'],
            ['🚀 космос', 'space'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: C_WORLD,
      tooltip: 'Поменять освещение/небо сцены',
    },
    {
      type: 'obj_add_score',
      message0: '💰 очки + %1',
      args0: [{ type: 'field_number', name: 'N', value: 1, min: -999, max: 999 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_WORLD,
      tooltip: 'Увеличить счётчик очков',
    },
    {
      type: 'obj_set_score',
      message0: '💰 очки = %1',
      args0: [{ type: 'field_number', name: 'N', value: 0, min: 0, max: 9999 }],
      previousStatement: null,
      nextStatement: null,
      colour: C_WORLD,
      tooltip: 'Установить точное значение очков',
    },
  ])

  // ─── Python-генераторы ────────────────────────────────────────
  const body = (b: Blockly.Block) => {
    const raw = pythonGenerator.statementToCode(b, 'DO')
    return raw.length ? raw : '    pass\n'
  }

  // Hats
  pythonGenerator.forBlock['obj_on_start'] = (b) => `def on_start():\n${body(b)}\n`
  pythonGenerator.forBlock['obj_on_touch'] = (b) => `def on_touch():\n${body(b)}\n`
  pythonGenerator.forBlock['obj_on_click'] = (b) => `def on_click():\n${body(b)}\n`
  pythonGenerator.forBlock['obj_on_key'] = (b) => {
    const key = String(b.getFieldValue('KEY') || 'Space')
    return `def on_key_${key}():\n${body(b)}\n`
  }
  pythonGenerator.forBlock['obj_on_tick'] = (b) => {
    const sec = Number(b.getFieldValue('SECONDS')) || 1
    return `# on_tick interval: ${sec}s\ndef on_tick():\n${body(b)}\n`
  }
  pythonGenerator.forBlock['obj_on_broadcast'] = (b) => {
    const name = String(b.getFieldValue('NAME') || 'msg').replace(/[^a-zA-Z_а-яА-Я0-9]/g, '_')
    return `def on_${name}():\n${body(b)}\n`
  }

  // Motion
  pythonGenerator.forBlock['obj_move'] = (b) => {
    const dx = Number(b.getFieldValue('DX')) || 0
    const dy = Number(b.getFieldValue('DY')) || 0
    const dz = Number(b.getFieldValue('DZ')) || 0
    return `    this.move(${dx}, ${dy}, ${dz})\n`
  }
  pythonGenerator.forBlock['obj_set_position'] = (b) => {
    const x = Number(b.getFieldValue('X')) || 0
    const y = Number(b.getFieldValue('Y')) || 0
    const z = Number(b.getFieldValue('Z')) || 0
    return `    this.set_position(${x}, ${y}, ${z})\n`
  }
  pythonGenerator.forBlock['obj_glide_to'] = (b) => {
    const x = Number(b.getFieldValue('X')) || 0
    const y = Number(b.getFieldValue('Y')) || 0
    const z = Number(b.getFieldValue('Z')) || 0
    const s = Number(b.getFieldValue('SECONDS')) || 1
    return `    this.glide_to(${x}, ${y}, ${z}, ${s})\n`
  }
  pythonGenerator.forBlock['obj_rotate'] = (b) => {
    const deg = Number(b.getFieldValue('DEG')) || 0
    return `    this.rotate(${deg})\n`
  }
  pythonGenerator.forBlock['obj_set_scale'] = (b) => {
    const s = Number(b.getFieldValue('S')) || 1
    return `    this.set_scale(${s})\n`
  }
  pythonGenerator.forBlock['obj_change_size_by'] = (b) => {
    const d = Number(b.getFieldValue('DELTA')) || 0
    return `    this.change_size_by(${d})\n`
  }

  // Looks
  pythonGenerator.forBlock['obj_set_color'] = (b) => {
    const c = String(b.getFieldValue('COLOR') || 'red')
    return `    this.set_color("${c}")\n`
  }
  pythonGenerator.forBlock['obj_say'] = (b) => {
    const t = String(b.getFieldValue('TEXT') ?? '').replace(/"/g, '\\"')
    return `    this.say("${t}")\n`
  }
  pythonGenerator.forBlock['obj_hide'] = () => `    this.hide()\n`
  pythonGenerator.forBlock['obj_show'] = () => `    this.show()\n`
  pythonGenerator.forBlock['obj_flash'] = (b) => {
    const c = String(b.getFieldValue('COLOR') || 'yellow')
    const s = Number(b.getFieldValue('SECONDS')) || 0.3
    return `    this.flash("${c}", ${s})\n`
  }

  // Control
  pythonGenerator.forBlock['obj_wait'] = (b) => {
    const s = Number(b.getFieldValue('SECONDS')) || 1
    return `    this.wait(${s})\n`
  }
  pythonGenerator.forBlock['obj_broadcast'] = (b) => {
    const name = String(b.getFieldValue('NAME') || 'msg').replace(/"/g, '\\"')
    return `    this.broadcast("${name}")\n`
  }
  pythonGenerator.forBlock['obj_destroy'] = () => `    this.destroy()\n`
  pythonGenerator.forBlock['obj_stop_all'] = () => `    this.stop_all()\n`

  // Sensing / utils — reporter
  pythonGenerator.forBlock['obj_random_int'] = (b) => {
    const from = pythonGenerator.valueToCode(b, 'FROM', Order.NONE) || '1'
    const to = pythonGenerator.valueToCode(b, 'TO', Order.NONE) || '10'
    return [`_randint(${from}, ${to})`, Order.FUNCTION_CALL]
  }

  // World-actions
  pythonGenerator.forBlock['obj_player_say'] = (b) => {
    const t = String(b.getFieldValue('TEXT') ?? '').replace(/"/g, '\\"')
    return `    this.player_say("${t}")\n`
  }
  pythonGenerator.forBlock['obj_set_sky'] = (b) => {
    const p = String(b.getFieldValue('PRESET') || 'day')
    return `    this.set_sky("${p}")\n`
  }
  pythonGenerator.forBlock['obj_add_score'] = (b) => {
    const n = Number(b.getFieldValue('N')) || 1
    return `    this.add_score(${n})\n`
  }
  pythonGenerator.forBlock['obj_set_score'] = (b) => {
    const n = Number(b.getFieldValue('N')) || 0
    return `    this.set_score(${n})\n`
  }

  void Order.ATOMIC
}

/**
 * OBJECT_TOOLBOX v2 — полный CS-палитр в стиле Scratch+Bloxels.
 * Свои категории (obj_*) + встроенные Blockly (loops/logic/math/vars/lists/funcs/text).
 */
export const OBJECT_TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '🎬 События',
      colour: C_EVENTS,
      contents: [
        { kind: 'block', type: 'obj_on_start' },
        { kind: 'block', type: 'obj_on_touch' },
        { kind: 'block', type: 'obj_on_click' },
        { kind: 'block', type: 'obj_on_key' },
        { kind: 'block', type: 'obj_on_tick' },
        { kind: 'block', type: 'obj_on_broadcast' },
      ],
    },
    {
      kind: 'category',
      name: '🏃 Движение',
      colour: C_MOTION,
      contents: [
        { kind: 'block', type: 'obj_move' },
        { kind: 'block', type: 'obj_set_position' },
        { kind: 'block', type: 'obj_glide_to' },
        { kind: 'block', type: 'obj_rotate' },
        { kind: 'block', type: 'obj_set_scale' },
        { kind: 'block', type: 'obj_change_size_by' },
      ],
    },
    {
      kind: 'category',
      name: '🎨 Внешний вид',
      colour: C_LOOKS,
      contents: [
        { kind: 'block', type: 'obj_set_color' },
        { kind: 'block', type: 'obj_flash' },
        { kind: 'block', type: 'obj_say' },
        { kind: 'block', type: 'obj_hide' },
        { kind: 'block', type: 'obj_show' },
      ],
    },
    {
      kind: 'category',
      name: '🎛 Управление',
      colour: C_CONTROL,
      contents: [
        { kind: 'block', type: 'obj_wait' },
        { kind: 'block', type: 'obj_broadcast' },
        { kind: 'block', type: 'obj_destroy' },
        { kind: 'block', type: 'obj_stop_all' },
      ],
    },
    {
      kind: 'category',
      name: '🔁 Циклы',
      colour: '#FFAB19',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
        { kind: 'block', type: 'controls_forEach' },
        { kind: 'block', type: 'controls_flow_statements' },
      ],
    },
    {
      kind: 'category',
      name: '❓ Логика',
      colour: '#66BF3C',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_null' },
        { kind: 'block', type: 'logic_ternary' },
      ],
    },
    {
      kind: 'category',
      name: '🔢 Математика',
      colour: '#3E87E8',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_trig' },
        { kind: 'block', type: 'math_constant' },
        { kind: 'block', type: 'math_number_property' },
        { kind: 'block', type: 'math_round' },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_constrain' },
        { kind: 'block', type: 'math_random_int' },
        { kind: 'block', type: 'math_random_float' },
        { kind: 'block', type: 'obj_random_int' },
      ],
    },
    {
      kind: 'category',
      name: '📝 Текст',
      colour: '#5CB3F7',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_append' },
        { kind: 'block', type: 'text_length' },
        { kind: 'block', type: 'text_isEmpty' },
        { kind: 'block', type: 'text_indexOf' },
        { kind: 'block', type: 'text_charAt' },
        { kind: 'block', type: 'text_getSubstring' },
        { kind: 'block', type: 'text_changeCase' },
        { kind: 'block', type: 'text_trim' },
      ],
    },
    {
      kind: 'category',
      name: '🧮 Переменные',
      colour: '#FF8C1A',
      custom: 'VARIABLE',
    },
    {
      kind: 'category',
      name: '📜 Списки',
      colour: '#745CCC',
      contents: [
        { kind: 'block', type: 'lists_create_with' },
        { kind: 'block', type: 'lists_repeat' },
        { kind: 'block', type: 'lists_length' },
        { kind: 'block', type: 'lists_isEmpty' },
        { kind: 'block', type: 'lists_indexOf' },
        { kind: 'block', type: 'lists_getIndex' },
        { kind: 'block', type: 'lists_setIndex' },
        { kind: 'block', type: 'lists_getSublist' },
        { kind: 'block', type: 'lists_sort' },
        { kind: 'block', type: 'lists_split' },
      ],
    },
    {
      kind: 'category',
      name: '🛠 Функции',
      colour: '#E8517B',
      custom: 'PROCEDURE',
    },
    {
      kind: 'category',
      name: '🌍 Мир',
      colour: C_WORLD,
      contents: [
        { kind: 'block', type: 'obj_player_say' },
        { kind: 'block', type: 'obj_set_sky' },
        { kind: 'block', type: 'obj_add_score' },
        { kind: 'block', type: 'obj_set_score' },
      ],
    },
  ],
}

/** Стартовый XML для нового скрипта объекта — hat @старт с пустым телом */
export const OBJECT_STARTER_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="obj_on_start" x="30" y="30"></block>
</xml>`

/**
 * Python prelude, который оборачивает сгенерированный код объекта.
 * Вставляется при runtime-исполнении; формирует объект `this` c методами,
 * эмитящими WorldCommand'ы с target=<object_id>.
 *
 * Дополнительно определяет `_randint(a,b)` помощник для блока obj_random_int
 * (без необходимости `import random` в пользовательском коде).
 */
export function wrapObjectPython(objectId: string, generatedPython: string): string {
  const safeId = objectId.replace(/"/g, '\\"')
  return `
import random as _random

def _randint(a, b):
    try:
        a = int(a); b = int(b)
        if a > b: a, b = b, a
        return _random.randint(a, b)
    except:
        return 0

_commands = []
def _emit(op, **kwargs):
    c = {"op": op}
    c.update(kwargs)
    _commands.append(c)

class _This:
    def __init__(self, oid):
        self._oid = oid
    # ─── Motion ───
    def move(self, dx=0, dy=0, dz=0):
        _emit("obj_move", target=self._oid, dx=float(dx), dy=float(dy), dz=float(dz))
    def set_position(self, x=0, y=0, z=0):
        _emit("obj_set_position", target=self._oid, x=float(x), y=float(y), z=float(z))
    def glide_to(self, x=0, y=0, z=0, seconds=1):
        try: s = float(seconds)
        except: s = 1.0
        _emit("obj_glide_to", target=self._oid, x=float(x), y=float(y), z=float(z), seconds=max(0.1, min(s, 30)))
    def rotate(self, deg=0):
        _emit("obj_rotate", target=self._oid, deg=float(deg))
    def set_scale(self, s=1):
        try: s = float(s)
        except: s = 1.0
        _emit("obj_set_scale", target=self._oid, s=max(0.1, min(s, 10)))
    def change_size_by(self, delta=0.1):
        try: d = float(delta)
        except: d = 0.0
        _emit("obj_change_size", target=self._oid, delta=d)
    # ─── Looks ───
    def set_color(self, c="red"):
        _emit("obj_set_color", target=self._oid, color=str(c))
    def say(self, text=""):
        _emit("obj_say", target=self._oid, text=str(text)[:140])
    def hide(self):
        _emit("obj_hide", target=self._oid)
    def show(self):
        _emit("obj_show", target=self._oid)
    def flash(self, color="yellow", seconds=0.3):
        try: s = float(seconds)
        except: s = 0.3
        _emit("obj_flash", target=self._oid, color=str(color), seconds=max(0.05, min(s, 5)))
    # ─── Control ───
    def wait(self, seconds=1):
        try: s = float(seconds)
        except: s = 1.0
        _emit("wait", seconds=max(0.1, min(s, 60)))
    def broadcast(self, name=""):
        _emit("obj_broadcast", target=self._oid, name=str(name)[:60])
    def destroy(self):
        _emit("obj_destroy", target=self._oid)
    def stop_all(self):
        _emit("stop_all")
    # ─── Global-scope helpers (работают в Play и Studio Test) ───
    def add_score(self, n=1):
        try: n = int(n)
        except: n = 1
        _emit("add_score", n=n)
    def set_score(self, n=0):
        try: n = int(n)
        except: n = 0
        _emit("set_score", n=max(0, min(n, 9999)))
    def set_sky(self, preset="day"):
        allowed = {"day","evening","night","cloudy","space"}
        p = str(preset).lower()
        if p not in allowed: p = "day"
        _emit("set_sky", preset=p)
    def player_say(self, text=""):
        _emit("player_say", text=str(text)[:140])

this = _This("${safeId}")

${generatedPython}
`
}
