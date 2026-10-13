import { describe, expect, it } from 'vitest'
import { niceSpanTicks, niceTicks } from './niceTicks'

describe('niceTicks', () => {
  it('a $1.08M top → $200K steps to $1.2M (least overshoot)', () => {
    expect(niceTicks(1_080_000)).toEqual([0, 200_000, 400_000, 600_000, 800_000, 1_000_000, 1_200_000])
  })
  it('a round max lands exactly, preferring fewer intervals', () => {
    expect(niceTicks(1_000_000)).toEqual([0, 250_000, 500_000, 750_000, 1_000_000])
  })
  it('uses 2.5 × 10^k steps', () => expect(niceTicks(7_000)).toEqual([0, 2_500, 5_000, 7_500]))
  it('always covers max with 3–6 intervals', () => {
    for (const max of [1, 37, 999, 1_001, 12_345, 3_456_789, 0.5, 9_999_999]) {
      const t = niceTicks(max)
      expect(t.at(-1)!).toBeGreaterThanOrEqual(max)
      expect(t.length - 1).toBeGreaterThanOrEqual(3)
      expect(t.length - 1).toBeLessThanOrEqual(6)
    }
  })
  it('degenerate input', () => {
    expect(niceTicks(0)).toEqual([0, 1])
    expect(niceTicks(Number.NaN)).toEqual([0, 1])
  })
})

describe('niceSpanTicks', () => {
  it('fits the data range instead of starting at zero', () => {
    expect(niceSpanTicks(271_000, 304_500)).toEqual([270_000, 280_000, 290_000, 300_000, 310_000])
  })
  it('handles a range crossing zero', () => {
    const t = niceSpanTicks(-12_000, 30_000)
    expect(t[0]).toBeLessThanOrEqual(-12_000)
    expect(t.at(-1)!).toBeGreaterThanOrEqual(30_000)
    expect(t).toContain(0)
  })
  it('pads a flat series', () => {
    const t = niceSpanTicks(50_000, 50_000)
    expect(t[0]).toBeLessThan(50_000)
    expect(t.at(-1)!).toBeGreaterThan(50_000)
  })
  it('degenerate input', () => expect(niceSpanTicks(Number.NaN, 1)).toEqual([0, 1]))
})
