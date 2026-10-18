import { describe, expect, it } from 'vitest'
import { injectPage, outputPath, robotsTxt, sitemapXml } from './prerenderHtml.ts'

const template = `<html><head>
    <meta charset="UTF-8" />
    <!--head:start-->
    <title>Default</title>
    <!--head:end-->
  </head><body><div id="root"></div><script src="/x.js"></script></body></html>`

describe('injectPage', () => {
  const out = injectPage(template, { url: '/blog/x', head: '<title>Post</title>', html: '<main>Hello $& world</main>' })

  it('replaces the default head block', () => {
    expect(out).toContain('<title>Post</title>')
    expect(out).not.toContain('Default')
    expect(out).not.toContain('head:start')
  })

  it('fills #root and marks which path it was rendered for', () => {
    expect(out).toContain('<div id="root" data-prerendered="/blog/x"><main>Hello $& world</main></div>')
  })

  it('keeps everything else (charset, scripts)', () => {
    expect(out).toContain('<meta charset="UTF-8" />')
    expect(out).toContain('<script src="/x.js"></script>')
  })

  it('fails loudly if the template lost its markers', () => {
    expect(() => injectPage('<html></html>', { url: '/', head: '', html: '' })).toThrow(/head:start/)
    expect(() => injectPage('<!--head:start--><!--head:end-->', { url: '/', head: '', html: '' })).toThrow(/root/)
  })
})

describe('outputPath', () => {
  it('maps routes to files', () => {
    expect(outputPath('/')).toBe('index.html')
    expect(outputPath('/blog')).toBe('blog/index.html')
    expect(outputPath('/projects/personal-finance')).toBe('projects/personal-finance/index.html')
  })
})

describe('sitemap / robots', () => {
  it('absolute URLs, one per route', () => {
    const xml = sitemapXml('https://example.com/', ['/', '/blog'])
    expect(xml).toContain('<loc>https://example.com/</loc>')
    expect(xml).toContain('<loc>https://example.com/blog</loc>')
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })
  it('robots points at the sitemap', () => expect(robotsTxt('https://example.com')).toContain('Sitemap: https://example.com/sitemap.xml'))
})
