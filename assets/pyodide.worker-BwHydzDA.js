(function() {
	const d = `
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

# Override built-in print so output flows through _commands and can be checked.
# Without this, print() writes to Pyodide stdout which we never read.
def print(*args, sep=' ', end='\\n', file=None, flush=False):
    text = sep.join(str(a) for a in args)
    if file is not None:
        _emit("stderr", text=text)
    else:
        _emit("print", text=text)

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
`, a = `${"/".endsWith("/") ? "/" : "//"}pyodide/`;
	let i = null, o = null;
	async function n() {
		return i || o || (o = (async () => {
			self.postMessage({
				id: 0,
				type: "progress",
				step: "fetching"
			});
			const t = await import(`${a}pyodide.mjs`);
			self.postMessage({
				id: 0,
				type: "progress",
				step: "instantiating"
			});
			const e = await t.loadPyodide({ indexURL: a });
			return e.runPython(d), i = e, self.postMessage({
				id: 0,
				type: "progress",
				step: "ready"
			}), e;
		})(), o);
	}
	self.addEventListener("message", async (t) => {
		const e = t.data;
		try {
			if (e.type === "ping") {
				await n(), self.postMessage({
					id: e.id,
					type: "ready"
				});
				return;
			}
			if (e.type === "reset") {
				(await n()).runPython("_reset()"), self.postMessage({
					id: e.id,
					type: "result",
					commands: []
				});
				return;
			}
			if (e.type === "run") {
				const s = await n();
				s.runPython("_reset()"), s.runPython(e.code);
				const r = s.globals.get("_commands").toJs({ dict_converter: Object.fromEntries });
				self.postMessage({
					id: e.id,
					type: "result",
					commands: r
				});
				return;
			}
		} catch (s) {
			const r = s instanceof Error ? s.message : String(s);
			self.postMessage({
				id: e.id,
				type: "error",
				message: r
			});
		}
	}), self.postMessage({
		id: 0,
		type: "ready"
	}), n().catch((t) => {
		const e = t instanceof Error ? t.message : String(t);
		self.postMessage({
			id: 0,
			type: "error",
			message: e
		});
	});
})();
