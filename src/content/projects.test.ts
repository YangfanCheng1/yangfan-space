import { describe, expect, it } from 'vitest'
import { featuredProjects, getProject, loadProjectBody, plannedProjects, projects } from './projects'

// Runs the real content through the real Vite pipeline (mdxMeta + MDX plugins).
describe('content/projects', () => {
  it('splits built and planned projects', () => {
    expect(projects.map((p) => p.slug)).toContain('personal-finance')
    expect(projects.every((p) => p.status !== 'planned')).toBe(true)
    expect(plannedProjects.map((p) => p.slug).sort()).toEqual(['avatar-builder', 'comic-reader', 'ink-gallery'])
  })

  it('Personal Finance is live, featured and points at its app route', () => {
    expect(getProject('personal-finance')).toMatchObject({ status: 'live', live: '/personal-finance', featured: true })
    expect(featuredProjects[0].slug).toBe('personal-finance')
  })

  it('planned projects have no case study page', async () => {
    expect(getProject('comic-reader')).toBeUndefined()
    await expect(loadProjectBody('comic-reader')).rejects.toThrow(/No project/)
  })

  it('case study bodies load', async () => {
    for (const p of projects) expect(typeof (await loadProjectBody(p.slug))).toBe('function')
  })

  it('slugs are unique across all projects', () => {
    const all = [...projects, ...plannedProjects].map((p) => p.slug)
    expect(new Set(all).size).toBe(all.length)
  })
})
