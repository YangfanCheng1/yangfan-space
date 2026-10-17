import type { MDXComponents } from 'mdx/types'
import { Callout } from './Callout'
import { Demo } from './Demo'
import { Figure } from './Figure'
import { Pre } from './Pre'

/** Components available inside every post without importing them. */
export const mdxComponents: MDXComponents = {
  Callout,
  Demo,
  Figure,
  pre: Pre,
}
