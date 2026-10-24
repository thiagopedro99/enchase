import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, TextareaHTMLAttributes } from 'react'

export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  fullWidth?: boolean | undefined
  resize?: TextareaResize | undefined
  rows?: number | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
}
