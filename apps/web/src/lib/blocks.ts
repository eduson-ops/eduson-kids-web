import * as Blockly from 'blockly'
import { pythonGenerator, Order } from 'blockly/python'
import * as Ru from 'blockly/msg/ru'

Blockly.setLocale(Ru as unknown as { [key: string]: string })

function indent(code: string): string {
  return code
    .split('\n')
    .map((l) => (l.length ? `    ${l}` : l))
    .join('\n')
}

export type Command =
  | { op: 'say'; text: string }
  | { op: 'move_forward'; steps?: number }
  | { op: 'turn_left' }
  | { op: 'turn_right' }
  | { op: 'wait'; seconds: number }
  | { op: 'place_block'; color: string }
  | { op: 'jump' }
  | { op: 'set_var'; name: string; value: number }
  | { op: 'add_score'; n: number }

// Brand palette (Eduson Kids Designbook v1.0) — 6 semantic categories
// Movement = violet, Logic = yellow, Data = mint, Event = pink, World = sky, Sound = orange
const COLOR_MOTION = '#6B5CE7'  // violet → "Движение"
const COLOR_EVENTS = '#FFB4C8'  // pink   → "События"
const COLOR_LOOPS  = '#9FE8C7'  // mint   → "Повторы" (data-category)
const COLOR_LOGIC  = '#FFD43C'  // yellow → "Условия" (logic-category)
const COLOR_ACTIONS = '#FF9454' // orange → "Действия" (sound-like)
const COLOR_WORLD  = '#A9D8FF'  // sky    → "Мир"
const COLOR_VARS   = '#9FE8C7'  // mint   → "Очки" (data-category)
// Advanced Python — по исследованию Blockly/EduBlocks/MakeCode (staged disclosure)
const COLOR_NUM    = '#5AA9FF'  // sky-darker → "Числа"
const COLOR_TEXT   = '#c879ff'  // magenta   → "Текст"
const COLOR_LISTS  = '#FF9454'  // orange     → "Списки"
const COLOR_FN     = '#34C38A'  // green      → "Функции"

