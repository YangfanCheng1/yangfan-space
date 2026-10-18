import { describe, expect, it } from 'vitest'
import { buildRss, escapeXml } from './rss.ts'

const now = new Date('2026-10-17T08:00:00Z')
const posts = [
  { slug: 'second', title: 'Tips & <tricks>', date: '2026-10-20', summary: 'He said "hi" & left.', tags: ['react', 'data-viz'] },
  { slug: 'first', title: 'First', date: '2026-01-02', summary: 'Hello.', tags: [] },
]

describe('buildRss', () => {
  const xml = buildRss({ siteUrl: 'https://example.com/', title: "Yangfan's Space", description: 'Notes & projects', posts, now })

  it('is an RSS 2.0 channel with a self link', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<title>Yangfan&apos;s Space</title>')
    expect(xml).toContain('<link>https://example.com/blog</link>')
    expect(xml).toContain('<atom:link href="https://example.com/rss.xml" rel="self"')
    expect(xml).toContain('<lastBuildDate>Sat, 17 Oct 2026 08:00:00 GMT</lastBuildDate>')
  })

  it('one item per post, in the given order, with absolute links', () => {
    expect(xml.match(/<item>/g)).toHaveLength(2)
    expect(xml.indexOf('/blog/second')).toBeLessThan(xml.indexOf('/blog/first'))
    expect(xml).toContain('<link>https://example.com/blog/second</link>')
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/blog/second</guid>')
  })

  it('escapes titles and summaries', () => {
    expect(xml).toContain('<title>Tips &amp; &lt;tricks&gt;</title>')
    expect(xml).toContain('<description>He said &quot;hi&quot; &amp; left.</description>')
    expect(xml).not.toMatch(/<title>Tips & </)
  })

  it('dates are RFC 822 and do not shift a day', () => {
    expect(xml).toContain('<pubDate>Tue, 20 Oct 2026 12:00:00 GMT</pubDate>')
    expect(xml).toContain('<pubDate>Fri, 02 Jan 2026 12:00:00 GMT</pubDate>')
  })

  it('tags become categories', () => {
    expect(xml).toContain('<category>react</category>')
    expect(xml).toContain('<category>data-viz</category>')
  })

  it('an empty blog is still a valid feed', () => {
    const empty = buildRss({ siteUrl: 'https://example.com', title: 'T', description: 'D', posts: [], now })
    expect(empty).toContain('<channel>')
    expect(empty).not.toContain('<item>')
  })
})

describe('escapeXml', () => {
  it('escapes all five entities', () => expect(escapeXml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&apos;'))
})
