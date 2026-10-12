import { createJSONStorage } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'

/**
 * localStorage that never throws. When the browser blocks storage (private
 * mode, blocked site data, full quota), even touching `localStorage` can throw
 * a SecurityError. Zustand's persist would let that escape and break the page;
 * with this, state simply stays in memory for the tab.
 */
const safeLocalStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Not persisted; the in-memory state keeps working.
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

/** Use as `persist(..., { storage: safeJSONStorage() })`. */
export const safeJSONStorage = () => createJSONStorage(() => safeLocalStorage)
