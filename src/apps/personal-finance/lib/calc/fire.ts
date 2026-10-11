/**
 * FIRE math — spec §6. Pure functions: dollars as floats, rates as decimals
 * (0.05 = 5%). Nothing here throws or returns NaN; "never" is `null`.
 *
 * Conventions: annual compounding, contributions at the END of each year,
 * withdrawals at the START of each year, real (inflation-adjusted) returns.
 * Years to FI is continuous (fractional years allowed).
 */

/** Projections and "years to FI" searches stop at this age. */
export const MAX_AGE = 90

export interface FireParams {
  currentAge: number
  /** P — invested assets today. */
  invested: number
  /** C — first-year contribution. */
  contribution: number
  /** g — yearly growth of the contribution. */
  contributionGrowth: number
  /** E — annual spending in retirement. */
  spending: number
  /** r — expected real return. */
  realReturn: number
  /** w — safe withdrawal rate. */
  withdrawalRate: number
  /** For Coast FIRE. */
  targetRetirementAge: number
  afterTaxIncome?: number
  /** B — part-time income during FI (Barista). */
  partTimeIncome?: number
  /** Which target the projection accumulates toward / withdraws against. */
  mode: 'full' | 'barista'
}

// ── Building blocks ──────────────────────────────────────────────────────────

/** T = E / w */
export const fiNumber = (spending: number, withdrawalRate: number) => spending / withdrawalRate

/**
 * V(n) = P·(1+r)^n + C·F(n), with F(n) the future value of a contribution
 * stream growing at g. Continuous in n, exact at whole years.
 */
export function portfolioValue(P: number, C: number, r: number, g: number, n: number): number {
  const growth = Math.pow(1 + r, n)
  const F = Math.abs(r - g) < 1e-9 ? n * Math.pow(1 + r, n - 1) : (growth - Math.pow(1 + g, n)) / (r - g)
  return P * growth + C * F
}

/**
 * Smallest n ≥ 0 with f(n) ≥ target, searching [0, maxYears]: scan whole
 * years, then bisect inside the crossing year. null if never reached.
 */
function firstCrossing(f: (n: number) => number, target: number, maxYears: number): number | null {
  if (f(0) >= target) return 0
  let lo = 0
  for (let k = 1; lo < maxYears; k++) {
    const hi = Math.min(k, maxYears)
    if (f(hi) >= target) {
      let a = lo
      let b = hi
      for (let i = 0; i < 60; i++) {
        const mid = (a + b) / 2
        if (f(mid) >= target) b = mid
        else a = mid
      }
      return b
    }
    lo = hi
  }
  return null
}

/** Years until V(n) ≥ target, or null if not within maxYears. */
export function yearsToReach(P: number, C: number, r: number, g: number, target: number, maxYears: number): number | null {
  return firstCrossing((n) => portfolioValue(P, C, r, g, n), target, maxYears)
}

/** P_coast = T / (1+r)^years — what you need today to coast to T. */
export const coastNumber = (target: number, r: number, years: number) => target / Math.pow(1 + r, Math.max(0, years))

/**
 * Years of contributing until you could stop and still reach `target` by the
 * retirement horizon: smallest n with V(n)·(1+r)^(Y−n) ≥ T, n ≤ Y.
 */
export function yearsToCoast(P: number, C: number, r: number, g: number, target: number, yearsToRetirement: number): number | null {
  const Y = yearsToRetirement
  return firstCrossing((n) => portfolioValue(P, C, r, g, n) * Math.pow(1 + r, Y - n), target, Y)
}

/**
 * Years of withdrawals a portfolio funds: start-of-year withdrawal W, then
 * growth. Fractional final year. null = still funded after maxYears.
 */
export function drawdownYears(V: number, W: number, r: number, maxYears: number): number | null {
  if (W <= 0) return null
  let v = V
  for (let k = 0; k < maxYears; k++) {
    if (v < W) return k + v / W
    v = (v - W) * (1 + r)
  }
  return null
}

// ── Full computation ─────────────────────────────────────────────────────────

export interface ProjectionPoint {
  /** Years from now (0 = today). */
  year: number
  age: number
  calendarYear: number
  /** Main path: accumulate to the target, then withdraw. */
  value: number
  /** Coast path: no contributions or withdrawals from today. */
  coastValue: number
  phase: 'accumulation' | 'drawdown'
}

export interface FireVariant {
  id: 'lean' | 'fire' | 'fat' | 'barista'
  label: string
  /** Annual spending the portfolio must cover. */
  spending: number
  target: number
  years: number | null
  age: number | null
}

export interface SensitivityGrid {
  returns: number[]
  multipliers: number[]
  /** cells[returnIndex][multiplierIndex] = years to FI (null = never). */
  cells: (number | null)[][]
}

