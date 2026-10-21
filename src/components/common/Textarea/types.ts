import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, TextareaHTMLAttributes } from 'react'

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  labelPlacement?: LabelPlacement
  error?: string
  helperText?: string
  fullWidth?: boolean
  resize?: TextareaResize
  rows?: number
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
