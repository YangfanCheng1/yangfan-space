import { CATEGORIES } from '../../lib/categories'
import { formatUSD } from '../../lib/format'
import type { Account, AccountKind } from '../../types'
import { Badge, Card } from '../ui'

const usd = (cents: number) => formatUSD(cents / 100, { cents: cents % 100 !== 0 })

export interface AccountListProps {
  accounts: Account[]
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

function KindSection({ kind, accounts, onEdit, onDelete }: AccountListProps & { kind: AccountKind }) {
  const groups = CATEGORIES.filter((c) => c.kind === kind)
    .map((c) => ({ meta: c, items: accounts.filter((a) => a.category === c.id) }))
    .filter((g) => g.items.length > 0)
  const total = groups.reduce((sum, g) => sum + g.items.reduce((s, a) => s + a.balance, 0), 0)
  const sign = kind === 'liability' ? '−' : ''
  const title = kind === 'asset' ? 'Assets' : 'Liabilities'

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3 border-b-[2.5px] border-ink pb-2">
        <h2 className="font-display text-xl uppercase">{title}</h2>
        <span className="pf-num text-lg font-bold">
          {total > 0 ? sign : ''}
          {usd(total)}
        </span>
      </div>
      {groups.length === 0 ? (
        <p className="pt-3 text-sm text-ink/70">{kind === 'asset' ? 'No assets yet.' : 'No debts. Nice.'}</p>
      ) : (
        groups.map(({ meta, items }) => (
          <section key={meta.id} aria-label={meta.label} className="pt-3">
            <div className="flex items-baseline justify-between font-mono text-xs font-bold uppercase text-ink/70">
              <h3>{meta.label}</h3>
              <span className="pf-num">
                {sign}
                {usd(items.reduce((s, a) => s + a.balance, 0))}
              </span>
            </div>
            <ul>
              {items.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink/15 py-2.5 last:border-b-0">
                  <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-bold break-words">{a.name}</span>
                      {a.invested && <Badge tone="lime">Invested</Badge>}
                      {a.liquid && <Badge>Liquid</Badge>}
                    </p>
                    {a.note && <p className="mt-0.5 text-xs break-words text-ink/70">{a.note}</p>}
                  </div>
                  <span className="pf-num text-right font-bold">
                    {a.balance > 0 ? sign : ''}
                    {usd(a.balance)}
                  </span>
                  <div className="ml-auto flex gap-2 sm:ml-0">
                    <button
                      type="button"
                      className="cursor-pointer border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs font-bold uppercase hover:bg-pf-lime"
                      onClick={() => onEdit(a)}
                      aria-label={`Edit ${a.name}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs font-bold uppercase hover:bg-pf-clay hover:text-paper"
                      onClick={() => onDelete(a)}
                      aria-label={`Delete ${a.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </Card>
  )
}

/** Spec NW4: grouped by kind, then category, with subtotals. */
export function AccountList(props: AccountListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
      <KindSection kind="asset" {...props} />
      <KindSection kind="liability" {...props} />
    </div>
  )
}
