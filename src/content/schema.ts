/**
 * Front-matter schema for blog posts (spec §6). Pure TypeScript: used by the
 * build-time remark plugin (Node) and by the site (browser) and tests.
 * Invalid front matter throws ContentError, which fails `vite build`.
 */

export interface PostFrontmatter {
  title: string
  /** YYYY-MM-DD */
  date: string
  updated?: string
  summary: string
  tags: string[]
  cover?: string
  draft: boolean
}

/** What the site sees: validated front matter plus derived fields. */
export interface PostMeta extends PostFrontmatter {
  slug: string
  readingMinutes: number
}

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`${file}: ${message}`)
    this.name = 'ContentError'
  }
}

const DATE_RE = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const WORDS_PER_MINUTE = 230

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** YAML may give dates as strings or Date objects; normalize to YYYY-MM-DD and check it's a real day. */
function toISODate(v: unknown, field: string, file: string): string {
  const s = v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : v
  if (typeof s !== 'string' || !DATE_RE.test(s)) throw new ContentError(file, `"${field}" must be a date like 2026-10-20 (got ${JSON.stringify(v)}).`)
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) throw new ContentError(file, `"${field}" is not a real date (${s}).`)
  return s
}

/** posts/2026-10-20-hello-world.mdx → "hello-world" (a leading date is optional). */
export function slugFromPath(path: string): string {
  const base = path.replace(/\\/g, '/').split('/').pop()!.replace(/\.mdx?$/, '')
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function validatePost(data: unknown, file: string): PostFrontmatter {
  if (!isObj(data)) throw new ContentError(file, 'missing front matter (--- title: … --- at the top).')
  const known = new Set(['title', 'date', 'updated', 'summary', 'tags', 'cover', 'draft'])
  for (const k of Object.keys(data)) if (!known.has(k)) throw new ContentError(file, `unknown front-matter field "${k}".`)

  const { title, date, updated, summary, tags, cover, draft } = data
  if (typeof title !== 'string' || !title.trim()) throw new ContentError(file, '"title" is required.')
  if (typeof summary !== 'string' || !summary.trim()) throw new ContentError(file, '"summary" is required (one sentence for lists and link previews).')
  if (summary.length > 200) throw new ContentError(file, `"summary" should be under 200 characters (has ${summary.length}).`)
  const tagList = tags === undefined ? [] : tags
  if (!Array.isArray(tagList) || !tagList.every((t) => typeof t === 'string' && SLUG_RE.test(t)))
    throw new ContentError(file, '"tags" must be a list of lowercase-hyphenated words, e.g. [react, data-viz].')
  if (cover !== undefined && typeof cover !== 'string') throw new ContentError(file, '"cover" must be an image path.')
  if (draft !== undefined && typeof draft !== 'boolean') throw new ContentError(file, '"draft" must be true or false.')

  const out: PostFrontmatter = {
    title: title.trim(),
    date: toISODate(date, 'date', file),
    summary: summary.trim(),
    tags: tagList as string[],
    draft: draft === true,
  }
  if (updated !== undefined) {
    out.updated = toISODate(updated, 'updated', file)
    if (out.updated < out.date) throw new ContentError(file, '"updated" is earlier than "date".')
  }
  if (cover !== undefined) out.cover = cover as string
  return out
}

/** Newest first; ties broken by title so order is stable. */
export function sortPosts<T extends Pick<PostMeta, 'date' | 'title'>>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

/** Drafts are visible in the dev server, hidden in production builds (spec BL3). */
export function visiblePosts<T extends Pick<PostMeta, 'draft'>>(posts: T[], isProduction: boolean): T[] {
  return isProduction ? posts.filter((p) => !p.draft) : posts
}
