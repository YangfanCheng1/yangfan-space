import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { toneClasses } from './tones'
import type { Tone } from './tones'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'paper', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn('inline-block border-2 border-ink px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase', toneClasses[tone], className)}
      {...rest}
    />
  )
}
