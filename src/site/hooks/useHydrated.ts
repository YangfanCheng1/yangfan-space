import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * false while pre-rendering and during hydration, true afterwards. Use it for
 * anything that depends on the browser (saved preferences, screen size), so
 * the first client render matches the pre-rendered HTML exactly.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
