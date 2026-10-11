/** Persisted data model — see docs/specs/personal-finance.md §7. */

/** Integer cents. Storage and net-worth sums use cents so they never drift. */
export type Cents = number

export type AssetCategory = 'cash' | 'taxable' | 'retirement' | 'real-estate' | 'vehicle' | 'other-asset'
export type LiabilityCategory = 'mortgage' | 'student-loan' | 'auto-loan' | 'credit-card' | 'other-debt'
export type Category = AssetCategory | LiabilityCategory
export type AccountKind = 'asset' | 'liability'

export interface Account {
  id: string
  name: string
  kind: AccountKind
  category: Category
  /** Always ≥ 0; the sign comes from `kind`. */
  balance: Cents
  /** Counts toward FIRE "invested assets". */
  invested: boolean
  /** Cash-like; counts toward liquid net worth. */
  liquid: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

export interface NetWorthSnapshot {
  /** YYYY-MM-DD, unique per snapshot. */
  date: string
  assets: Cents
  liabilities: Cents
  invested: Cents
  liquid: Cents
  byCategory: Partial<Record<Category, Cents>>
  note?: string
}

export interface FireInputs {
  currentAge: number
  investedAssets: Cents
  annualContribution: Cents
  contributionGrowthPct: number
  annualSpending: Cents
  realReturnPct: number
  withdrawalRatePct: number
  targetRetirementAge: number
  afterTaxIncome?: Cents
  partTimeIncome?: Cents
  projectionMode: 'full' | 'barista'
}

export interface PersonalFinanceData {
  schemaVersion: 1
  accounts: Account[]
  snapshots: NetWorthSnapshot[]
  fire: FireInputs
  isSampleData: boolean
}
