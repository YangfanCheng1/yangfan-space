import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui'
import type { ProjectMeta } from '@/content/schema'
import { sfx } from '@/lib/audio'
import { cn } from '@/lib/cn'
import { statusLabel } from '../lib/labels'

const bands = {
  vermilion: 'bg-vermilion text-paper',
  teal: 'bg-teal text-paper',
  mustard: 'bg-mustard text-ink',
}

/** Project card (spec PR1). Opens the case study, which links on to the live app. */
export function ProjectCard({ project, headingLevel = 3 }: { project: ProjectMeta; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <Link to={`/projects/${project.slug}`} className="block h-full" onClick={() => sfx.pageTurn()}>
      <article className="ink-border shadow-pop pressable flex h-full flex-col bg-paper">
        <div className={cn('flex items-center justify-between border-b-[2.5px] border-ink px-4 py-2', bands[project.accent])}>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">{project.year}</span>
          <Badge tone={project.status === 'live' ? 'ink' : 'paper'}>{statusLabel[project.status]}</Badge>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <H className="font-display text-2xl leading-none uppercase">{project.title}</H>
          <p className="text-sm font-bold italic">{project.tagline}</p>
          <p className="text-sm text-ink/75">{project.summary}</p>
          {project.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {project.tags.map((t) => (
                <Badge key={t}>#{t}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t-[2.5px] border-dashed border-ink px-5 py-3 font-mono text-xs font-bold uppercase">
          <span>{project.stack.slice(0, 3).join(' · ')}</span>
          <span className="whitespace-nowrap">Case study →</span>
        </div>
      </article>
    </Link>
  )
}
