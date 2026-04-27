// Generate PWA / iOS / Android app icons from the source SVG using sharp.
// Run with: npm run icons
import sharp from 'sharp'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const iconsDir = resolve(root, 'public', 'icons')
const sourcePath = resolve(iconsDir, 'icon-source.svg')

mkdirSync(iconsDir, { recursive: true })

const svgBuffer = readFileSync(sourcePath)

// Maskable: OS (Android adaptive icons) may crop ~10% from each edge.
// Render the SVG at 80% of canvas on a solid brand-bg square so the logo
// fits inside the ~409x409 safe zone of a 512x512 icon.
async function generateMaskable(outPath, size = 512) {
  const inner = Math.round(size * 0.8) // 80% of 512 = 409.6 -> 410 safe zone content
  const innerPng = await sharp(svgBuffer, { density: 512 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 12, g: 5, b: 51, alpha: 1 }, // #0C0533
    },
  })
    .composite([{ input: innerPng, gravity: 'center' }])
    .png()
    .toFile(outPath)
}

async function generate(outPath, size) {
  await sharp(svgBuffer, { density: Math.max(384, size) })
    .resize(size, size, { fit: 'contain', background: { r: 12, g: 5, b: 51, alpha: 1 } })
    .png()
    .toFile(outPath)
}

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon-32.png', size: 32, maskable: false },
  { name: 'favicon-16.png', size: 16, maskable: false },
]

console.log('Generating icons into', iconsDir)
for (const t of targets) {
  const out = resolve(iconsDir, t.name)
  if (t.maskable) await generateMaskable(out, t.size)
  else await generate(out, t.size)
  console.log('  wrote', t.name, `(${t.size}x${t.size})`)
}

// Emit a minimal manifest.webmanifest for vite-plugin-pwa fallback / reference
const manifest = {
  name: 'Eduson Kids',
  short_name: 'Eduson',
  description: 'Eduson Kids — строй 3D-миры, учись Python играя.',
  start_url: '/',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0C0533',
  theme_color: '#6B5CE7',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
writeFileSync(resolve(root, 'public', 'manifest.webmanifest'), JSON.stringify(manifest, null, 2))
console.log('  wrote public/manifest.webmanifest')

console.log('Done.')
