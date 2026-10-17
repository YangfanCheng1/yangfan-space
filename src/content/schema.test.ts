import { describe, expect, it } from 'vitest'
import { ContentError, readingMinutes, slugFromPath, sortPosts, validatePost, visiblePosts } from './schema'

const F = 'src/content/posts/x.mdx'
const valid = { title: 'Hello', date: '2026-10-20', summary: 'A post.', tags: ['react', 'data-viz'] }

describe('validatePost', () => {
  it('accepts a minimal post and fills defaults', () => {
    expect(validatePost({ title: ' Hello ', date: '2026-10-20', summary: ' A post. ' }, F)).toEqual({
      title: 'Hello',
      date: '2026-10-20',
      summary: 'A post.',
      tags: [],
      draft: false,
    })
  })

  it('accepts all optional fields', () => {
    expect(validatePost({ ...valid, updated: '2026-10-22', cover: './c.png', draft: true }, F)).toMatchObject({
      updated: '2026-10-22',
      cover: './c.png',
      draft: true,
    })
  })

  it('normalizes YAML Date objects', () => {
    expect(validatePost({ ...valid, date: new Date('2026-10-20T00:00:00Z') }, F).date).toBe('2026-10-20')
  })

  it.each<[string, Record<string, unknown> | undefined, RegExp]>([
    ['no front matter', undefined, /missing front matter/],
    ['no title', { ...valid, title: '' }, /"title" is required/],
    ['no summary', { ...valid, summary: undefined }, /"summary" is required/],
    ['long summary', { ...valid, summary: 'x'.repeat(201) }, /under 200 characters/],
    ['bad date format', { ...valid, date: '10/20/2026' }, /"date" must be a date/],
    ['impossible date', { ...valid, date: '2026-02-30' }, /not a real date/],
    ['updated before date', { ...valid, updated: '2026-10-01' }, /earlier than "date"/],
    ['uppercase tag', { ...valid, tags: ['React'] }, /"tags" must be/],
    ['tags not a list', { ...valid, tags: 'react' }, /"tags" must be/],
    ['draft not boolean', { ...valid, draft: 'yes' }, /"draft" must be true or false/],
    ['typo in a field name', { ...valid, sumary: 'x' }, /unknown front-matter field "sumary"/],
  ])('rejects %s', (_, data, msg) => {
    expect(() => validatePost(data, F)).toThrow(ContentError)
    expect(() => validatePost(data, F)).toThrow(msg)
  })

  it('error messages name the file', () => {
    expect(() => validatePost({ ...valid, title: '' }, F)).toThrow(/^src\/content\/posts\/x\.mdx: /)
  })
})

describe('slugFromPath', () => {
  it('strips folder, extension and a leading date', () => {
    expect(slugFromPath('src/content/posts/2026-10-20-hello-world.mdx')).toBe('hello-world')
    expect(slugFromPath('C:\\x\\posts\\no-date.mdx')).toBe('no-date')
  })
})

describe('readingMinutes', () => {
  it('230 words per minute, rounded up, at least 1', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes('word '.repeat(230))).toBe(1)
    expect(readingMinutes('word '.repeat(231))).toBe(2)
    expect(readingMinutes('word '.repeat(1150))).toBe(5)
  })
})

describe('sortPosts / visiblePosts', () => {
  const posts = [
    { title: 'B', date: '2026-01-01', draft: false },
    { title: 'A', date: '2026-03-01', draft: true },
    { title: 'C', date: '2026-01-01', draft: false },
  ]
  it('newest first, ties by title', () => expect(sortPosts(posts).map((p) => p.title)).toEqual(['A', 'B', 'C']))
  it('drafts hidden in production only', () => {
    expect(visiblePosts(posts, true).map((p) => p.title)).toEqual(['B', 'C'])
    expect(visiblePosts(posts, false)).toHaveLength(3)
  })
})
