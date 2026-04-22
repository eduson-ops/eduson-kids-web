import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * SharedSite — просмотр сайта, полученного по ссылке (/share#s=<base64>).
 * Декодирует JSON-снимок {n, t, h, c} и отрисовывает в iframe.
 * Никаких зависимостей от userData: ссылка самодостаточна.
 */
export default function SharedSite() {
  const [data, setData] = useState<null | { name: string; html: string; css: string }>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const hash = window.location.hash || ''
      const m = hash.match(/s=([^&]+)/)
      if (!m) throw new Error('Нет кода сайта в ссылке')
      const decoded = decodeURIComponent(escape(atob(m[1])))
      const obj = JSON.parse(decoded) as { n?: string; h?: string; c?: string }
      if (typeof obj.h !== 'string' || typeof obj.c !== 'string') throw new Error('Некорректная ссылка')
      setData({ name: obj.n ?? 'Сайт', html: obj.h, css: obj.c })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось открыть ссылку')
    }
  }, [])

  const doc = useMemo(() => {
    if (!data) return ''
    const body = data.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? data.html
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(data.name)}</title><style>${data.css}</style></head><body>${body}</body></html>`
  }, [data])

  if (error) {
    return (
      <div className="shared-site-error">
        <h2>Не получилось открыть</h2>
        <p>{error}</p>
        <Link to="/" className="kb-btn">На главную</Link>
      </div>
    )
  }
  if (!data) {
    return <div className="shared-site-loading">Открываем сайт…</div>
  }
  return (
    <div className="shared-site">
      <header className="shared-site-bar">
        <strong>🌐 {data.name}</strong>
        <span className="shared-site-hint">Сайт создан в Эдюсон Kids · каждый ребёнок — автор</span>
        <Link to="/" className="kb-btn kb-btn--sm">Сделать свой</Link>
      </header>
      <iframe srcDoc={doc} title={data.name} />
    </div>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
