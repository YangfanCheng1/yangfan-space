import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useSettingsStore } from '@/store/useSettingsStore'
import { BASE, toolPath, tools } from '../tools'
import { Badge, Button } from './ui'

const links = [
  { to: BASE, label: 'Hub', end: true },
  ...tools.map((t) => ({ to: toolPath(t.slug), label: t.navLabel, end: false })),
  { to: `${BASE}/settings`, label: 'Settings', end: false },
]

export function Nav() {
  const soundOn = useSettingsStore((s) => s.soundOn)
  const toggleSound = useSettingsStore((s) => s.toggleSound)

  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={BASE} className="flex items-center gap-2">
          <span className="ink-border bg-ink px-3 py-1.5 font-display text-base tracking-wide whitespace-nowrap text-paper uppercase sm:text-xl">
            Personal <span className="text-pf-lime">$</span> Finance
          </span>
          <span className="hidden sm:inline">
            <Badge tone="lime">USD · Private</Badge>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden font-mono text-xs font-bold uppercase underline-offset-4 hover:underline sm:inline">
            ← Ink &amp; Frame
          </Link>
          <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={toggleSound} aria-pressed={soundOn} sound={!soundOn}>
            SFX: {soundOn ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      <nav aria-label="Personal Finance" className="relative -mx-4 mt-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-3">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'ink-border inline-block px-4 py-2 font-mono text-xs font-bold uppercase',
                    isActive ? 'shadow-pop-sm bg-pf-lime' : 'bg-paper hover:bg-pf-lime/40',
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          <li className="sm:hidden">
            <Link to="/" className="ink-border inline-block bg-ink px-4 py-2 font-mono text-xs font-bold text-paper uppercase">
              ← Ink &amp; Frame
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
