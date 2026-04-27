import type { Student } from '../lib/classRoster'

interface Props {
  className: string
  students: Student[]
}

/**
 * Карточки для печати — 4×6 на A4, каждая: имя + логин + PIN.
 * Открываем в новом окне через window.print().
 */
export function printRosterPDF({ className, students }: Props): void {
  const cards = students
    .map(
      (s) => `
      <div class="card">
        <div class="school">Эдюсон Kids · ${className}</div>
        <div class="name">${s.lastName}<br/>${s.firstName}</div>
        <div class="row"><span class="label">Логин</span><code>${s.login}</code></div>
        <div class="row"><span class="label">PIN</span><code>${s.pin}</code></div>
        <div class="url">eduson-kids.ru</div>
      </div>
    `
    )
    .join('')

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Логины · ${className}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; }
    .page { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12mm; }
    .card {
      border: 1.5px dashed #888; border-radius: 10px; padding: 12px;
      display: flex; flex-direction: column; gap: 6px; min-height: 100px;
    }
    .school { font-size: 9px; color: #888; letter-spacing: .05em; text-transform: uppercase; }
    .name { font-size: 16px; font-weight: 800; line-height: 1.2; margin: 2px 0 4px; }
    .row { display: flex; gap: 8px; align-items: center; }
    .label { font-size: 10px; color: #888; min-width: 40px; }
    code { font-size: 14px; font-weight: 700; font-family: monospace; background: #f4f4f8; padding: 2px 8px; border-radius: 5px; }
    .url { font-size: 9px; color: #bbb; margin-top: auto; }
    @media print { @page { margin: 8mm; } }
  </style>
  </head><body>
  <div class="page">${cards}</div>
  <script>window.print(); setTimeout(() => window.close(), 2000);</script>
  </body></html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (w) { w.document.write(html); w.document.close() }
}

export default function RosterPDF({ className, students }: Props) {
  return (
    <button
      type="button"
      className="kb-btn kb-btn--secondary"
      onClick={() => printRosterPDF({ className, students })}
    >
      🖨 Печать карточек PDF
    </button>
  )
}
