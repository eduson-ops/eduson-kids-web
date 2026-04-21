// Avatar data model — сериализуется в localStorage, применяется к 3D-модели игрока.

export type EarStyle = 'cat' | 'bear' | 'bunny' | 'none'
export type HatStyle = 'none' | 'cap' | 'crown' | 'helmet' | 'wizard'
export type TailStyle = 'none' | 'cat' | 'fluffy' | 'dragon'
export type BodyShape = 'standard' | 'chubby' | 'thin'

export interface Avatar {
  name: string
  bodyColor: string
  headColor: string
  accentColor: string // уши, хвост, шляпа если "не задано иначе"
  earStyle: EarStyle
  hatStyle: HatStyle
  tailStyle: TailStyle
  bodyShape: BodyShape
}

export const PRESET_AVATARS: Avatar[] = [
  {
    name: 'Розовый котик',
    bodyColor: '#ff5ab1',
    headColor: '#ff5ab1',
    accentColor: '#ffffff',
    earStyle: 'cat',
    hatStyle: 'none',
    tailStyle: 'cat',
    bodyShape: 'standard',
  },
  {
    name: 'Лесной медвежонок',
    bodyColor: '#8b5a2b',
    headColor: '#8b5a2b',
    accentColor: '#2a1a0a',
    earStyle: 'bear',
    hatStyle: 'cap',
    tailStyle: 'none',
    bodyShape: 'chubby',
  },
  {
    name: 'Зайка-синичка',
    bodyColor: '#4c97ff',
    headColor: '#e8eaf2',
    accentColor: '#ff5ab1',
    earStyle: 'bunny',
    hatStyle: 'none',
    tailStyle: 'fluffy',
    bodyShape: 'standard',
  },
  {
    name: 'Маленький дракон',
    bodyColor: '#5ba55b',
    headColor: '#5ba55b',
    accentColor: '#ffd644',
    earStyle: 'none',
    hatStyle: 'crown',
    tailStyle: 'dragon',
    bodyShape: 'thin',
  },
  {
    name: 'Ночной волшебник',
    bodyColor: '#2a2840',
    headColor: '#f0e0d0',
    accentColor: '#c879ff',
    earStyle: 'none',
    hatStyle: 'wizard',
    tailStyle: 'none',
    bodyShape: 'standard',
  },
  {
    name: 'Космонавт',
    bodyColor: '#f0f0f0',
    headColor: '#e8eaf2',
    accentColor: '#4c97ff',
    earStyle: 'none',
    hatStyle: 'helmet',
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
      return { ...PRESET_AVATARS[0], ...parsed } as Avatar
    }
  } catch {
    /* fallthrough */
  }
  return PRESET_AVATARS[0]
}

export function saveAvatar(a: Avatar) {
  localStorage.setItem(KEY, JSON.stringify(a))
}
