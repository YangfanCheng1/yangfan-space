import { describe, expect, it } from 'vitest'
import { computeFire } from './calc/fire'
import type { FireParams } from './calc/fire'
import { bestLever, leverCandidates } from './levers'

const base: FireParams = {
  currentAge: 30,
  invested: 100_000,
  contribution: 30_000,
  contributionGrowth: 0,
  spending: 40_000,
  realReturn: 0.05,
  withdrawalRate: 0.04,
  targetRetirementAge: 65,
  mode: 'full',
}

describe('leverCandidates', () => {
  it('saves at least $5k/yr more', () => {
    expect(leverCandidates({ ...base, contribution: 2_000 }).find((c) => c.id === 'save-more')!.newValue).toBe(7_000)
    expect(leverCandidates(base).find((c) => c.id === 'save-more')!.newValue).toBe(45_000)
  })

  it('caps return at 12%', () => {
    expect(leverCandidates({ ...base, realReturn: 0.12 }).map((c) => c.id)).not.toContain('higher-return')
  })

  it('skips spend-less when it would drop below Barista part-time income', () => {
    const ids = leverCandidates({ ...base, mode: 'barista', partTimeIncome: 35_000 }).map((c) => c.id)
    expect(ids).not.toContain('spend-less')
  })
})

describe('bestLever', () => {
  it('picks the change with the earliest FI age, and that age beats the baseline', () => {
    const lever = bestLever(base)!
    const baseline = computeFire(base).fiAge!
    expect(lever.fiAge).toBeLessThan(baseline)
    // By hand: save $45k → ln(95k/50k)/ln 1.05 = 13.16 yrs; spend $30k → ln(67.5k/35k)/ln 1.05 = 13.46 yrs;
    // return 6% → ln(90k/36k)/ln 1.06 = 15.73 yrs. Saving more wins narrowly.
    expect(lever.id).toBe('save-more')
    expect(lever.newValue).toBe(45_000)
    expect(lever.fiAge).toBeCloseTo(30 + Math.log(95_000 / 50_000) / Math.log(1.05), 6)
  })

  it('rescues a plan that never reaches FI', () => {
    const never: FireParams = { ...base, invested: 0, contribution: 3_000, realReturn: 0.02, currentAge: 50 }
    expect(computeFire(never).yearsToFi).toBeNull()
    const lever = bestLever(never)
    expect(lever).toBeNull() // even the best single lever can't get there by 90…
    const closer = bestLever({ ...never, contribution: 20_000 })!
    expect(closer).not.toBeNull() // …but a less hopeless plan gets a suggestion
    expect(closer.fiAge).toBeLessThanOrEqual(90)
  })
})
