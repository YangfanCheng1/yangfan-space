import type { FireParams, FireResult } from '../../lib/calc/fire'
import { formatOneDecimal, formatPct, formatUSD } from '../../lib/format'
import { Card } from '../ui'

export function CoastCard({ result, params }: { result: FireResult; params: FireParams }) {
  const { coast } = result
  const retAge = params.targetRetirementAge
  const stopNow = coast.fiAgeIfStopNow === null ? null : `at age ${formatOneDecimal(coast.fiAgeIfStopNow)}`

  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="font-mono text-xs font-bold tracking-widest uppercase">Coast FIRE</p>
      <p className="text-3xl leading-none font-bold">{formatUSD(coast.number, { compact: true })}</p>
      <p className="text-sm">
        Needed today to reach {formatUSD(result.target, { compact: true })} by age {retAge} with no more contributions.
      </p>
      <p className="border-t-2 border-dashed border-ink pt-3 text-sm">
        {coast.alreadyCoasting ? (
          <>
            <strong>✓ You're past it.</strong> You could stop contributing today and still reach FI {stopNow ?? `by ${retAge}`}.
          </>
        ) : coast.coastAge !== null ? (
          <>
            Keep contributing until <strong>age {formatOneDecimal(coast.coastAge)}</strong>, then you can coast to FI by {retAge}.
          </>
        ) : (
          <>Your current savings don't reach the coast point before {retAge}.</>
        )}
      </p>
      {!coast.alreadyCoasting && (
        <p className="text-xs text-ink/70">
          If you stopped contributing today, {stopNow ? `you'd reach FI ${stopNow}` : "you wouldn't reach FI by age 90"}.
        </p>
      )}
    </Card>
  )
}

export function SavingsRateCard({ result, params }: { result: FireResult; params: FireParams }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="font-mono text-xs font-bold tracking-widest uppercase">Savings rate</p>
      {result.savingsRate === null ? (
        <p className="text-sm">Add your after-tax income to see what share of it you invest.</p>
      ) : (
        <>
          <p className="text-3xl leading-none font-bold">{formatPct(result.savingsRate)}</p>
          <p className="text-sm">
            {formatUSD(params.contribution)} invested of {formatUSD(params.afterTaxIncome!)} after-tax income.
          </p>
        </>
      )}
    </Card>
  )
}
