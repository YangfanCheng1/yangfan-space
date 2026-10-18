import { useRef, useState } from 'react'
import type { ComponentProps } from 'react'

/**
 * Code block (already highlighted at build time by Shiki) with a copy button.
 * Focusable, because it scrolls sideways on phones (WCAG 2.1.1).
 */
export function Pre(props: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText.replace(/\n$/, '') ?? '')
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 2000)
  }

  return (
    <div className="relative">
      <pre ref={ref} tabIndex={0} {...props} />
      <button
        type="button"
        onClick={copy}
        className="ink-border absolute top-2 right-2 cursor-pointer bg-paper px-2 py-1 font-mono text-[11px] font-bold text-ink uppercase hover:bg-mustard"
      >
        {state === 'copied' ? 'Copied ✓' : state === 'failed' ? 'Copy failed' : 'Copy'}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === 'copied' ? 'Code copied to clipboard' : state === 'failed' ? 'Could not copy code' : ''}
      </span>
    </div>
  )
}
