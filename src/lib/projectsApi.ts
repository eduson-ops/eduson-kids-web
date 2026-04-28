/**
 * Typed client for Projects API.
 *
 * Wraps fetch with:
 *   - Bearer token from auth helper
 *   - Tenant-aware URL (subdomain or X-Tenant-Slug header)
 *   - Standard error mapping
 *
 * Used by useCloudSave hook + ProjectList page.
 */

import { getAccessToken } from './authStorage'

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/v1'

export type ProjectType = 'game' | 'site' | 'python' | 'capstone' | 'ege'
type ProjectVisibility = 'private' | 'unlisted' | 'public' | 'classroom'
type VersionSource = 'autosave' | 'manual' | 'rollback' | 'import' | 'template'

export interface Project {
  id: string
  tenantId: string
  ownerId: string
  classroomId: string | null
  name: string
  type: ProjectType
  visibility: ProjectVisibility
  currentVersionId: string | null
  currentSizeBytes: number
  shareToken: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectWithContent extends Project {
  content: Record<string, unknown> | null
  currentSequence: number | null
}

export interface ProjectVersion {
  id: string
  sequence: number
  source: VersionSource
  note: string | null
  sizeBytes: number
  createdAt: string
  createdBy: string
}

function authHeader(): Record<string, string> {
  // D2-03: было `localStorage.getItem('access_token')` — но `lib/api.ts`
  // писал в `ek_api_token`. После child-code логина Studio cloud-save шёл
  // без Authorization → 401 → useCloudSave висел в `error`. Унифицировано
  // через authStorage с миграцией legacy ключей.
  //
  // F-12: после миграции на HttpOnly cookie `getAccessToken()` может вернуть
  // null — это норма. Запрос пойдёт с `credentials: 'include'` и cookie
  // (access_token) подхватит JwtStrategy на бэке через cookieExtractor.
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new ApiError(res.status, text)
  }
  if (res.status === 204) return null as unknown as T
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  // Без `public` в конструкторе — TS erasableSyntaxOnly запрещает
  // parameter properties (вид TS-only синтаксиса, который nodejs не парсит).
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`HTTP ${status}: ${body}`)
    this.status = status
    this.body = body
  }
  isOffline(): boolean {
    return this.status === 0 || this.status === 503
  }
}

export const projectsApi = {
  list: () => http<Project[]>('GET', '/projects'),
  get: (id: string) => http<ProjectWithContent>('GET', `/projects/${id}`),
  create: (input: {
    name: string
    type: ProjectType
    classroomId?: string
    visibility?: ProjectVisibility
    initialContent?: Record<string, unknown>
  }) => http<Project>('POST', '/projects', input),
  save: (id: string, input: {
    contentJson: Record<string, unknown>
    source?: VersionSource
    note?: string
  }) => http<ProjectVersion>('PUT', `/projects/${id}`, input),
  delete: (id: string) => http<void>('DELETE', `/projects/${id}`),
  restore: (id: string) => http<void>('POST', `/projects/${id}/restore`),
  listVersions: (id: string) => http<ProjectVersion[]>('GET', `/projects/${id}/versions`),
  getVersion: (id: string, seq: number) =>
    http<ProjectVersion & { contentJson: Record<string, unknown> }>(
      'GET',
      `/projects/${id}/versions/${seq}`,
    ),
  restoreToVersion: (id: string, seq: number) =>
    http<ProjectVersion>('POST', `/projects/${id}/restore/${seq}`),
  shareToken: (id: string) => http<{ token: string; url: string }>('POST', `/projects/${id}/share-token`),
}
