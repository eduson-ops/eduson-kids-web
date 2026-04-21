import * as Blockly from 'blockly'
import { pythonGenerator, Order } from 'blockly/python'
import * as Ru from 'blockly/msg/ru'

Blockly.setLocale(Ru as unknown as { [key: string]: string })

export type Command =
  | { op: 'say'; text: string }
  | { op: 'move_forward'; steps?: number }
  | { op: 'turn_left' }
  | { op: 'turn_right' }
  | { op: 'wait'; seconds: number }
  | { op: 'place_block'; color: string }
  | { op: 'jump' }

const COLOR_MOTION = '#4C97FF'
const COLOR_LOOPS = '#5BA55B'
const COLOR_EVENTS = '#FFBF00'
const COLOR_ACTIONS = '#C879FF'
const COLOR_WORLD = '#FF8C1A'

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
    // add 4 extra spaces to body
    const body = bodyRaw
      .split('\n')
      .map((l) => (l.length ? `    ${l}` : l))
      .join('\n')
    return `    for _ in range(${times}):\n${body}`
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
  ],
}
