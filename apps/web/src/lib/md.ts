/**
 * md.ts — Tiny inline markdown renderer to React nodes.
 *
 * Handles: **bold**, *italic*, `inline code`, [text](url),
 * bullet lines (`- ` / `* `), and paragraph breaks (blank line).
 * No external deps, no dangerouslySetInnerHTML.
 *
 * Used for ingested-course fields (goal/outcomes/miniProject/homework)
 * which store raw markdown text.
 */
import React from 'react'

/** Tokenize inline markdown on a single line into React nodes. */
function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  // Combined regex: bold, italic, code, link — ordered by specificity.
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g
  const out: React.ReactNode[] = []
  let last = 0
  let i = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(line.slice(last, m.index))
    const k = `${keyPrefix}-${i++}`
    if (m[1] !== undefined) out.push(React.createElement('strong', { key: k }, m[1]))
    else if (m[2] !== undefined) out.push(React.createElement('em', { key: k }, m[2]))
    else if (m[3] !== undefined) out.push(React.createElement('code', { key: k }, m[3]))
    else if (m[4] !== undefined && m[5] !== undefined)
      out.push(React.createElement('a', { key: k, href: m[5], target: '_blank', rel: 'noopener noreferrer' }, m[4]))
    last = re.lastIndex
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

/** Render a markdown string as React nodes (paragraphs, lists, inline marks). */
export function renderMd(text: string): React.ReactNode {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: React.ReactNode[] = []
  let paraBuf: string[] = []
  let listBuf: string[] = []
  let idx = 0
  const flushPara = () => {
    if (paraBuf.length === 0) return
    const joined = paraBuf.join(' ')
    blocks.push(React.createElement('p', { key: `p-${idx++}`, style: { margin: '6px 0', lineHeight: 1.55 } }, ...renderInline(joined, `p-${idx}`)))
    paraBuf = []
  }
  const flushList = () => {
    if (listBuf.length === 0) return
    const items = listBuf.map((t, i) =>
      React.createElement('li', { key: `li-${idx}-${i}`, style: { margin: '2px 0' } }, ...renderInline(t, `li-${idx}-${i}`))
    )
    blocks.push(React.createElement('ul', { key: `ul-${idx++}`, style: { margin: '6px 0', paddingLeft: 22 } }, ...items))
    listBuf = []
  }
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '') { flushPara(); flushList(); continue }
    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) { flushPara(); listBuf.push(bullet[1]); continue }
    flushList()
    paraBuf.push(line)
  }
  flushPara()
  flushList()
  return React.createElement(React.Fragment, null, ...blocks)
}
