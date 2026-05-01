import { getAccessToken } from '../lib/authStorage'

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !!cap?.isNativePlatform?.()
}

const API_ORIGIN =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (isCapacitorNative()
    ? 'https://api.edusonkids.com'
    : typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : '')

const BASE = `${API_ORIGIN}/api/v1`

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw Object.assign(new Error(err?.message ?? res.statusText), { status: res.status })
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

export { BASE }

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}
