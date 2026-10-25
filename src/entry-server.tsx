import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { apps } from './apps/registry'
import { AppRoutes } from './AppRoutes'
import { posts } from './content/posts'
import { projects } from './content/projects'
import { MetaContext, renderHeadTags } from './site/seo/meta'
import type { PageMeta } from './site/seo/meta'
import { PreloadContext, preloadForPath } from './site/preload'

/**
 * Build-time renderer (spec §8, P5). `vite build --ssr src/entry-server.tsx`
 * bundles this; build/prerender.ts calls it once per route and writes the
 * HTML into dist/. Apps are deliberately absent: they're per-visitor and private.
 */
export function prerenderRoutes(): string[] {
  return ['/', '/projects', '/blog', '/about', ...projects.map((p) => `/projects/${p.slug}`), ...posts.map((p) => `/blog/${p.slug}`)]
}

/** Client-only app paths (never pre-rendered); nginx serves them the empty app shell. */
export function appSlugs(): string[] {
  return apps.map((a) => a.slug)
}

export async function render(url: string, siteUrl: string): Promise<{ html: string; head: string; meta: PageMeta }> {
  const preloaded = await preloadForPath(url)
  let pageMeta: PageMeta | null = null
  const collect = (m: PageMeta) => {
    pageMeta = m
  }
  const html = renderToString(
    <MetaContext.Provider value={collect}>
      <PreloadContext.Provider value={preloaded}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </PreloadContext.Provider>
    </MetaContext.Provider>,
  )
  const meta = pageMeta as PageMeta | null
  if (!meta) throw new Error(`${url} rendered without page metadata (usePageMeta)`)
  return { html, head: renderHeadTags(meta, siteUrl), meta }
}
