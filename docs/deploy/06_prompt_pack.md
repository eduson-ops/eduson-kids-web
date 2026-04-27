# Pack готовых промптов для деплоя

Все промпты ниже — **копируй и вставляй** во вторую вкладку Claude/Cursor (после того как вставил `05_system_prompt_deploy_agent.md`).

Промпты разбиты по фазам деплоя. Каждый — самодостаточный.

---

## ▼ ФАЗА 1 — Cloudflare DNS

### P1.1 — Проверить что DNS прошёл

```
Проверь что DNS axsa.tech правильно указывает через Cloudflare на 45.131.40.181.

Дай 3 команды для Git Bash на Windows:
1. nslookup проверка
2. curl -I проверка через HTTPS
3. dig +short проверка

Если возвращает Cloudflare IP (104.21.x или 172.67.x) — это правильно (Proxied).
Если возвращает 45.131.40.181 — DNS-only, надо переключить на Proxied (orange cloud).
```

### P1.2 — Cloudflare SSL диагностика

```
Я открыл https://axsa.tech и получил ошибку 525 SSL handshake failed.

Объясни в 3 предложениях что это и какой режим SSL надо выставить в Cloudflare для нашей конфигурации (на origin сертификата нет, только nginx на порту 80, через Cloudflare).

Дай точный путь в Cloudflare UI как переключить.
```

### P1.3 — Включить дополнительную защиту

```
В Cloudflare для axsa.tech включи мне через UI:
- Bot Fight Mode
- Browser Integrity Check
- Hotlink Protection (опционально)
- Country block (если это нужно для anti-copy — спроси меня)

Дай пошаговый путь в UI: Security → ... → Settings.
```

---

## ▼ ФАЗА 2 — VDS setup

### P2.1 — Скрипт упал на середине

```
Скрипт 01_setup_vds.sh на VDS упал на этапе [N/9] [название этапа]. 
Вот вывод последних 30 строк:

[вставь сюда вывод]

Объясни что пошло не так и дай команды чтобы:
1. Откатить изменения этого этапа (если что-то сломалось)
2. Продолжить с этого этапа без перезапуска всего скрипта
```

### P2.2 — nginx -t выдаёт ошибку

```
nginx -t на VDS возвращает:

[вставь полный вывод nginx -t]

Файл /etc/nginx/sites-available/kubik был сгенерирован скриптом 01_setup_vds.sh.

Найди ошибку в конфиге и дай sed-команду или patch чтобы исправить.
```

### P2.3 — Проверить что VDS правильно настроен

```
Проверь что VDS 45.131.40.181 правильно настроен.

Дай мне команды для SSH (я уже залогинен как root):
1. nginx active и слушает 80 порт
2. UFW открывает только 22/80/443
3. fail2ban активен и видит sshd jail
4. /etc/nginx/.htpasswd существует и не пустой
5. /var/www/kubik/ существует с правильными правами (kubik:www-data 755)
6. cron бэкап работает: ls /etc/cron.d/ должен показать kubik-backup
7. Из VDS можно достучаться до YC backend: curl -I https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net/health/ready

Сделай это одной командой через && чтобы я скопировал и вставил.
```

### P2.4 — Сгенерить SSH ключ для безпарольного rsync

```
Я хочу настроить безпарольный SSH с моего Windows ноута на VDS для пользователя kubik (чтобы rsync не спрашивал пароль).

Дай команды для Git Bash:
1. Сгенерить SSH ключ ed25519 (если ещё нет ~/.ssh/id_ed25519)
2. Скопировать pub key на VDS (через ssh-copy-id или вручную через ssh + cat)
3. Проверить что вход без пароля работает
4. Опционально — отключить password auth для kubik в /etc/ssh/sshd_config
```

---

## ▼ ФАЗА 3 — Build & Deploy

### P3.1 — Build падает с ошибкой TypeScript

```
Я запустил bash artefacts/deploy/02_local_build_deploy.sh и получил ошибку TypeScript:

[вставь полный stderr]

Контекст: 
- В tsconfig.app.json strict mode закомментирован
- Все unused imports почищены (R20)
- node_modules переустановлены через npm install --legacy-peer-deps

Найди источник и дай патч.
```

### P3.2 — rsync не может подключиться

```
rsync падает с ошибкой:

[вставь stderr]

Контекст:
- VDS = 45.131.40.181
- User = kubik (создан через 01_setup_vds.sh)
- Я в Git Bash на Windows 11
- Из ssh kubik@45.131.40.181 могу залогиниться

Что не так и как починить?
```

### P3.3 — Проверить что dist/ собрался правильно

