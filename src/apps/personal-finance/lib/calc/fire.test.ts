import { describe, expect, it } from 'vitest'
import {
  coastNumber,
  computeFire,
  drawdownYears,
  fiNumber,
  portfolioValue,
  yearsToCoast,
  yearsToReach,
} from './fire'
import type { FireParams } from './fire'

/** Spec tolerance: ±0.01 years. */
const nearYears = (actual: number | null, expected: number) => {
  expect(actual).not.toBeNull()
  expect(Math.abs(actual! - expected)).toBeLessThan(0.01)
}
/** Spec tolerance: ±$1. */
const nearDollars = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(1)

/** Every number anywhere in the result must be finite (no NaN/Infinity leaks). */
function expectAllFinite(value: unknown, path = 'result'): void {
  if (typeof value === 'number') expect(Number.isFinite(value), `${path} = ${value}`).toBe(true)
  else if (Array.isArray(value)) value.forEach((v, i) => expectAllFinite(v, `${path}[${i}]`))
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => expectAllFinite(v, `${path}.${k}`))
}

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

describe('spec §6 reference cases', () => {
  it('FI number: E 40,000 at 4% → 1,000,000', () => expect(fiNumber(40_000, 0.04)).toBe(1_000_000))

  it('Barista target: E 40,000, B 20,000, 4% → 500,000', () => {
    expect(computeFire({ ...base, partTimeIncome: 20_000 }).baristaNumber).toBe(500_000)
  })

  it('Years to FI: P 100k, C 30k, r 5% → ≈ 16.94', () => {
    nearYears(yearsToReach(100_000, 30_000, 0.05, 0, 1_000_000, 60), 16.94)
  })

  it('Zero return: P 100k, C 50k, r 0 → 18.00', () => {
    nearYears(yearsToReach(100_000, 50_000, 0, 0, 1_000_000, 60), 18)
  })

  it('Growing contributions: C 10k, r 5%, g 3%, 10 yrs → ≈ 142,490', () => {
    nearDollars(portfolioValue(0, 10_000, 0.05, 0.03, 10), 142_490)
  })

  it('r = g: C 10k, r = g = 5%, 10 yrs → 10·10,000·1.05⁹ ≈ 155,133', () => {
    nearDollars(portfolioValue(0, 10_000, 0.05, 0.05, 10), 155_133)
  })

  it('Already FI: P 1.2M ≥ T → 0', () => expect(yearsToReach(1_200_000, 30_000, 0.05, 0, 1_000_000, 60)).toBe(0))

  it('Never: P 10k, C 0, r 0 → null', () => expect(yearsToReach(10_000, 0, 0, 0, 1_000_000, 60)).toBeNull())

  it('Coast FIRE: T 1M, r 5%, 30 yrs → ≈ 231,377', () => nearDollars(coastNumber(1_000_000, 0.05, 30), 231_377))

  it('Drawdown: 1M, spend 40k, r 0 → exactly 25 years', () => expect(drawdownYears(1_000_000, 40_000, 0, 100)).toBe(25))

  it('Savings rate: C 30k, income 75k → 40%', () => {
    expect(computeFire({ ...base, afterTaxIncome: 75_000 }).savingsRate).toBeCloseTo(0.4, 10)
  })
})

describe('portfolioValue', () => {
  it('matches the closed form years-to-FI when g = 0', () => {
    const closed = Math.log((1_000_000 * 0.05 + 30_000) / (100_000 * 0.05 + 30_000)) / Math.log(1.05)
    expect(yearsToReach(100_000, 30_000, 0.05, 0, 1_000_000, 60)!).toBeCloseTo(closed, 9)
  })

  it('equals the year-by-year recurrence at whole years (with growth)', () => {
    let v = 50_000
    for (let k = 0; k < 25; k++) v = v * 1.06 + 12_000 * Math.pow(1.04, k)
    expect(portfolioValue(50_000, 12_000, 0.06, 0.04, 25)).toBeCloseTo(v, 6)
  })

  it('is continuous across the r ≈ g special case', () => {
    const exact = portfolioValue(0, 10_000, 0.05, 0.05, 10)
    const near = portfolioValue(0, 10_000, 0.05, 0.05 + 1e-7, 10)
    expect(Math.abs(exact - near)).toBeLessThan(0.5)
  })

  it('r = g = 0 is just the sum of contributions', () => expect(portfolioValue(1_000, 500, 0, 0, 4)).toBe(3_000))

  it('handles negative real returns', () => {
    expect(portfolioValue(100_000, 0, -0.02, 0, 1)).toBeCloseTo(98_000, 6)
  })
})

