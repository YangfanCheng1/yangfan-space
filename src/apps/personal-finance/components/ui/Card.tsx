import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { toneClasses } from './tones'
import type { Tone } from './tones'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone
  /** Adds hover-lift / press feedback for clickable cards. */
  interactive?: boolean
}

export function Card({ tone = 'paper', interactive, className, ...rest }: CardProps) {
  return <div className={cn('ink-border shadow-pop', toneClasses[tone], interactive && 'pressable cursor-pointer', className)} {...rest} />
}
