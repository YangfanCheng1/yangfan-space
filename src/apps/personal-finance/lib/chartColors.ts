/**
 * Chart colors. Validated with the dataviz palette checker against the
 * paper surface (#f2f6ec) — re-run it if any of these change.
 *
 * - Series (categorical, fixed order): portfolio green, then coast gold.
 *   CVD ΔE 8.3 / normal ΔE 19.9 → PASS. Gold is 2.7:1 vs surface (WARN), so it
 *   is always dashed + direct-labeled and every chart has a table view.
 * - Sensitivity ramp (ordinal, slowest → fastest): one hue, light → dark, PASS.
 *   Cell text: ink on steps 0–1, paper on steps 2–4 (all ≥ 4.5:1).
 */
export const CHART = {
  surface: '#f2f6ec',
  ink: '#14231c',
  muted: '#4a5a51',
  grid: '#d6dfcc',
  axis: '#b9c5ad',
  portfolio: '#2e8b57',
  coast: '#c98a1c',
} as const

export const SPEED_RAMP = ['#7fba8e', '#5ea474', '#367a4e', '#245f3b', '#163f27'] as const
export const SPEED_RAMP_TEXT = ['ink', 'ink', 'paper', 'paper', 'paper'] as const

export const CHART_FONT = '"Space Mono", ui-monospace, monospace'
