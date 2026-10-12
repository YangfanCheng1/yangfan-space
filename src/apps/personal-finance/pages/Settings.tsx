import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Button, Card } from '../components/ui'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { backupFileName, parseBackup, serializeBackup } from '../lib/backup'
import type { ParseResult } from '../lib/backup'
import { downloadText, readFileText } from '../lib/browser'
import { localISODate } from '../lib/calc/netWorth'
import { formatDate } from '../lib/format'
import { toolPath } from '../tools'
import { hasUserData, usePersonalFinance } from '../store'

type Imported = Extract<ParseResult, { ok: true }> & { fileName: string }

function Section({ title, children, tone }: { title: string; children: ReactNode; tone?: 'danger' }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className={tone === 'danger' ? 'font-display text-xl text-pf-clay-ink uppercase' : 'font-display text-xl uppercase'}>{title}</h2>
      {children}
    </Card>
  )
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function Settings() {
  const accounts = usePersonalFinance((s) => s.accounts)
  const snapshots = usePersonalFinance((s) => s.snapshots)
  const fire = usePersonalFinance((s) => s.fire)
  const isSampleData = usePersonalFinance((s) => s.isSampleData)
  const { loadSampleData, replaceAll, clearAll } = usePersonalFinance.getState()

  const fileInput = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<Imported | null>(null)
  const [confirmSample, setConfirmSample] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const hasData = hasUserData({ accounts, snapshots, fire })

  const exportNow = () => {
    const { schemaVersion, isSampleData: sample } = usePersonalFinance.getState()
    downloadText(backupFileName(localISODate()), serializeBackup({ schemaVersion, accounts, snapshots, fire, isSampleData: sample }))
    setStatus(`Backup downloaded: ${plural(accounts.length, 'account')}, ${plural(snapshots.length, 'snapshot')}.`)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setImportError(null)
    setStatus('')
    const result = parseBackup(await readFileText(file))
    if (fileInput.current) fileInput.current.value = '' // allow re-picking the same file
    if (!result.ok) setImportError(result.error)
    else setPendingImport({ ...result, fileName: file.name })
  }

  const loadSample = () => {
    loadSampleData()
    setConfirmSample(false)
    setStatus('Sample data loaded. Explore Net Worth and FIRE — edit anything to make it yours.')
  }

  return (
    <>
      <PageHeader kicker="Your data" title="Settings">
        Everything here is stored only in this browser. Back it up, move it to another device, or wipe it.
      </PageHeader>

      <p role="status" aria-live="polite" className={status ? 'ink-border mb-6 bg-pf-lime px-4 py-3 text-sm font-bold' : 'sr-only'}>
        {status && `✓ ${status}`}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <Section title="Back up">
          <p className="text-sm">
            Download everything — {plural(accounts.length, 'account')}, {plural(snapshots.length, 'snapshot')} and your FIRE inputs — as one JSON file.
            Keep it somewhere safe; clearing browser data erases what's stored here.
          </p>
          <Button className="self-start" onClick={exportNow} disabled={!hasData}>
            Export backup
          </Button>
          {!hasData && <p className="text-xs text-ink/70">Nothing to back up yet.</p>}
        </Section>

        <Section title="Restore">
          <p className="text-sm">Load a backup file. You'll see what's in it before anything changes.</p>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            id="pf-import"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <label htmlFor="pf-import" className="ink-border shadow-pop pressable inline-flex cursor-pointer self-start bg-paper px-4 py-2 font-display text-sm uppercase">
            Choose backup file…
          </label>
          {importError && (
            <p role="alert" className="ink-border bg-paper px-3 py-2 text-sm font-bold text-pf-clay-ink">
              ▲ {importError} Nothing was changed.
            </p>
          )}
        </Section>

        <Section title="Sample data">
          <p className="text-sm">
            A realistic example household — 10 accounts, 6 months of snapshots and matching FIRE inputs — to see how everything fits
            together.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="lime" onClick={() => (hasData && !isSampleData ? setConfirmSample(true) : loadSample())}>
              {isSampleData ? 'Reload sample data' : 'Load sample data'}
            </Button>
            {isSampleData && (
              <Button
                variant="ghost"
                onClick={() => {
                  clearAll()
                  setStatus('Sample data cleared.')
                }}
              >
                Clear sample data
              </Button>
            )}
          </div>
        </Section>

        <Section title="Delete all data" tone="danger">
          <p className="text-sm">Remove every account, snapshot and FIRE input from this browser. This can't be undone — export a backup first.</p>
          <Button variant="danger" className="self-start" onClick={() => setConfirmDelete(true)} disabled={!hasData}>
            Delete all data
          </Button>
        </Section>

        <Section title="About">
          <p className="text-sm">
            <strong>Private by design.</strong> No account, no sign-up, no servers: your numbers are saved in this browser's local
            storage and never sent anywhere. Each browser and device keeps its own copy.
          </p>
          <p className="text-sm">
            <strong>Not financial advice.</strong> These tools do arithmetic on the assumptions you enter. See{' '}
            <Link to={toolPath('fire')} className="font-bold underline underline-offset-2">
              how FIRE is calculated
            </Link>{' '}
            at the bottom of the FIRE page.
          </p>
        </Section>
      </div>

      <ConfirmModal
        open={pendingImport !== null}
        title="Restore this backup?"
        confirmLabel="Replace my data"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return
          replaceAll(pendingImport.data)
          setStatus(`Restored ${plural(pendingImport.counts.accounts, 'account')} and ${plural(pendingImport.counts.snapshots, 'snapshot')} from ${pendingImport.fileName}.`)
          setPendingImport(null)
        }}
      >
        {pendingImport && (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="font-mono text-xs font-bold uppercase">File</dt>
              <dd className="break-all">{pendingImport.fileName}</dd>
              <dt className="font-mono text-xs font-bold uppercase">Exported</dt>
              <dd>{formatDate(pendingImport.exportedAt.slice(0, 10))}</dd>
              <dt className="font-mono text-xs font-bold uppercase">Contains</dt>
              <dd>
                {plural(pendingImport.counts.accounts, 'account')}, {plural(pendingImport.counts.snapshots, 'snapshot')}, FIRE inputs
                {pendingImport.data.isSampleData && ' (sample data)'}
              </dd>
            </dl>
            {hasData && (
              <p className="ink-border bg-pf-gold px-3 py-2 text-sm font-bold">
                ▲ This replaces your current {plural(accounts.length, 'account')} and {plural(snapshots.length, 'snapshot')}.
              </p>
            )}
          </div>
        )}
      </ConfirmModal>

      <ConfirmModal
        open={confirmSample}
        title="Replace your data with samples?"
        confirmLabel="Load sample data"
        onCancel={() => setConfirmSample(false)}
        onConfirm={loadSample}
      >
        <p>
          Your {plural(accounts.length, 'account')} and {plural(snapshots.length, 'snapshot')} will be replaced by the sample household.
          Export a backup first if you want to keep them.
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={confirmDelete}
        title="Delete all data?"
        confirmLabel="Delete everything"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          clearAll()
          setConfirmDelete(false)
          setStatus('All data deleted. The app is back to a fresh start.')
        }}
      >
        <p>
          This permanently removes {plural(accounts.length, 'account')}, {plural(snapshots.length, 'snapshot')} and your FIRE inputs from
          this browser.
        </p>
      </ConfirmModal>
    </>
  )
}
