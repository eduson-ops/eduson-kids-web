# Cloudflare DNS — ручная настройка

**Зайти:** https://dash.cloudflare.com → выбрать `axsa.tech`

## 1. DNS Records → Add record

Создать **2 A-записи**:

| Type | Name | IPv4 address      | Proxy status      | TTL  |
|------|------|-------------------|-------------------|------|
| A    | `@`  | `45.131.40.181`   | ✅ Proxied (orange) | Auto |
| A    | `www` | `45.131.40.181`  | ✅ Proxied (orange) | Auto |

⚠️ **Обязательно Proxied (оранжевая туча)** — без этого SSL не работает в Flexible mode и origin IP светится в DNS.

## 2. SSL/TLS → Overview

- Encryption mode: **Flexible**

## 3. SSL/TLS → Edge Certificates

Включить:
- ✅ **Always Use HTTPS** = ON
- ✅ **Automatic HTTPS Rewrites** = ON
- ✅ **Minimum TLS Version** = TLS 1.2

## 4. Speed → Optimization (опционально, ускоряет Pyodide WASM)

- ✅ Brotli = ON
- ✅ Auto Minify: HTML/CSS/JS = OFF (vite уже минифицирует)
- ✅ Early Hints = ON

## 5. Security → Settings

- Security Level: **Medium**
- Bot Fight Mode: **ON** (анти-копи)
- Challenge Passage: 30 minutes

## 6. Caching → Configuration

- Browser Cache TTL: **Respect Existing Headers** (vite шлёт правильные cache headers)
- Cache Level: **Standard**

---

## Проверка DNS

После создания записей подождать 1-2 минуты, потом из Git Bash:

```bash
nslookup axsa.tech
# должен вернуть Cloudflare IP (104.21.x или 172.67.x), не 45.131.40.181 — это нормально, прокси
```

## Если что-то не работает

- **522 Connection timed out** — UFW блокирует Cloudflare. Проверить `ufw status` на VDS, должен быть открыт 80/tcp.
- **525 SSL handshake failed** — режим SSL установлен на Full/Strict вместо Flexible. Переключить на **Flexible**.
- **404 на статике** — vite собран с неверным base. Должен быть `VITE_TARGET=axsa` (base = `/`).
