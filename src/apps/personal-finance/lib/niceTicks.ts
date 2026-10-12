/**
 * Round axis ticks from 0 up to at least `max`, in steps of 1, 2, 2.5 or 5 × 10^k.
 * Picks the step with 3–6 intervals whose top overshoots `max` the least
 * (ties → fewer intervals), so the plot uses its height. The last tick is the axis top.
 */
export function niceTicks(max: number): number[] {
  if (!(max > 0) || !Number.isFinite(max)) return [0, 1]
  const mag = 10 ** Math.floor(Math.log10(max))
  let best: { step: number; n: number; over: number } | null = null
  for (const m of [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5]) {
    const step = m * mag
    const n = Math.ceil(max / step - 1e-9)
    if (n < 3 || n > 6) continue
    const over = (n * step - max) / max
    if (!best || over < best.over - 1e-9 || (Math.abs(over - best.over) <= 1e-9 && n < best.n)) best = { step, n, over }
  }
  const { step, n } = best ?? { step: mag, n: Math.ceil(max / mag) }
  return Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6)
}