export interface FireResult {
  fiNumber: number
  baristaNumber: number | null
  /** The target the projection uses (FI or Barista number, per mode). */
  target: number
  /** Annual withdrawal in drawdown (spending, less part-time income in Barista mode). */
  withdrawal: number
  /** invested ÷ target, uncapped. */
  progress: number
  yearsToFi: number | null
  fiAge: number | null
  fiCalendarYear: number | null
  variants: FireVariant[]
  coast: {
    number: number
    yearsToRetirement: number
    alreadyCoasting: boolean
    /** Age you could stop contributing and still hit the target by retirement age. */
    coastAge: number | null
    /** Age you'd reach the target if you stopped contributing today. */
    fiAgeIfStopNow: number | null
  }
  savingsRate: number | null
  projection: ProjectionPoint[]
  /** Index of the projection point where the target is first reached. */
  fiIndex: number | null
  /** null when FI isn't reached in the horizon. */
  sustainability: { runsOutAge: number | null } | null
  sensitivity: SensitivityGrid
}

export const SENSITIVITY_RETURNS = [0.03, 0.04, 0.05, 0.06, 0.07]
export const SENSITIVITY_MULTIPLIERS = [0.5, 0.75, 1, 1.25, 1.5]

export function computeFire(p: FireParams, startYear = new Date().getFullYear()): FireResult {
  const { invested: P, contribution: C, contributionGrowth: g, realReturn: r, withdrawalRate: w, spending: E } = p
  const horizon = Math.max(0, MAX_AGE - p.currentAge)
  const B = p.partTimeIncome ?? 0
  const T = fiNumber(E, w)
  const baristaNumber = B > 0 ? fiNumber(E - B, w) : null
  const barista = p.mode === 'barista' && baristaNumber !== null
  const target = barista ? baristaNumber : T
  const withdrawal = barista ? E - B : E

  const yearsFor = (tgt: number, contribution = C, ret = r) => yearsToReach(P, contribution, ret, g, tgt, horizon)
  const ageFor = (years: number | null) => (years === null ? null : p.currentAge + years)

  const yearsToFi = yearsFor(target)

  const variantDefs: [FireVariant['id'], string, number][] = [
    ['lean', 'Lean FIRE', 0.75 * E],
    ['fire', 'FIRE', E],
    ['fat', 'Fat FIRE', 1.5 * E],
  ]
  if (baristaNumber !== null) variantDefs.push(['barista', 'Barista FIRE', E - B])
  const variants = variantDefs.map(([id, label, spending]) => {
    const tgt = fiNumber(spending, w)
    const years = yearsFor(tgt)
    return { id, label, spending, target: tgt, years, age: ageFor(years) }
  })

  const yearsToRetirement = Math.max(0, p.targetRetirementAge - p.currentAge)
  const coastNum = coastNumber(target, r, yearsToRetirement)
  const coastYears = yearsToCoast(P, C, r, g, target, yearsToRetirement)
  const stopNowYears = yearsToReach(P, 0, r, 0, target, horizon)

  // Year-by-year projection.
  const projection: ProjectionPoint[] = []
  let v = P
  let fiIndex: number | null = v >= target ? 0 : null
  for (let k = 0; k <= horizon; k++) {
    projection.push({
      year: k,
      age: p.currentAge + k,
      calendarYear: startYear + k,
      value: v,
      coastValue: P * Math.pow(1 + r, k),
      phase: fiIndex !== null && k > fiIndex ? 'drawdown' : 'accumulation',
    })
    if (fiIndex === null) {
      v = v * (1 + r) + C * Math.pow(1 + g, k)
      if (v >= target) fiIndex = k + 1
    } else {
      v = Math.max(0, (v - withdrawal) * (1 + r))
    }
  }

  let sustainability: FireResult['sustainability'] = null
  if (fiIndex !== null) {
    const startAge = p.currentAge + fiIndex
    const funded = drawdownYears(projection[fiIndex].value, withdrawal, r, MAX_AGE - startAge)
    sustainability = { runsOutAge: funded === null ? null : startAge + funded }
  }

  const sensitivity: SensitivityGrid = {
    returns: SENSITIVITY_RETURNS,
    multipliers: SENSITIVITY_MULTIPLIERS,
    cells: SENSITIVITY_RETURNS.map((ret) => SENSITIVITY_MULTIPLIERS.map((m) => yearsFor(target, C * m, ret))),
  }

  return {
    fiNumber: T,
    baristaNumber,
    target,
    withdrawal,
    progress: target > 0 ? P / target : 0,
    yearsToFi,
    fiAge: ageFor(yearsToFi),
    fiCalendarYear: yearsToFi === null ? null : startYear + Math.round(yearsToFi),
    variants,
    coast: {
      number: coastNum,
      yearsToRetirement,
      alreadyCoasting: P >= coastNum,
      coastAge: ageFor(coastYears),
      fiAgeIfStopNow: ageFor(stopNowYears),
    },
    savingsRate: p.afterTaxIncome && p.afterTaxIncome > 0 ? C / p.afterTaxIncome : null,
    projection,
    fiIndex,
    sustainability,
    sensitivity,
  }
}
