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
