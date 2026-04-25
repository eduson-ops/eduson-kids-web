#!/usr/bin/env node
/**
 * D-17 — Pre-build PNG → WebP conversion.
 *
 * Walks `public/` recursively, для каждого .png > 100 KB генерит side-by-side .webp
 * (quality 80). Оригинальные PNG остаются — рантайм может выбрать формат через
 * <picture>/runtime feature-detect. Безопасно запускать повторно: skip если
 * .webp уже существует и новее исходного.
 *
 * Usage:
 *   npm run optimize:images
 */

import { readdir, stat, access } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PUBLIC_DIR = join(__dirname, '..', 'public')

const MIN_SIZE = 100 * 1024 // 100 KB
const QUALITY = 80

/** @type {{ scanned: number, converted: number, skipped: number, savedBytes: number, errors: number }} */
const report = {
  scanned: 0,
  converted: 0,
  skipped: 0,
  savedBytes: 0,
  errors: 0,
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
      yield full
    }
  }
}

async function convert(pngPath) {
  report.scanned += 1
  const pngStat = await stat(pngPath)
  if (pngStat.size < MIN_SIZE) {
    return
  }

  const webpPath = pngPath.replace(/\.png$/i, '.webp')
  if (await exists(webpPath)) {
    const webpStat = await stat(webpPath)
    if (webpStat.mtimeMs >= pngStat.mtimeMs) {
      report.skipped += 1
      return
    }
  }

  try {
    await sharp(pngPath).webp({ quality: QUALITY }).toFile(webpPath)
    const webpStat = await stat(webpPath)
    const saved = pngStat.size - webpStat.size
    report.converted += 1
    report.savedBytes += saved
    const pct = ((saved / pngStat.size) * 100).toFixed(1)
    console.log(
      `  ${pngPath.replace(PUBLIC_DIR, 'public')}  ${(pngStat.size / 1024).toFixed(0)} KB → ${(webpStat.size / 1024).toFixed(0)} KB  (-${pct}%)`,
    )
  } catch (err) {
    report.errors += 1
    console.error(`  ! failed: ${pngPath} — ${err.message}`)
  }
}

async function main() {
  console.log(`[optimize-images] scanning ${PUBLIC_DIR} (threshold ${MIN_SIZE / 1024} KB, quality ${QUALITY})`)
  if (!(await exists(PUBLIC_DIR))) {
    console.error(`[optimize-images] public directory not found: ${PUBLIC_DIR}`)
    process.exit(1)
  }

  for await (const png of walk(PUBLIC_DIR)) {
    await convert(png)
  }

  const savedMb = (report.savedBytes / 1024 / 1024).toFixed(2)
  console.log('')
  console.log(`[optimize-images] done`)
  console.log(`  scanned:   ${report.scanned}`)
  console.log(`  converted: ${report.converted}`)
  console.log(`  skipped:   ${report.skipped} (already up-to-date)`)
  console.log(`  errors:    ${report.errors}`)
  console.log(`  saved:     ${savedMb} MB`)

  if (report.errors > 0) process.exit(2)
}

main().catch((err) => {
  console.error('[optimize-images] fatal:', err)
  process.exit(1)
})
