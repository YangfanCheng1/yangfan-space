import type { Account, Category } from '../types'
import { categoryMeta } from './categories'

/** What the account form edits. id and timestamps are filled in by the store. */
export type AccountDraft = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>

export const NAME_MAX = 60

/** A blank draft for a category, with that category's default flags (spec NW2). */
export function draftFor(category: Category, name = ''): AccountDraft {
  const meta = categoryMeta(category)
  return { name, kind: meta.kind, category, balance: 0, invested: meta.invested, liquid: meta.liquid }
}

/** Switch category: kind follows the category, flags reset to its defaults. */
export function withCategory(draft: AccountDraft, category: Category): AccountDraft {
  const meta = categoryMeta(category)
  return { ...draft, category, kind: meta.kind, invested: meta.invested, liquid: meta.liquid }
}

export type AccountErrors = Partial<Record<'name' | 'balance', string>>

export function validateAccountDraft(d: AccountDraft): AccountErrors {
  const e: AccountErrors = {}
  const name = d.name.trim()
  if (!name) e.name = 'Give the account a name.'
  else if (name.length > NAME_MAX) e.name = `Keep it under ${NAME_MAX} characters.`
  if (!Number.isSafeInteger(d.balance)) e.balance = 'Enter a dollar amount.'
  else if (d.balance < 0)
    e.balance = d.kind === 'liability' ? 'Enter what you owe as a positive amount.' : "Can't be negative."
  return e
}

/** Trim text, drop an empty note, and keep the flags that only apply to assets off for debts. */
export function normalizeDraft(d: AccountDraft): AccountDraft {
  const note = d.note?.trim()
  const out: AccountDraft = { ...d, name: d.name.trim(), kind: categoryMeta(d.category).kind }
  if (out.kind === 'liability') {
    out.invested = false
    out.liquid = false
  }
  if (note) out.note = note
  else delete out.note
  return out
}
