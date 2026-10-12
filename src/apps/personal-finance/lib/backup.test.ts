import { describe, expect, it } from 'vitest'
import type { PersonalFinanceData } from '../types'
import { BACKUP_APP, backupFileName, parseBackup, serializeBackup } from './backup'
import { DEFAULT_FIRE_INPUTS } from './fireInputs'

const data: PersonalFinanceData = {
  schemaVersion: 1,
  accounts: [
    { id: 'a1', name: '401(k)', kind: 'asset', category: 'retirement', balance: 9_500_000, invested: true, liquid: false, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' },
    { id: 'a2', name: 'Card', kind: 'liability', category: 'credit-card', balance: 120_050, invested: false, liquid: false, note: 'pay off', createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' },
  ],
  snapshots: [
    { date: '2026-08-01', assets: 9_000_000, liabilities: 200_000, invested: 9_000_000, liquid: 0, byCategory: { retirement: 9_000_000, 'credit-card': 200_000 }, note: 'bonus' },
    { date: '2026-09-01', assets: 9_200_000, liabilities: 150_000, invested: 9_200_000, liquid: 0, byCategory: {} },
  ],
  fire: { ...DEFAULT_FIRE_INPUTS, currentAge: 34, afterTaxIncome: 9_000_000 },
  isSampleData: false,
}

/** Serialize, apply a mutation to the parsed object, and re-stringify. */
const mutate = (fn: (f: any) => void) => {
  const f = JSON.parse(serializeBackup(data))
  fn(f)
  return JSON.stringify(f)
}

describe('round trip', () => {
  it('export → import gives back the same data', () => {
    const r = parseBackup(serializeBackup(data, new Date('2026-10-12T10:00:00Z')))
    expect(r).toEqual({ ok: true, data, exportedAt: '2026-10-12T10:00:00.000Z', counts: { accounts: 2, snapshots: 2 } })
  })
  it('file header', () => {
    const f = JSON.parse(serializeBackup(data))
    expect(f.app).toBe(BACKUP_APP)
    expect(backupFileName('2026-10-12')).toBe('personal-finance-backup-2026-10-12.json')
  })
  it('sorts snapshots and fills missing FIRE fields from defaults (older files)', () => {
    const r = parseBackup(mutate((f) => { f.data.snapshots.reverse(); delete f.data.fire.withdrawalRatePct; delete f.data.isSampleData }))
    expect(r.ok && r.data.snapshots.map((s) => s.date)).toEqual(['2026-08-01', '2026-09-01'])
    expect(r.ok && r.data.fire.withdrawalRatePct).toBe(4)
    expect(r.ok && r.data.isSampleData).toBe(false)
  })
})

describe('rejects bad files with a clear reason', () => {
  it.each<[string, string, RegExp]>([
    ['not JSON', '{nope', /isn't valid JSON/],
    ['other JSON', '{"hello":1}', /isn't a Personal Finance backup/],
    ['array', '[]', /isn't a Personal Finance backup/],
  ])('%s', (_, text, msg) => {
    const r = parseBackup(text)
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toMatch(msg)
  })

  it.each<[string, (f: any) => void, RegExp]>([
    ['newer version', (f) => (f.data.schemaVersion = 2), /newer version/],
    ['missing export date', (f) => delete f.exportedAt, /export date/],
    ['missing accounts', (f) => delete f.data.accounts, /account list/],
    ['negative balance', (f) => (f.data.accounts[0].balance = -5), /Account 1 .*invalid balance/],
    ['fractional cents', (f) => (f.data.accounts[0].balance = 1.5), /invalid balance/],
    ['unknown category', (f) => (f.data.accounts[1].category = 'crypto'), /Account 2 .*unknown category/],
    ['kind/category mismatch', (f) => (f.data.accounts[1].kind = 'asset'), /doesn't match/],
    ['duplicate ids', (f) => (f.data.accounts[1].id = 'a1'), /duplicate account ids/],
    ['bad snapshot date', (f) => (f.data.snapshots[0].date = '2026-13-01'), /Snapshot 1 has an invalid date/],
    ['duplicate snapshot dates', (f) => (f.data.snapshots[1].date = '2026-08-01'), /same date/],
    ['bad breakdown key', (f) => (f.data.snapshots[0].byCategory = { gold: 5 }), /category breakdown/],
    ['bad FIRE number', (f) => (f.data.fire.currentAge = 'thirty'), /currentAge/],
    ['bad FIRE mode', (f) => (f.data.fire.projectionMode = 'lean'), /projection mode/],
    ['script-y name stays data', (f) => (f.data.accounts[0].name = 42), /invalid name/],
  ])('%s', (_, fn, msg) => {
    const r = parseBackup(mutate(fn))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toMatch(msg)
  })

  it('never throws, even on deeply wrong shapes', () => {
    for (const text of ['null', '1', '"x"', '{"app":"yangfan-personal-finance","exportedAt":"2026-01-01","data":{"schemaVersion":1,"accounts":[null],"snapshots":[]}}'])
      expect(() => parseBackup(text)).not.toThrow()
  })
})
