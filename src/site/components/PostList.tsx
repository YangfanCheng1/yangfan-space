import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
import type { PostMeta } from '@/content/schema'
import { formatDate, formatReading } from '../lib/format'

/** Post rows for the blog index and the home page (spec BL1, HM3). */
export function PostList({ posts, headingLevel = 2 }: { posts: PostMeta[]; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <ul className="ink-border shadow-pop divide-y-[2.5px] divide-ink bg-paper">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link to={`/blog/${p.slug}`} className="group block px-5 py-5 hover:bg-mustard/20 sm:px-6">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase">
              <time dateTime={p.date}>{formatDate(p.date)}</time>
              <span aria-hidden>·</span>
              <span>{formatReading(p.readingMinutes)}</span>
              {p.draft && <Badge tone="mustard">Draft</Badge>}
            </p>
            <H className="mt-2 font-display text-xl leading-tight uppercase group-hover:underline sm:text-2xl">{p.title}</H>
            <p className="mt-2 max-w-prose text-sm text-ink/75 sm:text-base">{p.summary}</p>
            {p.tags.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <Badge key={t}>#{t}</Badge>
                ))}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
