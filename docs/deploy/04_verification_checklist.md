# KubiK Deploy — Verification Checklist

После выполнения всех шагов (VDS setup → Cloudflare DNS → build & rsync) проверить по списку.

## Этап 1 — VDS health (без Cloudflare)

```bash
# С локалки:
curl http://45.131.40.181/__health
# → ожидаемо: ok
```

```bash
# Login прямо на VDS как kubik:
ssh kubik@45.131.40.181
sudo systemctl status nginx       # active (running)
sudo nginx -t                     # syntax ok
ls -la /var/www/kubik/             # должен быть index.html + assets/ + pyodide/
```

## Этап 2 — DNS прошёл через Cloudflare

```bash
nslookup axsa.tech
# → ipv4 = Cloudflare (104.21.x.x или 172.67.x.x)
# Если ещё 45.131.40.181 — DNS не прокинулся, ждать 5 мин
```

## Этап 3 — HTTPS работает

```bash
curl -I https://axsa.tech/
# → HTTP/2 401 Unauthorized
# → www-authenticate: Basic realm="KubiK demo — request access"
# → x-robots-tag: noindex, nofollow, noarchive, nosnippet
```

## Этап 4 — Basic Auth + index.html

Открыть в браузере **incognito**: https://axsa.tech/

- ✅ Появляется попап Basic Auth
- ✅ Логин: `demo`, пароль: тот что в `01_setup_vds.sh` → `BASIC_AUTH_PASS`
- ✅ После логина грузится KubiK (тёмный фон, логотип, "Войти / Регистрация")

## Этап 5 — API проксируется

В DevTools → Network → выполнить любое действие (логин/прогресс):

- ✅ запросы идут на `https://axsa.tech/api/v1/*`
- ✅ статус 200/401 (не 502/504)
- ✅ нет упоминаний `bba885qd0t1b4ds56ltb.containers.yandexcloud.net` в response headers/HTML

```bash
# Прямая проверка proxy:
curl -u demo:PASS https://axsa.tech/api/v1/health/ready
# → должен вернуть JSON от backend (например {"status":"ok"})
```

## Этап 6 — Studio открывается и Python работает

В браузере: https://axsa.tech/studio

- ✅ Грузится Blockly + 3D-сцена
- ✅ Pyodide подгружается из `/pyodide/` (не из CDN)
- ✅ В DevTools Network видны `/pyodide/pyodide.asm.wasm` ≈ 10 MB, статус 200
- ✅ Можно написать `print("hi")` в Python-режиме и нажать Run — выводится `hi`

## Этап 7 — Service Worker

- ✅ DevTools → Application → Service Workers → активен `sw.js`
- ✅ Cache Storage → есть кеш `workbox-precache-v2-...`

## Этап 8 — Anti-copy

- ✅ `curl -I https://axsa.tech/` показывает `x-robots-tag: noindex, nofollow`
- ✅ `https://axsa.tech/api/v1/health/ready` НЕ требует Basic Auth (для проверки backend клиентом)
- ✅ В исходнике страницы нет упоминаний `yandexcloud.net`
- ✅ Browser → View Source — нет ссылок на старый GitHub Pages

## Этап 9 — Mobile (опционально)

Открыть https://axsa.tech на телефоне:

- ✅ "Установить приложение" (PWA prompt) появляется
- ✅ После установки — иконка KubiK на home screen
- ✅ В standalone режиме UI занимает весь экран

## Этап 10 — Backups работают

```bash
ssh kubik@45.131.40.181
sudo /usr/local/bin/kubik-backup.sh
sudo ls -la /var/backups/kubik/
# → должен появиться kubik-YYYYMMDD-HHMMSS.tar.gz
```

---

## Что выдать Сергею

```
URL:    https://axsa.tech
Login:  demo
Pass:   <BASIC_AUTH_PASS из setup script>

Демо-флоу:
1. Открыть URL → ввести login/pass
2. Главная → "Войти как ученик" (или зарегистрироваться)
3. Перейти в /studio → попробовать Python-блок
4. Перейти в /play → пройти 1-2 пазла
5. Закрыть и снова открыть — PWA сохранил прогресс
```

---

## Если что-то не работает

| Симптом | Причина | Фикс |
|---------|---------|------|
| 522 при открытии URL | UFW не пускает Cloudflare | `sudo ufw status`, открыть 80 |
| 525 SSL handshake | Cloudflare на Full/Strict | переключить на **Flexible** |
| Бесконечный popup Basic Auth | htpasswd сломан | `sudo htpasswd /etc/nginx/.htpasswd demo` |
| 404 на /assets/* | base path в vite неверный | `VITE_TARGET=axsa` обязательно |
| Pyodide 404 | dist/pyodide не сгенерился | `cp -r public/pyodide dist/pyodide` |
| 502 на /api/* | YC backend упал или URL изменился | проверить `curl https://bba88...yandexcloud.net/health/ready` |
| Blank page | Service worker кеширует старый bundle | DevTools → Application → Unregister SW + Clear storage |
| API CORS error | Yandex Cloud не разрешает origin | в backend добавить `axsa.tech` в CORS allowlist |
