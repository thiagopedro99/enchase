import type { ButtonHTMLAttributes } from 'react'

export interface DatePickerToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  disabled?: boolean | undefined
}
