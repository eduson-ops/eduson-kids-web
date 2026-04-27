/**
 * Удаляет невалидный prop `rotation={...}` с тегов *Geometry в worlds/props/*.
 * Three.js игнорирует rotation на геометрии (его место — на mesh/group),
 * поэтому удаление безопасно: и визуал не меняется, и TS перестаёт ругаться.
 *
 * Запуск: node scripts/fix-geometry-rotation.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

// Простой list через fs.readdir вместо glob — Node 22+
import { readdirSync, statSync } from 'node:fs'

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.tsx')) out.push(p)
  }
  return out
}

const propsDir = join(repoRoot, 'src', 'components', 'worlds', 'props')
const files = walk(propsDir)

// Совпадение: <SomethingGeometry args={…} rotation={[…]} />  ИЛИ
//             <SomethingGeometry args={…} rotation={…array…}>…</…>
// Берём осторожно: только при наличии слова "Geometry" в открывающем теге.
const re = /(<[a-z]+Geometry\b[^>]*?)\s+rotation=\{\[[^\]]*\]\}([^>]*\/?>)/g

let totalFiles = 0
let totalReplacements = 0

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  let count = 0
  const next = src.replace(re, (_m, head, tail) => {
    count++
    return `${head}${tail}`
  })
  if (count > 0) {
    writeFileSync(f, next, 'utf8')
    totalFiles++
    totalReplacements += count
    console.log(`  [${count}] ${f.replace(repoRoot, '')}`)
  }
}

console.log(`\nDone: ${totalReplacements} replacement(s) in ${totalFiles} file(s).`)
