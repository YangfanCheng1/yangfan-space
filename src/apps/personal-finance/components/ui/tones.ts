export type Tone = 'paper' | 'green' | 'pine' | 'lime' | 'gold' | 'clay' | 'ink'

export const toneClasses: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  green: 'bg-pf-green text-paper',
  pine: 'bg-pf-pine text-paper',
  lime: 'bg-pf-lime text-ink',
  gold: 'bg-pf-gold text-ink',
  clay: 'bg-pf-clay text-paper',
  ink: 'bg-ink text-paper',
}
