import { useId, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { cn } from '@/lib/cn'
import type { FireParams, FireResult, ProjectionPoint } from '../../lib/calc/fire'
import { MAX_AGE } from '../../lib/calc/fire'
import { CHART, CHART_FONT } from '../../lib/chartColors'
import { formatOneDecimal, formatPct, formatUSD } from '../../lib/format'
import { niceTicks } from '../../lib/niceTicks'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Card } from '../ui'
import { ScrollRegion } from '../ui/ScrollRegion'

const tick = { fontFamily: CHART_FONT, fontSize: 11, fill: CHART.muted }
const compact = (v: number) => formatUSD(v, { compact: true })

function ChartTooltip({ active, payload, showCoast }: TooltipContentProps<number, string> & { showCoast: boolean }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as ProjectionPoint
  return (
    <div className="ink-border shadow-pop-sm bg-paper px-3 py-2 text-ink">
      <p className="font-mono text-xs font-bold uppercase">
        Age {p.age} · {p.calendarYear} · {p.phase === 'drawdown' ? 'withdrawing' : 'saving'}
      </p>
      <p className="mt-1 flex items-center gap-2">
        <span aria-hidden className="inline-block h-0.5 w-4" style={{ background: CHART.portfolio }} />
        <strong className="pf-num">{formatUSD(p.value)}</strong>
        <span className="text-xs text-ink/70">Portfolio</span>
      </p>
      {showCoast && (
        <p className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: CHART.coast }} />
          <strong className="pf-num">{formatUSD(p.coastValue)}</strong>
          <span className="text-xs text-ink/70">Coast path</span>
        </p>
      )}
    </div>
  )
}

function summary(result: FireResult, params: FireParams): string {
  const start = formatUSD(params.invested, { compact: true })
  const target = formatUSD(result.target, { compact: true })
  if (result.fiAge === null) return `Your portfolio grows from ${start} but doesn't reach the ${target} target by age ${MAX_AGE}.`
  const lasts =
    result.sustainability?.runsOutAge == null
      ? `lasts past age ${MAX_AGE}`
      : `runs out at age ${formatOneDecimal(result.sustainability.runsOutAge)}`
  const reach = result.yearsToFi === 0 ? `is already above the ${target} target` : `reaches the ${target} target at age ${formatOneDecimal(result.fiAge)} (≈ ${result.fiCalendarYear})`
  return `Your portfolio ${reach}. Withdrawing ${formatUSD(result.withdrawal, { compact: true })}/yr after that, it ${lasts}.`
}

