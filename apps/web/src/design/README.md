# Eduson Kids — Design System

## Статус

**PLACEHOLDER-реализация.** Текущие токены — generic корпоративный purple-accent, похожие на Eduson-стиль. Когда Кирилл пришлёт реальные design-codes от Eduson — подменяем значения.

## Что где

- `tokens.ts` — все design-tokens (colors / fonts / spacing / shadows / motion / z-index / breakpoints)
- `tokens.css` — генерируется из tokens.ts (скриптом `build-tokens.ts`)
- Consuming: React-компоненты через `import { theme } from '@/design/tokens'` либо через CSS-переменные `var(--color-brand-500)`

## Когда придут Eduson codes

1. Кирилл скинет (например):
   - `/Users/being/Design/Eduson-brand.fig` — Figma файл
   - `/Users/being/Design/colors.json` — JSON токенов
   - Или папку с CSS/SCSS переменными

2. Действия:
   - Прочитать source-of-truth из присланных файлов
   - Заменить `colors` scale в `tokens.ts`
   - Заменить `fonts.display` + подключить @font-face в `App.css`
   - Заменить shadows / spacing если отличается
   - Rebuild → `build-tokens.ts` генерит актуальный `tokens.css`
   - Все компоненты перецепятся через CSS-variables автоматически

## Как использовать в коде

### Вариант A — TypeScript-импорт (для inline-стилей)

```tsx
import { theme } from '@/design/tokens'

<button style={{
  background: theme.colors.brand[500],
  padding: `${theme.space[3]} ${theme.space[5]}`,
  borderRadius: theme.radii.full,
  boxShadow: theme.shadows.brand,
}}>
```

### Вариант B — CSS-переменные (предпочтительно)

```css
.my-button {
  background: var(--color-brand-500);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-brand);
  transition: all var(--motion-base);
}
```

Переменные уже подключены в `App.css` через `@import './design/tokens.css'`.

## Структура токенов

### Colors
- `brand` — основной бренд-цвет (purple)
- `accent` — акцент (pink)
- `neutral` — grayscale
- `success / warn / error / info` — семантические
- `sky` — небо в 3D-сцене (5 presets: day/evening/night/cloudy/space)

### Typography
- `fonts.sans / display / mono` — семейства
- `fontSizes.xs..5xl` — шкала 11→56px
- `fontWeights.regular..bold`

### Spacing
4-base scale: 0 / 2 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 px

### Radius
none → sm → md → lg → xl → 2xl → 3xl → full (9999px)

### Shadows
sm / md / lg / xl / brand / accent

### Motion
fast 150ms / base 220ms / slow 350ms / bounce 400ms spring

### Z-index layers
base / hudBackground / hud / overlay / modal / toast / fab / tooltip

## Font-faces

Сейчас используем system-ui. Когда Eduson пришлёт свой шрифт:

```css
/* apps/web/src/design/fonts.css */
@font-face {
  font-family: 'Eduson Display';
  src: url('/fonts/eduson-display.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap;
}
```

## Dark mode

Пока НЕ реализован. Roadmap: v1.0 — добавить `[data-theme="dark"]` token-override.

## Accessibility

- Все цветовые пары brand/neutral проверить на contrast ratio ≥ 4.5:1 (WCAG AA)
- Touch-targets минимум 44×44 px (WCAG 2.5.5)
- Focus-visible outlines не отключать
