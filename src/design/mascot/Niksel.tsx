/**
 * Пингвин Никсель — Eduson Kids mascot
 *
 * Per Designbook: progress companion, hint-giver, empty-state presence.
 * Not decoration. Respects the kid as author.
 *
 * Poses: idle | wave | think | celebrate | code | confused
 */
import type { CSSProperties } from 'react'

type Pose = 'idle' | 'wave' | 'think' | 'celebrate' | 'code' | 'confused'

interface Props {
  pose?: Pose
  size?: number
  className?: string
  style?: CSSProperties
}

const INK = '#15141B'
const PAPER = '#FFFBF3'
const BEAK = '#FF9454'
const FEET = '#D96A24'
const YELLOW = '#FFD43C'
const VIOLET = '#6B5CE7'
const PINK = '#FFB4C8'
const CHEEK = '#FFB4C8'

export default function Niksel({ pose = 'idle', size = 240, className, style }: Props) {
  return (
    <svg
      width={size}
      height={(size * 420) / 360}
      viewBox="0 0 360 420"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label={`Пингвин Никсель — ${pose}`}
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
      <path d="M168 160 L 192 160 L 186 184 L 174 184 Z" fill={BEAK} />

      {/* Eyes — pose-dependent */}
      {pose === 'idle' && <>
        <circle cx="152" cy="156" r="9" fill={INK} />
        <circle cx="208" cy="156" r="9" fill={INK} />
        <circle cx="154" cy="154" r="3" fill={PAPER} />
        <circle cx="210" cy="154" r="3" fill={PAPER} />
      </>}
      {pose === 'wave' && <>
        <path d="M143 156 Q152 148, 161 156" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M199 156 Q208 148, 217 156" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>}
      {pose === 'think' && <>
        <circle cx="152" cy="156" r="9" fill={INK} />
        <circle cx="208" cy="156" r="9" fill={INK} />
        <circle cx="148" cy="152" r="2.5" fill={PAPER} />
        <circle cx="204" cy="152" r="2.5" fill={PAPER} />
        {/* Thought bubble */}
        <circle cx="290" cy="80" r="20" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle cx="268" cy="110" r="9" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <circle cx="256" cy="130" r="5" fill={PAPER} stroke={INK} strokeWidth="2" />
        <text x="290" y="88" textAnchor="middle" fill={INK} fontSize="22" fontWeight="900" fontFamily="Nunito, sans-serif">?</text>
      </>}
      {pose === 'celebrate' && <>
        <path d="M140 160 L 164 150 M140 150 L 164 160" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        <path d="M196 160 L 220 150 M196 150 L 220 160" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {/* Stars */}
        <text x="60" y="70" fontSize="28" fill={YELLOW}>★</text>
        <text x="290" y="50" fontSize="22" fill={VIOLET}>★</text>
        <text x="310" y="120" fontSize="24" fill={PINK}>★</text>
      </>}
      {pose === 'code' && <>
        <circle cx="152" cy="156" r="9" fill={INK} />
        <circle cx="208" cy="156" r="9" fill={INK} />
        <circle cx="154" cy="154" r="3" fill={PAPER} />
        <circle cx="210" cy="154" r="3" fill={PAPER} />
        {/* Laptop */}
        <rect x="130" y="280" width="100" height="60" rx="6" fill={VIOLET} />
        <rect x="138" y="288" width="84" height="44" rx="3" fill="#0B0A11" />
        <text x="180" y="315" textAnchor="middle" fill={YELLOW} fontSize="11" fontFamily="JetBrains Mono, monospace">{'def on_start():'}</text>
      </>}
      {pose === 'confused' && <>
        <circle cx="152" cy="156" r="9" fill={INK} />
        <circle cx="208" cy="156" r="9" fill={INK} />
        <circle cx="155" cy="152" r="2" fill={PAPER} />
        <circle cx="205" cy="156" r="2" fill={PAPER} />
        <path d="M164 200 Q180 208, 196 200" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>}

      {/* Cheeks (idle + celebrate) */}
      {(pose === 'idle' || pose === 'celebrate' || pose === 'wave') && <>
        <circle cx="125" cy="180" r="10" fill={CHEEK} opacity="0.55" />
        <circle cx="235" cy="180" r="10" fill={CHEEK} opacity="0.55" />
      </>}

      {/* Feet */}
      <ellipse cx="140" cy="395" rx="26" ry="10" fill={FEET} />
      <ellipse cx="220" cy="395" rx="26" ry="10" fill={FEET} />

      {/* Wave arm (pose==wave) */}
      {pose === 'wave' && (
        <path
          d="M315 180 Q 340 140, 325 100 Q 310 85, 295 110 Q 290 145, 300 185 Z"
          fill={INK}
          stroke={INK}
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

/** Mini version for headers/toolbars — just head + beak */
export function NikselMini({ size = 32, className }: { size?: number; className?: string }) {
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

/** Chat FAB version — penguin head with headphones */
export function NikselMiniChat({ size = 42, className }: { size?: number; className?: string }) {
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
