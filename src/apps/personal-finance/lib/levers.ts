import { fiNumber, MAX_AGE, yearsToReach } from './calc/fire'
import type { FireParams } from './calc/fire'

/**
 * "Which lever moves it most?" (spec F10). Tries three single changes and
 * reports the one that reaches FI earliest. Used when the plan never reaches
 * FI, and as a nudge otherwise.
 */
export type LeverId = 'save-more' | 'spend-less' | 'higher-return'

export interface Lever {
  id: LeverId
  /** The changed input, in engine units (dollars or decimal rate). */
  newValue: number
  fiAge: number
}

/** The candidate changes, kept modest so the suggestion stays realistic. */
export function leverCandidates(p: FireParams): { id: LeverId; params: FireParams; newValue: number }[] {
  const contribution = Math.max(p.contribution * 1.5, p.contribution + 5_000)
  const spending = p.spending * 0.75
  const realReturn = Math.min(p.realReturn + 0.01, 0.12)
  const out: { id: LeverId; params: FireParams; newValue: number }[] = [
    { id: 'save-more', params: { ...p, contribution }, newValue: contribution },
  ]
  // In Barista mode spending must stay above part-time income.
  if (!(p.mode === 'barista' && (p.partTimeIncome ?? 0) >= spending))
    out.push({ id: 'spend-less', params: { ...p, spending }, newValue: spending })
  if (realReturn > p.realReturn) out.push({ id: 'higher-return', params: { ...p, realReturn }, newValue: realReturn })
  return out
}

function fiAgeFor(p: FireParams): number | null {
  const B = p.partTimeIncome ?? 0
  const target = p.mode === 'barista' && B > 0 ? fiNumber(p.spending - B, p.withdrawalRate) : fiNumber(p.spending, p.withdrawalRate)
  const years = yearsToReach(p.invested, p.contribution, p.realReturn, p.contributionGrowth, target, Math.max(0, MAX_AGE - p.currentAge))
  return years === null ? null : p.currentAge + years
}

/** Best single lever, or null if none of them reaches FI by MAX_AGE. */
export function bestLever(p: FireParams): Lever | null {
  let best: Lever | null = null
  for (const c of leverCandidates(p)) {
    const fiAge = fiAgeFor(c.params)
    if (fiAge !== null && (best === null || fiAge < best.fiAge)) best = { id: c.id, newValue: c.newValue, fiAge }
  }
  return best
}
