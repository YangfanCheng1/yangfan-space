import type { AccountKind, AssetCategory, Category, LiabilityCategory } from '../types'

export interface CategoryMeta {
  id: Category
  kind: AccountKind
  label: string
  /** Defaults applied when this category is picked (user can override). */
  invested: boolean
  liquid: boolean
}

/** Spec §5.2 NW2. Order here is display order. */
export const CATEGORIES: CategoryMeta[] = [
  { id: 'cash', kind: 'asset', label: 'Cash & savings', invested: false, liquid: true },
  { id: 'taxable', kind: 'asset', label: 'Taxable investments', invested: true, liquid: true },
  { id: 'retirement', kind: 'asset', label: 'Retirement (401(k), IRA…)', invested: true, liquid: false },
  { id: 'real-estate', kind: 'asset', label: 'Real estate', invested: false, liquid: false },
  { id: 'vehicle', kind: 'asset', label: 'Vehicles', invested: false, liquid: false },
  { id: 'other-asset', kind: 'asset', label: 'Other assets', invested: false, liquid: false },
  { id: 'mortgage', kind: 'liability', label: 'Mortgage', invested: false, liquid: false },
  { id: 'student-loan', kind: 'liability', label: 'Student loan', invested: false, liquid: false },
  { id: 'auto-loan', kind: 'liability', label: 'Auto loan', invested: false, liquid: false },
  { id: 'credit-card', kind: 'liability', label: 'Credit card', invested: false, liquid: false },
  { id: 'other-debt', kind: 'liability', label: 'Other debt', invested: false, liquid: false },
]

const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

export function categoryMeta(id: Category): CategoryMeta {
  return byId.get(id)!
}

export const ASSET_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'asset').map((c) => c.id as AssetCategory)
export const LIABILITY_CATEGORIES = CATEGORIES.filter((c) => c.kind === 'liability').map((c) => c.id as LiabilityCategory)

export interface AccountPreset {
  name: string
  category: Category
}

/** Quick-add presets (spec NW3). Flags come from the category defaults. */
export const PRESETS: AccountPreset[] = [
  { name: 'Checking', category: 'cash' },
  { name: 'High-yield savings', category: 'cash' },
  { name: '401(k)', category: 'retirement' },
  { name: 'Roth IRA', category: 'retirement' },
  { name: 'Brokerage', category: 'taxable' },
  { name: 'Home', category: 'real-estate' },
  { name: 'Mortgage', category: 'mortgage' },
  { name: 'Car loan', category: 'auto-loan' },
  { name: 'Credit card', category: 'credit-card' },
]
