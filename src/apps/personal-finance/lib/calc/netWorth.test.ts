import { describe, expect, it } from 'vitest'
import type { Account, Category } from '../../types'
import { categoryMeta } from '../categories'
import { change, localISODate, snapshotFrom, snapshotNetWorth, summarize, upsertSnapshot } from './netWorth'

let seq = 0
function acct(category: Category, dollars: number, overrides: Partial<Account> = {}): Account {
  const meta = categoryMeta(category)
  return {
    id: String(++seq),
    name: meta.label,
    kind: meta.kind,
    category,
    balance: Math.round(dollars * 100),
    invested: meta.invested,
    liquid: meta.liquid,
    createdAt: '2026-10-11T00:00:00Z',
    updatedAt: '2026-10-11T00:00:00Z',
    ...overrides,
  }
}

// A household with $350k assets and $210k liabilities (spec §6 reference cases).
const household = [
  acct('cash', 15_000),
  acct('taxable', 40_000),
  acct('retirement', 95_000),
  acct('real-estate', 200_000),
  acct('mortgage', 180_000),
  acct('auto-loan', 12_000),
  acct('credit-card', 3_000),
  acct('student-loan', 15_000),
]

describe('summarize', () => {
  const s = summarize(household)

  it('net worth = assets − liabilities', () => {
    expect(s.assets).toBe(35_000_000)
    expect(s.liabilities).toBe(21_000_000)
    expect(s.netWorth).toBe(14_000_000) // $140,000
  })

  it('debt-to-asset ratio', () => expect(s.debtToAsset).toBeCloseTo(0.6, 10))

  it('invested uses the flag (taxable + retirement by default)', () => expect(s.invested).toBe(13_500_000))

  it('liquid net worth = liquid assets − credit-card debt', () => {
    expect(s.liquidAssets).toBe(5_500_000) // cash + taxable
    expect(s.liquidNetWorth).toBe(5_200_000)
  })

  it('home equity = real estate − mortgage', () => expect(s.homeEquity).toBe(2_000_000))

  it('groups by category, combining accounts', () => {
    const two = summarize([acct('cash', 100), acct('cash', 50.25)])
    expect(two.byCategory.cash).toBe(15_025)
  })

  it('respects user-overridden flags', () => {
    const o = summarize([acct('real-estate', 100_000, { invested: true })])
    expect(o.invested).toBe(10_000_000)
  })

  it('is exact with cents (no float drift)', () => {
    const many = Array.from({ length: 10 }, () => acct('cash', 0.1))
    expect(summarize(many).assets).toBe(100)
  })

  it('handles empty input', () => {
    const e = summarize([])
    expect(e).toMatchObject({ assets: 0, liabilities: 0, netWorth: 0, debtToAsset: null, homeEquity: null })
  })

  it('only-debt: negative net worth, no ratio', () => {
    const d = summarize([acct('student-loan', 30_000)])
    expect(d.netWorth).toBe(-3_000_000)
    expect(d.debtToAsset).toBeNull()
  })

  it('home equity present with only a mortgage', () => {
    expect(summarize([acct('mortgage', 1000)]).homeEquity).toBe(-100_000)
  })
})

describe('snapshots', () => {
  const s = summarize(household)

  it('captures totals and trims notes', () => {
    const snap = snapshotFrom(s, '2026-10-11', '  bonus month ')
    expect(snap).toMatchObject({ date: '2026-10-11', assets: 35_000_000, liabilities: 21_000_000, invested: 13_500_000, liquid: 5_500_000, note: 'bonus month' })
    expect(snapshotNetWorth(snap)).toBe(14_000_000)
  })

  it('omits blank notes', () => expect(snapshotFrom(s, '2026-10-11', '   ')).not.toHaveProperty('note'))

  it('copies byCategory (no shared reference)', () => {
    const snap = snapshotFrom(s, '2026-10-11')
    expect(snap.byCategory).not.toBe(s.byCategory)
    expect(snap.byCategory).toEqual(s.byCategory)
  })

  it('upsert sorts and replaces the same date', () => {
    const a = snapshotFrom(summarize([acct('cash', 1)]), '2026-09-01')
    const b = snapshotFrom(summarize([acct('cash', 2)]), '2026-08-01')
    const a2 = snapshotFrom(summarize([acct('cash', 3)]), '2026-09-01')
    const list = upsertSnapshot(upsertSnapshot(upsertSnapshot([], a), b), a2)
    expect(list.map((x) => x.date)).toEqual(['2026-08-01', '2026-09-01'])
    expect(list[1].assets).toBe(300)
  })
})

describe('change', () => {
  it('absolute and percent', () => expect(change(10_000, 12_500)).toEqual({ abs: 2_500, pct: 0.25 }))
  it('decrease', () => expect(change(10_000, 9_000)).toEqual({ abs: -1_000, pct: -0.1 }))
  it('from a negative base uses |previous|', () => expect(change(-10_000, -5_000)).toEqual({ abs: 5_000, pct: 0.5 }))
  it('from zero has no percent', () => expect(change(0, 500)).toEqual({ abs: 500, pct: null }))
})

describe('localISODate', () => {
  it('formats local date', () => expect(localISODate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05'))
})
