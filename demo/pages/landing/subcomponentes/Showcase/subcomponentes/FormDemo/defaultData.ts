import type { SelectOption } from 'enchase'

export const plans: SelectOption[] = [
  { value: 'solo', label: 'Individual' },
  { value: 'team', label: 'Equipe' },
  { value: 'company', label: 'Empresa' }
]

export const defaultPlan = 'team'

export const seats = { min: 1, max: 50, initial: 8 }