```
После build я хочу проверить что dist/ собрался правильно для axsa.tech.

Дай команды для Git Bash которые проверят:
1. dist/index.html существует и содержит "axsa" в base path или JS bundles ссылаются на /assets/ а не на /eduson-kids-web/assets/
2. dist/pyodide/ существует и содержит pyodide.asm.wasm ~10 MB
3. dist/sw.js существует (service worker)
4. dist/manifest.webmanifest содержит правильный start_url ("/")
5. Общий размер dist/ не больше 50 MB
6. Нет .map файлов (sourcemap = hidden)
```

### P3.4 — Проверить что фронт открылся в браузере

```
Я закончил deploy. Открыл https://axsa.tech в incognito. Получил [опиши что видишь — popup/blank/error/working].

Если работает — что ещё проверить?
Если не работает — какие F12 logs тебе нужны для диагностики?
```

---

## ▼ ФАЗА 4 — Backend integration

### P4.1 — CORS на YC backend

```
Из браузера на https://axsa.tech/ запросы на /api/v1/auth/login падают с CORS error:

[вставь error из console]

Backend на YC (https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net) развёрнут через GitHub Actions при push в deploy/backend.

Подскажи:
1. Где в NestJS backend находится CORS config (примерно — main.ts с app.enableCors() или в env var CORS_ORIGINS)
2. Что добавить (точная строка) чтобы axsa.tech работал
3. Как задеплоить — через push в deploy/backend? Если да, какие именно файлы я должен изменить
```

### P4.2 — API возвращает 502 через nginx proxy

```
curl https://axsa.tech/api/v1/health/ready — возвращает 502 Bad Gateway.

curl напрямую на backend — работает:
curl https://bba885qd0t1b4ds56ltb.containers.yandexcloud.net/health/ready
→ {"status":"ok"}

nginx error log на VDS:
[вставь tail -50 /var/log/nginx/error.log]

Что сломалось? Дай патч для /etc/nginx/sites-available/kubik.
```

### P4.3 — DB migration для Sferum

```
Мне нужно удалить старые Sferum-строки в YC PostgreSQL backend перед демо. После R14 эти строки имеют password_hash вида "__sferum_passthrough_<pin>__" — их нельзя оставлять (security risk).

Контекст:
- DB на YC Managed PostgreSQL
- Schema в backend/src/entities/user.entity.ts
- Возможно есть FK на progress, xp, classes, lessons

Дай:
1. Безопасный SELECT чтобы посмотреть сколько таких строк есть
2. Безопасный SELECT чтобы проверить есть ли FK с этих user_id
3. Если FK есть — стратегия (soft delete? CASCADE? UPDATE password_hash на NULL и flag inactive?)
4. Если FK нет — DELETE
5. Команда подключения через yc cli или psql напрямую
```

---

## ▼ ФАЗА 5 — Анти-копи + secrets

### P5.1 — Проверка что URL не индексируется

```
Я хочу убедиться что https://axsa.tech не попадёт в Google.

Проверь:
1. curl -I https://axsa.tech/ должен показать X-Robots-Tag: noindex
2. /robots.txt должен быть 401 (Basic Auth) или 200 с Disallow: /
3. В Cloudflare нет Always Online cache (мог бы засветить контент в Wayback)
4. Yandex/Google Search Console не разрешали верификацию для axsa.tech

Дай команды и скажи что ещё стоит закрыть.
```

### P5.2 — Удалить пароли из bash history

```
Я в SSH на VDS как root запустил скрипт с паролями (NEW_ROOT_PASS, BASIC_AUTH_PASS, DEPLOY_USER_PASS) внутри.

Подскажи команды для:
1. Очистить .bash_history root
2. Очистить /var/log/auth.log от строк с паролями  
3. Запретить логирование паролей в plain в logrotate
4. Опционально — отключить root SSH вообще (только sudo через kubik)
```

---

## ▼ ФАЗА 6 — Smoke test перед демо

### P6.1 — Полный smoke test

```
Перед демо Сергею в среду я хочу пройти полный smoke test.

Сгенерируй чеклист из 15-20 пунктов которые я могу прокликать в браузере на https://axsa.tech за 10 минут. Включи:
- Авторизация (создание ученика + родителя + школы)
- Студия (Blockly → Python → run code → see output)
- Тренажёр (выбрать пазл → пройти → засчитался)
- Hub (открыть → Niksel реагирует → ачивка)
- Site Constructor (создать страницу → preview)
- Mobile (PWA install prompt → standalone open)
- Network (Service Worker offline → возврат в онлайн → синхронизация)
- Edge cases (refresh страницы, выход из аккаунта, неверный пароль)

Каждый пункт — одно действие + ожидаемый результат.
```

