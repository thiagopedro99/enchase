import type { MotionOverride } from '@motion/types.ts'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  fullWidth?: boolean | undefined
  iconOnly?: boolean | undefined
  animation?: MotionOverride | undefined
}

export type ButtonStyleProps = Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'iconOnly'>
