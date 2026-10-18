/**
 * Step 3 of `npm run build` (spec §8, P5): turn each portfolio route into a
 * static HTML file with its own <head> (title, description, Open Graph), so
 * link previews and search engines see real content. Run after the client
 * build (dist/) and the SSR build (dist-ssr/).
 *
 * Writes:
 *   dist/<route>/index.html   one per page, hydrated in the browser
 *   dist/app-shell.html       the untouched template, served for client-only
 *                             routes such as /personal-finance (see P6 nginx)
 *   dist/404.html             a pre-rendered "not found" page
 *   dist/sitemap.xml, dist/robots.txt
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { injectPage, outputPath, robotsTxt, sitemapXml } from './prerenderHtml.ts'

type Server = {
  prerenderRoutes(): string[]
  render(url: string, siteUrl: string): Promise<{ html: string; head: string }>
}

const dist = resolve('dist')
const server = (await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)) as Server

let siteUrl = process.env.SITE_URL
if (!siteUrl) {
  siteUrl = 'http://localhost:5173'
  console.warn('⚠ SITE_URL is not set, so canonical and link-preview URLs point to localhost. Set SITE_URL when building for deployment.')
}

const template = await readFile(join(dist, 'index.html'), 'utf8')
await writeFile(join(dist, 'app-shell.html'), template)

const routes = server.prerenderRoutes()
for (const url of routes) {
  const page = injectPage(template, { url, ...(await server.render(url, siteUrl)) })
  const file = join(dist, outputPath(url))
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, page)
}

const notFound = await server.render('/404', siteUrl)
await writeFile(join(dist, '404.html'), injectPage(template, { url: '/404', ...notFound }))
await writeFile(join(dist, 'sitemap.xml'), sitemapXml(siteUrl, routes))
await writeFile(join(dist, 'robots.txt'), robotsTxt(siteUrl))

console.log(`✓ pre-rendered ${routes.length} pages (+ 404, app shell, sitemap.xml, robots.txt)`)
for (const r of routes) console.log(`  ${r}`)
