/**
 * VK ID авторизация — состояние сессии + redirect-flow.
 *
 * MVP: full-client PKCE через VK ID (id.vk.com/authorize), exchange кода
 * на access_token делаем через VK ID Widget SDK (vkid.id) либо через наш
 * backend-endpoint /api/auth/vk/exchange (когда он появится).
 *
 * Поля VK_APP_ID / REDIRECT_URI — из .env.local (Vite: VITE_VK_*).
 * Документация: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id
 */

const STORAGE_KEY = 'ek_vk_user_v1'
const ROLE_KEY = 'ek_user_role_v1'
const PARENT_LINK_KEY = 'ek_parent_link_v1'
const PKCE_VERIFIER_KEY = 'ek_vk_pkce_verifier'
const STATE_KEY = 'ek_vk_state'

type UserRole = 'child' | 'parent'

export interface VkUser {
  id: number                  // VK user id
  firstName: string
  lastName: string
  avatarUrl: string | null
  /**
   * VK access token — живёт ТОЛЬКО в памяти (возвращается из exchangeVkCode).
   * НЕ персистируется в localStorage (см. saveVkUser).
   * Если нужен после перезагрузки страницы — необходим повторный логин или
   * backend-сессия (httpOnly cookie).
   */
  accessToken?: string
  expiresAt: number           // ms timestamp
  /** Срез роли: child или parent. Parent-связь к ребёнку — в ek_parent_link_v1 */
  role: UserRole
}

interface ParentChildLink {
  /** VK id родителя */
  parentVkId: number
  /** child_code ребёнка (6 цифр) к которому привязан родитель */
  childCode: string
  /** Имя ребёнка (для отображения) */
  childName: string
  /** Разрешение на получение отчётов в VK сообщениях */
  reportsOptIn: boolean
  linkedAt: number
}

// ═════ Env / config ════════════════════════════════════════════════

export function vkConfig() {
  const env = import.meta.env as Record<string, string | undefined>
  return {
    appId: env.VITE_VK_APP_ID ?? '',
    redirectUri: env.VITE_VK_REDIRECT_URI ?? `${window.location.origin}/auth/vk/callback`,
    // Scopes: https://id.vk.com/about/business/go/docs/ru/vkid/latest/user-information
    scope: 'vkid.personal_info email',
    backendExchangeUrl: env.VITE_VK_EXCHANGE_URL ?? '',
  }
}

// ═════ PKCE helpers ════════════════════════════════════════════════

function base64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString(len = 64): string {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return base64urlEncode(arr)
}

async function sha256(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash)
}

/**
 * Старт VK OAuth2 flow: генерим PKCE, сохраняем verifier в sessionStorage,
 * редиректим на id.vk.com/authorize.
 */
export async function startVkLogin(role: UserRole = 'child'): Promise<void> {
  const { appId, redirectUri, scope } = vkConfig()
  if (!appId) {
    throw new Error('VITE_VK_APP_ID не задан — настрой .env.local')
  }
  const verifier = randomString(64)
  const challenge = base64urlEncode(await sha256(verifier))
  const state = randomString(24)

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)
  // Роль, с которой инициировали вход — нужна на callback чтобы сохранить правильно
  sessionStorage.setItem(ROLE_KEY, role)

  const url = new URL('https://id.vk.com/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state', state)
  url.searchParams.set('scope', scope)
  // v=... — не обязателен для VK ID, но полезен если нужен доступ к старому VK API

  window.location.href = url.toString()
}

/**
 * Обмен code на access_token.
 * Предпочтительно — через backend (т.к. client_secret в браузере не должен лежать).
 * VK ID публичных клиентов (PKCE) допускает и прямой запрос с client_id без secret,
 * но редактно меняется политикой — поэтому конфигурируемо.
 */
export async function exchangeVkCode(code: string, deviceId?: string): Promise<VkUser> {
  const { appId, redirectUri, backendExchangeUrl } = vkConfig()
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  const role = (sessionStorage.getItem(ROLE_KEY) as UserRole) || 'child'
  if (!verifier) throw new Error('PKCE verifier потерян — начни вход заново')

  let payload: { access_token: string; expires_in: number; user_id: number }

  if (backendExchangeUrl) {
    // Рекомендуемый путь — через наш backend
    const r = await fetch(backendExchangeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: redirectUri, device_id: deviceId }),
    })
    if (!r.ok) throw new Error(`backend exchange failed: ${r.status}`)
    payload = await r.json()
  } else {
    // Fallback — прямой запрос к VK ID (для dev без backend)
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
      client_id: appId,
    })
    if (deviceId) body.set('device_id', deviceId)
    const r = await fetch('https://id.vk.com/oauth2/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!r.ok) throw new Error(`vk exchange failed: ${r.status}`)
    payload = await r.json()
  }

  // Fetch user profile
  const profileRes = await fetch('https://id.vk.com/oauth2/user_info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ access_token: payload.access_token, client_id: appId }),
  })
  const profile = profileRes.ok ? await profileRes.json() : { user: {} }
  const u = profile.user ?? {}

  const user: VkUser = {
    id: payload.user_id,
    firstName: u.first_name ?? '',
    lastName: u.last_name ?? '',
    avatarUrl: u.avatar ?? null,
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    role,
  }
  saveVkUser(user)
  // Чистим одноразовые токены
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
  sessionStorage.removeItem(ROLE_KEY)
  return user
}

// ═════ State ══════════════════════════════════════════════════════

/**
 * Читает профиль пользователя из localStorage.
 * accessToken в возвращённом объекте будет undefined — он не персистируется.
 * Используй этот метод только для чтения профиля (id, name, avatar, role).
 * Для VK API-вызовов accessToken доступен только в памяти сразу после
 * exchangeVkCode() — не из этой функции.
 */
export function getVkUser(): VkUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const u = JSON.parse(raw) as VkUser
    if (u.expiresAt && u.expiresAt < Date.now()) {
      // Токен протух — чистим
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return u
  } catch {
    return null
  }
}

export function saveVkUser(u: VkUser): void {
  // Security: strip accessToken before persisting — VK tokens must never land
  // in localStorage where XSS can steal them. accessToken is in-memory only.
  const { accessToken: _stripped, ...safeUser } = u
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser))
}

export function signOutVk(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PARENT_LINK_KEY)
}

// ═════ Parent-child link ══════════════════════════════════════════

export function getParentLink(): ParentChildLink | null {
  try {
    const raw = localStorage.getItem(PARENT_LINK_KEY)
    return raw ? (JSON.parse(raw) as ParentChildLink) : null
  } catch {
    return null
  }
}


/** Валидация state-параметра в callback (защита от CSRF) */
export function verifyState(returnedState: string): boolean {
  const saved = sessionStorage.getItem(STATE_KEY)
  return !!saved && saved === returnedState
}
