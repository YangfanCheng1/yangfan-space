import type { MDXContent } from 'mdx/types'
import { sortPosts, visiblePosts } from './schema'
import type { PostMeta } from './schema'

/**
 * Blog posts from src/content/posts/*.mdx. Front matter is loaded eagerly
 * (small, needed for lists); each post's body is a separate lazy chunk.
 */
const metaByPath = import.meta.glob<PostMeta>('./posts/*.mdx', { query: '?meta', eager: true, import: 'frontmatter' })
const bodyByPath = import.meta.glob<{ default: MDXContent }>('./posts/*.mdx')

const pathBySlug = new Map<string, string>()
for (const [path, meta] of Object.entries(metaByPath)) {
  const clash = pathBySlug.get(meta.slug)
  if (clash) throw new Error(`Two posts share the slug "${meta.slug}": ${clash} and ${path}`)
  pathBySlug.set(meta.slug, path)
}

/** Visible posts, newest first (drafts only in the dev server). */
export const posts: PostMeta[] = sortPosts(visiblePosts(Object.values(metaByPath), import.meta.env.PROD))

export function getPost(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug)
}

export async function loadPostBody(slug: string): Promise<MDXContent> {
  const path = pathBySlug.get(slug)
  if (!path) throw new Error(`No post "${slug}"`)
  return (await bodyByPath[path]()).default
}
