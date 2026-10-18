import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui'
import { filterByTag, tagCounts } from '@/content/postUtils'
import { plannedProjects, projects } from '@/content/projects'
import { ProjectCard } from '../components/ProjectCard'
import { SectionHeading } from '../components/SectionHeading'
import { TagFilter } from '../components/TagFilter'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

/** /projects (spec PR1–PR2), with a ?tag= filter, plus the "On the workbench" list. */
export function Projects() {
  const [params] = useSearchParams()
  const tag = params.get('tag')
  const shown = filterByTag(projects, tag)
  useDocumentTitle(tag ? `Projects tagged #${tag}` : 'Projects')

  return (
    <>
      <SectionHeading level={1} note={`${projects.length} built`}>
        Projects
      </SectionHeading>
      <p className="mb-6 max-w-prose text-base sm:text-lg">
        Things I&apos;ve built that you can use right here in the browser, each with the story of how it was made.
      </p>
      <TagFilter basePath="/projects" tags={tagCounts(projects)} active={tag} />

      {shown.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectCard key={p.slug} project={p} headingLevel={2} />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <p className="font-display text-xl uppercase">No projects tagged #{tag}</p>
          <Link to="/projects" className="mt-2 inline-block font-mono text-xs font-bold uppercase underline underline-offset-4">
            Show all projects
          </Link>
        </Card>
      )}

      {plannedProjects.length > 0 && (
        <section className="mt-16" aria-labelledby="workbench">
          <SectionHeading note={`${plannedProjects.length} ideas`}>
            <span id="workbench">On the workbench</span>
          </SectionHeading>
          <Card className="p-5">
            <ul className="divide-y-2 divide-dashed divide-ink/30">
              {plannedProjects.map((p) => (
                <li key={p.slug} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="font-display uppercase">{p.title}</span>
                  <span className="text-sm text-ink/75">{p.summary}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </>
  )
}
