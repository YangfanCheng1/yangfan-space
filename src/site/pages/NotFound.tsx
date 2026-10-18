import { Link, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui'
import { usePageMeta } from '../seo/usePageMeta'

export function NotFound() {
  const { pathname } = useLocation()
  usePageMeta({ title: 'Not found', description: 'This page does not exist.', path: pathname, noindex: true })
  return (
    <Card className="mx-auto mt-8 max-w-lg p-8 text-center">
      <p aria-hidden className="font-display text-7xl">
        404
      </p>
      <h1 className="mt-2 font-mono uppercase">Page not found</h1>
      <p className="mt-2 text-sm text-ink/75">It may have moved while this site was being rebuilt.</p>
      <Link to="/" className="mt-6 inline-block font-mono font-bold underline underline-offset-4">
        ← Back home
      </Link>
    </Card>
  )
}
