import type { CSSProperties, InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}
