/** Pure helpers for build/prerender.ts (kept separate so they're unit-testable). */

const HEAD_RE = /<!--head:start-->[\s\S]*?<!--head:end-->/
const ROOT = '<div id="root"></div>'

/** Put a page's head tags and rendered HTML into the index.html template. */
export function injectPage(template: string, { url, head, html }: { url: string; head: string; html: string }): string {
  if (!HEAD_RE.test(template)) throw new Error('index.html is missing the <!--head:start--> … <!--head:end--> markers')
  if (!template.includes(ROOT)) throw new Error(`index.html is missing ${ROOT}`)
  return template.replace(HEAD_RE, () => head).replace(ROOT, () => `<div id="root" data-prerendered="${url}">${html}</div>`)
}

/** dist file for a route: "/" → index.html, "/blog/x" → blog/x/index.html. */
export function outputPath(url: string): string {
  return url === '/' ? 'index.html' : `${url.replace(/^\/+|\/+$/g, '')}/index.html`
}

export function sitemapXml(siteUrl: string, urls: string[]): string {
  const base = siteUrl.replace(/\/+$/, '')
  const entries = urls.map((u) => `  <url><loc>${base}${u === '/' ? '/' : u}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl.replace(/\/+$/, '')}/sitemap.xml\n`
}
