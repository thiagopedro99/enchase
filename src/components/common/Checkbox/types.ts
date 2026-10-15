import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
  animation?: MotionOverride
}
