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

const statusLabel = { live: 'Live', wip: 'In progress', planned: 'Coming soon' }

export function AppCard({ app, index }: { app: AppEntry; index: number }) {
  const enterable = Boolean(app.component) && app.status !== 'planned'
  const number = String(index + 1).padStart(2, '0')

  const body = (
    <article className={cn('ink-border shadow-pop flex h-full flex-col bg-paper', enterable ? 'pressable' : 'opacity-60')}>
      <div className={cn('flex items-center justify-between border-b-[2.5px] border-ink px-4 py-2', bands[app.accent])}>
        <span className="font-mono text-xs font-bold tracking-widest">NO. {number}</span>
        <Badge tone={app.status === 'live' ? 'ink' : 'paper'}>{statusLabel[app.status]}</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl leading-none uppercase">{app.title}</h3>
        <p className="font-body text-sm font-bold italic">{app.tagline}</p>
        <p className="font-body text-sm text-ink/75">{app.description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {app.tags.map((t) => (
            <Badge key={t}>#{t}</Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t-[2.5px] border-dashed border-ink px-5 py-3 font-mono text-xs font-bold uppercase">
        <span>/{app.slug}</span>
        <span>{enterable ? 'Enter →' : 'Locked'}</span>
      </div>
    </article>
  )

  if (!enterable) return <div aria-disabled="true">{body}</div>

  return (
    <Link to={`/${app.slug}`} className="block h-full" onClick={() => sfx.pageTurn()} onMouseEnter={() => sfx.hover()}>
      {body}
    </Link>
  )
}
