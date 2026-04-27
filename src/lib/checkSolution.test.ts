// Unit-тесты для checkSolution.ts (R3 — regression-страховка перед рефакторингом).
//
// Тесты используют API, совместимый с Vitest и Jest (describe/it/expect/vi.mock).
// Если в проекте появится vitest — `npx vitest run src/lib/checkSolution.test.ts`.
//
// ВАЖНО: модуль `pyodide-executor` мокается, чтобы тесты были полностью самодостаточны
// и не требовали поднятия Pyodide WebWorker. Через mock мы подаём заранее заготовленный
// массив RawCommand[] прямо во входной поток `checkSolution`.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PuzzleTask } from './puzzles'
import type { RawCommand } from './checkSolution'

// ─── Mock pyodide-executor ────────────────────────────────────────────────────
// Каждый тест выставляет `__nextCommands` через хелпер setNextCommands, и
// мок просто резолвится этим массивом.
let __nextCommands: RawCommand[] = []
let __throwError: Error | null = null

vi.mock('./pyodide-executor', () => ({
  runPython: vi.fn(async (_code: string) => {
    if (__throwError) throw __throwError
    return __nextCommands
  }),
}))

// Импортируем уже после mock, иначе модуль возьмёт реальную версию.
import {
  checkSolution,
  simulatePlayer,
} from './checkSolution'

function setNextCommands(cmds: RawCommand[]) {
  __nextCommands = cmds
  __throwError = null
}

function setNextError(err: Error) {
  __throwError = err
  __nextCommands = []
}

// ─── Хелперы для построения PuzzleTask с конкретным check.kind ────────────────
function reachGoalTask(goalX: number, goalZ: number, startX = 0, startZ = 0): PuzzleTask {
  return {
    id: 't',
    trainerId: 'path',
    n: 1,
    title: 't',
    prompt: 'p',
    hints: [],
    check: { kind: 'reach-goal', goalX, goalZ, startX, startZ },
    reward: { coins: 0, xp: 0 },
  }
}

function buildPatternTask(
  expectedBlocks: Array<{ x: number; y: number; z: number; color?: string }>,
  strictColor = false,
): PuzzleTask {
  return {
    id: 't',
    trainerId: 'tower',
    n: 1,
    title: 't',
    prompt: 'p',
    hints: [],
    check: { kind: 'build-pattern', expectedBlocks, strictColor },
    reward: { coins: 0, xp: 0 },
  }
}

function outputMatchTask(
  expected: string | string[],
  mode: 'exact' | 'includes' = 'exact',
): PuzzleTask {
  return {
    id: 't',
    trainerId: 'function',
    n: 1,
    title: 't',
    prompt: 'p',
    hints: [],
    check: { kind: 'output-match', expected, mode },
    reward: { coins: 0, xp: 0 },
  }
}

function usesFeatureTask(
  required: Array<'for' | 'if' | 'def' | 'range' | 'while' | 'call3'>,
): PuzzleTask {
  return {
    id: 't',
    trainerId: 'loop',
    n: 1,
    title: 't',
    prompt: 'p',
    hints: [],
    check: { kind: 'uses-feature', required },
    reward: { coins: 0, xp: 0 },
  }
}

function exactCommandsTask(ops: string[], minCount?: number, maxCount?: number): PuzzleTask {
  return {
    id: 't',
    trainerId: 'path',
    n: 1,
    title: 't',
    prompt: 'p',
    hints: [],
    check: { kind: 'exact-commands', ops, minCount, maxCount },
    reward: { coins: 0, xp: 0 },
  }
}

beforeEach(() => {
  __nextCommands = []
  __throwError = null
})

