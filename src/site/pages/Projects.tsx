import { builtApps, plannedApps } from '@/apps/registry'
import { Card } from '@/components/ui'
import { ProjectCard } from '../components/ProjectCard'
import { SectionHeading } from '../components/SectionHeading'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function Projects() {
  useDocumentTitle('Projects')
  return (
    <>
      <SectionHeading level={1} note={`${builtApps.length} built`}>
        Projects
      </SectionHeading>
      <p className="mb-8 max-w-prose text-base sm:text-lg">
        Things I&apos;ve built that you can use right here in the browser. Each one will get a write-up on how it was made.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {builtApps.map((app) => (
          <ProjectCard key={app.slug} app={app} headingLevel={2} />
        ))}
      </div>

      <section className="mt-16" aria-labelledby="workbench">
        <SectionHeading note={`${plannedApps.length} ideas`}>
          <span id="workbench">On the workbench</span>
        </SectionHeading>
        <Card className="p-5">
          <ul className="divide-y-2 divide-dashed divide-ink/30">
            {plannedApps.map((app) => (
              <li key={app.slug} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="font-display uppercase">{app.title}</span>
                <span className="text-sm text-ink/75">{app.description}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  )
}
