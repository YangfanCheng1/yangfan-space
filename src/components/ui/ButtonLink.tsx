import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import { sfx } from '@/lib/audio'
import { buttonClasses } from './buttonClasses'
import type { ButtonSize, ButtonVariant } from './buttonClasses'

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** A router link that looks like a Button (real link: middle-click, new tab, screen readers). */
export function ButtonLink({ variant, size, className, onClick, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(variant, size, className)}
      onClick={(e) => {
        sfx.click()
        onClick?.(e)
      }}
      {...rest}
    />
  )
}