// ─── reach-goal ───────────────────────────────────────────────────────────────
describe('checkSolution → reach-goal', () => {
  it('passes when player reaches the goal at (1, 0)', async () => {
    // Чтобы попасть в (1,0), стартуя в (0,0), нужно сначала повернуть направо
    // (angle=90) и пройти один шаг "вперёд": dz=-1 → fx=-(-1)=+1.
    setNextCommands([
      { op: 'player_turn', degrees: 90 },
      { op: 'player_move', dx: 0, dz: -1 },
    ])
    const result = await checkSolution('move_forward(1)', reachGoalTask(1, 0))
    expect(result.passed).toBe(true)
    expect(result.message).toMatch(/дошёл до цели/i)
  })

  it('fails when player ends at (1,0) but goal is (2,0)', async () => {
    setNextCommands([
      { op: 'player_turn', degrees: 90 },
      { op: 'player_move', dx: 0, dz: -1 },
    ])
    const result = await checkSolution('code', reachGoalTask(2, 0))
    expect(result.passed).toBe(false)
    expect(result.details).toContain('(1, 0)')
  })

  it('fails when player goes out of SIM_BOUNDS (z < -20)', async () => {
    // 25 шагов вперёд → z = -25, выход за границу minZ = -20.
    const cmds: RawCommand[] = []
    for (let i = 0; i < 25; i++) cmds.push({ op: 'player_move', dx: 0, dz: -1 })
    setNextCommands(cmds)
    const result = await checkSolution('code', reachGoalTask(0, -25))
    expect(result.passed).toBe(false)
    expect(result.message).toMatch(/край поля/i)
  })

  it('fails when player did not move at all', async () => {
    setNextCommands([])
    const result = await checkSolution('# nothing', reachGoalTask(0, -1))
    expect(result.passed).toBe(false)
    expect(result.details).toContain('(0, 0)')
  })

  it('passes complex zig-zag path leading to the goal (2, -4)', async () => {
    // Имитация программы из path-5: forward 2, right, forward 2, left, forward 2.
    // Стартовое направление: angle=0 → forward = dz<0.
    setNextCommands([
      { op: 'player_move', dx: 0, dz: -2 }, // (0, -2)
      { op: 'player_turn', degrees: 90 }, // angle=90, "вперёд" = +X
      { op: 'player_move', dx: 0, dz: -2 }, // fx=2, fz=0 → (2, -2)
      { op: 'player_turn', degrees: -90 }, // angle=0
      { op: 'player_move', dx: 0, dz: -2 }, // (2, -4)
    ])
    const result = await checkSolution('code', reachGoalTask(2, -4))
    expect(result.passed).toBe(true)
  })
})

// ─── build-pattern ────────────────────────────────────────────────────────────
describe('checkSolution → build-pattern', () => {
  it('passes when 3 blocks placed at expected positions (no strict color)', async () => {
    setNextCommands([
      { op: 'place_block', x: 0, y: 0, z: 0, color: 'red' },
      { op: 'place_block', x: 1, y: 0, z: 0, color: 'red' },
      { op: 'place_block', x: 2, y: 0, z: 0, color: 'red' },
    ])
    const task = buildPatternTask(
      [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
      ],
      false,
    )
    const result = await checkSolution('code', task)
    expect(result.passed).toBe(true)
  })

  it('fails when block coordinates are wrong', async () => {
    setNextCommands([
      { op: 'place_block', x: 5, y: 0, z: 5, color: 'red' },
      { op: 'place_block', x: 6, y: 0, z: 6, color: 'red' },
      { op: 'place_block', x: 7, y: 0, z: 7, color: 'red' },
    ])
    const task = buildPatternTask([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 },
    ])
    const result = await checkSolution('code', task)
    expect(result.passed).toBe(false)
    expect(result.partial).toBe(0)
  })

  it('FAILS (not passes) when extras are present: extras=0 is required for pass', async () => {
    // ВАЖНО: текущая логика checkBuildPattern требует extras === 0,
    // то есть лишние блоки → fail. Это поведение мы фиксируем regression-тестом.
    setNextCommands([
      { op: 'place_block', x: 0, y: 0, z: 0, color: 'red' },
      { op: 'place_block', x: 1, y: 0, z: 0, color: 'red' },
      { op: 'place_block', x: 99, y: 99, z: 99, color: 'red' }, // extra
    ])
    const task = buildPatternTask([
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
    ])
    const result = await checkSolution('code', task)
    expect(result.passed).toBe(false)
    expect(result.details).toMatch(/Лишних/i)
  })
})

// ─── output-match ─────────────────────────────────────────────────────────────
describe('checkSolution → output-match', () => {
  it("passes when print('hello') matches expected 'hello' (exact mode)", async () => {
    setNextCommands([{ op: 'print', text: 'hello' }])
    const result = await checkSolution("print('hello')", outputMatchTask('hello'))
    expect(result.passed).toBe(true)
  })

  it("fails when 'hello\\nworld' is printed but only 'hello' expected (line count mismatch)", async () => {
    setNextCommands([
      { op: 'print', text: 'hello' },
      { op: 'print', text: 'world' },
    ])
    const result = await checkSolution('code', outputMatchTask('hello'))
    expect(result.passed).toBe(false)
    expect(result.message).toMatch(/Количество строк/i)
  })

  it('passes when output has surrounding whitespace (trim is applied)', async () => {
    setNextCommands([{ op: 'print', text: '  hello  ' }])
    const result = await checkSolution('code', outputMatchTask('hello'))
    expect(result.passed).toBe(true)
  })

  it('passes in includes-mode when expected line is present among others', async () => {
    setNextCommands([
      { op: 'print', text: 'noise' },
      { op: 'print', text: 'hello' },
      { op: 'print', text: 'more noise' },
    ])
    const result = await checkSolution('code', outputMatchTask('hello', 'includes'))
    expect(result.passed).toBe(true)
  })
})

