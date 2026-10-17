import type { ComponentProps } from 'react'

/** Code blocks scroll sideways on phones, so keyboard users must be able to focus them (WCAG 2.1.1). */
export function Pre(props: ComponentProps<'pre'>) {
  return <pre tabIndex={0} {...props} />
}
