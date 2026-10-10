import { useEffect, useRef } from 'react'
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
 * Built on native <dialog>: focus trapping, Esc-to-close and top-layer
 * stacking come from the browser. Click the backdrop to dismiss.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

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
      className={cn('ink-modal ink-border shadow-pop-lg m-auto w-[min(92vw,560px)] bg-paper p-0 text-ink', className)}
      onClose={() => {
        sfx.close()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close()
      }}
      aria-labelledby="modal-title"
    >
      <header className="flex items-center justify-between border-b-[2.5px] border-ink bg-mustard px-4 py-2">
        <h2 id="modal-title" className="font-display text-lg uppercase">
          {title}
        </h2>
        <button
          type="button"
          className="ink-border cursor-pointer bg-paper px-2 font-mono font-bold hover:bg-vermilion hover:text-paper"
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
