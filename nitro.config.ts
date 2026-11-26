import { fileURLToPath } from 'node:url'
import { defineNitroConfig } from 'nitropack/config'

// Built single-page app. Resolved absolutely because Nitro resolves asset
// directories relative to `srcDir` (`server/`), not the project root.
const distDir = fileURLToPath(new URL('./dist', import.meta.url))

export default defineNitroConfig({
  // Server code lives in server/: routes in api/, shared helpers in utils/.
  srcDir: 'server',
  compatibilityDate: '2026-11-18',

  // The Vite dev server owns :5173 and proxies /api and /media here, so a
  // browser sees one origin and the session cookie stays first-party. The port
  // itself comes from the `dev:api` script — Nitro 2.13's config has no
  // `devServer.port` key, so setting one here would be silently ignored.

  // In production this same server also hands out the built SPA.
  publicAssets: [{ dir: distDir, baseURL: '/', maxAge: 60 * 60 }],

  // Deep links. The Vue router uses history mode, so `/browse` and
  // `/watch/<id>` only exist in the browser: without a rewrite a hard refresh
  // or a shared link reaches the function, finds no matching route and 404s.
  // The route runs before Vercel's filesystem handler, so it must step aside
  // for the API, the media route, and any real file (assets, index.html,
  // favicon) — those have a dot in their final segment.
  vercel: {
    config: {
      routes: [{ src: '/((?!api/|media/)[^.]*)', dest: '/index.html' }]
    }
  },

  // Prisma ships a native query engine that must stay a real file on disk
  // rather than being inlined into the server bundle.
  externals: { external: ['@prisma/client', '.prisma/client'] }
})
