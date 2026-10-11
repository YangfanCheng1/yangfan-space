import { describe, expect, it } from 'vitest'
import type { FireInputs } from '../types'
import { DEFAULT_FIRE_INPUTS, hasErrors, toFireParams, validateFireInputs } from './fireInputs'

const valid = (overrides: Partial<FireInputs> = {}) => ({ ...DEFAULT_FIRE_INPUTS, ...overrides })
const errorsFor = (overrides: Partial<FireInputs>) => validateFireInputs(valid(overrides))

describe('validateFireInputs', () => {
  it('defaults are valid', () => expect(hasErrors(validateFireInputs(DEFAULT_FIRE_INPUTS))).toBe(false))

  it.each<[Partial<FireInputs>, keyof FireInputs]>([
    [{ currentAge: 13 }, 'currentAge'],
    [{ currentAge: 30.5 }, 'currentAge'],
    [{ currentAge: Number.NaN }, 'currentAge'],
    [{ investedAssets: -1 }, 'investedAssets'],
    [{ annualContribution: -1 }, 'annualContribution'],
    [{ contributionGrowthPct: 11 }, 'contributionGrowthPct'],
    [{ annualSpending: 0 }, 'annualSpending'],
    [{ realReturnPct: -3 }, 'realReturnPct'],
    [{ realReturnPct: 13 }, 'realReturnPct'],
    [{ withdrawalRatePct: 1.5 }, 'withdrawalRatePct'],
    [{ withdrawalRatePct: 9 }, 'withdrawalRatePct'],
    [{ targetRetirementAge: 30 }, 'targetRetirementAge'],
    [{ targetRetirementAge: 91 }, 'targetRetirementAge'],
    [{ afterTaxIncome: 1_000_000 }, 'afterTaxIncome'], // $10k income < $20k saved
    [{ afterTaxIncome: 0 }, 'afterTaxIncome'],
    [{ partTimeIncome: 4_000_000 }, 'partTimeIncome'], // = spending
    [{ partTimeIncome: -1 }, 'partTimeIncome'],
    [{ projectionMode: 'barista' }, 'partTimeIncome'],
  ])('%j → error on %s', (overrides, field) => {
    const e = errorsFor(overrides)
    expect(Object.keys(e)).toEqual([field])
  })

  it('accepts the range edges', () => {
    expect(
      hasErrors(errorsFor({ currentAge: 14, realReturnPct: -2, withdrawalRatePct: 8, contributionGrowthPct: 10, targetRetirementAge: 90 })),
    ).toBe(false)
    expect(hasErrors(errorsFor({ realReturnPct: 12, withdrawalRatePct: 2 }))).toBe(false)
  })

  it('accepts Barista mode with part-time income', () => {
    expect(hasErrors(errorsFor({ projectionMode: 'barista', partTimeIncome: 2_000_000 }))).toBe(false)
  })

  it('income equal to contribution is fine (100% savings rate)', () => {
    expect(hasErrors(errorsFor({ afterTaxIncome: 2_000_000 }))).toBe(false)
  })
})

describe('toFireParams', () => {
  it('converts cents → dollars and percent → decimal', () => {
    const p = toFireParams(valid({ investedAssets: 1_234_567, afterTaxIncome: 7_500_000, partTimeIncome: 2_000_000, contributionGrowthPct: 3 }))
    expect(p).toEqual({
      currentAge: 30,
      invested: 12_345.67,
      contribution: 20_000,
      contributionGrowth: 0.03,
      spending: 40_000,
      realReturn: 0.05,
      withdrawalRate: 0.04,
      targetRetirementAge: 65,
      afterTaxIncome: 75_000,
      partTimeIncome: 20_000,
      mode: 'full',
    })
  })

  it('keeps optional fields undefined', () => {
    const p = toFireParams(DEFAULT_FIRE_INPUTS)
    expect(p.afterTaxIncome).toBeUndefined()
    expect(p.partTimeIncome).toBeUndefined()
  })
})
