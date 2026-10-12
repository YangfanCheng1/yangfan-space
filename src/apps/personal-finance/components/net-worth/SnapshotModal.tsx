import { useState } from 'react'
import type { NetWorthSummary } from '../../lib/calc/netWorth'
import { formatDate, formatUSD } from '../../lib/format'
import { Button } from '../ui'
import { Modal } from '../ui/Modal'
import { TextField } from '../ui/TextField'

export interface SnapshotModalProps {
  open: boolean
  today: string
  summary: NetWorthSummary
  /** A snapshot already exists for today (spec NW9: replacing needs confirmation). */
  replacing: boolean
  existingNote?: string
  onSave: (note: string) => void
  onClose: () => void
}

export function SnapshotModal(props: SnapshotModalProps) {
  return (
    <Modal open={props.open} onClose={props.onClose} title={props.replacing ? 'Replace today’s snapshot?' : 'Save snapshot'}>
      {props.open && <SnapshotForm {...props} />}
    </Modal>
  )
}

function SnapshotForm({ today, summary, replacing, existingNote, onSave, onClose }: SnapshotModalProps) {
  const [note, setNote] = useState(existingNote ?? '')
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(note)
      }}
    >
      <p>
        Records your totals for <strong>{formatDate(today)}</strong>: net worth <strong>{formatUSD(summary.netWorth / 100)}</strong> (
        {formatUSD(summary.assets / 100)} assets, {formatUSD(summary.liabilities / 100)} liabilities).
      </p>
      {replacing && <p className="ink-border bg-pf-gold px-3 py-2 text-sm font-bold">▲ You already saved a snapshot today. Saving again replaces it.</p>}
      <TextField label="Note" optional value={note} onChange={setNote} maxLength={80} hint="e.g. “bonus month” or “paid off car”." autoFocus />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} sound={false}>
          Cancel
        </Button>
        <Button type="submit">{replacing ? 'Replace snapshot' : 'Save snapshot'}</Button>
      </div>
    </form>
  )
}
