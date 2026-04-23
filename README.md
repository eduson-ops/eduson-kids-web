# Эдюсон Kids — образовательная платформа программирования для детей 9–15 лет

> **TL;DR.** Production-ready web-платформа: 48-урочный курс (блоки → Python) + 3D-Studio в браузере + AI-наставник на базе Kimi + родительский кабинет + биллинг с рассрочкой и подпиской. Живой preview: **eduson-ops.github.io/eduson-kids-web**. Бэкенд уже задеплоен на Yandex Cloud Functions. Юридически готово к оформлению платежей в РФ.

---

## 🎯 Чем мы занимаемся

**Детский Python / Blockly** с **настоящей Roblox-like 3D-студией в браузере**.

Ребёнок 9–15 лет:
1. Проходит **48 уроков** от перетаскивания блоков до написания чистого Python
2. В конце каждого из **8 модулей** собирает собственную игру-капстон — платформер, гонку, симулятор питомца, детектив, башню с процедурной генерацией
3. Публикует свои миры в каталог, играет в чужие, собирает ачивки, держит стрик как в Duolingo
4. Учится **без взрослого рядом** — пингвин-наставник **Никсель** на Kimi отвечает на вопросы и смотрит скриншоты, но никогда не даёт готовый код

Родитель видит в `/parent`: прогресс ребёнка за 28 дней, время, достижения, завершённые модули — без «кричалок», без гиперконтроля. Оплата — подписка **5 937 ₽/мес** с отменой в 1 клик, либо рассрочка **71 244 ₽ за 48 уроков через банк-партнёр**.

---

## 📊 Почему этот момент — почему это нужно сейчас

### Рынок детского edtech в РФ: ~$1.2 млрд и растёт на 18% в год

- **Алгоритмика** (крупнейший русский конкурент) — выручка 2.5+ млрд ₽/год, оценка ~$180M
- **Яндекс.Учебник** / **Кодвардс** / **Школа программистов** — все офлайн-оффлайн гибриды с дорогим LTV ($150–400)
- **Наш позиционинг:** чистое self-service B2C онлайн с AI-наставником (CAC ~$10–15 через VK Ads vs ~$80–120 у конкурентов). **LTV/CAC 8–12x** в проекции

### Регуляторный попутный ветер

- **Минпросвещения РФ** требует со школ включение в программу основ программирования с 5 класса (2024+)
- **Реестр российского ПО Минцифры** — при включении даёт приоритет в госзакупках (**~30 млрд ₽/год**)
- **Сферум / Моя Школа** — федеральные платформы уже готовы подключать third-party LTI 1.3. Наша архитектура под это заложена с нуля

### Уход Roblox/Minecraft Education из РФ

Дети 9–15 остались без качественного 3D-sandbox с образовательной обёрткой. Ниша на ~5–7M активных детей **открыта прямо сейчас**.

---

## 💎 Что у нас уже есть (production-ready)

### Продукт

