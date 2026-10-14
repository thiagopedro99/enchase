import type { CSSProperties, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  passwordToggle?: boolean
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
