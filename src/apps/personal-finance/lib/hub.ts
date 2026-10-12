import type { PersonalFinanceData } from '../types'
import { computeFire } from './calc/fire'
import { change, snapshotNetWorth, summarize } from './calc/netWorth'
import type { Change } from './calc/netWorth'
import { hasErrors, isDefaultFire, toFireParams, validateFireInputs } from './fireInputs'

/** What the hub's headline tiles show (spec H1–H2). null = empty state. */
export interface HubFigures {
  netWorth: { cents: number; change: (Change & { since: string }) | null } | null
  fire:
    | { status: 'invalid' }
    | { status: 'ok'; progress: number; target: number; yearsToFi: number | null; fiAge: number | null; fiCalendarYear: number | null }
    | null
}

export function hubFigures(d: Pick<PersonalFinanceData, 'accounts' | 'snapshots' | 'fire'>, today: string, startYear?: number): HubFigures {
  let netWorth: HubFigures['netWorth'] = null
  if (d.accounts.length > 0) {
    const cents = summarize(d.accounts).netWorth
    const previous = d.snapshots.filter((s) => s.date < today).at(-1)
    netWorth = { cents, change: previous ? { ...change(snapshotNetWorth(previous), cents), since: previous.date } : null }
  }

  let fire: HubFigures['fire'] = null
  if (!isDefaultFire(d.fire)) {
    if (hasErrors(validateFireInputs(d.fire))) fire = { status: 'invalid' }
    else {
      const r = computeFire(toFireParams(d.fire), startYear)
      fire = { status: 'ok', progress: r.progress, target: r.target, yearsToFi: r.yearsToFi, fiAge: r.fiAge, fiCalendarYear: r.fiCalendarYear }
    }
  }

  return { netWorth, fire }
}
