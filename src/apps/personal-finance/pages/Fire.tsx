import { PageHeader } from '../components/PageHeader'
import { UnderConstruction } from '../components/UnderConstruction'

export function Fire() {
  return (
    <>
      <PageHeader kicker="Tool 02" title="FIRE Projection">
        How big your portfolio needs to be, and how long it takes to get there, in today's dollars.
      </PageHeader>
      <UnderConstruction
        milestone="M2"
        items={[
          'FI number, years to FI, FI age',
          'Lean / Fat / Coast / Barista FIRE',
          'Projection chart with drawdown and sustainability check',
          'Sensitivity grid and "how this is calculated" notes',
        ]}
      />
    </>
  )
}
