import { describe, expect, it } from 'vitest'
import { formatPct, formatUSD } from './format'

describe('formatUSD', () => {
  it('formats whole dollars', () => expect(formatUSD(1234.4)).toBe('$1,234'))
  it('formats cents when asked', () => expect(formatUSD(1234.5, { cents: true })).toBe('$1,234.50'))
  it('formats negatives', () => expect(formatUSD(-2500)).toBe('-$2,500'))
  it('compacts large values', () => expect(formatUSD(1_234_567, { compact: true })).toBe('$1.2M'))
  it('leaves small values uncompacted', () => expect(formatUSD(9_999, { compact: true })).toBe('$9,999'))
  it('never prints NaN/Infinity', () => {
    expect(formatUSD(Number.NaN)).toBe('—')
    expect(formatUSD(Infinity)).toBe('—')
  })
})

describe('formatPct', () => {
  it('formats whole percents', () => expect(formatPct(0.4)).toBe('40%'))
  it('formats fractional percents', () => expect(formatPct(0.0425)).toBe('4.3%'))
  it('handles non-finite', () => expect(formatPct(Number.NaN)).toBe('—'))
})
