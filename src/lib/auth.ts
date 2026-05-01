// Role-based session model.
// MVP: localStorage — in prod, hydrated from apiGetMe() on startup.

export type Role = 'child' | 'parent' | 'teacher' | 'admin' | 'school_admin'

export interface Session {
  role: Role
  name: string
  login?: string       // for child: transliterated login
  email?: string       // for parent/teacher
  classroomId?: string // for child: their classroom UUID
}

const SESSION_KEY = 'ek_session'
export const CHILD_NAME_KEY = 'ek_child_name'
export const PARENT_NAME_KEY = 'ek_parent_name'
export const ADMIN_KEY = 'ek_admin'

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
