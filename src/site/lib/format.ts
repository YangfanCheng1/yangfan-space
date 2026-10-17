const longDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** "2026-10-16" → "Oct 16, 2026" (parsed as a local calendar date, so no timezone day-shift). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return longDate.format(new Date(y, m - 1, d))
}

export const formatReading = (minutes: number) => `${minutes} min read`
