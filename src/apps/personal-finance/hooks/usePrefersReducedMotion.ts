import { useMediaQuery } from './useMediaQuery'

/** True when the user asked the OS to minimize motion (charts skip animation). */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
