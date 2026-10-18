import type { PostMeta } from '../src/content/schema.ts'

/** RSS 2.0 feed for the blog (spec BL4). Pure: the plugin feeds it published posts. */
export interface FeedOptions {
  /** Absolute origin, e.g. https://example.com (no trailing slash needed). */
  siteUrl: string
  title: string
  description: string
  /** Newest first; drafts already removed. */
  posts: Pick<PostMeta, 'slug' | 'title' | 'date' | 'summary' | 'tags'>[]
  /** For lastBuildDate; injectable for tests. */
  now?: Date
}

export const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** YYYY-MM-DD → RFC 822 date at noon UTC (avoids the day shifting across time zones). */
const rfc822 = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).toUTCString()

export function buildRss({ siteUrl, title, description, posts, now = new Date() }: FeedOptions): string {
  const base = siteUrl.replace(/\/+$/, '')
  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${rfc822(p.date)}</pubDate>`,
        `      <description>${escapeXml(p.summary)}</description>`,
        ...p.tags.map((t) => `      <category>${escapeXml(t)}</category>`),
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(base)}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(base)}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}
