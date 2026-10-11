import { describe, expect, it } from 'vitest'
import { centsToDollars, dollarsToCents, parseMoney } from './money'

describe('parseMoney', () => {
  it.each([
    ['$1,234.50', 123450], // spec §6 reference case
    ['1234.5', 123450],
    ['1,234.50', 123450],
    ['1234', 123400],
    [' $ 40,000 ', 4000000],
    ['.5', 50],
    ['0', 0],
    ['1,000,000', 100000000],
    ['-$12', -1200],
    ['1.005', 101],
    ['1.004', 100],
    ['99.999', 10000],
  ])('%s → %i cents', (input, cents) => {
    expect(parseMoney(input)).toBe(cents)
  })

  it.each(['', '   ', 'abc', '$', '.', '1,23', '12,34,567', '1.2.3', '1e5', '$-5', '--1'])('rejects %j', (input) => {
    expect(parseMoney(input)).toBeNull()
  })

  it('never returns -0', () => expect(Object.is(parseMoney('-0'), 0)).toBe(true))
})

describe('cents ↔ dollars', () => {
  it('round-trips', () => {
    expect(centsToDollars(123450)).toBe(1234.5)
    expect(dollarsToCents(1234.5)).toBe(123450)
    expect(dollarsToCents(0.1 + 0.2)).toBe(30)
  })
})
