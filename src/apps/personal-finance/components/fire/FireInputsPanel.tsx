import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { FireErrors } from '../../lib/fireInputs'
import { formatUSD } from '../../lib/format'
import { toolPath } from '../../tools'
import type { Cents, FireInputs } from '../../types'
import { Button } from '../ui'
import { NumberField } from '../ui/NumberField'

export interface FireInputsPanelProps {
  inputs: FireInputs
  errors: FireErrors
  onChange: (patch: Partial<FireInputs>) => void
  onParseErrorChange: (field: keyof FireInputs, hasError: boolean) => void
  /** Invested total from Net Worth accounts; null when there are no invested accounts. */
  investedFromAccounts: Cents | null
  onReset: () => void
}

const perMonth = (cents: number | undefined) =>
  cents !== undefined && cents > 0 ? `≈ ${formatUSD(cents / 100 / 12)} / month` : undefined

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t-[2.5px] border-dashed border-ink pt-4 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="font-display text-sm uppercase">
        {title}
      </p>
      {children}
    </fieldset>
  )
}

export function FireInputsPanel({ inputs, errors, onChange, onParseErrorChange, investedFromAccounts, onReset }: FireInputsPanelProps) {
  const field = <K extends keyof FireInputs>(key: K) => ({
    error: errors[key],
    onParseErrorChange: (has: boolean) => onParseErrorChange(key, has),
  })
  const hasPartTime = (inputs.partTimeIncome ?? 0) > 0

  return (
    <div className="flex flex-col gap-5">
      <Group title="You today">
        <NumberField
          label="Current age"
          kind="integer"
          value={inputs.currentAge}
          onChange={(v) => onChange({ currentAge: v })}
          {...field('currentAge')}
        />
        <NumberField
          label="Invested assets today"
          kind="money"
          value={inputs.investedAssets}
          onChange={(v) => onChange({ investedAssets: v })}
          {...field('investedAssets')}
          hint={
            investedFromAccounts !== null ? (
              <button
                type="button"
                className="cursor-pointer font-bold underline underline-offset-2"
                onClick={() => onChange({ investedAssets: investedFromAccounts })}
              >
                Use my net worth data ({formatUSD(investedFromAccounts / 100)})
              </button>
            ) : (
              <>
                Investments and retirement accounts only.{' '}
                <Link to={toolPath('net-worth')} className="font-bold underline underline-offset-2">
                  Add accounts
                </Link>{' '}
                to fill this in automatically.
              </>
            )
          }
        />
        <NumberField
          label="Annual contribution"
          kind="money"
          value={inputs.annualContribution}
          onChange={(v) => onChange({ annualContribution: v })}
          {...field('annualContribution')}
          hint={perMonth(inputs.annualContribution) ?? 'What you invest per year.'}
        />
        <NumberField
          label="Contribution growth / yr"
          kind="percent"
          value={inputs.contributionGrowthPct}
          onChange={(v) => onChange({ contributionGrowthPct: v })}
          slider={{ min: 0, max: 10, step: 0.5 }}
          {...field('contributionGrowthPct')}
          hint="How much more you'll save each year, e.g. from raises."
        />
        <NumberField
          label="After-tax income"
          kind="money"
          optional
          value={inputs.afterTaxIncome}
          onChange={(v) => onChange({ afterTaxIncome: v })}
          {...field('afterTaxIncome')}
          hint="Used only to show your savings rate."
        />
      </Group>

      <Group title="Retirement">
        <NumberField
          label="Annual spending in retirement"
          kind="money"
          value={inputs.annualSpending}
          onChange={(v) => onChange({ annualSpending: v })}
          {...field('annualSpending')}
          hint={perMonth(inputs.annualSpending)}
        />
        <NumberField
          label="Target retirement age"
          kind="integer"
          value={inputs.targetRetirementAge}
          onChange={(v) => onChange({ targetRetirementAge: v })}
          slider={{ min: 40, max: 75, step: 1 }}
          {...field('targetRetirementAge')}
          hint="Used for Coast FIRE."
        />
      </Group>

      <Group title="Assumptions">
        <NumberField
          label="Expected real return"
          kind="percent"
          value={inputs.realReturnPct}
          onChange={(v) => onChange({ realReturnPct: v })}
          slider={{ min: -2, max: 12, step: 0.25 }}
          {...field('realReturnPct')}
          hint="After inflation, so every result is in today's dollars."
        />
        <NumberField
          label="Safe withdrawal rate"
          kind="percent"
          value={inputs.withdrawalRatePct}
          onChange={(v) => onChange({ withdrawalRatePct: v })}
          slider={{ min: 2, max: 8, step: 0.25 }}
          {...field('withdrawalRatePct')}
          hint="Share of the portfolio you withdraw in year one. 4% is the classic rule of thumb."
        />
      </Group>

      <Group title="Barista FIRE">
        <NumberField
          label="Part-time income in FI"
          kind="money"
          optional
          value={inputs.partTimeIncome}
          onChange={(v) => onChange({ partTimeIncome: v, ...(v ? {} : { projectionMode: 'full' as const }) })}
          {...field('partTimeIncome')}
          hint="Income from light work after you leave your main job."
        />
        <div role="radiogroup" aria-label="Plan the projection for" className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-bold uppercase">Plan the projection for</span>
          <div className="flex">
            {(
              [
                ['full', 'Full FIRE'],
                ['barista', 'Barista FIRE'],
              ] as const
            ).map(([mode, label], i) => {
              const checked = inputs.projectionMode === mode
              const disabled = mode === 'barista' && !hasPartTime
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  disabled={disabled}
                  onClick={() => onChange({ projectionMode: mode })}
                  className={cn(
                    'ink-border flex-1 cursor-pointer px-3 py-2 font-mono text-xs font-bold uppercase disabled:cursor-not-allowed disabled:opacity-50',
                    i > 0 && '-ml-[2.5px]',
                    checked ? 'bg-pf-lime' : 'bg-paper',
                  )}
                >
                  {checked && '✓ '}
                  {label}
                </button>
              )
            })}
          </div>
          {!hasPartTime && <p className="text-xs text-ink/70">Enter part-time income to plan for Barista FIRE.</p>}
        </div>
      </Group>

      <Button variant="ghost" size="sm" className="self-start" onClick={onReset} sound={false}>
        Reset to defaults
      </Button>
    </div>
  )
}
