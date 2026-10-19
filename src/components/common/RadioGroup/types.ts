import type { FieldsetHTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface RadioGroupOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'name' | 'role'> {
  options: RadioGroupOption[]
  label?: string
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  required?: boolean
  error?: string
  helperText?: string
  orientation?: 'vertical' | 'horizontal'
  animation?: MotionOverride
}
