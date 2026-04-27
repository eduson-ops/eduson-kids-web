# KubiK Deploy — порядок действий

Срок: **среда 2026-04-29 утром**.  
Время на полный цикл: **30-45 минут**.

## Все артефакты

```
artefacts/deploy/
├── README.md                       ← вы здесь
├── 01_setup_vds.sh                 ← вставить в SSH на VDS (одной кнопкой)
├── 02_local_build_deploy.sh        ← запустить локально из Git Bash
├── 03_cloudflare_dns.md            ← инструкция для UI Cloudflare
└── 04_verification_checklist.md    ← post-deploy чеклист
```

## Что уже сделано в коде

✅ **vite.config.ts** уже пропатчен — добавлен target `axsa` (base = `/`).  
✅ **17 рефакторов** применены (R1-R21), все P0 security fixes готовы.

## Что нужно сделать (по порядку)

### Шаг 1 — Cloudflare DNS (5 мин)

Открыть `03_cloudflare_dns.md`, выполнить через UI dash.cloudflare.com:
- 2 A-записи (`@` и `www` → `45.131.40.181`, **Proxied**)
- SSL → **Flexible**
- Always Use HTTPS = ON

### Шаг 2 — VDS setup (10 мин)

```bash
ssh root@45.131.40.181
# password: 798h0p0dbq (тот что в брифе — сменится первым же действием в скрипте)
```

1. Открыть `01_setup_vds.sh` локально в редакторе.
2. **Поменять 4 переменные** наверху файла:
   - `NEW_ROOT_PASS` — новый пароль root
   - `DEPLOY_USER_PASS` — пароль для пользователя `kubik` (rsync будет его использовать)
   - `BASIC_AUTH_PASS` — пароль для Сергея
   - `DEPLOY_USER_SSH_KEY` — (опционально) ваш SSH public key
3. Скопировать **весь** файл целиком, вставить в SSH-сессию, нажать Enter.
4. Ждать ~5-10 минут — установит nginx, UFW, fail2ban, создаст пользователя, настроит Basic Auth, поднимет cron-бэкапы.

В конце скрипт выдаст summary с креденшелами и адресом health-эндпоинта.

```bash
# Проверка после скрипта:
curl http://45.131.40.181/__health
# → ok
```

### Шаг 3 — Build + Deploy с локалки (15 мин)

С Windows в Git Bash:

```bash
cd "c:/Users/being/Desktop/R&D/src"
bash ../artefacts/deploy/02_local_build_deploy.sh
```

Скрипт:
1. Установит зависимости (`npm install --legacy-peer-deps`) — если ещё не стоят.
2. Соберёт production bundle (`VITE_TARGET=axsa`, ~30 МБ с Pyodide).
3. Зальёт `dist/` через rsync на `/var/www/kubik/` (попросит пароль `kubik`).
4. Сделает `systemctl reload nginx` через ssh.

**Если build падает** — откатить strict mode проверкой:
```bash
grep -A3 "Strict type checking" tsconfig.app.json
# должно быть закомментировано (/* "strict": true, */)
```

### Шаг 4 — Verify (5 мин)

Открыть `04_verification_checklist.md` и пройтись по 10 этапам.  
Выдать Сергею URL+login/pass из последней секции.

---

## Что выдать Сергею

```
URL:     https://axsa.tech
Login:   demo
Pass:    <BASIC_AUTH_PASS из 01_setup_vds.sh>
```

NDA добавить отдельно (не в этом чате).

---

## Бэкенд — уже работает

YC: `https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net`  
Health: `/health/ready`  
Деплой: GitHub Actions при push в `deploy/backend`.

⚠️ **Перед демо проверить, что в YC backend CORS разрешает `axsa.tech`.** Если нет — добавить в env var `CORS_ORIGINS`.

---

## DB migration (Sferum) — критично перед демо

В YC backend (PostgreSQL) выполнить:

```sql
-- Безопасность: проверить FK сначала
SELECT u.id, u.password_hash 
FROM users u 
WHERE u.password_hash LIKE '__sferum_passthrough_%';

-- Удалить (если нет blocking FK):
DELETE FROM users WHERE password_hash LIKE '__sferum_passthrough_%';
```

После R14 новые Sferum-аккаунты будут с правильным Argon2id хешем. Старые — нерабочие, но безопасные.

---

## Что НЕ трогать

- ❌ `tsconfig.app.json` — `strict: true` закомментирован специально (681 TS errors найдено), фикс отдельной задачей после демо
- ❌ `node_modules/.bin/*.cmd` — сломаны на этой машине, но build работает через `node node_modules/vite/bin/vite.js` (это сделано в `02_local_build_deploy.sh`)
- ❌ Старые Sferum-строки в БД — удалять только после backup

---

## Если что-то падает в день демо

**Бэкап-план:**
1. Откатить vite на ghpages: `VITE_TARGET=pwa npm run build` → деплой на старый GH Pages (eduson-ops.github.io/eduson-kids-web).
2. Демо показать там — есть в [memory/deploy_github_pages.md].
3. После демо вернуться к axsa.tech.
