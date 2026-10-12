# Personal Finance — Product Spec (PRD)

| | |
|---|---|
| **Status** | Approved for build. Decisions are recorded in [§11](#11-decisions-log) |
| **Route** | `/personal-finance` |
| **Location** | `src/apps/personal-finance/` |
| **Last updated** | 2026-10-11 |

---

## 1. Summary

A private, no-sign-up personal finance workbench inside yangfan-space, opened from a card on the gateway. Version 1 contains two tools, both built thoroughly:

1. **Net Worth**: list what you own and what you owe and see your net worth, its breakdown and key ratios. Save dated snapshots to track how it changes over time.
2. **FIRE Projection**: estimate your Financial Independence number, years to FI and FI age. It also covers Lean, Fat, Coast and Barista FIRE, includes a projection chart, a sensitivity grid and a check that the money lasts after you retire, and spells out every assumption.

Everything runs in the browser, and nothing is sent anywhere. All amounts are in **USD**. The app follows the gateway's neubrutalist ink style (thick borders, solid offset shadows, halftone, bold display type) with a **green palette** instead of vermilion, teal and mustard.

## 2. Goals & non-goals

### Goals
- **G1. Answer "Where am I?"** Net worth, broken down by category, with liquid and invested subtotals, in under two minutes of data entry.
- **G2. Answer "When can I stop working?"** A FIRE estimate that updates live as inputs change, with every assumption visible.
- **G3. Trustworthy math.** All formulas are pure functions with unit tests (Vitest). The conventions are documented here and shown in the UI.
- **G4. Private by default.** No account and no network calls for user data. Export, import and wipe are each one click.
- **G5. Room to grow.** Adding a calculator later means adding one folder and one entry in the in-app tool registry.

### Non-goals (v1)
- Bank or brokerage syncing, logins and cloud sync. Data is stored only in this browser.
- Currencies other than USD, and locale switching.
- Tax modeling (brackets, account-type tax treatment, RMDs, Social Security).
- Monte Carlo or historical-sequence simulations.
- Dark mode. The gateway doesn't have one either, so both stay consistent.
- Advice. The app explains math; it does not recommend actions.

## 3. Users & key scenarios

The primary user is someone curious about their finances and comfortable entering numbers, but not wanting a spreadsheet. This includes the site owner.

| # | Scenario |
|---|---|
| S1 | From the gateway, I open Personal Finance and see a hub with my headline net worth and FI progress, or friendly empty states the first time. |
| S2 | First visit: I click **Try with sample data** to explore with a realistic example, then **Clear sample data** when I'm ready to enter my own. |
| S3 | I add accounts (checking, 401(k), brokerage, home, car loan, mortgage…) and see total assets, total liabilities, net worth, liquid net worth and a breakdown by category. |
| S4 | Once a month I click **Save snapshot**, optionally with a note ("bonus month"). Later I see a chart of net worth over time and the change since my last snapshot. |
| S5 | I open FIRE, enter age, invested assets, yearly savings and expected spending, and immediately see my FI number, years to FI and FI age. |
| S6 | I drag the return or withdrawal-rate slider and watch the projection, FI age and sensitivity grid update. |
| S7 | I click **Use my net worth data** to fill "invested assets" from the accounts flagged as invested. |
| S8 | I enter my after-tax income and see my savings rate. I enter a planned part-time income and see my Barista FIRE target. |
| S9 | I export everything as a JSON backup, wipe the data, and restore it from the file on another device. |

## 4. Information architecture

```
/                               Gateway (Ink & Frame) → new card "Personal Finance"
/personal-finance               Hub: headline tiles + tool cards
/personal-finance/net-worth     Net Worth tool
/personal-finance/fire          FIRE Projection tool
/personal-finance/settings      Export / import / sample data / delete all
/personal-finance/<future-tool> later calculators
```

- The app is registered once in `src/apps/registry.ts`. Its route `/personal-finance/*` already works through the existing `/${slug}/*` pattern.
- An in-app **tool registry** (`tools.ts`) drives the hub cards, the in-app nav and the nested routes.
- **Navigation:**
  - A persistent top bar shows the app wordmark and links to Hub · Net Worth · FIRE · Settings. On mobile these become a horizontally scrollable tab row.
  - The current page is marked with `aria-current`.
  - A "← Ink & Frame" link back to the gateway sits in the top bar on desktop and at the end of the tab row on mobile. The app doesn't use the fixed `BackToGateway` chip, which would cover the footer.
- Deep links and reloads land on the right tool. An unknown sub-path shows an in-app 404 that links back to the hub.
- Each tool sets the document title, e.g. "FIRE Projection · Personal Finance".

## 5. Functional requirements

### 5.1 Hub (`/personal-finance`)
- **H1.** Headline tiles. Each links to its tool:

  | Tile | Shows | Sub-line |
  |---|---|---|
  | **Net worth** | Total | Change since the last snapshot |
  | **FI progress** | Invested assets ÷ FI number, as % | Progress bar |
  | **Years to FI** | Years | Estimated FI age |

- **H2.** Empty states: a tool with no data shows a one-line prompt and a "Start" button instead of zeros. The hub also offers **Try with sample data** (see ST3).
- **H3.** Tool cards are rendered from the tool registry, in the same card format as the gateway.
- **H4.** Footer shows two notes:
  - Privacy: "Stored only in this browser."
  - Disclaimer: "Not financial advice."

### 5.2 Net Worth (`/net-worth`)

**Accounts**
- **NW1.** Create, edit and delete accounts. Each account has:
  - name (required, ≤ 60 chars)
  - kind (asset or liability)
  - category
  - balance
  - **invested** flag (counts toward FIRE)
  - **liquid** flag (cash-like)
  - optional note
- **NW2.** Categories and default flags:

  | Kind | Category | Invested default | Liquid default |
  |---|---|---|---|
  | Asset | Cash & savings | off | on |
  | Asset | Taxable investments | on | on |
  | Asset | Retirement (401(k), IRA…) | on | off |
  | Asset | Real estate | off | off |
  | Asset | Vehicles | off | off |
  | Asset | Other assets | off | off |
  | Liability | Mortgage | — | — |
  | Liability | Student loan | — | — |
  | Liability | Auto loan | — | — |
  | Liability | Credit card | — | — |
  | Liability | Other debt | — | — |

  The defaults apply when the category is chosen, and the user can override them.
- **NW3.** Quick add: one-click presets for common accounts (Checking, High-yield savings, 401(k), Roth IRA, Brokerage, Home, Mortgage, Car loan, Credit card). Each preset opens the form pre-filled; only the balance is needed.
- **NW4.** Accounts are listed grouped by kind, then category. Each group shows a subtotal. Edit happens in a modal or inline form, and delete asks for confirmation.
- **NW5.** Balances are entered as positive dollar amounts with two decimal places, and liabilities are subtracted. Input accepts `1234.5`, `1,234.50` and `$1,234.50`.

**Summary & insights**
- **NW6.** Live totals: assets, liabilities, **net worth**, **liquid net worth** (liquid assets − credit-card debt), and **invested assets** (the figure FIRE uses).
- **NW7.** Ratios, each hidden when undefined (e.g. no assets):
  - debt-to-asset (%)
  - home equity: real estate − mortgage, shown only if either exists
- **NW8.** Breakdown chart: horizontal bars of assets by category and liabilities by category, using one axis scale so the two are comparable. It has a table fallback.

**Snapshots & history**
- **NW9.** **Save snapshot** records today's date, total assets, total liabilities, per-category totals, invested and liquid totals, and an optional note. Saving again on the same date replaces that date's snapshot after asking for confirmation.
- **NW10.** Change since the last snapshot is shown as an absolute amount and a %. Colors use green for up and clay for down, plus a ▲ / ▼ glyph so color isn't the only signal.
- **NW11.** History chart: a net worth line over snapshot dates, with toggles for assets and liabilities lines. It needs at least two snapshots and otherwise shows a hint. The tooltip shows date, values and note.
- **NW12.** Snapshot list: date, net worth, change vs. the previous snapshot, note, and delete with confirmation.

### 5.3 FIRE Projection (`/fire`)

**Inputs.** All money inputs are annual, with a "≈ $X / month" helper underneath. Key inputs also have a slider paired with a number field.

| Input | Default | Range / validation |
|---|---|---|
| Current age | 30 | 14–90, integer |
| Invested assets today | 0 | ≥ 0 (button: *Use my net worth data*) |
| Annual contribution | 20,000 | ≥ 0 |
| Contribution growth / yr | 0% | 0–10% |
| Annual spending in retirement | 40,000 | > 0 |
| Expected real return | 5% | −2% to 12% |
| Safe withdrawal rate (SWR) | 4% | 2%–8% |
| Target retirement age (Coast FIRE) | 65 | > current age, ≤ 90 |
| After-tax income *(optional)* | — | ≥ contribution, if provided |
| Part-time income in FI *(optional, Barista)* | — | 0 ≤ value < spending |

Returns are **real**, meaning already adjusted for inflation, so all outputs are in today's dollars. A hint next to the return input makes this explicit.

**Outputs**
- **F1. FI number** = spending ÷ SWR.
- **F2. Years to FI** and **FI age**, to one decimal place, plus the calendar year it lands in (e.g. "≈ 2043").
- **F3. Progress:** invested assets ÷ FI number, shown as % and a bar.
- **F4. Variant ladder.** A table with one row per variant, each with its target, years and FI age:
  - **Lean FIRE**: 0.75 × spending
  - **FIRE**: 1.0 × spending
  - **Fat FIRE**: 1.5 × spending
  - **Barista FIRE**: (spending − part-time income), shown only if part-time income is entered
- **F5. Coast FIRE:**
  - The amount needed today so that, with no more contributions, the portfolio reaches the FI number by the target retirement age.
  - Whether you're already past it, and if not, the age at which you would be.
- **F6. Savings rate** = contribution ÷ after-tax income, shown when income is entered.
- **F7. Projection chart** shows two phases, from now to age 90:
  - **Accumulation** up to the FI age.
  - **Drawdown** after it: withdrawing spending (less any part-time income, if Barista mode is selected) each year.

  It includes:
  - a horizontal FI-number line
  - a marker at the FI age
  - a toggle for the "Coast" path (no further contributions)
  - a tooltip with age, year and value
  - a data-table fallback
- **F8. Sustainability line**: "At this return, your portfolio lasts past age 90" or "runs out at age X", based on the drawdown phase.
- **F9. Sensitivity grid**: years to FI for return ∈ {3, 4, 5, 6, 7}% × contribution ∈ {−50%, −25%, base, +25%, +50%}.
  - The user's current cell is highlighted.
  - Cells that never reach FI show "—".
  - Cells are shaded from fast (deep green) to slow (pale), and each cell also shows its number.
- **F10. Edge states:**
  - **Already FI** (assets ≥ FI number): a celebratory state; the projection shows only the drawdown phase.
  - **Never reaches FI** within the horizon: "Not reached by age 90", plus the single change that gets there soonest. Candidates are saving 50% more (at least +$5k/yr), spending 25% less, or +1 point of return. When FI is reachable, the same "biggest lever" shows as a nudge under the headline.
  - **Invalid input:** the field shows an inline error, outputs are dimmed and keep their last valid values. The UI never shows `NaN`, `Infinity` or negative years.
- **F11.** A collapsible **"How this is calculated"** panel shows the formulas and conventions from §6 in plain language.
- **F12.** **Reset to defaults** button, with confirmation. Inputs persist across reloads.

### 5.4 Settings (`/settings`)
- **ST1. Export**: download all app data as `personal-finance-backup-YYYY-MM-DD.json`.
- **ST2. Import**:
  - Choose a backup file; it is validated against the schema.
  - A preview shows counts (accounts, snapshots) and the export date.
  - Confirm to replace the current data.
  - An invalid file shows a clear error and nothing changes.
- **ST3. Sample data**: load a realistic demo dataset (≈8 accounts, 6 monthly snapshots, matching FIRE inputs). This is only allowed when no user data exists, or after a confirmation that it replaces it. Sample data is marked with a banner ("You're viewing sample data · Clear") until it's cleared or edited.
- **ST4. Delete all data**: confirm via modal, then clear storage and return the app to its empty state.
- **ST5. About:** the privacy statement, the disclaimer and a link to the calculation notes.

## 6. Calculation engine

Pure TypeScript functions live in `src/apps/personal-finance/lib/calc/`. They have no React, no store and no formatting.
- **FIRE math** (`fire.ts`) uses **dollars as floats** and rates as decimals. `lib/fireInputs.ts` converts the stored inputs (cents and percents) and validates them.
- **Net worth math** (`netWorth.ts`) works in **integer cents** end to end, so totals are exact.

**Conventions** (shown in the UI):
- Annual compounding.
- Contributions are added at the **end** of each year.
- In drawdown, withdrawals are taken at the **start** of each year.
- Real (inflation-adjusted) returns.
- Years to FI is continuous, so fractional years are allowed.

**Formulas.** Variables used:
- *E* = annual spending
- *w* = SWR
- *P* = invested assets
- *C* = first-year contribution
- *g* = contribution growth
- *r* = real return
- *B* = part-time income

```
FI number              T = E / w            Barista: T_b = (E − B) / w

Portfolio after n yrs  V(n) = P·(1+r)^n + C·F(n)
  where F(n) = ((1+r)^n − (1+g)^n) / (r − g)     if r ≠ g
               n·(1+r)^(n−1)                     if r = g (incl. r = g = 0 → n)

Years to FI            smallest n ≥ 0 with V(n) ≥ T on [0, 90 − A_now]: scan whole years,
                       then bisect inside the crossing year. When g = 0 this matches the
                       closed form n = ln((T·r + C)/(P·r + C)) / ln(1+r).

Coast FIRE number      P_coast = T / (1+r)^(A_ret − A_now)
Coast age (F5)         A_now + smallest n ≤ A_ret − A_now with V(n)·(1+r)^(A_ret − A_now − n) ≥ T
                       (when you could stop contributing and still reach T by A_ret)
FI age if you stop now A_now + n where P·(1+r)^n = T  (= ln(T/P)/ln(1+r) for r > 0)
FI calendar year       current year + round(years to FI)

Projection (yearly)    accumulation: V_{k+1} = V_k·(1+r) + C·(1+g)^k
                       drawdown:     V_{k+1} = (V_k − (E − B_mode))·(1+r), floored at 0
```

- If V(n) never reaches T within the horizon (e.g. C = 0 and r ≤ 0), the function returns `null`. It never throws and never returns NaN.
- Already FI (P ≥ T) returns 0.

**Reference test cases** (these become Vitest specs; tolerance ±0.01 years / ±$1):

| Case | Inputs | Expected |
|---|---|---|
| FI number | E = 40,000, w = 4% | 1,000,000 |
| Barista target | E = 40,000, B = 20,000, w = 4% | 500,000 |
| Years to FI | P = 100,000, C = 30,000, r = 5%, g = 0, T = 1,000,000 | ≈ 16.94 years |
| Zero return | P = 100,000, C = 50,000, r = 0, g = 0, T = 1,000,000 | 18.00 years |
| Growing contributions | P = 0, C = 10,000, r = 5%, g = 3%, n = 10 | V ≈ 142,490 |
| r = g | P = 0, C = 10,000, r = g = 5%, n = 10 | V = 10·10,000·1.05⁹ ≈ 155,133 |
| Already FI | P = 1,200,000, T = 1,000,000 | 0 |
| Never | P = 10,000, C = 0, r = 0, T = 1,000,000 | `null` |
| Coast FIRE | T = 1,000,000, r = 5%, 30 years | ≈ 231,377 |
| Coast age | P = 100,000, C = 10,000, r = 5%, age 30 → 65, T = 1,000,000 | ≈ 40.69 |
| Drawdown depletion | V = 1,000,000, spend 40,000, r = 0 | lasts exactly 25 years |
| Savings rate | C = 30,000, income = 75,000 | 40% |
| Net worth | assets 350,000; liabilities 210,000 | 140,000 |
| Debt-to-asset | assets 350,000; liabilities 210,000 | 60% |
| Money parsing | `"$1,234.50"` | 123450 cents |

## 7. Data model & persistence

```ts
type Cents = number // integer cents in storage, so sums don't drift

type AssetCategory = 'cash' | 'taxable' | 'retirement' | 'real-estate' | 'vehicle' | 'other-asset'
type LiabilityCategory = 'mortgage' | 'student-loan' | 'auto-loan' | 'credit-card' | 'other-debt'

interface Account {
  id: string
  name: string
  kind: 'asset' | 'liability'
  category: AssetCategory | LiabilityCategory
  balance: Cents            // always ≥ 0; sign comes from `kind`
  invested: boolean
  liquid: boolean
  note?: string
  createdAt: string         // ISO date-time
  updatedAt: string
}

interface NetWorthSnapshot {
  date: string              // YYYY-MM-DD, unique
  assets: Cents
  liabilities: Cents
  invested: Cents
  liquid: Cents
  byCategory: Partial<Record<AssetCategory | LiabilityCategory, Cents>>
  note?: string
}

interface FireInputs {
  currentAge: number
  investedAssets: Cents
  annualContribution: Cents
  contributionGrowthPct: number
  annualSpending: Cents
  realReturnPct: number
  withdrawalRatePct: number
  targetRetirementAge: number
  afterTaxIncome?: Cents
  partTimeIncome?: Cents
  projectionMode: 'full' | 'barista'
}

interface PersonalFinanceData {
  schemaVersion: 1
  accounts: Account[]
  snapshots: NetWorthSnapshot[]
  fire: FireInputs
  isSampleData: boolean
}
```

- **Storage:** one Zustand store with `persist`, under the localStorage key `yangfan:personal-finance`. It's separate from the gateway's settings key.
- **Migrations:** `schemaVersion` + `migrate` allow future changes without data loss.
- **Boundaries:**
  - The store is the only module that touches storage.
  - FIRE calc functions take plain dollar values (converted by `toFireParams`); net worth calc takes cents.
- **Storage unavailable** (private mode, quota, blocked): the app still works for the session and shows a dismissible banner saying data won't be saved.
- **Export/import:** the file format is `{ app: 'yangfan-personal-finance', exportedAt, data: PersonalFinanceData }`.
- **Formatting:** all money is formatted as `en-US` / `USD` via `Intl.NumberFormat`. Large headline figures use a compact form ($1.2M), with the full value in a tooltip/`title`.

## 8. Visual design, UX & accessibility

### Style: the gateway's neubrutalist ink style, in green
Same structure as the gateway:
- 2.5px ink borders
- solid offset shadows (3/4/6px, no blur)
- the halftone dot texture
- the press/lift button interaction
- Archivo Black for display, Space Grotesk for body and Space Mono for labels and numbers

Only the palette changes:

| Token | Role | Hex |
|---|---|---|
| `ink` (redefined in app) | borders, text, shadows; deep green-black | `#14231c` |
| `paper` (redefined in app) | page and card background; mint cream | `#f2f6ec` |
| `pf-green` | primary actions, positive change, accumulation series | `#2e8b57` |
| `pf-pine` | deep panels (gateway's teal role), header bands | `#1d4a38` |
| `pf-lime` | highlight blocks (gateway's mustard role), "NEW"-style accents | `#b9d96a` |
| `pf-gold` | FI-number line, Coast path, secondary series | `#e0b04a` |
| `pf-clay` | liabilities, decreases, destructive actions | `#d4643f` |

These are starting values. The final contrast check (text ≥ 4.5:1, large text and UI ≥ 3:1) happens in M5 and may nudge the hex values.

### UX rules
- **Live calculation:** outputs update as you type, with no Calculate button. Number fields reformat on blur (`40000` becomes `40,000`).
- **Numbers:** figures use tabular numerals (Space Mono) so columns line up.
- **Layout:**
  - At 390px, inputs stack above results and tables scroll horizontally inside their card, not the page.
  - At ≥ 1024px, the FIRE page has inputs on the left and results on the right; the inputs column is sticky.
  - Below 1024px, a summary bar ("FI at 55.7 · $1M target") sticks to the bottom of the screen while the inputs are on screen, and jumps to the results when tapped.
- **Trust cues:** "Stored only in this browser" near data entry, the disclaimer on the hub and FIRE pages, and the assumptions panel one click away.
- **Sound:** uses the shared `lib/audio` cues (click, open/close) and respects the gateway's global SFX toggle. There are no sounds on keystrokes or slider drags.

### Accessibility
- Every input has a visible label. Sliders are paired with number fields. Errors are linked with `aria-describedby` and announced via `aria-live`.
- Each chart has a one-sentence text summary and a "Show table" toggle.
- Color is never the only signal (▲/▼ glyphs, labels and patterns).
- Full keyboard operation; modals use native `<dialog>`.
- Motion respects `prefers-reduced-motion`, and chart animations are disabled under it.

## 9. Technical approach

**Folder layout:**
```
src/apps/personal-finance/
  index.tsx              layout + nested <Routes>, wraps everything in .pf-root
  tools.ts               in-app tool registry
  theme.css              .pf-root token overrides (ink/paper/shadows)
  store.ts               Zustand + persist + migrations + selectors
  sampleData.ts
  lib/calc/              fire.ts, netWorth.ts, money.ts + *.test.ts
  lib/format.ts          USD / percent / compact formatters
  components/            ui/ (Button, Card, Field, MoneyInput, Slider, Modal, StatTile, Badge),
                         charts/ (ProjectionChart, HistoryChart, BreakdownChart), Nav
  pages/                 Hub, NetWorth, Fire, Settings, NotFound
```

**Theming mechanism:**
- Add the `pf-*` colors as Tailwind theme tokens in `src/index.css`.
- `.pf-root` redefines `--color-ink`, `--color-paper` and the `--shadow-pop*` tokens. The existing `ink-border`, `shadow-pop`, `pressable` and `halftone` utilities then turn green inside the app without affecting the gateway.
- The app has its own small `ui/` primitives (green variants) rather than reusing the gateway's vermilion/teal/mustard kit.

**Charts:**
- Recharts, imported only inside this app, so it lands in the app's lazy chunk and the gateway bundle is unchanged.
- Chart colors come from the tokens above.

**Testing:** Vitest (dev dependency) runs the §6 table plus parsing/formatting and store migration tests, via `npm test`.

**Gateway:** one registry entry:
- `slug: 'personal-finance'`
- title "Personal Finance", tagline "Count it. Then plan the exit."
- accent `teal` (the closest gateway color; the app itself is green)
- tags `#money #fire`
- status `wip` → `live` at M5

**Verification each milestone:** build, lint and tests pass, and the change is checked in a browser at desktop width and at 390px (DevTools device emulation, since headless Chrome has a 504px minimum window and doesn't reliably load lazy chunks inside a narrow iframe).

## 10. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Scaffold: deps (Recharts, Vitest), gateway card, nested routing, green theme, nav, hub with empty states, in-app 404 | Card opens `/personal-finance`; all sub-routes render and deep-link; gateway visually unchanged |
| M1 | Calc engine + money parsing/formatting + Vitest | All §6 cases pass |
| M2 | FIRE tool (F1–F12) | Live outputs, chart, ladder, Coast/Barista, grid and edge states verified in browser |
| M3 | Net Worth tool (NW1–NW12) | CRUD, presets, totals, ratios, breakdown, snapshots and history verified; data survives reload |
| M4 | Integration + Settings (ST1–ST5) | *Use my net worth data* works; hub tiles are live; sample data loads and clears; export → wipe → import round-trips |
| M5 | Polish | Contrast check (known: paper text on `pf-green` buttons is 3.87:1, needs ≥ 4.5:1), a11y pass, 390px pass, copy review; card status → `live` |

**Later candidates (v2+):**
- Compound-interest calculator
- Mortgage/loan payoff
- Debt avalanche vs snowball
- Nominal + inflation mode
- Monte Carlo / historical success rates
- Saved and compared FIRE scenarios
- Shareable scenario URLs
- Dark mode (gateway + app together)

## 11. Decisions log

| # | Question | Decision (2026-10-11) |
|---|---|---|
| 1 | v1 scope | Net Worth + FIRE only, built thoroughly |
| 2 | Currency/locale | USD only (`en-US`) |
| 3 | Gateway fit | Finance card on the gateway is fine. The app follows the gateway's style with a green palette |
| 4 | Persistence | Browser only (localStorage); export/import for backup |
| 5 | Visual direction | Gateway style, green color theme (§8) |
| 6 | Charts | Recharts |
| 7 | Tests | Vitest approved |

---

*Not financial advice. This tool performs arithmetic on the assumptions you provide.*
