import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setSoundEnabled } from '@/lib/audio'

/** Site-wide preferences shared by the gateway and every app. */
interface SettingsState {
  soundOn: boolean
  toggleSound: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: true,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
    }),
    {
      name: 'ink-frame:settings',
      onRehydrateStorage: () => (state) => setSoundEnabled(state?.soundOn ?? true),
    },
  ),
)

useSettingsStore.subscribe((s) => setSoundEnabled(s.soundOn))
