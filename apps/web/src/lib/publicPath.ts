/**
 * На GitHub Pages приложение живёт в подпути `/eduson-kids-web/`, поэтому
 * абсолютные пути к public-ассетам (модели, текстуры, HTML-уроки) нужно
 * префиксить `import.meta.env.BASE_URL`. Локально BASE_URL === '/',
 * так что helper безопасен и в dev-режиме.
 */
export function publicPath(path: string): string {
  const base = import.meta.env.BASE_URL
  const clean = path.startsWith('/') ? path.slice(1) : path
  return base + clean
}

/** Без завершающего слэша — удобно для интерполяции в шаблонах. */
export const PUBLIC_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
