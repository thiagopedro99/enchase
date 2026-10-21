import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  labelPlacement?: LabelPlacement
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
