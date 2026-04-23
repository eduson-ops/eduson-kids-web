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
    id: 'essentials',
    name: '⭐ Лучшее',
    icon: '🌟',
    items: [
      { kind: 'cube',        label: 'Куб',          emoji: '🟨', defaultColor: '#FFD43C', tags: ['блок','куб','box','essential'], hint: 'Базовый строительный блок' },
      { kind: 'sphere',      label: 'Шар',          emoji: '⚽', defaultColor: '#FF9454', tags: ['шар','ball','essential'], hint: 'Катится, если не закреплён' },
      { kind: 'coin',        label: 'Монета',       emoji: '💰', defaultColor: '#FFD43C', tags: ['монета','coin','essential'], hint: 'При касании даёт +1 очко' },
      { kind: 'tree',        label: 'Дерево',       emoji: '🌲', defaultColor: '#2ECC71', tags: ['дерево','tree','essential'], hint: 'Большое зелёное дерево' },
      { kind: 'npc-bunny',   label: 'Зайчик',       emoji: '🐰', defaultColor: '#FFE4E1', tags: ['заяц','bunny','npc','essential'], hint: 'Дружелюбный NPC-зайчик' },
      { kind: 'checkpoint',  label: 'Чекпоинт',     emoji: '🚩', defaultColor: '#48c774', tags: ['чекпоинт','flag','essential'], hint: 'Сохраняет прогресс' },
      { kind: 'ramp',        label: 'Рампа',        emoji: '📐', defaultColor: '#5AA9FF', tags: ['рампа','ramp','essential'], hint: 'Наклонная поверхность' },
      { kind: 'torch',       label: 'Факел',        emoji: '🔥', defaultColor: '#FF8C1A', tags: ['факел','torch','огонь','essential'], hint: 'Горящий факел с пламенем' },
      { kind: 'chest',       label: 'Сундук',       emoji: '📦', defaultColor: '#8B5A2B', tags: ['сундук','chest','essential'], hint: 'Деревянный сундук с сокровищем' },
      { kind: 'star',        label: 'Звезда',       emoji: '⭐', defaultColor: '#FFD700', tags: ['звезда','star','essential'], hint: 'Крутящаяся звезда-коллектибл' },
      { kind: 'rock',        label: 'Камень',       emoji: '🪨', defaultColor: '#888888', tags: ['камень','rock','essential'], hint: 'Каменный булыжник' },
      { kind: 'plate',       label: 'Платформа',    emoji: '⬜', defaultColor: '#9FE8C7', tags: ['платформа','plate','essential'], hint: 'Тонкая широкая плита' },
      { kind: 'bouncer',     label: 'Батут',        emoji: '🔵', defaultColor: '#4c97ff', tags: ['батут','bouncer','essential'], hint: 'Подбрасывает игрока вверх' },
      { kind: 'campfire',    label: 'Костёр',       emoji: '🏕️', defaultColor: '#FF6B35', tags: ['костёр','огонь','campfire','essential'], hint: 'Горящий лагерный костёр' },
      { kind: 'crystal',     label: 'Кристалл',     emoji: '💎', defaultColor: '#88d4ff', tags: ['кристалл','crystal','essential'], hint: 'Светящийся кристалл' },
      { kind: 'house-small', label: 'Дом',          emoji: '🏠', defaultColor: '#e8d5b0', tags: ['дом','house','essential'], hint: 'Маленький жилой дом' },
      { kind: 'park-fountain', label: 'Фонтан',     emoji: '⛲', defaultColor: '#4fc3f7', tags: ['фонтан','fountain','essential'], hint: 'Парковый фонтан' },
      { kind: 'lighthouse-prop', label: 'Маяк',     emoji: '🗼', defaultColor: '#f5f0e8', tags: ['маяк','lighthouse','essential'], hint: 'Вращающийся луч маяка' },
    ],
  },
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
  {
    id: 'animals',
    name: 'Животные',
    icon: '🐾',
    items: [
      { kind: 'duck',       label: 'Утка',       emoji: '🦆', defaultColor: '#FFD43C', tags: ['утка','duck','птица','bird','животное'], hint: 'Жёлтая утка' },
      { kind: 'cat-statue', label: 'Кот',        emoji: '🐱', defaultColor: '#FF9454', tags: ['кот','cat','котик','животное','статуя'], hint: 'Фигурка кота манэки-нэко' },
      { kind: 'fish-tank',  label: 'Аквариум',   emoji: '🐠', defaultColor: '#4c97ff', tags: ['аквариум','fish','рыба','рыбки','tank'], hint: 'Аквариум с рыбками' },
    ],
  },
  {
    id: 'household',
    name: 'Интерьер',
    icon: '🏠',
    items: [
      { kind: 'table',      label: 'Стол',       emoji: '🪑', defaultColor: '#8b5a2b', tags: ['стол','table','мебель','интерьер'], hint: 'Деревянный стол' },
      { kind: 'bookshelf',  label: 'Полка',      emoji: '📚', defaultColor: '#8b5a2b', tags: ['полка','shelf','книги','книжная','мебель'], hint: 'Книжная полка' },
      { kind: 'lamp-floor', label: 'Торшер',     emoji: '💡', defaultColor: '#FFD43C', tags: ['торшер','lamp','лампа','свет','интерьер'], hint: 'Напольный торшер' },
    ],
  },
  {
    id: 'transportation', name: 'Транспорт', icon: '✈️',
    items: [
      { kind: 'airplane', label: 'Самолёт', emoji: '✈️', defaultColor: '#88d4ff', tags: ['самолёт','airplane','авиация','летит','небо'], hint: 'Пассажирский самолёт' },
      { kind: 'boat',     label: 'Лодка',   emoji: '⛵', defaultColor: '#ff8c1a', tags: ['лодка','boat','ship','корабль','море','вода'], hint: 'Парусная лодка' },
      { kind: 'train',    label: 'Поезд',   emoji: '🚂', defaultColor: '#e53', tags: ['поезд','train','локомотив','железная','дорога'], hint: 'Паровоз' },
    ],
  },
  {
    id: 'playground', name: 'Площадка', icon: '🛝',
    items: [
      { kind: 'swing',   label: 'Качели',   emoji: '🪁', defaultColor: '#4c97ff', tags: ['качели','swing','детская','площадка'], hint: 'Детские качели' },
      { kind: 'slide',   label: 'Горка',    emoji: '🛝', defaultColor: '#ff5464', tags: ['горка','slide','спуск','детская','площадка'], hint: 'Детская горка' },
      { kind: 'seesaw',  label: 'Качалка',  emoji: '⚖️', defaultColor: '#48c774', tags: ['качалка','seesaw','балансир','детская','площадка'], hint: 'Качалка-балансир' },
    ],
  },
  {
    id: 'space', name: 'Космос', icon: '🪐',
    items: [
      { kind: 'planet',        label: 'Планета',   emoji: '🪐', defaultColor: '#a855f7', tags: ['планета','planet','космос','space','орбита'], hint: 'Полосатая газовая планета' },
      { kind: 'asteroid',      label: 'Астероид',  emoji: '☄️', defaultColor: '#8b8b8b', tags: ['астероид','asteroid','метеор','камень','космос'], hint: 'Неровный космический булыжник' },
      { kind: 'space-station', label: 'Станция',   emoji: '🛸', defaultColor: '#c0c0c0', tags: ['станция','station','космос','space','МКС'], hint: 'Модульная космическая станция' },
    ],
  },
  {
    id: 'school', name: 'Школа', icon: '📚',
    items: [
      { kind: 'book-stack', label: 'Книги',     emoji: '📚', defaultColor: '#FF9454', tags: ['книги','books','стопка','школа','library'], hint: 'Стопка разноцветных книг' },
      { kind: 'globe',      label: 'Глобус',    emoji: '🌍', defaultColor: '#4c97ff', tags: ['глобус','globe','земля','карта','geography'], hint: 'Вращающийся глобус' },
      { kind: 'microscope', label: 'Микроскоп', emoji: '🔬', defaultColor: '#6B5CE7', tags: ['микроскоп','microscope','наука','science','лаборатория'], hint: 'Лабораторный микроскоп' },
    ],
  },
  {
    id: 'medieval', name: 'Средневековье', icon: '⚔️',
    items: [
      { kind: 'sword',        label: 'Меч',    emoji: '⚔️', defaultColor: '#c0c0c0', tags: ['меч','sword','рыцарь','фэнтези','оружие'], hint: 'Двуручный рыцарский меч' },
      { kind: 'shield',       label: 'Щит',    emoji: '🛡️', defaultColor: '#8b5a2b', tags: ['щит','shield','рыцарь','фэнтези','защита'], hint: 'Деревянный щит с гербом' },
      { kind: 'knight-statue',label: 'Рыцарь', emoji: '🏰', defaultColor: '#8b8b8b', tags: ['рыцарь','knight','доспех','средневековье','статуя'], hint: 'Каменная статуя рыцаря' },
    ],
  },
  {
    id: 'ocean', name: 'Океан', icon: '🌊',
    items: [
      { kind: 'coral',     label: 'Коралл',    emoji: '🪸', defaultColor: '#ff5464', tags: ['коралл','coral','море','подводный','ocean'], hint: 'Коралловый куст' },
      { kind: 'submarine', label: 'Подлодка',  emoji: '🛸', defaultColor: '#FFD43C', tags: ['подлодка','submarine','море','флот','underwater'], hint: 'Жёлтая подводная лодка' },
      { kind: 'anchor',    label: 'Якорь',     emoji: '⚓', defaultColor: '#2a3340', tags: ['якорь','anchor','корабль','море','порт'], hint: 'Морской якорь' },
    ],
  },
  {
    id: 'winter', name: 'Зима', icon: '❄️',
    items: [
      { kind: 'igloo',         label: 'Иглу',     emoji: '🏔️', defaultColor: '#88d4ff', tags: ['иглу','igloo','зима','снег','эскимос'], hint: 'Снежный иглу-домик' },
      { kind: 'sled',          label: 'Санки',    emoji: '🛷', defaultColor: '#ff5464', tags: ['санки','sled','снег','зима','кататься'], hint: 'Деревянные санки' },
      { kind: 'snowflake-deco',label: 'Снежинка', emoji: '❄️', defaultColor: '#88d4ff', tags: ['снежинка','snowflake','зима','мороз','декор'], hint: 'Декоративная 3D-снежинка' },
    ],
  },
  {
    id: 'circus', name: 'Ярмарка', icon: '🎡',
    items: [
      { kind: 'circus-tent',    label: 'Шатёр',        emoji: '🎪', defaultColor: '#ff5464', tags: ['шатёр','цирк','circus','tent','ярмарка'], hint: 'Полосатый цирковой шатёр' },
      { kind: 'ferris-wheel',   label: 'Колесо',       emoji: '🎡', defaultColor: '#6B5CE7', tags: ['колесо','ferris','wheel','аттракцион','ярмарка'], hint: 'Вращающееся колесо обозрения' },
      { kind: 'hot-air-balloon',label: 'Аэростат',     emoji: '🎈', defaultColor: '#ff8c1a', tags: ['аэростат','balloon','воздушный шар','летит','небо'], hint: 'Воздушный шар с корзиной' },
      { kind: 'pinwheel',       label: 'Вертушка',     emoji: '🌀', defaultColor: '#FFD43C', tags: ['вертушка','pinwheel','ветер','игрушка','спиннер'], hint: 'Крутящаяся вертушка-ветряк' },
      { kind: 'lantern',        label: 'Фонарь',       emoji: '🏮', defaultColor: '#FF9454', tags: ['фонарь','lantern','свет','азиатский','декор'], hint: 'Декоративный фонарик' },
    ],
  },
  {
    id: 'kitchen', name: 'Кухня', icon: '🍔',
    items: [
      { kind: 'burger', label: 'Бургер', emoji: '🍔', defaultColor: '#c8841a', tags: ['бургер','burger','еда','food','фаст-фуд'], hint: 'Высокий трёхэтажный бургер' },
      { kind: 'pizza',  label: 'Пицца',  emoji: '🍕', defaultColor: '#ff5464', tags: ['пицца','pizza','еда','итальянская','круглая'], hint: 'Круглая пицца с начинкой' },
      { kind: 'sushi',  label: 'Суши',   emoji: '🍣', defaultColor: '#2a3340', tags: ['суши','sushi','японская','рис','рыба'], hint: 'Нигири суши на деревянной доске' },
    ],
  },
  {
    id: 'camping', name: 'Кемпинг', icon: '🏕️',
    items: [
      { kind: 'tent',     label: 'Палатка',  emoji: '⛺', defaultColor: '#48c774', tags: ['палатка','tent','поход','кемпинг','лес'], hint: 'Туристическая палатка' },
      { kind: 'backpack', label: 'Рюкзак',   emoji: '🎒', defaultColor: '#FF9454', tags: ['рюкзак','backpack','поход','туризм','сумка'], hint: 'Туристический рюкзак' },
      { kind: 'compass',  label: 'Компас',   emoji: '🧭', defaultColor: '#c0c0c0', tags: ['компас','compass','навигация','ориентир','север'], hint: 'Старинный компас со стрелкой' },
    ],
  },
  {
    id: 'halloween', name: 'Хэллоуин', icon: '🎃',
    items: [
      { kind: 'witch-hat',  label: 'Шляпа ведьмы', emoji: '🧙', defaultColor: '#2a3340', tags: ['шляпа','witch','ведьма','хэллоуин','halloween'], hint: 'Остроконечная шляпа ведьмы' },
      { kind: 'ghost',      label: 'Призрак',        emoji: '👻', defaultColor: '#e8e8f0', tags: ['призрак','ghost','хэллоуин','приведение','пугать'], hint: 'Летящий призрак' },
      { kind: 'spider-web', label: 'Паутина',         emoji: '🕸️', defaultColor: '#c0c0c0', tags: ['паутина','spider','web','паук','хэллоуин'], hint: 'Декоративная паутина' },
    ],
  },
  {
    id: 'toys', name: 'Игрушки', icon: '🧸',
    items: [
      { kind: 'teddy-bear', label: 'Медвежонок', emoji: '🧸', defaultColor: '#c8841a', tags: ['мишка','teddy','медведь','игрушка','мягкий'], hint: 'Плюшевый медвежонок' },
      { kind: 'lego-brick', label: 'Кубик Лего', emoji: '🧱', defaultColor: '#ff5464', tags: ['лего','lego','кубик','конструктор','детский'], hint: 'Кубик из конструктора' },
      { kind: 'yo-yo',      label: 'Йо-йо',       emoji: '🪀', defaultColor: '#6B5CE7', tags: ['йо-йо','yo-yo','игрушка','юла','крутить'], hint: 'Классическое йо-йо' },
    ],
  },
  {
    id: 'lab', name: 'Лаборатория', icon: '⚗️',
    items: [
      { kind: 'flask', label: 'Колба',  emoji: '⚗️', defaultColor: '#48c774', tags: ['колба','flask','химия','наука','lab'], hint: 'Химическая колба с жидкостью' },
      { kind: 'atom',  label: 'Атом',   emoji: '⚛️', defaultColor: '#88d4ff', tags: ['атом','atom','физика','наука','электроны'], hint: 'Модель атома с орбитами' },
      { kind: 'gear',  label: 'Шестерня', emoji: '⚙️', defaultColor: '#8b8b8b', tags: ['шестерня','gear','механика','технику','robot'], hint: 'Металлическая шестерня' },
    ],
  },
  {
    id: 'weather', name: 'Погода', icon: '⛈️',
    items: [
      { kind: 'rain-cloud',     label: 'Туча',       emoji: '⛈️', defaultColor: '#6b8099', tags: ['туча','cloud','дождь','rain','погода'], hint: 'Дождевое облако с молнией' },
      { kind: 'lightning-bolt', label: 'Молния',     emoji: '⚡', defaultColor: '#FFD43C', tags: ['молния','lightning','гроза','электричество','погода'], hint: 'Зигзаг молнии' },
      { kind: 'rainbow-arch',   label: 'Радуга',     emoji: '🌈', defaultColor: '#ff5464', tags: ['радуга','rainbow','цвета','погода','красиво'], hint: 'Семицветная радуга' },
      { kind: 'snowdrift',      label: 'Сугроб',     emoji: '🌨️', defaultColor: '#daeeff', tags: ['сугроб','снег','snow','зима','сугроб'], hint: 'Пушистый сугроб' },
      { kind: 'sun-deco',       label: 'Солнышко',   emoji: '☀️', defaultColor: '#FFD43C', tags: ['солнце','sun','лучи','тепло','желтый'], hint: 'Декоративное солнышко с лучами' },
    ],
  },
  {
    id: 'egypt', name: 'Египет', icon: '🏛️',
    items: [
      { kind: 'pyramid',  label: 'Пирамида', emoji: '🔺', defaultColor: '#e8c97a', tags: ['пирамида','pyramid','египет','egypt','древний'], hint: 'Египетская пирамида' },
      { kind: 'sphinx',   label: 'Сфинкс',   emoji: '🦁', defaultColor: '#c8a84e', tags: ['сфинкс','sphinx','египет','лев','статуя'], hint: 'Великий Сфинкс' },
      { kind: 'obelisk',  label: 'Обелиск',  emoji: '🗽', defaultColor: '#d4c060', tags: ['обелиск','obelisk','колонна','египет','иероглифы'], hint: 'Каменный обелиск' },
    ],
  },
  {
    id: 'candy', name: 'Конфеты', icon: '🍬',
    items: [
      { kind: 'lollipop',    label: 'Леденец',   emoji: '🍭', defaultColor: '#ff5ab1', tags: ['леденец','lollipop','конфета','сладкое','candy'], hint: 'Разноцветный леденец на палочке' },
      { kind: 'candy-cane',  label: 'Трость',    emoji: '🎄', defaultColor: '#ff5464', tags: ['трость','candy cane','полосатый','новый год','рождество'], hint: 'Леденцовая трость' },
      { kind: 'gingerbread', label: 'Пряник',    emoji: '🏠', defaultColor: '#c8841a', tags: ['пряник','gingerbread','домик','новый год','имбирь'], hint: 'Пряничный домик' },
    ],
  },
  {
    id: 'workshop', name: 'Мастерская', icon: '🔧',
    items: [
      { kind: 'toolbox',    label: 'Ящик',      emoji: '🧰', defaultColor: '#ff8c1a', tags: ['ящик','toolbox','инструменты','мастерская','красный'], hint: 'Чемодан с инструментами' },
      { kind: 'anvil',      label: 'Наковальня',emoji: '⚒️', defaultColor: '#3a3a3a', tags: ['наковальня','anvil','кузня','молот','тяжёлый'], hint: 'Кузнечная наковальня' },
      { kind: 'barrel-fire',label: 'Костёр-бочка',emoji: '🔥', defaultColor: '#ff5464', tags: ['бочка','barrel','огонь','fire','тепло'], hint: 'Бочка с огнём' },
    ],
  },
  {
    id: 'art', name: 'Искусство', icon: '🎨',
    items: [
      { kind: 'easel',      label: 'Мольберт',  emoji: '🖼️', defaultColor: '#c8841a', tags: ['мольберт','easel','рисование','арт','живопись'], hint: 'Деревянный мольберт с холстом' },
      { kind: 'sculpture',  label: 'Скульптура',emoji: '🗿', defaultColor: '#b0b0b0', tags: ['скульптура','sculpture','статуя','арт','камень'], hint: 'Абстрактная скульптура' },
      { kind: 'vase-ancient',label: 'Ваза',     emoji: '🏺', defaultColor: '#c8841a', tags: ['ваза','vase','амфора','античная','глина'], hint: 'Греческая амфора' },
    ],
  },
  {
    id: 'farm', name: 'Ферма', icon: '🐄',
    items: [
      { kind: 'cow',       label: 'Корова',     emoji: '🐄', defaultColor: '#f5f5f5', tags: ['корова','cow','ферма','животное','молоко'], hint: 'Пятнистая корова' },
      { kind: 'barn',      label: 'Амбар',      emoji: '🏚️', defaultColor: '#c0392b', tags: ['амбар','barn','ферма','сарай','хранилище'], hint: 'Красный фермерский амбар' },
      { kind: 'hay-bale',  label: 'Тюк сена',   emoji: '🌾', defaultColor: '#d4aa60', tags: ['сено','hay','рулон','тюк','ферма'], hint: 'Круглый рулон сена' },
      { kind: 'scarecrow', label: 'Пугало',     emoji: '🎃', defaultColor: '#8b5a2b', tags: ['пугало','scarecrow','птицы','огород','ферма'], hint: 'Пугало на шесте' },
      { kind: 'well',      label: 'Колодец',    emoji: '🪣', defaultColor: '#8b5a2b', tags: ['колодец','well','вода','деревня','деревянный'], hint: 'Деревянный колодец с крышей' },
    ],
  },
  {
    id: 'sport2', name: 'Спорт-2', icon: '🏀',
    items: [
      { kind: 'basketball-hoop', label: 'Кольцо',      emoji: '🏀', defaultColor: '#ff8c1a', tags: ['кольцо','баскетбол','basketball','хуп','спорт'], hint: 'Баскетбольное кольцо с сеткой' },
      { kind: 'boxing-gloves',   label: 'Боксёрские перчатки', emoji: '🥊', defaultColor: '#ff5464', tags: ['перчатки','бокс','boxing','спорт','удар'], hint: 'Боксёрские перчатки на подвесе' },
      { kind: 'archery-target',  label: 'Мишень',      emoji: '🎯', defaultColor: '#ff5464', tags: ['мишень','лук','archery','target','стрельба'], hint: 'Концентрические кольца-мишень' },
      { kind: 'surf-board',      label: 'Сёрфборд',    emoji: '🏄', defaultColor: '#48c774', tags: ['сёрф','surf','доска','волны','море'], hint: 'Сёрфинговая доска' },
      { kind: 'dumbbell',        label: 'Гантель',     emoji: '🏋️', defaultColor: '#3a3a3a', tags: ['гантель','dumbbell','фитнес','тренировка','вес'], hint: 'Классическая гантель' },
    ],
  },
  {
    id: 'food2', name: 'Еда-2', icon: '🌮',
    items: [
      { kind: 'taco',            label: 'Тако',         emoji: '🌮', defaultColor: '#d4aa60', tags: ['тако','taco','мексика','еда','кукуруза'], hint: 'Мексиканский тако' },
      { kind: 'ramen-bowl',      label: 'Рамен',        emoji: '🍜', defaultColor: '#ff9454', tags: ['рамен','ramen','нудли','суп','японский'], hint: 'Горячий рамен в чаше' },
      { kind: 'boba-tea',        label: 'Боба-чай',     emoji: '🧋', defaultColor: '#c8841a', tags: ['боба','boba','чай','пузыри','стакан'], hint: 'Пузырьковый чай со стаканом' },
      { kind: 'croissant',       label: 'Круассан',     emoji: '🥐', defaultColor: '#d4aa60', tags: ['круассан','croissant','выпечка','французский','хлеб'], hint: 'Слоёный круассан' },
      { kind: 'watermelon-slice',label: 'Арбуз',        emoji: '🍉', defaultColor: '#ff5464', tags: ['арбуз','watermelon','лето','сладкий','красный'], hint: 'Долька арбуза' },
    ],
  },
  {
    id: 'garden', name: 'Сад', icon: '🌷',
    items: [
      { kind: 'watering-can', label: 'Лейка',        emoji: '🪣', defaultColor: '#4c97ff', tags: ['лейка','watering can','сад','вода','полив'], hint: 'Садовая лейка с носиком' },
      { kind: 'bird-bath',    label: 'Купальня птиц', emoji: '🐦', defaultColor: '#a9d8ff', tags: ['купальня','bird bath','птицы','сад','фонтан'], hint: 'Каменная купальня для птиц' },
      { kind: 'garden-gnome', label: 'Гном',          emoji: '🧙', defaultColor: '#ff5464', tags: ['гном','gnome','садовый','декор','шляпа'], hint: 'Милый садовый гном' },
      { kind: 'flower-bed',   label: 'Клумба',        emoji: '🌸', defaultColor: '#ff5ab1', tags: ['клумба','flower bed','цветы','сад','декор'], hint: 'Цветочная клумба' },
      { kind: 'trellis',      label: 'Шпалера',       emoji: '🪟', defaultColor: '#8b5a2b', tags: ['шпалера','trellis','решётка','сад','вьюн'], hint: 'Деревянная решётка-шпалера' },
    ],
  },
  {
    id: 'jungle', name: 'Джунгли', icon: '🌴',
    items: [
      { kind: 'palm-tree',   label: 'Пальма',      emoji: '🌴', defaultColor: '#34C38A', tags: ['пальма','palm','дерево','тропики','пляж'], hint: 'Тропическая пальма с листьями' },
      { kind: 'bamboo',      label: 'Бамбук',      emoji: '🎋', defaultColor: '#5ba55b', tags: ['бамбук','bamboo','азия','трость','зелёный'], hint: 'Стебли бамбука с узлами' },
      { kind: 'snake-deco',  label: 'Змея',        emoji: '🐍', defaultColor: '#5ba55b', tags: ['змея','snake','джунгли','декор','рептилия'], hint: 'Свёрнутая декоративная змея' },
      { kind: 'tribal-mask', label: 'Маска',       emoji: '🎭', defaultColor: '#c8841a', tags: ['маска','mask','племя','tribal','ритуал'], hint: 'Племенная деревянная маска' },
      { kind: 'vine-swing',  label: 'Лиана',       emoji: '🌿', defaultColor: '#48c774', tags: ['лиана','vine','джунгли','качели','зелёный'], hint: 'Лиана-качели' },
    ],
  },
  {
    id: 'city', name: 'Город', icon: '🏙️',
    items: [
      { kind: 'traffic-light', label: 'Светофор',   emoji: '🚦', defaultColor: '#2a3340', tags: ['светофор','traffic light','город','дорога','сигнал'], hint: 'Трёхцветный светофор' },
      { kind: 'fire-hydrant',  label: 'Гидрант',    emoji: '🚒', defaultColor: '#c0392b', tags: ['гидрант','hydrant','пожар','красный','улица'], hint: 'Пожарный гидрант' },
      { kind: 'mailbox',       label: 'Почтовый ящик',emoji: '📮', defaultColor: '#c0392b', tags: ['почта','mailbox','ящик','письмо','красный'], hint: 'Уличный почтовый ящик' },
      { kind: 'street-lamp',   label: 'Фонарный столб',emoji: '🏮', defaultColor: '#3a3a3a', tags: ['фонарь','lamp','столб','улица','город'], hint: 'Чугунный фонарный столб' },
      { kind: 'phone-booth',   label: 'Телефонная будка',emoji: '☎️', defaultColor: '#ff5464', tags: ['будка','телефон','phone booth','красная','город'], hint: 'Красная телефонная будка' },
    ],
  },
  {
    id: 'pirates', name: 'Пираты', icon: '☠️',
    items: [
      { kind: 'cannon',        label: 'Пушка',       emoji: '💣', defaultColor: '#3a3a3a', tags: ['пушка','cannon','пираты','выстрел','чугун'], hint: 'Корабельная чугунная пушка' },
      { kind: 'ship-wheel',    label: 'Штурвал',     emoji: '🚢', defaultColor: '#8b5a2b', tags: ['штурвал','wheel','корабль','пираты','руль'], hint: 'Деревянный штурвал' },
      { kind: 'treasure-map',  label: 'Карта',       emoji: '🗺️', defaultColor: '#d4aa60', tags: ['карта','map','сокровища','свиток','пираты'], hint: 'Свёрнутая карта сокровищ' },
      { kind: 'jolly-roger',   label: 'Весёлый Роджер',emoji: '🏴‍☠️', defaultColor: '#2a2a2a', tags: ['флаг','jolly roger','пираты','череп','символ'], hint: 'Пиратский флаг с черепом' },
      { kind: 'anchor-chain',  label: 'Якорь-цепь',  emoji: '⚓', defaultColor: '#5a5a5a', tags: ['якорь','цепь','anchor','пираты','море'], hint: 'Якорь с тяжёлой цепью' },
    ],
  },
  {
    id: 'vehicles', name: 'Машины', icon: '🚗',
    items: [
      { kind: 'helicopter',    label: 'Вертолёт',    emoji: '🚁', defaultColor: '#5b8dee', tags: ['вертолёт','helicopter','летит','лопасти','авиация'], hint: 'Вертолёт с вращающимися лопастями' },
      { kind: 'bicycle',       label: 'Велосипед',   emoji: '🚲', defaultColor: '#e84040', tags: ['велосипед','bicycle','колёса','спорт','езда'], hint: 'Двухколёсный велосипед' },
      { kind: 'scooter',       label: 'Самокат',     emoji: '🛴', defaultColor: '#48c774', tags: ['самокат','scooter','кикборд','городской','дорожки'], hint: 'Городской самокат' },
      { kind: 'hot-rod',       label: 'Хот-род',     emoji: '🏎️', defaultColor: '#ff5464', tags: ['хот-род','гоночная','car','hot rod','машина','быстрая'], hint: 'Стилизованный гоночный автомобиль' },
      { kind: 'jeep',          label: 'Джип',        emoji: '🚙', defaultColor: '#7d6e3a', tags: ['джип','jeep','внедорожник','4х4','кемпинг'], hint: 'Внедорожник с большими колёсами' },
    ],
  },
  {
    id: 'beach', name: 'Пляж', icon: '🏖️',
    items: [
      { kind: 'sandcastle',       label: 'Замок из песка', emoji: '🏰', defaultColor: '#e6c96e', tags: ['замок','песок','пляж','sandcastle','башни'], hint: 'Замок из мокрого песка' },
      { kind: 'beach-umbrella',   label: 'Зонтик пляжный',emoji: '⛱️', defaultColor: '#ff9f43', tags: ['зонтик','beach','umbrella','пляж','тень'], hint: 'Полосатый пляжный зонт' },
      { kind: 'lifeguard-tower',  label: 'Вышка спасателя',emoji: '🗼', defaultColor: '#e84040', tags: ['вышка','спасатель','lifeguard','пляж','океан'], hint: 'Деревянная вышка спасателя' },
      { kind: 'buoy',             label: 'Буй',           emoji: '🔴', defaultColor: '#ff5464', tags: ['буй','buoy','море','навигация','вода','красный'], hint: 'Морской навигационный буй' },
      { kind: 'surfboard-rack',   label: 'Стойка досок',  emoji: '🏄', defaultColor: '#8b5a2b', tags: ['доска','сёрфинг','стойка','rack','серфборд'], hint: 'Деревянная стойка для сёрфборда' },
    ],
  },
  {
    id: 'ancient', name: 'Древность', icon: '⚱️',
    items: [
      { kind: 'catapult',          label: 'Катапульта',   emoji: '🪨', defaultColor: '#8b5a2b', tags: ['катапульта','catapult','осада','средневековье','деревянная'], hint: 'Деревянная катапульта' },
      { kind: 'broken-column',     label: 'Колонна',      emoji: '🏛️', defaultColor: '#d4c4a0', tags: ['колонна','column','руины','ancient','рим','греция'], hint: 'Сломанная мраморная колонна' },
      { kind: 'altar',             label: 'Алтарь',       emoji: '🪨', defaultColor: '#6a5a4a', tags: ['алтарь','altar','жертвенник','древний','камень'], hint: 'Каменный жертвенный алтарь' },
      { kind: 'sarcophagus',       label: 'Саркофаг',     emoji: '⚰️', defaultColor: '#c8a84a', tags: ['саркофаг','sarcophagus','мумия','египет','золото'], hint: 'Золотой саркофаг фараона' },
      { kind: 'colosseum-arch',    label: 'Арка Колизея', emoji: '🏟️', defaultColor: '#c4a882', tags: ['арка','колизей','colosseum','рим','руины','камень'], hint: 'Арка в стиле Колизея' },
    ],
  },
  {
    id: 'underwater', name: 'Подводный', icon: '🤿',
    items: [
      { kind: 'shipwreck',         label: 'Кораблекрушение',emoji: '🚢', defaultColor: '#4a6a5a', tags: ['кораблекрушение','shipwreck','затонул','океан','ржавый'], hint: 'Затонувший корабль' },
      { kind: 'treasure-chest-open',label: 'Открытый сундук',emoji: '💎', defaultColor: '#8b5a2b', tags: ['сундук','клад','treasure','открытый','сокровища'], hint: 'Открытый сундук с сокровищами' },
      { kind: 'anemone',           label: 'Анемон',       emoji: '🌺', defaultColor: '#ff6b8a', tags: ['анемон','anemone','коралл','морской','цветок','подводный'], hint: 'Морской анемон с щупальцами' },
      { kind: 'sea-turtle',        label: 'Морская черепаха',emoji: '🐢', defaultColor: '#48a887', tags: ['черепаха','turtle','море','плавает','зелёная'], hint: 'Черепаха медленно плывёт' },
      { kind: 'whale',             label: 'Кит',          emoji: '🐋', defaultColor: '#2c3e6e', tags: ['кит','whale','большой','синий','океан','млекопитающее'], hint: 'Огромный синий кит' },
    ],
  },
  {
    id: 'fairground', name: 'Аттракционы', icon: '🎠',
    items: [
      { kind: 'popcorn-stand',    label: 'Попкорн',      emoji: '🍿', defaultColor: '#e84040', tags: ['попкорн','popcorn','ларёк','кино','аттракцион'], hint: 'Ларёк с попкорном' },
      { kind: 'bumper-car',       label: 'Машина-бамper', emoji: '🎠', defaultColor: '#ffd644', tags: ['машинка','бамper','bumper car','аттракцион','парк'], hint: 'Аттракцион машинка-бампер' },
      { kind: 'ticket-booth',     label: 'Кассовая будка',emoji: '🎟️', defaultColor: '#a29bfe', tags: ['касса','билеты','booth','ticket','парк','аттракцион'], hint: 'Будка с билетами' },
      { kind: 'balloon-arch',     label: 'Арка из шаров', emoji: '🎈', defaultColor: '#ff9f43', tags: ['арка','шары','balloon','arch','праздник','украшение'], hint: 'Праздничная арка из воздушных шаров' },
      { kind: 'prize-wheel',      label: 'Колесо фортуны',emoji: '🎡', defaultColor: '#6c5ce7', tags: ['колесо','фортуна','prize wheel','spin','приз','вращение'], hint: 'Крутящееся колесо призов' },
    ],
  },
  {
    id: 'nordic', name: 'Викинги', icon: '🪖',
    items: [
      { kind: 'longship',      label: 'Драккар',       emoji: '🚢', defaultColor: '#5a3a20', tags: ['драккар','longship','викинги','корабль','ладья'], hint: 'Викингский корабль со щитами' },
      { kind: 'runestone',     label: 'Рунный камень', emoji: '🪨', defaultColor: '#5a5a6a', tags: ['руна','runestone','камень','норвегия','надпись'], hint: 'Камень с руническими надписями' },
      { kind: 'viking-helmet', label: 'Шлем викинга',  emoji: '🪖', defaultColor: '#888', tags: ['шлем','helmet','викинг','рога','металл'], hint: 'Металлический шлем с рогами' },
      { kind: 'mead-hall',     label: 'Пиршественный зал',emoji: '🏠', defaultColor: '#8b5a2b', tags: ['мид-холл','зал','mead hall','викинги','пир','дерево'], hint: 'Деревянный пиршественный зал викингов' },
      { kind: 'axe-rack',      label: 'Стойка с топорами',emoji: '🪓', defaultColor: '#6a4a2a', tags: ['топор','axe','стойка','викинги','оружие'], hint: 'Деревянная стойка с боевыми топорами' },
    ],
  },
  {
    id: 'magic-forest', name: 'Магический лес', icon: '🧚',
    items: [
      { kind: 'fairy-ring',    label: 'Кольцо фей',    emoji: '🍄', defaultColor: '#ff9f43', tags: ['фея','fairy ring','кольцо','грибы','магия'], hint: 'Волшебное кольцо из грибов' },
      { kind: 'giant-mushroom',label: 'Гигантский гриб',emoji: '🍄', defaultColor: '#c879ff', tags: ['гриб','mushroom','гигантский','фэнтези','лес'], hint: 'Огромный светящийся гриб' },
      { kind: 'crystal-tree',  label: 'Кристальное дерево',emoji: '💎', defaultColor: '#88d4ff', tags: ['дерево','кристалл','crystal tree','магия','светится'], hint: 'Дерево из кристаллов' },
      { kind: 'wizard-hat',    label: 'Шляпа волшебника',emoji: '🧙', defaultColor: '#5b3fa0', tags: ['шляпа','hat','волшебник','wizard','магия','звёзды'], hint: 'Высокая шляпа со звёздами' },
      { kind: 'potion-stand',  label: 'Зельеварня',    emoji: '⚗️', defaultColor: '#6c5ce7', tags: ['зелье','potion','stand','магия','лавка','колбы'], hint: 'Стойка с зельями и колбами' },
    ],
  },
  {
    id: 'industrial', name: 'Индустрия', icon: '🏭',
    items: [
      { kind: 'factory-chimney',label: 'Труба завода',  emoji: '🏭', defaultColor: '#8a8a8a', tags: ['труба','chimney','завод','дым','индустрия','factory'], hint: 'Высокая заводская труба' },
      { kind: 'conveyor-belt',  label: 'Конвейер',      emoji: '⚙️', defaultColor: '#5a5a5a', tags: ['конвейер','conveyor','belt','завод','индустрия'], hint: 'Промышленный конвейер' },
      { kind: 'robot-arm',      label: 'Рука робота',   emoji: '🦾', defaultColor: '#4c97ff', tags: ['рука','robot arm','робот','завод','механическая'], hint: 'Механическая рука робота' },
      { kind: 'oil-drum',       label: 'Бочка нефти',   emoji: '🛢️', defaultColor: '#333', tags: ['бочка','drum','нефть','oil','barrel','красная'], hint: 'Металлическая бочка для нефти' },
      { kind: 'crane',          label: 'Кран',          emoji: '🏗️', defaultColor: '#ffd644', tags: ['кран','crane','стройка','жёлтый','подъёмный'], hint: 'Строительный подъёмный кран' },
    ],
  },
  {
    id: 'retro', name: 'Ретро', icon: '🕹️',
    items: [
      { kind: 'arcade-machine', label: 'Аркадный автомат',emoji: '🕹️', defaultColor: '#c879ff', tags: ['аркада','arcade','автомат','ретро','игра','монеты'], hint: 'Старый аркадный игровой автомат' },
      { kind: 'retro-tv',       label: 'Старый телевизор',emoji: '📺', defaultColor: '#5a5a5a', tags: ['телевизор','tv','ретро','старый','экран'], hint: 'Ламповый телевизор' },
      { kind: 'cassette-tape',  label: 'Кассета',       emoji: '📼', defaultColor: '#333', tags: ['кассета','cassette','music','ретро','80е','плёнка'], hint: 'Аудиокассета' },
      { kind: 'game-controller',label: 'Джойстик',      emoji: '🎮', defaultColor: '#555', tags: ['джойстик','controller','геймпад','ретро','игра'], hint: 'Ретро-джойстик' },
      { kind: 'pixel-heart',    label: 'Пиксель-сердце',emoji: '❤️', defaultColor: '#ff5464', tags: ['сердце','pixel','heart','8-бит','ретро','жизни'], hint: 'Пиксельное сердце из игр' },
    ],
  },
  {
    id: 'nature2', name: 'Природа-2', icon: '🌋',
    items: [
      { kind: 'waterfall',      label: 'Водопад',       emoji: '💧', defaultColor: '#4c97ff', tags: ['водопад','waterfall','вода','поток','природа'], hint: 'Водопад с брызгами' },
      { kind: 'lotus-pond',     label: 'Пруд с лотосами',emoji: '🪷', defaultColor: '#ff9f43', tags: ['пруд','лотос','lotus','вода','цветок','восток'], hint: 'Пруд с цветущими лотосами' },
      { kind: 'volcano',        label: 'Вулкан',        emoji: '🌋', defaultColor: '#ff5464', tags: ['вулкан','volcano','лава','огонь','горы','извержение'], hint: 'Дымящийся вулкан с лавой' },
      { kind: 'geyser',         label: 'Гейзер',        emoji: '💦', defaultColor: '#88d4ff', tags: ['гейзер','geyser','пар','горячий','вода','йеллоустоун'], hint: 'Гейзер с паром' },
      { kind: 'cave-entrance',  label: 'Вход в пещеру', emoji: '🕳️', defaultColor: '#4a4a5a', tags: ['пещера','cave','вход','тёмный','entrance','подземелье'], hint: 'Вход в тёмную пещеру' },
    ],
  },
  {
    id: 'dinosaurs', name: 'Динозавры', icon: '🦕',
    items: [
      { kind: 't-rex',        label: 'Тираннозавр',  emoji: '🦖', defaultColor: '#4a7a2a', tags: ['динозавр','тирекс','t-rex','ящер','юра','хищник'], hint: 'Тираннозавр Рекс' },
      { kind: 'triceratops',  label: 'Трицератопс',  emoji: '🦕', defaultColor: '#6a8a4a', tags: ['трицератопс','динозавр','рога','травоядный','юра'], hint: 'Трицератопс с рогами' },
      { kind: 'stegosaurus',  label: 'Стегозавр',    emoji: '🦕', defaultColor: '#5a7a3a', tags: ['стегозавр','динозавр','пластины','хвост','юра'], hint: 'Стегозавр с шипами' },
      { kind: 'pterodactyl', label: 'Птеродактиль', emoji: '🦅', defaultColor: '#7a5a3a', tags: ['птеродактиль','летающий','динозавр','крылья','птица'], hint: 'Летящий птеродактиль' },
      { kind: 'dino-egg',    label: 'Яйцо динозавра',emoji: '🥚', defaultColor: '#c8b48a', tags: ['яйцо','динозавр','egg','dino','гнездо'], hint: 'Яйцо динозавра в гнезде' },
    ],
  },
  {
    id: 'western', name: 'Вестерн', icon: '🤠',
    items: [
      { kind: 'saloon',       label: 'Салун',         emoji: '🏠', defaultColor: '#a0724a', tags: ['салун','вестерн','запад','бар','west','дикий'], hint: 'Деревянный салун Дикого Запада' },
      { kind: 'cactus-tall', label: 'Высокий кактус', emoji: '🌵', defaultColor: '#3a8a3a', tags: ['кактус','cactus','пустыня','высокий','запад','суккулент'], hint: 'Большой кактус-самоапичо' },
      { kind: 'tumbleweed',  label: 'Перекати-поле',  emoji: '🌾', defaultColor: '#c8a87a', tags: ['перекати','tumbleweed','ветер','пустыня','запад','шар'], hint: 'Перекати-поле катится по пустыне' },
      { kind: 'wanted-sign', label: 'Плакат «Разыскивается»', emoji: '📋', defaultColor: '#f5e8b0', tags: ['разыскивается','wanted','плакат','знак','запад','шериф'], hint: 'Плакат «Разыскивается»' },
      { kind: 'horseshoe',   label: 'Подкова',        emoji: '🧲', defaultColor: '#b0a080', tags: ['подкова','horseshoe','лошадь','удача','металл'], hint: 'Подкова на удачу' },
    ],
  },
  {
    id: 'ice-kingdom', name: 'Ледяное царство', icon: '🏔️',
    items: [
      { kind: 'ice-castle',   label: 'Ледяной замок',  emoji: '🏰', defaultColor: '#a0d8ef', tags: ['замок','лёд','ice','castle','зима','холод','дворец'], hint: 'Замок изо льда' },
      { kind: 'ice-spike',    label: 'Ледяной шип',    emoji: '🔷', defaultColor: '#7ab8d8', tags: ['шип','лёд','ice','spike','кристалл','острый'], hint: 'Острый ледяной шип' },
      { kind: 'frozen-tree',  label: 'Замёрзшее дерево',emoji: '🌲', defaultColor: '#c0e0f0', tags: ['дерево','лёд','замёрзший','frozen','зима','иней'], hint: 'Дерево покрытое льдом' },
      { kind: 'snowfort',     label: 'Снежная крепость',emoji: '🏯', defaultColor: '#e8f4ff', tags: ['крепость','снег','snow','fort','снеговик','зима'], hint: 'Снежная крепость с бойницами' },
      { kind: 'polar-bear',   label: 'Белый медведь',  emoji: '🐻', defaultColor: '#f0f0f0', tags: ['медведь','белый','polar','bear','арктика','животное'], hint: 'Полярный медведь' },
    ],
  },
  {
    id: 'anime', name: 'Аниме/Японский', icon: '⛩️',
    items: [
      { kind: 'torii-gate',    label: 'Ворота Тории',  emoji: '⛩️', defaultColor: '#e84040', tags: ['тории','ворота','torii','японский','храм','красный'], hint: 'Традиционные японские ворота Тории' },
      { kind: 'paper-lantern', label: 'Бумажный фонарь',emoji: '🏮', defaultColor: '#ff7a3a', tags: ['фонарь','бумажный','lantern','японский','свет','аниме'], hint: 'Светящийся бумажный фонарь' },
      { kind: 'sakura-tree',   label: 'Сакура',        emoji: '🌸', defaultColor: '#ffb7c5', tags: ['сакура','sakura','вишня','цветок','японский','аниме','весна'], hint: 'Цветущая сакура' },
      { kind: 'ninja-star',    label: 'Сюрикен',       emoji: '⭐', defaultColor: '#888888', tags: ['сюрикен','ninja','star','ниндзя','метательный','оружие'], hint: 'Метательная звезда ниндзя' },
      { kind: 'temple-bell',   label: 'Храмовый колокол',emoji: '🔔', defaultColor: '#c8a050', tags: ['колокол','bell','храм','temple','японский','бронза'], hint: 'Большой японский колокол' },
    ],
  },
  {
    id: 'deep-space', name: 'Глубокий космос', icon: '🌌',
    items: [
      { kind: 'black-hole',    label: 'Чёрная дыра',   emoji: '🌑', defaultColor: '#1a0030', tags: ['чёрная','дыра','black','hole','космос','гравитация'], hint: 'Вращающаяся чёрная дыра' },
      { kind: 'nebula-cloud',  label: 'Туманность',    emoji: '🌫️', defaultColor: '#7040c0', tags: ['туманность','nebula','cloud','космос','газ','звёзды'], hint: 'Красочная туманность' },
      { kind: 'space-debris',  label: 'Космический мусор',emoji: '🪨', defaultColor: '#707070', tags: ['мусор','debris','космос','обломки','астероид'], hint: 'Обломки в космосе' },
      { kind: 'laser-turret',  label: 'Лазерная турель',emoji: '🔫', defaultColor: '#00ff88', tags: ['лазер','турель','laser','turret','оружие','sci-fi','космос'], hint: 'Автоматическая лазерная турель' },
      { kind: 'warp-gate',     label: 'Врата варпа',   emoji: '🌀', defaultColor: '#4488ff', tags: ['врата','портал','warp','gate','телепорт','sci-fi'], hint: 'Межзвёздные врата варпа' },
    ],
  },
  {
    id: 'magic-effects', name: 'Магия/Эффекты', icon: '✨',
    items: [
      { kind: 'fireworks',      label: 'Фейерверк',       emoji: '🎆', defaultColor: '#ff5464', tags: ['фейерверк','fireworks','взрыв','праздник','магия'], hint: 'Взрывающийся фейерверк' },
      { kind: 'spark-fountain', label: 'Фонтан искр',     emoji: '✨', defaultColor: '#ffd644', tags: ['искры','фонтан','spark','fountain','магия','свет'], hint: 'Фонтан из искр и огней' },
      { kind: 'smoke-cloud',    label: 'Облако дыма',     emoji: '💨', defaultColor: '#aaaaaa', tags: ['дым','облако','smoke','cloud','туман','эффект'], hint: 'Клуб дыма или тумана' },
      { kind: 'rainbow-jet',    label: 'Радужная струя',  emoji: '🌈', defaultColor: '#ff9f43', tags: ['радуга','rainbow','jet','цвета','магия','эффект'], hint: 'Струя радужных частиц' },
      { kind: 'magic-circle',   label: 'Магический круг', emoji: '🔮', defaultColor: '#c879ff', tags: ['магический','круг','magic','circle','портал','заклинание'], hint: 'Светящийся магический круг' },
    ],
  },
  {
    id: 'superhero', name: 'Супергерои', icon: '🦸',
    items: [
      { kind: 'hero-cape',    label: 'Плащ героя',    emoji: '🦸', defaultColor: '#e84040', tags: ['плащ','герой','cape','hero','супергерой','костюм'], hint: 'Развевающийся плащ супергероя' },
      { kind: 'hero-mask',    label: 'Маска героя',   emoji: '🎭', defaultColor: '#4c97ff', tags: ['маска','герой','mask','hero','супергерой','костюм'], hint: 'Маска супергероя' },
      { kind: 'power-shield', label: 'Силовой щит',   emoji: '🛡️', defaultColor: '#4488ff', tags: ['щит','shield','энергия','защита','супергерой','sci-fi'], hint: 'Энергетический защитный щит' },
      { kind: 'hero-statue',  label: 'Статуя героя',  emoji: '🗿', defaultColor: '#888888', tags: ['статуя','герой','statue','hero','монумент','памятник'], hint: 'Каменная статуя героя' },
      { kind: 'energy-core',  label: 'Ядро энергии',  emoji: '⚡', defaultColor: '#00d2ff', tags: ['ядро','энергия','core','energy','sci-fi','реактор','пульсирует'], hint: 'Пульсирующее энергетическое ядро' },
    ],
  },
  {
    id: 'buildings', name: 'Здания', icon: '🏠',
    items: [
      { kind: 'house-small',      label: 'Дом',              emoji: '🏠', defaultColor: '#e8d5b0', tags: ['дом','house','жилой','крыша','окна','коттедж'], hint: 'Маленький жилой дом с черепичной крышей' },
      { kind: 'apartment',        label: 'Многоквартирный дом', emoji: '🏢', defaultColor: '#b8c8d8', tags: ['дом','многоквартирный','apartment','этажи','жилой'], hint: 'Многоэтажный жилой дом' },
      { kind: 'skyscraper',       label: 'Небоскрёб',        emoji: '🏙️', defaultColor: '#7fb3d3', tags: ['небоскрёб','skyscraper','офис','высокий','стекло'], hint: 'Высотный стеклянный небоскрёб' },
      { kind: 'cottage',          label: 'Коттедж',          emoji: '🏡', defaultColor: '#f5e6c8', tags: ['коттедж','cottage','деревня','цветы','домик','сад'], hint: 'Уютный коттедж с садом и цветами' },
      { kind: 'lighthouse-prop',  label: 'Маяк',             emoji: '🗼', defaultColor: '#f5f0e8', tags: ['маяк','lighthouse','море','свет','вращается'], hint: 'Маяк с вращающимся лучом света' },
      { kind: 'castle-wall',      label: 'Стена замка',      emoji: '🏰', defaultColor: '#a0a098', tags: ['замок','стена','castle','wall','средневековье','башня'], hint: 'Зубчатая стена средневекового замка' },
      { kind: 'shop-front',       label: 'Магазин',          emoji: '🏪', defaultColor: '#e8f4e8', tags: ['магазин','shop','витрина','торговля','awning'], hint: 'Небольшой магазин с витриной' },
      { kind: 'school-building',  label: 'Школа',            emoji: '🏫', defaultColor: '#fdf6e3', tags: ['школа','school','флаг','учёба','образование'], hint: 'Школьное здание с флагом' },
      { kind: 'barn-big',         label: 'Амбар',            emoji: '🏚️', defaultColor: '#8B2020', tags: ['амбар','barn','ферма','красный','сарай'], hint: 'Большой красный амбар' },
      { kind: 'temple-prop',      label: 'Храм',             emoji: '🛕', defaultColor: '#d4af6a', tags: ['храм','temple','пагода','колонны','восток'], hint: 'Азиатский храм с ярусными крышами' },
    ],
  },
  {
    id: 'city2', name: 'Город', icon: '🌆',
    items: [
      { kind: 'hospital',         label: 'Больница',         emoji: '🏥', defaultColor: '#f0f0f8', tags: ['больница','hospital','крест','медицина','скорая'], hint: 'Больница с красным крестом' },
      { kind: 'police-station',   label: 'Полиция',          emoji: '🚔', defaultColor: '#dde8ee', tags: ['полиция','police','участок','синий','звезда'], hint: 'Полицейский участок' },
      { kind: 'fire-station',     label: 'Пожарная',         emoji: '🚒', defaultColor: '#fff0e8', tags: ['пожарная','fire','красный','гараж','башня'], hint: 'Пожарная часть с гаражными воротами' },
      { kind: 'library-building', label: 'Библиотека',       emoji: '📚', defaultColor: '#f5f0e0', tags: ['библиотека','library','колонны','книги','классика'], hint: 'Библиотека в классическом стиле с колоннами' },
      { kind: 'park-fountain',    label: 'Фонтан',           emoji: '⛲', defaultColor: '#4fc3f7', tags: ['фонтан','fountain','вода','парк','анимация'], hint: 'Парковый фонтан с водяными струями' },
      { kind: 'bus-stop',         label: 'Остановка',        emoji: '🚌', defaultColor: '#2980b9', tags: ['остановка','bus','stop','скамейка','навес'], hint: 'Автобусная остановка с навесом и скамейкой' },
      { kind: 'bridge-arch',      label: 'Мост',             emoji: '🌉', defaultColor: '#a0a098', tags: ['мост','bridge','арка','arch','река','перила'], hint: 'Арочный мост с перилами' },
      { kind: 'stadium',          label: 'Стадион',          emoji: '🏟️', defaultColor: '#2c8a4a', tags: ['стадион','stadium','спорт','трибуны','поле'], hint: 'Спортивный стадион с полем и трибунами' },
      { kind: 'museum',           label: 'Музей',            emoji: '🏛️', defaultColor: '#f5f0e8', tags: ['музей','museum','купол','колонны','классика'], hint: 'Музей с куполом и колоннами' },
      { kind: 'market-stall',     label: 'Рыночный лоток',  emoji: '🛒', defaultColor: '#e74c3c', tags: ['рынок','лоток','market','stall','навес','торговля'], hint: 'Рыночный лоток с полосатым навесом' },
    ],
  },
  {
    id: 'transport2', name: 'Транспорт-2', icon: '🚑',
    items: [
      { kind: 'ambulance',         label: 'Скорая помощь',  emoji: '🚑', defaultColor: '#ffffff', tags: ['скорая','ambulance','крест','медицина','машина'], hint: 'Машина скорой помощи с красным крестом' },
      { kind: 'fire-truck',        label: 'Пожарная машина', emoji: '🚒', defaultColor: '#c0392b', tags: ['пожарная','fire truck','лестница','красный','машина'], hint: 'Пожарная машина с выдвижной лестницей' },
      { kind: 'police-car',        label: 'Полицейская',    emoji: '🚔', defaultColor: '#1a5276', tags: ['полиция','police car','мигалка','машина','синий'], hint: 'Полицейская машина с мигалкой' },
      { kind: 'school-bus',        label: 'Школьный автобус', emoji: '🚌', defaultColor: '#f39c12', tags: ['автобус','school bus','жёлтый','школа','остановка'], hint: 'Жёлтый школьный автобус' },
      { kind: 'tractor',           label: 'Трактор',        emoji: '🚜', defaultColor: '#27ae60', tags: ['трактор','tractor','ферма','большие колёса','зелёный'], hint: 'Зелёный сельскохозяйственный трактор' },
      { kind: 'submarine-mini',    label: 'Подлодка',       emoji: '🌊', defaultColor: '#f39c12', tags: ['подлодка','submarine','море','жёлтая','перископ'], hint: 'Маленькая жёлтая подводная лодка' },
      { kind: 'sailboat',          label: 'Парусник',       emoji: '⛵', defaultColor: '#8B4513', tags: ['парусник','sailboat','лодка','парус','море'], hint: 'Парусная лодка с белыми парусами' },
      { kind: 'hot-air-balloon-2', label: 'Воздушный шар',  emoji: '🎈', defaultColor: '#e74c3c', tags: ['шар','balloon','воздушный','парит','небо'], hint: 'Воздушный шар, плавно парящий в небе' },
      { kind: 'cable-car',         label: 'Фуникулёр',      emoji: '🚡', defaultColor: '#e74c3c', tags: ['фуникулёр','cable car','трос','горы','вагон'], hint: 'Вагон городского фуникулёра на тросе' },
      { kind: 'monorail',          label: 'Монорельс',      emoji: '🚝', defaultColor: '#3498db', tags: ['монорельс','monorail','рельс','поезд','будущее'], hint: 'Современный монорельсовый поезд' },
    ],
  },
  {
    id: 'food-cafe', name: 'Еда и кафе', icon: '☕',
    items: [
      { kind: 'cafe-table',    label: 'Столик кафе',    emoji: '🪑', defaultColor: '#8B6914', tags: ['столик','стул','кафе','cafe table','ресторан'], hint: 'Кафе-столик со стульями' },
      { kind: 'coffee-cup',    label: 'Кофе',           emoji: '☕', defaultColor: '#6F4E37', tags: ['кофе','coffee','чашка','пар','напиток'], hint: 'Чашка кофе с дымком' },
      { kind: 'cake-slice',    label: 'Торт (кусок)',   emoji: '🍰', defaultColor: '#f5cba7', tags: ['торт','cake','десерт','клубника','сладкое'], hint: 'Кусочек торта с клубникой' },
      { kind: 'ice-cream-stand', label: 'Ларёк мороженого', emoji: '🍦', defaultColor: '#ff69b4', tags: ['мороженое','ice cream','ларёк','розовый','летом'], hint: 'Ларёк мороженого с зонтиком' },
      { kind: 'food-cart',     label: 'Фудкарт',        emoji: '🛺', defaultColor: '#e67e22', tags: ['фудкарт','food cart','тачка','уличная еда','оранжевый'], hint: 'Уличная тачка с едой' },
      { kind: 'pizza-oven',    label: 'Печь для пиццы', emoji: '🍕', defaultColor: '#d35400', tags: ['пицца','pizza','печь','oven','огонь','итальянский'], hint: 'Дровяная печь для пиццы с огнём' },
      { kind: 'soda-machine',  label: 'Автомат газировки', emoji: '🥤', defaultColor: '#e74c3c', tags: ['автомат','soda','газировка','машина','напиток'], hint: 'Автомат с газированными напитками' },
      { kind: 'cupcake',       label: 'Капкейк',        emoji: '🧁', defaultColor: '#ff69b4', tags: ['капкейк','cupcake','розовый','вишня','сладкое'], hint: 'Красивый капкейк с украшениями' },
      { kind: 'pretzel',       label: 'Крендель',       emoji: '🥨', defaultColor: '#c8860a', tags: ['крендель','pretzel','соль','выпечка','немецкий'], hint: 'Классический немецкий крендель' },
      { kind: 'hot-dog-stand', label: 'Хот-дог',        emoji: '🌭', defaultColor: '#e74c3c', tags: ['хот-дог','hot dog','сосиска','зонт','уличная еда'], hint: 'Ларёк с хот-догами и зонтиком' },
    ],
  },
  {
    id: 'sports2', name: 'Спорт-2', icon: '🏊',
    items: [
      { kind: 'swimming-pool',  label: 'Бассейн',       emoji: '🏊', defaultColor: '#4fc3f7', tags: ['бассейн','swimming pool','вода','дорожки','трамплин'], hint: 'Бассейн с делением дорожек' },
      { kind: 'tennis-court',   label: 'Теннисный корт', emoji: '🎾', defaultColor: '#2ecc71', tags: ['теннис','tennis court','сетка','корт','зелёный'], hint: 'Теннисный корт с сеткой' },
      { kind: 'ski-jump',       label: 'Трамплин',      emoji: '⛷️', defaultColor: '#4c97ff', tags: ['трамплин','ski jump','прыжок','горы','спорт'], hint: 'Горнолыжный трамплин для прыжков' },
      { kind: 'bowling-pin',    label: 'Боулинг',       emoji: '🎳', defaultColor: '#ffffff', tags: ['боулинг','bowling','кегли','шар','игра'], hint: 'Кегли для боулинга с шаром' },
      { kind: 'dartboard',      label: 'Дартс',         emoji: '🎯', defaultColor: '#222222', tags: ['дартс','dartboard','мишень','дротик','цель'], hint: 'Мишень для дартса с дротиком' },
      { kind: 'golf-hole',      label: 'Гольф',         emoji: '⛳', defaultColor: '#27ae60', tags: ['гольф','golf hole','флаг','лунка','газон'], hint: 'Лунка для гольфа с флажком' },
      { kind: 'climbing-wall',  label: 'Скалодром',     emoji: '🧗', defaultColor: '#e67e22', tags: ['скалодром','climbing wall','зацепы','спорт','лазание'], hint: 'Стена для скалолазания с зацепами' },
      { kind: 'balance-beam',   label: 'Бревно',        emoji: '🤸', defaultColor: '#f39c12', tags: ['бревно','balance beam','гимнастика','спорт','равновесие'], hint: 'Гимнастическое бревно' },
      { kind: 'racing-flag',    label: 'Клетчатый флаг', emoji: '🏁', defaultColor: '#ffffff', tags: ['флаг','racing flag','финиш','гонки','клетчатый'], hint: 'Клетчатый флаг финиша гонки' },
      { kind: 'medal-stand',    label: 'Пьедестал',     emoji: '🏆', defaultColor: '#f8c300', tags: ['пьедестал','medal stand','победа','олимпиада','медаль'], hint: 'Олимпийский пьедестал победителей' },
    ],
  },
  {
    id: 'space2', name: 'Космос-2', icon: '🌌',
    items: [
      { kind: 'moon-base',         label: 'Лунная база',    emoji: '🌕', defaultColor: '#b0b8c8', tags: ['луна','moon base','база','купол','космос'], hint: 'Лунная база с куполами и тоннелем' },
      { kind: 'space-rover',       label: 'Луноход',        emoji: '🚗', defaultColor: '#f5f0e0', tags: ['луноход','space rover','марс','колёса','исследование'], hint: 'Космический луноход с солнечными панелями' },
      { kind: 'satellite-dish-2',  label: 'Антенна',        emoji: '📡', defaultColor: '#dddddd', tags: ['антенна','satellite dish','сигнал','поворот','связь'], hint: 'Параболическая антенна, поворачивается' },
      { kind: 'alien-ship',        label: 'Корабль пришельцев', emoji: '🛸', defaultColor: '#00ff88', tags: ['пришелец','alien ship','НЛО','луч','зелёный'], hint: 'Летающая тарелка с тяговым лучом' },
      { kind: 'cryo-pod',          label: 'Криокамера',     emoji: '🧊', defaultColor: '#4fc3f7', tags: ['криокамера','cryo pod','лёд','сон','sci-fi'], hint: 'Криогенная капсула со статусными огнями' },
      { kind: 'space-suit',        label: 'Скафандр',       emoji: '👨‍🚀', defaultColor: '#ffffff', tags: ['скафандр','space suit','астронавт','шлем','космос'], hint: 'Полный скафандр астронавта' },
      { kind: 'meteor-shower',     label: 'Метеоритный дождь', emoji: '☄️', defaultColor: '#ff6b35', tags: ['метеорит','meteor shower','огонь','дождь','космос'], hint: 'Летящие метеориты с огненными хвостами' },
      { kind: 'ring-planet',       label: 'Планета с кольцами', emoji: '🪐', defaultColor: '#e8a87c', tags: ['планета','ring planet','кольца','сатурн','космос'], hint: 'Планета с кольцами как Сатурн' },
      { kind: 'rocket-launch-pad', label: 'Стартовая площадка', emoji: '🚀', defaultColor: '#e74c3c', tags: ['ракета','launch pad','старт','огонь','космос'], hint: 'Ракета на стартовой площадке' },
      { kind: 'space-cannon',      label: 'Плазменная пушка', emoji: '🔫', defaultColor: '#555555', tags: ['пушка','space cannon','plasma','sci-fi','турель'], hint: 'Поворачивающаяся плазменная пушка' },
    ],
  },
  {
    id: 'fantasy2', name: 'Фэнтези-2', icon: '🧙',
    items: [
      { kind: 'wizard-tower',    label: 'Башня мага',      emoji: '🧙', defaultColor: '#4b2882', tags: ['маг','wizard tower','башня','заклинание','магия'], hint: 'Тёмная башня со звёздным сиянием' },
      { kind: 'dragon-statue',   label: 'Дракон',          emoji: '🐉', defaultColor: '#2d8b2d', tags: ['дракон','dragon','статуя','фэнтези','чешуя'], hint: 'Статуя дракона с развёрнутыми крыльями' },
      { kind: 'magic-wand',      label: 'Волшебная палочка', emoji: '🪄', defaultColor: '#ffd700', tags: ['палочка','wand','заклинание','искры','магия'], hint: 'Парящая волшебная палочка с искрами' },
      { kind: 'spell-book',      label: 'Книга заклинаний', emoji: '📖', defaultColor: '#8b0000', tags: ['книга','spell book','заклинание','рунная','магия'], hint: 'Открытая книга с магическими рунами' },
      { kind: 'enchanted-sword', label: 'Зачарованный меч', emoji: '⚔️', defaultColor: '#4488ff', tags: ['меч','enchanted sword','камень','легенда','свет'], hint: 'Меч в камне с синим свечением' },
      { kind: 'alchemy-table',   label: 'Стол алхимика',   emoji: '⚗️', defaultColor: '#3a2b1a', tags: ['алхимик','alchemy','колба','зелье','работа'], hint: 'Стол алхимика с пузырьками и колбами' },
      { kind: 'fairy-house',     label: 'Домик феи',       emoji: '🍄', defaultColor: '#ff9454', tags: ['фея','fairy house','гриб','сказка','маленький'], hint: 'Домик-гриб с окошком и светом' },
      { kind: 'rune-stone-glow', label: 'Рун-камень',      emoji: '🪨', defaultColor: '#7b2fff', tags: ['руна','rune stone','камень','свечение','старый'], hint: 'Стоячий камень с рунным свечением' },
      { kind: 'magic-mirror',    label: 'Волшебное зеркало', emoji: '🪞', defaultColor: '#88aaff', tags: ['зеркало','magic mirror','свечение','рамка','отражение'], hint: 'Зеркало с переливающимся светом' },
      { kind: 'cursed-chest',    label: 'Проклятый сундук', emoji: '🟢', defaultColor: '#1a4a1a', tags: ['сундук','cursed','зелёный','проклятие','skull'], hint: 'Сундук с зловещим зелёным сиянием' },
    ],
  },
  {
    id: 'sci-tech', name: 'Наука и Tech', icon: '🔬',
    items: [
      { kind: 'hologram-display', label: 'Голограмма',      emoji: '📊', defaultColor: '#00ccff', tags: ['голограмма','hologram','дисплей','sci-fi','данные'], hint: 'Переливающаяся голографическая панель' },
      { kind: 'tesla-coil',       label: 'Катушка Тесла',   emoji: '⚡', defaultColor: '#8844ff', tags: ['тесла','tesla coil','молния','электро','катушка'], hint: 'Катушка Тесла с электрическими искрами' },
      { kind: 'dna-helix',        label: 'Спираль ДНК',     emoji: '🧬', defaultColor: '#00ff88', tags: ['днк','dna helix','биология','спираль','наука'], hint: 'Вращающаяся двойная спираль ДНК' },
      { kind: 'laser-beam',       label: 'Лазер',           emoji: '🔦', defaultColor: '#ff0044', tags: ['лазер','laser beam','луч','красный','sci-fi'], hint: 'Вертикальный лазерный луч' },
      { kind: 'computer-terminal',label: 'Терминал',        emoji: '🖥', defaultColor: '#222222', tags: ['терминал','computer','экран','sci-fi','интерфейс'], hint: 'Sci-fi компьютерный терминал' },
      { kind: 'reactor-core',     label: 'Ядерный реактор', emoji: '☢️', defaultColor: '#88ff44', tags: ['реактор','reactor','ядерный','энергия','sci-fi'], hint: 'Пульсирующий энергетический реактор' },
      { kind: 'data-tower',       label: 'Башня данных',    emoji: '📶', defaultColor: '#0044ff', tags: ['башня','data tower','сервер','данные','tech'], hint: 'Высокая башня с LED-панелями' },
      { kind: 'magnifying-glass', label: 'Лупа',            emoji: '🔍', defaultColor: '#c0c0c0', tags: ['лупа','magnifying glass','стекло','исследование','наука'], hint: 'Большая лупа-декор' },
      { kind: 'portal-gun',       label: 'Портал-пушка',    emoji: '🔫', defaultColor: '#ff8800', tags: ['пушка','portal gun','портал','оружие','sci-fi'], hint: 'Знаменитая оранжевая портал-пушка' },
      { kind: 'hover-pad',        label: 'Ховер-панель',    emoji: '🛸', defaultColor: '#44aaff', tags: ['парение','hover pad','платформа','sci-fi','парит'], hint: 'Левитирующая sci-fi платформа' },
    ],
  },
  {
    id: 'ocean-park', name: 'Океан', icon: '🌊',
    items: [
      { kind: 'jellyfish',       label: 'Медуза',         emoji: '🪼', defaultColor: '#ff88cc', tags: ['медуза','jellyfish','море','плавает','прозрачная'], hint: 'Пульсирующая медуза с щупальцами' },
      { kind: 'clam-shell',      label: 'Ракушка',        emoji: '🐚', defaultColor: '#f0e0c0', tags: ['ракушка','clam shell','жемчуг','море','пляж'], hint: 'Большая ракушка с жемчугом' },
      { kind: 'crab-prop',       label: 'Краб',           emoji: '🦀', defaultColor: '#ff5522', tags: ['краб','crab','клешни','море','красный'], hint: 'Краб с поднятыми клешнями' },
      { kind: 'seaweed-tall',    label: 'Водоросль',      emoji: '🌿', defaultColor: '#2a8b2a', tags: ['водоросль','seaweed','трава','море','зелёная'], hint: 'Высокая колышущаяся водоросль' },
      { kind: 'diving-bell',     label: 'Батисфера',      emoji: '🔔', defaultColor: '#b0b8c8', tags: ['батисфера','diving bell','подводный','купол','исследование'], hint: 'Старинная подводная батисфера' },
      { kind: 'reef-rock',       label: 'Риф',            emoji: '🪨', defaultColor: '#cc7744', tags: ['риф','reef rock','коралл','скала','море'], hint: 'Коралловый риф-скала' },
      { kind: 'sea-star',        label: 'Морская звезда', emoji: '⭐', defaultColor: '#ff8844', tags: ['морская звезда','sea star','пляж','оранжевая','пятилучевая'], hint: 'Оранжевая морская звезда' },
      { kind: 'manta-ray',       label: 'Скат',           emoji: '🦈', defaultColor: '#3355aa', tags: ['скат','manta ray','планирует','синий','тёмный'], hint: 'Парящий скат-манта' },
      { kind: 'puffer-fish',     label: 'Рыба-шар',       emoji: '🐡', defaultColor: '#ffaa33', tags: ['рыба-шар','puffer fish','надутая','жёлтая','острова'], hint: 'Надутая рыба-ёж' },
      { kind: 'sunken-ship-bow', label: 'Нос затонувшего', emoji: '⚓', defaultColor: '#5a4a2a', tags: ['корабль','sunken ship','затонувший','нос','ракушки'], hint: 'Нос затонувшего корабля' },
    ],
  },
  {
    id: 'jungle-park', name: 'Джунгли', icon: '🌴',
    items: [
      { kind: 'jungle-bridge',    label: 'Мост в джунглях', emoji: '🌉', defaultColor: '#8b5a1a', tags: ['мост','jungle bridge','верёвочный','джунгли','переправа'], hint: 'Верёвочный мост через пропасть' },
      { kind: 'tribal-drum',      label: 'Барабан',         emoji: '🥁', defaultColor: '#8b4513', tags: ['барабан','tribal drum','племя','ритм','деревянный'], hint: 'Большой племенной барабан' },
      { kind: 'jungle-flower',    label: 'Тропический цветок', emoji: '🌺', defaultColor: '#ff3355', tags: ['цветок','jungle flower','тропик','красный','джунгли'], hint: 'Крупный тропический цветок' },
      { kind: 'tree-giant',       label: 'Гигантское дерево', emoji: '🌳', defaultColor: '#2d6b2d', tags: ['дерево','giant tree','огромный','джунгли','банян'], hint: 'Огромное дерево с корнями-подпорками' },
      { kind: 'parrot-perch',     label: 'Попугай на жёрдочке', emoji: '🦜', defaultColor: '#ff4400', tags: ['попугай','parrot','жёрдочка','красный','тропик'], hint: 'Яркий попугай на деревянной жёрдочке' },
      { kind: 'waterfall-small',  label: 'Водопад',          emoji: '💧', defaultColor: '#4fc3f7', tags: ['водопад','waterfall','вода','джунгли','поток'], hint: 'Небольшой каскадный водопад' },
      { kind: 'bamboo-wall',      label: 'Бамбуковая стена', emoji: '🎋', defaultColor: '#5ba55b', tags: ['бамбук','bamboo wall','стена','зелёный','ограда'], hint: 'Ограда из бамбуковых стеблей' },
      { kind: 'frog-statue',      label: 'Статуя лягушки',   emoji: '🐸', defaultColor: '#2a8b2a', tags: ['лягушка','frog','статуя','джунгли','тотем'], hint: 'Каменная статуя лягушки-тотема' },
      { kind: 'temple-ruin',      label: 'Руины храма',      emoji: '🏛', defaultColor: '#9a8a6a', tags: ['руины','temple ruin','храм','камень','джунгли'], hint: 'Руины древнего храма в джунглях' },
      { kind: 'treasure-map-stand', label: 'Карта сокровищ', emoji: '🗺', defaultColor: '#c8a870', tags: ['карта','treasure map','сокровище','стенд','пергамент'], hint: 'Карта сокровищ на деревянном стенде' },
    ],
  },
  {
    id: 'steampunk', name: 'Стимпанк', icon: '⚙️',
    items: [
      { kind: 'steam-pipe',       label: 'Паровая труба',    emoji: '🔧', defaultColor: '#8b6914', tags: ['труба','steam pipe','пар','механика','стимпанк'], hint: 'Паровая труба с клапаном' },
      { kind: 'clockwork-gear',   label: 'Шестерня',        emoji: '⚙️', defaultColor: '#c0a040', tags: ['шестерня','gear','clockwork','механизм','стимпанк'], hint: 'Большая вращающаяся шестерня' },
      { kind: 'airship-engine',   label: 'Двигатель дирижабля', emoji: '✈️', defaultColor: '#a07820', tags: ['двигатель','airship engine','пропеллер','стимпанк','латунь'], hint: 'Паровой двигатель с пропеллером' },
      { kind: 'pressure-gauge',   label: 'Манометр',        emoji: '🔴', defaultColor: '#c0c0c0', tags: ['манометр','pressure gauge','стрелка','давление','пар'], hint: 'Манометр со стрелкой давления' },
      { kind: 'steam-locomotive', label: 'Паровоз',         emoji: '🚂', defaultColor: '#2a2a2a', tags: ['паровоз','locomotive','поезд','пар','стимпанк'], hint: 'Маленький паровоз с дымком' },
      { kind: 'cog-tower',        label: 'Башня шестерён',  emoji: '⚙️', defaultColor: '#8b6914', tags: ['башня','cog tower','шестерни','механизм','стимпанк'], hint: 'Башня с крутящимися шестернями' },
      { kind: 'tesla-lamp',       label: 'Тесла-фонарь',    emoji: '💡', defaultColor: '#fff3d8', tags: ['фонарь','tesla lamp','электро','ретро','свет'], hint: 'Ретро фонарь с молниями' },
      { kind: 'brass-telescope',  label: 'Телескоп',        emoji: '🔭', defaultColor: '#b8860b', tags: ['телескоп','telescope','латунь','бронза','стимпанк'], hint: 'Латунный телескоп на штативе' },
      { kind: 'steam-vent',       label: 'Паровой клапан',  emoji: '💨', defaultColor: '#888880', tags: ['клапан','steam vent','пар','выброс','механика'], hint: 'Клапан с выбросом пара' },
      { kind: 'dirigible',        label: 'Дирижабль',       emoji: '🎈', defaultColor: '#c8a050', tags: ['дирижабль','dirigible','воздушный шар','пропеллер','стимпанк'], hint: 'Маленький стимпанк дирижабль' },
    ],
  },
  {
    id: 'cyberpunk', name: 'Киберпанк', icon: '🌆',
    items: [
      { kind: 'neon-billboard',     label: 'Неоновый билборд',   emoji: '📺', defaultColor: '#00ffcc', tags: ['неон','billboard','реклама','киберпанк','ночь'], hint: 'Светящийся неоновый билборд' },
      { kind: 'cyber-vending',      label: 'Автомат киберпанк',  emoji: '🤖', defaultColor: '#ff0066', tags: ['автомат','vending','киберпанк','еда','неон'], hint: 'Неоновый торговый автомат' },
      { kind: 'holo-ad',            label: 'Голо-реклама',       emoji: '📡', defaultColor: '#0088ff', tags: ['голограмма','holo ad','реклама','синий','киберпанк'], hint: 'Голографическая реклама в воздухе' },
      { kind: 'drone-prop',         label: 'Дрон',               emoji: '🚁', defaultColor: '#333344', tags: ['дрон','drone','квадрокоптер','летит','sci-fi'], hint: 'Летающий дрон с огнями' },
      { kind: 'cyberpunk-car',      label: 'Кибер-авто',         emoji: '🚗', defaultColor: '#222233', tags: ['машина','cyberpunk car','кибер','неон','будущее'], hint: 'Футуристическая машина с неоном' },
      { kind: 'server-rack',        label: 'Стойка серверов',    emoji: '🖥', defaultColor: '#111122', tags: ['сервер','server rack','данные','datacenter','tech'], hint: 'Серверная стойка с индикаторами' },
      { kind: 'cyber-street-lamp',  label: 'Кибер-фонарь',       emoji: '🏙', defaultColor: '#ff8800', tags: ['фонарь','cyber street lamp','оранжевый','неон','улица'], hint: 'Кибер-уличный фонарь с неоном' },
      { kind: 'rain-puddle',        label: 'Лужа с отражением',  emoji: '💧', defaultColor: '#334455', tags: ['лужа','puddle','дождь','отражение','ночь'], hint: 'Лужа с неоновым отражением' },
      { kind: 'graffiti-wall',      label: 'Граффити-стена',     emoji: '🎨', defaultColor: '#111111', tags: ['граффити','graffiti','стена','улица','арт'], hint: 'Стена с граффити-рисунком' },
      { kind: 'cyber-trash',        label: 'Кибер-мусор',        emoji: '🗑', defaultColor: '#222233', tags: ['мусор','cyber trash','детали','лом','киберпанк'], hint: 'Кучка киберпанк-мусора и деталей' },
    ],
  },
  {
    id: 'space-station', name: 'Космостанция', icon: '🛸',
    items: [
      { kind: 'launch-silo',      label: 'Пусковая шахта',     emoji: '🚀', defaultColor: '#778899', tags: ['шахта','launch silo','ракета','старт','космос'], hint: 'Бетонная шахта для запуска ракет' },
      { kind: 'space-capsule',    label: 'Космокапсула',        emoji: '🛸', defaultColor: '#c0c8d0', tags: ['капсула','space capsule','астронавт','спускаемый','космос'], hint: 'Спускаемая капсула после полёта' },
      { kind: 'moon-crater',      label: 'Лунный кратер',       emoji: '🌑', defaultColor: '#aaaaaa', tags: ['кратер','moon crater','луна','камни','серый'], hint: 'Кратер на поверхности луны' },
      { kind: 'ion-thruster',     label: 'Ионный двигатель',    emoji: '⚡', defaultColor: '#4466ff', tags: ['двигатель','ion thruster','ион','синий','sci-fi'], hint: 'Ионный двигатель с синим свечением' },
      { kind: 'astro-lab',        label: 'Астролаборатория',    emoji: '🔭', defaultColor: '#334455', tags: ['лаборатория','astro lab','телескоп','наука','космос'], hint: 'Мобильная лаборатория астронавтов' },
      { kind: 'solar-collector',  label: 'Солнечный коллектор', emoji: '☀', defaultColor: '#ffcc00', tags: ['коллектор','solar','солнечный','панель','энергия'], hint: 'Развёрнутый солнечный коллектор' },
      { kind: 'space-beacon',     label: 'Маяк космоса',        emoji: '🔦', defaultColor: '#ff4400', tags: ['маяк','space beacon','сигнал','красный','космос'], hint: 'Навигационный маяк на поверхности' },
      { kind: 'oxygen-tank',      label: 'Кислородный бак',     emoji: '🧊', defaultColor: '#88bbdd', tags: ['бак','oxygen tank','кислород','цилиндр','станция'], hint: 'Резервуар с кислородом' },
      { kind: 'hull-panel',       label: 'Панель обшивки',      emoji: '🔩', defaultColor: '#99aabb', tags: ['панель','hull panel','обшивка','металл','станция'], hint: 'Сегмент обшивки космической станции' },
      { kind: 'space-buggy',      label: 'Луноход',             emoji: '🚙', defaultColor: '#bbccdd', tags: ['луноход','space buggy','rover','колёса','луна'], hint: 'Маленький луноход с антенной' },
    ],
  },
  {
    id: 'prehistoric', name: 'Доисторика', icon: '🦕',
    items: [
      { kind: 'cave-painting',    label: 'Наскальный рисунок',  emoji: '🎨', defaultColor: '#8b6050', tags: ['рисунок','cave painting','пещера','наскальный','prehistoric'], hint: 'Наскальный рисунок на камне' },
      { kind: 'mammoth',          label: 'Мамонт',              emoji: '🦣', defaultColor: '#8b6040', tags: ['мамонт','mammoth','слон','шерсть','ледник'], hint: 'Лохматый мамонт со бивнями' },
      { kind: 'dino-track',       label: 'След динозавра',      emoji: '🦕', defaultColor: '#8a8060', tags: ['след','dino track','динозавр','отпечаток','земля'], hint: 'Глубокий отпечаток лапы динозавра' },
      { kind: 'bone-pile',        label: 'Куча костей',         emoji: '💀', defaultColor: '#e8ddc0', tags: ['кости','bone pile','скелет','ископаемые','белые'], hint: 'Куча ископаемых костей' },
      { kind: 'flint-club',       label: 'Каменная дубина',     emoji: '🏏', defaultColor: '#8a8080', tags: ['дубина','flint club','камень','оружие','первобытный'], hint: 'Первобытная дубина с каменным наконечником' },
      { kind: 'stone-hut',        label: 'Каменный шалаш',      emoji: '🏠', defaultColor: '#9a8a7a', tags: ['шалаш','stone hut','хижина','пещерный','жильё'], hint: 'Первобытное каменное жилище' },
      { kind: 'fire-pit-2',       label: 'Очаг',                emoji: '🔥', defaultColor: '#ff6600', tags: ['очаг','fire pit','огонь','первобытный','камни'], hint: 'Первобытный очаг из камней' },
      { kind: 'sabre-tooth',      label: 'Саблезубый тигр',     emoji: '🐯', defaultColor: '#cc8844', tags: ['саблезубый','sabre tooth','тигр','клыки','prehistoric'], hint: 'Саблезубый тигр в стойке' },
      { kind: 'tar-pit',          label: 'Смоляная яма',        emoji: '⬛', defaultColor: '#111100', tags: ['смола','tar pit','яма','чёрный','опасность'], hint: 'Бурлящая смоляная яма' },
      { kind: 'amber-gem',        label: 'Янтарь с насекомым',  emoji: '🟡', defaultColor: '#ffaa00', tags: ['янтарь','amber gem','насекомое','золотой','prehistoric'], hint: 'Кусок янтаря с вмёрзшим насекомым' },
    ],
  },
  {
    id: 'enchanted-village', name: 'Зачарованная деревня', icon: '🧚',
    items: [
      { kind: 'magic-well',          label: 'Магический колодец',    emoji: '✨', defaultColor: '#4488ff', tags: ['колодец','magic well','магия','свечение','деревня'], hint: 'Колодец с магическим свечением' },
      { kind: 'enchanted-gate',      label: 'Заколдованные ворота',  emoji: '🚪', defaultColor: '#7744aa', tags: ['ворота','enchanted gate','магия','арка','фэнтези'], hint: 'Светящиеся ворота с рунами' },
      { kind: 'pixie-lamp',          label: 'Лампа фей',             emoji: '🔮', defaultColor: '#ffee44', tags: ['лампа','pixie lamp','феи','свет','фонарь'], hint: 'Лампа, наполненная светом фей' },
      { kind: 'spell-scroll',        label: 'Свиток заклинания',     emoji: '📜', defaultColor: '#ddcc88', tags: ['свиток','spell scroll','заклинание','бумага','магия'], hint: 'Развёрнутый свиток с заклинанием' },
      { kind: 'crystal-ball-stand',  label: 'Хрустальный шар',       emoji: '🔮', defaultColor: '#88ddff', tags: ['шар','crystal ball','предсказание','хрусталь','магия'], hint: 'Хрустальный шар на подставке' },
      { kind: 'mushroom-house',      label: 'Гриб-домик',            emoji: '🍄', defaultColor: '#dd4444', tags: ['гриб','mushroom house','домик','красный','фея'], hint: 'Домик в большом грибе' },
      { kind: 'fairy-fountain',      label: 'Фонтан фей',            emoji: '⛲', defaultColor: '#44ccff', tags: ['фонтан','fairy fountain','феи','вода','волшебный'], hint: 'Светящийся фонтан с феями' },
      { kind: 'glowing-tree',        label: 'Светящееся дерево',     emoji: '🌳', defaultColor: '#44ff88', tags: ['дерево','glowing tree','свечение','лес','магия'], hint: 'Дерево с магическим свечением листьев' },
      { kind: 'potion-rack',         label: 'Стеллаж зелий',         emoji: '🧪', defaultColor: '#884488', tags: ['зелья','potion rack','зелье','полка','алхимия'], hint: 'Полка с разноцветными зельями' },
      { kind: 'rune-altar',          label: 'Алтарь рун',            emoji: '🗿', defaultColor: '#667788', tags: ['алтарь','rune altar','руны','камень','магия'], hint: 'Каменный алтарь с рунической гравировкой' },
    ],
  },
  {
    id: 'underwater-lab', name: 'Подводная лаборатория', icon: '🌊',
    items: [
      { kind: 'submarine-hatch',   label: 'Люк субмарины',         emoji: '🔩', defaultColor: '#446688', tags: ['люк','submarine hatch','субмарина','металл','подводный'], hint: 'Круглый металлический люк субмарины' },
      { kind: 'pressure-dome',     label: 'Купол давления',         emoji: '⛺', defaultColor: '#88aacc', tags: ['купол','pressure dome','стекло','подводный','станция'], hint: 'Прозрачный купол для жизни под водой' },
      { kind: 'sonar-tower',       label: 'Сонарная башня',         emoji: '📡', defaultColor: '#334455', tags: ['сонар','sonar tower','антенна','башня','подводный'], hint: 'Башня с вращающимся сонаром' },
      { kind: 'deep-probe',        label: 'Глубоководный зонд',     emoji: '🤿', defaultColor: '#556677', tags: ['зонд','deep probe','исследование','зонд','наука'], hint: 'Автономный зонд для исследования глубин' },
      { kind: 'bubble-vent',       label: 'Пузырьковый вентиль',    emoji: '💧', defaultColor: '#66aadd', tags: ['пузыри','bubble vent','вентиль','воздух','подводный'], hint: 'Трубка с поднимающимися пузырьками' },
      { kind: 'coral-lab',         label: 'Коралловая лаборатория', emoji: '🪸', defaultColor: '#ff7766', tags: ['коралл','coral lab','лаборатория','море','наука'], hint: 'Лаборатория, встроенная в коралловый риф' },
      { kind: 'specimen-tank',     label: 'Аквариум-образец',       emoji: '🐟', defaultColor: '#2255aa', tags: ['аквариум','specimen tank','рыба','образец','стекло'], hint: 'Герметичный резервуар с морскими образцами' },
      { kind: 'depth-gauge',       label: 'Глубиномер',             emoji: '📊', defaultColor: '#334466', tags: ['глубиномер','depth gauge','прибор','давление','наука'], hint: 'Большой аналоговый глубиномер' },
      { kind: 'torpedo-bay',       label: 'Торпедный отсек',        emoji: '🚀', defaultColor: '#445566', tags: ['торпеда','torpedo bay','отсек','металл','подводный'], hint: 'Открытый торпедный отсек субмарины' },
      { kind: 'biolume-tank',      label: 'Бiolume-аквариум',       emoji: '🌟', defaultColor: '#00ccaa', tags: ['биолюминесценция','biolume tank','светится','зелёный','море'], hint: 'Аквариум с биолюминесцентными существами' },
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
