import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean | undefined
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  options: SelectOption[]
  placeholder?: string | undefined
  fullWidth?: boolean | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
}
