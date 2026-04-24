#!/usr/bin/env node
/**
 * Sync self-hosted Pyodide bundle into public/pyodide/.
 *
 * Why: jsdelivr CDN periodically gets blocked on hotel/conference Wi-Fi, which
 * killed Pyodide loading mid-demo. Self-hosting avoids the CDN dependency and
 * makes the Studio Python runtime work fully offline (PWA + Capacitor).
 *
 * Usage:
 *   node scripts/sync-pyodide.mjs            # fetch pinned version (PYODIDE_VERSION)
 *   PYODIDE_VERSION=0.27.0 node scripts/sync-pyodide.mjs  # override
 *
 * Files fetched (core runtime; no .whl packages — мы не вызываем loadPackage):
 *   pyodide.mjs, pyodide.js, pyodide.asm.js, pyodide.asm.wasm,
 *   python_stdlib.zip, pyodide-lock.json, package.json
 *
 * Если в будущем понадобится `pyodide.loadPackage('numpy')` — добавьте имена
 * пакетов в EXTRA_PACKAGES; скрипт скачает соответствующие *.whl-файлы из
 * pyodide-lock.json вместе с зависимостями.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PYODIDE_VERSION = process.env.PYODIDE_VERSION ?? '0.26.2'
const CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`
const CORE_FILES = [
  'pyodide.mjs',
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
  'package.json',
]
const EXTRA_PACKAGES = [] // e.g. ['numpy', 'micropip']

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'pyodide')

async function fetchTo(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
  return buf.length
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Pyodide ${PYODIDE_VERSION} -> ${OUT_DIR}`)

  let total = 0
  for (const f of CORE_FILES) {
    const size = await fetchTo(`${CDN_BASE}/${f}`, join(OUT_DIR, f))
    total += size
    console.log(`  ${f}  ${(size / 1024).toFixed(1)} KB`)
  }

  if (EXTRA_PACKAGES.length > 0) {
    const lockRaw = await (await fetch(`${CDN_BASE}/pyodide-lock.json`)).text()
    const lock = JSON.parse(lockRaw)
    const queue = new Set(EXTRA_PACKAGES)
    const seen = new Set()
    while (queue.size) {
      const name = [...queue][0]
      queue.delete(name)
      if (seen.has(name)) continue
      seen.add(name)
      const pkg = lock.packages?.[name]
      if (!pkg) {
        console.warn(`  skip (not in lock): ${name}`)
        continue
      }
      for (const dep of pkg.depends ?? []) queue.add(dep)
      const size = await fetchTo(`${CDN_BASE}/${pkg.file_name}`, join(OUT_DIR, pkg.file_name))
      total += size
      console.log(`  ${pkg.file_name}  ${(size / 1024).toFixed(1)} KB`)
    }
  }

  console.log(`Done. Total: ${(total / 1024 / 1024).toFixed(2)} MB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
