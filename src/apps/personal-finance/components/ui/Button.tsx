import type { ButtonHTMLAttributes } from 'react'
import { sfx } from '@/lib/audio'
import { buttonClasses } from './buttonClasses'
import type { ButtonSize, ButtonVariant } from './buttonClasses'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Play the click cue (respects the global SFX toggle). Defaults to true. */
  sound?: boolean
}

/** Green-palette twin of the gateway Button. */
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
