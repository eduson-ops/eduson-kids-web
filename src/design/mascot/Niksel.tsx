/**
 * Пингвин Никсель — Eduson Kids mascot
 *
 * Per Designbook: progress companion, hint-giver, empty-state presence.
 * Not decoration. Respects the kid as author.
 *
 * Poses: idle | wave | think | celebrate | code | confused
 *
 * Micro-animations (all pure CSS, no JS ticks):
 *   - breathing  — вся фигура медленно «дышит» (scale + translateY)
 *   - blink      — оба глаза моргают раз в ~4s (только на idle/think/code)
 *   - wave-hand  — рука машет (только на pose=wave)
 *
 * A11y:
 *   - role="img" + описательный aria-label (полное предложение)
 *   - respects prefers-reduced-motion (через CSS в App.css)
 */
import { memo } from 'react'
import type { CSSProperties } from 'react'

type Pose = 'idle' | 'wave' | 'think' | 'celebrate' | 'code' | 'confused'

interface Props {
  pose?: Pose
  size?: number
  className?: string
  style?: CSSProperties
  /** Отключить micro-animations (для статичных превью, печати). */
  still?: boolean
  /** Кастомный brand-цвет клюва/лапок (override для white-label тенантов). */
  accent?: string
  /** Кастомный aria-label. Если не задан — генерим из pose. */
  ariaLabel?: string
  /**
   * Цветовая схема:
   *   'light' — INK тёмный, PAPER светлый (default brand)
   *   'dark'  — INK светлый, PAPER тёмный (для тёмного бэкграунда)
   *   'auto'  — читаем CSS-переменные --ink / --paper, fallback к light
   */
  theme?: 'light' | 'dark' | 'auto'
}

const INK_LIGHT = '#15141B'
const PAPER_LIGHT = '#FFFBF3'
const INK_DARK = '#f5f5f5'
const PAPER_DARK = '#0a0b10'
const BEAK = '#FF9454'
const FEET = '#D96A24'
const YELLOW = '#FFD43C'
const VIOLET = '#6B5CE7'
const PINK = '#FFB4C8'
const CHEEK = '#FFB4C8'

function resolveTheme(theme: 'light' | 'dark' | 'auto'): { ink: string; paper: string } {
  if (theme === 'light') return { ink: INK_LIGHT, paper: PAPER_LIGHT }
  if (theme === 'dark') return { ink: INK_DARK, paper: PAPER_DARK }
  // auto: читаем CSS vars если в browser
  if (typeof window !== 'undefined') {
    try {
      const cs = getComputedStyle(document.documentElement)
      const ink = cs.getPropertyValue('--ink').trim()
      const paper = cs.getPropertyValue('--paper').trim()
      if (ink && paper) return { ink, paper }
    } catch {
      /* SSR / no DOM */
    }
  }
  return { ink: INK_LIGHT, paper: PAPER_LIGHT }
}

const POSE_LABELS: Record<Pose, string> = {
  idle: 'спокойный',
  wave: 'машет рукой, приветствует',
  think: 'задумался',
  celebrate: 'радуется победе',
  code: 'пишет код',
  confused: 'растерялся',
}

