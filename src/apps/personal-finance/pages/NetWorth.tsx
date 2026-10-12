import { useMemo, useState } from 'react'
import { AccountList } from '../components/net-worth/AccountList'
import { AccountModal } from '../components/net-worth/AccountModal'
import { BreakdownBars } from '../components/net-worth/BreakdownBars'
import { HistoryChart } from '../components/net-worth/HistoryChart'
import { NetWorthSummary } from '../components/net-worth/NetWorthSummary'
import { QuickAdd } from '../components/net-worth/QuickAdd'
import { SnapshotList } from '../components/net-worth/SnapshotList'
import { SnapshotModal } from '../components/net-worth/SnapshotModal'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/ui'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { draftFor } from '../lib/accounts'
import type { AccountDraft } from '../lib/accounts'
import { localISODate, summarize } from '../lib/calc/netWorth'
import { formatDate, formatUSD } from '../lib/format'
import { usePersonalFinance } from '../store'
import type { Account, NetWorthSnapshot } from '../types'

export function NetWorth() {
  const accounts = usePersonalFinance((s) => s.accounts)
  const snapshots = usePersonalFinance((s) => s.snapshots)
  const { addAccount, updateAccount, deleteAccount, saveSnapshot, deleteSnapshot } = usePersonalFinance.getState()

  const [editing, setEditing] = useState<{ id?: string; draft: AccountDraft } | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [deletingSnapshot, setDeletingSnapshot] = useState<NetWorthSnapshot | null>(null)
  const [snapshotOpen, setSnapshotOpen] = useState(false)

  const summary = useMemo(() => summarize(accounts), [accounts])
  const today = localISODate()
  const todays = snapshots.find((s) => s.date === today)
  const hasAccounts = accounts.length > 0

  const openPreset = (name: string, category: Account['category']) => setEditing({ draft: draftFor(category, name) })

  return (
    <>
      <PageHeader kicker="Tool 01" title="Net Worth">
        Everything you own minus everything you owe. Save a snapshot now and then to watch the trend.
      </PageHeader>

      <div className="flex flex-col gap-6">
        {hasAccounts ? (
          <>
            <NetWorthSummary summary={summary} snapshots={snapshots} today={today} onSaveSnapshot={() => setSnapshotOpen(true)} />
            <Card className="p-5">
              <QuickAdd onPreset={openPreset} onCustom={() => setEditing({ draft: draftFor('cash') })} />
            </Card>
            <AccountList
              accounts={accounts}
              onEdit={(a) => setEditing({ id: a.id, draft: { name: a.name, kind: a.kind, category: a.category, balance: a.balance, invested: a.invested, liquid: a.liquid, note: a.note } })}
              onDelete={setDeleting}
            />
            <BreakdownBars summary={summary} />
          </>
        ) : (
          <Card className="halftone flex flex-col gap-5 p-6 sm:p-8">
            <div>
              <p className="font-display text-2xl uppercase sm:text-3xl">Start with what you have</p>
              <p className="mt-2 max-w-prose">
                Add your accounts: bank, retirement, brokerage, home, and any loans or cards. Balances stay in this browser. Pick a
                preset to start.
              </p>
            </div>
            <QuickAdd onPreset={openPreset} onCustom={() => setEditing({ draft: draftFor('cash') })} />
          </Card>
        )}

        {(hasAccounts || snapshots.length > 0) && <HistoryChart snapshots={snapshots} />}
        <SnapshotList snapshots={snapshots} onDelete={setDeletingSnapshot} />
      </div>

      <AccountModal
        state={editing}
        onClose={() => setEditing(null)}
        onSave={(draft, id) => {
          if (id) updateAccount(id, draft)
          else addAccount(draft)
          setEditing(null)
        }}
      />

      <SnapshotModal
        open={snapshotOpen}
        today={today}
        summary={summary}
        replacing={todays !== undefined}
        existingNote={todays?.note}
        onClose={() => setSnapshotOpen(false)}
        onSave={(note) => {
          saveSnapshot(note, today)
          setSnapshotOpen(false)
        }}
      />

      <ConfirmModal
        open={deleting !== null}
        title="Delete account?"
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteAccount(deleting.id)
          setDeleting(null)
        }}
      >
        {deleting && (
          <p>
            Remove <strong>{deleting.name}</strong> ({formatUSD(deleting.balance / 100)})? Past snapshots keep their totals.
          </p>
        )}
      </ConfirmModal>

      <ConfirmModal
        open={deletingSnapshot !== null}
        title="Delete snapshot?"
        confirmLabel="Delete"
        onCancel={() => setDeletingSnapshot(null)}
        onConfirm={() => {
          if (deletingSnapshot) deleteSnapshot(deletingSnapshot.date)
          setDeletingSnapshot(null)
        }}
      >
        {deletingSnapshot && (
          <p>
            Remove the snapshot from <strong>{formatDate(deletingSnapshot.date)}</strong>? Your accounts aren’t affected.
          </p>
        )}
      </ConfirmModal>
    </>
  )
}
