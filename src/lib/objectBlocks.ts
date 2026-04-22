import * as Blockly from 'blockly'
import { pythonGenerator, Order } from 'blockly/python'

/**
 * Per-Object блоки — для программирования поведения конкретного объекта
 * на сцене (как sprites в Scratch). Префикс: `obj_`
 *
 * Events (hat blocks):
 *   obj_on_start  — при запуске сцены
 *   obj_on_touch  — когда игрок коснулся этого объекта
 *   obj_on_click  — когда игрок кликнул (в будущем)
 *
 * Actions for `this` (текущий объект):
 *   obj_move      — сдвинуть объект на dx/dy/dz
 *   obj_rotate    — повернуть объект
 *   obj_set_color — перекрасить
 *   obj_set_scale — изменить размер
 *   obj_say       — floating label
 *   obj_hide / obj_show — спрятать/показать
 *   obj_destroy   — удалить объект со сцены
 *
 * Плюс доступны все те же числа/логика/циклы/переменные/функции из базового
 * набора ek_* — это делает единый язык и не плодит дубликаты.
 */

const C_EVENTS  = '#FFB4C8'
const C_MOTION  = '#6B5CE7'
const C_LOOKS   = '#c879ff'
const C_CONTROL = '#FFD43C'

let installed = false

export function installObjectBlocks() {
  if (installed) return
  installed = true

  Blockly.defineBlocksWithJsonArray([
    // ── Hat events ──
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
    // ── Motion of self ──
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
    // ── Looks ──
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
    // ── Control ──
    {
      type: 'obj_destroy',
      message0: '💥 удалить себя',
      previousStatement: null,
      colour: C_CONTROL,
      tooltip: 'Убрать ЭТОТ объект со сцены навсегда',
    },
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
  ])

  // ─── Python-генераторы ────────────────────────────────────────
  // Каждый hat оборачивает тело в отдельную функцию — runtime потом
  // выберет какую вызвать по событию.

  const body = (b: Blockly.Block) => {
    const raw = pythonGenerator.statementToCode(b, 'DO')
    return raw.length ? raw : '    pass\n'
  }

  pythonGenerator.forBlock['obj_on_start'] = (b) =>
    `def on_start():\n${body(b)}\n`

  pythonGenerator.forBlock['obj_on_touch'] = (b) =>
    `def on_touch():\n${body(b)}\n`

  pythonGenerator.forBlock['obj_on_tick'] = (b) => {
    const sec = Number(b.getFieldValue('SECONDS')) || 1
    return `# on_tick interval: ${sec}s\ndef on_tick():\n${body(b)}\n`
  }

  pythonGenerator.forBlock['obj_on_broadcast'] = (b) => {
    const name = String(b.getFieldValue('NAME') || 'msg').replace(/[^a-zA-Z_а-яА-Я0-9]/g, '_')
    return `def on_${name}():\n${body(b)}\n`
  }

  pythonGenerator.forBlock['obj_move'] = (b) => {
    const dx = Number(b.getFieldValue('DX')) || 0
    const dy = Number(b.getFieldValue('DY')) || 0
    const dz = Number(b.getFieldValue('DZ')) || 0
    return `    this.move(${dx}, ${dy}, ${dz})\n`
  }
  pythonGenerator.forBlock['obj_rotate'] = (b) => {
    const deg = Number(b.getFieldValue('DEG')) || 0
    return `    this.rotate(${deg})\n`
  }
  pythonGenerator.forBlock['obj_set_scale'] = (b) => {
    const s = Number(b.getFieldValue('S')) || 1
    return `    this.set_scale(${s})\n`
  }
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
  pythonGenerator.forBlock['obj_destroy'] = () => `    this.destroy()\n`
  pythonGenerator.forBlock['obj_wait'] = (b) => {
    const s = Number(b.getFieldValue('SECONDS')) || 1
    return `    this.wait(${s})\n`
  }
  pythonGenerator.forBlock['obj_broadcast'] = (b) => {
    const name = String(b.getFieldValue('NAME') || 'msg').replace(/"/g, '\\"')
    return `    this.broadcast("${name}")\n`
  }

  void Order.ATOMIC
}

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
        { kind: 'block', type: 'obj_rotate' },
        { kind: 'block', type: 'obj_set_scale' },
      ],
    },
    {
      kind: 'category',
      name: '🎨 Внешний вид',
      colour: C_LOOKS,
      contents: [
        { kind: 'block', type: 'obj_set_color' },
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
 */
export function wrapObjectPython(objectId: string, generatedPython: string): string {
  const safeId = objectId.replace(/"/g, '\\"')
  return `
_commands = []
def _emit(op, **kwargs):
    c = {"op": op}
    c.update(kwargs)
    _commands.append(c)

class _This:
    def __init__(self, oid):
        self._oid = oid
    def move(self, dx=0, dy=0, dz=0):
        _emit("obj_move", target=self._oid, dx=float(dx), dy=float(dy), dz=float(dz))
    def rotate(self, deg=0):
        _emit("obj_rotate", target=self._oid, deg=float(deg))
    def set_color(self, c="red"):
        _emit("obj_set_color", target=self._oid, color=str(c))
    def set_scale(self, s=1):
        try: s = float(s)
        except: s = 1.0
        _emit("obj_set_scale", target=self._oid, s=max(0.1, min(s, 10)))
    def say(self, text=""):
        _emit("obj_say", target=self._oid, text=str(text)[:140])
    def hide(self):
        _emit("obj_hide", target=self._oid)
    def show(self):
        _emit("obj_show", target=self._oid)
    def destroy(self):
        _emit("obj_destroy", target=self._oid)
    def wait(self, seconds=1):
        try: s = float(seconds)
        except: s = 1.0
        _emit("wait", seconds=max(0.1, min(s, 60)))
    def broadcast(self, name=""):
        _emit("obj_broadcast", target=self._oid, name=str(name)[:60])
    # ── Global-scope helpers (работают в Play и Studio Test) ──
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
