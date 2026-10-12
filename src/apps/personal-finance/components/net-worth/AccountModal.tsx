import { useState } from 'react'
import type { FormEvent } from 'react'
import { NAME_MAX, normalizeDraft, validateAccountDraft, withCategory } from '../../lib/accounts'
import type { AccountDraft, AccountErrors } from '../../lib/accounts'
import { CATEGORIES } from '../../lib/categories'
import type { Category } from '../../types'
import { Button } from '../ui'
import { Modal } from '../ui/Modal'
import { NumberField } from '../ui/NumberField'
import { SelectField, TextField } from '../ui/TextField'

export interface AccountModalProps {
  /** null = closed. `id` set = editing that account. */
  state: { id?: string; draft: AccountDraft } | null
  onClose: () => void
  onSave: (draft: AccountDraft, id?: string) => void
}

/** Wrapper so the form remounts (fresh local state) each time the modal opens. */
export function AccountModal({ state, onClose, onSave }: AccountModalProps) {
  return (
    <Modal open={state !== null} onClose={onClose} title={state?.id ? 'Edit account' : 'Add account'}>
      {state && <AccountForm key={state.id ?? 'new'} initial={state} onCancel={onClose} onSave={onSave} />}
    </Modal>
  )
}

function AccountForm({ initial, onCancel, onSave }: { initial: { id?: string; draft: AccountDraft }; onCancel: () => void; onSave: AccountModalProps['onSave'] }) {
  const [draft, setDraft] = useState<AccountDraft>(initial.draft)
  const [balanceText, setBalanceText] = useState<number | undefined>(initial.id ? initial.draft.balance : undefined)
  const [balanceParseError, setBalanceParseError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const candidate: AccountDraft = { ...draft, balance: balanceText ?? Number.NaN }
  const errors: AccountErrors = validateAccountDraft(candidate)
  if (balanceText === undefined) errors.balance = 'Enter the current balance.'
  const visible = submitted ? errors : {}
  const isAsset = draft.kind === 'asset'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length || balanceParseError) return
    onSave(normalizeDraft(candidate), initial.id)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <TextField
        label="Name"
        value={draft.name}
        onChange={(name) => setDraft((d) => ({ ...d, name }))}
        error={visible.name}
        maxLength={NAME_MAX + 10}
        autoFocus={!draft.name}
      />
      <SelectField label="Category" value={draft.category} onChange={(e) => setDraft((d) => withCategory(d, e.target.value as Category))}>
        <optgroup label="Assets — what you own">
          {CATEGORIES.filter((c) => c.kind === 'asset').map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Liabilities — what you owe">
          {CATEGORIES.filter((c) => c.kind === 'liability').map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </optgroup>
      </SelectField>
      <NumberField
        label={isAsset ? 'Current balance' : 'Amount owed'}
        kind="money"
        value={balanceText}
        onChange={setBalanceText}
        onParseErrorChange={setBalanceParseError}
        error={visible.balance}
        hint={isAsset ? undefined : 'Enter it as a positive number; it’s subtracted from your net worth.'}
      />
      {isAsset && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-mono text-xs font-bold uppercase">Counts toward</legend>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pf-green" checked={draft.invested} onChange={(e) => setDraft((d) => ({ ...d, invested: e.target.checked }))} />
            <span>
              <strong>Invested</strong> — used as “invested assets” in FIRE
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pf-green" checked={draft.liquid} onChange={(e) => setDraft((d) => ({ ...d, liquid: e.target.checked }))} />
            <span>
              <strong>Liquid</strong> — cash-like, available within days
            </span>
          </label>
        </fieldset>
      )}
      <TextField label="Note" optional multiline value={draft.note ?? ''} onChange={(note) => setDraft((d) => ({ ...d, note }))} maxLength={200} />
      <div className="mt-1 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} sound={false}>
          Cancel
        </Button>
        <Button type="submit">{initial.id ? 'Save changes' : 'Add account'}</Button>
      </div>
    </form>
  )
}
