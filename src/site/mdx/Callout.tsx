import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const kinds = {
  note: { label: 'Note', className: 'bg-paper' },
  tip: { label: 'Tip', className: 'bg-mustard/30' },
  warning: { label: 'Heads up', className: 'bg-vermilion/15' },
} as const

/** <Callout kind="tip">…</Callout> — an aside that stands out from the prose. */
export function Callout({ kind = 'note', title, children }: { kind?: keyof typeof kinds; title?: string; children: ReactNode }) {
  const k = kinds[kind] ?? kinds.note
  return (
    <aside className={cn('not-prose ink-border shadow-pop-sm my-6 px-5 py-4', k.className)}>
      <p className="font-mono text-xs font-bold tracking-wider uppercase">{title ?? k.label}</p>
      <div className="mt-2 text-base [&>p+p]:mt-3">{children}</div>
    </aside>
  )
}
