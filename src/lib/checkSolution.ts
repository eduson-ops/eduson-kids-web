// Движок проверки решений для пазлов тренажёров.
// Принимает Python-код, прогоняет через runPython (Pyodide Web Worker),
// затем сравнивает полученные команды/stdout с ожиданиями задачи.

import type { PuzzleTask, CheckKind } from './puzzles'
import { runPython } from './pyodide-executor'
import {
  ANGLE_RANGE,
  OUTPUT_PREVIEW_LIMIT,
  SIM_BOUNDS,
  SIM_DEFAULT_ANGLE,
  USES_FEATURE_MIN_CALLS,
} from './constants'

export interface CheckResult {
  passed: boolean
  message: string
  partial?: number
  details?: string
  // Полезно для превью: тут лежат сырые команды чтобы нарисовать сцену.
  commands?: RawCommand[]
  stdout?: string[]
  error?: string
}

// Команда из Python — произвольный объект с полем op.
export interface RawCommand {
  op: string
  [k: string]: unknown
}

interface SimState {
  x: number
  z: number
  angleDeg: number // 0 = смотрит по −Z (вперёд); +90 = направо (в +X); −90 = налево (−X)
  // Лимиты поля для безопасности
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  outOfBounds: boolean
}

function newSim(startX = 0, startZ = 0): SimState {
  return {
    x: startX,
    z: startZ,
    angleDeg: SIM_DEFAULT_ANGLE,
    minX: SIM_BOUNDS.MIN_X,
    maxX: SIM_BOUNDS.MAX_X,
    minZ: SIM_BOUNDS.MIN_Z,
    maxZ: SIM_BOUNDS.MAX_Z,
    outOfBounds: false,
  }
}

/**
 * Симулируем движение игрока по командам.
 * Предполагаем:
 * - Старт: angleDeg = 0 (смотрит по −Z).
 * - player_move dx/dz в local-frame: dz<0 = вперёд. Мы применяем ориентацию.
 */
export function simulatePlayer(cmds: RawCommand[], startX = 0, startZ = 0): SimState {
  const sim = newSim(startX, startZ)

  for (const c of cmds) {
    if (c.op === 'player_turn') {
      const deg = typeof c.degrees === 'number' ? c.degrees : 0
      sim.angleDeg = (sim.angleDeg + deg) % ANGLE_RANGE.FULL_CIRCLE
      // нормализуем в [−180, 180]
      if (sim.angleDeg > ANGLE_RANGE.MAX) sim.angleDeg -= ANGLE_RANGE.FULL_CIRCLE
      if (sim.angleDeg < ANGLE_RANGE.MIN) sim.angleDeg += ANGLE_RANGE.FULL_CIRCLE
    } else if (c.op === 'player_move') {
      const dx = typeof c.dx === 'number' ? c.dx : 0
      const dz = typeof c.dz === 'number' ? c.dz : 0
      // Применяем поворот к (dx, dz). angleDeg кратен 90°.
      // При angle=0 (смотрит по −Z), вперёд = dz<0. Это и есть базовое направление.
      const a = ((sim.angleDeg % ANGLE_RANGE.FULL_CIRCLE) + ANGLE_RANGE.FULL_CIRCLE) % ANGLE_RANGE.FULL_CIRCLE
      let fx = 0
      let fz = 0
      if (a === 0) {
        fx = dx
        fz = dz
      } else if (a === 90) {
        // смотрит направо (в +X): «вперёд» теперь = +X. (dx, dz) -> (-dz, dx)
        fx = -dz
        fz = dx
      } else if (a === 180) {
        fx = -dx
        fz = -dz
      } else if (a === 270) {
        // смотрит налево (−X): (dx, dz) -> (dz, -dx)
        fx = dz
        fz = -dx
      } else {
        // Неожидаемый угол — всё равно двигаемся без поворота
        fx = dx
        fz = dz
      }
      sim.x += fx
      sim.z += fz
      if (
        sim.x < sim.minX ||
        sim.x > sim.maxX ||
        sim.z < sim.minZ ||
        sim.z > sim.maxZ
      ) {
        sim.outOfBounds = true
      }
    }
    // jump / say / place_block / print — не трогают позицию игрока
  }

  return sim
}

function collectPlaceBlocks(
  cmds: RawCommand[],
): Array<{ x: number; y: number; z: number; color: string }> {
  const out: Array<{ x: number; y: number; z: number; color: string }> = []
  for (const c of cmds) {
    if (c.op === 'place_block') {
      const x = typeof c.x === 'number' ? c.x : 0
      const y = typeof c.y === 'number' ? c.y : 0
      const z = typeof c.z === 'number' ? c.z : 0
      const color = typeof c.color === 'string' ? c.color : 'red'
      out.push({ x, y, z, color })
    }
  }
  return out
}

