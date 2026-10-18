import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Makes `vite preview` serve pre-rendered pages the way production does
 * (nginx `try_files $uri $uri/index.html /app-shell.html`, see P6):
 *   /projects            → dist/projects/index.html (pre-rendered)
 *   /personal-finance    → dist/app-shell.html (client-only app, empty shell)
 * Without this, preview only finds /projects/ with a trailing slash and falls
 * back to the pre-rendered home page for everything else.
 */
export function previewRoutes(): Plugin {
  return {
    name: 'yangfan:preview-routes',
    configurePreviewServer(server) {
      const dist = server.config.build.outDir
      server.middlewares.use((req, _res, next) => {
        const [path, query = ''] = (req.url ?? '/').split('?')
        if (req.method === 'GET' && path !== '/' && !/\.[a-z0-9]+$/i.test(path)) {
          const page = join(path.replace(/\/+$/, ''), 'index.html')
          const target = existsSync(join(dist, page)) ? `/${page.replace(/\\/g, '/').replace(/^\/+/, '')}` : '/app-shell.html'
          req.url = target + (query ? `?${query}` : '')
        }
        next()
      })
    },
  }
}