### P6.2 — Если что-то падает на демо — бэкап-план

```
В среду на демо в реальном времени Сергей открыл axsa.tech, и [опиши что произошло — page won't load / API timeout / Pyodide error / etc].

Дай 60-секундный backup-план. Что показать вместо?

Контекст:
- Старый GH Pages: https://eduson-ops.github.io/eduson-kids-web/ (если жив, может быть устаревшая версия без 35 commits)
- Локальный dev: cd src && npm run dev → http://localhost:5173 (если ноут с интернетом)
- Видео-демо записаны? — нет, не успели

Что ещё можно показать чтобы Сергей не ушёл с пустыми руками?
```

---

## ▼ ФАЗА 7 — После демо

### P7.1 — Снятие frontend-сайта после NDA окна

```
Демо прошло, NDA-окно с Сергеем закрылось. Теперь нужно временно закрыть https://axsa.tech но сохранить инфраструктуру.

Дай команды чтобы:
1. Положить https://axsa.tech на maintenance page (например HTTP 503 + красивая страница "До свидания")
2. Сохранить текущий dist/ как бэкап на VDS
3. Опционально — потушить VDS на паузу в Selectel (как? через панель?)
4. Удалить axsa.tech из Cloudflare DNS (или поставить DNS-only временно)
```

### P7.2 — Перевести в production-grade

```
После демо мы хотим перевести axsa.tech (или новый домен) в production-grade.

Что доделать:
1. Включить strict TypeScript обратно (там 681 errors, надо чинить)
2. Удалить shadow backend src/apps/api (R18)
3. Реальный SSL на origin (Let's Encrypt + certbot, переключить Cloudflare на Full Strict)
4. Sentry / монитор ошибок
5. Backup БД ежедневно (сейчас только nginx config)
6. Тесты в CI на pre-deploy

Дай roadmap с приоритетами и оценкой времени по каждому пункту.
```

---

## Шорткаты — частые однострочники

```
# Перезагрузить nginx после правки конфига
ssh kubik@45.131.40.181 "sudo nginx -t && sudo systemctl reload nginx"

# Посмотреть свежие логи nginx
ssh kubik@45.131.40.181 "sudo tail -100 /var/log/nginx/error.log"

# Посмотреть что ругает fail2ban
ssh root@45.131.40.181 "sudo fail2ban-client status sshd"

# Проверить что bin'ы на VDS не сломаны (в отличие от ноута)
ssh kubik@45.131.40.181 "which nginx && which node || echo nodejs не нужен"

# Bandwidth check
ssh kubik@45.131.40.181 "vnstat || ifstat -t -i eth0 5 1"

# Diskspace check (40 GB total)
ssh kubik@45.131.40.181 "df -h /"

# Hot reload только index.html (без полного rsync)
scp dist/index.html kubik@45.131.40.181:/var/www/kubik/

# Force-clear browser cache (отдать клиенту)
# В Cloudflare: Caching → Purge Cache → Purge Everything
```

---

## Edge cases — что может пойти не так

| Симптом | Команда диагностики | Промпт-шаблон |
|---------|---------------------|---------------|
| 522 Connection timed out | `ssh root@45.131.40.181 'ufw status'` | P1.2 |
| 525 SSL handshake | curl flags + Cloudflare SSL mode | P1.2 |
| 502 Bad Gateway | `tail -50 /var/log/nginx/error.log` | P4.2 |
| 401 после логина | `cat /etc/nginx/.htpasswd` | P2.2 |
| 404 на /assets/ | `ls /var/www/kubik/assets/` + grep base path в dist/index.html | P3.3 |
| Pyodide CORS error | DevTools Network tab → копировать request curl | P5.1 |
| PWA не устанавливается | DevTools Application → Manifest validation | — |
| Service worker зависает | DevTools Application → Service Workers → Unregister | — |
| Three.js не рендерит | WebGL2 support: `curl https://get.webgl.org` в этом браузере | — |

---

## Ссылки на исходные артефакты

Все ниже лежит в `c:/Users/being/Desktop/R&D/artefacts/deploy/`:

- `README.md` — порядок действий
- `01_setup_vds.sh` — VDS setup
- `02_local_build_deploy.sh` — локальный build + rsync
- `03_cloudflare_dns.md` — Cloudflare UI
- `04_verification_checklist.md` — post-deploy чеклист
- `05_system_prompt_deploy_agent.md` — system prompt для второй вкладки
- `06_prompt_pack.md` — этот файл
