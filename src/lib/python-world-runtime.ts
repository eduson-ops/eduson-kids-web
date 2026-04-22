// Python Game World Runtime — Python-код ребёнка выполняется в Pyodide Worker,
// команды возвращаются как queue и применяются к editorState сцены.
// Это "методологический" слой — детям не нужно знать Lua/Three.js/Rapier.

/**
 * Python prelude — автоматически исполняется в Pyodide перед кодом ребёнка.
 * Определяет API функции которые ребёнок вызывает.
 */
export const PYTHON_WORLD_PRELUDE = `
_commands = []
_coins = 0  # отслеживает очки внутри скрипта

def _emit(op, **kwargs):
    cmd = {"op": op}
    cmd.update(kwargs)
    _commands.append(cmd)

# ─── События ────────────────────────────────────────────────
def on_start():
    """Вызывается автоматически при запуске игры."""
    pass  # ребёнок переопределит

def on_touch(block_name, callback):
    """Зарегистрировать колбэк при касании игрока с блоком."""
    _emit("on_touch", block=str(block_name))

# ─── Игрок ──────────────────────────────────────────────────
def move_forward(steps=1):
    try: steps = int(steps)
    except: steps = 1
    _emit("player_move", dx=0, dz=-max(1, min(steps, 50)))

def move_back(steps=1):
    try: steps = int(steps)
    except: steps = 1
    _emit("player_move", dx=0, dz=max(1, min(steps, 50)))

def turn_left():
    _emit("player_turn", degrees=-90)

def turn_right():
    _emit("player_turn", degrees=90)

def jump():
    _emit("player_jump")

def say(text="Привет!"):
    _emit("player_say", text=str(text)[:140])

# ─── Мир: блоки ─────────────────────────────────────────────
def place_block(x=0, y=0, z=0, color="red", material="plastic"):
    try: x, y, z = int(x), int(y), int(z)
    except: x, y, z = 0, 0, 0
    allowed = {"red","blue","green","yellow","purple","orange","black","white","pink","cyan"}
    c = str(color).lower()
    if c not in allowed: c = "red"
    allowed_mat = {"plastic","metal","wood","stone","grass","neon"}
    m = str(material).lower()
    if m not in allowed_mat: m = "plastic"
    _emit("place_block", x=x, y=y, z=z, color=c, material=m)

def remove_block(x=0, y=0, z=0):
    _emit("remove_block", x=int(x), y=int(y), z=int(z))

def paint_block(x=0, y=0, z=0, color="red"):
    _emit("paint_block", x=int(x), y=int(y), z=int(z), color=str(color))

# ─── Мир: среда ─────────────────────────────────────────────
def set_sky(preset="day"):
    allowed = {"day","evening","night","cloudy","space"}
    p = str(preset).lower()
    if p not in allowed: p = "day"
    _emit("set_sky", preset=p)

def set_gravity(g=-30):
    try: g = float(g)
    except: g = -30.0
    g = max(-100, min(g, 0))
    _emit("set_gravity", g=g)

# ─── Очки и таймеры ─────────────────────────────────────────
def add_score(n=1):
    global _coins
    try: n = int(n)
    except: n = 1
    _coins += n
    _emit("add_score", n=n)

def set_score(n=0):
    global _coins
    try: n = int(n)
    except: n = 0
    n = max(0, min(n, 9999))
    _coins = n
    _emit("set_score", n=n)

def wait(seconds=1):
    try: s = float(seconds)
    except: s = 1.0
    s = max(0.1, min(s, 60))
    _emit("wait", seconds=s)

# ─── Удобные конструкции ────────────────────────────────────
def tower(height=5, x=0, z=0, color="blue"):
    """Построить башню высотой N блоков."""
    for y in range(int(height)):
        place_block(x, y, z, color)

def line(length=5, x=0, z=0, color="red"):
    """Построить ряд блоков длиной N вдоль Z."""
    for i in range(int(length)):
        place_block(x, 0, z + i, color)

def square(size=3, x=0, z=0, color="green"):
    """Построить квадратную плиту size×size."""
    for i in range(int(size)):
        for j in range(int(size)):
            place_block(x + i, 0, z + j, color)

def _reset():
    _commands.clear()

# ─── Tower of Code API (M4 капстон) ─────────────────────────
_tower_sections = []

def tower_section(type="straight"):
    """Добавить секцию в башню. type: straight/zigzag/moving/rotating/spikes."""
    allowed = {"straight","zigzag","moving","rotating","spikes"}
    k = str(type).lower()
    if k not in allowed: k = "straight"
    _tower_sections.append(k)
    _emit("tower_section", type=k)

def randomize_tower(seed=42):
    """Процедурная генерация башни из 8 случайных секций."""
    try: seed = int(seed)
    except: seed = 42
    _emit("randomize_tower", seed=seed)

def set_timer(seconds=480):
    """Установить таймер уровня в секундах (по умолчанию 8 минут = 480 сек)."""
    try: s = int(seconds)
    except: s = 480
    s = max(10, min(s, 3600))
    _emit("set_timer", seconds=s)

_reset()
`

