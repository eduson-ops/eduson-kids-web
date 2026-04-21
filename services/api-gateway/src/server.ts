// Fastify BFF для Eduson Kids Platform (Stage 1 MVP).
// Storage: JSON-файл на диске — достаточно для demo и 10-50 школ пилота.
// Когда понадобится — swap на SQLite (better-sqlite3) или Postgres (pg).

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DB_PATH = join(DATA_DIR, 'db.json')

// ───────────────────────────── Types

interface Avatar {
  name: string
  bodyColor: string
  headColor: string
  accentColor: string
  earStyle: string
  hatStyle: string
  tailStyle: string
  bodyShape: string
}

interface Progress {
  coins: number
  bestTimeMs: number | null
  completions: number
  lastPlayedAt: number
}

interface User {
  id: string
  childCode: string
  name: string
  createdAt: number
  avatar?: Avatar
  progress: Record<string, Progress> // by gameId
}

interface DB {
  version: 1
  users: Record<string, User> // by id
  byCode: Record<string, string> // childCode → userId
  sessions: Record<string, string> // token → userId
}

// ───────────────────────────── Storage

function loadDb(): DB {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    const fresh: DB = { version: 1, users: {}, byCode: {}, sessions: {} }
    writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2))
    return fresh
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8')) as DB
  } catch {
    const fresh: DB = { version: 1, users: {}, byCode: {}, sessions: {} }
    writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2))
    return fresh
  }
}

let db = loadDb()
let saveTimer: NodeJS.Timeout | null = null
function saveDb() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
  }, 200) // debounced persistence
}

// ───────────────────────────── App

const app = Fastify({ logger: { level: 'info' } })
await app.register(cors, {
  origin: (origin, cb) => cb(null, true), // MVP: open CORS. Tighten per-env.
  credentials: true,
})

// ─── auth middleware
async function authed(req: { headers: Record<string, string | string[] | undefined> }): Promise<User | null> {
  const h = req.headers['authorization']
  if (!h || typeof h !== 'string') return null
  const m = h.match(/^Bearer\s+(.+)$/)
  if (!m) return null
  const uid = db.sessions[m[1]]
  if (!uid) return null
  return db.users[uid] ?? null
}

// ─── Routes

app.get('/health', async () => ({ ok: true, ts: Date.now(), users: Object.keys(db.users).length }))

// POST /api/v1/auth/child-code  { code: "123456", name?: "Вася" }
app.post<{ Body: { code: string; name?: string } }>('/api/v1/auth/child-code', async (req, reply) => {
  const { code, name } = req.body ?? ({} as { code: string; name?: string })
  if (!code || !/^\d{6}$/.test(code)) {
    return reply.code(400).send({ error: 'bad_code', message: 'Код должен быть из 6 цифр' })
  }
  let userId = db.byCode[code]
  if (!userId) {
    userId = randomUUID()
    const user: User = {
      id: userId,
      childCode: code,
      name: name?.trim() || `Игрок-${code.slice(-3)}`,
      createdAt: Date.now(),
      progress: {},
    }
    db.users[userId] = user
    db.byCode[code] = userId
  }
  const token = randomUUID()
  db.sessions[token] = userId
  saveDb()
  const user = db.users[userId]!
  return { token, user: { id: user.id, name: user.name } }
})

// POST /api/v1/auth/guest — логин без кода, временный
app.post('/api/v1/auth/guest', async () => {
  const userId = randomUUID()
  const user: User = {
    id: userId,
    childCode: '000000',
    name: `Гость-${userId.slice(0, 4)}`,
    createdAt: Date.now(),
    progress: {},
  }
  db.users[userId] = user
  const token = randomUUID()
  db.sessions[token] = userId
  saveDb()
  return { token, user: { id: user.id, name: user.name } }
})

// GET /api/v1/me  — текущий пользователь с аватаром и прогрессом
app.get('/api/v1/me', async (req, reply) => {
  const user = await authed(req)
  if (!user) return reply.code(401).send({ error: 'unauth' })
  return { user: { id: user.id, name: user.name }, avatar: user.avatar ?? null, progress: user.progress }
})

// PUT /api/v1/avatar
app.put<{ Body: Avatar }>('/api/v1/avatar', async (req, reply) => {
  const user = await authed(req)
  if (!user) return reply.code(401).send({ error: 'unauth' })
  const a = req.body
  if (!a || typeof a !== 'object') return reply.code(400).send({ error: 'bad_body' })
  user.avatar = {
    name: String(a.name ?? 'Игрок').slice(0, 40),
    bodyColor: String(a.bodyColor ?? '#ff5ab1'),
    headColor: String(a.headColor ?? '#ff5ab1'),
    accentColor: String(a.accentColor ?? '#ffffff'),
    earStyle: String(a.earStyle ?? 'cat'),
    hatStyle: String(a.hatStyle ?? 'none'),
    tailStyle: String(a.tailStyle ?? 'cat'),
    bodyShape: String(a.bodyShape ?? 'standard'),
  }
  saveDb()
  return { ok: true, avatar: user.avatar }
})

// PUT /api/v1/progress  { gameId, coins, timeMs, completed }
app.put<{
  Body: { gameId: string; coins: number; timeMs: number; completed: boolean }
}>('/api/v1/progress', async (req, reply) => {
  const user = await authed(req)
  if (!user) return reply.code(401).send({ error: 'unauth' })
  const { gameId, coins, timeMs, completed } = req.body ?? {}
  if (!gameId || typeof gameId !== 'string') {
    return reply.code(400).send({ error: 'bad_gameId' })
  }
  const prev = user.progress[gameId] ?? {
    coins: 0,
    bestTimeMs: null,
    completions: 0,
    lastPlayedAt: 0,
  }
  const next: Progress = {
    coins: prev.coins + Math.max(0, Number(coins) || 0),
    bestTimeMs: completed
      ? Math.min(prev.bestTimeMs ?? Number(timeMs), Number(timeMs))
      : prev.bestTimeMs,
    completions: prev.completions + (completed ? 1 : 0),
    lastPlayedAt: Date.now(),
  }
  user.progress[gameId] = next
  saveDb()
  return { ok: true, progress: next }
})

// GET /api/v1/leaderboard/:gameId — топ-10 по лучшему времени
app.get<{ Params: { gameId: string } }>('/api/v1/leaderboard/:gameId', async (req) => {
  const rows: Array<{ name: string; bestTimeMs: number; coins: number }> = []
  for (const u of Object.values(db.users)) {
    const p = u.progress[req.params.gameId]
    if (p && p.bestTimeMs != null) {
      rows.push({ name: u.name, bestTimeMs: p.bestTimeMs, coins: p.coins })
    }
  }
  rows.sort((a, b) => a.bestTimeMs - b.bestTimeMs)
  return { gameId: req.params.gameId, top: rows.slice(0, 10) }
})

// ─── Boot
const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? '127.0.0.1'
try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`✅ eduson-kids api on http://${HOST}:${PORT}`)
  console.log(`   health: http://${HOST}:${PORT}/health`)
  console.log(`   storage: ${DB_PATH}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
