// Role-based session model.
// MVP: localStorage — in prod, hydrated from apiGetMe() on startup.

export type Role = 'child' | 'parent' | 'teacher'

export interface Session {
  role: Role
  name: string
  login?: string    // for child: transliterated login
  email?: string    // for parent/teacher
}

const SESSION_KEY = 'ek_session'

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch { return null }
}

export function saveSession(s: Session): void {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* quota */ }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

/** Quick role check without loading the full session. */
export function getRole(): Role | null {
  return loadSession()?.role ?? null
}

/**
 * Back-compat: derive a Session from the legacy localStorage keys
 * (ek_child_name, ek_child_code) if no new session exists.
 */
export function ensureSession(): Session | null {
  const existing = loadSession()
  if (existing) return existing
  const childName = localStorage.getItem('ek_child_name')
  if (childName) {
    const s: Session = { role: 'child', name: childName }
    saveSession(s)
    return s
  }
  return null
}
