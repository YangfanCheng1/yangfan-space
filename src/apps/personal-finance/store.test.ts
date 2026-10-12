import { beforeEach, describe, expect, it, vi } from 'vitest'
import { draftFor } from './lib/accounts'
import { DEFAULT_FIRE_INPUTS } from './lib/fireInputs'
import { hasUserData, initialData, usePersonalFinance } from './store'

// No localStorage in the test environment; keep persist quiet.
vi.spyOn(console, 'warn').mockImplementation(() => {})

const store = () => usePersonalFinance.getState()

beforeEach(() => usePersonalFinance.setState(initialData()))

describe('accounts', () => {
  it('add assigns id and timestamps, normalizes the draft', () => {
    const id = store().addAccount({ ...draftFor('cash', '  Checking '), balance: 150_000 })
    const [a] = store().accounts
    expect(a).toMatchObject({ id, name: 'Checking', balance: 150_000, kind: 'asset' })
    expect(a.createdAt).toBe(a.updatedAt)
  })

  it('update keeps id and createdAt', async () => {
    const id = store().addAccount({ ...draftFor('cash', 'Checking'), balance: 1 })
    const created = store().accounts[0].createdAt
    await new Promise((r) => setTimeout(r, 5))
    store().updateAccount(id, { ...draftFor('taxable', 'Brokerage'), balance: 2 })
    const [a] = store().accounts
    expect(a).toMatchObject({ id, name: 'Brokerage', category: 'taxable', balance: 2, createdAt: created })
    expect(a.updatedAt > created).toBe(true)
  })

  it('delete removes only that account', () => {
    const a = store().addAccount(draftFor('cash', 'A'))
    store().addAccount(draftFor('cash', 'B'))
    store().deleteAccount(a)
    expect(store().accounts.map((x) => x.name)).toEqual(['B'])
  })
})

describe('snapshots', () => {
  beforeEach(() => {
    store().addAccount({ ...draftFor('retirement', '401(k)'), balance: 10_000_000 })
    store().addAccount({ ...draftFor('credit-card', 'Card'), balance: 50_000 })
  })

  it('captures current totals with a note', () => {
    store().saveSnapshot('first', '2026-09-01')
    expect(store().snapshots).toEqual([
      { date: '2026-09-01', assets: 10_000_000, liabilities: 50_000, invested: 10_000_000, liquid: 0, byCategory: { retirement: 10_000_000, 'credit-card': 50_000 }, note: 'first' },
    ])
  })

  it('same date replaces; different dates sort', () => {
    store().saveSnapshot(undefined, '2026-10-01')
    store().saveSnapshot(undefined, '2026-09-01')
    store().addAccount({ ...draftFor('cash', 'Cash'), balance: 1_000 })
    store().saveSnapshot('again', '2026-10-01')
    const s = store().snapshots
    expect(s.map((x) => x.date)).toEqual(['2026-09-01', '2026-10-01'])
    expect(s[1]).toMatchObject({ assets: 10_001_000, note: 'again' })
  })

  it('defaults to today', () => {
    store().saveSnapshot()
    expect(store().snapshots[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('delete by date', () => {
    store().saveSnapshot(undefined, '2026-09-01')
    store().saveSnapshot(undefined, '2026-10-01')
    store().deleteSnapshot('2026-09-01')
    expect(store().snapshots.map((x) => x.date)).toEqual(['2026-10-01'])
  })
})

describe('fire', () => {
  it('setFire patches, resetFire restores defaults', () => {
    store().setFire({ currentAge: 40 })
    expect(store().fire.currentAge).toBe(40)
    store().resetFire()
    expect(store().fire).toEqual(DEFAULT_FIRE_INPUTS)
  })
})

describe('sample data, replace, clear (M4)', () => {
  it('loadSampleData replaces everything and flags it', () => {
    store().addAccount(draftFor('cash', 'Mine'))
    store().loadSampleData('2026-10-12')
    expect(store().isSampleData).toBe(true)
    expect(store().accounts.map((a) => a.name)).not.toContain('Mine')
    expect(store().snapshots).toHaveLength(6)
  })

  it('any edit turns sample data into the user’s data', () => {
    const edits: [string, () => void][] = [
      ['setFire', () => store().setFire({ currentAge: 40 })],
      ['addAccount', () => store().addAccount(draftFor('cash', 'X'))],
      ['deleteAccount', () => store().deleteAccount(store().accounts[0].id)],
      ['saveSnapshot', () => store().saveSnapshot(undefined, '2026-10-12')],
      ['deleteSnapshot', () => store().deleteSnapshot(store().snapshots[0].date)],
      ['resetFire', () => store().resetFire()],
    ]
    for (const [name, edit] of edits) {
      store().loadSampleData('2026-10-12')
      edit()
      expect(store().isSampleData, name).toBe(false)
    }
  })

  it('replaceAll swaps in imported data', () => {
    store().addAccount(draftFor('cash', 'Old'))
    store().replaceAll({ ...initialData(), accounts: [], snapshots: [], fire: { ...DEFAULT_FIRE_INPUTS, currentAge: 50 } })
    expect(store().accounts).toEqual([])
    expect(store().fire.currentAge).toBe(50)
  })

  it('clearAll empties the app', () => {
    store().loadSampleData('2026-10-12')
    store().clearAll()
    expect(store()).toMatchObject(initialData())
  })

  it('hasUserData', () => {
    expect(hasUserData(initialData())).toBe(false)
    expect(hasUserData({ ...initialData(), fire: { ...DEFAULT_FIRE_INPUTS, currentAge: 31 } })).toBe(true)
    expect(hasUserData({ ...initialData(), fire: { ...DEFAULT_FIRE_INPUTS, afterTaxIncome: 1 } })).toBe(true)
    store().addAccount(draftFor('cash', 'A'))
    expect(hasUserData(store())).toBe(true)
  })
})
