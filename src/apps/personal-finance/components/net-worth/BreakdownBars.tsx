import { CATEGORIES } from '../../lib/categories'
import type { NetWorthSummary } from '../../lib/calc/netWorth'
import { HISTORY } from '../../lib/chartColors'
import { formatUSD } from '../../lib/format'
import type { AccountKind } from '../../types'
import { Card } from '../ui'

/**
 * Spec NW8: assets and liabilities by category, on ONE shared scale so the two
 * panels compare honestly. Plain HTML bars: each bar ≤ 24px, 4px rounded data
 * end, square at the baseline, value at the tip (never clipped). Assets and
 * liabilities are separate labeled panels — green vs clay alone fails CVD.
 */
export function BreakdownBars({ summary }: { summary: NetWorthSummary }) {
  const rows = CATEGORIES.map((c) => ({ ...c, cents: summary.byCategory[c.id] ?? 0 })).filter((r) => r.cents > 0)
  const max = Math.max(1, ...rows.map((r) => r.cents))

  const panel = (kind: AccountKind) => {
    const items = rows.filter((r) => r.kind === kind)
    if (!items.length) return null
    const color = kind === 'asset' ? HISTORY.netWorth : HISTORY.liabilities
    return (
      <div>
        <h3 className="mb-2 font-mono text-xs font-bold uppercase">{kind === 'asset' ? 'What you own' : 'What you owe'}</h3>
        <ul className="flex flex-col gap-2.5">
          {items.map((r) => {
            const pct = (r.cents / max) * 100
            return (
              <li key={r.id} className="grid grid-cols-1 items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(7rem,11rem)_1fr]">
                <span className="truncate" title={r.label}>
                  {r.label}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    data-bar
                    className="h-5 shrink-0 rounded-r-[4px]"
                    style={{ width: `max(3px, calc((100% - 6.5rem) * ${pct / 100}))`, background: color }}
                  />
                  <span className="pf-num text-xs font-bold whitespace-nowrap">
                    {kind === 'liability' ? '−' : ''}
                    {formatUSD(r.cents / 100, { compact: true })}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <Card className="p-5">
      <h2 className="font-display text-xl uppercase">Breakdown</h2>
      <p className="mt-1 text-sm">By category, on one scale so bars compare across both lists.</p>
      <div className="mt-4 flex flex-col gap-5">
        {panel('asset')}
        {panel('liability')}
      </div>
      <table className="sr-only">
        <caption>Balances by category</caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Type</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td>{r.kind === 'asset' ? 'Asset' : 'Liability'}</td>
              <td>{formatUSD(r.cents / 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
