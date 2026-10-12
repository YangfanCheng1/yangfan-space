import { cn } from '@/lib/cn'
import type { FireParams, FireResult } from '../../lib/calc/fire'
import { formatUSD } from '../../lib/format'
import { Card } from '../ui'

const blurbs = {
  lean: '75% of your spending',
  fire: 'Your planned spending',
  fat: '150% of your spending',
  barista: 'Spending minus part-time income',
} as const

export function VariantLadder({ result, params }: { result: FireResult; params: FireParams }) {
  const activeId = params.mode === 'barista' && result.baristaNumber !== null ? 'barista' : 'fire'
  return (
    <Card className="p-5">
      <h2 className="font-display text-xl uppercase">FIRE ladder</h2>
      <p className="mt-1 text-sm">Same withdrawal rate, different lifestyles.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="font-mono text-xs uppercase">
            <tr className="border-b-2 border-ink">
              <th className="py-2 pr-3 text-left">Variant</th>
              <th className="py-2 pr-3 text-right">Spending / yr</th>
              <th className="py-2 pr-3 text-right">Target</th>
              <th className="py-2 pr-3 text-right">Years</th>
              <th className="py-2 text-right">FI age</th>
            </tr>
          </thead>
          <tbody>
            {result.variants.map((v) => {
              const active = v.id === activeId
              return (
                <tr key={v.id} className={cn('border-b border-ink/15', active && 'bg-pf-lime/50')}>
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal">
                    <span className="font-bold">{v.label}</span>
                    {active && <span className="ml-2 font-mono text-[11px] font-bold uppercase">← your plan</span>}
                    <span className="block text-xs text-ink/70">{blurbs[v.id]}</span>
                  </th>
                  <td className="pf-num py-2.5 pr-3 text-right">{formatUSD(v.spending)}</td>
                  <td className="pf-num py-2.5 pr-3 text-right">{formatUSD(v.target)}</td>
                  <td className="pf-num py-2.5 pr-3 text-right">{v.years === null ? '—' : v.years.toFixed(1)}</td>
                  <td className="pf-num py-2.5 text-right">{v.age === null ? 'Not by 90' : v.age.toFixed(1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
