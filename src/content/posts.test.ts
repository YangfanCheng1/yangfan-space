import { describe, expect, it } from 'vitest'
import { getPost, loadPostBody, posts } from './posts'

// Runs the real content through the real Vite pipeline (mdxMeta + MDX plugins).
describe('content/posts', () => {
  it('loads every post with valid metadata, newest first', () => {
    expect(posts.length).toBeGreaterThan(0)
    for (const p of posts) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/)
      expect(p.readingMinutes).toBeGreaterThanOrEqual(1)
    }
    const dates = posts.map((p) => p.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('slugs are unique', () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length)
  })

  it('drafts are visible outside production (the sample post)', () => {
    expect(getPost('sample-mdx-pipeline')?.draft).toBe(true)
  })

  it('each post body loads as a component', async () => {
    for (const p of posts) expect(typeof (await loadPostBody(p.slug))).toBe('function')
  })

  it('unknown slugs are undefined / rejected', async () => {
    expect(getPost('nope')).toBeUndefined()
    await expect(loadPostBody('nope')).rejects.toThrow(/No post/)
  })
})