describe('yearsToReach', () => {
  it('respects the horizon', () => {
    expect(yearsToReach(100_000, 30_000, 0.05, 0, 1_000_000, 16)).toBeNull()
    nearYears(yearsToReach(100_000, 30_000, 0.05, 0, 1_000_000, 17), 16.94)
  })

  it('zero horizon only answers "already there"', () => {
    expect(yearsToReach(5, 1, 0.05, 0, 10, 0)).toBeNull()
    expect(yearsToReach(10, 1, 0.05, 0, 10, 0)).toBe(0)
  })

  it('negative returns with contributions can still get there', () => {
    const n = yearsToReach(0, 100_000, -0.02, 0, 1_000_000, 60)!
    expect(n).toBeGreaterThan(10) // slower than the 10 years at r = 0
    nearDollars(portfolioValue(0, 100_000, -0.02, 0, n), 1_000_000)
  })

  it('the returned year is the first crossing (just below target a bit earlier)', () => {
    const n = yearsToReach(100_000, 30_000, 0.05, 0.02, 1_000_000, 60)!
    nearDollars(portfolioValue(100_000, 30_000, 0.05, 0.02, n), 1_000_000)
    expect(portfolioValue(100_000, 30_000, 0.05, 0.02, n - 0.01)).toBeLessThan(1_000_000)
  })
})

describe('Coast FIRE', () => {
  it('coast age: P 100k, C 10k, r 5%, age 30 → 65 → ≈ 40.69', () => {
    nearYears(yearsToCoast(100_000, 10_000, 0.05, 0, 1_000_000, 35)! + 30, 40.69)
  })

  it('coast age 0 when already past the coast number', () => {
    expect(yearsToCoast(300_000, 0, 0.05, 0, 1_000_000, 30)).toBe(0)
  })

  it('null when contributions never get you there by retirement', () => {
    expect(yearsToCoast(0, 1_000, 0.05, 0, 1_000_000, 35)).toBeNull()
  })

  it('"FI age if you stop now" matches ln(T/P)/ln(1+r)', () => {
    const r = computeFire(base)
    expect(r.coast.fiAgeIfStopNow!).toBeCloseTo(30 + Math.log(10) / Math.log(1.05), 6)
  })

  it('coast number with r = 0 is the target itself', () => expect(coastNumber(1_000_000, 0, 30)).toBe(1_000_000))
})

describe('drawdownYears', () => {
  it('sustainable when growth outpaces withdrawals → null', () => {
    expect(drawdownYears(1_000_000, 40_000, 0.05, 60)).toBeNull()
  })

  it('fractional final year', () => expect(drawdownYears(500_000, 40_000, 0, 60)).toBe(12.5))

  it('no withdrawal never runs out', () => expect(drawdownYears(1, 0, 0, 60)).toBeNull())
})

describe('computeFire', () => {
  const r = computeFire(base, 2026)

  it('headline numbers', () => {
    expect(r.fiNumber).toBe(1_000_000)
    expect(r.target).toBe(1_000_000)
    expect(r.progress).toBeCloseTo(0.1, 10)
    nearYears(r.yearsToFi, 16.94)
    nearYears(r.fiAge, 46.94)
    expect(r.fiCalendarYear).toBe(2043)
  })

  it('projection runs to age 90 and switches to drawdown after FI', () => {
    expect(r.projection).toHaveLength(61)
    expect(r.projection.at(-1)).toMatchObject({ age: 90, calendarYear: 2086 })
    expect(r.fiIndex).toBe(17)
    expect(r.projection[16].value).toBeLessThan(1_000_000)
    expect(r.projection[17].value).toBeGreaterThanOrEqual(1_000_000)
    expect(r.projection[17].phase).toBe('accumulation')
    expect(r.projection[18].phase).toBe('drawdown')
    const v17 = r.projection[17].value
    expect(r.projection[18].value).toBeCloseTo((v17 - 40_000) * 1.05, 6)
  })

  it('projection accumulation matches portfolioValue at whole years', () => {
    for (const k of [0, 1, 5, 17]) expect(r.projection[k].value).toBeCloseTo(portfolioValue(100_000, 30_000, 0.05, 0, k), 6)
  })

  it('coast path has no contributions', () => {
    expect(r.projection[10].coastValue).toBeCloseTo(100_000 * 1.05 ** 10, 6)
  })

  it('sustainable at 5% real → lasts past 90', () => expect(r.sustainability).toEqual({ runsOutAge: null }))

  it('variant ladder: lean < FIRE < fat', () => {
    expect(r.variants.map((v) => v.id)).toEqual(['lean', 'fire', 'fat'])
    expect(r.variants.map((v) => v.target)).toEqual([750_000, 1_000_000, 1_500_000])
    const [lean, fire, fat] = r.variants
    expect(lean.years!).toBeLessThan(fire.years!)
    expect(fire.years!).toBeLessThan(fat.years!)
    expect(fire.years).toBe(r.yearsToFi)
  })

  it('coast details', () => {
    nearDollars(r.coast.number, 1_000_000 / 1.05 ** 35)
    expect(r.coast.yearsToRetirement).toBe(35)
    expect(r.coast.alreadyCoasting).toBe(false)
    expect(r.coast.coastAge!).toBeGreaterThan(30)
    expect(r.coast.coastAge!).toBeLessThan(r.fiAge!)
  })

  it('sensitivity grid: base cell equals yearsToFi; more return or savings → sooner', () => {
    const { cells } = r.sensitivity
    expect(cells).toHaveLength(5)
    expect(cells[2][2]).toBe(r.yearsToFi)
    for (let i = 1; i < 5; i++) expect(cells[i][2]!).toBeLessThan(cells[i - 1][2]!)
    for (let j = 1; j < 5; j++) expect(cells[2][j]!).toBeLessThan(cells[2][j - 1]!)
  })

  it('no savings rate without income', () => expect(r.savingsRate).toBeNull())

  it('all numbers are finite', () => expectAllFinite(r))
})

