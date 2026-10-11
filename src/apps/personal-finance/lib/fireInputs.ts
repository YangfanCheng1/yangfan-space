import type { FireInputs } from '../types'
import { centsToDollars } from './calc/money'
import type { FireParams } from './calc/fire'

/** Spec §5.3 defaults. */
export const DEFAULT_FIRE_INPUTS: FireInputs = {
  currentAge: 30,
  investedAssets: 0,
  annualContribution: 2_000_000,
  contributionGrowthPct: 0,
  annualSpending: 4_000_000,
  realReturnPct: 5,
  withdrawalRatePct: 4,
  targetRetirementAge: 65,
  projectionMode: 'full',
}

export type FireErrors = Partial<Record<keyof FireInputs, string>>

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Inline validation messages per field (spec §5.3 table). Empty object = valid. */
export function validateFireInputs(i: FireInputs): FireErrors {
  const e: FireErrors = {}

  if (!isNum(i.currentAge) || !Number.isInteger(i.currentAge) || i.currentAge < 14 || i.currentAge > 90)
    e.currentAge = 'Enter a whole-number age from 14 to 90.'
  if (!isNum(i.investedAssets) || i.investedAssets < 0) e.investedAssets = "Can't be negative."
  if (!isNum(i.annualContribution) || i.annualContribution < 0) e.annualContribution = "Can't be negative."
  if (!isNum(i.contributionGrowthPct) || i.contributionGrowthPct < 0 || i.contributionGrowthPct > 10)
    e.contributionGrowthPct = 'Use 0% to 10%.'
  if (!isNum(i.annualSpending) || i.annualSpending <= 0) e.annualSpending = 'Enter how much you expect to spend per year.'
  if (!isNum(i.realReturnPct) || i.realReturnPct < -2 || i.realReturnPct > 12) e.realReturnPct = 'Use −2% to 12%.'
  if (!isNum(i.withdrawalRatePct) || i.withdrawalRatePct < 2 || i.withdrawalRatePct > 8)
    e.withdrawalRatePct = 'Use 2% to 8%.'
  if (
    !isNum(i.targetRetirementAge) ||
    !Number.isInteger(i.targetRetirementAge) ||
    i.targetRetirementAge > 90 ||
    (isNum(i.currentAge) && i.targetRetirementAge <= i.currentAge)
  )
    e.targetRetirementAge = 'Must be later than your current age, and no later than 90.'

  if (i.afterTaxIncome !== undefined) {
    if (!isNum(i.afterTaxIncome) || i.afterTaxIncome <= 0) e.afterTaxIncome = 'Enter a positive amount, or leave blank.'
    else if (isNum(i.annualContribution) && i.afterTaxIncome < i.annualContribution)
      e.afterTaxIncome = "Income can't be less than what you save."
  }

  if (i.partTimeIncome !== undefined) {
    if (!isNum(i.partTimeIncome) || i.partTimeIncome < 0) e.partTimeIncome = "Can't be negative."
    else if (isNum(i.annualSpending) && i.partTimeIncome >= i.annualSpending)
      e.partTimeIncome = 'Must be less than your annual spending.'
  }
  if (i.projectionMode === 'barista' && !(i.partTimeIncome && i.partTimeIncome > 0) && !e.partTimeIncome)
    e.partTimeIncome = 'Enter part-time income to use Barista mode.'

  return e
}

export const hasErrors = (e: FireErrors) => Object.keys(e).length > 0

/** Stored inputs (cents, percents) → engine params (dollars, decimals). */
export function toFireParams(i: FireInputs): FireParams {
  return {
    currentAge: i.currentAge,
    invested: centsToDollars(i.investedAssets),
    contribution: centsToDollars(i.annualContribution),
    contributionGrowth: i.contributionGrowthPct / 100,
    spending: centsToDollars(i.annualSpending),
    realReturn: i.realReturnPct / 100,
    withdrawalRate: i.withdrawalRatePct / 100,
    targetRetirementAge: i.targetRetirementAge,
    afterTaxIncome: i.afterTaxIncome === undefined ? undefined : centsToDollars(i.afterTaxIncome),
    partTimeIncome: i.partTimeIncome === undefined ? undefined : centsToDollars(i.partTimeIncome),
    mode: i.projectionMode,
  }
}
