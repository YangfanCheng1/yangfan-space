import { describe, expect, it } from 'vitest'
import type { Account } from '../types'
import { DEFAULT_FIRE_INPUTS, isDefaultFire } from './fireInputs'
import { hubFigures } from './hub'
import { buildSampleData } from './sampleData'

const empty = { accounts: [] as Account[], snapshots: [], fire: { ...DEFAULT_FIRE_INPUTS } }

describe('isDefaultFire', () => {
  it('defaults', () => expect(isDefaultFire({ ...DEFAULT_FIRE_INPUTS })).toBe(true))
  it('any change', () => expect(isDefaultFire({ ...DEFAULT_FIRE_INPUTS, realReturnPct: 6 })).toBe(false))
  it('an optional field set', () => expect(isDefaultFire({ ...DEFAULT_FIRE_INPUTS, partTimeIncome: 100 })).toBe(false))
})

describe('hubFigures', () => {
  it('empty app → both empty states', () => expect(hubFigures(empty, '2026-10-12')).toEqual({ netWorth: null, fire: null }))

  it('sample data → net worth with change since last month, FIRE figures', () => {
    const d = buildSampleData('2026-10-12')
    const h = hubFigures(d, '2026-10-12', 2026)
    expect(h.netWorth?.change?.since).toBe('2026-09-01')
    expect(h.netWorth!.change!.abs).toBeGreaterThan(0)
    expect(h.fire).toMatchObject({ status: 'ok' })
    if (h.fire?.status === 'ok') {
      expect(h.fire.target).toBe(1_200_000) // $48k at 4%
      expect(h.fire.progress).toBeCloseTo(d.fire.investedAssets / 100 / 1_200_000, 10)
      expect(h.fire.fiAge!).toBeGreaterThan(34)
    }
  })

  it('a snapshot from today is not "the last snapshot"', () => {
    const d = buildSampleData('2026-10-12')
    const withToday = { ...d, snapshots: [...d.snapshots, { ...d.snapshots[0], date: '2026-10-12' }] }
    expect(hubFigures(withToday, '2026-10-12').netWorth?.change?.since).toBe('2026-09-01')
  })

  it('accounts but no snapshots → no change line', () => {
    const d = buildSampleData('2026-10-12')
    expect(hubFigures({ ...d, snapshots: [] }, '2026-10-12').netWorth?.change).toBeNull()
  })

  it('invalid FIRE inputs → invalid status (no NaN)', () => {
    expect(hubFigures({ ...empty, fire: { ...DEFAULT_FIRE_INPUTS, currentAge: 12 } }, '2026-10-12').fire).toEqual({ status: 'invalid' })
  })
})
