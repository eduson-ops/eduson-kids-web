# Self-hosted Pyodide bundle

Эта папка содержит ядро Pyodide (CPython → WebAssembly), которое раньше
тянулось с `https://cdn.jsdelivr.net/pyodide/...`. Сменили на self-host
после F-02: jsdelivr периодически блокировали отелей/конференций Wi-Fi —
демо Studio падало.

## Версия

`v0.26.2` (см. `pyodide.mjs`, `pyodide-lock.json`).

## Файлы

- `pyodide.mjs` / `pyodide.js` — JS-loader (entry).
- `pyodide.asm.js` / `pyodide.asm.wasm` — CPython runtime.
- `python_stdlib.zip` — стандартная библиотека Python.
- `pyodide-lock.json` — манифест пакетов (для `loadPackage`, мы пока не
  используем).
- `package.json` — npm-метаданные апстрима.

## Обновление

```bash
node scripts/sync-pyodide.mjs
# или с override:
PYODIDE_VERSION=0.27.0 node scripts/sync-pyodide.mjs
```

Скрипт скачивает только core (~14 MB). Если когда-нибудь добавим
`loadPackage('numpy')` — пропишем имя в `EXTRA_PACKAGES` внутри скрипта,
он подтянет .whl и зависимости из lock-файла.

## Где это грузится

`src/lib/pyodide.worker.ts` — `loadPyodide({ indexURL: PYODIDE_BASE_URL })`,
где `PYODIDE_BASE_URL = import.meta.env.BASE_URL + 'pyodide/'`. Работает
для всех таргетов: dev (`/pyodide/`), ghpages (`/eduson-kids-web/pyodide/`),
capacitor (`./pyodide/`).
