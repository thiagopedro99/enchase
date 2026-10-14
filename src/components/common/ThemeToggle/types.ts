import type { ButtonHTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  animation?: MotionOverride
}
