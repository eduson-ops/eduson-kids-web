import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { type Role, loadSession } from './auth'

interface Props {
  role: Role | Role[]
  children: ReactNode
  /** Where to redirect if role doesn't match. Default: '/login' */
  redirectTo?: string
}

/**
 * Render children only if the current session matches the required role(s).
 * Otherwise redirects to /login (or redirectTo).
 */
export default function RequireRole({ role, children, redirectTo = '/login' }: Props) {
  const session = loadSession()
  if (!session) return <Navigate to={redirectTo} replace />
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(session.role)) return <Navigate to={redirectTo} replace />
  return <>{children}</>
}
