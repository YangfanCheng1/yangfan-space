import { useId } from 'react'
import type { CSSProperties } from 'react'

export interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** CSS color for the thumb. */
  accent?: string
  format?: (value: number) => string
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, accent, format = String }: SliderProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-xs font-bold uppercase">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        className="ink-slider w-full"
        style={accent ? ({ '--slider-accent': accent } as CSSProperties) : undefined}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
