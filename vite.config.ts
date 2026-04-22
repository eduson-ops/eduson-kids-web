import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages деплоит приложение на /<repo>/, поэтому в проде нужен base.
// Локально (npm run dev) base = '/'.
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/eduson-kids-web/' : '/',
}))
