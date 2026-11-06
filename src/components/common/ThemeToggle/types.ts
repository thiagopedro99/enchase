import type { ButtonHTMLAttributes, Ref } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface ThemeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  animation?: MotionOverride | undefined
  ref?: Ref<HTMLButtonElement> | undefined
}
