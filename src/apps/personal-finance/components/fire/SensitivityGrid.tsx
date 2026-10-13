import { cn } from '@/lib/cn'
import type { FireParams, FireResult } from '../../lib/calc/fire'
import { SPEED_RAMP, SPEED_RAMP_TEXT } from '../../lib/chartColors'
import { formatOneDecimal, formatPct, formatUSD } from '../../lib/format'
import { Card } from '../ui'
import { ScrollRegion } from '../ui/ScrollRegion'

const multiplierLabel = (m: number) => (m === 1 ? 'You' : `${m > 1 ? '+' : '−'}${Math.round(Math.abs(m - 1) * 100)}%`)

/** Bucket a cell into the 5-step ramp: fastest → darkest. */
function bucket(years: number, min: number, max: number) {
  if (max === min) return SPEED_RAMP.length - 1
  const t = (years - min) / (max - min) // 0 = fastest
  return SPEED_RAMP.length - 1 - Math.min(SPEED_RAMP.length - 1, Math.floor(t * SPEED_RAMP.length))
}

export function SensitivityGrid({ result, params }: { result: FireResult; params: FireParams }) {
  const { returns, multipliers, cells } = result.sensitivity
  const reachable = cells.flat().filter((c): c is number => c !== null)
  const min = Math.min(...reachable)
  const max = Math.max(...reachable)
  const userRow = returns.findIndex((r) => Math.abs(r - params.realReturn) < 1e-9)

  return (
    <Card className="p-5">
      <h2 className="font-display text-xl uppercase">What if?</h2>
      <p className="mt-1 text-sm">
        Years to FI for different returns and savings. Darker = sooner; — = not by age 90.
        {userRow === -1 && ` Your ${formatPct(params.realReturn)} return falls between rows.`}
      </p>
      <ScrollRegion label="What-if grid" className="mt-4">
        <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-sm">
          <caption className="sr-only">Years to FI by real return (rows) and annual contribution (columns)</caption>
          <thead>
            <tr className="font-mono text-xs uppercase">
              <th className="px-2 py-1 text-left font-bold">Return ↓ · Saving →</th>
              {multipliers.map((m) => (
                <th key={m} scope="col" className="px-2 py-1 text-center font-bold">
                  {multiplierLabel(m)}
                  <span className="block font-normal normal-case">{formatUSD(params.contribution * m, { compact: true })}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {returns.map((r, i) => (
              <tr key={r}>
                <th scope="row" className="px-2 py-1 text-left font-mono text-xs font-bold">
                  {formatPct(r)}
                </th>
                {multipliers.map((m, j) => {
                  const years = cells[i][j]
                  const you = i === userRow && m === 1
                  const step = years === null ? -1 : bucket(years, min, max)
                  const label =
                    years === null
                      ? `At ${formatPct(r)} saving ${formatUSD(params.contribution * m)}/yr: not by age 90`
                      : `At ${formatPct(r)} saving ${formatUSD(params.contribution * m)}/yr: ${formatOneDecimal(years)} years (age ${formatOneDecimal(params.currentAge + years)})`
                  return (
                    <td
                      key={m}
                      title={label}
                      aria-label={label}
                      className={cn(
                        'pf-num h-11 text-center font-bold',
                        step === -1 ? 'border-2 border-dashed border-ink/40 bg-paper' : SPEED_RAMP_TEXT[step] === 'ink' ? 'text-ink' : 'text-paper',
                        you && 'outline-3 outline-offset-1 outline-ink',
                      )}
                      style={step === -1 ? undefined : { background: SPEED_RAMP[step] }}
                    >
                      {years === null ? '—' : years.toFixed(1)}
                      {you && <span className="sr-only"> (your plan)</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollRegion>
    </Card>
  )
}
