import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'node:fs'
import path from 'node:path'

const buildTime = Date.now()

function versionBeaconPlugin() {
  return {
    name: 'version-beacon',
    buildStart() {
      const publicDir = path.resolve('public')
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }
      fs.writeFileSync(
        path.join(publicDir, 'version.json'),
        JSON.stringify({ version: '1.3.0', builtAt: buildTime }, null, 2),
      )
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: '1.3.0', builtAt: buildTime }, null, 2),
      })
    },
  }
}

export default defineConfig({
  define: {
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
    __APP_VERSION__: JSON.stringify('1.3.0'),
  },
  plugins: [
    versionBeaconPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.png',
        'version.json',
        'data/duas.json',
        'data/asma.json',
        'data/quran/**/*',
        'fonts/**/*',
        'audio/**/*',
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/version\.json/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,json,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /\/data\/quran\/.*\.json$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-offline-data',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Deen Space',
        short_name: 'Deen Space',
        description: 'Your pocket companion for Daily Adhkar, Duas, Tasbih, and the 99 Names of Allah. Works 100% offline.',
        theme_color: '#0c0f14',
        background_color: '#0c0f14',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'education'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [],
      },
    }),
  ],
})