function NikselInner({
  pose = 'idle',
  size = 240,
  className,
  style,
  still = false,
  accent,
  ariaLabel,
  theme = 'auto',
}: Props) {
  const beakColor = accent ?? BEAK
  const feetColor = accent ? darken(accent, 0.15) : FEET
  const hasEyes = pose === 'idle' || pose === 'think' || pose === 'code' || pose === 'confused'
  const blinkClass = !still && hasEyes ? 'nk-blink' : ''
  const breatheClass = still ? '' : 'nk-breathe'
  const { ink: INK, paper: PAPER } = resolveTheme(theme)

  return (
    <svg
      width={size}
      height={(size * 420) / 360}
      viewBox="0 0 360 420"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className ?? ''} ${breatheClass}`.trim()}
      style={{ ...style, transformOrigin: '50% 90%' }}
      role="img"
      aria-label={ariaLabel ?? `Пингвин Никсель, ${POSE_LABELS[pose]}`}
    >
      {/* Yellow floor band (brand signature) */}
      <rect x="10" y="215" width="340" height="48" rx="10" fill={YELLOW} />

      {/* Body outline (black) */}
      <path
        d="M180 20 C 280 20, 340 90, 340 200 C 340 330, 290 400, 180 400 C 70 400, 20 330, 20 200 C 20 90, 80 20, 180 20 Z"
        fill={INK}
        transform="translate(180 210) scale(1.08) translate(-180 -210)"
      />
      {/* Body */}
      <path
        d="M180 20 C 280 20, 340 90, 340 200 C 340 330, 290 400, 180 400 C 70 400, 20 330, 20 200 C 20 90, 80 20, 180 20 Z"
        fill={INK}
      />
      {/* Belly */}
      <path
        d="M180 100 C 250 100, 280 160, 280 230 C 280 310, 250 370, 180 370 C 110 370, 80 310, 80 230 C 80 160, 110 100, 180 100 Z"
        fill={PAPER}
      />

      {/* Beak */}
      <path d="M168 160 L 192 160 L 186 184 L 174 184 Z" fill={beakColor} />

      {/* Eyes — pose-dependent */}
      {pose === 'idle' && <g className={blinkClass} style={{ transformOrigin: '180px 156px' }}>
        <circle cx="152" cy="156" r="9" fill={INK} />
        <circle cx="208" cy="156" r="9" fill={INK} />
        <circle cx="154" cy="154" r="3" fill={PAPER} />
        <circle cx="210" cy="154" r="3" fill={PAPER} />
      </g>}
      {pose === 'wave' && <>
        <path d="M143 156 Q152 148, 161 156" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M199 156 Q208 148, 217 156" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>}
      {pose === 'think' && <>
        <g className={blinkClass} style={{ transformOrigin: '180px 156px' }}>
          <circle cx="152" cy="156" r="9" fill={INK} />
          <circle cx="208" cy="156" r="9" fill={INK} />
          <circle cx="148" cy="152" r="2.5" fill={PAPER} />
          <circle cx="204" cy="152" r="2.5" fill={PAPER} />
        </g>
        {/* Thought bubble */}
        <g className={still ? '' : 'nk-think-bubble'}>
          <circle cx="290" cy="80" r="20" fill={PAPER} stroke={INK} strokeWidth="3" />
          <circle cx="268" cy="110" r="9" fill={PAPER} stroke={INK} strokeWidth="2.5" />
          <circle cx="256" cy="130" r="5" fill={PAPER} stroke={INK} strokeWidth="2" />
          <text x="290" y="88" textAnchor="middle" fill={INK} fontSize="22" fontWeight="900" fontFamily="Nunito, sans-serif">?</text>
        </g>
      </>}
      {pose === 'celebrate' && <>
        <path d="M140 160 L 164 150 M140 150 L 164 160" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M196 160 L 220 150 M196 150 L 220 160" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {/* Stars */}
        <text x="60" y="70" fontSize="28" fill={YELLOW} className={still ? '' : 'nk-star nk-star--a'}>★</text>
        <text x="290" y="50" fontSize="22" fill={VIOLET} className={still ? '' : 'nk-star nk-star--b'}>★</text>
        <text x="310" y="120" fontSize="24" fill={PINK} className={still ? '' : 'nk-star nk-star--c'}>★</text>
      </>}
      {pose === 'code' && <>
        <g className={blinkClass} style={{ transformOrigin: '180px 156px' }}>
          <circle cx="152" cy="156" r="9" fill={INK} />
          <circle cx="208" cy="156" r="9" fill={INK} />
          <circle cx="154" cy="154" r="3" fill={PAPER} />
          <circle cx="210" cy="154" r="3" fill={PAPER} />
        </g>
        {/* Laptop */}
        <rect x="130" y="280" width="100" height="60" rx="6" fill={VIOLET} />
        <rect x="138" y="288" width="84" height="44" rx="3" fill="#0B0A11" />
        <text x="180" y="315" textAnchor="middle" fill={YELLOW} fontSize="11" fontFamily="JetBrains Mono, monospace">
          {'def on_start():'}
          {!still && (
            <tspan className="nk-caret" fill={YELLOW}>▌</tspan>
          )}
        </text>
      </>}
      {pose === 'confused' && <>
        <g className={blinkClass} style={{ transformOrigin: '180px 156px' }}>
          <circle cx="152" cy="156" r="9" fill={INK} />
          <circle cx="208" cy="156" r="9" fill={INK} />
          <circle cx="155" cy="152" r="2" fill={PAPER} />
          <circle cx="205" cy="156" r="2" fill={PAPER} />
        </g>
        <path d="M164 200 Q180 208, 196 200" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>}

      {/* Cheeks (idle + celebrate + wave) */}
      {(pose === 'idle' || pose === 'celebrate' || pose === 'wave') && <>
        <circle cx="125" cy="180" r="10" fill={CHEEK} opacity="0.55" />
        <circle cx="235" cy="180" r="10" fill={CHEEK} opacity="0.55" />
      </>}

      {/* Feet */}
      <ellipse cx="140" cy="395" rx="26" ry="10" fill={feetColor} />
      <ellipse cx="220" cy="395" rx="26" ry="10" fill={feetColor} />

      {/* Wave arm (pose==wave) */}
      {pose === 'wave' && (
        <g className={still ? '' : 'nk-wave-arm'} style={{ transformOrigin: '305px 180px' }}>
          <path
            d="M315 180 Q 340 140, 325 100 Q 310 85, 295 110 Q 290 145, 300 185 Z"
            fill={INK}
            stroke={INK}
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  )
}

export const Niksel = memo(NikselInner)
Niksel.displayName = 'Niksel'
export default Niksel

/** Tiny helper — затемнить hex-цвет на n (0..1). Простой HSL-like hack. */
function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - Math.round(255 * amount))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * amount))
  const b = Math.max(0, (n & 0xff) - Math.round(255 * amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/** Mini version for headers/toolbars — just head + beak */
function NikselMiniInner({ size = 32, className, theme = 'auto' }: { size?: number; className?: string; theme?: 'light' | 'dark' | 'auto' }) {
  const { ink: INK, paper: PAPER } = resolveTheme(theme)
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill={INK} />
      <ellipse cx="20" cy="24" rx="12" ry="10" fill={PAPER} />
      <path d="M17 19 L 23 19 L 21.5 24 L 18.5 24 Z" fill={BEAK} />
      <circle cx="15" cy="17" r="2.5" fill={INK} />
      <circle cx="25" cy="17" r="2.5" fill={INK} />
      <circle cx="15.5" cy="16.5" r="0.9" fill={PAPER} />
      <circle cx="25.5" cy="16.5" r="0.9" fill={PAPER} />
    </svg>
  )
}

export const NikselMini = memo(NikselMiniInner)
NikselMini.displayName = 'NikselMini'

/** Chat FAB version — penguin head with headphones */
function NikselMiniChatInner({ size = 42, className, theme = 'auto' }: { size?: number; className?: string; theme?: 'light' | 'dark' | 'auto' }) {
  const { ink: INK, paper: PAPER } = resolveTheme(theme)
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* Head */}
      <circle cx="24" cy="26" r="18" fill={INK} />
      <ellipse cx="24" cy="30" rx="12" ry="10" fill={PAPER} />
      <path d="M21 25 L 27 25 L 25.5 30 L 22.5 30 Z" fill={BEAK} />
      <circle cx="19" cy="23" r="2.5" fill={INK} />
      <circle cx="29" cy="23" r="2.5" fill={INK} />
      <circle cx="19.5" cy="22.5" r="0.9" fill={PAPER} />
      <circle cx="29.5" cy="22.5" r="0.9" fill={PAPER} />
      {/* Headphone band */}
      <path d="M 8 24 Q 8 6 24 6 Q 40 6 40 24" fill="none" stroke={VIOLET} strokeWidth="3.5" strokeLinecap="round"/>
      {/* Left ear cup */}
      <rect x="5" y="21" width="7" height="11" rx="3.5" fill={VIOLET} />
      {/* Right ear cup */}
      <rect x="36" y="21" width="7" height="11" rx="3.5" fill={VIOLET} />
      {/* Cushions */}
      <rect x="7" y="23" width="3" height="7" rx="1.5" fill="#9F8AF5" />
      <rect x="38" y="23" width="3" height="7" rx="1.5" fill="#9F8AF5" />
    </svg>
  )
}

export const NikselMiniChat = memo(NikselMiniChatInner)
NikselMiniChat.displayName = 'NikselMiniChat'
