import { useState } from 'react'
import type { CSSProperties } from 'react'
import { apps } from '@/apps/registry'
import { Badge, Button, Card, Modal } from '@/components/ui'
import { useSettingsStore } from '@/store/useSettingsStore'
import { AppCard } from './AppCard'

const starburst =
  'polygon(50% 0,61% 22%,85% 10%,78% 36%,100% 50%,78% 64%,85% 90%,61% 78%,50% 100%,39% 78%,15% 90%,22% 64%,0 50%,22% 36%,15% 10%,39% 22%)'

export function GatewayPage() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const soundOn = useSettingsStore((s) => s.soundOn)
  const toggleSound = useSettingsStore((s) => s.toggleSound)

  return (
    <div className="halftone min-h-dvh bg-paper font-body text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="ink-border bg-ink px-3 py-1.5 font-display text-lg tracking-wide text-paper uppercase sm:text-xl">
            Ink <span className="text-mustard">&amp;</span> Frame
          </span>
          <Badge tone="mustard" className="hidden sm:inline-block">
            ComixLab
          </Badge>
        </a>
        <Button variant="ghost" size="sm" onClick={toggleSound} aria-pressed={soundOn} sound={!soundOn}>
          SFX: {soundOn ? 'On' : 'Off'}
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Hero spread */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
          <Card className="min-w-0 p-6 sm:p-10">
            <p className="font-mono text-xs font-bold tracking-widest uppercase">Vol. 1 · Issue #01 · Oct 2026</p>
            <h1 className="mt-4 font-display text-[2.4rem] leading-[0.92] uppercase sm:text-6xl lg:text-7xl">
              Small studio.
              <br />
              <span className="ink-border shadow-pop-sm my-2 inline-block -rotate-1 bg-vermilion px-2 text-paper">Strange</span>
              <br />
              machines.
            </h1>
            <p className="mt-6 max-w-prose text-base sm:text-lg">
              Ink &amp; Frame is an indie comic studio and workbench. Every panel below opens a tool, toy or story
              we've built. Step into any of them.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" onClick={() => document.getElementById('apps')?.scrollIntoView({ behavior: 'smooth' })}>
                Browse the apps ↓
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setAboutOpen(true)} sound={false}>
                About the studio
              </Button>
            </div>
          </Card>

          <Card
            tone="teal"
            className="halftone relative flex min-h-72 flex-col justify-between overflow-hidden p-6"
            style={{ '--halftone': 'rgb(248 246 240 / 0.18)' } as CSSProperties}
          >
            <div className="shadow-pop relative ml-auto max-w-[15rem] rounded-[50%] border-[2.5px] border-ink bg-paper px-6 py-5 text-center font-display text-lg leading-tight text-ink uppercase">
              Pick a panel.
              <br />
              Any panel.
              <span
                aria-hidden
                className="absolute -bottom-[16px] left-10 h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-ink"
              />
            </div>

            <div
              aria-hidden
              className="absolute top-1/2 left-4 grid h-28 w-28 -translate-y-1/2 rotate-12 place-items-center bg-mustard font-display text-2xl text-ink"
              style={{ clipPath: starburst }}
            >
              NEW!
            </div>

            <p className="relative text-right font-display text-8xl leading-none text-paper/90 sm:text-9xl">
              #{String(apps.length).padStart(2, '0')}
            </p>
          </Card>
        </section>

        {/* Table of contents */}
        <section id="apps" className="mt-16 scroll-mt-6">
          <div className="mb-6 flex items-end gap-4">
            <h2 className="font-display text-2xl uppercase sm:text-4xl">Table of contents</h2>
            <div className="mb-2 hidden h-[2.5px] flex-1 bg-ink sm:block" />
            <span className="mb-1 ml-auto font-mono text-xs font-bold whitespace-nowrap uppercase">{apps.length} entries</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app, i) => (
              <AppCard key={app.slug} app={app} index={i} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t-[2.5px] border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 font-mono text-xs uppercase sm:px-6">
          <span>© 2026 Ink &amp; Frame (ComixLab)</span>
          <span>Drawn panel by panel.</span>
        </div>
      </footer>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About the studio">
        <p>
          We're a one-desk comic studio that keeps building its own instruments: readers, character makers, galleries
          and whatever else the next story needs.
        </p>
        <p className="mt-3">Each app here is its own little world with its own look. This page is just the front door.</p>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={() => setAboutOpen(false)} sound={false}>
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  )
}
