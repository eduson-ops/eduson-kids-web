import { useEffect, useState } from 'react'

/**
 * Fetch the active tenant's branding on app start and apply it as CSS
 * custom properties on document.documentElement. Lets WL clients ship a
 * white-labelled UI without rebuilding the bundle.
 *
 * Backend contract: GET /api/v1/tenants/me — anonymous-allowed; returns
 *   { id, slug, name, tier, branding: { primary?, accent?, logo?, font? }, featureFlags }
 *
 * If the call fails (offline / not configured), we silently keep defaults.
 *
 * Cached in sessionStorage for instant subsequent loads.
 */

const CACHE_KEY = 'kubik-tenant-branding'

interface TenantBranding {
  primary?: string
  accent?: string
  logo?: string
  font?: string
  background?: string
  [key: string]: unknown
}

export interface ActiveTenant {
  id: string
  slug: string
  name: string
  tier: string
  branding: TenantBranding
  featureFlags: Record<string, boolean>
}

const DEFAULT_TENANT: ActiveTenant = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'edusonkids',
  name: 'KubiK',
  tier: 'core',
  branding: { primary: '#ffd84c', accent: '#8ec5ff', font: 'Nunito' },
  featureFlags: {},
}

function applyToDOM(branding: TenantBranding): void {
  const r = document.documentElement
  if (branding.primary) r.style.setProperty('--brand-primary', branding.primary)
  if (branding.accent) r.style.setProperty('--brand-accent', branding.accent)
  if (branding.background) r.style.setProperty('--brand-bg', branding.background)
  if (branding.font) r.style.setProperty('--brand-font', branding.font)
}

function loadFromCache(): ActiveTenant | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActiveTenant
  } catch {
    return null
  }
}

function saveToCache(tenant: ActiveTenant): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(tenant))
  } catch {
    /* ignore */
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api/v1'

export function useTenantBranding(): ActiveTenant {
  const [tenant, setTenant] = useState<ActiveTenant>(() => {
    const cached = loadFromCache()
    if (cached) {
      // Apply immediately so CSS doesn't flash on next render
      try { applyToDOM(cached.branding) } catch { /* SSR safe */ }
      return cached
    }
    return DEFAULT_TENANT
  })

  useEffect(() => {
    let alive = true
    fetch(`${API_BASE}/tenants/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ActiveTenant | null) => {
        if (!alive || !data) return
        applyToDOM(data.branding ?? {})
        saveToCache(data)
        setTenant(data)
      })
      .catch(() => { /* silent */ })
    return () => { alive = false }
  }, [])

  return tenant
}
