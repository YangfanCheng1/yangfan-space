import type { MDXComponents } from 'mdx/types'
import { Placeholder } from '../components/Placeholder'
import { Callout } from './Callout'
import { Demo } from './Demo'
import { Figure } from './Figure'
import { H2, H3, H4 } from './Heading'
import { Pre } from './Pre'

/** Components available inside every post without importing them. */
export const mdxComponents: MDXComponents = {
  Callout,
  Demo,
  Figure,
  h2: H2,
  h3: H3,
  h4: H4,
  Placeholder,
  pre: Pre,
}
