/**
 * native.ts — единый слой capabilities для Capacitor + Web.
 *
 * Каждая функция:
 *   1. Проверяет `Capacitor.isNativePlatform()`.
 *   2. На нативе — динамически подгружает соответствующий плагин `@capacitor/*`.
 *      Динамический import держит нативные плагины вне web-бандла.
 *   3. На вебе — использует Web API fallback.
 *
 * `@capacitor/core` статически импортируем — он маленький и работает в браузере.
 */

import { Capacitor } from '@capacitor/core'

// --- Тип-хелперы -------------------------------------------------------------
export type HapticKind = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web'
  osVersion: string
  model: string
  isTablet: boolean
}

export interface ShareInput {
  title?: string
  text?: string
  url?: string
}

const isNative = (): boolean => Capacitor.isNativePlatform()
const PUSH_REGISTER_TIMEOUT_MS = 10000

// --- Haptics -----------------------------------------------------------------
export async function haptic(kind: HapticKind): Promise<void> {
  if (isNative()) {
    try {
      const mod = await import('@capacitor/haptics')
      const { Haptics, ImpactStyle, NotificationType } = mod as unknown as {
        Haptics: {
          impact: (o: { style: unknown }) => Promise<void>
          selectionStart: () => Promise<void>
          selectionChanged: () => Promise<void>
          selectionEnd: () => Promise<void>
          notification: (o: { type: unknown }) => Promise<void>
        }
        ImpactStyle: Record<string, unknown>
        NotificationType: Record<string, unknown>
      }
      switch (kind) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light })
          return
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium })
          return
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy })
          return
        case 'selection':
          await Haptics.selectionChanged()
          return
        case 'success':
          await Haptics.notification({ type: NotificationType.Success })
          return
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning })
          return
        case 'error':
          await Haptics.notification({ type: NotificationType.Error })
          return
      }
    } catch {
      // swallow — haptics не критичны
    }
    return
  }
  // Web: используем Vibration API, если доступно
  try {
    const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }
    if (!nav.vibrate) return
    switch (kind) {
      case 'light':
      case 'selection':
        nav.vibrate(8)
        return
      case 'medium':
        nav.vibrate(14)
        return
      case 'heavy':
        nav.vibrate(24)
        return
      case 'success':
        nav.vibrate([10, 40, 10])
        return
      case 'warning':
        nav.vibrate([20, 60, 20])
        return
      case 'error':
        nav.vibrate([40, 60, 40, 60, 40])
        return
    }
  } catch {
    // ignore
  }
}

// --- Share -------------------------------------------------------------------
export async function share(payload: ShareInput): Promise<boolean> {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share({
        ...(payload.title ? { title: payload.title, dialogTitle: payload.title } : {}),
        ...(payload.text ? { text: payload.text } : {}),
        ...(payload.url ? { url: payload.url } : {}),
      })
      return true
    } catch {
      return false
    }
  }
  // Web Share API
  try {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (nav.share) {
      await nav.share(payload)
      return true
    }
  } catch {
    // fallthrough
  }
  // Финальный fallback — копируем url в буфер
  if (payload.url) {
    return copyToClipboard(payload.url)
  }
  return false
}

// --- Camera / takePhoto ------------------------------------------------------
export interface PhotoResult {
  dataUrl?: string
  blob?: Blob
  base64?: string
  mime: string
}

export async function takePhoto(): Promise<PhotoResult | null> {
  if (isNative()) {
    try {
      const mod = await import('@capacitor/camera')
      const { Camera, CameraResultType, CameraSource } = mod as unknown as {
        Camera: {
          getPhoto: (o: Record<string, unknown>) => Promise<{ base64String?: string; dataUrl?: string; format: string }>
        }
        CameraResultType: Record<string, unknown>
        CameraSource: Record<string, unknown>
      }
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
      })
      const mime = `image/${photo.format || 'jpeg'}`
      const result: PhotoResult = { mime }
      if (photo.base64String) {
        result.base64 = photo.base64String
        result.dataUrl = `data:${mime};base64,${photo.base64String}`
      }
      return result
    } catch {
      return null
    }
  }
  // Web fallback: hidden <input type="file" accept="image/*" capture>
  return new Promise<PhotoResult | null>((resolve) => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.setAttribute('capture', 'environment')
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      input.onchange = () => {
        const file = input.files?.[0]
        document.body.removeChild(input)
        if (!file) {
          resolve(null)
          return
        }
        resolve({ blob: file, mime: file.type || 'image/jpeg' })
      }
      input.oncancel = () => {
        if (input.parentNode) document.body.removeChild(input)
        resolve(null)
      }
      document.body.appendChild(input)
      input.click()
    } catch {
      resolve(null)
    }
  })
}

// --- Clipboard ---------------------------------------------------------------
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fallthrough
  }
  // legacy fallback
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

// --- Status bar --------------------------------------------------------------
export async function setStatusBarStyle(style: 'light' | 'dark'): Promise<void> {
  if (!isNative()) return
  try {
    const mod = await import('@capacitor/status-bar')
    const { StatusBar, Style } = mod as unknown as {
      StatusBar: { setStyle: (o: { style: unknown }) => Promise<void> }
      Style: Record<string, unknown>
    }
    // 'light' = светлый контент (тёмный фон), 'dark' = тёмный контент (светлый фон)
    const target = style === 'light' ? Style.Light : Style.Dark
    await StatusBar.setStyle({ style: target })
  } catch {
    // ignore
  }
}

