import { describe, expect, it } from 'vitest'
import { adjacentPosts, filterByTag, tagCounts } from './postUtils'

const posts = [
  { slug: 'c', tags: ['react', 'finance'] },
  { slug: 'b', tags: ['react'] },
  { slug: 'a', tags: ['mdx', 'react', 'react'] },
]

describe('tagCounts', () => {
  it('counts each tag once per post, most used first, then A→Z', () => {
    expect(tagCounts(posts)).toEqual([
      { tag: 'react', count: 3 },
      { tag: 'finance', count: 1 },
      { tag: 'mdx', count: 1 },
    ])
  })
  it('empty', () => expect(tagCounts([])).toEqual([]))
})

describe('filterByTag', () => {
  it('filters by tag', () => expect(filterByTag(posts, 'finance').map((p) => p.slug)).toEqual(['c']))
  it('no tag → everything', () => {
    expect(filterByTag(posts, null)).toBe(posts)
    expect(filterByTag(posts, '')).toBe(posts)
  })
  it('unknown tag → nothing', () => expect(filterByTag(posts, 'nope')).toEqual([]))
})

describe('adjacentPosts (newest-first list)', () => {
  it('middle post has both neighbours', () => expect(adjacentPosts(posts, 'b')).toEqual({ newer: posts[0], older: posts[2] }))
  it('newest has no newer', () => expect(adjacentPosts(posts, 'c')).toEqual({ newer: null, older: posts[1] }))
  it('oldest has no older', () => expect(adjacentPosts(posts, 'a')).toEqual({ newer: posts[1], older: null }))
  it('unknown slug', () => expect(adjacentPosts(posts, 'x')).toEqual({ newer: null, older: null }))
})
