import type { SelectOption } from '@components/common/Select/types.ts'

export const countryOptions: SelectOption[] = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' },
  { value: 'ar', label: 'Argentina' },
  { value: 'cl', label: 'Chile', disabled: true },
  { value: 'uy', label: 'Uruguai' }
]