// --- Splash screen -----------------------------------------------------------
export async function hideSplash(): Promise<void> {
  if (!isNative()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {
    // ignore
  }
}

// --- Device info -------------------------------------------------------------
export async function getDeviceInfo(): Promise<DeviceInfo> {
  if (isNative()) {
    try {
      const { Device } = await import('@capacitor/device')
      const info = await Device.getInfo()
      const platform = info.platform === 'ios' ? 'ios' : info.platform === 'android' ? 'android' : 'web'
      return {
        platform,
        osVersion: info.osVersion ?? '',
        model: info.model ?? '',
        isTablet: /ipad|tablet/i.test(info.model ?? '') || (info as { isVirtual?: boolean }).isVirtual === false && /tablet/i.test(info.name ?? ''),
      }
    } catch {
      // fallthrough
    }
  }
  // Web: best-effort из UA
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isTablet = /ipad|tablet/i.test(ua)
  return {
    platform: 'web',
    osVersion: '',
    model: ua.slice(0, 120),
    isTablet,
  }
}

// --- Network -----------------------------------------------------------------
export async function isOnline(): Promise<boolean> {
  if (isNative()) {
    try {
      const { Network } = await import('@capacitor/network')
      const status = await Network.getStatus()
      return status.connected
    } catch {
      // fallthrough
    }
  }
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine
  }
  return true
}

export type NetworkUnsubscribe = () => void

export function onNetworkChange(cb: (online: boolean) => void): NetworkUnsubscribe {
  if (isNative()) {
    let remove: (() => void) | null = null
    let cancelled = false
    void (async () => {
      try {
        const { Network } = await import('@capacitor/network')
        const handle = await Network.addListener('networkStatusChange', (s: { connected: boolean }) => {
          cb(s.connected)
        })
        if (cancelled) {
          handle.remove()
          return
        }
        remove = () => {
          handle.remove()
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
      remove?.()
    }
  }
  const on = () => cb(true)
  const off = () => cb(false)
  window.addEventListener('online', on)
  window.addEventListener('offline', off)
  return () => {
    window.removeEventListener('online', on)
    window.removeEventListener('offline', off)
  }
}

// --- Preferences -------------------------------------------------------------
export async function getPreference(key: string): Promise<string | null> {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const r = await Preferences.get({ key })
      return r.value
    } catch {
      // fallthrough
    }
  }
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export async function setPreference(key: string, value: string): Promise<void> {
  if (isNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.set({ key, value })
      return
    } catch {
      // fallthrough
    }
  }
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore quota/private mode
  }
}

// --- Back button -------------------------------------------------------------
export type BackButtonHandler = (ev: { canGoBack: boolean }) => void
export type BackButtonUnsubscribe = () => void

export function subscribeBackButton(handler: BackButtonHandler): BackButtonUnsubscribe {
  if (!isNative()) return () => {}
  let remove: (() => void) | null = null
  let cancelled = false
  void (async () => {
    try {
      const { App } = await import('@capacitor/app')
      const handle = await App.addListener('backButton', (ev: { canGoBack: boolean }) => {
        handler(ev)
      })
      if (cancelled) {
        handle.remove()
        return
      }
      remove = () => {
        handle.remove()
      }
    } catch {
      // ignore
    }
  })()
  return () => {
    cancelled = true
    remove?.()
  }
}

/** exitApp — корректно закрыть нативное приложение (noop в вебе). */
export async function exitApp(): Promise<void> {
  if (!isNative()) return
  try {
    const { App } = await import('@capacitor/app')
    await App.exitApp()
  } catch {
    // ignore
  }
}

// --- Push notifications ------------------------------------------------------
export async function registerPushToken(): Promise<string | null> {
  if (!isNative()) return null
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return null

    return new Promise<string | null>((resolve) => {
      let settled = false
      const finish = (v: string | null) => {
        if (settled) return
        settled = true
        resolve(v)
      }
      void PushNotifications.addListener('registration', (t: { value: string }) => {
        finish(t.value)
      })
      void PushNotifications.addListener('registrationError', () => {
        finish(null)
      })
      void PushNotifications.register()
      // safety timeout
      setTimeout(() => finish(null), PUSH_REGISTER_TIMEOUT_MS)
    })
  } catch {
    return null
  }
}

// --- Keyboard (показ/скрытие для --kb-height) --------------------------------
export type KeyboardUnsubscribe = () => void

export function subscribeKeyboard(
  onShow: (height: number) => void,
  onHide: () => void,
): KeyboardUnsubscribe {
  if (!isNative()) return () => {}
  let cancelled = false
  const removers: Array<() => void> = []
  void (async () => {
    try {
      const { Keyboard } = await import('@capacitor/keyboard')
      const showHandle = await Keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
        onShow(info.keyboardHeight || 0)
      })
      const hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
        onHide()
      })
      if (cancelled) {
        showHandle.remove()
        hideHandle.remove()
        return
      }
      removers.push(() => showHandle.remove(), () => hideHandle.remove())
    } catch {
      // ignore
    }
  })()
  return () => {
    cancelled = true
    removers.forEach((r) => r())
  }
}

// --- App state (foreground/background) ---------------------------------------
export type AppStateUnsubscribe = () => void

export function subscribeAppState(cb: (isActive: boolean) => void): AppStateUnsubscribe {
  if (!isNative()) {
    // web: visibilitychange
    const on = () => cb(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }
  let cancelled = false
  let remove: (() => void) | null = null
  void (async () => {
    try {
      const { App } = await import('@capacitor/app')
      const handle = await App.addListener('appStateChange', (s: { isActive: boolean }) => {
        cb(s.isActive)
      })
      if (cancelled) {
        handle.remove()
        return
      }
      remove = () => handle.remove()
    } catch {
      // ignore
    }
  })()
  return () => {
    cancelled = true
    remove?.()
  }
}

export { isNative as isNativePlatform }
