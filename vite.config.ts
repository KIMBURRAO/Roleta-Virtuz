/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const appBase = process.env.VITE_BASE_PATH?.trim() || '/'
const normalizedBase = appBase.endsWith('/') ? appBase : `${appBase}/`

// https://vite.dev/config/
export default defineConfig({
  base: normalizedBase,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/virtuz-mark-dark.png', 'brand/virtuz-logo-horizontal-light.png'],
      manifest: {
        name: 'Roleta Virtuz',
        short_name: 'Roleta Virtuz',
        description: 'Roleta promocional de brindes para eventos Virtuz.',
        theme_color: '#064F25',
        background_color: '#043F1E',
        display: 'standalone',
        orientation: 'any',
        start_url: normalizedBase,
        scope: normalizedBase,
        lang: 'pt-BR',
        icons: [
          { src: `${normalizedBase}brand/virtuz-mark-dark.png`, sizes: '1000x1000', type: 'image/png', purpose: 'any' },
          { src: `${normalizedBase}brand/virtuz-mark-dark.png`, sizes: '1000x1000', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: `${normalizedBase}index.html`,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpeg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//,
            handler: 'CacheFirst',
            options: { cacheName: 'virtuz-prize-images', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
