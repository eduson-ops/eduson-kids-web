import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Четыре target-а одного vite-build:
//   1) GitHub Pages SPA — base = '/eduson-kids-web/'
//   2) Capacitor native shell — base = './' (assets относительны)
//   3) axsa — custom domain axsa.tech, base = '/'
//   4) dev — base = '/'
// Переключение: VITE_TARGET=capacitor | pwa | ghpages | axsa (default: ghpages в проде).
export default defineConfig(({ command, mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const target = env.VITE_TARGET || (command === 'build' ? 'ghpages' : 'dev')

  const baseByTarget: Record<string, string> = {
    dev: '/',
    ghpages: '/eduson-kids-web/',
    pwa: '/eduson-kids-web/',
    capacitor: './',
    axsa: '/',
  }
  // VITE_BASE override allows custom base path without adding new target
  // (e.g. VITE_BASE=/t/ for renamed repo). Trailing slash required.
  // Read from process.env (CLI) and loadEnv (.env files).
  const base = process.env.VITE_BASE || env.VITE_BASE || baseByTarget[target] || '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
        manifest: {
          name: 'Eduson Kids — 3D Coding',
          short_name: 'Eduson Kids',
          description: 'Строй 3D-миры, учись Python играя. Платформа 9-15 лет.',
          lang: 'ru',
          dir: 'ltr',
          start_url: target === 'capacitor' ? './' : base,
          scope: target === 'capacitor' ? './' : base,
          display: 'standalone',
          orientation: 'any',
          background_color: '#0C0533',
          theme_color: '#6B5CE7',
          categories: ['education', 'games', 'kids'],
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          ],
          screenshots: [],
          shortcuts: [
            { name: 'Уроки', short_name: 'Уроки', url: '/learn', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
            { name: 'Студия', short_name: 'Студия', url: '/studio', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
            { name: 'Играть', short_name: 'Играть', url: '/play', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          ],
        },
        workbox: {
          // .zip/.json/.mjs нужны для self-hosted Pyodide (см. public/pyodide/).
          globPatterns: ['**/*.{js,mjs,css,html,svg,png,jpg,jpeg,gif,webp,woff2,wasm,zip,json}'],
          globIgnores: ['**/ios/**', '**/android/**'],
          // pyodide.asm.wasm ~10 MB; lift cap so precache не выкидывает его.
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
          navigateFallback: target === 'capacitor' ? null : `${base}index.html`,
          // Skip API routes from precache so live requests always hit the network.
          // Offline writes are queued via BackgroundSyncPlugin (see runtimeCaching
          // entries below for /api/v1/projects writes).
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Pyodide теперь self-hosted из /pyodide/ — precache (globPatterns)
            // забирает .wasm/.zip/.mjs/.json. Runtime-cache для jsdelivr убран:
            // если URL когда-то снова станет внешним, добавим обратно.
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // Offline queue for project saves (PUT /api/v1/projects/:id)
            // When the network is unavailable, the request body is stored in
            // IndexedDB ('kubik-saves' queue) and replayed on reconnection.
            {
              urlPattern: ({ url, request }) => {
                return request.method === 'PUT'
                  && /\/api\/v1\/projects\/[a-f0-9-]+$/i.test(url.pathname)
              },
              handler: 'NetworkOnly',
              options: {
                backgroundSync: {
                  name: 'kubik-saves',
                  options: {
                    maxRetentionTime: 7 * 24 * 60, // 7 days, in minutes
                  },
                },
              },
              method: 'PUT',
            },
            // Same pattern for AI-pipeline submissions — survive flaky uplinks
            {
              urlPattern: ({ url, request }) => {
                return request.method === 'POST'
                  && /\/api\/v1\/admin\/ai\/lessons\/generate$/i.test(url.pathname)
              },
              handler: 'NetworkOnly',
              options: {
                backgroundSync: {
                  name: 'kubik-ai-jobs',
                  options: { maxRetentionTime: 24 * 60 },
                },
              },
              method: 'POST',
            },
            // Cache GET project reads stale-while-revalidate so opening Studio
            // offline shows last known state.
            {
              urlPattern: /\/api\/v1\/projects(\/[a-f0-9-]+)?(\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'projects-api',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
              method: 'GET',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    // D2-15: на проде убираем console.log/warn/info/debug, но СОХРАНЯЕМ console.error
    // — он остаётся для legitimate error reporting (Sentry, ErrorBoundary, Pyodide
    // crash logs). `pure` помечает вызовы как чистые → tree-shaker дропает их,
    // если результат не используется (а у console.* он почти никогда не нужен).
    // `drop: ['debugger']` снимает оставшиеся `debugger` statements.
    // Cast: vite ESBuildOptions не экспортит drop/pure в типах (esbuild помечен
    // // @ts-ignore в vite/types), но они валидны в runtime esbuild API.
    esbuild: ({
      drop: command === 'build' ? ['debugger'] : [],
      pure: command === 'build'
        ? ['console.log', 'console.warn', 'console.info', 'console.debug', 'console.trace']
        : [],
    } as unknown) as UserConfig['esbuild'],
    build: {
      target: 'es2020',
      minify: 'esbuild',
      // D-16: 'hidden' — карты ГЕНЕРЯТСЯ при build (доступны локально для post-mortem
      // если что-то упадёт на демо), но без `//# sourceMappingURL=…` комментария
      // в .js-бандлах — публично они не утекают (Capacitor/iOS бандлы тоже чисты).
      sourcemap: 'hidden',
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('/react-router-dom/') || id.includes('/react-router/') || /[/\\]node_modules[/\\]react[/\\]/.test(id) || /[/\\]node_modules[/\\]react-dom[/\\]/.test(id) || id.includes('scheduler')) return 'vendor-react'
            if (id.includes('@react-three/rapier') || id.includes('@dimforge')) return 'vendor-physics'
            if (id.includes('@react-three/postprocessing') || id.includes('/postprocessing/')) return 'vendor-postfx'
            if (id.includes('@react-three/fiber') || id.includes('@react-three/drei') || /[/\\]node_modules[/\\]three[/\\]/.test(id)) return 'vendor-three'
            if (id.includes('/blockly/')) return 'vendor-blockly'
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) return 'vendor-monaco'
            if (id.includes('/@codemirror/') || id.includes('/codemirror/')) return 'vendor-codemirror'
            if (id.includes('@livekit') || id.includes('livekit-client')) return 'vendor-livekit'
            if (id.includes('socket.io-client')) return 'vendor-socket'
            if (id.includes('/howler/')) return 'vendor-audio'
            if (id.includes('@capacitor/')) return 'vendor-capacitor'
            return undefined
          },
        },
      },
    },
  }
})
