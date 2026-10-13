import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Badge, ButtonLink, Card, StatTile } from '../components/ui'
import { localISODate } from '../lib/calc/netWorth'
import { formatChange, formatDate, formatOneDecimal, formatPct, formatUSD } from '../lib/format'
import { hubFigures } from '../lib/hub'
import { hasUserData, usePersonalFinance } from '../store'
import { toolPath, tools } from '../tools'
import type { ToolEntry } from '../tools'

const bands: Record<ToolEntry['accent'], string> = {
  green: 'bg-pf-green text-paper',
  pine: 'bg-pf-pine text-paper',
  lime: 'bg-pf-lime text-ink',
}

const starburst =
  'polygon(50% 0,61% 22%,85% 10%,78% 36%,100% 50%,78% 64%,85% 90%,61% 78%,50% 100%,39% 78%,15% 90%,22% 64%,0 50%,22% 36%,15% 10%,39% 22%)'

const statusLabel ={ live: 'Live', wip: 'In progress', planned: 'Coming soon' }

function ToolCard({ tool, index }: { tool: ToolEntry; index: number }) {
  return (
    <Link to={toolPath(tool.slug)} className="block h-full">
      <article className="ink-border shadow-pop pressable flex h-full flex-col bg-paper">
        <div className={cn('flex items-center justify-between border-b-[2.5px] border-ink px-4 py-2', bands[tool.accent])}>
          <span className="font-mono text-xs font-bold tracking-widest">TOOL {String(index + 1).padStart(2, '0')}</span>
          <Badge tone={tool.status === 'live' ? 'ink' : 'paper'}>{statusLabel[tool.status]}</Badge>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-2xl leading-none uppercase">{tool.title}</h3>
          <p className="text-sm font-bold italic">{tool.tagline}</p>
          <p className="text-sm text-ink/75">{tool.description}</p>
        </div>
        <div className="flex items-center justify-between border-t-[2.5px] border-dashed border-ink px-5 py-3 font-mono text-xs font-bold uppercase">
          <span>/{tool.slug}</span>
          <span>Open →</span>
        </div>
      </article>
    </Link>
  )
}

function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.min(1, Math.max(0, progress))
  return (
    <span
      role="progressbar"
      aria-label="Progress to FI"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      className="mb-1 block h-3 border-2 border-ink bg-paper"
    >
      <span className="block h-full bg-pf-green" style={{ width: `${pct * 100}%` }} />
    </span>
  )
}

