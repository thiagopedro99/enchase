import type { CSSProperties, TextareaHTMLAttributes } from 'react'

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  resize?: TextareaResize
  rows?: number
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
