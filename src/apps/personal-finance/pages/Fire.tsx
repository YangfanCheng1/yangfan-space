import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { ProjectionChart } from '../components/charts/ProjectionChart'
import { CoastCard, SavingsRateCard } from '../components/fire/CoastCard'
import { FireHeadline } from '../components/fire/FireHeadline'
import { FireInputsPanel } from '../components/fire/FireInputsPanel'
import { HowCalculated } from '../components/fire/HowCalculated'
import { SensitivityGrid } from '../components/fire/SensitivityGrid'
import { VariantLadder } from '../components/fire/VariantLadder'
import { PageHeader } from '../components/PageHeader'
import { Button, Card } from '../components/ui'
import { Modal } from '../components/ui/Modal'
import { computeFire } from '../lib/calc/fire'
import { summarize } from '../lib/calc/netWorth'
import { DEFAULT_FIRE_INPUTS, hasErrors, toFireParams, validateFireInputs } from '../lib/fireInputs'
import { formatOneDecimal, formatUSD } from '../lib/format'
import { bestLever } from '../lib/levers'
import { usePersonalFinance } from '../store'
import type { FireInputs } from '../types'

function compute(inputs: FireInputs) {
  const params = toFireParams(inputs)
  return { params, result: computeFire(params), lever: bestLever(params) }
}

export function Fire() {
  const inputs = usePersonalFinance((s) => s.fire)
  const accounts = usePersonalFinance((s) => s.accounts)
  const setFire = usePersonalFinance((s) => s.setFire)
  const resetFire = usePersonalFinance((s) => s.resetFire)

  const [parseErrors, setParseErrors] = useState<ReadonlySet<keyof FireInputs>>(new Set())
  const [confirmReset, setConfirmReset] = useState(false)

  const errors = useMemo(() => validateFireInputs(inputs), [inputs])
  const invalid = hasErrors(errors) || parseErrors.size > 0
  const current = useMemo(() => (invalid ? null : compute(inputs)), [inputs, invalid])

  // Spec F10: while any input is invalid, keep showing the last valid results (dimmed).
  const [lastValid, setLastValid] = useState(() => current ?? compute(DEFAULT_FIRE_INPUTS))
  if (current && current !== lastValid) setLastValid(current)
  const view = current ?? lastValid

  const investedFromAccounts = useMemo(() => {
    const invested = summarize(accounts).invested
    return invested > 0 ? invested : null
  }, [accounts])

  const onParseErrorChange = (field: keyof FireInputs, has: boolean) =>
    setParseErrors((prev) => {
      const next = new Set(prev)
      if (has) next.add(field)
      else next.delete(field)
      return next
    })

  return (
    <>
      <PageHeader kicker="Tool 02" title="FIRE Projection">
        How big your portfolio needs to be, and how long it takes to get there, in today's dollars. Results update as
        you type.
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-4">
          <Card className="p-5 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
            <h2 className="sr-only">Your inputs</h2>
            <FireInputsPanel
              inputs={inputs}
              errors={errors}
              onChange={setFire}
              onParseErrorChange={onParseErrorChange}
              investedFromAccounts={investedFromAccounts}
              onReset={() => setConfirmReset(true)}
            />
          </Card>
          {/* Phones: inputs are long, so keep the answer in view while editing. */}
          <a
            href="#fire-results"
            className={cn(
              'ink-border shadow-pop sticky bottom-3 z-10 mt-4 flex items-center justify-between gap-3 px-4 py-3 text-sm lg:hidden',
              invalid ? 'bg-pf-gold text-ink' : 'bg-pf-pine text-paper',
            )}
          >
            <span className="font-bold">
              {invalid
                ? '▲ Fix the highlighted input'
                : view.result.fiAge === null
                  ? 'FI not reached by 90'
                  : view.result.yearsToFi === 0
                    ? '✓ Already FI'
                    : `FI at ${formatOneDecimal(view.result.fiAge)} · ${formatUSD(view.result.target, { compact: true })} target`}
            </span>
            <span className="font-mono text-xs font-bold whitespace-nowrap uppercase">Results ↓</span>
          </a>
        </div>

        <section id="fire-results" aria-label="Results" className="flex min-w-0 scroll-mt-4 flex-col gap-6">
          {invalid && (
            <p role="status" className="ink-border bg-pf-gold px-4 py-3 text-sm font-bold">
              ▲ Fix the highlighted input{Object.keys(errors).length + parseErrors.size > 1 ? 's' : ''} to update these
              results. Showing your last valid plan.
            </p>
          )}
          <div className={cn('flex flex-col gap-6 transition-opacity', invalid && 'pointer-events-none opacity-50')} aria-hidden={invalid || undefined}>
            <FireHeadline result={view.result} params={view.params} lever={view.lever} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CoastCard result={view.result} params={view.params} />
              <SavingsRateCard result={view.result} params={view.params} />
            </div>
            <ProjectionChart result={view.result} params={view.params} />
            <VariantLadder result={view.result} params={view.params} />
            <SensitivityGrid result={view.result} params={view.params} />
            <HowCalculated />
          </div>
        </section>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset FIRE inputs?">
        <p>This puts every FIRE input back to its default. Your Net Worth accounts aren't affected.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmReset(false)} sound={false}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetFire()
              setParseErrors(new Set())
              setConfirmReset(false)
            }}
          >
            Reset
          </Button>
        </div>
      </Modal>
    </>
  )
}