describe('computeFire edge states', () => {
  it('already FI: drawdown from year 1', () => {
    const r = computeFire({ ...base, invested: 1_200_000 }, 2026)
    expect(r.yearsToFi).toBe(0)
    expect(r.fiAge).toBe(30)
    expect(r.fiIndex).toBe(0)
    expect(r.progress).toBeCloseTo(1.2, 10)
    expect(r.coast.alreadyCoasting).toBe(true)
    expect(r.coast.coastAge).toBe(30)
    expect(r.projection[1].phase).toBe('drawdown')
    expect(r.projection[1].value).toBeCloseTo((1_200_000 - 40_000) * 1.05, 6)
  })

  it('never reaches FI: nulls, not NaN', () => {
    const r = computeFire({ ...base, invested: 10_000, contribution: 0, realReturn: 0 })
    expect(r).toMatchObject({ yearsToFi: null, fiAge: null, fiCalendarYear: null, fiIndex: null, sustainability: null })
    expect(r.projection.every((p) => p.phase === 'accumulation')).toBe(true)
    expectAllFinite(r)
  })

  it('runs out of money: retire at 60 with 500k, 8% SWR, 0% return', () => {
    const r = computeFire({ ...base, currentAge: 60, targetRetirementAge: 65, invested: 500_000, realReturn: 0, withdrawalRate: 0.08 })
    expect(r.yearsToFi).toBe(0)
    expect(r.sustainability).toEqual({ runsOutAge: 72.5 })
    expect(r.projection.find((p) => p.age === 73)!.value).toBe(0)
    expect(r.projection.at(-1)!.value).toBe(0)
  })

  it('Barista mode: lower target, smaller withdrawals', () => {
    const r = computeFire({ ...base, partTimeIncome: 20_000, mode: 'barista' })
    expect(r.target).toBe(500_000)
    expect(r.withdrawal).toBe(20_000)
    expect(r.variants.at(-1)).toMatchObject({ id: 'barista', spending: 20_000, target: 500_000 })
    expect(r.yearsToFi!).toBeLessThan(computeFire(base).yearsToFi!)
  })

  it('Barista mode without part-time income falls back to full', () => {
    const r = computeFire({ ...base, mode: 'barista' })
    expect(r.target).toBe(1_000_000)
    expect(r.baristaNumber).toBeNull()
    expect(r.variants).toHaveLength(3)
  })

  it('age 89: one-year horizon still works', () => {
    const r = computeFire({ ...base, currentAge: 89, targetRetirementAge: 90 })
    expect(r.projection).toHaveLength(2)
    expect(r.yearsToFi).toBeNull()
    expectAllFinite(r)
  })

  it('extreme-but-valid inputs stay finite', () => {
    expectAllFinite(computeFire({ ...base, invested: 0, contribution: 0, realReturn: -0.02, contributionGrowth: 0.1 }))
    expectAllFinite(computeFire({ ...base, realReturn: 0.12, contributionGrowth: 0.1, currentAge: 14 }))
  })
})