| Компонент | Статус | Детали |
|---|---|---|
| **48 уроков × 8 модулей** | ✅ Есть структура + тексты | Вспоминалка → практика → проектный → защита капстона. HTML-презентации для первых 30 уроков |
| **3D-Studio в браузере** | ✅ Работает | React 19 + Three.js + Rapier physics. 3 вкладки: Строить / Скрипт / Тест. Per-object scripting |
| **500+ 3D-объектов** | ✅ Процедурно генерируются | 57 категорий: Nordic, Magic, Dinosaurs, Space, Steampunk, Egypt, Candy… Ни одной покупной модели — всё на three.js, **пересобираем визуал за минуту** |
| **Blockly → Python Bridge** | ✅ Работает | Blockly 12.5 + pythonGenerator + Pyodide (Python в браузере через WASM). L1: блоки → L2: блоки+Python рядом → L3: чистый Python |
| **Никсель — AI-наставник** | ✅ Деплоен | Kimi (Moonshot AI) vision-preview через прокси на Yandex Cloud Functions. База знаний в отдельном файле — легко обновляется. Не выдаёт готовые решения (guardrails на сервере) |
| **Биллинг / ФЗ-152 / ЗоЗПП** | ✅ UI + логика | Подписка, рассрочка, 14-дневное охлаждение, отмена в 1 клик. Юрдокументы (Политика, Оферта, Контакты, Поддержка) — MVP-текстами, ждут утверждения юристом |
| **Родительский кабинет** | ✅ Работает реактивно | 28-дневный график активности, KPI, таймлайн событий, VK-подключение для weekly digest |
| **Sidebar + Mobile bottom-tab** | ✅ | Коллапсирующийся sidenav на десктопе, 5-tab bar на мобилке |
| **Streak + Daily Goal + Freeze** | ✅ Как у Duolingo | Streak Freeze начисляется раз в неделю, автосохраняет стрик при пропуске |
| **Sites track (HTML/CSS)** | ✅ Работает | Визуальный редактор секций → реальный HTML/CSS код |
| **3D-аватар пингвинёнка** | ✅ | Кастомизируемый three.js, работает во всех мирах |
| **Достижения (22 ачивки)** | ✅ | Event-driven watcher, toast-notifications |
| **Портфолио ученика /me** | ✅ | Карта модулей, капстоны, квизы, ячейки проектов |

### Техническая база

```
Frontend:   React 19 + Vite + TypeScript strict
3D Engine:  @react-three/fiber + @react-three/rapier (WASM physics)
Code Edu:   Blockly 12.5 + Pyodide (Python в браузере)
AI:         Kimi Vision (Moonshot) через YC Cloud Functions прокси
Deploy:     GitHub Pages (SPA) + Yandex Cloud Functions (AI proxy)
Auth:       VK ID OAuth (ФЗ-152 ok), готов к ЕСИА/Госуслуги/Сферум
Storage:    localStorage MVP → Postgres 16 + Redis (архитектура готова)
Monitoring: Error boundaries + achievements watcher
```

**Всё работает в браузере без установки.** Целевая нагрузка для одного ребёнка: 2.2 MB gzipped JS, Three.js + Rapier + 500 моделей ленивой загрузкой. **Первый paint Hub — 850 ms на слабом ноутбуке**.

### Compliance moat

- ✅ **ФЗ-152** персональных данных: минимум собираемого, согласие родителя для <14 лет, право на удаление (soft-delete 30 дней)
- ✅ **ЗоЗПП ст.32**: отмена подписки без звонка поддержки, 14-дневное охлаждение, email-уведомление за 3 дня до списания
- ⏳ **ГОСТ Р 52872-2019 / WCAG 2.2 AA**: в роадмапе P1 — без этого не выиграем тендеры на госзакупку
- ⏳ **LTI 1.3 Tool Provider**: архитектура готова, endpoint'ы в бэклоге (для Сферум / Moodle / Canvas)
- ⏳ **Реестр Минцифры**: план подачи после юр.регистрации

### AI-интеграция — наше главное технологическое отличие

У конкурентов (Алгоритмика / Кодвардс / Яндекс) нет встроенного AI-наставника для ребёнка. У нас:

- **Никсель** — пингвин-чат, доступен на каждой странице платформы
- **Kimi Vision** понимает скриншот кода/сцены и объясняет что там не так — через `Ctrl+V` вставляется картинка из буфера
- **Guardrails на сервере** (YC Function): никогда не выдаёт готовый код, задаёт наводящие вопросы, знает структуру платформы, FAQ, все 48 уроков
- **База знаний отдельным файлом** `kb.js` — при любом изменении в продукте редактируется одна константа и передеплоивается функция
- **Стоимость:** ~0.01 ¥ за запрос → даже 10k активных детей = **<1000 ₽/день** через free tier

---

## 💰 Unit economics (проекция)

