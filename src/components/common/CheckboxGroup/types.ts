import type { FieldsetHTMLAttributes } from 'react'
import type { MotionOverride } from '@motion/types.ts'

export interface CheckboxGroupOption {
  value: string
  label: string
  disabled?: boolean | undefined
}

export interface CheckboxGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'name' | 'role'> {
  options: CheckboxGroupOption[]
  label?: string | undefined
  name?: string | undefined
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onValueChange?: ((value: string[]) => void) | undefined
  error?: string | undefined
  helperText?: string | undefined
  orientation?: 'vertical' | 'horizontal' | undefined
  animation?: MotionOverride | undefined
}
