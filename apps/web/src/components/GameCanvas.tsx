import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { Command } from '../lib/blocks'

export interface GameCanvasHandle {
  reset: () => void
  play: (commands: Command[]) => Promise<void>
}

const GRID = 10
const CELL = 48
const CANVAS_SIZE = GRID * CELL

type Dir = 0 | 1 | 2 | 3 // 0=вверх,1=вправо,2=вниз,3=влево

interface GameState {
  x: number
  y: number
  dir: Dir
  blocks: Map<string, string>
  say: string | null
  jumping: boolean
}

function initState(): GameState {
  return {
    x: Math.floor(GRID / 2),
    y: Math.floor(GRID / 2),
    dir: 0,
    blocks: new Map(),
    say: null,
    jumping: false,
  }
}

const COLORS: Record<string, string> = {
  red: '#ff5464',
  blue: '#4c97ff',
  green: '#5ba55b',
  yellow: '#ffd644',
  purple: '#c879ff',
  black: '#2e3340',
}

const ROTATION: Record<Dir, number> = { 0: -90, 1: 0, 2: 90, 3: 180 }

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const GameCanvas = forwardRef<GameCanvasHandle>(function GameCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<GameState>(initState())
  const [, forceRender] = useState(0)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const s = stateRef.current

    ctx.save()
    ctx.fillStyle = '#1a2030'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // grid
    ctx.strokeStyle = '#2a3142'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL + 0.5, 0)
      ctx.lineTo(i * CELL + 0.5, CANVAS_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL + 0.5)
      ctx.lineTo(CANVAS_SIZE, i * CELL + 0.5)
      ctx.stroke()
    }

    // blocks
    for (const [key, color] of s.blocks.entries()) {
      const [bx, by] = key.split(',').map(Number)
      ctx.fillStyle = COLORS[color] || '#999'
      ctx.fillRect(bx * CELL + 4, by * CELL + 4, CELL - 8, CELL - 8)
    }

    // character
    ctx.save()
    const cx = s.x * CELL + CELL / 2
    const cy = s.y * CELL + CELL / 2 - (s.jumping ? 10 : 0)
    ctx.translate(cx, cy)
    ctx.rotate((ROTATION[s.dir] * Math.PI) / 180)
    ctx.font = `${CELL - 8}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🐶', 0, 0)
    ctx.restore()

    // speech bubble
    if (s.say) {
      const tx = s.x * CELL + CELL / 2
      const ty = s.y * CELL - 6
      ctx.font = '14px system-ui, sans-serif'
      const metric = ctx.measureText(s.say)
      const w = Math.min(CANVAS_SIZE - 8, metric.width + 16)
      const bx = Math.max(4, Math.min(CANVAS_SIZE - w - 4, tx - w / 2))
      const by = Math.max(4, ty - 22)
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#2a3142'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect?.(bx, by, w, 22, 8)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#111'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.say, bx + w / 2, by + 11)
    }

    ctx.restore()
  }, [])

  const step = useCallback(
    async (cmd: Command) => {
      const s = stateRef.current
      switch (cmd.op) {
        case 'say':
          s.say = cmd.text
          render()
          await delay(Math.min(4000, 700 + cmd.text.length * 40))
          s.say = null
          render()
          break
        case 'move_forward': {
          const steps = cmd.steps ?? 1
          for (let i = 0; i < steps; i++) {
            const [dx, dy] = dirDelta(s.dir)
            const nx = s.x + dx
            const ny = s.y + dy
            if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
              s.say = 'Там стена!'
              render()
              await delay(600)
              s.say = null
              render()
              return
            }
            s.x = nx
            s.y = ny
            render()
            await delay(220)
          }
          break
        }
        case 'turn_left':
          s.dir = ((s.dir + 3) % 4) as Dir
          render()
          await delay(180)
          break
        case 'turn_right':
          s.dir = ((s.dir + 1) % 4) as Dir
          render()
          await delay(180)
          break
        case 'jump':
          s.jumping = true
          render()
          await delay(220)
          s.jumping = false
          render()
          await delay(120)
          break
        case 'wait':
          await delay(cmd.seconds * 1000)
          break
        case 'place_block':
          s.blocks.set(`${s.x},${s.y}`, cmd.color)
          render()
          await delay(160)
          break
      }
    },
    [render]
  )

  const reset = useCallback(() => {
    stateRef.current = initState()
    render()
    forceRender((n) => n + 1)
  }, [render])

  const play = useCallback(
    async (commands: Command[]) => {
      for (const cmd of commands) {
        await step(cmd)
      }
    },
    [step]
  )

  useImperativeHandle(ref, () => ({ reset, play }), [reset, play])

  useEffect(() => {
    render()
  }, [render])

  return (
    <div className="game-canvas-wrap">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="game-canvas"
      />
      <footer className="game-legend">
        🐶 — это твой персонаж. Клавиша «Запустить» двигает его по командам.
      </footer>
    </div>
  )
})

function dirDelta(d: Dir): [number, number] {
  switch (d) {
    case 0:
      return [0, -1]
    case 1:
      return [1, 0]
    case 2:
      return [0, 1]
    case 3:
      return [-1, 0]
  }
}

export default GameCanvas
