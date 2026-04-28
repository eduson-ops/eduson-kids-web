/**
 * NikselIcon — маленькие стилизованные пингвины-иконки для замены эмоджи.
 * Используются как аватарки модулей/курсов/капстонов.
 *
 * Каждый вариант — Niksel в своём «костюме»:
 *   - build   (🧱) — каска строителя, строит
 *   - game    (🎮) — с геймпадом
 *   - coin    (💰) — держит монету
 *   - loop    (🔁) — с кольцом-стрелочкой над головой
 *   - logic   (🧠) — в очках, умный
 *   - python  (🐍) — в очках, с блокнотом
 *   - spark   (⚡) — держит молнию
 *   - trophy  (🏆) — с кубком
 *   - book    (📚) — с книжкой
 *   - web     (🌐) — с паутинкой-шариком
 *   - brain   (🧠) — думает
 *   - palette (🎨) — с палитрой художника
 *   - rocket  (🚀) — на ракете
 *   - db      (📊) — с папкой данных
 *   - folder  (📁) — с папкой
 *   - ai      (🤖) — робо-пингвин
 *   - score   (📊) — с графиком
 *   - star    (⭐) — звезда
 */

import { memo, type CSSProperties } from 'react'

export type NikselIconKind =
  | 'build' | 'game' | 'coin' | 'loop' | 'logic' | 'python'
  | 'spark' | 'trophy' | 'book' | 'web' | 'brain' | 'palette'
  | 'rocket' | 'db' | 'folder' | 'ai' | 'score' | 'star' | 'heart'

/**
 * Маппинг emoji → NikselIconKind. Используется в местах, где в коде уже
 * лежат эмоджи (курсы, модули, капстоны). Fallback — 'star'.
 */
export function iconFromEmoji(emoji: string | undefined): NikselIconKind {
  if (!emoji) return 'star'
  const m: Record<string, NikselIconKind> = {
    '🧱': 'build', '🎮': 'game', '💰': 'coin', '🔁': 'loop',
    '🧠': 'brain', '🐍': 'python', '⚡': 'spark', '🏆': 'trophy',
    '📚': 'book', '🌐': 'web', '🎨': 'palette', '🚀': 'rocket',
    '📊': 'score', '📁': 'folder', '🤖': 'ai', '⭐': 'star',
    '❤': 'heart', '❤️': 'heart',
    '🎓': 'book', '📓': 'book', '📖': 'book',
    '🗼': 'trophy', '🎯': 'star', '💎': 'star',
    '🏎': 'rocket', '🏗': 'build', '👾': 'game',
    '1': 'build', '2': 'game', '3': 'coin', '4': 'loop',
    '5': 'logic', '6': 'python', '7': 'spark', '8': 'trophy',
  }
  return m[emoji] ?? 'star'
}

interface Props {
  kind: NikselIconKind
  size?: number
  /** Заливка задней «плашки» (если не задан — прозрачно). */
  bg?: string
  className?: string
  style?: CSSProperties
  title?: string
}

const INK = '#15141B'
const PAPER = '#FFFBF3'
const BEAK = '#FF9454'
const FEET = '#D96A24'
const YELLOW = '#FFD43C'
const VIOLET = '#6B5CE7'
const MINT = '#3DB07A'
const PINK = '#FFB4C8'
const SKY = '#5AA9FF'

/**
 * Базовое тело пингвина + накладываемый «аксессуар» под kind.
 * Размер = 1:1, свёрнуто в 100×120 viewBox.
 */
function NikselIconInner({ kind, size = 64, bg, className, style, title }: Props) {
  const w = size
  const h = Math.round((size * 120) / 100)

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={title ?? `Никсель ${kind}`}
    >
      {bg && <rect width="100" height="120" rx="22" fill={bg} />}
      {/* Тело (чёрное) */}
      <ellipse cx="50" cy="66" rx="32" ry="42" fill={INK} />
      {/* Белая грудка */}
      <ellipse cx="50" cy="72" rx="22" ry="32" fill={PAPER} />
      {/* Клюв */}
      <path d="M46 62 L54 62 L50 70 Z" fill={BEAK} />
      {/* Глаза */}
      <circle cx="42" cy="54" r="3.2" fill={INK} />
      <circle cx="58" cy="54" r="3.2" fill={INK} />
      {/* Блики */}
      <circle cx="42.8" cy="53.3" r="1" fill={PAPER} />
      <circle cx="58.8" cy="53.3" r="1" fill={PAPER} />
      {/* Щёчки */}
      <circle cx="36" cy="62" r="3" fill={PINK} opacity="0.7" />
      <circle cx="64" cy="62" r="3" fill={PINK} opacity="0.7" />
      {/* Ноги */}
      <ellipse cx="42" cy="107" rx="6" ry="4" fill={FEET} />
      <ellipse cx="58" cy="107" rx="6" ry="4" fill={FEET} />

      {renderAccessory(kind)}
    </svg>
  )
}

