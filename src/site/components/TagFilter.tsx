import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

const chip = 'ink-border inline-block px-3 py-1.5 font-mono text-xs font-bold uppercase'

/** Tag chips that filter a list via ?tag= (shared by /blog and /projects). */
export function TagFilter({ basePath, tags, active }: { basePath: string; tags: { tag: string; count: number }[]; active: string | null }) {
  if (!tags.length) return null
  return (
    <nav aria-label="Filter by tag" className="mb-8">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link to={basePath} aria-current={!active ? 'page' : undefined} className={cn(chip, !active ? 'shadow-pop-sm bg-ink text-paper' : 'bg-paper hover:bg-mustard/40')}>
            All
          </Link>
        </li>
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              to={`${basePath}?tag=${encodeURIComponent(tag)}`}
              aria-current={active === tag ? 'page' : undefined}
              className={cn(chip, active === tag ? 'shadow-pop-sm bg-ink text-paper' : 'bg-paper hover:bg-mustard/40')}
            >
              #{tag} <span className="font-normal">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
