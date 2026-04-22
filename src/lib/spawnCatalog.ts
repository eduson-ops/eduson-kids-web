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
