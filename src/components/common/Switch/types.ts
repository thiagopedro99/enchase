import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label?: string | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
  animation?: MotionOverride | undefined
}
