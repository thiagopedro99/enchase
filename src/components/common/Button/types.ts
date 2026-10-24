import type { MotionOverride } from '@motion/types.ts'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined
  size?: ButtonSize | undefined
  fullWidth?: boolean | undefined
  animation?: MotionOverride | undefined
}

export type ButtonStyleProps = Pick<ButtonProps, 'variant' | 'size' | 'fullWidth'>
