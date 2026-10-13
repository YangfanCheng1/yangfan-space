import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Horizontally (or fully) scrollable area that keyboard users can reach:
 * focusable and labelled (WCAG 2.1.1; axe `scrollable-region-focusable`).
 * `relative` keeps absolutely positioned sr-only text inside the clip.
 */
export function ScrollRegion({ label, className, children, id }: { label: string; className?: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} role="region" aria-label={label} tabIndex={0} className={cn('relative overflow-x-auto', className)}>
      {children}
    </div>
  )
}
