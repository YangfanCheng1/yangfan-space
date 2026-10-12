import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

export interface ConfirmModalProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  /** Destructive actions get the clay button. */
  danger?: boolean
}

export function ConfirmModal({ open, title, children, confirmLabel, onConfirm, onCancel, danger = true }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div>{children}</div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} sound={false}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
