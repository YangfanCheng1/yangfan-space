import type { PostMeta } from './schema'

type Tagged = Pick<PostMeta, 'tags'>

/** Tags with post counts: most used first, then alphabetical. */
export function tagCounts(posts: Tagged[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of posts) for (const t of new Set(p.tags)) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/** Posts with a tag; no tag means all posts. */
export function filterByTag<T extends Tagged>(posts: T[], tag: string | null | undefined): T[] {
  return tag ? posts.filter((p) => p.tags.includes(tag)) : posts
}

/**
 * Neighbours in a newest-first list: `newer` is the post above, `older` the
 * one below. Either is null at the ends, or both when the slug isn't listed.
 */
export function adjacentPosts<T extends Pick<PostMeta, 'slug'>>(posts: T[], slug: string): { newer: T | null; older: T | null } {
  const i = posts.findIndex((p) => p.slug === slug)
  if (i === -1) return { newer: null, older: null }
  return { newer: posts[i - 1] ?? null, older: posts[i + 1] ?? null }
}
