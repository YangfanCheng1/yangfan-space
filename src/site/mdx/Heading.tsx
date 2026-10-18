import type { ComponentProps, ReactNode } from 'react'

/** Section headings link to themselves (ids come from rehype-slug at build time). */
function Inner({ id, children }: { id?: string; children: ReactNode }) {
  return id ? (
    <a href={`#${id}`} className="heading-anchor">
      {children}
    </a>
  ) : (
    children
  )
}

export function H2({ id, children, ...rest }: ComponentProps<'h2'>) {
  return (
    <h2 id={id} {...rest}>
      <Inner id={id}>{children}</Inner>
    </h2>
  )
}

export function H3({ id, children, ...rest }: ComponentProps<'h3'>) {
  return (
    <h3 id={id} {...rest}>
      <Inner id={id}>{children}</Inner>
    </h3>
  )
}

export function H4({ id, children, ...rest }: ComponentProps<'h4'>) {
  return (
    <h4 id={id} {...rest}>
      <Inner id={id}>{children}</Inner>
    </h4>
  )
}