let installed = false
export function installBlocks() {
  if (installed) return
  installed = true

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'ek_on_start',
      message0: 'при запуске %1 %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: COLOR_EVENTS,
      tooltip: 'Запускается когда нажали «Запустить»',
      helpUrl: '',
    },
    {
      type: 'ek_move_forward',
      message0: 'идти вперёд %1 шагов',
      args0: [{ type: 'field_number', name: 'STEPS', value: 1, min: 1, max: 50, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_MOTION,
      tooltip: 'Двигает персонажа вперёд',
    },
    {
      type: 'ek_turn_left',
      message0: 'повернуть налево',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_MOTION,
      tooltip: 'Поворот на 90° влево',
    },
    {
      type: 'ek_turn_right',
      message0: 'повернуть направо',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_MOTION,
      tooltip: 'Поворот на 90° вправо',
    },
    {
      type: 'ek_jump',
      message0: 'прыгнуть',
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_MOTION,
      tooltip: 'Маленький прыжок на месте',
    },
    {
      type: 'ek_wait',
      message0: 'ждать %1 сек',
      args0: [{ type: 'field_number', name: 'SECONDS', value: 1, min: 0.1, max: 10, precision: 0.1 }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_ACTIONS,
      tooltip: 'Пауза',
    },
    {
      type: 'ek_say',
      message0: 'сказать %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: 'Привет!' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_ACTIONS,
      tooltip: 'Персонаж скажет фразу',
    },
    {
      type: 'ek_place_block',
      message0: 'поставить блок %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'COLOR',
          options: [
            ['🟥 красный', 'red'],
            ['🟦 синий', 'blue'],
            ['🟩 зелёный', 'green'],
            ['🟨 жёлтый', 'yellow'],
            ['🟪 фиолетовый', 'purple'],
            ['⬛ чёрный', 'black'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_WORLD,
      tooltip: 'Поставить цветной блок под ногами',
    },
    {
      type: 'ek_repeat',
      message0: 'повторить %1 раз %2 %3',
      args0: [
        { type: 'field_number', name: 'TIMES', value: 3, min: 1, max: 100, precision: 1 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOOPS,
      tooltip: 'Повторяет блоки внутри',
    },
    // ── Переменные ────────────────────────────────────
    {
      type: 'ek_var_set',
      message0: 'задать счёт %1',
      args0: [{ type: 'field_number', name: 'VALUE', value: 0, min: 0, max: 9999 }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_VARS,
      tooltip: 'Устанавливает очки игрока',
    },
    {
      type: 'ek_score_add',
      message0: 'добавить очков %1',
      args0: [{ type: 'field_number', name: 'N', value: 10, min: 1, max: 1000 }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_VARS,
      tooltip: 'Прибавляет очки к счёту',
    },
    // ── Условия ───────────────────────────────────────
    {
      type: 'ek_if_coins',
      message0: 'если монет ≥ %1 тогда %2 %3',
      args0: [
        { type: 'field_number', name: 'THRESHOLD', value: 5, min: 0, max: 999 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOGIC,
      tooltip: 'Выполняет блоки если монет набрано достаточно',
    },
    {
      type: 'ek_if_else',
      message0: 'если монет ≥ %1 %2 то %3 иначе %4 %5',
      args0: [
        { type: 'field_number', name: 'THRESHOLD', value: 5, min: 0, max: 999 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOGIC,
      tooltip: 'Если...то...иначе по количеству монет',
    },
    // ── Advanced Python: Числа ──
    {
      type: 'ek_var_set',
      message0: 'задать %1 = %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'x' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_NUM,
      tooltip: 'Присвоить переменной значение. Имена: x, score, name.',
    },
    {
      type: 'ek_var_change',
      message0: 'изменить %1 на %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'x' },
        { type: 'field_number', name: 'DELTA', value: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_NUM,
      tooltip: 'Прибавить к переменной число (x = x + delta)',
    },
    {
      type: 'ek_var_get',
      message0: '%1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'x' }],
      output: null,
      colour: COLOR_NUM,
      tooltip: 'Прочитать значение переменной',
    },
    {
      type: 'ek_number',
      message0: '%1',
      args0: [{ type: 'field_number', name: 'VALUE', value: 0 }],
      output: 'Number',
      colour: COLOR_NUM,
      tooltip: 'Число',
    },
    {
      type: 'ek_math_op',
      message0: '%1 %2 %3',
      args0: [
        { type: 'input_value', name: 'A' },
        {
          type: 'field_dropdown',
          name: 'OP',
          options: [
            ['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/'], ['%', '%'],
          ],
        },
        { type: 'input_value', name: 'B' },
      ],
      output: 'Number',
      inputsInline: true,
      colour: COLOR_NUM,
      tooltip: 'Арифметика: +, −, ×, ÷, остаток от деления',
    },
    {
      type: 'ek_compare',
      message0: '%1 %2 %3',
      args0: [
        { type: 'input_value', name: 'A' },
        {
          type: 'field_dropdown',
          name: 'OP',
          options: [
            ['=', '=='], ['≠', '!='], ['<', '<'], ['>', '>'], ['≤', '<='], ['≥', '>='],
          ],
        },
        { type: 'input_value', name: 'B' },
      ],
      output: 'Boolean',
      inputsInline: true,
      colour: COLOR_LOGIC,
      tooltip: 'Сравнить два значения',
    },
    // ── Условия / циклы общего назначения ──
    {
      type: 'ek_if_generic',
      message0: 'если %1 то %2 %3',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOGIC,
      tooltip: 'Если условие верно — выполнить блоки внутри',
    },
    {
      type: 'ek_if_else_generic',
      message0: 'если %1 то %2 %3 иначе %4 %5',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'ELSE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOGIC,
      tooltip: 'Если…то…иначе',
    },
    {
      type: 'ek_while',
      message0: 'пока %1 %2 %3',
      args0: [
        { type: 'input_value', name: 'COND', check: 'Boolean' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOOPS,
      tooltip: 'Повторять пока условие верно',
    },
    {
      type: 'ek_for_range',
      message0: 'для %1 от 0 до %2 %3 %4',
      args0: [
        { type: 'field_input', name: 'VAR', text: 'i' },
        { type: 'field_number', name: 'N', value: 5, min: 1 },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LOOPS,
      tooltip: 'Перебрать целые числа от 0 до N (не включая)',
    },
    // ── Текст / вывод ──
    {
      type: 'ek_text',
      message0: '«%1»',
      args0: [{ type: 'field_input', name: 'TEXT', text: 'привет' }],
      output: 'String',
      colour: COLOR_TEXT,
      tooltip: 'Текстовое значение',
    },
    {
      type: 'ek_print',
      message0: 'напечатать %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_TEXT,
      tooltip: 'Напечатать значение в консоль',
    },
    {
      type: 'ek_fstring',
      message0: 'строка «%1 %2 %3»',
      args0: [
        { type: 'field_input', name: 'PREFIX', text: 'Счёт:' },
        { type: 'input_value', name: 'VALUE' },
        { type: 'field_input', name: 'SUFFIX', text: '' },
      ],
      output: 'String',
      inputsInline: true,
      colour: COLOR_TEXT,
      tooltip: 'Собрать строку с вставкой значения — как f-строка в Python',
    },
    // ── Списки ──
    {
      type: 'ek_list_empty',
      message0: 'пустой список',
      output: 'Array',
      colour: COLOR_LISTS,
      tooltip: 'Новый пустой список',
    },
    {
      type: 'ek_list_append',
      message0: 'добавить в %1 значение %2',
      args0: [
        { type: 'field_input', name: 'LIST', text: 'items' },
        { type: 'input_value', name: 'VALUE' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_LISTS,
      tooltip: 'Добавить элемент в конец списка',
    },
    {
      type: 'ek_list_len',
      message0: 'длина списка %1',
      args0: [{ type: 'field_input', name: 'LIST', text: 'items' }],
      output: 'Number',
      colour: COLOR_LISTS,
      tooltip: 'Количество элементов в списке',
    },
    // ── Функции ──
    {
      type: 'ek_def',
      message0: 'функция %1 ( %2 ) %3 %4',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'моя_функция' },
        { type: 'field_input', name: 'PARAM', text: '' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      colour: COLOR_FN,
      tooltip: 'Определить функцию. Параметр можно оставить пустым.',
    },
    {
      type: 'ek_return',
      message0: 'вернуть %1',
      args0: [{ type: 'input_value', name: 'VALUE' }],
      previousStatement: null,
      colour: COLOR_FN,
      tooltip: 'Вернуть значение из функции',
    },
    {
      type: 'ek_call',
      message0: 'вызвать %1 ( %2 )',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'моя_функция' },
        { type: 'input_value', name: 'ARG' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: COLOR_FN,
      tooltip: 'Вызвать функцию. Аргумент можно оставить пустым.',
    },
  ])

  // Python generators
  pythonGenerator.forBlock['ek_on_start'] = function (block) {
    const body = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    return `def on_start():\n${body}\non_start()\n`
  }
  pythonGenerator.forBlock['ek_move_forward'] = function (block) {
    const steps = Number(block.getFieldValue('STEPS')) || 1
    return `    move_forward(${steps})\n`
  }
  pythonGenerator.forBlock['ek_turn_left'] = function () {
    return `    turn_left()\n`
  }
  pythonGenerator.forBlock['ek_turn_right'] = function () {
    return `    turn_right()\n`
  }
  pythonGenerator.forBlock['ek_jump'] = function () {
    return `    jump()\n`
  }
  pythonGenerator.forBlock['ek_wait'] = function (block) {
    const s = Number(block.getFieldValue('SECONDS')) || 1
    return `    wait(${s})\n`
  }
  pythonGenerator.forBlock['ek_say'] = function (block) {
    const text = String(block.getFieldValue('TEXT') ?? '')
    const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    return `    say("${escaped}")\n`
  }
  pythonGenerator.forBlock['ek_place_block'] = function (block) {
    const color = String(block.getFieldValue('COLOR') ?? 'red')
    return `    place_block("${color}")\n`
  }
  pythonGenerator.forBlock['ek_repeat'] = function (block) {
    const times = Number(block.getFieldValue('TIMES')) || 1
    const bodyRaw = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    const body = indent(bodyRaw)
    return `    for _ in range(${times}):\n${body}`
  }
  pythonGenerator.forBlock['ek_var_set'] = function (block) {
    const val = Number(block.getFieldValue('VALUE')) ?? 0
    return `    set_score(${val})\n`
  }
  pythonGenerator.forBlock['ek_score_add'] = function (block) {
    const n = Number(block.getFieldValue('N')) || 10
    return `    add_score(${n})\n`
  }
  pythonGenerator.forBlock['ek_if_coins'] = function (block) {
    const thr = Number(block.getFieldValue('THRESHOLD')) || 5
    const bodyRaw = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    const body = indent(bodyRaw)
    return `    if _coins >= ${thr}:\n${body}`
  }
  pythonGenerator.forBlock['ek_if_else'] = function (block) {
    const thr = Number(block.getFieldValue('THRESHOLD')) || 5
    const doRaw = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    const elseRaw = pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n'
    return `    if _coins >= ${thr}:\n${indent(doRaw)}    else:\n${indent(elseRaw)}`
  }

  // ─── Advanced Python generators (research-driven best practices) ───
  const sanitize = (s: string) => (s || 'x').replace(/[^a-zA-Z_а-яА-Я0-9]/g, '_')

  pythonGenerator.forBlock['ek_var_set'] = function (block) {
    const name = sanitize(block.getFieldValue('NAME') || 'x')
    const value = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0'
    return `    ${name} = ${value}\n`
  }
  pythonGenerator.forBlock['ek_var_change'] = function (block) {
    const name = sanitize(block.getFieldValue('NAME') || 'x')
    const delta = Number(block.getFieldValue('DELTA')) || 1
    return `    ${name} = ${name} + ${delta}\n`
  }
  pythonGenerator.forBlock['ek_var_get'] = function (block) {
    const name = sanitize(block.getFieldValue('NAME') || 'x')
    return [name, Order.ATOMIC]
  }
  pythonGenerator.forBlock['ek_number'] = function (block) {
    const v = Number(block.getFieldValue('VALUE')) || 0
    return [String(v), Order.ATOMIC]
  }
  pythonGenerator.forBlock['ek_math_op'] = function (block) {
    const op = block.getFieldValue('OP') || '+'
    const a = pythonGenerator.valueToCode(block, 'A', Order.MULTIPLICATIVE) || '0'
    const b = pythonGenerator.valueToCode(block, 'B', Order.MULTIPLICATIVE) || '0'
    const order = op === '+' || op === '-' ? Order.ADDITIVE : Order.MULTIPLICATIVE
    return [`${a} ${op} ${b}`, order]
  }
  pythonGenerator.forBlock['ek_compare'] = function (block) {
    const op = block.getFieldValue('OP') || '=='
    const a = pythonGenerator.valueToCode(block, 'A', Order.RELATIONAL) || '0'
    const b = pythonGenerator.valueToCode(block, 'B', Order.RELATIONAL) || '0'
    return [`${a} ${op} ${b}`, Order.RELATIONAL]
  }
  pythonGenerator.forBlock['ek_if_generic'] = function (block) {
    const cond = pythonGenerator.valueToCode(block, 'COND', Order.NONE) || 'True'
    const body = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    return `    if ${cond}:\n${indent(body)}`
  }
  pythonGenerator.forBlock['ek_if_else_generic'] = function (block) {
    const cond = pythonGenerator.valueToCode(block, 'COND', Order.NONE) || 'True'
    const doRaw = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    const elseRaw = pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n'
    return `    if ${cond}:\n${indent(doRaw)}    else:\n${indent(elseRaw)}`
  }
  pythonGenerator.forBlock['ek_while'] = function (block) {
    const cond = pythonGenerator.valueToCode(block, 'COND', Order.NONE) || 'False'
    const body = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    return `    while ${cond}:\n${indent(body)}`
  }
  pythonGenerator.forBlock['ek_for_range'] = function (block) {
    const varName = sanitize(block.getFieldValue('VAR') || 'i')
    const n = Number(block.getFieldValue('N')) || 5
    const body = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    return `    for ${varName} in range(${n}):\n${indent(body)}`
  }
  pythonGenerator.forBlock['ek_text'] = function (block) {
    const t = String(block.getFieldValue('TEXT') ?? '')
    const esc = t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    return [`"${esc}"`, Order.ATOMIC]
  }
  pythonGenerator.forBlock['ek_print'] = function (block) {
    const v = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '""'
    return `    print(${v})\n`
  }
  pythonGenerator.forBlock['ek_fstring'] = function (block) {
    const prefix = String(block.getFieldValue('PREFIX') ?? '').replace(/"/g, '\\"')
    const suffix = String(block.getFieldValue('SUFFIX') ?? '').replace(/"/g, '\\"')
    const v = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '""'
    // Собираем f-строку — используем безопасную конкатенацию через str() чтобы
    // избежать проблем, если внутри уже строка: f"{prefix}{value}{suffix}"
    return [`f"${prefix}{${v}}${suffix}"`, Order.ATOMIC]
  }
  pythonGenerator.forBlock['ek_list_empty'] = function () {
    return ['[]', Order.ATOMIC]
  }
  pythonGenerator.forBlock['ek_list_append'] = function (block) {
    const name = sanitize(block.getFieldValue('LIST') || 'items')
    const v = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || '0'
    return `    ${name}.append(${v})\n`
  }
  pythonGenerator.forBlock['ek_list_len'] = function (block) {
    const name = sanitize(block.getFieldValue('LIST') || 'items')
    return [`len(${name})`, Order.FUNCTION_CALL]
  }
  pythonGenerator.forBlock['ek_def'] = function (block) {
    const name = sanitize(block.getFieldValue('NAME') || 'my_fn')
    const param = sanitize(block.getFieldValue('PARAM') || '')
    const bodyRaw = pythonGenerator.statementToCode(block, 'DO') || '    pass\n'
    // Функция на верхнем уровне — без начального отступа, но наши statementToCode
    // вернут с 4-пробельным отступом (подходит для тела def).
    const signature = param ? `def ${name}(${param}):` : `def ${name}():`
    return `\n${signature}\n${bodyRaw}\n`
  }
  pythonGenerator.forBlock['ek_return'] = function (block) {
    const v = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'None'
    return `    return ${v}\n`
  }
  pythonGenerator.forBlock['ek_call'] = function (block) {
    const name = sanitize(block.getFieldValue('NAME') || 'my_fn')
    const arg = pythonGenerator.valueToCode(block, 'ARG', Order.NONE) || ''
    return `    ${name}(${arg})\n`
  }

  // silence unused-var warning for Order import (kept for future expression blocks)
  void Order.ATOMIC
}

export const TOOLBOX: Blockly.utils.toolbox.ToolboxDefinition = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'События',
      colour: COLOR_EVENTS,
      contents: [{ kind: 'block', type: 'ek_on_start' }],
    },
    {
      kind: 'category',
      name: 'Движение',
      colour: COLOR_MOTION,
      contents: [
        { kind: 'block', type: 'ek_move_forward' },
        { kind: 'block', type: 'ek_turn_left' },
        { kind: 'block', type: 'ek_turn_right' },
        { kind: 'block', type: 'ek_jump' },
      ],
    },
    {
      kind: 'category',
      name: 'Действия',
      colour: COLOR_ACTIONS,
      contents: [
        { kind: 'block', type: 'ek_say' },
        { kind: 'block', type: 'ek_wait' },
      ],
    },
    {
      kind: 'category',
      name: 'Мир',
      colour: COLOR_WORLD,
      contents: [{ kind: 'block', type: 'ek_place_block' }],
    },
    {
      kind: 'category',
      name: 'Повторы',
      colour: COLOR_LOOPS,
      contents: [{ kind: 'block', type: 'ek_repeat' }],
    },
    {
      kind: 'category',
      name: 'Условия',
      colour: COLOR_LOGIC,
      contents: [
        { kind: 'block', type: 'ek_if_coins' },
        { kind: 'block', type: 'ek_if_else' },
      ],
    },
    {
      kind: 'category',
      name: 'Очки',
      colour: COLOR_VARS,
      contents: [
        { kind: 'block', type: 'ek_score_add' },
      ],
    },
    // ─── Advanced Python — открывается детям 11+ после L6 ───
    {
      kind: 'category',
      name: '🔢 Числа',
      colour: COLOR_NUM,
      contents: [
        { kind: 'block', type: 'ek_number' },
        { kind: 'block', type: 'ek_var_set' },
        { kind: 'block', type: 'ek_var_change' },
        { kind: 'block', type: 'ek_var_get' },
        { kind: 'block', type: 'ek_math_op' },
      ],
    },
    {
      kind: 'category',
      name: '🧠 Логика',
      colour: COLOR_LOGIC,
      contents: [
        { kind: 'block', type: 'ek_compare' },
        { kind: 'block', type: 'ek_if_generic' },
        { kind: 'block', type: 'ek_if_else_generic' },
      ],
    },
    {
      kind: 'category',
      name: '🔁 Циклы',
      colour: COLOR_LOOPS,
      contents: [
        { kind: 'block', type: 'ek_for_range' },
        { kind: 'block', type: 'ek_while' },
      ],
    },
    {
      kind: 'category',
      name: '📝 Текст',
      colour: COLOR_TEXT,
      contents: [
        { kind: 'block', type: 'ek_text' },
        { kind: 'block', type: 'ek_print' },
        { kind: 'block', type: 'ek_fstring' },
      ],
    },
    {
      kind: 'category',
      name: '📋 Списки',
      colour: COLOR_LISTS,
      contents: [
        { kind: 'block', type: 'ek_list_empty' },
        { kind: 'block', type: 'ek_list_append' },
        { kind: 'block', type: 'ek_list_len' },
      ],
    },
    {
      kind: 'category',
      name: '📖 Функции',
      colour: COLOR_FN,
      contents: [
        { kind: 'block', type: 'ek_def' },
        { kind: 'block', type: 'ek_return' },
        { kind: 'block', type: 'ek_call' },
      ],
    },
  ],
}
