/**
 * Tools inside the Personal Finance app. Drives the hub cards, the nav and
 * the nested routes (see index.tsx). Add a future calculator here.
 */
export const BASE = '/personal-finance'

export interface ToolEntry {
  slug: string
  title: string
  /** Short label for the nav. */
  navLabel: string
  tagline: string
  description: string
  status: 'live' | 'wip' | 'planned'
  accent: 'green' | 'pine' | 'lime'
}

export const tools: ToolEntry[] = [
  {
    slug: 'net-worth',
    title: 'Net Worth',
    navLabel: 'Net Worth',
    tagline: 'Where you stand, today.',
    description: 'Everything you own minus everything you owe, by category, with snapshots to track the trend.',
    status: 'live',
    accent: 'green',
  },
  {
    slug: 'fire',
    title: 'FIRE Projection',
    navLabel: 'FIRE',
    tagline: 'When work becomes optional.',
    description: 'Your FI number, years to get there, Coast and Barista FIRE, and whether the money lasts.',
    status: 'live',
    accent: 'pine',
  },
]

export const toolPath = (slug: string) => `${BASE}/${slug}`
