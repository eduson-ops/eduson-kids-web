/**
 * audioUnlock.ts — Global audio unlock for mobile (iOS Safari, Chrome mobile, Capacitor WebView).
 *
 * Mobile browsers require a user gesture before any audio context can play sound.
 * This module registers one-shot listeners for first user interaction (tap/click/keydown),
 * resumes Howler's AudioContext + a fresh AudioContext as fallback, then emits
 * `audio:unlocked` on window. It also wires global mute/unmute on app:background/foreground.
 *
 * Idempotent — calling initAudioUnlock() twice is a no-op.
 */

let initialized = false
let unlocked = false

interface HowlerGlobal {
  ctx?: AudioContext
  mute?: (muted: boolean) => void
  _howls?: unknown[]
}

function getHowler(): HowlerGlobal | null {
  const w = window as unknown as { Howler?: HowlerGlobal }
  return w.Howler ?? null
}

async function doUnlock(): Promise<void> {
  if (unlocked) return
  unlocked = true

  // 1) Resume Howler's shared AudioContext if Howler is loaded globally.
  try {
    const H = getHowler()
    if (H?.ctx && typeof (H.ctx as AudioContext).resume === 'function') {
      if (H.ctx.state === 'suspended') {
        await H.ctx.resume()
      }
    }
  } catch {
    // ignore
  }

  // 2) Fallback: create + resume a throwaway AudioContext so the permission bit flips.
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AC) {
      const tmp = new AC()
      if (tmp.state === 'suspended') {
        await tmp.resume()
      }
      // Tiny silent buffer ping — some iOS versions require an actual node.
      try {
        const buf = tmp.createBuffer(1, 1, 22050)
        const src = tmp.createBufferSource()
        src.buffer = buf
        src.connect(tmp.destination)
        src.start(0)
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new CustomEvent('audio:unlocked'))
  } catch {
    // ignore
  }
}

/**
 * initAudioUnlock — register one-shot listeners on document for first gesture.
 * Safe to call multiple times (idempotent). Safe on desktop (listeners cleanup after first event).
 */
export function initAudioUnlock(): void {
  if (initialized) return
  initialized = true

  if (typeof document === 'undefined') return

  const handler = () => {
    void doUnlock()
    // Cleanup — one-shot.
    document.removeEventListener('pointerdown', handler)
    document.removeEventListener('touchstart', handler)
    document.removeEventListener('keydown', handler)
    document.removeEventListener('click', handler)
  }

  const opts: AddEventListenerOptions = { capture: true, passive: true }
  document.addEventListener('pointerdown', handler, opts)
  document.addEventListener('touchstart', handler, opts)
  document.addEventListener('keydown', handler, opts)
  document.addEventListener('click', handler, opts)

  // Background/foreground global mute wiring (once).
  installBackgroundMute()
}

/** Is audio currently unlocked (user has gestured at least once). */
export function isAudioUnlocked(): boolean {
  return unlocked
}

// ── Background / foreground global mute ────────────────────────────────────

let bgMuteInstalled = false

function installBackgroundMute(): void {
  if (bgMuteInstalled) return
  bgMuteInstalled = true
  if (typeof window === 'undefined') return

  const onBg = () => {
    try {
      const H = getHowler()
      H?.mute?.(true)
    } catch {
      // ignore
    }
  }
  const onFg = () => {
    try {
      const H = getHowler()
      H?.mute?.(false)
    } catch {
      // ignore
    }
  }

  window.addEventListener('app:background', onBg)
  window.addEventListener('app:foreground', onFg)
}
