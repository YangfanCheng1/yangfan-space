import type { ReactNode } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  useDocumentTitle(title)
  return (
    <div className="mt-8 mb-8">
      <p className="font-mono text-xs font-bold tracking-widest uppercase">{kicker}</p>
      <h1 className="mt-2 font-display text-4xl leading-none uppercase sm:text-5xl">{title}</h1>
      {children && <div className="mt-3 max-w-prose text-base sm:text-lg">{children}</div>}
    </div>
  )
}
