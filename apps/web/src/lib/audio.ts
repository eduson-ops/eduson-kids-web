// Процедурный звук через Web Audio API — без ассетов, без сетевых загрузок.
// Звуки генерируются on-the-fly через oscillator + envelope.
// Для ambient music и сложных звуков потом подключим Howler.js + ассеты.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = false

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.35
    masterGain.connect(ctx.destination)
  }
  // Некоторые браузеры start в suspended до первого user gesture
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

interface BeepOpts {
  freq: number
  duration: number
  type?: OscillatorType
  attack?: number
  decay?: number
  gain?: number
  detune?: number
  slideTo?: number // для "piu" слайдов
}

function beep(opts: BeepOpts) {
  if (muted) return
  try {
    const ac = getCtx()
    if (!masterGain) return
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = opts.type ?? 'sine'
    osc.frequency.value = opts.freq
    if (opts.detune !== undefined) osc.detune.value = opts.detune
    if (opts.slideTo !== undefined) {
      osc.frequency.setValueAtTime(opts.freq, ac.currentTime)
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(50, opts.slideTo),
        ac.currentTime + opts.duration
      )
    }
    const attack = opts.attack ?? 0.01
    const decay = opts.decay ?? opts.duration
    const peak = opts.gain ?? 0.5
    g.gain.setValueAtTime(0, ac.currentTime)
    g.gain.linearRampToValueAtTime(peak, ac.currentTime + attack)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + attack + decay)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(ac.currentTime + opts.duration + 0.05)
  } catch {
    /* ignore */
  }
}

export const SFX = {
  jump: () => {
    beep({ freq: 420, slideTo: 780, duration: 0.18, type: 'square', gain: 0.25, decay: 0.15 })
  },
  land: () => {
    beep({ freq: 180, slideTo: 90, duration: 0.14, type: 'triangle', gain: 0.25, decay: 0.12 })
  },
  step: () => {
    beep({ freq: 120 + Math.random() * 40, duration: 0.06, type: 'triangle', gain: 0.1, decay: 0.05 })
  },
  coin: () => {
    beep({ freq: 880, duration: 0.1, type: 'square', gain: 0.4, decay: 0.08 })
    setTimeout(
      () => beep({ freq: 1320, duration: 0.12, type: 'square', gain: 0.35, decay: 0.1 }),
      55
    )
  },
  win: () => {
    const notes = [523, 659, 784, 1046]
    notes.forEach((f, i) =>
      setTimeout(
        () => beep({ freq: f, duration: 0.25, type: 'triangle', gain: 0.45, decay: 0.22 }),
        i * 120
      )
    )
  },
  click: () => {
    beep({ freq: 660, duration: 0.05, type: 'square', gain: 0.12, decay: 0.04 })
  },
  wave: () => {
    beep({ freq: 220, slideTo: 440, duration: 0.3, type: 'sawtooth', gain: 0.2, decay: 0.28 })
  },
  lose: () => {
    beep({ freq: 220, slideTo: 90, duration: 0.5, type: 'sawtooth', gain: 0.35, decay: 0.45 })
  },
}

export function setMuted(m: boolean) {
  muted = m
  if (masterGain) masterGain.gain.value = m ? 0 : 0.35
  localStorage.setItem('ek_muted', m ? '1' : '0')
}

export function getMuted() {
  return muted
}

// load persisted preference
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('ek_muted')
  if (saved === '1') muted = true
}
