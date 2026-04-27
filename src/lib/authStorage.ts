/**
 * Single source of truth for the access token in localStorage.
 *
 * Background (D2-03 fix): historically `lib/api.ts` wrote to `ek_api_token`
 * while `lib/projectsApi.ts` read `access_token` — split-brain. After login
 * via `apiLoginChildCode`, Studio cloud-save would shoot fetch with NO
 * Authorization header → 401 → useCloudSave stuck in `error` status.
 *
 * Migration path: on first read, if the new key is empty we look up the
 * legacy keys in priority order, copy the first non-null match into the new
 * key, and clean the legacy entries. Future reads only touch the canonical key.
 */

const TOKEN_KEY = 'kubik_access_token'

// Legacy keys — keep until at least 2026-08 to cover devices that haven't
// re-logged in. After that we can drop the migration path.
const LEGACY_KEYS = ['ek_api_token', 'access_token'] as const

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  const storage = safeStorage()
  if (!storage) return null

  const current = storage.getItem(TOKEN_KEY)
  if (current) return current

  // Migrate from legacy keys if present.
  for (const legacy of LEGACY_KEYS) {
    const value = storage.getItem(legacy)
    if (value) {
      try {
        storage.setItem(TOKEN_KEY, value)
        storage.removeItem(legacy)
      } catch {
        // ignore quota / privacy-mode errors
      }
      return value
    }
  }
  return null
}

export function setAccessToken(token: string | null): void {
  const storage = safeStorage()
  if (!storage) return
  if (token === null || token === '') {
    clearAccessToken()
    return
  }
  try {
    storage.setItem(TOKEN_KEY, token)
    // Clear legacy entries so they cannot drift again.
    for (const legacy of LEGACY_KEYS) storage.removeItem(legacy)
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(TOKEN_KEY)
    for (const legacy of LEGACY_KEYS) storage.removeItem(legacy)
  } catch {
    // ignore
  }
}


/**
 * F-12: returns the access token from localStorage when available.
 *
 * After the HttpOnly cookie migration, fresh logins do NOT keep a token in
 * localStorage — the browser sends the `access_token` cookie automatically
 * on every fetch with `credentials: 'include'`. JS code (this function)
 * cannot read HttpOnly cookies by design (XSS hardening).
 *
 * Callers should:
 *   1. always send `credentials: 'include'` on API fetches,
 *   2. add `Authorization: Bearer <token>` only when this function returns
 *      a non-null value (legacy session bridging),
 *   3. treat a `null` result as "let the cookie do the work".
 */
export function getAccessTokenFromAnywhere(): string | null {
  return getAccessToken()
}
