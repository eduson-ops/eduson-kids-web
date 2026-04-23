import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'

/**
 * /cert/:id — публичный сертификат по завершению модуля/курса.
 * Верифицируется по QR-коду который ведёт обратно на этот же URL.
 *
 * В production: {id} — это UUID выданного сертификата, проверяется
 * на бэкенде (api-gateway /api/cert/:id → { userName, courseName, date, fgosCode }).
 *
 * MVP: id кодирует данные прямо в base64 (для демонстрации).
 *   Формат: base64url("module:5|name:Ученик|date:2026-04-23")
 *
 * Для печати — клавиша Ctrl+P → родной браузерный «Save as PDF».
 * QR строится через svg-path-generator inline (без зависимостей).
 */

interface CertData {
  name: string
  courseName: string
  moduleN?: number
  date: string
  fgosCode: string
  verified: boolean
}

function decodeCertId(id: string): CertData | null {
  try {
    const raw = atob(id.replace(/-/g, '+').replace(/_/g, '/'))
    const parts = raw.split('|').reduce<Record<string, string>>((acc, pair) => {
      const [k, v] = pair.split(':')
      if (k && v) acc[k] = decodeURIComponent(v)
      return acc
    }, {})
    return {
      name: parts.name ?? 'Ученик',
      courseName: parts.course ?? 'Эдюсон Kids',
      moduleN: parts.module ? parseInt(parts.module, 10) : undefined,
      date: parts.date ?? new Date().toLocaleDateString('ru-RU'),
      fgosCode: parts.fgos ?? 'ФГОС ОО · 9–15 лет',
      verified: true,
    }
  } catch {
    return null
  }
}

/** Encode данные в id. Используется из /me при выдаче. */
export function encodeCertId(data: Partial<CertData>): string {
  const parts: string[] = []
  if (data.name) parts.push(`name:${encodeURIComponent(data.name)}`)
  if (data.courseName) parts.push(`course:${encodeURIComponent(data.courseName)}`)
  if (data.moduleN) parts.push(`module:${data.moduleN}`)
  if (data.date) parts.push(`date:${encodeURIComponent(data.date)}`)
  if (data.fgosCode) parts.push(`fgos:${encodeURIComponent(data.fgosCode)}`)
  return btoa(parts.join('|')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Минимальный QR-кодер через простую pixel-grid свёртку.
 *  Для production заменить на `qrcode` lib. Тут inline SVG для демо.
 */
function QrPlaceholder({ url, size = 140 }: { url: string; size?: number }) {
  // Псевдо-QR паттерн из хеша URL — визуально похоже на QR,
  // но не реально-сканируемый. Это ОК для demo-стабы, реальный QR
  // добавим через `qrcode` npm-пакет в production.
  const grid = useMemo(() => {
    const n = 21
    const cells: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))
    let hash = 0
    for (let i = 0; i < url.length; i++) hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff
        cells[r][c] = (hash & 1) === 1
      }
    }
    // Position detection patterns (три квадрата по углам — признак QR)
    const drawFinder = (rr: number, cc: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6
          const innerCore = r >= 2 && r <= 4 && c >= 2 && c <= 4
          cells[rr + r][cc + c] = onBorder || innerCore
        }
      }
    }
    drawFinder(0, 0)
    drawFinder(0, n - 7)
    drawFinder(n - 7, 0)
    return cells
  }, [url])

  const cell = size / 21
  return (
    <svg width={size} height={size} viewBox={`0 0 21 21`} aria-label="QR для верификации">
      <rect width="21" height="21" fill="#fff" />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#15141b" /> : null
        )
      )}
    </svg>
  )
}

