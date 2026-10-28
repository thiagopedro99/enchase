import type { HTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children' | 'aria-label'> {
  value?: number | undefined
  defaultValue?: number | undefined
  onValueChange?: ((value: number) => void) | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  label?: string | undefined
  ariaLabel?: string | undefined
  formatValue?: ((value: number) => string) | undefined
  showValue?: boolean | undefined
  name?: string | undefined
  disabled?: boolean | undefined
  animation?: MotionOverride | undefined
}