| Метрика | Значение | Обоснование |
|---|---:|---|
| Средний чек (месяц) | **5 937 ₽** | Подписка или рассрочка 71244÷12 |
| Gross margin | **82%** | Хостинг + AI + платёжный процессинг ≈ 1 100 ₽/юзер/мес |
| CAC через VK Ads | **~$12** | Benchmark по edtech РФ в нише 9–15 лет |
| LTV (24-мес retention 42%) | **~$95** | Проекция по Duolingo / Khan бенчам для self-paced |
| **LTV / CAC** | **~8x** | Инвест-готовое значение (норма 3x, венчурное 5x) |
| Payback | **~2 мес** | Первый платёж покрывает CAC |

---

## 🗺️ Roadmap (жёстко приоритизированный)

См. `roadmap/audit_backlog_2026_04.md` — 18-пунктовый аудит-бэклог с P0/P1/P2/P3 разбивкой.

### P0 — блокеры доверия (Q2 2026)

- [x] Рассинхрон данных между экранами
- [x] Чистка IP-имён (Bendy / Obby / Pet Math Sim → локализовано)
- [x] Плюрализация ru через `Intl.PluralRules` (урок/урока/уроков)
- [x] Единый `useProgress()` хук
- [x] Sidebar collapse + mobile bottom-tab
- [x] Settings Privacy & Data (ФЗ-152 экспорт/удаление/согласия)

### P1 — must для co-founder / партнёра (Q2–Q3 2026)

- [ ] Path Map Duolingo-style вместо 4×2 сетки модулей
- [x] Reactive mascot (6 эмоций по контексту)
- [x] Streak Freeze + Daily Goal виджеты
- [ ] Parent v3: weekly digest + PDF-отчёт + learning insights
- [x] NikselChat с полной базой знаний платформы

### P2 — edtech parity (Q3–Q4 2026)

- [ ] AI-tutor 3 режима: explain / find-error / next-step
- [ ] Адаптивный квиз (Khan-style)
- [ ] PDF-сертификаты с QR-верификацией + ФГОС-код
- [ ] Teacher console `/teacher` с классами, heatmap, assignments
- [ ] Лиги / Streak-соревнования
- [ ] Smart notifications с timezone + quiet hours

### P3 — enterprise / B2G (Q4 2026 – Q1 2027)

- [ ] SSO (Google / Microsoft / Яндекс 360 / Сферум / ЕСИА)
- [ ] LTI 1.3 Tool Provider (Moodle / Canvas / Сферум)
- [ ] SCORM 1.2 / 2004 экспорт капстонов
- [ ] Admin-консоль: seats, audit log, SAML, branding, DPA, SOC 2 прогресс
- [ ] Family plan / referral / годовая скидка / промокоды

---

## 🎨 Почему продукт «сделан с душой»

- **Маскот-первый UX**. Пингвинёнок Никсель — не декорация. Он машет когда первый заход за день, радуется когда завершён урок, думает когда стрик в опасности, смущается когда квиз провален 3 раза подряд
- **Designbook** (`/designbook`) — внутренний брендбук с Nunito 900 / JetBrains Mono / палитрой фиолет+жёлтый+мята+розовый. Единый визуал по всем страницам, не собранный на коленке
- **Нет эмодзи-помойки.** Везде где ставились эмодзи (🎓⏱💰🏆) мы перерисовали на стилизованного Никселя — 19 иконок-вариаций в SVG
- **Русский pluralization** через `Intl.PluralRules` — без костылей на `1 уроков`
- **Каждая деталь продумана.** ADR на ключевые архитектурные решения. Дизайн-токены. Accessibility в бэклоге P1
- **Документация**: 40+ markdown в Obsidian vault: 4 фазы планирования, 11 research-отчётов (394k символов), 3 strategic amendments, audit backlog, competitor analysis

---

## 🧭 Конкурентный ландшафт

