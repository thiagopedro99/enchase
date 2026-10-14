import type { MotionOverride } from '@motion/types.ts'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  animation?: MotionOverride
}

export type ButtonStyleProps = Pick<ButtonProps, 'variant' | 'size' | 'fullWidth'>
