import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [
    vue(),
    // Education-focused palette (design_spec.md §8.2): indigo primary, teal accent,
    // slate neutrals. Nuxt UI palettes only — the tokens do the rest.
    ui({
      ui: {
        colors: {
          primary: 'indigo',
          secondary: 'teal',
          neutral: 'slate'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // The Nitro API runs on :3001 (nitro.config.ts). Proxying keeps the
    // browser on a single origin so the session cookie stays first-party,
    // and so video streaming and the SPA share one address in development.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/media': { target: 'http://localhost:3001', changeOrigin: true }
    }
  }
})