// ─── uses-feature ─────────────────────────────────────────────────────────────
describe('checkSolution → uses-feature', () => {
  it('passes when code contains `for x in range(...)` and required = [for, range]', async () => {
    setNextCommands([])
    const code = 'for x in range(5):\n    move_forward(1)\n'
    const result = await checkSolution(code, usesFeatureTask(['for', 'range']))
    expect(result.passed).toBe(true)
  })

  it('fails when code lacks `if` but it is required', async () => {
    setNextCommands([])
    const code = 'move_forward(3)\nturn_right()\n'
    const result = await checkSolution(code, usesFeatureTask(['if']))
    expect(result.passed).toBe(false)
    expect(result.details).toContain('if')
  })

  it('does not match keywords inside string literals (strip-strings logic)', async () => {
    setNextCommands([])
    // "if" внутри строки не должно засчитываться.
    const code = 'print("if you see this, it should not count")\n'
    const result = await checkSolution(code, usesFeatureTask(['if']))
    expect(result.passed).toBe(false)
  })
})

// ─── exact-commands ───────────────────────────────────────────────────────────
describe('checkSolution → exact-commands', () => {
  it('passes when exactly 5 player_move commands and required range [5..5]', async () => {
    const cmds: RawCommand[] = []
    for (let i = 0; i < 5; i++) cmds.push({ op: 'player_move', dx: 0, dz: -1 })
    setNextCommands(cmds)
    const result = await checkSolution('code', exactCommandsTask(['player_move'], 5, 5))
    expect(result.passed).toBe(true)
  })

  it('fails when 6 player_move commands but max is 5', async () => {
    const cmds: RawCommand[] = []
    for (let i = 0; i < 6; i++) cmds.push({ op: 'player_move', dx: 0, dz: -1 })
    setNextCommands(cmds)
    const result = await checkSolution('code', exactCommandsTask(['player_move'], 5, 5))
    expect(result.passed).toBe(false)
    expect(result.details).toContain('6')
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('checkSolution → edge cases', () => {
  it('returns error result when runPython throws (Pyodide execution error)', async () => {
    setNextError(new Error('SyntaxError: invalid syntax'))
    const result = await checkSolution('def broken(:', reachGoalTask(0, 0))
    expect(result.passed).toBe(false)
    expect(result.message).toMatch(/Ошибка выполнения/i)
    expect(result.error).toContain('SyntaxError')
  })

  it('handles empty code with reach-goal at start position (0,0)', async () => {
    setNextCommands([])
    // Цель = старт (0,0) → стоит на месте и уже там.
    const result = await checkSolution('', reachGoalTask(0, 0))
    expect(result.passed).toBe(true)
  })

  it('always returns commands and stdout in result for preview', async () => {
    setNextCommands([
      { op: 'print', text: 'hi' },
      { op: 'player_move', dx: 0, dz: -1 },
    ])
    const result = await checkSolution('code', reachGoalTask(99, 99))
    expect(result.commands).toHaveLength(2)
    expect(result.stdout).toEqual(['hi'])
  })
})

// ─── simulatePlayer (внутренний помощник, экспортируется) ─────────────────────
describe('simulatePlayer (sanity)', () => {
  it('returns starting position for empty command list', () => {
    const sim = simulatePlayer([], 3, 4)
    expect(sim.x).toBe(3)
    expect(sim.z).toBe(4)
    expect(sim.outOfBounds).toBe(false)
  })

  it('flags outOfBounds when moving past +20 on X axis', () => {
    const cmds: RawCommand[] = [
      { op: 'player_turn', degrees: 90 }, // angle=90, "вперёд" = +X
    ]
    for (let i = 0; i < 25; i++) cmds.push({ op: 'player_move', dx: 0, dz: -1 })
    const sim = simulatePlayer(cmds)
    expect(sim.outOfBounds).toBe(true)
  })
})
