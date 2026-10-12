import { cn } from '@/lib/cn'
import type { FireParams, FireResult } from '../../lib/calc/fire'
import { formatOneDecimal, formatPct, formatUSD, formatYears } from '../../lib/format'
import type { Lever } from '../../lib/levers'
import { Card } from '../ui'

function leverText(lever: Lever, p: FireParams) {
  switch (lever.id) {
    case 'save-more':
      return `Saving ${formatUSD(lever.newValue)}/yr instead of ${formatUSD(p.contribution)}`
    case 'spend-less':
      return `Planning to spend ${formatUSD(lever.newValue)}/yr instead of ${formatUSD(p.spending)}`
    case 'higher-return':
      return `A ${formatPct(lever.newValue)} real return instead of ${formatPct(p.realReturn)}`
  }
}

function ProgressBar({ progress, onDark }: { progress: number; onDark?: boolean }) {
  const pct = Math.min(1, Math.max(0, progress))
  return (
    <div className="mt-2">
      <div
        role="progressbar"
        aria-label="Progress to FI"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        className={cn('h-4 border-2', onDark ? 'border-paper bg-pf-pine' : 'border-ink bg-paper')}
      >
        <div className="h-full bg-pf-lime" style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="mt-1 font-mono text-xs uppercase">{formatPct(progress, 0)} of the way there</p>
    </div>
  )
}

function Figure({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-xs font-bold tracking-widest uppercase">{label}</p>
      <p className="mt-1 text-4xl leading-none font-bold sm:text-5xl">{value}</p>
      {sub && <p className="mt-1 text-sm">{sub}</p>}
    </div>
  )
}

export function FireHeadline({ result, params, lever }: { result: FireResult; params: FireParams; lever: Lever | null }) {
  const targetLabel = params.mode === 'barista' && result.baristaNumber !== null ? 'Barista FI number' : 'FI number'

  if (result.yearsToFi === 0) {
    return (
      <Card tone="lime" className="p-6">
        <p className="font-display text-3xl uppercase sm:text-4xl">✓ You're already there</p>
        <p className="mt-3 max-w-prose">
          Your invested assets of <strong>{formatUSD(params.invested)}</strong> already cover your {targetLabel} of{' '}
          <strong>{formatUSD(result.target)}</strong>. At {formatPct(params.withdrawalRate)} that funds{' '}
          {formatUSD(result.withdrawal)}/yr.
        </p>
        <ProgressBar progress={result.progress} />
      </Card>
    )
  }

  if (result.yearsToFi === null) {
    return (
      <Card className="p-6">
        <p className="font-mono text-xs font-bold tracking-widest uppercase">{targetLabel}</p>
        <p className="mt-1 text-4xl leading-none font-bold sm:text-5xl">{formatUSD(result.target)}</p>
        <p className="mt-4 font-display text-2xl uppercase">Not reached by age 90</p>
        <p className="mt-2 max-w-prose">
          {lever
            ? `${leverText(lever, params)} would get you there at age ${formatOneDecimal(lever.fiAge)}.`
            : 'No single change gets you there by 90. Try combining more savings with lower spending.'}
        </p>
        <ProgressBar progress={result.progress} />
      </Card>
    )
  }

  return (
    <Card tone="pine" className="p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Figure label={targetLabel} value={formatUSD(result.target, { compact: true })} sub={`${formatUSD(result.withdrawal)}/yr at ${formatPct(params.withdrawalRate)}`} />
        <Figure label="Years to FI" value={formatOneDecimal(result.yearsToFi)} sub={formatYears(result.yearsToFi)} />
        <Figure label="FI age" value={formatOneDecimal(result.fiAge!)} sub={`≈ ${result.fiCalendarYear}`} />
      </div>
      <div className="mt-6">
        <ProgressBar progress={result.progress} onDark />
      </div>
      {lever && (
        <p className="mt-4 border-t-2 border-dashed border-paper/50 pt-3 text-sm">
          <span className="font-bold">Biggest lever:</span> {leverText(lever, params)} → FI at {formatOneDecimal(lever.fiAge)}.
        </p>
      )}
    </Card>
  )
}
