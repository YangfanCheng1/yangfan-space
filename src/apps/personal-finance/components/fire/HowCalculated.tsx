import { Card } from '../ui'

/** Spec F11: the §6 conventions and formulas, in plain language. */
export function HowCalculated() {
  return (
    <Card className="p-5">
      <details>
        <summary className="cursor-pointer font-display text-xl uppercase">How this is calculated</summary>
        <div className="mt-4 flex max-w-prose flex-col gap-3 text-sm">
          <p>
            <strong>FI number</strong> = annual spending ÷ withdrawal rate. At 4%, $40,000/yr needs $1,000,000. In Barista
            mode, part-time income covers some spending, so the target is (spending − part-time income) ÷ withdrawal rate.
          </p>
          <p>
            <strong>Growth.</strong> Your portfolio compounds once a year at the real return. Contributions land at the end
            of each year and grow by the contribution-growth rate. Years to FI is the exact (fractional) point where the
            portfolio first reaches the target.
          </p>
          <p>
            <strong>Real returns</strong> are after inflation, so every figure is in today's dollars. A 5% real return is
            roughly 7–8% nominal with 2–3% inflation.
          </p>
          <p>
            <strong>Coast FIRE</strong> = target ÷ (1 + return)<sup>years until retirement age</sup>: the amount that grows
            to your target on its own. Your coast age is the earliest point you could stop contributing and still get there
            by your target retirement age.
          </p>
          <p>
            <strong>After FI</strong> the chart withdraws your spending (less part-time income in Barista mode) at the start
            of each year and grows the rest. The withdrawal stays flat in today's dollars, which is how the classic 4% rule
            is defined.
          </p>
          <p>
            <strong>What this leaves out:</strong> taxes, fees, Social Security or pensions, market swings (returns are
            smooth here), and one-off expenses. Real returns vary year to year, and a bad run early in retirement matters
            more than the average.
          </p>
          <p className="font-bold">This is arithmetic on your assumptions, not financial advice.</p>
        </div>
      </details>
    </Card>
  )
}
