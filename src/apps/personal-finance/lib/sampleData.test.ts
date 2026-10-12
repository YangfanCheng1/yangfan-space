import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from './backup'
import { snapshotNetWorth, summarize } from './calc/netWorth'
import { hasErrors, validateFireInputs } from './fireInputs'
import { buildSampleData } from './sampleData'

const sample = buildSampleData('2026-10-12')

describe('buildSampleData', () => {
  it('is a valid backup (passes the import validator unchanged)', () => {
    const r = parseBackup(serializeBackup(sample))
    expect(r.ok).toBe(true)
    expect(r.ok && r.data).toEqual(sample)
  })

  it('is flagged as sample data', () => expect(sample.isSampleData).toBe(true))

  it('has ~10 accounts across assets and liabilities', () => {
    expect(sample.accounts).toHaveLength(10)
    expect(sample.accounts.some((a) => a.kind === 'liability')).toBe(true)
  })

  it('six monthly snapshots, oldest first, all before today', () => {
    expect(sample.snapshots.map((s) => s.date)).toEqual(['2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'])
  })

  it('crosses a year boundary cleanly', () => {
    expect(buildSampleData('2026-02-15').snapshots.map((s) => s.date)).toEqual(['2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01'])
  })

  it('net worth trends up to today', () => {
    const series = sample.snapshots.map(snapshotNetWorth)
    expect(series.at(-1)!).toBeGreaterThan(series[0])
    expect(summarize(sample.accounts).netWorth).toBeGreaterThan(series.at(-1)!)
  })

  it('FIRE inputs are valid and use the accounts’ invested total', () => {
    expect(hasErrors(validateFireInputs(sample.fire))).toBe(false)
    expect(sample.fire.investedAssets).toBe(summarize(sample.accounts).invested)
  })

  it('is deterministic for a given day', () => expect(buildSampleData('2026-10-12')).toEqual(sample))
})
