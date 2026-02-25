import path from "path"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  server: {
    open: true, // Abre o navegador ao iniciar
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Bolão Brasileirão',
        short_name: 'Bolão',
        description: 'Bolão do Campeonato Brasileiro Série A',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/icon-512.png'], // Ícone grande, carrega sob demanda
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.thesportsdb\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-thesportsdb',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1h
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // react-hook-form: index.esm.mjs ausente na instalação — usa CJS
      "react-hook-form": path.resolve(__dirname, "node_modules/react-hook-form/dist/index.cjs.js"),
    },
  },
});
