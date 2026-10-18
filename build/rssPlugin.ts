import type { CompileOptions } from '@mdx-js/mdx'
import type { Plugin } from 'vite'
import { sortPosts } from '../src/content/schema.ts'
import { readAllPostMeta } from './mdxMeta.ts'
import { buildRss } from './rss.ts'

export interface RssPluginOptions {
  postsDir: string
  metaOptions: CompileOptions
  title: string
  description: string
}

/**
 * Emits /rss.xml at build time and serves it in dev (spec BL4). Drafts are
 * never in the feed. Links need an absolute origin: set SITE_URL when building
 * for deployment (P6); without it the build warns and uses localhost.
 */
export function rssPlugin({ postsDir, metaOptions, title, description }: RssPluginOptions): Plugin {
  const feed = async (siteUrl: string) => {
    const posts = sortPosts((await readAllPostMeta(postsDir, metaOptions)).filter((p) => !p.draft))
    return buildRss({ siteUrl, title, description, posts })
  }

  let ssrBuild = false
  return {
    name: 'yangfan:rss',
    configResolved(config) {
      ssrBuild = Boolean(config.build.ssr)
    },
    configureServer(server) {
      server.middlewares.use('/rss.xml', async (req, res, next) => {
        try {
          const host = req.headers.host ?? 'localhost:5173'
          res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
          res.end(await feed(process.env.SITE_URL ?? `http://${host}`))
        } catch (e) {
          next(e)
        }
      })
    },
    async generateBundle() {
      if (ssrBuild) return // the feed belongs to the client build (dist/), not dist-ssr/
      let siteUrl = process.env.SITE_URL
      if (!siteUrl) {
        siteUrl = 'http://localhost:5173'
        this.warn('SITE_URL is not set, so rss.xml links point to localhost. Set SITE_URL when building for deployment.')
      }
      this.emitFile({ type: 'asset', fileName: 'rss.xml', source: await feed(siteUrl) })
    },
  }
}
