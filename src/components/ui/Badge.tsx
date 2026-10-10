import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'paper' | 'vermilion' | 'teal' | 'mustard' | 'ink'
}

const tones = {
  paper: 'bg-paper text-ink',
  vermilion: 'bg-vermilion text-paper',
  teal: 'bg-teal text-paper',
  mustard: 'bg-mustard text-ink',
  ink: 'bg-ink text-paper',
}

export function Badge({ tone = 'paper', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('inline-block border-2 border-ink px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider', tones[tone], className)}
      {...rest}
    />
  )
}