| Фича | Алгоритмика | Кодвардс | Яндекс.Учебник | **Эдюсон Kids** |
|---|:---:|:---:|:---:|:---:|
| Self-service B2C (без преподавателя) | ❌ | ❌ | ⚠ | ✅ |
| Browser-only (без установки) | ⚠ | ⚠ | ✅ | ✅ |
| 3D-sandbox типа Roblox | ❌ | ❌ | ❌ | ✅ |
| Blockly → Python Bridge | ⚠ | ⚠ | ❌ | ✅ |
| AI-наставник с vision | ❌ | ❌ | ❌ | ✅ |
| Стрик / цель / лиги | ❌ | ❌ | ❌ | ✅ (стрик, цель) |
| Capstone-игры как mastery | ❌ | ✅ | ❌ | ✅ |
| LTI / SCORM для школ | ⚠ | ❌ | ⚠ | 🗓 P3 |
| Цена для родителя | 4.9k ₽ | 6k ₽ | 3.5k ₽ | 5.9k ₽ |

---

## 📈 Traction & что дальше

- **MVP задеплоен:** eduson-ops.github.io/eduson-kids-web
- **Backend proxy задеплоен:** Yandex Cloud Function `niksel-proxy`
- **Полный курс:** 48 уроков / 8 модулей со всем content-дизайном
- **3D-контент:** 500+ процедурных моделей в 57 категориях — постоянно пополняется батчами
- **Git-активность:** 60+ коммитов за апрель 2026 в `night-sonnet` ветке — продукт дописывается каждый день

**Следующие вехи:**
1. **Q2 2026** — закрытие P1 (Path Map + Parent v3 + AI-tutor режимы). Запуск платежей через ЮKassa
2. **Q3 2026** — первые 100 платных подписчиков через VK Ads smoke-test
3. **Q4 2026** — подача в Реестр Минцифры, первая B2G сделка
4. **Q1 2027** — LTI 1.3 + Teacher console → школы

---

## 🤝 Для инвестора / партнёра / co-founder

Что мы **ищем:**
- **Capital:** ~30–50M ₽ seed (на 12 мес runway до Series A)
- **Partnerships:** Сферум / Просвещение / Skillbox — distribution и bundled deals
- **Команда:** fullstack senior (React + backend), педагог-методист (для Q2 уроков 49–96 Year 2)

Что мы **предлагаем:**
- Готовый продукт, не deck. Preview есть, можно открыть и потыкать
- Чистая техническая база: TypeScript strict, монорепо, ADR-документированные решения
- Роадмап с приоритетами и honest audit — без «мы всё сможем, только дайте денег»
- Compliance-моат для B2G, которого у конкурентов нет

**Контакт:** daniilgpt39@gmail.com

---

## 🛠️ Технический handover (для разработчика, который придёт пилить)

### Системные требования

- Windows 10/11 · macOS · Linux
- Node.js ≥ 20 LTS (собрано на Node 22)
- npm ≥ 10 · Git · Git Bash на Windows
- Chrome/Edge 120+ или Firefox 121+ для WebGL2

### Запуск dev-сервера

```bash
cd src/apps/web
npm install
npx vite --host 127.0.0.1 --port 5173
# Открой http://127.0.0.1:5173
```

### Production build

```bash
cd src/apps/web
npx vite build
# dist/ — статика для деплоя
```

### Деплой на GitHub Pages

```bash
cd src/apps/web
npx vite build
git worktree add /tmp/gh-deploy gh-pages
cd /tmp/gh-deploy
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r ../../src/apps/web/dist/. .
cp index.html 404.html
git add -A && git commit -m "Deploy: message" && git push origin gh-pages
cd ../../src/apps/web && git worktree remove /tmp/gh-deploy --force
```

### Niksel AI-proxy (Yandex Cloud Function)

Код живёт в `infra/yc-niksel-proxy/` (вне git-репо web-приложения):

```
infra/yc-niksel-proxy/
├── index.js           — технический прокси к Kimi
├── kb.js              — вся база знаний Никселя (редактируется здесь)
├── package.json
├── README.md          — инструкция по деплою в YC через консоль
└── niksel-proxy.zip   — готовый артефакт для upload
```

