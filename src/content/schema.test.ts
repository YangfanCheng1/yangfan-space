import { describe, expect, it } from 'vitest'
import { ContentError, readingMinutes, slugFromPath, sortPosts, sortProjects, validatePost, validateProject, visiblePosts } from './schema'

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

describe('validateProject', () => {
  const P = 'src/content/projects/p.mdx'
  const base = { title: 'Personal Finance', tagline: 'Count it.', summary: 'Net worth + FIRE.', year: 2026, role: 'Solo', status: 'live', live: '/personal-finance' }

  it('accepts a minimal live project and fills defaults', () => {
    expect(validateProject(base, P)).toEqual({ ...base, stack: [], tags: [], featured: false, order: 100, accent: 'teal' })
  })

  it('accepts all optional fields', () => {
    const full = { ...base, stack: ['React', ' TypeScript '], tags: ['react', 'data-viz'], source: 'https://github.com/x/y', featured: true, order: 1, accent: 'vermilion' }
    expect(validateProject(full, P)).toMatchObject({ stack: ['React', 'TypeScript'], featured: true, order: 1, accent: 'vermilion', source: 'https://github.com/x/y' })
  })

  it('external live URLs are fine; planned projects need no link', () => {
    expect(validateProject({ ...base, live: 'https://example.com/app' }, P).live).toBe('https://example.com/app')
    const planned = validateProject({ ...base, status: 'planned', live: undefined }, P)
    expect(planned.status).toBe('planned')
    expect(planned).not.toHaveProperty('live')
  })

  it.each<[string, Record<string, unknown>, RegExp]>([
    ['no tagline', { ...base, tagline: '' }, /"tagline" is required/],
    ['bad year', { ...base, year: '2026' }, /"year" must be a year/],
    ['bad status', { ...base, status: 'done' }, /"status" must be one of/],
    ['live without link', { ...base, live: undefined }, /needs a "live" link/],
    ['relative-but-not-absolute live', { ...base, live: 'personal-finance' }, /"live" must be a site path/],
    ['source not a URL', { ...base, source: 'github.com/x' }, /"source" must be a full URL/],
    ['bad accent', { ...base, accent: 'pink' }, /"accent" must be one of/],
    ['stack not a list', { ...base, stack: 'React' }, /"stack" must be a list/],
    ['uppercase tag', { ...base, tags: ['React'] }, /"tags" must be/],
    ['typo', { ...base, feautred: true }, /unknown front-matter field "feautred"/],
  ])('rejects %s', (_, data, msg) => expect(() => validateProject(data, P)).toThrow(msg))
})

describe('sortProjects', () => {
  it('by order, then newest year, then title', () => {
    const ps = [
      { title: 'B', order: 100, year: 2025 },
      { title: 'A', order: 100, year: 2025 },
      { title: 'New', order: 100, year: 2026 },
      { title: 'First', order: 1, year: 2020 },
    ]
    expect(sortProjects(ps).map((p) => p.title)).toEqual(['First', 'New', 'A', 'B'])
  })
})
