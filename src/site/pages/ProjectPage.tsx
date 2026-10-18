import { useEffect, useState } from 'react'
import type { MDXContent } from 'mdx/types'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Badge, ButtonLink } from '@/components/ui'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { getProject, loadProjectBody } from '@/content/projects'
import { statusLabel } from '../lib/labels'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { mdxComponents } from '../mdx/components'
import '../prose.css'
import { NotFound } from './NotFound'

/** /projects/:slug — the case study (spec PR3). */
export function ProjectPage() {
  const { slug = '' } = useParams()
  const { hash } = useLocation()
  const project = getProject(slug)
  const [body, setBody] = useState<{ slug: string; Content: MDXContent } | null>(null)

  useDocumentTitle(project?.title ?? 'Not found')

  useEffect(() => {
    if (!project) return
    let cancelled = false
    loadProjectBody(slug).then((Content) => {
      if (!cancelled) setBody({ slug, Content })
    })
    return () => {
      cancelled = true
    }
  }, [slug, project])

  const Content = body?.slug === slug ? body.Content : null
  useEffect(() => {
    if (Content && hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [Content, hash])

  if (!project) return <NotFound />
  const external = project.live && !project.live.startsWith('/')

  return (
    <article className="mx-auto max-w-[68ch]">
      <Link to="/projects" className="font-mono text-xs font-bold uppercase underline-offset-4 hover:underline">
        ← All projects
      </Link>
      <header className="mt-6 mb-10">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase">
          <span>{project.year}</span>
          <span aria-hidden>·</span>
          <span>{project.role}</span>
          <Badge tone={project.status === 'live' ? 'ink' : 'paper'}>{statusLabel[project.status]}</Badge>
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] uppercase sm:text-5xl">{project.title}</h1>
        <p className="mt-3 text-lg font-bold italic">{project.tagline}</p>
        <p className="mt-2 text-lg text-ink/80">{project.summary}</p>

        {project.stack.length > 0 && (
          <div className="mt-5">
            <h2 className="font-mono text-xs font-bold uppercase">Built with</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s}>
                  <Badge>{s}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {project.live &&
            (external ? (
              <a href={project.live} className={buttonClasses('primary', 'lg')}>
                Try it live →
              </a>
            ) : (
              <ButtonLink to={project.live} size="lg">
                Try it live →
              </ButtonLink>
            ))}
          {project.source && (
            <a href={project.source} className={buttonClasses('ghost', 'lg')}>
              Source
            </a>
          )}
        </div>
      </header>

      <div className="prose-ink">
        {Content ? <Content components={mdxComponents} /> : <p className="font-mono text-sm uppercase">Loading…</p>}
      </div>

      {project.tags.length > 0 && (
        <nav aria-label="Tags" className="mt-12 border-t-[2.5px] border-dashed border-ink pt-6">
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li key={t}>
                <Link to={`/projects?tag=${encodeURIComponent(t)}`} className="inline-block hover:bg-mustard/40">
                  <Badge>#{t}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  )
}
