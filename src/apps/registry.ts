import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Every app listed on the gateway. To add an app:
 *   1. create src/apps/<slug>/index.tsx with a default-exported component
 *   2. add an entry here — the route and the gateway card come for free.
 * Each app is code-split, so its code (and styles) only load when visited.
 */
export interface AppEntry {
  slug: string
  title: string
  tagline: string
  description: string
  status: 'live' | 'wip' | 'planned'
  /** Gateway card color; doesn't affect the app's own theme. */
  accent: 'vermilion' | 'teal' | 'mustard'
  tags: string[]
  component?: LazyExoticComponent<ComponentType>
}

export const apps: AppEntry[] = [
  {
    slug: 'reader',
    title: 'Comic Reader',
    tagline: 'Read it panel by panel.',
    description: 'Paginated reader with panel zoom, creator commentary and keyboard navigation.',
    status: 'wip',
    accent: 'vermilion',
    tags: ['reader', 'keyboard'],
    component: lazy(() => import('./reader')),
  },
  {
    slug: 'avatar-builder',
    title: 'Avatar Builder',
    tagline: 'Draw yourself into the strip.',
    description: 'Layered SVG character generator with color controls and PNG export.',
    status: 'wip',
    accent: 'teal',
    tags: ['svg', 'canvas'],
    component: lazy(() => import('./avatar-builder')),
  },
  {
    slug: 'gallery',
    title: 'Ink Gallery',
    tagline: 'Sketches, covers, outtakes.',
    description: 'Filterable artwork grid with a lightbox for close inspection.',
    status: 'wip',
    accent: 'mustard',
    tags: ['art', 'lightbox'],
    component: lazy(() => import('./gallery')),
  },
  {
    slug: 'personal-finance',
    title: 'Personal Finance',
    tagline: 'Count it. Then plan the exit.',
    description: 'Net worth tracker and FIRE projection. Private, in-browser, USD.',
    status: 'wip',
    accent: 'teal',
    tags: ['money', 'fire'],
    component: lazy(() => import('./personal-finance')),
  },
]
