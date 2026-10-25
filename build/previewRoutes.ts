import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Makes `vite preview` route the way production nginx does (deploy/nginx.conf):
 *   /projects                 → dist/projects/index.html   (pre-rendered page)
 *   /personal-finance/...     → dist/app-shell.html        (client-only app)
 *   /anything-else            → dist/404.html              (same page; only nginx also sends status 404)
 * Without this, preview only finds /projects/ with a trailing slash and falls
 * back to the pre-rendered home page for everything else.
 */
export function previewRoutes(): Plugin {
  return {
    name: 'yangfan:preview-routes',
    configurePreviewServer(server) {
      const dist = server.config.build.outDir
      // Written by build/prerender.ts from the app registry (single source of truth).
      const slugsFile = join(server.config.root, 'dist-nginx/app-slugs.json')
      const appSlugs: string[] = existsSync(slugsFile) ? JSON.parse(readFileSync(slugsFile, 'utf8')) : []
      const isApp = (path: string) => appSlugs.some((s) => path === `/${s}` || path.startsWith(`/${s}/`))
      server.middlewares.use((req, _res, next) => {
        const [path, query = ''] = (req.url ?? '/').split('?')
        if (req.method === 'GET' && path !== '/' && !/\.[a-z0-9]+$/i.test(path)) {
          const page = `${path.replace(/\/+$/, '').replace(/^\/+/, '')}/index.html`
          let target = '/404.html'
          if (isApp(path)) target = '/app-shell.html'
          else if (existsSync(join(dist, page))) target = `/${page}`
          req.url = target + (query ? `?${query}` : '')
        }
        next()
      })
    },
  }
}
