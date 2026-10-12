import { describe, expect, it } from 'vitest'
import { formatChange, formatDate, formatDateShort, formatOneDecimal, formatPct, formatUSD, formatYears, parseISODate } from './format'

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
  it('absorbs float noise', () => {
    expect(formatPct(0.07)).toBe('7%')
    expect(formatPct(0.0575)).toBe('5.8%')
    expect(formatPct(0.999, 0)).toBe('100%')
  })
  it('handles non-finite', () => expect(formatPct(Number.NaN)).toBe('—'))
})

describe('formatOneDecimal / formatYears', () => {
  it('rounds to one decimal', () => expect(formatOneDecimal(46.94)).toBe('46.9'))
  it('drops .0', () => expect(formatOneDecimal(46.96)).toBe('47'))
  it('pluralizes years', () => {
    expect(formatYears(16.94)).toBe('16.9 years')
    expect(formatYears(1)).toBe('1 year')
    expect(formatYears(0)).toBe('0 years')
  })
  it('handles non-finite', () => expect(formatOneDecimal(Infinity)).toBe('—'))
})

describe('dates', () => {
  it('formats long and short', () => {
    expect(formatDate('2026-09-01')).toBe('Sep 1, 2026')
    expect(formatDateShort('2026-09-01')).toBe('Sep ’26')
  })
  it('parses as local date (no UTC day shift)', () => expect(parseISODate('2026-01-01').getDate()).toBe(1))
})

describe('formatChange', () => {
  it('up / down / flat', () => {
    expect(formatChange(1200)).toBe('▲ $1,200')
    expect(formatChange(-300.4)).toBe('▼ $300')
    expect(formatChange(0.2)).toBe('± $0')
  })
})