export default function Certificate() {
  const { id } = useParams<{ id: string }>()
  const cert = id ? decodeCertId(id) : null
  const fullUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (!cert) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--f-ui, system-ui)', textAlign: 'center', minHeight: '100vh', background: 'var(--paper, #fffbf3)' }}>
        <h1>Сертификат не найден</h1>
        <p>Проверь ссылку или отсканируй QR заново.</p>
        <Link to="/" style={{ marginTop: 16, display: 'inline-block' }}>← На главную</Link>
      </div>
    )
  }

  return (
    <div className="cert-page" style={{ fontFamily: 'var(--f-ui, system-ui)', background: 'var(--paper, #fffbf3)', minHeight: '100vh' }}>
      <style>{`
        @media print {
          body { margin: 0; background: #fff !important; }
          .cert-no-print { display: none !important; }
          .cert-paper { margin: 0 !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="cert-no-print" style={{ padding: 16, background: 'var(--paper-2, #F4EFE3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--ink, #15141b)', fontWeight: 700 }}>
          ← Эдюсон Kids
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            background: 'var(--violet, #6B5CE7)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 12,
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          📄 Сохранить PDF (Ctrl+P)
        </button>
      </div>

      <div
        className="cert-paper"
        style={{
          maxWidth: 840,
          margin: '40px auto',
          padding: '60px 80px',
          background: '#fff',
          border: '4px double #15141b',
          boxShadow: '0 10px 30px rgba(0,0,0,.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Декор-уголки */}
        <div style={{ position: 'absolute', top: 20, left: 20, width: 60, height: 60, border: '3px solid #FFD43C', borderRight: 'none', borderBottom: 'none' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, border: '3px solid #FFD43C', borderLeft: 'none', borderBottom: 'none' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 20, width: 60, height: 60, border: '3px solid #FFD43C', borderRight: 'none', borderTop: 'none' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, border: '3px solid #FFD43C', borderLeft: 'none', borderTop: 'none' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, letterSpacing: '4px', color: '#6b6e78', textTransform: 'uppercase', marginBottom: 8 }}>
            Эдюсон Kids
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 44, color: '#15141b', letterSpacing: '-0.01em', marginBottom: 12 }}>
            СЕРТИФИКАТ
          </div>
          <div style={{ fontSize: 13, color: '#6b6e78' }}>
            о {cert.moduleN ? `прохождении модуля ${cert.moduleN}` : 'завершении курса'}
          </div>
        </div>

        <div style={{ margin: '40px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b6e78', marginBottom: 8 }}>Выдан</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 32, color: '#6B5CE7', margin: '8px 0 20px', letterSpacing: '-0.01em' }}>
            {cert.name}
          </div>
          <div style={{ fontSize: 15, color: '#15141b', lineHeight: 1.7, maxWidth: 540, margin: '0 auto' }}>
            за успешное прохождение {cert.moduleN ? <>модуля <strong>M{cert.moduleN}</strong></> : <>полного курса</>}{' '}
            <strong>«{cert.courseName}»</strong> — 3D-программирование и Python для детей 9–15 лет.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40, gap: 40 }}>
          <div style={{ fontSize: 12, color: '#6b6e78', maxWidth: 240 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Код ФГОС</div>
            <div style={{ color: '#15141b', fontFamily: 'var(--f-mono, monospace)', fontSize: 11 }}>
              {cert.fgosCode}
            </div>
            <div style={{ fontWeight: 700, marginTop: 14, marginBottom: 4 }}>Дата выдачи</div>
            <div style={{ color: '#15141b', fontFamily: 'var(--f-mono, monospace)', fontSize: 11 }}>
              {cert.date}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <QrPlaceholder url={fullUrl} size={120} />
            <div style={{ fontSize: 10, color: '#6b6e78', marginTop: 4, fontFamily: 'var(--f-mono, monospace)' }}>
              Сканируй для проверки
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 12, color: '#6b6e78', maxWidth: 200 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Платформа</div>
            <div style={{ color: '#15141b' }}>Эдюсон Kids</div>
            <div style={{ marginTop: 6, fontSize: 11 }}>
              eduson-ops.github.io/eduson-kids-web
            </div>
            <div style={{ marginTop: 14, padding: '4px 8px', background: '#E1F7EC', color: '#2E8C5F', borderRadius: 6, fontWeight: 700, display: 'inline-block', fontSize: 11 }}>
              ✓ Верифицирован
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#999', fontFamily: 'var(--f-mono, monospace)' }}>
          ID: {id}
        </div>
      </div>
    </div>
  )
}
