(function() {
	const n = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/";
	let e = null, t = null;
	async function s() {
		return e || t || (t = (async () => {
			const t = await (await import(`${n}pyodide.mjs`)).loadPyodide({ indexURL: n });
			return t.runPython("\n_commands = []\n_coins = 0  # отслеживает очки внутри скрипта\n\ndef _emit(op, **kwargs):\n    cmd = {\"op\": op}\n    cmd.update(kwargs)\n    _commands.append(cmd)\n\n# ─── Перехват print() и ошибок ───────────────────────\nimport sys as _sys\n\nclass _StdoutCapture:\n    def __init__(self, kind=\"print\"):\n        self._kind = kind\n        self._buf = \"\"\n    def write(self, s):\n        if not s:\n            return\n        self._buf += str(s)\n        while \"\\n\" in self._buf:\n            line, self._buf = self._buf.split(\"\\n\", 1)\n            _emit(self._kind, text=line)\n    def flush(self):\n        if self._buf:\n            _emit(self._kind, text=self._buf)\n            self._buf = \"\"\n\n_sys.stdout = _StdoutCapture(\"print\")\n_sys.stderr = _StdoutCapture(\"stderr\")\n\n# ─── События ────────────────────────────────────────────────\ndef on_start():\n    \"\"\"Вызывается автоматически при запуске игры.\"\"\"\n    pass  # ребёнок переопределит\n\ndef on_touch(block_name, callback):\n    \"\"\"Зарегистрировать колбэк при касании игрока с блоком.\"\"\"\n    _emit(\"on_touch\", block=str(block_name))\n\n# ─── Игрок ──────────────────────────────────────────────────\ndef move_forward(steps=1):\n    try: steps = int(steps)\n    except: steps = 1\n    _emit(\"player_move\", dx=0, dz=-max(1, min(steps, 50)))\n\ndef move_back(steps=1):\n    try: steps = int(steps)\n    except: steps = 1\n    _emit(\"player_move\", dx=0, dz=max(1, min(steps, 50)))\n\ndef turn_left():\n    _emit(\"player_turn\", degrees=-90)\n\ndef turn_right():\n    _emit(\"player_turn\", degrees=90)\n\ndef jump():\n    _emit(\"player_jump\")\n\ndef say(text=\"Привет!\"):\n    _emit(\"player_say\", text=str(text)[:140])\n\n# ─── Мир: блоки ─────────────────────────────────────────────\ndef place_block(x=0, y=0, z=0, color=\"red\", material=\"plastic\"):\n    try: x, y, z = int(x), int(y), int(z)\n    except: x, y, z = 0, 0, 0\n    allowed = {\"red\",\"blue\",\"green\",\"yellow\",\"purple\",\"orange\",\"black\",\"white\",\"pink\",\"cyan\"}\n    c = str(color).lower()\n    if c not in allowed: c = \"red\"\n    allowed_mat = {\"plastic\",\"metal\",\"wood\",\"stone\",\"grass\",\"neon\"}\n    m = str(material).lower()\n    if m not in allowed_mat: m = \"plastic\"\n    _emit(\"place_block\", x=x, y=y, z=z, color=c, material=m)\n\ndef remove_block(x=0, y=0, z=0):\n    _emit(\"remove_block\", x=int(x), y=int(y), z=int(z))\n\ndef paint_block(x=0, y=0, z=0, color=\"red\"):\n    _emit(\"paint_block\", x=int(x), y=int(y), z=int(z), color=str(color))\n\n# ─── Мир: среда ─────────────────────────────────────────────\ndef set_sky(preset=\"day\"):\n    allowed = {\"day\",\"evening\",\"night\",\"cloudy\",\"space\"}\n    p = str(preset).lower()\n    if p not in allowed: p = \"day\"\n    _emit(\"set_sky\", preset=p)\n\ndef set_gravity(g=-30):\n    try: g = float(g)\n    except: g = -30.0\n    g = max(-100, min(g, 0))\n    _emit(\"set_gravity\", g=g)\n\n# ─── Очки и таймеры ─────────────────────────────────────────\ndef add_score(n=1):\n    global _coins\n    try: n = int(n)\n    except: n = 1\n    _coins += n\n    _emit(\"add_score\", n=n)\n\ndef set_score(n=0):\n    global _coins\n    try: n = int(n)\n    except: n = 0\n    n = max(0, min(n, 9999))\n    _coins = n\n    _emit(\"set_score\", n=n)\n\ndef wait(seconds=1):\n    try: s = float(seconds)\n    except: s = 1.0\n    s = max(0.1, min(s, 60))\n    _emit(\"wait\", seconds=s)\n\n# ─── Удобные конструкции ────────────────────────────────────\ndef tower(height=5, x=0, z=0, color=\"blue\"):\n    \"\"\"Построить башню высотой N блоков.\"\"\"\n    for y in range(int(height)):\n        place_block(x, y, z, color)\n\ndef line(length=5, x=0, z=0, color=\"red\"):\n    \"\"\"Построить ряд блоков длиной N вдоль Z.\"\"\"\n    for i in range(int(length)):\n        place_block(x, 0, z + i, color)\n\ndef square(size=3, x=0, z=0, color=\"green\"):\n    \"\"\"Построить квадратную плиту size×size.\"\"\"\n    for i in range(int(size)):\n        for j in range(int(size)):\n            place_block(x + i, 0, z + j, color)\n\ndef _reset():\n    _commands.clear()\n\n# ─── Tower of Code API (M4 капстон) ─────────────────────────\n_tower_sections = []\n\ndef tower_section(type=\"straight\"):\n    \"\"\"Добавить секцию в башню. type: straight/zigzag/moving/rotating/spikes.\"\"\"\n    allowed = {\"straight\",\"zigzag\",\"moving\",\"rotating\",\"spikes\"}\n    k = str(type).lower()\n    if k not in allowed: k = \"straight\"\n    _tower_sections.append(k)\n    _emit(\"tower_section\", type=k)\n\ndef randomize_tower(seed=42):\n    \"\"\"Процедурная генерация башни из 8 случайных секций.\"\"\"\n    try: seed = int(seed)\n    except: seed = 42\n    _emit(\"randomize_tower\", seed=seed)\n\ndef set_timer(seconds=480):\n    \"\"\"Установить таймер уровня в секундах (по умолчанию 8 минут = 480 сек).\"\"\"\n    try: s = int(seconds)\n    except: s = 480\n    s = max(10, min(s, 3600))\n    _emit(\"set_timer\", seconds=s)\n\n_reset()\n"), e = t, t;
		})(), t);
	}
	self.addEventListener("message", async (n) => {
		const e = n.data;
		try {
			if ("ping" === e.type) return await s(), void self.postMessage({
				id: e.id,
				type: "ready"
			});
			if ("reset" === e.type) return (await s()).runPython("_reset()"), void self.postMessage({
				id: e.id,
				type: "result",
				commands: []
			});
			if ("run" === e.type) {
				const n = await s();
				n.runPython("_reset()"), n.runPython(e.code);
				const t = n.globals.get("_commands").toJs({ dict_converter: Object.fromEntries });
				self.postMessage({
					id: e.id,
					type: "result",
					commands: t
				});
				return;
			}
		} catch (t) {
			const n = t instanceof Error ? t.message : String(t);
			self.postMessage({
				id: e.id,
				type: "error",
				message: n
			});
		}
	}), self.postMessage({
		id: 0,
		type: "ready"
	}), s().catch((n) => {
		const e = n instanceof Error ? n.message : String(n);
		self.postMessage({
			id: 0,
			type: "error",
			message: e
		});
	});
})();
