/** USD / percent formatting. The app is USD-only (en-US), see spec §7. */

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** Whole dollars, e.g. $1,234. Pass `cents: true` for $1,234.56. */
export function formatUSD(dollars: number, opts: { cents?: boolean; compact?: boolean } = {}) {
  if (!Number.isFinite(dollars)) return '—'
  if (opts.compact && Math.abs(dollars) >= 10_000) return usdCompact.format(dollars)
  return (opts.cents ? usdCents : usd).format(dollars)
}

/** 0.4 → "40%", 0.0425 → "4.3%" (one decimal unless whole). */
export function formatPct(ratio: number, digits = 1) {
  if (!Number.isFinite(ratio)) return '—'
  const pct = ratio * 100
  return `${Number.isInteger(pct) ? pct : pct.toFixed(digits)}%`
}
