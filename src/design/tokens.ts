/**
 * Eduson Kids — Design Tokens v2.0
 * Source: Designbook-standalone.html (Kirill / Eduson design team, 2026-04)
 *
 * Authoritative spec: `design/brandbook/eduson_kids_brand_spec.md`
 *
 * Core identity:
 *   - Parent brand Эдюсон → inherited wordmark colors, yellow + violet accents
 *   - Warm cream paper background (NOT cold white)
 *   - Chunky "LEGO-like" block shadows (4px bottom offset)
 *   - Block-coding semantic palette: move=violet, logic=yellow, data=mint,
 *     event=pink, world=sky, sound=orange
 *   - Mascot: Пингвин Никсель
 *   - Respect over enthusiasm. Precision over emoji.
 */

// ────────────────────────────────────────────────
// CORE COLORS — from Designbook
// ────────────────────────────────────────────────
export const colors = {
  // Ink (text, dark surfaces)
  ink: {
    DEFAULT: '#15141B',
    soft: '#2B2A36',
  },
  // Paper (warm cream — the ground)
  paper: {
    DEFAULT: '#FFFBF3',
    2: '#F4EFE3',
    3: '#ECE4D2',
  },
  // Brand yellow (Eduson inheritance)
  yellow: {
    DEFAULT: '#FFD43C',
    ink: '#7A5900',
    soft: '#FFF0B0',
    deep: '#C99E00',
  },
  // Brand violet (Eduson inheritance — primary action)
  violet: {
    DEFAULT: '#6B5CE7',
    deep: '#4A3DC9',
    soft: '#E4E0FC',
    ink: '#2A1F8C',
  },
  // Mint (data / success)
  mint: {
    DEFAULT: '#9FE8C7',
    deep: '#3DB07A',
    soft: '#E1F7EC',
    ink: '#0C4E2E',
  },
  // Pink (events / warnings)
  pink: {
    DEFAULT: '#FFB4C8',
    deep: '#E8517B',
    soft: '#FFE4EC',
    ink: '#6A1A33',
  },
  // Sky (world / info)
  sky: {
    DEFAULT: '#A9D8FF',
    deep: '#3E87E8',
    soft: '#DFF0FF',
    ink: '#1A3A6E',
  },
  // Orange (sound / highlight)
  orange: {
    DEFAULT: '#FF9454',
    deep: '#D96A24',
    soft: '#FFE2CE',
    ink: '#6B2A05',
  },
  // Semantic shortcuts
  success: '#3DB07A',
  warn: '#FFD43C',
  error: '#E8517B',
  info: '#3E87E8',
} as const

// ────────────────────────────────────────────────
// BLOCK-CODING CATEGORY COLORS (MUST match brandbook)
// ────────────────────────────────────────────────
export const blockColors = {
  move: { bg: colors.violet.DEFAULT, ink: colors.paper.DEFAULT, label: 'Движение' },
  logic: { bg: colors.yellow.DEFAULT, ink: colors.yellow.ink, label: 'Логика' },
  data: { bg: colors.mint.DEFAULT, ink: colors.mint.ink, label: 'Данные' },
  event: { bg: colors.pink.DEFAULT, ink: colors.pink.ink, label: 'События' },
  world: { bg: colors.sky.DEFAULT, ink: colors.sky.ink, label: 'Мир' },
  sound: { bg: colors.orange.DEFAULT, ink: colors.orange.ink, label: 'Звук' },
} as const

// ────────────────────────────────────────────────
// 3D SCENE SKY PRESETS
// ────────────────────────────────────────────────
export const sky = {
  day: { top: '#3d88ff', bottom: '#b8e1ff' },
  evening: { top: '#ff7a4d', bottom: '#ffc16a' },
  night: { top: '#0a1128', bottom: '#324a7a' },
  cloudy: { top: '#7a8ba0', bottom: '#c8d3de' },
  space: { top: '#05010f', bottom: '#1a0e3d' },
} as const

// ────────────────────────────────────────────────
// TYPOGRAPHY
// ────────────────────────────────────────────────
export const fonts = {
  display: "'Nunito', 'Manrope', ui-sans-serif, system-ui, sans-serif",
  ui: "'Nunito', 'Manrope', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const

export const fontSizes = {
  xs: '11px',
  sm: '13px',
  base: '15px',
  lg: '17px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '40px',
  '5xl': '56px',
  hero: '92px',
  cover: '180px',
} as const

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
  black: 900,
} as const

