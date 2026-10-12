import type { Account, PersonalFinanceData } from '../types'
import { categoryMeta } from './categories'
import { snapshotFrom, summarize } from './calc/netWorth'
import { DEFAULT_FIRE_INPUTS } from './fireInputs'
import type { Category } from '../types'

/**
 * Demo dataset (spec ST3): a mid-30s household with a mortgage. Six monthly
 * snapshots are derived from the same accounts (invested balances growing,
 * loans paying down) so the history is internally consistent.
 */
const ACCOUNTS: [string, Category, number, string?][] = [
  ['Checking', 'cash', 850_000],
  ['High-yield savings', 'cash', 2_200_000, 'Emergency fund, ~6 months'],
  ['401(k)', 'retirement', 9_450_000],
  ['Roth IRA', 'retirement', 3_100_000],
  ['Brokerage', 'taxable', 4_120_000],
  ['Home', 'real-estate', 42_000_000],
  ['Car', 'vehicle', 1_800_000],
  ['Mortgage', 'mortgage', 31_200_000],
  ['Car loan', 'auto-loan', 950_000],
  ['Credit card', 'credit-card', 180_000, 'Paid in full monthly'],
]

/** Balance k months ago, by how that kind of account typically moves. */
function pastBalance(a: Account, k: number): number {
  if (a.invested) return Math.round(a.balance / 1.011 ** k) // ~1.1%/mo growth incl. contributions
  switch (a.category) {
    case 'mortgage':
      return a.balance + 95_000 * k // principal paid down ~$950/mo
    case 'auto-loan':
      return a.balance + 42_000 * k
    case 'vehicle':
      return a.balance + 25_000 * k // depreciation
    case 'cash':
      return Math.max(0, a.balance - 18_000 * k + (k === 3 ? 250_000 : 0)) // bonus parked 3 months ago
    default:
      return a.balance
  }
}

/** First of the month, `monthsBack` months before `today` (YYYY-MM-DD). */
function firstOfMonth(today: string, monthsBack: number): string {
  const [y, m] = today.split('-').map(Number)
  const d = new Date(y, m - 1 - monthsBack, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function buildSampleData(today: string): PersonalFinanceData {
  const stamp = `${today}T09:00:00.000Z`
  const accounts: Account[] = ACCOUNTS.map(([name, category, balance, note], i) => {
    const meta = categoryMeta(category)
    return { id: `sample-${i + 1}`, name, kind: meta.kind, category, balance, invested: meta.invested, liquid: meta.liquid, ...(note ? { note } : {}), createdAt: stamp, updatedAt: stamp }
  })

  const snapshots = [6, 5, 4, 3, 2, 1].map((k) => {
    const past = accounts.map((a) => ({ ...a, balance: pastBalance(a, k) }))
    return snapshotFrom(summarize(past), firstOfMonth(today, k), k === 3 ? 'Bonus month' : undefined)
  })

  return {
    schemaVersion: 1,
    accounts,
    snapshots,
    fire: {
      ...DEFAULT_FIRE_INPUTS,
      currentAge: 34,
      investedAssets: summarize(accounts).invested,
      annualContribution: 2_400_000,
      contributionGrowthPct: 2,
      annualSpending: 4_800_000,
      targetRetirementAge: 60,
      afterTaxIncome: 9_500_000,
    },
    isSampleData: true,
  }
}
