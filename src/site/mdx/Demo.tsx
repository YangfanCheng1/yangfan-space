import { lazy, Suspense } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

/**
 * <Demo name="fire-projection" /> — embeds a live piece of an app inside a post.
 * Each demo is its own lazy chunk, so a post only downloads what it embeds.
 */
const demos: Record<string, { title: string; component: LazyExoticComponent<ComponentType> }> = {
  'fire-projection': {
    title: 'FIRE projection from Personal Finance',
    component: lazy(() => import('./demos/FireProjectionDemo')),
  },
}

export function Demo({ name }: { name: string }) {
  const demo = demos[name]
  if (!demo) {
    if (import.meta.env.DEV) return <p className="font-mono text-sm text-vermilion">Unknown demo “{name}”. Known: {Object.keys(demos).join(', ')}</p>
    return null
  }
  const C = demo.component
  return (
    <figure className="not-prose my-8" aria-label={`Live demo: ${demo.title}`}>
      <Suspense fallback={<div className="ink-border grid h-80 place-items-center bg-paper font-mono text-xs uppercase">Loading demo…</div>}>
        <C />
      </Suspense>
      <figcaption className="mt-3 text-center font-mono text-xs text-ink/75">Live demo · {demo.title}</figcaption>
    </figure>
  )
}
