import { Card } from '@/components/ui'
import { SectionHeading } from '../components/SectionHeading'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function Blog() {
  useDocumentTitle('Blog')
  return (
    <>
      <SectionHeading level={1}>Blog</SectionHeading>
      <p className="mb-8 max-w-prose text-base sm:text-lg">Notes on building things: what worked, what didn&apos;t, and what I&apos;d change.</p>
      <Card className="p-6">
        <p className="font-display text-xl uppercase">No posts yet</p>
        <p className="mt-2 text-sm text-ink/75">The first one is on its way.</p>
      </Card>
    </>
  )
}
