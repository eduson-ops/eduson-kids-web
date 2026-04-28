// Avatar data model — сериализуется в localStorage, применяется к 3D-модели игрока.

export type EarStyle = 'cat' | 'bear' | 'bunny' | 'none'
export type HatStyle = 'none' | 'cap' | 'crown' | 'helmet' | 'wizard'
export type TailStyle = 'none' | 'cat' | 'fluffy' | 'dragon'
export type BodyShape = 'standard' | 'chubby' | 'thin'
export type CharacterModel =
  | 'custom'
  | 'alien'
  | 'birb'
  | 'blueDemon'
  | 'bunny'
  | 'cactoro'
  | 'penguin'

export interface Avatar {
  name: string
  /** какой 3D-персонаж: "custom" = процедурный котик + цвета / остальные — GLTF с анимациями */
  character: CharacterModel
  bodyColor: string
  headColor: string
  accentColor: string // уши, хвост, шляпа если "не задано иначе"
  earStyle: EarStyle
  hatStyle: HatStyle
  tailStyle: TailStyle
  bodyShape: BodyShape
}

export const PRESET_AVATARS: Avatar[] = [
  // GLTF-пресеты (с анимациями ходьбы, бега, прыжка)
  {
    name: 'Крольчишка',
    character: 'bunny',
    bodyColor: '#ffd1e8',
    headColor: '#ffd1e8',
    accentColor: '#ff5ab1',
    earStyle: 'bunny',
    hatStyle: 'none',
    tailStyle: 'fluffy',
    bodyShape: 'standard',
  },
  {
    name: 'Кактусчик',
    character: 'cactoro',
    bodyColor: '#5ba55b',
    headColor: '#5ba55b',
    accentColor: '#ffd644',
    earStyle: 'none',
    hatStyle: 'crown',
    tailStyle: 'none',
    bodyShape: 'standard',
  },
  {
    name: 'Инопланетянин',
    character: 'alien',
    bodyColor: '#c879ff',
    headColor: '#c879ff',
    accentColor: '#ffd644',
    earStyle: 'none',
    hatStyle: 'helmet',
    tailStyle: 'none',
    bodyShape: 'standard',
  },
  {
    name: 'Птичка',
    character: 'birb',
    bodyColor: '#ffd644',
    headColor: '#ffd644',
    accentColor: '#ff8c1a',
    earStyle: 'none',
    hatStyle: 'none',
    tailStyle: 'none',
    bodyShape: 'standard',
  },
  {
    name: 'Синий Демон',
    character: 'blueDemon',
    bodyColor: '#4c97ff',
    headColor: '#4c97ff',
    accentColor: '#ff5464',
    earStyle: 'none',
    hatStyle: 'none',
    tailStyle: 'dragon',
    bodyShape: 'standard',
  },
  // Процедурные (собираешь сам: цвет, уши, шляпа, хвост)
  {
    name: 'Розовый котик',
    character: 'custom',
    bodyColor: '#ff5ab1',
    headColor: '#ff5ab1',
    accentColor: '#ffffff',
    earStyle: 'cat',
    hatStyle: 'none',
    tailStyle: 'cat',
    bodyShape: 'standard',
  },
  {
    name: 'Ночной волшебник',
    character: 'custom',
    bodyColor: '#2a2840',
    headColor: '#f0e0d0',
    accentColor: '#c879ff',
    earStyle: 'none',
    hatStyle: 'wizard',
    tailStyle: 'none',
    bodyShape: 'standard',
  },
]

export const COLOR_PALETTE = [
  '#ff5ab1', '#ff5464', '#ff8c1a', '#ffd644',
  '#5ba55b', '#4c97ff', '#c879ff', '#2a3340',
  '#f0f0f0', '#8b5a2b', '#1f5f2f', '#ffd1e8',
]

const KEY = 'ek_avatar_v1'

export function loadAvatar(): Avatar {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Avatar>
      // миграция: если старый Avatar без character → ставим 'custom'
      const merged = { ...PRESET_AVATARS[0], ...parsed } as Avatar
      if (!merged.character) merged.character = 'custom'
      return merged
    }
  } catch {
    /* fallthrough */
  }
  return PRESET_AVATARS[0]!
}

export function saveAvatar(a: Avatar) {
  localStorage.setItem(KEY, JSON.stringify(a))
}
