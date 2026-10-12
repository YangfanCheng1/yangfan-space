import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeJSONStorage } from '@/lib/safeStorage'
import { normalizeDraft } from './lib/accounts'
import type { AccountDraft } from './lib/accounts'
import { localISODate, snapshotFrom, summarize, upsertSnapshot } from './lib/calc/netWorth'
import { DEFAULT_FIRE_INPUTS, isDefaultFire } from './lib/fireInputs'
import { buildSampleData } from './lib/sampleData'
import type { FireInputs, PersonalFinanceData } from './types'

/**
 * The app's only store and the only module that touches storage (spec §7).
 * Persisted to localStorage under its own key, separate from gateway settings.
 *
 * Every edit clears `isSampleData` (spec ST3: the sample banner shows "until
 * it's cleared or edited") — once you change it, it's your data.
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
  /** Replace everything with the demo dataset (spec ST3). */
  loadSampleData: (today?: string) => void
  /** Replace everything with validated imported data (spec ST2). */
  replaceAll: (data: PersonalFinanceData) => void
  /** Back to a fresh, empty app (spec ST4). */
  clearAll: () => void
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

/** True when the user has entered anything (accounts, snapshots, or changed FIRE inputs). */
export function hasUserData(d: Pick<PersonalFinanceData, 'accounts' | 'snapshots' | 'fire'>): boolean {
  return d.accounts.length > 0 || d.snapshots.length > 0 || !isDefaultFire(d.fire)
}

export const usePersonalFinance = create<PersonalFinanceState>()(
  persist(
    (set) => ({
      ...initialData(),
      setFire: (patch) => set((s) => ({ fire: { ...s.fire, ...patch }, isSampleData: false })),
      resetFire: () => set({ fire: { ...DEFAULT_FIRE_INPUTS }, isSampleData: false }),

      addAccount: (draft) => {
        const id = newId()
        const now = new Date().toISOString()
        set((s) => ({ accounts: [...s.accounts, { ...normalizeDraft(draft), id, createdAt: now, updatedAt: now }], isSampleData: false }))
        return id
      },
      updateAccount: (id, draft) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...normalizeDraft(draft), id, createdAt: a.createdAt, updatedAt: new Date().toISOString() } : a,
          ),
          isSampleData: false,
        })),
      deleteAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id), isSampleData: false })),

      saveSnapshot: (note, date = localISODate()) =>
        set((s) => ({ snapshots: upsertSnapshot(s.snapshots, snapshotFrom(summarize(s.accounts), date, note)), isSampleData: false })),
      deleteSnapshot: (date) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.date !== date), isSampleData: false })),

      loadSampleData: (today = localISODate()) => set(buildSampleData(today)),
      replaceAll: (data) => set({ ...data, schemaVersion: 1 }),
      clearAll: () => set(initialData()),
    }),
    {
      name: STORAGE_KEY,
      storage: safeJSONStorage(),
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
