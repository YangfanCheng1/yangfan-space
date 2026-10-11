import type { Cents } from '../../types'

/**
 * Parse user-typed USD into integer cents. Accepts "1234.5", "1,234.50",
 * "$1,234.50", " -$12 ". Extra decimals round half-up to the cent.
 * Returns null for anything that isn't a plain amount (no NaN leaks).
 * String math, not float math, so "1.005" becomes 101 cents, not 100.
 */
export function parseMoney(input: string): Cents | null {
  const s = input.replace(/\s+/g, '')
  const m = /^(-)?\$?(\d{1,3}(?:,\d{3})+|\d+)?(?:\.(\d*))?$/.exec(s)
  if (!m) return null
  const [, minus, intPart = '', fracPart = ''] = m
  if (intPart === '' && fracPart === '') return null

  const whole = Number(intPart.replace(/,/g, '') || '0')
  const frac3 = (fracPart + '000').slice(0, 3)
  let cents = whole * 100 + Number(frac3.slice(0, 2)) + (Number(frac3[2]) >= 5 ? 1 : 0)
  if (!Number.isSafeInteger(cents)) return null
  if (minus) cents = -cents
  return cents === 0 ? 0 : cents // avoid -0
}

export const centsToDollars = (cents: Cents) => cents / 100
export const dollarsToCents = (dollars: number): Cents => Math.round(dollars * 100)
