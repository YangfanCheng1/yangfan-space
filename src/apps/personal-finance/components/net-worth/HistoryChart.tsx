import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { snapshotNetWorth } from '../../lib/calc/netWorth'
import { CHART, CHART_FONT, HISTORY } from '../../lib/chartColors'
import { formatDate, formatDateShort, formatUSD, parseISODate } from '../../lib/format'
import { niceSpanTicks } from '../../lib/niceTicks'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { NetWorthSnapshot } from '../../types'
import { Card } from '../ui'

interface Point {
  t: number
  date: string
  netWorth: number
  assets: number
  liabilities: number
  note?: string
}

const SERIES = [
  { key: 'netWorth', label: 'Net worth', color: HISTORY.netWorth },
  { key: 'assets', label: 'Assets', color: HISTORY.assets },
  { key: 'liabilities', label: 'Liabilities', color: HISTORY.liabilities },
] as const

type SeriesKey = (typeof SERIES)[number]['key']

const tick = { fontFamily: CHART_FONT, fontSize: 11, fill: CHART.muted }

function HistoryTooltip({ active, payload, shown }: TooltipContentProps<number, string> & { shown: Set<SeriesKey> }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Point
  return (
    <div className="ink-border shadow-pop-sm max-w-64 bg-paper px-3 py-2 text-ink">
      <p className="font-mono text-xs font-bold uppercase">{formatDate(p.date)}</p>
      {SERIES.filter((s) => shown.has(s.key)).map((s) => (
        <p key={s.key} className="mt-1 flex items-center gap-2">
          <span aria-hidden className="inline-block h-0.5 w-4" style={{ background: s.color }} />
          <strong className="pf-num">{formatUSD(p[s.key])}</strong>
          <span className="text-xs text-ink/70">{s.label}</span>
        </p>
      ))}
      {p.note && <p className="mt-1 border-t border-ink/20 pt-1 text-xs italic">“{p.note}”</p>}
    </div>
  )
}

/** Spec NW11: net worth over snapshot dates; optional assets / liabilities lines. */
export function HistoryChart({ snapshots }: { snapshots: NetWorthSnapshot[] }) {
  const [shown, setShown] = useState<Set<SeriesKey>>(new Set(['netWorth']))
  const reducedMotion = usePrefersReducedMotion()
  const wide = useMediaQuery('(min-width: 640px)')

  const data: Point[] = useMemo(
    () =>
      snapshots.map((s) => ({
        t: parseISODate(s.date).getTime(),
        date: s.date,
        netWorth: snapshotNetWorth(s) / 100,
        assets: s.assets / 100,
        liabilities: s.liabilities / 100,
        note: s.note,
      })),
    [snapshots],
  )

  const yTicks = useMemo(() => {
    const values = data.flatMap((d) => SERIES.filter((s) => shown.has(s.key)).map((s) => d[s.key]))
    return niceSpanTicks(Math.min(...values), Math.max(...values))
  }, [data, shown])

  const toggle = (key: SeriesKey) =>
    setShown((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  if (data.length < 2) {
    return (
      <Card className="p-5">
        <h2 className="font-display text-xl uppercase">History</h2>
        <p className="mt-2 text-sm">
          {data.length === 0
            ? 'Save a snapshot today and another next month — the trend shows up here once you have two.'
            : 'One snapshot saved. Save another later to see the trend.'}
        </p>
      </Card>
    )
  }

  // Every snapshot date when there is room; first / middle / last on phones or long histories.
  const xTicks =
    wide && data.length <= 8 ? data.map((d) => d.t) : [...new Set([data[0].t, data[Math.floor((data.length - 1) / 2)].t, data.at(-1)!.t])]
  const first = data[0].netWorth
  const last = data.at(-1)!.netWorth
  const series = SERIES.filter((s) => shown.has(s.key))

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase">History</h2>
          <p className="mt-1 text-sm">
            Net worth went from {formatUSD(first)} on {formatDate(data[0].date)} to {formatUSD(last)} on {formatDate(data.at(-1)!.date)} across{' '}
            {data.length} snapshots. Every value is in the table below.
          </p>
        </div>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="sr-only">Lines to show</legend>
          {SERIES.map((s) => (
            <label key={s.key} className="flex cursor-pointer items-center gap-2 font-mono text-xs font-bold uppercase">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pf-green"
                checked={shown.has(s.key)}
                disabled={shown.has(s.key) && shown.size === 1}
                onChange={() => toggle(s.key)}
              />
              {series.length > 1 && <span aria-hidden className="inline-block h-0.5 w-4" style={{ background: s.color }} />}
              {s.label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="mt-4 h-64 sm:h-72" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart accessibilityLayer={false} data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              ticks={xTicks}
              tickFormatter={(t: number) => formatDateShort(data.find((d) => d.t === t)?.date ?? new Date(t).toISOString().slice(0, 10))}
              tick={tick}
              tickLine={false}
              axisLine={{ stroke: CHART.axis }}
              padding={{ left: 12, right: 12 }}
            />
            <YAxis
              domain={[yTicks[0], yTicks.at(-1)!]}
              ticks={yTicks}
              tickFormatter={(v: number) => formatUSD(v, { compact: true })}
              tick={tick}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            {yTicks[0] < 0 && yTicks.at(-1)! > 0 && <ReferenceLine y={0} stroke={CHART.ink} strokeWidth={1} />}
            <Tooltip content={(props) => <HistoryTooltip {...(props as TooltipContentProps<number, string>)} shown={shown} />} cursor={{ stroke: CHART.ink, strokeWidth: 1 }} isAnimationActive={false} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 4, fill: s.color, stroke: CHART.surface, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: s.color, stroke: CHART.surface, strokeWidth: 2 }}
                isAnimationActive={!reducedMotion}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
