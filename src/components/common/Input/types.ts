import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  fullWidth?: boolean | undefined
  passwordToggle?: boolean | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
}
