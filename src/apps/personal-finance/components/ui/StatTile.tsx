import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { toneClasses } from './tones'
import type { Tone } from './tones'

export interface StatTileProps {
  label: string
  /** Main figure. Omit to render the empty state. */
  value?: ReactNode
  /** Line under the figure (change, progress bar, FI age…). */
  sub?: ReactNode
  tone?: Tone
  /** Where the tile links to. */
  to: string
  /** Empty-state prompt + call to action. */
  emptyText: string
  emptyCta: string
}

/** Headline number tile used on the hub. Whole tile is a link. */
export function StatTile({ label, value, sub, tone = 'paper', to, emptyText, emptyCta }: StatTileProps) {
  const empty = value === undefined
  return (
    <Link to={to} className={cn('ink-border shadow-pop pressable flex min-h-40 flex-col justify-between gap-3 p-5', toneClasses[tone])}>
      <span className="font-mono text-xs font-bold tracking-widest uppercase">{label}</span>
      {empty ? (
        <>
          <p className="text-sm">{emptyText}</p>
          <span className="font-mono text-xs font-bold uppercase">{emptyCta} →</span>
        </>
      ) : (
        <>
          <span className="pf-num text-4xl leading-none font-bold">{value}</span>
          {sub && <div className="text-sm">{sub}</div>}
        </>
      )}
    </Link>
  )
}
