/**
 * Реестр «скриптуемых» объектов по всем мирам.
 *
 * Для каждого game.id отдаётся список точек-якорей, к которым ребёнок может
 * привесить поведение в Play-режиме. Сам мир не нужно переписывать — Scriptable
 * ставится как sibling рядом с gameplay-компонентом (Coin/Enemy/NPC/GltfMonster).
 *
 * Добавление нового целевого мира:
 *   1. Добавь `<WORLD>_TARGETS` список здесь
 *   2. Зарегистрируй в `WORLDS` ниже
 *   3. В компоненте мира импортируй список и отрендерь через <Scriptable>
 *
 * ID объектов стабильные — чтобы скрипты ребёнка не терялись между перезагрузками.
 */

export interface WorldTarget {
  id: string
  pos: [number, number, number]
  label: string
  kind: 'coin' | 'enemy' | 'npc' | 'block' | 'goal' | 'prop'
  /** Радиус клик-ауры в edit-mode */
  radius?: number
}

const OBBY_TARGETS: WorldTarget[] = [
  // Монетки на платформах (первые четыре — на платформах 0..3)
  { id: 'coin-0', pos: [0, 1.7, -4], label: 'Монета #1', kind: 'coin', radius: 0.8 },
  { id: 'coin-1', pos: [3, 2.0, -7], label: 'Монета #2', kind: 'coin', radius: 0.8 },
  { id: 'coin-2', pos: [-3, 2.3, -10], label: 'Монета #3', kind: 'coin', radius: 0.8 },
  { id: 'coin-3', pos: [0, 2.7, -13], label: 'Монета #4', kind: 'coin', radius: 0.8 },
  // Враги
  { id: 'enemy-1', pos: [0, 1.5, -9], label: 'Розовый враг', kind: 'enemy', radius: 1.2 },
  { id: 'enemy-2', pos: [0, 2.5, -17], label: 'Фиолетовый враг', kind: 'enemy', radius: 1.2 },
  // Финиш-босс
  { id: 'boss', pos: [0, 3.1, -28], label: 'Финальный монстр', kind: 'prop', radius: 1.5 },
  // Финиш-площадка
  { id: 'goal', pos: [0, 4, -26], label: 'Финиш', kind: 'goal', radius: 2 },
]

const GARDEN_TARGETS: WorldTarget[] = [
  { id: 'farmer', pos: [0, 1.5, 13], label: 'Фермер', kind: 'npc', radius: 1.5 },
  { id: 'bee-1', pos: [-4, 2.2, -4], label: 'Пчела №1', kind: 'enemy', radius: 1 },
  { id: 'bee-2', pos: [4, 2.2, 4], label: 'Пчела №2', kind: 'enemy', radius: 1 },
  { id: 'barn', pos: [0, 1.8, -14], label: 'Сарай-финиш', kind: 'goal', radius: 2 },
]

const TOWER_TARGETS: WorldTarget[] = [
  { id: 'base', pos: [0, 0.3, 0], label: 'Основание башни', kind: 'prop', radius: 2 },
  { id: 'top', pos: [0, 48, 0], label: 'Вершина', kind: 'goal', radius: 2 },
]

const PETSIM_TARGETS: WorldTarget[] = [
  { id: 'start', pos: [0, 1, 5], label: 'Стартовый портал', kind: 'prop', radius: 2 },
  { id: 'bunny', pos: [-7, 1.5, -8], label: 'Питомец-кролик', kind: 'npc', radius: 1.4 },
  { id: 'cactoro', pos: [7, 1.5, -10], label: 'Кактор', kind: 'npc', radius: 1.4 },
  { id: 'throne', pos: [0, 2.5, -62], label: 'Трон-финиш', kind: 'goal', radius: 2 },
]

const BOTTOWN_TARGETS: WorldTarget[] = [
  { id: 'bank', pos: [-10, 1.5, -10], label: 'Банк', kind: 'npc', radius: 1.5 },
  { id: 'cafe', pos: [10, 1.5, -10], label: 'Кафе', kind: 'npc', radius: 1.5 },
  { id: 'library', pos: [0, 1.5, 20], label: 'Библиотека', kind: 'npc', radius: 1.5 },
  { id: 'fountain', pos: [0, 2, 0], label: 'Фонтан-финиш', kind: 'goal', radius: 2 },
]

