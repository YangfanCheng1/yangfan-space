import { useEffect, useState } from 'react'
import type { MDXContent } from 'mdx/types'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { getPost, loadPostBody } from '@/content/posts'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatReading } from '../lib/format'
import { mdxComponents } from '../mdx/components'
import '../prose.css'
import { NotFound } from './NotFound'

/** /blog/:slug — P1 renders the MDX body; P2 adds anchors, highlighting and prev/next. */
export function Post() {
  const { slug = '' } = useParams()
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

  if (!meta) return <NotFound />
  const Content = body?.slug === slug ? body.Content : null

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
          <p className="mt-4 flex flex-wrap gap-2">
            {meta.tags.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </p>
        )}
      </header>
      <div className="prose-ink">
        {Content ? <Content components={mdxComponents} /> : <p className="font-mono text-sm uppercase">Loading…</p>}
      </div>
    </article>
  )
}
