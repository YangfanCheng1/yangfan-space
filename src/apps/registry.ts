import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Every app/project on the site. To add a built app:
 *   1. create src/apps/<slug>/index.tsx with a default-exported component
 *   2. add an entry here with `component` — it gets its own route at /<slug>.
 * Entries without a component are future projects ("On the workbench").
 * Each app is code-split, so its code (and styles) only load when visited.
 */
export interface AppEntry {
  slug: string
  title: string
  tagline: string
  description: string
  status: 'live' | 'wip' | 'planned'
  /** Card color on the site; doesn't affect the app's own theme. */
  accent: 'vermilion' | 'teal' | 'mustard'
  tags: string[]
  component?: LazyExoticComponent<ComponentType>
}

export const apps: AppEntry[] = [
  {
    slug: 'personal-finance',
    title: 'Personal Finance',
    tagline: 'Count it. Then plan the exit.',
    description: 'Net worth tracker and FIRE projection. Private, in-browser, USD.',
    status: 'live',
    accent: 'teal',
    tags: ['money', 'fire'],
    component: lazy(() => import('./personal-finance')),
  },
  {
    slug: 'reader',
    title: 'Comic Reader',
    tagline: 'Read it panel by panel.',
    description: 'Paginated reader with panel zoom, creator commentary and keyboard navigation.',
    status: 'planned',
    accent: 'vermilion',
    tags: ['reader', 'keyboard'],
  },
  {
    slug: 'avatar-builder',
    title: 'Avatar Builder',
    tagline: 'Draw yourself into the strip.',
    description: 'Layered SVG character generator with color controls and PNG export.',
    status: 'planned',
    accent: 'teal',
    tags: ['svg', 'canvas'],
  },
  {
    slug: 'gallery',
    title: 'Ink Gallery',
    tagline: 'Sketches, covers, outtakes.',
    description: 'Filterable artwork grid with a lightbox for close inspection.',
    status: 'planned',
    accent: 'mustard',
    tags: ['art', 'lightbox'],
  },
]

export const builtApps = apps.filter((a) => a.component && a.status !== 'planned')
export const plannedApps = apps.filter((a) => a.status === 'planned')
