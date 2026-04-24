// API-клиент с graceful-fallback на localStorage.
// Если бэк запущен (VITE_API_URL или /health отвечает) — используем,
// иначе продолжаем работать оффлайн. Это нужно чтобы demo работал
// даже если бэк ещё не запущен.

import type { Avatar } from './avatars'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3001` : '')

const TOKEN_KEY = 'ek_api_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t)
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T | null> {
  if (!API_URL) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), init.timeout ?? 2500)
    const res = await fetch(API_URL + path, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(init.headers as Record<string, string> | undefined),
      },
    })
    clearTimeout(timer)
    if (!res.ok) {
      if (res.status === 401) clearToken()
      return null
    }
    return (await res.json()) as T
  } catch {
    return null // network error / backend offline → silent fallback
  }
}

export async function apiHealth(): Promise<boolean> {
  const r = await request<{ ok: boolean }>('/health', { timeout: 1500 })
  return !!r?.ok
}

interface AuthResponse {
  token: string
  user: { id: string; name: string }
}

export async function apiLoginChildCode(
  code: string,
  name?: string
): Promise<AuthResponse | null> {
  const r = await request<AuthResponse>('/api/v1/auth/child-code', {
    method: 'POST',
    body: JSON.stringify({ code, name }),
  })
  if (r?.token) setToken(r.token)
  return r
}

export async function apiChildLogin(login: string, pin: string): Promise<{ accessToken: string } | null> {
  const r = await request<{ accessToken: string }>('/api/v1/auth/child/login', {
    method: 'POST',
    body: JSON.stringify({ login, pin }),
  })
  if (r?.accessToken) setToken(r.accessToken)
  return r
}

export async function apiParentLogin(email: string, password: string): Promise<{ accessToken: string } | null> {
  const r = await request<{ accessToken: string }>('/api/v1/auth/parent/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (r?.accessToken) setToken(r.accessToken)
  return r
}

export async function apiLoginGuest(): Promise<AuthResponse | null> {
  const r = await request<AuthResponse>('/api/v1/auth/guest', { method: 'POST' })
  if (r?.token) setToken(r.token)
  return r
}

export async function apiPutAvatar(avatar: Avatar): Promise<boolean> {
  if (!getToken()) return false
  const r = await request<{ ok: boolean }>('/api/v1/avatar', {
    method: 'PUT',
    body: JSON.stringify(avatar),
  })
  return !!r?.ok
}

export async function apiPutProgress(
  gameId: string,
  coins: number,
  timeMs: number,
  completed: boolean
): Promise<boolean> {
  if (!getToken()) return false
  const r = await request<{ ok: boolean }>('/api/v1/progress', {
    method: 'PUT',
    body: JSON.stringify({ gameId, coins, timeMs, completed }),
  })
  return !!r?.ok
}

export async function apiLeaderboard(gameId: string) {
  return request<{ gameId: string; top: Array<{ name: string; bestTimeMs: number; coins: number }> }>(
    `/api/v1/leaderboard/${encodeURIComponent(gameId)}`
  )
}

export function apiLogout() {
  clearToken()
}

export async function apiGetClassroom(id: string): Promise<{ id: string; name: string; teacherId: string; students: Array<{ firstName: string; lastName: string; login: string }> } | null> {
  if (!getToken()) return null
  return request(`/api/v1/classrooms/${encodeURIComponent(id)}`)
}

export async function apiCreateRoom(classroomId?: string): Promise<{ id: string; meetLink: string } | null> {
  if (!getToken()) return null
  return request('/api/v1/rooms', { method: 'POST', body: JSON.stringify({ classroomId }) })
}

export async function apiGetRoom(id: string): Promise<{ id: string; status: string; meetLink: string } | null> {
  return request(`/api/v1/rooms/${encodeURIComponent(id)}`)
}

export async function apiGetMe(): Promise<{ id: string; role: string; name: string; login?: string; email?: string } | null> {
  if (!getToken()) return null
  return request('/api/v1/auth/me')
}

export async function apiProgressEvent(
  kind: 'lesson_solved' | 'puzzle_solved' | 'coins_earned' | 'streak_touched',
  payload: Record<string, unknown>,
): Promise<boolean> {
  if (!getToken()) return false
  const r = await request<{ id: string }>('/api/v1/progress/event', {
    method: 'POST',
    body: JSON.stringify({ kind, payload }),
  })
  return !!r
}

export async function apiRoomToken(
  roomId: string,
  displayName: string,
): Promise<{ token: string; url: string } | null> {
  // Authenticated users get token from backend (secret stays server-side)
  if (getToken()) {
    return request('/api/v1/rooms/token', {
      method: 'POST',
      body: JSON.stringify({ roomId, displayName }),
    })
  }
  // Guest fallback: use public endpoint
  return request('/api/v1/rooms/token/guest', {
    method: 'POST',
    body: JSON.stringify({ roomId, displayName }),
  })
}

export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'
export function getApiToken(): string | null { return getToken() }