const FASHION_TARGETS: WorldTarget[] = [
  { id: 'man-1', pos: [-5, 1.5, -5], label: 'Манекен L1', kind: 'prop', radius: 1.3 },
  { id: 'man-2', pos: [5, 1.5, -5], label: 'Манекен L2', kind: 'prop', radius: 1.3 },
  { id: 'man-3', pos: [-5, 1.5, -25], label: 'Манекен L3', kind: 'prop', radius: 1.3 },
  { id: 'man-4', pos: [5, 1.5, -25], label: 'Манекен L4', kind: 'prop', radius: 1.3 },
  { id: 'judge-1', pos: [-4, 1.5, -44], label: 'Судья ДИВА', kind: 'npc', radius: 1.4 },
  { id: 'judge-2', pos: [0, 1.5, -44], label: 'Судья РЕДАКТОР', kind: 'npc', radius: 1.4 },
  { id: 'judge-3', pos: [4, 1.5, -44], label: 'Судья СТИЛИСТ', kind: 'npc', radius: 1.4 },
  { id: 'stage', pos: [0, 2, -43], label: 'Подиум-финиш', kind: 'goal', radius: 2.5 },
]

const MYSTERY_TARGETS: WorldTarget[] = [
  { id: 'guest', pos: [-8, 1.5, -14], label: 'Гость', kind: 'npc', radius: 1.3 },
  { id: 'cook', pos: [8, 1.5, -14], label: 'Повар', kind: 'npc', radius: 1.3 },
  { id: 'gardener', pos: [-8, 1.5, 14], label: 'Садовник', kind: 'npc', radius: 1.3 },
  { id: 'ghost', pos: [0, 2, 0], label: 'Призрак', kind: 'enemy', radius: 1.5 },
  { id: 'evidence-1', pos: [-7, 1.2, -8], label: 'Улика 1', kind: 'prop', radius: 0.8 },
  { id: 'evidence-2', pos: [9, 1.2, -8], label: 'Улика 2', kind: 'prop', radius: 0.8 },
  { id: 'evidence-3', pos: [-7, 1.2, 8], label: 'Улика 3', kind: 'prop', radius: 0.8 },
  { id: 'evidence-4', pos: [9, 1.2, 8], label: 'Улика 4', kind: 'prop', radius: 0.8 },
]

const NIGHTS_TARGETS: WorldTarget[] = [
  { id: 'campfire', pos: [0, 1, 0], label: 'Костёр', kind: 'prop', radius: 1.5 },
  { id: 'cabin', pos: [0, 2, -8], label: 'Хижина', kind: 'goal', radius: 2 },
  { id: 'monster-1', pos: [-14, 1.5, -8], label: 'Синий демон', kind: 'enemy', radius: 1.5 },
  { id: 'monster-2', pos: [14, 1.5, 8], label: 'Пришелец', kind: 'enemy', radius: 1.3 },
]

const TYCOON_TARGETS: WorldTarget[] = [
  { id: 'plinth-0', pos: [0, 1, -8], label: 'Плинт БАНК', kind: 'prop', radius: 1.5 },
  { id: 'plinth-1', pos: [7.6, 1, -2.5], label: 'Плинт ФАСТФУД', kind: 'prop', radius: 1.5 },
  { id: 'plinth-2', pos: [4.7, 1, 6.5], label: 'Плинт АРКАДА', kind: 'prop', radius: 1.5 },
  { id: 'plinth-3', pos: [-4.7, 1, 6.5], label: 'Плинт АЛМАЗЫ', kind: 'prop', radius: 1.5 },
  { id: 'plinth-4', pos: [-7.6, 1, -2.5], label: 'Плинт РАКЕТЫ', kind: 'prop', radius: 1.5 },
  { id: 'treasury', pos: [0, 1.5, 0], label: 'Казна', kind: 'goal', radius: 2 },
]

