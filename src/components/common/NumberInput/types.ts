import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { NumberFormatOptions } from '@utils/numberFormat.ts'

export type NumberInputFormat = NumberFormatOptions

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  largeStep?: number
  formatOptions?: NumberInputFormat
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  steppers?: boolean
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
