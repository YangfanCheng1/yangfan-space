import { useId, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { parseMoney } from '../../lib/calc/money'

export type NumberFieldKind = 'money' | 'percent' | 'integer'

export interface NumberFieldProps {
  label: string
  kind: NumberFieldKind
  /** Cents for money; plain number for percent/integer. undefined = empty. */
  value: number | undefined
  onChange: (value: number | undefined) => void
  /** Empty input is allowed and means "not provided". */
  optional?: boolean
  /** Validation message from the page (range/relationship rules). */
  error?: string
  /** Reports whether the current text is unparseable, so the page can dim outputs. */
  onParseErrorChange?: (hasError: boolean) => void
  hint?: ReactNode
  /** Paired range slider (spec: key inputs get a slider). */
  slider?: { min: number; max: number; step: number }
  placeholder?: string
}

const NUMBER_RE = /^[-−]?(\d+\.?\d*|\.\d+)$/

function parse(kind: NumberFieldKind, text: string): number | null {
  if (kind === 'money') return parseMoney(text)
  const t = text.replace(/[\s%]/g, '').replace('−', '-')
  return NUMBER_RE.test(t) ? Number(t) : null
}

function display(kind: NumberFieldKind, value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return ''
  if (kind === 'money')
    return (value / 100).toLocaleString('en-US', { minimumFractionDigits: value % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })
  return String(value)
}

/**
 * Labeled numeric input. Shows the formatted value at rest ("40,000") and the
 * user's raw text while focused; commits every parseable keystroke so results
 * update live. Unparseable text shows an inline error and is discarded on blur.
 */
export function NumberField({
  label,
  kind,
  value,
  onChange,
  optional,
  error,
  onParseErrorChange,
  hint,
  slider,
  placeholder,
}: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const setParse = (msg: string | null) => {
    if ((msg === null) !== (parseError === null)) onParseErrorChange?.(msg !== null)
    setParseError(msg)
  }

  const handleText = (text: string) => {
    setDraft(text)
    if (text.trim() === '') {
      if (optional) {
        setParse(null)
        onChange(undefined)
      } else setParse('Required.')
      return
    }
    const v = parse(kind, text)
    if (v === null) setParse(kind === 'money' ? 'Enter a dollar amount, like 40,000.' : 'Enter a number.')
    else {
      setParse(null)
      onChange(v)
    }
  }

  const shownError = parseError ?? error
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [shownError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-xs font-bold uppercase">
        {label}
        {optional && <span className="ml-1 font-normal normal-case text-ink/70">(optional)</span>}
      </label>
      <div
        className={cn(
          'ink-border flex items-center bg-paper focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-ink',
          shownError && 'border-pf-clay',
        )}
      >
        {kind === 'money' && <span className="pl-3 font-mono text-sm font-bold text-ink/70">$</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className="pf-num w-full min-w-0 bg-transparent px-3 py-2 text-base outline-none"
          value={draft ?? display(kind, value)}
          placeholder={placeholder}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy}
          onFocus={() => setDraft(display(kind, value))}
          onBlur={() => {
            setDraft(null)
            setParse(null)
          }}
          onChange={(e) => handleText(e.target.value)}
        />
        {kind === 'percent' && <span className="pr-3 font-mono text-sm font-bold text-ink/70">%</span>}
      </div>
      {slider && (
        <input
          type="range"
          aria-label={`${label} slider`}
          className="ink-slider mt-1 w-full"
          style={{ '--slider-accent': 'var(--color-pf-green)' } as CSSProperties}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={value ?? slider.min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      <p id={errorId} aria-live="polite" className={cn('text-xs font-bold text-pf-clay-ink', !shownError && 'sr-only')}>
        {shownError ? `▲ ${shownError}` : ''}
      </p>
      {hint && (
        <p id={hintId} className="text-xs text-ink/70">
          {hint}
        </p>
      )}
    </div>
  )
}
