import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * True in `npm run dev`, false in production builds: the live site never shows
 * "To write:" notes. The build still lists them (build/contentCheck.ts).
 */
export const showPlaceholders = !import.meta.env.PROD

/**
 * Marks content Yangfan hasn't written yet. Deliberately loud, so nothing
 * invented can be mistaken for the real thing. Remove as content arrives.
 * Renders nothing in production; wrap any card that would be left empty in
 * a `showPlaceholders` check.
 */
export function Placeholder({ children, block }: { children: ReactNode; block?: boolean }) {
  if (!showPlaceholders) return null
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