const ABILITY_TARGETS: WorldTarget[] = [
  { id: 'dummy-0', pos: [-10, 1.5, -10], label: 'Манекен ЛВ', kind: 'enemy', radius: 1.3 },
  { id: 'dummy-1', pos: [0, 1.5, -14], label: 'Манекен Ц', kind: 'enemy', radius: 1.3 },
  { id: 'dummy-2', pos: [10, 1.5, -10], label: 'Манекен ПВ', kind: 'enemy', radius: 1.3 },
  { id: 'dummy-3', pos: [-10, 1.5, 10], label: 'Манекен ЛЗ', kind: 'enemy', radius: 1.3 },
  { id: 'dummy-4', pos: [0, 1.5, 14], label: 'Манекен Ю', kind: 'enemy', radius: 1.3 },
  { id: 'dummy-5', pos: [10, 1.5, 10], label: 'Манекен ПЗ', kind: 'enemy', radius: 1.3 },
]

const PETBRAIN_TARGETS: WorldTarget[] = [
  { id: 'pet', pos: [0, 1, 4], label: 'Питомец', kind: 'npc', radius: 1.2 },
  { id: 'food', pos: [-10, 1, -6], label: 'Миска еды', kind: 'prop', radius: 1 },
  { id: 'bed', pos: [10, 1, -6], label: 'Лежанка', kind: 'prop', radius: 1 },
  { id: 'coach', pos: [0, 1.5, 8], label: 'Тренер', kind: 'npc', radius: 1.4 },
  { id: 'house', pos: [0, 2, -12.5], label: 'Дом (финиш)', kind: 'goal', radius: 2 },
]

// ─── Регистр по точному game.id (приоритет) ───
const BY_GAME_ID: Record<string, WorldTarget[]> = {
  'obby-rainbow': OBBY_TARGETS,
  'growbot-garden': GARDEN_TARGETS,
  'tower-of-code': TOWER_TARGETS,
  'pet-math-sim': PETSIM_TARGETS,
  'bot-town': BOTTOWN_TARGETS,
  'fashion-runway': FASHION_TARGETS,
  'detective-mansion': MYSTERY_TARGETS,
  'forest-nights': NIGHTS_TARGETS,
  'brainrot-tycoon': TYCOON_TARGETS,
  'ability-builder': ABILITY_TARGETS,
  'pet-brain': PETBRAIN_TARGETS,
}

// ─── Fallback по category — для всех прочих игр, которые используют
// один из наших базовых миров (ObbyWorld/RaceWorld/SandboxWorld/…) ───
const BY_CATEGORY: Record<string, WorldTarget[]> = {
  obby: OBBY_TARGETS,
  tower: TOWER_TARGETS,
  garden: GARDEN_TARGETS,
  pets: PETSIM_TARGETS,
  town: BOTTOWN_TARGETS,
  fashion: FASHION_TARGETS,
  mystery: MYSTERY_TARGETS,
  nights: NIGHTS_TARGETS,
  tycoon: TYCOON_TARGETS,
  ability: ABILITY_TARGETS,
  petbrain: PETBRAIN_TARGETS,
  // category=sandbox/rp/sim → SandboxWorld → переиспользуем BotTown-like targets
  sandbox: BOTTOWN_TARGETS,
  rp: BOTTOWN_TARGETS,
  sim: BOTTOWN_TARGETS,
  // race — универсальные финиш/чекпоинты (пока без детальных)
  race: [
    { id: 'checkpoint-1', pos: [0, 1, -15], label: 'Чекпоинт 1', kind: 'prop', radius: 1.8 },
    { id: 'checkpoint-2', pos: [0, 1, -35], label: 'Чекпоинт 2', kind: 'prop', radius: 1.8 },
    { id: 'checkpoint-3', pos: [0, 1, -55], label: 'Чекпоинт 3', kind: 'prop', radius: 1.8 },
    { id: 'finish', pos: [0, 1, -70], label: 'Финиш', kind: 'goal', radius: 2.5 },
  ],
}

/**
 * Отдать набор скриптуемых якорей. Сперва ищем по точному game.id — это
 * ближе к «идеальной подборке» для конкретной игры. Если такого нет —
 * fallback по category (все obby делят OBBY_TARGETS и т.п.).
 */
export function getWorldTargets(gameId: string, category?: string): WorldTarget[] {
  if (BY_GAME_ID[gameId]) return BY_GAME_ID[gameId]
  if (category && BY_CATEGORY[category]) return BY_CATEGORY[category]
  return []
}

export function getTargetLabel(t: WorldTarget): string {
  return t.label
}