export const NikselIcon = memo(NikselIconInner)
NikselIcon.displayName = 'NikselIcon'
export default NikselIcon

function renderAccessory(kind: NikselIconKind) {
  switch (kind) {
    case 'build':
      // Жёлтая каска строителя
      return (
        <g>
          <ellipse cx="50" cy="28" rx="22" ry="8" fill={YELLOW} />
          <path d="M28 28 Q28 14 50 14 Q72 14 72 28 Z" fill={YELLOW} />
          <rect x="28" y="27" width="44" height="4" fill="#C99E00" />
          <circle cx="50" cy="20" r="2" fill={PAPER} />
        </g>
      )
    case 'game':
      // Геймпад в «руках»
      return (
        <g>
          <rect x="26" y="74" width="48" height="16" rx="8" fill={VIOLET} />
          <circle cx="36" cy="82" r="2.4" fill={PAPER} />
          <circle cx="64" cy="82" r="2.4" fill={PAPER} />
          <rect x="45" y="78" width="4" height="8" fill={PAPER} />
          <rect x="51" y="78" width="4" height="8" fill={PAPER} />
        </g>
      )
    case 'coin':
      // Монета у груди
      return (
        <g>
          <circle cx="50" cy="82" r="10" fill={YELLOW} stroke="#C99E00" strokeWidth="2" />
          <text x="50" y="87" textAnchor="middle" fontSize="11" fontWeight="900" fill="#7A5900" fontFamily="Nunito, sans-serif">₽</text>
        </g>
      )
    case 'loop':
      // Кольцо-стрелка над головой
      return (
        <g>
          <path d="M34 22 A16 16 0 1 0 66 22" stroke={MINT} strokeWidth="5" fill="none" strokeLinecap="round" />
          <polygon points="66,22 60,18 60,26" fill={MINT} />
        </g>
      )
    case 'logic':
      // Мозг над головой + очки
      return (
        <g>
          <path d="M38 20 Q32 14 38 10 Q46 6 50 12 Q54 6 62 10 Q68 14 62 20 Q64 26 50 28 Q36 26 38 20 Z" fill={PINK} />
          <circle cx="42" cy="54" r="5.5" fill="none" stroke={INK} strokeWidth="1.8" />
          <circle cx="58" cy="54" r="5.5" fill="none" stroke={INK} strokeWidth="1.8" />
          <line x1="47" y1="54" x2="53" y2="54" stroke={INK} strokeWidth="1.8" />
        </g>
      )
    case 'python':
      // Змейка-шарф вокруг шеи + очки
      return (
        <g>
          <path d="M30 78 Q50 82 70 78 Q64 86 50 84 Q36 86 30 78 Z" fill={MINT} />
          <circle cx="42" cy="54" r="5.5" fill="none" stroke={INK} strokeWidth="1.8" />
          <circle cx="58" cy="54" r="5.5" fill="none" stroke={INK} strokeWidth="1.8" />
        </g>
      )
    case 'spark':
      // Молния над головой
      return (
        <polygon
          points="48,6 58,20 50,22 56,36 40,22 48,20"
          fill={YELLOW}
          stroke="#C99E00"
          strokeWidth="1.5"
        />
      )
    case 'trophy':
      // Кубок над головой
      return (
        <g>
          <rect x="42" y="18" width="16" height="14" rx="2" fill={YELLOW} />
          <rect x="38" y="32" width="24" height="4" fill="#C99E00" />
          <rect x="46" y="36" width="8" height="4" fill="#C99E00" />
          <rect x="42" y="40" width="16" height="3" fill="#C99E00" />
          <path d="M42 22 Q36 22 36 28 Q36 32 42 32" stroke={YELLOW} strokeWidth="2" fill="none" />
          <path d="M58 22 Q64 22 64 28 Q64 32 58 32" stroke={YELLOW} strokeWidth="2" fill="none" />
        </g>
      )
    case 'book':
      // Книжка в «руках»
      return (
        <g>
          <rect x="30" y="76" width="40" height="18" rx="2" fill={SKY} />
          <line x1="50" y1="76" x2="50" y2="94" stroke={INK} strokeWidth="1" />
          <line x1="34" y1="80" x2="46" y2="80" stroke={PAPER} strokeWidth="1" />
          <line x1="34" y1="84" x2="46" y2="84" stroke={PAPER} strokeWidth="1" />
          <line x1="54" y1="80" x2="66" y2="80" stroke={PAPER} strokeWidth="1" />
        </g>
      )
    case 'web':
      // Глобус/паутинка над головой
      return (
        <g>
          <circle cx="50" cy="22" r="14" fill={SKY} stroke={INK} strokeWidth="1.5" />
          <ellipse cx="50" cy="22" rx="14" ry="6" fill="none" stroke={INK} strokeWidth="1" />
          <line x1="36" y1="22" x2="64" y2="22" stroke={INK} strokeWidth="1" />
          <ellipse cx="50" cy="22" rx="6" ry="14" fill="none" stroke={INK} strokeWidth="1" />
        </g>
      )
    case 'brain':
      return (
        <g>
          <path d="M38 22 Q32 18 36 12 Q42 6 50 12 Q58 6 64 12 Q68 18 62 22 Q66 28 50 30 Q34 28 38 22 Z" fill={PINK} />
        </g>
      )
    case 'palette':
      // Палитра художника
      return (
        <g>
          <path d="M28 78 Q28 64 44 64 Q72 64 72 82 Q72 92 60 92 Q58 86 52 90 Q44 94 36 92 Q28 90 28 78 Z" fill={PAPER} stroke={INK} strokeWidth="1.5" />
          <circle cx="38" cy="76" r="3" fill={YELLOW} />
          <circle cx="50" cy="72" r="3" fill={VIOLET} />
          <circle cx="62" cy="76" r="3" fill={MINT} />
          <circle cx="58" cy="84" r="3" fill={PINK} />
        </g>
      )
    case 'rocket':
      // Ракета за пингвином (вертикальная)
      return (
        <g>
          <path d="M70 28 L80 48 L72 48 L72 60 L66 60 L66 48 L62 48 Z" fill={PINK} stroke={INK} strokeWidth="1.5" />
          <circle cx="71" cy="40" r="2" fill={PAPER} />
          <path d="M62 60 L66 66 L72 60" fill={YELLOW} />
        </g>
      )
    case 'db':
      // Стопка цилиндров-баз
      return (
        <g>
          <ellipse cx="74" cy="74" rx="12" ry="4" fill={SKY} />
          <rect x="62" y="74" width="24" height="10" fill={SKY} />
          <ellipse cx="74" cy="84" rx="12" ry="4" fill="#3E87E8" />
        </g>
      )
    case 'folder':
      return (
        <g>
          <path d="M60 74 L68 74 L72 78 L92 78 L92 96 L60 96 Z" fill={YELLOW} stroke={INK} strokeWidth="1.5" />
        </g>
      )
    case 'ai':
      // Антенки-усики робо
      return (
        <g>
          <line x1="44" y1="24" x2="42" y2="12" stroke={INK} strokeWidth="2" />
          <line x1="56" y1="24" x2="58" y2="12" stroke={INK} strokeWidth="2" />
          <circle cx="42" cy="12" r="3" fill={VIOLET} />
          <circle cx="58" cy="12" r="3" fill={VIOLET} />
        </g>
      )
    case 'score':
      // Бар-чарт справа
      return (
        <g>
          <rect x="70" y="86" width="5" height="8" fill={MINT} />
          <rect x="77" y="80" width="5" height="14" fill={MINT} />
          <rect x="84" y="74" width="5" height="20" fill={MINT} />
        </g>
      )
    case 'star':
      return (
        <polygon
          points="50,6 56,18 70,20 60,28 63,42 50,34 37,42 40,28 30,20 44,18"
          fill={YELLOW}
          stroke="#C99E00"
          strokeWidth="1.5"
        />
      )
    case 'heart':
      return (
        <path
          d="M50 24 C48 18 38 16 38 26 C38 34 50 40 50 40 C50 40 62 34 62 26 C62 16 52 18 50 24 Z"
          fill={PINK}
          stroke={INK}
          strokeWidth="1.5"
        />
      )
  }
}
