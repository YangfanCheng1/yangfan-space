import { PageHeader } from '../components/PageHeader'
import { UnderConstruction } from '../components/UnderConstruction'

export function NetWorth() {
  return (
    <>
      <PageHeader kicker="Tool 01" title="Net Worth">
        Everything you own minus everything you owe. Save a snapshot now and then to watch the trend.
      </PageHeader>
      <UnderConstruction
        milestone="M3"
        items={[
          'Accounts with categories, plus invested / liquid flags',
          'Quick-add presets for common accounts',
          'Totals, liquid net worth, debt-to-asset, home equity',
          'Breakdown chart, snapshots and history chart',
        ]}
      />
    </>
  )
}
