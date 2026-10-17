import type { ReactNode } from 'react'

/** Big uppercase heading with a rule and an optional right-hand note. */
export function SectionHeading({ children, note, level = 2 }: { children: ReactNode; note?: ReactNode; level?: 1 | 2 }) {
  const H = level === 1 ? 'h1' : 'h2'
  return (
    <div className="mb-6 flex items-end gap-4">
      <H className={level === 1 ? 'font-display text-4xl leading-none uppercase sm:text-5xl' : 'font-display text-2xl uppercase sm:text-4xl'}>
        {children}
      </H>
      <div className="mb-2 hidden h-[2.5px] flex-1 bg-ink sm:block" />
      {note && <span className="mb-1 ml-auto font-mono text-xs font-bold whitespace-nowrap uppercase">{note}</span>}
    </div>
  )
}
