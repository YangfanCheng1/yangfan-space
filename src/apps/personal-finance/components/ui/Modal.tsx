import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { sfx } from '@/lib/audio'
import { cn } from '@/lib/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

/**
 * Green twin of the gateway Modal. Native <dialog> gives focus trapping,
 * Esc-to-close and top-layer stacking; clicking the backdrop dismisses.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      sfx.open()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={cn('ink-border shadow-pop-lg m-auto w-[min(92vw,520px)] bg-paper p-0 text-ink', className)}
      onClose={() => {
        sfx.close()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close()
      }}
      aria-labelledby={titleId}
    >
      <header className="flex items-center justify-between border-b-[2.5px] border-ink bg-pf-lime px-4 py-2">
        <h2 id={titleId} className="font-display text-lg uppercase">
          {title}
        </h2>
        <button
          type="button"
          className="ink-border cursor-pointer bg-paper px-2 font-mono font-bold hover:bg-ink hover:text-paper"
          onClick={() => ref.current?.close()}
          aria-label="Close"
        >
          ✕
        </button>
      </header>
      <div className="p-5 font-body">{children}</div>
    </dialog>
  )
}
