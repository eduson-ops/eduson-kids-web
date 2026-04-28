/** BASE_URL без завершающего слэша — удобно для интерполяции в шаблонах. Пустой локально, '/eduson-kids-web' на GH Pages. */
export const PUBLIC_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')
