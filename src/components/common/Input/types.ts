import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelPlacement?: LabelPlacement
  error?: string
  helperText?: string
  fullWidth?: boolean
  passwordToggle?: boolean
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
