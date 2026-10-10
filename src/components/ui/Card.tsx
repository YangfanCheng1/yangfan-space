import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover-lift / press feedback for clickable cards. */
  interactive?: boolean
  tone?: 'paper' | 'vermilion' | 'teal' | 'mustard' | 'ink'
}

const tones = {
  paper: 'bg-paper text-ink',
  vermilion: 'bg-vermilion text-paper',
  teal: 'bg-teal text-paper',
  mustard: 'bg-mustard text-ink',
  ink: 'bg-ink text-paper',
}

export function Card({ interactive, tone = 'paper', className, ...rest }: CardProps) {
  return <div className={cn('ink-border shadow-pop', tones[tone], interactive && 'pressable cursor-pointer', className)} {...rest} />
}
