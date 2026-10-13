import { useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const box = 'ink-border w-full bg-paper px-3 py-2 text-base outline-none focus:outline-3 focus:outline-offset-2 focus:outline-ink'

function FieldShell({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase">
        {label}
        {optional && <span className="ml-1 font-normal normal-case text-ink/70">(optional)</span>}
      </label>
      {children}
      <p id={`${id}-error`} aria-live="polite" className={cn('text-xs font-bold text-pf-clay-ink', !error && 'sr-only')}>
        {error ? `▲ ${error}` : ''}
      </p>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink/70">
          {hint}
        </p>
      )}
    </div>
  )
}

export interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  optional?: boolean
  error?: string
  hint?: ReactNode
  maxLength?: number
  multiline?: boolean
  autoFocus?: boolean
}

export function TextField({ label, value, onChange, optional, error, hint, maxLength, multiline, autoFocus }: TextFieldProps) {
  const id = useId()
  const props = {
    id,
    value,
    maxLength,
    autoFocus,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined,
    className: cn(box, error && 'border-pf-clay'),
  }
  return (
    <FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
      {multiline ? (
        <textarea {...props} rows={2} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...props} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
      )}
    </FieldShell>
  )
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> {
  label: string
  hint?: ReactNode
}

export function SelectField({ label, hint, children, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select id={id} className={cn(box, 'cursor-pointer')} {...rest}>
        {children}
      </select>
    </FieldShell>
  )
}
