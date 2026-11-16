import type { SegmentedControlItem, SelectOption } from 'enchase'

export const visibilityOptions: SelectOption[] = [
  { value: 'private', label: 'Só eu' },
  { value: 'team', label: 'Minha equipe' },
  { value: 'public', label: 'Toda a empresa' }
]

export const defaultVisibility = 'team'

export const defaultProjectName = 'Atlas'

export const periods: SegmentedControlItem[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' }
]

export const defaultPeriod = 'week'

export const team = ['Ana Ribeiro', 'Caio Lima', 'Bia Santos', 'Davi Moura']

export const topics = ['design system', 'acessibilidade', 'tema']

export const rollout = 72
