import { cn } from '@/lib/cn'
import { change, snapshotNetWorth } from '../../lib/calc/netWorth'
import { formatChange, formatDate, formatPct, formatUSD } from '../../lib/format'
import type { NetWorthSnapshot } from '../../types'
import { Card } from '../ui'

/** Spec NW12 — also the table view for the history chart. Newest first. */
export function SnapshotList({ snapshots, onDelete }: { snapshots: NetWorthSnapshot[]; onDelete: (s: NetWorthSnapshot) => void }) {
  if (!snapshots.length) return null
  const rows = snapshots.map((s, i) => ({ s, prev: snapshots[i - 1] })).reverse()

  return (
    <Card className="p-5">
      <h2 className="font-display text-xl uppercase">Snapshots</h2>
      <div className="relative mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <caption className="sr-only">Net worth snapshots, newest first</caption>
          <thead className="font-mono text-xs uppercase">
            <tr className="border-b-2 border-ink">
              <th className="py-2 pr-3 text-left">Date</th>
              <th className="py-2 pr-3 text-right">Net worth</th>
              <th className="py-2 pr-3 text-right">Assets</th>
              <th className="py-2 pr-3 text-right">Liabilities</th>
              <th className="py-2 pr-3 text-right">Change</th>
              <th className="py-2 pr-3 text-left">Note</th>
              <th className="py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, prev }) => {
              const nw = snapshotNetWorth(s)
              const d = prev ? change(snapshotNetWorth(prev), nw) : null
              return (
                <tr key={s.date} className="border-b border-ink/15">
                  <th scope="row" className="py-2 pr-3 text-left font-normal whitespace-nowrap">
                    {formatDate(s.date)}
                  </th>
                  <td className="pf-num py-2 pr-3 text-right font-bold">{formatUSD(nw / 100)}</td>
                  <td className="pf-num py-2 pr-3 text-right">{formatUSD(s.assets / 100)}</td>
                  <td className="pf-num py-2 pr-3 text-right">{s.liabilities ? `−${formatUSD(s.liabilities / 100)}` : formatUSD(0)}</td>
                  <td className={cn('pf-num py-2 pr-3 text-right whitespace-nowrap', d && d.abs < 0 && 'text-pf-clay-ink')}>
                    {d ? (
                      <>
                        {formatChange(d.abs / 100)}
                        {d.pct !== null && <span className="block text-xs">{`${d.pct >= 0 ? '+' : '−'}${formatPct(Math.abs(d.pct))}`}</span>}
                      </>
                    ) : (
                      <span className="text-ink/60">first</span>
                    )}
                  </td>
                  <td className="max-w-48 py-2 pr-3 text-xs break-words">{s.note}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="cursor-pointer border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs font-bold uppercase hover:bg-pf-clay hover:text-paper"
                      onClick={() => onDelete(s)}
                      aria-label={`Delete snapshot from ${formatDate(s.date)}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