// TypeScript тип Command — соответствует _emit выводам в Python
export type WorldCommand =
  | { op: 'player_move'; dx: number; dz: number }
  | { op: 'player_turn'; degrees: number }
  | { op: 'player_jump' }
  | { op: 'player_say'; text: string }
  | { op: 'place_block'; x: number; y: number; z: number; color: string; material: string }
  | { op: 'remove_block'; x: number; y: number; z: number }
  | { op: 'paint_block'; x: number; y: number; z: number; color: string }
  | { op: 'set_sky'; preset: 'day' | 'evening' | 'night' | 'cloudy' | 'space' }
  | { op: 'set_gravity'; g: number }
  | { op: 'add_score'; n: number }
  | { op: 'set_score'; n: number }
  | { op: 'wait'; seconds: number }
  | { op: 'on_touch'; block: string }
  | { op: 'tower_section'; type: 'straight' | 'zigzag' | 'moving' | 'rotating' | 'spikes' }
  | { op: 'randomize_tower'; seed: number }
  | { op: 'set_timer'; seconds: number }
  // Per-object commands (runtime целится по target=<partId>)
  | { op: 'obj_move'; target: string; dx: number; dy: number; dz: number }
  | { op: 'obj_rotate'; target: string; deg: number }
  | { op: 'obj_set_color'; target: string; color: string }
  | { op: 'obj_set_scale'; target: string; s: number }
  | { op: 'obj_say'; target: string; text: string }
  | { op: 'obj_hide'; target: string }
  | { op: 'obj_show'; target: string }
  | { op: 'obj_destroy'; target: string }
  | { op: 'obj_broadcast'; target: string; name: string }

export interface PythonRunResult {
  commands: WorldCommand[]
  error: string | null
}

/**
 * Список функций → показываются в autocomplete editor + лекциях.
 * Каждая имеет русскую подсказку.
 */
export const PYTHON_API_REFERENCE = [
  { fn: 'move_forward(N)', desc: 'идти вперёд на N шагов' },
  { fn: 'move_back(N)', desc: 'идти назад' },
  { fn: 'turn_left()', desc: 'повернуть налево на 90°' },
  { fn: 'turn_right()', desc: 'повернуть направо на 90°' },
  { fn: 'jump()', desc: 'прыгнуть' },
  { fn: 'say(text)', desc: 'персонаж говорит' },
  { fn: 'place_block(x, y, z, color)', desc: 'поставить блок' },
  { fn: 'remove_block(x, y, z)', desc: 'убрать блок' },
  { fn: 'paint_block(x, y, z, color)', desc: 'перекрасить блок' },
  { fn: 'set_sky(preset)', desc: 'сменить небо (day/night/space)' },
  { fn: 'set_gravity(g)', desc: 'сменить гравитацию' },
  { fn: 'add_score(n)', desc: 'добавить очки' },
  { fn: 'set_score(n)', desc: 'установить счёт в N очков' },
  { fn: 'wait(sec)', desc: 'подождать' },
  { fn: 'tower(height, x, z, color)', desc: 'построить башню' },
  { fn: 'line(length, x, z, color)', desc: 'построить ряд блоков' },
  { fn: 'square(size, x, z, color)', desc: 'построить плиту size×size' },
  // Tower of Code (M4 капстон)
  { fn: 'tower_section(type)', desc: 'башня: добавить секцию (straight/zigzag/moving/...)' },
  { fn: 'randomize_tower(seed)', desc: 'башня: процедурно сгенерировать 8 секций' },
  { fn: 'set_timer(seconds)', desc: 'установить таймер уровня (по умолчанию 480)' },
] as const

/**
 * Пример-стартер для нового Python-проекта.
 */
export const PYTHON_STARTER_CODE = `# Привет! Это твоя первая программа на Python.
# Python умеет управлять игровым миром — двигать персонажа,
# ставить блоки, менять цвет неба.
#
# Попробуй изменить этот код и нажать «Запустить»!

say("Привет, мир!")

# Построим башню из 5 красных блоков
tower(5, x=0, z=-3, color="red")

# Построим квадратную платформу
square(3, x=-5, z=-3, color="blue")

# Двигаем персонажа
move_forward(3)
turn_right()
move_forward(2)
jump()
`
