import { compile } from '@mdx-js/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { describe, expect, it } from 'vitest'
import { remarkContentMeta } from './remarkContentMeta.ts'

const options = { remarkPlugins: [remarkFrontmatter, remarkGfm, remarkContentMeta, [remarkMdxFrontmatter, { name: 'frontmatter' }]] as never }
const POST = '/repo/src/content/posts/2026-10-20-hello-world.mdx'

const run = (value: string, path = POST) => compile({ path, value }, options)

describe('remarkContentMeta (build-time)', () => {
  it('validates, derives slug + reading time, and exports frontmatter', async () => {
    const prose = 'word '.repeat(460)
    const file = await run(`---\ntitle: Hello\ndate: 2026-10-20\nsummary: Hi.\ntags: [react]\n---\n\n${prose}\n\n\`\`\`ts\n${'code '.repeat(5000)}\n\`\`\`\n`)
    expect(file.data.meta).toEqual({ title: 'Hello', date: '2026-10-20', summary: 'Hi.', tags: ['react'], draft: false, slug: 'hello-world', readingMinutes: 2 })
    // The compiled module exports the normalized object.
    expect(String(file)).toMatch(/export const frontmatter = {[^}]*"slug": "hello-world"[^}]*"readingMinutes": 2/)
  })

  it('fails the build on invalid front matter, naming the file and field', async () => {
    await expect(run('---\ntitle: Hello\ndate: 2026-13-01\nsummary: Hi.\n---\nBody')).rejects.toThrow(
      /src\/content\/posts\/2026-10-20-hello-world\.mdx: "date" must be a date/,
    )
  })

  it('fails on missing front matter', async () => {
    await expect(run('Just a body.')).rejects.toThrow(/missing front matter/)
  })

  it('fails on broken YAML', async () => {
    await expect(run('---\ntitle: [unclosed\n---\nBody')).rejects.toThrow(/isn't valid YAML/)
  })

  it('leaves non-post MDX alone', async () => {
    const file = await run('# Just MDX', '/repo/src/content/projects/x.mdx')
    expect(file.data.meta).toBeUndefined()
  })
})

describe('drafts in production builds', () => {
  it('drops the body of a draft when NODE_ENV=production', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const file = await run('---\ntitle: Secret\ndate: 2026-10-20\nsummary: Hi.\ndraft: true\n---\n\nUnpublished words.')
      expect(String(file)).not.toContain('Unpublished words')
      expect(file.data.meta).toMatchObject({ draft: true })
    } finally {
      process.env.NODE_ENV = prev
    }
  })

  it('keeps the body of a published post', async () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const file = await run('---\ntitle: Public\ndate: 2026-10-20\nsummary: Hi.\n---\n\nPublished words.')
      expect(String(file)).toContain('Published words')
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
