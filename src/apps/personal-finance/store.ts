import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_FIRE_INPUTS } from './lib/fireInputs'
import type { FireInputs, PersonalFinanceData } from './types'

/**
 * The app's only store and the only module that touches storage (spec §7).
 * Persisted to localStorage under its own key, separate from gateway settings.
 */
interface Actions {
  setFire: (patch: Partial<FireInputs>) => void
  resetFire: () => void
}

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
