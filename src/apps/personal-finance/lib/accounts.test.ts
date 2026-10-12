import { describe, expect, it } from 'vitest'
import { draftFor, normalizeDraft, validateAccountDraft, withCategory } from './accounts'

describe('draftFor / withCategory', () => {
  it('applies category defaults (spec NW2)', () => {
    expect(draftFor('taxable', 'Brokerage')).toMatchObject({ name: 'Brokerage', kind: 'asset', invested: true, liquid: true })
    expect(draftFor('retirement')).toMatchObject({ invested: true, liquid: false })
    expect(draftFor('cash')).toMatchObject({ invested: false, liquid: true })
    expect(draftFor('mortgage')).toMatchObject({ kind: 'liability', invested: false, liquid: false })
  })

  it('switching category resets kind and flags, keeps name/balance/note', () => {
    const d = { ...draftFor('cash', 'Stash'), balance: 500, note: 'n', liquid: false }
    expect(withCategory(d, 'credit-card')).toMatchObject({ name: 'Stash', balance: 500, note: 'n', kind: 'liability', liquid: false })
    expect(withCategory(d, 'taxable')).toMatchObject({ kind: 'asset', invested: true, liquid: true })
  })
})

describe('validateAccountDraft', () => {
  it('valid draft', () => expect(validateAccountDraft({ ...draftFor('cash', 'Checking'), balance: 100 })).toEqual({}))
  it('requires a name', () => expect(validateAccountDraft(draftFor('cash', '   ')).name).toBeTruthy())
  it('caps name length', () => expect(validateAccountDraft(draftFor('cash', 'x'.repeat(61))).name).toBeTruthy())
  it('rejects negative balances with a debt-specific hint', () => {
    expect(validateAccountDraft({ ...draftFor('cash', 'A'), balance: -1 }).balance).toBe("Can't be negative.")
    expect(validateAccountDraft({ ...draftFor('mortgage', 'M'), balance: -1 }).balance).toMatch(/positive/)
  })
  it('rejects non-integer cents', () => expect(validateAccountDraft({ ...draftFor('cash', 'A'), balance: 1.5 }).balance).toBeTruthy())
})

describe('normalizeDraft', () => {
  it('trims and drops empty notes', () => {
    const n = normalizeDraft({ ...draftFor('cash', '  Checking  '), note: '   ' })
    expect(n.name).toBe('Checking')
    expect(n).not.toHaveProperty('note')
  })
  it('forces liability flags off and kind from category', () => {
    const n = normalizeDraft({ ...draftFor('mortgage', 'M'), invested: true, liquid: true, kind: 'asset' })
    expect(n).toMatchObject({ kind: 'liability', invested: false, liquid: false })
  })
})
