import { createContext, useContext } from 'react'
import type { MDXContent } from 'mdx/types'
import { getPost, loadPostBody } from '@/content/posts'
import { getProject, loadProjectBody } from '@/content/projects'

/**
 * MDX bodies are lazy chunks. Pre-rendering needs the body *during* render,
 * and the browser must have the same body before hydrating, or React would
 * see an empty article where the HTML has text. So both sides load the body
 * for the current URL first and pass it down through this context.
 */
export type Preloaded = Map<string, MDXContent>

export const PreloadContext = createContext<Preloaded>(new Map())

export const postKey = (slug: string) => `post:${slug}`
export const projectKey = (slug: string) => `project:${slug}`

export function usePreloaded(key: string): MDXContent | undefined {
  return useContext(PreloadContext).get(key)
}

/** Load whatever MDX body the page at `pathname` renders (none for most pages). */
export async function preloadForPath(pathname: string): Promise<Preloaded> {
  const map: Preloaded = new Map()
  const post = /^\/blog\/([^/]+)\/?$/.exec(pathname)?.[1]
  if (post && getPost(post)) map.set(postKey(post), await loadPostBody(post))
  const project = /^\/projects\/([^/]+)\/?$/.exec(pathname)?.[1]
  if (project && getProject(project)) map.set(projectKey(project), await loadProjectBody(project))
  return map
}
