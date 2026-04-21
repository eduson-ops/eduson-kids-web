# @eduson-kids/blockly-python

Кастомные Blockly-блоки + экспорт в Python с mapping в runtime API нашего воксельного мира.

> **Статус:** заглушка. Реализация — Sprint 1-2.

## Что это

- 30+ кастомных блоков Blockly для управления воксельным миром.
- Экспорт Blockly-workspace → Python-код (как у Varwin).
- Этот Python выполняется в Pyodide Web Worker на стороне клиента.

## Категории блоков

**Движение:**
- `move_forward(steps)`, `move_back(steps)`
- `turn_left(degrees)`, `turn_right(degrees)`
- `jump(height)`

**События:**
- `on_start()` — при запуске сцены
- `on_key(key)` — при нажатии клавиши
- `on_collision(other)` — столкновение
- `on_click(target)` — клик по объекту

**Условия:**
- `if_then`, `if_else`
- `while_true`, `repeat_n`

**Мир:**
- `place_block(x, y, z, type)`
- `remove_block(x, y, z)`
- `get_block(x, y, z) → type`

**Переменные и математика:**
- стандартные Blockly math/variables blocks

## Экспорт в Python

Пример Blockly-воркспейса:

```
[when ▸ start]
  [move forward 5]
  [turn right 90°]
  [repeat 4] →
    [place block at (x:0, y:0, z:0) type "stone"]
```

Экспорт:

```python
def on_start():
    move_forward(5)
    turn_right(90)
    for _ in range(4):
        place_block(0, 0, 0, "stone")

on_start()
```

Этот Python выполняется в Pyodide в Web Worker. API-функции (`move_forward`, `place_block`) — наши primitives, мостом в Godot через `postMessage`.

## Структура пакета

```
packages/blockly-python/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts             # Публичный API
│   ├── blocks/              # Определения блоков
│   │   ├── motion.ts
│   │   ├── events.ts
│   │   ├── conditions.ts
│   │   └── world.ts
│   ├── generators/
│   │   └── python.ts        # Blockly → Python
│   └── runtime/
│       ├── pyodide-worker.ts # Web Worker для Pyodide
│       └── api-bridge.ts    # Мост к Godot
└── test/
```

## Dev

```bash
cd packages/blockly-python
npm install blockly pyodide
npm run dev
```

## Локализация

Все labels, тултипы, ошибки — **на русском** для 8-14 лет. Словарь в `src/i18n/ru.json`.

## Sprint 1-2 acceptance

- [ ] 30+ блоков работают в Blockly-workspace.
- [ ] Экспорт в Python — live-panel обновляется real-time.
- [ ] Pyodide исполняет экспортированный Python с вызовами API.
- [ ] Web Worker не блокирует main thread.
- [ ] Ошибки исполнения показываются ребёнку по-русски.
