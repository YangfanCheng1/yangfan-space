import { Link, NavLink, Outlet } from 'react-router-dom'
import { Badge, Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useSettingsStore } from '@/store/useSettingsStore'
import { site } from '../site'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/blog', label: 'Blog', end: false },
  { to: '/about', label: 'About', end: false },
]

export function SiteLayout() {
  const soundOn = useSettingsStore((s) => s.soundOn)
  const toggleSound = useSettingsStore((s) => s.toggleSound)

  return (
    <div className="halftone flex min-h-dvh flex-col bg-paper font-body text-ink">
      <a
        href="#main"
        className="ink-border sr-only z-50 bg-paper px-3 py-2 font-mono text-xs font-bold uppercase focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="ink-border bg-ink px-3 py-1.5 font-display text-lg tracking-wide whitespace-nowrap text-paper uppercase sm:text-xl">
              Yangfan<span className="text-mustard">&apos;s</span> Space
            </span>
            <span className="hidden sm:inline">
              <Badge tone="mustard">Est. 2026</Badge>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <nav aria-label="Main" className="hidden md:block">
              <NavLinks />
            </nav>
            <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={toggleSound} aria-pressed={soundOn} sound={!soundOn}>
              SFX: {soundOn ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
        <nav aria-label="Main" className="mt-4 md:hidden">
          <NavLinks />
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-16 outline-none sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t-[2.5px] border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 font-mono text-xs uppercase sm:px-6">
          <span>© 2026 {site.owner}</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={site.links.github} className="underline-offset-4 hover:underline">
              GitHub
            </a>
            <a href={site.aboutPage} className="underline-offset-4 hover:underline">
              Professional page
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}

function NavLinks() {
  return (
    <ul className="flex flex-wrap gap-2">
      {nav.map((n) => (
        <li key={n.to}>
          <NavLink
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              cn(
                'ink-border inline-block px-3 py-1.5 font-mono text-xs font-bold uppercase',
                isActive ? 'shadow-pop-sm bg-ink text-paper' : 'bg-paper hover:bg-mustard/40',
              )
            }
          >
            {n.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
