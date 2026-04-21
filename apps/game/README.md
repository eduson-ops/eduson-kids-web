# @eduson-kids/game — Godot 4 воксельный редактор

Godot 4 проект с экспортом в HTML5 (WebAssembly). Встраивается в [`@eduson-kids/web`](../web/) как iframe или canvas.

> **Статус:** заглушка. Godot-проект создаётся в Sprint 0 (см. [../../roadmap/sprint_0_plan.md](../../roadmap/sprint_0_plan.md) блок A2).

## Почему Godot, а не Unity/Babylon.js

См. [ADR-002](../../architecture/adr/ADR-002-game-engine.md). TL;DR: OSS без royalty, нет санкционного риска, cross-platform export (web + native Android).

## Как инициализировать

1. Установить **Godot 4.4+** (LTS): https://godotengine.org/download
2. Открыть Godot.
3. `New Project` → путь: `<repo>/src/apps/game` → Renderer: **Mobile** (не Forward+; нам важен WebGL 2.0 поддержка на старом железе).
4. Создать минимальную сцену `scenes/test_island.tscn`.
5. Export → HTML5 preset. Output: `<repo>/src/apps/web/public/godot/`.

## Структура проекта

```
apps/game/
├── project.godot              # Godot project config (создаётся init)
├── icon.svg                    # Проектная иконка
├── scenes/
│   ├── main.tscn               # Стартовая сцена (загрузка)
│   ├── test_island.tscn        # Sprint 0 PoC сцена (1 куб + ротация)
│   └── voxel_world.tscn        # MVP шаблон-мир «Остров»
├── scripts/
│   ├── api_bridge.gd           # Мост между Godot и React (JS postMessage)
│   ├── voxel_grid.gd           # Воксельная сетка
│   └── player_controller.gd    # Управление персонажем
├── assets/
│   ├── textures/               # Ассеты (CC0 из Kenney.nl)
│   └── models/                 # 3D-модели (glTF)
└── export_presets.cfg          # Пресеты экспорта (в .gitignore по умолчанию)
```

## API-мост Godot ↔ React

Godot (GDScript) → React через `JavaScriptBridge`:
```gdscript
# apps/game/scripts/api_bridge.gd
extends Node

func _ready():
    JavaScriptBridge.eval("window.postMessage({type:'godot_ready'}, '*')")

func on_player_block_placed(x: int, y: int, z: int, block_type: String):
    var msg = JSON.stringify({
        "type": "block_placed",
        "x": x, "y": y, "z": z, "block_type": block_type
    })
    JavaScriptBridge.eval("window.postMessage(" + msg + ", '*')")
```

React → Godot через `window.postMessage`, слушает в Godot тоже через JavaScriptBridge.

## Целевой размер HTML5 экспорта

- **Минимальная сцена (1 куб):** ≤5 МБ.
- **MVP-сцена «Остров» (~50 blocks, 3 моделей):** ≤15 МБ.
- **v1.0-сцена (несколько миров):** ≤30 МБ, с streaming-ассетами.

## Export preset (шаблон для Sprint 0)

```
[preset.0]
name="HTML5_Web"
platform="Web"
export_path="../web/public/godot/index.html"
ldflags=""

custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""

custom_template/debug=""
custom_template/release=""

variant/extensions_support=false
variant/thread_support=true

vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=true
```

## Integration с React

В `apps/web/public/index.html`:
```html
<iframe
  id="godot-canvas"
  src="/godot/index.html"
  style="width: 100%; height: 600px; border: 0;"
  allow="cross-origin-isolated"
></iframe>
```

Либо embed напрямую как canvas (без iframe) — Godot выдаёт `canvas.js` + `canvas.wasm`, React монтирует canvas-элемент и вызывает runner.

## Sprint 0 A2 acceptance

- [ ] Godot 4 установлен.
- [ ] Проект создан в `apps/game/`.
- [ ] Минимальная сцена (1 куб + ротация) работает.
- [ ] HTML5 экспорт успешен.
- [ ] **Замер:** размер бандла ≤20 МБ (цель PoC).
- [ ] Запуск в Chrome → видимая ротация.
- [ ] JavaScriptBridge работает (hello-world postMessage в React).

## Следующие шаги (Sprint 1+)

- [ ] `voxel_grid.gd` — базовая воксельная сетка (16×16×16).
- [ ] `player_controller.gd` — от первого/третьего лица.
- [ ] Загрузка мира из JSON (пришёл с бэка).
- [ ] Сохранение snapshot обратно на бэк.
