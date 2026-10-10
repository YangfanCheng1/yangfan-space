import type { ButtonHTMLAttributes } from 'react'
import { sfx } from '@/lib/audio'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'ink'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-vermilion text-paper',
  secondary: 'bg-teal text-paper',
  accent: 'bg-mustard text-ink',
  ghost: 'bg-paper text-ink',
  ink: 'bg-ink text-paper',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Play the click cue. Defaults to true. */
  sound?: boolean
}

export function Button({ variant = 'primary', size = 'md', sound = true, className, onClick, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'ink-border shadow-pop pressable inline-flex cursor-pointer items-center justify-center gap-2 font-display uppercase tracking-wide',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      onClick={(e) => {
        if (sound) sfx.click()
        onClick?.(e)
      }}
      {...rest}
    />
  )
}