function collectStdout(cmds: RawCommand[]): string[] {
  const out: string[] = []
  for (const c of cmds) {
    if (c.op === 'print') {
      const t = typeof c.text === 'string' ? c.text : ''
      out.push(t)
    }
  }
  return out
}

function collectStderr(cmds: RawCommand[]): string[] {
  const out: string[] = []
  for (const c of cmds) {
    if (c.op === 'stderr') {
      const t = typeof c.text === 'string' ? c.text : ''
      if (t) out.push(t)
    }
  }
  return out
}

/** Приводит любой блок-ключ к строке "x|y|z" для set. */
function blockKey(b: { x: number; y: number; z: number; color?: string }, strictColor: boolean) {
  return strictColor ? `${b.x}|${b.y}|${b.z}|${b.color ?? ''}` : `${b.x}|${b.y}|${b.z}`
}

function checkReachGoal(
  cmds: RawCommand[],
  check: Extract<CheckKind, { kind: 'reach-goal' }>,
): CheckResult {
  const startX = check.startX ?? 0
  const startZ = check.startZ ?? 0
  const sim = simulatePlayer(cmds, startX, startZ)
  if (sim.outOfBounds) {
    return {
      passed: false,
      message: 'Ой, пингвин убежал за край поля.',
      details: `Конечная позиция (${sim.x}, ${sim.z}) — вне игрового поля.`,
    }
  }
  if (sim.x === check.goalX && sim.z === check.goalZ) {
    return {
      passed: true,
      message: 'Ты дошёл до цели!',
    }
  }
  return {
    passed: false,
    message: 'Пингвин не дошёл до цели.',
    details: `Ты оказался в (${sim.x}, ${sim.z}), а цель — (${check.goalX}, ${check.goalZ}). Проверь повороты и количество шагов.`,
  }
}

function checkBuildPattern(
  cmds: RawCommand[],
  check: Extract<CheckKind, { kind: 'build-pattern' }>,
): CheckResult {
  const placed = collectPlaceBlocks(cmds)
  const strictColor = check.strictColor ?? false

  const expectedKeys = new Set(check.expectedBlocks.map((b) => blockKey(b, strictColor)))
  const placedKeys = new Set(placed.map((b) => blockKey(b, strictColor)))

  let matched = 0
  for (const k of expectedKeys) {
    if (placedKeys.has(k)) matched++
  }
  const extras = [...placedKeys].filter((k) => !expectedKeys.has(k)).length

  if (matched === expectedKeys.size && extras === 0) {
    return { passed: true, message: 'Фигура собрана верно!' }
  }

  const partial = expectedKeys.size > 0 ? matched / expectedKeys.size : 0
  const missing = expectedKeys.size - matched
  const details = [
    missing > 0 ? `Не хватает блоков: ${missing}.` : null,
    extras > 0 ? `Лишних блоков: ${extras}.` : null,
    placed.length === 0 ? 'Ни одного блока не поставлено.' : null,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    passed: false,
    partial,
    message: 'Фигура не совпадает с ожиданием.',
    details: details || 'Проверь координаты и цвета.',
  }
}

function checkExactCommands(
  cmds: RawCommand[],
  check: Extract<CheckKind, { kind: 'exact-commands' }>,
): CheckResult {
  let count = 0
  for (const c of cmds) {
    if (check.ops.includes(c.op)) count++
  }
  const minOk = check.minCount === undefined || count >= check.minCount
  const maxOk = check.maxCount === undefined || count <= check.maxCount
  if (minOk && maxOk) {
    return { passed: true, message: 'Команды на месте!' }
  }
  return {
    passed: false,
    message: 'Нужные команды не использованы в нужном количестве.',
    details: `Найдено ${count} команд из ${check.ops.join('/')}. Требуется в диапазоне [${check.minCount ?? 0}..${check.maxCount ?? '∞'}].`,
  }
}

