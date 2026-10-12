import { PRESETS } from '../../lib/categories'
import type { Category } from '../../types'
import { Button } from '../ui'

export interface QuickAddProps {
  onPreset: (name: string, category: Category) => void
  onCustom: () => void
}

/** Spec NW3: one-click presets that open the form pre-filled. */
export function QuickAdd({ onPreset, onCustom }: QuickAddProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-bold uppercase">Quick add</p>
      <ul className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              className="ink-border cursor-pointer bg-paper px-3 py-1.5 text-sm font-bold hover:bg-pf-lime"
              onClick={() => onPreset(p.name, p.category)}
            >
              + {p.name}
            </button>
          </li>
        ))}
        <li>
          <Button size="sm" onClick={onCustom}>
            + Other account
          </Button>
        </li>
      </ul>
    </div>
  )
}
