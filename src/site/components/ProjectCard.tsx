import { Link } from 'react-router-dom'
import type { AppEntry } from '@/apps/registry'
import { Badge } from '@/components/ui'
import { sfx } from '@/lib/audio'
import { cn } from '@/lib/cn'

const bands = {
  vermilion: 'bg-vermilion text-paper',
  teal: 'bg-teal text-paper',
  mustard: 'bg-mustard text-ink',
}

const statusLabel = { live: 'Live', wip: 'In progress', planned: 'Planned' }

/** A built project. Until case studies land (P3) the card opens the app itself. */
export function ProjectCard({ app, headingLevel = 3 }: { app: AppEntry; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <Link to={`/${app.slug}`} className="block h-full" onClick={() => sfx.pageTurn()}>
      <article className="ink-border shadow-pop pressable flex h-full flex-col bg-paper">
        <div className={cn('flex items-center justify-between border-b-[2.5px] border-ink px-4 py-2', bands[app.accent])}>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Web app</span>
          <Badge tone={app.status === 'live' ? 'ink' : 'paper'}>{statusLabel[app.status]}</Badge>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <H className="font-display text-2xl leading-none uppercase">{app.title}</H>
          <p className="text-sm font-bold italic">{app.tagline}</p>
          <p className="text-sm text-ink/75">{app.description}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {app.tags.map((t) => (
              <Badge key={t}>#{t}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t-[2.5px] border-dashed border-ink px-5 py-3 font-mono text-xs font-bold uppercase">
          <span>/{app.slug}</span>
          <span>Try it →</span>
        </div>
      </article>
    </Link>
  )
}