export const letterSpacing = {
  tight: '-0.055em',
  tighter: '-0.035em',
  tighten: '-0.02em',
  normal: '0',
  wide: '.08em',
  wider: '.14em',
  widest: '.16em',
} as const

// ────────────────────────────────────────────────
// SPACING (4-base)
// ────────────────────────────────────────────────
export const space = {
  0: '0',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// ────────────────────────────────────────────────
// BORDERS / RADIUS
// ────────────────────────────────────────────────
export const radii = {
  none: '0',
  sm: '6px',
  md: '10px',
  lg: '14px', // block radius
  xl: '22px', // card
  '2xl': '32px', // hero card
  full: '9999px',
} as const

// ────────────────────────────────────────────────
// SHADOWS (warm, not cool)
// ────────────────────────────────────────────────
export const shadows = {
  1: '0 1px 0 rgba(21,20,27,.08), 0 2px 6px rgba(21,20,27,.06)',
  2: '0 2px 0 rgba(21,20,27,.10), 0 8px 20px rgba(21,20,27,.08)',
  3: '0 3px 0 rgba(21,20,27,.14), 0 16px 40px rgba(21,20,27,.10)',
  press: '0 1px 0 rgba(21,20,27,.14)',
  block: '0 4px 0 0 rgba(21,20,27,.22)',
  blockSm: '0 3px 0 0 rgba(21,20,27,.2)',
  focus: '0 0 0 4px rgba(107,92,231,.25)',
} as const

// ────────────────────────────────────────────────
// MOTION
// ────────────────────────────────────────────────
export const motion = {
  ease: 'cubic-bezier(.22,1,.36,1)',
  fast: '120ms cubic-bezier(.22,1,.36,1)',
  base: '220ms cubic-bezier(.22,1,.36,1)',
  slow: '350ms cubic-bezier(.22,1,.36,1)',
  bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

// ────────────────────────────────────────────────
// Z-INDEX
// ────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  hudBackground: 5,
  hud: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
  fab: 50,
  tooltip: 60,
} as const

// ────────────────────────────────────────────────
// BREAKPOINTS
// ────────────────────────────────────────────────
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ────────────────────────────────────────────────
// Emit CSS vars
// ────────────────────────────────────────────────
export function emitCssVars(): string {
  const lines: string[] = [':root {']

  // Core ink/paper
  lines.push(`  --ink: ${colors.ink.DEFAULT};`)
  lines.push(`  --ink-soft: ${colors.ink.soft};`)
  lines.push(`  --paper: ${colors.paper.DEFAULT};`)
  lines.push(`  --paper-2: ${colors.paper[2]};`)
  lines.push(`  --paper-3: ${colors.paper[3]};`)

  // Brand families
  for (const key of ['yellow', 'violet', 'mint', 'pink', 'sky', 'orange'] as const) {
    const c = colors[key]
    lines.push(`  --${key}: ${c.DEFAULT};`)
    lines.push(`  --${key}-ink: ${c.ink};`)
    lines.push(`  --${key}-soft: ${c.soft};`)
    lines.push(`  --${key}-deep: ${c.deep};`)
  }

  // Block categories
  for (const [key, val] of Object.entries(blockColors)) {
    lines.push(`  --b-${key}: ${val.bg};`)
    lines.push(`  --b-${key}-ink: ${val.ink};`)
  }

  // Fonts
  for (const [k, v] of Object.entries(fonts)) lines.push(`  --f-${k}: ${v};`)
  for (const [k, v] of Object.entries(fontSizes)) lines.push(`  --text-${k}: ${v};`)
  for (const [k, v] of Object.entries(fontWeights)) lines.push(`  --weight-${k}: ${v};`)

  // Spacing, radii, shadows, motion, z
  for (const [k, v] of Object.entries(space)) lines.push(`  --space-${k}: ${v};`)
  for (const [k, v] of Object.entries(radii)) lines.push(`  --r-${k}: ${v};`)
  for (const [k, v] of Object.entries(shadows)) lines.push(`  --sh-${k}: ${v};`)
  for (const [k, v] of Object.entries(motion)) lines.push(`  --motion-${k}: ${v};`)
  for (const [k, v] of Object.entries(zIndex)) lines.push(`  --z-${k}: ${v};`)

  // Ease alias
  lines.push(`  --ease: ${motion.ease};`)

  lines.push('}')
  return lines.join('\n')
}

// ────────────────────────────────────────────────
// Theme export
// ────────────────────────────────────────────────
export const theme = {
  colors,
  blockColors,
  sky,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacing,
  space,
  radii,
  shadows,
  motion,
  zIndex,
  breakpoints,
} as const

export type Theme = typeof theme
