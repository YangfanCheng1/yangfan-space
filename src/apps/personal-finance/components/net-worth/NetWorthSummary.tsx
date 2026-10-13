import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { change, snapshotNetWorth } from '../../lib/calc/netWorth'
import type { NetWorthSummary as Summary } from '../../lib/calc/netWorth'
import { formatChange, formatDate, formatPct, formatUSD } from '../../lib/format'
import { toolPath } from '../../tools'
import type { NetWorthSnapshot } from '../../types'
import { Button, Card } from '../ui'

const usd = (cents: number) => formatUSD(cents / 100)

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1 p-4">
      <span className="font-mono text-xs font-bold tracking-widest uppercase">{label}</span>
      <span className="text-2xl leading-tight font-bold">{value}</span>
      {sub && <span className="text-xs text-ink/70">{sub}</span>}
    </Card>
  )
}

export interface NetWorthSummaryProps {
  summary: Summary
  snapshots: NetWorthSnapshot[]
  today: string
  onSaveSnapshot: () => void
}

export function NetWorthSummary({ summary, snapshots, today, onSaveSnapshot }: NetWorthSummaryProps) {
  // Spec NW6/NW10: compare with the latest snapshot from before today.
  const previous = snapshots.filter((s) => s.date < today).at(-1)
  const savedToday = snapshots.some((s) => s.date === today)
  const delta = previous ? change(snapshotNetWorth(previous), summary.netWorth) : null

  return (
    <section aria-label="Summary" className="flex flex-col gap-6">
      <Card tone="pine" className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold tracking-widest uppercase">Net worth</p>
            <p className="mt-1 text-5xl leading-none font-bold sm:text-6xl">{usd(summary.netWorth)}</p>
            <p className="mt-2 text-sm" aria-live="polite">
              {delta ? (
                <>
                  <strong>{formatChange(delta.abs / 100)}</strong>
                  {delta.pct !== null && ` (${delta.pct >= 0 ? '+' : '−'}${formatPct(Math.abs(delta.pct))})`} since {formatDate(previous!.date)}
                </>
              ) : savedToday ? (
                'Snapshot saved today. Save another next month to see the change.'
              ) : (
                'Save a snapshot to start tracking how this changes.'
              )}
            </p>
          </div>
          <Button variant="lime" onClick={onSaveSnapshot}>
            {savedToday ? "Update today's snapshot" : 'Save snapshot'}
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-paper/50 pt-4">
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Assets</dt>
            <dd className="text-xl font-bold">{usd(summary.assets)}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs font-bold uppercase">Liabilities</dt>
            <dd className="text-xl font-bold">{summary.liabilities > 0 ? `−${usd(summary.liabilities)}` : usd(0)}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Liquid net worth" value={usd(summary.liquidNetWorth)} sub="Liquid assets − credit cards" />
        <MiniStat
          label="Invested"
          value={usd(summary.invested)}
          sub={
            <Link to={toolPath('fire')} className="font-bold underline underline-offset-2">
              Used by FIRE →
            </Link>
          }
        />
        <MiniStat label="Debt-to-asset" value={summary.debtToAsset === null ? '—' : formatPct(summary.debtToAsset)} sub="Liabilities ÷ assets" />
        {summary.homeEquity !== null && <MiniStat label="Home equity" value={usd(summary.homeEquity)} sub="Real estate − mortgage" />}
      </div>
    </section>
  )
}
