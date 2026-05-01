// API-клиент с graceful-fallback на localStorage.
// Если бэк запущен (VITE_API_URL или /health отвечает) — используем,
// иначе продолжаем работать оффлайн. Это нужно чтобы demo работал
// даже если бэк ещё не запущен.

import type { Avatar } from './avatars'
import { getAccessToken, setAccessToken, clearAccessToken } from './authStorage'

// Detect Capacitor shell без статического импорта `@capacitor/core`,
// чтобы web-бандл не тянул нативные shim'ы.
function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !!cap?.isNativePlatform?.()
}

// TODO: заменить на реальный prod-URL бэкенда когда он появится.
const NATIVE_API_FALLBACK = 'https://api.edusonkids.com'
const COOKIE_MIGRATION_DELAY_MS = 100

const API_URL =
  import.meta.env.VITE_API_URL ||
  (isCapacitorNative()
    ? NATIVE_API_FALLBACK
    : typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : '')

// D2-03: единый ключ хранения JWT — `authStorage.ts`.
// Историческая фрагментация (`ek_api_token` здесь vs `access_token` в
// `projectsApi.ts`) ломала Studio cloud-save после child-code логина.
function getToken(): string | null {
  return getAccessToken()
}
function setToken(t: string) {
  setAccessToken(t)
}
function clearToken() {
  clearAccessToken()
}

/**
 * F-12: probe `/auth/me` with cookie credentials but NO Authorization header.
 * If it returns 200 → the HttpOnly `access_token` cookie was accepted by the
 * backend and we can drop the localStorage token (it was just a fallback for
 * the migration window). If it 401's, we keep the localStorage token.
 *
 * Runs out-of-band 100ms after login so the Set-Cookie response had time to
 * commit. Failures are silent — we never want migration to break login UX.
 */
async function probeCookieAuthAndMaybeClearLocal(): Promise<void> {
  if (!API_URL) return
  if (!getToken()) return // nothing to migrate
  try {
    const res = await fetch(API_URL + '/api/v1/auth/me', {
      credentials: 'include',
      // intentionally no Authorization header — we're testing cookie-only path
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      // cookie auth confirmed → safe to drop localStorage token.
      clearToken()
    }
  } catch {
    // network failure → leave localStorage in place, harmless
  }
}

function scheduleCookieMigration(): void {
  if (typeof window === 'undefined') return
  setTimeout(() => {
    void probeCookieAuthAndMaybeClearLocal()
  }, COOKIE_MIGRATION_DELAY_MS)
}

async function request<T>(
  path: string,
  init: RequestInit & { timeout?: number } = {}
): Promise<T | null> {
  if (!API_URL) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), init.timeout ?? 2500)
    // F-12: send cookies on every request so the HttpOnly access_token cookie
    // (set by backend on login) is used by the JWT strategy. We still send the
    // Authorization header when localStorage holds a legacy token, so any
    // session that pre-dates the migration keeps working.
    const res = await fetch(API_URL + path, {
      ...init,
      signal: controller.signal,
      credentials: 'include',
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

interface AuthResponse {
  accessToken: string
  refreshToken?: string
}

export async function apiLoginChildCode(
  code: string,
  name?: string
): Promise<AuthResponse | null> {
  const r = await request<AuthResponse>('/api/v1/auth/child-code', {
    method: 'POST',
    body: JSON.stringify({ code, name }),
  })
  if (r?.accessToken) {
    setToken(r.accessToken)
    scheduleCookieMigration()
  }
  return r
}

export async function apiChildLogin(login: string, pin: string): Promise<{ accessToken: string } | null> {
  const r = await request<{ accessToken: string }>('/api/v1/auth/child/login', {
    method: 'POST',
    body: JSON.stringify({ login, pin }),
  })
  if (r?.accessToken) {
    setToken(r.accessToken)
    scheduleCookieMigration()
  }
  return r
}

export async function apiParentLogin(email: string, password: string): Promise<{ accessToken: string } | null> {
  const r = await request<{ accessToken: string }>('/api/v1/auth/parent/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (r?.accessToken) {
    setToken(r.accessToken)
    scheduleCookieMigration()
  }
  return r
}

export async function apiTeacherLogin(
  email: string,
  password: string,
  schoolCode: string,
): Promise<{ accessToken: string } | null> {
  const r = await request<{ accessToken: string }>('/api/v1/auth/teacher/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, schoolCode }),
  })
  if (r?.accessToken) {
    setToken(r.accessToken)
    scheduleCookieMigration()
  }
  return r
}

export async function apiLoginGuest(): Promise<AuthResponse | null> {
  const r = await request<AuthResponse>('/api/v1/auth/guest', { method: 'POST' })
  if (r?.accessToken) {
    setToken(r.accessToken)
    scheduleCookieMigration()
  }
  return r
}

export async function apiPutAvatar(avatar: Avatar): Promise<boolean> {
  if (!getToken()) return false
  const result = await request<void>('/api/v1/auth/avatar', {
    method: 'PUT',
    body: JSON.stringify({ avatar }),
  })
  return result !== null
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

export async function apiGetMe(): Promise<{ id: string; role: string; name: string; login?: string; email?: string; classroomId?: string } | null> {
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

export function getApiToken(): string | null { return getToken() }