function checkOutputMatch(
  cmds: RawCommand[],
  check: Extract<CheckKind, { kind: 'output-match' }>,
): CheckResult {
  const lines = collectStdout(cmds).map((s) => s.trim())
  const expected = Array.isArray(check.expected)
    ? check.expected.map((s) => s.trim())
    : [check.expected.trim()]
  const mode = check.mode ?? 'exact'

  if (mode === 'exact') {
    if (lines.length !== expected.length) {
      return {
        passed: false,
        message: 'Количество строк не совпадает.',
        details: `Ожидается ${expected.length}, получено ${lines.length}. Получено: [${lines.slice(0, OUTPUT_PREVIEW_LIMIT).join(', ')}${lines.length > OUTPUT_PREVIEW_LIMIT ? '…' : ''}]`,
      }
    }
    for (let i = 0; i < expected.length; i++) {
      if (lines[i] !== expected[i]) {
        return {
          passed: false,
          message: 'Вывод отличается от ожидаемого.',
          details: `Строка ${i + 1}: ждали «${expected[i]}», а получилось «${lines[i]}».`,
        }
      }
    }
    return { passed: true, message: 'Вывод совпадает!' }
  }

  // includes — каждая ожидаемая строка должна быть где-то
  for (const e of expected) {
    if (!lines.includes(e)) {
      return {
        passed: false,
        message: 'В выводе не хватает ожидаемой строки.',
        details: `Не найдена строка «${e}». Напечатано: [${lines.slice(0, OUTPUT_PREVIEW_LIMIT).join(', ')}${lines.length > OUTPUT_PREVIEW_LIMIT ? '…' : ''}]`,
      }
    }
  }
  return { passed: true, message: 'Все ожидаемые строки на месте!' }
}

function checkUsesFeature(
  code: string,
  check: Extract<CheckKind, { kind: 'uses-feature' }>,
): CheckResult {
  // Убираем комментарии и строки из анализа, чтобы не поймать «for» внутри строки
  const clean = stripPythonStringsAndComments(code)

  const checks: Record<string, RegExp> = {
    for: /\bfor\s+\w+\s+in\b/,
    if: /\bif\b/,
    while: /\bwhile\b/,
    def: /\bdef\s+\w+\s*\(/,
    range: /\brange\s*\(/,
  }

  const missing: string[] = []
  for (const req of check.required) {
    if (req === 'call3') {
      // минимум 3 вызова функций (не считая встроенные для проверки).
      // Считаем число вызовов идентификатор(... — любых.
      const matches = clean.match(/\b[A-Za-z_а-яА-Я][A-Za-z_0-9а-яА-Я]*\s*\(/g) ?? []
      if (matches.length < USES_FEATURE_MIN_CALLS) missing.push(`≥${USES_FEATURE_MIN_CALLS} вызовов функций`)
      continue
    }
    const rx = checks[req]
    if (!rx || !rx.test(clean)) missing.push(req)
  }

  if (missing.length === 0) {
    return { passed: true, message: 'Все нужные конструкции есть!' }
  }
  return {
    passed: false,
    message: 'Нужных конструкций в коде не хватает.',
    details: `Не найдено: ${missing.join(', ')}.`,
  }
}

/**
 * Очень легковесный «стрип» строк и комментариев. Не полноценный парсер,
 * но достаточно надёжен чтобы ключевые слова не ложно-матчились внутри "if" как строки.
 */
function stripPythonStringsAndComments(code: string): string {
  // Удаляем тройные строки (в первую очередь)
  let s = code.replace(/"""[\s\S]*?"""/g, '').replace(/'''[\s\S]*?'''/g, '')
  // Удаляем строки одной кавычкой (не идеально, но достаточно)
  s = s.replace(/"(?:\\.|[^"\\])*"/g, '""').replace(/'(?:\\.|[^'\\])*'/g, "''")
  // Удаляем комментарии
  s = s.replace(/#[^\n]*/g, '')
  return s
}

/**
 * Главная функция проверки.
 * Запускает код через Pyodide, потом считает команды и сравнивает с task.check.
 */
export async function checkSolution(
  code: string,
  task: PuzzleTask,
): Promise<CheckResult> {
  let rawCommands: RawCommand[] = []
  let execError: string | null = null

  try {
    const result = (await runPython(code)) as unknown[]
    rawCommands = result as RawCommand[]
  } catch (err) {
    execError = err instanceof Error ? err.message : String(err)
  }

  const stdout = collectStdout(rawCommands)
  const stderr = collectStderr(rawCommands)

  if (execError) {
    return {
      passed: false,
      message: 'Ошибка выполнения кода',
      details: execError,
      error: execError,
      commands: rawCommands,
      stdout,
    }
  }

  let result: CheckResult
  switch (task.check.kind) {
    case 'reach-goal':
      result = checkReachGoal(rawCommands, task.check)
      break
    case 'build-pattern':
      result = checkBuildPattern(rawCommands, task.check)
      break
    case 'exact-commands':
      result = checkExactCommands(rawCommands, task.check)
      break
    case 'output-match':
      result = checkOutputMatch(rawCommands, task.check)
      break
    case 'uses-feature':
      result = checkUsesFeature(code, task.check)
      break
    default: {
      // Исчерпывающий перебор для TS
      const _exhaustive: never = task.check
      void _exhaustive
      result = { passed: false, message: 'Неизвестный тип проверки' }
    }
  }

  const ret: CheckResult = { ...result, commands: rawCommands, stdout }
  if (stderr.length > 0) ret.error = stderr.join('\n')
  return ret
}
