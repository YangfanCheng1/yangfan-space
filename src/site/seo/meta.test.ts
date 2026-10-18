import { describe, expect, it } from 'vitest'
import { applyMetaToDocument, fullTitle, renderHeadTags } from './meta'

const post = { title: 'Tips & <tricks>', description: 'He said "hi".', path: '/blog/tips', type: 'article' as const, publishedTime: '2026-10-20' }

describe('renderHeadTags', () => {
  const html = renderHeadTags(post, 'https://example.com/')

  it('title, description, canonical', () => {
    expect(html).toContain("<title>Tips &amp; &lt;tricks&gt; · Yangfan's Space</title>")
    expect(html).toContain('<meta name="description" content="He said &quot;hi&quot;." />')
    expect(html).toContain('<link rel="canonical" href="https://example.com/blog/tips" />')
  })

  it('Open Graph + Twitter tags with absolute URLs', () => {
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="og:title" content="Tips &amp; &lt;tricks&gt;" />')
    expect(html).toContain('<meta property="og:url" content="https://example.com/blog/tips" />')
    expect(html).toContain('<meta property="og:image" content="https://example.com/og-default.png" />')
    expect(html).toContain('<meta property="article:published_time" content="2026-10-20" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
  })

  it('home page: site name as title, website type, no article date', () => {
    const home = renderHeadTags({ description: 'D', path: '/' }, 'https://example.com')
    expect(home).toContain("<title>Yangfan's Space</title>")
    expect(home).toContain('<meta property="og:type" content="website" />')
    expect(home).not.toContain('article:published_time')
    expect(home).not.toContain('noindex')
  })

  it('noindex and absolute image URLs pass through', () => {
    const nf = renderHeadTags({ title: 'Not found', description: 'D', path: '/x', noindex: true, image: 'https://cdn.example/x.png' }, 'https://example.com')
    expect(nf).toContain('<meta name="robots" content="noindex" />')
    expect(nf).toContain('content="https://cdn.example/x.png"')
  })
})

describe('fullTitle', () => {
  it('adds the site name', () => {
    expect(fullTitle({ title: 'Blog' })).toBe("Blog · Yangfan's Space")
    expect(fullTitle({})).toBe("Yangfan's Space")
  })
})

describe('applyMetaToDocument', () => {
  // Minimal fake document: enough for title, head.querySelector and createElement.
  function fakeDoc() {
    const nodes: Record<string, string>[] = []
    const make = (tag: string) => {
      const el: Record<string, unknown> = { tag, attrs: {} as Record<string, string> }
      el.setAttribute = (k: string, v: string) => ((el.attrs as Record<string, string>)[k] = v)
      el.remove = () => nodes.splice(nodes.indexOf(el as never), 1)
      return el
    }
    const head = {
      appendChild: (el: never) => nodes.push(el),
      querySelector: (sel: string) => {
        const m = /^(\w+)\[(\w+)="([^"]+)"\]$/.exec(sel)!
        return (nodes as never as Record<string, unknown>[]).find((n) => n.tag === m[1] && ((n.attrs as Record<string, string>)[m[2]] === m[3] || (m[2] === 'rel' && n.rel === m[3]))) ?? null
      },
    }
    return { doc: { title: '', head, createElement: make, location: { origin: 'http://localhost:5173' } } as unknown as Document, nodes }
  }

  it('sets title and tags, then updates and removes on the next page', () => {
    const { doc, nodes } = fakeDoc()
    applyMetaToDocument(post, doc)
    expect(doc.title).toBe("Tips & <tricks> · Yangfan's Space")
    const find = (k: string) => (nodes as never as Record<string, unknown>[]).find((n) => Object.values(n.attrs as object).includes(k)) as Record<string, unknown> | undefined
    expect(find('og:url')?.content).toBe('http://localhost:5173/blog/tips')
    expect(find('article:published_time')?.content).toBe('2026-10-20')

    applyMetaToDocument({ title: 'About', description: 'A', path: '/about' }, doc)
    expect(doc.title).toBe("About · Yangfan's Space")
    expect(find('og:url')?.content).toBe('http://localhost:5173/about')
    expect(find('article:published_time')).toBeUndefined()
  })
})
