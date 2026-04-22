import type { PropKind } from './worldEdits'

/**
 * Каталог пропсов для Q-меню — структура категорий, названия, иконки, цвета.
 * UX-паттерны навеяны Garry's Mod sandbox Q-menu, но весь контент — наш CC0.
 */

export interface CatalogItem {
  kind: PropKind
  label: string
  emoji: string
  defaultColor: string
  /** Краткое описание — показывается в hover-tooltip */
  hint?: string
  /** Теги для поиска */
  tags: string[]
}

export interface CatalogCategory {
  id: string
  name: string
  icon: string
  items: CatalogItem[]
}

export const CATALOG: CatalogCategory[] = [
  {
    id: 'blocks',
    name: 'Блоки',
    icon: '🧱',
    items: [
      { kind: 'cube', label: 'Куб', emoji: '🟨', defaultColor: '#FFD43C', tags: ['блок','куб','квадрат','box'], hint: 'Базовый строительный блок' },
      { kind: 'sphere', label: 'Шар', emoji: '⚽', defaultColor: '#FF9454', tags: ['шар','сфера','ball'], hint: 'Катится, если не закреплён' },
      { kind: 'cylinder', label: 'Столб', emoji: '🥫', defaultColor: '#6B5CE7', tags: ['столб','колонна','cylinder'], hint: 'Вертикальный цилиндр' },
      { kind: 'ramp', label: 'Рампа', emoji: '📐', defaultColor: '#5AA9FF', tags: ['рампа','наклон','ramp'], hint: 'Наклонная поверхность' },
      { kind: 'plate', label: 'Платформа', emoji: '⬜', defaultColor: '#9FE8C7', tags: ['платформа','пол','plate'], hint: 'Тонкая широкая плита' },
    ],
  },
  {
    id: 'gameplay',
    name: 'Геймплей',
    icon: '🎮',
    items: [
      { kind: 'coin', label: 'Монета', emoji: '💰', defaultColor: '#FFD43C', tags: ['монета','золото','coin'], hint: 'При касании даёт +1 очко' },
      { kind: 'checkpoint', label: 'Чекпоинт', emoji: '🚩', defaultColor: '#48c774', tags: ['чекпоинт','checkpoint','флаг'], hint: 'Сохраняет прогресс' },
      { kind: 'goal', label: 'Финиш', emoji: '🏁', defaultColor: '#ffd644', tags: ['финиш','goal','конец'], hint: 'Цель уровня' },
      { kind: 'spike', label: 'Шип', emoji: '❗', defaultColor: '#ff5464', tags: ['шип','ловушка','spike'], hint: 'Опасный' },
      { kind: 'bouncer', label: 'Батут', emoji: '🤸', defaultColor: '#ff5ab1', tags: ['батут','прыжок','bouncer'], hint: 'Подбрасывает игрока' },
    ],
  },
  {
    id: 'platformer',
    name: 'Платформер',
    icon: '🎯',
    items: [
      { kind: 'chest', label: 'Сундук', emoji: '🎁', defaultColor: '#FFD43C', tags: ['сундук','chest','клад','treasure'], hint: 'Kenney Platformer Kit' },
      { kind: 'key', label: 'Ключ', emoji: '🗝', defaultColor: '#FFD43C', tags: ['ключ','key','замок'], hint: 'Открывает дверь' },
      { kind: 'star', label: 'Звезда', emoji: '⭐', defaultColor: '#FFD43C', tags: ['звезда','star','очки','балл'], hint: 'Собери все звёзды' },
      { kind: 'heart', label: 'Сердце', emoji: '❤', defaultColor: '#ff5464', tags: ['сердце','жизнь','heart','hp'], hint: 'Прибавляет жизнь' },
      { kind: 'bomb', label: 'Бомба', emoji: '💣', defaultColor: '#2a3340', tags: ['бомба','bomb','взрыв','опасность'], hint: 'Опасный предмет' },
      { kind: 'barrel', label: 'Бочка', emoji: '🪣', defaultColor: '#8b5a2b', tags: ['бочка','barrel'], hint: 'Деревянная бочка' },
      { kind: 'crate', label: 'Ящик', emoji: '📦', defaultColor: '#C99E00', tags: ['ящик','crate','коробка'], hint: 'Деревянный ящик' },
      { kind: 'ladder', label: 'Лестница', emoji: '🪜', defaultColor: '#8b5a2b', tags: ['лестница','ladder','подъём'], hint: 'Можно залезть вверх' },
      { kind: 'tree-pine', label: 'Сосна', emoji: '🌲', defaultColor: '#34C38A', tags: ['сосна','ель','pine','хвойное','дерево'], hint: 'Kenney Platformer' },
      { kind: 'flag-platformer', label: 'Флаг', emoji: '🏴', defaultColor: '#ff5464', tags: ['флаг','flag','финиш'], hint: 'Флажок-декор' },
    ],
  },
  {
    id: 'mechanics',
    name: 'Механики',
    icon: '⚡',
    items: [
      { kind: 'speed-pad',  label: 'Ускоритель', emoji: '⚡', defaultColor: '#FFD43C', tags: ['ускоритель','speed','скорость','boost'], hint: 'Платформа-ускоритель' },
      { kind: 'portal',     label: 'Портал',     emoji: '🌀', defaultColor: '#6B5CE7', tags: ['портал','portal','телепорт','ring'], hint: 'Светящееся кольцо' },
      { kind: 'crystal',    label: 'Кристалл',   emoji: '💎', defaultColor: '#5AA9FF', tags: ['кристалл','crystal','gem','камень'], hint: 'Светящийся кристалл' },
      { kind: 'campfire',   label: 'Костёр',     emoji: '🔥', defaultColor: '#FF9454', tags: ['костёр','campfire','огонь','fire'], hint: 'Декоративный костёр' },
      { kind: 'sign',       label: 'Знак',       emoji: '🪧', defaultColor: '#8b5a2b', tags: ['знак','sign','табличка','доска'], hint: 'Деревянная табличка' },
      { kind: 'stair-step', label: 'Ступень',    emoji: '🔲', defaultColor: '#9FE8C7', tags: ['ступень','stair','лестница','step'], hint: 'Ступенька для лестниц' },
    ],
  },
  {
    id: 'nature',
    name: 'Природа',
    icon: '🌳',
    items: [
      { kind: 'tree', label: 'Дерево', emoji: '🌳', defaultColor: '#34C38A', tags: ['дерево','tree'], hint: 'Stylized Nature MegaKit' },
      { kind: 'bush', label: 'Куст', emoji: '🌿', defaultColor: '#48c774', tags: ['куст','bush'] },
      { kind: 'mushroom', label: 'Гриб', emoji: '🍄', defaultColor: '#ff5464', tags: ['гриб','mushroom'] },
      { kind: 'rock', label: 'Камень', emoji: '🪨', defaultColor: '#8b8b8b', tags: ['камень','скала','rock'] },
      { kind: 'flower', label: 'Цветы', emoji: '🌸', defaultColor: '#ff5ab1', tags: ['цветы','flower'] },
      { kind: 'grass-tuft', label: 'Трава', emoji: '🌾', defaultColor: '#5ba55b', tags: ['трава','grass'] },
    ],
  },
  {
    id: 'npcs',
    name: 'Персонажи',
    icon: '🧑',
    items: [
      { kind: 'npc-bunny', label: 'Кролик', emoji: '🐰', defaultColor: '#ffd1e8', tags: ['кролик','bunny','зайка'], hint: 'Quaternius Ultimate Monsters' },
      { kind: 'npc-alien', label: 'Алиен', emoji: '👽', defaultColor: '#c879ff', tags: ['алиен','инопланетянин','alien'] },
      { kind: 'npc-cactoro', label: 'Кактор', emoji: '🌵', defaultColor: '#5ba55b', tags: ['кактус','кактор','cactoro'] },
      { kind: 'npc-birb', label: 'Птичка', emoji: '🐦', defaultColor: '#ffd644', tags: ['птица','bird','птичка'] },
      { kind: 'npc-bluedemon', label: 'Синий демон', emoji: '👾', defaultColor: '#5AA9FF', tags: ['демон','demon','монстр'], hint: 'Злой NPC' },
    ],
  },
  {
    id: 'lights',
    name: 'Свет',
    icon: '💡',
    items: [
      { kind: 'light', label: 'Лампа', emoji: '💡', defaultColor: '#fff3d8', tags: ['лампа','свет','light'], hint: 'Точечный источник' },
      { kind: 'torch', label: 'Факел', emoji: '🔥', defaultColor: '#ff9454', tags: ['факел','огонь','torch'], hint: 'Пламя + свет' },
      { kind: 'neon-sign', label: 'Неон-знак', emoji: '✨', defaultColor: '#00ffff', tags: ['неон','neon','знак'], hint: 'Светящийся куб' },
    ],
  },
  {
    id: 'decor',
    name: 'Декор',
    icon: '🏛',
    items: [
      { kind: 'building', label: 'Здание', emoji: '🏢', defaultColor: '#c0c0c0', tags: ['здание','дом','building'], hint: 'Kenney City Kit' },
      { kind: 'car', label: 'Машина', emoji: '🚗', defaultColor: '#ff5464', tags: ['машина','car','авто'], hint: 'Kenney Car Kit' },
      { kind: 'pumpkin', label: 'Тыква', emoji: '🎃', defaultColor: '#ff9454', tags: ['тыква','pumpkin','хэллоуин'], hint: 'Kenney Graveyard' },
      { kind: 'coffin', label: 'Гроб', emoji: '⚰', defaultColor: '#6b4f2a', tags: ['гроб','coffin'] },
      { kind: 'candle', label: 'Свеча', emoji: '🕯', defaultColor: '#fff3d8', tags: ['свеча','candle'] },
    ],
  },
  {
    id: 'architecture',
    name: 'Архитектура',
    icon: '🏛',
    items: [
      { kind: 'arch',       label: 'Арка',      emoji: '🏛', defaultColor: '#c0c0c0', tags: ['арка','arch','ворота','портал'], hint: 'Каменная арка-проход' },
      { kind: 'fence',      label: 'Забор',      emoji: '🪟', defaultColor: '#8b5a2b', tags: ['забор','fence','ограда','плетень'], hint: 'Деревянный забор' },
      { kind: 'bench',      label: 'Скамейка',   emoji: '🪑', defaultColor: '#8b5a2b', tags: ['скамья','скамейка','bench','сидение'], hint: 'Парковая скамья' },
      { kind: 'flower-pot', label: 'Клумба',     emoji: '🪴', defaultColor: '#9FE8C7', tags: ['клумба','цветочный горшок','flower-pot','плантер'], hint: 'Декоративная клумба' },
      { kind: 'halfpipe',   label: 'Хаф-пайп',  emoji: '🛹', defaultColor: '#9FE8C7', tags: ['хаф-пайп','halfpipe','скейт','рампа'], hint: 'Скейт-рампа изогнутая' },
    ],
  },
  {
    id: 'special',
    name: 'Особые',
    icon: '✨',
    items: [
      { kind: 'windmill',      label: 'Ветряк',        emoji: '🌀', defaultColor: '#c0c0c0', tags: ['ветряк','мельница','windmill','анимация'], hint: 'Вращающийся ветряк' },
      { kind: 'snowman',       label: 'Снеговик',      emoji: '☃', defaultColor: '#ffffff', tags: ['снеговик','snowman','зима','снег'], hint: 'Декоративный снеговик' },
      { kind: 'satellite-dish',label: 'Антенна',       emoji: '📡', defaultColor: '#c0c0c0', tags: ['антенна','тарелка','satellite','tech'], hint: 'Спутниковая тарелка' },
    ],
  },
  {
    id: 'food',
    name: 'Еда',
    icon: '🍰',
    items: [
      { kind: 'cake',      label: 'Торт',       emoji: '🎂', defaultColor: '#FFB4C8', tags: ['торт','cake','праздник','десерт'], hint: 'Трёхъярусный торт' },
      { kind: 'donut',     label: 'Пончик',     emoji: '🍩', defaultColor: '#FF9454', tags: ['пончик','donut','круглый','сладкое'], hint: 'Тор-пончик с глазурью' },
      { kind: 'ice-cream', label: 'Мороженое',  emoji: '🍦', defaultColor: '#9FE8C7', tags: ['мороженое','ice cream','конус','холодное'], hint: 'Рожок мороженого' },
    ],
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    icon: '🚀',
    items: [
      { kind: 'rocket',   label: 'Ракета',   emoji: '🚀', defaultColor: '#c0c0c0', tags: ['ракета','rocket','космос','space'], hint: 'Космическая ракета' },
      { kind: 'robot',    label: 'Робот',    emoji: '🤖', defaultColor: '#6B5CE7', tags: ['робот','robot','машина','android'], hint: 'Квадратный робот' },
      { kind: 'ufo',      label: 'НЛО',      emoji: '🛸', defaultColor: '#9FE8C7', tags: ['нло','ufo','тарелка','космос','alien'], hint: 'Летающая тарелка' },
    ],
  },
  {
    id: 'fantasy',
    name: 'Фэнтези',
    icon: '🏰',
    items: [
      { kind: 'castle-tower', label: 'Башня',   emoji: '🏰', defaultColor: '#8b8b8b', tags: ['башня','замок','tower','castle','крепость'], hint: 'Каменная башня' },
      { kind: 'magic-orb',   label: 'Орб',      emoji: '🔮', defaultColor: '#6B5CE7', tags: ['шар','орб','магия','magic','crystal ball'], hint: 'Светящийся магический шар' },
      { kind: 'throne',      label: 'Трон',     emoji: '👑', defaultColor: '#FFD43C', tags: ['трон','throne','корона','king','chair'], hint: 'Королевский трон' },
    ],
  },
  {
    id: 'music',
    name: 'Музыка',
    icon: '🎵',
    items: [
      { kind: 'guitar',    label: 'Гитара',     emoji: '🎸', defaultColor: '#8b4513', tags: ['гитара','guitar','музыка','music','струны'], hint: 'Акустическая гитара' },
      { kind: 'piano',     label: 'Пианино',    emoji: '🎹', defaultColor: '#2a2a2a', tags: ['пианино','piano','клавиши','keyboard','музыка'], hint: 'Чёрное пианино' },
      { kind: 'drum-kit',  label: 'Барабаны',   emoji: '🥁', defaultColor: '#c0392b', tags: ['барабаны','drums','ударные','drum kit','музыка'], hint: 'Ударная установка' },
    ],
  },
  {
    id: 'sports',
    name: 'Спорт',
    icon: '⚽',
    items: [
      { kind: 'soccer-ball', label: 'Мяч',       emoji: '⚽', defaultColor: '#ffffff', tags: ['мяч','ball','футбол','soccer','football'], hint: 'Футбольный мяч' },
      { kind: 'trophy',      label: 'Кубок',     emoji: '🏆', defaultColor: '#FFD43C', tags: ['кубок','trophy','победа','gold','первое место'], hint: 'Золотой кубок победителя' },
      { kind: 'goal-net',    label: 'Ворота',    emoji: '🥅', defaultColor: '#ffffff', tags: ['ворота','net','goal','гол','футбол'], hint: 'Футбольные ворота' },
    ],
  },
]

export const ALL_ITEMS: CatalogItem[] = CATALOG.flatMap((c) => c.items)

export function findItem(kind: PropKind): CatalogItem | undefined {
  return ALL_ITEMS.find((i) => i.kind === kind)
}

export function searchItems(query: string): CatalogItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return ALL_ITEMS.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q))
  )
}
