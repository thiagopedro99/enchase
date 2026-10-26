import type { SelectOption } from 'enchase'

export const defaultFullWidth = false

export const countryOptions: SelectOption[] = [
  { value: 'br', label: 'Brazil' },
  { value: 'pt', label: 'Portugal' },
  { value: 'ar', label: 'Argentina' },
  { value: 'cl', label: 'Chile', disabled: true },
  { value: 'uy', label: 'Uruguay' }
]
