import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeDraft } from './lib/accounts'
import type { AccountDraft } from './lib/accounts'
import { localISODate, snapshotFrom, summarize, upsertSnapshot } from './lib/calc/netWorth'
import { DEFAULT_FIRE_INPUTS } from './lib/fireInputs'
import type { FireInputs, PersonalFinanceData } from './types'

/**
 * The app's only store and the only module that touches storage (spec §7).
 * Persisted to localStorage under its own key, separate from gateway settings.
 */
interface Actions {
  setFire: (patch: Partial<FireInputs>) => void
  resetFire: () => void
  /** Returns the new account's id. */
  addAccount: (draft: AccountDraft) => string
  updateAccount: (id: string, draft: AccountDraft) => void
  deleteAccount: (id: string) => void
  /** Snapshot today's totals (or `date`, YYYY-MM-DD); replaces a snapshot on the same date. */
  saveSnapshot: (note?: string, date?: string) => void
  deleteSnapshot: (date: string) => void
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export type PersonalFinanceState = PersonalFinanceData & Actions

export const STORAGE_KEY = 'yangfan:personal-finance'

export const initialData = (): PersonalFinanceData => ({
  schemaVersion: 1,
  accounts: [],
  snapshots: [],
  fire: { ...DEFAULT_FIRE_INPUTS },
  isSampleData: false,
})

export const usePersonalFinance = create<PersonalFinanceState>()(
  persist(
    (set) => ({
      ...initialData(),
      setFire: (patch) => set((s) => ({ fire: { ...s.fire, ...patch } })),
      resetFire: () => set({ fire: { ...DEFAULT_FIRE_INPUTS } }),

      addAccount: (draft) => {
        const id = newId()
        const now = new Date().toISOString()
        set((s) => ({ accounts: [...s.accounts, { ...normalizeDraft(draft), id, createdAt: now, updatedAt: now }] }))
        return id
      },
      updateAccount: (id, draft) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...normalizeDraft(draft), id, createdAt: a.createdAt, updatedAt: new Date().toISOString() } : a,
          ),
        })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      saveSnapshot: (note, date = localISODate()) =>
        set((s) => ({ snapshots: upsertSnapshot(s.snapshots, snapshotFrom(summarize(s.accounts), date, note)) })),
      deleteSnapshot: (date) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.date !== date) })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: ({ schemaVersion, accounts, snapshots, fire, isSampleData }): PersonalFinanceData => ({
        schemaVersion,
        accounts,
        snapshots,
        fire,
        isSampleData,
      }),
      // Fill fields added after a user's data was saved, so older saves keep working.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersonalFinanceData>
        return { ...current, ...p, fire: { ...DEFAULT_FIRE_INPUTS, ...p.fire } }
      },
    },
  ),
)
