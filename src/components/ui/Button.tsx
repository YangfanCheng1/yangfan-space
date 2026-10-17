import type { ButtonHTMLAttributes } from 'react'
import { sfx } from '@/lib/audio'
import { buttonClasses } from './buttonClasses'
import type { ButtonSize, ButtonVariant } from './buttonClasses'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Play the click cue. Defaults to true. */
  sound?: boolean
}

export function Button({ variant = 'primary', size = 'md', sound = true, className, onClick, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      onClick={(e) => {
        if (sound) sfx.click()
        onClick?.(e)
      }}
      {...rest}
    />
  )
}
