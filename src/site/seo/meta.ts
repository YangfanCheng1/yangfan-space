import { createContext } from 'react'

/**
 * Per-page metadata for <head>: title, description, canonical URL and the
 * Open Graph / Twitter tags link-preview bots read (spec G4, P5). Pages call
 * usePageMeta(); at build time the pre-renderer collects it through
 * MetaContext and writes it into each page's static HTML.
 */
export interface PageMeta {
  /** Page title without the site name; omit on the home page. */
  title?: string
  description: string
  /** Path only, e.g. /blog/hello. */
  path: string
  type?: 'website' | 'article'
  /** Path or absolute URL of the preview image. */
  image?: string
  /** YYYY-MM-DD, for articles. */
  publishedTime?: string
  /** Keep this page out of search results (e.g. 404). */
  noindex?: boolean
}

export const SITE_NAME = "Yangfan's Space"
export const DEFAULT_IMAGE = '/og-default.png'

/** Server-side collector: the pre-renderer passes a callback and keeps the last page metadata it receives. */
export const MetaContext = createContext<((meta: PageMeta) => void) | null>(null)

export const fullTitle = (m: Pick<PageMeta, 'title'>) => (m.title ? `${m.title} · ${SITE_NAME}` : SITE_NAME)

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const absolute = (base: string, pathOrUrl: string) => (/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : base.replace(/\/+$/, '') + pathOrUrl)

/** The <head> tags for a page, as an HTML string (used when pre-rendering). */
export function renderHeadTags(m: PageMeta, siteUrl: string): string {
  const url = absolute(siteUrl, m.path)
  const image = absolute(siteUrl, m.image ?? DEFAULT_IMAGE)
  const title = fullTitle(m)
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    m.noindex ? '<meta name="robots" content="noindex" />' : null,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:type" content="${m.type ?? 'website'}" />`,
    `<meta property="og:title" content="${esc(m.title ?? SITE_NAME)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    m.publishedTime ? `<meta property="article:published_time" content="${m.publishedTime}" />` : null,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title ?? SITE_NAME)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ]
  return tags.filter(Boolean).join('\n    ')
}

/** Client side: keep <head> in sync as the visitor navigates. */
export function applyMetaToDocument(m: PageMeta, doc: Document = document) {
  doc.title = fullTitle(m)
  const set = (attr: 'name' | 'property', key: string, value: string | null) => {
    let el = doc.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (value === null) return el?.remove()
    if (!el) {
      el = doc.createElement('meta')
      el.setAttribute(attr, key)
      doc.head.appendChild(el)
    }
    el.content = value
  }
  const origin = doc.location?.origin ?? ''
  set('name', 'description', m.description)
  set('name', 'robots', m.noindex ? 'noindex' : null)
  set('property', 'og:type', m.type ?? 'website')
  set('property', 'og:title', m.title ?? SITE_NAME)
  set('property', 'og:description', m.description)
  set('property', 'og:url', absolute(origin, m.path))
  set('property', 'og:image', absolute(origin, m.image ?? DEFAULT_IMAGE))
  set('property', 'article:published_time', m.publishedTime ?? null)
  set('name', 'twitter:title', m.title ?? SITE_NAME)
  set('name', 'twitter:description', m.description)
  let canonical = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = doc.createElement('link')
    canonical.rel = 'canonical'
    doc.head.appendChild(canonical)
  }
  canonical.href = absolute(origin, m.path)
}
