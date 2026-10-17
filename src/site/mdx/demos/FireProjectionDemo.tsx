import { ProjectionChart } from '@/apps/personal-finance/components/charts/ProjectionChart'
import { computeFire } from '@/apps/personal-finance/lib/calc/fire'
import { DEFAULT_FIRE_INPUTS, toFireParams } from '@/apps/personal-finance/lib/fireInputs'
import '@/apps/personal-finance/theme.css'

/** The real Personal Finance projection, with the app's default inputs and its own (green) theme. */
const params = toFireParams({ ...DEFAULT_FIRE_INPUTS, investedAssets: 5_000_000 })
const result = computeFire(params)

export default function FireProjectionDemo() {
  return (
    <div className="pf-root bg-paper text-ink">
      <ProjectionChart result={result} params={params} />
    </div>
  )
}
