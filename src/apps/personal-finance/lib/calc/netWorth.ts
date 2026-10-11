import type { Account, Category, Cents, NetWorthSnapshot } from '../../types'

/**
 * Net worth math. Everything is integer cents in, integer cents out, so sums are
 * exact. Ratios are plain numbers (0.6 = 60%) and null when undefined.
 */
export interface NetWorthSummary {
  assets: Cents
  liabilities: Cents
  netWorth: Cents
  /** Sum of assets flagged invested — the figure FIRE uses. */
  invested: Cents
  liquidAssets: Cents
  /** Liquid assets − credit-card debt (spec NW6). */
  liquidNetWorth: Cents
  byCategory: Partial<Record<Category, Cents>>
  /** liabilities ÷ assets; null when there are no assets. */
  debtToAsset: number | null
  /** Real estate − mortgage; null when neither exists. */
  homeEquity: Cents | null
}

export function summarize(accounts: readonly Account[]): NetWorthSummary {
  let assets = 0
  let liabilities = 0
  let invested = 0
  let liquidAssets = 0
  const byCategory: Partial<Record<Category, Cents>> = {}

  for (const a of accounts) {
    byCategory[a.category] = (byCategory[a.category] ?? 0) + a.balance
    if (a.kind === 'asset') {
      assets += a.balance
      if (a.invested) invested += a.balance
      if (a.liquid) liquidAssets += a.balance
    } else {
      liabilities += a.balance
    }
  }

  const realEstate = byCategory['real-estate'] ?? 0
  const mortgage = byCategory.mortgage ?? 0
  const hasHome = byCategory['real-estate'] !== undefined || byCategory.mortgage !== undefined

  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
    invested,
    liquidAssets,
    liquidNetWorth: liquidAssets - (byCategory['credit-card'] ?? 0),
    byCategory,
    debtToAsset: assets > 0 ? liabilities / assets : null,
    homeEquity: hasHome ? realEstate - mortgage : null,
  }
}

export function snapshotFrom(summary: NetWorthSummary, date: string, note?: string): NetWorthSnapshot {
  const trimmed = note?.trim()
  return {
    date,
    assets: summary.assets,
    liabilities: summary.liabilities,
    invested: summary.invested,
    liquid: summary.liquidAssets,
    byCategory: { ...summary.byCategory },
    ...(trimmed ? { note: trimmed } : {}),
  }
}

export const snapshotNetWorth = (s: NetWorthSnapshot): Cents => s.assets - s.liabilities

/** Insert or replace (same date) and keep the list sorted oldest → newest. */
export function upsertSnapshot(list: readonly NetWorthSnapshot[], snap: NetWorthSnapshot): NetWorthSnapshot[] {
  return [...list.filter((s) => s.date !== snap.date), snap].sort((a, b) => a.date.localeCompare(b.date))
}

export interface Change {
  abs: Cents
  /** Relative to |previous|; null when previous is 0. */
  pct: number | null
}

export function change(previous: Cents, current: Cents): Change {
  const abs = current - previous
  return { abs, pct: previous === 0 ? null : abs / Math.abs(previous) }
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function localISODate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