export function Hub() {
  useDocumentTitle('Hub')
  const accounts = usePersonalFinance((s) => s.accounts)
  const snapshots = usePersonalFinance((s) => s.snapshots)
  const fire = usePersonalFinance((s) => s.fire)
  const loadSampleData = usePersonalFinance((s) => s.loadSampleData)
  const navigate = useNavigate()

  const figures = useMemo(() => hubFigures({ accounts, snapshots, fire }, localISODate()), [accounts, snapshots, fire])
  const fresh = !hasUserData({ accounts, snapshots, fire })
  const nw = figures.netWorth
  const fi = figures.fire

  return (
    <>
      {/* Hero spread */}
      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card className="min-w-0 p-6 sm:p-10">
          <p className="font-mono text-xs font-bold tracking-widest uppercase">Ledger · USD · Stays in your browser</p>
          <h1 className="mt-4 font-display text-[2.4rem] leading-[0.92] uppercase sm:text-6xl lg:text-7xl">
            Count it.
            <br />
            <span className="ink-border shadow-pop-sm my-2 inline-block -rotate-1 bg-pf-lime px-2">Then plan</span>
            <br />
            the exit.
          </h1>
          <p className="mt-6 max-w-prose text-base sm:text-lg">
            Add up what you own and what you owe, then see when your investments could cover your spending for good.
            No sign-up, and nothing leaves this device.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink to={toolPath('net-worth')} size="lg">
              Start with net worth
            </ButtonLink>
            <ButtonLink to={toolPath('fire')} size="lg" variant="ghost">
              Run a FIRE projection
            </ButtonLink>
          </div>
          {fresh && (
            <p className="mt-5 text-sm">
              Just looking?{' '}
              <button
                type="button"
                className="cursor-pointer font-bold underline underline-offset-2"
                onClick={() => {
                  loadSampleData()
                  navigate(toolPath('net-worth'))
                }}
              >
                Try it with sample data
              </button>{' '}
              — you can clear it any time.
            </p>
          )}
        </Card>

        <Card
          tone="pine"
          className="halftone relative flex min-h-72 flex-col justify-between overflow-hidden p-6"
          style={{ '--halftone': 'rgb(242 246 236 / 0.16)' } as CSSProperties}
        >
          <div className="shadow-pop relative ml-auto max-w-[15rem] rounded-[50%] border-[2.5px] border-ink bg-paper px-6 py-5 text-center font-display text-lg leading-tight text-ink uppercase">
            Your numbers.
            <br />
            Your browser.
            <span
              aria-hidden
              className="absolute -bottom-[16px] left-10 h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-ink"
            />
          </div>
          <div
            aria-hidden
            className="absolute top-1/2 left-4 grid h-28 w-28 -translate-y-1/2 -rotate-12 place-items-center bg-pf-gold font-display text-4xl text-ink"
            style={{ clipPath: starburst }}
          >
            $
          </div>

          <p className="relative text-right font-display text-8xl leading-none text-pf-lime sm:text-9xl">FI</p>
        </Card>
      </section>

      {/* Headline tiles (spec H1–H2) */}
      <section aria-label="At a glance" className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatTile
          label="Net worth"
          to={toolPath('net-worth')}
          value={nw ? formatUSD(nw.cents / 100) : undefined}
          sub={
            nw &&
            (nw.change ? (
              <>
                <strong>{formatChange(nw.change.abs / 100)}</strong> since {formatDate(nw.change.since)}
              </>
            ) : (
              'Save a snapshot to track the trend.'
            ))
          }
          emptyText="No accounts yet. Add what you own and owe to see your total."
          emptyCta="Add accounts"
        />
        <StatTile
          label="FI progress"
          tone="lime"
          to={toolPath('fire')}
          value={fi?.status === 'ok' ? formatPct(fi.progress, 0) : fi?.status === 'invalid' ? '—' : undefined}
          sub={
            fi?.status === 'ok' ? (
              <>
                <ProgressBar progress={fi.progress} />
                of a {formatUSD(fi.target, { compact: true })} target
              </>
            ) : fi?.status === 'invalid' ? (
              'Fix your FIRE inputs to update this.'
            ) : undefined
          }
          emptyText="Set your spending and savings to see how close you are."
          emptyCta="Set up FIRE"
        />
        <StatTile
          label="Years to FI"
          tone="pine"
          to={toolPath('fire')}
          value={
            fi?.status === 'ok'
              ? fi.yearsToFi === null
                ? 'Not by 90'
                : fi.yearsToFi === 0
                  ? '✓ Now'
                  : formatOneDecimal(fi.yearsToFi)
              : fi?.status === 'invalid'
                ? '—'
                : undefined
          }
          sub={
            fi?.status === 'ok'
              ? fi.yearsToFi === null
                ? 'See which change gets you there.'
                : fi.yearsToFi === 0
                  ? "You've already reached FI."
                  : `FI at age ${formatOneDecimal(fi.fiAge!)} · ≈ ${fi.fiCalendarYear}`
              : fi?.status === 'invalid'
                ? 'Fix your FIRE inputs to update this.'
                : undefined
          }
          emptyText="Find out how many years until work is optional."
          emptyCta="Run projection"
        />
      </section>

      {/* Tools */}
      <section className="mt-16">
        <div className="mb-6 flex items-end gap-4">
          <h2 className="font-display text-2xl uppercase sm:text-4xl">Tools</h2>
          <div className="mb-2 hidden h-[2.5px] flex-1 bg-ink sm:block" />
          <span className="mb-1 ml-auto font-mono text-xs font-bold whitespace-nowrap uppercase">{tools.length} tools</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </>
  )
}
