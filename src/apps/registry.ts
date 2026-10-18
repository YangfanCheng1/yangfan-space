import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * Apps that have their own route at /<slug> and their own look. Each is
 * code-split, so its code (and styles) only load when visited.
 *
 * To add an app: create src/apps/<slug>/index.tsx (default export) and list it
 * here. Its portfolio card and case study live in src/content/projects/<slug>.mdx.
 */
export interface AppEntry {
  slug: string
  title: string
  component: LazyExoticComponent<ComponentType>
}

export const apps: AppEntry[] = [
  {
    slug: 'personal-finance',
    title: 'Personal Finance',
    component: lazy(() => import('./personal-finance')),
  },
]
