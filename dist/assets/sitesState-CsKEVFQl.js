import{t as e}from"./index.browser-Q5ZOzoOB.js";var t={violet:{name:`Фиалка`,color:`#6B5CE7`,soft:`#E4E0FC`,ink:`#2A1F8C`},mint:{name:`Мята`,color:`#34C38A`,soft:`#D8F5E7`,ink:`#0C4E2E`},pink:{name:`Зефир`,color:`#FF8CAE`,soft:`#FFE4EC`,ink:`#6A1A33`},sky:{name:`Небо`,color:`#5AA9FF`,soft:`#DFF0FF`,ink:`#1A3A6E`},yellow:{name:`Солнце`,color:`#FFC43C`,soft:`#FFF0B0`,ink:`#7A5900`},orange:{name:`Лиса`,color:`#FF7E4C`,soft:`#FFE2CE`,ink:`#6B2A05`}},n=()=>e(6),r=[{type:`hero`,emoji:`✨`,label:`Шапка`,hint:`Большой заголовок — вверху страницы.`,category:`base`,make:()=>({id:n(),type:`hero`,data:{title:`Привет!`,subtitle:`Это моя страничка.`}})},{type:`about`,emoji:`👤`,label:`Обо мне`,hint:`Короткий блок с рассказом о себе.`,category:`base`,make:()=>({id:n(),type:`about`,data:{text:`Мне 10 лет, я учусь собирать игры.`}})},{type:`skills`,emoji:`🎯`,label:`Список-пункты`,hint:`Маркированный список умений/задач.`,category:`base`,make:()=>({id:n(),type:`skills`,data:{title:`Что я умею`,items:[`Писать код`,`Рисовать`,`Петь`]}})},{type:`footer`,emoji:`📎`,label:`Подпись снизу`,hint:`Финальная подпись страницы.`,category:`base`,make:()=>({id:n(),type:`footer`,data:{text:`© 2026`}})},{type:`heading`,emoji:`🔠`,label:`Заголовок`,hint:`Крупный подпись-секция, выбери H2/H3.`,category:`text`,make:()=>({id:n(),type:`heading`,data:{text:`Новый раздел`,level:`h2`,align:`left`}})},{type:`paragraph`,emoji:`📝`,label:`Абзац`,hint:`Просто текст — расскажи что угодно.`,category:`text`,make:()=>({id:n(),type:`paragraph`,data:{text:`Пиши здесь длинный текст. Можно несколько абзацев через пустую строку.`,align:`left`}})},{type:`quote`,emoji:`💬`,label:`Цитата`,hint:`Выделить важную мысль с автором.`,category:`text`,make:()=>({id:n(),type:`quote`,data:{text:`Программирование — это искусство.`,author:`Дональд Кнут`}})},{type:`divider`,emoji:`➖`,label:`Разделитель`,hint:`Тонкая линия между разделами.`,category:`layout`,make:()=>({id:n(),type:`divider`,data:{style:`line`}})},{type:`spacer`,emoji:`⬜`,label:`Отступ`,hint:`Пустое место между блоками.`,category:`layout`,make:()=>({id:n(),type:`spacer`,data:{size:`md`}})},{type:`banner`,emoji:`🏳️`,label:`Баннер-плашка`,hint:`Яркая полоса с эмодзи и короткой фразой.`,category:`layout`,make:()=>({id:n(),type:`banner`,data:{emoji:`🔥`,text:`Горячая новость!`,color:`accent`}})},{type:`two-column`,emoji:`🪟`,label:`2 колонки (фото + текст)`,hint:`Картинка слева или справа, рядом текст.`,category:`layout`,make:()=>({id:n(),type:`two-column`,data:{imageUrl:`https://images.unsplash.com/photo-1526178613658-3f1622045557?w=600`,title:`Моя история`,text:`Расскажи об интересном проекте или эпизоде из жизни.`,imageSide:`left`}})},{type:`gallery`,emoji:`🎨`,label:`Галерея-сетка`,hint:`Квадратики с эмодзи — подойдёт для коллекции.`,category:`media`,make:()=>({id:n(),type:`gallery`,data:{title:`Моя коллекция`,items:[`🎮`,`🎨`,`🚀`,`🤖`]}})},{type:`image`,emoji:`🖼️`,label:`Картинка`,hint:`Одна картинка по ссылке, с подписью.`,category:`media`,make:()=>({id:n(),type:`image`,data:{src:`https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900`,alt:`Звёздное небо`,caption:`Красивая космическая картинка`,width:`full`,linkHref:``}})},{type:`image-row`,emoji:`🖼️🖼️`,label:`Ряд картинок`,hint:`2–4 картинки рядом — мини-коллаж.`,category:`media`,make:()=>({id:n(),type:`image-row`,data:{items:[{src:`https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400`,alt:`Геймпад`},{src:`https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400`,alt:`Лаборатория`},{src:`https://images.unsplash.com/photo-1526178613658-3f1622045557?w=400`,alt:`Клавиатура`}]}})},{type:`video`,emoji:`🎬`,label:`Видео YouTube`,hint:`Вставь ссылку на YouTube/Vimeo — плеер появится.`,category:`media`,make:()=>({id:n(),type:`video`,data:{url:`https://www.youtube.com/watch?v=aircAruvnKk`,caption:``}})},{type:`cta`,emoji:`🚀`,label:`Призыв к действию`,hint:`Большой блок с яркой кнопкой.`,category:`action`,make:()=>({id:n(),type:`cta`,data:{title:`Поиграй со мной!`,buttonText:`Начать`,buttonHref:`#`}})},{type:`button`,emoji:`🔘`,label:`Кнопка-ссылка`,hint:`Одинокая кнопка с ссылкой (наружу или вниз).`,category:`action`,make:()=>({id:n(),type:`button`,data:{text:`Перейти`,href:`https://example.com`,variant:`solid`,align:`center`}})},{type:`link-cards`,emoji:`🔗`,label:`Карточки со ссылками`,hint:`Сетка карточек — эмодзи, название, ссылка.`,category:`action`,make:()=>({id:n(),type:`link-cards`,data:{title:`Мои любимые штуки`,items:[{emoji:`🎮`,title:`Моя игра`,desc:`Играй прямо сейчас`,href:`#`},{emoji:`🎨`,title:`Мои рисунки`,desc:`Смотреть галерею`,href:`#`},{emoji:`📓`,title:`Блог`,desc:`Читать последний пост`,href:`#`}]}})},{type:`social`,emoji:`🌐`,label:`Соцсети (иконки)`,hint:`Строка иконок ВК/Telegram/YouTube и т.д.`,category:`action`,make:()=>({id:n(),type:`social`,data:{items:[{kind:`tg`,href:`https://t.me/`},{kind:`vk`,href:`https://vk.com/`},{kind:`yt`,href:`https://youtube.com/`}]}})},{type:`stats`,emoji:`📊`,label:`3 больших числа`,hint:`Статистика: "100+ проектов / 7 лет / ...".`,category:`data`,make:()=>({id:n(),type:`stats`,data:{items:[{value:`12`,label:`проектов`},{value:`48`,label:`уроков`},{value:`7★`,label:`рейтинг`}]}})},{type:`timeline`,emoji:`📅`,label:`Таймлайн`,hint:`История: дата — событие, строкой вниз.`,category:`data`,make:()=>({id:n(),type:`timeline`,data:{items:[{date:`2025`,title:`Начал учиться`,desc:`Первые блоки и первая игра.`},{date:`2026`,title:`Сделал свой сайт`,desc:`Вот этот самый сайт!`}]}})},{type:`faq`,emoji:`❓`,label:`FAQ — вопросы/ответы`,hint:`Раскрывающиеся вопросы.`,category:`data`,make:()=>({id:n(),type:`faq`,data:{items:[{q:`Сколько тебе лет?`,a:`Мне 10, скоро 11!`},{q:`На чём ты программируешь?`,a:`На Эдюсон Kids в блоках и понемногу на Python.`}]}})}];function i(e){return r.find(t=>t.type===e)}var a=[{id:`about-me`,title:`Обо мне`,emoji:`🙋`,description:`Представь себя миру: имя, хобби, что любишь.`,theme:`violet`,build:()=>[{id:n(),type:`hero`,data:{title:`Привет! Я Никита`,subtitle:`Люблю играть, рисовать и учиться.`}},{id:n(),type:`about`,data:{text:`Мне 10 лет. Я учусь в 4-м классе и обожаю роботов.`}},{id:n(),type:`skills`,data:{title:`Что я умею`,items:[`Собирать Лего`,`Рисовать комиксы`,`Программировать в Эдюсон Kids`]}},{id:n(),type:`social`,data:{items:[{kind:`tg`,href:`https://t.me/`},{kind:`vk`,href:`https://vk.com/`}]}},{id:n(),type:`footer`,data:{text:`Сделано в Эдюсон Kids 🧱`}}]},{id:`portfolio`,title:`Моё портфолио`,emoji:`🎨`,description:`Покажи свои работы: игры, рисунки, проекты.`,theme:`pink`,build:()=>[{id:n(),type:`hero`,data:{title:`Мои работы`,subtitle:`Собрал за этот год`}},{id:n(),type:`stats`,data:{items:[{value:`12`,label:`проектов`},{value:`48`,label:`уроков`},{value:`7★`,label:`рейтинг`}]}},{id:n(),type:`gallery`,data:{title:`Мини-галерея`,items:[`🎮`,`🎨`,`🚀`,`🤖`,`🏰`,`🦄`]}},{id:n(),type:`link-cards`,data:{title:`Смотреть вживую`,items:[{emoji:`🎮`,title:`Моя игра`,desc:`Платформер с кодом на Python`,href:`#`},{emoji:`🌐`,title:`Мой сайт`,desc:`Он тебя и встречает прямо сейчас`,href:`#`},{emoji:`🎨`,title:`Мой 3D-аватар`,desc:`Собрал в Эдюсон Kids-редакторе`,href:`#`}]}},{id:n(),type:`cta`,data:{title:`Хочешь попробовать?`,buttonText:`Начать`,buttonHref:`#`}},{id:n(),type:`footer`,data:{text:`© 2026`}}]},{id:`blog`,title:`Мой блог`,emoji:`📓`,description:`Страничка с дневником: что нового, что изучил.`,theme:`mint`,build:()=>[{id:n(),type:`hero`,data:{title:`Дневник юного программиста`,subtitle:`Что я сделал сегодня`}},{id:n(),type:`heading`,data:{text:`Апдейт недели`,level:`h2`,align:`left`}},{id:n(),type:`paragraph`,data:{text:`Сегодня я построил свой первый 3D-мир в Эдюсон Kids и добавил туда летающего дракона. Дракон ещё не понимает команды, но уже очень красиво машет крыльями.`,align:`left`}},{id:n(),type:`quote`,data:{text:`Ошибка — это не провал, а ещё одна подсказка.`,author:`моя учительница`}},{id:n(),type:`timeline`,data:{items:[{date:`Пн`,title:`Начал проект`,desc:`Собрал карту и персонажа.`},{date:`Ср`,title:`Добавил врагов`,desc:`Теперь они ходят туда-сюда.`},{date:`Пт`,title:`Первая версия`,desc:`Прошёл уровень до конца!`}]}},{id:n(),type:`footer`,data:{text:`~ продолжение следует`}}]},{id:`fan-page`,title:`Фан-страница`,emoji:`🌟`,description:`Страница в честь любимой игры, мультика или героя.`,theme:`sky`,build:()=>[{id:n(),type:`hero`,data:{title:`Мир любимой игры`,subtitle:`Всё, что я про неё знаю`}},{id:n(),type:`two-column`,data:{imageUrl:`https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800`,title:`Почему мне нравится`,text:`Потому что тут можно строить свои миры, а не только играть по готовым правилам.`,imageSide:`left`}},{id:n(),type:`image-row`,data:{items:[{src:`https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400`,alt:`Скрин 1`},{src:`https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400`,alt:`Скрин 2`},{src:`https://images.unsplash.com/photo-1556438064-2d7646166914?w=400`,alt:`Скрин 3`}]}},{id:n(),type:`faq`,data:{items:[{q:`Сколько часов ты уже играешь?`,a:`Примерно 40.`},{q:`Есть любимая карта?`,a:`Да, та что с озером — там красивые закаты.`}]}},{id:n(),type:`footer`,data:{text:`© фанатская страничка`}}]},{id:`presentation`,title:`Презентация-сайт`,emoji:`🖼️`,description:`Как слайды, но можно листать в браузере — идеально для рассказа.`,theme:`orange`,build:()=>[{id:n(),type:`hero`,data:{title:`Моя презентация`,subtitle:`Листай вниз — как слайды`}},{id:n(),type:`heading`,data:{text:`Что я хочу рассказать`,level:`h2`,align:`center`}},{id:n(),type:`paragraph`,data:{text:`Короткое введение — о чём следующие блоки.`,align:`center`}},{id:n(),type:`divider`,data:{style:`line`}},{id:n(),type:`banner`,data:{emoji:`💡`,text:`Главная идея — в одну строку.`,color:`accent`}},{id:n(),type:`two-column`,data:{imageUrl:`https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800`,title:`Почему это важно`,text:`Пару предложений, которые объясняют суть. Идеально для рассказа учителю или семье.`,imageSide:`right`}},{id:n(),type:`stats`,data:{items:[{value:`3`,label:`причины`},{value:`1`,label:`вывод`},{value:`∞`,label:`возможностей`}]}},{id:n(),type:`cta`,data:{title:`Что дальше?`,buttonText:`Связаться со мной`,buttonHref:`mailto:me@example.com`}},{id:n(),type:`footer`,data:{text:`Спасибо за просмотр!`}}]},{id:`hello`,title:`Привет, мир!`,emoji:`👋`,description:`Самая простая страничка. Отличный старт.`,theme:`yellow`,build:()=>[{id:n(),type:`hero`,data:{title:`Привет, мир!`,subtitle:`Это моя первая веб-страница.`}},{id:n(),type:`footer`,data:{text:`Сделано в Эдюсон Kids`}}]}],o=`ek_sites_v1`;function s(t=`about-me`){let n=a.find(e=>e.id===t)??a[0];return{id:e(8),name:n.title,theme:n.theme,mode:`template`,sections:n.build(),html:``,css:``,updated:Date.now()}}var c=new Set;function l(){try{let e=localStorage.getItem(o);if(e){let t=JSON.parse(e);if(Array.isArray(t.sites))return t}}catch{}return{sites:[],currentId:null}}var u=l();function d(){try{localStorage.setItem(o,JSON.stringify(u))}catch{}}function f(){for(let e of c)e(u)}function p(e){return c.add(e),e(u),()=>{c.delete(e)}}function m(){return u}function h(e){return u.sites.find(t=>t.id===e)}function g(e){let t=s(e);return u={sites:[t,...u.sites],currentId:t.id},d(),f(),t}function _(e,t){u={...u,sites:u.sites.map(n=>n.id===e?{...n,...t,updated:Date.now()}:n)},d(),f()}function v(e){u={...u,sites:u.sites.filter(t=>t.id!==e),currentId:u.currentId===e?null:u.currentId},d(),f()}function y(e){let n=t[e.theme],r=e.sections.map(x).join(`
`);return{html:`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${w(e.name)}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="site">
${D(r,4)}
  </main>
</body>
</html>`,css:b(n)}}function b(e){return`:root {
  --accent: ${e.color};
  --accent-soft: ${e.soft};
  --ink: ${e.ink};
  --paper: #FFFBF3;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Nunito', system-ui, sans-serif;
  background: var(--paper);
  color: #15141b;
  line-height: 1.55;
}
.site {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px;
}
.site > * + * { margin-top: 16px; }

/* ── Hero ── */
.hero {
  text-align: center;
  padding: 56px 24px;
  background: linear-gradient(135deg, var(--accent-soft), var(--accent));
  border-radius: 24px;
  color: var(--ink);
}
.hero h1 { margin: 0 0 12px; font-size: 40px; line-height: 1.15; }
.hero p  { margin: 0; font-size: 18px; opacity: 0.85; }

/* ── About ── */
.about {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.about p { margin: 0; font-size: 16px; }

/* ── Heading / Paragraph / Quote ── */
.block-heading h2 { margin: 24px 0 8px; font-size: 28px; color: var(--ink); }
.block-heading h3 { margin: 20px 0 6px; font-size: 22px; color: var(--ink); }
.block-heading.align-center { text-align: center; }
.block-heading.align-right  { text-align: right; }

.block-paragraph { font-size: 16px; }
.block-paragraph.align-center { text-align: center; }
.block-paragraph.align-right  { text-align: right; }
.block-paragraph p { margin: 0 0 8px; }

.block-quote {
  border-left: 4px solid var(--accent);
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 0 12px 12px 0;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}
.block-quote p { margin: 0 0 8px; font-size: 18px; font-style: italic; color: var(--ink); }
.block-quote cite { font-size: 14px; color: rgba(21,20,27,0.6); font-style: normal; }

/* ── Divider / Spacer / Banner ── */
.block-divider { border: 0; border-top: 2px solid rgba(21,20,27,0.1); margin: 24px 0; }
.block-divider.style-dashed { border-top-style: dashed; }
.block-divider.style-dots   { border-top-style: dotted; }

.block-spacer.size-sm { height: 16px; }
.block-spacer.size-md { height: 32px; }
.block-spacer.size-lg { height: 64px; }

.block-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
}
.block-banner .banner-emoji { font-size: 28px; flex-shrink: 0; }
.block-banner.color-accent  { background: var(--accent-soft); color: var(--ink); }
.block-banner.color-success { background: #E0F5E7; color: #0B5A2A; }
.block-banner.color-warn    { background: #FFEBC9; color: #6B3F00; }

/* ── Two column ── */
.block-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: center;
  background: #ffffff;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}
.block-two-column.image-right .two-col-image { order: 2; }
.block-two-column .two-col-image img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.block-two-column h3 { margin: 0 0 10px; color: var(--ink); font-size: 22px; }
.block-two-column p { margin: 0; font-size: 15.5px; }

/* ── Image / Image row / Video ── */
.block-image { text-align: center; }
.block-image img {
  max-width: 100%;
  border-radius: 14px;
  display: inline-block;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.block-image.width-md img { max-width: 480px; width: 100%; }
.block-image.width-sm img { max-width: 280px; width: 100%; }
.block-image figcaption { margin-top: 8px; color: rgba(21,20,27,0.6); font-size: 14px; }

.block-image-row {
  display: grid;
  gap: 10px;
}
.block-image-row.count-2 { grid-template-columns: 1fr 1fr; }
.block-image-row.count-3 { grid-template-columns: 1fr 1fr 1fr; }
.block-image-row.count-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.block-image-row img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.block-video {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.block-video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.block-video + figcaption { margin-top: 8px; color: rgba(21,20,27,0.6); font-size: 14px; text-align: center; }

/* ── Skills / Gallery / CTA / Button / Link cards / Social ── */
.skills {
  background: var(--accent-soft);
  padding: 24px;
  border-radius: 16px;
}
.skills h2 { margin: 0 0 12px; color: var(--ink); }
.skills ul { margin: 0; padding-left: 20px; }
.skills li { padding: 4px 0; }

.gallery h2 { margin: 0 0 12px; color: var(--ink); }
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}
.gallery-item {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  transition: transform 0.15s;
}
.gallery-item:hover { transform: translateY(-4px); }

.cta {
  text-align: center;
  padding: 36px 20px;
  background: var(--accent);
  border-radius: 20px;
  color: #ffffff;
}
.cta h2 { margin: 0 0 16px; color: #ffffff; }
.cta a {
  display: inline-block;
  padding: 12px 28px;
  background: #ffffff;
  color: var(--ink);
  text-decoration: none;
  font-weight: 700;
  border-radius: 999px;
  transition: transform 0.15s;
}
.cta a:hover { transform: scale(1.05); }

.block-button { display: flex; }
.block-button.align-left   { justify-content: flex-start; }
.block-button.align-center { justify-content: center; }
.block-button.align-right  { justify-content: flex-end; }
.block-button a {
  display: inline-block;
  padding: 12px 24px;
  font-weight: 700;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 0.15s;
}
.block-button.variant-solid a { background: var(--accent); color: #ffffff; }
.block-button.variant-ghost a { background: transparent; color: var(--accent); border: 2px solid var(--accent); }
.block-button a:hover { transform: scale(1.05); }

.block-link-cards h2 { margin: 0 0 14px; color: var(--ink); }
.link-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.link-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}
.link-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); }
.link-card-emoji { font-size: 36px; line-height: 1; flex-shrink: 0; }
.link-card-body strong { display: block; font-size: 15px; margin-bottom: 4px; color: var(--ink); }
.link-card-body span { font-size: 13px; color: rgba(21,20,27,0.6); }

.block-social {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.social-pill {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  transition: transform 0.15s;
}
.social-pill:hover { transform: scale(1.12); }

/* ── Stats / Timeline / FAQ ── */
.block-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
}
.stat-item {
  background: #ffffff;
  padding: 20px 12px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
}
.stat-item .stat-value { font-size: 32px; font-weight: 800; color: var(--accent); line-height: 1; }
.stat-item .stat-label { display: block; margin-top: 6px; font-size: 13px; color: rgba(21,20,27,0.6); }

.block-timeline { position: relative; padding-left: 28px; }
.block-timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--accent-soft);
  border-radius: 2px;
}
.timeline-item { position: relative; padding: 6px 0 14px; }
.timeline-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px #ffffff;
}
.timeline-date { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; }
.timeline-title { margin: 2px 0 4px; color: var(--ink); font-size: 16px; }
.timeline-desc { margin: 0; font-size: 14px; color: rgba(21,20,27,0.7); }

.block-faq details {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  margin-bottom: 8px;
}
.block-faq summary {
  font-weight: 700;
  cursor: pointer;
  color: var(--ink);
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.block-faq summary::after { content: '＋'; color: var(--accent); font-size: 18px; }
.block-faq details[open] summary::after { content: '−'; }
.block-faq details p { margin: 10px 0 0; color: rgba(21,20,27,0.8); font-size: 14.5px; }

/* ── Footer ── */
.footer {
  text-align: center;
  padding: 24px 16px;
  color: #6b6e78;
  font-size: 14px;
}

/* ── mobile ── */
@media (max-width: 600px) {
  .block-two-column { grid-template-columns: 1fr; }
  .block-two-column.image-right .two-col-image { order: 0; }
  .hero h1 { font-size: 30px; }
  .block-image-row.count-3,
  .block-image-row.count-4 { grid-template-columns: 1fr 1fr; }
}
`}function x(e){let t=e.data;switch(e.type){case`hero`:return`<section class="hero">
  <h1>${w(C(t.title,`Заголовок`))}</h1>
  <p>${w(C(t.subtitle,``))}</p>
</section>`;case`about`:return`<section class="about">
  <p>${T(C(t.text,``))}</p>
</section>`;case`skills`:{let e=(Array.isArray(t.items)?t.items:[]).map(e=>`    <li>${w(e)}</li>`).join(`
`);return`<section class="skills">
  <h2>${w(C(t.title,`Навыки`))}</h2>
  <ul>
${e}
  </ul>
</section>`}case`gallery`:{let e=(Array.isArray(t.items)?t.items:[]).map(e=>`    <div class="gallery-item">${w(e)}</div>`).join(`
`);return`<section class="gallery">
  <h2>${w(C(t.title,`Галерея`))}</h2>
  <div class="gallery-grid">
${e}
  </div>
</section>`}case`cta`:return`<section class="cta">
  <h2>${w(C(t.title,`Попробуй!`))}</h2>
  <a href="${E(C(t.buttonHref,`#`))}">${w(C(t.buttonText,`Нажми`))}</a>
</section>`;case`footer`:return`<footer class="footer">${w(C(t.text,``))}</footer>`;case`heading`:{let e=C(t.level,`h2`)===`h3`?`h3`:`h2`;return`<section class="block-heading align-${C(t.align,`left`)}">
  <${e}>${w(C(t.text,`Заголовок`))}</${e}>
</section>`}case`paragraph`:return`<section class="block-paragraph align-${C(t.align,`left`)}">
${C(t.text,``).split(/\n\s*\n/).filter(Boolean).map(e=>`  <p>${T(e)}</p>`).join(`
`)}
</section>`;case`quote`:return`<section class="block-quote">
  <p>«${w(C(t.text,``))}»</p>
  <cite>— ${w(C(t.author,``))}</cite>
</section>`;case`divider`:return`<hr class="block-divider style-${C(t.style,`line`)}" />`;case`spacer`:return`<div class="block-spacer size-${C(t.size,`md`)}" aria-hidden="true"></div>`;case`banner`:return`<div class="block-banner color-${C(t.color,`accent`)}">
  <span class="banner-emoji">${w(C(t.emoji,`💡`))}</span>
  <span class="banner-text">${w(C(t.text,``))}</span>
</div>`;case`two-column`:return`<section class="block-two-column image-${C(t.imageSide,`left`)}">
  <div class="two-col-image"><img src="${E(C(t.imageUrl,``))}" alt="${w(C(t.title,``))}" loading="lazy"/></div>
  <div class="two-col-text">
    <h3>${w(C(t.title,``))}</h3>
    <p>${T(C(t.text,``))}</p>
  </div>
</section>`;case`image`:{let e=C(t.width,`full`),n=C(t.src,``),r=C(t.alt,``),i=C(t.caption,``),a=C(t.linkHref,``),o=`<img src="${E(n)}" alt="${w(r)}" loading="lazy" />`;return`<figure class="block-image width-${e}">
  ${a?`<a href="${E(a)}">${o}</a>`:o}${i?`\n  <figcaption>${w(i)}</figcaption>`:``}
</figure>`}case`image-row`:{let e=Array.isArray(t.items)?t.items:[];return`<section class="block-image-row count-${Math.min(Math.max(e.length,2),4)}">
${e.map(e=>`    <img src="${E(e.src||``)}" alt="${w(e.alt||``)}" loading="lazy" />`).join(`
`)}
</section>`}case`video`:{let e=S(C(t.url,``)),n=C(t.caption,``);return`<figure class="block-video">${e?`<iframe src="${w(e)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`:`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#eee;color:#888">Вставь ссылку YouTube / Vimeo</div>`}</figure>${n?`\n<figcaption>${w(n)}</figcaption>`:``}`}case`button`:return`<div class="block-button align-${C(t.align,`center`)} variant-${C(t.variant,`solid`)}">
  <a href="${E(C(t.href,`#`))}">${w(C(t.text,`Кнопка`))}</a>
</div>`;case`link-cards`:{let e=(Array.isArray(t.items)?t.items:[]).map(e=>`    <a class="link-card" href="${E(e.href||`#`)}">
      <span class="link-card-emoji">${w(e.emoji||`🔗`)}</span>
      <div class="link-card-body">
        <strong>${w(e.title||``)}</strong>
        <span>${w(e.desc||``)}</span>
      </div>
    </a>`).join(`
`),n=C(t.title,``);return`<section class="block-link-cards">${n?`\n  <h2>${w(n)}</h2>`:``}
  <div class="link-cards-grid">
${e}
  </div>
</section>`}case`social`:{let e=Array.isArray(t.items)?t.items:[],n={vk:`ВК`,tg:`TG`,yt:`YT`,gh:`GH`,ig:`IG`,web:`🌐`,mail:`✉`};return`<nav class="block-social">
${e.map(e=>`  <a class="social-pill" href="${E(e.href||`#`)}" aria-label="${w(e.kind||``)}">${w(n[e.kind||``]||`🔗`)}</a>`).join(`
`)}
</nav>`}case`stats`:return`<section class="block-stats">
${(Array.isArray(t.items)?t.items:[]).map(e=>`  <div class="stat-item">
    <span class="stat-value">${w(e.value||``)}</span>
    <span class="stat-label">${w(e.label||``)}</span>
  </div>`).join(`
`)}
</section>`;case`timeline`:return`<section class="block-timeline">
${(Array.isArray(t.items)?t.items:[]).map(e=>`  <div class="timeline-item">
    <div class="timeline-date">${w(e.date||``)}</div>
    <h3 class="timeline-title">${w(e.title||``)}</h3>
    <p class="timeline-desc">${w(e.desc||``)}</p>
  </div>`).join(`
`)}
</section>`;case`faq`:return`<section class="block-faq">
${(Array.isArray(t.items)?t.items:[]).map(e=>`  <details>
    <summary>${w(e.q||``)}</summary>
    <p>${T(e.a||``)}</p>
  </details>`).join(`
`)}
</section>`}}function S(e){if(!e)return null;let t=e.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);if(t)return`https://www.youtube.com/embed/${t[1]}`;let n=e.match(/youtube\.com\/shorts\/([\w-]{11})/);if(n)return`https://www.youtube.com/embed/${n[1]}`;let r=e.match(/vimeo\.com\/(\d+)/);return r?`https://player.vimeo.com/video/${r[1]}`:/youtube\.com\/embed\//.test(e)||/player\.vimeo\.com\//.test(e)?e:null}function C(e,t){return typeof e==`string`?e:t}function w(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function T(e){return w(e).replace(/\n/g,`<br/>`)}function E(e){let t=e.trim();return t&&/^(https?:|mailto:|tel:|#|\/)/.test(t)?w(t):`#`}function D(e,t){let n=` `.repeat(t);return e.split(`
`).map(e=>e&&n+e).join(`
`)}export{g as a,h as c,_ as d,y as i,m as l,a as n,v as o,t as r,i as s,r as t,p as u};