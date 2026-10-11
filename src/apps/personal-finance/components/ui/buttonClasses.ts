import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'pine' | 'lime' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-pf-green text-paper',
  pine: 'bg-pf-pine text-paper',
  lime: 'bg-pf-lime text-ink',
  ghost: 'bg-paper text-ink',
  danger: 'bg-pf-clay text-paper',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

/** Shared look for <Button> and button-styled links (<ButtonLink>). */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'ink-border shadow-pop pressable inline-flex cursor-pointer items-center justify-center gap-2 font-display uppercase tracking-wide',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}
