import { useEffect, useState } from 'react'
import type { MDXContent } from 'mdx/types'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { adjacentPosts } from '@/content/postUtils'
import { getPost, loadPostBody, posts } from '@/content/posts'
import type { PostMeta } from '@/content/schema'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatReading } from '../lib/format'
import { mdxComponents } from '../mdx/components'
import '../prose.css'
import { NotFound } from './NotFound'

function Neighbour({ post, dir }: { post: PostMeta; dir: 'newer' | 'older' }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      rel={dir === 'newer' ? 'next' : 'prev'}
      className={`ink-border shadow-pop pressable block bg-paper px-4 py-3 ${dir === 'older' ? 'sm:text-right' : ''}`}
    >
      <span className="font-mono text-xs font-bold uppercase">{dir === 'newer' ? '← Newer' : 'Older →'}</span>
      <span className="mt-1 block font-display leading-tight uppercase">{post.title}</span>
    </Link>
  )
}

/** /blog/:slug (spec BL2). */
export function Post() {
  const { slug = '' } = useParams()
  const { hash } = useLocation()
  const meta = getPost(slug)
  const [body, setBody] = useState<{ slug: string; Content: MDXContent } | null>(null)

  useDocumentTitle(meta?.title ?? 'Not found')

  useEffect(() => {
    if (!meta) return
    let cancelled = false
    loadPostBody(slug).then((Content) => {
      if (!cancelled) setBody({ slug, Content })
    })
    return () => {
      cancelled = true
    }
  }, [slug, meta])

  const Content = body?.slug === slug ? body.Content : null

  // The body loads after the page, so the browser can't jump to #section by itself.
  useEffect(() => {
    if (Content && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [Content, hash])

  if (!meta) return <NotFound />
  const { newer, older } = adjacentPosts(posts, slug)

  return (
    <article className="mx-auto max-w-[68ch]">
      <Link to="/blog" className="font-mono text-xs font-bold uppercase underline-offset-4 hover:underline">
        ← All posts
      </Link>
      <header className="mt-6 mb-10">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          {meta.updated && (
            <>
              <span aria-hidden>·</span>
              <span>
                Updated <time dateTime={meta.updated}>{formatDate(meta.updated)}</time>
              </span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{formatReading(meta.readingMinutes)}</span>
          {meta.draft && <Badge tone="mustard">Draft — not published</Badge>}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] uppercase sm:text-5xl">{meta.title}</h1>
        <p className="mt-4 text-lg text-ink/80">{meta.summary}</p>
        {meta.tags.length > 0 && (
          <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-2">
            {meta.tags.map((t) => (
              <li key={t}>
                <Link to={`/blog?tag=${encodeURIComponent(t)}`} className="inline-block hover:bg-mustard/40">
                  <Badge>#{t}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      <div className="prose-ink">
        {Content ? <Content components={mdxComponents} /> : <p className="font-mono text-sm uppercase">Loading…</p>}
      </div>
      {(newer || older) && (
        <nav aria-label="More posts" className="mt-16 grid grid-cols-1 gap-4 border-t-[2.5px] border-dashed border-ink pt-8 sm:grid-cols-2">
          <div>{newer && <Neighbour post={newer} dir="newer" />}</div>
          <div>{older && <Neighbour post={older} dir="older" />}</div>
        </nav>
      )}
    </article>
  )
}
