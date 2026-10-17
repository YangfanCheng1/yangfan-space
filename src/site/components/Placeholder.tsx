import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Marks content Yangfan hasn't written yet. Deliberately loud, so nothing
 * invented can be mistaken for the real thing. Remove as content arrives.
 */
export function Placeholder({ children, block }: { children: ReactNode; block?: boolean }) {
  const Tag = block ? 'div' : 'span'
  return (
    <Tag
      data-placeholder
      className={cn(
        'border-2 border-dashed border-ink/50 bg-mustard/25 px-1.5 text-ink/80 italic',
        block ? 'block px-4 py-3' : 'inline',
      )}
    >
      <span className="mr-1.5 font-mono text-[11px] font-bold not-italic tracking-wider uppercase">To write:</span>
      {children}
    </Tag>
  )
}
