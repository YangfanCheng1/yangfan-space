import type { MDXContent } from 'mdx/types'
import { sortProjects } from './schema'
import type { ProjectMeta } from './schema'

/**
 * Projects from src/content/projects/*.mdx (spec §5.2). Metadata is eager,
 * each case study body is a separate lazy chunk — same pattern as posts.
 */
const metaByPath = import.meta.glob<ProjectMeta>('./projects/*.mdx', { query: '?meta', eager: true, import: 'frontmatter' })
const bodyByPath = import.meta.glob<{ default: MDXContent }>('./projects/*.mdx')

const pathBySlug = new Map<string, string>()
for (const [path, meta] of Object.entries(metaByPath)) {
  const clash = pathBySlug.get(meta.slug)
  if (clash) throw new Error(`Two projects share the slug "${meta.slug}": ${clash} and ${path}`)
  pathBySlug.set(meta.slug, path)
}

const all = sortProjects(Object.values(metaByPath))

/** Built projects (live or in progress), in display order. */
export const projects: ProjectMeta[] = all.filter((p) => p.status !== 'planned')
/** Ideas "on the workbench": listed, not linked, no case study. */
export const plannedProjects: ProjectMeta[] = all.filter((p) => p.status === 'planned')
/** Home page picks. */
export const featuredProjects: ProjectMeta[] = projects.filter((p) => p.featured)

/** A project with a case study page (planned ones have none). */
export function getProject(slug: string): ProjectMeta | undefined {
  return projects.find((p) => p.slug === slug)
}

export async function loadProjectBody(slug: string): Promise<MDXContent> {
  const path = pathBySlug.get(slug)
  if (!path || !getProject(slug)) throw new Error(`No project "${slug}"`)
  return (await bodyByPath[path]()).default
}