export function ProjectionChart({ result, params }: { result: FireResult; params: FireParams }) {
  const [showCoast, setShowCoast] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const tableId = useId()
  const data = result.projection

  // Keep the target in view; let the coast path run off the top rather than flatten everything.
  const yTicks = useMemo(() => niceTicks(Math.max(result.target, ...data.map((d) => d.value)) * 1.05), [data, result.target])
  const xTicks = useMemo(() => {
    const first = data[0].age
    const ticks = [first]
    for (let a = Math.ceil((first + 1) / 10) * 10; a < MAX_AGE; a += 10) ticks.push(a)
    if (ticks.at(-1) !== MAX_AGE) ticks.push(MAX_AGE)
    return ticks
  }, [data])

  const fiAge = result.fiAge
  const runsOut = result.sustainability?.runsOutAge ?? null

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase">Projection</h2>
          <p className="mt-1 max-w-prose text-sm">{summary(result, params)}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 font-mono text-xs font-bold uppercase">
          <input type="checkbox" className="h-4 w-4 accent-pf-green" checked={showCoast} onChange={(e) => setShowCoast(e.target.checked)} />
          Show coast path
        </label>
      </div>

      {showCoast && (
        <ul className="mt-3 flex flex-wrap gap-4 text-xs" aria-label="Legend">
          <li className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-3 w-4 border-t-2" style={{ borderColor: CHART.portfolio, background: `${CHART.portfolio}1a` }} />
            Portfolio
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="inline-block w-4 border-t-2 border-dashed" style={{ borderColor: CHART.coast }} />
            Coast path (stop contributing today)
          </li>
        </ul>
      )}

      <div className="mt-4 h-72 sm:h-80" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart accessibilityLayer={false} data={data} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
            {fiAge !== null && fiAge < MAX_AGE && (
              <ReferenceArea x1={Math.max(fiAge, data[0].age)} x2={MAX_AGE} fill={CHART.ink} fillOpacity={0.04} stroke="none" ifOverflow="hidden" />
            )}
            <XAxis
              dataKey="age"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={xTicks}
              tick={tick}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
            />
            <YAxis
              domain={[0, yTicks.at(-1)!]}
              ticks={yTicks}
              allowDataOverflow
              tickFormatter={compact}
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              content={(props) => <ChartTooltip {...(props as TooltipContentProps<number, string>)} showCoast={showCoast} />}
              cursor={{ stroke: CHART.ink, strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <ReferenceLine
              y={result.target}
              stroke={CHART.ink}
              strokeWidth={1}
              label={{ value: `FI target ${compact(result.target)}`, position: 'insideTopLeft', ...tick, fill: CHART.ink }}
            />
            {fiAge !== null && fiAge > data[0].age && (
              <ReferenceLine
                x={fiAge}
                stroke={CHART.ink}
                strokeWidth={1}
                label={{ value: `FI at ${formatOneDecimal(fiAge)}`, position: 'top', ...tick, fill: CHART.ink }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              name="Portfolio"
              stroke={CHART.portfolio}
              strokeWidth={2}
              fill={CHART.portfolio}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 5, fill: CHART.portfolio, stroke: CHART.surface, strokeWidth: 2 }}
              isAnimationActive={!reducedMotion}
            />
            {showCoast && (
              <Line
                type="monotone"
                dataKey="coastValue"
                name="Coast path"
                stroke={CHART.coast}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 5, fill: CHART.coast, stroke: CHART.surface, strokeWidth: 2 }}
                isAnimationActive={!reducedMotion}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className={cn('mt-3 flex items-start gap-2 text-sm', runsOut !== null && 'font-bold')}>
        <span aria-hidden>{fiAge === null ? '–' : runsOut === null ? '✓' : '▼'}</span>
        <span>
          {fiAge === null
            ? 'Sustainability check needs a plan that reaches FI.'
            : runsOut === null
              ? `At a ${formatPct(params.realReturn)} real return, withdrawing ${formatUSD(result.withdrawal)}/yr, your portfolio lasts past age ${MAX_AGE}.`
              : `At a ${formatPct(params.realReturn)} real return, withdrawing ${formatUSD(result.withdrawal)}/yr, your portfolio runs out at age ${formatOneDecimal(runsOut)}.`}
        </span>
      </p>

      <button
        type="button"
        className="mt-3 cursor-pointer font-mono text-xs font-bold uppercase underline underline-offset-4"
        aria-expanded={showTable}
        aria-controls={tableId}
        onClick={() => setShowTable((s) => !s)}
      >
        {showTable ? 'Hide table' : 'Show table'}
      </button>
      {showTable && (
        <ScrollRegion id={tableId} label="Projection table" className="mt-3 max-h-80 overflow-auto border-2 border-ink">
          <table className="w-full text-sm">
            <caption className="sr-only">Portfolio projection by year</caption>
            <thead className="sticky top-0 bg-pf-lime font-mono text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Age</th>
                <th className="px-3 py-2 text-left">Year</th>
                <th className="px-3 py-2 text-right">Portfolio</th>
                <th className="px-3 py-2 text-right">Coast path</th>
                <th className="px-3 py-2 text-left">Phase</th>
              </tr>
            </thead>
            <tbody className="pf-num">
              {data.map((p) => (
                <tr key={p.year} className={cn('border-t border-ink/15', p.year === result.fiIndex && 'bg-pf-lime/40 font-bold')}>
                  <td className="px-3 py-1.5">{p.age}</td>
                  <td className="px-3 py-1.5">{p.calendarYear}</td>
                  <td className="px-3 py-1.5 text-right">{formatUSD(p.value)}</td>
                  <td className="px-3 py-1.5 text-right">{formatUSD(p.coastValue)}</td>
                  <td className="px-3 py-1.5 font-body">{p.year === result.fiIndex ? 'FI reached' : p.phase === 'drawdown' ? 'Withdrawing' : 'Saving'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      )}
    </Card>
  )
}