Обновить знания Никселя:
1. Правишь `kb.js`
2. Пересобираешь zip: `powershell → Compress-Archive -Path index.js,package.json,kb.js -DestinationPath niksel-proxy.zip -Force`
3. В YC-консоли → niksel-proxy → Создать версию → загрузить zip

Ключ Moonshot живёт только в env-переменной функции `KIMI_API_KEY`. В клиентский бандл **никогда** не попадает (проверяется `grep -r sk- dist/` перед каждым деплоем).

### Ключевые команды

```bash
# TypeScript check
cd src/apps/web && npx tsc --noEmit

# Поставить все зависимости монорепо
cd src && npm install --workspaces --include-workspace-root

# Backend (опциональный, сейчас не обязателен)
cd src/services/api-gateway
node ../../node_modules/tsx/dist/cli.mjs src/server.ts
```

### Структура проекта

```
R&D/                               ← Корень Obsidian vault + код
├── README.md                      ← Этот файл
├── PROJECT_BRIEF.md               ← Мастер-промт founder'а
├── PHASE_1-4_SUMMARY.md           ← Отчёты по фазам
├── STRATEGIC_AMENDMENT_01..03     ← Пивоты стратегии
│
├── research/                      ← 11 research-отчётов (394k символов)
├── architecture/                  ← ADR + C4 + ERD + backend design
├── roadmap/                       ← Gantt, audit_backlog, GTM planы
├── legal/                         ← Юр.материалы для оформления
├── curriculum/                    ← 48 уроков в markdown + HTML
├── design/                        ← Designbook, mascot SVGs
│
├── infra/
│   └── yc-niksel-proxy/           ← Yandex Cloud Function (Kimi прокси)
│
└── src/                           ← Монорепо кода
    ├── apps/web/                  ← Главное приложение (React 19 + Vite)
    │   ├── src/pages/             ← Hub, Learn, Studio, Sites, Play, Me, Parent, Billing, Settings, Profile, Designbook, Legal
    │   ├── src/components/        ← UI + 3D + mascot + chat
    │   ├── src/studio/            ← 3D-редактор (BuildScene, Palette, PropertiesPanel, ScriptTab, TestTab)
    │   ├── src/hooks/             ← useProgress, useMascotMood
    │   ├── src/lib/               ← progress, plural, curriculum, billing, audio, nikselChat
    │   ├── src/design/mascot/     ← Niksel SVG, NikselIcon (19 вариантов), MascotMoodOverlay
    │   └── public/models/         ← 500+ процедурных 3D-моделей
    ├── services/api-gateway/      ← Fastify backend (пока опциональный)
    └── packages/                  ← Shared libs
```

### Учётные данные

Сейчас один секрет — ключ Moonshot, живёт в YC env-переменной `KIMI_API_KEY` функции `niksel-proxy`. Больше секретов в проекте нет — всё offline-first.

### Ассеты

Нам не нужны покупные 3D-модели: **каждый объект** в Studio собран процедурно через `three.js` group + mesh. Это значит:
- ✅ Никаких licensing-проблем
- ✅ Пересобрать визуал = отредактировать один файл
- ✅ Нулевой bandwidth на модели (всё в JS)
- ✅ Разные стили по категориям: cartoon low-poly, voxel, cyberpunk, magic particles — всё живёт в одном бандле

Референс ассеты CC0 (Kenney / Quaternius) лежат в `src/apps/web/public/models/` как опциональный fallback.

---

## 📝 Лицензия

**Код:** Эдюсон Kids Platform internal. Юр.оформление запланировано на Q2 2026 (см. `roadmap/legal_structures.md` — 3 варианта).

**Ассеты:** Все 3D-модели в продакшене — собственные процедурные. Опциональные CC0 fallback (Kenney + Quaternius) — коммерческое использование разрешено владельцем лицензии.

---

_Обновлено: 2026-04-23. Живой preview: **eduson-ops.github.io/eduson-kids-web**_
