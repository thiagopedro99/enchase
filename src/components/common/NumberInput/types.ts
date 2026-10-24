import type { LabelPlacement } from '@styles/tokens/types.ts'
import type { CSSProperties, InputHTMLAttributes } from 'react'
import type { NumberFormatOptions } from '@utils/numberFormat.ts'

export type NumberInputFormat = NumberFormatOptions

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  value?: number | null | undefined
  defaultValue?: number | null | undefined
  onValueChange?: ((value: number | null) => void) | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  largeStep?: number | undefined
  formatOptions?: NumberInputFormat | undefined
  label?: string | undefined
  labelPlacement?: LabelPlacement | undefined
  error?: string | undefined
  helperText?: string | undefined
  fullWidth?: boolean | undefined
  steppers?: boolean | undefined
  wrapperClassName?: string | undefined
  wrapperStyle?: CSSProperties | undefined
}
